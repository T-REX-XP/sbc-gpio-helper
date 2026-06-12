import { useMemo } from 'react';
import type { DeviceTreeConfig, DeviceTreeOverlay } from '../hardware';
import {
  formatOverlaySignals,
  getOverlayPhysicalPins,
  groupOverlaysByCategory,
} from '../hardware';
import type { DeviceTreeOverlayCategory } from '../hardware/types';
import { useI18n } from '../i18n';

interface DeviceTreeOverlaysProps {
  deviceTree: DeviceTreeConfig;
  highlightedOverlayId: string | null;
  onHighlightOverlay: (overlay: DeviceTreeOverlay | null) => void;
}

function OverlayRow({
  overlay,
  isHighlighted,
  onHighlight,
}: {
  overlay: DeviceTreeOverlay;
  isHighlighted: boolean;
  onHighlight: (overlay: DeviceTreeOverlay | null) => void;
}) {
  const { t } = useI18n();
  const physicalPins = getOverlayPhysicalPins(overlay);
  const emDash = t('common.emDash');

  return (
    <tr
      className={[
        'device-tree__row',
        isHighlighted ? 'device-tree__row--highlighted' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={() => onHighlight(overlay)}
      onMouseLeave={() => onHighlight(null)}
      onFocus={() => onHighlight(overlay)}
      onBlur={() => onHighlight(null)}
      tabIndex={0}
    >
      <td>
        <code className="device-tree__overlay-id">{overlay.id}</code>
      </td>
      <td>{overlay.description}</td>
      <td>{overlay.deviceNode ?? emDash}</td>
      <td className="device-tree__signals">{formatOverlaySignals(overlay)}</td>
      <td>
        {physicalPins.length > 0 ? (
          <span className="device-tree__pins">
            {physicalPins.map((pin) => (
              <span key={pin} className="device-tree__pin-badge">
                {pin}
              </span>
            ))}
          </span>
        ) : (
          emDash
        )}
      </td>
      <td>
        <code className="device-tree__usage">{overlay.usage}</code>
        {overlay.parameters && overlay.parameters.length > 0 && (
          <ul className="device-tree__params">
            {overlay.parameters.map((param) => (
              <li key={param.name}>
                <code>{param.name}</code>
                {param.required ? ` ${t('common.required')}` : ''}
                {param.default ? ` ${t('common.defaultParam', { value: param.default })}` : ''}
                {param.values ? ` — ${param.values}` : ''}
                {param.description ? `: ${param.description}` : ''}
              </li>
            ))}
          </ul>
        )}
        {overlay.notes && <p className="device-tree__note">{overlay.notes}</p>}
      </td>
    </tr>
  );
}

export function DeviceTreeOverlays({
  deviceTree,
  highlightedOverlayId,
  onHighlightOverlay,
}: DeviceTreeOverlaysProps) {
  const { t } = useI18n();
  const grouped = useMemo(
    () => groupOverlaysByCategory(deviceTree.overlays),
    [deviceTree.overlays],
  );

  const categoryLabel = (category: DeviceTreeOverlayCategory) =>
    t(`deviceTree.categories.${category}`);

  return (
    <div className="device-tree">
      <div className="device-tree__intro">
        <p>{deviceTree.intro ?? t('deviceTree.introFallback')}</p>
        <dl className="device-tree__meta">
          <div>
            <dt>{t('deviceTree.chip')}</dt>
            <dd>{deviceTree.chipFamily}</dd>
          </div>
          <div>
            <dt>{t('deviceTree.configFile')}</dt>
            <dd>
              <code>{deviceTree.configPath}</code>
            </dd>
          </div>
          <div>
            <dt>{t('deviceTree.overlayDirectory')}</dt>
            <dd>
              <code>{deviceTree.overlayDirectory}</code>
            </dd>
          </div>
          {deviceTree.fdtfileExample && (
            <div>
              <dt>{t('deviceTree.exampleFdtfile')}</dt>
              <dd>
                <code>{deviceTree.fdtfileExample}</code>
              </dd>
            </div>
          )}
        </dl>
        <p className="device-tree__docs">
          <a href={deviceTree.documentationUrl} target="_blank" rel="noreferrer">
            {t('deviceTree.wikiLink')}
          </a>
          {deviceTree.modernDocumentationUrl && (
            <>
              {' · '}
              <a
                href={deviceTree.modernDocumentationUrl}
                target="_blank"
                rel="noreferrer"
              >
                {t('deviceTree.modernDocsLink')}
              </a>
            </>
          )}
        </p>
        {deviceTree.exampleConfig && (
          <pre className="device-tree__example">
            <code>{deviceTree.exampleConfig}</code>
          </pre>
        )}
      </div>

      {[...grouped.entries()].map(([category, overlays]) => {
        if (overlays.length === 0) return null;

        return (
          <section key={category} className="device-tree__category">
            <h3 className="device-tree__category-title">{categoryLabel(category)}</h3>
            <div className="device-tree__table-wrap">
              <table className="device-tree__table">
                <thead>
                  <tr>
                    <th scope="col">{t('deviceTree.overlay')}</th>
                    <th scope="col">{t('deviceTree.function')}</th>
                    <th scope="col">{t('deviceTree.deviceNode')}</th>
                    <th scope="col">{t('deviceTree.signals')}</th>
                    <th scope="col">{t('deviceTree.headerPins')}</th>
                    <th scope="col">{t('deviceTree.usage')}</th>
                  </tr>
                </thead>
                <tbody>
                  {overlays.map((overlay) => (
                    <OverlayRow
                      key={overlay.id}
                      overlay={overlay}
                      isHighlighted={highlightedOverlayId === overlay.id}
                      onHighlight={onHighlightOverlay}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
