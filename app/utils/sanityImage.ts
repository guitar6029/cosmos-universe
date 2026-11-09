export function getSanityImageUrl(
  imageUrl: string | null,
  width: number,
  height: number,
): string | null {
  if (!imageUrl) {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const isSanityImageUrl =
      url.protocol === "https:" &&
      url.hostname === "cdn.sanity.io" &&
      !url.username &&
      !url.password &&
      !url.port &&
      pathSegments.length === 4 &&
      pathSegments[0] === "images" &&
      pathSegments.every(Boolean);

    if (!isSanityImageUrl) {
      return null;
    }

    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    url.searchParams.set("h", String(height));

    return url.toString();
  } catch {
    return null;
  }
}
