import { createError, defineEventHandler, getRouterParam, setResponseHeader } from "h3";
import { getAstroPopOrderByIdForUser } from "../../../../utils/astroPopDatabase";
import { requireAuthenticatedUserId } from "../../../../utils/requireAuthenticatedUserId";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "private, no-store");

  const userId = requireAuthenticatedUserId(event);

  const orderId = getRouterParam(event, "id");
  if (typeof orderId !== "string" || !UUID_PATTERN.test(orderId)) {
    throw createError({ status: 404, statusText: "Order not found" });
  }

  const order = await getAstroPopOrderByIdForUser(orderId, userId);
  if (!order) {
    // Identical response prevents disclosure of another customer's order IDs.
    throw createError({ status: 404, statusText: "Order not found" });
  }

  return order;
});
