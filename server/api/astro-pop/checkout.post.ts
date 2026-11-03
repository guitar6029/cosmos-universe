import { getCosmoportAppEnabled } from "../../utils/cosmoportCoreDatabase";
import { getE2eAppEnabled } from "../../utils/e2eAppRegistry";
import {
  createAstroPopGuestCredential,
  getAstroPopGuestCredential,
  getAstroPopGuestFingerprint,
  setAstroPopGuestCredential,
} from "../../utils/astroPopGuestCheckout";
import { z } from "zod";
import Stripe from "stripe";
import { ASTROPOP_FLAVORS } from "../../../app/data/astroPopFlavors";
import {
  MAX_CART_ITEMS,
  MAX_CRATE_CAPACITY,
  MAX_QUANTITY_BOTTLES,
  MIN_CART_ITEMS,
  MIN_FLAVOR_ID_LENGTH,
  MIN_QUANTITY_BOTTLES,
  PRICE_PER_BOTTLE_CENTS,
} from "../../../app/constants/astro-pop/constants";
import { createError, defineEventHandler, readBody } from "nuxt/server";
import { getClerkAuth } from "../../utils/getClerkAuth";

const checkoutSchema = z
  .object({
    items: z
      .array(
        z.object({
          flavorId: z.string().min(MIN_FLAVOR_ID_LENGTH),
          quantity: z.number().int().min(MIN_QUANTITY_BOTTLES).max(MAX_QUANTITY_BOTTLES),
        }),
      )
      .min(MIN_CART_ITEMS)
      .max(MAX_CART_ITEMS),
  })
  .refine(
    (cart) => cart.items.reduce((total, item) => total + item.quantity, 0) <= MAX_CRATE_CAPACITY,
    {
      message: `A rocket crate can hold at most ${MAX_CRATE_CAPACITY} bottles`,
    },
  )
  .refine((cart) => new Set(cart.items.map((item) => item.flavorId)).size === cart.items.length, {
    message: "Duplicate flavors are not allowed",
  });

export default defineEventHandler(async (event) => {
  // Block new checkout sessions, without disrupting existing Stripe transactions.
  let enabled: boolean | null;
  try {
    enabled =
      import.meta.dev && process.env.PLAYWRIGHT_TEST === "true"
        ? getE2eAppEnabled("astro-pop")
        : await getCosmoportAppEnabled("astro-pop");
  } catch {
    throw createError({ status: 503, statusText: "App availability unavailable" });
  }
  if (enabled !== true) {
    throw createError({ status: 503, statusText: "Astro Pop checkout is currently unavailable" });
  }

  const body = await readBody(event);
  const cart = checkoutSchema.safeParse(body);

  if (!cart.success) {
    throw createError({
      status: 400,
      statusText: "Invalid checkout cart",
    });
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  // validate flavors
  for (const item of cart.data.items) {
    const flavor = ASTROPOP_FLAVORS.find((flavor) => flavor.id === item.flavorId);
    if (!flavor) {
      throw createError({
        status: 400,
        statusText: "Invalid Astro Pop Flavor",
      });
    }

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: flavor.name,
          metadata: {
            astro_pop_flavor_id: flavor.id,
          },
        },
        unit_amount: PRICE_PER_BOTTLE_CENTS,
      },
      quantity: item.quantity,
    });
  }

  const appUrl = process.env.COSMOPORT_APP_URL;
  const secretKey = process.env.ASTROPOP_STRIPE_SECRET_KEY;

  if (!appUrl || !secretKey) {
    throw createError({
      status: 500,
      statusText: "Stripe checkout configuration is missing",
    });
  }

  const stripe = new Stripe(secretKey);

  const successUrl = new URL("/app/astro-pop/checkout/success", appUrl).toString();

  const existingGuestCredential = getAstroPopGuestCredential(event);
  const guestCredential = existingGuestCredential ?? createAstroPopGuestCredential();
  const guestFingerprint = getAstroPopGuestFingerprint(guestCredential);

  // Associate a checkout only with the verified server-side Clerk identity.
  const auth = getClerkAuth(event);
  const userId =
    auth.isAuthenticated === true &&
    typeof auth.userId === "string" &&
    auth.userId.trim().length > 0
      ? auth.userId
      : null;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    metadata: {
      astro_pop_order: "true",
      astro_pop_guest_fingerprint: guestFingerprint,
      ...(userId ? { clerk_user_id: userId } : {}),
    },
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: new URL("/app/astro-pop/cart?checkout=cancelled", appUrl).toString(),
  });

  // Do not create a browser credential unless Stripe accepted the checkout.
  if (!existingGuestCredential) {
    setAstroPopGuestCredential(event, guestCredential);
  }

  return { url: session.url, sessionId: session.id };
});
