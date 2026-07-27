/**
 * Chạy sau `vite build`: nhúng danh sách tệp thật và phiên bản vào service worker.
 *
 * Vì sao không hard-code danh sách trong sw.js: tên tệp có băm nội dung nên đổi
 * sau mỗi lần build. Một danh sách viết tay sẽ lặng lẽ trỏ vào tệp không còn tồn
 * tại, và người học mất khả năng dùng ngoại tuyến mà không có dấu hiệu nào báo.
 *
 * Phiên bản cache lấy từ chính nội dung các tệp: build không đổi gì thì phiên bản
 * không đổi, nên trình duyệt không phải tải lại vô cớ.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';

const DIST = 'dist';

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const files = walk(DIST)
  .map((p) => relative(DIST, p).split('\\').join('/'))
  // Không tự nạp chính service worker vào cache của nó.
  .filter((p) => p !== 'sw.js');

const precache = ['./', ...files.map((f) => `./${f}`)];

const hash = createHash('sha256');
for (const f of files.sort()) hash.update(f).update(readFileSync(join(DIST, f)));
const version = hash.digest('hex').slice(0, 12);

const swPath = join(DIST, 'sw.js');
const src = readFileSync(swPath, 'utf8');
const injected =
  `self.__PRECACHE__ = ${JSON.stringify(precache)};\n` +
  `self.__SW_VERSION__ = ${JSON.stringify(version)};\n` +
  src;
writeFileSync(swPath, injected);

const bytes = files.reduce((s, f) => s + statSync(join(DIST, f)).size, 0);
console.log(
  `service worker: ${precache.length} tệp được nạp sẵn (${(bytes / 1024 / 1024).toFixed(2)} MB), phiên bản ${version}`,
);
