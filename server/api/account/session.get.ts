import { createError, defineEventHandler } from "nuxt/server";
import { getClerkAuth } from "../../utils/getClerkAuth";

/** Universe-wide auth-only probe; no app-specific order data. */
export default defineEventHandler((event) => {
  event.res.headers.set("Cache-Control", "private, no-store");
  const auth = getClerkAuth(event);
  if (auth.isAuthenticated !== true || !auth.userId?.trim()) {
    throw createError({ status: 401, statusText: "Unauthorized" });
  }
  return { authenticated: true };
});
