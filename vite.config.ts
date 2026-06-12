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
})
