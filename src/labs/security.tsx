/**
 * Phòng lab về DỮ LIỆU BẢO MẬT.
 * Ở đây bạn thao tác trực tiếp trên thứ mà một kỹ sư phát hiện làm hằng ngày:
 * biến một chuỗi, một tệp, một dòng log thành các con số có ý nghĩa.
 */

import { useMemo, useState } from 'react';
import { LabShell, Slider, Readout, Chart, Axes, Line, mkPlot, px, py, COLORS, Bars, Toggle, Reseed, useSeed } from './kit';
import { shannonEntropy, mulberry32, gaussian, clamp } from '../lib/utils';
import { Icon } from '../components/Icon';

/* ========================================================================== */
/*  lab-entropy — Entropy và phát hiện DGA                                     */
/* ========================================================================== */

/**
 * Hai tên miền cuối là mẫu GIẢ MẠO THƯƠNG HIỆU, cố ý chọn để chúng LỌT QUA bộ
 * dò — đó là bài học của lab, không phải lỗi.
 *
 * Bản trước dùng `micros0ft-secure-login.com` và `paypa1-verify.net` rồi khẳng
 * định chúng "qua mặt cả ba đặc trưng". Chạy thật thì cả hai đều bị cảnh báo
 * (0,584 và 0,529): dấu gạch ngang cùng chuỗi dài làm entropy ký tự TĂNG chứ
 * không giảm, nên chính bộ dò lại bắt được chúng vì lý do sai. Hai tên dưới đây
 * đọc trôi như tiếng Anh nên entropy thấp và bigram đẹp, và chúng lọt thật.
 */
const SAMPLE_DOMAINS = [
  'google.com', 'facebook.com', 'vietcombank.com.vn', 'shopee.vn',
  'kq3v9zx7wp1m.com', 'xkjfhwqoiuery.net', 'aaaaaaaa.com', 'zzzz1234.info',
  'paypal-login.com', 'vietcombank-online.com',
];

const ENGLISH_BIGRAMS = new Set([
  'th', 'he', 'in', 'er', 'an', 're', 'on', 'at', 'en', 'nd', 'ti', 'es', 'or',
  'te', 'of', 'ed', 'is', 'it', 'al', 'ar', 'st', 'to', 'nt', 'ng', 'se', 'ha',
  'as', 'ou', 'io', 'le', 've', 'co', 'me', 'de', 'hi', 'ri', 'ro', 'ic', 'ne',
  'ea', 'ra', 'ce', 'li', 'ch', 'll', 'be', 'ma', 'si', 'om', 'ur', 'ca', 'el',
  'ta', 'la', 'ns', 'di', 'fo', 'ho', 'pe', 'ec', 'pr', 'no', 'ct', 'us', 'ac',
  'ot', 'il', 'tr', 'ly', 'nc', 'et', 'ut', 'ss', 'so', 'rs', 'un', 'lo', 'wa',
  'ge', 'ie', 'wh', 'ee', 'wi', 'em', 'ad', 'ol', 'rd', 'am', 'gr', 'sh', 'ba',
]);

function bigramScore(s: string): number {
  const t = s.toLowerCase().replace(/[^a-z]/g, '');
  if (t.length < 2) return 0;
  let hit = 0;
  for (let i = 0; i < t.length - 1; i++) if (ENGLISH_BIGRAMS.has(t.slice(i, i + 2))) hit++;
  return hit / (t.length - 1);
}

const vowelRatio = (s: string) => {
  const t = s.toLowerCase().replace(/[^a-z]/g, '');
  if (!t.length) return 0;
  return (t.match(/[aeiou]/g) ?? []).length / t.length;
};

export function LabEntropy() {
  const [input, setInput] = useState('kq3v9zx7wp1m.com');
  const [wEnt, setWEnt] = useState(1);
  const [wBi, setWBi] = useState(1);
  const [thr, setThr] = useState(0.5);

  const analyse = (d: string) => {
    const label = d.split('.')[0];
    const ent = shannonEntropy(label);
    const bi = bigramScore(label);
    const vw = vowelRatio(label);
    // Điểm nghi ngờ: entropy cao + bigram lạ + ít nguyên âm
    const score = clamp(
      (wEnt * clamp((ent - 2.2) / 1.6, 0, 1) + wBi * (1 - bi) + 0.6 * clamp((0.38 - vw) / 0.38, 0, 1)) /
        (wEnt + wBi + 0.6),
      0,
      1,
    );
    return { d, label, ent, bi, vw, score };
  };

  const cur = analyse(input);
  const all = SAMPLE_DOMAINS.map(analyse);

  return (
    <LabShell
      id="lab-entropy"
      title="Entropy và phát hiện tên miền DGA"
      takeaway={
        <>
          Entropy một mình <b>không đủ</b>: <code>aaaaaaaa.com</code> có entropy rất thấp nhưng vẫn là tên miền
          rác, còn <code>vietcombank</code> lại có entropy khá cao. Kết hợp với <b>xác suất bigram</b> (chuỗi
          ký tự có giống ngôn ngữ người không) và <b>tỉ lệ nguyên âm</b> thì mới ra một bộ dò dùng được. Đây
          là bài học tổng quát của cả kỹ thuật đặc trưng: nhiều tín hiệu yếu ghép lại mạnh hơn một tín hiệu
          mạnh. Và chú ý hai dòng cuối bảng: <code>paypal-login.com</code> và{' '}
          <code>vietcombank-online.com</code> đều <b>lọt qua</b> với điểm 0,45–0,47. Chúng không phải DGA mà
          là <b>giả mạo thương hiệu</b> — đọc trôi như tiếng Anh nên entropy thấp, bigram đẹp, nguyên âm đủ.
          Cả ba đặc trưng ở đây đều mù trước loại tấn công đó, và không thanh trượt nào cứu được: cần một bộ
          đặc trưng hoàn toàn khác (khoảng cách chỉnh sửa tới tên miền thương hiệu, tuổi tên miền, chứng chỉ,
          nội dung trang). <b>Biết bộ dò của mình mù ở đâu quan trọng hơn biết nó bắt được gì.</b>
        </>
      }
    >
      <div className="field">
        <label htmlFor="ent-in">
          <span>Nhập một tên miền hoặc chuỗi bất kỳ</span>
          <var>{cur.ent.toFixed(2)} bit/ký tự</var>
        </label>
        <input id="ent-in" type="text" value={input} onChange={(e) => setInput(e.target.value)} className="mono" />
      </div>

      <Readout
        items={[
          { k: 'Entropy', v: cur.ent.toFixed(2), tone: cur.ent > 3.4 ? 'warn' : 'neutral' },
          { k: 'Điểm bigram', v: cur.bi.toFixed(2), tone: cur.bi < 0.3 ? 'warn' : 'ok', sub: 'giống ngôn ngữ người?' },
          { k: 'Tỉ lệ nguyên âm', v: cur.vw.toFixed(2), tone: cur.vw < 0.25 ? 'warn' : 'ok' },
          { k: 'Điểm nghi ngờ', v: cur.score.toFixed(2), tone: cur.score >= thr ? 'bad' : 'ok', sub: cur.score >= thr ? 'CẢNH BÁO' : 'bỏ qua' },
        ]}
      />

      <div className="grid grid-3">
        <Slider label="Trọng số entropy" value={wEnt} min={0} max={3} step={0.1} onChange={setWEnt} format={(v) => v.toFixed(1)} />
        <Slider label="Trọng số bigram" value={wBi} min={0} max={3} step={0.1} onChange={setWBi} format={(v) => v.toFixed(1)} />
        <Slider label="Ngưỡng cảnh báo" value={thr} min={0.1} max={0.9} step={0.01} onChange={setThr} format={(v) => v.toFixed(2)} />
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr><th>Tên miền</th><th>Entropy</th><th>Bigram</th><th>Nguyên âm</th><th>Điểm</th><th>Quyết định</th></tr>
          </thead>
          <tbody>
            {all.map((a) => (
              <tr key={a.d}>
                <td className="mono">{a.d}</td>
                <td className="mono">{a.ent.toFixed(2)}</td>
                <td className="mono">{a.bi.toFixed(2)}</td>
                <td className="mono">{a.vw.toFixed(2)}</td>
                <td className="mono">{a.score.toFixed(2)}</td>
                <td>
                  <span className={`chip ${a.score >= thr ? 'chip-bad' : 'chip-ok'}`}>
                    <Icon name={a.score >= thr ? 'alert-triangle' : 'check'} size={11} />
                    {a.score >= thr ? 'cảnh báo' : 'bỏ qua'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-url-features — Trích xuất đặc trưng URL                                */
/* ========================================================================== */

export function LabUrlFeatures() {
  const [url, setUrl] = useState('http://secure-vietcombank.verify-account.xyz/login?id=8821');

  const f = useMemo(() => {
    const u = url.trim();
    let host = u;
    try {
      host = new URL(u.includes('://') ? u : `http://${u}`).hostname;
    } catch {
      host = u.split('/')[0];
    }
    const path = u.split(host)[1] ?? '';
    const parts = host.split('.');
    const tld = parts[parts.length - 1] ?? '';
    const suspiciousTld = ['xyz', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'buzz', 'click', 'zip', 'mov'].includes(tld);
    const brandWords = ['vietcombank', 'paypal', 'microsoft', 'apple', 'google', 'facebook', 'techcombank', 'momo'];
    const brandInSub = brandWords.find((b) => host.toLowerCase().includes(b) && !host.toLowerCase().endsWith(`${b}.com`) && !host.toLowerCase().endsWith(`${b}.vn`));
    const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
    const hasPunycode = host.includes('xn--');

    return [
      { k: 'Độ dài URL', v: String(u.length), risk: u.length > 75, why: 'URL dài che giấu tên miền thật trên di động' },
      { k: 'Số tên miền con', v: String(Math.max(0, parts.length - 2)), risk: parts.length - 2 >= 2, why: 'Nhiều cấp con là mẹo tạo cảm giác chính thống' },
      { k: 'Entropy tên miền', v: shannonEntropy(parts[0] ?? '').toFixed(2), risk: shannonEntropy(parts[0] ?? '') > 3.6, why: 'Entropy cao gợi ý sinh tự động' },
      { k: 'TLD', v: tld || '—', risk: suspiciousTld, why: 'Một số TLD giá rẻ bị lạm dụng nhiều' },
      { k: 'Dùng IP thay tên miền', v: isIp ? 'CÓ' : 'không', risk: isIp, why: 'Trang hợp pháp gần như không bao giờ dùng IP trần' },
      { k: 'Có dấu gạch ngang', v: String((host.match(/-/g) ?? []).length), risk: (host.match(/-/g) ?? []).length >= 2, why: 'Kỹ thuật ghép từ khoá thương hiệu' },
      { k: 'Thương hiệu ở sai vị trí', v: brandInSub ?? 'không', risk: !!brandInSub, why: 'Tên thương hiệu nằm ngoài tên miền gốc = giả mạo' },
      { k: 'Punycode', v: hasPunycode ? 'CÓ' : 'không', risk: hasPunycode, why: 'Chữ cái nhìn giống nhau từ bảng mã khác' },
      { k: 'Từ khoá nhạy cảm', v: /login|verify|secure|account|update|confirm|signin/i.test(u) ? 'CÓ' : 'không', risk: /login|verify|secure|account|update|confirm|signin/i.test(u), why: 'Từ khoá tạo cảm giác cấp bách' },
      { k: 'HTTPS', v: u.startsWith('https') ? 'có' : 'KHÔNG', risk: !u.startsWith('https'), why: 'Ngày nay HTTPS gần như miễn phí — thiếu nó là bất thường' },
      { k: 'Độ dài đường dẫn', v: String(path.length), risk: path.length > 40, why: 'Đường dẫn dài chứa tham số theo dõi nạn nhân' },
    ];
  }, [url]);

  const risky = f.filter((x) => x.risk).length;
  const score = risky / f.length;

  return (
    <LabShell
      id="lab-url-features"
      title="Bóc tách một URL thành đặc trưng"
      takeaway={
        <>
          Không một đặc trưng nào ở đây tự nó chứng minh được điều gì — trang thật cũng có gạch ngang, cũng có
          chữ "login". Sức mạnh nằm ở <b>tổ hợp</b>. Đó chính là công việc của mô hình: học xem tổ hợp nào,
          với trọng số nào, thực sự tương quan với lừa đảo. Hãy thử dán một URL thật của ngân hàng bạn dùng
          và xem bộ đặc trưng phản ứng ra sao — rồi thử một biến thể giả mạo.
        </>
      }
    >
      <div className="field">
        <label htmlFor="url-in"><span>Dán một URL bất kỳ</span><var>{risky}/{f.length} dấu hiệu</var></label>
        <input id="url-in" type="text" value={url} onChange={(e) => setUrl(e.target.value)} className="mono" />
        <div className="field-hint">Không có gì được gửi đi đâu cả — mọi tính toán chạy trong trình duyệt của bạn.</div>
      </div>

      <div className="bar bar-lg">
        <div className="bar-fill" style={{ width: `${score * 100}%`, background: score > 0.5 ? 'var(--bad)' : score > 0.25 ? 'var(--warn)' : 'var(--ok)' }} />
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>Đặc trưng</th><th>Giá trị</th><th>Vì sao đặc trưng này tồn tại</th></tr></thead>
          <tbody>
            {f.map((x) => (
              <tr key={x.k} style={x.risk ? { background: 'var(--bad-soft)' } : undefined}>
                <td>
                  {x.risk && <Icon name="alert-triangle" size={11} />} {x.k}
                </td>
                <td className="mono">{x.v}</td>
                <td className="faint">{x.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-pe-features — Đặc trưng tệp PE                                         */
/* ========================================================================== */

const PE_SAMPLES = [
  {
    name: 'notepad.exe (sạch)', clean: true,
    sections: [{ n: '.text', e: 6.2, sz: 128 }, { n: '.rdata', e: 5.1, sz: 42 }, { n: '.data', e: 3.4, sz: 18 }, { n: '.rsrc', e: 4.6, sz: 96 }],
    imports: ['kernel32.dll', 'user32.dll', 'gdi32.dll', 'comdlg32.dll'],
    apis: ['CreateFileW', 'ReadFile', 'GetMessage', 'DrawText'],
    signed: true, tls: false, entropyOverall: 5.3,
  },
  {
    name: 'sample_packed.exe (nén UPX)', clean: false,
    sections: [{ n: 'UPX0', e: 0.0, sz: 0 }, { n: 'UPX1', e: 7.94, sz: 210 }, { n: '.rsrc', e: 4.2, sz: 8 }],
    imports: ['kernel32.dll'],
    apis: ['LoadLibraryA', 'GetProcAddress', 'VirtualProtect'],
    signed: false, tls: false, entropyOverall: 7.8,
  },
  {
    name: 'ransom_sim.exe (mô phỏng)', clean: false,
    sections: [{ n: '.text', e: 6.7, sz: 88 }, { n: '.data', e: 7.1, sz: 64 }, { n: '.reloc', e: 5.2, sz: 6 }],
    imports: ['kernel32.dll', 'advapi32.dll', 'crypt32.dll', 'ws2_32.dll'],
    apis: ['CryptEncrypt', 'CryptGenKey', 'FindFirstFileW', 'DeleteFileW', 'WSASend', 'CreateProcessW'],
    signed: false, tls: true, entropyOverall: 6.9,
  },
];

export function LabPeFeatures() {
  const [idx, setIdx] = useState(2);
  const s = PE_SAMPLES[idx];
  const maxSectionEnt = Math.max(...s.sections.map((x) => x.e));
  const dangerousApis = ['CryptEncrypt', 'VirtualProtect', 'CreateRemoteThread', 'WriteProcessMemory', 'DeleteFileW', 'CryptGenKey'];
  const flagged = s.apis.filter((a) => dangerousApis.includes(a));

  return (
    <LabShell
      id="lab-pe-features"
      title="Đọc một tệp thực thi như mô hình đọc"
      takeaway={
        <>
          Ba nhóm đặc trưng làm nên gần hết sức mạnh của phân loại mã độc tĩnh: <b>entropy từng section</b>{' '}
          (trên 7,2 gần như chắc chắn là nén/mã hoá), <b>bảng imports</b> (mã độc cần những API rất đặc thù),
          và <b>siêu dữ liệu</b> (chữ ký số, timestamp, kích thước). Nhưng chú ý cái bẫy: mẫu "nén UPX" bị
          gắn cờ vì nó nén — mà <b>phần mềm thương mại hợp pháp cũng nén</b>. Nếu tập huấn luyện của bạn toàn
          mã độc bị nén, mô hình sẽ học "nén = độc" và bắt nhầm mọi phần mềm có bảo vệ bản quyền.
        </>
      }
    >
      <div className="field">
        <label htmlFor="pe-sel"><span>Chọn mẫu để phân tích</span></label>
        <select id="pe-sel" value={idx} onChange={(e) => setIdx(Number(e.target.value))}>
          {PE_SAMPLES.map((x, i) => <option key={i} value={i}>{x.name}</option>)}
        </select>
      </div>

      <Readout
        items={[
          { k: 'Entropy toàn tệp', v: s.entropyOverall.toFixed(2), tone: s.entropyOverall > 7.2 ? 'bad' : s.entropyOverall > 6.5 ? 'warn' : 'ok' },
          { k: 'Entropy cao nhất', v: maxSectionEnt.toFixed(2), tone: maxSectionEnt > 7.2 ? 'bad' : 'ok', sub: '>7,2 = nén/mã hoá' },
          { k: 'Số DLL nhập', v: String(s.imports.length), tone: s.imports.length <= 1 ? 'warn' : 'neutral', sub: s.imports.length <= 1 ? 'quá ít → nghi nén' : '' },
          { k: 'Chữ ký số', v: s.signed ? 'có' : 'KHÔNG', tone: s.signed ? 'ok' : 'warn' },
        ]}
      />

      <div>
        <div className="stat-k" style={{ marginBottom: 8 }}>Entropy từng section</div>
        <Bars
          color={COLORS.brand}
          data={s.sections.map((x) => ({ label: x.n, v: x.e, color: x.e > 7.2 ? 'var(--bad)' : x.e > 6.5 ? 'var(--warn)' : 'var(--ok)' }))}
          fmt={(v) => v.toFixed(2)}
        />
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="stat-k" style={{ marginBottom: 8 }}>Thư viện nhập</div>
          <div className="row-wrap">{s.imports.map((i) => <span key={i} className="chip mono">{i}</span>)}</div>
        </div>
        <div className="panel">
          <div className="stat-k" style={{ marginBottom: 8 }}>Hàm API đáng chú ý</div>
          <div className="row-wrap">
            {s.apis.map((a) => (
              <span key={a} className={`chip mono ${dangerousApis.includes(a) ? 'chip-bad' : ''}`}>{a}</span>
            ))}
          </div>
          {flagged.length > 0 && (
            <div className="faint" style={{ marginTop: 8 }}>
              {flagged.length} hàm thuộc nhóm hay gặp ở mã độc — nhưng phần mềm mã hoá hợp pháp cũng dùng chúng.
            </div>
          )}
        </div>
      </div>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-tfidf — TF-IDF trên dòng log                                           */
/* ========================================================================== */

const LOG_LINES = [
  'sshd Accepted password for admin from 10.0.0.5 port 51234',
  'sshd Failed password for root from 203.0.113.9 port 44210',
  'sshd Failed password for admin from 203.0.113.9 port 44211',
  'sshd Failed password for test from 203.0.113.9 port 44212',
  'sudo user1 COMMAND=/usr/bin/apt-get update',
  'sudo user1 COMMAND=/usr/bin/systemctl restart nginx',
  'powershell EncodedCommand JABzAD0ATgBlAHcALQBP downloadstring',
  'cron session opened for user backup',
];

export function LabTfidf() {
  const [query, setQuery] = useState('powershell EncodedCommand downloadstring');
  const [useIdf, setUseIdf] = useState(true);

  const model = useMemo(() => {
    const docs = LOG_LINES.map((l) => l.toLowerCase().split(/[\s=/]+/).filter(Boolean));
    const df = new Map<string, number>();
    docs.forEach((d) => new Set(d).forEach((w) => df.set(w, (df.get(w) ?? 0) + 1)));
    return { docs, df, N: docs.length };
  }, []);

  const vec = (words: string[]) => {
    const tf = new Map<string, number>();
    words.forEach((w) => tf.set(w, (tf.get(w) ?? 0) + 1));
    const out = new Map<string, number>();
    tf.forEach((c, w) => {
      const idf = useIdf ? Math.log((model.N + 1) / ((model.df.get(w) ?? 0) + 1)) + 1 : 1;
      out.set(w, (c / words.length) * idf);
    });
    return out;
  };

  const cosine = (a: Map<string, number>, b: Map<string, number>) => {
    let dot = 0;
    let na = 0;
    let nb = 0;
    a.forEach((v, k) => { dot += v * (b.get(k) ?? 0); na += v * v; });
    b.forEach((v) => { nb += v * v; });
    return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
  };

  const qv = vec(query.toLowerCase().split(/[\s=/]+/).filter(Boolean));
  const sims = LOG_LINES.map((l, i) => ({ l, s: cosine(qv, vec(model.docs[i])) })).sort((a, b) => b.s - a.s);
  const topTerms = [...qv.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <LabShell
      id="lab-tfidf"
      title="TF-IDF: từ nào thực sự mang thông tin"
      takeaway={
        <>
          Tắt IDF và xem chuyện gì xảy ra: những từ xuất hiện ở <b>mọi</b> dòng log (như "for", "from", "port")
          bỗng có trọng số ngang với từ hiếm. IDF chính là ý tưởng "từ càng hiếm càng nhiều thông tin" — và
          trong bảo mật, <b>cái hiếm mới đáng nhìn</b>. Đây là nền tảng của rất nhiều hệ thống phát hiện dựa
          trên độ hiếm: dòng lệnh hiếm, tiến trình cha–con hiếm, cặp user–máy hiếm.
        </>
      }
    >
      <div className="field">
        <label htmlFor="tf-in"><span>Dòng log cần tìm tương đồng</span></label>
        <input id="tf-in" type="text" value={query} onChange={(e) => setQuery(e.target.value)} className="mono" />
      </div>
      <Toggle label="Bật IDF (phạt từ phổ biến)" checked={useIdf} onChange={setUseIdf} />

      <div>
        <div className="stat-k" style={{ marginBottom: 8 }}>Trọng số các từ trong truy vấn</div>
        <div className="row-wrap">
          {topTerms.map(([w, v]) => (
            <span key={w} className="chip mono" style={{ background: `color-mix(in srgb, var(--brand) ${Math.min(60, v * 300)}%, var(--bg-sunken))` }}>
              {w} <b>{v.toFixed(3)}</b>
            </span>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead><tr><th style={{ width: 90 }}>Tương đồng</th><th>Dòng log</th></tr></thead>
          <tbody>
            {sims.map((r, i) => (
              <tr key={i}>
                <td>
                  <div className="bar" style={{ width: 60, display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}>
                    <div className="bar-fill" style={{ width: `${r.s * 100}%` }} />
                  </div>
                  <span className="mono faint">{r.s.toFixed(2)}</span>
                </td>
                <td className="mono" style={{ fontSize: 'var(--fs-xs)' }}>{r.l}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-anomaly — Phát hiện bất thường trên log đăng nhập                      */
/* ========================================================================== */

export function LabAnomaly() {
  const [method, setMethod] = useState<'zscore' | 'iforest' | 'percentile'>('iforest');
  const [sensitivity, setSensitivity] = useState(2.5);
  const [seed, reseed] = useSeed();

  const pts = useMemo(() => {
    const rng = mulberry32(seed);
    const out: { hour: number; files: number; label: 'normal' | 'attack'; who: string }[] = [];
    for (let i = 0; i < 160; i++) {
      out.push({
        hour: clamp(gaussian(rng, 10.5, 2.4), 0, 23.9),
        files: clamp(gaussian(rng, 22, 12), 0, 400),
        label: 'normal',
        who: `user${(i % 24) + 1}`,
      });
    }
    // Ba kịch bản bất thường thật
    out.push({ hour: 2.7, files: 310, label: 'attack', who: 'svc-backup' });
    out.push({ hour: 3.4, files: 265, label: 'attack', who: 'user7' });
    out.push({ hour: 23.4, files: 190, label: 'attack', who: 'user15' });
    // Bất thường LÀNH TÍNH — bẫy kinh điển
    out.push({ hour: 21.6, files: 240, label: 'normal', who: 'user3 (deadline)' });
    out.push({ hour: 5.2, files: 30, label: 'normal', who: 'user9 (múi giờ khác)' });
    return out;
  }, [seed]);

  const scores = useMemo(() => {
    const norm = (v: number, lo: number, hi: number) => (v - lo) / (hi - lo);
    const X = pts.map((p) => [norm(p.hour, 0, 24), norm(p.files, 0, 400)]);
    if (method === 'zscore') {
      const mh = X.reduce((s, x) => s + x[0], 0) / X.length;
      const mf = X.reduce((s, x) => s + x[1], 0) / X.length;
      const sh = Math.sqrt(X.reduce((s, x) => s + (x[0] - mh) ** 2, 0) / X.length) || 1e-9;
      const sf = Math.sqrt(X.reduce((s, x) => s + (x[1] - mf) ** 2, 0) / X.length) || 1e-9;
      return X.map((x) => Math.hypot((x[0] - mh) / sh, (x[1] - mf) / sf));
    }
    if (method === 'percentile') {
      return X.map((x) => Math.max(Math.abs(x[0] - 0.44) * 4, Math.abs(x[1] - 0.06) * 4));
    }
    // Isolation Forest thu nhỏ: độ sâu trung bình để cô lập bằng phép chia ngẫu nhiên
    const rng = mulberry32(seed + 9);
    const depths = new Array(X.length).fill(0);
    const TREES = 60;
    for (let t = 0; t < TREES; t++) {
      const isolate = (idxs: number[], depth: number) => {
        if (idxs.length <= 1 || depth > 9) {
          idxs.forEach((i) => (depths[i] += depth));
          return;
        }
        const dim = rng() < 0.5 ? 0 : 1;
        const vals = idxs.map((i) => X[i][dim]);
        const lo = Math.min(...vals);
        const hi = Math.max(...vals);
        if (hi - lo < 1e-9) { idxs.forEach((i) => (depths[i] += depth)); return; }
        const sp = lo + rng() * (hi - lo);
        isolate(idxs.filter((i) => X[i][dim] < sp), depth + 1);
        isolate(idxs.filter((i) => X[i][dim] >= sp), depth + 1);
      };
      isolate(X.map((_, i) => i), 0);
    }
    const avg = depths.map((d) => d / TREES);
    const mx = Math.max(...avg);
    return avg.map((d) => (mx - d) * 1.6);
  }, [pts, method, seed]);

  const thr = method === 'zscore' ? sensitivity : sensitivity * 0.9;
  const flagged = scores.map((s, i) => ({ ...pts[i], s })).filter((x) => x.s >= thr);
  const caught = flagged.filter((x) => x.label === 'attack').length;
  const falseAlarms = flagged.filter((x) => x.label === 'normal').length;

  const p = mkPlot(460, 320, [0, 24], [0, 400], { l: 46, r: 14, t: 14, b: 38 });

  return (
    <LabShell
      id="lab-anomaly"
      title="Phát hiện bất thường trên hành vi truy cập tệp"
      takeaway={
        <>
          Chú ý hai điểm được dán nhãn "deadline" và "múi giờ khác": chúng <b>bất thường thật</b> nhưng hoàn
          toàn lành tính. Không thuật toán nào phân biệt được — vì thông tin để phân biệt <b>không nằm trong
          dữ liệu</b>. Đây là giới hạn nền tảng của phát hiện bất thường, và là lý do mọi hệ thống UEBA
          nghiêm túc đều phải làm giàu ngữ cảnh (lịch làm việc, vị trí, vai trò) trước khi cảnh báo. So sánh
          ba phương pháp: z-score giả định phân phối chuẩn (sai với dữ liệu bảo mật đuôi nặng), Isolation
          Forest không giả định gì và thường thắng.
        </>
      }
    >
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor="an-m"><span>Phương pháp</span></label>
          <select id="an-m" value={method} onChange={(e) => setMethod(e.target.value as typeof method)}>
            <option value="iforest">Isolation Forest</option>
            <option value="zscore">Z-score đa biến</option>
            <option value="percentile">Ngưỡng phân vị thủ công</option>
          </select>
        </div>
        <Slider label="Độ nhạy" value={sensitivity} min={1} max={5} step={0.05} onChange={setSensitivity} format={(v) => v.toFixed(2)} />
      </div>
      <Reseed onClick={reseed} />

      <Chart p={p} label="Hành vi truy cập tệp theo giờ">
        <Axes p={p} xLabel="Giờ trong ngày" yLabel="Số tệp truy cập" xTicks={6} yTicks={4} fmtX={(v) => `${Math.round(v)}h`} fmtY={(v) => String(Math.round(v))} />
        {pts.map((pt, i) => (
          <g key={i}>
            {scores[i] >= thr && <circle cx={px(p, pt.hour)} cy={py(p, pt.files)} r={11} fill="none" stroke={COLORS.warn} strokeWidth={2} />}
            <circle cx={px(p, pt.hour)} cy={py(p, pt.files)} r={pt.label === 'attack' ? 6 : 4}
              fill={pt.label === 'attack' ? COLORS.bad : COLORS.info} opacity={0.85} />
          </g>
        ))}
      </Chart>

      <Readout
        items={[
          { k: 'Bắt được', v: `${caught}/3`, tone: caught === 3 ? 'ok' : caught >= 2 ? 'warn' : 'bad' },
          { k: 'Báo động giả', v: String(falseAlarms), tone: falseAlarms === 0 ? 'ok' : falseAlarms <= 2 ? 'warn' : 'bad' },
          { k: 'Tổng cảnh báo', v: String(flagged.length) },
          { k: 'Độ chuẩn xác', v: flagged.length ? `${((caught / flagged.length) * 100).toFixed(0)}%` : '—', tone: caught / Math.max(flagged.length, 1) > 0.5 ? 'ok' : 'warn' },
        ]}
      />
      {flagged.length > 0 && (
        <div className="panel">
          <div className="stat-k" style={{ marginBottom: 8 }}>Hàng đợi điều tra</div>
          <div className="row-wrap">
            {flagged.slice(0, 12).map((x, i) => (
              <span key={i} className={`chip ${x.label === 'attack' ? 'chip-bad' : 'chip-warn'}`}>
                {x.who} · {x.hour.toFixed(1)}h · {Math.round(x.files)} tệp
              </span>
            ))}
          </div>
        </div>
      )}
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-drift — Trôi khái niệm theo thời gian                                  */
/* ========================================================================== */

export function LabDrift() {
  const [driftRate, setDriftRate] = useState(1.4);
  const [retrainEvery, setRetrainEvery] = useState(0);
  const [months, setMonths] = useState(24);

  const series = useMemo(() => {
    const out: { m: number; f1: number; retrained: boolean }[] = [];
    let sinceTrain = 0;
    for (let m = 0; m <= months; m++) {
      const retrained = retrainEvery > 0 && m > 0 && m % retrainEvery === 0;
      if (retrained) sinceTrain = 0;
      const decay = Math.exp((-driftRate * sinceTrain) / 12);
      out.push({ m, f1: clamp(0.92 * decay + 0.06, 0, 1), retrained });
      sinceTrain++;
    }
    return out;
  }, [driftRate, retrainEvery, months]);

  const p = mkPlot(470, 260, [0, months], [0, 1], { l: 46, r: 14, t: 14, b: 38 });
  const belowThreshold = series.find((s) => s.f1 < 0.6);
  const finalF1 = series[series.length - 1].f1;

  return (
    <LabShell
      id="lab-drift"
      title="Mô hình của bạn hỏng nhanh đến mức nào"
      takeaway={
        <>
          Trong hầu hết ngành, mô hình xuống cấp vì thế giới đổi <em>ngẫu nhiên</em>. Trong bảo mật, nó xuống
          cấp vì có người <b>chủ động làm cho nó xuống cấp</b> — nên tốc độ trôi cao hơn nhiều. Hãy để tốc độ
          trôi ở mức cao và tắt huấn luyện lại: mô hình "xuất sắc" của bạn tụt dưới mức dùng được chỉ sau vài
          tháng. Bài học vận hành: <b>ngân sách huấn luyện lại phải nằm trong kế hoạch ngay từ ngày đầu</b>,
          không phải là việc phát sinh khi có người phàn nàn.
        </>
      }
    >
      <div className="grid grid-3">
        <Slider label="Tốc độ trôi khái niệm" value={driftRate} min={0.2} max={4} step={0.1} onChange={setDriftRate} format={(v) => (v < 0.8 ? 'chậm' : v < 2 ? 'trung bình' : 'nhanh (đối thủ tích cực)')} />
        <Slider label="Huấn luyện lại mỗi" value={retrainEvery} min={0} max={12} step={1} onChange={setRetrainEvery} format={(v) => (v === 0 ? 'không bao giờ' : `${v} tháng`)} />
        <Slider label="Khoảng thời gian mô phỏng" value={months} min={6} max={48} step={1} onChange={setMonths} format={(v) => `${v} tháng`} />
      </div>

      <Chart p={p} label="Hiệu năng mô hình theo thời gian">
        <Axes p={p} xLabel="Tháng kể từ khi triển khai" yLabel="Điểm F1" xTicks={6} yTicks={5} fmtX={(v) => String(Math.round(v))} />
        <Line p={p} pts={[[0, 0.6], [months, 0.6]]} color={COLORS.bad} width={1.6} dash="6 4" />
        <text x={px(p, months) - 4} y={py(p, 0.6) - 6} textAnchor="end" className="svg-label" style={{ fontSize: 10 }}>ngưỡng ngừng dùng</text>
        <Line p={p} pts={series.map((s) => [s.m, s.f1] as [number, number])} color={COLORS.brand} />
        {series.filter((s) => s.retrained).map((s, i) => (
          <line key={i} x1={px(p, s.m)} y1={p.pad.t} x2={px(p, s.m)} y2={p.h - p.pad.b} stroke={COLORS.ok} strokeWidth={1.4} strokeDasharray="3 3" />
        ))}
      </Chart>

      <Readout
        items={[
          { k: 'F1 sau ' + months + ' tháng', v: finalF1.toFixed(2), tone: finalF1 > 0.75 ? 'ok' : finalF1 > 0.6 ? 'warn' : 'bad' },
          { k: 'Tháng chạm ngưỡng hỏng', v: belowThreshold ? String(belowThreshold.m) : 'không', tone: belowThreshold ? 'bad' : 'ok' },
          { k: 'Số lần huấn luyện lại', v: String(series.filter((s) => s.retrained).length), tone: 'info' },
        ]}
      />
    </LabShell>
  );
}
