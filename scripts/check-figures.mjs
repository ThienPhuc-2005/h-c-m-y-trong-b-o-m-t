/**
 * ============================================================================
 *  Kiểm hình vẽ trong trình duyệt thật
 * ============================================================================
 *  Hai lỗi mà không bộ test nào chạy trên jsdom bắt được, vì cả hai chỉ tồn tại
 *  sau khi trình duyệt đã dàn chữ bằng font thật:
 *
 *    1. Một phần tử nằm ngoài `viewBox` — nửa dòng chữ bị cắt cụt.
 *    2. Hai hộp chữ đè lên nhau — hai nhãn thành một vệt không đọc được.
 *
 *  Script mở Chrome (hoặc Edge) ở chế độ không giao diện, duyệt mọi bài có hình
 *  và mọi phòng lab, đo từng phần tử, rồi TRƯỢT nếu thấy vi phạm.
 *
 *  KHÔNG thêm dependency nào: Node 22+ đã có `WebSocket` và `fetch` dựng sẵn,
 *  nên nói thẳng giao thức DevTools qua WebSocket là đủ. Trình duyệt lấy từ máy
 *  đang chạy, không tải về.
 *
 *  Dùng:
 *    node scripts/check-figures.mjs                  # tự dựng máy chủ dev
 *    node scripts/check-figures.mjs --url http://…   # dùng máy chủ có sẵn
 *    node scripts/check-figures.mjs --head           # mở cửa sổ để nhìn tận mắt
 *    AEGIS_BROWSER="C:\…\chrome.exe" node scripts/check-figures.mjs
 * ============================================================================
 */

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/* --------------------------------------------------------------------------
   Ngưỡng
   --------------------------------------------------------------------------
   Đơn vị là ĐƠN VỊ VIEWBOX, không phải pixel màn hình. Chữ dùng ngưỡng chặt
   hơn hình khối vì `getBBox()` của hình khối không tính nét viền, nên một
   đường viền 1,5px vẽ đúng mép vẫn nhô ra chút ít về mặt hình học.

   Ngưỡng ĐÈ phải đạt ở CẢ HAI trục. Hộp chữ cao hơn phần chữ thật (nó gồm cả
   phần trên đầu và phần dưới chân của font), nên hai dòng cách nhau 13 đơn vị
   với cỡ chữ 12 vẫn chồng khoảng 1 đơn vị theo trục Y mà mắt không thấy gì. */
const TOL_TEXT = 0.5;
const TOL_SHAPE = 1.0;
const OVERLAP_MIN = 2;

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
const PAGE_HELPERS = `
window.__aegis = (() => {
  const SKIP = 'defs,marker,clipPath,mask,pattern,symbol';
  const TOL_TEXT = ${TOL_TEXT}, TOL_SHAPE = ${TOL_SHAPE}, OVERLAP_MIN = ${OVERLAP_MIN};

  function measure(svg) {
    const scm = svg.getScreenCTM();
    if (!scm) return [{ type: 'khong-do-duoc' }];
    const inv = scm.inverse();
    const vb = svg.viewBox.baseVal;
    if (!vb || !vb.width) return [{ type: 'khong-co-viewbox' }];
    const out = [], texts = [];
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

/* --------------------------------------------------------------------------
   Máy chủ dev
   -------------------------------------------------------------------------- */
function startVite() {
  return new Promise((resolve, reject) => {
    const bin = join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
    if (!existsSync(bin)) return reject(new Error('Không thấy vite — chạy `npm install` trước.'));
    // --strictPort: thà trượt ngay còn hơn để Vite âm thầm nhảy sang cổng khác
    // rồi script đo nhầm một máy chủ nào đó đang chạy sẵn.
    const p = spawn(process.execPath, [bin, '--port', String(PORT), '--strictPort'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      // Vite tô màu số cổng bằng mã ANSI, và mã đó nằm CHÈN GIỮA "localhost:"
      // với chữ số — regex nào cũng trượt nếu không tắt màu trước.
      env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
    });
    let out = '';
    const die = (msg) => { try { p.kill(); } catch { /* đã chết */ } reject(new Error(msg)); };
    const onData = (chunk) => {
      out += chunk.toString();
      const m = out.match(/localhost:(\d+)/);
      if (m) resolve({ proc: p, url: `http://localhost:${m[1]}/` });
    };
    p.stdout.on('data', onData);
    p.stderr.on('data', onData);
    p.on('exit', (code) => die(`Vite thoát sớm (mã ${code}):\n${out}`));
    setTimeout(() => die(`Vite không sẵn sàng sau 30 giây:\n${out}`), 30_000);
  });
}

/* --------------------------------------------------------------------------
   Trình duyệt trên máy — không tải về gì cả
   -------------------------------------------------------------------------- */
function findBrowser() {
  if (process.env.AEGIS_BROWSER) return process.env.AEGIS_BROWSER;
  const candidates =
    process.platform === 'win32'
      ? [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
          'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        ]
      : process.platform === 'darwin'
        ? [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
          ]
        : [
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
            '/usr/bin/microsoft-edge',
          ];
  const hit = candidates.find((p) => existsSync(p));
  if (!hit) {
    throw new Error(
      'Không tìm thấy Chrome hay Edge. Đặt biến môi trường AEGIS_BROWSER trỏ vào tệp thực thi.',
    );
  }
  return hit;
}

async function startBrowser() {
  const exe = findBrowser();
  const profile = mkdtempSync(join(tmpdir(), 'aegis-fig-'));
  const flags = [
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--hide-scrollbars',
    '--window-size=1280,900',
    'about:blank',
  ];
  if (!HEADFUL) flags.unshift('--headless=new', '--disable-gpu');
  const proc = spawn(exe, flags, { stdio: ['ignore', 'ignore', 'pipe'] });

  // Cổng thật nằm trong tệp DevToolsActivePort, không phải trong cờ đã truyền:
  // truyền 0 chính là để hệ điều hành chọn hộ, tránh đụng cổng đang bận.
  const portFile = join(profile, 'DevToolsActivePort');
  let port = null;
  for (let i = 0; i < 100; i++) {
    await new Promise((r) => setTimeout(r, 100));
    if (existsSync(portFile)) {
      const first = readFileSync(portFile, 'utf8').split('\n')[0].trim();
      if (first) { port = first; break; }
    }
    if (proc.exitCode != null) throw new Error(`Trình duyệt thoát sớm (mã ${proc.exitCode}).`);
  }
  if (!port) throw new Error('Trình duyệt không mở được cổng gỡ lỗi sau 10 giây.');

  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = list.find((t) => t.type === 'page');
  if (!page) throw new Error('Trình duyệt không có thẻ nào để điều khiển.');

  return { proc, profile, wsUrl: page.webSocketDebuggerUrl, exe };
}

/* --------------------------------------------------------------------------
   Ống nói chuyện với trình duyệt (giao thức DevTools)
   -------------------------------------------------------------------------- */
function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const pending = new Map();
    let nextId = 1;

    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      const slot = pending.get(msg.id);
      if (!slot) return;
      pending.delete(msg.id);
      if (msg.error) slot.reject(new Error(msg.error.message));
      else slot.resolve(msg.result);
    });
    ws.addEventListener('error', () => reject(new Error('Không kết nối được tới trình duyệt.')));
    ws.addEventListener('open', () =>
      resolve({
        send(method, params = {}) {
          const id = nextId++;
          ws.send(JSON.stringify({ id, method, params }));
          return new Promise((res, rej) => pending.set(id, { resolve: res, reject: rej }));
        },
        close: () => ws.close(),
      }),
    );
  });
}

/** Chạy một biểu thức trong trang và trả về giá trị đã tháo khỏi promise. */
async function evaluate(cdp, expression) {
  const r = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r.exceptionDetails) {
    const e = r.exceptionDetails;
    throw new Error(e.exception?.description ?? e.text);
  }
  return r.result.value;
}

/* --------------------------------------------------------------------------
   Lượt kiểm
   -------------------------------------------------------------------------- */
async function run() {
  let vite = null;
  if (!baseUrl) {
    process.stdout.write('Dựng máy chủ dev… ');
    vite = await startVite();
    baseUrl = vite.url;
    console.log(baseUrl);
  }

  process.stdout.write('Mở trình duyệt… ');
  const browser = await startBrowser();
  console.log(browser.exe.split(/[\\/]/).pop());

  const cdp = await connect(browser.wsUrl);
  const cleanup = () => {
    try { cdp.close(); } catch { /* đã đóng */ }
    try { browser.proc.kill(); } catch { /* đã chết */ }
    try { rmSync(browser.profile, { recursive: true, force: true }); } catch { /* kệ */ }
    try { vite?.proc.kill(); } catch { /* đã chết */ }
  };
  process.on('exit', cleanup);

  try {
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Page.navigate', { url: baseUrl });
    // Chờ tới khi mô-đun trang đã nạp xong; `Page.loadEventFired` cần đăng ký
    // sự kiện, còn ở đây hỏi thẳng trạng thái là đủ và ít mắt xích hơn.
    for (let i = 0; i < 100; i++) {
      await new Promise((r) => setTimeout(r, 100));
      const ready = await evaluate(cdp, 'document.readyState === "complete"').catch(() => false);
      if (ready) break;
    }

    // App chặn mọi route bằng màn hình chào khi `settings.onboarded` còn false.
    await evaluate(
      cdp,
      `localStorage.setItem('aegis.progress.v1', JSON.stringify({ settings: { onboarded: true } })),
       localStorage.setItem('lang', 'vi'), 'ok'`,
    );
    await cdp.send('Page.reload');
    for (let i = 0; i < 100; i++) {
      await new Promise((r) => setTimeout(r, 100));
      const ready = await evaluate(cdp, 'document.readyState === "complete"').catch(() => false);
      if (ready) break;
    }
    await evaluate(cdp, PAGE_HELPERS);
    await evaluate(cdp, 'document.fonts.ready.then(() => "ok")');

    // Danh sách đi thẳng từ dữ liệu giáo trình, không phải từ một bảng chép tay
    // dễ lạc hậu. Máy chủ dev phục vụ được TypeScript nên nhập thẳng nguồn.
    const plan = await evaluate(
      cdp,
      `(async () => {
        const c = await import('/src/content/index.ts');
        const labs = await import('/src/labs/index.tsx');
        const lessons = [];
        for (const l of c.ALL_LESSONS) {
          const figs = [];
          const walk = (bs) => { for (const b of bs || []) { if (b.t === 'figure') figs.push(b.id); if (b.blocks) walk(b.blocks); } };
          walk(l.blocks);
          if (figs.length) lessons.push({ lesson: l.id, figs });
        }
        return { lessons, labs: labs.LABS.map(l => l.id) };
      })()`,
    );

    const findings = [];
    const seenFig = new Set();

    console.log(`\nHình — ${plan.lessons.length} bài có hình`);
    for (const { lesson, figs } of plan.lessons) {
      const r = await evaluate(
        cdp,
        `(async () => {
          const ok = await window.__aegis.goto('#/hoc/${lesson}', '.figure', ${figs.length});
          const nodes = [...document.querySelectorAll('.figure')];
          if (!ok) return { miss: true, got: nodes.length };
          return { out: nodes.map(n => {
            const svg = n.querySelector('svg');
            return svg ? { vb: svg.getAttribute('viewBox'), issues: window.__aegis.measure(svg) }
                       : { vb: null, issues: [{ type: 'khong-co-svg' }] };
          }) };
        })()`,
      );
      if (r.miss) {
        findings.push({ where: `bài ${lesson}`, issues: [{ type: 'khong-vao-duoc-bai', got: r.got, expect: figs.length }] });
        process.stdout.write('!');
        continue;
      }
      let dirty = false;
      r.out.forEach((res, i) => {
        const id = figs[i];
        if (seenFig.has(id)) return;
        seenFig.add(id);
        if (res.issues.length) {
          findings.push({ where: `${id} (bài ${lesson}, viewBox ${res.vb})`, issues: res.issues });
          dirty = true;
        }
      });
      process.stdout.write(dirty ? 'x' : '.');
    }
    console.log(`  → ${seenFig.size} hình`);

    console.log(`\nPhòng lab — ${plan.labs.length} lab`);
    for (const id of plan.labs) {
      const r = await evaluate(
        cdp,
        `(async () => {
          const ok = await window.__aegis.goto('#/phong-lab/${id}', 'svg[viewBox]');
          if (!ok) return { miss: true };
          return { out: [...document.querySelectorAll('main svg[viewBox]')].map(svg => ({
            vb: svg.getAttribute('viewBox'), issues: window.__aegis.measure(svg),
          })) };
        })()`,
      );
      if (r.miss) {
        findings.push({ where: `lab ${id}`, issues: [{ type: 'khong-vao-duoc-lab' }] });
        process.stdout.write('!');
        continue;
      }
      let dirty = false;
      r.out.forEach((res, i) => {
        if (res.issues.length) {
          findings.push({ where: `${id} (biểu đồ ${i + 1}, viewBox ${res.vb})`, issues: res.issues });
          dirty = true;
        }
      });
      process.stdout.write(dirty ? 'x' : '.');
    }
    console.log('');

    report(findings);
    return findings.length ? 1 : 0;
  } finally {
    cleanup();
    process.removeListener('exit', cleanup);
  }
}

function report(findings) {
  if (!findings.length) {
    console.log('\nKhông hình nào tràn khung, không hộp chữ nào đè nhau.');
    return;
  }
  console.log(`\n${findings.length} chỗ cần sửa:\n`);
  for (const f of findings) {
    console.log(`  ${f.where}`);
    for (const i of f.issues) {
      if (i.type === 'tran') {
        console.log(`    tràn ${i.sides.padEnd(22)} <${i.tag}> ${i.label ? `"${i.label}"` : ''}`);
      } else if (i.type === 'de') {
        console.log(`    đè ${i.ox}×${i.oy} đơn vị: "${i.a}" ↔ "${i.b}"`);
      } else {
        console.log(`    ${i.type}${i.got != null ? ` (thấy ${i.got}, cần ${i.expect})` : ''}`);
      }
    }
    console.log('');
  }
  console.log('Đơn vị là đơn vị viewBox. Nới viewBox KHÔNG phải cách sửa: trên màn hẹp');
  console.log('mọi hình được vẽ ở 620px, nên viewBox rộng hơn nghĩa là chữ nhỏ đi.');
}

run()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(`\n${err.message}`);
    process.exit(2);
  });
