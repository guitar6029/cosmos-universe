import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const resendClient = {
    emails: {
      send: vi.fn(),
    },
  };

  return {
    resendClient,
    resendConstructor: vi.fn(),
    verifyWebhook: vi.fn(),
  };
});

vi.mock("@clerk/backend/webhooks", () => ({
  verifyWebhook: mocks.verifyWebhook,
}));

vi.mock("resend", () => ({
  Resend: function MockResend(...args: unknown[]) {
    mocks.resendConstructor(...args);
    return mocks.resendClient;
  },
}));

type WebhookHandler = (event: object) => Promise<Record<string, unknown>>;

let handler: WebhookHandler;
const toWebRequest = vi.fn();

function verificationEmailEvent(overrides: Record<string, unknown> = {}) {
  return {
    type: "email.created",
    data: {
      id: "email_clerk_test",
      slug: "verification_code",
      to_email_address: "traveler@example.com",
      data: { otp_code: "123456" },
      ...overrides,
    },
  };
}

describe("Clerk email.created webhook handler", () => {
  beforeAll(async () => {
    vi.stubGlobal("defineEventHandler", <T>(webhookHandler: T) => webhookHandler);
    vi.stubGlobal("toWebRequest", toWebRequest);
    vi.stubGlobal("createError", (details: { status: number; statusText: string }) =>
      Object.assign(new Error(details.statusText), {
        statusCode: details.status,
        statusText: details.statusText,
      }),
    );

    handler = (await import("../server/api/webhooks/clerk-email.post")).default as WebhookHandler;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("CLERK_EMAIL_WEBHOOK_SIGNING_SECRET", "whsec_clerk_email_test");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    toWebRequest.mockReturnValue(new Request("https://cosmos.test/api/webhooks/clerk-email"));
    mocks.verifyWebhook.mockResolvedValue(verificationEmailEvent());
    mocks.resendClient.emails.send.mockResolvedValue({
      data: { id: "resend_email_test" },
      error: null,
    });
  });

  afterAll(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("rejects invalid webhook signatures before delivery", async () => {
    mocks.verifyWebhook.mockRejectedValue(new Error("signature verification failed"));

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 400,
      statusText: "Invalid webhook signature",
    });

    expect(mocks.resendConstructor).not.toHaveBeenCalled();
  });

  it("fails closed when the webhook signing secret is missing", async () => {
    vi.stubEnv("CLERK_EMAIL_WEBHOOK_SIGNING_SECRET", "");

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 500,
      statusText: "Clerk email webhook signing secret is not configured",
    });

    expect(mocks.verifyWebhook).not.toHaveBeenCalled();
    expect(mocks.resendConstructor).not.toHaveBeenCalled();
  });

  it.each([
    { type: "user.created", data: { id: "user_clerk_test" } },
    verificationEmailEvent({ slug: "password_reset" }),
  ])("acknowledges supported-but-unhandled events: %j", async (webhookEvent) => {
    mocks.verifyWebhook.mockResolvedValue(webhookEvent);

    await expect(handler({})).resolves.toEqual({ received: true, ignored: true });

    expect(mocks.resendConstructor).not.toHaveBeenCalled();
  });

  it.each([
    { to_email_address: undefined },
    { to_email_address: "not-an-email" },
    { data: { otp_code: undefined } },
    { data: { otp_code: "12345" } },
    { data: { otp_code: "<script>" } },
  ])("rejects a missing or invalid recipient or OTP: %j", async (overrides) => {
    mocks.verifyWebhook.mockResolvedValue(verificationEmailEvent(overrides));

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 400,
      statusText: "Missing recipient or verification code",
    });

    expect(mocks.resendConstructor).not.toHaveBeenCalled();
  });

  it("rejects a missing Clerk email event ID before delivery", async () => {
    mocks.verifyWebhook.mockResolvedValue(verificationEmailEvent({ id: " " }));

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 400,
      statusText: "Missing email event ID",
    });

    expect(mocks.resendConstructor).not.toHaveBeenCalled();
  });

  it("fails closed when the Resend API key is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 500,
      statusText: "Resend API key is not configured",
    });

    expect(mocks.resendConstructor).not.toHaveBeenCalled();
  });

  it("delivers a verification email without logging its recipient, OTP, or API key", async () => {
    const consoleError = vi.spyOn(console, "error");

    await expect(handler({})).resolves.toEqual({
      received: true,
      emailId: "resend_email_test",
    });

    expect(mocks.resendConstructor).toHaveBeenCalledWith("re_test_key");
    expect(mocks.resendClient.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Cosmos Universe <access@mail.cosmos-universe.com>",
        to: "traveler@example.com",
        subject: "123456 — Your Cosmos Universe Access Code",
        text: "Your Cosmos Universe verification code is 123456. Do not share this code.",
      }),
      { idempotencyKey: "clerk-email/email_clerk_test" },
    );
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("uses the same idempotency key when Clerk retries the same email event", async () => {
    await handler({});
    await handler({});

    expect(mocks.resendClient.emails.send).toHaveBeenCalledTimes(2);
    expect(mocks.resendClient.emails.send.mock.calls.map(([, options]) => options)).toEqual([
      { idempotencyKey: "clerk-email/email_clerk_test" },
      { idempotencyKey: "clerk-email/email_clerk_test" },
    ]);
  });

  it.each([
    { data: null, error: { name: "application_error" } },
    { data: null, error: null },
  ])("returns a safe error when Resend reports a delivery failure", async (response) => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.resendClient.emails.send.mockResolvedValue(response);

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 502,
      statusText: "Email delivery failed",
    });

    expect(consoleError).toHaveBeenCalledWith("Resend email delivery failed", {
      eventId: "email_clerk_test",
      errorName: response.error?.name,
    });
    consoleError.mockRestore();
  });

  it("returns a safe error when Resend rejects the delivery request", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.resendClient.emails.send.mockRejectedValue(new Error("network unavailable"));

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 502,
      statusText: "Email delivery failed",
    });

    expect(consoleError).toHaveBeenCalledWith("Resend email delivery failed", {
      eventId: "email_clerk_test",
      errorName: "Error",
    });
    consoleError.mockRestore();
  });
});
