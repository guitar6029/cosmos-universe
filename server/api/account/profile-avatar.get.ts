import { getClerkAuth } from "../../utils/getClerkAuth";
import { getProfileAvatar } from "../../../server/utils/cosmoportCoreDatabase";
import { createError, defineEventHandler } from "nuxt/server";

export default defineEventHandler(async (event) => {
  event.res.headers.set("Cache-Control", "private, no-store");

  const auth = getClerkAuth(event);

  if (auth.isAuthenticated !== true || !auth.userId?.trim()) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const avatarId = await getProfileAvatar(auth.userId);

  return { avatarId };
});
