import { useRef, type ReactNode } from 'react';
import { ImageExportButtons } from './ImageExportButtons';

interface PinoutSectionProps {
  id?: string;
  title: string;
  description?: string;
  headerExtra?: ReactNode;
  exportable?: boolean;
  exportFileName?: string;
  children: ReactNode;
}

export function PinoutSection({
  id,
  title,
  description,
  headerExtra,
  exportable = false,
  exportFileName,
  children,
}: PinoutSectionProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const showExport = exportable && exportFileName;
  const toolbar = headerExtra || showExport;

  return (
    <section className="pinout-section" id={id} aria-labelledby={id ? `${id}-title` : undefined}>
      <header className="pinout-section__header">
        <div className="pinout-section__heading">
          <div>
            <h2 className="pinout-section__title" id={id ? `${id}-title` : undefined}>
              {title}
            </h2>
            {description && <p className="pinout-section__desc">{description}</p>}
          </div>
          {toolbar && (
            <div className="pinout-section__toolbar">
              {headerExtra}
              {showExport && (
                <ImageExportButtons targetRef={bodyRef} fileName={exportFileName} />
              )}
            </div>
          )}
        </div>
      </header>
      <div className="pinout-section__body" ref={bodyRef}>
        {children}
      </div>
    </section>
  );
}
