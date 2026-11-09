import Stripe from "stripe";
import {
  checkoutSessionIdSchema,
  getCheckoutVerificationResult,
} from "../../../utils/astroPopCheckoutVerification";
import {
  getAstroPopGuestCredential,
  isAstroPopGuestCheckoutAuthorized,
} from "../../../utils/astroPopGuestCheckout";
import { createError, defineEventHandler, getQuery } from "nuxt/server";
export default defineEventHandler(async (event) => {
  const parsedQuery = checkoutSessionIdSchema.safeParse(getQuery(event).session_id);

  if (!parsedQuery.success) {
    throw createError({
      status: 400,
      statusText: "Invalid checkout session ID",
    });
  }

  // A Checkout Session ID alone must not trigger a Stripe lookup. Legitimate
  // guest returns always have the HttpOnly credential set after session creation.
  if (!getAstroPopGuestCredential(event)) {
    throw createError({ status: 403, statusText: "Checkout access denied" });
  }

  const secretKey = process.env.ASTROPOP_STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw createError({
      status: 500,
      statusText: "Stripe checkout is not configured",
    });
  }

  const stripe = new Stripe(secretKey);

  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.retrieve(parsedQuery.data);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      throw createError({
        status: 404,
        statusText: "Checkout session not found",
      });
    }

    throw createError({
      status: 502,
      statusText: "Unable to verify checkout session",
    });
  }

  // Confirm this is an Astro Pop payment checkout.
  if (session.mode !== "payment" || session.metadata?.astro_pop_order !== "true") {
    throw createError({
      status: 404,
      statusText: "Checkout session not found",
    });
  }

  // Verify that the browser is authorized for this checkout.
  const authorized = isAstroPopGuestCheckoutAuthorized(
    event,
    session.metadata?.astro_pop_guest_fingerprint,
  );

  if (!authorized) {
    throw createError({
      status: 403,
      statusText: "Checkout access denied",
    });
  }

  // Only return payment verification after authorization.
  return getCheckoutVerificationResult(parsedQuery.data, session);
});
