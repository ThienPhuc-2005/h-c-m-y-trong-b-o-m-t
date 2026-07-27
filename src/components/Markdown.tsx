/**
 * Trình dựng markdown rút gọn.
 *
 * Vì sao không dùng thư viện markdown đầy đủ? Ba lý do:
 *  1. Nội dung do ta kiểm soát hoàn toàn — không cần phân tích cú pháp tổng quát.
 *  2. Không kéo theo ~40 KB JavaScript cho vài quy tắc định dạng.
 *  3. Ta cần một cú pháp riêng cho thuật ngữ: [độ chuẩn xác](#term:precision)
 *     mở thẻ tra cứu ngay tại chỗ thay vì rời trang. Rời trang giữa lúc đọc là
 *     kẻ thù của dòng chảy nhận thức.
 *
 * Cú pháp hỗ trợ: **đậm**, *nghiêng*, `mã`, [chữ](#term:id), [chữ](url), ==nhấn==
 */

import { Fragment, useState, type ReactNode } from 'react';
import { getTerm } from '../content/glossary';

interface Props {
  children: string;
  className?: string;
}

export function Markdown({ children, className }: Props) {
  return <span className={className}>{parse(children)}</span>;
}

/** Dùng cho đoạn văn đứng riêng. */
export function MarkdownP({ children, className }: Props) {
  return <p className={className}>{parse(children)}</p>;
}

const RE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|==[^=]+==|\[[^\]]+\]\([^)]+\))/g;

function parse(src: string): ReactNode[] {
  const parts = src.split(RE).filter((s) => s !== '');
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('==') && part.endsWith('==')) {
      return (
        <mark key={i} style={{ background: 'var(--warn-soft)', color: 'var(--warn-text)', padding: '0 3px', borderRadius: 3 }}>
          {part.slice(2, -2)}
        </mark>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const [, text, target] = link;
      if (target.startsWith('#term:')) {
        return <TermRef key={i} id={target.slice(6)} text={text} />;
      }
      if (target.startsWith('#')) {
        return (
          <a key={i} href={target}>
            {text}
          </a>
        );
      }
      return (
        <a key={i} href={target} target="_blank" rel="noopener noreferrer">
          {text} ↗
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** Thuật ngữ có thể mở ngay tại chỗ — không rời khỏi mạch đọc. */
function TermRef({ id, text }: { id: string; text: string }) {
  const [open, setOpen] = useState(false);
  const term = getTerm(id);
  if (!term) return <>{text}</>;

  return (
    <span style={{ position: 'relative' }}>
      <button
        className="termref"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title={`${term.en} — bấm để xem định nghĩa`}
      >
        {text}
      </button>
      {open && (
        <span
          role="tooltip"
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute',
            zIndex: 50,
            left: 0,
            top: 'calc(100% + 6px)',
            width: 'min(320px, 78vw)',
            background: 'var(--bg-elev)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: 'var(--s-3)',
            fontSize: 'var(--fs-sm)',
            lineHeight: 1.55,
            display: 'block',
            fontWeight: 400,
            cursor: 'pointer',
          }}
        >
          <b style={{ display: 'block' }}>{term.vi}</b>
          <span className="faint mono" style={{ display: 'block', marginBottom: 6 }}>
            {term.en}
          </span>
          <span style={{ display: 'block' }}>{term.def}</span>
          {term.notToConfuseWith && (
            <span
              style={{
                display: 'block',
                marginTop: 8,
                paddingTop: 8,
                borderTop: '1px solid var(--border-subtle)',
                color: 'var(--warn-text)',
                fontSize: 'var(--fs-xs)',
              }}
            >
              ⚠ Đừng nhầm với: {term.notToConfuseWith}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
