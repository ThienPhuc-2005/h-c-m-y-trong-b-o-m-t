import { useMemo, useState } from 'react';
import { TERMS } from '../content/glossary';
import { normalize } from '../lib/utils';
import { Empty } from '../components/Shared';

/**
 * Từ điển thuật ngữ.
 * Có ô tìm kiếm bỏ dấu: người học gõ "do chuan xac" phải ra "độ chuẩn xác".
 * Chi tiết nhỏ này quyết định người ta có dùng từ điển hay bỏ qua nó.
 */
export function GlossaryPage() {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const m = new Map<string, number>();
    TERMS.forEach((t) => (t.tags ?? []).forEach((x) => m.set(x, (m.get(x) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  const list = useMemo(() => {
    const nq = normalize(q);
    return TERMS.filter((t) => {
      if (tag && !(t.tags ?? []).includes(tag)) return false;
      if (!nq) return true;
      return (
        normalize(t.vi).includes(nq) ||
        normalize(t.en).includes(nq) ||
        normalize(t.def).includes(nq) ||
        normalize(t.id).includes(nq)
      );
    }).sort((a, b) => a.vi.localeCompare(b.vi, 'vi'));
  }, [q, tag]);

  return (
    <div className="container stack" style={{ '--gap': 'var(--s-5)' } as React.CSSProperties}>
      <header>
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>Thuật ngữ</h1>
        <p className="muted" style={{ maxWidth: '64ch', marginTop: 'var(--s-2)' }}>
          {TERMS.length} thuật ngữ, song ngữ Việt–Anh. Tên tiếng Anh không phải để làm màu: mọi công cụ, tài
          liệu và buổi phỏng vấn trong ngành đều dùng nó. Chú ý các mục "Đừng nhầm với" — phần lớn lỗi hiểu
          sai không đến từ việc không biết, mà từ việc lẫn lộn hai khái niệm gần nhau.
        </p>
      </header>

      <div className="stack" style={{ '--gap': 'var(--s-3)' } as React.CSSProperties}>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tiếng Việt, tiếng Anh, hoặc mô tả… (không cần gõ dấu)"
        />
        <div className="row-wrap" style={{ gap: 'var(--s-2)' }}>
          <button className={`chip ${tag === null ? 'chip-brand' : ''}`} onClick={() => setTag(null)}>
            Tất cả ({TERMS.length})
          </button>
          {tags.map(([t, n]) => (
            <button key={t} className={`chip ${tag === t ? 'chip-brand' : ''}`} onClick={() => setTag(tag === t ? null : t)}>
              {t} ({n})
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <Empty icon="🔍" title="Không tìm thấy thuật ngữ nào" sub="Thử từ khoá ngắn hơn, hoặc bỏ bộ lọc nhãn." />
      ) : (
        <div className="grid grid-2">
          {list.map((t) => (
            <div className="card" key={t.id} id={`term-${t.id}`}>
              <div className="row-wrap" style={{ gap: 'var(--s-2)', marginBottom: 'var(--s-2)' }}>
                <b style={{ fontSize: 'var(--fs-md)' }}>{t.vi}</b>
                <span className="chip mono">{t.en}</span>
              </div>
              <p style={{ fontSize: 'var(--fs-sm)' }}>{t.def}</p>
              {t.example && (
                <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--s-2)' }}>
                  <b>Ví dụ:</b> {t.example}
                </p>
              )}
              {t.notToConfuseWith && (
                <div
                  className="callout co-pitfall"
                  style={{ marginTop: 'var(--s-3)', padding: 'var(--s-3)', fontSize: 'var(--fs-sm)' }}
                >
                  <span className="callout-icon" aria-hidden>⚠️</span>
                  <div className="callout-body">
                    <b>Đừng nhầm với:</b> {t.notToConfuseWith}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
