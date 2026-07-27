/**
 * ============================================================================
 *  Toàn vẹn từ điển song ngữ
 * ============================================================================
 *
 *  Lỗi i18n hầu như không bao giờ làm sập app — nó chỉ khiến một nhãn tiếng
 *  Việt lọt vào giao diện English, hoặc một nút hiện ra chuỗi `settings.export`
 *  thay vì chữ. Cả hai đều lọt qua trình biên dịch và qua cả mắt người soạn,
 *  vì người soạn thường chỉ xem app ở một thứ tiếng. Nên phải kiểm bằng máy.
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vi from './vi.json';
import en from './en.json';
import { t, setLang, getLang } from './index';

const SRC = join(fileURLToPath(new URL('.', import.meta.url)), '..');

/** Làm phẳng cây từ điển thành danh sách đường dẫn "mục.khoá". */
function flatten(node: unknown, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  if (typeof node !== 'object' || node === null) return out;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out.set(path, v);
    else for (const [ik, iv] of flatten(v, path)) out.set(ik, iv);
  }
  return out;
}

const VI = flatten(vi);
const EN = flatten(en);

/** Các biến `{tên}` xuất hiện trong một chuỗi. */
const slots = (s: string) => new Set((s.match(/\{(\w+)\}/g) ?? []).sort());

describe('từ điển song ngữ', () => {
  it('hai tệp có đúng cùng một tập khoá', () => {
    const missingEn = [...VI.keys()].filter((k) => !EN.has(k));
    const missingVi = [...EN.keys()].filter((k) => !VI.has(k));
    expect(missingEn, `thiếu trong en.json: ${missingEn.join(', ')}`).toEqual([]);
    expect(missingVi, `thiếu trong vi.json: ${missingVi.join(', ')}`).toEqual([]);
  });

  it('không có khoá nào bỏ trống', () => {
    for (const [k, v] of [...VI, ...EN]) expect(v.trim(), k).not.toBe('');
  });

  it('hai bản dịch dùng cùng bộ biến nội suy', () => {
    // Lệch biến là lỗi âm thầm nguy hiểm nhất: bản English sẽ hiện nguyên chữ
    // "{n}" giữa câu, còn bản Việt thì không — và chỉ người dùng mới thấy.
    for (const [k, viText] of VI) {
      const enText = EN.get(k);
      if (enText === undefined) continue;
      expect([...slots(viText)], `biến lệch nhau ở khoá ${k}`).toEqual([...slots(enText)]);
    }
  });

  it('bản English không còn sót dấu tiếng Việt', () => {
    // Ngoại lệ: tên riêng của tác giả có dấu, và đó là chuyện đúng đắn.
    const allowed = new Set(['footer.author']);
    const viMarks = /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i;
    const leaks = [...EN].filter(([k, v]) => !allowed.has(k) && viMarks.test(v)).map(([k]) => k);
    expect(leaks, `còn tiếng Việt trong en.json: ${leaks.join(', ')}`).toEqual([]);
  });

  it('mọi khoá được gọi trong mã đều tồn tại', () => {
    // Bắt lỗi gõ nhầm tên khoá — thứ mà `t()` lặng lẽ nuốt bằng cách trả về
    // chính chuỗi khoá, khiến giao diện hiện ra "settings.exprot".
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.tsx?$/.test(entry) && !entry.endsWith('.test.ts')) files.push(full);
      }
    };
    walk(SRC);

    const unknown = new Set<string>();
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      // Chỉ xét lời gọi có khoá viết thẳng; khoá ghép động được kiểm gián tiếp
      // qua các bài kiểm tra bảng ánh xạ ở nơi khác.
      for (const m of text.matchAll(/\bt\(\s*'([a-zA-Z][\w.-]*)'/g)) {
        if (!VI.has(m[1])) unknown.add(`${m[1]} (${file.slice(SRC.length + 1)})`);
      }
    }
    expect([...unknown], `khoá không có trong từ điển:\n${[...unknown].join('\n')}`).toEqual([]);
  });

  it('không còn chữ tiếng Việt viết thẳng trong phần vỏ giao diện', () => {
    /**
     * Bài kiểm tra "mọi khoá được gọi đều tồn tại" ở trên KHÔNG bắt được loại
     * lỗi này: một chuỗi tiếng Việt nằm thẳng trong JSX thì không có lời gọi
     * `t()` nào để mà kiểm. Đúng cách đó mà `{plan.due.length} thẻ` lọt lên
     * production, hiện ra "12 thẻ" cho người đang dùng giao diện English.
     *
     * Phạm vi CHỈ là vỏ giao diện. `content/`, `labs/` và `Figures.tsx` là nội
     * dung giảng dạy — chúng vốn là tiếng Việt theo đúng thiết kế.
     */
    const VIET = '[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]';
    const shell = [
      join(SRC, 'App.tsx'),
      ...readdirSync(join(SRC, 'pages')).map((f) => join(SRC, 'pages', f)),
      ...['Shared.tsx', 'Quiz.tsx', 'Blocks.tsx', 'Search.tsx', 'Markdown.tsx', 'DataGuard.tsx'].map((f) =>
        join(SRC, 'components', f),
      ),
    ];

    const offenders: string[] = [];
    for (const file of shell) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          const code = line.trim();
          // Bỏ qua chú thích — mã nguồn viết bằng tiếng Việt là chủ đích.
          if (/^(\*|\/\/|\/\*|\{\/\*)/.test(code)) return;
          /**
           * Chữ hiển thị bắt đầu sau `>` (mở thẻ) HOẶC sau `}` (vừa đóng một
           * biểu thức). Bỏ sót vế `}` chính là lý do phiên bản đầu của bài kiểm
           * tra này để lọt `{plan.due.length} thẻ` — chữ nằm ngay sau dấu đóng
           * ngoặc, nên mẫu chỉ neo vào `>` không bao giờ chạm tới.
           */
          const shown = new RegExp(`[>}][^<>{}]*${VIET}|'[^']*${VIET}[^']*'`, 'i');
          if (shown.test(line)) offenders.push(`${file.slice(SRC.length + 1)}:${i + 1}  ${code.slice(0, 90)}`);
        });
    }
    expect(offenders, `Đưa những chuỗi này vào t():\n${offenders.join('\n')}`).toEqual([]);
  });

  it('t() nội suy biến và rơi về tiếng Việt khi thiếu khoá', () => {
    const before = getLang();
    setLang('vi');
    expect(t('roadmap.track', { n: 3 })).toBe('Chặng 3');
    setLang('en');
    expect(t('roadmap.track', { n: 3 })).toBe('Track 3');
    // Khoá không tồn tại thì trả lại chính nó — nhãn xấu vẫn hơn màn hình trắng.
    expect(t('khong.he.ton.tai')).toBe('khong.he.ton.tai');
    setLang(before);
  });
});
