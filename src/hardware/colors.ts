/** Canonical device colors — single source of truth, keyed by device id. */
export const DEVICE_COLORS: Readonly<Record<string, string>> = {
  'waveshare-epaper-2.13': '#2563eb',
  'waveshare-lcd-1.3': '#16a34a',
  'waveshare-lcd-1.44': '#9333ea',
};

export const DEFAULT_DEVICE_COLOR = '#64748b';

export function getCanonicalDeviceColor(deviceId: string): string {
  return DEVICE_COLORS[deviceId] ?? DEFAULT_DEVICE_COLOR;
}
