export const PLATFORM_ACCENT_COLORS: Record<string, string> = {
  'raspberry-pi-40pin': '#2563eb',
  'radxa-zero-40pin': '#7c3aed',
  'radxa-zero-3-40pin': '#ea580c',
  'orangepi-zero-3w-40pin': '#f97316',
  'orangepi-5-26pin': '#ea580c',
  'luckfox-lyra-zero-w-40pin': '#0d9488',
  'luckfox-aura-40pin': '#0891b2',
};

export function getPlatformAccentColor(platformId: string): string {
  return PLATFORM_ACCENT_COLORS[platformId] ?? '#64748b';
}
