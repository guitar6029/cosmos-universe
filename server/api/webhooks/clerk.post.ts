
import { verifyWebhook } from "@clerk/nuxt/webhooks";
import { createCosmosProfile } from "../../utils/cosmoportCoreDatabase";

export default defineEventHandler(async (event) => {
    // Only signature verification belongs in this catch.
    let evt;

    try {
        evt = await verifyWebhook(event);
    } catch {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid webhook signature",
        });
    }

    // Ignore event types this endpoint does not process.
    if (evt.type !== "user.created") {
        return { received: true };
    }

    const userId = evt.data.id;

    if (typeof userId !== "string" || !userId.trim()) {
        throw createError({
            statusCode: 400,
            statusMessage: "Missing user ID",
        });
    }

    // A database failure propagates as a server error.
    // A duplicate profile is a successful no-op.
    await createCosmosProfile(userId);

    return { received: true };
});
