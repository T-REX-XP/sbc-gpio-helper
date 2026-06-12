/**
 * Import wiringX-supported devices from manual.wiringx.org.
 * Reuses existing platforms/SBCs where another library already catalogued the board.
 *
 * Run: node scripts/import-wiringx-devices.mjs
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const manualBase = 'https://manual.wiringx.org';
const platformsDir = path.join(root, 'src/config/platforms');

/**
 * @typedef {Object} DevicePage
 * @property {string} slug
 * @property {string} [platformId] - new platform JSON id (omit when mergePlatformId set)
 * @property {string} [sbcId] - new catalog id (omit when mergeSbcId set)
 * @property {string} name
 * @property {string} vendor
 * @property {string} setupId
 * @property {string[]} tags
 * @property {string} [mergePlatformId] - reuse existing platform pinout
 * @property {string} [mergeSbcId] - attach wiringX metadata to existing SBC
 * @property {{ id: string, label: string }[]} [setupIds]
 * @property {string[]} [subModels]
 */

/** @type {DevicePage[]} */
const DEVICE_PAGES = [
  {
    slug: 'bananapi/bananapi1',
    platformId: 'bananapi-1-26pin',
    sbcId: 'bananapi-1',
    name: 'BananaPi 1',
    vendor: 'Banana Pi',
    setupId: 'bananapi1',
    tags: ['banana-pi', 'allwinner-a10', '26-pin'],
  },
  {
    slug: 'bananapi/bananapim2',
    platformId: 'bananapi-m2-40pin',
    sbcId: 'bananapi-m2',
    name: 'BananaPi M2',
    vendor: 'Banana Pi',
    setupId: 'bananapim2',
    tags: ['banana-pi', 'allwinner-a31s', '40-pin'],
  },
  {
    slug: 'hummingboard/hummingboardbasepro',
    platformId: 'hummingboard-base-pro-26pin',
    sbcId: 'hummingboard-base-pro',
    name: 'Hummingboard Base / Pro',
    vendor: 'SolidRun',
    setupId: 'hummingboard_base_sdl',
    tags: ['hummingboard', 'nxp-imx6', '26-pin'],
    setupIds: [
      { id: 'hummingboard_base_sdl', label: 'Hummingboard Base (i.MX6 Solo / Dual Lite)' },
      { id: 'hummingboard_pro_sdl', label: 'Hummingboard Pro (i.MX6 Solo / Dual Lite)' },
      { id: 'hummingboard_base_dq', label: 'Hummingboard Base (i.MX6 Dual / Quad)' },
      { id: 'hummingboard_pro_dq', label: 'Hummingboard Pro (i.MX6 Dual / Quad)' },
    ],
  },
  {
    slug: 'hummingboard/hummingboardedgegate',
    platformId: 'hummingboard-edge-gate-40pin',
    sbcId: 'hummingboard-edge-gate',
    name: 'Hummingboard Edge / Gate',
    vendor: 'SolidRun',
    setupId: 'hummingboard_edge_sdl',
    tags: ['hummingboard', 'nxp-imx6', '40-pin'],
    setupIds: [
      { id: 'hummingboard_edge_sdl', label: 'Hummingboard Edge (i.MX6 Solo / Dual Lite)' },
      { id: 'hummingboard_gate_sdl', label: 'Hummingboard Gate (i.MX6 Solo / Dual Lite)' },
      { id: 'hummingboard_edge_dq', label: 'Hummingboard Edge (i.MX6 Dual / Quad)' },
      { id: 'hummingboard_gate_dq', label: 'Hummingboard Gate (i.MX6 Dual / Quad)' },
    ],
  },
  {
    slug: 'odroid/odroidc1',
    platformId: 'odroid-c1-40pin',
    sbcId: 'odroid-c1',
    name: 'Odroid C1',
    vendor: 'Hardkernel',
    setupId: 'odroidc1',
    tags: ['odroid', 'amlogic-s805', '40-pin'],
  },
  {
    slug: 'odroid/odroidc2',
    platformId: 'odroid-c2-40pin',
    sbcId: 'odroid-c2',
    name: 'Odroid C2',
    vendor: 'Hardkernel',
    setupId: 'odroidc2',
    tags: ['odroid', 'amlogic-s905', '40-pin'],
  },
  {
    slug: 'odroid/odroidxu4',
    platformId: 'odroid-xu4-30pin',
    sbcId: 'odroid-xu4',
    name: 'Odroid XU4',
    vendor: 'Hardkernel',
    setupId: 'odroidxu4',
    tags: ['odroid', 'samsung-exynos-5422', '30-pin'],
  },
  {
    slug: 'orangepi/orangepipc+',
    mergePlatformId: 'orangepi-h3-40pin',
    mergeSbcId: 'orange-pi-pc-plus',
    name: 'Orange Pi PC+',
    vendor: 'Orange Pi',
    setupId: 'orangepipc+',
    tags: ['orange-pi', 'allwinner-h5', '40-pin'],
  },
  {
    slug: 'orangepi/orangepipc2',
    mergePlatformId: 'orangepi-h5-40pin-pc2',
    mergeSbcId: 'orange-pi-pc-2',
    name: 'Orange Pi PC2',
    vendor: 'Orange Pi',
    setupId: 'orangepipc2',
    tags: ['orange-pi', 'allwinner-h3', '40-pin'],
  },
  {
    slug: 'pcduino/pcduino1',
    platformId: 'pcduino-1-40pin',
    sbcId: 'pcduino-1',
    name: 'PCDuino 1',
    vendor: 'LinkSprite',
    setupId: 'pcduino1',
    tags: ['pcduino', 'allwinner-a10', '40-pin'],
  },
  {
    slug: 'radxa/rock4',
    platformId: 'radxa-rock4-40pin',
    sbcId: 'radxa-rock4',
    name: 'Radxa ROCK 4 Series',
    vendor: 'Radxa',
    setupId: 'rock4',
    tags: ['radxa', 'rockchip-rk3399', '40-pin'],
    subModels: ['ROCK 4A/B/C', 'ROCK 4A+/B+ (OP1)', 'ROCK 4 SE', 'ROCK 4C+'],
  },
  {
    slug: 'raspberrypi/raspberrypi1b1',
    platformId: 'raspberry-pi-26pin-rev1',
    sbcId: 'raspberry-pi-1b-rev1',
    name: 'Raspberry Pi 1A and B Revision 1',
    vendor: 'Raspberry Pi',
    setupId: 'raspberrypi1b1',
    tags: ['raspberry-pi', 'bcm2835', '26-pin'],
  },
  {
    slug: 'raspberrypi/raspberrypi1b2',
    platformId: 'raspberry-pi-26pin-rev2',
    sbcId: 'raspberry-pi-1b-rev2',
    name: 'Raspberry Pi 1A and B Revision 2',
    vendor: 'Raspberry Pi',
    setupId: 'raspberrypi1b2',
    tags: ['raspberry-pi', 'bcm2835', '26-pin'],
  },
  {
    slug: 'raspberrypi/raspberrypi1b+',
    mergePlatformId: 'raspberry-pi-40pin',
    mergeSbcId: 'raspberry-pi-40pin',
    name: 'Raspberry Pi 1A+ and B+',
    vendor: 'Raspberry Pi',
    setupId: 'raspberrypi1b+',
    tags: ['raspberry-pi', 'bcm2835', '40-pin'],
  },
  {
    slug: 'raspberrypi/raspberrypi2',
    mergePlatformId: 'raspberry-pi-40pin',
    mergeSbcId: 'raspberry-pi-40pin',
    name: 'Raspberry Pi 2A and B',
    vendor: 'Raspberry Pi',
    setupId: 'raspberrypi2',
    tags: ['raspberry-pi', 'bcm2836', '40-pin'],
  },
  {
    slug: 'raspberrypi/raspberrypi3',
    mergePlatformId: 'raspberry-pi-40pin',
    mergeSbcId: 'raspberry-pi-40pin',
    name: 'Raspberry Pi 3A and B',
    vendor: 'Raspberry Pi',
    setupId: 'raspberrypi3',
    tags: ['raspberry-pi', 'bcm2836', '40-pin'],
  },
  {
    slug: 'raspberrypi/raspberrypi4',
    mergePlatformId: 'raspberry-pi-40pin',
    mergeSbcId: 'raspberry-pi-40pin',
    name: 'Raspberry Pi 4A and B',
    vendor: 'Raspberry Pi',
    setupId: 'raspberrypi4',
    tags: ['raspberry-pi', 'bcm2711', '40-pin'],
  },
  {
    slug: 'raspberrypi/raspberrypizero',
    mergePlatformId: 'raspberry-pi-40pin',
    mergeSbcId: 'raspberry-pi-40pin',
    name: 'Raspberry Pi Zero (W)',
    vendor: 'Raspberry Pi',
    setupId: 'raspberrypizero',
    tags: ['raspberry-pi', 'bcm2836', '40-pin'],
  },
];

function inferPinType(label) {
  const n = label.toLowerCase();
  if (n === '3.3v' || n === '+3.3v') return 'power3v3';
  if (n === '5v' || n === '+5v' || n === '5.0v') return 'power5v';
  if (n === '0v' || n === 'gnd') return 'ground';
  if (n === '2v') return 'power3v3';
  if (n === 'tx' || n === 'rx') return 'uart';
  if (n === 'ad' || n === 'pw' || n === '?') return 'gpio';
  return 'gpio';
}

function pinNameFromCell(label) {
  const n = label.toLowerCase();
  if (n === '3.3v') return '3.3V';
  if (n === '5v') return '5V';
  if (n === '0v') return 'GND';
  if (n === '2v') return '2V';
  if (n === '?') return 'Unknown';
  if (/^\d+$/.test(label)) return `GPIO${label}`;
  return label.toUpperCase();
}

function parseMetadata(html) {
  const socMatch = html.match(/System on Chip<\/td>\s*<td>([^<]+)<\/td>/i);
  const gpioMatch = html.match(/Number GPIO<\/td>\s*<td>(\d+)<\/td>/i);
  return {
    soc: socMatch?.[1]?.trim() ?? 'Unknown',
    wiringxGpioCount: gpioMatch ? Number(gpioMatch[1]) : undefined,
  };
}

function parseDocutilsTables(html) {
  const tables = [];
  for (const match of html.matchAll(/<table border="1" class="docutils">([\s\S]*?)<\/table>/g)) {
    const rows = [];
    for (const rowMatch of match[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
      const cells = [...rowMatch[1].matchAll(/<td[^>]*>([^<]*)<\/td>/g)].map((c) =>
        c[1].trim(),
      );
      if (cells.length > 0) rows.push(cells);
    }
    if (rows.length >= 2) tables.push(rows);
  }
  return tables;
}

function tableToPins(rows) {
  const evenRow = rows[0];
  const oddRow = rows[1];
  const cols = Math.min(evenRow.length, oddRow.length);
  const pins = [];
  for (let c = 0; c < cols; c++) {
    pins.push(cellToPin(c * 2 + 1, oddRow[c]));
    pins.push(cellToPin(c * 2 + 2, evenRow[c]));
  }
  return pins.sort((a, b) => a.physical - b.physical);
}

function cellToPin(physical, cell) {
  const pin = { physical, name: pinNameFromCell(cell), type: inferPinType(cell) };
  if (/^\d+$/.test(cell)) {
    pin.gpioNumber = Number(cell);
    pin.bankName = `wiringX ${cell}`;
  }
  if (cell === '?') pin.notes = 'Unmapped in wiringX manual';
  return pin;
}

function isGpioLikeCell(cell) {
  return /^(0v|3\.3v|5v|2v|\d+|\?|tx|rx|ad|pw)$/i.test(cell);
}

function scoreGpioTable(rows) {
  if (rows.length !== 2) return -Infinity;
  const cols = Math.min(rows[0].length, rows[1].length);
  if (cols < 10) return -Infinity;
  const cells = rows.flat();
  const ratio = cells.filter(isGpioLikeCell).length / cells.length;
  if (ratio < 0.5) return -Infinity;
  let score = ratio * 100;
  if (cols === 13 || cols === 20) score += 50;
  if (cols === 15) score += 40;
  return score;
}

function pickMainTable(tables) {
  let best = null;
  let bestScore = -Infinity;
  for (const table of tables) {
    const score = scoreGpioTable(table);
    if (score > bestScore) {
      bestScore = score;
      best = table;
    }
  }
  return bestScore > 30 ? best : null;
}

function stubPins(pinCount, note) {
  const pins = [];
  for (let i = 1; i <= pinCount; i++) {
    pins.push({
      physical: i,
      name: `PIN${i}`,
      type:
        i === 1 ? 'power3v3' : i === 2 ? 'power5v' : i === 6 ? 'ground' : 'gpio',
      ...(note ? { notes: note } : {}),
    });
  }
  return pins;
}

function defaultPinCount(platformId) {
  if (platformId.includes('26pin')) return 26;
  if (platformId.includes('30pin')) return 30;
  return 40;
}

function buildPlatformJson(device, pins, stubbed) {
  const platformId = device.platformId;
  const pinCount = pins.length;
  const docUrl = `${manualBase}/platforms/${device.slug}.html`;

  return {
    id: platformId,
    name: `${device.name} GPIO Header`,
    shortName: device.name,
    pinCount,
    orientationHint:
      'USB/ports toward you — odd pins on the left column, even on the right (wiringX manual layout)',
    documentationUrl: docUrl,
    notes: stubbed
      ? 'wiringX manual uses a non-standard GPIO Mapping layout — placeholder header.'
      : 'Pinout from wiringX manual GPIO Mapping table.',
    gpioNumberLabel: 'wiringX GPIO',
    formFactor: {
      widthMm: pinCount >= 40 ? 85 : 65,
      heightMm: pinCount >= 40 ? 56 : 32,
      label: pinCount >= 40 ? '40-pin header' : pinCount >= 30 ? '30-pin header' : '26-pin header',
      gpioHeader: { pin1: { x: 1.27, y: 0 }, pitchMm: 2.54, columns: 2, rows: pinCount / 2 },
      notes: `Documented on wiringX manual for ${device.name}.`,
    },
    pins,
  };
}

function buildWiringXMeta(device, meta) {
  return {
    setupId: device.setupId,
    documentationPath: `/platforms/${device.slug}.html`,
    ...(meta.wiringxGpioCount !== undefined ? { wiringxGpioCount: meta.wiringxGpioCount } : {}),
    ...(device.setupIds ? { alternateSetupIds: device.setupIds.map((s) => s.id) } : {}),
  };
}

function buildSbcEntry(device, meta) {
  const docUrl = `${manualBase}/platforms/${device.slug}.html`;
  let description = `GPIO header on ${device.name} (${meta.soc}). Supported by wiringX — use wiringXSetup("${device.setupId}").`;
  if (device.subModels?.length) description += ` Covers ${device.subModels.join(', ')}.`;
  if (device.setupIds?.length) {
    description += ` Also: ${device.setupIds.map((s) => s.id).join(', ')}.`;
  }

  const headerPin =
    device.platformId?.includes('26pin') ? '26-pin' : device.platformId?.includes('30pin') ? '30-pin' : '40-pin';

  return {
    id: device.sbcId,
    platformId: device.platformId,
    name: `${device.name} GPIO Header`,
    shortName: device.name,
    vendor: device.vendor,
    description,
    documentationUrl: docUrl,
    tags: [...device.tags, 'wiringx'],
    hardware: {
      soc: meta.soc,
      socFamily: meta.soc.split(' ')[0],
      formFactor: `${headerPin} header`,
    },
    specifications: {
      gpioHeader: headerPin,
      gpioNumbering: 'wiringX GPIO',
      interface: ['GPIO', 'I2C', 'SPI', 'UART'],
    },
    wiringX: buildWiringXMeta(device, meta),
  };
}

function mergeOverlay(existing, incoming) {
  const primarySetupId = existing?.setupId ?? incoming.setupId;
  const alternate = new Set([
    ...(existing?.alternateSetupIds ?? []),
    ...(existing?.setupId && existing.setupId !== primarySetupId ? [existing.setupId] : []),
    ...(incoming.alternateSetupIds ?? []),
    ...(incoming.setupId !== primarySetupId ? [incoming.setupId] : []),
  ]);
  alternate.delete(primarySetupId);

  return {
    setupId: primarySetupId,
    documentationPath: existing?.documentationPath ?? incoming.documentationPath,
    wiringxGpioCount: incoming.wiringxGpioCount ?? existing?.wiringxGpioCount,
    ...(alternate.size > 0 ? { alternateSetupIds: [...alternate].sort() } : {}),
  };
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

function regeneratePlatformsTs() {
  const platformFiles = fs.readdirSync(platformsDir).filter((f) => f.endsWith('.json')).sort();
  const imports = platformFiles.map((file) => {
    const varName = platformImportName(file);
    return `import ${varName} from '../config/platforms/${file}';`;
  });
  const vars = platformFiles.map((file) => platformImportName(file));
  fs.writeFileSync(
    path.join(root, 'src/hardware/platforms.ts'),
    `import type { GpioPlatform } from './types';

${imports.join('\n')}

export const PLATFORM_CONFIGS: readonly GpioPlatform[] = [
${vars.map((v) => `  ${v} as GpioPlatform,`).join('\n')}
].sort((a, b) => a.id.localeCompare(b.id));
`,
  );
  return platformFiles.length;
}

async function main() {
  const sbcs = [];
  const overlayMap = new Map();
  const wiringxPlatformIds = new Set();

  for (const device of DEVICE_PAGES) {
    const url = `${manualBase}/platforms/${device.slug}.html`;
    const html = await fetch(url).then((r) => {
      if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`);
      return r.text();
    });
    const meta = parseMetadata(html);
    const wiringX = buildWiringXMeta(device, meta);

    if (device.mergeSbcId) {
      const platformId = device.mergePlatformId;
      if (platformId) wiringxPlatformIds.add(platformId);
      const prev = overlayMap.get(device.mergeSbcId);
      overlayMap.set(device.mergeSbcId, mergeOverlay(prev, wiringX));
      console.log(`Overlay ${device.setupId} → SBC "${device.mergeSbcId}"`);
      continue;
    }

    wiringxPlatformIds.add(device.platformId);

    const tables = parseDocutilsTables(html);
    const mainTable = tables.length > 0 ? pickMainTable(tables) : null;
    let pins;
    let stubbed = false;

    if (mainTable) {
      pins = tableToPins(mainTable);
    } else {
      stubbed = true;
      pins = stubPins(
        defaultPinCount(device.platformId),
        'Non-standard wiringX manual layout — see GPIO Mapping on the device page.',
      );
      console.warn(`Stub platform ${device.platformId}`);
    }

    fs.writeFileSync(
      path.join(platformsDir, `${device.platformId}.json`),
      JSON.stringify(buildPlatformJson(device, pins, stubbed), null, 2) + '\n',
    );
    console.log(`Platform ${device.platformId}: ${pins.length} pins (${meta.soc})`);
    sbcs.push(buildSbcEntry(device, meta));
  }

  fs.writeFileSync(
    path.join(root, 'src/config/wiringx-sbcs.json'),
    JSON.stringify({ sbcs }, null, 2) + '\n',
  );
  fs.writeFileSync(
    path.join(root, 'src/config/wiringx-overlays.json'),
    JSON.stringify({ overlays: [...overlayMap.entries()].map(([sbcId, wiringX]) => ({ sbcId, wiringX })) }, null, 2) + '\n',
  );
  console.log(`Wrote ${sbcs.length} new SBC entries, ${overlayMap.size} overlays`);

  for (const file of fs.readdirSync(platformsDir)) {
    if (!file.startsWith('wiringx-') || !file.endsWith('.json')) continue;
    fs.unlinkSync(path.join(platformsDir, file));
    console.log(`Removed legacy platform ${file.replace('.json', '')}`);
  }

  console.log(`Updated src/hardware/platforms.ts (${regeneratePlatformsTs()} platforms)`);

  const registry = JSON.parse(fs.readFileSync(path.join(root, 'src/config/hardware-registry.json'), 'utf8'));
  const wiringxLib = registry.gpioLibraries?.find((l) => l.id === 'wiringx');
  if (wiringxLib) {
    wiringxLib.documentationUrl = manualBase;
    wiringxLib.supportedPlatformIds = [...wiringxPlatformIds].sort();
    wiringxLib.notes = `${DEVICE_PAGES.length} boards from wiringX 7.0 manual — merged with existing catalog entries where duplicated.`;
  }
  fs.writeFileSync(path.join(root, 'src/config/hardware-registry.json'), JSON.stringify(registry, null, 2) + '\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
