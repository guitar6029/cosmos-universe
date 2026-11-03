// @vitest-environment jsdom
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ASTROPOP_FLAVORS } from "../app/data/astroPopFlavors";
import { useAstroPopCrateStore } from "../app/stores/astroPopCrate";

describe("AstroPop cart persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
    setActivePinia(createPinia());
  });

  it("restores valid saved bottles and persists subsequent cart changes", () => {
    window.localStorage.setItem(
      "astropop-crate",
      JSON.stringify([
        { flavorId: ASTROPOP_FLAVORS[0].id, quantity: 2 },
        { flavorId: ASTROPOP_FLAVORS[1].id, quantity: 1 },
      ]),
    );
    const store = useAstroPopCrateStore();

    expect(store.restoreFromStorage()).toBe(true);
    expect(store.totalBottles).toBe(3);

    store.addItem(ASTROPOP_FLAVORS[2].id);
    expect(JSON.parse(window.localStorage.getItem("astropop-crate") ?? "[]")).toEqual([
      { flavorId: ASTROPOP_FLAVORS[0].id, quantity: 2 },
      { flavorId: ASTROPOP_FLAVORS[1].id, quantity: 1 },
      { flavorId: ASTROPOP_FLAVORS[2].id, quantity: 1 },
    ]);
  });

  it("ignores malformed and over-capacity saved entries", () => {
    window.localStorage.setItem(
      "astropop-crate",
      JSON.stringify([
        { flavorId: "unknown", quantity: 1 },
        { flavorId: ASTROPOP_FLAVORS[0].id, quantity: 6 },
        { flavorId: ASTROPOP_FLAVORS[1].id, quantity: 1 },
        { flavorId: ASTROPOP_FLAVORS[2].id, quantity: -1 },
      ]),
    );
    const store = useAstroPopCrateStore();

    store.restoreFromStorage();
    expect(store.items).toEqual([{ flavorId: ASTROPOP_FLAVORS[0].id, quantity: 6 }]);
    expect(store.isFull).toBe(true);
  });

  it("keeps the in-memory cart usable when storage writes fail", () => {
    const storageError = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage unavailable");
    });
    const store = useAstroPopCrateStore();

    store.restoreFromStorage();
    expect(() => store.addItem(ASTROPOP_FLAVORS[0].id)).not.toThrow();
    expect(store.items).toEqual([{ flavorId: ASTROPOP_FLAVORS[0].id, quantity: 1 }]);

    storageError.mockRestore();
  });
});
