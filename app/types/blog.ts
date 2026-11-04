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

export interface PortableTextSpan {
  _key: string;
  _type: "span";
  marks?: string[];
  text: string;
}

export interface PortableTextBlock {
  _key: string;
  _type: "block";
  children: PortableTextSpan[];
  listItem?: "bullet" | "number";
  markDefs?: Array<{ _key: string; _type: "link"; href: string }>;
  style?: "normal" | "h2" | "h3";
}

export interface PortableTextImage {
  _key: string;
  _type: "image";
  alt?: string;
  url?: string;
}

export interface PortableTextCode {
  _key: string;
  _type: "code";
  code: string;
  language?: string;
}

export type PortableTextContent = PortableTextBlock | PortableTextImage | PortableTextCode;

export interface BlogArticle extends BlogListingPost {
  body: PortableTextContent[];
  _createdAt: string;
  _updatedAt: string;
}
