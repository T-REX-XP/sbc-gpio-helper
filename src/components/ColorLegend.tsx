import type { PinType } from '../hardware';
import { legendFilterKey } from '../hardware/legendFilters';
import { useI18n } from '../i18n';
import { ButtonLabel } from './icons';

const PIN_TYPES: PinType[] = [
  'gpio',
  'spi',
  'i2c',
  'uart',
  'pcm',
  'ground',
  'power5v',
  'power3v3',
];

interface ColorLegendProps {
  activeFilters: readonly string[];
  onToggleFilter: (key: string) => void;
  onClearFilters: () => void;
}

export function ColorLegend({
  activeFilters,
  onToggleFilter,
  onClearFilters,
}: ColorLegendProps) {
  const { t } = useI18n();
  const pinTypeFilters = activeFilters.filter((key) => key.startsWith('pin-type:'));
  const hasPinTypeFilters = pinTypeFilters.length > 0;
  const highlightKey =
    pinTypeFilters.length === 1 ? 'legend.highlightActive_one' : 'legend.highlightActive_other';

  return (
    <section className="color-legend" aria-label={t('legend.aria')}>
      <header className="color-legend__header">
        <h2 className="color-legend__title">{t('legend.title')}</h2>
      </header>

      {hasPinTypeFilters && (
        <div className="color-legend__toolbar">
          <span className="color-legend__filter-count">
            {t(highlightKey, { count: pinTypeFilters.length })}
          </span>
          <button type="button" className="color-legend__clear btn-with-icon" onClick={onClearFilters}>
            <ButtonLabel icon="clear">{t('common.clear')}</ButtonLabel>
          </button>
        </div>
      )}

      <p className="color-legend__hint">{t('legend.hint')}</p>

      <ul className="color-legend__list">
        {PIN_TYPES.map((type) => {
          const filterKey = legendFilterKey({ kind: 'pin-type', type });
          const active = activeFilters.includes(filterKey);

          return (
            <li key={type}>
              <button
                type="button"
                className={[
                  'color-legend__item',
                  active ? 'color-legend__item--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onToggleFilter(filterKey)}
                aria-pressed={active}
              >
                <span
                  className={`color-legend__swatch color-legend__swatch--${type}`}
                  aria-hidden="true"
                />
                <span className="color-legend__label">
                  <span className="color-legend__short">
                    {t(`legend.pinTypes.${type}.short`)}
                  </span>
                  <span className="color-legend__desc">
                    ({t(`legend.pinTypes.${type}.description`)})
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
