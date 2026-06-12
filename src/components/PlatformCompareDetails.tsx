import { useMemo, useState } from 'react';
import type { GpioPlatform, HardwareDevice } from '../hardware';
import { hasFormFactor } from '../hardware/formFactor';
import { useI18n } from '../i18n';
import { FormFactorComparison } from './FormFactorComparison';
import { PinoutSection } from './PinoutSection';
import { PlatformComparison } from './PlatformComparison';
import { SectionTabPanel, SectionTabs } from './SectionTabs';
import { SpiBusVisualization } from './SpiBusVisualization';

type CompareTab = 'pins' | 'spi' | 'form';

interface PlatformCompareDetailsProps {
  primary: GpioPlatform;
  compare: GpioPlatform;
  selectedDevices: HardwareDevice[];
  hoveredPin: number | null;
  onHoverPin: (physical: number | null) => void;
}

export function PlatformCompareDetails({
  primary,
  compare,
  selectedDevices,
  hoveredPin,
  onHoverPin,
}: PlatformCompareDetailsProps) {
  const { t } = useI18n();
  const hasSpi =
    (primary.spiBuses?.length ?? 0) > 0 || (compare.spiBuses?.length ?? 0) > 0;
  const hasForm = hasFormFactor(primary) && hasFormFactor(compare);

  const tabs = useMemo(() => {
    const items: CompareTab[] = ['pins'];
    if (hasSpi) items.push('spi');
    if (hasForm) items.push('form');
    return items;
  }, [hasSpi, hasForm]);

  const [activeTab, setActiveTab] = useState<CompareTab>('pins');
  const showTabs = tabs.length > 1;
  const safeTab = tabs.includes(activeTab) ? activeTab : 'pins';

  const tabLabels: Record<CompareTab, string> = {
    pins: t('compare.tabs.pins'),
    spi: t('compare.tabs.spi'),
    form: t('compare.tabs.form'),
  };

  const tabDescriptions: Record<CompareTab, string> = {
    pins: t('compare.tabDesc.pins'),
    spi: t('compare.tabDesc.spi'),
    form: t('compare.tabDesc.form'),
  };

  return (
    <PinoutSection
      id="platform-compare-details"
      title={t('compare.boardComparison')}
      description={tabDescriptions[safeTab]}
      headerExtra={
        showTabs ? (
          <SectionTabs
            tabs={tabs.map((tab) => ({ id: tab, label: tabLabels[tab] }))}
            activeTab={safeTab}
            onTabChange={(tabId) => setActiveTab(tabId as CompareTab)}
            ariaLabel={t('compare.viewsAria')}
            idPrefix="platform-compare"
          />
        ) : undefined
      }
    >
      {showTabs ? (
        <>
          <SectionTabPanel
            id="platform-compare-panel-pins"
            labelledBy="platform-compare-tab-pins"
            active={safeTab === 'pins'}
          >
            <PlatformComparison
              primary={primary}
              compare={compare}
              hoveredPin={hoveredPin}
              onHoverPin={onHoverPin}
            />
          </SectionTabPanel>
          {hasSpi && (
            <SectionTabPanel
              id="platform-compare-panel-spi"
              labelledBy="platform-compare-tab-spi"
              active={safeTab === 'spi'}
            >
              <div className="platform-compare-spi">
                {(primary.spiBuses?.length ?? 0) > 0 && (
                  <div className="platform-compare-spi__col">
                    <h3 className="platform-compare-spi__title">
                      {primary.shortName ?? primary.name}
                    </h3>
                    <SpiBusVisualization
                      platform={primary}
                      selectedDevices={selectedDevices}
                      hoveredPin={hoveredPin}
                      onHoverPin={onHoverPin}
                    />
                  </div>
                )}
                {(compare.spiBuses?.length ?? 0) > 0 && (
                  <div className="platform-compare-spi__col">
                    <h3 className="platform-compare-spi__title">
                      {compare.shortName ?? compare.name}
                    </h3>
                    <SpiBusVisualization
                      platform={compare}
                      selectedDevices={[]}
                      hoveredPin={hoveredPin}
                      onHoverPin={onHoverPin}
                    />
                  </div>
                )}
              </div>
            </SectionTabPanel>
          )}
          {hasForm && (
            <SectionTabPanel
              id="platform-compare-panel-form"
              labelledBy="platform-compare-tab-form"
              active={safeTab === 'form'}
            >
              <FormFactorComparison primary={primary} compare={compare} />
            </SectionTabPanel>
          )}
        </>
      ) : (
        <PlatformComparison
          primary={primary}
          compare={compare}
          hoveredPin={hoveredPin}
          onHoverPin={onHoverPin}
        />
      )}
    </PinoutSection>
  );
}
