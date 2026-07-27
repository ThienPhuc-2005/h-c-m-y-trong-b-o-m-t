/**
 * Trang đọc bài học.
 *
 * Trình tự đã được thiết kế có chủ đích, không phải ngẫu nhiên:
 *   1. VÌ SAO trước — người học biết mình sắp đổi 15 phút lấy cái gì.
 *   2. MỤC TIÊU — đặt kỳ vọng, giúp não lọc thông tin khi đọc.
 *   3. NỘI DUNG — xen kẽ dự đoán và điểm dừng truy hồi.
 *   4. Ý CHÍNH — củng cố, đồng thời làm bản tóm tắt để quay lại sau này.
 *   5. THẺ GHI NHỚ — biến bài đọc thành thứ chống quên được.
 *   6. KIỂM TRA — quyết định trạng thái thành thạo.
 *   7. GHI CHÚ RIÊNG — elaboration bằng lời của chính mình, cách nhớ sâu nhất.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { getLesson, getTrack, neighbours } from '../content';
import { BlockView } from '../components/Blocks';
import { QuizSet } from '../components/Quiz';
import { LevelBadge, Empty } from '../components/Shared';
import { href } from '../lib/router';
import { useProgress, touchLesson, setNote, getCard, putCard, logMinutes } from '../lib/storage';
import { lessonState } from '../lib/mastery';
import { currentRetention } from '../lib/srs';

export function LessonPage({ id }: { id?: string }) {
  const p = useProgress();
  const lesson = id ? getLesson(id) : undefined;
  const track = lesson ? getTrack(lesson.trackId) : undefined;
  const nav = useMemo(() => (id ? neighbours(id) : {}), [id]);

  const bodyRef = useRef<HTMLDivElement>(null);
  const [readPct, setReadPct] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [note, setLocalNote] = useState('');
  const startedRef = useRef(Date.now());

  /* ---- Ghi nhận bắt đầu học và thời gian bỏ ra --------------------------- */
  useEffect(() => {
    if (!lesson) return;
    startedRef.current = Date.now();
    setLocalNote(p.notes[lesson.id] ?? '');
    setShowQuiz(false);
    setReadPct(0);
    touchLesson(lesson.id, { startedAt: p.lessons[lesson.id]?.startedAt || Date.now() });

    return () => {
      // Chỉ tính thời gian thực sự ở lại trang, và chặn trên 60 phút để một tab
      // bị bỏ quên qua đêm không làm hỏng thống kê.
      const mins = Math.min(60, (Date.now() - startedRef.current) / 60000);
      if (mins > 0.4) {
        logMinutes(Math.round(mins * 10) / 10);
        touchLesson(lesson.id, { minutes: (p.lessons[lesson.id]?.minutes ?? 0) + mins });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  /* ---- Theo dõi tiến độ đọc --------------------------------------------- */
  useEffect(() => {
    if (!lesson) return;
    const onScroll = () => {
      const el = bodyRef.current;
      if (!el) return;
      const top = el.offsetTop;
      const h = el.scrollHeight;
      const y = window.scrollY + window.innerHeight - top;
      const pct = Math.max(0, Math.min(100, (y / h) * 100));
      setReadPct(pct);
      if (pct > 5) touchLesson(lesson.id, { readPct: Math.round(pct) });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  if (!lesson) {
    return (
      <div className="container">
        <Empty icon="📖" title="Không tìm thấy bài học" action={<a className="btn btn-primary" href={href('/lo-trinh')}>Về lộ trình</a>} />
      </div>
    );
  }

  const st = lessonState(lesson, p);
  const lp = p.lessons[lesson.id];
  const blocked = (lesson.prereqs ?? []).filter((q) => !p.lessons[q]?.completedAt);

  /** Đưa toàn bộ thẻ của bài vào hệ thống ôn tập. */
  const activateCards = () => {
    for (const c of lesson.cards) {
      if (!p.cards[c.id]) {
        const mem = getCard(c.id);
        putCard(c.id, { ...mem, due: Date.now() });
      }
    }
  };

  const finish = (score: number) => {
    activateCards();
    touchLesson(lesson.id, {
      completedAt: Date.now(),
      bestScore: score,
      attempts: (lp?.attempts ?? 0) + 1,
      readPct: 100,
    });
  };

  return (
    <div data-hue={track?.hue}>
      <div className="readbar no-print" aria-hidden>
        <i style={{ width: `${readPct}%` }} />
      </div>

      <div className="container container-narrow stack" style={{ '--gap': 'var(--s-6)' } as React.CSSProperties}>
        {/* ---- Đầu bài ---------------------------------------------------- */}
        <header className="stack no-print" style={{ '--gap': 'var(--s-3)' } as React.CSSProperties}>
          <div className="row-wrap faint">
            <a href={href(`/chang/${lesson.trackId}`)} style={{ textDecoration: 'none' }}>
              ← {track?.icon} {track?.title}
            </a>
          </div>
          <div className="row-wrap" style={{ gap: 'var(--s-2)' }}>
            <LevelBadge level={lesson.level} />
            <span className="chip">⏱ {lesson.minutes} phút</span>
            <span className="chip">🧠 {lesson.cards.length} thẻ</span>
            <span className="chip">❓ {lesson.quiz.length} câu hỏi</span>
            {st === 'thanh-thao' && <span className="chip chip-ok">★ Đã thành thạo</span>}
            {st === 'da-xong' && <span className="chip chip-info">✓ Đã hoàn thành</span>}
          </div>
          <h1 style={{ fontSize: 'var(--fs-3xl)' }}>{lesson.title}</h1>
          <p className="muted" style={{ fontSize: 'var(--fs-lg)', lineHeight: 'var(--lh-snug)' }}>{lesson.subtitle}</p>
        </header>

        {blocked.length > 0 && (
          <div className="callout co-pitfall no-print">
            <span className="callout-icon" aria-hidden>🔒</span>
            <div>
              <div className="callout-title">Bài này giả định bạn đã học trước</div>
              <div className="callout-body">
                {blocked.map((b) => {
                  const bl = getLesson(b);
                  return bl ? (
                    <a key={b} href={href(`/hoc/${b}`)} style={{ marginRight: 10 }}>
                      {bl.title}
                    </a>
                  ) : null;
                })}
                <div className="faint" style={{ marginTop: 6 }}>
                  Bạn vẫn đọc tiếp được — chỉ là sẽ khó hơn cần thiết.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---- VÌ SAO HỌC BÀI NÀY — khối quan trọng nhất trang ------------ */}
        <section className="card card-pad-lg" style={{ background: 'var(--hue-soft)', borderColor: 'color-mix(in srgb, var(--hue) 32%, transparent)' }}>
          <div className="row" style={{ gap: 'var(--s-3)', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.4rem' }} aria-hidden>🎯</span>
            <div className="stack" style={{ '--gap': 'var(--s-4)' } as React.CSSProperties}>
              <div>
                <div className="stat-k" style={{ marginBottom: 4 }}>Học cái này để làm gì</div>
                <div style={{ fontSize: 'var(--fs-md)', fontWeight: 550 }}>{lesson.why.short}</div>
              </div>

              <div>
                <div className="stat-k" style={{ marginBottom: 4 }}>Tình huống thật</div>
                <div style={{ fontSize: 'var(--fs-sm)' }}>{lesson.why.scenario}</div>
              </div>

              <div>
                <div className="stat-k" style={{ marginBottom: 4 }}>Nếu không biết thì sao</div>
                <div style={{ fontSize: 'var(--fs-sm)' }}>{lesson.why.costOfNotKnowing}</div>
              </div>

              <div>
                <div className="stat-k" style={{ marginBottom: 6 }}>Ai dùng kiến thức này hằng ngày</div>
                <div className="row-wrap" style={{ gap: 'var(--s-2)' }}>
                  {lesson.why.roles.map((r) => (
                    <span key={r} className="chip chip-hue">{r}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="stat-k" style={{ marginBottom: 'var(--s-2)' }}>Xong bài này bạn sẽ</div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'var(--fs-sm)' }}>
            {lesson.objectives.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </section>

        {/* ---- Nội dung --------------------------------------------------- */}
        <article ref={bodyRef} className="prose">
          {lesson.blocks.map((b, i) => (
            <BlockView key={i} block={b} lessonId={lesson.id} index={i} />
          ))}
        </article>

        {/* ---- Ý chính ---------------------------------------------------- */}
        <section className="card card-pad-lg">
          <h2 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--s-4)' }}>Ý chính cần mang đi</h2>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            {lesson.keyTakeaways.map((k, i) => (
              <li key={i} style={{ fontSize: 'var(--fs-base)' }}>{k}</li>
            ))}
          </ol>
        </section>

        {/* ---- Thẻ ghi nhớ ------------------------------------------------ */}
        <CardPreview lessonId={lesson.id} />

        {/* ---- Kiểm tra --------------------------------------------------- */}
        <section className="no-print">
          {!showQuiz ? (
            <div className="card card-pad-lg center">
              <div style={{ fontSize: '2rem', marginBottom: 'var(--s-2)' }} aria-hidden>✍️</div>
              <h2 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--s-2)' }}>Kiểm tra lại trước khi đi tiếp</h2>
              <p className="muted" style={{ maxWidth: '50ch', margin: '0 auto var(--s-5)' }}>
                {lesson.quiz.length} câu. Đây không phải để chấm điểm bạn — hành động cố nhớ lại chính là thứ
                biến bài vừa đọc thành kiến thức giữ được. Đọc lại lần nữa sẽ dễ chịu hơn nhưng gần như vô ích.
              </p>
              <button className="btn btn-primary btn-lg" onClick={() => setShowQuiz(true)}>
                Bắt đầu kiểm tra
              </button>
              {lp?.bestScore ? (
                <div className="faint" style={{ marginTop: 'var(--s-3)' }}>
                  Lần tốt nhất: {Math.round(lp.bestScore * 100)}% · {lp.attempts} lần làm
                </div>
              ) : null}
            </div>
          ) : (
            <QuizSet items={lesson.quiz} title={`Kiểm tra: ${lesson.title}`} onDone={finish} askConfidence={p.settings.askConfidence} />
          )}
        </section>

        {/* ---- Ghi chú riêng ---------------------------------------------- */}
        <section className="no-print">
          <details className="acc">
            <summary>📝 Ghi chú của bạn về bài này</summary>
            <div className="acc-body">
              <p className="faint" style={{ marginBottom: 'var(--s-3)' }}>
                Viết lại bằng lời của chính bạn là một trong những cách ghi nhớ mạnh nhất — mạnh hơn cả tô màu
                hay chép lại nguyên văn. Thử trả lời: "Nếu phải giải thích bài này cho đồng nghiệp trong 30
                giây, tôi sẽ nói gì?"
              </p>
              <textarea
                value={note}
                onChange={(e) => setLocalNote(e.target.value)}
                onBlur={() => setNote(lesson.id, note)}
                placeholder="Ghi chú, câu hỏi còn thắc mắc, liên hệ với công việc của bạn…"
                rows={5}
              />
              <div className="faint" style={{ marginTop: 6 }}>Tự lưu khi bạn bấm ra ngoài.</div>
            </div>
          </details>
        </section>

        {/* ---- Đọc thêm --------------------------------------------------- */}
        {lesson.further && lesson.further.length > 0 && (
          <section className="panel">
            <div className="stat-k" style={{ marginBottom: 'var(--s-3)' }}>Đọc thêm nếu muốn đào sâu</div>
            <div className="stack" style={{ '--gap': 'var(--s-3)' } as React.CSSProperties}>
              {lesson.further.map((f, i) => (
                <div key={i}>
                  <b style={{ fontSize: 'var(--fs-sm)' }}>
                    {f.url ? (
                      <a href={f.url} target="_blank" rel="noopener noreferrer">{f.title} ↗</a>
                    ) : (
                      f.title
                    )}
                  </b>
                  <div className="faint">{f.note}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---- Điều hướng ------------------------------------------------- */}
        <nav className="row-wrap no-print" style={{ justifyContent: 'space-between', gap: 'var(--s-3)', paddingTop: 'var(--s-4)', borderTop: '1px solid var(--border)' }}>
          {nav.prev ? (
            <a className="btn" href={href(`/hoc/${nav.prev.id}`)} style={{ maxWidth: '46%' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>← {nav.prev.title}</span>
            </a>
          ) : (
            <span />
          )}
          {nav.next && (
            <a className="btn btn-primary" href={href(`/hoc/${nav.next.id}`)} style={{ maxWidth: '46%' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{nav.next.title} →</span>
            </a>
          )}
        </nav>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Xem trước thẻ ghi nhớ của bài, kèm trạng thái trí nhớ hiện tại.
 * Mục đích tâm lý: cho người học thấy "bài này để lại cái gì" — sự trừu tượng
 * của việc học biến thành vài mẩu cụ thể mà hệ thống sẽ giữ giúp họ.
 */
function CardPreview({ lessonId }: { lessonId: string }) {
  const p = useProgress();
  const lesson = getLesson(lessonId);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  if (!lesson) return null;

  const active = lesson.cards.filter((c) => p.cards[c.id]).length;

  return (
    <section className="card card-pad-lg no-print">
      <div className="row-wrap" style={{ marginBottom: 'var(--s-4)' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 'var(--fs-lg)' }}>Bài này để lại {lesson.cards.length} thẻ ghi nhớ</h2>
          <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 4 }}>
            Sau khi bạn làm bài kiểm tra, hệ thống sẽ đưa chúng quay lại đúng lúc bạn sắp quên.
          </p>
        </div>
        {active > 0 && <span className="chip chip-ok">{active}/{lesson.cards.length} đang trong lịch ôn</span>}
      </div>

      <div className="stack" style={{ '--gap': 'var(--s-2)' } as React.CSSProperties}>
        {lesson.cards.map((c) => {
          const mem = p.cards[c.id];
          const r = mem ? currentRetention(mem) : null;
          return (
            <button
              key={c.id}
              className="checklist-item"
              onClick={() => setFlipped((f) => ({ ...f, [c.id]: !f[c.id] }))}
              style={{ display: 'block', textAlign: 'left' }}
            >
              <div className="row-wrap" style={{ gap: 'var(--s-2)' }}>
                <span style={{ flex: 1, fontWeight: 600, minWidth: 200 }}>{c.front}</span>
                {r !== null && (
                  <span className={`chip ${r > 0.9 ? 'chip-ok' : r > 0.7 ? 'chip-warn' : 'chip-bad'}`}>
                    nhớ {(r * 100).toFixed(0)}%
                  </span>
                )}
                <span className="faint">{flipped[c.id] ? '▾' : '▸'}</span>
              </div>
              {flipped[c.id] && (
                <div className="muted anim-in" style={{ marginTop: 'var(--s-2)', paddingTop: 'var(--s-2)', borderTop: '1px dashed var(--border)' }}>
                  {c.back}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
