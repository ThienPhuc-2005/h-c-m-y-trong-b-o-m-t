/* eslint-disable no-undef */
/**
 * ============================================================================
 *  Service worker — làm cho lời hứa "chạy ngoại tuyến" thành sự thật
 * ============================================================================
 *
 *  Vì sao cần:
 *
 *  1. TOÀN BỘ GIÁO TRÌNH LÀ MỘT TỆP TĨNH LỚN (~500 KB nén). Trên mạng 3G, lần
 *     tải đầu mất khoảng 3–4 giây. Không có service worker thì MỌI lần mở app
 *     đều phải trả lại chi phí đó nếu bộ nhớ đệm trình duyệt bị dọn.
 *
 *  2. NGƯỜI HỌC ÔN TẬP Ở NHỮNG NƠI KHÔNG CÓ MẠNG — trên tàu, trong thang máy,
 *     lúc hết dung lượng data. Việc ôn thẻ mỗi ngày chỉ thành thói quen được
 *     nếu nó KHÔNG BAO GIỜ thất bại. Một lần mở app thấy màn hình lỗi là đủ để
 *     phá vỡ chuỗi ngày mà người ta đã giữ hàng tháng.
 *
 *  3. Tiến độ vốn đã nằm hoàn toàn trong máy (localStorage). Nếu phần giao diện
 *     cũng nằm trong máy thì app thực sự không cần máy chủ để hoạt động — đúng
 *     như những gì tài liệu cam kết.
 *
 *  NGUYÊN TẮC CÀI ĐẶT QUAN TRỌNG NHẤT:
 *  `respondWith` KHÔNG BAO GIỜ được nhận `undefined`. Nếu nhận, trình duyệt trả
 *  net::ERR_FAILED và tài nguyên đó coi như không tải được — kể cả khi mạng vẫn
 *  tốt. Một nhánh logic quên trả về giá trị sẽ làm hỏng app một cách khó truy
 *  vết, vì mọi tài nguyên khác vẫn chạy bình thường. Vì vậy mọi đường đi trong
 *  hàm dưới đây đều kết thúc bằng một Response thật.
 * ============================================================================
 */

// __PRECACHE__ được thay bằng danh sách tệp thật lúc build (xem scripts/build-sw.mjs).
const PRECACHE = self.__PRECACHE__ || ['./', './index.html'];
const VERSION = self.__SW_VERSION__ || 'dev';
const CACHE = `aegis-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        // addAll thất bại toàn bộ nếu MỘT tệp lỗi; thêm từng tệp để một lỗi lẻ
        // không làm hỏng toàn bộ khả năng ngoại tuyến.
        Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => undefined))),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/**
 * Tìm trong cache theo nhiều cách.
 *
 * `cache.match(request)` có thể trượt dù URL đã nằm trong cache: kịch bản gặp
 * thật là script kiểu module được yêu cầu với thuộc tính `crossorigin`, khiến
 * mode/credentials của Request khác với bản đã lưu bằng `cache.add(url)`. Thử
 * lại bằng chuỗi URL trần là cách khắc phục đáng tin và rẻ.
 */
async function fromCache(request) {
  const cache = await caches.open(CACHE);
  return (
    (await cache.match(request)) ??
    (await cache.match(request.url)) ??
    (await cache.match(request, { ignoreSearch: true, ignoreVary: true })) ??
    undefined
  );
}

async function putInCache(request, response) {
  if (!response || !response.ok || response.type === 'opaque') return;
  const cache = await caches.open(CACHE);
  await cache.put(request.url, response.clone()).catch(() => undefined);
}

/** Trang chủ lấy từ cache — dùng cho mọi điều hướng khi ngoại tuyến. */
async function cachedShell() {
  const cache = await caches.open(CACHE);
  return (await cache.match('./index.html')) ?? (await cache.match('./')) ?? undefined;
}

const OFFLINE_FALLBACK = () =>
  new Response('Tài nguyên chưa được lưu để dùng ngoại tuyến.', {
    status: 504,
    statusText: 'Gateway Timeout',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });

async function handle(request) {
  const isDocument = request.mode === 'navigate' || request.destination === 'document';

  if (isDocument) {
    // Ưu tiên mạng để nhận bản mới, rơi về vỏ trang đã lưu khi ngoại tuyến.
    try {
      const res = await fetch(request);
      if (res.ok) await putInCache(new Request('./index.html', { method: 'GET' }), res);
      return res;
    } catch {
      return (await cachedShell()) ?? OFFLINE_FALLBACK();
    }
  }

  // Mọi tài nguyên tĩnh còn lại: cache trước, mạng sau.
  const hit = await fromCache(request);
  if (hit) return hit;

  try {
    const res = await fetch(request);
    await putInCache(request, res);
    return res;
  } catch {
    return OFFLINE_FALLBACK();
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Chỉ phục vụ tài nguyên của chính app; không chen vào yêu cầu tới nơi khác.
  if (url.origin !== self.location.origin) return;

  // handle() luôn trả về một Response, kể cả khi mọi thứ hỏng.
  event.respondWith(handle(request));
});
