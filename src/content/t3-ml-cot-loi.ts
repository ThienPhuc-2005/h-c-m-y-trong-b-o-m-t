import type { Track } from './types';

/**
 * CHẶNG 3 — Học máy cốt lõi.
 *
 * Đây là chặng "kỹ năng tay nghề". Sau chặng 2 bạn đã có dữ liệu sạch và chia
 * tập đúng; giờ là lúc biến nó thành mô hình. Trình tự có chủ ý:
 *   l1 chọn kiểu học  →  l2-l4 ba mô hình nền (tuyến tính, xác suất, cây)
 *   →  l5 tổ hợp cây (thứ bạn thực sự sẽ dùng)  →  l6 khoảng cách và lề
 *   →  l7 vì sao mô hình hỏng  →  l8 làm sao biết mô hình có thật sự tốt.
 *
 * Nguyên tắc xuyên suốt: mọi thuật toán đều được trình bày kèm CHI PHÍ và
 * GIỚI HẠN của nó. Không có thuật toán nào được bán.
 */
export const track3: Track = {
  id: 'ml-cot-loi',
  order: 3,
  title: 'Học máy cốt lõi',
  tagline: 'Những thuật toán bạn sẽ dùng 90% thời gian',
  icon: 'brain',
  hue: 't3',
  blurb:
    'Tám bài về nhóm thuật toán chiếm gần như toàn bộ công việc ML bảo mật thực tế: hồi quy logistic, Naive Bayes, cây quyết định, Random Forest và gradient boosting, cùng k-NN và SVM. Bạn sẽ hiểu từng mô hình đủ sâu để chọn đúng, chỉnh đúng và biết nó hỏng ở đâu — chứ không phải chỉ gọi được hàm fit.',
  outcomes: [
    'Chọn đúng kiểu học và họ mô hình cho một bài toán bảo mật cụ thể, có lý do bảo vệ được',
    'Đọc và giải thích được trọng số của mô hình tuyến tính cho người không làm kỹ thuật',
    'Huấn luyện và chỉnh một mô hình gradient boosting trên dữ liệu bảng ở mức làm việc thật',
    'Chẩn đoán được mô hình đang thiếu khớp, quá khớp hay đang rò rỉ nhãn — ba bệnh khác nhau, ba cách chữa khác nhau',
    'Đọc feature importance mà không rơi vào bốn cái bẫy phổ biến nhất',
    'Thiết kế quy trình kiểm định và tinh chỉnh siêu tham số cho dữ liệu có tính thời gian',
  ],
  lessons: [
    /* ====================================================================== */
    {
      id: 't3-l1',
      trackId: 'ml-cot-loi',
      title: 'Ba kiểu học và cách chọn',
      subtitle: 'Kiểu học không phải thuộc tính của thuật toán, mà của dữ liệu bạn đang có',
      minutes: 18,
      practiceMinutes: 3,
      level: 'nen-tang',
      prereqs: ['t2-l4'],
      why: {
        short:
          'Chọn sai kiểu học là sai lầm tốn kém nhất và khó sửa nhất — nó quyết định bạn cần loại dữ liệu nào, mất bao lâu, và kết quả cuối cùng có ai dùng được không.',
        scenario:
          'Sếp giao: "Dùng AI phát hiện mối đe doạ nội bộ." Bạn có 18 tháng log đăng nhập và truy cập tệp, và đúng 0 nhãn. Trong 15 phút bạn phải nói được bài toán này thuộc kiểu học nào, cần gì để bắt đầu, và kỳ vọng thực tế trong 3 tháng là gì.',
        roles: ['Security Data Scientist', 'Detection Engineer', 'Security Architect'],
        costOfNotKnowing:
          'Bạn hứa một bộ phân loại trong khi không có nhãn, đốt ba tháng, rồi giao một bộ phát hiện bất thường kêu 4.000 lần mỗi ngày mà không analyst nào mở tới lần thứ hai.',
      },
      objectives: [
        'Phân biệt bốn kiểu học chỉ bằng câu hỏi "dữ liệu huấn luyện của bạn có những gì"',
        'Ghép đúng kiểu học cho sáu bài toán bảo mật cụ thể kèm rào cản thật của từng bài',
        'Giải thích được vì sao học không giám sát KHÔNG phải lời giải cho việc thiếu nhãn',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bạn có 18 tháng log VPN, không có nhãn nào. Một đồng nghiệp đề xuất dùng học không giám sát để "tự tìm ra bất thường". Theo bạn, mười kết quả bất thường nhất mà mô hình chỉ ra sẽ là những gì?',
          reveal:
            'Gần như chắc chắn là: tài khoản dịch vụ sao lưu chạy lúc 3 giờ sáng, một kỹ sư đang công tác ở Nhật, máy chủ giám sát đăng nhập 500 lần mỗi giờ, và một cái máy in. Tất cả đều **hiếm** và không cái nào **độc hại**. Đây là lỗ hổng cốt lõi của mọi phát hiện bất thường: mô hình tối ưu cho "khác thường", còn bạn cần "độc hại". Khoảng cách giữa hai khái niệm đó không phải lỗi kỹ thuật — nó là toàn bộ phần công việc còn lại của bạn.',
        },
        {
          t: 'p',
          md: 'Điều đầu tiên cần gỡ bỏ: **kiểu học không phải thuộc tính của thuật toán, mà là thuộc tính của dữ liệu bạn đang cầm trong tay.** Cùng một mạng nơ-ron có thể chạy có giám sát, không giám sát hoặc tăng cường. Câu hỏi quyết định luôn là: bạn có nhãn không, và nhãn đó đến từ đâu.',
        },
        { t: 'figure', id: 'fig-three-learning', caption: 'Ba kiểu học chính. Điểm khác biệt nằm ở phần đi kèm dữ liệu: có đáp án, không có đáp án, hay chỉ có điểm thưởng sau mỗi hành động.' },
        { t: 'h', text: 'Có giám sát — bạn có cả câu hỏi lẫn đáp án', level: 2 },
        {
          t: 'p',
          md: 'Mỗi mẫu dữ liệu đi kèm một nhãn. Mô hình học ánh xạ từ đặc trưng sang nhãn. Hai dạng: **phân loại** (nhãn là hạng mục: độc/lành, họ mã độc) và **hồi quy** (nhãn là số: bao nhiêu ngày nữa lỗ hổng này bị khai thác).',
        },
        {
          t: 'list',
          items: [
            '**Ví dụ thật trong bảo mật:** bộ dữ liệu EMBER gồm khoảng 1 triệu mẫu tệp PE kèm nhãn và đặc trưng đã trích sẵn — đây là chuẩn chung để so sánh mô hình phân loại mã độc tĩnh.',
            '**Ví dụ trong nội bộ tổ chức:** lịch sử đóng cảnh báo của analyst. Mỗi lần ai đó bấm "báo động giả" là bạn có một nhãn âm miễn phí.',
            '**Điểm mạnh:** đo được rõ ràng. Bạn biết chính xác mô hình đúng bao nhiêu phần trăm và sai theo kiểu nào.',
            '**Điểm yếu:** nhãn là tài nguyên khan hiếm nhất trong bảo mật, và nhãn bạn có thường phản ánh **những gì hệ thống cũ đã phát hiện được**, không phải sự thật.',
          ],
        },
        { t: 'h', text: 'Không giám sát — chỉ có dữ liệu, không có đáp án', level: 2 },
        {
          t: 'p',
          md: 'Mô hình tìm cấu trúc trong dữ liệu mà không ai nói cho nó biết đúng sai. Ba nhánh chính: **phân cụm** (k-means, DBSCAN, HDBSCAN), **phát hiện bất thường** (Isolation Forest, Local Outlier Factor, autoencoder), và **giảm chiều** (PCA, UMAP).',
        },
        {
          t: 'p',
          md: 'Trong bảo mật, không giám sát dùng tốt nhất khi mục tiêu là **thu gọn khối lượng cho con người**, không phải ra quyết định cuối. Gom 200.000 mẫu mã độc thành 340 cụm để analyst chỉ phải xem 340 mẫu đại diện — đó là một chiến thắng rõ ràng. Còn "tự động phát hiện tấn công chưa biết" thì gần như luôn là lời hứa của nhà cung cấp.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Hiểu nhầm đắt nhất trong ngành',
          md: 'Học không giám sát **không** giải quyết vấn đề thiếu nhãn. Nó chỉ dời vấn đề đó sang chỗ khác: bạn vẫn cần nhãn để biết mô hình có tốt không. Một bộ phát hiện bất thường không có nhãn kiểm định chỉ là một máy sinh sự chú ý ngẫu nhiên có bọc toán học. Câu hỏi bạn phải trả lời được trước khi bắt đầu là: **ai sẽ xác nhận 50 bất thường đầu tiên, và trong bao lâu?**',
        },
        { t: 'h', text: 'Bán giám sát — ít nhãn, rất nhiều dữ liệu', level: 2 },
        {
          t: 'p',
          md: 'Đây là tình huống thật của gần như mọi tổ chức: 40 sự cố đã xác nhận và 400 triệu dòng log. Bốn kỹ thuật đáng biết:',
        },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Tự huấn luyện (self-training):** huấn luyện trên phần có nhãn, dự đoán phần chưa nhãn, lấy các dự đoán tự tin nhất làm nhãn giả, huấn luyện lại. Rủi ro: mô hình tự khẳng định sai lầm của chính nó.',
            '**Học chủ động (active learning):** mô hình chọn ra mẫu mà nó **không chắc nhất** và hỏi analyst. Mỗi giờ lao động của analyst mua được nhiều thông tin hơn so với gắn nhãn ngẫu nhiên. Đây thường là lựa chọn đúng nhất trong SOC.',
            '**Giám sát yếu (weak supervision):** viết vài chục hàm gắn nhãn thô (heuristic, luật Sigma, danh sách IOC), rồi để một mô hình tổng hợp học độ tin cậy của từng hàm. Snorkel là công cụ kinh điển cho lối này.',
            '**Học một lớp (one-class):** chỉ dùng dữ liệu lành tính đã được kiểm chứng để mô tả "bình thường", rồi gắn cờ mọi thứ nằm ngoài. Hữu ích cho môi trường ổn định như mạng OT/ICS.',
          ],
        },
        { t: 'h', text: 'Tăng cường — hiếm, nhưng có chỗ dùng thật', level: 2 },
        {
          t: 'p',
          md: 'Agent (agent) quan sát trạng thái, chọn hành động, nhận phần thưởng, và học chính sách tối đa hoá phần thưởng dài hạn. Trong bảo mật, chỗ dùng thật hiện nay khá hẹp: mô phỏng đường tấn công trong môi trường ảo (CyberBattleSim của Microsoft là một ví dụ mã nguồn mở), điều khiển bộ sinh đầu vào trong fuzzing, và tinh chỉnh mô hình ngôn ngữ bằng phản hồi (RLHF).',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Vì sao RL hiếm khi vào được SOC',
          md: 'Học tăng cường cần **hàng triệu lần thử và sai với chi phí gần bằng 0**. SOC thật không có thứ đó: mỗi hành động sai là một dịch vụ bị chặn nhầm hoặc một cuộc tấn công lọt lưới. Ngoài ra phần thưởng đến rất muộn — bạn chỉ biết quyết định cách ly máy hôm nay là đúng sau nhiều tuần. Nếu ai đó bán cho bạn "SOC tự vận hành bằng RL", hãy hỏi họ môi trường mô phỏng được xây thế nào.',
        },
        {
          t: 'table',
          caption: 'Sáu bài toán bảo mật quen thuộc và kiểu học tương ứng — kèm rào cản thật, không phải rào cản trên slide.',
          head: ['Bài toán', 'Kiểu học', 'Cần có gì', 'Rào cản thật'],
          rows: [
            ['Xếp hạng cảnh báo SOC', 'Có giám sát', 'Lịch sử đóng cảnh báo của analyst', 'Nhãn thiên lệch theo thói quen từng người'],
            ['Phân loại mã độc PE', 'Có giám sát', 'Mẫu độc và lành có mốc thời gian', 'Nhãn VirusTotal thay đổi theo tháng'],
            ['Gom cụm mã độc thành họ', 'Không giám sát', 'Đặc trưng tĩnh hoặc động, không cần nhãn', 'Không có sự thật nền để chấm điểm cụm'],
            ['Phát hiện beaconing C2', 'Không giám sát + luật', 'NetFlow đủ dài để thấy chu kỳ', 'Phần mềm hợp lệ cũng beacon đều đặn'],
            ['Mối đe doạ nội bộ', 'Bán giám sát', 'Vài chục vụ đã xác nhận + hàng triệu bản ghi', 'Quá ít ca dương để huấn luyện trực tiếp'],
            ['Sinh đường tấn công tự động', 'Tăng cường', 'Môi trường mô phỏng chạy được hàng triệu lượt', 'Mô phỏng không đủ giống mạng thật'],
          ],
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't3l1-cp1',
              kind: 'mcq',
              tags: ['kieu-hoc', 'khong-giam-sat'],
              q: 'Bạn triển khai một bộ phát hiện bất thường trên log đăng nhập. Sau một tuần nó gắn cờ 600 phiên. Bước tiếp theo quan trọng nhất là gì?',
              options: [
                'Tăng ngưỡng để giảm số cờ xuống mức chịu được',
                'Cho analyst xác nhận một mẫu ngẫu nhiên trong 600 phiên để biết tỉ lệ đúng thực tế',
                'Đổi sang thuật toán bất thường khác mạnh hơn',
                'Thêm nhiều đặc trưng hơn để mô hình nhạy hơn',
              ],
              answer: 1,
              why: 'Bạn chưa biết bộ phát hiện này tốt hay tệ — mọi hành động chỉnh sửa trước khi đo đều là đoán mò. Lấy mẫu ngẫu nhiên 40–60 phiên và xác nhận cho bạn ước lượng độ chính xác đầu tiên, đồng thời sinh ra những nhãn đầu tiên để chuyển dần sang bán giám sát. Đây là bước biến một mô hình không giám sát thành một hệ thống đo được.',
              distractorWhy: [
                'Tăng ngưỡng làm giảm số cờ nhưng bạn vẫn không biết mình đang bỏ đi cái gì.',
                '',
                'Đổi thuật toán khi chưa có thước đo thì không cách nào biết cái mới có tốt hơn không.',
                'Thêm đặc trưng vào một hệ thống chưa đo được chỉ làm tăng nhiễu.',
              ],
            },
            {
              id: 't3l1-cp2',
              kind: 'truefalse',
              tags: ['kieu-hoc'],
              q: 'Isolation Forest là thuật toán không giám sát, nên có thể dùng nó mà không cần bất kỳ nhãn nào ở bất kỳ giai đoạn nào.',
              answer: false,
              why: 'Huấn luyện thì không cần nhãn, nhưng **kiểm định thì cần**. Không có nhãn, bạn không biết nên đặt ngưỡng ở đâu, không so sánh được hai cấu hình, và không phát hiện được khi mô hình xuống cấp. Nhãn dùng để đánh giá thường ít hơn nhiều so với nhãn dùng để huấn luyện — nhưng con số đó không bao giờ là 0.',
            },
          ],
        },
        {
          t: 'steps',
          title: 'Bốn câu hỏi chọn kiểu học trong 5 phút',
          steps: [
            {
              title: '1. Bạn có bao nhiêu nhãn dương, đếm bằng số nguyên?',
              md: 'Không phải "chúng tôi có nhiều dữ liệu" mà là "chúng tôi có 213 sự cố đã xác nhận". Dưới ~100 ca dương thì học có giám sát trực tiếp gần như chắc chắn thất bại — hãy đi hướng bán giám sát hoặc luật.',
            },
            {
              title: '2. Nhãn đến từ đâu, và nó bỏ sót cái gì?',
              md: 'Nếu nhãn dương của bạn đến từ chính hệ thống phát hiện cũ, mô hình mới sẽ học lại đúng điểm mù của hệ thống cũ. Nhãn từ điều tra sự cố độc lập hoặc từ red team có giá trị cao hơn nhiều lần.',
            },
            {
              title: '3. Bạn cần tìm "khác thường" hay "độc hại"?',
              md: 'Nếu hành vi tấn công bạn quan tâm trông **giống** hành vi bình thường (chiếm dụng tài khoản hợp lệ, living-off-the-land), phát hiện bất thường sẽ chìm trong nhiễu. Nếu tấn công thực sự tạo ra dấu vết lạ về mặt thống kê (quét cổng, trích xuất dữ liệu ồ ạt), bất thường có cửa.',
            },
            {
              title: '4. Đầu ra đi về đâu, với ngân sách bao nhiêu cảnh báo mỗi ngày?',
              md: 'Hỏi đội SOC con số cụ thể trước khi viết dòng code đầu tiên. Ngân sách 30 cảnh báo/ngày và ngân sách 3 cảnh báo/ngày dẫn tới hai thiết kế hoàn toàn khác nhau. Không có câu trả lời này thì mọi lựa chọn kỹ thuật phía sau đều tuỳ tiện.',
            },
          ],
        },
        {
          t: 'compare',
          title: 'Hai đường đi, hai bộ điều kiện',
          left: {
            title: 'Phân loại có giám sát',
            icon: 'target',
            items: [
              'Cần ít nhất vài trăm ca dương có nhãn tin được',
              'Đo được bằng precision/recall trên tập kiểm tra',
              'Bắt tốt những gì giống dữ liệu huấn luyện',
              'Mù trước kỹ thuật tấn công chưa từng xuất hiện trong nhãn',
              'Dễ giải trình: có nhãn thì có bằng chứng',
            ],
          },
          right: {
            title: 'Phát hiện bất thường',
            icon: 'scatter',
            items: [
              'Bắt đầu được với 0 nhãn dương',
              'Rất khó đo nếu không có quy trình xác nhận',
              'Có cửa bắt kỹ thuật mới nếu nó tạo dấu vết thống kê lạ',
              'Ngập trong bất thường lành tính khi môi trường biến động',
              'Cần con người trong vòng lặp, không thể chạy tự động',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Mẹo thực chiến: đừng chọn một, hãy xếp tầng',
          md: 'Kiến trúc phát hiện trưởng thành hầu như luôn là: **luật** bắt cái đã biết → **mô hình có giám sát** xếp hạng phần còn lại → **bất thường** quét phần mà hai lớp trên không chạm tới, đưa cho threat hunter chứ không đưa vào hàng đợi cảnh báo. Ba lớp này phục vụ ba người khác nhau với ba mức chịu đựng sai sót khác nhau.',
        },
        { t: 'terms', ids: ['co-giam-sat', 'khong-giam-sat', 'bat-thuong', 'active-learning', 'weak-supervision'] },
      ],
      keyTakeaways: [
        'Kiểu học được quyết định bởi dữ liệu bạn có, không phải bởi thuật toán bạn thích.',
        'Học không giám sát không giải quyết việc thiếu nhãn — nó vẫn cần nhãn để kiểm định và đặt ngưỡng.',
        'Bất thường tối ưu cho "hiếm", còn bạn cần "độc hại"; khoảng cách giữa hai thứ đó là công việc của bạn.',
        'Tình huống thật của hầu hết tổ chức là bán giám sát: vài chục nhãn dương và hàng triệu bản ghi.',
        'Học tăng cường cần môi trường thử sai rẻ tiền — SOC thật không có, nên RL hiếm khi vào production.',
        'Kiến trúc tốt xếp tầng luật + có giám sát + bất thường, mỗi tầng phục vụ một người dùng khác nhau.',
      ],
      cards: [
        {
          id: 't3l1-c1',
          front: 'Câu hỏi duy nhất quyết định bạn dùng kiểu học nào là gì?',
          back: 'Dữ liệu huấn luyện của bạn có nhãn không, bao nhiêu nhãn dương, và nhãn đó đến từ đâu. Kiểu học là thuộc tính của dữ liệu, không phải của thuật toán.',
          tags: ['kieu-hoc'],
        },
        {
          id: 't3l1-c2',
          front: 'Vì sao học không giám sát KHÔNG phải lời giải cho việc thiếu nhãn?',
          back: 'Vì bạn vẫn cần nhãn để kiểm định, đặt ngưỡng và phát hiện xuống cấp. Không có nhãn đánh giá, bộ phát hiện bất thường chỉ là máy sinh sự chú ý không đo được.',
          tags: ['khong-giam-sat', 'bat-thuong'],
        },
        {
          id: 't3l1-c3',
          front: 'Học chủ động (active learning) hoạt động thế nào và vì sao hợp với SOC?',
          back: 'Mô hình chọn ra mẫu nó không chắc nhất và hỏi analyst. Mỗi giờ lao động gắn nhãn mua được nhiều thông tin hơn hẳn so với gắn nhãn ngẫu nhiên.',
          tags: ['active-learning', 'ban-giam-sat'],
        },
        {
          id: 't3l1-c4',
          front: 'Nêu ba tầng của một kiến trúc phát hiện trưởng thành.',
          back: 'Luật bắt cái đã biết; mô hình có giám sát xếp hạng phần còn lại; phát hiện bất thường quét phần chưa ai chạm tới và đưa cho threat hunter.',
          tags: ['kien-truc', 'thuc-chien'],
        },
      ],
      quiz: [
        {
          id: 't3l1-q1',
          kind: 'mcq',
          tags: ['kieu-hoc', 'ban-giam-sat'],
          q: 'Tổ chức của bạn có 12 vụ nội gián đã xác nhận trong 5 năm và khoảng 400 triệu bản ghi log hành vi. Hướng đi thực tế nhất?',
          options: [
            'Huấn luyện ngay một bộ phân loại nhị phân trên 12 ca dương đó',
            'Bắt đầu bằng phát hiện bất thường có con người xác nhận, tích luỹ nhãn qua học chủ động',
            'Dùng SMOTE nhân 12 ca lên 40.000 mẫu tổng hợp rồi huấn luyện có giám sát',
            'Kết luận bài toán này không làm được bằng ML',
          ],
          answer: 1,
          why: '12 ca dương là quá ít để mô hình học được bất cứ quy luật nào tổng quát — nó sẽ ghi nhớ 12 con người cụ thể. Đường đi thực tế là dùng bất thường để thu hẹp không gian tìm kiếm, cho analyst xác nhận, và mỗi lần xác nhận là một nhãn mới. Sau 12–18 tháng bạn có thể có vài trăm nhãn và lúc đó mới chuyển sang có giám sát.',
          distractorWhy: [
            'Với 12 mẫu, mô hình ghi nhớ đặc điểm cá nhân của 12 người đó chứ không học được hành vi nội gián.',
            '',
            'SMOTE nội suy giữa các mẫu đã có; từ 12 điểm nó không tạo ra thông tin mới, chỉ tạo ra ảo giác về kích thước dữ liệu và làm chỉ số kiểm định phồng lên.',
            'Sai — có làm được, nhưng phải bắt đầu từ bán giám sát chứ không phải từ phân loại.',
          ],
        },
        {
          id: 't3l1-q2',
          kind: 'match',
          tags: ['kieu-hoc'],
          q: 'Nối mỗi bài toán với kiểu học phù hợp nhất khi bắt đầu.',
          pairs: [
            ['Gom 200.000 mẫu mã độc thành các họ', 'Không giám sát (phân cụm)'],
            ['Xếp hạng cảnh báo dựa trên 3 năm lịch sử xử lý', 'Có giám sát'],
            ['40 sự cố đã xác nhận, 400 triệu dòng log', 'Bán giám sát / học chủ động'],
            ['Tối ưu chuỗi hành động của agent trong môi trường mô phỏng', 'Tăng cường'],
          ],
          why: 'Bốn cặp này bao trọn phổ tình huống bạn sẽ gặp. Điểm chung: kiểu học được suy ra từ dữ liệu sẵn có, không phải từ mức độ "hiện đại" của thuật toán. Nếu nhớ được bốn cặp này, bạn đã có phản xạ đúng cho phần lớn cuộc họp đầu tiên của một dự án.',
        },
        {
          id: 't3l1-q3',
          kind: 'truefalse',
          tags: ['bat-thuong'],
          q: 'Một hành vi càng hiếm trong dữ liệu thì càng có khả năng là tấn công.',
          answer: false,
          why: 'Sai, và đây là ngộ nhận nguy hiểm nhất về phát hiện bất thường. Trong mọi mạng thật, phần lớn hành vi hiếm là hợp lệ: tài khoản dịch vụ chạy hằng đêm, kỹ sư đi công tác, một đợt cài đặt phần mềm mới. Ngược lại, những cuộc tấn công nguy hiểm nhất — chiếm dụng tài khoản hợp lệ, living-off-the-land — cố tình trông **rất bình thường**.',
        },
        {
          id: 't3l1-q4',
          kind: 'order',
          tags: ['kieu-hoc', 'thuc-chien'],
          q: 'Bạn bắt đầu từ 0 nhãn. Sắp xếp các bước xây dựng năng lực phát hiện theo thứ tự hợp lý.',
          items: [
            'Hỏi đội SOC ngân sách cảnh báo mỗi ngày chịu được là bao nhiêu',
            'Viết luật cho những kỹ thuật tấn công đã biết chắc chắn',
            'Chạy phát hiện bất thường trên phần còn lại và cho analyst xác nhận mẫu',
            'Tích luỹ nhãn từ kết quả xác nhận qua học chủ động',
            'Huấn luyện mô hình có giám sát khi đã đủ vài trăm nhãn dương',
          ],
          why: 'Thứ tự này phản ánh nguyên tắc "rẻ trước, đắt sau". Ngân sách cảnh báo là ràng buộc thiết kế nên phải biết đầu tiên. Luật cho cái đã biết gần như miễn phí. Bất thường mở đường cho việc sinh nhãn. Và mô hình có giám sát — thứ nhiều người muốn làm ngay từ ngày đầu — thực ra là bước cuối cùng, khi đã có nguyên liệu.',
        },
      ],
      terms: ['co-giam-sat', 'khong-giam-sat', 'bat-thuong', 'active-learning', 'weak-supervision', 'ueba'],
      further: [
        {
          title: 'scikit-learn User Guide — Semi-supervised learning và Outlier detection',
          note: 'Hai chương ngắn, đọc để thấy ranh giới thật giữa các họ thuật toán thay vì ranh giới trên slide marketing.',
        },
        {
          title: 'Snorkel — lập trình hoá việc gắn nhãn bằng hàm gắn nhãn',
          note: 'Cách tiếp cận giám sát yếu đã được dùng ở quy mô công nghiệp. Rất hợp với bảo mật vì bạn đã sẵn có hàng trăm heuristic.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't3-l2',
      trackId: 'ml-cot-loi',
      title: 'Hồi quy logistic',
      subtitle: 'Một phép cộng có trọng số, một hàm bóp về khoảng 0–1, và một mô hình bạn giải thích được cho luật sư',
      minutes: 19,
      practiceMinutes: 7,
      level: 'co-ban',
      prereqs: ['t3-l1', 't1-l6'],
      why: {
        short:
          'Hồi quy logistic là đường cơ sở bạn phải đánh bại trước khi được phép dùng bất cứ thứ gì phức tạp hơn — và trong nhiều hệ thống chạy thật, nó vẫn là mô hình cuối cùng chứ không chỉ là bước đệm.',
        scenario:
          'Bạn cần bộ chấm điểm URL phishing chạy inline trên proxy: ngân sách 1 mili-giây mỗi request, mô hình phải nằm gọn trong vài trăm kilobyte, và đội tuân thủ yêu cầu giải thích được vì sao từng URL bị chặn. Deep learning bị loại ngay từ vòng gửi xe.',
        roles: ['Detection Engineer', 'Security Data Scientist', 'ML Engineer', 'SOC Analyst'],
        costOfNotKnowing:
          'Bạn nhảy thẳng vào mô hình phức tạp, không có đường cơ sở để so, nên khi thấy AUC 0,97 bạn không biết đó là mô hình giỏi hay là rò rỉ nhãn — và bạn cũng không trả lời được câu hỏi "vì sao chặn cái này" của kiểm toán.',
      },
      objectives: [
        'Tính được điểm số và xác suất đầu ra của hồi quy logistic bằng tay cho một mẫu cụ thể',
        'Diễn giải đúng hệ số của mô hình theo ngôn ngữ log-odds và tỉ số odds',
        'Chỉ ra ba điều kiện khiến việc đọc hệ số trở nên sai lệch, và cách xử lý từng điều kiện',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Bắt đầu bằng một URL thật: `http://secure-login-verify.paypa1-support.top/auth/index.php?id=7712`. Bạn nhìn vào và thấy ngay bốn dấu hiệu: tên miền cấp cao lạ, chữ số thay chữ cái trong thương hiệu, chuỗi từ khoá gợi đăng nhập, và độ dài bất thường. Hồi quy logistic làm đúng việc bạn vừa làm — chỉ khác là nó gán cho mỗi dấu hiệu một **trọng số bằng số** học được từ dữ liệu, thay vì cảm giác.',
        },
        { t: 'h', text: 'Bộ máy: một phép cộng và một cái bóp', level: 2 },
        {
          t: 'p',
          md: 'Bước 1 — tính **điểm tuyến tính**: `z = w1*x1 + w2*x2 + ... + wn*xn + b`. Đây đúng là phép cộng có trọng số, không hơn. Bước 2 — bóp `z` về khoảng (0, 1) bằng **hàm sigmoid**: `p = 1 / (1 + e^(-z))`.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao phải bóp',
          md: '`z` có thể là -37 hoặc +412 — không dùng làm xác suất được. Sigmoid biến nó thành một số trong (0, 1) theo cách rất có ý nghĩa: `z = 0` cho `p = 0,5`; `z` dương lớn cho `p` gần 1; `z` âm lớn cho `p` gần 0. Quan trọng hơn, sigmoid có nghịch đảo đẹp: `z = log(p / (1-p))`. Nghĩa là **điểm tuyến tính chính là log của tỉ lệ cược (log-odds)**. Toàn bộ khả năng diễn giải của mô hình này nằm ở một dòng đó.',
        },
        {
          t: 'steps',
          title: 'Tính bằng tay cho URL ở trên',
          steps: [
            {
              title: 'Bước 1 — Liệt kê đặc trưng và giá trị',
              md: 'Giả sử mô hình dùng 4 đặc trưng: `so_dau_cham = 3`, `co_chu_so_trong_ten_mien = 1`, `tld_hiem = 1`, `do_dai_url_chuan_hoa = 1,2` (đã chuẩn hoá về z-score, tức là dài hơn trung bình 1,2 độ lệch chuẩn).',
            },
            {
              title: 'Bước 2 — Nhân với trọng số đã học',
              md: 'Giả sử `w = [0,35 ; 1,80 ; 2,10 ; 0,60]` và `b = -3,2`. Ta có: `0,35*3 = 1,05`; `1,80*1 = 1,80`; `2,10*1 = 2,10`; `0,60*1,2 = 0,72`.',
            },
            {
              title: 'Bước 3 — Cộng lại thành z',
              md: '`z = 1,05 + 1,80 + 2,10 + 0,72 - 3,2 = 2,47`. Số âm `b = -3,2` là **độ lệch (bias)**: nó phản ánh việc phần lớn URL trên đời là lành tính, nên mô hình xuất phát từ vị trí nghi ngờ thấp.',
            },
            {
              title: 'Bước 4 — Bóp qua sigmoid',
              md: '`p = 1 / (1 + e^(-2,47)) = 1 / (1 + 0,0846) ≈ 0,922`. Mô hình cho URL này xác suất phishing khoảng **92%**.',
            },
            {
              title: 'Bước 5 — Đọc đóng góp của từng đặc trưng',
              md: 'Sắp xếp các số hạng: TLD hiếm đóng góp 2,10, chữ số trong tên miền 1,80, số dấu chấm 1,05, độ dài 0,72. Đây chính là lời giải thích bạn đưa cho analyst — và nó **cộng lại đúng bằng z**, không phải một xấp xỉ. Không mô hình phức tạp nào cho bạn điều này miễn phí.',
            },
          ],
        },
        { t: 'figure', id: 'fig-feature-space', caption: 'Hồi quy logistic vẽ một siêu phẳng trong không gian đặc trưng. Mọi điểm cùng phía là cùng một hướng dự đoán; càng xa mặt phẳng, xác suất càng cực đoan.' },
        {
          t: 'predict',
          question:
            'Bạn đang dùng đặc trưng "số byte đã gửi", đo bằng byte, và mô hình học được hệ số 0,000004. Bây giờ bạn đổi đơn vị sang megabyte (chia mọi giá trị cho 1.048.576) rồi huấn luyện lại. Hệ số mới sẽ ra sao?',
          reveal:
            'Nó sẽ tăng lên khoảng **1.048.576 lần**, tức xấp xỉ 4,2. Mô hình hoàn toàn không đổi — cùng ranh giới quyết định, cùng dự đoán, cùng AUC. Chỉ có con số hệ số đổi vì đơn vị đổi. Đây là lý do vì sao **so sánh độ lớn hệ số giữa các đặc trưng có đơn vị khác nhau là vô nghĩa**. Muốn so sánh, bạn phải chuẩn hoá tất cả đặc trưng về cùng thang (thường là z-score) TRƯỚC khi huấn luyện. Rất nhiều bản trình bày "đặc trưng quan trọng nhất" sai chính xác ở chỗ này.',
        },
        { t: 'h', text: 'Đọc hệ số cho đúng', level: 2 },
        {
          t: 'p',
          md: 'Hệ số `wj` trả lời câu: khi `xj` tăng thêm 1 đơn vị (và mọi thứ khác giữ nguyên), **log-odds** tăng thêm `wj`. Nếu bạn thích ngôn ngữ dễ hiểu hơn, hãy lấy `e^wj` — đó là **tỉ số odds (odds ratio)**: cược bị coi là độc hại nhân lên bấy nhiêu lần.',
        },
        {
          t: 'table',
          caption: 'Bảng quy đổi bỏ túi giữa hệ số và tỉ số odds.',
          head: ['Hệ số w', 'e^w (tỉ số odds)', 'Đọc thành lời'],
          rows: [
            ['+2,10', '≈ 8,2', 'Đặc trưng bật lên làm cược độc hại tăng khoảng 8 lần'],
            ['+0,69', '≈ 2,0', 'Nhân đôi cược'],
            ['0', '1,0', 'Không ảnh hưởng gì'],
            ['-0,69', '≈ 0,5', 'Giảm cược một nửa — đây là đặc trưng bảo vệ'],
            ['-2,30', '≈ 0,1', 'Giảm cược 10 lần'],
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Ba điều kiện phá vỡ việc đọc hệ số',
          md: '**(1) Chưa chuẩn hoá.** Hệ số lớn có thể chỉ vì đơn vị nhỏ. Luôn chuẩn hoá trước khi so sánh độ lớn.\n\n**(2) Đặc trưng tương quan.** Nếu `do_dai_url` và `so_ky_tu_dac_biet` tương quan 0,9, mô hình có thể chia đôi trọng số cho cả hai, hoặc dồn hết cho một cái và cho cái kia hệ số âm kỳ quặc. Cả hai đều **không** có nghĩa là đặc trưng đó không quan trọng.\n\n**(3) Hệ số không phải nhân quả.** `co_chu_so_trong_ten_mien` có hệ số cao không có nghĩa là chữ số gây ra phishing. Nó chỉ có nghĩa là trong dữ liệu này, hai thứ đi cùng nhau. Đừng bao giờ nói với sếp câu "mô hình chứng minh rằng...".',
        },
        { t: 'h', text: 'Huấn luyện: vì sao mô hình này dễ tính', level: 2 },
        {
          t: 'p',
          md: 'Hàm mất mát là **log loss** (còn gọi cross-entropy): phạt rất nặng khi mô hình tự tin mà sai. Dự đoán `p = 0,99` cho một mẫu thực ra là lành tính bị phạt gấp nhiều lần so với dự đoán `p = 0,6`. Đây chính là thứ đẩy mô hình về phía xác suất trung thực thay vì chỉ đúng nhãn.',
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Một tính chất đáng giá: hàm mất mát lồi',
          md: 'Với hồi quy logistic, mặt lỗi là **lồi (convex)** — nó chỉ có đúng một đáy. Nghĩa là gradient descent chạy từ điểm khởi tạo nào cũng về cùng một nghiệm tối ưu, không có cực tiểu địa phương để mắc kẹt, và chạy lại hai lần cho đúng cùng kết quả. Mạng nơ-ron thì ngược lại: mặt lỗi lồi lõm, khởi tạo khác nhau cho mô hình khác nhau. Tính lặp lại được này rất có giá trị khi bạn phải giải trình một quyết định chặn từ sáu tháng trước.',
        },
        { t: 'figure', id: 'fig-gradient-descent', caption: 'Gradient descent trên mặt lỗi. Với hồi quy logistic mặt này là một cái bát — đi hướng nào cũng về đáy.' },
        {
          t: 'code',
          lang: 'python',
          caption: 'Đường cơ sở đầy đủ trong 20 dòng: pipeline, chuẩn hoá, cân bằng lớp, đọc hệ số',
          code:
            "import numpy as np\n" +
            "import pandas as pd\n" +
            "from sklearn.pipeline import Pipeline\n" +
            "from sklearn.preprocessing import StandardScaler\n" +
            "from sklearn.linear_model import LogisticRegression\n" +
            "from sklearn.metrics import average_precision_score\n" +
            "\n" +
            "# X: DataFrame đặc trưng URL đã trích. y: 1 = phishing, 0 = lành tính.\n" +
            "# LƯU Ý: X_train phải sớm hơn X_test theo thời gian (xem chặng 2, bài t2-l6).\n" +
            "pipe = Pipeline([\n" +
            "    ('scale', StandardScaler()),          # BẮT BUỘC nếu muốn so sánh hệ số\n" +
            "    ('clf', LogisticRegression(\n" +
            "        penalty='l2', C=1.0,              # C nhỏ = phạt mạnh = mô hình đơn giản hơn\n" +
            "        class_weight='balanced',          # bù cho việc phishing là lớp hiếm\n" +
            "        max_iter=2000, solver='lbfgs')),\n" +
            "])\n" +
            "pipe.fit(X_train, y_train)\n" +
            "\n" +
            "p = pipe.predict_proba(X_test)[:, 1]\n" +
            "print('PR-AUC:', round(average_precision_score(y_test, p), 4))\n" +
            "\n" +
            "# Đọc hệ số: sắp theo độ lớn, kèm tỉ số odds cho dễ nói bằng lời\n" +
            "w = pipe.named_steps['clf'].coef_[0]\n" +
            "bang = pd.DataFrame({'dac_trung': X_train.columns, 'he_so': w})\n" +
            "bang['ti_so_odds'] = np.exp(bang['he_so']).round(2)\n" +
            "print(bang.reindex(bang['he_so'].abs().sort_values(ascending=False).index).head(10))\n",
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't3l2-cp1',
              kind: 'mcq',
              tags: ['hoi-quy-logistic', 'regularization'],
              q: 'Trong scikit-learn, bạn giảm tham số C của LogisticRegression từ 1,0 xuống 0,01. Chuyện gì xảy ra?',
              options: [
                'Mô hình được phạt mạnh hơn, các hệ số bị kéo về gần 0, mô hình đơn giản hơn',
                'Mô hình được phạt nhẹ hơn và dễ quá khớp hơn',
                'Tốc độ học giảm đi 100 lần nhưng mô hình cuối cùng giống hệt',
                'Ngưỡng quyết định chuyển từ 0,5 xuống 0,01',
              ],
              answer: 0,
              why: 'C là **nghịch đảo** của cường độ phạt: `C = 1/lambda`. C nhỏ nghĩa là lambda lớn, tức phạt mạnh, tức hệ số bị co về 0 và mô hình đơn giản hơn. Đây là một trong những nhầm lẫn phổ biến nhất khi chuyển từ ký hiệu toán học (lambda) sang API của scikit-learn (C). Nhớ bằng câu: **C nhỏ, mô hình ngoan**.',
              distractorWhy: [
                '',
                'Ngược lại — C lớn mới là phạt nhẹ.',
                'C không liên quan gì tới tốc độ học; nó là hệ số của số hạng phạt trong hàm mất mát.',
                'Ngưỡng quyết định là tham số riêng khi bạn chuyển xác suất thành nhãn, không dính tới C.',
              ],
            },
            {
              id: 't3l2-cp2',
              kind: 'truefalse',
              tags: ['hoi-quy-logistic'],
              q: 'Vì hồi quy logistic là mô hình tuyến tính nên nó không thể học được quy luật kiểu "URL nguy hiểm khi RẤT ngắn hoặc RẤT dài".',
              answer: false,
              why: 'Nó tuyến tính **trong không gian đặc trưng bạn đưa vào** — chứ không phải trong không gian dữ liệu gốc. Quy luật hình chữ U ở trên bạn học được ngay bằng cách thêm đặc trưng `(do_dai - trung_binh)^2`, hoặc bằng cách chia độ dài thành các khoảng rồi one-hot. Đây chính là lý do vì sao kỹ thuật đặc trưng (chặng 5) làm cho mô hình tuyến tính mạnh hơn nhiều so với danh tiếng của nó.',
            },
          ],
        },
        { t: 'lab', id: 'lab-logistic', intro: 'Tự chỉnh trọng số cho từng đặc trưng URL, xem ranh giới quyết định dịch chuyển và xác suất thay đổi theo thời gian thực.' },
        { t: 'h', text: 'Vì sao mô hình 70 tuổi này vẫn sống khoẻ trong bảo mật', level: 2 },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Rất mạnh trên không gian thưa nhiều chiều.** Biểu diễn URL hoặc dòng log bằng TF-IDF trên n-gram ký tự cho ra hàng chục nghìn cột thưa. Ở đó mô hình tuyến tính thường ngang ngửa hoặc thắng gradient boosting, mà nhanh hơn nhiều bậc.',
            '**Suy luận gần như miễn phí.** Một phép nhân vector: vài micro-giây, vài trăm kilobyte bộ nhớ. Đủ để chạy inline trên proxy hoặc nhúng vào agent trên endpoint.',
            '**Xác suất tương đối trung thực.** Vì hàm mất mát là log loss, đầu ra thường đã gần hiệu chuẩn — quan trọng khi bạn cần xếp hạng theo rủi ro hoặc nhân với chi phí (chặng 4).',
            '**Giải trình được ở mức từng quyết định.** Bạn liệt kê được đóng góp của từng đặc trưng cho đúng URL này, và tổng của chúng bằng đúng điểm số. Với gradient boosting bạn phải viện đến SHAP; với mô hình tuyến tính thì đó là phép cộng.',
            '**Là thước đo cho mọi thứ phía sau.** Nếu mô hình phức tạp của bạn chỉ hơn hồi quy logistic 0,3 điểm PR-AUC, hãy nghiêm túc cân nhắc chi phí vận hành trước khi triển khai nó.',
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Cái giá của class_weight balanced',
          md: 'Đặt trọng số lớp để bù mất cân bằng làm tăng recall, nhưng nó **phá hiệu chuẩn xác suất**: đầu ra 0,8 không còn nghĩa là "80% khả năng độc hại" mà là một điểm số đã bị kéo lên. Nếu quy trình phía sau của bạn dùng xác suất để tính chi phí kỳ vọng, hãy hiệu chuẩn lại bằng `CalibratedClassifierCV` trên một tập giữ riêng. Chi tiết ở chặng 4.',
        },
        { t: 'terms', ids: ['hoi-quy-logistic', 'regularization', 'duong-co-so', 'hieu-chuan', 'gradient-descent'] },
      ],
      keyTakeaways: [
        'Hồi quy logistic = tổng có trọng số (z) + sigmoid; và z chính là log-odds, đó là toàn bộ nguồn gốc khả năng diễn giải.',
        'Hệ số w nghĩa là: tăng đặc trưng 1 đơn vị thì log-odds tăng w; e^w là tỉ số odds, dễ nói bằng lời hơn.',
        'So sánh độ lớn hệ số chỉ hợp lệ sau khi đã chuẩn hoá đặc trưng về cùng thang.',
        'Đặc trưng tương quan làm trọng số bị chia hoặc bị đảo dấu — đó không phải bằng chứng đặc trưng vô dụng.',
        'Hàm mất mát lồi nên huấn luyện lặp lại cho cùng kết quả — tính chất quý khi phải giải trình về sau.',
        'Mô hình tuyến tính rất mạnh trên đặc trưng thưa nhiều chiều và rẻ đến mức chạy được inline; luôn dùng nó làm đường cơ sở.',
      ],
      cards: [
        {
          id: 't3l2-c1',
          front: 'Hồi quy logistic biến điểm tuyến tính z thành xác suất bằng cách nào, và z có ý nghĩa gì?',
          back: 'Bằng sigmoid: p = 1/(1+e^(-z)). Nghịch đảo của nó cho thấy z = log(p/(1-p)), tức z chính là log-odds.',
          tags: ['hoi-quy-logistic'],
        },
        {
          id: 't3l2-c2',
          front: 'Hệ số w = 0,69 của một đặc trưng nhị phân nghĩa là gì bằng lời thường?',
          back: 'e^0,69 ≈ 2, nên khi đặc trưng đó bật lên, cược bị coi là độc hại nhân đôi (giữ nguyên mọi thứ khác).',
          tags: ['hoi-quy-logistic'],
        },
        {
          id: 't3l2-c3',
          front: 'Vì sao không được so sánh độ lớn hệ số giữa các đặc trưng chưa chuẩn hoá?',
          back: 'Vì hệ số phụ thuộc đơn vị đo. Đổi byte sang megabyte làm hệ số tăng hơn một triệu lần trong khi mô hình không đổi chút nào.',
          tags: ['hoi-quy-logistic', 'dac-trung'],
        },
        {
          id: 't3l2-c4',
          front: 'Trong scikit-learn, C nhỏ hơn nghĩa là gì?',
          back: 'Phạt mạnh hơn (C = 1/lambda), hệ số bị kéo về gần 0, mô hình đơn giản hơn và ít quá khớp hơn.',
          hint: 'C nhỏ, mô hình ngoan.',
          tags: ['regularization', 'sieu-tham-so'],
        },
        {
          id: 't3l2-c5',
          front: 'Nêu hai lý do hồi quy logistic vẫn được dùng ở production trong bảo mật năm 2026.',
          back: 'Suy luận cực rẻ nên chạy được inline trên proxy/endpoint; và giải trình được từng quyết định bằng phép cộng đóng góp, không cần SHAP.',
          tags: ['hoi-quy-logistic', 'thuc-chien'],
        },
      ],
      quiz: [
        {
          id: 't3l2-q1',
          kind: 'input',
          tags: ['hoi-quy-logistic'],
          q: 'Tên hàm biến điểm tuyến tính z thành một số trong khoảng 0 đến 1 trong hồi quy logistic là gì?',
          accept: ['sigmoid', 'ham sigmoid', 'logistic', 'ham logistic', 'hàm sigmoid'],
          placeholder: 'Gõ tên hàm…',
          hint: 'Đường cong hình chữ S.',
          why: 'Hàm sigmoid (còn gọi hàm logistic): p = 1/(1+e^(-z)). Điểm đáng nhớ không phải là công thức mà là nghịch đảo của nó: z = log(p/(1-p)). Chính vì z là log-odds mà mỗi hệ số mới có cách đọc bằng lời rõ ràng.',
        },
        {
          id: 't3l2-q2',
          kind: 'mcq',
          tags: ['hoi-quy-logistic', 'dac-trung'],
          q: 'Mô hình phát hiện phishing của bạn có hai đặc trưng tương quan 0,93: `do_dai_url` và `so_ky_tu_url`. Kết quả huấn luyện cho hệ số +1,9 và -1,4. Kết luận đúng nhất?',
          options: [
            'URL càng nhiều ký tự thì càng an toàn — nên bỏ đặc trưng thứ hai',
            'Hai đặc trưng gần trùng nhau nên mô hình chia trọng số theo cách không ổn định; đừng diễn giải riêng từng hệ số',
            'Mô hình bị lỗi, cần huấn luyện lại với solver khác',
            'Hệ số âm luôn là dấu hiệu của rò rỉ dữ liệu',
          ],
          answer: 1,
          why: 'Khi hai đặc trưng gần như đồng nhất, có vô số cặp trọng số cho ra cùng dự đoán — mô hình chọn một cặp tuỳ thuộc vào khởi tạo và số hạng phạt. Hệ số âm ở đây là hiệu ứng bù trừ toán học, không phải phát biểu về thế giới thật. Cách xử lý: bỏ bớt một đặc trưng, gộp chúng lại, hoặc dùng phạt L2 mạnh hơn để chia đều trọng số, và luôn kiểm tra bằng permutation importance thay vì đọc hệ số trần.',
          distractorWhy: [
            'Đọc hệ số âm thành phát biểu nhân quả chính là cái bẫy mà câu hỏi này nhắm tới.',
            '',
            'Mô hình không lỗi; kết quả này hoàn toàn bình thường với đặc trưng đa cộng tuyến.',
            'Hệ số âm là chuyện hết sức bình thường — đặc trưng bảo vệ có hệ số âm.',
          ],
        },
        {
          id: 't3l2-q3',
          kind: 'truefalse',
          tags: ['hoi-quy-logistic', 'hieu-chuan'],
          q: 'Sau khi huấn luyện với class_weight balanced, xác suất 0,80 do mô hình đưa ra vẫn có thể hiểu là "80% khả năng đây là phishing".',
          answer: false,
          why: 'Trọng số lớp cố tình làm lệch hàm mất mát để mô hình chú ý hơn tới lớp hiếm. Hệ quả là xác suất bị kéo lên một cách hệ thống: 0,80 có thể tương ứng với xác suất thực chỉ 0,25. Điểm số vẫn dùng để **xếp hạng** tốt, nhưng không dùng được để **nhân với chi phí**. Muốn có xác suất thật, hiệu chuẩn lại trên một tập giữ riêng (Platt scaling hoặc isotonic).',
        },
        {
          id: 't3l2-q4',
          kind: 'mcq',
          tags: ['hoi-quy-logistic', 'duong-co-so'],
          q: 'Bạn có 900.000 dòng log và biểu diễn mỗi dòng bằng TF-IDF trên n-gram ký tự, ra 60.000 cột thưa. Mô hình nào nên thử ĐẦU TIÊN?',
          options: [
            'Gradient boosting với 2.000 cây',
            'Hồi quy logistic có phạt L2 trên ma trận thưa',
            'Mạng nơ-ron nhiều lớp với embedding',
            'k-NN với khoảng cách cosine',
          ],
          answer: 1,
          why: 'Không gian thưa rất nhiều chiều là sân nhà của mô hình tuyến tính: huấn luyện trong vài phút trên ma trận thưa, không cần chuẩn hoá đặc biệt, và cho kết quả thường ngang ngửa các mô hình nặng hơn. Gradient boosting phải chia nhánh trên từng cột nên rất chậm và kém hiệu quả ở đây. k-NN chết vì phải quét toàn bộ 900.000 mẫu cho mỗi truy vấn. Mạng nơ-ron có thể thắng, nhưng chỉ khi bạn đã có đường cơ sở để chứng minh phần thắng đó xứng đáng.',
          distractorWhy: [
            'Cây phải duyệt qua 60.000 cột ở mỗi lần chia nhánh — chậm và kém hiệu quả với đặc trưng thưa.',
            '',
            'Có thể thắng nhưng đắt hơn nhiều bậc; chỉ có nghĩa khi đã có đường cơ sở để so.',
            'Chi phí suy luận của k-NN tỉ lệ với số mẫu huấn luyện — không khả thi ở quy mô này.',
          ],
        },
      ],
      terms: ['hoi-quy-logistic', 'regularization', 'duong-co-so', 'hieu-chuan', 'gradient-descent', 'sieu-tham-so'],
      further: [
        {
          title: 'scikit-learn — Linear Models, mục Logistic Regression',
          note: 'Đọc kỹ phần về solver và tham số C. Đây là tài liệu chuẩn, ngắn, và tránh cho bạn ba lỗi cấu hình phổ biến nhất.',
        },
        {
          title: 'An Introduction to Statistical Learning — chương 4',
          note: 'Giải thích log-odds và tỉ số odds rõ ràng nhất trong các sách nhập môn. Bản PDF được tác giả phát hành miễn phí.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't3-l3',
      trackId: 'ml-cot-loi',
      title: 'Naive Bayes và lọc thư rác',
      subtitle: 'Một giả định sai rành rành, vậy mà đã dọn sạch hộp thư của cả thế giới',
      minutes: 17,
      practiceMinutes: 7,
      level: 'co-ban',
      prereqs: ['t3-l2', 't1-l2'],
      why: {
        short:
          'Naive Bayes là mô hình rẻ nhất, nhanh nhất và dễ cập nhật nhất cho dữ liệu văn bản — đúng loại dữ liệu chiếm phần lớn bảo mật: email, dòng log, tên miền, dòng lệnh.',
        scenario:
          'Một chiến dịch phishing mới đang chạy. Bạn có 300 email đã xác nhận là độc và 40.000 email lành tính, cần một bộ lọc chạy được trong 30 phút tới trên máy chủ mail. Không có GPU, không có thời gian tinh chỉnh, và mỗi giờ chậm trễ là thêm người bấm vào liên kết.',
        roles: ['Detection Engineer', 'SOC Analyst', 'Security Data Scientist'],
        costOfNotKnowing:
          'Bạn hoặc bỏ qua một công cụ chạy trong vài giây, hoặc tin tuyệt đối vào con số 0,999 mà nó in ra — và rồi đặt ngưỡng theo một xác suất hoàn toàn không đáng tin.',
      },
      objectives: [
        'Phát biểu được giả định độc lập có điều kiện và chỉ ra chính xác nó sai ở đâu trong email thật',
        'Giải thích được vì sao mô hình vẫn xếp hạng đúng dù xác suất nó đưa ra sai lệch nặng',
        'Áp dụng được làm mượt Laplace và tính bằng log để tránh hai lỗi khiến bộ lọc chết lặng',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Năm 2002, Paul Graham đăng bài luận **A Plan for Spam**. Ý tưởng đơn giản đến mức khó tin: đếm xem mỗi từ xuất hiện bao nhiêu lần trong thư rác so với thư thường, rồi cộng bằng chứng lại theo định lý Bayes. Trong vòng một năm, bộ lọc Bayes có mặt trong SpamAssassin, bogofilter, dspam và hộp thư của hàng triệu người. Trước đó, nghiên cứu của Sahami, Dumais, Heckerman và Horvitz (1998) đã đặt nền móng học thuật cho chính ý tưởng này.',
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'Vì sao nó thắng nhanh đến thế',
          md: 'Trước Bayes, lọc thư rác là danh sách từ khoá do người viết tay: chặn "VIAGRA", chặn "FREE MONEY". Kẻ gửi thư rác chỉ cần viết "V1AGRA" là xong. Bộ lọc Bayes **học từ chính hộp thư của bạn**, cập nhật sau mỗi email bạn đánh dấu, và mang tính cá nhân hoá — từ "hoá đơn" là dấu hiệu rác với người này nhưng hoàn toàn bình thường với nhân viên kế toán. Đó là lần đầu tiên phòng thủ có tốc độ thích nghi ngang với tấn công.',
        },
        { t: 'h', text: 'Giả định "ngây thơ" là gì', level: 2 },
        {
          t: 'p',
          md: 'Ta muốn biết `P(rác | các từ trong email)`. Bayes cho: `P(rác | từ) ∝ P(rác) × P(từ | rác)`. Vấn đề nằm ở `P(từ | rác)` — xác suất của **toàn bộ tổ hợp từ**. Với 200 từ, số tổ hợp lớn hơn số nguyên tử trong vũ trụ quan sát được; không dữ liệu nào ước lượng nổi.',
        },
        {
          t: 'p',
          md: 'Naive Bayes cắt phăng nút thắt bằng một giả định: **các từ độc lập với nhau khi đã biết nhãn**. Nghĩa là `P(t1, t2, ..., tn | rác) = P(t1|rác) × P(t2|rác) × ... × P(tn|rác)`. Từ chỗ phải ước lượng một bảng khổng lồ, bạn chỉ còn phải đếm tần suất từng từ. Bài toán từ bất khả thi thành một vòng lặp đếm.',
        },
        {
          t: 'predict',
          question:
            'Giả định trên rõ ràng sai: trong email thật, "khuyến" và "mãi" gần như luôn đi cùng nhau, "tài" và "khoản" cũng vậy. Theo bạn, hậu quả cụ thể của việc đếm hai từ phụ thuộc như thể chúng độc lập là gì?',
          reveal:
            '**Bằng chứng bị đếm hai lần.** Cụm "khuyến mãi" thực chất là một tín hiệu, nhưng mô hình cộng nó vào hai lần, rồi cụm "giảm giá" thêm hai lần nữa. Kết quả: xác suất bị đẩy về hai cực — bạn sẽ liên tục thấy 0,99999 và 0,00001, gần như không bao giờ thấy 0,63. Nhưng đây mới là điểm hay: **thứ tự xếp hạng phần lớn vẫn đúng.** Email rác vẫn được điểm cao hơn email thường, chỉ là con số bị phóng đại. Domingos và Pazzani (1997) đã phân tích chính hiện tượng này: khi bạn chỉ cần chọn lớp có điểm cao nhất, sai lệch trong ước lượng xác suất có thể rất lớn mà quyết định vẫn đúng.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Bài học rộng hơn cả Naive Bayes',
          md: 'Một mô hình có thể **sai về xác suất mà vẫn đúng về thứ hạng**. Trong bảo mật, bạn thường chỉ cần thứ hạng: xem cái nào trước, chặn 100 cái đáng ngờ nhất. Nhưng ngay khi bạn muốn nhân xác suất với chi phí để ra quyết định kinh tế, sai lệch đó trở thành vấn đề nghiêm trọng. Đây là lý do hiệu chuẩn có hẳn một bài riêng ở chặng 4.',
        },
        { t: 'h', text: 'Hai lỗi khiến bộ lọc chết lặng', level: 2 },
        {
          t: 'steps',
          title: 'Lỗi 1 — Xác suất bằng 0 giết cả tích số',
          steps: [
            {
              title: 'Hiện tượng',
              md: 'Từ `ransomware` xuất hiện 41 lần trong 300 email độc, và **0 lần** trong 40.000 email lành. Ước lượng thô cho `P(ransomware | lành) = 0/40000 = 0`.',
            },
            {
              title: 'Hậu quả',
              md: 'Vì mô hình nhân các xác suất lại, chỉ cần MỘT thừa số bằng 0 là toàn bộ tích bằng 0. Một email lành tính hoàn toàn bình thường, chỉ vì có chữ `ransomware` trong bản tin nội bộ về an toàn thông tin, sẽ nhận `P(lành) = 0` và bị chặn thẳng. Một từ phủ quyết cả trăm từ khác.',
            },
            {
              title: 'Cách chữa: làm mượt Laplace (additive smoothing)',
              md: 'Cộng thêm `alpha` vào mọi số đếm: `P(từ|lớp) = (đếm + alpha) / (tổng + alpha × V)`, với `V` là kích thước từ vựng. Với `alpha = 1`: `P(ransomware|lành) = 1/(40000 + V)` — rất nhỏ nhưng khác 0. Bằng chứng vẫn mạnh, không còn quyền phủ quyết.',
            },
            {
              title: 'Chọn alpha thế nào',
              md: '`alpha = 1` là mặc định an toàn. `alpha` nhỏ hơn (0,01–0,1) cho mô hình tin tưởng dữ liệu hơn, hợp khi bạn có nhiều dữ liệu; `alpha` lớn hơn làm mô hình thận trọng hơn, hợp khi dữ liệu ít. Đây là siêu tham số duy nhất đáng chỉnh của Naive Bayes.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Lỗi 2 — Tràn số dưới (underflow)',
          md: 'Nhân 300 xác suất, mỗi cái cỡ 0,001, cho ra một số nhỏ hơn `10^-900`. Kiểu float64 làm tròn nó thành đúng **0,0**, và mọi email đều có điểm 0. Cách chữa chuẩn: làm việc trong **không gian log**. Thay vì nhân xác suất, cộng log của chúng: `log P = log P(lớp) + Σ log P(từ|lớp)`. Mọi thư viện nghiêm túc, kể cả scikit-learn, đều làm thế. Nếu bạn tự cài đặt Naive Bayes mà quên bước này, bộ lọc sẽ im lặng trả về kết quả vô nghĩa mà không báo lỗi dòng nào.',
        },
        {
          t: 'table',
          caption: 'Bốn biến thể Naive Bayes trong scikit-learn và chỗ dùng đúng của từng cái.',
          head: ['Biến thể', 'Đầu vào phù hợp', 'Ví dụ trong bảo mật'],
          rows: [
            ['MultinomialNB', 'Số đếm hoặc TF-IDF không âm', 'Nội dung email, dòng lệnh, thân HTTP request'],
            ['BernoulliNB', 'Đặc trưng nhị phân có/không', 'Tập imports của tệp PE, cờ bật/tắt trong header'],
            ['ComplementNB', 'Văn bản với lớp rất mất cân bằng', 'Phishing hiếm trong biển email lành tính'],
            ['GaussianNB', 'Đặc trưng liên tục xấp xỉ chuẩn', 'Ít dùng trong bảo mật — dữ liệu hiếm khi chuẩn'],
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Bộ lọc chạy được trong vài giây, kèm đọc các từ có sức nặng nhất',
          code:
            "import numpy as np\n" +
            "from sklearn.feature_extraction.text import CountVectorizer\n" +
            "from sklearn.naive_bayes import MultinomialNB\n" +
            "from sklearn.pipeline import make_pipeline\n" +
            "from sklearn.metrics import classification_report\n" +
            "\n" +
            "# emails_train: list các chuỗi. y_train: 1 = độc, 0 = lành.\n" +
            "vec = CountVectorizer(lowercase=True, min_df=3, max_features=50000,\n" +
            "                      ngram_range=(1, 2))   # 1-gram + 2-gram bắt được cụm từ\n" +
            "clf = MultinomialNB(alpha=1.0)               # alpha = làm mượt Laplace\n" +
            "pipe = make_pipeline(vec, clf)\n" +
            "pipe.fit(emails_train, y_train)\n" +
            "print(classification_report(y_test, pipe.predict(emails_test), digits=3))\n" +
            "\n" +
            "# Từ nào kéo email về phía độc hại mạnh nhất?\n" +
            "# feature_log_prob_ có dạng (n_lop, n_tu); hiệu hai hàng chính là trọng số bằng chứng.\n" +
            "tu = np.array(vec.get_feature_names_out())\n" +
            "trong_so = clf.feature_log_prob_[1] - clf.feature_log_prob_[0]\n" +
            "top = np.argsort(trong_so)[-15:][::-1]\n" +
            "for i in top:\n" +
            "    print(f'{tu[i]:<24} {trong_so[i]:+.2f}')\n",
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't3l3-cp1',
              kind: 'mcq',
              tags: ['naive-bayes'],
              q: 'Bộ lọc Naive Bayes tự cài đặt của bạn trả về xác suất 0,0 cho MỌI email, kể cả thư rác rõ ràng. Nguyên nhân khả dĩ nhất?',
              options: [
                'Dữ liệu huấn luyện quá mất cân bằng',
                'Tràn số dưới do nhân hàng trăm xác suất nhỏ mà không chuyển sang không gian log',
                'Giả định độc lập bị vi phạm quá nặng',
                'Từ vựng quá lớn nên mô hình không hội tụ',
              ],
              answer: 1,
              why: 'Nhân 200–500 số cỡ 0,001 cho kết quả nhỏ hơn giới hạn biểu diễn của float64 (khoảng 10^-308), và nó bị làm tròn thành đúng 0. Triệu chứng đặc trưng là **mọi** mẫu đều ra 0, không phân biệt gì. Cách chữa duy nhất là cộng log thay vì nhân xác suất. Naive Bayes không có bước hội tụ nào, nên phương án cuối cũng vô lý về mặt cơ chế.',
              distractorWhy: [
                'Mất cân bằng làm lệch dự đoán về lớp đa số, không làm mọi giá trị bằng 0.',
                '',
                'Vi phạm giả định độc lập làm xác suất bị đẩy về hai cực, nhưng vẫn có mẫu ra gần 1.',
                'Naive Bayes chỉ đếm tần suất, không có quá trình lặp nên không có khái niệm hội tụ.',
              ],
            },
            {
              id: 't3l3-cp2',
              kind: 'truefalse',
              tags: ['naive-bayes', 'hieu-chuan'],
              q: 'Naive Bayes cho một email điểm 0,9997 nghĩa là trong 10.000 email tương tự, khoảng 9.997 email thực sự là thư rác.',
              answer: false,
              why: 'Không. Vì giả định độc lập bị vi phạm, bằng chứng của các từ tương quan bị cộng dồn nhiều lần, đẩy xác suất về sát 0 hoặc sát 1. Con số 0,9997 chỉ có nghĩa "rất cao trong thang điểm nội bộ của mô hình này", không phải tần suất thực tế. Muốn có xác suất đọc được, phải hiệu chuẩn lại trên tập giữ riêng.',
            },
          ],
        },
        { t: 'lab', id: 'lab-naive-bayes', intro: 'Huấn luyện bộ lọc thư rác của riêng bạn, chỉnh alpha và xem chuyện gì xảy ra khi tắt hẳn làm mượt Laplace.' },
        { t: 'h', text: 'Chỗ đứng của Naive Bayes năm 2026', level: 2 },
        {
          t: 'compare',
          title: 'Vẫn dùng ở đâu, đã bị thay ở đâu',
          left: {
            title: 'Vẫn là lựa chọn tốt',
            icon: 'check',
            items: [
              'Cần một bộ phân loại văn bản trong vòng vài phút, không GPU',
              'Dữ liệu huấn luyện rất ít (vài trăm mẫu) — NB chịu ít dữ liệu tốt hơn hầu hết mô hình',
              'Cần cập nhật liên tục theo từng email người dùng đánh dấu',
              'Làm một trong nhiều tín hiệu đầu vào cho hệ thống chấm điểm lớn hơn, như trong SpamAssassin',
              'Cần đường cơ sở để biết bài toán văn bản này dễ hay khó',
            ],
          },
          right: {
            title: 'Đã bị vượt qua',
            icon: 'x',
            items: [
              'Cần xác suất hiệu chuẩn để nhân với chi phí',
              'Ngữ nghĩa quan trọng hơn từ khoá (mô hình transformer thắng rõ)',
              'Đặc trưng số liên tục và tương tác phức tạp (gradient boosting thắng)',
              'Đối thủ chủ động chèn từ vô hại để pha loãng bằng chứng',
              'Bài toán mà thứ tự từ mang thông tin (dòng lệnh, mã nguồn)',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Đầu độc Bayes — đòn né tránh cổ điển vẫn còn hiệu lực',
          md: 'Kẻ gửi thư rác phát hiện ra rằng chỉ cần chèn một đoạn văn bản bình thường (trích tin tức, đoạn Wikipedia) bằng chữ trắng trên nền trắng là kéo được điểm về phía lành tính. Kỹ thuật này gọi là **Bayesian poisoning** và nó tấn công đúng vào điểm yếu cấu trúc: mô hình cộng bằng chứng của **mọi** từ như nhau, nên thêm 500 từ vô hại sẽ pha loãng 20 từ đáng ngờ. Bài học tổng quát cho chặng 8: mô hình nào cộng dồn tín hiệu tuyến tính thì đều pha loãng được.',
        },
        { t: 'terms', ids: ['naive-bayes', 'hieu-chuan', 'ne-tranh', 'duong-co-so'] },
      ],
      keyTakeaways: [
        'Naive Bayes giả định các đặc trưng độc lập khi đã biết nhãn — sai rành rành, nhưng biến bài toán bất khả thi thành phép đếm.',
        'Vi phạm giả định làm xác suất bị đẩy về hai cực, nhưng thứ hạng phần lớn vẫn đúng; đó là lý do nó vẫn dùng được.',
        'Không làm mượt Laplace thì một từ chưa từng thấy sẽ đưa cả tích số về 0 và phủ quyết mọi bằng chứng khác.',
        'Luôn tính trong không gian log: nhân hàng trăm xác suất nhỏ gây tràn số dưới và trả về 0 im lặng.',
        'MultinomialNB cho số đếm, BernoulliNB cho cờ nhị phân, ComplementNB cho lớp rất mất cân bằng.',
        'Bayesian poisoning cho thấy mọi mô hình cộng dồn tín hiệu tuyến tính đều bị pha loãng bằng nội dung vô hại.',
      ],
      cards: [
        {
          id: 't3l3-c1',
          front: 'Giả định "ngây thơ" của Naive Bayes phát biểu chính xác là gì?',
          back: 'Các đặc trưng độc lập với nhau khi đã biết nhãn lớp — nhờ đó xác suất của cả tổ hợp bằng tích các xác suất riêng lẻ.',
          tags: ['naive-bayes'],
        },
        {
          id: 't3l3-c2',
          front: 'Giả định độc lập sai, vậy vì sao Naive Bayes vẫn hoạt động tốt?',
          back: 'Vì bằng chứng bị đếm trùng chỉ làm sai lệch độ lớn của xác suất, còn thứ tự xếp hạng giữa các lớp phần lớn vẫn giữ nguyên.',
          tags: ['naive-bayes'],
        },
        {
          id: 't3l3-c3',
          front: 'Làm mượt Laplace giải quyết vấn đề gì, và bằng cách nào?',
          back: 'Ngăn một từ chưa từng thấy trong một lớp làm cả tích số bằng 0, bằng cách cộng alpha vào mọi số đếm trước khi chia.',
          tags: ['naive-bayes'],
        },
        {
          id: 't3l3-c4',
          front: 'Vì sao phải tính Naive Bayes trong không gian log?',
          back: 'Nhân hàng trăm xác suất nhỏ gây tràn số dưới, kết quả bị làm tròn thành 0 cho mọi mẫu. Cộng log tránh hoàn toàn chuyện đó.',
          tags: ['naive-bayes'],
        },
        {
          id: 't3l3-c5',
          front: 'Bayesian poisoning là gì?',
          back: 'Kẻ tấn công chèn nhiều văn bản vô hại vào email độc để pha loãng bằng chứng, kéo điểm tổng về phía lành tính.',
          tags: ['ne-tranh', 'doi-khang'],
        },
      ],
      quiz: [
        {
          id: 't3l3-q1',
          kind: 'input',
          tags: ['naive-bayes'],
          q: 'Kỹ thuật cộng một hằng số alpha vào mọi số đếm để không có xác suất nào bằng 0 gọi là gì?',
          accept: ['laplace smoothing', 'lam muot laplace', 'additive smoothing', 'laplace', 'lam muot cong'],
          placeholder: 'Tên kỹ thuật…',
          hint: 'Mang tên một nhà toán học người Pháp.',
          why: 'Làm mượt Laplace, còn gọi additive smoothing. Ý tưởng sâu hơn công thức: bạn đang nói với mô hình rằng "chưa thấy" không đồng nghĩa với "không thể xảy ra". Với alpha = 1, bạn giả vờ đã thấy mỗi từ đúng một lần trong mỗi lớp trước khi nhìn dữ liệu thật.',
        },
        {
          id: 't3l3-q2',
          kind: 'mcq',
          tags: ['naive-bayes'],
          q: 'Bạn có 300 email độc và 40.000 email lành tính, cần bộ lọc chạy trong 30 phút tới. Biến thể Naive Bayes nào hợp lý nhất?',
          options: [
            'GaussianNB trên độ dài email và số liên kết',
            'ComplementNB trên số đếm từ, vì lớp độc rất hiếm',
            'BernoulliNB trên toàn bộ nội dung HTML thô',
            'Không nên dùng Naive Bayes, phải chờ đủ dữ liệu để huấn luyện transformer',
          ],
          answer: 1,
          why: 'ComplementNB được thiết kế riêng cho văn bản mất cân bằng: nó ước lượng tham số từ **phần bù** của mỗi lớp nên ít bị lớp đa số áp đảo hơn MultinomialNB. GaussianNB giả định phân phối chuẩn, sai hoàn toàn với số đếm từ. BernoulliNB trên HTML thô bỏ mất thông tin tần suất. Còn chờ transformer thì chiến dịch phishing đã kết thúc từ lâu.',
          distractorWhy: [
            'Độ dài và số liên kết không xấp xỉ phân phối chuẩn, và hai đặc trưng thì quá ít.',
            '',
            'Nhị phân hoá làm mất thông tin tần suất, vốn là tín hiệu mạnh nhất trong lọc thư rác.',
            'Trong ứng cứu sự cố, một mô hình chạy trong 5 phút thắng một mô hình hoàn hảo sau 3 tuần.',
          ],
        },
        {
          id: 't3l3-q3',
          kind: 'multi',
          tags: ['naive-bayes', 'hieu-chuan'],
          q: 'Phát biểu nào ĐÚNG về Naive Bayes? (Chọn tất cả)',
          options: [
            'Huấn luyện chỉ cần một lượt duyệt qua dữ liệu để đếm tần suất',
            'Xác suất đầu ra của nó đã được hiệu chuẩn tốt và dùng trực tiếp để tính chi phí kỳ vọng được',
            'Nó hoạt động tương đối tốt ngay cả khi chỉ có vài trăm mẫu huấn luyện',
            'Nó nắm bắt được tương tác giữa các đặc trưng, ví dụ "cụm từ A xuất hiện CÙNG với B"',
          ],
          answers: [0, 2],
          why: 'Naive Bayes chỉ đếm nên huấn luyện một lượt là xong, và vì mỗi tham số chỉ ước lượng từ tần suất một đặc trưng nên nó chịu được dữ liệu ít tốt hơn nhiều mô hình khác. Hai phát biểu còn lại sai và sai theo cùng một nguyên nhân: giả định độc lập. Nó khiến xác suất bị đẩy về hai cực (nên không hiệu chuẩn) và khiến mô hình về bản chất không thể biểu diễn tương tác giữa các đặc trưng — bạn phải tự đưa tương tác vào dưới dạng n-gram.',
        },
        {
          id: 't3l3-q4',
          kind: 'truefalse',
          tags: ['ne-tranh', 'doi-khang'],
          q: 'Chèn thêm 500 từ vô hại vào một email độc hại có thể kéo điểm Naive Bayes về phía lành tính.',
          answer: true,
          why: 'Đúng — đây là Bayesian poisoning, đã được kẻ gửi thư rác dùng từ đầu những năm 2000 và vẫn còn hiệu lực. Nguyên nhân nằm ở cấu trúc: mô hình cộng log-bằng-chứng của mọi từ, nên 500 từ hơi nghiêng về lành tính có thể áp đảo 20 từ rất nghiêng về độc hại. Cách chống một phần: giới hạn số từ đóng góp (chỉ lấy N từ cực đoan nhất, đúng như Paul Graham đề xuất), hoặc chuẩn hoá theo độ dài văn bản.',
        },
      ],
      terms: ['naive-bayes', 'hieu-chuan', 'ne-tranh', 'duong-co-so', 'doi-khang'],
      further: [
        {
          title: 'A Plan for Spam — Paul Graham (2002)',
          note: 'Bài luận đã khởi động cả một làn sóng. Đọc để thấy một ý tưởng thống kê đơn giản thay đổi hạ tầng email toàn cầu nhanh thế nào.',
        },
        {
          title: 'On the Optimality of the Simple Bayesian Classifier under Zero-One Loss — Domingos & Pazzani (1997)',
          note: 'Phân tích chặt chẽ vì sao một giả định sai vẫn cho quyết định đúng. Nền tảng cho trực giác "sai xác suất, đúng thứ hạng".',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't3-l4',
      trackId: 'ml-cot-loi',
      title: 'Cây quyết định',
      subtitle: 'Mô hình duy nhất bạn in ra giấy đưa cho analyst và họ dùng được ngay',
      minutes: 17,
      practiceMinutes: 7,
      level: 'co-ban',
      prereqs: ['t3-l1', 't1-l5'],
      why: {
        short:
          'Cây quyết định là viên gạch xây nên Random Forest và XGBoost — hai thứ bạn sẽ dùng nhiều nhất — và là mô hình duy nhất dịch thẳng được thành luật SIEM mà không mất mát gì.',
        scenario:
          'Bạn cần biến một mô hình phát hiện thành luật Sigma để đội SOC ở ba quốc gia triển khai trên hạ tầng khác nhau. Hạ tầng đó không chạy được Python. Một cây quyết định sâu 4 tầng chuyển thành 12 điều kiện `if` — chuyển được, kiểm thử được, và bảo trì được.',
        roles: ['Detection Engineer', 'SOC Analyst', 'Threat Hunter', 'Security Data Scientist'],
        costOfNotKnowing:
          'Bạn dùng cây đơn không giới hạn độ sâu, thấy 100% trên tập huấn luyện, tưởng đã thắng, rồi triển khai một mô hình đã học thuộc lòng 40.000 mẫu và không tổng quát hoá được gì.',
      },
      objectives: [
        'Tính được Gini và information gain của một phép chia cụ thể bằng tay',
        'Giải thích được cơ chế khiến cây quá khớp, và nêu bốn tham số chặn nó lại',
        'Nhận ra cái bẫy đặc trưng có nhiều giá trị phân biệt khi đọc một cây đã huấn luyện',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Mọi analyst SOC đều đã viết cây quyết định trong đầu: *Cảnh báo PowerShell à? Xem tiến trình cha. Là Word hay Excel? Nghiêm trọng. Là explorer.exe? Xem dòng lệnh có `-enc` không. Có? Nghiêm trọng. Không? Xem tài khoản có phải admin không...* Thuật toán cây quyết định làm đúng việc đó, chỉ khác là nó chọn thứ tự câu hỏi bằng dữ liệu thay vì bằng kinh nghiệm.',
        },
        { t: 'h', text: 'Cách cây chọn câu hỏi tiếp theo', level: 2 },
        {
          t: 'p',
          md: 'Ở mỗi nút, thuật toán thử **mọi đặc trưng** với **mọi ngưỡng có thể**, và chọn phép chia làm giảm **độ vẩn đục (impurity)** nhiều nhất. Độ vẩn đục đo mức độ trộn lẫn của hai lớp trong một nút: nút chỉ toàn mẫu độc hại có độ vẩn đục 0, nút 50-50 có độ vẩn đục cực đại.',
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Hai thước đo, cùng một ý tưởng',
          md: '**Gini:** `G = 1 - Σ p_k²`. Đọc thành lời: xác suất bạn gán sai nhãn nếu bốc ngẫu nhiên một mẫu và gán nhãn theo tỉ lệ trong nút.\n\n**Entropy:** `H = -Σ p_k × log2(p_k)`. Số bit trung bình cần để mô tả nhãn của một mẫu trong nút (đúng thứ bạn đã học ở bài t1-l5).\n\nHai thước đo gần như luôn chọn cùng một phép chia. Gini rẻ hơn vì không phải tính logarit, nên scikit-learn để nó làm mặc định.',
        },
        {
          t: 'steps',
          title: 'Tính bằng tay: 100 tiến trình PowerShell, 40 độc hại',
          steps: [
            {
              title: 'Bước 1 — Độ vẩn đục của nút gốc',
              md: '`p_độc = 0,4`, `p_lành = 0,6`. Gini gốc = `1 - 0,4² - 0,6² = 1 - 0,16 - 0,36 = 0,48`. Entropy gốc = `-0,4×log2(0,4) - 0,6×log2(0,6) = 0,529 + 0,442 = 0,971` bit.',
            },
            {
              title: 'Bước 2 — Thử phép chia "tiến trình cha là Office"',
              md: 'Nhánh trái (cha KHÔNG phải Office): 50 mẫu, 5 độc + 45 lành. Nhánh phải (cha LÀ Office): 50 mẫu, 35 độc + 15 lành.',
            },
            {
              title: 'Bước 3 — Gini của từng nhánh',
              md: 'Trái: `1 - 0,1² - 0,9² = 1 - 0,01 - 0,81 = 0,18`. Phải: `1 - 0,7² - 0,3² = 1 - 0,49 - 0,09 = 0,42`.',
            },
            {
              title: 'Bước 4 — Gini có trọng số của phép chia',
              md: 'Trọng số theo số mẫu: `(50/100)×0,18 + (50/100)×0,42 = 0,09 + 0,21 = 0,30`. Mức giảm độ vẩn đục = `0,48 - 0,30 = 0,18`. Con số 0,18 này chính là điểm số mà thuật toán dùng để so sánh phép chia này với hàng nghìn phép chia khác.',
            },
            {
              title: 'Bước 5 — Cùng phép chia, tính bằng entropy',
              md: 'Entropy trái = `-0,1×log2(0,1) - 0,9×log2(0,9) = 0,332 + 0,137 = 0,469`. Entropy phải = `-0,7×log2(0,7) - 0,3×log2(0,3) = 0,360 + 0,521 = 0,881`. Trung bình có trọng số = `0,675`. **Information gain** = `0,971 - 0,675 = 0,296` bit. Cùng một kết luận: đây là phép chia có giá trị.',
            },
            {
              title: 'Bước 6 — Lặp lại cho tới khi dừng',
              md: 'Thuật toán làm y hệt trên từng nhánh con, đệ quy, cho tới khi gặp điều kiện dừng (độ sâu tối đa, số mẫu tối thiểu, hoặc nút đã thuần). Đây gọi là chia nhánh **tham lam** — nó chọn phép chia tốt nhất ở bước hiện tại mà không nhìn xa hơn, nên cây thu được không đảm bảo là cây tối ưu toàn cục.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao cây khác hẳn mô hình tuyến tính',
          md: 'Hồi quy logistic vẽ **một** siêu phẳng cắt toàn bộ không gian. Cây cắt không gian thành các **hộp chữ nhật** song song với trục, mỗi hộp một dự đoán. Hệ quả rất thực tế: cây bắt được tương tác kiểu "cổng 443 **và** thời lượng dài **và** ít byte gửi" một cách tự nhiên, còn mô hình tuyến tính phải được bạn đưa tay tương tác đó vào. Đổi lại, cây rất kém khi ranh giới thật là một đường chéo — nó phải xấp xỉ bằng hàng chục bậc thang.',
        },
        {
          t: 'predict',
          question:
            'Bạn huấn luyện một cây không đặt bất kỳ giới hạn nào (max_depth = None) trên 40.000 sự kiện. Kết quả: độ chính xác 100,0% trên tập huấn luyện. Đây là tin tốt hay tin xấu, và vì sao?',
          reveal:
            'Tin xấu, và gần như luôn là tin xấu. Một cây không giới hạn sẽ tiếp tục chia cho tới khi mỗi lá chỉ còn **một** mẫu — lúc đó nó không học quy luật nữa mà **ghi nhớ bảng dữ liệu**. Nó đúng 100% trên những gì đã thấy và không có cơ sở nào để đúng trên cái chưa thấy. Trong bảo mật còn tệ hơn một bậc: 100% cũng có thể là dấu hiệu **rò rỉ nhãn** — có một cột nào đó trong dữ liệu chứa sẵn câu trả lời (trường `verdict`, tên thư mục chứa mẫu, hay timestamp trùng với thời điểm gắn nhãn). Nguyên tắc: mỗi khi thấy một con số hoàn hảo, hãy đi tìm lỗi trước khi đi ăn mừng.',
        },
        { t: 'lab', id: 'lab-tree', intro: 'Kéo ngưỡng chia, xem information gain thay đổi, và tự tay làm cây quá khớp rồi cắt tỉa nó lại.' },
        { t: 'h', text: 'Bốn cái phanh bạn phải biết', level: 2 },
        {
          t: 'table',
          caption: 'Tham số kiểm soát độ phức tạp của cây trong scikit-learn, kèm khoảng giá trị thường dùng cho dữ liệu bảo mật.',
          head: ['Tham số', 'Ý nghĩa', 'Khoảng thường dùng', 'Khi nào siết'],
          rows: [
            ['max_depth', 'Số tầng tối đa', '3–8 nếu cần đọc được, 10–20 nếu chỉ cần chính xác', 'Cây quá sâu để giải thích'],
            ['min_samples_leaf', 'Số mẫu tối thiểu ở mỗi lá', '20–200 với dữ liệu triệu dòng', 'Có lá chỉ chứa 1–2 mẫu'],
            ['min_samples_split', 'Số mẫu tối thiểu để được chia tiếp', '50–500', 'Nhánh phân mảnh vụn vặt'],
            ['ccp_alpha', 'Cắt tỉa theo chi phí – độ phức tạp', '0,0001–0,01, chọn bằng CV', 'Muốn cắt tỉa có cơ sở thay vì đoán'],
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Cái bẫy lớn nhất: đặc trưng có nhiều giá trị phân biệt',
          md: 'Nếu bạn để `src_ip`, `hostname`, `user_agent` hay `session_id` vào cây dưới dạng hạng mục, thuật toán sẽ mê chúng ngay. Lý do thuần cơ học: một đặc trưng có 50.000 giá trị khác nhau luôn tìm được cách chia làm giảm độ vẩn đục nhiều hơn một đặc trưng chỉ có 2 giá trị — kể cả khi nó hoàn toàn vô nghĩa. Cây sẽ tạo ra luật kiểu "nếu `src_ip = 10.4.1.77` thì độc hại", tức là ghi nhớ máy tính, không phải học hành vi. Kiểm tra nhanh: nhìn 10 phép chia đầu tiên; nếu có bất kỳ định danh nào ở đó, hãy bỏ hoặc thay bằng đặc trưng dẫn xuất (số kết nối, độ tuổi tài khoản, thuộc dải mạng nào).',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Cây đọc được, in ra dạng chữ để chuyển thành luật',
          code:
            "from sklearn.tree import DecisionTreeClassifier, export_text\n" +
            "from sklearn.metrics import classification_report\n" +
            "\n" +
            "cay = DecisionTreeClassifier(\n" +
            "    criterion='gini',\n" +
            "    max_depth=4,               # đủ nông để con người đọc hết\n" +
            "    min_samples_leaf=100,      # mỗi luật phải dựa trên ít nhất 100 sự kiện\n" +
            "    class_weight='balanced',   # lớp tấn công hiếm\n" +
            "    random_state=42,           # cây rất nhạy với ngẫu nhiên, luôn cố định hạt giống\n" +
            ")\n" +
            "cay.fit(X_train, y_train)\n" +
            "\n" +
            "print(classification_report(y_test, cay.predict(X_test), digits=3))\n" +
            "print('Sâu thật sự:', cay.get_depth(), '| Số lá:', cay.get_n_leaves())\n" +
            "\n" +
            "# In cây thành văn bản: mỗi đường từ gốc tới lá là một luật chuyển được sang Sigma\n" +
            "print(export_text(cay, feature_names=list(X_train.columns), max_depth=4))\n",
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't3l4-cp1',
              kind: 'mcq',
              tags: ['cay-quyet-dinh'],
              q: 'Nút gốc có 200 mẫu: 100 độc, 100 lành. Phép chia A cho hai nhánh 100/100 với tỉ lệ 90-10 và 10-90. Phép chia B cho hai nhánh 100/100 với tỉ lệ 60-40 và 40-60. Cây chọn cái nào?',
              options: [
                'Phép chia A, vì nó tách hai lớp rõ hơn nhiều',
                'Phép chia B, vì nó cân bằng hơn',
                'Cả hai như nhau vì kích thước nhánh bằng nhau',
                'Không đủ dữ kiện để xác định',
              ],
              answer: 0,
              why: 'Gini gốc = 0,5. Với A: mỗi nhánh có Gini `1 - 0,9² - 0,1² = 0,18`, trung bình 0,18, mức giảm = 0,32. Với B: mỗi nhánh có Gini `1 - 0,6² - 0,4² = 0,48`, trung bình 0,48, mức giảm chỉ 0,02. A tốt hơn gấp 16 lần. Điểm cần nắm: cây không quan tâm nhánh cân bằng hay không — nó chỉ quan tâm mỗi nhánh **thuần** đến đâu.',
              distractorWhy: [
                '',
                'Cân bằng về kích thước nhánh không phải mục tiêu; độ thuần của nhánh mới là mục tiêu.',
                'Kích thước bằng nhau chỉ quyết định trọng số, không quyết định độ vẩn đục.',
                'Đủ dữ kiện — chỉ cần tỉ lệ lớp và kích thước nhánh là tính được Gini.',
              ],
            },
            {
              id: 't3l4-cp2',
              kind: 'truefalse',
              tags: ['cay-quyet-dinh'],
              q: 'Nếu bạn thêm 3% dữ liệu mới rồi huấn luyện lại, cây quyết định thu được thường gần giống cây cũ.',
              answer: false,
              why: 'Ngược lại — cây quyết định nổi tiếng **bất ổn định**. Chỉ cần phép chia ở nút gốc đổi sang một đặc trưng khác là toàn bộ cấu trúc bên dưới thay đổi theo, vì mọi nhánh con đều được xây trên tập con do nút cha tạo ra. Hệ quả rất thực tế: bạn không được nói "cây này giải thích hiện tượng" — nó chỉ là một trong nhiều cây gần như tương đương. Chính tính bất ổn định này lại là **tài nguyên** cho Random Forest ở bài sau: nhiều cây khác nhau trung bình lại thì hết dao động.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Mẹo thực chiến: cây nông làm ngôn ngữ chung',
          md: 'Ngay cả khi mô hình sản xuất của bạn là LightGBM, hãy huấn luyện thêm một cây `max_depth=3` trên cùng dữ liệu và in nó ra. Không phải để triển khai, mà để **nói chuyện**: nó cho bạn một bức tranh 8 luật mà analyst, quản lý và kiểm toán viên đều đọc được trong 30 giây. Nhiều đội gọi đây là "cây giải thích" và nó thường tạo ra nhiều lòng tin hơn bất kỳ biểu đồ SHAP nào.',
        },
        { t: 'terms', ids: ['cay-quyet-dinh', 'entropy', 'qua-khop', 'sigma'] },
      ],
      keyTakeaways: [
        'Cây chọn phép chia làm giảm độ vẩn đục nhiều nhất; Gini và entropy là hai cách đo cùng một ý tưởng và gần như luôn cho cùng kết quả.',
        'Cây cắt không gian thành hộp song song với trục, nên bắt tương tác rất tự nhiên nhưng xấp xỉ ranh giới chéo rất tệ.',
        'Cây không giới hạn độ sâu sẽ ghi nhớ dữ liệu: 100% trên tập huấn luyện là dấu hiệu xấu, không phải thành tích.',
        'Bốn cái phanh: max_depth, min_samples_leaf, min_samples_split, ccp_alpha.',
        'Đặc trưng có nhiều giá trị phân biệt (IP, hostname, session id) làm cây ghi nhớ định danh thay vì học hành vi.',
        'Cây rất bất ổn định trước thay đổi nhỏ của dữ liệu — điểm yếu này chính là nguyên liệu cho Random Forest.',
      ],
      cards: [
        {
          id: 't3l4-c1',
          front: 'Cây quyết định chọn phép chia ở mỗi nút dựa trên tiêu chí gì?',
          back: 'Mức giảm độ vẩn đục lớn nhất (Gini hoặc entropy), tính bằng độ vẩn đục nút cha trừ trung bình có trọng số của các nút con.',
          tags: ['cay-quyet-dinh'],
        },
        {
          id: 't3l4-c2',
          front: 'Một nút có 40 mẫu độc và 60 mẫu lành. Gini bằng bao nhiêu?',
          back: '1 - 0,4² - 0,6² = 1 - 0,16 - 0,36 = 0,48.',
          hint: 'Gini = 1 trừ tổng bình phương tỉ lệ các lớp.',
          tags: ['cay-quyet-dinh'],
        },
        {
          id: 't3l4-c3',
          front: 'Vì sao cây quyết định 100% chính xác trên tập huấn luyện là dấu hiệu xấu?',
          back: 'Vì cây đã chia tới mức mỗi lá chỉ còn vài mẫu — nó ghi nhớ dữ liệu chứ không học quy luật. Trong bảo mật còn có thể là dấu hiệu rò rỉ nhãn.',
          tags: ['cay-quyet-dinh', 'qua-khop'],
        },
        {
          id: 't3l4-c4',
          front: 'Vì sao không nên đưa src_ip hay hostname vào cây dưới dạng hạng mục?',
          back: 'Đặc trưng nhiều giá trị phân biệt luôn tìm được phép chia giảm vẩn đục nhiều nhất, nên cây sẽ ghi nhớ định danh cụ thể thay vì học hành vi tổng quát.',
          tags: ['cay-quyet-dinh', 'dac-trung'],
        },
        {
          id: 't3l4-c5',
          front: 'Vì sao cây quyết định bất ổn định, và điều đó dẫn tới thuật toán nào?',
          back: 'Đổi phép chia ở nút gốc là đổi toàn bộ cây bên dưới. Chính phương sai cao này được Random Forest khai thác bằng cách trung bình nhiều cây khác nhau.',
          tags: ['cay-quyet-dinh', 'random-forest'],
        },
      ],
      quiz: [
        {
          id: 't3l4-q1',
          kind: 'mcq',
          tags: ['cay-quyet-dinh'],
          q: 'Nút gốc có 100 mẫu (40 độc, 60 lành), Gini = 0,48. Một phép chia tạo hai nhánh 50 mẫu: nhánh A có 5 độc/45 lành, nhánh B có 35 độc/15 lành. Mức giảm độ vẩn đục là bao nhiêu?',
          options: ['0,48', '0,30', '0,18', '0,12'],
          answer: 2,
          why: 'Gini nhánh A = `1 - 0,1² - 0,9² = 0,18`. Gini nhánh B = `1 - 0,7² - 0,3² = 0,42`. Trung bình có trọng số = `0,5×0,18 + 0,5×0,42 = 0,30`. Mức giảm = `0,48 - 0,30 = 0,18`. Đáp án 0,30 là bẫy dành cho người dừng ở bước tính Gini sau khi chia mà quên trừ.',
          distractorWhy: [
            'Đây là Gini của nút gốc, chưa phải mức giảm.',
            'Đây là Gini có trọng số sau khi chia — bạn còn thiếu bước lấy 0,48 trừ đi nó.',
            '',
            'Không khớp với phép tính nào trong bài toán.',
          ],
        },
        {
          id: 't3l4-q2',
          kind: 'mcq',
          tags: ['cay-quyet-dinh', 'dac-trung'],
          q: 'Bạn in cây ra và thấy phép chia đầu tiên là `session_id <= 8412773`. Kết luận đúng?',
          options: [
            'Tuyệt vời — mô hình đã tìm ra một quy luật mạnh mà con người bỏ sót',
            'session_id là định danh gần như duy nhất cho mỗi bản ghi; cây đang ghi nhớ chứ không học, phải bỏ cột này',
            'Cần đổi criterion từ gini sang entropy để phép chia hợp lý hơn',
            'Cần tăng max_depth để cây nhìn xa hơn session_id',
          ],
          answer: 1,
          why: 'Định danh tăng dần theo thời gian, nên `session_id <= X` thực chất là "xảy ra trước thời điểm X". Nếu dữ liệu độc hại tập trung vào một khoảng thời gian nhất định (điều gần như luôn đúng khi bạn gộp mẫu tấn công từ một chiến dịch), cây sẽ dùng nó như một đồng hồ và đạt điểm rất cao — trên tập kiểm tra được chia ngẫu nhiên. Triển khai thật thì vô dụng ngay lập tức. Đây đồng thời là một dạng rò rỉ dữ liệu qua đặc trưng thời gian.',
          distractorWhy: [
            'Quy luật mạnh trên tập kiểm tra chia ngẫu nhiên nhưng vô nghĩa ngoài đời — đây là dạng rò rỉ kinh điển.',
            '',
            'Đổi tiêu chí vẩn đục không sửa được vấn đề gốc là cột dữ liệu sai.',
            'Tăng độ sâu chỉ làm cây bám vào định danh sâu hơn nữa.',
          ],
        },
        {
          id: 't3l4-q3',
          kind: 'order',
          tags: ['cay-quyet-dinh'],
          q: 'Sắp xếp các bước mà thuật toán CART thực hiện tại một nút.',
          items: [
            'Tính độ vẩn đục hiện tại của nút',
            'Duyệt qua mọi đặc trưng và mọi ngưỡng ứng viên',
            'Với mỗi phép chia, tính độ vẩn đục có trọng số của hai nhánh con',
            'Chọn phép chia có mức giảm độ vẩn đục lớn nhất',
            'Lặp lại đệ quy trên từng nhánh cho tới khi gặp điều kiện dừng',
          ],
          why: 'Đây là thuật toán tham lam: nó tối ưu từng bước một mà không nhìn xa. Hệ quả quan trọng là cây thu được **không đảm bảo tối ưu toàn cục** — có thể tồn tại một cây nhỏ hơn và chính xác hơn mà thuật toán không bao giờ tìm ra, vì bước đầu tiên đã đi hướng khác. Tìm cây tối ưu toàn cục là bài toán NP-khó, nên trong thực tế ai cũng dùng tham lam.',
        },
        {
          id: 't3l4-q4',
          kind: 'multi',
          tags: ['cay-quyet-dinh', 'qua-khop'],
          q: 'Cây của bạn đạt F1 = 0,99 trên tập huấn luyện và 0,62 trên tập kiểm tra. Hành động nào hợp lý? (Chọn tất cả)',
          options: [
            'Giảm max_depth và tăng min_samples_leaf',
            'Thử ccp_alpha khác nhau và chọn bằng cross-validation',
            'Tăng max_depth để mô hình mạnh hơn',
            'Kiểm tra xem có cột nào rò rỉ nhãn hoặc mang thông tin thời gian không',
          ],
          answers: [0, 1, 3],
          why: 'Khoảng cách 0,99 và 0,62 là dấu hiệu quá khớp điển hình. Hai cách chữa trực tiếp là siết độ phức tạp trước khi xây (max_depth, min_samples_leaf) hoặc cắt tỉa sau khi xây (ccp_alpha chọn bằng CV). Việc kiểm tra rò rỉ luôn đáng làm khi chỉ số huấn luyện gần hoàn hảo. Tăng max_depth đi đúng hướng ngược lại: nó làm mô hình phức tạp hơn và khoảng cách rộng thêm.',
        },
      ],
      terms: ['cay-quyet-dinh', 'entropy', 'qua-khop', 'sigma', 'ro-ri-du-lieu'],
      further: [
        {
          title: 'Classification and Regression Trees — Breiman, Friedman, Olshen, Stone (1984)',
          note: 'Nguồn gốc của CART, thuật toán mà scikit-learn cài đặt. Chương về cắt tỉa theo chi phí – độ phức tạp vẫn là tài liệu tham chiếu tốt nhất.',
        },
        {
          title: 'scikit-learn — Decision Trees, mục Tips on practical use',
          note: 'Danh sách ngắn các lời khuyên thực tế, trong đó có cảnh báo về đặc trưng nhiều giá trị phân biệt.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't3-l5',
      trackId: 'ml-cot-loi',
      title: 'Random Forest và Gradient Boosting',
      subtitle: 'Vua của dữ liệu bảng — và cái bẫy nằm ngay trong bảng feature importance mà ai cũng khoe',
      minutes: 21,
      practiceMinutes: 3,
      level: 'trung-cap',
      prereqs: ['t3-l4'],
      why: {
        short:
          'Với dữ liệu dạng bảng — thứ chiếm phần lớn bảo mật — tổ hợp cây vẫn là mô hình mạnh nhất tính trên mỗi giờ công bỏ ra, và bạn sẽ dùng nó nhiều hơn tất cả các mô hình khác cộng lại.',
        scenario:
          'Bạn có 4,2 triệu dòng NetFlow đã trích 87 đặc trưng, hạn 2 tuần, không GPU. Bạn cần một mô hình đủ tốt để đưa vào production và một bảng giải thích đặc trưng nào quan trọng để thuyết phục ban lãnh đạo. Đây gần như là định nghĩa của bài toán mà gradient boosting sinh ra để giải.',
        roles: ['Security Data Scientist', 'ML Engineer', 'Detection Engineer'],
        costOfNotKnowing:
          'Bạn trình bày bảng feature importance mặc định của thư viện, ai đó dựa vào đó ra quyết định thu thập dữ liệu, và ba tháng sau phát hiện đặc trưng đứng đầu bảng chỉ là một định danh có nhiều giá trị phân biệt.',
      },
      objectives: [
        'Phân biệt bagging và boosting theo cơ chế giảm phương sai hay giảm thiên lệch',
        'Chọn được siêu tham số khởi điểm hợp lý cho LightGBM/XGBoost trên dữ liệu bảo mật',
        'Chỉ ra bốn cái bẫy khi đọc feature importance và nêu cách kiểm chứng thay thế cho từng cái',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Một dữ kiện đáng để bắt đầu: mô hình chuẩn đi kèm bộ dữ liệu **EMBER** — chuẩn công khai để so sánh mô hình phát hiện mã độc PE — không phải mạng nơ-ron mà là một **LightGBM** trên đặc trưng tĩnh trích tay, và nó đạt ROC-AUC trên 0,99. Bức tranh tương tự lặp lại ở khắp nơi: trong các cuộc thi Kaggle trên dữ liệu bảng, gradient boosting thắng áp đảo suốt gần một thập kỷ. Nghiên cứu của Grinsztajn, Oyallon và Varoquaux (NeurIPS 2022) đã phân tích có hệ thống vì sao mô hình cây vẫn vượt deep learning trên dữ liệu bảng.',
        },
        { t: 'figure', id: 'fig-ensemble', caption: 'Bagging huấn luyện nhiều cây song song trên các mẫu bootstrap rồi lấy trung bình. Boosting huấn luyện tuần tự, mỗi cây sửa sai cho tổng các cây trước.' },
        { t: 'h', text: 'Bagging: dùng chính điểm yếu của cây làm nguyên liệu', level: 2 },
        {
          t: 'p',
          md: 'Bài trước kết thúc bằng một phát hiện: cây đơn **bất ổn định**, đổi vài phần trăm dữ liệu là ra cây khác hẳn. Breiman (2001) biến đúng điểm yếu đó thành sức mạnh với **Random Forest**:',
        },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Bootstrap:** mỗi cây được huấn luyện trên một mẫu lấy có hoàn lại từ dữ liệu gốc, cùng kích thước. Mỗi cây thấy khoảng 63% số mẫu duy nhất; phần còn lại gọi là out-of-bag và dùng để ước lượng lỗi miễn phí.',
            '**Ngẫu nhiên hoá đặc trưng:** ở **mỗi** nút, cây chỉ được xét một tập con đặc trưng (thường là căn bậc hai của tổng số). Đây mới là mấu chốt — nó ngăn mọi cây cùng chọn một đặc trưng mạnh ở nút gốc và trở nên giống nhau.',
            '**Trung bình:** dự đoán cuối là trung bình xác suất của tất cả các cây. Sai số ngẫu nhiên của từng cây triệt tiêu lẫn nhau; phần tín hiệu chung thì còn lại.',
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Bagging giảm phương sai, không giảm thiên lệch',
          md: 'Trung bình N ước lượng không thiên lệch nhưng nhiễu sẽ cho một ước lượng ít nhiễu hơn — nhưng vẫn **giữ nguyên** thiên lệch. Nghĩa là: nếu từng cây riêng lẻ đã bỏ sót một quy luật (vì bạn giới hạn độ sâu quá chặt chẳng hạn), Random Forest cũng bỏ sót. Đó là lý do trong Random Forest người ta thường để cây **mọc sâu**: mỗi cây thiên lệch thấp, phương sai cao, và phép trung bình sẽ lo phần phương sai.',
        },
        { t: 'h', text: 'Boosting: mỗi cây sửa sai cho tổng các cây trước', level: 2 },
        {
          t: 'p',
          md: 'Gradient boosting (Friedman, 2001) đi theo hướng ngược lại. Cây đầu tiên là một cây rất nông (thường 3–8 tầng) và dự đoán khá tệ. Cây thứ hai không học nhãn — nó học **phần dư**, tức phần mà tổng hiện tại đang sai, theo hướng gradient của hàm mất mát. Cây thứ ba học phần dư còn lại. Cứ thế vài trăm tới vài nghìn lần, mỗi lần cộng thêm một lượng nhỏ (`learning_rate`).',
        },
        {
          t: 'compare',
          title: 'Hai triết lý tổ hợp',
          left: {
            title: 'Bagging (Random Forest)',
            icon: 'git-fork',
            items: [
              'Các cây độc lập, huấn luyện song song được',
              'Cây sâu, thiên lệch thấp, phương sai cao',
              'Mục tiêu: giảm phương sai bằng trung bình',
              'Rất khó làm hỏng — thêm cây gần như không hại',
              'Ít siêu tham số cần chỉnh, chạy được ngay lần đầu',
              'Có ước lượng lỗi out-of-bag miễn phí',
            ],
          },
          right: {
            title: 'Boosting (XGBoost / LightGBM)',
            icon: 'rocket',
            items: [
              'Các cây tuần tự, cây sau phụ thuộc cây trước',
              'Cây nông, thiên lệch cao, phương sai thấp',
              'Mục tiêu: giảm thiên lệch bằng cách sửa dần phần dư',
              'Thêm quá nhiều cây SẼ quá khớp — cần dừng sớm',
              'Nhiều siêu tham số, cần tinh chỉnh mới ra hết sức',
              'Thường thắng RF 2–5 điểm khi được chỉnh tử tế',
            ],
          },
        },
        {
          t: 'predict',
          question:
            'Bạn tăng số cây trong Random Forest từ 100 lên 2.000. Rồi bạn tăng số cây trong LightGBM từ 100 lên 2.000. Kết quả trên tập kiểm tra thay đổi ra sao trong từng trường hợp?',
          reveal:
            '**Random Forest:** hiệu năng tăng nhẹ rồi đi ngang, gần như không bao giờ tệ đi. Bạn chỉ trả giá bằng thời gian và bộ nhớ. Đây là tính chất rất dễ chịu của bagging — thêm cây chỉ làm ước lượng trung bình chính xác hơn.\n\n**LightGBM:** hiệu năng tăng, đạt đỉnh ở đâu đó (có thể là cây thứ 340), rồi **tệ dần** vì các cây sau bắt đầu học nhiễu trong tập huấn luyện. Đây là lý do bạn gần như không bao giờ nên đặt `n_estimators` bằng tay cho boosting — hãy đặt một số lớn và dùng **dừng sớm (early stopping)** trên tập kiểm định để thuật toán tự tìm điểm đỉnh.',
        },
        { t: 'h', text: 'Ba thư viện bạn sẽ gặp', level: 2 },
        {
          t: 'table',
          caption: 'Ba cài đặt gradient boosting phổ biến năm 2026, và khi nào chọn cái nào.',
          head: ['Thư viện', 'Điểm khác biệt kỹ thuật', 'Chọn khi'],
          rows: [
            ['XGBoost (Chen & Guestrin, 2016)', 'Mọc cây theo tầng, phạt L1/L2 trên trọng số lá, xử lý thiếu dữ liệu tự động', 'Cần ổn định và hệ sinh thái rộng nhất'],
            ['LightGBM (Ke và cộng sự, 2017)', 'Mọc theo lá, chia thùng histogram, gộp đặc trưng loại trừ nhau', 'Dữ liệu lớn, cần huấn luyện nhanh nhất'],
            ['CatBoost', 'Xử lý hạng mục bằng thống kê mục tiêu có sắp thứ tự, chống rò rỉ mục tiêu', 'Nhiều cột hạng mục nhiều giá trị phân biệt'],
            ['sklearn HistGradientBoosting', 'Cài đặt histogram trong scikit-learn, không phụ thuộc ngoài', 'Muốn ít phụ thuộc, chấp nhận chậm hơn chút'],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Siêu tham số khởi điểm cho dữ liệu bảo mật',
          md: 'Đừng bắt đầu bằng grid search 500 tổ hợp. Bắt đầu bằng: `learning_rate = 0,05`, `num_leaves = 31` (LightGBM) hoặc `max_depth = 6` (XGBoost), `min_child_samples = 100` (dữ liệu bảo mật rất nhiễu, lá nhỏ là lá học nhiễu), `subsample = 0,8`, `colsample_bytree = 0,8`, `n_estimators = 5000` **kèm dừng sớm sau 100 vòng không cải thiện**. Cấu hình này chạy được ngay trong 90% trường hợp và cho bạn một mốc để so trước khi tinh chỉnh nghiêm túc ở bài t3-l8.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Boosting có dừng sớm, và tầm quan trọng đặc trưng đo bằng hoán vị trên tập giữ riêng',
          code:
            "import lightgbm as lgb\n" +
            "from sklearn.inspection import permutation_importance\n" +
            "from sklearn.metrics import average_precision_score\n" +
            "\n" +
            "# X_train sớm hơn X_val, X_val sớm hơn X_test theo thời gian.\n" +
            "clf = lgb.LGBMClassifier(\n" +
            "    n_estimators=5000, learning_rate=0.05, num_leaves=31,\n" +
            "    min_child_samples=100, subsample=0.8, subsample_freq=1,\n" +
            "    colsample_bytree=0.8, reg_lambda=1.0,\n" +
            "    is_unbalance=True, random_state=42,\n" +
            ")\n" +
            "clf.fit(X_train, y_train,\n" +
            "        eval_set=[(X_val, y_val)], eval_metric='average_precision',\n" +
            "        callbacks=[lgb.early_stopping(100, verbose=False)])\n" +
            "print('Số cây thực dùng:', clf.best_iteration_)\n" +
            "print('PR-AUC test:', round(average_precision_score(\n" +
            "    y_test, clf.predict_proba(X_test)[:, 1]), 4))\n" +
            "\n" +
            "# KHÔNG dùng clf.feature_importances_ để báo cáo. Dùng hoán vị trên dữ liệu chưa thấy:\n" +
            "r = permutation_importance(clf, X_test, y_test, n_repeats=10,\n" +
            "                           scoring='average_precision', random_state=42)\n" +
            "for i in r.importances_mean.argsort()[::-1][:10]:\n" +
            "    print(f'{X_test.columns[i]:<32} {r.importances_mean[i]:+.4f} +/- {r.importances_std[i]:.4f}')\n",
        },
        { t: 'h', text: 'Vì sao tổ hợp cây là vua của dữ liệu bảng trong bảo mật', level: 2 },
        {
          t: 'list',
          items: [
            '**Đặc trưng không đồng nhất.** Một hàng NetFlow có số đếm, tỉ lệ, cờ nhị phân, hạng mục và entropy trộn lẫn. Cây không quan tâm thang đo, không cần chuẩn hoá, không cần phân phối chuẩn.',
            '**Ngưỡng phi tuyến là bản chất của bảo mật.** "Trên 50 kết nối một phút thì đáng ngờ" là một bậc thang, đúng thứ cây biểu diễn tự nhiên còn mô hình tuyến tính phải được nắn tay.',
            '**Chịu được đặc trưng vô dụng.** Ném vào 200 cột trong đó 150 cột vô nghĩa, cây vẫn tìm ra 50 cột có ích. Mạng nơ-ron thì bị nhiễu kéo đi.',
            '**Xử lý giá trị thiếu ngay trong thuật toán.** LightGBM và XGBoost học luôn hướng đi cho giá trị thiếu. Trong log bảo mật, thiếu dữ liệu là chuyện thường ngày và bản thân nó cũng là tín hiệu.',
            '**Huấn luyện nhanh trên CPU.** Vài triệu hàng, vài chục giây tới vài phút. Bạn thử được 30 ý tưởng đặc trưng trong một buổi chiều — điều này quan trọng hơn 1 điểm AUC.',
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Giới hạn thật: cây không ngoại suy',
          md: 'Mô hình cây dự đoán bằng giá trị trung bình của các lá. Nếu tập huấn luyện có `bytes_sent` tối đa là 8 GB và hôm nay xuất hiện một phiên 400 GB, cây sẽ đối xử với nó **y hệt** phiên 8 GB — nó không có khái niệm "xa hơn nữa thì đáng ngờ hơn nữa". Đây là lý do bạn nên bổ sung luật ngưỡng cứng cho các trường hợp cực đoan, hoặc thêm đặc trưng dạng tỉ lệ so với đường cơ sở của chính thực thể đó thay vì giá trị tuyệt đối.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't3l5-cp1',
              kind: 'mcq',
              tags: ['random-forest', 'gbdt'],
              q: 'Mô hình LightGBM của bạn đạt PR-AUC 0,91 trên tập huấn luyện và 0,58 trên tập kiểm định, và bạn đang dùng n_estimators = 3000 cố định. Việc đầu tiên nên làm?',
              options: [
                'Tăng learning_rate để mô hình học nhanh hơn',
                'Bật dừng sớm trên tập kiểm định và xem số cây tối ưu thực sự là bao nhiêu',
                'Tăng num_leaves để mô hình mạnh hơn',
                'Chuyển sang Random Forest vì boosting không hợp dữ liệu này',
              ],
              answer: 1,
              why: 'Khoảng cách 0,91 và 0,58 với số cây cố định rất lớn là bức tranh kinh điển của boosting chạy quá đà. Dừng sớm cho bạn biết ngay điểm đỉnh thật — rất có thể là cây thứ 200 chứ không phải 3000 — và nó là thay đổi rẻ nhất, nhanh nhất, không cần đoán. Ba lựa chọn còn lại đều làm mô hình phức tạp hơn hoặc bỏ cuộc quá sớm.',
              distractorWhy: [
                'Tốc độ học cao hơn làm mô hình bám nhiễu nhanh hơn nữa.',
                '',
                'Nhiều lá hơn nghĩa là cây phức tạp hơn — đi đúng hướng ngược lại.',
                'Boosting chưa được cho cơ hội chạy đúng cách thì chưa có cơ sở để bỏ.',
              ],
            },
          ],
        },
        { t: 'h', text: 'Feature importance và bốn cái bẫy của nó', level: 2 },
        {
          t: 'p',
          md: 'Bảng `feature_importances_` là thứ được đưa vào slide nhiều nhất và bị hiểu sai nhiều nhất trong toàn ngành. Bốn vấn đề, xếp theo mức độ nguy hiểm:',
        },
        {
          t: 'steps',
          title: 'Bốn cái bẫy, và cách kiểm chứng thay thế',
          steps: [
            {
              title: 'Bẫy 1 — Thiên lệch về đặc trưng nhiều giá trị phân biệt',
              md: 'Tầm quan trọng dựa trên độ vẩn đục (mặc định của scikit-learn và LightGBM) cộng dồn mức giảm vẩn đục ở mọi nút dùng đặc trưng đó. Đặc trưng có nhiều giá trị khác nhau có nhiều cơ hội được chọn hơn, nên nó **luôn** trông quan trọng — kể cả khi nó là số ngẫu nhiên. **Kiểm chứng:** thêm một cột nhiễu ngẫu nhiên vào dữ liệu; mọi đặc trưng xếp dưới cột nhiễu đó là rác.',
            },
            {
              title: 'Bẫy 2 — Đo trên tập huấn luyện, không phải dữ liệu mới',
              md: 'Tầm quan trọng mặc định được tính từ quá trình xây cây, tức là trên dữ liệu mô hình đã thấy. Một đặc trưng giúp ghi nhớ tập huấn luyện sẽ có điểm cao dù vô dụng ngoài đời. **Kiểm chứng:** dùng `permutation_importance` trên tập kiểm tra — xáo trộn một cột và đo mức tụt của chỉ số thật.',
            },
            {
              title: 'Bẫy 3 — Đặc trưng tương quan chia nhau điểm',
              md: 'Nếu `so_ket_noi_1phut` và `so_ket_noi_5phut` tương quan 0,95, cây dùng lúc cái này lúc cái kia và mỗi cái nhận nửa số điểm. Cả hai trông tầm thường, trong khi nhóm hai đặc trưng đó có thể là tín hiệu mạnh nhất. **Kiểm chứng:** hoán vị theo **nhóm** đặc trưng tương quan, hoặc gộp chúng lại trước.',
            },
            {
              title: 'Bẫy 4 — Quan trọng không phải nhân quả, và không phải hướng',
              md: 'Điểm quan trọng chỉ nói "mô hình dựa vào cột này nhiều", không nói "cột này gây ra tấn công" và cũng không nói giá trị cao thì độc hay lành. **Kiểm chứng:** dùng SHAP (TreeSHAP chạy rất nhanh trên mô hình cây) để thấy cả độ lớn lẫn hướng đóng góp ở từng mẫu.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'Chuyện có thật: đặc trưng số một hoá ra là cái nhãn',
          md: 'Một đội xây mô hình phân loại cảnh báo, PR-AUC 0,97, mọi người rất vui. Bảng importance cho thấy `assignee_team` chiếm 61% tổng tầm quan trọng. Điều tra ra: cảnh báo đúng luôn được chuyển sang đội ứng cứu sự cố, còn cảnh báo giả thì đóng tại chỗ. Trường đó được ghi **sau khi** analyst ra kết luận. Mô hình không dự đoán gì cả — nó đọc câu trả lời từ tương lai. Quy tắc rút ra: **bất kỳ đặc trưng nào chiếm trên 50% tầm quan trọng đều phải được coi là nghi phạm rò rỉ cho tới khi chứng minh được ngược lại.**',
        },
        { t: 'terms', ids: ['random-forest', 'gbdt', 'shap', 'qua-khop', 'ro-ri-du-lieu'] },
      ],
      keyTakeaways: [
        'Bagging huấn luyện cây độc lập rồi trung bình để giảm phương sai; boosting huấn luyện tuần tự để giảm thiên lệch.',
        'Thêm cây vào Random Forest gần như vô hại; thêm cây vào boosting SẼ quá khớp, nên luôn dùng dừng sớm.',
        'Tổ hợp cây thắng trên dữ liệu bảng vì không cần chuẩn hoá, bắt ngưỡng phi tuyến tự nhiên, chịu được cột vô dụng và xử lý giá trị thiếu.',
        'Cây không ngoại suy: giá trị vượt ngoài khoảng huấn luyện được đối xử như giá trị lớn nhất đã thấy.',
        'Feature importance mặc định thiên lệch về đặc trưng nhiều giá trị phân biệt và được đo trên tập huấn luyện — dùng permutation importance trên tập kiểm tra để báo cáo.',
        'Một đặc trưng chiếm trên 50% tầm quan trọng là nghi phạm rò rỉ nhãn cho tới khi chứng minh ngược lại.',
      ],
      cards: [
        {
          id: 't3l5-c1',
          front: 'Bagging và boosting nhắm vào thành phần lỗi nào khác nhau?',
          back: 'Bagging giảm phương sai bằng cách trung bình nhiều cây sâu độc lập. Boosting giảm thiên lệch bằng cách cộng dần các cây nông sửa phần dư.',
          tags: ['random-forest', 'gbdt'],
        },
        {
          id: 't3l5-c2',
          front: 'Vì sao Random Forest ngẫu nhiên hoá đặc trưng ở MỖI nút chứ không chỉ lấy mẫu bootstrap?',
          back: 'Nếu không, mọi cây đều chọn cùng một đặc trưng mạnh ở nút gốc và trở nên giống nhau — trung bình các cây giống nhau thì không giảm được phương sai.',
          tags: ['random-forest'],
        },
        {
          id: 't3l5-c3',
          front: 'Vì sao không nên đặt n_estimators cố định cho gradient boosting?',
          back: 'Vì boosting quá khớp khi thêm quá nhiều cây. Đặt một số lớn và dùng dừng sớm trên tập kiểm định để thuật toán tự tìm điểm đỉnh.',
          tags: ['gbdt', 'sieu-tham-so'],
        },
        {
          id: 't3l5-c4',
          front: 'Nêu hai lý do feature importance mặc định của thư viện cây gây hiểu nhầm.',
          back: 'Nó thiên lệch về đặc trưng có nhiều giá trị khác nhau, và nó được tính trên tập huấn luyện chứ không phải dữ liệu mới.',
          tags: ['gbdt', 'shap'],
        },
        {
          id: 't3l5-c5',
          front: 'Mô hình cây xử lý thế nào với giá trị vượt xa mọi giá trị từng thấy khi huấn luyện?',
          back: 'Nó rơi vào lá cực biên và nhận đúng dự đoán như giá trị lớn nhất đã thấy — cây không ngoại suy được.',
          tags: ['gbdt', 'gioi-han'],
        },
      ],
      quiz: [
        {
          id: 't3l5-q1',
          kind: 'mcq',
          tags: ['random-forest', 'gbdt'],
          q: 'Phát biểu nào mô tả ĐÚNG khác biệt cốt lõi giữa Random Forest và Gradient Boosting?',
          options: [
            'Random Forest dùng cây, Gradient Boosting dùng mô hình tuyến tính',
            'Random Forest huấn luyện các cây độc lập rồi trung bình; Gradient Boosting huấn luyện tuần tự, mỗi cây sửa phần dư của tổng trước đó',
            'Random Forest chỉ dùng cho phân loại, Gradient Boosting chỉ dùng cho hồi quy',
            'Random Forest cần chuẩn hoá đặc trưng, Gradient Boosting thì không',
          ],
          answer: 1,
          why: 'Sự khác biệt nằm ở **quan hệ giữa các cây**, không ở loại mô hình cơ sở. Độc lập + trung bình là bagging và nó tấn công phương sai. Tuần tự + sửa phần dư là boosting và nó tấn công thiên lệch. Từ khác biệt này suy ra mọi hệ quả thực tế: khả năng song song hoá, độ nhạy với số cây, độ sâu cây nên đặt bao nhiêu, và có cần dừng sớm hay không.',
          distractorWhy: [
            'Cả hai đều dùng cây làm mô hình cơ sở.',
            '',
            'Cả hai đều làm được phân loại lẫn hồi quy.',
            'Không mô hình cây nào cần chuẩn hoá đặc trưng — đó là ưu điểm chung của chúng.',
          ],
        },
        {
          id: 't3l5-q2',
          kind: 'multi',
          tags: ['gbdt', 'shap'],
          q: 'Bạn muốn báo cáo đặc trưng nào thực sự quan trọng cho mô hình LightGBM phát hiện xâm nhập. Cách làm nào hợp lệ? (Chọn tất cả)',
          options: [
            'Dùng permutation_importance trên tập kiểm tra chưa được dùng để huấn luyện hay chỉnh tham số',
            'Thêm một cột nhiễu ngẫu nhiên và loại mọi đặc trưng xếp hạng dưới nó',
            'In thẳng feature_importances_ mặc định và đưa vào slide',
            'Dùng TreeSHAP để xem cả độ lớn lẫn hướng đóng góp ở mức từng mẫu',
          ],
          answers: [0, 1, 3],
          why: 'Ba cách hợp lệ đều có chung một đặc điểm: chúng đo tác động lên **dữ liệu mô hình chưa thấy**, hoặc đưa ra một mốc so sánh khách quan. Cột nhiễu ngẫu nhiên là mẹo rẻ tiền nhưng cực kỳ hiệu quả để lộ ra bao nhiêu đặc trưng của bạn thực chất là rác. Còn `feature_importances_` mặc định được tính trong lúc xây cây trên chính tập huấn luyện, và thiên lệch về đặc trưng nhiều giá trị phân biệt — nó có thể dùng để dò lỗi nhanh, nhưng không dùng để báo cáo.',
        },
        {
          id: 't3l5-q3',
          kind: 'mcq',
          tags: ['gbdt', 'ro-ri-du-lieu'],
          q: 'Mô hình xếp hạng cảnh báo đạt PR-AUC 0,97 và một đặc trưng chiếm 61% tổng tầm quan trọng. Phản ứng đúng đắn nhất?',
          options: [
            'Ăn mừng và triển khai — đó là một đặc trưng rất mạnh',
            'Coi đặc trưng đó là nghi phạm rò rỉ nhãn và kiểm tra thời điểm nó được ghi so với thời điểm gắn nhãn',
            'Bỏ đặc trưng đó đi ngay lập tức để mô hình cân bằng hơn',
            'Tăng cường phạt L2 để giảm ảnh hưởng của đặc trưng đó',
          ],
          answer: 1,
          why: 'Trong bảo mật, một đặc trưng áp đảo thường có nghĩa là nó chứa sẵn câu trả lời. Câu hỏi kiểm tra duy nhất và quan trọng nhất là: **tại thời điểm mô hình cần đưa ra dự đoán trong thực tế, trường này đã có giá trị chưa?** Nếu nó được ghi sau khi analyst kết luận, đó là rò rỉ. Bỏ ngay lập tức là quá vội — có thể đó là một đặc trưng thật sự mạnh và hợp lệ; điều tra trước đã.',
          distractorWhy: [
            'Chỉ số quá đẹp trong bảo mật hầu như luôn là dấu hiệu lỗi chứ không phải thành tích.',
            '',
            'Bỏ mà chưa hiểu nguyên nhân có thể vứt đi một tín hiệu hợp lệ và không học được gì.',
            'Phạt không giải quyết vấn đề rò rỉ — mô hình vẫn đọc được câu trả lời, chỉ là nhẹ tay hơn.',
          ],
        },
        {
          id: 't3l5-q4',
          kind: 'truefalse',
          tags: ['gbdt', 'gioi-han'],
          q: 'Một mô hình gradient boosting huấn luyện với bytes_sent tối đa 8 GB sẽ cho điểm rủi ro cao hơn khi gặp phiên 400 GB.',
          answer: false,
          why: 'Sai. Cây phân hoạch không gian thành các hộp và dự đoán bằng giá trị trung bình trong lá. Mọi giá trị lớn hơn ngưỡng chia cuối cùng đều rơi vào cùng một lá, nên 400 GB nhận đúng điểm số như 8 GB. Đây là giới hạn cấu trúc, không phải lỗi cấu hình. Cách xử lý trong thực tế: bổ sung luật ngưỡng cứng cho vùng cực đoan, hoặc thay giá trị tuyệt đối bằng tỉ lệ so với đường cơ sở của chính thực thể đó (ví dụ "gấp 47 lần trung bình 30 ngày của máy này").',
        },
      ],
      terms: ['random-forest', 'gbdt', 'shap', 'qua-khop', 'ro-ri-du-lieu', 'ember'],
      further: [
        {
          title: 'Why do tree-based models still outperform deep learning on tabular data? — Grinsztajn, Oyallon, Varoquaux (NeurIPS 2022)',
          note: 'Phân tích có hệ thống chứ không phải cảm tính. Ba lý do họ đưa ra giải thích chính xác vì sao dữ liệu bảo mật hợp với cây.',
        },
        {
          title: 'EMBER: An Open Dataset for Training Static PE Malware Machine Learning Models — Anderson & Roth (2018)',
          note: 'Bộ dữ liệu và mô hình chuẩn LightGBM đi kèm. Đọc phần mô tả đặc trưng để thấy một bộ đặc trưng bảo mật nghiêm túc trông như thế nào.',
        },
        {
          title: 'Tài liệu LightGBM — Parameters Tuning',
          note: 'Trang duy nhất bạn cần khi chỉnh tham số. Ngắn, thực dụng, giải thích rõ đánh đổi giữa tốc độ và độ chính xác.',
        },
      ],
    },
    /* ====================================================================== */
    {
      id: 't3-l6',
      trackId: 'ml-cot-loi',
      title: 'k-NN, SVM và ý tưởng khoảng cách',
      subtitle: 'Hai họ mô hình dạy bạn cách nghĩ về "giống nhau" — và vì sao chúng hiếm khi sống sót ở quy mô thật',
      minutes: 15,
      practiceMinutes: 7,
      level: 'trung-cap',
      prereqs: ['t3-l5', 't1-l6'],
      why: {
        short:
          'k-NN và SVM là cách nhanh nhất để hiểu khái niệm "khoảng cách trong không gian đặc trưng" — nền tảng của phát hiện bất thường, phân cụm hành vi và tìm mẫu tương tự, những thứ bạn sẽ dùng suốt chặng 6.',
        scenario:
          'Analyst đưa bạn một mẫu mã độc mới và hỏi: "Trong 40.000 mẫu đã phân tích, cái nào giống nó nhất?" Đó là bài toán k-NN thuần tuý. Nhưng nếu bạn cài đặt ngây thơ, mỗi truy vấn phải so với cả 40.000 mẫu — và khi kho lên 4 triệu thì hệ thống chết.',
        roles: ['Security Data Scientist', 'Malware Analyst', 'ML Engineer'],
        costOfNotKnowing:
          'Bạn hoặc chọn k-NN cho hệ thống phải trả lời 50.000 sự kiện mỗi giây rồi phát hiện độ trễ không thể chấp nhận sau khi đã xây xong, hoặc bỏ qua nó ở đúng bài toán "tìm mẫu giống nhất" mà nó là công cụ tự nhiên nhất.',
      },
      objectives: [
        'Giải thích được k-NN dự đoán bằng cách nào mà không cần giai đoạn huấn luyện',
        'Chọn được giữa khoảng cách Euclid và cosine cho một loại đặc trưng cụ thể',
        'Giải thích ý tưởng lề cực đại và kernel trick bằng lời, không dùng công thức',
        'Ước lượng được chi phí suy luận của k-NN và nêu hai cách làm nó chạy được ở quy mô lớn',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'k-NN được gọi là thuật toán "lười" (lazy learner) vì giai đoạn huấn luyện của nó gần như không làm gì cả. Vậy công việc bị đẩy đi đâu, và điều đó gây ra hậu quả gì khi bạn triển khai nó trong một hệ thống phải trả lời trong 10 mili giây?',
          reveal:
            'Công việc bị đẩy hết sang **lúc dự đoán**. Huấn luyện k-NN = lưu lại toàn bộ dữ liệu, hết. Nhưng mỗi lần dự đoán, nó phải tính khoảng cách từ điểm mới tới **mọi** điểm đã lưu rồi sắp xếp. Với 40.000 mẫu và 200 đặc trưng, đó là 8 triệu phép nhân cho **một** dự đoán. Mọi mô hình khác trong chặng này làm ngược lại: huấn luyện tốn hàng giờ, nhưng dự đoán là vài phép cộng. Trong bảo mật, nơi bạn thường phải chấm điểm hàng chục nghìn sự kiện mỗi giây, sự đánh đổi này gần như luôn bất lợi cho k-NN — trừ một trường hợp: khi bản thân câu hỏi là "cái nào giống nhất", chứ không phải "cái này có độc không".',
        },
        { t: 'h', text: 'k-NN: hàng xóm quyết định bạn là ai', level: 2 },
        {
          t: 'p',
          md: 'Toàn bộ thuật toán nằm gọn trong một câu: **tìm k điểm gần nhất trong dữ liệu đã biết, rồi lấy nhãn theo đa số.** Không có tham số nào được học, không có hàm mất mát, không có gradient.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao vẫn đáng học một thuật toán ít dùng ở quy mô lớn',
          md: 'Vì k-NN buộc bạn phải trả lời một câu hỏi mà **mọi** mô hình đều ngầm trả lời: *"hai mẫu thế nào thì gọi là giống nhau?"* Ở k-NN câu trả lời hiện ra lồ lộ trong hàm khoảng cách. Ở Random Forest nó bị giấu trong cấu trúc cây. Hiểu rõ ở chỗ dễ nhìn giúp bạn đặt đúng câu hỏi ở chỗ khó nhìn.',
        },
        { t: 'lab', id: 'lab-knn', intro: 'Kéo k và độ nhiễu, xem ranh giới quyết định biến dạng ra sao.' },
        { t: 'h', text: 'Chọn thước đo khoảng cách — quyết định quan trọng hơn chọn k', level: 2 },
        {
          t: 'table',
          head: ['Thước đo', 'Đo cái gì', 'Dùng cho đặc trưng bảo mật nào', 'Bẫy'],
          rows: [
            [
              'Euclid (L2)',
              'Khoảng cách thẳng trong không gian',
              'Đặc trưng số cùng đơn vị và đã chuẩn hoá: thống kê phiên, tỉ lệ byte',
              'Bị đặc trưng có thang đo lớn nuốt chửng nếu quên chuẩn hoá',
            ],
            [
              'Cosine',
              'Góc giữa hai vector, bỏ qua độ dài',
              'Vector TF-IDF của dòng lệnh, log, nội dung email',
              'Hai lệnh cùng "hình dạng" nhưng khác quy mô bị coi là giống hệt',
            ],
            [
              'Manhattan (L1)',
              'Tổng chênh lệch từng chiều',
              'Đặc trưng đếm rời rạc: số kết nối, số tệp mở',
              'Ít nhạy với ngoại lai hơn L2 — đôi khi đó lại là điều bạn không muốn',
            ],
            [
              'Jaccard',
              'Tỉ lệ phần chung giữa hai tập hợp',
              'Tập hàm API được gọi, tập cổng đã mở, tập tên miền truy vấn',
              'Bỏ qua hoàn toàn số lần lặp lại',
            ],
          ],
          caption: 'Chọn sai thước đo làm hỏng mô hình nhanh hơn chọn sai thuật toán.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bẫy: quên chuẩn hoá',
          md: 'Giả sử hai đặc trưng: `so_ket_noi` (0–50) và `byte_gui` (0–2.000.000.000). Khoảng cách Euclid sẽ **hoàn toàn** bị byte chi phối — chênh lệch 40 kết nối đóng góp 1.600 vào tổng bình phương, còn chênh lệch 1 MB đóng góp 10¹². Mô hình của bạn thực chất chỉ đang nhìn một đặc trưng duy nhất. Đây không phải lỗi hiếm; đây là lỗi mặc định khi ai đó quên đưa `StandardScaler` vào pipeline.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Chuẩn hoá phải nằm TRONG pipeline, nếu không bạn đã rò rỉ thống kê của tập kiểm tra vào tập huấn luyện.',
          code: `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

# Sai: fit scaler trên toàn bộ dữ liệu rồi mới chia -> rò rỉ
# scaler.fit(X_all); X = scaler.transform(X_all)

# Đúng: gói vào pipeline, mọi bước fit chỉ thấy dữ liệu huấn luyện
mo_hinh = Pipeline([
    ("chuan_hoa", StandardScaler()),
    ("knn", KNeighborsClassifier(n_neighbors=5, metric="euclidean")),
])
mo_hinh.fit(X_train, y_train)`,
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't3l6-cp1',
              kind: 'mcq',
              tags: ['knn', 'khoang-cach', 'dac-trung'],
              q: 'Bạn biểu diễn mỗi dòng lệnh PowerShell thành vector TF-IDF để tìm lệnh tương tự. Thước đo khoảng cách nào phù hợp nhất?',
              options: [
                'Euclid, vì nó là mặc định của scikit-learn',
                'Cosine, vì nó so sánh thành phần từ ngữ mà không bị độ dài lệnh chi phối',
                'Jaccard, vì TF-IDF là tập hợp',
                'Manhattan, vì nó ổn định với ngoại lai',
              ],
              answer: 1,
              why: 'Vector TF-IDF có độ dài tỉ lệ với độ dài văn bản. Với Euclid, một lệnh dài 300 ký tự và một lệnh dài 30 ký tự nhưng cùng nội dung sẽ bị coi là rất xa nhau. Cosine chỉ nhìn **hướng** của vector, tức là tỉ lệ tương đối giữa các từ, nên nó bỏ qua độ dài — đúng thứ ta muốn. Đây là lý do cosine gần như luôn là lựa chọn mặc định cho dữ liệu văn bản.',
              distractorWhy: [
                'Mặc định của thư viện không bao giờ là lý do kỹ thuật. Euclid trên TF-IDF trộn lẫn nội dung với độ dài.',
                '',
                'Jaccard làm việc trên tập hợp nhị phân có/không, nó vứt bỏ toàn bộ trọng số TF-IDF mà bạn vừa tính công phu.',
                'Manhattan vẫn bị độ dài văn bản chi phối giống Euclid, chỉ ở mức độ nhẹ hơn.',
              ],
            },
          ],
        },
        { t: 'h', text: 'SVM: tìm đường phân chia có lề rộng nhất', level: 2 },
        {
          t: 'p',
          md: 'Khi hai lớp tách được bằng một đường thẳng, thường có **vô số** đường thẳng làm được điều đó. SVM chọn đường mà khoảng trống hai bên rộng nhất — gọi là **lề cực đại** (maximum margin).',
        },
        {
          t: 'steps',
          title: 'Ba ý tưởng của SVM, không cần công thức',
          steps: [
            {
              title: 'Lề rộng = tổng quát hoá tốt hơn',
              md: 'Trực giác: nếu đường phân chia sát rạt vào các điểm dữ liệu, chỉ cần một mẫu mới lệch một chút là rơi sang bên kia. Lề rộng tạo vùng đệm an toàn. Trong bảo mật, "lệch một chút" chính xác là điều kẻ tấn công sẽ làm.',
            },
            {
              title: 'Chỉ vài điểm quyết định tất cả',
              md: 'Đường phân chia chỉ phụ thuộc vào những điểm nằm sát lề — gọi là **vector hỗ trợ** (support vector). Xoá 90% dữ liệu ở xa, mô hình không đổi. Đây vừa là ưu điểm (gọn) vừa là nhược điểm (rất nhạy với vài mẫu bị gắn nhãn sai nằm gần biên).',
            },
            {
              title: 'Kernel trick: cong hoá đường thẳng',
              md: 'Khi dữ liệu không tách được bằng đường thẳng, ta có thể chiếu nó lên không gian nhiều chiều hơn nơi nó tách được, rồi cắt bằng mặt phẳng ở đó. Kernel là mẹo tính toán cho phép làm việc này **mà không cần thực sự tạo ra không gian đó** — bạn chỉ cần một hàm đo độ giống nhau giữa hai điểm. Kernel RBF là lựa chọn mặc định hợp lý.',
            },
          ],
        },
        {
          t: 'compare',
          title: 'Khi nào chọn cái nào',
          left: {
            title: 'SVM còn hợp lý khi…',
            icon: 'check-circle',
            items: [
              'Số đặc trưng lớn hơn số mẫu (ví dụ TF-IDF của vài nghìn email)',
              'Dữ liệu sạch, ít nhãn sai gần biên',
              'Bạn cần một baseline mạnh trên tập vài nghìn tới vài chục nghìn mẫu',
              'Bài toán phân loại văn bản có cấu trúc rõ',
            ],
          },
          right: {
            title: 'Chuyển sang gradient boosting khi…',
            icon: 'x',
            items: [
              'Dữ liệu bảng có đặc trưng khác đơn vị, nhiều giá trị thiếu',
              'Trên 100.000 mẫu — thời gian huấn luyện SVM tăng gần bậc hai',
              'Bạn cần giải thích dự đoán cho analyst',
              'Bạn cần điểm số có ý nghĩa xác suất mà không muốn hiệu chuẩn thêm',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Thực tế năm 2026',
          md: 'SVM từng thống trị phân loại văn bản và mã độc suốt những năm 2000–2010. Ngày nay, với dữ liệu bảng bạn dùng LightGBM, với văn bản bạn dùng embedding. SVM vẫn đáng biết vì **ý tưởng lề** xuất hiện lại ở khắp nơi — kể cả trong cách người ta đánh giá độ bền đối kháng của mô hình ở chặng 8: "kẻ tấn công phải đẩy mẫu đi bao xa để lật nhãn" chính là câu hỏi về lề.',
        },
        { t: 'h', text: 'Làm k-NN chạy được ở quy mô thật', level: 2 },
        {
          t: 'checklist',
          title: 'Hai kỹ thuật bạn sẽ cần khi kho mẫu vượt vài trăm nghìn',
          items: [
            'Chỉ mục không gian (KD-tree, Ball-tree): nhanh hơn nhiều ở số chiều thấp, nhưng mất hiệu quả khi vượt khoảng 20 chiều — hệ quả trực tiếp của lời nguyền số chiều.',
            'Tìm láng giềng gần đúng (ANN: HNSW, FAISS, ScaNN): chấp nhận sai vài phần trăm để đổi lấy tốc độ nhanh hơn hàng trăm lần. Đây là thứ mọi hệ thống "tìm mẫu tương tự" thật đang dùng.',
            'Giảm chiều trước khi đánh chỉ mục (PCA hoặc embedding học được) để đưa số chiều về vùng mà khoảng cách còn ý nghĩa.',
            'Nếu câu hỏi thật sự là "có độc không" chứ không phải "giống cái nào", hãy dùng mô hình khác — đừng ép k-NN.',
          ],
        },
      ],
      keyTakeaways: [
        'k-NN không huấn luyện gì cả; toàn bộ chi phí dồn vào lúc dự đoán — thường là bất lợi chí mạng trong bảo mật.',
        'Chọn thước đo khoảng cách quan trọng hơn chọn k: cosine cho văn bản, Euclid cho số đã chuẩn hoá, Jaccard cho tập hợp.',
        'Quên chuẩn hoá khiến đặc trưng có thang đo lớn nuốt chửng mọi đặc trưng khác — và mô hình vẫn chạy, không báo lỗi.',
        'SVM tìm đường phân chia có lề rộng nhất; chỉ các vector hỗ trợ quyết định kết quả, nên vài nhãn sai gần biên có thể phá hỏng mô hình.',
        'Kernel trick cho phép phân chia phi tuyến mà không phải dựng không gian nhiều chiều thật.',
        'Ở quy mô lớn, "tìm mẫu giống nhất" được giải bằng tìm kiếm gần đúng (HNSW/FAISS), không phải k-NN ngây thơ.',
      ],
      cards: [
        {
          id: 't3l6-c1',
          front: 'Vì sao k-NN được gọi là thuật toán "lười", và hậu quả khi triển khai là gì?',
          back: 'Huấn luyện chỉ là lưu dữ liệu; toàn bộ tính toán dồn sang lúc dự đoán. Hậu quả: độ trễ suy luận tăng theo kích thước kho dữ liệu, gần như không dùng được cho hệ thống thông lượng cao.',
          tags: ['knn'],
        },
        {
          id: 't3l6-c2',
          front: 'Khi nào dùng khoảng cách cosine thay vì Euclid?',
          back: 'Khi độ dài vector không mang thông tin cần thiết — điển hình là vector TF-IDF của văn bản, log, dòng lệnh. Cosine chỉ so hướng, bỏ qua độ lớn.',
          tags: ['khoang-cach', 'dac-trung'],
        },
        {
          id: 't3l6-c3',
          front: 'Vector hỗ trợ (support vector) là gì và vì sao SVM nhạy cảm với nhãn sai?',
          back: 'Là các điểm nằm sát lề, và chỉ chúng quyết định đường phân chia. Một mẫu bị gắn nhãn sai nằm gần biên có thể kéo lệch toàn bộ ranh giới.',
          tags: ['svm'],
        },
        {
          id: 't3l6-c4',
          front: 'Kernel trick giải quyết vấn đề gì?',
          back: 'Cho phép phân chia phi tuyến bằng cách làm việc trong không gian nhiều chiều hơn mà không cần thực sự tạo ra không gian đó — chỉ cần một hàm đo độ giống nhau giữa hai điểm.',
          tags: ['svm'],
        },
        {
          id: 't3l6-c5',
          front: 'Ở quy mô hàng triệu mẫu, bài toán "tìm mẫu giống nhất" được giải bằng gì?',
          back: 'Tìm láng giềng gần đúng (ANN) như HNSW, FAISS hoặc ScaNN — chấp nhận sai vài phần trăm để đổi lấy tốc độ nhanh hơn hàng trăm lần.',
          tags: ['knn', 'thuc-chien'],
        },
      ],
      quiz: [
        {
          id: 't3l6-q1',
          kind: 'mcq',
          tags: ['knn', 'thuc-chien'],
          q: 'Hệ thống của bạn phải chấm điểm 50.000 sự kiện mạng mỗi giây. Vì sao k-NN với kho 2 triệu mẫu là lựa chọn tồi?',
          options: [
            'Vì k-NN không xử lý được đặc trưng số',
            'Vì mỗi dự đoán phải tính khoảng cách tới toàn bộ kho, khiến độ trễ tăng tuyến tính theo kích thước dữ liệu',
            'Vì k-NN cần quá nhiều thời gian huấn luyện',
            'Vì k-NN chỉ hoạt động với hai lớp',
          ],
          answer: 1,
          why: 'k-NN đẩy toàn bộ chi phí sang lúc suy luận. 50.000 truy vấn/giây × 2 triệu phép so sánh = 10¹¹ phép tính mỗi giây, chưa kể sắp xếp. Không hạ tầng hợp lý nào chịu nổi. Ngược lại, thời gian huấn luyện của k-NN gần bằng 0 — nên đáp án "cần nhiều thời gian huấn luyện" là hiểu ngược hoàn toàn bản chất thuật toán.',
          distractorWhy: [
            'k-NN làm việc chủ yếu với đặc trưng số; đó không phải vấn đề.',
            '',
            'Ngược lại: k-NN gần như không có giai đoạn huấn luyện. Đó chính là điểm mấu chốt.',
            'k-NN xử lý đa lớp một cách tự nhiên bằng bỏ phiếu đa số.',
          ],
        },
        {
          id: 't3l6-q2',
          kind: 'truefalse',
          tags: ['knn', 'qua-khop'],
          q: 'Đặt k = 1 cho k-NN sẽ cho độ chính xác 100% trên tập huấn luyện, và đó là dấu hiệu mô hình tốt.',
          answer: false,
          why: 'Nửa đầu đúng, nửa sau sai hoàn toàn. Với k = 1, hàng xóm gần nhất của mỗi điểm huấn luyện chính là bản thân nó, nên độ chính xác trên tập huấn luyện luôn là 100%. Đó là ví dụ giáo khoa về **quá khớp**: con số đẹp không mang thông tin nào về khả năng tổng quát hoá. Đây cũng là lý do bạn không bao giờ được đánh giá mô hình trên dữ liệu nó đã thấy.',
        },
        {
          id: 't3l6-q3',
          kind: 'match',
          tags: ['khoang-cach', 'dac-trung'],
          q: 'Nối loại đặc trưng với thước đo khoảng cách phù hợp nhất.',
          pairs: [
            ['Vector TF-IDF của dòng lệnh', 'Cosine'],
            ['Tập hàm API mà tệp gọi', 'Jaccard'],
            ['Thống kê phiên đã chuẩn hoá', 'Euclid'],
            ['Số lần đếm rời rạc, nhiều ngoại lai', 'Manhattan'],
          ],
          why: 'Thước đo khoảng cách mã hoá định nghĩa "giống nhau" của bạn. Văn bản → so tỉ lệ từ, bỏ độ dài (cosine). Tập hợp có/không → tỉ lệ phần chung (Jaccard). Số liên tục cùng thang → khoảng cách hình học (Euclid). Đếm rời rạc có đuôi nặng → tổng chênh lệch, ít bị ngoại lai kéo (Manhattan).',
        },
        {
          id: 't3l6-q4',
          kind: 'input',
          tags: ['svm'],
          q: 'SVM chọn đường phân chia sao cho khoảng trống hai bên rộng nhất. Khoảng trống đó gọi là gì?',
          accept: ['le', 'lề', 'margin', 'le cuc dai', 'maximum margin', 'lề cực đại'],
          placeholder: 'Một từ…',
          hint: 'Tiếng Anh là "margin".',
          why: '**Lề** (margin). Ý tưởng lề rộng = vùng đệm an toàn sẽ quay lại ở chặng 8: câu hỏi "kẻ tấn công phải sửa mẫu đi bao xa để lật nhãn" chính là câu hỏi về lề của mô hình, và nó là cách đo độ bền đối kháng.',
        },
      ],
      terms: ['knn', 'svm', 'khoang-cach', 'qua-khop', 'dac-trung'],
      further: [
        {
          title: 'Tài liệu scikit-learn — Nearest Neighbors',
          note: 'Phần so sánh KD-tree, Ball-tree và brute force theo số chiều rất đáng đọc; nó cho thấy lời nguyền số chiều bằng số liệu cụ thể.',
        },
        {
          title: 'Efficient and robust approximate nearest neighbor search using HNSW graphs — Malkov & Yashunin (2018)',
          note: 'Thuật toán đứng sau hầu hết hệ thống tìm mẫu tương tự hiện đại. Đọc phần trực giác về đồ thị phân tầng là đủ.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't3-l7',
      trackId: 'ml-cot-loi',
      title: 'Quá khớp, thiên lệch và phương sai',
      subtitle: 'Ba bệnh khác nhau trông rất giống nhau — chẩn đoán sai thì chữa sai',
      minutes: 14,
      practiceMinutes: 7,
      level: 'co-ban',
      prereqs: ['t3-l5'],
      why: {
        short:
          'Gần như mọi mô hình bảo mật thất bại đều thuộc một trong ba bệnh: quá khớp, dưới khớp, hoặc rò rỉ nhãn — và mỗi bệnh cần một cách chữa hoàn toàn khác nhau.',
        scenario:
          'Mô hình phát hiện mã độc của bạn đạt F1 = 0,97 trên tập kiểm tra nhưng chỉ 0,61 trong tháng đầu triển khai. Sếp hỏi: "Thêm dữ liệu có sửa được không?" Câu trả lời đúng phụ thuộc hoàn toàn vào việc bạn chẩn đoán ra bệnh nào — và thêm dữ liệu chỉ chữa được đúng một trong ba.',
        roles: ['Security Data Scientist', 'ML Engineer', 'Detection Engineer'],
        costOfNotKnowing:
          'Bạn sẽ đi theo đường mòn "thêm dữ liệu, thêm đặc trưng, thử mô hình mạnh hơn" trong nhiều tuần cho một mô hình đang dưới khớp hoặc đang rò rỉ nhãn — nơi cả ba việc đó đều vô ích hoặc phản tác dụng.',
      },
      objectives: [
        'Phân biệt được quá khớp, dưới khớp và rò rỉ nhãn từ hai con số: lỗi huấn luyện và lỗi kiểm định',
        'Chọn đúng biện pháp can thiệp cho từng chẩn đoán',
        'Giải thích được vì sao mô hình đạt 100% trên tập huấn luyện là tin xấu',
        'Nêu được ba kỹ thuật điều chuẩn và tác dụng khác nhau của L1 với L2',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Hai mô hình phát hiện phishing. Mô hình A: lỗi huấn luyện 2%, lỗi kiểm định 3%. Mô hình B: lỗi huấn luyện 0%, lỗi kiểm định 19%. Mô hình nào đáng lo hơn, và nếu bạn chỉ được làm MỘT việc để cải thiện nó thì làm gì?',
          reveal:
            'Mô hình B đáng lo. Khoảng cách 19 điểm phần trăm giữa hai con số là chữ ký kinh điển của **quá khớp**: nó đã ghi nhớ tập huấn luyện chứ không học được quy luật. Việc nên làm đầu tiên: **giảm độ phức tạp hoặc thêm điều chuẩn** — không phải thêm đặc trưng, không phải đổi sang mô hình mạnh hơn (cả hai đều làm bệnh nặng thêm). Nhưng có một khả năng nguy hiểm hơn cần loại trừ trước: lỗi huấn luyện đúng bằng 0% cũng là dấu hiệu của **rò rỉ nhãn** — có một đặc trưng nào đó chứa sẵn câu trả lời. Hãy kiểm tra điều đó trước khi làm bất cứ việc gì khác.',
        },
        { t: 'figure', id: 'fig-bias-variance', caption: 'Tăng độ phức tạp thì lỗi huấn luyện giảm mãi, nhưng lỗi trên dữ liệu mới chạm đáy rồi bật lên. Điểm ngọt nằm ở đáy đường đỏ, không phải đáy đường xanh.' },
        { t: 'h', text: 'Ba bệnh, đọc từ hai con số', level: 2 },
        {
          t: 'table',
          head: ['Lỗi huấn luyện', 'Lỗi kiểm định', 'Chẩn đoán', 'Việc cần làm'],
          rows: [
            ['Cao (15%)', 'Cao (17%)', '**Dưới khớp** — mô hình quá đơn giản hoặc đặc trưng quá nghèo', 'Thêm đặc trưng, tăng độ phức tạp, giảm điều chuẩn. Thêm dữ liệu KHÔNG giúp gì.'],
            ['Thấp (2%)', 'Cao (19%)', '**Quá khớp** — mô hình ghi nhớ nhiễu', 'Giảm độ phức tạp, tăng điều chuẩn, thêm dữ liệu, dừng sớm.'],
            ['≈ 0%', 'Thấp bất thường (1%)', '**Rò rỉ nhãn** — có đặc trưng chứa sẵn đáp án', 'Soi lại từng đặc trưng và cách chia tập. Không phải bài toán mô hình.'],
            ['Thấp (3%)', 'Thấp (4%)', 'Khoẻ mạnh', 'Kiểm định trên dữ liệu của khoảng thời gian SAU nữa trước khi mừng.'],
          ],
          caption: 'Bảng chẩn đoán này nên được dán lên tường. Nó tiết kiệm hàng tuần công sức đi sai hướng.',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Trong bảo mật, hãy nghi ngờ rò rỉ TRƯỚC khi ăn mừng',
          md: 'Ở phần lớn ngành, mô hình đạt 99% nghĩa là bạn giỏi. Trong bảo mật, mô hình đạt 99% gần như luôn nghĩa là bạn có lỗi ở đâu đó: một đặc trưng rò rỉ (trường "đã bị analyst đóng"), một mẫu trùng giữa hai tập, hay một tạo tác của quy trình thu thập dữ liệu. **Kết quả quá đẹp là một triệu chứng, không phải một thành tựu.**',
        },
        { t: 'lab', id: 'lab-overfit', intro: 'Tăng bậc đa thức và nhìn hai đường lỗi tách nhau ra.' },
        { t: 'h', text: 'Thiên lệch và phương sai: hai nguồn sai số', level: 2 },
        {
          t: 'compare',
          title: 'Hai kiểu sai, hai cách chữa ngược nhau',
          left: {
            title: 'Thiên lệch cao (bias)',
            icon: 'target',
            items: [
              'Mô hình quá đơn giản để nắm được quy luật thật',
              'Sai một cách **nhất quán** — luôn lệch về cùng một phía',
              'Huấn luyện lại trên dữ liệu khác cho kết quả gần như y hệt',
              'Ví dụ: dùng một ngưỡng entropy duy nhất để phát hiện DGA',
              'Chữa: thêm đặc trưng, mô hình phức tạp hơn, bớt điều chuẩn',
            ],
          },
          right: {
            title: 'Phương sai cao (variance)',
            icon: 'dices',
            items: [
              'Mô hình quá nhạy với từng mẫu cụ thể trong tập huấn luyện',
              'Sai một cách **thất thường** — đổi dữ liệu là đổi kết quả',
              'Huấn luyện lại trên tập khác cho mô hình rất khác',
              'Ví dụ: cây quyết định sâu 40 tầng trên 3.000 mẫu',
              'Chữa: thêm dữ liệu, điều chuẩn, tổ hợp mô hình, dừng sớm',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao Random Forest hiệu quả đến vậy',
          md: 'Một cây sâu có **thiên lệch thấp, phương sai cao** — nó nắm được quy luật phức tạp nhưng bám quá sát dữ liệu cụ thể. Lấy trung bình hàng trăm cây như vậy, mỗi cây huấn luyện trên mẫu ngẫu nhiên khác nhau, thì các sai số thất thường triệt tiêu lẫn nhau trong khi phần quy luật chung được giữ lại. Đó chính là toàn bộ ý tưởng của bagging, diễn đạt bằng ngôn ngữ thiên lệch–phương sai.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't3l7-cp1',
              kind: 'mcq',
              tags: ['qua-khop', 'chan-doan'],
              q: 'Mô hình của bạn: lỗi huấn luyện 16%, lỗi kiểm định 18%. Đồng nghiệp đề xuất thu thập thêm 500.000 mẫu. Nhận xét đúng nhất?',
              options: [
                'Đề xuất tốt, thêm dữ liệu luôn cải thiện mô hình',
                'Vô ích: hai con số gần nhau và đều cao nghĩa là mô hình đang dưới khớp, không phải thiếu dữ liệu',
                'Đề xuất tốt vì nó cũng giảm phương sai',
                'Cần thêm dữ liệu và đồng thời tăng điều chuẩn',
              ],
              answer: 1,
              why: 'Lỗi huấn luyện 16% nghĩa là mô hình **còn chưa học nổi dữ liệu nó đang có trong tay**. Đưa thêm dữ liệu cùng loại chỉ cho nó thêm thứ để học kém. Đây là dưới khớp: cần đặc trưng giàu hơn hoặc mô hình có sức biểu diễn cao hơn. Tăng điều chuẩn còn làm bệnh nặng thêm vì nó ép mô hình đơn giản hơn nữa.',
            },
          ],
        },
        { t: 'h', text: 'Điều chuẩn: ba công cụ, ba tác dụng', level: 2 },
        {
          t: 'steps',
          steps: [
            {
              title: 'L2 (Ridge) — kéo mọi trọng số về gần 0',
              md: 'Phạt tổng bình phương trọng số. Kết quả: không trọng số nào quá lớn, mô hình ổn định hơn, nhưng **không** đặc trưng nào bị loại hẳn. Dùng khi bạn tin phần lớn đặc trưng đều có đóng góp nhỏ.',
            },
            {
              title: 'L1 (Lasso) — đẩy trọng số về đúng 0',
              md: 'Phạt tổng trị tuyệt đối. Kết quả: nhiều trọng số bị đưa về **chính xác 0**, tức là mô hình tự chọn đặc trưng. Cực kỳ hữu ích trong bảo mật khi bạn có 5.000 đặc trưng n-gram và muốn biết 40 cái nào thực sự quan trọng.',
            },
            {
              title: 'Dừng sớm (early stopping) — điều chuẩn miễn phí',
              md: 'Theo dõi lỗi trên tập kiểm định trong lúc huấn luyện và dừng ngay khi nó bắt đầu tăng. Không cần chọn siêu tham số phạt, không tốn thêm tính toán. Đây là biện pháp đầu tiên nên dùng với gradient boosting và mạng nơ-ron.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Dừng sớm với LightGBM: rẻ, hiệu quả, và cho bạn biết luôn số vòng lặp tối ưu.',
          code: `import lightgbm as lgb

mo_hinh = lgb.LGBMClassifier(
    n_estimators=5000,      # đặt cao, để dừng sớm tự quyết
    learning_rate=0.03,
    num_leaves=63,
    reg_lambda=1.0,         # điều chuẩn L2
)
mo_hinh.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    eval_metric="average_precision",   # PR-AUC, hop voi lop duong hiem
    callbacks=[lgb.early_stopping(stopping_rounds=100, verbose=True)],
)
print("So vong lap toi uu:", mo_hinh.best_iteration_)`,
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bẫy riêng của bảo mật: quá khớp vào một khoảng thời gian',
          md: 'Mô hình của bạn có thể không quá khớp vào từng mẫu, mà quá khớp vào **chiến dịch tấn công của quý đó**. Lỗi huấn luyện và lỗi kiểm định đều đẹp vì cả hai tập đều lấy từ cùng vài tháng. Chỉ khi triển khai sang quý sau, khi kẻ tấn công đã đổi hạ tầng, bạn mới thấy sự thật. Cách duy nhất phát hiện sớm: **luôn giữ một tập kiểm tra thuộc khoảng thời gian muộn hơn hẳn**, và đừng bao giờ nhìn vào nó cho tới lúc quyết định cuối cùng.',
        },
      ],
      keyTakeaways: [
        'Chẩn đoán bằng hai con số: lỗi huấn luyện và lỗi kiểm định. Cả hai cao = dưới khớp; chênh lệch lớn = quá khớp; cả hai gần 0 = nghi rò rỉ.',
        'Thêm dữ liệu chỉ chữa được quá khớp. Với mô hình dưới khớp, nó hoàn toàn vô ích.',
        'Trong bảo mật, kết quả quá đẹp là triệu chứng cần điều tra, không phải thành tựu cần ăn mừng.',
        'Thiên lệch = sai nhất quán do mô hình quá đơn giản; phương sai = sai thất thường do mô hình quá nhạy.',
        'L1 loại bỏ đặc trưng (đưa trọng số về đúng 0), L2 chỉ thu nhỏ chúng. Dừng sớm là biện pháp rẻ nhất nên thử trước.',
        'Quá khớp vào một khoảng thời gian là dạng quá khớp đặc thù của bảo mật, chỉ lộ ra khi kiểm tra trên dữ liệu muộn hơn hẳn.',
      ],
      cards: [
        {
          id: 't3l7-c1',
          front: 'Lỗi huấn luyện 16%, lỗi kiểm định 18%. Chẩn đoán là gì và nên làm gì?',
          back: 'Dưới khớp. Mô hình chưa học nổi dữ liệu đang có. Cần thêm đặc trưng hoặc mô hình mạnh hơn — thêm dữ liệu không giúp gì.',
          tags: ['chan-doan', 'qua-khop'],
        },
        {
          id: 't3l7-c2',
          front: 'Lỗi huấn luyện 2%, lỗi kiểm định 19%. Chẩn đoán là gì?',
          back: 'Quá khớp: mô hình ghi nhớ nhiễu của tập huấn luyện. Chữa bằng giảm độ phức tạp, tăng điều chuẩn, thêm dữ liệu, hoặc dừng sớm.',
          tags: ['chan-doan', 'qua-khop'],
        },
        {
          id: 't3l7-c3',
          front: 'Vì sao mô hình đạt 100% trên tập huấn luyện là tin xấu?',
          back: 'Vì nó nghĩa là mô hình đã ghi nhớ dữ liệu (quá khớp) hoặc có đặc trưng chứa sẵn đáp án (rò rỉ nhãn). Cả hai đều không tổng quát hoá được.',
          tags: ['qua-khop', 'ro-ri-du-lieu'],
        },
        {
          id: 't3l7-c4',
          front: 'Khác biệt thực dụng giữa điều chuẩn L1 và L2 là gì?',
          back: 'L1 đưa nhiều trọng số về đúng 0 nên tự chọn đặc trưng; L2 chỉ thu nhỏ mọi trọng số mà không loại bỏ cái nào.',
          tags: ['regularization'],
        },
        {
          id: 't3l7-c5',
          front: 'Dạng quá khớp đặc thù của bảo mật là gì?',
          back: 'Quá khớp vào một khoảng thời gian: mô hình học chiến dịch tấn công của quý đó. Chỉ lộ ra khi kiểm tra trên dữ liệu của giai đoạn muộn hơn hẳn.',
          tags: ['qua-khop', 'troi-khai-niem'],
        },
      ],
      quiz: [
        {
          id: 't3l7-q1',
          kind: 'mcq',
          tags: ['ro-ri-du-lieu', 'chan-doan'],
          q: 'Mô hình phân loại mã độc của bạn đạt lỗi huấn luyện 0,0% và lỗi kiểm định 0,4%. Hành động đầu tiên?',
          options: [
            'Triển khai ngay, đây là kết quả xuất sắc',
            'Kiểm tra từng đặc trưng và cách chia tập để tìm rò rỉ nhãn',
            'Tăng điều chuẩn để phòng quá khớp',
            'Thu thập thêm dữ liệu để xác nhận kết quả',
          ],
          answer: 1,
          why: 'Trong ML bảo mật, kết quả gần hoàn hảo hầu như luôn là dấu hiệu của rò rỉ. Các nghi phạm thường gặp: một đặc trưng được tính SAU khi sự cố đã được xử lý (ví dụ "số lần bị analyst xem"), mẫu trùng lặp nằm ở cả hai tập, hoặc một tạo tác của quy trình thu thập (mọi mẫu độc đều tải từ cùng một nguồn nên có chung metadata). Triển khai trước khi loại trừ những khả năng này là cách nhanh nhất để mất uy tín.',
          distractorWhy: [
            'Triển khai một mô hình có dấu hiệu rò rỉ rõ ràng sẽ thất bại ngay tuần đầu và làm mất niềm tin vào cả chương trình ML.',
            '',
            'Điều chuẩn không sửa được rò rỉ — đặc trưng chứa đáp án vẫn sẽ có trọng số cao dù bị phạt.',
            'Thêm dữ liệu từ cùng nguồn sẽ tái tạo lại đúng cái rò rỉ đó ở quy mô lớn hơn.',
          ],
        },
        {
          id: 't3l7-q2',
          kind: 'multi',
          tags: ['qua-khop', 'regularization'],
          q: 'Biện pháp nào giúp giảm quá khớp? (Chọn tất cả đáp án đúng)',
          options: [
            'Dừng sớm dựa trên lỗi tập kiểm định',
            'Tăng độ sâu tối đa của cây',
            'Thêm dữ liệu huấn luyện đa dạng hơn',
            'Tăng hệ số phạt L2',
          ],
          answers: [0, 2, 3],
          why: 'Dừng sớm, thêm dữ liệu và tăng điều chuẩn đều làm mô hình bớt bám vào chi tiết cụ thể của tập huấn luyện. Tăng độ sâu cây đi đúng hướng ngược lại: cây càng sâu càng chia nhỏ dữ liệu tới mức mỗi lá chỉ còn vài mẫu, và đó chính là ghi nhớ chứ không phải học.',
        },
        {
          id: 't3l7-q3',
          kind: 'order',
          tags: ['chan-doan', 'thuc-chien'],
          q: 'Mô hình hoạt động kém khi triển khai. Sắp xếp thứ tự chẩn đoán hợp lý nhất.',
          items: [
            'So sánh lỗi huấn luyện với lỗi kiểm định để xác định dưới khớp hay quá khớp',
            'Loại trừ rò rỉ nhãn bằng cách soi từng đặc trưng và cách chia tập',
            'Kiểm tra phân phối dữ liệu lúc chạy thật có khác lúc huấn luyện không',
            'Áp dụng biện pháp tương ứng với chẩn đoán và đo lại',
          ],
          why: 'Bắt đầu bằng chẩn đoán rẻ nhất và có sức phân biệt cao nhất: hai con số lỗi bạn đã có sẵn. Rò rỉ phải được loại trừ sớm vì nếu có, mọi kết luận sau đó đều vô nghĩa. So sánh phân phối đứng thứ ba vì nó tốn công hơn nhưng lại là nguyên nhân cực kỳ phổ biến trong bảo mật. Chỉ can thiệp sau khi đã biết chữa bệnh gì — thứ tự ngược lại là công thức để mất nhiều tuần.',
        },
        {
          id: 't3l7-q4',
          kind: 'truefalse',
          tags: ['regularization'],
          q: 'Với 5.000 đặc trưng n-gram và mong muốn biết đặc trưng nào thực sự quan trọng, điều chuẩn L1 phù hợp hơn L2.',
          answer: true,
          why: 'Đúng. L1 đẩy nhiều trọng số về **đúng 0**, biến mô hình thành một bộ chọn đặc trưng tự động — bạn đọc ra ngay 40 n-gram nào còn trọng số khác 0. L2 chỉ thu nhỏ mọi trọng số nên cả 5.000 đặc trưng vẫn còn đó với giá trị nhỏ, không giúp bạn rút gọn gì. Lưu ý thực tế: khi các đặc trưng tương quan mạnh với nhau, L1 chọn khá tuỳ tiện một cái trong nhóm — nên đừng diễn giải kết quả như một bảng xếp hạng tầm quan trọng tuyệt đối.',
        },
      ],
      terms: ['qua-khop', 'regularization', 'ro-ri-du-lieu', 'cross-validation'],
      further: [
        {
          title: 'Leakage in Data Mining: Formulation, Detection, and Avoidance — Kaufman, Rosset, Perlich (2011)',
          note: 'Bài báo hệ thống hoá rò rỉ dữ liệu thành các dạng có tên gọi. Đọc xong bạn sẽ nhận ra rò rỉ nhanh hơn nhiều.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't3-l8',
      trackId: 'ml-cot-loi',
      title: 'Kiểm định và tinh chỉnh siêu tham số',
      subtitle: 'Làm sao biết mô hình thật sự tốt, chứ không phải bạn đã may mắn',
      minutes: 18,
      practiceMinutes: 3,
      level: 'trung-cap',
      prereqs: ['t3-l7', 't2-l6'],
      why: {
        short:
          'Quy trình kiểm định là thứ duy nhất đứng giữa bạn và việc tự lừa dối bản thân — và trong bảo mật, quy trình chuẩn của giáo trình ML sẽ cho bạn con số sai.',
        scenario:
          'Bạn thử 200 tổ hợp siêu tham số, chọn cái tốt nhất trên tập kiểm định, rồi báo cáo chính con số đó với lãnh đạo. Ba tháng sau hiệu năng thật thấp hơn 8 điểm. Không ai gian lận cả — nhưng con số bạn báo cáo đã bị thổi phồng một cách có hệ thống, và có một cái tên cho hiện tượng đó.',
        roles: ['Security Data Scientist', 'ML Engineer', 'Detection Engineer'],
        costOfNotKnowing:
          'Bạn sẽ công bố những con số không tái lập được, và mất uy tín ngay lần đầu hệ thống chạy thật — thiệt hại lớn hơn nhiều so với việc báo cáo một con số khiêm tốn nhưng đúng.',
      },
      objectives: [
        'Giải thích vai trò khác nhau của tập huấn luyện, kiểm định và kiểm tra',
        'Chỉ ra vì sao k-fold ngẫu nhiên cho kết quả sai trên dữ liệu bảo mật và dùng biến thể nào thay thế',
        'Chọn được giữa tìm kiếm lưới, ngẫu nhiên và Bayes theo ngân sách tính toán',
        'Nhận ra và tránh hiện tượng quá khớp vào tập kiểm định',
      ],
      blocks: [
        { t: 'figure', id: 'fig-split-temporal', caption: 'Cùng một tập dữ liệu, hai cách chia, hai kết luận trái ngược. Trong bảo mật chỉ cách chia dưới là trung thực.' },
        { t: 'h', text: 'Ba tập, ba vai trò không được lẫn lộn', level: 2 },
        {
          t: 'table',
          head: ['Tập', 'Dùng để', 'Được xem bao nhiêu lần'],
          rows: [
            ['Huấn luyện', 'Mô hình học tham số', 'Vô số'],
            ['Kiểm định (validation)', 'Bạn chọn siêu tham số, đặc trưng, ngưỡng', 'Nhiều lần — và đó chính là vấn đề'],
            ['Kiểm tra (test)', 'Ước lượng hiệu năng thật, MỘT lần duy nhất', 'Đúng một lần, ở cuối cùng'],
          ],
          caption: 'Mỗi lần bạn nhìn vào tập kiểm tra rồi thay đổi điều gì đó, nó thầm lặng biến thành tập kiểm định.',
        },
        {
          t: 'predict',
          question:
            'Bạn thử 200 tổ hợp siêu tham số và chọn cái cho PR-AUC cao nhất trên tập kiểm định, được 0,84. Vì sao con số 0,84 này gần như chắc chắn cao hơn hiệu năng thật, ngay cả khi bạn không làm gì sai?',
          reveal:
            'Vì tập kiểm định của bạn là một mẫu hữu hạn, nên điểm số trên nó = hiệu năng thật + một chút nhiễu ngẫu nhiên. Khi bạn thử 200 tổ hợp và **chọn cái cao nhất**, bạn không chỉ chọn mô hình tốt nhất — bạn còn chọn tổ hợp **may mắn nhất** trên đúng mẫu nhiễu đó. Càng thử nhiều tổ hợp, phần "may mắn" trong con số chiến thắng càng lớn. Đây gọi là **quá khớp vào tập kiểm định**, và nó là lý do bạn bắt buộc phải giữ một tập kiểm tra riêng chưa từng được dùng để ra bất kỳ quyết định nào.',
        },
        { t: 'h', text: 'Vì sao k-fold ngẫu nhiên nói dối trong bảo mật', level: 2 },
        {
          t: 'p',
          md: 'Kiểm định chéo k-fold tiêu chuẩn xáo trộn dữ liệu rồi chia đều thành k phần. Trong hầu hết ngành đó là cách làm đúng. Trong bảo mật nó vi phạm hai điều cùng lúc.',
        },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Vi phạm thời gian.** Mẫu tháng 12 lọt vào tập huấn luyện trong khi mẫu tháng 3 nằm ở tập kiểm tra. Mô hình được "nhìn thấy tương lai" — thứ nó sẽ không bao giờ có khi chạy thật.',
            '**Vi phạm nhóm.** Một họ mã độc có 400 biến thể gần giống hệt nhau. Chia ngẫu nhiên khiến biến thể 1–200 vào tập huấn luyện, 201–400 vào tập kiểm tra. Mô hình chỉ cần nhận ra họ đó là ghi điểm — chứ chưa hề chứng minh nó bắt được họ **mới**.',
          ],
        },
        {
          t: 'compare',
          title: 'Chọn kiểu chia theo câu hỏi bạn đang trả lời',
          left: {
            title: 'TimeSeriesSplit',
            icon: 'hourglass',
            items: [
              'Huấn luyện trên quá khứ, kiểm tra trên tương lai',
              'Trả lời: "mô hình còn dùng được sau bao lâu?"',
              'Bắt buộc trước khi triển khai',
              'Cho con số thấp hơn nhưng trung thực',
            ],
          },
          right: {
            title: 'GroupKFold theo họ / theo người dùng',
            icon: 'network',
            items: [
              'Mọi biến thể của một họ nằm trọn trong một phần',
              'Trả lời: "mô hình bắt được cái CHƯA từng thấy không?"',
              'Bắt buộc với dữ liệu mã độc và dữ liệu theo người dùng',
              'Thường làm điểm số tụt mạnh — đó là sự thật, không phải lỗi',
            ],
          },
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Kiểm định theo thời gian: mỗi lần huấn luyện chỉ thấy quá khứ so với phần kiểm tra của nó.',
          code: `from sklearn.model_selection import TimeSeriesSplit, cross_val_score
import numpy as np

# Du lieu PHAI duoc sap xep theo thoi gian truoc
X, y = X[np.argsort(timestamps)], y[np.argsort(timestamps)]

tscv = TimeSeriesSplit(n_splits=5, gap=7)   # gap: bo 7 ngay giua train va test
diem = cross_val_score(mo_hinh, X, y, cv=tscv, scoring="average_precision")

print("PR-AUC tung lan:", np.round(diem, 3))
print("Trung binh:", diem.mean().round(3), "| do lech:", diem.std().round(3))
# Diem giam dan qua cac lan chia la dau hieu troi khai niem, khong phai loi.`,
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Đọc xu hướng, không chỉ đọc trung bình',
          md: 'Với `TimeSeriesSplit`, đừng chỉ nhìn điểm trung bình. Hãy nhìn **dãy điểm theo thứ tự**. Nếu nó giảm dần đều qua các lần chia, bạn vừa đo được tốc độ trôi khái niệm của chính bài toán mình — thông tin quý hơn nhiều so với một con số trung bình, và nó cho bạn biết luôn cần huấn luyện lại bao lâu một lần. Chúng ta sẽ quay lại đúng phép đo này ở chặng 10.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't3l8-cp1',
              kind: 'mcq',
              tags: ['kiem-dinh', 'ro-ri-du-lieu'],
              q: 'Bạn có 50.000 mẫu mã độc thuộc 300 họ. Cách chia tập nào cho ước lượng trung thực nhất về khả năng bắt mã độc MỚI?',
              options: [
                'k-fold ngẫu nhiên với k = 5',
                'Chia ngẫu nhiên 80/20 nhưng lặp lại 10 lần rồi lấy trung bình',
                'GroupKFold theo họ mã độc, để mọi biến thể của một họ nằm trọn trong một phần',
                'Chia theo kích thước tệp để hai tập có phân phối giống nhau',
              ],
              answer: 2,
              why: 'Câu hỏi bạn cần trả lời là "mô hình có bắt được họ **chưa từng thấy** không". Chỉ GroupKFold theo họ mới mô phỏng đúng tình huống đó. Mọi cách chia ngẫu nhiên đều để biến thể cùng họ nằm ở cả hai bên, biến bài toán thành "nhận ra họ đã biết" — dễ hơn nhiều và không phản ánh thực tế. Lặp lại 10 lần chỉ làm con số sai trở nên ổn định hơn, không làm nó đúng hơn.',
            },
          ],
        },
        { t: 'h', text: 'Tinh chỉnh siêu tham số: chọn chiến lược theo ngân sách', level: 2 },
        {
          t: 'table',
          head: ['Chiến lược', 'Cách hoạt động', 'Khi nào dùng'],
          rows: [
            ['Tìm kiếm lưới (grid)', 'Thử mọi tổ hợp trong lưới định sẵn', 'Chỉ khi có ≤ 3 tham số và mỗi tham số ít giá trị. Chi phí bùng nổ theo cấp số nhân.'],
            ['Tìm kiếm ngẫu nhiên (random)', 'Lấy mẫu ngẫu nhiên trong khoảng cho trước', 'Mặc định hợp lý. Với cùng ngân sách, thường tìm được tổ hợp tốt hơn lưới vì nó khám phá nhiều giá trị hơn cho từng tham số quan trọng.'],
            ['Tối ưu Bayes (Optuna, Hyperopt)', 'Dùng kết quả đã thử để đoán vùng đáng thử tiếp', 'Khi mỗi lần huấn luyện tốn hàng chục phút trở lên và bạn có trên ~50 lượt thử.'],
            ['Chỉnh tay có hiểu biết', 'Điều chỉnh vài tham số quan trọng nhất theo đường cong học', 'Luôn nên làm TRƯỚC khi tự động hoá. Nó cho bạn trực giác mà tìm kiếm tự động không cho.'],
          ],
        },
        { t: 'h', text: 'Kiểm định chéo lồng nhau (nested CV)', level: 2 },
        {
          t: 'p',
          md: 'Vấn đề còn sót lại: nếu bạn dùng **cùng một** vòng kiểm định chéo để vừa chọn siêu tham số vừa báo cáo kết quả, con số báo cáo đã bị nhiễm. Bạn đã chọn cấu hình thắng dựa trên chính những phần dữ liệu mà bạn đang dùng để chấm điểm nó.',
        },
        {
          t: 'p',
          md: '**Nested CV** tách hai việc đó bằng hai vòng lặp. Vòng **ngoài** chia dữ liệu để đo hiệu năng. Bên trong mỗi khối huấn luyện của vòng ngoài, một vòng **trong** chạy riêng để chọn siêu tham số. Kết quả báo cáo là trung bình của vòng ngoài — và không khối nào của vòng ngoài từng tham gia việc chọn tham số cho chính nó. Cái giá: bạn phải huấn luyện `k_ngoài × k_trong × số_cấu_hình` lần. Với 5 × 5 × 50 thì đó là 1.250 lần huấn luyện.',
        },
        {
          t: 'compare',
          title: 'Nested CV có xứng với cái giá của nó không?',
          left: {
            title: 'Đáng dùng khi',
            icon: 'check',
            items: [
              'Dữ liệu nhỏ (dưới vài chục nghìn mẫu) nên một tập giữ riêng quá nhiễu',
              'Số ca dương ít, khiến PR-AUC dao động mạnh giữa các lần chia',
              'Bạn công bố kết quả hoặc so sánh nhiều phương pháp một cách nghiêm túc',
              'Mỗi lần huấn luyện chỉ vài giây nên tổng chi phí vẫn chấp nhận được',
            ],
          },
          right: {
            title: 'Không đáng khi',
            icon: 'x',
            items: [
              'Dữ liệu hàng triệu hàng — một tập giữ riêng theo thời gian đã đủ ổn định',
              'Dữ liệu có tính thời gian mạnh: nested CV ngẫu nhiên còn che mất chính vấn đề trôi',
              'Mỗi lần huấn luyện mất hàng chục phút — 1.250 lần là không tưởng',
              'Bạn cần câu trả lời trong tuần này, không phải một bài báo',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Thứ bảo mật cần hơn nested CV',
          md: 'Với dữ liệu bảo mật quy mô lớn, **đánh giá tiến nhiều khối** cho bạn nhiều thông tin hơn: huấn luyện tháng 1–6 rồi chấm tháng 7, huấn luyện tháng 1–7 rồi chấm tháng 8, và cứ thế. Bạn nhận được không phải một con số mà một **dãy** con số theo thời gian, và độ dốc của dãy đó nói cho bạn biết mô hình xuống cấp nhanh thế nào — dữ kiện quyết định lịch huấn luyện lại. Nested CV không bao giờ cho bạn điều đó, vì nó xoá mất trục thời gian.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bẫy: chuẩn hoá ngoài vòng kiểm định chéo',
          md: 'Nếu bạn gọi `scaler.fit()` hay `SelectKBest.fit()` trên **toàn bộ** dữ liệu rồi mới chạy kiểm định chéo, thống kê của các phần kiểm tra đã rò rỉ vào bước tiền xử lý. Điểm số sẽ đẹp lên một cách giả tạo. Cách chữa đơn giản và tuyệt đối: gói **mọi** bước biến đổi vào một `Pipeline` rồi truyền pipeline đó cho `cross_val_score`. Không có ngoại lệ nào cho quy tắc này.',
        },
        {
          t: 'checklist',
          title: 'Danh sách kiểm tra trước khi báo cáo bất kỳ con số nào',
          items: [
            'Tập kiểm tra đã được tách theo thời gian và chưa từng dùng để ra quyết định nào chưa?',
            'Nếu dữ liệu có nhóm tự nhiên (họ mã độc, người dùng, máy chủ), đã chia theo nhóm chưa?',
            'Mọi bước tiền xử lý đã nằm trong Pipeline chưa?',
            'Đã kiểm tra mẫu trùng lặp giữa các tập chưa?',
            'Con số báo cáo có kèm khoảng dao động qua các lần chia, hay chỉ có một giá trị đơn lẻ?',
            'Đã quy đổi chỉ số ra con số vận hành (cảnh báo/ngày, giờ analyst) chưa?',
          ],
        },
      ],
      keyTakeaways: [
        'Ba tập có ba vai trò: huấn luyện để học, kiểm định để chọn, kiểm tra để báo cáo — và tập kiểm tra chỉ được xem đúng một lần.',
        'Thử càng nhiều tổ hợp siêu tham số, điểm số trên tập kiểm định càng bị thổi phồng: đó là quá khớp vào tập kiểm định.',
        'k-fold ngẫu nhiên vi phạm cả trật tự thời gian lẫn cấu trúc nhóm — hai điều luôn tồn tại trong dữ liệu bảo mật.',
        'Dùng TimeSeriesSplit để trả lời "dùng được bao lâu", GroupKFold để trả lời "bắt được cái mới không".',
        'Tìm kiếm ngẫu nhiên thường thắng tìm kiếm lưới ở cùng ngân sách; tối ưu Bayes chỉ đáng khi mỗi lượt huấn luyện rất đắt.',
        'Mọi bước tiền xử lý phải nằm trong Pipeline, nếu không kiểm định chéo sẽ bị rò rỉ.',
        'Nested CV tách việc chọn siêu tham số khỏi việc đo hiệu năng, nhưng chỉ đáng dùng khi dữ liệu nhỏ và huấn luyện rẻ.',
      ],
      cards: [
        {
          id: 't3l8-c1',
          front: 'Vai trò khác nhau của tập kiểm định và tập kiểm tra là gì?',
          back: 'Kiểm định dùng để CHỌN (siêu tham số, đặc trưng, ngưỡng) và được xem nhiều lần. Kiểm tra dùng để BÁO CÁO hiệu năng thật và chỉ được xem đúng một lần ở cuối.',
          tags: ['kiem-dinh'],
        },
        {
          id: 't3l8-c2',
          front: 'Vì sao điểm số của tổ hợp siêu tham số tốt nhất luôn bị thổi phồng?',
          back: 'Vì điểm trên tập kiểm định = hiệu năng thật + nhiễu. Chọn giá trị cao nhất trong nhiều lượt thử là chọn cả phần may mắn. Càng thử nhiều, thổi phồng càng lớn.',
          tags: ['kiem-dinh', 'qua-khop'],
        },
        {
          id: 't3l8-c3',
          front: 'Hai lý do khiến k-fold ngẫu nhiên sai trong dữ liệu bảo mật?',
          back: '1) Vi phạm thời gian: mô hình nhìn thấy tương lai. 2) Vi phạm nhóm: biến thể cùng một họ mã độc nằm ở cả tập huấn luyện lẫn tập kiểm tra.',
          tags: ['kiem-dinh', 'ro-ri-du-lieu'],
        },
        {
          id: 't3l8-c4',
          front: 'Vì sao mọi bước tiền xử lý phải nằm trong Pipeline?',
          back: 'Vì nếu fit scaler hay bộ chọn đặc trưng trên toàn bộ dữ liệu, thống kê của tập kiểm tra rò rỉ vào bước tiền xử lý và điểm số đẹp lên một cách giả tạo.',
          tags: ['ro-ri-du-lieu', 'thuc-chien'],
        },
        {
          id: 't3l8-c5',
          front: 'Nested CV hoạt động thế nào và nó giải quyết vấn đề gì?',
          back: 'Vòng ngoài đo hiệu năng, vòng trong chọn siêu tham số bên trong từng khối huấn luyện của vòng ngoài. Nhờ đó con số báo cáo không bị nhiễm bởi chính quá trình chọn tham số.',
          tags: ['kiem-dinh', 'sieu-tham-so'],
        },
      ],
      quiz: [
        {
          id: 't3l8-q1',
          kind: 'mcq',
          tags: ['kiem-dinh'],
          q: 'Bạn thử 300 tổ hợp siêu tham số, chọn cái tốt nhất trên tập kiểm định (PR-AUC 0,86) và báo cáo con số đó. Vấn đề là gì?',
          options: [
            'Không có vấn đề gì nếu tập kiểm định đủ lớn',
            '0,86 là ước lượng bị thổi phồng vì nó đã được chọn để tối đa hoá trên chính tập đó; cần đo lại trên tập kiểm tra chưa từng dùng',
            'Nên thử nhiều tổ hợp hơn nữa để chắc chắn',
            'Nên báo cáo trung bình của cả 300 tổ hợp thay vì tổ hợp tốt nhất',
          ],
          answer: 1,
          why: 'Chọn cực đại trên một mẫu hữu hạn luôn kèm theo phần may mắn, và phần đó lớn dần theo số lượt thử. Con số trung thực duy nhất là điểm trên một tập chưa hề tham gia vào bất kỳ quyết định nào. Báo cáo trung bình của 300 tổ hợp cũng sai, chỉ theo hướng ngược lại: nó bao gồm cả những cấu hình tệ mà bạn sẽ không bao giờ triển khai.',
          distractorWhy: [
            'Tập kiểm định lớn làm giảm nhiễu nhưng không xoá bỏ hiệu ứng chọn cực đại.',
            '',
            'Thử thêm chỉ làm vấn đề nặng hơn: càng nhiều lượt, phần may mắn trong tổ hợp thắng cuộc càng lớn.',
            'Trung bình toàn bộ không phải là ước lượng cho mô hình bạn định triển khai.',
          ],
        },
        {
          id: 't3l8-q2',
          kind: 'mcq',
          tags: ['kiem-dinh', 'troi-khai-niem'],
          q: 'Chạy TimeSeriesSplit 5 phần, bạn thu được PR-AUC lần lượt: 0,81 · 0,78 · 0,74 · 0,69 · 0,63. Điều này nói lên gì?',
          options: [
            'Mô hình không ổn định, cần tăng số lần chia',
            'Có trôi khái niệm: hiệu năng suy giảm theo thời gian, cần lên kế hoạch huấn luyện lại định kỳ',
            'Tập dữ liệu quá nhỏ nên kết quả ngẫu nhiên',
            'Có rò rỉ nhãn ở các phần đầu',
          ],
          answer: 1,
          why: 'Dãy giảm **đơn điệu** theo thứ tự thời gian là chữ ký của trôi khái niệm, không phải nhiễu ngẫu nhiên — nhiễu sẽ dao động lên xuống chứ không giảm đều. Đây là thông tin vận hành cực kỳ giá trị: nó cho bạn ước lượng trực tiếp về tốc độ lỗi thời của mô hình, và từ đó suy ra chu kỳ huấn luyện lại. Báo cáo dãy số này thuyết phục hơn nhiều so với một con số trung bình 0,73.',
        },
        {
          id: 't3l8-q3',
          kind: 'truefalse',
          tags: ['kiem-dinh'],
          q: 'Với cùng một ngân sách tính toán, tìm kiếm ngẫu nhiên thường tìm được cấu hình tốt hơn tìm kiếm lưới.',
          answer: true,
          why: 'Đúng, và lý do khá phản trực giác: trong hầu hết bài toán chỉ vài siêu tham số thực sự quan trọng, phần còn lại gần như không ảnh hưởng. Tìm kiếm lưới lãng phí ngân sách để thử đi thử lại cùng vài giá trị của tham số quan trọng trong khi biến đổi các tham số vô nghĩa. Tìm kiếm ngẫu nhiên thử được nhiều giá trị khác nhau hơn cho mọi tham số, nên nó lấy mẫu tốt hơn ở đúng chiều có ảnh hưởng.',
        },
        {
          id: 't3l8-q4',
          kind: 'multi',
          tags: ['ro-ri-du-lieu', 'kiem-dinh'],
          q: 'Việc nào gây rò rỉ dữ liệu vào quy trình kiểm định? (Chọn tất cả đáp án đúng)',
          options: [
            'Gọi StandardScaler.fit() trên toàn bộ dữ liệu trước khi chạy cross_val_score',
            'Chọn 100 đặc trưng tốt nhất bằng SelectKBest trên toàn bộ dữ liệu rồi mới chia tập',
            'Gói toàn bộ bước tiền xử lý và mô hình vào một Pipeline rồi truyền cho cross_val_score',
            'Loại bỏ mẫu trùng lặp sau khi đã chia tập huấn luyện và kiểm tra',
          ],
          answers: [0, 1, 3],
          why: 'Hai phương án đầu để thống kê của phần kiểm tra ảnh hưởng tới bước tiền xử lý — dạng rò rỉ phổ biến nhất và khó thấy nhất. Phương án cuối tinh vi hơn: nếu bạn khử trùng lặp **sau** khi chia, các bản sao của cùng một mẫu vẫn nằm ở cả hai tập, và mô hình chỉ cần ghi nhớ là ghi điểm. Khử trùng lặp phải làm trước khi chia. Chỉ Pipeline là cách làm đúng.',
        },
        {
          id: 't3l8-q5',
          kind: 'mcq',
          tags: ['kiem-dinh', 'sieu-tham-so'],
          q: 'Kiểm định chéo lồng nhau (nested CV) giải quyết vấn đề gì?',
          options: [
            'Làm mô hình chính xác hơn nhờ được huấn luyện nhiều lần hơn',
            'Cho ước lượng hiệu năng không bị nhiễm bởi chính quá trình chọn siêu tham số',
            'Xử lý trật tự thời gian trong dữ liệu chuỗi',
            'Giảm tổng thời gian tinh chỉnh siêu tham số',
          ],
          answer: 1,
          why: 'Nested CV tách hẳn hai việc: vòng trong chọn tham số, vòng ngoài đo hiệu năng, và không khối nào của vòng ngoài từng tham gia chọn tham số cho chính nó. Nó **không** làm mô hình tốt hơn — nó chỉ đo trung thực hơn. Nó cũng **không** xử lý tính thời gian: bạn vẫn phải dùng bộ chia theo thời gian ở cả hai vòng, nếu không thì lồng hai vòng ngẫu nhiên chỉ nhân đôi cùng một sai lầm. Và chi phí thì tăng lên `k_ngoài` lần chứ không giảm.',
          distractorWhy: [
            'Nested CV là công cụ đo lường, không phải công cụ cải thiện mô hình.',
            '',
            'Trật tự thời gian phải xử lý bằng bộ chia phù hợp; lồng hai vòng CV ngẫu nhiên không sửa được điều đó.',
            'Ngược lại — nó đắt hơn hẳn vì vòng trong chạy bên trong mỗi khối của vòng ngoài.',
          ],
        },
      ],
      terms: ['cross-validation', 'sieu-tham-so', 'ro-ri-du-lieu', 'chia-theo-thoi-gian', 'troi-khai-niem'],
      further: [
        {
          title: 'Random Search for Hyper-Parameter Optimization — Bergstra & Bengio (2012)',
          note: 'Bài báo chứng minh vì sao tìm kiếm ngẫu nhiên thắng tìm kiếm lưới. Lập luận đơn giản đến bất ngờ và thay đổi thực hành của cả ngành.',
        },
        {
          title: 'Tài liệu scikit-learn — Cross-validation for time series data',
          note: 'Phần ngắn nhưng đủ để cài đặt đúng TimeSeriesSplit kèm khoảng trống (gap) giữa train và test.',
        },
      ],
    }
  ],
};
