import { Fragment, useEffect, useMemo, useState } from 'react';
import type { GpioLibraryEntry, HardwareDevice } from '../hardware';
import { getFormFactorClassLabel, hardwareRegistry, PLATFORM_CONFIGS } from '../hardware';
import { MAX_SBC_COMPARE } from '../hardware/sbcCompare';
import {
  buildRegistryTableRows,
  computeCategoryCounts,
  filterRegistryRows,
  hasActiveColumnFilters,
  type RegistryCategoryFilter,
  type RegistryColumnFilters,
  type RegistryTableRow,
} from '../hardware/registryTable';
import { createFormFactorClassTranslator, useI18n } from '../i18n';
import { useRegistryRoute } from '../routing/useRegistryRoute';
import { HardwareImage } from './HardwareImage';
import { SbcCompareModal } from './SbcCompareModal';
import { ButtonIcon, ButtonLabel, type ButtonIconName } from './icons';

interface HardwareCatalogProps {
  sbcs: Parameters<typeof buildRegistryTableRows>[0];
  hats: Parameters<typeof buildRegistryTableRows>[1];
  gpioLibraries: readonly GpioLibraryEntry[];
}

function formatWiringPiCompatibility(
  value: GpioLibraryEntry['wiringPiCompatibility'],
  t: (key: string) => string,
): string {
  return t(`registry.wiringPiCompat.${value}`);
}

function formatLibrarySupportedBoards(platformIds: readonly string[]): string {
  const names = new Set<string>();
  for (const platformId of platformIds) {
    const sbcs = hardwareRegistry.getSbcsForPlatform(platformId);
    if (sbcs.length > 0) {
      for (const sbc of sbcs) names.add(sbc.shortName ?? sbc.name);
    } else {
      names.add(platformId);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b)).join(' · ');
}

function LibraryRowDetails({ library }: { library: GpioLibraryEntry }) {
  const { t } = useI18n();
  const supportedBoards = formatLibrarySupportedBoards(library.supportedPlatformIds);

  return (
    <div className="registry-table__details">
      <p className="registry-table__details-desc">{library.description}</p>

      <h4 className="registry-table__details-heading">{t('registry.libraryDetails')}</h4>
      <dl className="registry-table__details-meta">
        <div>
          <dt>{t('registry.libraryMaintainer')}</dt>
          <dd>{library.maintainer}</dd>
        </div>
        <div>
          <dt>{t('registry.libraryPrimaryTargets')}</dt>
          <dd>{library.primaryTargets}</dd>
        </div>
        <div>
          <dt>{t('registry.libraryWiringPiCompat')}</dt>
          <dd>{formatWiringPiCompatibility(library.wiringPiCompatibility, t)}</dd>
        </div>
        <div>
          <dt>{t('registry.libraryLanguages')}</dt>
          <dd>{library.languages.join(' · ')}</dd>
        </div>
        <div className="registry-table__details-meta--wide">
          <dt>{t('registry.libraryBestFor')}</dt>
          <dd>{library.bestFor}</dd>
        </div>
        <div className="registry-table__details-meta--wide">
          <dt>{t('registry.librarySupportedBoards')}</dt>
          <dd>{supportedBoards}</dd>
        </div>
      </dl>

      {library.notes && <p className="registry-table__details-note">{library.notes}</p>}

      <div className="registry-table__details-links">
        <a href={library.repositoryUrl} target="_blank" rel="noopener noreferrer">
          {t('registry.libraryRepository')}
        </a>
        {library.documentationUrl && library.documentationUrl !== library.repositoryUrl && (
          <a href={library.documentationUrl} target="_blank" rel="noopener noreferrer">
            {t('common.docs')}
          </a>
        )}
        {library.additionalUrls?.map((link) => (
          <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function SbcGpioLibraries({ platformId }: { platformId: string }) {
  const { t } = useI18n();
  const libraries = hardwareRegistry.getGpioLibrariesForPlatform(platformId);
  if (libraries.length === 0) return null;

  return (
    <>
      <h4 className="registry-table__details-heading">{t('registry.gpioLibraries')}</h4>
      <ul className="registry-table__library-list">
        {libraries.map((library) => (
          <li key={library.id} className="registry-table__library-item">
            <span className="registry-table__library-name">{library.shortName ?? library.name}</span>
            <span className="registry-table__library-compat">
              {formatWiringPiCompatibility(library.wiringPiCompatibility, t)}
            </span>
            <a href={library.repositoryUrl} target="_blank" rel="noopener noreferrer">
              {t('registry.libraryRepository')}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

function SbcLibraryMetadata({ sbc }: { sbc: NonNullable<RegistryTableRow['sbc']> }) {
  const { t } = useI18n();
  if (!sbc.wiringX && !sbc.wiringOp) return null;

  const wiringXIds = sbc.wiringX
    ? [sbc.wiringX.setupId, ...(sbc.wiringX.alternateSetupIds ?? [])]
    : [];
  const emDash = t('common.emDash');

  return (
    <>
      <h4 className="registry-table__details-heading">{t('registry.libraryDetection')}</h4>
      <dl className="registry-table__details-meta">
        {sbc.wiringX && (
          <div className="registry-table__details-meta--wide">
            <dt>{t('registry.wiringXSetup')}</dt>
            <dd>
              <code>{wiringXIds.join(' · ')}</code>
            </dd>
          </div>
        )}
        {sbc.wiringOp && (
          <>
            <div>
              <dt>{t('registry.wiringOpRelease')}</dt>
              <dd>
                <code>{sbc.wiringOp.releaseId}</code>
              </dd>
            </div>
            <div>
              <dt>{t('registry.wiringOpModel')}</dt>
              <dd>
                <code>{sbc.wiringOp.model}</code>
              </dd>
            </div>
          </>
        )}
        {sbc.wiringX?.documentationPath && (
          <div className="registry-table__details-meta--wide">
            <dt>{t('registry.wiringXDocs')}</dt>
            <dd>{sbc.wiringX.documentationPath ?? emDash}</dd>
          </div>
        )}
      </dl>
    </>
  );
}

function RegistryRowDetails({ row }: { row: RegistryTableRow }) {
  const { t } = useI18n();
  const translateClass = createFormFactorClassTranslator(t);
  const platform = hardwareRegistry.getPlatform(row.platformId);
  const gpioLabel = platform?.gpioNumberLabel ?? t('common.gpio');

  if (row.registryCategory === 'sbc' && row.sbc) {
    const hw = row.sbc.hardware;
    const spiBusCount = platform?.spiBuses?.length ?? 0;
    const overlayCount = platform?.deviceTree?.overlays.length ?? 0;
    const formFactorClassLabel = platform?.formFactor
      ? getFormFactorClassLabel(platform.formFactor, translateClass)
      : '';

    return (
      <div className="registry-table__details">
        {row.sbc.imageUrl && (
          <HardwareImage
            imageUrl={row.sbc.imageUrl}
            alt={row.name}
            size="lg"
            className="registry-table__details-image"
          />
        )}
        <p className="registry-table__details-desc">{row.description}</p>

        {hw && (
          <>
            <h4 className="registry-table__details-heading">{t('registry.hardware')}</h4>
            <dl className="registry-table__details-meta">
              <div>
                <dt>{t('registry.columns.soc')}</dt>
                <dd>{hw.soc}</dd>
              </div>
              {hw.socFamily && (
                <div>
                  <dt>{t('registry.socFamily')}</dt>
                  <dd>{hw.socFamily}</dd>
                </div>
              )}
              {hw.cpu && (
                <div>
                  <dt>{t('registry.cpu')}</dt>
                  <dd>{hw.cpu}</dd>
                </div>
              )}
              {hw.gpu && (
                <div>
                  <dt>{t('registry.gpu')}</dt>
                  <dd>{hw.gpu}</dd>
                </div>
              )}
              {hw.ram && (
                <div>
                  <dt>{t('registry.ram')}</dt>
                  <dd>{hw.ram}</dd>
                </div>
              )}
              {hw.storage && (
                <div>
                  <dt>{t('registry.storage')}</dt>
                  <dd>{hw.storage}</dd>
                </div>
              )}
              {hw.formFactor && (
                <div>
                  <dt>{t('registry.columns.formFactor')}</dt>
                  <dd>{hw.formFactor}</dd>
                </div>
              )}
              {hw.connectivity && hw.connectivity.length > 0 && (
                <div className="registry-table__details-meta--wide">
                  <dt>{t('registry.connectivity')}</dt>
                  <dd>{hw.connectivity.join(' · ')}</dd>
                </div>
              )}
            </dl>
          </>
        )}

        {platform?.formFactor && (
          <>
            <h4 className="registry-table__details-heading">{t('registry.columns.formFactor')}</h4>
            <dl className="registry-table__details-meta">
              <div>
                <dt>{t('registry.pcbSize')}</dt>
                <dd>
                  {platform.formFactor.widthMm} × {platform.formFactor.heightMm} mm
                </dd>
              </div>
              <div>
                <dt>{t('registry.profile')}</dt>
                <dd>{platform.formFactor.label}</dd>
              </div>
              {formFactorClassLabel && (
                <div>
                  <dt>{t('registry.formFactorType')}</dt>
                  <dd>{formFactorClassLabel}</dd>
                </div>
              )}
              {platform.formFactor.mountingHoles && (
                <div>
                  <dt>{t('registry.mountingHoles')}</dt>
                  <dd>{platform.formFactor.mountingHoles.length}</dd>
                </div>
              )}
            </dl>
          </>
        )}

        <h4 className="registry-table__details-heading">{t('registry.gpioHeader')}</h4>
        <dl className="registry-table__details-meta">
          {row.sbc.specifications?.gpioHeader && (
            <div>
              <dt>{t('registry.header')}</dt>
              <dd>{row.sbc.specifications.gpioHeader}</dd>
            </div>
          )}
          {platform?.gpioNumberLabel && (
            <div>
              <dt>{t('registry.gpioNumbering')}</dt>
              <dd>{platform.gpioNumberLabel}</dd>
            </div>
          )}
          {spiBusCount > 0 && (
            <div>
              <dt>{t('registry.spiBuses')}</dt>
              <dd>{spiBusCount}</dd>
            </div>
          )}
          {overlayCount > 0 && (
            <div>
              <dt>{t('registry.deviceTreeOverlays')}</dt>
              <dd>{overlayCount}</dd>
            </div>
          )}
          {platform?.orientationHint && (
            <div className="registry-table__details-meta--wide">
              <dt>{t('registry.orientation')}</dt>
              <dd>{platform.orientationHint}</dd>
            </div>
          )}
        </dl>
        {platform?.notes && <p className="registry-table__details-note">{platform.notes}</p>}
        <SbcLibraryMetadata sbc={row.sbc} />
        <SbcGpioLibraries platformId={row.platformId} />
      </div>
    );
  }

  if (row.library) {
    return <LibraryRowDetails library={row.library} />;
  }

  if (row.hat) {
    return <HatPinDetails device={row.hat} gpioLabel={gpioLabel} description={row.description} />;
  }

  return null;
}

function HatPinDetails({
  device,
  gpioLabel,
  description,
}: {
  device: HardwareDevice;
  gpioLabel: string;
  description: string;
}) {
  const { t } = useI18n();
  const emDash = t('common.emDash');

  return (
    <div className="registry-table__details">
      <p className="registry-table__details-desc">{description}</p>
      <table className="registry-table__pin-table">
        <thead>
          <tr>
            <th>{t('common.phys')}</th>
            <th>{gpioLabel}</th>
            <th>{t('common.group')}</th>
            <th>{t('common.signal')}</th>
            <th>{t('common.description')}</th>
          </tr>
        </thead>
        <tbody>
          {[...device.pinAssignments]
            .sort((a, b) => a.physical - b.physical)
            .map((assignment) => (
              <tr key={assignment.physical}>
                <td>{assignment.physical}</td>
                <td>{assignment.bcm ?? emDash}</td>
                <td>{assignment.group}</td>
                <td>
                  <code>{assignment.signal}</code>
                </td>
                <td>{assignment.description}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export function HardwareCatalog({ sbcs, hats, gpioLibraries }: HardwareCatalogProps) {
  const { t } = useI18n();
  const emDash = t('common.emDash');

  const categoryOptions = useMemo(
    (): { id: RegistryCategoryFilter; label: string; icon: ButtonIconName }[] => [
      { id: 'all', label: t('registry.categories.all'), icon: 'all' },
      { id: 'sbc', label: t('registry.categories.sbc'), icon: 'sbc' },
      { id: 'hats', label: t('registry.categories.hats'), icon: 'hats' },
      { id: 'libraries', label: t('registry.categories.libraries'), icon: 'catalog' },
    ],
    [t],
  );

  const columnDefs = useMemo(
    (): {
      key: keyof RegistryColumnFilters | null;
      label: string;
      filterPlaceholder?: string;
      compare?: boolean;
    }[] => [
      { key: null, label: t('sbcCompare.column'), compare: true },
      { key: null, label: t('registry.columns.category') },
      { key: 'name', label: t('registry.columns.name'), filterPlaceholder: t('registry.filters.name') },
      { key: 'vendor', label: t('registry.columns.vendor'), filterPlaceholder: t('registry.filters.vendor') },
      { key: 'soc', label: t('registry.columns.soc'), filterPlaceholder: t('registry.filters.soc') },
      {
        key: 'platform',
        label: t('registry.columns.platform'),
        filterPlaceholder: t('registry.filters.platform'),
      },
      { key: 'kind', label: t('registry.columns.kind'), filterPlaceholder: t('registry.filters.kind') },
      {
        key: 'productCategory',
        label: t('registry.columns.productCategory'),
        filterPlaceholder: t('registry.filters.productCategory'),
      },
      {
        key: 'interfaces',
        label: t('registry.columns.interfaces'),
        filterPlaceholder: t('registry.filters.interfaces'),
      },
      { key: null, label: t('registry.columns.pins') },
      { key: null, label: t('registry.columns.formFactor') },
      { key: 'tags', label: t('registry.columns.tags'), filterPlaceholder: t('registry.filters.tags') },
      { key: null, label: t('registry.columns.links') },
    ],
    [t],
  );

  const allRows = useMemo(
    () => buildRegistryTableRows(sbcs, hats, gpioLibraries),
    [sbcs, hats, gpioLibraries],
  );
  const {
    category: categoryFilter,
    columnFilters,
    expandedId,
    compareSbcIds,
    setCategoryFilter,
    updateColumnFilter,
    clearFilters,
    toggleExpanded,
    toggleCompareSbc,
    clearCompareSbcs,
  } = useRegistryRoute();

  const filteredRows = useMemo(
    () => filterRegistryRows(allRows, categoryFilter, columnFilters),
    [allRows, categoryFilter, columnFilters],
  );

  const columnFilteredRows = useMemo(
    () => filterRegistryRows(allRows, 'all', columnFilters),
    [allRows, columnFilters],
  );

  const totals = useMemo(() => computeCategoryCounts(allRows), [allRows]);

  const categoryCounts = useMemo(() => {
    const source = hasActiveColumnFilters(columnFilters) ? columnFilteredRows : allRows;
    return computeCategoryCounts(source);
  }, [allRows, columnFilteredRows, columnFilters]);

  const filtersActive =
    categoryFilter !== 'all' || hasActiveColumnFilters(columnFilters);

  const compareAtMax = compareSbcIds.length >= MAX_SBC_COMPARE;
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  useEffect(() => {
    if (compareSbcIds.length === 0) {
      setCompareModalOpen(false);
    }
  }, [compareSbcIds.length]);

  return (
    <section className="hardware-catalog">
      <div className="hardware-catalog__header">
        <h2 className="section-title">{t('registry.title')}</h2>
        <ul className="registry-summary" aria-label={t('registry.statsAria')}>
          <li className="registry-summary__item">
            <span className="registry-summary__value">{totals.all}</span>
            <span className="registry-summary__label">{t('registry.stats.items')}</span>
          </li>
          <li className="registry-summary__item">
            <span className="registry-summary__value">{totals.sbc}</span>
            <span className="registry-summary__label">{t('registry.stats.sbcs')}</span>
          </li>
          <li className="registry-summary__item">
            <span className="registry-summary__value">{totals.hats}</span>
            <span className="registry-summary__label">{t('registry.stats.hats')}</span>
          </li>
          <li className="registry-summary__item">
            <span className="registry-summary__value">{totals.libraries}</span>
            <span className="registry-summary__label">{t('registry.stats.libraries')}</span>
          </li>
          <li className="registry-summary__item">
            <span className="registry-summary__value">{PLATFORM_CONFIGS.length}</span>
            <span className="registry-summary__label">{t('registry.stats.platforms')}</span>
          </li>
        </ul>
      </div>

      <div className="registry-table__toolbar">
        <div className="registry-table__category-filter" role="group" aria-label={t('registry.categoryAria')}>
          {categoryOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={[
                'registry-table__category-btn',
                'btn-with-icon',
                categoryFilter === option.id ? 'registry-table__category-btn--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-pressed={categoryFilter === option.id}
              onClick={() => setCategoryFilter(option.id)}
            >
              <ButtonIcon name={option.icon} />
              <span>{option.label}</span>
              <span className="registry-table__category-count">
                {categoryCounts[option.id]}
              </span>
            </button>
          ))}
        </div>

        <div className="registry-table__toolbar-meta">
          {compareSbcIds.length > 0 && (
            <button
              type="button"
              className="registry-table__compare-btn btn-with-icon"
              onClick={() => setCompareModalOpen(true)}
            >
              <ButtonIcon name="swap" />
              <span>{t('sbcCompare.compareSelected', { count: compareSbcIds.length })}</span>
            </button>
          )}
          <span className="registry-table__result-count">
            {t('registry.showing', { count: filteredRows.length, total: allRows.length })}
          </span>
          {filtersActive && (
            <button
              type="button"
              className="registry-table__clear-btn btn-with-icon"
              onClick={clearFilters}
            >
              <ButtonLabel icon="clear">{t('registry.clearFilters')}</ButtonLabel>
            </button>
          )}
        </div>
      </div>

      <SbcCompareModal
        open={compareModalOpen}
        compareIds={compareSbcIds}
        onRemove={toggleCompareSbc}
        onClear={() => {
          clearCompareSbcs();
          setCompareModalOpen(false);
        }}
        onClose={() => setCompareModalOpen(false)}
      />

      <div className="registry-table__wrap">
        <table className="registry-table">
          <thead>
            <tr>
              {columnDefs.map((column) => (
                <th key={column.label} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
            <tr className="registry-table__filter-row">
              {columnDefs.map((column) => (
                <th key={`${column.label}-filter`} scope="col">
                  {column.key ? (
                    <input
                      type="search"
                      className="registry-table__filter-input"
                      value={columnFilters[column.key]}
                      placeholder={column.filterPlaceholder}
                      aria-label={t('registry.filters.aria', { column: column.label })}
                      onChange={(event) =>
                        updateColumnFilter(column.key!, event.target.value)
                      }
                    />
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={columnDefs.length} className="registry-table__empty">
                  {t('registry.empty')}
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const isExpanded = expandedId === row.id;
                const isSbc = row.registryCategory === 'sbc';
                const isCompared = isSbc && compareSbcIds.includes(row.id);
                const compareDisabled = isSbc && !isCompared && compareAtMax;
                return (
                  <Fragment key={row.id}>
                    <tr
                      className={[
                        'registry-table__row',
                        `registry-table__row--${row.registryCategory}`,
                        isExpanded ? 'registry-table__row--expanded' : '',
                        isCompared ? 'registry-table__row--compared' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => toggleExpanded(row.id)}
                    >
                      <td className="registry-table__compare-cell" onClick={(e) => e.stopPropagation()}>
                        {isSbc ? (
                          <input
                            type="checkbox"
                            className="registry-table__compare-input"
                            checked={isCompared}
                            disabled={compareDisabled}
                            aria-label={t('sbcCompare.toggleBoard', { name: row.name })}
                            title={
                              compareDisabled
                                ? t('sbcCompare.maxReached', { max: MAX_SBC_COMPARE })
                                : t('sbcCompare.toggleBoard', { name: row.name })
                            }
                            onChange={() => toggleCompareSbc(row.id)}
                          />
                        ) : null}
                      </td>
                      <td>
                        <span
                          className={[
                            'registry-table__category-badge',
                            `registry-table__category-badge--${row.registryCategory}`,
                          ].join(' ')}
                        >
                          {row.registryCategory === 'sbc'
                            ? t('registry.categories.sbc')
                            : row.registryCategory === 'hats'
                              ? t('registry.categories.hats')
                              : t('registry.categories.libraries')}
                        </span>
                      </td>
                      <td>
                        <div className="registry-table__title-cell">
                          <HardwareImage
                            imageUrl={row.hat?.imageUrl ?? row.sbc?.imageUrl}
                            alt={row.name}
                            size="sm"
                            className="registry-table__thumb"
                          />
                          <div className="registry-table__title-stack">
                            <span className="registry-table__title">{row.name}</span>
                            {row.id !== row.platformId && (
                              <code className="registry-table__subtitle">{row.id}</code>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{row.vendor}</td>
                      <td className="registry-table__soc">{row.soc || emDash}</td>
                      <td>
                        <code>{row.platformId}</code>
                      </td>
                      <td>{row.kind}</td>
                      <td>
                        {row.registryCategory === 'libraries'
                          ? formatWiringPiCompatibility(
                              row.library!.wiringPiCompatibility,
                              t,
                            )
                          : row.productCategory}
                      </td>
                      <td className="registry-table__interfaces">{row.interfaces || emDash}</td>
                      <td>
                        {row.pinCount > 0
                          ? row.registryCategory === 'libraries'
                            ? t('registry.libraryPlatformCount', { count: row.pinCount })
                            : row.pinCount
                          : emDash}
                      </td>
                      <td className="registry-table__form-factor">
                        {row.formFactor || emDash}
                      </td>
                      <td className="registry-table__tags">{row.tags || emDash}</td>
                      <td className="registry-table__links" onClick={(e) => e.stopPropagation()}>
                        {row.documentationUrl && (
                          <a
                            href={row.documentationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {t('common.docs')}
                          </a>
                        )}
                        {row.productUrl && (
                          <a href={row.productUrl} target="_blank" rel="noopener noreferrer">
                            {row.registryCategory === 'libraries'
                              ? t('registry.libraryRepository')
                              : t('common.product')}
                          </a>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="registry-table__details-row">
                        <td colSpan={columnDefs.length}>
                          <RegistryRowDetails row={row} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
