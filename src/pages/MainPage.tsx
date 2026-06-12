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
import { useBoardRoute } from '../routing/useBoardRoute';

function buildSelectedIds(primaryId: string, compareId: string | null): string[] {
  return compareId ? [primaryId, compareId] : [primaryId];
}

export function MainPage() {
  const { t } = useI18n();
  const {
    platform,
    platformId,
    comparePlatformId,
    primaryHatId,
    compareHatId,
    legendFilters,
    selectedPins,
    focusPin,
    pinoutView,
    highlightedOverlayId,
    setPlatformId,
    setComparePlatformId,
    swapComparePlatforms,
    setPrimaryHatId,
    setCompareHatId,
    setLegendFilters,
    setSelectedPins,
    setFocusPin,
    setPinoutView,
    setHighlightedOverlayId,
  } = useBoardRoute();

  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const selectedDetailPin =
    selectedPins.size > 0 ? Math.min(...selectedPins) : null;
  const detailPin = hoveredPin ?? focusPin ?? selectedDetailPin;

  const platformDevices = hardwareRegistry.getDevices(platformId);
  const comparePlatform = comparePlatformId
    ? hardwareRegistry.getPlatform(comparePlatformId)
    : undefined;
  const isPlatformComparing = comparePlatform != null;

  const handlePlatformChange = (nextId: string) => {
    setPlatformId(nextId);
    if (comparePlatformId === nextId) {
      setComparePlatformId(null);
    }
  };

  const toggleSelectedPin = useCallback(
    (physical: number) => {
      const next = new Set(selectedPins);
      let nextFocus: number | null;

      if (next.has(physical)) {
        next.delete(physical);
        if (focusPin === physical) {
          const remaining = [...next].sort((a, b) => a - b);
          nextFocus = remaining.length > 0 ? remaining[remaining.length - 1]! : null;
        } else {
          nextFocus = focusPin;
        }
      } else {
        next.add(physical);
        nextFocus = physical;
      }

      setSelectedPins(next, nextFocus);
    },
    [focusPin, selectedPins, setSelectedPins],
  );

  const clearSelectedPins = useCallback(() => {
    setSelectedPins(new Set(), null);
  }, [setSelectedPins]);

  const handleHighlightOverlay = (overlay: DeviceTreeOverlay | null) => {
    if (!overlay) {
      setHighlightedOverlayId(null);
      return;
    }

    setHighlightedOverlayId(overlay.id);
    const pins = getOverlayPhysicalPins(overlay);
    if (pins.length > 0) {
      setHoveredPin(pins[0]);
      setFocusPin(pins[0]);
    }
  };

  const overlayHighlightPins = useMemo(() => {
    const deviceTree = platform?.deviceTree;
    if (!deviceTree || !highlightedOverlayId) {
      return new Set<number>();
    }

    const overlay = deviceTree.overlays.find((item) => item.id === highlightedOverlayId);
    if (!overlay) return new Set<number>();

    return new Set(getOverlayPhysicalPins(overlay));
  }, [platform?.deviceTree, highlightedOverlayId]);

  const toggleLegendFilter = (key: string) => {
    const next = legendFilters.includes(key)
      ? legendFilters.filter((item) => item !== key)
      : [...legendFilters, key];
    setLegendFilters(next);
  };

  const clearPinTypeFilters = () => {
    setLegendFilters(legendFilters.filter((key) => !key.startsWith('pin-type:')));
  };

  const clearOverlayFilters = () => {
    setLegendFilters(
      legendFilters.filter((key) => !key.startsWith('device:') && !key.startsWith('status:')),
    );
  };

  const selectedIds = useMemo(
    () => buildSelectedIds(primaryHatId, compareHatId),
    [primaryHatId, compareHatId],
  );

  const selectedDevices = useMemo(
    () => hardwareRegistry.getDevicesByIds(selectedIds),
    [selectedIds],
  );

  const conflicts = useMemo(
    () => hardwareRegistry.findConflicts(selectedIds),
    [selectedIds],
  );

  const conflictPins = useMemo(() => new Set(conflicts.keys()), [conflicts]);

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
            onComparePlatformChange={setComparePlatformId}
            onSwapComparePlatforms={swapComparePlatforms}
          />

          {!isPlatformComparing && platformDevices.length > 0 && (
            <>
              <span className="app-controls__divider" aria-hidden="true" />
              <HardwareSelector
                devices={platformDevices}
                primaryId={primaryHatId}
                compareId={compareHatId}
                onPrimaryChange={setPrimaryHatId}
                onCompareChange={setCompareHatId}
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
                activeTab={pinoutView}
                onTabChange={setPinoutView}
              />
            </>
          )}
        </div>

        <aside className="app-sidebar">
          <ColorLegend
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
