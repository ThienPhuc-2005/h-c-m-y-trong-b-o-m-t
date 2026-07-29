/**
 * ============================================================================
 *  Nói chuyện với Chrome qua giao thức DevTools
 * ============================================================================
 *  Dùng chung cho `check-figures.mjs` và `check-labs.mjs`. Không dependency:
 *  Node 22+ đã có `WebSocket` và `fetch` dựng sẵn, còn trình duyệt thì lấy từ
 *  máy đang chạy chứ không tải về.
 * ============================================================================
 */

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));

/**
 * Dựng máy chủ phát triển và trả về địa chỉ THẬT của nó.
 *
 * `--strictPort`: thà trượt ngay còn hơn để Vite âm thầm nhảy sang cổng khác
 * rồi script đo nhầm một máy chủ nào đó đang chạy sẵn.
 */
export function startVite(port) {
  return new Promise((resolve, reject) => {
    const bin = join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
    if (!existsSync(bin)) return reject(new Error('Không thấy vite — chạy `npm install` trước.'));
    const p = spawn(process.execPath, [bin, '--port', String(port), '--strictPort'], {
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

export function findBrowser() {
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

export async function startBrowser({ headful = false } = {}) {
  const exe = findBrowser();
  const profile = mkdtempSync(join(tmpdir(), 'aegis-'));
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
  if (!headful) flags.unshift('--headless=new', '--disable-gpu');
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

  return {
    proc,
    profile,
    wsUrl: page.webSocketDebuggerUrl,
    ten: exe.split(/[\\/]/).pop(),
    dong() {
      try { proc.kill(); } catch { /* đã chết */ }
      try { rmSync(profile, { recursive: true, force: true }); } catch { /* kệ */ }
    },
  };
}

export function connect(wsUrl) {
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
export async function evaluate(cdp, expression) {
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

/** Chờ tài liệu nạp xong. Hỏi thẳng trạng thái, ít mắt xích hơn nghe sự kiện. */
export async function doiNapXong(cdp) {
  for (let i = 0; i < 100; i++) {
    await new Promise((r) => setTimeout(r, 100));
    const ready = await evaluate(cdp, 'document.readyState === "complete"').catch(() => false);
    if (ready) return true;
  }
  return false;
}

/**
 * Mở app ở trạng thái đã qua màn hình chào.
 *
 * App chặn MỌI route bằng onboarding khi `settings.onboarded` còn false, nên
 * bỏ bước này là mọi phép đo đều đo đúng một màn hình chào.
 */
export async function moApp(cdp, baseUrl) {
  await cdp.send('Page.navigate', { url: baseUrl });
  await doiNapXong(cdp);
  await evaluate(
    cdp,
    `localStorage.setItem('aegis.progress.v1', JSON.stringify({ settings: { onboarded: true } })),
     localStorage.setItem('lang', 'vi'), 'ok'`,
  );
  await cdp.send('Page.reload');
  await doiNapXong(cdp);
  await evaluate(cdp, 'document.fonts.ready.then(() => "ok")');
}
