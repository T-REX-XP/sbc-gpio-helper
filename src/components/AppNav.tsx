import { NavLink, useLocation } from 'react-router-dom';
import { ButtonIcon } from '../components/icons';
import { hardwareRegistry } from '../hardware';
import { useI18n } from '../i18n';
import { getLastPlatformId } from '../routing/lastPlatform';

function getRegistryItemCount(): number {
  return (
    hardwareRegistry.getSbcs().length +
    hardwareRegistry.getHats().length +
    hardwareRegistry.getGpioLibraries().length
  );
}

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
  const registryItemCount = getRegistryItemCount();

  const tabs = [
    { id: 'main', labelKey: 'nav.main' as const, to: mainPath, active: !isRegistry, icon: 'board' as const },
    { id: 'registry', labelKey: 'nav.registry' as const, to: registryPath, active: isRegistry, icon: 'catalog' as const },
  ];

  return (
    <nav className="app-nav" aria-label={t('nav.aria')}>
      <ul className="app-nav__list">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <NavLink
              to={tab.to}
              className={() =>
                ['app-nav__tab', 'btn-with-icon', tab.active ? 'app-nav__tab--active' : '']
                  .filter(Boolean)
                  .join(' ')
              }
              aria-current={tab.active ? 'page' : undefined}
            >
              <ButtonIcon name={tab.icon} />
              <span>{t(tab.labelKey)}</span>
              {tab.id === 'registry' && (
                <span className="app-nav__count" aria-label={t('registry.stats.items')}>
                  {registryItemCount}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
