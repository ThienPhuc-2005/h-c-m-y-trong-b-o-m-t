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

/**
 * Chữ TRONG câu văn thì khác. Dấu tick, dấu nhân, mũi tên và hình khối hình học
 * là ký tự sắp chữ thật: chúng có trong mọi phông, đổ đúng màu chữ, và dùng
 * chúng giữa một bảng chân trị hay một công thức là chuyện bình thường. Chỉ
 * loại trừ ở phần NỘI DUNG — trong mã giao diện thì vẫn cấm, vì ở đó chúng
 * đóng vai icon chứ không đóng vai chữ.
 */
const KY_TU_SAP_CHU = /[✓✔✗✘–—×·]/u;

function uiFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry !== 'content') uiFiles(full, out);
    } else if (/\.(tsx?|css)$/.test(entry) && !entry.endsWith('.test.ts')) {
      out.push(full);
    }
  }
  return out;
}

function contentFiles(): string[] {
  const dir = join(SRC, 'content');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))
    .map((f) => join(dir, f));
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

  /**
   * Giáo trình từng dùng emoji làm icon phân biệt hai cột của khối `compare` —
   * 100 cái, trải đều 11 tệp. Chúng hiển thị cho người học y như mọi icon khác,
   * nên lập luận "đây là bài giảng chứ không phải giao diện" không cứu được:
   * người dùng vẫn thấy một hình do hệ điều hành vẽ, đổi hình theo máy, mang màu
   * cố định. Nay chúng đi qua trường `icon`, và bài kiểm thử này chặn đường về.
   */
  it('không còn emoji nào trong dữ liệu giáo trình', () => {
    const offenders: string[] = [];
    for (const file of contentFiles()) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          const sach = line.replace(new RegExp(KY_TU_SAP_CHU, 'gu'), '');
          const hit = PICTOGRAPH.exec(sach);
          if (hit) offenders.push(`${file.slice(SRC.length + 1)}:${i + 1} → ${hit[0]}`);
        });
    }
    expect(
      offenders,
      `Dùng trường icon của khối compare, hoặc bỏ hẳn:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('hai cột của mọi khối so sánh đều có icon, và không trùng nhau', () => {
    const thieu: string[] = [];
    const trung: string[] = [];
    for (const t of TRACKS) {
      for (const l of t.lessons) {
        for (const b of l.blocks) {
          if (b.t !== 'compare') continue;
          const { icon: L, title: tL } = b.left;
          const { icon: R, title: tR } = b.right;
          if (!L || !R) thieu.push(`${l.id}: «${tL}» / «${tR}»`);
          // Hai cột cùng icon là mất luôn thứ đang phân biệt chúng.
          else if (L === R) trung.push(`${l.id}: cùng '${L}' cho «${tL}» và «${tR}»`);
        }
      }
    }
    expect(thieu, `Khối so sánh thiếu icon:\n${thieu.join('\n')}`).toEqual([]);
    expect(trung, `Khối so sánh có hai icon trùng nhau:\n${trung.join('\n')}`).toEqual([]);
  });

  it('mọi icon của khối so sánh trỏ tới một hình có thật', () => {
    for (const t of TRACKS) {
      for (const l of t.lessons) {
        for (const b of l.blocks) {
          if (b.t !== 'compare') continue;
          for (const col of [b.left, b.right]) {
            if (col.icon) expect(isIconName(col.icon), `${l.id}: ${col.icon}`).toBe(true);
          }
        }
      }
    }
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
