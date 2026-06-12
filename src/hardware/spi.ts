import { PLATFORM_CONFIGS } from './platforms';
import type { GpioPin, HardwareDevice, SpiBus } from './types';

export interface SpiPinRole {
  busId: string;
  busName: string;
  signal: string;
  label: string;
}

export type { SpiBus, SpiBusSignal } from './types';
export type SpiSignal = import('./types').SpiBusSignal;

const spiBusesByPlatform = new Map<string, readonly SpiBus[]>();
const roleByPlatform = new Map<string, Map<number, SpiPinRole>>();

for (const platform of PLATFORM_CONFIGS) {
  const buses = platform.spiBuses ?? [];
  spiBusesByPlatform.set(platform.id, buses);

  const roleMap = new Map<number, SpiPinRole>();
  for (const bus of buses) {
    for (const entry of bus.signals) {
      roleMap.set(entry.physical, {
        busId: bus.id,
        busName: bus.name,
        signal: entry.signal,
        label: `${bus.name} ${entry.signal}`,
      });
    }
  }
  roleByPlatform.set(platform.id, roleMap);
}

export function getSpiBuses(platformId: string): readonly SpiBus[] {
  return spiBusesByPlatform.get(platformId) ?? [];
}

export function getSpiBus(platformId: string, busId: string): SpiBus | undefined {
  return getSpiBuses(platformId).find((bus) => bus.id === busId);
}

export function getSpiRole(platformId: string, physical: number): SpiPinRole | undefined {
  return roleByPlatform.get(platformId)?.get(physical);
}

export function getAllSpiPhysicalPins(platformId: string): ReadonlySet<number> {
  return new Set(roleByPlatform.get(platformId)?.keys() ?? []);
}

export function pinHasSpiFunction(platformId: string, pin: GpioPin): boolean {
  return pin.type === 'spi' || (roleByPlatform.get(platformId)?.has(pin.physical) ?? false);
}

export function deviceUsesSpi(device: HardwareDevice): boolean {
  return [...device.pinsByPhysical.values()].some((assignment) => assignment.group === 'spi');
}

export function selectedDevicesUseSpi(devices: readonly HardwareDevice[]): boolean {
  return devices.some(deviceUsesSpi);
}

export function isSpiVisualizationActive(
  platformId: string,
  legendFilters: readonly string[],
  selectedDevices: readonly HardwareDevice[],
): boolean {
  if (getSpiBuses(platformId).length === 0) return false;
  return (
    legendFilters.includes('pin-type:spi') || selectedDevicesUseSpi(selectedDevices)
  );
}

export function getSpiSignalsUsedByDevices(
  _platformId: string,
  devices: readonly HardwareDevice[],
): Map<number, string[]> {
  const map = new Map<number, string[]>();

  for (const device of devices) {
    for (const assignment of device.pinsByPhysical.values()) {
      if (assignment.group !== 'spi') continue;
      const existing = map.get(assignment.physical) ?? [];
      const entry = `${device.shortName}: ${assignment.signal}`;
      if (!existing.includes(entry)) {
        map.set(assignment.physical, [...existing, entry]);
      }
    }
  }

  return map;
}
