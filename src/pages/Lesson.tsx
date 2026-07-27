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
import { Icon } from '../components/Icon';
import { useT } from '../i18n';
import { currentRetention } from '../lib/srs';

export function LessonPage({ id }: { id?: string }) {
  const t = useT();
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
        <Empty
          icon="book"
          title={t('lesson.notFound')}
          action={<a className="btn btn-primary" href={href('/lo-trinh')}>{t('lesson.backToRoadmap')}</a>}
        />
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
              <Icon name="arrow-left" size={13} /> {track?.icon && <Icon name={track.icon} size={13} />} {track?.title}
            </a>
          </div>
          <div className="row-wrap" style={{ gap: 'var(--s-2)' }}>
            <LevelBadge level={lesson.level} />
            <span className="chip"><Icon name="hourglass" size={12} /> {lesson.minutes} {t('common.minutes')}</span>
            <span className="chip"><Icon name="brain" size={12} /> {lesson.cards.length} {t('common.cards')}</span>
            <span className="chip"><Icon name="help-circle" size={12} /> {lesson.quiz.length} {t('common.questions')}</span>
            {st === 'thanh-thao' && (
              <span className="chip chip-ok"><Icon name="star" size={12} filled /> {t('common.mastered')}</span>
            )}
            {st === 'da-xong' && (
              <span className="chip chip-info"><Icon name="check" size={12} /> {t('common.completed')}</span>
            )}
          </div>
          <h1 style={{ fontSize: 'var(--fs-3xl)' }}>{lesson.title}</h1>
          <p className="muted" style={{ fontSize: 'var(--fs-lg)', lineHeight: 'var(--lh-snug)' }}>{lesson.subtitle}</p>
        </header>

        {blocked.length > 0 && (
          <div className="callout co-pitfall no-print">
            <Icon className="callout-icon" name="lock" size={18} />
            <div>
              <div className="callout-title">{t('lesson.prereqTitle')}</div>
              <div className="callout-body">
                {blocked.map((b) => {
                  const bl = getLesson(b);
                  return bl ? (
                    <a key={b} href={href(`/hoc/${b}`)} style={{ marginRight: 10 }}>
                      {bl.title}
                    </a>
                  ) : null;
                })}
                <div className="faint" style={{ marginTop: 6 }}>{t('lesson.prereqBody')}</div>
              </div>
            </div>
          </div>
        )}

        {/* ---- VÌ SAO HỌC BÀI NÀY — khối quan trọng nhất trang ------------ */}
        <section className="card card-pad-lg" style={{ background: 'var(--hue-soft)', borderColor: 'color-mix(in srgb, var(--hue) 32%, transparent)' }}>
          <div className="row" style={{ gap: 'var(--s-3)', alignItems: 'flex-start' }}>
            <Icon name="target" size={22} style={{ color: 'var(--hue-text)' }} />
            <div className="stack" style={{ '--gap': 'var(--s-4)' } as React.CSSProperties}>
              <div>
                <div className="stat-k" style={{ marginBottom: 4 }}>{t('lesson.whyShort')}</div>
                <div style={{ fontSize: 'var(--fs-md)', fontWeight: 550 }}>{lesson.why.short}</div>
              </div>

              <div>
                <div className="stat-k" style={{ marginBottom: 4 }}>{t('lesson.whyReal')}</div>
                <div style={{ fontSize: 'var(--fs-sm)' }}>{lesson.why.scenario}</div>
              </div>

              <div>
                <div className="stat-k" style={{ marginBottom: 4 }}>{t('lesson.whyCostHead')}</div>
                <div style={{ fontSize: 'var(--fs-sm)' }}>{lesson.why.costOfNotKnowing}</div>
              </div>

              <div>
                <div className="stat-k" style={{ marginBottom: 6 }}>{t('lesson.whyRolesHead')}</div>
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
          <div className="stat-k" style={{ marginBottom: 'var(--s-2)' }}>{t('lesson.objectivesHead')}</div>
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
          <h2 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--s-4)' }}>{t('lesson.takeawaysHead')}</h2>
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
              <div className="empty-ico"><Icon name="pen-line" size={32} stroke={1.5} /></div>
              <h2 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--s-2)' }}>{t('lesson.quizPrompt')}</h2>
              <p className="muted" style={{ maxWidth: '50ch', margin: '0 auto var(--s-5)' }}>
                {t('lesson.quizSub', { n: lesson.quiz.length })}
              </p>
              <button className="btn btn-primary btn-lg" onClick={() => setShowQuiz(true)}>
                {t('lesson.startQuiz')}
              </button>
              {lp?.bestScore ? (
                <div className="faint" style={{ marginTop: 'var(--s-3)' }}>
                  {t('lesson.bestAttempt', { pct: Math.round(lp.bestScore * 100), n: lp.attempts })}
                </div>
              ) : null}
            </div>
          ) : (
            <QuizSet
              items={lesson.quiz}
              title={t('lesson.quizTitle', { title: lesson.title })}
              onDone={finish}
              askConfidence={p.settings.askConfidence}
            />
          )}
        </section>

        {/* ---- Ghi chú riêng ---------------------------------------------- */}
        <section className="no-print">
          <details className="acc">
            <summary>
              <Icon name="notebook-pen" size={15} /> {t('lesson.notesHead')}
            </summary>
            <div className="acc-body">
              <p className="faint" style={{ marginBottom: 'var(--s-3)' }}>
                {t('lesson.notesHint')}
              </p>
              <textarea
                value={note}
                onChange={(e) => setLocalNote(e.target.value)}
                onBlur={() => setNote(lesson.id, note)}
                placeholder={t('lesson.notesPlaceholder')}
                rows={5}
              />
              <div className="faint" style={{ marginTop: 6 }}>{t('lesson.notesAutoSave')}</div>
            </div>
          </details>
        </section>

        {/* ---- Đọc thêm --------------------------------------------------- */}
        {lesson.further && lesson.further.length > 0 && (
          <section className="panel">
            <div className="stat-k" style={{ marginBottom: 'var(--s-3)' }}>{t('lesson.furtherHead')}</div>
            <div className="stack" style={{ '--gap': 'var(--s-3)' } as React.CSSProperties}>
              {lesson.further.map((f, i) => (
                <div key={i}>
                  <b style={{ fontSize: 'var(--fs-sm)' }}>
                    {f.url ? (
                      <a href={f.url} target="_blank" rel="noopener noreferrer">
                        {f.title} <Icon name="external-link" size={12} />
                      </a>
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
              <Icon name="arrow-left" size={14} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{nav.prev.title}</span>
            </a>
          ) : (
            <span />
          )}
          {nav.next && (
            <a className="btn btn-primary" href={href(`/hoc/${nav.next.id}`)} style={{ maxWidth: '46%' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{nav.next.title}</span>
              <Icon name="arrow-right" size={14} />
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
  const t = useT();
  const p = useProgress();
  const lesson = getLesson(lessonId);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  if (!lesson) return null;

  const active = lesson.cards.filter((c) => p.cards[c.id]).length;

  return (
    <section className="card card-pad-lg no-print">
      <div className="row-wrap" style={{ marginBottom: 'var(--s-4)' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t('lesson.cardsFromLesson', { n: lesson.cards.length })}</h2>
          <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 4 }}>{t('lesson.cardsFromLessonSub')}</p>
        </div>
        {active > 0 && (
          <span className="chip chip-ok">{t('lesson.inSchedule', { n: active, total: lesson.cards.length })}</span>
        )}
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
                    {t('lesson.recallPct', { n: (r * 100).toFixed(0) })}
                  </span>
                )}
                <Icon name="chevron-right" size={14} className="faint" style={{ transform: flipped[c.id] ? 'rotate(90deg)' : undefined }} />
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
