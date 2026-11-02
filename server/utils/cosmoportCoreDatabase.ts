import { neon } from "@neondatabase/serverless";
import type { CosmoportApp } from "../../shared/types/cosmoportApp";
import { type ProfileStatus } from "../types/profile.types";
import { isAvatarId, type AvatarId } from "../../app/data/avatarsMedia";

export class CosmoportCoreConfigurationError extends Error {
  constructor() {
    super("CosmoPort Core database is not configured");
    this.name = "CosmoportCoreConfigurationError";
  }
}

function getCoreSql(connectionString: string | undefined) {
  if (!connectionString) {
    throw new CosmoportCoreConfigurationError();
  }

  return neon(connectionString);
}

/** Minimal connectivity check; does not inspect application tables. */
/**
 *
 * @param connectionString
 * @returns
 */
export async function getCosmoportCoreDatabaseHealth(
  connectionString = process.env.COSMOPORT_CORE_POOLED_URL,
) {
  const sql = getCoreSql(connectionString);
  await sql`SELECT 1 AS connected`;
  return { status: "ok" } as const;
}

/**
 *
 * @param connectionString
 * @returns
 */
export async function getCosmoportApps(
  connectionString = process.env.COSMOPORT_CORE_POOLED_URL,
): Promise<CosmoportApp[]> {
  const sql = getCoreSql(connectionString);
  const rows = await sql`
    SELECT id, title, description, enabled
    FROM public.apps
    ORDER BY title ASC
  `;
  return rows as CosmoportApp[];
}

/**
 *
 * @param id
 * @param enabled
 * @param connectionString
 * @returns
 */
export async function updateCosmoportAppStatus(
  id: string,
  enabled: boolean,
  connectionString = process.env.COSMOPORT_CORE_POOLED_URL,
): Promise<CosmoportApp | null> {
  const sql = getCoreSql(connectionString);
  const rows = (await sql`
    UPDATE public.apps
    SET enabled = ${enabled}
    WHERE id = ${id}
    RETURNING id, title, description, enabled
  `) as CosmoportApp[];

  return rows[0] ?? null;
}

export async function getCosmoportAppEnabled(
  id: string,
  connectionString = process.env.COSMOPORT_CORE_POOLED_URL,
): Promise<boolean | null> {
  const sql = getCoreSql(connectionString);

  const rows = await sql`
    SELECT enabled
    FROM public.apps
    WHERE id = ${id}
  `;

  return (rows[0]?.enabled as boolean | undefined) ?? null;
}

/**
 * Creates a Cosmos Universe profile for a Clerk user.
 *
 * Uses an idempotent insert to prevent duplicate profiles when
 * Clerk delivers the same webhook event multiple times.
 *
 * @param userId - The verified Clerk user ID.
 * @param avatarId - the avatar id selected from the registeration form
 * @param connectionString - Neon PostgreSQL connection string.
 * @returns "created" if a new profile was inserted, or
 *          "already_exists" if the profile was previously created.
 * @throws If the database connection or insert fails.
 */
export async function createCosmosProfile(
  userId: string,
  avatarId: AvatarId = "astronaut",
  connectionString = process.env.COSMOPORT_CORE_POOLED_URL,
): Promise<{ status: ProfileStatus }> {
  const sql = getCoreSql(connectionString);

  if (!isAvatarId(avatarId)) {
    throw new Error("Invalid avatar ID");
  }

  const rows = await sql`
    INSERT INTO public.profiles (user_id, avatar_id)
    VALUES (${userId}, ${avatarId})
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id;
  `;

  return {
    status: rows.length > 0 ? "created" : "already_exists",
  };
}

export async function saveCosmosProfileAvatar(
  userId: string,
  avatarId: AvatarId,
  connectionString = process.env.COSMOPORT_CORE_POOLED_URL,
): Promise<{ avatarId: AvatarId }> {
  if (!isAvatarId(avatarId)) {
    throw new Error("Invalid avatar ID");
  }

  const sql = getCoreSql(connectionString);

  const rows = await sql`
    INSERT INTO public.profiles (user_id, avatar_id)
    VALUES (${userId}, ${avatarId})
    ON CONFLICT (user_id)
    DO UPDATE SET
      avatar_id = EXCLUDED.avatar_id,
      updated_at = NOW()
    RETURNING avatar_id
  `;

  const row = rows[0];

  if (!row) {
    throw new Error("Failed to save Cosmos profile avatar");
  }

  return { avatarId: row.avatar_id as AvatarId };
}
