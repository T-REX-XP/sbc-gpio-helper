/**
 * Normalize SBC thumbnail images so the GPIO header is horizontal at the top.
 * Run: node scripts/normalize-sbc-images.mjs
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/** Clockwise rotation in degrees. Only boards photographed GPIO-down need changes. */
const ROTATIONS = {
  'luckfox-lyra-zero-w-40pin.webp': 180,
  'cubie-a7s-30pin.webp': 180,
};

const dir = path.join('public', 'sbcs');
const staging = path.join('public', 'sbcs-new');

if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true });
fs.mkdirSync(staging, { recursive: true });

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.webp'))) {
  const rotation = ROTATIONS[file] ?? 0;
  let pipeline = sharp(path.join(dir, file));
  if (rotation) pipeline = pipeline.rotate(rotation);
  await pipeline.webp({ quality: 85 }).toFile(path.join(staging, file));
}

for (const file of fs.readdirSync(dir)) {
  fs.unlinkSync(path.join(dir, file));
}
for (const file of fs.readdirSync(staging)) {
  fs.renameSync(path.join(staging, file), path.join(dir, file));
}
fs.rmdirSync(staging);

for (const [file, rotation] of Object.entries(ROTATIONS)) {
  const meta = await sharp(path.join(dir, file)).metadata();
  console.log(`${file}: rotated ${rotation}° → ${meta.width}x${meta.height}`);
}
console.log('Done. Other SBC images already have GPIO on top.');
