import type {
  BoardFormFactor,
  BoardGpioHeaderPlacement,
  GpioPlatform,
  PiFormFactorClass,
} from './types';

export const PI_FORM_FACTOR_LABELS: Record<PiFormFactorClass, string> = {
  'rpi-a': 'Rpi A',
  'rpi-b': 'Rpi B',
  'rpi-zero': 'Rpi Zero',
};

const DEFAULT_PITCH_MM = 2.54;
const DEFAULT_HEADER_ROWS = 20;
const DEFAULT_HEADER_COLUMNS = 2;

export function getFormFactor(platform: GpioPlatform): BoardFormFactor | undefined {
  return platform.formFactor;
}

export function hasFormFactor(platform: GpioPlatform): boolean {
  return platform.formFactor != null;
}

export function formatPlatformBoardSize(platform: GpioPlatform | undefined): string {
  if (!platform?.formFactor) return '';
  const { widthMm, heightMm } = platform.formFactor;
  return `${widthMm} × ${heightMm} mm`;
}

export function getFormFactorClassLabel(
  formFactor: BoardFormFactor | undefined,
  translateClass?: (cls: PiFormFactorClass) => string,
): string {
  const cls = formFactor?.formFactorClass;
  if (cls) return translateClass?.(cls) ?? PI_FORM_FACTOR_LABELS[cls];

  const variants = formFactor?.family?.variants;
  if (variants?.length) {
    return variants.map((variant) => variant.label).join(' / ');
  }

  return '';
}

export function formatPlatformFormFactor(
  platform: GpioPlatform | undefined,
  translateClass?: (cls: PiFormFactorClass) => string,
): string {
  if (!platform?.formFactor) return '';

  const size = formatPlatformBoardSize(platform);
  const classLabel = getFormFactorClassLabel(platform.formFactor, translateClass);

  if (classLabel) {
    return size ? `${classLabel} · ${size}` : classLabel;
  }

  const familyVariants = platform.formFactor.family?.variants;
  if (familyVariants?.length) {
    const types = familyVariants.map((variant) => variant.label).join(' / ');
    return size ? `${types} · ${size}` : types;
  }

  return size;
}

export function getHeaderPitch(header: BoardGpioHeaderPlacement): number {
  return header.pitchMm ?? DEFAULT_PITCH_MM;
}

export function getHeaderRows(header: BoardGpioHeaderPlacement): number {
  return header.rows ?? DEFAULT_HEADER_ROWS;
}

export function getHeaderColumns(header: BoardGpioHeaderPlacement): number {
  return header.columns ?? DEFAULT_HEADER_COLUMNS;
}

/** Header span along the long axis (20 rows) in mm. */
export function getHeaderLengthMm(header: BoardGpioHeaderPlacement): number {
  const pitch = getHeaderPitch(header);
  return (getHeaderRows(header) - 1) * pitch + pitch;
}

/** Header span across the short axis (2 columns) in mm. */
export function getHeaderWidthMm(header: BoardGpioHeaderPlacement): number {
  const pitch = getHeaderPitch(header);
  return (getHeaderColumns(header) - 1) * pitch + pitch;
}

export interface FormFactorMetrics {
  widthMm: number;
  heightMm: number;
  areaMm2: number;
  mountingHoleCount: number;
  headerLengthMm: number;
  headerWidthMm: number;
  formFactorClassLabel: string;
}

export function getFormFactorMetrics(
  formFactor: BoardFormFactor,
  translateClass?: (cls: PiFormFactorClass) => string,
): FormFactorMetrics {
  return {
    widthMm: formFactor.widthMm,
    heightMm: formFactor.heightMm,
    areaMm2: formFactor.widthMm * formFactor.heightMm,
    mountingHoleCount: formFactor.mountingHoles?.length ?? 0,
    headerLengthMm: getHeaderLengthMm(formFactor.gpioHeader),
    headerWidthMm: getHeaderWidthMm(formFactor.gpioHeader),
    formFactorClassLabel: getFormFactorClassLabel(formFactor, translateClass),
  };
}
