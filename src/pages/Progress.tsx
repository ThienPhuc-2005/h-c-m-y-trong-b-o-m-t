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
import { courseProgress, masteryMap, MASTERY_LABEL, calibration, calibrationVerdict, BADGES, trackProgress } from '../lib/mastery';
import { memoryHealth } from '../lib/plan';
import { forecast, currentRetention } from '../lib/srs';
import { ALL_CARDS, TRACKS, COURSE_STATS } from '../content';
import { Ring, MiniBars, SectionHead } from '../components/Shared';
import { fmtDuration, fmtNum } from '../lib/utils';
import { href } from '../lib/router';

export function ProgressPage() {
  const p = useProgress();
  const course = useMemo(() => courseProgress(p), [p]);
  const streak = useMemo(() => computeStreak(p), [p]);
  const health = useMemo(() => memoryHealth(p), [p]);
  const mastery = useMemo(() => masteryMap(p).filter((m) => m.seen > 0), [p]);
  const cal = useMemo(() => calibration(p), [p]);
  const verdict = useMemo(() => calibrationVerdict(p), [p]);
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
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>Tiến độ</h1>
        <p className="muted" style={{ maxWidth: '64ch', marginTop: 'var(--s-2)' }}>
          Trang này cố tình cho bạn thấy cả điểm yếu, không chỉ thành tích. Một bảng điều khiển toàn xanh
          khiến người ta ngừng ôn — rồi ba tháng sau phát hiện đã quên sạch.
        </p>
      </header>

      {/* ---- Tổng quan ---------------------------------------------------- */}
      <section className="grid grid-4">
        <div className="card">
          <div className="row">
            <Ring value={course.ratio} size={54} />
            <div>
              <div className="stat-k">Bài học</div>
              <div className="stat-v" style={{ fontSize: 'var(--fs-lg)' }}>{course.done}/{course.total}</div>
              <div className="faint">{course.mastered} thành thạo</div>
            </div>
          </div>
        </div>
        <div className="stat">
          <div className="stat-k">Tổng thời gian</div>
          <div className="stat-v" style={{ fontSize: 'var(--fs-xl)' }}>{fmtDuration(totalMinutes)}</div>
          <div className="stat-sub">{p.days.length} ngày có hoạt động</div>
        </div>
        <div className="stat">
          <div className="stat-k">Lượt ôn thẻ</div>
          <div className="stat-v" style={{ fontSize: 'var(--fs-xl)' }}>{fmtNum(totalReviews)}</div>
          <div className="stat-sub">{health.tracked} thẻ đang theo dõi</div>
        </div>
        <div className="stat">
          <div className="stat-k">Chuỗi ngày</div>
          <div className="stat-v" style={{ fontSize: 'var(--fs-xl)' }}>{streak.current}</div>
          <div className="stat-sub">dài nhất: {streak.longest} ngày</div>
        </div>
      </section>

      {/* ---- Hoạt động 30 ngày -------------------------------------------- */}
      <section className="card">
        <SectionHead
          title="30 ngày gần nhất"
          sub={`Mục tiêu ${p.settings.dailyGoalMinutes} phút/ngày · trung bình thực tế ${(last30.reduce((s, d) => s + d.minutes, 0) / 30).toFixed(1)} phút`}
        />
        <MiniBars values={last30.map((d) => d.minutes)} labels={last30.map((d) => d.date)} height={80} color="var(--brand)" />
        <div className="row-wrap faint" style={{ justifyContent: 'space-between', marginTop: 6 }}>
          <span>{last30[0]?.date}</span>
          <span>hôm nay</span>
        </div>
      </section>

      {/* ---- Sức khoẻ trí nhớ --------------------------------------------- */}
      {health.tracked > 0 && (
        <section className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr)', gap: 'var(--s-5)' }}>
          <div className="card">
            <SectionHead title="Sức khoẻ trí nhớ" />
            <div className="row" style={{ marginBottom: 'var(--s-4)' }}>
              <Ring value={health.avgRetention} size={72} />
              <div>
                <div style={{ fontSize: 'var(--fs-sm)' }}>
                  Xác suất nhớ trung bình trên <b>{health.tracked}</b> thẻ đang theo dõi.
                </div>
                <div className="faint" style={{ marginTop: 4 }}>
                  Mục tiêu bạn đặt: {(p.settings.targetRetention * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            <div className="grid grid-3">
              <div className="stat" style={{ background: 'var(--ok-soft)', borderColor: 'var(--ok-border)' }}>
                <div className="stat-k">Dài hạn</div>
                <div className="stat-v" style={{ fontSize: 'var(--fs-lg)', color: 'var(--ok-text)' }}>{health.longTerm}</div>
                <div className="stat-sub">khoảng ôn &gt; 21 ngày</div>
              </div>
              <div className="stat" style={{ background: 'var(--warn-soft)', borderColor: 'var(--warn-border)' }}>
                <div className="stat-k">Đang phai</div>
                <div className="stat-v" style={{ fontSize: 'var(--fs-lg)', color: 'var(--warn-text)' }}>{health.fading}</div>
                <div className="stat-sub">nhớ dưới 90%</div>
              </div>
              <div className="stat" style={{ background: 'var(--bad-soft)', borderColor: 'var(--bad-border)' }}>
                <div className="stat-k">Nguy cơ mất</div>
                <div className="stat-v" style={{ fontSize: 'var(--fs-lg)', color: 'var(--bad-text)' }}>{health.atRisk}</div>
                <div className="stat-sub">nhớ dưới 70%</div>
              </div>
            </div>
          </div>

          <div className="card">
            <SectionHead title="Dự báo tải ôn tập 30 ngày tới" sub="Biết trước để không bị bất ngờ bởi một núi thẻ" />
            <MiniBars values={fc} height={110} color="var(--info)" />
            <div className="row-wrap faint" style={{ justifyContent: 'space-between', marginTop: 6 }}>
              <span>hôm nay</span>
              <span>+30 ngày</span>
            </div>
            <div className="faint" style={{ marginTop: 'var(--s-3)' }}>
              Ngày nặng nhất: {Math.max(...fc)} thẻ. Nếu con số này leo lên quá cao, hãy giảm hạn ngạch thẻ
              mới mỗi ngày trong Cài đặt — đó là cách duy nhất để giữ lịch bền vững.
            </div>
          </div>
        </section>
      )}

      {/* ---- Hiệu chuẩn siêu nhận thức ------------------------------------ */}
      {p.calibration.length >= 8 && (
        <section className="card">
          <SectionHead
            title="Bạn có biết mình biết gì không?"
            sub="So sánh mức tự tin bạn khai báo với tỉ lệ đúng thực tế"
          />
          {verdict && (
            <div className="callout co-insight" style={{ marginBottom: 'var(--s-4)' }}>
              <span className="callout-icon" aria-hidden>🎯</span>
              <div className="callout-body">{verdict}</div>
            </div>
          )}
          <div className="stack" style={{ '--gap': 'var(--s-3)' } as React.CSSProperties}>
            {cal.map((b) => (
              <div key={b.conf}>
                <div className="row" style={{ fontSize: 'var(--fs-sm)', marginBottom: 4 }}>
                  <b style={{ flex: '0 0 110px' }}>{b.label}</b>
                  <span className="faint">bạn nghĩ {(b.conf * 100).toFixed(0)}%</span>
                  <span className="spacer" />
                  <span className={b.n === 0 ? 'faint' : Math.abs(b.gap) < 0.1 ? 'chip chip-ok' : 'chip chip-warn'}>
                    {b.n === 0 ? 'chưa có dữ liệu' : `thực tế ${(b.accuracy * 100).toFixed(0)}% · ${b.n} câu`}
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
                    title="mức tự tin bạn khai báo"
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
            title="Khái niệm cần chú ý"
            sub="Điểm giảm dần theo thời gian nếu bạn không gặp lại — đây là sự thật, không phải hình phạt"
            action={<a className="btn btn-sm btn-primary" href={href('/luyen-tap')}>Luyện những chỗ này →</a>}
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
                  {MASTERY_LABEL[m.level]} · {m.seen} lần gặp
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- Tiến độ theo chặng ------------------------------------------- */}
      <section className="card">
        <SectionHead title="Theo từng chặng" />
        <div className="stack" style={{ '--gap': 'var(--s-3)' } as React.CSSProperties}>
          {TRACKS.map((t) => {
            const tp = trackProgress(t.id, p);
            return (
              <a key={t.id} href={href(`/chang/${t.id}`)} className="row" data-hue={t.hue} style={{ textDecoration: 'none', color: 'inherit', gap: 'var(--s-3)' }}>
                <span aria-hidden style={{ width: 24 }}>{t.icon}</span>
                <span style={{ flex: '0 0 28%', fontSize: 'var(--fs-sm)', fontWeight: 550, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.title}
                </span>
                <div className="bar" style={{ flex: 1 }}>
                  <div className="bar-fill" style={{ width: `${tp.ratio * 100}%` }} />
                </div>
                <span className="faint nowrap" style={{ flex: '0 0 92px', textAlign: 'right' }}>
                  {tp.done}/{tp.total}
                  {tp.mastered > 0 && ` · ★${tp.mastered}`}
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* ---- Huy hiệu ------------------------------------------------------ */}
      <section>
        <SectionHead
          title="Huy hiệu"
          sub="Tất cả đều gắn với thói quen học tốt — không có huy hiệu nào thưởng cho việc học nhồi 5 giờ liên tục"
        />
        <div className="badge-grid">
          {BADGES.map((b) => {
            const earned = b.earned(p);
            return (
              <div key={b.id} className={`badge ${earned ? 'earned' : ''}`} title={b.desc}>
                <div className="badge-ico" aria-hidden>{b.icon}</div>
                <div className="badge-name">{b.name}</div>
                <div className="badge-desc">{b.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- Số liệu thô --------------------------------------------------- */}
      <section className="panel">
        <div className="stat-k" style={{ marginBottom: 'var(--s-3)' }}>Số liệu chi tiết</div>
        <div className="grid grid-4" style={{ fontSize: 'var(--fs-sm)' }}>
          <div><b>{fmtNum(totalQ)}</b><div className="faint">câu hỏi đã trả lời</div></div>
          <div><b>{totalQ ? ((totalQC / totalQ) * 100).toFixed(0) : 0}%</b><div className="faint">tỉ lệ đúng tổng thể</div></div>
          <div><b>{Object.keys(p.notes).filter((k) => p.notes[k]?.trim()).length}</b><div className="faint">bài có ghi chú riêng</div></div>
          <div><b>{p.flagged.length}</b><div className="faint">thẻ đã đánh dấu</div></div>
          <div><b>{fmtNum(COURSE_STATS.cards)}</b><div className="faint">tổng số thẻ trong khoá</div></div>
          <div><b>{mems.filter((m) => currentRetention(m) > 0.95).length}</b><div className="faint">thẻ nhớ trên 95%</div></div>
          <div><b>{Object.keys(p.checks).filter((k) => k.startsWith('lab:')).length}</b><div className="faint">phòng lab đã mở</div></div>
          <div><b>{new Date(p.createdAt).toLocaleDateString('vi-VN')}</b><div className="faint">ngày bắt đầu</div></div>
        </div>
      </section>
    </div>
  );
}
