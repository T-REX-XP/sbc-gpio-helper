interface HardwareImageProps {
  imageUrl?: string;
  alt: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
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
      src={imageUrl}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
}
