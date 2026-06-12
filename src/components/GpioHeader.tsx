import type { CSSProperties } from 'react';
import { SpiBusOverlay } from './SpiBusOverlay';
import type { DevicePinUsage, GpioPin, GpioPlatform, HardwareDevice } from '../hardware';
import {
  getPinDisplayLabels,
  getPlatformHeaderRowCount,
  hardwareRegistry,
  pinHasSpiFunction,
  pinMatchesLegendFilters,
  type PinLabelStrings,
} from '../hardware';
import { createPinLabelStrings, useI18n } from '../i18n';

const EMPTY_PIN_SET = new Set<number>();

interface GpioHeaderProps {
  platform: GpioPlatform;
  selectedDevices: HardwareDevice[];
  hoveredPin: number | null;
  onHoverPin: (physical: number | null) => void;
  selectedPins: ReadonlySet<number>;
  onToggleSelectedPin: (physical: number) => void;
  legendFilters: readonly string[];
  conflictPins: ReadonlySet<number>;
  showSpiBus?: boolean;
  overlayHighlightPins?: ReadonlySet<number>;
  /** When set (e.g. side-by-side compare), both headers use the same row count. */
  sharedRowCount?: number;
  showNotes?: boolean;
}

function pinCellStyle(
  usages: DevicePinUsage[],
  hasConflict: boolean,
): CSSProperties | undefined {
  if (usages.length === 0 || hasConflict) return undefined;

  const devices = hardwareRegistry.getUniqueDevicesFromUsages(usages);
  if (devices.length === 1) {
    return {
      '--device-color': hardwareRegistry.getDeviceColor(devices[0].id),
    } as CSSProperties;
  }

  const colors = devices.map((d) => hardwareRegistry.getDeviceColor(d.id));
  const stops = colors
    .map((color, index) => {
      const start = (index / colors.length) * 100;
      const end = ((index + 1) / colors.length) * 100;
      return `${color} ${start}%, ${color} ${end}%`;
    })
    .join(', ');

  return {
    '--device-color': colors[0],
    '--device-gradient': `linear-gradient(90deg, ${stops})`,
  } as CSSProperties;
}

function PinCell({
  pin,
  platform,
  side,
  usages,
  isHovered,
  hasConflict,
  isHighlighted,
  legendDimmed,
  overlayHighlighted,
  showSpiBus,
  pinLabelStrings,
  isSelected,
  onHover,
  onToggleSelect,
}: {
  pin: GpioPin;
  platform: GpioPlatform;
  side: 'odd' | 'even';
  usages: DevicePinUsage[];
  isHovered: boolean;
  hasConflict: boolean;
  isHighlighted: boolean;
  legendDimmed: boolean;
  overlayHighlighted: boolean;
  showSpiBus: boolean;
  pinLabelStrings: PinLabelStrings;
  isSelected: boolean;
  onHover: (physical: number | null) => void;
  onToggleSelect: (physical: number) => void;
}) {
  const isUsed = usages.length > 0;
  const uniqueDevices = hardwareRegistry.getUniqueDevicesFromUsages(usages);
  const isShared = isUsed && !hasConflict && uniqueDevices.length > 1;
  const signalLabel = isUsed
    ? usages.map((u) => u.assignment.signal).join('/')
    : undefined;
  const labels = getPinDisplayLabels(pin, platform, showSpiBus, pinLabelStrings);
  const isSpiBusPin = showSpiBus && pinHasSpiFunction(platform.id, pin);
  const displayType = isSpiBusPin ? 'spi' : pin.type;

  const ariaLabel = [
    `Pin ${pin.physical}`,
    labels.primary,
    labels.secondary,
    signalLabel ? `used as ${signalLabel}` : '',
    isUsed ? `by ${uniqueDevices.map((d) => d.shortName).join(', ')}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <button
      type="button"
      className={[
        'pin-cell',
        `pin-cell--${side}`,
        `pin-cell--${displayType}`,
        isSpiBusPin ? 'pin-cell--spi-bus' : '',
        isUsed ? 'pin-cell--used' : '',
        isShared ? 'pin-cell--shared' : '',
        hasConflict ? 'pin-cell--conflict' : '',
        isHovered ? 'pin-cell--hovered' : '',
        isHighlighted ? 'pin-cell--highlighted' : '',
        legendDimmed ? 'pin-cell--legend-dim' : '',
        overlayHighlighted ? 'pin-cell--overlay-match' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          ...pinCellStyle(usages, hasConflict),
          '--pin-fill': `var(--gpio-pin-${displayType})`,
        } as CSSProperties
      }
      title={
        signalLabel
          ? `${labels.primary} — ${signalLabel}`
          : [labels.primary, labels.secondary].filter(Boolean).join(' ')
      }
      onMouseEnter={() => onHover(pin.physical)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(pin.physical)}
      onBlur={() => onHover(null)}
      onClick={() => onToggleSelect(pin.physical)}
      aria-pressed={isSelected}
      aria-label={ariaLabel}
    >
      <span className="pin-cell__side-label">
        <span className="pin-cell__primary">{labels.primary}</span>
        {labels.secondary && (
          <span className="pin-cell__secondary">{labels.secondary}</span>
        )}
        {signalLabel && <span className="pin-cell__signal">{signalLabel}</span>}
      </span>
      <span
        className={[
          'pin-cell__circle',
          pin.physical === 1 ? 'pin-cell__circle--pin1' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="pin-cell__num">{pin.physical}</span>
      </span>
    </button>
  );
}

function PinColumn({
  pins,
  platform,
  side,
  selectedDevices,
  hoveredPin,
  onHoverPin,
  selectedPins,
  onToggleSelectedPin,
  legendFilters,
  conflictPins,
  showSpiBus,
  overlayHighlightPins,
  pinLabelStrings,
}: {
  pins: GpioPin[];
  platform: GpioPlatform;
  side: 'odd' | 'even';
  selectedDevices: HardwareDevice[];
  hoveredPin: number | null;
  onHoverPin: (physical: number | null) => void;
  selectedPins: ReadonlySet<number>;
  onToggleSelectedPin: (physical: number) => void;
  legendFilters: readonly string[];
  conflictPins: ReadonlySet<number>;
  showSpiBus: boolean;
  overlayHighlightPins: ReadonlySet<number>;
  pinLabelStrings: PinLabelStrings;
}) {
  const filtering = legendFilters.length > 0;

  return (
    <div className={`gpio-header__column gpio-header__column--${side}`} role="list">
      {pins.map((pin) => {
        const usages = hardwareRegistry.getPinUsages(selectedDevices, pin.physical);
        const hasConflict = hardwareRegistry.hasPinConflict(usages);
        const legendMatch = pinMatchesLegendFilters(
          platform.id,
          pin,
          legendFilters,
          selectedDevices,
          conflictPins,
        );
        const isSelected = selectedPins.has(pin.physical);
        const isHighlighted = isSelected || (filtering && legendMatch);

        return (
          <PinCell
            key={pin.physical}
            pin={pin}
            platform={platform}
            side={side}
            usages={usages}
            isHovered={hoveredPin === pin.physical}
            hasConflict={hasConflict}
            isHighlighted={isHighlighted}
            legendDimmed={filtering && !legendMatch && !isSelected}
            overlayHighlighted={overlayHighlightPins.has(pin.physical)}
            showSpiBus={showSpiBus}
            pinLabelStrings={pinLabelStrings}
            isSelected={isSelected}
            onHover={onHoverPin}
            onToggleSelect={onToggleSelectedPin}
          />
        );
      })}
    </div>
  );
}

export function GpioHeader({
  platform,
  selectedDevices,
  hoveredPin,
  onHoverPin,
  selectedPins,
  onToggleSelectedPin,
  legendFilters,
  conflictPins,
  showSpiBus = false,
  overlayHighlightPins = EMPTY_PIN_SET,
  sharedRowCount,
  showNotes = true,
}: GpioHeaderProps) {
  const { t } = useI18n();
  const pinLabelStrings = createPinLabelStrings(t);
  const pins = hardwareRegistry.getPins(platform.id);
  const oddColumn = pins.filter((p) => p.physical % 2 === 1);
  const evenColumn = pins.filter((p) => p.physical % 2 === 0);
  const lastPin = platform.pinCount;
  const rowCount = sharedRowCount ?? getPlatformHeaderRowCount(platform);
  const firstSelectedPin =
    selectedPins.size > 0 ? Math.min(...selectedPins) : null;
  const highlightedPhysical = hoveredPin ?? firstSelectedPin;

  return (
    <div
      className="gpio-header"
      data-pin-count={platform.pinCount}
      style={{ '--gpio-rows': rowCount } as CSSProperties}
    >
      <div className="gpio-header__scroll">
        <div className="gpio-header__board">
          <span className="gpio-header__board-label">
            {platform.shortName ?? platform.name}
          </span>
          <div className={`gpio-header__body${showSpiBus ? ' gpio-header__body--spi' : ''}`}>
            <PinColumn
              pins={oddColumn}
              platform={platform}
              side="odd"
              selectedDevices={selectedDevices}
              hoveredPin={hoveredPin}
              onHoverPin={onHoverPin}
              selectedPins={selectedPins}
              onToggleSelectedPin={onToggleSelectedPin}
              legendFilters={legendFilters}
              conflictPins={conflictPins}
              showSpiBus={showSpiBus}
              overlayHighlightPins={overlayHighlightPins}
              pinLabelStrings={pinLabelStrings}
            />
            <div className="gpio-header__strip" aria-hidden="true">
              {showSpiBus && (
                <SpiBusOverlay
                  platformId={platform.id}
                  rowCount={rowCount}
                  highlightedPhysical={highlightedPhysical}
                />
              )}
            </div>
            <PinColumn
              pins={evenColumn}
              platform={platform}
              side="even"
              selectedDevices={selectedDevices}
              hoveredPin={hoveredPin}
              onHoverPin={onHoverPin}
              selectedPins={selectedPins}
              onToggleSelectedPin={onToggleSelectedPin}
              legendFilters={legendFilters}
              conflictPins={conflictPins}
              showSpiBus={showSpiBus}
              overlayHighlightPins={overlayHighlightPins}
              pinLabelStrings={pinLabelStrings}
            />
          </div>
          <div className="gpio-header__labels">
            <span>{t('gpioHeader.pin1')}</span>
            <span>{t('gpioHeader.pin40', { last: lastPin })}</span>
          </div>
          {showNotes && platform.notes && (
            <p className="gpio-header__note">{platform.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}
