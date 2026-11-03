import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAstroPopGuestCredential,
  getAstroPopGuestCredential,
  getAstroPopGuestFingerprint,
  getOrCreateAstroPopGuestCredential,
  isAstroPopGuestCheckoutAuthorized,
} from "../server/utils/astroPopGuestCheckout";

const mocks = vi.hoisted(() => ({
  getCookie: vi.fn(),
  setCookie: vi.fn(),
}));

vi.mock("nuxt/server", () => ({
  getCookie: mocks.getCookie,
  setCookie: mocks.setCookie,
}));

const validCredential = "a".repeat(43);
const event = {};

describe("Astro Pop guest checkout credentials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates URL-safe credentials from 32 cryptographically random bytes", () => {
    const credential = createAstroPopGuestCredential();

    expect(credential).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("reuses an existing valid credential without replacing its cookie", () => {
    mocks.getCookie.mockReturnValue(validCredential);

    expect(getOrCreateAstroPopGuestCredential(event)).toBe(validCredential);
    expect(mocks.setCookie).not.toHaveBeenCalled();
  });

  it("rejects malformed credentials and replaces them with a valid one", () => {
    mocks.getCookie.mockReturnValue("not-a-valid-credential");

    expect(getAstroPopGuestCredential(event)).toBeUndefined();
    expect(getOrCreateAstroPopGuestCredential(event)).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(mocks.setCookie).toHaveBeenCalledWith(
      event,
      "astropop-guest-dev",
      expect.stringMatching(/^[A-Za-z0-9_-]{43}$/),
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      },
    );
  });

  it("returns a deterministic SHA-256 fingerprint", () => {
    expect(getAstroPopGuestFingerprint("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("authorizes only a matching credential fingerprint", () => {
    mocks.getCookie.mockReturnValue(validCredential);
    const fingerprint = getAstroPopGuestFingerprint(validCredential);

    expect(isAstroPopGuestCheckoutAuthorized(event, fingerprint)).toBe(true);
    expect(isAstroPopGuestCheckoutAuthorized(event, "b".repeat(64))).toBe(false);
  });

  it("rejects missing, malformed, and absent metadata credentials", () => {
    mocks.getCookie.mockReturnValue(undefined);
    expect(isAstroPopGuestCheckoutAuthorized(event, "a".repeat(64))).toBe(false);

    mocks.getCookie.mockReturnValue("invalid");
    expect(isAstroPopGuestCheckoutAuthorized(event, "a".repeat(64))).toBe(false);

    mocks.getCookie.mockReturnValue(validCredential);
    expect(isAstroPopGuestCheckoutAuthorized(event, undefined)).toBe(false);
    expect(isAstroPopGuestCheckoutAuthorized(event, "invalid")).toBe(false);
  });
});
