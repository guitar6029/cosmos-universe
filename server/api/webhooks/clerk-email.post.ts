import { verifyWebhook } from "@clerk/backend/webhooks";
import { Resend } from "resend";
import { renderVerificationEmail } from "../../utils/email/verification";

const otpPattern = /^\d{6}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default defineEventHandler(async (event) => {
  const signingSecret = process.env.CLERK_EMAIL_WEBHOOK_SIGNING_SECRET;

  if (!signingSecret?.trim()) {
    throw createError({
      status: 500,
      statusText: "Clerk email webhook signing secret is not configured",
    });
  }

  let evt;

  try {
    evt = await verifyWebhook(toWebRequest(event), {
      signingSecret,
    });
  } catch {
    throw createError({
      status: 400,
      statusText: "Invalid webhook signature",
    });
  }

  if (process.env.RESEND_EMAIL_DELIVERY_ENABLED !== "true") {
    return { received: true, ignored: true };
  }

  if (evt.type !== "email.created") {
    return { received: true, ignored: true };
  }

  const data = evt.data;

  if (data.slug !== "verification_code") {
    return { received: true, ignored: true };
  }

  const recipient = data.to_email_address?.trim();
  const otpCode = data.data?.otp_code;
  const emailEventId = data.id;

  if (
    !recipient ||
    !emailPattern.test(recipient) ||
    typeof otpCode !== "string" ||
    !otpPattern.test(otpCode)
  ) {
    throw createError({
      status: 400,
      statusText: "Missing recipient or verification code",
    });
  }

  if (typeof emailEventId !== "string" || !emailEventId.trim()) {
    throw createError({
      status: 400,
      statusText: "Missing email event ID",
    });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey?.trim()) {
    throw createError({
      status: 500,
      statusText: "Resend API key is not configured",
    });
  }

  const resend = new Resend(apiKey.trim());

  let result;
  let error;

  try {
    ({ data: result, error } = await resend.emails.send(
      {
        from: "Cosmos Universe <access@mail.cosmos-universe.com>",
        to: recipient,
        subject: `${otpCode} — Your Cosmos Universe Access Code`,
        html: renderVerificationEmail({ otpCode }),
        text: `Your Cosmos Universe verification code is ${otpCode}. Do not share this code.`,
      },
      {
        idempotencyKey: `clerk-email/${emailEventId}`,
      },
    ));
  } catch (sendError) {
    console.error("Resend email delivery failed", {
      eventId: emailEventId,
      errorName: sendError instanceof Error ? sendError.name : "UnknownError",
    });

    throw createError({
      status: 502,
      statusText: "Email delivery failed",
    });
  }

  if (error || !result) {
    console.error("Resend email delivery failed", {
      eventId: emailEventId,
      errorName: error?.name,
    });

    throw createError({
      status: 502,
      statusText: "Email delivery failed",
    });
  }

  return {
    received: true,
    emailId: result.id,
  };
});
