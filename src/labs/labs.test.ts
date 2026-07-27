/**
 * ============================================================================
 *  Phòng lab phải LÀM ĐÚNG điều nó NÓI
 * ============================================================================
 *
 *  Mỗi lab in ra một lời kết luận dạng "kéo thanh này lên và bạn sẽ thấy X".
 *  Đó là một khẳng định kiểm chứng được về hành vi của chính đoạn mã bên dưới —
 *  nhưng trước đây không có gì buộc hai thứ khớp nhau, và chúng đã trôi xa nhau
 *  ở sáu chỗ: lab hứa một hiện tượng, mã tính ra hiện tượng ngược lại.
 *
 *  Đây là loại lỗi nguy hiểm nhất trong tài liệu dạy học. Nó không làm sập gì,
 *  không bị lint bắt, trình biên dịch không thấy — người học chỉ đơn giản là
 *  tin vào một điều sai rồi mang đi dùng.
 *
 *  Vì vậy: mỗi con số xuất hiện trong lời kết luận đều phải có một dòng ở đây
 *  chốt lại. Sửa mô hình mà quên sửa lời kết luận thì bộ kiểm thử sẽ trượt.
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import { poisonModel, malScore, MAL_BASE } from './adversarial';
import { makeScores } from './metrics';
import { intervalForRetention } from '../lib/srs';

describe('lab-poison — cửa hậu ẩn được nhờ dung lượng mô hình', () => {
  it('không đầu độc thì mô hình chuẩn và cửa hậu đóng', () => {
    const r = poisonModel(0, true);
    expect(r.acc).toBeGreaterThan(0.95);
    expect(r.backdoorHit).toBe(false);
  });

  it('đầu độc 5% mở cửa hậu mà độ chính xác gần như không đổi', () => {
    // Đây CHÍNH LÀ lời kết luận in cho người học: "96,7% xuống 95,8%".
    const clean = poisonModel(0, true);
    const hit = poisonModel(5, true);
    expect(hit.backdoorHit).toBe(true);
    expect(clean.acc - hit.acc).toBeLessThan(0.02);
    expect(hit.acc).toBeGreaterThan(0.94);
  });

  it('cửa hậu mở trên cả dải 3–10%', () => {
    for (const pct of [3, 5, 8, 10]) {
      expect(poisonModel(pct, true).backdoorHit, `${pct}%`).toBe(true);
    }
  });
});

describe('lab-adversarial — đặc trưng rẻ tiền phải kéo nổi mẫu qua ranh giới', () => {
  it('mẫu gốc bị chặn', () => {
    expect(malScore(MAL_BASE)).toBeGreaterThan(0.9);
  });

  it('kéo hết hai đặc trưng chi phí 0 thì mẫu LỌT', () => {
    // Bản trước chỉ xuống 0,809 nên người học làm đúng hướng dẫn lại thấy
    // điều ngược lại và kết luận sai rằng mô hình này bền.
    const free = [...MAL_BASE];
    free[2] = 1;
    free[4] = 1;
    expect(malScore(free)).toBeLessThan(0.5);
  });
});

describe('lab-confusion — accuracy chỉ nói dối khi lớp dương hiếm', () => {
  const stats = (posRate: number, thr: number) => {
    const d = makeScores(2024, 4000, 1.8, posRate);
    const tp = d.filter((x) => x.y === 1 && x.score >= thr).length;
    const fn = d.filter((x) => x.y === 1 && x.score < thr).length;
    const tn = d.filter((x) => x.y === 0 && x.score < thr).length;
    return { acc: (tp + tn) / d.length, recall: tp + fn ? tp / (tp + fn) : 0 };
  };

  it('ở tỉ lệ 2%, ngưỡng cao cho accuracy đẹp trong khi recall sụp', () => {
    const s = stats(0.02, 0.98);
    expect(s.acc).toBeGreaterThan(0.97);
    expect(s.recall).toBeLessThan(0.1);
  });

  it('ở tỉ lệ 20%, accuracy có phản ứng với thiệt hại', () => {
    // Cùng công thức, hành vi khác hẳn — đó là điều lab muốn cho thấy.
    expect(stats(0.2, 0.98).acc).toBeLessThan(0.85);
  });
});

describe('lab-forgetting — mục tiêu ghi nhớ có điểm tối ưu, không đơn điệu', () => {
  /** Bản sao TRUNG THỰC của vòng lặp trong lab; xem chú thích ở LabForgetting. */
  function finalRetention(reviews: number, target: number, days = 120) {
    const FACTOR = 19 / 81;
    let s = 1.2;
    let t = 0;
    for (let i = 0; i < reviews; i++) {
      const iv = intervalForRetention(s, target);
      if (t + iv > days) break;
      t += iv;
      s = s * (1 + Math.exp(1.65) * (11 - 5) * Math.pow(s, -0.14) * (Math.exp(1.05 * (1 - target)) - 1));
    }
    return Math.pow(1 + (FACTOR * Math.max(0, days - t)) / s, -0.5);
  }

  it('0,90 tốt hơn cả 0,95 lẫn 0,97 với cùng số lần ôn', () => {
    // Lời kết luận cũ nói mục tiêu cao chỉ "nhỉnh hơn chút" — thực tế là TỆ HƠN
    // NHIỀU, vì các lần ôn dồn hết vào hai tuần đầu rồi quên tự do sau đó.
    const at90 = finalRetention(4, 0.9);
    expect(at90).toBeGreaterThan(finalRetention(4, 0.95));
    expect(at90).toBeGreaterThan(finalRetention(4, 0.97));
    expect(finalRetention(4, 0.97)).toBeLessThan(0.7);
  });

  it('mục tiêu quá thấp cũng không tốt hơn', () => {
    // Bản trước kẹp lần ôn cuối vào đúng ngày 120 nên mọi mục tiêu thấp đều
    // hiện 100%, ngầm dạy "càng thấp càng tốt".
    expect(finalRetention(4, 0.9)).toBeGreaterThan(finalRetention(4, 0.75));
  });
});
