/**
 * Luyện tập xen kẽ.
 *
 * Khác biệt so với ôn thẻ: ở đây là câu hỏi VẬN DỤNG, trộn nhiều chủ đề. Học
 * xen kẽ (interleaving) cho kết quả tức thời kém hơn học tập trung — và chính
 * vì thế mà hầu như không ai tự chọn nó. Nhưng khi kiểm tra sau vài tuần, nhóm
 * học xen kẽ vượt trội rõ rệt ở đúng kỹ năng mà công việc cần: nhận ra "bài
 * toán này thuộc loại nào" khi không có ai nói trước cho bạn biết.
 */

import { useMemo, useState } from 'react';
import { useProgress } from '../lib/storage';
import { buildDrills } from '../lib/plan';
import { weakConcepts, masteryMap, MASTERY_LABEL } from '../lib/mastery';
import { QuizItem } from '../components/Quiz';
import { Empty } from '../components/Shared';
import { href } from '../lib/router';
import { ALL_QUIZ } from '../content';
import { shuffle } from '../lib/utils';

type Mode = 'auto' | 'weak' | 'all' | 'flagged';

export function PracticePage() {
  const p = useProgress();
  const [mode, setMode] = useState<Mode>('auto');
  const [session, setSession] = useState<ReturnType<typeof buildDrills> | null>(null);
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

  const weak = useMemo(() => weakConcepts(p, 12), [p]);
  const mastery = useMemo(() => masteryMap(p).filter((m) => m.seen > 0), [p]);

  const seenLessons = useMemo(
    () => new Set(Object.entries(p.lessons).filter(([, lp]) => lp.startedAt > 0).map(([id]) => id)),
    [p.lessons],
  );

  const start = (m: Mode) => {
    setMode(m);
    let items: ReturnType<typeof buildDrills>;
    if (m === 'weak') {
      const set = new Set(weak.map((w) => w.concept));
      items = shuffle(ALL_QUIZ.filter((q) => seenLessons.has(q.lessonId) && (q.quiz.tags ?? []).some((t) => set.has(t)))).slice(0, 12);
    } else if (m === 'all') {
      items = shuffle(ALL_QUIZ.filter((q) => seenLessons.has(q.lessonId))).slice(0, 15);
    } else {
      items = buildDrills(p, 12);
    }
    setSession(items);
    setIdx(0);
    setResults([]);
  };

  if (!seenLessons.size) {
    return (
      <div className="container container-narrow">
        <Empty
          icon="🎲"
          title="Chưa có gì để luyện tập"
          sub="Phần luyện tập lấy câu hỏi từ những bài bạn đã mở. Hãy học bài đầu tiên trước đã."
          action={<a className="btn btn-primary" href={href('/lo-trinh')}>Xem lộ trình</a>}
        />
      </div>
    );
  }

  /* ---- Màn hình chọn chế độ --------------------------------------------- */
  if (!session) {
    return (
      <div className="container container-narrow stack" style={{ '--gap': 'var(--s-6)' } as React.CSSProperties}>
        <header>
          <h1 style={{ fontSize: 'var(--fs-2xl)' }}>Luyện tập</h1>
          <p className="muted" style={{ marginTop: 'var(--s-2)' }}>
            Câu hỏi vận dụng, trộn nhiều chủ đề. Sẽ khó hơn ôn thẻ — và đó chính là lý do nó hiệu quả hơn cho
            kỹ năng thật.
          </p>
        </header>

        <div className="grid grid-2">
          {[
            { m: 'auto' as Mode, i: '🎯', t: 'Kế hoạch thông minh', d: '60% câu thuộc chỗ bạn đang yếu, 40% trộn ngẫu nhiên để không bỏ quên phần còn lại.', primary: true },
            { m: 'weak' as Mode, i: '🩹', t: 'Chỉ chỗ yếu', d: `Tập trung vào ${weak.length} khái niệm đang lung lay nhất của bạn.`, disabled: weak.length === 0 },
            { m: 'all' as Mode, i: '🌀', t: 'Trộn tất cả', d: 'Ngẫu nhiên hoàn toàn từ mọi bài đã học. Giống nhất với tình huống thật.' },
          ].map((o) => (
            <button
              key={o.m}
              className="card card-hover"
              style={{ textAlign: 'left', opacity: o.disabled ? 0.5 : 1, borderColor: o.primary ? 'var(--brand-border)' : undefined, background: o.primary ? 'var(--brand-soft)' : undefined }}
              disabled={o.disabled}
              onClick={() => start(o.m)}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: 'var(--s-2)' }} aria-hidden>{o.i}</div>
              <b>{o.t}</b>
              <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 4 }}>{o.d}</p>
            </button>
          ))}
        </div>

        {mastery.length > 0 && (
          <section className="card">
            <h2 style={{ fontSize: 'var(--fs-md)', marginBottom: 'var(--s-2)' }}>Bản đồ thành thạo theo khái niệm</h2>
            <p className="faint" style={{ marginBottom: 'var(--s-4)' }}>
              Điểm tự động giảm dần theo thời gian nếu bạn không gặp lại khái niệm — đây là cách app nói thật
              với bạn thay vì cho một dấu tích xanh vĩnh viễn.
            </p>
            <div className="stack" style={{ '--gap': 'var(--s-2)' } as React.CSSProperties}>
              {mastery.slice(0, 16).map((m) => (
                <div key={m.concept} className="row" style={{ gap: 'var(--s-3)' }}>
                  <span className="mono" style={{ fontSize: 'var(--fs-xs)', flex: '0 0 34%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.concept}
                  </span>
                  <div className="bar" style={{ flex: 1 }}>
                    <div
                      className="bar-fill"
                      style={{
                        width: `${m.score * 100}%`,
                        background: m.score >= 0.85 ? 'var(--ok)' : m.score >= 0.68 ? 'var(--info)' : m.score >= 0.45 ? 'var(--warn)' : 'var(--bad)',
                      }}
                    />
                  </div>
                  <span className="faint nowrap" style={{ flex: '0 0 76px', textAlign: 'right' }}>
                    {MASTERY_LABEL[m.level]}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  /* ---- Kết quả ----------------------------------------------------------- */
  if (idx >= session.length) {
    const n = results.filter(Boolean).length;
    return (
      <div className="container container-narrow">
        <div className="card card-pad-lg center anim-in">
          <div style={{ fontSize: '2.4rem', marginBottom: 'var(--s-2)' }} aria-hidden>
            {n / session.length >= 0.8 ? '🎉' : '💪'}
          </div>
          <h1 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--s-2)' }}>
            {n}/{session.length} câu đúng
          </h1>
          <p className="muted" style={{ maxWidth: '48ch', margin: '0 auto var(--s-5)' }}>
            Kết quả luyện tập xen kẽ thường thấp hơn khi bạn làm từng bài riêng lẻ. Đó là bình thường và là
            dấu hiệu tốt: bạn vừa luyện đúng kỹ năng khó nhất — nhận ra bài toán thuộc loại nào khi không có
            ai gợi ý trước.
          </p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => start(mode)}>Luyện tiếp</button>
            <a className="btn" href={href('/')}>Về trang chủ</a>
          </div>
        </div>
      </div>
    );
  }

  const q = session[idx];
  return (
    <div className="container container-narrow stack">
      <div className="row-wrap" style={{ justifyContent: 'space-between' }}>
        <span className="faint">Câu {idx + 1} / {session.length}</span>
        <span className="chip">{q.lessonTitle}</span>
      </div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${(idx / session.length) * 100}%` }} />
      </div>

      <QuizItem
        key={q.quiz.id}
        quiz={q.quiz}
        askConfidence={p.settings.askConfidence}
        onAnswered={(c) => setResults((r) => [...r, c])}
      />

      {results.length > idx && (
        <div className="row">
          <a className="btn btn-sm" href={href(`/hoc/${q.lessonId}`)}>Xem lại bài này</a>
          <span className="spacer" />
          <button className="btn btn-primary" onClick={() => setIdx((x) => x + 1)}>
            {idx + 1 >= session.length ? 'Xem kết quả →' : 'Câu tiếp →'}
          </button>
        </div>
      )}
    </div>
  );
}
