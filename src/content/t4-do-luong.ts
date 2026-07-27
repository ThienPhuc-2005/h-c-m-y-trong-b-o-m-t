import type { Track } from './types';

/**
 * CHẶNG 4 — Đo lường và ra quyết định.
 *
 * Đây là chặng bản lề của cả khoá. Ba chặng trước dạy bạn xây được một mô hình;
 * chặng này dạy bạn trả lời câu hỏi mà không thư viện nào trả lời hộ:
 * "mô hình này tốt hay không, tốt theo nghĩa nào, và ta nên chặn ở đâu?"
 *
 * Thiết kế sư phạm:
 *  - Bài 1–2 xây nền: bốn con số và hai câu hỏi khác nhau về cùng một mô hình.
 *  - Bài 3 dạy đọc đường cong — nơi 90% người làm ML bảo mật đọc sai.
 *  - Bài 4 là đỉnh của chặng: biến chỉ số thành QUYẾT ĐỊNH bằng tiền và giờ người.
 *  - Bài 5–6 vá hai lỗ hổng khiến quyết định ở bài 4 sai: mất cân bằng và hiệu chuẩn.
 *  - Bài 7 quy tất cả về đơn vị mà tổ chức thực sự chi trả: giờ analyst và sự cố bị bỏ sót.
 */
export const track4: Track = {
  id: 'do-luong',
  order: 4,
  title: 'Đo lường và ra quyết định',
  tagline: 'Chặng quyết định bạn là kỹ sư hay người chạy thư viện',
  icon: '📊',
  hue: 'amber',
  blurb:
    'Bảy bài về câu hỏi khó nhất trong ML bảo mật: mô hình này tốt hay không, và tốt theo nghĩa nào. Bạn sẽ học đọc bốn con số của ma trận nhầm lẫn, chọn đúng chỉ số cho bài toán mất cân bằng, đặt ngưỡng bằng chi phí thật thay vì con số 0,5 mặc định, và quy mọi thứ về đơn vị mà tổ chức thực sự chi trả: giờ analyst và số vụ bị bỏ lọt. Đây là chặng phân biệt người hiểu bài toán với người chỉ biết gọi thư viện.',
  outcomes: [
    'Đọc một ma trận nhầm lẫn và quy ngay ra số cảnh báo mỗi ngày cùng số giờ analyst phải trả',
    'Chọn và bảo vệ được lựa chọn giữa precision, recall, F-beta, ROC-AUC và PR-AUC cho từng bài toán cụ thể',
    'Tính ngưỡng tối ưu từ ma trận chi phí, và ngưỡng khả thi từ công suất thật của đội SOC',
    'Xử lý mất cân bằng lớp mà không phá hỏng hiệu chuẩn và không tự tạo rò rỉ dữ liệu',
    'Hiệu chuẩn điểm mô hình để con số 0,9 thực sự có nghĩa là 90 phần trăm',
    'Trình bày hiệu năng phát hiện bằng bộ chỉ số lãnh đạo dùng được: precision@k, tải cảnh báo, MTTD, MTTR',
  ],
  lessons: [
    /* ====================================================================== */
    {
      id: 't4-l1',
      trackId: 'do-luong',
      title: 'Ma trận nhầm lẫn và bốn con số nền tảng',
      subtitle: 'Bốn ô vuông chứa toàn bộ sự thật về một bộ phát hiện',
      minutes: 16,
      level: 'co-ban',
      prereqs: ['t1-l3'],
      why: {
        short:
          'Mọi chỉ số bạn sẽ gặp trong đời — precision, recall, F1, ROC-AUC, chi phí kỳ vọng — đều được tính ra từ đúng bốn con số này; không đọc được chúng thì mọi con số về sau chỉ là niềm tin.',
        scenario:
          'Nhà cung cấp gửi báo cáo: “mô hình phát hiện phishing của chúng tôi đạt độ chính xác 99,7%”. Bạn có trong tay ma trận nhầm lẫn chạy trên 100.000 email của chính công ty mình. Trong 5 phút bạn phải nói được hai điều: mỗi ngày đội của bạn phải xử lý thêm bao nhiêu cảnh báo, và bao nhiêu email lừa đảo vẫn lọt qua.',
        roles: ['SOC Analyst', 'Detection Engineer', 'Security Data Scientist', 'Security Architect'],
        costOfNotKnowing:
          'Bạn ký hợp đồng dựa trên một con số vô nghĩa, rồi ba tháng sau phát hiện hệ thống mới đẻ thêm 228 cảnh báo giả mỗi ngày mà vẫn để lọt 8 email lừa đảo — lúc đó ngân sách đã tiêu xong và niềm tin của đội SOC vào ML thì đã mất.',
      },
      objectives: [
        'Điền được ma trận nhầm lẫn từ một tình huống SOC mô tả bằng lời',
        'Gọi đúng tên và nêu đúng hậu quả nghiệp vụ của TP, FP, TN, FN',
        'Quy bốn con số thành hai đại lượng vận hành: cảnh báo mỗi ngày và vụ bỏ lọt mỗi tháng',
        'Giải thích được vì sao cùng một mô hình cho ra nhiều ma trận nhầm lẫn khác nhau',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Công ty bạn nhận 100.000 email mỗi ngày, trong đó khoảng 40 email là lừa đảo thật. Mô hình mới gắn cờ 260 email, và trong 260 email đó có 32 email đúng là lừa đảo. Hãy tính nhanh trong đầu: (a) độ chính xác (accuracy) của mô hình là bao nhiêu, (b) một chương trình ngu ngốc luôn trả lời “an toàn” đạt độ chính xác bao nhiêu?',
          reveal:
            'Bốn con số: bắt trúng **32**, báo động giả **260 − 32 = 228**, bỏ sót **40 − 32 = 8**, bỏ qua đúng **100.000 − 40 − 228 = 99.732**.\n\n(a) Accuracy = (32 + 99.732) / 100.000 = **99,764%**.\n\n(b) Chương trình luôn nói “an toàn”: nó đúng với cả 99.960 email lành và sai với 40 email độc → accuracy = **99,960%**.\n\nĐọc kỹ hai con số đó. Mô hình học máy đắt tiền của bạn có accuracy **THẤP HƠN** một dòng lệnh `return "an toàn"`. Nhưng mô hình bắt được 32 vụ lừa đảo, còn dòng lệnh kia bắt được 0. Accuracy không chỉ vô dụng ở đây — nó xếp hạng ngược. Bốn con số thì không nói dối bao giờ, và đó là lý do bài này đứng đầu chặng quan trọng nhất khoá học.',
        },
        {
          t: 'p',
          md: 'Ma trận nhầm lẫn (confusion matrix) chỉ là bảng đối chiếu hai câu hỏi: **sự thật là gì** và **máy nói gì**. Hai câu hỏi, mỗi câu hai đáp án, ra bốn ô. Toàn bộ ngành đo lường mô hình phân loại nằm gọn trong bốn ô đó.',
        },
        {
          t: 'p',
          md: 'Trong bảo mật, ta quy ước lớp **dương** (positive) là “có chuyện xấu”: email lừa đảo, tệp độc hại, phiên đăng nhập bị chiếm. Quy ước này không phải tuỳ tiện — nó khiến recall trở thành “tỉ lệ bắt được” và khiến mọi công thức về sau đọc thuận theo nghiệp vụ.',
        },
        {
          t: 'figure',
          id: 'fig-confusion',
          caption: 'Bốn ô, hai trục. Trục dọc là sự thật, trục ngang là phán quyết của máy. Mỗi ô có một cái giá khác nhau, và đó mới là phần quan trọng.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Mẹo đọc tên bốn ô, không bao giờ nhầm nữa',
          md: 'Tên của mỗi ô có hai chữ. **Chữ sau (P hay N) là điều MÁY NÓI. Chữ trước (T hay F) cho biết máy nói ĐÚNG hay SAI.**\n\n- **False Negative** = máy nói “âm tính” (Negative) và máy đã sai (False) → thực ra là tấn công → **bỏ sót**.\n- **False Positive** = máy nói “dương tính” và máy đã sai → **báo động giả**.\n\nĐọc từ phải sang trái. Sau khi nắm mẹo này bạn sẽ không bao giờ phải tra lại bảng nữa — và tin tôi đi, người ta nhầm FN với FP trong các cuộc họp nhiều hơn bạn tưởng.',
        },
        { t: 'h', text: 'Bốn ô và cái giá thật của từng ô', level: 2 },
        {
          t: 'table',
          head: ['Ô', 'Tên tiếng Việt nên dùng', 'Nghĩa trong SOC', 'Ai trả giá'],
          rows: [
            ['TP — True Positive', 'Bắt trúng', 'Có tấn công, mô hình báo. Analyst điều tra và xác nhận đúng.', 'Vẫn tốn ~15–45 phút điều tra, nhưng đây là tiền chi đúng chỗ.'],
            ['FP — False Positive', 'Báo động giả', 'Không có gì, mô hình vẫn báo. Analyst mất thời gian rồi đóng ticket.', 'Đội SOC trả bằng giờ làm và bằng lòng tin: FP nhiều thì cảnh báo thật cũng bị bấm bỏ qua.'],
            ['FN — False Negative', 'Bỏ sót', 'Có tấn công, mô hình im lặng. Không ai biết cho tới khi hậu quả nổ ra.', 'Cả công ty. Đây là ô duy nhất bạn không nhìn thấy trong bảng điều khiển vận hành.'],
            ['TN — True Negative', 'Bỏ qua đúng', 'Không có gì, mô hình im lặng. Đúng và rẻ.', 'Không ai. Nhưng chính ô khổng lồ này khiến accuracy trở nên vô nghĩa.'],
          ],
        },
        {
          t: 'callout',
          kind: 'why',
          title: 'Vì sao ô TN là thủ phạm',
          md: 'Trong ví dụ đầu bài, TN = 99.732 trên tổng 100.000. Bất kỳ chỉ số nào cộng TN vào tử số — accuracy là chỉ số kinh điển — sẽ bị ô này nuốt chửng. Bạn có thể tăng TP từ 0 lên 40 (bắt được **tất cả** các vụ lừa đảo) mà accuracy chỉ nhúc nhích 0,04 điểm phần trăm.\n\nĐây là lý do kỹ thuật, chứ không phải lý do triết học, khiến hai chỉ số quan trọng nhất trong bảo mật — precision và recall — **không dùng TN trong công thức**. Bài sau sẽ chứng minh điều đó.',
        },
        {
          t: 'steps',
          title: 'Ví dụ mẫu: từ mô tả bằng lời tới quyết định',
          steps: [
            {
              title: 'Bước 1 — Xác định lớp dương và tổng số mẫu',
              md: 'Lớp dương = email lừa đảo. Tổng = 100.000 email/ngày. Số dương thật = 40. Số âm thật = 100.000 − 40 = **99.960**.\n\nBước tưởng như thừa này thực ra là bước hay bị bỏ qua nhất. Không biết mẫu số thì không có con số nào ở dưới có ý nghĩa.',
            },
            {
              title: 'Bước 2 — Điền ô từ hai thông tin có sẵn',
              md: 'Mô hình gắn cờ 260 email → đó là **cột dự đoán dương**: TP + FP = 260. Trong đó đúng 32 → **TP = 32**, **FP = 228**.\n\nSự thật có 40 dương → đó là **hàng thật dương**: TP + FN = 40 → **FN = 8**. Phần còn lại: **TN = 99.960 − 228 = 99.732**.',
            },
            {
              title: 'Bước 3 — Quy về đơn vị vận hành',
              md: 'Cảnh báo mỗi ngày = TP + FP = **260**. Với 12 phút xử lý trung bình mỗi cảnh báo, đó là 3.120 phút = **52 giờ analyst mỗi ngày** — tức khoảng **6,5 ca làm việc** chỉ để tiêu hoá đầu ra của một mô hình.\n\nBỏ lọt = FN = 8 email lừa đảo mỗi ngày, tức khoảng **240 email mỗi tháng** đi thẳng vào hộp thư nhân viên.',
            },
            {
              title: 'Bước 4 — Đặt câu hỏi quyết định',
              md: 'Câu hỏi không phải “mô hình có tốt không”. Câu hỏi là: **52 giờ analyst mỗi ngày có đáng để chặn 32 vụ lừa đảo mỗi ngày không, so với phương án hiện tại?**\n\nĐó là một câu hỏi về tiền và nhân sự, và bạn chỉ trả lời được sau khi đã đi qua bốn ô. Bài t4-l4 sẽ biến câu hỏi này thành một phép tính.',
            },
          ],
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't4l1-cp1',
              kind: 'mcq',
              tags: ['ma-tran-nham-lan', 'do-luong'],
              q: 'Hệ thống EDR quét 8.000 tiến trình. Có 25 tiến trình thực sự độc hại. EDR cách ly 90 tiến trình, trong đó 18 đúng là độc hại. FN bằng bao nhiêu?',
              options: ['72', '7', '18', '7.910'],
              answer: 1,
              why: 'FN = số dương thật mà mô hình bỏ qua = 25 − 18 = **7**. Con số 72 là FP (90 cách ly trừ 18 đúng). Nhầm hai con số này là lỗi phổ biến nhất trong các cuộc họp về hiệu năng phát hiện, và nó nguy hiểm vì FP là chi phí vận hành còn FN là rủi ro tồn dư — hai thứ hoàn toàn khác nhau về bản chất.',
              distractorWhy: [
                'Đây là FP: 90 tiến trình bị cách ly trừ 18 cái đúng.',
                '',
                'Đây là TP — số vụ bắt trúng.',
                'Đây là TN: 8.000 − 25 − 72 = 7.903, và kể cả tính đúng thì đây cũng là ô “bỏ qua đúng”.',
              ],
            },
            {
              id: 't4l1-cp2',
              kind: 'truefalse',
              tags: ['ma-tran-nham-lan', 'nguong'],
              q: 'Một mô hình đã huấn luyện xong thì có duy nhất một ma trận nhầm lẫn.',
              answer: false,
              why: 'Mô hình cho ra **điểm số liên tục**, không phải quyết định. Chỉ khi bạn chọn một ngưỡng cắt thì điểm số mới biến thành nhãn, và mỗi ngưỡng cho một ma trận khác nhau. Hạ ngưỡng xuống → TP tăng, FN giảm, nhưng FP tăng theo. Vì vậy mọi ma trận nhầm lẫn phải đi kèm hai thông tin: **ngưỡng nào** và **trên tập dữ liệu nào**. Thiếu một trong hai thì con số không kiểm chứng được.',
            },
          ],
        },
        {
          t: 'lab',
          id: 'lab-confusion',
          intro: 'Kéo ngưỡng và nhìn bốn con số nhảy theo thời gian thực. Hãy chú ý điều này: khi bạn kéo để FN về 0, hãy nhìn FP đang là bao nhiêu.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Lấy bốn con số bằng scikit-learn và quy ngay ra đơn vị vận hành',
          code:
            "import numpy as np\n" +
            "from sklearn.metrics import confusion_matrix\n" +
            "\n" +
            "# y_that: nhãn thật (1 = lừa đảo). diem: điểm mô hình cho mỗi email, trong [0, 1].\n" +
            "nguong = 0.50\n" +
            "y_du_doan = (diem >= nguong).astype(int)\n" +
            "\n" +
            "# labels=[0, 1] để thứ tự ô KHÔNG phụ thuộc lớp nào tình cờ xuất hiện trước.\n" +
            "# Bỏ tham số này là nguồn gốc của rất nhiều bảng bị đảo ô mà không ai nhận ra.\n" +
            "tn, fp, fn, tp = confusion_matrix(y_that, y_du_doan, labels=[0, 1]).ravel()\n" +
            "print('Bắt trúng TP =', tp, '| Báo động giả FP =', fp)\n" +
            "print('Bỏ sót   FN =', fn, '| Bỏ qua đúng TN =', tn)\n" +
            "\n" +
            "# Quy về hai con số mà đội vận hành thực sự quan tâm\n" +
            "so_ngay = 30\n" +
            "phut_moi_canh_bao = 12\n" +
            "canh_bao_ngay = (tp + fp) / so_ngay\n" +
            "print('Cảnh báo mỗi ngày:', round(canh_bao_ngay, 1))\n" +
            "print('Giờ analyst mỗi ngày:', round(canh_bao_ngay * phut_moi_canh_bao / 60, 1))\n" +
            "print('Vụ bỏ lọt trong kỳ:', fn)\n",
        },
        {
          t: 'compare',
          title: 'Hai loại sai lầm, hai loại thiệt hại',
          left: {
            title: '🔔 Báo động giả (FP) — chi phí vận hành',
            items: [
              'Đo được, thấy được, xuất hiện ngay trên bảng điều khiển',
              'Cộng dồn tuyến tính theo giờ analyst: 12 phút × số cảnh báo',
              'Tác động phi tuyến: quá ngưỡng chịu đựng thì sinh mù cảnh báo',
              'Sửa nhanh: nâng ngưỡng, lọc, gom nhóm',
              'Đơn vị đo: giờ người mỗi ngày, tiền lương mỗi tháng',
            ],
          },
          right: {
            title: '🕳️ Bỏ sót (FN) — rủi ro tồn dư',
            items: [
              'Không đo được từ dữ liệu vận hành: bạn không biết cái mình không thấy',
              'Chỉ lộ ra khi có sự cố, khi bị bên thứ ba báo, hoặc khi làm threat hunting',
              'Chi phí lệch cực mạnh: 99 vụ vô hại và 1 vụ ransomware 40 tỉ đồng',
              'Sửa chậm: cần dữ liệu mới, đặc trưng mới, huấn luyện lại',
              'Đơn vị đo: xác suất sự cố × thiệt hại kỳ vọng',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Ba cái bẫy quanh bảng bốn ô',
          md: '**1. Ma trận không kèm ngưỡng.** Con số đẹp có thể chỉ là ngưỡng được chỉnh riêng cho slide đó.\n\n**2. Ma trận trên tập đã cân bằng lại.** Nhiều báo cáo lấy 5.000 mẫu độc và 5.000 mẫu lành cho “dễ nhìn”. Khi đó FP trong bảng là FP trên 5.000 mẫu lành, còn thực tế bạn có 10 triệu mẫu lành mỗi ngày — sai lệch 2.000 lần. Tập kiểm tra phải giữ nguyên tỉ lệ thật.\n\n**3. Nhầm chiều bảng.** Một số tài liệu và một số công cụ đặt hàng là dự đoán, cột là sự thật; scikit-learn thì ngược lại. Luôn dán nhãn rõ ràng cho trục trước khi diễn giải.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Một câu hỏi cắt qua mọi bài trình bày',
          md: 'Khi ai đó khoe kết quả phát hiện, hãy hỏi đúng câu này: **“Cho tôi xin bốn con số tuyệt đối, trên bao nhiêu mẫu âm, ở ngưỡng nào?”**\n\nNếu người trình bày đưa được ngay, họ hiểu bài toán của mình. Nếu họ chỉ có tỉ lệ phần trăm, bạn vừa tiết kiệm cho công ty một khoản tiền.',
        },
        { t: 'terms', ids: ['bao-dong-gia', 'bo-sot', 'nguong', 'base-rate', 'mat-can-bang'] },
      ],
      keyTakeaways: [
        'Ma trận nhầm lẫn là bảng đối chiếu giữa sự thật và phán quyết của máy; bốn ô của nó sinh ra mọi chỉ số khác.',
        'Mẹo đọc tên: chữ sau là điều máy nói, chữ trước cho biết máy nói đúng hay sai.',
        'Ô TN khổng lồ là lý do accuracy vô dụng trong bảo mật — precision và recall cố tình không dùng TN.',
        'Một mô hình có vô số ma trận nhầm lẫn, mỗi ngưỡng một cái; ma trận không kèm ngưỡng và mẫu số là con số không kiểm chứng được.',
        'Luôn quy bốn ô về hai đại lượng vận hành: số cảnh báo mỗi ngày (giờ analyst) và số vụ bỏ lọt mỗi tháng (rủi ro tồn dư).',
      ],
      cards: [
        {
          id: 't4l1-c1',
          front: 'False Negative trong phát hiện tấn công nghĩa là gì, và vì sao nó nguy hiểm hơn FP?',
          back: 'Máy nói “không có gì” nhưng thực ra có tấn công — tức bỏ sót. Nguy hiểm hơn vì bạn không nhìn thấy nó trong dữ liệu vận hành: FP xuất hiện trên bảng điều khiển, FN thì im lặng cho tới khi sự cố nổ ra.',
          tags: ['ma-tran-nham-lan'],
        },
        {
          id: 't4l1-c2',
          front: 'Vì sao precision và recall cố tình không dùng True Negative trong công thức?',
          back: 'Vì trong bảo mật TN chiếm gần 100% dữ liệu; bất kỳ chỉ số nào cộng TN vào sẽ bị ô này nuốt chửng và không phản ánh được thay đổi ở lớp hiếm.',
          tags: ['do-luong', 'mat-can-bang'],
        },
        {
          id: 't4l1-c3',
          front: 'Một ma trận nhầm lẫn phải luôn đi kèm hai thông tin nào mới có ý nghĩa?',
          back: 'Ngưỡng cắt đã dùng, và tập dữ liệu (đặc biệt là số mẫu âm thật) mà nó được tính trên đó.',
          hint: 'Một cái là tham số quyết định, một cái là mẫu số.',
          tags: ['nguong', 'do-luong'],
        },
        {
          id: 't4l1-c4',
          front: '100.000 email/ngày, 40 lừa đảo. Mô hình gắn cờ 260, đúng 32. FP và FN bằng bao nhiêu?',
          back: 'FP = 260 − 32 = 228 báo động giả. FN = 40 − 32 = 8 vụ bỏ lọt.',
          tags: ['ma-tran-nham-lan'],
        },
        {
          id: 't4l1-c5',
          front: 'Vì sao ma trận nhầm lẫn tính trên tập đã cân bằng lại 50/50 là con số gây hiểu nhầm?',
          back: 'Vì số FP trong bảng được tính trên số mẫu âm giả tạo. Thực tế có nhiều mẫu âm hơn hàng nghìn lần, nên số báo động giả thật lớn hơn tương ứng. Tập kiểm tra phải giữ nguyên tỉ lệ lớp thật.',
          tags: ['mat-can-bang', 'do-luong'],
        },
      ],
      quiz: [
        {
          id: 't4-l1-q1',
          kind: 'mcq',
          tags: ['ma-tran-nham-lan', 'do-luong'],
          q: 'Cổng WAF xử lý 2 triệu request mỗi ngày, trong đó 500 là tấn công thật. Cấu hình mới chặn 3.500 request, bắt trúng 450. Đâu là mô tả đúng nhất về ảnh hưởng vận hành?',
          options: [
            'Mô hình đạt accuracy 99,84%, đây là kết quả xuất sắc',
            'Mỗi ngày có 3.050 request hợp lệ bị chặn oan và 50 cuộc tấn công vẫn lọt',
            'Recall là 3.500/500 nên mô hình quá nhạy',
            'Vì TN rất lớn nên có thể coi mô hình gần như hoàn hảo',
          ],
          answer: 1,
          why: 'FP = 3.500 − 450 = 3.050 request hợp lệ bị chặn oan — trong WAF, mỗi cái là một khách hàng không mua được hàng hoặc một cuộc gọi lên bộ phận hỗ trợ. FN = 500 − 450 = 50 cuộc tấn công lọt qua. Hai con số tuyệt đối này là ngôn ngữ để nói chuyện với đội vận hành và đội kinh doanh; accuracy 99,84% thì không nói được gì cả — nó còn thấp hơn accuracy của việc không chặn gì (99,975%).',
          distractorWhy: [
            'Accuracy ở đây thấp hơn cả phương án không làm gì, nên nó không chứng minh được điều gì.',
            '',
            'Recall = TP / số dương thật = 450/500 = 0,90. Chia cho số cảnh báo là công thức của precision với tử số sai.',
            'TN lớn chính là lý do khiến chỉ số dựa trên TN mất ý nghĩa, không phải lý do để yên tâm.',
          ],
        },
        {
          id: 't4-l1-q2',
          kind: 'input',
          tags: ['ma-tran-nham-lan', 'base-rate'],
          q: 'Hệ thống xử lý 5.000.000 sự kiện mỗi ngày. Tỉ lệ báo động giả là 0,04% số sự kiện lành tính (coi gần đúng toàn bộ là lành tính). Mỗi ngày đội SOC nhận bao nhiêu cảnh báo giả? (Chỉ nhập con số)',
          accept: ['2000', '2.000', '2 000', '2000 canh bao', '2000/ngay'],
          placeholder: 'Nhập số cảnh báo giả mỗi ngày…',
          hint: 'Nhân tỉ lệ với tổng số sự kiện lành tính. 0,04% = 0,0004.',
          why: '5.000.000 × 0,0004 = **2.000 cảnh báo giả mỗi ngày**. Với 12 phút mỗi cảnh báo, đó là 400 giờ analyst mỗi ngày — khoảng 50 ca làm việc. Bài học ở đây không phải phép nhân, mà là phản xạ: mỗi khi nghe một tỉ lệ phần trăm nhỏ, hãy nhân ngay với lưu lượng để ra con số tuyệt đối. Tỉ lệ nghe êm tai; con số tuyệt đối mới là thứ đội SOC phải sống cùng.',
        },
        {
          id: 't4-l1-q3',
          kind: 'match',
          tags: ['ma-tran-nham-lan'],
          q: 'Nối mỗi ô của ma trận nhầm lẫn với hậu quả nghiệp vụ tương ứng.',
          pairs: [
            ['True Positive', 'Analyst điều tra và xác nhận có tấn công thật'],
            ['False Positive', 'Analyst mất 12 phút rồi đóng ticket vì không có gì'],
            ['False Negative', 'Kẻ tấn công đi tiếp mà không ai biết'],
            ['True Negative', 'Không ai làm gì cả, và đó là điều đúng'],
          ],
          why: 'Ghép được bốn ô với hậu quả là bước chuyển từ “biết định nghĩa” sang “dùng được”. Chú ý điểm bất đối xứng: ba ô đầu đều tạo ra hành động hoặc hậu quả quan sát được, riêng False Negative thì hoàn toàn im lặng. Đó là lý do bạn cần threat hunting và kiểm chứng bằng dữ liệu bên ngoài — vì không có cách nào đếm FN từ chính bảng điều khiển của bạn.',
        },
        {
          id: 't4-l1-q4',
          kind: 'order',
          tags: ['do-luong', 'quy-trinh'],
          q: 'Sắp xếp các bước đọc một báo cáo hiệu năng phát hiện theo đúng thứ tự nên làm.',
          items: [
            'Hỏi lớp dương được định nghĩa là gì và tập đánh giá có bao nhiêu mẫu âm thật',
            'Hỏi ngưỡng nào đang được dùng để tạo ra bảng số này',
            'Lấy bốn con số tuyệt đối TP, FP, FN, TN',
            'Quy FP thành số cảnh báo mỗi ngày và số giờ analyst',
            'Quy FN thành rủi ro tồn dư và so với khẩu vị rủi ro của tổ chức',
          ],
          why: 'Thứ tự này không tuỳ tiện. Không biết mẫu số thì mọi tỉ lệ đều vô nghĩa, nên nó đứng đầu. Không biết ngưỡng thì bốn con số không tái lập được. Chỉ khi có bốn con số tuyệt đối bạn mới quy ra được hai đại lượng quyết định — giờ người và rủi ro — và đó mới là thứ dùng để ra quyết định mua hay không mua, bật hay không bật.',
        },
        {
          id: 't4-l1-q5',
          kind: 'multi',
          tags: ['do-luong', 'mat-can-bang'],
          q: 'Nhận định nào sau đây là đúng? (Chọn tất cả đáp án đúng)',
          options: [
            'Hạ ngưỡng cắt thường làm FN giảm và FP tăng',
            'Accuracy có thể cao hơn khi mô hình phát hiện ít tấn công hơn, nếu tấn công rất hiếm',
            'Số FP tuyệt đối phụ thuộc vào lưu lượng, còn tỉ lệ FP thì không',
            'Có thể đếm chính xác số FN chỉ bằng cách nhìn vào bảng điều khiển cảnh báo',
          ],
          answers: [0, 1, 2],
          why: 'Ba ý đầu đều đúng và đều là hệ quả trực tiếp của cấu trúc bốn ô. Ý cuối sai và sai theo cách nguy hiểm nhất: FN theo định nghĩa là những gì hệ thống của bạn **không** báo, nên chúng không bao giờ xuất hiện trên bảng điều khiển. Muốn ước lượng FN bạn phải đi tìm bằng nguồn độc lập: threat hunting, diễn tập purple team, thông tin từ bên thứ ba, hoặc phát lại dữ liệu cũ với chữ ký mới.',
        },
      ],
      terms: ['bao-dong-gia', 'bo-sot', 'nguong', 'base-rate', 'mat-can-bang'],
      further: [
        {
          title: 'scikit-learn — Confusion matrix và ConfusionMatrixDisplay',
          note: 'Tài liệu chính thức, đọc kỹ phần thứ tự nhãn. Đây là chỗ hay bị đảo ô nhất trong thực tế.',
        },
        {
          title: 'The Base Rate Fallacy and its Implications for Intrusion Detection — Axelsson (1999)',
          note: 'Nối trực tiếp bài này với t1-l3: vì sao bốn ô cộng lại vẫn cho ra một hệ thống không dùng được khi lớp dương quá hiếm.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't4-l2',
      trackId: 'do-luong',
      title: 'Precision, Recall, F1 — và vì sao accuracy là cái bẫy',
      subtitle: 'Hai câu hỏi khác nhau về cùng một mô hình, và cái giá của việc trộn lẫn chúng',
      minutes: 18,
      level: 'co-ban',
      prereqs: ['t4-l1'],
      why: {
        short:
          'Precision và recall trả lời hai câu hỏi hoàn toàn khác nhau; chọn nhầm câu hỏi là cách nhanh nhất để tối ưu một mô hình đi đúng hướng ngược lại nhu cầu của tổ chức.',
        scenario:
          'Bạn có hai mô hình phát hiện mã độc. Mô hình A: precision 0,95 nhưng recall 0,40. Mô hình B: precision 0,30 nhưng recall 0,92. Giám đốc an ninh hỏi chọn cái nào. Câu trả lời đúng phụ thuộc vào việc mô hình này chặn thẳng hay đẩy vào hàng đợi cho analyst — và bạn phải giải thích được điều đó trong ba câu.',
        roles: ['Detection Engineer', 'Security Data Scientist', 'SOC Analyst', 'ML Engineer'],
        costOfNotKnowing:
          'Bạn báo cáo F1 = 0,71 cho một hệ thống chặn tự động, ban lãnh đạo duyệt, rồi 5% giao dịch hợp lệ bị chặn trong ngày cao điểm — vì F1 đã âm thầm đánh đổi precision lấy recall mà không ai để ý.',
      },
      objectives: [
        'Phát biểu precision và recall bằng lời trước khi viết công thức, và chỉ đúng mẫu số của mỗi cái',
        'Dự đoán được precision và recall thay đổi theo hướng nào khi kéo ngưỡng',
        'Chọn F-beta với beta phù hợp thay vì mặc định F1, và giải thích được vì sao',
        'Phân biệt trung bình macro, micro và weighted, và chọn đúng cho bài toán nhiều lớp trong bảo mật',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Một mô hình phát hiện mã độc có precision = 1,00 (mọi cảnh báo nó đưa ra đều đúng, không sai lần nào) nhưng recall = 0,02 (nó chỉ bắt được 2% số mã độc). Trung bình cộng của hai con số là 0,51 — nghe như điểm trung bình. Vậy F1 của nó bằng bao nhiêu?',
          reveal:
            'F1 = 2 × (1,00 × 0,02) / (1,00 + 0,02) = 0,04 / 1,02 ≈ **0,039**.\n\nGần bằng **không**, chứ không phải 0,51. Đó chính là lý do F1 dùng **trung bình điều hoà** (harmonic mean) chứ không phải trung bình cộng: trung bình điều hoà luôn bị kéo về phía con số nhỏ hơn. Một mô hình muốn F1 cao thì **cả hai** chỉ số phải cùng cao — không được phép giỏi một cái và bỏ mặc cái kia.\n\nHãy nhớ tính chất này. Nó vừa là điểm mạnh của F1 (không cho phép gian lận bằng cách tối đa hoá một phía), vừa là điểm yếu của nó (nó áp đặt rằng hai phía quan trọng ngang nhau — điều gần như không bao giờ đúng trong bảo mật).',
        },
        { t: 'h', text: 'Hai câu hỏi, không phải hai công thức', level: 2 },
        {
          t: 'p',
          md: 'Trước khi nhìn công thức, hãy phát biểu bằng lời. Đây không phải là mẹo sư phạm — người làm lâu năm cũng dùng đúng hai câu này khi tranh luận.',
        },
        {
          t: 'list',
          items: [
            '**Precision (độ chuẩn xác)** trả lời: *“Trong những lần tôi kêu lên, bao nhiêu lần tôi đúng?”* Đây là thước đo **lòng tin** của analyst vào hệ thống. Precision thấp thì người ta ngừng đọc cảnh báo.',
            '**Recall (độ phủ, còn gọi là độ nhạy — sensitivity, hay TPR)** trả lời: *“Trong tất cả những chuyện xấu thực sự đã xảy ra, tôi bắt được bao nhiêu?”* Đây là thước đo **rủi ro còn lại**. Recall thấp nghĩa là kẻ tấn công vẫn đi qua.',
          ],
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Công thức, và mẹo nhớ mẫu số',
          md: 'Precision = TP / (TP + FP) — mẫu số là **cột** dự đoán dương: *tất cả những lần tôi kêu*.\n\nRecall = TP / (TP + FN) — mẫu số là **hàng** thật dương: *tất cả những chuyện xấu thực sự có*.\n\nMẹo: **precision đếm theo cột, recall đếm theo hàng.** Và chú ý điều quan trọng nhất — **không công thức nào chứa TN**. Đó chính là lý do chúng sống sót được trong môi trường mất cân bằng cực đoan, còn accuracy = (TP + TN)/tổng thì không.',
        },
        {
          t: 'table',
          head: ['Ngưỡng', 'Cảnh báo/ngày', 'TP', 'FP', 'FN', 'Precision', 'Recall'],
          rows: [
            ['0,10', '2.100', '39', '2.061', '1', '1,9%', '97,5%'],
            ['0,30', '640', '37', '603', '3', '5,8%', '92,5%'],
            ['0,50', '260', '32', '228', '8', '12,3%', '80,0%'],
            ['0,70', '95', '26', '69', '14', '27,4%', '65,0%'],
            ['0,90', '28', '17', '11', '23', '60,7%', '42,5%'],
            ['0,97', '9', '8', '1', '32', '88,9%', '20,0%'],
          ],
          caption: 'Cùng một mô hình phishing (100.000 email/ngày, 40 vụ thật) ở sáu ngưỡng khác nhau. Không có dòng nào “đúng” — chỉ có dòng phù hợp với công suất và khẩu vị rủi ro của bạn.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Đọc bảng trên như một kỹ sư',
          md: 'Precision và recall **luôn** đi ngược chiều nhau khi bạn kéo ngưỡng, vì cả hai cùng đọc một danh sách xếp hạng. Bạn không chọn “mô hình tốt hơn” bằng cách nhìn hai con số — bạn chọn **điểm hoạt động** trên đường cong của một mô hình.\n\nSo sánh hai mô hình khác nhau chỉ có ý nghĩa khi so ở **cùng một ràng buộc**: cùng số cảnh báo mỗi ngày, hoặc cùng mức recall yêu cầu. Câu “mô hình A có F1 cao hơn” gần như luôn là so sánh hai điểm hoạt động ngẫu nhiên với nhau.',
        },
        {
          t: 'compare',
          title: 'Ưu tiên cái nào? Hỏi: đầu ra đi đâu?',
          left: {
            title: '🎯 Ưu tiên PRECISION khi…',
            items: [
              'Đầu ra hành động tự động: chặn, cách ly, khoá tài khoản',
              'Sai một lần là ảnh hưởng trực tiếp tới người dùng hoặc doanh thu',
              'Đội SOC đã quá tải, thêm cảnh báo là thêm mù cảnh báo',
              'Đây là lớp phòng thủ thứ ba, còn nhiều lớp khác bắt phần bị lọt',
              'Ví dụ: tự động cách ly endpoint, chặn giao dịch thanh toán',
            ],
          },
          right: {
            title: '🕸️ Ưu tiên RECALL khi…',
            items: [
              'Đầu ra chỉ là hàng đợi để con người xem lại',
              'Bỏ sót một vụ là thảm hoạ không đảo ngược được',
              'Có bước lọc rẻ tiền phía sau: làm giàu ngữ cảnh, gom nhóm, mô hình tầng hai',
              'Đây là lớp phòng thủ cuối, sau nó không còn gì',
              'Ví dụ: sàng lọc dấu hiệu ransomware, phát hiện rò rỉ dữ liệu quy mô lớn',
            ],
          },
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't4l2-cp1',
              kind: 'mcq',
              tags: ['precision', 'recall'],
              q: 'Mô hình của bạn sẽ tự động cách ly máy trạm khi phát hiện ransomware, không có người xem lại. Ràng buộc thiết kế quan trọng nhất là gì?',
              options: [
                'Recall phải cao nhất có thể, chấp nhận precision thấp',
                'Precision phải rất cao ở điểm hoạt động, kể cả phải hi sinh recall',
                'F1 phải trên 0,80',
                'Accuracy phải trên 99%',
              ],
              answer: 1,
              why: 'Hành động tự động và không đảo ngược được thì mỗi FP là một máy trạm của người thật bị ngắt khỏi mạng giữa giờ làm việc. Với 5.000 endpoint, precision 90% ở mức 100 cảnh báo mỗi ngày nghĩa là 10 người mất việc trong 30 phút — mỗi ngày. Cách xử lý chuẩn trong thực tế là chia tầng: ngưỡng rất cao cho hành động tự động, ngưỡng thấp hơn cho hàng đợi con người. Bài t4-l4 sẽ dựng đúng kiến trúc ba vùng này.',
              distractorWhy: [
                'Recall cao với precision thấp trong chế độ tự động cách ly sẽ làm tê liệt hoạt động của công ty.',
                '',
                'F1 giả định precision và recall quan trọng ngang nhau — chính là giả định sai trong tình huống này.',
                'Accuracy vẫn vô nghĩa vì lớp dương cực hiếm; 99% ở đây còn tệ hơn không làm gì.',
              ],
            },
            {
              id: 't4l2-cp2',
              kind: 'truefalse',
              tags: ['precision', 'base-rate'],
              q: 'Nếu giữ nguyên mô hình và ngưỡng, đem sang một môi trường có ít tấn công hơn 10 lần, recall gần như không đổi nhưng precision sẽ tụt mạnh.',
              answer: true,
              why: 'Recall chỉ tính trên các mẫu dương, nên nó là thuộc tính của mô hình đối với lớp tấn công — đổi tỉ lệ nền không ảnh hưởng nhiều. Precision thì có FP trong mẫu số, mà FP tỉ lệ với số mẫu âm. Ít tấn công hơn 10 lần trong khi lưu lượng lành giữ nguyên thì TP giảm 10 lần còn FP không đổi → precision tụt gần 10 lần. Đây là lý do một mô hình chạy tốt ở khách hàng A có thể vô dụng ở khách hàng B, và là lý do PR-AUC không so sánh được giữa hai tập dữ liệu có tỉ lệ nền khác nhau (bài t4-l3).',
            },
          ],
        },
        { t: 'h', text: 'F1 và họ F-beta: khi nào và với beta nào', level: 2 },
        {
          t: 'p',
          md: 'F1 chỉ là một điểm trong một họ. Công thức tổng quát: **F_beta = (1 + beta²) × P × R / (beta² × P + R)**. Ý nghĩa của beta rất đơn giản: **beta² là số lần bạn coi trọng recall hơn precision**.',
        },
        {
          t: 'table',
          head: ['Chỉ số', 'beta', 'Ưu tiên', 'Dùng trong bảo mật khi'],
          rows: [
            ['F0.5', '0,5', 'Precision quan trọng gấp 4 lần recall', 'Chặn tự động, cách ly endpoint, khoá tài khoản'],
            ['F1', '1', 'Cân bằng — giả định hai bên ngang nhau', 'Khi thật sự không biết chi phí, hoặc để so sánh với bài báo khác'],
            ['F2', '2', 'Recall quan trọng gấp 4 lần precision', 'Sàng lọc cho hàng đợi analyst, tìm dấu hiệu ransomware'],
            ['F3', '3', 'Recall quan trọng gấp 9 lần precision', 'Lớp phòng thủ cuối, hậu quả bỏ sót là không đảo ngược'],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Cách chọn beta trong 30 giây',
          md: 'Hỏi đội SOC đúng một câu: **“Anh chị sẵn sàng xử lý thêm bao nhiêu báo động giả để bắt thêm được một vụ thật?”**\n\nNếu câu trả lời là 10, thì beta² ≈ 10 → beta ≈ 3,2. Nếu câu trả lời là “không quá 1 cái” thì beta ≈ 1. Nếu là “thà bỏ sót còn hơn làm phiền người dùng” thì beta < 1.\n\nĐây là quy tắc ngón tay cái, không phải định lý. Cách chặt chẽ là dùng ma trận chi phí ở bài t4-l4 — nhưng câu hỏi trên vẫn đáng hỏi, vì nó buộc mọi người phát biểu thành lời cái đánh đổi mà họ vẫn ngầm giả định.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Báo cáo đầy đủ, F-beta, và vì sao digits=4 không phải chuyện làm màu',
          code:
            "from sklearn.metrics import classification_report, fbeta_score\n" +
            "from sklearn.metrics import precision_recall_fscore_support\n" +
            "\n" +
            "y_du_doan = (diem >= 0.5).astype(int)\n" +
            "\n" +
            "# digits=4 vì với lớp hiếm, precision 0,02 và 0,06 khác nhau GẤP BA LẦN\n" +
            "# nhưng cả hai đều làm tròn thành 0,0 hoặc 0,1 ở độ chính xác mặc định.\n" +
            "print(classification_report(y_that, y_du_doan,\n" +
            "                            target_names=['lanh', 'doc'],\n" +
            "                            digits=4, zero_division=0))\n" +
            "\n" +
            "# F2: coi recall quan trọng gấp 4 lần precision (beta bình phương = 4)\n" +
            "print('F2   =', round(fbeta_score(y_that, y_du_doan, beta=2.0), 4))\n" +
            "print('F0.5 =', round(fbeta_score(y_that, y_du_doan, beta=0.5), 4))\n" +
            "\n" +
            "# Với nhiều lớp: macro coi mọi lớp ngang nhau -> họ mã độc hiếm không bị nuốt\n" +
            "p, r, f, _ = precision_recall_fscore_support(\n" +
            "    y_that_nhieu_lop, y_du_doan_nhieu_lop, average='macro', zero_division=0)\n" +
            "print('macro P/R/F1:', round(p, 3), round(r, 3), round(f, 3))\n",
        },
        { t: 'h', text: 'Macro, micro hay weighted: câu hỏi của bài toán nhiều lớp', level: 2 },
        {
          t: 'p',
          md: 'Khi bài toán có nhiều hơn hai lớp — phân loại họ mã độc, phân loại kỹ thuật MITRE ATT&CK, định tuyến cảnh báo về đúng đội — bạn phải gộp chỉ số của từng lớp lại thành một con số. Cách gộp quyết định lớp nào được lắng nghe.',
        },
        {
          t: 'table',
          head: ['Cách gộp', 'Cách tính', 'Hệ quả', 'Dùng khi'],
          rows: [
            [
              'Micro',
              'Cộng dồn TP, FP, FN của tất cả các lớp rồi mới tính',
              'Lớp đông chi phối hoàn toàn; trong bài toán một nhãn nhiều lớp, micro-F1 chính bằng accuracy',
              'Bạn quan tâm tổng số quyết định đúng, không quan tâm phân bố theo lớp',
            ],
            [
              'Macro',
              'Tính chỉ số cho từng lớp rồi lấy trung bình cộng, không trọng số',
              'Một lớp có 12 mẫu có trọng lượng bằng lớp có 120.000 mẫu',
              'Mặc định nên dùng trong bảo mật: họ mã độc hiếm và kỹ thuật tấn công hiếm mới là thứ bạn cần bắt',
            ],
            [
              'Weighted',
              'Trung bình theo số mẫu của từng lớp',
              'Nằm giữa hai cái trên, nhưng vẫn thiên về lớp đông',
              'Báo cáo cho người ngoài, khi muốn con số phản ánh trải nghiệm trung bình',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Ba cái bẫy chết người của chặng này',
          md: '**Bẫy 1 — Accuracy.** Đã mổ xẻ ở bài trước, nhưng nó vẫn xuất hiện trong 90% slide bán hàng. Quy tắc: thấy accuracy đứng một mình trong bài toán mất cân bằng thì coi như không có số liệu nào cả.\n\n**Bẫy 2 — F1 mặc định.** F1 giả định precision và recall quan trọng ngang nhau. Trong bảo mật điều đó gần như không bao giờ đúng. Tối ưu F1 cho một hệ thống chặn tự động là đang âm thầm đồng ý đánh đổi trải nghiệm người dùng lấy độ phủ.\n\n**Bẫy 3 — So sánh F1 ở ngưỡng 0,5.** Hai mô hình có phân bố điểm khác nhau; so ở cùng ngưỡng 0,5 là so hai điểm hoạt động ngẫu nhiên, không phải so hai mô hình. So sánh đúng: cùng số cảnh báo mỗi ngày, hoặc cùng mức recall.',
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'Một cách trình bày khiến cả phòng họp im lặng',
          md: 'Thay vì nói “mô hình đạt precision 0,12 và recall 0,80”, hãy nói:\n\n*“Ở cấu hình này, mỗi ngày đội mình nhận thêm 260 cảnh báo, khoảng 52 giờ công. Đổi lại ta bắt được 32 trong 40 email lừa đảo mỗi ngày, và vẫn để lọt 8 cái. Nếu siết lên ngưỡng 0,9 thì còn 28 cảnh báo mỗi ngày — 5,6 giờ công — nhưng chỉ bắt được 17, để lọt 23.”*\n\nCùng một dữ liệu, khác đơn vị. Đơn vị thứ hai khiến người có thẩm quyền ra được quyết định; đơn vị thứ nhất chỉ khiến họ gật đầu cho qua.',
        },
        { t: 'terms', ids: ['precision', 'recall', 'f1', 'bao-dong-gia', 'mat-can-bang'] },
      ],
      keyTakeaways: [
        'Precision hỏi “trong những lần tôi kêu, bao nhiêu lần đúng” — mẫu số là cột dự đoán dương; recall hỏi “trong những vụ thật, tôi bắt được bao nhiêu” — mẫu số là hàng thật dương.',
        'Cả hai đều không dùng TN, nên chúng sống sót trong mất cân bằng cực đoan còn accuracy thì không.',
        'Precision và recall luôn đi ngược chiều theo ngưỡng; so sánh hai mô hình phải so ở cùng một ràng buộc, không phải cùng ngưỡng 0,5.',
        'F_beta với beta² = số lần bạn coi trọng recall hơn precision; F1 chỉ là trường hợp beta = 1 và giả định này hiếm khi đúng trong bảo mật.',
        'Recall gần như không đổi khi tỉ lệ nền thay đổi, nhưng precision thì tụt theo — mô hình tốt ở nơi này có thể vô dụng ở nơi khác.',
        'Bài toán nhiều lớp: dùng macro nếu lớp hiếm là thứ bạn cần bắt; micro-F1 trong bài toán một nhãn chính là accuracy trá hình.',
      ],
      cards: [
        {
          id: 't4l2-c1',
          front: 'Phát biểu precision và recall bằng lời, không dùng công thức.',
          back: 'Precision: trong những lần mô hình kêu lên, bao nhiêu lần đúng. Recall: trong tất cả những vụ xấu thực sự xảy ra, mô hình bắt được bao nhiêu.',
          tags: ['precision', 'recall'],
        },
        {
          id: 't4l2-c2',
          front: 'Vì sao F1 dùng trung bình điều hoà chứ không phải trung bình cộng?',
          back: 'Vì trung bình điều hoà bị kéo mạnh về phía con số nhỏ hơn. P = 1,00 và R = 0,02 cho F1 ≈ 0,039 chứ không phải 0,51 — mô hình không thể gian lận bằng cách tối đa hoá một phía.',
          tags: ['f1'],
        },
        {
          id: 't4l2-c3',
          front: 'Trong F_beta, beta = 2 nghĩa là gì?',
          back: 'Recall được coi trọng gấp beta² = 4 lần precision. Dùng khi đầu ra chỉ vào hàng đợi cho người xem lại và bỏ sót đắt hơn nhiều so với làm phiền analyst.',
          tags: ['f1', 'do-luong'],
        },
        {
          id: 't4l2-c4',
          front: 'Khi tỉ lệ tấn công trong môi trường giảm 10 lần, precision và recall thay đổi ra sao?',
          back: 'Recall gần như không đổi (chỉ tính trên mẫu dương). Precision tụt gần 10 lần vì TP giảm còn FP giữ nguyên theo lưu lượng lành tính.',
          hint: 'Nhìn vào mẫu số của từng chỉ số xem cái nào chứa số mẫu âm.',
          tags: ['precision', 'base-rate'],
        },
        {
          id: 't4l2-c5',
          front: 'Vì sao trung bình macro thường đúng hơn micro cho bài toán nhiều lớp trong bảo mật?',
          back: 'Macro cho mọi lớp trọng số bằng nhau nên họ mã độc hoặc kỹ thuật tấn công hiếm không bị lớp đông nuốt mất. Micro trong bài toán một nhãn thực chất chính là accuracy.',
          tags: ['do-luong'],
        },
      ],
      quiz: [
        {
          id: 't4-l2-q1',
          kind: 'mcq',
          tags: ['precision', 'recall', 'do-luong'],
          q: 'Bộ lọc URL của bạn có precision 0,04 và recall 0,95, sinh 1.500 cảnh báo mỗi ngày. Đội SOC chỉ xử lý nổi 200 cảnh báo mỗi ngày. Hành động hợp lý nhất trước mắt là gì?',
          options: [
            'Huấn luyện lại mô hình với thuật toán mạnh hơn',
            'Nâng ngưỡng để còn khoảng 200 cảnh báo mỗi ngày và đo lại precision, recall tại đó',
            'Chuyển sang tối ưu F1 thay vì recall',
            'Giữ nguyên vì recall 0,95 là con số rất tốt',
          ],
          answer: 1,
          why: 'Mô hình đang hoạt động ở một điểm mà tổ chức không tiêu thụ nổi, nên 1.300 cảnh báo mỗi ngày không được xem — recall **thực tế** của cả hệ thống thấp hơn nhiều so với 0,95 trên giấy. Nâng ngưỡng về đúng công suất là hành động miễn phí, có ngay hôm nay, và cho bạn con số thật để so sánh về sau. Huấn luyện lại có thể cần, nhưng chỉ sau khi đã biết mô hình hiện tại làm được gì ở điểm hoạt động khả thi.',
          distractorWhy: [
            'Thuật toán mạnh hơn không giải quyết được việc bạn đang đọc kết quả ở sai điểm hoạt động; và nó tốn nhiều tuần.',
            '',
            'F1 vẫn là một lựa chọn tuỳ tiện về đánh đổi; ràng buộc thật ở đây là công suất 200 cảnh báo, không phải một chỉ số.',
            'Recall 0,95 trên giấy vô nghĩa nếu 87% cảnh báo không bao giờ có người mở ra.',
          ],
        },
        {
          id: 't4-l2-q2',
          kind: 'truefalse',
          tags: ['f1', 'do-luong'],
          q: 'Mô hình A có F1 = 0,74, mô hình B có F1 = 0,71, cả hai đo ở ngưỡng mặc định 0,5. Kết luận: A tốt hơn B.',
          answer: false,
          why: 'Ngưỡng 0,5 chỉ là giá trị mặc định của hàm `predict()`, không có ý nghĩa thống kê nào. Hai mô hình có phân bố điểm khác nhau, nên 0,5 rơi vào hai vị trí hoàn toàn khác nhau trên đường cong của chúng. B có thể vượt A ở mọi điểm hoạt động thực tế mà vẫn thua ở đúng một điểm ngẫu nhiên này. So sánh đúng: cố định một ràng buộc chung — cùng số cảnh báo mỗi ngày, hoặc cùng recall — rồi so chỉ số còn lại; hoặc so bằng chỉ số toàn ngưỡng như PR-AUC (bài tiếp theo).',
        },
        {
          id: 't4-l2-q3',
          kind: 'input',
          tags: ['precision', 'recall'],
          q: 'Trên 1.000.000 sự kiện có 200 sự kiện độc hại. Mô hình gắn cờ 5.000 sự kiện và bắt trúng 160. Precision bằng bao nhiêu phần trăm? (Nhập số, ví dụ 3,2 hoặc 3.2)',
          accept: ['3,2', '3.2', '3,2%', '3.2%', '0,032', '0.032'],
          placeholder: 'Nhập precision theo phần trăm…',
          hint: 'Precision = TP chia cho tổng số cảnh báo, không phải chia cho số vụ thật.',
          why: 'Precision = 160 / 5.000 = 0,032 = **3,2%**. Nghĩa là cứ khoảng 31 cảnh báo analyst mở ra mới có 1 cái thật. Recall thì đẹp: 160/200 = 80%. Đây là chân dung điển hình của một bộ phát hiện trong môi trường mất cân bằng cực đoan — recall trông ổn, precision thì thảm hoạ, và chính precision mới là thứ quyết định hệ thống có được đội SOC sử dụng hay bị tắt sau hai tuần.',
        },
        {
          id: 't4-l2-q4',
          kind: 'multi',
          tags: ['do-luong', 'precision'],
          q: 'Trường hợp nào nên chọn beta lớn hơn 1 (ưu tiên recall)? (Chọn tất cả đáp án đúng)',
          options: [
            'Mô hình sàng lọc sơ bộ, kết quả đi vào hàng đợi cho analyst xem lại',
            'Mô hình tự động khoá tài khoản khách hàng khi nghi ngờ chiếm quyền',
            'Bộ phát hiện rò rỉ dữ liệu quy mô lớn, sau nó không còn lớp kiểm soát nào',
            'Bộ lọc thư rác quyết định xoá thẳng email không cho người dùng thấy',
          ],
          answers: [0, 2],
          why: 'Nguyên tắc: hỏi **đầu ra của mô hình đi đâu**. Nếu đi vào hàng đợi cho con người, FP chỉ tốn thời gian và bạn nên ưu tiên recall. Nếu đầu ra là hành động tự động và khó đảo ngược — khoá tài khoản, xoá email — thì mỗi FP là một thiệt hại trực tiếp cho người dùng thật, và bạn phải ưu tiên precision. Lớp phòng thủ cuối cùng luôn nghiêng về recall vì sau nó không còn cơ hội nào nữa.',
        },
        {
          id: 't4-l2-q5',
          kind: 'mcq',
          tags: ['do-luong', 'nhieu-lop'],
          q: 'Bạn phân loại cảnh báo thành 8 loại để định tuyến về đúng đội. Loại “nghi ngờ mã hoá tống tiền” chỉ chiếm 0,3% dữ liệu nhưng quan trọng nhất. Nên báo cáo chỉ số nào?',
          options: [
            'Micro-F1, vì nó phản ánh tổng thể hệ thống',
            'Macro-F1, kèm theo precision và recall riêng của lớp quan trọng',
            'Accuracy nhiều lớp',
            'Weighted-F1, vì nó cân bằng nhất',
          ],
          answer: 1,
          why: 'Macro-F1 cho lớp 0,3% trọng số bằng lớp chiếm 40%, nên nó không cho phép mô hình bỏ rơi lớp hiếm để lấy điểm tổng. Nhưng macro-F1 vẫn là một con số gộp — với lớp thực sự quan trọng, bạn phải báo cáo precision và recall riêng của nó, vì đó là lớp mà quyết định vận hành phụ thuộc vào. Micro-F1 trong bài toán một nhãn chính là accuracy nên nó sẽ bị lớp đông chi phối hoàn toàn; weighted-F1 cũng thiên về lớp đông, chỉ đỡ hơn micro một chút.',
          distractorWhy: [
            'Micro gộp toàn bộ TP, FP, FN nên lớp 0,3% gần như không ảnh hưởng tới kết quả.',
            '',
            'Accuracy nhiều lớp có đúng khuyết điểm của accuracy nhị phân, thậm chí còn khó phát hiện hơn.',
            'Weighted lấy trọng số theo số mẫu, tức là cố tình cho lớp hiếm ít tiếng nói hơn — ngược với nhu cầu ở đây.',
          ],
        },
      ],
      terms: ['precision', 'recall', 'f1', 'bao-dong-gia', 'mat-can-bang', 'base-rate'],
      further: [
        {
          title: 'scikit-learn — Metrics and scoring: classification_report, fbeta_score',
          note: 'Đọc kỹ phần average và zero_division. Hai tham số này quyết định con số bạn báo cáo có nghĩa hay không.',
        },
        {
          title: 'Bảng tra: các tên gọi khác của recall',
          note: 'Recall = sensitivity = true positive rate = hit rate = detection rate. Bốn cái tên cùng một công thức, và bạn sẽ gặp cả bốn trong tài liệu ngành.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't4-l3',
      trackId: 'do-luong',
      title: 'ROC-AUC và PR-AUC',
      subtitle: 'Hai đường cong, hai câu chuyện — và một trong hai sẽ nói dối bạn',
      minutes: 21,
      level: 'trung-cap',
      prereqs: ['t4-l2'],
      why: {
        short:
          'ROC-AUC là chỉ số được báo cáo nhiều nhất trong ML bảo mật và cũng là chỉ số gây hiểu nhầm nhiều nhất; biết khi nào nó nói dối là kỹ năng phân biệt người đọc được kết quả với người chỉ đọc được con số.',
        scenario:
          'Một nhà cung cấp trình bày: “mô hình của chúng tôi đạt ROC-AUC 0,993 trên 1 triệu sự kiện”. Bạn có 60 giây để hỏi hai câu khiến con số đó lộ ra là tốt thật hay chỉ là hệ quả của việc 99,99% dữ liệu là lành tính.',
        roles: ['Security Data Scientist', 'Detection Engineer', 'ML Engineer', 'Security Architect'],
        costOfNotKnowing:
          'Bạn chọn mô hình theo ROC-AUC, triển khai, và phát hiện ở điểm hoạt động khả thi duy nhất thì cứ 112 cảnh báo mới có 1 cái thật — trong khi mô hình bị bạn loại có ROC-AUC thấp hơn nhưng precision gấp bốn lần ở đúng vùng bạn cần.',
      },
      objectives: [
        'Giải thích được mỗi điểm trên đường cong ROC hoặc PR tương ứng với cái gì',
        'Diễn giải ROC-AUC bằng phát biểu xác suất, không phải bằng thang điểm “trên 0,9 là tốt”',
        'Chỉ ra bằng số vì sao ROC trông đẹp trong khi hệ thống không dùng được',
        'Chọn đúng giữa ROC-AUC, PR-AUC và TPR tại FPR cố định cho từng tình huống báo cáo',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Hệ thống xử lý 1.000.000 sự kiện mỗi ngày, trong đó 100 sự kiện là tấn công thật. Mô hình chạy ở điểm hoạt động TPR = 0,90 và FPR = 0,01 (tức 1%). Trên đồ thị ROC, điểm này nằm gần góc trên bên trái — trông tuyệt vời. Hãy tính precision tại đúng điểm đó trước khi đọc tiếp.',
          reveal:
            'Số mẫu âm ≈ 999.900. FP = 999.900 × 0,01 = **9.999**. TP = 100 × 0,90 = **90**.\n\nPrecision = 90 / (90 + 9.999) ≈ **0,89%**. Cứ khoảng **112 cảnh báo mới có 1 cái thật**.\n\nVới 10.089 cảnh báo mỗi ngày và 12 phút mỗi cảnh báo, bạn cần khoảng **2.018 giờ analyst mỗi ngày** — tức hơn 250 ca làm việc. Hệ thống này không tồn tại được quá một tuần.\n\nNhưng trên đồ thị ROC, nó là một điểm rất đẹp, và ROC-AUC của mô hình hoàn toàn có thể trên 0,99. Đó không phải lỗi tính toán của ai cả — đó là bản chất của chỉ số: FPR có mẫu số gần một triệu, còn precision có mẫu số là số cảnh báo. Hai chỉ số nhìn cùng một điểm hoạt động qua hai lăng kính khác nhau, và chỉ một trong hai lăng kính khớp với trải nghiệm của người ngồi trực.',
        },
        { t: 'h', text: 'Đường cong sinh ra từ đâu', level: 2 },
        {
          t: 'p',
          md: 'Mô hình không cho ra nhãn, nó cho ra **điểm số**. Sắp xếp toàn bộ dữ liệu theo điểm giảm dần rồi trượt một đường cắt từ trên xuống: mỗi vị trí cắt là một ngưỡng, mỗi ngưỡng là một ma trận nhầm lẫn, mỗi ma trận là **một điểm** trên đường cong. Đường cong chỉ là bảng ở bài trước, vẽ ra hết.',
        },
        {
          t: 'figure',
          id: 'fig-roc-anatomy',
          caption: 'Giải phẫu một đường ROC: trục, đường chéo ngẫu nhiên, hướng của ngưỡng, và vùng hoạt động khả thi thực tế — thường chỉ là một dải rất hẹp sát trục tung.',
        },
        {
          t: 'table',
          head: ['', 'Đường ROC', 'Đường PR'],
          rows: [
            ['Trục ngang', 'FPR = FP / (FP + TN)', 'Recall = TP / (TP + FN)'],
            ['Trục dọc', 'TPR = Recall', 'Precision = TP / (TP + FP)'],
            ['Mẫu số nhạy cảm', 'TN — số mẫu lành, thường hàng triệu', 'FP — số cảnh báo, thứ analyst thực sự thấy'],
            ['Mức tham chiếu (ngẫu nhiên)', 'Đường chéo, AUC = 0,5', 'Đường ngang tại tỉ lệ lớp dương (ví dụ 0,0001)'],
            ['Đổi tỉ lệ lớp thì sao', 'Không đổi — bất biến với tỉ lệ nền', 'Thay đổi mạnh — tụt theo tỉ lệ dương'],
            ['Trả lời câu hỏi', 'Mô hình xếp hạng dương trên âm tốt tới đâu?', 'Nếu tôi hành động theo nó, tôi sống chung với bao nhiêu rác?'],
          ],
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'ROC-AUC thực sự nghĩa là gì',
          md: 'ROC-AUC có một cách đọc chính xác và rất hữu ích: **xác suất để một mẫu dương lấy ngẫu nhiên được chấm điểm cao hơn một mẫu âm lấy ngẫu nhiên**. (Về mặt thống kê nó tương đương với thống kê U của Mann–Whitney.)\n\nAUC = 0,993 nghĩa là: bốc ngẫu nhiên một tệp độc và một tệp lành, 99,3% số lần tệp độc có điểm cao hơn. Đọc như vậy sẽ thấy ngay hai điều:\n\n1. Nó chỉ nói về **thứ tự**, không nói gì về ngưỡng, về số cảnh báo, hay về xác suất.\n2. Nó **không phụ thuộc tỉ lệ lớp**. Bạn có 100 hay 100.000 mẫu âm thì phát biểu xác suất trên vẫn thế — trong khi trải nghiệm của đội SOC thì khác nhau một trời một vực.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao ROC “lừa dối” khi mất cân bằng cực đoan',
          md: 'Không phải ROC sai. Nó trả lời rất chính xác một câu hỏi mà bạn không hỏi.\n\nVấn đề nằm ở **tỉ lệ chia trục ngang**. Trong ví dụ trên, vùng hoạt động khả thi duy nhất là FPR từ 0 đến khoảng 0,0002 (tương ứng 200 cảnh báo giả mỗi ngày). Vùng đó chiếm **0,02% chiều rộng** của đồ thị ROC — một sợi chỉ sát trục tung mà mắt không phân biệt nổi. 99,98% diện tích còn lại của đồ thị, nơi phần lớn AUC được tích luỹ, là những cấu hình bạn sẽ không bao giờ chạy.\n\nĐường PR thì trải đúng vùng bạn quan tâm ra toàn bộ chiều rộng đồ thị, vì trục ngang của nó là recall.',
        },
        {
          t: 'steps',
          title: 'Cùng một mô hình, ba điểm hoạt động — đọc bằng cả hai lăng kính',
          steps: [
            {
              title: 'Điểm A: FPR = 1%',
              md: 'FP ≈ 9.999, TP = 90. ROC nói: (0,01; 0,90) — sát góc trên trái, tuyệt vời.\n\nPR nói: recall 0,90 nhưng precision **0,89%**. Hơn 10.000 cảnh báo mỗi ngày. Không khả thi.',
            },
            {
              title: 'Điểm B: FPR = 0,02%',
              md: 'FP ≈ 200, TP giả sử còn 70 (TPR 0,70). ROC nói: (0,0002; 0,70) — trên đồ thị nó gần như dính vào trục tung, mắt thường không phân biệt được với điểm A.\n\nPR nói: precision = 70/270 ≈ **26%**. 270 cảnh báo mỗi ngày. Khó nhưng có thể sống được nếu có gom nhóm.',
            },
            {
              title: 'Điểm C: FPR = 0,002%',
              md: 'FP ≈ 20, TP giả sử còn 42 (TPR 0,42). PR nói: precision = 42/62 ≈ **68%**, 62 cảnh báo mỗi ngày. Đây là điểm hoạt động dùng được thật.\n\nBa điểm A, B, C nằm trong một dải hẹp đến mức trên đồ thị ROC chúng chồng lên nhau. Trên đồ thị PR, chúng ở ba vị trí hoàn toàn khác nhau. Đó là toàn bộ lý do bạn cần đường PR.',
            },
          ],
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't4l3-cp1',
              kind: 'mcq',
              tags: ['roc-auc', 'pr-auc'],
              q: 'Bạn giữ nguyên mô hình và ngưỡng, nhưng lưu lượng lành tính tăng gấp 5 lần (số tấn công không đổi). Điều gì xảy ra?',
              options: [
                'ROC-AUC giảm, PR-AUC không đổi',
                'ROC-AUC gần như không đổi, PR-AUC giảm mạnh',
                'Cả hai đều không đổi vì mô hình không thay đổi',
                'Cả hai đều giảm theo cùng tỉ lệ',
              ],
              answer: 1,
              why: 'ROC dựa trên TPR và FPR — cả hai đều là **tỉ lệ trong nội bộ một lớp**, nên nhân số mẫu âm lên 5 lần không làm chúng đổi. PR dùng precision, mà FP tăng gấp 5 trong khi TP giữ nguyên → precision tụt khoảng 5 lần ở mọi ngưỡng, kéo cả đường PR và PR-AUC xuống. Hệ quả thực tế rất quan trọng: **PR-AUC không so sánh được giữa hai tập dữ liệu có tỉ lệ lớp khác nhau**, còn ROC-AUC thì so sánh được — đó vừa là điểm mạnh vừa là cái bẫy của ROC-AUC.',
              distractorWhy: [
                'Ngược lại hoàn toàn: chính PR-AUC mới nhạy với tỉ lệ lớp.',
                '',
                'Mô hình không đổi nhưng trải nghiệm vận hành đổi, và PR-AUC nắm bắt đúng sự thay đổi đó.',
                'ROC-AUC bất biến với tỉ lệ lớp nên nó không giảm.',
              ],
            },
            {
              id: 't4l3-cp2',
              kind: 'truefalse',
              tags: ['pr-auc'],
              q: 'PR-AUC bằng 0,35 là một kết quả kém, vì nó thấp hơn nhiều so với mức 0,5 của đoán mò.',
              answer: false,
              why: 'Mức tham chiếu của đường PR **không phải 0,5** — nó là tỉ lệ lớp dương. Với 100 tấn công trên 1.000.000 sự kiện, mức tham chiếu là 0,0001. PR-AUC 0,35 tức là tốt hơn ngẫu nhiên khoảng 3.500 lần. Con số 0,5 là mức tham chiếu của **ROC**-AUC, và trộn lẫn hai mức tham chiếu này là lỗi diễn giải phổ biến nhất khi người ta mới chuyển sang dùng PR. Luôn báo cáo PR-AUC kèm tỉ lệ lớp dương của tập đánh giá.',
            },
          ],
        },
        {
          t: 'lab',
          id: 'lab-roc-pr',
          intro: 'Vặn núm tỉ lệ mất cân bằng và nhìn hai đường cong cùng lúc. Hãy chú ý: khi bạn kéo tỉ lệ dương từ 1/100 xuống 1/100.000, đường ROC gần như đứng yên còn đường PR sụp xuống sàn.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Ba con số nên báo cáo cùng nhau, không bao giờ báo cáo riêng lẻ',
          code:
            "import numpy as np\n" +
            "from sklearn.metrics import roc_auc_score, average_precision_score, roc_curve\n" +
            "\n" +
            "print('ROC-AUC :', round(roc_auc_score(y, diem), 4))\n" +
            "print('PR-AUC  :', round(average_precision_score(y, diem), 4))\n" +
            "print('Mức tham chiếu PR (tỉ lệ lớp dương):', round(y.mean(), 6))\n" +
            "\n" +
            "# Chỉ số vận hành: bắt được bao nhiêu phần trăm tại mức FPR mà tổ chức chịu nổi\n" +
            "fpr, tpr, thr = roc_curve(y, diem)\n" +
            "for muc in (1e-4, 1e-3, 1e-2):\n" +
            "    i = max(np.searchsorted(fpr, muc, side='right') - 1, 0)\n" +
            "    canh_bao_ngay = muc * (y == 0).sum()\n" +
            "    print(f'FPR={muc:.4%} -> TPR={tpr[i]:.3f} | ngưỡng={thr[i]:.4f} '\n" +
            "          f'| ~{canh_bao_ngay:.0f} cảnh báo giả')\n" +
            "\n" +
            "# CẢNH BÁO: đừng dùng auc(recall, precision). Nội suy tuyến tính trên đường PR\n" +
            "# cho kết quả lạc quan giả. average_precision_score mới là ước lượng đúng.\n",
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bốn cái bẫy quanh hai đường cong',
          md: '**1. `auc(recall, precision)` thay cho `average_precision_score`.** Đường PR không đơn điệu và nội suy tuyến tính giữa hai điểm của nó là sai về mặt hình học, cho ra con số cao hơn thực tế. Average precision cộng theo bậc thang: AP = tổng của (R_n − R_{n−1}) × P_n.\n\n**2. So PR-AUC giữa hai tập dữ liệu khác tỉ lệ lớp.** Vô nghĩa, như đã thấy ở checkpoint. Muốn so thì phải chuẩn hoá theo mức tham chiếu hoặc so trên cùng tập.\n\n**3. Báo cáo AUC mà không báo số mẫu dương.** Với 40 mẫu dương, khoảng tin cậy 95% của PR-AUC có thể rộng tới ±0,15. Con số 0,42 và 0,55 lúc đó không khác nhau. Hãy bootstrap 1.000 lần và báo cáo khoảng, không báo một con số.\n\n**4. Coi AUC là mục tiêu tối ưu cuối cùng.** AUC là chỉ số **toàn ngưỡng**. Bạn không triển khai toàn ngưỡng — bạn triển khai một ngưỡng. Hai mô hình cùng AUC có thể cho trải nghiệm hoàn toàn khác nhau ở vùng điểm cao, là vùng duy nhất bạn dùng.',
        },
        { t: 'h', text: 'Vậy dùng cái nào?', level: 2 },
        {
          t: 'compare',
          title: 'Chọn lăng kính theo câu hỏi bạn đang hỏi',
          left: {
            title: '📈 Dùng ROC-AUC khi…',
            items: [
              'So sánh khả năng xếp hạng của nhiều mô hình trên cùng bài toán',
              'Muốn một con số không phụ thuộc tỉ lệ lớp của tập đánh giá',
              'So kết quả của mình với bài báo hoặc benchmark ngoài',
              'Theo dõi suy giảm chất lượng xếp hạng theo thời gian (drift)',
              'Không dùng để: dự đoán trải nghiệm của analyst',
            ],
          },
          right: {
            title: '📉 Dùng PR-AUC / average precision khi…',
            items: [
              'Lớp dương hiếm và bạn quan tâm chất lượng của những cảnh báo thực sự phát ra',
              'Cần chọn giữa hai mô hình cho một hệ thống sắp triển khai thật',
              'Báo cáo cho người vận hành: nó tương quan với precision họ sẽ thấy',
              'Kèm theo tỉ lệ lớp dương của tập đánh giá, luôn luôn',
              'Không dùng để: so sánh giữa các tập dữ liệu khác tỉ lệ lớp',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Chỉ số mà người làm nghề thật sự báo cáo',
          md: 'Trong sản phẩm bảo mật, chỉ số được dùng để ký kết hợp đồng thường không phải AUC mà là **TPR tại một mức FPR cố định** — ví dụ “tỉ lệ phát hiện tại FPR 0,1%” hoặc “tại 1 báo động giả trên 1 triệu”. Bộ dữ liệu mã độc EMBER (Anderson & Roth, 2018) chuẩn hoá đúng cách báo cáo này.\n\nLý do rất thực dụng: mức FPR đó dịch thẳng thành số cảnh báo mỗi ngày, tức thành ngân sách. Hãy quen với việc báo cáo bộ ba: **TPR tại FPR mục tiêu + số cảnh báo tuyệt đối mỗi ngày + khoảng tin cậy**. Ba con số này khiến người nghe ra được quyết định; một chữ số AUC thì không.',
        },
        { t: 'terms', ids: ['roc-auc', 'pr-auc', 'precision', 'recall', 'nguong', 'mat-can-bang'] },
      ],
      keyTakeaways: [
        'Mỗi điểm trên ROC hoặc PR là một ngưỡng, tức một ma trận nhầm lẫn; đường cong chỉ là bảng ngưỡng vẽ ra hết.',
        'ROC-AUC = xác suất một mẫu dương ngẫu nhiên được chấm điểm cao hơn một mẫu âm ngẫu nhiên; nó nói về thứ tự, không nói về ngưỡng hay xác suất.',
        'ROC bất biến với tỉ lệ lớp nên nó vẫn đẹp khi hệ thống không dùng được; vùng hoạt động khả thi thường chỉ chiếm một sợi chỉ sát trục tung.',
        'Mức tham chiếu của PR là tỉ lệ lớp dương chứ không phải 0,5; luôn báo cáo PR-AUC kèm tỉ lệ đó.',
        'PR-AUC không so sánh được giữa hai tập dữ liệu có tỉ lệ lớp khác nhau; ROC-AUC thì được.',
        'Chỉ số dùng được nhất trong thực tế là TPR tại FPR cố định, kèm số cảnh báo tuyệt đối mỗi ngày và khoảng tin cậy.',
      ],
      cards: [
        {
          id: 't4l3-c1',
          front: 'Phát biểu ý nghĩa xác suất của ROC-AUC.',
          back: 'Xác suất để một mẫu dương lấy ngẫu nhiên được mô hình chấm điểm cao hơn một mẫu âm lấy ngẫu nhiên. Nó chỉ nói về thứ tự xếp hạng.',
          tags: ['roc-auc'],
        },
        {
          id: 't4l3-c2',
          front: 'Mức tham chiếu (đoán mò) của đường PR bằng bao nhiêu?',
          back: 'Bằng tỉ lệ lớp dương trong tập dữ liệu. Ví dụ 100 tấn công trên 1 triệu sự kiện thì mức tham chiếu là 0,0001, không phải 0,5.',
          tags: ['pr-auc', 'base-rate'],
        },
        {
          id: 't4l3-c3',
          front: 'Vì sao ROC-AUC vẫn cao khi hệ thống hoàn toàn không dùng được trong thực tế?',
          back: 'Vì FPR có mẫu số là toàn bộ mẫu âm (hàng triệu), nên FPR 1% nghe nhỏ nhưng là 10.000 cảnh báo giả. Vùng FPR khả thi thực tế chỉ chiếm một phần vạn chiều rộng đồ thị.',
          tags: ['roc-auc', 'mat-can-bang'],
        },
        {
          id: 't4l3-c4',
          front: 'Vì sao không được dùng auc(recall, precision) để tính PR-AUC?',
          back: 'Vì nó nội suy tuyến tính giữa các điểm của đường PR, cho kết quả lạc quan giả. Dùng average_precision_score, vốn cộng theo bậc thang.',
          tags: ['pr-auc'],
        },
        {
          id: 't4l3-c5',
          front: 'Chỉ số nào được dùng để ký hợp đồng trong sản phẩm phát hiện mã độc, thay cho AUC?',
          back: 'TPR (tỉ lệ phát hiện) tại một mức FPR cố định, ví dụ FPR 0,1%, vì mức đó quy thẳng ra số cảnh báo mỗi ngày và ngân sách.',
          tags: ['do-luong', 'thuc-chien'],
        },
      ],
      quiz: [
        {
          id: 't4-l3-q1',
          kind: 'mcq',
          tags: ['roc-auc', 'pr-auc'],
          q: 'Hai mô hình phát hiện xâm nhập: A có ROC-AUC 0,991 và PR-AUC 0,08; B có ROC-AUC 0,974 và PR-AUC 0,31. Tập đánh giá có tỉ lệ dương 1/20.000. Chọn mô hình nào để triển khai?',
          options: [
            'A, vì ROC-AUC cao hơn và đó là chỉ số chuẩn của ngành',
            'B, vì với lớp cực hiếm thì PR-AUC phản ánh đúng chất lượng cảnh báo mà analyst sẽ nhận',
            'Không đủ dữ liệu, phải xem accuracy của cả hai',
            'A, vì chênh lệch PR-AUC nhỏ hơn chênh lệch ROC-AUC về giá trị tuyệt đối',
          ],
          answer: 1,
          why: 'Với tỉ lệ dương 1/20.000, PR-AUC 0,31 so với 0,08 là khác biệt gần **bốn lần** về chất lượng hàng đợi cảnh báo — nghĩa là gần bốn lần khác biệt về số giờ analyst bị đốt cho rác. Chênh lệch ROC-AUC 0,991 với 0,974 nghe lớn nhưng nó tích luỹ chủ yếu ở vùng FPR cao mà bạn sẽ không bao giờ vận hành. Lưu ý cách nói đúng: không phải “PR-AUC luôn tốt hơn ROC-AUC”, mà là “khi lớp dương cực hiếm và bạn sắp triển khai thật, PR-AUC gần với thứ bạn quan tâm hơn”.',
          distractorWhy: [
            'ROC-AUC cao chủ yếu phản ánh vùng FPR không khả thi khi lớp dương cực hiếm.',
            '',
            'Accuracy còn vô dụng hơn trong bối cảnh này; hai chỉ số đã cho là đủ để quyết định.',
            'So sánh chênh lệch tuyệt đối giữa hai thang đo khác nhau là vô nghĩa; phải so theo mức tham chiếu của từng thang.',
          ],
        },
        {
          id: 't4-l3-q2',
          kind: 'input',
          tags: ['roc-auc', 'precision'],
          q: 'Tập đánh giá có 2.000.000 mẫu âm và 200 mẫu dương. Mô hình chạy tại FPR = 0,05% và TPR = 0,80. Precision bằng bao nhiêu phần trăm? (Làm tròn tới một chữ số thập phân)',
          accept: ['13,8', '13.8', '13,8%', '13.8%', '14', '13,79', '13.79'],
          placeholder: 'Nhập precision theo phần trăm…',
          hint: 'FP = 2.000.000 × 0,0005. TP = 200 × 0,80.',
          why: 'FP = 2.000.000 × 0,0005 = **1.000**. TP = 200 × 0,80 = **160**. Precision = 160/1.160 ≈ **13,8%**. Bài tập này rèn đúng một phản xạ: khi nghe một cặp (TPR, FPR), hãy nhân FPR với số mẫu âm để ra số cảnh báo giả tuyệt đối, rồi mới nói được hệ thống có sống nổi không. Ở đây là 1.160 cảnh báo mỗi ngày và khoảng 232 giờ analyst — vẫn quá tải với hầu hết đội SOC, dù ROC nhìn rất đẹp.',
        },
        {
          id: 't4-l3-q3',
          kind: 'multi',
          tags: ['roc-auc', 'pr-auc', 'do-luong'],
          q: 'Nhận định nào về ROC và PR là đúng? (Chọn tất cả đáp án đúng)',
          options: [
            'ROC-AUC không thay đổi khi tỉ lệ lớp dương của tập đánh giá thay đổi',
            'Mỗi điểm trên đường ROC ứng với một ngưỡng cắt cụ thể',
            'PR-AUC có thể so sánh trực tiếp giữa hai tổ chức có tỉ lệ tấn công khác nhau',
            'Với số mẫu dương nhỏ, ước lượng PR-AUC có phương sai rất lớn nên cần khoảng tin cậy',
          ],
          answers: [0, 1, 3],
          why: 'Ý 3 sai: PR-AUC dịch theo tỉ lệ lớp dương, nên cùng một mô hình sẽ cho PR-AUC khác nhau ở hai tổ chức chỉ vì tỉ lệ tấn công khác nhau — so trực tiếp là so nhầm. Ba ý còn lại đều đúng và đều là hệ quả trực tiếp từ định nghĩa: ROC dùng hai tỉ lệ trong nội bộ từng lớp nên bất biến; đường cong sinh ra bằng cách trượt ngưỡng; và mọi ước lượng dựa trên vài chục mẫu dương đều có sai số lớn, nên báo cáo một con số lẻ tới bốn chữ số thập phân là tự đánh lừa mình.',
        },
        {
          id: 't4-l3-q4',
          kind: 'order',
          tags: ['do-luong', 'quy-trinh'],
          q: 'Sắp xếp quy trình đánh giá một mô hình phát hiện theo thứ tự đúng.',
          items: [
            'Xác định tỉ lệ lớp dương của tập đánh giá và ghi nó vào báo cáo',
            'Tính ROC-AUC và PR-AUC kèm khoảng tin cậy bootstrap',
            'Xác định mức FPR hoặc số cảnh báo mỗi ngày mà tổ chức chịu được',
            'Đọc TPR và precision tại đúng điểm hoạt động đó',
            'Quy ra giờ analyst và số vụ bỏ lọt để ra quyết định',
          ],
          why: 'Thứ tự này đi từ bối cảnh tới quyết định. Không biết tỉ lệ lớp dương thì PR-AUC không diễn giải được. Chỉ số toàn ngưỡng có ích để so mô hình nhưng không quyết định được gì, nên nó đứng trước chứ không đứng cuối. Bước quan trọng nhất là bước 3 — nó biến ràng buộc của tổ chức thành một điểm cụ thể trên đường cong, và toàn bộ bài t4-l4 dành để làm bước đó cho tử tế.',
        },
        {
          id: 't4-l3-q5',
          kind: 'truefalse',
          tags: ['roc-auc'],
          q: 'Một mô hình có ROC-AUC 0,999 chắc chắn tạo ra ít cảnh báo giả khi triển khai.',
          answer: false,
          why: 'ROC-AUC không nói gì về số cảnh báo tuyệt đối, vì nó không nói gì về ngưỡng. Với 10 triệu sự kiện lành mỗi ngày, ngay cả FPR 0,01% cũng là 1.000 cảnh báo giả — mà FPR 0,01% hoàn toàn tương thích với AUC 0,999. Muốn biết số cảnh báo, bạn cần ba thứ mà AUC không chứa: ngưỡng đã chọn, số mẫu âm mỗi ngày, và phân bố điểm của mẫu âm ở vùng điểm cao.',
        },
      ],
      terms: ['roc-auc', 'pr-auc', 'precision', 'recall', 'nguong', 'mat-can-bang'],
      further: [
        {
          title: 'The Relationship Between Precision-Recall and ROC Curves — Davis & Goadrich (2006)',
          note: 'Bài báo gốc chứng minh vì sao một điểm chi phối trên ROC cũng chi phối trên PR, và vì sao nội suy tuyến tính trên PR là sai.',
        },
        {
          title: 'EMBER: An Open Dataset for Training Static PE Malware ML Models — Anderson & Roth (2018)',
          note: 'Đọc phần đánh giá để thấy cách ngành báo cáo tỉ lệ phát hiện tại mức FPR cố định thay vì chỉ AUC.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't4-l4',
      trackId: 'do-luong',
      title: 'Chọn ngưỡng theo chi phí, không theo 0,5',
      subtitle: 'Nơi chỉ số biến thành quyết định, và là bài quan trọng nhất của cả chặng',
      minutes: 22,
      level: 'trung-cap',
      prereqs: ['t4-l3'],
      why: {
        short:
          'Ngưỡng 0,5 là giá trị mặc định của một hàm thư viện, không phải một lựa chọn kỹ thuật; thay nó bằng một con số tính từ chi phí thật thường cải thiện giá trị hệ thống nhiều hơn cả việc đổi thuật toán.',
        scenario:
          'Mô hình phishing của bạn đã chạy 3 tháng ở ngưỡng mặc định 0,5, sinh 260 cảnh báo mỗi ngày. Giám đốc an ninh hỏi: “nên siết hay nới, và dựa vào cái gì mà nói vậy?” Bạn cần trả lời bằng một bảng chi phí, không bằng cảm tính.',
        roles: ['Detection Engineer', 'Security Data Scientist', 'Security Architect', 'SOC Analyst'],
        costOfNotKnowing:
          'Bạn để mặc định 0,5, đội SOC ngập trong cảnh báo hoặc bỏ lọt hàng loạt, và không ai trong tổ chức biết con số đó từ đâu ra — nên cũng không ai dám sửa.',
      },
      objectives: [
        'Lập được ma trận chi phí bốn ô cho một bài toán phát hiện cụ thể',
        'Tính chi phí kỳ vọng tại mỗi ngưỡng và tìm ngưỡng tối ưu bằng quét thực nghiệm',
        'Áp dụng công thức ngưỡng lý thuyết và nêu được điều kiện để nó đúng',
        'Chuyển từ ngưỡng tối ưu về ngưỡng khả thi dưới ràng buộc công suất top-k của đội SOC',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bạn có mô hình phishing chạy trên 100.000 email mỗi ngày. Một báo động giả tốn 12 phút của analyst; tính đủ chi phí nhân sự thì khoảng 12 USD. Một email lừa đảo lọt lưới có 3% khả năng dẫn tới sự cố nghiêm trọng, thiệt hại trung bình 150.000 USD. Theo bạn, ngưỡng nên đặt ở đâu: cao hơn hay thấp hơn 0,5? Và bạn sẵn sàng chịu bao nhiêu báo động giả để bắt thêm một email lừa đảo?',
          reveal:
            'Chi phí kỳ vọng của một vụ bỏ sót: 0,03 × 150.000 = **4.500 USD**. Chi phí một báo động giả: **12 USD**.\n\nTỉ lệ 4.500 / 12 = **375**. Nghĩa là bạn nên sẵn sàng chịu tới **375 báo động giả** để bắt thêm một email lừa đảo. Con số đó khiến hầu hết mọi người giật mình — trực giác thông thường dừng ở khoảng 5 tới 10.\n\nVậy ngưỡng phải **thấp hơn 0,5 rất nhiều**. Nhưng đây mới là nửa câu chuyện: ở ngưỡng thấp như vậy, mô hình có thể sinh 30.000 cảnh báo mỗi ngày, trong khi đội bạn xử lý nổi 120. Bài học này là về việc dung hoà hai sự thật đó — và câu trả lời cuối cùng không phải một con số mà là một kiến trúc.',
        },
        { t: 'h', text: 'Con số 0,5 đến từ đâu (và vì sao nó gần như luôn sai)', level: 2 },
        {
          t: 'p',
          md: 'Khi bạn gọi `model.predict(X)`, scikit-learn cắt tại 0,5. Đó là ngưỡng tối ưu **chỉ khi** hai điều kiện cùng đúng: (1) sai lầm dương và sai lầm âm tốn kém như nhau, và (2) điểm số của mô hình là xác suất đã hiệu chuẩn. Trong bảo mật, điều kiện (1) sai theo hệ số hàng trăm, còn điều kiện (2) thường sai luôn.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Ngưỡng không phải tham số của mô hình',
          md: 'Ngưỡng là **quyết định kinh doanh** áp lên đầu ra của mô hình. Nó không cần huấn luyện lại gì cả, đổi nó tốn 5 giây, và nó thường tạo ra thay đổi lớn hơn việc đổi từ hồi quy logistic sang LightGBM.\n\nHệ quả tổ chức: ngưỡng nên nằm trong cấu hình, có người chủ sở hữu, có lịch xem lại, và có ghi chép lý do. Một ngưỡng “không ai biết vì sao lại là 0,5” là món nợ kỹ thuật im lặng nhất trong mọi hệ thống phát hiện.',
        },
        { t: 'h', text: 'Bước 1 — Lập ma trận chi phí', level: 2 },
        {
          t: 'table',
          head: ['Ô', 'Chi phí', 'Cách ước lượng trong thực tế'],
          rows: [
            ['TN — bỏ qua đúng', '0', 'Mốc quy chiếu. Mọi chi phí khác đo tương đối so với ô này.'],
            ['FP — báo động giả', '12 USD', 'Thời gian xử lý trung bình (12 phút) × chi phí gánh đủ mỗi giờ của analyst (60 USD/giờ). Lấy từ số liệu ticket thật, đừng đoán.'],
            ['FN — bỏ sót', '4.500 USD', 'Xác suất leo thang (3%) × thiệt hại trung bình khi leo thang (150.000 USD). Lấy từ lịch sử sự cố hoặc từ mô hình rủi ro của đội GRC.'],
            ['TP — bắt trúng', '12 USD (chi phí điều tra)', 'Cũng tốn thời gian analyst như FP. Nhiều đội đặt bằng 0 để đơn giản hoá; điều đó chỉ làm dịch ngưỡng chút ít.'],
          ],
          caption: 'Ma trận chi phí cho bài toán phishing. Ba trong bốn ô lấy được từ dữ liệu bạn đã có: log ticket và lịch sử sự cố.',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Con số 4.500 USD kia đáng tin tới đâu?',
          md: 'Không đáng tin lắm — và điều đó vẫn ổn. Ước lượng chi phí bỏ sót luôn có sai số lớn vì nó là tích của một xác suất nhỏ với một thiệt hại lớn.\n\nCách xử lý đúng: **phân tích độ nhạy**. Tính ngưỡng tối ưu với C_FN = 1.500, 4.500 và 15.000 USD. Nếu cả ba cho ngưỡng gần nhau, bạn yên tâm. Nếu chúng cho ba ngưỡng rất khác nhau, thì đây chính là cuộc thảo luận mà tổ chức bạn **cần** phải có — và bài này vừa buộc nó xảy ra. Giá trị lớn nhất của ma trận chi phí không phải con số đầu ra, mà là nó biến giả định ngầm thành giả định viết ra giấy.',
        },
        { t: 'h', text: 'Bước 2 — Chi phí kỳ vọng tại mỗi ngưỡng', level: 2 },
        {
          t: 'p',
          md: 'Công thức đơn giản đến mức đáng ngờ: **Chi phí(t) = FP(t) × C_FP + FN(t) × C_FN**. Quét t qua mọi giá trị, chọn t nhỏ nhất. Áp vào bảng ngưỡng của bài t4-l2:',
        },
        {
          t: 'table',
          head: ['Ngưỡng', 'Cảnh báo/ngày', 'FP', 'FN', 'Chi phí FP (USD)', 'Chi phí FN (USD)', 'Tổng/ngày'],
          rows: [
            ['0,10', '2.100', '2.061', '1', '24.732', '4.500', '29.232'],
            ['0,30', '640', '603', '3', '7.236', '13.500', '**20.736**'],
            ['0,50', '260', '228', '8', '2.736', '36.000', '38.736'],
            ['0,70', '95', '69', '14', '828', '63.000', '63.828'],
            ['0,90', '28', '11', '23', '132', '103.500', '103.632'],
            ['0,97', '9', '1', '32', '12', '144.000', '144.012'],
          ],
          caption: 'Ngưỡng mặc định 0,5 đắt gần gấp đôi ngưỡng tối ưu 0,30. Chênh lệch 18.000 USD mỗi ngày — khoảng 6,5 triệu USD mỗi năm — chỉ vì một con số mặc định không ai xem lại.',
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Ngưỡng lý thuyết, và điều kiện để dùng được',
          md: 'Nếu điểm số `p` là **xác suất đã hiệu chuẩn**, ta cảnh báo khi lợi ích kỳ vọng dương:\n\n`p × C_FN > (1 − p) × C_FP`\n\nGiải ra: **t\\* = C_FP / (C_FP + C_FN)**.\n\nVới các con số trên: t\\* = 12 / (12 + 4.500) = **0,00266**. Tức khoảng 0,27% — xa vô cùng so với 0,5.\n\nNhưng bảng quét thực nghiệm lại cho tối ưu ở 0,30. Mâu thuẫn? Không. **Điểm số của mô hình chưa hiệu chuẩn không phải là xác suất.** Một điểm 0,30 của LightGBM có thể tương ứng với xác suất thật 0,003. Đó chính là lý do bài t4-l6 tồn tại: hiệu chuẩn xong thì công thức trên dùng được trực tiếp, và bạn không phải quét lại mỗi lần chi phí thay đổi.\n\nQuy tắc thực hành: **chưa hiệu chuẩn thì quét thực nghiệm; đã hiệu chuẩn thì dùng công thức.**',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't4l4-cp1',
              kind: 'mcq',
              tags: ['nguong', 'chi-phi'],
              q: 'Chi phí một báo động giả là 20 USD, chi phí kỳ vọng của một vụ bỏ sót là 980 USD. Với một mô hình đã hiệu chuẩn tốt, ngưỡng tối ưu xấp xỉ bao nhiêu?',
              options: ['0,50', '0,02', '0,20', '0,98'],
              answer: 1,
              why: 't\\* = C_FP / (C_FP + C_FN) = 20 / (20 + 980) = **0,02**. Trực giác kiểm chứng: bỏ sót đắt gấp 49 lần báo động giả, nên bạn nên cảnh báo ngay cả khi chỉ tin 2% rằng đó là tấn công — vì kỳ vọng vẫn có lợi. Chú ý cấu trúc công thức: **ngưỡng tỉ lệ nghịch với mức độ đắt đỏ của việc bỏ sót**. Chi phí bỏ sót càng lớn, ngưỡng càng thấp, càng nhiều cảnh báo.',
              distractorWhy: [
                '0,5 chỉ đúng khi hai loại sai lầm tốn kém như nhau — ở đây chênh nhau 49 lần.',
                '',
                'Đây là kết quả nếu lấy nhầm 20/100; công thức đúng dùng mẫu số là tổng hai chi phí.',
                'Đây là ngưỡng đảo ngược: nó ứng với trường hợp báo động giả đắt gấp 49 lần bỏ sót.',
              ],
            },
            {
              id: 't4l4-cp2',
              kind: 'truefalse',
              tags: ['nguong', 'ro-ri-du-lieu'],
              q: 'Nên chọn ngưỡng bằng cách quét trên tập kiểm tra để lấy chi phí thấp nhất có thể.',
              answer: false,
              why: 'Ngưỡng là một siêu tham số, và chọn nó trên tập kiểm tra chính là tối ưu vào tập kiểm tra — đúng dạng rò rỉ chậm đã học ở t2-l6. Con số chi phí bạn báo cáo sẽ lạc quan hơn thực tế. Quy trình đúng: chọn ngưỡng trên **tập kiểm định**, rồi báo cáo chi phí trên tập kiểm tra **một lần duy nhất** với ngưỡng đã cố định. Trong bảo mật còn nên kiểm chứng thêm: tập kiểm định phải ở thời kỳ gần nhất, vì phân bố điểm số trôi theo thời gian và ngưỡng trôi theo nó.',
            },
          ],
        },
        { t: 'h', text: 'Bước 3 — Va vào bức tường công suất', level: 2 },
        {
          t: 'p',
          md: 'Bảng trên nói ngưỡng tối ưu là 0,30 với **640 cảnh báo mỗi ngày**. Đội SOC của bạn có 2 analyst mỗi ca, 3 ca, mỗi người xử lý được khoảng 20 cảnh báo mỗi ca sau khi trừ họp hành và các việc khác — tổng công suất khoảng **120 cảnh báo mỗi ngày**. Bạn không có 640.',
        },
        {
          t: 'steps',
          title: 'Từ ngưỡng tối ưu tới ngưỡng khả thi',
          steps: [
            {
              title: 'Bước 3.1 — Tính ngưỡng theo công suất (top-k)',
              md: 'Đảo ngược bài toán: thay vì hỏi “ngưỡng nào”, hãy hỏi “**k cảnh báo cao điểm nhất mỗi ngày là bao nhiêu**”. Với k = 120, ngưỡng tương ứng trên bảng nằm khoảng **0,66**. Cách tính: sắp xếp điểm của một ngày rồi lấy điểm của mẫu thứ k.\n\nƯu điểm lớn: ngưỡng top-k **tự thích nghi với trôi dữ liệu**. Nếu ngày mai phân bố điểm dịch lên, ngưỡng tuyệt đối 0,66 sẽ đẻ ra 900 cảnh báo, còn ngưỡng top-120 vẫn cho đúng 120.',
            },
            {
              title: 'Bước 3.2 — Định giá khoảng cách',
              md: 'Tại ngưỡng khả thi 0,66: FP ≈ 92, FN ≈ 12 → chi phí ≈ 92 × 12 + 12 × 4.500 = **55.104 USD/ngày**.\n\nTại ngưỡng tối ưu 0,30: **20.736 USD/ngày**.\n\nKhoảng cách: **34.368 USD mỗi ngày** — đây không phải con số trừu tượng, đây là **giá trị kinh doanh của việc mở rộng công suất xử lý**. Bạn vừa biến một lời than “đội em thiếu người” thành một luận điểm tài chính.',
            },
            {
              title: 'Bước 3.3 — Định giá một giờ analyst',
              md: 'Mở rộng từ 120 lên 640 cảnh báo cần thêm khoảng 520 cảnh báo × 12 phút = **104 giờ analyst mỗi ngày**, tức khoảng 13 ca. Lợi ích: 34.368 USD/ngày. Chia ra: mỗi giờ analyst tăng thêm mang lại khoảng **330 USD** giá trị kỳ vọng, so với chi phí 60 USD.\n\nKết luận: hoặc tuyển thêm, hoặc — rẻ hơn nhiều — **giảm 12 phút mỗi cảnh báo** bằng làm giàu ngữ cảnh tự động và gom nhóm. Bài t4-l7 đi sâu vào hướng thứ hai.',
            },
            {
              title: 'Bước 3.4 — Chia ba vùng thay vì một ngưỡng',
              md: 'Câu trả lời trưởng thành không phải một ngưỡng mà là một **chính sách ba vùng**:\n\n- Điểm ≥ 0,97 (precision ~89%): **hành động tự động** — cách ly email, gắn cờ đỏ. Khoảng 9 email/ngày.\n- 0,66 ≤ điểm < 0,97: **vào hàng đợi analyst**. Khoảng 111 email/ngày.\n- 0,30 ≤ điểm < 0,66: **không cảnh báo, nhưng ghi lại và lấy mẫu**. Mỗi tuần threat hunting lấy ngẫu nhiên 50 mẫu trong vùng này để ước lượng FN — đây là cách duy nhất nhìn thấy ô mà bảng điều khiển không hiện.\n- Điểm < 0,30: bỏ qua.\n\nKiến trúc này lấy được phần lớn giá trị của ngưỡng thấp mà không phá vỡ công suất.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Quét ngưỡng theo chi phí, và ngưỡng theo công suất top-k',
          code:
            "import numpy as np\n" +
            "from sklearn.metrics import confusion_matrix\n" +
            "\n" +
            "C_FP, C_FN = 12.0, 4500.0     # USD; lấy từ log ticket và lịch sử sự cố\n" +
            "\n" +
            "def chi_phi(y, diem, t):\n" +
            "    tn, fp, fn, tp = confusion_matrix(y, (diem >= t).astype(int), labels=[0, 1]).ravel()\n" +
            "    return fp * C_FP + fn * C_FN, fp, fn, tp\n" +
            "\n" +
            "# Quét trên TẬP KIỂM ĐỊNH, không phải tập kiểm tra.\n" +
            "# Dùng phân vị của chính điểm số để lưới ngưỡng bám sát vùng có dữ liệu.\n" +
            "luoi = np.unique(np.quantile(diem_val, np.linspace(0, 1, 501)))\n" +
            "bang = [(t, *chi_phi(y_val, diem_val, t)) for t in luoi]\n" +
            "t_toi_uu = min(bang, key=lambda r: r[1])[0]\n" +
            "print('Ngưỡng chi phí tối thiểu:', round(float(t_toi_uu), 4))\n" +
            "\n" +
            "# Ràng buộc công suất: mỗi ngày đội chỉ tiêu hoá nổi k cảnh báo\n" +
            "k_moi_ngay = 120\n" +
            "so_ngay = 30\n" +
            "k = k_moi_ngay * so_ngay\n" +
            "t_cong_suat = np.partition(diem_val, -k)[-k]   # điểm của mẫu xếp thứ k từ trên xuống\n" +
            "print('Ngưỡng theo công suất top-k:', round(float(t_cong_suat), 4))\n" +
            "\n" +
            "# Ngưỡng triển khai = cái nào CAO hơn. Và ghi lại khoảng cách chi phí:\n" +
            "# đó chính là luận điểm tài chính để xin thêm người hoặc thêm tự động hoá.\n" +
            "print('Ngưỡng triển khai:', round(float(max(t_toi_uu, t_cong_suat)), 4))\n",
        },
        {
          t: 'lab',
          id: 'lab-cost-threshold',
          intro: 'Chỉnh C_FP, C_FN và công suất đội SOC, xem đường chi phí kỳ vọng dịch chuyển và điểm tối ưu chạy đi đâu. Thử đặt C_FN gấp 10 lần và quan sát ngưỡng.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Năm sai lầm khi đặt ngưỡng',
          md: '**1. Để nguyên 0,5.** Sai lầm phổ biến nhất, và tốn kém nhất, vì nó vô hình.\n\n**2. Chọn ngưỡng trên tập kiểm tra.** Rò rỉ chậm; con số báo cáo sẽ lạc quan.\n\n**3. Đặt xong rồi quên.** Phân bố điểm trôi theo thời gian — lưu lượng đổi, hạ tầng đổi, kẻ tấn công đổi. Ngưỡng tuyệt đối hôm nay cho 120 cảnh báo, sáu tháng sau có thể cho 900. Hãy đặt cảnh báo khi số cảnh báo mỗi ngày lệch quá 30% so với mức thiết kế.\n\n**4. Một ngưỡng cho mọi bối cảnh.** Máy chủ trong vùng chứa dữ liệu thẻ và máy in ở tầng 3 không đáng cùng một ngưỡng. C_FN khác nhau thì ngưỡng phải khác nhau — chia theo nhóm tài sản là cách nâng precision rẻ nhất tồn tại.\n\n**5. Chọn ngưỡng trước khi hỏi công suất.** Ngưỡng tối ưu về chi phí mà đội không xử lý nổi thì thực tế là ngưỡng vô hạn: cảnh báo không ai đọc bằng không có cảnh báo.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Ngưỡng phân vị thay cho ngưỡng tuyệt đối',
          md: 'Trong hệ thống chạy thật, hãy cấu hình “top 0,1% điểm cao nhất trong 24 giờ qua” thay vì “điểm ≥ 0,66”. Ba lợi ích: khối lượng cảnh báo ổn định theo ngày, tự miễn nhiễm với trôi thang điểm sau mỗi lần huấn luyện lại, và đội vận hành dự đoán được tải.\n\nĐánh đổi cần biết: khi thực sự có chiến dịch tấn công lớn, ngưỡng phân vị sẽ tự siết lại và có thể cắt mất phần đuôi của chính chiến dịch đó. Cách vá: kết hợp sàn tuyệt đối — “top 0,1% **hoặc** điểm ≥ 0,95, lấy hợp của hai tập”.',
        },
        { t: 'terms', ids: ['nguong', 'bao-dong-gia', 'bo-sot', 'hieu-chuan', 'alert-fatigue'] },
      ],
      keyTakeaways: [
        'Ngưỡng 0,5 chỉ tối ưu khi hai loại sai lầm tốn kém như nhau và điểm số đã hiệu chuẩn — cả hai điều kiện đều sai trong bảo mật.',
        'Ma trận chi phí bốn ô lấy được từ dữ liệu bạn đã có: log ticket cho C_FP, lịch sử sự cố cho C_FN.',
        'Chi phí kỳ vọng = FP × C_FP + FN × C_FN; quét ngưỡng trên tập kiểm định và chọn điểm cực tiểu.',
        'Với điểm đã hiệu chuẩn, ngưỡng tối ưu là t* = C_FP / (C_FP + C_FN); chưa hiệu chuẩn thì phải quét thực nghiệm.',
        'Ràng buộc công suất thường mạnh hơn ràng buộc chi phí: ngưỡng triển khai là cái cao hơn giữa ngưỡng tối ưu và ngưỡng top-k.',
        'Khoảng cách giữa chi phí tại ngưỡng khả thi và tại ngưỡng tối ưu chính là giá trị tài chính của việc mở rộng công suất hoặc tự động hoá.',
        'Câu trả lời trưởng thành là chính sách ba vùng — tự động, hàng đợi, lấy mẫu — chứ không phải một con số.',
      ],
      cards: [
        {
          id: 't4l4-c1',
          front: 'Viết công thức ngưỡng tối ưu theo chi phí, và nêu điều kiện để dùng được.',
          back: 't* = C_FP / (C_FP + C_FN). Chỉ đúng khi điểm số của mô hình là xác suất đã hiệu chuẩn; nếu chưa, phải quét ngưỡng thực nghiệm.',
          tags: ['nguong', 'chi-phi'],
        },
        {
          id: 't4l4-c2',
          front: 'Vì sao ngưỡng 0,5 gần như luôn sai trong bảo mật?',
          back: 'Vì nó chỉ tối ưu khi FP và FN tốn kém như nhau và điểm đã hiệu chuẩn. Trong bảo mật chi phí lệch hàng trăm lần và điểm mô hình thường không phải xác suất.',
          tags: ['nguong'],
        },
        {
          id: 't4l4-c3',
          front: 'Ngưỡng top-k (theo công suất) là gì và ưu điểm lớn nhất của nó?',
          back: 'Mỗi ngày chỉ lấy k cảnh báo có điểm cao nhất, k bằng công suất xử lý của đội. Ưu điểm: khối lượng cảnh báo ổn định và tự thích nghi khi phân bố điểm trôi.',
          tags: ['nguong', 'alert-fatigue'],
        },
        {
          id: 't4l4-c4',
          front: 'Khoảng cách chi phí giữa ngưỡng tối ưu và ngưỡng khả thi theo công suất cho bạn biết điều gì?',
          back: 'Giá trị kinh tế của việc mở rộng công suất xử lý — dùng làm luận điểm tài chính để xin thêm người hoặc đầu tư tự động hoá phân loại.',
          tags: ['chi-phi', 'thuc-chien'],
        },
        {
          id: 't4l4-c5',
          front: 'Nêu chính sách ba vùng thay cho một ngưỡng duy nhất.',
          back: 'Vùng điểm rất cao: hành động tự động. Vùng giữa: đưa vào hàng đợi analyst. Vùng thấp hơn ngưỡng cảnh báo: không báo nhưng ghi lại và lấy mẫu định kỳ để ước lượng bỏ sót.',
          tags: ['nguong', 'thuc-chien'],
        },
      ],
      quiz: [
        {
          id: 't4-l4-q1',
          kind: 'mcq',
          tags: ['nguong', 'chi-phi'],
          q: 'Đội bạn quyết định C_FP = 25 USD và C_FN = 2.475 USD. Mô hình đã được hiệu chuẩn bằng isotonic regression. Ngưỡng nên đặt ở đâu?',
          options: ['0,50', '0,01', '0,10', '0,99'],
          answer: 1,
          why: 't\\* = 25 / (25 + 2.475) = 25/2.500 = **0,01**. Chi tiết quan trọng trong đề bài là cụm “đã được hiệu chuẩn” — chỉ khi đó điểm số mới là xác suất thật và công thức mới áp dụng trực tiếp được. Nếu mô hình chưa hiệu chuẩn, con số 0,01 trên thang điểm thô có thể tương ứng với một xác suất hoàn toàn khác, và bạn phải quét ngưỡng thực nghiệm trên tập kiểm định thay vì tin công thức.',
          distractorWhy: [
            'Mặc định 0,5 ứng với giả định hai loại sai lầm ngang giá — ở đây chúng lệch 99 lần.',
            '',
            'Đây là kết quả nếu lấy nhầm 25/250; mẫu số phải là tổng hai chi phí.',
            'Ngưỡng 0,99 ứng với trường hợp báo động giả đắt hơn bỏ sót rất nhiều — ngược hẳn đề bài.',
          ],
        },
        {
          id: 't4-l4-q2',
          kind: 'multi',
          tags: ['nguong', 'thuc-chien'],
          q: 'Đội SOC xử lý được 150 cảnh báo/ngày. Ngưỡng tối ưu theo chi phí sinh 900 cảnh báo/ngày. Hành động nào hợp lý? (Chọn tất cả đáp án đúng)',
          options: [
            'Đặt ngưỡng theo công suất top-150 và ghi lại khoảng cách chi phí làm luận điểm xin nguồn lực',
            'Cứ bật ngưỡng tối ưu, cảnh báo không xử lý kịp thì để tồn trong hàng đợi',
            'Gom nhóm cảnh báo trùng lặp để mỗi đơn vị công việc chứa nhiều cảnh báo hơn',
            'Chia ngưỡng theo nhóm tài sản: siết ở vùng ít quan trọng, nới ở vùng chứa dữ liệu nhạy cảm',
          ],
          answers: [0, 2, 3],
          why: 'Ý 2 là sai lầm kinh điển: hàng đợi tồn đọng không phải là “sẽ xử lý sau”, nó là **mù cảnh báo có tổ chức** — analyst bắt đầu bấm đóng hàng loạt và cảnh báo thật chết chìm cùng cảnh báo giả. Ba hành động còn lại đều đúng theo ba hướng khác nhau: chấp nhận ràng buộc nhưng biến nó thành số liệu (ý 1), tăng công suất hiệu dụng mà không tăng người (ý 3), và dùng chính C_FN khác nhau theo tài sản để phân bổ ngân sách cảnh báo hợp lý hơn (ý 4).',
        },
        {
          id: 't4-l4-q3',
          kind: 'truefalse',
          tags: ['nguong', 'troi-du-lieu'],
          q: 'Ngưỡng đã tính đúng một lần thì có thể để nguyên cho tới lần huấn luyện lại tiếp theo.',
          answer: false,
          why: 'Ngưỡng gắn với **phân bố điểm số**, mà phân bố điểm trôi ngay cả khi mô hình đứng yên: lưu lượng thay đổi theo mùa, hạ tầng mới được thêm vào, hành vi người dùng đổi, kẻ tấn công đổi chiến thuật. Một ngưỡng tuyệt đối cho 120 cảnh báo hôm nay có thể cho 900 sau sáu tháng — và không ai nhận ra cho tới khi đội SOC than phiền. Hai biện pháp chuẩn: giám sát số cảnh báo mỗi ngày như một chỉ số vận hành có cảnh báo riêng, và ưu tiên ngưỡng phân vị thay cho ngưỡng tuyệt đối.',
        },
        {
          id: 't4-l4-q4',
          kind: 'order',
          tags: ['nguong', 'quy-trinh'],
          q: 'Sắp xếp quy trình đặt ngưỡng cho một mô hình sắp triển khai.',
          items: [
            'Lập ma trận chi phí từ log ticket và lịch sử sự cố, kèm phân tích độ nhạy cho C_FN',
            'Quét ngưỡng trên tập kiểm định gần nhất về thời gian, tìm cực tiểu chi phí kỳ vọng',
            'Hỏi công suất thật của đội và tính ngưỡng top-k tương ứng',
            'Chọn ngưỡng triển khai là giá trị cao hơn giữa hai ngưỡng trên, chia thành chính sách ba vùng',
            'Báo cáo hiệu năng trên tập kiểm tra một lần với ngưỡng đã cố định, rồi đặt giám sát tải cảnh báo',
          ],
          why: 'Trình tự này bảo vệ bạn khỏi ba lỗi cùng lúc. Chi phí đứng trước vì không có nó thì không có gì để tối ưu. Quét trên tập kiểm định (không phải kiểm tra) tránh rò rỉ chậm. Hỏi công suất trước khi chốt ngưỡng tránh việc triển khai một cấu hình đúng trên giấy mà chết trong vận hành. Và bước cuối — giám sát tải — là bước duy nhất khiến ngưỡng không mục nát theo thời gian.',
        },
        {
          id: 't4-l4-q5',
          kind: 'input',
          tags: ['chi-phi', 'nguong'],
          q: 'Một báo động giả tốn 15 USD. Một vụ bỏ sót có 5% khả năng dẫn tới sự cố thiệt hại 60.000 USD. Bạn nên sẵn sàng chịu tối đa bao nhiêu báo động giả để bắt thêm một vụ thật? (Nhập số nguyên)',
          accept: ['200', '200 canh bao', '200 bao dong gia'],
          placeholder: 'Nhập số báo động giả…',
          hint: 'Trước hết tính chi phí kỳ vọng của một vụ bỏ sót, rồi chia cho chi phí một báo động giả.',
          why: 'C_FN = 0,05 × 60.000 = 3.000 USD. Tỉ lệ 3.000 / 15 = **200**. Nghĩa là chịu tới 200 báo động giả để bắt thêm một vụ vẫn có lợi về kỳ vọng. Con số này gần như luôn lớn hơn trực giác của mọi người trong phòng họp, và đó chính là giá trị của việc viết ma trận chi phí ra giấy. Nhưng nhớ nửa còn lại của bài học: “có lợi về kỳ vọng” không đồng nghĩa với “khả thi” — 200 báo động giả cho mỗi vụ thật vẫn có thể vượt xa công suất của đội, và khi đó bạn cần kiến trúc ba vùng chứ không phải một ngưỡng thấp.',
        },
      ],
      terms: ['nguong', 'bao-dong-gia', 'bo-sot', 'hieu-chuan', 'alert-fatigue', 'ro-ri-du-lieu'],
      further: [
        {
          title: 'The Foundations of Cost-Sensitive Learning — Charles Elkan (2001)',
          note: 'Nguồn gốc của công thức ngưỡng theo chi phí và của lập luận vì sao thay đổi ngưỡng thường tốt hơn thay đổi dữ liệu.',
        },
        {
          title: 'scikit-learn — TunedThresholdClassifierCV',
          note: 'Từ phiên bản 1.5, scikit-learn có sẵn công cụ dò ngưỡng theo một hàm lợi ích tuỳ chọn, gồm cả ma trận chi phí. Đọc ví dụ về cost-sensitive learning trong tài liệu.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't4-l5',
      trackId: 'do-luong',
      title: 'Xử lý mất cân bằng lớp',
      subtitle: 'Vì sao câu trả lời đầu tiên là đổi ngưỡng, và vì sao SMOTE thường phản tác dụng',
      minutes: 19,
      level: 'trung-cap',
      prereqs: ['t4-l4'],
      why: {
        short:
          'Mất cân bằng lớp là đặc điểm mặc định của mọi bài toán bảo mật, và cách xử lý phổ biến nhất trên mạng — lấy mẫu lại bằng SMOTE — thường làm mô hình tệ hơn theo cách không hiện ra trong bảng kết quả.',
        scenario:
          'Bạn có 4 triệu phiên đăng nhập, 800 phiên bị chiếm quyền — tỉ lệ 1 trên 5.000. Đồng nghiệp đề xuất dùng SMOTE để “cân bằng dữ liệu về 50/50”. Bạn cần giải thích trong hai phút vì sao đó là lựa chọn nên để cuối cùng, và nên làm gì trước.',
        roles: ['Security Data Scientist', 'ML Engineer', 'Detection Engineer'],
        costOfNotKnowing:
          'Bạn tốn ba tuần chạy SMOTE, thấy F1 trên tập đã cân bằng tăng vọt, triển khai, rồi số báo động giả tăng gấp ba và xác suất mô hình trả về không còn dùng được cho bất kỳ phép tính chi phí nào.',
      },
      objectives: [
        'Phân biệt được vấn đề nào do mất cân bằng gây ra thật và vấn đề nào chỉ do chọn sai chỉ số',
        'Xếp đúng thứ tự năm cách xử lý mất cân bằng theo tỉ lệ lợi ích trên rủi ro',
        'Nêu được bốn lý do kỹ thuật khiến SMOTE thường phản tác dụng trên dữ liệu bảo mật',
        'Hiệu chỉnh lại xác suất sau khi hạ mẫu lớp âm bằng công thức đúng',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bạn huấn luyện LightGBM trên 4.000.000 phiên đăng nhập với 800 phiên bị chiếm quyền (tỉ lệ 1:5.000). Mô hình dự đoán “bình thường” cho gần như mọi phiên và accuracy đạt 99,98%. Theo bạn, vấn đề nằm ở chỗ mô hình **không học được gì**, hay ở chỗ khác?',
          reveal:
            'Hầu như luôn là “ở chỗ khác”. Hãy kiểm tra bằng cách bỏ nhãn dự đoán đi và nhìn vào **điểm số**: sắp xếp 4 triệu phiên theo điểm giảm dần và xem 800 phiên xấu nằm ở đâu.\n\nTrong đa số trường hợp bạn sẽ thấy chúng tập trung mạnh ở phần đầu danh sách — tức là mô hình **đã học được rất nhiều**, PR-AUC hoàn toàn có thể ở mức 0,3 tới 0,6. Cái “hỏng” chỉ là bước cuối cùng: hàm `predict()` cắt tại 0,5, và với tỉ lệ nền 1:5.000 thì gần như không mẫu nào vượt qua 0,5.\n\nĐây là điểm mấu chốt của cả bài: **mất cân bằng chủ yếu là vấn đề của NGƯỠNG và của CHỈ SỐ, không phải vấn đề của dữ liệu.** Trước khi động vào dữ liệu, hãy sửa hai thứ miễn phí đó trước.',
        },
        {
          t: 'figure',
          id: 'fig-imbalance',
          caption: 'Cùng một mô hình, cùng một khả năng xếp hạng, ba tỉ lệ mất cân bằng khác nhau. Thứ thay đổi là vị trí của ngưỡng hợp lý, không phải chất lượng của mô hình.',
        },
        { t: 'h', text: 'Năm cách xử lý, xếp theo thứ tự nên thử', level: 2 },
        {
          t: 'table',
          head: ['Thứ tự', 'Cách làm', 'Đụng vào cái gì', 'Rủi ro', 'Khi nào dùng'],
          rows: [
            [
              '1',
              'Đổi chỉ số và đổi ngưỡng',
              'Không đụng gì cả — chỉ đổi cách đọc và điểm cắt',
              'Gần như bằng không',
              'Luôn luôn làm trước. Rất nhiều trường hợp dừng ở đây là đủ.',
            ],
            [
              '2',
              'class_weight / scale_pos_weight',
              'Hàm mất mát: mỗi mẫu dương được nhân trọng số',
              'Phá hiệu chuẩn (điểm số bị đẩy lên cao giả tạo)',
              'Khi mô hình học kém ở vùng biên vì lớp dương quá ít ảnh hưởng tới gradient',
            ],
            [
              '3',
              'Hạ mẫu lớp âm (undersampling)',
              'Vứt bớt dữ liệu âm',
              'Mất thông tin về đuôi phân phối lành tính; phá hiệu chuẩn (có công thức sửa)',
              'Chủ yếu vì lý do tính toán: 400 triệu dòng không vừa bộ nhớ',
            ],
            [
              '4',
              'Thêm dữ liệu dương thật',
              'Dữ liệu — theo hướng tốt',
              'Tốn công; cần weak supervision, mô phỏng tấn công, hoặc gán nhãn chủ động',
              'Đòn bẩy lớn nhất trong dài hạn. Gần như luôn đáng đầu tư hơn ba cách trên.',
            ],
            [
              '5',
              'Sinh mẫu tổng hợp (SMOTE và biến thể)',
              'Bịa ra dữ liệu dương chưa từng tồn tại',
              'Cao — xem phần dưới',
              'Hiếm. Chủ yếu khi đặc trưng liên tục, chiều thấp, và lớp dương thực sự đồng nhất.',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao đổi ngưỡng lại là lựa chọn đầu tiên',
          md: 'Các phép lấy mẫu lại và đánh trọng số **hầu như không làm thay đổi thứ tự xếp hạng** mà mô hình tạo ra — chúng chủ yếu dịch chuyển thang điểm. Mà nếu thứ tự không đổi thì ROC-AUC không đổi, PR-AUC gần như không đổi, và precision@k không đổi.\n\nNói cách khác: bạn bỏ ba tuần cân bằng dữ liệu để đạt được thứ mà một dòng `diem >= 0.004` cho bạn trong ba giây. Đây là kết luận đã được lặp lại nhiều lần trong các so sánh có kiểm soát trên dữ liệu dạng bảng, và nó khớp với lý thuyết chi phí ở bài trước: mất cân bằng dịch chuyển ngưỡng tối ưu, không phá huỷ khả năng phân biệt.',
        },
        { t: 'h', text: 'Vì sao SMOTE thường phản tác dụng trong bảo mật', level: 2 },
        {
          t: 'p',
          md: 'SMOTE (Chawla và cộng sự, 2002) sinh mẫu mới bằng cách **nội suy tuyến tính giữa một mẫu thiểu số và một trong các láng giềng gần nhất của nó**. Ý tưởng đẹp, và nó hoạt động tốt trong bối cảnh mà nó được thiết kế: đặc trưng liên tục, số chiều thấp, lớp thiểu số tạo thành một vùng liền mạch. Dữ liệu bảo mật vi phạm cả ba điều kiện.',
        },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Đặc trưng bảo mật không nội suy được.** Nội suy giữa `so_luong_import = 12` và `so_luong_import = 87` cho ra 49,5 — không tệ. Nhưng nội suy giữa `co_chu_ky_so = 1` và `co_chu_ky_so = 0` cho ra 0,5, tương ứng với **một tệp không tồn tại**. Với các đặc trưng nhị phân, đếm, và one-hot — tức phần lớn đặc trưng bảo mật — mẫu sinh ra nằm ngoài đa tạp dữ liệu thật.',
            '**Lớp dương không phải một cụm, mà là nhiều cụm rời nhau.** Ransomware, keylogger, cryptominer là ba vùng hoàn toàn khác nhau trong không gian đặc trưng. Nội suy giữa một mẫu ransomware và một mẫu cryptominer tạo ra một “con lai” không ứng với mã độc nào trên đời — và mô hình học một ranh giới đi qua vùng trống đó.',
            '**Không gian nhiều chiều thì đường nối hai điểm gần như luôn đi qua vùng rỗng.** Với vài trăm chiều, khoảng cách giữa mọi cặp điểm trở nên gần bằng nhau (lời nguyền số chiều), nên khái niệm “láng giềng gần nhất” mất ý nghĩa, và điểm giữa hai láng giềng không nằm “giữa” theo nghĩa trực giác nào cả.',
            '**Mẫu tổng hợp lấn vào vùng của lớp âm.** Vì các mẫu dương thưa thớt, đoạn nối giữa chúng thường xuyên đi xuyên qua vùng dày đặc mẫu lành tính. Mô hình được dạy rằng vùng đó là độc hại → **báo động giả tăng ngay tại vùng có lưu lượng lớn nhất**. Đây là cơ chế cụ thể khiến FP tăng sau khi dùng SMOTE.',
            '**Hiệu chuẩn bị phá huỷ.** Sau khi cân bằng về 50/50, xác suất mô hình trả về phản ánh một thế giới có 50% tấn công. Mọi phép tính chi phí ở bài t4-l4 trở nên vô nghĩa nếu không hiệu chỉnh lại tỉ lệ nền.',
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Và cái bẫy nguy hiểm nhất: SMOTE trước khi chia tập',
          md: 'Nếu bạn chạy SMOTE trên toàn bộ dữ liệu rồi mới chia train/test, một mẫu tổng hợp trong tập kiểm tra có thể được nội suy từ chính các mẫu nằm trong tập huấn luyện. Điểm số sẽ nhảy vọt và **hoàn toàn giả**.\n\nĐây là dạng rò rỉ tiền xử lý đã học ở t2-l6, và nó là lý do rất nhiều bài báo báo cáo F1 trên 0,99 cho các bài toán phát hiện xâm nhập trên CIC-IDS2017 hay NSL-KDD. Nếu bạn buộc phải dùng lấy mẫu lại: đặt nó **bên trong** `imblearn.pipeline.Pipeline` và chỉ áp lên phần huấn luyện của mỗi fold. Tập kiểm tra phải giữ nguyên tỉ lệ lớp thật, không bao giờ được cân bằng lại.',
        },
        {
          t: 'compare',
          title: 'Hai triết lý xử lý mất cân bằng',
          left: {
            title: '🎚️ Sửa QUYẾT ĐỊNH (nên làm trước)',
            items: [
              'Giữ nguyên dữ liệu thật, giữ nguyên tỉ lệ nền thật',
              'Đổi chỉ số: PR-AUC, precision@k thay cho accuracy',
              'Đổi ngưỡng theo ma trận chi phí (bài t4-l4)',
              'Giữ nguyên hiệu chuẩn nên phép tính chi phí vẫn dùng được',
              'Chi phí thực hiện: vài phút. Rủi ro: gần bằng không.',
            ],
          },
          right: {
            title: '🧪 Sửa DỮ LIỆU (chỉ khi cần)',
            items: [
              'Thay đổi phân phối mà mô hình nhìn thấy',
              'class_weight, hạ mẫu, oversampling, SMOTE',
              'Có thể giúp khi lớp dương quá ít để ảnh hưởng tới gradient',
              'Phá hiệu chuẩn — phải hiệu chỉnh lại xác suất sau đó',
              'Chi phí: hàng ngày công. Rủi ro: rò rỉ, mẫu ảo, FP tăng.',
            ],
          },
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't4l5-cp1',
              kind: 'mcq',
              tags: ['mat-can-bang', 'smote'],
              q: 'Sau khi áp dụng SMOTE, F1 trên tập kiểm tra đã cân bằng lại tăng từ 0,42 lên 0,88. Kết luận nào đúng nhất?',
              options: [
                'Mô hình đã tốt hơn thật sự, nên triển khai ngay',
                'Con số này không so sánh được vì tập kiểm tra đã bị đổi tỉ lệ lớp; phải đo lại trên tỉ lệ thật',
                'SMOTE luôn cải thiện F1 nên đây là kết quả bình thường',
                'F1 tăng chứng tỏ recall tăng, nên số vụ bỏ sót đã giảm',
              ],
              answer: 1,
              why: 'Tập kiểm tra đã cân bằng lại là một thế giới không tồn tại. Precision đo trên tập 50/50 có mẫu số FP nhỏ hơn thực tế hàng nghìn lần, nên nó luôn đẹp một cách giả tạo. Quy tắc cứng: **mọi phép lấy mẫu lại chỉ được áp lên tập huấn luyện; tập kiểm định và tập kiểm tra phải giữ nguyên tỉ lệ lớp thật.** Đo lại đúng cách, con số 0,88 thường tụt về gần 0,42 hoặc thấp hơn.',
              distractorWhy: [
                'Kết quả trên phân phối giả không nói gì về hiệu năng trên phân phối thật.',
                '',
                'SMOTE không “luôn” cải thiện gì cả; và ở đây phần lớn mức tăng đến từ việc đổi tập đánh giá.',
                'Recall có thể tăng thật, nhưng F1 trên tập đã đổi tỉ lệ không cho phép kết luận gì về số vụ bỏ sót ngoài đời.',
              ],
            },
            {
              id: 't4l5-cp2',
              kind: 'truefalse',
              tags: ['mat-can-bang', 'hieu-chuan'],
              q: 'Sau khi hạ mẫu lớp âm còn 2%, xác suất mô hình trả về vẫn dùng trực tiếp được cho công thức ngưỡng theo chi phí.',
              answer: false,
              why: 'Hạ mẫu làm tỉ lệ nền mà mô hình nhìn thấy cao hơn thực tế 50 lần, nên mọi xác suất nó trả về đều bị thổi phồng. Muốn dùng lại được, phải hiệu chỉnh về tỉ lệ nền thật. Với tỉ lệ giữ lại beta, công thức chuẩn là: **p_thật = beta × p_lệch / (1 − p_lệch + beta × p_lệch)**. Ví dụ beta = 0,02 và p_lệch = 0,5 thì p_thật ≈ 0,0196. Không làm bước này thì ngưỡng chi phí ở bài t4-l4 sẽ sai theo hệ số hàng chục lần.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Ba cách xử lý mất cân bằng, xếp theo thứ tự nên thử',
          code:
            "import numpy as np\n" +
            "import lightgbm as lgb\n" +
            "from sklearn.linear_model import LogisticRegression\n" +
            "from sklearn.metrics import average_precision_score\n" +
            "\n" +
            "# --- Cách 1 (LUÔN THỬ TRƯỚC): không đụng dữ liệu, chỉ đổi chỉ số và ngưỡng ---\n" +
            "gbm = lgb.LGBMClassifier(n_estimators=600, learning_rate=0.05)\n" +
            "gbm.fit(X_train, y_train)\n" +
            "p = gbm.predict_proba(X_val)[:, 1]\n" +
            "print('PR-AUC:', round(average_precision_score(y_val, p), 4))\n" +
            "print('Tỉ lệ dương (mức tham chiếu):', round(y_val.mean(), 6))\n" +
            "# Nếu PR-AUC vượt xa mức tham chiếu thì mô hình ĐÃ học được; vấn đề chỉ là ngưỡng.\n" +
            "\n" +
            "# --- Cách 2: đổi trọng số trong hàm mất mát, giữ nguyên dữ liệu ---\n" +
            "ty_le = (y_train == 0).sum() / max((y_train == 1).sum(), 1)\n" +
            "gbm_w = lgb.LGBMClassifier(scale_pos_weight=ty_le, n_estimators=600, learning_rate=0.05)\n" +
            "lr_w = LogisticRegression(max_iter=2000, class_weight='balanced')\n" +
            "\n" +
            "# --- Cách 3: hạ mẫu lớp âm VÌ LÝ DO TÍNH TOÁN, rồi hiệu chỉnh lại xác suất ---\n" +
            "beta = 0.02                                  # tỉ lệ mẫu âm được giữ lại\n" +
            "p_lech = gbm_ha_mau.predict_proba(X_val)[:, 1]\n" +
            "p_that = beta * p_lech / (1 - p_lech + beta * p_lech)\n" +
            "print('Trước hiệu chỉnh:', round(float(p_lech.mean()), 4),\n" +
            "      '| Sau hiệu chỉnh:', round(float(p_that.mean()), 6))\n",
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Cách đầu tư đúng chỗ: khai thác mẫu âm khó',
          md: 'Nếu bạn có ngân sách cho một việc duy nhất, đừng bỏ vào SMOTE. Hãy bỏ vào **hard negative mining**: lấy các mẫu **lành tính** bị mô hình chấm điểm cao nhất, cho analyst xác nhận, rồi đưa vào tập huấn luyện.\n\nLý do: trong bảo mật, ranh giới quyết định gần như luôn bị định hình bởi những mẫu lành tính lạ lùng — công cụ quản trị hệ thống, script sao lưu, phần mềm bảo mật của chính bạn — chứ không phải bởi việc thiếu mẫu độc. Mỗi mẫu âm khó được gán nhãn có giá trị cao hơn hàng nghìn mẫu dương bịa ra. Đây cũng là vòng lặp tự nhiên với quy trình SOC: analyst vốn đã đang đóng những cảnh báo đó rồi.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bốn dấu hiệu bạn đang chữa nhầm bệnh',
          md: '**1.** Bạn báo cáo accuracy hoặc F1 trên tập đã cân bằng lại → bạn đang đo một thế giới không tồn tại.\n\n**2.** Bạn cân bằng dữ liệu nhưng PR-AUC gần như không đổi → xác nhận rằng thứ tự xếp hạng không đổi, và bạn vừa làm một việc không cần thiết.\n\n**3.** Bạn dùng `predict()` thay vì `predict_proba()` → bạn đang để thư viện quyết định ngưỡng thay mình.\n\n**4.** Sau khi cân bằng, mọi xác suất đều quanh 0,5 → hiệu chuẩn đã hỏng, và mọi phép tính chi phí xuống sông.',
        },
        { t: 'terms', ids: ['mat-can-bang', 'base-rate', 'pr-auc', 'hieu-chuan', 'nguong', 'ro-ri-du-lieu'] },
      ],
      keyTakeaways: [
        'Mất cân bằng chủ yếu là vấn đề của ngưỡng và chỉ số, không phải của dữ liệu — kiểm tra bằng PR-AUC trước khi động vào bất cứ thứ gì.',
        'Thứ tự nên thử: đổi chỉ số và ngưỡng → class_weight → hạ mẫu vì lý do tính toán → thêm dữ liệu dương thật → cuối cùng mới tới sinh mẫu tổng hợp.',
        'SMOTE giả định đặc trưng liên tục, chiều thấp và lớp thiểu số liền mạch; dữ liệu bảo mật vi phạm cả ba nên mẫu sinh ra thường không ứng với đối tượng có thật.',
        'Mẫu tổng hợp hay nằm lấn vào vùng lành tính đông đúc, làm báo động giả tăng đúng ở nơi lưu lượng lớn nhất.',
        'Mọi phép lấy mẫu lại chỉ áp lên tập huấn luyện; tập kiểm định và kiểm tra phải giữ nguyên tỉ lệ lớp thật.',
        'Sau khi hạ mẫu lớp âm với tỉ lệ giữ lại beta, hiệu chỉnh xác suất bằng p_thật = beta·p / (1 − p + beta·p).',
        'Đầu tư hiệu quả nhất thường là khai thác mẫu âm khó, không phải bịa thêm mẫu dương.',
      ],
      cards: [
        {
          id: 't4l5-c1',
          front: 'Cách xử lý mất cân bằng nào nên thử ĐẦU TIÊN, và vì sao?',
          back: 'Đổi chỉ số (PR-AUC, precision@k) và đổi ngưỡng. Vì lấy mẫu lại hầu như không đổi thứ tự xếp hạng, nên phần lớn cải thiện thật ra đến từ việc chọn điểm cắt đúng — mất vài phút thay vì vài tuần.',
          tags: ['mat-can-bang', 'nguong'],
        },
        {
          id: 't4l5-c2',
          front: 'Nêu hai lý do kỹ thuật khiến SMOTE thường phản tác dụng trên dữ liệu bảo mật.',
          back: 'Đặc trưng phần lớn là nhị phân, đếm hoặc one-hot nên nội suy tạo ra mẫu không tồn tại; và lớp dương gồm nhiều họ rời nhau nên nội suy giữa hai họ tạo ra con lai vô nghĩa.',
          tags: ['smote', 'mat-can-bang'],
        },
        {
          id: 't4l5-c3',
          front: 'Vì sao SMOTE làm tăng báo động giả?',
          back: 'Vì mẫu dương thưa nên đoạn nối giữa chúng thường xuyên đi xuyên vùng dày đặc mẫu lành tính; mô hình học rằng vùng đó là độc hại, và đó là nơi có lưu lượng lớn nhất.',
          tags: ['smote', 'bao-dong-gia'],
        },
        {
          id: 't4l5-c4',
          front: 'Sau khi hạ mẫu lớp âm còn tỉ lệ beta, hiệu chỉnh xác suất bằng công thức nào?',
          back: 'p_thật = beta × p_lệch / (1 − p_lệch + beta × p_lệch). Không hiệu chỉnh thì mọi ngưỡng theo chi phí đều sai theo hệ số hàng chục lần.',
          hint: 'Ý tưởng: hạ mẫu nhân tỉ số cược (odds) lên 1/beta, nên phải nhân ngược lại.',
          tags: ['hieu-chuan', 'mat-can-bang'],
        },
        {
          id: 't4l5-c5',
          front: 'Hard negative mining là gì và vì sao nó hiệu quả hơn oversampling trong bảo mật?',
          back: 'Lấy các mẫu lành tính bị chấm điểm cao nhất cho analyst xác nhận rồi đưa vào tập huấn luyện. Hiệu quả hơn vì ranh giới quyết định bị định hình bởi mẫu lành tính lạ lùng, không phải bởi thiếu mẫu độc.',
          tags: ['mat-can-bang', 'thuc-chien'],
        },
      ],
      quiz: [
        {
          id: 't4-l5-q1',
          kind: 'mcq',
          tags: ['mat-can-bang'],
          q: 'Tỉ lệ 1:5.000. Bạn chạy hai thí nghiệm: (A) mô hình gốc, PR-AUC = 0,41; (B) mô hình sau SMOTE, PR-AUC = 0,40, đo trên cùng tập kiểm tra giữ nguyên tỉ lệ thật. Kết luận?',
          options: [
            'SMOTE không giúp gì ở đây; nên bỏ nó và tập trung vào ngưỡng và đặc trưng',
            'SMOTE có hại vì PR-AUC giảm 0,01',
            'Cần chạy thêm SMOTE với tỉ lệ cân bằng cao hơn',
            'Kết quả này không hợp lệ vì tập kiểm tra chưa được cân bằng',
          ],
          answer: 0,
          why: 'Chênh lệch 0,01 PR-AUC gần như chắc chắn nằm trong nhiễu lấy mẫu, đặc biệt khi số mẫu dương chỉ vài trăm — hãy bootstrap để thấy khoảng tin cậy chồng lên nhau. Kết luận đúng là **SMOTE không mang lại gì**, đúng như dự đoán từ lý thuyết: nó không thay đổi khả năng xếp hạng. Thời gian nên dồn vào chỗ có đòn bẩy thật: đặc trưng tốt hơn, mẫu âm khó, và chọn ngưỡng theo chi phí. Đáp án cuối là bẫy nguy hiểm nhất — cân bằng tập kiểm tra là cách chắc chắn để tự lừa mình.',
          distractorWhy: [
            '',
            'Kết luận “có hại” dựa trên chênh lệch nhỏ hơn nhiễu là suy diễn quá mức; đúng hơn là nó vô tác dụng.',
            'Tăng mức cân bằng chỉ khuếch đại các vấn đề của mẫu tổng hợp, không tạo ra thông tin mới.',
            'Ngược lại: tập kiểm tra BẮT BUỘC phải giữ nguyên tỉ lệ lớp thật thì con số mới có nghĩa.',
          ],
        },
        {
          id: 't4-l5-q2',
          kind: 'order',
          tags: ['mat-can-bang', 'quy-trinh'],
          q: 'Sắp xếp các bước xử lý mất cân bằng theo thứ tự nên thực hiện.',
          items: [
            'Đo bằng PR-AUC và precision@k để xem mô hình có thực sự học được không',
            'Chọn ngưỡng theo chi phí hoặc theo công suất thay vì dùng 0,5',
            'Thử class_weight hoặc scale_pos_weight và so lại trên cùng tập kiểm định',
            'Đầu tư thu thập thêm nhãn dương thật và khai thác mẫu âm khó',
            'Chỉ khi tất cả các bước trên đã cạn, mới cân nhắc sinh mẫu tổng hợp',
          ],
          why: 'Thứ tự này xếp theo tỉ lệ lợi ích trên rủi ro giảm dần. Hai bước đầu miễn phí, không đụng dữ liệu, không phá hiệu chuẩn, và giải quyết được phần lớn trường hợp. Bước ba đụng vào hàm mất mát nên bắt đầu có rủi ro hiệu chuẩn. Bước bốn tốn công nhất nhưng là thứ duy nhất tạo ra thông tin mới. Sinh mẫu tổng hợp đứng cuối vì nó vừa không tạo thông tin mới vừa mang theo rủi ro mẫu ảo và rò rỉ.',
        },
        {
          id: 't4-l5-q3',
          kind: 'multi',
          tags: ['mat-can-bang', 'ro-ri-du-lieu'],
          q: 'Quy tắc nào phải luôn tuân thủ khi làm việc với dữ liệu mất cân bằng? (Chọn tất cả đáp án đúng)',
          options: [
            'Chỉ áp dụng lấy mẫu lại lên phần huấn luyện, bên trong pipeline',
            'Giữ nguyên tỉ lệ lớp thật ở tập kiểm định và tập kiểm tra',
            'Báo cáo PR-AUC kèm tỉ lệ lớp dương của tập đánh giá',
            'Cân bằng dữ liệu về 50/50 trước khi chia tập để mô hình học ổn định hơn',
          ],
          answers: [0, 1, 2],
          why: 'Ba quy tắc đầu bảo vệ tính trung thực của con số bạn báo cáo. Ý cuối là công thức tạo ra rò rỉ dữ liệu kinh điển: mẫu tổng hợp trong tập kiểm tra được nội suy từ các mẫu trong tập huấn luyện, khiến điểm số nhảy vọt và hoàn toàn giả. Nếu bạn thấy một bài báo hoặc một notebook báo F1 trên 0,99 cho bài toán phát hiện xâm nhập, kiểm tra thứ tự SMOTE và chia tập là việc đầu tiên nên làm.',
        },
        {
          id: 't4-l5-q4',
          kind: 'input',
          tags: ['hieu-chuan', 'mat-can-bang'],
          q: 'Bạn hạ mẫu lớp âm còn beta = 0,01. Mô hình trả về p_lệch = 0,50 cho một mẫu. Xác suất thật xấp xỉ bao nhiêu? (Nhập số thập phân, ví dụ 0,0123)',
          accept: ['0,0099', '0.0099', '0,01', '0.01', '0,00990', '0.0099009'],
          placeholder: 'Nhập xác suất đã hiệu chỉnh…',
          hint: 'p_thật = beta × p / (1 − p + beta × p).',
          why: 'p_thật = 0,01 × 0,5 / (0,5 + 0,01 × 0,5) = 0,005 / 0,505 ≈ **0,0099**, tức khoảng 1%. Đây là khác biệt 50 lần so với con số 0,5 mà mô hình trả về, và nó quyết định trực tiếp việc bạn đặt ngưỡng ở đâu. Bài học rộng hơn: **bất kỳ thao tác nào làm thay đổi tỉ lệ lớp mà mô hình nhìn thấy đều làm hỏng ý nghĩa xác suất của đầu ra**, và bạn phải hoặc hiệu chỉnh bằng công thức, hoặc hiệu chuẩn lại trên dữ liệu giữ nguyên tỉ lệ thật (bài t4-l6).',
        },
        {
          id: 't4-l5-q5',
          kind: 'truefalse',
          tags: ['mat-can-bang', 'smote'],
          q: 'SMOTE tạo ra thông tin mới về lớp thiểu số mà mô hình chưa từng thấy.',
          answer: false,
          why: 'SMOTE chỉ nội suy giữa các mẫu **đã có** trong tập huấn luyện — nó không thêm một bit thông tin nào về thế giới thật. Thứ nó thay đổi là **hình dạng của hàm mất mát**: mô hình bị ép quan tâm nhiều hơn tới vùng quanh các mẫu thiểu số. Cùng hiệu ứng đó đạt được bằng class_weight mà không phải bịa ra điểm dữ liệu nào cả, và không mang theo rủi ro mẫu ảo. Muốn có thông tin mới thì chỉ có một cách: thêm dữ liệu thật — mẫu dương mới, hoặc mẫu âm khó đã được gán nhãn.',
        },
      ],
      terms: ['mat-can-bang', 'base-rate', 'pr-auc', 'hieu-chuan', 'nguong', 'ro-ri-du-lieu'],
      further: [
        {
          title: 'SMOTE: Synthetic Minority Over-sampling Technique — Chawla và cộng sự (2002)',
          note: 'Đọc bài gốc để thấy rõ giả định thiết kế: đặc trưng liên tục, số chiều thấp. Hiểu giả định là hiểu khi nào không nên dùng.',
        },
        {
          title: 'Calibrating Probability with Undersampling for Unbalanced Classification — Dal Pozzolo và cộng sự (2015)',
          note: 'Nguồn của công thức hiệu chỉnh xác suất sau hạ mẫu, viết trong bối cảnh phát hiện gian lận thẻ.',
        },
        {
          title: 'imbalanced-learn — tài liệu chính thức',
          note: 'Nếu buộc phải lấy mẫu lại, dùng Pipeline của thư viện này để phép lấy mẫu chỉ chạm vào phần huấn luyện của mỗi fold.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't4-l6',
      trackId: 'do-luong',
      title: 'Hiệu chuẩn xác suất',
      subtitle: 'Điểm 0,9 có nghĩa là gì, và vì sao câu trả lời quyết định mọi phép tính chi phí',
      minutes: 20,
      level: 'nang-cao',
      prereqs: ['t4-l5'],
      why: {
        short:
          'Toàn bộ phép tính ngưỡng theo chi phí ở bài t4-l4 giả định điểm số của mô hình là xác suất thật; nếu chưa hiệu chuẩn thì giả định đó sai và mọi quyết định dựng trên nó cũng sai theo.',
        scenario:
          'Analyst hỏi bạn: “cảnh báo này mô hình cho 0,87, nghĩa là 87% khả năng có thật à?” Nếu câu trả lời là không, bạn cần biết con số đó thực sự nghĩa là gì — và cần một quy trình để nó có nghĩa vào lần sau.',
        roles: ['Security Data Scientist', 'ML Engineer', 'Detection Engineer', 'SOC Analyst'],
        costOfNotKnowing:
          'Bạn gộp điểm của ba mô hình khác nhau vào một điểm rủi ro tổng, tính chi phí kỳ vọng từ những con số không phải xác suất, và ra quyết định tự động dựa trên một thang đo không có đơn vị.',
      },
      objectives: [
        'Phát biểu định nghĩa hiệu chuẩn bằng một phép kiểm tra thực hiện được trên dữ liệu',
        'Đọc biểu đồ độ tin cậy và nói ra mô hình đang tự tin thái quá hay quá dè dặt',
        'Chọn giữa Platt scaling và isotonic regression theo lượng dữ liệu và hình dạng sai lệch',
        'Đo hiệu chuẩn bằng Brier score và ECE, đồng thời nêu được giới hạn của cả hai trong bối cảnh mất cân bằng',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Mô hình phát hiện chiếm quyền tài khoản của bạn chấm 0,90 cho 1.200 phiên đăng nhập trong tháng. Nếu mô hình được hiệu chuẩn tốt, bạn kỳ vọng bao nhiêu trong số 1.200 phiên đó thực sự là chiếm quyền? Và nếu kiểm tra thấy con số thật là 43, điều đó nói lên gì?',
          reveal:
            'Nếu hiệu chuẩn tốt: khoảng **1.080 phiên** (90%) phải là chiếm quyền thật. Đó chính là **định nghĩa** của hiệu chuẩn.\n\nCon số thật là 43, tức **3,6%**. Mô hình đang tự tin thái quá gấp **25 lần**.\n\nHậu quả cụ thể, không phải lý thuyết:\n\n- Công thức ngưỡng t\\* = C_FP/(C_FP + C_FN) trở nên vô nghĩa vì trục hoành của nó không phải xác suất.\n- Analyst học được rằng “0,9 nghĩa là chắc lắm” rồi phát hiện 24 trên 25 lần là rác → họ ngừng tin toàn bộ thang điểm.\n- Nếu bạn cộng hoặc nhân điểm này với điểm của một mô hình khác để ra “điểm rủi ro tổng”, bạn đang cộng hai đại lượng không cùng đơn vị.\n\nĐiều quan trọng nhất: mô hình này có thể vẫn **xếp hạng rất tốt**. ROC-AUC của nó có thể là 0,99. Hiệu chuẩn và khả năng xếp hạng là hai phẩm chất **hoàn toàn tách rời**.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Hai phẩm chất khác nhau của một mô hình',
          md: '**Khả năng phân biệt (discrimination)**: mô hình có xếp mẫu độc lên trên mẫu lành không? Đo bằng ROC-AUC, PR-AUC, precision@k.\n\n**Hiệu chuẩn (calibration)**: con số mô hình đưa ra có đúng bằng tần suất thật không? Đo bằng biểu đồ độ tin cậy, Brier score, ECE.\n\nPhép thử để thấy chúng tách rời: lấy mô hình của bạn và **chia mọi điểm cho 10**. Thứ tự không đổi một chút nào → ROC-AUC, PR-AUC, precision@k y hệt. Nhưng hiệu chuẩn thì hỏng hoàn toàn.\n\nHệ quả thực hành: hiệu chuẩn **không bao giờ** cứu được một mô hình xếp hạng kém. Nó chỉ dịch một thang đo tốt sang đúng đơn vị. Hãy sửa khả năng phân biệt trước, hiệu chuẩn sau.',
        },
        { t: 'h', text: 'Đọc biểu đồ độ tin cậy', level: 2 },
        {
          t: 'p',
          md: 'Cách làm: chia toàn bộ mẫu thành các nhóm theo điểm dự đoán (nên chia theo **phân vị**, không chia đều, để mỗi nhóm có đủ mẫu). Với mỗi nhóm, chấm một điểm: trục ngang là điểm trung bình mô hình dự đoán, trục dọc là **tỉ lệ dương thật** trong nhóm đó. Hiệu chuẩn hoàn hảo là đường chéo 45 độ.',
        },
        {
          t: 'figure',
          id: 'fig-calibration',
          caption: 'Biểu đồ độ tin cậy: đường chéo là lý tưởng. Nằm dưới đường chéo là tự tin thái quá (nói 0,9 nhưng thực tế 0,3); nằm trên là quá dè dặt.',
        },
        {
          t: 'table',
          head: ['Họ mô hình', 'Sai lệch điển hình', 'Nguyên nhân', 'Cách vá thường dùng'],
          rows: [
            ['Cây tăng cường (LightGBM, XGBoost)', 'Đẩy điểm ra hai cực, thường tự tin thái quá ở đuôi', 'Tối ưu log-loss trên dữ liệu lệch, cộng thêm regularization và early stopping', 'Isotonic nếu đủ dữ liệu, Platt nếu ít'],
            ['SVM', 'Đầu ra không phải xác suất; hình chữ S rõ rệt', 'Hàm mất mát hinge không phải quy tắc chấm điểm đúng', 'Platt scaling (đây chính là bối cảnh nó ra đời)'],
            ['Naive Bayes', 'Cực kỳ tự tin thái quá, điểm dồn về 0 và 1', 'Giả định độc lập bị vi phạm nên bằng chứng bị đếm nhiều lần', 'Isotonic'],
            ['Rừng ngẫu nhiên', 'Quá dè dặt ở hai đầu (hiếm khi ra 0 hoặc 1)', 'Trung bình cộng của nhiều cây kéo điểm về giữa', 'Isotonic'],
            ['Mạng nơ-ron sâu hiện đại', 'Tự tin thái quá rõ rệt, tăng theo độ lớn mô hình', 'Guo và cộng sự (2017) mô tả hiện tượng này chi tiết', 'Temperature scaling (một tham số duy nhất)'],
            ['Hồi quy logistic', 'Thường đã khá tốt sẵn', 'Tối ưu trực tiếp log-loss, vốn là quy tắc chấm điểm đúng', 'Thường không cần'],
          ],
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't4l6-cp1',
              kind: 'mcq',
              tags: ['hieu-chuan'],
              q: 'Bạn chia mọi điểm số của mô hình cho 10. Chỉ số nào thay đổi?',
              options: [
                'ROC-AUC giảm mạnh',
                'Chỉ hiệu chuẩn hỏng; ROC-AUC, PR-AUC và precision@k giữ nguyên',
                'PR-AUC giảm còn ROC-AUC giữ nguyên',
                'Không có gì thay đổi, kể cả hiệu chuẩn',
              ],
              answer: 1,
              why: 'Chia cho 10 là một phép biến đổi **đơn điệu tăng**, nên nó không đổi thứ tự của bất kỳ cặp mẫu nào. Mọi chỉ số chỉ phụ thuộc thứ tự — ROC-AUC, PR-AUC, precision@k — hoàn toàn không đổi. Nhưng giá trị số thì lệch 10 lần, nên biểu đồ độ tin cậy sập xuống dưới đường chéo và Brier score xấu đi. Đây là bài kiểm tra trực giác chuẩn để tách hai khái niệm; nếu bạn trả lời đúng câu này, bạn đã nắm được ý chính của bài.',
              distractorWhy: [
                'ROC-AUC chỉ phụ thuộc thứ tự nên phép chia đều không ảnh hưởng.',
                '',
                'PR-AUC cũng chỉ phụ thuộc thứ tự xếp hạng, nên nó cũng không đổi.',
                'Hiệu chuẩn chắc chắn thay đổi vì giá trị số không còn khớp với tần suất thật.',
              ],
            },
            {
              id: 't4l6-cp2',
              kind: 'truefalse',
              tags: ['hieu-chuan', 'ro-ri-du-lieu'],
              q: 'Có thể hiệu chuẩn mô hình trên chính tập dữ liệu đã dùng để huấn luyện nó.',
              answer: false,
              why: 'Trên tập huấn luyện, mô hình đã khớp quá tốt nên phân bố điểm ở đó không giống phân bố điểm trên dữ liệu mới — hàm hiệu chuẩn học được sẽ sai đúng theo hướng làm mọi thứ trông đẹp hơn. Hiệu chuẩn cần một tập **riêng biệt**, và trong bảo mật phải là tập ở giai đoạn **sau** về mặt thời gian, vì bạn muốn hàm hiệu chuẩn phản ánh tỉ lệ nền và phân bố mà mô hình sẽ gặp khi chạy thật. Nếu dữ liệu ít, dùng `CalibratedClassifierCV` với cross-validation để mỗi phần được hiệu chuẩn bởi phần còn lại.',
            },
          ],
        },
        { t: 'h', text: 'Hai công cụ chính: Platt và isotonic', level: 2 },
        {
          t: 'compare',
          title: 'Chọn phương pháp theo lượng dữ liệu và hình dạng sai lệch',
          left: {
            title: '📐 Platt scaling (sigmoid)',
            items: [
              'Khớp một hàm logistic hai tham số lên điểm số của mô hình',
              'Cần ít dữ liệu: vài trăm mẫu, trong đó vài chục mẫu dương là chạy được',
              'Áp đặt hình chữ S — chỉ đúng nếu sai lệch thật sự có dạng đó',
              'Rất ổn định, gần như không quá khớp',
              'Mặc định tốt khi tập hiệu chuẩn nhỏ, và đây là trường hợp phổ biến trong bảo mật',
            ],
          },
          right: {
            title: '📶 Isotonic regression',
            items: [
              'Khớp một hàm bậc thang không giảm, không giả định hình dạng',
              'Cần nhiều dữ liệu: nên có từ vài nghìn mẫu và ít nhất vài trăm mẫu dương',
              'Sửa được sai lệch hình dạng bất kỳ, kể cả gấp khúc',
              'Dễ quá khớp khi ít dữ liệu; tạo ra các mảng bằng phẳng ở đầu ra',
              'Có thể gộp các điểm thành nút bằng nhau nên ROC-AUC có thể nhích nhẹ',
            ],
          },
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Hiệu chuẩn, đo, và đọc biểu đồ độ tin cậy',
          code:
            "import numpy as np\n" +
            "from sklearn.calibration import CalibratedClassifierCV, calibration_curve\n" +
            "from sklearn.metrics import brier_score_loss, roc_auc_score\n" +
            "from sklearn.frozen import FrozenEstimator   # scikit-learn >= 1.6\n" +
            "\n" +
            "# Tập hiệu chuẩn phải RIÊNG và nên ở giai đoạn SAU tập huấn luyện về thời gian.\n" +
            "# Trước 1.6 người ta dùng CalibratedClassifierCV(gbm, cv='prefit'); tham số đó đã bị bỏ.\n" +
            "hc = CalibratedClassifierCV(FrozenEstimator(gbm), method='isotonic')\n" +
            "hc.fit(X_cal, y_cal)\n" +
            "\n" +
            "p_tho = gbm.predict_proba(X_test)[:, 1]\n" +
            "p_hc = hc.predict_proba(X_test)[:, 1]\n" +
            "\n" +
            "print('Brier thô :', round(brier_score_loss(y_test, p_tho), 6))\n" +
            "print('Brier sau :', round(brier_score_loss(y_test, p_hc), 6))\n" +
            "# Khả năng xếp hạng gần như không đổi — hiệu chuẩn chỉ dịch thang đo, không sửa mô hình\n" +
            "print('AUC thô/sau:', round(roc_auc_score(y_test, p_tho), 4),\n" +
            "      round(roc_auc_score(y_test, p_hc), 4))\n" +
            "\n" +
            "# strategy='quantile' để mỗi ô có đủ mẫu; chia đều sẽ cho các ô cuối chỉ vài mẫu\n" +
            "ty_le_that, diem_tb = calibration_curve(y_test, p_hc, n_bins=10, strategy='quantile')\n" +
            "for d, t in zip(diem_tb, ty_le_that):\n" +
            "    print(f'Mô hình nói {d:.4f} -> thực tế {t:.4f}')\n",
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Brier score và ECE — cùng giới hạn của chúng',
          md: '**Brier score** = trung bình của (p − y)². Nó là một *quy tắc chấm điểm đúng* (proper scoring rule): giá trị tốt nhất đạt được khi bạn báo cáo đúng xác suất bạn tin. Brier phân rã được thành ba phần: độ tin cậy (calibration), độ phân giải (resolution) và độ bất định nội tại.\n\n**ECE** (expected calibration error) = trung bình có trọng số của khoảng cách |tần suất thật − điểm trung bình| trên các ô.\n\n**Giới hạn phải biết trong bảo mật:** cả hai đều bị **khối mẫu âm khổng lồ chi phối**. Một mô hình luôn trả về 0,0001 cho mọi thứ sẽ có Brier score tuyệt đẹp và ECE gần bằng không — trong khi nó vô dụng.\n\nCách xử lý: **đo hiệu chuẩn trong vùng hoạt động**. Chỉ lấy các mẫu có điểm trên ngưỡng cảnh báo, chia phân vị, và so tần suất thật với điểm dự đoán ở đó. Đó là vùng duy nhất bạn ra quyết định, nên cũng là vùng duy nhất mà hiệu chuẩn có hậu quả.',
        },
        { t: 'h', text: 'Vì sao analyst cần điểm có nghĩa', level: 2 },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Ngưỡng theo chi phí dùng được ngay.** Với xác suất thật, t\\* = C_FP/(C_FP + C_FN) áp thẳng, và mỗi khi chi phí đổi bạn chỉ cần tính lại một phép chia thay vì quét lại toàn bộ.',
            '**Gộp được nhiều nguồn.** Điểm 0,7 của mô hình email và điểm 0,7 của mô hình endpoint chỉ cộng hay nhân được với nhau khi cả hai cùng là xác suất. Không hiệu chuẩn thì “điểm rủi ro tổng” là phép cộng táo với cam.',
            '**Xếp hạng liên hệ thống.** SOC nhận cảnh báo từ EDR, SIEM, mô hình nội bộ, dịch vụ thứ ba. Chỉ thang xác suất chung mới cho phép sắp xếp một hàng đợi duy nhất theo mức độ nghiêm trọng.',
            '**Nói được câu người ta hiểu.** “Nhóm cảnh báo mức này, cứ 10 cái thì khoảng 7 cái là thật” là câu một trưởng ca dùng được để phân bổ người. “Điểm 87 trên thang 100” thì không.',
            '**Tính được tổn thất kỳ vọng.** Báo cáo cho lãnh đạo dạng “rủi ro chưa xử lý tuần này ước tính 240.000 USD” chỉ dựng được từ xác suất đã hiệu chuẩn nhân với thiệt hại.',
          ],
        },
        {
          t: 'lab',
          id: 'lab-calibration',
          intro: 'Kéo lệch điểm số của một mô hình và xem biểu đồ độ tin cậy biến dạng, rồi thử Platt và isotonic để nắn nó về đường chéo. Chú ý điều gì xảy ra với AUC trong lúc đó.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Năm cái bẫy về hiệu chuẩn',
          md: '**1. Tưởng điểm của sản phẩm thương mại là xác suất.** “Risk score 87” của một EDR gần như luôn là điểm xếp hạng nội bộ, không phải xác suất. Đừng đưa nó vào công thức chi phí nếu chưa tự hiệu chuẩn lại trên dữ liệu của mình.\n\n**2. Hiệu chuẩn trên dữ liệu đã cân bằng lại.** Hàm hiệu chuẩn sẽ học tỉ lệ nền giả. Phải hiệu chuẩn trên dữ liệu giữ nguyên tỉ lệ thật, hoặc hiệu chỉnh trước theo công thức ở bài t4-l5.\n\n**3. Hiệu chuẩn một lần rồi quên.** Tỉ lệ nền trôi theo mùa và theo chiến dịch tấn công. Hàm hiệu chuẩn cũ sẽ lệch dần. Đặt lịch hiệu chuẩn lại cùng nhịp với giám sát trôi dữ liệu.\n\n**4. Isotonic với 30 mẫu dương.** Bạn sẽ nhận được một hàm bậc thang khớp hoàn hảo vào nhiễu. Dưới vài trăm mẫu dương, chọn Platt.\n\n**5. Dùng hiệu chuẩn để cứu một mô hình xếp hạng kém.** Không có tác dụng. Hiệu chuẩn giữ nguyên thứ tự, nên nó không tạo thêm một chút khả năng phân biệt nào.',
        },
        { t: 'terms', ids: ['hieu-chuan', 'nguong', 'roc-auc', 'mat-can-bang', 'base-rate'] },
      ],
      keyTakeaways: [
        'Hiệu chuẩn nghĩa là: trong nhóm sự kiện được chấm 0,9 thì khoảng 90% thực sự là dương — kiểm tra được trực tiếp trên dữ liệu.',
        'Khả năng phân biệt và hiệu chuẩn là hai phẩm chất tách rời; chia mọi điểm cho 10 không đổi AUC nhưng phá huỷ hiệu chuẩn.',
        'Cây tăng cường và mạng nơ-ron sâu thường tự tin thái quá; rừng ngẫu nhiên thường quá dè dặt; hồi quy logistic thường đã ổn sẵn.',
        'Platt scaling cho tập hiệu chuẩn nhỏ và sai lệch dạng chữ S; isotonic cho dữ liệu nhiều và sai lệch hình dạng bất kỳ.',
        'Hiệu chuẩn phải thực hiện trên tập riêng, giữ nguyên tỉ lệ lớp thật, và nên ở giai đoạn sau về thời gian.',
        'Brier score và ECE bị khối mẫu âm chi phối trong bài toán mất cân bằng — hãy đo hiệu chuẩn riêng trong vùng hoạt động.',
        'Hiệu chuẩn không cứu được mô hình xếp hạng kém; nó chỉ đổi thang đo sang đơn vị dùng được.',
      ],
      cards: [
        {
          id: 't4l6-c1',
          front: 'Định nghĩa hiệu chuẩn bằng một phép kiểm tra thực hiện được trên dữ liệu.',
          back: 'Gom tất cả sự kiện được chấm khoảng 0,9 lại; nếu khoảng 90% trong số đó thực sự là dương thì mô hình hiệu chuẩn tốt tại mức điểm đó.',
          tags: ['hieu-chuan'],
        },
        {
          id: 't4l6-c2',
          front: 'Vì sao chia mọi điểm số cho 10 không làm thay đổi ROC-AUC?',
          back: 'Vì đó là phép biến đổi đơn điệu tăng, không đổi thứ tự bất kỳ cặp mẫu nào. Mọi chỉ số dựa trên thứ tự đều giữ nguyên; chỉ hiệu chuẩn bị phá.',
          tags: ['hieu-chuan', 'roc-auc'],
        },
        {
          id: 't4l6-c3',
          front: 'Khi nào chọn Platt scaling thay vì isotonic regression?',
          back: 'Khi tập hiệu chuẩn nhỏ — dưới vài trăm mẫu dương — vì Platt chỉ có hai tham số nên rất khó quá khớp, còn isotonic sẽ khớp vào nhiễu.',
          tags: ['hieu-chuan'],
        },
        {
          id: 't4l6-c4',
          front: 'Vì sao Brier score và ECE gây hiểu nhầm trong bài toán mất cân bằng cực đoan?',
          back: 'Vì cả hai bị khối mẫu âm khổng lồ chi phối: mô hình luôn trả về giá trị rất nhỏ sẽ có điểm rất đẹp. Phải đo hiệu chuẩn riêng trong vùng điểm cao, nơi thực sự ra quyết định.',
          tags: ['hieu-chuan', 'mat-can-bang'],
        },
        {
          id: 't4l6-c5',
          front: 'Nêu hai lý do vận hành khiến SOC cần điểm đã hiệu chuẩn.',
          back: 'Để áp trực tiếp công thức ngưỡng theo chi phí, và để gộp hoặc xếp hạng chung cảnh báo từ nhiều nguồn khác nhau trên một thang đo có cùng đơn vị.',
          tags: ['hieu-chuan', 'thuc-chien'],
        },
      ],
      quiz: [
        {
          id: 't4-l6-q1',
          kind: 'mcq',
          tags: ['hieu-chuan'],
          q: 'Biểu đồ độ tin cậy của mô hình nằm hẳn **dưới** đường chéo trong toàn bộ vùng điểm cao. Điều đó nghĩa là gì?',
          options: [
            'Mô hình quá dè dặt: nó nói 0,3 trong khi thực tế là 0,7',
            'Mô hình tự tin thái quá: nó nói 0,9 trong khi tần suất thật chỉ khoảng 0,3',
            'Mô hình xếp hạng kém nên cần đổi thuật toán',
            'Tập kiểm tra quá nhỏ nên biểu đồ không đọc được',
          ],
          answer: 1,
          why: 'Trục ngang là điểm mô hình dự đoán, trục dọc là tần suất dương thật. Nằm dưới đường chéo nghĩa là **tần suất thật thấp hơn điểm dự đoán** — mô hình hứa nhiều hơn nó làm được, tức tự tin thái quá. Đây là dạng sai lệch phổ biến nhất với cây tăng cường và mạng nơ-ron sâu. Cách vá đúng là hiệu chuẩn trên tập riêng; đổi thuật toán không cần thiết vì khả năng xếp hạng có thể vẫn rất tốt và hiệu chuẩn không đụng gì tới nó.',
          distractorWhy: [
            'Quá dè dặt là trường hợp nằm TRÊN đường chéo.',
            '',
            'Biểu đồ độ tin cậy không nói gì về khả năng xếp hạng; một mô hình AUC 0,99 vẫn có thể lệch hiệu chuẩn nặng.',
            'Kích thước tập ảnh hưởng tới độ nhiễu của từng ô, nhưng lệch hệ thống trên toàn vùng điểm cao là tín hiệu thật.',
          ],
        },
        {
          id: 't4-l6-q2',
          kind: 'truefalse',
          tags: ['hieu-chuan', 'roc-auc'],
          q: 'Hiệu chuẩn bằng Platt scaling có thể cải thiện đáng kể PR-AUC của mô hình.',
          answer: false,
          why: 'Platt scaling là một hàm logistic **đơn điệu tăng** áp lên điểm số, nên nó không đổi thứ tự của bất kỳ cặp mẫu nào — PR-AUC và ROC-AUC giữ nguyên. Isotonic regression thì không giảm nhưng có thể gộp các giá trị thành mảng bằng nhau, nên AUC có thể nhích rất nhẹ theo cả hai chiều, chủ yếu do cách xử lý các giá trị bằng nhau. Kết luận thực hành: **hiệu chuẩn để có xác suất dùng được, không phải để tăng chỉ số xếp hạng.** Nếu ai đó báo cáo PR-AUC tăng mạnh sau khi hiệu chuẩn, khả năng cao họ đã đổi luôn cả cách chia dữ liệu.',
        },
        {
          id: 't4-l6-q3',
          kind: 'multi',
          tags: ['hieu-chuan', 'thuc-chien'],
          q: 'Yêu cầu nào là bắt buộc với tập dữ liệu dùng để hiệu chuẩn? (Chọn tất cả đáp án đúng)',
          options: [
            'Không được trùng với dữ liệu đã dùng huấn luyện mô hình',
            'Phải giữ nguyên tỉ lệ lớp thật, không được cân bằng lại',
            'Nên ở giai đoạn sau về thời gian so với tập huấn luyện',
            'Phải có ít nhất 50% mẫu dương để hàm hiệu chuẩn ổn định',
          ],
          answers: [0, 1, 2],
          why: 'Ba yêu cầu đầu đều bắt buộc và đều đến từ cùng một nguyên tắc: hàm hiệu chuẩn phải học được mối quan hệ giữa điểm và tần suất thật **trong điều kiện giống lúc chạy thật**. Yêu cầu thứ tư sai và sai theo hướng nguy hiểm: ép tỉ lệ dương lên 50% chính là phá đúng thứ mà hiệu chuẩn cần bảo toàn — tỉ lệ nền. Cái bạn cần không phải tỉ lệ dương cao, mà là **đủ số lượng tuyệt đối mẫu dương** (vài trăm cho isotonic, vài chục cho Platt).',
        },
        {
          id: 't4-l6-q4',
          kind: 'match',
          tags: ['hieu-chuan'],
          q: 'Nối mỗi họ mô hình với dạng sai lệch hiệu chuẩn điển hình của nó.',
          pairs: [
            ['Naive Bayes', 'Tự tin thái quá cực độ, điểm dồn về 0 và 1'],
            ['Rừng ngẫu nhiên', 'Quá dè dặt, hiếm khi cho điểm gần 0 hoặc 1'],
            ['Mạng nơ-ron sâu hiện đại', 'Tự tin thái quá, vá bằng temperature scaling'],
            ['Hồi quy logistic', 'Thường đã hiệu chuẩn khá tốt sẵn'],
          ],
          why: 'Mỗi dạng sai lệch truy được về cơ chế của thuật toán. Naive Bayes đếm bằng chứng nhiều lần vì giả định độc lập bị vi phạm nên nó bị đẩy về hai cực. Rừng ngẫu nhiên lấy trung bình nhiều cây nên đầu ra bị kéo về giữa. Mạng nơ-ron sâu tối ưu tới mức gần như không còn lỗi trên tập huấn luyện nên độ tự tin trôi lên. Hồi quy logistic tối ưu trực tiếp log-loss — một quy tắc chấm điểm đúng — nên nó thường đã ở gần đường chéo. Biết cơ chế thì đoán được dạng sai lệch trước cả khi vẽ biểu đồ.',
        },
        {
          id: 't4-l6-q5',
          kind: 'input',
          tags: ['hieu-chuan', 'chi-phi'],
          q: 'Mô hình đã hiệu chuẩn cho một cảnh báo xác suất 0,004. Chi phí xử lý một cảnh báo là 12 USD, chi phí kỳ vọng của một vụ bỏ sót là 4.500 USD. Giá trị kỳ vọng của việc điều tra cảnh báo này là bao nhiêu USD? (Nhập số, có thể âm)',
          accept: ['6', '6 usd', '+6', '6.0', '6,0'],
          placeholder: 'Nhập giá trị kỳ vọng theo USD…',
          hint: 'Lợi ích kỳ vọng = p × C_FN. Trừ đi chi phí điều tra.',
          why: 'Lợi ích kỳ vọng = 0,004 × 4.500 = 18 USD. Trừ chi phí điều tra 12 USD → **+6 USD**. Dương, nên nên điều tra. Kiểm chứng bằng công thức ngưỡng: t\\* = 12/(12 + 4.500) = 0,00266, và 0,004 > 0,00266 nên đúng là vượt ngưỡng. Hai cách tính phải luôn cho cùng kết luận — và cả hai chỉ đúng khi con số 0,004 là **xác suất thật**. Đó là toàn bộ lý do bài học này tồn tại: không hiệu chuẩn thì phép tính đẹp đẽ trên đây chỉ là số học trên một thang đo không có đơn vị.',
        },
      ],
      terms: ['hieu-chuan', 'nguong', 'roc-auc', 'mat-can-bang', 'base-rate'],
      further: [
        {
          title: 'On Calibration of Modern Neural Networks — Guo và cộng sự (2017)',
          note: 'Bài báo mô tả hiện tượng mạng nơ-ron hiện đại tự tin thái quá và giới thiệu temperature scaling — một tham số, cực rẻ, rất hiệu quả.',
        },
        {
          title: 'Beta calibration — Kull, Silva Filho & Flach (2017)',
          note: 'Lựa chọn ở giữa Platt và isotonic: linh hoạt hơn sigmoid nhưng vẫn ít tham số, hợp với tập hiệu chuẩn cỡ trung.',
        },
        {
          title: 'scikit-learn — Probability calibration',
          note: 'Đọc phần CalibratedClassifierCV và FrozenEstimator. Từ phiên bản 1.6, cách hiệu chuẩn một mô hình đã huấn luyện sẵn đã thay đổi.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't4-l7',
      trackId: 'do-luong',
      title: 'Toán học của mệt mỏi cảnh báo',
      subtitle: 'Quy mọi chỉ số về đơn vị mà tổ chức thực sự chi trả: giờ người và vụ bị bỏ lọt',
      minutes: 19,
      level: 'trung-cap',
      prereqs: ['t4-l4', 't4-l2'],
      why: {
        short:
          'Chỉ số duy nhất khiến lãnh đạo ra được quyết định là chỉ số quy ra tiền, người và rủi ro; precision@k, tải cảnh báo, MTTD và MTTR là bộ từ vựng đó.',
        scenario:
          'Bạn có 10 phút trong cuộc họp quý với ban giám đốc. Họ không quan tâm PR-AUC. Họ hỏi: “năm nay đầu tư vào phát hiện có hiệu quả không, và năm sau cần thêm gì?” Bạn cần bốn con số và một câu chuyện nối chúng lại.',
        roles: ['SOC Analyst', 'Security Architect', 'Detection Engineer', 'GRC / Compliance'],
        costOfNotKnowing:
          'Bạn xây được mô hình tốt nhưng không chứng minh được giá trị của nó, ngân sách bị cắt, và đội SOC tiếp tục chết chìm trong hàng đợi cảnh báo mà không ai trong tổ chức hiểu vì sao.',
      },
      objectives: [
        'Tính được số ca-người cần thiết từ khối lượng cảnh báo và thời gian xử lý trung bình',
        'Định lượng lợi ích của việc gom nhóm cảnh báo bằng tỉ lệ nén và precision ở mức sự việc',
        'Tính precision@k và giải thích vì sao nó khớp với công việc thật hơn mọi chỉ số khác',
        'Chọn bộ chỉ số báo cáo cho lãnh đạo và nêu được cái bẫy Goodhart của từng chỉ số',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Đội SOC của bạn có công suất 195 cảnh báo mỗi ngày. Hôm nay hệ thống sinh 10.000 cảnh báo, trong đó 40 là thật. Hai kịch bản: (A) hàng đợi không sắp xếp, analyst lấy ngẫu nhiên; (B) hàng đợi sắp theo điểm mô hình giảm dần, và precision@195 đo được là 12%. Trong mỗi kịch bản, mỗi ngày đội bắt được bao nhiêu vụ thật?',
          reveal:
            '**Kịch bản A:** analyst xem được 195/10.000 = 1,95% hàng đợi, chọn ngẫu nhiên → kỳ vọng bắt được 40 × 0,0195 ≈ **0,8 vụ mỗi ngày**.\n\n**Kịch bản B:** 195 cảnh báo đầu bảng với precision 12% → **23 vụ mỗi ngày**.\n\nCùng một mô hình. Cùng một số người. Cùng một ngân sách. Khác nhau **gần 30 lần** về số vụ thật được phát hiện — chỉ vì thứ tự của hàng đợi.\n\nĐây là lý do toàn bộ chặng này tồn tại, và là câu trả lời cho câu hỏi “ML mang lại gì cho SOC”. Nó thường không tạo ra khả năng phát hiện mới. Nó quyết định **cảnh báo nào được con người nhìn thấy** trong điều kiện công suất hữu hạn — và đó là đòn bẩy lớn nhất trong toàn bộ quy trình.',
        },
        { t: 'h', text: 'Phép tính đầu tiên: từ tỉ lệ ra con người', level: 2 },
        {
          t: 'steps',
          title: 'Bốn bước quy cảnh báo thành nhân sự',
          steps: [
            {
              title: 'Bước 1 — Thời gian hữu ích thật của một ca',
              md: 'Một ca 8 giờ = 480 phút. Trừ bàn giao ca, họp, đào tạo, việc dự án, nghỉ giải lao → thực tế còn khoảng **390 phút** dành cho phân loại cảnh báo. Đừng dùng 480; con số đó là nguồn gốc của mọi kế hoạch nhân sự sai.',
            },
            {
              title: 'Bước 2 — Thời gian trung bình mỗi cảnh báo',
              md: 'Lấy từ hệ thống ticket của chính bạn, không lấy từ báo cáo ngành. Một cảnh báo đơn giản đã làm giàu ngữ cảnh tốt: 4–8 phút. Một cảnh báo phải tra thủ công qua ba hệ thống: 20–40 phút. Giả sử trung bình **12 phút**.\n\nCon số này là **đòn bẩy bị bỏ quên nhất** trong SOC: giảm từ 12 xuống 6 phút bằng cách tự động làm giàu ngữ cảnh tương đương với nhân đôi quân số.',
            },
            {
              title: 'Bước 3 — Công suất của một ca-người',
              md: '390 / 12 ≈ **32 cảnh báo mỗi ca-người**. Với 2 người mỗi ca và 3 ca mỗi ngày: 6 ca-người → khoảng **195 cảnh báo mỗi ngày**. Đây là con số bạn phải mang vào mọi cuộc thảo luận về ngưỡng.',
            },
            {
              title: 'Bước 4 — Đối chiếu với khối lượng thật',
              md: '5.000.000 sự kiện mỗi ngày, FPR 0,02% → 1.000 cảnh báo giả. Cần 1.000 × 12 / 390 ≈ **31 ca-người mỗi ngày**, tức khoảng 5 lần công suất hiện có.\n\nBa lối thoát, xếp theo chi phí tăng dần: **(a)** nâng ngưỡng và xếp hạng để chỉ 195 cảnh báo tốt nhất tới tay người; **(b)** gom nhóm để đơn vị công việc lớn hơn; **(c)** tuyển thêm. Hầu hết tổ chức nhảy thẳng tới (c) mà chưa làm (a) và (b).',
            },
          ],
        },
        {
          t: 'lab',
          id: 'lab-alert-load',
          intro: 'Vặn lưu lượng, tỉ lệ báo động giả, thời gian xử lý và quân số, xem đội SOC của bạn còn sống được không. Thử giảm thời gian mỗi cảnh báo từ 12 xuống 6 phút và quan sát.',
        },
        { t: 'h', text: 'Gom nhóm: cách tăng công suất mà không tăng người', level: 2 },
        {
          t: 'p',
          md: 'Báo động giả trong SOC có một tính chất rất hữu ích: chúng **lặp lại**. Một luật cấu hình sai trên một máy chủ sao lưu có thể tự sinh 3.000 cảnh báo giống hệt nhau trong một đêm. Cảnh báo thật thì thường không lặp như vậy. Bất đối xứng này là thứ bạn khai thác được.',
        },
        {
          t: 'table',
          head: ['', 'Trước khi gom nhóm', 'Sau khi gom nhóm', 'Tỉ lệ nén'],
          rows: [
            ['Cảnh báo giả', '10.000', '200 nhóm', '50 : 1'],
            ['Cảnh báo thật', '40', '30 sự việc', '1,3 : 1'],
            ['Tổng đơn vị công việc', '10.040', '230', '43 : 1'],
            ['Precision mà analyst trải nghiệm', '0,4%', '13%', 'tăng ~33 lần'],
          ],
          caption: 'Không đụng một dòng nào vào mô hình. Chỉ đổi đơn vị công việc từ “cảnh báo” sang “sự việc”, dựa trên việc rác lặp lại nhiều hơn hàng thật.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Khoá gom nhóm dùng được ngay',
          md: 'Bắt đầu bằng khoá đơn giản: **(tên luật, máy hoặc người dùng, cửa sổ thời gian)**. Ví dụ gộp mọi cảnh báo cùng luật, cùng host, trong cùng khung 4 giờ thành một sự việc.\n\nSau đó nâng dần: gộp theo thực thể liên quan (cùng tài khoản, cùng địa chỉ đích), gộp theo kỹ thuật MITRE ATT&CK, gộp theo cụm nhúng của nội dung cảnh báo.\n\nCẢNH BÁO quan trọng: gom nhóm **giấu đi thông tin về tần suất**. Một sự việc gồm 3.000 cảnh báo và một sự việc gồm 2 cảnh báo phải hiển thị khác nhau, nếu không bạn vừa che mất một tín hiệu mạnh. Luôn giữ số đếm trong giao diện.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't4l7-cp1',
              kind: 'mcq',
              tags: ['alert-fatigue', 'precision-at-k'],
              q: 'Vì sao precision@k phản ánh công việc thật của SOC tốt hơn precision tại một ngưỡng cố định?',
              options: [
                'Vì precision@k luôn cao hơn precision thông thường',
                'Vì k được đặt bằng đúng công suất xử lý, nên nó đo chất lượng của phần hàng đợi thực sự được con người nhìn thấy',
                'Vì precision@k không bị ảnh hưởng bởi tỉ lệ mất cân bằng',
                'Vì nó không cần nhãn để tính',
              ],
              answer: 1,
              why: 'Thực tế vận hành là hàng đợi bị cắt bởi công suất, không phải bởi một con số ngưỡng. Nếu đội xử lý được 195 cảnh báo mỗi ngày thì mọi thứ dưới vị trí 195 coi như không tồn tại, bất kể điểm số của chúng là bao nhiêu. precision@195 đo đúng thứ analyst thực sự trải nghiệm. Nó còn có ưu điểm phụ: ổn định khi phân bố điểm trôi, vì k cố định trong khi ngưỡng tuyệt đối thì không.',
              distractorWhy: [
                'Không có lý do gì để precision@k luôn cao hơn; nó có thể thấp hơn nếu k lớn.',
                '',
                'precision@k vẫn phụ thuộc tỉ lệ lớp dương như mọi chỉ số dựa trên precision.',
                'Vẫn cần nhãn để biết trong k cảnh báo đầu có bao nhiêu cái thật.',
              ],
            },
            {
              id: 't4l7-cp2',
              kind: 'truefalse',
              tags: ['alert-fatigue', 'mttr'],
              q: 'MTTR giảm từ 6 giờ xuống 2 giờ luôn là dấu hiệu tốt.',
              answer: false,
              why: 'MTTR có thể giảm vì ba lý do rất khác nhau: (a) quy trình tốt hơn thật — điều bạn muốn; (b) analyst đóng ticket nhanh hơn mà không điều tra kỹ — mù cảnh báo trá hình; (c) cơ cấu cảnh báo thay đổi, ví dụ hệ thống mới sinh nhiều cảnh báo đơn giản, kéo trung bình xuống trong khi các vụ khó vẫn chậm như cũ. Đây là định luật Goodhart: một chỉ số trở thành mục tiêu thì nó thôi là thước đo tốt. Cách phòng: luôn đọc MTTR **cùng với** tỉ lệ mở lại ticket, tỉ lệ leo thang, và MTTR tách riêng theo mức nghiêm trọng — chứ không bao giờ đọc một mình.',
            },
          ],
        },
        { t: 'h', text: 'Bộ chỉ số lãnh đạo thực sự quan tâm', level: 2 },
        {
          t: 'table',
          head: ['Chỉ số', 'Đơn vị', 'Trả lời câu hỏi', 'Bẫy Goodhart'],
          rows: [
            ['Tải cảnh báo', 'Cảnh báo/ngày và ca-người/ngày', 'Đội có đủ người không, và thiếu bao nhiêu?', 'Giảm tải bằng cách tắt bớt luật mà không đo phần bỏ sót tăng thêm'],
            ['precision@k', '% cảnh báo đúng trong k cảnh báo đầu', 'Thời gian analyst có đang đổ vào việc đúng không?', 'Đẩy k xuống rất thấp để precision đẹp, trong khi recall sụp'],
            ['Recall@k / độ phủ phát hiện', '% vụ thật lọt vào top-k', 'Ta bắt được bao nhiêu phần rủi ro với nguồn lực hiện có?', 'Chỉ đo trên các vụ đã biết, tức bỏ qua toàn bộ điểm mù'],
            ['MTTD', 'Giờ hoặc ngày từ lúc xảy ra tới lúc phát hiện', 'Kẻ tấn công có bao nhiêu thời gian trong nhà?', 'Chỉ tính các vụ tự phát hiện, bỏ qua các vụ do bên ngoài báo'],
            ['MTTR', 'Giờ từ phát hiện tới khống chế', 'Quy trình ứng cứu có trơn không?', 'Đóng ticket nhanh mà không điều tra kỹ'],
            ['Tỉ lệ cảnh báo được điều tra', '%', 'Bao nhiêu phần hàng đợi thực sự có người xem?', 'Tự động đóng hàng loạt để nâng tỉ lệ'],
            ['Chi phí mỗi vụ phát hiện thật', 'USD / vụ', 'Đầu tư có hiệu quả không?', 'Bỏ qua giá trị của việc răn đe và tuân thủ'],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'MTTD, MTTR và thời gian ẩn náu',
          md: '**MTTD** (mean time to detect): trung bình từ lúc hành vi độc hại bắt đầu tới lúc có người biết. **MTTR** (mean time to respond/remediate): từ lúc phát hiện tới lúc khống chế xong.\n\nThước đo họ hàng thường được trích dẫn nhất là **thời gian ẩn náu** (dwell time) trong báo cáo M-Trends của Mandiant — trung vị toàn cầu đã giảm mạnh qua nhiều năm và những năm gần đây ở mức khoảng **10 đến 11 ngày**. Con số này giảm chủ yếu vì tỉ trọng ransomware tăng: ransomware tự công bố sự hiện diện của nó. Nói cách khác, một chỉ số cải thiện có thể phản ánh một thực tế xấu đi.\n\nBài học: mọi chỉ số vận hành đều cần **một câu chuyện nhân quả đi kèm**. Con số không tự giải thích, và người trình bày phải là người hiểu vì sao nó động đậy.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Ba phép tính bạn nên tự động hoá thành báo cáo hằng tuần',
          code:
            "import numpy as np\n" +
            "import pandas as pd\n" +
            "\n" +
            "# --- 1. Tải cảnh báo: từ tỉ lệ ra con người ---\n" +
            "su_kien_ngay = 5_000_000\n" +
            "fpr = 0.0002\n" +
            "phut_moi_canh_bao = 12\n" +
            "phut_huu_ich_moi_ca = 390        # 8 giờ trừ họp, bàn giao, việc khác\n" +
            "\n" +
            "canh_bao_ngay = su_kien_ngay * fpr\n" +
            "ca_nguoi_can = canh_bao_ngay * phut_moi_canh_bao / phut_huu_ich_moi_ca\n" +
            "print('Cảnh báo/ngày:', round(canh_bao_ngay),\n" +
            "      '| Ca-người cần:', round(ca_nguoi_can, 1))\n" +
            "\n" +
            "# --- 2. precision@k và recall@k: chất lượng phần hàng đợi thực sự được xem ---\n" +
            "def tai_k(y, diem, k):\n" +
            "    idx = np.argsort(-diem)[:k]\n" +
            "    tp = y[idx].sum()\n" +
            "    return tp / k, tp / max(y.sum(), 1)\n" +
            "\n" +
            "for k in (50, 100, 195, 500):\n" +
            "    p, r = tai_k(y, diem, k)\n" +
            "    print(f'k={k:4d} | precision@k={p:.3f} | recall@k={r:.3f}')\n" +
            "\n" +
            "# --- 3. Gom nhóm: đổi đơn vị công việc từ cảnh báo sang sự việc ---\n" +
            "df['nhom'] = (df['ten_luat'] + '|' + df['host'] + '|'\n" +
            "              + df['ts'].dt.floor('4h').astype(str))\n" +
            "print('Cảnh báo:', len(df), '| Sự việc:', df['nhom'].nunique(),\n" +
            "      '| Tỉ lệ nén:', round(len(df) / max(df['nhom'].nunique(), 1), 1))\n",
        },
        {
          t: 'checklist',
          title: 'Báo cáo hiệu năng phát hiện hằng tháng — bảy dòng',
          items: [
            'Cảnh báo mỗi ngày (trung vị và phân vị 95), quy ra ca-người cần thiết',
            'Tỉ lệ hàng đợi thực sự được điều tra, và số tồn đọng cuối kỳ',
            'precision@k với k bằng đúng công suất, kèm xu hướng ba tháng',
            'Số vụ thật phát hiện được, tách theo nguồn: mô hình, luật, báo từ bên ngoài',
            'MTTD và MTTR tách theo mức nghiêm trọng, kèm tỉ lệ mở lại ticket',
            'Ước lượng bỏ sót từ mẫu ngẫu nhiên vùng dưới ngưỡng và từ diễn tập purple team',
            'Một quyết định đề xuất kèm con số: siết ngưỡng, tuyển người, hay đầu tư tự động hoá',
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Mù cảnh báo là hiện tượng phi tuyến, không phải tuyến tính',
          md: 'Người ta hay giả định: gấp đôi cảnh báo thì cần gấp đôi người. Sai. Khi hàng đợi vượt quá ngưỡng chịu đựng, hành vi con người **đổi chất**: analyst bắt đầu đóng hàng loạt theo loại luật, bỏ qua cả những cảnh báo đáng lẽ phải xem, và tỉ lệ bỏ sót nhảy vọt chứ không tăng đều.\n\nCác khảo sát ngành lặp đi lặp lại một mô típ: một phần rất lớn cảnh báo không bao giờ được điều tra, và một tỉ lệ đáng kể đội SOC thừa nhận đã từng tắt bớt hoặc hạ độ nhạy của các nguồn cảnh báo ồn ào.\n\nHệ quả thiết kế: **thà 195 cảnh báo được xem kỹ còn hơn 10.000 cảnh báo được xem lướt.** Đây là lý do kỹ thuật, không phải lý do tinh thần, khiến việc xếp hạng và gom nhóm quan trọng hơn việc tăng recall thô.',
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'Cách trình bày 10 phút trước ban giám đốc',
          md: '*“Quý này hệ thống sinh trung bình 1.040 cảnh báo mỗi ngày. Công suất của đội là 195, nên 81% hàng đợi không có người xem. Sau khi bật xếp hạng theo mô hình và gom nhóm, precision trong 195 cảnh báo đầu bảng tăng từ 3% lên 13%, tức mỗi ngày chúng ta phát hiện thêm khoảng 19 vụ thật với đúng số người cũ.*\n\n*Phần chưa xử lý được ước tính bằng lấy mẫu ngẫu nhiên vùng dưới ngưỡng: khoảng 11 vụ mỗi ngày vẫn lọt. Với chi phí kỳ vọng 4.500 USD một vụ, đó là 49.500 USD rủi ro mỗi ngày. Hai lựa chọn: thêm 4 nhân sự, hoặc đầu tư làm giàu ngữ cảnh tự động để giảm thời gian xử lý từ 12 xuống 6 phút — phương án hai rẻ hơn khoảng ba lần.”*\n\nKhông có một chữ nào là PR-AUC. Nhưng toàn bộ bài nói này chỉ dựng được nếu bạn đã đi qua sáu bài trước.',
        },
        { t: 'terms', ids: ['alert-fatigue', 'precision', 'nguong', 'siem', 'soar', 'bao-dong-gia'] },
      ],
      keyTakeaways: [
        'Một ca 8 giờ chỉ có khoảng 390 phút hữu ích; chia cho thời gian xử lý trung bình ra công suất thật của mỗi ca-người.',
        'Giảm thời gian xử lý mỗi cảnh báo bằng làm giàu ngữ cảnh tự động có giá trị tương đương tuyển thêm người, nhưng rẻ hơn nhiều.',
        'Xếp hạng hàng đợi có thể tăng số vụ thật phát hiện được lên hàng chục lần mà không đổi mô hình hay quân số.',
        'Gom nhóm khai thác việc báo động giả lặp lại nhiều hơn cảnh báo thật; tỉ lệ nén 40:1 là bình thường và nó nâng precision mà analyst trải nghiệm lên hàng chục lần.',
        'precision@k với k bằng công suất là chỉ số khớp nhất với công việc thật, vì hàng đợi bị cắt bởi công suất chứ không bởi ngưỡng.',
        'Mù cảnh báo là hiện tượng phi tuyến: vượt ngưỡng chịu đựng thì hành vi đổi chất và bỏ sót nhảy vọt.',
        'Mọi chỉ số vận hành đều có bẫy Goodhart; luôn đọc theo cụm và luôn kèm câu chuyện nhân quả.',
      ],
      cards: [
        {
          id: 't4l7-c1',
          front: 'Một ca trực 8 giờ có bao nhiêu phút thực sự dùng để phân loại cảnh báo, và vì sao không phải 480?',
          back: 'Khoảng 390 phút. Phần còn lại đi vào bàn giao ca, họp, đào tạo, việc dự án và nghỉ. Dùng 480 là nguồn gốc của mọi kế hoạch nhân sự sai.',
          tags: ['alert-fatigue', 'thuc-chien'],
        },
        {
          id: 't4l7-c2',
          front: 'precision@k là gì và k nên đặt bằng bao nhiêu?',
          back: 'Tỉ lệ cảnh báo đúng trong k cảnh báo có điểm cao nhất. k nên đặt bằng đúng công suất xử lý mỗi ngày của đội, vì đó là phần hàng đợi thực sự có người xem.',
          tags: ['precision-at-k', 'alert-fatigue'],
        },
        {
          id: 't4l7-c3',
          front: 'Vì sao gom nhóm cảnh báo lại nâng precision mà analyst trải nghiệm, dù mô hình không đổi?',
          back: 'Vì báo động giả lặp lại nhiều hơn cảnh báo thật, nên tỉ lệ nén của chúng cao hơn hẳn. Đổi đơn vị công việc từ cảnh báo sang sự việc làm rác co lại nhiều hơn hàng thật.',
          tags: ['alert-fatigue'],
        },
        {
          id: 't4l7-c4',
          front: 'Nêu bẫy Goodhart của chỉ số MTTR.',
          back: 'MTTR giảm có thể do đóng ticket nhanh mà không điều tra kỹ, hoặc do cơ cấu cảnh báo đổi. Phải đọc kèm tỉ lệ mở lại ticket và tách theo mức nghiêm trọng.',
          tags: ['mttr', 'thuc-chien'],
        },
        {
          id: 't4l7-c5',
          front: 'Vì sao mù cảnh báo là hiện tượng phi tuyến?',
          back: 'Khi hàng đợi vượt ngưỡng chịu đựng, analyst chuyển sang đóng hàng loạt theo loại luật thay vì xem từng cái, nên tỉ lệ bỏ sót nhảy vọt chứ không tăng đều theo số cảnh báo.',
          tags: ['alert-fatigue'],
        },
      ],
      quiz: [
        {
          id: 't4-l7-q1',
          kind: 'input',
          tags: ['alert-fatigue'],
          q: 'Đội có 3 ca mỗi ngày, 2 analyst mỗi ca, mỗi ca 390 phút hữu ích, trung bình 15 phút một cảnh báo. Công suất tối đa mỗi ngày là bao nhiêu cảnh báo? (Nhập số nguyên)',
          accept: ['156', '156 canh bao', '156/ngay'],
          placeholder: 'Nhập số cảnh báo mỗi ngày…',
          hint: 'Mỗi ca-người xử lý được 390/15 cảnh báo. Có bao nhiêu ca-người mỗi ngày?',
          why: '390 / 15 = 26 cảnh báo mỗi ca-người. 3 ca × 2 người = 6 ca-người → 26 × 6 = **156 cảnh báo mỗi ngày**. Đây chính là giá trị k bạn mang sang bài t4-l4 để đặt ngưỡng top-k, và cũng là k trong precision@k. Chú ý đòn bẩy: nếu làm giàu ngữ cảnh tự động kéo thời gian xử lý từ 15 xuống 10 phút, công suất nhảy lên 234 cảnh báo mỗi ngày — tăng 50% mà không tuyển thêm ai.',
        },
        {
          id: 't4-l7-q2',
          kind: 'mcq',
          tags: ['alert-fatigue', 'precision-at-k'],
          q: 'Hệ thống sinh 8.000 cảnh báo mỗi ngày, trong đó 50 là thật. Đội xử lý được 200. Hành động nào tăng số vụ thật phát hiện được NHIỀU nhất mà không cần tuyển người?',
          options: [
            'Huấn luyện lại mô hình để tăng recall từ 0,80 lên 0,90',
            'Xếp hạng hàng đợi theo điểm mô hình và gom nhóm cảnh báo trùng lặp',
            'Tăng số lượng luật phát hiện để phủ thêm kỹ thuật tấn công',
            'Chuyển từ LightGBM sang một mô hình deep learning',
          ],
          answer: 1,
          why: 'Nút thắt hiện tại không phải khả năng phát hiện mà là **công suất tiêu thụ**: 7.800 trong 8.000 cảnh báo không có người xem. Nếu hàng đợi không sắp xếp, kỳ vọng bắt được chỉ khoảng 50 × 200/8.000 = 1,25 vụ mỗi ngày. Xếp hạng tốt có thể đưa precision@200 lên hai chữ số, tức hàng chục vụ mỗi ngày. Ba phương án còn lại đều đổ thêm nước vào cái xô đang tràn: tăng recall và tăng luật làm hàng đợi dài thêm, còn đổi thuật toán không đụng gì tới nút thắt.',
          distractorWhy: [
            'Recall cao hơn chỉ làm hàng đợi dài thêm khi 97,5% hàng đợi vốn đã không có người xem.',
            '',
            'Thêm luật là thêm cảnh báo — đúng hướng ngược lại với vấn đề đang có.',
            'Đổi kiến trúc mô hình không giải quyết nút thắt về công suất tiêu thụ của con người.',
          ],
        },
        {
          id: 't4-l7-q3',
          kind: 'multi',
          tags: ['alert-fatigue', 'thuc-chien'],
          q: 'Chỉ số nào nên có trong báo cáo hiệu năng phát hiện gửi ban lãnh đạo? (Chọn tất cả đáp án đúng)',
          options: [
            'Số cảnh báo mỗi ngày quy ra ca-người cần thiết',
            'precision@k với k bằng công suất thật của đội',
            'ROC-AUC của mô hình trên tập kiểm tra',
            'Ước lượng bỏ sót từ lấy mẫu ngẫu nhiên vùng dưới ngưỡng',
          ],
          answers: [0, 1, 3],
          why: 'Ba chỉ số được chọn đều quy về đơn vị mà lãnh đạo ra được quyết định: người, chất lượng công việc, và rủi ro tồn dư. ROC-AUC là chỉ số kỹ thuật hữu ích cho **bạn** khi so sánh mô hình, nhưng nó không trả lời được câu hỏi nào của người duyệt ngân sách — và tệ hơn, nó tạo cảm giác an tâm sai vì trông luôn rất cao trong bài toán mất cân bằng. Chỉ số thứ tư là chỉ số hiếm nhất trong thực tế và cũng là chỉ số trung thực nhất: nó là cách duy nhất nhìn thấy ô False Negative.',
        },
        {
          id: 't4-l7-q4',
          kind: 'order',
          tags: ['alert-fatigue', 'quy-trinh'],
          q: 'Đội SOC đang ngập cảnh báo. Sắp xếp các biện pháp theo thứ tự nên thực hiện, từ rẻ và nhanh nhất tới tốn kém nhất.',
          items: [
            'Xếp hạng hàng đợi theo điểm mô hình để cái quan trọng nhất nằm trên cùng',
            'Gom nhóm cảnh báo trùng lặp thành sự việc, đổi đơn vị công việc',
            'Tự động làm giàu ngữ cảnh để giảm thời gian xử lý mỗi cảnh báo',
            'Chỉnh ngưỡng theo chi phí và theo nhóm tài sản',
            'Tuyển thêm nhân sự cho các ca trực',
          ],
          why: 'Thứ tự này theo tỉ lệ hiệu quả trên chi phí giảm dần. Xếp hạng thường triển khai trong vài ngày và cho hiệu ứng lớn nhất. Gom nhóm cần một khoá gộp và ít công cụ. Làm giàu ngữ cảnh cần tích hợp nhưng đổi lại nhân đôi công suất hiệu dụng. Chỉnh ngưỡng theo nhóm tài sản cần thảo luận với chủ sở hữu hệ thống nên chậm hơn về mặt tổ chức. Tuyển người đứng cuối vì đắt nhất, chậm nhất, và — quan trọng nhất — nó không sửa được nguyên nhân gốc, nên hàng đợi sẽ lại đầy sau vài tháng.',
        },
        {
          id: 't4-l7-q5',
          kind: 'truefalse',
          tags: ['alert-fatigue'],
          q: 'Nếu số cảnh báo tăng gấp đôi thì số vụ bị bỏ sót cũng tăng khoảng gấp đôi.',
          answer: false,
          why: 'Quan hệ này phi tuyến. Khi hàng đợi vượt quá ngưỡng chịu đựng, cách làm việc của con người thay đổi về chất: analyst chuyển sang đóng hàng loạt theo loại luật, ngừng đọc chi tiết, và bỏ qua cả những cảnh báo lẽ ra phải xem — nên bỏ sót tăng nhanh hơn nhiều so với tỉ lệ tăng của cảnh báo. Chiều ngược lại cũng đúng và là tin tốt: giảm tải cảnh báo xuống dưới ngưỡng chịu đựng có thể cải thiện tỉ lệ phát hiện mạnh hơn nhiều so với mức bạn dự đoán bằng phép tính tuyến tính.',
        },
      ],
      terms: ['alert-fatigue', 'precision', 'nguong', 'siem', 'soar', 'bao-dong-gia', 'bo-sot'],
      further: [
        {
          title: 'M-Trends — báo cáo thường niên của Mandiant',
          note: 'Nguồn được trích dẫn nhiều nhất về thời gian ẩn náu và tỉ lệ vụ việc do bên ngoài phát hiện. Đọc để có mốc so sánh cho MTTD của tổ chức bạn.',
        },
        {
          title: 'Practical Threat Detection Engineering — Roberts, Wagner & Franklin',
          note: 'Chương về đo lường quy trình phát hiện: cách xây bộ chỉ số vận hành mà đội SOC dùng được hằng tuần, không phải chỉ số nghiên cứu.',
        },
        {
          title: 'MITRE ATT&CK — đo độ phủ kỹ thuật',
          note: 'Bổ sung cho các chỉ số trong bài: độ phủ theo kỹ thuật trả lời câu hỏi “ta mù ở đâu”, thứ mà precision và recall không nói được.',
        },
      ],
    },
  ],
};
