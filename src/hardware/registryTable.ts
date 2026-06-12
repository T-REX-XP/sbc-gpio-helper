import { formatPlatformFormFactor } from './formFactor';
import { hardwareRegistry } from './registry';
import type { HardwareDevice, SbcRegistryEntry } from './types';

export type RegistryCategoryFilter = 'all' | 'sbc' | 'hats';

export interface RegistryColumnFilters {
  name: string;
  vendor: string;
  soc: string;
  platform: string;
  kind: string;
  productCategory: string;
  interfaces: string;
  tags: string;
}

export const EMPTY_COLUMN_FILTERS: RegistryColumnFilters = {
  name: '',
  vendor: '',
  soc: '',
  platform: '',
  kind: '',
  productCategory: '',
  interfaces: '',
  tags: '',
};

export interface RegistryTableRow {
  id: string;
  registryCategory: 'sbc' | 'hats';
  name: string;
  vendor: string;
  soc: string;
  platformId: string;
  kind: string;
  productCategory: string;
  interfaces: string;
  pinCount: number;
  formFactor: string;
  tags: string;
  description: string;
  documentationUrl?: string;
  productUrl?: string;
  sbc?: SbcRegistryEntry;
  hat?: HardwareDevice;
}

function formatInterfaces(
  specifications: Record<string, string | string[] | undefined> | undefined,
): string {
  if (!specifications?.interface) return '';

  const iface = specifications.interface;
  return Array.isArray(iface) ? iface.join(', ') : iface;
}

function formatTags(tags: string[] | undefined): string {
  return tags?.join(', ') ?? '';
}

export function buildRegistryTableRows(
  sbcs: readonly SbcRegistryEntry[],
  hats: readonly HardwareDevice[],
): RegistryTableRow[] {
  const sbcRows: RegistryTableRow[] = sbcs.map((sbc) => {
    const platform = hardwareRegistry.getPlatform(sbc.platformId);
    return {
      id: sbc.id,
      registryCategory: 'sbc',
      name: sbc.shortName ?? sbc.name,
      vendor: sbc.vendor,
      soc: sbc.hardware?.soc ?? '',
      platformId: sbc.platformId,
      kind: 'SBC',
      productCategory: platform?.gpioNumberLabel ?? 'GPIO',
      interfaces: formatInterfaces(sbc.specifications),
      pinCount: platform?.pinCount ?? 0,
      formFactor: formatPlatformFormFactor(platform),
      tags: formatTags(sbc.tags),
      description: sbc.description,
      documentationUrl: sbc.documentationUrl,
      productUrl: sbc.productUrl,
      sbc,
    };
  });

  const hatRows: RegistryTableRow[] = hats.map((hat) => ({
    id: hat.id,
    registryCategory: 'hats',
    name: hat.shortName ?? hat.name,
    vendor: hat.vendor,
    soc: '',
    platformId: hat.platformId,
    kind: hat.kind,
    productCategory: hat.category,
    interfaces: formatInterfaces(hat.specifications),
    pinCount: hat.pinAssignments.length,
    formFactor: '',
    tags: formatTags(hat.tags),
    description: hat.description,
    documentationUrl: hat.documentationUrl,
    productUrl: hat.productUrl,
    hat,
  }));

  return [...sbcRows, ...hatRows].sort((a, b) => a.name.localeCompare(b.name));
}

function matchesFilter(value: string, filter: string): boolean {
  if (!filter.trim()) return true;
  return value.toLowerCase().includes(filter.trim().toLowerCase());
}

export function filterRegistryRows(
  rows: readonly RegistryTableRow[],
  categoryFilter: RegistryCategoryFilter,
  columnFilters: RegistryColumnFilters,
): RegistryTableRow[] {
  return rows.filter((row) => {
    if (categoryFilter !== 'all' && row.registryCategory !== categoryFilter) {
      return false;
    }

    const nameFilter = columnFilters.name.trim();
    const matchesNameOrId =
      !nameFilter ||
      row.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
      row.id.toLowerCase().includes(nameFilter.toLowerCase());

    return (
      matchesNameOrId &&
      matchesFilter(row.vendor, columnFilters.vendor) &&
      matchesFilter(row.soc, columnFilters.soc) &&
      matchesFilter(row.platformId, columnFilters.platform) &&
      matchesFilter(row.kind, columnFilters.kind) &&
      matchesFilter(row.productCategory, columnFilters.productCategory) &&
      matchesFilter(row.interfaces, columnFilters.interfaces) &&
      matchesFilter(row.tags, columnFilters.tags)
    );
  });
}

export function hasActiveColumnFilters(columnFilters: RegistryColumnFilters): boolean {
  return Object.values(columnFilters).some((value) => value.trim().length > 0);
}
