import { useI18n } from '../i18n';

export type AppPage = 'main' | 'registry';

interface AppNavProps {
  active: AppPage;
  onChange: (page: AppPage) => void;
}

export function AppNav({ active, onChange }: AppNavProps) {
  const { t } = useI18n();

  const tabs: { id: AppPage; labelKey: 'nav.main' | 'nav.registry' }[] = [
    { id: 'main', labelKey: 'nav.main' },
    { id: 'registry', labelKey: 'nav.registry' },
  ];

  return (
    <nav className="app-nav" aria-label={t('nav.aria')}>
      <ul className="app-nav__list">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <button
              type="button"
              className={[
                'app-nav__tab',
                active === tab.id ? 'app-nav__tab--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={active === tab.id ? 'page' : undefined}
              onClick={() => onChange(tab.id)}
            >
              {t(tab.labelKey)}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
