import { createError } from "h3";
import { getClerkAuth } from "./getClerkAuth";

type ClerkAuthEvent = Parameters<typeof getClerkAuth>[0];

/**
 * Returns the current, server-verified Clerk user ID or fails closed.
 * Authorization checks, such as ownership and administrator roles, remain the
 * responsibility of their respective handlers.
 */
export function requireAuthenticatedUserId(event: ClerkAuthEvent): string {
  let auth: ReturnType<typeof getClerkAuth>;

  try {
    auth = getClerkAuth(event);
  } catch {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  if (
    auth.isAuthenticated !== true ||
    typeof auth.userId !== "string" ||
    auth.userId.trim().length === 0
  ) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  return auth.userId;
}
