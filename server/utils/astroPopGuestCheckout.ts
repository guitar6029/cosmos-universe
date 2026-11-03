import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { getCookie, setCookie, type RequestEvent } from "nuxt/server";

const isProduction = process.env.NODE_ENV === "production";

const GUEST_COOKIE_NAME = isProduction ? "__Host-astropop-guest" : "astropop-guest-dev";

const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const GUEST_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const guestCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
  maxAge: GUEST_COOKIE_MAX_AGE,
};

export function getAstroPopGuestCredential(event: RequestEvent): string | undefined {
  const credential = getCookie(event, GUEST_COOKIE_NAME);
  return credential && GUEST_TOKEN_PATTERN.test(credential) ? credential : undefined;
}

export function createAstroPopGuestCredential(): string {
  return randomBytes(32).toString("base64url");
}

export function setAstroPopGuestCredential(event: RequestEvent, credential: string): void {
  setCookie(event, GUEST_COOKIE_NAME, credential, guestCookieOptions);
}

/**
 * Returns this browser's guest checkout credential,
 * creating one if necessary.
 *
 * The cookie is intentionally inaccessible to frontend JS.
 */
export function getOrCreateAstroPopGuestCredential(event: RequestEvent): string {
  const existing = getAstroPopGuestCredential(event);

  if (existing) {
    return existing;
  }

  const credential = createAstroPopGuestCredential();
  setAstroPopGuestCredential(event, credential);

  return credential;
}

/**
 * Creates the fingerprint stored in Stripe metadata.
 * Never send the raw guest credential to Stripe.
 */
export function getAstroPopGuestFingerprint(credential: string): string {
  return createHash("sha256").update(credential).digest("hex");
}

/**
 * Verifies that the requesting browser owns the guest
 * credential associated with this Stripe Checkout Session.
 */
export function isAstroPopGuestCheckoutAuthorized(
  event: RequestEvent,
  expectedFingerprint: string | undefined,
): boolean {
  const credential = getAstroPopGuestCredential(event);

  if (!credential || !expectedFingerprint || !/^[a-f0-9]{64}$/.test(expectedFingerprint)) {
    return false;
  }

  const actual = Buffer.from(getAstroPopGuestFingerprint(credential), "hex");

  const expected = Buffer.from(expectedFingerprint, "hex");

  return timingSafeEqual(actual, expected);
}
