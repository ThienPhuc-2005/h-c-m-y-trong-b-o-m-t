/**
 * Bộ dựng phòng thí nghiệm dùng chung.
 *
 * Mọi lab đều tuân theo cùng một khuôn: núm điều khiển bên trái/trên, kết quả
 * bên phải/dưới, và một dòng "điều cần rút ra". Sự nhất quán này quan trọng:
 * người học chỉ phải học cách dùng giao diện MỘT lần, sau đó toàn bộ năng lực
 * nhận thức dồn vào nội dung thay vì vào việc dò xem nút nào làm gì.
 */

import { useEffect, useId, useState, type ReactNode } from 'react';
import { setCheck } from '../lib/storage';
import { Icon } from '../components/Icon';
import { useT } from '../i18n';

export function LabShell({
  id,
  title,
  children,
  takeaway,
}: {
  id: string;
  title: string;
  children: ReactNode;
  takeaway?: ReactNode;
}) {
  const t = useT();

  // Ghi nhận lab đã được mở — dùng cho huy hiệu "chuột bạch phòng lab".
  // Dùng setCheck (đặt giá trị) chứ không phải toggleCheck (đảo): effect có thể
  // chạy hai lần và hai lần đảo sẽ triệt tiêu nhau.
  useEffect(() => {
    setCheck(`lab:${id}`, true);
  }, [id]);

  return (
    <section className="lab" aria-label={t('lab.regionLabel', { title })}>
      <header className="lab-head">
        <Icon name="flask" size={17} />
        <h4>{title}</h4>
      </header>
      <div className="lab-body stack" style={{ '--gap': 'var(--s-5)' } as React.CSSProperties}>
        {children}
        {takeaway && (
          <div className="callout co-insight">
            <Icon className="callout-icon" name="lightbulb" size={18} />
            <div>
              <div className="callout-title">{t('labs.takeaway')}</div>
              <div className="callout-body">{takeaway}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  hint?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const shown = format ? format(value) : String(value);
  return (
    <div className="field">
      <label htmlFor={id}>
        <span>{label}</span>
        <var>{shown}</var>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        /* Trình đọc màn hình mặc định chỉ đọc con số thô. Với những thanh trượt
           mà `format` trả về CHỮ — "nhanh (đối thủ tích cực)", "2,4 giờ" — thì
           nghe thấy "2" là vô nghĩa. `aria-valuetext` thay con số bằng đúng thứ
           người sáng mắt đang nhìn. */
        aria-valuetext={shown}
        aria-describedby={hint ? hintId : undefined}
      />
      {hint && <div className="field-hint" id={hintId}>{hint}</div>}
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch-track" />
      <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 550 }}>{label}</span>
    </label>
  );
}

export function Readout({
  items,
}: {
  items: { k: string; v: string; tone?: 'ok' | 'bad' | 'warn' | 'info' | 'neutral'; sub?: string }[];
}) {
  const color = (t?: string) =>
    t === 'ok'
      ? 'var(--ok-text)'
      : t === 'bad'
        ? 'var(--bad-text)'
        : t === 'warn'
          ? 'var(--warn-text)'
          : t === 'info'
            ? 'var(--info-text)'
            : 'var(--text)';
  return (
    /**
     * `aria-live` ở ĐÂY là thay đổi có sức đòn bẩy lớn nhất trong toàn bộ phần
     * trợ năng: Readout là thành phần dùng chung của cả 24 phòng lab, nên một
     * dòng này làm cho mọi thanh trượt trong app công bố được kết quả.
     *
     * Không có nó, lời hứa "kéo một thanh trượt và thấy hệ thống phát hiện sụp
     * đổ" đơn giản là không thực hiện được với người khiếm thị — họ kéo, và
     * không có gì xảy ra cả.
     *
     * `polite` chứ không phải `assertive`: kéo thanh trượt sinh ra hàng chục
     * lần cập nhật liên tiếp, và `assertive` sẽ cắt ngang lời đọc mỗi lần.
     * `aria-atomic` để nghe trọn cụm "Độ chính xác 96,7%" thay vì mỗi con số rời.
     */
    <div className="grid grid-4" aria-live="polite" aria-atomic="true">
      {items.map((it) => (
        <div className="stat" key={it.k}>
          <div className="stat-k">{it.k}</div>
          <div className="stat-v" style={{ color: color(it.tone), fontSize: 'var(--fs-xl)' }}>
            {it.v}
          </div>
          {it.sub && <div className="stat-sub">{it.sub}</div>}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Nguyên thuỷ vẽ biểu đồ                                                     */
/* -------------------------------------------------------------------------- */

export interface Plot {
  w: number;
  h: number;
  pad: { l: number; r: number; t: number; b: number };
  xr: [number, number];
  yr: [number, number];
}

export const mkPlot = (
  w = 460,
  h = 300,
  xr: [number, number] = [0, 1],
  yr: [number, number] = [0, 1],
  pad = { l: 46, r: 14, t: 14, b: 36 },
): Plot => ({ w, h, pad, xr, yr });

export const px = (p: Plot, x: number) =>
  p.pad.l + ((x - p.xr[0]) / (p.xr[1] - p.xr[0] || 1)) * (p.w - p.pad.l - p.pad.r);

export const py = (p: Plot, y: number) =>
  p.h - p.pad.b - ((y - p.yr[0]) / (p.yr[1] - p.yr[0] || 1)) * (p.h - p.pad.t - p.pad.b);

export function Axes({
  p,
  xLabel,
  yLabel,
  xTicks = 5,
  yTicks = 5,
  fmtX = (v: number) => String(Math.round(v * 100) / 100),
  fmtY = (v: number) => String(Math.round(v * 100) / 100),
}: {
  p: Plot;
  xLabel?: string;
  yLabel?: string;
  xTicks?: number;
  yTicks?: number;
  fmtX?: (v: number) => string;
  fmtY?: (v: number) => string;
}) {
  const xs = Array.from({ length: xTicks + 1 }, (_, i) => p.xr[0] + ((p.xr[1] - p.xr[0]) * i) / xTicks);
  const ys = Array.from({ length: yTicks + 1 }, (_, i) => p.yr[0] + ((p.yr[1] - p.yr[0]) * i) / yTicks);
  return (
    <g>
      {ys.map((v, i) => (
        <line key={`gy${i}`} x1={p.pad.l} y1={py(p, v)} x2={p.w - p.pad.r} y2={py(p, v)} className="svg-grid" />
      ))}
      {xs.map((v, i) => (
        <text key={`tx${i}`} x={px(p, v)} y={p.h - p.pad.b + 15} textAnchor="middle" className="svg-label" style={{ fontSize: 10 }}>
          {fmtX(v)}
        </text>
      ))}
      {ys.map((v, i) => (
        <text key={`ty${i}`} x={p.pad.l - 6} y={py(p, v) + 3} textAnchor="end" className="svg-label" style={{ fontSize: 10 }}>
          {fmtY(v)}
        </text>
      ))}
      <line x1={p.pad.l} y1={p.pad.t} x2={p.pad.l} y2={p.h - p.pad.b} className="svg-axis" />
      <line x1={p.pad.l} y1={p.h - p.pad.b} x2={p.w - p.pad.r} y2={p.h - p.pad.b} className="svg-axis" />
      {xLabel && (
        <text x={(p.pad.l + p.w - p.pad.r) / 2} y={p.h - 3} textAnchor="middle" className="svg-label-strong">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text transform={`rotate(-90 11 ${(p.pad.t + p.h - p.pad.b) / 2})`} x={11} y={(p.pad.t + p.h - p.pad.b) / 2} textAnchor="middle" className="svg-label-strong">
          {yLabel}
        </text>
      )}
    </g>
  );
}

export function Line({ p, pts, color, width = 2.4, dash }: { p: Plot; pts: [number, number][]; color: string; width?: number; dash?: string }) {
  if (!pts.length) return null;
  const d = pts.map((pt, i) => `${i ? 'L' : 'M'}${px(p, pt[0]).toFixed(1)} ${py(p, pt[1]).toFixed(1)}`).join(' ');
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinejoin="round" />;
}

export function Area({ p, pts, color }: { p: Plot; pts: [number, number][]; color: string }) {
  if (!pts.length) return null;
  const d =
    pts.map((pt, i) => `${i ? 'L' : 'M'}${px(p, pt[0]).toFixed(1)} ${py(p, pt[1]).toFixed(1)}`).join(' ') +
    ` L${px(p, pts[pts.length - 1][0]).toFixed(1)} ${py(p, p.yr[0])} L${px(p, pts[0][0]).toFixed(1)} ${py(p, p.yr[0])} Z`;
  return <path d={d} fill={color} opacity={0.12} />;
}

export function Dots({ p, pts, color, r = 4, shape = 'circle' }: { p: Plot; pts: [number, number][]; color: string; r?: number; shape?: 'circle' | 'cross' }) {
  return (
    <g>
      {pts.map(([x, y], i) =>
        shape === 'circle' ? (
          <circle key={i} cx={px(p, x)} cy={py(p, y)} r={r} fill={color} opacity={0.82} />
        ) : (
          <path
            key={i}
            d={`M${px(p, x) - r} ${py(p, y) - r} L${px(p, x) + r} ${py(p, y) + r} M${px(p, x) + r} ${py(p, y) - r} L${px(p, x) - r} ${py(p, y) + r}`}
            stroke={color}
            strokeWidth={2.2}
            opacity={0.9}
          />
        ),
      )}
    </g>
  );
}

export function Chart({ p, children, label }: { p: Plot; children: ReactNode; label?: string }) {
  // Chặn bề rộng: SVG dùng viewBox nên MỌI thứ bên trong — kể cả chữ — phóng to
  // theo khung. Trên màn hình rộng, một biểu đồ 460px kéo giãn ra 1800px sẽ có
  // nhãn trục to bằng tiêu đề trang, phá vỡ hoàn toàn thứ bậc thị giác.
  // Giới hạn 1,45 lần kích thước thiết kế là mức chữ vẫn còn đúng vai trò.
  return (
    <svg
      viewBox={`0 0 ${p.w} ${p.h}`}
      style={{ width: '100%', maxWidth: Math.round(p.w * 1.45), height: 'auto', margin: '0 auto' }}
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}

export function Bars({
  data,
  color,
  height = 120,
  fmt,
}: {
  data: { label: string; v: number; color?: string }[];
  color: string;
  height?: number;
  fmt?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.v), 1e-9);
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {fmt ? fmt(d.v) : d.v.toFixed(2)}
          </span>
          <div
            style={{
              width: '100%',
              height: `${Math.max(2, (d.v / max) * 100)}%`,
              background: d.color ?? color,
              borderRadius: '4px 4px 0 0',
              transition: 'height var(--t-base) var(--ease)',
            }}
          />
          <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-faint)', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Nút chạy lại mô phỏng — nhiều lab cần hạt ngẫu nhiên mới. */
export function Reseed({ onClick }: { onClick: () => void }) {
  const t = useT();
  return (
    <button className="btn btn-sm" onClick={onClick}>
      <Icon name="dices" size={14} /> {t('labs.reseed')}
    </button>
  );
}

export function useSeed(): [number, () => void] {
  const [seed, setSeed] = useState(12345);
  return [seed, () => setSeed(Math.floor(Math.random() * 1e6))];
}

export const COLORS = {
  ok: 'var(--ok)',
  bad: 'var(--bad)',
  warn: 'var(--warn)',
  info: 'var(--info)',
  brand: 'var(--brand)',
  lab: 'var(--lab)',
  muted: 'var(--text-faint)',
};
