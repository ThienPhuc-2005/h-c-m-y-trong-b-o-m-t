/**
 * Trình dựng khối nội dung bài học.
 * Mỗi loại khối là một quyết định sư phạm, không chỉ là một kiểu định dạng.
 */

import { useState } from 'react';
import type { Block, CalloutKind, Quiz } from '../content/types';
import { Markdown, MarkdownP } from './Markdown';
import { Figure } from './Figures';
import { QuizItem } from './Quiz';
import { Lab } from '../labs';
import { getTerm } from '../content/glossary';
import { useProgressSlice, toggleCheck } from '../lib/storage';
import { highlight } from '../lib/highlight';

const CALLOUT_META: Record<CalloutKind, { icon: string; label: string }> = {
  why: { icon: '🎯', label: 'Vì sao quan trọng' },
  insight: { icon: '💡', label: 'Trực giác cốt lõi' },
  pitfall: { icon: '⚠️', label: 'Bẫy thường gặp' },
  warn: { icon: '🛑', label: 'Cảnh báo' },
  story: { icon: '📖', label: 'Chuyện có thật' },
  pro: { icon: '🛠️', label: 'Mẹo thực chiến' },
  math: { icon: '∑', label: 'Phần toán' },
  ethics: { icon: '⚖️', label: 'Đạo đức & pháp lý' },
};

export function BlockView({ block, lessonId, index }: { block: Block; lessonId: string; index: number }) {
  switch (block.t) {
    case 'p':
      return <MarkdownP>{block.md}</MarkdownP>;

    case 'h':
      return block.level === 3 ? (
        <h3 id={`s-${index}`}>{block.text}</h3>
      ) : (
        <h2 id={`s-${index}`}>{block.text}</h2>
      );

    case 'list':
      return block.ordered ? (
        <ol>
          {block.items.map((it, i) => (
            <li key={i}><Markdown>{it}</Markdown></li>
          ))}
        </ol>
      ) : (
        <ul>
          {block.items.map((it, i) => (
            <li key={i}><Markdown>{it}</Markdown></li>
          ))}
        </ul>
      );

    case 'callout': {
      const meta = CALLOUT_META[block.kind];
      return (
        <aside className={`callout co-${block.kind}`}>
          <span className="callout-icon" aria-hidden>{meta.icon}</span>
          <div style={{ minWidth: 0 }}>
            <div className="callout-title">{block.title ?? meta.label}</div>
            <div className="callout-body">
              <Markdown>{block.md}</Markdown>
            </div>
          </div>
        </aside>
      );
    }

    case 'code':
      return <CodeBlock lang={block.lang} code={block.code} caption={block.caption} collapsed={block.collapsed} />;

    case 'table':
      return (
        <figure>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>{block.head.map((h, i) => <th key={i}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {block.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j}><Markdown>{c}</Markdown></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && <figcaption className="figure-caption">{block.caption}</figcaption>}
        </figure>
      );

    case 'figure':
      return <Figure id={block.id} caption={block.caption} />;

    case 'predict':
      return <Predict question={block.question} reveal={block.reveal} />;

    case 'checkpoint':
      return <Checkpoint questions={block.questions} />;

    case 'steps':
      return (
        <div>
          {block.title && <h3 style={{ marginBottom: 'var(--s-4)' }}>{block.title}</h3>}
          <div className="steps">
            {block.steps.map((s, i) => (
              <div className="step" key={i}>
                <div style={{ minWidth: 0 }}>
                  <div className="step-title">{s.title}</div>
                  <div><Markdown>{s.md}</Markdown></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'compare':
      return (
        <div>
          {block.title && <h3 style={{ marginBottom: 'var(--s-3)' }}>{block.title}</h3>}
          <div className="compare">
            {[block.left, block.right].map((col, i) => (
              <div className="compare-col" key={i}>
                <h5>{col.title}</h5>
                <ul>
                  {col.items.map((it, j) => (
                    <li key={j}><Markdown>{it}</Markdown></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );

    case 'lab':
      return (
        <div>
          {block.intro && <p className="muted" style={{ marginBottom: 'var(--s-3)' }}><Markdown>{block.intro}</Markdown></p>}
          <Lab id={block.id} />
        </div>
      );

    case 'terms':
      return <TermStrip ids={block.ids} />;

    case 'quote':
      return (
        <blockquote
          style={{
            borderLeft: '3px solid var(--hue, var(--brand))',
            paddingLeft: 'var(--s-4)',
            fontStyle: 'italic',
            color: 'var(--text-muted)',
          }}
        >
          <Markdown>{block.md}</Markdown>
          {block.source && <footer className="faint" style={{ marginTop: 6, fontStyle: 'normal' }}>— {block.source}</footer>}
        </blockquote>
      );

    case 'checklist':
      return <Checklist title={block.title} items={block.items} lessonId={lessonId} index={index} />;

    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */

function CodeBlock({ lang, code, caption, collapsed }: { lang: string; code: string; caption?: string; collapsed?: boolean }) {
  const [open, setOpen] = useState(!collapsed);
  const [copied, setCopied] = useState(false);

  return (
    <figure className="codeblock">
      <div className="codeblock-head">
        <span className="mono">{lang}</span>
        <span style={{ flex: 1 }} />
        {collapsed && (
          <button className="btn btn-sm btn-ghost" onClick={() => setOpen((o) => !o)}>
            {open ? 'Thu gọn' : 'Mở ra'}
          </button>
        )}
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => {
            navigator.clipboard?.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
        >
          {copied ? '✓ Đã chép' : 'Chép'}
        </button>
      </div>
      {open && (
        <pre>
          <code dangerouslySetInnerHTML={{ __html: highlight(code, lang) }} />
        </pre>
      )}
      {caption && <figcaption className="codeblock-caption">{caption}</figcaption>}
    </figure>
  );
}

/**
 * Câu hỏi dự đoán. Người học PHẢI bấm mới thấy lời giải — ép một khoảnh khắc
 * suy nghĩ. Đây là "hiệu ứng tiền kiểm tra": cố trả lời và sai làm tăng khả
 * năng ghi nhớ lời giải thích sau đó, mạnh hơn hẳn việc đọc thẳng.
 */
function Predict({ question, reveal }: { question: string; reveal: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="reveal">
      <div className="reveal-q">
        <span aria-hidden>🤔</span>
        <span>
          <b>Thử đoán xem: </b>
          <Markdown>{question}</Markdown>
        </span>
      </div>
      {!open ? (
        <div className="stack" style={{ '--gap': 'var(--s-2)' } as React.CSSProperties}>
          <button className="btn btn-sm" onClick={() => setOpen(true)}>
            Tôi đã nghĩ xong — xem lời giải
          </button>
          <span className="faint">
            Nghĩ thật, dù chỉ 10 giây. Đoán sai rồi được giải thích giúp bạn nhớ lâu hơn đọc thẳng đáp án.
          </span>
        </div>
      ) : (
        <div className="reveal-a">
          <Markdown>{reveal}</Markdown>
        </div>
      )}
    </div>
  );
}

function Checkpoint({ questions }: { questions: Quiz[] }) {
  return (
    <div className="stack">
      <div className="row" style={{ gap: 'var(--s-2)' }}>
        <span className="chip chip-brand">⏸ Điểm dừng</span>
        <span className="faint">Trả lời trước khi đọc tiếp — đây là lúc kiến thức được neo lại.</span>
      </div>
      {questions.map((q) => (
        <QuizItem key={q.id} quiz={q} askConfidence={false} />
      ))}
    </div>
  );
}

function TermStrip({ ids }: { ids: string[] }) {
  const terms = ids.map(getTerm).filter(Boolean);
  if (!terms.length) return null;
  return (
    <details className="acc">
      <summary>📚 Thuật ngữ trong phần này ({terms.length})</summary>
      <div className="acc-body stack" style={{ '--gap': 'var(--s-3)' } as React.CSSProperties}>
        {terms.map((t) => (
          <div key={t!.id}>
            <div className="row" style={{ gap: 'var(--s-2)', flexWrap: 'wrap' }}>
              <b>{t!.vi}</b>
              <span className="chip mono">{t!.en}</span>
            </div>
            <div style={{ fontSize: 'var(--fs-sm)', marginTop: 2 }}>{t!.def}</div>
            {t!.example && <div className="faint" style={{ marginTop: 2 }}>Ví dụ: {t!.example}</div>}
          </div>
        ))}
      </div>
    </details>
  );
}

function Checklist({ title, items, lessonId, index }: { title?: string; items: string[]; lessonId: string; index: number }) {
  const checks = useProgressSlice((p) => p.checks);
  return (
    <div>
      {title && <h3 style={{ marginBottom: 'var(--s-3)' }}>{title}</h3>}
      <div className="checklist">
        {items.map((it, i) => {
          const key = `${lessonId}:${index}:${i}`;
          const on = !!checks[key];
          return (
            <button key={i} className="checklist-item" aria-pressed={on} onClick={() => toggleCheck(key)}>
              <span className="checklist-box" aria-hidden>✓</span>
              <span className="checklist-text"><Markdown>{it}</Markdown></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
