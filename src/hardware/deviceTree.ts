import type { DeviceTreeOverlay, DeviceTreeOverlayCategory } from './types';

const CATEGORY_ORDER: readonly DeviceTreeOverlayCategory[] = [
  'i2c',
  'spi',
  'uart',
  'pwm',
  'can',
  'other',
];

const CATEGORY_LABELS: Record<DeviceTreeOverlayCategory, string> = {
  i2c: 'I²C',
  spi: 'SPI',
  uart: 'UART',
  pwm: 'PWM',
  can: 'CAN',
  other: 'Other',
};

export function getOverlayPhysicalPins(overlay: DeviceTreeOverlay): number[] {
  const fromSignals = overlay.signals
    ?.map((signal) => signal.physical)
    .filter((physical): physical is number => physical != null);

  if (fromSignals && fromSignals.length > 0) {
    return [...new Set(fromSignals)].sort((a, b) => a - b);
  }

  return [];
}

export function groupOverlaysByCategory(
  overlays: readonly DeviceTreeOverlay[],
): Map<DeviceTreeOverlayCategory, DeviceTreeOverlay[]> {
  const grouped = new Map<DeviceTreeOverlayCategory, DeviceTreeOverlay[]>();

  for (const category of CATEGORY_ORDER) {
    grouped.set(category, []);
  }

  for (const overlay of overlays) {
    const list = grouped.get(overlay.category) ?? [];
    list.push(overlay);
    grouped.set(overlay.category, list);
  }

  return grouped;
}

export function getCategoryLabel(category: DeviceTreeOverlayCategory): string {
  return CATEGORY_LABELS[category];
}

export function formatOverlaySignals(overlay: DeviceTreeOverlay): string {
  if (!overlay.signals?.length) return '—';

  return overlay.signals
    .map((signal) => {
      const pin = signal.physical != null ? `pin ${signal.physical}` : undefined;
      const bank = signal.bankName;
      return [signal.name, bank, pin].filter(Boolean).join(' · ');
    })
    .join('; ');
}
