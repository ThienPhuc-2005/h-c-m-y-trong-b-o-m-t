/**
 * ============================================================================
 *  Tìm kiếm nhanh (Ctrl/⌘ + K)
 * ============================================================================
 *
 *  Vì sao một app học tập cần thứ này:
 *
 *  Người học KHÔNG chỉ đi theo lộ trình tuyến tính. Giữa lúc làm việc thật họ
 *  nhớ mang máng "hình như có bài nói về chuyện ROC lừa dối khi lớp dương
 *  hiếm" và cần tới đó trong 5 giây. Bắt họ mở lộ trình, đoán xem nó thuộc
 *  chặng nào, rồi quét qua danh sách là lãng phí đúng thứ mà app này cam kết
 *  tôn trọng: thời gian của họ.
 *
 *  Ba chi tiết quyết định thứ này có được dùng hay không:
 *   1. BỎ DẤU khi so khớp — gõ "do chuan xac" phải ra "độ chuẩn xác". Người
 *      Việt gõ nhanh thường không bỏ dấu.
 *   2. Tìm cả trong phần "học để làm gì", không chỉ tiêu đề. Người ta thường
 *      nhớ VẤN ĐỀ chứ không nhớ tên bài.
 *   3. Điều hướng hoàn toàn bằng bàn phím, không cần chạm chuột.
 * ============================================================================
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_LESSONS, getTrack } from '../content';
import { ALL_TERMS } from '../content/glossary';
import { LABS } from '../labs';
import { navigate } from '../lib/router';
import { normalize } from '../lib/utils';
import { Icon } from './Icon';
import { t, useT, useLang } from '../i18n';
import type { IconName } from './Icon';

interface Hit {
  kind: 'bai' | 'thuat-ngu' | 'lab';
  id: string;
  title: string;
  sub: string;
  icon: IconName;
  path: string;
  score: number;
}

/** Chỉ mục dựng một lần, không phải mỗi lần gõ phím. */
function buildIndex(): { hit: Omit<Hit, 'score'>; hay: string }[] {
  const out: { hit: Omit<Hit, 'score'>; hay: string }[] = [];

  for (const l of ALL_LESSONS) {
    const track = getTrack(l.trackId);
    out.push({
      hit: {
        kind: 'bai',
        id: l.id,
        title: l.title,
        sub: t('search.lessonSub', { track: track?.title ?? '', n: l.minutes + l.practiceMinutes }),
        icon: 'book',
        path: `/hoc/${l.id}`,
      },
      // Gộp cả mục tiêu và phần "vì sao" — người học nhớ vấn đề, không nhớ tiêu đề.
      hay: normalize(
        [l.title, l.subtitle, l.why.short, l.why.scenario, ...l.objectives, ...l.keyTakeaways].join(' '),
      ),
    });
  }

  for (const t of ALL_TERMS) {
    out.push({
      hit: {
        kind: 'thuat-ngu',
        id: t.id,
        title: `${t.vi} · ${t.en}`,
        sub: t.def,
        icon: 'book-a',
        path: `/thuat-ngu`,
      },
      hay: normalize([t.vi, t.en, t.def, t.example ?? '', t.id].join(' ')),
    });
  }

  for (const l of LABS) {
    out.push({
      hit: { kind: 'lab', id: l.id, title: l.title, sub: l.blurb, icon: 'flask', path: `/phong-lab/${l.id}` },
      hay: normalize([l.title, l.blurb, l.id].join(' ')),
    });
  }

  return out;
}

let INDEX: ReturnType<typeof buildIndex> | null = null;

/**
 * Mở bảng tìm kiếm từ bất kỳ đâu (ví dụ nút trên thanh điều hướng).
 * Dùng sự kiện tuỳ chỉnh thay vì giả lập phím bấm: giả lập phím là mẹo dễ vỡ,
 * phụ thuộc vào việc trình duyệt và trình đọc màn hình diễn giải sự kiện tổng
 * hợp giống hệt sự kiện thật — điều không có gì bảo đảm.
 */
const OPEN_EVENT = 'aegis:open-search';
export const openSearch = () => window.dispatchEvent(new CustomEvent(OPEN_EVENT));

const KIND_KEY: Record<Hit['kind'], string> = {
  bai: 'search.kindLesson',
  'thuat-ngu': 'search.kindTerm',
  lab: 'search.kindLab',
};

export function SearchPalette() {
  const tr = useT();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* ---- Mở bằng Ctrl/⌘+K hoặc phím "/" ----------------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  // Chỉ mục có nhúng chuỗi đã dịch (dòng phụ của bài học), nên đổi ngôn ngữ
  // phải vứt nó đi — nếu không, kết quả tìm kiếm sẽ kẹt ở ngôn ngữ cũ.
  useEffect(() => {
    INDEX = null;
  }, [lang]);

  useEffect(() => {
    if (open) {
      setQ('');
      setSel(0);
      // Chờ một khung hình để hộp thoại có mặt trong DOM rồi mới lấy tiêu điểm.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo<Hit[]>(() => {
    if (!INDEX) INDEX = buildIndex();
    const nq = normalize(q);
    if (!nq) {
      // Chưa gõ gì: gợi ý vài phòng lab để người học biết mình tìm được gì ở đây.
      return LABS.slice(0, 6).map((l) => ({
        kind: 'lab' as const,
        id: l.id,
        title: l.title,
        sub: l.blurb,
        icon: 'flask',
        path: `/phong-lab/${l.id}`,
        score: 0,
      }));
    }
    const words = nq.split(' ').filter(Boolean);
    const hits: Hit[] = [];
    for (const row of INDEX) {
      // Mọi từ khoá đều phải xuất hiện — tìm kiếm giao, không phải hợp.
      if (!words.every((w) => row.hay.includes(w))) continue;
      const titleNorm = normalize(row.hit.title);
      let score = 0;
      if (titleNorm.startsWith(nq)) score += 100;
      else if (titleNorm.includes(nq)) score += 60;
      if (row.hay.startsWith(nq)) score += 20;
      score += row.hit.kind === 'bai' ? 8 : row.hit.kind === 'lab' ? 4 : 0;
      score -= Math.min(20, row.hay.indexOf(words[0]) / 40);
      hits.push({ ...row.hit, score });
    }
    return hits.sort((a, b) => b.score - a.score).slice(0, 12);
  }, [q]);

  useEffect(() => {
    setSel(0);
  }, [q]);

  if (!open) return null;

  const go = (h: Hit) => {
    setOpen(false);
    navigate(h.path);
    if (h.kind === 'thuat-ngu') {
      // Cuộn tới đúng thẻ thuật ngữ sau khi trang đã dựng xong.
      setTimeout(() => document.getElementById(`term-${h.id}`)?.scrollIntoView({ block: 'center' }), 120);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Giữ tiêu điểm trong hộp thoại: người dùng bàn phím không được phép Tab ra
    // sau lưng lớp phủ rồi lạc vào một trang mà họ không nhìn thấy.
    if (e.key === 'Tab') {
      e.preventDefault();
      setSel((sIdx) => (e.shiftKey ? Math.max(0, sIdx - 1) : Math.min(results.length - 1, sIdx + 1)));
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => Math.min(results.length - 1, s + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === 'Enter' && results[sel]) {
      e.preventDefault();
      go(results[sel]);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setOpen(false)} role="presentation">
      <div
        className="modal"
        style={{ maxWidth: 640, alignSelf: 'start', marginTop: '10vh' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={tr('nav.searchLabel')}
      >
        <div className="modal-head" style={{ padding: 'var(--s-3) var(--s-4)' }}>
          <Icon name="search" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={tr('search.placeholder')}
            style={{ border: 'none', background: 'transparent', fontSize: 'var(--fs-md)', padding: 0 }}
            aria-label={tr('search.inputLabel')}
            aria-controls="search-results"
          />
          <kbd>Esc</kbd>
        </div>

        <div className="modal-body" style={{ padding: 'var(--s-2)', maxHeight: '58vh', overflowY: 'auto' }} ref={listRef} id="search-results" role="listbox" aria-label={tr('search.resultsLabel')}>
          {results.length === 0 ? (
            <div className="empty" style={{ padding: 'var(--s-8) var(--s-4)' }}>
              <div className="empty-ico"><Icon name="search-x" size={38} stroke={1.5} /></div>
              <div className="faint">{tr('search.noResults', { q })}</div>
            </div>
          ) : (
            results.map((h, i) => (
              <button
                key={`${h.kind}-${h.id}`}
                role="option"
                aria-selected={i === sel}
                onMouseEnter={() => setSel(i)}
                onClick={() => go(h)}
                style={{
                  display: 'flex',
                  gap: 'var(--s-3)',
                  alignItems: 'flex-start',
                  width: '100%',
                  textAlign: 'left',
                  padding: 'var(--s-3)',
                  borderRadius: 'var(--r-md)',
                  background: i === sel ? 'var(--brand-soft)' : 'transparent',
                  border: '1px solid',
                  borderColor: i === sel ? 'var(--brand-border)' : 'transparent',
                }}
              >
                <Icon name={h.icon} size={17} className="faint" />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{h.title}</span>
                  <span
                    className="faint"
                    style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {h.sub}
                  </span>
                </span>
                <span className="chip" style={{ flexShrink: 0 }}>{tr(KIND_KEY[h.kind])}</span>
              </button>
            ))
          )}
        </div>

        <div className="modal-foot" style={{ justifyContent: 'flex-start', gap: 'var(--s-4)', fontSize: 'var(--fs-xs)' }}>
          <span className="faint"><kbd>↑</kbd> <kbd>↓</kbd> {tr('search.move')}</span>
          <span className="faint"><kbd>↵</kbd> {tr('search.open')}</span>
          <span className="spacer" />
          <span className="faint">{tr('search.countResults', { n: results.length })}</span>
        </div>
      </div>
    </div>
  );
}
