/**
 * Cleans up image URLs that might be double-prefixed by Django's media URL.
 * Example: https://site.com/media/https%3A/external.com/image.jpg
 * becomes: https://external.com/image.jpg
 */
export function getCleanImageUrl(url: string | null | undefined): string {
  if (!url) return "";

  // If the URL contains an external URL nested inside a media path
  if (url.includes("/media/http")) {
    const parts = url.split("/media/");
    if (parts.length > 1) {
      let nestedUrl = parts[1];
      // Decode potential URI encoding (like %3A for :)
      nestedUrl = decodeURIComponent(nestedUrl);
      
      // Ensure it starts with http correctly
      if (nestedUrl.startsWith("http")) {
        return nestedUrl;
      }
    }
  }

  // Fallback for standard relative media paths
  if (url.startsWith("http")) {
    return url;
  }

  return url;
}

export const normalizeImageUrl = getCleanImageUrl;
