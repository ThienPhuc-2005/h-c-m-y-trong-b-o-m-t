/**
 * ============================================================================
 *  Song ngữ — Tiếng Việt và English
 * ============================================================================
 *
 *  PHẠM VI, nói thẳng ngay từ đầu: bộ từ điển này dịch phần VỎ giao diện —
 *  điều hướng, nút, nhãn, trạng thái rỗng, trang Cài đặt. Nó KHÔNG dịch giáo
 *  trình: 73 bài học, 364 thẻ ghi nhớ và 468 câu hỏi vẫn là tiếng Việt.
 *
 *  Đó là lựa chọn có chủ đích chứ không phải việc còn dở. Một bản dịch máy móc
 *  của 38 nghìn dòng nội dung sư phạm sẽ tệ hơn hẳn bản gốc, và người học sẽ
 *  tin vào một câu giải thích đã bị dịch sai. Vỏ giao diện thì khác: nó ngắn,
 *  lặp lại, và dịch sai một nút thì thấy ngay.
 *
 *  Vì vậy khi chọn English, app nói rõ với người dùng rằng nội dung bài học
 *  vẫn là tiếng Việt — xem `content.notice`. Hứa ít mà giữ được, hơn là hứa
 *  "song ngữ" rồi để người ta bấm vào một bài học toàn tiếng Việt.
 *
 *  Ngôn ngữ lưu ở khoá localStorage `lang`, TÁCH RIÊNG khỏi tiến độ học. Đặt
 *  chung sẽ khiến việc "xoá tiến độ, học lại từ đầu" kéo theo việc đặt lại
 *  ngôn ngữ — hai thứ không liên quan gì tới nhau.
 * ============================================================================
 */

import { useSyncExternalStore } from 'react';
import vi from './vi.json';
import en from './en.json';

export type Lang = 'vi' | 'en';

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: 'vi', label: 'Tiếng Việt', short: 'VI' },
  { code: 'en', label: 'English', short: 'EN' },
];

const KEY = 'lang';

/** Tiếng Việt là mặc định: đây là giáo trình tiếng Việt, cho người học Việt. */
const DEFAULT: Lang = 'vi';

const DICTS: Record<Lang, Record<string, unknown>> = { vi, en };

/* -------------------------------------------------------------------------- */
/*  Kho trạng thái                                                             */
/* -------------------------------------------------------------------------- */

function load(): Lang {
  if (typeof localStorage === 'undefined') return DEFAULT;
  const saved = localStorage.getItem(KEY);
  return saved === 'vi' || saved === 'en' ? saved : DEFAULT;
}

let current: Lang = load();
const listeners = new Set<() => void>();

export const getLang = (): Lang => current;

export function setLang(next: Lang): void {
  if (next === current) return;
  current = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* chế độ riêng tư chặn ghi — đổi ngôn ngữ vẫn phải có tác dụng trong phiên này */
  }
  // `lang` trên thẻ <html> không phải để trang trí: trình đọc màn hình dùng nó
  // để chọn giọng đọc, và trình duyệt dùng nó để ngắt dòng cho đúng ngôn ngữ.
  if (typeof document !== 'undefined') document.documentElement.lang = next;
  for (const fn of listeners) fn();
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Đọc ngôn ngữ hiện tại và render lại khi nó đổi. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, getLang);
}

/* -------------------------------------------------------------------------- */
/*  Tra cứu                                                                    */
/* -------------------------------------------------------------------------- */

function lookup(dict: Record<string, unknown>, path: string): string | undefined {
  let node: unknown = dict;
  for (const part of path.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

/**
 * Dịch một khoá. `{tên}` trong chuỗi được thay bằng giá trị tương ứng trong
 * `vars` — nội suy nằm trong bản dịch chứ không phải ghép chuỗi ở nơi gọi, vì
 * trật tự từ giữa hai ngôn ngữ khác nhau ("còn 5 thẻ" / "5 cards left").
 *
 * Thiếu khoá thì rơi về tiếng Việt, và nếu vẫn không có thì trả về chính khoá
 * đó. Một nhãn xấu vẫn tốt hơn một ô trống hoặc một màn hình trắng.
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const raw = lookup(DICTS[current], key) ?? lookup(DICTS.vi, key) ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}

/**
 * Dùng trong component. Trả về đúng hàm `t` ở trên, nhưng đăng ký component
 * nghe thay đổi ngôn ngữ — nếu không, bấm đổi ngôn ngữ sẽ chỉ cập nhật những
 * phần tình cờ render lại vì lý do khác.
 */
export function useT(): typeof t {
  useLang();
  return t;
}

/** Chọn một trong hai giá trị theo ngôn ngữ — dùng cho dữ liệu, không phải chuỗi cố định. */
export function pick<T>(viValue: T, enValue: T): T {
  return current === 'en' ? enValue : viValue;
}
