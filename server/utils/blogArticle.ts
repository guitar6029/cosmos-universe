import type { BlogArticle } from "~/types/blog";

export type { BlogArticle };

export const BLOG_ARTICLE_QUERY = `*[
  _type == "blogPost" &&
  !(_id in path("drafts.**")) &&
  !(_id in path("versions.**")) &&
  defined(publishedAt) &&
  publishedAt <= now() &&
  slug.current == $slug
][0] {
  title,
  "slug": slug.current,
  excerpt,
  "coverImageUrl": coverImage.asset->url,
  category,
  publishedAt,
  _createdAt,
  _updatedAt,
  "author": author->{
    name,
    "avatarUrl": avatar.asset->url
  },
  "body": body[]{
    ...,
    _type == "image" => {
      ...,
      "url": asset->url
    }
  }
}`;
