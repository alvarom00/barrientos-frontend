const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function getAssetUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}
