import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function getBasePath(): string {
  const explicit = process.env.VITE_BASE_PATH
  if (explicit) {
    return explicit.endsWith('/') ? explicit : `${explicit}/`
  }

  if (process.env.GITHUB_ACTIONS === 'true') {
    const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
    if (repo) return `/${repo}/`
  }

  return '/'
}

function formatBuildDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function getAppVersion(): string {
  const buildDate = process.env.VITE_BUILD_DATE ?? formatBuildDate(new Date())
  const buildNumber = process.env.VITE_BUILD_NUMBER ?? 'dev'
  return `${buildDate}.${buildNumber}`
}

/** Copy index.html → 404.html so GitHub Pages serves the SPA on unknown paths. */
function githubPagesSpaFallback(): Plugin {
  return {
    name: 'github-pages-spa-fallback',
    closeBundle() {
      if (process.env.GITHUB_ACTIONS !== 'true') return

      const distDir = resolve('dist')
      const indexPath = resolve(distDir, 'index.html')
      const fallbackPath = resolve(distDir, '404.html')

      if (!existsSync(indexPath)) return

      copyFileSync(indexPath, fallbackPath)
    },
  }
}

export default defineConfig({
  base: getBasePath(),
  plugins: [react(), githubPagesSpaFallback()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(getAppVersion()),
  },
})
