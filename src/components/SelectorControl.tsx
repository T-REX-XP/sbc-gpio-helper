import type { CSSProperties, ReactNode } from 'react';
import { HardwareImage } from './HardwareImage';

interface SelectorControlProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  imageUrl?: string;
  imageAlt: string;
  accentColor?: string;
  children: ReactNode;
}

export function SelectorControl({
  id,
  value,
  onChange,
  imageUrl,
  imageAlt,
  accentColor,
  children,
}: SelectorControlProps) {
  const hasImage = Boolean(imageUrl);

  return (
    <div
      className={[
        'selector-control',
        hasImage ? 'selector-control--with-image' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        accentColor
          ? ({ '--selector-accent': accentColor } as CSSProperties)
          : undefined
      }
    >
      {hasImage && (
        <HardwareImage
          imageUrl={imageUrl}
          alt={imageAlt}
          size="xs"
          className="selector-control__thumb"
        />
      )}
      <select
        id={id}
        className="selector-control__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </div>
  );
}
