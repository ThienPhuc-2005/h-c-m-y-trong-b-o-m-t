/**
 * ============================================================================
 *  Ba dải cảnh báo về dữ liệu
 * ============================================================================
 *
 *  App này không có máy chủ, nên nó cũng không có bản sao dự phòng nào cho
 *  người học. Đó là cái giá của lời hứa "không tài khoản, không theo dõi", và
 *  cái giá đó chỉ chấp nhận được nếu app thành thật về nó ĐÚNG LÚC — chứ không
 *  phải một câu nhắc duy nhất lúc onboarding, khi người ta chưa có gì để mất.
 *
 *  Ba dải ở đây xếp theo mức khẩn cấp giảm dần:
 *    1. Dữ liệu cũ không đọc được (đã cất riêng, cần tải về ngay).
 *    2. Không ghi được vào trình duyệt (phiên học đang trôi mất).
 *    3. Học đã lâu mà chưa sao lưu bao giờ.
 *
 *  Chỉ hiện MỘT dải tại một thời điểm. Xếp chồng cảnh báo là cách nhanh nhất
 *  khiến người ta học được phản xạ bỏ qua tất cả.
 * ============================================================================
 */

import { useState } from 'react';
import {
  useProgress,
  getRecovery,
  readRecovery,
  dismissRecovery,
  hasWriteFailed,
  exportJSON,
} from '../lib/storage';
import { downloadText, fmtRelative } from '../lib/utils';
import { useT } from '../i18n';
import { Icon } from './Icon';

/** Đủ lâu để việc mất mát thành đau thật, đủ sớm để còn kịp nhắc. */
const CARDS_BEFORE_NUDGE = 40;
const STALE_DAYS = 30;

export function DataGuard() {
  const t = useT();
  const p = useProgress();
  const [snoozed, setSnoozed] = useState(false);

  const save = () => {
    downloadText(`aegis-tien-do-${new Date().toISOString().slice(0, 10)}.json`, exportJSON());
  };

  /* ---- 1. Dữ liệu hỏng đã được cất riêng -------------------------------- */
  const rec = getRecovery();
  if (rec) {
    return (
      <div className="container" style={{ marginBottom: 'var(--s-5)' }}>
        <div className="callout co-warn">
          <Icon className="callout-icon" name="alert-octagon" size={18} />
          <div style={{ flex: 1 }}>
            <div className="callout-title">{t('backup.recoverTitle')}</div>
            <div className="callout-body">
              {t('backup.recoverBody', { kb: Math.max(1, Math.round(rec.bytes / 1024)) })}
              <div className="row-wrap" style={{ marginTop: 'var(--s-3)' }}>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() =>
                    downloadText(`aegis-du-lieu-hong-${new Date().toISOString().slice(0, 10)}.json`, readRecovery())
                  }
                >
                  <Icon name="download" size={14} /> {t('backup.recoverDownload')}
                </button>
                <button className="btn btn-sm" onClick={() => dismissRecovery(true)}>
                  {t('backup.recoverDiscard')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---- 2. Không ghi được (thường là hết dung lượng) --------------------- */
  if (hasWriteFailed()) {
    return (
      <div className="container" style={{ marginBottom: 'var(--s-5)' }}>
        <div className="callout co-warn">
          <Icon className="callout-icon" name="alert-triangle" size={18} />
          <div style={{ flex: 1 }}>
            <div className="callout-body">
              {t('backup.writeFailed')}
              <div style={{ marginTop: 'var(--s-3)' }}>
                <button className="btn btn-sm btn-primary" onClick={save}>
                  <Icon name="download" size={14} /> {t('backup.nudgeAction')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---- 3. Học đã nhiều mà chưa sao lưu ---------------------------------- */
  const cards = Object.keys(p.cards).length;
  const staleMs = Date.now() - p.lastExportAt;
  const overdue = p.lastExportAt === 0 || staleMs > STALE_DAYS * 86_400_000;
  if (snoozed || cards < CARDS_BEFORE_NUDGE || !overdue) return null;

  return (
    <div className="container" style={{ marginBottom: 'var(--s-5)' }}>
      <div className="callout co-pro">
        <Icon className="callout-icon" name="download" size={18} />
        <div style={{ flex: 1 }}>
          <div className="callout-body">
            {p.lastExportAt === 0
              ? t('backup.nudgeNever', { n: cards })
              : t('backup.nudgeStale', { when: fmtRelative(p.lastExportAt) })}
            <div className="row-wrap" style={{ marginTop: 'var(--s-3)' }}>
              {/* Nút tải nằm NGAY ĐÂY, không phải một liên kết sang trang khác:
                  mỗi bước thêm vào là một chỗ để người ta rơi rụng. */}
              <button className="btn btn-sm btn-primary" onClick={save}>
                {t('backup.nudgeAction')}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setSnoozed(true)}>
                {t('backup.nudgeDismiss')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
