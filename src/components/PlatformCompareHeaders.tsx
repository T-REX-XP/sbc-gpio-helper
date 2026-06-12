import type { CSSProperties } from 'react';
import { GpioHeader } from './GpioHeader';
import { getPlatformAccentColor } from '../hardware';
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

  return (
    <div className="platform-compare-headers">
      <div
        className="platform-compare-headers__col"
        style={{ '--platform-accent': primaryColor } as CSSProperties}
      >
        <h3 className="platform-compare-headers__title">{primary.shortName ?? primary.name}</h3>
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
        />
      </div>
      <div
        className="platform-compare-headers__col"
        style={{ '--platform-accent': compareColor } as CSSProperties}
      >
        <h3 className="platform-compare-headers__title">{compare.shortName ?? compare.name}</h3>
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
        />
      </div>
    </div>
  );
}
