import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  enabled: vi.fn(),
  routeParam: vi.fn(),
  header: vi.fn(),
  admin: vi.fn(),
}));
vi.mock("h3", () => ({
  defineEventHandler: <T>(fn: T) => fn,
  getRouterParam: (...args: unknown[]) => mocks.routeParam(...args),
  setResponseHeader: (...args: unknown[]) => mocks.header(...args),
  createError: (args: { statusCode: number; statusMessage: string }) =>
    Object.assign(new Error(args.statusMessage), args),
}));
vi.mock("../server/utils/requireSuperAdmin", () => ({
  requireSuperAdmin: (...args: unknown[]) => mocks.admin(...args),
}));
vi.mock("../server/utils/cosmoportCoreDatabase", () => ({
  getCosmoportAppEnabled: (...args: unknown[]) => mocks.enabled(...args),
}));

describe("Public app availability endpoint", () => {
  let handler: (event: object) => Promise<{ allowed: boolean | null }>;
  beforeAll(async () => {
    handler = (await import("../server/api/apps/[id]/access.get")).default as typeof handler;
  });
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.routeParam.mockReturnValue("cosmoport-voyage");
    mocks.admin.mockRejectedValue(Object.assign(new Error("Unauthorized"), { statusCode: 401 }));
  });

  it("grants public access for enabled apps without Clerk", async () => {
    mocks.enabled.mockResolvedValue(true);
    await expect(handler({})).resolves.toEqual({ allowed: true });
    expect(mocks.admin).not.toHaveBeenCalled();
    expect(mocks.header).toHaveBeenCalledWith(expect.anything(), "Cache-Control", "no-store");
  });

  it("blocks a disabled app for guests and non-admins", async () => {
    mocks.enabled.mockResolvedValue(false);
    await expect(handler({})).resolves.toEqual({ allowed: false });
    expect(mocks.admin).toHaveBeenCalledOnce();
    mocks.admin.mockRejectedValue(Object.assign(new Error("Forbidden"), { statusCode: 403 }));
    await expect(handler({})).resolves.toEqual({ allowed: false });
  });

  it("grants a verified Super Admin access to a disabled app", async () => {
    mocks.enabled.mockResolvedValue(false);
    mocks.admin.mockResolvedValue(undefined);
    await expect(handler({})).resolves.toEqual({ allowed: true });
  });

  it("keeps unknown application IDs distinct from disabled apps", async () => {
    mocks.enabled.mockResolvedValue(null);
    await expect(handler({})).resolves.toEqual({ allowed: null });
    expect(mocks.admin).not.toHaveBeenCalled();
  });

  it("fails closed when Clerk cannot verify a Super Admin", async () => {
    mocks.enabled.mockResolvedValue(false);
    mocks.admin.mockRejectedValue(Object.assign(new Error("Clerk is down"), { statusCode: 503 }));
    await expect(handler({})).rejects.toMatchObject({ statusCode: 503 });
  });

  it.each(["", "../admin", "INVALID", "bad_id", "a".repeat(65)])(
    "rejects malformed app IDs",
    async (id) => {
      mocks.routeParam.mockReturnValue(id);
      await expect(handler({})).rejects.toMatchObject({ statusCode: 400 });
      expect(mocks.enabled).not.toHaveBeenCalled();
    },
  );

  it("returns a safe 503 when Neon is unavailable", async () => {
    mocks.enabled.mockRejectedValue(new Error("Private database details"));
    await expect(handler({})).rejects.toMatchObject({ statusCode: 503 });
  });
});
