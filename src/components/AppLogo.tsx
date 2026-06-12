import { resolvePublicUrl } from '../utils/publicUrl';
import { useI18n } from '../i18n';

export function AppLogo() {
  const { t } = useI18n();

  return (
    <img
      className="app-logo"
      src={resolvePublicUrl('/logo.svg')}
      alt={t('app.title')}
      width={40}
      height={40}
      decoding="async"
    />
  );
}
