import { hardwareRegistry } from '../hardware';

const STORAGE_KEY = 'gpio-visualizer-last-platform';

export function getLastPlatformId(): string {
  if (typeof window === 'undefined') {
    return hardwareRegistry.defaultPlatformId;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && hardwareRegistry.getPlatform(stored)) {
    return stored;
  }

  return hardwareRegistry.defaultPlatformId;
}

export function setLastPlatformId(platformId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, platformId);
}
