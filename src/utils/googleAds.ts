export type GoogleAdsConversion = "consulta" | "publicar";

const GOOGLE_ADS_ID =
  import.meta.env.VITE_GOOGLE_ADS_ID || "AW-18139243741";

const CONVERSION_LABELS: Record<GoogleAdsConversion, string | undefined> = {
  consulta: import.meta.env.VITE_GOOGLE_ADS_CONSULTA_LABEL,
  publicar: import.meta.env.VITE_GOOGLE_ADS_PUBLICAR_LABEL,
};

const pendingKey = (conversion: GoogleAdsConversion) =>
  `google_ads_pending_${conversion}`;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return false;
  }

  window.gtag(...args);
  return true;
}

export function trackGoogleAdsPageView(path: string) {
  gtag("config", GOOGLE_ADS_ID, {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
  });
}

export function markGoogleAdsConversionPending(conversion: GoogleAdsConversion) {
  try {
    sessionStorage.setItem(pendingKey(conversion), "1");
  } catch {
    // sessionStorage can be unavailable in private or restricted contexts.
  }
}

export function trackGoogleAdsConversion(conversion: GoogleAdsConversion) {
  const label = CONVERSION_LABELS[conversion];

  if (!label) {
    console.warn(
      `Google Ads conversion label missing for "${conversion}". Set the matching VITE_GOOGLE_ADS_*_LABEL variable.`,
    );
    return false;
  }

  return gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${label}`,
  });
}

export function trackPendingGoogleAdsConversion(
  conversion: GoogleAdsConversion,
) {
  try {
    if (sessionStorage.getItem(pendingKey(conversion)) !== "1") {
      return false;
    }

    sessionStorage.removeItem(pendingKey(conversion));
  } catch {
    return false;
  }

  return trackGoogleAdsConversion(conversion);
}
