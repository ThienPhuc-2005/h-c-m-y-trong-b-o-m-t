/**
 * Tô màu cú pháp tối giản (Python / JS / bash / YAML).
 *
 * Vì sao tự viết thay vì dùng Prism/Shiki: bộ tô màu đầy đủ nặng 30–200 KB và
 * mang tới một bảng màu cầu vồng cạnh tranh sự chú ý với nội dung bài học.
 * Ở đây ta chỉ phân biệt bốn nhóm — từ khoá, chuỗi, số, chú thích — vừa đủ để
 * mắt bám cấu trúc mà không biến đoạn mã thành pháo hoa.
 */

const KEYWORDS: Record<string, string[]> = {
  python: [
    'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or',
    'import', 'from', 'as', 'with', 'try', 'except', 'finally', 'raise', 'lambda', 'None',
    'True', 'False', 'is', 'pass', 'break', 'continue', 'yield', 'async', 'await', 'global',
    'assert', 'del', 'print',
  ],
  javascript: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'of', 'in',
    'class', 'new', 'this', 'import', 'from', 'export', 'default', 'async', 'await', 'try',
    'catch', 'finally', 'throw', 'typeof', 'null', 'undefined', 'true', 'false',
  ],
  bash: ['if', 'then', 'else', 'fi', 'for', 'do', 'done', 'while', 'case', 'esac', 'function', 'echo', 'export'],
  sql: ['SELECT', 'FROM', 'WHERE', 'GROUP', 'BY', 'ORDER', 'JOIN', 'LEFT', 'INNER', 'ON', 'AS', 'AND', 'OR', 'NOT', 'LIMIT', 'HAVING', 'COUNT', 'SUM', 'AVG'],
};

const ALIASES: Record<string, string> = {
  py: 'python',
  js: 'javascript',
  ts: 'javascript',
  typescript: 'javascript',
  sh: 'bash',
  shell: 'bash',
  console: 'bash',
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function highlight(code: string, lang: string): string {
  const key = ALIASES[lang.toLowerCase()] ?? lang.toLowerCase();
  const kws = KEYWORDS[key];
  const commentChar = key === 'javascript' ? '//' : key === 'sql' ? '--' : '#';

  return code
    .split('\n')
    .map((line) => {
      // Tách phần chú thích ra trước để không tô màu bên trong nó.
      const ci = findCommentStart(line, commentChar);
      const codePart = ci >= 0 ? line.slice(0, ci) : line;
      const commentPart = ci >= 0 ? line.slice(ci) : '';

      let out = esc(codePart);

      // Chuỗi (nháy đơn, nháy kép, ba nháy)
      out = out.replace(/(&quot;|&#39;|"|')((?:\\.|(?!\1)[^\\])*)\1/g, (m) => `<span class="tok-str">${m}</span>`);

      // Số
      out = out.replace(/\b(\d+\.?\d*(?:e-?\d+)?)\b/g, '<span class="tok-num">$1</span>');

      // Từ khoá
      if (kws?.length) {
        const re = new RegExp(`\\b(${kws.join('|')})\\b`, key === 'sql' ? 'gi' : 'g');
        out = out.replace(re, '<span class="tok-kw">$1</span>');
      }

      // Tên hàm được gọi
      out = out.replace(/\b([a-zA-Z_]\w*)(\s*\()/g, (m, name: string, paren: string) =>
        kws?.includes(name) ? m : `<span class="tok-fn">${name}</span>${paren}`,
      );

      return commentPart ? `${out}<span class="tok-com">${esc(commentPart)}</span>` : out;
    })
    .join('\n');
}

/** Tìm vị trí bắt đầu chú thích, bỏ qua trường hợp nằm trong chuỗi. */
function findCommentStart(line: string, marker: string): number {
  let inStr: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inStr) {
      if (c === '\\') i++;
      else if (c === inStr) inStr = null;
    } else if (c === '"' || c === "'") {
      inStr = c;
    } else if (line.startsWith(marker, i)) {
      return i;
    }
  }
  return -1;
}
