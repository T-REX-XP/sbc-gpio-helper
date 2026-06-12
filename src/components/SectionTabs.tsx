import type { ReactNode } from 'react';
import { ButtonIcon, type ButtonIconName } from './icons';

interface SectionTab {
  id: string;
  label: string;
  icon?: ButtonIconName;
}

interface SectionTabsProps {
  tabs: readonly SectionTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  ariaLabel: string;
  idPrefix: string;
}

export function SectionTabs({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel,
  idPrefix,
}: SectionTabsProps) {
  return (
    <div className="section-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`${idPrefix}-tab-${tab.id}`}
          className={[
            'section-tabs__tab',
            'btn-with-icon',
            activeTab === tab.id ? 'section-tabs__tab--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-selected={activeTab === tab.id}
          aria-controls={`${idPrefix}-panel-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon && <ButtonIcon name={tab.icon} />}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

interface SectionTabPanelProps {
  id: string;
  labelledBy: string;
  active: boolean;
  children: ReactNode;
}

export function SectionTabPanel({
  id,
  labelledBy,
  active,
  children,
}: SectionTabPanelProps) {
  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      hidden={!active}
      className="section-tabs__panel"
    >
      {children}
    </div>
  );
}
