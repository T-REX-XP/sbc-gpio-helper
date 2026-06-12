import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { RegistryCategoryFilter, RegistryColumnFilters } from '../hardware/registryTable';
import { EMPTY_COLUMN_FILTERS } from '../hardware/registryTable';
import {
  applyRegistrySearchPatch,
  parseRegistrySearchParams,
  registrySearchPatch,
} from './registrySearchParams';

export function useRegistryRoute() {
  const [searchParams, setSearchParams] = useSearchParams();

  const registryState = useMemo(
    () => parseRegistrySearchParams(searchParams),
    [searchParams],
  );

  const patchSearch = useCallback(
    (patch: Record<string, string | null>, replace = false) => {
      setSearchParams(applyRegistrySearchPatch(searchParams, patch), { replace });
    },
    [searchParams, setSearchParams],
  );

  const setCategoryFilter = useCallback(
    (category: RegistryCategoryFilter) => {
      patchSearch(registrySearchPatch({ category }));
    },
    [patchSearch],
  );

  const setColumnFilters = useCallback(
    (columnFilters: RegistryColumnFilters) => {
      patchSearch(registrySearchPatch({ columnFilters }));
    },
    [patchSearch],
  );

  const updateColumnFilter = useCallback(
    (key: keyof RegistryColumnFilters, value: string) => {
      patchSearch(
        registrySearchPatch({
          columnFilters: { ...registryState.columnFilters, [key]: value },
        }),
      );
    },
    [patchSearch, registryState.columnFilters],
  );

  const clearFilters = useCallback(() => {
    patchSearch(
      registrySearchPatch({
        category: 'all',
        columnFilters: EMPTY_COLUMN_FILTERS,
      }),
    );
  }, [patchSearch]);

  const setExpandedId = useCallback(
    (expandedId: string | null) => {
      patchSearch(registrySearchPatch({ expand: expandedId }));
    },
    [patchSearch],
  );

  const toggleExpanded = useCallback(
    (id: string) => {
      setExpandedId(registryState.expandedId === id ? null : id);
    },
    [registryState.expandedId, setExpandedId],
  );

  return {
    ...registryState,
    setCategoryFilter,
    setColumnFilters,
    updateColumnFilter,
    clearFilters,
    setExpandedId,
    toggleExpanded,
  };
}
