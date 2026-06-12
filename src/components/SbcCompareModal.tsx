import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../i18n';
import { SbcComparePanel } from './SbcComparePanel';

interface SbcCompareModalProps {
  open: boolean;
  compareIds: readonly string[];
  onRemove: (sbcId: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function SbcCompareModal({
  open,
  compareIds,
  onRemove,
  onClear,
  onClose,
}: SbcCompareModalProps) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || compareIds.length === 0) return null;

  return createPortal(
    <div className="sbc-compare-modal" onClick={onClose}>
      <div
        className="sbc-compare-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sbc-compare-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="sbc-compare-modal__close"
          onClick={onClose}
          aria-label={t('sbcCompare.closeModal')}
        >
          ×
        </button>
        <SbcComparePanel
          compareIds={compareIds}
          onRemove={onRemove}
          onClear={onClear}
          titleId="sbc-compare-modal-title"
          inModal
        />
      </div>
    </div>,
    document.body,
  );
}
