import type { CSSProperties } from 'react';
import { GpioHeader } from './GpioHeader';
import { getPlatformAccentColor, getPlatformHeaderRowCount } from '../hardware';
import type { GpioPlatform, HardwareDevice } from '../hardware';

interface PlatformCompareHeadersProps {
  primary: GpioPlatform;
  compare: GpioPlatform;
  primaryDevices: HardwareDevice[];
  hoveredPin: number | null;
  onHoverPin: (physical: number | null) => void;
  selectedPins: ReadonlySet<number>;
  onToggleSelectedPin: (physical: number) => void;
  legendFilters: readonly string[];
  conflictPins: ReadonlySet<number>;
  showSpiBusPrimary: boolean;
  showSpiBusCompare: boolean;
}

export function PlatformCompareHeaders({
  primary,
  compare,
  primaryDevices,
  hoveredPin,
  onHoverPin,
  selectedPins,
  onToggleSelectedPin,
  legendFilters,
  conflictPins,
  showSpiBusPrimary,
  showSpiBusCompare,
}: PlatformCompareHeadersProps) {
  const primaryColor = getPlatformAccentColor(primary.id);
  const compareColor = getPlatformAccentColor(compare.id);
  const uniformPinCount = primary.pinCount === compare.pinCount;
  const sharedRowCount = uniformPinCount
    ? Math.max(
        getPlatformHeaderRowCount(primary),
        getPlatformHeaderRowCount(compare),
      )
    : undefined;

  return (
    <div
      className="platform-compare-headers"
      data-uniform={uniformPinCount ? '' : undefined}
      data-pin-count={uniformPinCount ? primary.pinCount : undefined}
      style={
        sharedRowCount != null
          ? ({ '--gpio-rows': sharedRowCount } as CSSProperties)
          : undefined
      }
    >
      <div
        className="platform-compare-headers__col"
        style={{ '--platform-accent': primaryColor } as CSSProperties}
        aria-label={primary.shortName ?? primary.name}
      >
        <GpioHeader
          platform={primary}
          selectedDevices={primaryDevices}
          hoveredPin={hoveredPin}
          onHoverPin={onHoverPin}
          selectedPins={selectedPins}
          onToggleSelectedPin={onToggleSelectedPin}
          legendFilters={legendFilters}
          conflictPins={conflictPins}
          showSpiBus={showSpiBusPrimary}
          sharedRowCount={sharedRowCount}
          showNotes={false}
        />
      </div>
      <div
        className="platform-compare-headers__col"
        style={{ '--platform-accent': compareColor } as CSSProperties}
        aria-label={compare.shortName ?? compare.name}
      >
        <GpioHeader
          platform={compare}
          selectedDevices={[]}
          hoveredPin={hoveredPin}
          onHoverPin={onHoverPin}
          selectedPins={selectedPins}
          onToggleSelectedPin={onToggleSelectedPin}
          legendFilters={legendFilters}
          conflictPins={new Set()}
          showSpiBus={showSpiBusCompare}
          sharedRowCount={sharedRowCount}
          showNotes={false}
        />
      </div>
    </div>
  );
}
