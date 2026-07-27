/**
 * Hiệu chỉnh `minutes` và `practiceMinutes` cho mọi bài học từ nội dung THẬT.
 *
 * Vì sao cần script này: hai con số đó là một lời hứa với người học (khoá
 * `home.p6d` nói thẳng "thời lượng ghi trên mỗi bài là thật"), và bộ lập kế
 * hoạch ngày dùng chúng để chia quỹ thời gian. Ước chừng bằng tay trôi rất
 * nhanh — trước khi có script này, `minutes` ngụ ý 152 từ/phút và bỏ qua sạch
 * 37 lượt lab cùng 540 câu hỏi.
 *
 * Chạy: node scripts/calibrate-minutes.mjs [--dry]
 *
 * Không thêm phụ thuộc nào: nạp TypeScript bằng chính Vite đã có trong dự án.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createServer } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dry = process.argv.includes('--dry');

/* -------------------------------------------------------------------------- */
/*  Bảng tra                                                                   */
/* -------------------------------------------------------------------------- */

/** Chặng → tệp chứa nó. Tra theo chặng chứ không theo tiền tố id: t4-l1 và
 *  t4-l2 mang id chặng 4 nhưng sống trong tệp chặng 2 (xem chú thích đầu
 *  t2-du-lieu.ts). Suy tệp từ id bài sẽ ghi nhầm chỗ. */
const FILE_OF = {
  'khoi-dong': 't0-khoi-dong.ts',
  'nen-mong': 't1-nen-mong.ts',
  'du-lieu': 't2-du-lieu.ts',
  'ml-cot-loi': 't3-ml-cot-loi.ts',
  'do-luong': 't4-do-luong.ts',
  'dac-trung': 't5-dac-trung.ts',
  'ung-dung': 't6-ung-dung.ts',
  'deep-learning': 't7-deep-learning.ts',
  adversarial: 't8-adversarial.ts',
  'llm-genai': 't9-llm.ts',
  'van-hanh': 't10-van-hanh.ts',
};


/* -------------------------------------------------------------------------- */
/*  Ghi lại vào mã nguồn                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Sửa theo dòng chứ không bằng một biểu thức chính quy trên cả tệp: nội dung
 * bài có rất nhiều chuỗi chứa dấu ngoặc và số, và một regex tham lam sẽ ăn
 * nhầm vào giữa một đoạn markdown.
 */
function rewrite(file, byId) {
  const raw = readFileSync(file, 'utf8');
  // Giữ nguyên kiểu xuống dòng của tệp: ghi lại bằng '\n' trên máy Windows sẽ
  // biến toàn bộ tệp thành một khối khác biệt khổng lồ trong git diff.
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);
  const out = [];
  let changed = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    out.push(line);

    const m = /^ {6}id: '([^']+)',$/.exec(line);
    if (!m || !byId.has(m[1])) continue;
    const want = byId.get(m[1]);

    // Trong vài dòng kế tiếp phải có `minutes:`; nếu không thì cấu trúc đã đổi
    // và ta dừng hẳn thay vì đoán bừa.
    let j = i + 1;
    let found = -1;
    for (; j < Math.min(i + 10, lines.length); j++) {
      if (/^ {6}minutes: \d+,$/.test(lines[j])) { found = j; break; }
    }
    if (found < 0) throw new Error(`Không thấy dòng minutes của bài ${m[1]} trong ${file}`);

    for (let k = i + 1; k < found; k++) out.push(lines[k]);
    out.push(`      minutes: ${want.reading},`);
    out.push(`      practiceMinutes: ${want.practice},`);

    // Bỏ qua dòng practiceMinutes cũ nếu đã có, để không nhân đôi.
    let skipTo = found;
    if (/^ {6}practiceMinutes: \d+,$/.test(lines[found + 1] ?? '')) skipTo = found + 1;
    i = skipTo;
    changed++;
  }
  return { text: out.join(eol), changed };
}

/* -------------------------------------------------------------------------- */

const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
let TRACKS;
let estimate;
try {
  ({ TRACKS } = await server.ssrLoadModule('/src/content/index.ts'));
  // Mô hình thời gian nằm ở src/content/reading-time.ts để content.test.ts dùng
  // chung — chép sang đây thì bài kiểm thử sẽ trôi theo script và mất tác dụng.
  ({ estimate } = await server.ssrLoadModule('/src/content/reading-time.ts'));
} finally {
  await server.close();
}

const rows = [];
const byFile = new Map();
let totRead = 0;
let totPrac = 0;
let totOld = 0;

for (const tr of TRACKS) {
  for (const l of tr.lessons) {
    const t = estimate(l);
    totRead += t.reading;
    totPrac += t.practice;
    totOld += l.minutes;
    rows.push({ id: l.id, old: l.minutes, ...t });
    // Bài có thể nằm ở tệp của chặng khác (t4-l1 và t4-l2 sống trong tệp chặng 2),
    // nên tra theo tiền tố id là SAI. Gom theo tệp của chặng đang chứa nó.
    const file = FILE_OF[tr.id];
    if (!file) throw new Error(`Chưa biết tệp của chặng ${tr.id}`);
    if (!byFile.has(file)) byFile.set(file, new Map());
    byFile.get(file).set(l.id, t);
  }
}

let totalChanged = 0;
for (const [file, byId] of byFile) {
  const path = resolve(root, 'src/content', file);
  const { text, changed } = rewrite(path, byId);
  totalChanged += changed;
  if (changed !== byId.size) throw new Error(`${file}: sửa ${changed} bài nhưng cần ${byId.size}`);
  if (!dry) writeFileSync(path, text, 'utf8');
}

const pad = (s, n) => String(s).padStart(n);
console.log('id            cũ →  đọc  làm   tổng   (từ / dòng mã / lab / câu)');
for (const r of rows) {
  console.log(
    `${r.id.padEnd(12)} ${pad(r.old, 3)} → ${pad(r.reading, 4)} ${pad(r.practice, 4)} ${pad(r.reading + r.practice, 6)}   ` +
    `${pad(r.prose, 5)} / ${pad(r.codeLines, 3)} / ${pad(r.labs, 2)} / ${pad(r.questions, 3)}`,
  );
}
console.log(
  `\n${rows.length} bài${dry ? ' (chạy thử, không ghi)' : `, đã ghi ${totalChanged}`}. ` +
  `Cũ ${totOld} phút → đọc ${totRead} + làm ${totPrac} = ${totRead + totPrac} phút.`,
);
