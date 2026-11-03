import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AstroPopDatabaseConfigurationError,
  getAstroPopDatabaseHealth,
  getAstroPopOrderByIdForUser,
  getAstroPopOrdersByUser,
  isAstroPopOrderRecorded,
  persistAstroPopOrder,
} from "../server/utils/astroPopDatabase";

const neonMock = vi.hoisted(() => vi.fn());

vi.mock("@neondatabase/serverless", () => ({
  neon: neonMock,
}));

describe("Astro Pop database health", () => {
  beforeEach(() => {
    neonMock.mockReset();
    vi.unstubAllEnvs();
  });

  it("returns ok after a successful read-only connection query", async () => {
    const sql = vi.fn().mockResolvedValue([{ connected: 1 }]);
    neonMock.mockReturnValue(sql);
    vi.stubEnv("ASTROPOP_POOLED_URL", "postgresql://test.example/astro_pop");

    await expect(getAstroPopDatabaseHealth()).resolves.toEqual({ status: "ok" });
    expect(neonMock).toHaveBeenCalledWith("postgresql://test.example/astro_pop");
    expect(sql).toHaveBeenCalledOnce();
    expect(sql.mock.calls[0]?.[0].raw).toEqual(["SELECT 1 AS connected"]);
  });

  it("fails without a configured pooled connection string", async () => {
    vi.stubEnv("ASTROPOP_POOLED_URL", "");

    await expect(getAstroPopDatabaseHealth()).rejects.toBeInstanceOf(
      AstroPopDatabaseConfigurationError,
    );
    expect(neonMock).not.toHaveBeenCalled();
  });

  it("propagates database failures for the endpoint to sanitize", async () => {
    const databaseError = new Error("connection refused");
    neonMock.mockReturnValue(vi.fn().mockRejectedValue(databaseError));
    vi.stubEnv("ASTROPOP_POOLED_URL", "postgresql://test.example/astro_pop");

    await expect(getAstroPopDatabaseHealth()).rejects.toBe(databaseError);
  });

  it("persists an order and all of its flavors in one atomic statement", async () => {
    const sql = vi.fn().mockResolvedValue([{ id: "order-123" }]);
    neonMock.mockReturnValue(sql);

    await expect(
      persistAstroPopOrder(
        {
          clerkUserId: null,
          stripeCheckoutSessionId: "cs_test_multiple_flavors",
          stripePaymentIntentId: "pi_test_123",
          customerEmail: "traveler@example.com",
          totalCents: 900,
          currency: "usd",
          items: [
            {
              flavorId: "atomic-cherry-fizz",
              flavorName: "Atomic Cherry Fizz",
              quantity: 2,
              unitPriceCents: 300,
            },
            {
              flavorId: "lunar-lime-lift",
              flavorName: "Lunar Lime Lift",
              quantity: 1,
              unitPriceCents: 300,
            },
          ],
        },
        "postgresql://test.example/astro_pop",
      ),
    ).resolves.toEqual({ persisted: true });

    expect(sql).toHaveBeenCalledOnce();
    expect(sql.mock.calls[0]?.[0].raw.join(" ")).toContain("WITH inserted_order AS");
    expect(sql.mock.calls[0]?.[0].raw.join(" ")).toContain("INSERT INTO public.order_items");
    expect(sql.mock.calls[0]?.[0].raw.join(" ")).toContain(
      "ON CONFLICT (stripe_checkout_session_id) DO NOTHING",
    );
    expect(sql.mock.calls[0]?.slice(1)).toContain(null);
    expect(sql.mock.calls[0]?.[0].raw.join(" ")).toContain("jsonb_to_recordset(");
    expect(sql.mock.calls[0]?.slice(1)).toContain(
      JSON.stringify([
        {
          flavor_id: "atomic-cherry-fizz",
          flavor_name: "Atomic Cherry Fizz",
          quantity: 2,
          unit_price_cents: 300,
        },
        {
          flavor_id: "lunar-lime-lift",
          flavor_name: "Lunar Lime Lift",
          quantity: 1,
          unit_price_cents: 300,
        },
      ]),
    );
  });

  it("treats a replayed Checkout Session as an idempotent no-op", async () => {
    const sql = vi.fn().mockResolvedValue([]);
    neonMock.mockReturnValue(sql);

    await expect(
      persistAstroPopOrder(
        {
          clerkUserId: null,
          stripeCheckoutSessionId: "cs_test_duplicate",
          stripePaymentIntentId: null,
          customerEmail: "traveler@example.com",
          totalCents: 300,
          currency: "usd",
          items: [
            {
              flavorId: "atomic-cherry-fizz",
              flavorName: "Atomic Cherry Fizz",
              quantity: 1,
              unitPriceCents: 300,
            },
          ],
        },
        "postgresql://test.example/astro_pop",
      ),
    ).resolves.toEqual({ persisted: false });
  });

  it("propagates write failures so Stripe delivery can be retried", async () => {
    const databaseError = new Error("connection refused");
    neonMock.mockReturnValue(vi.fn().mockRejectedValue(databaseError));

    await expect(
      persistAstroPopOrder(
        {
          clerkUserId: null,
          stripeCheckoutSessionId: "cs_test_database_failure",
          stripePaymentIntentId: null,
          customerEmail: "traveler@example.com",
          totalCents: 300,
          currency: "usd",
          items: [
            {
              flavorId: "atomic-cherry-fizz",
              flavorName: "Atomic Cherry Fizz",
              quantity: 1,
              unitPriceCents: 300,
            },
          ],
        },
        "postgresql://test.example/astro_pop",
      ),
    ).rejects.toBe(databaseError);
  });

  it("returns a bounded, ownership-filtered order history with items", async () => {
    const sql = vi.fn().mockResolvedValue([
      {
        id: "order-1",
        created_at: "2026-11-01T15:00:00Z",
        total_cents: 357,
        currency: "usd",
        status: "PLACED",
        payment_status: "PAID",
        items: [
          {
            flavorId: "atomic-cherry-fizz",
            flavorName: "Atomic Cherry Fizz",
            quantity: 3,
            unitPriceCents: 119,
          },
        ],
      },
    ]);
    neonMock.mockReturnValue(sql);

    await expect(
      getAstroPopOrdersByUser("user_test_123", "postgresql://test.example/astro_pop"),
    ).resolves.toMatchObject([{ id: "order-1", totalCents: 357, items: [{ quantity: 3 }] }]);
    const query = sql.mock.calls[0]?.[0].raw.join(" ");
    expect(query).toContain("clerk_user_id =");
    expect(query).toContain("INTERVAL '30 days'");
    expect(query).toContain("LIMIT 20");
    expect(query).toContain("ORDER BY o.created_at DESC, o.id DESC");
    expect(sql.mock.calls[0]?.slice(1)).toContain("user_test_123");
  });

  it("returns an empty list when the authenticated user has no recent orders", async () => {
    neonMock.mockReturnValue(vi.fn().mockResolvedValue([]));
    await expect(
      getAstroPopOrdersByUser("user_other", "postgresql://test.example/astro_pop"),
    ).resolves.toEqual([]);
  });

  it("returns one order with historical line-item prices only when its owner matches", async () => {
    const sql = vi.fn().mockResolvedValue([
      {
        id: "f1c2d3e4-5a6b-4c7d-8e9f-0123456789ab",
        created_at: "2026-11-01T15:00:00Z",
        total_cents: 357,
        currency: "usd",
        status: "PLACED",
        payment_status: "PAID",
        items: [
          {
            flavorId: "atomic-cherry-fizz",
            flavorName: "Atomic Cherry Fizz",
            quantity: 3,
            unitPriceCents: 119,
          },
        ],
      },
    ]);
    neonMock.mockReturnValue(sql);

    await expect(
      getAstroPopOrderByIdForUser(
        "f1c2d3e4-5a6b-4c7d-8e9f-0123456789ab",
        "user_owner",
        "postgresql://test.example/astro_pop",
      ),
    ).resolves.toMatchObject({ totalCents: 357, items: [{ quantity: 3, unitPriceCents: 119 }] });

    const query = sql.mock.calls[0]?.[0].raw.join(" ");
    expect(query).toContain("WHERE o.id =");
    expect(query).toContain("AND o.clerk_user_id =");
    expect(sql.mock.calls[0]?.slice(1)).toEqual(
      expect.arrayContaining(["f1c2d3e4-5a6b-4c7d-8e9f-0123456789ab", "user_owner"]),
    );
  });

  it("returns null when no order matches the ID and authenticated owner", async () => {
    neonMock.mockReturnValue(vi.fn().mockResolvedValue([]));
    await expect(
      getAstroPopOrderByIdForUser(
        "f1c2d3e4-5a6b-4c7d-8e9f-0123456789ab",
        "user_other",
        "postgresql://test.example/astro_pop",
      ),
    ).resolves.toBeNull();
  });

  it("returns true when the Checkout Session has a persisted order", async () => {
    const sql = vi.fn().mockResolvedValue([{ recorded: true }]);
    neonMock.mockReturnValue(sql);

    await expect(
      isAstroPopOrderRecorded("cs_test_recorded", "postgresql://test.example/astro_pop"),
    ).resolves.toBe(true);

    expect(sql).toHaveBeenCalledOnce();
    expect(sql.mock.calls[0]?.[0].raw.join(" ")).toContain("SELECT EXISTS");
  });

  it("returns false when the Checkout Session has no persisted order", async () => {
    neonMock.mockReturnValue(vi.fn().mockResolvedValue([{ recorded: false }]));

    await expect(
      isAstroPopOrderRecorded("cs_test_not_recorded", "postgresql://test.example/astro_pop"),
    ).resolves.toBe(false);
  });

  it("propagates order lookup failures", async () => {
    const databaseError = new Error("connection refused");
    neonMock.mockReturnValue(vi.fn().mockRejectedValue(databaseError));

    await expect(
      isAstroPopOrderRecorded("cs_test_lookup_failure", "postgresql://test.example/astro_pop"),
    ).rejects.toBe(databaseError);
  });

  it("fails when an order lookup has no configured connection string", async () => {
    await expect(isAstroPopOrderRecorded("cs_test_no_database", "")).rejects.toBeInstanceOf(
      AstroPopDatabaseConfigurationError,
    );
    expect(neonMock).not.toHaveBeenCalled();
  });
});
