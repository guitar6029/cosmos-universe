// @vitest-environment jsdom
import { createApp, nextTick, ref, type Ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AstroPopNotification } from "../app/composables/astro-pop/useAstroPopNotifications";

let notificationState: Ref<AstroPopNotification[]>;
let nextId = 0;

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetModules();
  notificationState = ref([]);
  nextId = 0;
  vi.stubGlobal("useState", <T>() => notificationState as Ref<T>);
  vi.stubGlobal("crypto", {
    randomUUID: () => `notification-${++nextId}`,
  });
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("AstroPop notifications", () => {
  it("renders each notification asset and stacks multiple notifications", async () => {
    const { useAstroPopNotifications } =
      await import("../app/composables/astro-pop/useAstroPopNotifications");
    const AstroPopNotificationContainer = (
      await import("../app/components/astro-pop/AstroPopNotificationContainer.vue")
    ).default;
    const notifications = useAstroPopNotifications();
    const container = document.createElement("div");
    const app = createApp(AstroPopNotificationContainer);

    document.body.appendChild(container);
    app.mount(container);
    notifications.show({ type: "success", message: "A success message", duration: 0 });
    notifications.show({ type: "error", message: "An error message", duration: 0 });
    notifications.show({ type: "info", message: "An info message", duration: 0 });
    await nextTick();

    expect(container.querySelectorAll(".astro-pop-notification")).toHaveLength(3);
    expect(container.innerHTML).toContain("astro-pop-toast-success.png");
    expect(container.innerHTML).toContain("astro-pop-toast-error.png");
    expect(container.innerHTML).toContain("astro-pop-toast-info.png");
    expect(container.firstElementChild?.className).toContain("pointer-events-none");
    expect(container.querySelectorAll('[role="status"]')).toHaveLength(2);
    expect(container.querySelector('[role="alert"]')).not.toBeNull();

    app.unmount();
    container.remove();
  });

  it("auto-dismisses each notification independently and clears dismissed timers", async () => {
    const { useAstroPopNotifications } =
      await import("../app/composables/astro-pop/useAstroPopNotifications");
    const notifications = useAstroPopNotifications();
    const successId = notifications.show({
      type: "success",
      message: "A success message",
      duration: 800,
    });
    const errorId = notifications.show({
      type: "error",
      message: "An error message",
      duration: 1200,
    });

    if (errorId === undefined) {
      throw new Error("Expected notification to be created");
    }

    expect(notifications.notifications.value).toEqual([
      { id: successId, type: "success", title: "Great news!", message: "A success message" },
      { id: errorId, type: "error", title: "Oh no!", message: "An error message" },
    ]);

    vi.advanceTimersByTime(800);
    expect(notifications.notifications.value).toEqual([
      { id: errorId, type: "error", title: "Oh no!", message: "An error message" },
    ]);

    notifications.dismiss(errorId);
    vi.advanceTimersByTime(1200);
    expect(notifications.notifications.value).toEqual([]);
  });

  it("pauses on pointer interaction and resumes only the remaining time", async () => {
    const { useAstroPopNotifications } =
      await import("../app/composables/astro-pop/useAstroPopNotifications");
    const notifications = useAstroPopNotifications();

    const id = notifications.show({
      type: "success",
      message: "A success message",
      duration: 3000,
    });

    vi.advanceTimersByTime(1800);

    if (id === undefined) {
      throw new Error("Expected notification to be created");
    }

    notifications.pause(id, "pointer");

    vi.advanceTimersByTime(10_000);
    expect(notifications.notifications.value).toHaveLength(1);

    notifications.resume(id, "pointer");
    vi.advanceTimersByTime(1199);
    expect(notifications.notifications.value).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(notifications.notifications.value).toEqual([]);
  });

  it("does not reset time across repeated pointer interactions", async () => {
    const { useAstroPopNotifications } =
      await import("../app/composables/astro-pop/useAstroPopNotifications");
    const notifications = useAstroPopNotifications();

    const id = notifications.show({
      type: "info",
      message: "An info message",
      duration: 1000,
    });

    if (id === undefined) {
      throw new Error("Expected notification to be created");
    }

    vi.advanceTimersByTime(200);
    notifications.pause(id, "pointer");
    vi.advanceTimersByTime(500);
    notifications.resume(id, "pointer");
    vi.advanceTimersByTime(300);
    notifications.pause(id, "pointer");
    vi.advanceTimersByTime(500);
    notifications.resume(id, "pointer");
    vi.advanceTimersByTime(499);
    expect(notifications.notifications.value).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(notifications.notifications.value).toEqual([]);
  });

  it("keeps the timer paused until both pointer and focus interactions end", async () => {
    const { useAstroPopNotifications } =
      await import("../app/composables/astro-pop/useAstroPopNotifications");
    const notifications = useAstroPopNotifications();
    const id = notifications.show({ type: "error", message: "An error message", duration: 1000 });

    if (id === undefined) {
      throw new Error("Expected notification to be created");
    }

    vi.advanceTimersByTime(400);
    notifications.pause(id, "pointer");
    notifications.pause(id, "focus");
    notifications.resume(id, "pointer");
    vi.advanceTimersByTime(1000);
    expect(notifications.notifications.value).toHaveLength(1);

    notifications.resume(id, "focus");
    vi.advanceTimersByTime(599);
    expect(notifications.notifications.value).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(notifications.notifications.value).toEqual([]);
  });

  it("cleans up paused notifications when manually dismissed and keeps non-expiring notifications", async () => {
    const { useAstroPopNotifications } =
      await import("../app/composables/astro-pop/useAstroPopNotifications");
    const notifications = useAstroPopNotifications();
    const pausedId = notifications.show({
      type: "success",
      message: "A success message",
      duration: 1000,
    });
    const permanentId = notifications.show({
      type: "info",
      message: "An info message",
      duration: 0,
    });

    if (pausedId === undefined || permanentId === undefined) {
      throw new Error("Expected notifications to be created");
    }

    notifications.pause(pausedId, "focus");
    notifications.dismiss(pausedId);
    notifications.resume(pausedId, "focus");
    vi.advanceTimersByTime(10_000);
    expect(notifications.notifications.value).toEqual([
      { id: permanentId, type: "info", title: "Heads up!", message: "An info message" },
    ]);

    notifications.dismiss(permanentId);
    expect(notifications.notifications.value).toEqual([]);
  });

  it("uses custom titles and renders long messages in a focusable scroll area", async () => {
    const { useAstroPopNotifications } =
      await import("../app/composables/astro-pop/useAstroPopNotifications");
    const AstroPopNotificationContainer = (
      await import("../app/components/astro-pop/AstroPopNotificationContainer.vue")
    ).default;
    const notifications = useAstroPopNotifications();
    const container = document.createElement("div");
    const app = createApp(AstroPopNotificationContainer);
    const longMessage = "A very long notification message. ".repeat(20);

    document.body.appendChild(container);
    app.mount(container);
    notifications.show({
      type: "error",
      title: "Custom mission update",
      message: longMessage,
      duration: 0,
    });
    await nextTick();

    const scrollArea = container.querySelector<HTMLElement>(".astro-pop-notification__content");
    expect(container.textContent).toContain("Custom mission update");
    expect(container.textContent).toContain(longMessage.trim());
    expect(scrollArea?.getAttribute("tabindex")).toBe("0");
    expect(scrollArea?.className).toContain("astro-pop-notification__content");

    container.querySelector<HTMLButtonElement>("[aria-label='Dismiss notification']")?.click();
    await nextTick();
    expect(notifications.notifications.value).toEqual([]);

    app.unmount();
    container.remove();
  });

  it("does not create a notification for an empty message", async () => {
    const { useAstroPopNotifications } =
      await import("../app/composables/astro-pop/useAstroPopNotifications");
    const notifications = useAstroPopNotifications();

    const id = notifications.show({ type: "info", message: "   " });

    expect(id).toBeUndefined();
    expect(notifications.notifications.value).toEqual([]);
  });
});
