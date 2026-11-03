import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  redirect: vi.fn((to: string) => ({ redirect: to })),
  abort: vi.fn((error: unknown) => ({ error })),
}));
vi.stubGlobal("defineNuxtRouteMiddleware", <T>(fn: T) => fn);
vi.stubGlobal("useRequestFetch", () => mocks.request);
vi.stubGlobal("navigateTo", mocks.redirect);
vi.stubGlobal("abortNavigation", mocks.abort);
vi.stubGlobal("createError", (props: object) => props);

describe("Global mini-app availability middleware", () => {
  let guard: (to: { path: string; fullPath: string }) => Promise<unknown>;
  const path = (url: string) => ({ path: url.split("?")[0]!, fullPath: url });
  beforeAll(async () => {
    guard = (await import("../app/middleware/app-availability.global")).default as typeof guard;
  });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["/", "/about", "/admin", "/passport-office", "/coming-soon"])(
    "does not query Neon for a system route: %s",
    async (url) => {
      await expect(guard(path(url))).resolves.toBeUndefined();
      expect(mocks.request).not.toHaveBeenCalled();
    },
  );

  it("allows a registered enabled mini-app, including nested paths", async () => {
    mocks.request.mockResolvedValue({ allowed: true });
    await expect(guard(path("/app/astro-pop/flavors/cherry"))).resolves.toBeUndefined();
    expect(mocks.request).toHaveBeenCalledWith("/api/apps/astro-pop/access");
  });

  it("allows a verified Super Admin when the API grants access despite a disabled flag", async () => {
    mocks.request.mockResolvedValue({ allowed: true });
    await expect(guard(path("/app/cosmoport-voyage"))).resolves.toBeUndefined();
  });

  it("redirects a disabled mini-app without rendering the page", async () => {
    mocks.request.mockResolvedValue({ allowed: false });
    await expect(guard(path("/app/cosmoport-voyage/destinations"))).resolves.toEqual({
      redirect: "/coming-soon",
    });
  });

  it("does not assume a missing database record is public", async () => {
    mocks.request.mockResolvedValue({ allowed: null });
    await expect(guard(path("/app/unknown"))).resolves.toEqual({
      error: { statusCode: 404, statusMessage: "Application not found" },
    });
  });

  it("fails closed on a server/network error", async () => {
    mocks.request.mockRejectedValue(new Error("DB failure"));
    await expect(guard(path("/app/cosmoport-voyage"))).resolves.toEqual({
      error: { statusCode: 503, statusMessage: "Application availability unavailable" },
    });
  });

  it.each(["/astro-pop", "/astro-pop/cart", "/cosmoport-voyage"])(
    "ignores retired top-level application routes: %s",
    async (url) => {
      await expect(guard(path(url))).resolves.toBeUndefined();
      expect(mocks.request).not.toHaveBeenCalled();
      expect(mocks.redirect).not.toHaveBeenCalled();
    },
  );

  it("rejects an /app route without a valid application id", async () => {
    await expect(guard(path("/app"))).resolves.toEqual({
      error: { statusCode: 404, statusMessage: "Application not found" },
    });
    expect(mocks.request).not.toHaveBeenCalled();
  });
});
