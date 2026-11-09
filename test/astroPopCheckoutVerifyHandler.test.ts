import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  class StripeInvalidRequestError extends Error {}
  const stripeClient = { checkout: { sessions: { retrieve: vi.fn() } } };

  return {
    StripeInvalidRequestError,
    getGuestCredential: vi.fn(),
    getQuery: vi.fn(),
    isGuestAuthorized: vi.fn(),
    stripeClient,
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
    function MockStripe() {
      return mocks.stripeClient;
    },
    { errors: { StripeInvalidRequestError: mocks.StripeInvalidRequestError } },
  ),
}));

vi.mock("../server/utils/astroPopGuestCheckout", () => ({
  getAstroPopGuestCredential: mocks.getGuestCredential,
  isAstroPopGuestCheckoutAuthorized: mocks.isGuestAuthorized,
}));

type VerifyHandler = (event: object) => Promise<{ sessionId: string; verified: boolean }>;

const session = (overrides: Record<string, unknown> = {}) => ({
  id: "cs_test_astro_pop_verify",
  mode: "payment",
  metadata: {
    astro_pop_order: "true",
    astro_pop_guest_fingerprint: "a".repeat(64),
  },
  payment_status: "paid",
  status: "complete",
  ...overrides,
});

describe("Astro Pop checkout verification handler", () => {
  let handler: VerifyHandler;

  beforeAll(async () => {
    handler = (await import("../server/api/astro-pop/checkout/verify.get"))
      .default as VerifyHandler;
  });

  beforeEach(() => {
    vi.stubEnv("ASTROPOP_STRIPE_SECRET_KEY", "sk_test_verify_handler");
    vi.clearAllMocks();
    mocks.getQuery.mockReturnValue({ session_id: "cs_test_astro_pop_verify" });
    mocks.getGuestCredential.mockReturnValue("a".repeat(43));
    mocks.isGuestAuthorized.mockReturnValue(true);
    mocks.stripeClient.checkout.sessions.retrieve.mockResolvedValue(session());
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("preserves the authorized verification response contract", async () => {
    await expect(handler({})).resolves.toEqual({
      sessionId: "cs_test_astro_pop_verify",
      verified: true,
    });
  });

  it("rejects a missing guest credential before calling Stripe", async () => {
    mocks.getGuestCredential.mockReturnValue(undefined);

    await expect(handler({})).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.stripeClient.checkout.sessions.retrieve).not.toHaveBeenCalled();
  });

  it("rejects an incorrect guest credential after retrieving the checkout", async () => {
    mocks.isGuestAuthorized.mockReturnValue(false);

    await expect(handler({})).rejects.toMatchObject({ statusCode: 403 });
  });

  it("rejects older Checkout Sessions without a guest fingerprint", async () => {
    mocks.stripeClient.checkout.sessions.retrieve.mockResolvedValue(
      session({ metadata: { astro_pop_order: "true" } }),
    );
    mocks.isGuestAuthorized.mockReturnValue(false);

    await expect(handler({})).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.isGuestAuthorized).toHaveBeenCalledWith(expect.any(Object), undefined);
  });

  it("rejects non-Astro-Pop sessions before authorization", async () => {
    mocks.stripeClient.checkout.sessions.retrieve.mockResolvedValue(
      session({ metadata: { astro_pop_order: "false" } }),
    );

    await expect(handler({})).rejects.toMatchObject({ statusCode: 404 });
    expect(mocks.isGuestAuthorized).not.toHaveBeenCalled();
  });

  it("keeps Stripe missing-session and service error responses", async () => {
    mocks.stripeClient.checkout.sessions.retrieve.mockRejectedValue(
      new mocks.StripeInvalidRequestError(),
    );
    await expect(handler({})).rejects.toMatchObject({ statusCode: 404 });

    mocks.stripeClient.checkout.sessions.retrieve.mockRejectedValue(
      new Error("Stripe unavailable"),
    );
    await expect(handler({})).rejects.toMatchObject({ statusCode: 502 });
  });
});
