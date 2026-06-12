import type { GpioPlatform } from '../hardware';
import {
  formatPlatformFormFactor,
  getPlatformAccentColor,
  hardwareRegistry,
} from '../hardware';
import { createFormFactorClassTranslator, useI18n } from '../i18n';
import { SelectorControl } from './SelectorControl';

interface PlatformSelectorProps {
  platforms: readonly GpioPlatform[];
  platformId: string;
  comparePlatformId: string | null;
  onPlatformChange: (platformId: string) => void;
  onComparePlatformChange: (platformId: string | null) => void;
  onSwapComparePlatforms: () => void;
}

export function PlatformSelector({
  platforms,
  platformId,
  comparePlatformId,
  onPlatformChange,
  onComparePlatformChange,
  onSwapComparePlatforms,
}: PlatformSelectorProps) {
  const { t } = useI18n();
  const translateClass = createFormFactorClassTranslator(t);
  const primary = platforms.find((p) => p.id === platformId);
  const compare = comparePlatformId
    ? platforms.find((p) => p.id === comparePlatformId)
    : undefined;
  const compareOptions = platforms.filter((p) => p.id !== platformId);
  const primarySbc = primary ? hardwareRegistry.getSbcForPlatform(primary.id) : undefined;
  const compareSbc = compare ? hardwareRegistry.getSbcForPlatform(compare.id) : undefined;

  return (
    <section className="selector-toolbar" aria-label={t('platformSelector.aria')}>
      <div className="selector-slot">
        <label className="selector-slot__label" htmlFor="platform-primary">
          {t('platformSelector.boardPlatform')}
        </label>
        <SelectorControl
          id="platform-primary"
          value={platformId}
          onChange={onPlatformChange}
          imageUrl={primarySbc?.imageUrl}
          imageAlt={primary?.shortName ?? primary?.name ?? ''}
          accentColor={primary ? getPlatformAccentColor(primary.id) : undefined}
        >
          {platforms.map((platform) => (
            <option key={platform.id} value={platform.id}>
              {platform.shortName ?? platform.name}
            </option>
          ))}
        </SelectorControl>
        {primary && formatPlatformFormFactor(primary, translateClass) && (
          <span className="selector-slot__hint" title={formatPlatformFormFactor(primary, translateClass)}>
            {formatPlatformFormFactor(primary, translateClass)}
          </span>
        )}
        <span className="selector-slot__links">
          {primary?.documentationUrl && (
            <a
              className="selector-slot__link"
              href={primary.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('platformSelector.gpioWiki')}
            </a>
          )}
          {primary?.productUrl && (
            <a
              className="selector-slot__link"
              href={primary.productUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('platformSelector.productDocs')}
            </a>
          )}
        </span>
      </div>

      <div className="selector-slot">
        <label className="selector-slot__label" htmlFor="platform-compare">
          {t('platformSelector.compareWith')}
          <span className="selector-slot__optional">{t('common.optional')}</span>
        </label>
        <SelectorControl
          id="platform-compare"
          value={comparePlatformId ?? ''}
          onChange={(value) => onComparePlatformChange(value || null)}
          imageUrl={compareSbc?.imageUrl}
          imageAlt={compare?.shortName ?? compare?.name ?? ''}
          accentColor={compare ? getPlatformAccentColor(compare.id) : undefined}
        >
          <option value="">{t('common.none')}</option>
          {compareOptions.map((platform) => (
            <option key={platform.id} value={platform.id}>
              {platform.shortName ?? platform.name}
            </option>
          ))}
        </SelectorControl>
        {compare && formatPlatformFormFactor(compare, translateClass) && (
          <span className="selector-slot__hint" title={formatPlatformFormFactor(compare, translateClass)}>
            {formatPlatformFormFactor(compare, translateClass)}
          </span>
        )}
        <span className="selector-slot__links">
          {compare?.documentationUrl && (
            <a
              className="selector-slot__link"
              href={compare.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('platformSelector.gpioWiki')}
            </a>
          )}
          {compare?.productUrl && (
            <a
              className="selector-slot__link"
              href={compare.productUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('platformSelector.productDocs')}
            </a>
          )}
        </span>
      </div>

      {comparePlatformId && primary && compare && (
        <button
          type="button"
          className="selector-toolbar__action"
          onClick={onSwapComparePlatforms}
          title={t('platformSelector.swapTitle')}
        >
          {t('platformSelector.swapBoards')}
        </button>
      )}
    </section>
  );
}
