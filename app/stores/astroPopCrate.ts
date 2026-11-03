import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import { ASTROPOP_FLAVORS } from "../data/astroPopFlavors";

export type AstroPopFlavorId = (typeof ASTROPOP_FLAVORS)[number]["id"];

export interface AstroPopCrateItem {
  flavorId: AstroPopFlavorId;
  quantity: number;
}

const CRATE_CAPACITY = 6;
const STORAGE_KEY = "astropop-crate";
const flavorIds = new Set<AstroPopFlavorId>(ASTROPOP_FLAVORS.map((flavor) => flavor.id));

const isValidFlavorId = (flavorId: AstroPopFlavorId) => flavorIds.has(flavorId);

const isValidQuantity = (quantity: number) => Number.isInteger(quantity) && quantity > 0;

export const useAstroPopCrateStore = defineStore("astroPopCrate", () => {
  const items = ref<AstroPopCrateItem[]>([]);
  const hasRestored = ref(false);
  const isCheckoutLocked = ref(false);

  const totalBottles = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0),
  );

  const remainingCapacity = computed(() => CRATE_CAPACITY - totalBottles.value);
  const isFull = computed(() => totalBottles.value === CRATE_CAPACITY);
  const isEmpty = computed(() => items.value.length === 0);

  const addItem = (flavorId: AstroPopFlavorId, quantity = 1): boolean => {
    if (isCheckoutLocked.value) {
      return false;
    }

    if (!isValidFlavorId(flavorId) || !isValidQuantity(quantity)) {
      return false;
    }

    if (quantity > remainingCapacity.value) {
      return false;
    }

    const existingItem = items.value.find((item) => item.flavorId === flavorId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.value.push({ flavorId, quantity });
    }

    return true;
  };

  const decrementItem = (flavorId: AstroPopFlavorId): boolean => {
    if (isCheckoutLocked.value) {
      return false;
    }

    const itemIndex = items.value.findIndex((item) => item.flavorId === flavorId);

    if (itemIndex === -1) {
      return false;
    }

    const item = items.value[itemIndex];

    if (!item) {
      return false;
    }

    if (item.quantity === 1) {
      items.value.splice(itemIndex, 1);
    } else {
      item.quantity -= 1;
    }

    return true;
  };

  const removeItem = (flavorId: AstroPopFlavorId): boolean => {
    if (isCheckoutLocked.value) {
      return false;
    }

    const itemIndex = items.value.findIndex((item) => item.flavorId === flavorId);

    if (itemIndex === -1) {
      return false;
    }

    items.value.splice(itemIndex, 1);
    return true;
  };

  const setItemQuantity = (flavorId: AstroPopFlavorId, quantity: number): boolean => {
    if (isCheckoutLocked.value) {
      return false;
    }

    if (!isValidFlavorId(flavorId) || !Number.isInteger(quantity) || quantity < 0) {
      return false;
    }

    const itemIndex = items.value.findIndex((item) => item.flavorId === flavorId);

    if (itemIndex === -1) {
      return quantity === 0;
    }

    const item = items.value[itemIndex];
    if (!item) {
      return false;
    }

    const allowedQuantity = item.quantity + remainingCapacity.value;
    if (quantity > allowedQuantity) {
      return false;
    }

    if (quantity === 0) {
      items.value.splice(itemIndex, 1);
    } else {
      item.quantity = quantity;
    }

    return true;
  };

  const clearCrate = (): boolean => {
    if (isCheckoutLocked.value) {
      return false;
    }

    if (isEmpty.value) {
      return false;
    }

    items.value.splice(0);
    return true;
  };

  const restoreFromStorage = (): boolean => {
    if (typeof window === "undefined" || hasRestored.value || isCheckoutLocked.value) {
      return false;
    }

    hasRestored.value = true;

    try {
      const savedItems: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");

      if (!Array.isArray(savedItems)) {
        return false;
      }

      const restoredItems: AstroPopCrateItem[] = [];
      let restoredCount = 0;

      for (const savedItem of savedItems) {
        if (
          !savedItem ||
          typeof savedItem !== "object" ||
          !("flavorId" in savedItem) ||
          !("quantity" in savedItem) ||
          typeof savedItem.flavorId !== "string" ||
          typeof savedItem.quantity !== "number" ||
          !isValidFlavorId(savedItem.flavorId as AstroPopFlavorId) ||
          !isValidQuantity(savedItem.quantity) ||
          restoredCount + savedItem.quantity > CRATE_CAPACITY ||
          restoredItems.some((item) => item.flavorId === savedItem.flavorId)
        ) {
          continue;
        }

        restoredItems.push({
          flavorId: savedItem.flavorId as AstroPopFlavorId,
          quantity: savedItem.quantity,
        });
        restoredCount += savedItem.quantity;
      }

      items.value = restoredItems;
      return restoredItems.length > 0;
    } catch {
      return false;
    }
  };

  const lockCheckout = (): boolean => {
    if (isCheckoutLocked.value) {
      return false;
    }

    isCheckoutLocked.value = true;
    return true;
  };

  const unlockCheckout = () => {
    isCheckoutLocked.value = false;
  };

  if (typeof window !== "undefined") {
    watch(
      items,
      (currentItems) => {
        if (hasRestored.value) {
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentItems));
          } catch {
            // Persistence is optional; the in-memory cart remains usable.
          }
        }
      },
      { deep: true, flush: "sync" },
    );
  }

  return {
    items,
    totalBottles,
    remainingCapacity,
    isFull,
    isEmpty,
    hasRestored,
    isCheckoutLocked,
    addItem,
    decrementItem,
    removeItem,
    setItemQuantity,
    clearCrate,
    restoreFromStorage,
    lockCheckout,
    unlockCheckout,
  };
});
