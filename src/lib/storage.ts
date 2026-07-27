/**
 * ============================================================================
 *  Kho dữ liệu học tập — lưu cục bộ, không máy chủ
 * ============================================================================
 *
 *  TRIẾT LÝ: dữ liệu học của bạn là CỦA BẠN.
 *  Toàn bộ tiến độ nằm trong localStorage của trình duyệt. Không tài khoản,
 *  không theo dõi, không gửi đi đâu cả. Đổi lại, người học phải có quyền
 *  XUẤT / NHẬP để mang dữ liệu sang máy khác — nếu không, "riêng tư" chỉ là
 *  cách nói khác của "dễ mất trắng".
 *
 *  Store dùng `useSyncExternalStore` của React: một nguồn sự thật duy nhất,
 *  không thư viện ngoài, và mọi component tự đồng bộ khi trạng thái đổi.
 * ============================================================================
 */

import { useSyncExternalStore } from 'react';
import type { CardMemory } from './srs';
import { newCardMemory } from './srs';

const KEY = 'aegis.progress.v1';
const SCHEMA_VERSION = 1;

/* -------------------------------------------------------------------------- */
/*  Hình dạng dữ liệu                                                          */
/* -------------------------------------------------------------------------- */

export interface Settings {
  theme: 'auto' | 'light' | 'dark';
  /** Hệ số cỡ chữ 0.9–1.3 — người học có thị lực khác nhau. */
  fontScale: number;
  /** Tắt hoạt ảnh (tiền đình, đau nửa đầu, hoặc chỉ là thích yên tĩnh). */
  reduceMotion: boolean;
  /** Chế độ tập trung: ẩn mọi thứ ngoài nội dung. */
  focusMode: boolean;
  /** Mục tiêu phút học mỗi ngày. Nhỏ và giữ được > lớn và bỏ cuộc. */
  dailyGoalMinutes: number;
  /** Mục tiêu xác suất nhớ (FSRS). */
  targetRetention: number;
  /** Trần thẻ mới mỗi ngày — chống "vay nợ ôn tập" không trả nổi. */
  newCardsPerDay: number;
  /** Trần thẻ ôn mỗi ngày. */
  maxReviewsPerDay: number;
  /** Hiện xem trước khoảng cách trên nút chấm điểm. */
  showIntervals: boolean;
  /** Hỏi mức độ tự tin trước khi lật đáp án (huấn luyện siêu nhận thức). */
  askConfidence: boolean;
  /** Đã xem hướng dẫn khởi động chưa. */
  onboarded: boolean;
  /** Tên hiển thị (tuỳ chọn, chỉ lưu máy). */
  name: string;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'auto',
  fontScale: 1,
  reduceMotion: false,
  focusMode: false,
  dailyGoalMinutes: 20,
  targetRetention: 0.9,
  newCardsPerDay: 15,
  maxReviewsPerDay: 120,
  showIntervals: true,
  askConfidence: true,
  onboarded: false,
  name: '',
};

export interface LessonProgress {
  /** Lần đầu mở bài (epoch ms). */
  startedAt: number;
  /** Đọc hết + qua bài kiểm tra (epoch ms). 0 = chưa xong. */
  completedAt: number;
  /** Phần trăm đã đọc (0–100) — cho phép "tiếp tục chỗ đang dở". */
  readPct: number;
  /** Điểm bài kiểm tra cuối cao nhất (0–1). */
  bestScore: number;
  /** Số lần làm bài kiểm tra. */
  attempts: number;
  /** Tổng số phút đã bỏ ra. */
  minutes: number;
}

export interface ConceptStat {
  /** Số lần gặp câu hỏi thuộc khái niệm này. */
  seen: number;
  correct: number;
  lastAt: number;
  /** Chuỗi đúng liên tiếp gần nhất. */
  streak: number;
}

export interface DayLog {
  /** YYYY-MM-DD theo giờ địa phương. */
  date: string;
  minutes: number;
  reviews: number;
  newCards: number;
  lessonsDone: number;
  quizAnswered: number;
  quizCorrect: number;
}

export interface CalibrationPoint {
  /** Mức tự tin người học tự chấm (0.25 / 0.5 / 0.75 / 0.95). */
  conf: number;
  correct: boolean;
  at: number;
}

export interface Progress {
  v: number;
  createdAt: number;
  settings: Settings;
  lessons: Record<string, LessonProgress>;
  cards: Record<string, CardMemory>;
  concepts: Record<string, ConceptStat>;
  days: DayLog[];
  badges: string[];
  /** Ghi chú riêng của người học theo bài (elaboration → nhớ sâu hơn). */
  notes: Record<string, string>;
  /** Trạng thái các ô đánh dấu trong danh sách kiểm tra. */
  checks: Record<string, boolean>;
  calibration: CalibrationPoint[];
  /** Bài đang học dở, để nút "Tiếp tục" luôn đúng chỗ. */
  lastLesson: string;
  /** Thẻ người học tự đánh dấu để xem lại. */
  flagged: string[];
}

export function emptyProgress(): Progress {
  return {
    v: SCHEMA_VERSION,
    createdAt: Date.now(),
    settings: { ...DEFAULT_SETTINGS },
    lessons: {},
    cards: {},
    concepts: {},
    days: [],
    badges: [],
    notes: {},
    checks: {},
    calibration: [],
    lastLesson: '',
    flagged: [],
  };
}

/* -------------------------------------------------------------------------- */
/*  Store                                                                      */
/* -------------------------------------------------------------------------- */

let state: Progress = load();
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function load(): Progress {
  if (typeof localStorage === 'undefined') return emptyProgress();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return migrate(parsed);
  } catch {
    // Dữ liệu hỏng thì bắt đầu lại còn hơn là app trắng màn hình.
    return emptyProgress();
  }
}

/** Nâng cấp lược đồ. Luôn hợp nhất với mặc định để thêm trường mới không vỡ. */
function migrate(p: Partial<Progress>): Progress {
  const base = emptyProgress();
  return {
    ...base,
    ...p,
    v: SCHEMA_VERSION,
    settings: { ...base.settings, ...(p.settings ?? {}) },
    lessons: p.lessons ?? {},
    cards: p.cards ?? {},
    concepts: p.concepts ?? {},
    days: p.days ?? [],
    badges: p.badges ?? [],
    notes: p.notes ?? {},
    checks: p.checks ?? {},
    calibration: p.calibration ?? [],
    flagged: p.flagged ?? [],
  };
}

function persist() {
  if (saveTimer) clearTimeout(saveTimer);
  // Gộp ghi để không đụng localStorage mỗi lần gõ phím.
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* hết dung lượng — im lặng, không làm hỏng phiên học */
    }
  }, 220);
}

function emit() {
  for (const l of listeners) l();
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const getProgress = (): Progress => state;

/** Cập nhật bất biến (immutable). `fn` nhận bản nháp và trả về trạng thái mới. */
export function update(fn: (p: Progress) => Progress): void {
  state = fn(state);
  persist();
  emit();
}

/** Hook đọc toàn bộ tiến độ. */
export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getProgress, getProgress);
}

/** Hook chọn một lát cắt — tránh render lại thừa. Bộ chọn phải trả về giá trị ổn định. */
export function useProgressSlice<T>(sel: (p: Progress) => T, isEqual = Object.is): T {
  return useSyncExternalStore(
    (cb) => {
      let prev = sel(state);
      return subscribe(() => {
        const next = sel(state);
        if (!isEqual(prev, next)) {
          prev = next;
          cb();
        }
      });
    },
    () => sel(state),
    () => sel(state),
  );
}

/* -------------------------------------------------------------------------- */
/*  Hành động cấp cao                                                          */
/* -------------------------------------------------------------------------- */

export const todayKey = (d = new Date()): string => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

function withToday(p: Progress, fn: (d: DayLog) => DayLog): Progress {
  const key = todayKey();
  const days = [...p.days];
  const i = days.findIndex((d) => d.date === key);
  const cur: DayLog =
    i >= 0
      ? days[i]
      : { date: key, minutes: 0, reviews: 0, newCards: 0, lessonsDone: 0, quizAnswered: 0, quizCorrect: 0 };
  const next = fn(cur);
  if (i >= 0) days[i] = next;
  else days.push(next);
  // Giữ 400 ngày gần nhất — đủ vẽ biểu đồ năm, không phình bộ nhớ.
  return { ...p, days: days.slice(-400) };
}

export const setSettings = (patch: Partial<Settings>) =>
  update((p) => ({ ...p, settings: { ...p.settings, ...patch } }));

export function getCard(id: string): CardMemory {
  return state.cards[id] ?? newCardMemory();
}

export const putCard = (id: string, mem: CardMemory) =>
  update((p) => ({ ...p, cards: { ...p.cards, [id]: mem } }));

export const logReview = (isNew: boolean) =>
  update((p) =>
    withToday(p, (d) => ({ ...d, reviews: d.reviews + 1, newCards: d.newCards + (isNew ? 1 : 0) })),
  );

export const logMinutes = (mins: number) =>
  update((p) => withToday(p, (d) => ({ ...d, minutes: Math.round((d.minutes + mins) * 10) / 10 })));

export function logQuiz(tags: string[], correct: boolean, conf?: number): void {
  update((p) => {
    const concepts = { ...p.concepts };
    const now = Date.now();
    for (const t of tags) {
      const c = concepts[t] ?? { seen: 0, correct: 0, lastAt: 0, streak: 0 };
      concepts[t] = {
        seen: c.seen + 1,
        correct: c.correct + (correct ? 1 : 0),
        lastAt: now,
        streak: correct ? c.streak + 1 : 0,
      };
    }
    const calibration =
      conf === undefined ? p.calibration : [...p.calibration, { conf, correct, at: now }].slice(-500);
    return withToday({ ...p, concepts, calibration }, (d) => ({
      ...d,
      quizAnswered: d.quizAnswered + 1,
      quizCorrect: d.quizCorrect + (correct ? 1 : 0),
    }));
  });
}

export function touchLesson(id: string, patch: Partial<LessonProgress>): void {
  update((p) => {
    const cur: LessonProgress = p.lessons[id] ?? {
      startedAt: Date.now(),
      completedAt: 0,
      readPct: 0,
      bestScore: 0,
      attempts: 0,
      minutes: 0,
    };
    const merged: LessonProgress = { ...cur, ...patch };
    // readPct chỉ đi lên: cuộn ngược không được phép "xoá" tiến độ đã đạt.
    if (patch.readPct !== undefined) merged.readPct = Math.max(cur.readPct, patch.readPct);
    if (patch.bestScore !== undefined) merged.bestScore = Math.max(cur.bestScore, patch.bestScore);
    const justCompleted = !cur.completedAt && merged.completedAt;
    const base = { ...p, lessons: { ...p.lessons, [id]: merged }, lastLesson: id };
    return justCompleted ? withToday(base, (d) => ({ ...d, lessonsDone: d.lessonsDone + 1 })) : base;
  });
}

export const setNote = (lessonId: string, text: string) =>
  update((p) => ({ ...p, notes: { ...p.notes, [lessonId]: text } }));

export const toggleCheck = (key: string) =>
  update((p) => ({ ...p, checks: { ...p.checks, [key]: !p.checks[key] } }));

export const toggleFlag = (cardId: string) =>
  update((p) => ({
    ...p,
    flagged: p.flagged.includes(cardId) ? p.flagged.filter((x) => x !== cardId) : [...p.flagged, cardId],
  }));

export const awardBadge = (id: string) =>
  update((p) => (p.badges.includes(id) ? p : { ...p, badges: [...p.badges, id] }));

/* -------------------------------------------------------------------------- */
/*  Chuỗi ngày học                                                             */
/* -------------------------------------------------------------------------- */

export interface StreakInfo {
  current: number;
  longest: number;
  activeToday: boolean;
  /** 7 ngày gần nhất (cũ → mới): có đạt mục tiêu không. */
  week: { date: string; active: boolean; isToday: boolean; label: string }[];
}

/**
 * Chuỗi ngày tính theo "có học gì đó", KHÔNG phải "đạt đủ chỉ tiêu".
 * Ngưỡng thấp là cố ý: mục đích của chuỗi là duy trì THÓI QUEN, và một chuỗi
 * dễ gãy sẽ tạo áp lực rồi dẫn tới bỏ hẳn. 5 phút mệt mỏi vẫn nên được tính.
 */
export function computeStreak(p: Progress = state): StreakInfo {
  const active = new Set(p.days.filter((d) => d.minutes >= 2 || d.reviews >= 3).map((d) => d.date));
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  let current = 0;
  const probe = new Date();
  if (!active.has(todayKey(probe))) probe.setDate(probe.getDate() - 1); // hôm nay chưa học vẫn chưa gãy chuỗi
  for (;;) {
    if (!active.has(todayKey(probe))) break;
    current++;
    probe.setDate(probe.getDate() - 1);
  }

  let longest = 0;
  let run = 0;
  const sorted = [...active].sort();
  let prev: Date | null = null;
  for (const k of sorted) {
    const [y, m, d] = k.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    run = prev && Math.round((cur.getTime() - prev.getTime()) / 86_400_000) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = cur;
  }

  const week: StreakInfo['week'] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = todayKey(d);
    week.push({ date: k, active: active.has(k), isToday: i === 0, label: dayNames[d.getDay()] });
  }

  return { current, longest, activeToday: active.has(todayKey()), week };
}

/* -------------------------------------------------------------------------- */
/*  Xuất / nhập                                                                */
/* -------------------------------------------------------------------------- */

export function exportJSON(): string {
  return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
}

export function importJSON(text: string): { ok: boolean; message: string } {
  try {
    const parsed = JSON.parse(text) as Partial<Progress>;
    if (typeof parsed !== 'object' || parsed === null || !('lessons' in parsed || 'cards' in parsed)) {
      return { ok: false, message: 'Tệp không đúng định dạng tiến độ AEGIS.' };
    }
    state = migrate(parsed);
    persist();
    emit();
    return { ok: true, message: 'Đã khôi phục tiến độ.' };
  } catch {
    return { ok: false, message: 'Không đọc được tệp JSON.' };
  }
}

export function resetAll(): void {
  state = emptyProgress();
  persist();
  emit();
}

/** Xoá tiến độ học nhưng GIỮ tuỳ chỉnh — người học muốn "học lại từ đầu". */
export function resetLearningOnly(): void {
  const s = state.settings;
  state = { ...emptyProgress(), settings: s };
  persist();
  emit();
}
