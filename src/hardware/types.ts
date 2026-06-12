export type PinType =
  | 'power3v3'
  | 'power5v'
  | 'ground'
  | 'gpio'
  | 'spi'
  | 'i2c'
  | 'uart'
  | 'pcm';

export type PinAssignmentGroup = 'power' | 'ground' | 'spi' | 'gpio' | 'input';

export type HardwareKind = 'hat' | 'bonnet' | 'shield' | 'module';

export type RegistryCategory = 'sbc' | 'hats';

export type HardwareCategory = 'display' | 'sensor' | 'audio' | 'io' | 'other';

export interface GpioPin {
  physical: number;
  name: string;
  /** Raspberry Pi BCM numbering. */
  bcm?: number;
  /** Linux GPIO number (e.g. Radxa). */
  gpioNumber?: number;
  /** SoC bank name (e.g. GPIO1_A0 on Radxa). */
  bankName?: string;
  type: PinType;
  altFunctions?: string[];
  notes?: string;
}

export interface SpiBusSignal {
  signal: string;
  physical: number;
  bcm?: number;
  gpioNumber?: number;
}

export interface SpiBus {
  id: string;
  name: string;
  description: string;
  defaultNote?: string;
  enableOverlay?: string;
  signals: SpiBusSignal[];
}

export type DeviceTreeOverlayCategory =
  | 'i2c'
  | 'spi'
  | 'uart'
  | 'pwm'
  | 'can'
  | 'other';

export interface DeviceTreeOverlaySignal {
  name: string;
  bankName?: string;
  physical?: number;
}

export interface DeviceTreeOverlayParameter {
  name: string;
  description: string;
  required?: boolean;
  default?: string;
  values?: string;
}

export interface DeviceTreeOverlay {
  id: string;
  category: DeviceTreeOverlayCategory;
  description: string;
  deviceNode?: string;
  signals?: DeviceTreeOverlaySignal[];
  usage: string;
  parameters?: DeviceTreeOverlayParameter[];
  notes?: string;
}

export interface DeviceTreeConfig {
  documentationUrl: string;
  modernDocumentationUrl?: string;
  chipFamily: string;
  overlayDirectory: string;
  configPath: string;
  fdtfileExample?: string;
  intro?: string;
  exampleConfig?: string;
  overlays: DeviceTreeOverlay[];
}

export interface BoardPointMm {
  x: number;
  y: number;
}

export interface BoardMountingHole extends BoardPointMm {
  diameterMm?: number;
  hatCompatible?: boolean;
}

export interface BoardGpioHeaderPlacement {
  /** Pin 1 center, mm from board top-left. */
  pin1: BoardPointMm;
  pitchMm?: number;
  columns?: number;
  rows?: number;
}

/** Mechanical class aligned with Raspberry Pi board families. */
export type PiFormFactorClass = 'rpi-a' | 'rpi-b' | 'rpi-zero';

export interface BoardFormFactorVariant {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
  offsetXMm?: number;
  offsetYMm?: number;
  formFactorClass?: PiFormFactorClass;
}

export interface BoardFormFactorFamily {
  referenceWidthMm: number;
  referenceHeightMm: number;
  label: string;
  variants: BoardFormFactorVariant[];
}

export interface BoardFormFactor {
  widthMm: number;
  heightMm: number;
  label: string;
  /** Pi-family mechanical class (Rpi A, Rpi B, Rpi Zero). */
  formFactorClass?: PiFormFactorClass;
  mountingHoles?: BoardMountingHole[];
  gpioHeader: BoardGpioHeaderPlacement;
  notes?: string;
  family?: BoardFormFactorFamily;
}

export interface GpioPlatform {
  id: string;
  name: string;
  shortName?: string;
  pinCount: number;
  orientationHint: string;
  documentationUrl?: string;
  productUrl?: string;
  notes?: string;
  /** Column label for the SoC GPIO number in tables (e.g. BCM vs GPIO). */
  gpioNumberLabel?: string;
  spiPinoutDescription?: string;
  formFactor?: BoardFormFactor;
  pins: GpioPin[];
  spiBuses?: SpiBus[];
  deviceTree?: DeviceTreeConfig;
}

export interface PinAssignment {
  physical: number;
  signal: string;
  description: string;
  group: PinAssignmentGroup;
  bcm?: number;
}

export interface HardwareSpecifications {
  displaySize?: string;
  resolution?: string;
  colors?: string[];
  controller?: string;
  interface?: string[];
  operatingVoltage?: string;
  features?: string[];
  [key: string]: string | string[] | undefined;
}

export interface HardwareDeviceConfig {
  id: string;
  platformId: string;
  kind: HardwareKind;
  category: HardwareCategory;
  name: string;
  shortName: string;
  vendor: string;
  description: string;
  /** Assigned from canonical palette in src/hardware/colors.ts */
  color?: string;
  documentationUrl: string;
  productUrl?: string;
  /** Path or URL to product image (e.g. /hats/waveshare-epaper-2.13.jpg). */
  imageUrl?: string;
  specifications: HardwareSpecifications;
  pinAssignments: PinAssignment[];
  tags?: string[];
}

export interface SbcHardwareInfo {
  soc: string;
  socFamily?: string;
  cpu?: string;
  gpu?: string;
  ram?: string;
  storage?: string;
  connectivity?: string[];
  formFactor?: string;
}

export interface WiringOpBoardInfo {
  releaseId: string;
  model: string;
}

export interface WiringXBoardInfo {
  setupId: string;
  documentationPath: string;
  wiringxGpioCount?: number;
  alternateSetupIds?: string[];
}

export interface SbcRegistryEntry {
  id: string;
  platformId: string;
  name: string;
  shortName?: string;
  vendor: string;
  description: string;
  documentationUrl?: string;
  productUrl?: string;
  imageUrl?: string;
  tags?: string[];
  hardware?: SbcHardwareInfo;
  specifications?: HardwareSpecifications;
  /** wiringOP /etc/orangepi-release detection metadata. */
  wiringOp?: WiringOpBoardInfo;
  /** wiringX wiringXSetup() platform string and manual reference. */
  wiringX?: WiringXBoardInfo;
}

export type WiringPiCompatibility = 'high' | 'moderate' | 'low' | 'none';

export interface GpioLibraryLink {
  label: string;
  url: string;
}

export interface GpioLibraryEntry {
  id: string;
  name: string;
  shortName?: string;
  maintainer: string;
  description: string;
  repositoryUrl: string;
  documentationUrl?: string;
  additionalUrls?: GpioLibraryLink[];
  primaryTargets: string;
  wiringPiCompatibility: WiringPiCompatibility;
  languages: string[];
  bestFor: string;
  /** Platform IDs from this registry where the library is a practical choice. */
  supportedPlatformIds: string[];
  tags?: string[];
  notes?: string;
}

export interface HardwareRegistryConfig {
  version: number;
  defaultPlatformId: string;
  sbcs: SbcRegistryEntry[];
  hats: HardwareDeviceConfig[];
  gpioLibraries?: GpioLibraryEntry[];
}

export interface HardwareDevice extends Omit<HardwareDeviceConfig, 'color'> {
  color: string;
  /** Pin assignments keyed by physical pin number. */
  pinsByPhysical: ReadonlyMap<number, PinAssignment>;
}

export interface DevicePinUsage {
  device: HardwareDevice;
  assignment: PinAssignment;
}
