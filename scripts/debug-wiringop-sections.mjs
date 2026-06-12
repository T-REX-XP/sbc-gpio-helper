import fs from 'fs';
import path from 'path';

const mdPath = path.join(
  process.env.USERPROFILE,
  '.cursor/projects/d-Projects-My-sbc-gpio-helper/uploads/wiringOP-0.md',
);

// inline minimal parser copy
function inferPinType(name) {
  const n = name.toUpperCase();
  if (n.includes('3.3V') || n === '+3.3V') return 'power3v3';
  if (n.includes('5V') || n === '+5.0V') return 'power5v';
  if (n === 'GND') return 'ground';
  return 'gpio';
}

function parseGpioReadallTable(lines) {
  const pins = new Map();
  for (const line of lines) {
    if (!line.includes('||')) continue;
    const parts = line.split('|').map((s) => s.trim());
    if (parts.length < 14) continue;
    const physOdd = Number(parts[6]);
    const physEven = Number(parts[8]);
    if (!Number.isFinite(physOdd) || !Number.isFinite(physEven)) continue;
    pins.set(physOdd, { physical: physOdd, name: parts[3] });
    pins.set(physEven, { physical: physEven, name: parts[11] });
  }
  return [...pins.values()];
}

function parseReadmePinouts(md) {
  const sections = [];
  const lines = md.split('\n');
  let socFamily = '';
  let current = null;
  for (let i = 0; i < lines.length; i++) {
    const h2 = lines[i].match(/^## (Allwinner|RockChip) /);
    if (h2) {
      socFamily = lines[i].replace(/^## /, '').trim();
      continue;
    }
    const h3 = lines[i].match(/^### (.+)$/);
    if (h3) {
      if (current?.tableLines?.length) sections.push(current);
      current = { title: h3[1].trim(), socFamily, tableLines: [] };
      continue;
    }
    if (current && lines[i].startsWith('|') && lines[i].includes('||')) {
      current.tableLines.push(lines[i]);
    }
  }
  if (current?.tableLines?.length) sections.push(current);
  return sections;
}

const md = fs.readFileSync(mdPath, 'utf8');
for (const s of parseReadmePinouts(md)) {
  const pins = parseGpioReadallTable(s.tableLines);
  console.log(`${s.socFamily} :: ${s.title} -> ${pins.length} pins, ${s.tableLines.length} rows`);
}
