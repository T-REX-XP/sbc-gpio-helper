for (const url of [
  'https://docs.radxa.com/en/zero/zero',
  'https://docs.radxa.com/en/zero/zero3',
]) {
  const html = await (await fetch(url)).text();
  const imgs = [...html.matchAll(/\/img\/[^"'\s>]+\.(png|jpg|webp)/gi)].map((m) => m[0]);
  console.log(url, '\n ', [...new Set(imgs)].slice(0, 10).join('\n  '), '\n');
}
