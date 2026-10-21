import { readFile, writeFile, unlink } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

// Lighthouse's raw protocol log can contain an anonymous bearer-session cookie.
// Retain diagnostic timing without publishing credentials in the evidence.
const privateHeader = /^(?:cookie|set-cookie|authorization|proxy-authorization|x-csrf-token)$/i;
const scrub = (value) => {
  if (Array.isArray(value)) return value.map(scrub);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        privateHeader.test(key) ? '[REDACTED]' : scrub(item)
      ])
    );
  if (typeof value === 'string')
    return value.replace(
      /^(cookie|set-cookie|authorization|proxy-authorization|x-csrf-token):[^\r\n]*/gim,
      '$1: [REDACTED]'
    );
  return value;
};

for (const suffix of ['trace', 'devtoolslog']) {
  const path = `docs/evidence/lighthouse-home-0.${suffix}.json`;
  const sanitized = JSON.stringify(scrub(JSON.parse(await readFile(path, 'utf8'))));
  await writeFile(`${path}.gz`, gzipSync(sanitized));
  await unlink(path);
  console.log(`Retained sanitized ${suffix} in ${path}.gz`);
}
