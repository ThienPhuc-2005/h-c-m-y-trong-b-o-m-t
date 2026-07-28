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
      style={{ width: '100%', maxWidth: 760, margin: '0 auto', height: h ? undefined : 'auto', maxHeight: h ?? 340 }}
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
    {sub && <T x={x + w / 2} y={y + h / 2 + 13} size={10}>{sub}</T>}
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
    <T x={310} y={175} size={10}>Vòng phản hồi: kết luận của analyst quay lại thành nhãn mới</T>
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
    <T x={105} y={74} size={10}>Có nhãn → dự đoán nhãn</T>
    {[0, 1, 2].map((i) => <circle key={i} cx={62 + i * 30} cy={104} r={9} fill={C.ok} />)}
    {[0, 1, 2].map((i) => <rect key={i} x={54 + i * 30} y={126} width={16} height={16} rx={3} fill={C.bad} />)}
    <T x={105} y={166} size={10}>Phishing, mã độc, gian lận</T>

    <Box x={212} y={30} w={186} h={160} fill="var(--info-soft)" stroke="var(--info-border)" />
    <T x={305} y={54} strong>Không giám sát</T>
    <T x={305} y={74} size={10}>Không nhãn → tìm cấu trúc</T>
    {[[250, 100], [268, 112], [258, 122], [276, 98], [244, 114]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={6} fill={C.info} opacity={0.8} />
    ))}
    {[[340, 108], [352, 120], [344, 96]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={6} fill={C.info} opacity={0.8} />
    ))}
    <circle cx={310} cy={140} r={7} fill="none" stroke={C.bad} strokeWidth="2" />
    <T x={310} y={166} size={10}>Bất thường, phân cụm, UEBA</T>

    <Box x={412} y={30} w={196} h={160} fill="var(--lab-soft)" stroke="var(--lab-border)" />
    <T x={510} y={54} strong>Tăng cường</T>
    <T x={510} y={74} size={10}>Hành động → phần thưởng</T>
    <circle cx={462} cy={118} r={16} fill="none" stroke={C.lab} strokeWidth="2" />
    <T x={462} y={122} size={10}>agent</T>
    <Arrow x1={482} y1={110} x2={540} y2={110} color={C.lab} />
    <Arrow x1={540} y1={130} x2={482} y2={130} color={C.lab} />
    <T x={562} y={122} size={10}>môi trường</T>
    <T x={510} y={166} size={10}>Hiếm dùng trong SOC thật</T>
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
        <T x={80} y={-2} anchor="middle" size={10}>10 tấn công thật</T>
        <rect x={160} y={-9} width={11} height={8} rx={1.5} fill={C.warn} />
        <T x={238} y={-2} anchor="middle" size={10}>~49 báo động giả</T>
        <rect x={330} y={-9} width={11} height={8} rx={1.5} fill="var(--border-subtle)" />
        <T x={410} y={-2} anchor="middle" size={10}>941 bình thường</T>
        {/* anchor="end" thay vì căn giữa: nhóm này đã bị translate(12,…) nên
            chữ căn giữa ở x=548 tràn qua mép phải 620 của viewBox. */}
        <T x={596} y={-2} anchor="end" size={10}>→ chỉ ~17% cảnh báo là thật</T>
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
    <T x={300} y={162} size={10}>đoán mò (AUC = 0,5)</T>
    <path d="M70 250 C 130 120, 210 70, 470 50" fill="none" stroke={C.brand} strokeWidth="2.5" />
    <path d="M70 250 C 130 120, 210 70, 470 50 L470 250 Z" fill={C.brand} opacity="0.08" />
    <circle cx={148} cy={128} r={6} fill={C.warn} stroke="var(--bg-elev)" strokeWidth="2" />
    <T x={196} y={118} size={10} anchor="start">ngưỡng cao: ít báo động giả,</T>
    <T x={196} y={131} size={10} anchor="start">nhưng bỏ sót nhiều</T>
    <circle cx={330} cy={68} r={6} fill={C.ok} stroke="var(--bg-elev)" strokeWidth="2" />
    <T x={348} y={62} size={10} anchor="start">ngưỡng thấp: bắt được nhiều,</T>
    <T x={348} y={75} size={10} anchor="start">nhưng ngập báo động giả</T>
    <T x={280} y={280} strong>Tỉ lệ báo động giả (FPR) →</T>
    <g transform="rotate(-90 24 145)"><T x={24} y={145} strong>Tỉ lệ bắt được (TPR) →</T></g>
    <T x={64} y={256} anchor="end" size={10}>0</T>
    <T x={490} y={266} size={10}>1</T>
    <T x={62} y={44} anchor="end" size={10}>1</T>
  </Svg>
);

const BiasVariance = () => (
  <Svg vb="0 0 600 250">
    <line x1={60} y1={200} x2={550} y2={200} className="svg-axis" />
    <line x1={60} y1={200} x2={60} y2={30} className="svg-axis" />
    <path d="M60 60 Q 200 190, 540 196" fill="none" stroke={C.info} strokeWidth="2.5" />
    <T x={470} y={182} size={10} anchor="start">lỗi trên tập huấn luyện</T>
    <path d="M60 70 Q 230 175, 300 168 Q 420 155, 540 55" fill="none" stroke={C.bad} strokeWidth="2.5" />
    <T x={470} y={72} size={10} anchor="end">lỗi trên dữ liệu mới</T>
    <line x1={300} y1={30} x2={300} y2={200} stroke={C.ok} strokeWidth="1.5" strokeDasharray="4 4" />
    <circle cx={300} cy={168} r={6} fill={C.ok} />
    <T x={300} y={22} strong>điểm ngọt</T>
    <T x={150} y={225} strong>← Dưới khớp</T>
    <T x={450} y={225} strong>Quá khớp →</T>
    <T x={300} y={244} size={10}>Độ phức tạp mô hình</T>
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
    <T x={300} y={106} size={10}>Tập kiểm tra (đỏ) nằm xen kẽ → mô hình "nhìn thấy tương lai" → AUC 0,99 giả tạo</T>

    <T x={20} y={144} anchor="start" size={11}>Chia THEO THỜI GIAN (đúng)</T>
    {Array.from({ length: 30 }, (_, i) => (
      <rect key={i} x={20 + i * 19} y={152} width={16} height={26} rx={3}
        fill={i >= 22 ? C.bad : C.info} opacity={0.85} />
    ))}
    <line x1={438} y1={146} x2={438} y2={184} stroke={C.warn} strokeWidth="2" />
    <T x={438} y={196} size={10}>mốc chia</T>
    <T x={300} y={216} size={10}>Kiểm tra trên tương lai chưa từng thấy → AUC 0,84 nhưng là con số THẬT</T>
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
    <T x={318} y={152} anchor="start" size={10}>vùng xám: mô hình không chắc</T>
    <T x={280} y={260} strong>Đặc trưng 1 (ví dụ: entropy tên miền) →</T>
    <g transform="rotate(-90 26 130)"><T x={26} y={130} strong>Đặc trưng 2 →</T></g>
    <T x={455} y={200} size={10}>lành tính</T>
    <T x={455} y={45} size={10}>độc hại</T>
  </Svg>
);

const ImbalanceFig = () => (
  <Svg vb="0 0 600 200">
    <T x={300} y={20} strong>Cùng FPR = 0,1%, khối lượng cảnh báo giả thay đổi theo lưu lượng</T>
    {/* Thanh dài nhất PHẢI để chừa chỗ cho nhãn nằm bên phải nó: cột nhãn bắt
        đầu ở 150, nhãn dài nhất đo được ~141px, nên bề rộng tối đa là 290 để
        150 + 290 + 8 + 141 vẫn nhỏ hơn 600. Bản trước đặt thanh ở x=200 rộng
        420 — tức chính thanh đó đã vượt khung, và nhãn "10.000 cảnh báo giả —
        bất khả thi" bị cắt mất gần hết. */}
    {[
      { l: '10 nghìn sự kiện/ngày', w: 18, n: '10 cảnh báo giả', c: C.ok },
      { l: '1 triệu sự kiện/ngày', w: 96, n: '1.000 cảnh báo giả', c: C.warn },
      { l: '10 triệu sự kiện/ngày', w: 290, n: '10.000 cảnh báo giả — bất khả thi', c: C.bad },
    ].map((r, i) => (
      <g key={i}>
        <T x={12} y={62 + i * 46} anchor="start" size={11}>{r.l}</T>
        <rect x={150} y={48 + i * 46} width={r.w} height={20} rx={4} fill={r.c} opacity={0.85} />
        <T x={150 + r.w + 8} y={63 + i * 46} anchor="start" size={10}>{r.n}</T>
      </g>
    ))}
    <T x={300} y={186} size={10}>Tỉ lệ phần trăm che giấu thực tế. Luôn quy về con số tuyệt đối mỗi ngày.</T>
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
        <T x={160} y={48 + i * 52} size={10}>w{i + 1}</T>
      </g>
    ))}
    <circle cx={262} cy={115} r={34} fill="var(--brand-soft)" stroke={C.brand} strokeWidth="2" />
    <T x={262} y={112} size={12} strong>Σ</T>
    <T x={262} y={128} size={9}>+ b</T>
    <Arrow x1={298} y1={115} x2={340} y2={115} color={C.brand} />
    <rect x={342} y={88} width={78} height={54} rx={8} fill="var(--lab-soft)" stroke={C.lab} strokeWidth="1.8" />
    <path d="M352 132 C 372 132, 376 98, 410 98" fill="none" stroke={C.lab} strokeWidth="2" />
    <T x={381} y={158} size={10}>kích hoạt</T>
    <Arrow x1={422} y1={115} x2={462} y2={115} color={C.lab} />
    <circle cx={492} cy={115} r={22} fill="var(--ok-soft)" stroke={C.ok} strokeWidth="1.8" />
    <T x={492} y={120} size={11}>ŷ</T>
    <T x={280} y={200} size={10}>Một nơ-ron = tổng có trọng số + hàm phi tuyến. Toàn bộ deep learning xây từ đây.</T>
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
    <T x={300} y={82} size={10}>byte thô của tệp (không cần biết cấu trúc PE)</T>
    <rect x={180} y={36} width={126} height={34} rx={4} fill="none" stroke={C.brand} strokeWidth="2" />
    <Arrow x1={243} y1={92} x2={243} y2={116} color={C.brand} />
    <T x={330} y={104} size={10} anchor="start">bộ lọc trượt bắt mẫu byte cục bộ</T>
    {Array.from({ length: 12 }, (_, i) => (
      <rect key={i} x={140 + i * 26} y={120} width={22} height={20} rx={3} fill={C.brand} opacity={0.2 + (i % 4) * 0.2} />
    ))}
    <T x={300} y={156} size={10}>bản đồ đặc trưng</T>
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
        <T x={80 + i * 112} y={72} size={10}>{tok}</T>
        <rect x={30 + i * 112} y={166} width={100} height={28} rx={6} fill="var(--brand-soft)" stroke={C.brand} strokeWidth="1.5" />
        <T x={80 + i * 112} y={184} size={10}>{tok}</T>
      </g>
    ))}
    {[0, 1, 3, 4].map((i) => (
      <line key={i} x1={80 + i * 112} y1={84} x2={304} y2={164}
        stroke={C.brand} strokeWidth={i === 1 || i === 3 ? 2.6 : 0.9} opacity={i === 1 || i === 3 ? 0.85 : 0.35} />
    ))}
    <T x={300} y={130} size={10}>đường dày = trọng số chú ý cao</T>
    <T x={300} y={216} size={10}>Mô hình tự học rằng "ghi tệp → mã hoá → xoá" là mẫu của ransomware</T>
  </Svg>
);

const AdversarialFig = () => (
  <Svg vb="0 0 560 260">
    <Defs />
    <line x1={60} y1={220} x2={500} y2={220} className="svg-axis" />
    <line x1={60} y1={220} x2={60} y2={30} className="svg-axis" />
    <path d="M70 190 L490 70" stroke={C.brand} strokeWidth="2.5" />
    <T x={430} y={100} size={10}>ranh giới quyết định</T>
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
    <T x={330} y={182} anchor="start" size={10}>cùng một mã độc,</T>
    <T x={330} y={195} anchor="start" size={10}>thêm 300 byte rác</T>
    <T x={330} y={208} anchor="start" size={10}>→ được xếp là lành tính</T>
    <T x={280} y={248} size={10}>Kẻ tấn công không cần phá mô hình. Chỉ cần đẩy mẫu qua bên kia ranh giới.</T>
  </Svg>
);

const AtlasFig = () => (
  <Svg vb="0 0 620 200">
    <Defs />
    {[
      { l: 'Do thám', s: 'tìm mô hình dùng gì', c: C.info },
      { l: 'Truy cập', s: 'API, kho mô hình, dữ liệu', c: C.info },
      { l: 'Đầu độc', s: 'sửa dữ liệu huấn luyện', c: C.warn },
      { l: 'Né tránh', s: 'sửa đầu vào lúc chạy', c: C.bad },
      { l: 'Trích xuất', s: 'trộm mô hình / dữ liệu', c: C.bad },
      { l: 'Tác động', s: 'sai lệch, từ chối, thiệt hại', c: C.lab },
    ].map((s, i) => (
      <g key={i}>
        <rect x={12 + i * 100} y={70} width={90} height={60} rx={8}
          fill="var(--bg-sunken)" stroke={s.c} strokeWidth="2" />
        <T x={57 + i * 100} y={95} size={11} strong>{s.l}</T>
        <T x={57 + i * 100} y={112} size={9}>{s.s}</T>
        {i < 5 && <Arrow x1={104 + i * 100} y1={100} x2={110 + i * 100} y2={100} />}
      </g>
    ))}
    <T x={310} y={32} strong>Vòng đời tấn công vào hệ thống ML (theo tinh thần MITRE ATLAS)</T>
    <T x={310} y={50} size={10}>Giai đoạn 3 nhắm vào lúc HUẤN LUYỆN; giai đoạn 4–5 nhắm vào lúc SUY LUẬN</T>
    <T x={310} y={162} size={10}>Mỗi giai đoạn cần một biện pháp phòng thủ khác nhau — không có một lá chắn chung</T>
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
    <T x={300} y={230} size={10}>Bất kỳ nội dung nào lọt vào ngữ cảnh đều có thể được đọc như một mệnh lệnh</T>
    <T x={300} y={248} size={10}>→ dữ liệu ngoài (đỏ) + quyền gọi công cụ (vàng) = tổ hợp nguy hiểm nhất</T>
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
      <T x={395} y={196} size={9}>"Bỏ qua chỉ dẫn trước..."</T>
    </g>
    <Arrow x1={395} y1={160} x2={370} y2={134} color={C.bad} />
    <T x={310} y={26} strong>RAG mở rộng năng lực — và mở rộng bề mặt tấn công</T>
    <T x={310} y={44} size={10}>Ai ghi được vào kho tri thức thì gián tiếp điều khiển được câu trả lời</T>
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
    <T x={368} y={194} size={10}>kết luận của analyst → nhãn mới → huấn luyện lại</T>
    <T x={310} y={40} strong>Mô hình chỉ là một mắt xích. Bốn mắt xích còn lại quyết định nó có ích hay không.</T>
    <T x={310} y={58} size={10}>Độ trễ, tính nhất quán đặc trưng, khả năng giải thích, và vòng phản hồi</T>
  </Svg>
);

const DriftFig = () => (
  <Svg vb="0 0 600 250">
    <line x1={60} y1={200} x2={550} y2={200} className="svg-axis" />
    <line x1={60} y1={200} x2={60} y2={30} className="svg-axis" />
    <path d="M60 60 L160 66 L260 82 L360 118 L460 156 L545 178" fill="none" stroke={C.brand} strokeWidth="2.5" />
    <circle cx={260} cy={82} r={5} fill={C.warn} />
    <T x={262} y={68} size={10}>kẻ tấn công đổi kỹ thuật</T>
    <circle cx={430} cy={144} r={5} fill={C.bad} />
    <T x={440} y={132} anchor="start" size={10}>mô hình đã vô dụng</T>
    <line x1={60} y1={150} x2={550} y2={150} stroke={C.bad} strokeWidth="1.5" strokeDasharray="5 4" />
    <T x={100} y={144} size={10} anchor="start">ngưỡng chấp nhận</T>
    <path d="M60 60 L160 62 L260 64 L360 66 L460 68 L545 70" fill="none" stroke={C.ok} strokeWidth="2" strokeDasharray="4 4" />
    <T x={500} y={62} size={10}>có huấn luyện lại</T>
    <T x={300} y={228} strong>Thời gian kể từ khi triển khai →</T>
    <g transform="rotate(-90 26 115)"><T x={26} y={115} size={11}>Hiệu năng</T></g>
  </Svg>
);

const ForgettingFig = () => (
  <Svg vb="0 0 600 250">
    <line x1={60} y1={200} x2={550} y2={200} className="svg-axis" />
    <line x1={60} y1={200} x2={60} y2={30} className="svg-axis" />
    <path d="M60 45 C 90 130, 130 176, 250 190 L250 190" fill="none" stroke={C.bad} strokeWidth="2.5" />
    <T x={230} y={178} size={10} anchor="end">không ôn lại</T>
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
    <T x={130} y={34} size={10}>ôn 1</T>
    <T x={240} y={34} size={10}>ôn 2</T>
    <T x={400} y={34} size={10}>ôn 3</T>
    <T x={300} y={228} strong>Thời gian →</T>
    <g transform="rotate(-90 26 115)"><T x={26} y={115} size={11}>Xác suất nhớ lại</T></g>
    <T x={470} y={190} size={10}>khoảng cách giữa các lần ôn dài dần</T>
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
        <T x={58 + i * 100} y={86} size={10} strong>{s.l}</T>
        <rect x={16 + i * 100} y={122} width={92} height={34} rx={6} fill="var(--brand-soft)" stroke={C.brand} strokeWidth="1.2" />
        <T x={62 + i * 100} y={143} size={9}>{s.ml}</T>
        <line x1={62 + i * 100} y1={106} x2={62 + i * 100} y2={120} stroke={C.brand} strokeWidth="1.2" strokeDasharray="2 2" />
      </g>
    ))}
    <T x={310} y={32} strong>ML không bắt "một cuộc tấn công" — nó bắt từng dấu vết ở từng giai đoạn</T>
    <T x={310} y={182} size={10}>Phòng thủ theo chiều sâu: bỏ lỡ ở giai đoạn 2 vẫn còn cơ hội ở giai đoạn 5</T>
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
          <T x={x} y={y + 4} size={10} strong>{s.l}</T>
        </g>
      );
    })}
    <circle cx={280} cy={130} r={92} fill="none" stroke={C.brand} strokeWidth="1.2" strokeDasharray="6 6" opacity="0.5" />
    <T x={280} y={126} size={11} strong>Vòng đời</T>
    <T x={280} y={142} size={10}>một luật phát hiện</T>
    <T x={280} y={246} size={10}>Không có bước "xong". Mỗi vòng lặp là một lần mô hình được cứu khỏi lỗi thời.</T>
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
        <T x={p.x} y={140} size={10}>{p.l}</T>
      </g>
    ))}
    <T x={70} y={166} size={10}>← dễ đoán</T>
    <T x={530} y={166} size={10}>khó đoán →</T>
    <rect x={355} y={100} width={130} height={20} fill={C.warn} opacity="0.12" />
    <T x={300} y={192} size={10}>Vùng 3,7–4,2 bit/ký tự là nơi phần lớn tên miền DGA rơi vào — nhưng cũng có tên miền thật</T>
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
        <T x={g.x + 70} y={194} size={9}>{gi === 0 ? 'điểm chen chúc' : gi === 1 ? 'bắt đầu thưa' : 'gần như rỗng'}</T>
      </g>
    ))}
    <T x={300} y={214} size={10}>Hệ quả: khoảng cách mất ý nghĩa, k-NN và phát hiện bất thường suy yếu khi số đặc trưng quá lớn</T>
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
    <T x={186} y={244} size={10}>cực tiểu địa phương</T>
    <circle cx={393} cy={196} r={8} fill="none" stroke={C.ok} strokeWidth="2" strokeDasharray="3 3" />
    <T x={393} y={222} size={10}>cực tiểu toàn cục</T>
    <T x={70} y={92} size={10}>khởi tạo</T>
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
        <T x={71 + i * 74} y={70} size={10}>cây {i + 1}</T>
        <Arrow x1={71 + i * 74} y1={90} x2={150} y2={122} color={C.ok} />
      </g>
    ))}
    <rect x={94} y={124} width={112} height={32} rx={6} fill="var(--bg-sunken)" stroke={C.line} strokeWidth="1.4" />
    <T x={150} y={144} size={10}>bỏ phiếu trung bình</T>
    <T x={150} y={176} size={10}>song song · giảm phương sai</T>
    <T x={150} y={192} size={10}>khó quá khớp</T>

    <line x1={300} y1={30} x2={300} y2={200} stroke={C.line} strokeDasharray="4 4" />

    <T x={450} y={22} strong>Boosting (XGBoost / LightGBM)</T>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={344 + i * 74} y={54} width={62} height={44} rx={6} fill="var(--warn-soft)" stroke={C.warn} strokeWidth="1.4" />
        <T x={375 + i * 74} y={80} size={10}>cây {i + 1}</T>
        {i < 2 && <Arrow x1={408 + i * 74} y1={76} x2={342 + (i + 1) * 74} y2={76} color={C.warn} />}
      </g>
    ))}
    <T x={450} y={122} size={10}>mỗi cây học phần sai của cây trước</T>
    <T x={450} y={176} size={10}>tuần tự · giảm thiên lệch</T>
    <T x={450} y={192} size={10}>mạnh hơn nhưng dễ quá khớp</T>
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
        {L.l && <T x={L.x} y={190} size={10}>{L.l}</T>}
      </g>
    ))}
    <T x={300} y={30} strong>Autoencoder: học nén cái BÌNH THƯỜNG</T>
    <T x={300} y={48} size={10}>Mẫu lạ không nén được → sai số tái tạo cao → cảnh báo</T>
    <path d="M60 156 L540 156" stroke={C.bad} strokeWidth="1.5" strokeDasharray="4 4" />
    <T x={300} y={172} size={10}>so sánh đầu vào ↔ đầu ra: chênh lệch = điểm bất thường</T>
    <T x={300} y={208} size={10}>Cảnh báo: cần dữ liệu huấn luyện SẠCH, nếu có tấn công lẫn vào thì nó học luôn tấn công là bình thường</T>
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
        <T x={n.x} y={n.y + 4} size={10}>{n.l}</T>
      </g>
    ))}
    {[[80, 120, 200, 60], [80, 120, 200, 180], [200, 60, 330, 120], [200, 180, 330, 120], [330, 120, 460, 70], [460, 70, 460, 175]].map(([x1, y1, x2, y2], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i >= 4 ? C.bad : C.line} strokeWidth={i >= 4 ? 2.6 : 1.4} strokeDasharray={i >= 4 ? '' : '3 3'} />
    ))}
    <T x={300} y={24} strong>Di chuyển ngang chỉ lộ ra khi nhìn dữ liệu như một đồ thị</T>
    <T x={300} y={224} size={10}>Từng bước đăng nhập đều hợp lệ. Chuỗi đường đi mới là bất thường.</T>
  </Svg>
);

const CalibrationFig = () => (
  <Svg vb="0 0 520 280">
    <line x1={60} y1={230} x2={460} y2={230} className="svg-axis" />
    <line x1={60} y1={230} x2={60} y2={40} className="svg-axis" />
    <line x1={60} y1={230} x2={450} y2={45} stroke={C.ok} strokeWidth="2" strokeDasharray="5 4" />
    <T x={370} y={70} size={10}>hiệu chuẩn hoàn hảo</T>
    <path d="M60 230 L150 205 L240 178 L330 120 L450 60" fill="none" stroke={C.brand} strokeWidth="2.5" />
    {[[150, 205], [240, 178], [330, 120], [450, 60]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill={C.brand} />)}
    <path d="M60 230 L150 222 L240 214 L330 200 L450 172" fill="none" stroke={C.bad} strokeWidth="2.5" />
    <T x={400} y={190} size={10} anchor="end">tự tin quá mức</T>
    <T x={260} y={262} strong>Điểm mô hình đưa ra →</T>
    <g transform="rotate(-90 24 140)"><T x={24} y={140} size={11}>Tỉ lệ thực sự độc hại</T></g>
  </Svg>
);

const DataSourcesFig = () => (
  <Svg vb="0 0 620 250">
    <Defs />
    <circle cx={310} cy={128} r={42} fill="var(--brand-soft)" stroke={C.brand} strokeWidth="2" />
    <T x={310} y={124} size={11} strong>Hồ dữ liệu</T>
    <T x={310} y={140} size={9}>SIEM / lakehouse</T>
    {[
      { l: 'EDR', s: 'tiến trình, tệp', a: -150 },
      { l: 'Mạng', s: 'Zeek, NetFlow', a: -90 },
      { l: 'DNS', s: 'truy vấn tên miền', a: -30 },
      { l: 'Cloud', s: 'CloudTrail', a: 30 },
      { l: 'Email', s: 'header, đính kèm', a: 90 },
      { l: 'Danh tính', s: 'đăng nhập, AD', a: 150 },
    ].map((n, i) => {
      const rad = (n.a * Math.PI) / 180;
      const x = 310 + 172 * Math.cos(rad);
      const y = 128 + 92 * Math.sin(rad);
      return (
        <g key={i}>
          <line x1={310 + 44 * Math.cos(rad)} y1={128 + 44 * Math.sin(rad)} x2={x - 30 * Math.cos(rad)} y2={y - 20 * Math.sin(rad)} stroke={C.line} strokeWidth="1.4" strokeDasharray="3 3" />
          <rect x={x - 52} y={y - 20} width={104} height={40} rx={7} fill="var(--bg-sunken)" stroke={C.info} strokeWidth="1.4" />
          <T x={x} y={y - 2} size={10} strong>{n.l}</T>
          <T x={x} y={y + 12} size={9}>{n.s}</T>
        </g>
      );
    })}
    <T x={310} y={24} strong>Mỗi nguồn nhìn thấy một phần khác nhau của cùng một cuộc tấn công</T>
    <T x={310} y={240} size={10}>Sức mạnh thật nằm ở chỗ ghép chúng lại theo thời gian và theo thực thể</T>
  </Svg>
);

/* ========================================================================== */

const REGISTRY: Record<string, () => ReactNode> = {
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
