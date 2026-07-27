/**
 * ============================================================================
 *  Lưới an toàn cuối cùng
 * ============================================================================
 *
 *  Với một app mà toàn bộ tài sản của người học nằm trong localStorage của
 *  chính trình duyệt này, màn hình trắng không chỉ là phiền — nó là khoảnh khắc
 *  người ta không biết sáu tháng công sức còn hay mất, và phản ứng tự nhiên là
 *  xoá dữ liệu duyệt web để "sửa", tức là tự tay phá thứ vẫn còn nguyên.
 *
 *  Vì vậy màn hình lỗi này phải làm đúng ba việc, theo thứ tự:
 *    1. Nói rõ dữ liệu VẪN CÒN.
 *    2. Cho tải nó về ngay tại chỗ — trước khi người dùng thử bất cứ cách nào khác.
 *    3. Chỉ sau đó mới đề nghị các cách khắc phục, và cách phá huỷ nhất đặt cuối.
 *
 *  Đây là một trong số rất ít chỗ trong dự án buộc phải dùng component lớp:
 *  `componentDidCatch` không có bản hook tương đương.
 * ============================================================================
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { downloadText } from '../lib/utils';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

const KEY = 'aegis.progress.v1';

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Không có máy chủ để gửi báo lỗi, và đó là chủ đích. Ghi ra console để
    // người dùng kỹ thuật còn dán được vào một issue.
    console.error('AEGIS gặp lỗi không phục hồi được:', error, info.componentStack);
  }

  private raw(): string {
    try {
      return localStorage.getItem(KEY) ?? '';
    } catch {
      return '';
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    const raw = this.raw();
    const kb = raw ? Math.max(1, Math.round(raw.length / 1024)) : 0;

    return (
      <div className="container container-narrow" style={{ paddingBlock: 'var(--s-12)' }}>
        <div className="card card-pad-lg stack">
          <h1 style={{ fontSize: 'var(--fs-xl)' }}>Ứng dụng gặp lỗi</h1>

          {raw ? (
            <div className="callout co-pro">
              <div>
                <div className="callout-title">Tiến độ học của bạn vẫn còn nguyên</div>
                <div className="callout-body">
                  Dữ liệu ({kb} KB) chưa bị đụng tới. Hãy tải một bản sao về máy trước khi thử bất cứ
                  cách khắc phục nào bên dưới.
                </div>
              </div>
            </div>
          ) : (
            <p className="muted">Không tìm thấy dữ liệu học nào trong trình duyệt này.</p>
          )}

          <div className="row-wrap">
            {raw && (
              <button
                className="btn btn-primary"
                onClick={() => downloadText(`aegis-cuu-ho-${new Date().toISOString().slice(0, 10)}.json`, raw)}
              >
                Tải bản sao lưu về máy
              </button>
            )}
            <button className="btn" onClick={() => window.location.reload()}>
              Tải lại trang
            </button>
            <a className="btn" href="./#/cai-dat" onClick={() => setTimeout(() => window.location.reload(), 0)}>
              Mở trang Cài đặt
            </a>
          </div>

          <details className="acc">
            <summary>Vẫn lỗi sau khi tải lại?</summary>
            <div className="acc-body stack" style={{ '--gap': 'var(--s-3)' } as React.CSSProperties}>
              <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
                Có thể dữ liệu đã hỏng. Sau khi đã tải bản sao lưu ở trên về máy, bạn có thể xoá dữ
                liệu cục bộ để app khởi động lại từ đầu, rồi dùng chức năng nhập tệp trong Cài đặt để
                khôi phục.
              </p>
              <div>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    try {
                      localStorage.removeItem(KEY);
                    } catch {
                      /* không xoá được thì tải lại cũng không hại gì */
                    }
                    window.location.reload();
                  }}
                >
                  Xoá dữ liệu cục bộ và khởi động lại
                </button>
              </div>
            </div>
          </details>

          <details className="acc">
            <summary>Chi tiết kỹ thuật</summary>
            <div className="acc-body">
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 'var(--fs-xs)' }}>
                {this.state.error.message}
              </pre>
            </div>
          </details>
        </div>
      </div>
    );
  }
}
