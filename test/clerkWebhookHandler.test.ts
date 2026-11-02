import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createCosmosProfile: vi.fn(),
  verifyWebhook: vi.fn(),
}));

vi.mock("@clerk/backend/webhooks", () => ({
  verifyWebhook: mocks.verifyWebhook,
}));

vi.mock("../server/utils/cosmoportCoreDatabase", () => ({
  createCosmosProfile: mocks.createCosmosProfile,
}));

type WebhookHandler = (event: object) => Promise<{ received: true }>;

let handler: WebhookHandler;
const toWebRequest = vi.fn();

describe("Clerk user.created webhook handler", () => {
  beforeAll(async () => {
    vi.stubGlobal("defineEventHandler", <T>(webhookHandler: T) => webhookHandler);
    vi.stubGlobal("toWebRequest", toWebRequest);
    vi.stubGlobal("createError", (details: { statusCode: number; statusMessage: string }) =>
      Object.assign(new Error(details.statusMessage), details),
    );

    handler = (await import("../server/api/webhooks/clerk.post")).default as WebhookHandler;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("CLERK_WEBHOOK_SIGNING_SECRET", "whsec_clerk_test");
    toWebRequest.mockReturnValue(new Request("https://cosmos.test/api/webhooks/clerk"));
    mocks.verifyWebhook.mockResolvedValue({
      type: "user.created",
      data: { id: "user_clerk_test" },
    });
    mocks.createCosmosProfile.mockResolvedValue({ status: "created" });
  });

  afterAll(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("creates a profile for a verified user.created event", async () => {
    const event = {};

    await expect(handler(event)).resolves.toEqual({ received: true });

    expect(toWebRequest).toHaveBeenCalledWith(event);
    expect(mocks.verifyWebhook).toHaveBeenCalledWith(
      expect.any(Request),
      { signingSecret: "whsec_clerk_test" },
    );
    expect(mocks.createCosmosProfile).toHaveBeenCalledWith("user_clerk_test", "astronaut");
  });

  it("persists the valid avatar selected during registration", async () => {
    mocks.verifyWebhook.mockResolvedValue({
      type: "user.created",
      data: {
        id: "user_clerk_test",
        unsafe_metadata: { avatarId: "robot" },
      },
    });

    await expect(handler({})).resolves.toEqual({ received: true });

    expect(mocks.createCosmosProfile).toHaveBeenCalledWith("user_clerk_test", "robot");
  });

  it.each([undefined, "pirate", 42])(
    "uses Astronaut when signup avatar metadata is invalid: %j",
    async (avatarId) => {
      mocks.verifyWebhook.mockResolvedValue({
        type: "user.created",
        data: {
          id: "user_clerk_test",
          unsafe_metadata: { avatarId },
        },
      });

      await expect(handler({})).resolves.toEqual({ received: true });

      expect(mocks.createCosmosProfile).toHaveBeenCalledWith("user_clerk_test", "astronaut");
    },
  );

  it("acknowledges duplicate deliveries", async () => {
    mocks.createCosmosProfile.mockResolvedValue({ status: "already_exists" });

    await expect(handler({})).resolves.toEqual({ received: true });

    expect(mocks.createCosmosProfile).toHaveBeenCalledWith("user_clerk_test", "astronaut");
  });

  it("returns HTTP 400 for an invalid webhook signature without touching Neon", async () => {
    mocks.verifyWebhook.mockRejectedValue(new Error("signature verification failed"));

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: "Invalid webhook signature",
    });

    expect(mocks.createCosmosProfile).not.toHaveBeenCalled();
  });

  it.each([undefined, "", "   ", 42])("returns HTTP 400 when user.created has invalid user ID %j", async (id) => {
    mocks.verifyWebhook.mockResolvedValue({ type: "user.created", data: { id } });

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: "Missing user ID",
    });

    expect(mocks.createCosmosProfile).not.toHaveBeenCalled();
  });

  it("acknowledges other verified event types without database writes", async () => {
    mocks.verifyWebhook.mockResolvedValue({
      type: "user.updated",
      data: { id: "user_not_provisioned" },
    });

    await expect(handler({})).resolves.toEqual({ received: true });

    expect(mocks.createCosmosProfile).not.toHaveBeenCalled();
  });

  it("propagates database failures as 500-class errors", async () => {
    const databaseError = new Error("connection refused");
    mocks.createCosmosProfile.mockRejectedValue(databaseError);

    await expect(handler({})).rejects.toBe(databaseError);
    expect(databaseError).not.toMatchObject({ statusCode: 400 });
  });

  it("returns HTTP 500 without verifying or accessing Neon when the signing secret is missing", async () => {
    vi.stubEnv("CLERK_WEBHOOK_SIGNING_SECRET", "");

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: "Clerk webhook signing secret is not configured",
    });

    expect(mocks.verifyWebhook).not.toHaveBeenCalled();
    expect(mocks.createCosmosProfile).not.toHaveBeenCalled();
  });
});
