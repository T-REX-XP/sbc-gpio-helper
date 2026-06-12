# GPIO Visualizer

[![Live demo](https://img.shields.io/badge/demo-GitHub%20Pages-238636?style=for-the-badge&logo=github)](https://t-rex-xp.github.io/sbc-gpio-helper/)
[![Deploy](https://github.com/T-REX-XP/sbc-gpio-helper/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/T-REX-XP/sbc-gpio-helper/actions/workflows/deploy-pages.yml)
[![CI](https://github.com/T-REX-XP/sbc-gpio-helper/actions/workflows/ci.yml/badge.svg)](https://github.com/T-REX-XP/sbc-gpio-helper/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)

> Compare SBC GPIO pinouts and HAT assignments — side by side, in the browser.

![GPIO Visualizer — compare SBC GPIO pinouts and HAT assignments](public/og-image.png)

**[Open live demo →](https://t-rex-xp.github.io/sbc-gpio-helper/)** · [Report an issue](https://github.com/T-REX-XP/sbc-gpio-helper/issues) · [View source](https://github.com/T-REX-XP/sbc-gpio-helper)

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Supported hardware](#supported-hardware)
- [Quick start](#quick-start)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Documentation](#documentation)
- [License](#license)

---

## Overview

GPIO Visualizer is a static web app for exploring **40-pin and 26-pin GPIO headers** on single-board computers (SBCs) and how **display HATs** use those pins.

Pick a board platform, optionally stack a HAT, and inspect pin types, conflicts, and SPI routing. Compare two boards or two HATs to spot power, ground, and signal differences before you wire anything up.

| | |
|---|---|
| **Status** | Production — deployed to GitHub Pages on every push to `main` / `master` |
| **Languages** | English, Ukrainian (UI) |
| **Analytics** | Optional [Umami](docs/analytics.md) (privacy-friendly, no cookies) |
| **Data format** | JSON registry + per-platform pinout files — no backend required |

---

## Features

| Feature | Description |
|---------|-------------|
| **Interactive GPIO header** | Color-coded 26/40-pin layout with hover details, pin selection, and legend filters |
| **HAT overlay** | See which pins a display HAT uses; highlight conflicts when two HATs share signals |
| **Platform compare** | Side-by-side headers, pin-by-pin diff table, SPI bus view, and PCB form-factor diagram |
| **SPI visualization** | Bus signal mapping with chip-select lines per platform |
| **Device-tree overlays** | Radxa kernel overlay reference (from official wiki/docs) |
| **Hardware registry** | Filterable catalog of registered SBCs and HATs with expandable specs |
| **Shareable URLs** | Deep links for platform, compare target, HAT, filters, selected pins, and active tab |
| **Export pinout** | Copy or save GPIO sections as PNG |
| **Responsive layout** | Adapts header density for 26-pin vs 40-pin boards |

### Example URLs

```text
/board/raspberry-pi-40pin?hat=waveshare-lcd-1.3&view=spi&pins=3,5
/registry?category=hats&expand=waveshare-lcd-1.3
```

---

## Supported hardware

Data lives in [`src/config/hardware-registry.json`](src/config/hardware-registry.json) and [`src/config/platforms/`](src/config/platforms/). Pull requests to add boards or HATs are welcome.

### SBC platforms

| Platform | Header | GPIO numbering | SoC family |
|----------|--------|----------------|------------|
| Raspberry Pi | 40-pin | BCM | Broadcom VideoCore |
| Radxa Zero | 40-pin | Linux GPIO + bank | Meson G12A (S905Y2) |
| Radxa Zero 3 | 40-pin | Linux GPIO + bank | Rockchip RK3566 |
| Orange Pi Zero 3W | 40-pin | SoC port (PB/PE/…) | Allwinner A733 |
| Orange Pi 5 | 26-pin | SoC GPIO | Rockchip RK3588S |

### Display HATs

| HAT | Vendor | Interface | Notes |
|-----|--------|-----------|-------|
| Waveshare 1.3″ LCD HAT | Waveshare | SPI | ST7789 display |
| Waveshare 1.44″ LCD HAT | Waveshare | SPI | ST7735S display |
| Waveshare 2.13″ e-Paper HAT | Waveshare | SPI | SSD1680, SPI + busy/reset |

---

## Quick start

### Prerequisites

- **Node.js** 20+ (22 recommended — matches CI)
- **npm** 10+

### Local development

```bash
git clone https://github.com/T-REX-XP/sbc-gpio-helper.git
cd sbc-gpio-helper
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview
```

Output is written to `dist/`.

---

## Deployment

The app is built for **[GitHub Pages](https://pages.github.com/)** via GitHub Actions.

1. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Push to `main` or `master` — the [Deploy GitHub Pages](.github/workflows/deploy-pages.yml) workflow publishes automatically.

```text
https://<username>.github.io/<repository-name>/
```

This repository: **https://t-rex-xp.github.io/sbc-gpio-helper/**

| Topic | Guide |
|-------|-------|
| Pages setup, base path, custom domain | [docs/deployment.md](docs/deployment.md) |
| Social preview (Open Graph / Twitter Card) | [docs/deployment.md#social-preview-open-graph--twitter-card](docs/deployment.md#social-preview-open-graph--twitter-card) |
| Local Pages build test | `npm run build:pages` then `npm run preview` |

---

## Configuration

### Hardware registry

| File | Purpose |
|------|---------|
| [`src/config/hardware-registry.json`](src/config/hardware-registry.json) | SBC and HAT catalog (`sbcs`, `hats`) |
| [`src/config/platforms/*.json`](src/config/platforms/) | Pinout, SPI buses, form factor per platform |
| [`public/sbcs/`](public/sbcs/) | Board thumbnail images |

### Environment variables

Copy [`.env.example`](.env.example) to `.env` for local development. In CI, set variables on the `github-pages` environment.

| Variable | Required | Description |
|----------|:--------:|-------------|
| `VITE_UMAMI_WEBSITE_ID` | No | Umami website ID; omit to disable analytics |
| `VITE_UMAMI_SCRIPT_URL` | No | Umami script URL (default: Umami Cloud) |
| `VITE_SITE_URL` | No | Public site URL for Open Graph tags (auto-detected on GitHub Actions) |
| `VITE_BASE_PATH` | No | Override Vite base path (custom domain / subpath) |

See [docs/analytics.md](docs/analytics.md) for Umami setup.

---

## Project structure

```text
src/
  analytics/          # Umami integration
  components/         # UI (GPIO header, selectors, registry table, …)
  config/             # Hardware registry, platform JSON, site metadata
  hardware/           # Registry logic, SPI, pin labels, comparison
  i18n/               # English + Ukrainian strings
  layout/             # App shell and navigation
  pages/              # Main visualizer + registry page
  routing/            # URL state (board, registry, shareable params)
  utils/              # Public URL helper, image export
docs/
  requirement.md      # Original product requirements
  analytics.md        # Umami analytics guide
  deployment.md       # GitHub Pages pipeline and hosting
public/
  og-image.png        # Social preview image (1200×630, generated from Pi pinout)
  og-image.svg        # Source SVG for og-image.png
  logo.svg            # App logo and apple-touch-icon
  sbcs/               # SBC thumbnail images
.github/workflows/
  ci.yml              # Lint + build on push/PR
  deploy-pages.yml    # Build and deploy to GitHub Pages
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Typecheck (`tsc`) + production build to `dist/` |
| `npm run build:pages` | Build with GitHub Pages base path (local test) |
| `npm run generate:og-image` | Regenerate `public/og-image.png` from Raspberry Pi pinout data |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | Run ESLint |

---

## Documentation

| Document | Contents |
|----------|----------|
| [Requirements](docs/requirement.md) | Initial project goals and HAT sources |
| [Analytics](docs/analytics.md) | Umami configuration and tracking behavior |
| [Deployment](docs/deployment.md) | GitHub Pages pipeline, env vars, social preview |

---

## License

Private project (`package.json` → `"private": true`).
