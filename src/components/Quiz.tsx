/**
 * ============================================================================
 *  Thành phần câu hỏi — nơi việc học thực sự xảy ra
 * ============================================================================
 *
 *  Bốn quyết định thiết kế, mỗi cái dựa trên một phát hiện về học tập:
 *
 *  1. HỎI ĐỘ TỰ TIN TRƯỚC KHI CHẤM.
 *     Buộc người học cam kết mức tự tin làm hai việc: tăng độ sâu xử lý, và
 *     tạo dữ liệu để họ thấy mình tự tin thái quá hay rụt rè (siêu nhận thức).
 *
 *  2. KHÔNG CHO SỬA SAU KHI ĐÃ CHẤM.
 *     Nếu người học sửa được đáp án, họ sẽ đoán mò rồi thử lại — và mất toàn
 *     bộ lợi ích của việc truy hồi. Sai một lần rồi được giải thích kỹ có giá
 *     trị hơn đúng sau ba lần thử.
 *
 *  3. GIẢI THÍCH LUÔN HIỆN, KỂ CẢ KHI ĐÚNG.
 *     Trả lời đúng vì lý do sai là chuyện rất phổ biến. Phản hồi giải thích
 *     hiệu quả hơn nhiều so với phản hồi đúng/sai.
 *
 *  4. SAI KHÔNG BỊ TRỪNG PHẠT VỀ MẶT THỊ GIÁC.
 *     Không màu đỏ chói, không rung lắc, không âm thanh thất bại. Phản ứng
 *     đe doạ làm thu hẹp chú ý đúng lúc người học cần mở rộng nó để tiếp thu
 *     lời giải thích.
 * ============================================================================
 */

import { useMemo, useState } from 'react';
import type { Quiz } from '../content/types';
import { Markdown } from './Markdown';
import { acceptsAnswer, shuffle, hashCode, mulberry32, cx } from '../lib/utils';
import { logQuiz } from '../lib/storage';

const KEYS = 'ABCDEFGH';

const CONFIDENCE = [
  { v: 0.25, label: 'Đoán mò' },
  { v: 0.5, label: 'Không chắc' },
  { v: 0.75, label: 'Khá chắc' },
  { v: 0.95, label: 'Chắc chắn' },
];

interface Props {
  quiz: Quiz;
  onAnswered?: (correct: boolean) => void;
  askConfidence?: boolean;
  /** Ẩn phần giải thích cho tới khi người học tự bấm — dùng ở chế độ luyện nhanh. */
  compact?: boolean;
}

export function QuizItem({ quiz, onAnswered, askConfidence = true, compact }: Props) {
  const [conf, setConf] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [picked, setPicked] = useState<number[]>([]);
  const [text, setText] = useState('');
  const [orderList, setOrderList] = useState<string[]>([]);
  const [matched, setMatched] = useState<Record<string, string>>({});

  // Xáo trộn ổn định theo id → cùng một người học luôn thấy cùng thứ tự,
  // tránh cảm giác câu hỏi "nhảy lung tung" khi render lại.
  const rng = useMemo(() => mulberry32(hashCode(quiz.id)), [quiz.id]);

  const shuffledOrder = useMemo(
    () => (quiz.kind === 'order' ? shuffle(quiz.items, mulberry32(hashCode(quiz.id))) : []),
    [quiz],
  );
  const rightOptions = useMemo(
    () => (quiz.kind === 'match' ? shuffle(quiz.pairs.map((p) => p[1]), rng) : []),
    [quiz, rng],
  );

  const needConfidence = askConfidence && conf === null;

  const submit = (isCorrect: boolean) => {
    setCorrect(isCorrect);
    setSubmitted(true);
    logQuiz(quiz.tags ?? [], isCorrect, conf ?? undefined);
    onAnswered?.(isCorrect);
  };

  /* ---- Chấm điểm theo từng loại ------------------------------------------ */
  const grade = () => {
    switch (quiz.kind) {
      case 'mcq':
        return picked[0] === quiz.answer;
      case 'multi':
        return picked.length === quiz.answers.length && quiz.answers.every((a) => picked.includes(a));
      case 'truefalse':
        return (picked[0] === 1) === quiz.answer;
      case 'input':
        return acceptsAnswer(text, quiz.accept);
      case 'order':
        return orderList.length === quiz.items.length && orderList.every((v, i) => v === quiz.items[i]);
      case 'match':
        return quiz.pairs.every(([l, r]) => matched[l] === r);
    }
  };

  const canSubmit = (() => {
    if (needConfidence) return false;
    switch (quiz.kind) {
      case 'mcq':
      case 'truefalse':
        return picked.length === 1;
      case 'multi':
        return picked.length > 0;
      case 'input':
        return text.trim().length > 0;
      case 'order':
        return orderList.length === quiz.items.length;
      case 'match':
        return Object.keys(matched).length === quiz.pairs.length;
    }
  })();

  const optState = (i: number, isRight: boolean) => {
    if (!submitted) return picked.includes(i) ? 'picked' : 'idle';
    if (picked.includes(i)) return isRight ? 'correct' : 'wrong';
    return isRight ? 'missed' : 'idle';
  };

  const toggle = (i: number, single: boolean) => {
    if (submitted) return;
    setPicked((p) => (single ? [i] : p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  };

  /* ------------------------------------------------------------------------ */
  return (
    <div className="quiz">
      <div className="quiz-q">
        <Markdown>{quiz.q}</Markdown>
      </div>

      {/* Thang tự tin — trước khi trả lời, không phải sau */}
      {askConfidence && !submitted && (
        <div style={{ marginBottom: 'var(--s-4)' }}>
          <div className="faint" style={{ marginBottom: 6 }}>
            Trước khi trả lời: bạn chắc đến mức nào?
          </div>
          <div className="confidence">
            {CONFIDENCE.map((c) => (
              <button key={c.v} aria-pressed={conf === c.v} onClick={() => setConf(c.v)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- Trắc nghiệm một lựa chọn ---- */}
      {quiz.kind === 'mcq' && (
        <div className="quiz-opts">
          {quiz.options.map((o, i) => (
            <button
              key={i}
              className="opt"
              data-state={optState(i, i === quiz.answer)}
              disabled={submitted || needConfidence}
              onClick={() => toggle(i, true)}
            >
              <span className="opt-key">{KEYS[i]}</span>
              <span>
                <Markdown>{o}</Markdown>
                {submitted && quiz.distractorWhy?.[i] && i !== quiz.answer && picked.includes(i) && (
                  <span className="faint" style={{ display: 'block', marginTop: 4 }}>
                    {quiz.distractorWhy[i]}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ---- Nhiều lựa chọn ---- */}
      {quiz.kind === 'multi' && (
        <>
          <div className="faint" style={{ marginBottom: 8 }}>Có thể có nhiều đáp án đúng.</div>
          <div className="quiz-opts">
            {quiz.options.map((o, i) => (
              <button
                key={i}
                className="opt"
                data-state={optState(i, quiz.answers.includes(i))}
                disabled={submitted || needConfidence}
                onClick={() => toggle(i, false)}
              >
                <span className="opt-key" style={{ borderRadius: 4 }}>{picked.includes(i) ? '✓' : ''}</span>
                <span><Markdown>{o}</Markdown></span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ---- Đúng / Sai ---- */}
      {quiz.kind === 'truefalse' && (
        <div className="quiz-opts">
          {['Sai', 'Đúng'].map((o, i) => (
            <button
              key={i}
              className="opt"
              data-state={optState(i, (i === 1) === quiz.answer)}
              disabled={submitted || needConfidence}
              onClick={() => toggle(i, true)}
            >
              <span className="opt-key">{i === 1 ? '✓' : '✕'}</span>
              <span>{o}</span>
            </button>
          ))}
        </div>
      )}

      {/* ---- Tự luận ngắn ---- */}
      {quiz.kind === 'input' && (
        <input
          type="text"
          value={text}
          placeholder={quiz.placeholder ?? 'Nhập câu trả lời của bạn…'}
          disabled={submitted || needConfidence}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canSubmit) submit(grade());
          }}
          style={{
            borderColor: submitted ? (correct ? 'var(--ok)' : 'var(--bad)') : undefined,
            borderWidth: submitted ? 2 : undefined,
          }}
        />
      )}

      {/* ---- Sắp thứ tự ---- */}
      {quiz.kind === 'order' && (
        <div className="grid grid-2">
          <div>
            <div className="faint" style={{ marginBottom: 6 }}>Bấm theo đúng thứ tự</div>
            <div className="quiz-opts">
              {shuffledOrder.map((it) => (
                <button
                  key={it}
                  className="opt"
                  disabled={submitted || needConfidence || orderList.includes(it)}
                  style={orderList.includes(it) ? { opacity: 0.35 } : undefined}
                  onClick={() => setOrderList((l) => [...l, it])}
                >
                  <span>{it}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="faint" style={{ marginBottom: 6 }}>
              Thứ tự bạn chọn {!submitted && orderList.length > 0 && (
                <button className="btn btn-sm btn-ghost" onClick={() => setOrderList([])}>xoá</button>
              )}
            </div>
            <div className="quiz-opts">
              {orderList.map((it, i) => (
                <div
                  key={it}
                  className="opt"
                  data-state={submitted ? (quiz.items[i] === it ? 'correct' : 'wrong') : 'picked'}
                >
                  <span className="opt-key">{i + 1}</span>
                  <span>{it}</span>
                </div>
              ))}
              {orderList.length === 0 && <div className="faint">Chưa chọn gì</div>}
            </div>
          </div>
        </div>
      )}

      {/* ---- Nối cặp ---- */}
      {quiz.kind === 'match' && (
        <div className="stack" style={{ '--gap': 'var(--s-2)' } as React.CSSProperties}>
          {quiz.pairs.map(([l, r]) => (
            <div key={l} className="row" style={{ gap: 'var(--s-3)', alignItems: 'center' }}>
              <div style={{ flex: 1, fontSize: 'var(--fs-sm)', fontWeight: 550 }}>{l}</div>
              <span aria-hidden style={{ color: 'var(--text-faint)' }}>→</span>
              <select
                style={{
                  flex: 1.4,
                  borderColor: submitted ? (matched[l] === r ? 'var(--ok)' : 'var(--bad)') : undefined,
                  borderWidth: submitted ? 2 : undefined,
                }}
                value={matched[l] ?? ''}
                disabled={submitted || needConfidence}
                onChange={(e) => setMatched((m) => ({ ...m, [l]: e.target.value }))}
              >
                <option value="">— chọn —</option>
                {rightOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          ))}
          {submitted && (
            <div className="faint">
              Đáp án đúng: {quiz.pairs.map(([l, r]) => `${l} → ${r}`).join(' · ')}
            </div>
          )}
        </div>
      )}

      {/* ---- Gợi ý & nút gửi ---- */}
      {!submitted && (
        <div className="row-wrap" style={{ marginTop: 'var(--s-4)' }}>
          <button className="btn btn-primary" disabled={!canSubmit} onClick={() => submit(grade())}>
            Kiểm tra
          </button>
          {quiz.hint && !showHint && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowHint(true)}>
              💡 Gợi ý
            </button>
          )}
          {needConfidence && <span className="faint">Chọn mức tự tin trước đã</span>}
        </div>
      )}
      {showHint && !submitted && (
        <div className="callout co-insight" style={{ marginTop: 'var(--s-3)' }}>
          <span className="callout-icon" aria-hidden>💡</span>
          <div className="callout-body">{quiz.hint}</div>
        </div>
      )}

      {/* ---- Phản hồi ---- */}
      {submitted && (
        <div className={cx('feedback', correct ? 'feedback-ok' : 'feedback-bad')}>
          <div className="feedback-head">
            <span aria-hidden>{correct ? '✓' : '✕'}</span>
            <span>{correct ? 'Chính xác' : 'Chưa đúng'}</span>
            {conf !== null && (
              <span className="chip" style={{ marginLeft: 'auto' }}>
                bạn chọn: {CONFIDENCE.find((c) => c.v === conf)?.label}
              </span>
            )}
          </div>
          {conf !== null && conf >= 0.75 && !correct && (
            <div className="callout co-pitfall" style={{ marginBottom: 'var(--s-3)' }}>
              <span className="callout-icon" aria-hidden>🎯</span>
              <div className="callout-body">
                Bạn <b>chắc chắn</b> nhưng lại sai — đây là loại lỗ hổng nguy hiểm nhất, vì bạn sẽ không bao
                giờ chủ động ôn lại nó. Hãy đọc kỹ phần giải thích dưới đây.
              </div>
            </div>
          )}
          {conf !== null && conf <= 0.5 && correct && !compact && (
            <div className="faint" style={{ marginBottom: 'var(--s-2)' }}>
              Bạn biết nhiều hơn bạn tưởng — lần sau hãy tin vào suy luận của mình hơn một chút.
            </div>
          )}
          <div style={{ fontSize: 'var(--fs-base)' }}>
            <Markdown>{quiz.why}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bộ câu hỏi (dùng cho phần kiểm tra cuối bài và luyện tập)                  */
/* -------------------------------------------------------------------------- */

export function QuizSet({
  items,
  onDone,
  askConfidence = true,
  title,
}: {
  items: Quiz[];
  onDone?: (score: number) => void;
  askConfidence?: boolean;
  title?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const done = idx >= items.length;
  const score = results.length ? results.filter(Boolean).length / results.length : 0;

  if (!items.length) return null;

  if (done) {
    const n = results.filter(Boolean).length;
    const good = score >= 0.8;
    return (
      <div className="card card-pad-lg center anim-in">
        <div style={{ fontSize: '2.4rem', marginBottom: 'var(--s-2)' }} aria-hidden>
          {good ? '🎉' : score >= 0.5 ? '💪' : '📖'}
        </div>
        <h3 style={{ marginBottom: 'var(--s-2)' }}>
          {n}/{items.length} câu đúng
        </h3>
        <p className="muted" style={{ maxWidth: '48ch', margin: '0 auto var(--s-5)' }}>
          {good
            ? 'Bạn nắm chắc bài này. Các thẻ ghi nhớ sẽ đưa nó vào trí nhớ dài hạn trong vài tuần tới.'
            : score >= 0.5
              ? 'Nền tảng đã có nhưng còn lỗ hổng. Đừng học lại cả bài — hãy để hệ thống ôn tập đưa đúng phần bạn sai quay lại.'
              : 'Phần này cần đọc lại. Không sao cả: nhận ra sớm rẻ hơn nhiều so với phát hiện lúc phỏng vấn hay lúc có sự cố thật.'}
        </p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button
            className="btn"
            onClick={() => {
              setIdx(0);
              setResults([]);
            }}
          >
            ↻ Làm lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <b style={{ fontSize: 'var(--fs-sm)' }}>{title ?? 'Kiểm tra'}</b>
        <span className="faint">
          Câu {idx + 1}/{items.length}
        </span>
      </div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${(idx / items.length) * 100}%` }} />
      </div>
      <QuizItem
        key={items[idx].id}
        quiz={items[idx]}
        askConfidence={askConfidence}
        onAnswered={(c) => {
          const next = [...results, c];
          setResults(next);
          setTimeout(() => {
            /* để người học kịp đọc phần giải thích trước khi nút hiện */
          }, 0);
          if (idx + 1 >= items.length) onDone?.(next.filter(Boolean).length / next.length);
        }}
      />
      {results.length > idx && (
        <button className="btn btn-primary btn-block" onClick={() => setIdx((i) => i + 1)}>
          {idx + 1 >= items.length ? 'Xem kết quả →' : 'Câu tiếp theo →'}
        </button>
      )}
    </div>
  );
}
