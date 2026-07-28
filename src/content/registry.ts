/**
 * ============================================================================
 *  Sổ đăng ký hình vẽ & phòng lab
 * ============================================================================
 *  Nội dung bài học chỉ được tham chiếu tới các id có trong hai danh sách này.
 *  Nếu tham chiếu sai, giao diện hiển thị ô "chưa có" thay vì làm sập trang —
 *  một bài học thiếu hình vẫn đọc được, còn màn hình trắng thì không.
 * ============================================================================
 */

/** Các hình minh hoạ (SVG) — mã hoá kép cho khái niệm trừu tượng. */
export const FIGURE_IDS = [
  'fig-ml-pipeline', // Chuỗi xử lý: dữ liệu → đặc trưng → mô hình → quyết định
  'fig-three-learning', // Ba kiểu học: có giám sát / không giám sát / tăng cường
  'fig-base-rate', // Trực quan nghịch lý tỉ lệ nền bằng 10.000 ô vuông
  'fig-confusion', // Ma trận nhầm lẫn có chú giải
  'fig-roc-anatomy', // Giải phẫu đường ROC và điểm hoạt động
  'fig-bias-variance', // Đánh đổi thiên lệch – phương sai
  'fig-split-temporal', // Chia dữ liệu theo thời gian vs ngẫu nhiên
  'fig-feature-space', // Không gian đặc trưng & ranh giới quyết định
  'fig-imbalance', // Mất cân bằng lớp trong bảo mật
  'fig-neuron', // Một nơ-ron nhân tạo
  'fig-mlp', // Mạng nhiều lớp
  'fig-cnn-bytes', // CNN quét byte của tệp thực thi
  'fig-attention', // Cơ chế chú ý (attention)
  'fig-adversarial', // Mẫu đối kháng vượt ranh giới quyết định
  'fig-atlas', // Bản đồ vòng đời tấn công vào hệ thống ML
  'fig-llm-stack', // Kiến trúc ứng dụng LLM & bề mặt tấn công
  'fig-rag', // Luồng RAG và điểm chèn độc
  'fig-soc-pipeline', // Mô hình trong quy trình SOC
  'fig-drift', // Trôi dữ liệu & trôi khái niệm theo thời gian
  'fig-forgetting', // Đường cong quên và hiệu ứng ôn tập giãn cách
  'fig-kill-chain', // Chuỗi tấn công và điểm ML can thiệp
  'fig-detection-lifecycle', // Vòng đời một luật/mô hình phát hiện
  'fig-entropy-scale', // Thang entropy của chuỗi ký tự
  'fig-dimensionality', // Lời nguyền số chiều
  'fig-gradient-descent', // Gradient descent trên mặt lỗi
  'fig-ensemble', // Bagging vs Boosting
  'fig-autoencoder', // Autoencoder phát hiện bất thường
  'fig-graph-lateral', // Đồ thị di chuyển ngang trong mạng
  'fig-calibration', // Biểu đồ độ tin cậy (reliability diagram)
  'fig-data-sources', // Bản đồ nguồn dữ liệu bảo mật
  'fig-bayes-direction', // Đảo chiều điều kiện là đổi mẫu số
  'fig-precision-recall', // Precision đọc theo cột, recall đọc theo hàng
  'fig-model-stealing', // Trộm mô hình qua API và suy luận thành viên
  'fig-llm-three-risks', // Jailbreak / rò rỉ / ảo giác: ba chiều khác nhau
  'fig-ai-rmf', // NIST AI RMF với GOVERN ở giữa
  'fig-role-overlap', // Hai vai trò chồng lấn 60%
  'fig-pandas-three', // Ba thao tác pandas và chỗ mỗi cái âm thầm sai
  'fig-dataset-age', // Bộ dữ liệu công khai đóng băng ở năm nó được tạo
  'fig-attack-cost', // Phòng thủ làm tấn công đắt hơn phần thu được
  'fig-ml-redteam', // Sáu bước đánh giá ML, bước 6 quay lại bước 1
  'fig-owasp-llm', // Sáu mục OWASP LLM gắn vào kiến trúc ứng dụng
  'fig-project-readme', // Sáu mục README và câu hỏi mỗi mục trả lời
  'fig-label-maturity', // Nhãn chín dần, và cửa sổ chín muồi
  'fig-injection-paths', // Chèn trực tiếp qua ô nhập, gián tiếp qua nội dung
  'fig-poison-timeline', // Đầu độc lúc huấn luyện, nổ lúc suy luận
  'fig-alert-funnel', // Phễu cảnh báo kết thúc ở giờ người
  'fig-text-ladder', // Đếm từ, TF-IDF, embedding: được gì trả gì
  'fig-margin-idea', // k-NN hỏi hàng xóm, SVM tìm lề rộng nhất
] as const;

export type KnownFigureId = (typeof FIGURE_IDS)[number];

/** Các phòng lab tương tác — học bằng cách vặn núm và nhìn hậu quả. */
export const LAB_IDS = [
  'lab-base-rate', // Máy tính nghịch lý tỉ lệ nền
  'lab-entropy', // Đo entropy chuỗi & thử phát hiện DGA
  'lab-confusion', // Ma trận nhầm lẫn + ngưỡng + chi phí
  'lab-roc-pr', // ROC và PR cùng lúc khi đổi độ mất cân bằng
  'lab-logistic', // Huấn luyện hồi quy logistic trên đặc trưng URL
  'lab-naive-bayes', // Bộ lọc thư rác Naive Bayes có thể huấn luyện
  'lab-tree', // Cây quyết định & information gain
  'lab-knn', // k-NN và ranh giới quyết định 2D
  'lab-overfit', // Quá khớp / thiên lệch – phương sai
  'lab-gradient', // Gradient descent & tốc độ học
  'lab-anomaly', // Phát hiện bất thường trên dữ liệu đăng nhập
  'lab-kmeans', // Phân cụm k-means trên luồng mạng
  'lab-adversarial', // Né tránh: chỉnh đặc trưng để lật nhãn
  'lab-poison', // Đầu độc dữ liệu: lật nhãn, xem ranh giới dịch
  'lab-prompt-injection', // Sandbox prompt injection cho agent LLM
  'lab-drift', // Mô phỏng trôi khái niệm theo thời gian
  'lab-alert-load', // Máy tính tải cảnh báo SOC
  'lab-url-features', // Trích xuất đặc trưng từ URL bất kỳ
  'lab-tfidf', // TF-IDF / n-gram trên dòng log
  'lab-perceptron', // Perceptron & bài toán XOR
  'lab-calibration', // Hiệu chuẩn xác suất
  'lab-mcnemar', // So sánh hai mô hình bằng phép kiểm theo cặp
  'lab-conformal', // Tập dự đoán conformal và bảo đảm phủ
  'lab-seasonality', // Phân rã thành phần mùa và bẫy tự nâng mức nền
  'lab-auth-graph', // Đồ thị xác thực và di chuyển ngang
  'lab-split', // Chia tập ngẫu nhiên / theo thời gian / theo nhóm
  'lab-entity', // Hợp nhất thực thể: đếm trên dữ liệu bẩn
  'lab-labels', // Ngưỡng đa engine và cửa sổ chín muồi nhãn
  'lab-explain', // MDI thiên vị cột nhiều giá trị, permutation thì không
  'lab-tabular', // Random Forest so với mạng nơ-ron trên dữ liệu bảng
  'lab-forgetting', // Mô phỏng đường cong quên & lịch ôn
  'lab-pe-features', // Đọc đặc trưng tệp PE giả lập
  'lab-cost-threshold', // Tối ưu ngưỡng theo ma trận chi phí
] as const;

export type KnownLabId = (typeof LAB_IDS)[number];

export const isKnownFigure = (id: string): id is KnownFigureId =>
  (FIGURE_IDS as readonly string[]).includes(id);

export const isKnownLab = (id: string): id is KnownLabId => (LAB_IDS as readonly string[]).includes(id);
