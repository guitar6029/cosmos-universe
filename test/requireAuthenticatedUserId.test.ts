import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn() }));

vi.mock("../server/utils/getClerkAuth", () => ({ getClerkAuth: mocks.auth }));

describe("requireAuthenticatedUserId", () => {
  let requireAuthenticatedUserId: typeof import("../server/utils/requireAuthenticatedUserId").requireAuthenticatedUserId;
  const event = {} as Parameters<typeof requireAuthenticatedUserId>[0];

  beforeAll(async () => {
    ({ requireAuthenticatedUserId } = await import("../server/utils/requireAuthenticatedUserId"));
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the server-verified Clerk user ID", () => {
    mocks.auth.mockReturnValue({ isAuthenticated: true, userId: "user_123" });

    expect(requireAuthenticatedUserId(event)).toBe("user_123");
  });

  it.each([
    { isAuthenticated: false, userId: null },
    { isAuthenticated: true, userId: "" },
    { isAuthenticated: true, userId: "  " },
    { isAuthenticated: true, userId: null },
  ])("returns 401 for an invalid Clerk session", (auth) => {
    mocks.auth.mockReturnValue(auth);

    expect(() => requireAuthenticatedUserId(event)).toThrowError("Unauthorized");
    expect(() => requireAuthenticatedUserId(event)).toThrow(
      expect.objectContaining({ statusCode: 401 }),
    );
  });

  it("fails closed when Clerk session validation throws", () => {
    mocks.auth.mockImplementation(() => {
      throw new Error("Clerk context unavailable");
    });

    expect(() => requireAuthenticatedUserId(event)).toThrowError("Unauthorized");
    expect(() => requireAuthenticatedUserId(event)).toThrow(
      expect.objectContaining({ statusCode: 401 }),
    );
  });
});
