import { useMemo, useState } from 'react';
import { ALL_TERMS } from '../content/glossary';
import { normalize } from '../lib/utils';
import { Empty } from '../components/Shared';
import { Icon } from '../components/Icon';
import { useT } from '../i18n';

/**
 * Từ điển thuật ngữ.
 * Có ô tìm kiếm bỏ dấu: người học gõ "do chuan xac" phải ra "độ chuẩn xác".
 * Chi tiết nhỏ này quyết định người ta có dùng từ điển hay bỏ qua nó.
 */
export function GlossaryPage() {
  const t = useT();
  const [q, setQ] = useState('');
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const m = new Map<string, number>();
    ALL_TERMS.forEach((t) => (t.tags ?? []).forEach((x) => m.set(x, (m.get(x) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  const list = useMemo(() => {
    const nq = normalize(q);
    return ALL_TERMS.filter((t) => {
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
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>{t('glossary.title')}</h1>
        <p className="muted" style={{ maxWidth: '64ch', marginTop: 'var(--s-2)' }}>
          {t('glossary.countTerms', { n: ALL_TERMS.length })} — {t('glossary.intro')}
        </p>
      </header>

      <div className="stack" style={{ '--gap': 'var(--s-3)' } as React.CSSProperties}>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('glossary.searchPlaceholder')}
          aria-label={t('glossary.searchPlaceholder')}
        />
        <div className="row-wrap" style={{ gap: 'var(--s-2)' }}>
          <button className={`chip ${tag === null ? 'chip-brand' : ''}`} onClick={() => setTag(null)}>
            {t('glossary.allTags')} ({ALL_TERMS.length})
          </button>
          {tags.map(([name, n]) => (
            <button
              key={name}
              className={`chip ${tag === name ? 'chip-brand' : ''}`}
              onClick={() => setTag(tag === name ? null : name)}
            >
              {name} ({n})
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <Empty icon="search-x" title={t('glossary.emptyTitle')} sub={t('glossary.emptySub')} />
      ) : (
        <div className="grid grid-2">
          {list.map((term) => (
            <div className="card" key={term.id} id={`term-${term.id}`}>
              <div className="row-wrap" style={{ gap: 'var(--s-2)', marginBottom: 'var(--s-2)' }}>
                <b style={{ fontSize: 'var(--fs-md)' }}>{term.vi}</b>
                <span className="chip mono">{term.en}</span>
              </div>
              <p style={{ fontSize: 'var(--fs-sm)' }}>{term.def}</p>
              {term.example && (
                <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--s-2)' }}>
                  <b>{t('glossary.example')}:</b> {term.example}
                </p>
              )}
              {term.notToConfuseWith && (
                <div
                  className="callout co-pitfall"
                  style={{ marginTop: 'var(--s-3)', padding: 'var(--s-3)', fontSize: 'var(--fs-sm)' }}
                >
                  <Icon className="callout-icon" name="alert-triangle" size={16} />
                  <div className="callout-body">
                    <b>{t('glossary.notToConfuse')}:</b> {term.notToConfuseWith}
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
