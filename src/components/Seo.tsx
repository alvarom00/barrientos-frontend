import { useEffect } from "react";

type SeoProps = {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  structuredData?: Record<string, any> | string;
};

function upsertMeta(attr: "name" | "property", key: string, content?: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href?: string) {
  if (!href) return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function Seo({
  title,
  description,
  canonical,
  ogImage,
  noindex,
  structuredData,
}: SeoProps) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    if (description) upsertMeta("name", "description", description);

    // 👇 siempre seteamos robots para no heredar "noindex" de otra ruta
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    if (canonical) upsertLink("canonical", canonical);

    // Open Graph / Twitter básicos
    if (title) {
      upsertMeta("property", "og:title", title);
      upsertMeta("name", "twitter:title", title);
    }
    if (description) {
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
    }
    if (ogImage) {
      upsertMeta("property", "og:image", ogImage);
      upsertMeta("name", "twitter:image", ogImage);
      upsertMeta("name", "twitter:card", "summary_large_image");
    }
    if (canonical) {
      upsertMeta("property", "og:url", canonical);
    }
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", "Campos Barrientos");

    // JSON-LD
    let scriptEl: HTMLScriptElement | null = null;
    if (structuredData) {
      scriptEl = document.createElement("script");
      scriptEl.type = "application/ld+json";
      scriptEl.text = typeof structuredData === "string"
        ? structuredData
        : JSON.stringify(structuredData);
      document.head.appendChild(scriptEl);
    }

    return () => {
      if (title) document.title = prevTitle;
      if (scriptEl) document.head.removeChild(scriptEl);
    };
  }, [title, description, canonical, ogImage, noindex, structuredData]);

  return null;
}
