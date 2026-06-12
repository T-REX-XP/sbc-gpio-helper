import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const platformPath = resolve(root, 'src/config/platforms/raspberry-pi-40pin.json')
const platform = JSON.parse(readFileSync(platformPath, 'utf8'))

const basePath = resolve(root, 'public/og-image-base.png')
const outPngPath = resolve(root, 'public/og-image.png')
const outSvgPath = resolve(root, 'public/og-image.svg')

const PIN_COLORS = {
  power3v3: '#e8a317',
  power5v: '#c62828',
  ground: '#1a1a1a',
  i2c: '#1e88e5',
  uart: '#8e44c3',
  spi: '#d81b87',
  pcm: '#00acc1',
  gpio: '#6d7f3c',
}

/** Pin grid aligned to the GPIO strip on public/og-image-base.png (1536×1024). */
const HEADER = {
  width: 1536,
  height: 1024,
  coverX: 222,
  coverY: 82,
  coverW: 188,
  coverH: 818,
  stripFill: '#0c1018',
  pinR: 14.5,
  rowStartY: 100,
  rowStep: 41.2,
  leftCx: 252,
  rightCx: 377,
  numSize: 11,
}

function pinPosition(physical) {
  const row = Math.floor((physical - 1) / 2)
  const col = (physical - 1) % 2
  return {
    cx: col === 0 ? HEADER.leftCx : HEADER.rightCx,
    cy: HEADER.rowStartY + row * HEADER.rowStep,
  }
}

function renderPin(pin) {
  const { cx, cy } = pinPosition(pin.physical)
  const fill = PIN_COLORS[pin.type] ?? PIN_COLORS.gpio
  const stroke = '#0a0a0a'
  const isPin1 = pin.physical === 1
  const r = HEADER.pinR

  const body = isPin1
    ? `<rect x="${(cx - r).toFixed(1)}" y="${(cy - r).toFixed(1)}" width="${(r * 2).toFixed(1)}" height="${(r * 2).toFixed(1)}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`
    : `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`

  return `
    ${body}
    <text x="${cx.toFixed(1)}" y="${(cy + 4.5).toFixed(1)}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="${HEADER.numSize}" font-weight="700" fill="#ffffff" stroke="#000" stroke-width="0.35" paint-order="stroke">${pin.physical}</text>
  `
}

function buildOverlaySvg() {
  const pinsSvg = platform.pins.map(renderPin).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${HEADER.width}" height="${HEADER.height}" viewBox="0 0 ${HEADER.width} ${HEADER.height}">
  <rect x="${HEADER.coverX}" y="${HEADER.coverY}" width="${HEADER.coverW}" height="${HEADER.coverH}" rx="6" fill="${HEADER.stripFill}"/>
  ${pinsSvg}
</svg>`
}

const overlaySvg = buildOverlaySvg()
writeFileSync(outSvgPath, overlaySvg, 'utf8')

const overlayPng = new Resvg(overlaySvg, {
  fitTo: { mode: 'width', value: HEADER.width },
}).render().asPng()

await sharp(basePath)
  .composite([{ input: overlayPng, top: 0, left: 0 }])
  .png()
  .toFile(outPngPath)

console.log(`Composited ${outPngPath} from og-image-base.png + pin overlay`)
