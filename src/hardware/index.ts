export { DEVICE_COLORS, DEFAULT_DEVICE_COLOR, getCanonicalDeviceColor } from './colors';
export {
  legendFilterKey,
  parseLegendFilterKey,
  pinMatchesLegendFilter,
  pinMatchesLegendFilters,
} from './legendFilters';
export type { LegendFilter } from './legendFilters';
export { hardwareRegistry, HardwareRegistry } from './registry';
export {
  buildRegistryTableRows,
  EMPTY_COLUMN_FILTERS,
  filterRegistryRows,
  hasActiveColumnFilters,
} from './registryTable';
export type {
  RegistryCategoryFilter,
  RegistryColumnFilters,
  RegistryTableRow,
} from './registryTable';
export { getPinDisplayLabels, getPinGpioRef } from './pinLabels';
export type { PinDisplayLabels, PinLabelStrings } from './pinLabels';
export {
  deviceUsesSpi,
  getAllSpiPhysicalPins,
  getSpiBus,
  getSpiBuses,
  getSpiRole,
  getSpiSignalsUsedByDevices,
  isSpiVisualizationActive,
  pinHasSpiFunction,
  selectedDevicesUseSpi,
} from './spi';
export { PLATFORM_CONFIGS } from './platforms';
export { comparePlatforms } from './platformComparison';
export type {
  PinComparisonStatus,
  PlatformComparisonSummary,
  PlatformPinComparisonRow,
} from './platformComparison';
export { getPlatformAccentColor, PLATFORM_ACCENT_COLORS } from './platformColors';
export {
  formatPlatformBoardSize,
  formatPlatformFormFactor,
  getFamilyPortraitLayout,
  getFormFactor,
  getFormFactorClassLabel,
  getFormFactorMetrics,
  getHeaderColumns,
  getHeaderLengthMm,
  getHeaderPitch,
  getHeaderRows,
  getHeaderWidthMm,
  getPlatformHeaderRowCount,
  getVariantCornerHoles,
  hasFormFactor,
  PI_FORM_FACTOR_LABELS,
} from './formFactor';
export {
  formatOverlaySignals,
  getCategoryLabel,
  getOverlayPhysicalPins,
  groupOverlaysByCategory,
} from './deviceTree';
export type { SpiPinRole, SpiSignal } from './spi';
export type { SpiBus, SpiBusSignal } from './types';
export type {
  BoardFormFactor,
  BoardFormFactorFamily,
  BoardFormFactorVariant,
  BoardGpioHeaderPlacement,
  BoardMountingHole,
  BoardPointMm,
} from './types';
export type {
  DeviceTreeConfig,
  DeviceTreeOverlay,
  DeviceTreeOverlayCategory,
  DeviceTreeOverlayParameter,
  DeviceTreeOverlaySignal,
  DevicePinUsage,
  GpioPin,
  GpioPlatform,
  HardwareCategory,
  HardwareDevice,
  HardwareDeviceConfig,
  HardwareKind,
  HardwareRegistryConfig,
  HardwareSpecifications,
  PinAssignment,
  PinAssignmentGroup,
  PinType,
  PiFormFactorClass,
  RegistryCategory,
  SbcHardwareInfo,
  SbcRegistryEntry,
} from './types';
