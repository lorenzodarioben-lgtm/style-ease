import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir, readdir, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root = 'docs/creative-v2/evidence/motion';
const clips = JSON.parse(await readFile(`${root}/clips.json`));
await mkdir(`${root}/decoded`, { recursive: true });
const cache = path.dirname(path.dirname(path.dirname(chromium.executablePath())));
const filename =
  process.platform === 'win32'
    ? 'ffmpeg-win64.exe'
    : process.platform === 'darwin'
      ? 'ffmpeg-mac'
      : 'ffmpeg-linux';
const candidates = (await readdir(cache))
  .filter((name) => /^ffmpeg-\d+$/.test(name))
  .sort()
  .reverse();
let ffmpeg = process.env.FFMPEG_PATH;
for (const name of candidates) {
  if (ffmpeg) break;
  const candidate = path.join(cache, name, filename);
  try {
    await access(candidate);
    ffmpeg = candidate;
  } catch {
    /* Try the next installed bundled decoder. */
  }
}
if (!ffmpeg)
  throw Error('Set FFMPEG_PATH to an existing FFmpeg with VP9 decoding and PNG encoding.');
const results = [];
for (const clip of clips) {
  const file = `${root}/${clip.name}.webm`;
  const probe = spawnSync(ffmpeg, ['-i', file], { encoding: 'utf8' }).stderr;
  const match = probe.match(/Duration: (\d+):(\d+):([\d.]+)/);
  if (!match) throw Error(`No duration for ${file}`);
  const duration = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
  const frames = [];
  for (const [i, fraction] of [0.2, 0.5, 0.8].entries()) {
    const frame = `${clip.name}-${i}.png`;
    const result = spawnSync(
      ffmpeg,
      [
        '-y',
        '-ss',
        String(duration * fraction),
        '-i',
        file,
        '-frames:v',
        '1',
        '-c:v',
        'png',
        `${root}/decoded/${frame}`
      ],
      { encoding: 'utf8' }
    );
    if (result.status !== 0) throw Error(result.stderr);
    frames.push(frame);
  }
  results.push({
    name: clip.name,
    duration,
    width: clip.width,
    height: clip.width < 600 ? 844 : 900,
    method: 'bundled FFmpeg VP9 decoder / PNG encoder',
    frames
  });
}
await writeFile(`${root}/decoded/qa.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
