import type { ReactNode } from 'react';

interface PinoutSectionProps {
  id?: string;
  title: string;
  description?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
}

export function PinoutSection({
  id,
  title,
  description,
  headerExtra,
  children,
}: PinoutSectionProps) {
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
          {headerExtra}
        </div>
      </header>
      <div className="pinout-section__body">{children}</div>
    </section>
  );
}
