import type { HardwareDevice } from '../hardware';
import { hardwareRegistry } from '../hardware';
import { useI18n } from '../i18n';
import { SelectorControl } from './SelectorControl';

interface HardwareSelectorProps {
  devices: readonly HardwareDevice[];
  primaryId: string;
  compareId: string | null;
  onPrimaryChange: (id: string) => void;
  onCompareChange: (id: string | null) => void;
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
        <SelectorControl
          id="hat-primary"
          value={primaryId}
          onChange={(nextId) => {
            onPrimaryChange(nextId);
            if (compareId === nextId) {
              onCompareChange(null);
            }
          }}
          imageUrl={primaryDevice?.imageUrl}
          imageAlt={primaryDevice?.name ?? ''}
          accentColor={primaryDevice ? hardwareRegistry.getDeviceColor(primaryDevice.id) : undefined}
        >
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name} ({device.vendor})
            </option>
          ))}
        </SelectorControl>
        {primaryDevice && (
          <span className="selector-slot__links">
            <a
              className="selector-slot__link"
              href={primaryDevice.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('common.docs')}
            </a>
          </span>
        )}
      </div>

      <div className="selector-slot">
        <label className="selector-slot__label" htmlFor="hat-compare">
          {t('hardwareSelector.compareWith')}
          <span className="selector-slot__optional">{t('common.optional')}</span>
        </label>
        <SelectorControl
          id="hat-compare"
          value={compareId ?? ''}
          onChange={(value) => onCompareChange(value || null)}
          imageUrl={compareDevice?.imageUrl}
          imageAlt={compareDevice?.name ?? ''}
          accentColor={compareDevice ? hardwareRegistry.getDeviceColor(compareDevice.id) : undefined}
        >
          <option value="">{t('common.none')}</option>
          {compareOptions.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name} ({device.vendor})
            </option>
          ))}
        </SelectorControl>
        {compareDevice && (
          <span className="selector-slot__links">
            <a
              className="selector-slot__link"
              href={compareDevice.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('common.docs')}
            </a>
          </span>
        )}
      </div>
    </section>
  );
}
