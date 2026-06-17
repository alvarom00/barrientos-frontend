/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_GOOGLE_ADS_ID?: string;
  readonly VITE_GOOGLE_ADS_CONSULTA_LABEL?: string;
  readonly VITE_GOOGLE_ADS_PUBLICAR_LABEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
