import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * `base: './'` khiến bản build dùng đường dẫn tương đối, nhờ đó app chạy được
 * ở BẤT KỲ đâu: GitHub Pages dưới thư mục con, mạng nội bộ, USB, hoặc mở thẳng
 * tệp index.html. Kết hợp với bộ định tuyến theo hash, không cần cấu hình máy
 * chủ nào cả. Người học ở đâu cũng mở được — đó là ưu tiên cao hơn URL đẹp.
 */
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    // Nội dung khoá học rất lớn; tách nó khỏi mã ứng dụng để lần tải sau chỉ
    // phải lấy phần thay đổi.
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Mỗi chặng một chunk riêng. Tổng dung lượng không đổi, nhưng:
          //  - trình duyệt tải song song nhiều tệp nhỏ thay vì một tệp 1,8 MB;
          //  - sửa một chặng chỉ làm mất hiệu lực cache của chặng đó, thay vì
          //    bắt người học tải lại toàn bộ giáo trình.
          const track = /\/src\/content\/(t\d+)-/.exec(id);
          if (track) return `chang-${track[1]}`;
          if (id.includes('/src/content/')) return 'noi-dung';
          if (id.includes('/src/labs/')) return 'phong-lab';
          if (id.includes('node_modules')) return 'thu-vien';
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
});
