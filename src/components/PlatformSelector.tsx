import type { CSSProperties } from 'react';
import { HardwareImage } from './HardwareImage';
import type { GpioPlatform } from '../hardware';
import {
  formatPlatformFormFactor,
  getPlatformAccentColor,
  hardwareRegistry,
} from '../hardware';
import { createFormFactorClassTranslator, useI18n } from '../i18n';

interface PlatformSelectorProps {
  platforms: readonly GpioPlatform[];
  platformId: string;
  comparePlatformId: string | null;
  onPlatformChange: (platformId: string) => void;
  onComparePlatformChange: (platformId: string | null) => void;
  onSwapComparePlatforms: () => void;
}

function BoardChip({ platform }: { platform: GpioPlatform }) {
  const { t } = useI18n();
  const sbc = hardwareRegistry.getSbcForPlatform(platform.id);
  const translateClass = createFormFactorClassTranslator(t);
  const formFactorLabel = formatPlatformFormFactor(platform, translateClass);

  if (!sbc?.imageUrl && !formFactorLabel) return null;

  return (
    <div
      className="selector-chip"
      style={{ '--chip-accent': getPlatformAccentColor(platform.id) } as CSSProperties}
      title={formFactorLabel || undefined}
    >
      {sbc?.imageUrl && (
        <HardwareImage
          imageUrl={sbc.imageUrl}
          alt={platform.shortName ?? platform.name}
          size="xs"
          className="selector-chip__image"
        />
      )}
      <span className="selector-chip__title">{platform.shortName ?? platform.name}</span>
    </div>
  );
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
  const primary = platforms.find((p) => p.id === platformId);
  const compare = comparePlatformId
    ? platforms.find((p) => p.id === comparePlatformId)
    : undefined;
  const compareOptions = platforms.filter((p) => p.id !== platformId);

  return (
    <section className="selector-toolbar" aria-label={t('platformSelector.aria')}>
      <div className="selector-slot">
        <label className="selector-slot__label" htmlFor="platform-primary">
          {t('platformSelector.boardPlatform')}
        </label>
        <select
          id="platform-primary"
          className="selector-slot__select"
          value={platformId}
          onChange={(event) => onPlatformChange(event.target.value)}
        >
          {platforms.map((platform) => (
            <option key={platform.id} value={platform.id}>
              {platform.shortName ?? platform.name}
            </option>
          ))}
        </select>
        {primary && <BoardChip platform={primary} />}
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
        <select
          id="platform-compare"
          className="selector-slot__select"
          value={comparePlatformId ?? ''}
          onChange={(event) => onComparePlatformChange(event.target.value || null)}
        >
          <option value="">{t('common.none')}</option>
          {compareOptions.map((platform) => (
            <option key={platform.id} value={platform.id}>
              {platform.shortName ?? platform.name}
            </option>
          ))}
        </select>
        {compare && <BoardChip platform={compare} />}
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
