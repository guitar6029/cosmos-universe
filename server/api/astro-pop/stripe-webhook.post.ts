import Stripe from "stripe";
import { persistAstroPopOrder } from "../../utils/astroPopDatabase";
import { getAstroPopOrderFromStripe } from "../../utils/astroPopOrderPersistence";
import { constructAstroPopStripeEvent } from "../../utils/astroPopStripeWebhook";

const STRIPE_SESSION_COMPLETED = "checkout.session.completed";
const STRIPE_ASYNC_PAYMENT_SUCCEEDED = "checkout.session.async_payment_succeeded";
const STRIPE_PAYMENT_STATUS_PAID = "paid";

export default defineEventHandler(async (event) => {
  const secretKey = process.env.ASTROPOP_STRIPE_SECRET_KEY;
  const webhookSecret = process.env.ASTROPOP_STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    throw createError({
      status: 500,
      statusText: "Stripe webhook is not configured",
    });
  }

  const stripe = new Stripe(secretKey);

  // read the original payload and stripe signature
  const rawBody = await readRawBody(event);
  const signature = getHeader(event, "stripe-signature");

  if (!rawBody || !signature) {
    throw createError({
      status: 400,
      statusText: "Missing webhook payload or signature",
    });
  }

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = constructAstroPopStripeEvent(stripe, rawBody, signature, webhookSecret);
  } catch {
    throw createError({
      status: 400,
      statusText: "Invalid Stripe webhook signature",
    });
  }

  if (
    stripeEvent.type === STRIPE_SESSION_COMPLETED ||
    stripeEvent.type === STRIPE_ASYNC_PAYMENT_SUCCEEDED
  ) {
    const session = stripeEvent.data.object;

    if (session.payment_status === STRIPE_PAYMENT_STATUS_PAID) {
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          expand: ["data.price.product"],
        });
        const order = getAstroPopOrderFromStripe(session, lineItems.data);
        await persistAstroPopOrder(order);
      } catch {
        throw createError({
          status: 500,
          statusText: "Astro Pop order persistence failed",
        });
      }
    }
  }

  return { received: true };
});
