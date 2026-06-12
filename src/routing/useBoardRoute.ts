import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { hardwareRegistry } from '../hardware';
import {
  applySearchPatch,
  boardSearchPatch,
  parseBoardSearchParams,
  sanitizeBoardSearchForPlatform,
  type PinoutView,
} from './boardSearchParams';
import { setLastPlatformId } from './lastPlatform';

export function useBoardRoute() {
  const { platformId: platformParam } = useParams<{ platformId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const platformId = useMemo(() => {
    if (platformParam && hardwareRegistry.getPlatform(platformParam)) {
      return platformParam;
    }
    return hardwareRegistry.defaultPlatformId;
  }, [platformParam]);

  const platform = hardwareRegistry.getPlatform(platformId);

  useEffect(() => {
    if (platformParam === platformId) return;
    navigate(
      {
        pathname: `/board/${platformId}`,
        search: sanitizeBoardSearchForPlatform(searchParams, platformId).toString(),
      },
      { replace: true },
    );
  }, [platformParam, platformId, navigate, searchParams]);

  useEffect(() => {
    setLastPlatformId(platformId);
  }, [platformId]);

  const boardState = useMemo(
    () => parseBoardSearchParams(searchParams, platformId),
    [searchParams, platformId],
  );

  const patchSearch = useCallback(
    (patch: Record<string, string | null>, replace = false) => {
      setSearchParams(applySearchPatch(searchParams, patch), { replace });
    },
    [searchParams, setSearchParams],
  );

  const setPlatformId = useCallback(
    (nextPlatformId: string) => {
      const nextSearch = sanitizeBoardSearchForPlatform(searchParams, nextPlatformId);
      if (nextPlatformId === boardState.comparePlatformId) {
        nextSearch.delete('compare');
      }
      navigate({
        pathname: `/board/${nextPlatformId}`,
        search: nextSearch.toString(),
      });
    },
    [boardState.comparePlatformId, navigate, searchParams],
  );

  const setComparePlatformId = useCallback(
    (compareId: string | null) => {
      patchSearch(boardSearchPatch({ compare: compareId }));
    },
    [patchSearch],
  );

  const swapComparePlatforms = useCallback(() => {
    if (!boardState.comparePlatformId) return;
    const nextSearch = sanitizeBoardSearchForPlatform(searchParams, boardState.comparePlatformId);
    navigate({
      pathname: `/board/${boardState.comparePlatformId}`,
      search: nextSearch.toString(),
    });
  }, [boardState.comparePlatformId, navigate, searchParams]);

  const setPrimaryHatId = useCallback(
    (hatId: string) => {
      patchSearch(boardSearchPatch({ hat: hatId }));
    },
    [patchSearch],
  );

  const setCompareHatId = useCallback(
    (hatId: string | null) => {
      patchSearch(boardSearchPatch({ hat2: hatId }));
    },
    [patchSearch],
  );

  const setLegendFilters = useCallback(
    (filters: string[]) => {
      patchSearch(boardSearchPatch({ filters }));
    },
    [patchSearch],
  );

  const setSelectedPins = useCallback(
    (pins: ReadonlySet<number>) => {
      patchSearch(boardSearchPatch({ pins }));
    },
    [patchSearch],
  );

  const setPinoutView = useCallback(
    (view: PinoutView | null) => {
      patchSearch(boardSearchPatch({ view }));
    },
    [patchSearch],
  );

  const setHighlightedOverlayId = useCallback(
    (overlayId: string | null) => {
      patchSearch(boardSearchPatch({ overlay: overlayId }));
    },
    [patchSearch],
  );

  const setFocusPin = useCallback(
    (pin: number | null) => {
      patchSearch(boardSearchPatch({ pin }));
    },
    [patchSearch],
  );

  return {
    platform,
    platformId,
    ...boardState,
    setPlatformId,
    setComparePlatformId,
    swapComparePlatforms,
    setPrimaryHatId,
    setCompareHatId,
    setLegendFilters,
    setSelectedPins,
    setPinoutView,
    setHighlightedOverlayId,
    setFocusPin,
  };
}
