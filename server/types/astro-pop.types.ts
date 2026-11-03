export interface AstroPopOrderItem {
  flavorId: string;
  flavorName: string;
  quantity: number;
  unitPriceCents: number;
}

export interface AstroPopOrder {
  clerkUserId: string | null;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  customerEmail: string;
  totalCents: number;
  currency: string;
  items: readonly AstroPopOrderItem[];
}

export interface AstroPopOrderHistoryItem {
  flavorId: string;
  flavorName: string;
  quantity: number;
  unitPriceCents: number;
}

export interface AstroPopOrderHistory {
  id: string;
  createdAt: string;
  totalCents: number;
  currency: string;
  status: string;
  paymentStatus: string;
  items: AstroPopOrderHistoryItem[];
}

/**
 * Customer-safe representation of a persisted order. Deliberately excludes
 * Stripe and customer identifiers; callers only need the order record and
 * its historical line-item prices.
 */
export interface AstroPopOrderDetail {
  id: string;
  createdAt: string;
  totalCents: number;
  currency: string;
  status: string;
  paymentStatus: string;
  items: AstroPopOrderHistoryItem[];
}
