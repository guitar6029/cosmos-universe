import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  class StripeInvalidRequestError extends Error {
    code?: string;

    constructor(code?: string) {
      super("Stripe request failed");
      this.code = code;
    }
  }

  const stripeClient = { checkout: { sessions: { retrieve: vi.fn() } } };

  return {
    StripeInvalidRequestError,
    isGuestAuthorized: vi.fn(),
    getQuery: vi.fn(),
    isOrderRecorded: vi.fn(),
    stripeClient,
    stripeConstructor: vi.fn(),
  };
});

vi.mock("nuxt/server", () => ({
  createError: (details: { status: number; statusText: string }) =>
    Object.assign(new Error(details.statusText), {
      statusCode: details.status,
      statusText: details.statusText,
    }),
  defineEventHandler: <T>(handler: T) => handler,
  getQuery: mocks.getQuery,
}));

vi.mock("stripe", () => ({
  default: Object.assign(
    function MockStripe(...args: unknown[]) {
      mocks.stripeConstructor(...args);
      return mocks.stripeClient;
    },
    { errors: { StripeInvalidRequestError: mocks.StripeInvalidRequestError } },
  ),
}));

vi.mock("../server/utils/astroPopDatabase", () => ({
  isAstroPopOrderRecorded: mocks.isOrderRecorded,
}));

vi.mock("../server/utils/astroPopGuestCheckout", () => ({
  isAstroPopGuestCheckoutAuthorized: mocks.isGuestAuthorized,
}));

type StatusHandler = (event: object) => Promise<object>;

const session = (overrides: Record<string, unknown> = {}) => ({
  id: "cs_test_astro_pop_status",
  mode: "payment",
  metadata: {
    astro_pop_order: "true",
    astro_pop_guest_fingerprint: "a".repeat(64),
  },
  payment_status: "paid",
  status: "complete",
  ...overrides,
});

describe("Astro Pop checkout status handler", () => {
  let handler: StatusHandler;

  beforeAll(async () => {
    handler = (await import("../server/api/astro-pop/checkout/status.get"))
      .default as StatusHandler;
  });

  beforeEach(() => {
    vi.stubEnv("ASTROPOP_STRIPE_SECRET_KEY", "sk_test_status_handler");
    vi.clearAllMocks();
    mocks.getQuery.mockReturnValue({ session_id: "cs_test_astro_pop_status" });
    mocks.stripeClient.checkout.sessions.retrieve.mockResolvedValue(session());
    mocks.isOrderRecorded.mockResolvedValue(true);
    mocks.isGuestAuthorized.mockReturnValue(true);
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("rejects an invalid Checkout Session ID", async () => {
    mocks.getQuery.mockReturnValue({ session_id: "pi_not_a_checkout_session" });

    await expect(handler({})).rejects.toMatchObject({ statusCode: 400 });
    expect(mocks.stripeClient.checkout.sessions.retrieve).not.toHaveBeenCalled();
  });

  it("reports missing Stripe configuration", async () => {
    vi.stubEnv("ASTROPOP_STRIPE_SECRET_KEY", "");

    await expect(handler({})).rejects.toMatchObject({ statusCode: 500 });
    expect(mocks.stripeClient.checkout.sessions.retrieve).not.toHaveBeenCalled();
  });

  it("maps a missing Stripe session to 404", async () => {
    mocks.stripeClient.checkout.sessions.retrieve.mockRejectedValue(
      new mocks.StripeInvalidRequestError("resource_missing"),
    );

    await expect(handler({})).rejects.toMatchObject({ statusCode: 404 });
  });

  it("maps Stripe retrieval failures to 502", async () => {
    mocks.stripeClient.checkout.sessions.retrieve.mockRejectedValue(
      new Error("Stripe unavailable"),
    );

    await expect(handler({})).rejects.toMatchObject({ statusCode: 502 });
  });

  it("rejects a Checkout Session that is not an Astro Pop payment", async () => {
    mocks.stripeClient.checkout.sessions.retrieve.mockResolvedValue(
      session({ metadata: { astro_pop_order: "false" } }),
    );

    await expect(handler({})).rejects.toMatchObject({ statusCode: 404 });
    expect(mocks.isOrderRecorded).not.toHaveBeenCalled();
  });

  it.each([
    ["a missing browser credential", undefined],
    ["an incorrect browser credential", "b".repeat(64)],
    ["a missing fingerprint", undefined],
  ])("rejects %s before querying Neon", async (_description, fingerprint) => {
    if (fingerprint === undefined && _description === "a missing fingerprint") {
      mocks.stripeClient.checkout.sessions.retrieve.mockResolvedValue(
        session({ metadata: { astro_pop_order: "true" } }),
      );
    }
    mocks.isGuestAuthorized.mockReturnValue(false);

    await expect(handler({})).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.isOrderRecorded).not.toHaveBeenCalled();
  });

  it("reports a completed but unpaid Checkout as pending without querying Neon", async () => {
    mocks.stripeClient.checkout.sessions.retrieve.mockResolvedValue(
      session({ payment_status: "unpaid" }),
    );

    await expect(handler({})).resolves.toEqual({
      paymentStatus: "pending",
      orderStatus: "not_checked",
      orderConfirmed: false,
    });
    expect(mocks.isOrderRecorded).not.toHaveBeenCalled();
  });

  it.each(["open", "expired"])(
    "reports an unpaid %s Checkout without querying Neon",
    async (status) => {
      mocks.stripeClient.checkout.sessions.retrieve.mockResolvedValue(
        session({ status, payment_status: "unpaid" }),
      );

      await expect(handler({})).resolves.toEqual({
        paymentStatus: "unpaid",
        orderStatus: "not_checked",
        orderConfirmed: false,
      });
      expect(mocks.isOrderRecorded).not.toHaveBeenCalled();
    },
  );

  it("confirms an order only when paid and recorded", async () => {
    await expect(handler({})).resolves.toEqual({
      paymentStatus: "paid",
      orderStatus: "recorded",
      orderConfirmed: true,
    });
    expect(mocks.isOrderRecorded).toHaveBeenCalledWith("cs_test_astro_pop_status");
    expect(mocks.isGuestAuthorized).toHaveBeenCalledWith(expect.any(Object), "a".repeat(64));
  });

  it("distinguishes a paid Checkout with no recorded order", async () => {
    mocks.isOrderRecorded.mockResolvedValue(false);

    await expect(handler({})).resolves.toEqual({
      paymentStatus: "paid",
      orderStatus: "not_recorded",
      orderConfirmed: false,
    });
  });

  it("reports Neon failures as an unknown recording state", async () => {
    mocks.isOrderRecorded.mockRejectedValue(new Error("Neon unavailable"));

    await expect(handler({})).resolves.toEqual({
      paymentStatus: "paid",
      orderStatus: "unknown",
      orderConfirmed: false,
    });
  });

  it.each([{ payment_status: "no_payment_required" }, { status: "open", payment_status: "paid" }])(
    "never confirms unsupported Stripe states",
    async (overrides) => {
      mocks.stripeClient.checkout.sessions.retrieve.mockResolvedValue(session(overrides));

      await expect(handler({})).resolves.toEqual({
        paymentStatus: "unknown",
        orderStatus: "not_checked",
        orderConfirmed: false,
      });
      expect(mocks.isOrderRecorded).not.toHaveBeenCalled();
    },
  );
});
