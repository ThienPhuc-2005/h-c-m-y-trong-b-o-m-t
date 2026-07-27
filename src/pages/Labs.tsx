import { LABS, getLab } from '../labs';
import { getTrack } from '../content';
import { href } from '../lib/router';
import { Empty } from '../components/Shared';
import { Icon } from '../components/Icon';
import { useT } from '../i18n';

export function LabsPage({ id }: { id?: string }) {
  const t = useT();

  if (id) {
    const lab = getLab(id);
    if (!lab) {
      return (
        <div className="container">
          <Empty
            icon="beaker"
            title={t('labs.notFoundTitle')}
            action={<a className="btn btn-primary" href={href('/phong-lab')}>{t('common.seeAll')}</a>}
          />
        </div>
      );
    }
    const track = getTrack(lab.track);
    const C = lab.Component;
    return (
      <div className="container stack" data-hue={track?.hue}>
        <a href={href('/phong-lab')} className="faint row" style={{ textDecoration: 'none', gap: 4 }}>
          <Icon name="arrow-left" size={13} /> {t('labs.allLabs')}
        </a>
        <header>
          <div className="row-wrap" style={{ gap: 'var(--s-3)' }}>
            <Icon name={lab.icon} size={28} className="faint" />
            <div style={{ flex: 1, minWidth: 240 }}>
              <h1 style={{ fontSize: 'var(--fs-xl)' }}>{lab.title}</h1>
              <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{lab.blurb}</p>
            </div>
            {track && (
              <a className="chip chip-hue" href={href(`/chang/${track.id}`)} style={{ textDecoration: 'none' }}>
                <Icon name={track.icon} size={13} />
                {track.title}
              </a>
            )}
          </div>
        </header>
        <C />
      </div>
    );
  }

  const byTrack = new Map<string, typeof LABS>();
  for (const l of LABS) {
    const arr = byTrack.get(l.track) ?? [];
    arr.push(l);
    byTrack.set(l.track, arr);
  }

  return (
    <div className="container stack" style={{ '--gap': 'var(--s-8)' } as React.CSSProperties}>
      <header>
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>{t('labs.title')}</h1>
        <p className="muted" style={{ maxWidth: '64ch', marginTop: 'var(--s-2)' }}>
          {LABS.length} — {t('labs.intro')}
        </p>
      </header>

      {[...byTrack.entries()].map(([tid, labs]) => {
        const track = getTrack(tid);
        return (
          <section key={tid} data-hue={track?.hue}>
            <div className="row-wrap" style={{ marginBottom: 'var(--s-4)', gap: 'var(--s-2)' }}>
              <h2 style={{ fontSize: 'var(--fs-lg)' }} className="row">
                {track?.icon && <Icon name={track.icon} size={19} />}
                {track?.title ?? tid}
              </h2>
              <span className="chip chip-hue">{labs.length} {t('common.labs')}</span>
            </div>
            <div className="grid grid-3">
              {labs.map((l) => (
                <a key={l.id} href={href(`/phong-lab/${l.id}`)} className="card card-hover card-accent" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ marginBottom: 'var(--s-2)', color: 'var(--brand-text)' }}><Icon name={l.icon} size={24} /></div>
                  <b style={{ fontSize: 'var(--fs-sm)' }}>{l.title}</b>
                  <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 4 }}>{l.blurb}</p>
                </a>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
