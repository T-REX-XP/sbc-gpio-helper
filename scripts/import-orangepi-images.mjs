/**
 * Download Orange Pi product photos from orangepi.org for wiringOP catalog entries.
 *
 * Run: node scripts/import-orangepi-images.mjs
 */
import fs from 'fs';
import path from 'path';
import wiringOpSbcs from '../src/config/wiringop-sbcs.json' with { type: 'json' };
import hardwareRegistry from '../src/config/hardware-registry.json' with { type: 'json' };

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'public/sbcs');
const wiringOpPath = path.join(root, 'src/config/wiringop-sbcs.json');
const registryPath = path.join(root, 'src/config/hardware-registry.json');
const siteBase = 'http://www.orangepi.org';

/** shortName → orangepi.org details page slug (when not derivable). */
const SLUG_OVERRIDES = {
  'Orange Pi 3 LTS': 'orange-pi-3-LTS',
  'Orange Pi 4 LTS': 'orange-pi-4-LTS',
  'Orange Pi 800': 'orange-pi-800',
  'Orange Pi 5 Plus': 'Orange-Pi-5-plus',
  'Orange Pi R1 Plus LTS': 'orange-pi-R1-Plus-LTS',
  'Orange Pi R1 Plus': 'orange-pi-R1-Plus-LTS',
  'Orange Pi Zero Plus 2 (H3)': 'Orange-Pi-Zero-Plus-2',
  'Orange Pi Zero Plus 2 (H5)': 'Orange-Pi-Zero-Plus-2',
  'Orange Pi AI Pro': 'Orange-Pi-AIpro(8-12t)',
  'Orange Pi AI Pro 20T': 'Orange-Pi-AIpro(20t)',
  'Orange Pi CM4': 'Orange-Pi-CM4-1',
  'Orange Pi CM5 Tablet': 'Orange-Pi-CM5-Tablet-Board',
  'Orange Pi PC 2': 'Orange-Pi-PC-2',
};

/** Curated registry id → orangepi slug (reuse wiringOP import logic). */
const REGISTRY_SLUGS = {
  'orangepi-zero-3w-40pin': 'Orange-Pi-Zero-3W',
  'orangepi-5-26pin': 'Orange-Pi-5',
};

function slugFromShortName(shortName) {
  if (SLUG_OVERRIDES[shortName]) return SLUG_OVERRIDES[shortName];
  return shortName.replace(/^Orange Pi /i, 'Orange-Pi-').replace(/\s+/g, '-');
}

function detailsUrl(slug) {
  return `${siteBase}/html/hardWare/computerAndMicrocontrollers/details/${slug}.html`;
}

function normalizeImagePath(raw) {
  return raw
    .replace(/^(\.\.\/)+/, '')
    .replace(/^\//, '');
}

function pickProductImage(html) {
  const picMatch = html.match(/<img[^>]+class=["'][^"']*\bpic\b[^"']*["'][^>]+src=["']([^"']+)["']/i)
    ?? html.match(/<img[^>]+src=["']([^"']+)["'][^>]+class=["'][^"']*\bpic\b/i);
  if (picMatch) {
    const pic = normalizeImagePath(picMatch[1]).replace(/\?.*$/, '');
    if (!/(icon-|logo)/i.test(pic)) return pic;
  }

  const paths = [
    ...html.matchAll(/(?:src|href)=["']([^"']+\.(?:jpg|jpeg|png|webp))(?:\?[^"']*)?["']/gi),
    ...html.matchAll(/(\/?img\/[^"'\s>]+\.(?:jpg|jpeg|png|webp))/gi),
  ]
    .map((m) => normalizeImagePath(m[1]).replace(/\?.*$/, ''))
    .filter((p) => !/(icon-|logo|menu|shop-car|social|avatar|qrcode|computersAndMmicrocontrollers\/icon)/i.test(p));

  const unique = [...new Set(paths)];
  const ranked = unique
    .map((p) => {
      let score = 0;
      if (/img4\/banner-/i.test(p)) score += 100;
      if (/\/details\/0\.webp$/i.test(p)) score += 95;
      if (/\/detail(s)?\/1\.(?:png|webp|jpg)$/i.test(p)) score += 92;
      if (/product-top|product\.png$/i.test(p)) score += 90;
      if (/-img01\.|img01\./i.test(p)) score += 88;
      if (/cm5-03|cm5\/cm5-03/i.test(p)) score += 87;
      if (/pi\d+-fix\/pi\d+-01/i.test(p)) score += 85;
      if (/pi-800-banner/i.test(p)) score += 84;
      if (/zero3\/.*\.png$/i.test(p)) score += 83;
      if (/banner/i.test(p)) score += 70;
      if (/product/i.test(p)) score += 60;
      if (/figure1|carousel1|n0\.webp$/i.test(p)) score += 40;
      if (/feature-|wline|huangdian|keyboard|jianpan/i.test(p)) score -= 50;
      return { p, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.p;
}

async function fetchHtml(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) return null;
  return res.text();
}

async function downloadImage(relativePath) {
  const url = `${siteBase}/${encodeURI(relativePath.replace(/^\//, ''))}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  const ext = path.extname(relativePath).toLowerCase() || '.jpg';
  return { buffer: Buffer.from(await res.arrayBuffer()), ext };
}

function hasRealPhoto(sbcId, imageUrl) {
  if (!imageUrl) return false;
  const file = path.join(root, 'public', imageUrl.replace(/^\//, ''));
  return fs.existsSync(file);
}

function isGeneratedPlaceholder(imageUrl) {
  return Boolean(imageUrl?.endsWith('.webp') && fs.existsSync(path.join(root, 'public', imageUrl.replace(/^\//, ''))));
}

async function importForTarget({ id, shortName, slug, configPath, listKey = 'sbcs' }) {
  const pageSlug = slug ?? slugFromShortName(shortName);
  const html = await fetchHtml(detailsUrl(pageSlug));
  if (!html) {
    console.warn(`No page: ${id} (${pageSlug})`);
    return null;
  }

  const imagePath = pickProductImage(html);
  if (!imagePath) {
    console.warn(`No product image: ${id} (${pageSlug})`);
    return null;
  }

  const { buffer, ext } = await downloadImage(imagePath);
  const fileName = `${id}${ext}`;
  fs.writeFileSync(path.join(outDir, fileName), buffer);
  const imageUrl = `/sbcs/${fileName}`;
  console.log(`${id} ← ${imagePath}`);
  return { id, imageUrl, configPath, listKey };
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const curatedIds = new Set(hardwareRegistry.sbcs.map((s) => s.id));
  const wiringOpTargets = wiringOpSbcs.sbcs.filter(
    (sbc) => !curatedIds.has(sbc.id) && !hasRealPhoto(sbc.id, sbc.imageUrl),
  );

  const registryTargets = hardwareRegistry.sbcs.filter(
    (sbc) => REGISTRY_SLUGS[sbc.id] && isGeneratedPlaceholder(sbc.imageUrl),
  );

  const updates = [];

  for (const sbc of wiringOpTargets) {
    const result = await importForTarget({
      id: sbc.id,
      shortName: sbc.shortName ?? sbc.name,
      configPath: wiringOpPath,
    });
    if (result) updates.push(result);
  }

  for (const sbc of registryTargets) {
    const result = await importForTarget({
      id: sbc.id,
      shortName: sbc.shortName ?? sbc.name,
      slug: REGISTRY_SLUGS[sbc.id],
      configPath: registryPath,
    });
    if (result) updates.push(result);
  }

  for (const [configPath, listKey, entries] of [
    [wiringOpPath, 'sbcs', updates.filter((u) => u.configPath === wiringOpPath)],
    [registryPath, 'sbcs', updates.filter((u) => u.configPath === registryPath)],
  ]) {
    if (!entries.length) continue;
    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    for (const sbc of data[listKey]) {
      const hit = entries.find((e) => e.id === sbc.id);
      if (hit) sbc.imageUrl = hit.imageUrl;
    }
    fs.writeFileSync(configPath, `${JSON.stringify(data, null, 2)}\n`);
  }

  console.log(`Done: ${updates.length} images imported`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
