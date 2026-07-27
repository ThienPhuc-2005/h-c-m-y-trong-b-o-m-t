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
import type { IconName } from '../components/Icon';
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

export const MASTERY_KEY: Record<ConceptMastery['level'], string> = {
  'chua-hoc': 'mastery.chua-hoc',
  'moi-biet': 'mastery.moi-biet',
  'dang-nam': 'mastery.dang-nam',
  vung: 'mastery.vung',
  'thanh-thao': 'mastery.thanh-thao',
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

export const LESSON_STATE_KEY: Record<LessonState, string> = {
  khoa: 'lessonState.khoa',
  moi: 'lessonState.moi',
  'dang-hoc': 'lessonState.dang-hoc',
  'da-xong': 'lessonState.da-xong',
  'thanh-thao': 'lessonState.thanh-thao',
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
      minutesLeft += l.minutes + l.practiceMinutes;
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
  /** Khoá dịch cho nhãn mức tự tin. */
  labelKey: string;
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
  const buckets: { conf: number; labelKey: string }[] = [
    { conf: 0.25, labelKey: 'confidence.guess' },
    { conf: 0.5, labelKey: 'confidence.unsure' },
    { conf: 0.75, labelKey: 'confidence.fairly' },
    { conf: 0.95, labelKey: 'confidence.certain' },
  ];
  return buckets.map((b) => {
    const pts = p.calibration.filter((c) => c.conf === b.conf);
    const accuracy = pts.length ? pts.filter((c) => c.correct).length / pts.length : 0;
    return { ...b, n: pts.length, accuracy, gap: pts.length ? accuracy - b.conf : 0 };
  });
}

/** Khoá dịch cho một câu tóm tắt về xu hướng tự đánh giá — hữu ích hơn cả biểu đồ. */
export function calibrationVerdict(p: Progress = getProgress()): string | null {
  const bs = calibration(p).filter((b) => b.n >= 5);
  if (bs.length < 2) return null;
  const avgGap = bs.reduce((s, b) => s + b.gap * b.n, 0) / bs.reduce((s, b) => s + b.n, 0);
  if (avgGap < -0.12)
    return 'calibration.overconfident';
  if (avgGap > 0.12)
    return 'calibration.underconfident';
  return 'calibration.wellCalibrated';
}

/* -------------------------------------------------------------------------- */
/*  Huy hiệu                                                                   */
/* -------------------------------------------------------------------------- */

export interface Badge {
  id: string;
  icon: IconName;
  /** Khoá dịch cho tên và mô tả — xem `i18n/vi.json` mục `badge`. */
  nameKey: string;
  descKey: string;
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
    icon: 'sprout',
    nameKey: 'badge.first-step',
    descKey: 'badge.first-stepDesc',
    earned: (p) => Object.values(p.lessons).some((l) => l.completedAt > 0),
  },
  {
    id: 'streak-3',
    icon: 'flame',
    nameKey: 'badge.streak-3',
    descKey: 'badge.streak-3Desc',
    earned: (p) => streakLen(p) >= 3,
  },
  {
    id: 'streak-7',
    icon: 'zap',
    nameKey: 'badge.streak-7',
    descKey: 'badge.streak-7Desc',
    earned: (p) => streakLen(p) >= 7,
  },
  {
    id: 'streak-30',
    icon: 'gem',
    nameKey: 'badge.streak-30',
    descKey: 'badge.streak-30Desc',
    earned: (p) => streakLen(p) >= 30,
  },
  {
    id: 'reviewer-100',
    icon: 'brain',
    nameKey: 'badge.reviewer-100',
    descKey: 'badge.reviewer-100Desc',
    earned: (p) => p.days.reduce((s, d) => s + d.reviews, 0) >= 100,
  },
  {
    id: 'reviewer-1000',
    icon: 'mountain-snow',
    nameKey: 'badge.reviewer-1000',
    descKey: 'badge.reviewer-1000Desc',
    earned: (p) => p.days.reduce((s, d) => s + d.reviews, 0) >= 1000,
  },
  {
    id: 'track-1',
    icon: 'compass',
    nameKey: 'badge.track-1',
    descKey: 'badge.track-1Desc',
    earned: (p) =>
      ALL_LESSONS.some((l) => {
        const t = trackProgress(l.trackId, p);
        return t.total > 0 && t.done === t.total;
      }),
  },
  {
    id: 'metrics-master',
    icon: 'chart',
    nameKey: 'badge.metrics-master',
    descKey: 'badge.metrics-masterDesc',
    earned: (p) =>
      ['do-luong', 'base-rate', 'mat-can-bang'].every((c) => conceptMastery(c, p).score >= 0.8),
  },
  {
    id: 'honest',
    icon: 'target',
    nameKey: 'badge.honest',
    descKey: 'badge.honestDesc',
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
    icon: 'flask',
    nameKey: 'badge.lab-rat',
    descKey: 'badge.lab-ratDesc',
    earned: (p) => Object.keys(p.checks).filter((k) => k.startsWith('lab:')).length >= 10,
  },
  {
    id: 'halfway',
    icon: 'tent',
    nameKey: 'badge.halfway',
    descKey: 'badge.halfwayDesc',
    earned: (p) => courseProgress(p).ratio >= 0.5,
  },
  {
    id: 'graduate',
    icon: 'graduation-cap',
    nameKey: 'badge.graduate',
    descKey: 'badge.graduateDesc',
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

/**
 * Huy hiệu là ghi nhận một việc ĐÃ XẢY RA, không phải trạng thái hiện tại.
 *
 * Trước đây hàm này chỉ trả về `BADGES.filter((b) => b.earned(p))`, tính lại
 * từ đầu mỗi lần vẽ. Hệ quả: người học chạm mốc 30 ngày liên tiếp, ốm một hôm,
 * và app THU HỒI huy hiệu — trong khi chính app viết "Nghỉ một hôm không xoá đi
 * thứ bạn đã học". Đó là mẫu thiết kế tối, dù là vô ý.
 *
 * Nay hợp nhất hai nguồn: những huy hiệu đã được ghi vĩnh viễn vào `p.badges`,
 * và những huy hiệu đang đạt điều kiện ngay lúc này. `p.badges` được ghi bởi
 * `syncBadges()` bên dưới.
 */
export const earnedBadges = (p: Progress = getProgress()): Badge[] =>
  BADGES.filter((b) => p.badges.includes(b.id) || b.earned(p));

/**
 * Ghi vĩnh viễn những huy hiệu vừa đạt. Trả về danh sách id MỚI đạt để nơi gọi
 * quyết định có chúc mừng hay không.
 *
 * Tách khỏi `earnedBadges` vì đây là hàm CÓ TÁC DỤNG PHỤ: gọi nó trong lúc vẽ
 * sẽ ghi vào kho dữ liệu giữa chừng một lần render.
 */
export function syncBadges(p: Progress = getProgress()): string[] {
  return BADGES.filter((b) => !p.badges.includes(b.id) && b.earned(p)).map((b) => b.id);
}
