interface HardwareImageProps {
  imageUrl?: string;
  alt: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

/** Prefix Vite base path so public assets work on GitHub Pages subpaths. */
function resolvePublicUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;

  const base = import.meta.env.BASE_URL;
  const path = url.startsWith('/') ? url.slice(1) : url;
  return `${base}${path}`;
}

export function HardwareImage({
  imageUrl,
  alt,
  className = '',
  size = 'md',
}: HardwareImageProps) {
  if (!imageUrl) return null;

  return (
    <img
      className={`hardware-image hardware-image--${size} ${className}`.trim()}
      src={resolvePublicUrl(imageUrl)}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
}
