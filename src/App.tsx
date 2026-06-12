import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { HardwareRegistryPage } from './pages/HardwareRegistryPage';
import { MainPage } from './pages/MainPage';
import { getLastPlatformId } from './routing/lastPlatform';
import { hardwareRegistry } from './hardware';
import './App.css';

function DefaultBoardRedirect() {
  return <Navigate to={`/board/${getLastPlatformId()}`} replace />;
}

export default function App() {
  const fallbackPlatform = hardwareRegistry.defaultPlatformId;

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DefaultBoardRedirect />} />
        <Route path="board/:platformId" element={<MainPage />} />
        <Route path="registry" element={<HardwareRegistryPage />} />
        <Route path="*" element={<Navigate to={`/board/${fallbackPlatform}`} replace />} />
      </Route>
    </Routes>
  );
}
