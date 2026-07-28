/**
 * Màn hình khởi động.
 *
 * Ba nguyên tắc:
 *  1. NGẮN. Mỗi màn hình thêm vào là một cơ hội để người học bỏ đi. Ba bước, hết.
 *  2. HỎI ĐÚNG THỨ CẦN DÙNG NGAY. Chỉ hỏi quỹ thời gian — nó quyết định kế
 *     hoạch hằng ngày. Không hỏi "trình độ" vì người mới không tự đánh giá được,
 *     và app tự suy ra từ kết quả làm bài chính xác hơn nhiều.
 *  3. HỨA MỘT ĐIỀU CỤ THỂ. "Bạn sẽ hiểu vì sao 99% độ chính xác là vô nghĩa"
 *     mạnh hơn "học AI bảo mật toàn diện".
 */

import { useState } from 'react';
import { setSettings } from '../lib/storage';
import { COURSE_STATS } from '../content';
import { fmtDuration } from '../lib/utils';
import { Icon } from '../components/Icon';
import { useT, useLang, setLang, LANGS } from '../i18n';

const GOALS = [10, 20, 35, 60];

export function Onboarding() {
  const t = useT();
  const lang = useLang();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(20);
  const [name, setName] = useState('');

  const finish = () => setSettings({ onboarded: true, dailyGoalMinutes: goal, name: name.trim() });

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 'var(--s-5)' }}>
      <div className="card card-pad-lg anim-in" style={{ maxWidth: 620, width: '100%' }}>
        {/* Chọn ngôn ngữ ngay từ màn hình đầu: bắt người ta đi hết ba bước bằng
            một thứ tiếng họ không đọc được rồi mới tìm thấy nút đổi là vô lý. */}
        <div className="row" style={{ justifyContent: 'flex-end', marginBottom: 'var(--s-4)' }}>
          <div className="lang-switch" role="group" aria-label={t('nav.language')}>
            {LANGS.map((l) => (
              <button
                key={l.code}
                className="lang-opt"
                onClick={() => setLang(l.code)}
                aria-pressed={lang === l.code}
                title={l.label}
              >
                {l.short}
              </button>
            ))}
          </div>
        </div>

        {/* Chỉ báo bước — người học luôn biết còn bao xa */}
        <div className="row" style={{ gap: 6, marginBottom: 'var(--s-6)' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: 3,
                flex: 1,
                borderRadius: 2,
                background: i <= step ? 'var(--brand)' : 'var(--bg-sunken)',
                transition: 'background var(--t-base) var(--ease)',
              }}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="stack">
            <Icon name="shield" size={42} stroke={1.5} style={{ color: 'var(--brand)' }} />
            <h1 style={{ fontSize: 'var(--fs-2xl)' }}>{t('onboarding.title')}</h1>
            <p className="muted" style={{ fontSize: 'var(--fs-md)' }}>{t('onboarding.intro')}</p>
            {lang === 'en' && <p className="faint">{t('content.noticeLong')}</p>}

            <div className="panel">
              <div className="stat-k" style={{ marginBottom: 'var(--s-3)' }}>{t('onboarding.outcomesHead')}</div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', fontSize: 'var(--fs-sm)' }}>
                {[1, 2, 3, 4].map((i) => (
                  <li key={i}>{t(`onboarding.o${i}`)}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-4">
              {[
                { k: t('onboarding.statTracks'), v: COURSE_STATS.tracks },
                { k: t('onboarding.statLessons'), v: COURSE_STATS.lessons },
                { k: t('onboarding.statLabs'), v: COURSE_STATS.labs },
                {
                  k: t('onboarding.statDuration'),
                  v: fmtDuration(COURSE_STATS.minutes),
                  // Con số tổng một mình dễ bị đọc thành "thời gian đọc", rồi
                  // người học vỡ kế hoạch khi gặp phòng lab. Tách ra ngay tại
                  // chỗ họ nhìn thấy nó lần đầu.
                  sub: t('onboarding.statDurationSub', {
                    read: fmtDuration(COURSE_STATS.readingMinutes),
                    practice: fmtDuration(COURSE_STATS.practiceMinutes),
                  }),
                },
              ].map((s) => (
                <div className="stat" key={s.k}>
                  <div className="stat-k">{s.k}</div>
                  <div className="stat-v" style={{ fontSize: 'var(--fs-lg)' }}>{s.v}</div>
                  {s.sub && <div className="faint">{s.sub}</div>}
                </div>
              ))}
            </div>

            <button className="btn btn-primary btn-lg btn-block" onClick={() => setStep(1)}>
              {t('onboarding.start')} <Icon name="arrow-right" size={16} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="stack">
            <h2 style={{ fontSize: 'var(--fs-xl)' }}>{t('onboarding.goalHead')}</h2>
            <p className="muted">{t('onboarding.goalSub')}</p>
            <div className="stack" style={{ '--gap': 'var(--s-2)' } as React.CSSProperties}>
              {GOALS.map((m) => (
                <button
                  key={m}
                  className="opt"
                  data-state={goal === m ? 'picked' : 'idle'}
                  onClick={() => setGoal(m)}
                >
                  <span className="opt-key">{goal === m && <Icon name="check" size={13} stroke={3} />}</span>
                  <span>
                    <b>{t(`onboarding.goal${m}`)}</b>
                    <span className="faint" style={{ display: 'block' }}>{t(`onboarding.goal${m}d`)}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="row">
              <button className="btn" onClick={() => setStep(0)}>
                <Icon name="arrow-left" size={14} /> {t('common.back')}
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(2)}>
                {t('onboarding.next')} <Icon name="arrow-right" size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="stack">
            <h2 style={{ fontSize: 'var(--fs-xl)' }}>{t('onboarding.knowHead')}</h2>

            <div className="callout co-insight">
              <Icon className="callout-icon" name="brain" size={18} />
              <div>
                <div className="callout-title">{t('onboarding.recallTitle')}</div>
                <div className="callout-body">{t('onboarding.recallBody')}</div>
              </div>
            </div>

            <div className="callout co-pro">
              <Icon className="callout-icon" name="lock" size={18} />
              <div>
                <div className="callout-title">{t('onboarding.privacyTitle')}</div>
                <div className="callout-body">{t('onboarding.privacyBody')}</div>
              </div>
            </div>

            <div className="field">
              <label htmlFor="ob-name"><span>{t('onboarding.nameLabel')}</span></label>
              <input
                id="ob-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('onboarding.namePlaceholder')}
              />
            </div>

            <div className="row">
              <button className="btn" onClick={() => setStep(1)}>
                <Icon name="arrow-left" size={14} /> {t('common.back')}
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={finish}>
                {t('onboarding.finish')} <Icon name="arrow-right" size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
