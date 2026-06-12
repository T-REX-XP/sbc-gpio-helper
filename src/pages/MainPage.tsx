import { useCallback, useMemo, useState } from 'react';
import { ColorLegend } from '../components/ColorLegend';
import { DeviceTreeOverlays } from '../components/DeviceTreeOverlays';
import { GpioHeader } from '../components/GpioHeader';
import { HatSpiPinoutSection } from '../components/HatSpiPinoutSection';
import { HardwareSelector } from '../components/HardwareSelector';
import { PinDetails } from '../components/PinDetails';
import { PinFilters } from '../components/PinFilters';
import { PinoutSection } from '../components/PinoutSection';
import { PlatformCompareHeaders } from '../components/PlatformCompareHeaders';
import { PlatformCompareDetails } from '../components/PlatformCompareDetails';
import { PlatformSelector } from '../components/PlatformSelector';
import type { DeviceTreeOverlay } from '../hardware';
import { getOverlayPhysicalPins } from '../hardware/deviceTree';
import { hardwareRegistry, isSpiVisualizationActive } from '../hardware';
import { useI18n } from '../i18n';

interface MainPageProps {
  platformId: string;
  comparePlatformId: string | null;
  onPlatformChange: (platformId: string) => void;
  onComparePlatformChange: (platformId: string | null) => void;
  onSwapComparePlatforms: () => void;
}

function buildSelectedIds(primaryId: string, compareId: string | null): string[] {
  return compareId ? [primaryId, compareId] : [primaryId];
}

export function MainPage({
  platformId,
  comparePlatformId,
  onPlatformChange,
  onComparePlatformChange,
  onSwapComparePlatforms,
}: MainPageProps) {
  const { t } = useI18n();
  const platform = hardwareRegistry.getPlatform(platformId);
  const platformDevices = hardwareRegistry.getDevices(platformId);
  const defaultId = platformDevices[0]?.id ?? '';

  const [primaryId, setPrimaryId] = useState(defaultId);
  const [compareId, setCompareId] = useState<string | null>(null);
  const [prevPlatformId, setPrevPlatformId] = useState(platformId);
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const [selectedPins, setSelectedPins] = useState<ReadonlySet<number>>(() => new Set());
  const [focusPin, setFocusPin] = useState<number | null>(null);
  const detailPin = hoveredPin ?? focusPin;

  const toggleSelectedPin = useCallback((physical: number) => {
    setSelectedPins((prev) => {
      const next = new Set(prev);
      if (next.has(physical)) {
        next.delete(physical);
        setFocusPin((current) => {
          if (current !== physical) return current;
          const remaining = [...next].sort((a, b) => a - b);
          return remaining.length > 0 ? remaining[remaining.length - 1]! : null;
        });
      } else {
        next.add(physical);
        setFocusPin(physical);
      }
      return next;
    });
  }, []);

  const clearSelectedPins = useCallback(() => {
    setSelectedPins(new Set());
    setFocusPin(null);
  }, []);

  if (platformId !== prevPlatformId) {
    setPrevPlatformId(platformId);
    setPrimaryId(defaultId);
    setCompareId(null);
    setSelectedPins(new Set());
    setFocusPin(null);
  }

  const handlePlatformChange = (nextId: string) => {
    onPlatformChange(nextId);
    if (comparePlatformId === nextId) {
      onComparePlatformChange(null);
    }
  };

  const [legendFilters, setLegendFilters] = useState<string[]>([]);
  const [highlightedOverlayId, setHighlightedOverlayId] = useState<string | null>(
    null,
  );

  const comparePlatform = comparePlatformId
    ? hardwareRegistry.getPlatform(comparePlatformId)
    : undefined;
  const isPlatformComparing = comparePlatform != null;

  const handleHighlightOverlay = (overlay: DeviceTreeOverlay | null) => {
    if (!overlay) {
      setHighlightedOverlayId(null);
      return;
    }

    setHighlightedOverlayId(overlay.id);
    const pins = getOverlayPhysicalPins(overlay);
    if (pins.length > 0) {
      setHoveredPin(pins[0]);
    }
  };

  const overlayHighlightPins = useMemo(() => {
    const deviceTree = platform?.deviceTree;
    if (!deviceTree || !highlightedOverlayId) {
      return new Set<number>();
    }

    const overlay = deviceTree.overlays.find(
      (item) => item.id === highlightedOverlayId,
    );
    if (!overlay) return new Set<number>();

    return new Set(getOverlayPhysicalPins(overlay));
  }, [platform?.deviceTree, highlightedOverlayId]);

  const toggleLegendFilter = (key: string) => {
    setLegendFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const clearPinTypeFilters = () => {
    setLegendFilters((prev) => prev.filter((key) => !key.startsWith('pin-type:')));
  };

  const clearOverlayFilters = () => {
    setLegendFilters((prev) =>
      prev.filter((key) => !key.startsWith('device:') && !key.startsWith('status:')),
    );
  };

  const selectedIds = useMemo(
    () => buildSelectedIds(primaryId, compareId),
    [primaryId, compareId],
  );

  const selectedDevices = useMemo(
    () => hardwareRegistry.getDevicesByIds(selectedIds),
    [selectedIds],
  );

  const conflicts = useMemo(
    () => hardwareRegistry.findConflicts(selectedIds),
    [selectedIds],
  );

  const conflictPins = useMemo(
    () => new Set(conflicts.keys()),
    [conflicts],
  );

  const showSpiBusPrimary = useMemo(
    () => isSpiVisualizationActive(platformId, legendFilters, selectedDevices),
    [platformId, legendFilters, selectedDevices],
  );

  const showSpiBusCompare = useMemo(
    () =>
      comparePlatformId != null &&
      isSpiVisualizationActive(comparePlatformId, legendFilters, []),
    [comparePlatformId, legendFilters],
  );

  if (!platform) return null;

  return (
    <div className="app-page app-page--main">
      <section className="app-controls" aria-label={t('main.controlsAria')}>
        <div className="app-controls__bar">
          <PlatformSelector
            platforms={hardwareRegistry.platforms}
            platformId={platformId}
            comparePlatformId={comparePlatformId}
            onPlatformChange={handlePlatformChange}
            onComparePlatformChange={onComparePlatformChange}
            onSwapComparePlatforms={onSwapComparePlatforms}
          />

          {!isPlatformComparing && platformDevices.length > 0 && (
            <>
              <span className="app-controls__divider" aria-hidden="true" />
              <HardwareSelector
                devices={platformDevices}
                primaryId={primaryId}
                compareId={compareId}
                onPrimaryChange={setPrimaryId}
                onCompareChange={setCompareId}
              />
            </>
          )}
        </div>
      </section>

      <main className="app-main">
        <div className="app-pinout">
          {isPlatformComparing && comparePlatform ? (
            <>
              <PinoutSection
                id="platform-compare-pinout"
                title={t('main.gpioHeaderComparison')}
                description={t('main.gpioHeaderComparisonDesc')}
                exportable
                exportFileName={`gpio-compare-${platform.id}-${comparePlatform.id}.png`}
              >
                <PlatformCompareHeaders
                  primary={platform}
                  compare={comparePlatform}
                  primaryDevices={selectedDevices}
                  hoveredPin={hoveredPin}
                  onHoverPin={setHoveredPin}
                  selectedPins={selectedPins}
                  onToggleSelectedPin={toggleSelectedPin}
                  legendFilters={legendFilters}
                  conflictPins={conflictPins}
                  showSpiBusPrimary={showSpiBusPrimary}
                  showSpiBusCompare={showSpiBusCompare}
                />
              </PinoutSection>

              <PlatformCompareDetails
                primary={platform}
                compare={comparePlatform}
                selectedDevices={selectedDevices}
                hoveredPin={detailPin}
                onHoverPin={setHoveredPin}
              />
            </>
          ) : (
            <>
              <PinoutSection
                id="gpio-header-pinout"
                title={t('main.gpioHeaderPinout')}
                description={t('main.gpioHeaderPinoutDesc')}
                exportable
                exportFileName={`gpio-${platform.id}.png`}
              >
                <GpioHeader
                  platform={platform}
                  selectedDevices={selectedDevices}
                  hoveredPin={hoveredPin}
                  onHoverPin={setHoveredPin}
                  selectedPins={selectedPins}
                  onToggleSelectedPin={toggleSelectedPin}
                  legendFilters={legendFilters}
                  conflictPins={conflictPins}
                  showSpiBus={showSpiBusPrimary}
                  overlayHighlightPins={overlayHighlightPins}
                />
              </PinoutSection>

              {platform.deviceTree && (
                <PinoutSection
                  id="device-tree-overlays"
                  title={t('main.deviceTreeOverlays')}
                  description={t('main.deviceTreeOverlaysDesc')}
                >
                  <DeviceTreeOverlays
                    deviceTree={platform.deviceTree}
                    highlightedOverlayId={highlightedOverlayId}
                    onHighlightOverlay={handleHighlightOverlay}
                  />
                </PinoutSection>
              )}

              <HatSpiPinoutSection
                platform={platform}
                selectedDevices={selectedDevices}
                hoveredPin={detailPin}
                onHoverPin={setHoveredPin}
                showSpi={showSpiBusPrimary}
              />
            </>
          )}
        </div>

        <aside className="app-sidebar">
          <ColorLegend
            platform={platform}
            activeFilters={legendFilters}
            onToggleFilter={toggleLegendFilter}
            onClearFilters={clearPinTypeFilters}
          />
          <PinDetails
            platform={platform}
            comparePlatform={comparePlatform}
            hoveredPin={hoveredPin}
            selectedPins={selectedPins}
            focusPin={focusPin}
            onFocusPin={setFocusPin}
            onClearSelection={clearSelectedPins}
            selectedDevices={selectedDevices}
          />
          {!isPlatformComparing && (
            <PinFilters
              platformId={platformId}
              activeFilters={legendFilters}
              onToggleFilter={toggleLegendFilter}
              onClearFilters={clearOverlayFilters}
            />
          )}
          {!isPlatformComparing && conflicts.size > 0 && (
            <div className="conflict-summary" role="alert">
              <h2 className="section-title">{t('main.pinConflicts')}</h2>
              <ul>
                {[...conflicts.entries()].map(([physical, usages]) => (
                  <li key={physical}>
                    {t('main.pinConflictEntry', {
                      physical,
                      usages: usages
                        .map((u) => `${u.device.shortName} (${u.assignment.signal})`)
                        .join(t('main.conflictVs')),
                    })}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
