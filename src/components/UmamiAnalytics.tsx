import { useUmamiPageTracking } from '../analytics/useUmamiPageTracking';

interface UmamiAnalyticsProps {
  pagePath: string;
}

/** Loads Umami when configured and tracks SPA page views. Renders nothing. */
export function UmamiAnalytics({ pagePath }: UmamiAnalyticsProps) {
  useUmamiPageTracking(pagePath);
  return null;
}
