
import { verifyWebhook } from "@clerk/backend/webhooks";
import { createCosmosProfile } from "../../utils/cosmoportCoreDatabase";

export default defineEventHandler(async (event) => {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    if (!signingSecret?.trim()) {
        throw createError({
            statusCode: 500,
            statusMessage: "Clerk webhook signing secret is not configured",
        });
    }

    let evt;

    try {
        const request = toWebRequest(event);

        evt = await verifyWebhook(request, {
            signingSecret,
        });
    } catch {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid webhook signature",
        });
    }

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

    await createCosmosProfile(userId);

    return { received: true };
});
