/**
 * ============================================================================
 *  Thư viện hình minh hoạ (SVG thuần)
 * ============================================================================
 *  Vì sao vẽ tay bằng SVG thay vì dùng ảnh:
 *   - Tự đổi màu theo chủ đề sáng/tối (dùng biến CSS) → không có hình nào bị
 *     "chói trắng" giữa nền tối, thứ phá vỡ trải nghiệm đọc ban đêm.
 *   - Sắc nét ở mọi độ phân giải và mọi cỡ chữ người học chọn.
 *   - Nhẹ, không cần tải thêm tệp, hoạt động ngoại tuyến.
 *
 *  Nguyên tắc thiết kế hình: MỘT hình nói MỘT ý. Hình nhồi nhét làm tăng tải
 *  nhận thức đúng vào lúc người học đang cần giảm tải.
 * ============================================================================
 */

import type { ReactNode } from 'react';
import { isKnownFigure } from '../content/registry';
import { Icon } from './Icon';

const C = {
  brand: 'var(--brand)',
  ok: 'var(--ok)',
  bad: 'var(--bad)',
  warn: 'var(--warn)',
  info: 'var(--info)',
  lab: 'var(--lab)',
  line: 'var(--border-strong)',
  soft: 'var(--bg-sunken)',
  text: 'var(--text)',
  muted: 'var(--text-muted)',
};

function Svg({ children, vb = '0 0 600 300', h }: { children: ReactNode; vb?: string; h?: number }) {
  return (
    <svg
      viewBox={vb}
      // Tên gọi cho trình đọc màn hình nằm ở thẻ <figure> bao ngoài (xem Figure),
      // nên bản thân SVG được ẩn khỏi cây trợ năng để không đọc trùng.
      aria-hidden="true"
      focusable="false"
      /* maxWidth/maxHeight đi qua CSS (.fig-svg) chứ không viết nội tuyến: chỉ
         như vậy chúng mới nhân được với --user-scale, và style nội tuyến thì
         thắng mọi media query. */
      className="fig-svg"
      style={{ '--fig-h': `${h ?? 340}px` } as React.CSSProperties}
      preserveAspectRatio="xMidYMid meet"
    >
      {children}
    </svg>
  );
}

const T = ({ x, y, children, strong, anchor = 'middle', size }: {
  x: number; y: number; children: ReactNode; strong?: boolean; anchor?: 'start' | 'middle' | 'end'; size?: number;
}) => (
  <text x={x} y={y} textAnchor={anchor} className={strong ? 'svg-label-strong' : 'svg-label'} style={size ? { fontSize: size } : undefined}>
    {children}
  </text>
);

const Box = ({ x, y, w, h, fill, stroke, label, sub, rx = 8 }: {
  x: number; y: number; w: number; h: number; fill?: string; stroke?: string; label?: string; sub?: string; rx?: number;
}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill ?? C.soft} stroke={stroke ?? C.line} strokeWidth="1.5" />
    {label && <T x={x + w / 2} y={y + h / 2 + (sub ? -3 : 4)} strong>{label}</T>}
    {sub && <T x={x + w / 2} y={y + h / 2 + 13} size={11}>{sub}</T>}
  </g>
);

const Arrow = ({ x1, y1, x2, y2, color = C.line, dash }: { x1: number; y1: number; x2: number; y2: number; color?: string; dash?: string }) => (
  <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.8" strokeDasharray={dash} markerEnd="url(#ah)" />
  </g>
);

const Defs = () => (
  <defs>
    <marker id="ah" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill={C.line} />
    </marker>
  </defs>
);

/* ========================================================================== */
/*  Các hình                                                                   */
/* ========================================================================== */

const MlPipeline = () => (
  <Svg vb="0 0 620 190">
    <Defs />
    <Box x={8} y={62} w={96} h={62} label="Dữ liệu thô" sub="log, tệp, gói tin" />
    <Arrow x1={106} y1={93} x2={130} y2={93} />
    <Box x={132} y={62} w={96} h={62} label="Đặc trưng" sub="thành các con số" fill="var(--info-soft)" stroke="var(--info-border)" />
    <Arrow x1={230} y1={93} x2={254} y2={93} />
    <Box x={256} y={62} w={96} h={62} label="Mô hình" sub="cho điểm 0–1" fill="var(--brand-soft)" stroke="var(--brand-border)" />
    <Arrow x1={354} y1={93} x2={378} y2={93} />
    <Box x={380} y={62} w={96} h={62} label="Ngưỡng" sub="cắt điểm số" fill="var(--warn-soft)" stroke="var(--warn-border)" />
    <Arrow x1={478} y1={93} x2={502} y2={93} />
    <Box x={504} y={62} w={106} h={62} label="Hành động" sub="cảnh báo / chặn" fill="var(--ok-soft)" stroke="var(--ok-border)" />
    <path d="M557 128 L557 160 L60 160 L60 128" fill="none" stroke={C.ok} strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#ah)" />
    <T x={310} y={175} size={11}>Vòng phản hồi: kết luận của analyst quay lại thành nhãn mới</T>
    {/* Nhãn này CĂN GIỮA (mặc định của T), nên x phải là tâm chữ chứ không phải
        lề trái. Trước đây x=56 đẩy nửa đầu dòng chữ ra ngoài viewBox và người
        học đọc được "ín thức bảo mật quyết định". Đặt ở 180 để vừa nằm trong
        khung, vừa đúng trên mũi tên trỏ xuống ô "Đặc trưng". */}
    <T x={180} y={40} strong>Nơi kiến thức bảo mật quyết định</T>
    <path d="M180 46 L180 58" stroke={C.warn} strokeWidth="1.5" markerEnd="url(#ah)" />
  </Svg>
);

const ThreeLearning = () => (
  <Svg vb="0 0 620 220">
    <Defs />
    <Box x={12} y={30} w={186} h={160} fill="var(--ok-soft)" stroke="var(--ok-border)" />
    <T x={105} y={54} strong>Có giám sát</T>
    <T x={105} y={74} size={11}>Có nhãn → dự đoán nhãn</T>
    {[0, 1, 2].map((i) => <circle key={i} cx={62 + i * 30} cy={104} r={9} fill={C.ok} />)}
    {[0, 1, 2].map((i) => <rect key={i} x={54 + i * 30} y={126} width={16} height={16} rx={3} fill={C.bad} />)}
    <T x={105} y={166} size={11}>Phishing, mã độc, gian lận</T>

    <Box x={212} y={30} w={186} h={160} fill="var(--info-soft)" stroke="var(--info-border)" />
    <T x={305} y={54} strong>Không giám sát</T>
    <T x={305} y={74} size={11}>Không nhãn → tìm cấu trúc</T>
    {[[250, 100], [268, 112], [258, 122], [276, 98], [244, 114]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={6} fill={C.info} opacity={0.8} />
    ))}
    {[[340, 108], [352, 120], [344, 96]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={6} fill={C.info} opacity={0.8} />
    ))}
    <circle cx={310} cy={140} r={7} fill="none" stroke={C.bad} strokeWidth="2" />
    <T x={310} y={166} size={11}>Bất thường, phân cụm, UEBA</T>

    <Box x={412} y={30} w={196} h={160} fill="var(--lab-soft)" stroke="var(--lab-border)" />
    <T x={510} y={54} strong>Tăng cường</T>
    <T x={510} y={74} size={11}>Hành động → phần thưởng</T>
    <circle cx={462} cy={118} r={16} fill="none" stroke={C.lab} strokeWidth="2" />
    <T x={462} y={122} size={11}>agent</T>
    <Arrow x1={482} y1={110} x2={540} y2={110} color={C.lab} />
    <Arrow x1={540} y1={130} x2={482} y2={130} color={C.lab} />
    <T x={562} y={122} size={11}>môi trường</T>
    <T x={510} y={166} size={11}>Hiếm dùng trong SOC thật</T>
  </Svg>
);

const BaseRateFig = () => {
  const cells: ReactNode[] = [];
  const cols = 40;
  const rows = 25;
  // 1.000 ô; 10 ô đỏ (1%) là tấn công; khoảng 50 ô vàng là báo động giả.
  const attacks = new Set([120, 233, 341, 455, 512, 618, 700, 812, 905, 977]);
  const fps = new Set(Array.from({ length: 49 }, (_, i) => (i * 37 + 11) % 1000).filter((n) => !attacks.has(n)));
  for (let i = 0; i < cols * rows; i++) {
    const x = (i % cols) * 15 + 12;
    const y = Math.floor(i / cols) * 11 + 30;
    const isA = attacks.has(i);
    const isF = fps.has(i);
    cells.push(
      <rect key={i} x={x} y={y} width={11} height={8} rx={1.5}
        fill={isA ? C.bad : isF ? C.warn : 'var(--border-subtle)'}
        opacity={isA || isF ? 1 : 0.75} />,
    );
  }
  return (
    <Svg vb="0 0 620 330">
      <T x={310} y={18} strong>1.000 sự kiện · 10 là tấn công thật (1%) · bộ phát hiện có FPR 5%</T>
      {cells}
      <g transform="translate(12,318)">
        <rect x={0} y={-9} width={11} height={8} rx={1.5} fill={C.bad} />
        <T x={80} y={-2} anchor="middle" size={11}>10 tấn công thật</T>
        <rect x={160} y={-9} width={11} height={8} rx={1.5} fill={C.warn} />
        <T x={238} y={-2} anchor="middle" size={11}>~49 báo động giả</T>
        <rect x={330} y={-9} width={11} height={8} rx={1.5} fill="var(--border-subtle)" />
        <T x={410} y={-2} anchor="middle" size={11}>941 bình thường</T>
        {/* anchor="end" thay vì căn giữa: nhóm này đã bị translate(12,…) nên
            chữ căn giữa ở x=548 tràn qua mép phải 620 của viewBox. */}
        <T x={596} y={-2} anchor="end" size={11}>→ chỉ ~17% cảnh báo là thật</T>
      </g>
    </Svg>
  );
};

const ConfusionFig = () => (
  <Svg vb="0 0 560 300">
    <T x={280} y={20} strong>Ma trận nhầm lẫn — bốn ô, bốn hậu quả khác nhau</T>
    <T x={175} y={48} size={11}>Thực tế: TẤN CÔNG</T>
    <T x={395} y={48} size={11}>Thực tế: BÌNH THƯỜNG</T>
    <T x={52} y={110} size={11}>Mô hình</T>
    <T x={52} y={124} size={11}>báo động</T>
    <T x={52} y={215} size={11}>Mô hình</T>
    <T x={52} y={229} size={11}>im lặng</T>

    <rect x={90} y={60} width={190} height={100} rx={10} fill="var(--ok-soft)" stroke={C.ok} strokeWidth="2" />
    <T x={185} y={95} strong>Đúng dương (TP)</T>
    <T x={185} y={116} size={11}>Bắt được kẻ tấn công</T>
    <T x={185} y={134} size={11}>Đây là lý do hệ thống tồn tại</T>

    <rect x={290} y={60} width={190} height={100} rx={10} fill="var(--warn-soft)" stroke={C.warn} strokeWidth="2" />
    <T x={385} y={95} strong>Sai dương (FP)</T>
    <T x={385} y={116} size={11}>Báo động giả</T>
    <T x={385} y={134} size={11}>Tốn giờ analyst, gây chai lì</T>

    <rect x={90} y={170} width={190} height={100} rx={10} fill="var(--bad-soft)" stroke={C.bad} strokeWidth="2" />
    <T x={185} y={205} strong>Sai âm (FN)</T>
    <T x={185} y={226} size={11}>Bỏ lọt tấn công</T>
    <T x={185} y={244} size={11}>Đắt nhất, và bạn không biết</T>

    <rect x={290} y={170} width={190} height={100} rx={10} fill="var(--bg-sunken)" stroke={C.line} strokeWidth="2" />
    <T x={385} y={205} strong>Đúng âm (TN)</T>
    <T x={385} y={226} size={11}>Bình thường, không báo</T>
    <T x={385} y={244} size={11}>Chiếm 99,99% mọi thứ</T>
  </Svg>
);

const RocAnatomy = () => (
  <Svg vb="0 0 560 300">
    <Defs />
    <line x1={70} y1={250} x2={490} y2={250} className="svg-axis" />
    <line x1={70} y1={250} x2={70} y2={40} className="svg-axis" />
    <line x1={70} y1={250} x2={470} y2={50} stroke={C.line} strokeWidth="1.5" strokeDasharray="5 5" />
    <T x={300} y={162} size={11}>đoán mò (AUC = 0,5)</T>
    <path d="M70 250 C 130 120, 210 70, 470 50" fill="none" stroke={C.brand} strokeWidth="2.5" />
    <path d="M70 250 C 130 120, 210 70, 470 50 L470 250 Z" fill={C.brand} opacity="0.08" />
    <circle cx={148} cy={128} r={6} fill={C.warn} stroke="var(--bg-elev)" strokeWidth="2" />
    <T x={196} y={118} size={11} anchor="start">ngưỡng cao: ít báo động giả,</T>
    <T x={196} y={131} size={11} anchor="start">nhưng bỏ sót nhiều</T>
    <circle cx={330} cy={68} r={6} fill={C.ok} stroke="var(--bg-elev)" strokeWidth="2" />
    <T x={348} y={62} size={11} anchor="start">ngưỡng thấp: bắt được nhiều,</T>
    <T x={348} y={75} size={11} anchor="start">nhưng ngập báo động giả</T>
    <T x={280} y={280} strong>Tỉ lệ báo động giả (FPR) →</T>
    <g transform="rotate(-90 24 145)"><T x={24} y={145} strong>Tỉ lệ bắt được (TPR) →</T></g>
    <T x={64} y={256} anchor="end" size={11}>0</T>
    <T x={490} y={266} size={11}>1</T>
    <T x={62} y={44} anchor="end" size={11}>1</T>
  </Svg>
);

const BiasVariance = () => (
  <Svg vb="0 0 600 250">
    <line x1={60} y1={200} x2={550} y2={200} className="svg-axis" />
    <line x1={60} y1={200} x2={60} y2={30} className="svg-axis" />
    <path d="M60 60 Q 200 190, 540 196" fill="none" stroke={C.info} strokeWidth="2.5" />
    <T x={470} y={182} size={11} anchor="start">lỗi trên tập huấn luyện</T>
    <path d="M60 70 Q 230 175, 300 168 Q 420 155, 540 55" fill="none" stroke={C.bad} strokeWidth="2.5" />
    <T x={470} y={72} size={11} anchor="end">lỗi trên dữ liệu mới</T>
    <line x1={300} y1={30} x2={300} y2={200} stroke={C.ok} strokeWidth="1.5" strokeDasharray="4 4" />
    <circle cx={300} cy={168} r={6} fill={C.ok} />
    <T x={300} y={22} strong>điểm ngọt</T>
    <T x={150} y={225} strong>← Dưới khớp</T>
    <T x={450} y={225} strong>Quá khớp →</T>
    <T x={300} y={244} size={11}>Độ phức tạp mô hình</T>
  </Svg>
);

const SplitTemporal = () => (
  <Svg vb="0 0 600 230">
    <T x={300} y={18} strong>Cùng một tập dữ liệu, hai cách chia — hai kết luận trái ngược</T>
    <T x={20} y={54} anchor="start" size={11}>Chia NGẪU NHIÊN (sai)</T>
    {Array.from({ length: 30 }, (_, i) => (
      <rect key={i} x={20 + i * 19} y={62} width={16} height={26} rx={3}
        fill={[2, 5, 9, 13, 17, 22, 26].includes(i) ? C.bad : C.info} opacity={0.85} />
    ))}
    <T x={300} y={106} size={11}>Tập kiểm tra (đỏ) nằm xen kẽ → mô hình "nhìn thấy tương lai" → AUC 0,99 giả tạo</T>

    <T x={20} y={144} anchor="start" size={11}>Chia THEO THỜI GIAN (đúng)</T>
    {Array.from({ length: 30 }, (_, i) => (
      <rect key={i} x={20 + i * 19} y={152} width={16} height={26} rx={3}
        fill={i >= 22 ? C.bad : C.info} opacity={0.85} />
    ))}
    <line x1={438} y1={146} x2={438} y2={184} stroke={C.warn} strokeWidth="2" />
    <T x={438} y={196} size={11}>mốc chia</T>
    <T x={300} y={216} size={11}>Kiểm tra trên tương lai chưa từng thấy → AUC 0,84 nhưng là con số THẬT</T>
  </Svg>
);

const FeatureSpace = () => (
  <Svg vb="0 0 560 280">
    <line x1={60} y1={230} x2={500} y2={230} className="svg-axis" />
    <line x1={60} y1={230} x2={60} y2={30} className="svg-axis" />
    <path d="M60 200 L500 70" stroke={C.brand} strokeWidth="2.5" />
    <path d="M60 200 L500 70 L500 230 L60 230 Z" fill={C.ok} opacity="0.06" />
    <path d="M60 200 L500 70 L500 30 L60 30 Z" fill={C.bad} opacity="0.06" />
    {[[110, 205], [150, 215], [190, 200], [230, 210], [270, 195], [320, 200], [360, 190], [420, 180], [140, 190], [250, 185]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={6} fill={C.ok} opacity={0.85} />
    ))}
    {[[150, 80], [200, 100], [260, 70], [310, 90], [360, 60], [410, 80], [440, 110], [230, 60], [330, 120], [390, 130]].map(([x, y], i) => (
      <g key={i}>
        <path d={`M${x - 6} ${y - 6} L${x + 6} ${y + 6} M${x + 6} ${y - 6} L${x - 6} ${y + 6}`} stroke={C.bad} strokeWidth="2.5" />
      </g>
    ))}
    <circle cx={300} cy={155} r={6} fill={C.warn} stroke="var(--bg-elev)" strokeWidth="2" />
    <T x={318} y={152} anchor="start" size={11}>vùng xám: mô hình không chắc</T>
    <T x={280} y={260} strong>Đặc trưng 1 (ví dụ: entropy tên miền) →</T>
    <g transform="rotate(-90 26 130)"><T x={26} y={130} strong>Đặc trưng 2 →</T></g>
    <T x={455} y={200} size={11}>lành tính</T>
    <T x={455} y={45} size={11}>độc hại</T>
  </Svg>
);

const ImbalanceFig = () => (
  <Svg vb="0 0 600 200">
    <T x={300} y={20} strong>Cùng FPR = 0,1%, khối lượng cảnh báo giả thay đổi theo lưu lượng</T>
    {/* Thanh dài nhất PHẢI để chừa chỗ cho nhãn nằm bên phải nó: cột nhãn bắt
        đầu ở 150, nên bề rộng tối đa là 150 + w + 8 + (bề rộng nhãn) < 600.
        Bản trước đặt thanh ở x=200 rộng 420 — tức chính thanh đó đã vượt khung.
        Bản sau đó rút về 290 dựa trên một phép ƯỚC LƯỢNG bề rộng nhãn là 141,
        và ước lượng đó sai: đo trong trình duyệt bằng
        `node scripts/check-figures.mjs` thì nhãn "10.000 cảnh báo giả — bất khả
        thi" rộng 166 đơn vị, nên đuôi nó vẫn thò ra ngoài 14. Đừng ước lượng
        bề rộng chữ bằng đầu — chạy script. */}
    {[
      { l: '10 nghìn sự kiện/ngày', w: 18, n: '10 cảnh báo giả', c: C.ok },
      { l: '1 triệu sự kiện/ngày', w: 96, n: '1.000 cảnh báo giả', c: C.warn },
      { l: '10 triệu sự kiện/ngày', w: 270, n: '10.000 cảnh báo giả — bất khả thi', c: C.bad },
    ].map((r, i) => (
      <g key={i}>
        <T x={12} y={62 + i * 46} anchor="start" size={11}>{r.l}</T>
        <rect x={150} y={48 + i * 46} width={r.w} height={20} rx={4} fill={r.c} opacity={0.85} />
        <T x={150 + r.w + 8} y={63 + i * 46} anchor="start" size={11}>{r.n}</T>
      </g>
    ))}
    <T x={300} y={186} size={11}>Tỉ lệ phần trăm che giấu thực tế. Luôn quy về con số tuyệt đối mỗi ngày.</T>
  </Svg>
);

const NeuronFig = () => (
  <Svg vb="0 0 560 230">
    <Defs />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <circle cx={70} cy={60 + i * 55} r={20} fill="var(--info-soft)" stroke={C.info} strokeWidth="1.8" />
        <T x={70} y={65 + i * 55} size={11}>x{i + 1}</T>
        <Arrow x1={92} y1={60 + i * 55} x2={232} y2={112 - i * 2} color={C.info} />
        <T x={160} y={48 + i * 52} size={11}>w{i + 1}</T>
      </g>
    ))}
    <circle cx={262} cy={115} r={34} fill="var(--brand-soft)" stroke={C.brand} strokeWidth="2" />
    <T x={262} y={112} size={12} strong>Σ</T>
    <T x={262} y={128} size={10.5}>+ b</T>
    <Arrow x1={298} y1={115} x2={340} y2={115} color={C.brand} />
    <rect x={342} y={88} width={78} height={54} rx={8} fill="var(--lab-soft)" stroke={C.lab} strokeWidth="1.8" />
    <path d="M352 132 C 372 132, 376 98, 410 98" fill="none" stroke={C.lab} strokeWidth="2" />
    <T x={381} y={158} size={11}>kích hoạt</T>
    <Arrow x1={422} y1={115} x2={462} y2={115} color={C.lab} />
    <circle cx={492} cy={115} r={22} fill="var(--ok-soft)" stroke={C.ok} strokeWidth="1.8" />
    <T x={492} y={120} size={11}>ŷ</T>
    <T x={280} y={200} size={11}>Một nơ-ron = tổng có trọng số + hàm phi tuyến. Toàn bộ deep learning xây từ đây.</T>
  </Svg>
);

const MlpFig = () => (
  <Svg vb="0 0 560 250">
    {[
      { n: 4, x: 80, c: C.info, l: 'Đầu vào' },
      { n: 5, x: 210, c: C.brand, l: 'Ẩn 1' },
      { n: 5, x: 340, c: C.brand, l: 'Ẩn 2' },
      { n: 1, x: 470, c: C.ok, l: 'Đầu ra' },
    ].map((layer, li, arr) => (
      <g key={li}>
        <T x={layer.x} y={228} size={11}>{layer.l}</T>
        {Array.from({ length: layer.n }, (_, i) => {
          const y = 125 - ((layer.n - 1) * 38) / 2 + i * 38;
          return (
            <g key={i}>
              {li < arr.length - 1 &&
                Array.from({ length: arr[li + 1].n }, (_, j) => {
                  const y2 = 125 - ((arr[li + 1].n - 1) * 38) / 2 + j * 38;
                  return <line key={j} x1={layer.x + 15} y1={y} x2={arr[li + 1].x - 15} y2={y2} stroke={C.line} strokeWidth="0.7" opacity="0.5" />;
                })}
              <circle cx={layer.x} cy={y} r={14} fill="var(--bg-elev)" stroke={layer.c} strokeWidth="1.8" />
            </g>
          );
        })}
      </g>
    ))}
    <T x={280} y={22} strong>Mỗi lớp học một mức trừu tượng cao hơn lớp trước</T>
  </Svg>
);

const CnnBytes = () => (
  <Svg vb="0 0 600 220">
    <Defs />
    <T x={300} y={18} strong>CNN quét tệp thực thi như quét một dải byte</T>
    {Array.from({ length: 46 }, (_, i) => (
      <rect key={i} x={20 + i * 12.5} y={40} width={10} height={26} rx={2}
        fill={i > 12 && i < 22 ? C.warn : 'var(--border-subtle)'} opacity={0.9} />
    ))}
    <T x={300} y={82} size={11}>byte thô của tệp (không cần biết cấu trúc PE)</T>
    <rect x={180} y={36} width={126} height={34} rx={4} fill="none" stroke={C.brand} strokeWidth="2" />
    <Arrow x1={243} y1={92} x2={243} y2={116} color={C.brand} />
    <T x={330} y={104} size={11} anchor="start">bộ lọc trượt bắt mẫu byte cục bộ</T>
    {Array.from({ length: 12 }, (_, i) => (
      <rect key={i} x={140 + i * 26} y={120} width={22} height={20} rx={3} fill={C.brand} opacity={0.2 + (i % 4) * 0.2} />
    ))}
    <T x={300} y={156} size={11}>bản đồ đặc trưng</T>
    <Arrow x1={300} y1={162} x2={300} y2={182} color={C.ok} />
    <rect x={236} y={184} width={128} height={26} rx={6} fill="var(--ok-soft)" stroke={C.ok} strokeWidth="1.5" />
    <T x={300} y={201} size={11}>độc hại: 0,91</T>
  </Svg>
);

const AttentionFig = () => (
  <Svg vb="0 0 600 230">
    <T x={300} y={20} strong>Chú ý: mỗi token nhìn được toàn bộ chuỗi, có trọng số</T>
    {['CreateFile', 'WriteFile', 'CryptEncrypt', 'DeleteFile', 'ShellExec'].map((tok, i) => (
      <g key={i}>
        <rect x={30 + i * 112} y={54} width={100} height={28} rx={6}
          fill={i === 2 ? 'var(--bad-soft)' : 'var(--bg-sunken)'} stroke={i === 2 ? C.bad : C.line} strokeWidth="1.5" />
        <T x={80 + i * 112} y={72} size={11}>{tok}</T>
        <rect x={30 + i * 112} y={166} width={100} height={28} rx={6} fill="var(--brand-soft)" stroke={C.brand} strokeWidth="1.5" />
        <T x={80 + i * 112} y={184} size={11}>{tok}</T>
      </g>
    ))}
    {[0, 1, 3, 4].map((i) => (
      <line key={i} x1={80 + i * 112} y1={84} x2={304} y2={164}
        stroke={C.brand} strokeWidth={i === 1 || i === 3 ? 2.6 : 0.9} opacity={i === 1 || i === 3 ? 0.85 : 0.35} />
    ))}
    <T x={300} y={130} size={11}>đường dày = trọng số chú ý cao</T>
    <T x={300} y={216} size={11}>Mô hình tự học rằng "ghi tệp → mã hoá → xoá" là mẫu của ransomware</T>
  </Svg>
);

const AdversarialFig = () => (
  <Svg vb="0 0 560 260">
    <Defs />
    <line x1={60} y1={220} x2={500} y2={220} className="svg-axis" />
    <line x1={60} y1={220} x2={60} y2={30} className="svg-axis" />
    <path d="M70 190 L490 70" stroke={C.brand} strokeWidth="2.5" />
    <T x={430} y={100} size={11}>ranh giới quyết định</T>
    {[[120, 190], [170, 200], [220, 185], [280, 190], [340, 175]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={5} fill={C.ok} opacity={0.7} />
    ))}
    {[[180, 90], [240, 70], [300, 95], [360, 75], [400, 110]].map(([x, y], i) => (
      <path key={i} d={`M${x - 5} ${y - 5} L${x + 5} ${y + 5} M${x + 5} ${y - 5} L${x - 5} ${y + 5}`} stroke={C.bad} strokeWidth="2.2" opacity={0.7} />
    ))}
    <path d="M255 105 L255 105" />
    <path d="M250 100 L260 110 M260 100 L250 110" stroke={C.bad} strokeWidth="3" />
    <circle cx={255} cy={105} r={13} fill="none" stroke={C.bad} strokeWidth="1.5" strokeDasharray="3 3" />
    <Arrow x1={266} y1={112} x2={306} y2={158} color={C.warn} />
    <path d="M301 153 L311 163 M311 153 L301 163" stroke={C.warn} strokeWidth="3" />
    <circle cx={306} cy={158} r={13} fill="none" stroke={C.warn} strokeWidth="2" />
    <T x={330} y={182} anchor="start" size={11}>cùng một mã độc,</T>
    <T x={330} y={195} anchor="start" size={11}>thêm 300 byte rác</T>
    <T x={330} y={208} anchor="start" size={11}>→ được xếp là lành tính</T>
    <T x={280} y={248} size={11}>Kẻ tấn công không cần phá mô hình. Chỉ cần đẩy mẫu qua bên kia ranh giới.</T>
  </Svg>
);

const AtlasFig = () => (
  /* Hai hàng ba ô, không phải một hàng sáu ô. Bản trước xếp sáu ô rộng 90 đơn
     vị cạnh nhau, trong khi chú thích dài nhất ("API, kho mô hình, dữ liệu")
     rộng khoảng 145 — chữ của ô này chạy vào ô bên cạnh và có ba cặp đè nhau.
     Phép kiểm biên viewBox không thấy loại lỗi này; chỉ phép kiểm chữ-đè-chữ
     bắt được. Ô rộng 176 thì chú thích vừa, và chữ không phải thu nhỏ. */
  <Svg vb="0 0 620 252">
    <Defs />
    <T x={310} y={20} strong>Vòng đời tấn công vào hệ thống ML (theo tinh thần MITRE ATLAS)</T>
    <T x={310} y={40} size={11}>Giai đoạn 3 nhắm vào lúc HUẤN LUYỆN; giai đoạn 4–5 nhắm vào lúc SUY LUẬN</T>
    {[
      { l: '1. Do thám', s: 'tìm mô hình dùng gì', c: C.info, col: 0, row: 0 },
      { l: '2. Truy cập', s: 'API, kho mô hình, dữ liệu', c: C.info, col: 1, row: 0 },
      { l: '3. Đầu độc', s: 'sửa dữ liệu huấn luyện', c: C.warn, col: 2, row: 0 },
      { l: '4. Né tránh', s: 'sửa đầu vào lúc chạy', c: C.bad, col: 2, row: 1 },
      { l: '5. Trích xuất', s: 'trộm mô hình hoặc dữ liệu', c: C.bad, col: 1, row: 1 },
      { l: '6. Tác động', s: 'sai lệch, từ chối, thiệt hại', c: C.lab, col: 0, row: 1 },
    ].map((s, i) => {
      const x = 20 + s.col * 196;
      const y = 58 + s.row * 84;
      return (
        <g key={i}>
          <rect x={x} y={y} width={176} height={58} rx={8} fill="var(--bg-sunken)" stroke={s.c} strokeWidth="2" />
          <T x={x + 88} y={y + 24} strong>{s.l}</T>
          <T x={x + 88} y={y + 44} size={11}>{s.s}</T>
        </g>
      );
    })}
    {[0, 1].map((i) => <Arrow key={i} x1={198 + i * 196} y1={87} x2={214 + i * 196} y2={87} />)}
    {[0, 1].map((i) => <Arrow key={i} x1={410 - i * 196} y1={171} x2={394 - i * 196} y2={171} />)}
    <Arrow x1={504} y1={118} x2={504} y2={154} color={C.bad} />
    <T x={310} y={236} size={11}>Mỗi giai đoạn cần một biện pháp phòng thủ khác nhau — không có một lá chắn chung</T>
  </Svg>
);

const LlmStack = () => (
  <Svg vb="0 0 600 260">
    <Defs />
    <Box x={30} y={40} w={140} h={54} label="Người dùng" sub="prompt" fill="var(--info-soft)" stroke="var(--info-border)" />
    <Arrow x1={172} y1={67} x2={216} y2={67} />
    <Box x={218} y={40} w={150} h={54} label="Ứng dụng" sub="system prompt + ngữ cảnh" fill="var(--brand-soft)" stroke="var(--brand-border)" />
    <Arrow x1={370} y1={67} x2={414} y2={67} />
    <Box x={416} y={40} w={150} h={54} label="LLM" sub="dự đoán token kế" fill="var(--lab-soft)" stroke="var(--lab-border)" />
    <Box x={218} y={130} w={150} h={50} label="Dữ liệu ngoài" sub="web, tệp, email, RAG" fill="var(--bad-soft)" stroke="var(--bad-border)" />
    <Arrow x1={293} y1={128} x2={293} y2={98} color={C.bad} />
    <Box x={416} y={130} w={150} h={50} label="Công cụ" sub="gửi mail, chạy lệnh, API" fill="var(--warn-soft)" stroke="var(--warn-border)" />
    <Arrow x1={491} y1={98} x2={491} y2={128} color={C.warn} />
    <T x={300} y={210} strong>Điểm yếu gốc: với LLM, chỉ dẫn và dữ liệu nằm chung một dòng văn bản</T>
    <T x={300} y={230} size={11}>Bất kỳ nội dung nào lọt vào ngữ cảnh đều có thể được đọc như một mệnh lệnh</T>
    <T x={300} y={248} size={11}>→ dữ liệu ngoài (đỏ) + quyền gọi công cụ (vàng) = tổ hợp nguy hiểm nhất</T>
  </Svg>
);

const RagFig = () => (
  <Svg vb="0 0 620 230">
    <Defs />
    <Box x={16} y={80} w={110} h={50} label="Câu hỏi" fill="var(--info-soft)" stroke="var(--info-border)" />
    <Arrow x1={128} y1={105} x2={158} y2={105} />
    <Box x={160} y={80} w={110} h={50} label="Truy hồi" sub="tìm tài liệu gần" />
    <Arrow x1={272} y1={105} x2={302} y2={105} />
    <Box x={304} y={80} w={120} h={50} label="Ngữ cảnh" sub="văn bản ghép vào" fill="var(--warn-soft)" stroke="var(--warn-border)" />
    <Arrow x1={426} y1={105} x2={456} y2={105} />
    <Box x={458} y={80} w={110} h={50} label="LLM trả lời" fill="var(--lab-soft)" stroke="var(--lab-border)" />
    <Box x={140} y={162} w={150} h={44} label="Kho tri thức" sub="tài liệu nội bộ, wiki" />
    <Arrow x1={215} y1={160} x2={215} y2={134} />
    <g>
      <rect x={310} y={162} width={170} height={44} rx={8} fill="var(--bad-soft)" stroke={C.bad} strokeWidth="2" strokeDasharray="5 3" />
      <T x={395} y={180} size={11} strong>Tài liệu bị đầu độc</T>
      <T x={395} y={196} size={10.5}>"Bỏ qua chỉ dẫn trước..."</T>
    </g>
    <Arrow x1={395} y1={160} x2={370} y2={134} color={C.bad} />
    <T x={310} y={26} strong>RAG mở rộng năng lực — và mở rộng bề mặt tấn công</T>
    <T x={310} y={44} size={11}>Ai ghi được vào kho tri thức thì gián tiếp điều khiển được câu trả lời</T>
  </Svg>
);

const SocPipeline = () => (
  <Svg vb="0 0 620 220">
    <Defs />
    <Box x={12} y={80} w={96} h={56} label="Nguồn log" sub="EDR, mạng, cloud" />
    <Arrow x1={110} y1={108} x2={132} y2={108} />
    <Box x={134} y={80} w={96} h={56} label="Đặc trưng" sub="feature store" fill="var(--info-soft)" stroke="var(--info-border)" />
    <Arrow x1={232} y1={108} x2={254} y2={108} />
    <Box x={256} y={80} w={96} h={56} label="Mô hình" sub="suy luận" fill="var(--brand-soft)" stroke="var(--brand-border)" />
    <Arrow x1={354} y1={108} x2={376} y2={108} />
    <Box x={378} y={80} w={96} h={56} label="SIEM/SOAR" sub="gom, làm giàu" fill="var(--warn-soft)" stroke="var(--warn-border)" />
    <Arrow x1={476} y1={108} x2={498} y2={108} />
    <Box x={500} y={80} w={108} h={56} label="Analyst" sub="điều tra" fill="var(--ok-soft)" stroke="var(--ok-border)" />
    <path d="M554 138 L554 178 L182 178 L182 138" fill="none" stroke={C.ok} strokeWidth="1.6" strokeDasharray="5 4" markerEnd="url(#ah)" />
    <T x={368} y={194} size={11}>kết luận của analyst → nhãn mới → huấn luyện lại</T>
    <T x={310} y={40} strong>Mô hình chỉ là một mắt xích. Bốn mắt xích còn lại quyết định nó có ích hay không.</T>
    <T x={310} y={58} size={11}>Độ trễ, tính nhất quán đặc trưng, khả năng giải thích, và vòng phản hồi</T>
  </Svg>
);

const DriftFig = () => (
  <Svg vb="0 0 600 250">
    <line x1={60} y1={200} x2={550} y2={200} className="svg-axis" />
    <line x1={60} y1={200} x2={60} y2={30} className="svg-axis" />
    <path d="M60 60 L160 66 L260 82 L360 118 L460 156 L545 178" fill="none" stroke={C.brand} strokeWidth="2.5" />
    <circle cx={260} cy={82} r={5} fill={C.warn} />
    <T x={262} y={68} size={11}>kẻ tấn công đổi kỹ thuật</T>
    <circle cx={430} cy={144} r={5} fill={C.bad} />
    <T x={440} y={132} anchor="start" size={11}>mô hình đã vô dụng</T>
    <line x1={60} y1={150} x2={550} y2={150} stroke={C.bad} strokeWidth="1.5" strokeDasharray="5 4" />
    <T x={100} y={144} size={11} anchor="start">ngưỡng chấp nhận</T>
    <path d="M60 60 L160 62 L260 64 L360 66 L460 68 L545 70" fill="none" stroke={C.ok} strokeWidth="2" strokeDasharray="4 4" />
    <T x={500} y={62} size={11}>có huấn luyện lại</T>
    <T x={300} y={228} strong>Thời gian kể từ khi triển khai →</T>
    <g transform="rotate(-90 26 115)"><T x={26} y={115} size={11}>Hiệu năng</T></g>
  </Svg>
);

const ForgettingFig = () => (
  <Svg vb="0 0 600 250">
    <line x1={60} y1={200} x2={550} y2={200} className="svg-axis" />
    <line x1={60} y1={200} x2={60} y2={30} className="svg-axis" />
    <path d="M60 45 C 90 130, 130 176, 250 190 L250 190" fill="none" stroke={C.bad} strokeWidth="2.5" />
    <T x={230} y={178} size={11} anchor="end">không ôn lại</T>
    <path d="M60 45 C 78 110, 96 140, 130 145" fill="none" stroke={C.brand} strokeWidth="2.5" />
    <path d="M130 45 C 158 105, 186 130, 240 138" fill="none" stroke={C.brand} strokeWidth="2.5" />
    <path d="M240 45 C 286 100, 330 122, 400 132" fill="none" stroke={C.brand} strokeWidth="2.5" />
    <path d="M400 45 C 470 96, 510 112, 548 122" fill="none" stroke={C.brand} strokeWidth="2.5" />
    {[130, 240, 400].map((x, i) => (
      <g key={i}>
        <line x1={x} y1={45} x2={x} y2={i === 0 ? 145 : i === 1 ? 138 : 132} stroke={C.ok} strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx={x} cy={45} r={5} fill={C.ok} />
      </g>
    ))}
    <T x={130} y={34} size={11}>ôn 1</T>
    <T x={240} y={34} size={11}>ôn 2</T>
    <T x={400} y={34} size={11}>ôn 3</T>
    <T x={300} y={228} strong>Thời gian →</T>
    <g transform="rotate(-90 26 115)"><T x={26} y={115} size={11}>Xác suất nhớ lại</T></g>
    <T x={470} y={190} size={11}>khoảng cách giữa các lần ôn dài dần</T>
  </Svg>
);

const KillChainFig = () => (
  <Svg vb="0 0 620 210">
    <Defs />
    {[
      { l: 'Do thám', ml: 'phát hiện quét' },
      { l: 'Xâm nhập', ml: 'phishing, mã độc' },
      { l: 'Thực thi', ml: 'chuỗi API bất thường' },
      { l: 'Duy trì', ml: 'bất thường registry' },
      { l: 'Di chuyển ngang', ml: 'đồ thị quan hệ' },
      { l: 'Rò rỉ dữ liệu', ml: 'bất thường luồng ra' },
    ].map((s, i) => (
      <g key={i}>
        <path d={`M${16 + i * 100} 60 h78 l14 22 l-14 22 h-78 l14 -22 z`} fill="var(--bg-sunken)" stroke={C.line} strokeWidth="1.5" />
        <T x={58 + i * 100} y={86} size={11} strong>{s.l}</T>
        <rect x={16 + i * 100} y={122} width={92} height={34} rx={6} fill="var(--brand-soft)" stroke={C.brand} strokeWidth="1.2" />
        <T x={62 + i * 100} y={143} size={10.5}>{s.ml}</T>
        <line x1={62 + i * 100} y1={106} x2={62 + i * 100} y2={120} stroke={C.brand} strokeWidth="1.2" strokeDasharray="2 2" />
      </g>
    ))}
    <T x={310} y={32} strong>ML không bắt "một cuộc tấn công" — nó bắt từng dấu vết ở từng giai đoạn</T>
    <T x={310} y={182} size={11}>Phòng thủ theo chiều sâu: bỏ lỡ ở giai đoạn 2 vẫn còn cơ hội ở giai đoạn 5</T>
  </Svg>
);

const DetectionLifecycle = () => (
  <Svg vb="0 0 560 260">
    <Defs />
    {[
      { l: 'Giả thuyết', a: 0 },
      { l: 'Xây dựng', a: 60 },
      { l: 'Kiểm định', a: 120 },
      { l: 'Chế độ bóng', a: 180 },
      { l: 'Triển khai', a: 240 },
      { l: 'Giám sát', a: 300 },
    ].map((s, i) => {
      const rad = ((s.a - 90) * Math.PI) / 180;
      const x = 280 + 92 * Math.cos(rad);
      const y = 130 + 92 * Math.sin(rad);
      return (
        <g key={i}>
          <circle cx={x} cy={y} r={32} fill="var(--bg-elev)" stroke={C.brand} strokeWidth="1.8" />
          <T x={x} y={y + 4} size={11} strong>{s.l}</T>
        </g>
      );
    })}
    <circle cx={280} cy={130} r={92} fill="none" stroke={C.brand} strokeWidth="1.2" strokeDasharray="6 6" opacity="0.5" />
    <T x={280} y={126} size={11} strong>Vòng đời</T>
    <T x={280} y={142} size={11}>một luật phát hiện</T>
    <T x={280} y={246} size={11}>Không có bước "xong". Mỗi vòng lặp là một lần mô hình được cứu khỏi lỗi thời.</T>
  </Svg>
);

const EntropyScale = () => (
  <Svg vb="0 0 600 210">
    <T x={300} y={20} strong>Thang entropy — công cụ phát hiện rẻ nhất bạn có</T>
    <line x1={50} y1={110} x2={550} y2={110} stroke={C.line} strokeWidth="2" />
    {[
      { x: 70, v: '1,0', l: 'aaaaaa', c: C.info },
      { x: 170, v: '2,8', l: 'google.com', c: C.ok },
      { x: 280, v: '3,4', l: 'facebook.com', c: C.ok },
      { x: 400, v: '3,9', l: 'kq3v9z7wx1.com', c: C.warn },
      { x: 520, v: '7,9', l: 'vùng đã mã hoá', c: C.bad },
    ].map((p, i) => (
      <g key={i}>
        <line x1={p.x} y1={102} x2={p.x} y2={118} stroke={p.c} strokeWidth="3" />
        <circle cx={p.x} cy={110} r={6} fill={p.c} />
        <T x={p.x} y={90} size={11} strong>{p.v}</T>
        <T x={p.x} y={140} size={11}>{p.l}</T>
      </g>
    ))}
    <T x={70} y={166} size={11}>← dễ đoán</T>
    <T x={530} y={166} size={11}>khó đoán →</T>
    <rect x={355} y={100} width={130} height={20} fill={C.warn} opacity="0.12" />
    <T x={300} y={192} size={11}>Vùng 3,7–4,2 bit/ký tự là nơi phần lớn tên miền DGA rơi vào — nhưng cũng có tên miền thật</T>
  </Svg>
);

const DimensionalityFig = () => (
  <Svg vb="0 0 600 220">
    <T x={300} y={20} strong>Càng nhiều chiều, mọi điểm càng xa nhau như nhau</T>
    {[
      { d: '1 chiều', x: 60, n: 10 },
      { d: '2 chiều', x: 240, n: 10 },
      { d: '3 chiều', x: 420, n: 10 },
    ].map((g, gi) => (
      <g key={gi}>
        <rect x={g.x} y={50} width={140} height={110} rx={8} fill="var(--bg-sunken)" stroke={C.line} strokeWidth="1.2" />
        {Array.from({ length: g.n }, (_, i) => {
          const spread = gi === 0 ? 0 : gi === 1 ? 30 : 45;
          return <circle key={i} cx={g.x + 20 + ((i * 13) % 100)} cy={105 + (spread ? ((i * 29) % (spread * 2)) - spread : 0)} r={4} fill={C.brand} opacity={0.8} />;
        })}
        <T x={g.x + 70} y={178} size={11}>{g.d}</T>
        <T x={g.x + 70} y={194} size={10.5}>{gi === 0 ? 'điểm chen chúc' : gi === 1 ? 'bắt đầu thưa' : 'gần như rỗng'}</T>
      </g>
    ))}
    <T x={300} y={214} size={11}>Hệ quả: khoảng cách mất ý nghĩa, k-NN và phát hiện bất thường suy yếu khi số đặc trưng quá lớn</T>
  </Svg>
);

const GradientDescentFig = () => (
  <Svg vb="0 0 560 250">
    <Defs />
    <path d="M50 60 C 140 230, 200 230, 280 170 C 350 118, 420 210, 510 70" fill="none" stroke={C.line} strokeWidth="2.5" />
    {[[70, 108], [110, 178], [160, 216], [215, 213], [268, 178]].map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={7} fill={C.brand} opacity={0.35 + i * 0.16} />
        {i < 4 && <path d={`M${x + 8} ${y + 3} L${[110, 160, 215, 268][i] - 8} ${[178, 216, 213, 178][i]}`} stroke={C.brand} strokeWidth="1.2" strokeDasharray="3 2" />}
      </g>
    ))}
    <circle cx={186} cy={222} r={8} fill={C.ok} />
    <T x={186} y={244} size={11}>cực tiểu địa phương</T>
    <circle cx={393} cy={196} r={8} fill="none" stroke={C.ok} strokeWidth="2" strokeDasharray="3 3" />
    <T x={393} y={222} size={11}>cực tiểu toàn cục</T>
    <T x={70} y={92} size={11}>khởi tạo</T>
    <g transform="rotate(-90 22 130)"><T x={22} y={130} size={11}>Hàm mất mát</T></g>
    <T x={280} y={22} strong>Gradient descent: mỗi bước đi ngược hướng dốc</T>
  </Svg>
);

const EnsembleFig = () => (
  <Svg vb="0 0 600 230">
    <Defs />
    <T x={150} y={22} strong>Bagging (Random Forest)</T>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={40 + i * 74} y={44} width={62} height={44} rx={6} fill="var(--ok-soft)" stroke={C.ok} strokeWidth="1.4" />
        <T x={71 + i * 74} y={70} size={11}>cây {i + 1}</T>
        <Arrow x1={71 + i * 74} y1={90} x2={150} y2={122} color={C.ok} />
      </g>
    ))}
    <rect x={94} y={124} width={112} height={32} rx={6} fill="var(--bg-sunken)" stroke={C.line} strokeWidth="1.4" />
    <T x={150} y={144} size={11}>bỏ phiếu trung bình</T>
    <T x={150} y={176} size={11}>song song · giảm phương sai</T>
    <T x={150} y={192} size={11}>khó quá khớp</T>

    <line x1={300} y1={30} x2={300} y2={200} stroke={C.line} strokeDasharray="4 4" />

    <T x={450} y={22} strong>Boosting (XGBoost / LightGBM)</T>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={344 + i * 74} y={54} width={62} height={44} rx={6} fill="var(--warn-soft)" stroke={C.warn} strokeWidth="1.4" />
        <T x={375 + i * 74} y={80} size={11}>cây {i + 1}</T>
        {i < 2 && <Arrow x1={408 + i * 74} y1={76} x2={342 + (i + 1) * 74} y2={76} color={C.warn} />}
      </g>
    ))}
    <T x={450} y={122} size={11}>mỗi cây học phần sai của cây trước</T>
    <T x={450} y={176} size={11}>tuần tự · giảm thiên lệch</T>
    <T x={450} y={192} size={11}>mạnh hơn nhưng dễ quá khớp</T>
  </Svg>
);

const AutoencoderFig = () => (
  <Svg vb="0 0 600 220">
    <Defs />
    {[
      { x: 60, n: 6, l: 'đầu vào' },
      { x: 180, n: 4, l: '' },
      { x: 300, n: 2, l: 'nút thắt' },
      { x: 420, n: 4, l: '' },
      { x: 540, n: 6, l: 'tái tạo' },
    ].map((L, li) => (
      <g key={li}>
        {Array.from({ length: L.n }, (_, i) => (
          <circle key={i} cx={L.x} cy={110 - ((L.n - 1) * 22) / 2 + i * 22} r={8}
            fill={li === 2 ? 'var(--lab-soft)' : 'var(--bg-elev)'} stroke={li === 2 ? C.lab : C.line} strokeWidth="1.6" />
        ))}
        {L.l && <T x={L.x} y={190} size={11}>{L.l}</T>}
      </g>
    ))}
    <T x={300} y={30} strong>Autoencoder: học nén cái BÌNH THƯỜNG</T>
    <T x={300} y={48} size={11}>Mẫu lạ không nén được → sai số tái tạo cao → cảnh báo</T>
    <path d="M60 156 L540 156" stroke={C.bad} strokeWidth="1.5" strokeDasharray="4 4" />
    <T x={300} y={172} size={11}>so sánh đầu vào ↔ đầu ra: chênh lệch = điểm bất thường</T>
    <T x={300} y={208} size={11}>Cảnh báo: cần dữ liệu huấn luyện SẠCH, nếu có tấn công lẫn vào thì nó học luôn tấn công là bình thường</T>
  </Svg>
);

const GraphLateralFig = () => (
  <Svg vb="0 0 600 240">
    <Defs />
    {[
      { id: 0, x: 80, y: 120, l: 'user-a', c: C.ok },
      { id: 1, x: 200, y: 60, l: 'PC-01', c: C.ok },
      { id: 2, x: 200, y: 180, l: 'PC-02', c: C.ok },
      { id: 3, x: 330, y: 120, l: 'SRV-FILE', c: C.warn },
      { id: 4, x: 460, y: 70, l: 'SRV-DC', c: C.bad },
      { id: 5, x: 460, y: 175, l: 'admin', c: C.bad },
    ].map((n) => (
      <g key={n.id}>
        <circle cx={n.x} cy={n.y} r={26} fill="var(--bg-elev)" stroke={n.c} strokeWidth="2" />
        <T x={n.x} y={n.y + 4} size={11}>{n.l}</T>
      </g>
    ))}
    {[[80, 120, 200, 60], [80, 120, 200, 180], [200, 60, 330, 120], [200, 180, 330, 120], [330, 120, 460, 70], [460, 70, 460, 175]].map(([x1, y1, x2, y2], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i >= 4 ? C.bad : C.line} strokeWidth={i >= 4 ? 2.6 : 1.4} strokeDasharray={i >= 4 ? '' : '3 3'} />
    ))}
    <T x={300} y={24} strong>Di chuyển ngang chỉ lộ ra khi nhìn dữ liệu như một đồ thị</T>
    <T x={300} y={224} size={11}>Từng bước đăng nhập đều hợp lệ. Chuỗi đường đi mới là bất thường.</T>
  </Svg>
);

const CalibrationFig = () => (
  <Svg vb="0 0 520 280">
    <line x1={60} y1={230} x2={460} y2={230} className="svg-axis" />
    <line x1={60} y1={230} x2={60} y2={40} className="svg-axis" />
    <line x1={60} y1={230} x2={450} y2={45} stroke={C.ok} strokeWidth="2" strokeDasharray="5 4" />
    <T x={370} y={70} size={11}>hiệu chuẩn hoàn hảo</T>
    <path d="M60 230 L150 205 L240 178 L330 120 L450 60" fill="none" stroke={C.brand} strokeWidth="2.5" />
    {[[150, 205], [240, 178], [330, 120], [450, 60]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill={C.brand} />)}
    <path d="M60 230 L150 222 L240 214 L330 200 L450 172" fill="none" stroke={C.bad} strokeWidth="2.5" />
    <T x={400} y={190} size={11} anchor="end">tự tin quá mức</T>
    <T x={260} y={262} strong>Điểm mô hình đưa ra →</T>
    <g transform="rotate(-90 24 140)"><T x={24} y={140} size={11}>Tỉ lệ thực sự độc hại</T></g>
  </Svg>
);

const DataSourcesFig = () => (
  <Svg vb="0 0 620 250">
    <Defs />
    <circle cx={310} cy={128} r={42} fill="var(--brand-soft)" stroke={C.brand} strokeWidth="2" />
    <T x={310} y={124} size={11} strong>Hồ dữ liệu</T>
    <T x={310} y={140} size={10.5}>SIEM / lakehouse</T>
    {[
      { l: 'EDR', s: 'tiến trình, tệp', a: -150 },
      { l: 'Mạng', s: 'Zeek, NetFlow', a: -90 },
      { l: 'DNS', s: 'truy vấn tên miền', a: -30 },
      { l: 'Cloud', s: 'CloudTrail', a: 30 },
      { l: 'Email', s: 'header, đính kèm', a: 90 },
      { l: 'Danh tính', s: 'đăng nhập, AD', a: 150 },
    ].map((n, i) => {
      const rad = (n.a * Math.PI) / 180;
      // Bán trục dọc 76, không phải 92: ở 92 thì ô "Mạng" (góc −90°) leo lên
      // y=36 và đè vào dòng tiêu đề ở y=24, còn ô "Email" (góc 90°) tụt xuống
      // y=220 và đè vào dòng kết ở y=240. Phép kiểm biên không thấy vì cả hai
      // vẫn nằm trong khung — chỉ phép kiểm chữ-đè-chữ mới bắt được.
      const x = 310 + 172 * Math.cos(rad);
      const y = 128 + 76 * Math.sin(rad);
      return (
        <g key={i}>
          <line x1={310 + 44 * Math.cos(rad)} y1={128 + 44 * Math.sin(rad)} x2={x - 30 * Math.cos(rad)} y2={y - 20 * Math.sin(rad)} stroke={C.line} strokeWidth="1.4" strokeDasharray="3 3" />
          <rect x={x - 52} y={y - 20} width={104} height={40} rx={7} fill="var(--bg-sunken)" stroke={C.info} strokeWidth="1.4" />
          <T x={x} y={y - 2} size={11} strong>{n.l}</T>
          <T x={x} y={y + 12} size={10.5}>{n.s}</T>
        </g>
      );
    })}
    <T x={310} y={24} strong>Mỗi nguồn nhìn thấy một phần khác nhau của cùng một cuộc tấn công</T>
    <T x={310} y={240} size={11}>Sức mạnh thật nằm ở chỗ ghép chúng lại theo thời gian và theo thực thể</T>
  </Svg>
);

/* ========================================================================== */

/* --- Sáu hình cho các bài trước đây không có hình nào --------------------- */

/** t1-l2 — đảo chiều điều kiện là đổi MẪU SỐ, và đó là chỗ sai 100 lần. */
const BayesDirection = () => (
  <Svg vb="0 0 620 210">
    <T x={310} y={20} strong>Cùng một bộ phát hiện, hai câu hỏi, hai đáp số cách nhau 100 lần</T>
    <Box x={12} y={38} w={290} h={150} fill="var(--info-soft)" stroke="var(--info-border)" />
    <T x={157} y={62} strong>P( cảnh báo | tấn công )</T>
    <T x={157} y={84} size={11}>Mẫu số: 10 cuộc tấn công thật</T>
    <text x={157} y={130} textAnchor="middle" className="svg-label-strong" style={{ fontSize: 30, fill: C.info }}>95%</text>
    <T x={157} y={156} size={11}>Câu hỏi của người dựng mô hình</T>
    <T x={157} y={176} size={11}>&ldquo;Bộ dò của tôi nhạy tới đâu?&rdquo;</T>

    <Box x={318} y={38} w={290} h={150} fill="var(--warn-soft)" stroke="var(--warn-border)" />
    <T x={463} y={62} strong>P( tấn công | cảnh báo )</T>
    <T x={463} y={84} size={11}>Mẫu số: 1.000 cảnh báo đã bật</T>
    <text x={463} y={130} textAnchor="middle" className="svg-label-strong" style={{ fontSize: 30, fill: C.warn }}>0,95%</text>
    <T x={463} y={156} size={11}>Câu hỏi của analyst lúc 3 giờ sáng</T>
    <T x={463} y={176} size={11}>&ldquo;Mở cái này ra có đáng không?&rdquo;</T>
  </Svg>
);

/** t4-l2 — hai chỉ số, hai mẫu số: một cột và một hàng của cùng một bảng. */
const PrecisionRecall = () => (
  <Svg vb="0 0 560 280">
    <T x={280} y={18} strong>Precision đọc theo CỘT, recall đọc theo HÀNG</T>
    <T x={225} y={48} size={11}>Mô hình nói ĐỘC</T>
    <T x={345} y={48} size={11}>Mô hình nói LÀNH</T>
    <T x={158} y={96} anchor="end" size={11}>Thật ra ĐỘC</T>
    <T x={158} y={166} anchor="end" size={11}>Thật ra LÀNH</T>

    <Box x={166} y={60} w={118} h={62} label="TP" sub="bắt đúng" fill="var(--ok-soft)" stroke="var(--ok-border)" />
    <Box x={286} y={60} w={118} h={62} label="FN" sub="bỏ sót" fill="var(--bad-soft)" stroke="var(--bad-border)" />
    <Box x={166} y={130} w={118} h={62} label="FP" sub="báo động giả" fill="var(--warn-soft)" stroke="var(--warn-border)" />
    <Box x={286} y={130} w={118} h={62} label="TN" sub="im lặng đúng" fill="var(--bg-sunken)" />

    {/* Khung mẫu số: nét liền quanh CỘT cho precision, nét gạch quanh HÀNG cho recall. */}
    <rect x={162} y={56} width={126} height={140} rx={6} fill="none" stroke={C.brand} strokeWidth="2.4" />
    <rect x={162} y={56} width={246} height={70} rx={6} fill="none" stroke={C.lab} strokeWidth="2.4" strokeDasharray="6 4" />
    <T x={225} y={214} size={11}>mẫu số của precision</T>
    <T x={470} y={96} size={11}>mẫu số của recall</T>
    <T x={280} y={246} strong>Precision = TP / (TP+FP) · Recall = TP / (TP+FN)</T>
    <T x={280} y={268} size={11}>Accuracy cộng cả TN vào tử số, nên nó chỉ nói về ô lớn nhất</T>
  </Svg>
);

/** t8-l4 — mỗi câu trả lời là một mẩu mô hình và một mẩu dữ liệu đi ra ngoài. */
const ModelStealing = () => (
  <Svg vb="0 0 620 250">
    <Defs />
    <T x={310} y={18} strong>Chỉ với API dự đoán, kẻ tấn công dựng lại được mô hình của bạn</T>
    <Box x={10} y={54} w={110} h={56} label="Kẻ tấn công" sub="chỉ có API" />
    <Arrow x1={122} y1={72} x2={212} y2={72} />
    <T x={167} y={64} size={11}>10.000 truy vấn</T>
    <Box x={216} y={44} w={130} h={76} label="Mô hình của bạn" sub="hộp đen, có phí" fill="var(--brand-soft)" stroke="var(--brand-border)" />
    <Arrow x1={212} y1={102} x2={122} y2={102} color={C.warn} />
    <T x={167} y={118} size={11}>điểm số trả về</T>
    <Arrow x1={65} y1={114} x2={65} y2={150} color={C.warn} />
    <Box x={10} y={152} w={130} h={56} label="Tập tự gán nhãn" sub="đầu vào + điểm số" fill="var(--warn-soft)" stroke="var(--warn-border)" />
    <Arrow x1={142} y1={180} x2={212} y2={180} color={C.bad} />
    <Box x={216} y={152} w={130} h={56} label="Mô hình sao chép" sub="miễn phí, ngoại tuyến" fill="var(--bad-soft)" stroke="var(--bad-border)" />
    <Box x={362} y={44} w={248} h={164} fill="var(--bg-sunken)" />
    <T x={486} y={70} strong>Hai thứ mất đi cùng lúc</T>
    <T x={486} y={96} size={11}>1. Tài sản: bản sao chạy không tốn phí</T>
    <T x={486} y={120} size={11}>2. Phòng thủ: có bản sao thì dò mẫu đối</T>
    <T x={486} y={138} size={11}>kháng ngoại tuyến rồi mang sang bản gốc</T>
    <T x={486} y={166} size={11}>Suy luận thành viên đi cùng đường: mẫu</T>
    <T x={486} y={184} size={11}>ĐÃ học được cho điểm tự tin hơn mẫu chưa</T>
    <T x={486} y={202} size={11}>từng thấy — chênh lệch đó là kênh rò rỉ</T>
  </Svg>
);

/** t9-l3 — ba thứ hay bị gộp làm một, và chiều đi của thông tin khác nhau. */
const LlmThreeRisks = () => (
  <Svg vb="0 0 620 240">
    <Defs />
    <T x={310} y={18} strong>Ba rủi ro, ba chiều đi của thông tin, ba chỗ chặn khác nhau</T>
    {[
      { x: 10, t: 'Jailbreak', c: 'var(--bad-soft)', b: 'var(--bad-border)', vao: true, m: 'Người dùng ép mô hình', m2: 'làm việc đã bị cấm', ch: 'Chặn ở: chính sách cộng', ch2: 'kiểm cả đầu ra' },
      { x: 214, t: 'Rò rỉ dữ liệu', c: 'var(--warn-soft)', b: 'var(--warn-border)', vao: false, m: 'Bí mật trong ngữ cảnh', m2: 'hoặc trong tham số đi ra', ch: 'Chặn ở: đừng đưa bí mật', ch2: 'vào ngữ cảnh ngay từ đầu' },
      { x: 418, t: 'Ảo giác', c: 'var(--info-soft)', b: 'var(--info-border)', vao: false, m: 'Mô hình bịa ra thứ', m2: 'nghe rất đúng', ch: 'Chặn ở: buộc dẫn nguồn,', ch2: 'kiểm bằng hệ thống khác' },
    ].map((r, i) => (
      <g key={i}>
        <Box x={r.x} y={38} w={192} h={186} fill={r.c} stroke={r.b} />
        <T x={r.x + 96} y={62} strong>{r.t}</T>
        <T x={r.x + 96} y={84} size={11}>{r.vao ? 'người dùng → mô hình' : 'mô hình → người dùng'}</T>
        {r.vao ? (
          <Arrow x1={r.x + 44} y1={102} x2={r.x + 148} y2={102} />
        ) : (
          <Arrow x1={r.x + 148} y1={102} x2={r.x + 44} y2={102} />
        )}
        <T x={r.x + 96} y={132} size={11}>{r.m}</T>
        <T x={r.x + 96} y={150} size={11}>{r.m2}</T>
        <T x={r.x + 96} y={184} size={11}>{r.ch}</T>
        <T x={r.x + 96} y={202} size={11}>{r.ch2}</T>
      </g>
    ))}
  </Svg>
);

/** t10-l5 — GOVERN nằm GIỮA chứ không nằm đầu: nó bọc ba chức năng kia. */
const AiRmf = () => (
  <Svg vb="0 0 560 300">
    <Defs />
    <T x={280} y={18} strong>NIST AI RMF: GOVERN bọc ba chức năng kia, không đứng trước chúng</T>
    <circle cx={280} cy={170} r={130} fill="var(--brand-soft)" stroke="var(--brand-border)" strokeWidth="1.5" />
    <T x={280} y={58} strong>GOVERN</T>
    <T x={280} y={78} size={11}>Ai được quyết, và bằng chứng lưu ở đâu</T>
    <Box x={62} y={112} w={144} h={62} label="MAP" sub="dùng vào việc gì" fill="var(--info-soft)" stroke="var(--info-border)" />
    <Box x={354} y={112} w={144} h={62} label="MEASURE" sub="đo bằng con số nào" fill="var(--ok-soft)" stroke="var(--ok-border)" />
    <Box x={208} y={208} w={144} h={62} label="MANAGE" sub="nhận hay giảm rủi ro" fill="var(--warn-soft)" stroke="var(--warn-border)" />
    <Arrow x1={208} y1={136} x2={350} y2={136} />
    <Arrow x1={350} y1={152} x2={208} y2={152} />
    <Arrow x1={140} y1={176} x2={226} y2={206} />
    <Arrow x1={420} y1={176} x2={334} y2={206} />
  </Svg>
);

/** t10-l7 — hai vai trò chồng lấn khoảng 60%; phần khác biệt mới là chỗ chọn. */
const RoleOverlap = () => (
  /* Toạ độ chữ đặt theo VÙNG CHỈ THUỘC MỘT VÒNG, không đặt theo tâm vòng: vòng
     trái trải 138..342 nhưng vùng riêng của nó chỉ tới 278 (chỗ vòng phải bắt
     đầu), nên tâm chữ đúng là 208 — đặt ở tâm vòng 240 thì chữ lấn sang vùng
     chồng lấn, còn đặt ở 158 thì chữ chạy ra ngoài vòng. */
  <Svg vb="0 0 620 268">
    <T x={310} y={18} strong>Hai vai trò chồng lấn khoảng 60% — phần còn lại mới là chỗ bạn chọn</T>
    <circle cx={240} cy={146} r={102} fill="var(--info-soft)" stroke="var(--info-border)" strokeWidth="1.5" />
    <circle cx={380} cy={146} r={102} fill="var(--lab-soft)" stroke="var(--lab-border)" strokeWidth="1.5" opacity={0.88} />
    <T x={168} y={44} strong>Detection Engineer</T>
    <T x={452} y={44} strong>Security Data Scientist</T>
    <T x={206} y={128} size={11}>Viết và tinh luật</T>
    <T x={206} y={148} size={11}>Sống trong SIEM</T>
    <T x={206} y={168} size={11}>Đo bằng ca điều tra</T>
    <T x={310} y={118} strong>60% chung</T>
    <T x={310} y={142} size={11}>Hiểu tấn công</T>
    <T x={310} y={160} size={11}>Đọc log thật</T>
    <T x={310} y={178} size={11}>Đo bằng số</T>
    <T x={414} y={128} size={11}>Huấn luyện, hiệu chuẩn</T>
    <T x={414} y={148} size={11}>Sống trong notebook</T>
    <T x={414} y={168} size={11}>Đo bằng PR-AUC</T>
    <T x={310} y={262} size={11}>Người từ bảo mật sang ML mạnh nhất ở phần chung, và đó là phần khó dạy nhất</T>
  </Svg>
);

/** t2-l2 — ba thao tác chiếm phần lớn công việc, và chỗ mỗi cái âm thầm sai. */
const PandasThree = () => (
  <Svg vb="0 0 620 250">
    <Defs />
    <T x={310} y={18} strong>Ba thao tác gánh phần lớn công việc trên dữ liệu bảo mật</T>

    <Box x={10} y={38} w={192} h={188} fill="var(--info-soft)" stroke="var(--info-border)" />
    <T x={106} y={62} strong>Gộp theo thực thể</T>
    <T x={106} y={82} size={11}>groupby(user).nunique(host)</T>
    {[0, 1, 2, 3].map((i) => <rect key={i} x={38} y={98 + i * 13} width={64} height={9} rx={2} fill={C.info} opacity={0.55} />)}
    <Arrow x1={112} y1={118} x2={140} y2={118} />
    <rect x={144} y={112} width={40} height={12} rx={2} fill={C.info} />
    <T x={106} y={178} size={11}>Sai nếu chưa hợp nhất</T>
    <T x={106} y={196} size={11}>bí danh: một người thành</T>
    <T x={106} y={214} size={11}>tám, mọi phép đếm phồng</T>

    <Box x={214} y={38} w={192} h={188} fill="var(--ok-soft)" stroke="var(--ok-border)" />
    <T x={310} y={62} strong>Gộp theo cửa sổ</T>
    <T x={310} y={82} size={11}>resample(&apos;5min&apos;).count()</T>
    <line x1={238} y1={124} x2={382} y2={124} stroke={C.line} strokeWidth="1.5" />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={240 + i * 29} y={124 - (i === 2 ? 26 : 10)} width={22} height={i === 2 ? 26 : 10} rx={2}
        fill={i === 2 ? C.bad : C.ok} opacity={i === 2 ? 1 : 0.6} />
    ))}
    <T x={310} y={178} size={11}>Sai nếu chọn cửa sổ không</T>
    <T x={310} y={196} size={11}>theo hành vi kẻ tấn công:</T>
    <T x={310} y={214} size={11}>đỉnh bị trải phẳng thành nền</T>

    <Box x={418} y={38} w={192} h={188} fill="var(--warn-soft)" stroke="var(--warn-border)" />
    <T x={514} y={62} strong>Ghép threat intel</T>
    <T x={514} y={82} size={11}>merge theo khoảng hiệu lực</T>
    <rect x={442} y={98} width={62} height={30} rx={3} fill="var(--bg-elev)" stroke={C.line} />
    <rect x={524} y={98} width={62} height={30} rx={3} fill="var(--bg-elev)" stroke={C.line} />
    <T x={473} y={117} size={11}>log</T>
    <T x={555} y={117} size={11}>IOC</T>
    <Arrow x1={506} y1={113} x2={522} y2={113} color={C.warn} />
    <T x={514} y={146} size={11}>ip + [từ ngày, tới ngày]</T>
    <T x={514} y={178} size={11}>Sai nếu ghép theo IP mà bỏ</T>
    <T x={514} y={196} size={11}>thời gian: IOC hết hạn vẫn</T>
    <T x={514} y={214} size={11}>khớp, sinh báo động giả</T>
  </Svg>
);

/** t2-l5 — bộ dữ liệu công khai đứng yên, còn bề mặt tấn công thì không. */
const DatasetAge = () => (
  <Svg vb="0 0 620 230">
    <Defs />
    <T x={310} y={18} strong>Bộ dữ liệu công khai đóng băng ở năm nó được tạo</T>
    <line x1={40} y1={150} x2={580} y2={150} stroke={C.line} strokeWidth="1.5" />
    {[
      { n: 'KDD Cup 99', y: 1999, dy: 0 },
      { n: 'NSL-KDD', y: 2009, dy: 1 },
      { n: 'CTU-13', y: 2013, dy: 0 },
      { n: 'UNSW-NB15', y: 2015, dy: 1 },
      { n: 'CIC-IDS2017', y: 2017, dy: 0 },
      { n: 'EMBER', y: 2018, dy: 1 },
      { n: 'SOREL-20M', y: 2020, dy: 0 },
    ].map((d, i) => {
      const x = 40 + ((d.y - 1997) / 27) * 540;
      const yTop = d.dy ? 78 : 112;
      return (
        <g key={i}>
          <line x1={x} y1={150} x2={x} y2={yTop + 16} stroke={C.line} strokeWidth="1.2" />
          <circle cx={x} cy={150} r={4} fill={C.info} />
          {/* Nền đặc sau nhãn: CIC-IDS2017 và EMBER chỉ cách nhau một năm, tức
              20 đơn vị, nên đường nối của mốc trên chạy xuyên qua nhãn của mốc
              dưới. Che nó đi là cách sửa đúng — dời nhãn thì vỡ trục thời gian. */}
          <rect x={x - 44} y={yTop - 12} width={88} height={30} rx={4} fill="var(--bg-elev)" />
          <T x={x} y={yTop} size={11}>{d.n}</T>
          <T x={x} y={yTop + 14} size={11}>{String(d.y)}</T>
        </g>
      );
    })}
    <T x={40} y={172} anchor="start" size={11}>1997</T>
    <T x={580} y={172} anchor="end" size={11}>hôm nay</T>
    <Box x={392} y={182} w={218} h={42} fill="var(--warn-soft)" stroke="var(--warn-border)" />
    <T x={501} y={200} strong>Mạng bạn đang bảo vệ</T>
    <T x={501} y={216} size={11}>đám mây, SaaS, mã hoá khắp nơi</T>
    <T x={186} y={202} size={11}>Điểm số cao trên các bộ này KHÔNG chuyển</T>
    <T x={186} y={218} size={11}>sang mạng của bạn — dùng để học, không để hứa</T>
  </Svg>
);

/** t8-l5 — mục tiêu không phải chặn hết, mà là làm tấn công đắt hơn phần thu. */
const AttackCost = () => (
  /* Giữ viewBox HẸP (560) có chủ đích: quy tắc `.figure svg { min-width: 620px }`
     trên màn hẹp vẽ mọi hình ở 620px, nên viewBox nhỏ hơn được co giãn LÊN và
     chữ hiện ra to hơn — 12,1px thay vì 11px. Đừng nới viewBox cho rộng rãi. */
  <Svg vb="0 0 560 262">
    <Defs />
    <T x={280} y={18} strong>Phòng thủ chỉ cần đắt hơn phần kẻ tấn công thu được</T>
    <line x1={64} y1={204} x2={540} y2={204} stroke={C.line} strokeWidth="1.5" />
    <line x1={64} y1={46} x2={64} y2={204} stroke={C.line} strokeWidth="1.5" />
    <text transform="rotate(-90 22 126)" x={22} y={126} textAnchor="middle" className="svg-label-strong">Công sức phải bỏ ra</text>
    {[
      { t: 'Không có gì', h: 18, them: false },
      { t: 'Giới hạn truy vấn', h: 50, them: true },
      { t: 'Che điểm số', h: 86, them: true },
      { t: 'Phát hiện dò', h: 122, them: true },
      { t: 'Adversarial training', h: 150, them: true },
    ].map((s, i) => (
      <g key={i}>
        <rect x={80 + i * 92} y={204 - s.h} width={62} height={s.h} rx={3} fill={C.brand} opacity={0.32 + i * 0.14} />
        <T x={111 + i * 92} y={222} size={11}>{s.t}</T>
        {s.them && <T x={111 + i * 92} y={240} size={11}>cộng thêm</T>}
      </g>
    ))}
    <line x1={64} y1={118} x2={540} y2={118} stroke={C.bad} strokeWidth="2" strokeDasharray="7 4" />
    <T x={536} y={110} anchor="end" size={11}>Giá trị kẻ tấn công thu được</T>
    <T x={296} y={64} size={11}>Từ vạch này trở lên, tấn công không còn đáng làm —</T>
    <T x={296} y={82} size={11}>kẻ tấn công đổi mục tiêu, chứ không đổi kỹ thuật</T>
  </Svg>
);

/** t8-l6 — sáu bước, và bước cuối quay lại bước đầu chứ không kết thúc. */
const MlRedTeam = () => (
  <Svg vb="0 0 620 250">
    <Defs />
    <T x={310} y={18} strong>Một đợt đánh giá ML là một vòng, không phải một đường thẳng</T>
    {[
      { t: '1. Phạm vi', s: 'và uỷ quyền' },
      { t: '2. Kiểm kê', s: 'tài sản, luồng dữ liệu' },
      { t: '3. Mô hình đe doạ', s: 'theo MITRE ATLAS' },
    ].map((b, i) => (
      <g key={i}>
        <Box x={14 + i * 200} y={44} w={172} h={58} label={b.t} sub={b.s}
          fill={i === 2 ? 'var(--lab-soft)' : 'var(--bg-sunken)'} stroke={i === 2 ? 'var(--lab-border)' : undefined} />
        {i < 2 && <Arrow x1={188 + i * 200} y1={73} x2={212 + i * 200} y2={73} />}
      </g>
    ))}
    <Arrow x1={500} y1={104} x2={500} y2={132} />
    {[
      { t: '4. Xếp ưu tiên', s: 'hiệu quả trên chi phí' },
      { t: '5. Thực thi', s: 'đo bằng đường cong' },
      { t: '6. Báo cáo', s: 'bàn giao, tái kiểm' },
    ].map((b, i) => (
      <g key={i}>
        <Box x={414 - i * 200} y={134} w={172} h={58} label={b.t} sub={b.s}
          fill={i === 2 ? 'var(--ok-soft)' : 'var(--bg-sunken)'} stroke={i === 2 ? 'var(--ok-border)' : undefined} />
        {i < 2 && <Arrow x1={412 - i * 200} y1={163} x2={390 - i * 200} y2={163} />}
      </g>
    ))}
    <path d="M100 134 L100 118 L60 118 L60 104" fill="none" stroke={C.ok} strokeWidth="1.6" strokeDasharray="5 4" markerEnd="url(#ah)" />
    <T x={310} y={222} size={11}>Bước 6 nối lại bước 1: mỗi lần mô hình được huấn luyện lại là một phạm vi mới</T>
    <T x={310} y={240} size={11}>Không có uỷ quyền viết ra giấy thì bước 5 là hành vi tấn công, không phải đánh giá</T>
  </Svg>
);

/** t9-l5 — sáu mục hay bị hiểu sai nhất, đặt lên đúng chỗ trong kiến trúc. */
const OwaspLlm = () => (
  <Svg vb="0 0 620 250">
    <Defs />
    <T x={310} y={18} strong>Sáu mục OWASP hay bị hiểu sai, gắn vào đúng chỗ chúng sống</T>
    <Box x={12} y={92} w={108} h={56} label="Đầu vào" sub="người dùng, web, tệp" />
    <Arrow x1={122} y1={120} x2={168} y2={120} />
    <Box x={170} y={80} w={132} h={80} label="Mô hình" sub="+ ngữ cảnh, prompt hệ thống" fill="var(--brand-soft)" stroke="var(--brand-border)" />
    <Arrow x1={304} y1={120} x2={350} y2={120} />
    <Box x={352} y={92} w={116} h={56} label="Đầu ra" sub="đưa vào hệ thống khác" fill="var(--warn-soft)" stroke="var(--warn-border)" />
    <Arrow x1={470} y1={120} x2={512} y2={120} />
    <Box x={514} y={92} w={96} h={56} label="Công cụ" sub="shell, DB, API" fill="var(--bad-soft)" stroke="var(--bad-border)" />

    <T x={66} y={70} size={11}>LLM01 Prompt Injection</T>
    <T x={236} y={62} size={11}>LLM02 lộ dữ liệu nhạy cảm</T>
    <T x={236} y={186} size={11}>LLM09 Misinformation</T>
    <T x={410} y={70} size={11}>LLM05 xử lý đầu ra sai</T>
    <T x={562} y={70} size={11}>LLM06 quyền thừa</T>
    <T x={562} y={186} size={11}>LLM10 hoá đơn</T>
    <T x={310} y={222} size={11}>LLM05 là lỗ hổng web cổ điển, chỉ khác nguồn đầu vào: đầu ra LLM là đầu vào KHÔNG tin cậy</T>
    <T x={310} y={240} size={11}>của hệ thống kế tiếp. Câu kiểm LLM06: nếu mô hình bị chiếm hoàn toàn, nó làm được gì?</T>
  </Svg>
);

/** t10-l6 — sáu mục README, mỗi mục trả lời một câu người đọc đang hỏi. */
const ProjectReadme = () => (
  <Svg vb="0 0 600 268">
    <T x={300} y={18} strong>README mà người trong nghề đọc hết: sáu mục, sáu câu hỏi</T>
    <rect x={40} y={32} width={520} height={196} rx={8} fill="var(--bg-sunken)" stroke={C.line} strokeWidth="1.5" />
    {[
      { n: '1', t: 'Mở đầu ba câu', q: 'Bài toán gì, dữ liệu nào, kết quả bao nhiêu' },
      { n: '2', t: 'Cách chia dữ liệu', q: 'Nói ngay — người đọc sẽ tìm chỗ này trước' },
      { n: '3', t: 'Đường cơ sở trước', q: 'Mô hình của bạn hơn luật đơn giản bao nhiêu' },
      { n: '4', t: 'Chỗ mô hình kém', q: 'Mục bắt buộc; thiếu nó là mất tin cậy' },
      { n: '5', t: 'Tái lập một lệnh', q: 'Người ta chạy lại được không' },
      { n: '6', t: 'Thứ đã thử mà trượt', q: 'Kết quả âm tính cũng là kết quả' },
    ].map((r, i) => (
      <g key={i}>
        <circle cx={64} cy={56 + i * 30} r={9} fill={i === 3 ? C.warn : C.brand} opacity={i === 3 ? 1 : 0.75} />
        <text x={64} y={60 + i * 30} textAnchor="middle" className="svg-label-strong" style={{ fontSize: 11, fill: 'var(--text-inverse)' }}>{r.n}</text>
        <T x={82} y={60 + i * 30} anchor="start" strong>{r.t}</T>
        <T x={246} y={60 + i * 30} anchor="start" size={11}>{r.q}</T>
      </g>
    ))}
    <T x={300} y={250} size={11}>Bốn dấu hiệu khiến người phỏng vấn đóng tab: không nói cách chia, không có đường cơ sở,</T>
    <T x={300} y={264} size={11}>chỉ báo accuracy, và không có mục nào nói mô hình sai ở đâu</T>
  </Svg>
);

/** t2-l4 — nhãn không có sẵn lúc sự việc xảy ra; nó lớn dần rồi mới chín. */
const LabelMaturity = () => (
  <Svg vb="0 0 560 250">
    <Defs />
    <T x={280} y={18} strong>Nhãn không sinh ra cùng lúc với sự kiện — nó chín dần</T>
    <line x1={56} y1={186} x2={528} y2={186} stroke={C.line} strokeWidth="1.5" />
    <text transform="rotate(-90 22 118)" x={22} y={118} textAnchor="middle" className="svg-label-strong">Số engine báo độc</text>
    <path d="M56 178 C 130 176, 150 96, 230 74 S 380 52, 528 48" fill="none" stroke={C.bad} strokeWidth="2.4" />
    <path d="M56 180 C 160 179, 260 168, 360 150 S 470 128, 528 120" fill="none" stroke={C.warn} strokeWidth="2.2" strokeDasharray="6 4" />
    <T x={470} y={40} size={11}>họ đã phổ biến</T>
    <T x={470} y={136} size={11}>họ mới xuất hiện</T>
    <rect x={56} y={40} width={62} height={146} fill={C.bad} opacity={0.1} />
    <T x={87} y={204} size={11}>ngày 0</T>
    <T x={87} y={220} size={11}>gán nhãn</T>
    <T x={87} y={236} size={11}>là đoán bừa</T>
    <line x1={230} y1={40} x2={230} y2={186} stroke={C.ok} strokeWidth="2" strokeDasharray="5 4" />
    <T x={252} y={62} anchor="start" size={11}>hết cửa sổ chín muồi:</T>
    <T x={252} y={78} anchor="start" size={11}>từ đây mới đánh giá được</T>
    <T x={300} y={204} size={11}>Đánh giá mô hình trên dữ liệu mới hơn cửa sổ này thì mọi phát hiện SỚM</T>
    <T x={300} y={222} size={11}>— thứ đáng giá nhất — đều bị tính thành báo động giả</T>
  </Svg>
);

/** t9-l2 — hai đường chèn, và đường nguy hiểm hơn không đi qua ô nhập. */
const InjectionPaths = () => (
  /* Chiều cao 296 chứ không phải 250: ba dòng giải thích phải nằm DƯỚI ô "Trang
     web, tệp, email" (ô này kéo tới y=232). Ở 250 chúng buộc phải đặt ở y≈200 và
     đè lên chính ô đó — phép đo biên không thấy, vì cả hai vẫn nằm trong khung. */
  <Svg vb="0 0 620 296">
    <Defs />
    <T x={310} y={18} strong>Hai đường chèn: một qua ô nhập, một qua thứ mô hình đọc</T>
    <Box x={222} y={102} w={150} h={64} label="Mô hình" sub="không phân biệt được nguồn" fill="var(--brand-soft)" stroke="var(--brand-border)" />
    <Box x={14} y={40} w={150} h={52} label="Người dùng" sub="gõ thẳng vào ô chat" fill="var(--bg-sunken)" />
    <Arrow x1={166} y1={78} x2={244} y2={100} />
    <T x={196} y={72} size={11}>trực tiếp</T>
    <Box x={14} y={170} w={150} h={62} label="Trang web, tệp, email" sub="kẻ tấn công gieo chữ từ trước" fill="var(--bad-soft)" stroke="var(--bad-border)" />
    <Arrow x1={166} y1={196} x2={244} y2={168} color={C.bad} />
    <T x={196} y={214} size={11}>gián tiếp</T>
    <Arrow x1={374} y1={134} x2={430} y2={134} />
    <Box x={432} y={104} w={174} h={60} label="Công cụ có quyền" sub="gửi mail, gọi API, chạy lệnh" fill="var(--warn-soft)" stroke="var(--warn-border)" />
    <T x={310} y={254} size={11}>Đường gián tiếp nguy hiểm hơn: nạn nhân không gõ gì cả, và nội dung độc được</T>
    <T x={310} y={272} size={11}>đặt sẵn từ nhiều ngày trước, ở một nơi bạn không kiểm soát</T>
    <T x={310} y={290} size={11}>Mô hình đọc mọi thứ trong ngữ cảnh như nhau, nên lọc chuỗi ở ô nhập không chạm tới đường dưới</T>
  </Svg>
);

/** t8-l3 — đầu độc là tấn công vào QUÁ KHỨ của mô hình, nổ ở tương lai. */
const PoisonTimeline = () => (
  <Svg vb="0 0 620 230">
    <Defs />
    <T x={310} y={18} strong>Đầu độc xảy ra lúc huấn luyện, hậu quả nổ lúc suy luận</T>
    <line x1={40} y1={110} x2={580} y2={110} stroke={C.line} strokeWidth="1.5" />
    {[
      { x: 96, t: 'Kẻ tấn công gieo', s: 'mẫu vào nguồn dữ liệu', c: C.bad },
      { x: 262, t: 'Bạn huấn luyện', s: 'mọi chỉ số vẫn xanh', c: C.warn },
      { x: 428, t: 'Triển khai', s: 'hoạt động bình thường', c: C.info },
      { x: 552, t: 'Kích hoạt', s: 'mẫu có dấu hiệu riêng', c: C.bad },
    ].map((p, i) => (
      <g key={i}>
        <circle cx={p.x} cy={110} r={7} fill={p.c} />
        <T x={p.x} y={80} strong>{p.t}</T>
        <T x={p.x} y={62} size={11}>{p.s}</T>
        {i < 3 && <Arrow x1={p.x + 12} y1={110} x2={p.x + 140} y2={110} />}
      </g>
    ))}
    <Box x={40} y={140} w={250} h={70} fill="var(--warn-soft)" stroke="var(--warn-border)" />
    <T x={165} y={162} strong>Vì sao chỉ số không bắt được</T>
    <T x={165} y={182} size={11}>Cửa hậu chỉ bật với mẫu mang dấu hiệu</T>
    <T x={165} y={200} size={11}>riêng, nên accuracy trên tập kiểm tra</T>
    <Box x={330} y={140} w={250} h={70} fill="var(--info-soft)" stroke="var(--info-border)" />
    <T x={455} y={162} strong>Chỗ phải kiểm</T>
    <T x={455} y={182} size={11}>Nguồn dữ liệu, quyền ghi vào nguồn đó,</T>
    <T x={455} y={200} size={11}>và vòng phản hồi tự gán nhãn của SOC</T>
    <T x={165} y={218} size={11}>gần như không đổi</T>
  </Svg>
);

/** t4-l7 — cái phễu: sự kiện nhiều, người thì không co giãn. */
const AlertFunnel = () => (
  <Svg vb="0 0 560 250">
    <Defs />
    <T x={280} y={18} strong>Cái phễu kết thúc ở một con số không co giãn: giờ người</T>
    {[
      { w: 460, t: '1.000.000 sự kiện/ngày', c: 'var(--bg-sunken)', s: C.line },
      { w: 340, t: 'Luật và mô hình lọc còn 5.000', c: 'var(--info-soft)', s: 'var(--info-border)' },
      { w: 220, t: 'Gom nhóm còn 600 cảnh báo', c: 'var(--ok-soft)', s: 'var(--ok-border)' },
      { w: 120, t: '120 xử lý nổi', c: 'var(--warn-soft)', s: 'var(--warn-border)' },
    ].map((r, i) => (
      <g key={i}>
        <rect x={280 - r.w / 2} y={44 + i * 44} width={r.w} height={34} rx={5} fill={r.c} stroke={r.s} strokeWidth="1.5" />
        <T x={280} y={65 + i * 44} size={11}>{r.t}</T>
      </g>
    ))}
    <T x={280} y={238} size={11}>Con số cuối cùng do số analyst nhân số phút mỗi ca quyết định, không do mô hình quyết định.</T>
    <T x={280} y={220} size={11}>Muốn tăng nó thì gom nhóm và tự động hoá phân loại — tuyển thêm người là đòn bẩy yếu nhất.</T>
  </Svg>
);

/** t5-l6 — ba bậc biểu diễn văn bản, mỗi bậc mua thêm một thứ và trả một giá. */
const TextLadder = () => (
  <Svg vb="0 0 620 240">
    <Defs />
    <T x={310} y={18} strong>Ba bậc biểu diễn: mỗi bậc mua thêm một thứ và trả một giá</T>
    {[
      { x: 10, t: 'Đếm từ', s: 'bag of words', mua: 'Đơn giản, giải thích được', gia: 'Từ chưa từng thấy = 0', c: 'var(--bg-sunken)', b: undefined },
      { x: 214, t: 'TF-IDF', s: 'đếm + phạt từ phổ biến', mua: 'Nêu bật từ mang tin', gia: 'Vẫn không hiểu từ đồng nghĩa', c: 'var(--info-soft)', b: 'var(--info-border)' },
      { x: 418, t: 'Embedding', s: 'vector học từ ngữ cảnh', mua: 'Gần nghĩa thì gần nhau', gia: 'Nặng, khó giải thích, cần dữ liệu', c: 'var(--lab-soft)', b: 'var(--lab-border)' },
    ].map((r, i) => (
      <g key={i}>
        <Box x={r.x} y={40} w={192} h={152} fill={r.c} stroke={r.b} />
        <T x={r.x + 96} y={64} strong>{r.t}</T>
        <T x={r.x + 96} y={84} size={11}>{r.s}</T>
        <T x={r.x + 96} y={122} size={11}>Được: {r.mua}</T>
        <T x={r.x + 96} y={158} size={11}>Trả: {r.gia}</T>
        {i < 2 && <Arrow x1={r.x + 194} y1={116} x2={r.x + 212} y2={116} />}
      </g>
    ))}
    <T x={310} y={216} size={11}>Với log và dòng lệnh, bậc hai thường đã đủ — leo lên bậc ba chỉ đáng khi bạn cần</T>
    <T x={310} y={234} size={11}>bắt biến thể chưa từng thấy, và chấp nhận mất khả năng chỉ vào một từ để giải thích</T>
  </Svg>
);

/** t3-l6 — k-NN nhớ hàng xóm, SVM tìm lề rộng nhất giữa hai lớp. */
const MarginIdea = () => (
  <Svg vb="0 0 620 250">
    <Defs />
    <T x={310} y={18} strong>Cùng một dữ liệu: k-NN hỏi hàng xóm, SVM tìm lề rộng nhất</T>
    <Box x={12} y={38} w={288} h={196} fill="var(--bg-sunken)" />
    <T x={156} y={60} strong>k-NN</T>
    {[[70, 110], [98, 132], [76, 152], [112, 96], [60, 132]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6} fill={C.ok} />)}
    {[[210, 120], [238, 146], [216, 168], [246, 104]].map(([x, y], i) => <rect key={i} x={x - 5} y={y - 5} width={10} height={10} rx={2} fill={C.bad} />)}
    <circle cx={150} cy={140} r={7} fill="none" stroke={C.brand} strokeWidth="2.4" />
    <circle cx={150} cy={140} r={46} fill="none" stroke={C.brand} strokeWidth="1.4" strokeDasharray="5 4" />
    <T x={156} y={212} size={11}>Nhãn của điểm mới = phiếu của k hàng xóm gần nhất</T>
    <T x={156} y={230} size={11}>Không có &ldquo;mô hình&rdquo; nào được học — chỉ có bộ nhớ</T>

    <Box x={320} y={38} w={288} h={196} fill="var(--bg-sunken)" />
    <T x={464} y={60} strong>SVM</T>
    {[[378, 110], [406, 132], [384, 152], [420, 96], [368, 132]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6} fill={C.ok} />)}
    {[[518, 120], [546, 146], [524, 168], [554, 104]].map(([x, y], i) => <rect key={i} x={x - 5} y={y - 5} width={10} height={10} rx={2} fill={C.bad} />)}
    <line x1={444} y1={82} x2={492} y2={196} stroke={C.brand} strokeWidth="2.4" />
    <line x1={424} y1={82} x2={472} y2={196} stroke={C.brand} strokeWidth="1.2" strokeDasharray="5 4" />
    <line x1={464} y1={82} x2={512} y2={196} stroke={C.brand} strokeWidth="1.2" strokeDasharray="5 4" />
    <circle cx={420} cy={96} r={10} fill="none" stroke={C.warn} strokeWidth="2" />
    <rect x={513} y={115} width={20} height={20} rx={4} fill="none" stroke={C.warn} strokeWidth="2" />
    {/* Hai dòng này đặt ở tâm 464 nên bề rộng tối đa là 2×(620−464) = 312 đơn
        vị; bản đầu dài hơn thế và tràn qua mép phải 9 và 15 đơn vị. */}
    <T x={464} y={212} size={11}>Chỉ vài điểm sát lề quyết định đường</T>
    <T x={464} y={230} size={11}>Chịu được dữ liệu ít, nhạy với nhiễu sát lề</T>
  </Svg>
);

/* --- Mười một hình cho các bài chỉ có lab ---------------------------------

    Nguyên tắc chọn ý: hình KHÔNG được nói lại điều phòng lab của cùng bài đã
    cho người học tự tay nghịch. Lab cho cảm giác, hình cho cấu trúc. Ví dụ
    t6-l10 có lab cho thấy một đợt tấn công tự nâng mức nền của chính nó, nên
    hình ở đây vẽ phép phân rã ba thành phần — thứ lab không dừng lại để chỉ.
   -------------------------------------------------------------------------- */

/** t1-l4 — ngoại lai tự nâng cái ngưỡng đáng lẽ phải bắt được nó. */
const MaskingFig = () => (
  <Svg vb="0 0 600 250">
    <Defs />
    <T x={300} y={22} strong>Cùng một cột dữ liệu, hai bộ thước đo, hai kết luận trái ngược</T>

    {/* Trục giá trị dùng chung cho cả hai hàng, vẽ thành HAI đoạn chứ không
        một đoạn liền: một đường liền từ 44 tới 196 chạy xuyên qua ba dòng chữ
        nằm giữa hai hàng, và trông đúng như chữ bị gạch. */}
    {[0, 1, 2, 3, 4].flatMap((i) => [
      <line key={`a${i}`} x1={70 + i * 118} y1={60} x2={70 + i * 118} y2={96} className="svg-grid" />,
      <line key={`b${i}`} x1={70 + i * 118} y1={144} x2={70 + i * 118} y2={180} className="svg-grid" />,
    ])}
    {[0, 1, 2, 3, 4].map((i) => (
      <T key={i} x={70 + i * 118} y={214} size={11}>{i * 50} MB</T>
    ))}

    {/* Hàng trên: trung bình + 3σ. Ngoại lai kéo cả trung bình lẫn σ đi theo. */}
    <T x={44} y={68} anchor="end" size={11}>3-sigma</T>
    {[6, 9, 11, 14, 16, 19, 22, 25, 28, 33].map((v, i) => (
      <circle key={i} cx={70 + (v / 50) * 118} cy={78} r={5} fill={C.info} opacity={0.75} />
    ))}
    <circle cx={70 + (196 / 50) * 118} cy={78} r={8} fill={C.bad} />
    <line x1={70 + (188 / 50) * 118} y1={54} x2={70 + (188 / 50) * 118} y2={102} stroke={C.warn} strokeWidth="2.4" strokeDasharray="5 4" />
    <T x={70 + (188 / 50) * 118} y={48} size={11}>ngưỡng</T>
    <T x={300} y={116} size={11}>Chính điểm đỏ làm phồng trung bình và σ, nên ngưỡng nhảy qua PHẢI nó → bỏ lọt</T>

    {/* Hàng dưới: trung vị + MAD. Ngoại lai không lay chuyển được thước đo. */}
    <T x={44} y={152} anchor="end" size={11}>MAD</T>
    {[6, 9, 11, 14, 16, 19, 22, 25, 28, 33].map((v, i) => (
      <circle key={i} cx={70 + (v / 50) * 118} cy={162} r={5} fill={C.info} opacity={0.75} />
    ))}
    <circle cx={70 + (196 / 50) * 118} cy={162} r={8} fill={C.bad} />
    <line x1={70 + (46 / 50) * 118} y1={138} x2={70 + (46 / 50) * 118} y2={186} stroke={C.ok} strokeWidth="2.4" strokeDasharray="5 4" />
    <T x={70 + (46 / 50) * 118} y={132} size={11}>ngưỡng</T>
    <T x={300} y={238} size={11}>Trung vị và MAD không nhúc nhích vì một điểm, nên ngưỡng đứng yên → bắt được</T>
  </Svg>
);

/** t2-l3 — ba mốc thời gian, và chỉ một mốc được dùng để chia tập. */
const LogTimestampsFig = () => (
  <Svg vb="0 0 600 230">
    <Defs />
    <T x={300} y={22} strong>Một dòng log mang ba mốc thời gian khác nhau</T>

    <line x1={40} y1={150} x2={560} y2={150} className="svg-axis" />
    {[
      { x: 96, l: 'Sự kiện xảy ra', s: '09:14:02', c: C.ok, dy: -1 },
      { x: 268, l: 'Bộ thu nhận được', s: '09:14:47', c: C.info, dy: 1 },
      { x: 470, l: 'Chỉ mục ghi xong', s: '09:21:35', c: C.warn, dy: -1 },
    ].map((m, i) => (
      <g key={i}>
        <line x1={m.x} y1={150} x2={m.x} y2={150 + m.dy * 22} stroke={m.c} strokeWidth="2" />
        <circle cx={m.x} cy={150} r={6} fill={m.c} />
        <rect x={m.x - 74} y={m.dy < 0 ? 84 : 176} width={148} height={40} rx={7} fill="var(--bg-sunken)" stroke={m.c} strokeWidth="1.4" />
        <T x={m.x} y={m.dy < 0 ? 100 : 192} size={11} strong>{m.l}</T>
        <T x={m.x} y={m.dy < 0 ? 114 : 206} size={11}>{m.s}</T>
      </g>
    ))}

    <path d="M96 150 L268 150" stroke={C.bad} strokeWidth="3" opacity={0.5} />
    <T x={182} y={142} size={11}>độ trễ 45 giây</T>
    <path d="M268 150 L470 150" stroke={C.bad} strokeWidth="3" opacity={0.25} />
    <T x={369} y={142} size={11}>thêm 6 phút 48</T>

    <T x={300} y={56} size={11}>Chia tập huấn luyện phải dùng mốc SỰ KIỆN — hai mốc kia do hạ tầng quyết định</T>
    <T x={300} y={70} size={11}>và chúng đổi mỗi khi ai đó nâng cấp đường ống</T>
  </Svg>
);

/** t3-l3 — cắt hết mũi tên phụ thuộc thì hỏng xác suất, nhưng còn nguyên thứ hạng. */
const NaiveIndependenceFig = () => (
  <Svg vb="0 0 600 250">
    <Defs />
    <T x={300} y={22} strong>Giả định "ngây thơ": cắt mọi mũi tên giữa các từ</T>

    <rect x={22} y={44} width={262} height={124} rx={9} fill="var(--bad-soft)" stroke="var(--bad-border)" strokeWidth="1.4" />
    <T x={153} y={64} size={11} strong>Thực tế</T>
    {[
      { x: 76, y: 100, t: 'tài khoản' },
      { x: 230, y: 100, t: 'khoá' },
      { x: 153, y: 142, t: 'xác minh' },
    ].map((n, i) => (
      <g key={i}>
        <rect x={n.x - 48} y={n.y - 14} width={96} height={26} rx={13} fill="var(--bg-elev)" stroke={C.bad} strokeWidth="1.4" />
        <T x={n.x} y={n.y + 4} size={11}>{n.t}</T>
      </g>
    ))}
    <line x1={125} y1={100} x2={181} y2={100} stroke={C.bad} strokeWidth="1.8" />
    <line x1={96} y1={114} x2={124} y2={130} stroke={C.bad} strokeWidth="1.8" />
    <line x1={210} y1={114} x2={182} y2={130} stroke={C.bad} strokeWidth="1.8" />

    <rect x={316} y={44} width={262} height={124} rx={9} fill="var(--ok-soft)" stroke="var(--ok-border)" strokeWidth="1.4" />
    <T x={447} y={64} size={11} strong>Điều mô hình giả định</T>
    {[
      { x: 370, y: 100, t: 'tài khoản' },
      { x: 524, y: 100, t: 'khoá' },
      { x: 447, y: 142, t: 'xác minh' },
    ].map((n, i) => (
      <g key={i}>
        <rect x={n.x - 48} y={n.y - 14} width={96} height={26} rx={13} fill="var(--bg-elev)" stroke={C.ok} strokeWidth="1.4" />
        <T x={n.x} y={n.y + 4} size={11}>{n.t}</T>
      </g>
    ))}

    <T x={300} y={196} size={11}>Xác suất in ra vì thế SAI — nó bị đẩy sát 0 hoặc sát 1 một cách vô căn cứ.</T>
    <T x={300} y={214} size={11}>Nhưng để phân loại, ta chỉ cần biết bên nào lớn hơn, và THỨ HẠNG thì sống sót.</T>
    <T x={300} y={238} strong>Đó là lý do một giả định sai rành rành vẫn dọn sạch hộp thư của cả thế giới</T>
  </Svg>
);

/** t3-l4 — đặc trưng nhiều giá trị mua độ thuần khiết bằng cách học thuộc. */
const HighCardinalityFig = () => (
  <Svg vb="0 0 600 260">
    <Defs />
    <T x={300} y={22} strong>Hai phép chia, cùng một nút gốc, cùng đạt "thuần khiết"</T>

    <rect x={16} y={38} width={276} height={186} rx={9} fill="var(--ok-soft)" stroke="var(--ok-border)" strokeWidth="1.4" />
    <T x={154} y={58} size={11} strong>Chia theo "tiến trình cha là Office"</T>
    <rect x={104} y={70} width={100} height={30} rx={6} fill="var(--bg-elev)" stroke={C.line} strokeWidth="1.4" />
    <T x={154} y={90} size={11}>12 mẫu</T>
    <line x1={128} y1={100} x2={82} y2={128} stroke={C.line} strokeWidth="1.5" />
    <line x1={180} y1={100} x2={226} y2={128} stroke={C.line} strokeWidth="1.5" />
    <rect x={34} y={130} width={96} height={34} rx={6} fill="var(--bad-soft)" stroke={C.bad} strokeWidth="1.4" />
    <T x={82} y={151} size={11}>5 độc</T>
    <rect x={178} y={130} width={96} height={34} rx={6} fill="var(--ok-soft)" stroke={C.ok} strokeWidth="1.4" />
    <T x={226} y={151} size={11}>7 lành</T>
    <T x={154} y={186} size={11}>Hai lá, mỗi lá một quy luật</T>
    <T x={154} y={206} size={11}>đọc lên nghe được cho analyst</T>

    <rect x={308} y={38} width={276} height={186} rx={9} fill="var(--bad-soft)" stroke="var(--bad-border)" strokeWidth="1.4" />
    <T x={446} y={58} size={11} strong>Chia theo src_ip</T>
    <rect x={396} y={70} width={100} height={30} rx={6} fill="var(--bg-elev)" stroke={C.line} strokeWidth="1.4" />
    <T x={446} y={90} size={11}>12 mẫu</T>
    {Array.from({ length: 12 }, (_, i) => {
      const x = 330 + i * 19.5;
      return (
        <g key={i}>
          <line x1={446} y1={100} x2={x + 7} y2={130} stroke={C.line} strokeWidth="0.9" />
          <rect x={x} y={130} width={14} height={34} rx={3} fill={i % 3 === 0 ? 'var(--bad-soft)' : 'var(--ok-soft)'} stroke={i % 3 === 0 ? C.bad : C.ok} strokeWidth="1.2" />
        </g>
      );
    })}
    <T x={446} y={186} size={11}>Mười hai lá, mỗi lá đúng một mẫu</T>
    <T x={446} y={206} size={11}>Gini bằng 0, và mô hình rỗng tuếch</T>

    <T x={300} y={248} size={11}>Độ thuần khiết mua bằng cách học thuộc thì không khái quát hoá được một dòng nào</T>
  </Svg>
);

/** t4-l4 — hai lát cắt, ba hành động; một ngưỡng duy nhất là thứ xa xỉ không có thật. */
const ThreeZonesFig = () => (
  <Svg vb="0 0 600 230">
    <Defs />
    <T x={300} y={22} strong>Một ngưỡng cho hai hành động; hai ngưỡng cho ba hành động</T>

    <rect x={40} y={54} width={196} height={46} rx={6} fill="var(--ok-soft)" stroke={C.ok} strokeWidth="1.5" />
    <rect x={236} y={54} width={186} height={46} rx={0} fill="var(--warn-soft)" stroke={C.warn} strokeWidth="1.5" />
    <rect x={422} y={54} width={138} height={46} rx={6} fill="var(--bad-soft)" stroke={C.bad} strokeWidth="1.5" />
    <T x={138} y={82} size={11} strong>Bỏ qua tự động</T>
    <T x={329} y={82} size={11} strong>Đưa vào hàng đợi analyst</T>
    <T x={491} y={82} size={11} strong>Chặn tự động</T>

    <line x1={40} y1={120} x2={560} y2={120} className="svg-axis" />
    {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
      <g key={i}>
        <line x1={40 + v * 520} y1={116} x2={40 + v * 520} y2={124} className="svg-axis" />
        <T x={40 + v * 520} y={140} size={11}>{v.toFixed(2).replace('.', ',')}</T>
      </g>
    ))}
    <T x={300} y={160} size={11}>Điểm mô hình</T>

    <line x1={236} y1={48} x2={236} y2={126} stroke={C.warn} strokeWidth="2.4" />
    <line x1={422} y1={48} x2={422} y2={126} stroke={C.bad} strokeWidth="2.4" />
    <T x={236} y={42} size={11}>0,38</T>
    <T x={422} y={42} size={11}>0,74</T>

    <T x={300} y={188} size={11}>Lát cắt DƯỚI đặt theo mức bỏ sót chịu được; lát cắt TRÊN đặt theo mức chặn nhầm chịu được.</T>
    <T x={300} y={206} size={11}>Hai con số đó đến từ hai cuộc nói chuyện khác nhau với hai phòng ban khác nhau,</T>
    <T x={300} y={224} size={11}>nên ép chúng thành một ngưỡng 0,5 là bỏ mất cả hai.</T>
  </Svg>
);

/** t4-l8 — chỉ hai ô lệch tâm mang thông tin; hai ô kia bị loại khỏi phép tính. */
const McnemarCellsFig = () => (
  <Svg vb="0 0 560 250">
    <Defs />
    <T x={280} y={22} strong>Cùng một tập kiểm thử, hai mô hình, bốn ô — chỉ hai ô được đếm</T>

    <T x={196} y={54} size={11} strong>Mô hình B đúng</T>
    <T x={356} y={54} size={11} strong>Mô hình B sai</T>
    <T x={104} y={98} anchor="end" size={11} strong>Mô hình A đúng</T>
    <T x={104} y={168} anchor="end" size={11} strong>Mô hình A sai</T>

    <rect x={116} y={64} width={160} height={62} rx={7} fill="var(--bg-sunken)" stroke={C.line} strokeWidth="1.3" opacity={0.55} />
    <T x={196} y={92} size={11}>48.912</T>
    <T x={196} y={110} size={11}>cùng đúng</T>

    <rect x={280} y={64} width={160} height={62} rx={7} fill="var(--ok-soft)" stroke={C.ok} strokeWidth="2" />
    <T x={360} y={92} size={11} strong>n₁₀ = 431</T>
    <T x={360} y={110} size={11}>chỉ A đúng</T>

    <rect x={116} y={134} width={160} height={62} rx={7} fill="var(--bad-soft)" stroke={C.bad} strokeWidth="2" />
    <T x={196} y={162} size={11} strong>n₀₁ = 369</T>
    <T x={196} y={180} size={11}>chỉ B đúng</T>

    <rect x={280} y={134} width={160} height={62} rx={7} fill="var(--bg-sunken)" stroke={C.line} strokeWidth="1.3" opacity={0.55} />
    <T x={360} y={162} size={11}>288</T>
    <T x={360} y={180} size={11}>cùng sai</T>

    <T x={280} y={220} size={11}>Hai ô mờ chiếm 98,4% dữ liệu và không nói gì về việc mô hình nào hơn:</T>
    <T x={280} y={238} size={11}>ở đó hai mô hình đồng ý. Tin tức nằm hết trong 800 mẫu chúng bất đồng.</T>
  </Svg>
);

/** t4-l9 — bốn hình dạng tập dự đoán, và tập rỗng là câu trả lời quý nhất. */
const ConformalSetsFig = () => (
  <Svg vb="0 0 600 240">
    <Defs />
    <T x={300} y={22} strong>Mô hình thường trả về một nhãn; bộ conformal trả về một TẬP</T>
    {[
      { t: '{lành}', s: 'chắc chắn lành', c: C.ok, note: 'đóng phiếu' },
      { t: '{độc}', s: 'chắc chắn độc', c: C.bad, note: 'chặn ngay' },
      { t: '{lành, độc}', s: 'không đủ tách', c: C.warn, note: 'người xem' },
      { t: '{ }', s: 'không giống gì đã thấy', c: C.lab, note: 'ưu tiên điều tra' },
    ].map((s, i) => {
      const x = 26 + i * 140;
      return (
        <g key={i}>
          <rect x={x} y={48} width={128} height={94} rx={9} fill="var(--bg-sunken)" stroke={s.c} strokeWidth="1.8" />
          <T x={x + 64} y={84} strong>{s.t}</T>
          <T x={x + 64} y={108} size={11}>{s.s}</T>
          <rect x={x + 14} y={156} width={100} height={28} rx={14} fill="var(--bg-elev)" stroke={s.c} strokeWidth="1.4" />
          <T x={x + 64} y={174} size={11}>{s.note}</T>
          <line x1={x + 64} y1={142} x2={x + 64} y2={154} stroke={s.c} strokeWidth="1.5" />
        </g>
      );
    })}
    <T x={300} y={208} size={11}>Tập rỗng không phải lỗi. Nó nói mẫu này không giống bất kỳ lớp nào trong tập hiệu chuẩn —</T>
    <T x={300} y={226} size={11}>tức đúng thứ một đội bảo mật muốn nhìn thấy trước tiên.</T>
  </Svg>
);

/** t6-l1 — xếp tầng phòng thủ theo chi phí NÉ TRÁNH, không theo chi phí xây. */
const PhishingLayersFig = () => (
  <Svg vb="0 0 600 260">
    <Defs />
    <T x={300} y={22} strong>Ba tầng đặc trưng, xếp theo cái giá kẻ tấn công phải trả để né</T>
    <T x={452} y={48} size={11} strong>Né bằng cách</T>
    {[
      { l: 'Từ vựng URL', s: 'độ dài, entropy, TLD', e: 'đổi một chuỗi ký tự', w: 122, c: C.warn },
      { l: 'Hạ tầng & danh tiếng', s: 'tuổi tên miền, ASN, chứng chỉ', e: 'mua tên miền mới rồi chờ', w: 200, c: C.info },
      { l: 'Nội dung trang & thư', s: 'DOM, logo, biểu mẫu, header', e: 'dựng lại cả bộ công cụ', w: 278, c: C.ok },
    ].map((t, i) => {
      const y = 60 + i * 58;
      return (
        <g key={i}>
          <rect x={24} y={y} width={t.w} height={44} rx={7} fill="var(--bg-sunken)" stroke={t.c} strokeWidth="1.8" />
          <T x={24 + t.w / 2} y={y + 19} size={11} strong>{t.l}</T>
          <T x={24 + t.w / 2} y={y + 34} size={11}>{t.s}</T>
          <T x={452} y={y + 27} size={11}>{t.e}</T>
        </g>
      );
    })}
    {/* Mũi tên nằm dưới cột trái, đúng chiều bề rộng ba thanh đang lớn dần. */}
    <line x1={24} y1={244} x2={302} y2={244} stroke={C.line} strokeWidth="1.5" markerEnd="url(#ah)" />
    <T x={163} y={236} size={11}>Chi phí né tránh tăng dần</T>
    <T x={452} y={228} size={11}>Tầng rẻ nhất cũng là</T>
    <T x={452} y={244} size={11}>tầng chết nhanh nhất</T>
  </Svg>
);

/** t6-l10 — ba thành phần, và chỉ thành phần thứ ba được đem đi cảnh báo. */
const DecompositionFig = () => {
  const w = 470;
  const x0 = 96;
  const trend = (t: number) => 0.5 + 0.22 * t;
  const seas = (t: number) => 0.5 + 0.34 * Math.sin(t * Math.PI * 6);
  const spike = (t: number) => (t > 0.62 && t < 0.71 ? 0.42 : 0);
  const path = (f: (t: number) => number, y0: number, h: number) =>
    Array.from({ length: 96 }, (_, i) => {
      const t = i / 95;
      return `${i ? 'L' : 'M'}${(x0 + t * w).toFixed(1)} ${(y0 + h - f(t) * h).toFixed(1)}`;
    }).join(' ');
  return (
    <Svg vb="0 0 600 270">
      <Defs />
      <T x={300} y={20} strong>Phân rã trước, rồi mới hỏi "hôm nay có bất thường không"</T>
      {[
        { l: 'Chuỗi gốc', f: (t: number) => (trend(t) + seas(t)) / 2 + spike(t) * 0.5, c: C.line, y: 34 },
        { l: 'Xu hướng', f: trend, c: C.info, y: 92 },
        { l: 'Thành phần mùa', f: seas, c: C.lab, y: 150 },
        { l: 'Phần dư', f: (t: number) => 0.32 + spike(t), c: C.bad, y: 208 },
      ].map((r, i) => (
        <g key={i}>
          <line x1={x0} y1={r.y + 46} x2={x0 + w} y2={r.y + 46} className="svg-grid" />
          <T x={88} y={r.y + 28} anchor="end" size={11} strong>{r.l}</T>
          <path d={path(r.f, r.y, 44)} fill="none" stroke={r.c} strokeWidth={i === 3 ? 2.4 : 1.8} />
        </g>
      ))}
      {/* Đợt tấn công chỉ nhô lên ở hàng cuối; ở hàng đầu nó chìm trong nhịp tuần. */}
      <circle cx={x0 + 0.665 * w} cy={216} r={11} fill="none" stroke={C.bad} strokeWidth="2" />
      <T x={300} y={266} size={11}>Chỉ hàng cuối được đem đi cảnh báo — ba hàng trên là thứ "đáng lẽ phải như thế"</T>
    </Svg>
  );
};

/** t7-l6 — mili-giây nhân với lưu lượng thật thì thành máy chủ. */
const LatencyCostFig = () => (
  <Svg vb="0 0 600 240">
    <Defs />
    <T x={300} y={22} strong>Độ trễ mỗi mẫu là con số vô hại cho tới khi nhân với lưu lượng</T>
    {[
      { l: '30 ms', s: 'một mẫu, một lõi', c: C.ok },
      { l: '× 10 triệu', s: 'sự kiện mỗi ngày', c: C.info },
      { l: '× 3', s: 'hệ số giờ cao điểm', c: C.warn },
      { l: '250 giờ CPU', s: 'mỗi ngày → 11 lõi chạy liên tục', c: C.bad },
    ].map((b, i) => {
      const x = 16 + i * 148;
      return (
        <g key={i}>
          <rect x={x} y={54} width={128} height={62} rx={8} fill="var(--bg-sunken)" stroke={b.c} strokeWidth="1.8" />
          <T x={x + 64} y={80} strong>{b.l}</T>
          <T x={x + 64} y={100} size={11}>{b.s}</T>
          {i < 3 && <Arrow x1={x + 130} y1={85} x2={x + 146} y2={85} />}
        </g>
      );
    })}
    <T x={300} y={150} size={11}>Cộng thêm chi phí trích xuất đặc trưng, thứ hầu như không ai đo,</T>
    <T x={300} y={168} size={11}>và thường đắt hơn chính lượt suy luận.</T>
    <rect x={132} y={186} width={336} height={38} rx={8} fill="var(--brand-soft)" stroke="var(--brand-border)" strokeWidth="1.5" />
    <T x={300} y={210} size={11} strong>Random Forest cùng bài toán: 0,4 ms — rẻ hơn 75 lần</T>
  </Svg>
);

/** t10-l4 — cùng một cảnh báo, hai cách trình bày, hai kết cục cho analyst. */
const WhyBlockFig = () => (
  <Svg vb="0 0 600 250">
    <Defs />
    <T x={300} y={22} strong>Cùng một cảnh báo, cùng một mô hình, hai cách viết khối "vì sao"</T>

    <rect x={16} y={40} width={272} height={168} rx={9} fill="var(--bad-soft)" stroke="var(--bad-border)" strokeWidth="1.5" />
    <T x={152} y={62} size={11} strong>Đúng kỹ thuật, vô dụng</T>
    {['feature_47 = 0,83', 'shap_value = +0,21', 'feature_12 = 1,00', 'độ tin cậy: 0,91'].map((s, i) => (
      <T key={i} x={152} y={90 + i * 24} size={11}>{s}</T>
    ))}
    <T x={152} y={196} size={11}>Analyst không hành động được</T>

    <rect x={312} y={40} width={272} height={168} rx={9} fill="var(--ok-soft)" stroke="var(--ok-border)" strokeWidth="1.5" />
    <T x={448} y={62} size={11} strong>Có đơn vị, có mốc so sánh</T>
    {[
      'Tải xuống 4,2 GB — gấp 31 lần',
      'mức thường ngày của tài khoản này',
      'Lúc 03:14, ngoài mọi ca trực đã ghi',
      'Tới một ASN chưa từng thấy 90 ngày',
    ].map((s, i) => (
      <T key={i} x={448} y={90 + i * 24} size={11}>{s}</T>
    ))}
    <T x={448} y={196} size={11} strong>Việc cần làm: xác minh với chủ máy</T>

    <T x={300} y={230} size={11}>Ba con số, mỗi con số có đơn vị và một mốc để so — rồi kết bằng việc cần làm,</T>
    <T x={300} y={246} size={11}>không phải bằng điểm số.</T>
  </Svg>
);

/* ========================================================================== */

const REGISTRY: Record<string, () => ReactNode> = {
  'fig-label-maturity': LabelMaturity,
  'fig-injection-paths': InjectionPaths,
  'fig-poison-timeline': PoisonTimeline,
  'fig-alert-funnel': AlertFunnel,
  'fig-text-ladder': TextLadder,
  'fig-margin-idea': MarginIdea,
  'fig-pandas-three': PandasThree,
  'fig-dataset-age': DatasetAge,
  'fig-attack-cost': AttackCost,
  'fig-ml-redteam': MlRedTeam,
  'fig-owasp-llm': OwaspLlm,
  'fig-project-readme': ProjectReadme,
  'fig-bayes-direction': BayesDirection,
  'fig-precision-recall': PrecisionRecall,
  'fig-model-stealing': ModelStealing,
  'fig-llm-three-risks': LlmThreeRisks,
  'fig-ai-rmf': AiRmf,
  'fig-role-overlap': RoleOverlap,
  'fig-ml-pipeline': MlPipeline,
  'fig-three-learning': ThreeLearning,
  'fig-base-rate': BaseRateFig,
  'fig-confusion': ConfusionFig,
  'fig-roc-anatomy': RocAnatomy,
  'fig-bias-variance': BiasVariance,
  'fig-split-temporal': SplitTemporal,
  'fig-feature-space': FeatureSpace,
  'fig-imbalance': ImbalanceFig,
  'fig-neuron': NeuronFig,
  'fig-mlp': MlpFig,
  'fig-cnn-bytes': CnnBytes,
  'fig-attention': AttentionFig,
  'fig-adversarial': AdversarialFig,
  'fig-atlas': AtlasFig,
  'fig-llm-stack': LlmStack,
  'fig-rag': RagFig,
  'fig-soc-pipeline': SocPipeline,
  'fig-drift': DriftFig,
  'fig-forgetting': ForgettingFig,
  'fig-kill-chain': KillChainFig,
  'fig-detection-lifecycle': DetectionLifecycle,
  'fig-entropy-scale': EntropyScale,
  'fig-dimensionality': DimensionalityFig,
  'fig-gradient-descent': GradientDescentFig,
  'fig-ensemble': EnsembleFig,
  'fig-autoencoder': AutoencoderFig,
  'fig-graph-lateral': GraphLateralFig,
  'fig-calibration': CalibrationFig,
  'fig-data-sources': DataSourcesFig,
  'fig-masking': MaskingFig,
  'fig-log-timestamps': LogTimestampsFig,
  'fig-naive-independence': NaiveIndependenceFig,
  'fig-high-cardinality': HighCardinalityFig,
  'fig-three-zones': ThreeZonesFig,
  'fig-mcnemar-cells': McnemarCellsFig,
  'fig-conformal-sets': ConformalSetsFig,
  'fig-phishing-layers': PhishingLayersFig,
  'fig-decomposition': DecompositionFig,
  'fig-latency-cost': LatencyCostFig,
  'fig-why-block': WhyBlockFig,
};

export function Figure({ id, caption }: { id: string; caption?: string }) {
  const Comp = REGISTRY[id];
  if (!Comp) {
    // Thiếu hình thì bài học vẫn phải đọc được — không bao giờ làm sập trang.
    return (
      <figure className="figure">
        <div className="empty" style={{ padding: 'var(--s-6)' }}>
          <div className="empty-ico"><Icon name="image" size={38} stroke={1.5} /></div>
          <div className="faint">Hình minh hoạ đang được bổ sung{isKnownFigure(id) ? '' : ` (${id})`}</div>
        </div>
        {caption && <figcaption className="figure-caption">{caption}</figcaption>}
      </figure>
    );
  }
  return (
    <figure className="figure">
      {/* role="img" + aria-label ở đây: người dùng trình đọc màn hình nghe được
          ý nghĩa của hình thay vì một khối đồ hoạ câm. */}
      <div role="img" aria-label={caption ?? 'Hình minh hoạ khái niệm trong bài'}>
        <Comp />
      </div>
      {caption && <figcaption className="figure-caption">{caption}</figcaption>}
    </figure>
  );
}
