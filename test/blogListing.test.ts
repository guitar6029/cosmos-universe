import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getSanityImageUrl } from "../app/utils/sanityImage";
import { getBlogEditorialLayout } from "../app/utils/blogEditorialLayout";
import { BLOG_LISTING_QUERY } from "../server/utils/blogListing";
import { BLOG_ARTICLE_QUERY } from "../server/utils/blogArticle";

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
    const page = await readFile(resolve(process.cwd(), "app/pages/blog/index.vue"), "utf8");

    expect(page).toContain("Receiving the latest transmissions…");
    expect(page).toContain("The newsroom is preparing its first dispatch. Check back soon.");
    expect(page).toContain("The newsroom is temporarily off the air. Please check back soon.");
    expect(page).not.toContain("error.message");
  });

  it("links card titles and read-more controls to the individual article page", async () => {
    const card = await readFile(
      resolve(process.cwd(), "app/components/blog/BlogArticleCard.vue"),
      "utf8",
    );

    expect(card).toContain("NuxtLink");
    expect(card).toContain("`/blog/${post.slug}`");
    expect(card).toContain("Read more");
    expect(card).toContain('loading="lazy"');
    expect(card).toContain("blog-article-card__image-fallback");
    expect(card).toContain('engineering: "Engineering Logs"');
    expect(card).toContain('debugging: "Debugging Dispatches"');
    expect(card).toContain('updates: "Universe Updates"');
    expect(card).toContain('lore: "Universe Lore"');
  });
});

describe("blog article query", () => {
  it("finds a published article by slug while excluding drafts, releases, and future posts", () => {
    expect(BLOG_ARTICLE_QUERY).toContain("slug.current == $slug");
    expect(BLOG_ARTICLE_QUERY).toContain('!(_id in path("drafts.**"))');
    expect(BLOG_ARTICLE_QUERY).toContain('!(_id in path("versions.**"))');
    expect(BLOG_ARTICLE_QUERY).toContain("defined(publishedAt)");
    expect(BLOG_ARTICLE_QUERY).toContain("publishedAt <= now()");
  });

  it("projects author metadata, article dates, and Portable Text image URLs", () => {
    expect(BLOG_ARTICLE_QUERY).toContain('"author": author->{');
    expect(BLOG_ARTICLE_QUERY).toContain("_createdAt");
    expect(BLOG_ARTICLE_QUERY).toContain("_updatedAt");
    expect(BLOG_ARTICLE_QUERY).toContain('"body": body[]{');
    expect(BLOG_ARTICLE_QUERY).toContain('"url": asset->url');
  });
});

describe("Chronicle article presentation", () => {
  it("keeps the overlapping cover in flow and includes an intentional fallback", async () => {
    const page = await readFile(resolve(process.cwd(), "app/pages/blog/[slug].vue"), "utf8");
    const styles = await readFile(resolve(process.cwd(), "app/pages/blog/article.css"), "utf8");

    expect(page).toContain("chronicle-article__cover-shell");
    expect(page).toContain("chronicle-article__cover--fallback");
    expect(page).toContain("← All dispatches");
    expect(styles).toContain("margin: calc(-1 * min(33.33vw, 18.75rem)) auto 0;");
    expect(styles).toContain("@media (max-width: 48rem)");
    expect(styles).toContain("overflow: clip;");
  });

  it("renders the supported Portable Text structures without unsafe HTML injection", async () => {
    const renderer = await readFile(
      resolve(process.cwd(), "app/components/blog/PortableTextRenderer.vue"),
      "utf8",
    );

    expect(renderer).toContain('h("strong"');
    expect(renderer).toContain('h("em"');
    expect(renderer).toContain('listItem === "number" ? "ol" : "ul"');
    expect(renderer).toContain('h("pre"');
    expect(renderer).toContain('h("figure"');
    expect(renderer).toContain("noopener noreferrer");
    expect(renderer).toContain('url.protocol === "https:" || url.protocol === "http:"');
    expect(renderer).not.toContain("v-html");
  });
});

describe("Chronicle editorial layout", () => {
  it("uses a stable repeating mix of vertical and reversible horizontal cards", () => {
    expect(getBlogEditorialLayout(0)).toEqual({ layout: "horizontal", imagePosition: "start" });
    expect(getBlogEditorialLayout(1)).toEqual({ layout: "vertical", imagePosition: "start" });
    expect(getBlogEditorialLayout(5)).toEqual({ layout: "horizontal", imagePosition: "end" });
    expect(getBlogEditorialLayout(6)).toEqual(getBlogEditorialLayout(0));
  });
});
