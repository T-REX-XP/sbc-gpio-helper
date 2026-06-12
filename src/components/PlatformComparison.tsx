import { useMemo } from 'react';
import { comparePlatforms, type PlatformPinComparisonRow } from '../hardware';
import type { GpioPlatform } from '../hardware';
import { createPinLabelStrings, useI18n } from '../i18n';

interface PlatformComparisonProps {
  primary: GpioPlatform;
  compare: GpioPlatform;
  hoveredPin: number | null;
  onHoverPin: (physical: number | null) => void;
}

function PinCell({ type, label }: { type: string; label: string }) {
  return (
    <span className="platform-comparison__pin-cell">
      <span className={`pin-type pin-type--${type}`}>{type}</span>
      <span className="platform-comparison__pin-label">{label}</span>
    </span>
  );
}

function ComparisonRow({
  row,
  isHovered,
  onHover,
  statusLabel,
  statusTitle,
}: {
  row: PlatformPinComparisonRow;
  isHovered: boolean;
  onHover: (physical: number | null) => void;
  statusLabel: string;
  statusTitle: string;
}) {
  return (
    <tr
      className={[
        'platform-comparison__row',
        `platform-comparison__row--${row.status}`,
        isHovered ? 'platform-comparison__row--hovered' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={() => onHover(row.physical)}
      onMouseLeave={() => onHover(null)}
    >
      <td className="platform-comparison__phys">{row.physical}</td>
      <td>
        <PinCell type={row.primary.type} label={row.primaryLabel} />
      </td>
      <td>
        <PinCell type={row.compare.type} label={row.compareLabel} />
      </td>
      <td
        className={`platform-comparison__status platform-comparison__status--${row.status}`}
        title={statusTitle}
      >
        {statusLabel}
      </td>
    </tr>
  );
}

export function PlatformComparison({
  primary,
  compare,
  hoveredPin,
  onHoverPin,
}: PlatformComparisonProps) {
  const { t } = useI18n();
  const pinLabelStrings = useMemo(() => createPinLabelStrings(t), [t]);
  const summary = useMemo(
    () => comparePlatforms(primary, compare, pinLabelStrings),
    [primary, compare, pinLabelStrings],
  );
  const primaryName = primary.shortName ?? primary.name;
  const compareName = compare.shortName ?? compare.name;

  const statusLabels: Record<PlatformPinComparisonRow['status'], string> = {
    matching: t('compare.statusMatch'),
    'same-type': t('compare.statusSame'),
    'different-type': t('compare.statusDiff'),
  };

  const statusTitles: Record<PlatformPinComparisonRow['status'], string> = {
    matching: t('compare.statusTitleMatch'),
    'same-type': t('compare.statusTitleSame'),
    'different-type': t('compare.statusTitleDiff'),
  };

  return (
    <div className="platform-comparison">
      <div className="platform-comparison__summary">
        <div className="platform-comparison__stat">
          <span className="platform-comparison__stat-value">{summary.matching}</span>
          <span className="platform-comparison__stat-label">{t('compare.matching')}</span>
        </div>
        <div className="platform-comparison__stat platform-comparison__stat--same-type">
          <span className="platform-comparison__stat-value">{summary.sameType}</span>
          <span className="platform-comparison__stat-label">{t('compare.sameType')}</span>
        </div>
        <div className="platform-comparison__stat platform-comparison__stat--different">
          <span className="platform-comparison__stat-value">{summary.differentType}</span>
          <span className="platform-comparison__stat-label">{t('compare.differentType')}</span>
        </div>
      </div>

      <p className="platform-comparison__hint">{t('compare.hint')}</p>

      <div className="platform-comparison__table-wrap">
        <table className="platform-comparison__table">
          <thead>
            <tr>
              <th>{t('common.phys')}</th>
              <th>{primaryName}</th>
              <th>{compareName}</th>
              <th>{t('common.status')}</th>
            </tr>
          </thead>
          <tbody>
            {summary.rows.map((row) => (
              <ComparisonRow
                key={row.physical}
                row={row}
                isHovered={hoveredPin === row.physical}
                onHover={onHoverPin}
                statusLabel={statusLabels[row.status]}
                statusTitle={statusTitles[row.status]}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
