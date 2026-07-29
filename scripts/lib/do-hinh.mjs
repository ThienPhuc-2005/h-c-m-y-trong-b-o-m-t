/**
 * Phép đo hình chạy TRONG trang, dùng chung cho check-figures và check-labs.
 *
 * Ba luật, và lý do từng luật nằm ngay cạnh nó. Đây là mã chạy trong trình
 * duyệt nên nó là một CHUỖI, không phải mô-đun — nạp bằng Runtime.evaluate.
 */

/* --------------------------------------------------------------------------
   Ngưỡng
   --------------------------------------------------------------------------
   Đơn vị là ĐƠN VỊ VIEWBOX, không phải pixel màn hình. Chữ dùng ngưỡng chặt
   hơn hình khối vì `getBBox()` của hình khối không tính nét viền, nên một
   đường viền 1,5px vẽ đúng mép vẫn nhô ra chút ít về mặt hình học.

   Ngưỡng ĐÈ phải đạt ở CẢ HAI trục. Hộp chữ cao hơn phần chữ thật (nó gồm cả
   phần trên đầu và phần dưới chân của font), nên hai dòng cách nhau 13 đơn vị
   với cỡ chữ 12 vẫn chồng khoảng 1 đơn vị theo trục Y mà mắt không thấy gì. */
export const TOL_TEXT = 0.5;
export const TOL_SHAPE = 1.0;
export const OVERLAP_MIN = 2;

/* Đường kẻ gạch ngang chữ: hình được coi là MẢNH khi một chiều dưới ngần này,
   và bị coi là gạch qua chữ khi nó chồng đủ dài theo trục ngang lẫn đủ sâu
   theo trục dọc. Ngưỡng ngang để rộng (6) vì một nét chỉ chạm mép chữ thì mắt
   không thấy; ngưỡng dọc để chặt (3) vì gạch đúng giữa dòng là hỏng hẳn. */
export const THIN = 4;
export const LINE_CROSS_X = 6;
export const LINE_CROSS_Y = 3;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const HEADFUL = flag('--head');
const PORT = Number(opt('--port') ?? 5199);
let baseUrl = opt('--url');

/* --------------------------------------------------------------------------
   Mã chạy TRONG trang
   --------------------------------------------------------------------------
   Cách đo đúng, và lý do:

   `el.getCTM()` trả ma trận tới viewport, tức ĐÃ gộp phép co giãn viewBox vào.
   So kết quả đó với `viewBox.width` là so hai đơn vị khác nhau — tỉ lệ nhỏ hơn
   1 làm con số co lại và giấu mất tràn thật, tỉ lệ lớn hơn 1 thì báo tràn ảo.
   Ma trận đúng là hiệu của hai `getScreenCTM()`:

       inv = svg.getScreenCTM().inverse()
       m   = inv.multiply(el.getScreenCTM())      // -> hệ toạ độ người dùng

   Và phải lấy BỐN GÓC hộp chứ không phải góc trên trái cộng bề rộng: nhãn trục
   quay 90 độ có bề rộng nằm trên trục y. Kiểm cả trục Y, và kiểm cả
   `rect`/`line`/`path` chứ không riêng `text` — một thanh trong hình mất cân
   bằng lớp từng dài quá khung mà không ai thấy.

   Lưu ý: `requestAnimationFrame` KHÔNG chạy khi trang không được vẽ ra màn
   hình. Mọi phép chờ ở đây dùng `setTimeout`. */
export const PAGE_HELPERS = `
window.__aegis = (() => {
  const SKIP = 'defs,marker,clipPath,mask,pattern,symbol';
  const TOL_TEXT = ${TOL_TEXT}, TOL_SHAPE = ${TOL_SHAPE}, OVERLAP_MIN = ${OVERLAP_MIN};
  const THIN = ${THIN}, LINE_CROSS_X = ${LINE_CROSS_X}, LINE_CROSS_Y = ${LINE_CROSS_Y};

  function measure(svg) {
    const scm = svg.getScreenCTM();
    if (!scm) return [{ type: 'khong-do-duoc' }];
    const inv = scm.inverse();
    const vb = svg.viewBox.baseVal;
    if (!vb || !vb.width) return [{ type: 'khong-co-viewbox' }];
    const out = [], texts = [], thin = [], solid = [];
    const sel = 'text,rect,line,path,circle,ellipse,polygon,polyline,image,foreignObject';
    for (const el of svg.querySelectorAll(sel)) {
      if (el.closest(SKIP)) continue;
      const m0 = el.getScreenCTM();
      if (!m0) continue;
      let b;
      try { b = el.getBBox(); } catch (e) { continue; }
      if (!(b.width || b.height)) continue;
      const m = inv.multiply(m0);
      const pt = (x, y) => ({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f });
      const cs = [pt(b.x, b.y), pt(b.x + b.width, b.y), pt(b.x, b.y + b.height), pt(b.x + b.width, b.y + b.height)];
      const box = {
        x0: Math.min(...cs.map(c => c.x)), x1: Math.max(...cs.map(c => c.x)),
        y0: Math.min(...cs.map(c => c.y)), y1: Math.max(...cs.map(c => c.y)),
      };
      const tag = el.tagName.toLowerCase();
      const isText = tag === 'text';
      const label = isText ? (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 48) : '';
      const tol = isText ? TOL_TEXT : TOL_SHAPE;
      const sides = [];
      if (box.x0 < vb.x - tol) sides.push('trái ' + (vb.x - box.x0).toFixed(1));
      if (box.x1 > vb.x + vb.width + tol) sides.push('phải ' + (box.x1 - vb.x - vb.width).toFixed(1));
      if (box.y0 < vb.y - tol) sides.push('trên ' + (vb.y - box.y0).toFixed(1));
      if (box.y1 > vb.y + vb.height + tol) sides.push('dưới ' + (box.y1 - vb.y - vb.height).toFixed(1));
      if (sides.length) out.push({ type: 'tran', tag, label, sides: sides.join(', ') });
      if (isText && label) texts.push({ label, box });
      const isThin = box.x1 - box.x0 < THIN || box.y1 - box.y0 < THIN;
      if (!isText && isThin) thin.push({ tag, box });
      // Hình ĐẶC và đủ lớn: nếu một nhãn nằm gọn trong nó thì mọi đường kẻ
      // chạy phía sau đều bị che, và phép kiểm gạch-qua-chữ phải bỏ qua nhãn
      // đó. Đây là bố cục bình thường của mọi đồ thị: nhãn nằm trên đỉnh.
      if (!isText && !isThin) {
        const fill = getComputedStyle(el).fill;
        if (fill && fill !== 'none' && !/rgba\\(.*,\\s*0\\)/.test(fill)) solid.push(box);
      }
    }
    for (let i = 0; i < texts.length; i++) {
      for (let j = i + 1; j < texts.length; j++) {
        const a = texts[i].box, c = texts[j].box;
        const ox = Math.min(a.x1, c.x1) - Math.max(a.x0, c.x0);
        const oy = Math.min(a.y1, c.y1) - Math.max(a.y0, c.y0);
        if (ox > OVERLAP_MIN && oy > OVERLAP_MIN) {
          out.push({ type: 'de', a: texts[i].label, b: texts[j].label, ox: +ox.toFixed(1), oy: +oy.toFixed(1) });
        }
      }
    }

    // Đường kẻ mảnh cắt ngang một dòng chữ trông y như chữ bị gạch bỏ, và phép
    // kiểm chữ-đè-chữ ở trên không thấy gì vì một bên không phải chữ.
    //
    // KHÔNG đo bằng diện tích chồng lấn: \`getBBox()\` của một đường ngang cho
    // chiều cao đúng bằng 0 (nó không tính nét vẽ), nên phần chồng theo trục
    // dọc không bao giờ vượt nổi một ngưỡng dương — phép kiểm sẽ im lặng mãi
    // mãi. Tiêu chí đúng là hình học: TÂM của đường có nằm trong phần GIỮA của
    // hộp chữ không, và nó có chạy dọc đủ dài bên trong hộp đó không. Chừa 20%
    // ở hai đầu vì hộp chữ cao hơn phần chữ thật (gồm cả phần trên đầu và dưới
    // chân font), nên một đường sát mép trên hộp thì mắt không thấy chạm gì.
    const coNen = (t) =>
      solid.some((b) => b.x0 <= t.x0 + 1 && b.x1 >= t.x1 - 1 && b.y0 <= t.y0 + 1 && b.y1 >= t.y1 - 1);
    for (const s of thin) {
      const w = s.box.x1 - s.box.x0;
      const h = s.box.y1 - s.box.y0;
      for (const t of texts) {
        if (coNen(t.box)) continue;
        const tw = t.box.x1 - t.box.x0;
        const th = t.box.y1 - t.box.y0;
        const ox = Math.min(t.box.x1, s.box.x1) - Math.max(t.box.x0, s.box.x0);
        const oy = Math.min(t.box.y1, s.box.y1) - Math.max(t.box.y0, s.box.y0);
        const cy = (s.box.y0 + s.box.y1) / 2;
        const cx = (s.box.x0 + s.box.x1) / 2;
        const ngang = h < THIN && ox > LINE_CROSS_X && cy > t.box.y0 + 0.2 * th && cy < t.box.y1 - 0.2 * th;
        const doc = w < THIN && oy > LINE_CROSS_Y && cx > t.box.x0 + 0.15 * tw && cx < t.box.x1 - 0.15 * tw;
        if (ngang || doc) {
          out.push({ type: 'gach', tag: s.tag, label: t.label, huong: ngang ? 'ngang' : 'dọc' });
        }
      }
    }
    return out;
  }

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Đổi hash rồi đọc DOM NGAY sẽ đọc được trang cũ — React chưa vẽ lại. Chờ
  // cho tới khi trang mới thật sự xuất hiện, chứ đừng đoán bằng một con số ms.
  async function goto(hash, wantSel, wantCount) {
    if (location.hash !== hash) location.hash = hash;
    for (let i = 0; i < 60; i++) {
      await sleep(30);
      const n = document.querySelectorAll(wantSel).length;
      if (wantCount == null ? n > 0 : n === wantCount) { await sleep(80); return true; }
    }
    return false;
  }

  return { measure, goto, sleep };
})();
'ok'`;