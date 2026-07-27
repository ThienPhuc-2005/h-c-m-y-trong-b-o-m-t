import type { Track } from './types';

/**
 * CHẶNG 1 — Nền móng: toán và dữ liệu vừa đủ.
 *
 * Nguyên tắc biên soạn của chặng này:
 *  (a) Không có công thức nào xuất hiện trước một ví dụ bảo mật cụ thể.
 *  (b) Mọi ký hiệu toán đều được đọc thành lời trước khi được dùng.
 *  (c) Chỉ dạy phần toán thật sự xuất hiện trong công việc phát hiện/điều tra —
 *      bỏ hẳn phần đẹp nhưng không dùng tới.
 */
export const track1: Track = {
  id: 'nen-mong',
  order: 1,
  title: 'Nền móng: toán và dữ liệu vừa đủ',
  tagline: 'Chỉ học phần toán bạn thật sự sẽ dùng',
  icon: 'ruler',
  hue: 't1',
  blurb:
    'Bảy bài toán nền tảng, mỗi bài bắt đầu từ một dòng log thật chứ không từ định nghĩa. Bạn sẽ học đúng lượng xác suất, thống kê, entropy, đại số tuyến tính và giải tích cần để đọc hiểu mọi mô hình về sau. Không cần biết toán cao cấp trước khi vào.',
  outcomes: [
    'Biến một dòng log Zeek hoặc một URL thành vector số mà scikit-learn nhận được',
    'Tính bằng tay xác suất một cảnh báo là tấn công thật, từ tỉ lệ nền và tỉ lệ báo động giả',
    'Giải thích cho sếp vì sao IDS có FPR 1% vẫn tạo 100.000 cảnh báo rác mỗi ngày',
    'Chọn ngưỡng bất thường bằng phân vị và MAD thay vì công thức 3-sigma sai lầm',
    'Dùng entropy để sàng tên miền DGA và tệp bị nén, đồng thời biết khi nào entropy nói dối',
    'Đọc được ký hiệu gradient trong một bài báo và biết learning rate đang làm gì',
  ],
  lessons: [
    /* ====================================================================== */
    {
      id: 't1-l1',
      trackId: 'nen-mong',
      title: 'Vector đặc trưng: biến log thành số',
      subtitle: 'Mô hình không đọc log — nó chỉ ăn được một hàng số. Đây là cách bạn nấu hàng số đó.',
      minutes: 20,
      practiceMinutes: 7,
      level: 'nen-tang',
      prereqs: ['t0-l1'],
      why: {
        short:
          'Mọi thuật toán học máy, không trừ cái nào, chỉ nhận đầu vào là mảng số — nên bước biến log thành số quyết định trần chất lượng của toàn bộ hệ thống phát hiện.',
        scenario:
          'Bạn có 40 GB conn.log của Zeek và một yêu cầu: xây mô hình chấm điểm kết nối đáng ngờ. Trước khi gõ dòng `fit()` đầu tiên, bạn phải quyết định cột `id.resp_p = 443` trở thành con số 443, hay 12 cột nhị phân, hay một nhóm cổng. Chọn sai ở đây thì mọi thứ phía sau đều vô nghĩa.',
        roles: ['Detection Engineer', 'Security Data Scientist', 'ML Engineer'],
        costOfNotKnowing:
          'Bạn đưa số hiệu cổng vào mô hình như một con số liên tục, mô hình học được rằng cổng 445 "lớn hơn" cổng 80 và "gần" cổng 443 — một quan hệ hoàn toàn bịa đặt. Mô hình sẽ chạy, cho ra AUC đẹp trên tập kiểm tra, và sập ngay khi gặp lưu lượng thật.',
      },
      objectives: [
        'Biến một dòng conn.log của Zeek thành vector số, giải thích được lựa chọn mã hoá cho từng trường',
        'Phân biệt trường số, trường hạng mục và trường tuần hoàn, chọn đúng cách mã hoá cho mỗi loại',
        'Chỉ ra được vì sao chuẩn hoá phải nằm trong pipeline chứ không chạy trước khi chia dữ liệu',
        'Nêu được hai họ mô hình cần chuẩn hoá và hai họ không cần',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bạn có cột "số hiệu cổng đích" với các giá trị 80, 443, 445, 3389, 51314. Nếu bạn đưa thẳng cột này vào một mô hình k-NN, mô hình sẽ coi cổng 445 (SMB, hay bị khai thác) gần với cổng nào nhất? Điều đó có ý nghĩa gì về mặt bảo mật không?',
          reveal:
            'Mô hình sẽ coi 445 gần 443 nhất (cách 2 đơn vị) và xa 51314 nhất (cách gần 51.000 đơn vị). Về mặt bảo mật, đây là điều vô nghĩa hoàn toàn: 443 là HTTPS, 445 là SMB — hai giao thức không liên quan gì tới nhau, chỉ tình cờ có số hiệu gần nhau. Ngược lại, 51314 và 51315 đều là cổng phù du (ephemeral) do hệ điều hành cấp phát, thực chất **giống hệt nhau** về ý nghĩa, nhưng mô hình lại coi chúng khác nhau như 80 với 81. Số hiệu cổng là **nhãn**, không phải **lượng**. Đây là sai lầm mã hoá phổ biến nhất trong ML bảo mật, và nó âm thầm phá hoại mà không báo lỗi.',
        },
        {
          t: 'p',
          md: 'Bắt đầu bằng một sự thật cứng: **không có thuật toán học máy nào đọc được chữ.** LightGBM, PyTorch, scikit-learn — tất cả đều nhận vào một ma trận số. Bạn có `n` mẫu, mỗi mẫu có `d` con số, thế thôi. Một mẫu là một hàng, gọi là **vector đặc trưng** (feature vector).',
        },
        {
          t: 'p',
          md: 'Vậy câu hỏi thật của cả nghề này không phải "dùng thuật toán nào" mà là: *một sự kiện bảo mật nên trở thành hàng số nào?* Trả lời câu đó tốt thì hồi quy logistic cũng thắng. Trả lời tệ thì mạng nơ-ron 200 lớp cũng thua.',
        },
        {
          t: 'h',
          text: 'Ví dụ mẫu: một dòng conn.log thành 14 con số',
          level: 2,
        },
        {
          t: 'code',
          lang: 'text',
          caption: 'Một dòng conn.log của Zeek (đã bỏ bớt trường cho gọn)',
          code: `ts=1706160000.123  uid=CwXyz1
id.orig_h=10.0.0.42   id.orig_p=51314
id.resp_h=203.0.113.9 id.resp_p=443
proto=tcp  service=ssl  conn_state=SF
duration=12.418  orig_bytes=3820  resp_bytes=148930
orig_pkts=42  resp_pkts=68`,
        },
        {
          t: 'steps',
          title: 'Biến dòng log trên thành vector, từng trường một',
          steps: [
            {
              title: 'Trường số thật sự là số — giữ nguyên, có thể biến đổi',
              md: '`duration=12.418`, `orig_bytes=3820`, `resp_bytes=148930`, `orig_pkts=42`, `resp_pkts=68`. Đây là **lượng** thật: 148930 thực sự lớn hơn 3820 và phép trừ có nghĩa. Giữ nguyên 5 con số này. Với byte, thường nên thêm `log(1 + x)` vì phân phối lệch phải cực mạnh (bài t1-l4 sẽ giải thích vì sao).',
            },
            {
              title: 'Đặc trưng dẫn xuất thường mạnh hơn đặc trưng thô',
              md: '`ty_le_byte = resp_bytes / (orig_bytes + 1)` = 148930/3821 ≈ **39,0**. Con số này nói: máy trong mạng gửi ít, nhận nhiều — mẫu hình tải về. Đảo lại, tỉ lệ 0,02 nghĩa là gửi nhiều nhận ít — mẫu hình **rò rỉ dữ liệu ra ngoài** (exfiltration). Một cột tỉ lệ thường có giá trị hơn hai cột byte thô cộng lại, vì nó đã mã hoá sẵn hiểu biết nghiệp vụ.',
            },
            {
              title: 'Trường hạng mục ít giá trị — one-hot',
              md: '`proto` chỉ có 3 giá trị thực tế (tcp/udp/icmp) nên biến thành 3 cột nhị phân: tcp → `[1, 0, 0]`. Đây là **mã hoá one-hot**. Tương tự `conn_state` của Zeek có 13 giá trị (S0, S1, SF, REJ, RSTO, RSTR, SH, ...) → 13 cột, riêng SF bật 1. Vì sao không đánh số 1..13? Vì đánh số sẽ bịa ra quan hệ thứ tự: REJ không "lớn hơn" S0.',
            },
            {
              title: 'Trường hạng mục nhiều giá trị — nhóm lại hoặc băm',
              md: '`id.resp_p=443`: đừng dùng làm số. Cách thực dụng nhất là **one-hot cho 20 cổng phổ biến nhất** (80, 443, 53, 22, 445, 3389, 25, ...) cộng một cột `khac`, cộng một cột nhị phân `la_cong_phu_du` (port ≥ 49152). Với trường có hàng trăm nghìn giá trị như User-Agent, one-hot sẽ nổ tung — dùng **hashing trick** (`HashingVectorizer`) băm xuống 2^12 = 4096 cột, hoặc mã hoá theo tần suất xuất hiện.',
            },
            {
              title: 'Trường tuần hoàn — sin và cos, không phải số nguyên',
              md: 'Giờ trong ngày của `ts` là 3 giờ sáng. Nếu mã hoá thành số 3, mô hình sẽ nghĩ 23 giờ và 0 giờ cách nhau 23 đơn vị — trong khi thực tế chúng cách nhau 1 tiếng. Cách đúng: hai cột `sin(2·pi·h/24)` và `cos(2·pi·h/24)`. Với h = 3: sin ≈ **0,707**, cos ≈ **0,707**. Với h = 23: sin ≈ −0,259, cos ≈ 0,966 — nằm sát điểm của h = 0. Quan trọng vì "hoạt động ngoài giờ" là một trong những tín hiệu bền nhất trong UEBA.',
            },
            {
              title: 'Địa chỉ IP — không bao giờ là số',
              md: '`10.0.0.42` chuyển thành số nguyên 167772202 là một cái bẫy chết người: mô hình sẽ học thuộc các IP cụ thể trong tập huấn luyện và vô dụng khi gặp IP mới. Thay vào đó rút ra **thuộc tính**: nội bộ hay ngoại vi, thuộc ASN nào, quốc gia, tuổi của tên miền phân giải ngược, đã từng thấy trong 30 ngày qua chưa. Đó mới là thứ tổng quát hoá được.',
            },
          ],
        },
        {
          t: 'figure',
          id: 'fig-feature-space',
          caption:
            'Sau khi mã hoá, mỗi sự kiện là một điểm trong không gian d chiều. Việc của mô hình chỉ là vẽ một đường ngăn vùng đỏ khỏi vùng xanh. Nếu cách bạn đặt trục làm hai vùng trộn vào nhau, không thuật toán nào cứu được.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Trực giác cốt lõi',
          md: 'Mã hoá đặc trưng chính là **chọn hệ trục toạ độ**. Cùng một tập dữ liệu, đặt trục khéo thì hai lớp tách ra rõ ràng và một đường thẳng là đủ; đặt trục vụng thì hai lớp quấn vào nhau và không mô hình nào gỡ được. Đây là lý do trong thực tế, thời gian làm đặc trưng thường chiếm 70–80% dự án, còn chọn thuật toán chiếm vài phần trăm.',
        },
        {
          t: 'h',
          text: 'Thang đo: vì sao 148930 lấn át 12,4',
          level: 2,
        },
        {
          t: 'p',
          md: 'Vector của chúng ta có `resp_bytes = 148930` nằm cạnh `duration = 12,418`. Với các mô hình đo khoảng cách hoặc cộng có trọng số, cột byte sẽ **áp đảo** hoàn toàn cột thời lượng — không phải vì nó quan trọng hơn, mà chỉ vì đơn vị của nó lớn hơn 10.000 lần.',
        },
        {
          t: 'table',
          caption: 'Hai cách chuẩn hoá hay dùng nhất và khi nào chọn cái nào',
          head: ['Cách', 'Công thức', 'Kết quả', 'Dùng khi'],
          rows: [
            [
              'Chuẩn hoá z (StandardScaler)',
              'z = (x − trung bình) / độ lệch chuẩn',
              'Trung bình 0, độ lệch chuẩn 1, không giới hạn biên',
              'Dữ liệu gần đối xứng; mô hình tuyến tính, SVM, mạng nơ-ron',
            ],
            [
              'Co về đoạn [0,1] (MinMaxScaler)',
              'x_moi = (x − min) / (max − min)',
              'Luôn nằm trong 0..1',
              'Cần biên cứng; nhưng một ngoại lai duy nhất sẽ ép mọi điểm còn lại về gần 0',
            ],
            [
              'Chuẩn hoá bền (RobustScaler)',
              'z = (x − trung vị) / IQR',
              'Không bị ngoại lai kéo lệch',
              'Dữ liệu mạng có đuôi nặng — tức là hầu hết trường hợp trong bảo mật',
            ],
            [
              'Biến đổi log',
              'x_moi = log(1 + x)',
              'Nén đuôi phải, 1 KB và 1 GB về cùng thang',
              'Byte, thời lượng, số lần thử — mọi thứ trải nhiều bậc độ lớn',
            ],
          ],
        },
        {
          t: 'compare',
          title: 'Mô hình nào cần chuẩn hoá?',
          left: {
            title: '📏 CẦN chuẩn hoá',
            items: [
              'Hồi quy logistic và tuyến tính (nhất là khi có regularization L1/L2)',
              'k-NN, k-means, DBSCAN — mọi thứ tính khoảng cách',
              'SVM với kernel RBF',
              'Mạng nơ-ron (không chuẩn hoá thì gradient loạn, học rất chậm)',
              'PCA và mọi phép giảm chiều dựa trên phương sai',
            ],
          },
          right: {
            title: '🌳 KHÔNG cần chuẩn hoá',
            items: [
              'Cây quyết định đơn lẻ',
              'Random Forest',
              'XGBoost, LightGBM, CatBoost',
              'Lý do: cây chỉ hỏi "x có lớn hơn ngưỡng t không", câu trả lời không đổi khi bạn đổi đơn vị',
              'Hệ quả thực tế: trên dữ liệu bảng của bảo mật, cây tăng cường vừa mạnh vừa ít việc tiền xử lý — đó là lý do nó thống trị',
            ],
          },
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't1l1-cp1',
              kind: 'mcq',
              tags: ['dac-trung', 'ma-hoa'],
              q: 'Cột `country_code` của IP nguồn có 180 giá trị (VN, US, CN, RU, ...). Bạn định dùng LightGBM. Cách xử lý hợp lý nhất?',
              options: [
                'Đánh số theo bảng chữ cái: AF=1, AL=2, ... rồi dùng như cột số',
                'One-hot cho 15–20 quốc gia hay gặp nhất, gộp phần còn lại thành cột "khac"',
                'Chuẩn hoá z cho cột mã quốc gia sau khi đánh số',
                'Bỏ cột này vì mô hình không xử lý được chữ',
              ],
              answer: 1,
              why: 'Đây là trường hạng mục có lực lượng trung bình. One-hot toàn bộ 180 cột tạo ra rất nhiều cột chỉ có vài mẫu — cây sẽ chia trên nhiễu. Gộp đuôi thành "khac" giữ được tín hiệu của các quốc gia đủ dữ liệu mà không nổ số chiều. (LightGBM còn có tham số `categorical_feature` xử lý trực tiếp, nhưng nguyên tắc gộp đuôi vẫn giữ nguyên.)',
              distractorWhy: [
                'Đánh số theo bảng chữ cái bịa ra thứ tự: Albania không "nhỏ hơn" Algeria về mặt rủi ro. Cây sẽ chia ở những chỗ vô nghĩa.',
                '',
                'Chuẩn hoá một mã số vô nghĩa vẫn cho ra một mã số vô nghĩa — chỉ khác thang đo.',
                'Quốc gia nguồn là một trong những đặc trưng ngữ cảnh hữu ích nhất; bỏ đi là mất tín hiệu thật.',
              ],
            },
            {
              id: 't1l1-cp2',
              kind: 'truefalse',
              tags: ['ma-hoa', 'ro-ri-du-lieu'],
              q: 'Nên gọi `StandardScaler().fit_transform(X)` trên toàn bộ dữ liệu rồi mới chia train/test cho tiện.',
              answer: false,
              why: 'Đây là **rò rỉ dữ liệu** (data leakage). Trung bình và độ lệch chuẩn tính trên toàn bộ dữ liệu đã chứa thông tin của tập kiểm tra, nên điểm số bạn đo được lạc quan hơn thực tế. Cách đúng: `fit` chỉ trên tập huấn luyện, `transform` cho cả hai — và tốt nhất là gói vào `Pipeline` để không thể quên.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Pipeline mã hoá đúng cách — chuẩn hoá và one-hot nằm bên trong, không thể rò rỉ',
          code: `import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

cot_so  = ['duration', 'log_orig_bytes', 'log_resp_bytes', 'ty_le_byte', 'gio_sin', 'gio_cos']
cot_chu = ['proto', 'service', 'conn_state', 'nhom_cong']

tien_xu_ly = ColumnTransformer([
    ('so',  StandardScaler(), cot_so),
    # handle_unknown='ignore' là BẮT BUỘC: lúc chạy thật sẽ xuất hiện
    # giá trị chưa từng thấy khi huấn luyện, nếu không sẽ ném lỗi giữa ca trực.
    ('chu', OneHotEncoder(handle_unknown='ignore', min_frequency=20), cot_chu),
])

mo_hinh = Pipeline([
    ('tien_xu_ly', tien_xu_ly),
    ('bo_phan_loai', LogisticRegression(max_iter=1000, class_weight='balanced')),
])

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, shuffle=False)  # chia theo thời gian
mo_hinh.fit(X_tr, y_tr)          # scaler chỉ học thống kê từ X_tr
diem = mo_hinh.predict_proba(X_te)[:, 1]`,
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Ba cái bẫy mã hoá làm hỏng mô hình mà không báo lỗi',
          md: '**1. Trường hạng mục dùng như số** — cổng, mã lỗi HTTP, ASN, mã quốc gia. Mô hình chạy bình thường, kết quả sai âm thầm.\n\n**2. Giá trị mới lúc chạy thật.** Tập huấn luyện chỉ có `service` là ssl/http/dns; hôm triển khai gặp `service=quic`. Không có `handle_unknown=ignore` thì hệ thống phát hiện của bạn ném exception lúc 2 giờ sáng.\n\n**3. Đặc trưng lộ đáp án (target leakage).** Ai đó thêm cột `alert_severity` vào bộ đặc trưng — nhưng cột đó do chính hệ thống phát hiện cũ sinh ra sau khi đã biết kết quả. Mô hình đạt AUC 0,99 và hoàn toàn vô dụng. Quy tắc kiểm tra: **tại thời điểm cần ra quyết định, giá trị này đã tồn tại chưa?**',
        },
        {
          t: 'lab',
          id: 'lab-url-features',
          intro:
            'Dán một URL bất kỳ vào và xem nó bị bẻ thành bao nhiêu con số: độ dài, số dấu chấm, entropy, tuổi tên miền, có IP thay tên miền không. Thử một URL phishing thật và một URL ngân hàng để thấy các cột nào tách ra.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Mẹo thực chiến: đặt tên cột như đặt tên biến',
          md: 'Trong dự án thật, bộ đặc trưng sẽ phình lên 200–2.000 cột và bạn sẽ phải giải thích với analyst vì sao mô hình cảnh báo. Đặt tên theo mẫu `nguon__phepdo__cuaso`, ví dụ `zeek__resp_bytes_p95__24h`, `ad__so_lan_dang_nhap_that_bai__1h`. Sáu tháng sau, chính bạn là người biết ơn.',
        },
        {
          t: 'terms',
          ids: ['vector-dac-trung', 'one-hot', 'chuan-hoa', 'ro-ri-du-lieu', 'hashing-trick'],
        },
      ],
      keyTakeaways: [
        'Mọi mô hình chỉ ăn ma trận số; một sự kiện = một hàng số gọi là vector đặc trưng.',
        'Số hiệu cổng, mã lỗi, mã quốc gia, IP là NHÃN chứ không phải LƯỢNG — dùng one-hot hoặc nhóm, đừng dùng như số.',
        'Trường tuần hoàn (giờ, thứ) cần mã hoá bằng sin/cos, nếu không 23 giờ và 0 giờ sẽ cách nhau rất xa.',
        'Đặc trưng dẫn xuất mang hiểu biết nghiệp vụ (tỉ lệ byte gửi/nhận) thường mạnh hơn cột thô.',
        'Chuẩn hoá phải nằm trong Pipeline và chỉ fit trên tập huấn luyện, nếu không sẽ rò rỉ dữ liệu.',
        'Mô hình khoảng cách và tuyến tính cần chuẩn hoá; cây và cây tăng cường thì không.',
      ],
      cards: [
        {
          id: 't1l1-c1',
          front: 'Vì sao không được đưa số hiệu cổng (80, 443, 445) vào mô hình như một cột số?',
          back: 'Vì cổng là nhãn, không phải lượng: khoảng cách giữa 443 và 445 không mang ý nghĩa bảo mật nào. Phải one-hot các cổng phổ biến hoặc gộp thành nhóm.',
          tags: ['dac-trung', 'ma-hoa'],
        },
        {
          id: 't1l1-c2',
          front: 'Mã hoá giờ trong ngày thế nào để 23 giờ và 0 giờ ở gần nhau?',
          back: 'Dùng hai cột sin(2·pi·h/24) và cos(2·pi·h/24). Biến tuần hoàn cần toạ độ trên vòng tròn, không phải một số nguyên 0..23.',
          hint: 'Nghĩ tới mặt đồng hồ.',
          tags: ['dac-trung', 'ma-hoa'],
        },
        {
          id: 't1l1-c3',
          front: 'Vì sao phải fit scaler chỉ trên tập huấn luyện chứ không trên toàn bộ dữ liệu?',
          back: 'Vì trung bình và độ lệch chuẩn tính trên toàn bộ dữ liệu đã chứa thông tin của tập kiểm tra — đó là rò rỉ dữ liệu, khiến điểm đánh giá lạc quan giả tạo.',
          tags: ['ro-ri-du-lieu'],
        },
        {
          id: 't1l1-c4',
          front: 'Nêu hai họ mô hình KHÔNG cần chuẩn hoá đặc trưng và lý do.',
          back: 'Cây quyết định và các bộ cây tăng cường (Random Forest, XGBoost, LightGBM). Chúng chỉ so sánh x với ngưỡng, nên đổi đơn vị không làm đổi cách chia.',
          tags: ['chuan-hoa'],
        },
        {
          id: 't1l1-c5',
          front: 'Câu hỏi một dòng để phát hiện target leakage trong một đặc trưng là gì?',
          back: 'Tại đúng thời điểm mô hình phải ra quyết định, giá trị này đã tồn tại chưa? Nếu nó chỉ có sau khi đã biết kết quả thì đó là rò rỉ.',
          tags: ['ro-ri-du-lieu'],
        },
      ],
      quiz: [
        {
          id: 't1l1-q1',
          kind: 'mcq',
          tags: ['dac-trung', 'ma-hoa'],
          q: 'Bạn xây mô hình phát hiện rò rỉ dữ liệu ra ngoài. Đặc trưng nào nhiều khả năng hữu ích nhất?',
          options: [
            'Địa chỉ IP nguồn chuyển thành số nguyên 32 bit',
            'Tỉ lệ byte gửi ra trên byte nhận vào của phiên kết nối',
            'Số hiệu cổng đích dùng làm giá trị số',
            'Giờ trong ngày mã hoá thành số nguyên 0..23',
          ],
          answer: 1,
          why: 'Rò rỉ dữ liệu có một dấu hiệu hành vi rõ ràng: máy trong mạng **gửi** nhiều hơn hẳn lượng **nhận**, ngược với mẫu hình duyệt web bình thường. Tỉ lệ này còn có ưu điểm là không phụ thuộc quy mô tuyệt đối, nên áp dụng được cho cả máy trạm lẫn máy chủ. Ba lựa chọn còn lại đều là những lỗi mã hoá đã nêu trong bài.',
          distractorWhy: [
            'IP thành số nguyên khiến mô hình học thuộc từng IP cụ thể và mất tác dụng với IP mới.',
            '',
            'Cổng là nhãn, không phải lượng.',
            'Giờ là biến tuần hoàn; mã hoá 0..23 làm 23 giờ và 0 giờ cách nhau 23 đơn vị.',
          ],
        },
        {
          id: 't1l1-q2',
          kind: 'multi',
          tags: ['chuan-hoa'],
          q: 'Trường hợp nào BẮT BUỘC phải chuẩn hoá đặc trưng trước khi huấn luyện? (Chọn tất cả)',
          options: [
            'k-means phân cụm luồng NetFlow',
            'LightGBM phân loại tệp PE',
            'Hồi quy logistic có phạt L2 trên đặc trưng URL',
            'Random Forest xếp hạng cảnh báo',
          ],
          answers: [0, 2],
          why: 'k-means tính khoảng cách Euclid nên một cột đơn vị byte sẽ nuốt chửng mọi cột khác. Hồi quy logistic có phạt L2 thì mức phạt áp lên trọng số, mà trọng số tỉ lệ nghịch với thang đo đặc trưng — không chuẩn hoá thì hình phạt phân bổ hoàn toàn lệch. Các mô hình cây chỉ so sánh với ngưỡng nên miễn nhiễm với thang đo.',
        },
        {
          id: 't1l1-q3',
          kind: 'input',
          tags: ['ma-hoa'],
          q: 'Kỹ thuật biến một trường hạng mục có hàng trăm nghìn giá trị (ví dụ User-Agent) thành số cột cố định bằng cách băm, tên tiếng Anh là gì?',
          accept: ['hashing trick', 'feature hashing', 'ky thuat bam', 'hashing'],
          placeholder: 'Gõ tên kỹ thuật…',
          hint: 'Hai từ tiếng Anh, từ đầu liên quan tới hàm băm.',
          why: 'Hashing trick (còn gọi là feature hashing) băm mỗi giá trị vào một trong 2^k ô cố định. Ưu điểm: bộ nhớ cố định, không cần lưu từ điển, xử lý được giá trị chưa từng thấy. Nhược điểm: có va chạm băm và bạn mất khả năng truy ngược cột nào ứng với giá trị nào — đánh đổi khả năng giải thích lấy khả năng mở rộng.',
        },
        {
          id: 't1l1-q4',
          kind: 'order',
          tags: ['quy-trinh', 'ro-ri-du-lieu'],
          q: 'Sắp xếp đúng thứ tự các bước xây bộ đặc trưng cho một mô hình phát hiện.',
          items: [
            'Xác định thời điểm ra quyết định và những dữ liệu đã tồn tại lúc đó',
            'Chia dữ liệu theo mốc thời gian thành tập huấn luyện và tập kiểm tra',
            'Fit bộ mã hoá và bộ chuẩn hoá chỉ trên tập huấn luyện',
            'Transform cả hai tập bằng bộ mã hoá đã fit',
            'Huấn luyện mô hình và đánh giá trên tập kiểm tra',
          ],
          why: 'Thứ tự này tồn tại để chặn rò rỉ. Xác định thời điểm quyết định trước giúp loại bỏ đặc trưng "nhìn thấy tương lai". Chia dữ liệu TRƯỚC khi fit bộ mã hoá là điểm mấu chốt: mọi thống kê (trung bình, độ lệch chuẩn, danh sách hạng mục) chỉ được phép học từ quá khứ.',
        },
        {
          id: 't1l1-q5',
          kind: 'truefalse',
          tags: ['dac-trung'],
          q: 'Chọn thuật toán tốt hơn thường cải thiện kết quả nhiều hơn là làm đặc trưng tốt hơn.',
          answer: false,
          why: 'Ngược lại, và khoảng cách rất lớn. Đặc trưng quyết định **trần** của bài toán: nếu thông tin phân biệt hai lớp không có trong các cột, không thuật toán nào tạo ra nó được. Đổi từ Random Forest sang LightGBM thường nhích vài phần trăm; thêm một đặc trưng hành vi đúng (ví dụ tỉ lệ byte gửi/nhận, hay số tên miền NXDOMAIN trong 1 giờ) có thể đổi hẳn cục diện.',
        },
      ],
      terms: ['vector-dac-trung', 'one-hot', 'chuan-hoa', 'ro-ri-du-lieu', 'hashing-trick'],
      further: [
        {
          title: 'scikit-learn User Guide — Preprocessing data',
          note: 'Tài liệu chính thức, ngắn và chính xác về ColumnTransformer, các scaler và OneHotEncoder. Đọc mục 6.3.',
          url: 'https://scikit-learn.org/stable/modules/preprocessing.html',
        },
        {
          title: 'Zeek conn.log field reference',
          note: 'Bảng tra ý nghĩa từng trường, đặc biệt là 13 giá trị conn_state — hiểu chúng là hiểu nửa bài toán phát hiện mạng.',
          url: 'https://docs.zeek.org/en/master/logs/conn.html',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't1-l2',
      trackId: 'nen-mong',
      title: 'Xác suất và định lý Bayes cho người làm bảo mật',
      subtitle: 'Hai câu hỏi nghe giống hệt nhau nhưng cho ra hai đáp số cách nhau 100 lần',
      minutes: 18,
      practiceMinutes: 3,
      level: 'nen-tang',
      prereqs: ['t1-l1'],
      why: {
        short:
          'Gần như mọi hiểu lầm chết người về hệ thống phát hiện đều bắt nguồn từ việc lẫn lộn "xác suất cảnh báo kêu khi có tấn công" với "xác suất có tấn công khi cảnh báo kêu".',
        scenario:
          'Nhà cung cấp nói: "Sản phẩm của chúng tôi phát hiện 99% mã độc." Sếp bạn hiểu thành: "99% cảnh báo nó đưa ra là mã độc thật." Hai câu đó khác nhau, và trong môi trường thật con số thứ hai có thể là 3%. Bạn phải chỉ ra được chỗ khác nhau ngay trong cuộc họp.',
        roles: ['SOC Analyst', 'Detection Engineer', 'Threat Hunter', 'Security Data Scientist'],
        costOfNotKnowing:
          'Bạn mua sản phẩm dựa trên con số sai, cam kết SLA không thể đạt, và sáu tháng sau đội SOC của bạn nghỉ việc vì phải xử lý 4.000 cảnh báo rác mỗi ngày mà lãnh đạo tưởng là 40.',
      },
      objectives: [
        'Đọc và viết đúng ký hiệu P(A|B), phân biệt được nó với P(B|A) trong một tình huống bảo mật cụ thể',
        'Giải một bài toán Bayes bằng số nguyên (dạng tần suất tự nhiên) mà không cần công thức',
        'Viết ra được công thức Bayes và gọi tên bốn thành phần: tiên nghiệm, khả năng, bằng chứng, hậu nghiệm',
        'Dùng dạng tỉ lệ cược và tỉ số khả năng để cộng dồn nhiều bằng chứng trong một cuộc điều tra',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Một EDR có tỉ lệ phát hiện 99%: nếu một tiến trình thực sự là mã độc, nó kêu trong 99% trường hợp. Nó cũng báo nhầm 1% tiến trình lành tính. Trên một máy trạm chạy 10.000 tiến trình mỗi ngày, trong đó trung bình có 1 tiến trình độc hại. Hôm nay EDR kêu một lần. Xác suất tiến trình đó thực sự độc hại là bao nhiêu — 99%, 50%, hay dưới 10%?',
          reveal:
            'Chưa tới **1%**. Đếm bằng số nguyên cho dễ: trong 10.000 tiến trình có 1 độc và 9.999 lành. Với tiến trình độc, EDR kêu đúng 0,99 lần. Với 9.999 tiến trình lành, EDR kêu nhầm 9.999 × 0,01 ≈ **100 lần**. Tổng cộng khoảng 101 tiếng kêu, chỉ 1 là thật → 0,99 / 100,98 ≈ **0,98%**. Con số "99% phát hiện" mà nhà cung cấp đưa ra là **P(kêu | độc)**. Con số bạn thực sự cần là **P(độc | kêu)**. Chúng khác nhau 100 lần, và khoảng cách đó do đúng một thứ quyết định: **có bao nhiêu thứ độc hại ngay từ đầu**.',
        },
        {
          t: 'p',
          md: 'Bài này chỉ có một ý, nhưng là ý đắt nhất trong toàn bộ ngành: **P(A|B) không bằng P(B|A)**. Đọc thì hiển nhiên, dùng thì sai suốt.',
        },
        { t: 'h', text: 'Ký hiệu, đọc thành lời', level: 2 },
        {
          t: 'list',
          items: [
            '`P(D)` — đọc là "xác suất D". D là sự kiện "email này là lừa đảo". Nếu 20 trong 1.000 email là lừa đảo thì P(D) = 20/1000 = 0,02.',
            '`P(C)` — xác suất bộ lọc kêu (C = cảnh báo).',
            '`P(C | D)` — đọc là "xác suất C **khi đã biết** D". Dấu gạch đứng nghĩa là "cho trước", "biết rằng". Đây là **độ nhạy** (recall, TPR): trong đám email lừa đảo, bao nhiêu phần trăm bị bắt.',
            '`P(D | C)` — "xác suất là lừa đảo khi đã biết bộ lọc kêu". Đây là **giá trị dự đoán dương** (PPV, precision) — con số duy nhất mà analyst thực sự sống cùng.',
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Mẹo đọc dấu gạch đứng',
          md: 'Dấu `|` cắt thế giới thành một nhóm nhỏ hơn. `P(C | D)` nghĩa là: **quẳng đi mọi email không phải lừa đảo**, rồi hỏi trong phần còn lại bao nhiêu bị bắt. `P(D | C)` nghĩa là: **quẳng đi mọi email bộ lọc không kêu**, rồi hỏi trong đống cảnh báo bao nhiêu là thật. Hai lần quẳng khác nhau → hai mẫu số khác nhau → hai đáp số khác nhau.',
        },
        {
          t: 'h',
          text: 'Giải bằng số nguyên: cách nhanh nhất, ít sai nhất',
          level: 2,
        },
        {
          t: 'p',
          md: 'Nghiên cứu của Gerd Gigerenzer cho thấy con người — kể cả bác sĩ và luật sư — làm sai bài toán Bayes viết bằng phần trăm nhưng làm đúng khi cùng bài toán đó viết bằng **tần suất tự nhiên** (số người, số email). Vậy hãy luôn làm theo cách thứ hai trước.',
        },
        {
          t: 'steps',
          title: 'Bộ lọc thư rác: 1.000 email, làm bằng số nguyên',
          steps: [
            {
              title: 'Bước 1 — Đặt tổng thể và chia theo sự thật',
              md: 'Lấy **1.000 email** đại diện. Tỉ lệ lừa đảo thực tế là 2% → **20 email lừa đảo**, **980 email lành**. Đây là bước quyết định: bạn đã cố định **tỉ lệ nền** (base rate).',
            },
            {
              title: 'Bước 2 — Cho bộ lọc chạy trên nhánh độc hại',
              md: 'Bộ lọc có độ nhạy 90%: trong 20 email lừa đảo, nó bắt được **18**, bỏ sót **2**. Ghi lại: 18 dương tính thật (true positive), 2 âm tính giả (false negative).',
            },
            {
              title: 'Bước 3 — Cho bộ lọc chạy trên nhánh lành tính',
              md: 'Bộ lọc báo nhầm 5% email lành: 980 × 0,05 = **49 email** bị kêu oan. Ghi lại: 49 dương tính giả (false positive), 931 âm tính thật.',
            },
            {
              title: 'Bước 4 — Nhìn vào cái hộp "đã kêu"',
              md: 'Analyst chỉ nhìn thấy hộp này. Trong hộp có 18 + 49 = **67 cảnh báo**. Trong đó thật: 18. Vậy P(lừa đảo | cảnh báo) = 18/67 = **26,9%**.',
            },
            {
              title: 'Bước 5 — Đọc kết quả cho đúng',
              md: 'Bộ lọc "bắt được 90% thư lừa đảo" là đúng. Nhưng khi nó kêu, khả năng đó là thư lừa đảo chỉ **khoảng 1 phần 4**. Cứ 4 cảnh báo, analyst mở nhầm 3. Và chú ý: chỉ cần hạ tỉ lệ nền từ 2% xuống 0,2% thì PPV rơi xuống còn 3,5% — cùng một bộ lọc, không đổi gì cả.',
            },
          ],
        },
        {
          t: 'table',
          caption: 'Bảng 2×2 của ví dụ trên — bốn ô này là toàn bộ nội dung của định lý Bayes',
          head: ['', 'Thực tế: lừa đảo (20)', 'Thực tế: lành (980)', 'Tổng hàng'],
          rows: [
            ['Bộ lọc KÊU', '18 (dương tính thật)', '49 (dương tính giả)', '67'],
            ['Bộ lọc IM', '2 (âm tính giả)', '931 (âm tính thật)', '933'],
            ['Tổng cột', '20', '980', '1.000'],
          ],
        },
        {
          t: 'p',
          md: 'Nhìn bảng trên và để ý: **đọc theo cột** cho bạn độ nhạy (18/20 = 90%) và tỉ lệ báo động giả (49/980 = 5%). **Đọc theo hàng** cho bạn PPV (18/67 = 26,9%). Nhà cung cấp luôn báo cáo theo cột. Bạn sống theo hàng.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't1l2-cp1',
              kind: 'mcq',
              tags: ['bayes', 'xac-suat-co-dieu-kien'],
              q: 'Báo cáo threat intel viết: "95% các chiến dịch ransomware đều dùng PowerShell mã hoá base64." Kết luận nào là SAI?',
              options: [
                'Nếu thấy một chiến dịch ransomware, khả năng cao nó có dùng PowerShell base64',
                'Nếu thấy PowerShell base64 trên một máy, khả năng cao máy đó đang bị ransomware',
                'PowerShell base64 là một tín hiệu đáng theo dõi trong săn tìm mối đe doạ',
                'Con số 95% này là một dạng của P(bằng chứng | tấn công)',
              ],
              answer: 1,
              why: 'Báo cáo cho bạn **P(PowerShell base64 | ransomware) = 0,95**. Kết luận sai đã lật ngược thành **P(ransomware | PowerShell base64)**. Trong một doanh nghiệp, PowerShell mã hoá base64 xuất hiện hàng nghìn lần mỗi ngày một cách hoàn toàn hợp lệ: script quản trị, SCCM, phần mềm sao lưu, công cụ triển khai. Ransomware thì cực hiếm. Nên xác suất theo chiều ngược lại rất thấp. Đây gọi là **ngụy biện của công tố viên** (prosecutor fallacy) — và nó là nguồn gốc của phần lớn luật phát hiện tồi.',
              distractorWhy: [
                'Đây chính là điều báo cáo nói, đọc đúng chiều.',
                '',
                'Đúng: tín hiệu vẫn hữu ích, chỉ là không được dùng một mình để kết luận.',
                'Đúng: đây là dạng chuẩn của thống kê về hành vi kẻ tấn công.',
              ],
            },
          ],
        },
        {
          t: 'h',
          text: 'Bây giờ mới tới công thức',
          level: 2,
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Định lý Bayes, đọc từng ký hiệu',
          md: 'P(D | C) = P(C | D) × P(D) / P(C)\n\n- **P(D | C)** — *hậu nghiệm* (posterior): điều bạn muốn biết. Xác suất là tấn công **sau khi** đã thấy cảnh báo.\n- **P(C | D)** — *khả năng* (likelihood): độ nhạy của bộ phát hiện. Nhà cung cấp cho bạn số này.\n- **P(D)** — *tiên nghiệm* (prior): tỉ lệ nền. Xác suất là tấn công **trước khi** nhìn bất cứ thứ gì. Đây là con số bị bỏ quên nhiều nhất.\n- **P(C)** — *bằng chứng* (evidence): tổng xác suất cảnh báo kêu, tính bằng P(C|D)·P(D) + P(C|không D)·P(không D). Chính là mẫu số 67/1.000 trong ví dụ trên.\n\nThay số ví dụ: (0,90 × 0,02) / (0,90×0,02 + 0,05×0,98) = 0,018 / 0,067 = **0,269**. Đúng bằng 18/67.',
        },
        {
          t: 'h',
          text: 'Dạng tỉ lệ cược: cách các nhà điều tra thật sự dùng Bayes',
          level: 2,
        },
        {
          t: 'p',
          md: 'Có một dạng viết lại giúp bạn cộng dồn bằng chứng trong đầu, không cần máy tính. Gọi **tỉ lệ cược** (odds) là "số lần xảy ra so với số lần không xảy ra": tỉ lệ nền 2% tương đương cược **20 : 980 ≈ 1 : 49**.',
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Cược sau = Cược trước × Tỉ số khả năng',
          md: '**Tỉ số khả năng** (likelihood ratio, LR) của một bằng chứng = P(bằng chứng | độc) / P(bằng chứng | lành).\n\nVới bộ lọc thư rác: LR = 0,90 / 0,05 = **18**. Cược sau = (1 : 49) × 18 = **18 : 49**, tức xác suất 18/67 = 26,9%. Đúng kết quả cũ, tính nhanh hơn nhiều.\n\nCái hay: nếu bạn có **hai** bằng chứng gần độc lập, LR nhân với nhau. Tên miền mới đăng ký 3 ngày (LR ≈ 15) cộng với kết nối lúc 3 giờ sáng (LR ≈ 4) cho LR tổng ≈ 60. Đây chính là logic đằng sau mọi hệ thống chấm điểm rủi ro cộng dồn — và cũng chính là điều hồi quy logistic học được, chỉ khác là nó cộng log của các LR.',
        },
        {
          t: 'compare',
          title: 'Hai câu hỏi trông giống nhau, đừng bao giờ lẫn',
          left: {
            title: '📈 P(cảnh báo | độc) — độ nhạy',
            items: [
              'Mẫu số: số sự kiện ĐỘC HẠI',
              'Tên khác: recall, TPR, detection rate',
              'Ai công bố: nhà cung cấp, bài báo, báo cáo threat intel',
              'Không phụ thuộc tỉ lệ nền',
              'Trả lời: bộ phát hiện có bỏ sót nhiều không',
            ],
          },
          right: {
            title: '🎯 P(độc | cảnh báo) — PPV',
            items: [
              'Mẫu số: số CẢNH BÁO đã đưa ra',
              'Tên khác: precision, giá trị dự đoán dương',
              'Ai sống với nó: analyst trực ca',
              'Phụ thuộc CỰC MẠNH vào tỉ lệ nền',
              'Trả lời: mở một cảnh báo lên thì có bao nhiêu khả năng mất công vô ích',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bẫy: quên rằng tỉ lệ nền thay đổi theo ngữ cảnh',
          md: 'Cùng một luật Sigma, đặt ở hai nơi cho hai kết quả trái ngược. Luật "phát hiện `whoami.exe` chạy từ tiến trình con của Word" trên **máy trạm kế toán** có tỉ lệ nền cao (không có lý do gì hợp lệ) → PPV tốt. Cũng luật đó trên **máy của đội IT hoặc pentester nội bộ** có tỉ lệ nền thấp hẳn (họ làm thế cả ngày) → PPV thảm hại. Cùng một mô hình, cùng một ngưỡng, khác PPV. Đây là lý do việc phân vùng tài sản (asset tiering) tăng chất lượng phát hiện nhiều hơn việc đổi thuật toán.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't1l2-cp2',
              kind: 'input',
              tags: ['bayes'],
              q: 'Trong 2.000 phiên đăng nhập có 10 phiên là chiếm đoạt tài khoản. Mô hình bắt được 8/10 và báo nhầm 2% trong số phiên hợp lệ. Analyst nhận được bao nhiêu cảnh báo tổng cộng? (Chỉ điền số nguyên)',
              accept: ['48', '48 canh bao', '48 cảnh báo'],
              placeholder: 'Ví dụ: 120',
              hint: 'Cảnh báo thật + cảnh báo nhầm. Số phiên hợp lệ là 1.990.',
              why: 'Cảnh báo thật: 8. Cảnh báo nhầm: 1.990 × 0,02 = 39,8 ≈ 40. Tổng ≈ **48 cảnh báo**, trong đó PPV = 8/48 = **16,7%**. Nghĩa là 5 trong 6 lần analyst mở cảnh báo lên là mất công. Chú ý mẫu số của tỉ lệ báo nhầm là 1.990 (phiên hợp lệ), không phải 2.000 — chi tiết nhỏ nhưng là chỗ hay sai.',
            },
          ],
        },
        {
          t: 'checklist',
          title: 'Ba câu hỏi bắt buộc khi nghe bất kỳ con số phát hiện nào',
          items: [
            'Con số này là P(cảnh báo | độc) hay P(độc | cảnh báo)? Mẫu số là gì?',
            'Tỉ lệ nền trong môi trường đo là bao nhiêu, và trong môi trường của tôi là bao nhiêu?',
            'Quy ra số tuyệt đối: mỗi ngày sẽ có bao nhiêu cảnh báo, và bao nhiêu trong số đó là thật?',
          ],
        },
        {
          t: 'terms',
          ids: ['xac-suat-co-dieu-kien', 'bayes', 'tien-nghiem', 'ppv', 'ti-so-kha-nang'],
        },
      ],
      keyTakeaways: [
        'P(A|B) khác P(B|A). Nhà cung cấp công bố P(cảnh báo|độc); analyst sống với P(độc|cảnh báo).',
        'Giải bài toán Bayes bằng số nguyên (1.000 email, 20 độc hại...) thay vì phần trăm — ít sai hơn hẳn.',
        'Bảng 2×2: đọc theo cột ra độ nhạy và FPR; đọc theo hàng ra PPV. Đó là toàn bộ định lý Bayes.',
        'Bốn thành phần của Bayes: tiên nghiệm (tỉ lệ nền), khả năng (độ nhạy), bằng chứng (mẫu số), hậu nghiệm (điều ta cần).',
        'Dạng tỉ lệ cược: cược sau = cược trước × tỉ số khả năng; nhiều bằng chứng gần độc lập thì nhân LR với nhau.',
        'Tỉ lệ nền phụ thuộc ngữ cảnh: cùng một luật cho PPV rất khác nhau giữa máy kế toán và máy quản trị viên.',
      ],
      cards: [
        {
          id: 't1l2-c1',
          front: 'Đọc thành lời và phân biệt: P(cảnh báo | độc hại) và P(độc hại | cảnh báo).',
          back: 'Cái đầu là độ nhạy/recall — trong đám sự kiện độc, bao nhiêu bị bắt. Cái sau là PPV/precision — trong đám cảnh báo, bao nhiêu là thật. Chỉ cái sau quyết định trải nghiệm của analyst.',
          tags: ['bayes', 'do-luong'],
        },
        {
          id: 't1l2-c2',
          front: 'Nêu bốn thành phần của định lý Bayes và tên tiếng Việt của chúng.',
          back: 'Hậu nghiệm P(D|C) là điều cần tìm; khả năng P(C|D) là độ nhạy; tiên nghiệm P(D) là tỉ lệ nền; bằng chứng P(C) là tổng xác suất cảnh báo (mẫu số).',
          tags: ['bayes'],
        },
        {
          id: 't1l2-c3',
          front: 'Vì sao nên giải bài toán Bayes bằng số nguyên thay vì phần trăm?',
          back: 'Vì con người làm đúng dạng tần suất tự nhiên (18 trong 67 email) và làm sai dạng phần trăm — kết quả thực nghiệm của Gigerenzer. Số nguyên cũng buộc bạn viết ra tỉ lệ nền.',
          tags: ['bayes', 'cach-hoc'],
        },
        {
          id: 't1l2-c4',
          front: 'Công thức cộng dồn bằng chứng bằng dạng tỉ lệ cược là gì?',
          back: 'Cược sau = cược trước × tỉ số khả năng, với LR = P(bằng chứng|độc)/P(bằng chứng|lành). Nhiều bằng chứng gần độc lập thì nhân các LR lại.',
          tags: ['bayes', 'ti-so-kha-nang'],
        },
        {
          id: 't1l2-c5',
          front: 'Ngụy biện của công tố viên (prosecutor fallacy) trong bảo mật là gì? Cho ví dụ.',
          back: 'Lấy P(bằng chứng|tấn công) dùng thay cho P(tấn công|bằng chứng). Ví dụ: "95% ransomware dùng PowerShell base64" bị hiểu thành "thấy PowerShell base64 thì 95% là ransomware".',
          tags: ['bayes', 'bay-thuong-gap'],
        },
      ],
      quiz: [
        {
          id: 't1l2-q1',
          kind: 'mcq',
          tags: ['bayes', 'ppv'],
          q: 'Bộ phát hiện A có độ nhạy 99% và FPR 2%. Bộ phát hiện B có độ nhạy 80% và FPR 0,05%. Trên 1 triệu sự kiện/ngày với 20 sự kiện độc hại, bộ nào cho PPV cao hơn và cao hơn bao nhiêu lần?',
          options: [
            'A, vì độ nhạy cao hơn nhiều',
            'B, PPV khoảng 3,1% so với 0,1% của A',
            'Hai bộ tương đương vì bù trừ lẫn nhau',
            'Không tính được nếu chưa biết độ chính xác tổng thể',
          ],
          answer: 1,
          why: 'A: TP = 19,8; FP = 999.980 × 0,02 ≈ 20.000 → PPV ≈ 19,8/20.020 ≈ **0,1%**. B: TP = 16; FP = 999.980 × 0,0005 ≈ 500 → PPV ≈ 16/516 ≈ **3,1%**. B tốt hơn khoảng 31 lần dù bỏ sót nhiều hơn. Bài học: khi tỉ lệ nền cực thấp, **giảm FPR quan trọng hơn tăng recall rất nhiều**. Đi từ 99% xuống 80% recall mất 4 sự kiện; đi từ FPR 2% xuống 0,05% cắt 19.500 cảnh báo rác.',
          distractorWhy: [
            'Độ nhạy cao vô ích nếu mẫu số lành tính khổng lồ nhân với FPR tạo ra hàng chục nghìn cảnh báo giả.',
            '',
            'Không bù trừ: hai chỉ số này tác động lên hai mẫu số có quy mô cách nhau 50.000 lần.',
            'Tính được đầy đủ chỉ với tỉ lệ nền, độ nhạy và FPR — độ chính xác tổng thể không cần và cũng vô dụng ở đây.',
          ],
        },
        {
          id: 't1l2-q2',
          kind: 'truefalse',
          tags: ['bayes', 'ti-le-nen'],
          q: 'Nếu một mô hình có PPV 40% trong môi trường thử nghiệm, nó sẽ giữ nguyên PPV 40% khi triển khai ở tổ chức khác.',
          answer: false,
          why: 'PPV không phải thuộc tính của mô hình mà là thuộc tính của **mô hình cộng với môi trường**. Độ nhạy và FPR mới tương đối ổn định giữa các môi trường; PPV phụ thuộc thẳng vào tỉ lệ nền, mà tỉ lệ nền thì thay đổi theo ngành, quy mô, mức độ bị nhắm tới và cả cách bạn định nghĩa "một sự kiện". Đây là lý do luôn phải đo lại PPV tại chỗ sau khi triển khai.',
        },
        {
          id: 't1l2-q3',
          kind: 'match',
          tags: ['bayes'],
          q: 'Nối mỗi thành phần của định lý Bayes với ý nghĩa bảo mật của nó.',
          pairs: [
            ['Tiên nghiệm P(D)', 'Tỉ lệ nền: bao nhiêu phần sự kiện vốn đã độc hại'],
            ['Khả năng P(C|D)', 'Độ nhạy của bộ phát hiện, do nhà cung cấp công bố'],
            ['Bằng chứng P(C)', 'Tổng số cảnh báo được đưa ra, gồm cả thật lẫn giả'],
            ['Hậu nghiệm P(D|C)', 'PPV: xác suất cảnh báo trên tay analyst là thật'],
          ],
          why: 'Bốn thành phần này ánh xạ một-một sang bốn con số bạn phải hỏi trong mọi cuộc thảo luận về hiệu quả phát hiện. Nếu ai đó chỉ đưa bạn "khả năng" mà không đưa "tiên nghiệm", họ chưa nói gì về trải nghiệm thật của đội SOC.',
        },
        {
          id: 't1l2-q4',
          kind: 'mcq',
          tags: ['ti-so-kha-nang'],
          q: 'Một tên miền vừa được đăng ký 2 ngày trước. Trong dữ liệu của bạn, 30% tên miền độc hại là tên miền mới đăng ký, còn tỉ lệ đó ở tên miền lành là 0,5%. Tỉ số khả năng của bằng chứng này là bao nhiêu?',
          options: ['0,6', '6', '60', '600'],
          answer: 2,
          why: 'LR = P(bằng chứng | độc) / P(bằng chứng | lành) = 0,30 / 0,005 = **60**. Nghĩa là bằng chứng này nhân tỉ lệ cược lên 60 lần. Nhưng chú ý cái bẫy: nếu tỉ lệ cược ban đầu là 1 : 100.000 thì sau khi nhân 60 vẫn chỉ còn 1 : 1.667, tức PPV khoảng 0,06%. Một LR mạnh vẫn không cứu nổi một tỉ lệ nền đủ thấp — đó chính là chủ đề của bài tiếp theo.',
          distractorWhy: [
            'Đây là phép chia ngược (0,005/0,30).',
            'Đây là kết quả nếu nhầm 0,5% thành 5%.',
            '',
            'Đây là kết quả nếu nhầm 0,5% thành 0,05%.',
          ],
        },
        {
          id: 't1l2-q5',
          kind: 'order',
          tags: ['bayes', 'cach-hoc'],
          q: 'Sắp xếp các bước giải một bài toán Bayes bằng tần suất tự nhiên.',
          items: [
            'Chọn một tổng thể tròn số (1.000 hoặc 10.000 sự kiện)',
            'Chia tổng thể thành hai nhóm theo tỉ lệ nền: độc hại và lành tính',
            'Áp độ nhạy lên nhóm độc hại để ra số cảnh báo thật',
            'Áp tỉ lệ báo động giả lên nhóm lành tính để ra số cảnh báo nhầm',
            'Lấy số cảnh báo thật chia cho tổng số cảnh báo để ra PPV',
          ],
          why: 'Trình tự này ép bạn viết ra tỉ lệ nền ngay ở bước 2 — chính là con số hay bị bỏ quên nhất. Nó cũng cho bạn luôn số cảnh báo tuyệt đối mỗi ngày, thứ mà một con số phần trăm không bao giờ cho thấy.',
        },
      ],
      terms: ['xac-suat-co-dieu-kien', 'bayes', 'tien-nghiem', 'ppv', 'ti-so-kha-nang'],
      further: [
        {
          title: 'Calculated Risks / Reckoning with Risk — Gerd Gigerenzer',
          note: 'Nguồn gốc của phương pháp tần suất tự nhiên. Đọc chương về xét nghiệm y tế rồi thay "bệnh nhân" bằng "sự kiện mạng" là xong.',
        },
        {
          title: 'MITRE ATT&CK — mục Data Sources và Detections',
          note: 'Khi đọc mỗi kỹ thuật, hãy tự hỏi: tần suất nền của hành vi này trong môi trường tôi là bao nhiêu? Đó là bài tập Bayes hằng ngày.',
          url: 'https://attack.mitre.org/',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't1-l3',
      trackId: 'nen-mong',
      title: 'Nghịch lý tỉ lệ nền — bài học quan trọng nhất khoá này',
      subtitle: 'Vì sao một bộ phát hiện gần như hoàn hảo vẫn tạo ra 100.000 cảnh báo rác mỗi ngày',
      minutes: 21,
      practiceMinutes: 11,
      level: 'co-ban',
      prereqs: ['t1-l2'],
      why: {
        short:
          'Đây là lý do toán học vì sao mọi hệ thống phát hiện xâm nhập trong lịch sử đều ngập báo động giả — và biết nó là điều kiện để bạn thiết kế thứ gì đó thực sự dùng được.',
        scenario:
          'Bạn được giao đánh giá một NDR mới. Bảng thông số ghi: độ nhạy 99%, tỉ lệ báo động giả 0,1%. Mạng của bạn sinh 10 triệu luồng mỗi ngày và một năm qua có 4 sự cố thật. Trước khi ký hợp đồng 2 tỉ đồng, bạn cần tính được đội SOC 6 người của mình sẽ nhận bao nhiêu cảnh báo mỗi ngày và bao nhiêu phần trăm trong số đó đáng mở ra.',
        roles: ['SOC Analyst', 'Detection Engineer', 'Security Architect', 'Security Data Scientist'],
        costOfNotKnowing:
          'Bạn ký hợp đồng, triển khai, và trong hai tuần đội SOC chuyển sang chế độ bấm "đóng" hàng loạt. Khi cảnh báo thật xuất hiện, nó bị đóng cùng 9.999 cảnh báo rác khác. Đây không phải giả thuyết — đó gần như đúng những gì đã xảy ra tại Target năm 2013: cảnh báo đã bật, không ai xử lý.',
      },
      objectives: [
        'Tính được PPV từ tỉ lệ nền, độ nhạy và FPR, cả bằng số nguyên lẫn bằng công thức',
        'Ước lượng được số cảnh báo tuyệt đối mỗi ngày từ lưu lượng và FPR',
        'Giải thích được vì sao giảm FPR theo bậc độ lớn quan trọng hơn tăng recall vài phần trăm',
        'Nêu và áp dụng được bốn chiến lược thực sự cải thiện PPV trong hệ thống thật',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Hệ thống IDS: độ nhạy 99%, tỉ lệ báo động giả 1%. Mạng của bạn sinh 10 triệu sự kiện mỗi ngày, trong đó có 10 sự kiện thực sự là tấn công. Khi IDS kêu, xác suất đó là tấn công thật là bao nhiêu? Đoán một con số trước khi mở.',
          reveal:
            'Khoảng **0,01%** — tức 1 trên 10.000. Cụ thể: cảnh báo thật = 10 × 0,99 ≈ 10. Cảnh báo nhầm = 9.999.990 × 0,01 ≈ **100.000**. Tổng ≈ 100.010 cảnh báo mỗi ngày, trong đó 10 cái thật. Nếu mỗi analyst xử lý được 40 cảnh báo mỗi ca, bạn cần **2.500 analyst** để xem hết. Hầu hết mọi người đoán 90–99%, và chính khoảng cách giữa trực giác và sự thật này là nội dung của cả bài học.',
        },
        {
          t: 'p',
          md: 'Hiện tượng này có tên: **nghịch lý tỉ lệ nền** (base rate fallacy). Nó không phải lỗi kỹ thuật của sản phẩm nào cả — nó là hệ quả toán học không thể tránh của việc tìm cái cực hiếm trong một biển cái phổ biến.',
        },
        {
          t: 'p',
          md: 'Stefan Axelsson đã viết hẳn một bài báo về đúng chuyện này năm 1999 (*The Base-Rate Fallacy and its Implications for the Difficulty of Intrusion Detection*), với kết luận thẳng thừng: yếu tố giới hạn hiệu quả của IDS không phải độ nhạy, mà là **tỉ lệ báo động giả phải nhỏ tới mức phi thực tế**. Hơn 25 năm sau, kết luận đó chưa từng bị bác bỏ.',
        },
        {
          t: 'figure',
          id: 'fig-base-rate',
          caption:
            'Mười nghìn ô vuông. Ô đỏ là tấn công thật, ô cam là báo động giả, ô xám là sự kiện bình thường bị bỏ qua đúng. Hãy đếm bằng mắt tỉ lệ đỏ trên tổng số ô được tô — đó chính là PPV.',
        },
        {
          t: 'h',
          text: 'Công thức, sau khi bạn đã thấy con số',
          level: 2,
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'PPV viết đầy đủ',
          md: 'PPV = (TPR × p) / (TPR × p + FPR × (1 − p))\n\n- **p** — tỉ lệ nền: phần sự kiện vốn đã độc hại. Trong ví dụ trên p = 10/10.000.000 = 1e−6.\n- **TPR** — độ nhạy (true positive rate), phần sự kiện độc bị bắt.\n- **FPR** — tỉ lệ báo động giả, phần sự kiện lành bị kêu oan.\n\nĐiểm mấu chốt nằm ở mẫu số: **TPR × p** là một số cực nhỏ (nhân với 1e−6), còn **FPR × (1 − p)** gần như bằng FPR. Nên khi p rất bé, PPV ≈ **p × TPR / FPR**. Tử số bị p ghì xuống đất, còn FPR thì đứng một mình ở mẫu số. Đó là toàn bộ câu chuyện.',
        },
        {
          t: 'steps',
          title: 'Đọc lại công thức trên bằng lời, ba câu',
          steps: [
            {
              title: 'PPV tỉ lệ thuận với tỉ lệ nền',
              md: 'Gấp đôi tỉ lệ nền thì gấp đôi PPV. Đây là đòn bẩy mạnh nhất và cũng là đòn bẩy bị bỏ quên nhiều nhất — vì nó không nằm trong tay người làm mô hình mà nằm trong tay người **định nghĩa phạm vi**.',
            },
            {
              title: 'PPV tỉ lệ nghịch với FPR',
              md: 'Chia đôi FPR thì gấp đôi PPV. Cắt FPR đi 100 lần thì PPV tăng 100 lần. Đây là lý do trong bảo mật người ta nói về FPR bằng bậc độ lớn (1e−3, 1e−5) chứ không bằng phần trăm.',
            },
            {
              title: 'PPV gần như không quan tâm tới TPR',
              md: 'Tăng độ nhạy từ 90% lên 99% chỉ tăng PPV thêm 10%. Còn giảm FPR từ 1% xuống 0,01% tăng PPV **100 lần**. Đây là kết luận phản trực giác nhất của bài và là thứ phân biệt người đã đọc bài này với người chưa.',
            },
          ],
        },
        {
          t: 'table',
          caption:
            'Cùng một mạng: 10 triệu sự kiện/ngày, 10 sự kiện độc hại (p = 1 phần triệu), TPR cố định 90%. Chỉ FPR thay đổi.',
          head: ['FPR', 'Cảnh báo giả / ngày', 'Cảnh báo thật / ngày', 'PPV', 'Đội SOC sống sót?'],
          rows: [
            ['1% (1e−2)', '100.000', '9', '≈ 0,009%', 'Không — cần 2.500 người'],
            ['0,1% (1e−3)', '10.000', '9', '≈ 0,09%', 'Không — cần 250 người'],
            ['0,01% (1e−4)', '1.000', '9', '≈ 0,9%', 'Không — cần 25 người'],
            ['0,001% (1e−5)', '100', '9', '≈ 8,3%', 'Vừa đủ với 2–3 người'],
            ['0,0001% (1e−6)', '10', '9', '≈ 47%', 'Thoải mái'],
            ['0,00001% (1e−7)', '1', '9', '≈ 90%', 'Lý tưởng — và gần như không tồn tại'],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Đọc bảng trên cho kỹ',
          md: 'Để một IDS có PPV chấp nhận được (khoảng 50%) trên mạng 10 triệu sự kiện với 10 cuộc tấn công, bạn cần FPR ở mức **1 phần triệu**. Nghĩa là được phép nhầm đúng **1 lần trên 1 triệu sự kiện lành tính**. Không sản phẩm thương mại nào công bố con số đó, và cũng không mô hình nào bạn tự huấn luyện đạt được nó trên dữ liệu thô. Kết luận không phải là "bỏ cuộc" — mà là **đừng chấm điểm trên toàn bộ 10 triệu sự kiện ngay từ đầu**.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't1l3-cp1',
              kind: 'mcq',
              tags: ['ti-le-nen', 'ppv'],
              q: 'Đội của bạn có hai lựa chọn cải tiến, chi phí như nhau. (A) Tăng độ nhạy từ 85% lên 97%. (B) Giảm FPR từ 0,5% xuống 0,05%. Tỉ lệ nền là 1 phần triệu. Chọn cái nào?',
              options: [
                'A — bắt được nhiều tấn công hơn luôn quan trọng hơn',
                'B — PPV tăng khoảng 10 lần, còn A chỉ tăng khoảng 1,14 lần',
                'Cả hai như nhau vì đều cải thiện chất lượng phát hiện',
                'Không quyết định được nếu chưa biết chi phí một sự cố',
              ],
              answer: 1,
              why: 'PPV ≈ p × TPR / FPR. Phương án A nhân TPR lên 97/85 ≈ **1,14 lần**. Phương án B chia FPR cho 10 → PPV **tăng 10 lần**, đồng thời cắt 90% khối lượng cảnh báo rác cho analyst. Về số tuyệt đối: A giúp bắt thêm khoảng 1,2 sự kiện độc mỗi năm; B loại bỏ 4.500 cảnh báo giả mỗi ngày. Trong môi trường tỉ lệ nền cực thấp, **giảm nhiễu luôn thắng tăng độ nhạy**, trừ khi bạn đang bỏ sót ở mức thảm hoạ.',
              distractorWhy: [
                'Bắt thêm tấn công là vô nghĩa nếu cảnh báo chìm trong 5.000 cảnh báo rác và không ai mở ra.',
                '',
                'Hai phương án tác động lên hai vị trí khác nhau trong công thức: TPR ở tử số (tuyến tính, hệ số nhỏ), FPR ở mẫu số (nghịch đảo, hệ số lớn).',
                'Chi phí sự cố ảnh hưởng tới việc chọn ngưỡng, nhưng ở đây độ lệch giữa 10 lần và 1,14 lần lớn tới mức không cần thêm dữ liệu.',
              ],
            },
            {
              id: 't1l3-cp2',
              kind: 'truefalse',
              tags: ['ti-le-nen'],
              q: 'PPV thấp có nghĩa là mô hình được huấn luyện kém.',
              answer: false,
              why: 'Không nhất thiết. PPV là hàm của ba biến, trong đó **tỉ lệ nền không phải thuộc tính của mô hình**. Một mô hình hoàn hảo về mặt thống kê vẫn cho PPV 1% nếu bạn thả nó vào một dòng dữ liệu mà chỉ 1 phần triệu là độc hại. Ngược lại, một mô hình tầm thường cho PPV 60% nếu bạn chỉ đưa cho nó những sự kiện đã qua tiền lọc. Chẩn đoán đúng là: xem TPR và FPR để đánh giá mô hình, xem PPV để đánh giá **hệ thống trong ngữ cảnh**.',
            },
          ],
        },
        {
          t: 'lab',
          id: 'lab-base-rate',
          intro:
            'Kéo ba thanh trượt: tỉ lệ nền, độ nhạy, tỉ lệ báo động giả. Nhiệm vụ: tìm cấu hình cho PPV vượt 50% với 10 triệu sự kiện mỗi ngày. Bạn sẽ nhanh chóng nhận ra thanh trượt nào thực sự có tác dụng — và bài học đó dính lâu hơn bất kỳ đoạn văn nào.',
        },
        {
          t: 'h',
          text: 'Bốn cách thật sự cứu được PPV',
          level: 2,
        },
        {
          t: 'p',
          md: 'Đây là phần thực chiến. Nghịch lý tỉ lệ nền không bị phá bởi thuật toán tốt hơn — nó bị phá bởi việc **thay đổi bài toán**.',
        },
        {
          t: 'steps',
          title: 'Bốn đòn bẩy, xếp theo hiệu quả thực tế',
          steps: [
            {
              title: '1. Thu hẹp phạm vi để nâng tỉ lệ nền (mạnh nhất, rẻ nhất)',
              md: 'Thay vì chấm điểm cả 10 triệu luồng, chỉ chấm luồng **đi ra Internet, từ 200 máy chủ trong vùng chứa dữ liệu thẻ, ngoài giờ hành chính**. Phạm vi rút xuống 8.000 sự kiện/ngày, và giả sử 5 trong 10 sự kiện độc rơi vào đây → p = 5/8.000 = **6,25e−4**, cao hơn 625 lần. Với TPR 99%, FPR 1%: cảnh báo thật ≈ 5, cảnh báo giả ≈ 80, **PPV ≈ 5,8%** thay vì 0,01%. Đánh đổi trung thực: bạn cố tình mù với 5 sự kiện độc nằm ngoài phạm vi. Đó là một quyết định quản trị rủi ro, và nó phải được viết ra thành văn bản.',
            },
            {
              title: '2. Cộng dồn nhiều tín hiệu gần độc lập',
              md: 'Nhớ dạng tỉ lệ cược ở bài trước: LR nhân với nhau. Hai bộ phát hiện, mỗi cái LR = 99, cho LR tổng ≈ 9.801 → PPV tăng khoảng 100 lần. **Cảnh báo chỉ nổ khi cả hai cùng kêu trong một cửa sổ 10 phút trên cùng một máy.** Cảnh báo trước: giả định độc lập thường sai — hai mô hình cùng huấn luyện trên cùng dữ liệu sẽ sai **cùng chỗ**, nên LR thực tế thấp hơn tích toán học khá nhiều. Chọn các tín hiệu nhìn vào những nguồn dữ liệu khác nhau (mạng + tiến trình + xác thực) thì giả định mới gần đúng.',
            },
            {
              title: '3. Đổi đơn vị cảnh báo từ sự kiện sang thực thể',
              md: 'Đừng cảnh báo trên "một luồng mạng". Hãy cảnh báo trên "một máy trong 24 giờ" hoặc "một tài khoản trong một phiên". 100.000 cảnh báo sự kiện thường gom lại thành 300 thực thể — và cùng lúc, một máy có 40 tín hiệu yếu nhìn hấp dẫn hơn hẳn một máy có 1 tín hiệu. Đây chính là điều các nền tảng XDR gọi là gom cảnh báo thành **incident**, và nó cải thiện trải nghiệm analyst nhiều hơn bất kỳ mô hình nào.',
            },
            {
              title: '4. Giảm chi phí xử lý mỗi cảnh báo',
              md: 'Nếu không nâng được PPV, hãy hạ giá của việc sai. Tự động làm giàu ngữ cảnh (ai là chủ máy, tiến trình cha là gì, tên miền này bao nhiêu tuổi, đã thấy ở đâu khác chưa) biến một cuộc điều tra 15 phút thành một cái liếc 20 giây. PPV 5% với chi phí 20 giây có thể chấp nhận được; PPV 5% với chi phí 15 phút thì không. Đây là phần việc của SOAR và của kỹ nghệ phát hiện, không phải của ML.',
            },
          ],
        },
        {
          t: 'compare',
          title: 'Hai cách đọc cùng một bộ phát hiện',
          left: {
            title: '📊 Cách nhà cung cấp trình bày',
            items: [
              'Độ nhạy 99,2% trên bộ dữ liệu chuẩn',
              'FPR chỉ 0,1%',
              'AUC 0,996',
              'Vượt trội đối thủ trong bài kiểm định độc lập',
              'Không nhắc tới quy mô lưu lượng thật',
            ],
          },
          right: {
            title: '🧾 Cách bạn phải quy đổi',
            items: [
              'Lưu lượng của tôi: 10 triệu sự kiện/ngày',
              'FPR 0,1% → 10.000 cảnh báo giả/ngày',
              'Số sự cố thật năm ngoái: 4 → p ≈ 1e−9 tính theo sự kiện',
              'PPV thực tế: dưới 0,1%',
              'Cần hỏi: có thể thu hẹp phạm vi xuống bao nhiêu?',
            ],
          },
        },
        {
          t: 'lab',
          id: 'lab-alert-load',
          intro:
            'Nhập số nhân sự SOC, thời gian xử lý trung bình một cảnh báo, và lưu lượng thật của bạn. Xem đội của bạn cần FPR bằng bao nhiêu để không vỡ trận.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bẫy: "chúng tôi đã giảm báo động giả 30%"',
          md: 'Câu này nghe như một thành tựu. Quy ra số: 10.000 cảnh báo giả xuống 7.000. Analyst của bạn vẫn không xử lý nổi 7.000. Trong chế độ tỉ lệ nền cực thấp, cải tiến **theo phần trăm** hầu như vô giá trị; chỉ cải tiến **theo bậc độ lớn** mới đổi được cục diện. Khi ai đó khoe con số cải tiến, hãy hỏi ngay: từ bao nhiêu cảnh báo mỗi ngày xuống bao nhiêu cảnh báo mỗi ngày?',
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'Chuyện có thật: cảnh báo đã kêu, không ai nghe',
          md: 'Trong vụ xâm nhập Target cuối năm 2013 (khoảng 40 triệu thẻ thanh toán bị lộ), hệ thống giám sát **đã sinh cảnh báo** về phần mềm độc hại được cài lên hệ thống POS. Cảnh báo đó không được xử lý. Bài học không phải "công cụ tồi" — công cụ đã làm đúng việc của nó. Bài học là: một cảnh báo đúng nằm giữa hàng nghìn cảnh báo không đáng tin thì về mặt vận hành **tương đương với không có cảnh báo nào**. PPV không phải chỉ số kỹ thuật; nó là chỉ số quyết định người ta có tin hệ thống hay không.',
        },
        {
          t: 'checklist',
          title: 'Bảng kiểm trước khi triển khai bất kỳ bộ phát hiện nào',
          items: [
            'Viết ra tỉ lệ nền ước lượng của môi trường tôi, kèm cách tôi ước lượng ra nó',
            'Quy FPR thành số cảnh báo tuyệt đối mỗi ngày trên lưu lượng thật của tôi',
            'Tính PPV và so với năng lực xử lý thật (số analyst × số cảnh báo mỗi ca)',
            'Nếu PPV quá thấp: thu hẹp phạm vi trước, đổi thuật toán sau',
            'Ghi rõ phần dữ liệu bị cố tình loại khỏi phạm vi — đó là điểm mù đã được chấp nhận, phải công khai',
            'Chạy thử ở chế độ chỉ ghi log (shadow mode) ít nhất 2 tuần và đếm cảnh báo thật trước khi bật cảnh báo',
          ],
        },
        {
          t: 'terms',
          ids: ['ti-le-nen', 'ppv', 'bao-dong-gia', 'met-moi-canh-bao', 'fpr'],
        },
      ],
      keyTakeaways: [
        'PPV = (TPR×p) / (TPR×p + FPR×(1−p)); khi p rất nhỏ thì PPV ≈ p × TPR / FPR.',
        'Với 10 triệu sự kiện/ngày và 10 sự kiện độc, FPR 1% cho 100.000 cảnh báo giả và PPV khoảng 0,01%.',
        'Giảm FPR theo bậc độ lớn có tác dụng gấp hàng chục lần so với tăng recall vài phần trăm.',
        'Đòn bẩy mạnh nhất là nâng tỉ lệ nền bằng cách thu hẹp phạm vi — nhưng phải công khai điểm mù tạo ra.',
        'Cộng dồn tín hiệu từ các nguồn dữ liệu KHÁC NHAU mới gần thoả mãn giả định độc lập.',
        'Gom cảnh báo theo thực thể (máy, tài khoản) thay vì theo sự kiện làm giảm khối lượng hàng trăm lần.',
        'Nếu không nâng nổi PPV thì hạ chi phí mỗi cảnh báo bằng làm giàu ngữ cảnh tự động.',
      ],
      cards: [
        {
          id: 't1l3-c1',
          front: 'Viết công thức PPV theo tỉ lệ nền p, TPR và FPR.',
          back: 'PPV = (TPR × p) / (TPR × p + FPR × (1 − p)). Khi p rất nhỏ, xấp xỉ thành PPV ≈ p × TPR / FPR.',
          tags: ['ti-le-nen', 'ppv'],
        },
        {
          id: 't1l3-c2',
          front: 'Vì sao giảm FPR quan trọng hơn tăng recall khi tỉ lệ nền cực thấp?',
          back: 'Vì TPR nằm ở tử số và chỉ thay đổi được vài chục phần trăm, còn FPR ở mẫu số và giảm được theo bậc độ lớn — chia FPR cho 10 thì PPV tăng 10 lần.',
          tags: ['ti-le-nen', 'do-luong'],
        },
        {
          id: 't1l3-c3',
          front: 'Nêu bốn cách thực sự nâng được PPV của một hệ thống phát hiện.',
          back: '1) Thu hẹp phạm vi để tăng tỉ lệ nền. 2) Cộng dồn tín hiệu độc lập từ nguồn dữ liệu khác nhau. 3) Gom cảnh báo theo thực thể thay vì sự kiện. 4) Hạ chi phí xử lý mỗi cảnh báo bằng làm giàu ngữ cảnh.',
          tags: ['ti-le-nen', 'thuc-chien'],
        },
        {
          id: 't1l3-c4',
          front: '10 triệu sự kiện/ngày, FPR = 0,1%. Bao nhiêu cảnh báo giả mỗi ngày?',
          back: '10.000 cảnh báo giả mỗi ngày. Luôn quy tỉ lệ phần trăm thành số tuyệt đối trước khi đánh giá.',
          tags: ['ti-le-nen', 'bao-dong-gia'],
        },
        {
          id: 't1l3-c5',
          front: 'PPV thấp có phải bằng chứng mô hình được huấn luyện kém không? Vì sao?',
          back: 'Không. PPV phụ thuộc tỉ lệ nền, vốn không phải thuộc tính của mô hình. Đánh giá mô hình bằng TPR và FPR; đánh giá hệ thống trong ngữ cảnh bằng PPV.',
          tags: ['ti-le-nen', 'do-luong'],
        },
      ],
      quiz: [
        {
          id: 't1l3-q1',
          kind: 'mcq',
          tags: ['ti-le-nen', 'ppv'],
          q: 'Một mô hình chấm điểm 500.000 email/ngày, trong đó 50 email là lừa đảo có chủ đích. TPR = 80%, FPR = 0,2%. Mỗi ngày analyst nhận bao nhiêu cảnh báo và PPV bằng bao nhiêu?',
          options: [
            'Khoảng 40 cảnh báo, PPV 80%',
            'Khoảng 1.040 cảnh báo, PPV khoảng 3,8%',
            'Khoảng 1.000 cảnh báo, PPV khoảng 50%',
            'Khoảng 100 cảnh báo, PPV khoảng 40%',
          ],
          answer: 1,
          why: 'Cảnh báo thật = 50 × 0,8 = **40**. Cảnh báo giả = 499.950 × 0,002 ≈ **1.000**. Tổng ≈ 1.040, PPV = 40/1.040 ≈ **3,8%**. Nghĩa là cứ 26 cảnh báo mới có 1 cái thật. Chú ý: FPR 0,2% nghe rất nhỏ nhưng mẫu số 499.950 biến nó thành 1.000 cảnh báo — đây đúng là cơ chế của nghịch lý tỉ lệ nền.',
          distractorWhy: [
            'Đây là lỗi lấy TPR làm PPV — bỏ quên hoàn toàn nhánh email lành tính.',
            '',
            'PPV 50% đòi hỏi số cảnh báo giả xấp xỉ số cảnh báo thật, tức FPR phải khoảng 0,008%.',
            'Con số này không khớp với bất kỳ phép tính nào từ dữ liệu đề bài.',
          ],
        },
        {
          id: 't1l3-q2',
          kind: 'multi',
          tags: ['ti-le-nen', 'thuc-chien'],
          q: 'Cách nào thực sự nâng PPV của hệ thống phát hiện? (Chọn tất cả đáp án đúng)',
          options: [
            'Chỉ chấm điểm luồng ra Internet từ các máy chủ chứa dữ liệu nhạy cảm',
            'Đổi từ Random Forest sang mạng nơ-ron sâu hơn',
            'Chỉ nổ cảnh báo khi có ít nhất hai tín hiệu độc lập trong cùng cửa sổ thời gian',
            'Gom cảnh báo theo máy trong 24 giờ thay vì theo từng sự kiện',
          ],
          answers: [0, 2, 3],
          why: 'Ba đáp án đúng đều tác động vào cấu trúc bài toán: một cái nâng tỉ lệ nền, một cái nhân tỉ số khả năng, một cái đổi đơn vị cảnh báo. Đổi kiến trúc mô hình thường chỉ nhích FPR vài chục phần trăm, trong khi bạn đang cần cải thiện theo bậc độ lớn. Đây là lý do kỹ nghệ phát hiện (detection engineering) có tác động lớn hơn việc thay thuật toán.',
        },
        {
          id: 't1l3-q3',
          kind: 'input',
          tags: ['ti-le-nen'],
          q: 'Bạn muốn PPV đạt 50% với tỉ lệ nền 1 phần triệu và TPR 100%. FPR tối đa được phép là bao nhiêu? (Điền dạng như 1e-6 hoặc 0,000001)',
          accept: ['1e-6', '1e−6', '0,000001', '0.000001', '1 phan trieu', '0,0001%', '0.0001%'],
          placeholder: 'Ví dụ: 1e-4',
          hint: 'PPV 50% nghĩa là số cảnh báo giả bằng số cảnh báo thật.',
          why: 'PPV 50% nghĩa là cảnh báo giả = cảnh báo thật. Cảnh báo thật = p × TPR = 1e−6. Vậy FPR × (1−p) phải bằng 1e−6, tức **FPR ≈ 1e−6** — được sai đúng 1 lần trên 1 triệu sự kiện lành tính. Con số này gần như không đạt được với mô hình chạy trên dữ liệu thô, và đó chính là lý do phải thu hẹp phạm vi thay vì cố tối ưu mô hình.',
        },
        {
          id: 't1l3-q4',
          kind: 'truefalse',
          tags: ['ti-le-nen', 'do-luong'],
          q: 'Một bộ phát hiện có PPV 3% là vô dụng và nên bị loại bỏ.',
          answer: false,
          why: 'Còn tuỳ chi phí. PPV 3% nghĩa là 33 lần mở cảnh báo mới có 1 lần trúng. Nếu mỗi lần mở tốn 15 phút thì đó là 8 giờ công cho một phát hiện — không chấp nhận được. Nhưng nếu cảnh báo đã được làm giàu ngữ cảnh tự động và analyst loại được trong 20 giây thì 33 lần chỉ tốn 11 phút, và nếu thứ bắt được là ransomware giai đoạn sớm thì rất đáng. PPV phải luôn đọc cùng **chi phí xử lý một cảnh báo** và **giá trị của một phát hiện đúng**.',
        },
        {
          id: 't1l3-q5',
          kind: 'order',
          tags: ['ti-le-nen', 'thuc-chien'],
          q: 'Bạn được giao cải thiện một hệ thống đang sinh 12.000 cảnh báo/ngày với PPV dưới 1%. Sắp xếp các bước theo thứ tự hợp lý nhất.',
          items: [
            'Đo tỉ lệ nền thật và quy FPR hiện tại ra số cảnh báo tuyệt đối',
            'Thu hẹp phạm vi chấm điểm về nhóm tài sản và khung giờ có rủi ro cao nhất',
            'Yêu cầu ít nhất hai tín hiệu từ hai nguồn dữ liệu khác nhau mới nổ cảnh báo',
            'Gom cảnh báo còn lại theo thực thể và làm giàu ngữ cảnh tự động',
            'Chạy shadow mode hai tuần rồi mới bật cảnh báo cho analyst',
          ],
          why: 'Đo trước, sửa cấu trúc bài toán sau, chỉnh mô hình cuối cùng — đây là thứ tự tiết kiệm công sức nhất. Ba bước đầu tác động theo bậc độ lớn và gần như không tốn chi phí huấn luyện. Shadow mode đặt cuối vì nó xác nhận rằng bạn chưa vô tình cắt mất các phát hiện thật khi thu hẹp phạm vi.',
        },
      ],
      terms: ['ti-le-nen', 'ppv', 'bao-dong-gia', 'met-moi-canh-bao', 'fpr'],
      further: [
        {
          title: 'The Base-Rate Fallacy and its Implications for the Difficulty of Intrusion Detection — Stefan Axelsson (1999)',
          note: 'Bài báo gốc. Chỉ khoảng 10 trang, toán ở mức bài này, và mọi kết luận vẫn đúng nguyên sau 25 năm.',
        },
        {
          title: 'Outside the Closed World — Sommer & Paxson (2010)',
          note: 'Mở rộng lập luận của Axelsson sang thực tế triển khai: vì sao phát hiện bất thường trên lưu lượng thô hiếm khi hoạt động.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't1-l4',
      trackId: 'nen-mong',
      title: 'Phân phối, ngoại lai và thống kê mô tả',
      subtitle: 'Vì sao quy tắc 3-sigma nổi tiếng lại là công thức sinh báo động giả tốt nhất từng được phát minh',
      minutes: 19,
      practiceMinutes: 7,
      level: 'co-ban',
      prereqs: ['t1-l1'],
      why: {
        short:
          'Phần lớn hệ thống phát hiện bất thường đầu tiên mà một tổ chức tự xây đều dùng ngưỡng trung bình cộng ba lần độ lệch chuẩn — và đều thất bại vì dữ liệu mạng không hề có hình chuông.',
        scenario:
          'Bạn được yêu cầu cảnh báo khi một nhân viên tải xuống "bất thường nhiều" dữ liệu. Bạn tính trung bình 180 MB/ngày, độ lệch chuẩn 340 MB, đặt ngưỡng 180 + 3×340 = 1.200 MB. Sáng hôm sau có 27.000 cảnh báo, và người thực sự copy 40 GB ra USB thì không nằm trong đó.',
        roles: ['Threat Hunter', 'Detection Engineer', 'Security Data Scientist', 'SOC Analyst'],
        costOfNotKnowing:
          'Bạn xây một hệ thống UEBA cảnh báo sai hàng chục nghìn lần mỗi ngày trong khi vẫn bỏ lọt đúng trường hợp cần bắt — vì chính kẻ tấn công đã làm phồng độ lệch chuẩn mà bạn dùng để phát hiện hắn.',
      },
      objectives: [
        'Giải thích được vì sao trung vị và MAD bền hơn trung bình và độ lệch chuẩn trên dữ liệu bảo mật',
        'Tính z-score và z-score bền, biết khi nào dùng cái nào',
        'Nhận ra phân phối log-normal và đuôi nặng qua biểu đồ và qua tỉ số trung bình/trung vị',
        'Đặt ngưỡng bất thường theo phân vị và theo ngân sách cảnh báo thay vì theo 3-sigma',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bạn có 10 triệu sự kiện mỗi ngày và đặt ngưỡng cảnh báo ở "trung bình cộng 3 lần độ lệch chuẩn". Nếu dữ liệu thực sự tuân theo phân phối chuẩn, mỗi ngày bạn nhận bao nhiêu cảnh báo? Và dữ liệu mạng có tuân theo phân phối chuẩn không?',
          reveal:
            'Với phân phối chuẩn, phần nằm ngoài ±3 độ lệch chuẩn là **0,27%** → 10.000.000 × 0,0027 = **27.000 cảnh báo mỗi ngày**. Chỉ tính một phía (lớn hơn ngưỡng) thì vẫn là 0,135% → **13.500 cảnh báo**. Nhưng đó mới là tin xấu thứ nhất. Tin xấu thứ hai: dữ liệu mạng **không** phân phối chuẩn. Byte truyền, thời lượng phiên, số lần yêu cầu — tất cả đều lệch phải rất mạnh, thường gần **log-normal** hoặc có đuôi kiểu luỹ thừa. Với những phân phối đó, phần vượt 3-sigma có thể là 1–3%, tức **100.000 tới 300.000 cảnh báo mỗi ngày**. Quy tắc 3-sigma không sai về toán; nó chỉ dựa trên một giả định mà dữ liệu của bạn không thoả mãn.',
        },
        {
          t: 'h',
          text: 'Bốn con số mô tả một cột dữ liệu, và hai trong số đó nói dối',
          level: 2,
        },
        {
          t: 'p',
          md: 'Giả sử bạn đo lượng dữ liệu tải xuống của 11 nhân viên trong một ngày, đơn vị MB: **12, 15, 18, 20, 22, 25, 28, 30, 35, 40, 40960**. Người cuối cùng vừa copy 40 GB ra ổ ngoài — đúng cái bạn muốn bắt.',
        },
        {
          t: 'table',
          caption: 'Cùng một tập dữ liệu, bốn thước đo, hai kết luận trái ngược',
          head: ['Thước đo', 'Giá trị', 'Nó nói gì', 'Bị ngoại lai kéo lệch?'],
          rows: [
            ['Trung bình (mean)', '≈ 3.746 MB', 'Nhân viên trung bình tải 3,7 GB — sai hoàn toàn', 'CÓ, cực mạnh'],
            ['Trung vị (median)', '25 MB', 'Nửa số người tải dưới 25 MB — đúng thực tế', 'Không'],
            ['Độ lệch chuẩn (std)', '≈ 12.340 MB', 'Bị chính kẻ cần bắt thổi phồng', 'CÓ, cực mạnh'],
            ['MAD (độ lệch tuyệt đối trung vị)', '7 MB', 'Mức dao động điển hình quanh trung vị', 'Không'],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Hiệu ứng che lấp (masking) — trực giác cốt lõi của cả bài',
          md: 'Ngưỡng 3-sigma với dữ liệu trên là 3.746 + 3×12.342 = **40.772 MB**. Giá trị 40.960 MB vượt ngưỡng đó **rất sát** — thêm một người copy 30 GB nữa là ngưỡng vọt lên trên 60 GB và cả hai đều "bình thường". Nghĩa là: **ngoại lai tự bảo vệ mình bằng cách thổi phồng chính thước đo dùng để phát hiện nó**. Hiện tượng này gọi là masking, và nó khiến trung bình + độ lệch chuẩn trở thành lựa chọn tệ nhất cho phát hiện bất thường trong bảo mật.',
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'z-score và z-score bền, đọc từng ký hiệu',
          md: '**z-score thường**: z = (x − μ) / σ, trong đó μ là trung bình, σ là độ lệch chuẩn. Nghĩa: "x cách trung bình bao nhiêu lần độ lệch chuẩn".\n\n**z-score bền** (robust z): z = 0,6745 × (x − trung vị) / MAD, với MAD = trung vị của các giá trị |x − trung vị|.\n\nHằng số **0,6745** ở đâu ra? Với phân phối chuẩn, MAD ≈ 0,6745 × σ. Nhân vào để hai loại z đọc trên cùng thang, nên "z bền > 3,5" vẫn có ý nghĩa quen thuộc.\n\nÁp vào ví dụ trên: z thường của 40.960 MB là (40960 − 3746)/12342 = **3,02** — chỉ vừa đủ nghi ngờ, và ngưỡng 3-sigma là 40.772 MB, tức nó chỉ vượt qua trong gang tấc. z bền là 0,6745 × (40960 − 25)/7 = **3.944** — không còn cách nào nhầm lẫn được nữa.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Tính z-score bền bằng numpy — 8 dòng thay đổi hẳn chất lượng phát hiện',
          code: `import numpy as np

def z_ben(x: np.ndarray) -> np.ndarray:
    trung_vi = np.median(x)
    mad = np.median(np.abs(x - trung_vi))
    if mad == 0:                       # cột gần như hằng số, ví dụ 90% giá trị bằng 0
        mad = np.mean(np.abs(x - trung_vi)) or 1e-9
    return 0.6745 * (x - trung_vi) / mad

tai_xuong_mb = np.array([12, 15, 18, 20, 22, 25, 28, 30, 35, 40, 40960])

z_thuong = (tai_xuong_mb - tai_xuong_mb.mean()) / tai_xuong_mb.std(ddof=1)
print(round(z_thuong[-1], 2))          # 3.02  -> chi vua du nghi ngo
print(round(z_ben(tai_xuong_mb)[-1]))  # 3944  -> khong the bo qua`,
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't1l4-cp1',
              kind: 'mcq',
              tags: ['thong-ke', 'ngoai-lai'],
              q: 'Bạn xem một cột "số byte gửi ra mỗi phiên" và thấy trung bình là 4,2 MB còn trung vị là 38 KB. Kết luận đúng nhất?',
              options: [
                'Dữ liệu bị lỗi, cần làm sạch lại',
                'Phân phối lệch phải rất mạnh, nên dùng log và các thước đo bền',
                'Trung bình sai, phải tính lại',
                'Phân phối gần chuẩn nên dùng 3-sigma được',
              ],
              answer: 1,
              why: 'Tỉ số trung bình/trung vị ≈ 110 là dấu hiệu kinh điển của phân phối **lệch phải mạnh**, thường là log-normal hoặc đuôi luỹ thừa — hoàn toàn bình thường với lưu lượng mạng, kích thước tệp, thời lượng phiên. Đây không phải lỗi dữ liệu. Cách xử lý: biến đổi `log(1+x)` để đưa về gần đối xứng, hoặc bỏ hẳn giả định phân phối và dùng phân vị. Mẹo bỏ túi: nếu trung bình lớn hơn trung vị vài lần, đừng bao giờ dùng 3-sigma.',
              distractorWhy: [
                'Không có gì hỏng — đây là hình dạng tự nhiên của dữ liệu mạng.',
                '',
                'Trung bình tính đúng, chỉ là nó không mô tả được "trường hợp điển hình" của phân phối lệch.',
                'Chính là kết luận ngược: chênh lệch trung bình/trung vị lớn chứng minh phân phối KHÔNG chuẩn.',
              ],
            },
          ],
        },
        {
          t: 'h',
          text: 'Log-normal và đuôi nặng: hình dạng thật của dữ liệu bảo mật',
          level: 2,
        },
        {
          t: 'p',
          md: 'Một biến có phân phối **log-normal** nếu logarit của nó phân phối chuẩn. Nó xuất hiện tự nhiên bất cứ khi nào kết quả là **tích** của nhiều yếu tố ngẫu nhiên, thay vì tổng. Kích thước tệp, thời lượng phiên, lượng byte truyền, thời gian phản hồi DNS — tất cả đều thuộc nhóm này.',
        },
        {
          t: 'list',
          items: [
            '**Dấu hiệu nhận ra**: trung bình lớn hơn trung vị nhiều lần; biểu đồ tần suất có một đỉnh nhọn sát 0 và một cái đuôi dài lê thê sang phải; vẽ trên trục log thì đột nhiên thành hình chuông đẹp.',
            '**Cách xử lý đơn giản nhất**: thêm cột `log(1 + x)` rồi làm mọi thứ như bình thường trên cột đó. Cộng 1 để tránh log(0).',
            '**Đuôi nặng (heavy tail)** còn nặng hơn log-normal: một sự kiện đơn lẻ có thể lớn hơn trung vị hàng triệu lần. Ví dụ: lưu lượng của một máy chủ sao lưu trong đêm, số truy vấn DNS của một máy dò quét. Với đuôi nặng, ngay cả độ lệch chuẩn của mẫu cũng không ổn định — thêm một điểm dữ liệu có thể làm nó gấp đôi.',
            '**Đa mô thức (multimodal)**: cột "giờ đăng nhập" của cả công ty có hai đỉnh (sáng và chiều) chứ không phải một. Trung bình rơi vào giữa trưa — giờ mà gần như không ai đăng nhập. Trung bình của một phân phối hai đỉnh mô tả một thứ không tồn tại.',
          ],
        },
        {
          t: 'compare',
          title: 'Chọn bộ thước đo',
          left: {
            title: '📉 Trung bình + độ lệch chuẩn',
            items: [
              'Dùng khi dữ liệu gần đối xứng, không có ngoại lai',
              'Rẻ, tính được theo luồng (streaming), ai cũng hiểu',
              'Bị một điểm dữ liệu duy nhất phá hỏng',
              'Trong bảo mật: hầu như luôn sai lựa chọn',
              'Ngoại lệ hợp lý: sau khi đã lấy log và cắt đuôi',
            ],
          },
          right: {
            title: '🛡️ Trung vị + MAD + phân vị',
            items: [
              'Điểm gãy 50%: cần quá nửa dữ liệu bị nhiễm mới lệch',
              'Không giả định hình dạng phân phối nào',
              'Tốn bộ nhớ hơn (cần sắp xếp hoặc dùng t-digest)',
              'Cho phép đặt ngưỡng theo ngân sách cảnh báo',
              'Trong bảo mật: mặc định nên chọn cái này',
            ],
          },
        },
        {
          t: 'h',
          text: 'Cách đặt ngưỡng thực sự dùng được: phân vị và ngân sách cảnh báo',
          level: 2,
        },
        {
          t: 'p',
          md: '**Phân vị** (percentile) p99,9 là giá trị mà 99,9% dữ liệu nằm dưới nó. Ưu điểm quyết định: bạn không cần biết phân phối có hình gì. Và quan trọng hơn, nó **đảo ngược bài toán** — thay vì chọn ngưỡng rồi ngồi đếm cảnh báo, bạn chọn số cảnh báo trước rồi để ngưỡng tự rơi vào đúng chỗ.',
        },
        {
          t: 'steps',
          title: 'Đặt ngưỡng theo ngân sách cảnh báo, bốn bước',
          steps: [
            {
              title: 'Bước 1 — Hỏi đội SOC họ chịu được bao nhiêu',
              md: 'Câu hỏi cụ thể: "Mỗi ngày các bạn xử lý được thêm bao nhiêu cảnh báo loại này?" Giả sử câu trả lời là **50**. Đó là ngân sách, không phải mong muốn.',
            },
            {
              title: 'Bước 2 — Quy ngân sách thành phân vị',
              md: 'Nếu có 500.000 thực thể được chấm điểm mỗi ngày, 50 cảnh báo tương ứng với **top 0,01%** → ngưỡng là phân vị **p99,99** của điểm số. Với 5.000 người dùng, 50 cảnh báo là top 1% → p99.',
            },
            {
              title: 'Bước 3 — Tính phân vị theo từng nhóm, không tính chung',
              md: 'Đây là bước hầu hết mọi người bỏ qua. Một máy chủ sao lưu tải 800 GB mỗi đêm là bình thường; một laptop kế toán tải 800 MB thì không. Tính ngưỡng riêng cho từng **nhóm ngang hàng** (peer group): theo phòng ban, theo loại tài sản, theo khung giờ, theo ngày trong tuần. Điều này cũng chính là cách nâng tỉ lệ nền ở bài trước.',
            },
            {
              title: 'Bước 4 — Tính lại theo cửa sổ trượt và ghi lại lịch sử ngưỡng',
              md: 'Dùng cửa sổ 30 ngày gần nhất, cập nhật hằng ngày. Nhưng phải lưu lại giá trị ngưỡng từng ngày: nếu kẻ tấn công tăng dần lượng dữ liệu lấy đi trong 3 tháng, ngưỡng tự động sẽ **bò theo hắn** và không bao giờ kêu. Xem đồ thị ngưỡng theo thời gian là cách phát hiện kiểu tấn công đun ếch này.',
            },
          ],
        },
        {
          t: 'lab',
          id: 'lab-anomaly',
          intro:
            'Dữ liệu đăng nhập thật hơn bạn tưởng: có đỉnh giờ hành chính, có ca đêm hợp lệ, có một tài khoản dịch vụ chạy 24/7. Thử lần lượt 3-sigma, z bền và phân vị theo nhóm, đếm số cảnh báo và xem cái nào tìm ra kẻ tấn công.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bốn cái bẫy thống kê hay gặp nhất trong UEBA',
          md: '**1. Huấn luyện đường cơ sở trên dữ liệu đã bị nhiễm.** Nếu kẻ tấn công đã ở trong mạng suốt 60 ngày bạn dùng làm cơ sở, hành vi của hắn chính là "bình thường".\n\n**2. Bỏ qua tính mùa vụ.** Cuối tháng kế toán tải nhiều gấp 5 lần. Thứ hai đầu tuần đăng nhập nhiều gấp 3. Không tách theo thời gian thì mỗi cuối tháng bạn có một cơn bão cảnh báo.\n\n**3. Nhóm ngang hàng quá nhỏ.** Đặt ngưỡng riêng cho một người dựa trên 30 ngày dữ liệu của chính họ nghe rất hay, nhưng 30 điểm dữ liệu không đủ để ước lượng p99 — bạn đang đo nhiễu.\n\n**4. MAD bằng 0.** Rất hay xảy ra khi hơn nửa giá trị bằng nhau (ví dụ 80% người dùng có 0 lần đăng nhập thất bại). Chia cho 0 làm hỏng cả cột. Luôn có nhánh dự phòng như trong đoạn mã ở trên.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Mẹo thực chiến: nhìn dữ liệu trước khi tính bất cứ thứ gì',
          md: 'Trước khi viết dòng công thức đầu tiên, luôn in ra sáu con số cho mỗi cột: **min, p50, p90, p99, p99,9, max**. Ba mươi giây này cho bạn biết ngay phân phối có đuôi không, có bị chặn trên không, có bao nhiêu giá trị bằng 0. Trong pandas: `df.describe(percentiles=[.5, .9, .99, .999])`. Rất nhiều dự án đã cứu được cả tháng công chỉ nhờ nhìn bảng này sớm.',
        },
        {
          t: 'terms',
          ids: ['trung-vi', 'do-lech-chuan', 'z-score', 'mad', 'log-normal', 'phan-vi'],
        },
      ],
      keyTakeaways: [
        'Trung bình và độ lệch chuẩn bị một điểm ngoại lai duy nhất phá hỏng; trung vị và MAD thì không.',
        'Hiệu ứng che lấp: ngoại lai thổi phồng độ lệch chuẩn, tự đưa mình về dưới ngưỡng 3-sigma.',
        'Quy tắc 3-sigma giả định phân phối chuẩn; dữ liệu mạng thường log-normal hoặc đuôi nặng nên tạo hàng chục nghìn cảnh báo.',
        'Trung bình lớn hơn trung vị nhiều lần là dấu hiệu lệch phải mạnh — hãy lấy log hoặc chuyển sang phân vị.',
        'z bền = 0,6745 × (x − trung vị) / MAD; ngưỡng quen thuộc vẫn khoảng 3,5.',
        'Đặt ngưỡng theo ngân sách cảnh báo và theo nhóm ngang hàng, tính lại theo cửa sổ trượt nhưng phải lưu lịch sử ngưỡng.',
      ],
      cards: [
        {
          id: 't1l4-c1',
          front: 'Hiệu ứng che lấp (masking) trong phát hiện ngoại lai là gì?',
          back: 'Chính giá trị ngoại lai làm phồng trung bình và độ lệch chuẩn, khiến ngưỡng 3-sigma dâng lên và nó không còn bị coi là ngoại lai nữa.',
          tags: ['ngoai-lai', 'thong-ke'],
        },
        {
          id: 't1l4-c2',
          front: 'Viết công thức z-score bền và giải thích hằng số 0,6745.',
          back: 'z = 0,6745 × (x − trung vị) / MAD. Hằng số này vì với phân phối chuẩn MAD ≈ 0,6745σ, nhân vào để z bền đọc trên cùng thang với z thường.',
          tags: ['z-score', 'mad'],
        },
        {
          id: 't1l4-c3',
          front: 'Dấu hiệu nào cho biết một cột dữ liệu lệch phải mạnh, không nên dùng 3-sigma?',
          back: 'Trung bình lớn hơn trung vị nhiều lần (ví dụ mean 4,2 MB, median 38 KB). Khi đó nên lấy log hoặc chuyển hẳn sang phân vị.',
          tags: ['log-normal', 'thong-ke'],
        },
        {
          id: 't1l4-c4',
          front: 'Vì sao đặt ngưỡng bằng phân vị tốt hơn bằng công thức trung bình cộng k lần độ lệch chuẩn?',
          back: 'Vì phân vị không giả định hình dạng phân phối và cho phép chọn trước số cảnh báo mỗi ngày — ngưỡng tự rơi vào đúng chỗ theo ngân sách của đội SOC.',
          tags: ['phan-vi', 'thuc-chien'],
        },
        {
          id: 't1l4-c5',
          front: 'Vì sao ngưỡng bất thường tự cập nhật hằng ngày có thể bỏ lọt kẻ tấn công kiên nhẫn?',
          back: 'Vì nếu hắn tăng dần lượng dữ liệu lấy đi trong nhiều tháng, đường cơ sở sẽ bò theo và không bao giờ vượt ngưỡng. Phải lưu và xem lịch sử ngưỡng theo thời gian.',
          tags: ['ngoai-lai', 'thuc-chien'],
        },
      ],
      quiz: [
        {
          id: 't1l4-q1',
          kind: 'mcq',
          tags: ['thong-ke', 'ngoai-lai'],
          q: 'Dữ liệu tải xuống của 11 người: 12, 15, 18, 20, 22, 25, 28, 30, 35, 40, 40960 (MB). Thước đo nào mô tả đúng nhất "một ngày điển hình"?',
          options: ['Trung bình ≈ 3.746 MB', 'Trung vị = 25 MB', 'Độ lệch chuẩn ≈ 12.340 MB', 'Giá trị lớn nhất = 40.960 MB'],
          answer: 1,
          why: 'Trung vị chia đôi tập dữ liệu, nên một giá trị cực đoan dù lớn tới đâu cũng chỉ đẩy nó đi một bậc. Trung bình 3.746 MB không mô tả bất kỳ ai trong nhóm — không ai tải gần con số đó. Đây là lý do mọi bảng điều khiển bảo mật nên hiển thị trung vị và phân vị chứ không phải trung bình.',
          distractorWhy: [
            'Bị đúng một giá trị kéo lên gấp 150 lần giá trị điển hình.',
            '',
            'Độ lệch chuẩn ở đây lớn hơn cả giá trị lớn thứ hai — nó chỉ đang đo mức độ ô nhiễm của chính ngoại lai.',
            'Giá trị lớn nhất chính là thứ bất thường, không thể đại diện cho ngày điển hình.',
          ],
        },
        {
          id: 't1l4-q2',
          kind: 'multi',
          tags: ['thong-ke', 'thuc-chien'],
          q: 'Bạn xây phát hiện bất thường cho lượng dữ liệu tải xuống theo người dùng. Việc nào là đúng? (Chọn tất cả)',
          options: [
            'Tính ngưỡng riêng cho từng nhóm ngang hàng (phòng ban, loại tài sản)',
            'Dùng trung bình cộng 3 lần độ lệch chuẩn trên toàn bộ nhân viên',
            'Áp dụng log(1+x) trước khi tính thống kê',
            'Tách riêng ngày trong tuần và giai đoạn cuối tháng',
          ],
          answers: [0, 2, 3],
          why: 'Ba việc đúng đều xử lý cùng một vấn đề: dữ liệu không đồng nhất và không phân phối chuẩn. Nhóm ngang hàng loại bỏ so sánh máy chủ với laptop; log kéo đuôi phải về gần đối xứng; tách theo thời gian loại bỏ tính mùa vụ. Ba-sigma trên toàn bộ nhân viên gộp chung là công thức chắc chắn thất bại vì vừa vi phạm giả định phân phối, vừa trộn các nhóm có hành vi hoàn toàn khác nhau.',
        },
        {
          id: 't1l4-q3',
          kind: 'input',
          tags: ['thong-ke'],
          q: 'Với phân phối chuẩn, bao nhiêu phần trăm dữ liệu nằm ngoài khoảng trung bình ± 3 độ lệch chuẩn? (Điền số phần trăm, ví dụ 5 hoặc 0,5)',
          accept: ['0,27', '0.27', '0,27%', '0.27%', '0,3', '0.3'],
          placeholder: 'Ví dụ: 1,5',
          hint: 'Quy tắc 68 – 95 – 99,7.',
          why: 'Quy tắc 68 – 95 – 99,7: trong khoảng ±3σ có 99,73% dữ liệu, nên ngoài khoảng đó là **0,27%**. Nghe rất nhỏ, nhưng nhân với 10 triệu sự kiện thành 27.000 cảnh báo mỗi ngày — và đó là trong trường hợp lý tưởng nhất, khi dữ liệu thật sự phân phối chuẩn. Dữ liệu mạng thì không, nên con số thực tế còn cao hơn nhiều.',
        },
        {
          id: 't1l4-q4',
          kind: 'truefalse',
          tags: ['ngoai-lai'],
          q: 'Nếu MAD của một cột bằng 0, ta vẫn có thể tính z-score bền bình thường.',
          answer: false,
          why: 'MAD bằng 0 nghĩa là quá nửa giá trị trùng đúng với trung vị — rất hay xảy ra trong bảo mật khi 80% người dùng có 0 lần đăng nhập thất bại, 0 tệp bị mã hoá, 0 lần truy cập tài nguyên nhạy cảm. Chia cho 0 cho ra vô cực hoặc NaN và làm hỏng toàn bộ cột điểm. Cách xử lý: dùng độ lệch tuyệt đối trung bình làm phương án dự phòng, hoặc chuyển hẳn sang phân vị, hoặc mô hình hoá riêng phần "bằng 0" và phần "khác 0".',
        },
        {
          id: 't1l4-q5',
          kind: 'match',
          tags: ['thong-ke', 'log-normal'],
          q: 'Nối mỗi tình huống dữ liệu với cách xử lý phù hợp nhất.',
          pairs: [
            ['Byte truyền trải từ 1 KB tới 10 GB', 'Biến đổi log(1+x) rồi mới tính thống kê'],
            ['Một máy chủ sao lưu làm phồng độ lệch chuẩn', 'Chuyển sang trung vị và MAD'],
            ['Giờ đăng nhập có hai đỉnh sáng và chiều', 'Tách nhóm theo khung giờ thay vì tính trung bình chung'],
            ['SOC chỉ xử lý nổi 50 cảnh báo mỗi ngày', 'Đặt ngưỡng ở phân vị tương ứng với ngân sách đó'],
          ],
          why: 'Bốn cặp này bao trọn các tình huống bạn sẽ gặp: đuôi dài, ngoại lai, đa mô thức, và ràng buộc nguồn lực. Điểm chung của cả bốn cách xử lý là đều **không giả định phân phối chuẩn** — đó là thói quen quan trọng nhất cần mang ra khỏi bài này.',
        },
      ],
      terms: ['trung-vi', 'do-lech-chuan', 'z-score', 'mad', 'log-normal', 'phan-vi'],
      further: [
        {
          title: 'pandas — DataFrame.describe với tham số percentiles',
          note: 'Ba mươi giây đầu tiên với bất kỳ bộ dữ liệu mới nào. In min, p50, p90, p99, p99,9, max trước khi làm bất cứ điều gì khác.',
          url: 'https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.describe.html',
        },
        {
          title: 'scikit-learn — Novelty and Outlier Detection',
          note: 'Sau khi hiểu thống kê mô tả, đây là bước tiếp: IsolationForest và LocalOutlierFactor. Chặng 6 sẽ dùng lại.',
          url: 'https://scikit-learn.org/stable/modules/outlier_detection.html',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't1-l5',
      trackId: 'nen-mong',
      title: 'Entropy và lý thuyết thông tin',
      subtitle: 'Một con số duy nhất đo mức độ hỗn loạn — và ba chỗ nó cực kỳ hữu ích, một chỗ nó nói dối',
      minutes: 20,
      practiceMinutes: 7,
      level: 'co-ban',
      prereqs: ['t1-l1'],
      why: {
        short:
          'Entropy là một trong số ít đặc trưng chỉ tốn vài dòng mã nhưng có mặt trong hầu hết bộ phát hiện thật: sàng tên miền DGA, phát hiện phần bị nén hoặc mã hoá trong tệp PE, và đánh giá độ mạnh mật khẩu.',
        scenario:
          'Một máy trạm truy vấn 4.000 tên miền lạ trong 10 phút, hầu hết trả về NXDOMAIN. Bạn nghi ngờ mã độc đang dùng thuật toán sinh tên miền để tìm máy chủ điều khiển. Bạn cần một cách tự động tách `xkqvbz8lm3pw.biz` khỏi `cdn.microsoft.com` mà không cần danh sách trắng.',
        roles: ['Threat Hunter', 'Detection Engineer', 'Malware Analyst', 'Security Data Scientist'],
        costOfNotKnowing:
          'Bạn hoặc là bỏ qua một đặc trưng rẻ và mạnh, hoặc tệ hơn: dùng entropy một mình rồi cảnh báo mỗi lần thấy một tệp cài đặt được nén hợp lệ hoặc một tên miền CDN có nhãn băm — hàng nghìn báo động giả mỗi ngày từ một công thức bốn dòng.',
      },
      objectives: [
        'Tính entropy Shannon của một chuỗi bằng tay và bằng Python, giải thích ý nghĩa đơn vị bit',
        'Dùng entropy chuẩn hoá theo độ dài để so sánh các chuỗi dài ngắn khác nhau',
        'Nêu ba ứng dụng thực tế của entropy trong bảo mật và ít nhất hai trường hợp entropy cho kết luận sai',
        'Giải thích được vì sao entropy của mật khẩu đo bộ sinh chứ không đo chính mật khẩu đó',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Xếp bốn chuỗi này theo entropy từ thấp tới cao: (a) `aaaaaaaa`, (b) `google`, (c) `kq3vn8xzlp`, (d) `microsoft`. Và câu hỏi khó hơn: chuỗi 6 ký tự có thể có entropy cao hơn chuỗi 10 ký tự không?',
          reveal:
            'Thứ tự: **a (0,00) < b (1,92) < d (2,95) < c (3,32)**. Chuỗi `aaaaaaaa` có entropy đúng bằng 0 vì không có gì bất định — bạn biết chắc ký tự tiếp theo. Còn câu hỏi thứ hai là bẫy quan trọng nhất của bài: entropy của một chuỗi dài n **không bao giờ vượt quá log2(n)**. Chuỗi 6 ký tự có trần entropy là log2(6) = **2,58 bit**, dù các ký tự có ngẫu nhiên tới đâu. Nghĩa là một tên miền ngắn **không thể** có entropy cao, còn một tên miền dài thì dễ dàng có. So sánh entropy thô giữa `paypal.com` và `d3f8a91b2c7e.cloudfront.net` là so sánh hai thứ khác đơn vị.',
        },
        {
          t: 'p',
          md: 'Claude Shannon (1948) đặt ra câu hỏi: **cần trung bình bao nhiêu bit để mã hoá một ký tự lấy từ nguồn này?** Câu trả lời của ông là entropy, và nó hoá ra là thước đo tự nhiên nhất cho "mức độ khó đoán".',
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Entropy Shannon, đọc từng ký hiệu',
          md: 'H = − Σ p_i × log2(p_i)\n\n- **p_i** — tần suất xuất hiện của ký tự thứ i trong chuỗi. Nếu `l` xuất hiện 2 lần trong chuỗi 6 ký tự thì p = 2/6.\n- **log2** — logarit cơ số 2, nên đơn vị là **bit**.\n- **Σ** — cộng qua mọi ký tự khác nhau xuất hiện.\n- **Dấu trừ** ở đầu chỉ để kết quả dương, vì log2 của một số nhỏ hơn 1 luôn âm.\n\nĐọc thành lời: *trung bình cần bao nhiêu câu hỏi có/không để đoán ra một ký tự bất kỳ trong chuỗi.* H = 0 nghĩa là không cần hỏi gì (chỉ có một ký tự). H = 3 nghĩa là cần trung bình 3 câu hỏi.',
        },
        {
          t: 'steps',
          title: 'Tính entropy của chuỗi `google` bằng tay',
          steps: [
            {
              title: 'Bước 1 — Đếm tần suất',
              md: 'Chuỗi có 6 ký tự: g xuất hiện 2 lần, o 2 lần, l 1 lần, e 1 lần. Vậy p(g) = 2/6, p(o) = 2/6, p(l) = 1/6, p(e) = 1/6.',
            },
            {
              title: 'Bước 2 — Tính từng số hạng',
              md: 'Với g: −(2/6) × log2(2/6) = −0,333 × (−1,585) = **0,528**. Với o: cũng **0,528**. Với l: −(1/6) × log2(1/6) = −0,167 × (−2,585) = **0,431**. Với e: cũng **0,431**.',
            },
            {
              title: 'Bước 3 — Cộng lại',
              md: 'H = 0,528 + 0,528 + 0,431 + 0,431 = **1,92 bit**. So sánh với trần lý thuyết log2(6) = 2,58 bit. Tỉ lệ 1,92/2,58 = **0,74** — đây chính là **entropy chuẩn hoá**, con số nên dùng khi so sánh chuỗi có độ dài khác nhau.',
            },
          ],
        },
        {
          t: 'figure',
          id: 'fig-entropy-scale',
          caption:
            'Thang entropy từ chuỗi lặp tới ngẫu nhiên hoàn toàn. Chú ý vùng chồng lấn ở giữa: đó là nơi tên miền hợp lệ có nhãn băm nằm cùng chỗ với tên miền DGA — và là lý do entropy không bao giờ được dùng một mình.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Entropy Shannon cho chuỗi và cho byte — bản dùng được trong sản xuất',
          code: `import math
from collections import Counter

def entropy(du_lieu) -> float:
    """Tinh entropy Shannon (bit) cho chuoi ky tu hoac chuoi byte."""
    if not du_lieu:
        return 0.0
    n = len(du_lieu)
    return -sum((c / n) * math.log2(c / n) for c in Counter(du_lieu).values())

def entropy_chuan_hoa(s: str) -> float:
    """Chia cho tran ly thuyet log2(n) de so sanh chuoi dai ngan khac nhau."""
    return entropy(s) / math.log2(len(s)) if len(s) > 1 else 0.0

print(round(entropy('aaaaaaaa'), 2))        # 0.00
print(round(entropy('google'), 2))          # 1.92
print(round(entropy('kq3vn8xzlp'), 2))      # 3.32
print(round(entropy_chuan_hoa('google'), 2))    # 0.74
print(round(entropy_chuan_hoa('kq3vn8xzlp'), 2))  # 1.00

# Voi tep nhi phan: doc theo byte, tran la 8 bit/byte
with open('mau.exe', 'rb') as f:
    print(round(entropy(f.read()), 2))      # ~7.9 neu da nen/ma hoa`,
        },
        {
          t: 'h',
          text: 'Ba chỗ entropy thực sự hữu ích',
          level: 2,
        },
        {
          t: 'table',
          caption: 'Ba ứng dụng, kèm ngưỡng tham khảo và cảnh báo đi kèm',
          head: ['Ứng dụng', 'Cách dùng', 'Ngưỡng tham khảo', 'Cạm bẫy'],
          rows: [
            [
              'Sàng tên miền DGA',
              'Entropy chuẩn hoá của nhãn tên miền, kèm độ dài và tỉ lệ chữ số',
              'Chuẩn hoá > 0,9 và dài > 12 ký tự là đáng nghi',
              'CDN dùng nhãn băm cũng đạt 1,0; DGA theo từ điển thì entropy thấp',
            ],
            [
              'Phát hiện phần bị nén hoặc mã hoá trong tệp PE',
              'Entropy theo từng section (byte), so với entropy toàn tệp',
              'Section > 7,2 bit/byte là nén hoặc mã hoá; > 7,9 gần như chắc chắn',
              'Trình cài đặt hợp lệ, tài nguyên PNG/JPEG, tệp đã ký cũng cao',
            ],
            [
              'Phát hiện chuỗi mã hoá base64 hoặc dữ liệu bị nhồi trong log',
              'Entropy của tham số URL, giá trị cookie, nhãn truy vấn DNS',
              'Chuỗi dài > 40 ký tự với entropy chuẩn hoá > 0,95',
              'JWT, session token, tham số theo dõi quảng cáo đều như vậy',
            ],
            [
              'Đo độ mạnh mật khẩu',
              'log2(N^L) = L × log2(N) với N là kích thước bảng chữ cái',
              '< 40 bit là yếu, > 70 bit là mạnh với mật khẩu SINH NGẪU NHIÊN',
              'Chỉ đúng nếu mật khẩu thực sự ngẫu nhiên — xem phần dưới',
            ],
          ],
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't1l5-cp1',
              kind: 'mcq',
              tags: ['entropy', 'dga'],
              q: 'Bạn đặt luật: cảnh báo mọi tên miền có entropy chuẩn hoá trên 0,9. Nguồn báo động giả lớn nhất sẽ là gì?',
              options: [
                'Tên miền quốc tế hoá có dấu tiếng Việt',
                'Tên miền do CDN và dịch vụ đám mây sinh tự động với nhãn dạng băm',
                'Tên miền cấp cao mới như .biz, .top, .xyz',
                'Tên miền viết tắt ngắn dưới 6 ký tự',
              ],
              answer: 1,
              why: 'Hạ tầng hiện đại sinh ra hàng triệu tên miền dạng `d3f8a91b2c7e.cloudfront.net`, `k7m2p9x.akamaiedge.net`, `blob-a8f3c2.core.windows.net`. Về mặt entropy chúng **không phân biệt được** với DGA — vì cả hai đều là chuỗi băm. Đây là lý do mọi bộ phát hiện DGA dùng được trong thực tế đều kết hợp entropy với: tần suất n-gram so với tiếng Anh, tỉ lệ NXDOMAIN của máy hỏi, tuổi tên miền, thứ hạng phổ biến (Tranco/Cloudflare Radar), và có nằm dưới tên miền cha đã biết không.',
              distractorWhy: [
                'Tên miền IDN có tồn tại nhưng số lượng nhỏ và có thể xử lý riêng.',
                '',
                'TLD chỉ là hậu tố cố định, không ảnh hưởng tới entropy của nhãn.',
                'Chuỗi ngắn có trần entropy thấp nên gần như không thể vượt 0,9 khi đã chuẩn hoá đúng.',
              ],
            },
          ],
        },
        {
          t: 'lab',
          id: 'lab-entropy',
          intro:
            'Gõ vào bất cứ chuỗi nào và xem entropy thô, entropy chuẩn hoá và điểm n-gram tiếng Anh cùng lúc. Thử `paypal.com`, `d3f8a91b2c7e.cloudfront.net`, và một tên miền DGA kiểu Conficker. Bạn sẽ thấy tận mắt vì sao một mình entropy là không đủ.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bẫy lớn nhất: entropy cao không có nghĩa là độc hại',
          md: 'Hãy nhìn danh sách những thứ có entropy gần cực đại và hoàn toàn vô hại: tệp cài đặt nén, ảnh JPEG và PNG, video, kho lưu trữ ZIP, chứng chỉ số, khoá công khai, JWT, session token, ID theo dõi, tệp đã ký số, bất kỳ thứ gì được nén bằng zlib. Trong một doanh nghiệp bình thường, **phần lớn dữ liệu entropy cao là hợp lệ**. Entropy là một tín hiệu có **tỉ số khả năng khiêm tốn** (nhớ bài t1-l2) — dùng nó để **thu hẹp** tập nghi vấn, đừng dùng nó để **kết luận**.\n\nVà chiều ngược lại cũng đúng: các họ DGA dùng từ điển như **suppobox** hay **matsnu** sinh ra tên miền kiểu `bottomorange.net` — entropy thấp, đọc được, và hoàn toàn qua mặt mọi luật dựa trên entropy.',
        },
        {
          t: 'h',
          text: 'Entropy mật khẩu: chỗ mà con số nói dối trắng trợn nhất',
          level: 2,
        },
        {
          t: 'p',
          md: 'Công thức quen thuộc: entropy = L × log2(N), với L là độ dài và N là kích thước bảng chữ cái. Mật khẩu 12 ký tự dùng chữ hoa, chữ thường, số và ký hiệu (N ≈ 95) cho **12 × 6,57 ≈ 79 bit**. Nghe rất an toàn.',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Công thức đó đo BỘ SINH, không đo mật khẩu',
          md: 'Mật khẩu `P@ssw0rd123!` cũng có 12 ký tự và cũng dùng đủ bốn nhóm ký tự — công thức trên cho nó **79 bit**. Trong thực tế nó nằm trong mọi danh sách từ điển và bị đoán ra trong **dưới một giây**. Entropy Shannon giả định các ký tự được chọn **độc lập và ngẫu nhiên**. Con người thì không làm thế: chúng ta thay a bằng @, thêm số ở cuối, viết hoa chữ đầu — những mẫu hình mà công cụ bẻ khoá như hashcat đã mã hoá sẵn thành luật.\n\nĐây là lý do **NIST SP 800-63B** đã bỏ khuyến nghị bắt buộc trộn ký tự và đổi mật khẩu định kỳ, chuyển sang: ưu tiên **độ dài**, và **đối chiếu với danh sách mật khẩu đã bị lộ** (breached password list). Kiểm tra bằng danh sách thực tế mạnh hơn mọi công thức entropy.',
        },
        {
          t: 'compare',
          title: 'Hai loại entropy hay bị lẫn',
          left: {
            title: '🔢 Entropy của một chuỗi cụ thể',
            items: [
              'Tính từ tần suất ký tự trong chính chuỗi đó',
              'Dùng cho: tên miền, tham số URL, byte của tệp',
              'Bị chặn trên bởi log2(độ dài)',
              'Đo: chuỗi này trông hỗn loạn tới đâu',
              'Không nói gì về cách chuỗi được tạo ra',
            ],
          },
          right: {
            title: '🎲 Entropy của một bộ sinh',
            items: [
              'Tính từ không gian lựa chọn: L × log2(N)',
              'Dùng cho: mật khẩu, khoá, token, số ngẫu nhiên',
              'Không có trần theo độ dài chuỗi cụ thể',
              'Đo: kẻ tấn công phải thử bao nhiêu khả năng',
              'Chỉ đúng nếu lựa chọn thật sự đều và độc lập',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Mẹo thực chiến: entropy còn là nền của cây quyết định',
          md: 'Cùng công thức H = −Σ p log2 p xuất hiện lại ở chặng ML cốt lõi dưới tên **information gain**: cây quyết định chọn câu hỏi nào để chia dữ liệu bằng cách xem câu hỏi đó **giảm entropy của nhãn** được bao nhiêu. Nếu bạn nắm chắc entropy ở đây, bài về cây quyết định sau này sẽ không có gì mới về mặt toán — chỉ là áp cùng công thức lên phân phối nhãn thay vì phân phối ký tự.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't1l5-cp2',
              kind: 'truefalse',
              tags: ['entropy', 'malware'],
              q: 'Một section trong tệp PE có entropy 7,95 bit/byte, vậy tệp đó là mã độc.',
              answer: false,
              why: 'Entropy 7,95 chỉ nói section đó **bị nén hoặc mã hoá** — dữ liệu gần như ngẫu nhiên đều. Đó có thể là UPX (dùng bởi cả mã độc lẫn phần mềm hợp lệ), có thể là tài nguyên nhúng dạng PNG, có thể là trình cài đặt tự giải nén, có thể là phần đã bị bảo vệ bởi công cụ chống dịch ngược thương mại mà nhà phát triển hợp pháp mua. Entropy cao là **cờ để xem kỹ hơn**, không phải kết luận. Nhớ lại chuyện UPX ở bài t0-l1: đó chính là ví dụ về việc mô hình học nhầm entropy thành nhãn.',
            },
          ],
        },
        {
          t: 'terms',
          ids: ['entropy', 'dga', 'entropy-chuan-hoa', 'information-gain', 'packer'],
        },
      ],
      keyTakeaways: [
        'H = −Σ p log2 p, đơn vị bit, đọc là "trung bình cần bao nhiêu câu hỏi có/không để đoán một ký tự".',
        'Entropy của chuỗi dài n bị chặn trên bởi log2(n) — luôn chuẩn hoá trước khi so sánh các chuỗi dài ngắn khác nhau.',
        'Ba ứng dụng chính: sàng tên miền DGA, phát hiện section bị nén/mã hoá trong PE, tìm dữ liệu nhồi trong log.',
        'Entropy cao KHÔNG có nghĩa là độc hại: ảnh, ZIP, chứng chỉ, JWT, CDN đều entropy cao và hoàn toàn hợp lệ.',
        'DGA theo từ điển (suppobox, matsnu) có entropy thấp và vượt qua mọi luật dựa trên entropy.',
        'Entropy mật khẩu theo công thức L×log2(N) đo bộ sinh chứ không đo mật khẩu; NIST SP 800-63B ưu tiên độ dài và danh sách mật khẩu đã lộ.',
        'Cùng công thức entropy quay lại ở cây quyết định dưới tên information gain.',
      ],
      cards: [
        {
          id: 't1l5-c1',
          front: 'Viết công thức entropy Shannon và cho biết đơn vị.',
          back: 'H = −Σ p_i × log2(p_i), trong đó p_i là tần suất của ký tự thứ i. Đơn vị là bit vì dùng logarit cơ số 2.',
          tags: ['entropy'],
        },
        {
          id: 't1l5-c2',
          front: 'Vì sao phải chuẩn hoá entropy trước khi so sánh hai tên miền dài ngắn khác nhau?',
          back: 'Vì entropy của chuỗi dài n bị chặn trên bởi log2(n). Chuỗi ngắn không thể đạt entropy cao dù ngẫu nhiên tới đâu. Chia H cho log2(n) để đưa về cùng thang 0..1.',
          hint: 'Nghĩ về trần lý thuyết theo độ dài.',
          tags: ['entropy', 'dga'],
        },
        {
          id: 't1l5-c3',
          front: 'Nêu ba loại dữ liệu hoàn toàn hợp lệ nhưng có entropy gần cực đại.',
          back: 'Tệp nén (ZIP, tệp cài đặt), ảnh và video đã nén (JPEG, PNG, MP4), và các chuỗi bí mật hợp lệ (JWT, session token, chứng chỉ, khoá).',
          tags: ['entropy', 'bay-thuong-gap'],
        },
        {
          id: 't1l5-c4',
          front: 'Vì sao entropy một mình không phát hiện được mọi DGA?',
          back: 'Vì DGA theo từ điển như suppobox sinh ra tên miền kiểu bottomorange.net — entropy thấp, đọc được. Đồng thời CDN sinh nhãn băm có entropy cao mà hoàn toàn lành tính.',
          tags: ['entropy', 'dga'],
        },
        {
          id: 't1l5-c5',
          front: 'Vì sao mật khẩu P@ssw0rd123! có entropy tính toán 79 bit nhưng bị bẻ trong dưới một giây?',
          back: 'Vì công thức L×log2(N) giả định mọi ký tự được chọn ngẫu nhiên độc lập. Nó đo bộ sinh, không đo mật khẩu cụ thể — và mật khẩu này nằm trong mọi danh sách từ điển.',
          tags: ['entropy', 'mat-khau'],
        },
      ],
      quiz: [
        {
          id: 't1l5-q1',
          kind: 'input',
          tags: ['entropy'],
          q: 'Entropy Shannon của chuỗi `aaaa` bằng bao nhiêu bit?',
          accept: ['0', '0.0', '0,0', '0 bit', 'khong', '0.00'],
          placeholder: 'Điền một con số',
          hint: 'Chỉ có một ký tự duy nhất, xác suất bằng 1.',
          why: 'Chỉ có một ký tự với p = 1, mà log2(1) = 0, nên H = −1 × 0 = **0 bit**. Đọc thành lời: không cần hỏi câu nào để đoán ký tự tiếp theo, vì không có gì bất định. Đây là giá trị nhỏ nhất mà entropy có thể nhận.',
        },
        {
          id: 't1l5-q2',
          kind: 'mcq',
          tags: ['entropy', 'malware'],
          q: 'Bạn quét 200.000 tệp PE trong doanh nghiệp và cảnh báo mọi tệp có section entropy trên 7,5. Kết quả nhiều khả năng nhất?',
          options: [
            'Bắt được gần như toàn bộ mã độc với rất ít báo động giả',
            'Hàng nghìn báo động giả từ trình cài đặt, tài nguyên nhúng và phần mềm được bảo vệ hợp pháp',
            'Không bắt được gì vì mã độc hiện đại không nén',
            'Chỉ bắt được mã độc dùng UPX và không có báo động giả',
          ],
          answer: 1,
          why: 'Entropy cao đo hiện tượng "dữ liệu gần ngẫu nhiên", mà nén và mã hoá là chuyện hoàn toàn bình thường trong phần mềm hợp lệ: trình cài đặt tự giải nén, tài nguyên PNG/JPEG nhúng, công cụ chống sao chép thương mại. Trong một doanh nghiệp cỡ trung, số tệp lành tính có section entropy cao lớn hơn số mã độc hàng nghìn lần — nghịch lý tỉ lệ nền lại xuất hiện. Cách dùng đúng: entropy là **một cột** trong bộ đặc trưng cùng với imports, kích thước section, chữ ký số, tên section bất thường — không phải một luật độc lập.',
          distractorWhy: [
            'Đây là kỳ vọng lạc quan bỏ qua hoàn toàn tỉ lệ nền của tệp lành tính có entropy cao.',
            '',
            'Mã độc hiện đại vẫn nén rất nhiều; vấn đề là tệp lành tính cũng vậy.',
            'UPX được dùng rộng rãi bởi phần mềm hợp pháp, nên vẫn có báo động giả.',
          ],
        },
        {
          id: 't1l5-q3',
          kind: 'multi',
          tags: ['dga', 'entropy'],
          q: 'Ngoài entropy, đặc trưng nào giúp phân biệt tên miền DGA với tên miền hợp lệ? (Chọn tất cả)',
          options: [
            'Tỉ lệ truy vấn trả về NXDOMAIN của máy đang hỏi',
            'Điểm tần suất n-gram so với ngôn ngữ tự nhiên',
            'Số hiệu cổng của kết nối DNS',
            'Tuổi đăng ký tên miền và thứ hạng phổ biến',
          ],
          answers: [0, 1, 3],
          why: 'Ba đặc trưng đúng đều nhìn vào thứ mà kẻ tấn công khó thay đổi mà không tốn kém. Mã độc dùng DGA phải thử hàng trăm tên miền chưa đăng ký trước khi trúng một cái, nên **tỉ lệ NXDOMAIN cao** là dấu hiệu hành vi rất mạnh — mạnh hơn hẳn entropy của một tên miền đơn lẻ. Điểm n-gram bắt được cả DGA theo từ điển mà entropy bỏ sót. Cổng DNS gần như luôn là 53 nên không mang thông tin phân biệt.',
        },
        {
          id: 't1l5-q4',
          kind: 'order',
          tags: ['entropy'],
          q: 'Sắp xếp bốn chuỗi theo entropy chuẩn hoá tăng dần.',
          items: ['aaaaaaaaaa', 'bottomorange', 'microsoft', 'kq3vn8xzlp'],
          why: '`aaaaaaaaaa` có entropy 0 (một ký tự duy nhất). `bottomorange` có nhiều ký tự lặp (o ba lần, t hai lần) nên chuẩn hoá khoảng 0,84. `microsoft` chỉ lặp một chữ o, chuẩn hoá khoảng 0,93. `kq3vn8xzlp` có 10 ký tự đôi một khác nhau nên đạt trần, chuẩn hoá bằng **1,00**. Chú ý `bottomorange` chính là kiểu tên miền do DGA từ điển sinh ra — entropy thấp mà vẫn độc hại.',
        },
        {
          id: 't1l5-q5',
          kind: 'truefalse',
          tags: ['entropy', 'mat-khau'],
          q: 'Bắt buộc mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt là cách hiệu quả nhất để tăng entropy thực tế.',
          answer: false,
          why: 'Quy tắc trộn ký tự làm tăng entropy **theo công thức** nhưng ít làm tăng entropy **thực tế**, vì con người phản ứng với quy tắc theo những cách rất dễ đoán: viết hoa chữ cái đầu, thay a thành @, thêm số 1 và dấu ! ở cuối. Hashcat có sẵn bộ luật mô phỏng đúng những biến đổi này. NIST SP 800-63B khuyến nghị thay bằng: cho phép mật khẩu dài (ít nhất 64 ký tự), bỏ yêu cầu đổi định kỳ, và **đối chiếu với danh sách mật khẩu đã bị lộ** — biện pháp cuối hiệu quả hơn tất cả các quy tắc thành phần cộng lại.',
        },
      ],
      terms: ['entropy', 'dga', 'entropy-chuan-hoa', 'information-gain', 'packer'],
      further: [
        {
          title: 'A Mathematical Theory of Communication — Claude Shannon (1948)',
          note: 'Bài báo khai sinh lý thuyết thông tin. Chỉ cần đọc mục 6 về entropy là đủ cho mục đích bảo mật.',
        },
        {
          title: 'NIST SP 800-63B — Digital Identity Guidelines, Authentication',
          note: 'Mục 5.1.1 giải thích vì sao bỏ quy tắc trộn ký tự và đổi mật khẩu định kỳ. Tài liệu nên đọc trước khi tranh luận về chính sách mật khẩu.',
          url: 'https://pages.nist.gov/800-63-3/sp800-63b.html',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't1-l6',
      trackId: 'nen-mong',
      title: 'Đại số tuyến tính vừa đủ',
      subtitle: 'Bốn khái niệm — vector, tích vô hướng, chuẩn, khoảng cách — và một lời nguyền',
      minutes: 19,
      practiceMinutes: 7,
      level: 'co-ban',
      prereqs: ['t1-l1'],
      why: {
        short:
          'Mọi mô hình tuyến tính, mọi nơ-ron, mọi phép so khớp tương tự và mọi truy vấn vector trong hệ thống RAG đều quy về đúng hai phép toán: tích vô hướng và khoảng cách.',
        scenario:
          'Bạn có 300.000 dòng lệnh PowerShell thu từ EDR và cần gom những dòng "gần giống nhau" thành cụm để analyst xem 40 cụm thay vì 300.000 dòng. Bạn phải chọn: đo giống nhau bằng khoảng cách Euclid hay bằng cosine? Chọn sai thì một dòng lệnh lặp 50 lần sẽ bị coi là khác hẳn chính nó chạy 1 lần.',
        roles: ['Security Data Scientist', 'ML Engineer', 'Threat Hunter', 'Detection Engineer'],
        costOfNotKnowing:
          'Bạn xây một hệ thống phát hiện bất thường dựa trên khoảng cách trên 5.000 đặc trưng one-hot, thấy mọi điểm cách nhau gần như bằng nhau, kết luận là "dữ liệu không có tín hiệu" — trong khi thật ra bạn vừa gặp lời nguyền số chiều mà không nhận ra.',
      },
      objectives: [
        'Tính tích vô hướng và chuẩn L2 của hai vector nhỏ bằng tay',
        'Giải thích được vì sao tích vô hướng chính là phép tính bên trong một nơ-ron và một mô hình tuyến tính',
        'Chọn đúng giữa khoảng cách cosine và khoảng cách Euclid cho một bài toán bảo mật cụ thể',
        'Nhận ra dấu hiệu của lời nguyền số chiều và nêu ba cách xử lý',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Hai máy trạm, mỗi máy mô tả bằng vector [số lần chạy powershell, số lần truy cập chia sẻ mạng, số lần đăng nhập thất bại]. Máy A = [2, 0, 1]. Máy B = [20, 0, 10]. Hai máy này giống nhau hay khác nhau về hành vi?',
          reveal:
            'Tuỳ bạn hỏi câu gì. Về **mẫu hình** hành vi, chúng giống hệt nhau: cùng tỉ lệ 2:0:1, chỉ khác cường độ — cosine similarity bằng đúng **1,0**. Về **cường độ**, chúng rất khác: khoảng cách Euclid là căn của (18² + 0 + 9²) = **20,1**. Máy B có thể là máy quản trị viên làm cùng loại việc nhưng nhiều hơn 10 lần, hoặc có thể là máy đang bị điều khiển. Bài học: **cosine hỏi "đi cùng hướng không", Euclid hỏi "cách nhau bao xa"**. Trong bảo mật bạn thường cần cả hai, và phải cố ý chọn chứ không chọn theo thói quen.',
        },
        {
          t: 'h',
          text: 'Vector: chỉ là một hàng số, nhưng nghĩ như mũi tên',
          level: 2,
        },
        {
          t: 'p',
          md: 'Một vector là một danh sách số có thứ tự: `x = [2, 0, 1]`. Bạn đã gặp nó ở bài t1-l1 dưới tên vector đặc trưng. Hình dung nó là một **mũi tên** xuất phát từ gốc toạ độ, chỉ tới điểm có toạ độ đó. Với 3 số thì bạn vẽ được; với 300 số thì không vẽ được nhưng mọi công thức vẫn hoạt động y hệt.',
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Ba công thức, đọc từng ký hiệu',
          md: '**Tích vô hướng** (dot product): a · b = a1×b1 + a2×b2 + ... + an×bn. Nhân từng cặp thành phần rồi cộng lại. Kết quả là **một số duy nhất**, không phải vector.\n\n**Chuẩn L2** (độ dài Euclid): ||a|| = căn bậc hai của (a1² + a2² + ... + an²). Chính là định lý Pythagoras mở rộng ra n chiều. Đây là "độ dài mũi tên".\n\n**Chuẩn L1** (Manhattan): |a1| + |a2| + ... + |an|. Đi theo lưới đường phố thay vì đi thẳng. Xuất hiện lại ở phần regularization L1 — thứ giúp mô hình tự loại bớt đặc trưng.\n\n**Khoảng cách Euclid** giữa a và b = ||a − b||, tức chuẩn L2 của hiệu.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao tích vô hướng là phép toán quan trọng nhất trong ML',
          md: 'Hồi quy logistic tính điểm số bằng: **z = w · x + b**, tức tích vô hướng của vector trọng số với vector đặc trưng. Một nơ-ron làm đúng như vậy rồi cho qua hàm kích hoạt. Một lớp mạng nơ-ron là nhiều tích vô hướng chạy song song. Cơ chế attention trong Transformer cũng là tích vô hướng giữa query và key.\n\nÝ nghĩa trực giác: **w là bản mô tả "hình dạng của điều đáng ngờ"**, còn tích vô hướng đo xem mẫu x khớp với bản mô tả đó bao nhiêu. Trọng số dương lớn ở đặc trưng nào nghĩa là đặc trưng đó đẩy điểm về phía độc hại; trọng số âm thì kéo về phía lành tính.',
        },
        {
          t: 'steps',
          title: 'Ví dụ mẫu: chấm điểm một URL bằng tích vô hướng',
          steps: [
            {
              title: 'Bước 1 — Vector đặc trưng của URL',
              md: 'x = [1, 0, 1, 0] tương ứng với [dùng IP thay tên miền, có chứng chỉ hợp lệ, tên miền dưới 7 ngày tuổi, nằm trong top 1 triệu phổ biến].',
            },
            {
              title: 'Bước 2 — Vector trọng số mô hình đã học',
              md: 'w = [2,1 ; −1,8 ; 1,6 ; −2,4]. Đọc: dùng IP thay tên miền đẩy mạnh về phía độc; có chứng chỉ hợp lệ kéo về phía lành; tên miền mới đẩy về phía độc; nằm trong top phổ biến kéo mạnh về phía lành.',
            },
            {
              title: 'Bước 3 — Tích vô hướng',
              md: 'z = 2,1×1 + (−1,8)×0 + 1,6×1 + (−2,4)×0 = **3,7**. Cộng thêm hệ số chệch b = −2,0 thì z = **1,7**.',
            },
            {
              title: 'Bước 4 — Đổi z thành xác suất',
              md: 'Hàm sigmoid: p = 1/(1 + e^(−z)) = 1/(1 + e^(−1,7)) ≈ **0,845**. Vậy mô hình cho URL này 84,5% khả năng là độc hại. Toàn bộ hồi quy logistic chỉ có bấy nhiêu — một tích vô hướng và một hàm bóp về khoảng 0..1.',
            },
          ],
        },
        {
          t: 'h',
          text: 'Cosine hay Euclid: câu hỏi phải trả lời trước mọi bài toán tương tự',
          level: 2,
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Cosine similarity',
          md: 'cos(a, b) = (a · b) / (||a|| × ||b||)\n\nTức là: tích vô hướng chia cho tích hai độ dài. Chia như vậy để **triệt tiêu độ lớn**, chỉ còn lại góc. Kết quả nằm trong [−1, 1] với dữ liệu bất kỳ, và trong [0, 1] khi mọi đặc trưng đều không âm (trường hợp phổ biến với dữ liệu đếm).\n\n- cos = 1: cùng hướng hoàn toàn (cùng mẫu hình, khác cường độ).\n- cos = 0: vuông góc, không chia sẻ đặc trưng nào.\n- **Khoảng cách cosine** = 1 − cos, để càng lớn càng khác nhau.',
        },
        {
          t: 'compare',
          title: 'Chọn thước đo tương tự',
          left: {
            title: '📐 Khoảng cách cosine',
            items: [
              'Bỏ qua độ lớn, chỉ so mẫu hình',
              'Chuẩn cho TF-IDF, bag-of-words, n-gram của dòng lệnh và URL',
              'Chuẩn cho embedding văn bản và truy vấn vector trong RAG',
              'Dùng khi: tìm dòng lệnh gần trùng, gom cảnh báo giống nhau, so hai mẫu mã độc',
              'Bẫy: hai vector rất thưa có thể cosine cao chỉ vì trùng một token hiếm',
            ],
          },
          right: {
            title: '📏 Khoảng cách Euclid',
            items: [
              'Nhạy với độ lớn tuyệt đối',
              'Chuẩn cho đặc trưng số đã chuẩn hoá: byte, thời lượng, số lần thử',
              'Là thước đo mặc định của k-means, k-NN, DBSCAN',
              'Dùng khi: cường độ chính là tín hiệu (10 GB khác hẳn 10 MB)',
              'Bẫy: bắt buộc phải chuẩn hoá trước, nếu không một cột đơn vị byte nuốt hết',
            ],
          },
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'So sánh hai dòng lệnh PowerShell bằng cosine trên n-gram ký tự',
          code: `import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

lenh = [
    'powershell -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0A',
    'powershell.exe -NoProfile -WindowStyle Hidden -EncodedCommand SQBFAFgA',
    'powershell -Command Get-ChildItem C:\\\\Users -Recurse',
]

# n-gram ky tu 3-5 chong duoc viec ke tan cong doi hoa thuong va chen ky tu
vec = TfidfVectorizer(analyzer='char_wb', ngram_range=(3, 5), lowercase=True)
X = vec.fit_transform(lenh)

S = cosine_similarity(X)
print(np.round(S, 2))
# Dong 0 va 1 rat giong nhau (cung ky thuat encoded command)
# Dong 2 tach han ra du cung bat dau bang powershell`,
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't1l6-cp1',
              kind: 'mcq',
              tags: ['dai-so-tuyen-tinh', 'cosine'],
              q: 'Bạn gom 300.000 dòng lệnh thành cụm để analyst xem. Một dòng lệnh xuất hiện 1 lần và một dòng gần y hệt xuất hiện 200 lần. Nên dùng thước đo nào và vì sao?',
              options: [
                'Euclid, vì số lần xuất hiện là thông tin quan trọng',
                'Cosine, vì mục tiêu là gom theo mẫu hình chứ không theo tần suất',
                'Khoảng cách Manhattan, vì nó bền với ngoại lai hơn',
                'Không dùng khoảng cách, chỉ so khớp chuỗi chính xác',
              ],
              answer: 1,
              why: 'Mục tiêu là **giảm khối lượng đọc** cho analyst: hai dòng lệnh cùng kỹ thuật nên nằm cùng cụm bất kể chạy 1 lần hay 200 lần. Cosine bỏ qua độ lớn nên làm đúng việc đó. Tần suất vẫn giữ được — nhưng để **xếp hạng cụm** sau khi đã gom, không phải để quyết định gom hay không. So khớp chuỗi chính xác thất bại ngay khi kẻ tấn công đổi thứ tự tham số hoặc đổi hoa thường, đó là lý do dùng n-gram ký tự.',
              distractorWhy: [
                'Số lần xuất hiện là thông tin để xếp hạng cụm, không phải để định nghĩa cụm.',
                '',
                'Manhattan vẫn nhạy với độ lớn giống Euclid, chỉ khác cách cộng.',
                'So khớp chính xác vỡ ngay với biến thể nhỏ nhất — mà biến thể nhỏ chính là điều kẻ tấn công làm.',
              ],
            },
          ],
        },
        {
          t: 'h',
          text: 'Lời nguyền số chiều',
          level: 2,
        },
        {
          t: 'p',
          md: 'Bạn one-hot cột User-Agent và bỗng có 5.000 cột. Nghe như càng nhiều thông tin càng tốt. Thực tế thì có một hiện tượng phản trực giác đang chờ.',
        },
        {
          t: 'figure',
          id: 'fig-dimensionality',
          caption:
            'Khi số chiều tăng, khoảng cách từ một điểm tới điểm gần nhất và tới điểm xa nhất tiến lại gần nhau. Khái niệm "hàng xóm gần" mất dần ý nghĩa — và mọi thuật toán dựa trên khoảng cách mất theo.',
        },
        {
          t: 'list',
          items: [
            '**Khoảng cách hội tụ.** Với dữ liệu ngẫu nhiên trong không gian nhiều chiều, tỉ số (khoảng cách xa nhất − khoảng cách gần nhất) / khoảng cách gần nhất tiến về 0 khi số chiều tăng. Nói cách khác: **mọi điểm đều cách nhau xấp xỉ như nhau**. k-NN, k-means và phát hiện bất thường dựa khoảng cách đều mất tác dụng.',
            '**Không gian rỗng tuếch.** Để phủ đều một không gian với mật độ nhất định, số mẫu cần tăng theo hàm mũ của số chiều. Trong 100 chiều, kể cả 10 triệu mẫu vẫn là một đám bụi thưa thớt — mô hình luôn phải ngoại suy chứ không nội suy.',
            '**Thưa thớt cực đoan.** Vector one-hot của User-Agent có 5.000 cột thì 4.999 cột bằng 0. Phần lớn "chiều" không mang thông tin cho mẫu cụ thể đó, nhưng vẫn tham gia vào mọi phép tính khoảng cách và làm loãng tín hiệu thật.',
            '**Quá khớp dễ dàng.** Với đủ nhiều chiều, luôn tồn tại một siêu phẳng chia hoàn hảo dữ liệu huấn luyện — kể cả khi nhãn được gán ngẫu nhiên. Kết quả huấn luyện đẹp không còn là bằng chứng của gì cả.',
          ],
        },
        {
          t: 'checklist',
          title: 'Bốn cách xử lý khi số chiều phình to',
          items: [
            'Chọn đặc trưng: bỏ cột gần như hằng số, cột trùng lặp, cột có tương quan trên 0,95 với cột khác',
            'Giảm chiều: PCA cho dữ liệu dày, TruncatedSVD cho ma trận thưa TF-IDF, UMAP khi chỉ cần trực quan hoá',
            'Đổi thước đo: dùng cosine thay Euclid trên dữ liệu thưa — cosine chịu được số chiều cao tốt hơn nhiều',
            'Đổi họ mô hình: cây tăng cường chỉ chọn một cột mỗi lần chia nên gần như miễn nhiễm; đó là lý do nó thắng trên dữ liệu bảng nhiều cột',
          ],
        },
        {
          t: 'lab',
          id: 'lab-tfidf',
          intro:
            'Biến dòng log thành vector TF-IDF, xem ma trận thưa cỡ nào, rồi thử cosine và Euclid trên cùng cặp dòng. Chỉnh số chiều và xem khoảng cách bắt đầu hội tụ ở đâu.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bẫy: thêm đặc trưng luôn tốt',
          md: 'Trực giác nói càng nhiều thông tin càng tốt. Thực tế: mỗi đặc trưng vô dụng thêm vào sẽ **thêm nhiễu vào mọi phép tính khoảng cách** và **thêm một cơ hội quá khớp**. Với mô hình khoảng cách, 20 đặc trưng tốt gần như luôn thắng 500 đặc trưng lẫn lộn. Quy tắc thực chiến: mỗi đặc trưng phải trả lời được câu hỏi *"nó phân biệt được gì mà các đặc trưng khác không phân biệt được?"* — nếu không trả lời được, bỏ đi.',
        },
        {
          t: 'terms',
          ids: ['vector', 'tich-vo-huong', 'chuan-l2', 'cosine', 'loi-nguyen-so-chieu'],
        },
      ],
      keyTakeaways: [
        'Tích vô hướng a·b nhân từng cặp thành phần rồi cộng lại, cho ra một số — đó là phép tính lõi của mô hình tuyến tính, nơ-ron và attention.',
        'Chuẩn L2 là độ dài mũi tên (Pythagoras n chiều); khoảng cách Euclid là chuẩn L2 của hiệu hai vector.',
        'Cosine bỏ qua độ lớn và chỉ so hướng — chuẩn cho TF-IDF, dòng lệnh, URL, embedding.',
        'Euclid nhạy với độ lớn — dùng cho đặc trưng số đã chuẩn hoá, khi cường độ chính là tín hiệu.',
        'Lời nguyền số chiều: khi số chiều tăng, mọi điểm cách nhau gần như bằng nhau và thuật toán khoảng cách mất tác dụng.',
        'Bốn cách xử lý: chọn đặc trưng, giảm chiều, đổi sang cosine, hoặc đổi sang mô hình cây.',
      ],
      cards: [
        {
          id: 't1l6-c1',
          front: 'Tích vô hướng của hai vector được tính thế nào và kết quả là gì?',
          back: 'Nhân từng cặp thành phần cùng vị trí rồi cộng tất cả lại: a·b = a1b1 + a2b2 + ... Kết quả là một số duy nhất, không phải vector.',
          tags: ['dai-so-tuyen-tinh'],
        },
        {
          id: 't1l6-c2',
          front: 'Vì sao tích vô hướng là phép toán quan trọng nhất trong học máy?',
          back: 'Vì hồi quy logistic (z = w·x + b), mỗi nơ-ron, mỗi lớp mạng và cơ chế attention đều là tích vô hướng. w mô tả hình dạng của điều đáng ngờ, tích vô hướng đo mức khớp.',
          tags: ['dai-so-tuyen-tinh'],
        },
        {
          id: 't1l6-c3',
          front: 'Khi nào dùng cosine, khi nào dùng Euclid?',
          back: 'Cosine khi chỉ quan tâm mẫu hình chứ không quan tâm cường độ (TF-IDF, dòng lệnh, embedding). Euclid khi cường độ tuyệt đối chính là tín hiệu (byte truyền, số lần thử) và đã chuẩn hoá.',
          tags: ['cosine', 'dai-so-tuyen-tinh'],
        },
        {
          id: 't1l6-c4',
          front: 'Lời nguyền số chiều gây hậu quả gì cho thuật toán dựa trên khoảng cách?',
          back: 'Khi số chiều tăng, khoảng cách tới điểm gần nhất và xa nhất hội tụ về nhau, nên khái niệm "hàng xóm gần" mất ý nghĩa — k-NN, k-means và phát hiện bất thường theo khoảng cách đều suy giảm.',
          tags: ['loi-nguyen-so-chieu'],
        },
        {
          id: 't1l6-c5',
          front: 'Vì sao cây tăng cường ít bị lời nguyền số chiều hơn k-NN?',
          back: 'Vì cây chỉ xét một cột tại mỗi lần chia, không cộng gộp toàn bộ chiều vào một phép khoảng cách — nên các cột vô dụng đơn giản là không được chọn.',
          tags: ['loi-nguyen-so-chieu'],
        },
      ],
      quiz: [
        {
          id: 't1l6-q1',
          kind: 'input',
          tags: ['dai-so-tuyen-tinh'],
          q: 'Cho w = [2, −1, 3] và x = [1, 4, 2]. Tích vô hướng w·x bằng bao nhiêu?',
          accept: ['4', '4.0', '4,0'],
          placeholder: 'Điền một con số',
          hint: 'Nhân từng cặp rồi cộng: 2×1, (−1)×4, 3×2.',
          why: 'w·x = 2×1 + (−1)×4 + 3×2 = 2 − 4 + 6 = **4**. Nếu đây là hồi quy logistic với hệ số chệch b = −1 thì z = 3 và xác suất sigmoid ≈ 0,95. Chú ý thành phần thứ hai: trọng số âm nhân với giá trị đặc trưng lớn kéo điểm xuống mạnh — đó là cách một đặc trưng "bảo vệ" hoạt động trong mô hình tuyến tính.',
        },
        {
          id: 't1l6-q2',
          kind: 'mcq',
          tags: ['cosine'],
          q: 'Vector A = [3, 0, 4] và vector B = [30, 0, 40]. Cosine similarity giữa chúng bằng bao nhiêu?',
          options: ['0,1', '0,5', '1,0', '50,0'],
          answer: 2,
          why: 'B chính là A nhân 10, nên hai mũi tên chỉ **cùng một hướng** và cosine bằng **1,0**. Kiểm tra: A·B = 90 + 0 + 160 = 250; ||A|| = 5; ||B|| = 50; 250/(5×50) = 1,0. Trong khi đó khoảng cách Euclid giữa chúng là căn của (27² + 36²) = 45 — rất xa nhau. Cùng một cặp vector, hai thước đo cho hai câu trả lời trái ngược, và cả hai đều đúng với câu hỏi tương ứng.',
          distractorWhy: [
            'Đây là nhầm với tỉ số độ dài chứ không phải góc.',
            'Cosine 0,5 ứng với góc 60 độ, không phải hai vector cùng hướng.',
            '',
            'Cosine luôn nằm trong khoảng từ −1 tới 1; 50 là giá trị của khoảng cách Euclid.',
          ],
        },
        {
          id: 't1l6-q3',
          kind: 'multi',
          tags: ['loi-nguyen-so-chieu'],
          q: 'Bạn có 8.000 cột sau khi one-hot và mô hình k-NN không phân biệt được gì. Cách xử lý nào hợp lý? (Chọn tất cả)',
          options: [
            'Dùng TruncatedSVD giảm về 100 chiều rồi mới tính khoảng cách',
            'Chuyển từ khoảng cách Euclid sang cosine',
            'Thu thập thêm 10 lần dữ liệu nhưng giữ nguyên 8.000 cột',
            'Chuyển sang LightGBM thay vì k-NN',
          ],
          answers: [0, 1, 3],
          why: 'Ba cách đúng đều tấn công đúng nguyên nhân. Giảm chiều đưa dữ liệu về không gian mà khoảng cách còn ý nghĩa. Cosine chịu đựng số chiều cao và dữ liệu thưa tốt hơn Euclid rõ rệt. Cây tăng cường chọn từng cột một nên không bị hiệu ứng gộp chiều. Còn thêm dữ liệu thì gần như vô ích: số mẫu cần để phủ không gian tăng theo **hàm mũ** của số chiều, nên nhân 10 lần dữ liệu trong 8.000 chiều không thay đổi gì đáng kể.',
        },
        {
          id: 't1l6-q4',
          kind: 'truefalse',
          tags: ['dai-so-tuyen-tinh'],
          q: 'Thêm càng nhiều đặc trưng vào mô hình thì kết quả càng tốt, vì mô hình có nhiều thông tin hơn để học.',
          answer: false,
          why: 'Mỗi đặc trưng vô dụng vừa thêm nhiễu vào mọi phép tính khoảng cách, vừa thêm một cơ hội để mô hình quá khớp vào ngẫu nhiên. Với đủ nhiều chiều, luôn tồn tại một mặt phẳng chia hoàn hảo dữ liệu huấn luyện kể cả khi nhãn hoàn toàn ngẫu nhiên. Trong bảo mật còn thêm một lý do: mỗi đặc trưng là một bề mặt để kẻ tấn công thao túng. Hai mươi đặc trưng đắt tiền để né thường thắng năm trăm đặc trưng lẫn lộn.',
        },
        {
          id: 't1l6-q5',
          kind: 'match',
          tags: ['cosine', 'dai-so-tuyen-tinh'],
          q: 'Nối mỗi bài toán với thước đo phù hợp hơn.',
          pairs: [
            ['Gom dòng lệnh PowerShell gần trùng nhau', 'Khoảng cách cosine trên TF-IDF n-gram'],
            ['So sánh lượng byte tải xuống giữa các người dùng', 'Khoảng cách Euclid sau khi chuẩn hoá'],
            ['Truy vấn tài liệu gần nghĩa trong hệ thống RAG', 'Cosine trên vector embedding'],
            ['Phân cụm luồng NetFlow theo cường độ lưu lượng', 'Euclid trên đặc trưng số đã lấy log'],
          ],
          why: 'Nguyên tắc chọn chỉ có một câu: **cường độ có phải là tín hiệu không?** Với văn bản và dòng lệnh, một lệnh chạy 200 lần vẫn là cùng một lệnh nên bỏ cường độ đi bằng cosine. Với lưu lượng mạng, 10 GB thực sự khác 10 MB nên giữ cường độ bằng Euclid — nhưng nhớ lấy log trước vì phân phối lệch phải mạnh, đúng như bài t1-l4 đã chỉ ra.',
        },
      ],
      terms: ['vector', 'tich-vo-huong', 'chuan-l2', 'cosine', 'loi-nguyen-so-chieu'],
      further: [
        {
          title: 'Essence of Linear Algebra — 3Blue1Brown',
          note: 'Loạt video hình ảnh hoá vector, tích vô hướng và phép biến đổi tuyến tính. Xem tập 1 tới 4 là đủ cho toàn bộ khoá này.',
          url: 'https://www.3blue1brown.com/topics/linear-algebra',
        },
        {
          title: 'scikit-learn — Pairwise metrics, Affinities and Kernels',
          note: 'Bảng tra các thước đo khoảng cách có sẵn và ghi chú về hành vi của chúng trên dữ liệu thưa.',
          url: 'https://scikit-learn.org/stable/modules/metrics.html',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't1-l7',
      trackId: 'nen-mong',
      title: 'Đạo hàm và hạ gradient bằng trực giác',
      subtitle: 'Cách mọi mô hình học được — và cách kẻ tấn công dùng ngược đúng phép toán đó',
      minutes: 22,
      practiceMinutes: 7,
      level: 'trung-cap',
      prereqs: ['t1-l6'],
      why: {
        short:
          'Hạ gradient là động cơ duy nhất đứng sau việc huấn luyện hồi quy logistic, mạng nơ-ron và mô hình ngôn ngữ — và cũng chính là công cụ sinh mẫu đối kháng để đánh lừa chúng.',
        scenario:
          'Mô hình phát hiện phishing của bạn huấn luyện xong với loss không giảm, đứng yên ở 0,693 suốt 500 vòng. Đồng nghiệp bảo "chỉnh learning rate đi". Bạn cần hiểu điều đó nghĩa là gì để biết chỉnh lên hay chỉnh xuống, và vì sao 0,693 lại là con số đáng ngờ.',
        roles: ['ML Engineer', 'Security Data Scientist', 'AI Security Engineer', 'Red Teamer'],
        costOfNotKnowing:
          'Bạn coi việc huấn luyện là hộp đen, chỉnh tham số theo cảm tính, và không hiểu nổi vì sao mẫu đối kháng tồn tại — nghĩa là không thể phòng thủ trước chúng ở chặng 8.',
      },
      objectives: [
        'Giải thích được hàm mất mát là gì và vì sao log loss phạt nặng dự đoán tự tin mà sai',
        'Mô tả được một bước cập nhật hạ gradient bằng lời và bằng công thức',
        'Dự đoán được hành vi huấn luyện khi tốc độ học quá lớn hoặc quá nhỏ',
        'Giải thích được vì sao cùng phép tính gradient lại sinh ra mẫu đối kháng',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bạn đang đứng trên một sườn đồi trong sương mù dày, không nhìn thấy gì quá một mét, và cần xuống chân đồi. Bạn chỉ cảm nhận được độ dốc dưới chân. Chiến lược nào hợp lý — và chiến lược đó thất bại trong địa hình nào?',
          reveal:
            'Chiến lược hợp lý: cảm nhận hướng dốc xuống mạnh nhất, bước một bước theo hướng đó, lặp lại. Đó **chính xác** là hạ gradient (gradient descent). Nó thất bại ở ba loại địa hình: **(1)** một cái hố nhỏ giữa sườn đồi — bạn dừng lại ở đó và tưởng đã tới chân (cực tiểu địa phương); **(2)** một cao nguyên phẳng lì — không cảm nhận được dốc nào nên không biết đi đâu (gradient tiêu biến); **(3)** một khe hẹp dốc đứng — bước quá dài thì bạn nhảy qua khe sang sườn bên kia rồi lại nhảy về, mỗi lần một xa hơn (tốc độ học quá lớn, phân kỳ).',
        },
        {
          t: 'h',
          text: 'Hàm mất mát: cách máy biết mình đang sai bao nhiêu',
          level: 2,
        },
        {
          t: 'p',
          md: 'Huấn luyện là bài toán tối ưu: tìm bộ trọng số **w** làm một con số gọi là **mất mát** (loss) nhỏ nhất. Mất mát đo mức độ lệch giữa dự đoán và sự thật trên toàn bộ dữ liệu huấn luyện. Không có mất mát thì không có khái niệm "học".',
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Log loss — hàm mất mát của mọi bài toán phân loại nhị phân',
          md: 'L = − [ y × log(p) + (1 − y) × log(1 − p) ]\n\n- **y** — nhãn thật, bằng 1 nếu độc hại, 0 nếu lành tính.\n- **p** — xác suất mô hình gán cho lớp độc hại.\n\nĐọc thành lời: nếu nhãn thật là 1, chỉ vế đầu tồn tại và L = −log(p). Mô hình nói p = 0,9 thì L = 0,105; nói p = 0,5 thì L = 0,693; nói p = 0,01 thì L = **4,6**.\n\nĐiểm quan trọng: hình phạt tăng **rất nhanh** khi mô hình vừa tự tin vừa sai. Đoán p = 0,001 cho một mẫu độc hại bị phạt 6,9 — gấp **10 lần** so với đoán bừa 0,5 (0,693), và gấp **66 lần** so với một dự đoán tự tin mà ĐÚNG (p = 0,9, phạt 0,105). Đây chính là cơ chế buộc mô hình phải **hiệu chuẩn** xác suất của nó, chứ không chỉ xếp đúng thứ tự.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Con số 0,693 và vì sao nó đáng ngờ',
          md: 'log(2) ≈ **0,693**. Đó là log loss của một mô hình đoán p = 0,5 cho mọi mẫu, tức là **không học được gì cả**. Nếu loss của bạn đứng yên quanh 0,693 suốt quá trình huấn luyện, mô hình đang trả lời "tôi không biết" cho mọi thứ. Nguyên nhân thường gặp: tốc độ học quá nhỏ, quên chuẩn hoá đặc trưng, đặc trưng không mang tín hiệu, hoặc nhãn bị xáo trộn. Nhớ con số này — nó là bài kiểm tra ba giây cho mọi lần huấn luyện phân loại nhị phân.',
        },
        {
          t: 'h',
          text: 'Đạo hàm: chỉ là độ dốc',
          level: 2,
        },
        {
          t: 'p',
          md: 'Đạo hàm của một hàm tại một điểm trả lời đúng một câu: **nếu tôi tăng đầu vào lên một chút, đầu ra thay đổi bao nhiêu và theo hướng nào?** Đạo hàm dương nghĩa là đi lên; âm nghĩa là đi xuống; bằng 0 nghĩa là đang ở chỗ phẳng.',
        },
        {
          t: 'p',
          md: '**Gradient** là phiên bản nhiều biến: một vector chứa đạo hàm riêng theo từng trọng số. Nó chỉ đúng hướng dốc **lên** mạnh nhất — nên muốn đi xuống, ta bước theo hướng **ngược lại**. Đó là toàn bộ ý nghĩa của dấu trừ trong công thức cập nhật.',
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Quy tắc cập nhật, đọc từng ký hiệu',
          md: 'w_mới = w_cũ − η × ∇L(w_cũ)\n\n- **w** — vector trọng số của mô hình.\n- **∇L(w)** — gradient của hàm mất mát tại w. Ký hiệu tam giác ngược đọc là "nabla" hoặc "gradient của".\n- **η** — chữ Hy Lạp *eta*, **tốc độ học** (learning rate). Độ dài mỗi bước. Thường trong khoảng 0,001 tới 0,3.\n- **Dấu trừ** — vì gradient chỉ lên dốc còn ta muốn xuống dốc.\n\nLặp lại phép này vài nghìn lần là xong việc huấn luyện. Không có gì bí ẩn hơn thế.',
        },
        {
          t: 'steps',
          title: 'Chạy tay hạ gradient trên hàm L(w) = (w − 3)², bắt đầu từ w = 0',
          steps: [
            {
              title: 'Bước 0 — Đạo hàm',
              md: 'L(w) = (w − 3)² nên đạo hàm của nó là 2(w − 3). Cực tiểu rõ ràng nằm ở w = 3, nơi đạo hàm bằng 0. Ta giả vờ chưa biết điều đó và để thuật toán tự tìm.',
            },
            {
              title: 'Với η = 0,1 — hội tụ đẹp',
              md: 'w = 0: gradient = 2(0−3) = −6 → w = 0 − 0,1×(−6) = **0,6**.\nw = 0,6: gradient = −4,8 → w = **1,08**.\nw = 1,08: gradient = −3,84 → w = **1,464**.\nTiếp tục: 1,771 → 2,017 → 2,214 → ... tiến dần tới 3, mỗi bước thu hẹp khoảng cách 20%. Chú ý: gradient nhỏ dần khi tới gần đáy, nên bước cũng tự động ngắn lại. Thuật toán tự phanh.',
            },
            {
              title: 'Với η = 1,1 — phân kỳ',
              md: 'w = 0: gradient = −6 → w = 0 − 1,1×(−6) = **6,6** (nhảy vọt qua bên kia).\nw = 6,6: gradient = 7,2 → w = 6,6 − 7,92 = **−1,32**.\nw = −1,32: gradient = −8,64 → w = **8,184**.\nMỗi lần nhảy càng xa hơn. Loss tăng lên vô hạn và bạn thấy `nan` trong log huấn luyện. **Loss ra nan gần như luôn có nghĩa là tốc độ học quá lớn.**',
            },
            {
              title: 'Với η = 0,001 — đúng hướng nhưng vô vọng',
              md: 'w = 0 → 0,006 → 0,012 → ... Sau 500 vòng vẫn chưa tới 3. Mô hình không sai, chỉ là bạn sẽ nghỉ hưu trước khi nó hội tụ. Trong thực tế, dấu hiệu là loss giảm nhưng giảm gần như tuyến tính và rất chậm.',
            },
          ],
        },
        {
          t: 'figure',
          id: 'fig-gradient-descent',
          caption:
            'Cùng một mặt lỗi, ba tốc độ học. Bước vừa phải trượt mượt xuống đáy; bước quá lớn nảy qua nảy lại rồi văng ra; bước quá nhỏ bò mãi không tới. Không có giá trị đúng phổ quát — chỉ có giá trị đúng cho bài toán của bạn.',
        },
        {
          t: 'lab',
          id: 'lab-gradient',
          intro:
            'Kéo thanh tốc độ học và xem quả bóng lăn trên mặt lỗi. Thử tìm giá trị lớn nhất còn hội tụ được, rồi tăng thêm một chút để thấy khoảnh khắc nó văng ra. Sau đó bật mặt lỗi có nhiều hố và xem điểm khởi tạo quyết định kết quả thế nào.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't1l7-cp1',
              kind: 'mcq',
              tags: ['gradient', 'huan-luyen'],
              q: 'Log huấn luyện: loss giảm từ 0,69 xuống 0,52 trong 3 vòng đầu, rồi nhảy lên 2,4, rồi thành nan. Nguyên nhân khả dĩ nhất?',
              options: [
                'Tốc độ học quá nhỏ',
                'Tốc độ học quá lớn nên các bước cập nhật phân kỳ',
                'Dữ liệu huấn luyện quá ít',
                'Mô hình đã hội tụ và nên dừng lại',
              ],
              answer: 1,
              why: 'Mẫu hình "giảm được vài bước rồi nổ tung" là chữ ký của tốc độ học quá lớn: ở vùng dốc thoải ban đầu bước còn vừa, nhưng khi gặp vùng dốc đứng thì bước nhảy vọt qua đáy sang sườn đối diện ở vị trí cao hơn, và vòng lặp khuếch đại. Cách xử lý theo thứ tự: chia η cho 10; kiểm tra đã chuẩn hoá đặc trưng chưa (đặc trưng thang lớn tạo gradient khổng lồ); bật gradient clipping.',
              distractorWhy: [
                'Tốc độ học quá nhỏ cho loss giảm chậm và đều, không bao giờ tạo ra nan.',
                '',
                'Thiếu dữ liệu gây quá khớp, biểu hiện là loss huấn luyện giảm mà loss kiểm định tăng — không phải nan.',
                'Hội tụ nghĩa là loss ổn định ở giá trị thấp, không phải nhảy vọt lên.',
              ],
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Toàn bộ hồi quy logistic viết tay bằng numpy — 18 dòng, không có gì bị giấu',
          code: `import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))

def huan_luyen(X, y, eta=0.1, so_vong=1000):
    """X: (n mau, d dac trung) da chuan hoa. y: mang 0/1."""
    n, d = X.shape
    w = np.zeros(d)
    b = 0.0
    for vong in range(so_vong):
        p = sigmoid(X @ w + b)              # du doan hien tai
        loi = p - y                         # dao ham log loss theo z, dep den bat ngo
        grad_w = X.T @ loi / n              # gradient theo tung trong so
        grad_b = loi.mean()
        w -= eta * grad_w                   # buoc NGUOC huong do doc
        b -= eta * grad_b
        if vong % 200 == 0:
            loss = -np.mean(y * np.log(p + 1e-12) + (1 - y) * np.log(1 - p + 1e-12))
            print(vong, round(loss, 4))     # phai giam deu; dung yen o 0.693 la co van de
    return w, b`,
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Vì sao đạo hàm log loss lại đúng bằng (p − y)',
          md: 'Đây là một trong những kết quả gọn gàng nhất của ML: khi ghép log loss với hàm sigmoid, đạo hàm của mất mát theo z rút gọn thành đúng **p − y**, tức là **sai số dự đoán**. Nghĩa là quy tắc cập nhật đọc thành lời rất tự nhiên: *dự đoán cao hơn thực tế thì kéo trọng số xuống, thấp hơn thì đẩy lên, kéo mạnh theo mức sai*. Bạn không cần chứng minh được điều này, nhưng biết nó giúp đoạn mã trên hết bí ẩn.',
        },
        {
          t: 'h',
          text: 'Ba biến thể bạn sẽ gặp trong tài liệu',
          level: 2,
        },
        {
          t: 'table',
          caption: 'Cách chia dữ liệu cho mỗi bước cập nhật',
          head: ['Tên', 'Mỗi bước dùng bao nhiêu dữ liệu', 'Ưu', 'Nhược'],
          rows: [
            ['Batch (toàn phần)', 'Toàn bộ tập huấn luyện', 'Hướng đi chính xác, mượt', 'Không chạy nổi với 50 triệu dòng log'],
            ['SGD (ngẫu nhiên)', 'Một mẫu', 'Rất nhanh mỗi bước, thoát hố nhỏ dễ', 'Đường đi nhiễu, khó hội tụ chính xác'],
            ['Mini-batch', 'Thường 32 tới 1.024 mẫu', 'Cân bằng tốt, tận dụng GPU, là mặc định thực tế', 'Thêm một siêu tham số phải chọn'],
            ['Adam', 'Mini-batch, tốc độ học tự điều chỉnh theo từng trọng số', 'Ít phải tinh chỉnh, hội tụ nhanh', 'Đôi khi tổng quát hoá kém hơn SGD có momentum'],
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Cực tiểu địa phương bị thổi phồng — vấn đề thật là chỗ khác',
          md: 'Sách phổ thông hay doạ về cực tiểu địa phương, nhưng thực tế phân hoá rõ:\n\n**Hồi quy logistic và SVM tuyến tính** có hàm mất mát **lồi** (convex) — chỉ có đúng một cực tiểu, hạ gradient luôn tìm được nó. Không có gì phải lo.\n\n**Mạng nơ-ron sâu** thì không lồi, nhưng nghiên cứu cho thấy trong không gian rất nhiều chiều, thứ hay gặp là **điểm yên ngựa** (saddle point) — chỗ dốc lên theo hướng này và dốc xuống theo hướng khác — chứ không phải hố cụt. Và phần lớn các cực tiểu tìm được cho chất lượng gần tương đương nhau.\n\nBa vấn đề thực sự làm hỏng việc huấn luyện của bạn, theo thứ tự tần suất: **quên chuẩn hoá đặc trưng**, **tốc độ học sai**, và **rò rỉ dữ liệu khiến kết quả đẹp giả tạo**.',
        },
        {
          t: 'h',
          text: 'Cùng phép toán, dùng ngược lại: mẫu đối kháng',
          level: 2,
        },
        {
          t: 'p',
          md: 'Đây là chỗ bài toán trở nên thú vị với người làm bảo mật. Khi huấn luyện, ta cố định dữ liệu và tính gradient theo **trọng số** để giảm mất mát. Kẻ tấn công làm điều ngược lại: cố định trọng số của mô hình và tính gradient theo **đầu vào**, rồi đi theo hướng **tăng** mất mát.',
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'FGSM: một dòng công thức, một ngành nghiên cứu',
          md: 'Goodfellow, Shlens và Szegedy (2014) mô tả **Fast Gradient Sign Method**: x_đối_kháng = x + ε × dấu(∇x L). Dịch ra: nhìn gradient của mất mát theo từng thành phần đầu vào, đẩy mỗi thành phần một lượng cực nhỏ ε đúng theo hướng làm mô hình sai nhiều nhất. Kết quả là một mẫu mà con người thấy không khác gì bản gốc nhưng mô hình phân loại sai với độ tự tin cao.\n\nTrong bảo mật, phiên bản của việc này là: thêm vài byte vô hại vào phần thừa của tệp PE, chèn khoảng trắng vào email, đệm gói tin để đổi phân phối độ dài. **Điều kiện cần là kẻ tấn công phải tính được hoặc ước lượng được gradient** — nên mô hình đặt sau API, có giới hạn tần suất truy vấn và không trả về điểm số thô sẽ khó tấn công hơn nhiều. Chặng 8 sẽ mổ xẻ toàn bộ chuyện này.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't1l7-cp2',
              kind: 'truefalse',
              tags: ['gradient', 'adversarial'],
              q: 'Việc sinh mẫu đối kháng bằng gradient đòi hỏi kẻ tấn công phải huấn luyện lại mô hình của bạn.',
              answer: false,
              why: 'Không cần huấn luyện lại gì cả. Kẻ tấn công **giữ nguyên** trọng số và chỉ tính gradient theo đầu vào — một phép tính rẻ hơn huấn luyện hàng nghìn lần. Tệ hơn, mẫu đối kháng có tính **chuyển giao** (transferability): mẫu sinh ra trên một mô hình thay thế do kẻ tấn công tự huấn luyện thường vẫn đánh lừa được mô hình thật, nên kể cả khi họ không có trọng số của bạn, tấn công hộp đen vẫn khả thi.',
            },
          ],
        },
        {
          t: 'checklist',
          title: 'Chẩn đoán nhanh khi huấn luyện không ổn',
          items: [
            'Loss ra nan hoặc inf → tốc độ học quá lớn, hoặc quên chuẩn hoá, hoặc log(0) không có epsilon',
            'Loss đứng yên ở khoảng 0,693 → mô hình đoán 0,5 cho mọi thứ: kiểm tra chuẩn hoá, tốc độ học, và xem đặc trưng có tín hiệu không',
            'Loss giảm cực chậm và tuyến tính → tăng tốc độ học lên 10 lần và thử lại',
            'Loss huấn luyện giảm nhưng loss kiểm định tăng → quá khớp, không phải vấn đề của gradient',
            'Loss huấn luyện gần bằng 0 ngay vòng đầu → gần như chắc chắn là rò rỉ dữ liệu, hãy đi tìm cột lộ đáp án',
          ],
        },
        {
          t: 'terms',
          ids: ['ham-mat-mat', 'log-loss', 'gradient', 'toc-do-hoc', 'mau-doi-khang'],
        },
      ],
      keyTakeaways: [
        'Huấn luyện = tìm bộ trọng số làm hàm mất mát nhỏ nhất; hạ gradient là cách tìm đó.',
        'Log loss phạt nặng dự đoán vừa tự tin vừa sai, nên nó ép mô hình hiệu chuẩn xác suất chứ không chỉ xếp thứ tự.',
        'Loss đứng yên ở 0,693 = log(2) nghĩa là mô hình đoán 0,5 cho mọi mẫu, tức chưa học được gì.',
        'Quy tắc cập nhật: w_mới = w_cũ − η × gradient. Dấu trừ vì gradient chỉ lên dốc.',
        'Tốc độ học quá lớn gây phân kỳ và nan; quá nhỏ thì hội tụ chậm tới mức vô dụng.',
        'Hồi quy logistic có mất mát lồi nên không có cực tiểu địa phương; với mạng sâu, vấn đề thật thường là chuẩn hoá và tốc độ học chứ không phải hố cụt.',
        'Đảo chiều gradient sang đầu vào thay vì trọng số thì sinh ra mẫu đối kháng — cùng một phép toán, hai mục đích trái ngược.',
      ],
      cards: [
        {
          id: 't1l7-c1',
          front: 'Viết quy tắc cập nhật của hạ gradient và giải thích dấu trừ.',
          back: 'w_mới = w_cũ − η × ∇L(w). Dấu trừ vì gradient chỉ hướng dốc LÊN mạnh nhất, mà ta muốn giảm mất mát nên phải đi ngược lại. η là tốc độ học, tức độ dài bước.',
          tags: ['gradient'],
        },
        {
          id: 't1l7-c2',
          front: 'Loss của bạn đứng yên ở 0,693 suốt quá trình huấn luyện. Điều đó nghĩa là gì?',
          back: '0,693 = log(2), tức mô hình đang gán xác suất 0,5 cho mọi mẫu — chưa học được gì. Kiểm tra chuẩn hoá đặc trưng, tốc độ học, và liệu đặc trưng có mang tín hiệu không.',
          tags: ['log-loss', 'huan-luyen'],
        },
        {
          id: 't1l7-c3',
          front: 'Hai triệu chứng phân biệt tốc độ học quá lớn và quá nhỏ là gì?',
          back: 'Quá lớn: loss nhảy vọt lên rồi thành nan. Quá nhỏ: loss giảm rất chậm và gần như tuyến tính, không bao giờ chạm đáy trong số vòng cho phép.',
          tags: ['toc-do-hoc'],
        },
        {
          id: 't1l7-c4',
          front: 'Vì sao log loss phạt nặng dự đoán tự tin mà sai?',
          back: 'Vì L = −log(p) tăng vô hạn khi p tiến về 0. Đoán p = 0,001 cho mẫu độc hại bị phạt 6,9, gấp 10 lần so với đoán bừa 0,5. Điều này ép mô hình hiệu chuẩn xác suất.',
          tags: ['log-loss'],
        },
        {
          id: 't1l7-c5',
          front: 'Mẫu đối kháng được sinh ra bằng cách nào, xét theo gradient?',
          back: 'Cố định trọng số mô hình, tính gradient của mất mát theo ĐẦU VÀO, rồi sửa đầu vào một lượng nhỏ theo hướng LÀM TĂNG mất mát. Ngược chiều hoàn toàn với huấn luyện.',
          tags: ['gradient', 'adversarial'],
        },
      ],
      quiz: [
        {
          id: 't1l7-q1',
          kind: 'mcq',
          tags: ['gradient', 'toc-do-hoc'],
          q: 'Với L(w) = (w − 3)², bắt đầu từ w = 0 và η = 1,1, giá trị w sau bước đầu tiên là bao nhiêu?',
          options: ['0,6', '3,0', '6,6', '−6,6'],
          answer: 2,
          why: 'Gradient tại w = 0 là 2(0 − 3) = −6. Cập nhật: w = 0 − 1,1 × (−6) = **6,6**. Điểm mới nằm ở phía **bên kia** cực tiểu và còn xa hơn điểm xuất phát (cách 3,6 so với 3 ban đầu). Bước sau sẽ nhảy về −1,32, rồi 8,184 — biên độ tăng dần cho tới khi tràn số. Đây chính là cơ chế phân kỳ do tốc độ học quá lớn.',
          distractorWhy: [
            'Đây là kết quả với η = 0,1, tức bước hợp lý.',
            'Đây là đáp số đúng của bài toán, nhưng hạ gradient không nhảy thẳng tới đó trong một bước.',
            '',
            'Sai dấu: gradient âm nhân với dấu trừ trong công thức cho ra dịch chuyển dương.',
          ],
        },
        {
          id: 't1l7-q2',
          kind: 'multi',
          tags: ['huan-luyen'],
          q: 'Loss huấn luyện ra nan sau vài vòng. Bước xử lý nào hợp lý? (Chọn tất cả)',
          options: [
            'Giảm tốc độ học đi 10 lần',
            'Kiểm tra xem đặc trưng đã được chuẩn hoá chưa',
            'Tăng số vòng huấn luyện lên gấp đôi',
            'Thêm epsilon vào trong log để tránh log(0)',
          ],
          answers: [0, 1, 3],
          why: 'Ba nguyên nhân của nan, theo thứ tự tần suất: bước quá dài làm trọng số nổ; đặc trưng chưa chuẩn hoá tạo gradient khổng lồ ở một cột (nhớ cột byte 148930 ở bài t1-l1); và log(0) khi xác suất bị bão hoà đúng bằng 0 hoặc 1. Tăng số vòng chỉ khiến bạn chờ lâu hơn để nhận cùng một kết quả hỏng — nan không tự khỏi.',
        },
        {
          id: 't1l7-q3',
          kind: 'order',
          tags: ['gradient', 'huan-luyen'],
          q: 'Sắp xếp các bước trong một vòng lặp huấn luyện bằng hạ gradient.',
          items: [
            'Tính dự đoán của mô hình trên lô dữ liệu hiện tại',
            'Tính hàm mất mát bằng cách so dự đoán với nhãn thật',
            'Tính gradient của mất mát theo từng trọng số',
            'Cập nhật trọng số ngược hướng gradient với bước dài eta',
            'Lặp lại với lô dữ liệu tiếp theo cho tới khi mất mát hết giảm',
          ],
          why: 'Đây là vòng lặp giống hệt nhau ở mọi khung công cụ, từ 18 dòng numpy tới PyTorch tới việc huấn luyện mô hình ngôn ngữ hàng tỉ tham số. Chỉ có cách tính gradient (lan truyền ngược) và cách chọn bước (Adam, momentum) là phức tạp thêm; xương sống thì không đổi.',
        },
        {
          id: 't1l7-q4',
          kind: 'input',
          tags: ['log-loss'],
          q: 'Một mẫu thực sự độc hại (y = 1) nhưng mô hình gán xác suất p = 0,5. Log loss của mẫu đó bằng bao nhiêu? (Làm tròn 3 chữ số thập phân)',
          accept: ['0,693', '0.693', '0,69', '0.69', 'log2', 'ln2'],
          placeholder: 'Ví dụ: 0,105',
          hint: 'L = −log(p) khi y = 1. Đây là logarit tự nhiên.',
          why: 'L = −log(0,5) = log(2) = **0,693**. Đây là mức mất mát của việc đoán bừa hoàn toàn. So sánh: p = 0,9 cho L = 0,105; p = 0,99 cho L = 0,010; p = 0,01 cho L = 4,605. Ghi nhớ mốc 0,693 giúp bạn nhìn một log huấn luyện là biết ngay mô hình có học được gì không.',
        },
        {
          id: 't1l7-q5',
          kind: 'truefalse',
          tags: ['gradient', 'huan-luyen'],
          q: 'Hồi quy logistic có thể bị kẹt ở cực tiểu địa phương, nên phải chạy nhiều lần với các điểm khởi tạo khác nhau.',
          answer: false,
          why: 'Hàm mất mát của hồi quy logistic là **lồi**, nghĩa là nó chỉ có đúng một cực tiểu toàn cục và hạ gradient luôn tìm được nó bất kể khởi tạo ở đâu. Đây là một trong những lý do khiến hồi quy logistic vẫn được dùng rộng rãi trong bảo mật: kết quả tái lập được, dễ giải thích, huấn luyện ổn định. Cực tiểu địa phương chỉ là mối bận tâm với mạng nơ-ron, và ngay cả ở đó thì điểm yên ngựa và việc chuẩn hoá dữ liệu mới là vấn đề lớn hơn.',
        },
      ],
      terms: ['ham-mat-mat', 'log-loss', 'gradient', 'toc-do-hoc', 'mau-doi-khang'],
      further: [
        {
          title: 'Explaining and Harnessing Adversarial Examples — Goodfellow, Shlens, Szegedy (2014)',
          note: 'Bài báo giới thiệu FGSM. Đọc mục 4 để thấy mẫu đối kháng chỉ là hạ gradient chạy ngược. Nền cho toàn bộ chặng 8.',
        },
        {
          title: 'Deep Learning — Goodfellow, Bengio, Courville, chương 4 và 8',
          note: 'Phần tối ưu hoá số học và huấn luyện mạng sâu. Đọc để hiểu vì sao điểm yên ngựa quan trọng hơn cực tiểu địa phương.',
          url: 'https://www.deeplearningbook.org/',
        },
      ],
    },
  ],
};
