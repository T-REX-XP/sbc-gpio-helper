import type { en } from './locales/en';

export type Locale = 'en' | 'uk';

export const LOCALES: { id: Locale; labelKey: 'locale.en' | 'locale.uk' }[] = [
  { id: 'en', labelKey: 'locale.en' },
  { id: 'uk', labelKey: 'locale.uk' },
];

export const LOCALE_STORAGE_KEY = 'gpio-visualizer-locale';

type StringLeaves<T> = {
  [K in keyof T]: T[K] extends string ? string : StringLeaves<T[K]>;
};

export type Messages = StringLeaves<typeof en>;

export type MessageKey = string;

export type TranslateParams = Record<string, string | number>;
