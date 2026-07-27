/** Tiện ích dùng chung. */

export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export const pct = (x: number, digits = 0) => `${(x * 100).toFixed(digits)}%`;

/** Bộ sinh số giả ngẫu nhiên tất định — để bài lab tái lập được kết quả. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Phân phối chuẩn (Box–Muller). */
export function gaussian(rng: () => number, mean = 0, sd = 1): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Xáo trộn Fisher–Yates (không sửa mảng gốc). */
export function shuffle<T>(arr: readonly T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Chuẩn hoá chuỗi để so khớp đáp án tự luận ngắn:
 * bỏ dấu tiếng Việt, hạ chữ thường, gom khoảng trắng, bỏ dấu câu.
 * Người học gõ "roc auc" phải khớp với "ROC-AUC".
 */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Khoảng cách Levenshtein — chấp nhận lỗi gõ nhẹ khi chấm tự luận ngắn. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Đáp án tự luận có được chấp nhận không (khoan dung với lỗi chính tả nhỏ). */
export function acceptsAnswer(input: string, accepted: string[]): boolean {
  const got = normalize(input);
  if (!got) return false;
  return accepted.some((a) => {
    const want = normalize(a);
    if (got === want) return true;
    if (want.length > 6 && got.includes(want)) return true;
    const tol = want.length <= 4 ? 0 : want.length <= 8 ? 1 : 2;
    return levenshtein(got, want) <= tol;
  });
}

export const fmtNum = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

export function fmtDuration(minutes: number): string {
  if (minutes < 1) return '< 1 phút';
  if (minutes < 60) return `${Math.round(minutes)} phút`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}

export function fmtRelative(ts: number): string {
  if (!ts) return 'chưa bao giờ';
  const diff = Date.now() - ts;
  const min = diff / 60000;
  if (min < 1) return 'vừa xong';
  if (min < 60) return `${Math.round(min)} phút trước`;
  const h = min / 60;
  if (h < 24) return `${Math.round(h)} giờ trước`;
  const d = h / 24;
  if (d < 30) return `${Math.round(d)} ngày trước`;
  return new Date(ts).toLocaleDateString('vi-VN');
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Trung bình cộng an toàn. */
export const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Sigmoid — dùng khắp nơi trong hồi quy logistic và mạng nơ-ron. */
export const sigmoid = (z: number) => 1 / (1 + Math.exp(-clamp(z, -40, 40)));

/** Entropy Shannon của một chuỗi (bit/ký tự). Nền tảng của phát hiện DGA. */
export function shannonEntropy(s: string): number {
  if (!s.length) return 0;
  const freq = new Map<string, number>();
  for (const ch of s) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  let h = 0;
  for (const c of freq.values()) {
    const p = c / s.length;
    h -= p * Math.log2(p);
  }
  return h;
}

/** Tạo id ổn định từ chuỗi (hash 32-bit) — cho khoá React và hạt ngẫu nhiên. */
export function hashCode(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Chờ một khung hình — dùng khi cần đo layout sau khi render. */
export const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/** Tải một chuỗi xuống dưới dạng tệp. */
export function downloadText(filename: string, text: string, mime = 'application/json'): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
