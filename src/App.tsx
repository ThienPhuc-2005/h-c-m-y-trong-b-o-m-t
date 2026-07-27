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
import { SearchPalette, openSearch } from './components/Search';
import { Icon, BrandIcon } from './components/Icon';
import { DataGuard } from './components/DataGuard';
import type { IconName } from './components/Icon';
import { useT, useLang, setLang, LANGS } from './i18n';

const NAV: { path: string; key: string; icon: IconName; badge?: 'due' }[] = [
  { path: '/', key: 'nav.today', icon: 'home' },
  { path: '/lo-trinh', key: 'nav.roadmap', icon: 'map' },
  { path: '/on-tap', key: 'nav.review', icon: 'repeat', badge: 'due' },
  { path: '/luyen-tap', key: 'nav.practice', icon: 'dices' },
  { path: '/phong-lab', key: 'nav.labs', icon: 'flask' },
  { path: '/thuat-ngu', key: 'nav.glossary', icon: 'book-a' },
  { path: '/tien-do', key: 'nav.progress', icon: 'chart' },
];

export default function App() {
  const route = useRoute();
  const t = useT();
  const lang = useLang();
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

  // Đồng bộ thuộc tính lang của tài liệu với lựa chọn đã lưu, ngay từ lần vẽ
  // đầu tiên: trình đọc màn hình chọn giọng đọc dựa vào nó.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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

  // Dải cứu hộ phải hiện CẢ ở màn hình khởi động. Dữ liệu hỏng làm `onboarded`
  // trở lại false, nên đây chính là màn hình mà một người học lâu năm sẽ đâm
  // vào — và nếu không có lời giải thích nào, họ sẽ tưởng mình mất sạch.
  if (!settings.onboarded) {
    return (
      <>
        <DataGuard />
        <Onboarding />
      </>
    );
  }

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
      <a className="skip-link" href="#main">{t('nav.skip')}</a>

      <nav className="nav no-print" aria-label={t('nav.main')}>
        <div className="container container-wide nav-inner">
          <a className="brand" href={href('/')}>
            <BrandMark />
            <span>
              AEGIS
              <span className="brand-sub">{t('nav.brandSub')}</span>
            </span>
          </a>

          <div className="nav-links">
            {NAV.map((n) => {
              const active = n.path === '/' ? route === '/' : route.startsWith(n.path);
              return (
                <a key={n.path} className="nav-link" href={href(n.path)} aria-current={active ? 'page' : undefined}>
                  <Icon name={n.icon} size={17} />
                  <span>{t(n.key)}</span>
                  {n.badge === 'due' && dueCount > 0 && (
                    <span className="nav-badge">{dueCount > 99 ? '99+' : dueCount}</span>
                  )}
                </a>
              );
            })}
          </div>

          <span className="spacer" />
          {/* Nút đổi ngôn ngữ hiện thẳng mã ngôn ngữ ĐANG dùng, không phải cờ:
              cờ đại diện cho quốc gia chứ không phải ngôn ngữ, và một lá cờ
              nhỏ xíu là thứ khó đọc nhất trên thanh điều hướng. */}
          <div className="lang-switch" role="group" aria-label={t('nav.language')}>
            {LANGS.map((l) => (
              <button
                key={l.code}
                className="lang-opt"
                onClick={() => setLang(l.code)}
                aria-pressed={lang === l.code}
                title={`${t('nav.languageTitle')} — ${l.label}`}
              >
                {l.short}
              </button>
            ))}
          </div>
          <button
            className="nav-link"
            onClick={openSearch}
            aria-label={t('nav.searchLabel')}
            title={t('nav.searchTitle')}
          >
            <Icon name="search" size={17} />
            <kbd style={{ fontSize: '0.7em' }}>/</kbd>
          </button>
          <a
            className="nav-link"
            href={href('/cai-dat')}
            aria-current={route.startsWith('/cai-dat') ? 'page' : undefined}
            aria-label={t('nav.settings')}
            title={t('nav.settingsTitle')}
          >
            <Icon name="settings" size={17} />
          </a>
        </div>
      </nav>

      <main id="main" className="main">
        {/* Đặt trên mọi trang, không riêng trang chủ: người học có thể sống
            hàng tuần trong trang Ôn tập mà không ghé trang chủ lần nào. */}
        <DataGuard />
        {page}
      </main>

      <SearchPalette />

      {!isLesson && (
        <footer className="container no-print" style={{ paddingBottom: 'var(--s-8)' }}>
          <hr />
          <div className="row-wrap faint" style={{ justifyContent: 'space-between' }}>
            <span>{t('footer.tagline')}</span>
            <span className="row" style={{ gap: 'var(--s-3)' }}>
              <a href={href('/cai-dat')}>{t('footer.backup')}</a>
              <span aria-hidden>·</span>
              <span>
                <kbd>/</kbd> {t('footer.keySearch')} <kbd>H</kbd> {t('footer.keyHome')} <kbd>R</kbd>{' '}
                {t('footer.keyReview')} <kbd>L</kbd> {t('footer.keyRoadmap')}
              </span>
            </span>
          </div>
          <div className="row-wrap faint" style={{ justifyContent: 'space-between', marginTop: 'var(--s-3)' }}>
            <span>{t('footer.author')}</span>
            <span className="row" style={{ gap: 'var(--s-4)' }}>
              <a className="row" style={{ gap: 'var(--s-2)' }} href="https://www.facebook.com/thien.phuc.450676/" target="_blank" rel="noopener noreferrer">
                <BrandIcon name="facebook" />
                Facebook
              </a>
              <a className="row" style={{ gap: 'var(--s-2)' }} href="https://t.me/Benedetta24k" target="_blank" rel="noopener noreferrer">
                <BrandIcon name="telegram" />
                Telegram
              </a>
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
      {/* Màu đặc, không chuyển sắc: khiên là hình đọc ở cỡ 30px, và một dải
          gradient ở kích thước đó chỉ làm nét viền bạc màu ở một đầu. */}
      <path d="M16 2 L28 7 v9 c0 7.2-5 12.6-12 14.9C9 28.6 4 23.2 4 16 V7 z" fill="var(--brand)" opacity="0.14" />
      <path d="M16 2 L28 7 v9 c0 7.2-5 12.6-12 14.9C9 28.6 4 23.2 4 16 V7 z" fill="none" stroke="var(--brand)" strokeWidth="1.8" />
      <path d="M16 15.6 L10.5 18.6 M16 15.6 L21.5 18.6 M10.5 20 L21.5 20" stroke="var(--brand)" strokeWidth="1.3" opacity="0.65" />
      <circle cx="16" cy="13" r="2.6" fill="var(--brand)" />
      <circle cx="10.5" cy="20" r="2" fill="var(--info)" />
      <circle cx="21.5" cy="20" r="2" fill="var(--info)" />
    </svg>
  );
}

function NotFound() {
  const t = useT();
  return (
    <div className="container">
      <div className="empty">
        <div className="empty-ico"><Icon name="compass" size={40} stroke={1.5} /></div>
        <h2>{t('notFound.title')}</h2>
        <p className="muted" style={{ marginBottom: 'var(--s-5)' }}>{t('notFound.sub')}</p>
        <a className="btn btn-primary" href={href('/')}>
          {t('common.backHome')}
        </a>
      </div>
    </div>
  );
}
