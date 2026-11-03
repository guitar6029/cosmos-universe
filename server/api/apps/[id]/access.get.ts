import { createError, defineEventHandler, getRouterParam, setResponseHeader } from "h3";
import { getCosmoportAppEnabled } from "../../../utils/cosmoportCoreDatabase";
import { getE2eAppEnabled } from "../../../utils/e2eAppRegistry";
import { requireSuperAdmin } from "../../../utils/requireSuperAdmin";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const id = getRouterParam(event, "id");

  if (!id || id.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid app ID" });
  }

  let enabled: boolean | null;
  try {
    enabled =
      import.meta.dev && process.env.PLAYWRIGHT_TEST === "true"
        ? getE2eAppEnabled(id)
        : await getCosmoportAppEnabled(id);
  } catch {
    throw createError({ statusCode: 503, statusMessage: "Application availability unavailable" });
  }

  // The database is the only source of truth for public availability.
  // This endpoint returns the derived per-visitor access decision, not a new flag.
  if (enabled === null) return { allowed: null };
  if (enabled === true) return { allowed: true };

  try {
    // Disabled apps can still be previewed by verified Super Admins.
    await requireSuperAdmin(event);
    return { allowed: true };
  } catch (error) {
    const statusCode = (error as { statusCode?: unknown } | null)?.statusCode;
    if (statusCode === 401 || statusCode === 403) return { allowed: false };

    // Never grant an admin bypass if Clerk cannot verify identity/role.
    throw createError({ statusCode: 503, statusMessage: "Authorization service unavailable" });
  }
});
