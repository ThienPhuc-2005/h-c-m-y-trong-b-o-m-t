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
/** Trỏ tới bản sao dữ liệu hỏng đang chờ người học tải về. */
const KEY_RECOVERY = `${KEY}.recovery`;
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
  /**
   * Lần xuất tệp sao lưu gần nhất (epoch ms). 0 = chưa bao giờ.
   *
   * Không có trường này thì app không thể biết người học đã sao lưu chưa, nên
   * chỉ nhắc được một lần lúc onboarding — đúng lúc chưa có gì để mất.
   */
  lastExportAt: number;
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
    lastExportAt: 0,
  };
}

/* -------------------------------------------------------------------------- */
/*  Store                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Bản gốc không đọc được, đã được cất sang một khoá riêng. Giao diện dùng thông
 * tin này để mời người học tải nó về trước khi học tiếp.
 */
export interface Recovery {
  key: string;
  bytes: number;
}

/* -------------------------------------------------------------------------- */
/*  THỨ TỰ KHAI BÁO Ở ĐÂY LÀ CÓ CHỦ ĐÍCH — đừng sắp xếp lại.                   */
/*                                                                             */
/*  `load()` được gọi ngay lúc nạp mô-đun và nhánh catch của nó GHI vào         */
/*  `recovery` cùng `writeFailed`. `let` không được hoisted như `var`: nếu hai  */
/*  biến này khai báo sau `let state = load()`, chúng còn nằm trong vùng chết   */
/*  tạm thời khi catch chạy, và phép gán ném ReferenceError ngay giữa lúc nạp   */
/*  mô-đun — app trắng màn hình trước cả khi React kịp gắn ErrorBoundary.       */
/*  Đúng loại lỗi mà cả cụm mã này sinh ra để ngăn.                            */
/* -------------------------------------------------------------------------- */

let recovery: Recovery | null = null;

/** Ghi thất bại (thường là hết dung lượng). Giao diện phải nói ra, không nuốt. */
let writeFailed = false;

const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Khởi tạo ở CUỐI khối này, sau khi mọi hàm ép kiểu đã tồn tại — xem chú thích
 * "THỨ TỰ KHAI BÁO" ở trên. `migrate()` gọi `isObj`, `num`, `record`… vốn là
 * `const`, nên nạp sớm sẽ ném ReferenceError và bị chính nhánh catch của
 * `load()` hiểu nhầm thành "dữ liệu hỏng" — cách ly luôn dữ liệu hoàn toàn lành.
 */
let state: Progress;

/* -------------------------------------------------------------------------- */
/*  Ép kiểu phòng thủ                                                          */
/* -------------------------------------------------------------------------- */

/**
 * VÌ SAO PHẢI KIỂM TỪNG TRƯỜNG thay vì tin vào `as Partial<Progress>`:
 *
 * Khẳng định kiểu của TypeScript biến mất lúc chạy. Dữ liệu tới đây từ hai
 * nguồn không đáng tin — localStorage (người dùng sửa được, tiện ích mở rộng
 * sửa được) và tệp người học tự chọn để nhập. Chỉ cần `days` là một con số thay
 * vì một mảng, `buildPlan` gọi `p.days.find(...)` và ném lỗi. Mà `buildPlan`
 * chạy TRƯỚC bộ định tuyến, nên hậu quả không phải một trang hỏng — là màn hình
 * trắng, và người học không vào nổi trang Cài đặt để tự cứu.
 *
 * Nguyên tắc: thà bỏ đi một trường lạ còn hơn để nó lan thành lỗi thời gian chạy.
 */

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const num = (v: unknown, fallback = 0): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);

const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback);

/** Lọc một object thành `Record<string, T>`, bỏ mọi mục không ép được. */
function record<T>(v: unknown, item: (x: unknown) => T | null): Record<string, T> {
  if (!isObj(v)) return {};
  const out: Record<string, T> = {};
  for (const [k, raw] of Object.entries(v)) {
    // Bỏ qua khoá nguyên mẫu: `JSON.parse` tạo chúng như thuộc tính thường,
    // nhưng gán lại bằng `out[k] =` thì kích hoạt setter trên Object.prototype.
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    const ok = item(raw);
    if (ok !== null) out[k] = ok;
  }
  return out;
}

/** Lọc một mảng, bỏ mọi phần tử không ép được. */
function list<T>(v: unknown, item: (x: unknown) => T | null): T[] {
  if (!Array.isArray(v)) return [];
  const out: T[] = [];
  for (const raw of v) {
    const ok = item(raw);
    if (ok !== null) out.push(ok);
  }
  return out;
}

const CARD_STATES = new Set(['new', 'learning', 'review', 'relearning']);

function coerceCard(v: unknown): CardMemory | null {
  if (!isObj(v)) return null;
  const st = str(v.state, 'new');
  return {
    s: Math.max(0, num(v.s)),
    d: Math.min(10, Math.max(0, num(v.d))),
    state: (CARD_STATES.has(st) ? st : 'new') as CardMemory['state'],
    due: num(v.due),
    last: num(v.last),
    reps: Math.max(0, Math.floor(num(v.reps))),
    lapses: Math.max(0, Math.floor(num(v.lapses))),
    step: Math.max(0, Math.floor(num(v.step))),
  };
}

function coerceLesson(v: unknown): LessonProgress | null {
  if (!isObj(v)) return null;
  return {
    startedAt: num(v.startedAt),
    completedAt: num(v.completedAt),
    readPct: Math.min(100, Math.max(0, num(v.readPct))),
    bestScore: Math.min(1, Math.max(0, num(v.bestScore))),
    attempts: Math.max(0, Math.floor(num(v.attempts))),
    minutes: Math.max(0, num(v.minutes)),
  };
}

function coerceConcept(v: unknown): ConceptStat | null {
  if (!isObj(v)) return null;
  return {
    seen: Math.max(0, Math.floor(num(v.seen))),
    correct: Math.max(0, Math.floor(num(v.correct))),
    lastAt: num(v.lastAt),
    streak: Math.max(0, Math.floor(num(v.streak))),
  };
}

function coerceDay(v: unknown): DayLog | null {
  if (!isObj(v)) return null;
  // Không có ngày hợp lệ thì bản ghi vô nghĩa — mọi phép tính chuỗi ngày và
  // biểu đồ đều khoá theo trường này.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str(v.date))) return null;
  return {
    date: str(v.date),
    minutes: Math.max(0, num(v.minutes)),
    reviews: Math.max(0, Math.floor(num(v.reviews))),
    newCards: Math.max(0, Math.floor(num(v.newCards))),
    lessonsDone: Math.max(0, Math.floor(num(v.lessonsDone))),
    quizAnswered: Math.max(0, Math.floor(num(v.quizAnswered))),
    quizCorrect: Math.max(0, Math.floor(num(v.quizCorrect))),
  };
}

function coerceCalibration(v: unknown): CalibrationPoint | null {
  if (!isObj(v)) return null;
  const conf = num(v.conf, -1);
  if (conf < 0 || conf > 1) return null;
  return { conf, correct: bool(v.correct, false), at: num(v.at) };
}

function coerceSettings(v: unknown): Settings {
  const d = DEFAULT_SETTINGS;
  if (!isObj(v)) return { ...d };
  const theme = str(v.theme, d.theme);
  return {
    theme: (theme === 'light' || theme === 'dark' || theme === 'auto' ? theme : d.theme) as Settings['theme'],
    // Kẹp đúng khoảng mà giao diện cho phép. Không kẹp thì `fontScale: 900`
    // trong một tệp nhập làm chữ phồng tới mức không mở nổi trang Cài đặt để sửa.
    fontScale: Math.min(1.4, Math.max(0.85, num(v.fontScale, d.fontScale))),
    reduceMotion: bool(v.reduceMotion, d.reduceMotion),
    focusMode: bool(v.focusMode, d.focusMode),
    dailyGoalMinutes: Math.min(600, Math.max(1, num(v.dailyGoalMinutes, d.dailyGoalMinutes))),
    targetRetention: Math.min(0.99, Math.max(0.7, num(v.targetRetention, d.targetRetention))),
    newCardsPerDay: Math.min(999, Math.max(0, Math.floor(num(v.newCardsPerDay, d.newCardsPerDay)))),
    maxReviewsPerDay: Math.min(9999, Math.max(1, Math.floor(num(v.maxReviewsPerDay, d.maxReviewsPerDay)))),
    showIntervals: bool(v.showIntervals, d.showIntervals),
    askConfidence: bool(v.askConfidence, d.askConfidence),
    onboarded: bool(v.onboarded, d.onboarded),
    name: str(v.name, d.name).slice(0, 80),
  };
}

/**
 * Nâng cấp lược đồ VÀ ép kiểu. Luôn hợp nhất với mặc định để thêm trường mới
 * không làm vỡ dữ liệu cũ, và luôn kiểm kiểu để dữ liệu lạ không làm vỡ app.
 */
function migrate(p: unknown): Progress {
  const base = emptyProgress();
  if (!isObj(p)) return base;
  return {
    v: SCHEMA_VERSION,
    createdAt: num(p.createdAt, base.createdAt),
    settings: coerceSettings(p.settings),
    lessons: record(p.lessons, coerceLesson),
    cards: record(p.cards, coerceCard),
    concepts: record(p.concepts, coerceConcept),
    days: list(p.days, coerceDay).slice(-400),
    badges: list(p.badges, (x) => (typeof x === 'string' ? x : null)),
    notes: record(p.notes, (x) => (typeof x === 'string' ? x : null)),
    checks: record(p.checks, (x) => (typeof x === 'boolean' ? x : null)),
    calibration: list(p.calibration, coerceCalibration).slice(-500),
    lastLesson: str(p.lastLesson),
    flagged: list(p.flagged, (x) => (typeof x === 'string' ? x : null)),
    lastExportAt: num(p.lastExportAt),
  };
}

/* -------------------------------------------------------------------------- */
/*  Nạp, cách ly dữ liệu hỏng                                                  */
/* -------------------------------------------------------------------------- */

export const getRecovery = (): Recovery | null => recovery;

export function readRecovery(): string {
  if (!recovery) return '';
  try {
    return localStorage.getItem(recovery.key) ?? '';
  } catch {
    return '';
  }
}

/** Người học đã tải bản hỏng về (hoặc chủ động bỏ qua) — thôi nhắc. */
export function dismissRecovery(remove: boolean): void {
  try {
    if (remove && recovery) localStorage.removeItem(recovery.key);
    localStorage.removeItem(KEY_RECOVERY);
  } catch {
    /* không xoá được cũng không sao, nó chỉ chiếm chỗ */
  }
  recovery = null;
  emit();
}

function load(): Progress {
  if (typeof localStorage === 'undefined') return emptyProgress();
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    return migrate(JSON.parse(raw));
  } catch {
    /**
     * KHÔNG được lặng lẽ bắt đầu lại. Bản cũ có thể chỉ hỏng vài ký tự cuối do
     * hết dung lượng giữa lúc ghi — vẫn cứu được bằng tay. Nếu ta trả về
     * `emptyProgress()` thì `onboarded` thành false, người học thấy màn hình
     * chào mừng, bấm "Bắt đầu", và lần ghi kế tiếp XOÁ SẠCH bản gốc.
     *
     * Vì vậy: cất bản gốc sang một khoá riêng trước, rồi mới bắt đầu lại.
     */
    if (raw) {
      const key = `${KEY}.corrupt.${Date.now()}`;
      try {
        localStorage.setItem(key, raw);
        // Ghi một CÁI MỐC bền vững, không chỉ giữ cờ trong bộ nhớ: người học
        // rất dễ tải lại trang trước khi kịp đọc, và nếu cờ mất theo thì họ
        // không bao giờ biết bản cũ còn nằm đâu đó.
        localStorage.setItem(KEY_RECOVERY, key);
        // Dọn khoá chính. Bản gốc đã an toàn ở chỗ khác, nên để lại một chuỗi
        // hỏng ở đây chỉ khiến mỗi lần mở app lại đẻ thêm một bản sao nữa.
        localStorage.removeItem(KEY);
        recovery = { key, bytes: raw.length };
      } catch {
        // Không còn chỗ để cất bản sao. Giữ nguyên bản gốc tại khoá cũ và để
        // app chạy với trạng thái rỗng trong bộ nhớ — mất mát vẫn tránh được
        // vì `writeNow()` từ chối ghi đè khi đang ở chế độ này.
        recovery = { key: KEY, bytes: raw.length };
      }
    }
    return emptyProgress();
  }
}

/**
 * Khôi phục lại cái mốc sau khi tải lại trang. Gọi một lần lúc nạp mô-đun, sau
 * `load()` — nếu lần nạp này thành công nhưng lần trước đã cất một bản hỏng thì
 * lời mời tải bản đó về vẫn phải còn đó.
 */
function restoreRecoveryMarker(): void {
  if (recovery || typeof localStorage === 'undefined') return;
  try {
    const key = localStorage.getItem(KEY_RECOVERY);
    if (!key) return;
    const raw = localStorage.getItem(key);
    if (raw === null) {
      localStorage.removeItem(KEY_RECOVERY);
      return;
    }
    recovery = { key, bytes: raw.length };
  } catch {
    /* không đọc được thì thôi, không đáng để chặn cả app */
  }
}
restoreRecoveryMarker();
state = load();

/* -------------------------------------------------------------------------- */
/*  Ghi                                                                        */
/* -------------------------------------------------------------------------- */

export const hasWriteFailed = (): boolean => writeFailed;

function writeNow(): void {
  // Bản gốc hỏng chưa được cứu và cũng chưa cất được sang chỗ khác: ghi đè lúc
  // này là phá luôn thứ duy nhất còn cứu được.
  if (recovery && recovery.key === KEY) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    if (writeFailed) {
      writeFailed = false;
      emit();
    }
  } catch {
    if (!writeFailed) {
      writeFailed = true;
      emit();
    }
  }
}

function persist() {
  if (saveTimer) clearTimeout(saveTimer);
  // Gộp ghi để không đụng localStorage mỗi lần gõ phím.
  saveTimer = setTimeout(writeNow, 220);
}

/**
 * Ghi ngay lập tức bản đang chờ. Việc gộp ghi 220ms nghĩa là lượt chấm điểm
 * cuối cùng trước khi đóng tab có thể chưa kịp lưu.
 */
export function flush(): void {
  if (!saveTimer) return;
  clearTimeout(saveTimer);
  saveTimer = null;
  writeNow();
}

function emit() {
  for (const l of listeners) l();
}

/* -------------------------------------------------------------------------- */
/*  Đồng bộ giữa nhiều tab                                                     */
/* -------------------------------------------------------------------------- */

/**
 * `state` là biến cấp mô-đun, nên mỗi tab giữ một bản riêng và `persist()` ghi
 * cả object. Không có đoạn này thì kịch bản rất đời thường sau làm mất dữ liệu:
 * mở tab A đọc bài, mở tab B ôn 30 thẻ, quay lại tab A bấm xong bài kiểm tra —
 * tab A ghi đè bằng ảnh chụp cũ và 30 lượt ôn bốc hơi, không một tín hiệu nào.
 *
 * Sự kiện `storage` chỉ bắn ở các tab KHÁC tab vừa ghi, đúng thứ ta cần.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY || e.newValue === null) return;
    try {
      state = migrate(JSON.parse(e.newValue));
      emit();
    } catch {
      /* tab kia ghi thứ không đọc được — giữ nguyên bản của mình còn hơn */
    }
  });

  // `pagehide` bắn cả khi đóng tab lẫn khi trình duyệt đưa trang vào bộ nhớ
  // đệm quay lui, và đáng tin hơn `beforeunload` trên di động.
  window.addEventListener('pagehide', flush);
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

/**
 * Đặt giá trị tường minh thay vì đảo. Cần cho những chỗ gọi từ `useEffect`:
 * ở chế độ StrictMode của React, effect chạy hai lần, và hai lần đảo liên tiếp
 * sẽ triệt tiêu nhau — một lỗi chỉ xuất hiện lúc phát triển nhưng vẫn đáng chặn.
 */
export const setCheck = (key: string, value: boolean) =>
  update((p) => (p.checks[key] === value ? p : { ...p, checks: { ...p.checks, [key]: value } }));

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

/** Ảnh chụp gọn để đối chiếu trước khi nhập — "cái sắp vào" so với "cái đang có". */
export interface Snapshot {
  lessonsDone: number;
  cards: number;
  minutes: number;
  exportedAt: number;
}

export function describe(p: Progress): Snapshot {
  return {
    lessonsDone: Object.values(p.lessons).filter((l) => l.completedAt > 0).length,
    cards: Object.keys(p.cards).length,
    minutes: Math.round(p.days.reduce((s, d) => s + d.minutes, 0)),
    exportedAt: p.lastExportAt,
  };
}

export function exportJSON(): string {
  // Ghi lại thời điểm xuất NGAY TRONG dữ liệu được xuất, để bản sao lưu tự nói
  // được nó cũ tới đâu khi người học mở lại sau nhiều tháng.
  const at = Date.now();
  update((p) => ({ ...p, lastExportAt: at }));
  return JSON.stringify({ ...state, exportedAt: new Date(at).toISOString() }, null, 2);
}

/* -------------------------------------------------------------------------- */
/*  Nhập: xem trước, sao lưu bản đang có, cho phép hoàn tác                     */
/* -------------------------------------------------------------------------- */

const KEY_PREV = `${KEY}.prev`;

/** Đọc thử tệp mà KHÔNG ghi gì — dùng để dựng bảng đối chiếu cho người học. */
export function inspectJSON(text: string): { ok: true; snapshot: Snapshot } | { ok: false; messageKey: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, messageKey: 'settings.importBadJson' };
  }
  if (!isObj(parsed) || !('lessons' in parsed || 'cards' in parsed)) {
    return { ok: false, messageKey: 'settings.importWrongFormat' };
  }
  const p = migrate(parsed);
  // Một tệp đúng định dạng nhưng rỗng trơn gần như chắc chắn là chọn nhầm tệp.
  if (!Object.keys(p.lessons).length && !Object.keys(p.cards).length) {
    return { ok: false, messageKey: 'settings.importEmpty' };
  }
  return { ok: true, snapshot: describe(p) };
}

export function importJSON(text: string): { ok: boolean; messageKey: string } {
  const check = inspectJSON(text);
  if (!check.ok) return { ok: false, messageKey: check.messageKey };

  // Cất bản đang có TRƯỚC khi ghi đè. Nhập nhầm tệp có sức phá hoại đúng bằng
  // nút "Xoá tất cả" — mà nút đó có tới hai bước xác nhận.
  try {
    localStorage.setItem(KEY_PREV, JSON.stringify(state));
  } catch {
    /* không cất được thì vẫn cho nhập, nhưng sẽ không có nút hoàn tác */
  }

  state = migrate(JSON.parse(text));
  writeNow();
  emit();
  return { ok: true, messageKey: 'settings.importOk' };
}

export const canUndoImport = (): boolean => {
  try {
    return localStorage.getItem(KEY_PREV) !== null;
  } catch {
    return false;
  }
};

export function undoImport(): boolean {
  try {
    const raw = localStorage.getItem(KEY_PREV);
    if (!raw) return false;
    state = migrate(JSON.parse(raw));
    localStorage.removeItem(KEY_PREV);
    writeNow();
    emit();
    return true;
  } catch {
    return false;
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
