import type { HardwareDevice } from '../hardware';
import { hardwareRegistry } from '../hardware';
import { useI18n } from '../i18n';
import { HardwareImage } from './HardwareImage';

interface HardwarePinTableProps {
  device: HardwareDevice;
}

export function HardwarePinTable({ device }: HardwarePinTableProps) {
  const { t } = useI18n();
  const gpioColumnLabel =
    hardwareRegistry.getPlatform(device.platformId)?.gpioNumberLabel ?? t('common.gpio');
  const emDash = t('common.emDash');

  const rows = [...device.pinAssignments]
    .map((assignment) => {
      const pin = hardwareRegistry.getPinByPhysical(device.platformId, assignment.physical);
      return {
        ...assignment,
        gpioRef: assignment.bcm ?? pin?.gpioNumber ?? pin?.bcm,
        name: pin?.bankName ?? pin?.name ?? emDash,
      };
    })
    .sort((a, b) => a.physical - b.physical);

  return (
    <div className="hardware-table">
      <div className="hardware-table__header">
        <HardwareImage
          imageUrl={device.imageUrl}
          alt={device.name}
          size="sm"
          className="hardware-table__image"
        />
        <h3
          className="hardware-table__title"
          style={{ color: hardwareRegistry.getDeviceColor(device.id) }}
        >
          {device.name}
        </h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>{t('common.phys')}</th>
            <th>{gpioColumnLabel}</th>
            <th>{t('common.name')}</th>
            <th>{t('common.group')}</th>
            <th>{t('common.signal')}</th>
            <th>{t('common.description')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.physical}>
              <td>{row.physical}</td>
              <td>{row.gpioRef ?? emDash}</td>
              <td>{row.name}</td>
              <td>{row.group}</td>
              <td>
                <code>{row.signal}</code>
              </td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
