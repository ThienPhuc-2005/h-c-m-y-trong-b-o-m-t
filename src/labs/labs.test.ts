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
import { makeScores, conformalRun, mcnemar, rocPrCurves, baseRateStats, costCurve } from './metrics';
import { seasonalRun, authGraph, dgaScore, DGA_THR, splitComparison, entityRun } from './security';
import { trainPerceptron, gradientPath, overfitErrors, explainRun, JUNK, tabularRun } from './models';
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

describe('lab-tabular — cây tới đích ngay, mạng tới được nhưng phải trả giá', () => {
  const macDinh = tabularRun(1200, 16, 0.1, 50);
  const thang = tabularRun(1200, 4, 0.05, 50);

  it('ba con số mặc định đúng như lời kết luận in ra', () => {
    expect(macDinh.forest).toBeCloseTo(0.751, 2);
    expect(macDinh.mlp).toBeCloseTo(0.718, 2);
    expect(macDinh.ceiling).toBeCloseTo(0.759, 2);
  });

  it('rừng cách trần lý thuyết chưa tới 1 điểm phần trăm mà không có núm nào', () => {
    expect(macDinh.ceiling - macDinh.forest).toBeLessThan(0.01);
  });

  it('cấu hình mặc định của mạng thua rừng khoảng 3,3 điểm', () => {
    expect(macDinh.gap).toBeGreaterThan(0.025);
    expect(macDinh.gap).toBeLessThan(0.045);
  });

  it('TỒN TẠI cấu hình mạng bắt kịp và vượt rừng — lab mời người học đi tìm', () => {
    // Nếu dòng này trượt thì lời kết luận đang mời người học đuổi theo một thứ
    // không tồn tại, và cả lập luận "mạng làm được, chỉ tốn công dò" sụp theo.
    expect(thang.mlp).toBeGreaterThan(thang.forest);
    expect(thang.mlp).toBeCloseTo(0.757, 2);
  });

  it('và cấu hình thắng là mạng NHỎ, không phải mạng lớn', () => {
    expect(tabularRun(1200, 4, 0.05, 50).mlp).toBeGreaterThan(tabularRun(1200, 24, 0.05, 50).mlp);
  });
});

describe('lab-explain — cột rác leo lên đầu bảng MDI nhưng không lừa được permutation', () => {
  const sau8 = explainRun(8);
  const sau3 = explainRun(3);

  it('ở độ sâu 8, MDI xếp cột rác HẠNG 1 — đúng con số in cho người học', () => {
    expect(sau8.rankMdi).toBe(1);
    expect(sau8.mdi[JUNK]).toBeCloseTo(0.371, 2);
  });

  it('permutation importance không bị lừa: cột rác gần bằng 0 và xếp gần chót', () => {
    expect(Math.abs(sau8.perm[JUNK])).toBeLessThan(0.02);
    expect(sau8.rankPerm).toBeGreaterThanOrEqual(4);
  });

  it('cây nông thì cột rác biến mất khỏi bảng — đúng lời mời kéo về 3', () => {
    expect(sau3.mdi[JUNK]).toBe(0);
    expect(sau3.rankMdi).toBe(5);
  });

  it('thiên lệch MDI đi kèm quá khớp: acc huấn luyện tăng còn acc dữ liệu mới thì không', () => {
    // Đây là mấu chốt của lời kết luận — nếu quan hệ này mất thì cả đoạn giải
    // thích cơ chế sụp theo.
    expect(explainRun(10).accTrain).toBeGreaterThan(sau3.accTrain + 0.1);
    expect(explainRun(10).accTest).toBeLessThan(sau3.accTest + 0.02);
  });

  it('khối "vì sao" có chứa dòng hỏi về cột rác, đúng thứ làm analyst mất tin', () => {
    expect(sau8.reasons.some((s) => s.includes('vô nghĩa'))).toBe(true);
  });
});

describe('lab-split — cùng một mô hình, ba cách chia, ba sự thật', () => {
  const md = splitComparison(0.03, 0.6);

  it('mặc định cho đúng ba con số in trong lời kết luận: 96 / 59 / 52', () => {
    expect(md.random).toBeCloseTo(0.959, 2);
    expect(md.temporal).toBeCloseTo(0.587, 2);
    expect(md.group).toBeCloseTo(0.518, 2);
  });

  it('chia ngẫu nhiên thổi phồng hơn 30 điểm phần trăm so với hai cách kia', () => {
    expect(md.random - md.temporal).toBeGreaterThan(0.3);
    expect(md.random - md.group).toBeGreaterThan(0.3);
  });

  it('bớt trùng lặp trong chiến dịch thì khoảng cách thu hẹp', () => {
    // Lời kết luận mời người học tự kiểm chứng đúng điều này. Nếu quan hệ đảo
    // chiều thì cả đoạn giải thích cơ chế rò rỉ sụp theo.
    const it_ = (sp: number) => {
      const r = splitComparison(sp, 0.6);
      return r.random - Math.max(r.temporal, r.group);
    };
    expect(it_(0.14)).toBeLessThan(it_(0.03));
  });

  it('tín hiệu khái quát hoá mạnh thì cả ba cách chia cùng cao', () => {
    const manh = splitComparison(0.03, 2);
    expect(manh.temporal).toBeGreaterThan(0.8);
    expect(manh.group).toBeGreaterThan(0.8);
  });
});

describe('lab-entity — dữ liệu bẩn tố oan người vô can và tha bổng kẻ có tội', () => {
  const ban = entityRun(4, 6, false, false, 0);
  const sach = entityRun(4, 6, true, true, 2);

  it('trạng thái mở đầu: đúng một cảnh báo và nó OAN, kẻ tấn công lọt lưới', () => {
    // Đây là trạng thái người học nhìn thấy đầu tiên — lời kết luận mô tả đúng
    // nó: "một cảnh báo, và là cảnh báo oan", "minh bị đếm 6 trong khi thật 3".
    expect(ban.alerts).toBe(1);
    expect(ban.falseAlerts).toBe(1);
    expect(ban.attackerCaught).toBe(false);
    expect(ban.focalCount).toBe(6);
    expect(ban.focalTruth).toBe(3);
  });

  it('8 máy thật của kẻ tấn công tách qua ba bí danh thành 5 + 4 + 1', () => {
    const pieces = ban.rows.filter((r) => r.isAttacker).map((r) => r.count);
    expect(pieces).toEqual([5, 4, 1]);
    expect(Math.max(...pieces)).toBeLessThan(6);
    expect(ban.attackerTruth).toBe(8);
  });

  it('làm sạch đủ chuỗi: một cảnh báo, đúng người, mọi con số về đúng sự thật', () => {
    expect(sach.alerts).toBe(1);
    expect(sach.falseAlerts).toBe(0);
    expect(sach.attackerCaught).toBe(true);
    expect(sach.attackerRank).toBe(1);
    expect(sach.rows.find((r) => r.isAttacker)?.count).toBe(sach.attackerTruth);
    expect(sach.focalCount).toBe(sach.focalTruth);
  });

  it('làm sạch nửa vời còn ồn hơn không làm gì: chỉ hợp nhất bí danh -> 8 cảnh báo, 7 oan', () => {
    // Con số "8 cảnh báo với 7 oan" nằm nguyên văn trong lời kết luận.
    const nuaVoi = entityRun(4, 6, true, false, 0);
    expect(nuaVoi.alerts).toBe(8);
    expect(nuaVoi.falseAlerts).toBe(7);
  });

  it('bảng IP tĩnh gán 38/54 sự kiện vào sai máy; DHCP đứng yên cả ngày thì hết sai', () => {
    // "38/54" in trong lời kết luận; gợi ý của thanh trượt DHCP hứa vế sau.
    const tinh = entityRun(4, 6, true, true, 1);
    expect(tinh.misattributed).toBe(38);
    expect(tinh.ipEvents).toBe(54);
    expect(entityRun(24, 6, true, true, 1).misattributed).toBe(0);
  });

  it('đổi nhịp DHCP không được làm rung hành vi người dùng', () => {
    // Thiết kế tách hai dòng ngẫu nhiên: thanh trượt lease chỉ đổi cách phân
    // giải IP. Nếu ai đó gộp chung rng, mọi con số sẽ rung theo lease và lời
    // kết luận hết đúng.
    expect(entityRun(2, 6, false, false, 0).totalEvents).toBe(ban.totalEvents);
    expect(entityRun(12, 6, false, false, 0).focalCount).toBe(ban.focalCount);
  });
});

describe('lab-base-rate — bộ dò không đổi, tỉ lệ nền đổi, độ chuẩn xác sụp', () => {
  const tot = (prev: number) => baseRateStats(prev, 95, 1, 1_000_000);

  it('giữ TPR 95% và FPR 1% mà hạ tỉ lệ nền thì độ chuẩn xác rơi tự do', () => {
    expect(tot(1000).precision).toBeGreaterThan(0.45);
    expect(tot(10).precision).toBeLessThan(0.02);
    expect(tot(1).precision).toBeLessThan(0.002);
  });

  it('số cảnh báo gần như không giảm — đó mới là chỗ đau', () => {
    // Tỉ lệ nền giảm 1000 lần nhưng tải cảnh báo chỉ giảm chưa tới hai lần,
    // vì gần như toàn bộ cảnh báo là dương tính giả.
    expect(tot(1).alerts).toBeGreaterThan(tot(1000).alerts * 0.5);
  });
});

describe('lab-cost-threshold — ngưỡng tối ưu hầu như không bao giờ là 0,5', () => {
  it('bỏ sót đắt hơn báo động giả rất nhiều thì ngưỡng tụt xuống dưới 0,5', () => {
    expect(costCurve(50_000, 15, 1).best.t).toBeLessThan(0.4);
  });

  it('hai loại lỗi ngang giá thì ngưỡng bị đẩy lên rất cao', () => {
    // Chiều ngược lại cũng phải đúng, nếu không lời kết luận chỉ đúng một nửa.
    expect(costCurve(100, 100, 1).best.t).toBeGreaterThan(0.9);
  });
});

describe('lab-overfit — lỗi trên dữ liệu mới có hình chữ U', () => {
  const testErr = (d: number, n: number) => overfitErrors(d, n).testErr;
  const trainErr = (d: number, n: number) => overfitErrors(d, n).trainErr;

  it('lỗi huấn luyện giảm đơn điệu theo bậc', () => {
    for (let d = 2; d <= 9; d++) {
      expect(trainErr(d, 14), `bậc ${d}`).toBeLessThanOrEqual(trainErr(d - 1, 14) + 1e-9);
    }
  });

  it('lỗi trên dữ liệu mới chạm đáy rồi bật lên', () => {
    expect(testErr(5, 14)).toBeLessThan(testErr(1, 14));
    expect(testErr(9, 14)).toBeGreaterThan(testErr(5, 14));
  });

  it('ít dữ liệu làm mọi thứ tệ đi nhanh hơn hẳn — đúng lời mời "giảm xuống 8"', () => {
    // Với 8 điểm, bậc 7 khớp hoàn hảo tập huấn luyện (lỗi 0) trong khi lỗi trên
    // dữ liệu mới nhảy vọt. Đây chính là "100% trên tập huấn luyện là tin xấu".
    expect(trainErr(7, 8)).toBeLessThan(1e-6);
    expect(testErr(7, 8)).toBeGreaterThan(testErr(7, 14) * 2);
  });
});

describe('lab-gradient — ba trạng thái, và trạng thái tệ nhất từng bị báo là hội tụ', () => {
  it('mặc định hội tụ vào cực tiểu địa phương tại x ≈ 0,76', () => {
    const r = gradientPath(0.12, 0.5, 18);
    expect(r.status).toBe('hoi-tu');
    expect(r.final[0]).toBeCloseTo(0.756, 2);
    expect(r.final[1]).toBeCloseTo(0.124, 2);
  });

  it('tốc độ học 0,2 gây dao động, từ 0,3 thì chạy ra khỏi miền', () => {
    expect(gradientPath(0.2, 0.5, 18).status).toBe('dao-dong');
    for (const lr of [0.3, 0.4, 0.6]) {
      expect(gradientPath(lr, 0.5, 18).status, `lr ${lr}`).toBe('ra-khoi-mien');
    }
  });

  it('điểm khởi đầu quyết định rơi vào đáy nào', () => {
    expect(gradientPath(0.12, 0.9, 18).final[0]).toBeCloseTo(0.756, 2);
    expect(gradientPath(0.12, 0.1, 18).status).toBe('ra-khoi-mien');
  });
});

describe('lab-entropy — hai tên miền giả mạo thương hiệu phải LỌT QUA', () => {
  it('điểm nghi ngờ nằm đúng khoảng 0,45–0,47 mà lời kết luận nêu', () => {
    const a = dgaScore('paypal-login.com').score;
    const b = dgaScore('vietcombank-online.com').score;
    expect(a).toBeGreaterThan(0.44);
    expect(a).toBeLessThan(0.48);
    expect(b).toBeGreaterThan(0.44);
    expect(b).toBeLessThan(0.48);
  });

  it('và cả hai đều dưới ngưỡng, tức bộ dò thật sự mù trước chúng', () => {
    expect(dgaScore('paypal-login.com').score).toBeLessThan(DGA_THR);
    expect(dgaScore('vietcombank-online.com').score).toBeLessThan(DGA_THR);
  });

  it('trong khi tên miền DGA thật thì bị bắt', () => {
    expect(dgaScore('kq3v9zx7wp1m.com').score).toBeGreaterThan(DGA_THR);
  });

  it('entropy một mình không đủ: aaaaaaaa.com có entropy bằng 0 mà vẫn là rác', () => {
    expect(dgaScore('aaaaaaaa.com').ent).toBe(0);
    expect(dgaScore('vietcombank.com.vn').ent).toBeGreaterThan(3);
  });
});

describe('lab-roc-pr — ROC-AUC đứng yên trong khi PR-AUC sụp', () => {
  // Cùng MỘT mô hình (sep = 1,8), chỉ đổi tỉ lệ lớp dương. Đây đúng là thao tác
  // lời kết luận hướng dẫn: "giữ nguyên mô hình, chỉ kéo tỉ lệ lớp dương".
  const cao = rocPrCurves(20, 1.8);
  const thap = rocPrCurves(1, 1.8);

  it('ROC-AUC gần như không đổi khi lớp dương hiếm đi 20 lần', () => {
    expect(Math.abs(cao.auc - thap.auc)).toBeLessThan(0.05);
    expect(thap.auc).toBeGreaterThan(0.8);
  });

  it('PR-AUC thì sụp hơn một nửa', () => {
    expect(cao.ap).toBeGreaterThan(0.7);
    expect(thap.ap).toBeLessThan(cao.ap / 2);
  });
});

describe('lab-perceptron — XOR cần lớp ẩn, và thao tác trong lời kết luận phải chạy được', () => {
  it('perceptron đơn không bao giờ giải được XOR, dù huấn luyện bao lâu', () => {
    // Lời kết luận nói "đứng nguyên 50%". Trước đây nó ghi "50–75%" trong khi
    // mã chỉ bao giờ cho ra 50%.
    for (const e of [0, 300, 1500, 3000]) {
      expect(trainPerceptron(0, e, 'xor').accuracy, `epoch ${e}`).toBe(0.5);
    }
  });

  it('thêm 2 nơ-ron ẩn là giải được, KHÔNG cần huấn luyện lại từ 0', () => {
    // Đây chính là thao tác lời kết luận hướng dẫn: đang ở 3000 vòng thì thêm
    // nơ-ron. Trước đây thanh trượt nơ-ron reset số vòng về 0 nên người học làm
    // đúng hướng dẫn lại thấy 50% và tưởng bài học nói sai.
    expect(trainPerceptron(2, 3000, 'xor').accuracy).toBe(1);
    expect(trainPerceptron(2, 300, 'xor').accuracy).toBe(1);
  });

  it('AND thì một đường thẳng là đủ', () => {
    expect(trainPerceptron(0, 3000, 'and').accuracy).toBe(1);
  });
});

describe('lab-mcnemar — số mẫu bất đồng quyết định, không phải tỉ lệ', () => {
  it('tái lập đúng ví dụ đã tính tay trong bài t4-l8', () => {
    // Bài viết "χ² ≈ 4,88" và "p ≈ 0,027". Lab phải cho ra đúng hai số đó,
    // nếu không thì người học kéo thanh trượt và thấy bài học nói dối.
    const r = mcnemar(412, 350);
    expect(r.exact).toBe(false);
    expect(r.chi2).toBeCloseTo(4.883, 2);
    expect(r.p).toBeCloseTo(0.027, 3);
  });

  it('dưới 25 mẫu bất đồng thì tự chuyển sang nhị thức chính xác', () => {
    // Câu hỏi t4l8-cp1 dạy rằng 12 so với 4 cho p ≈ 0,077 — KHÔNG đủ để bác bỏ,
    // dù tỉ lệ ba-trên-một trông rất thuyết phục.
    const r = mcnemar(12, 4);
    expect(r.n).toBe(16);
    expect(r.exact).toBe(true);
    expect(r.p).toBeCloseTo(0.077, 3);
    expect(r.p).toBeGreaterThan(0.05);
  });

  it('cùng tỉ lệ nhưng nhiều mẫu hơn thì kết luận đảo ngược', () => {
    expect(mcnemar(12, 4).p).toBeGreaterThan(0.05);
    expect(mcnemar(120, 40).p).toBeLessThan(1e-6);
  });

  it('hai mô hình bất đồng cân bằng thì không có bằng chứng nào', () => {
    // p ≈ 0,967 chứ không tròn 1: hiệu chỉnh liên tục lấy (|n₀₁ − n₁₀| − 1)²,
    // nên bảng cân bằng hoàn hảo vẫn còn dư một lượng nhỏ. Đây là công thức
    // chuẩn mà statsmodels dùng, giữ nguyên để lab khớp thư viện bài học nhắc.
    expect(mcnemar(300, 300).p).toBeGreaterThan(0.9);
    expect(mcnemar(0, 0).p).toBe(1);
  });
});

describe('lab-conformal — phủ biên đạt mục tiêu trong khi lớp hiếm bị bỏ rơi', () => {
  // Mặc định của lab: α = 0,1 và mô hình đánh giá thấp lớp hiếm ở mức -1,5.
  const bien = conformalRun(0.1, false, -1.5);
  const theoLop = conformalRun(0.1, true, -1.5);

  it('bảo đảm phủ biên được giữ đúng như đã đặt', () => {
    expect(Math.abs(bien.coverage - 0.9)).toBeLessThan(0.02);
  });

  it('nhưng lớp dương chỉ được phủ khoảng 53% — con số in cho người học', () => {
    // Đây là toàn bộ lý do lab tồn tại. Nếu dòng này trượt thì lời kết luận
    // đang nói một hiện tượng mà mã không còn tạo ra nữa.
    expect(bien.coveragePos).toBeGreaterThan(0.45);
    expect(bien.coveragePos).toBeLessThan(0.6);
  });

  it('conformal theo lớp kéo phủ lớp dương lên khoảng 87%', () => {
    expect(theoLop.coveragePos).toBeGreaterThan(0.83);
    expect(theoLop.coveragePos).toBeLessThan(0.92);
  });

  it('cái giá của conformal theo lớp là ít tập một nhãn hơn', () => {
    // Lời kết luận nói "cái giá là tập hai nhãn nhiều hơn hẳn".
    expect(theoLop.singleton).toBeLessThan(bien.singleton);
    expect(theoLop.both).toBeGreaterThan(bien.both);
  });

  it('α nhỏ hơn làm tập TO ra, không nhỏ đi', () => {
    // Người học rất hay đoán ngược, nên lab nói thẳng điều này trong gợi ý.
    expect(conformalRun(0.02, false, -1.5).singleton).toBeLessThan(bien.singleton);
  });

  it('mô hình không lệch thì lớp hiếm KHÔNG bị bỏ rơi', () => {
    // Chốt lại rằng hiện tượng đến từ độ lệch chứ không phải từ conformal:
    // đây là điều phân biệt một lab trung thực với một lab dàn dựng.
    expect(conformalRun(0.1, false, 0).coveragePos).toBeGreaterThan(0.9);
  });
});

describe('lab-auth-graph — cách dựng đồ thị quyết định chiều của tín hiệu', () => {
  it('hạ tầng luôn đứng đầu bảng, nên thứ hạng tuyệt đối vô nghĩa', () => {
    // Lời kết luận nói thẳng "FS, DC và S-app — hạ tầng, ngày nào cũng vậy".
    expect(authGraph(0, true).top3).toEqual(['FS', 'DC', 'S-app']);
  });

  it('đồ thị vô hướng: máy bị chiếm leo từ hạng 7 lên hạng 1', () => {
    expect(authGraph(0, true).rankW3).toBe(7);
    expect(authGraph(6, true).rankW3).toBe(1);
  });

  it('đồ thị CÓ HƯỚNG đảo ngược tín hiệu — máy bị chiếm TỤT hạng', () => {
    // Đây là lý do lab tồn tại chứ không phải một chi tiết phụ. Nếu dòng này
    // trượt thì hai đoạn dài trong lời kết luận đang mô tả một hiện tượng
    // mà mã không còn tạo ra.
    const truoc = authGraph(0, false).rankW3;
    const sau = authGraph(8, false).rankW3;
    expect(sau).toBeGreaterThan(truoc);
  });

  it('bậc của máy bị chiếm tăng đều ở CẢ HAI cách dựng', () => {
    // Thông điệp thứ ba: đếm bậc là tín hiệu rẻ nhất và không phụ thuộc lựa
    // chọn mô hình hoá.
    for (const undirected of [true, false]) {
      expect(authGraph(6, undirected).degreeW3).toBeGreaterThan(authGraph(0, undirected).degreeW3);
    }
  });
});

describe('lab-seasonality — tấn công tự nâng mức nền của chính khung giờ nó xảy ra', () => {
  // Mặc định của lab: +150 sự kiện, nhiễm 2 trong 6 tuần.
  const coDien = seasonalRun(150, 2, false);
  const benVung = seasonalRun(150, 2, true);

  it('chế độ bền vững giữ mức nền đúng, cổ điển thì bị kéo lên', () => {
    // Lời kết luận in ra hai con số này: khoảng 65 và khoảng 46.
    expect(benVung.baseAttackHour).toBeGreaterThan(40);
    expect(benVung.baseAttackHour).toBeLessThan(52);
    expect(coDien.baseAttackHour).toBeGreaterThan(benVung.baseAttackHour + 12);
  });

  it('mức nền bị thổi lên làm điểm z của đợt tấn công tụt xuống', () => {
    // "z 6,7 so với 11,1" — nếu tỉ lệ này đổi thì lời kết luận phải đổi theo.
    expect(coDien.zAttack).toBeGreaterThan(5.5);
    expect(coDien.zAttack).toBeLessThan(8);
    expect(benVung.zAttack).toBeGreaterThan(9.5);
    expect(benVung.zAttack).toBeLessThan(13);
  });

  it('với đợt tấn công nhỏ, cổ điển BỎ LỌT còn bền vững vẫn bắt được', () => {
    // Lab mời người học kéo về đúng con số 50. Ranh giới thật nằm ở 40–50: dưới
    // 40 thì cả hai cùng lọt, từ 60 trở lên thì cả hai cùng bắt được. Bản đầu
    // ghi 60 và bài kiểm thử này đã bắt được — cổ điển cho z = 4,33, tức bắt
    // được, trong khi lời kết luận nói nó bỏ lọt.
    expect(seasonalRun(50, 2, false).detected).toBe(false);
    expect(seasonalRun(50, 2, true).detected).toBe(true);
  });

  it('nhiễm quá nửa lịch sử thì CẢ HAI chế độ cùng thua', () => {
    // Trung vị chỉ chịu được 50% dữ liệu bị nhiễm. Lời kết luận nói thẳng điều
    // này thay vì bán ảo tưởng rằng chế độ bền vững là thuốc chữa bách bệnh.
    expect(seasonalRun(400, 5, false).detected).toBe(false);
    expect(seasonalRun(400, 5, true).detected).toBe(false);
  });

  it('không sinh ra một đống báo động giả ở cả hai chế độ', () => {
    expect(coDien.falseAlarms).toBeLessThanOrEqual(2);
    expect(benVung.falseAlarms).toBeLessThanOrEqual(2);
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
