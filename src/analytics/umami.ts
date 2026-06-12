const DEFAULT_UMAMI_SCRIPT_URL = 'https://cloud.umami.is/script.js';

export interface UmamiConfig {
  websiteId: string;
  scriptUrl: string;
}

let scriptPromise: Promise<void> | null = null;

export function getUmamiConfig(): UmamiConfig | null {
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID?.trim();
  if (!websiteId) return null;

  const scriptUrl =
    import.meta.env.VITE_UMAMI_SCRIPT_URL?.trim() || DEFAULT_UMAMI_SCRIPT_URL;

  return { websiteId, scriptUrl };
}

export function isUmamiEnabled(): boolean {
  return getUmamiConfig() !== null;
}

export function loadUmamiScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  const config = getUmamiConfig();
  if (!config) return Promise.resolve();

  if (window.umami) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[data-website-id="${config.websiteId}"]`,
    );
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.defer = true;
    script.src = config.scriptUrl;
    script.dataset.websiteId = config.websiteId;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Umami analytics script'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function trackUmamiPageView(path: string): void {
  if (!getUmamiConfig()) return;

  window.umami?.track((props) => ({
    ...props,
    url: path,
  }));
}

export function trackUmamiEvent(
  eventName: string,
  data?: Record<string, string | number | boolean>,
): void {
  if (!getUmamiConfig()) return;

  window.umami?.track(eventName, data);
}
