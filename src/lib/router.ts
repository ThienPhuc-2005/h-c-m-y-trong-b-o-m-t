/**
 * Bộ định tuyến tối giản dựa trên hash (#/...).
 *
 * Vì sao hash thay vì History API? App này chạy được từ tệp tĩnh bất kỳ
 * (GitHub Pages, USB, mạng nội bộ, ngoại tuyến) mà không cần cấu hình máy chủ
 * chuyển hướng. Người học ở đâu cũng mở được — đó là ưu tiên cao hơn URL đẹp.
 */

import { useSyncExternalStore, useCallback } from 'react';

const listeners = new Set<() => void>();

function currentPath(): string {
  const h = typeof location === 'undefined' ? '' : location.hash;
  const raw = h.startsWith('#') ? h.slice(1) : h;
  return raw || '/';
}

let snapshot = currentPath();

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    snapshot = currentPath();
    for (const l of listeners) l();
  });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useRoute(): string {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
}

export function navigate(path: string, opts: { replace?: boolean; keepScroll?: boolean } = {}): void {
  const target = `#${path.startsWith('/') ? path : `/${path}`}`;
  if (location.hash === target) return;
  if (opts.replace) history.replaceState(null, '', target);
  else location.hash = target;
  if (opts.replace) {
    snapshot = currentPath();
    for (const l of listeners) l();
  }
  if (!opts.keepScroll) {
    // Cuộn tức thời, không mượt: chuyển trang mà cuộn từ từ gây mất phương hướng.
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }
}

export function useNavigate() {
  return useCallback((path: string, opts?: { replace?: boolean; keepScroll?: boolean }) => {
    navigate(path, opts);
  }, []);
}

/** Tách route thành các đoạn: '/hoc/abc' → ['hoc', 'abc'] */
export const segments = (path: string): string[] => path.split('/').filter(Boolean);

/** Đường dẫn tuyệt đối dùng cho thuộc tính href của thẻ <a>. */
export const href = (path: string): string => `#${path.startsWith('/') ? path : `/${path}`}`;
