import { defineEventHandler } from "nuxt/server";
import { requireAuthenticatedUserId } from "../../../utils/requireAuthenticatedUserId";

/** Auth-only probe for route middleware; never returns customer information. */
export default defineEventHandler((event) => {
  event.res.headers.set("Cache-Control", "private, no-store");
  requireAuthenticatedUserId(event);
  return { authenticated: true };
});
