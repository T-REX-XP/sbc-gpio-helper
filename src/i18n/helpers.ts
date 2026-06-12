import type { PiFormFactorClass } from '../hardware/types';
import type { PinLabelStrings } from '../hardware/pinLabels';
import type { I18nContextValue } from './I18nContextValue';

export function createPinLabelStrings(t: I18nContextValue['t']): PinLabelStrings {
  return {
    power3v3: t('pinLabels.power3v3'),
    power5v: t('pinLabels.power5v'),
    ground: t('pinLabels.ground'),
    nc: t('pinLabels.nc'),
    ncSecondary: t('pinLabels.ncSecondary'),
    gpioPrefix: (num) => t('pinLabels.gpioPrefix', { num }),
    spiRole: (role, num) => t('pinLabels.spiRole', { role, num }),
    spiRoleOnly: (role) => t('pinLabels.spiRoleOnly', { role }),
    gpioOnly: (num) => t('pinLabels.gpioOnly', { num }),
    altWithGpio: (alt, num) => t('pinLabels.altWithGpio', { alt, num }),
  };
}

export function createFormFactorClassTranslator(
  t: I18nContextValue['t'],
): (cls: PiFormFactorClass) => string {
  return (cls) => t(`formFactor.classes.${cls}`);
}
