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
  icon: '🧠',
  hue: 'emerald',
  blurb:
    'Tám bài về nhóm thuật toán chiếm gần như toàn bộ công việc ML bảo mật thực tế: hồi quy logistic, Naive Bayes, cây quyết định, rừng ngẫu nhiên và gradient boosting, cùng k-NN và SVM. Bạn sẽ hiểu từng mô hình đủ sâu để chọn đúng, chỉnh đúng và biết nó hỏng ở đâu — chứ không phải chỉ gọi được hàm fit.',
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
      minutes: 14,
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
          md: 'Tác tử (agent) quan sát trạng thái, chọn hành động, nhận phần thưởng, và học chính sách tối đa hoá phần thưởng dài hạn. Trong bảo mật, chỗ dùng thật hiện nay khá hẹp: mô phỏng đường tấn công trong môi trường ảo (CyberBattleSim của Microsoft là một ví dụ mã nguồn mở), điều khiển bộ sinh đầu vào trong fuzzing, và tinh chỉnh mô hình ngôn ngữ bằng phản hồi (RLHF).',
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
            title: '🎯 Phân loại có giám sát',
            items: [
              'Cần ít nhất vài trăm ca dương có nhãn tin được',
              'Đo được bằng precision/recall trên tập kiểm tra',
              'Bắt tốt những gì giống dữ liệu huấn luyện',
              'Mù trước kỹ thuật tấn công chưa từng xuất hiện trong nhãn',
              'Dễ giải trình: có nhãn thì có bằng chứng',
            ],
          },
          right: {
            title: '🌫️ Phát hiện bất thường',
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
            ['Tối ưu chuỗi hành động của tác tử trong môi trường mô phỏng', 'Tăng cường'],
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
      minutes: 18,
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
          md: 'Với hồi quy logistic, mặt lỗi là **lồi (convex)** — nó chỉ có đúng một đáy. Nghĩa là hạ gradient chạy từ điểm khởi tạo nào cũng về cùng một nghiệm tối ưu, không có cực tiểu địa phương để mắc kẹt, và chạy lại hai lần cho đúng cùng kết quả. Mạng nơ-ron thì ngược lại: mặt lỗi lồi lõm, khởi tạo khác nhau cho mô hình khác nhau. Tính lặp lại được này rất có giá trị khi bạn phải giải trình một quyết định chặn từ sáu tháng trước.',
        },
        { t: 'figure', id: 'fig-gradient-descent', caption: 'Hạ gradient trên mặt lỗi. Với hồi quy logistic mặt này là một cái bát — đi hướng nào cũng về đáy.' },
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
            '**Rất mạnh trên không gian thưa nhiều chiều.** Biểu diễn URL hoặc dòng log bằng TF-IDF trên n-gram ký tự cho ra hàng chục nghìn cột thưa. Ở đó mô hình tuyến tính thường ngang ngửa hoặc thắng cây tăng cường, mà nhanh hơn nhiều bậc.',
            '**Suy luận gần như miễn phí.** Một phép nhân vector: vài micro-giây, vài trăm kilobyte bộ nhớ. Đủ để chạy inline trên proxy hoặc nhúng vào agent trên endpoint.',
            '**Xác suất tương đối trung thực.** Vì hàm mất mát là log loss, đầu ra thường đã gần hiệu chuẩn — quan trọng khi bạn cần xếp hạng theo rủi ro hoặc nhân với chi phí (chặng 4).',
            '**Giải trình được ở mức từng quyết định.** Bạn liệt kê được đóng góp của từng đặc trưng cho đúng URL này, và tổng của chúng bằng đúng điểm số. Với cây tăng cường bạn phải viện đến SHAP; với mô hình tuyến tính thì đó là phép cộng.',
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
          why: 'Không gian thưa rất nhiều chiều là sân nhà của mô hình tuyến tính: huấn luyện trong vài phút trên ma trận thưa, không cần chuẩn hoá đặc biệt, và cho kết quả thường ngang ngửa các mô hình nặng hơn. Cây tăng cường phải chia nhánh trên từng cột nên rất chậm và kém hiệu quả ở đây. k-NN chết vì phải quét toàn bộ 900.000 mẫu cho mỗi truy vấn. Mạng nơ-ron có thể thắng, nhưng chỉ khi bạn đã có đường cơ sở để chứng minh phần thắng đó xứng đáng.',
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
      minutes: 16,
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
            title: '✅ Vẫn là lựa chọn tốt',
            items: [
              'Cần một bộ phân loại văn bản trong vòng vài phút, không GPU',
              'Dữ liệu huấn luyện rất ít (vài trăm mẫu) — NB chịu ít dữ liệu tốt hơn hầu hết mô hình',
              'Cần cập nhật liên tục theo từng email người dùng đánh dấu',
              'Làm một trong nhiều tín hiệu đầu vào cho hệ thống chấm điểm lớn hơn, như trong SpamAssassin',
              'Cần đường cơ sở để biết bài toán văn bản này dễ hay khó',
            ],
          },
          right: {
            title: '❌ Đã bị vượt qua',
            items: [
              'Cần xác suất hiệu chuẩn để nhân với chi phí',
              'Ngữ nghĩa quan trọng hơn từ khoá (mô hình transformer thắng rõ)',
              'Đặc trưng số liên tục và tương tác phức tạp (cây tăng cường thắng)',
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
      minutes: 16,
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
        'Nhận ra cái bẫy đặc trưng có lực lượng cao khi đọc một cây đã huấn luyện',
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
          title: 'Cái bẫy lớn nhất: đặc trưng có lực lượng cao',
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
        'Đặc trưng có lực lượng cao (IP, hostname, session id) làm cây ghi nhớ định danh thay vì học hành vi.',
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
          back: 'Đặc trưng lực lượng cao luôn tìm được phép chia giảm vẩn đục nhiều nhất, nên cây sẽ ghi nhớ định danh cụ thể thay vì học hành vi tổng quát.',
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
          note: 'Danh sách ngắn các lời khuyên thực tế, trong đó có cảnh báo về đặc trưng lực lượng cao.',
        },
      ],
    },
  ],
};
