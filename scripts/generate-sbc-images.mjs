/**
 * Generate SBC thumbnail placeholders for boards without a product photo.
 * Output: public/sbcs/{sbc-id}.webp (400×300)
 *
 * Run: node scripts/generate-sbc-images.mjs
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import hardwareRegistry from '../src/config/hardware-registry.json' with { type: 'json' };
import wiringOpSbcs from '../src/config/wiringop-sbcs.json' with { type: 'json' };
import wiringxSbcs from '../src/config/wiringx-sbcs.json' with { type: 'json' };

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'public/sbcs');

const VENDOR_COLORS = {
  'Orange Pi': '#f97316',
  'Banana Pi': '#6366f1',
  Hardkernel: '#2563eb',
  SolidRun: '#8b5cf6',
  Radxa: '#7c3aed',
  'Raspberry Pi': '#2563eb',
  LinkSprite: '#059669',
};

function wiringOpSlugFromCuratedSbc(sbc) {
  if (sbc.shortName) return sbc.shortName.toLowerCase().replace(/\s+/g, '-');
  if (sbc.id.startsWith('orangepi-')) {
    return sbc.id.replace(/^orangepi-/, 'orange-pi-').replace(/-(26|30|40)pin$/, '');
  }
  return undefined;
}

function shouldIncludeWiringOpSbc(sbc) {
  if (hardwareRegistry.sbcs.some((entry) => entry.id === sbc.id)) return false;
  const curated = hardwareRegistry.sbcs.find((entry) => entry.platformId === sbc.platformId);
  if (!curated || curated.id !== sbc.platformId) return true;
  return wiringOpSlugFromCuratedSbc(curated) !== sbc.id;
}

function shouldIncludeWiringxSbc(sbc, existingSbcs) {
  if (existingSbcs.some((entry) => entry.id === sbc.id)) return false;
  if (existingSbcs.some((entry) => entry.platformId === sbc.platformId && entry.id === sbc.platformId)) {
    return false;
  }
  return true;
}

function collectSbcs() {
  const wiringOpFiltered = wiringOpSbcs.sbcs.filter(shouldIncludeWiringOpSbc);
  const mergedBeforeWiringx = [...hardwareRegistry.sbcs, ...wiringOpFiltered];
  const wiringxFiltered = wiringxSbcs.sbcs.filter((sbc) =>
    shouldIncludeWiringxSbc(sbc, mergedBeforeWiringx),
  );
  const byId = new Map();
  for (const sbc of [...mergedBeforeWiringx, ...wiringxFiltered]) {
    byId.set(sbc.id, sbc);
  }
  return [...byId.values()];
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapLines(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function buildSvg(sbc) {
  const accent = VENDOR_COLORS[sbc.vendor] ?? '#64748b';
  const title = sbc.shortName ?? sbc.name.replace(/ GPIO Header$/, '');
  const lines = wrapLines(title, 18);
  const header =
    sbc.specifications?.gpioHeader ??
    (sbc.platformId?.includes('26pin') ? '26-pin' : sbc.platformId?.includes('30pin') ? '30-pin' : '40-pin');
  const soc = sbc.hardware?.soc ?? sbc.vendor;
  const lineY = 168;
  const tspans = lines
    .map((line, i) => `<tspan x="200" dy="${i === 0 ? 0 : 28}">${escapeXml(line)}</tspan>`)
    .join('');

  const pinCount = header.startsWith('26') ? 13 : header.startsWith('30') ? 15 : 20;
  const pinRects = Array.from({ length: pinCount }, (_, i) => {
    const x = 24 + i * ((352 - 48) / (pinCount - 1));
    const fill = i % 2 === 0 ? '#eab308' : '#334155';
    return `<rect x="${x.toFixed(1)}" y="28" width="8" height="18" rx="1.5" fill="${fill}"/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bg)"/>
  <rect width="6" height="300" fill="${accent}"/>
  <rect x="20" y="20" width="360" height="56" rx="8" fill="#0f172a"/>
  ${pinRects}
  <text x="200" y="92" text-anchor="middle" fill="#64748b" font-family="Segoe UI, system-ui, sans-serif" font-size="11" font-weight="600">${escapeXml(header)} GPIO</text>
  <text x="200" y="${lineY}" text-anchor="middle" fill="#0f172a" font-family="Segoe UI, system-ui, sans-serif" font-size="22" font-weight="700">${tspans}</text>
  <text x="200" y="${lineY + lines.length * 28 + 16}" text-anchor="middle" fill="#64748b" font-family="Segoe UI, system-ui, sans-serif" font-size="13">${escapeXml(soc)}</text>
  <text x="200" y="276" text-anchor="middle" fill="#94a3b8" font-family="Segoe UI, system-ui, sans-serif" font-size="11">${escapeXml(sbc.vendor)}</text>
</svg>`;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const sbcs = collectSbcs();
  let created = 0;
  let skipped = 0;

  for (const sbc of sbcs) {
    const outPath = path.join(outDir, `${sbc.id}.webp`);
    if (sbc.imageUrl && fs.existsSync(path.join(root, 'public', sbc.imageUrl.replace(/^\//, '')))) {
      skipped++;
      continue;
    }
    if (fs.existsSync(outPath) && sbc.imageUrl) {
      skipped++;
      continue;
    }

    const svg = buildSvg(sbc);
    await sharp(Buffer.from(svg)).webp({ quality: 88 }).toFile(outPath);
    created++;
  }

  console.log(`Generated ${created} thumbnails, skipped ${skipped} (existing photo)`);
  console.log(`Total SBCs: ${sbcs.length}, files in ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
