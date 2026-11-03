import { describe, expect, it } from "vitest";
import {
  AVATAR_IDS,
  AVATARS_MEDIA,
  AVATARS_MEDIA_BASE_URL,
  avatarUrl,
  isAvatarId,
} from "../app/data/avatarsMedia";

describe("Cosmos Passport preset avatars", () => {
  it("provides exactly four stable preset IDs and matching CDN image URLs", () => {
    expect(AVATAR_IDS).toEqual(["astronaut", "cat", "alien", "robot"]);
    expect(Object.keys(AVATARS_MEDIA)).toEqual([...AVATAR_IDS]);

    for (const id of AVATAR_IDS) {
      expect(AVATARS_MEDIA[id]).toBe(
        `${AVATARS_MEDIA_BASE_URL}/cosmos_avatar_${id}_transparent.png`,
      );
      expect(new URL(AVATARS_MEDIA[id]).protocol).toBe("https:");
    }
  });

  it("only resolves known preset IDs rather than arbitrary paths or URLs", () => {
    for (const id of AVATAR_IDS) {
      expect(isAvatarId(id)).toBe(true);
      expect(avatarUrl(id)).toBe(AVATARS_MEDIA[id]);
    }
    for (const value of [
      null,
      undefined,
      "",
      "custom",
      "../secret.png",
      "https://other.example/avatar.png",
      42,
    ]) {
      expect(isAvatarId(value)).toBe(false);
      expect(avatarUrl(value)).toBeNull();
    }
  });
});
