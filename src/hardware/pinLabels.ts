import type { GpioPin, GpioPlatform } from './types';
import { getSpiRole } from './spi';

export interface PinDisplayLabels {
  primary: string;
  secondary?: string;
}

export interface PinLabelStrings {
  power3v3: string;
  power5v: string;
  ground: string;
  nc: string;
  ncSecondary: string;
  gpioPrefix: (num: number) => string;
  spiRole: (role: string, num: number) => string;
  spiRoleOnly: (role: string) => string;
  gpioOnly: (num: number) => string;
  altWithGpio: (alt: string, num: number) => string;
}

const DEFAULT_PIN_LABELS: PinLabelStrings = {
  power3v3: '3.3V',
  power5v: '5V',
  ground: 'Ground',
  nc: 'NC',
  ncSecondary: '(Not connected)',
  gpioPrefix: (num) => `GPIO ${num}`,
  spiRole: (role, num) => `(${role}, GPIO ${num})`,
  spiRoleOnly: (role) => `(${role})`,
  gpioOnly: (num) => `(GPIO ${num})`,
  altWithGpio: (alt, num) => `(${alt}, GPIO ${num})`,
};

function formatPiAlt(alt: string): string {
  const map: Record<string, string> = {
    SDA1: 'I2C1 SDA',
    SCL1: 'I2C1 SCL',
    TXD: 'UART TX',
    RXD: 'UART RX',
    MOSI: 'SPI0 MOSI',
    MISO: 'SPI0 MISO',
    SCLK: 'SPI0 SCLK',
    CE0: 'SPI0 CE0',
    CE1: 'SPI0 CE1',
    ID_SD: 'EEPROM SDA',
    ID_SC: 'EEPROM SCL',
    PCM_CLK: 'PCM CLK',
    PCM_FS: 'PCM FS',
    PCM_DIN: 'PCM DIN',
    PWM0: 'PWM0',
    PWM1: 'PWM1',
  };
  return map[alt] ?? alt;
}

export function getPinDisplayLabels(
  pin: GpioPin,
  platform: GpioPlatform,
  showSpiBus: boolean,
  labels: PinLabelStrings = DEFAULT_PIN_LABELS,
): PinDisplayLabels {
  if (pin.type === 'power3v3') return { primary: labels.power3v3 };
  if (pin.type === 'power5v') return { primary: labels.power5v };
  if (pin.type === 'ground') return { primary: labels.ground };
  if (pin.name === 'NC') return { primary: labels.nc, secondary: labels.ncSecondary };

  if (showSpiBus) {
    const spiRole = getSpiRole(platform.id, pin.physical);
    if (spiRole) {
      const gpioRef = pin.gpioNumber ?? pin.bcm;
      return {
        primary: pin.bankName ?? pin.name,
        secondary: gpioRef !== undefined
          ? labels.spiRole(spiRole.label, gpioRef)
          : labels.spiRoleOnly(spiRole.label),
      };
    }
  }

  if (pin.bankName || pin.gpioNumber !== undefined) {
    const gpioRef = pin.gpioNumber;
    const primary = pin.bankName ?? pin.name;
    const alt = pin.altFunctions?.[0];
    return {
      primary,
      secondary: alt
        ? gpioRef !== undefined
          ? labels.altWithGpio(alt, gpioRef)
          : `(${alt})`
        : gpioRef !== undefined
          ? labels.gpioOnly(gpioRef)
          : undefined,
    };
  }

  if (pin.bcm !== undefined) {
    const alt = pin.altFunctions?.[0];
    return {
      primary: labels.gpioPrefix(pin.bcm),
      secondary: alt ? `(${formatPiAlt(alt)})` : undefined,
    };
  }

  return { primary: pin.name };
}

export function getPinGpioRef(pin: GpioPin): string | undefined {
  if (pin.bcm !== undefined) return `BCM ${pin.bcm}`;
  if (pin.gpioNumber !== undefined) return `GPIO ${pin.gpioNumber}`;
  return undefined;
}
