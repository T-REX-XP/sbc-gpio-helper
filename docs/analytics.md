# Analytics (Umami)

This app uses [Umami](https://umami.is) for privacy-friendly, cookieless web analytics. Analytics are **optional** and disabled unless you configure environment variables.

## Enable Umami

1. Create a website in [Umami Cloud](https://cloud.umami.is) or on your [self-hosted](https://umami.is/docs/install) instance.
2. Copy the **Website ID** from the site settings.
3. Copy `.env.example` to `.env` in the project root:

   ```bash
   cp .env.example .env
   ```

4. Set your website ID:

   ```env
   VITE_UMAMI_WEBSITE_ID=your-website-id-here
   ```

5. If you self-host Umami, also set the script URL:

   ```env
   VITE_UMAMI_SCRIPT_URL=https://your-umami-domain.com/script.js
   ```

6. Restart the dev server or rebuild for production:

   ```bash
   npm run dev
   # or
   npm run build
   ```

When `VITE_UMAMI_WEBSITE_ID` is empty or unset, no analytics script is loaded.

## What is tracked

| Event | Description |
|-------|-------------|
| Page views | SPA navigations to `/main` and `/registry` |

The app is a single-page application. Umami’s default page load tracking only fires once, so page changes are reported manually via `trackUmamiPageView` in `src/analytics/umami.ts`.

## Custom events (optional)

You can track custom events from application code:

```typescript
import { trackUmamiEvent } from './analytics/umami';

trackUmamiEvent('platform-selected', { platformId: 'radxa-zero-40pin' });
```

Custom events are only sent when Umami is configured.

## Production deployment

Set the same `VITE_*` variables in your hosting provider’s environment **before** running `npm run build`. Vite inlines env values at build time; changing env vars after build requires a new build.

Example (generic CI):

```bash
export VITE_UMAMI_WEBSITE_ID="..."
export VITE_UMAMI_SCRIPT_URL="https://cloud.umami.is/script.js"
npm run build
```

## Privacy notes

- Umami does not use cookies and does not collect personal data by default.
- No analytics run in development unless you set `.env` locally.
- Do not commit `.env` — it is listed in `.gitignore`.

## Related files

- `src/analytics/umami.ts` — config, script loader, tracking helpers
- `src/analytics/useUmamiPageTracking.ts` — React hook for page views
- `src/components/UmamiAnalytics.tsx` — mounted from `App.tsx`
- `.env.example` — variable template
