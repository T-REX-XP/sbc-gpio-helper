import { useState } from 'react';
import { AppNav, type AppPage } from './components/AppNav';
import { DeviceColorStyles } from './components/DeviceColorStyles';
import { GitHubLink } from './components/GitHubLink';
import { LocaleSwitcher } from './components/LocaleSwitcher';
import { UmamiAnalytics } from './components/UmamiAnalytics';
import { hardwareRegistry } from './hardware';
import { useI18n } from './i18n';
import { APP_VERSION } from './config/version';
import { HardwareRegistryPage } from './pages/HardwareRegistryPage';
import { MainPage } from './pages/MainPage';
import './App.css';

function App() {
  const { t } = useI18n();
  const [page, setPage] = useState<AppPage>('main');
  const [platformId, setPlatformId] = useState(hardwareRegistry.defaultPlatformId);
  const [comparePlatformId, setComparePlatformId] = useState<string | null>(null);

  const swapComparePlatforms = () => {
    if (!comparePlatformId) return;
    setPlatformId(comparePlatformId);
    setComparePlatformId(platformId);
  };

  return (
    <div className="app">
      <UmamiAnalytics pagePath={`/${page}`} />
      <DeviceColorStyles />
      <header className="app-header">
        <div className="app-header__top">
          <div className="app-header__brand">
            <h1>{t('app.title')}</h1>
            <p className="app-header__version">{APP_VERSION}</p>
          </div>
          <div className="app-header__actions">
            <GitHubLink />
            <LocaleSwitcher />
            <AppNav active={page} onChange={setPage} />
          </div>
        </div>
        {page === 'registry' && <p className="app-header__tagline">{t('app.taglineRegistry')}</p>}
      </header>

      {page === 'main' ? (
        <MainPage
          platformId={platformId}
          comparePlatformId={comparePlatformId}
          onPlatformChange={setPlatformId}
          onComparePlatformChange={setComparePlatformId}
          onSwapComparePlatforms={swapComparePlatforms}
        />
      ) : (
        <HardwareRegistryPage />
      )}
    </div>
  );
}

export default App;
