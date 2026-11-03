import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const checkSession = vi.fn();
const redirect = vi.fn((path: string) => ({ redirectTo: path }));

vi.stubGlobal("defineNuxtRouteMiddleware", (middleware: unknown) => middleware);
vi.stubGlobal("useRequestFetch", () => checkSession);
vi.stubGlobal("navigateTo", redirect);

describe("Astro Pop account route middleware", () => {
  let middleware: () => Promise<unknown>;

  beforeAll(async () => {
    middleware = (await import("../app/middleware/astro-pop-account-auth"))
      .default as typeof middleware;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows direct and client-side account navigation for a verified session", async () => {
    checkSession.mockResolvedValue({ authenticated: true });

    await expect(middleware()).resolves.toBeUndefined();
    expect(checkSession).toHaveBeenCalledWith("/api/astro-pop/account/session");
    expect(redirect).not.toHaveBeenCalled();
  });

  it.each([
    ["a signed-out session", { authenticated: false }],
    ["a failed session request", new Error("unavailable")],
  ])("redirects account navigation when there is %s", async (_scenario, response) => {
    if (response instanceof Error) checkSession.mockRejectedValue(response);
    else checkSession.mockResolvedValue(response);

    await expect(middleware()).resolves.toEqual({ redirectTo: "/" });
    expect(redirect).toHaveBeenCalledWith("/");
  });
});
