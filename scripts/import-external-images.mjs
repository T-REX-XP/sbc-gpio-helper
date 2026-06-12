import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'public/sbcs');
const wiringOpPath = path.join(root, 'src/config/wiringop-sbcs.json');
const registryPath = path.join(root, 'src/config/hardware-registry.json');

/**
 * Verified product photo URLs from vendor sites / wikis.
 * wiringX manual images are handled by import-wiringx-images.mjs.
 */
const EXTERNAL_IMAGES = {
  'orange-pi-plus': 'http://www.orangepi.org/img/img4/banner-PLUS-2E.jpg',
  'orange-pi-win': 'http://www.orangepi.org/orangepiwiki/images/f/ff/Orange-pi-i96-img51.png',
  'orange-pi-win-plus': 'http://www.orangepi.org/orangepiwiki/images/f/ff/Orange-pi-i96-img50.png',
  'radxa-zero-40pin': 'https://wiki.radxa.com/mw/images/thumb/4/4e/Zero_front_view.jpg/700px-Zero_front_view.jpg',
  'radxa-zero-3-40pin': 'https://wiki.radxa.com/mw/images/thumb/8/8a/Zero3W_front_view.jpg/700px-Zero3W_front_view.jpg',
};

const REGISTRY_IDS = new Set(['radxa-zero-40pin', 'radxa-zero-3-40pin']);

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname).toLowerCase() || '.jpg';
  return { buffer, ext };
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
      if (REGISTRY_IDS.has(id)) {
        const sbc = registry.sbcs.find((s) => s.id === id);
        if (sbc) sbc.imageUrl = imageUrl;
      } else {
        const sbc = wiringOp.sbcs.find((s) => s.id === id);
        if (sbc) sbc.imageUrl = imageUrl;
      }
      console.log(`${id} ← ${url}`);
      count++;
    } catch (err) {
      console.warn(`${id}: ${err.message}`);
    }
  }

  fs.writeFileSync(wiringOpPath, `${JSON.stringify(wiringOp, null, 2)}\n`);
  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  console.log(`Done: ${count} external images`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
