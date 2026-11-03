import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  headers: vi.fn(),
}));

vi.mock("@clerk/nuxt/server", () => ({
  clerkClient: () => ({ users: { getUser: mocks.getUser } }),
}));

vi.mock("h3", () => ({
  createError: (details: { statusCode: number; statusMessage: string }) =>
    Object.assign(new Error(details.statusMessage), details),
  defineEventHandler: <T>(handler: T) => handler,
  setResponseHeader: (...args: unknown[]) => mocks.headers(...args),
}));

type AccessHandler = (event: object) => Promise<{ authorized: true }>;
type TestEvent = {
  context: { auth?: () => { isAuthenticated?: boolean; userId?: string | null } };
  clientRole?: string;
};

const eventFor = (userId?: string | null, isAuthenticated = true): TestEvent => ({
  context: userId === undefined ? {} : { auth: () => ({ isAuthenticated, userId }) },
});

describe("Mission Control access handler", () => {
  let handler: AccessHandler;

  beforeAll(async () => {
    handler = (await import("../server/api/admin/access.get")).default as AccessHandler;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without a trusted Clerk session", async () => {
    await expect(handler(eventFor())).rejects.toMatchObject({ statusCode: 401 });
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.headers).toHaveBeenCalledWith(expect.anything(), "Cache-Control", "no-store");
  });

  it("returns 401 when a user ID is present but Clerk marks the session unauthenticated", async () => {
    await expect(handler(eventFor("user_not_authenticated", false))).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(mocks.getUser).not.toHaveBeenCalled();
  });

  it("returns 403 for an authenticated ordinary user", async () => {
    mocks.getUser.mockResolvedValue({ privateMetadata: { role: "traveler" } });

    await expect(handler(eventFor("user_ordinary"))).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.getUser).toHaveBeenCalledWith("user_ordinary");
  });

  it("authorizes only a current super_admin returned by Clerk", async () => {
    mocks.getUser.mockResolvedValue({ privateMetadata: { role: "super_admin" } });

    await expect(handler(eventFor("user_admin"))).resolves.toEqual({ authorized: true });
    expect(mocks.getUser).toHaveBeenCalledWith("user_admin");
  });

  it("applies a role revocation on the next request", async () => {
    mocks.getUser
      .mockResolvedValueOnce({ privateMetadata: { role: "super_admin" } })
      .mockResolvedValueOnce({ privateMetadata: { role: "traveler" } });

    await expect(handler(eventFor("user_revoked"))).resolves.toEqual({ authorized: true });
    await expect(handler(eventFor("user_revoked"))).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.getUser).toHaveBeenCalledTimes(2);
  });

  it("fails closed with a safe 503 when Clerk cannot verify permissions", async () => {
    mocks.getUser.mockRejectedValue(new Error("Clerk backend connection failed"));

    await expect(handler(eventFor("user_unverified"))).rejects.toMatchObject({
      statusCode: 503,
      statusMessage: "Authorization service unavailable",
    });
  });

  it.each([undefined, null, "super_admin", [], { role: "admin" }, { role: ["super_admin"] }])(
    "returns 403 for malformed or missing private metadata: %j",
    async (privateMetadata) => {
      mocks.getUser.mockResolvedValue({ privateMetadata });

      await expect(handler(eventFor("user_metadata"))).rejects.toMatchObject({ statusCode: 403 });
    },
  );

  it("does not authorize a client-supplied role", async () => {
    mocks.getUser.mockResolvedValue({ privateMetadata: { role: "traveler" } });
    const event = Object.assign(eventFor("user_client_role"), { clientRole: "super_admin" });

    await expect(handler(event)).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.getUser).toHaveBeenCalledWith("user_client_role");
  });
});
