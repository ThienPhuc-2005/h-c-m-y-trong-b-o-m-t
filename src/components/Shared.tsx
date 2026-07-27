/** Những mảnh giao diện lặp lại trên nhiều trang. */

import type { ReactNode } from 'react';
import type { Lesson, Level, Track } from '../content/types';
import { LEVEL_KEY } from '../content/types';
import { href } from '../lib/router';
import { lessonState, LESSON_STATE_KEY, type LessonState } from '../lib/mastery';
import { useProgress } from '../lib/storage';
import { cx } from '../lib/utils';
import { Icon } from './Icon';
import { useT } from '../i18n';
import type { IconName } from './Icon';

const LEVEL_RANK: Record<Level, number> = {
  'nen-tang': 1,
  'co-ban': 2,
  'trung-cap': 3,
  'nang-cao': 4,
  'chuyen-gia': 4,
};

/** Mức độ hiển thị bằng CẢ chữ lẫn số vạch — không phụ thuộc vào màu. */
export function LevelBadge({ level }: { level: Level }) {
  const t = useT();
  const n = LEVEL_RANK[level];
  return (
    <span className="level" title={`${t('level.prefix')}: ${t(LEVEL_KEY[level])}`}>
      <span className="level-bars" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <i key={i} className={i <= n ? 'on' : ''} />
        ))}
      </span>
      {t(LEVEL_KEY[level])}
    </span>
  );
}

export function Ring({ value, size = 56, stroke = 5, label }: { value: number; size?: number; stroke?: number; label?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg className="ring" width={size} height={size} aria-hidden>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle
          className="ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, value)))}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          fontSize: size > 48 ? 'var(--fs-sm)' : 'var(--fs-2xs)',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {label ?? `${Math.round(value * 100)}%`}
      </div>
    </div>
  );
}

const STATE_CHIP: Record<LessonState, { cls: string; icon: IconName | null }> = {
  khoa: { cls: '', icon: 'lock' },
  moi: { cls: '', icon: null },
  'dang-hoc': { cls: 'chip-warn', icon: 'chevron-right' },
  'da-xong': { cls: 'chip-info', icon: 'check' },
  'thanh-thao': { cls: 'chip-ok', icon: 'star' },
};

export function LessonCard({ lesson, track, showTrack }: { lesson: Lesson; track?: Track; showTrack?: boolean }) {
  const t = useT();
  const p = useProgress();
  const st = lessonState(lesson, p);
  const lp = p.lessons[lesson.id];
  const chip = STATE_CHIP[st];

  return (
    <a
      href={href(`/hoc/${lesson.id}`)}
      className={cx('card', 'card-hover', 'card-accent')}
      data-hue={track?.hue}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', opacity: st === 'khoa' ? 0.72 : 1 }}
    >
      <div className="row-wrap" style={{ gap: 'var(--s-2)', marginBottom: 'var(--s-2)' }}>
        {showTrack && track && (
          <span className="chip chip-hue">
            <Icon name={track.icon} size={13} />
            {track.title}
          </span>
        )}
        <LevelBadge level={lesson.level} />
        <span className="spacer" />
        <span className="faint nowrap">{lesson.minutes} {t('common.minutes')}</span>
        {st !== 'moi' && (
          <span className={cx('chip', chip.cls)}>
            {chip.icon && <Icon name={chip.icon} size={13} filled={chip.icon === 'star'} />}
            {t(LESSON_STATE_KEY[st])}
          </span>
        )}
      </div>

      <h3 style={{ fontSize: 'var(--fs-md)', marginBottom: 4 }}>{lesson.title}</h3>
      <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--s-3)' }}>
        {lesson.subtitle}
      </p>

      <div
        style={{
          fontSize: 'var(--fs-xs)',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 'var(--s-3)',
          display: 'flex',
          gap: 'var(--s-2)',
        }}
      >
        <Icon name="target" size={15} />
        <span>{lesson.why.short}</span>
      </div>

      {lp && lp.readPct > 0 && !lp.completedAt && (
        <div className="bar" style={{ marginTop: 'var(--s-3)' }}>
          <div className="bar-fill" style={{ width: `${lp.readPct}%` }} />
        </div>
      )}
    </a>
  );
}

export function SectionHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="row-wrap" style={{ marginBottom: 'var(--s-4)', alignItems: 'flex-end' }}>
      <div style={{ flex: 1, minWidth: 220 }}>
        <h2 style={{ fontSize: 'var(--fs-lg)' }}>{title}</h2>
        {sub && <div className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 2 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ icon, title, sub, action }: { icon: IconName; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-ico"><Icon name={icon} size={38} stroke={1.5} /></div>
      <h3 style={{ fontSize: 'var(--fs-md)', marginBottom: 'var(--s-2)' }}>{title}</h3>
      {sub && <p className="muted" style={{ maxWidth: '46ch', margin: '0 auto var(--s-4)' }}>{sub}</p>}
      {action}
    </div>
  );
}

/** Biểu đồ cột nhỏ cho chuỗi ngày / dự báo. */
export function MiniBars({ values, labels, color = 'var(--brand)', height = 64 }: { values: number[]; labels?: string[]; color?: string; height?: number }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }} title={labels ? `${labels[i]}: ${v}` : String(v)}>
          <div
            style={{
              height: `${Math.max(v > 0 ? 6 : 2, (v / max) * 100)}%`,
              background: v > 0 ? color : 'var(--bg-sunken)',
              borderRadius: '3px 3px 0 0',
              transition: 'height var(--t-slow) var(--ease-out)',
            }}
          />
        </div>
      ))}
    </div>
  );
}
