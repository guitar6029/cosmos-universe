import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const stripeClient = {
    webhooks: {
      constructEvent: vi.fn(),
    },
    checkout: {
      sessions: {
        listLineItems: vi.fn(),
      },
    },
  };

  return {
    getOrderFromStripe: vi.fn(),
    persistOrder: vi.fn(),
    stripeConstructor: vi.fn(),
    stripeClient,
  };
});

vi.mock("stripe", () => ({
  default: function MockStripe(...args: unknown[]) {
    mocks.stripeConstructor(...args);
    return mocks.stripeClient;
  },
}));

vi.mock("../server/utils/astroPopDatabase", () => ({
  persistAstroPopOrder: mocks.persistOrder,
}));

vi.mock("../server/utils/astroPopOrderPersistence", () => ({
  getAstroPopOrderFromStripe: mocks.getOrderFromStripe,
}));

type WebhookHandler = (event: object) => Promise<{ received: true }>;

let handler: WebhookHandler;
const readRawBody = vi.fn();
const getHeader = vi.fn();

const paidSession = {
  id: "cs_test_astro_pop_paid",
  payment_status: "paid",
};

const paidOrder = {
  stripeCheckoutSessionId: paidSession.id,
  stripePaymentIntentId: "pi_test_astro_pop_paid",
  customerEmail: "traveler@example.com",
  totalCents: 600,
  currency: "usd",
  items: [
    {
      flavorId: "atomic-cherry-fizz",
      flavorName: "Atomic Cherry Fizz",
      quantity: 2,
      unitPriceCents: 300,
    },
  ],
};

const paidEvent = {
  type: "checkout.session.completed",
  data: { object: paidSession },
};

describe("Astro Pop Stripe webhook handler", () => {
  beforeAll(async () => {
    vi.stubGlobal("defineEventHandler", <T>(webhookHandler: T) => webhookHandler);
    vi.stubGlobal("readRawBody", readRawBody);
    vi.stubGlobal("getHeader", getHeader);
    vi.stubGlobal("createError", (details: { status: number; statusText: string }) =>
      Object.assign(new Error(details.statusText), {
        statusCode: details.status,
        statusText: details.statusText,
      }),
    );

    handler = (await import("../server/api/astro-pop/stripe-webhook.post"))
      .default as WebhookHandler;
  });

  beforeEach(() => {
    vi.stubEnv("ASTROPOP_STRIPE_SECRET_KEY", "sk_test_webhook_handler");
    vi.stubEnv("ASTROPOP_STRIPE_WEBHOOK_SECRET", "whsec_test_webhook_handler");
    vi.clearAllMocks();

    readRawBody.mockResolvedValue('{"signed":"event"}');
    getHeader.mockReturnValue("t=1,v1=valid-test-signature");
    mocks.stripeClient.webhooks.constructEvent.mockReturnValue(paidEvent);
    mocks.stripeClient.checkout.sessions.listLineItems.mockResolvedValue({
      data: [{ id: "li_test_astro_pop" }],
    });
    mocks.getOrderFromStripe.mockReturnValue(paidOrder);
    mocks.persistOrder.mockResolvedValue({ persisted: true });
  });

  afterAll(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns HTTP 500 rather than acknowledging a paid event when Neon persistence fails", async () => {
    const databaseError = new Error("database connection refused");
    mocks.persistOrder.mockRejectedValueOnce(databaseError);

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 500,
      statusText: "Astro Pop order persistence failed",
    });

    expect(mocks.stripeClient.webhooks.constructEvent).toHaveBeenCalledWith(
      '{"signed":"event"}',
      "t=1,v1=valid-test-signature",
      "whsec_test_webhook_handler",
    );
    expect(mocks.stripeClient.checkout.sessions.listLineItems).toHaveBeenCalledWith(
      paidSession.id,
      { expand: ["data.price.product"] },
    );
    expect(mocks.getOrderFromStripe).toHaveBeenCalledWith(paidSession, [
      { id: "li_test_astro_pop" },
    ]);
    expect(mocks.persistOrder).toHaveBeenCalledWith(paidOrder);
  });

  it("accepts a retry after an initial database failure for the same Checkout Session", async () => {
    mocks.persistOrder
      .mockRejectedValueOnce(new Error("database connection refused"))
      .mockResolvedValueOnce({ persisted: true });

    await expect(handler({})).rejects.toMatchObject({ statusCode: 500 });
    await expect(handler({})).resolves.toEqual({ received: true });

    expect(mocks.persistOrder).toHaveBeenCalledTimes(2);
    expect(mocks.persistOrder).toHaveBeenNthCalledWith(1, paidOrder);
    expect(mocks.persistOrder).toHaveBeenNthCalledWith(2, paidOrder);
    expect(paidOrder.stripeCheckoutSessionId).toBe(paidSession.id);
  });

  it("acknowledges duplicate deliveries when persistence reports an idempotent no-op", async () => {
    mocks.persistOrder
      .mockResolvedValueOnce({ persisted: true })
      .mockResolvedValueOnce({ persisted: false });

    await expect(handler({})).resolves.toEqual({ received: true });
    await expect(handler({})).resolves.toEqual({ received: true });

    expect(mocks.persistOrder).toHaveBeenCalledTimes(2);
    expect(mocks.persistOrder).toHaveBeenNthCalledWith(1, paidOrder);
    expect(mocks.persistOrder).toHaveBeenNthCalledWith(2, paidOrder);
  });
});
