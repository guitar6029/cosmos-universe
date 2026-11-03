// @vitest-environment jsdom
import { createApp, defineComponent, h, nextTick, type App } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia } from "pinia";
import { MAX_STATUS_CHECKS_ATTEMPTS, POLL_INTERVAL_MS } from "../app/constants/astro-pop/constants";
import {
  useAstroPopCheckoutConfirmation,
  type AstroPopCheckoutConfirmation,
} from "../app/composables/useAstroPopCheckoutConfirmation";
import { ASTROPOP_FLAVORS } from "../app/data/astroPopFlavors";
import { useAstroPopCrateStore } from "../app/stores/astroPopCrate";
import {
  getCompletedAstroPopCheckout,
  getPendingAstroPopCheckout,
  saveCompletedAstroPopCheckout,
  savePendingAstroPopCheckout,
} from "../app/utils/astroPopCheckout";

const sessionId = "cs_confirmation";
const cartItems = [{ flavorId: ASTROPOP_FLAVORS[0].id, quantity: 2 }];
const paidNotRecorded = {
  paymentStatus: "paid",
  orderStatus: "not_recorded",
  orderConfirmed: false,
};
const paidUnknown = { paymentStatus: "paid", orderStatus: "unknown", orderConfirmed: false };
const paidRecorded = { paymentStatus: "paid", orderStatus: "recorded", orderConfirmed: true };
const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};
const nextPoll = async () => {
  await flush();
  await vi.runOnlyPendingTimersAsync();
  await flush();
};

describe("useAstroPopCheckoutConfirmation", () => {
  let app: App<Element> | undefined;
  let confirmation: AstroPopCheckoutConfirmation;

  const mount = (
    fetchStatus: (id: string, signal: AbortSignal) => Promise<unknown>,
    id = sessionId,
  ) => {
    const Host = defineComponent({
      setup() {
        confirmation = useAstroPopCheckoutConfirmation({
          sessionId: id,
          crateStore: useAstroPopCrateStore(),
          fetchStatus,
        });
        confirmation.start();
        return () => h("div");
      },
    });
    app = createApp(Host);
    app.use(createPinia());
    app.mount(document.createElement("div"));
  };

  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.localStorage.setItem("astropop-crate", JSON.stringify(cartItems));
    savePendingAstroPopCheckout(sessionId, cartItems);
  });

  afterEach(() => {
    app?.unmount();
    app = undefined;
    vi.useRealTimers();
  });

  it("confirms immediately, completes the matching cart once, and makes no further requests", async () => {
    const fetchStatus = vi.fn().mockResolvedValue(paidRecorded);
    mount(fetchStatus);
    await nextTick();
    await flush();
    expect(confirmation.status.value).toBe("confirmed");
    expect(confirmation.finalOutcome.value).toBe("confirmed");
    expect(confirmation.cartCompletion.value).toBe("cleared");
    expect(getPendingAstroPopCheckout()).toBeNull();
    expect(getCompletedAstroPopCheckout()).toEqual({ sessionId });
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2);
    expect(fetchStatus).toHaveBeenCalledTimes(1);
  });

  it.each([paidNotRecorded, paidUnknown])(
    "retries paid %o states and confirms a later recorded order",
    async (first) => {
      const fetchStatus = vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(paidRecorded);
      mount(fetchStatus);
      await nextPoll();
      expect(fetchStatus).toHaveBeenCalledTimes(2);
      expect(confirmation.status.value).toBe("confirmed");
      expect(confirmation.finalOutcome.value).toBe("confirmed");
      expect(confirmation.cartCompletion.value).toBe("cleared");
      await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2);
      expect(fetchStatus).toHaveBeenCalledTimes(2);
    },
  );

  it("does not expose a final outcome while paid recording verification is still polling", async () => {
    const fetchStatus = vi
      .fn()
      .mockResolvedValueOnce(paidNotRecorded)
      .mockResolvedValueOnce(paidRecorded);

    mount(fetchStatus);
    await flush();

    expect(confirmation.status.value).toBe("payment-received");
    expect(confirmation.finalOutcome.value).toBeNull();
    await nextPoll();
    expect(confirmation.finalOutcome.value).toBe("confirmed");
  });

  it("keeps a verified paid-not-recorded state after a later refresh failure", async () => {
    const fetchStatus = vi
      .fn()
      .mockResolvedValueOnce(paidNotRecorded)
      .mockRejectedValueOnce(new Error("Stripe unavailable"));
    mount(fetchStatus);
    await flush();
    expect(confirmation.status.value).toBe("payment-received");
    expect(confirmation.finalOutcome.value).toBeNull();
    expect(confirmation.cartCompletion.value).toBe("cleared");
    await nextPoll();
    expect(confirmation.status.value).toBe("payment-received");
    expect(confirmation.finalOutcome.value).toBe("payment-received");
    expect(confirmation.cartCompletion.value).toBe("cleared");
    expect(fetchStatus).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2);
    expect(fetchStatus).toHaveBeenCalledTimes(2);
  });

  it("keeps a verified paid-unknown-recording state after a later 502", async () => {
    const fetchStatus = vi
      .fn()
      .mockResolvedValueOnce(paidUnknown)
      .mockRejectedValueOnce(Object.assign(new Error("unavailable"), { statusCode: 502 }));
    mount(fetchStatus);
    await nextPoll();
    expect(confirmation.status.value).toBe("payment-received-recording-unknown");
    expect(confirmation.finalOutcome.value).toBe("payment-received-recording-unknown");
    expect(confirmation.cartCompletion.value).toBe("cleared");
    expect(fetchStatus).toHaveBeenCalledTimes(2);
  });

  it("shows unavailable and preserves the cart when the initial request fails", async () => {
    const fetchStatus = vi
      .fn()
      .mockRejectedValue(Object.assign(new Error("unavailable"), { statusCode: 502 }));
    mount(fetchStatus);
    await flush();
    expect(confirmation.status.value).toBe("unavailable");
    expect(confirmation.finalOutcome.value).toBe("unavailable");
    expect(confirmation.cartCompletion.value).toBeNull();
    expect(getCompletedAstroPopCheckout()).toBeNull();
    expect(window.localStorage.getItem("astropop-crate")).toBe(JSON.stringify(cartItems));
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2);
    expect(fetchStatus).toHaveBeenCalledTimes(1);
  });

  it("hides paid checkout details when authorization is revoked on a later request", async () => {
    const fetchStatus = vi
      .fn()
      .mockResolvedValueOnce(paidNotRecorded)
      .mockRejectedValueOnce(Object.assign(new Error("forbidden"), { statusCode: 403 }));
    mount(fetchStatus);
    await nextPoll();
    expect(confirmation.status.value).toBe("unauthorized");
    expect(confirmation.cartCompletion.value).toBe("cleared");
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2);
    expect(fetchStatus).toHaveBeenCalledTimes(2);
  });

  it("bounds retries, leaves the final paid message visible, and schedules no final timer", async () => {
    const fetchStatus = vi.fn().mockResolvedValue(paidNotRecorded);
    mount(fetchStatus);
    for (let attempt = 1; attempt < MAX_STATUS_CHECKS_ATTEMPTS; attempt += 1) await nextPoll();
    expect(fetchStatus).toHaveBeenCalledTimes(MAX_STATUS_CHECKS_ATTEMPTS);
    expect(confirmation.status.value).toBe("payment-received");
    expect(confirmation.finalOutcome.value).toBe("payment-received");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not overlap requests and aborts a pending request on unmount", async () => {
    let resolve!: (value: unknown) => void;
    let signal!: AbortSignal;
    const fetchStatus = vi.fn((_id: string, requestSignal: AbortSignal) => {
      signal = requestSignal;
      return new Promise((done) => {
        resolve = done;
      });
    });
    mount(fetchStatus);
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 3);
    expect(fetchStatus).toHaveBeenCalledTimes(1);
    app?.unmount();
    expect(signal.aborted).toBe(true);
    resolve(paidRecorded);
    await flush();
    expect(confirmation.status.value).toBe("checking");
    expect(confirmation.finalOutcome.value).toBeNull();
  });

  it.each([
    [Object.assign(new Error("forbidden"), { statusCode: 403 }), "unauthorized"],
    [{ paymentStatus: "mystery" }, "unavailable"],
    [new Error("offline"), "unavailable"],
    [
      { paymentStatus: "pending", orderStatus: "not_checked", orderConfirmed: false },
      "payment-pending",
    ],
    [{ paymentStatus: "unpaid", orderStatus: "not_checked", orderConfirmed: false }, "unpaid"],
  ])("stops safely for terminal or invalid response %o", async (response, expected) => {
    const fetchStatus = vi
      .fn()
      .mockImplementation(() =>
        response instanceof Error ? Promise.reject(response) : Promise.resolve(response),
      );
    mount(fetchStatus);
    await flush();
    expect(confirmation.status.value).toBe(expected);
    expect(confirmation.finalOutcome.value).toBe(expected);
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2);
    expect(fetchStatus).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem("astropop-crate")).toBe(JSON.stringify(cartItems));
  });

  it("preserves changed carts and completed checkout refreshes", async () => {
    window.localStorage.setItem(
      "astropop-crate",
      JSON.stringify([{ ...cartItems[0], quantity: 3 }]),
    );
    mount(vi.fn().mockResolvedValue(paidRecorded));
    await flush();
    expect(confirmation.cartCompletion.value).toBe("preserved");
    app?.unmount();
    app = undefined;
    saveCompletedAstroPopCheckout(sessionId);
    window.localStorage.setItem("astropop-crate", JSON.stringify(cartItems));
    mount(vi.fn().mockResolvedValue(paidRecorded));
    await flush();
    expect(confirmation.cartCompletion.value).toBe("untouched");
  });
});
