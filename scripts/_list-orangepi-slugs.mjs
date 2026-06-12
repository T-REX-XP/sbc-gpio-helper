const html = await (await fetch('http://www.orangepi.org/html/hardWare/computerAndMicrocontrollers/index.html')).text();
const links = [...html.matchAll(/details\/(Orange-Pi-[^"']+)\.html/gi)].map((m) => m[1]);
console.log([...new Set(links)].sort().join('\n'));
