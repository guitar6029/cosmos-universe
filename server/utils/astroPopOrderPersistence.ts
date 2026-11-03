import type Stripe from "stripe";
import type { AstroPopOrder, AstroPopOrderItem } from "../types/astro-pop.types";

const ASTROPOP_ORDER_METADATA_KEY = "astro_pop_order";
const ASTROPOP_FLAVOR_METADATA_KEY = "astro_pop_flavor_id";

export class AstroPopOrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AstroPopOrderValidationError";
  }
}

const isPositiveInteger = (value: number | null | undefined): value is number => {
  if (value === undefined || value === null) return false;

  return Number.isInteger(value) && value > 0;
};

const getPaymentIntentId = (paymentIntent: Stripe.Checkout.Session["payment_intent"]) => {
  if (!paymentIntent) {
    return null;
  }

  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
};

/**
 * Converts Stripe's signed, server-retrieved session data into the exact
 * database payload. No browser-supplied prices, quantities, or names reach
 * this boundary.
 */
export function getAstroPopOrderFromStripe(
  session: Stripe.Checkout.Session,
  lineItems: readonly Stripe.LineItem[],
): AstroPopOrder {
  if (
    session.mode !== "payment" ||
    session.status !== "complete" ||
    session.payment_status !== "paid" ||
    session.metadata?.[ASTROPOP_ORDER_METADATA_KEY] !== "true"
  ) {
    throw new AstroPopOrderValidationError("Session is not a paid AstroPop checkout");
  }

  // clerk id
  const clerkUserId = session.metadata?.clerk_user_id ?? null;

  const customerEmail = session.customer_details?.email ?? session.customer_email;
  if (!customerEmail) {
    throw new AstroPopOrderValidationError("Paid checkout session is missing a customer email");
  }

  if (!isPositiveInteger(session.amount_total) || !session.currency) {
    throw new AstroPopOrderValidationError("Paid checkout session has invalid payment totals");
  }

  const items = lineItems.map((lineItem): AstroPopOrderItem => {
    const product = lineItem.price?.product;

    const flavorId =
      typeof product === "object" && product !== null && "metadata" in product
        ? product.metadata?.[ASTROPOP_FLAVOR_METADATA_KEY]
        : undefined;

    if (
      !flavorId ||
      !lineItem.description ||
      !isPositiveInteger(lineItem.quantity) ||
      !isPositiveInteger(lineItem.price?.unit_amount)
    ) {
      throw new AstroPopOrderValidationError("Paid checkout session contains an invalid line item");
    }

    return {
      flavorId,
      flavorName: lineItem.description,
      quantity: lineItem.quantity,
      unitPriceCents: lineItem.price.unit_amount,
    };
  });

  if (items.length === 0 || new Set(items.map((item) => item.flavorId)).size !== items.length) {
    throw new AstroPopOrderValidationError(
      "Paid checkout session contains invalid AstroPop flavors",
    );
  }

  const lineItemTotal = items.reduce(
    (total, item) => total + item.quantity * item.unitPriceCents,
    0,
  );
  if (lineItemTotal !== session.amount_total) {
    throw new AstroPopOrderValidationError("Paid checkout session total does not match line items");
  }

  return {
    clerkUserId,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: getPaymentIntentId(session.payment_intent),
    customerEmail,
    totalCents: session.amount_total,
    currency: session.currency,
    items,
  };
}
