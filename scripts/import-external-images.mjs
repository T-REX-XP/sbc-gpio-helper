/**
 * Download product photos from vendor wikis and related official sources.
 * wiringX manual images: import-wiringx-images.mjs
 * Orange Pi catalog pages: import-orangepi-images.mjs
 *
 * Run: node scripts/import-external-images.mjs
 */
import fs from 'fs';
import path from 'path';
import wiringOpSbcs from '../src/config/wiringop-sbcs.json' with { type: 'json' };
import hardwareRegistry from '../src/config/hardware-registry.json' with { type: 'json' };

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'public/sbcs');
const wiringOpPath = path.join(root, 'src/config/wiringop-sbcs.json');
const registryPath = path.join(root, 'src/config/hardware-registry.json');

/** sbcId → remote image URL */
const EXTERNAL_IMAGES = {
  'orange-pi-plus': 'http://www.orangepi.org/img/img4/banner-PLUS-2E.jpg',
  'orange-pi-win': 'http://www.orangepi.org/orangepiwiki/images/5/59/Orange-pi-i96-img51.png',
  'orange-pi-win-plus': 'http://www.orangepi.org/orangepiwiki/images/f/ff/Orange-pi-i96-img50.png',
  'radxa-zero-40pin': 'https://wiki.radxa.com/mw/images/thumb/4/4e/Zero_front_view.jpg/700px-Zero_front_view.jpg',
  'radxa-zero-3-40pin': 'https://manual.wiringx.org/_images/rock4.jpg',
  'luckfox-lyra-zero-w-40pin':
    'https://www.luckfox.com/image/cache/catalog/development-board/Luckfox-Lyra-Zero-W/Luckfox-Lyra-Zero-W-1-1600x1200.jpg',
  'luckfox-aura-40pin':
    'https://www.luckfox.com/image/cache/catalog/development-board/Luckfox-Aura-04000/Luckfox-Aura-02000-1-1600x1200.jpg',
  'cubie-a7z-40pin':
    'https://www.cnx-software.com/wp-content/uploads/2025/08/Allwinner-A733-Raspberry-Pi-Zero-SBC.jpg',
  'cubie-a7s-30pin':
    'https://www.cnx-software.com/wp-content/uploads/2025/08/Allwinner-A733-Raspberry-Pi-Zero-SBC.jpg',
};

/** Copy an already-downloaded sibling photo when no dedicated product page exists. */
const RELATED_COPIES = {
  'orange-pi-zero-3-plus': 'orange-pi-zero-3w',
  'orange-pi-3-plus': 'orange-pi-3b',
  'orange-pi-900': 'orange-pi-800',
  'orange-pi-ai-max': 'orange-pi-5',
  'orange-pi-kunpeng-pro': 'orange-pi-ai-pro',
};

const REGISTRY_IDS = new Set([
  'radxa-zero-40pin',
  'radxa-zero-3-40pin',
  'luckfox-lyra-zero-w-40pin',
  'luckfox-aura-40pin',
  'cubie-a7z-40pin',
  'cubie-a7s-30pin',
]);

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname).toLowerCase() || '.jpg';
  return { buffer, ext };
}

function setImageUrl(id, imageUrl) {
  if (REGISTRY_IDS.has(id)) {
    const sbc = registry.sbcs.find((s) => s.id === id);
    if (sbc) sbc.imageUrl = imageUrl;
    return;
  }
  const sbc = wiringOp.sbcs.find((s) => s.id === id);
  if (sbc) sbc.imageUrl = imageUrl;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const wiringOp = JSON.parse(fs.readFileSync(wiringOpPath, 'utf8'));
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  let count = 0;

  for (const [id, url] of Object.entries(EXTERNAL_IMAGES)) {
    try {
      const { buffer, ext } = await download(url);
      const fileName = `${id}${ext}`;
      fs.writeFileSync(path.join(outDir, fileName), buffer);
      const imageUrl = `/sbcs/${fileName}`;
      setImageUrl(id, imageUrl);
      console.log(`${id} ← ${url}`);
      count++;
    } catch (err) {
      console.warn(`${id}: ${err.message}`);
    }
  }

  for (const [targetId, sourceId] of Object.entries(RELATED_COPIES)) {
    const source = wiringOp.sbcs.find((s) => s.id === sourceId);
    if (!source?.imageUrl) {
      console.warn(`${targetId}: source ${sourceId} has no image`);
      continue;
    }
    const sourcePath = path.join(root, 'public', source.imageUrl.replace(/^\//, ''));
    if (!fs.existsSync(sourcePath)) continue;
    const ext = path.extname(sourcePath);
    const dest = path.join(outDir, `${targetId}${ext}`);
    fs.copyFileSync(sourcePath, dest);
    setImageUrl(targetId, `/sbcs/${targetId}${ext}`);
    console.log(`${targetId} ← copy of ${sourceId}`);
    count++;
  }

  fs.writeFileSync(wiringOpPath, `${JSON.stringify(wiringOp, null, 2)}\n`);
  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  console.log(`Done: ${count} external/related images`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
