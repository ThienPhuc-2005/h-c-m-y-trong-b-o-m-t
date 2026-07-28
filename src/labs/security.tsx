/**
 * Phòng lab về DỮ LIỆU BẢO MẬT.
 * Ở đây bạn thao tác trực tiếp trên thứ mà một kỹ sư phát hiện làm hằng ngày:
 * biến một chuỗi, một tệp, một dòng log thành các con số có ý nghĩa.
 */

import { useMemo, useState } from 'react';
import { LabShell, Slider, Readout, Chart, Axes, Line, mkPlot, px, py, COLORS, Bars, Toggle, Reseed, useSeed } from './kit';
import { shannonEntropy, mulberry32, gaussian, clamp, shuffle } from '../lib/utils';
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
 * không giảm, nên chính bộ phát hiện lại bắt được chúng vì lý do sai. Hai tên dưới đây
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

/**
 * Điểm nghi ngờ DGA: entropy cao + bigram lạ + ít nguyên âm.
 *
 * Tách khỏi component để chốt được lời kết luận, vốn nêu số cụ thể cho hai tên
 * miền giả mạo thương hiệu và khẳng định chúng LỌT QUA ngưỡng mặc định.
 */
export function dgaScore(domain: string, wEnt = 1, wBi = 1) {
  const label = domain.split('.')[0];
  const ent = shannonEntropy(label);
  const bi = bigramScore(label);
  const vw = vowelRatio(label);
  const score = clamp(
    (wEnt * clamp((ent - 2.2) / 1.6, 0, 1) + wBi * (1 - bi) + 0.6 * clamp((0.38 - vw) / 0.38, 0, 1)) /
      (wEnt + wBi + 0.6),
    0,
    1,
  );
  return { d: domain, label, ent, bi, vw, score };
}

/** Ngưỡng cảnh báo mặc định của lab — cũng là mốc mà lời kết luận nói tới. */
export const DGA_THR = 0.5;

export function LabEntropy() {
  const [input, setInput] = useState('kq3v9zx7wp1m.com');
  const [wEnt, setWEnt] = useState(1);
  const [wBi, setWBi] = useState(1);
  const [thr, setThr] = useState(DGA_THR);

  const analyse = (d: string) => dgaScore(d, wEnt, wBi);
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
          ký tự có giống ngôn ngữ người không) và <b>tỉ lệ nguyên âm</b> thì mới ra một bộ phát hiện dùng được. Đây
          là bài học tổng quát của cả kỹ thuật đặc trưng: nhiều tín hiệu yếu ghép lại mạnh hơn một tín hiệu
          mạnh. Và chú ý hai dòng cuối bảng: <code>paypal-login.com</code> và{' '}
          <code>vietcombank-online.com</code> đều <b>lọt qua</b> với điểm 0,45–0,47. Chúng không phải DGA mà
          là <b>giả mạo thương hiệu</b> — đọc trôi như tiếng Anh nên entropy thấp, bigram đẹp, nguyên âm đủ.
          Cả ba đặc trưng ở đây đều mù trước loại tấn công đó, và không thanh trượt nào cứu được: cần một bộ
          đặc trưng hoàn toàn khác (khoảng cách chỉnh sửa tới tên miền thương hiệu, tuổi tên miền, chứng chỉ,
          nội dung trang). <b>Biết bộ phát hiện của mình mù ở đâu quan trọng hơn biết nó bắt được gì.</b>
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

/**
 * Hậu tố hai cấp: những chỗ mà nhãn ĐĂNG KÝ ĐƯỢC nằm ở vị trí thứ ba từ phải
 * sang, không phải thứ hai.
 *
 * Không có danh sách này thì `vietcombank.com.vn` — tên miền thật của đúng
 * ngân hàng mà lab lấy làm ví dụ — bị đọc thành "nhãn gốc là `com`, còn
 * `vietcombank` chỉ là tên miền con", tức là bị gắn cờ giả mạo. Lời kết luận
 * mời người học "dán một URL thật của ngân hàng bạn dùng", nên đây không phải
 * ca hiếm: đó là ca đầu tiên người học sẽ thử.
 */
const MULTI_TLD = ['com.vn', 'net.vn', 'org.vn', 'edu.vn', 'gov.vn', 'co.uk', 'com.au', 'co.jp', 'com.br', 'com.cn'];

const BRAND_WORDS = ['vietcombank', 'paypal', 'microsoft', 'apple', 'google', 'facebook', 'techcombank', 'momo'];
const SUSPICIOUS_TLD = ['xyz', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'buzz', 'click', 'zip', 'mov'];
const URGENT_WORDS = /login|verify|secure|account|update|confirm|signin/i;

/** Tách host thành nhãn đăng ký được, hậu tố, và các nhãn con phía trước nó. */
export function splitHost(host: string) {
  const parts = host.toLowerCase().split('.').filter(Boolean);
  if (parts.length < 2) return { registrable: parts[0] ?? '', suffix: '', subdomains: [] as string[] };
  const lastTwo = parts.slice(-2).join('.');
  const suffixLen = MULTI_TLD.includes(lastTwo) && parts.length >= 3 ? 2 : 1;
  return {
    registrable: parts[parts.length - suffixLen - 1] ?? '',
    suffix: parts.slice(-suffixLen).join('.'),
    subdomains: parts.slice(0, Math.max(0, parts.length - suffixLen - 1)),
  };
}

export interface UrlFeature {
  k: string;
  v: string;
  risk: boolean;
  why: string;
}

export function urlFeatures(url: string): UrlFeature[] {
  const u = url.trim();
  let host = u;
  try {
    host = new URL(u.includes('://') ? u : `http://${u}`).hostname;
  } catch {
    host = u.split('/')[0];
  }
  const path = u.split(host)[1] ?? '';
  const { registrable, suffix, subdomains } = splitHost(host);
  const tld = suffix.split('.').pop() ?? '';
  const lower = host.toLowerCase();
  // Giả mạo = thương hiệu CÓ trong host nhưng KHÔNG phải là nhãn đăng ký được.
  const brandMisplaced = BRAND_WORDS.find((b) => lower.includes(b) && registrable !== b);
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  const dashes = (host.match(/-/g) ?? []).length;
  const ent = shannonEntropy(registrable);

  return [
    { k: 'Độ dài URL', v: String(u.length), risk: u.length > 75, why: 'URL dài che giấu tên miền thật trên di động' },
    { k: 'Số tên miền con', v: String(subdomains.length), risk: subdomains.length >= 2, why: 'Nhiều cấp con là mẹo tạo cảm giác chính thống' },
    { k: 'Entropy tên miền', v: ent.toFixed(2), risk: ent > 3.6, why: 'Entropy cao gợi ý sinh tự động' },
    { k: 'TLD', v: suffix || '—', risk: SUSPICIOUS_TLD.includes(tld), why: 'Một số TLD giá rẻ bị lạm dụng nhiều' },
    { k: 'Dùng IP thay tên miền', v: isIp ? 'CÓ' : 'không', risk: isIp, why: 'Trang hợp pháp gần như không bao giờ dùng IP trần' },
    { k: 'Có dấu gạch ngang', v: String(dashes), risk: dashes >= 2, why: 'Kỹ thuật ghép từ khoá thương hiệu' },
    { k: 'Thương hiệu ở sai vị trí', v: brandMisplaced ?? 'không', risk: !!brandMisplaced, why: 'Tên thương hiệu nằm ngoài tên miền gốc = giả mạo' },
    { k: 'Punycode', v: host.includes('xn--') ? 'CÓ' : 'không', risk: host.includes('xn--'), why: 'Chữ cái nhìn giống nhau từ bảng mã khác' },
    { k: 'Từ khoá nhạy cảm', v: URGENT_WORDS.test(u) ? 'CÓ' : 'không', risk: URGENT_WORDS.test(u), why: 'Từ khoá tạo cảm giác cấp bách' },
    { k: 'HTTPS', v: u.startsWith('https') ? 'có' : 'KHÔNG', risk: !u.startsWith('https'), why: 'Ngày nay HTTPS gần như miễn phí — thiếu nó là bất thường' },
    { k: 'Độ dài đường dẫn', v: String(path.length), risk: path.length > 40, why: 'Đường dẫn dài chứa tham số theo dõi nạn nhân' },
  ];
}

export function LabUrlFeatures() {
  const [url, setUrl] = useState('http://secure-vietcombank.verify-account.xyz/login?id=8821');

  const f = useMemo(() => urlFeatures(url), [url]);
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

const DANGEROUS_APIS = ['CryptEncrypt', 'VirtualProtect', 'CreateRemoteThread', 'WriteProcessMemory', 'DeleteFileW', 'CryptGenKey'];
/** Ngưỡng entropy mà lời kết luận nêu thẳng: trên mức này gần như chắc là nén/mã hoá. */
export const PE_ENTROPY_PACKED = 7.2;

export function peFeatures(idx: number) {
  const s = PE_SAMPLES[idx];
  const maxSectionEnt = Math.max(...s.sections.map((x) => x.e));
  return {
    sample: s,
    maxSectionEnt,
    packedBySection: maxSectionEnt > PE_ENTROPY_PACKED,
    flaggedApis: s.apis.filter((a) => DANGEROUS_APIS.includes(a)),
    fewImports: s.imports.length <= 1,
  };
}

export function LabPeFeatures() {
  const [idx, setIdx] = useState(2);
  const { sample: s, maxSectionEnt, flaggedApis: flagged } = peFeatures(idx);
  const dangerousApis = DANGEROUS_APIS;

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
          { k: 'Entropy toàn tệp', v: s.entropyOverall.toFixed(2), tone: s.entropyOverall > PE_ENTROPY_PACKED ? 'bad' : s.entropyOverall > 6.5 ? 'warn' : 'ok' },
          { k: 'Entropy cao nhất', v: maxSectionEnt.toFixed(2), tone: maxSectionEnt > PE_ENTROPY_PACKED ? 'bad' : 'ok', sub: '>7,2 = nén/mã hoá' },
          { k: 'Số DLL nhập', v: String(s.imports.length), tone: s.imports.length <= 1 ? 'warn' : 'neutral', sub: s.imports.length <= 1 ? 'quá ít → nghi nén' : '' },
          { k: 'Chữ ký số', v: s.signed ? 'có' : 'KHÔNG', tone: s.signed ? 'ok' : 'warn' },
        ]}
      />

      <div>
        <div className="stat-k" style={{ marginBottom: 8 }}>Entropy từng section</div>
        <Bars
          color={COLORS.brand}
          data={s.sections.map((x) => ({ label: x.n, v: x.e, color: x.e > PE_ENTROPY_PACKED ? 'var(--bad)' : x.e > 6.5 ? 'var(--warn)' : 'var(--ok)' }))}
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

const tokenise = (s: string) => s.toLowerCase().split(/[\s=/]+/).filter(Boolean);

/**
 * TF-IDF trên tám dòng log, cộng độ tương đồng cosine với một truy vấn.
 *
 * Tách khỏi component để chốt điều lời kết luận hứa: BẬT IDF thì từ hiếm nặng
 * hơn từ phổ biến, TẮT IDF thì mọi từ trong truy vấn nặng ngang nhau. Đó là
 * một quan hệ thứ tự, không phải một con số, nên nó phải được kiểm bằng so
 * sánh chứ không bằng chốt cứng ba chữ số thập phân.
 */
export function tfidfRun(query: string, useIdf: boolean) {
  const docs = LOG_LINES.map(tokenise);
  const df = new Map<string, number>();
  docs.forEach((d) => new Set(d).forEach((w) => df.set(w, (df.get(w) ?? 0) + 1)));
  const N = docs.length;

  const vec = (words: string[]) => {
    const tf = new Map<string, number>();
    words.forEach((w) => tf.set(w, (tf.get(w) ?? 0) + 1));
    const out = new Map<string, number>();
    tf.forEach((c, w) => {
      const idf = useIdf ? Math.log((N + 1) / ((df.get(w) ?? 0) + 1)) + 1 : 1;
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

  const qv = vec(tokenise(query));
  const sims = LOG_LINES.map((l, i) => ({ l, s: cosine(qv, vec(docs[i])) })).sort((a, b) => b.s - a.s);
  return {
    df,
    weights: qv,
    sims,
    topTerms: [...qv.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
  };
}

export function LabTfidf() {
  const [query, setQuery] = useState('powershell EncodedCommand downloadstring');
  const [useIdf, setUseIdf] = useState(true);

  const { sims, topTerms } = useMemo(() => tfidfRun(query, useIdf), [query, useIdf]);

  return (
    <LabShell
      id="lab-tfidf"
      title="TF-IDF: từ nào thực sự mang thông tin"
      takeaway={
        <>
          Truy vấn mặc định toàn từ hiếm, nên nút IDF gần như không đổi gì. Hãy gõ một dòng đầy từ phổ biến
          — thử <span className="mono">failed password for root from port</span> — rồi bật tắt IDF và nhìn
          hàng trọng số. Bật IDF: "root" (chỉ có ở 1 trong 8 dòng) nặng 0,42 trong khi "for" (có ở 5 dòng)
          chỉ còn 0,23. Tắt IDF: cả sáu từ đều đúng 0,17, tức từ phổ biến bỗng nặng ngang từ hiếm.
          <br />
          <br />
          IDF chính là ý tưởng "từ càng hiếm càng nhiều thông tin" — và trong bảo mật, <b>cái hiếm mới đáng
          nhìn</b>. Đây là nền tảng của rất nhiều hệ thống phát hiện dựa trên độ hiếm: dòng lệnh hiếm, tiến
          trình cha–con hiếm, cặp user–máy hiếm.
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

export type AnomalyMethod = 'zscore' | 'iforest' | 'percentile';

export interface AnomalyPoint {
  hour: number;
  files: number;
  label: 'normal' | 'attack';
  who: string;
}

/** Ba tấn công thật, cộng hai bất thường LÀNH TÍNH — cái bẫy của cả bài lab. */
export const ANOMALY_ATTACKS = 3;

export const ANOMALY_NAMES: Record<AnomalyMethod, string> = {
  iforest: 'Isolation Forest',
  zscore: 'Z-score đa biến',
  percentile: 'Ngưỡng phân vị thủ công',
};

export function anomalyPoints(seed: number): AnomalyPoint[] {
  const rng = mulberry32(seed);
  const out: AnomalyPoint[] = [];
  for (let i = 0; i < 160; i++) {
    out.push({
      hour: clamp(gaussian(rng, 10.5, 2.4), 0, 23.9),
      files: clamp(gaussian(rng, 22, 12), 0, 400),
      label: 'normal',
      who: `user${(i % 24) + 1}`,
    });
  }
  out.push({ hour: 2.7, files: 310, label: 'attack', who: 'svc-backup' });
  out.push({ hour: 3.4, files: 265, label: 'attack', who: 'user7' });
  out.push({ hour: 23.4, files: 190, label: 'attack', who: 'user15' });
  // Bất thường LÀNH TÍNH — bẫy kinh điển, và là điều lời kết luận nói tới.
  out.push({ hour: 21.6, files: 240, label: 'normal', who: 'user3 (deadline)' });
  out.push({ hour: 5.2, files: 30, label: 'normal', who: 'user9 (múi giờ khác)' });
  return out;
}

export function anomalyScores(pts: AnomalyPoint[], method: AnomalyMethod, seed: number): number[] {
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
  // Isolation Forest thu nhỏ: độ sâu trung bình để cô lập bằng phép chia ngẫu nhiên.
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
}

/**
 * Một lượt chạy, cắt theo NGÂN SÁCH CẢNH BÁO chứ không theo ngưỡng điểm.
 *
 * Bản trước cắt bằng một thanh trượt "độ nhạy" dùng chung cho cả ba phương
 * pháp, mà ba phương pháp lại cho ba thang điểm khác hẳn nhau: điểm cao nhất
 * của Isolation Forest là 11,6, của z-score là 8,1, của ngưỡng phân vị là 2,9.
 * Cùng một con số trên thanh trượt vì thế cắt ở ba chỗ hoàn toàn khác nhau —
 * ở mức 2,5 thì Isolation Forest sinh 21 cảnh báo còn ngưỡng phân vị sinh 2.
 * Lời kết luận đọc kết quả đó rồi tuyên bố Isolation Forest "thường thắng",
 * trong khi thứ đang được đo là hiệu chuẩn thang điểm, không phải chất lượng
 * phương pháp.
 *
 * Cắt theo top-N thì cả ba cùng sinh đúng N cảnh báo, và câu hỏi trở về đúng
 * chỗ nó cần ở: với cùng ngần ấy công sức của analyst, phương pháp nào bỏ
 * đúng thứ vào hàng đợi? Đó cũng là cách một SOC thật chọn ngưỡng.
 */
export function anomalyRun(method: AnomalyMethod, budget: number, seed = 12345) {
  const pts = anomalyPoints(seed);
  const scores = anomalyScores(pts, method, seed);
  const ranked = scores.map((s, i) => [s, i] as const).sort((a, b) => b[0] - a[0]);
  const chosen = new Set(ranked.slice(0, Math.min(budget, ranked.length)).map(([, i]) => i));
  const flagged = [...chosen].sort((a, b) => scores[b] - scores[a]).map((i) => ({ ...pts[i], s: scores[i] }));
  const caught = flagged.filter((x) => x.label === 'attack').length;
  const falseAlarms = flagged.filter((x) => x.label === 'normal').length;
  return {
    pts, scores, chosen, flagged, caught, falseAlarms,
    precision: flagged.length ? caught / flagged.length : 0,
    /** Hai điểm lành tính bất thường có bị gọi lên hàng đợi điều tra không. */
    benignAnomaliesFlagged: flagged.filter((x) => x.who.includes('(')).length,
  };
}

export function LabAnomaly() {
  const [method, setMethod] = useState<AnomalyMethod>('iforest');
  const [budget, setBudget] = useState(5);
  const [seed, reseed] = useSeed();

  const { pts, chosen, flagged, caught, falseAlarms } = useMemo(
    () => anomalyRun(method, budget, seed),
    [method, budget, seed],
  );
  // Cùng ngân sách, ba phương pháp — bảng so sánh này là lý do lab tồn tại.
  const compare = useMemo(
    () => (['iforest', 'zscore', 'percentile'] as const).map((m) => ({ m, ...anomalyRun(m, budget, seed) })),
    [budget, seed],
  );

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
          nghiêm túc đều phải làm giàu ngữ cảnh (lịch làm việc, vị trí, vai trò) trước khi cảnh báo.
          <br />
          <br />
          Giờ tới điều bất ngờ, và nó nằm ở bảng so sánh phía dưới. Ba phương pháp này khác nhau về giả định
          tới mức không thể khác hơn — z-score giả định phân phối chuẩn, Isolation Forest không giả định gì,
          ngưỡng phân vị thì do người viết tay. Vậy mà <b>ở cùng một ngân sách cảnh báo, cả ba chọn ra gần
          như cùng một danh sách</b>: tới ngân sách 5 thì cả ba đều bắt đủ 3 vụ tấn công, và cả ba đều kéo
          theo đúng cái điểm "deadline" lành tính. Điểm "múi giờ khác" thì cả ba cùng xếp hạng 7, tức cùng
          bỏ lọt như nhau.
          <br />
          <br />
          Bài học vận hành: khi tín hiệu đã đủ mạnh, <b>chọn thuật toán nào ít quan trọng hơn chọn ngân sách
          cảnh báo</b>. Và hãy cảnh giác với mọi so sánh "thuật toán A thắng B" mà hai bên không được cắt ở
          cùng số lượng cảnh báo — bản trước của chính lab này cắt bằng một thanh trượt ngưỡng dùng chung
          cho ba thang điểm khác nhau, và nó làm Isolation Forest sinh 21 cảnh báo trong khi ngưỡng phân vị
          sinh 2. So như vậy là đang đo hiệu chuẩn thang điểm chứ không đo phương pháp.
        </>
      }
    >
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor="an-m"><span>Phương pháp</span></label>
          <select id="an-m" value={method} onChange={(e) => setMethod(e.target.value as typeof method)}>
            {(Object.keys(ANOMALY_NAMES) as AnomalyMethod[]).map((m) => (
              <option key={m} value={m}>{ANOMALY_NAMES[m]}</option>
            ))}
          </select>
        </div>
        <Slider
          label="Ngân sách cảnh báo mỗi ngày"
          value={budget}
          min={1}
          max={30}
          step={1}
          onChange={setBudget}
          hint="Số vụ analyst thật sự điều tra nổi. Cắt top-N thay vì cắt theo ngưỡng điểm là cách duy nhất so ba phương pháp một cách công bằng."
        />
      </div>
      <Reseed onClick={reseed} />

      <Chart p={p} label="Hành vi truy cập tệp theo giờ">
        <Axes p={p} xLabel="Giờ trong ngày" yLabel="Số tệp truy cập" xTicks={6} yTicks={4} fmtX={(v) => `${Math.round(v)}h`} fmtY={(v) => String(Math.round(v))} />
        {pts.map((pt, i) => (
          <g key={i}>
            {chosen.has(i) && <circle cx={px(p, pt.hour)} cy={py(p, pt.files)} r={11} fill="none" stroke={COLORS.warn} strokeWidth={2} />}
            <circle cx={px(p, pt.hour)} cy={py(p, pt.files)} r={pt.label === 'attack' ? 6 : 4}
              fill={pt.label === 'attack' ? COLORS.bad : COLORS.info} opacity={0.85} />
          </g>
        ))}
      </Chart>

      <Readout
        items={[
          { k: 'Bắt được', v: `${caught}/${ANOMALY_ATTACKS}`, tone: caught === ANOMALY_ATTACKS ? 'ok' : caught >= 2 ? 'warn' : 'bad' },
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

      <div className="panel">
        <div className="stat-k" style={{ marginBottom: 8 }}>
          Ba phương pháp ở cùng ngân sách {budget} cảnh báo
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr><th>Phương pháp</th><th>Bắt được</th><th>Kéo theo "deadline" / "múi giờ khác"</th></tr>
            </thead>
            <tbody>
              {compare.map((c) => (
                <tr key={c.m}>
                  <td>{ANOMALY_NAMES[c.m]}</td>
                  <td className="mono">{c.caught}/{ANOMALY_ATTACKS}</td>
                  <td className="mono">{c.benignAnomaliesFlagged}/2</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-drift — Trôi khái niệm theo thời gian                                  */
/* ========================================================================== */

/** Dưới mức này thì mô hình coi như hết dùng được — đường đứt đỏ trên biểu đồ. */
export const DRIFT_RETIRE_F1 = 0.6;

/**
 * Đường xuống cấp của mô hình theo tháng. F1 phân rã theo hàm mũ tính từ lần
 * huấn luyện gần nhất, nên huấn luyện lại kéo nó về mốc ban đầu.
 *
 * Tách khỏi component để chốt lời kết luận "tụt dưới mức dùng được chỉ sau vài
 * tháng" thành một con số tháng cụ thể, thay vì một cảm giác.
 */
export function driftSeries(driftRate: number, retrainEvery: number, months: number) {
  const points: { m: number; f1: number; retrained: boolean }[] = [];
  let sinceTrain = 0;
  for (let m = 0; m <= months; m++) {
    const retrained = retrainEvery > 0 && m > 0 && m % retrainEvery === 0;
    if (retrained) sinceTrain = 0;
    const decay = Math.exp((-driftRate * sinceTrain) / 12);
    points.push({ m, f1: clamp(0.92 * decay + 0.06, 0, 1), retrained });
    sinceTrain++;
  }
  const below = points.find((s) => s.f1 < DRIFT_RETIRE_F1);
  return {
    points,
    /** Tháng đầu tiên rơi dưới ngưỡng ngừng dùng, `null` nếu không bao giờ. */
    retireMonth: below ? below.m : null,
    finalF1: points[points.length - 1].f1,
    retrains: points.filter((s) => s.retrained).length,
  };
}

export function LabDrift() {
  const [driftRate, setDriftRate] = useState(1.4);
  const [retrainEvery, setRetrainEvery] = useState(0);
  const [months, setMonths] = useState(24);

  const { points: series, retireMonth, finalF1 } = useMemo(
    () => driftSeries(driftRate, retrainEvery, months),
    [driftRate, retrainEvery, months],
  );

  const p = mkPlot(470, 260, [0, months], [0, 1], { l: 46, r: 14, t: 14, b: 38 });

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
        <Line p={p} pts={[[0, DRIFT_RETIRE_F1], [months, DRIFT_RETIRE_F1]]} color={COLORS.bad} width={1.6} dash="6 4" />
        <text x={px(p, months) - 4} y={py(p, DRIFT_RETIRE_F1) - 6} textAnchor="end" className="svg-label" style={{ fontSize: 12.5 }}>ngưỡng ngừng dùng</text>
        <Line p={p} pts={series.map((s) => [s.m, s.f1] as [number, number])} color={COLORS.brand} />
        {series.filter((s) => s.retrained).map((s, i) => (
          <line key={i} x1={px(p, s.m)} y1={p.pad.t} x2={px(p, s.m)} y2={p.h - p.pad.b} stroke={COLORS.ok} strokeWidth={1.4} strokeDasharray="3 3" />
        ))}
      </Chart>

      <Readout
        items={[
          { k: 'F1 sau ' + months + ' tháng', v: finalF1.toFixed(2), tone: finalF1 > 0.75 ? 'ok' : finalF1 > DRIFT_RETIRE_F1 ? 'warn' : 'bad' },
          { k: 'Tháng chạm ngưỡng hỏng', v: retireMonth == null ? 'không' : String(retireMonth), tone: retireMonth == null ? 'ok' : 'bad' },
          { k: 'Số lần huấn luyện lại', v: String(series.filter((s) => s.retrained).length), tone: 'info' },
        ]}
      />
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-split — Chia tập sai và con số ảo giác                                 */
/* ========================================================================== */

const SPLIT_DAYS = 180;
const SPLIT_CAMPAIGNS = 30;

export interface SplitPoint {
  x: number;
  y: number;
  day: number;
  campaign: number;
  label: 0 | 1;
}

export interface SplitOut {
  points: SplitPoint[];
  /** Độ chính xác đo được theo từng cách chia tập. */
  random: number;
  temporal: number;
  group: number;
  dayCut: number;
}

/**
 * Mô phỏng kho mẫu thu thập theo chiến dịch, rồi đo cùng một mô hình bằng ba
 * cách chia tập.
 *
 * Điểm mấu chốt của thiết kế: nhãn KHÔNG suy được bằng một quy luật chung mạnh.
 * Mỗi chiến dịch nằm một chỗ trong không gian đặc trưng và mang nhãn gần như
 * ngẫu nhiên, nên cách duy nhất để đoán đúng là **nhớ chiến dịch đó**. Bản dựng
 * đầu cho hai lớp tách được toàn cục và kết quả là cả ba cách chia đều đạt
 * 100% — rò rỉ không lộ ra, vì mô hình không cần nhớ gì cả.
 *
 * `signal` là phần tín hiệu THẬT SỰ khái quát hoá được; kéo nó lên thì khoảng
 * cách giữa ba cách chia thu hẹp lại, đúng như ngoài đời.
 */
export function splitComparison(spread: number, signal: number): SplitOut {
  const rng = mulberry32(99);
  const points: SplitPoint[] = [];
  for (let c = 0; c < SPLIT_CAMPAIGNS; c++) {
    const cx = 0.08 + rng() * 0.84;
    const cy = 0.08 + rng() * 0.84;
    const p = 0.5 + signal * (cx - 0.5);
    const label: 0 | 1 = rng() < p ? 1 : 0;
    const start = Math.floor(rng() * (SPLIT_DAYS - 20));
    const n = 12 + Math.floor(rng() * 14);
    for (let i = 0; i < n; i++) {
      points.push({
        x: cx + gaussian(rng, 0, spread),
        y: cy + gaussian(rng, 0, spread),
        day: start + Math.floor(rng() * 20),
        campaign: c,
        label,
      });
    }
  }

  /** Láng giềng gần nhất — mô hình ghi nhớ, nên nó phơi bày rò rỉ rõ nhất. */
  const acc = (train: SplitPoint[], test: SplitPoint[]) => {
    if (!test.length || !train.length) return 0;
    let ok = 0;
    for (const t of test) {
      let best = Infinity;
      let lab: 0 | 1 = 0;
      for (const r of train) {
        const d = (r.x - t.x) ** 2 + (r.y - t.y) ** 2;
        if (d < best) {
          best = d;
          lab = r.label;
        }
      }
      if (lab === t.label) ok++;
    }
    return ok / test.length;
  };

  const shuffleRng = mulberry32(5);
  const shuffled = points
    .map((v) => ({ v, k: shuffleRng() }))
    .sort((a, b) => a.k - b.k)
    .map((o) => o.v);
  const cut = Math.floor(points.length * 0.7);
  const dayCut = Math.floor(SPLIT_DAYS * 0.7);
  const campCut = Math.floor(SPLIT_CAMPAIGNS * 0.7);

  return {
    points,
    dayCut,
    random: acc(shuffled.slice(0, cut), shuffled.slice(cut)),
    temporal: acc(points.filter((r) => r.day < dayCut), points.filter((r) => r.day >= dayCut)),
    group: acc(points.filter((r) => r.campaign < campCut), points.filter((r) => r.campaign >= campCut)),
  };
}

export function LabSplit() {
  const [spread, setSpread] = useState(0.03);
  const [signal, setSignal] = useState(0.6);

  const r = useMemo(() => splitComparison(spread, signal), [spread, signal]);
  const aoGiac = r.random - Math.max(r.temporal, r.group);
  const p = mkPlot(420, 300, [0, 1], [0, 1], { l: 40, r: 12, t: 12, b: 34 });

  return (
    <LabShell
      id="lab-split"
      title="Cùng một mô hình, ba cách chia tập, ba sự thật khác nhau"
      takeaway={
        <>
          Ở mặc định, cùng một mô hình cho ba con số: <b>96% khi chia ngẫu nhiên</b>, <b>59% khi chia theo
          thời gian</b>, <b>52% khi chia theo chiến dịch</b>. Không con số nào sai về mặt số học — chúng trả
          lời ba câu hỏi khác nhau, và chỉ hai câu sau là câu bạn thật sự quan tâm.
          <br />
          <br />
          Chia ngẫu nhiên thổi phồng vì mẫu của <b>cùng một chiến dịch</b> rơi vào cả hai bên. Mô hình không
          học cách nhận ra mã độc; nó học thuộc vị trí của từng chiến dịch, rồi được chấm điểm trên chính
          những chiến dịch nó đã thuộc. Kéo &ldquo;mức giống nhau trong chiến dịch&rdquo; xuống và khoảng cách
          thu hẹp lại ngay — vì lúc đó chẳng còn gì để học thuộc.
          <br />
          <br />
          Đây là cơ chế đằng sau vô số kết quả không tái lập được: <b>96% trong báo cáo, 59% khi chạy thật</b>.
          Con số 52% của chia theo nhóm còn khắc nghiệt hơn cả chia theo thời gian, vì nó bắt mô hình đối mặt
          với chiến dịch hoàn toàn mới — và đó chính là thứ sẽ tới vào tuần sau.
        </>
      }
    >
      <div className="grid grid-2">
        <Slider
          label="Mức giống nhau trong cùng chiến dịch"
          value={spread}
          min={0.02}
          max={0.14}
          step={0.005}
          onChange={setSpread}
          format={(v) => (v < 0.04 ? 'gần như trùng nhau' : v < 0.08 ? 'khá giống' : 'chỉ hơi giống')}
          hint="Một chiến dịch thật thường tung ra hàng nghìn biến thể gần trùng."
        />
        <Slider
          label="Tín hiệu khái quát hoá được"
          value={signal}
          min={0}
          max={2}
          step={0.1}
          onChange={setSignal}
          format={(v) => (v < 0.3 ? 'gần như không có' : v < 1 ? 'yếu, như thực tế' : 'mạnh')}
          hint="Phần quy luật đúng cho cả chiến dịch chưa từng thấy."
        />
      </div>

      <Chart p={p} label="Không gian đặc trưng: mỗi cụm là một chiến dịch">
        <Axes p={p} xLabel="Đặc trưng 1" yLabel="Đặc trưng 2" xTicks={4} yTicks={4} />
        {r.points.map((pt, i) => (
          <circle
            key={i}
            cx={px(p, clamp(pt.x, 0, 1))}
            cy={py(p, clamp(pt.y, 0, 1))}
            r={3}
            fill={pt.label ? COLORS.bad : COLORS.ok}
            opacity={pt.day >= r.dayCut ? 0.95 : 0.32}
          />
        ))}
      </Chart>
      <div className="faint center">Đậm = mẫu thuộc 30% ngày cuối, tức tập kiểm thử của cách chia theo thời gian</div>

      <Readout
        items={[
          { k: 'Chia ngẫu nhiên', v: `${(r.random * 100).toFixed(1)}%`, tone: 'bad', sub: 'con số ảo giác' },
          { k: 'Chia theo thời gian', v: `${(r.temporal * 100).toFixed(1)}%`, tone: 'ok', sub: 'mô hình còn dùng được bao lâu' },
          { k: 'Chia theo nhóm', v: `${(r.group * 100).toFixed(1)}%`, tone: 'ok', sub: 'gặp chiến dịch hoàn toàn mới' },
          { k: 'Mức thổi phồng', v: `${(aoGiac * 100).toFixed(1)} đp`, tone: aoGiac > 0.15 ? 'bad' : aoGiac > 0.05 ? 'warn' : 'ok' },
        ]}
      />

      <div className={`callout ${aoGiac > 0.15 ? 'co-warn' : 'co-pro'}`}>
        <Icon className="callout-icon" name={aoGiac > 0.15 ? 'siren' : 'check'} size={18} />
        <div>
          <div className="callout-title">
            {aoGiac > 0.15 ? 'Chia ngẫu nhiên đang nói dối bạn' : 'Ba cách chia đã gần nhau'}
          </div>
          <div className="callout-body">
            {aoGiac > 0.15
              ? `Chênh ${(aoGiac * 100).toFixed(1)} điểm phần trăm giữa con số bạn báo cáo và con số bạn sẽ gặp. Nguyên nhân không nằm ở mô hình mà ở chỗ mẫu cùng chiến dịch nằm ở cả hai bên ranh giới chia.`
              : `Khi mẫu trong cùng chiến dịch không còn gần trùng nhau, chẳng còn gì để học thuộc, nên ba cách chia hội tụ. Đó cũng là lý do rò rỉ khó thấy trên dữ liệu đồ chơi mà lại tàn phá trên dữ liệu bảo mật thật.`}
          </div>
        </div>
      </div>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-auth-graph — Đồ thị xác thực và di chuyển ngang                        */
/* ========================================================================== */

const AG_NODES = [
  'W1', 'W2', 'W3', 'W4', 'W5', 'W6',
  'S-web', 'S-db', 'S-app', 'S-file', 'S-mail', 'DC', 'FS',
] as const;

/** Đăng nhập bình thường: mỗi máy trạm chạm 1–2 máy chủ, ai cũng chạm FS và DC. */
const AG_BASE: [string, string][] = [
  ['W1', 'S-web'], ['W1', 'FS'], ['W2', 'S-app'], ['W2', 'FS'],
  ['W3', 'S-web'], ['W3', 'FS'], ['W4', 'S-mail'], ['W4', 'FS'],
  ['W5', 'S-app'], ['W5', 'FS'], ['W6', 'S-mail'], ['W6', 'FS'],
  ['S-web', 'DC'], ['S-db', 'DC'], ['S-app', 'DC'], ['S-file', 'DC'],
  ['S-mail', 'DC'], ['FS', 'DC'], ['S-db', 'S-app'],
];

/** W3 bị chiếm: các cạnh này chưa từng tồn tại trong 90 ngày trước. */
const AG_LATERAL: [string, string][] = [
  ['W3', 'S-db'], ['W3', 'S-app'], ['W3', 'S-file'], ['W3', 'S-mail'],
  ['W3', 'DC'], ['W3', 'W5'], ['W3', 'W2'], ['W3', 'W4'],
];

export interface AuthGraphOut {
  edges: [string, string][];
  pagerank: number[];
  /** Thứ hạng PageRank của W3, 1 là cao nhất. */
  rankW3: number;
  /** Bậc của W3 trong đồ thị đang xét. */
  degreeW3: number;
  newEdges: number;
  /** Ba nút đứng đầu bảng — gần như luôn là hạ tầng. */
  top3: string[];
}

/**
 * PageRank bằng lặp luỹ thừa, hệ số tắt dần 0,85.
 *
 * Tham số `undirected` không phải tuỳ chọn cho vui: nó ĐẢO NGƯỢC kết luận. Trên
 * đồ thị có hướng, PageRank đo tầm quan trọng CHẢY VÀO một nút, nên một máy trạm
 * càng chủ động kết nối ra thì thứ hạng càng TỤT (nó phát rank đi chứ không nhận
 * về). Coi mỗi lần xác thực là quan hệ hai chiều thì máy trạm bị chiếm mới leo
 * hạng như trực giác mong đợi. Đây chính là điều bài t6-l11 nói: quyết định nút
 * là gì và cạnh là gì ảnh hưởng tới kết quả nhiều hơn việc chọn thuật toán.
 */
export function authGraph(newEdges: number, undirected: boolean): AuthGraphOut {
  const edges: [string, string][] = [...AG_BASE, ...AG_LATERAL.slice(0, newEdges)];
  const idx = new Map(AG_NODES.map((n, i) => [n as string, i]));
  const n = AG_NODES.length;
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[idx.get(a)!].push(idx.get(b)!);
    if (undirected) adj[idx.get(b)!].push(idx.get(a)!);
  }

  const d = 0.85;
  let pr = new Array<number>(n).fill(1 / n);
  for (let it = 0; it < 60; it++) {
    const next = new Array<number>(n).fill((1 - d) / n);
    for (let i = 0; i < n; i++) {
      const out = adj[i];
      // Nút không có cạnh ra sẽ rò rỉ rank; rải đều cho cả đồ thị.
      if (!out.length) {
        for (let j = 0; j < n; j++) next[j] += (d * pr[i]) / n;
        continue;
      }
      for (const j of out) next[j] += (d * pr[i]) / out.length;
    }
    pr = next;
  }

  const order = AG_NODES.map((name, i) => ({ name, p: pr[i] })).sort((a, b) => b.p - a.p);
  return {
    edges,
    pagerank: pr,
    rankW3: order.findIndex((o) => o.name === 'W3') + 1,
    degreeW3: adj[idx.get('W3')!].length,
    newEdges,
    top3: order.slice(0, 3).map((o) => o.name),
  };
}

export function LabAuthGraph() {
  const [lateral, setLateral] = useState(0);
  const [undirected, setUndirected] = useState(true);

  const r = useMemo(() => authGraph(lateral, undirected), [lateral, undirected]);
  const goc = useMemo(() => authGraph(0, undirected), [undirected]);
  const doiHang = goc.rankW3 - r.rankW3;

  // Bố trí tròn: đủ để nhìn ra hình dạng mà không cần thuật toán dàn đồ thị.
  const R = 118;
  const pos = new Map(
    AG_NODES.map((name, i) => {
      const a = (i / AG_NODES.length) * Math.PI * 2 - Math.PI / 2;
      return [name as string, { x: 170 + R * Math.cos(a), y: 150 + R * Math.sin(a) }];
    }),
  );
  const laCanhMoi = (a: string, b: string) =>
    AG_LATERAL.slice(0, lateral).some(([x, y]) => x === a && y === b);

  return (
    <LabShell
      id="lab-auth-graph"
      title="Đồ thị xác thực — di chuyển ngang nhìn từ trên xuống"
      takeaway={
        <>
          Ba điều đáng mang đi. <b>Một:</b> ở 0 cạnh mới, ba nút đứng đầu bảng PageRank là FS, DC và S-app —
          hạ tầng, ngày nào cũng vậy. Cảnh báo theo thứ hạng tuyệt đối sẽ cho ra đúng một danh sách mỗi ngày và
          không mang tin gì. Thứ mang tin là <b>mức thay đổi thứ hạng của một nút so với chính nó</b>: kéo lên 6
          cạnh và W3 leo từ hạng 7 lên hạng 1.
          <br />
          <br />
          <b>Hai:</b> tắt &ldquo;quan hệ hai chiều&rdquo; và xem tín hiệu <b>đảo ngược</b> — W3 càng chạm nhiều
          máy thì thứ hạng càng TỤT (7 xuống 12). Không phải lỗi: trên đồ thị có hướng, PageRank đo tầm quan
          trọng chảy VÀO một nút, mà máy trạm bị chiếm thì chủ yếu kết nối RA. Chọn sai cách dựng đồ thị không
          làm bạn mất tín hiệu, nó làm bạn đọc ngược tín hiệu.
          <br />
          <br />
          <b>Ba:</b> ô &ldquo;bậc của W3&rdquo; đi lên đều đặn ở cả hai chế độ, không cần thuật toán nào. Với
          phần lớn tổ chức, đếm số đích riêng biệt so với trung vị 30 ngày của chính máy đó đã chiếm gần hết
          giá trị — hãy làm nó trước khi nghĩ tới embedding của nút hay mạng nơ-ron đồ thị.
        </>
      }
    >
      <div className="grid grid-2">
        <Slider
          label="Số cạnh di chuyển ngang"
          value={lateral}
          min={0}
          max={AG_LATERAL.length}
          step={1}
          onChange={setLateral}
          format={(v) => (v === 0 ? 'chưa có gì bất thường' : `${v} cạnh CHƯA TỪNG thấy`)}
          hint="Đây là các cặp (nguồn, đích) không xuất hiện trong 90 ngày trước."
        />
        <Toggle
          label="Coi mỗi lần xác thực là quan hệ hai chiều"
          checked={undirected}
          onChange={setUndirected}
        />
      </div>

      <svg viewBox="0 0 340 300" className="fig" role="img" aria-label="Đồ thị xác thực với các cạnh di chuyển ngang">
        {r.edges.map(([a, b], i) => {
          const pa = pos.get(a)!;
          const pb = pos.get(b)!;
          const moi = laCanhMoi(a, b);
          return (
            <line
              key={i}
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke={moi ? 'var(--bad)' : 'var(--border)'}
              strokeWidth={moi ? 2 : 1}
              strokeDasharray={moi ? '4 3' : undefined}
            />
          );
        })}
        {AG_NODES.map((name) => {
          const p0 = pos.get(name)!;
          const laW3 = name === 'W3';
          const laHaTang = name === 'DC' || name === 'FS';
          return (
            <g key={name}>
              <circle
                cx={p0.x} cy={p0.y}
                r={laW3 ? 13 : laHaTang ? 11 : 9}
                fill={laW3 ? 'var(--bad-soft)' : laHaTang ? 'var(--brand-soft)' : 'var(--bg-sunken)'}
                stroke={laW3 ? 'var(--bad)' : laHaTang ? 'var(--brand)' : 'var(--border)'}
                strokeWidth={laW3 ? 2.2 : 1.4}
              />
              <text
                x={p0.x} y={p0.y + 3.5}
                textAnchor="middle"
                className="svg-label"
                style={{ fontSize: 10, fontWeight: laW3 ? 700 : 500 }}
              >
                {name}
              </text>
            </g>
          );
        })}
      </svg>

      <Readout
        items={[
          { k: 'Bậc của W3', v: String(r.degreeW3), tone: r.degreeW3 > goc.degreeW3 * 2 ? 'bad' : 'neutral', sub: `bình thường là ${goc.degreeW3}` },
          { k: 'Hạng PageRank của W3', v: `${r.rankW3}/${AG_NODES.length}`, tone: r.rankW3 <= 3 ? 'bad' : 'neutral', sub: `trước đó hạng ${goc.rankW3}` },
          { k: 'Đổi hạng', v: `${doiHang > 0 ? '+' : ''}${doiHang}`, tone: doiHang > 2 ? 'bad' : doiHang < 0 ? 'warn' : 'neutral', sub: doiHang > 0 ? 'leo lên' : doiHang < 0 ? 'tụt xuống' : 'không đổi' },
          { k: 'Đứng đầu bảng', v: r.top3[0], tone: 'info', sub: `rồi ${r.top3.slice(1).join(', ')}` },
        ]}
      />

      <div className={`callout ${!undirected && lateral > 0 ? 'co-warn' : doiHang > 2 ? 'co-pro' : 'co-insight'}`}>
        <Icon className="callout-icon" name={!undirected && lateral > 0 ? 'siren' : 'lightbulb'} size={18} />
        <div>
          <div className="callout-title">
            {!undirected && lateral > 0
              ? 'Đồ thị có hướng đang cho bạn tín hiệu ngược'
              : doiHang > 2
                ? 'W3 đã trở thành điểm trung chuyển'
                : 'Chưa có gì nổi lên'}
          </div>
          <div className="callout-body">
            {!undirected && lateral > 0
              ? `W3 chạm thêm ${lateral} máy chưa từng chạm, nhưng thứ hạng PageRank của nó ${doiHang < 0 ? `TỤT ${-doiHang} bậc` : 'không leo lên'}. PageRank trên đồ thị có hướng đo tầm quan trọng chảy VÀO một nút; máy trạm bị chiếm thì chủ yếu kết nối RA nên nó phát rank đi chứ không nhận về. Bật lại quan hệ hai chiều để thấy tín hiệu đúng chiều.`
              : doiHang > 2
                ? `Bậc tăng từ ${goc.degreeW3} lên ${r.degreeW3} và thứ hạng leo ${doiHang} bậc lên vị trí ${r.rankW3}. Một máy trạm kế toán không có lý do gì để trở nên trung tâm như hạ tầng — đó là hình dạng của một máy đang bị dùng làm bàn đạp.`
                : `Ở mức này W3 vẫn lẫn trong đám đông. Kéo thanh trượt lên và để ý ô "đổi hạng" chứ không phải ô "hạng": FS và DC luôn đứng đầu, nên con số tuyệt đối không bao giờ là tín hiệu.`}
          </div>
        </div>
      </div>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-seasonality — Phân rã thành phần mùa và cái bẫy tự nâng mức nền                */
/* ========================================================================== */

/** 6 tuần dữ liệu theo giờ. Chu kỳ mùa là TUẦN (24 × 7 = 168 giờ). */
const SEA_WEEKS = 6;
const SEA_H = 168;
/** 3h sáng Chủ nhật — khung giờ vắng nhất tuần, nên là chỗ kẻ tấn công thích. */
const SEA_ATTACK_I = 6 * 24 + 3;
/** Ngưỡng cảnh báo theo điểm z, cố định để so sánh hai chế độ cho công bằng. */
const SEA_THR = 4;

const median = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
};

export interface SeasonalOut {
  series: number[];
  /** Mức nền ước lượng cho từng khung giờ trong tuần, đã đưa về thang gốc. */
  seasonal: number[];
  z: number[];
  /** Điểm z của lần tấn công CUỐI CÙNG — con số lab in ra. */
  zAttack: number;
  baseAttackHour: number;
  falseAlarms: number;
  detected: boolean;
  attackIdx: number[];
}

/**
 * Phân rã theo khung giờ trong tuần rồi chấm điểm phần dư.
 *
 * Hai chi tiết quyết định lab này nói thật hay nói dối:
 *
 * 1. NHIỄU NHÂN TÍNH. Khối lượng log biến thiên theo tỉ lệ chứ không theo lượng
 *    tuyệt đối, nên nhiễu phải nhân chứ không cộng. Bản đầu dùng nhiễu cộng và
 *    hệ quả là phương sai phần dư trong không gian log to hẳn ở khung giờ vắng,
 *    tạo 18 báo động giả cố định chẳng liên quan gì tới bài học.
 * 2. LẤY LOG TRƯỚC KHI PHÂN RÃ. Đúng như đoạn mã trong bài t6-l10; nhờ vậy mô
 *    hình cộng tính mới áp dụng được và một thang đo chung mới có nghĩa.
 */
export function seasonalRun(attack: number, weeksInfected: number, robust: boolean): SeasonalOut {
  const rng = mulberry32(4242);
  const firstInfected = SEA_WEEKS - weeksInfected;
  const series: number[] = [];
  const attackIdx: number[] = [];

  for (let t = 0; t < SEA_WEEKS * SEA_H; t++) {
    const i = t % SEA_H;
    const h = i % 24;
    const d = Math.floor(i / 24);
    // Nhịp ngày đỉnh lúc 13h, nhịp tuần: cuối tuần còn khoảng một phần năm.
    const base = 780 * (0.12 + 0.88 * Math.exp(-((h - 13) ** 2) / 32)) * (d < 5 ? 1 : 0.22) + 9;
    let x = base * Math.exp(gaussian(rng, 0, 0.16));
    if (Math.floor(t / SEA_H) >= firstInfected && i === SEA_ATTACK_I) {
      x += attack;
      attackIdx.push(t);
    }
    series.push(Math.max(0, x));
  }

  const y = series.map((v) => Math.log1p(v));
  const seasonalLog: number[] = [];
  for (let i = 0; i < SEA_H; i++) {
    const cycle: number[] = [];
    for (let w = 0; w < SEA_WEEKS; w++) cycle.push(y[w * SEA_H + i]);
    // Trung vị chịu được tới 50% dữ liệu bị nhiễm; trung bình thì không chịu nổi
    // một điểm nào — đó là toàn bộ khác biệt giữa hai chế độ.
    seasonalLog.push(robust ? median(cycle) : cycle.reduce((a, b) => a + b, 0) / cycle.length);
  }

  const resid = y.map((v, t) => v - seasonalLog[t % SEA_H]);
  let centre: number;
  let scale: number;
  if (robust) {
    centre = median(resid);
    scale = 1.4826 * median(resid.map((v) => Math.abs(v - centre)));
  } else {
    centre = resid.reduce((a, b) => a + b, 0) / resid.length;
    scale = Math.sqrt(resid.reduce((a, b) => a + (b - centre) ** 2, 0) / resid.length);
  }
  const z = resid.map((v) => (v - centre) / (scale || 1e-9));

  const lastAttack = attackIdx.length ? attackIdx[attackIdx.length - 1] : -1;
  return {
    series,
    seasonal: seasonalLog.map((v) => Math.expm1(v)),
    z,
    zAttack: lastAttack >= 0 ? z[lastAttack] : 0,
    baseAttackHour: Math.expm1(seasonalLog[SEA_ATTACK_I]),
    falseAlarms: z.filter((v, t) => v > SEA_THR && !attackIdx.includes(t)).length,
    detected: lastAttack >= 0 && z[lastAttack] > SEA_THR,
    attackIdx,
  };
}

export function LabSeasonality() {
  const [attack, setAttack] = useState(150);
  const [weeksInfected, setWeeks] = useState(2);
  const [robust, setRobust] = useState(false);

  const r = useMemo(() => seasonalRun(attack, weeksInfected, robust), [attack, weeksInfected, robust]);

  // Vẽ hai tuần cuối: đủ để thấy nhịp tuần lặp lại và thấy đỉnh tấn công.
  const from = (SEA_WEEKS - 2) * SEA_H;
  const view = r.series.slice(from);
  const seasonalView = view.map((_, k) => r.seasonal[(from + k) % SEA_H]);
  const yMax = Math.max(...view) * 1.08;
  const p = mkPlot(560, 260, [0, view.length], [0, yMax], { l: 52, r: 14, t: 14, b: 38 });

  return (
    <LabShell
      id="lab-seasonality"
      title="Phân rã thành phần mùa — và cuộc tấn công tự nâng mức nền của chính nó"
      takeaway={
        <>
          Ở mặc định (tấn công +150 sự kiện, lặp lại 2 trong 6 tuần), chế độ <b>cổ điển</b> ước lượng mức nền
          của khung giờ 3h sáng Chủ nhật là khoảng 65 sự kiện — nhưng mức nền thật chỉ khoảng 46. Chính cuộc
          tấn công đã kéo con số đó lên, vì trung bình cộng tính cả những tuần bị nhiễm vào định nghĩa
          &ldquo;bình thường&rdquo;. Hệ quả: điểm z của nó tụt còn khoảng 6,9. Bật <b>chế độ bền vững</b> và
          mức nền trở về 46, điểm z nhảy lên khoảng 11,4 — cùng một cuộc tấn công, nổi bật hơn gấp rưỡi.
          Kéo cỡ tấn công xuống 50 để thấy hậu quả thật: cổ điển cho z ≈ 3,9 và <b>bỏ lọt</b>, bền vững cho
          z ≈ 5,3 và bắt được.
          <br />
          <br />
          Rồi kéo &ldquo;số tuần bị nhiễm&rdquo; lên 5 và xem cả hai chế độ cùng thua. Trung vị chịu được tới
          một nửa dữ liệu bị nhiễm, không hơn. Kẻ tấn công đủ kiên nhẫn để có mặt trong phần lớn lịch sử sẽ
          dạy được hệ thống rằng mình là bình thường — và <b>chế độ bền vững không cứu được điều đó</b>. Chống
          nó cần thứ khác: neo đường cơ sở vào một khoảng lịch sử đã được kiểm định, và cảnh báo riêng khi
          chính đường cơ sở dịch chuyển.
        </>
      }
    >
      <div className="grid grid-2">
        <Slider
          label="Cỡ đợt tấn công"
          value={attack}
          min={0}
          max={600}
          step={10}
          onChange={setAttack}
          format={(v) => `+${v} sự kiện lúc 3h sáng CN`}
          hint="Mức nền thật của khung giờ đó chỉ khoảng 46 sự kiện."
        />
        <Slider
          label="Số tuần bị nhiễm"
          value={weeksInfected}
          min={1}
          max={5}
          step={1}
          onChange={setWeeks}
          format={(v) => `${v}/${SEA_WEEKS} tuần cuối`}
          hint="Kẻ tấn công lặp lại càng nhiều tuần thì càng dạy được đường cơ sở."
        />
      </div>

      <Toggle
        label="Chế độ bền vững (trung vị cho thành phần mùa + MAD cho thang đo)"
        checked={robust}
        onChange={setRobust}
      />

      <Chart p={p} label="Hai tuần cuối: khối lượng thật và mức nền ước lượng">
        <Axes
          p={p}
          xLabel="Giờ (hai tuần cuối)"
          yLabel="Số lần đăng nhập thất bại"
          xTicks={4}
          yTicks={4}
          fmtX={(v) => `${Math.round(v / 24)}d`}
          fmtY={(v) => String(Math.round(v))}
        />
        <Line p={p} pts={seasonalView.map((v, k) => [k, v] as [number, number])} color={COLORS.warn} width={1.8} dash="5 4" />
        <Line p={p} pts={view.map((v, k) => [k, v] as [number, number])} color={COLORS.brand} width={1.6} />
      </Chart>

      <Readout
        items={[
          {
            k: 'Mức nền ước lượng cho 3h CN',
            v: r.baseAttackHour.toFixed(0),
            tone: r.baseAttackHour > 60 ? 'bad' : 'ok',
            sub: 'sự thật là khoảng 46',
          },
          {
            k: 'Điểm z của đợt tấn công',
            v: r.zAttack.toFixed(1),
            tone: r.detected ? 'ok' : 'bad',
            sub: `ngưỡng cảnh báo ${SEA_THR}`,
          },
          {
            k: 'Kết quả',
            v: r.detected ? 'BẮT ĐƯỢC' : 'BỎ LỌT',
            tone: r.detected ? 'ok' : 'bad',
          },
          {
            k: 'Báo động giả',
            v: String(r.falseAlarms),
            tone: r.falseAlarms <= 2 ? 'ok' : 'warn',
            sub: `trên ${SEA_WEEKS * SEA_H} giờ`,
          },
        ]}
      />

      <div className={`callout ${r.detected ? 'co-pro' : 'co-warn'}`}>
        <Icon className="callout-icon" name={r.detected ? 'shield' : 'siren'} size={18} />
        <div>
          <div className="callout-title">
            {r.detected ? 'Đợt tấn công nổi lên trên phần dư' : 'Đợt tấn công chìm vào mức nền'}
          </div>
          <div className="callout-body">
            {r.detected
              ? `Mức nền ước lượng ${r.baseAttackHour.toFixed(0)} so với sự thật khoảng 46, nên phần dư còn đủ lớn để vượt ngưỡng: z = ${r.zAttack.toFixed(1)}.`
              : `Mức nền của chính khung giờ bị tấn công đã bị kéo lên ${r.baseAttackHour.toFixed(0)} (thật ra khoảng 46), nên phần dư co lại và z chỉ còn ${r.zAttack.toFixed(1)} — dưới ngưỡng ${SEA_THR}. Cuộc tấn công đã tự dạy hệ thống rằng nó là bình thường.`}
          </div>
        </div>
      </div>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-entity — Hợp nhất thực thể: đếm trên dữ liệu bẩn                       */
/* ========================================================================== */

/** 8 máy trạm + 4 máy chủ. Chỉ số mảng là định danh THẬT của máy. */
const ENT_MACHINES = [
  'PC01', 'PC02', 'PC03', 'PC04', 'PC05', 'PC06', 'PC07', 'PC08',
  'SRV-FILE', 'SRV-APP', 'SRV-MAIL', 'DC01',
] as const;

/** Bể DHCP rộng hơn số máy — IP nhàn rỗi hôm nay có thể thuộc máy khác ngày mai. */
const ENT_POOL = Array.from({ length: 18 }, (_, i) => `10.20.3.${40 + i}`);

/** 10 người dùng thường + 1 tài khoản bị chiếm (chỉ số 10). */
const ENT_NAMES = ['lan', 'minh', 'hoa', 'tuan', 'thu', 'nam', 'quyen', 'dung', 'vy', 'khoa', 'hai'] as const;
const ENT_ATTACKER = 10;
const ENT_FOCAL = 1; // "minh" — nhân vật trong bài học, 3 máy thật

interface EntityEvent {
  user: number;
  machine: number;
  hour: number;
  alias: string;
  /** Máy xuất hiện trong log dưới dạng nào. */
  rep: 'short' | 'fqdn' | 'ip';
}

export interface EntityRow {
  /** Chuỗi tài khoản như analyst nhìn thấy sau khi (không) chuẩn hoá. */
  key: string;
  owner: number;
  isAttacker: boolean;
  count: number;
}

export interface EntityOut {
  /** Mỗi chuỗi tài khoản một dòng, xếp giảm dần theo số máy đếm được. */
  rows: EntityRow[];
  alerts: number;
  falseAlerts: number;
  attackerCaught: boolean;
  /** Hạng của dòng thuộc kẻ tấn công đứng cao nhất, 1 là đầu bảng. */
  attackerRank: number;
  /** Số sự kiện dạng IP bị bảng tĩnh gán vào SAI máy (chỉ ipMode 1). */
  misattributed: number;
  ipEvents: number;
  /** Số máy đếm được cho "minh" (lấy dòng cao nhất trong các bí danh của minh). */
  focalCount: number;
  focalTruth: number;
  attackerTruth: number;
  totalEvents: number;
}

/** Bốn dạng viết của cùng một tài khoản — đúng danh sách trong bài học. */
const entAliases = (name: string): string[] => [
  'CORP\\' + name, name, name.toUpperCase(), `${name}@corp.vn`,
];

/** Máy thật của từng người dùng thường: 1 máy trạm + 1–3 máy chủ/máy khác. */
function entMachinesOf(u: number): number[] {
  if (u === ENT_ATTACKER) return [2, 0, 1, 3, 4, 8, 9, 11];
  const n = 2 + (u % 3);
  const set = [u % 8, 8 + (u % 4)];
  if (n >= 3) set.push(8 + ((u + 2) % 4));
  if (n >= 4) set.push((u + 4) % 8);
  return [...new Set(set)];
}

/**
 * Sinh nhật ký đăng nhập của một ngày làm việc. Dòng ngẫu nhiên này KHÔNG phụ
 * thuộc leaseHours — đổi nhịp DHCP chỉ đổi cách phân giải IP, không đổi hành vi
 * người dùng, nên các thanh trượt tách bạch được từng hiệu ứng.
 */
function entEvents(): EntityEvent[] {
  const rng = mulberry32(42);
  const out: EntityEvent[] = [];
  for (let u = 0; u < ENT_NAMES.length; u++) {
    const forms = entAliases(ENT_NAMES[u]).slice(0, 2 + ((u * 7) % 3));
    for (const m of entMachinesOf(u)) {
      // Người dùng thường ngồi cả ngày trên vài máy — nhiều sự kiện mỗi máy.
      // Kẻ di chuyển ngang chạm mỗi máy MỘT lần, vài sự kiện rồi đi tiếp: dấu
      // chân trên từng máy mỏng hơn hẳn, và đó là lý do phép tách bí danh
      // (không hợp nhất) đủ sức nhấn chìm hắn xuống dưới ngưỡng.
      const sessions = u === ENT_ATTACKER ? 1 : 1 + (rng() < 0.4 ? 1 : 0);
      for (let s = 0; s < sessions; s++) {
        const hour = u === ENT_ATTACKER ? rng() * 5 : 8 + rng() * 10;
        const events = u === ENT_ATTACKER ? 1 + Math.floor(rng() * 2) : 2 + Math.floor(rng() * 3);
        for (let e = 0; e < events; e++) {
          const roll = rng();
          out.push({
            user: u,
            machine: m,
            hour,
            alias: forms[Math.floor(rng() * forms.length)],
            rep: roll < 0.4 ? 'ip' : roll < 0.7 ? 'short' : 'fqdn',
          });
        }
      }
    }
  }
  return out;
}

/**
 * Đếm "số máy khác nhau mà một tài khoản đăng nhập trong 24 giờ" trên cùng một
 * nhật ký, với từng bước làm sạch bật/tắt được.
 *
 * ipMode: 0 = không ánh xạ IP (IP là "máy" riêng), 1 = bảng tĩnh chụp cuối ngày
 * (không có chiều thời gian), 2 = ánh xạ theo khoảng thời gian thuê DHCP.
 */
export function entityRun(
  leaseHours: number,
  threshold: number,
  mergeAlias: boolean,
  mergeHost: boolean,
  ipMode: 0 | 1 | 2,
): EntityOut {
  const events = entEvents();

  // Mỗi kỳ thuê, DHCP xáo lại toàn bộ ánh xạ máy -> IP. Dòng ngẫu nhiên riêng
  // để leaseHours không làm rung phần hành vi người dùng ở trên.
  const epochs = Math.max(1, Math.ceil(24 / leaseHours));
  const ipRng = mulberry32(777);
  const epochIp: number[][] = [];
  for (let e = 0; e < epochs; e++) {
    epochIp.push(shuffle(ENT_POOL.map((_, i) => i), ipRng).slice(0, ENT_MACHINES.length));
  }
  const ipOf = (m: number, hour: number) => ENT_POOL[epochIp[Math.min(epochs - 1, Math.floor(hour / leaseHours))][m]];
  // Bảng tĩnh: ai giữ IP nào ở kỳ thuê CUỐI ngày — đúng kiểu bảng xuất một lần
  // từ DHCP rồi dùng cho cả ngày log.
  const staticTable = new Map<string, number>();
  epochIp[epochs - 1].forEach((ipIdx, m) => staticTable.set(ENT_POOL[ipIdx], m));

  const hostKey = (m: number, form: 'short' | 'fqdn') =>
    mergeHost ? ENT_MACHINES[m] : form === 'short' ? ENT_MACHINES[m] : `${ENT_MACHINES[m].toLowerCase()}.corp.vn`;

  let misattributed = 0;
  let ipEvents = 0;
  const byAccount = new Map<string, { owner: number; machines: Set<string> }>();

  for (const ev of events) {
    const account = mergeAlias ? `SID-${ev.user}` : ev.alias;
    let mk: string;
    if (ev.rep === 'ip') {
      ipEvents++;
      const ip = ipOf(ev.machine, ev.hour);
      if (ipMode === 0) {
        mk = ip;
      } else if (ipMode === 1) {
        const resolved = staticTable.get(ip);
        if (resolved === undefined) {
          mk = ip;
        } else {
          if (resolved !== ev.machine) misattributed++;
          mk = hostKey(resolved, 'short');
        }
      } else {
        mk = hostKey(ev.machine, 'short');
      }
    } else {
      mk = hostKey(ev.machine, ev.rep);
    }
    let acc = byAccount.get(account);
    if (!acc) {
      acc = { owner: ev.user, machines: new Set() };
      byAccount.set(account, acc);
    }
    acc.machines.add(mk);
  }

  const rows: EntityRow[] = [...byAccount.entries()]
    .map(([key, a]) => ({ key, owner: a.owner, isAttacker: a.owner === ENT_ATTACKER, count: a.machines.size }))
    .sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : 1));

  const alertRows = rows.filter((r) => r.count >= threshold);
  const attackerRank = rows.findIndex((r) => r.isAttacker) + 1;

  return {
    rows,
    alerts: alertRows.length,
    falseAlerts: alertRows.filter((r) => !r.isAttacker).length,
    attackerCaught: alertRows.some((r) => r.isAttacker),
    attackerRank,
    misattributed,
    ipEvents,
    focalCount: Math.max(...rows.filter((r) => r.owner === ENT_FOCAL).map((r) => r.count)),
    focalTruth: entMachinesOf(ENT_FOCAL).length,
    attackerTruth: entMachinesOf(ENT_ATTACKER).length,
    totalEvents: events.length,
  };
}

export function LabEntity() {
  const [threshold, setThreshold] = useState(6);
  const [ipMode, setIpMode] = useState(0);
  const [leaseHours, setLeaseHours] = useState(4);
  const [mergeAlias, setMergeAlias] = useState(false);
  const [mergeHost, setMergeHost] = useState(false);

  const r = useMemo(
    () => entityRun(leaseHours, threshold, mergeAlias, mergeHost, ipMode as 0 | 1 | 2),
    [leaseHours, threshold, mergeAlias, mergeHost, ipMode],
  );

  const pieces = r.rows.filter((x) => x.isAttacker).map((x) => x.count);
  const clean = r.attackerCaught && r.falseAlerts === 0;
  const top = r.rows.slice(0, 12);

  return (
    <LabShell
      id="lab-entity"
      title="Đếm trên dữ liệu bẩn: một ngày log, hai kết luận"
      takeaway={
        <>
          Ở trạng thái mở đầu — chưa làm sạch gì — SIEM hôm nay phát đúng <b>một cảnh báo, và là cảnh báo
          oan</b>: “minh” bị đếm 6 “máy” trong khi sự thật là 3. Còn “hai”, kẻ đã chạm 8 máy trong một đêm,
          được chính dữ liệu bẩn che giấu: 8 máy tách qua ba bí danh thành 5 + 4 + 1, không mảnh nào chạm
          ngưỡng. Dữ liệu bẩn không trung lập — nó <b>tố oan người vô can và tha bổng kẻ có tội trong cùng
          một bảng</b>.
          <br />
          <br />
          Bật đủ ba bước làm sạch, cũng nhật ký đó nói ngược lại: một cảnh báo, đúng người, đúng 8 máy.
          Nhưng đường đi ở giữa không phẳng. Chỉ hợp nhất bí danh mà chưa chuẩn hoá máy thì ra <b>8 cảnh báo
          với 7 oan</b> — gộp tài khoản dồn toàn bộ phần đếm trùng máy vào một chỗ và đẩy hàng loạt người
          thường vượt ngưỡng. Còn bảng IP tĩnh nhìn tổng thể có vẻ ổn, nhưng gán <b>38/54 sự kiện IP vào sai
          máy</b>: con số gần đúng, danh tính sai — kiểu lỗi làm hỏng một cuộc điều tra chứ không chỉ một chỉ
          số. Mọi đặc trưng đếm (“số máy”, “số tài khoản”, “số IP”) của các chặng sau đều đứng trên bước hợp
          nhất này: làm sai nó, mô hình học trên tiểu thuyết.
        </>
      }
    >
      <div className="grid grid-3">
        <Slider
          label="Ngưỡng cảnh báo"
          value={threshold}
          min={4}
          max={8}
          step={1}
          onChange={setThreshold}
          format={(v) => `≥ ${v} máy / 24h`}
          hint="Luật phát hiện di chuyển ngang: một tài khoản đăng nhập vào quá nhiều máy trong một ngày."
        />
        <Slider
          label="Ánh xạ IP sang máy"
          value={ipMode}
          min={0}
          max={2}
          step={1}
          onChange={setIpMode}
          format={(v) => (v === 0 ? 'không ánh xạ' : v === 1 ? 'bảng tĩnh cuối ngày' : 'theo khoảng thời gian')}
          hint="Bảng tĩnh: chụp trạng thái DHCP một lần rồi dùng tra cho cả ngày log."
        />
        <Slider
          label="DHCP cấp lại IP mỗi"
          value={leaseHours}
          min={2}
          max={24}
          step={2}
          onChange={setLeaseHours}
          format={(v) => `${v} giờ`}
          hint="Kéo lên 24 giờ: IP đứng yên cả ngày và bảng tĩnh hết sai."
        />
      </div>
      <div className="grid grid-2">
        <Toggle label="Hợp nhất bí danh tài khoản về SID" checked={mergeAlias} onChange={setMergeAlias} />
        <Toggle label="Chuẩn hoá hostname / FQDN về một tên máy" checked={mergeHost} onChange={setMergeHost} />
      </div>

      <Bars
        data={top.map((row) => ({
          label: row.key,
          v: row.count,
          color: row.isAttacker ? COLORS.bad : row.count >= threshold ? COLORS.warn : COLORS.ok,
        }))}
        color={COLORS.ok}
        height={150}
        fmt={(v) => String(v)}
      />
      <div className="faint center">
        Mỗi cột là một CHUỖI tài khoản đúng như SIEM nhìn thấy ({top.length} dòng cao nhất trong{' '}
        {r.rows.length}). Đỏ = bí danh của tài khoản bị chiếm “hai” · vàng = vượt ngưỡng, tức một cảnh báo.
      </div>

      <Readout
        items={[
          {
            k: 'Cảnh báo hôm nay',
            v: String(r.alerts),
            sub: r.falseAlerts > 0 ? `trong đó ${r.falseAlerts} oan` : 'không có cảnh báo oan',
            tone: r.falseAlerts > 0 ? 'bad' : r.alerts > 0 ? 'ok' : 'warn',
          },
          {
            k: 'Kẻ tấn công (8 máy thật)',
            v: r.attackerCaught ? 'bị bắt' : 'lọt lưới',
            sub: `dòng cao nhất của hắn: hạng ${r.attackerRank}`,
            tone: r.attackerCaught ? 'ok' : 'bad',
          },
          {
            k: 'Số máy đếm cho “minh”',
            v: String(r.focalCount),
            sub: `sự thật: ${r.focalTruth} máy`,
            tone: r.focalCount > r.focalTruth ? 'warn' : 'ok',
          },
          {
            k: 'Sự kiện IP gán nhầm máy',
            v: `${r.misattributed}/${r.ipEvents}`,
            sub: ipMode === 1 ? 'cái giá của bảng không có thời gian' : 'chỉ xảy ra với bảng tĩnh',
            tone: r.misattributed > 0 ? 'bad' : 'ok',
          },
        ]}
      />

      <div className={`callout ${clean ? 'co-pro' : 'co-warn'}`}>
        <Icon className="callout-icon" name={clean ? 'check' : 'siren'} size={18} />
        <div>
          <div className="callout-title">
            {clean
              ? 'Một cảnh báo, đúng người, đúng con số'
              : r.attackerCaught
                ? 'Bắt được, nhưng chìm giữa cảnh báo oan'
                : 'Kẻ tấn công vô hình'}
          </div>
          <div className="callout-body">
            {clean
              ? `“hai” hiện nguyên hình với đúng ${r.attackerTruth} máy trong một đêm, “minh” về đúng ${r.focalTruth} máy, không ai bị tố oan. Không thuật toán nào được nâng cấp — chỉ có dữ liệu được đếm đúng.`
              : r.attackerCaught
                ? `Dòng của “hai” đứng hạng ${r.attackerRank}, nhưng đi kèm ${r.falseAlerts} cảnh báo oan trên tổng ${r.alerts}. Analyst xử lý từ trên xuống sẽ tiêu thời gian cho người vô can trước khi chạm tới kẻ thật.`
                : `${r.attackerTruth} máy thật của “hai” bị tách qua các bí danh thành ${pieces.join(' + ')}, không mảnh nào chạm ngưỡng ${threshold}.` +
                  (r.falseAlerts > 0
                    ? ` Trong khi đó ${r.falseAlerts} tài khoản vô can lại vượt ngưỡng nhờ máy bị đếm trùng — cảnh báo duy nhất hôm nay là cảnh báo oan.`
                    : ' Hôm nay SOC im lặng — và đó là cái im lặng sai.')}
          </div>
        </div>
      </div>
    </LabShell>
  );
}

/* ========================================================================== */
/*  lab-labels — Ngưỡng đa engine và cửa sổ chín muồi nhãn                     */
/* ========================================================================== */

/**
 * MÔ PHỎNG, không phải dữ liệu VirusTotal thật.
 *
 * Không có cách nào chạy 70 engine AV trong trình duyệt, nên đây là mô hình
 * động lực phát hiện: số engine nhận ra một mẫu tăng theo tuổi mẫu, nhanh với
 * họ đã phổ biến và chậm với họ mới; còn báo động giả trên phần mềm lành thì
 * gần như không đổi theo thời gian. Ba tính chất đó đều lấy từ mô tả trong bài
 * học, và lab chỉ khẳng định về CƠ CHẾ và CHIỀU biến đổi — đừng đọc con số ở
 * đây như số đo của một mô hình cụ thể trên VirusTotal thật.
 */
const LBL_N = 600;
const LBL_ENGINES = 70;
/** Mốc coi như nhãn đã chín hẳn, dùng làm mốc so cho "nhãn còn sẽ đổi". */
const LBL_MATURE = 60;

interface LblFile {
  evil: boolean;
  /** Họ mã độc mới xuất hiện: engine nhận ra chậm và ít. */
  novel: boolean;
  plateau: number;
  tau: number;
  /** Số engine báo động giả trên mẫu lành — coi như không đổi theo thời gian. */
  fp: number;
  jitter: number;
}

export interface LabelPoint {
  thr: number;
  precision: number;
  recallCommon: number;
  recallNovel: number;
  /**
   * Số nhãn dương ở ngưỡng này. Nơi vẽ PHẢI bỏ các điểm bằng 0: `precision`
   * khi đó là 0 theo quy ước, và vẽ nó thành một điểm trên trục 0% nói rằng
   * "nhãn dương của bạn sai hết", trong khi sự thật là không có nhãn dương nào.
   */
  positives: number;
}

export interface LabelOut {
  /** Số mẫu được gán nhãn độc, tính ở đúng cửa sổ chín muồi đang chọn. */
  positives: number;
  /**
   * Bằng 0 khi KHÔNG có nhãn dương nào (ngưỡng cao + cửa sổ ngắn). Nơi hiển thị
   * phải kiểm `positives` trước: in "độ sạch 0%" cho một bảng nhãn không có lớp
   * dương là nói sai hẳn bản chất — không phải nhãn bẩn, mà là không có nhãn.
   */
  precision: number;
  recall: number;
  recallCommon: number;
  recallNovel: number;
  /** Tỉ lệ mã độc THẬT nằm lẫn trong nhãn âm — nhiễu bất đối xứng. */
  negNoise: number;
  /**
   * Tỉ lệ mẫu mà nhãn ở cửa sổ đang chọn CÒN sẽ đổi nữa, so với nhãn ở mốc đã
   * chín hẳn (60 ngày). Đây là con số bài học khuyên đo: truy vấn lại nhãn sau
   * một thời gian và ghi lại bao nhiêu phần trăm đã đổi.
   */
  churn: number;
  curve: LabelPoint[];
  evilTotal: number;
  novelTotal: number;
}

/** Kho mẫu cố định: thanh trượt KHÔNG được phép sinh lại kho, chỉ đọc lại nó. */
function lblCorpus(): LblFile[] {
  const rng = mulberry32(2016);
  const out: LblFile[] = [];
  for (let i = 0; i < LBL_N; i++) {
    const evil = rng() < 0.45;
    const jitter = (rng() - 0.5) * 3;
    if (evil) {
      const novel = rng() < 0.35;
      out.push(
        novel
          ? { evil, novel, plateau: 5 + rng() * 15, tau: 8 + rng() * 20, fp: 0, jitter }
          : { evil, novel, plateau: 16 + rng() * 42, tau: 1.2 + rng() * 2.3, fp: 0, jitter },
      );
    } else {
      // Đuôi phải là trình cài đặt, công cụ quản trị, tệp nén bảo vệ — thứ bị
      // vài engine gắn cờ vĩnh viễn. Đây là lý do ngưỡng 1 engine không dùng được.
      const r = rng();
      const fp = r < 0.7 ? 0 : r < 0.88 ? 1 + Math.floor(rng() * 2) : r < 0.97 ? 3 + Math.floor(rng() * 3) : 6 + Math.floor(rng() * 7);
      out.push({ evil, novel: false, plateau: 0, tau: 1, fp, jitter: 0 });
    }
  }
  return out;
}

/** Số engine báo độc khi mẫu đã tồn tại `age` ngày. */
function lblDetections(f: LblFile, age: number): number {
  if (!f.evil) return f.fp;
  const grown = f.plateau * (1 - Math.exp(-(age + 0.5) / f.tau)) + f.jitter;
  return clamp(Math.round(grown), 0, LBL_ENGINES);
}

/**
 * Gán nhãn cả kho bằng quy tắc "từ `threshold` engine trở lên là độc", đo ở
 * thời điểm mẫu đã chín `maturityDays` ngày, rồi đối chiếu với sự thật.
 */
export function labelRun(threshold: number, maturityDays: number): LabelOut {
  const corpus = lblCorpus();

  const measure = (thr: number, age: number) => {
    let pos = 0;
    let tp = 0;
    let evil = 0;
    let evilNeg = 0;
    let common = 0;
    let commonTp = 0;
    let novel = 0;
    let novelTp = 0;
    for (const f of corpus) {
      const labelled = lblDetections(f, age) >= thr;
      if (labelled) pos++;
      if (f.evil) {
        evil++;
        if (labelled) tp++;
        else evilNeg++;
        if (f.novel) {
          novel++;
          if (labelled) novelTp++;
        } else {
          common++;
          if (labelled) commonTp++;
        }
      }
    }
    const neg = LBL_N - pos;
    return {
      positives: pos,
      precision: pos ? tp / pos : 0,
      recall: evil ? tp / evil : 0,
      recallCommon: common ? commonTp / common : 0,
      recallNovel: novel ? novelTp / novel : 0,
      negNoise: neg ? evilNeg / neg : 0,
      evilTotal: evil,
      novelTotal: novel,
    };
  };

  const now = measure(threshold, maturityDays);

  // Nhãn còn sẽ đổi: so nhãn ở cửa sổ đang chọn với nhãn ở mốc đã chín hẳn.
  // Không so với mốc 0 ngày: khi cửa sổ bằng 0 thì phép so đó bằng 0 theo đúng
  // định nghĩa, và một ô số chết ngay ở trạng thái mở đầu thì dạy được gì.
  let changed = 0;
  for (const f of corpus) {
    if ((lblDetections(f, maturityDays) >= threshold) !== (lblDetections(f, LBL_MATURE) >= threshold)) changed++;
  }

  const curve: LabelPoint[] = [];
  for (let thr = 1; thr <= 20; thr++) {
    const m = measure(thr, maturityDays);
    curve.push({
      thr,
      precision: m.precision,
      recallCommon: m.recallCommon,
      recallNovel: m.recallNovel,
      positives: m.positives,
    });
  }

  return { ...now, churn: changed / LBL_N, curve };
}

export function LabLabels() {
  const [threshold, setThreshold] = useState(5);
  const [maturity, setMaturity] = useState(0);

  const r = useMemo(() => labelRun(threshold, maturity), [threshold, maturity]);

  const p = mkPlot(470, 280, [1, 20], [0, 1], { l: 46, r: 14, t: 14, b: 38 });
  const lanhTrongDuong = Math.round(r.positives * (1 - r.precision));
  const moiDung = Math.round(r.recallNovel * r.novelTotal);

  // Ca biên phải xét TRƯỚC: ngưỡng cao cộng cửa sổ ngắn cho 0 nhãn dương, và
  // khi đó `precision` bằng 0 theo quy ước — đọc thẳng nó sẽ báo "nhãn dương
  // nhiễm phần mềm lành" cho một bảng nhãn không có lấy một nhãn dương.
  const khongNhan = r.positives === 0;
  const trangThai = khongNhan
    ? 'khong-nhan'
    : r.precision < 0.8
      ? 'nhiem'
      : r.recallNovel < 0.3
        ? r.churn > 0.05
          ? 'chua-chin'
          : 'nguong-cao'
        : r.negNoise > 0.05
          ? 'am-nhiem'
          : 'dung-duoc';

  return (
    <LabShell
      id="lab-labels"
      title="Ngưỡng đa engine và cửa sổ chín muồi: nhãn của bạn sạch tới đâu"
      takeaway={
        <>
          Mở ra, lab đang ở ngưỡng <b>5 engine</b> — đúng mức thoả hiệp mà bài học và giới nghiên cứu hay
          dùng — nhưng gán nhãn <b>ngay ngày tải mẫu về</b>. Kết quả: <b>0 trên 82 mẫu thuộc họ mới</b> được
          gán đúng nhãn độc, và <b>25,7% số mẫu bị gán &ldquo;lành&rdquo; thật ra là mã độc</b>. Chọn đúng
          ngưỡng không cứu được bạn khỏi nhãn muộn: hai bệnh này độc lập với nhau.
          <br />
          <br />
          Kéo cửa sổ chín muồi lên 30 ngày, ngưỡng giữ nguyên: họ mới từ 0% lên <b>92,7%</b>, nhãn âm nhiễm
          từ 25,7% xuống <b>1,8%</b>. Không có gì được cải tiến — bạn chỉ chờ đủ lâu để câu trả lời kịp hình
          thành.
          <br />
          <br />
          Giờ mới tới chuyện ngưỡng, và hãy đọc đường cong chứ đừng đọc một con số. Ngưỡng <b>1</b>: độ sạch
          nhãn dương chỉ <b>69,9%</b> — cứ 10 mẫu bạn gọi là độc thì 3 mẫu là trình cài đặt hoặc công cụ quản
          trị bị vài engine gắn cờ vĩnh viễn. Ngưỡng <b>20</b>: nhãn dương <b>sạch 100%</b> và cũng gần như
          vô dụng — chỉ còn <b>1,2%</b> họ mới, tức bạn giữ lại đúng loại mã độc mà chữ ký đã bắt được từ
          lâu, rồi huấn luyện một mô hình học lại thứ nó đã biết. Thêm nữa, 22,3% nhãn âm khi đó là mã độc
          thật: <b>ngưỡng càng cao, nhãn âm càng bẩn</b>, và đó là nửa dữ liệu ít ai đi kiểm.
          <br />
          <br />
          Vùng 4–6 là chỗ các đường cong còn cùng cao. Nó không phải con số thiêng — nó là hệ quả của việc
          báo động giả trên phần mềm lành gần như không đổi theo thời gian, còn phát hiện mã độc thì tăng
          dần. Hiểu cơ chế đó rồi thì bạn tự chọn được ngưỡng cho kho mẫu của mình.
        </>
      }
    >
      <div className="grid grid-2">
        <Slider
          label="Ngưỡng gán nhãn độc"
          value={threshold}
          min={1}
          max={20}
          step={1}
          onChange={setThreshold}
          format={(v) => `≥ ${v} / ${LBL_ENGINES} engine`}
          hint="Bao nhiêu engine phải đồng thuận thì bạn mới ghi nhãn “độc”."
        />
        <Slider
          label="Cửa sổ chín muồi nhãn"
          value={maturity}
          min={0}
          max={60}
          step={1}
          onChange={setMaturity}
          format={(v) => (v === 0 ? 'gán nhãn ngay khi thu thập' : `chờ ${v} ngày`)}
          hint="Chờ bao lâu sau khi mẫu xuất hiện rồi mới đọc kết quả quét."
        />
      </div>

      <Chart p={p} label="Chất lượng nhãn theo ngưỡng, ở cửa sổ chín muồi đang chọn">
        <Axes
          p={p}
          xLabel="Ngưỡng: số engine tối thiểu"
          yLabel="Tỉ lệ"
          xTicks={19}
          yTicks={5}
          fmtX={(v) => String(Math.round(v))}
          fmtY={(v) => `${Math.round(v * 100)}%`}
        />
        <line
          x1={px(p, threshold)}
          y1={p.pad.t}
          x2={px(p, threshold)}
          y2={p.h - p.pad.b}
          stroke={COLORS.muted}
          strokeWidth={1.4}
          strokeDasharray="3 3"
        />
        {/* Đường độ sạch DỪNG ở chỗ hết nhãn dương, không kéo về 0. */}
        <Line
          p={p}
          pts={r.curve.filter((c) => c.positives > 0).map((c) => [c.thr, c.precision] as [number, number])}
          color={COLORS.brand}
        />
        <Line p={p} pts={r.curve.map((c) => [c.thr, c.recallCommon] as [number, number])} color={COLORS.info} width={1.9} dash="7 4" />
        <Line p={p} pts={r.curve.map((c) => [c.thr, c.recallNovel] as [number, number])} color={COLORS.warn} width={1.9} dash="2 3" />
      </Chart>
      <div className="faint center">
        Liền = độ sạch của nhãn dương · gạch dài = tỉ lệ bắt được họ mã độc đã phổ biến · gạch ngắn = tỉ lệ
        bắt được họ mới. Vạch dọc là ngưỡng bạn đang chọn.
      </div>

      <Readout
        items={[
          {
            k: 'Độ sạch nhãn dương',
            v: khongNhan ? '—' : `${(r.precision * 100).toFixed(1)}%`,
            sub: khongNhan
              ? 'chưa có nhãn dương nào để nói tới độ sạch'
              : `${r.positives} nhãn dương, ${lanhTrongDuong} trong đó là phần mềm lành`,
            tone: khongNhan ? 'bad' : r.precision > 0.9 ? 'ok' : r.precision > 0.8 ? 'warn' : 'bad',
          },
          {
            k: 'Họ mã độc MỚI gán đúng',
            v: `${(r.recallNovel * 100).toFixed(1)}%`,
            sub: `${moiDung} trên ${r.novelTotal} mẫu họ mới`,
            tone: r.recallNovel > 0.8 ? 'ok' : r.recallNovel > 0.4 ? 'warn' : 'bad',
          },
          {
            k: 'Nhãn âm nhiễm mã độc',
            v: `${(r.negNoise * 100).toFixed(1)}%`,
            sub: 'bị gán “lành” nhưng thật ra độc',
            tone: r.negNoise < 0.03 ? 'ok' : r.negNoise < 0.1 ? 'warn' : 'bad',
          },
          {
            k: 'Nhãn còn sẽ đổi',
            v: `${(r.churn * 100).toFixed(1)}%`,
            sub: `so với nhãn đã chín ở ${LBL_MATURE} ngày`,
            tone: r.churn < 0.01 ? 'ok' : r.churn < 0.05 ? 'warn' : 'bad',
          },
        ]}
      />

      <div className={`callout ${trangThai === 'dung-duoc' ? 'co-pro' : 'co-warn'}`}>
        <Icon className="callout-icon" name={trangThai === 'dung-duoc' ? 'check' : 'siren'} size={18} />
        <div>
          <div className="callout-title">
            {trangThai === 'khong-nhan'
              ? 'Không có lấy một nhãn dương'
              : trangThai === 'nhiem'
                ? 'Nhãn dương nhiễm phần mềm lành'
                  : trangThai === 'chua-chin'
                    ? 'Nhãn chưa chín — bạn đang đo trên câu trả lời chưa tồn tại'
                    : trangThai === 'nguong-cao'
                      ? 'Sạch, và chỉ còn lại mã độc đã cũ'
                      : trangThai === 'am-nhiem'
                        ? 'Nhãn dương ổn, nhãn âm thì chưa'
                        : 'Nhãn đủ tốt để huấn luyện'}
          </div>
          <div className="callout-body">
            {trangThai === 'khong-nhan'
              ? `Không mẫu nào đạt ${threshold} engine ở cửa sổ ${maturity === 0 ? 'gán nhãn ngay khi thu thập' : `${maturity} ngày`}, nên cả ${LBL_N} mẫu đều mang nhãn âm — trong đó ${r.evilTotal} mẫu là mã độc thật (${(r.negNoise * 100).toFixed(1)}%). Bảng nhãn không có lớp dương thì không huấn luyện được gì; đây không phải nhãn bẩn, đây là không có nhãn.`
              : trangThai === 'nhiem'
                ? `Ngưỡng ${threshold} engine để ${lanhTrongDuong} mẫu phần mềm lành lọt vào nhãn dương trên tổng ${r.positives}. Mô hình huấn luyện trên đó sẽ học rằng trình cài đặt và công cụ quản trị là mã độc — rồi chặn chúng trong sản xuất.`
              : trangThai === 'chua-chin'
                ? `Chỉ ${moiDung} trên ${r.novelTotal} mẫu họ mới được gán đúng, và ${(r.churn * 100).toFixed(1)}% nhãn hiện tại còn sẽ đổi. Mọi mẫu độc thật đang mang nhãn “lành” ở đây chính là mẫu mà một mô hình tốt sẽ phát hiện — và bị tính là báo động giả vì bảng nhãn chưa kịp biết.`
                : trangThai === 'nguong-cao'
                  ? `Nhãn dương sạch ${(r.precision * 100).toFixed(1)}%, nhưng chỉ ${moiDung} trên ${r.novelTotal} mẫu họ mới còn trong đó, và ${(r.negNoise * 100).toFixed(1)}% nhãn âm là mã độc thật. Bạn vừa lọc bỏ đúng phần dữ liệu đáng học nhất: thứ chữ ký chưa bắt được.`
                  : trangThai === 'am-nhiem'
                    ? `Độ sạch nhãn dương ${(r.precision * 100).toFixed(1)}% là dùng được, nhưng ${(r.negNoise * 100).toFixed(1)}% nhãn âm vẫn là mã độc. Nhiễu bất đối xứng: mỗi lần mô hình phát hiện đúng một mẫu trong số đó, nó bị phạt — bạn đang huấn luyện nó im lặng.`
                    : `Ngưỡng ${threshold} engine sau ${maturity} ngày chờ: nhãn dương sạch ${(r.precision * 100).toFixed(1)}%, bắt được ${(r.recallNovel * 100).toFixed(1)}% họ mới, nhãn âm chỉ còn ${(r.negNoise * 100).toFixed(1)}% nhiễm. Đây là vùng đáng dùng — và đổi lại, dữ liệu của ${maturity} ngày gần nhất chưa được phép dùng để đánh giá.`}
          </div>
        </div>
      </div>
    </LabShell>
  );
}
