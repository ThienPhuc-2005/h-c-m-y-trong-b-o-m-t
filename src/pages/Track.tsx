import { useMemo } from 'react';
import { getTrack, TRACKS } from '../content';
import { useProgress } from '../lib/storage';
import { trackProgress } from '../lib/mastery';
import { href } from '../lib/router';
import { LessonCard, Ring, Empty } from '../components/Shared';
import { fmtDuration } from '../lib/utils';
import { LABS } from '../labs';
import { Icon } from '../components/Icon';
import { useT } from '../i18n';

export function TrackPage({ id }: { id?: string }) {
  const t = useT();
  const p = useProgress();
  const track = id ? getTrack(id) : undefined;
  const tp = useMemo(() => (track ? trackProgress(track.id, p) : null), [track, p]);

  if (!track || !tp) {
    return (
      <div className="container">
        <Empty
          icon="map"
          title={t('track.notFound')}
          action={<a className="btn btn-primary" href={href('/lo-trinh')}>{t('roadmap.title')}</a>}
        />
      </div>
    );
  }

  const idx = TRACKS.findIndex((t) => t.id === track.id);
  const prev = idx > 0 ? TRACKS[idx - 1] : undefined;
  const next = idx < TRACKS.length - 1 ? TRACKS[idx + 1] : undefined;
  const trackLabs = LABS.filter((l) => l.track === track.id);
  const totalMinutes = track.lessons.reduce((s, l) => s + l.minutes + l.practiceMinutes, 0);

  return (
    <div className="container stack" data-hue={track.hue} style={{ '--gap': 'var(--s-8)' } as React.CSSProperties}>
      <header className="stack">
        <a href={href('/lo-trinh')} className="faint" style={{ textDecoration: 'none' }}>
          <Icon name="arrow-left" size={14} /> {t('roadmap.title')}
        </a>
        <div className="row-wrap">
          <Icon name={track.icon} size={40} stroke={1.6} style={{ color: 'var(--hue-text)' }} />
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="chip chip-hue" style={{ marginBottom: 6 }}>{t('roadmap.track', { n: track.order })}</div>
            <h1 style={{ fontSize: 'var(--fs-2xl)' }}>{track.title}</h1>
            <div style={{ color: 'var(--hue-text)', fontWeight: 550, marginTop: 2 }}>{track.tagline}</div>
          </div>
          <Ring value={tp.ratio} size={68} />
        </div>
        <p className="muted" style={{ maxWidth: 'var(--measure)' }}>{track.blurb}</p>
        <div className="row-wrap faint">
          <span>{track.lessons.length} {t('common.lessons')}</span>
          <span aria-hidden>·</span>
          <span>{fmtDuration(totalMinutes)}</span>
          <span aria-hidden>·</span>
          <span>{track.lessons.reduce((s, l) => s + l.cards.length, 0)} {t('common.memoryCards')}</span>
          {trackLabs.length > 0 && (
            <>
              <span aria-hidden>·</span>
              <span>{trackLabs.length} {t('common.labs')}</span>
            </>
          )}
        </div>
      </header>

      <section className="card card-pad-lg" style={{ background: 'var(--hue-soft)', borderColor: 'color-mix(in srgb, var(--hue) 30%, transparent)' }}>
        <div className="stat-k" style={{ marginBottom: 'var(--s-3)' }}>{t('track.outcomes')}</div>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
          {track.outcomes.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--s-4)' }}>{t('track.lessonsHead')}</h2>
        <div className="grid grid-2">
          {track.lessons.map((l) => (
            <LessonCard key={l.id} lesson={l} track={track} />
          ))}
        </div>
      </section>

      {trackLabs.length > 0 && (
        <section>
          <h2 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--s-4)' }}>{t('track.labsHead')}</h2>
          <div className="grid grid-3">
            {trackLabs.map((l) => (
              <a key={l.id} href={href(`/phong-lab/${l.id}`)} className="card card-hover" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ marginBottom: 'var(--s-2)', color: 'var(--hue-text)' }}><Icon name={l.icon} size={22} /></div>
                <b style={{ fontSize: 'var(--fs-sm)' }}>{l.title}</b>
                <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 4 }}>{l.blurb}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      <nav className="row-wrap" style={{ justifyContent: 'space-between', paddingTop: 'var(--s-4)', borderTop: '1px solid var(--border)' }}>
        {prev ? (
          <a className="btn" href={href(`/chang/${prev.id}`)}>
            <Icon name="arrow-left" size={14} /> {prev.title}
          </a>
        ) : (
          <span />
        )}
        {next && (
          <a className="btn" href={href(`/chang/${next.id}`)}>
            {next.title} <Icon name="arrow-right" size={14} />
          </a>
        )}
      </nav>
    </div>
  );
}
