# GPIO Visualizer

Web app to visualize 40-pin GPIO headers for single-board computers (SBCs) and stackable HAT accessories. Compare pinouts across boards, inspect SPI buses, device-tree overlays, and HAT pin usage.

Supported platforms:

- Raspberry Pi (40-pin, BCM numbering)
- Radxa Zero (Meson G12A)
- Radxa Zero 3 (RK3566)
- Orange Pi Zero 3W (Allwinner A733)
- Orange Pi 5 (RK3588S, 26-pin header)

## Features

- **GPIO header** — interactive 40-pin layout with hover details
- **HAT overlay** — color-coded pins for Waveshare display boards
- **Platform compare** — side-by-side headers, pin-by-pin diff, SPI and form-factor comparison
- **Device-tree overlays** — Radxa kernel overlay reference (from wiki/docs)
- **Hardware registry** — filterable table of registered SBCs and HATs

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Build for production

```bash
npm run build
npm run preview
```

Output is written to `dist/`.

### GitHub Pages

CI and deployment run via GitHub Actions. After enabling **Pages → Source: GitHub Actions** in the repository settings, pushes to `main`/`master` publish to:

```text
https://<username>.github.io/<repository-name>/
```

See [docs/deployment.md](docs/deployment.md) for setup, secrets, custom domains, and local Pages build testing (`npm run build:pages`).

## Configuration

### Hardware registry

Board and accessory catalog: [`src/config/hardware-registry.json`](src/config/hardware-registry.json)

- `sbcs` — single-board computers (links to platform pinout JSON)
- `hats` — accessories with pin assignments

Pinout data per platform: [`src/config/platforms/`](src/config/platforms/)

### Environment variables

Copy [`.env.example`](.env.example) to `.env` and adjust as needed.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_UMAMI_WEBSITE_ID` | No | Umami website ID; omit to disable analytics |
| `VITE_UMAMI_SCRIPT_URL` | No | Umami script URL (default: Umami Cloud) |

See [docs/analytics.md](docs/analytics.md) for Umami setup.

## Project structure

```
src/
  analytics/          # Umami integration
  components/         # UI components
  config/             # Hardware registry + platform JSON
  hardware/           # Registry, SPI, pin labels, comparison logic
  pages/              # Main visualizer + registry page
docs/
  requirement.md      # Original product requirements
  analytics.md        # Umami analytics guide
public/
  sbcs/               # SBC thumbnail images
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run build:pages` | Build with GitHub Pages base path (local test) |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | Run ESLint |

## Documentation

- [Requirements](docs/requirement.md) — initial project goals and HAT sources
- [Analytics](docs/analytics.md) — Umami configuration and tracking behavior
- [Deployment](docs/deployment.md) — GitHub Pages pipeline and hosting

## License

Private project (`package.json` → `"private": true`).
