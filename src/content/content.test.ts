/**
 * Kiểm thử tính toàn vẹn của giáo trình.
 *
 * Nội dung được viết bởi nhiều người ở nhiều thời điểm. Không có lưới an toàn
 * thì sớm muộn cũng có một bài thiếu phần "học để làm gì", một thẻ trùng id
 * làm hỏng tiến độ của thẻ khác, hoặc một hình vẽ trỏ vào id không tồn tại.
 * Những lỗi đó không làm sập app — chúng chỉ âm thầm làm hỏng trải nghiệm học.
 */

import { describe, it, expect } from 'vitest';
import { TRACKS, ALL_LESSONS, ALL_CARDS, ALL_QUIZ, auditCourse, getLesson } from './index';
import { isKnownFigure, isKnownLab } from './registry';
import { ALL_TERMS } from './glossary';

describe('cấu trúc khoá học', () => {
  it('có đủ các chặng và không trùng id', () => {
    const ids = TRACKS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(TRACKS.length).toBeGreaterThanOrEqual(10);
  });

  it('các chặng được sắp đúng thứ tự', () => {
    for (let i = 1; i < TRACKS.length; i++) {
      expect(TRACKS[i].order).toBeGreaterThan(TRACKS[i - 1].order);
    }
  });

  it('mọi bài học có trackId trỏ đúng chặng chứa nó', () => {
    for (const t of TRACKS) {
      for (const l of t.lessons) expect(l.trackId).toBe(t.id);
    }
  });

  it('id bài học, thẻ và câu hỏi đều duy nhất trên toàn khoá', () => {
    const dup = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) !== i);
    expect(dup(ALL_LESSONS.map((l) => l.id))).toEqual([]);
    expect(dup(ALL_CARDS.map((c) => c.id))).toEqual([]);
    expect(dup(ALL_QUIZ.map((q) => q.quiz.id))).toEqual([]);
  });

  it('bài tiên quyết đều tồn tại và không tạo vòng lặp', () => {
    for (const l of ALL_LESSONS) {
      for (const p of l.prereqs ?? []) {
        expect(getLesson(p), `${l.id} yêu cầu bài không tồn tại: ${p}`).toBeDefined();
        expect(p, `${l.id} tự yêu cầu chính nó`).not.toBe(l.id);
      }
    }
    // Phát hiện chu trình bằng duyệt sâu.
    const seen = new Map<string, number>(); // 0 = đang duyệt, 1 = xong
    const walk = (id: string, path: string[]): void => {
      if (seen.get(id) === 1) return;
      expect(seen.get(id), `chu trình bài tiên quyết: ${[...path, id].join(' → ')}`).not.toBe(0);
      seen.set(id, 0);
      for (const p of getLesson(id)?.prereqs ?? []) walk(p, [...path, id]);
      seen.set(id, 1);
    };
    for (const l of ALL_LESSONS) walk(l.id, []);
  });
});

describe('bất biến sư phạm — mọi bài học phải đạt', () => {
  it.each(ALL_LESSONS.map((l) => [l.id, l] as const))('%s đạt các yêu cầu bắt buộc', (_id, l) => {
    // Yêu cầu số 1 của cả ứng dụng: luôn trả lời "học cái này để làm gì".
    expect(l.why?.short?.length ?? 0).toBeGreaterThan(20);
    expect(l.why?.scenario?.length ?? 0).toBeGreaterThan(20);
    expect(l.why?.costOfNotKnowing?.length ?? 0).toBeGreaterThan(20);
    expect(l.why?.roles?.length ?? 0).toBeGreaterThan(0);

    expect(l.objectives.length).toBeGreaterThanOrEqual(2);
    expect(l.keyTakeaways.length).toBeGreaterThanOrEqual(3);
    expect(l.cards.length).toBeGreaterThanOrEqual(3);
    expect(l.quiz.length).toBeGreaterThanOrEqual(2);
    expect(l.blocks.length).toBeGreaterThanOrEqual(5);

    // Thời lượng phải trung thực và vừa sức một phiên học.
    expect(l.minutes).toBeGreaterThan(4);
    expect(l.minutes).toBeLessThanOrEqual(30);

    // Phải có ít nhất một điểm truy hồi giữa bài (predict hoặc checkpoint).
    expect(l.blocks.some((b) => b.t === 'predict' || b.t === 'checkpoint')).toBe(true);

    // Phải có ít nhất một yếu tố trực quan (mã hoá kép).
    expect(l.blocks.some((b) => b.t === 'figure' || b.t === 'lab' || b.t === 'table' || b.t === 'compare' || b.t === 'steps')).toBe(true);
  });
});

describe('tham chiếu tài nguyên', () => {
  it('mọi hình vẽ được tham chiếu đều nằm trong sổ đăng ký', () => {
    for (const l of ALL_LESSONS) {
      for (const b of l.blocks) {
        if (b.t === 'figure') {
          expect(isKnownFigure(b.id), `${l.id} dùng hình không có trong registry: ${b.id}`).toBe(true);
        }
      }
    }
  });

  it('mọi thuật ngữ được tham chiếu đều tồn tại trong từ điển', () => {
    // Lỗi này KHÔNG làm sập trang: giao diện lọc bỏ id không tìm thấy. Hậu quả
    // là dải "Thuật ngữ trong phần này" âm thầm thiếu đúng những từ người học
    // vừa gặp lần đầu — không ai báo lỗi, chỉ có người học không tra được nghĩa.
    const have = new Set(ALL_TERMS.map((t) => t.id));
    const dangling = new Map<string, string[]>();
    for (const l of ALL_LESSONS) {
      const used = [...(l.terms ?? []), ...l.blocks.flatMap((b) => (b.t === 'terms' ? b.ids : []))];
      for (const id of used) {
        if (!have.has(id)) dangling.set(id, [...(dangling.get(id) ?? []), l.id]);
      }
    }
    expect([...dangling.entries()].map(([id, ls]) => `${id} (dùng ở ${ls.join(', ')})`)).toEqual([]);
  });

  it('mọi phòng lab được tham chiếu đều nằm trong sổ đăng ký', () => {
    for (const l of ALL_LESSONS) {
      for (const b of l.blocks) {
        if (b.t === 'lab') {
          expect(isKnownLab(b.id), `${l.id} dùng lab không có trong registry: ${b.id}`).toBe(true);
        }
      }
    }
  });
});

describe('chất lượng câu hỏi', () => {
  it.each(ALL_QUIZ.map((q) => [q.quiz.id, q] as const))('%s hợp lệ', (_id, { quiz, lessonId }) => {
    // Phản hồi giải thích mạnh hơn hẳn phản hồi đúng/sai, nên nó là bắt buộc.
    expect(quiz.why?.length ?? 0, `${lessonId}/${quiz.id} thiếu giải thích`).toBeGreaterThan(20);
    expect(quiz.q.length).toBeGreaterThan(8);

    switch (quiz.kind) {
      case 'mcq':
        expect(quiz.options.length).toBeGreaterThanOrEqual(2);
        expect(quiz.answer).toBeGreaterThanOrEqual(0);
        expect(quiz.answer).toBeLessThan(quiz.options.length);
        if (quiz.distractorWhy) expect(quiz.distractorWhy.length).toBe(quiz.options.length);
        break;
      case 'multi':
        expect(quiz.answers.length).toBeGreaterThan(0);
        for (const a of quiz.answers) {
          expect(a).toBeGreaterThanOrEqual(0);
          expect(a).toBeLessThan(quiz.options.length);
        }
        // Nếu mọi phương án đều đúng thì câu hỏi không phân biệt được gì.
        expect(quiz.answers.length).toBeLessThan(quiz.options.length);
        break;
      case 'order':
        expect(quiz.items.length).toBeGreaterThanOrEqual(3);
        expect(new Set(quiz.items).size).toBe(quiz.items.length);
        break;
      case 'match':
        expect(quiz.pairs.length).toBeGreaterThanOrEqual(2);
        expect(new Set(quiz.pairs.map((p) => p[1])).size).toBe(quiz.pairs.length);
        break;
      case 'input':
        expect(quiz.accept.length).toBeGreaterThan(0);
        break;
    }
  });
});

describe('thẻ ghi nhớ', () => {
  it('mặt trước là câu hỏi truy hồi, mặt sau ngắn gọn một ý', () => {
    for (const c of ALL_CARDS) {
      expect(c.front.length, `${c.id} mặt trước quá ngắn`).toBeGreaterThan(10);
      // Nguyên tắc "minimum information": thẻ dài là thẻ sẽ bị quên.
      expect(c.back.length, `${c.id} mặt sau quá dài (${c.back.length} ký tự)`).toBeLessThanOrEqual(400);
      expect(c.back.length, `${c.id} mặt sau trống`).toBeGreaterThan(5);
    }
  });
});

describe('từ điển thuật ngữ', () => {
  it('không trùng id và luôn có cả tên Việt lẫn Anh', () => {
    // Phủ cả phần lõi lẫn phần bổ sung: id trùng giữa hai file sẽ khiến mục
    // sau che mất mục trước mà không có dấu hiệu nào.
    const ids = ALL_TERMS.map((t) => t.id);
    const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    expect(dup).toEqual([]);
    for (const t of ALL_TERMS) {
      expect(t.vi.length).toBeGreaterThan(1);
      expect(t.en.length).toBeGreaterThan(1);
      expect(t.def.length).toBeGreaterThan(15);
    }
  });
});

describe('bộ kiểm tra nội dung tích hợp', () => {
  it('không còn lỗi mức nghiêm trọng nào', () => {
    const errors = auditCourse().filter((i) => i.severity === 'error');
    expect(errors.map((e) => `${e.lessonId}: ${e.message}`)).toEqual([]);
  });
});

describe('quy mô khoá học', () => {
  it('đủ lớn để đưa người học từ số 0 tới trình độ làm việc được', () => {
    expect(ALL_LESSONS.length).toBeGreaterThanOrEqual(60);
    expect(ALL_CARDS.length).toBeGreaterThanOrEqual(250);
    expect(ALL_QUIZ.length).toBeGreaterThanOrEqual(300);
    expect(ALL_LESSONS.reduce((s, l) => s + l.minutes, 0)).toBeGreaterThanOrEqual(700);
  });
});
