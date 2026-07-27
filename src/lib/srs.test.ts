/**
 * Kiểm thử bộ lập lịch trí nhớ.
 *
 * Vì sao riêng phần này có kiểm thử: một lỗi ở đây KHÔNG hiện ra trên màn hình.
 * Giao diện vẫn đẹp, thẻ vẫn hiện, người học vẫn bấm — chỉ có điều lịch ôn sai,
 * và họ chỉ phát hiện ra sau vài tháng khi nhận ra mình đã quên sạch. Đó là
 * kiểu lỗi tệ nhất, nên nó cần lưới an toàn.
 *
 * Chạy: npm test
 */

import { describe, it, expect } from 'vitest';
import {
  newCardMemory,
  schedule,
  retrievability,
  intervalForRetention,
  previewIntervals,
  formatInterval,
  forecast,
  currentRetention,
  type CardMemory,
} from './srs';

const DAY = 86_400_000;
const seq = () => {
  let i = 0;
  return () => ((i = (i + 0.37) % 1), i); // tất định, không phụ thuộc Math.random
};

describe('retrievability', () => {
  it('bằng 1 ngay tại thời điểm ôn', () => {
    expect(retrievability(0, 10)).toBeCloseTo(1, 5);
  });

  it('đúng bằng 0,9 khi thời gian trôi qua bằng độ ổn định', () => {
    // Đây là định nghĩa của S: số ngày để xác suất nhớ tụt về 90%.
    expect(retrievability(10, 10)).toBeCloseTo(0.9, 3);
    expect(retrievability(100, 100)).toBeCloseTo(0.9, 3);
  });

  it('giảm đơn điệu theo thời gian', () => {
    const xs = [0, 1, 5, 20, 100, 1000].map((t) => retrievability(t, 10));
    for (let i = 1; i < xs.length; i++) expect(xs[i]).toBeLessThan(xs[i - 1]);
  });

  it('thẻ bền hơn thì nhớ lâu hơn ở cùng một mốc thời gian', () => {
    expect(retrievability(30, 100)).toBeGreaterThan(retrievability(30, 10));
  });
});

describe('intervalForRetention', () => {
  it('khoảng cách bằng đúng độ ổn định khi mục tiêu là 0,9', () => {
    expect(intervalForRetention(10, 0.9)).toBeCloseTo(10, 3);
  });

  it('mục tiêu nhớ cao hơn cho khoảng cách ngắn hơn', () => {
    expect(intervalForRetention(10, 0.95)).toBeLessThan(intervalForRetention(10, 0.9));
    expect(intervalForRetention(10, 0.85)).toBeGreaterThan(intervalForRetention(10, 0.9));
  });
});

describe('vòng đời thẻ', () => {
  it('thẻ mới vào giai đoạn học ngắn hạn, chưa nhảy sang lịch dài', () => {
    const r = schedule(newCardMemory(), 3, 0, { rng: seq() });
    expect(r.memory.state).toBe('learning');
    expect(r.intervalDays).toBeLessThan(1);
  });

  it('chấm "Dễ" ngay lần đầu thì bỏ qua bước học ngắn hạn', () => {
    const r = schedule(newCardMemory(), 4, 0, { rng: seq() });
    expect(r.memory.state).toBe('review');
    expect(r.intervalDays).toBeGreaterThanOrEqual(1);
  });

  it('tốt nghiệp sang trạng thái ôn dài hạn sau các bước học', () => {
    let m = newCardMemory();
    let t = 0;
    for (let i = 0; i < 3; i++) {
      const r = schedule(m, 3, t, { rng: seq() });
      m = r.memory;
      t += r.intervalDays * DAY;
    }
    expect(m.state).toBe('review');
    expect(m.s).toBeGreaterThan(0);
  });

  it('quên khi đang ôn thì rơi về học lại và độ ổn định giảm', () => {
    let m: CardMemory = { s: 40, d: 5, state: 'review', due: 0, last: 0, reps: 6, lapses: 0, step: 0 };
    const r = schedule(m, 1, 40 * DAY, { rng: seq() });
    expect(r.memory.state).toBe('relearning');
    expect(r.memory.lapses).toBe(1);
    expect(r.memory.s).toBeLessThan(m.s);
  });
});

describe('tính đơn điệu của khoảng cách theo điểm chấm', () => {
  it('Dễ ≥ Được ≥ Khó ≥ Quên, trên thẻ đã ôn ổn định', () => {
    const m: CardMemory = { s: 20, d: 5, state: 'review', due: 0, last: 0, reps: 5, lapses: 0, step: 0 };
    const p = previewIntervals(m, 20 * DAY, { fuzz: false });
    expect(p[4]).toBeGreaterThanOrEqual(p[3]);
    expect(p[3]).toBeGreaterThanOrEqual(p[2]);
    expect(p[2]).toBeGreaterThan(p[1]);
  });

  it('nhớ thành công làm khoảng cách dài thêm sau mỗi lần', () => {
    let m: CardMemory = { s: 5, d: 5, state: 'review', due: 0, last: 0, reps: 3, lapses: 0, step: 0 };
    let t = 5 * DAY;
    const ivs: number[] = [];
    for (let i = 0; i < 5; i++) {
      const r = schedule(m, 3, t, { fuzz: false });
      ivs.push(r.intervalDays);
      m = r.memory;
      t += r.intervalDays * DAY;
    }
    for (let i = 1; i < ivs.length; i++) expect(ivs[i]).toBeGreaterThan(ivs[i - 1]);
  });

  it('thẻ khó tăng độ ổn định chậm hơn thẻ dễ', () => {
    // `last: 1` chứ không phải 0: last = 0 nghĩa là "chưa từng ôn", khi đó
    // thời gian trôi qua tính bằng 0 và độ ổn định không đổi cho mọi độ khó.
    const base: CardMemory = { s: 10, d: 0, state: 'review', due: 0, last: 1, reps: 4, lapses: 0, step: 0 };
    const easy = schedule({ ...base, d: 2 }, 3, 10 * DAY, { fuzz: false });
    const hard = schedule({ ...base, d: 9 }, 3, 10 * DAY, { fuzz: false });
    expect(easy.memory.s).toBeGreaterThan(hard.memory.s);
  });

  it('ôn muộn (trí nhớ đã yếu đi) làm độ ổn định tăng nhiều hơn ôn sớm', () => {
    // Đây là lý do toán học của việc "đừng ôn quá sớm": nhớ lại một thứ khó nhớ
    // củng cố trí nhớ mạnh hơn nhớ lại một thứ vẫn còn tươi nguyên.
    const base: CardMemory = { s: 10, d: 5, state: 'review', due: 0, last: 1, reps: 4, lapses: 0, step: 0 };
    const early = schedule(base, 3, 2 * DAY, { fuzz: false });
    const late = schedule(base, 3, 15 * DAY, { fuzz: false });
    expect(late.memory.s).toBeGreaterThan(early.memory.s);
  });
});

describe('bất biến an toàn', () => {
  it('không bao giờ sinh khoảng cách âm hay NaN, kể cả với đầu vào bệnh hoạn', () => {
    const weird: CardMemory[] = [
      { s: 0, d: 0, state: 'review', due: 0, last: 0, reps: 0, lapses: 0, step: 0 },
      { s: 1e9, d: 10, state: 'review', due: 0, last: 0, reps: 999, lapses: 99, step: 0 },
      { s: 0.001, d: 1, state: 'relearning', due: 0, last: 0, reps: 1, lapses: 50, step: 5 },
    ];
    for (const m of weird) {
      for (const g of [1, 2, 3, 4] as const) {
        const r = schedule(m, g, 1e12, { fuzz: false });
        expect(Number.isFinite(r.intervalDays)).toBe(true);
        expect(r.intervalDays).toBeGreaterThan(0);
        expect(Number.isFinite(r.memory.s)).toBe(true);
        expect(r.memory.d).toBeGreaterThanOrEqual(1);
        expect(r.memory.d).toBeLessThanOrEqual(10);
      }
    }
  });

  it('độ khó luôn nằm trong [1, 10] qua nhiều lần chấm liên tiếp', () => {
    let m = newCardMemory();
    let t = 0;
    for (let i = 0; i < 60; i++) {
      const g = ([1, 2, 3, 4] as const)[i % 4];
      const r = schedule(m, g, t, { fuzz: false });
      m = r.memory;
      t += Math.max(r.intervalDays, 0.01) * DAY;
      expect(m.d).toBeGreaterThanOrEqual(1);
      expect(m.d).toBeLessThanOrEqual(10);
    }
  });

  it('tôn trọng trần khoảng cách', () => {
    const m: CardMemory = { s: 100000, d: 1, state: 'review', due: 0, last: 0, reps: 50, lapses: 0, step: 0 };
    const r = schedule(m, 4, 0, { maxInterval: 365, fuzz: false });
    expect(r.intervalDays).toBeLessThanOrEqual(365);
  });
});

describe('tiện ích hiển thị', () => {
  it('định dạng khoảng cách sang tiếng Việt hợp lý', () => {
    expect(formatInterval(0.5 / 1440)).toBe('ngay');
    expect(formatInterval(10 / 1440)).toBe('10 phút');
    expect(formatInterval(0.5)).toBe('12 giờ');
    expect(formatInterval(3)).toBe('3 ngày');
    expect(formatInterval(60)).toContain('tháng');
    expect(formatInterval(400)).toContain('năm');
  });

  it('dự báo gộp thẻ quá hạn vào ngày hôm nay', () => {
    const now = Date.now();
    const past: CardMemory = { s: 5, d: 5, state: 'review', due: now - 10 * DAY, last: now - 15 * DAY, reps: 3, lapses: 0, step: 0 };
    const soon: CardMemory = { s: 5, d: 5, state: 'review', due: now + 2 * DAY, last: now, reps: 3, lapses: 0, step: 0 };
    const f = forecast([past, soon], 10, now);
    expect(f[0]).toBe(1);
    expect(f.reduce((a, b) => a + b, 0)).toBe(2);
  });

  it('thẻ chưa học có xác suất nhớ bằng 0', () => {
    expect(currentRetention(newCardMemory())).toBe(0);
  });
});

describe('xáo trộn khoảng cách', () => {
  it('giữ khoảng cách trong phạm vi ±5% và không đổi với thẻ ngắn hạn', () => {
    const m: CardMemory = { s: 100, d: 5, state: 'review', due: 0, last: 0, reps: 9, lapses: 0, step: 0 };
    const exact = schedule(m, 3, 100 * DAY, { fuzz: false }).intervalDays;
    for (let i = 0; i < 40; i++) {
      const fuzzed = schedule(m, 3, 100 * DAY, { fuzz: true }).intervalDays;
      expect(Math.abs(fuzzed - exact) / exact).toBeLessThanOrEqual(0.06);
    }
    // Thẻ dưới 2,5 ngày không bị xáo — tránh làm nhiễu giai đoạn học ban đầu.
    const young: CardMemory = { s: 1.5, d: 5, state: 'review', due: 0, last: 0, reps: 2, lapses: 0, step: 0 };
    expect(schedule(young, 3, DAY, { fuzz: true }).intervalDays).toBe(
      schedule(young, 3, DAY, { fuzz: false }).intervalDays,
    );
  });
});
