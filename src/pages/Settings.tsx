/**
 * Cài đặt.
 *
 * Mỗi tuỳ chọn ở đây đều kèm lời giải thích NGẮN về việc thay đổi nó ảnh hưởng
 * thế nào tới việc học. Một app học tập không nên bắt người dùng đoán mò xem
 * "mục tiêu ghi nhớ 0,95" nghĩa là gì — đoán sai làm hỏng lịch ôn của họ.
 */

import { useRef, useState } from 'react';
import {
  useProgress,
  setSettings,
  exportJSON,
  importJSON,
  resetAll,
  resetLearningOnly,
  DEFAULT_SETTINGS,
} from '../lib/storage';
import { downloadText } from '../lib/utils';
import { auditCourse, COURSE_STATS } from '../content';
import { Slider, Toggle } from '../labs/kit';

export function SettingsPage() {
  const p = useProgress();
  const s = p.settings;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirm, setConfirm] = useState<'none' | 'learning' | 'all'>('none');
  const [showAudit, setShowAudit] = useState(false);

  const doImport = (file: File) => {
    const r = new FileReader();
    r.onload = () => {
      const res = importJSON(String(r.result));
      setMsg({ ok: res.ok, text: res.message });
    };
    r.readAsText(file);
  };

  const issues = showAudit ? auditCourse() : [];

  return (
    <div className="container container-narrow stack" style={{ '--gap': 'var(--s-6)' } as React.CSSProperties}>
      <header>
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>Cài đặt</h1>
      </header>

      {msg && (
        <div className={`callout ${msg.ok ? 'co-pro' : 'co-warn'}`}>
          <span className="callout-icon" aria-hidden>{msg.ok ? '✓' : '⚠'}</span>
          <div className="callout-body">{msg.text}</div>
        </div>
      )}

      {/* ---- Hiển thị ------------------------------------------------------ */}
      <section className="card card-pad-lg stack">
        <h2 style={{ fontSize: 'var(--fs-lg)' }}>Hiển thị và khả năng tiếp cận</h2>

        <div className="field">
          <label><span>Chủ đề màu</span></label>
          <div className="row-wrap" style={{ gap: 'var(--s-2)' }}>
            {([
              ['auto', '🖥️ Theo hệ thống'],
              ['light', '☀️ Sáng'],
              ['dark', '🌙 Tối'],
            ] as const).map(([v, l]) => (
              <button key={v} className={`chip ${s.theme === v ? 'chip-brand' : ''}`} onClick={() => setSettings({ theme: v })}>
                {l}
              </button>
            ))}
          </div>
          <div className="field-hint">
            Chế độ tối dùng nền #0f1117 thay vì đen tuyệt đối — tương phản cực đại làm chữ trắng bị loang,
            đặc biệt khó chịu với người loạn thị.
          </div>
        </div>

        <Slider
          label="Cỡ chữ"
          value={s.fontScale}
          min={0.85}
          max={1.4}
          step={0.05}
          onChange={(v) => setSettings({ fontScale: v })}
          format={(v) => `${Math.round(v * 100)}%`}
          hint="Nếu bạn phải nheo mắt hoặc ngả người về phía màn hình, hãy tăng lên. Mỏi mắt làm giảm khả năng tiếp thu rõ rệt."
        />

        <Toggle label="Giảm hoạt ảnh" checked={s.reduceMotion} onChange={(v) => setSettings({ reduceMotion: v })} />
        <div className="field-hint" style={{ marginTop: -8 }}>
          Dành cho người nhạy cảm với chuyển động (rối loạn tiền đình, đau nửa đầu) — hoặc chỉ đơn giản là
          thích yên tĩnh.
        </div>

        <Toggle label="Chế độ tập trung (dòng ngắn hơn, giãn dòng rộng hơn)" checked={s.focusMode} onChange={(v) => setSettings({ focusMode: v })} />
      </section>

      {/* ---- Nhịp học ------------------------------------------------------ */}
      <section className="card card-pad-lg stack">
        <h2 style={{ fontSize: 'var(--fs-lg)' }}>Nhịp học</h2>

        <Slider
          label="Mục tiêu mỗi ngày"
          value={s.dailyGoalMinutes}
          min={5}
          max={120}
          step={5}
          onChange={(v) => setSettings({ dailyGoalMinutes: v })}
          format={(v) => `${v} phút`}
          hint="Chọn con số bạn giữ được kể cả ngày bận nhất. Mục tiêu quá tham vọng bị bỏ lỡ vài lần sẽ dẫn tới bỏ hẳn."
        />

        <Slider
          label="Thẻ mới tối đa mỗi ngày"
          value={s.newCardsPerDay}
          min={0}
          max={50}
          step={1}
          onChange={(v) => setSettings({ newCardsPerDay: v })}
          hint="Đây là núm quan trọng nhất trang này. Học 60 thẻ mới hôm nay nghĩa là 60 thẻ đến hạn vài ngày sau, cộng dồn với thẻ cũ. Vài lần như vậy là núi nợ ôn tập — nguyên nhân số 1 khiến người ta bỏ các app lặp lại ngắt quãng."
        />

        <Slider
          label="Thẻ ôn tối đa mỗi ngày"
          value={s.maxReviewsPerDay}
          min={20}
          max={400}
          step={10}
          onChange={(v) => setSettings({ maxReviewsPerDay: v })}
          hint="Trần an toàn cho những ngày bận. Thẻ vượt trần tự động dời sang hôm sau."
        />

        <Slider
          label="Mục tiêu xác suất nhớ"
          value={s.targetRetention}
          min={0.8}
          max={0.97}
          step={0.01}
          onChange={(v) => setSettings({ targetRetention: v })}
          format={(v) => `${(v * 100).toFixed(0)}%`}
          hint="0,90 là điểm cân bằng tốt nhất giữa thời gian bỏ ra và lượng nhớ được. Tăng lên 0,95 khiến số lượt ôn tăng vọt trong khi lợi ích chỉ nhỉnh hơn chút — chỉ đáng khi bạn đang chuẩn bị cho một kỳ thi cụ thể."
        />

        <Toggle label="Hiện khoảng cách ôn kế tiếp trên nút chấm điểm" checked={s.showIntervals} onChange={(v) => setSettings({ showIntervals: v })} />
        <Toggle label="Hỏi mức độ tự tin trước khi trả lời" checked={s.askConfidence} onChange={(v) => setSettings({ askConfidence: v })} />
        <div className="field-hint" style={{ marginTop: -8 }}>
          Tính năng này rèn khả năng tự đánh giá — kỹ năng quyết định việc bạn có ôn đúng chỗ hay không. Tắt
          nó sẽ làm phiên học nhanh hơn nhưng bạn mất biểu đồ hiệu chuẩn ở trang Tiến độ.
        </div>
      </section>

      {/* ---- Dữ liệu ------------------------------------------------------- */}
      <section className="card card-pad-lg stack">
        <h2 style={{ fontSize: 'var(--fs-lg)' }}>Dữ liệu của bạn</h2>
        <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
          Toàn bộ tiến độ nằm trong trình duyệt này, không có bản sao ở đâu khác. Xoá dữ liệu duyệt web, dùng
          chế độ ẩn danh, hoặc đổi máy đều làm mất sạch. <b>Hãy xuất tệp sao lưu định kỳ.</b>
        </p>

        <div className="row-wrap">
          <button
            className="btn btn-primary"
            onClick={() => {
              downloadText(`aegis-tien-do-${new Date().toISOString().slice(0, 10)}.json`, exportJSON());
              setMsg({ ok: true, text: 'Đã tải tệp sao lưu về máy.' });
            }}
          >
            ⬇ Xuất tệp sao lưu
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            ⬆ Nhập từ tệp
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doImport(f);
              e.target.value = '';
            }}
          />
        </div>

        <hr />

        <div className="stack" style={{ '--gap': 'var(--s-3)' } as React.CSSProperties}>
          {confirm === 'none' && (
            <div className="row-wrap">
              <button className="btn btn-sm" onClick={() => setConfirm('learning')}>Học lại từ đầu</button>
              <button className="btn btn-sm btn-danger" onClick={() => setConfirm('all')}>Xoá sạch mọi thứ</button>
              <button className="btn btn-sm btn-ghost" onClick={() => setSettings({ ...DEFAULT_SETTINGS, onboarded: true, name: s.name })}>
                Khôi phục cài đặt mặc định
              </button>
            </div>
          )}

          {confirm !== 'none' && (
            <div className="callout co-warn">
              <span className="callout-icon" aria-hidden>🛑</span>
              <div style={{ flex: 1 }}>
                <div className="callout-title">Không thể hoàn tác</div>
                <div className="callout-body">
                  {confirm === 'learning'
                    ? 'Sẽ xoá toàn bộ tiến độ bài học, thẻ ghi nhớ và thống kê, nhưng giữ lại các tuỳ chỉnh của bạn.'
                    : 'Sẽ xoá TẤT CẢ: tiến độ, thẻ, ghi chú, tuỳ chỉnh. App quay về trạng thái mới cài.'}
                  <div className="row-wrap" style={{ marginTop: 'var(--s-3)' }}>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        if (confirm === 'learning') resetLearningOnly();
                        else resetAll();
                        setConfirm('none');
                        setMsg({ ok: true, text: 'Đã xoá.' });
                      }}
                    >
                      Tôi hiểu, xoá đi
                    </button>
                    <button className="btn btn-sm" onClick={() => setConfirm('none')}>Huỷ</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---- Phím tắt ------------------------------------------------------ */}
      <section className="card card-pad-lg">
        <h2 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--s-4)' }}>Phím tắt</h2>
        <div className="grid grid-2" style={{ fontSize: 'var(--fs-sm)' }}>
          {[
            ['H', 'Trang chủ'],
            ['R', 'Ôn tập'],
            ['L', 'Lộ trình'],
            ['P', 'Luyện tập'],
            ['G', 'Thuật ngữ'],
            ['S', 'Cài đặt'],
            ['Space', 'Lật thẻ / chấm "Được"'],
            ['1 2 3 4', 'Chấm điểm thẻ đang ôn'],
          ].map(([k, d]) => (
            <div key={k} className="row">
              <kbd>{k}</kbd>
              <span className="muted">{d}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Về khoá học --------------------------------------------------- */}
      <section className="panel">
        <div className="stat-k" style={{ marginBottom: 'var(--s-3)' }}>Về khoá học này</div>
        <div className="grid grid-3" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--s-4)' }}>
          <div><b>{COURSE_STATS.tracks}</b> <span className="faint">chặng</span></div>
          <div><b>{COURSE_STATS.lessons}</b> <span className="faint">bài học</span></div>
          <div><b>{COURSE_STATS.cards}</b> <span className="faint">thẻ ghi nhớ</span></div>
          <div><b>{COURSE_STATS.questions}</b> <span className="faint">câu hỏi</span></div>
          <div><b>{COURSE_STATS.minutes}</b> <span className="faint">phút nội dung</span></div>
          <div><b>24</b> <span className="faint">phòng lab</span></div>
        </div>
        <button className="btn btn-sm btn-ghost" onClick={() => setShowAudit((x) => !x)}>
          {showAudit ? 'Ẩn' : 'Kiểm tra'} sức khoẻ nội dung
        </button>
        {showAudit && (
          <div style={{ marginTop: 'var(--s-3)' }}>
            {issues.length === 0 ? (
              <div className="chip chip-ok">✓ Mọi bài học đều đạt các tiêu chí bắt buộc</div>
            ) : (
              <>
                <div className="row-wrap" style={{ marginBottom: 'var(--s-2)' }}>
                  <span className="chip chip-bad">{issues.filter((i) => i.severity === 'error').length} lỗi</span>
                  <span className="chip chip-warn">{issues.filter((i) => i.severity === 'warn').length} cảnh báo</span>
                </div>
                <div className="table-wrap" style={{ maxHeight: 300, overflowY: 'auto' }}>
                  <table className="data">
                    <tbody>
                      {issues.slice(0, 80).map((it, i) => (
                        <tr key={i}>
                          <td className="mono" style={{ fontSize: 'var(--fs-xs)' }}>{it.lessonId}</td>
                          <td style={{ fontSize: 'var(--fs-xs)' }}>
                            {it.severity === 'error' ? '🛑' : '⚠️'} {it.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
