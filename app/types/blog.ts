export interface BlogListingPost {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  category: string;
  publishedAt: string;
  author: {
    name: string | null;
    avatarUrl: string | null;
  } | null;
}
