import { createError, defineEventHandler } from "nuxt/server";
import { getClerkAuth } from "../../../utils/getClerkAuth";
import { getAstroPopOrdersByUser } from "../../../utils/astroPopDatabase";

export default defineEventHandler(async (event) => {
  event.res.headers.set("Cache-Control", "private, no-store");

  // check if user is authenticated/authorized
  const auth = getClerkAuth(event);

  // if not throw error
  if (
    auth.isAuthenticated !== true ||
    typeof auth.userId !== "string" ||
    auth.userId.trim().length === 0
  ) {
    throw createError({
      status: 401,
      statusText: "Unauthorized",
    });
  }

  // if goood call the db helper
  const orders = await getAstroPopOrdersByUser(auth.userId);

  // return the orders
  return orders;
});
