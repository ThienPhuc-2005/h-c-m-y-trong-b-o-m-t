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
  inspectJSON,
  describe,
  canUndoImport,
  undoImport,
  resetAll,
  resetLearningOnly,
  DEFAULT_SETTINGS,
  type Snapshot,
} from '../lib/storage';
import { downloadText, fmtRelative, fmtDate } from '../lib/utils';
import { auditCourse, COURSE_STATS } from '../content';
import { Slider, Toggle } from '../labs/kit';
import { Icon } from '../components/Icon';
import { useT, useLang, setLang, LANGS } from '../i18n';

export function SettingsPage() {
  const t = useT();
  const lang = useLang();
  const p = useProgress();
  const s = p.settings;
  const fileRef = useRef<HTMLInputElement>(null);
  // Lưu KHOÁ dịch chứ không lưu câu đã dịch: nếu người dùng đổi ngôn ngữ
  // ngay sau khi nhập tệp, thông báo cũng phải đổi theo.
  const [msg, setMsg] = useState<{ ok: boolean; key: string } | null>(null);
  const [confirm, setConfirm] = useState<'none' | 'learning' | 'all'>('none');
  const [showAudit, setShowAudit] = useState(false);
  // Tệp đã đọc xong và đã kiểm, đang chờ người học xác nhận. Giữ cả nội dung
  // thô để không phải đọc lại tệp lần thứ hai.
  const [pending, setPending] = useState<{ text: string; incoming: Snapshot } | null>(null);
  const [undoable, setUndoable] = useState(canUndoImport());

  /**
   * Đọc và KIỂM tệp, nhưng chưa ghi gì. Nhập tệp có sức phá hoại đúng bằng nút
   * "Xoá tất cả" ngay bên dưới — mà nút đó có hai bước xác nhận, còn trước đây
   * nhập tệp thì không có bước nào.
   */
  const doImport = (file: File) => {
    const r = new FileReader();
    r.onload = () => {
      const text = String(r.result);
      const res = inspectJSON(text);
      if (!res.ok) {
        setMsg({ ok: false, key: res.messageKey });
        return;
      }
      setMsg(null);
      setPending({ text, incoming: res.snapshot });
    };
    r.readAsText(file);
  };

  const current = describe(p);

  const issues = showAudit ? auditCourse() : [];

  return (
    <div className="container container-narrow stack" style={{ '--gap': 'var(--s-6)' } as React.CSSProperties}>
      <header>
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>{t('settings.title')}</h1>
      </header>

      {msg && (
        <div className={`callout ${msg.ok ? 'co-pro' : 'co-warn'}`}>
          <Icon className="callout-icon" name={msg.ok ? 'check' : 'alert-triangle'} size={17} />
          <div className="callout-body">{t(msg.key)}</div>
        </div>
      )}

      {/* ---- Hiển thị ------------------------------------------------------ */}
      <section className="card card-pad-lg stack">
        <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t('settings.displayHead')}</h2>

        <div className="field">
          <label><span>{t('settings.language')}</span></label>
          <div className="row-wrap" style={{ gap: 'var(--s-2)' }}>
            {LANGS.map((l) => (
              <button
                key={l.code}
                className={`chip ${lang === l.code ? 'chip-brand' : ''}`}
                onClick={() => setLang(l.code)}
              >
                <Icon name="languages" size={13} /> {l.label}
              </button>
            ))}
          </div>
          {/* Câu này nói "giao diện đã chuyển sang English" — hiện nó cho người
              đang dùng tiếng Việt là nói sai với đúng người đang đọc. */}
          {lang === 'en' && <div className="field-hint">{t('content.noticeLong')}</div>}
        </div>

        <div className="field">
          <label><span>{t('settings.theme')}</span></label>
          <div className="row-wrap" style={{ gap: 'var(--s-2)' }}>
            {([
              ['auto', 'monitor', 'settings.themeAuto'],
              ['light', 'sun', 'settings.themeLight'],
              ['dark', 'moon', 'settings.themeDark'],
              ['gold', 'gem', 'settings.themeGold'],
            ] as const).map(([v, ico, k]) => (
              <button key={v} className={`chip ${s.theme === v ? 'chip-brand' : ''}`} onClick={() => setSettings({ theme: v })}>
                <Icon name={ico} size={13} /> {t(k)}
              </button>
            ))}
          </div>
          <div className="field-hint">{t('settings.themeHint')}</div>
        </div>

        <Slider
          label={t('settings.fontSize')}
          value={s.fontScale}
          min={0.85}
          max={1.4}
          step={0.05}
          onChange={(v) => setSettings({ fontScale: v })}
          format={(v) => `${Math.round(v * 100)}%`}
          hint={t('settings.fontSizeHint')}
        />

        <Toggle label={t('settings.reduceMotion')} checked={s.reduceMotion} onChange={(v) => setSettings({ reduceMotion: v })} />
        <div className="field-hint" style={{ marginTop: -8 }}>{t('settings.reduceMotionHint')}</div>

        <Toggle label={t('settings.focusMode')} checked={s.focusMode} onChange={(v) => setSettings({ focusMode: v })} />
      </section>

      {/* ---- Nhịp học ------------------------------------------------------ */}
      <section className="card card-pad-lg stack">
        <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t('settings.paceHead')}</h2>

        <Slider
          label={t('settings.dailyGoal')}
          value={s.dailyGoalMinutes}
          min={5}
          max={120}
          step={5}
          onChange={(v) => setSettings({ dailyGoalMinutes: v })}
          format={(v) => `${v} ${t('common.minutes')}`}
          hint={t('settings.dailyGoalHint')}
        />

        <Slider
          label={t('settings.newCards')}
          value={s.newCardsPerDay}
          min={0}
          max={50}
          step={1}
          onChange={(v) => setSettings({ newCardsPerDay: v })}
          hint={t('settings.newCardsHint')}
        />

        <Slider
          label={t('settings.maxReviews')}
          value={s.maxReviewsPerDay}
          min={20}
          max={400}
          step={10}
          onChange={(v) => setSettings({ maxReviewsPerDay: v })}
          hint={t('settings.maxReviewsHint')}
        />

        <Slider
          label={t('settings.targetRetention')}
          value={s.targetRetention}
          min={0.8}
          max={0.97}
          step={0.01}
          onChange={(v) => setSettings({ targetRetention: v })}
          format={(v) => `${(v * 100).toFixed(0)}%`}
          hint={t('settings.targetRetentionHint')}
        />

        <Toggle label={t('settings.showIntervals')} checked={s.showIntervals} onChange={(v) => setSettings({ showIntervals: v })} />
        <Toggle label={t('settings.askConfidence')} checked={s.askConfidence} onChange={(v) => setSettings({ askConfidence: v })} />
        <div className="field-hint" style={{ marginTop: -8 }}>{t('settings.askConfidenceHint')}</div>
      </section>

      {/* ---- Dữ liệu ------------------------------------------------------- */}
      <section className="card card-pad-lg stack">
        <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t('settings.dataHead')}</h2>
        <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
          {t('settings.dataIntro')} <b>{t('settings.dataIntroBold')}</b>
        </p>

        <div className="faint">
          {t('settings.lastBackup', {
            when: p.lastExportAt ? fmtRelative(p.lastExportAt) : t('duration.never'),
          })}
        </div>

        <div className="row-wrap">
          <button
            className="btn btn-primary"
            onClick={() => {
              downloadText(`aegis-tien-do-${new Date().toISOString().slice(0, 10)}.json`, exportJSON());
              setMsg({ ok: true, key: 'settings.exported' });
            }}
          >
            <Icon name="download" size={15} /> {t('settings.export')}
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={15} /> {t('settings.import')}
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
          {undoable && !pending && (
            <button
              className="btn btn-ghost"
              onClick={() => {
                if (undoImport()) {
                  setMsg({ ok: true, key: 'settings.importUndone' });
                  setUndoable(false);
                }
              }}
            >
              <Icon name="rotate-ccw" size={15} /> {t('settings.importUndo')}
            </button>
          )}
        </div>

        {/* ---- Đối chiếu trước khi ghi đè ---------------------------------- */}
        {pending && (
          <div className="callout co-warn">
            <Icon className="callout-icon" name="alert-triangle" size={18} />
            <div style={{ flex: 1 }}>
              <div className="callout-title">{t('settings.importConfirmTitle')}</div>
              <div className="callout-body">
                <div className="grid grid-2" style={{ gap: 'var(--s-3)', marginTop: 'var(--s-2)' }}>
                  {(
                    [
                      ['settings.importIncoming', pending.incoming],
                      ['settings.importCurrent', current],
                    ] as const
                  ).map(([label, snap]) => (
                    <div className="panel" key={label}>
                      <div className="stat-k" style={{ marginBottom: 4 }}>{t(label)}</div>
                      <div style={{ fontSize: 'var(--fs-sm)' }}>
                        {t('settings.importStatLessons', { n: snap.lessonsDone })}
                        <br />
                        {t('settings.importStatCards', { n: snap.cards })}
                        <br />
                        {t('settings.importStatMinutes', { n: snap.minutes })}
                      </div>
                      <div className="faint" style={{ marginTop: 4 }}>
                        {snap.exportedAt
                          ? t('settings.importExported', { date: fmtDate(snap.exportedAt) })
                          : t('settings.importExportedNever')}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="row-wrap" style={{ marginTop: 'var(--s-3)' }}>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      const res = importJSON(pending.text);
                      setMsg({ ok: res.ok, key: res.messageKey });
                      setPending(null);
                      setUndoable(canUndoImport());
                    }}
                  >
                    {t('settings.importConfirm')}
                  </button>
                  <button className="btn btn-sm" onClick={() => setPending(null)}>
                    {t('settings.cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <hr />

        {/* Ba nút này từng nằm trần sau một đường kẻ, không tiêu đề, không một
            dòng giải thích — nên "Học lại từ đầu" tồn tại mà người học không
            tìm ra. Một chức năng không tìm thấy được thì bằng không tồn tại. */}
        <div className="stack" style={{ '--gap': 'var(--s-3)' } as React.CSSProperties} id="lam-lai">
          <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t('settings.resetHead')}</h2>
          <p className="muted" style={{ marginTop: 'calc(-1 * var(--s-2))' }}>{t('settings.resetIntro')}</p>
          {confirm === 'none' && (
            <div className="row-wrap">
              <button className="btn btn-sm btn-primary" onClick={() => setConfirm('learning')}>
                <Icon name="rotate-ccw" size={14} /> {t('settings.resetLearning')}
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => setConfirm('all')}>{t('settings.resetAll')}</button>
              <button className="btn btn-sm btn-ghost" onClick={() => setSettings({ ...DEFAULT_SETTINGS, onboarded: true, name: s.name })}>
                {t('settings.resetDefaults')}
              </button>
            </div>
          )}

          {confirm !== 'none' && (
            <div className="callout co-warn">
              <Icon className="callout-icon" name="alert-octagon" size={18} />
              <div style={{ flex: 1 }}>
                <div className="callout-title">{t('settings.noUndo')}</div>
                <div className="callout-body">
                  {t(confirm === 'learning' ? 'settings.confirmLearning' : 'settings.confirmAll')}
                  <div className="row-wrap" style={{ marginTop: 'var(--s-3)' }}>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        if (confirm === 'learning') resetLearningOnly();
                        else resetAll();
                        setConfirm('none');
                        setMsg({ ok: true, key: 'settings.erased' });
                      }}
                    >
                      {t('settings.confirmYes')}
                    </button>
                    <button className="btn btn-sm" onClick={() => setConfirm('none')}>{t('settings.cancel')}</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---- Phím tắt ------------------------------------------------------ */}
      <section className="card card-pad-lg">
        <h2 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--s-4)' }}>{t('settings.shortcutsHead')}</h2>
        <div className="grid grid-2" style={{ fontSize: 'var(--fs-sm)' }}>
          {[
            ['/  ·  Ctrl+K', 'settings.scSearch'],
            ['H', 'settings.scHome'],
            ['R', 'settings.scReview'],
            ['L', 'settings.scRoadmap'],
            ['P', 'settings.scPractice'],
            ['G', 'settings.scGlossary'],
            ['S', 'settings.scSettings'],
            ['Space', 'settings.scFlip'],
            ['1 2 3 4', 'settings.scGrade'],
          ].map(([k, d]) => (
            <div key={k} className="row">
              <kbd>{k}</kbd>
              <span className="muted">{t(d)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Về khoá học --------------------------------------------------- */}
      <section className="panel">
        <div className="stat-k" style={{ marginBottom: 'var(--s-3)' }}>{t('settings.aboutHead')}</div>
        <div className="grid grid-3" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--s-4)' }}>
          <div><b>{COURSE_STATS.tracks}</b> <span className="faint">{t('settings.statTracks')}</span></div>
          <div><b>{COURSE_STATS.lessons}</b> <span className="faint">{t('settings.statLessons')}</span></div>
          <div><b>{COURSE_STATS.cards}</b> <span className="faint">{t('settings.statCards')}</span></div>
          <div><b>{COURSE_STATS.questions}</b> <span className="faint">{t('settings.statQuestions')}</span></div>
          <div><b>{COURSE_STATS.minutes}</b> <span className="faint">{t('settings.statMinutes')}</span></div>
          <div><b>{COURSE_STATS.labs}</b> <span className="faint">{t('settings.statLabs')}</span></div>
        </div>
        <button className="btn btn-sm btn-ghost" onClick={() => setShowAudit((x) => !x)}>
          {t(showAudit ? 'settings.auditHide' : 'settings.auditShow')}
        </button>
        {showAudit && (
          <div style={{ marginTop: 'var(--s-3)' }}>
            {issues.length === 0 ? (
              <div className="chip chip-ok">
                <Icon name="check" size={13} /> {t('settings.auditOk')}
              </div>
            ) : (
              <>
                <div className="row-wrap" style={{ marginBottom: 'var(--s-2)' }}>
                  <span className="chip chip-bad">
                    {t('settings.auditErrors', { n: issues.filter((i) => i.severity === 'error').length })}
                  </span>
                  <span className="chip chip-warn">
                    {t('settings.auditWarns', { n: issues.filter((i) => i.severity === 'warn').length })}
                  </span>
                </div>
                <div className="table-wrap" style={{ maxHeight: 300, overflowY: 'auto' }}>
                  <table className="data">
                    <tbody>
                      {issues.slice(0, 80).map((it, i) => (
                        <tr key={i}>
                          <td className="mono" style={{ fontSize: 'var(--fs-xs)' }}>{it.lessonId}</td>
                          <td style={{ fontSize: 'var(--fs-xs)' }}>
                            <Icon name={it.severity === 'error' ? 'alert-octagon' : 'alert-triangle'} size={12} /> {it.message}
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
