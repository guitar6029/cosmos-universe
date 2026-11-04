import { createError, defineEventHandler } from "h3";
import { BLOG_LISTING_QUERY, type BlogListingPost } from "../utils/blogListing";

export default defineEventHandler(async (event): Promise<BlogListingPost[]> => {
  try {
    return await useSanity(event).fetch<BlogListingPost[]>(BLOG_LISTING_QUERY);
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "The Chronicle dispatches are temporarily unavailable.",
    });
  }
});
