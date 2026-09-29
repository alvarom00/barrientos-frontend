export const SITE_URL = "https://camposbarrientos.com";
export const SITE_NAME = "Campos Barrientos";

export type JsonLdObject = Record<string, unknown>;

export function canonicalUrl(pathname?: string) {
  if (pathname) return `${SITE_URL}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
  if (typeof window === "undefined") return SITE_URL;
  return `${SITE_URL}${window.location.pathname}`;
}

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/barrientos-logo.png`,
    areaServed: {
      "@type": "Country",
      name: "Argentina",
    },
    knowsAbout: [
      "Compra de campos",
      "Venta de campos",
      "Arrendamiento de campos",
      "Propiedades rurales",
    ],
  };
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    inLanguage: "es-AR",
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}
