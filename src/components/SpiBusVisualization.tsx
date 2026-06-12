import type { GpioPlatform, HardwareDevice } from '../hardware';
import {
  getSpiBus,
  getSpiBuses,
  getSpiRole,
  getSpiSignalsUsedByDevices,
} from '../hardware';
import { useI18n } from '../i18n';

interface SpiBusVisualizationProps {
  platform: GpioPlatform;
  selectedDevices: HardwareDevice[];
  hoveredPin: number | null;
  onHoverPin: (physical: number | null) => void;
  activeBusId?: string | null;
}

function BusDiagram({
  platformId,
  busId,
  gpioColumnLabel,
  hoveredPin,
  onHoverPin,
  usedSignals,
  emDash,
  hatUseLabel,
}: {
  platformId: string;
  busId: string;
  gpioColumnLabel: string;
  hoveredPin: number | null;
  onHoverPin: (physical: number | null) => void;
  usedSignals: Map<number, string[]>;
  emDash: string;
  hatUseLabel: string;
}) {
  const { t } = useI18n();
  const bus = getSpiBus(platformId, busId);
  if (!bus) return null;

  const dataSignals = bus.signals.filter(
    (s) => !s.signal.startsWith('CE') && !s.signal.startsWith('CS'),
  );
  const ceSignals = bus.signals.filter(
    (s) => s.signal.startsWith('CE') || s.signal.startsWith('CS'),
  );

  return (
    <article className="spi-bus-card">
      <header className="spi-bus-card__header">
        <h3 className="spi-bus-card__title">{bus.name}</h3>
        {bus.enableOverlay && (
          <code className="spi-bus-card__overlay">{bus.enableOverlay}</code>
        )}
      </header>

      <p className="spi-bus-card__desc">{bus.description}</p>
      {bus.defaultNote && <p className="spi-bus-card__note">{bus.defaultNote}</p>}

      <div className="spi-bus-card__diagram" aria-hidden="true">
        <div className="spi-bus-card__hub">{bus.name}</div>
        <div className="spi-bus-card__lanes">
          {dataSignals.map((signal) => (
            <div
              key={signal.signal}
              className={`spi-bus-card__lane spi-bus-card__lane--${signal.signal.toLowerCase()}`}
            >
              <span className="spi-bus-card__lane-label">{signal.signal}</span>
              <span className="spi-bus-card__lane-line" />
            </div>
          ))}
        </div>
        <div className="spi-bus-card__ce-row">
          {ceSignals.map((signal) => (
            <div key={signal.signal} className="spi-bus-card__ce">
              <span>{signal.signal}</span>
            </div>
          ))}
        </div>
      </div>

      <table className="spi-bus-card__table">
        <thead>
          <tr>
            <th>{t('common.signal')}</th>
            <th>{t('common.phys')}</th>
            <th>{gpioColumnLabel}</th>
            <th>{hatUseLabel}</th>
          </tr>
        </thead>
        <tbody>
          {bus.signals.map((signal) => {
            const role = getSpiRole(platformId, signal.physical);
            const hatUse = usedSignals.get(signal.physical);
            const isHovered = hoveredPin === signal.physical;
            const gpioRef = signal.gpioNumber ?? signal.bcm;
            return (
              <tr
                key={`${busId}-${signal.signal}`}
                className={[
                  'spi-bus-card__row',
                  hatUse ? 'spi-bus-card__row--used' : '',
                  isHovered ? 'spi-bus-card__row--hovered' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={() => onHoverPin(signal.physical)}
                onMouseLeave={() => onHoverPin(null)}
              >
                <td>
                  <span className="spi-bus-card__signal">{role?.label ?? signal.signal}</span>
                </td>
                <td>{signal.physical}</td>
                <td>{gpioRef ?? emDash}</td>
                <td>{hatUse?.join(', ') ?? emDash}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </article>
  );
}

export function SpiBusVisualization({
  platform,
  selectedDevices,
  hoveredPin,
  onHoverPin,
  activeBusId,
}: SpiBusVisualizationProps) {
  const { t } = useI18n();
  const usedSignals = getSpiSignalsUsedByDevices(platform.id, selectedDevices);
  const buses = activeBusId
    ? getSpiBuses(platform.id).filter((bus) => bus.id === activeBusId)
    : getSpiBuses(platform.id);
  const gpioColumnLabel = platform.gpioNumberLabel ?? t('common.gpio');
  const emDash = t('common.emDash');
  const hatUseLabel = t('spi.hatUse');

  if (buses.length === 0) return null;

  return (
    <div className="spi-bus-viz" aria-label={t('spi.aria')}>
      <div className="spi-bus-viz__grid">
        {buses.map((bus) => (
          <BusDiagram
            key={bus.id}
            platformId={platform.id}
            busId={bus.id}
            gpioColumnLabel={gpioColumnLabel}
            hoveredPin={hoveredPin}
            onHoverPin={onHoverPin}
            usedSignals={usedSignals}
            emDash={emDash}
            hatUseLabel={hatUseLabel}
          />
        ))}
      </div>
    </div>
  );
}
