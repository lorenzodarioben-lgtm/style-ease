import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const assetsDirectory = path.resolve(currentDirectory, '../dist/assets');
const budgets = [
  { label: 'Initial JavaScript', suffix: '.js', maximumBytes: 85 * 1024 },
  { label: 'Initial CSS', suffix: '.css', maximumBytes: 7 * 1024 }
];

function formatKilobytes(bytes) {
  return (bytes / 1024).toFixed(2) + ' KiB';
}

async function getInitialAsset(suffix) {
  var files = await readdir(assetsDirectory);
  var file = files.find(function (candidate) {
    return candidate.startsWith('index-') && candidate.endsWith(suffix);
  });

  if (!file) {
    throw new Error(
      'Could not find the initial ' + suffix + ' asset in dist/assets. Build the app first.'
    );
  }

  return { file: file, contents: await readFile(path.join(assetsDirectory, file)) };
}

for (const budget of budgets) {
  var asset = await getInitialAsset(budget.suffix);
  var compressedSize = gzipSync(asset.contents).byteLength;
  var message =
    budget.label +
    ': ' +
    formatKilobytes(compressedSize) +
    ' gzip (budget ' +
    formatKilobytes(budget.maximumBytes) +
    ')';

  if (compressedSize > budget.maximumBytes) {
    console.error('Bundle budget exceeded — ' + message);
    process.exitCode = 1;
  } else {
    console.log(message);
  }
}
