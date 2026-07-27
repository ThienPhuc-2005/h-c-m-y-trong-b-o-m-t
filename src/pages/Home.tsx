/**
 * Trang "Hôm nay" — nơi mọi phiên học bắt đầu.
 *
 * Nguyên tắc thiết kế quan trọng nhất ở đây: KHÔNG BẮT NGƯỜI HỌC QUYẾT ĐỊNH.
 * Mở app lên là thấy đúng một việc nên làm tiếp theo, kèm ước lượng thời gian
 * trung thực. Mọi thứ khác đẩy xuống dưới. Một màn hình đầy lựa chọn đẹp đẽ
 * thực ra là một rào cản: khi mệt, người ta không chọn — người ta đóng app.
 */

import { useMemo } from 'react';
import { useProgress, computeStreak } from '../lib/storage';
import { buildPlan, memoryHealth, lessonsNeedingReview } from '../lib/plan';
import { courseProgress, nextLesson, earnedBadges, calibrationVerdict } from '../lib/mastery';
import { getTrack, COURSE_STATS } from '../content';
import { href } from '../lib/router';
import { LessonCard, Ring, SectionHead, MiniBars } from '../components/Shared';
import { Icon } from '../components/Icon';
import { useT } from '../i18n';
import { fmtDuration } from '../lib/utils';
import { forecast } from '../lib/srs';
import { ALL_CARDS } from '../content';

export function HomePage() {
  const t = useT();
  const p = useProgress();
  const plan = useMemo(() => buildPlan(p), [p]);
  const streak = useMemo(() => computeStreak(p), [p]);
  const course = useMemo(() => courseProgress(p), [p]);
  const health = useMemo(() => memoryHealth(p), [p]);
  const next = useMemo(() => nextLesson(p), [p]);
  const rusty = useMemo(() => lessonsNeedingReview(p, 3), [p]);
  const badges = useMemo(() => earnedBadges(p), [p]);
  const verdictKey = useMemo(() => calibrationVerdict(p), [p]);
  const fc = useMemo(() => forecast(ALL_CARDS.map((c) => p.cards[c.id]).filter(Boolean), 14), [p]);

  const isNew = Object.keys(p.lessons).length === 0;
  const goalPct = Math.min(1, plan.minutesToday / p.settings.dailyGoalMinutes);
  const hour = new Date().getHours();
  const greeting = t(
    hour < 11 ? 'home.morning' : hour < 14 ? 'home.noon' : hour < 18 ? 'home.afternoon' : 'home.evening',
  );

  return (
    <div className="container stack" style={{ '--gap': 'var(--s-8)' } as React.CSSProperties}>
      {/* ---------------------------------------------------------------- */}
      <header className="stack" style={{ '--gap': 'var(--s-2)' } as React.CSSProperties}>
        <div className="faint">
          {greeting}{p.settings.name ? `, ${p.settings.name}` : ''}
        </div>
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>{t(plan.headline.key, plan.headline.vars)}</h1>
      </header>

      {/* ---- Việc cần làm hôm nay --------------------------------------- */}
      <section className="grid grid-split">
        <div className="stack">
          {plan.due.length > 0 && (
            <a className="card card-hover" href={href('/on-tap')} style={{ textDecoration: 'none', color: 'inherit', borderColor: 'var(--brand-border)', background: 'var(--brand-soft)' }}>
              <div className="row">
                <Icon name="repeat" size={28} className="faint" />
                <div style={{ flex: 1 }}>
                  <div className="row" style={{ gap: 'var(--s-2)' }}>
                    <b style={{ fontSize: 'var(--fs-md)' }}>{t('home.reviewFirst')}</b>
                    <span className="chip chip-brand">{plan.due.length} {t('common.cards')}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{t('home.reviewFirstSub')}</div>
                </div>
                <div className="faint nowrap">
                  {t('home.estMinutes', { n: Math.max(1, Math.round((plan.due.length * 9) / 60)) })}
                </div>
              </div>
              {plan.dueOverflow > 0 && (
                <div className="faint" style={{ marginTop: 'var(--s-3)', paddingTop: 'var(--s-3)', borderTop: '1px solid var(--brand-border)' }}>
                  {t('home.overflow', { n: plan.dueOverflow })}
                </div>
              )}
            </a>
          )}

          {next && (
            <div>
              <SectionHead
                title={t(isNew ? 'home.startHere' : plan.due.length > 0 ? 'home.thenNext' : 'home.nextLesson')}
                sub={isNew ? t('home.firstLessonSub') : undefined}
              />
              <LessonCard lesson={next} track={getTrack(next.trackId)} showTrack />
            </div>
          )}

          {plan.drills.length > 0 && (
            <a className="card card-hover" href={href('/luyen-tap')} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="row">
                <Icon name="dices" size={24} className="faint" />
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: 'var(--fs-sm)' }}>{t('home.drillTitle')}</b>
                  <div className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
                    {t('home.drillSub', { n: plan.drills.length })}
                  </div>
                </div>
                <span className="faint nowrap">
                  {t('home.estMinutes', { n: Math.round((plan.drills.length * 35) / 60) })}
                </span>
              </div>
            </a>
          )}

          {rusty.length > 0 && (
            <div className="panel">
              <div className="stat-k" style={{ marginBottom: 'var(--s-3)' }}>{t('home.fading')}</div>
              <div className="stack" style={{ '--gap': 'var(--s-2)' } as React.CSSProperties}>
                {rusty.map((l) => (
                  <a key={l.id} href={href(`/hoc/${l.id}`)} className="row" style={{ textDecoration: 'none', color: 'inherit', fontSize: 'var(--fs-sm)' }}>
                    <Icon name="trending-down" size={15} />
                    <span style={{ flex: 1 }}>{l.title}</span>
                    <span className="faint row" style={{ gap: 4 }}>
                      {t('home.reviewIt')} <Icon name="arrow-right" size={13} />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ---- Cột phải: trạng thái ------------------------------------- */}
        <div className="stack">
          <div className="card">
            <div className="row" style={{ marginBottom: 'var(--s-4)' }}>
              <Ring value={goalPct} size={62} label={`${Math.round(plan.minutesToday)}′`} />
              <div style={{ flex: 1 }}>
                <div className="stat-k">{t('home.goalToday')}</div>
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                  {plan.minutesToday.toFixed(0)} / {p.settings.dailyGoalMinutes} {t('common.minutes')}
                </div>
                <div className="faint">
                  {plan.goalMet
                    ? t('home.goalMet')
                    : t('home.goalLeft', { n: Math.ceil(p.settings.dailyGoalMinutes - plan.minutesToday) })}
                </div>
              </div>
            </div>

            <div className="stat-k" style={{ marginBottom: 6 }}>
              {t('home.streak')}{' '}
              {streak.current > 0 && (
                <span className="chip chip-ok" style={{ marginLeft: 6 }}>
                  <Icon name="flame" size={12} /> {streak.current}
                </span>
              )}
            </div>
            <div className="streak">
              {streak.week.map((d) => (
                <div key={d.date} className={`streak-day ${d.active ? 'on' : ''} ${d.isToday ? 'today' : ''}`} title={d.date}>
                  {d.label}
                </div>
              ))}
            </div>
            {streak.current === 0 && streak.longest > 0 && (
              <div className="faint" style={{ marginTop: 8 }}>{t('home.streakBroken', { n: streak.longest })}</div>
            )}
          </div>

          <div className="card">
            <div className="row" style={{ marginBottom: 'var(--s-3)' }}>
              <Ring value={course.ratio} size={52} />
              <div style={{ flex: 1 }}>
                <div className="stat-k">{t('home.wholeCourse')}</div>
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                  {course.done}/{course.total} {t('common.lessons')}
                </div>
                <div className="faint">{t('home.masteredN', { n: course.mastered })}</div>
              </div>
            </div>
            <a className="btn btn-sm btn-block" href={href('/lo-trinh')}>
              {t('home.seeRoadmap')} <Icon name="arrow-right" size={14} />
            </a>
          </div>

          {health.tracked > 0 && (
            <div className="card">
              <div className="stat-k" style={{ marginBottom: 'var(--s-2)' }}>{t('home.memoryHealth')}</div>
              <div className="row" style={{ marginBottom: 'var(--s-3)' }}>
                <div className="stat-v" style={{ fontSize: 'var(--fs-xl)', color: health.avgRetention > 0.85 ? 'var(--ok-text)' : 'var(--warn-text)' }}>
                  {(health.avgRetention * 100).toFixed(0)}%
                </div>
                <div className="faint" style={{ flex: 1 }}>{t('home.avgRetention', { n: health.tracked })}</div>
              </div>
              <div className="row-wrap" style={{ gap: 'var(--s-2)' }}>
                <span className="chip chip-ok">{t('home.longTerm', { n: health.longTerm })}</span>
                {health.atRisk > 0 && (
                  <span className="chip chip-warn">{t('home.atRisk', { n: health.atRisk })}</span>
                )}
              </div>
              <div style={{ marginTop: 'var(--s-4)' }}>
                <div className="stat-k" style={{ marginBottom: 6 }}>{t('home.load14')}</div>
                <MiniBars values={fc} height={48} color="var(--brand)" />
              </div>
            </div>
          )}

          {verdictKey && (
            <div className="callout co-insight">
              <Icon className="callout-icon" name="target" size={18} />
              <div>
                <div className="callout-title">{t('home.selfAssessment')}</div>
                <div className="callout-body" style={{ fontSize: 'var(--fs-sm)' }}>{t(verdictKey)}</div>
              </div>
            </div>
          )}

          {badges.length > 0 && (
            <div className="card">
              <div className="stat-k" style={{ marginBottom: 'var(--s-3)' }}>{t('home.badges', { n: badges.length })}</div>
              <div className="row-wrap" style={{ gap: 'var(--s-2)' }}>
                {badges.slice(-6).map((b) => (
                  <span key={b.id} title={t(b.descKey)} style={{ color: 'var(--ok-text)' }}>
                    <Icon name={b.icon} size={22} label={t(b.nameKey)} />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---- Người mới: giới thiệu cách app hoạt động -------------------- */}
      {isNew && (
        <section>
          <SectionHead title={t('home.introHead')} />
          <div className="grid grid-3">
            {[
              { i: 'help-circle' as const, n: 1 },
              { i: 'repeat' as const, n: 2 },
              { i: 'flask' as const, n: 3 },
              { i: 'target' as const, n: 4 },
              { i: 'chart' as const, n: 5 },
              { i: 'hourglass' as const, n: 6 },
            ].map((c) => (
              <div className="card" key={c.n}>
                <div style={{ marginBottom: 'var(--s-2)', color: 'var(--brand-text)' }}><Icon name={c.i} size={22} /></div>
                <b style={{ fontSize: 'var(--fs-sm)' }}>{t(`home.p${c.n}`)}</b>
                <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 4 }}>{t(`home.p${c.n}d`)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {isNew && (
        <section className="panel">
          <div className="row-wrap" style={{ justifyContent: 'space-between' }}>
            <div>
              <b>{t('home.wholeProgram')}</b>
              <div className="faint">
                {t('home.programStats', {
                  tracks: COURSE_STATS.tracks,
                  lessons: COURSE_STATS.lessons,
                  cards: COURSE_STATS.cards,
                  questions: COURSE_STATS.questions,
                  time: fmtDuration(COURSE_STATS.minutes),
                })}
              </div>
            </div>
            <a className="btn" href={href('/lo-trinh')}>
              {t('home.seeMap')} <Icon name="arrow-right" size={14} />
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
