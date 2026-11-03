// @vitest-environment jsdom
import { createApp, defineComponent, h, nextTick } from "vue";
import { createPinia } from "pinia";
import { describe, expect, it } from "vitest";
import { ASTROPOP_FLAVORS } from "../app/data/astroPopFlavors";
import AstroPopCartPage from "../app/pages/app/astro-pop/cart.vue";
import { useAstroPopCrateStore } from "../app/stores/astroPopCrate";

const mountCart = (quantity = 2, otherQuantity = 0) => {
  window.localStorage.clear();
  const pinia = createPinia();
  const store = useAstroPopCrateStore(pinia);
  store.restoreFromStorage();
  store.addItem(ASTROPOP_FLAVORS[0].id, quantity);
  if (otherQuantity) {
    store.addItem(ASTROPOP_FLAVORS[1].id, otherQuantity);
  }

  const container = document.createElement("div");
  const app = createApp(AstroPopCartPage);
  app.use(pinia);
  app.component(
    "NuxtLink",
    defineComponent({
      props: { to: { type: String, required: true } },
      setup(props, { slots }) {
        return () => h("a", { href: props.to }, slots.default?.());
      },
    }),
  );
  document.body.appendChild(container);
  app.mount(container);

  return { app, container, store };
};

const changeQuantity = async (input: HTMLInputElement, value: string) => {
  input.value = value;
  input.dispatchEvent(new Event("change", { bubbles: true }));
  await nextTick();
};

describe("AstroPop cart manual quantity input", () => {
  it("restores the previous quantity for blank, invalid, negative, fractional, and over-capacity input", async () => {
    const { app, container, store } = mountCart(2, 3);
    const input = container.querySelector<HTMLInputElement>("#quantity-atomic-cherry-fizz");
    expect(input).not.toBeNull();

    for (const invalidValue of ["", "two", "-1", "1.5", "4"]) {
      await changeQuantity(input!, invalidValue);
      expect(store.items[0]?.quantity).toBe(2);
      expect(input!.value).toBe("2");
      expect(store.totalBottles).toBe(5);
    }

    app.unmount();
    container.remove();
  });

  it("allows intentional zero quantity to remove the bottle", async () => {
    const { app, container, store } = mountCart();
    const input = container.querySelector<HTMLInputElement>("#quantity-atomic-cherry-fizz");
    expect(input).not.toBeNull();

    await changeQuantity(input!, "0");
    expect(store.isEmpty).toBe(true);
    expect(container.textContent).toContain("Your rocket crate is ready for liftoff.");

    app.unmount();
    container.remove();
  });

  it("disables cart mutation controls while checkout initialization is locked", async () => {
    const { app, container, store } = mountCart();
    store.lockCheckout();
    await nextTick();

    expect(
      container.querySelector<HTMLInputElement>("#quantity-atomic-cherry-fizz")?.disabled,
    ).toBe(true);
    expect(
      container.querySelector<HTMLButtonElement>(".astropop-cart-item__remove")?.disabled,
    ).toBe(true);
    expect(
      [
        ...container.querySelectorAll<HTMLButtonElement>(
          ".astropop-cart-item__quantity-controls button",
        ),
      ].every((button) => button.disabled),
    ).toBe(true);

    store.unlockCheckout();
    await nextTick();
    expect(
      container.querySelector<HTMLInputElement>("#quantity-atomic-cherry-fizz")?.disabled,
    ).toBe(false);

    app.unmount();
    container.remove();
  });
});
