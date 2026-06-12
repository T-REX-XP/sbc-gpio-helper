/**
 * Print Supported hardware markdown for README (stdout).
 * Includes SBC tables, GPIO library details, and pinout profile summary.
 * Run: node scripts/print-readme-hardware.mjs
 */
import fs from 'fs';
import path from 'path';
import hardwareRegistry from '../src/config/hardware-registry.json' with { type: 'json' };
import wiringOpSbcs from '../src/config/wiringop-sbcs.json' with { type: 'json' };
import wiringxSbcs from '../src/config/wiringx-sbcs.json' with { type: 'json' };

const root = path.resolve(import.meta.dirname, '..');
const platformsDir = path.join(root, 'src/config/platforms');

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
  return [...byId.values()].sort((a, b) =>
    (a.shortName ?? a.name).localeCompare(b.shortName ?? b.name),
  );
}

function headerLabel(sbc) {
  return sbc.specifications?.gpioHeader ?? (sbc.platformId.includes('26pin') ? '26-pin' : '40-pin');
}

function groupByVendor(sbcs) {
  const map = new Map();
  for (const sbc of sbcs) {
    const vendor = sbc.vendor;
    if (!map.has(vendor)) map.set(vendor, []);
    map.get(vendor).push(sbc);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

const sbcs = collectSbcs();
const platformFiles = fs.readdirSync(platformsDir).filter((f) => f.endsWith('.json')).sort();
const curatedIds = new Set(hardwareRegistry.sbcs.map((s) => s.id));
const wiringOpOnly = sbcs.filter((s) => s.wiringOp && !curatedIds.has(s.id));
const wiringxOnly = sbcs.filter((s) => s.wiringX && !s.wiringOp && !curatedIds.has(s.id));
const curated = hardwareRegistry.sbcs;

console.log(`Catalog totals: **${sbcs.length} SBCs** · **${hardwareRegistry.hats.length} HATs** · **${hardwareRegistry.gpioLibraries.length} GPIO libraries** · **${platformFiles.length} pinout profiles**`);
console.log('');
console.log('### Curated SBCs');
console.log('');
console.log('| Board | Header | GPIO numbering | SoC |');
console.log('|-------|--------|----------------|-----|');
for (const sbc of curated) {
  const name = sbc.shortName ?? sbc.name.replace(/ GPIO Header$/, '');
  const header = sbc.specifications?.gpioHeader ?? '—';
  const num = sbc.specifications?.gpioNumbering ?? '—';
  const soc = sbc.hardware?.soc ?? '—';
  console.log(`| ${name} | ${header} | ${num} | ${soc} |`);
}

console.log('');
console.log(`### Orange Pi (${wiringOpOnly.length} boards, [wiringOP](https://github.com/orangepi-xunlong/wiringOP))`);
console.log('');
console.log('Pinouts use wiringOP wPi numbering where documented in the wiringOP README; stub profiles pending for newer boards.');
console.log('');
for (const sbc of wiringOpOnly) {
  const name = sbc.shortName ?? sbc.name.replace(/ GPIO Header$/, '');
  console.log(`- ${name} (${headerLabel(sbc)}, ${sbc.hardware?.soc ?? '—'})`);
}

console.log('');
console.log('### Other SBCs ([wiringX manual](https://manual.wiringx.org/) and curated overlap)');
console.log('');
for (const [vendor, items] of groupByVendor(wiringxOnly)) {
  console.log(`**${vendor}**`);
  for (const sbc of items) {
    const name = sbc.shortName ?? sbc.name.replace(/ GPIO Header$/, '');
    console.log(`- ${name} (${headerLabel(sbc)}, ${sbc.hardware?.soc ?? '—'})`);
  }
  console.log('');
}

console.log('### Display HATs');
console.log('');
console.log('| HAT | Vendor | Platform | Interface |');
console.log('|-----|--------|----------|-----------|');
for (const hat of hardwareRegistry.hats) {
  const name = hat.shortName ?? hat.name;
  const iface = hat.specifications?.interface
    ? Array.isArray(hat.specifications.interface)
      ? hat.specifications.interface.join(', ')
      : hat.specifications.interface
    : '—';
  console.log(`| ${name} | ${hat.vendor} | ${hat.platformId} | ${iface} |`);
}

console.log('');
console.log('### Supported GPIO libraries');
console.log('');
console.log('The [hardware registry](https://t-rex-xp.github.io/sbc-gpio-helper/registry?category=libraries) lists each library with maintainer, languages, and which pinout profiles in this project are tagged as compatible.');
console.log('');
console.log('| Library | Languages | WiringPi API | Pinout profiles |');
console.log('|---------|-----------|--------------|-----------------|');
for (const lib of hardwareRegistry.gpioLibraries) {
  const langs = lib.languages.join(', ');
  const compat =
    lib.wiringPiCompatibility === 'high'
      ? 'High'
      : lib.wiringPiCompatibility === 'moderate'
        ? 'Moderate'
        : lib.wiringPiCompatibility === 'low'
          ? 'Low'
          : 'None';
  console.log(
    `| [${lib.name}](${lib.repositoryUrl}) | ${langs} | ${compat} | ${lib.supportedPlatformIds.length} |`,
  );
}
console.log('');

for (const lib of hardwareRegistry.gpioLibraries) {
  const compat =
    lib.wiringPiCompatibility === 'high'
      ? 'High'
      : lib.wiringPiCompatibility === 'moderate'
        ? 'Moderate'
        : lib.wiringPiCompatibility === 'low'
          ? 'Low'
          : 'None (kernel gpiochip API)';
  console.log(`#### ${lib.name}`);
  console.log('');
  console.log(`${lib.description}`);
  console.log('');
  console.log(`- **Maintainer:** ${lib.maintainer}`);
  console.log(`- **Primary targets:** ${lib.primaryTargets}`);
  console.log(`- **Languages:** ${lib.languages.join(', ')}`);
  console.log(`- **WiringPi API compatibility:** ${compat}`);
  console.log(`- **Best for:** ${lib.bestFor}`);
  console.log(`- **Documentation:** [${lib.documentationUrl ?? lib.repositoryUrl}](${lib.documentationUrl ?? lib.repositoryUrl})`);
  if (lib.additionalUrls?.length) {
    for (const link of lib.additionalUrls) {
      console.log(`- **${link.label}:** [${link.url}](${link.url})`);
    }
  }
  if (lib.notes) {
    console.log(`- **Notes:** ${lib.notes}`);
  }
  console.log(`- **Supported pinout profiles (${lib.supportedPlatformIds.length}):** ${lib.supportedPlatformIds.map((id) => `\`${id}\``).join(', ')}`);
  console.log('');
}

console.log(`### Pinout profiles (${platformFiles.length})`);
console.log('');
console.log('Each file under [`src/config/platforms/`](src/config/platforms/) defines physical pin layout, SPI buses, and form factor for one header profile. Multiple SBCs can share a profile (e.g. several Orange Pi H3 boards use `orangepi-h3-40pin.json`).');
console.log('');
const orangepi = platformFiles.filter((f) => f.startsWith('orangepi-'));
const other = platformFiles.filter((f) => !f.startsWith('orangepi-'));
console.log(`- **Orange Pi / wiringOP:** ${orangepi.length} profiles`);
console.log(`- **Other vendors:** ${other.length} profiles (${other.map((f) => f.replace('.json', '')).join(', ')})`);
