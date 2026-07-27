import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import App from './App';

/**
 * Đặt chủ đề sáng/tối TRƯỚC khi React dựng cây component để tránh "nháy trắng"
 * — một chớp sáng chói giữa đêm là kiểu chi tiết nhỏ khiến người ta đóng app.
 */
(() => {
  try {
    const raw = localStorage.getItem('aegis.progress.v1');
    const theme = raw ? JSON.parse(raw)?.settings?.theme : 'auto';
    const dark =
      theme === 'dark' ||
      ((theme === 'auto' || !theme) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  } catch {
    document.documentElement.dataset.theme = 'light';
  }
})();

/**
 * Đăng ký service worker để app dùng được khi mất mạng.
 *
 * Đăng ký SAU khi trang đã tải xong: quá trình nạp sẵn tài nguyên vào cache
 * cạnh tranh băng thông với chính lần tải đầu tiên, và lần đầu là lúc người
 * học ít kiên nhẫn nhất.
 *
 * Chỉ chạy ở bản build thật — ở chế độ phát triển, service worker phục vụ đồ
 * cũ trong cache và làm người viết mã tưởng thay đổi của mình không có tác dụng.
 */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Đường dẫn tương đối so với TRANG, không phải so với import.meta.url: với
    // base './' thì import.meta.url trỏ vào thư mục assets/, nên sw.js sẽ bị tìm
    // ở /assets/sw.js và đăng ký thất bại trong im lặng. Dùng './sw.js' cũng giữ
    // đúng khi app được đặt trong thư mục con (GitHub Pages).
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {
      // Không đăng ký được (trang mở qua file://, trình duyệt chặn…) thì app vẫn
      // chạy bình thường, chỉ mất khả năng ngoại tuyến. Không làm phiền người học.
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
