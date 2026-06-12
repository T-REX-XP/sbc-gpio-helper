import type { ReactNode } from 'react';

export type ButtonIconName =
  | 'all'
  | 'board'
  | 'catalog'
  | 'clear'
  | 'copy'
  | 'download'
  | 'form'
  | 'hat'
  | 'hats'
  | 'pins'
  | 'sbc'
  | 'spi'
  | 'swap';

const ICONS: Record<ButtonIconName, ReactNode> = {
  copy: (
    <>
      <rect x="5" y="4.5" width="7.5" height="9" rx="1.25" stroke="currentColor" strokeWidth="1.35" />
      <path
        d="M4.5 6.5H4a1.25 1.25 0 0 0-1.25 1.25v7A1.25 1.25 0 0 0 4 16h7a1.25 1.25 0 0 0 1.25-1.25V14.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </>
  ),
  download: (
    <>
      <path d="M8 2.75v7.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path
        d="M5.25 7.75 8 10.5l2.75-2.75"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.25 13.25h9.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </>
  ),
  clear: (
    <path
      d="m4.5 4.5 7 7m0-7-7 7"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
    />
  ),
  swap: (
    <>
      <path
        d="M11.5 5.25H4.75M4.75 5.25 6.5 3.5M4.75 5.25 6.5 7"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 10.75h6.75M11.25 10.75 9.5 9M11.25 10.75 9.5 12.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  pins: (
    <>
      <path d="M3 4.5h10M3 8h10M3 11.5h10" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <circle cx="5.25" cy="4.5" r="0.85" fill="currentColor" />
      <circle cx="10.75" cy="8" r="0.85" fill="currentColor" />
      <circle cx="6.5" cy="11.5" r="0.85" fill="currentColor" />
    </>
  ),
  spi: (
    <>
      <path
        d="M2.75 8h2.25l1.25-2.5 1.75 5 1.25-2.5H13.25"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  form: (
    <>
      <rect x="3.25" y="2.75" width="9.5" height="10.5" rx="1.25" stroke="currentColor" strokeWidth="1.35" />
      <circle cx="5.25" cy="5" r="0.75" fill="currentColor" />
      <circle cx="10.75" cy="5" r="0.75" fill="currentColor" />
      <circle cx="5.25" cy="11" r="0.75" fill="currentColor" />
      <circle cx="10.75" cy="11" r="0.75" fill="currentColor" />
    </>
  ),
  hat: (
    <>
      <rect x="3.5" y="3.25" width="9" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.35" />
      <path d="M6.25 12.25h3.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M8 9.75v2.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </>
  ),
  board: (
    <>
      <rect x="3" y="3" width="10" height="10" rx="1.25" stroke="currentColor" strokeWidth="1.35" />
      <rect x="5.75" y="5.75" width="4.5" height="4.5" rx="0.75" stroke="currentColor" strokeWidth="1.15" />
    </>
  ),
  catalog: (
    <>
      <path d="M3.25 4.5h9.5M3.25 8h9.5M3.25 11.5h9.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M6 4.5v7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </>
  ),
  all: (
    <>
      <path d="M3.25 5.25h9.5M3.25 8h9.5M3.25 10.75h9.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </>
  ),
  sbc: (
    <>
      <rect x="3" y="3" width="10" height="10" rx="1.25" stroke="currentColor" strokeWidth="1.35" />
      <rect x="5.75" y="5.75" width="4.5" height="4.5" rx="0.75" stroke="currentColor" strokeWidth="1.15" />
    </>
  ),
  hats: (
    <>
      <rect x="3.5" y="3.25" width="9" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.35" />
      <path d="M6.25 12.25h3.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M8 9.75v2.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </>
  ),
};

interface ButtonIconProps {
  name: ButtonIconName;
  className?: string;
}

export function ButtonIcon({ name, className = 'btn-icon' }: ButtonIconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

interface ButtonLabelProps {
  icon?: ButtonIconName;
  children: ReactNode;
}

export function ButtonLabel({ icon, children }: ButtonLabelProps) {
  return (
    <>
      {icon && <ButtonIcon name={icon} />}
      <span>{children}</span>
    </>
  );
}
