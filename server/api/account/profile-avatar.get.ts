import { getProfileAvatar } from "../../../server/utils/cosmoportCoreDatabase";
import { defineEventHandler } from "nuxt/server";
import { requireAuthenticatedUserId } from "../../utils/requireAuthenticatedUserId";

export default defineEventHandler(async (event) => {
  event.res.headers.set("Cache-Control", "private, no-store");

  const userId = requireAuthenticatedUserId(event);

  const avatarId = await getProfileAvatar(userId);

  return { avatarId };
});
