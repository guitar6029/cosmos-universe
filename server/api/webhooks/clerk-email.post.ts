import { verifyWebhook } from "@clerk/backend/webhooks";
import { Resend } from "resend";
// Update the import path when we create this utility.
import { renderVerificationEmail } from "../../utils/email/verification";

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

  if (evt.type !== "email.created") {
    return { received: true, ignored: true };
  }

  const data = evt.data;

  if (data.slug !== "verification_code") {
    return { received: true, ignored: true };
  }

  const recipient = data.to_email_address;
  const otpCode = data.data?.otp_code;

  if (!recipient || typeof otpCode !== "string") {
    throw createError({
      status: 400,
      statusText: "Missing recipient or verification code",
    });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey?.trim()) {
    throw createError({
      status: 500,
      statusText: "Resend API key is not configured",
    });
  }

  const resend = new Resend(apiKey);

  const { data: result, error } = await resend.emails.send(
    {
      from: "Cosmos Universe <access@mail.cosmos-universe.com>",
      to: recipient,
      subject: `${otpCode} — Your Cosmos Universe Access Code`,
      html: renderVerificationEmail({ otpCode }),
      text: `Your Cosmos Universe verification code is ${otpCode}. Do not share this code.`,
    },
    {
      idempotencyKey: `clerk-email/${evt.data.id}`,
    },
  );

  if (error || !result) {
    console.error("Resend email delivery failed", {
      eventId: evt.data.id,
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
