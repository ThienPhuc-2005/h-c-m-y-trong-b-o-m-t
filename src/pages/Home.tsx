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
import { fmtDuration } from '../lib/utils';
import { forecast } from '../lib/srs';
import { ALL_CARDS } from '../content';

export function HomePage() {
  const p = useProgress();
  const plan = useMemo(() => buildPlan(p), [p]);
  const streak = useMemo(() => computeStreak(p), [p]);
  const course = useMemo(() => courseProgress(p), [p]);
  const health = useMemo(() => memoryHealth(p), [p]);
  const next = useMemo(() => nextLesson(p), [p]);
  const rusty = useMemo(() => lessonsNeedingReview(p, 3), [p]);
  const badges = useMemo(() => earnedBadges(p), [p]);
  const verdict = useMemo(() => calibrationVerdict(p), [p]);
  const fc = useMemo(() => forecast(ALL_CARDS.map((c) => p.cards[c.id]).filter(Boolean), 14), [p]);

  const isNew = Object.keys(p.lessons).length === 0;
  const goalPct = Math.min(1, plan.minutesToday / p.settings.dailyGoalMinutes);
  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <div className="container stack" style={{ '--gap': 'var(--s-8)' } as React.CSSProperties}>
      {/* ---------------------------------------------------------------- */}
      <header className="stack" style={{ '--gap': 'var(--s-2)' } as React.CSSProperties}>
        <div className="faint">
          {greeting}{p.settings.name ? `, ${p.settings.name}` : ''}
        </div>
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>{plan.headline}</h1>
      </header>

      {/* ---- Việc cần làm hôm nay --------------------------------------- */}
      <section className="grid" style={{ gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 'var(--s-5)' }}>
        <div className="stack">
          {plan.due.length > 0 && (
            <a className="card card-hover" href={href('/on-tap')} style={{ textDecoration: 'none', color: 'inherit', borderColor: 'var(--brand-border)', background: 'var(--brand-soft)' }}>
              <div className="row">
                <div style={{ fontSize: '1.8rem' }} aria-hidden>🔁</div>
                <div style={{ flex: 1 }}>
                  <div className="row" style={{ gap: 'var(--s-2)' }}>
                    <b style={{ fontSize: 'var(--fs-md)' }}>Ôn tập trước tiên</b>
                    <span className="chip chip-brand">{plan.due.length} thẻ</span>
                  </div>
                  <div className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
                    Những thẻ này đang ở ngưỡng sắp quên. Bỏ qua hôm nay là để công sức trước đó bốc hơi.
                  </div>
                </div>
                <div className="faint nowrap">≈ {Math.max(1, Math.round((plan.due.length * 9) / 60))} phút</div>
              </div>
              {plan.dueOverflow > 0 && (
                <div className="faint" style={{ marginTop: 'var(--s-3)', paddingTop: 'var(--s-3)', borderTop: '1px solid var(--brand-border)' }}>
                  Còn {plan.dueOverflow} thẻ vượt trần hôm nay — sẽ tự động chuyển sang mai. Đây là cơ chế bảo
                  vệ để bạn không bị ngợp.
                </div>
              )}
            </a>
          )}

          {next && (
            <div>
              <SectionHead
                title={isNew ? 'Bắt đầu từ đây' : plan.due.length > 0 ? 'Sau đó, bài học tiếp theo' : 'Bài học tiếp theo'}
                sub={isNew ? 'Không cần biết gì trước. Bài đầu tiên chỉ 14 phút.' : undefined}
              />
              <LessonCard lesson={next} track={getTrack(next.trackId)} showTrack />
            </div>
          )}

          {plan.drills.length > 0 && (
            <a className="card card-hover" href={href('/luyen-tap')} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="row">
                <div style={{ fontSize: '1.5rem' }} aria-hidden>🎲</div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: 'var(--fs-sm)' }}>Luyện tập xen kẽ</b>
                  <div className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
                    {plan.drills.length} câu trộn từ nhiều chặng, ưu tiên chỗ bạn đang yếu.
                  </div>
                </div>
                <span className="faint nowrap">≈ {Math.round((plan.drills.length * 35) / 60)} phút</span>
              </div>
            </a>
          )}

          {rusty.length > 0 && (
            <div className="panel">
              <div className="stat-k" style={{ marginBottom: 'var(--s-3)' }}>Bài đang phai mờ</div>
              <div className="stack" style={{ '--gap': 'var(--s-2)' } as React.CSSProperties}>
                {rusty.map((l) => (
                  <a key={l.id} href={href(`/hoc/${l.id}`)} className="row" style={{ textDecoration: 'none', color: 'inherit', fontSize: 'var(--fs-sm)' }}>
                    <span aria-hidden>📉</span>
                    <span style={{ flex: 1 }}>{l.title}</span>
                    <span className="faint">xem lại →</span>
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
                <div className="stat-k">Mục tiêu hôm nay</div>
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                  {plan.minutesToday.toFixed(0)} / {p.settings.dailyGoalMinutes} phút
                </div>
                <div className="faint">{plan.goalMet ? '✓ Đã đạt — phần còn lại là thưởng' : 'Còn ' + Math.ceil(p.settings.dailyGoalMinutes - plan.minutesToday) + ' phút'}</div>
              </div>
            </div>

            <div className="stat-k" style={{ marginBottom: 6 }}>
              Chuỗi ngày {streak.current > 0 && <span className="chip chip-ok" style={{ marginLeft: 6 }}>🔥 {streak.current}</span>}
            </div>
            <div className="streak">
              {streak.week.map((d) => (
                <div key={d.date} className={`streak-day ${d.active ? 'on' : ''} ${d.isToday ? 'today' : ''}`} title={d.date}>
                  {d.label}
                </div>
              ))}
            </div>
            {streak.current === 0 && streak.longest > 0 && (
              <div className="faint" style={{ marginTop: 8 }}>
                Chuỗi dài nhất của bạn: {streak.longest} ngày. Nghỉ một hôm không xoá đi thứ bạn đã học — hệ
                thống ôn tập vẫn ở đó.
              </div>
            )}
          </div>

          <div className="card">
            <div className="row" style={{ marginBottom: 'var(--s-3)' }}>
              <Ring value={course.ratio} size={52} />
              <div style={{ flex: 1 }}>
                <div className="stat-k">Toàn khoá</div>
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                  {course.done}/{course.total} bài
                </div>
                <div className="faint">{course.mastered} bài đã thành thạo</div>
              </div>
            </div>
            <a className="btn btn-sm btn-block" href={href('/lo-trinh')}>Xem toàn bộ lộ trình →</a>
          </div>

          {health.tracked > 0 && (
            <div className="card">
              <div className="stat-k" style={{ marginBottom: 'var(--s-2)' }}>Sức khoẻ trí nhớ</div>
              <div className="row" style={{ marginBottom: 'var(--s-3)' }}>
                <div className="stat-v" style={{ fontSize: 'var(--fs-xl)', color: health.avgRetention > 0.85 ? 'var(--ok-text)' : 'var(--warn-text)' }}>
                  {(health.avgRetention * 100).toFixed(0)}%
                </div>
                <div className="faint" style={{ flex: 1 }}>
                  xác suất nhớ trung bình trên {health.tracked} thẻ
                </div>
              </div>
              <div className="row-wrap" style={{ gap: 'var(--s-2)' }}>
                <span className="chip chip-ok">{health.longTerm} vào trí nhớ dài hạn</span>
                {health.atRisk > 0 && <span className="chip chip-warn">{health.atRisk} có nguy cơ mất</span>}
              </div>
              <div style={{ marginTop: 'var(--s-4)' }}>
                <div className="stat-k" style={{ marginBottom: 6 }}>Tải ôn tập 14 ngày tới</div>
                <MiniBars values={fc} height={48} color="var(--brand)" />
              </div>
            </div>
          )}

          {verdict && (
            <div className="callout co-insight">
              <span className="callout-icon" aria-hidden>🎯</span>
              <div>
                <div className="callout-title">Tự đánh giá của bạn</div>
                <div className="callout-body" style={{ fontSize: 'var(--fs-sm)' }}>{verdict}</div>
              </div>
            </div>
          )}

          {badges.length > 0 && (
            <div className="card">
              <div className="stat-k" style={{ marginBottom: 'var(--s-3)' }}>Huy hiệu ({badges.length})</div>
              <div className="row-wrap" style={{ gap: 'var(--s-2)' }}>
                {badges.slice(-6).map((b) => (
                  <span key={b.id} title={b.desc} style={{ fontSize: '1.4rem' }} aria-label={b.name}>
                    {b.icon}
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
          <SectionHead title="App này hoạt động khác các khoá học bạn từng thấy" />
          <div className="grid grid-3">
            {[
              { i: '🤔', t: 'Hỏi trước, giảng sau', d: 'Bạn sẽ được hỏi những câu chưa biết trả lời. Đoán sai rồi đọc lời giải giúp nhớ mạnh hơn đọc thẳng — đây là kết quả nghiên cứu, không phải phong cách.' },
              { i: '🔁', t: 'Ôn đúng lúc sắp quên', d: 'Hệ thống tính ngày bạn sắp quên từng ý và đưa nó ra đúng lúc đó. Bạn không cần tự nhớ phải ôn gì.' },
              { i: '🔬', t: 'Học bằng cách vặn núm', d: '24 phòng lab chạy mô hình thật ngay trong trình duyệt. Kéo một thanh trượt và thấy hệ thống phát hiện sụp đổ dạy nhanh hơn mười trang chữ.' },
              { i: '🎯', t: 'Luôn trả lời "để làm gì"', d: 'Mỗi bài đều nói rõ kiến thức này dùng ở đâu trong công việc thật, ai dùng, và hỏng chuyện gì nếu không biết.' },
              { i: '📊', t: 'Đo cả sự tự tin', d: 'App theo dõi việc bạn có biết mình biết gì không. Tự tin thái quá là lỗ hổng nguy hiểm nhất vì bạn không bao giờ ôn lại nó.' },
              { i: '⏱️', t: 'Tôn trọng thời gian của bạn', d: 'Thời lượng ghi trên mỗi bài là thật. Không có bài nào kéo dài để lấp chỗ trống.' },
            ].map((c) => (
              <div className="card" key={c.t}>
                <div style={{ fontSize: '1.5rem', marginBottom: 'var(--s-2)' }} aria-hidden>{c.i}</div>
                <b style={{ fontSize: 'var(--fs-sm)' }}>{c.t}</b>
                <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 4 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {isNew && (
        <section className="panel">
          <div className="row-wrap" style={{ justifyContent: 'space-between' }}>
            <div>
              <b>Toàn bộ chương trình</b>
              <div className="faint">
                {COURSE_STATS.tracks} chặng · {COURSE_STATS.lessons} bài · {COURSE_STATS.cards} thẻ ghi nhớ ·{' '}
                {COURSE_STATS.questions} câu hỏi · {fmtDuration(COURSE_STATS.minutes)} nội dung
              </div>
            </div>
            <a className="btn" href={href('/lo-trinh')}>Xem bản đồ →</a>
          </div>
        </section>
      )}
    </div>
  );
}
