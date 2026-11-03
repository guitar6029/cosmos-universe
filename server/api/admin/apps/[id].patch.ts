import { createError, defineEventHandler, getRouterParam, readBody, setResponseHeader } from "h3";
import { z } from "zod";
import { requireSuperAdmin } from "../../../utils/requireSuperAdmin";
import { updateCosmoportAppStatus } from "../../../utils/cosmoportCoreDatabase";

const appIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const updateAppSchema = z.strictObject({ enabled: z.boolean() });

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  await requireSuperAdmin(event);

  const idResult = appIdSchema.safeParse(getRouterParam(event, "id"));
  if (!idResult.success) {
    throw createError({ statusCode: 400, statusMessage: "Invalid app ID" });
  }

  const bodyResult = updateAppSchema.safeParse(await readBody(event));
  if (!bodyResult.success) {
    throw createError({ statusCode: 400, statusMessage: "Invalid request body" });
  }

  const app = await updateCosmoportAppStatus(idResult.data, bodyResult.data.enabled);
  if (!app) {
    throw createError({ statusCode: 404, statusMessage: "App not found" });
  }

  return { app };
});
