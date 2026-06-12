import { getSpiBuses } from '../hardware';

const ROW_COUNT = 20;

const HUB_Y: Record<string, number> = {
  spi0: 38,
  spi1: 68,
  'spi-a': 38,
  'spi-b': 68,
  spi3: 50,
};

function pinPosition(physical: number): { x: number; y: number } {
  const row = Math.floor((physical - 1) / 2);
  const isOdd = physical % 2 === 1;
  const x = isOdd ? 22 : 78;
  const y = 4 + (row / (ROW_COUNT - 1)) * 92;
  return { x, y };
}

const SIGNAL_COLORS: Record<string, string> = {
  MOSI: '#e879a8',
  MISO: '#f0abfc',
  SCLK: '#c084fc',
  CE0: '#fb7185',
  CE1: '#fda4af',
  CE2: '#fecdd3',
  CS0: '#fb7185',
  SS0: '#fb7185',
};

interface SpiBusOverlayProps {
  platformId: string;
  highlightedPhysical?: number | null;
}

export function SpiBusOverlay({ platformId, highlightedPhysical }: SpiBusOverlayProps) {
  const buses = getSpiBuses(platformId);

  return (
    <svg
      className="spi-bus-overlay"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {buses.map((bus) => {
        const hubY = HUB_Y[bus.id] ?? 50;
        const hub = { x: 50, y: hubY };

        return (
          <g key={bus.id}>
            {bus.signals.map((signal) => {
              const point = pinPosition(signal.physical);
              const color = SIGNAL_COLORS[signal.signal] ?? '#e879a8';
              const active =
                highlightedPhysical === null ||
                highlightedPhysical === undefined ||
                highlightedPhysical === signal.physical;

              return (
                <g key={`${bus.id}-${signal.physical}`} opacity={active ? 1 : 0.18}>
                  <line
                    x1={hub.x}
                    y1={hub.y}
                    x2={point.x}
                    y2={point.y}
                    stroke={color}
                    strokeWidth="0.5"
                    strokeLinecap="round"
                  />
                  <circle cx={point.x} cy={point.y} r="1.6" fill={color} opacity="0.9" />
                </g>
              );
            })}
            <circle
              cx={hub.x}
              cy={hub.y}
              r="3"
              fill="rgba(255,255,255,0.1)"
              stroke="#e879a8"
              strokeWidth="0.45"
            />
            <text
              x={hub.x}
              y={hub.y + 0.75}
              textAnchor="middle"
              fontSize="2.8"
              fill="#fff"
              fontWeight="700"
            >
              {bus.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
