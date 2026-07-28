/**
 * Phòng lab về THUẬT TOÁN.
 * Mọi mô hình ở đây được cài đặt lại từ đầu bằng JavaScript, chạy ngay trong
 * trình duyệt của bạn — không có máy chủ, không có phép màu. Nhìn thấy một
 * thuật toán hội tụ từng bước dạy được nhiều hơn mười trang công thức.
 */

import { useMemo, useState, useEffect, useRef } from 'react';
import { LabShell, Slider, Readout, Chart, Axes, Line, Dots, mkPlot, px, py, COLORS, Bars, Reseed, useSeed } from './kit';
import { mulberry32, gaussian, sigmoid, clamp, shuffle, fmtNum } from '../lib/utils';
import { Icon } from '../components/Icon';

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
  // Trọng số, hệ số chặn và số vòng lặp nằm chung MỘT state: nếu tách rời,
  // vòng huấn luyện sẽ đọc phải giá trị cũ của biến kia và tính sai gradient.
  const [model, setModel] = useState({ w: [0, 0, 0, 0], b: 0, epoch: 0 });
  const [running, setRunning] = useState(false);
  const data = useMemo(() => makeUrlData(seed), [seed]);
  const timer = useRef<number | null>(null);
  const { w, b, epoch } = model;

  const reset = () => {
    setModel({ w: [0, 0, 0, 0], b: 0, epoch: 0 });
    setRunning(false);
  };
  useEffect(reset, [seed]);

  /** Một bước gradient descent trên toàn bộ tập (batch gradient descent). */
  const stepOnce = (m: { w: number[]; b: number; epoch: number }, rate: number) => {
    const gw = [0, 0, 0, 0];
    let gb = 0;
    for (const s of data) {
      const z = s.x.reduce((acc, xi, i) => acc + xi * m.w[i], m.b);
      const err = sigmoid(z) - s.y;
      for (let i = 0; i < 4; i++) gw[i] += err * s.x[i];
      gb += err;
    }
    const n = data.length;
    return {
      w: m.w.map((wi, i) => wi - (rate * gw[i]) / n),
      b: m.b - (rate * gb) / n,
      epoch: m.epoch + 1,
    };
  };

  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(() => {
      setModel((m) => {
        if (m.epoch >= 300) {
          setRunning(false);
          return m;
        }
        return stepOnce(m, lr);
      });
    }, 40);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, lr, data]);

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
              <Icon name={running ? 'pause' : 'play'} size={14} filled={!running} />
              {running ? 'Tạm dừng' : 'Huấn luyện'}
            </button>
            <button className="btn btn-sm" onClick={() => setModel((m) => stepOnce(m, lr))}>
              <Icon name="chevron-right" size={14} /> Một bước
            </button>
            <button className="btn btn-sm" onClick={reset}>
              <Icon name="rotate-ccw" size={14} /> Đặt lại
            </button>
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
          <Icon name={scored.p > 0.5 ? 'alert-triangle' : 'check'} size={12} />
          {scored.p > 0.5 ? 'Xếp loại: THƯ RÁC' : 'Xếp loại: BÌNH THƯỜNG'}
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
          Đây chính là "khả năng giải thích" mà gradient boosting và mạng nơ-ron phải làm việc rất vất vả mới có được.
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
        <div className="faint" style={{ marginTop: 6 }}>Entropy: {entropyOf(rows).toFixed(3)} {pure && rows.length > 0 && (
            <>
              · lá thuần khiết <Icon name="check" size={11} />
            </>
          )}</div>
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
          yếu: một cây đủ sâu sẽ ghi nhớ từng mẫu — đó là quá khớp, và là lý do ta cần Random Forest.
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

/**
 * Khớp đa thức bậc `degree` lên `nPoints` điểm nhiễu, rồi đo lỗi trên tập
 * huấn luyện và trên dữ liệu mới. Tách khỏi component để chốt hình chữ U mà
 * lời kết luận hứa: lỗi huấn luyện giảm đều, lỗi trên dữ liệu mới chạm đáy
 * rồi bật lên.
 */
export function overfitErrors(degree: number, nPoints: number, seed = 12345) {
  const rng = mulberry32(seed);
  const f = (x: number) => 0.5 + 0.36 * Math.sin(x * 5.2) - 0.1 * x;
  const mk = (n: number, s: number) =>
    Array.from({ length: n }, (_, i) => {
      const x = (i + 0.5) / n;
      return { x, y: clamp(f(x) + gaussian(rng, 0, s), 0, 1) };
    });
  const train = mk(nPoints, 0.07);
  const test = mk(40, 0.07);

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
      const fac = A[r][i] / A[i][i];
      for (let c = i; c <= d + 1; c++) A[r][c] -= fac * A[i][c];
    }
  }
  const coef = Array.from({ length: d + 1 }, (_, i) => (Math.abs(A[i][i]) < 1e-12 ? 0 : A[i][d + 1] / A[i][i]));
  const predict = (x: number) => coef.reduce((s, c, i) => s + c * Math.pow(x, i), 0);
  const rmse = (set: { x: number; y: number }[]) =>
    Math.sqrt(set.reduce((s, p) => s + (predict(p.x) - p.y) ** 2, 0) / set.length);

  return { train, test, coef, predict, trainErr: rmse(train), testErr: rmse(test) };
}

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
          Tăng bậc đa thức: lỗi trên tập <b>huấn luyện</b> giảm đều (đường xanh), nhưng lỗi trên dữ liệu{' '}
          <b>mới</b> chạm đáy rồi bật lên (đường đỏ). Mô hình bắt đầu học thuộc nhiễu. Trong bảo mật, "nhiễu"
          chính là những đặc thù riêng của tập mẫu bạn thu thập — packer, nguồn tải, khoảng thời gian. Đây là
          lý do <b>một mô hình đạt 100% trên tập huấn luyện là tin xấu, không phải tin tốt</b>. Thử giảm số
          điểm dữ liệu xuống 8 để thấy dữ liệu ít làm chuyện này tệ đi nhanh thế nào.
        </>
      }
    >
      <div className="grid grid-2">
        {/* Trần bậc 9, không phải 14. Lời giải dùng phương trình chuẩn trên cơ
            sở đơn thức, tạo ma trận kiểu Hilbert: từ bậc 12 trở lên số điều
            kiện vượt xa độ chính xác của số thực dấu phẩy động, và lỗi HUẤN
            LUYỆN bắt đầu TĂNG trở lại. Đó là nhiễu số học chứ không phải hiện
            tượng thống kê — mà lời kết luận thì lại đang dạy về thống kê. Hình
            chữ U vẫn hiện đủ rõ trong khoảng 1–9. */}
        <Slider label="Độ phức tạp (bậc đa thức)" value={degree} min={1} max={9} step={1} onChange={setDegree} />
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
/*  lab-gradient — Gradient descent                                                 */
/* ========================================================================== */

/** Mặt lỗi một chiều có nhiều cực tiểu địa phương. */
export const gradSurface = (x: number) => 0.55 + 0.35 * Math.sin(6.1 * x) - 0.42 * x + 0.42 * x * x;
const gradSlope = (x: number) => 0.35 * 6.1 * Math.cos(6.1 * x) - 0.42 + 0.84 * x;

/**
 * Đường đi của gradient descent. Tách khỏi component để chốt hai khẳng định trong
 * lời kết luận: tốc độ học trên 0,4 thì bật lên bật xuống, và điểm khởi đầu
 * khác nhau dẫn tới cực tiểu địa phương khác nhau.
 */
const GRAD_LO = -0.05;
const GRAD_HI = 1.05;

export type GradStatus = 'hoi-tu' | 'dao-dong' | 'ra-khoi-mien';

export function gradientPath(lr: number, start: number, steps: number) {
  const path: [number, number][] = [];
  let x = start;
  for (let i = 0; i < steps; i++) {
    path.push([x, gradSurface(x)]);
    x = clamp(x - lr * gradSlope(x), GRAD_LO, GRAD_HI);
  }
  path.push([x, gradSurface(x)]);
  const final = path[path.length - 1];

  /**
   * Ba trạng thái, không phải hai.
   *
   * Bản trước chỉ có cờ `diverged` và nó bỏ sót đúng trường hợp tệ nhất: với
   * tốc độ học lớn, bước nhảy vọt ra ngoài miền rồi bị `clamp` ghim vào mép.
   * Hai bước cuối khi đó bằng nhau nên phép kiểm cũ kết luận "hội tụ" — trong
   * khi thứ vừa xảy ra là trọng số nổ tung. Người học kéo tốc độ học lên hết cỡ
   * và được báo là mọi thứ vẫn ổn.
   */
  const chamMep = path.some(([xx]) => xx <= GRAD_LO + 1e-9 || xx >= GRAD_HI - 1e-9);
  let doiChieu = 0;
  for (let i = 2; i < path.length; i++) {
    const d1 = path[i - 1][0] - path[i - 2][0];
    const d2 = path[i][0] - path[i - 1][0];
    if (d1 * d2 < 0 && Math.abs(d2) > 0.02) doiChieu++;
  }
  const status: GradStatus = chamMep ? 'ra-khoi-mien' : doiChieu >= 3 ? 'dao-dong' : 'hoi-tu';
  return { path, final, status, chamMep, doiChieu, diverged: status !== 'hoi-tu' };
}

export function LabGradient() {
  const [lr, setLr] = useState(0.12);
  /**
   * Khởi đầu 0,5 chứ không phải 0,12. Từ 0,12 gradient đi thẳng sang trái, ra
   * khỏi miền vẽ rồi bị ghim vào mép — tức trạng thái mặc định của lab từng là
   * một ca hỏng, mà lại còn được báo là "Hội tụ". Từ 0,5 nó rơi vào một cực
   * tiểu địa phương thật, và kéo thanh trượt về 0,1 là thấy ngay cực tiểu khác.
   */
  const [start, setStart] = useState(0.5);
  const [steps, setSteps] = useState(18);

  const f = gradSurface;
  const { path } = useMemo(() => gradientPath(lr, start, steps), [lr, start, steps]);

  const p = mkPlot(460, 280, [0, 1], [0, 1.1], { l: 44, r: 14, t: 14, b: 36 });
  const curve: [number, number][] = Array.from({ length: 200 }, (_, i) => [i / 199, f(i / 199)]);
  const { final, status } = gradientPath(lr, start, steps);
  const diverged = status !== 'hoi-tu';

  return (
    <LabShell
      id="lab-gradient"
      title="Gradient descent: tốc độ học, cực tiểu địa phương và phân kỳ"
      takeaway={
        <>
          Thuật toán chỉ biết <b>độ dốc ngay dưới chân</b>, không nhìn thấy toàn cảnh. Ba chuyện xảy ra được,
          và ô &ldquo;Trạng thái&rdquo; gọi tên từng cái.
          <br />
          <br />
          Ở mặc định (lr 0,12, khởi đầu 0,5) nó <b>hội tụ</b> vào một cực tiểu địa phương tại x ≈ 0,76 với mất
          mát 0,124. Nhích tốc độ học lên <b>0,2</b> và nó chuyển sang <b>dao động</b>: nhảy qua đáy rồi bật
          lại, không đứng yên được. Từ <b>0,3 trở đi</b> thì bước nhảy vọt hẳn ra ngoài miền và bị ghim vào
          mép, mất mát mắc kẹt ở 0,467 — trong một mô hình thật, đó chính là lúc trọng số nổ tung thành{' '}
          <code>NaN</code>. Khoảng dùng được hẹp hơn nhiều so với cảm giác ban đầu.
          <br />
          <br />
          Còn điểm khởi đầu thì quyết định bạn rơi vào <b>đáy nào</b>: từ 0,5 và từ 0,9 đều về x ≈ 0,76 với
          mất mát 0,124, nhưng từ 0,1 thì gradient đi thẳng sang trái và trượt khỏi miền — cùng một thuật
          toán, cùng một tốc độ học, hai số phận khác hẳn. Đây là lý do huấn luyện hai lần cho hai mô hình
          không giống nhau, và là lý do người ta chạy nhiều lần rồi chọn.
        </>
      }
    >
      <div className="grid grid-3">
        <Slider label="Tốc độ học" value={lr} min={0.005} max={0.6} step={0.005} onChange={setLr} format={(v) => v.toFixed(3)} />
        <Slider label="Điểm khởi đầu" value={start} min={0.02} max={0.98} step={0.01} onChange={setStart} format={(v) => v.toFixed(2)} />
        <Slider label="Số bước" value={steps} min={1} max={80} step={1} onChange={setSteps} />
      </div>
      <Chart p={p} label="Đường đi của gradient descent trên mặt lỗi">
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
          {
            k: 'Trạng thái',
            v: status === 'hoi-tu' ? 'Hội tụ' : status === 'dao-dong' ? 'Dao động' : 'Chạy ra khỏi miền',
            tone: status === 'hoi-tu' ? 'ok' : 'bad',
            sub: status === 'ra-khoi-mien' ? 'tương đương trọng số nổ tung' : '',
          },
        ]}
      />
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-perceptron — XOR và vì sao cần lớp ẩn                                  */
/* ========================================================================== */

/** Bốn điểm của bài toán logic; nhãn tuỳ bài AND hay XOR. */
export function perceptronData(problem: 'and' | 'xor') {
  const base = [
    [0, 0], [0, 1], [1, 0], [1, 1],
  ];
  const label = (a: number, b: number) => (problem === 'and' ? (a && b ? 1 : 0) : a !== b ? 1 : 0);
  return base.map(([a, b]) => ({ x: [a, b], y: label(a, b) }));
}

/**
 * Huấn luyện lại TỪ ĐẦU với đúng (số nơ-ron ẩn, số vòng) được truyền vào.
 *
 * Không có trạng thái tăng dần ở đây — đó là lý do thanh trượt "số nơ-ron" KHÔNG
 * được reset số vòng về 0. Trước đây nó có reset, và hậu quả là người học làm
 * đúng hướng dẫn trong lời kết luận ("huấn luyện đủ lâu, rồi thêm 2 nơ-ron ẩn")
 * lại thấy độ chính xác đứng nguyên 50% — tức lab tự bác bỏ chính nó.
 */
export function trainPerceptron(hidden: number, epochs: number, problem: 'and' | 'xor') {
  const data = perceptronData(problem);
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
  const accuracy = data.filter((d) => (predict(d.x) >= 0.5 ? 1 : 0) === d.y).length / data.length;
  return { predict, accuracy, data };
}

export function LabPerceptron() {
  const [hidden, setHidden] = useState(0);
  const [epochs, setEpochs] = useState(0);
  const [problem, setProblem] = useState<'and' | 'xor'>('xor');

  const model = useMemo(() => trainPerceptron(hidden, epochs, problem), [hidden, epochs, problem]);
  const data = model.data;

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

  const acc = model.accuracy;
  const p = mkPlot(360, 320, [-0.08, 1.08], [-0.08, 1.08], { l: 38, r: 12, t: 12, b: 34 });
  const cw = (p.w - p.pad.l - p.pad.r) / 30;

  return (
    <LabShell
      id="lab-perceptron"
      title="XOR — bài toán giết chết trí tuệ nhân tạo suốt 17 năm"
      takeaway={
        <>
          Đặt số nơ-ron ẩn về <b>0</b> (perceptron đơn), chọn XOR và kéo số vòng huấn luyện lên hết cỡ: độ
          chính xác đứng nguyên <b>50%</b>, đúng bằng tung đồng xu. Ngay cả đường thẳng tốt nhất có thể cũng
          chỉ đúng 3 trên 4 điểm, và gradient descent trên log-loss thậm chí không tìm tới đó — nó dừng ở nghiệm
          đối xứng. Giờ thêm <b>2 nơ-ron ẩn</b> mà không đụng gì khác: 100% ngay lập tức.
          Đây chính xác là lý do "học sâu" tồn tại: các lớp ẩn dựng nên những đặc trưng phi tuyến mà bạn không
          phải tự nghĩ ra. Trong bảo mật, "XOR" là những mẫu kiểu <em>"đăng nhập lúc 3 giờ sáng thì bình
          thường với đội vận hành nhưng bất thường với kế toán"</em> — không đặc trưng đơn lẻ nào bắt được.
        </>
      }
    >
      <div className="grid grid-3">
        <div className="field">
          <label htmlFor="pp"><span>Bài toán</span></label>
          {/* Đổi bài toán hay đổi kiến trúc KHÔNG reset số vòng: mô hình vốn
              được huấn luyện lại từ đầu mỗi lần, nên reset chẳng phục vụ tính
              toán nào mà chỉ khiến thao tác lời kết luận hướng dẫn ra kết quả
              ngược. Ai muốn xem nó học dần thì đã có sẵn thanh trượt số vòng. */}
          <select id="pp" value={problem} onChange={(e) => setProblem(e.target.value as 'and' | 'xor')}>
            <option value="and">AND (tách được bằng đường thẳng)</option>
            <option value="xor">XOR (không tách được)</option>
          </select>
        </div>
        <Slider label="Số nơ-ron lớp ẩn" value={hidden} min={0} max={6} step={1} onChange={setHidden} format={(v) => (v === 0 ? 'không có lớp ẩn' : String(v))} />
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
              <text x={px(p, d.x[0])} y={py(p, d.x[1]) + 4} textAnchor="middle" style={{ fontSize: 12, fill: '#fff', fontWeight: 700 }}>{d.y}</text>
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
            <Icon className="callout-icon" name={acc === 1 ? 'check' : 'alert-triangle'} size={18} />
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
      title="k-means: nhóm hành vi và tìm điểm ngoại lai"
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
/* ========================================================================== */
/*  lab-explain — MDI nói dối, permutation thì không                           */
/* ========================================================================== */

export const EXPLAIN_FEATURES = [
  "Đăng nhập ngoài giờ",
  "Số lần thất bại trước đó",
  "Từ quốc gia lạ",
  "Thiết bị chưa từng thấy",
  "session_id",
] as const;

interface ExRow {
  x: number[];
  y: 0 | 1;
}
type ExNode = { leaf: number } | { f: number; t: number; l: ExNode; r: ExNode };

function exData(n: number, seed: number): ExRow[] {
  const rng = mulberry32(seed);
  const out: ExRow[] = [];
  for (let i = 0; i < n; i++) {
    const ngoaiGio = rng() < 0.25 ? 1 : 0;
    const thatBai = Math.floor(rng() * 6);
    const nuocLa = rng() < 0.12 ? 1 : 0;
    const thietBiMoi = rng() < 0.3 ? 1 : 0;
    // Luật SINH nhãn cố tình KHÔNG dùng session_id. Cột đó là rác thuần tuý,
    // lọt vào bộ đặc trưng do sơ suất — đúng tình huống bài t10-l4 mô tả.
    const z =
      1.6 * ngoaiGio + 0.5 * thatBai + 1.9 * nuocLa + 0.9 * thietBiMoi - 2.4;
    out.push({
      x: [ngoaiGio, thatBai, nuocLa, thietBiMoi, rng()],
      y: sigmoid(z) > rng() ? 1 : 0,
    });
  }
  return out;
}

const exGini = (rows: ExRow[]) => {
  if (!rows.length) return 0;
  const p = rows.filter((r) => r.y === 1).length / rows.length;
  return 2 * p * (1 - p);
};

function exTree(rows: ExRow[], depth: number, mdi: number[]): ExNode {
  if (depth === 0 || rows.length < 8 || exGini(rows) === 0) {
    return {
      leaf: rows.length
        ? rows.filter((r) => r.y === 1).length / rows.length
        : 0,
    };
  }
  let best: { g: number; f: number; t: number; L: ExRow[]; R: ExRow[] } | null =
    null;
  for (let f = 0; f < EXPLAIN_FEATURES.length; f++) {
    const vals = [...new Set(rows.map((r) => r.x[f]))].sort((a, b) => a - b);
    for (let i = 0; i < vals.length - 1; i++) {
      const t = (vals[i] + vals[i + 1]) / 2;
      const L = rows.filter((r) => r.x[f] <= t);
      const R = rows.filter((r) => r.x[f] > t);
      if (!L.length || !R.length) continue;
      const g =
        exGini(rows) -
        (L.length * exGini(L) + R.length * exGini(R)) / rows.length;
      if (!best || g > best.g) best = { g, f, t, L, R };
    }
  }
  if (!best)
    return { leaf: rows.filter((r) => r.y === 1).length / rows.length };
  // Mean decrease in impurity: cộng dồn mức giảm, có trọng số theo số mẫu.
  mdi[best.f] += best.g * rows.length;
  return {
    f: best.f,
    t: best.t,
    l: exTree(best.L, depth - 1, mdi),
    r: exTree(best.R, depth - 1, mdi),
  };
}

const exPredict = (n: ExNode, x: number[]): number =>
  "leaf" in n ? n.leaf : x[n.f] <= n.t ? exPredict(n.l, x) : exPredict(n.r, x);

export interface ExplainOut {
  mdi: number[];
  perm: number[];
  /** Hạng của cột rác theo từng cách đo; 1 là cao nhất. */
  rankMdi: number;
  rankPerm: number;
  accTrain: number;
  accTest: number;
  /** Đường đi của cây cho một cảnh báo cụ thể, đã dịch sang câu tiếng Việt. */
  reasons: string[];
  alertScore: number;
}

/** Chỉ số của cột rác trong bộ đặc trưng. */
export const JUNK = 4;

export function explainRun(depth: number): ExplainOut {
  const train = exData(600, 7);
  const test = exData(400, 99);
  const mdi = new Array(EXPLAIN_FEATURES.length).fill(0);
  const tree = exTree(train, depth, mdi);

  const acc = (rows: ExRow[]) =>
    rows.filter((r) => (exPredict(tree, r.x) >= 0.5 ? 1 : 0) === r.y).length /
    rows.length;
  const accTest = acc(test);

  // Permutation importance: xáo TỪNG cột trên tập kiểm thử rồi đo mức tụt.
  const perm = EXPLAIN_FEATURES.map((_, f) => {
    const rng = mulberry32(1000 + f);
    const shuffled = test.map((r) => ({ ...r, x: [...r.x] }));
    const col = shuffled.map((r) => r.x[f]).sort(() => rng() - 0.5);
    shuffled.forEach((r, i) => (r.x[f] = col[i]));
    return accTest - acc(shuffled);
  });

  const tot = mdi.reduce((a, b) => a + b, 0) || 1;
  const mdiNorm = mdi.map((v) => v / tot);
  const rankOf = (arr: number[], i: number) =>
    arr
      .map((v, k) => ({ v, k }))
      .sort((a, b) => b.v - a.v)
      .findIndex((o) => o.k === i) + 1;

  // Cảnh báo điểm cao nhất — đúng thứ analyst sẽ mở đầu tiên.
  let top = test[0];
  let topScore = -1;
  for (const r of test) {
    const s = exPredict(tree, r.x);
    if (s > topScore) {
      topScore = s;
      top = r;
    }
  }
  const reasons: string[] = [];
  let node: ExNode = tree;
  while (!("leaf" in node)) {
    const diTrai = top.x[node.f] <= node.t;
    const ten = EXPLAIN_FEATURES[node.f];
    if (node.f === JUNK)
      reasons.push(
        `${ten}: ${diTrai ? "dưới" : "trên"} ${node.t.toFixed(3)} — vô nghĩa`,
      );
    else if (node.f === 1) reasons.push(`${ten}: ${top.x[1]} lần`);
    else reasons.push(`${ten}: ${top.x[node.f] ? "có" : "không"}`);
    node = diTrai ? node.l : node.r;
  }

  return {
    mdi: mdiNorm,
    perm,
    rankMdi: rankOf(mdiNorm, JUNK),
    rankPerm: rankOf(perm, JUNK),
    accTrain: acc(train),
    accTest,
    reasons,
    alertScore: topScore,
  };
}

export function LabExplain() {
  const [depth, setDepth] = useState(8);
  const r = useMemo(() => explainRun(depth), [depth]);
  const racLenDau = r.rankMdi <= 2;

  return (
    <LabShell
      id="lab-explain"
      title="Cột rác đứng đầu bảng — vì sao feature importance mặc định nói dối"
      takeaway={
        <>
          Bộ đặc trưng có một cột <code>session_id</code> lọt vào do sơ suất:
          chuỗi ngẫu nhiên, không mang một bit thông tin nào về việc phiên đăng
          nhập có độc hại hay không. Luật sinh nhãn thậm chí không nhìn tới nó.
          <br />
          <br />Ở độ sâu mặc định 8, <b>MDI xếp nó hạng 1</b> với 0,371 — cao
          hơn mọi đặc trưng thật. Nếu bạn báo cáo &ldquo;đặc trưng quan trọng
          nhất&rdquo; bằng con số này, bạn đang trình bày một cột rác cho cả
          phòng nghe. Cùng lúc đó <b>permutation importance cho nó ≈ 0</b>: xáo
          trộn cả cột mà độ chính xác không nhúc nhích, tức mô hình chẳng dựa
          vào nó chút nào khi gặp dữ liệu mới.
          <br />
          <br />
          Kéo độ sâu xuống <b>3</b> và cột rác tụt về hạng 5 với MDI bằng 0. Cơ
          chế lộ ra ở đây: cây càng sâu càng phải tìm thêm chỗ cắt, mà một cột
          có 600 giá trị khác nhau thì luôn tìm được một lát cắt làm giảm
          impurity <em>trên tập huấn luyện</em>. Để ý hai ô độ chính xác khi
          kéo: trên tập huấn luyện nó tăng đều từ 71% lên 86%, còn trên dữ liệu
          mới thì đứng nguyên quanh 69%.{" "}
          <b>Thiên lệch của MDI chính là quá khớp nhìn từ một góc khác.</b>
        </>
      }
    >
      <Slider
        label="Độ sâu cây"
        value={depth}
        min={2}
        max={10}
        step={1}
        onChange={setDepth}
        format={(v) => `${v} tầng`}
        hint="Cây càng sâu càng có cơ hội cắt trúng một lát cắt may rủi trên cột rác."
      />

      <Readout
        items={[
          {
            k: "Hạng session_id theo MDI",
            v: `${r.rankMdi}/5`,
            tone: racLenDau ? "bad" : "ok",
            sub: `MDI = ${r.mdi[JUNK].toFixed(3)}`,
          },
          {
            k: "Hạng theo permutation",
            v: `${r.rankPerm}/5`,
            tone: r.rankPerm >= 4 ? "ok" : "warn",
            sub: `mức tụt = ${r.perm[JUNK].toFixed(3)}`,
          },
          {
            k: "Độ chính xác huấn luyện",
            v: `${(r.accTrain * 100).toFixed(1)}%`,
            tone: "info",
          },
          {
            k: "Độ chính xác dữ liệu mới",
            v: `${(r.accTest * 100).toFixed(1)}%`,
            tone: r.accTrain - r.accTest > 0.1 ? "bad" : "ok",
            sub: "không tăng theo độ sâu",
          },
        ]}
      />

      <div className="grid grid-2">
        <div>
          <div className="stat-k" style={{ marginBottom: 8 }}>
            MDI — mặc định của scikit-learn
          </div>
          <Bars
            color={COLORS.brand}
            data={EXPLAIN_FEATURES.map((f, i) => ({
              label: f,
              v: r.mdi[i],
              color: i === JUNK ? "var(--bad)" : "var(--brand)",
            }))}
            fmt={(v) => v.toFixed(3)}
          />
        </div>
        <div>
          <div className="stat-k" style={{ marginBottom: 8 }}>
            Permutation importance — đo trên dữ liệu mới
          </div>
          <Bars
            color={COLORS.ok}
            data={EXPLAIN_FEATURES.map((f, i) => ({
              label: f,
              v: Math.max(0, r.perm[i]),
              color: i === JUNK ? "var(--bad)" : "var(--ok)",
            }))}
            fmt={(v) => v.toFixed(3)}
          />
        </div>
      </div>

      <div className="panel">
        <div className="stat-k" style={{ marginBottom: 8 }}>
          Khối &ldquo;vì sao&rdquo; cho cảnh báo điểm cao nhất (
          {(r.alertScore * 100).toFixed(0)}%)
        </div>
        <ul
          style={{
            fontSize: "var(--fs-sm)",
            paddingLeft: "1.1em",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {r.reasons.map((s, i) => (
            <li
              key={i}
              style={
                s.includes("vô nghĩa")
                  ? { color: "var(--bad-text)" }
                  : undefined
              }
            >
              {s}
            </li>
          ))}
        </ul>
        <div className="faint" style={{ marginTop: 8 }}>
          Đây là đường đi thật của cây, dịch thành câu. Dòng đỏ là chỗ cây hỏi
          về cột rác — analyst đọc tới đó sẽ mất lòng tin vào cả khối giải
          thích, và họ có lý.
        </div>
      </div>
    </LabShell>
  );
}
/* ========================================================================== */
/*  lab-tabular — Random Forest so với mạng nơ-ron trên dữ liệu bảng                    */
/* ========================================================================== */

/** Rời rạc hoá đặc trưng liên tục thành 16 mức, đúng cách LightGBM làm. */
const TAB_BINS = 16;
const tabQuant = (v: number) => Math.round(v * (TAB_BINS - 1)) / (TAB_BINS - 1);

interface TabRow {
  x: number[];
  y: 0 | 1;
}

/**
 * Luật sinh nhãn: cộng tính có ngưỡng GÃY KHÚC và hai tương tác.
 * Đây là hình dạng đặc trưng của dữ liệu bảng trong bảo mật — "ngoài giờ VÀ từ
 * dải IP lạ" nguy hiểm hơn hẳn tổng hai yếu tố riêng lẻ.
 */
function tabTrueZ(x: number[]): number {
  let z = -2.2 + 1.7 * x[0] + 2.4 * x[2] + 1.1 * x[3];
  if (x[1] > 0.6) z += 1.8;
  if (x[4] > 0.75 && x[0] === 1) z += 2.0;
  if (x[6] > 0.6 && x[2] === 1) z += 1.6;
  return z;
}

function tabData(n: number, seed: number): TabRow[] {
  const rng = mulberry32(seed);
  const out: TabRow[] = [];
  for (let i = 0; i < n; i++) {
    const raw = [
      rng() < 0.25 ? 1 : 0,
      Math.floor(rng() * 8) / 8,
      rng() < 0.12 ? 1 : 0,
      rng() < 0.3 ? 1 : 0,
      rng(),
      rng(),
      Math.floor(rng() * 5) / 5,
      rng() < 0.08 ? 1 : 0,
    ];
    // Nhãn sinh từ giá trị GỐC rồi mới rời rạc hoá đặc trưng — nếu làm ngược
    // lại thì cả hai mô hình đều thấy một bài toán dễ hơn thực tế.
    out.push({
      x: raw.map(tabQuant),
      y: sigmoid(tabTrueZ(raw)) > rng() ? 1 : 0,
    });
  }
  return out;
}

const tabGini = (rows: TabRow[]) => {
  if (!rows.length) return 0;
  const p = rows.filter((r) => r.y === 1).length / rows.length;
  return 2 * p * (1 - p);
};

type TabNode =
  { leaf: number } | { f: number; t: number; l: TabNode; r: TabNode };

function tabTree(
  rows: TabRow[],
  depth: number,
  rng: () => number,
  mtry: number,
): TabNode {
  if (depth === 0 || rows.length < 6 || tabGini(rows) === 0) {
    return {
      leaf: rows.length
        ? rows.filter((r) => r.y === 1).length / rows.length
        : 0,
    };
  }
  const feats = [...Array(8).keys()].sort(() => rng() - 0.5).slice(0, mtry);
  let best: {
    g: number;
    f: number;
    t: number;
    L: TabRow[];
    R: TabRow[];
  } | null = null;
  for (const f of feats) {
    const vals = [...new Set(rows.map((r) => r.x[f]))].sort((a, b) => a - b);
    for (let i = 0; i < vals.length - 1; i++) {
      const t = (vals[i] + vals[i + 1]) / 2;
      const L = rows.filter((r) => r.x[f] <= t);
      const R = rows.filter((r) => r.x[f] > t);
      if (!L.length || !R.length) continue;
      const g =
        tabGini(rows) -
        (L.length * tabGini(L) + R.length * tabGini(R)) / rows.length;
      if (!best || g > best.g) best = { g, f, t, L, R };
    }
  }
  if (!best)
    return { leaf: rows.filter((r) => r.y === 1).length / rows.length };
  return {
    f: best.f,
    t: best.t,
    l: tabTree(best.L, depth - 1, rng, mtry),
    r: tabTree(best.R, depth - 1, rng, mtry),
  };
}

const tabPredict = (n: TabNode, x: number[]): number =>
  "leaf" in n
    ? n.leaf
    : x[n.f] <= n.t
      ? tabPredict(n.l, x)
      : tabPredict(n.r, x);

export interface TabularOut {
  /** Độ chính xác của Random Forest — KHÔNG có tinh chỉnh nào. */
  forest: number;
  mlp: number;
  /** Trần lý thuyết: dùng thẳng luật sinh nhãn. Nhiễu nhãn chặn mọi mô hình ở đây. */
  ceiling: number;
  gap: number;
}

export function tabularRun(
  n: number,
  hidden: number,
  lr: number,
  epochs: number,
): TabularOut {
  const train = tabData(n, 7);
  const test = tabData(1200, 999);
  const acc = (f: (x: number[]) => number) =>
    test.filter((r) => (f(r.x) >= 0.5 ? 1 : 0) === r.y).length / test.length;

  // --- Random Forest: 30 cây, sâu 6, mỗi nút xét 3 đặc trưng ngẫu nhiên ---
  const frng = mulberry32(3);
  const trees: TabNode[] = [];
  for (let k = 0; k < 30; k++) {
    const bag = Array.from(
      { length: train.length },
      () => train[Math.floor(frng() * train.length)],
    );
    trees.push(tabTree(bag, 6, frng, 3));
  }
  const forestFn = (x: number[]) =>
    trees.reduce((s, t) => s + tabPredict(t, x), 0) / trees.length;

  // --- MLP một lớp ẩn, ReLU, gradient descent theo từng mẫu ---
  const rng = mulberry32(11);
  let W1 = Array.from({ length: hidden }, () =>
    Array.from({ length: 8 }, () => (rng() * 2 - 1) * 0.7),
  );
  let b1 = Array.from({ length: hidden }, () => 0);
  let W2 = Array.from({ length: hidden }, () => (rng() * 2 - 1) * 0.7);
  let b2 = 0;
  for (let e = 0; e < epochs; e++) {
    const order = [...train.keys()].sort(() => rng() - 0.5);
    for (const i of order) {
      const s = train[i];
      const h = W1.map((w, k) =>
        Math.max(
          0,
          w.reduce((a, wi, j) => a + wi * s.x[j], b1[k]),
        ),
      );
      const o = sigmoid(h.reduce((a, hi, k) => a + hi * W2[k], b2));
      const d2 = o - s.y;
      const dh = W2.map((w, k) => (h[k] > 0 ? d2 * w : 0));
      W2 = W2.map((w, k) => w - lr * d2 * h[k]);
      b2 -= lr * d2;
      W1 = W1.map((w, k) => w.map((wi, j) => wi - lr * dh[k] * s.x[j]));
      b1 = b1.map((bb, k) => bb - lr * dh[k]);
    }
  }
  const mlpFn = (x: number[]) => {
    const h = W1.map((w, k) =>
      Math.max(
        0,
        w.reduce((a, wi, j) => a + wi * x[j], b1[k]),
      ),
    );
    return sigmoid(h.reduce((a, hi, k) => a + hi * W2[k], b2));
  };

  const forest = acc(forestFn);
  const mlp = acc(mlpFn);
  return {
    forest,
    mlp,
    ceiling: acc((x) => sigmoid(tabTrueZ(x))),
    gap: forest - mlp,
  };
}

export function LabTabular() {
  const [n, setN] = useState(1200);
  const [hidden, setHidden] = useState(16);
  const [lr, setLr] = useState(0.1);
  const [epochs, setEpochs] = useState(50);

  const r = useMemo(
    () => tabularRun(n, hidden, lr, epochs),
    [n, hidden, lr, epochs],
  );
  const mlpThang = r.mlp >= r.forest;

  return (
    <LabShell
      id="lab-tabular"
      title="Random Forest so với mạng nơ-ron trên đúng loại dữ liệu bạn sẽ gặp"
      takeaway={
        <>
          Dữ liệu ở đây là dữ liệu bảng điển hình của bảo mật: tám cột, vài
          ngưỡng gãy khúc, hai tương tác kiểu &ldquo;ngoài giờ VÀ từ dải
          lạ&rdquo;. Nhiễu nhãn chặn mọi mô hình ở <b>trần 75,9%</b> — con số đó
          hiện luôn trong ô thứ ba để bạn biết còn cách đích bao xa.
          <br />
          <br />
          Random Forest đạt <b>75,1%</b>, tức cách trần đúng 0,8 điểm — và nó đạt được
          như vậy mà <b>không có một núm nào để vặn</b>. Mạng nơ-ron với cấu
          hình trông rất hợp lý (16 nơ-ron ẩn, lr 0,1, 50 vòng) chỉ được{" "}
          <b>71,8%</b>, thua 3,3 điểm.
          <br />
          <br />
          Nhưng đừng dừng ở đó, vì kết luận &ldquo;mạng nơ-ron kém hơn&rdquo; là
          kết luận sai. Hãy đi tìm cấu hình tốt hơn — nó tồn tại. Có một điểm
          đặt trên ba thanh trượt cho <b>75,7%</b>, tức ngang trần và nhỉnh hơn
          Random Forest. Gợi ý: nó không nằm ở phía bạn nghĩ.{" "}
          <b>Mạng NHỎ nhất mới thắng</b>, không phải mạng lớn nhất.
          <br />
          <br />
          Đó mới là lập luận thật cho dữ liệu bảng, và nó không phải &ldquo;cây
          mạnh hơn&rdquo;: cây đưa bạn tới sát đích <b>ngay từ lần chạy đầu</b>,
          còn mạng nơ-ron tới được cùng chỗ nhưng bắt bạn trả bằng một cuộc dò
          siêu tham số. Với một đội SOC phải giao hệ thống trong hai tuần, khoản
          chi phí đó mới là thứ quyết định — chứ không phải 0,6 điểm phần trăm.
        </>
      }
    >
      <Slider
        label="Số mẫu huấn luyện"
        value={n}
        min={200}
        max={1200}
        step={100}
        onChange={setN}
        format={(v) => fmtNum(v)}
        hint="Cả hai mô hình dùng chung tập này; tập kiểm thử luôn cố định 1.200 mẫu."
      />

      <div className="panel">
        <div className="stat-k" style={{ marginBottom: 10 }}>
          Ba núm CHỈ của mạng nơ-ron — Random Forest không có núm nào
        </div>
        <div className="grid grid-3">
          <Slider
            label="Nơ-ron lớp ẩn"
            value={hidden}
            min={4}
            max={24}
            step={4}
            onChange={setHidden}
          />
          <Slider
            label="Tốc độ học"
            value={lr}
            min={0.02}
            max={0.4}
            step={0.01}
            onChange={setLr}
            format={(v) => v.toFixed(2)}
          />
          <Slider
            label="Số vòng huấn luyện"
            value={epochs}
            min={20}
            max={80}
            step={10}
            onChange={setEpochs}
          />
        </div>
      </div>

      <Readout
        items={[
          {
            k: "Random Forest",
            v: `${(r.forest * 100).toFixed(1)}%`,
            tone: mlpThang ? "neutral" : "ok",
            sub: "không tinh chỉnh gì",
          },
          {
            k: "Mạng nơ-ron",
            v: `${(r.mlp * 100).toFixed(1)}%`,
            tone: mlpThang ? "ok" : "bad",
            sub: `${hidden} ẩn · lr ${lr.toFixed(2)} · ${epochs} vòng`,
          },
          {
            k: "Trần lý thuyết",
            v: `${(r.ceiling * 100).toFixed(1)}%`,
            tone: "info",
            sub: "nhiễu nhãn chặn ở đây",
          },
          {
            k: "Chênh lệch",
            v: `${r.gap >= 0 ? "+" : ""}${(r.gap * 100).toFixed(1)} đp`,
            tone: Math.abs(r.gap) < 0.01 ? "ok" : r.gap > 0 ? "warn" : "ok",
            sub: r.gap > 0 ? "Random Forest đang dẫn" : "mạng đang dẫn",
          },
        ]}
      />

      <div className={`callout ${mlpThang ? "co-pro" : "co-pitfall"}`}>
        <Icon
          className="callout-icon"
          name={mlpThang ? "check" : "lightbulb"}
          size={18}
        />
        <div>
          <div className="callout-title">
            {mlpThang
              ? "Bạn đã tìm ra cấu hình bắt kịp Random Forest"
              : "Random Forest vẫn đang dẫn — hãy thử tiếp"}
          </div>
          <div className="callout-body">
            {mlpThang
              ? `Đúng như dự đoán: mạng nơ-ron làm được. Nhưng hãy đếm xem bạn đã kéo bao nhiêu lần để tới đây — Random Forest đạt ${(r.forest * 100).toFixed(1)}% ngay ở lần chạy đầu tiên, không cần một lần kéo nào. Đó chính là cái giá mà bài học nói tới.`
              : `Mạng đang kém ${(r.gap * 100).toFixed(1)} điểm phần trăm. Trước khi kết luận mạng nơ-ron không hợp dữ liệu bảng, hãy thử GIẢM số nơ-ron ẩn thay vì tăng — trên bài toán nhỏ và nhiều nhiễu, dung lượng thừa chỉ giúp mô hình học thuộc nhiễu.`}
          </div>
        </div>
      </div>
    </LabShell>
  );
}
