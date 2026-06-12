import { hardwareRegistry } from '../hardware';

export type PinoutView = 'hats' | 'spi';

export interface BoardSearchState {
  comparePlatformId: string | null;
  primaryHatId: string;
  compareHatId: string | null;
  legendFilters: string[];
  selectedPins: ReadonlySet<number>;
  focusPin: number | null;
  pinoutView: PinoutView | null;
  highlightedOverlayId: string | null;
}

function parseList(value: string | null): string[] {
  if (!value?.trim()) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function parsePinList(value: string | null): ReadonlySet<number> {
  const pins = parseList(value)
    .map((item) => Number.parseInt(item, 10))
    .filter((pin) => Number.isFinite(pin) && pin > 0);
  return new Set(pins);
}

function resolveHatId(platformId: string, hatId: string | undefined, fallback: string): string {
  const devices = hardwareRegistry.getDevices(platformId);
  if (hatId && devices.some((device) => device.id === hatId)) {
    return hatId;
  }
  return fallback;
}

export function parseBoardSearchParams(
  params: URLSearchParams,
  platformId: string,
): BoardSearchState {
  const devices = hardwareRegistry.getDevices(platformId);
  const defaultHatId = devices[0]?.id ?? '';

  const compareRaw = params.get('compare');
  const comparePlatformId =
    compareRaw && hardwareRegistry.getPlatform(compareRaw) ? compareRaw : null;

  const primaryHatId = resolveHatId(platformId, params.get('hat') ?? undefined, defaultHatId);

  const compareHatRaw = params.get('hat2');
  const compareHatId =
    compareHatRaw && devices.some((device) => device.id === compareHatRaw)
      ? compareHatRaw
      : null;

  const viewRaw = params.get('view');
  const pinoutView = viewRaw === 'hats' || viewRaw === 'spi' ? viewRaw : null;

  const overlayRaw = params.get('overlay');
  const platform = hardwareRegistry.getPlatform(platformId);
  const highlightedOverlayId =
    overlayRaw &&
    platform?.deviceTree?.overlays.some((overlay) => overlay.id === overlayRaw)
      ? overlayRaw
      : null;

  const pinRaw = params.get('pin');
  const parsedPin = pinRaw ? Number.parseInt(pinRaw, 10) : NaN;
  const focusPin =
    Number.isFinite(parsedPin) && parsedPin > 0 && parsedPin <= (platform?.pinCount ?? 0)
      ? parsedPin
      : null;

  return {
    comparePlatformId,
    primaryHatId,
    compareHatId,
    legendFilters: parseList(params.get('filters')),
    selectedPins: parsePinList(params.get('pins')),
    focusPin,
    pinoutView,
    highlightedOverlayId,
  };
}

export function boardSearchPatch(
  patch: Partial<{
    compare: string | null;
    hat: string | null;
    hat2: string | null;
    filters: string[] | null;
    pins: ReadonlySet<number> | null;
    pin: number | null;
    view: PinoutView | null;
    overlay: string | null;
  }>,
): Record<string, string | null> {
  const result: Record<string, string | null> = {};

  if ('compare' in patch) result.compare = patch.compare ?? null;
  if ('hat' in patch) result.hat = patch.hat ?? null;
  if ('hat2' in patch) result.hat2 = patch.hat2 ?? null;
  if ('filters' in patch) {
    result.filters =
      patch.filters && patch.filters.length > 0 ? patch.filters.join(',') : null;
  }
  if ('pins' in patch) {
    const pins = patch.pins ? [...patch.pins].sort((a, b) => a - b) : [];
    result.pins = pins.length > 0 ? pins.join(',') : null;
  }
  if ('pin' in patch) {
    result.pin = patch.pin != null && patch.pin > 0 ? String(patch.pin) : null;
  }
  if ('view' in patch) result.view = patch.view ?? null;
  if ('overlay' in patch) result.overlay = patch.overlay ?? null;

  return result;
}

export function applySearchPatch(
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

export function sanitizeBoardSearchForPlatform(
  params: URLSearchParams,
  platformId: string,
): URLSearchParams {
  const parsed = parseBoardSearchParams(params, platformId);
  return applySearchPatch(params, {
    compare: parsed.comparePlatformId,
    hat: parsed.primaryHatId || null,
    hat2: parsed.compareHatId,
    filters: parsed.legendFilters.length > 0 ? parsed.legendFilters.join(',') : null,
    pins:
      parsed.selectedPins.size > 0
        ? [...parsed.selectedPins].sort((a, b) => a - b).join(',')
        : null,
    pin: parsed.focusPin != null ? String(parsed.focusPin) : null,
    view: parsed.pinoutView,
    overlay: parsed.highlightedOverlayId,
  });
}
