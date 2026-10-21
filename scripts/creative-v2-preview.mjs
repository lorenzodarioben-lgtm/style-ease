import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const types = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webm': 'video/webm'
};
http
  .createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1:4174');
    let relative =
      url.pathname === '/'
        ? 'docs/creative-v2/concepts.html'
        : decodeURIComponent(url.pathname).slice(1);
    if (
      !(relative.startsWith('assets/') || relative.startsWith('docs/creative-v2/')) ||
      relative.includes('..') ||
      !types[path.extname(relative)]
    ) {
      res.writeHead(404);
      res.end();
      return;
    }
    try {
      const bytes = await readFile(path.join(root, relative));
      res.writeHead(200, {
        'Content-Type': types[path.extname(relative)],
        'Cache-Control': 'no-store'
      });
      res.end(bytes);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  })
  .listen(4174, '127.0.0.1', () => console.log('Creative laboratory: http://127.0.0.1:4174'));
