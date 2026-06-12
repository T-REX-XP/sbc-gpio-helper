import type { ReactNode } from 'react';
import { hardwareRegistry } from '../hardware';
import { legendFilterKey, type LegendFilter } from '../hardware/legendFilters';
import { useI18n } from '../i18n';

interface PinFiltersProps {
  platformId: string;
  activeFilters: readonly string[];
  onToggleFilter: (key: string) => void;
  onClearFilters: () => void;
}

function FilterChip({
  label,
  active,
  onToggle,
  swatch,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  swatch: ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        className={`pin-filters__chip${active ? ' pin-filters__chip--active' : ''}`}
        onClick={onToggle}
        aria-pressed={active}
      >
        {swatch}
        <span>{label}</span>
      </button>
    </li>
  );
}

export function PinFilters({
  platformId,
  activeFilters,
  onToggleFilter,
  onClearFilters,
}: PinFiltersProps) {
  const { t } = useI18n();
  const devices = hardwareRegistry.getDevices(platformId);
  const overlayFilters = activeFilters.filter(
    (key) => key.startsWith('device:') || key.startsWith('status:'),
  );
  const hasOverlayFilters = overlayFilters.length > 0;
  const filterKey =
    overlayFilters.length === 1 ? 'pinFilters.filterActive_one' : 'pinFilters.filterActive_other';

  const isActive = (filter: LegendFilter) =>
    activeFilters.includes(legendFilterKey(filter));

  if (devices.length === 0) {
    return (
      <section className="pin-filters" aria-label={t('pinFilters.aria')}>
        <h2 className="section-title">{t('pinFilters.title')}</h2>
        <p className="pin-filters__hint">{t('pinFilters.noHats')}</p>
      </section>
    );
  }

  return (
    <section className="pin-filters" aria-label={t('pinFilters.aria')}>
      <h2 className="section-title">{t('pinFilters.title')}</h2>

      {hasOverlayFilters && (
        <div className="pin-filters__toolbar">
          <span className="pin-filters__filter-count">
            {t(filterKey, { count: overlayFilters.length })}
          </span>
          <button type="button" className="pin-filters__clear" onClick={onClearFilters}>
            {t('common.clear')}
          </button>
        </div>
      )}

      <p className="pin-filters__hint">{t('pinFilters.hint')}</p>

      <div className="pin-filters__group">
        <h3 className="pin-filters__heading">{t('pinFilters.hatColors')}</h3>
        <ul className="pin-filters__chips">
          {devices.map((device) => (
            <FilterChip
              key={device.id}
              label={device.shortName}
              active={isActive({ kind: 'device', deviceId: device.id })}
              onToggle={() =>
                onToggleFilter(legendFilterKey({ kind: 'device', deviceId: device.id }))
              }
              swatch={
                <span
                  className="pin-filters__swatch pin-filters__swatch--hat"
                  style={{ background: hardwareRegistry.getDeviceColor(device.id) }}
                  aria-hidden="true"
                />
              }
            />
          ))}
        </ul>
      </div>

      <div className="pin-filters__group">
        <h3 className="pin-filters__heading">{t('pinFilters.status')}</h3>
        <ul className="pin-filters__chips">
          <FilterChip
            label={t('pinFilters.pinConflict')}
            active={isActive({ kind: 'status', status: 'conflict' })}
            onToggle={() =>
              onToggleFilter(legendFilterKey({ kind: 'status', status: 'conflict' }))
            }
            swatch={
              <span className="pin-filters__swatch pin-filters__swatch--conflict" aria-hidden="true" />
            }
          />
        </ul>
      </div>
    </section>
  );
}
