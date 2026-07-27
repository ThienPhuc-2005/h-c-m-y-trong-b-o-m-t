/**
 * Trang tiến độ.
 *
 * Triết lý: hiển thị sự thật, kể cả khi sự thật không dễ chịu. Một bảng điều
 * khiển toàn màu xanh làm người học yên tâm rồi ngừng ôn — và ba tháng sau
 * phát hiện mình đã quên sạch. Vì thế ở đây có cả "khái niệm đang phai mờ" và
 * "bạn tự tin quá mức ở đâu", chứ không chỉ có số bài đã xong.
 */

import { useMemo } from 'react';
import { useProgress, computeStreak } from '../lib/storage';
import { courseProgress, masteryMap, MASTERY_KEY, calibration, calibrationVerdict, BADGES, trackProgress } from '../lib/mastery';
import { memoryHealth } from '../lib/plan';
import { forecast, currentRetention } from '../lib/srs';
import { ALL_CARDS, TRACKS, COURSE_STATS } from '../content';
import { Ring, MiniBars, SectionHead } from '../components/Shared';
import { fmtDuration, fmtNum, fmtDate } from '../lib/utils';
import { href } from '../lib/router';
import { Icon } from '../components/Icon';
import { useT } from '../i18n';

export function ProgressPage() {
  const t = useT();
  const p = useProgress();
  const course = useMemo(() => courseProgress(p), [p]);
  const streak = useMemo(() => computeStreak(p), [p]);
  const health = useMemo(() => memoryHealth(p), [p]);
  const mastery = useMemo(() => masteryMap(p).filter((m) => m.seen > 0), [p]);
  const cal = useMemo(() => calibration(p), [p]);
  const verdictKey = useMemo(() => calibrationVerdict(p), [p]);
  const mems = useMemo(() => ALL_CARDS.map((c) => p.cards[c.id]).filter(Boolean), [p]);
  const fc = useMemo(() => forecast(mems, 30), [mems]);

  const totalMinutes = p.days.reduce((s, d) => s + d.minutes, 0);
  const totalReviews = p.days.reduce((s, d) => s + d.reviews, 0);
  const totalQ = p.days.reduce((s, d) => s + d.quizAnswered, 0);
  const totalQC = p.days.reduce((s, d) => s + d.quizCorrect, 0);

  const last30 = useMemo(() => {
    const out: { date: string; minutes: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      out.push({ date: key, minutes: p.days.find((x) => x.date === key)?.minutes ?? 0 });
    }
    return out;
  }, [p.days]);

  const fading = mastery.filter((m) => m.score < 0.68).slice(0, 10);

  return (
    <div className="container stack" style={{ '--gap': 'var(--s-8)' } as React.CSSProperties}>
      <header>
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>{t('progress.title')}</h1>
        <p className="muted" style={{ maxWidth: '64ch', marginTop: 'var(--s-2)' }}>{t('progress.intro')}</p>
      </header>

      {/* ---- Tổng quan ---------------------------------------------------- */}
      <section className="grid grid-4">
        <div className="card">
          <div className="row">
            <Ring value={course.ratio} size={54} />
            <div>
              <div className="stat-k">{t('progress.lessonsStat')}</div>
              <div className="stat-v" style={{ fontSize: 'var(--fs-lg)' }}>{course.done}/{course.total}</div>
              <div className="faint">{t('progress.masteredShort', { n: course.mastered })}</div>
            </div>
          </div>
        </div>
        <div className="stat">
          <div className="stat-k">{t('progress.totalTime')}</div>
          <div className="stat-v" style={{ fontSize: 'var(--fs-xl)' }}>{fmtDuration(totalMinutes)}</div>
          <div className="stat-sub">{t('progress.activeDays', { n: p.days.length })}</div>
        </div>
        <div className="stat">
          <div className="stat-k">{t('progress.reviewCount')}</div>
          <div className="stat-v" style={{ fontSize: 'var(--fs-xl)' }}>{fmtNum(totalReviews)}</div>
          <div className="stat-sub">{t('progress.trackedCards', { n: health.tracked })}</div>
        </div>
        <div className="stat">
          <div className="stat-k">{t('progress.streak')}</div>
          <div className="stat-v" style={{ fontSize: 'var(--fs-xl)' }}>{streak.current}</div>
          <div className="stat-sub">{t('progress.longest', { n: streak.longest })}</div>
        </div>
      </section>

      {/* ---- Hoạt động 30 ngày -------------------------------------------- */}
      <section className="card">
        <SectionHead
          title={t('progress.last30')}
          sub={t('progress.last30Sub', {
            goal: p.settings.dailyGoalMinutes,
            avg: (last30.reduce((s, d) => s + d.minutes, 0) / 30).toFixed(1),
          })}
        />
        <MiniBars values={last30.map((d) => d.minutes)} labels={last30.map((d) => d.date)} height={80} color="var(--brand)" />
        <div className="row-wrap faint" style={{ justifyContent: 'space-between', marginTop: 6 }}>
          <span>{last30[0]?.date}</span>
          <span>{t('progress.today')}</span>
        </div>
      </section>

      {/* ---- Sức khoẻ trí nhớ --------------------------------------------- */}
      {health.tracked > 0 && (
        <section className="grid grid-split" style={{ '--split-a': '1fr', '--split-b': '1.2fr' } as React.CSSProperties}>
          <div className="card">
            <SectionHead title={t('progress.memoryHealth')} />
            <div className="row" style={{ marginBottom: 'var(--s-4)' }}>
              <Ring value={health.avgRetention} size={72} />
              <div>
                <div style={{ fontSize: 'var(--fs-sm)' }}>
                  {t('progress.avgRetentionOn', { n: health.tracked })}
                </div>
                <div className="faint" style={{ marginTop: 4 }}>
                  {t('progress.yourTarget', { n: (p.settings.targetRetention * 100).toFixed(0) })}
                </div>
              </div>
            </div>
            <div className="grid grid-3">
              <div className="stat" style={{ background: 'var(--ok-soft)', borderColor: 'var(--ok-border)' }}>
                <div className="stat-k">{t('progress.longTerm')}</div>
                <div className="stat-v" style={{ fontSize: 'var(--fs-lg)', color: 'var(--ok-text)' }}>{health.longTerm}</div>
                <div className="stat-sub">{t('progress.longTermSub')}</div>
              </div>
              <div className="stat" style={{ background: 'var(--warn-soft)', borderColor: 'var(--warn-border)' }}>
                <div className="stat-k">{t('progress.fadingStat')}</div>
                <div className="stat-v" style={{ fontSize: 'var(--fs-lg)', color: 'var(--warn-text)' }}>{health.fading}</div>
                <div className="stat-sub">{t('progress.fadingSub')}</div>
              </div>
              <div className="stat" style={{ background: 'var(--bad-soft)', borderColor: 'var(--bad-border)' }}>
                <div className="stat-k">{t('progress.atRisk')}</div>
                <div className="stat-v" style={{ fontSize: 'var(--fs-lg)', color: 'var(--bad-text)' }}>{health.atRisk}</div>
                <div className="stat-sub">{t('progress.atRiskSub')}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <SectionHead title={t('progress.forecast')} sub={t('progress.forecastSub')} />
            <MiniBars values={fc} height={110} color="var(--info)" />
            <div className="row-wrap faint" style={{ justifyContent: 'space-between', marginTop: 6 }}>
              <span>{t('progress.today')}</span>
              <span>{t('progress.plus30')}</span>
            </div>
            <div className="faint" style={{ marginTop: 'var(--s-3)' }}>
              {t('progress.heaviestDay', { n: Math.max(...fc) })}
            </div>
          </div>
        </section>
      )}

      {/* ---- Hiệu chuẩn siêu nhận thức ------------------------------------ */}
      {p.calibration.length >= 8 && (
        <section className="card">
          <SectionHead
            title={t('progress.calibTitle')}
            sub={t('progress.calibSub')}
          />
          {verdictKey && (
            <div className="callout co-insight" style={{ marginBottom: 'var(--s-4)' }}>
              <Icon className="callout-icon" name="target" size={18} />
              <div className="callout-body">{t(verdictKey)}</div>
            </div>
          )}
          <div className="stack" style={{ '--gap': 'var(--s-3)' } as React.CSSProperties}>
            {cal.map((b) => (
              <div key={b.conf}>
                <div className="row" style={{ fontSize: 'var(--fs-sm)', marginBottom: 4 }}>
                  <b style={{ flex: '0 0 110px' }}>{t(b.labelKey)}</b>
                  <span className="faint">{t('progress.youThought', { n: (b.conf * 100).toFixed(0) })}</span>
                  <span className="spacer" />
                  <span className={b.n === 0 ? 'faint' : Math.abs(b.gap) < 0.1 ? 'chip chip-ok' : 'chip chip-warn'}>
                    {b.n === 0
                      ? t('progress.noData')
                      : t('progress.actualPct', { pct: (b.accuracy * 100).toFixed(0), n: b.n })}
                  </span>
                </div>
                <div style={{ position: 'relative', height: 8 }}>
                  <div className="bar" style={{ position: 'absolute', inset: 0 }}>
                    <div className="bar-fill" style={{ width: `${b.accuracy * 100}%`, background: 'var(--brand)' }} />
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      left: `${b.conf * 100}%`,
                      top: -3,
                      width: 2,
                      height: 14,
                      background: 'var(--text)',
                      opacity: 0.55,
                    }}
                    title={t('progress.statedConfidence')}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- Khái niệm đang yếu ------------------------------------------- */}
      {fading.length > 0 && (
        <section className="card">
          <SectionHead
            title={t('progress.weakTitle')}
            sub={t('progress.weakSub')}
            action={
              <a className="btn btn-sm btn-primary" href={href('/luyen-tap')}>
                {t('progress.practiceThese')} <Icon name="arrow-right" size={14} />
              </a>
            }
          />
          <div className="stack" style={{ '--gap': 'var(--s-2)' } as React.CSSProperties}>
            {fading.map((m) => (
              <div key={m.concept} className="row" style={{ gap: 'var(--s-3)' }}>
                <span className="mono" style={{ fontSize: 'var(--fs-xs)', flex: '0 0 30%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.concept}
                </span>
                <div className="bar" style={{ flex: 1 }}>
                  <div
                    className="bar-fill"
                    style={{ width: `${m.score * 100}%`, background: m.score >= 0.45 ? 'var(--warn)' : 'var(--bad)' }}
                  />
                </div>
                <span className="faint nowrap" style={{ flex: '0 0 130px', textAlign: 'right' }}>
                  {t(MASTERY_KEY[m.level])} · {t('mastery.seenTimes', { n: m.seen })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- Tiến độ theo chặng ------------------------------------------- */}
      <section className="card">
        <SectionHead title={t('progress.byTrack')} />
        <div className="stack" style={{ '--gap': 'var(--s-3)' } as React.CSSProperties}>
          {TRACKS.map((tr) => {
            const tp = trackProgress(tr.id, p);
            return (
              <a key={tr.id} href={href(`/chang/${tr.id}`)} className="row" data-hue={tr.hue} style={{ textDecoration: 'none', color: 'inherit', gap: 'var(--s-3)' }}>
                <span style={{ width: 24 }}><Icon name={tr.icon} size={18} /></span>
                <span style={{ flex: '0 0 28%', fontSize: 'var(--fs-sm)', fontWeight: 550, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tr.title}
                </span>
                <div className="bar" style={{ flex: 1 }}>
                  <div className="bar-fill" style={{ width: `${tp.ratio * 100}%` }} />
                </div>
                <span className="faint nowrap" style={{ flex: '0 0 92px', textAlign: 'right' }}>
                  {tp.done}/{tp.total}
                  {tp.mastered > 0 && <> · <Icon name="star" size={11} filled /> {tp.mastered}</>}
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* ---- Huy hiệu ------------------------------------------------------ */}
      <section>
        <SectionHead
          title={t('progress.badgesTitle')}
          sub={t('progress.badgesSub')}
        />
        <div className="badge-grid">
          {BADGES.map((b) => {
            const earned = b.earned(p);
            return (
              <div key={b.id} className={`badge ${earned ? 'earned' : ''}`} title={t(b.descKey)}>
                <div className="badge-ico"><Icon name={b.icon} size={30} stroke={1.6} /></div>
                <div className="badge-name">{t(b.nameKey)}</div>
                <div className="badge-desc">{t(b.descKey)}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- Số liệu thô --------------------------------------------------- */}
      <section className="panel">
        <div className="stat-k" style={{ marginBottom: 'var(--s-3)' }}>{t('progress.rawTitle')}</div>
        <div className="grid grid-4" style={{ fontSize: 'var(--fs-sm)' }}>
          <div><b>{fmtNum(totalQ)}</b><div className="faint">{t('progress.answered')}</div></div>
          <div><b>{totalQ ? ((totalQC / totalQ) * 100).toFixed(0) : 0}%</b><div className="faint">{t('progress.accuracy')}</div></div>
          <div><b>{Object.keys(p.notes).filter((k) => p.notes[k]?.trim()).length}</b><div className="faint">{t('progress.withNotes')}</div></div>
          <div><b>{p.flagged.length}</b><div className="faint">{t('progress.flaggedCards')}</div></div>
          <div><b>{fmtNum(COURSE_STATS.cards)}</b><div className="faint">{t('progress.totalCards')}</div></div>
          <div><b>{mems.filter((m) => currentRetention(m) > 0.95).length}</b><div className="faint">{t('progress.above95')}</div></div>
          <div><b>{Object.keys(p.checks).filter((k) => k.startsWith('lab:')).length}</b><div className="faint">{t('progress.labsOpened')}</div></div>
          <div><b>{fmtDate(p.createdAt)}</b><div className="faint">{t('progress.startDate')}</div></div>
        </div>
      </section>
    </div>
  );
}
