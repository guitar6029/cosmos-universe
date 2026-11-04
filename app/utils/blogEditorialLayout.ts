export type BlogArticleCardLayout = "horizontal" | "vertical";
export type BlogArticleCardImagePosition = "start" | "end";

export interface BlogEditorialLayout {
  layout: BlogArticleCardLayout;
  imagePosition: BlogArticleCardImagePosition;
}

const EDITORIAL_LAYOUT_PATTERN: BlogEditorialLayout[] = [
  { layout: "horizontal", imagePosition: "start" },
  { layout: "vertical", imagePosition: "start" },
  { layout: "vertical", imagePosition: "start" },
  { layout: "vertical", imagePosition: "start" },
  { layout: "vertical", imagePosition: "start" },
  { layout: "horizontal", imagePosition: "end" },
];

export function getBlogEditorialLayout(index: number): BlogEditorialLayout {
  return (
    EDITORIAL_LAYOUT_PATTERN[index % EDITORIAL_LAYOUT_PATTERN.length] ??
    EDITORIAL_LAYOUT_PATTERN[0]!
  );
}
