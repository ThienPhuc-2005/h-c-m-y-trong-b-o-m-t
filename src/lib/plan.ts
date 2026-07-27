/**
 * ============================================================================
 *  Bộ lập kế hoạch hằng ngày
 * ============================================================================
 *
 *  Vấn đề tâm lý cần giải: người học mở app lên và phải TỰ QUYẾT ĐỊNH hôm nay
 *  làm gì. Mỗi quyết định là một chi phí, và khi mệt thì chi phí đó đủ để
 *  người ta đóng app lại. Ta xoá bỏ quyết định đó: mở app lên là có một danh
 *  sách ngắn, đúng thứ tự, vừa với quỹ thời gian đã khai báo.
 *
 *  Thứ tự ưu tiên (KHÔNG được đảo):
 *    1. Thẻ đến hạn   — giữ cái đã có. Bỏ qua là để công sức cũ bốc hơi.
 *    2. Ôn điểm yếu   — khái niệm đã học nhưng đang lung lay.
 *    3. Bài mới       — chỉ thêm cái mới khi cái cũ đã an toàn.
 *
 *  Nguyên tắc "trần thẻ mới": nếu hôm nay học 80 thẻ mới, 3 ngày nữa bạn sẽ có
 *  80 thẻ đến hạn cộng dồn với lượng cũ. Vài lần như vậy là núi nợ ôn tập dựng
 *  lên và người học bỏ cuộc. Đây là nguyên nhân số 1 khiến người ta rời bỏ các
 *  app lặp lại ngắt quãng, nên ta chặn nó ngay từ đầu.
 * ============================================================================
 */

import type { CardRef } from '../content';
import { ALL_CARDS, ALL_QUIZ, getLesson } from '../content';
import type { QuizRef } from '../content';
import type { Lesson } from '../content/types';
import type { Progress } from './storage';
import { getProgress, todayKey } from './storage';
import { isDue, newCardMemory, currentRetention } from './srs';
import { lessonState, nextLesson, weakConcepts } from './mastery';
import { shuffle } from './utils';

export interface DailyPlan {
  /** Thẻ cần ôn hôm nay (đã đến hạn), đã sắp thứ tự. */
  due: CardRef[];
  /** Thẻ mới được phép giới thiệu hôm nay, trong hạn ngạch. */
  fresh: CardRef[];
  /** Số thẻ đến hạn bị cắt do vượt trần — vẫn báo cho người học biết. */
  dueOverflow: number;
  /** Bài học đề xuất tiếp theo. */
  lesson?: Lesson;
  /** Câu hỏi luyện tập xen kẽ, ưu tiên khái niệm yếu. */
  drills: QuizRef[];
  /** Ước lượng tổng thời gian (phút). */
  minutes: number;
  /** Đã đạt mục tiêu hôm nay chưa. */
  goalMet: boolean;
  minutesToday: number;
  /** Một câu định hướng hiển thị trên trang chủ. */
  /** Khoá dịch + biến nội suy cho câu dẫn ở đầu trang chủ. */
  headline: { key: string; vars?: Record<string, string | number> };
}

/** Ước lượng thời gian: thẻ ôn ~9 giây, thẻ mới ~20 giây, câu luyện tập ~35 giây. */
const SEC_REVIEW = 9;
const SEC_NEW = 20;
const SEC_DRILL = 35;

export function buildPlan(p: Progress = getProgress()): DailyPlan {
  const now = Date.now();
  const today = p.days.find((d) => d.date === todayKey());
  const doneReviews = today?.reviews ?? 0;
  const doneNew = today?.newCards ?? 0;
  const minutesToday = today?.minutes ?? 0;

  /* ---- 1. Thẻ đến hạn ---------------------------------------------------- */
  const dueAll = ALL_CARDS.filter((c) => {
    const m = p.cards[c.id];
    return m && m.state !== 'new' && isDue(m, now);
  }).sort((a, b) => {
    const ma = p.cards[a.id];
    const mb = p.cards[b.id];
    // Thẻ đang học lại (vừa quên) lên trước — chúng mong manh nhất.
    const rank = (s: string) => (s === 'relearning' ? 0 : s === 'learning' ? 1 : 2);
    const r = rank(ma.state) - rank(mb.state);
    if (r !== 0) return r;
    // Sau đó: quá hạn lâu nhất trước, vì nguy cơ quên hẳn cao nhất.
    return ma.due - mb.due;
  });

  const reviewBudget = Math.max(0, p.settings.maxReviewsPerDay - doneReviews);
  const due = dueAll.slice(0, reviewBudget);
  const dueOverflow = Math.max(0, dueAll.length - due.length);

  /* ---- 2. Thẻ mới -------------------------------------------------------- */
  // Chỉ giới thiệu thẻ của những bài ĐÃ mở (đã bắt đầu hoặc đã xong). Không
  // đổ thẻ của bài chưa đọc vào đầu người học — đó là học vẹt.
  const openedLessons = new Set(
    Object.entries(p.lessons)
      .filter(([, lp]) => lp.startedAt > 0)
      .map(([id]) => id),
  );
  const newBudget = Math.max(0, p.settings.newCardsPerDay - doneNew);
  const fresh = ALL_CARDS.filter((c) => openedLessons.has(c.lessonId) && !p.cards[c.id]).slice(
    0,
    newBudget,
  );

  /* ---- 3. Bài học -------------------------------------------------------- */
  const lesson = nextLesson(p);

  /* ---- 4. Luyện tập xen kẽ ---------------------------------------------- */
  const drills = buildDrills(p, 8);

  const minutes = Math.round(
    ((due.length * SEC_REVIEW + fresh.length * SEC_NEW + drills.length * SEC_DRILL) / 60 +
      (lesson?.minutes ?? 0)) *
      10,
  ) / 10;

  const goalMet = minutesToday >= p.settings.dailyGoalMinutes;

  return {
    due,
    fresh,
    dueOverflow,
    lesson,
    drills,
    minutes,
    goalMet,
    minutesToday,
    headline: headlineFor(due.length, fresh.length, lesson, goalMet, minutesToday, p),
  };
}

function headlineFor(
  dueN: number,
  freshN: number,
  lesson: Lesson | undefined,
  goalMet: boolean,
  minutesToday: number,
  p: Progress,
): { key: string; vars?: Record<string, string | number> } {
  const started = Object.keys(p.lessons).length > 0;
  if (!started) return { key: 'plan.start' };
  if (dueN > 0) {
    const est = Math.max(1, Math.round((dueN * SEC_REVIEW) / 60));
    return { key: 'plan.due', vars: { n: dueN, mins: est } };
  }
  if (goalMet && lesson) return { key: 'plan.goalMet', vars: { goal: p.settings.dailyGoalMinutes } };
  if (freshN > 0) return { key: 'plan.fresh', vars: { n: freshN } };
  if (lesson) return { key: 'plan.nextLesson', vars: { title: lesson.title } };
  if (minutesToday > 0) return { key: 'plan.restedToday' };
  return { key: 'plan.nothingDue' };
}

/* -------------------------------------------------------------------------- */
/*  Luyện tập xen kẽ                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Chọn câu hỏi luyện tập theo nguyên tắc xen kẽ (interleaving):
 *  - 60% từ các khái niệm ĐANG YẾU (nơi có nhiều thứ để học nhất),
 *  - 40% ngẫu nhiên từ những bài đã học (chống việc chỉ luyện điểm yếu tới mức
 *    quên mất phần còn lại),
 *  - và trộn thứ tự để hai câu liền nhau không cùng chủ đề.
 */
export function buildDrills(p: Progress = getProgress(), n = 10): QuizRef[] {
  const seenLessons = new Set(
    Object.entries(p.lessons)
      .filter(([, lp]) => lp.startedAt > 0)
      .map(([id]) => id),
  );
  const pool = ALL_QUIZ.filter((q) => seenLessons.has(q.lessonId));
  if (!pool.length) return [];

  const weak = new Set(weakConcepts(p, 10).map((w) => w.concept));
  const weakPool = pool.filter((q) => (q.quiz.tags ?? []).some((t) => weak.has(t)));
  const restPool = pool.filter((q) => !weakPool.includes(q));

  const wantWeak = Math.min(weakPool.length, Math.ceil(n * 0.6));
  const picked = [
    ...shuffle(weakPool).slice(0, wantWeak),
    ...shuffle(restPool).slice(0, n - wantWeak),
  ];

  return spreadTopics(shuffle(picked));
}

/** Sắp lại để hai câu liền nhau không cùng bài — đây chính là "xen kẽ". */
function spreadTopics(items: QuizRef[]): QuizRef[] {
  const out: QuizRef[] = [];
  const rest = [...items];
  while (rest.length) {
    const last = out[out.length - 1];
    let i = rest.findIndex((q) => !last || q.lessonId !== last.lessonId);
    if (i < 0) i = 0;
    out.push(rest.splice(i, 1)[0]);
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/*  Sức khoẻ trí nhớ                                                           */
/* -------------------------------------------------------------------------- */

export interface MemoryHealth {
  tracked: number;
  /** Số thẻ có xác suất nhớ < 90% (đang trôi về phía quên). */
  fading: number;
  /** Số thẻ có xác suất nhớ < 70% (nguy cơ mất). */
  atRisk: number;
  /** Xác suất nhớ trung bình trên toàn bộ thẻ đã học. */
  avgRetention: number;
  /** Số thẻ đã đạt khoảng cách ôn > 21 ngày — coi như đã vào trí nhớ dài hạn. */
  longTerm: number;
}

export function memoryHealth(p: Progress = getProgress()): MemoryHealth {
  const now = Date.now();
  const mems = ALL_CARDS.map((c) => p.cards[c.id]).filter(
    (m): m is NonNullable<typeof m> => !!m && m.state !== 'new',
  );
  if (!mems.length)
    return { tracked: 0, fading: 0, atRisk: 0, avgRetention: 0, longTerm: 0 };

  const rs = mems.map((m) => currentRetention(m, now));
  return {
    tracked: mems.length,
    fading: rs.filter((r) => r < 0.9).length,
    atRisk: rs.filter((r) => r < 0.7).length,
    avgRetention: rs.reduce((a, b) => a + b, 0) / rs.length,
    longTerm: mems.filter((m) => m.s >= 21).length,
  };
}

/** Thẻ của một bài học cụ thể, kèm trạng thái trí nhớ (dùng ở cuối bài). */
export function lessonCards(lessonId: string, p: Progress = getProgress()) {
  const l = getLesson(lessonId);
  if (!l) return [];
  return l.cards.map((c) => ({
    card: c,
    memory: p.cards[c.id] ?? newCardMemory(),
    known: !!p.cards[c.id],
  }));
}

/** Bài học nên xem lại: đã hoàn thành nhưng thẻ đang yếu. */
export function lessonsNeedingReview(p: Progress = getProgress(), limit = 5): Lesson[] {
  const now = Date.now();
  const scored = Object.keys(p.lessons)
    .map((id) => getLesson(id))
    .filter((l): l is Lesson => !!l && lessonState(l, p) !== 'moi')
    .map((l) => {
      const rs = l.cards.map((c) => (p.cards[c.id] ? currentRetention(p.cards[c.id], now) : 1));
      const avg = rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 1;
      return { lesson: l, avg };
    })
    .filter((x) => x.avg < 0.8)
    .sort((a, b) => a.avg - b.avg);
  return scored.slice(0, limit).map((x) => x.lesson);
}
