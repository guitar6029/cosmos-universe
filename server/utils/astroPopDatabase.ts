import { neon } from "@neondatabase/serverless";
import type {
  AstroPopOrderDetail,
  AstroPopOrderHistory,
  AstroPopOrder,
  AstroPopOrderHistoryItem,
} from "../types/astro-pop.types";

export class AstroPopDatabaseConfigurationError extends Error {
  constructor() {
    super("Astro Pop database is not configured");
    this.name = "AstroPopDatabaseConfigurationError";
  }
}

/**
 * Performs the smallest possible read-only database check. This utility is
 * server-only: its connection string is read from the Nitro process at call
 * time and is never returned to callers.
 */
export async function getAstroPopDatabaseHealth(
  connectionString = process.env.ASTROPOP_POOLED_URL,
) {
  assertAstroPopConnectionString(connectionString);

  const sql = neon(connectionString);
  await sql`SELECT 1 AS connected`;

  return { status: "ok" } as const;
}

/**
 * Creates a paid order and its line items as one database statement. The
 * Checkout Session ID is unique in the schema, so replayed Stripe webhooks
 * return `persisted: false` without adding another order or any items.
 */
export async function persistAstroPopOrder(
  order: AstroPopOrder,
  connectionString = process.env.ASTROPOP_POOLED_URL,
) {
  assertAstroPopConnectionString(connectionString);

  const sql = neon(connectionString);
  const items = JSON.stringify(
    order.items.map((item) => ({
      flavor_id: item.flavorId,
      flavor_name: item.flavorName,
      quantity: item.quantity,
      unit_price_cents: item.unitPriceCents,
    })),
  );

  if (order.items.length === 0) {
    throw new Error("Cannot persist an order without items");
  }

  const rows = await sql`
    WITH inserted_order AS (
      INSERT INTO public.orders (
        clerk_user_id,
        customer_email,
        stripe_checkout_session_id,
        stripe_payment_intent_id,
        total_cents,
        currency
      ) VALUES (
        ${order.clerkUserId},
        ${order.customerEmail},
        ${order.stripeCheckoutSessionId},
        ${order.stripePaymentIntentId},
        ${order.totalCents},
        ${order.currency}
      )
      ON CONFLICT (stripe_checkout_session_id) DO NOTHING
      RETURNING id
    ), inserted_items AS (
      INSERT INTO public.order_items (
        order_id,
        flavor_id,
        flavor_name,
        quantity,
        unit_price_cents
      )
      SELECT
        inserted_order.id,
        item.flavor_id,
        item.flavor_name,
        item.quantity,
        item.unit_price_cents
      FROM inserted_order
      CROSS JOIN jsonb_to_recordset(${items}::jsonb) AS item(
        flavor_id TEXT,
        flavor_name TEXT,
        quantity SMALLINT,
        unit_price_cents INTEGER
      )
    )
    SELECT id FROM inserted_order
  `;

  return { persisted: rows.length === 1 } as const;
}

/**
 * Checks whether a Stripe Checkout Session has
 * a persisted Astro Pop order in Neon.
 *
 * Read-only: this function never creates an order.
 */
export async function isAstroPopOrderRecorded(
  sessionId: string,
  connectionString = process.env.ASTROPOP_POOLED_URL,
): Promise<boolean> {
  assertAstroPopConnectionString(connectionString);

  const sql = neon(connectionString);

  const rows = await sql`
    SELECT EXISTS (
      SELECT 1
      FROM public.orders
      WHERE stripe_checkout_session_id = ${sessionId}
    ) AS recorded
  `;

  if (!rows[0]) {
    throw new Error("Order lookup returned no result");
  }

  return rows[0].recorded === true;
}

export async function getAstroPopOrdersByUser(
  clerkUserId: string,
  connectionString = process.env.ASTROPOP_POOLED_URL,
): Promise<AstroPopOrderHistory[]> {
  assertAstroPopConnectionString(connectionString);

  const sql = neon(connectionString);

  const rows = await sql`
   WITH recent_orders AS (
  SELECT
    id,
    created_at,
    total_cents,
    currency,
    status,
    payment_status
  FROM public.orders
  WHERE clerk_user_id = ${clerkUserId}
    AND created_at >= NOW() - INTERVAL '30 days'
  ORDER BY created_at DESC, id DESC
  LIMIT 20
)
SELECT
  o.*,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'flavorId', oi.flavor_id,
        'flavorName', oi.flavor_name,
        'quantity', oi.quantity,
        'unitPriceCents', oi.unit_price_cents
      )
    ) FILTER (WHERE oi.id IS NOT NULL),
    '[]'::jsonb
  ) AS items
FROM recent_orders o
LEFT JOIN public.order_items oi
  ON oi.order_id = o.id
GROUP BY
  o.id,
  o.created_at,
  o.total_cents,
  o.currency,
  o.status,
  o.payment_status
ORDER BY o.created_at DESC, o.id DESC;
  `;

  return rows.map((row) => ({
    id: String(row.id),
    createdAt: String(row.created_at),
    totalCents: Number(row.total_cents),
    currency: String(row.currency),
    status: String(row.status),
    paymentStatus: String(row.payment_status),
    items: row.items as AstroPopOrderHistoryItem[],
  }));
}

/**
 * Returns one order only when it belongs to the authenticated Clerk user.
 * The ownership predicate is part of the SQL query so an order ID can never
 * be used to discover another customer's purchase details.
 */
export async function getAstroPopOrderByIdForUser(
  orderId: string,
  clerkUserId: string,
  connectionString = process.env.ASTROPOP_POOLED_URL,
): Promise<AstroPopOrderDetail | null> {
  assertAstroPopConnectionString(connectionString);

  const sql = neon(connectionString);
  const rows = await sql`
    SELECT
      o.id,
      o.created_at,
      o.total_cents,
      o.currency,
      o.status,
      o.payment_status,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'flavorId', oi.flavor_id,
            'flavorName', oi.flavor_name,
            'quantity', oi.quantity,
            'unitPriceCents', oi.unit_price_cents
          )
          ORDER BY oi.id
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::jsonb
      ) AS items
    FROM public.orders o
    LEFT JOIN public.order_items oi ON oi.order_id = o.id
    WHERE o.id = ${orderId}
      AND o.clerk_user_id = ${clerkUserId}
    GROUP BY
      o.id,
      o.created_at,
      o.total_cents,
      o.currency,
      o.status,
      o.payment_status
  `;

  const row = rows[0];
  if (!row) return null;

  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    totalCents: Number(row.total_cents),
    currency: String(row.currency),
    status: String(row.status),
    paymentStatus: String(row.payment_status),
    items: row.items as AstroPopOrderHistoryItem[],
  };
}

function assertAstroPopConnectionString(
  connectionString: string | undefined,
): asserts connectionString is string {
  if (!connectionString) {
    throw new AstroPopDatabaseConfigurationError();
  }
}
