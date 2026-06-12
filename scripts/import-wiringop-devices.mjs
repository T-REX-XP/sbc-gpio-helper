/**
 * Extract wiringOP-supported Orange Pi devices from wiringPi.c and generate
 * registry config: platforms (from README gpio readall) + SBC catalog entries.
 *
 * Run: node scripts/import-wiringop-devices.mjs
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const wiringPiSrc = path.join(root, 'tmp-wiringPi.c');
const readmeMd = path.join(
  process.env.USERPROFILE ?? '',
  '.cursor/projects/d-Projects-My-sbc-gpio-helper/uploads/wiringOP-0.md',
);
const altReadme = path.join(root, 'uploads/wiringOP-0.md');

const mdPath = fs.existsSync(readmeMd) ? readmeMd : altReadme;

/** PI_MODEL -> platform id (shared pinout profile). */
const MODEL_TO_PLATFORM = {
  PI_MODEL_3: 'orangepi-h6-26pin-3',
  PI_MODEL_LTIE_2: 'orangepi-h6-26pin-lite2',
  PI_MODEL_ZERO: 'orangepi-h2-26pin',
  PI_MODEL_H3: 'orangepi-h3-40pin',
  PI_MODEL_ZERO_PLUS_2: 'orangepi-h3-26pin-zero-plus-2',
  PI_MODEL_WIN: 'orangepi-a64-40pin-win',
  PI_MODEL_PRIME: 'orangepi-h5-40pin-prime',
  PI_MODEL_PC_2: 'orangepi-h5-40pin-pc2',
  PI_MODEL_ZERO_PLUS: 'orangepi-h5-26pin-zero-plus',
  PI_MODEL_ZERO_2: 'orangepi-h616-26pin-zero2',
  PI_MODEL_ZERO_2_W: 'orangepi-h616-26pin-zero2',
  PI_MODEL_ZERO_3_W: 'orangepi-zero-3w-40pin',
  PI_MODEL_ZERO_3_PLUS: 'orangepi-zero-3-plus-40pin',
  PI_MODEL_800: 'orangepi-800-40pin',
  PI_MODEL_4: 'orangepi-rk3399-40pin-4',
  PI_MODEL_4_LTS: 'orangepi-rk3399-40pin-4',
  PI_MODEL_RK3399: 'orangepi-rk3399-40pin',
  PI_MODEL_R1_PLUS: 'orangepi-r1-plus-26pin',
  PI_MODEL_5: 'orangepi-5-26pin',
  PI_MODEL_5B: 'orangepi-5-26pin',
  PI_MODEL_5_PRO: 'orangepi-5-26pin',
  PI_MODEL_5_MAX: 'orangepi-5-26pin',
  PI_MODEL_5_ULTRA: 'orangepi-5-26pin',
  PI_MODEL_5_PLUS: 'orangepi-5plus-40pin',
  PI_MODEL_CM5: 'orangepi-5-26pin',
  PI_MODEL_CM5_TABLET: 'orangepi-5-26pin',
  PI_MODEL_AI_MAX: 'orangepi-5-26pin',
  PI_MODEL_900: 'orangepi-900-40pin',
  PI_MODEL_CM4: 'orangepi-cm4-40pin',
  PI_MODEL_3B: 'orangepi-3b-40pin',
  PI_MODEL_3_PLUS: 'orangepi-3plus-40pin',
  PI_MODEL_AI_PRO: 'orangepi-aipro-40pin',
  PI_MODEL_KUNPENG_PRO: 'orangepi-kunpeng-pro-40pin',
  PI_MODEL_AI_STATION: 'orangepi-aistation-40pin',
  PI_MODEL_RV: 'orangepi-rv-40pin',
  PI_MODEL_4A: 'orangepi-4a-40pin',
  PI_MODEL_RV2: 'orangepi-rv2-40pin',
  PI_MODEL_4_PRO: 'orangepi-4pro-40pin',
};

/** Human-readable names for release-id prefixes. */
const RELEASE_NAMES = {
  'orangepi3.': 'Orange Pi 3',
  'orangepi3-lts.': 'Orange Pi 3 LTS',
  'orangepioneplus.': 'Orange Pi One Plus',
  'orangepilite2.': 'Orange Pi Lite 2',
  'orangepizero.': 'Orange Pi Zero',
  'orangepizerolts.': 'Orange Pi Zero LTS',
  'orangepizero-lts.': 'Orange Pi Zero LTS',
  'orangepir1.': 'Orange Pi R1',
  'orangepi-r1.': 'Orange Pi R1',
  'orangepipc.': 'Orange Pi PC',
  'orangepipcplus.': 'Orange Pi PC Plus',
  'orangepione.': 'Orange Pi One',
  'orangepilite.': 'Orange Pi Lite',
  'orangepiplus.': 'Orange Pi Plus',
  'orangepiplue2e.': 'Orange Pi Plus 2E',
  'orangepizeroplus2h3.': 'Orange Pi Zero Plus 2 (H3)',
  'orangepizeroplus2-h3.': 'Orange Pi Zero Plus 2 (H3)',
  'orangepiwin.': 'Orange Pi Win',
  'orangepiwinplus.': 'Orange Pi Win Plus',
  'orangepiprime.': 'Orange Pi Prime',
  'orangepipc2.': 'Orange Pi PC 2',
  'orangepizeroplus.': 'Orange Pi Zero Plus',
  'orangepizeroplus2h5.': 'Orange Pi Zero Plus 2 (H5)',
  'orangepizeroplus2-h5.': 'Orange Pi Zero Plus 2 (H5)',
  'orangepizero2.': 'Orange Pi Zero 2',
  'orangepizero2w.': 'Orange Pi Zero 2W',
  'orangepizero3.': 'Orange Pi Zero 3',
  'orangepizero3w.': 'Orange Pi Zero 3W',
  'orangepizero3plus.': 'Orange Pi Zero 3 Plus',
  'orangepirk3399.': 'Orange Pi RK3399',
  'orangepi-rk3399.': 'Orange Pi RK3399',
  'orangepi800.': 'Orange Pi 800',
  'orangepi4.': 'Orange Pi 4',
  'orangepi4a.': 'Orange Pi 4A',
  'orangepi4pro.': 'Orange Pi 4 Pro',
  'orangepi4-lts.': 'Orange Pi 4 LTS',
  'orangepir1plus.': 'Orange Pi R1 Plus',
  'orangepi-r1plus.': 'Orange Pi R1 Plus',
  'orangepir1plus-lts.': 'Orange Pi R1 Plus LTS',
  'orangepi-r1plus-lts.': 'Orange Pi R1 Plus LTS',
  'orangepi5.': 'Orange Pi 5',
  'orangepi5b.': 'Orange Pi 5B',
  'orangepi5pro.': 'Orange Pi 5 Pro',
  'orangepi5max.': 'Orange Pi 5 Max',
  'orangepi5ultra.': 'Orange Pi 5 Ultra',
  'orangepi5plus.': 'Orange Pi 5 Plus',
  'orangepiaimax.': 'Orange Pi AI Max',
  'orangepi900.': 'Orange Pi 900',
  'orangepicm5.': 'Orange Pi CM5',
  'orangepicm5-tablet.': 'Orange Pi CM5 Tablet',
  'orangepicm5_tablet.': 'Orange Pi CM5 Tablet',
  'orangepicm4.': 'Orange Pi CM4',
  'orangepi3b.': 'Orange Pi 3B',
  'orangepi3plus.': 'Orange Pi 3 Plus',
  'orangepiaipro.': 'Orange Pi AI Pro',
  'orangepiaipro-20t.': 'Orange Pi AI Pro 20T',
  'orangepikunpengpro.': 'Orange Pi Kunpeng Pro',
  'orangepiaistation.': 'Orange Pi AI Station',
  'orangepirv.': 'Orange Pi RV',
  'orangepirv2.': 'Orange Pi RV2',
};

const MODEL_SOC = {
  PI_MODEL_3: 'Allwinner H6',
  PI_MODEL_LTIE_2: 'Allwinner H6',
  PI_MODEL_ZERO: 'Allwinner H2+',
  PI_MODEL_H3: 'Allwinner H3',
  PI_MODEL_ZERO_PLUS_2: 'Allwinner H3 / H5',
  PI_MODEL_WIN: 'Allwinner A64',
  PI_MODEL_PRIME: 'Allwinner H5',
  PI_MODEL_PC_2: 'Allwinner H5',
  PI_MODEL_ZERO_PLUS: 'Allwinner H5',
  PI_MODEL_ZERO_2: 'Allwinner H616',
  PI_MODEL_ZERO_2_W: 'Allwinner H616',
  PI_MODEL_ZERO_3_W: 'Allwinner A733',
  PI_MODEL_ZERO_3_PLUS: 'Allwinner H618',
  PI_MODEL_800: 'Rockchip RK3399',
  PI_MODEL_4: 'Rockchip RK3399',
  PI_MODEL_4_LTS: 'Rockchip RK3399',
  PI_MODEL_RK3399: 'Rockchip RK3399',
  PI_MODEL_R1_PLUS: 'Rockchip RK3328',
  PI_MODEL_5: 'Rockchip RK3588S',
  PI_MODEL_5B: 'Rockchip RK3588',
  PI_MODEL_5_PRO: 'Rockchip RK3588S',
  PI_MODEL_5_MAX: 'Rockchip RK3588',
  PI_MODEL_5_ULTRA: 'Rockchip RK3588',
  PI_MODEL_5_PLUS: 'Rockchip RK3588',
  PI_MODEL_CM5: 'Rockchip RK3588',
  PI_MODEL_CM5_TABLET: 'Rockchip RK3588',
  PI_MODEL_AI_MAX: 'Rockchip RK3588',
  PI_MODEL_900: 'Rockchip RK3588',
  PI_MODEL_CM4: 'Rockchip RK3566',
  PI_MODEL_3B: 'Allwinner H618',
  PI_MODEL_3_PLUS: 'Allwinner H618',
  PI_MODEL_AI_PRO: 'Rockchip RK3588',
  PI_MODEL_KUNPENG_PRO: 'Huawei Kunpeng',
  PI_MODEL_AI_STATION: 'Rockchip RK3588',
  PI_MODEL_RV: 'Allwinner T113',
  PI_MODEL_4A: 'Allwinner T527',
  PI_MODEL_RV2: 'Allwinner T113',
  PI_MODEL_4_PRO: 'Allwinner T527',
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function inferPinType(name) {
  const n = name.toUpperCase();
  if (n.includes('3.3V') || n === '+3.3V') return 'power3v3';
  if (n.includes('5V') || n === '+5.0V') return 'power5v';
  if (n === 'GND') return 'ground';
  if (/^SDA|^SCL|^I2C|^TWI/.test(n)) return 'i2c';
  if (/^TXD|^RXD|^UART|^TX|^RX/.test(n)) return 'uart';
  if (/^MOSI|^MISO|^SCLK|^CLK|^CE|^CS|^SPI/.test(n)) return 'spi';
  if (/^PWM/.test(n)) return 'gpio';
  return 'gpio';
}

function parseGpioReadallTable(lines) {
  const pins = new Map();

  for (const line of lines) {
    if (!line.includes('||')) continue;
    const parts = line.split('|').map((s) => s.trim());
    // [ '', gpioL, wpiL, nameL, modeL, vL, physOdd, '', physEven, vR, modeR, nameR, wpiR, gpioR, '' ]
    if (parts.length < 14) continue;
    const physOdd = Number(parts[6]);
    const physEven = Number(parts[8]);
    if (!Number.isFinite(physOdd) || !Number.isFinite(physEven)) continue;

    const left = {
      physical: physOdd,
      name: parts[3],
      gpioNumber: /^\d+$/.test(parts[1]) ? Number(parts[1]) : undefined,
      wPi: /^\d+$/.test(parts[2]) ? Number(parts[2]) : undefined,
      type: inferPinType(parts[3]),
    };
    const right = {
      physical: physEven,
      name: parts[11],
      gpioNumber: /^\d+$/.test(parts[13]) ? Number(parts[13]) : undefined,
      wPi: /^\d+$/.test(parts[12]) ? Number(parts[12]) : undefined,
      type: inferPinType(parts[11]),
    };
    if (left.name) pins.set(left.physical, left);
    if (right.name) pins.set(right.physical, right);
  }

  return [...pins.values()].sort((a, b) => a.physical - b.physical);
}

function parseReadmePinouts(md) {
  const sections = [];
  const lines = md.split('\n');
  let socFamily = '';
  let current = null;
  let inCode = false;

  for (const line of lines) {
    const h2 = line.match(/^## (Allwinner|RockChip) /);
    if (h2) {
      socFamily = line.replace(/^## /, '').trim();
      continue;
    }
    const h3 = line.match(/^### (.+)$/);
    if (h3) {
      if (current?.tableLines?.length) sections.push(current);
      current = { title: h3[1].trim(), socFamily, tableLines: [] };
      inCode = false;
      continue;
    }
    if (current && line.trim() === '```') {
      inCode = !inCode;
      continue;
    }
    if (current && inCode && line.includes('||')) {
      current.tableLines.push(line.trim());
    }
  }
  if (current?.tableLines?.length) sections.push(current);
  return sections;
}

function extractDevicesFromWiringPi(src) {
  const devices = [];
  for (const line of src.split('\n')) {
    const m = line.match(/"(orangepi[^"]+)"[^+]+\*model\s*=\s*(PI_MODEL_\w+)/);
    if (!m) continue;
    const releaseId = m[1];
    const model = m[2];
    const name = RELEASE_NAMES[releaseId] ?? releaseId.replace(/\.$/, '');
    const platformId = MODEL_TO_PLATFORM[model];
    if (!platformId) {
      console.warn(`No platform mapping for ${model} (${releaseId})`);
      continue;
    }
    const id = slugify(name);
    devices.push({
      id,
      releaseId,
      model,
      name: `${name} GPIO Header`,
      shortName: name,
      platformId,
      soc: MODEL_SOC[model] ?? 'Unknown',
    });
  }
  return devices;
}

function buildPlatformJson(id, title, pins, extras = {}) {
  const pinCount = Math.max(...pins.map((p) => p.physical));
  const rows = pinCount / 2;
  return {
    id,
    name: title,
    shortName: title.replace(/ GPIO Header$/, ''),
    pinCount,
    orientationHint: 'GPIO header at the top — pin 1 is top-left (wiringOP gpio readall layout)',
    documentationUrl: 'https://github.com/orangepi-xunlong/wiringOP',
    productUrl: 'http://www.orangepi.org/',
    notes: `Pinout from wiringOP gpio readall. Uses wiringPi (wPi) numbering — see wiringOP README.`,
    gpioNumberLabel: 'wPi / GPIO',
    ...extras,
    formFactor: {
      widthMm: pinCount >= 40 ? 85 : 65,
      heightMm: pinCount >= 40 ? 56 : 32,
      label: pinCount >= 40 ? '40-pin HAT header' : '26-pin header',
      gpioHeader: {
        pin1: { x: 1.27, y: 0 },
        pitchMm: 2.54,
        columns: 2,
        rows,
      },
      notes: `Documented in wiringOP for ${title}.`,
    },
    pins: pins.map((p) => ({
      physical: p.physical,
      name: p.name,
      ...(p.gpioNumber !== undefined ? { gpioNumber: p.gpioNumber } : {}),
      ...(p.wPi !== undefined ? { bankName: `wPi ${p.wPi}` } : {}),
      type: p.type,
      ...(p.name.match(/SDA|SCL|MOSI|MISO|SCLK|CE|CS|TXD|RXD|PWM/i)
        ? { altFunctions: [p.name.replace(/\s+/g, '')] }
        : {}),
    })),
  };
}

/** Map README section (soc + title) to platform ids. */
function sectionPlatformId(section) {
  const key = `${section.socFamily}::${section.title}`;
  const map = {
    'Allwinner H2+::Orange Pi Zero/R1': 'orangepi-h2-26pin',
    'Allwinner H3::Orange Pi Zero Plus 2': 'orangepi-h3-26pin-zero-plus-2',
    'Allwinner H3::OrangePi One/Lite/Pc/Plus/PcPlus/Plus2e': 'orangepi-h3-40pin',
    'Allwinner H5::Orange Pi Zero Plus': 'orangepi-h5-26pin-zero-plus',
    'Allwinner H5::Orange Pi Zero Plus 2': 'orangepi-h5-26pin-zero-plus-2',
    'Allwinner H5::Orange Pi Pc 2': 'orangepi-h5-40pin-pc2',
    'Allwinner H5::Orange Pi Prime': 'orangepi-h5-40pin-prime',
    'Allwinner A64::Orange Pi Win/Winplus': 'orangepi-a64-40pin-win',
    'Allwinner H6::Orange Pi 3/3 LTS': 'orangepi-h6-26pin-3',
    'Allwinner H6::Orange Pi Lite2/OnePlus': 'orangepi-h6-26pin-lite2',
    'Allwinner H616::Orange Pi Zero2/Zero2 LTS/Zero2 B': 'orangepi-h616-26pin-zero2',
    'RockChip RK3399::Orange Pi RK3399': 'orangepi-rk3399-40pin',
    'RockChip RK3399::Orange Pi 4/4B/4 LTS': 'orangepi-rk3399-40pin-4',
  };
  return map[key];
}

function platformImportName(file) {
  const parts = file.replace('.json', '').split('-');
  return parts
    .map((part, index) => {
      if (index === 0) return part;
      if (/^\d/.test(part)) return part.replace(/pin$/i, 'Pin');
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
}

function main() {
  if (!fs.existsSync(wiringPiSrc)) {
    console.error('Missing tmp-wiringPi.c — curl wiringOP wiringPi.c first');
    process.exit(1);
  }

  const wiringPi = fs.readFileSync(wiringPiSrc, 'utf8');
  const devices = extractDevicesFromWiringPi(wiringPi);

  const platformsDir = path.join(root, 'src/config/platforms');
  const generatedPlatforms = new Set([
    'orangepi-zero-3w-40pin',
    'orangepi-5-26pin',
  ]);

  if (fs.existsSync(mdPath)) {
    const md = fs.readFileSync(mdPath, 'utf8');
    const sections = parseReadmePinouts(md);
    for (const section of sections) {
      const platformId = sectionPlatformId(section);
      if (!platformId || generatedPlatforms.has(platformId)) continue;
      const pins = parseGpioReadallTable(section.tableLines);
      if (pins.length === 0) continue;
      const title = `${section.title} GPIO Header`;
      const json = buildPlatformJson(platformId, title, pins);
      fs.writeFileSync(
        path.join(platformsDir, `${platformId}.json`),
        JSON.stringify(json, null, 2) + '\n',
      );
      generatedPlatforms.add(platformId);
      console.log(`Platform ${platformId}: ${pins.length} pins from README`);
    }
  } else {
    console.warn('README md not found, skipping gpio readall platform generation');
  }

  // Stub platforms for wiringOP models without README tables
  const stubProfiles = [
    ['orangepi-zero-3-plus-40pin', 'Orange Pi Zero 3 Plus', 40],
    ['orangepi-800-40pin', 'Orange Pi 800', 40],
    ['orangepi-r1-plus-26pin', 'Orange Pi R1 Plus', 26],
    ['orangepi-5plus-40pin', 'Orange Pi 5 Plus', 40],
    ['orangepi-900-40pin', 'Orange Pi 900', 40],
    ['orangepi-cm4-40pin', 'Orange Pi CM4', 40],
    ['orangepi-3b-40pin', 'Orange Pi 3B', 40],
    ['orangepi-3plus-40pin', 'Orange Pi 3 Plus', 40],
    ['orangepi-aipro-40pin', 'Orange Pi AI Pro', 40],
    ['orangepi-kunpeng-pro-40pin', 'Orange Pi Kunpeng Pro', 40],
    ['orangepi-aistation-40pin', 'Orange Pi AI Station', 40],
    ['orangepi-rv-40pin', 'Orange Pi RV', 40],
    ['orangepi-4a-40pin', 'Orange Pi 4A', 40],
    ['orangepi-rv2-40pin', 'Orange Pi RV2', 40],
    ['orangepi-4pro-40pin', 'Orange Pi 4 Pro', 40],
  ];

  for (const [id, title, pinCount] of stubProfiles) {
    if (generatedPlatforms.has(id)) continue;
    const pins = [];
    for (let i = 1; i <= pinCount; i++) {
      pins.push({
        physical: i,
        name: `PIN${i}`,
        type: i % 2 === 0 && i <= 4 ? (i === 2 || i === 4 ? 'power5v' : 'ground') : 'gpio',
      });
    }
    const json = buildPlatformJson(id, `${title} GPIO Header`, pins, {
      notes: `wiringOP-supported board. Detailed pinout pending — see wiringOP gpio readall on device.`,
    });
    fs.writeFileSync(path.join(platformsDir, `${id}.json`), JSON.stringify(json, null, 2) + '\n');
    generatedPlatforms.add(id);
    console.log(`Stub platform ${id}`);
  }

  const sbcs = devices.map((d) => ({
    id: d.id,
    platformId: d.platformId,
    name: d.name,
    shortName: d.shortName,
    vendor: 'Orange Pi',
    description: `GPIO header on ${d.shortName} (${d.soc}). Supported by wiringOP — detected via /etc/orangepi-release prefix "${d.releaseId}".`,
    documentationUrl: 'https://github.com/orangepi-xunlong/wiringOP',
    productUrl: 'http://www.orangepi.org/',
    tags: ['orange-pi', 'wiringop', slugify(d.soc), d.platformId.includes('26') ? '26-pin' : '40-pin'],
    hardware: {
      soc: d.soc,
      socFamily: d.soc.split(' ')[0],
      formFactor: d.platformId.includes('26') ? '26-pin header' : '40-pin header',
    },
    specifications: {
      gpioHeader: d.platformId.includes('26') ? '26-pin' : '40-pin',
      gpioNumbering: 'wiringOP wPi',
      interface: ['GPIO', 'I2C', 'SPI', 'UART', 'PWM'],
    },
    wiringOp: {
      releaseId: d.releaseId,
      model: d.model,
    },
  }));

  const outPath = path.join(root, 'src/config/wiringop-sbcs.json');
  fs.writeFileSync(outPath, JSON.stringify({ sbcs }, null, 2) + '\n');
  console.log(`Wrote ${sbcs.length} SBC entries to ${outPath}`);

  // Regenerate platforms.ts imports
  const platformFiles = fs
    .readdirSync(platformsDir)
    .filter((f) => f.endsWith('.json'))
    .sort();
  const imports = platformFiles.map((file) => {
    const varName = platformImportName(file);
    return `import ${varName} from '../config/platforms/${file}';`;
  });
  const vars = platformFiles.map((file) => platformImportName(file));
  const platformsTs = `import type { GpioPlatform } from './types';

${imports.join('\n')}

export const PLATFORM_CONFIGS: readonly GpioPlatform[] = [
${vars.map((v) => `  ${v} as GpioPlatform,`).join('\n')}
].sort((a, b) => a.id.localeCompare(b.id));
`;
  fs.writeFileSync(path.join(root, 'src/hardware/platforms.ts'), platformsTs);
  console.log(`Updated src/hardware/platforms.ts (${platformFiles.length} platforms)`);

  // Update wiringOP library supportedPlatformIds in hardware-registry.json
  const registryPath = path.join(root, 'src/config/hardware-registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const orangepiPlatformIds = [...new Set(sbcs.map((s) => s.platformId))].sort();
  const wiringOpLib = registry.gpioLibraries?.find((l) => l.id === 'wiringop');
  if (wiringOpLib) {
    wiringOpLib.supportedPlatformIds = orangepiPlatformIds;
    wiringOpLib.notes =
      `${sbcs.length} Orange Pi boards detected from wiringOP piBoardId() release strings. Pinouts from wiringOP gpio readall where documented.`;
  }
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
  console.log(`Updated wiringOP library with ${orangepiPlatformIds.length} platform IDs`);

  console.log(`Generated ${generatedPlatforms.size} platform profiles`);
}

main();
