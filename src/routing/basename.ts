/** React Router basename (no trailing slash). */
export function getRouterBasename(): string {
  const base = import.meta.env.BASE_URL;
  return base.endsWith('/') ? base.slice(0, -1) : base;
}
