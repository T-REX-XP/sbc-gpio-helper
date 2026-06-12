import luckfoxLyraZeroW40Pin from '../config/platforms/luckfox-lyra-zero-w-40pin.json';
import orangepi526Pin from '../config/platforms/orangepi-5-26pin.json';
import orangepiZero3w40Pin from '../config/platforms/orangepi-zero-3w-40pin.json';
import radxaZero40Pin from '../config/platforms/radxa-zero-40pin.json';
import radxaZero340Pin from '../config/platforms/radxa-zero-3-40pin.json';
import raspberryPi40Pin from '../config/platforms/raspberry-pi-40pin.json';
import type { GpioPlatform } from './types';

export const PLATFORM_CONFIGS: readonly GpioPlatform[] = [
  raspberryPi40Pin as GpioPlatform,
  radxaZero40Pin as GpioPlatform,
  radxaZero340Pin as GpioPlatform,
  orangepiZero3w40Pin as GpioPlatform,
  orangepi526Pin as GpioPlatform,
  luckfoxLyraZeroW40Pin as GpioPlatform,
];
