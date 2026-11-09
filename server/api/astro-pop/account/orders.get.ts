import { defineEventHandler } from "nuxt/server";
import { getAstroPopOrdersByUser } from "../../../utils/astroPopDatabase";
import { requireAuthenticatedUserId } from "../../../utils/requireAuthenticatedUserId";

export default defineEventHandler(async (event) => {
  event.res.headers.set("Cache-Control", "private, no-store");

  const userId = requireAuthenticatedUserId(event);
  const orders = await getAstroPopOrdersByUser(userId);

  return orders;
});
