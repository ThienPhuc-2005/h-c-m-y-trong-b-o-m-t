/**
 * ============================================================================
 *  Kiểm hình vẽ trong trình duyệt thật
 * ============================================================================
 *  Ba lỗi mà không bộ test nào chạy trên jsdom bắt được, vì cả ba chỉ tồn tại
 *  sau khi trình duyệt đã dàn chữ bằng font thật:
 *
 *    1. Một phần tử nằm ngoài `viewBox` — nửa dòng chữ bị cắt cụt.
 *    2. Hai hộp chữ đè lên nhau — hai nhãn thành một vệt không đọc được.
 *    3. Một đường kẻ chạy xuyên giữa dòng chữ — trông y như chữ bị gạch bỏ.
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

import { PAGE_HELPERS } from './lib/do-hinh.mjs';
import { startVite, startBrowser, connect, evaluate, moApp } from './lib/cdp.mjs';

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
    console.log('\nKhông hình nào tràn khung, không hộp chữ nào đè nhau, không đường kẻ nào gạch qua chữ.');
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
      } else if (i.type === 'gach') {
        console.log(`    <${i.tag}> chạy ${i.huong} xuyên qua chữ "${i.label}"`);
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
