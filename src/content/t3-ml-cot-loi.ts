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
  ],
};
