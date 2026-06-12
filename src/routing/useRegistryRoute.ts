import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { RegistryCategoryFilter, RegistryColumnFilters } from '../hardware/registryTable';
import { EMPTY_COLUMN_FILTERS } from '../hardware/registryTable';
import { MAX_SBC_COMPARE, resolveCompareSbcIds } from '../hardware/sbcCompare';
import { hardwareRegistry } from '../hardware';
import {
  applyRegistrySearchPatch,
  parseRegistrySearchParams,
  registrySearchPatch,
} from './registrySearchParams';

export function useRegistryRoute() {
  const [searchParams, setSearchParams] = useSearchParams();

  const registryState = useMemo(() => {
    const parsed = parseRegistrySearchParams(searchParams);
    const compareSbcIds = resolveCompareSbcIds(
      parsed.compareSbcIds,
      hardwareRegistry.getSbcs(),
    );
    return { ...parsed, compareSbcIds };
  }, [searchParams]);

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

  const setCompareSbcIds = useCallback(
    (compareSbcIds: string[]) => {
      patchSearch(registrySearchPatch({ compare: compareSbcIds }));
    },
    [patchSearch],
  );

  const toggleCompareSbc = useCallback(
    (sbcId: string) => {
      const current = registryState.compareSbcIds;
      if (current.includes(sbcId)) {
        setCompareSbcIds(current.filter((id) => id !== sbcId));
        return;
      }
      if (current.length >= MAX_SBC_COMPARE) return;
      setCompareSbcIds([...current, sbcId]);
    },
    [registryState.compareSbcIds, setCompareSbcIds],
  );

  const clearCompareSbcs = useCallback(() => {
    setCompareSbcIds([]);
  }, [setCompareSbcIds]);

  return {
    ...registryState,
    setCategoryFilter,
    setColumnFilters,
    updateColumnFilter,
    clearFilters,
    setExpandedId,
    toggleExpanded,
    toggleCompareSbc,
    clearCompareSbcs,
  };
}
