import type { CSSProperties } from 'react';
import { getPinGpioRef, getPlatformAccentColor, hardwareRegistry } from '../hardware';
import type { GpioPlatform, HardwareDevice, PinType } from '../hardware';
import { useI18n } from '../i18n';
import { ButtonLabel } from './icons';

interface PinDetailsProps {
  platform: GpioPlatform;
  comparePlatform?: GpioPlatform | null;
  hoveredPin: number | null;
  selectedPins: ReadonlySet<number>;
  focusPin: number | null;
  onFocusPin: (physical: number) => void;
  onClearSelection: () => void;
  selectedDevices: HardwareDevice[];
}

function PinPlatformBlock({
  platform,
  physical,
  accent,
}: {
  platform: GpioPlatform;
  physical: number;
  accent: string;
}) {
  const { t } = useI18n();
  const pin = hardwareRegistry.getPinByPhysical(platform.id, physical);
  if (!pin) return null;

  const gpioRef = getPinGpioRef(pin);
  const gpioLabel = platform.gpioNumberLabel ?? t('common.gpio');

  return (
    <div
      className="pin-details__platform-block"
      style={{ '--platform-accent': accent } as CSSProperties}
    >
      <h3 className="pin-details__platform-name">{platform.shortName ?? platform.name}</h3>
      <dl className="pin-details__meta">
        <div>
          <dt>{t('common.name')}</dt>
          <dd>{pin.bankName ?? pin.name}</dd>
        </div>
        {gpioRef && (
          <div>
            <dt>{gpioLabel}</dt>
            <dd>{gpioRef.replace(/^(BCM|GPIO)\s/, '')}</dd>
          </div>
        )}
        <div>
          <dt>{t('common.type')}</dt>
          <dd className={`pin-type pin-type--${pin.type}`}>
            {t(`pinDetails.pinTypes.${pin.type}` as `pinDetails.pinTypes.${PinType}`)}
          </dd>
        </div>
        {pin.altFunctions && pin.altFunctions.length > 0 && (
          <div>
            <dt>{t('pinDetails.altFunctions')}</dt>
            <dd>{pin.altFunctions.join(', ')}</dd>
          </div>
        )}
        {pin.notes && (
          <div>
            <dt>{t('pinDetails.note')}</dt>
            <dd>{pin.notes}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

export function PinDetails({
  platform,
  comparePlatform,
  hoveredPin,
  selectedPins,
  focusPin,
  onFocusPin,
  onClearSelection,
  selectedDevices,
}: PinDetailsProps) {
  const { t } = useI18n();
  const selectedDetailPin =
    selectedPins.size > 0 ? Math.min(...selectedPins) : null;
  const detailPin = hoveredPin ?? focusPin ?? selectedDetailPin;
  const sortedSelection = [...selectedPins].sort((a, b) => a - b);
  const selectionKey =
    sortedSelection.length === 1
      ? 'pinDetails.pinsSelected_one'
      : 'pinDetails.pinsSelected_other';

  if (detailPin === null) {
    return (
      <div className="pin-details pin-details--empty">
        <h2 className="section-title">{t('pinDetails.title')}</h2>
        <p>{t('pinDetails.emptyHint')}</p>
      </div>
    );
  }

  const pin = hardwareRegistry.getPinByPhysical(platform.id, detailPin);
  if (!pin) return null;

  const usages = hardwareRegistry.getPinUsages(selectedDevices, detailPin);
  const hasConflict = hardwareRegistry.hasPinConflict(usages);
  const gpioRef = getPinGpioRef(pin);
  const isComparing = comparePlatform != null;
  const showSelectionBar = !hoveredPin && selectedPins.size > 0;

  return (
    <div className="pin-details">
      {showSelectionBar && (
        <div className="pin-details__selection">
          <span className="pin-details__selection-count">
            {t(selectionKey, { count: selectedPins.size })}
          </span>
          <button
            type="button"
            className="pin-details__selection-clear btn-with-icon"
            onClick={onClearSelection}
          >
            <ButtonLabel icon="clear">{t('pinDetails.clearSelection')}</ButtonLabel>
          </button>
          {selectedPins.size > 1 && (
            <ul className="pin-details__selection-list">
              {sortedSelection.map((physical) => (
                <li key={physical}>
                  <button
                    type="button"
                    className={[
                      'pin-details__selection-pin',
                      focusPin === physical ? 'pin-details__selection-pin--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-pressed={focusPin === physical}
                    onClick={() => onFocusPin(physical)}
                  >
                    {physical}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <h2 className="section-title">
        {t('pinDetails.pinTitle', { physical: pin.physical })}
        {!isComparing && gpioRef && <span className="pin-details__bcm">{gpioRef}</span>}
      </h2>

      {isComparing ? (
        <div className="pin-details__platforms">
          <PinPlatformBlock
            platform={platform}
            physical={detailPin}
            accent={getPlatformAccentColor(platform.id)}
          />
          <PinPlatformBlock
            platform={comparePlatform}
            physical={detailPin}
            accent={getPlatformAccentColor(comparePlatform.id)}
          />
        </div>
      ) : (
        <dl className="pin-details__meta">
          <div>
            <dt>{t('common.name')}</dt>
            <dd>{pin.bankName ?? pin.name}</dd>
          </div>
          <div>
            <dt>{t('common.type')}</dt>
            <dd className={`pin-type pin-type--${pin.type}`}>
              {t(`pinDetails.pinTypes.${pin.type}` as `pinDetails.pinTypes.${PinType}`)}
            </dd>
          </div>
          {pin.altFunctions && pin.altFunctions.length > 0 && (
            <div>
              <dt>{t('pinDetails.altFunctions')}</dt>
              <dd>{pin.altFunctions.join(', ')}</dd>
            </div>
          )}
          {pin.notes && (
            <div>
              <dt>{t('pinDetails.note')}</dt>
              <dd>{pin.notes}</dd>
            </div>
          )}
        </dl>
      )}

      {!isComparing &&
        (usages.length > 0 ? (
          <div className="pin-details__usages">
            <h3>{t('pinDetails.hardwareUsage')}</h3>
            <ul>
              {usages.map(({ device, assignment }) => (
                <li
                  key={device.id}
                  style={
                    {
                      '--device-color': hardwareRegistry.getDeviceColor(device.id),
                    } as CSSProperties
                  }
                >
                  <span className="pin-details__device">{device.shortName}</span>
                  <strong>{assignment.signal}</strong>
                  <span>{assignment.description}</span>
                </li>
              ))}
            </ul>
            {hasConflict && (
              <p className="pin-details__warning">{t('pinDetails.conflictWarning')}</p>
            )}
          </div>
        ) : (
          <p className="pin-details__free">{t('pinDetails.notUsed')}</p>
        ))}
    </div>
  );
}
