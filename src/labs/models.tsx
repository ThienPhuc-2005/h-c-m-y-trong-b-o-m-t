/**
 * Phòng lab về THUẬT TOÁN.
 * Mọi mô hình ở đây được cài đặt lại từ đầu bằng JavaScript, chạy ngay trong
 * trình duyệt của bạn — không có máy chủ, không có phép màu. Nhìn thấy một
 * thuật toán hội tụ từng bước dạy được nhiều hơn mười trang công thức.
 */

import { useMemo, useState, useEffect, useRef } from 'react';
import { LabShell, Slider, Readout, Chart, Axes, Line, Dots, mkPlot, px, py, COLORS, Bars, Reseed, useSeed } from './kit';
import { mulberry32, gaussian, sigmoid, clamp, shuffle } from '../lib/utils';

/* ========================================================================== */
/*  lab-logistic — Hồi quy logistic trên đặc trưng URL                         */
/* ========================================================================== */

interface Sample {
  x: number[];
  y: 0 | 1;
}

const URL_FEATURES = ['Độ dài URL', 'Số dấu chấm', 'Entropy tên miền', 'Tuổi tên miền (ngày)'];

function makeUrlData(seed: number, n = 220): Sample[] {
  const rng = mulberry32(seed);
  const out: Sample[] = [];
  for (let i = 0; i < n; i++) {
    const y: 0 | 1 = rng() < 0.4 ? 1 : 0;
    out.push({
      y,
      x: y
        ? [
            clamp(gaussian(rng, 0.72, 0.16), 0, 1),
            clamp(gaussian(rng, 0.66, 0.18), 0, 1),
            clamp(gaussian(rng, 0.74, 0.15), 0, 1),
            clamp(gaussian(rng, 0.12, 0.11), 0, 1),
          ]
        : [
            clamp(gaussian(rng, 0.34, 0.17), 0, 1),
            clamp(gaussian(rng, 0.3, 0.16), 0, 1),
            clamp(gaussian(rng, 0.36, 0.16), 0, 1),
            clamp(gaussian(rng, 0.68, 0.2), 0, 1),
          ],
    });
  }
  return out;
}

export function LabLogistic() {
  const [seed, reseed] = useSeed();
  const [lr, setLr] = useState(0.5);
  const [w, setW] = useState<number[]>([0, 0, 0, 0]);
  const [b, setB] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [running, setRunning] = useState(false);
  const data = useMemo(() => makeUrlData(seed), [seed]);
  const timer = useRef<number | null>(null);

  const reset = () => {
    setW([0, 0, 0, 0]);
    setB(0);
    setEpoch(0);
    setRunning(false);
  };
  useEffect(reset, [seed]);

  const stepOnce = (wIn: number[], bIn: number) => {
    const gw = [0, 0, 0, 0];
    let gb = 0;
    for (const s of data) {
      const z = s.x.reduce((acc, xi, i) => acc + xi * wIn[i], bIn);
      const err = sigmoid(z) - s.y;
      for (let i = 0; i < 4; i++) gw[i] += err * s.x[i];
      gb += err;
    }
    const m = data.length;
    return {
      w: wIn.map((wi, i) => wi - (lr * gw[i]) / m),
      b: bIn - (lr * gb) / m,
    };
  };

  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(() => {
      setW((cw) => {
        setB((cb) => stepOnce(cw, cb).b);
        return stepOnce(cw, b).w;
      });
      setEpoch((e) => {
        if (e >= 299) setRunning(false);
        return e + 1;
      });
    }, 40);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, lr, data, b]);

  const { loss, acc } = useMemo(() => {
    let l = 0;
    let c = 0;
    for (const s of data) {
      const z = s.x.reduce((a, xi, i) => a + xi * w[i], b);
      const p = clamp(sigmoid(z), 1e-9, 1 - 1e-9);
      l += -(s.y * Math.log(p) + (1 - s.y) * Math.log(1 - p));
      if ((p >= 0.5 ? 1 : 0) === s.y) c++;
    }
    return { loss: l / data.length, acc: c / data.length };
  }, [w, b, data]);

  const plot = mkPlot(440, 260, [0, 1], [0, 1], { l: 46, r: 14, t: 14, b: 38 });

  return (
    <LabShell
      id="lab-logistic"
      title="Huấn luyện hồi quy logistic trên đặc trưng URL"
      takeaway={
        <>
          Bấm Huấn luyện và nhìn các <b>trọng số</b> bò dần về giá trị hợp lý: entropy và số dấu chấm nhận
          trọng số dương (càng cao càng nghi ngờ), tuổi tên miền nhận trọng số âm (tên miền càng già càng
          đáng tin). Đó chính là "mô hình học được luật". Toàn bộ thuật toán chỉ là: đoán → đo sai số → dịch
          trọng số ngược hướng sai số → lặp lại. Đặt tốc độ học quá cao và xem nó nổ tung.
        </>
      }
    >
      <div className="grid grid-2">
        <div className="stack">
          <Slider label="Tốc độ học (learning rate)" value={lr} min={0.01} max={8} step={0.01} onChange={setLr} format={(v) => v.toFixed(2)} hint="Quá nhỏ: rất lâu. Quá lớn: dao động, không hội tụ." />
          <div className="row-wrap">
            <button className="btn btn-primary btn-sm" onClick={() => setRunning((r) => !r)}>
              {running ? '⏸ Tạm dừng' : '▶ Huấn luyện'}
            </button>
            <button className="btn btn-sm" onClick={() => { const r = stepOnce(w, b); setW(r.w); setB(r.b); setEpoch((e) => e + 1); }}>
              ⏭ Một bước
            </button>
            <button className="btn btn-sm" onClick={reset}>↺ Đặt lại</button>
            <Reseed onClick={reseed} />
          </div>
          <div>
            <div className="stat-k" style={{ marginBottom: 8 }}>Trọng số học được</div>
            <Bars
              color={COLORS.brand}
              height={130}
              data={URL_FEATURES.map((f, i) => ({ label: f, v: Math.abs(w[i]), color: w[i] >= 0 ? 'var(--bad)' : 'var(--ok)' }))}
              fmt={(v) => v.toFixed(2)}
            />
            <div className="faint center" style={{ marginTop: 6 }}>
              đỏ = đẩy về phía "độc hại" · xanh = đẩy về phía "lành tính"
            </div>
          </div>
        </div>
        <div className="stack">
          <Readout
            items={[
              { k: 'Vòng lặp', v: String(epoch) },
              { k: 'Hàm mất mát', v: loss.toFixed(4), tone: loss < 0.4 ? 'ok' : loss < 0.6 ? 'warn' : 'bad' },
              { k: 'Độ chính xác', v: `${(acc * 100).toFixed(1)}%`, tone: acc > 0.85 ? 'ok' : 'warn' },
              { k: 'Hệ số chặn', v: b.toFixed(2) },
            ]}
          />
          <Chart p={plot} label="Ranh giới quyết định trên hai đặc trưng đầu">
            <Axes p={plot} xLabel={URL_FEATURES[2]} yLabel={URL_FEATURES[1]} xTicks={4} yTicks={4} />
            {Math.abs(w[1]) > 1e-6 && (
              <Line
                p={plot}
                pts={[0, 1].map((xv) => {
                  // w2*x2 + w1*x1 + w0*mean + w3*mean + b = 0 (giữ hai đặc trưng còn lại ở 0,5)
                  const y = -(b + w[2] * xv + (w[0] + w[3]) * 0.5) / w[1];
                  return [xv, clamp(y, -0.2, 1.2)] as [number, number];
                })}
                color={COLORS.brand}
                width={2.6}
              />
            )}
            <Dots p={plot} pts={data.filter((d) => d.y === 0).map((d) => [d.x[2], d.x[1]] as [number, number])} color={COLORS.ok} r={3.5} />
            <Dots p={plot} pts={data.filter((d) => d.y === 1).map((d) => [d.x[2], d.x[1]] as [number, number])} color={COLORS.bad} r={3.5} shape="cross" />
          </Chart>
        </div>
      </div>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-naive-bayes — Bộ lọc thư rác                                           */
/* ========================================================================== */

const SPAM_CORPUS = [
  { t: 'khẩn cấp xác minh tài khoản ngân hàng của bạn ngay', y: 1 },
  { t: 'tài khoản của bạn sẽ bị khoá nhấp vào liên kết ngay', y: 1 },
  { t: 'chúc mừng bạn trúng thưởng nhấp vào đây nhận quà', y: 1 },
  { t: 'hoá đơn quá hạn thanh toán ngay tránh bị khoá', y: 1 },
  { t: 'phòng nhân sự yêu cầu cập nhật thông tin lương khẩn', y: 1 },
  { t: 'xác minh mật khẩu của bạn trong 24 giờ nếu không tài khoản bị xoá', y: 1 },
  { t: 'họp nhóm lúc 3 giờ chiều tại phòng họp lớn', y: 0 },
  { t: 'gửi bạn báo cáo tuần này nhé cảm ơn', y: 0 },
  { t: 'anh xem giúp em bản thiết kế mới nhất', y: 0 },
  { t: 'lịch nghỉ lễ của công ty đã được cập nhật', y: 0 },
  { t: 'nhắc lịch phỏng vấn ứng viên vào sáng thứ năm', y: 0 },
  { t: 'biên bản cuộc họp đã gửi trong tệp đính kèm', y: 0 },
];

export function LabNaiveBayes() {
  const [alpha, setAlpha] = useState(1);
  const [input, setInput] = useState('tài khoản của bạn bị khoá xác minh ngay');

  const model = useMemo(() => {
    const spam = new Map<string, number>();
    const ham = new Map<string, number>();
    let ns = 0;
    let nh = 0;
    let docS = 0;
    let docH = 0;
    for (const d of SPAM_CORPUS) {
      const ws = d.t.split(/\s+/);
      if (d.y) {
        docS++;
        ns += ws.length;
        ws.forEach((w) => spam.set(w, (spam.get(w) ?? 0) + 1));
      } else {
        docH++;
        nh += ws.length;
        ws.forEach((w) => ham.set(w, (ham.get(w) ?? 0) + 1));
      }
    }
    const vocab = new Set([...spam.keys(), ...ham.keys()]);
    return { spam, ham, ns, nh, docS, docH, V: vocab.size };
  }, []);

  const scored = useMemo(() => {
    const words = input.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let logS = Math.log(model.docS / SPAM_CORPUS.length);
    let logH = Math.log(model.docH / SPAM_CORPUS.length);
    const contrib: { w: string; d: number }[] = [];
    for (const w of words) {
      const ps = ((model.spam.get(w) ?? 0) + alpha) / (model.ns + alpha * model.V);
      const ph = ((model.ham.get(w) ?? 0) + alpha) / (model.nh + alpha * model.V);
      logS += Math.log(ps);
      logH += Math.log(ph);
      contrib.push({ w, d: Math.log(ps) - Math.log(ph) });
    }
    const m = Math.max(logS, logH);
    const p = Math.exp(logS - m) / (Math.exp(logS - m) + Math.exp(logH - m));
    return { p, contrib: contrib.sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 8) };
  }, [input, alpha, model]);

  return (
    <LabShell
      id="lab-naive-bayes"
      title="Bộ lọc thư rác Naive Bayes"
      takeaway={
        <>
          Naive Bayes giả định các từ độc lập với nhau — điều này <b>sai hiển nhiên</b> (từ "tài khoản" và
          "khoá" rõ ràng liên quan). Vậy mà nó vẫn hoạt động tốt, vì để phân loại đúng ta chỉ cần thứ tự xếp
          hạng đúng, không cần xác suất đúng. Thử gõ một từ chưa từng xuất hiện: nhờ <b>làm mượt Laplace</b>{' '}
          (α) mà xác suất không bị về 0 và cả câu không bị vô hiệu. Hạ α về 0 để thấy chuyện gì xảy ra.
        </>
      }
    >
      <div className="field">
        <label htmlFor="nb-in">
          <span>Thử một email</span>
          <var>{(scored.p * 100).toFixed(1)}% rác</var>
        </label>
        <textarea id="nb-in" value={input} onChange={(e) => setInput(e.target.value)} rows={2} style={{ fontFamily: 'var(--ff-sans)' }} />
      </div>
      <Slider label="Làm mượt Laplace (α)" value={alpha} min={0} max={3} step={0.05} onChange={setAlpha} format={(v) => v.toFixed(2)} hint="α = 0 nghĩa là một từ lạ sẽ khiến toàn bộ xác suất về 0." />

      <div className="bar bar-lg">
        <div className="bar-fill" style={{ width: `${scored.p * 100}%`, background: scored.p > 0.5 ? 'var(--bad)' : 'var(--ok)' }} />
      </div>
      <div className="row" style={{ justifyContent: 'space-between', fontSize: 'var(--fs-xs)' }}>
        <span className="chip chip-ok">bình thường</span>
        <span className={`chip ${scored.p > 0.5 ? 'chip-bad' : 'chip-ok'}`}>
          {scored.p > 0.5 ? '⚠ Xếp loại: THƯ RÁC' : '✓ Xếp loại: BÌNH THƯỜNG'}
        </span>
        <span className="chip chip-bad">thư rác</span>
      </div>

      <div>
        <div className="stat-k" style={{ marginBottom: 8 }}>Từ nào đẩy quyết định đi đâu</div>
        <div className="row-wrap">
          {scored.contrib.map((c, i) => (
            <span key={i} className={`chip ${c.d > 0.15 ? 'chip-bad' : c.d < -0.15 ? 'chip-ok' : ''}`}>
              {c.w} <b className="mono">{c.d > 0 ? '+' : ''}{c.d.toFixed(2)}</b>
            </span>
          ))}
        </div>
        <div className="faint" style={{ marginTop: 8 }}>
          Đây chính là "khả năng giải thích" mà cây tăng cường và mạng nơ-ron phải làm việc rất vất vả mới có được.
        </div>
      </div>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-tree — Cây quyết định & information gain                               */
/* ========================================================================== */

const TREE_ROWS = [
  { ent: 0.9, age: 5, dots: 4, y: 1 }, { ent: 0.85, age: 2, dots: 5, y: 1 },
  { ent: 0.8, age: 400, dots: 2, y: 0 }, { ent: 0.3, age: 900, dots: 1, y: 0 },
  { ent: 0.75, age: 10, dots: 3, y: 1 }, { ent: 0.4, age: 1200, dots: 2, y: 0 },
  { ent: 0.88, age: 1, dots: 6, y: 1 }, { ent: 0.35, age: 700, dots: 2, y: 0 },
  { ent: 0.6, age: 30, dots: 3, y: 1 }, { ent: 0.45, age: 1500, dots: 1, y: 0 },
  { ent: 0.92, age: 3, dots: 5, y: 1 }, { ent: 0.28, age: 2000, dots: 2, y: 0 },
];

const entropyOf = (rows: typeof TREE_ROWS) => {
  if (!rows.length) return 0;
  const p = rows.filter((r) => r.y === 1).length / rows.length;
  if (p === 0 || p === 1) return 0;
  return -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
};

export function LabTree() {
  const [feature, setFeature] = useState<'ent' | 'age' | 'dots'>('ent');
  const ranges = { ent: [0.2, 1, 0.01], age: [0, 2100, 10], dots: [1, 7, 1] } as const;
  const [thr, setThr] = useState(0.65);

  useEffect(() => {
    setThr(feature === 'ent' ? 0.65 : feature === 'age' ? 100 : 3);
  }, [feature]);

  const left = TREE_ROWS.filter((r) => r[feature] <= thr);
  const right = TREE_ROWS.filter((r) => r[feature] > thr);
  const H = entropyOf(TREE_ROWS);
  const gain = H - (left.length / TREE_ROWS.length) * entropyOf(left) - (right.length / TREE_ROWS.length) * entropyOf(right);

  const best = useMemo(() => {
    let bg = -1;
    let bf: 'ent' | 'age' | 'dots' = 'ent';
    let bt = 0;
    for (const f of ['ent', 'age', 'dots'] as const) {
      const vals = [...new Set(TREE_ROWS.map((r) => r[f]))].sort((a, b) => a - b);
      for (let i = 0; i < vals.length - 1; i++) {
        const t = (vals[i] + vals[i + 1]) / 2;
        const l = TREE_ROWS.filter((r) => r[f] <= t);
        const rr = TREE_ROWS.filter((r) => r[f] > t);
        const g = H - (l.length / TREE_ROWS.length) * entropyOf(l) - (rr.length / TREE_ROWS.length) * entropyOf(rr);
        if (g > bg) { bg = g; bf = f; bt = t; }
      }
    }
    return { gain: bg, feature: bf, thr: bt };
  }, [H]);

  const NAMES = { ent: 'Entropy tên miền', age: 'Tuổi tên miền (ngày)', dots: 'Số dấu chấm' };
  const Node = ({ rows, label }: { rows: typeof TREE_ROWS; label: string }) => {
    const pos = rows.filter((r) => r.y === 1).length;
    const pure = pos === 0 || pos === rows.length;
    return (
      <div className="card" style={{ padding: 'var(--s-3)', borderColor: pure ? 'var(--ok-border)' : 'var(--border)', background: pure ? 'var(--ok-soft)' : undefined }}>
        <div className="stat-k">{label}</div>
        <div className="row" style={{ marginTop: 6, gap: 4 }}>
          <span className="chip chip-bad">{pos} độc</span>
          <span className="chip chip-ok">{rows.length - pos} lành</span>
        </div>
        <div className="faint" style={{ marginTop: 6 }}>Entropy: {entropyOf(rows).toFixed(3)} {pure && rows.length > 0 && '· lá thuần khiết ✓'}</div>
      </div>
    );
  };

  return (
    <LabShell
      id="lab-tree"
      title="Cây quyết định chọn câu hỏi như thế nào"
      takeaway={
        <>
          Cây không "thông minh" — nó chỉ thử <b>mọi đặc trưng ở mọi ngưỡng</b> rồi chọn phép chia làm giảm
          entropy nhiều nhất. Đó là toàn bộ thuật toán. Hãy tìm phép chia thủ công tốt nhất của bạn rồi so với
          đáp án máy tìm được. Điểm mạnh: mỗi nhánh là một câu tiếng Việt bạn đọc được cho analyst nghe. Điểm
          yếu: một cây đủ sâu sẽ ghi nhớ từng mẫu — đó là quá khớp, và là lý do ta cần rừng.
        </>
      }
    >
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor="tf"><span>Chia theo đặc trưng nào</span></label>
          <select id="tf" value={feature} onChange={(e) => setFeature(e.target.value as typeof feature)}>
            <option value="ent">Entropy tên miền</option>
            <option value="age">Tuổi tên miền (ngày)</option>
            <option value="dots">Số dấu chấm</option>
          </select>
        </div>
        <Slider
          label="Ngưỡng chia"
          value={thr}
          min={ranges[feature][0]}
          max={ranges[feature][1]}
          step={ranges[feature][2]}
          onChange={setThr}
          format={(v) => (feature === 'ent' ? v.toFixed(2) : String(Math.round(v)))}
        />
      </div>

      <Node rows={TREE_ROWS} label={`Gốc — 12 mẫu · ${NAMES[feature]} ≤ ${feature === 'ent' ? thr.toFixed(2) : Math.round(thr)}?`} />
      <div className="grid grid-2">
        <Node rows={left} label={`◀ Nhánh trái (${left.length} mẫu)`} />
        <Node rows={right} label={`Nhánh phải (${right.length} mẫu) ▶`} />
      </div>

      <Readout
        items={[
          { k: 'Entropy gốc', v: H.toFixed(3) },
          { k: 'Độ lợi thông tin', v: gain.toFixed(3), tone: gain > best.gain - 0.02 ? 'ok' : gain > 0.3 ? 'warn' : 'bad' },
          { k: 'Tốt nhất máy tìm được', v: best.gain.toFixed(3), tone: 'info', sub: `${NAMES[best.feature]} ≤ ${best.feature === 'ent' ? best.thr.toFixed(2) : Math.round(best.thr)}` },
        ]}
      />
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-knn — k-NN và ranh giới quyết định                                     */
/* ========================================================================== */

export function LabKnn() {
  const [k, setK] = useState(5);
  const [seed, reseed] = useSeed();
  const [noise, setNoise] = useState(0.16);

  const pts = useMemo(() => {
    const rng = mulberry32(seed);
    const out: { x: number; y: number; c: 0 | 1 }[] = [];
    for (let i = 0; i < 60; i++) {
      const c: 0 | 1 = i % 2 === 0 ? 0 : 1;
      out.push({
        x: clamp(gaussian(rng, c ? 0.66 : 0.34, noise), 0.02, 0.98),
        y: clamp(gaussian(rng, c ? 0.62 : 0.38, noise), 0.02, 0.98),
        c,
      });
    }
    return out;
  }, [seed, noise]);

  const grid = useMemo(() => {
    const N = 34;
    const cells: { x: number; y: number; c: number }[] = [];
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const gx = (i + 0.5) / N;
        const gy = (j + 0.5) / N;
        const near = pts
          .map((p) => ({ d: (p.x - gx) ** 2 + (p.y - gy) ** 2, c: p.c }))
          .sort((a, b) => a.d - b.d)
          .slice(0, k);
        cells.push({ x: gx, y: gy, c: near.filter((n) => n.c === 1).length / k });
      }
    }
    return cells;
  }, [pts, k]);

  const p = mkPlot(430, 330, [0, 1], [0, 1], { l: 40, r: 12, t: 12, b: 34 });
  const cw = (p.w - p.pad.l - p.pad.r) / 34;
  const ch = (p.h - p.pad.t - p.pad.b) / 34;

  return (
    <LabShell
      id="lab-knn"
      title="k-NN: hàng xóm quyết định bạn là ai"
      takeaway={
        <>
          k nhỏ (1–3) cho ranh giới răng cưa, bám sát từng điểm — đó là <b>quá khớp</b>, một điểm nhiễu cũng
          tạo ra một hòn đảo. k lớn làm ranh giới mượt nhưng bắt đầu bỏ qua cấu trúc thật. Đây là đánh đổi
          thiên lệch–phương sai hiện ra bằng hình ảnh. Lưu ý thực chiến: k-NN không huấn luyện gì cả nhưng
          mỗi lần dự đoán phải so với TOÀN BỘ dữ liệu — gần như không dùng được ở quy mô hàng triệu sự kiện/giây.
        </>
      }
    >
      <div className="grid grid-2">
        <Slider label="Số hàng xóm (k)" value={k} min={1} max={25} step={1} onChange={setK} />
        <Slider label="Độ nhiễu của dữ liệu" value={noise} min={0.06} max={0.3} step={0.01} onChange={setNoise} format={(v) => v.toFixed(2)} />
      </div>
      <Reseed onClick={reseed} />
      <Chart p={p} label="Ranh giới quyết định k-NN">
        {grid.map((g, i) => (
          <rect key={i} x={px(p, g.x) - cw / 2} y={py(p, g.y) - ch / 2} width={cw + 0.6} height={ch + 0.6}
            fill={g.c > 0.5 ? COLORS.bad : COLORS.ok} opacity={0.06 + Math.abs(g.c - 0.5) * 0.34} />
        ))}
        <Axes p={p} xLabel="Đặc trưng 1" yLabel="Đặc trưng 2" xTicks={4} yTicks={4} />
        <Dots p={p} pts={pts.filter((q) => q.c === 0).map((q) => [q.x, q.y] as [number, number])} color={COLORS.ok} r={4.5} />
        <Dots p={p} pts={pts.filter((q) => q.c === 1).map((q) => [q.x, q.y] as [number, number])} color={COLORS.bad} r={4.5} shape="cross" />
      </Chart>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-overfit — Quá khớp                                                     */
/* ========================================================================== */

export function LabOverfit() {
  const [degree, setDegree] = useState(3);
  const [seed, reseed] = useSeed();
  const [nPoints, setNPoints] = useState(14);

  const { train, test } = useMemo(() => {
    const rng = mulberry32(seed);
    const f = (x: number) => 0.5 + 0.36 * Math.sin(x * 5.2) - 0.1 * x;
    const mk = (n: number, s: number) =>
      Array.from({ length: n }, (_, i) => {
        const x = (i + 0.5) / n;
        return { x, y: clamp(f(x) + gaussian(rng, 0, s), 0, 1) };
      });
    return { train: mk(nPoints, 0.07), test: mk(40, 0.07) };
  }, [seed, nPoints]);

  const coef = useMemo(() => {
    // Bình phương tối thiểu bằng khử Gauss trên ma trận Vandermonde.
    const d = degree;
    const A: number[][] = Array.from({ length: d + 1 }, () => new Array(d + 2).fill(0));
    for (let i = 0; i <= d; i++) {
      for (let j = 0; j <= d; j++) A[i][j] = train.reduce((s, p) => s + Math.pow(p.x, i + j), 0);
      A[i][d + 1] = train.reduce((s, p) => s + p.y * Math.pow(p.x, i), 0);
    }
    for (let i = 0; i <= d; i++) {
      let piv = i;
      for (let r = i + 1; r <= d; r++) if (Math.abs(A[r][i]) > Math.abs(A[piv][i])) piv = r;
      [A[i], A[piv]] = [A[piv], A[i]];
      if (Math.abs(A[i][i]) < 1e-12) continue;
      for (let r = 0; r <= d; r++) {
        if (r === i) continue;
        const f = A[r][i] / A[i][i];
        for (let c = i; c <= d + 1; c++) A[r][c] -= f * A[i][c];
      }
    }
    return Array.from({ length: d + 1 }, (_, i) => (Math.abs(A[i][i]) < 1e-12 ? 0 : A[i][d + 1] / A[i][i]));
  }, [train, degree]);

  const predict = (x: number) => coef.reduce((s, c, i) => s + c * Math.pow(x, i), 0);
  const rmse = (set: { x: number; y: number }[]) =>
    Math.sqrt(set.reduce((s, p) => s + (predict(p.x) - p.y) ** 2, 0) / set.length);

  const p = mkPlot(460, 300, [0, 1], [-0.15, 1.15], { l: 44, r: 14, t: 14, b: 36 });
  const curve: [number, number][] = Array.from({ length: 160 }, (_, i) => {
    const x = i / 159;
    return [x, clamp(predict(x), -0.2, 1.2)];
  });
  const trainErr = rmse(train);
  const testErr = rmse(test);

  return (
    <LabShell
      id="lab-overfit"
      title="Quá khớp hiện ra trước mắt bạn"
      takeaway={
        <>
          Tăng bậc đa thức: lỗi trên tập <b>huấn luyện</b> giảm mãi (đường xanh), nhưng lỗi trên dữ liệu{' '}
          <b>mới</b> chạm đáy rồi bật lên (đường đỏ). Mô hình bắt đầu học thuộc nhiễu. Trong bảo mật, "nhiễu"
          chính là những đặc thù riêng của tập mẫu bạn thu thập — packer, nguồn tải, khoảng thời gian. Đây là
          lý do <b>một mô hình đạt 100% trên tập huấn luyện là tin xấu, không phải tin tốt</b>. Thử giảm số
          điểm dữ liệu xuống 8 để thấy dữ liệu ít làm chuyện này tệ đi nhanh thế nào.
        </>
      }
    >
      <div className="grid grid-2">
        <Slider label="Độ phức tạp (bậc đa thức)" value={degree} min={1} max={14} step={1} onChange={setDegree} />
        <Slider label="Số điểm dữ liệu huấn luyện" value={nPoints} min={6} max={40} step={1} onChange={setNPoints} />
      </div>
      <Reseed onClick={reseed} />
      <Chart p={p} label="Đường khớp và dữ liệu">
        <Axes p={p} xLabel="Đặc trưng" yLabel="Nhãn" xTicks={4} yTicks={4} />
        <Line p={p} pts={curve} color={COLORS.brand} width={2.6} />
        <Dots p={p} pts={test.map((d) => [d.x, d.y] as [number, number])} color={COLORS.bad} r={3} />
        <Dots p={p} pts={train.map((d) => [d.x, d.y] as [number, number])} color={COLORS.info} r={5} />
      </Chart>
      <Readout
        items={[
          { k: 'Lỗi trên tập huấn luyện', v: trainErr.toFixed(4), tone: 'info' },
          { k: 'Lỗi trên dữ liệu mới', v: testErr.toFixed(4), tone: testErr > trainErr * 2.2 ? 'bad' : testErr > trainErr * 1.5 ? 'warn' : 'ok' },
          { k: 'Chênh lệch', v: `${(testErr / Math.max(trainErr, 1e-6)).toFixed(1)}×`, tone: testErr / Math.max(trainErr, 1e-6) > 2.2 ? 'bad' : 'ok', sub: 'trên 2× là dấu hiệu quá khớp' },
        ]}
      />
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-gradient — Hạ gradient                                                 */
/* ========================================================================== */

export function LabGradient() {
  const [lr, setLr] = useState(0.12);
  const [start, setStart] = useState(0.12);
  const [steps, setSteps] = useState(18);

  const f = (x: number) => 0.55 + 0.35 * Math.sin(6.1 * x) - 0.42 * x + 0.42 * x * x;
  const df = (x: number) => 0.35 * 6.1 * Math.cos(6.1 * x) - 0.42 + 0.84 * x;

  const path = useMemo(() => {
    const out: [number, number][] = [];
    let x = start;
    for (let i = 0; i < steps; i++) {
      out.push([x, f(x)]);
      x = clamp(x - lr * df(x), -0.05, 1.05);
    }
    out.push([x, f(x)]);
    return out;
  }, [lr, start, steps]);

  const p = mkPlot(460, 280, [0, 1], [0, 1.1], { l: 44, r: 14, t: 14, b: 36 });
  const curve: [number, number][] = Array.from({ length: 200 }, (_, i) => [i / 199, f(i / 199)]);
  const final = path[path.length - 1];
  const diverged = path.some(([, y]) => y > 1.05) || Math.abs(final[1] - path[path.length - 2][1]) > 0.08;

  return (
    <LabShell
      id="lab-gradient"
      title="Hạ gradient: đi xuống dốc trong sương mù"
      takeaway={
        <>
          Thuật toán chỉ biết <b>độ dốc ngay dưới chân</b>, không nhìn thấy toàn cảnh. Vì thế: tốc độ học quá
          nhỏ thì bò mãi không tới; quá lớn thì nhảy qua đáy và bật lên bật xuống (thử lr trên 0,4). Điểm khởi
          đầu khác nhau dẫn tới <b>cực tiểu địa phương</b> khác nhau — đây là lý do huấn luyện hai lần cho hai
          mô hình không giống nhau, và là lý do người ta phải chạy nhiều lần rồi chọn.
        </>
      }
    >
      <div className="grid grid-3">
        <Slider label="Tốc độ học" value={lr} min={0.005} max={0.6} step={0.005} onChange={setLr} format={(v) => v.toFixed(3)} />
        <Slider label="Điểm khởi đầu" value={start} min={0.02} max={0.98} step={0.01} onChange={setStart} format={(v) => v.toFixed(2)} />
        <Slider label="Số bước" value={steps} min={1} max={80} step={1} onChange={setSteps} />
      </div>
      <Chart p={p} label="Đường đi của hạ gradient trên mặt lỗi">
        <Axes p={p} xLabel="Tham số" yLabel="Hàm mất mát" xTicks={4} yTicks={4} />
        <Line p={p} pts={curve} color="var(--border-strong)" width={2.4} />
        <Line p={p} pts={path} color={diverged ? COLORS.bad : COLORS.brand} width={1.6} dash="3 3" />
        <Dots p={p} pts={path} color={diverged ? COLORS.bad : COLORS.brand} r={4} />
        <Dots p={p} pts={[final]} color={COLORS.ok} r={7} />
      </Chart>
      <Readout
        items={[
          { k: 'Vị trí cuối', v: final[0].toFixed(3) },
          { k: 'Mất mát cuối', v: final[1].toFixed(4), tone: final[1] < 0.25 ? 'ok' : final[1] < 0.5 ? 'warn' : 'bad' },
          { k: 'Trạng thái', v: diverged ? 'Phân kỳ ✗' : 'Hội tụ ✓', tone: diverged ? 'bad' : 'ok' },
        ]}
      />
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-perceptron — XOR và vì sao cần lớp ẩn                                  */
/* ========================================================================== */

export function LabPerceptron() {
  const [hidden, setHidden] = useState(0);
  const [epochs, setEpochs] = useState(0);
  const [problem, setProblem] = useState<'and' | 'xor'>('xor');

  const data = useMemo(() => {
    const base = [
      [0, 0], [0, 1], [1, 0], [1, 1],
    ];
    const label = (a: number, b: number) => (problem === 'and' ? (a && b ? 1 : 0) : a !== b ? 1 : 0);
    return base.map(([a, b]) => ({ x: [a, b], y: label(a, b) }));
  }, [problem]);

  const model = useMemo(() => {
    const rng = mulberry32(7);
    const H = Math.max(hidden, 0);
    let W1 = Array.from({ length: Math.max(H, 1) }, () => [rng() * 2 - 1, rng() * 2 - 1]);
    let b1 = Array.from({ length: Math.max(H, 1) }, () => rng() * 2 - 1);
    let W2 = Array.from({ length: H || 2 }, () => rng() * 2 - 1);
    let b2 = rng() * 2 - 1;
    const lr = 0.6;

    for (let e = 0; e < epochs; e++) {
      for (const s of shuffle(data, mulberry32(e + 1))) {
        if (H === 0) {
          const z = s.x[0] * W2[0] + s.x[1] * W2[1] + b2;
          const o = sigmoid(z);
          const d = o - s.y;
          W2 = [W2[0] - lr * d * s.x[0], W2[1] - lr * d * s.x[1]];
          b2 -= lr * d;
        } else {
          const h = W1.map((w, i) => sigmoid(w[0] * s.x[0] + w[1] * s.x[1] + b1[i]));
          const o = sigmoid(h.reduce((a, hi, i) => a + hi * W2[i], b2));
          const d2 = o - s.y;
          const dh = W2.map((w, i) => d2 * w * h[i] * (1 - h[i]));
          W2 = W2.map((w, i) => w - lr * d2 * h[i]);
          b2 -= lr * d2;
          W1 = W1.map((w, i) => [w[0] - lr * dh[i] * s.x[0], w[1] - lr * dh[i] * s.x[1]]);
          b1 = b1.map((bb, i) => bb - lr * dh[i]);
        }
      }
    }
    const predict = (x: number[]) => {
      if (H === 0) return sigmoid(x[0] * W2[0] + x[1] * W2[1] + b2);
      const h = W1.map((w, i) => sigmoid(w[0] * x[0] + w[1] * x[1] + b1[i]));
      return sigmoid(h.reduce((a, hi, i) => a + hi * W2[i], b2));
    };
    return { predict };
  }, [hidden, epochs, data]);

  const grid = useMemo(() => {
    const N = 30;
    const cells: [number, number, number][] = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const x = i / (N - 1);
      const y = j / (N - 1);
      cells.push([x, y, model.predict([x, y])]);
    }
    return cells;
  }, [model]);

  const acc = data.filter((d) => (model.predict(d.x) >= 0.5 ? 1 : 0) === d.y).length / data.length;
  const p = mkPlot(360, 320, [-0.08, 1.08], [-0.08, 1.08], { l: 38, r: 12, t: 12, b: 34 });
  const cw = (p.w - p.pad.l - p.pad.r) / 30;

  return (
    <LabShell
      id="lab-perceptron"
      title="XOR — bài toán giết chết trí tuệ nhân tạo suốt 17 năm"
      takeaway={
        <>
          Đặt số nơ-ron ẩn về <b>0</b> (perceptron đơn) và chọn bài toán XOR: dù huấn luyện bao lâu cũng chỉ
          đạt 50–75%, vì một đường thẳng không tách được XOR. Thêm <b>2 nơ-ron ẩn</b> và nó giải được ngay.
          Đây chính xác là lý do "học sâu" tồn tại: các lớp ẩn dựng nên những đặc trưng phi tuyến mà bạn không
          phải tự nghĩ ra. Trong bảo mật, "XOR" là những mẫu kiểu <em>"đăng nhập lúc 3 giờ sáng thì bình
          thường với đội vận hành nhưng bất thường với kế toán"</em> — không đặc trưng đơn lẻ nào bắt được.
        </>
      }
    >
      <div className="grid grid-3">
        <div className="field">
          <label htmlFor="pp"><span>Bài toán</span></label>
          <select id="pp" value={problem} onChange={(e) => { setProblem(e.target.value as 'and' | 'xor'); setEpochs(0); }}>
            <option value="and">AND (tách được bằng đường thẳng)</option>
            <option value="xor">XOR (không tách được)</option>
          </select>
        </div>
        <Slider label="Số nơ-ron lớp ẩn" value={hidden} min={0} max={6} step={1} onChange={(v) => { setHidden(v); setEpochs(0); }} format={(v) => (v === 0 ? 'không có lớp ẩn' : String(v))} />
        <Slider label="Số vòng huấn luyện" value={epochs} min={0} max={3000} step={50} onChange={setEpochs} />
      </div>
      <div className="grid grid-2">
        <Chart p={p} label="Ranh giới quyết định">
          {grid.map(([x, y, v], i) => (
            <rect key={i} x={px(p, x) - cw / 2} y={py(p, y) - cw / 2} width={cw + 0.8} height={cw + 0.8}
              fill={v > 0.5 ? COLORS.bad : COLORS.ok} opacity={0.08 + Math.abs(v - 0.5) * 0.5} />
          ))}
          <Axes p={p} xLabel="x₁" yLabel="x₂" xTicks={2} yTicks={2} />
          {data.map((d, i) => (
            <g key={i}>
              <circle cx={px(p, d.x[0])} cy={py(p, d.x[1])} r={11} fill={d.y ? COLORS.bad : COLORS.ok} stroke="var(--bg-elev)" strokeWidth={2.5} />
              <text x={px(p, d.x[0])} y={py(p, d.x[1]) + 4} textAnchor="middle" style={{ fontSize: 11, fill: '#fff', fontWeight: 700 }}>{d.y}</text>
            </g>
          ))}
        </Chart>
        <div className="stack">
          <Readout
            items={[
              { k: 'Độ chính xác', v: `${(acc * 100).toFixed(0)}%`, tone: acc === 1 ? 'ok' : acc >= 0.75 ? 'warn' : 'bad' },
              { k: 'Kiến trúc', v: hidden === 0 ? '2 → 1' : `2 → ${hidden} → 1` },
            ]}
          />
          <div className={`callout ${acc === 1 ? 'co-pro' : 'co-pitfall'}`}>
            <span className="callout-icon" aria-hidden>{acc === 1 ? '✓' : '⚠'}</span>
            <div className="callout-body">
              {hidden === 0 && problem === 'xor'
                ? 'Không lớp ẩn + XOR = bất khả thi. Đây là kết luận toán học của Minsky & Papert (1969) từng khiến ngành AI đóng băng gần hai thập kỷ.'
                : acc === 1
                  ? 'Giải xong. Lớp ẩn đã tự dựng ra các đặc trưng trung gian giúp bài toán trở nên tách được.'
                  : 'Chưa hội tụ — thử tăng số vòng huấn luyện.'}
            </div>
          </div>
        </div>
      </div>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-kmeans — Phân cụm hành vi                                              */
/* ========================================================================== */

export function LabKmeans() {
  const [k, setK] = useState(3);
  const [iters, setIters] = useState(8);
  const [seed, reseed] = useSeed();

  const pts = useMemo(() => {
    const rng = mulberry32(seed);
    const centers = [[0.25, 0.3], [0.7, 0.28], [0.5, 0.75]];
    const out: [number, number][] = [];
    centers.forEach((c, ci) => {
      for (let i = 0; i < (ci === 2 ? 22 : 34); i++)
        out.push([clamp(gaussian(rng, c[0], 0.09), 0, 1), clamp(gaussian(rng, c[1], 0.09), 0, 1)]);
    });
    // vài điểm ngoại lai — chính là thứ ta quan tâm trong bảo mật
    for (let i = 0; i < 5; i++) out.push([clamp(rng(), 0, 1), clamp(rng(), 0, 1)]);
    return out;
  }, [seed]);

  const { cents, assign } = useMemo(() => {
    const rng = mulberry32(seed + 1);
    let cents: [number, number][] = Array.from({ length: k }, () => [rng(), rng()]);
    let assign = new Array(pts.length).fill(0);
    for (let it = 0; it < iters; it++) {
      assign = pts.map((p) => {
        let bi = 0;
        let bd = Infinity;
        cents.forEach((c, i) => {
          const d = (c[0] - p[0]) ** 2 + (c[1] - p[1]) ** 2;
          if (d < bd) { bd = d; bi = i; }
        });
        return bi;
      });
      cents = cents.map((c, i) => {
        const mem = pts.filter((_, j) => assign[j] === i);
        if (!mem.length) return c;
        return [mem.reduce((s, m) => s + m[0], 0) / mem.length, mem.reduce((s, m) => s + m[1], 0) / mem.length];
      });
    }
    return { cents, assign };
  }, [pts, k, iters, seed]);

  const dists = pts.map((p, i) => Math.hypot(p[0] - cents[assign[i]][0], p[1] - cents[assign[i]][1]));
  const cutoff = [...dists].sort((a, b) => a - b)[Math.floor(dists.length * 0.94)];
  const palette = [COLORS.info, COLORS.lab, COLORS.warn, COLORS.ok, COLORS.brand, COLORS.bad];
  const p = mkPlot(430, 330, [0, 1], [0, 1], { l: 40, r: 12, t: 12, b: 34 });

  return (
    <LabShell
      id="lab-kmeans"
      title="k-means: nhóm hành vi và tìm kẻ lạc loài"
      takeaway={
        <>
          k-means không biết gì về tấn công — nó chỉ nhóm những thứ giống nhau. Giá trị bảo mật đến từ hai
          chỗ: <b>(1)</b> các cụm cho bạn "chân dung hành vi" để đặt tên và hiểu môi trường; <b>(2)</b> điểm ở
          xa mọi tâm cụm (vòng đỏ) là ứng viên điều tra. Nhưng nhớ: <b>xa ≠ độc hại</b>. Một máy chủ backup
          mới cài cũng nằm rất xa. k-means cũng buộc bạn chọn k trước, và giả định cụm hình cầu — hai giả định
          thường sai với dữ liệu bảo mật thật.
        </>
      }
    >
      <div className="grid grid-2">
        <Slider label="Số cụm (k)" value={k} min={1} max={6} step={1} onChange={setK} />
        <Slider label="Số vòng lặp" value={iters} min={1} max={25} step={1} onChange={setIters} />
      </div>
      <Reseed onClick={reseed} />
      <Chart p={p} label="Phân cụm k-means">
        <Axes p={p} xLabel="Số byte gửi đi (chuẩn hoá)" yLabel="Số kết nối (chuẩn hoá)" xTicks={4} yTicks={4} />
        {pts.map((pt, i) => (
          <g key={i}>
            {dists[i] >= cutoff && <circle cx={px(p, pt[0])} cy={py(p, pt[1])} r={10} fill="none" stroke={COLORS.bad} strokeWidth={2} strokeDasharray="3 2" />}
            <circle cx={px(p, pt[0])} cy={py(p, pt[1])} r={4} fill={palette[assign[i] % palette.length]} opacity={0.85} />
          </g>
        ))}
        {cents.map((c, i) => (
          <g key={i}>
            <path d={`M${px(p, c[0]) - 8} ${py(p, c[1])} h16 M${px(p, c[0])} ${py(p, c[1]) - 8} v16`} stroke={palette[i % palette.length]} strokeWidth={3} />
          </g>
        ))}
      </Chart>
      <div className="faint center">Vòng đứt đỏ = 6% điểm xa tâm cụm nhất → hàng đợi điều tra của bạn</div>
    </LabShell>
  );
}
