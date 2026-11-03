import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getProfileAvatar: vi.fn(),
}));

vi.mock("nuxt/server", () => ({
  createError: (details: { statusCode: number; statusMessage: string }) =>
    Object.assign(new Error(details.statusMessage), details),
  defineEventHandler: <T>(handler: T) => handler,
}));

vi.mock("../server/utils/getClerkAuth", () => ({
  getClerkAuth: mocks.auth,
}));

vi.mock("../server/utils/cosmoportCoreDatabase", () => ({
  getProfileAvatar: mocks.getProfileAvatar,
}));

type ProfileHandler = (event: { res: { headers: Headers } }) => Promise<{
  avatarId: string | null;
}>;

describe("profile avatar endpoint", () => {
  let handler: ProfileHandler;

  beforeAll(async () => {
    handler = (await import("../server/api/account/profile-avatar.get")).default as ProfileHandler;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without a verified Clerk session", async () => {
    mocks.auth.mockReturnValue({ isAuthenticated: false, userId: null });
    const event = { res: { headers: new Headers() } };

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });

    expect(mocks.getProfileAvatar).not.toHaveBeenCalled();
    expect(event.res.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("returns the authenticated traveler's saved avatar", async () => {
    mocks.auth.mockReturnValue({ isAuthenticated: true, userId: "user_astro" });
    mocks.getProfileAvatar.mockResolvedValue("alien");

    await expect(handler({ res: { headers: new Headers() } })).resolves.toEqual({
      avatarId: "alien",
    });

    expect(mocks.getProfileAvatar).toHaveBeenCalledWith("user_astro");
  });

  it("returns a missing profile distinctly from a database failure", async () => {
    mocks.auth.mockReturnValue({ isAuthenticated: true, userId: "user_missing" });
    mocks.getProfileAvatar.mockResolvedValue(null);

    await expect(handler({ res: { headers: new Headers() } })).resolves.toEqual({
      avatarId: null,
    });

    const databaseError = new Error("database unavailable");
    mocks.getProfileAvatar.mockRejectedValueOnce(databaseError);

    await expect(handler({ res: { headers: new Headers() } })).rejects.toBe(databaseError);
  });
});
