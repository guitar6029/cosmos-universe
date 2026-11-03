import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const stripeClient = { checkout: { sessions: { create: vi.fn() } } };

  return {
    createCredential: vi.fn(),
    createError: vi.fn((details: { status: number; statusText: string }) =>
      Object.assign(new Error(details.statusText), { statusCode: details.status }),
    ),
    getCredential: vi.fn(),
    getFingerprint: vi.fn(),
    readBody: vi.fn(),
    setCredential: vi.fn(),
    stripeClient,
    appEnabled: vi.fn(),
    getClerkAuth: vi.fn(),
  };
});

vi.mock("nuxt/server", () => ({
  createError: mocks.createError,
  defineEventHandler: <T>(handler: T) => handler,
  readBody: mocks.readBody,
}));

vi.mock("../server/utils/getClerkAuth", () => ({ getClerkAuth: mocks.getClerkAuth }));

vi.mock("../server/utils/cosmoportCoreDatabase", () => ({
  getCosmoportAppEnabled: mocks.appEnabled,
}));

vi.mock("stripe", () => ({
  default: function MockStripe() {
    return mocks.stripeClient;
  },
}));

vi.mock("../server/utils/astroPopGuestCheckout", () => ({
  createAstroPopGuestCredential: mocks.createCredential,
  getAstroPopGuestCredential: mocks.getCredential,
  getAstroPopGuestFingerprint: mocks.getFingerprint,
  setAstroPopGuestCredential: mocks.setCredential,
}));

type CheckoutHandler = (event: object) => Promise<{ sessionId: string; url: string | null }>;

const cart = { items: [{ flavorId: "atomic-cherry-fizz", quantity: 2 }] };
const existingCredential = "a".repeat(43);
const newCredential = "b".repeat(43);

describe("Astro Pop checkout creation handler", () => {
  let handler: CheckoutHandler;

  beforeAll(async () => {
    handler = (await import("../server/api/astro-pop/checkout.post")).default as CheckoutHandler;
  });

  beforeEach(() => {
    vi.stubEnv("ASTROPOP_STRIPE_SECRET_KEY", "sk_test_checkout_handler");
    vi.stubEnv("COSMOPORT_APP_URL", "https://example.test");
    vi.clearAllMocks();
    mocks.appEnabled.mockResolvedValue(true);
    mocks.getClerkAuth.mockReturnValue({ isAuthenticated: false, userId: null });
    mocks.readBody.mockResolvedValue(cart);
    mocks.getCredential.mockReturnValue(existingCredential);
    mocks.getFingerprint.mockReturnValue("f".repeat(64));
    mocks.createCredential.mockReturnValue(newCredential);
    mocks.stripeClient.checkout.sessions.create.mockResolvedValue({
      id: "cs_test_new_checkout",
      url: "https://checkout.stripe.test/session",
    });
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("blocks new sessions while the app is disabled", async () => {
    mocks.appEnabled.mockResolvedValue(false);
    await expect(handler({})).rejects.toMatchObject({ statusCode: 503 });
    expect(mocks.stripeClient.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("fails closed when availability is unverified", async () => {
    mocks.appEnabled.mockRejectedValue(new Error("DB outage"));
    await expect(handler({})).rejects.toMatchObject({ statusCode: 503 });
    expect(mocks.stripeClient.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("stores only the guest fingerprint in Stripe metadata", async () => {
    await expect(handler({})).resolves.toEqual({
      sessionId: "cs_test_new_checkout",
      url: "https://checkout.stripe.test/session",
    });

    expect(mocks.getFingerprint).toHaveBeenCalledWith(existingCredential);
    expect(mocks.stripeClient.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: {
          astro_pop_order: "true",
          astro_pop_guest_fingerprint: "f".repeat(64),
        },
      }),
    );
    expect(JSON.stringify(mocks.stripeClient.checkout.sessions.create.mock.calls)).not.toContain(
      existingCredential,
    );
    expect(mocks.setCredential).not.toHaveBeenCalled();
  });

  it("attaches the verified Clerk identity to a signed-in checkout", async () => {
    mocks.getClerkAuth.mockReturnValue({ isAuthenticated: true, userId: "user_verified" });
    await handler({});
    expect(mocks.stripeClient.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ clerk_user_id: "user_verified" }),
      }),
    );
  });

  it("reuses one browser credential for multiple checkout sessions", async () => {
    await handler({});
    await handler({});

    expect(mocks.getFingerprint).toHaveBeenCalledTimes(2);
    expect(mocks.getFingerprint).toHaveBeenNthCalledWith(1, existingCredential);
    expect(mocks.getFingerprint).toHaveBeenNthCalledWith(2, existingCredential);
    expect(mocks.setCredential).not.toHaveBeenCalled();
  });

  it("sets a new credential only after Stripe creates the session", async () => {
    mocks.getCredential.mockReturnValue(undefined);

    await handler({});

    expect(mocks.getFingerprint).toHaveBeenCalledWith(newCredential);
    expect(mocks.setCredential).toHaveBeenCalledWith({}, newCredential);
  });

  it("does not set a new credential when Stripe Session creation fails", async () => {
    mocks.getCredential.mockReturnValue(undefined);
    mocks.stripeClient.checkout.sessions.create.mockRejectedValue(new Error("Stripe unavailable"));

    await expect(handler({})).rejects.toThrow("Stripe unavailable");
    expect(mocks.setCredential).not.toHaveBeenCalled();
  });

  it("preserves cart validation before creating a Checkout Session", async () => {
    mocks.readBody.mockResolvedValue({ items: [] });

    await expect(handler({})).rejects.toMatchObject({ statusCode: 400 });
    expect(mocks.stripeClient.checkout.sessions.create).not.toHaveBeenCalled();
  });
});
