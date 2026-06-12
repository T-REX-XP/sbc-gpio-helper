import type { CSSProperties } from 'react';
import type { HardwareDevice } from '../hardware';
import { hardwareRegistry } from '../hardware';
import { useI18n } from '../i18n';
import { HardwareImage } from './HardwareImage';

interface HardwareSelectorProps {
  devices: readonly HardwareDevice[];
  primaryId: string;
  compareId: string | null;
  onPrimaryChange: (id: string) => void;
  onCompareChange: (id: string | null) => void;
}

function DeviceChip({ device }: { device: HardwareDevice }) {
  const { t } = useI18n();

  return (
    <div
      className="selector-chip"
      style={
        { '--chip-accent': hardwareRegistry.getDeviceColor(device.id) } as CSSProperties
      }
      title={device.description}
    >
      <HardwareImage
        imageUrl={device.imageUrl}
        alt={device.name}
        size="xs"
        className="selector-chip__image"
      />
      <span className="selector-chip__title">{device.shortName ?? device.name}</span>
      <a
        className="selector-chip__link"
        href={device.documentationUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
      >
        {t('common.docs')}
      </a>
    </div>
  );
}

export function HardwareSelector({
  devices,
  primaryId,
  compareId,
  onPrimaryChange,
  onCompareChange,
}: HardwareSelectorProps) {
  const { t } = useI18n();
  const primaryDevice = devices.find((d) => d.id === primaryId);
  const compareDevice = compareId ? devices.find((d) => d.id === compareId) : undefined;
  const compareOptions = devices.filter((d) => d.id !== primaryId);

  return (
    <section className="selector-toolbar" aria-label={t('hardwareSelector.displayHat')}>
      <div className="selector-slot">
        <label className="selector-slot__label" htmlFor="hat-primary">
          {t('hardwareSelector.displayHat')}
        </label>
        <select
          id="hat-primary"
          className="selector-slot__select"
          value={primaryId}
          onChange={(e) => {
            const nextId = e.target.value;
            onPrimaryChange(nextId);
            if (compareId === nextId) {
              onCompareChange(null);
            }
          }}
        >
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name} ({device.vendor})
            </option>
          ))}
        </select>
        {primaryDevice && <DeviceChip device={primaryDevice} />}
      </div>

      <div className="selector-slot">
        <label className="selector-slot__label" htmlFor="hat-compare">
          {t('hardwareSelector.compareWith')}
          <span className="selector-slot__optional">{t('common.optional')}</span>
        </label>
        <select
          id="hat-compare"
          className="selector-slot__select"
          value={compareId ?? ''}
          onChange={(e) => onCompareChange(e.target.value || null)}
        >
          <option value="">{t('common.none')}</option>
          {compareOptions.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name} ({device.vendor})
            </option>
          ))}
        </select>
        {compareDevice && <DeviceChip device={compareDevice} />}
      </div>
    </section>
  );
}
