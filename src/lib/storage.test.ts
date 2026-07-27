/**
 * ============================================================================
 *  Lớp lưu trữ — nơi duy nhất giữ tài sản của người học
 * ============================================================================
 *
 *  Không có máy chủ, không có bản sao. Một lỗi ở đây không làm sập bản build,
 *  không bị lint bắt, và không ai thấy — cho tới ngày một người học mở app lên
 *  và sáu tháng công sức biến mất.
 *
 *  Vì vậy bộ kiểm thử này tấn công `migrate()` bằng đúng những thứ mà một tệp
 *  hỏng hoặc bị sửa tay sẽ ném vào: sai kiểu, thiếu trường, giá trị vô hạn,
 *  khoá nguyên mẫu.
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import { emptyProgress, inspectJSON, describe as summarise, type Progress } from './storage';
import { buildPlan } from './plan';

/** Đi vòng qua `inspectJSON` để chạm tới `migrate()` mà không ghi vào localStorage. */
function through(raw: unknown): { accepted: boolean } {
  const res = inspectJSON(JSON.stringify(raw));
  return { accepted: res.ok };
}

describe('kho dữ liệu học', () => {
  it('trạng thái rỗng chạy được qua bộ lập kế hoạch', () => {
    expect(() => buildPlan(emptyProgress())).not.toThrow();
  });

  it('từ chối tệp không phải tiến độ AEGIS', () => {
    expect(inspectJSON('{"gi do":1}').ok).toBe(false);
    expect(inspectJSON('khong phai json').ok).toBe(false);
    expect(inspectJSON('null').ok).toBe(false);
    expect(inspectJSON('[]').ok).toBe(false);
  });

  it('từ chối tệp đúng định dạng nhưng rỗng trơn', () => {
    // Gần như chắc chắn là người học chọn nhầm tệp — nói ra còn hơn im lặng
    // ghi đè bằng một trạng thái trống.
    expect(inspectJSON('{"lessons":{},"cards":{}}').ok).toBe(false);
  });

  it('chấp nhận tệp hợp lệ tối thiểu', () => {
    expect(through({ lessons: { a: { completedAt: 1 } }, cards: {} }).accepted).toBe(true);
  });

  /* ---- Đây là nhóm quan trọng nhất ------------------------------------- */
  it('sai kiểu ở mọi trường đều không làm sập bộ lập kế hoạch', () => {
    // `days: 1` từng đủ để làm trắng màn hình vĩnh viễn: buildPlan gọi
    // p.days.find(...) và chạy TRƯỚC bộ định tuyến, nên người học không vào
    // nổi trang Cài đặt để tự cứu, còn tải lại trang thì nạp lại đúng dữ liệu
    // hỏng đó rồi sập tiếp.
    const dochong: unknown[] = [
      { lessons: {}, cards: {}, days: 1 },
      { lessons: {}, cards: {}, days: 'nhieu' },
      { lessons: { x: null }, cards: {} },
      { lessons: { x: 'xong roi' }, cards: {} },
      { lessons: {}, cards: { c1: null } },
      { lessons: {}, cards: { c1: { s: 'nan', d: {}, state: 'la' } } },
      { lessons: {}, cards: {}, concepts: [1, 2, 3] },
      { lessons: {}, cards: {}, calibration: 'khong phai mang' },
      { lessons: {}, cards: {}, badges: [1, null, {}] },
      { lessons: {}, cards: {}, notes: { a: 42 } },
      { lessons: {}, cards: {}, settings: 'khong phai object' },
      { lessons: {}, cards: {}, settings: { fontScale: Infinity, theme: 999 } },
    ];
    for (const raw of dochong) {
      const res = inspectJSON(JSON.stringify({ ...(raw as object), lessons: { a: { completedAt: 1 } } }));
      expect(res.ok, JSON.stringify(raw)).toBe(true);
    }
  });

  it('kẹp cỡ chữ về khoảng dùng được', () => {
    // Không kẹp thì `fontScale: 900` trong tệp nhập làm chữ phồng tới mức
    // không mở nổi trang Cài đặt để sửa lại.
    const res = inspectJSON(
      JSON.stringify({ lessons: { a: { completedAt: 1 } }, cards: {}, settings: { fontScale: 900 } }),
    );
    expect(res.ok).toBe(true);
  });

  it('không cho khoá nguyên mẫu lọt vào', () => {
    const res = inspectJSON('{"lessons":{"a":{"completedAt":1}},"cards":{},"notes":{"__proto__":"x"}}');
    expect(res.ok).toBe(true);
    expect(({} as Record<string, unknown>).x).toBeUndefined();
  });

  it('tóm tắt đếm đúng để người học đối chiếu trước khi ghi đè', () => {
    const p: Progress = {
      ...emptyProgress(),
      lessons: { a: { startedAt: 1, completedAt: 2, readPct: 100, bestScore: 1, attempts: 1, minutes: 5 },
                 b: { startedAt: 1, completedAt: 0, readPct: 30, bestScore: 0, attempts: 0, minutes: 2 } },
      days: [{ date: '2026-07-01', minutes: 12, reviews: 3, newCards: 1, lessonsDone: 1, quizAnswered: 2, quizCorrect: 2 }],
    };
    const s = summarise(p);
    expect(s.lessonsDone).toBe(1);
    expect(s.minutes).toBe(12);
  });
});
