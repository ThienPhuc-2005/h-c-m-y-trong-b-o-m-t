import type { Term } from './types';

/**
 * Phần bổ sung của từ điển thuật ngữ.
 *
 * Những mục này được thêm sau khi một bài kiểm thử phát hiện 82 id thuật ngữ
 * được các bài học tham chiếu nhưng chưa hề tồn tại. Hậu quả không phải là sập
 * trang — giao diện lọc bỏ id không tìm thấy — mà là dải "Thuật ngữ trong phần
 * này" âm thầm thiếu đúng những từ người học vừa gặp lần đầu. Đó là kiểu hỏng
 * tệ nhất: không ai báo lỗi, chỉ có người học lặng lẽ không tra được nghĩa.
 *
 * Bài kiểm thử `content.test.ts` nay chặn mọi tham chiếu treo, nên tình trạng
 * này không thể tái diễn.
 */
export const TERMS_EXTRA: Term[] = [
  /* ---- Biểu diễn dữ liệu & đặc trưng ---- */
  {
    id: 'vector-dac-trung',
    vi: 'Vector đặc trưng',
    en: 'Feature vector',
    def: 'Dãy số biểu diễn một mẫu dữ liệu, là dạng duy nhất mà thuật toán học máy nhận vào.',
    example: 'Một kết nối mạng → [độ dài phiên, số byte gửi, số byte nhận, entropy tên miền].',
    tags: ['dac-trung', 'nen-tang'],
  },
  {
    id: 'one-hot',
    vi: 'Mã hoá one-hot',
    en: 'One-hot encoding',
    def: 'Biến một trường hạng mục thành nhiều cột nhị phân, mỗi giá trị một cột.',
    example: 'Giao thức {TCP, UDP, ICMP} → ba cột, mẫu TCP là [1, 0, 0].',
    notToConfuseWith:
      'Mã hoá thứ tự (label encoding) — gán 0, 1, 2 cho ba giao thức khiến mô hình tưởng UDP "lớn hơn" TCP.',
    tags: ['dac-trung'],
  },
  {
    id: 'chuan-hoa',
    vi: 'Chuẩn hoá',
    en: 'Scaling / Normalization',
    def: 'Đưa các đặc trưng về cùng thang đo để đặc trưng có giá trị lớn không lấn át phần còn lại.',
    example: 'Không chuẩn hoá, cột "số byte" (hàng tỉ) sẽ nuốt chửng cột "số kết nối" (hàng chục) trong mọi phép tính khoảng cách.',
    tags: ['dac-trung', 'nen-tang'],
  },
  {
    id: 'hashing-trick',
    vi: 'Hashing trick',
    en: 'Hashing trick / Feature hashing',
    def: 'Ánh xạ số lượng hạng mục vô hạn vào một số cột cố định bằng hàm băm, thay vì lập từ điển.',
    example: 'Tên miền là tập không giới hạn; băm vào 2^18 cột cho phép xử lý cả tên miền chưa từng thấy.',
    notToConfuseWith: 'One-hot — cần biết trước toàn bộ danh sách giá trị, nên không dùng được cho dữ liệu mở.',
    tags: ['dac-trung'],
  },
  {
    id: 'tf-idf',
    vi: 'TF-IDF',
    en: 'TF-IDF',
    def: 'Trọng số từ = tần suất trong văn bản × độ hiếm trên toàn tập; từ càng hiếm càng mang nhiều thông tin.',
    example: 'Trong log, "for" xuất hiện khắp nơi nên trọng số thấp; "EncodedCommand" hiếm nên trọng số cao.',
    tags: ['dac-trung'],
  },
  {
    id: 'n-gram',
    vi: 'n-gram',
    en: 'n-gram',
    def: 'Đoạn con gồm n phần tử liên tiếp của một chuỗi (ký tự hoặc từ).',
    example: 'Bigram ký tự của "google" là go, oo, og, gl, le — dùng để phát hiện tên miền không giống ngôn ngữ người.',
    tags: ['dac-trung'],
  },
  {
    id: 'cardinality',
    vi: 'Số giá trị phân biệt (cardinality)',
    en: 'Cardinality',
    def: 'Số giá trị khác nhau mà một trường có thể nhận.',
    example: 'Trường "giao thức" có ít giá trị phân biệt (vài giá trị); trường "URL" có số giá trị phân biệt gần như vô hạn.',
    tags: ['du-lieu', 'dac-trung'],
  },
  {
    id: 'entity-resolution',
    vi: 'Hợp nhất thực thể',
    en: 'Entity resolution',
    def: 'Nhận ra rằng nhiều định danh khác nhau thực chất trỏ tới cùng một người, máy hoặc tài khoản.',
    example: '"PC-01", "pc-01.corp.local" và 10.0.0.5 là cùng một máy — không hợp nhất thì mọi thống kê theo máy đều sai.',
    tags: ['du-lieu'],
  },

  /* ---- Xác suất & thống kê ---- */
  {
    id: 'xac-suat-co-dieu-kien',
    vi: 'Xác suất có điều kiện',
    en: 'Conditional probability',
    def: 'Xác suất của một sự kiện khi đã biết một sự kiện khác đã xảy ra, viết P(A|B).',
    notToConfuseWith:
      'P(A|B) và P(B|A) là hai số hoàn toàn khác nhau. Lẫn lộn hai chiều này chính là gốc của nghịch lý tỉ lệ nền.',
    tags: ['nen-tang'],
  },
  {
    id: 'bayes',
    vi: 'Định lý Bayes',
    en: "Bayes' theorem",
    def: 'Công thức đảo chiều xác suất có điều kiện: từ P(bằng chứng | giả thuyết) suy ra P(giả thuyết | bằng chứng).',
    example: 'Từ "bộ phát hiện bắt được 99% mã độc" suy ra "cảnh báo này có bao nhiêu phần trăm là mã độc thật" — cần thêm tỉ lệ nền.',
    tags: ['nen-tang'],
  },
  {
    id: 'tien-nghiem',
    vi: 'Xác suất tiên nghiệm',
    en: 'Prior probability',
    def: 'Niềm tin về xác suất một giả thuyết TRƯỚC khi nhìn vào bằng chứng mới.',
    example: 'Trước khi xem cảnh báo, xác suất một kết nối bất kỳ là độc hại đúng bằng tỉ lệ nền.',
    tags: ['nen-tang'],
  },
  {
    id: 'ti-so-kha-nang',
    vi: 'Tỉ số khả năng',
    en: 'Likelihood ratio',
    def: 'Tỉ số giữa xác suất thấy bằng chứng khi giả thuyết đúng và khi giả thuyết sai; đo sức mạnh của bằng chứng.',
    example: 'Tỉ số 100 nghĩa là bằng chứng này làm khả năng độc hại tăng gấp 100 lần so với trước.',
    tags: ['nen-tang'],
  },
  {
    id: 'ti-le-nen',
    vi: 'Tỉ lệ nền',
    en: 'Base rate',
    def: 'Tỉ lệ mẫu thực sự thuộc lớp dương trong tổng thể, trước khi có bất kỳ bằng chứng nào.',
    tags: ['do-luong', 'base-rate'],
  },
  {
    id: 'ppv',
    vi: 'Giá trị dự đoán dương',
    en: 'PPV (Positive Predictive Value)',
    def: 'Trong các trường hợp được báo dương, tỉ lệ thực sự dương. Cùng nghĩa với precision.',
    example: 'PPV 2% nghĩa là analyst mở 50 cảnh báo mới gặp một cái thật.',
    tags: ['do-luong'],
  },
  {
    id: 'fpr',
    vi: 'Tỉ lệ dương giả',
    en: 'FPR (False Positive Rate)',
    def: 'Tỉ lệ mẫu âm bị báo nhầm thành dương: FP / (FP + TN).',
    notToConfuseWith:
      'Precision. FPR có mẫu số là toàn bộ mẫu âm (khổng lồ) nên luôn trông nhỏ; precision có mẫu số là số cảnh báo thực sự gửi đi.',
    tags: ['do-luong'],
  },
  {
    id: 'trung-vi',
    vi: 'Trung vị',
    en: 'Median',
    def: 'Giá trị nằm chính giữa khi sắp xếp dữ liệu; nửa số mẫu nhỏ hơn, nửa lớn hơn.',
    notToConfuseWith:
      'Trung bình — một phiên tải 400 GB kéo trung bình lên rất mạnh nhưng gần như không làm trung vị nhúc nhích.',
    tags: ['nen-tang', 'thong-ke'],
  },
  {
    id: 'do-lech-chuan',
    vi: 'Độ lệch chuẩn',
    en: 'Standard deviation',
    def: 'Đo mức độ phân tán của dữ liệu quanh giá trị trung bình.',
    tags: ['nen-tang', 'thong-ke'],
  },
  {
    id: 'z-score',
    vi: 'Điểm z',
    en: 'Z-score',
    def: 'Số độ lệch chuẩn mà một giá trị cách trung bình; dùng để phát hiện ngoại lai.',
    notToConfuseWith:
      'Chỉ đúng khi dữ liệu gần phân phối chuẩn. Lưu lượng mạng có đuôi nặng nên ngưỡng "3 sigma" gắn cờ nhầm liên tục.',
    tags: ['thong-ke', 'bat-thuong'],
  },
  {
    id: 'mad',
    vi: 'Độ lệch tuyệt đối trung vị',
    en: 'MAD (Median Absolute Deviation)',
    def: 'Thước đo phân tán dựa trên trung vị, ít bị ngoại lai làm sai lệch hơn độ lệch chuẩn.',
    example: 'Với dữ liệu bảo mật đầy giá trị cực đoan, ngưỡng dựa trên MAD ổn định hơn hẳn ngưỡng dựa trên sigma.',
    tags: ['thong-ke', 'bat-thuong'],
  },
  {
    id: 'log-normal',
    vi: 'Phân phối log-chuẩn',
    en: 'Log-normal distribution',
    def: 'Phân phối lệch phải mạnh, trong đó logarit của biến mới có phân phối chuẩn.',
    example: 'Kích thước tệp, thời lượng phiên và số byte truyền gần như luôn log-chuẩn chứ không phải chuẩn.',
    tags: ['thong-ke'],
  },
  {
    id: 'phan-vi',
    vi: 'Phân vị',
    en: 'Percentile / Quantile',
    def: 'Ngưỡng mà dưới nó có một tỉ lệ phần trăm nhất định của dữ liệu.',
    example: 'Ngưỡng cảnh báo đặt ở phân vị 99,9 nghĩa là chỉ 1 trên 1.000 sự kiện vượt qua.',
    tags: ['thong-ke', 'do-luong'],
  },
  {
    id: 'entropy-chuan-hoa',
    vi: 'Entropy chuẩn hoá',
    en: 'Normalized entropy',
    def: 'Entropy chia cho giá trị cực đại có thể, đưa về khoảng 0–1 để so sánh giữa các chuỗi khác độ dài.',
    tags: ['dac-trung'],
  },
  {
    id: 'information-gain',
    vi: 'Độ lợi thông tin',
    en: 'Information gain',
    def: 'Mức giảm entropy sau khi chia dữ liệu theo một đặc trưng; tiêu chí chọn nhánh của cây quyết định.',
    tags: ['thuat-toan'],
  },
  {
    id: 'met-moi-canh-bao',
    vi: 'Mệt mỏi cảnh báo',
    en: 'Alert fatigue',
    def: 'Trạng thái analyst mất khả năng phản ứng vì quá nhiều cảnh báo, phần lớn là giả.',
    example: 'Hệ quả nguy hiểm nhất không phải chậm trễ, mà là cảnh báo THẬT bị đóng cùng đợt với cảnh báo rác.',
    tags: ['do-luong', 'van-hanh'],
  },

  /* ---- Đại số tuyến tính & tối ưu ---- */
  {
    id: 'vector',
    vi: 'Vector',
    en: 'Vector',
    def: 'Dãy số có thứ tự, biểu diễn một điểm hoặc một hướng trong không gian nhiều chiều.',
    tags: ['nen-tang'],
  },
  {
    id: 'tich-vo-huong',
    vi: 'Tích vô hướng',
    en: 'Dot product',
    def: 'Tổng các tích từng cặp thành phần của hai vector; đo mức độ hai vector cùng hướng.',
    example: 'Điểm số của hồi quy logistic chính là tích vô hướng giữa vector đặc trưng và vector trọng số.',
    tags: ['nen-tang'],
  },
  {
    id: 'chuan-l2',
    vi: 'Chuẩn L2',
    en: 'L2 norm / Euclidean norm',
    def: 'Độ dài của vector, tính bằng căn bậc hai của tổng bình phương các thành phần.',
    tags: ['nen-tang'],
  },
  {
    id: 'cosine',
    vi: 'Độ tương đồng cosine',
    en: 'Cosine similarity',
    def: 'Đo góc giữa hai vector, bỏ qua độ dài của chúng; giá trị từ −1 đến 1.',
    example: 'Hai dòng lệnh cùng nội dung nhưng khác độ dài có cosine gần 1, trong khi khoảng cách Euclid lại rất lớn.',
    tags: ['nen-tang', 'dac-trung'],
  },
  {
    id: 'khoang-cach',
    vi: 'Thước đo khoảng cách',
    en: 'Distance metric',
    def: 'Hàm định lượng mức độ khác nhau giữa hai mẫu; quyết định ý nghĩa của từ "giống nhau" trong mô hình.',
    tags: ['nen-tang', 'thuat-toan'],
  },
  {
    id: 'loi-nguyen-so-chieu',
    vi: 'Lời nguyền số chiều',
    en: 'Curse of dimensionality',
    def: 'Khi số chiều tăng, dữ liệu trở nên thưa thớt và mọi điểm gần như cách đều nhau, khiến khoảng cách mất ý nghĩa.',
    example: 'Đây là lý do k-NN và phát hiện bất thường dựa trên khoảng cách suy yếu khi số đặc trưng lên hàng nghìn.',
    tags: ['nen-tang'],
  },
  {
    id: 'ham-mat-mat',
    vi: 'Hàm mất mát',
    en: 'Loss function',
    def: 'Hàm đo mức độ sai của dự đoán so với nhãn thật; huấn luyện chính là quá trình làm nó nhỏ đi.',
    tags: ['nen-tang'],
  },
  {
    id: 'log-loss',
    vi: 'Mất mát logarit',
    en: 'Log loss / Cross-entropy',
    def: 'Hàm mất mát cho bài toán phân loại, phạt rất nặng những dự đoán vừa sai vừa tự tin.',
    tags: ['nen-tang', 'do-luong'],
  },
  {
    id: 'gradient',
    vi: 'Gradient',
    en: 'Gradient',
    def: 'Vector chỉ hướng dốc lên mạnh nhất của hàm mất mát; huấn luyện đi ngược hướng này.',
    tags: ['nen-tang'],
  },
  {
    id: 'toc-do-hoc',
    vi: 'Tốc độ học',
    en: 'Learning rate',
    def: 'Độ dài mỗi bước đi theo hướng gradient.',
    notToConfuseWith:
      'Quá nhỏ thì huấn luyện lâu vô tận; quá lớn thì nhảy qua đáy và dao động không hội tụ. Đây là siêu tham số quan trọng nhất của mọi mô hình dùng gradient.',
    tags: ['nen-tang', 'deep-learning'],
  },

  /* ---- Nguồn dữ liệu & công cụ ---- */
  {
    id: 'telemetry',
    vi: 'Dữ liệu đo từ xa',
    en: 'Telemetry',
    def: 'Luồng sự kiện do agent trên máy hoặc thiết bị mạng gửi về liên tục.',
    tags: ['du-lieu'],
  },
  {
    id: 'pcap',
    vi: 'Tệp bắt gói tin',
    en: 'PCAP',
    def: 'Định dạng lưu toàn bộ gói tin mạng thô, gồm cả nội dung.',
    notToConfuseWith:
      'NetFlow — chỉ lưu thống kê tóm tắt của mỗi luồng, nhẹ hơn hàng trăm lần nhưng không có nội dung.',
    tags: ['du-lieu'],
  },
  {
    id: 'netflow',
    vi: 'NetFlow',
    en: 'NetFlow',
    def: 'Bản ghi tóm tắt mỗi luồng mạng: nguồn, đích, cổng, giao thức, số gói, số byte, thời lượng.',
    example: 'Đủ để phát hiện beaconing và rò rỉ dữ liệu mà không cần lưu nội dung — nên khả thi ở quy mô lớn.',
    tags: ['du-lieu', 'dac-trung'],
  },
  {
    id: 'sysmon',
    vi: 'Sysmon',
    en: 'Sysmon',
    def: 'Công cụ của Windows ghi lại tiến trình, kết nối mạng, thao tác tệp và truy vấn DNS ở mức chi tiết cao.',
    example: 'Event ID 1 (tạo tiến trình), 3 (kết nối mạng), 11 (tạo tệp), 22 (truy vấn DNS).',
    tags: ['du-lieu', 'cong-cu'],
  },
  {
    id: 'cloudtrail',
    vi: 'AWS CloudTrail',
    en: 'AWS CloudTrail',
    def: 'Nhật ký ghi lại mọi lời gọi API trong tài khoản AWS — nguồn dữ liệu chính để phát hiện tấn công trên đám mây.',
    tags: ['du-lieu'],
  },
  {
    id: 'threat-intel',
    vi: 'Tình báo mối đe doạ',
    en: 'Threat intelligence',
    def: 'Thông tin về hạ tầng, công cụ và hành vi của kẻ tấn công, dùng để làm giàu ngữ cảnh cho cảnh báo.',
    tags: ['du-lieu', 'nen-tang-bao-mat'],
  },
  {
    id: 'ioc',
    vi: 'Dấu hiệu xâm nhập',
    en: 'IoC (Indicator of Compromise)',
    def: 'Một dữ kiện cụ thể gợi ý hệ thống đã bị xâm nhập: hash tệp, địa chỉ IP, tên miền, khoá registry.',
    notToConfuseWith:
      'TTP — mô tả hành vi và kỹ thuật, bền hơn nhiều so với IoC vì kẻ tấn công đổi IP dễ hơn đổi cách làm việc.',
    tags: ['nen-tang-bao-mat'],
  },
  {
    id: 'virustotal',
    vi: 'VirusTotal',
    en: 'VirusTotal',
    def: 'Dịch vụ quét một tệp hoặc URL bằng hàng chục công cụ diệt virus và trả về kết quả tổng hợp.',
    notToConfuseWith:
      'Không phải nguồn nhãn hoàn hảo: kết quả thay đổi theo thời gian, và các công cụ thường sao chép kết luận của nhau.',
    tags: ['cong-cu', 'du-lieu'],
  },
  {
    id: 'avclass',
    vi: 'AVClass',
    en: 'AVClass',
    def: 'Công cụ suy ra tên họ mã độc thống nhất từ mớ nhãn hỗn loạn của nhiều hãng diệt virus.',
    tags: ['cong-cu', 'du-lieu'],
  },
  {
    id: 'pandas',
    vi: 'pandas',
    en: 'pandas',
    def: 'Thư viện Python xử lý dữ liệu dạng bảng, nền tảng của gần như mọi quy trình phân tích dữ liệu bảo mật.',
    tags: ['cong-cu'],
  },
  {
    id: 'dataframe',
    vi: 'DataFrame',
    en: 'DataFrame',
    def: 'Cấu trúc bảng hai chiều có tên cột và kiểu dữ liệu cho từng cột.',
    tags: ['cong-cu'],
  },
  {
    id: 'groupby',
    vi: 'Gom nhóm',
    en: 'Group by',
    def: 'Phép gom các dòng theo giá trị chung rồi tính thống kê cho từng nhóm.',
    example: 'Gom log đăng nhập theo người dùng để tính số lần thất bại mỗi giờ.',
    tags: ['cong-cu'],
  },
  {
    id: 'resample',
    vi: 'Lấy mẫu lại theo thời gian',
    en: 'Resampling (time series)',
    def: 'Gộp sự kiện vào các khung thời gian đều nhau (mỗi phút, mỗi giờ) để tạo chuỗi thời gian.',
    tags: ['cong-cu', 'dac-trung'],
  },
  {
    id: 'parquet',
    vi: 'Parquet',
    en: 'Apache Parquet',
    def: 'Định dạng lưu trữ theo cột, nén tốt và đọc nhanh khi chỉ cần vài cột trong bảng rất lớn.',
    tags: ['cong-cu', 'du-lieu'],
  },
  {
    id: 'timestamp',
    vi: 'Dấu thời gian',
    en: 'Timestamp',
    def: 'Mốc thời gian của một sự kiện.',
    notToConfuseWith:
      'Trong bảo mật luôn phải hỏi: theo múi giờ nào, do máy nào ghi, và đã đồng bộ đồng hồ chưa. Lệch múi giờ làm hỏng mọi phân tích chuỗi sự kiện.',
    tags: ['du-lieu'],
  },
  {
    id: 'ocsf',
    vi: 'OCSF',
    en: 'Open Cybersecurity Schema Framework',
    def: 'Lược đồ mở chuẩn hoá sự kiện an ninh từ nhiều nguồn khác nhau về cùng một cấu trúc.',
    tags: ['du-lieu', 'khung'],
  },

  /* ---- Nhãn & bộ dữ liệu ---- */
  {
    id: 'nhan-ban',
    vi: 'Nhãn bẩn',
    en: 'Label noise',
    def: 'Nhãn sai hoặc thiếu nhất quán trong dữ liệu huấn luyện.',
    example: 'Log "lành tính" năm ngoái có thể chứa cuộc tấn công chưa bị phát hiện — mô hình học rằng nó bình thường.',
    tags: ['du-lieu'],
  },
  {
    id: 'pu-learning',
    vi: 'Học từ dữ liệu dương và không nhãn',
    en: 'PU learning (Positive-Unlabeled)',
    def: 'Kỹ thuật huấn luyện khi chỉ chắc chắn về một số mẫu dương, còn lại đều không rõ nhãn.',
    example: 'Đúng tình huống bảo mật: biết chắc vài trăm mẫu độc hại, còn hàng triệu sự kiện khác chưa ai xác minh.',
    tags: ['du-lieu'],
  },
  {
    id: 'kdd99',
    vi: 'KDD Cup 99',
    en: 'KDD Cup 99',
    def: 'Bộ dữ liệu phát hiện xâm nhập từ 1999, vẫn bị dùng rộng rãi dù đã lỗi thời nghiêm trọng.',
    notToConfuseWith:
      'Có mẫu trùng lặp lớn và lưu lượng mô phỏng không giống mạng thật; kết quả cao trên bộ này gần như không nói lên điều gì.',
    tags: ['du-lieu'],
  },
  {
    id: 'nsl-kdd',
    vi: 'NSL-KDD',
    en: 'NSL-KDD',
    def: 'Bản chỉnh sửa của KDD99, loại bỏ mẫu trùng lặp nhưng vẫn giữ nguyên lưu lượng mô phỏng từ năm 1999.',
    tags: ['du-lieu'],
  },
  {
    id: 'cic-ids2017',
    vi: 'CIC-IDS2017',
    en: 'CIC-IDS2017',
    def: 'Bộ dữ liệu phát hiện xâm nhập hiện đại hơn, sinh từ môi trường thử nghiệm có kịch bản tấn công.',
    notToConfuseWith:
      'Các nghiên cứu sau đó chỉ ra nhiều lỗi gán nhãn và tạo tác trong quy trình sinh dữ liệu; nên dùng bản đã hiệu chỉnh.',
    tags: ['du-lieu'],
  },
  {
    id: 'unsw-nb15',
    vi: 'UNSW-NB15',
    en: 'UNSW-NB15',
    def: 'Bộ dữ liệu lưu lượng mạng kèm nhãn tấn công, sinh trong phòng thí nghiệm của Đại học New South Wales.',
    tags: ['du-lieu'],
  },
  {
    id: 'sorel-20m',
    vi: 'SOREL-20M',
    en: 'SOREL-20M',
    def: 'Bộ dữ liệu 20 triệu tệp PE kèm đặc trưng và nhãn, quy mô lớn hơn nhiều so với EMBER.',
    tags: ['du-lieu'],
  },
  {
    id: 'ctu-13',
    vi: 'CTU-13',
    en: 'CTU-13',
    def: 'Bộ dữ liệu gồm 13 kịch bản lưu lượng botnet thật trộn với lưu lượng nền bình thường.',
    tags: ['du-lieu'],
  },
  {
    id: 'benchmark',
    vi: 'Bộ so chuẩn',
    en: 'Benchmark',
    def: 'Bộ dữ liệu và quy trình đánh giá dùng chung để so sánh các phương pháp với nhau.',
    notToConfuseWith:
      'Điểm cao trên bộ so chuẩn không đồng nghĩa với hiệu quả trong mạng của bạn — phân phối lưu lượng mỗi tổ chức mỗi khác.',
    tags: ['du-lieu', 'do-luong'],
  },

  /* ---- Kiểm định ---- */
  {
    id: 'holdout',
    vi: 'Tập giữ riêng',
    en: 'Holdout set',
    def: 'Phần dữ liệu tách ra và không dùng để huấn luyện, dành riêng cho việc đánh giá.',
    tags: ['do-luong'],
  },
  {
    id: 'group-split',
    vi: 'Chia theo nhóm',
    en: 'Group split',
    def: 'Chia dữ liệu sao cho mọi mẫu cùng một nhóm (họ mã độc, người dùng, máy chủ) nằm trọn về một phía.',
    example: 'Không làm vậy, 200 biến thể cùng họ nằm ở tập huấn luyện và 200 biến thể còn lại ở tập kiểm tra — mô hình chỉ cần nhận ra họ đã biết.',
    tags: ['do-luong', 'ro-ri-du-lieu'],
  },
  {
    id: 'target-leakage',
    vi: 'Rò rỉ nhãn',
    en: 'Target leakage',
    def: 'Một đặc trưng chứa sẵn thông tin về nhãn mà lúc dự đoán thật sẽ không có.',
    example: 'Đưa trường "số lần analyst đã xem cảnh báo" vào mô hình — trường này chỉ tồn tại SAU khi đã có kết luận.',
    tags: ['ro-ri-du-lieu'],
  },

  /* ---- Mã độc & mạng ---- */
  {
    id: 'sandbox',
    vi: 'Sandbox',
    en: 'Sandbox',
    def: 'Môi trường cách ly để chạy tệp nghi ngờ và quan sát hành vi của nó một cách an toàn.',
    notToConfuseWith:
      'Mã độc hiện đại thường phát hiện được sandbox và ngủ yên trong đó, nên "không thấy hành vi xấu" không chứng minh tệp sạch.',
    tags: ['cong-cu', 'ung-dung'],
  },
  {
    id: 'packer',
    vi: 'Trình nén/đóng gói',
    en: 'Packer',
    def: 'Công cụ nén hoặc mã hoá tệp thực thi, chỉ giải nén trong bộ nhớ lúc chạy.',
    notToConfuseWith:
      'Nén KHÔNG đồng nghĩa với độc hại: phần mềm thương mại cũng nén để chống sao chép. Mô hình học "có nén = độc" sẽ bắt nhầm hàng loạt.',
    tags: ['ung-dung', 'dac-trung'],
  },
  {
    id: 'imphash',
    vi: 'Imphash',
    en: 'Import hash',
    def: 'Hash tính từ danh sách hàm mà tệp PE nhập vào; các mẫu cùng được biên dịch từ một mã nguồn thường trùng imphash.',
    example: 'Dùng để gom nhóm biến thể cùng họ mã độc mà không cần phân tích sâu.',
    tags: ['dac-trung', 'ung-dung'],
  },
  {
    id: 'tlsh',
    vi: 'TLSH',
    en: 'TLSH (Trend Micro Locality Sensitive Hash)',
    def: 'Hash "mờ" cho giá trị gần nhau khi hai tệp gần giống nhau — ngược hẳn với hash mật mã.',
    notToConfuseWith:
      'SHA-256 đổi hoàn toàn khi đổi 1 bit, nên không dùng được để đo độ giống nhau.',
    tags: ['dac-trung', 'ung-dung'],
  },
  {
    id: 'ma-doc-dong',
    vi: 'Phân tích động',
    en: 'Dynamic analysis',
    def: 'Chạy mẫu trong môi trường có giám sát và ghi lại hành vi thật của nó.',
    notToConfuseWith:
      'Phân tích tĩnh — đọc tệp mà không chạy; nhanh và an toàn hơn nhưng bị đánh bại bởi nén và làm rối mã.',
    tags: ['ung-dung'],
  },
  {
    id: 'log-parsing',
    vi: 'Bóc tách log',
    en: 'Log parsing',
    def: 'Biến dòng log tự do thành cấu trúc có trường rõ ràng, thường bằng cách rút ra mẫu khuôn (template).',
    example: 'Thuật toán Drain gom các dòng log cùng khuôn lại, tách phần cố định khỏi phần tham số.',
    tags: ['du-lieu', 'ung-dung'],
  },
  {
    id: 'punycode',
    vi: 'Punycode',
    en: 'Punycode',
    def: 'Cách mã hoá tên miền chứa ký tự ngoài bảng ASCII, bắt đầu bằng tiền tố xn--.',
    example: 'Dùng để tạo tên miền trông giống hệt thương hiệu thật bằng chữ cái từ bảng mã khác.',
    tags: ['dac-trung', 'ung-dung'],
  },
  {
    id: 'dmarc',
    vi: 'DMARC',
    en: 'DMARC',
    def: 'Chuẩn xác thực email dựa trên SPF và DKIM, quy định cách xử lý thư không qua được kiểm tra.',
    tags: ['nen-tang-bao-mat', 'dac-trung'],
  },
  {
    id: 'ja3',
    vi: 'Vân tay JA3',
    en: 'JA3 fingerprint',
    def: 'Chuỗi băm đặc trưng cho cách một ứng dụng thiết lập kết nối TLS.',
    example: 'Cho phép nhận diện công cụ đứng sau kết nối đã mã hoá mà không cần giải mã nội dung.',
    tags: ['dac-trung', 'ung-dung'],
  },
  {
    id: 'peer-group',
    vi: 'Nhóm tương đương',
    en: 'Peer group',
    def: 'Tập người dùng hoặc máy có vai trò tương tự, dùng làm mốc so sánh thay cho đường cơ sở toàn tổ chức.',
    example: 'Một kế toán truy cập 200 tệp lúc 3 giờ sáng là bất thường; với đội vận hành thì không.',
    tags: ['ung-dung', 'dac-trung'],
  },

  /* ---- Học sâu ---- */
  {
    id: 'perceptron',
    vi: 'Perceptron',
    en: 'Perceptron',
    def: 'Đơn vị tính toán đơn giản nhất: tổng có trọng số của đầu vào rồi so với một ngưỡng.',
    notToConfuseWith:
      'Một perceptron đơn không giải được XOR — kết quả từng khiến ngành AI đình trệ gần hai thập kỷ.',
    tags: ['deep-learning'],
  },
  {
    id: 'ham-kich-hoat',
    vi: 'Hàm kích hoạt',
    en: 'Activation function',
    def: 'Hàm phi tuyến đặt sau mỗi nơ-ron; không có nó, mạng nhiều lớp sụp về đúng một phép biến đổi tuyến tính.',
    tags: ['deep-learning'],
  },
  {
    id: 'relu',
    vi: 'ReLU',
    en: 'ReLU (Rectified Linear Unit)',
    def: 'Hàm kích hoạt trả về 0 với đầu vào âm và giữ nguyên với đầu vào dương.',
    tags: ['deep-learning'],
  },
  {
    id: 'mlp',
    vi: 'Mạng perceptron nhiều lớp',
    en: 'MLP (Multi-Layer Perceptron)',
    def: 'Mạng nơ-ron gồm các lớp kết nối đầy đủ, mỗi lớp học một mức trừu tượng cao hơn lớp trước.',
    tags: ['deep-learning'],
  },
  {
    id: 'cnn',
    vi: 'Mạng nơ-ron tích chập',
    en: 'CNN (Convolutional Neural Network)',
    def: 'Mạng dùng bộ lọc trượt để bắt mẫu cục bộ, bất kể mẫu đó nằm ở vị trí nào.',
    example: 'Áp lên chuỗi byte của tệp PE để phát hiện đoạn mã đặc trưng mà không cần hiểu cấu trúc tệp.',
    tags: ['deep-learning'],
  },
  {
    id: 'lstm',
    vi: 'LSTM',
    en: 'LSTM (Long Short-Term Memory)',
    def: 'Kiến trúc mạng hồi quy có cơ chế cổng, giữ được thông tin qua chuỗi dài.',
    example: 'Dùng cho chuỗi lời gọi API hoặc chuỗi sự kiện log, nơi thứ tự mang ý nghĩa.',
    tags: ['deep-learning'],
  },
  {
    id: 'knn',
    vi: 'k láng giềng gần nhất',
    en: 'k-NN (k-Nearest Neighbors)',
    def: 'Dự đoán nhãn của một mẫu bằng cách bỏ phiếu theo k mẫu gần nhất trong dữ liệu đã biết.',
    notToConfuseWith:
      'Không có giai đoạn huấn luyện, nhưng mỗi lần dự đoán phải so với toàn bộ kho dữ liệu.',
    tags: ['thuat-toan'],
  },
  {
    id: 'svm',
    vi: 'Máy vector hỗ trợ',
    en: 'SVM (Support Vector Machine)',
    def: 'Mô hình tìm ranh giới phân chia có lề rộng nhất giữa hai lớp.',
    tags: ['thuat-toan'],
  },

  /* ---- Vận hành ---- */
  {
    id: 'phong-thu-nhieu-tang',
    vi: 'Phòng thủ nhiều tầng',
    en: 'Defence in depth',
    def: 'Xếp chồng nhiều lớp kiểm soát độc lập, sao cho một lớp bị vượt qua vẫn còn lớp khác chặn lại.',
    example: 'Với agent LLM: lọc đầu vào, tách đặc quyền, danh sách trắng đích đến, và người xác nhận hành động rủi ro.',
    tags: ['van-hanh', 'llm'],
  },

  /* ---- Học tập (sửa lỗi chính tả id) ---- */
  {
    id: 'giãn-cach',
    vi: 'Lặp lại giãn cách',
    en: 'Spaced repetition',
    def: 'Ôn lại vào thời điểm sắp quên, khoảng cách tăng dần sau mỗi lần nhớ thành công.',
    notToConfuseWith: 'Cùng nghĩa với mục "gian-cach"; giữ cả hai id vì nội dung bài dùng lẫn hai cách viết.',
    tags: ['cach-hoc'],
  },
];
