export const BLOG_MEDIA_BASE_URL = "https://media.cosmos-universe.com/blog";

const cdnMedia = (key: string) => `${BLOG_MEDIA_BASE_URL}/${key}`;

/** Reviewed artwork used exclusively by The Universe Chronicle hero. */
export const BLOG_MEDIA = {
  universeChronicleTerminal: cdnMedia("hero/universe-chronicle-terminal.png"),
} as const;
