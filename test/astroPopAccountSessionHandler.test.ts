import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("nuxt/server", () => ({
  defineEventHandler: <T>(handler: T) => handler,
  createError: ({ status, statusText }: { status: number; statusText: string }) =>
    Object.assign(new Error(statusText), { statusCode: status }),
}));
vi.mock("../server/utils/getClerkAuth", () => ({ getClerkAuth: mocks.auth }));
type Event = { res: { headers: Headers }; context: Record<string, unknown> };

describe("Astro Pop account session guard endpoint", () => {
  let handler: (event: Event) => unknown;
  beforeAll(async () => {
    handler = (await import("../server/api/astro-pop/account/session.get"))
      .default as typeof handler;
  });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects signed-out visitors", () => {
    mocks.auth.mockReturnValue({ isAuthenticated: false, userId: null });
    const event: Event = { res: { headers: new Headers() }, context: {} };
    expect(() => handler(event)).toThrowError("Unauthorized");
    expect(event.res.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("allows verified users without returning their identifier", () => {
    mocks.auth.mockReturnValue({ isAuthenticated: true, userId: "user_123" });
    const event: Event = { res: { headers: new Headers() }, context: {} };
    expect(handler(event)).toEqual({ authenticated: true });
  });
});
