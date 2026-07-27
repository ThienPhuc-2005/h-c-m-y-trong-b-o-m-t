import { LABS, getLab } from '../labs';
import { getTrack } from '../content';
import { href } from '../lib/router';
import { Empty } from '../components/Shared';

export function LabsPage({ id }: { id?: string }) {
  if (id) {
    const lab = getLab(id);
    if (!lab) {
      return (
        <div className="container">
          <Empty icon="🧪" title="Không tìm thấy phòng lab này" action={<a className="btn btn-primary" href={href('/phong-lab')}>Xem tất cả</a>} />
        </div>
      );
    }
    const track = getTrack(lab.track);
    const C = lab.Component;
    return (
      <div className="container stack" data-hue={track?.hue}>
        <a href={href('/phong-lab')} className="faint" style={{ textDecoration: 'none' }}>← Tất cả phòng lab</a>
        <header>
          <div className="row-wrap" style={{ gap: 'var(--s-3)' }}>
            <span style={{ fontSize: '2rem' }} aria-hidden>{lab.icon}</span>
            <div style={{ flex: 1, minWidth: 240 }}>
              <h1 style={{ fontSize: 'var(--fs-xl)' }}>{lab.title}</h1>
              <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{lab.blurb}</p>
            </div>
            {track && <a className="chip chip-hue" href={href(`/chang/${track.id}`)} style={{ textDecoration: 'none' }}>{track.icon} {track.title}</a>}
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
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>Phòng thí nghiệm</h1>
        <p className="muted" style={{ maxWidth: '64ch', marginTop: 'var(--s-2)' }}>
          {LABS.length} mô hình chạy thật ngay trong trình duyệt của bạn — không máy chủ, không dữ liệu gửi
          đi đâu. Vặn một núm và thấy hệ thống phát hiện sụp đổ dạy nhanh hơn mười trang chữ. Bạn có thể vào
          đây bất cứ lúc nào, kể cả khi chưa học bài tương ứng.
        </p>
      </header>

      {[...byTrack.entries()].map(([tid, labs]) => {
        const track = getTrack(tid);
        return (
          <section key={tid} data-hue={track?.hue}>
            <div className="row-wrap" style={{ marginBottom: 'var(--s-4)', gap: 'var(--s-2)' }}>
              <h2 style={{ fontSize: 'var(--fs-lg)' }}>
                {track?.icon} {track?.title ?? tid}
              </h2>
              <span className="chip chip-hue">{labs.length} lab</span>
            </div>
            <div className="grid grid-3">
              {labs.map((l) => (
                <a key={l.id} href={href(`/phong-lab/${l.id}`)} className="card card-hover card-accent" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontSize: '1.6rem', marginBottom: 'var(--s-2)' }} aria-hidden>{l.icon}</div>
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
