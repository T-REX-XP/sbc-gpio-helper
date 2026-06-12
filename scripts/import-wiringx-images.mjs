/**
 * Download board photos from manual.wiringx.org and attach imageUrl to catalog entries.
 *
 * Run: node scripts/import-wiringx-images.mjs
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const manualBase = 'https://manual.wiringx.org';
const outDir = path.join(root, 'public/sbcs');

/** Board photo on a wiringX manual page → catalog SBC id */
const IMAGE_TARGETS = [
  { slug: 'bananapi/bananapi1', sbcId: 'bananapi-1', config: 'wiringx' },
  { slug: 'bananapi/bananapim2', sbcId: 'bananapi-m2', config: 'wiringx' },
  { slug: 'hummingboard/hummingboardbasepro', sbcId: 'hummingboard-base-pro', config: 'wiringx' },
  { slug: 'hummingboard/hummingboardedgegate', sbcId: 'hummingboard-edge-gate', config: 'wiringx' },
  { slug: 'odroid/odroidc1', sbcId: 'odroid-c1', config: 'wiringx' },
  { slug: 'odroid/odroidc2', sbcId: 'odroid-c2', config: 'wiringx' },
  { slug: 'odroid/odroidxu4', sbcId: 'odroid-xu4', config: 'wiringx' },
  { slug: 'orangepi/orangepipc+', sbcId: 'orange-pi-pc-plus', config: 'wiringop' },
  { slug: 'orangepi/orangepipc2', sbcId: 'orange-pi-pc-2', config: 'wiringop', imageHint: 'orangepipc2' },
  { slug: 'pcduino/pcduino1', sbcId: 'pcduino-1', config: 'wiringx' },
  { slug: 'radxa/rock4', sbcId: 'radxa-rock4', config: 'wiringx' },
  { slug: 'raspberrypi/raspberrypi1b1', sbcId: 'raspberry-pi-1b-rev1', config: 'wiringx' },
  { slug: 'raspberrypi/raspberrypi1b2', sbcId: 'raspberry-pi-1b-rev2', config: 'wiringx' },
  { slug: 'raspberrypi/raspberrypi4', sbcId: 'raspberry-pi-40pin', config: 'registry' },
];

const STATUS_ICONS = /^(_images\/)?(yes\d*|no)\.png$/i;

function pickBoardImage(html, imageHint) {
  const matches = [...html.matchAll(/_images\/[^"'\s>]+\.(png|jpe?g|gif|webp)/gi)].map((m) => m[0]);
  const unique = [...new Set(matches)];
  if (imageHint) {
    const hinted = unique.find((p) => p.toLowerCase().includes(imageHint.toLowerCase()));
    if (hinted && !STATUS_ICONS.test(hinted)) return hinted;
  }
  return unique.find((p) => !STATUS_ICONS.test(p));
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.text();
}

async function downloadImage(relativePath) {
  const url = `${manualBase}/${relativePath.replace(/^\//, '')}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  const ext = path.extname(relativePath).toLowerCase() || '.jpg';
  return { buffer: Buffer.from(await res.arrayBuffer()), ext };
}

function setImageUrlInJson(filePath, sbcId, imageUrl) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const listKey = filePath.includes('hardware-registry') ? 'sbcs' : 'sbcs';
  const entry = data[listKey].find((s) => s.id === sbcId);
  if (!entry) throw new Error(`SBC ${sbcId} not found in ${filePath}`);
  entry.imageUrl = imageUrl;
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  let downloaded = 0;
  let skipped = 0;

  for (const target of IMAGE_TARGETS) {
    const configPath =
      target.config === 'registry'
        ? path.join(root, 'src/config/hardware-registry.json')
        : target.config === 'wiringop'
          ? path.join(root, 'src/config/wiringop-sbcs.json')
          : path.join(root, 'src/config/wiringx-sbcs.json');

    const html = await fetchText(`${manualBase}/platforms/${target.slug}.html`);
    const imagePath = pickBoardImage(html, target.imageHint);
    if (!imagePath) {
      console.warn(`No board image on ${target.slug}`);
      continue;
    }

    const { buffer, ext } = await downloadImage(imagePath);
    const fileName = `${target.sbcId}${ext}`;
    const outPath = path.join(outDir, fileName);
    const publicUrl = `/sbcs/${fileName}`;

    if (fs.existsSync(outPath) && fs.readFileSync(outPath).equals(buffer)) {
      skipped++;
    } else {
      fs.writeFileSync(outPath, buffer);
      downloaded++;
      console.log(`Saved ${fileName} ← ${imagePath}`);
    }

    setImageUrlInJson(configPath, target.sbcId, publicUrl);
  }

  console.log(`Done: ${downloaded} downloaded, ${skipped} unchanged`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
