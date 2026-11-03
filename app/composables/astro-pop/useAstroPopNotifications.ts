import type { AstroPopNotificationType } from "../../types/astroPopNotification";

export interface AstroPopNotification {
  id: string;
  type: AstroPopNotificationType;
  title: string;
  message: string;
}

export interface AstroPopNotificationOptions {
  type: AstroPopNotificationType;
  title?: string;
  message: string;
  duration?: number;
}

const DURATION_DEFAULT_MS = 4500;

const defaultTitles: Record<AstroPopNotificationType, string> = {
  success: "Great news!",
  info: "Heads up!",
  error: "Oh no!",
};

type AstroPopNotificationInteraction = "focus" | "pointer" | "touch";

interface NotificationTimer {
  handle?: ReturnType<typeof setTimeout>;
  startedAt?: number;
  remaining: number;
  interactions: Set<AstroPopNotificationInteraction>;
}

const timers = new Map<string, NotificationTimer>();

export function useAstroPopNotifications() {
  const notifications = useState<AstroPopNotification[]>("astro-pop-notifications", () => []);

  function dismiss(id: string) {
    const timer = timers.get(id);

    if (timer?.handle) {
      clearTimeout(timer.handle);
      timers.delete(id);
    }

    timers.delete(id);

    notifications.value = notifications.value.filter((notification) => notification.id !== id);
  }

  function startTimer(id: string, timer: NotificationTimer) {
    if (timer.remaining <= 0) {
      dismiss(id);
      return;
    }

    timer.startedAt = Date.now();
    timer.handle = setTimeout(() => {
      dismiss(id);
    }, timer.remaining);
  }

  function pause(id: string, interaction: AstroPopNotificationInteraction) {
    const timer = timers.get(id);

    if (!timer) {
      return;
    }

    timer.interactions.add(interaction);

    if (!timer.handle || timer.startedAt === undefined) {
      return;
    }

    timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
    clearTimeout(timer.handle);
    timer.handle = undefined;
    timer.startedAt = undefined;
  }

  function resume(id: string, interaction: AstroPopNotificationInteraction) {
    const timer = timers.get(id);

    if (!timer) {
      return;
    }

    timer.interactions.delete(interaction);

    if (timer.interactions.size === 0 && !timer.handle) {
      startTimer(id, timer);
    }
  }

  function show({
    type,
    title,
    message,
    duration = DURATION_DEFAULT_MS,
  }: AstroPopNotificationOptions) {
    if (import.meta.server) {
      return;
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const id = crypto.randomUUID();

    notifications.value.push({
      id,
      type,
      title: title?.trim() || defaultTitles[type],
      message: trimmedMessage,
    });

    if (duration > 0) {
      const timer: NotificationTimer = {
        remaining: duration,
        interactions: new Set(),
      };

      timers.set(id, timer);
      startTimer(id, timer);
    }

    return id;
  }

  return {
    notifications,
    show,
    dismiss,
    pause,
    resume,
  };
}
