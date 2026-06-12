import { HardwareCatalog } from '../components/HardwareCatalog';
import { hardwareRegistry } from '../hardware';

export function HardwareRegistryPage() {
  return (
    <div className="app-page app-page--registry">
      <HardwareCatalog
        sbcs={hardwareRegistry.getSbcs()}
        hats={hardwareRegistry.getHats()}
        gpioLibraries={hardwareRegistry.getGpioLibraries()}
      />
    </div>
  );
}
