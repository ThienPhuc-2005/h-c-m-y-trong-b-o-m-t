/**
 * Đo tương phản WCAG cho các bảng màu trong tokens.css.
 *
 * Vì sao cần script này: bảng màu được viết bằng mắt, và mắt không đo được
 * tỉ số tương phản. Chủ đề "Vàng ấm" ra đời sau chủ đề tối, nên nếu không đo
 * thì rất dễ có một cặp chữ/nền tụt xuống dưới AA mà chẳng ai thấy — cho tới
 * khi một người học đọc trên màn hình rẻ ngoài trời.
 *
 * Chạy: node scripts/check-contrast.mjs [tên-chủ-đề...]
 */
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

function block(selector) {
  const i = css.indexOf(selector);
  if (i < 0) throw new Error(`không thấy khối ${selector}`);
  const open = css.indexOf('{', i);
  const close = css.indexOf('\n}', open);
  const body = css.slice(open, close);
  const vars = {};
  for (const m of body.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) vars[m[1]] = m[2];
  return vars;
}

const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const hue = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (!d) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return Math.round(((h * 60) + 360) % 360);
};

/** Cặp (chữ, nền, ngưỡng) cần kiểm cho mọi chủ đề. */
const PAIRS = [
  ['--text', '--bg', 4.5], ['--text', '--bg-elev', 4.5], ['--text', '--bg-sunken', 4.5],
  ['--text-muted', '--bg', 4.5], ['--text-muted', '--bg-elev', 4.5],
  ['--text-faint', '--bg', 4.5], ['--text-faint', '--bg-elev', 4.5], ['--text-faint', '--bg-sunken', 4.5],
  ['--brand-text', '--brand-soft', 4.5], ['--ok-text', '--ok-soft', 4.5],
  ['--bad-text', '--bad-soft', 4.5], ['--warn-text', '--warn-soft', 4.5],
  ['--info-text', '--info-soft', 4.5], ['--lab-text', '--lab-soft', 4.5],
  ['--text-faint', '--warn-soft', 4.5], ['--text-faint', '--ok-soft', 4.5],
  ['--text-faint', '--bad-soft', 4.5], ['--text-faint', '--info-soft', 4.5],
  ['--text-faint', '--brand-soft', 4.5],
  // Màu nhấn dùng cho nét vẽ, thanh, chấm: ngưỡng 3,0 cho thành phần phi văn bản
  ['--brand', '--bg', 3], ['--ok', '--bg', 3], ['--bad', '--bg', 3],
  ['--warn', '--bg', 3], ['--info', '--bg', 3], ['--lab', '--bg', 3],
  ['--border-strong', '--bg', 1.4],
];

/** Các cặp màu ngữ nghĩa PHẢI phân biệt được bằng hue, không chỉ bằng tên. */
const HUE_GAP = [['--brand', '--warn', 20], ['--warn', '--bad', 20], ['--ok', '--info', 20]];

const themes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['light', 'dark', 'gold'];

let fail = 0;
for (const name of themes) {
  const sel = name === 'light' ? "[data-theme='light']" : `[data-theme='${name}']`;
  const v = block(sel);
  console.log(`\n=== ${name} ===`);
  for (const [fg, bg, min] of PAIRS) {
    if (!v[fg] || !v[bg]) { console.log(`  ? thiếu ${fg} hoặc ${bg}`); continue; }
    const r = ratio(v[fg], v[bg]);
    const ok = r >= min;
    if (!ok) fail++;
    console.log(`  ${ok ? 'ok  ' : 'TRƯỢT'} ${fg} trên ${bg}: ${r.toFixed(2)} (cần ${min})`);
  }
  for (const [a, b, gap] of HUE_GAP) {
    if (!v[a] || !v[b]) continue;
    let d = Math.abs(hue(v[a]) - hue(v[b]));
    if (d > 180) d = 360 - d;
    const ok = d >= gap;
    if (!ok) fail++;
    console.log(`  ${ok ? 'ok  ' : 'TRƯỢT'} cách hue ${a} ↔ ${b}: ${d}° (cần ${gap}°)`);
  }
}
console.log(fail ? `\n${fail} cặp KHÔNG đạt` : '\nTất cả đạt');
process.exit(fail ? 1 : 0);
