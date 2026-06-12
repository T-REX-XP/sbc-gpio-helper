# Deployment (GitHub Pages)

The site is a static Vite + React build deployed to **GitHub Pages** via GitHub Actions.

## Live site URL

After deployment, the site is available at:

```text
https://<github-username>.github.io/<repository-name>/
```

Example for a repo named `gpio_visualizer`:

```text
https://your-username.github.io/gpio_visualizer/
```

## One-time repository setup

1. Push this repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
4. Merge to `main` or `master` — the [Deploy GitHub Pages](../.github/workflows/deploy-pages.yml) workflow runs automatically.

The first deployment may require approving the `github-pages` environment if your org uses protection rules.

## Workflows

| Workflow | File | Triggers | Purpose |
|----------|------|----------|---------|
| **CI** | `.github/workflows/ci.yml` | Pull requests; pushes to `main`/`master` | `npm ci`, lint, production build |
| **Deploy GitHub Pages** | `.github/workflows/deploy-pages.yml` | Push to `main`/`master`; manual | Build, upload artifact, deploy to Pages |

### Manual deploy

In GitHub: **Actions → Deploy GitHub Pages → Run workflow**.

## How the build adapts to GitHub Pages

- **Base path** — Vite `base` is set to `/<repository-name>/` when `GITHUB_ACTIONS=true` (see [`vite.config.ts`](../vite.config.ts)).
- **`.nojekyll`** — in `public/` so GitHub does not run Jekyll on the output.
- **`404.html`** — copied from `index.html` during CI builds for SPA-style fallback on unknown paths.

### Override base path

Set explicitly when building (custom domain at repo root, fork names, etc.):

```bash
VITE_BASE_PATH=/ npm run build          # site at https://example.com/
VITE_BASE_PATH=/my-app/ npm run build   # site at https://example.com/my-app/
```

### Local “Pages” build test

Simulate the GitHub Actions build locally:

```bash
# Set your GitHub org/user and repo name
export GITHUB_REPOSITORY=your-username/gpio_visualizer   # Linux/macOS
# $env:GITHUB_REPOSITORY="your-username/gpio_visualizer"  # PowerShell

npm run build:pages
npm run preview
```

Open the preview URL and confirm assets load under `/<repo-name>/`.

Or use the helper script (defaults repo to `your-org/gpio_visualizer`):

```bash
GITHUB_REPOSITORY=your-username/gpio_visualizer node scripts/build-pages.mjs
```

## Optional: Umami analytics in production

Add **environment variables** on the `github-pages` environment (Settings → Environments → github-pages → Environment variables):

| Variable | Description |
|----------|-------------|
| `VITE_UMAMI_WEBSITE_ID` | Umami website ID |
| `VITE_UMAMI_SCRIPT_URL` | Optional; Umami script URL if not using Umami Cloud |

These are injected at build time in the deploy workflow. See [analytics.md](analytics.md).

## Custom domain

1. Add a `CNAME` file under `public/` with your domain (e.g. `gpio.example.com`) — it is copied into `dist/` on build.
2. Configure DNS per [GitHub Pages custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).
3. If the site is served from the domain root, set `VITE_BASE_PATH=/` in the deploy workflow env (or use a repo variable).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page, 404 on assets | Wrong `base` path — verify repo name matches `GITHUB_REPOSITORY` or set `VITE_BASE_PATH` |
| Pages workflow not listed | Enable **Source: GitHub Actions** under Settings → Pages |
| Build passes but site stale | Check Actions tab for deploy job; clear browser cache |
| Umami not tracking | Set `github-pages` environment variables and redeploy; values are baked in at build time |
