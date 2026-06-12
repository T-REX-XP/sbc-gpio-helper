import hardwareRegistryConfig from '../config/hardware-registry.json';
import wiringOpSbcsConfig from '../config/wiringop-sbcs.json';
import { getCanonicalDeviceColor } from './colors';
import { PLATFORM_CONFIGS } from './platforms';
import type {
  DevicePinUsage,
  GpioPin,
  GpioPlatform,
  HardwareCategory,
  HardwareDevice,
  HardwareDeviceConfig,
  HardwareKind,
  HardwareRegistryConfig,
  PinAssignment,
  SbcRegistryEntry,
  GpioLibraryEntry,
} from './types';

function indexPinAssignments(assignments: PinAssignment[]): Map<number, PinAssignment> {
  const map = new Map<number, PinAssignment>();
  for (const assignment of assignments) {
    if (map.has(assignment.physical)) {
      throw new Error(
        `Duplicate pin assignment on physical pin ${assignment.physical}`,
      );
    }
    map.set(assignment.physical, assignment);
  }
  return map;
}

function normalizeDevice(config: HardwareDeviceConfig): HardwareDevice {
  return {
    ...config,
    color: getCanonicalDeviceColor(config.id),
    pinsByPhysical: indexPinAssignments(config.pinAssignments),
  };
}

function wiringOpSlugFromCuratedSbc(sbc: SbcRegistryEntry): string | undefined {
  if (sbc.shortName) {
    return sbc.shortName.toLowerCase().replace(/\s+/g, '-');
  }
  if (sbc.id.startsWith('orangepi-')) {
    return sbc.id.replace(/^orangepi-/, 'orange-pi-').replace(/-(26|30|40)pin$/, '');
  }
  return undefined;
}

function shouldIncludeWiringOpSbc(
  sbc: SbcRegistryEntry,
  config: HardwareRegistryConfig,
): boolean {
  if (config.sbcs.some((entry) => entry.id === sbc.id)) {
    return false;
  }

  const curated = config.sbcs.find((entry) => entry.platformId === sbc.platformId);
  if (!curated || curated.id !== sbc.platformId) {
    return true;
  }

  const curatedSlug = wiringOpSlugFromCuratedSbc(curated);
  return curatedSlug !== sbc.id;
}

function validateRegistry(config: HardwareRegistryConfig): void {
  const platformIds = new Set(PLATFORM_CONFIGS.map((platform) => platform.id));

  if (!platformIds.has(config.defaultPlatformId)) {
    throw new Error(`Unknown default platform "${config.defaultPlatformId}"`);
  }

  const sbcIds = new Set<string>();
  const registeredPlatformIds = new Set<string>();

  for (const sbc of config.sbcs) {
    if (sbcIds.has(sbc.id)) {
      throw new Error(`Duplicate SBC id "${sbc.id}" in hardware registry`);
    }
    sbcIds.add(sbc.id);

    if (!platformIds.has(sbc.platformId)) {
      throw new Error(`SBC "${sbc.id}" references unknown platform "${sbc.platformId}"`);
    }
    registeredPlatformIds.add(sbc.platformId);
  }

  for (const sbc of wiringOpSbcsConfig.sbcs) {
    if (!shouldIncludeWiringOpSbc(sbc, config)) continue;
    if (sbcIds.has(sbc.id)) continue;
    sbcIds.add(sbc.id);

    if (!platformIds.has(sbc.platformId)) {
      throw new Error(`wiringOP SBC "${sbc.id}" references unknown platform "${sbc.platformId}"`);
    }
    registeredPlatformIds.add(sbc.platformId);
  }

  if (!registeredPlatformIds.has(config.defaultPlatformId)) {
    throw new Error(
      `defaultPlatformId "${config.defaultPlatformId}" is not listed in registry sbcs`,
    );
  }

  const hatIds = new Set<string>();
  for (const device of config.hats) {
    if (hatIds.has(device.id)) {
      throw new Error(`Duplicate hat id "${device.id}" in hardware registry`);
    }
    hatIds.add(device.id);

    if (!registeredPlatformIds.has(device.platformId)) {
      throw new Error(
        `Hat "${device.id}" references platform "${device.platformId}" which is not registered as an SBC`,
      );
    }

    const platform = PLATFORM_CONFIGS.find((entry) => entry.id === device.platformId)!;
    for (const assignment of device.pinAssignments) {
      if (assignment.physical < 1 || assignment.physical > platform.pinCount) {
        throw new Error(
          `Hat "${device.id}" references invalid pin ${assignment.physical}`,
        );
      }
    }
  }

  const libraryIds = new Set<string>();
  for (const library of config.gpioLibraries ?? []) {
    if (libraryIds.has(library.id)) {
      throw new Error(`Duplicate GPIO library id "${library.id}" in hardware registry`);
    }
    libraryIds.add(library.id);

    for (const platformId of library.supportedPlatformIds) {
      if (!registeredPlatformIds.has(platformId)) {
        throw new Error(
          `GPIO library "${library.id}" references unknown platform "${platformId}"`,
        );
      }
    }
  }
}

export class HardwareRegistry {
  readonly version: number;
  readonly defaultPlatformId: string;
  readonly sbcs: readonly SbcRegistryEntry[];
  readonly hats: readonly HardwareDevice[];
  readonly gpioLibraries: readonly GpioLibraryEntry[];
  readonly platforms: readonly GpioPlatform[];

  private readonly platformById: ReadonlyMap<string, GpioPlatform>;
  private readonly pinsByPlatform: ReadonlyMap<string, readonly GpioPin[]>;
  private readonly pinByPlatform: ReadonlyMap<string, ReadonlyMap<number, GpioPin>>;
  private readonly hatById: ReadonlyMap<string, HardwareDevice>;
  private readonly hatsByPlatform: ReadonlyMap<string, HardwareDevice[]>;
  private readonly libraryById: ReadonlyMap<string, GpioLibraryEntry>;
  private readonly librariesByPlatform: ReadonlyMap<string, GpioLibraryEntry[]>;

  constructor(config: HardwareRegistryConfig) {
    validateRegistry(config);

    this.version = config.version;
    this.defaultPlatformId = config.defaultPlatformId;

    const wiringOpSbcs = wiringOpSbcsConfig.sbcs.filter((sbc) =>
      shouldIncludeWiringOpSbc(sbc, config),
    );
    this.sbcs = [...config.sbcs, ...wiringOpSbcs];
    this.gpioLibraries = config.gpioLibraries ?? [];

    this.platformById = new Map(PLATFORM_CONFIGS.map((platform) => [platform.id, platform]));

    const platformIdsFromSbcs = [...new Set(this.sbcs.map((sbc) => sbc.platformId))];
    this.platforms = platformIdsFromSbcs
      .map((platformId) => this.platformById.get(platformId))
      .filter((platform): platform is GpioPlatform => platform !== undefined);

    this.pinsByPlatform = new Map(
      PLATFORM_CONFIGS.map((platform) => [platform.id, platform.pins]),
    );
    this.pinByPlatform = new Map(
      PLATFORM_CONFIGS.map((platform) => [
        platform.id,
        new Map(platform.pins.map((pin) => [pin.physical, pin])),
      ]),
    );

    this.hats = config.hats.map(normalizeDevice);
    this.hatById = new Map(this.hats.map((device) => [device.id, device]));

    const hatsByPlatform = new Map<string, HardwareDevice[]>();
    for (const platform of this.platforms) {
      hatsByPlatform.set(platform.id, []);
    }
    for (const hat of this.hats) {
      hatsByPlatform.get(hat.platformId)!.push(hat);
    }
    this.hatsByPlatform = hatsByPlatform;

    this.libraryById = new Map(this.gpioLibraries.map((library) => [library.id, library]));

    const librariesByPlatform = new Map<string, GpioLibraryEntry[]>();
    for (const platform of this.platforms) {
      librariesByPlatform.set(platform.id, []);
    }
    for (const library of this.gpioLibraries) {
      for (const platformId of library.supportedPlatformIds) {
        librariesByPlatform.get(platformId)?.push(library);
      }
    }
    for (const libraries of librariesByPlatform.values()) {
      libraries.sort((a, b) => a.name.localeCompare(b.name));
    }
    this.librariesByPlatform = librariesByPlatform;
  }

  getPlatform(platformId: string): GpioPlatform | undefined {
    return this.platformById.get(platformId);
  }

  getSbc(id: string): SbcRegistryEntry | undefined {
    return this.sbcs.find((sbc) => sbc.id === id);
  }

  getSbcForPlatform(platformId: string): SbcRegistryEntry | undefined {
    return this.sbcs.find((sbc) => sbc.platformId === platformId);
  }

  getSbcs(): readonly SbcRegistryEntry[] {
    return this.sbcs;
  }

  getGpioLibraries(): readonly GpioLibraryEntry[] {
    return this.gpioLibraries;
  }

  getGpioLibrary(id: string): GpioLibraryEntry | undefined {
    return this.libraryById.get(id);
  }

  getGpioLibrariesForPlatform(platformId: string): readonly GpioLibraryEntry[] {
    return this.librariesByPlatform.get(platformId) ?? [];
  }

  getHats(platformId?: string): readonly HardwareDevice[] {
    if (platformId === undefined) return this.hats;
    return this.hatsByPlatform.get(platformId) ?? [];
  }

  /** @deprecated Use getHats() — kept for existing call sites. */
  getDevices(platformId?: string): readonly HardwareDevice[] {
    return this.getHats(platformId);
  }

  getPins(platformId: string): readonly GpioPin[] {
    return this.pinsByPlatform.get(platformId) ?? [];
  }

  getPinByPhysical(platformId: string, physical: number): GpioPin | undefined {
    return this.pinByPlatform.get(platformId)?.get(physical);
  }

  getDevice(id: string): HardwareDevice | undefined {
    return this.hatById.get(id);
  }

  getDeviceColor(deviceId: string): string {
    return getCanonicalDeviceColor(deviceId);
  }

  getDevicesByIds(ids: string[]): HardwareDevice[] {
    return ids
      .map((id) => this.hatById.get(id))
      .filter((device): device is HardwareDevice => device !== undefined);
  }

  getDevicesByKind(kind: HardwareKind, platformId?: string): HardwareDevice[] {
    return this.getHats(platformId).filter((device) => device.kind === kind);
  }

  getDevicesByCategory(category: HardwareCategory, platformId?: string): HardwareDevice[] {
    return this.getHats(platformId).filter((device) => device.category === category);
  }

  getPinUsages(devices: HardwareDevice[], physical: number): DevicePinUsage[] {
    return devices
      .map((device) => {
        const assignment = device.pinsByPhysical.get(physical);
        return assignment ? { device, assignment } : null;
      })
      .filter((usage): usage is DevicePinUsage => usage !== null)
      .sort((a, b) => a.device.id.localeCompare(b.device.id));
  }

  getUniqueDevicesFromUsages(usages: DevicePinUsage[]): HardwareDevice[] {
    const seen = new Set<string>();
    const result: HardwareDevice[] = [];
    for (const usage of usages) {
      if (!seen.has(usage.device.id)) {
        seen.add(usage.device.id);
        result.push(usage.device);
      }
    }
    return result.sort((a, b) => a.id.localeCompare(b.id));
  }

  isShareablePin(assignment: PinAssignment): boolean {
    return assignment.group === 'power' || assignment.group === 'ground';
  }

  hasPinConflict(usages: DevicePinUsage[]): boolean {
    if (usages.length <= 1) return false;
    if (usages.every((usage) => this.isShareablePin(usage.assignment))) {
      return false;
    }
    const signals = new Set(usages.map((usage) => usage.assignment.signal));
    return signals.size > 1;
  }

  findConflicts(deviceIds: string[]): Map<number, DevicePinUsage[]> {
    const devices = this.getDevicesByIds(deviceIds);
    const conflicts = new Map<number, DevicePinUsage[]>();
    const platformId = devices[0]?.platformId;
    if (!platformId) return conflicts;

    for (const pin of this.getPins(platformId)) {
      const usages = this.getPinUsages(devices, pin.physical);
      if (this.hasPinConflict(usages)) {
        conflicts.set(pin.physical, usages);
      }
    }

    return conflicts;
  }
}

export const hardwareRegistry = new HardwareRegistry(
  hardwareRegistryConfig as HardwareRegistryConfig,
);
