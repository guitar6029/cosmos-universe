import type { AstroPopCrateItem, useAstroPopCrateStore } from "../stores/astroPopCrate";

export const PENDING_ASTROPOP_CHECKOUT_STORAGE_KEY = "astropop-pending-checkout";
export const COMPLETED_ASTROPOP_CHECKOUT_STORAGE_KEY = "astropop-completed-checkout";

export interface PendingAstroPopCheckout {
  sessionId: string;
  cartItems: AstroPopCrateItem[];
}

export interface CompletedAstroPopCheckout {
  sessionId: string;
}

const cloneItems = (items: readonly AstroPopCrateItem[]) =>
  items
    .map((item) => ({ ...item }))
    .sort((left, right) => left.flavorId.localeCompare(right.flavorId));

export const savePendingAstroPopCheckout = (
  sessionId: string,
  cartItems: readonly AstroPopCrateItem[],
) => {
  window.sessionStorage.setItem(
    PENDING_ASTROPOP_CHECKOUT_STORAGE_KEY,
    JSON.stringify({ sessionId, cartItems: cloneItems(cartItems) }),
  );
};

export const getPendingAstroPopCheckout = (): PendingAstroPopCheckout | null => {
  try {
    const pending: unknown = JSON.parse(
      window.sessionStorage.getItem(PENDING_ASTROPOP_CHECKOUT_STORAGE_KEY) ?? "null",
    );

    if (
      !pending ||
      typeof pending !== "object" ||
      !("sessionId" in pending) ||
      !("cartItems" in pending) ||
      typeof pending.sessionId !== "string" ||
      !Array.isArray(pending.cartItems) ||
      !pending.cartItems.every(
        (item) =>
          item &&
          typeof item === "object" &&
          "flavorId" in item &&
          "quantity" in item &&
          typeof item.flavorId === "string" &&
          typeof item.quantity === "number",
      )
    ) {
      return null;
    }

    return {
      sessionId: pending.sessionId,
      cartItems: cloneItems(pending.cartItems as AstroPopCrateItem[]),
    };
  } catch {
    return null;
  }
};

export const pendingCheckoutMatchesCart = (
  pending: PendingAstroPopCheckout,
  cartItems: AstroPopCrateItem[],
) => JSON.stringify(pending.cartItems) === JSON.stringify(cloneItems(cartItems));

export const clearPendingAstroPopCheckout = () => {
  window.sessionStorage.removeItem(PENDING_ASTROPOP_CHECKOUT_STORAGE_KEY);
};

export const saveCompletedAstroPopCheckout = (sessionId: string) => {
  window.sessionStorage.setItem(
    COMPLETED_ASTROPOP_CHECKOUT_STORAGE_KEY,
    JSON.stringify({ sessionId }),
  );
};

export const getCompletedAstroPopCheckout = (): CompletedAstroPopCheckout | null => {
  try {
    const completed: unknown = JSON.parse(
      window.sessionStorage.getItem(COMPLETED_ASTROPOP_CHECKOUT_STORAGE_KEY) ?? "null",
    );

    if (
      !completed ||
      typeof completed !== "object" ||
      !("sessionId" in completed) ||
      typeof completed.sessionId !== "string"
    ) {
      return null;
    }

    return { sessionId: completed.sessionId };
  } catch {
    return null;
  }
};

type AstroPopCrateStore = Pick<
  ReturnType<typeof useAstroPopCrateStore>,
  "hasRestored" | "items" | "restoreFromStorage" | "clearCrate"
>;

export const completeVerifiedAstroPopCheckout = (
  crateStore: AstroPopCrateStore,
  pendingCheckout: PendingAstroPopCheckout,
  verification: { sessionId: string; verified: boolean },
): "cleared" | "preserved" | null => {
  if (!verification.verified || verification.sessionId !== pendingCheckout.sessionId) {
    return null;
  }

  if (!crateStore.hasRestored) {
    crateStore.restoreFromStorage();
  }

  if (!pendingCheckoutMatchesCart(pendingCheckout, crateStore.items)) {
    return "preserved";
  }

  crateStore.clearCrate();
  window.localStorage.removeItem("astropop-crate");
  return "cleared";
};
