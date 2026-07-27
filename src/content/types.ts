/**
 * ============================================================================
 *  AEGIS — Học máy cho An ninh mạng
 *  Lược đồ nội dung (content schema)
 * ============================================================================
 *
 *  Toàn bộ chương trình học được mô tả bằng dữ liệu thuần (data-driven), nhờ đó:
 *   - Bộ máy học tập (SRS, mastery, kế hoạch ngày) hoạt động trên MỌI bài học
 *     mà không cần biết nội dung cụ thể.
 *   - Nội dung có thể kiểm tra tự động (mỗi bài PHẢI có "why", mục tiêu,
 *     thẻ ghi nhớ, câu hỏi truy hồi).
 *   - Giao diện luôn nhất quán → giảm tải nhận thức ngoại lai (extraneous
 *     cognitive load) cho người học.
 *
 *  Nguyên tắc sư phạm được mã hoá thẳng vào kiểu dữ liệu:
 *   1. `why`      — không bài nào tồn tại mà không trả lời "học để làm gì".
 *   2. `objectives` — mục tiêu quan sát được (Bloom), không phải "hiểu về X".
 *   3. `predict`  — hỏi TRƯỚC khi giảng (pretesting effect / desirable difficulty).
 *   4. `checkpoint` — truy hồi giữa bài (testing effect), không dồn về cuối.
 *   5. `cards`    — chuyển kiến thức thành thẻ lặp lại ngắt quãng (chống quên).
 *   6. `figure`   — mã hoá kép (dual coding): chữ + hình cho cùng một ý.
 *   7. `lab`      — học bằng làm; mọi khái niệm quan trọng đều có bản thao tác được.
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/*  Định danh                                                                  */
/* -------------------------------------------------------------------------- */

export type TrackId = string;
export type LessonId = string;
export type TermId = string;
export type LabId = string;
export type FigureId = string;

/** Mức độ khó — dùng để tô màu, lọc, và điều phối thứ tự học. */
export type Level = 'nen-tang' | 'co-ban' | 'trung-cap' | 'nang-cao' | 'chuyen-gia';

export const LEVEL_LABEL: Record<Level, string> = {
  'nen-tang': 'Nền tảng',
  'co-ban': 'Cơ bản',
  'trung-cap': 'Trung cấp',
  'nang-cao': 'Nâng cao',
  'chuyen-gia': 'Chuyên gia',
};

/** Vai trò nghề nghiệp — giúp người học thấy đường đi tới công việc thật. */
export type Role =
  | 'SOC Analyst'
  | 'Detection Engineer'
  | 'Threat Hunter'
  | 'Security Data Scientist'
  | 'ML Engineer'
  | 'Red Teamer'
  | 'AI Security Engineer'
  | 'Malware Analyst'
  | 'Security Architect'
  | 'GRC / Compliance';

/* -------------------------------------------------------------------------- */
/*  Câu hỏi (retrieval practice)                                               */
/* -------------------------------------------------------------------------- */

interface QuizBase {
  id: string;
  /** Nhãn khái niệm — dùng để ước lượng độ thành thạo theo chủ đề. */
  tags?: string[];
  /** Gợi ý hiển thị khi người học bí (giảm nản, giữ desirable difficulty). */
  hint?: string;
  /** Giải thích BẮT BUỘC — phản hồi giải thích mạnh hơn phản hồi đúng/sai. */
  why: string;
}

export interface QuizMCQ extends QuizBase {
  kind: 'mcq';
  q: string;
  options: string[];
  answer: number;
  /** Vì sao từng phương án sai — bẫy nhận thức phổ biến. */
  distractorWhy?: string[];
}

export interface QuizMulti extends QuizBase {
  kind: 'multi';
  q: string;
  options: string[];
  answers: number[];
}

export interface QuizTF extends QuizBase {
  kind: 'truefalse';
  q: string;
  answer: boolean;
}

export interface QuizOrder extends QuizBase {
  kind: 'order';
  q: string;
  /** Đã ở đúng thứ tự; giao diện sẽ xáo trộn. */
  items: string[];
}

export interface QuizMatch extends QuizBase {
  kind: 'match';
  q: string;
  pairs: [string, string][];
}

export interface QuizInput extends QuizBase {
  kind: 'input';
  q: string;
  /** Các đáp án chấp nhận được (so khớp sau khi chuẩn hoá, không phân biệt hoa thường/dấu). */
  accept: string[];
  placeholder?: string;
}

export type Quiz = QuizMCQ | QuizMulti | QuizTF | QuizOrder | QuizMatch | QuizInput;

/* -------------------------------------------------------------------------- */
/*  Thẻ ghi nhớ (spaced repetition)                                            */
/* -------------------------------------------------------------------------- */

export interface Card {
  id: string;
  /** Mặt trước — PHẢI là một câu hỏi truy hồi, không phải một tiêu đề. */
  front: string;
  /** Mặt sau — ngắn, một ý duy nhất (nguyên tắc minimum information). */
  back: string;
  hint?: string;
  tags?: string[];
}

/* -------------------------------------------------------------------------- */
/*  Khối nội dung                                                              */
/* -------------------------------------------------------------------------- */

export type CalloutKind =
  | 'why' // Vì sao điều này quan trọng
  | 'insight' // Trực giác cốt lõi
  | 'pitfall' // Bẫy thường gặp
  | 'warn' // Cảnh báo an toàn / pháp lý
  | 'story' // Sự cố có thật
  | 'pro' // Mẹo thực chiến
  | 'math' // Phần toán (có thể bỏ qua lần đầu)
  | 'ethics'; // Đạo đức & pháp lý

export type Block =
  /** Đoạn văn. Hỗ trợ markdown rút gọn: **đậm**, *nghiêng*, `mã`, [thuật ngữ](#term:id) */
  | { t: 'p'; md: string }
  | { t: 'h'; text: string; level?: 2 | 3 }
  | { t: 'list'; items: string[]; ordered?: boolean }
  | { t: 'callout'; kind: CalloutKind; title?: string; md: string }
  | { t: 'code'; lang: string; code: string; caption?: string; /** Ẩn cho đến khi bấm mở — tránh quá tải */ collapsed?: boolean }
  | { t: 'table'; head: string[]; rows: string[][]; caption?: string }
  | { t: 'figure'; id: FigureId; caption?: string }
  /** Câu hỏi dự đoán TRƯỚC khi đọc lời giải (pretesting effect). */
  | { t: 'predict'; question: string; reveal: string }
  /** Truy hồi giữa bài. */
  | { t: 'checkpoint'; questions: Quiz[] }
  /** Ví dụ mẫu có lời giải từng bước (worked example → giảm tải nhận thức). */
  | { t: 'steps'; title?: string; steps: { title: string; md: string }[] }
  /** So sánh hai khái niệm dễ nhầm — chống "illusion of knowing". */
  | { t: 'compare'; title?: string; left: { title: string; items: string[] }; right: { title: string; items: string[] } }
  | { t: 'lab'; id: LabId; intro?: string }
  | { t: 'terms'; ids: TermId[] }
  | { t: 'quote'; md: string; source?: string }
  /** Danh sách kiểm tra thực chiến — mang đi dùng được ngay. */
  | { t: 'checklist'; title?: string; items: string[] };

/* -------------------------------------------------------------------------- */
/*  Bài học                                                                    */
/* -------------------------------------------------------------------------- */

export interface Lesson {
  id: LessonId;
  trackId: TrackId;
  title: string;
  /** Một câu mô tả — hiện trên thẻ bài, giúp người học quyết định nhanh. */
  subtitle: string;
  /** Thời lượng ước tính (phút). Tôn trọng thời gian người học: nói thật. */
  minutes: number;
  level: Level;

  /** ĐIỀU KIỆN BẮT BUỘC CỦA APP: mọi bài đều trả lời "học để làm gì". */
  why: {
    /** Một câu, cụ thể, có thể kiểm chứng. */
    short: string;
    /** Tình huống thật nơi kiến thức này được dùng. */
    scenario: string;
    /** Ai dùng nó trong công việc hằng ngày. */
    roles: Role[];
    /** Điều gì hỏng nếu KHÔNG biết kiến thức này. */
    costOfNotKnowing: string;
  };

  /** Mục tiêu quan sát được. Bắt đầu bằng động từ hành động. */
  objectives: string[];

  /** Các bài cần học trước (id). Bộ lập kế hoạch sẽ tôn trọng ràng buộc này. */
  prereqs?: LessonId[];

  blocks: Block[];

  /** Ý chính — hiển thị cuối bài và trong sổ tay ôn nhanh. */
  keyTakeaways: string[];

  /** Thẻ lặp lại ngắt quãng sinh ra từ bài này. */
  cards: Card[];

  /** Kiểm tra cuối bài — quyết định trạng thái "đã thành thạo". */
  quiz: Quiz[];

  /** Thuật ngữ xuất hiện trong bài. */
  terms?: TermId[];

  /** Đọc thêm — nguồn chuẩn, có ghi chú vì sao đáng đọc. */
  further?: { title: string; note: string; url?: string }[];
}

/* -------------------------------------------------------------------------- */
/*  Lộ trình                                                                   */
/* -------------------------------------------------------------------------- */

export interface Track {
  id: TrackId;
  order: number;
  title: string;
  /** Khẩu hiệu ngắn — tạo neo cảm xúc và định vị. */
  tagline: string;
  /** Ký tự biểu tượng (emoji) — mã hoá kép ở cấp điều hướng. */
  icon: string;
  /** Tên biến màu chủ đề (xem styles/tokens.css). */
  hue: 'indigo' | 'cyan' | 'teal' | 'lime' | 'amber' | 'orange' | 'rose' | 'violet' | 'slate' | 'emerald';
  blurb: string;
  /** Sau chặng này bạn LÀM ĐƯỢC gì (outcome, không phải "biết về"). */
  outcomes: string[];
  lessons: Lesson[];
}

/* -------------------------------------------------------------------------- */
/*  Thuật ngữ                                                                  */
/* -------------------------------------------------------------------------- */

export interface Term {
  id: TermId;
  /** Tên tiếng Việt dùng trong bài. */
  vi: string;
  /** Tên tiếng Anh — bắt buộc: tài liệu ngành và công cụ đều dùng tiếng Anh. */
  en: string;
  /** Định nghĩa một câu, không vòng vo. */
  def: string;
  /** Ví dụ cụ thể trong ngữ cảnh bảo mật. */
  example?: string;
  /** Thường bị nhầm với... */
  notToConfuseWith?: string;
  tags?: string[];
}

/* -------------------------------------------------------------------------- */
/*  Tiện ích kiểm tra chất lượng nội dung                                      */
/* -------------------------------------------------------------------------- */

export interface ContentIssue {
  lessonId: LessonId;
  severity: 'error' | 'warn';
  message: string;
}

/**
 * Kiểm tra bất biến nội dung. Chạy trong chế độ dev (trang "Sức khoẻ nội dung")
 * để một bài thiếu "why" hay thiếu thẻ ghi nhớ không thể lọt lưới.
 */
export function auditLesson(l: Lesson): ContentIssue[] {
  const out: ContentIssue[] = [];
  const err = (m: string) => out.push({ lessonId: l.id, severity: 'error', message: m });
  const warn = (m: string) => out.push({ lessonId: l.id, severity: 'warn', message: m });

  if (!l.why?.short) err('Thiếu why.short — mọi bài phải trả lời "học để làm gì".');
  if (!l.why?.costOfNotKnowing) err('Thiếu why.costOfNotKnowing.');
  if (!l.objectives?.length) err('Thiếu mục tiêu học tập.');
  if (!l.keyTakeaways?.length) err('Thiếu ý chính.');
  if (!l.cards?.length) err('Thiếu thẻ ghi nhớ — bài học không có neo chống quên.');
  if (!l.quiz?.length) err('Thiếu bài kiểm tra cuối.');
  if (l.minutes <= 0 || l.minutes > 45) warn(`Thời lượng ${l.minutes} phút nằm ngoài khoảng tối ưu (5–45).`);

  const hasRetrieval = l.blocks.some((b) => b.t === 'checkpoint' || b.t === 'predict');
  if (!hasRetrieval) warn('Không có điểm truy hồi giữa bài (predict/checkpoint).');

  const hasVisual = l.blocks.some((b) => b.t === 'figure' || b.t === 'lab' || b.t === 'table' || b.t === 'compare');
  if (!hasVisual) warn('Không có yếu tố trực quan — thiếu mã hoá kép.');

  const ids = new Set<string>();
  for (const q of l.quiz) {
    if (ids.has(q.id)) err(`Trùng id câu hỏi: ${q.id}`);
    ids.add(q.id);
    if (!q.why) err(`Câu hỏi ${q.id} thiếu giải thích.`);
    if (q.kind === 'mcq' && (q.answer < 0 || q.answer >= q.options.length)) err(`Câu hỏi ${q.id} có đáp án ngoài phạm vi.`);
    if (q.kind === 'multi' && q.answers.some((a) => a < 0 || a >= q.options.length)) err(`Câu hỏi ${q.id} có đáp án ngoài phạm vi.`);
  }
  const cardIds = new Set<string>();
  for (const c of l.cards) {
    if (cardIds.has(c.id)) err(`Trùng id thẻ: ${c.id}`);
    cardIds.add(c.id);
    if (c.back.length > 320) warn(`Thẻ ${c.id} quá dài — vi phạm nguyên tắc "một thẻ một ý".`);
  }
  return out;
}
