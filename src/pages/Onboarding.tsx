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

const GOALS = [
  { m: 10, label: '10 phút', desc: 'Vừa đủ giữ đà. Ổn với người rất bận.' },
  { m: 20, label: '20 phút', desc: 'Điểm cân bằng tốt nhất cho hầu hết mọi người.' },
  { m: 35, label: '35 phút', desc: 'Tiến nhanh, cần lịch khá đều đặn.' },
  { m: 60, label: '60 phút', desc: 'Chuyển nghề nghiêm túc, có quỹ thời gian rõ ràng.' },
];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(20);
  const [name, setName] = useState('');

  const finish = () => setSettings({ onboarded: true, dailyGoalMinutes: goal, name: name.trim() });

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 'var(--s-5)' }}>
      <div className="card card-pad-lg anim-in" style={{ maxWidth: 620, width: '100%' }}>
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
            <div style={{ fontSize: '2.6rem', lineHeight: 1 }} aria-hidden>🛡️</div>
            <h1 style={{ fontSize: 'var(--fs-2xl)' }}>Học máy cho An ninh mạng</h1>
            <p className="muted" style={{ fontSize: 'var(--fs-md)' }}>
              Từ chỗ chưa biết gì tới chỗ tự xây và đánh giá được một hệ thống phát hiện. Không yêu cầu kiến
              thức toán hay lập trình trước.
            </p>

            <div className="panel">
              <div className="stat-k" style={{ marginBottom: 'var(--s-3)' }}>Sau khoá này bạn sẽ</div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', fontSize: 'var(--fs-sm)' }}>
                <li>Giải thích được vì sao "độ chính xác 99,9%" thường là con số vô nghĩa trong bảo mật</li>
                <li>Tự chọn được thuật toán, đặc trưng và ngưỡng cho một bài toán phát hiện cụ thể</li>
                <li>Nhận ra và phòng được các đòn tấn công nhắm thẳng vào mô hình của bạn</li>
                <li>Biết cách bảo vệ ứng dụng LLM khỏi prompt injection và các rủi ro tác tử</li>
              </ul>
            </div>

            <div className="grid grid-4">
              {[
                { k: 'Chặng học', v: COURSE_STATS.tracks },
                { k: 'Bài học', v: COURSE_STATS.lessons },
                { k: 'Phòng lab', v: 24 },
                { k: 'Thời lượng', v: fmtDuration(COURSE_STATS.minutes) },
              ].map((s) => (
                <div className="stat" key={s.k}>
                  <div className="stat-k">{s.k}</div>
                  <div className="stat-v" style={{ fontSize: 'var(--fs-lg)' }}>{s.v}</div>
                </div>
              ))}
            </div>

            <button className="btn btn-primary btn-lg btn-block" onClick={() => setStep(1)}>
              Bắt đầu →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="stack">
            <h2 style={{ fontSize: 'var(--fs-xl)' }}>Mỗi ngày bạn có bao nhiêu thời gian?</h2>
            <p className="muted">
              Hãy chọn con số bạn <b>chắc chắn giữ được</b>, không phải con số bạn mong muốn. App sẽ dựng kế
              hoạch vừa khít quỹ đó. Học đều 20 phút thắng tuyệt đối 3 giờ dồn vào chủ nhật — và đây là kết
              luận có bằng chứng, không phải lời khuyên suông.
            </p>
            <div className="stack" style={{ '--gap': 'var(--s-2)' } as React.CSSProperties}>
              {GOALS.map((g) => (
                <button
                  key={g.m}
                  className="opt"
                  data-state={goal === g.m ? 'picked' : 'idle'}
                  onClick={() => setGoal(g.m)}
                >
                  <span className="opt-key">{goal === g.m ? '✓' : ''}</span>
                  <span>
                    <b>{g.label}</b>
                    <span className="faint" style={{ display: 'block' }}>{g.desc}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="row">
              <button className="btn" onClick={() => setStep(0)}>← Quay lại</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(2)}>Tiếp tục →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="stack">
            <h2 style={{ fontSize: 'var(--fs-xl)' }}>Vài điều bạn nên biết trước</h2>

            <div className="callout co-insight">
              <span className="callout-icon" aria-hidden>🧠</span>
              <div>
                <div className="callout-title">App này sẽ ép bạn nhớ, không chỉ đọc</div>
                <div className="callout-body">
                  Bạn sẽ gặp câu hỏi <b>trước</b> khi được giảng, và thẻ ôn quay lại đúng lúc bạn sắp quên.
                  Cảm giác khó hơn đọc lướt — đó là chủ đích, và đó là lý do sáu tháng sau bạn vẫn còn nhớ.
                </div>
              </div>
            </div>

            <div className="callout co-pro">
              <span className="callout-icon" aria-hidden>🔒</span>
              <div>
                <div className="callout-title">Dữ liệu của bạn ở lại máy bạn</div>
                <div className="callout-body">
                  Không tài khoản, không máy chủ, không theo dõi. Mọi tiến độ nằm trong trình duyệt này. Nhớ
                  vào phần Cài đặt để <b>xuất tệp sao lưu</b> nếu bạn định đổi máy hoặc xoá dữ liệu duyệt web.
                </div>
              </div>
            </div>

            <div className="field">
              <label htmlFor="ob-name"><span>Tên gọi (tuỳ chọn, chỉ lưu trên máy bạn)</span></label>
              <input id="ob-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Bạn muốn được gọi là gì?" />
            </div>

            <div className="row">
              <button className="btn" onClick={() => setStep(1)}>← Quay lại</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={finish}>
                Vào bài đầu tiên →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
