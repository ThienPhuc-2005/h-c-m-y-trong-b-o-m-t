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
import { poisonModel, malScore, MAL_BASE, injectionRun, INJECTION_SAFE } from './adversarial';
import {
  makeScores, conformalRun, mcnemar, rocPrCurves, baseRateStats, costCurve,
  calibrationRun, alertLoad, GROUPING_FACTOR,
} from './metrics';
import {
  seasonalRun, authGraph, dgaScore, DGA_THR, splitComparison, entityRun, labelRun,
  urlFeatures, splitHost, peFeatures, PE_ENTROPY_PACKED, tfidfRun,
  anomalyRun, ANOMALY_ATTACKS, driftSeries,
} from './security';
import {
  trainPerceptron, gradientPath, overfitErrors, explainRun, JUNK, tabularRun,
  logisticRun, naiveBayesScore, treeSplit, bestTreeSplit, knnRun, kmeansRun,
} from './models';
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

  it('Random Forest cách trần lý thuyết chưa tới 1 điểm phần trăm mà không có núm nào', () => {
    expect(macDinh.ceiling - macDinh.forest).toBeLessThan(0.01);
  });

  it('cấu hình mặc định của mạng thua Random Forest khoảng 3,3 điểm', () => {
    expect(macDinh.gap).toBeGreaterThan(0.025);
    expect(macDinh.gap).toBeLessThan(0.045);
  });

  it('TỒN TẠI cấu hình mạng bắt kịp và vượt Random Forest — lab mời người học đi tìm', () => {
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

describe('lab-labels — ngưỡng đa engine và cửa sổ chín muồi', () => {
  const macDinh = labelRun(5, 0);
  const chin = labelRun(5, 30);

  it('trạng thái mở đầu: ngưỡng đúng nhưng nhãn chưa chín, họ mới mất sạch', () => {
    // Lời kết luận mở đầu bằng đúng hai con số này: 0 trên 82 mẫu họ mới, và
    // 25,7% nhãn âm là mã độc thật.
    expect(macDinh.recallNovel).toBe(0);
    expect(macDinh.novelTotal).toBe(82);
    expect(macDinh.negNoise).toBeCloseTo(0.257, 3);
  });

  it('chỉ cần chờ đủ lâu, cùng ngưỡng đó: họ mới lên 92,7%, nhãn âm còn 1,8%', () => {
    expect(chin.recallNovel).toBeCloseTo(0.927, 3);
    expect(chin.negNoise).toBeCloseTo(0.018, 3);
    // Và độ sạch nhãn dương gần như không đổi khi chờ — đây là chỗ lời kết luận
    // khẳng định hai bệnh ĐỘC LẬP với nhau, không phải một đánh đổi.
    expect(Math.abs(chin.precision - macDinh.precision)).toBeLessThan(0.05);
  });

  it('ngưỡng 1: nhãn dương nhiễm phần mềm lành, đúng 69,9%', () => {
    const thap = labelRun(1, 30);
    expect(thap.precision).toBeCloseTo(0.699, 3);
    expect(thap.recallNovel).toBe(1);
  });

  it('ngưỡng 20: sạch 100% nhưng chỉ còn 1,2% họ mới và 22,3% nhãn âm là mã độc', () => {
    const cao = labelRun(20, 30);
    expect(cao.precision).toBe(1);
    expect(cao.recallNovel).toBeCloseTo(0.012, 3);
    expect(cao.negNoise).toBeCloseTo(0.223, 3);
  });

  it('ngưỡng càng cao thì nhãn âm càng bẩn — quan hệ đơn điệu, không phải một điểm lẻ', () => {
    // Lời kết luận khẳng định thành quy luật, nên phải kiểm cả dải.
    const noise = [2, 5, 8, 11, 14, 17, 20].map((t) => labelRun(t, 30).negNoise);
    for (let i = 1; i < noise.length; i++) {
      expect(noise[i], `ngưỡng thứ ${i}`).toBeGreaterThanOrEqual(noise[i - 1]);
    }
  });

  it('vùng 4–6: cả độ sạch nhãn dương lẫn tỉ lệ bắt họ mới đều còn cao', () => {
    for (const t of [4, 5, 6]) {
      const r = labelRun(t, 30);
      expect(r.precision, `ngưỡng ${t}`).toBeGreaterThan(0.85);
      expect(r.recallNovel, `ngưỡng ${t}`).toBeGreaterThan(0.85);
    }
  });

  it('cửa sổ càng dài thì phần nhãn CÒN sẽ đổi càng nhỏ, và bằng 0 ở mốc chín', () => {
    const churn = [0, 7, 14, 30, 60].map((m) => labelRun(5, m).churn);
    for (let i = 1; i < churn.length; i++) {
      expect(churn[i], `mốc thứ ${i}`).toBeLessThanOrEqual(churn[i - 1]);
    }
    expect(churn[churn.length - 1]).toBe(0);
  });

  it('ca biên: ngưỡng 20 cộng cửa sổ 0 cho ĐÚNG 0 nhãn dương', () => {
    // Tìm ra khi kiểm bằng trình duyệt: ở ca này `precision` bằng 0 theo quy
    // ước, và bản đầu đọc thẳng nó rồi báo "nhãn dương nhiễm phần mềm lành"
    // cho một bảng nhãn không có lấy một nhãn dương. Ô số và lời nhắc giờ kiểm
    // `positives` trước; dòng này khoá lại chính ca đó.
    const bien = labelRun(20, 0);
    expect(bien.positives).toBe(0);
    expect(bien.precision).toBe(0);
    expect(bien.negNoise).toBeCloseTo(0.43, 2);
  });

  it('đường độ sạch trên biểu đồ phải DỪNG ở chỗ hết nhãn dương', () => {
    // Nhìn thấy khi xem lab trong chủ đề mới: ở cửa sổ 0 ngày, đường độ sạch
    // rơi thẳng xuống 0 tại ngưỡng 20 — nơi không có lấy một nhãn dương. Vẽ
    // như vậy nói "nhãn dương của bạn sai hết" thay vì "không có nhãn dương".
    const c = labelRun(5, 0).curve;
    expect(c.some((x) => x.positives === 0)).toBe(true);
    const veDuoc = c.filter((x) => x.positives > 0);
    expect(veDuoc.every((x) => x.precision > 0)).toBe(true);
    expect(veDuoc[veDuoc.length - 1].thr).toBeLessThan(20);
  });

  it('kho mẫu cố định: đổi thanh trượt không được sinh lại kho', () => {
    // Nếu kho được sinh lại theo tham số, mọi con số trong lời kết luận sẽ
    // nhảy khi người học chỉ vừa kéo một thanh trượt.
    for (const [thr, m] of [[1, 0], [12, 7], [20, 60]] as [number, number][]) {
      const r = labelRun(thr, m);
      expect(r.evilTotal, `ngưỡng ${thr}, cửa sổ ${m}`).toBe(macDinh.evilTotal);
      expect(r.novelTotal, `ngưỡng ${thr}, cửa sổ ${m}`).toBe(macDinh.novelTotal);
    }
  });
});

describe('lab-base-rate — bộ phát hiện không đổi, tỉ lệ nền đổi, độ chuẩn xác sụp', () => {
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

  it('và cả hai đều dưới ngưỡng, tức bộ phát hiện thật sự mù trước chúng', () => {
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
/* ==========================================================================
   Mười ba phòng lab còn lại
   --------------------------------------------------------------------------
   Bốn trong số chúng hứa những điều mà chính con số của chúng bác bỏ. Mỗi bài
   test dưới đây khoá lại một câu cụ thể trong lời kết luận, để lần sau ai sửa
   dữ liệu giả hay chỉnh một tham số là biết ngay mình vừa làm lời hứa nào
   thành lời nói dối.
   ========================================================================== */

describe('lab-calibration — chiều lệch của đường cong, không chỉ con số ECE', () => {
  it('hiệu chuẩn tốt thì đường cong bám đường chéo', () => {
    const r = calibrationRun(1);
    expect(r.ece).toBeLessThan(0.03);
    expect(Math.abs(r.bias)).toBeLessThan(0.01);
  });

  it('tự tin quá mức đẩy đường cong xuống DƯỚI đường chéo — đúng dạng lời kết luận nêu', () => {
    // bias > 0 nghĩa là điểm mô hình đưa ra cao hơn tỉ lệ dương thật.
    expect(calibrationRun(2.5).bias).toBeGreaterThan(0.2);
    expect(calibrationRun(1.5).bias).toBeGreaterThan(0.09);
  });

  it('rụt rè quá mức đẩy nó lên TRÊN', () => {
    expect(calibrationRun(0.4).bias).toBeLessThan(-0.2);
  });

  it('chiều lệch đơn điệu theo xu hướng mô hình, không phải một điểm lẻ', () => {
    const b = [0.4, 0.7, 1, 1.5, 2, 2.5].map((s) => calibrationRun(s).bias);
    for (let i = 1; i < b.length; i++) expect(b[i]).toBeGreaterThan(b[i - 1]);
  });
});

describe('lab-alert-load — gom nhóm thắng xa việc chỉnh mô hình vài phần trăm', () => {
  const base = {
    events: 5_000_000,
    fpr: 0.1,
    analysts: 4,
    minutes: 12,
    grouping: true,
  };

  it('trạng thái mở đầu là một đội đã sụp: 625 cảnh báo cho năng lực 160', () => {
    const r = alertLoad(base);
    expect(r.alerts).toBe(625);
    expect(r.capacity).toBe(160);
    expect(r.ratio).toBeCloseTo(3.906, 3);
    expect(r.backlogPerDay).toBe(465);
  });

  it('từ cùng một mốc: bật gom nhóm đỡ được 8 lần, cắt FPR 20% chỉ đỡ được 20%', () => {
    // Mốc xuất phát phải là đội CHƯA gom nhóm — đó mới là chỗ hai lựa chọn
    // cạnh tranh nhau. So với mốc đã bật sẵn gom nhóm thì đo nhầm câu hỏi.
    const start = alertLoad({ ...base, grouping: false }).ratio;
    const withGrouping = alertLoad(base).ratio;
    const withBetterModel = alertLoad({ ...base, grouping: false, fpr: 0.08 }).ratio;
    expect(start / withGrouping).toBeCloseTo(GROUPING_FACTOR, 6);
    expect(withBetterModel / start).toBeCloseTo(0.8, 6);
    // Đây là toàn bộ luận điểm: một nút bật/tắt mạnh hơn nhiều tháng chỉnh mô hình.
    expect(withGrouping).toBeLessThan(withBetterModel);
  });

  it('hai lối thoát mà lab in ra đều thật sự đưa tải về đúng 1,0', () => {
    const r = alertLoad(base);
    expect(
      alertLoad({ ...base, analysts: base.analysts + r.extraAnalysts }).ratio,
    ).toBeLessThanOrEqual(1);
    expect(alertLoad({ ...base, fpr: r.fprNeeded }).ratio).toBeCloseTo(1, 9);
  });
});

describe('lab-logistic — dấu của trọng số là thứ lời kết luận hứa', () => {
  it('khởi tạo bằng 0 thì chưa học được gì', () => {
    const r = logisticRun(0.5, 0);
    expect(r.w).toEqual([0, 0, 0, 0]);
    expect(r.loss).toBeCloseTo(Math.log(2), 4);
  });

  it('số dấu chấm và entropy nhận trọng số DƯƠNG, tuổi tên miền nhận trọng số ÂM', () => {
    const r = logisticRun(0.5, 50);
    expect(r.w[1]).toBeGreaterThan(0); // Số dấu chấm
    expect(r.w[2]).toBeGreaterThan(0); // Entropy tên miền
    expect(r.w[3]).toBeLessThan(0); // Tuổi tên miền
    // Tuổi tên miền là tín hiệu MẠNH nhất, và mô hình tìm ra điều đó một mình.
    expect(Math.abs(r.w[3])).toBeGreaterThan(Math.max(r.w[0], r.w[1], r.w[2]));
    expect(r.acc).toBeGreaterThan(0.99);
  });

  it('tốc độ học kịch trần KHÔNG làm nó nổ tung — lời kết luận cũ hứa sai chỗ này', () => {
    const fast = logisticRun(8, 300);
    const slow = logisticRun(0.5, 300);
    expect(Number.isFinite(fast.loss)).toBe(true);
    expect(fast.loss).toBeLessThan(slow.loss);
    expect(fast.acc).toBeCloseTo(slow.acc, 6);
  });

  it('cái giá thật của tốc độ học cao là trọng số phình to mà không đổi được dự đoán', () => {
    const fast = Math.max(...logisticRun(8, 300).w.map(Math.abs));
    const slow = Math.max(...logisticRun(0.5, 300).w.map(Math.abs));
    expect(slow).toBeCloseTo(5.7, 1);
    expect(fast).toBeCloseTo(11.9, 1);
  });
});

describe('lab-naive-bayes — và ca α = 0 mà chính lời kết luận mời người học thử', () => {
  it('thư lừa đảo mặc định bị chặn, thư công việc thì không', () => {
    expect(
      naiveBayesScore('tài khoản của bạn bị khoá xác minh ngay', 1).p!,
    ).toBeGreaterThan(0.99);
    expect(naiveBayesScore('họp nhóm lúc 3 giờ chiều', 1).p!).toBeLessThan(
      0.05,
    );
  });

  it('làm mượt Laplace giữ cho một từ lạ không giết cả câu', () => {
    const r = naiveBayesScore('tài khoản blockchainzzz', 1);
    expect(r.degenerate).toBe(false);
    expect(Number.isFinite(r.p!)).toBe(true);
  });

  it('α = 0 cộng từ lạ cho 0/0, và lab phải GỌI TÊN nó thay vì in NaN', () => {
    const r = naiveBayesScore('tài khoản blockchainzzz', 0);
    expect(r.degenerate).toBe(true);
    expect(r.p).toBeNull();
    expect(r.unknownWords).toEqual(['blockchainzzz']);
    // Không một con số nào in ra được phép là NaN — kể cả trong bảng đóng góp
    // từng từ, nơi log(0) − log(0) từng lọt ra màn hình.
    expect(r.contrib.find((c) => c.w === 'blockchainzzz')!.d).toBeNull();
    expect(r.contrib.every((c) => c.d == null || !Number.isNaN(c.d))).toBe(true);
  });

  it('α = 0 còn cho ±∞ với từ chỉ có ở MỘT lớp, và đó là con số đúng', () => {
    // "tài" và "khoản" chỉ xuất hiện trong thư rác. Với α = 0 thì log-odds của
    // chúng là +∞ — một từ tự nó quyết định cả câu. Giao diện phải vẽ ra điều
    // đó, chứ không in chuỗi "Infinity".
    const r = naiveBayesScore('tài khoản blockchainzzz', 0);
    const inf = r.contrib.filter((c) => c.d != null && !Number.isFinite(c.d));
    expect(inf.map((c) => c.w).sort()).toEqual(['khoản', 'tài']);
    expect(inf.every((c) => c.d! > 0)).toBe(true);
  });

  it('α = 0 với từ CHỈ có ở một lớp thì vẫn kết luận được — đó mới là bài học gốc', () => {
    const r = naiveBayesScore('trúng thưởng', 0);
    expect(r.degenerate).toBe(false);
    expect(r.p).toBe(1);
  });
});

describe('lab-tree — đáp án máy tìm được phải thật sự là tốt nhất', () => {
  it('tồn tại phép chia hoàn hảo, và máy tìm ra nó', () => {
    const best = bestTreeSplit();
    expect(best.rootEntropy).toBeCloseTo(1, 9);
    expect(best.gain).toBeCloseTo(1, 9);
    expect(best.feature).toBe('age');
    expect(best.thr).toBe(215);
  });

  it('không phép chia nào vượt được đáp án đó', () => {
    const best = bestTreeSplit().gain;
    for (const f of ['ent', 'age', 'dots'] as const) {
      for (let t = -50; t <= 2100; t += 7)
        expect(treeSplit(f, t).gain).toBeLessThanOrEqual(best + 1e-9);
    }
  });

  it('phép chia mặc định còn cách đáp án rất xa — lab có chỗ để người học đi tìm', () => {
    expect(treeSplit('ent', 0.65).gain).toBeCloseTo(0.35, 2);
  });

  it('số dấu chấm cũng chia hoàn hảo: hai lời giải, đúng như "thử MỌI đặc trưng"', () => {
    expect(treeSplit('dots', 2.5).gain).toBeCloseTo(1, 9);
  });
});

describe('lab-knn — răng cưa co lại theo k, còn đảo thì phải kéo nhiễu mới thấy', () => {
  it('ở nhiễu mặc định, chu vi ranh giới rụng gần nửa khi k đi từ 1 lên 5', () => {
    expect(knnRun(1, 0.16).roughness).toBe(118);
    expect(knnRun(5, 0.16).roughness).toBe(63);
    expect(knnRun(3, 0.16).roughness).toBeLessThan(knnRun(1, 0.16).roughness);
    expect(knnRun(5, 0.16).roughness).toBeLessThan(knnRun(3, 0.16).roughness);
  });

  it('nhưng ở nhiễu mặc định thì k = 1 KHÔNG sinh đảo nào — nên lời kết luận phải chỉ sang thanh nhiễu', () => {
    expect(knnRun(1, 0.16).islands).toBe(2);
  });

  it('kéo nhiễu lên 0,22 thì đảo hiện ra, và k lớn dọn sạch chúng', () => {
    expect(knnRun(1, 0.22).islands).toBe(7);
    expect(knnRun(15, 0.22).islands).toBe(2);
  });

  it('nhiễu thấp nhất: k mất hết ý nghĩa, mọi giá trị cho cùng một ranh giới', () => {
    const r = [1, 3, 5, 15, 25].map((k) => knnRun(k, 0.06));
    expect(r.every((x) => x.islands === 2)).toBe(true);
    const rough = r.map((x) => x.roughness);
    expect(Math.max(...rough) - Math.min(...rough)).toBeLessThanOrEqual(2);
  });
});

describe('lab-kmeans — vòng đỏ đúng là 6%, nhưng "xa" không đồng nghĩa "được rắc vào"', () => {
  it('95 điểm, 6 vòng đỏ — đúng con số ghi dưới biểu đồ', () => {
    const r = kmeansRun(3, 8);
    expect(r.pts.length).toBe(95);
    expect(r.flaggedCount).toBe(6);
    expect((r.flaggedCount / r.pts.length) * 100).toBeCloseTo(6.3, 1);
  });

  it('chỉ 2 trong 5 điểm rắc ngẫu nhiên lọt vào hàng đợi — "xa ≠ độc hại" cũng đúng chiều ngược lại', () => {
    const r = kmeansRun(3, 8);
    expect(r.outlierIndexes.filter((i) => r.flagged[i]).length).toBe(2);
    // Ba điểm còn lại rơi ngay giữa một cụm, nên chúng KHÔNG xa chút nào.
    expect(r.outlierRanks[0]).toBe(0);
    expect(r.outlierRanks[4]).toBeGreaterThan(30);
  });

  it('phân vị cắt nên số vòng đỏ không đổi theo k', () => {
    for (const k of [1, 2, 3, 4, 5, 6])
      expect(kmeansRun(k, 8).flaggedCount).toBe(6);
  });
});

describe('lab-url-features — tên miền thật của ngân hàng phải KHÔNG bị tố giả mạo', () => {
  const risky = (u: string) =>
    urlFeatures(u)
      .filter((x) => x.risk)
      .map((x) => x.k);

  it('URL giả mạo mặc định gắn cờ đúng chỗ đáng gắn', () => {
    const r = risky(
      'http://secure-vietcombank.verify-account.xyz/login?id=8821',
    );
    expect(r).toContain('Thương hiệu ở sai vị trí');
    expect(r).toContain('TLD');
    expect(r).toContain('Có dấu gạch ngang');
    expect(r.length).toBe(6);
  });

  it('vietcombank.com.vn KHÔNG phải giả mạo — hậu tố hai cấp phải được hiểu đúng', () => {
    // Lời kết luận mời người học "dán một URL thật của ngân hàng bạn dùng", nên
    // đây là URL đầu tiên họ thử. Bản trước đọc `com` là nhãn gốc rồi kết luận
    // `vietcombank` nằm sai chỗ, tức là tố oan đúng ngân hàng lab lấy làm ví dụ.
    expect(risky('https://vietcombank.com.vn/')).toEqual([]);
    expect(risky('https://www.vietcombank.com.vn/login')).toEqual([
      'Từ khoá nhạy cảm',
    ]);
  });

  it('và đó chính là điều lời kết luận nói: trang thật cũng có chữ "login"', () => {
    expect(risky('https://www.google.com/search?q=x')).toEqual([]);
  });

  it('tách host: nhãn đăng ký được nằm trước hậu tố, dù hậu tố có một hay hai cấp', () => {
    expect(splitHost('www.vietcombank.com.vn')).toEqual({
      registrable: 'vietcombank',
      suffix: 'com.vn',
      subdomains: ['www'],
    });
    expect(splitHost('secure-vietcombank.verify-account.xyz').registrable).toBe(
      'verify-account',
    );
    expect(splitHost('google.com')).toEqual({
      registrable: 'google',
      suffix: 'com',
      subdomains: [],
    });
  });

  it('IP trần vẫn bị bắt', () => {
    expect(risky('http://192.168.1.9/admin/login')).toContain(
      'Dùng IP thay tên miền',
    );
  });
});

describe('lab-pe-features — cái bẫy "nén = độc" phải hiện ra bằng số', () => {
  it('tệp sạch không chạm ngưỡng nào', () => {
    const r = peFeatures(0);
    expect(r.packedBySection).toBe(false);
    expect(r.flaggedApis).toEqual([]);
    expect(r.sample.signed).toBe(true);
  });

  it('mẫu nén UPX bị gắn cờ vì NÉN, không vì hành vi — đúng cái bẫy lời kết luận nêu', () => {
    const r = peFeatures(1);
    expect(r.maxSectionEnt).toBeGreaterThan(PE_ENTROPY_PACKED);
    expect(r.fewImports).toBe(true);
    expect(r.flaggedApis.length).toBeLessThan(peFeatures(2).flaggedApis.length);
  });

  it('còn mẫu mã độc thật lại KHÔNG vượt ngưỡng entropy — bắt bằng API mới đúng', () => {
    const r = peFeatures(2);
    expect(r.packedBySection).toBe(false);
    expect(r.flaggedApis).toEqual([
      'CryptEncrypt',
      'CryptGenKey',
      'DeleteFileW',
    ]);
  });
});

describe('lab-tfidf — IDF chỉ đổi thứ gì đó khi truy vấn có từ phổ biến', () => {
  it('những từ lời kết luận nêu xuất hiện ở PHẦN LỚN dòng log, không phải mọi dòng', () => {
    const { df } = tfidfRun('x', true);
    expect(df.get('for')).toBe(5);
    expect(df.get('from')).toBe(4);
    expect(df.get('port')).toBe(4);
    expect(df.get('powershell')).toBe(1);
  });

  it('truy vấn mặc định toàn từ hiếm, nên bật tắt IDF gần như không đổi gì', () => {
    const q = 'powershell EncodedCommand downloadstring';
    const on = tfidfRun(q, true);
    const off = tfidfRun(q, false);
    expect(on.sims[0].l).toContain('powershell');
    expect(off.sims[0].l).toContain('powershell');
    expect(on.sims[0].s).toBeCloseTo(off.sims[0].s, 6);
  });

  it('với truy vấn nhiều từ phổ biến thì IDF mới lộ tác dụng — đúng ba con số lab in ra', () => {
    const q = 'failed password for root from port';
    const on = tfidfRun(q, true).weights;
    const off = tfidfRun(q, false).weights;
    expect(on.get('root')!).toBeCloseTo(0.417, 3);
    expect(on.get('for')!).toBeCloseTo(0.234, 3);
    expect(on.get('root')!).toBeGreaterThan(on.get('for')!);
    // Tắt IDF: cả sáu từ nặng y hệt nhau, từ hiếm mất sạch ưu thế.
    expect([...off.values()].every((v) => Math.abs(v - 1 / 6) < 1e-9)).toBe(
      true,
    );
  });
});

describe('lab-anomaly — ở cùng ngân sách cảnh báo, ba phương pháp gần như không khác nhau', () => {
  const METHODS = ['iforest', 'zscore', 'percentile'] as const;

  it('ngân sách mặc định 5: cả ba bắt đủ 3 vụ, và cả ba kéo theo đúng một điểm lành tính', () => {
    for (const m of METHODS) {
      const r = anomalyRun(m, 5);
      expect(r.caught).toBe(ANOMALY_ATTACKS);
      expect(r.benignAnomaliesFlagged).toBe(1);
      expect(r.flagged.length).toBe(5);
    }
  });

  it('và điều đó đúng trên cả dải ngân sách, không phải trùng hợp ở một điểm', () => {
    for (const budget of [3, 5, 8, 12, 20]) {
      const caught = METHODS.map((m) => anomalyRun(m, budget).caught);
      expect(new Set(caught).size).toBe(1);
    }
  });

  it('điểm "múi giờ khác" không phương pháp nào đưa vào top 5 — giới hạn nằm ở DỮ LIỆU', () => {
    for (const m of METHODS) {
      const r = anomalyRun(m, 5);
      expect(r.flagged.some((x) => x.who.includes('múi giờ'))).toBe(false);
    }
    // Nới ngân sách lên 8 thì nó vào, kèm cả điểm "deadline" — vẫn không tách
    // được khỏi tấn công thật, vì thông tin để tách không có trong dữ liệu.
    for (const m of METHODS)
      expect(anomalyRun(m, 8).benignAnomaliesFlagged).toBe(2);
  });

  it('ngân sách chính là thứ điều khiển kết quả, không phải tên thuật toán', () => {
    for (const m of METHODS) {
      expect(anomalyRun(m, 3).caught).toBe(2);
      expect(anomalyRun(m, 5).caught).toBe(3);
    }
  });
});

describe('lab-drift — "chỉ sau vài tháng" là mấy tháng', () => {
  it('trạng thái mặc định: chạm ngưỡng ngừng dùng ở tháng 5 và tụt tiếp', () => {
    const r = driftSeries(1.4, 0, 24);
    expect(r.retireMonth).toBe(5);
    expect(r.finalF1).toBeCloseTo(0.116, 3);
  });

  it('đối thủ tích cực: hai tháng', () => {
    expect(driftSeries(4, 0, 24).retireMonth).toBe(2);
  });

  it('huấn luyện lại mỗi 3 tháng là đủ giữ mô hình khỏi ngưỡng hỏng', () => {
    const r = driftSeries(1.4, 3, 24);
    expect(r.retireMonth).toBeNull();
    expect(r.retrains).toBe(8);
  });

  it('trôi chậm thì hai năm vẫn sống, nhưng đã mất một phần tư điểm', () => {
    const r = driftSeries(0.2, 0, 24);
    expect(r.retireMonth).toBeNull();
    expect(r.finalF1).toBeCloseTo(0.677, 3);
  });
});

describe('lab-prompt-injection — kiến trúc chặn được, lọc chuỗi thì không', () => {
  it('không phòng thủ thì agent bị chiếm quyền ở cả ba kịch bản có chèn', () => {
    for (const i of [0, 1, 2])
      expect(injectionRun(i, []).compromised).toBe(true);
  });

  it('nội dung sạch thì không bao giờ bị chiếm, dù có công cụ hành động', () => {
    expect(injectionRun(3, []).compromised).toBe(false);
    expect(injectionRun(3, []).hasActionTool).toBe(true);
  });

  it('tách đặc quyền + con người xác nhận: 0,67 — vượt ngưỡng an toàn', () => {
    const r = injectionRun(0, ['privsep', 'humanloop']);
    expect(r.protection).toBeCloseTo(0.67, 6);
    expect(r.protection).toBeGreaterThan(INJECTION_SAFE);
    expect(r.compromised).toBe(false);
  });

  it('gộp CẢ BA biện pháp lọc chuỗi vẫn không tới ngưỡng — đúng câu lời kết luận nói', () => {
    const r = injectionRun(0, ['delim', 'outfilter', 'allowlist']);
    expect(r.protection).toBeCloseTo(0.558, 3);
    expect(r.compromised).toBe(true);
  });

  it('mỗi biện pháp kiến trúc một mình cũng chưa đủ — phải là hai lớp', () => {
    expect(injectionRun(0, ['privsep']).compromised).toBe(true);
    expect(injectionRun(0, ['humanloop']).compromised).toBe(true);
  });
});
