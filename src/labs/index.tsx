/**
 * Sổ đăng ký phòng thí nghiệm.
 * Bài học chỉ tham chiếu id; nếu id chưa có bản cài đặt, ta hiển thị ô báo
 * lịch sự thay vì làm hỏng trang — nội dung luôn quan trọng hơn tiện ích.
 */

import type { ComponentType } from 'react';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { LabBaseRate, LabConfusion, LabRocPr, LabCostThreshold, LabCalibration, LabAlertLoad, LabConformal, LabMcnemar } from './metrics';
import { LabLogistic, LabNaiveBayes, LabTree, LabKnn, LabOverfit, LabGradient, LabPerceptron, LabKmeans, LabExplain, LabTabular } from './models';
import { LabEntropy, LabUrlFeatures, LabPeFeatures, LabTfidf, LabAnomaly, LabDrift, LabSeasonality, LabAuthGraph, LabSplit } from './security';
import { LabAdversarial, LabPoison, LabPromptInjection, LabForgetting } from './adversarial';

export interface LabMeta {
  id: string;
  title: string;
  blurb: string;
  /** Chặng học liên quan — dùng để sắp xếp trang "Phòng lab". */
  track: string;
  icon: IconName;
  Component: ComponentType;
}

export const LABS: LabMeta[] = [
  { id: 'lab-forgetting', title: 'Trí nhớ trong 120 ngày', blurb: 'Xem đường cong quên và tác dụng thật của ôn ngắt quãng.', track: 'khoi-dong', icon: 'hourglass', Component: LabForgetting },
  { id: 'lab-alert-load', title: 'Tải cảnh báo SOC', blurb: 'Đội của bạn xử lý nổi bao nhiêu cảnh báo mỗi ngày?', track: 'khoi-dong', icon: 'siren', Component: LabAlertLoad },
  { id: 'lab-base-rate', title: 'Nghịch lý tỉ lệ nền', blurb: 'Vì sao bộ dò 99% vẫn cho 99% cảnh báo sai.', track: 'nen-mong', icon: 'scale', Component: LabBaseRate },
  { id: 'lab-entropy', title: 'Entropy & DGA', blurb: 'Đo độ khó đoán của chuỗi và thử phát hiện tên miền sinh tự động.', track: 'nen-mong', icon: 'dices', Component: LabEntropy },
  { id: 'lab-gradient', title: 'Hạ gradient', blurb: 'Đi xuống dốc trong sương mù: tốc độ học và cực tiểu địa phương.', track: 'nen-mong', icon: 'mountain', Component: LabGradient },
  { id: 'lab-logistic', title: 'Huấn luyện hồi quy logistic', blurb: 'Xem trọng số hội tụ theo thời gian thực trên đặc trưng URL.', track: 'ml-cot-loi', icon: 'activity', Component: LabLogistic },
  { id: 'lab-naive-bayes', title: 'Bộ lọc thư rác Naive Bayes', blurb: 'Gõ email của bạn và xem từng từ đẩy quyết định đi đâu.', track: 'ml-cot-loi', icon: 'mail', Component: LabNaiveBayes },
  { id: 'lab-tree', title: 'Cây quyết định', blurb: 'Tự chọn phép chia và so với đáp án máy tìm được.', track: 'ml-cot-loi', icon: 'git-fork', Component: LabTree },
  { id: 'lab-knn', title: 'k-NN & ranh giới quyết định', blurb: 'Nhìn thấy đánh đổi thiên lệch – phương sai bằng hình ảnh.', track: 'ml-cot-loi', icon: 'git-compare', Component: LabKnn },
  { id: 'lab-overfit', title: 'Quá khớp', blurb: 'Tăng độ phức tạp và xem mô hình học thuộc nhiễu.', track: 'ml-cot-loi', icon: 'tornado', Component: LabOverfit },
  { id: 'lab-split', title: 'Ba cách chia tập', blurb: '96% khi chia ngẫu nhiên, 59% khi chia theo thời gian — cùng một mô hình.', track: 'du-lieu', icon: 'git-compare', Component: LabSplit },
  { id: 'lab-confusion', title: 'Ma trận nhầm lẫn', blurb: 'Kéo ngưỡng, xem bốn con số và bốn hậu quả thay đổi.', track: 'do-luong', icon: 'calculator', Component: LabConfusion },
  { id: 'lab-roc-pr', title: 'ROC và PR cạnh nhau', blurb: 'Chứng kiến ROC-AUC nói dối khi lớp dương hiếm.', track: 'do-luong', icon: 'trending-down', Component: LabRocPr },
  { id: 'lab-cost-threshold', title: 'Ngưỡng theo chi phí', blurb: 'Tìm ngưỡng tối ưu bằng ma trận chi phí thật.', track: 'do-luong', icon: 'coins', Component: LabCostThreshold },
  { id: 'lab-calibration', title: 'Hiệu chuẩn xác suất', blurb: 'Điểm 0,9 của mô hình có thật sự nghĩa là 90%?', track: 'do-luong', icon: 'sliders', Component: LabCalibration },
  { id: 'lab-mcnemar', title: 'So sánh hai mô hình', blurb: 'Chênh 62 mẫu là tiến bộ thật hay là nhiễu? Và có đáng thay không?', track: 'do-luong', icon: 'scale', Component: LabMcnemar },
  { id: 'lab-conformal', title: 'Tập dự đoán conformal', blurb: 'Đặt trước mức bỏ sót, rồi xem lớp hiếm có thật sự được bảo vệ không.', track: 'do-luong', icon: 'shield', Component: LabConformal },
  { id: 'lab-url-features', title: 'Bóc tách URL', blurb: 'Dán một URL bất kỳ và xem 11 đặc trưng được trích ra.', track: 'dac-trung', icon: 'link', Component: LabUrlFeatures },
  { id: 'lab-pe-features', title: 'Đặc trưng tệp PE', blurb: 'Đọc một tệp thực thi theo cách mô hình đọc.', track: 'dac-trung', icon: 'package', Component: LabPeFeatures },
  { id: 'lab-tfidf', title: 'TF-IDF trên log', blurb: 'Từ nào thực sự mang thông tin trong một dòng log?', track: 'dac-trung', icon: 'file-text', Component: LabTfidf },
  { id: 'lab-anomaly', title: 'Phát hiện bất thường', blurb: 'So sánh ba phương pháp trên dữ liệu truy cập tệp.', track: 'ung-dung', icon: 'search', Component: LabAnomaly },
  { id: 'lab-kmeans', title: 'Phân cụm k-means', blurb: 'Nhóm hành vi mạng và tìm những kẻ lạc loài.', track: 'ung-dung', icon: 'puzzle', Component: LabKmeans },
  { id: 'lab-seasonality', title: 'Mùa vụ và phần dư', blurb: 'Xem một đợt tấn công tự nâng mức nền của chính khung giờ nó xảy ra.', track: 'ung-dung', icon: 'activity', Component: LabSeasonality },
  { id: 'lab-auth-graph', title: 'Đồ thị xác thực', blurb: 'Di chuyển ngang nhìn từ trên xuống — và cách dựng đồ thị sai làm đảo ngược tín hiệu.', track: 'ung-dung', icon: 'network', Component: LabAuthGraph },
  { id: 'lab-perceptron', title: 'Perceptron & XOR', blurb: 'Bài toán từng khiến ngành AI đóng băng 17 năm.', track: 'deep-learning', icon: 'network', Component: LabPerceptron },
  { id: 'lab-tabular', title: 'Rừng so với mạng nơ-ron', blurb: 'Trên dữ liệu bảng, cây tới đích ngay — mạng tới được, nhưng bắt bạn trả giá.', track: 'deep-learning', icon: 'git-fork', Component: LabTabular },
  { id: 'lab-adversarial', title: 'Tấn công né tránh', blurb: 'Chỉnh đặc trưng để lật nhãn — và đo công sức phải bỏ ra.', track: 'adversarial', icon: 'crosshair', Component: LabAdversarial },
  { id: 'lab-poison', title: 'Đầu độc dữ liệu', blurb: 'Mở cửa hậu trong mô hình mà mọi chỉ số vẫn xanh.', track: 'adversarial', icon: 'skull', Component: LabPoison },
  { id: 'lab-prompt-injection', title: 'Hộp cát prompt injection', blurb: 'Thử các lớp phòng thủ cho tác tử LLM và xem cái nào thật sự hiệu quả.', track: 'llm-genai', icon: 'message-alert', Component: LabPromptInjection },
  { id: 'lab-drift', title: 'Trôi khái niệm', blurb: 'Mô hình của bạn hỏng nhanh đến mức nào nếu không huấn luyện lại?', track: 'van-hanh', icon: 'chart', Component: LabDrift },
  { id: 'lab-explain', title: 'Feature importance nói dối', blurb: 'Một cột rác leo lên hạng nhất — và cách đo nào không bị lừa.', track: 'van-hanh', icon: 'lightbulb', Component: LabExplain },
];

const REGISTRY = new Map(LABS.map((l) => [l.id, l]));

export const getLab = (id: string) => REGISTRY.get(id);

export function Lab({ id }: { id: string }) {
  const meta = REGISTRY.get(id);
  if (!meta) {
    return (
      <div className="lab">
        <div className="lab-head">
          <Icon name="flask" />
          <h4>Phòng thí nghiệm</h4>
        </div>
        <div className="lab-body empty">
          <div className="empty-ico"><Icon name="beaker" size={40} stroke={1.5} /></div>
          <div className="faint">Bài thực hành này đang được xây dựng.</div>
        </div>
      </div>
    );
  }
  const C = meta.Component;
  return <C />;
}
