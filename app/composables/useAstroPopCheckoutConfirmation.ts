import { onUnmounted, ref, type Ref } from "vue";
import type { AstroPopCheckoutStatus } from "../../shared/astroPopCheckoutStatus";
import { MAX_STATUS_CHECKS_ATTEMPTS, POLL_INTERVAL_MS } from "../constants/astro-pop/constants";
import type { useAstroPopCrateStore } from "../stores/astroPopCrate";
import {
  clearPendingAstroPopCheckout,
  completeVerifiedAstroPopCheckout,
  getCompletedAstroPopCheckout,
  getPendingAstroPopCheckout,
  saveCompletedAstroPopCheckout,
} from "../utils/astroPopCheckout";

export type AstroPopConfirmationState =
  | "checking"
  | "confirmed"
  | "payment-pending"
  | "payment-received"
  | "payment-received-recording-unknown"
  | "unpaid"
  | "unavailable"
  | "unauthorized"
  | "unrecognized";
export type AstroPopCheckoutFinalOutcome = Exclude<AstroPopConfirmationState, "checking">;
export type AstroPopCartCompletion = "cleared" | "preserved" | "untouched" | null;
type AstroPopCrateStore = ReturnType<typeof useAstroPopCrateStore>;
type FetchCheckoutStatus = (sessionId: string, signal: AbortSignal) => Promise<unknown>;

export interface AstroPopCheckoutConfirmationOptions {
  sessionId?: string | undefined;
  crateStore: AstroPopCrateStore;
  fetchStatus?: FetchCheckoutStatus;
}

export interface AstroPopCheckoutConfirmation {
  status: Ref<AstroPopConfirmationState>;
  finalOutcome: Ref<AstroPopCheckoutFinalOutcome | null>;
  cartCompletion: Ref<AstroPopCartCompletion>;
  start: () => void;
}

const hasExpectedStatusShape = (value: unknown): value is AstroPopCheckoutStatus => {
  if (!value || typeof value !== "object") return false;
  const status = value as Record<string, unknown>;
  return (
    ["paid", "pending", "unpaid", "unknown"].includes(String(status.paymentStatus)) &&
    ["recorded", "not_recorded", "not_checked", "unknown"].includes(String(status.orderStatus)) &&
    typeof status.orderConfirmed === "boolean"
  );
};

const isUnauthorizedError = (error: unknown) => {
  const fetchError = error as { statusCode?: number; response?: { status?: number } };
  return fetchError.statusCode === 403 || fetchError.response?.status === 403;
};

const statusFor = (checkoutStatus: AstroPopCheckoutStatus): AstroPopCheckoutFinalOutcome => {
  if (checkoutStatus.paymentStatus === "paid") {
    if (checkoutStatus.orderConfirmed && checkoutStatus.orderStatus === "recorded")
      return "confirmed";
    return checkoutStatus.orderStatus === "not_recorded"
      ? "payment-received"
      : "payment-received-recording-unknown";
  }
  if (checkoutStatus.paymentStatus === "pending") return "payment-pending";
  if (checkoutStatus.paymentStatus === "unpaid") return "unpaid";
  return "unavailable";
};

/** Confirms a recognized browser checkout; state and cleanup are instance-local. */
export const useAstroPopCheckoutConfirmation = ({
  sessionId,
  crateStore,
  fetchStatus = (id, signal) =>
    $fetch<AstroPopCheckoutStatus>("/api/astro-pop/checkout/status", {
      query: { session_id: id },
      signal,
      retry: false,
    }),
}: AstroPopCheckoutConfirmationOptions): AstroPopCheckoutConfirmation => {
  const status = ref<AstroPopConfirmationState>("checking");
  const finalOutcome = ref<AstroPopCheckoutFinalOutcome | null>(null);
  const cartCompletion = ref<AstroPopCartCompletion>(null);
  let attempts = 0;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let activeRequest: AbortController | undefined;
  let disposed = false;
  let checkoutCompleted = false;

  const finish = (outcome: AstroPopCheckoutFinalOutcome) => {
    if (disposed) return;
    status.value = outcome;
    finalOutcome.value = outcome;
  };

  const completeCart = () => {
    if (checkoutCompleted || !sessionId) return;
    const pendingCheckout = getPendingAstroPopCheckout();
    const completedCheckout = getCompletedAstroPopCheckout();
    if (pendingCheckout?.sessionId === sessionId) {
      const result = completeVerifiedAstroPopCheckout(crateStore, pendingCheckout, {
        sessionId,
        verified: true,
      });
      if (!result) throw new Error("Checkout could not be completed");
      saveCompletedAstroPopCheckout(sessionId);
      clearPendingAstroPopCheckout();
      checkoutCompleted = true;
      cartCompletion.value = result;
      return;
    }
    if (completedCheckout?.sessionId === sessionId) {
      checkoutCompleted = true;
      cartCompletion.value = "untouched";
      return;
    }
    throw new Error("Checkout no longer matches this browser");
  };

  const checkStatus = async () => {
    if (disposed || activeRequest || attempts >= MAX_STATUS_CHECKS_ATTEMPTS || !sessionId) return;
    attempts += 1;
    const controller = new AbortController();
    activeRequest = controller;
    try {
      const result = await fetchStatus(sessionId, controller.signal);
      if (disposed) return;
      if (!hasExpectedStatusShape(result)) throw new Error("Invalid checkout status");
      if (result.paymentStatus === "paid") completeCart();
      if (disposed) return;
      const nextStatus = statusFor(result);
      status.value = nextStatus;
      const shouldRetry =
        result.paymentStatus === "paid" &&
        (result.orderStatus === "not_recorded" || result.orderStatus === "unknown");
      if (shouldRetry && attempts < MAX_STATUS_CHECKS_ATTEMPTS && !disposed) {
        if (activeRequest === controller) activeRequest = undefined;
        retryTimer = setTimeout(() => {
          retryTimer = undefined;
          void checkStatus();
        }, POLL_INTERVAL_MS);
      } else {
        finish(nextStatus);
      }
    } catch (error) {
      if (disposed || controller.signal.aborted) return;
      if (isUnauthorizedError(error)) {
        finish("unauthorized");
        return;
      }

      // Stripe already verified payment on an earlier attempt. A later transient
      // refresh failure must not replace that fact with an unavailable message.
      if (
        status.value === "payment-received" ||
        status.value === "payment-received-recording-unknown"
      ) {
        finish(status.value);
        return;
      }

      finish("unavailable");
    } finally {
      if (activeRequest === controller) activeRequest = undefined;
    }
  };

  const start = () => {
    if (!sessionId) {
      finish("unavailable");
      return;
    }

    const pendingCheckout = getPendingAstroPopCheckout();
    const completedCheckout = getCompletedAstroPopCheckout();
    if (
      !sessionId ||
      (pendingCheckout?.sessionId !== sessionId && completedCheckout?.sessionId !== sessionId)
    ) {
      finish("unrecognized");
      return;
    }
    void checkStatus();
  };

  onUnmounted(() => {
    disposed = true;
    if (retryTimer !== undefined) clearTimeout(retryTimer);
    activeRequest?.abort();
  });

  return { status, finalOutcome, cartCompletion, start };
};
