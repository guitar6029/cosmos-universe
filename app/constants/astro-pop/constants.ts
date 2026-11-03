export const MIN_FLAVOR_ID_LENGTH = 1;
export const MIN_QUANTITY_BOTTLES = 1;
export const MAX_QUANTITY_BOTTLES = 6;
export const MIN_CART_ITEMS = 1;
export const MAX_CART_ITEMS = 6;
export const MAX_CRATE_CAPACITY = 6;
export const PRICE_PER_BOTTLE_CENTS = 119;
// Checkout confirmation polling is deliberately bounded to avoid retrying forever.
export const POLL_INTERVAL_MS = 2_000;
export const MAX_STATUS_CHECKS_ATTEMPTS = 10;
