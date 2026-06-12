import type { GpioPlatform } from './types';

import bananapi126Pin from '../config/platforms/bananapi-1-26pin.json';
import bananapiM240Pin from '../config/platforms/bananapi-m2-40pin.json';
import cubieA7s30Pin from '../config/platforms/cubie-a7s-30pin.json';
import cubieA7z40Pin from '../config/platforms/cubie-a7z-40pin.json';
import hummingboardBasePro26Pin from '../config/platforms/hummingboard-base-pro-26pin.json';
import hummingboardEdgeGate40Pin from '../config/platforms/hummingboard-edge-gate-40pin.json';
import luckfoxAura40Pin from '../config/platforms/luckfox-aura-40pin.json';
import luckfoxLyraZeroW40Pin from '../config/platforms/luckfox-lyra-zero-w-40pin.json';
import odroidC140Pin from '../config/platforms/odroid-c1-40pin.json';
import odroidC240Pin from '../config/platforms/odroid-c2-40pin.json';
import odroidXu430Pin from '../config/platforms/odroid-xu4-30pin.json';
import orangepi3b40Pin from '../config/platforms/orangepi-3b-40pin.json';
import orangepi3plus40Pin from '../config/platforms/orangepi-3plus-40pin.json';
import orangepi4a40Pin from '../config/platforms/orangepi-4a-40pin.json';
import orangepi4pro40Pin from '../config/platforms/orangepi-4pro-40pin.json';
import orangepi526Pin from '../config/platforms/orangepi-5-26pin.json';
import orangepi5plus40Pin from '../config/platforms/orangepi-5plus-40pin.json';
import orangepi80040Pin from '../config/platforms/orangepi-800-40pin.json';
import orangepi90040Pin from '../config/platforms/orangepi-900-40pin.json';
import orangepiA6440PinWin from '../config/platforms/orangepi-a64-40pin-win.json';
import orangepiAipro40Pin from '../config/platforms/orangepi-aipro-40pin.json';
import orangepiAistation40Pin from '../config/platforms/orangepi-aistation-40pin.json';
import orangepiCm440Pin from '../config/platforms/orangepi-cm4-40pin.json';
import orangepiH226Pin from '../config/platforms/orangepi-h2-26pin.json';
import orangepiH326PinZeroPlus2 from '../config/platforms/orangepi-h3-26pin-zero-plus-2.json';
import orangepiH340Pin from '../config/platforms/orangepi-h3-40pin.json';
import orangepiH526PinZeroPlus2 from '../config/platforms/orangepi-h5-26pin-zero-plus-2.json';
import orangepiH526PinZeroPlus from '../config/platforms/orangepi-h5-26pin-zero-plus.json';
import orangepiH540PinPc2 from '../config/platforms/orangepi-h5-40pin-pc2.json';
import orangepiH540PinPrime from '../config/platforms/orangepi-h5-40pin-prime.json';
import orangepiH626Pin3 from '../config/platforms/orangepi-h6-26pin-3.json';
import orangepiH626PinLite2 from '../config/platforms/orangepi-h6-26pin-lite2.json';
import orangepiH61626PinZero2 from '../config/platforms/orangepi-h616-26pin-zero2.json';
import orangepiKunpengPro40Pin from '../config/platforms/orangepi-kunpeng-pro-40pin.json';
import orangepiR1Plus26Pin from '../config/platforms/orangepi-r1-plus-26pin.json';
import orangepiRk339940Pin4 from '../config/platforms/orangepi-rk3399-40pin-4.json';
import orangepiRk339940Pin from '../config/platforms/orangepi-rk3399-40pin.json';
import orangepiRv40Pin from '../config/platforms/orangepi-rv-40pin.json';
import orangepiRv240Pin from '../config/platforms/orangepi-rv2-40pin.json';
import orangepiZero3Plus40Pin from '../config/platforms/orangepi-zero-3-plus-40pin.json';
import orangepiZero3w40Pin from '../config/platforms/orangepi-zero-3w-40pin.json';
import pcduino140Pin from '../config/platforms/pcduino-1-40pin.json';
import radxaRock440Pin from '../config/platforms/radxa-rock4-40pin.json';
import radxaZero340Pin from '../config/platforms/radxa-zero-3-40pin.json';
import radxaZero40Pin from '../config/platforms/radxa-zero-40pin.json';
import raspberryPi26PinRev1 from '../config/platforms/raspberry-pi-26pin-rev1.json';
import raspberryPi26PinRev2 from '../config/platforms/raspberry-pi-26pin-rev2.json';
import raspberryPi40Pin from '../config/platforms/raspberry-pi-40pin.json';

export const PLATFORM_CONFIGS: readonly GpioPlatform[] = [
  bananapi126Pin as GpioPlatform,
  bananapiM240Pin as GpioPlatform,
  cubieA7s30Pin as GpioPlatform,
  cubieA7z40Pin as GpioPlatform,
  hummingboardBasePro26Pin as GpioPlatform,
  hummingboardEdgeGate40Pin as GpioPlatform,
  luckfoxAura40Pin as GpioPlatform,
  luckfoxLyraZeroW40Pin as GpioPlatform,
  odroidC140Pin as GpioPlatform,
  odroidC240Pin as GpioPlatform,
  odroidXu430Pin as GpioPlatform,
  orangepi3b40Pin as GpioPlatform,
  orangepi3plus40Pin as GpioPlatform,
  orangepi4a40Pin as GpioPlatform,
  orangepi4pro40Pin as GpioPlatform,
  orangepi526Pin as GpioPlatform,
  orangepi5plus40Pin as GpioPlatform,
  orangepi80040Pin as GpioPlatform,
  orangepi90040Pin as GpioPlatform,
  orangepiA6440PinWin as GpioPlatform,
  orangepiAipro40Pin as GpioPlatform,
  orangepiAistation40Pin as GpioPlatform,
  orangepiCm440Pin as GpioPlatform,
  orangepiH226Pin as GpioPlatform,
  orangepiH326PinZeroPlus2 as GpioPlatform,
  orangepiH340Pin as GpioPlatform,
  orangepiH526PinZeroPlus2 as GpioPlatform,
  orangepiH526PinZeroPlus as GpioPlatform,
  orangepiH540PinPc2 as GpioPlatform,
  orangepiH540PinPrime as GpioPlatform,
  orangepiH626Pin3 as GpioPlatform,
  orangepiH626PinLite2 as GpioPlatform,
  orangepiH61626PinZero2 as GpioPlatform,
  orangepiKunpengPro40Pin as GpioPlatform,
  orangepiR1Plus26Pin as GpioPlatform,
  orangepiRk339940Pin4 as GpioPlatform,
  orangepiRk339940Pin as GpioPlatform,
  orangepiRv40Pin as GpioPlatform,
  orangepiRv240Pin as GpioPlatform,
  orangepiZero3Plus40Pin as GpioPlatform,
  orangepiZero3w40Pin as GpioPlatform,
  pcduino140Pin as GpioPlatform,
  radxaRock440Pin as GpioPlatform,
  radxaZero340Pin as GpioPlatform,
  radxaZero40Pin as GpioPlatform,
  raspberryPi26PinRev1 as GpioPlatform,
  raspberryPi26PinRev2 as GpioPlatform,
  raspberryPi40Pin as GpioPlatform,
].sort((a, b) => a.id.localeCompare(b.id));
