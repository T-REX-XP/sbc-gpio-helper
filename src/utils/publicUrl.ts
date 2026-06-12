/** Prefix Vite base path so public assets work on GitHub Pages subpaths. */
export function resolvePublicUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;

  const base = import.meta.env.BASE_URL;
  const path = url.startsWith('/') ? url.slice(1) : url;
  return `${base}${path}`;
}
