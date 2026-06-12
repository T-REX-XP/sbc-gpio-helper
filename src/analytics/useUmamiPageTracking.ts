import { useEffect } from 'react';
import { loadUmamiScript, trackUmamiPageView } from './umami';

export function useUmamiPageTracking(pagePath: string): void {
  useEffect(() => {
    let cancelled = false;

    loadUmamiScript()
      .then(() => {
        if (!cancelled) {
          trackUmamiPageView(pagePath);
        }
      })
      .catch((error: unknown) => {
        if (import.meta.env.DEV) {
          console.warn('[umami] Analytics script failed to load.', error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pagePath]);
}
