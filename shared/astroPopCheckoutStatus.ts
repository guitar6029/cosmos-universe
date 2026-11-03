export type AstroPopPaymentStatus = "paid" | "pending" | "unpaid" | "unknown";
export type AstroPopOrderStatus = "recorded" | "not_recorded" | "not_checked" | "unknown";

export interface AstroPopCheckoutStatus {
  paymentStatus: AstroPopPaymentStatus;
  orderStatus: AstroPopOrderStatus;
  orderConfirmed: boolean;
}
