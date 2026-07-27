/**
 * Mô hình ước lượng thời gian học của một bài.
 *
 * Đây là NGUỒN SỰ THẬT DUY NHẤT cho hai trường `minutes` và `practiceMinutes`:
 *  - `scripts/calibrate-minutes.mjs` nạp tệp này để sinh ra con số ghi vào dữ liệu,
 *  - `content.test.ts` nạp tệp này để kiểm con số đã ghi có còn khớp không.
 *
 * Giữ chung một chỗ vì lý do thực tế: nếu chép mô hình sang cả hai nơi thì bài
 * kiểm thử sẽ trôi theo script và không còn phát hiện được gì.
 */

import type { Lesson } from './types';

/**
 * 140 từ/phút — khoảng giữa của văn kỹ thuật tiếng Việt (120–160). Cố tình
 * KHÔNG lấy con số 200+ của các bộ đếm blog: đó là tốc độ đọc lướt văn phổ
 * thông, không phải tốc độ đọc một đoạn giải thích PR-AUC.
 */
export const WPM = 140;
/** Mỗi dòng mã ~5 giây: mắt phải nhảy dọc theo cấu trúc, không trôi ngang như văn xuôi. */
export const SEC_PER_CODE_LINE = 5;
/** Mỗi phòng lab ~4 phút: đủ để kéo vài thanh trượt và đọc phần kết luận. */
export const MIN_PER_LAB = 4;
/** Mỗi câu hỏi ~25 giây nghĩ và trả lời. Phần chữ giải thích đã tính vào văn xuôi. */
export const SEC_PER_QUESTION = 25;

const words = (s: string | undefined): number => (s && s.trim() ? s.trim().split(/\s+/).length : 0);

export interface Estimate {
  /** Số từ văn xuôi người học phải đọc. */
  prose: number;
  codeLines: number;
  labs: number;
  questions: number;
  /** Phút đọc — giá trị mong đợi của `lesson.minutes`. */
  reading: number;
  /** Phút làm — giá trị mong đợi của `lesson.practiceMinutes`. */
  practice: number;
}

export function estimate(l: Lesson): Estimate {
  let prose = 0;
  let codeLines = 0;
  let labs = 0;
  let questions = 0;

  for (const b of l.blocks) {
    switch (b.t) {
      case 'p': prose += words(b.md); break;
      case 'h': prose += words(b.text); break;
      case 'list': prose += b.items.reduce((s, i) => s + words(i), 0); break;
      case 'callout': prose += words(b.md) + words(b.title); break;
      case 'code': codeLines += b.code.split('\n').length; prose += words(b.caption); break;
      case 'table':
        prose += b.head.reduce((s, h) => s + words(h), 0)
          + b.rows.reduce((s, r) => s + r.reduce((x, c) => x + words(c), 0), 0)
          + words(b.caption);
        break;
      case 'figure': prose += words(b.caption); break;
      case 'predict': prose += words(b.question) + words(b.reveal); questions += 1; break;
      case 'checkpoint':
        questions += b.questions.length;
        prose += b.questions.reduce((s, q) => s + words(q.q) + words(q.why), 0);
        break;
      case 'steps':
        prose += words(b.title) + b.steps.reduce((s, x) => s + words(x.title) + words(x.md), 0);
        break;
      case 'compare':
        prose += words(b.title) + words(b.left.title) + words(b.right.title)
          + b.left.items.reduce((s, i) => s + words(i), 0)
          + b.right.items.reduce((s, i) => s + words(i), 0);
        break;
      case 'lab': labs += 1; prose += words(b.intro); break;
      case 'quote': prose += words(b.md) + words(b.source); break;
      case 'checklist': prose += words(b.title) + b.items.reduce((s, i) => s + words(i), 0); break;
      case 'terms': break;
    }
  }

  // Khung bài cũng nằm trên trang và cũng phải đọc.
  prose += words(l.why.short) + words(l.why.scenario) + words(l.why.costOfNotKnowing);
  prose += l.objectives.reduce((s, o) => s + words(o), 0);
  prose += l.keyTakeaways.reduce((s, k) => s + words(k), 0);
  questions += l.quiz.length;
  prose += l.quiz.reduce((s, q) => s + words(q.q) + words(q.why), 0);

  return {
    prose,
    codeLines,
    labs,
    questions,
    reading: Math.max(1, Math.round(prose / WPM + (codeLines * SEC_PER_CODE_LINE) / 60)),
    practice: Math.max(0, Math.round((labs * MIN_PER_LAB * 60 + questions * SEC_PER_QUESTION) / 60)),
  };
}
