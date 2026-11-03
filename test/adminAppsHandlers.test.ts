import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authorize: vi.fn(),
  list: vi.fn(),
  update: vi.fn(),
  body: vi.fn(),
  id: vi.fn(),
  header: vi.fn(),
}));

vi.mock("h3", () => ({
  defineEventHandler: <T>(fn: T) => fn,
  createError: (opts: { statusCode: number; statusMessage: string }) =>
    Object.assign(new Error(opts.statusMessage), opts),
  readBody: (...args: unknown[]) => mocks.body(...args),
  getRouterParam: (...args: unknown[]) => mocks.id(...args),
  setResponseHeader: (...args: unknown[]) => mocks.header(...args),
}));

vi.mock("../server/utils/requireSuperAdmin", () => ({
  requireSuperAdmin: (...args: unknown[]) => mocks.authorize(...args),
}));
vi.mock("../server/utils/cosmoportCoreDatabase", () => ({
  getCosmoportApps: (...args: unknown[]) => mocks.list(...args),
  updateCosmoportAppStatus: (...args: unknown[]) => mocks.update(...args),
}));

type Handler = (event: object) => Promise<unknown>;
const event = {};
const astro = { id: "astro-pop", title: "Astro Pop", description: "Soda", enabled: false };

describe("Admin apps endpoints", () => {
  let getApps: Handler;
  let patchApp: Handler;

  beforeAll(async () => {
    getApps = (await import("../server/api/admin/apps.get")).default as Handler;
    patchApp = (await import("../server/api/admin/apps/[id].patch")).default as Handler;
  });

  beforeEach(() => {
    vi.resetAllMocks();
    mocks.id.mockReturnValue("astro-pop");
    mocks.body.mockResolvedValue({ enabled: false });
    mocks.list.mockResolvedValue([astro]);
    mocks.update.mockResolvedValue(astro);
  });

  it("returns the protected list without caching", async () => {
    await expect(getApps(event)).resolves.toEqual({ apps: [astro] });
    expect(mocks.authorize).toHaveBeenCalledWith(event);
    expect(mocks.header).toHaveBeenCalledWith(event, "Cache-Control", "no-store");
  });

  it("does not read data if authorization fails", async () => {
    mocks.authorize.mockRejectedValue(Object.assign(new Error("Forbidden"), { statusCode: 403 }));
    await expect(getApps(event)).rejects.toMatchObject({ statusCode: 403 });
    await expect(patchApp(event)).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.list).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.body).not.toHaveBeenCalled();
  });

  it("returns the saved app after a validated PATCH", async () => {
    await expect(patchApp(event)).resolves.toEqual({ app: astro });
    expect(mocks.update).toHaveBeenCalledExactlyOnceWith("astro-pop", false);
    expect(mocks.header).toHaveBeenCalledWith(event, "Cache-Control", "no-store");
  });

  it.each(["", "INVALID", "../other", "bad_id", undefined])(
    "rejects an invalid id: %j",
    async (id) => {
      mocks.id.mockReturnValue(id);
      await expect(patchApp(event)).rejects.toMatchObject({ statusCode: 400 });
      expect(mocks.body).not.toHaveBeenCalled();
      expect(mocks.update).not.toHaveBeenCalled();
    },
  );

  it.each([
    { enabled: "false" },
    { enabled: 0 },
    { enabled: null },
    {},
    { enabled: true, role: "super_admin" },
  ])("rejects an invalid request body: %j", async (body) => {
    mocks.body.mockResolvedValue(body);
    await expect(patchApp(event)).rejects.toMatchObject({ statusCode: 400 });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("returns 404 for a valid but unregistered app id", async () => {
    mocks.update.mockResolvedValue(null);
    await expect(patchApp(event)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("does not hide database failures", async () => {
    mocks.update.mockRejectedValue(new Error("Database down"));
    await expect(patchApp(event)).rejects.toThrow("Database down");
  });
});
