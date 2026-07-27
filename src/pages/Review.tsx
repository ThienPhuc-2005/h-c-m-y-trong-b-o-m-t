/**
 * Phiên ôn tập — trái tim của việc chống quên.
 *
 * Chi tiết nhỏ nhưng quan trọng:
 *  - Nút chấm điểm hiện luôn KHOẢNG CÁCH THẬT ("Được → 12 ngày"). Sự minh bạch
 *    này khiến người học tin hệ thống và nhờ đó chấm điểm thật thà hơn; chấm
 *    thật thà là điều kiện duy nhất để thuật toán hoạt động.
 *  - Phím tắt: Space lật thẻ, 1–4 chấm điểm. Người ôn 50 thẻ/ngày mà phải rê
 *    chuột 100 lần sẽ bỏ cuộc trong hai tuần.
 *  - Không có "combo", không có điểm số, không có âm thanh chiến thắng. Ôn tập
 *    là việc bảo trì, không phải trò chơi; biến nó thành game sẽ khiến người
 *    học tối ưu cho điểm thay vì cho trí nhớ.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useProgress, putCard, logReview, logMinutes, toggleFlag } from '../lib/storage';
import { buildPlan } from '../lib/plan';
import { GRADE_META, formatInterval, previewIntervals, schedule, type Grade, newCardMemory } from '../lib/srs';
import type { CardRef } from '../content';
import { getTrack } from '../content';
import { href } from '../lib/router';
import { Empty } from '../components/Shared';

export function ReviewPage() {
  const p = useProgress();
  const plan = useMemo(() => buildPlan(p), [p]);

  const [queue, setQueue] = useState<CardRef[] | null>(null);
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [startedAt] = useState(Date.now());

  // Xây hàng đợi MỘT LẦN khi vào trang: nếu tính lại theo p thì mỗi lần chấm
  // điểm hàng đợi sẽ nhảy loạn dưới tay người học.
  useEffect(() => {
    if (queue === null) setQueue([...plan.due, ...plan.fresh]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.due.length, plan.fresh.length]);

  const card = queue?.[i];
  const memory = card ? (p.cards[card.id] ?? newCardMemory()) : null;
  const previews = useMemo(
    () => (memory ? previewIntervals(memory, Date.now(), { targetRetention: p.settings.targetRetention }) : null),
    [memory, p.settings.targetRetention],
  );

  const answer = useCallback(
    (g: Grade) => {
      if (!card || !memory) return;
      const isNew = memory.state === 'new';
      const res = schedule(memory, g, Date.now(), {
        targetRetention: p.settings.targetRetention,
        fuzz: true,
      });
      putCard(card.id, res.memory);
      logReview(isNew);
      setStats((s) => ({
        ...s,
        again: s.again + (g === 1 ? 1 : 0),
        hard: s.hard + (g === 2 ? 1 : 0),
        good: s.good + (g === 3 ? 1 : 0),
        easy: s.easy + (g === 4 ? 1 : 0),
      }));

      // Thẻ bị quên quay lại cuối hàng đợi trong cùng phiên — đó là điểm mấu chốt
      // của các bước học ngắn hạn: gặp lại ngay khi còn nóng.
      setQueue((q) => {
        if (!q) return q;
        if (g === 1) return [...q, card];
        return q;
      });
      setShown(false);
      setI((x) => x + 1);
    },
    [card, memory, p.settings.targetRetention],
  );

  /* ---- Phím tắt ---------------------------------------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      if (!card) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!shown) setShown(true);
        else answer(3);
        return;
      }
      if (shown && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        answer(Number(e.key) as Grade);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shown, answer, card]);

  /* ---- Ghi thời gian khi rời trang -------------------------------------- */
  useEffect(() => {
    return () => {
      const mins = Math.min(90, (Date.now() - startedAt) / 60000);
      if (mins > 0.3) logMinutes(Math.round(mins * 10) / 10);
    };
  }, [startedAt]);

  /* ---- Trạng thái rỗng --------------------------------------------------- */
  if (!queue || queue.length === 0) {
    return (
      <div className="container container-narrow">
        <Empty
          icon="🌤️"
          title="Không còn thẻ nào đến hạn"
          sub={
            Object.keys(p.cards).length === 0
              ? 'Thẻ ghi nhớ xuất hiện sau khi bạn hoàn thành bài học đầu tiên. Hệ thống sẽ tự đưa chúng quay lại đúng lúc bạn sắp quên.'
              : 'Trí nhớ của bạn đang khoẻ. Ôn thêm lúc này chỉ tốn thời gian mà không thêm được gì — đó là kết luận của mô hình, không phải lời an ủi.'
          }
          action={
            <div className="row" style={{ justifyContent: 'center' }}>
              <a className="btn btn-primary" href={href('/')}>Về trang chủ</a>
              <a className="btn" href={href('/luyen-tap')}>Luyện tập xen kẽ</a>
            </div>
          }
        />
      </div>
    );
  }

  /* ---- Kết thúc phiên ---------------------------------------------------- */
  if (!card) {
    const total = stats.again + stats.hard + stats.good + stats.easy;
    const mins = (Date.now() - startedAt) / 60000;
    const recallRate = total ? (total - stats.again) / total : 0;
    return (
      <div className="container container-narrow">
        <div className="card card-pad-lg center anim-in">
          <div style={{ fontSize: '2.6rem', marginBottom: 'var(--s-3)' }} aria-hidden>✅</div>
          <h1 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--s-2)' }}>Xong phiên ôn</h1>
          <p className="muted" style={{ marginBottom: 'var(--s-5)' }}>
            {total} lượt ôn trong {mins < 1 ? 'chưa tới một phút' : `${Math.round(mins)} phút`}. Những gì bạn
            vừa làm sẽ giữ số kiến thức này thêm nhiều tuần nữa.
          </p>

          <div className="grid grid-4" style={{ marginBottom: 'var(--s-5)' }}>
            {[
              { k: 'Quên rồi', v: stats.again, c: 'var(--bad-text)' },
              { k: 'Khó', v: stats.hard, c: 'var(--warn-text)' },
              { k: 'Được', v: stats.good, c: 'var(--ok-text)' },
              { k: 'Dễ', v: stats.easy, c: 'var(--info-text)' },
            ].map((s) => (
              <div className="stat" key={s.k}>
                <div className="stat-k">{s.k}</div>
                <div className="stat-v" style={{ color: s.c, fontSize: 'var(--fs-xl)' }}>{s.v}</div>
              </div>
            ))}
          </div>

          <div className="callout co-insight" style={{ textAlign: 'left', marginBottom: 'var(--s-5)' }}>
            <span className="callout-icon" aria-hidden>💡</span>
            <div className="callout-body">
              {recallRate > 0.95
                ? 'Bạn nhớ gần như hết. Điều đó nghe hay nhưng lại có nghĩa là hệ thống đang cho bạn ôn hơi sớm — bạn đang tốn thời gian cho thứ chưa cần. Thử hạ mục tiêu ghi nhớ xuống 0,85 trong Cài đặt.'
                : recallRate < 0.75
                  ? 'Tỉ lệ quên hơi cao. Có thể bạn đang nạp bài mới nhanh hơn tốc độ củng cố. Thử giảm số thẻ mới mỗi ngày, hoặc quay lại đọc kỹ hơn phần bạn hay quên.'
                  : 'Tỉ lệ nhớ của bạn đang ở vùng tối ưu (khoảng 85–92%). Quên một chút là dấu hiệu tốt: nó nghĩa là mỗi lần ôn đều thực sự làm việc gì đó cho trí nhớ.'}
            </div>
          </div>

          <div className="row" style={{ justifyContent: 'center' }}>
            <a className="btn btn-primary" href={href('/')}>Về trang chủ</a>
            <a className="btn" href={href('/luyen-tap')}>Luyện tập thêm</a>
          </div>
        </div>
      </div>
    );
  }

  const track = getTrack(card.trackId);
  const isNew = memory!.state === 'new';
  const flagged = p.flagged.includes(card.id);

  return (
    <div className="container container-narrow stack" data-hue={track?.hue}>
      <div className="row-wrap" style={{ justifyContent: 'space-between' }}>
        <div className="faint">
          {i + 1} / {queue.length}
          {isNew && <span className="chip chip-info" style={{ marginLeft: 8 }}>thẻ mới</span>}
        </div>
        <a href={href('/')} className="faint" style={{ textDecoration: 'none' }}>Dừng phiên ✕</a>
      </div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${(i / queue.length) * 100}%` }} />
      </div>

      <div className="flash">
        <span className="flash-tag chip chip-hue">{track?.icon} {track?.title}</span>
        <button
          onClick={() => toggleFlag(card.id)}
          title={flagged ? 'Bỏ đánh dấu' : 'Đánh dấu để xem lại'}
          style={{ position: 'absolute', top: 'var(--s-4)', right: 'var(--s-4)', fontSize: '1.1rem', opacity: flagged ? 1 : 0.32 }}
          aria-pressed={flagged}
        >
          🚩
        </button>

        <div className="flash-front">{card.front}</div>

        {shown ? (
          <div className="flash-back">
            {card.back}
            {card.hint && <div className="faint" style={{ marginTop: 'var(--s-3)' }}>Gợi ý: {card.hint}</div>}
          </div>
        ) : (
          <div className="center" style={{ marginTop: 'var(--s-6)' }}>
            {card.hint && <div className="faint" style={{ marginBottom: 'var(--s-3)' }}>Gợi ý: {card.hint}</div>}
            <div className="faint">Cố nhớ lại trước đã — chính lúc vật lộn này mới là lúc trí nhớ được củng cố.</div>
          </div>
        )}
      </div>

      {!shown ? (
        <button className="btn btn-primary btn-lg btn-block" onClick={() => setShown(true)}>
          Xem đáp án <kbd style={{ marginLeft: 8 }}>Space</kbd>
        </button>
      ) : (
        <div className="stack" style={{ '--gap': 'var(--s-2)' } as React.CSSProperties}>
          <div className="grades">
            {([1, 2, 3, 4] as Grade[]).map((g) => (
              <button key={g} className={`grade ${GRADE_META[g].cls}`} onClick={() => answer(g)} title={GRADE_META[g].desc}>
                <b>{GRADE_META[g].label}</b>
                {p.settings.showIntervals && previews && <span>{formatInterval(previews[g])}</span>}
                <span style={{ opacity: 0.6 }}>{g}</span>
              </button>
            ))}
          </div>
          <div className="faint center">
            Chấm thật thà. Bấm "Dễ" cho thẻ bạn thực ra phải nghĩ 5 giây là tự phá lịch ôn của chính mình.
          </div>
          <div className="center">
            <a className="faint" href={href(`/hoc/${card.lessonId}`)} style={{ fontSize: 'var(--fs-xs)' }}>
              Xem lại bài: {card.lessonTitle} →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
