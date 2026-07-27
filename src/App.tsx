import { useEffect, useMemo } from 'react';
import { useRoute, segments, href, navigate } from './lib/router';
import { useProgress } from './lib/storage';
import { buildPlan } from './lib/plan';
import { HomePage } from './pages/Home';
import { RoadmapPage } from './pages/Roadmap';
import { TrackPage } from './pages/Track';
import { LessonPage } from './pages/Lesson';
import { ReviewPage } from './pages/Review';
import { PracticePage } from './pages/Practice';
import { LabsPage } from './pages/Labs';
import { GlossaryPage } from './pages/Glossary';
import { ProgressPage } from './pages/Progress';
import { SettingsPage } from './pages/Settings';
import { Onboarding } from './pages/Onboarding';

const NAV = [
  { path: '/', label: 'Hôm nay', icon: '🏠' },
  { path: '/lo-trinh', label: 'Lộ trình', icon: '🗺️' },
  { path: '/on-tap', label: 'Ôn tập', icon: '🔁', badge: 'due' as const },
  { path: '/luyen-tap', label: 'Luyện tập', icon: '🎲' },
  { path: '/phong-lab', label: 'Phòng lab', icon: '🔬' },
  { path: '/thuat-ngu', label: 'Thuật ngữ', icon: '📚' },
  { path: '/tien-do', label: 'Tiến độ', icon: '📊' },
];

export default function App() {
  const route = useRoute();
  const progress = useProgress();
  const seg = segments(route);
  const { settings } = progress;

  /* ---- Áp dụng tuỳ chỉnh của người học lên toàn tài liệu ------------------ */
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const dark =
        settings.theme === 'dark' ||
        (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.dataset.theme = dark ? 'dark' : 'light';
    };
    apply();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [settings.theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--user-scale', String(settings.fontScale));
    root.dataset.motion = settings.reduceMotion ? 'off' : 'on';
    root.dataset.focus = settings.focusMode ? 'on' : 'off';
  }, [settings.fontScale, settings.reduceMotion, settings.focusMode]);

  /* ---- Phím tắt toàn cục -------------------------------------------------
     Người dùng thành thạo không nên phải với chuột để chuyển giữa ôn tập và
     bài học — đó là ma sát nhỏ nhưng lặp lại hàng chục lần mỗi tuần.        */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const map: Record<string, string> = {
        h: '/',
        r: '/on-tap',
        l: '/lo-trinh',
        p: '/luyen-tap',
        g: '/thuat-ngu',
        s: '/cai-dat',
      };
      const target = map[e.key.toLowerCase()];
      if (target) {
        e.preventDefault();
        navigate(target);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const dueCount = useMemo(() => buildPlan(progress).due.length, [progress]);

  if (!settings.onboarded) return <Onboarding />;

  const page = (() => {
    switch (seg[0]) {
      case undefined:
        return <HomePage />;
      case 'lo-trinh':
        return <RoadmapPage />;
      case 'chang':
        return <TrackPage id={seg[1]} />;
      case 'hoc':
        return <LessonPage id={seg[1]} />;
      case 'on-tap':
        return <ReviewPage />;
      case 'luyen-tap':
        return <PracticePage />;
      case 'phong-lab':
        return <LabsPage id={seg[1]} />;
      case 'thuat-ngu':
        return <GlossaryPage />;
      case 'tien-do':
        return <ProgressPage />;
      case 'cai-dat':
        return <SettingsPage />;
      default:
        return <NotFound />;
    }
  })();

  const isLesson = seg[0] === 'hoc';

  return (
    <div className="app">
      <a className="skip-link" href="#main">Bỏ qua điều hướng, tới nội dung chính</a>

      <nav className="nav no-print" aria-label="Điều hướng chính">
        <div className="container container-wide nav-inner">
          <a className="brand" href={href('/')}>
            <BrandMark />
            <span>
              AEGIS
              <span className="brand-sub">Học máy cho An ninh mạng</span>
            </span>
          </a>

          <div className="nav-links">
            {NAV.map((n) => {
              const active = n.path === '/' ? route === '/' : route.startsWith(n.path);
              return (
                <a key={n.path} className="nav-link" href={href(n.path)} aria-current={active ? 'page' : undefined}>
                  <span aria-hidden>{n.icon}</span>
                  <span>{n.label}</span>
                  {n.badge === 'due' && dueCount > 0 && (
                    <span className="nav-badge">{dueCount > 99 ? '99+' : dueCount}</span>
                  )}
                </a>
              );
            })}
          </div>

          <span className="spacer" />
          <a
            className="nav-link"
            href={href('/cai-dat')}
            aria-current={route.startsWith('/cai-dat') ? 'page' : undefined}
            aria-label="Cài đặt"
            title="Cài đặt (phím S)"
          >
            <span aria-hidden>⚙️</span>
          </a>
        </div>
      </nav>

      <main id="main" className="main">
        {page}
      </main>

      {!isLesson && (
        <footer className="container no-print" style={{ paddingBottom: 'var(--s-8)' }}>
          <hr />
          <div className="row-wrap faint" style={{ justifyContent: 'space-between' }}>
            <span>AEGIS — chạy hoàn toàn trong trình duyệt của bạn. Không tài khoản, không máy chủ, không theo dõi.</span>
            <span className="row" style={{ gap: 'var(--s-3)' }}>
              <a href={href('/cai-dat')}>Sao lưu tiến độ</a>
              <span aria-hidden>·</span>
              <span>
                <kbd>H</kbd> trang chủ <kbd>R</kbd> ôn tập <kbd>L</kbd> lộ trình
              </span>
            </span>
          </div>
        </footer>
      )}
    </div>
  );
}

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="aegis-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand)" />
          <stop offset="100%" stopColor="var(--info)" />
        </linearGradient>
      </defs>
      <path d="M16 2 L28 7 v9 c0 7.2-5 12.6-12 14.9C9 28.6 4 23.2 4 16 V7 z" fill="url(#aegis-mark)" opacity="0.16" />
      <path d="M16 2 L28 7 v9 c0 7.2-5 12.6-12 14.9C9 28.6 4 23.2 4 16 V7 z" fill="none" stroke="url(#aegis-mark)" strokeWidth="1.8" />
      <path d="M16 15.6 L10.5 18.6 M16 15.6 L21.5 18.6 M10.5 20 L21.5 20" stroke="var(--brand)" strokeWidth="1.3" opacity="0.65" />
      <circle cx="16" cy="13" r="2.6" fill="var(--brand)" />
      <circle cx="10.5" cy="20" r="2" fill="var(--info)" />
      <circle cx="21.5" cy="20" r="2" fill="var(--info)" />
    </svg>
  );
}

function NotFound() {
  return (
    <div className="container">
      <div className="empty">
        <div className="empty-ico" aria-hidden>🧭</div>
        <h2>Không tìm thấy trang này</h2>
        <p className="muted" style={{ marginBottom: 'var(--s-5)' }}>
          Có thể liên kết đã cũ hoặc địa chỉ bị gõ nhầm.
        </p>
        <a className="btn btn-primary" href={href('/')}>
          Về trang chủ
        </a>
      </div>
    </div>
  );
}
