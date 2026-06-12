import type { PinoutView } from '../routing/boardSearchParams';
import type { GpioPlatform, HardwareDevice } from '../hardware';
import { useI18n } from '../i18n';
import { HardwarePinTable } from './HardwarePinTable';
import { PinoutSection } from './PinoutSection';
import { SectionTabPanel, SectionTabs } from './SectionTabs';
import { SpiBusVisualization } from './SpiBusVisualization';

interface HatSpiPinoutSectionProps {
  platform: GpioPlatform;
  selectedDevices: HardwareDevice[];
  hoveredPin: number | null;
  onHoverPin: (physical: number | null) => void;
  showSpi: boolean;
  activeTab?: PinoutView | null;
  onTabChange?: (tab: PinoutView | null) => void;
}

export function HatSpiPinoutSection({
  platform,
  selectedDevices,
  hoveredPin,
  onHoverPin,
  showSpi,
  activeTab = null,
  onTabChange,
}: HatSpiPinoutSectionProps) {
  const { t } = useI18n();
  const hasHats = selectedDevices.length > 0;
  const hasSpi = showSpi;
  const hasTabs = hasHats && hasSpi;

  const safeTab: PinoutView =
    !hasHats && hasSpi
      ? 'spi'
      : hasHats && !hasSpi
        ? 'hats'
        : activeTab === 'spi' && !hasSpi
          ? 'hats'
          : activeTab === 'hats' && !hasHats
            ? 'spi'
            : activeTab ?? 'hats';

  if (!hasHats && !hasSpi) {
    return null;
  }

  const tabLabels: Record<PinoutView, string> = {
    hats: t('hatSpi.tabs.hats'),
    spi: t('hatSpi.tabs.spi'),
  };

  const description =
    safeTab === 'hats'
      ? t('hatSpi.hatsDesc')
      : platform.spiPinoutDescription ?? t('hatSpi.spiDescFallback');

  return (
    <PinoutSection
      id="hat-spi-pinout"
      title={t('hatSpi.pinAssignments')}
      description={description}
      headerExtra={
        hasTabs ? (
          <SectionTabs
            tabs={(['hats', 'spi'] as const).map((tab) => ({
              id: tab,
              label: tabLabels[tab],
            }))}
            activeTab={safeTab}
            onTabChange={(tabId) => onTabChange?.(tabId as PinoutView)}
            ariaLabel={t('hatSpi.viewsAria')}
            idPrefix="hat-spi-pinout"
          />
        ) : undefined
      }
    >
      {hasTabs ? (
        <>
          <SectionTabPanel
            id="hat-spi-pinout-panel-hats"
            labelledBy="hat-spi-pinout-tab-hats"
            active={safeTab === 'hats'}
          >
            <div className="hardware-tables">
              {selectedDevices.map((device) => (
                <HardwarePinTable key={device.id} device={device} />
              ))}
            </div>
          </SectionTabPanel>
          <SectionTabPanel
            id="hat-spi-pinout-panel-spi"
            labelledBy="hat-spi-pinout-tab-spi"
            active={safeTab === 'spi'}
          >
            <SpiBusVisualization
              platform={platform}
              selectedDevices={selectedDevices}
              hoveredPin={hoveredPin}
              onHoverPin={onHoverPin}
            />
          </SectionTabPanel>
        </>
      ) : hasHats ? (
        <div className="hardware-tables">
          {selectedDevices.map((device) => (
            <HardwarePinTable key={device.id} device={device} />
          ))}
        </div>
      ) : (
        <SpiBusVisualization
          platform={platform}
          selectedDevices={selectedDevices}
          hoveredPin={hoveredPin}
          onHoverPin={onHoverPin}
        />
      )}
    </PinoutSection>
  );
}
