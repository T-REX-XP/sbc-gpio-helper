import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  SITE_DESCRIPTION,
  SITE_TITLE,
} from './src/config/site'

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

function getSiteUrl(): string {
  const explicit = process.env.VITE_SITE_URL?.replace(/\/$/, '')
  if (explicit) return explicit

  if (process.env.GITHUB_ACTIONS === 'true') {
    const repo = process.env.GITHUB_REPOSITORY
    if (repo) {
      const [owner, name] = repo.split('/')
      if (owner && name) return `https://${owner}.github.io/${name}`
    }
  }

  return 'http://localhost:5173'
}

function getPageUrl(siteUrl: string): string {
  return `${siteUrl}/`
}

function getAbsolutePublicUrl(siteUrl: string, assetPath: string): string {
  const normalizedAsset = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath
  return `${siteUrl}/${normalizedAsset}`
}

function socialPreviewMeta(): Plugin {
  return {
    name: 'social-preview-meta',
    transformIndexHtml() {
      const siteUrl = getSiteUrl()
      const pageUrl = getPageUrl(siteUrl)
      const imageUrl = getAbsolutePublicUrl(siteUrl, OG_IMAGE_PATH)
      const tags: HtmlTagDescriptor[] = [
        { tag: 'meta', attrs: { name: 'description', content: SITE_DESCRIPTION }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:type', content: 'website' }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:site_name', content: SITE_TITLE }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:title', content: SITE_TITLE }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:description', content: SITE_DESCRIPTION }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:url', content: pageUrl }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image', content: imageUrl }, injectTo: 'head' },
        {
          tag: 'meta',
          attrs: { property: 'og:image:width', content: String(OG_IMAGE_WIDTH) },
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image:height', content: String(OG_IMAGE_HEIGHT) },
          injectTo: 'head',
        },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: SITE_TITLE }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:title', content: SITE_TITLE }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:description', content: SITE_DESCRIPTION }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:image', content: imageUrl }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:image:alt', content: SITE_TITLE }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'canonical', href: pageUrl }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#3d4a2a' }, injectTo: 'head' },
      ]

      return tags
    },
  }
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
  plugins: [react(), socialPreviewMeta(), githubPagesSpaFallback()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(getAppVersion()),
  },
})
