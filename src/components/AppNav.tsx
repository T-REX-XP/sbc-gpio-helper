import { NavLink, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { getLastPlatformId } from '../routing/lastPlatform';

function resolveMainPath(location: ReturnType<typeof useLocation>): string {
  const boardMatch = location.pathname.match(/\/board\/([^/]+)$/);
  if (boardMatch) {
    return `${location.pathname}${location.search}`;
  }

  return `/board/${getLastPlatformId()}`;
}

export function AppNav() {
  const { t } = useI18n();
  const location = useLocation();
  const mainPath = resolveMainPath(location);
  const isRegistry = location.pathname.endsWith('/registry');
  const registryPath = isRegistry
    ? `${location.pathname}${location.search}`
    : '/registry';

  const tabs = [
    { id: 'main', labelKey: 'nav.main' as const, to: mainPath, active: !isRegistry },
    { id: 'registry', labelKey: 'nav.registry' as const, to: registryPath, active: isRegistry },
  ];

  return (
    <nav className="app-nav" aria-label={t('nav.aria')}>
      <ul className="app-nav__list">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <NavLink
              to={tab.to}
              className={() =>
                ['app-nav__tab', tab.active ? 'app-nav__tab--active' : '']
                  .filter(Boolean)
                  .join(' ')
              }
              aria-current={tab.active ? 'page' : undefined}
            >
              {t(tab.labelKey)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
