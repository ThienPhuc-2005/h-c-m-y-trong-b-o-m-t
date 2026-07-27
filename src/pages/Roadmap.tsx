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
import { Icon } from '../components/Icon';
import { Ring, LevelBadge } from '../components/Shared';
import { fmtDuration } from '../lib/utils';
import { useT } from '../i18n';

export function RoadmapPage() {
  const t = useT();
  const p = useProgress();
  const course = useMemo(() => courseProgress(p), [p]);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="container stack" style={{ '--gap': 'var(--s-6)' } as React.CSSProperties}>
      <header>
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>{t('roadmap.title')}</h1>
        <p className="muted" style={{ maxWidth: '62ch', marginTop: 'var(--s-2)' }}>{t('roadmap.intro')}</p>
      </header>

      <div className="card">
        <div className="row-wrap">
          <Ring value={course.ratio} size={64} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <b>{t('roadmap.doneOfTotal', { done: course.done, total: course.total })}</b>
            <div className="faint">
              {t('roadmap.masteredLeft', {
                n: course.mastered,
                time: fmtDuration(TRACKS.reduce((s, tr) => s + trackProgress(tr.id, p).minutesLeft, 0)),
              })}
            </div>
          </div>
          <div className="row-wrap faint" style={{ gap: 'var(--s-4)' }}>
            <span>{COURSE_STATS.cards} {t('common.memoryCards')}</span>
            <span>{COURSE_STATS.questions} {t('common.questions')}</span>
            <span>{COURSE_STATS.labs} {t('common.labs')}</span>
          </div>
        </div>
      </div>

      <div className="roadmap">
        {TRACKS.map((tr, ti) => {
          const tp = trackProgress(tr.id, p);
          const isOpen = open === tr.id;
          const done = tp.total > 0 && tp.done === tp.total;
          return (
            <div className="rm-track" key={tr.id} data-hue={tr.hue}>
              <div className="rm-rail">
                <div className="rm-dot">
                  <Icon name={done ? 'check' : tr.icon} size={21} />
                </div>
                {ti < TRACKS.length - 1 && <div className="rm-line" />}
              </div>

              <div className="card card-hover" style={{ marginBottom: 'var(--s-3)' }}>
                <button
                  onClick={() => setOpen(isOpen ? null : tr.id)}
                  aria-expanded={isOpen}
                  style={{ width: '100%', textAlign: 'left', display: 'block' }}
                >
                  <div className="row-wrap" style={{ gap: 'var(--s-2)', marginBottom: 4 }}>
                    <span className="chip chip-hue">{t('roadmap.track', { n: tr.order })}</span>
                    <span className="spacer" />
                    <span className="faint nowrap">{t('roadmap.lessonsOf', { done: tp.done, total: tp.total })}</span>
                    {tp.mastered > 0 && (
                      <span className="chip chip-ok">
                        <Icon name="star" size={12} filled /> {tp.mastered}
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: 'var(--fs-lg)' }}>{tr.title}</h2>
                  <div style={{ color: 'var(--hue-text)', fontSize: 'var(--fs-sm)', fontWeight: 550, marginTop: 2 }}>
                    {tr.tagline}
                  </div>
                  <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--s-2)' }}>{tr.blurb}</p>
                  <div className="bar" style={{ marginTop: 'var(--s-3)' }}>
                    <div className="bar-fill" style={{ width: `${tp.ratio * 100}%` }} />
                  </div>
                </button>

                {isOpen && (
                  <div style={{ marginTop: 'var(--s-4)', paddingTop: 'var(--s-4)', borderTop: '1px solid var(--border-subtle)' }} className="anim-in">
                    <div className="stat-k" style={{ marginBottom: 'var(--s-2)' }}>{t('roadmap.outcomes')}</div>
                    <ul style={{ fontSize: 'var(--fs-sm)', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 'var(--s-4)' }}>
                      {tr.outcomes.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>

                    <div className="stack" style={{ '--gap': 'var(--s-2)' } as React.CSSProperties}>
                      {tr.lessons.map((l) => {
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
                            <span style={{ width: 18, display: 'grid', placeItems: 'center' }}>
                              <Icon
                                size={15}
                                filled={st === 'thanh-thao'}
                                stroke={st === 'moi' ? 1.5 : 2}
                                name={
                                  st === 'thanh-thao'
                                    ? 'star'
                                    : st === 'da-xong'
                                      ? 'check'
                                      : st === 'dang-hoc'
                                        ? 'chevron-right'
                                        : st === 'khoa'
                                          ? 'lock'
                                          : 'circle'
                                }
                              />
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

                    <a className="btn btn-primary btn-sm" style={{ marginTop: 'var(--s-4)' }} href={href(`/chang/${tr.id}`)}>
                      {t('roadmap.openTrack')} <Icon name="arrow-right" size={14} />
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
