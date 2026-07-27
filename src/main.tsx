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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
