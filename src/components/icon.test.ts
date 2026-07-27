/**
 * ============================================================================
 *  Bảo vệ hệ biểu tượng
 * ============================================================================
 *
 *  Hai bất biến được kiểm ở đây, và cả hai đều là loại lỗi âm thầm: không làm
 *  sập gì cả, chỉ khiến giao diện xấu đi từng chút một qua nhiều tháng.
 *
 *   1. KHÔNG emoji trong mã giao diện. Emoji do hệ điều hành vẽ nên trông khác
 *      nhau trên mỗi máy, mang màu cố định phá bảng màu, và bị trình đọc màn
 *      hình đọc tên đầy đủ ngay giữa nhãn nút.
 *   2. Mọi tên icon trong DỮ LIỆU (chặng học, huy hiệu, phòng lab) phải tồn tại
 *      thật. TypeScript đã bắt được phần lớn, nhưng một tên gõ sai lọt qua kiểu
 *      `string` sẽ chỉ hiện ra bằng một ô trống trên màn hình.
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isIconName } from './Icon';
import { TRACKS } from '../content';
import { BADGES } from '../lib/mastery';
import { LABS } from '../labs';

const SRC = join(fileURLToPath(new URL('.', import.meta.url)), '..');

/**
 * Dải ký tự chữ tượng hình. CỐ Ý bỏ qua mũi tên (→ ← ↔) và các hình khối hình
 * học (▸ ▾ ◀): chúng là dấu chữ thật, có trong mọi phông chữ, đổ đúng màu chữ
 * và không bao giờ biến thành hình màu — dùng chúng trong câu văn là chuyện
 * bình thường của nghề sắp chữ, không phải là "dùng emoji làm icon".
 */
const PICTOGRAPH = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]|\u{FE0F}/u;

/** Thư mục nội dung nằm ngoài phạm vi: đó là bài giảng, không phải giao diện. */
const SKIP_DIRS = new Set(['content']);

function uiFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(entry)) uiFiles(full, out);
    } else if (/\.(tsx?|css)$/.test(entry) && !entry.endsWith('.test.ts')) {
      out.push(full);
    }
  }
  return out;
}

describe('hệ biểu tượng', () => {
  it('không còn emoji nào trong mã giao diện', () => {
    const offenders: string[] = [];
    for (const file of uiFiles(SRC)) {
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, i) => {
        const hit = PICTOGRAPH.exec(line);
        if (hit) offenders.push(`${file.slice(SRC.length + 1)}:${i + 1} → ${hit[0]}`);
      });
    }
    expect(offenders, `Dùng <Icon name="…" /> thay cho emoji:\n${offenders.join('\n')}`).toEqual([]);
  });

  it('mọi chặng học trỏ tới một icon có thật', () => {
    for (const t of TRACKS) expect(isIconName(t.icon), `chặng ${t.id}: ${t.icon}`).toBe(true);
  });

  it('mọi huy hiệu trỏ tới một icon có thật', () => {
    for (const b of BADGES) expect(isIconName(b.icon), `huy hiệu ${b.id}: ${b.icon}`).toBe(true);
  });

  it('mọi phòng lab trỏ tới một icon có thật', () => {
    for (const l of LABS) expect(isIconName(l.icon), `lab ${l.id}: ${l.icon}`).toBe(true);
  });
});
