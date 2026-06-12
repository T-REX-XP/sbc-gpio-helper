import { Outlet, useLocation } from 'react-router-dom';
import { AppLogo } from '../components/AppLogo';
import { AppNav } from '../components/AppNav';
import { DeviceColorStyles } from '../components/DeviceColorStyles';
import { GitHubLink } from '../components/GitHubLink';
import { LocaleSwitcher } from '../components/LocaleSwitcher';
import { UmamiAnalytics } from '../components/UmamiAnalytics';
import { APP_VERSION } from '../config/version';
import { useI18n } from '../i18n';

export function AppShell() {
  const { t } = useI18n();
  const location = useLocation();
  const isRegistry = location.pathname.endsWith('/registry');

  return (
    <div className="app">
      <UmamiAnalytics pagePath={`${location.pathname}${location.search}`} />
      <DeviceColorStyles />
      <header className="app-header">
        <div className="app-header__top">
          <div className="app-header__brand">
            <AppLogo />
            <div className="app-header__titles">
              <h1>{t('app.title')}</h1>
              <p className="app-header__version">{APP_VERSION}</p>
            </div>
          </div>
          <div className="app-header__actions">
            <GitHubLink />
            <LocaleSwitcher />
            <AppNav />
          </div>
        </div>
        {isRegistry && <p className="app-header__tagline">{t('app.taglineRegistry')}</p>}
      </header>

      <Outlet />
    </div>
  );
}
