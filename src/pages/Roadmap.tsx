/**
 * Bản đồ lộ trình.
 * Đây là "advance organizer" ở cấp toàn khoá: người học luôn nhìn thấy mình
 * đang ở đâu và còn gì phía trước. Cảm giác định vị được làm giảm lo lắng và
 * tăng khả năng gắn kiến thức mới vào khung sẵn có.
 */

import { useMemo, useState } from 'react';
import { TRACKS, COURSE_STATS } from '../content';
import { useProgress } from '../lib/storage';
import { trackProgress, courseProgress, lessonState } from '../lib/mastery';
import { href } from '../lib/router';
import { Ring, LevelBadge } from '../components/Shared';
import { fmtDuration } from '../lib/utils';

export function RoadmapPage() {
  const p = useProgress();
  const course = useMemo(() => courseProgress(p), [p]);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="container stack" style={{ '--gap': 'var(--s-6)' } as React.CSSProperties}>
      <header>
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>Lộ trình</h1>
        <p className="muted" style={{ maxWidth: '62ch', marginTop: 'var(--s-2)' }}>
          Mười một chặng, xếp theo thứ tự phụ thuộc. Bạn có thể học lệch thứ tự, nhưng mỗi chặng đều giả định
          bạn đã nắm chặng trước — nhảy cóc thường tốn thời gian hơn là tiết kiệm.
        </p>
      </header>

      <div className="card">
        <div className="row-wrap">
          <Ring value={course.ratio} size={64} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <b>
              {course.done}/{course.total} bài hoàn thành
            </b>
            <div className="faint">
              {course.mastered} bài đã thành thạo · còn lại khoảng{' '}
              {fmtDuration(TRACKS.reduce((s, t) => s + trackProgress(t.id, p).minutesLeft, 0))}
            </div>
          </div>
          <div className="row-wrap faint" style={{ gap: 'var(--s-4)' }}>
            <span>{COURSE_STATS.cards} thẻ ghi nhớ</span>
            <span>{COURSE_STATS.questions} câu hỏi</span>
            <span>24 phòng lab</span>
          </div>
        </div>
      </div>

      <div className="roadmap">
        {TRACKS.map((t, ti) => {
          const tp = trackProgress(t.id, p);
          const isOpen = open === t.id;
          const done = tp.total > 0 && tp.done === tp.total;
          return (
            <div className="rm-track" key={t.id} data-hue={t.hue}>
              <div className="rm-rail">
                <div className="rm-dot" aria-hidden>{done ? '✓' : t.icon}</div>
                {ti < TRACKS.length - 1 && <div className="rm-line" />}
              </div>

              <div className="card card-hover" style={{ marginBottom: 'var(--s-3)' }}>
                <button
                  onClick={() => setOpen(isOpen ? null : t.id)}
                  aria-expanded={isOpen}
                  style={{ width: '100%', textAlign: 'left', display: 'block' }}
                >
                  <div className="row-wrap" style={{ gap: 'var(--s-2)', marginBottom: 4 }}>
                    <span className="chip chip-hue">Chặng {t.order}</span>
                    <span className="spacer" />
                    <span className="faint nowrap">{tp.done}/{tp.total} bài</span>
                    {tp.mastered > 0 && <span className="chip chip-ok">★ {tp.mastered}</span>}
                  </div>
                  <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t.title}</h2>
                  <div style={{ color: 'var(--hue-text)', fontSize: 'var(--fs-sm)', fontWeight: 550, marginTop: 2 }}>
                    {t.tagline}
                  </div>
                  <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--s-2)' }}>{t.blurb}</p>
                  <div className="bar" style={{ marginTop: 'var(--s-3)' }}>
                    <div className="bar-fill" style={{ width: `${tp.ratio * 100}%` }} />
                  </div>
                </button>

                {isOpen && (
                  <div style={{ marginTop: 'var(--s-4)', paddingTop: 'var(--s-4)', borderTop: '1px solid var(--border-subtle)' }} className="anim-in">
                    <div className="stat-k" style={{ marginBottom: 'var(--s-2)' }}>Sau chặng này bạn làm được</div>
                    <ul style={{ fontSize: 'var(--fs-sm)', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 'var(--s-4)' }}>
                      {t.outcomes.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>

                    <div className="stack" style={{ '--gap': 'var(--s-2)' } as React.CSSProperties}>
                      {t.lessons.map((l) => {
                        const st = lessonState(l, p);
                        return (
                          <a
                            key={l.id}
                            href={href(`/hoc/${l.id}`)}
                            className="row-wrap"
                            style={{
                              textDecoration: 'none',
                              color: 'inherit',
                              padding: 'var(--s-3)',
                              borderRadius: 'var(--r-md)',
                              border: '1px solid var(--border-subtle)',
                              background: 'var(--bg-sunken)',
                              gap: 'var(--s-3)',
                            }}
                          >
                            <span aria-hidden style={{ width: 18 }}>
                              {st === 'thanh-thao' ? '★' : st === 'da-xong' ? '✓' : st === 'dang-hoc' ? '▸' : st === 'khoa' ? '🔒' : '○'}
                            </span>
                            <span style={{ flex: 1, minWidth: 180 }}>
                              <b style={{ fontSize: 'var(--fs-sm)' }}>{l.title}</b>
                              <span className="faint" style={{ display: 'block' }}>{l.subtitle}</span>
                            </span>
                            <LevelBadge level={l.level} />
                            <span className="faint nowrap">{l.minutes}′</span>
                          </a>
                        );
                      })}
                    </div>

                    <a className="btn btn-primary btn-sm" style={{ marginTop: 'var(--s-4)' }} href={href(`/chang/${t.id}`)}>
                      Mở chặng này →
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
