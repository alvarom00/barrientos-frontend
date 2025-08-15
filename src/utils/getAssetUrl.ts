export function getAssetUrl(url: string) {
  if (!url) return "";
  // si ya es absoluta (https://...), devolverla
  if (/^https?:\/\//i.test(url)) return url;
  // si en algún caso todavía guardás rutas relativas, podrías prefijarlas
  const API = import.meta.env.VITE_API_URL ?? "";
  return `${API}${url}`;
}
