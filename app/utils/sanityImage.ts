export function getSanityImageUrl(
  imageUrl: string | null,
  width: number,
  height: number,
): string | null {
  if (!imageUrl) {
    return null;
  }

  const url = new URL(imageUrl);
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "crop");
  url.searchParams.set("w", String(width));
  url.searchParams.set("h", String(height));

  return url.toString();
}
