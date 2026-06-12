/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_UMAMI_WEBSITE_ID?: string;
  readonly VITE_UMAMI_SCRIPT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  umami?: {
    track: (
      event?: string | ((props: Record<string, unknown>) => Record<string, unknown>),
      data?: Record<string, unknown>,
    ) => void;
  };
}
