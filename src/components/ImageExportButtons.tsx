import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { copyElementImageToClipboard, saveElementImage } from '../utils/exportImage';
import { useI18n } from '../i18n';

interface ImageExportButtonsProps {
  targetRef: RefObject<HTMLElement | null>;
  fileName: string;
}

type ExportStatus = 'idle' | 'copying' | 'saving' | 'copied' | 'error';

export function ImageExportButtons({ targetRef, fileName }: ImageExportButtonsProps) {
  const { t } = useI18n();
  const [status, setStatus] = useState<ExportStatus>('idle');
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current != null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const scheduleReset = useCallback(() => {
    if (resetTimerRef.current != null) {
      window.clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = window.setTimeout(() => {
      setStatus('idle');
      resetTimerRef.current = null;
    }, 2000);
  }, []);

  const handleCopy = async () => {
    const element = targetRef.current;
    if (!element) return;

    setStatus('copying');

    try {
      await copyElementImageToClipboard(element);
      setStatus('copied');
      scheduleReset();
    } catch {
      setStatus('error');
      scheduleReset();
    }
  };

  const handleSave = async () => {
    const element = targetRef.current;
    if (!element) return;

    setStatus('saving');

    try {
      await saveElementImage(element, fileName);
      setStatus('idle');
    } catch {
      setStatus('error');
      scheduleReset();
    }
  };

  const busy = status === 'copying' || status === 'saving';

  return (
    <div className="image-export" role="group" aria-label={t('imageExport.aria')}>
      {status === 'copied' && (
        <span className="image-export__status" aria-live="polite">
          {t('imageExport.copied')}
        </span>
      )}
      {status === 'error' && (
        <span className="image-export__status image-export__status--error" aria-live="polite">
          {t('imageExport.error')}
        </span>
      )}
      <button
        type="button"
        className="image-export__btn"
        onClick={handleCopy}
        disabled={busy}
      >
        {status === 'copying' ? t('imageExport.copying') : t('imageExport.copy')}
      </button>
      <button
        type="button"
        className="image-export__btn"
        onClick={handleSave}
        disabled={busy}
      >
        {status === 'saving' ? t('imageExport.saving') : t('imageExport.save')}
      </button>
    </div>
  );
}
