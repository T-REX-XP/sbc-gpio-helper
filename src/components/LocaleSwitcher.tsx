import { LOCALES, useI18n } from '../i18n';

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="locale-switcher">
      <label className="locale-switcher__label" htmlFor="app-locale">
        {t('locale.label')}
      </label>
      <select
        id="app-locale"
        className="locale-switcher__select"
        value={locale}
        onChange={(event) => setLocale(event.target.value as 'en' | 'uk')}
        aria-label={t('locale.label')}
      >
        {LOCALES.map((item) => (
          <option key={item.id} value={item.id}>
            {t(item.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
