import type Stripe from "stripe";
import { z } from "zod";
import type { AstroPopCheckoutStatus } from "../../shared/astroPopCheckoutStatus";

export type {
  AstroPopCheckoutStatus,
  AstroPopOrderStatus,
  AstroPopPaymentStatus,
} from "../../shared/astroPopCheckoutStatus";

export const checkoutSessionIdSchema = z
  .string()
  .regex(/^cs_[A-Za-z0-9_]+$/, "Invalid checkout session ID")
  .max(255);

export const getCheckoutVerificationResult = (
  sessionId: string,
  session: Pick<Stripe.Checkout.Session, "mode" | "status" | "payment_status">,
) => ({
  sessionId,
  verified:
    session.mode === "payment" &&
    session.status === "complete" &&
    session.payment_status === "paid",
});

type CheckoutStatusSession = Pick<
  Stripe.Checkout.Session,
  "status" | "payment_status"
>;

/**
 * Maps Stripe's Checkout state and the optional Neon lookup result into the
 * deliberately small status response exposed by the Astro Pop endpoint.
 */
export function getAstroPopCheckoutStatus(
  session: CheckoutStatusSession,
  orderRecorded?: boolean,
): AstroPopCheckoutStatus {
  if (session.status === "complete" && session.payment_status === "paid") {
    if (orderRecorded === true) {
      // Confirm only after both Stripe payment and webhook persistence are known.
      return { paymentStatus: "paid", orderStatus: "recorded", orderConfirmed: true };
    }

    if (orderRecorded === false) {
      return { paymentStatus: "paid", orderStatus: "not_recorded", orderConfirmed: false };
    }

    return { paymentStatus: "paid", orderStatus: "unknown", orderConfirmed: false };
  }

  if (session.status === "complete" && session.payment_status === "unpaid") {
    return { paymentStatus: "pending", orderStatus: "not_checked", orderConfirmed: false };
  }

  if (
    (session.status === "open" || session.status === "expired") &&
    session.payment_status === "unpaid"
  ) {
    return { paymentStatus: "unpaid", orderStatus: "not_checked", orderConfirmed: false };
  }

  return { paymentStatus: "unknown", orderStatus: "not_checked", orderConfirmed: false };
}
