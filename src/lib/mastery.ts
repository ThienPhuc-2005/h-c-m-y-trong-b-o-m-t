/**
 * ============================================================================
 *  Mô hình người học — ước lượng "bạn đang thực sự nắm chắc cái gì"
 * ============================================================================
 *
 *  Đa số app học tập chỉ đếm phần trăm bài đã xem. Con số đó nói lên rất ít:
 *  xem xong không có nghĩa là nhớ, và nhớ hôm nay không có nghĩa là nhớ sau
 *  ba tuần. Ta ước lượng độ thành thạo theo KHÁI NIỆM, dựa trên ba tín hiệu:
 *
 *    1. Tỉ lệ trả lời đúng   — bạn có làm được không?
 *    2. Số lần đã gặp        — bằng chứng đủ mạnh chưa? (ít lần = chưa chắc)
 *    3. Thời gian trôi qua   — kiến thức cũ tự động mất giá cho tới khi ôn lại
 *
 *  Cách này khiến bản đồ thành thạo trung thực: một khái niệm học tháng trước
 *  và không đụng lại sẽ TỰ ĐỘNG nhạt màu, nhắc bạn quay lại — thay vì mãi mãi
 *  hiển thị màu xanh "đã xong" và ru ngủ người học.
 * ============================================================================
 */

import type { ConceptStat, Progress } from './storage';
import { getProgress } from './storage';
import { ALL_LESSONS, ALL_QUIZ, getLesson } from '../content';
import type { Lesson } from '../content/types';
import { clamp } from './utils';

const DAY = 86_400_000;

/** Số lần trả lời để coi là "đủ bằng chứng". Dưới mức này ta thận trọng. */
const EVIDENCE_TARGET = 5;

/** Nửa đời của độ tin cậy: sau 45 ngày không ôn, bằng chứng cũ chỉ còn một nửa. */
const CONFIDENCE_HALFLIFE_DAYS = 45;

export interface ConceptMastery {
  concept: string;
  /** 0–1. Đã tính cả độ tin cậy và sự phai mờ theo thời gian. */
  score: number;
  /** Tỉ lệ đúng thô, chưa điều chỉnh. */
  rawAccuracy: number;
  seen: number;
  /** Số ngày kể từ lần gặp gần nhất. */
  daysSince: number;
  level: 'chua-hoc' | 'moi-biet' | 'dang-nam' | 'vung' | 'thanh-thao';
}

export const MASTERY_LABEL: Record<ConceptMastery['level'], string> = {
  'chua-hoc': 'Chưa học',
  'moi-biet': 'Mới biết',
  'dang-nam': 'Đang nắm',
  vung: 'Vững',
  'thanh-thao': 'Thành thạo',
};

export function conceptMastery(concept: string, p: Progress = getProgress()): ConceptMastery {
  const s: ConceptStat | undefined = p.concepts[concept];
  if (!s || s.seen === 0) {
    return { concept, score: 0, rawAccuracy: 0, seen: 0, daysSince: Infinity, level: 'chua-hoc' };
  }

  const rawAccuracy = s.correct / s.seen;

  // Ước lượng Laplace: 2 lần đúng liên tiếp chưa đủ để tuyên bố thành thạo.
  // Cộng thêm 1 đúng + 1 sai ảo → kéo ước lượng về 0,5 khi bằng chứng ít.
  const smoothed = (s.correct + 1) / (s.seen + 2);

  // Trọng số bằng chứng: 0 khi chưa gặp, tiến tới 1 khi đã gặp đủ nhiều.
  const evidence = 1 - Math.exp((-s.seen / EVIDENCE_TARGET) * 1.6);

  // Phai mờ theo thời gian.
  const daysSince = s.lastAt ? (Date.now() - s.lastAt) / DAY : Infinity;
  const decay = Math.pow(0.5, daysSince / CONFIDENCE_HALFLIFE_DAYS);

  // Thưởng nhẹ cho chuỗi đúng liên tiếp — nó là tín hiệu ổn định, không may rủi.
  const streakBonus = Math.min(0.08, s.streak * 0.02);

  const score = clamp(smoothed * (0.35 + 0.65 * evidence) * (0.45 + 0.55 * decay) + streakBonus, 0, 1);

  const level: ConceptMastery['level'] =
    score >= 0.85 ? 'thanh-thao' : score >= 0.68 ? 'vung' : score >= 0.45 ? 'dang-nam' : 'moi-biet';

  return { concept, score, rawAccuracy, seen: s.seen, daysSince, level };
}

/** Bản đồ thành thạo toàn khoá, sắp xếp yếu nhất lên trước (nơi cần đầu tư). */
export function masteryMap(p: Progress = getProgress()): ConceptMastery[] {
  const concepts = new Set<string>(ALL_QUIZ.flatMap((q) => q.quiz.tags ?? []));
  return [...concepts].map((c) => conceptMastery(c, p)).sort((a, b) => a.score - b.score);
}

/** Những khái niệm đã học nhưng đang yếu — mục tiêu ưu tiên của buổi luyện tập. */
export function weakConcepts(p: Progress = getProgress(), limit = 8): ConceptMastery[] {
  return masteryMap(p)
    .filter((m) => m.seen > 0 && m.score < 0.68)
    .slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/*  Trạng thái bài học                                                         */
/* -------------------------------------------------------------------------- */

export type LessonState = 'khoa' | 'moi' | 'dang-hoc' | 'da-xong' | 'thanh-thao';

export const LESSON_STATE_LABEL: Record<LessonState, string> = {
  khoa: 'Cần học bài trước',
  moi: 'Chưa bắt đầu',
  'dang-hoc': 'Đang học dở',
  'da-xong': 'Đã hoàn thành',
  'thanh-thao': 'Đã thành thạo',
};

/**
 * Khoá bài học là con dao hai lưỡi: nó bảo vệ người học khỏi lạc lối, nhưng
 * cũng có thể chặn người đã biết. Vì vậy ta chỉ khoá theo `prereqs` khai báo
 * tường minh, và giao diện luôn cho phép "học trước" bằng một cú bấm.
 */
export function lessonState(lesson: Lesson, p: Progress = getProgress()): LessonState {
  const lp = p.lessons[lesson.id];

  if (lp?.completedAt) {
    // "Thành thạo" đòi hỏi bài kiểm tra tốt VÀ thẻ ôn còn khoẻ — không chỉ đọc xong.
    const cardsOk = lesson.cards.every((c) => {
      const m = p.cards[c.id];
      return m && m.state === 'review' && m.reps >= 2;
    });
    return lp.bestScore >= 0.8 && cardsOk ? 'thanh-thao' : 'da-xong';
  }

  if (lp?.startedAt) return 'dang-hoc';

  const blocked = (lesson.prereqs ?? []).some((id) => !p.lessons[id]?.completedAt);
  return blocked ? 'khoa' : 'moi';
}

export interface TrackProgress {
  total: number;
  done: number;
  mastered: number;
  inProgress: number;
  ratio: number;
  minutesLeft: number;
}

export function trackProgress(trackId: string, p: Progress = getProgress()): TrackProgress {
  const lessons = ALL_LESSONS.filter((l) => l.trackId === trackId);
  let done = 0;
  let mastered = 0;
  let inProgress = 0;
  let minutesLeft = 0;
  for (const l of lessons) {
    const st = lessonState(l, p);
    if (st === 'thanh-thao') {
      mastered++;
      done++;
    } else if (st === 'da-xong') done++;
    else {
      if (st === 'dang-hoc') inProgress++;
      minutesLeft += l.minutes;
    }
  }
  return {
    total: lessons.length,
    done,
    mastered,
    inProgress,
    ratio: lessons.length ? done / lessons.length : 0,
    minutesLeft,
  };
}

export function courseProgress(p: Progress = getProgress()) {
  let done = 0;
  let mastered = 0;
  for (const l of ALL_LESSONS) {
    const st = lessonState(l, p);
    if (st === 'thanh-thao') {
      mastered++;
      done++;
    } else if (st === 'da-xong') done++;
  }
  return {
    total: ALL_LESSONS.length,
    done,
    mastered,
    ratio: ALL_LESSONS.length ? done / ALL_LESSONS.length : 0,
  };
}

/** Bài học tiếp theo nên làm: ưu tiên bài đang dở, sau đó bài mở khoá sớm nhất. */
export function nextLesson(p: Progress = getProgress()): Lesson | undefined {
  if (p.lastLesson) {
    const l = getLesson(p.lastLesson);
    if (l && lessonState(l, p) === 'dang-hoc') return l;
  }
  return ALL_LESSONS.find((l) => {
    const st = lessonState(l, p);
    return st === 'moi' || st === 'dang-hoc';
  });
}

/* -------------------------------------------------------------------------- */
/*  Hiệu chuẩn siêu nhận thức                                                  */
/* -------------------------------------------------------------------------- */

export interface CalibrationBucket {
  conf: number;
  label: string;
  n: number;
  accuracy: number;
  /** accuracy − conf. Dương = khiêm tốn quá; âm = tự tin quá. */
  gap: number;
}

/**
 * "Bạn có biết mình biết gì không?" — kỹ năng quan trọng bậc nhất và ít ai luyện.
 * Người tự tin thái quá bỏ ôn những thứ thực ra đã quên. Bảng này cho họ thấy
 * bằng chứng về chính họ, thay vì một lời khuyên chung chung.
 */
export function calibration(p: Progress = getProgress()): CalibrationBucket[] {
  const buckets: { conf: number; label: string }[] = [
    { conf: 0.25, label: 'Đoán mò' },
    { conf: 0.5, label: 'Không chắc' },
    { conf: 0.75, label: 'Khá chắc' },
    { conf: 0.95, label: 'Chắc chắn' },
  ];
  return buckets.map((b) => {
    const pts = p.calibration.filter((c) => c.conf === b.conf);
    const accuracy = pts.length ? pts.filter((c) => c.correct).length / pts.length : 0;
    return { ...b, n: pts.length, accuracy, gap: pts.length ? accuracy - b.conf : 0 };
  });
}

/** Một câu tóm tắt về xu hướng tự đánh giá — hữu ích hơn cả biểu đồ. */
export function calibrationVerdict(p: Progress = getProgress()): string | null {
  const bs = calibration(p).filter((b) => b.n >= 5);
  if (bs.length < 2) return null;
  const avgGap = bs.reduce((s, b) => s + b.gap * b.n, 0) / bs.reduce((s, b) => s + b.n, 0);
  if (avgGap < -0.12)
    return 'Bạn đang TỰ TIN QUÁ MỨC: những câu bạn chắc chắn lại sai nhiều hơn bạn nghĩ. Hãy ôn kỹ hơn trước khi bỏ qua một chủ đề.';
  if (avgGap > 0.12)
    return 'Bạn đang KHIÊM TỐN QUÁ MỨC: bạn biết nhiều hơn bạn tưởng. Hãy mạnh dạn hơn, và đừng ôn lại những thứ đã chắc.';
  return 'Khả năng tự đánh giá của bạn khá chuẩn — đây là dấu hiệu của người học trưởng thành.';
}

/* -------------------------------------------------------------------------- */
/*  Huy hiệu                                                                   */
/* -------------------------------------------------------------------------- */

export interface Badge {
  id: string;
  icon: string;
  name: string;
  desc: string;
  earned: (p: Progress) => boolean;
}

/**
 * Huy hiệu gắn với HÀNH VI HỌC TỐT, không phải với thời gian ngồi trước màn hình.
 * Không có huy hiệu nào thưởng cho việc "học 5 giờ liên tục" — vì đó là thói
 * quen xấu, và phần thưởng sẽ củng cố đúng cái ta muốn tránh.
 */
export const BADGES: Badge[] = [
  {
    id: 'first-step',
    icon: '🌱',
    name: 'Bước đầu tiên',
    desc: 'Hoàn thành bài học đầu tiên',
    earned: (p) => Object.values(p.lessons).some((l) => l.completedAt > 0),
  },
  {
    id: 'streak-3',
    icon: '🔥',
    name: 'Ba ngày liền',
    desc: 'Học 3 ngày liên tiếp',
    earned: (p) => streakLen(p) >= 3,
  },
  {
    id: 'streak-7',
    icon: '⚡',
    name: 'Một tuần đều đặn',
    desc: 'Học 7 ngày liên tiếp',
    earned: (p) => streakLen(p) >= 7,
  },
  {
    id: 'streak-30',
    icon: '💎',
    name: 'Ba mươi ngày',
    desc: 'Học 30 ngày liên tiếp — thói quen đã hình thành',
    earned: (p) => streakLen(p) >= 30,
  },
  {
    id: 'reviewer-100',
    icon: '🧠',
    name: 'Trăm lần ôn',
    desc: 'Hoàn thành 100 lượt ôn thẻ',
    earned: (p) => p.days.reduce((s, d) => s + d.reviews, 0) >= 100,
  },
  {
    id: 'reviewer-1000',
    icon: '🏔️',
    name: 'Nghìn lần ôn',
    desc: 'Hoàn thành 1.000 lượt ôn thẻ',
    earned: (p) => p.days.reduce((s, d) => s + d.reviews, 0) >= 1000,
  },
  {
    id: 'track-1',
    icon: '🧭',
    name: 'Xong chặng đầu',
    desc: 'Hoàn thành trọn vẹn một chặng học',
    earned: (p) =>
      ALL_LESSONS.some((l) => {
        const t = trackProgress(l.trackId, p);
        return t.total > 0 && t.done === t.total;
      }),
  },
  {
    id: 'metrics-master',
    icon: '📊',
    name: 'Người đo lường',
    desc: 'Thành thạo toàn bộ khái niệm về đo lường',
    earned: (p) =>
      ['do-luong', 'base-rate', 'mat-can-bang'].every((c) => conceptMastery(c, p).score >= 0.8),
  },
  {
    id: 'honest',
    icon: '🎯',
    name: 'Tự biết mình',
    desc: 'Đạt khả năng tự đánh giá chuẩn xác qua 40 câu hỏi',
    earned: (p) => {
      if (p.calibration.length < 40) return false;
      const bs = calibration(p).filter((b) => b.n >= 5);
      if (!bs.length) return false;
      const avg = bs.reduce((s, b) => s + Math.abs(b.gap) * b.n, 0) / bs.reduce((s, b) => s + b.n, 0);
      return avg < 0.1;
    },
  },
  {
    id: 'lab-rat',
    icon: '🔬',
    name: 'Chuột bạch phòng lab',
    desc: 'Mở và thao tác 10 phòng thí nghiệm khác nhau',
    earned: (p) => Object.keys(p.checks).filter((k) => k.startsWith('lab:')).length >= 10,
  },
  {
    id: 'halfway',
    icon: '🏕️',
    name: 'Nửa chặng đường',
    desc: 'Hoàn thành 50% toàn khoá',
    earned: (p) => courseProgress(p).ratio >= 0.5,
  },
  {
    id: 'graduate',
    icon: '🎓',
    name: 'Tốt nghiệp',
    desc: 'Hoàn thành 100% bài học',
    earned: (p) => courseProgress(p).ratio >= 1,
  },
];

function streakLen(p: Progress): number {
  const active = new Set(p.days.filter((d) => d.minutes >= 2 || d.reviews >= 3).map((d) => d.date));
  const key = (d: Date) => {
    const q = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${q(d.getMonth() + 1)}-${q(d.getDate())}`;
  };
  let n = 0;
  const probe = new Date();
  if (!active.has(key(probe))) probe.setDate(probe.getDate() - 1);
  while (active.has(key(probe))) {
    n++;
    probe.setDate(probe.getDate() - 1);
  }
  return n;
}

export const earnedBadges = (p: Progress = getProgress()) => BADGES.filter((b) => b.earned(p));
