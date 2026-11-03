import { createError, defineEventHandler, getQuery } from "nuxt/server";
import Stripe from "stripe";
import { isAstroPopOrderRecorded } from "../../../utils/astroPopDatabase";
import {
  checkoutSessionIdSchema,
  getAstroPopCheckoutStatus,
} from "../../../utils/astroPopCheckoutVerification";
import { isAstroPopGuestCheckoutAuthorized } from "../../../utils/astroPopGuestCheckout";

/**
 * Reports whether an Astro Pop Checkout Session is paid and has been recorded
 * by the Stripe webhook, without changing either external system.
 */
export default defineEventHandler(async (event) => {
  const parsedQuery = checkoutSessionIdSchema.safeParse(getQuery(event).session_id);

  if (!parsedQuery.success) {
    throw createError({ status: 400, statusText: "Invalid checkout session ID" });
  }

  const secretKey = process.env.ASTROPOP_STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw createError({ status: 500, statusText: "Stripe checkout is not configured" });
  }

  const stripe = new Stripe(secretKey);
  let session: Stripe.Checkout.Session;

  try {
    // Stripe is authoritative for payment. Do not query Neon for unpaid sessions.
    session = await stripe.checkout.sessions.retrieve(parsedQuery.data);
  } catch (error) {
    if (
      error instanceof Stripe.errors.StripeInvalidRequestError &&
      error.code === "resource_missing"
    ) {
      throw createError({ status: 404, statusText: "Checkout session not found" });
    }

    throw createError({ status: 502, statusText: "Unable to retrieve checkout session" });
  }

  if (session.mode !== "payment" || session.metadata?.astro_pop_order !== "true") {
    throw createError({ status: 404, statusText: "Checkout session not found" });
  }

  /**
   * Verify that this browser initiated the checkout.
   * A valid Stripe Session ID alone does not grant access.
   */
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

  const paymentIsComplete = session.status === "complete" && session.payment_status === "paid";
  if (!paymentIsComplete) {
    // Unpaid checkouts cannot have a webhook-persisted order, so skip Neon.
    return getAstroPopCheckoutStatus(session);
  }

  try {
    const orderRecorded = await isAstroPopOrderRecorded(session.id);
    return getAstroPopCheckoutStatus(session, orderRecorded);
  } catch {
    // Neon outages are distinct from a missing order, so do not claim either.
    return getAstroPopCheckoutStatus(session);
  }
});
