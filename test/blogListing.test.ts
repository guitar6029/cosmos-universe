import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getSanityImageUrl } from "../app/utils/sanityImage";
import { BLOG_LISTING_QUERY } from "../server/utils/blogListing";

describe("blog listing query", () => {
  it("only includes current, published posts in newest-first order", () => {
    expect(BLOG_LISTING_QUERY).toContain('_type == "blogPost"');
    expect(BLOG_LISTING_QUERY).toContain('!(_id in path("drafts.**"))');
    expect(BLOG_LISTING_QUERY).toContain('!(_id in path("versions.**"))');
    expect(BLOG_LISTING_QUERY).toContain("defined(publishedAt)");
    expect(BLOG_LISTING_QUERY).toContain("publishedAt <= now()");
    expect(BLOG_LISTING_QUERY).toContain("defined(slug.current)");
    expect(BLOG_LISTING_QUERY).toContain('slug.current != ""');
    expect(BLOG_LISTING_QUERY).toContain("order(publishedAt desc)[0...10]");
  });

  it("projects the author and listing-sized image data without the article body", () => {
    expect(BLOG_LISTING_QUERY).toContain('"coverImageUrl": coverImage.asset->url');
    expect(BLOG_LISTING_QUERY).toContain('"author": author->{');
    expect(BLOG_LISTING_QUERY).toContain('"avatarUrl": avatar.asset->url');
    expect(BLOG_LISTING_QUERY).not.toContain("body");
  });
});

describe("Sanity image URLs", () => {
  it("creates transformed CDN URLs and tolerates missing optional images", () => {
    expect(getSanityImageUrl(null, 960, 640)).toBeNull();

    expect(
      getSanityImageUrl("https://cdn.sanity.io/images/project/dataset/image.jpg", 960, 640),
    ).toBe(
      "https://cdn.sanity.io/images/project/dataset/image.jpg?auto=format&fit=crop&w=960&h=640",
    );
  });
});

describe("Chronicle listing presentation", () => {
  it("provides deliberate loading, empty, and safe error states", async () => {
    const page = await readFile(resolve(process.cwd(), "app/pages/blog.vue"), "utf8");

    expect(page).toContain("Receiving the latest transmissions…");
    expect(page).toContain("The newsroom is preparing its first dispatch. Check back soon.");
    expect(page).toContain("The newsroom is temporarily off the air. Please check back soon.");
    expect(page).not.toContain("error.message");
  });

  it("keeps cards non-navigable until individual article pages exist", async () => {
    const card = await readFile(
      resolve(process.cwd(), "app/components/blog/BlogArticleCard.vue"),
      "utf8",
    );

    expect(card).not.toContain("NuxtLink");
    expect(card).toContain('loading="lazy"');
    expect(card).toContain("blog-article-card__image-fallback");
  });
});
