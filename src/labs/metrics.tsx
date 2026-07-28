/**
 * Phòng lab về ĐO LƯỜNG.
 *
 * Đây là nhóm lab quan trọng nhất của toàn khoá. Lý do: hầu hết thất bại của
 * ML trong bảo mật không phải do thuật toán kém, mà do người ta đo sai thứ.
 * Chữ nghĩa khó truyền đạt được cảm giác "0,1% mà lại là 10.000 cảnh báo";
 * kéo một thanh trượt và thấy con số nhảy thì truyền được ngay.
 */

import { useMemo, useState } from 'react';
import { LabShell, Slider, Readout, Chart, Axes, Line, Area, Dots, mkPlot, px, py, COLORS, Bars, Toggle } from './kit';
import { fmtNum, mulberry32, gaussian, clamp } from '../lib/utils';
import { Icon } from '../components/Icon';

/* ========================================================================== */
/*  lab-base-rate — Nghịch lý tỉ lệ nền                                        */
/* ========================================================================== */

export function LabBaseRate() {
  const [prevPer100k, setPrev] = useState(10); // số ca thật trên 100.000
  const [tpr, setTpr] = useState(95);
  const [fpr, setFpr] = useState(1);
  const [volume, setVolume] = useState(1_000_000);

  const positives = (volume * prevPer100k) / 100_000;
  const negatives = volume - positives;
  const tp = positives * (tpr / 100);
  const fn = positives - tp;
  const fp = negatives * (fpr / 100);
  const tn = negatives - fp;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const alerts = tp + fp;
  const minutesPerAlert = 12;
  const analystHours = (alerts * minutesPerAlert) / 60;

  return (
    <LabShell
      id="lab-base-rate"
      title="Máy tính nghịch lý tỉ lệ nền"
      takeaway={
        <>
          Kéo <b>tỉ lệ nền</b> xuống thật thấp trong khi giữ bộ dò "rất tốt" (TPR 95%, FPR 1%). Độ chuẩn xác
          sụp đổ dù mô hình không hề tệ đi. Đây là lý do toán học khiến mọi hệ thống phát hiện xâm nhập ngập
          báo động giả — và không thuật toán nào sửa được nó ngoài việc <b>hạ FPR xuống mức cực thấp</b> hoặc{' '}
          <b>thu hẹp phạm vi để tăng tỉ lệ nền</b>.
        </>
      }
    >
      <div className="grid grid-2">
        <div className="stack">
          <Slider
            label="Tỉ lệ nền (số ca thật trên 100.000)"
            value={prevPer100k}
            min={1}
            max={5000}
            step={1}
            onChange={setPrev}
            format={(v) => `${v} / 100k  (${((v / 1000) * 1).toFixed(3)}%)`}
            hint="Phishing có chủ đích thường dưới 10/100k. Malware thường 50–500/100k."
          />
          <Slider
            label="Tỉ lệ bắt được (TPR / Recall)"
            value={tpr}
            min={50}
            max={100}
            step={0.5}
            onChange={setTpr}
            format={(v) => `${v}%`}
          />
          <Slider
            label="Tỉ lệ báo động giả (FPR)"
            value={fpr}
            min={0.001}
            max={10}
            step={0.001}
            onChange={setFpr}
            format={(v) => `${v}%`}
            hint="Thử kéo xuống 0,01% để thấy đây mới là núm quan trọng nhất."
          />
          <Slider
            label="Lưu lượng mỗi ngày"
            value={volume}
            min={10_000}
            max={50_000_000}
            step={10_000}
            onChange={setVolume}
            format={(v) => `${fmtNum(v)} sự kiện`}
          />
        </div>

        <div className="stack">
          <Readout
            items={[
              {
                k: 'Độ chuẩn xác',
                v: `${(precision * 100).toFixed(1)}%`,
                tone: precision > 0.5 ? 'ok' : precision > 0.15 ? 'warn' : 'bad',
                sub: `1 cảnh báo thật / ${precision > 0 ? Math.round(1 / precision) : '∞'} cảnh báo`,
              },
              { k: 'Cảnh báo mỗi ngày', v: fmtNum(Math.round(alerts)), tone: alerts > 500 ? 'bad' : 'neutral' },
              { k: 'Bỏ sót mỗi ngày', v: fmtNum(Math.round(fn)), tone: fn > 1 ? 'warn' : 'ok' },
              {
                k: 'Giờ analyst / ngày',
                v: analystHours.toFixed(1),
                tone: analystHours > 40 ? 'bad' : analystHours > 8 ? 'warn' : 'ok',
                sub: `≈ ${(analystHours / 8).toFixed(1)} người toàn thời gian`,
              },
            ]}
          />
          <div className="panel">
            <div className="faint" style={{ marginBottom: 8 }}>
              Trong 1.000 cảnh báo mô hình gửi cho analyst:
            </div>
            <div style={{ display: 'flex', height: 26, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ width: `${precision * 100}%`, background: 'var(--ok)', minWidth: precision > 0 ? 2 : 0 }} />
              <div style={{ flex: 1, background: 'var(--warn)', opacity: 0.75 }} />
            </div>
            <div className="row" style={{ marginTop: 8, fontSize: 'var(--fs-xs)' }}>
              <span className="chip chip-ok">{Math.round(precision * 1000)} thật</span>
              <span className="chip chip-warn">{1000 - Math.round(precision * 1000)} giả</span>
            </div>
          </div>
          <table className="data">
            <tbody>
              <tr><td>Đúng dương (TP)</td><td className="mono">{fmtNum(Math.round(tp))}</td></tr>
              <tr><td>Sai dương (FP)</td><td className="mono">{fmtNum(Math.round(fp))}</td></tr>
              <tr><td>Sai âm (FN)</td><td className="mono">{fmtNum(Math.round(fn))}</td></tr>
              <tr><td>Đúng âm (TN)</td><td className="mono">{fmtNum(Math.round(tn))}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-confusion — Ma trận nhầm lẫn theo ngưỡng                               */
/* ========================================================================== */

export function makeScores(seed: number, n = 400, sep = 1.6, posRate = 0.2) {
  const rng = mulberry32(seed);
  const out: { score: number; y: 0 | 1 }[] = [];
  for (let i = 0; i < n; i++) {
    const y: 0 | 1 = rng() < posRate ? 1 : 0;
    const raw = gaussian(rng, y ? sep : 0, 1);
    out.push({ score: 1 / (1 + Math.exp(-raw)), y });
  }
  return out;
}

export function LabConfusion() {
  const [threshold, setThreshold] = useState(0.5);
  const [sep, setSep] = useState(1.8);
  /**
   * Tỉ lệ lớp dương phải KÉO ĐƯỢC, và mặc định phải hiếm.
   *
   * Trước đây nó bị chốt cứng ở 20% và lời kết luận vẫn hứa "accuracy gần như
   * không nhúc nhích". Ở 20% dương thì accuracy là chỉ số biến động MẠNH NHẤT
   * trên biểu đồ — nó chạy từ 0,21 tới 0,83 khi kéo ngưỡng. Nghịch lý accuracy
   * chỉ xuất hiện khi lớp dương hiếm, đúng như thực tế bảo mật, nên 2% mới là
   * điểm khởi đầu trung thực.
   */
  const [posRate, setPosRate] = useState(0.02);
  const data = useMemo(() => makeScores(2024, 4000, sep, posRate), [sep, posRate]);

  const tp = data.filter((d) => d.y === 1 && d.score >= threshold).length;
  const fn = data.filter((d) => d.y === 1 && d.score < threshold).length;
  const fp = data.filter((d) => d.y === 0 && d.score >= threshold).length;
  const tn = data.filter((d) => d.y === 0 && d.score < threshold).length;
  const precision = tp + fp ? tp / (tp + fp) : 0;
  const recall = tp + fn ? tp / (tp + fn) : 0;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  const acc = (tp + tn) / data.length;

  const p = mkPlot(460, 210, [0, 1], [0, 60], { l: 40, r: 12, t: 12, b: 34 });
  const hist = (cls: 0 | 1) => {
    const bins = new Array(24).fill(0);
    for (const d of data) if (d.y === cls) bins[Math.min(23, Math.floor(d.score * 24))]++;
    return bins;
  };
  const h0 = hist(0);
  const h1 = hist(1);

  return (
    <LabShell
      id="lab-confusion"
      title="Ma trận nhầm lẫn và ngưỡng quyết định"
      takeaway={
        <>
          Kéo ngưỡng và để ý: <b>không có vị trí nào tốt cho cả hai bên</b>. Mỗi báo động giả bạn cắt được đều
          đổi bằng một lần bỏ sót. Ngưỡng 0,5 chỉ là mặc định của thư viện, không phải một lựa chọn kỹ thuật —
          nó chỉ đúng khi hai loại sai có chi phí bằng nhau, điều gần như không bao giờ xảy ra trong bảo mật.
          Bây giờ tới phần đáng sợ. Giữ tỉ lệ tấn công ở 2% mặc định rồi kéo ngưỡng lên <b>0,98</b>: recall
          rơi xuống <b>0,02</b> — hệ thống bỏ lọt 98% số vụ tấn công — nhưng <b>accuracy lại TĂNG lên 97,9%</b>,
          con số đẹp nhất trong cả buổi. Chỉ số đang thưởng cho bạn vì đã ngừng phát hiện. Một mô hình chỉ
          biết trả lời "không có gì" cũng đạt đúng 98% như thế.
          <br />
          <br />
          Kéo <b>tỉ lệ tấn công lên 20%</b> rồi lặp lại: accuracy giờ đạt đỉnh 0,85 ở giữa rồi tụt xuống 0,80,
          tức là nó có phản ứng với thiệt hại. Cùng một công thức, hai hành vi trái ngược — <b>accuracy chỉ
          nói dối khi lớp dương hiếm</b>, và trong bảo mật thì nó gần như luôn hiếm.
        </>
      }
    >
      <Slider label="Ngưỡng quyết định" value={threshold} min={0.02} max={0.98} step={0.01} onChange={setThreshold} format={(v) => v.toFixed(2)} />
      <Slider label="Mô hình phân tách tốt đến đâu" value={sep} min={0.3} max={4} step={0.1} onChange={setSep} format={(v) => v.toFixed(1)} hint="Mô hình càng tốt, hai phân phối càng tách xa nhau." />
      <Slider label="Tỉ lệ tấn công thật trong dữ liệu" value={posRate} min={0.005} max={0.3} step={0.005} onChange={setPosRate} format={(v) => `${(v * 100).toFixed(1)}%`} hint="Trong SOC thật, con số này thường dưới 1%. Kéo lên cao và xem accuracy đổi vai." />

      <Chart p={p} label="Phân bố điểm số của hai lớp">
        <Axes p={p} xLabel="Điểm mô hình" yLabel="Số mẫu" yTicks={3} fmtY={(v) => String(Math.round(v))} />
        {h0.map((v, i) => (
          <rect key={`a${i}`} x={px(p, i / 24)} y={py(p, v)} width={(p.w - p.pad.l - p.pad.r) / 24 - 1} height={Math.max(0, py(p, 0) - py(p, v))} fill={COLORS.ok} opacity={0.55} />
        ))}
        {h1.map((v, i) => (
          <rect key={`b${i}`} x={px(p, i / 24)} y={py(p, v)} width={(p.w - p.pad.l - p.pad.r) / 24 - 1} height={Math.max(0, py(p, 0) - py(p, v))} fill={COLORS.bad} opacity={0.6} />
        ))}
        <line x1={px(p, threshold)} y1={p.pad.t} x2={px(p, threshold)} y2={p.h - p.pad.b} stroke="var(--brand)" strokeWidth={2.5} />
      </Chart>

      <div className="grid grid-2">
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div className="card" style={{ background: 'var(--ok-soft)', borderColor: 'var(--ok-border)', padding: 'var(--s-3)' }}>
              <div className="stat-k"><Icon name="check" size={11} /> Đúng dương</div>
              <div className="stat-v" style={{ fontSize: 'var(--fs-xl)', color: 'var(--ok-text)' }}>{tp}</div>
            </div>
            <div className="card" style={{ background: 'var(--warn-soft)', borderColor: 'var(--warn-border)', padding: 'var(--s-3)' }}>
              <div className="stat-k"><Icon name="alert-triangle" size={11} /> Báo động giả</div>
              <div className="stat-v" style={{ fontSize: 'var(--fs-xl)', color: 'var(--warn-text)' }}>{fp}</div>
            </div>
            <div className="card" style={{ background: 'var(--bad-soft)', borderColor: 'var(--bad-border)', padding: 'var(--s-3)' }}>
              <div className="stat-k"><Icon name="x" size={11} /> Bỏ sót</div>
              <div className="stat-v" style={{ fontSize: 'var(--fs-xl)', color: 'var(--bad-text)' }}>{fn}</div>
            </div>
            <div className="card" style={{ padding: 'var(--s-3)' }}>
              <div className="stat-k">· Đúng âm</div>
              <div className="stat-v" style={{ fontSize: 'var(--fs-xl)' }}>{tn}</div>
            </div>
          </div>
        </div>
        <Bars
          color={COLORS.brand}
          data={[
            { label: 'Chuẩn xác', v: precision, color: 'var(--brand)' },
            { label: 'Bao phủ', v: recall, color: 'var(--info)' },
            { label: 'F1', v: f1, color: 'var(--lab)' },
            { label: 'Chính xác', v: acc, color: 'var(--text-faint)' },
          ]}
          fmt={(v) => `${(v * 100).toFixed(0)}%`}
        />
      </div>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-roc-pr — ROC và PR cạnh nhau                                           */
/* ========================================================================== */

export function LabRocPr() {
  const [posRate, setPosRate] = useState(20);
  const [sep, setSep] = useState(1.8);
  const data = useMemo(() => makeScores(777, 4000, sep, posRate / 100), [sep, posRate]);

  const { roc, pr, auc, ap } = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.score - a.score);
    const P = sorted.filter((d) => d.y === 1).length || 1;
    const N = sorted.length - P || 1;
    let tp = 0;
    let fp = 0;
    const roc: [number, number][] = [[0, 0]];
    const pr: [number, number][] = [];
    let auc = 0;
    let ap = 0;
    let prevFpr = 0;
    let prevRec = 0;
    for (const d of sorted) {
      if (d.y === 1) tp++;
      else fp++;
      const rec = tp / P;
      const fprv = fp / N;
      const prec = tp / (tp + fp);
      roc.push([fprv, rec]);
      pr.push([rec, prec]);
      auc += (fprv - prevFpr) * rec;
      ap += (rec - prevRec) * prec;
      prevFpr = fprv;
      prevRec = rec;
    }
    return { roc, pr, auc, ap };
  }, [data]);

  const pRoc = mkPlot(300, 250, [0, 1], [0, 1], { l: 40, r: 10, t: 12, b: 36 });
  const pPr = mkPlot(300, 250, [0, 1], [0, 1], { l: 40, r: 10, t: 12, b: 36 });
  const baseline = posRate / 100;

  return (
    <LabShell
      id="lab-roc-pr"
      title="ROC và Precision–Recall cạnh nhau"
      takeaway={
        <>
          Giữ nguyên mô hình, chỉ kéo <b>tỉ lệ lớp dương</b> từ 20% xuống 0,5%. ROC-AUC gần như không đổi — nó
          trông vẫn "xuất sắc". Nhưng PR-AUC sụp thẳng đứng, và đó mới là thứ analyst cảm nhận được. Lý do:
          mẫu số của FPR là toàn bộ mẫu âm (rất lớn), nên FPR luôn nhỏ; còn mẫu số của precision là số cảnh
          báo bạn thực sự gửi đi. <b>Khi lớp dương hiếm, hãy báo cáo PR-AUC.</b>
        </>
      }
    >
      <div className="grid grid-2">
        <Slider label="Tỉ lệ lớp dương (tấn công)" value={posRate} min={0.2} max={40} step={0.1} onChange={setPosRate} format={(v) => `${v}%`} hint="Thực tế trong bảo mật thường dưới 1%." />
        <Slider label="Chất lượng mô hình" value={sep} min={0.4} max={4} step={0.1} onChange={setSep} format={(v) => v.toFixed(1)} />
      </div>

      <div className="grid grid-2">
        <div>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
            <b style={{ fontSize: 'var(--fs-sm)' }}>Đường ROC</b>
            <span className="chip chip-info">AUC {auc.toFixed(3)}</span>
          </div>
          <Chart p={pRoc} label="Đường ROC">
            <Axes p={pRoc} xLabel="FPR" yLabel="TPR" xTicks={4} yTicks={4} />
            <Line p={pRoc} pts={[[0, 0], [1, 1]]} color="var(--border-strong)" width={1.4} dash="5 4" />
            <Area p={pRoc} pts={roc} color={COLORS.info} />
            <Line p={pRoc} pts={roc} color={COLORS.info} />
          </Chart>
        </div>
        <div>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
            <b style={{ fontSize: 'var(--fs-sm)' }}>Đường Precision–Recall</b>
            <span className={`chip ${ap > 0.5 ? 'chip-ok' : ap > 0.2 ? 'chip-warn' : 'chip-bad'}`}>PR-AUC {ap.toFixed(3)}</span>
          </div>
          <Chart p={pPr} label="Đường Precision-Recall">
            <Axes p={pPr} xLabel="Recall" yLabel="Precision" xTicks={4} yTicks={4} />
            <Line p={pPr} pts={[[0, baseline], [1, baseline]]} color="var(--border-strong)" width={1.4} dash="5 4" />
            <Area p={pPr} pts={pr} color={COLORS.brand} />
            <Line p={pPr} pts={pr} color={COLORS.brand} />
          </Chart>
          <div className="faint center">Đường đứt = mức của mô hình đoán mò ({(baseline * 100).toFixed(1)}%)</div>
        </div>
      </div>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-cost-threshold — Ngưỡng tối ưu theo chi phí                            */
/* ========================================================================== */

export function LabCostThreshold() {
  const [costFN, setCostFN] = useState(50000);
  const [costFP, setCostFP] = useState(15);
  const [posRate, setPosRate] = useState(1);
  const data = useMemo(() => makeScores(4242, 6000, 2.0, posRate / 100), [posRate]);

  const curve = useMemo(() => {
    const out: { t: number; cost: number; alerts: number; missed: number }[] = [];
    for (let t = 0.01; t <= 0.99; t += 0.01) {
      const fn = data.filter((d) => d.y === 1 && d.score < t).length;
      const fp = data.filter((d) => d.y === 0 && d.score >= t).length;
      const tp = data.filter((d) => d.y === 1 && d.score >= t).length;
      out.push({ t, cost: fn * costFN + fp * costFP, alerts: tp + fp, missed: fn });
    }
    return out;
  }, [data, costFN, costFP]);

  const best = curve.reduce((a, b) => (b.cost < a.cost ? b : a), curve[0]);
  const at05 = curve.find((c) => Math.abs(c.t - 0.5) < 0.006) ?? curve[Math.floor(curve.length / 2)];
  const maxCost = Math.max(...curve.map((c) => c.cost));
  const p = mkPlot(460, 240, [0, 1], [0, maxCost || 1], { l: 62, r: 12, t: 12, b: 36 });

  return (
    <LabShell
      id="lab-cost-threshold"
      title="Chọn ngưỡng bằng ma trận chi phí"
      takeaway={
        <>
          Ngưỡng tối ưu <b>hầu như không bao giờ là 0,5</b>. Nó phụ thuộc vào tỉ số chi phí bỏ sót / chi phí
          báo động giả và vào tỉ lệ nền. Hãy thử đặt chi phí bỏ sót = 50.000 (một vụ ransomware) và chi phí
          báo động giả = 15 (15 phút analyst): ngưỡng tối ưu tụt xuống rất thấp. Đây là cách bạn biện minh
          cho một con số trước ban lãnh đạo, thay vì nói "chúng tôi để mặc định".
        </>
      }
    >
      <div className="grid grid-3">
        <Slider label="Chi phí một lần BỎ SÓT" value={costFN} min={100} max={200000} step={100} onChange={setCostFN} format={(v) => `${fmtNum(v)} $`} />
        <Slider label="Chi phí một BÁO ĐỘNG GIẢ" value={costFP} min={1} max={200} step={1} onChange={setCostFP} format={(v) => `${v} $`} hint="≈ giá 12 phút của analyst" />
        <Slider label="Tỉ lệ nền" value={posRate} min={0.05} max={20} step={0.05} onChange={setPosRate} format={(v) => `${v}%`} />
      </div>

      <Chart p={p} label="Chi phí kỳ vọng theo ngưỡng">
        <Axes p={p} xLabel="Ngưỡng" yLabel="Tổng chi phí ($)" yTicks={4} fmtY={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v)))} />
        <Line p={p} pts={curve.map((c) => [c.t, c.cost])} color={COLORS.warn} />
        <line x1={px(p, 0.5)} y1={p.pad.t} x2={px(p, 0.5)} y2={p.h - p.pad.b} stroke="var(--text-faint)" strokeWidth={1.5} strokeDasharray="4 4" />
        <text x={px(p, 0.5) + 5} y={p.pad.t + 14} className="svg-label" style={{ fontSize: 10 }}>mặc định 0,5</text>
        <line x1={px(p, best.t)} y1={p.pad.t} x2={px(p, best.t)} y2={p.h - p.pad.b} stroke="var(--ok)" strokeWidth={2.2} />
        <circle cx={px(p, best.t)} cy={py(p, best.cost)} r={6} fill="var(--ok)" />
        <text x={px(p, best.t) + 6} y={py(p, best.cost) - 8} className="svg-label-strong" style={{ fontSize: 11 }}>tối ưu {best.t.toFixed(2)}</text>
      </Chart>

      <Readout
        items={[
          { k: 'Ngưỡng tối ưu', v: best.t.toFixed(2), tone: 'ok' },
          { k: 'Chi phí ở ngưỡng tối ưu', v: `${fmtNum(Math.round(best.cost))} $`, tone: 'ok' },
          { k: 'Chi phí nếu để 0,5', v: `${fmtNum(Math.round(at05.cost))} $`, tone: at05.cost > best.cost * 1.2 ? 'bad' : 'neutral' },
          { k: 'Tiết kiệm được', v: `${fmtNum(Math.round(at05.cost - best.cost))} $`, tone: 'info', sub: 'trên cùng tập dữ liệu' },
        ]}
      />
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-calibration — Hiệu chuẩn xác suất                                      */
/* ========================================================================== */

export function LabCalibration() {
  const [skew, setSkew] = useState(1);
  const pts = useMemo(() => {
    // skew = 1 → hiệu chuẩn hoàn hảo; > 1 → tự tin quá mức; < 1 → rụt rè.
    const rng = mulberry32(99);
    const bins = Array.from({ length: 10 }, () => ({ n: 0, pos: 0 }));
    for (let i = 0; i < 5000; i++) {
      const trueP = rng();
      const shown = clamp(Math.pow(trueP, 1 / skew), 0, 0.999);
      const y = rng() < trueP ? 1 : 0;
      const b = Math.min(9, Math.floor(shown * 10));
      bins[b].n++;
      bins[b].pos += y;
    }
    return bins.map((b, i) => ({ x: i / 10 + 0.05, y: b.n ? b.pos / b.n : 0, n: b.n }));
  }, [skew]);

  const p = mkPlot(440, 280, [0, 1], [0, 1], { l: 48, r: 14, t: 14, b: 38 });
  const ece = pts.reduce((s, b) => s + (b.n / 5000) * Math.abs(b.y - b.x), 0);

  return (
    <LabShell
      id="lab-calibration"
      title="Biểu đồ độ tin cậy (reliability diagram)"
      takeaway={
        <>
          Một mô hình có thể xếp hạng rất tốt (AUC cao) mà điểm số vẫn <b>vô nghĩa</b> về mặt xác suất. Khi
          analyst thấy "0,9" họ hiểu là "90% khả năng thật" — nếu thực tế chỉ 40% thì bạn đang nói dối họ một
          cách có hệ thống. Đường cong nằm dưới đường chéo = tự tin quá mức, dạng phổ biến nhất ở mô hình cây
          tăng cường và mạng nơ-ron. Sửa bằng Platt scaling hoặc isotonic regression trên tập kiểm định riêng.
        </>
      }
    >
      <Slider
        label="Xu hướng mô hình"
        value={skew}
        min={0.4}
        max={2.5}
        step={0.05}
        onChange={setSkew}
        format={(v) => (v > 1.08 ? 'tự tin quá mức' : v < 0.92 ? 'rụt rè quá mức' : 'hiệu chuẩn tốt')}
      />
      <Chart p={p} label="Biểu đồ độ tin cậy">
        <Axes p={p} xLabel="Điểm mô hình đưa ra" yLabel="Tỉ lệ thực sự dương" />
        <Line p={p} pts={[[0, 0], [1, 1]]} color="var(--ok)" width={2} dash="6 4" />
        <Line p={p} pts={pts.map((b) => [b.x, b.y] as [number, number])} color={COLORS.brand} />
        <Dots p={p} pts={pts.map((b) => [b.x, b.y] as [number, number])} color={COLORS.brand} r={5} />
      </Chart>
      <Readout
        items={[
          { k: 'Sai số hiệu chuẩn kỳ vọng (ECE)', v: ece.toFixed(3), tone: ece < 0.05 ? 'ok' : ece < 0.12 ? 'warn' : 'bad', sub: 'càng gần 0 càng tốt' },
          { k: 'Diễn giải', v: skew > 1.08 ? 'Nói quá' : skew < 0.92 ? 'Nói giảm' : 'Đáng tin', tone: Math.abs(skew - 1) < 0.09 ? 'ok' : 'warn' },
        ]}
      />
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-alert-load — Tải cảnh báo của SOC                                      */
/* ========================================================================== */

export function LabAlertLoad() {
  const [events, setEvents] = useState(5_000_000);
  const [fpr, setFpr] = useState(0.1);
  const [analysts, setAnalysts] = useState(4);
  const [minutes, setMinutes] = useState(12);
  const [grouping, setGrouping] = useState(true);

  const rawAlerts = (events * fpr) / 100;
  const alerts = grouping ? rawAlerts / 8 : rawAlerts;
  const capacity = analysts * 8 * (60 / minutes);
  const ratio = alerts / (capacity || 1);
  const backlogPerDay = Math.max(0, alerts - capacity);

  return (
    <LabShell
      id="lab-alert-load"
      title="Đội SOC của bạn có sống sót không?"
      takeaway={
        <>
          Con số quan trọng nhất không phải FPR mà là <b>tỉ lệ tải / năng lực</b>. Khi vượt 1,0, hàng đợi phình
          ra mỗi ngày và mọi thứ sụp trong vài tuần — analyst bắt đầu đóng cảnh báo hàng loạt mà không điều tra,
          và lúc đó cảnh báo thật cũng bị đóng cùng. Để ý rằng <b>gom nhóm cảnh báo</b> thường mang lại cải
          thiện lớn hơn nhiều so với việc chỉnh mô hình thêm vài phần trăm.
        </>
      }
    >
      <div className="grid grid-2">
        <div className="stack">
          <Slider label="Sự kiện mỗi ngày" value={events} min={100_000} max={100_000_000} step={100_000} onChange={setEvents} format={(v) => fmtNum(v)} />
          <Slider label="Tỉ lệ báo động giả" value={fpr} min={0.001} max={2} step={0.001} onChange={setFpr} format={(v) => `${v}%`} />
          <Slider label="Số analyst trực" value={analysts} min={1} max={40} step={1} onChange={setAnalysts} />
          <Slider label="Phút xử lý mỗi cảnh báo" value={minutes} min={2} max={60} step={1} onChange={setMinutes} format={(v) => `${v} phút`} />
          <Toggle label="Bật gom nhóm cảnh báo (giảm ~8 lần)" checked={grouping} onChange={setGrouping} />
        </div>
        <div className="stack">
          <Readout
            items={[
              { k: 'Cảnh báo/ngày', v: fmtNum(Math.round(alerts)), tone: ratio > 1 ? 'bad' : 'neutral' },
              { k: 'Năng lực xử lý', v: fmtNum(Math.round(capacity)), tone: 'info' },
              { k: 'Tải / năng lực', v: `${ratio.toFixed(2)}×`, tone: ratio > 1 ? 'bad' : ratio > 0.75 ? 'warn' : 'ok' },
              { k: 'Tồn đọng mỗi ngày', v: fmtNum(Math.round(backlogPerDay)), tone: backlogPerDay > 0 ? 'bad' : 'ok' },
            ]}
          />
          <div className="panel">
            <div className="bar bar-lg" style={{ marginBottom: 8 }}>
              <div
                className="bar-fill"
                style={{ width: `${Math.min(100, ratio * 100)}%`, background: ratio > 1 ? 'var(--bad)' : ratio > 0.75 ? 'var(--warn)' : 'var(--ok)' }}
              />
            </div>
            <div className="row" style={{ fontSize: 'var(--fs-sm)', gap: 'var(--s-2)', alignItems: 'flex-start' }}>
              {/* Chấm tròn tô đặc + chữ: người mù màu đỏ–lục vẫn phân biệt được bốn
                  mức, vì mỗi mức có câu mô tả riêng chứ không chỉ khác màu. */}
              <Icon
                name="dot"
                size={13}
                filled
                style={{
                  marginTop: 3,
                  color:
                    ratio > 1.5 ? 'var(--bad)' : ratio > 1 ? 'var(--warn)' : ratio > 0.75 ? 'var(--warn-text)' : 'var(--ok)',
                }}
              />
              <span>
                {ratio > 1.5
                  ? 'Sụp đổ. Đội sẽ bỏ qua cảnh báo hàng loạt trong vòng vài tuần.'
                  : ratio > 1
                    ? 'Quá tải. Hàng đợi tăng mỗi ngày, thời gian phát hiện kéo dài.'
                    : ratio > 0.75
                      ? 'Sát ngưỡng. Không còn dư địa cho ngày cao điểm hay sự cố.'
                      : 'Bền vững. Còn chỗ cho điều tra chủ động và săn tìm mối đe doạ.'}
              </span>
            </div>
            <div className="faint" style={{ marginTop: 8 }}>
              Cần thêm {Math.max(0, Math.ceil((alerts - capacity) / (8 * (60 / minutes))))} analyst để cân bằng,
              hoặc hạ FPR xuống {((capacity * 100) / (events / (grouping ? 8 : 1))).toFixed(4)}%.
            </div>
          </div>
        </div>
      </div>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-conformal — Tập dự đoán có bảo đảm phủ                                 */
/* ========================================================================== */

export interface ConformalOut {
  /** Ngưỡng bất tuân dùng chung (chế độ biên). */
  q: number;
  /** Ngưỡng riêng cho lớp âm và lớp dương (chế độ Mondrian). */
  q0: number;
  q1: number;
  /** Tỉ lệ mẫu có nhãn thật nằm trong tập dự đoán. */
  coverage: number;
  /** Cùng đại lượng đó nhưng chỉ tính trên lớp dương hiếm. */
  coveragePos: number;
  singleton: number;
  both: number;
  empty: number;
  nPos: number;
  nTest: number;
}

/**
 * Split conformal trên một bộ điểm mô phỏng.
 *
 * `bias` là thứ khiến lab này nói đúng sự thật thay vì nói một sự thật khác.
 * Với mô hình phân tách tốt và không lệch, lớp dương hiếm lại được phủ QUÁ mức
 * (99%), nên để mặc định như vậy thì lab sẽ dạy điều ngược hẳn bài học. `bias`
 * âm mô phỏng đúng thứ xảy ra ngoài đời: mô hình huấn luyện trên dữ liệu mất
 * cân bằng kéo tụt xác suất của lớp hiếm một cách hệ thống (bài t4-l5). Khi đó
 * lớp hiếm trở nên bất tuân, và phủ biên che mất chuyện nó bị bỏ rơi — đúng cái
 * bẫy mà bài t4-l9 cảnh báo.
 */
export function conformalRun(
  alpha: number,
  classCond: boolean,
  bias: number,
  seed = 7,
  posRate = 0.05,
): ConformalOut {
  const rng = mulberry32(seed);
  const data: { score: number; y: 0 | 1 }[] = [];
  for (let i = 0; i < 8000; i++) {
    const y: 0 | 1 = rng() < posRate ? 1 : 0;
    const raw = gaussian(rng, y ? 1.8 : 0, 1);
    data.push({ score: 1 / (1 + Math.exp(-(raw + bias))), y });
  }
  const cal = data.slice(0, 4000);
  const test = data.slice(4000);

  /** Điểm bất tuân: 1 trừ xác suất mô hình gán cho NHÃN THẬT. */
  const nc = (d: { score: number; y: 0 | 1 }) => (d.y === 1 ? 1 - d.score : d.score);

  /**
   * Phân vị đã hiệu chỉnh cho cỡ mẫu hữu hạn. Cái +1 và phép làm tròn LÊN chính
   * là chỗ tạo ra bảo đảm; bỏ chúng đi thì phủ chỉ còn đúng xấp xỉ.
   */
  const quantile = (xs: number[]) => {
    if (!xs.length) return 1;
    const s = [...xs].sort((a, b) => a - b);
    const k = Math.ceil((s.length + 1) * (1 - alpha));
    return s[Math.min(k, s.length) - 1];
  };

  const q = quantile(cal.map(nc));
  const q1 = quantile(cal.filter((d) => d.y === 1).map(nc));
  const q0 = quantile(cal.filter((d) => d.y === 0).map(nc));
  const Q0 = classCond ? q0 : q;
  const Q1 = classCond ? q1 : q;

  let cov = 0;
  let covPos = 0;
  let nPos = 0;
  let one = 0;
  let both = 0;
  let empty = 0;

  for (const d of test) {
    // Nhãn nào đủ tuân thủ thì vào tập; có thể ra tập rỗng hoặc cả hai nhãn.
    const set: (0 | 1)[] = [];
    if (d.score <= Q0) set.push(0);
    if (1 - d.score <= Q1) set.push(1);

    if (set.includes(d.y)) cov++;
    if (d.y === 1) {
      nPos++;
      if (set.includes(1)) covPos++;
    }
    if (set.length === 1) one++;
    else if (set.length === 2) both++;
    else empty++;
  }

  return {
    q,
    q0,
    q1,
    coverage: cov / test.length,
    coveragePos: nPos ? covPos / nPos : 0,
    singleton: one / test.length,
    both: both / test.length,
    empty: empty / test.length,
    nPos,
    nTest: test.length,
  };
}

export function LabConformal() {
  const [alpha, setAlpha] = useState(0.1);
  const [bias, setBias] = useState(-1.5);
  const [classCond, setClassCond] = useState(false);

  const r = useMemo(() => conformalRun(alpha, classCond, bias), [alpha, classCond, bias]);
  const mucTieu = 1 - alpha;
  const thieuPhuLopHiem = r.coveragePos < mucTieu - 0.05;

  return (
    <LabShell
      id="lab-conformal"
      title="Tập dự đoán conformal — bảo đảm phủ và cái giá của nó"
      takeaway={
        <>
          Hai điều đáng mang đi. <b>Một:</b> mức phủ là thứ bạn ĐẶT chứ không phải thứ bạn hy vọng — kéo α và
          cột phủ biên bám theo mục tiêu gần như tuyệt đối, đổi lại tỉ lệ tập một nhãn tụt xuống, tức ít cảnh
          báo tự động hoá được hơn. Đó là toàn bộ đánh đổi, và nó hiện ra thay vì bị giấu trong một con số
          ngưỡng tuỳ ý. <b>Hai, quan trọng hơn:</b> ở mặc định (α = 0,1, mô hình đánh giá thấp lớp hiếm) phủ
          biên đạt đúng 90% trong khi lớp dương — thứ duy nhất bạn quan tâm — chỉ được phủ khoảng 53%. Con số
          tổng trông đẹp vì 95% dữ liệu là lớp âm và chúng che mất phần còn lại. Bật conformal theo lớp thì phủ
          lớp dương lên khoảng 87%, đúng mức đã đặt, và cái giá là tập hai nhãn nhiều hơn hẳn. Trong bảo mật,
          phủ biên gần như luôn là con số nói dối.
        </>
      }
    >
      <div className="grid grid-2">
        <Slider
          label="Mức lỗi α"
          value={alpha}
          min={0.02}
          max={0.3}
          step={0.01}
          onChange={setAlpha}
          format={(v) => `α = ${v.toFixed(2)} → đòi phủ ${((1 - v) * 100).toFixed(0)}%`}
          hint="α nhỏ nghĩa là đòi chắc chắn hơn, nên tập dự đoán TO ra chứ không nhỏ đi."
        />
        <Slider
          label="Mô hình đánh giá thấp lớp hiếm"
          value={bias}
          min={-3}
          max={0}
          step={0.1}
          onChange={setBias}
          format={(v) => (v > -0.3 ? 'không lệch' : v > -1.2 ? 'lệch nhẹ' : v > -2.2 ? 'lệch như thường gặp' : 'lệch nặng')}
          hint="Huấn luyện trên dữ liệu mất cân bằng kéo tụt xác suất lớp hiếm một cách hệ thống."
        />
      </div>

      <Toggle
        label="Conformal theo lớp (Mondrian) — phân vị riêng cho từng lớp"
        checked={classCond}
        onChange={setClassCond}
      />

      <Readout
        items={[
          {
            k: 'Phủ biên (toàn bộ)',
            v: `${(r.coverage * 100).toFixed(1)}%`,
            tone: Math.abs(r.coverage - mucTieu) < 0.02 ? 'ok' : 'warn',
            sub: `đặt trước ${(mucTieu * 100).toFixed(0)}%`,
          },
          {
            k: 'Phủ riêng lớp dương',
            v: `${(r.coveragePos * 100).toFixed(1)}%`,
            tone: thieuPhuLopHiem ? 'bad' : 'ok',
            sub: `trên ${r.nPos} mẫu dương`,
          },
          {
            k: 'Tập một nhãn',
            v: `${(r.singleton * 100).toFixed(1)}%`,
            tone: 'info',
            sub: 'phần tự động hoá được',
          },
          {
            k: 'Tập rỗng',
            v: `${(r.empty * 100).toFixed(1)}%`,
            tone: r.empty > 0.02 ? 'warn' : 'neutral',
            sub: 'mẫu lạ — đáng điều tra',
          },
        ]}
      />

      <div className={`callout ${thieuPhuLopHiem ? 'co-warn' : 'co-pro'}`}>
        <Icon className="callout-icon" name={thieuPhuLopHiem ? 'siren' : 'shield'} size={18} />
        <div>
          <div className="callout-title">
            {thieuPhuLopHiem ? 'Phủ biên đang che mất lớp bạn quan tâm' : 'Lớp dương được phủ đúng mức đã đặt'}
          </div>
          <div className="callout-body">
            {thieuPhuLopHiem
              ? `Con số tổng ${(r.coverage * 100).toFixed(1)}% đạt mục tiêu, nhưng nó là trung bình có trọng số theo tần suất lớp, mà 95% dữ liệu là lớp âm. Riêng lớp dương chỉ được phủ ${(r.coveragePos * 100).toFixed(1)}%: cứ 100 mẫu độc hại thì khoảng ${Math.round(100 - r.coveragePos * 100)} mẫu có tập dự đoán KHÔNG chứa nhãn đúng. Bật conformal theo lớp để mỗi lớp có ngưỡng riêng.`
              : `Mỗi lớp có phân vị riêng nên bảo đảm áp dụng cho từng lớp, không chỉ cho số trung bình. Cái giá nằm ở ô "tập một nhãn": nó thấp hơn, tức ít mẫu tự động hoá được hơn. Đó là giá đúng của một bảo đảm trung thực.`}
          </div>
        </div>
      </div>
    </LabShell>
  );
}
