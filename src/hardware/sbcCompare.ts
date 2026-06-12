import { getFormFactorClassLabel } from './formFactor';
import { formatPlatformFormFactor } from './formFactor';
import { hardwareRegistry } from './registry';
import type { GpioPlatform, PiFormFactorClass, SbcRegistryEntry } from './types';

export const MAX_SBC_COMPARE = 4;

export interface SbcCompareColumn {
  sbc: SbcRegistryEntry;
  displayName: string;
}

function specValue(value: string | string[] | undefined): string {
  if (!value) return '';
  return Array.isArray(value) ? value.join(', ') : value;
}

function joinOrEmpty(values: string[] | undefined, separator: string): string {
  if (!values?.length) return '';
  return values.join(separator);
}

function formatLibraries(platformId: string): string {
  const libraries = hardwareRegistry.getGpioLibrariesForPlatform(platformId);
  if (libraries.length === 0) return '';
  return libraries.map((lib) => lib.shortName ?? lib.name).join(' · ');
}

export interface SbcCompareSpecRow {
  id: string;
  values: string[];
}

export function resolveCompareSbcIds(
  ids: readonly string[],
  sbcs: readonly SbcRegistryEntry[],
): string[] {
  const valid = new Set(sbcs.map((sbc) => sbc.id));
  const seen = new Set<string>();
  const result: string[] = [];
  for (const id of ids) {
    if (!valid.has(id) || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
    if (result.length >= MAX_SBC_COMPARE) break;
  }
  return result;
}

export function buildSbcCompareColumns(ids: readonly string[]): SbcCompareColumn[] {
  return ids
    .map((id) => hardwareRegistry.getSbc(id))
    .filter((sbc): sbc is SbcRegistryEntry => sbc != null)
    .map((sbc) => ({
      sbc,
      displayName: sbc.shortName ?? sbc.name,
    }));
}

type SpecField = {
  id: string;
  value: (sbc: SbcRegistryEntry, platform: GpioPlatform | undefined) => string;
};

const SPEC_FIELDS: SpecField[] = [
  { id: 'vendor', value: (sbc) => sbc.vendor },
  { id: 'soc', value: (sbc) => sbc.hardware?.soc ?? '' },
  { id: 'socFamily', value: (sbc) => sbc.hardware?.socFamily ?? '' },
  { id: 'cpu', value: (sbc) => sbc.hardware?.cpu ?? '' },
  { id: 'gpu', value: (sbc) => sbc.hardware?.gpu ?? '' },
  { id: 'ram', value: (sbc) => sbc.hardware?.ram ?? '' },
  { id: 'storage', value: (sbc) => sbc.hardware?.storage ?? '' },
  {
    id: 'connectivity',
    value: (sbc) => joinOrEmpty(sbc.hardware?.connectivity, ' · '),
  },
  {
    id: 'gpioHeader',
    value: (sbc) =>
      specValue(sbc.specifications?.gpioHeader) || sbc.hardware?.formFactor || '',
  },
  {
    id: 'gpioNumbering',
    value: (sbc) => specValue(sbc.specifications?.gpioNumbering),
  },
  {
    id: 'interfaces',
    value: (sbc) => {
      const iface = sbc.specifications?.interface;
      if (!iface) return '';
      return Array.isArray(iface) ? iface.join(', ') : iface;
    },
  },
  {
    id: 'pinCount',
    value: (_sbc, platform) => (platform?.pinCount ? String(platform.pinCount) : ''),
  },
  { id: 'platform', value: (sbc) => sbc.platformId },
  {
    id: 'pcbSize',
    value: (_sbc, platform) => {
      if (!platform?.formFactor) return '';
      return `${platform.formFactor.widthMm} × ${platform.formFactor.heightMm} mm`;
    },
  },
  {
    id: 'formFactorProfile',
    value: () => '',
  },
  {
    id: 'formFactorClass',
    value: () => '',
  },
  { id: 'libraries', value: (sbc) => formatLibraries(sbc.platformId) },
  {
    id: 'wiringX',
    value: (sbc) => {
      if (!sbc.wiringX) return '';
      const ids = [sbc.wiringX.setupId, ...(sbc.wiringX.alternateSetupIds ?? [])];
      return ids.join(' · ');
    },
  },
  { id: 'wiringOp', value: (sbc) => sbc.wiringOp?.releaseId ?? '' },
];

export function buildSbcCompareSpecRows(
  columns: readonly SbcCompareColumn[],
  translateClass?: (cls: PiFormFactorClass) => string,
): SbcCompareSpecRow[] {
  if (columns.length === 0) return [];

  return SPEC_FIELDS.map((field) => ({
    id: field.id,
    values: columns.map((col) => {
      const platform = hardwareRegistry.getPlatform(col.sbc.platformId);
      if (field.id === 'formFactorProfile') {
        return formatPlatformFormFactor(platform, translateClass) ?? '';
      }
      if (field.id === 'formFactorClass') {
        return getFormFactorClassLabel(platform?.formFactor, translateClass) ?? '';
      }
      return field.value(col.sbc, platform);
    }),
  })).filter((row) => row.values.some((value) => value.trim().length > 0));
}
