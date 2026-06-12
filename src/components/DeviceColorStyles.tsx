import { hardwareRegistry } from '../hardware';

/** Injects fixed CSS variables for each registered device color. */
export function DeviceColorStyles() {
  const rules = hardwareRegistry
    .getHats()
    .map(
      (device) =>
        `--device-${device.id}: ${hardwareRegistry.getDeviceColor(device.id)};`,
    )
    .join('\n  ');

  return <style>{`:root {\n  ${rules}\n}`}</style>;
}
