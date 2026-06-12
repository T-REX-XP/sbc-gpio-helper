import fs from 'fs';
const line = fs.readFileSync('tmp-wiringPi.c', 'utf8').split('\n').find((l) => l.includes('orangepi3.'));
console.log(JSON.stringify(line));
const m = line.match(/strncmp\(revision,\s*"([^"]+)"[^;]+;\s*\*model\s*=\s*(PI_MODEL_\w+)/);
console.log(m);
