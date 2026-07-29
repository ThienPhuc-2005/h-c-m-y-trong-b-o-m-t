/**
 * ============================================================================
 *  Kéo mọi thanh trượt của mọi phòng lab tới hai cực
 * ============================================================================
 *  `labs.test.ts` chốt những con số lab in ra, nhưng chỉ ở trạng thái mặc định
 *  và vài trạng thái biên chọn tay. Lỗ hổng đó đã đẻ ra ba lỗi thật, cả ba đều
 *  tìm được bằng tay chứ không phải bằng máy:
 *
 *    - `lab-gradient` mở ra đã ở ca hỏng mà ô trạng thái vẫn báo "Hội tụ";
 *    - `lab-labels` ở ngưỡng 20 cộng cửa sổ 0 cho ĐÚNG 0 nhãn dương, mà vẫn
 *      in "độ sạch 0,0%" theo quy ước `pos ? tp/pos : 0`;
 *    - `lab-perceptron` âm thầm đặt lại số vòng huấn luyện khi kéo thanh khác.
 *
 *  Script này đi hết 33 lab. Với mỗi lab: kéo từng thanh trượt về min rồi max,
 *  bật tắt từng công tắc, chọn từng mục của từng danh sách, rồi đi qua MỌI GÓC
 *  của không gian biên (2^n tổ hợp, trần 2^6). Góc hỗn hợp mới là chỗ đáng sợ:
 *  ca hỏng đã biết của `lab-labels` cần ngưỡng ở MAX cộng cửa sổ ở MIN, và bản
 *  đầu của chính script này — chỉ quét từng thanh một rồi "tất cả min / tất cả
 *  max" — đã im lặng đi qua nó. Ở mỗi trạng thái nó đòi:
 *
 *    1. không có `NaN`, `Infinity`, `undefined` hay `[object Object]` lọt ra
 *       màn hình — đó là dấu hiệu một phép chia có mẫu số bằng 0;
 *    2. không có lỗi ném ra hay `console.error`;
 *    3. ErrorBoundary không bị kích hoạt;
 *    4. ở hai trạng thái cực, biểu đồ vẫn nằm trong khung của nó.
 *
 *  Dùng:
 *    node scripts/check-labs.mjs                # tự dựng máy chủ dev
 *    node scripts/check-labs.mjs --lab lab-knn  # chỉ một lab
 *    node scripts/check-labs.mjs --head         # mở cửa sổ để nhìn tận mắt
 * ============================================================================
 */

import { PAGE_HELPERS } from './lib/do-hinh.mjs';
import { startVite, startBrowser, connect, evaluate, moApp } from './lib/cdp.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const HEADFUL = flag('--head');
const PORT = Number(opt('--port') ?? 5221);
const CHI_LAB = opt('--lab');
let baseUrl = opt('--url');

/* --------------------------------------------------------------------------
   Mã chạy TRONG trang
   --------------------------------------------------------------------------
   Cả lượt quét của một lab chạy trong MỘT lời gọi, vì mỗi lần đổi điều khiển
   là một lần React vẽ lại — đi vòng qua giao thức cho từng trạng thái thì tốn
   gấp mấy chục lần thời gian.

   `requestAnimationFrame` KHÔNG chạy khi trang không được vẽ ra màn hình, nên
   mọi phép chờ ở đây dùng `setTimeout`. */
const SWEEP = `
window.__aegisLab = (() => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const XAU = ['NaN', 'Infinity', 'undefined', '[object Object]'];
  // Số góc là 2^(số điều khiển). Trần ở 2^6 = 64 để một lab năm sáu thanh
  // trượt không kéo cả lượt chạy dài ra hàng phút.
  const MAX_MU = 6;

  function batLoi() {
    if (window.__loi) return;
    window.__loi = [];
    window.addEventListener('error', (e) => window.__loi.push('lỗi: ' + (e.message || e.type)));
    window.addEventListener('unhandledrejection', (e) => window.__loi.push('promise: ' + e.reason));
    const goc = console.error.bind(console);
    console.error = (...a) => { window.__loi.push('console.error: ' + a.map(String).join(' ').slice(0, 160)); goc(...a); };
  }

  /** Đặt giá trị cho một input React đang điều khiển: phải qua setter gốc. */
  function dat(el, value) {
    const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype
      : el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const key = el.type === 'checkbox' ? 'checked' : 'value';
    Object.getOwnPropertyDescriptor(proto, key).set.call(el, value);
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
    if (el.type === 'checkbox') el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const dieuKhien = () => [...document.querySelectorAll('main input[type=range], main input[type=checkbox], main select')]
    .map((el, i) => {
      if (el.tagName === 'SELECT') return { i, loai: 'chon', nhan: nhanCua(el), gtri: [...el.options].map(o => o.value) };
      if (el.type === 'checkbox') return { i, loai: 'congtac', nhan: nhanCua(el), gtri: [false, true] };
      return { i, loai: 'truot', nhan: nhanCua(el), gtri: [el.min, el.max] };
    });

  function nhanCua(el) {
    const lab = el.closest('label') || document.querySelector('label[for="' + el.id + '"]');
    return (lab ? lab.textContent : '').replace(/\\s+/g, ' ').trim().slice(0, 40) || el.id || ('#' + el.type);
  }

  /**
   * Văn bản của phần SỐ, bỏ hẳn lời kết luận.
   *
   * Không đọc thẳng \`main.textContent\`: lời kết luận của lab-gradient có câu
   * "trọng số nổ tung thành NaN" — chữ NaN là nội dung giảng dạy, không phải
   * một phép chia hỏng. Đọc cả khối đó vào là script báo động giả ở đúng cái
   * lab nó cần soi kỹ nhất.
   */
  function vanSo() {
    const main = document.querySelector('main');
    if (!main) return '';
    const bo = new Set();
    for (const el of main.querySelectorAll('.callout-body, .callout-title')) bo.add(el);
    let out = '';
    const di = (n) => {
      for (const c of n.childNodes) {
        if (c.nodeType === 3) out += c.textContent + ' ';
        else if (c.nodeType === 1 && !bo.has(c)) di(c);
      }
    };
    di(main);
    return out;
  }

  /** Đọc trạng thái hiện tại và trả về những gì SAI. */
  function soat(doHinh) {
    const van = vanSo();
    const loi = [];
    if (document.body.textContent.includes('Ứng dụng gặp lỗi')) loi.push({ kieu: 'sap', chi_tiet: 'ErrorBoundary bật' });
    for (const x of XAU) {
      if (van.includes(x)) {
        // Lấy chút ngữ cảnh quanh chỗ hỏng để người sửa biết nhìn vào đâu.
        const k = van.indexOf(x);
        loi.push({ kieu: 'so-vo-nghia', chi_tiet: x, quanh: van.slice(Math.max(0, k - 48), k + 24).replace(/\\s+/g, ' ').trim() });
      }
    }
    if (window.__loi && window.__loi.length) {
      for (const m of window.__loi.splice(0)) loi.push({ kieu: 'nem-loi', chi_tiet: m });
    }
    if (doHinh && window.__aegis) {
      for (const svg of document.querySelectorAll('main svg[viewBox]')) {
        if (!svg.classList.contains('lab-chart') && !svg.classList.contains('fig-svg')) continue;
        for (const v of window.__aegis.measure(svg)) {
          if (v.type === 'tran') loi.push({ kieu: 'hinh-tran', chi_tiet: (v.label || '<' + v.tag + '>') + ' — ' + v.sides });
        }
      }
    }
    return loi;
  }

  async function quet(id) {
    batLoi();
    location.hash = '#/phong-lab/' + id;
    let san = false;
    for (let i = 0; i < 60; i++) {
      await sleep(40);
      if (document.querySelector('main input, main select')) { san = true; break; }
    }
    await sleep(120);
    window.__loi.length = 0;
    if (!san) return { ck: [], loi: [{ trangthai: '(mở lab)', loi: [{ kieu: 'khong-mo-duoc' }] }] };

    const ck = dieuKhien();
    const ket = [];
    const ghi = (ten, ds) => { if (ds.length) ket.push({ trangthai: ten, loi: ds }); };

    ghi('mặc định', soat(true));

    // Từng điều khiển một, các cái khác giữ nguyên mặc định.
    for (const c of ck) {
      for (const v of c.gtri) {
        const els = [...document.querySelectorAll('main input[type=range], main input[type=checkbox], main select')];
        const el = els[c.i];
        if (!el) continue;
        const truoc = el.type === 'checkbox' ? el.checked : el.value;
        dat(el, v);
        await sleep(90);
        ghi(c.nhan + ' = ' + v, soat(false));
        const els2 = [...document.querySelectorAll('main input[type=range], main input[type=checkbox], main select')];
        if (els2[c.i]) dat(els2[c.i], truoc);
        await sleep(60);
      }
    }

    // MỌI GÓC của không gian biên, không phải chỉ "tất cả min" và "tất cả max".
    //
    // Đây là chỗ bản đầu của script này sai, và sai im lặng. Ca hỏng đã biết
    // của lab-labels là ngưỡng ở MAX cộng cửa sổ chín ở MIN — một góc HỖN HỢP.
    // Quét từng thanh riêng lẻ rồi hai trạng thái đồng nhất thì không bao giờ
    // đi qua nó. Mẫu số bằng 0 hầu như luôn cần nhiều điều khiển cùng ở biên,
    // và thường là ở hai đầu NGƯỢC nhau.
    const dau = ck.map(c => [c.gtri[0], c.gtri[c.gtri.length - 1]]);
    const soGoc = ck.length <= MAX_MU ? (1 << ck.length) : (1 << MAX_MU);
    for (let mask = 0; mask < soGoc; mask++) {
      const chon = ck.map((_, k) => (mask >> (k % MAX_MU)) & 1);
      const els = [...document.querySelectorAll('main input[type=range], main input[type=checkbox], main select')];
      for (const c of ck) {
        const el = els[c.i];
        if (el) { dat(el, dau[c.i][chon[c.i]]); await sleep(25); }
      }
      await sleep(110);
      const ten = 'góc ' + ck.map((c, k) => c.nhan.split(' ')[0] + (chon[k] ? '↑' : '↓')).join(' ');
      // Chỉ đo hình ở góc đồng nhất; đo ở cả 32 góc thì chậm mà thêm rất ít.
      ghi(ten, soat(mask === 0 || mask === soGoc - 1));
    }

    return { ck: ck.map(c => c.loai + ':' + c.nhan), soGoc, loi: ket };
  }

  return { quet };
})();
'ok'`;

/* --------------------------------------------------------------------------
   Lượt kiểm
   -------------------------------------------------------------------------- */
async function run() {
  let vite = null;
  if (!baseUrl) {
    process.stdout.write('Dựng máy chủ dev… ');
    vite = await startVite(PORT);
    baseUrl = vite.url;
    console.log(baseUrl);
  }

  process.stdout.write('Mở trình duyệt… ');
  const browser = await startBrowser({ headful: HEADFUL });
  console.log(browser.ten);

  const cdp = await connect(browser.wsUrl);
  const cleanup = () => {
    try { cdp.close(); } catch { /* đã đóng */ }
    browser.dong();
    try { vite?.proc.kill(); } catch { /* đã chết */ }
  };
  process.on('exit', cleanup);

  try {
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await moApp(cdp, baseUrl);
    await evaluate(cdp, PAGE_HELPERS);
    await evaluate(cdp, SWEEP);

    const labs = await evaluate(
      cdp,
      `import('/src/labs/index.tsx').then(m => m.LABS.map(l => l.id))`,
    );
    const danhSach = CHI_LAB ? labs.filter((l) => l === CHI_LAB) : labs;
    if (!danhSach.length) throw new Error(`Không có lab nào tên ${CHI_LAB}`);

    console.log(`\n${danhSach.length} phòng lab`);
    const findings = [];
    let soTrangThai = 0;
    let phaiNapLai = false;
    for (const id of danhSach) {
      // Chỉ nạp lại khi lab TRƯỚC đã làm sập ErrorBoundary — nó không tự tắt,
      // nên một lab sập sẽ làm mọi lab sau báo sập theo. Nạp lại sau MỌI lab
      // thì tốn thời gian và, đo được, làm phần lớn lab sau đó không kịp mở.
      if (phaiNapLai) {
        await cdp.send('Page.reload');
        for (let i = 0; i < 100; i++) {
          await new Promise((r) => setTimeout(r, 60));
          if (await evaluate(cdp, 'document.readyState === "complete"').catch(() => false)) break;
        }
        await evaluate(cdp, PAGE_HELPERS);
        await evaluate(cdp, SWEEP);
      }

      const r = await evaluate(cdp, `window.__aegisLab.quet(${JSON.stringify(id)})`);
      phaiNapLai = r.loi.some((t) => t.loi.some((l) => l.kieu === 'sap'));
      soTrangThai += r.ck.length * 2 + 1 + (r.soGoc ?? 0);
      if (r.loi.length) {
        findings.push({ id, ck: r.ck, loi: r.loi });
        process.stdout.write('x');
      } else {
        process.stdout.write('.');
      }
    }
    console.log(`  → ${soTrangThai} trạng thái`);

    report(findings);
    return findings.length ? 1 : 0;
  } finally {
    cleanup();
    process.removeListener('exit', cleanup);
  }
}

function report(findings) {
  if (!findings.length) {
    console.log('\nMọi lab sống sót ở cả hai cực của mọi thanh trượt.');
    return;
  }
  console.log(`\n${findings.length} phòng lab có vấn đề:\n`);
  for (const f of findings) {
    console.log(`  ${f.id}   [${f.ck.join(' · ')}]`);
    for (const t of f.loi) {
      console.log(`    ${t.trangthai}`);
      for (const l of t.loi) {
        if (l.kieu === 'so-vo-nghia') console.log(`      in ra "${l.chi_tiet}"  …${l.quanh}…`);
        else if (l.kieu === 'hinh-tran') console.log(`      biểu đồ tràn khung: ${l.chi_tiet}`);
        else console.log(`      ${l.kieu}${l.chi_tiet ? ': ' + l.chi_tiet : ''}`);
      }
    }
    console.log('');
  }
  console.log('Mọi tỉ lệ có mẫu số đếm được đều phải kiểm mẫu số bằng 0 TRƯỚC khi in.');
}

run()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(`\n${err.message}`);
    process.exit(2);
  });
