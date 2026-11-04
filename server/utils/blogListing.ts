import type { BlogListingPost } from "~/types/blog";

export type { BlogListingPost };

export const BLOG_LISTING_QUERY = `*[
  _type == "blogPost" &&
  !(_id in path("drafts.**")) &&
  !(_id in path("versions.**")) &&
  defined(publishedAt) &&
  publishedAt <= now() &&
  defined(slug.current) &&
  slug.current != ""
] | order(publishedAt desc)[0...10] {
  title,
  "slug": slug.current,
  excerpt,
  "coverImageUrl": coverImage.asset->url,
  category,
  publishedAt,
  "author": author->{
    name,
    "avatarUrl": avatar.asset->url
  }
}`;
