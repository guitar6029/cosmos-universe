/** Curated Cosmos Passport avatar IDs. Keep these independent of R2 filenames. */
export const AVATAR_IDS = ["astronaut", "cat", "alien", "robot"] as const;
export type AvatarId = (typeof AVATAR_IDS)[number];

export const AVATARS_MEDIA_BASE_URL = "https://media.cosmos-universe.com/avatars";

const cdnMedia = (filename: string) => `${AVATARS_MEDIA_BASE_URL}/${filename}`;

/** Only reviewed preset artwork; never accept arbitrary user-supplied media keys. */
export const AVATARS_MEDIA: Record<AvatarId, string> = {
  astronaut: cdnMedia("cosmos_avatar_astronaut_transparent.png"),
  cat: cdnMedia("cosmos_avatar_cat_transparent.png"),
  alien: cdnMedia("cosmos_avatar_alien_transparent.png"),
  robot: cdnMedia("cosmos_avatar_robot_transparent.png"),
};

export const isAvatarId = (value: unknown): value is AvatarId =>
  typeof value === "string" && AVATAR_IDS.some((id) => id === value);

export const avatarUrl = (value: unknown): string | null =>
  isAvatarId(value) ? AVATARS_MEDIA[value] : null;
