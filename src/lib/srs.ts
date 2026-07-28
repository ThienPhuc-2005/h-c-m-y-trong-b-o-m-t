/**
 * ============================================================================
 *  Bộ lập lịch lặp lại giãn cách — FSRS (Free Spaced Repetition Scheduler)
 * ============================================================================
 *
 *  VÌ SAO CẦN THỨ NÀY?
 *  -------------------
 *  Ebbinghaus (1885) đo được: sau 1 ngày ta quên ~66% thứ vừa học, sau 6 ngày
 *  còn nhớ ~25%. Học xong rồi bỏ đó = ném thời gian qua cửa sổ. Nhưng nếu ta ôn
 *  lại ĐÚNG LÚC sắp quên, đường quên bị "bẻ" thoải ra, và mỗi lần ôn khoảng cách
 *  an toàn lại dài hơn (spacing effect + testing effect). Đó là cách biến kiến
 *  thức tạm thời thành kiến thức ăn sâu mà KHÔNG tốn thêm giờ học.
 *
 *  Điểm mấu chốt: ôn quá sớm thì lãng phí (bạn vẫn còn nhớ, chẳng học được gì
 *  thêm), ôn quá muộn thì phải học lại từ đầu. FSRS tính điểm ngọt đó.
 *
 *  MÔ HÌNH GỒM 3 BIẾN
 *  ------------------
 *   S — Stability (độ bền trí nhớ, tính theo NGÀY):
 *       số ngày trôi qua cho tới khi xác suất nhớ lại tụt xuống 90%.
 *   D — Difficulty (độ khó nội tại của thẻ, thang 1–10):
 *       thẻ càng khó thì mỗi lần ôn càng ít làm tăng S.
 *   R — Retrievability (xác suất nhớ lại NGAY BÂY GIỜ, 0–1):
 *       hàm của S và số ngày kể từ lần ôn cuối.
 *
 *  Ta lên lịch sao cho khi thẻ đến hạn thì R ≈ mục tiêu (mặc định 0.90).
 *  Người học chỉnh mục tiêu này: 0.95 = nhớ chắc hơn nhưng ôn nhiều hơn hẳn;
 *  0.85 = tiết kiệm thời gian, chấp nhận quên nhiều hơn một chút.
 *
 *  Triển khai theo FSRS-4.5 (bộ trọng số mặc định do tác giả huấn luyện trên
 *  hàng trăm triệu lượt ôn thật). Ta không tự huấn luyện lại vì dữ liệu của một
 *  người học đơn lẻ quá ít để ước lượng 17 tham số một cách đáng tin.
 * ============================================================================
 */

/** Người học tự đánh giá lần nhớ lại vừa rồi. */
import { t } from '../i18n';

export type Grade = 1 | 2 | 3 | 4; // 1 Quên · 2 Khó · 3 Được · 4 Dễ

export const GRADE_META: Record<Grade, { labelKey: string; descKey: string; cls: string; key: string }> = {
  1: { labelKey: 'grade.1', descKey: 'grade.1desc', cls: 'grade-1', key: '1' },
  2: { labelKey: 'grade.2', descKey: 'grade.2desc', cls: 'grade-2', key: '2' },
  3: { labelKey: 'grade.3', descKey: 'grade.3desc', cls: 'grade-3', key: '3' },
  4: { labelKey: 'grade.4', descKey: 'grade.4desc', cls: 'grade-4', key: '4' },
};

export type CardState = 'new' | 'learning' | 'review' | 'relearning';

export interface CardMemory {
  /** Ổn định trí nhớ (ngày). */
  s: number;
  /** Độ khó 1–10. */
  d: number;
  /** Trạng thái hiện tại trong vòng đời thẻ. */
  state: CardState;
  /** Mốc thời gian đến hạn (epoch ms). */
  due: number;
  /** Lần ôn gần nhất (epoch ms). 0 = chưa từng. */
  last: number;
  /** Tổng số lần ôn. */
  reps: number;
  /** Số lần quên (grade 1 khi đang ở trạng thái review). */
  lapses: number;
  /** Số bước học ngắn hạn đã qua trong phiên hiện tại. */
  step: number;
}

/* -------------------------------------------------------------------------- */
/*  Hằng số mô hình                                                            */
/* -------------------------------------------------------------------------- */

/** Trọng số FSRS-4.5 mặc định. */
const W = [
  0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072,
  0.0793, 0.3246, 1.587, 0.2272, 2.8755,
] as const;

/** Hàm quên có dạng luỹ thừa (power law) chứ không phải hàm mũ — khớp dữ liệu thật tốt hơn nhiều. */
const DECAY = -0.5;
const FACTOR = 19 / 81; // = 0.9^(1/DECAY) - 1

const DAY = 86_400_000;
const MIN_S = 0.01;
const MAX_S = 36_500; // 100 năm — chặn tràn số

/** Các bước học ngắn hạn (phút) cho thẻ mới: gặp lại trong cùng phiên. */
const LEARN_STEPS = [1, 10];
const RELEARN_STEPS = [10];

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/* -------------------------------------------------------------------------- */
/*  Hàm lõi                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Xác suất nhớ lại sau `elapsedDays` ngày với độ ổn định `s`.
 * R(t) = (1 + FACTOR · t/S)^DECAY
 */
export function retrievability(elapsedDays: number, s: number): number {
  if (s <= 0) return 0;
  return Math.pow(1 + (FACTOR * Math.max(0, elapsedDays)) / s, DECAY);
}

/** Khoảng cách (ngày) để R rơi đúng về `target`. */
export function intervalForRetention(s: number, target: number): number {
  const t = clamp(target, 0.7, 0.98);
  return (s / FACTOR) * (Math.pow(t, 1 / DECAY) - 1);
}

const initStability = (g: Grade) => clamp(W[g - 1], MIN_S, MAX_S);
const initDifficulty = (g: Grade) => clamp(W[4] - Math.exp(W[5] * (g - 1)) + 1, 1, 10);

/** Cập nhật độ khó, có "hồi quy về trung bình" để thẻ không kẹt ở cực khó mãi. */
function nextDifficulty(d: number, g: Grade): number {
  const delta = d - W[6] * (g - 3);
  const reverted = W[7] * initDifficulty(4) + (1 - W[7]) * delta;
  return clamp(reverted, 1, 10);
}

/** Độ ổn định mới khi NHỚ ĐƯỢC (grade ≥ 2). */
function stabilityOnRecall(d: number, s: number, r: number, g: Grade): number {
  // s phải > 0: Math.pow(0, số âm) = Infinity, và 0 × Infinity = NaN. Một thẻ
  // có s = 0 lọt vào trạng thái review (dữ liệu cũ hỏng, nhập tệp sai) sẽ âm
  // thầm biến toàn bộ lịch ôn thành NaN mà giao diện vẫn hiển thị bình thường.
  const s0 = Math.max(s, MIN_S);
  const hardPenalty = g === 2 ? W[15] : 1;
  const easyBonus = g === 4 ? W[16] : 1;
  const inc =
    Math.exp(W[8]) *
    (11 - d) *
    Math.pow(s0, -W[9]) *
    (Math.exp(W[10] * (1 - r)) - 1) *
    hardPenalty *
    easyBonus;
  return clamp(s0 * (1 + inc), MIN_S, MAX_S);
}

/** Độ ổn định mới khi QUÊN (grade = 1). Luôn thấp hơn hẳn — đó là điều đúng. */
function stabilityOnLapse(d: number, s: number, r: number): number {
  const s0 = Math.max(s, MIN_S);
  const sf = W[11] * Math.pow(Math.max(d, 1), -W[12]) * (Math.pow(s0 + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r));
  return clamp(Math.min(sf, s0), MIN_S, MAX_S);
}

/* -------------------------------------------------------------------------- */
/*  API công khai                                                              */
/* -------------------------------------------------------------------------- */

export function newCardMemory(now = Date.now()): CardMemory {
  return { s: 0, d: 0, state: 'new', due: now, last: 0, reps: 0, lapses: 0, step: 0 };
}

export interface ScheduleOptions {
  /** Mục tiêu xác suất nhớ khi thẻ đến hạn. Mặc định 0.90. */
  targetRetention?: number;
  /** Trần khoảng cách (ngày) — tránh thẻ biến mất 10 năm. */
  maxInterval?: number;
  /**
   * Xáo trộn ±5% khoảng cách. Không phải làm màu: nó tránh việc hàng trăm thẻ
   * học cùng ngày cứ dồn cục lại đến hạn cùng ngày mãi mãi, tạo "ngày địa ngục"
   * khiến người học bỏ cuộc.
   */
  fuzz?: boolean;
  /** Hạt ngẫu nhiên tất định để kiểm thử. */
  rng?: () => number;
}

export interface ScheduleResult {
  memory: CardMemory;
  /** Khoảng cách tới lần ôn kế (ngày; < 1 nghĩa là trong phiên/trong ngày). */
  intervalDays: number;
}

/**
 * Áp một lần chấm điểm lên trạng thái trí nhớ của thẻ.
 * Thuần khiết (pure): không đọc/ghi gì bên ngoài, dễ kiểm thử.
 */
export function schedule(
  mem: CardMemory,
  grade: Grade,
  now = Date.now(),
  opts: ScheduleOptions = {},
): ScheduleResult {
  const target = opts.targetRetention ?? 0.9;
  const maxInterval = opts.maxInterval ?? 3650;
  const rng = opts.rng ?? Math.random;

  // Vệ sinh đầu vào: trạng thái trí nhớ có thể đến từ tệp sao lưu của phiên bản
  // cũ hoặc từ localStorage bị sửa tay. Thà kẹp về khoảng hợp lệ còn hơn để một
  // giá trị lạ lan thành NaN khắp lịch ôn.
  mem = {
    ...mem,
    s: Number.isFinite(mem.s) ? clamp(mem.s, 0, MAX_S) : 0,
    d: Number.isFinite(mem.d) ? clamp(mem.d, 0, 10) : 0,
  };

  const elapsedDays = mem.last > 0 ? Math.max(0, (now - mem.last) / DAY) : 0;
  const next: CardMemory = { ...mem, reps: mem.reps + 1, last: now };

  /* ---- Thẻ mới ---------------------------------------------------------- */
  if (mem.state === 'new') {
    next.d = initDifficulty(grade);
    next.s = initStability(grade);

    if (grade === 1) {
      next.state = 'learning';
      next.step = 0;
      next.due = now + LEARN_STEPS[0] * 60_000;
      return { memory: next, intervalDays: LEARN_STEPS[0] / 1440 };
    }
    if (grade === 4) {
      // "Dễ" ngay lần đầu → bỏ qua bước học ngắn, vào lịch dài luôn.
      next.state = 'review';
      next.step = 0;
      const iv = applyFuzz(clampInterval(intervalForRetention(next.s, target), maxInterval), rng, opts.fuzz);
      next.due = now + iv * DAY;
      return { memory: next, intervalDays: iv };
    }
    next.state = 'learning';
    next.step = 1;
    const minutes = LEARN_STEPS[Math.min(1, LEARN_STEPS.length - 1)];
    next.due = now + minutes * 60_000;
    return { memory: next, intervalDays: minutes / 1440 };
  }

  /* ---- Đang trong bước học ngắn hạn -------------------------------------- */
  if (mem.state === 'learning' || mem.state === 'relearning') {
    const steps = mem.state === 'learning' ? LEARN_STEPS : RELEARN_STEPS;
    next.d = nextDifficulty(mem.d || initDifficulty(grade), grade);

    if (grade === 1) {
      next.step = 0;
      next.s = Math.max(MIN_S, mem.s * 0.7);
      next.due = now + steps[0] * 60_000;
      return { memory: next, intervalDays: steps[0] / 1440 };
    }

    const nextStep = grade === 4 ? steps.length : mem.step + 1;
    if (nextStep < steps.length) {
      next.step = nextStep;
      next.due = now + steps[nextStep] * 60_000;
      return { memory: next, intervalDays: steps[nextStep] / 1440 };
    }

    // Tốt nghiệp khỏi giai đoạn học ngắn hạn.
    next.state = 'review';
    next.step = 0;
    next.s = mem.s > 0 ? mem.s : initStability(grade);
    const iv = applyFuzz(clampInterval(intervalForRetention(next.s, target), maxInterval), rng, opts.fuzz);
    next.due = now + iv * DAY;
    return { memory: next, intervalDays: iv };
  }

  /* ---- Ôn tập dài hạn ---------------------------------------------------- */
  const r = retrievability(elapsedDays, mem.s);
  next.d = nextDifficulty(mem.d, grade);

  if (grade === 1) {
    next.lapses = mem.lapses + 1;
    next.s = stabilityOnLapse(next.d, mem.s, r);
    next.state = 'relearning';
    next.step = 0;
    next.due = now + RELEARN_STEPS[0] * 60_000;
    return { memory: next, intervalDays: RELEARN_STEPS[0] / 1440 };
  }

  next.s = stabilityOnRecall(next.d, mem.s, r, grade);
  next.state = 'review';
  const iv = applyFuzz(clampInterval(intervalForRetention(next.s, target), maxInterval), rng, opts.fuzz);
  next.due = now + iv * DAY;
  return { memory: next, intervalDays: iv };
}

function clampInterval(days: number, max: number): number {
  return clamp(Math.round(days * 100) / 100, 1, max);
}

function applyFuzz(days: number, rng: () => number, enabled = true): number {
  if (!enabled || days < 2.5) return days;
  const spread = days * 0.05;
  return Math.max(1, Math.round(days + (rng() * 2 - 1) * spread));
}

/**
 * Xem trước khoảng cách cho cả 4 mức chấm điểm — hiển thị NGAY trên nút bấm.
 * Minh bạch tạo tin tưởng: người học thấy "Dễ → 12 ngày" thì hiểu hệ thống
 * đang làm gì thay vì phải tin mù quáng, và họ chấm điểm thật thà hơn.
 */
export function previewIntervals(
  mem: CardMemory,
  now = Date.now(),
  opts: ScheduleOptions = {},
): Record<Grade, number> {
  const noFuzz = { ...opts, fuzz: false };
  return {
    1: schedule(mem, 1, now, noFuzz).intervalDays,
    2: schedule(mem, 2, now, noFuzz).intervalDays,
    3: schedule(mem, 3, now, noFuzz).intervalDays,
    4: schedule(mem, 4, now, noFuzz).intervalDays,
  };
}

/** Định dạng khoảng cách sang tiếng Việt tự nhiên. */
export function formatInterval(days: number): string {
  if (days < 1 / 1440) return t('interval.now');
  if (days < 1 / 24) return t('interval.min', { n: Math.round(days * 1440) });
  if (days < 1) return t('interval.hour', { n: Math.round(days * 24) });
  if (days < 30) return t('interval.day', { n: Math.round(days) });
  if (days < 365) return t('interval.month', { n: (days / 30.44).toFixed(days < 90 ? 1 : 0) });
  return t('interval.year', { n: (days / 365).toFixed(1) });
}

/** Thẻ có đến hạn tại thời điểm `now` không? */
export const isDue = (mem: CardMemory, now = Date.now()) => mem.due <= now;

/** Xác suất nhớ hiện tại — dùng vẽ "sức khoẻ trí nhớ" cho người học thấy. */
export function currentRetention(mem: CardMemory, now = Date.now()): number {
  if (mem.state === 'new' || mem.last === 0) return 0;
  if (mem.state === 'learning' || mem.state === 'relearning') return 0.6;
  return retrievability((now - mem.last) / DAY, mem.s);
}

/**
 * Ước lượng tải ôn tập những ngày tới — để người học biết trước và không bị
 * bất ngờ bởi một "núi thẻ" dựng đứng.
 */
export function forecast(memories: CardMemory[], days = 30, now = Date.now()): number[] {
  const out = new Array(days).fill(0);
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  for (const m of memories) {
    if (m.state === 'new') continue;
    const idx = Math.floor((m.due - startOfToday) / DAY);
    if (idx < 0) out[0]++;
    else if (idx < days) out[idx]++;
  }
  return out;
}
