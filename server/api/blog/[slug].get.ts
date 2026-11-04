import { createError, defineEventHandler, getRouterParam } from "h3";
import { BLOG_ARTICLE_QUERY, type BlogArticle } from "../../utils/blogArticle";

export default defineEventHandler(async (event): Promise<BlogArticle> => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({ statusCode: 404, statusMessage: "Chronicle dispatch not found." });
  }

  try {
    const article = await useSanity(event).fetch<BlogArticle | null>(BLOG_ARTICLE_QUERY, { slug });

    if (!article) {
      throw createError({ statusCode: 404, statusMessage: "Chronicle dispatch not found." });
    }

    return article;
  } catch (error) {
    if (typeof error === "object" && error && "statusCode" in error && error.statusCode === 404) {
      throw error;
    }

    throw createError({
      statusCode: 502,
      statusMessage: "The Chronicle dispatch is temporarily unavailable.",
    });
  }
});
