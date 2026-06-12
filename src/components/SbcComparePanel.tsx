import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  buildSbcCompareColumns,
  buildSbcCompareSpecRows,
  MAX_SBC_COMPARE,
  type SbcCompareColumn,
} from '../hardware/sbcCompare';
import { getPlatformAccentColor } from '../hardware/platformColors';
import { createFormFactorClassTranslator, useI18n } from '../i18n';
import { HardwareImage } from './HardwareImage';

interface SbcComparePanelProps {
  compareIds: readonly string[];
  onRemove: (sbcId: string) => void;
  onClear: () => void;
}

const SPEC_LABEL_KEYS: Record<string, string> = {
  vendor: 'registry.columns.vendor',
  soc: 'registry.columns.soc',
  socFamily: 'registry.socFamily',
  cpu: 'registry.cpu',
  gpu: 'registry.gpu',
  ram: 'registry.ram',
  storage: 'registry.storage',
  connectivity: 'registry.connectivity',
  gpioHeader: 'registry.header',
  gpioNumbering: 'registry.gpioNumbering',
  interfaces: 'registry.columns.interfaces',
  pinCount: 'registry.columns.pins',
  platform: 'registry.columns.platform',
  pcbSize: 'registry.pcbSize',
  formFactorProfile: 'registry.profile',
  formFactorClass: 'registry.formFactorType',
  libraries: 'registry.gpioLibraries',
  wiringX: 'registry.wiringXSetup',
  wiringOp: 'registry.wiringOpRelease',
};

function ComparePhotoCard({
  column,
  onRemove,
}: {
  column: SbcCompareColumn;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  const accent = getPlatformAccentColor(column.sbc.platformId);

  return (
    <article
      className="sbc-compare__card"
      style={{ '--sbc-compare-accent': accent } as CSSProperties}
    >
      <HardwareImage
        imageUrl={column.sbc.imageUrl}
        alt={column.displayName}
        size="lg"
        className="sbc-compare__photo"
      />
      <div className="sbc-compare__card-body">
        <h3 className="sbc-compare__card-title">{column.displayName}</h3>
        <code className="sbc-compare__card-id">{column.sbc.id}</code>
        <div className="sbc-compare__card-actions">
          <Link
            className="sbc-compare__card-link"
            to={`/board/${column.sbc.platformId}`}
          >
            {t('sbcCompare.openPinout')}
          </Link>
          <button
            type="button"
            className="sbc-compare__remove-btn"
            onClick={onRemove}
            aria-label={t('sbcCompare.removeBoard', { name: column.displayName })}
          >
            {t('sbcCompare.remove')}
          </button>
        </div>
      </div>
    </article>
  );
}

export function SbcComparePanel({ compareIds, onRemove, onClear }: SbcComparePanelProps) {
  const { t } = useI18n();
  const translateClass = createFormFactorClassTranslator(t);
  const columns = buildSbcCompareColumns(compareIds);
  const specRows =
    columns.length >= 2 ? buildSbcCompareSpecRows(columns, translateClass) : [];

  if (columns.length === 0) return null;

  return (
    <section className="sbc-compare" aria-label={t('sbcCompare.aria')}>
      <div className="sbc-compare__header">
        <div className="sbc-compare__heading">
          <h2 className="sbc-compare__title">{t('sbcCompare.title')}</h2>
          <span className="sbc-compare__count">
            {t('sbcCompare.selectedCount', { count: columns.length, max: MAX_SBC_COMPARE })}
          </span>
        </div>
        <button type="button" className="sbc-compare__clear-btn" onClick={onClear}>
          {t('sbcCompare.clearAll')}
        </button>
      </div>

      {columns.length < 2 && (
        <p className="sbc-compare__hint">{t('sbcCompare.needMore')}</p>
      )}

      <div
        className="sbc-compare__photos"
        data-count={columns.length}
        aria-label={t('sbcCompare.photosAria')}
      >
        {columns.map((column) => (
          <ComparePhotoCard
            key={column.sbc.id}
            column={column}
            onRemove={() => onRemove(column.sbc.id)}
          />
        ))}
      </div>

      {specRows.length > 0 && (
        <div className="sbc-compare__table-wrap">
          <table className="sbc-compare__table">
            <thead>
              <tr>
                <th scope="col">{t('sbcCompare.spec')}</th>
                {columns.map((column) => (
                  <th key={column.sbc.id} scope="col">
                    {column.displayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specRows.map((row) => (
                <tr key={row.id}>
                  <th scope="row">{t(SPEC_LABEL_KEYS[row.id] ?? row.id)}</th>
                  {row.values.map((value, index) => (
                    <td key={`${row.id}-${columns[index]?.sbc.id ?? index}`}>
                      {row.id === 'platform' ? <code>{value}</code> : value || t('common.emDash')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
