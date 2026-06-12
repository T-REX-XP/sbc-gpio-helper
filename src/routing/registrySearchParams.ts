import type { RegistryCategoryFilter, RegistryColumnFilters } from '../hardware/registryTable';
import { EMPTY_COLUMN_FILTERS } from '../hardware/registryTable';

export interface RegistrySearchState {
  category: RegistryCategoryFilter;
  columnFilters: RegistryColumnFilters;
  expandedId: string | null;
  compareSbcIds: string[];
}

const CATEGORY_VALUES = new Set<RegistryCategoryFilter>(['all', 'sbc', 'hats', 'libraries']);

const COLUMN_KEYS = [
  'name',
  'vendor',
  'soc',
  'platform',
  'kind',
  'productCategory',
  'interfaces',
  'tags',
] as const satisfies readonly (keyof RegistryColumnFilters)[];

export function parseRegistrySearchParams(params: URLSearchParams): RegistrySearchState {
  const categoryRaw = params.get('category');
  const category = CATEGORY_VALUES.has(categoryRaw as RegistryCategoryFilter)
    ? (categoryRaw as RegistryCategoryFilter)
    : 'all';

  const columnFilters: RegistryColumnFilters = { ...EMPTY_COLUMN_FILTERS };
  for (const key of COLUMN_KEYS) {
    columnFilters[key] = params.get(key) ?? '';
  }

  const expandedId = params.get('expand') || null;

  const compareRaw = params.get('compare');
  const compareSbcIds = compareRaw
    ? compareRaw.split(',').map((id) => id.trim()).filter(Boolean)
    : [];

  return { category, columnFilters, expandedId, compareSbcIds };
}

export function registrySearchPatch(
  patch: Partial<{
    category: RegistryCategoryFilter | null;
    columnFilters: RegistryColumnFilters | null;
    expand: string | null;
    compare: string[] | null;
  }>,
): Record<string, string | null> {
  const result: Record<string, string | null> = {};

  if ('category' in patch) {
    result.category = patch.category && patch.category !== 'all' ? patch.category : null;
  }

  if ('columnFilters' in patch && patch.columnFilters) {
    for (const key of COLUMN_KEYS) {
      const value = patch.columnFilters[key].trim();
      result[key] = value || null;
    }
  }

  if ('expand' in patch) {
    result.expand = patch.expand ?? null;
  }

  if ('compare' in patch) {
    result.compare =
      patch.compare && patch.compare.length > 0 ? patch.compare.join(',') : null;
  }

  return result;
}

export function applyRegistrySearchPatch(
  params: URLSearchParams,
  patch: Record<string, string | null>,
): URLSearchParams {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
  }
  return next;
}
