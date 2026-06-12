import type { GpioPin, HardwareDevice, PinType } from './types';
import { hardwareRegistry } from './registry';
import { pinHasSpiFunction } from './spi';

export type LegendFilter =
  | { kind: 'pin-type'; type: PinType }
  | { kind: 'device'; deviceId: string }
  | { kind: 'status'; status: 'conflict' };

export function legendFilterKey(filter: LegendFilter): string {
  switch (filter.kind) {
    case 'pin-type':
      return `pin-type:${filter.type}`;
    case 'device':
      return `device:${filter.deviceId}`;
    case 'status':
      return `status:${filter.status}`;
  }
}

export function parseLegendFilterKey(key: string): LegendFilter | null {
  if (key.startsWith('pin-type:')) {
    return { kind: 'pin-type', type: key.slice(9) as PinType };
  }
  if (key.startsWith('device:')) {
    return { kind: 'device', deviceId: key.slice(7) };
  }
  if (key === 'status:conflict') {
    return { kind: 'status', status: 'conflict' };
  }
  return null;
}

export function pinMatchesLegendFilter(
  platformId: string,
  pin: GpioPin,
  filter: LegendFilter,
  _selectedDevices: HardwareDevice[],
  conflictPins: ReadonlySet<number>,
): boolean {
  switch (filter.kind) {
    case 'pin-type':
      if (filter.type === 'spi') return pinHasSpiFunction(platformId, pin);
      return pin.type === filter.type;
    case 'device': {
      const device = hardwareRegistry.getDevice(filter.deviceId);
      return device?.pinsByPhysical.has(pin.physical) ?? false;
    }
    case 'status':
      return conflictPins.has(pin.physical);
  }
}

export function pinMatchesLegendFilters(
  platformId: string,
  pin: GpioPin,
  filterKeys: readonly string[],
  selectedDevices: HardwareDevice[],
  conflictPins: ReadonlySet<number>,
): boolean {
  if (filterKeys.length === 0) return true;

  return filterKeys.some((key) => {
    const filter = parseLegendFilterKey(key);
    return (
      filter !== null &&
      pinMatchesLegendFilter(platformId, pin, filter, selectedDevices, conflictPins)
    );
  });
}
