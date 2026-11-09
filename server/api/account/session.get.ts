import { defineEventHandler } from "nuxt/server";
import { requireAuthenticatedUserId } from "../../utils/requireAuthenticatedUserId";

/** Universe-wide auth-only probe; no app-specific order data. */
export default defineEventHandler((event) => {
  event.res.headers.set("Cache-Control", "private, no-store");
  requireAuthenticatedUserId(event);
  return { authenticated: true };
});
