import { getPlatformAccentColor } from '../hardware';
import type { BoardFormFactor, BoardFormFactorFamily, GpioPlatform } from '../hardware';
import {
  getFormFactor,
  getFormFactorMetrics,
  getHeaderColumns,
  getHeaderLengthMm,
  getHeaderPitch,
  getHeaderRows,
  getHeaderWidthMm,
} from '../hardware/formFactor';
import { createFormFactorClassTranslator, useI18n } from '../i18n';

interface FormFactorComparisonProps {
  primary: GpioPlatform;
  compare: GpioPlatform;
}

function BoardOutline({
  formFactor,
  color,
  label,
  opacity = 0.35,
  x = 0,
  y = 0,
}: {
  formFactor: BoardFormFactor;
  color: string;
  label: string;
  opacity?: number;
  x?: number;
  y?: number;
}) {
  const pitch = getHeaderPitch(formFactor.gpioHeader);
  const headerLength = getHeaderLengthMm(formFactor.gpioHeader);
  const headerWidth = getHeaderWidthMm(formFactor.gpioHeader);
  const pin1 = formFactor.gpioHeader.pin1;

  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <rect
        x={0}
        y={0}
        width={formFactor.widthMm}
        height={formFactor.heightMm}
        rx={1.5}
        fill={color}
        fillOpacity={0.18}
        stroke={color}
        strokeWidth={0.6}
      />
      {formFactor.mountingHoles?.map((hole, index) => (
        <circle
          key={`${label}-hole-${index}`}
          cx={hole.x}
          cy={hole.y}
          r={(hole.diameterMm ?? 2.5) / 2}
          fill="#94a3b8"
          stroke="#0f172a"
          strokeWidth={0.25}
        />
      ))}
      <rect
        x={pin1.x - pitch / 2}
        y={pin1.y}
        width={headerWidth}
        height={headerLength}
        rx={0.4}
        fill="#1e293b"
        stroke="#0f172a"
        strokeWidth={0.3}
      />
      {Array.from({ length: getHeaderRows(formFactor.gpioHeader) }, (_, row) =>
        Array.from({ length: getHeaderColumns(formFactor.gpioHeader) }, (_, col) => {
          const pin = row * 2 + col + 1;
          const cx = pin1.x - pitch / 2 + pitch / 2 + col * pitch;
          const cy = pin1.y + pitch / 2 + row * pitch;
          return (
            <circle
              key={`${label}-pin-${pin}`}
              cx={cx}
              cy={cy}
              r={0.55}
              fill={pin === 1 ? '#f59e0b' : '#e2e8f0'}
              stroke="#0f172a"
              strokeWidth={0.15}
            />
          );
        }),
      )}
      <text
        x={formFactor.widthMm / 2}
        y={formFactor.heightMm + 4}
        textAnchor="middle"
        fontSize={3}
        fontWeight={700}
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}

function AlignedOverlay({
  primary,
  compare,
  primaryFf,
  compareFf,
}: {
  primary: GpioPlatform;
  compare: GpioPlatform;
  primaryFf: BoardFormFactor;
  compareFf: BoardFormFactor;
}) {
  const { t } = useI18n();
  const primaryColor = getPlatformAccentColor(primary.id);
  const compareColor = getPlatformAccentColor(compare.id);
  const padding = 8;
  const viewWidth = Math.max(primaryFf.widthMm, compareFf.widthMm) + padding * 2;
  const viewHeight =
    Math.max(primaryFf.heightMm, compareFf.heightMm) +
    getHeaderLengthMm(primaryFf.gpioHeader) +
    padding * 2 +
    8;

  const primaryOffsetX = padding - primaryFf.gpioHeader.pin1.x;
  const primaryOffsetY = padding - primaryFf.gpioHeader.pin1.y;
  const compareOffsetX = padding - compareFf.gpioHeader.pin1.x;
  const compareOffsetY = padding - compareFf.gpioHeader.pin1.y;

  return (
    <figure className="form-factor-compare__figure">
      <figcaption className="form-factor-compare__caption">
        {t('formFactor.alignedCaption')}
      </figcaption>
      <svg
        className="form-factor-compare__svg"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        role="img"
        aria-label={t('formFactor.overlayAria', {
          primary: primary.shortName ?? primary.name,
          compare: compare.shortName ?? compare.name,
        })}
      >
        <BoardOutline
          formFactor={compareFf}
          color={compareColor}
          label={compare.shortName ?? compare.name}
          opacity={0.45}
          x={compareOffsetX}
          y={compareOffsetY}
        />
        <BoardOutline
          formFactor={primaryFf}
          color={primaryColor}
          label={primary.shortName ?? primary.name}
          opacity={0.85}
          x={primaryOffsetX}
          y={primaryOffsetY}
        />
        <circle cx={padding} cy={padding} r={0.9} fill="#f59e0b" stroke="#0f172a" strokeWidth={0.2} />
        <text x={padding + 2} y={padding + 1} fontSize={2.2} fill="#64748b">
          {t('formFactor.pin1')}
        </text>
      </svg>
    </figure>
  );
}

function FamilyDiagram({ family }: { family: BoardFormFactorFamily }) {
  const { t } = useI18n();
  const { referenceWidthMm, referenceHeightMm, variants } = family;
  const padding = 6;
  const viewWidth = referenceWidthMm + padding * 2 + 14;
  const viewHeight = referenceHeightMm + padding * 2 + 8;
  const headerPlacement = {
    pin1: { x: 1.27, y: 0 },
    pitchMm: 2.54,
    columns: 2,
    rows: 20,
  };
  const headerWidth = getHeaderWidthMm(headerPlacement);
  const headerLength = getHeaderLengthMm(headerPlacement);
  const pitch = getHeaderPitch(headerPlacement);

  const sortedVariants = [...variants].sort((a, b) => b.widthMm * b.heightMm - a.widthMm * a.heightMm);
  const fills = ['#bbf7d0', '#4ade80', '#86efac'];

  const hatHoles = [
    { x: 3.5, y: 3.5 },
    { x: 3.5, y: 52.5 },
    { x: 61.5, y: 3.5 },
    { x: 61.5, y: 52.5 },
    { x: referenceWidthMm - 3.5, y: 3.5 },
    { x: referenceWidthMm - 3.5, y: 52.5 },
  ];

  return (
    <figure className="form-factor-compare__figure">
      <figcaption className="form-factor-compare__caption">
        {t('formFactor.familyCaption', { label: family.label })}
      </figcaption>
      <svg
        className="form-factor-compare__svg form-factor-compare__svg--family"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        role="img"
        aria-label={family.label}
      >
        <g transform={`translate(${padding} ${padding})`}>
          {sortedVariants.map((variant, index) => (
            <g
              key={variant.id}
              transform={`translate(${variant.offsetXMm ?? 0} ${variant.offsetYMm ?? 0})`}
            >
              <rect
                x={0}
                y={0}
                width={variant.widthMm}
                height={variant.heightMm}
                rx={1.2}
                fill={fills[index % fills.length]}
                fillOpacity={0.35 + index * 0.12}
                stroke="#15803d"
                strokeWidth={0.5}
              />
              <text
                x={variant.widthMm / 2}
                y={variant.heightMm - 3}
                textAnchor="middle"
                fontSize={3.5}
                fontWeight={700}
                fill="#14532d"
              >
                {variant.label}
              </text>
            </g>
          ))}
          {hatHoles.map((hole, index) => (
            <circle
              key={`family-hole-${index}`}
              cx={hole.x}
              cy={hole.y}
              r={1.2}
              fill="#fbbf24"
              stroke="#0f172a"
              strokeWidth={0.2}
            />
          ))}
          <g transform={`translate(${referenceWidthMm - headerWidth + 1.27} 0)`}>
            <rect
              x={-pitch / 2}
              y={0}
              width={headerWidth}
              height={headerLength}
              fill="#1e293b"
              stroke="#0f172a"
              strokeWidth={0.3}
            />
            {Array.from({ length: getHeaderRows(headerPlacement) }, (_, row) =>
              Array.from({ length: getHeaderColumns(headerPlacement) }, (_, col) => {
                const pin = row * 2 + col + 1;
                return (
                  <circle
                    key={`family-pin-${pin}`}
                    cx={pitch / 2 + col * pitch}
                    cy={pitch / 2 + row * pitch}
                    r={0.55}
                    fill={pin === 1 ? '#f59e0b' : '#e2e8f0'}
                  />
                );
              }),
            )}
          </g>
        </g>
      </svg>
    </figure>
  );
}

function MetricsTable({
  primary,
  compare,
  primaryFf,
  compareFf,
}: {
  primary: GpioPlatform;
  compare: GpioPlatform;
  primaryFf: BoardFormFactor;
  compareFf: BoardFormFactor;
}) {
  const { t } = useI18n();
  const translateClass = createFormFactorClassTranslator(t);
  const emDash = t('common.emDash');
  const primaryMetrics = getFormFactorMetrics(primaryFf, translateClass);
  const compareMetrics = getFormFactorMetrics(compareFf, translateClass);
  const primaryName = primary.shortName ?? primary.name;
  const compareName = compare.shortName ?? compare.name;

  const rows: { label: string; primary: string; compare: string }[] = [
    {
      label: t('formFactor.pcbSize'),
      primary: `${primaryMetrics.widthMm} × ${primaryMetrics.heightMm} mm`,
      compare: `${compareMetrics.widthMm} × ${compareMetrics.heightMm} mm`,
    },
    {
      label: t('formFactor.boardArea'),
      primary: `${primaryMetrics.areaMm2.toFixed(0)} mm²`,
      compare: `${compareMetrics.areaMm2.toFixed(0)} mm²`,
    },
    {
      label: t('formFactor.formFactorType'),
      primary: primaryMetrics.formFactorClassLabel || emDash,
      compare: compareMetrics.formFactorClassLabel || emDash,
    },
    {
      label: t('formFactor.mountingHoles'),
      primary: primaryMetrics.mountingHoleCount > 0 ? String(primaryMetrics.mountingHoleCount) : emDash,
      compare: compareMetrics.mountingHoleCount > 0 ? String(compareMetrics.mountingHoleCount) : emDash,
    },
    {
      label: t('formFactor.gpioHeader'),
      primary: `${primaryMetrics.headerWidthMm.toFixed(1)} × ${primaryMetrics.headerLengthMm.toFixed(1)} mm`,
      compare: `${compareMetrics.headerWidthMm.toFixed(1)} × ${compareMetrics.headerLengthMm.toFixed(1)} mm`,
    },
    {
      label: t('formFactor.profile'),
      primary: primaryFf.label,
      compare: compareFf.label,
    },
  ];

  return (
    <table className="form-factor-compare__table">
      <thead>
        <tr>
          <th scope="col">{t('common.property')}</th>
          <th scope="col">{primaryName}</th>
          <th scope="col">{compareName}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td>{row.primary}</td>
            <td>{row.compare}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function FormFactorComparison({ primary, compare }: FormFactorComparisonProps) {
  const { t } = useI18n();
  const primaryFf = getFormFactor(primary);
  const compareFf = getFormFactor(compare);

  if (!primaryFf || !compareFf) {
    return <p className="form-factor-compare__missing">{t('formFactor.missing')}</p>;
  }

  const piFamily = primaryFf.family ?? compareFf.family;

  return (
    <div className="form-factor-compare">
      <AlignedOverlay
        primary={primary}
        compare={compare}
        primaryFf={primaryFf}
        compareFf={compareFf}
      />

      <MetricsTable
        primary={primary}
        compare={compare}
        primaryFf={primaryFf}
        compareFf={compareFf}
      />

      {piFamily && <FamilyDiagram family={piFamily} />}

      {(primaryFf.notes || compareFf.notes) && (
        <div className="form-factor-compare__notes">
          {primaryFf.notes && (
            <p>
              <strong>{primary.shortName ?? primary.name}:</strong> {primaryFf.notes}
            </p>
          )}
          {compareFf.notes && (
            <p>
              <strong>{compare.shortName ?? compare.name}:</strong> {compareFf.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
