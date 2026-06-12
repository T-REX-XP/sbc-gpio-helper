import { getPinDisplayLabels, type PinLabelStrings } from './pinLabels';
import type { GpioPin, GpioPlatform } from './types';

export type PinComparisonStatus =
  | 'matching'
  | 'same-type'
  | 'different-type';

export interface PlatformPinComparisonRow {
  physical: number;
  primary: GpioPin;
  compare: GpioPin;
  status: PinComparisonStatus;
  primaryLabel: string;
  compareLabel: string;
}

export interface PlatformComparisonSummary {
  total: number;
  matching: number;
  sameType: number;
  differentType: number;
  rows: PlatformPinComparisonRow[];
}

function pinSummaryLabel(
  pin: GpioPin,
  platform: GpioPlatform,
  pinLabels?: PinLabelStrings,
): string {
  const labels = getPinDisplayLabels(pin, platform, false, pinLabels);
  return [labels.primary, labels.secondary].filter(Boolean).join(' ');
}

function classifyPinPair(primary: GpioPin, compare: GpioPin): PinComparisonStatus {
  if (primary.type !== compare.type) {
    return 'different-type';
  }

  const sharedRoleTypes = new Set<typeof primary.type>(['power3v3', 'power5v', 'ground']);
  if (sharedRoleTypes.has(primary.type)) {
    return 'matching';
  }

  if (primary.name === compare.name && primary.name !== 'NC') {
    return 'matching';
  }

  return 'same-type';
}

export function comparePlatforms(
  primary: GpioPlatform,
  compare: GpioPlatform,
  pinLabels?: PinLabelStrings,
): PlatformComparisonSummary {
  const rows: PlatformPinComparisonRow[] = [];

  for (let physical = 1; physical <= primary.pinCount; physical += 1) {
    const primaryPin = primary.pins.find((pin) => pin.physical === physical);
    const comparePin = compare.pins.find((pin) => pin.physical === physical);
    if (!primaryPin || !comparePin) continue;

    const status = classifyPinPair(primaryPin, comparePin);
    rows.push({
      physical,
      primary: primaryPin,
      compare: comparePin,
      status,
      primaryLabel: pinSummaryLabel(primaryPin, primary, pinLabels),
      compareLabel: pinSummaryLabel(comparePin, compare, pinLabels),
    });
  }

  return {
    total: rows.length,
    matching: rows.filter((row) => row.status === 'matching').length,
    sameType: rows.filter((row) => row.status === 'same-type').length,
    differentType: rows.filter((row) => row.status === 'different-type').length,
    rows,
  };
}
