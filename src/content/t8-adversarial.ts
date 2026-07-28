import type { Track } from './types';

/**
 * CHẶNG 8 — Học máy đối kháng.
 *
 * Nguyên tắc biên soạn của chặng này:
 *  (a) Nội dung PHÒNG THỦ và NGHIÊN CỨU. Cơ chế tấn công được giải thích ở mức
 *      khái niệm đủ để thiết kế phòng thủ và viết kịch bản kiểm thử — không có
 *      mã khai thác sẵn sàng dùng.
 *  (b) Mọi kỹ thuật đều đi kèm ràng buộc thực tế của bảo mật: tệp sửa xong phải
 *      còn chạy được, gói tin sửa xong phải còn hợp lệ. Đây là điểm khác biệt
 *      lớn nhất so với tài liệu đối kháng viết cho ảnh.
 *  (c) Nói thẳng về giới hạn: chưa có phòng thủ nào tuyệt đối, và phần lớn
 *      phòng thủ được công bố đều bị phá trong vòng vài tháng.
 */
export const track8: Track = {
  id: 'adversarial',
  order: 8,
  title: 'Học máy đối kháng',
  tagline: 'Mô hình của bạn cũng là một bề mặt tấn công',
  icon: 'swords',
  hue: 't8',
  blurb:
    'Khi bạn đưa một mô hình vào đường phát hiện, bạn vừa thêm một thành phần mới vào bề mặt tấn công của tổ chức — và nó có những kiểu hỏng mà tường lửa hay EDR truyền thống không có. Sáu bài này dạy bạn bản đồ tấn công đầy đủ vào hệ thống học máy, từ né tránh, đầu độc, trộm mô hình cho tới rò rỉ dữ liệu huấn luyện. Toàn bộ viết theo hướng phòng thủ: hiểu cơ chế để thiết kế biện pháp giảm thiểu và để red team hệ thống của chính bạn.',
  outcomes: [
    'Lập được threat model cho một hệ thống ML bằng MITRE ATLAS, chỉ rõ giai đoạn, mức truy cập và mục tiêu của kẻ tấn công',
    'Giải thích vì sao mẫu đối kháng trên tệp PE khó hơn trên ảnh, và ràng buộc bảo toàn chức năng đổi luật chơi thế nào',
    'Chỉ ra điểm đầu độc trong một quy trình gắn nhãn thật, kể cả đường đầu độc qua vòng phản hồi của analyst',
    'Đánh giá được rủi ro trộm mô hình và rò rỉ dữ liệu huấn luyện của một API chấm điểm, đề xuất biện pháp giảm thiểu cụ thể',
    'Chọn tập phòng thủ hợp lý theo ngân sách, và nói được vì sao adversarial training không phải viên đạn bạc',
    'Chạy một đợt red team cho hệ thống ML: từ phạm vi, kịch bản, chỉ số đo, tới báo cáo phát hiện đúng chuẩn',
  ],
  lessons: [
    /* ====================================================================== */
    {
      id: 't8-l1',
      trackId: 'adversarial',
      title: 'Bản đồ tấn công vào hệ thống học máy',
      subtitle: 'Trước khi học từng đòn, hãy có tấm bản đồ: đánh vào lúc nào, với quyền gì, để đạt cái gì.',
      minutes: 23,
      practiceMinutes: 3,
      level: 'trung-cap',
      prereqs: ['t3-l1'],
      why: {
        short:
          'Không có bản đồ thì bạn sẽ chỉ phòng thủ đúng một loại tấn công mình vừa đọc được, trong khi kẻ tấn công chọn đường rẻ nhất — thường là đường bạn chưa nghĩ tới.',
        scenario:
          'Đội bạn sắp đưa một mô hình chấm điểm tệp tải về vào production. Trong buổi rà soát thiết kế, kiến trúc sư bảo mật hỏi: "Mô hình này bị tấn công kiểu gì, và ta phát hiện ra bằng cách nào?" Nếu bạn chỉ trả lời được "có thể bị mẫu đối kháng" thì buổi họp sẽ kết thúc mà không ai biết cần thêm biện pháp gì.',
        roles: ['AI Security Engineer', 'Security Architect', 'Red Teamer', 'Detection Engineer'],
        costOfNotKnowing:
          'Bạn đổ toàn bộ ngân sách vào chống né tránh lúc suy luận, trong khi đường vào thật sự là quy trình gắn nhãn: kẻ tấn công không cần đánh lừa mô hình, họ chỉ cần dạy nó rằng hành vi của mình là bình thường. Sáu tháng sau mô hình vẫn báo cáo AUC 0,98 và vẫn cho kẻ tấn công đi qua.',
      },
      objectives: [
        'Phân loại một tấn công bất kỳ theo hai trục: giai đoạn vòng đời (huấn luyện / suy luận) và mức truy cập (whitebox / greybox / blackbox)',
        'Nêu đúng bốn mục tiêu chính của kẻ tấn công lên hệ thống ML và ví dụ thật cho từng mục tiêu',
        'Dùng MITRE ATLAS để tra một chiến thuật và ánh xạ nó vào hệ thống của mình',
        'Viết được threat model một trang cho một mô hình phát hiện đang chạy thật',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bạn có một mô hình chấm điểm tệp PE, dùng nội bộ, API không lộ ra Internet, chỉ trả về nhãn "độc/lành" chứ không trả về điểm số. Kẻ tấn công bên ngoài không có tài khoản. Theo bạn, họ còn cách nào để dò xem mô hình của bạn bắt cái gì không?',
          reveal:
            'Còn, và không cần chạm vào API của bạn lần nào. Ba đường thường gặp: (1) **Oracle công khai** — nếu mô hình của bạn là sản phẩm thương mại, kẻ tấn công mua một bản, hoặc nộp mẫu lên VirusTotal và đọc kết quả của chính engine đó, và họ có một phòng thí nghiệm không giới hạn. (2) **Mô hình thay thế (surrogate)** — họ tự huấn luyện một mô hình trên bộ dữ liệu công khai như EMBER, sinh mẫu né tránh trên đó, rồi dựa vào **tính chuyển giao** (transferability) để mẫu đó cũng qua được mô hình của bạn. (3) **Tín hiệu gián tiếp** — email bị chặn hay không, tệp bị cách ly sau bao lâu, cảnh báo có tới analyst không. Mỗi bit thông tin rò ra là một truy vấn miễn phí. Bài học: **bề mặt tấn công của mô hình rộng hơn bề mặt mạng của nó rất nhiều.**',
        },
        {
          t: 'p',
          md: 'Trong bảo mật truyền thống, bạn quen với câu hỏi "phần mềm này có lỗ hổng gì". Với học máy, câu hỏi đó vẫn đúng nhưng thiếu hẳn một nửa: **mô hình có thể hoàn toàn không có lỗi phần mềm nào mà vẫn bị đánh bại**, vì cái bị khai thác là *hành vi thống kê* của nó chứ không phải một lỗi tràn bộ đệm.',
        },
        {
          t: 'p',
          md: 'Nên trước khi đi vào từng kỹ thuật, ta cần một cách sắp xếp. Hai trục là đủ để đặt gần như mọi tấn công vào đúng ô: **đánh lúc nào** và **có quyền gì**.',
        },
        { t: 'h', text: 'Trục 1 — Đánh lúc nào: huấn luyện hay suy luận', level: 2 },
        {
          t: 'compare',
          title: 'Hai giai đoạn, hai thế giới khác nhau',
          left: {
            title: 'Tấn công lúc HUẤN LUYỆN',
            icon: 'wrench',
            items: [
              'Kẻ tấn công tác động vào dữ liệu, nhãn, hoặc chính artefact mô hình',
              'Gồm: đầu độc dữ liệu, cửa hậu (backdoor), đầu độc vòng phản hồi, tấn công chuỗi cung ứng mô hình',
              'Hậu quả nằm SẴN trong trọng số — chạy bao nhiêu lần cũng hỏng như nhau',
              'Rất khó phát hiện sau khi mô hình đã lên production: bạn phải nghi ngờ chính dữ liệu của mình',
              'Đòi hỏi kẻ tấn công tiếp cận được nguồn dữ liệu hoặc quy trình gắn nhãn — nghe khó, nhưng thường dễ hơn bạn tưởng',
            ],
          },
          right: {
            title: 'Tấn công lúc SUY LUẬN',
            icon: 'target',
            items: [
              'Mô hình không bị sửa gì; kẻ tấn công chỉ chỉnh ĐẦU VÀO hoặc đọc ĐẦU RA',
              'Gồm: né tránh (evasion), trộm mô hình, suy luận thành viên, đảo ngược mô hình',
              'Hậu quả xảy ra từng lần, theo từng mẫu',
              'Dễ thử đi thử lại: mỗi lần thất bại chỉ tốn một truy vấn',
              'Đây là loại kẻ tấn công bên ngoài chạm tới được mà không cần chỗ đứng nào bên trong',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Trực giác cốt lõi',
          md: 'Tấn công lúc **huấn luyện** thay đổi *bản đồ* mà mô hình vẽ ra. Tấn công lúc **suy luận** giữ nguyên bản đồ và chỉ đi vòng qua chỗ trống trên đó. Vì thế phòng thủ cũng chia đôi: chống đầu độc là bài toán **quản trị dữ liệu và nguồn gốc**; chống né tránh là bài toán **thiết kế đặc trưng và phòng thủ theo chiều sâu**. Đội nào chỉ làm một nửa thì luôn hở đúng nửa còn lại.',
        },
        { t: 'h', text: 'Trục 2 — Có quyền gì: whitebox, greybox, blackbox', level: 2 },
        {
          t: 'table',
          caption: 'Ba mức truy cập và điều kẻ tấn công làm được ở mỗi mức',
          head: ['Mức', 'Kẻ tấn công biết gì', 'Làm được gì', 'Gặp ở đâu trong thực tế'],
          rows: [
            [
              'Whitebox (hộp trắng)',
              'Kiến trúc, trọng số, bộ đặc trưng, ngưỡng — tính được gradient theo đầu vào',
              'Sinh mẫu né tránh tối ưu, gần như luôn thành công, chi phí rất thấp',
              'Mô hình chạy trên máy khách (EDR, engine chống mã độc offline), mô hình tải công khai từ Hugging Face, hoặc sau khi kẻ tấn công đã vào được máy chủ mô hình',
            ],
            [
              'Greybox (hộp xám)',
              'Biết một phần: họ mô hình, bộ đặc trưng, dữ liệu huấn luyện công khai, hoặc nhận được ĐIỂM SỐ trả về',
              'Huấn luyện mô hình thay thế rất sát; dùng điểm số để leo dốc tới ranh giới quyết định',
              'Sản phẩm thương mại trả về điểm tin cậy; hệ thống dùng bộ dữ liệu công khai như EMBER; tài liệu sản phẩm mô tả đặc trưng',
            ],
            [
              'Blackbox (hộp đen)',
              'Chỉ thấy quyết định cuối: chặn hay không chặn',
              'Vẫn tấn công được bằng tìm kiếm theo biên hoặc bằng tính chuyển giao — chỉ tốn nhiều truy vấn hơn',
              'Cổng email, WAF, API chấm điểm có xác thực. Đây là mặc định khi mô hình hình vẽ đúng cách',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bẫy phổ biến: tưởng blackbox là an toàn',
          md: 'Rất nhiều đội kết luận "mô hình của ta chỉ trả về nhãn nên không tấn công được". Sai ở ba chỗ.\n\n**Một**, chỉ trả nhãn vẫn đủ cho tấn công dựa trên quyết định: mỗi truy vấn cho một bit, và vài nghìn bit là quá đủ để lần ra ranh giới.\n\n**Hai**, tính **chuyển giao** khiến kẻ tấn công không cần truy vấn bạn lần nào — họ tấn công mô hình thay thế của họ.\n\n**Ba**, khi mô hình chạy trên endpoint của khách hàng thì nó **không còn là blackbox nữa**: kẻ tấn công có file mô hình trong tay, và mọi thứ trở thành whitebox. Hãy phân loại theo *nơi mô hình chạy*, không theo *ý định thiết kế*.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't8l1-cp1',
              kind: 'mcq',
              tags: ['adversarial', 'threat-model'],
              q: 'Một EDR chạy mô hình phân loại tệp ngay trên máy trạm của khách hàng, hoàn toàn offline. Kẻ tấn công đã mua một bản EDR đó. Mức truy cập thực tế là gì?',
              options: [
                'Blackbox — vì mô hình được nhúng trong sản phẩm thương mại đã đóng gói',
                'Greybox — vì kẻ tấn công chỉ đọc được điểm số chứ không đọc được trọng số',
                'Whitebox — vì artefact mô hình nằm trên máy kẻ tấn công, họ có thể trích xuất trọng số và bộ đặc trưng',
                'Không phân loại được vì mô hình không có API',
              ],
              answer: 2,
              why: 'Cứ mô hình nào chạy trên phần cứng do kẻ tấn công kiểm soát thì mặc định là **whitebox**. Đóng gói, mã hoá hay làm rối chỉ làm chậm việc trích xuất chứ không ngăn được — đây đúng là bài học của vụ Skylight Cyber phá bộ phân loại của Cylance năm 2019: họ dịch ngược sản phẩm, tìm ra cách chấm điểm, rồi biết chính xác cần thêm gì vào tệp để kéo điểm xuống. Hệ quả thiết kế: mô hình chạy ở endpoint nên là **một tầng trong nhiều tầng**, không bao giờ là tầng duy nhất.',
              distractorWhy: [
                'Đóng gói không tạo ra ranh giới tin cậy. Bất cứ thứ gì chạy trên máy kẻ tấn công đều thuộc về kẻ tấn công.',
                'Điểm số chỉ là greybox khi kẻ tấn công không chạm được vào artefact. Ở đây họ chạm được.',
                '',
                'Phân loại theo NƠI mô hình chạy chứ không theo việc có API hay không.',
              ],
            },
            {
              id: 't8l1-cp2',
              kind: 'truefalse',
              tags: ['adversarial', 'dau-doc'],
              q: 'Tấn công đầu độc dữ liệu chỉ khả thi khi kẻ tấn công xâm nhập được vào kho dữ liệu huấn luyện của bạn.',
              answer: false,
              why: 'Không cần xâm nhập gì cả nếu bạn **tự mời họ đóng góp dữ liệu**. Rất nhiều đường cấp dữ liệu trong bảo mật là mở theo thiết kế: mẫu nộp lên nền tảng đa engine, honeypot công khai, telemetry từ máy khách, feed threat intel cộng đồng, và quan trọng nhất là **nhãn do analyst tạo ra từ chính cảnh báo mà kẻ tấn công gây ra**. Bài t8-l3 sẽ đi sâu vào đường cuối cùng — nó là đường nguy hiểm nhất và ít được canh nhất trong SOC.',
            },
          ],
        },
        { t: 'h', text: 'MITRE ATLAS — bản đồ chính thức của ngành', level: 2 },
        {
          t: 'p',
          md: '**MITRE ATLAS** (Adversarial Threat Landscape for Artificial-Intelligence Systems) là bản đối chiếu của ATT&CK dành riêng cho hệ thống AI. Nó dùng đúng ngữ pháp bạn đã quen: **chiến thuật** (tactic — kẻ tấn công muốn gì) và **kỹ thuật** (technique — họ làm bằng cách nào), mã kỹ thuật có tiền tố `AML.T`.',
        },
        {
          t: 'figure',
          id: 'fig-atlas',
          caption:
            'Vòng đời tấn công vào hệ thống ML theo cách sắp xếp của ATLAS. Chú ý hai chiến thuật không tồn tại trong ATT&CK doanh nghiệp: Truy cập mô hình ML (ML Model Access) và Dàn dựng tấn công ML (ML Attack Staging). Chính hai ô đó là phần mà quy trình threat model cũ của bạn chưa bao giờ hỏi tới.',
        },
        {
          t: 'p',
          md: 'Phần lớn chiến thuật của ATLAS trùng tên với ATT&CK: Trinh sát, Phát triển tài nguyên, Truy cập ban đầu, Thực thi, Duy trì, Né tránh phòng thủ, Thu thập, Rò rỉ, Tác động. Hai chiến thuật đặc thù cho AI là **ML Model Access** (kẻ tấn công lấy được quyền truy vấn hoặc quyền đọc mô hình) và **ML Attack Staging** (họ dựng mô hình thay thế, chế tạo dữ liệu đối kháng, cấy cửa hậu — tức là chuẩn bị đạn trước khi bắn).',
        },
        {
          t: 'p',
          md: 'ATLAS còn có phần **case studies** — các sự cố thật đã được kiểm chứng. Đây mới là chỗ đáng đọc nhất, vì nó cho bạn ngôn ngữ để nói chuyện với lãnh đạo: không phải "lý thuyết nói rằng", mà "chuyện này đã xảy ra với công ty X".',
        },
        {
          t: 'steps',
          title: 'Threat model một trang cho mô hình của bạn — làm trong 30 phút',
          steps: [
            {
              title: 'Bước 1 — Liệt kê tài sản, không chỉ có mô hình',
              md: 'Tài sản gồm: **artefact mô hình** (file trọng số), **bộ dữ liệu huấn luyện**, **quy trình gắn nhãn**, **đường cấp dữ liệu**, **API suy luận**, và **đầu ra** (điểm số, giải thích SHAP nếu có). Rất nhiều đội chỉ liệt kê ô đầu tiên rồi dừng. Ô "quy trình gắn nhãn" và ô "giải thích SHAP" là hai ô hay bị quên nhất, và cả hai đều là đường tấn công thật.',
            },
            {
              title: 'Bước 2 — Với mỗi tài sản, hỏi ai chạm được vào',
              md: 'Chạm ở đây gồm cả **ghi** lẫn **đọc**. Ví dụ: đường cấp dữ liệu từ honeypot thì *cả Internet* ghi được. Nhãn thì *analyst* ghi được, mà cảnh báo tới tay analyst lại do *kẻ tấn công* tạo ra — nên gián tiếp, kẻ tấn công cũng có bút. Viết ra bảng ba cột: tài sản / ai ghi / ai đọc.',
            },
            {
              title: 'Bước 3 — Xác định mức truy cập xấu nhất hợp lý',
              md: 'Không lấy trường hợp tệ nhất tưởng tượng, lấy **tệ nhất hợp lý**. Mô hình chạy ở endpoint → giả định whitebox. API trả điểm số → greybox. API trả nhãn, có xác thực, có rate limit → blackbox có ngân sách truy vấn hữu hạn. Ghi con số ngân sách ra: 100 truy vấn/ngày hay 100.000, đó là hai bài toán khác hẳn nhau.',
            },
            {
              title: 'Bước 4 — Chọn mục tiêu kẻ tấn công, không phải kỹ thuật',
              md: 'Bốn mục tiêu, viết theo ngôn ngữ nghiệp vụ: **(a) Đi lọt** — mẫu độc bị chấm là lành. **(b) Làm ngập** — ép mô hình sinh báo động giả hàng loạt để chôn cảnh báo thật. **(c) Lấy cắp** — sao chép mô hình hoặc moi dữ liệu huấn luyện. **(d) Phá tin cậy** — làm mô hình sai đủ nhiều để đội vận hành tắt nó đi. Mục tiêu (b) và (d) hay bị bỏ sót nhưng lại rẻ nhất cho kẻ tấn công.',
            },
            {
              title: 'Bước 5 — Với mỗi ô, ghi tín hiệu phát hiện',
              md: 'Đây là bước biến threat model thành việc làm được. Với mỗi cặp (tài sản × mục tiêu), viết đúng một dòng: *ta sẽ biết chuyện này đang xảy ra nhờ tín hiệu nào?* Nếu ô nào để trống thì đó chính là hạng mục công việc tiếp theo của bạn. Ví dụ: đầu độc qua vòng phản hồi → tín hiệu là "tỉ lệ nhãn âm do analyst gán tăng đột biến trên một cụm mẫu giống nhau".',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'ethics',
          title: 'Phạm vi hợp pháp — đọc trước khi thử bất cứ điều gì trong chặng này',
          md: 'Toàn bộ chặng 8 là kiến thức **phòng thủ và nghiên cứu**. Chỉ được kiểm thử trên hệ thống mà bạn **sở hữu**, hoặc được **uỷ quyền bằng văn bản** với phạm vi rõ ràng (rules of engagement, tài sản trong phạm vi, cửa sổ thời gian, đầu mối liên hệ khi có sự cố).\n\nDò tìm ranh giới quyết định của một API mà bạn không sở hữu là **truy cập trái phép** theo luật của hầu hết các quốc gia, kể cả khi bạn chỉ gửi những yêu cầu hợp lệ. Việc chỉ dùng API đúng cách không phải là lời biện hộ.\n\nNộp mẫu độc hại lên nền tảng công cộng để dò xem engine nào bắt được cũng có thể vi phạm điều khoản dịch vụ và làm ô nhiễm dữ liệu chung của cộng đồng. Trong bài kiểm thử hợp pháp, hãy dùng **mẫu vô hại có gắn dấu** (bài t8-l6 sẽ nói cách làm).',
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'Vì sao bản đồ này không phải chuyện lý thuyết',
          md: 'Năm 2019, nhóm Skylight Cyber công bố cách vượt qua bộ phân loại mã độc của Cylance: sau khi dịch ngược sản phẩm, họ phát hiện engine ưu ái mạnh một số chuỗi nhất định, và chỉ cần **nối thêm** những chuỗi lấy từ một tệp lành tính vào cuối mẫu mã độc là điểm số đảo chiều. Tệp vẫn chạy y nguyên vì phần thêm nằm ngoài vùng thực thi.\n\nHai chi tiết đáng nhớ: **một**, không có lỗ hổng phần mềm nào bị khai thác — chỉ là hành vi thống kê bị lợi dụng; **hai**, tấn công là whitebox chỉ vì sản phẩm chạy trên máy khách. Cùng một mô hình, nếu chỉ phục vụ qua API có kiểm soát thì bài toán của kẻ tấn công khó hơn nhiều bậc.',
        },
        {
          t: 'checklist',
          title: 'Câu hỏi mang vào buổi rà soát thiết kế của bất kỳ hệ thống ML nào',
          items: [
            'Mô hình chạy ở đâu — máy chủ ta kiểm soát, hay endpoint của khách hàng?',
            'API trả về gì: nhãn, điểm số, hay cả giải thích? Mỗi mức chi tiết thêm là một mức trợ giúp thêm cho kẻ tấn công',
            'Ai ghi được vào dữ liệu huấn luyện, kể cả gián tiếp qua vòng phản hồi?',
            'Có bao nhiêu truy vấn mỗi tài khoản mỗi ngày, và ta có log lại toàn bộ truy vấn không?',
            'Nếu mô hình bị vô hiệu hoá hoàn toàn thì tầng phòng thủ nào còn đứng?',
            'Ta phát hiện đầu độc bằng tín hiệu nào, và ai là người xem tín hiệu đó?',
            'Có đường quay lui (rollback) về phiên bản mô hình trước, và mất bao lâu để thực hiện?',
          ],
        },
        {
          t: 'terms',
          ids: ['doi-khang', 'atlas', 'attck', 'ne-tranh', 'dau-doc', 'model-extraction'],
        },
      ],
      keyTakeaways: [
        'Mọi tấn công vào ML đều đặt được vào lưới hai trục: giai đoạn (huấn luyện / suy luận) và mức truy cập (whitebox / greybox / blackbox).',
        'Mô hình chạy trên máy do kẻ tấn công kiểm soát thì luôn là whitebox, bất kể sản phẩm được đóng gói kỹ tới đâu.',
        'Blackbox không đồng nghĩa với an toàn: tấn công dựa trên quyết định và tính chuyển giao đều bỏ qua rào cản này.',
        'MITRE ATLAS thêm hai chiến thuật không có trong ATT&CK doanh nghiệp: ML Model Access và ML Attack Staging.',
        'Bốn mục tiêu của kẻ tấn công: đi lọt, làm ngập cảnh báo, lấy cắp mô hình hoặc dữ liệu, và phá niềm tin để đội vận hành tự tắt mô hình.',
        'Threat model chỉ hữu ích khi mỗi ô đều có một dòng "ta phát hiện bằng tín hiệu nào" — ô trống chính là hạng mục công việc tiếp theo.',
      ],
      cards: [
        {
          id: 't8l1-c1',
          front: 'Hai trục dùng để phân loại mọi tấn công vào hệ thống học máy là gì?',
          back: 'Trục giai đoạn: tấn công lúc huấn luyện (đầu độc, cửa hậu) hay lúc suy luận (né tránh, trộm mô hình). Trục truy cập: whitebox, greybox, blackbox.',
          tags: ['adversarial', 'threat-model'],
        },
        {
          id: 't8l1-c2',
          front: 'Quy tắc một câu để quyết định một mô hình có phải whitebox với kẻ tấn công hay không?',
          back: 'Nếu mô hình chạy trên phần cứng do kẻ tấn công kiểm soát thì mặc định là whitebox. Đóng gói và làm rối chỉ làm chậm việc trích xuất, không ngăn được.',
          tags: ['adversarial', 'threat-model'],
        },
        {
          id: 't8l1-c3',
          front: 'ATLAS thêm hai chiến thuật nào mà ATT&CK doanh nghiệp không có?',
          back: 'ML Model Access (lấy được quyền truy vấn hoặc đọc mô hình) và ML Attack Staging (dựng mô hình thay thế, chế tạo dữ liệu đối kháng, cấy cửa hậu).',
          hint: 'Một cái về quyền chạm vào mô hình, một cái về chuẩn bị đạn.',
          tags: ['atlas'],
        },
        {
          id: 't8l1-c4',
          front: 'Kể bốn mục tiêu của kẻ tấn công lên một hệ thống ML phát hiện.',
          back: 'Đi lọt (mẫu độc bị chấm là lành); làm ngập cảnh báo để chôn tín hiệu thật; lấy cắp mô hình hoặc dữ liệu huấn luyện; phá tin cậy để đội vận hành tự tắt mô hình.',
          tags: ['threat-model'],
        },
        {
          id: 't8l1-c5',
          front: 'Vì sao chỉ trả về nhãn thay vì điểm số không đủ để bảo vệ mô hình?',
          back: 'Vì tấn công dựa trên quyết định vẫn lần được ranh giới bằng nhiều truy vấn, và tính chuyển giao cho phép kẻ tấn công sinh mẫu trên mô hình thay thế mà không truy vấn bạn lần nào.',
          tags: ['adversarial'],
        },
      ],
      quiz: [
        {
          id: 't8l1-q1',
          kind: 'match',
          tags: ['adversarial', 'threat-model'],
          q: 'Ghép mỗi tấn công với giai đoạn vòng đời mà nó tác động.',
          pairs: [
            ['Lật nhãn của 3% mẫu trong tập huấn luyện', 'Huấn luyện — làm lệch ranh giới quyết định'],
            ['Thêm dữ liệu thừa vào cuối tệp PE để hạ điểm', 'Suy luận — chỉnh đầu vào, mô hình không đổi'],
            ['Truy vấn API hàng chục nghìn lần để dựng bản sao mô hình', 'Suy luận — đọc đầu ra để tái tạo mô hình'],
            ['Cấy một chuỗi kích hoạt để mọi tệp chứa nó đều bị chấm là lành', 'Huấn luyện — cửa hậu nằm sẵn trong trọng số'],
          ],
          why: 'Lưới hai trục này quyết định phòng thủ nào có tác dụng. Hai dòng "huấn luyện" chỉ chặn được bằng quản trị dữ liệu: kiểm soát nguồn gốc, giới hạn ai đóng góp, kiểm định bằng tập chuẩn sạch. Hai dòng "suy luận" chỉ chặn được bằng thiết kế hệ thống: phòng thủ nhiều tầng, giới hạn tốc độ, giảm chi tiết đầu ra, giám sát mẫu truy vấn. Áp nhầm nhóm biện pháp vào nhầm giai đoạn là lý do nhiều dự án tốn tiền mà không giảm rủi ro.',
        },
        {
          id: 't8l1-q2',
          kind: 'mcq',
          tags: ['threat-model'],
          q: 'Trong threat model, tài sản nào của một hệ thống ML phát hiện hay bị bỏ sót nhất?',
          options: [
            'File trọng số của mô hình',
            'Quy trình gắn nhãn và vòng phản hồi từ analyst',
            'API suy luận',
            'Máy chủ chạy dịch vụ suy luận',
          ],
          answer: 1,
          why: 'Ba tài sản còn lại đều là những thứ có hình hài rõ ràng nên gần như luôn được liệt kê. **Quy trình gắn nhãn** thì không: nó nằm rải rác trong công việc hằng ngày của analyst, không có chủ sở hữu rõ ràng, không có kiểm soát thay đổi, và quan trọng nhất — **đầu vào của nó do kẻ tấn công tạo ra**. Mỗi cảnh báo bị đóng nhầm là một nhãn sai đi thẳng vào lần huấn luyện sau. Đây là điểm mà bài t8-l3 sẽ khai thác kỹ.',
          distractorWhy: [
            'Luôn được liệt kê đầu tiên trong mọi buổi rà soát.',
            '',
            'Là thứ đội bảo mật ứng dụng quen kiểm tra, hiếm khi bị quên.',
            'Thuộc phạm vi hạ tầng truyền thống, đã có quy trình sẵn.',
          ],
        },
        {
          id: 't8l1-q3',
          kind: 'multi',
          tags: ['adversarial', 'threat-model'],
          q: 'Yếu tố nào làm TĂNG mức truy cập hiệu dụng của kẻ tấn công lên mô hình của bạn? (Chọn tất cả)',
          options: [
            'API trả về điểm tin cậy dạng số thực thay vì chỉ nhãn',
            'Mô hình được huấn luyện trên bộ dữ liệu công khai như EMBER',
            'Mô hình chỉ chạy trên máy chủ nội bộ và có giới hạn 50 truy vấn mỗi giờ',
            'Sản phẩm hiển thị giải thích SHAP cho từng quyết định',
          ],
          answers: [0, 1, 3],
          why: 'Mỗi bit thông tin bạn trả ra là một bậc thang cho kẻ tấn công. **Điểm số** biến bài toán từ tìm kiếm mù thành leo dốc — số truy vấn cần thiết giảm hàng chục lần. **Dữ liệu công khai** cho phép huấn luyện mô hình thay thế rất sát, nên tính chuyển giao tăng mạnh. **Giải thích SHAP** thì đúng nghĩa là chỉ cho kẻ tấn công biết cần sửa đặc trưng nào — một tính năng minh bạch tuyệt vời cho analyst và cũng tuyệt vời cho kẻ tấn công. Ngược lại, giới hạn 50 truy vấn mỗi giờ là biện pháp **giảm** mức truy cập hiệu dụng.',
        },
        {
          id: 't8l1-q4',
          kind: 'truefalse',
          tags: ['adversarial'],
          q: 'Một mô hình không có lỗ hổng phần mềm nào thì không thể bị tấn công.',
          answer: false,
          why: 'Đây là hiểu lầm nền tảng phải bỏ trước khi học tiếp. Mẫu đối kháng, đầu độc dữ liệu và trộm mô hình đều **không khai thác lỗi lập trình** — chúng khai thác chính hành vi thống kê mà mô hình được thiết kế để có. Một bộ phân loại hoàn hảo về mặt kỹ thuật phần mềm, không tràn bộ đệm, không lỗi giải tuần tự, vẫn có ranh giới quyết định, và ranh giới nào cũng có chỗ để lách. Hệ quả: kiểm thử bảo mật cho ML là một loại công việc khác, không thay thế được bằng quét SAST hay pentest ứng dụng thông thường.',
        },
      ],
      terms: ['doi-khang', 'atlas', 'attck', 'ne-tranh', 'dau-doc', 'model-extraction'],
      further: [
        {
          title: 'MITRE ATLAS — Matrix và Case Studies',
          note: 'Đọc ma trận một lần cho quen ngữ pháp, rồi đọc kỹ phần case studies. Đây là nguồn duy nhất cho bạn sự cố thật đã kiểm chứng để trích dẫn trong báo cáo nội bộ.',
          url: 'https://atlas.mitre.org/',
        },
        {
          title: 'NIST AI 100-2 — Adversarial Machine Learning: A Taxonomy and Terminology',
          note: 'Bảng phân loại chính thức của NIST. Dùng đúng thuật ngữ trong tài liệu này khi viết báo cáo cho bộ phận tuân thủ, tránh mỗi người gọi một kiểu.',
          url: 'https://csrc.nist.gov/pubs/ai/100/2/e2025/final',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't8-l2',
      trackId: 'adversarial',
      title: 'Tấn công né tránh (evasion)',
      subtitle: 'Vì sao đổi 4 pixel là đủ với ảnh, còn với một tệp PE thì bài toán khó hơn hẳn một bậc.',
      minutes: 27,
      practiceMinutes: 7,
      level: 'nang-cao',
      prereqs: ['t8-l1'],
      why: {
        short:
          'Né tránh là dạng tấn công mà mô hình phát hiện của bạn sẽ gặp thường xuyên nhất, vì nó rẻ nhất: kẻ tấn công không cần chỗ đứng nào bên trong, chỉ cần chỉnh mẫu của chính họ.',
        scenario:
          'Mô hình chấm điểm tệp của bạn chạy tốt sáu tháng. Rồi một họ mã độc bắt đầu lọt qua đều đặn, dù chữ ký YARA cũ vẫn khớp. Bạn lấy mẫu ra so với biến thể cũ: chức năng y hệt, chỉ khác vài trăm KB dữ liệu thừa ở cuối tệp và vài mục nhập bảng import không bao giờ được gọi. Bạn phải trả lời được ngay: đây là né tránh có chủ đích hay chỉ là trùng hợp, và cần đổi gì trong bộ đặc trưng.',
        roles: ['Malware Analyst', 'Detection Engineer', 'Security Data Scientist', 'Red Teamer'],
        costOfNotKnowing:
          'Bạn sẽ vá bằng cách thêm mẫu mới vào tập huấn luyện rồi huấn luyện lại, thấy chỉ số đẹp trở lại, và lặp lại vòng đó mỗi tháng mãi mãi. Cái bạn cần là nhận ra đặc trưng nào đang bị kẻ tấn công điều khiển với chi phí gần bằng không, và loại bỏ sự phụ thuộc vào nó.',
      },
      objectives: [
        'Giải thích bằng lời cách FGSM và PGD sinh mẫu đối kháng, không cần viết công thức',
        'Chỉ ra ba khác biệt cốt lõi giữa mẫu đối kháng trên ảnh và trên tệp thực thi',
        'Liệt kê được các phép biến đổi bảo toàn chức năng trên tệp PE và đặc trưng mà mỗi phép ảnh hưởng tới',
        'Ước lượng ngân sách truy vấn cần cho một tấn công blackbox và dùng con số đó để đặt giới hạn tốc độ API',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bài báo về mẫu đối kháng trên ảnh thường nói: "chỉ cần nhiễu nhỏ hơn 8/255 mỗi pixel, mắt người không thấy khác biệt, mà mô hình đổi hoàn toàn nhãn". Bây giờ áp cùng ý tưởng đó cho một tệp thực thi Windows: sửa mỗi byte của tệp đi tối đa 8 đơn vị. Điều gì xảy ra?',
          reveal:
            'Tệp **không chạy được nữa**. Byte trong tệp PE không phải là cường độ sáng có thể xê dịch tự do — chúng là mã lệnh, địa chỉ, offset, checksum. Sửa một byte trong opcode là đổi lệnh; sửa một byte trong bảng địa chỉ là làm hỏng con trỏ. Ràng buộc thật của kẻ tấn công không phải "nhiễu nhỏ" mà là **"tệp phải còn thực hiện đúng hành vi độc hại"** (functionality-preserving). Đây là khác biệt lớn nhất giữa đối kháng trên ảnh và đối kháng trong bảo mật, và nó vừa **làm khó** kẻ tấn công (không được sửa tuỳ ý) vừa **làm khó** người phòng thủ (khái niệm "nhiễu nhỏ" và các phòng thủ dựa trên nó trở nên vô nghĩa).',
        },
        {
          t: 'p',
          md: '**Mẫu đối kháng** (adversarial example) là một đầu vào được chỉnh có chủ đích sao cho mô hình phân loại sai, trong khi bản chất của nó không đổi. Với ảnh, "bản chất không đổi" nghĩa là người vẫn nhìn ra con mèo. Với bảo mật, nó nghĩa là **mã độc vẫn mã hoá được ổ đĩa** hoặc **email lừa đảo vẫn dụ được nạn nhân bấm vào**.',
        },
        {
          t: 'figure',
          id: 'fig-adversarial',
          caption:
            'Điểm gốc nằm sâu trong vùng "độc hại". Kẻ tấn công không cần đi xa — chỉ cần đẩy nó qua ranh giới quyết định theo hướng vuông góc, tức hướng dốc nhất. Với mô hình có nhiều chiều, khoảng cách tới ranh giới thường nhỏ hơn trực giác của ta rất nhiều, và đó là lý do mẫu đối kháng tồn tại ở gần như mọi mô hình.',
        },
        { t: 'h', text: 'FGSM và PGD, kể bằng lời', level: 2 },
        {
          t: 'p',
          md: 'Ở bài t1-l7 bạn đã thấy huấn luyện là: cố định dữ liệu, sửa **trọng số** theo hướng *giảm* mất mát. Sinh mẫu đối kháng chỉ là đảo hai vế: cố định trọng số, sửa **đầu vào** theo hướng *tăng* mất mát.',
        },
        {
          t: 'steps',
          title: 'Từ FGSM tới PGD, không cần công thức',
          steps: [
            {
              title: 'FGSM — một bước, nhanh và thô',
              md: '**Fast Gradient Sign Method** (Goodfellow, Shlens, Szegedy, 2014). Tính gradient của mất mát theo đầu vào, chỉ lấy **dấu** của nó (mỗi chiều là +1 hoặc −1), rồi bước một bước cố định độ dài epsilon theo hướng đó. Chỉ một lần tính gradient, nên cực nhanh. Đổi lại, nó thô: hướng dấu không phải hướng tối ưu, nên tỉ lệ thành công thấp hơn hẳn các phương pháp lặp.',
            },
            {
              title: 'PGD — nhiều bước nhỏ, có chiếu về vùng cho phép',
              md: '**Projected Gradient Descent** (Madry và cộng sự, 2017). Thay vì một bước dài, đi hàng chục bước ngắn, và sau **mỗi** bước thì *chiếu* điểm hiện tại trở lại vùng nhiễu được phép. Mạnh hơn FGSM rất nhiều, và trở thành chuẩn de facto để đo độ bền: nếu một phòng thủ không đứng vững trước PGD nhiều lần khởi động ngẫu nhiên thì nó không đứng vững trước gì cả.',
            },
            {
              title: 'Chỗ mà bảo mật rẽ hướng: phép chiếu là gì?',
              md: 'Với ảnh, "chiếu về vùng cho phép" đơn giản là cắt mỗi pixel về khoảng epsilon quanh giá trị gốc. Với tệp PE hay dòng log, **vùng cho phép không phải một quả cầu hình học** mà là "tập các tệp còn chạy được và còn độc hại". Tập đó rời rạc, không lồi, và không có công thức chiếu. Đây là lý do bạn không thể copy nguyên xi thư viện đối kháng của thị giác máy tính sang bài toán mã độc.',
            },
            {
              title: 'Không gian đặc trưng và không gian bài toán',
              md: 'Thuật toán tối ưu làm việc trên **không gian đặc trưng** (feature space): nó nói "hãy giảm entropy của section .text xuống 0,3 và tăng số import lên 12". Nhưng kẻ tấn công phải giao nộp một **tệp thật** (problem space). Việc tìm một tệp thật ứng với vector đặc trưng mong muốn gọi là **bài toán ánh xạ ngược đặc trưng** (inverse feature-mapping problem), và nhiều khi nó **vô nghiệm**. Pierazzi và cộng sự (IEEE S&P 2020) là tài liệu chuẩn về khoảng cách giữa hai không gian này.',
            },
            {
              title: 'Vậy kẻ tấn công thật làm gì?',
              md: 'Họ đi ngược lại: bắt đầu từ một **tập phép biến đổi bảo toàn chức năng** đã biết là hợp lệ, rồi tìm tổ hợp nào hạ điểm nhiều nhất. Đây là tìm kiếm rời rạc trên một danh sách hành động, không phải hạ gradient liên tục. Chậm hơn về lý thuyết, nhưng luôn cho ra tệp chạy được — mà đó mới là thứ họ cần.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Trực giác cốt lõi cho người phòng thủ',
          md: 'Đừng hỏi *"mô hình của tôi bền tới epsilon bao nhiêu"*. Hãy hỏi: **"kẻ tấn công điều khiển được đặc trưng nào của tôi, với chi phí bao nhiêu?"**\n\nMọi đặc trưng đều nằm đâu đó trên một thang: từ **miễn phí để giả** (chuỗi trong tệp, User-Agent, tên tệp, độ dài tệp) tới **đắt để giả** (hành vi runtime, hạ tầng mạng thật, chứng chỉ ký hợp lệ, lịch sử uy tín của tên miền). Mô hình càng dựa nhiều vào nhóm đầu thì càng dễ bị lách; càng dựa vào nhóm sau thì kẻ tấn công càng phải trả tiền thật. Đây là nguyên tắc thiết kế quan trọng nhất của cả bài.',
        },
        { t: 'h', text: 'Né tránh trong thế giới thật của bảo mật', level: 2 },
        {
          t: 'table',
          caption: 'Các phép biến đổi bảo toàn chức năng trên tệp PE, và đặc trưng bị chúng đánh lừa',
          head: ['Phép biến đổi', 'Vì sao tệp vẫn chạy', 'Đặc trưng bị ảnh hưởng', 'Chi phí cho kẻ tấn công'],
          rows: [
            [
              'Nối thêm dữ liệu vào cuối tệp (overlay)',
              'Vùng thêm nằm ngoài phần được nạp vào bộ nhớ',
              'Kích thước tệp, entropy toàn cục, histogram byte, phân phối n-gram',
              'Gần bằng không — vài dòng script',
            ],
            [
              'Thêm section mới không được dùng',
              'Bảng section chấp nhận thêm mục; luồng thực thi không đổi',
              'Số section, tên section, tỉ lệ kích thước các section',
              'Rất thấp',
            ],
            [
              'Thêm mục nhập vào bảng import không bao giờ gọi tới',
              'Import thừa chỉ tốn thời gian nạp, không đổi hành vi',
              'Vector import API — một trong những nhóm đặc trưng mạnh nhất của các mô hình PE',
              'Thấp',
            ],
            [
              'Chèn lệnh vô nghĩa và đổi thứ tự lệnh độc lập',
              'Ngữ nghĩa chương trình giữ nguyên',
              'Đặc trưng dựa trên chuỗi opcode, chữ ký byte tĩnh',
              'Trung bình — cần công cụ biến đổi mã',
            ],
            [
              'Ký số bằng chứng chỉ mua hoặc bị đánh cắp',
              'Không đụng gì tới mã',
              'Đặc trưng uy tín, trạng thái chữ ký — thường có trọng số rất lớn',
              'Cao — tốn tiền thật và để lại dấu vết truy vết được',
            ],
          ],
        },
        {
          t: 'p',
          md: 'Đọc cột cuối cùng: **chi phí tăng dần từ trên xuống**. Đây chính là bản đồ để bạn quyết định nên bớt phụ thuộc vào nhóm đặc trưng nào. Nếu mô hình của bạn quyết định chủ yếu bằng entropy toàn cục và histogram byte, kẻ tấn công lách được bằng một vòng lặp `while` thêm byte rác.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't8l2-cp1',
              kind: 'mcq',
              tags: ['ne-tranh', 'dac-trung'],
              q: 'Mô hình PE của bạn có ba nhóm đặc trưng quan trọng nhất: entropy toàn cục, vector import API, và hành vi khi chạy trong sandbox (số lần gọi CreateRemoteThread, số tệp bị ghi). Nhóm nào bền nhất trước né tránh?',
              options: [
                'Entropy toàn cục — vì nó tổng hợp toàn bộ tệp nên khó thao túng cục bộ',
                'Vector import API — vì bảng import phản ánh đúng chức năng thật của chương trình',
                'Hành vi khi chạy trong sandbox — vì muốn đổi nó thì phải đổi việc chương trình thực sự làm',
                'Cả ba bền như nhau vì đều được rút ra từ cùng một tệp',
              ],
              answer: 2,
              why: 'Đặc trưng hành vi runtime bền hơn hẳn vì muốn thay đổi nó thì kẻ tấn công phải **thay đổi hành vi thật** — mà hành vi thật chính là mục đích họ theo đuổi. Entropy toàn cục thì thao túng bằng cách nối thêm dữ liệu có entropy thấp vào cuối tệp, tốn vài giây. Vector import nghe có vẻ gắn với chức năng nhưng thực ra **thêm** import thừa là chuyện tầm thường, và kẻ tấn công có thể giấu import thật bằng cách phân giải động qua `GetProcAddress`. Lưu ý cân bằng: sandbox có giá riêng — chậm, tốn tài nguyên, và mã độc biết cách phát hiện sandbox rồi ngủ yên.',
              distractorWhy: [
                'Entropy toàn cục là một trong những đặc trưng dễ thao túng nhất, chỉ cần nối thêm byte.',
                'Import có thể thêm thừa tuỳ ý, và import thật có thể giấu bằng phân giải động lúc chạy.',
                '',
                'Chi phí thao túng của ba nhóm chênh nhau nhiều bậc, không thể coi là như nhau.',
              ],
            },
          ],
        },
        { t: 'h', text: 'Tính chuyển giao: vì sao whitebox của kẻ tấn công cũng là vấn đề của bạn', level: 2 },
        {
          t: 'p',
          md: '**Tính chuyển giao** (transferability) là hiện tượng: một mẫu đối kháng sinh ra trên mô hình A vẫn đánh lừa được mô hình B, dù B khác kiến trúc và khác dữ liệu huấn luyện. Papernot và cộng sự (2016–2017) đã chỉ ra rằng hiện tượng này đủ mạnh để dựng một quy trình tấn công blackbox hoàn chỉnh.',
        },
        {
          t: 'steps',
          title: 'Quy trình tấn công blackbox dựa trên mô hình thay thế — mức khái niệm',
          steps: [
            {
              title: 'Bước 1 — Dựng mô hình thay thế',
              md: 'Kẻ tấn công huấn luyện mô hình của riêng họ trên dữ liệu công khai. Trong bảo mật, bộ dữ liệu EMBER (đặc trưng của hàng triệu tệp PE, do Endgame công bố) khiến bước này gần như miễn phí. Mô hình thay thế không cần giống mô hình của bạn — nó chỉ cần học được cùng những quy luật thống kê chung.',
            },
            {
              title: 'Bước 2 — Sinh mẫu né tránh trên mô hình thay thế',
              md: 'Ở đây họ có toàn quyền whitebox: gradient, trọng số, thử bao nhiêu lần cũng được, không ai thấy. Đây là điểm mấu chốt — **mọi biện pháp giám sát truy vấn của bạn đều mù ở giai đoạn này** vì không có truy vấn nào tới hệ thống của bạn cả.',
            },
            {
              title: 'Bước 3 — Bắn thử một lần vào mô hình thật',
              md: 'Nếu qua, xong. Nếu không, chỉnh và bắn lại. Vì mỗi lần bắn có xác suất thành công tương đối cao nhờ tính chuyển giao, tổng số truy vấn tới hệ thống của bạn có thể chỉ là vài chục — quá ít để bất kỳ luật phát hiện dựa trên tần suất nào kêu lên.',
            },
            {
              title: 'Hệ quả phòng thủ',
              md: 'Đừng đặt hết niềm tin vào việc "phát hiện chuỗi truy vấn dò biên". Nó chỉ bắt được kiểu tấn công dùng nhiều truy vấn. Với kiểu chuyển giao, thứ giúp bạn là **sự đa dạng**: nếu quyết định cuối cùng dựa trên nhiều họ đặc trưng độc lập (tĩnh, động, mạng, uy tín) thì một mẫu chuyển giao thành công ở tầng tĩnh vẫn còn ba tầng nữa phải qua.',
            },
          ],
        },
        {
          t: 'compare',
          title: 'Hai kiểu tấn công blackbox — số truy vấn quyết định biện pháp phòng thủ',
          left: {
            title: 'Dựa trên truy vấn (query-based)',
            icon: 'repeat',
            items: [
              'Dò trực tiếp hệ thống của bạn, dùng điểm số hoặc chỉ nhãn để leo dốc',
              'Kiểu dựa trên điểm số: cần hàng nghìn tới hàng chục nghìn truy vấn',
              'Kiểu chỉ dựa trên quyết định (ví dụ Boundary Attack, Brendel và cộng sự 2018): tốn nhiều hơn nữa, thường hàng chục nghìn',
              'PHÁT HIỆN ĐƯỢC: nhiều truy vấn rất giống nhau, khác nhau từng chút, từ cùng một danh tính',
              'Phòng thủ hiệu quả: giới hạn tốc độ, làm tròn điểm số, ghi log và phân cụm truy vấn theo độ tương tự',
            ],
          },
          right: {
            title: 'Dựa trên chuyển giao (transfer-based)',
            icon: 'upload',
            items: [
              'Toàn bộ công việc nặng làm ngoại tuyến trên mô hình thay thế',
              'Chỉ vài truy vấn tới hệ thống của bạn, có khi chỉ một',
              'Tỉ lệ thành công thấp hơn tấn công truy vấn, nhưng chi phí bị bắt gần bằng không',
              'GẦN NHƯ KHÔNG PHÁT HIỆN ĐƯỢC bằng phân tích mẫu truy vấn',
              'Phòng thủ hiệu quả: đa dạng hoá họ đặc trưng, phòng thủ nhiều tầng, không dùng chung kiến trúc và dữ liệu với mô hình công khai phổ biến',
            ],
          },
        },
        {
          t: 'lab',
          id: 'lab-adversarial',
          intro:
            'Vặn từng đặc trưng của một mẫu đang bị chấm là độc hại và xem điểm số dịch chuyển ra sao. Hãy làm hai lần: lần đầu chỉnh tự do, lần sau bật ràng buộc "chỉ được dùng phép biến đổi bảo toàn chức năng" và so xem bạn phải đi xa hơn bao nhiêu. Đó chính là khoảng cách giữa không gian đặc trưng và không gian bài toán.',
        },
        {
          t: 'code',
          lang: 'python',
          caption:
            'Công cụ PHÒNG THỦ: đo xem mỗi mẫu nằm cách ranh giới quyết định bao xa, để biết mẫu nào chỉ cần một cú đẩy nhẹ là lật',
          code: `import numpy as np

def do_ben_theo_dac_trung(mo_hinh, x, chi_so_cot, buoc, so_buoc=40):
    """Quét một đặc trưng và tìm giá trị nhỏ nhất làm lật nhãn.

    Đây là công cụ ĐÁNH GIÁ cho đội phòng thủ, chạy trên mô hình của chính bạn:
    nó trả lời "đặc trưng nào rẻ nhất để kẻ tấn công thao túng".
    """
    nhan_goc = mo_hinh.predict(x.reshape(1, -1))[0]
    for k in range(1, so_buoc + 1):
        z = x.copy()
        z[chi_so_cot] = z[chi_so_cot] + k * buoc   # chỉ đi theo hướng tăng
        if mo_hinh.predict(z.reshape(1, -1))[0] != nhan_goc:
            return k * buoc                        # khoảng cách lật nhãn
    return None                                    # không lật trong ngân sách đã cho

# Xếp hạng đặc trưng theo mức độ "rẻ để thao túng".
# Cột nào lật nhãn với thay đổi nhỏ nhất chính là cột cần xem lại đầu tiên.
khoang_cach = {
    ten: do_ben_theo_dac_trung(mo_hinh, x_mau, i, buoc=buoc_theo_cot[ten])
    for i, ten in enumerate(ten_cot)
}
xep_hang = sorted((v, k) for k, v in khoang_cach.items() if v is not None)
print(xep_hang[:5])   # 5 đặc trưng mong manh nhất`,
        },
        {
          t: 'callout',
          kind: 'ethics',
          title: 'Ranh giới của bài này',
          md: 'Đoạn mã trên chạy trên **mô hình của bạn**, với **dữ liệu của bạn**, để trả lời câu hỏi phòng thủ "đặc trưng nào mong manh nhất". Đó là toàn bộ mục đích của nó.\n\nDùng cùng ý tưởng đó để dò ranh giới quyết định của một dịch vụ mà bạn không sở hữu là hành vi truy cập trái phép, kể cả khi mỗi yêu cầu riêng lẻ đều hợp lệ về mặt kỹ thuật. Nếu bạn kiểm thử cho khách hàng, hãy có **văn bản uỷ quyền** ghi rõ tài sản trong phạm vi, cửa sổ thời gian, ngân sách truy vấn được phép và đầu mối liên hệ khi có sự cố.\n\nVà đừng dùng mã độc thật để kiểm thử phòng thủ trong môi trường có kết nối mạng. Bài t8-l6 sẽ trình bày cách dùng mẫu vô hại có gắn dấu để đo cùng một thứ mà không tạo ra rủi ro mới.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Ba hiểu nhầm hay gặp khi mang tài liệu đối kháng của thị giác máy tính vào bảo mật',
          md: '**1. "Nhiễu phải nhỏ".** Ràng buộc thật là *bảo toàn chức năng*, không phải chuẩn Lp nhỏ. Một tệp mã độc phình thêm 5 MB vẫn là tấn công thành công hoàn hảo — không có "người quan sát" nào để đánh lừa.\n\n**2. "Cứ dùng thư viện đối kháng có sẵn là đo được độ bền".** Các thư viện đó sinh vector đặc trưng, không sinh tệp chạy được. Con số bạn đo ra là độ bền trong không gian đặc trưng, thường **bi quan quá mức** so với thực tế — kẻ tấn công không tới được mọi điểm mà thuật toán tìm ra.\n\n**3. "Mô hình của ta không dùng mạng nơ-ron nên không có gradient, nên an toàn".** Cây tăng cường cũng có mẫu đối kháng; chỉ là kẻ tấn công dùng tìm kiếm rời rạc thay vì gradient. Với LightGBM trên vài trăm đặc trưng, tìm kiếm đó không hề đắt.',
        },
        {
          t: 'terms',
          ids: ['mau-doi-khang', 'ne-tranh', 'doi-khang', 'ember', 'pe'],
        },
      ],
      keyTakeaways: [
        'Sinh mẫu đối kháng là hạ gradient chạy ngược: cố định trọng số, sửa đầu vào theo hướng làm TĂNG mất mát.',
        'FGSM là một bước theo dấu gradient; PGD là nhiều bước nhỏ có chiếu về vùng cho phép và mạnh hơn nhiều.',
        'Trong bảo mật, ràng buộc là bảo toàn chức năng chứ không phải nhiễu nhỏ — nên phép chiếu hình học của ảnh không áp dụng được.',
        'Khoảng cách giữa không gian đặc trưng và không gian bài toán khiến nhiều mẫu đối kháng lý thuyết không tồn tại dưới dạng tệp thật.',
        'Câu hỏi phòng thủ đúng là "kẻ tấn công điều khiển được đặc trưng nào với chi phí bao nhiêu", không phải "epsilon bao nhiêu".',
        'Tấn công truy vấn tốn hàng nghìn tới hàng chục nghìn lần gọi nên phát hiện được; tấn công chuyển giao chỉ tốn vài lần nên phải chặn bằng đa dạng hoá đặc trưng và phòng thủ nhiều tầng.',
      ],
      cards: [
        {
          id: 't8l2-c1',
          front: 'Khác biệt cốt lõi giữa FGSM và PGD là gì?',
          back: 'FGSM đi một bước theo dấu gradient, nhanh nhưng thô. PGD đi nhiều bước nhỏ, sau mỗi bước chiếu lại về vùng nhiễu cho phép, nên mạnh hơn hẳn và được dùng làm chuẩn đo độ bền.',
          tags: ['mau-doi-khang'],
        },
        {
          id: 't8l2-c2',
          front: 'Ràng buộc thật của mẫu đối kháng trong bảo mật là gì, thay cho ràng buộc "nhiễu nhỏ" của ảnh?',
          back: 'Bảo toàn chức năng: tệp sửa xong phải còn thực thi đúng hành vi độc hại. Vùng hợp lệ là một tập rời rạc, không lồi, nên không có phép chiếu hình học.',
          tags: ['ne-tranh'],
        },
        {
          id: 't8l2-c3',
          front: 'Bài toán ánh xạ ngược đặc trưng (inverse feature-mapping) là gì?',
          back: 'Là việc tìm một tệp thật ứng với vector đặc trưng mà thuật toán tối ưu yêu cầu. Nhiều khi vô nghiệm, nên tấn công trong không gian đặc trưng không phải lúc nào cũng thực hiện được.',
          hint: 'Thuật toán nói cần entropy 0,3 — nhưng lấy tệp nào?',
          tags: ['ne-tranh'],
        },
        {
          id: 't8l2-c4',
          front: 'Vì sao đặc trưng hành vi runtime bền hơn đặc trưng tĩnh trước né tránh?',
          back: 'Vì muốn đổi hành vi runtime thì kẻ tấn công phải đổi việc chương trình thực sự làm — mà đó chính là mục đích họ theo đuổi. Chuỗi, entropy, kích thước tệp thì sửa gần như miễn phí.',
          tags: ['ne-tranh', 'dac-trung'],
        },
        {
          id: 't8l2-c5',
          front: 'Vì sao giám sát mẫu truy vấn không chặn được tấn công dựa trên tính chuyển giao?',
          back: 'Vì toàn bộ việc dò tìm diễn ra ngoại tuyến trên mô hình thay thế của kẻ tấn công. Hệ thống của bạn chỉ nhận vài truy vấn, quá ít để bất kỳ luật tần suất nào kêu.',
          tags: ['ne-tranh', 'adversarial'],
        },
      ],
      quiz: [
        {
          id: 't8l2-q1',
          kind: 'mcq',
          tags: ['ne-tranh'],
          q: 'Vì sao không thể áp dụng thẳng ràng buộc "mỗi byte thay đổi tối đa epsilon" của mẫu đối kháng trên ảnh vào tệp thực thi?',
          options: [
            'Vì tệp thực thi lớn hơn ảnh nên chi phí tính toán quá cao',
            'Vì byte trong tệp là mã lệnh, offset và checksum — sửa tuỳ ý thì tệp hỏng, không còn thực thi được',
            'Vì tệp thực thi không có gradient nên không tính được hướng đi',
            'Vì định dạng PE được ký số nên mọi thay đổi đều bị từ chối',
          ],
          answer: 1,
          why: 'Byte ảnh là **cường độ liên tục**: đổi giá trị đi vài đơn vị thì vẫn là một ảnh hợp lệ, chỉ hơi khác. Byte của tệp PE là **cấu trúc rời rạc có ràng buộc chặt**: một byte trong opcode là một lệnh, một byte trong bảng địa chỉ là con trỏ. Vùng đầu vào hợp lệ không phải quả cầu quanh điểm gốc mà là tập rời rạc "các tệp còn chạy được", nên khái niệm epsilon và phép chiếu về quả cầu đều mất nghĩa. Đây là lý do các phòng thủ có chứng nhận theo chuẩn Lp gần như không áp dụng được cho mã độc.',
          distractorWhy: [
            'Chi phí tính toán không phải vấn đề chính; vấn đề là tính hợp lệ của đầu vào.',
            '',
            'Vẫn tính được gradient nếu mô hình khả vi — cái thiếu là phép chiếu về vùng hợp lệ.',
            'Đa số mã độc không được ký số, và ký số không phải điều kiện để tệp chạy.',
          ],
        },
        {
          id: 't8l2-q2',
          kind: 'order',
          tags: ['ne-tranh', 'adversarial'],
          q: 'Sắp xếp các bước của một tấn công blackbox dựa trên mô hình thay thế.',
          items: [
            'Thu thập dữ liệu công khai cùng miền, ví dụ bộ đặc trưng PE của EMBER',
            'Huấn luyện mô hình thay thế của riêng kẻ tấn công trên dữ liệu đó',
            'Sinh mẫu né tránh trên mô hình thay thế ở chế độ whitebox, hoàn toàn ngoại tuyến',
            'Kiểm tra mẫu vẫn giữ được chức năng độc hại sau khi biến đổi',
            'Gửi một số ít mẫu tới hệ thống thật và giữ lại những mẫu lọt qua',
          ],
          why: 'Điểm cần nhớ là **ba bước đầu hoàn toàn vô hình với bạn**: không có truy vấn nào tới hệ thống của bạn, nên không log nào ghi lại, không luật tần suất nào kêu. Bước kiểm tra chức năng nằm trước bước bắn thử vì một mẫu lọt qua nhưng không chạy được thì vô giá trị với kẻ tấn công — và đây cũng là bước mà tài liệu đối kháng của thị giác máy tính không có. Hệ quả phòng thủ: cần đa dạng hoá họ đặc trưng và phòng thủ nhiều tầng, chứ không chỉ giám sát truy vấn.',
        },
        {
          id: 't8l2-q3',
          kind: 'multi',
          tags: ['ne-tranh', 'dac-trung'],
          q: 'Đặc trưng nào kẻ tấn công thao túng được với chi phí gần bằng không trên một tệp PE? (Chọn tất cả)',
          options: [
            'Entropy toàn cục của tệp',
            'Tổng kích thước tệp',
            'Số tệp bị ghi đè khi chạy trong sandbox',
            'Số mục nhập trong bảng import',
          ],
          answers: [0, 1, 3],
          why: 'Entropy toàn cục và kích thước tệp đổi được chỉ bằng cách nối thêm dữ liệu vào cuối tệp — phần đó không được nạp vào bộ nhớ nên chương trình chạy y nguyên. Bảng import thì thêm mục thừa tuỳ ý, chưa kể kẻ tấn công còn giấu được import thật bằng phân giải động lúc chạy. Ngược lại, **số tệp bị ghi đè khi chạy** phản ánh hành vi thật: muốn giảm con số đó thì phải giảm chính hành vi mã hoá dữ liệu — tức là từ bỏ mục tiêu. Đó là lý do đặc trưng động đắt hơn nhiều để lách, dù bản thân sandbox cũng có điểm yếu riêng là bị phát hiện và né.',
        },
        {
          id: 't8l2-q4',
          kind: 'truefalse',
          tags: ['ne-tranh'],
          q: 'Chuyển từ mạng nơ-ron sang LightGBM giúp mô hình miễn nhiễm với mẫu đối kháng vì cây không có gradient.',
          answer: false,
          why: 'Không có gradient chỉ nghĩa là kẻ tấn công **đổi công cụ**, không nghĩa là hết đường. Với mô hình cây, họ dùng tìm kiếm rời rạc: thử từng ngưỡng chia, hoặc dùng thuật toán tiến hoá, hoặc đơn giản là quét từng đặc trưng như đoạn mã phòng thủ trong bài. Trên vài trăm đặc trưng thì việc đó rất rẻ. Thậm chí cây còn có một điểm yếu riêng: quyết định của nó là **hàm bậc thang**, nên chỉ cần vượt đúng một ngưỡng chia là nhãn lật — kẻ tấn công không cần đi xa, chỉ cần đi đúng chỗ.',
        },
        {
          id: 't8l2-q5',
          kind: 'input',
          tags: ['ne-tranh', 'adversarial'],
          q: 'Hiện tượng một mẫu đối kháng sinh trên mô hình này vẫn đánh lừa được mô hình khác gọi là gì (tiếng Anh)?',
          accept: ['transferability', 'transfer', 'tinh chuyen giao', 'chuyen giao', 'transferable'],
          placeholder: 'Một từ tiếng Anh…',
          hint: 'Danh từ, gốc từ động từ nghĩa là "chuyển sang".',
          why: 'Transferability (tính chuyển giao) là lý do khiến việc giấu kín mô hình không đủ để bảo vệ nó. Nguyên nhân sâu xa được cho là các mô hình khác nhau khi học trên cùng phân phối dữ liệu sẽ học được những đặc trưng phân biệt tương tự nhau, nên ranh giới quyết định của chúng gần nhau ở nhiều vùng. Hệ quả thực tế: hai biện pháp có tác dụng là **đa dạng hoá họ đặc trưng** (tĩnh, động, mạng, uy tín) và **không dùng chung kiến trúc lẫn dữ liệu với các mô hình công khai phổ biến nhất**.',
        },
      ],
      terms: ['mau-doi-khang', 'ne-tranh', 'doi-khang', 'ember', 'pe'],
      further: [
        {
          title: 'Explaining and Harnessing Adversarial Examples — Goodfellow, Shlens, Szegedy (2014)',
          note: 'Bài giới thiệu FGSM. Đọc để thấy mẫu đối kháng chỉ là hạ gradient chạy ngược, không có gì huyền bí.',
        },
        {
          title: 'Towards Deep Learning Models Resistant to Adversarial Attacks — Madry và cộng sự (2017)',
          note: 'Nguồn của PGD và của adversarial training. PGD tới nay vẫn là chuẩn tối thiểu để nói một phòng thủ đã được kiểm chứng.',
        },
        {
          title: 'Intriguing Properties of Adversarial ML Attacks in the Problem Space — Pierazzi và cộng sự, IEEE S&P (2020)',
          note: 'Tài liệu chuẩn về khoảng cách giữa không gian đặc trưng và không gian bài toán. Đọc nếu bạn làm mô hình trên tệp thật.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't8-l3',
      trackId: 'adversarial',
      title: 'Đầu độc dữ liệu và cửa hậu',
      subtitle: 'Kẻ tấn công không cần đánh lừa mô hình của bạn nếu họ dạy được nó ngay từ đầu.',
      minutes: 24,
      practiceMinutes: 7,
      level: 'nang-cao',
      prereqs: ['t8-l1'],
      why: {
        short:
          'Đầu độc là dạng tấn công duy nhất khiến mô hình sai vĩnh viễn theo đúng ý kẻ tấn công, và trong SOC nó có một đường vào mà hầu như không ai canh: chính những cái nhãn do analyst gán mỗi ngày.',
        scenario:
          'Đội bạn huấn luyện lại mô hình xếp hạng cảnh báo mỗi tuần, lấy nhãn từ kết quả xử lý của analyst trong SIEM: đóng với lý do "false positive" thành nhãn 0, leo thang thành nhãn 1. Một nhóm tấn công phát hiện ra điều đó và bắt đầu tạo ra hàng nghìn sự kiện vô hại nhưng mang đúng dấu hiệu của công cụ họ sắp dùng. Analyst đóng hàng loạt vì đúng là chúng vô hại. Sáu tuần sau, hành vi thật của họ được mô hình chấm điểm rất thấp.',
        roles: ['SOC Analyst', 'Detection Engineer', 'Security Data Scientist', 'ML Engineer'],
        costOfNotKnowing:
          'Bạn sẽ nhìn vào dashboard thấy mọi chỉ số đều tốt hơn: ít báo động giả hơn, analyst hài lòng hơn, thời gian xử lý giảm. Toàn bộ những cải thiện đó là dấu hiệu của cuộc tấn công đang thành công, và bạn không có một tín hiệu nào để phân biệt nó với việc mô hình thật sự tốt lên.',
      },
      objectives: [
        'Phân biệt đầu độc làm giảm chất lượng chung với đầu độc có mục tiêu và với cửa hậu',
        'Chỉ ra ít nhất bốn đường cấp dữ liệu trong một SOC mà kẻ tấn công ghi vào được',
        'Mô tả cơ chế tấn công vòng phản hồi nhãn và nêu ba tín hiệu để phát hiện nó',
        'Thiết kế được biện pháp bảo vệ quy trình huấn luyện lại: tập chuẩn sạch, hạn mức đóng góp, kiểm định trước khi phát hành',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bạn có 2 triệu mẫu huấn luyện, gắn nhãn cẩn thận. Một kẻ tấn công chỉ chèn thêm được **6.000 mẫu** vào đó, tức 0,3%. Theo bạn, mức đó có đủ để làm gì đáng kể không?',
          reveal:
            'Đủ, nếu họ chèn có chủ đích. Chìa khoá là **mục tiêu**: làm hỏng mô hình nói chung thì đúng là cần tỉ lệ lớn, nhưng làm mô hình sai ở **một vùng hẹp** thì chỉ cần đủ mẫu để lấp đầy vùng đó. Vùng đó có thể chỉ chứa vài trăm mẫu trong dữ liệu gốc, nên 6.000 mẫu là áp đảo tuyệt đối tại chỗ. Đây là điểm phản trực giác quan trọng nhất của bài: **đầu độc có mục tiêu rẻ hơn đầu độc toàn cục nhiều bậc**, và nó cũng khó phát hiện hơn nhiều vì mọi chỉ số tổng thể — accuracy, AUC, log loss — đều không nhúc nhích. Bạn đo trên toàn tập, còn kẻ tấn công chỉ quan tâm 0,01% của tập đó.',
        },
        {
          t: 'p',
          md: '**Đầu độc dữ liệu** (data poisoning) là tác động vào dữ liệu hoặc nhãn dùng để huấn luyện, sao cho mô hình sinh ra hành xử theo ý kẻ tấn công. Khác với né tránh, hậu quả nằm sẵn trong trọng số: bạn không "chặn" được nó lúc chạy, vì mô hình đang làm đúng những gì nó đã học.',
        },
        { t: 'h', text: 'Ba loại đầu độc, ba mức nguy hiểm khác nhau', level: 2 },
        {
          t: 'table',
          caption: 'Phân loại đầu độc theo mục tiêu — chú ý cột cuối cùng',
          head: ['Loại', 'Kẻ tấn công muốn gì', 'Tỉ lệ dữ liệu cần', 'Chỉ số tổng thể có phát hiện được không?'],
          rows: [
            [
              'Đầu độc phá hoại (availability)',
              'Làm mô hình sai chung, ép đội vận hành tắt nó đi',
              'Cao — thường vài phần trăm trở lên',
              'CÓ. Accuracy và AUC tụt rõ, dễ thấy ngay',
            ],
            [
              'Đầu độc có mục tiêu (targeted)',
              'Làm mô hình sai trên một nhóm mẫu cụ thể, giữ nguyên phần còn lại',
              'Rất thấp — đủ để áp đảo vùng hẹp đó',
              'KHÔNG. Chỉ số tổng thể gần như không đổi',
            ],
            [
              'Cửa hậu (backdoor)',
              'Cấy một dấu hiệu kích hoạt: mọi mẫu mang dấu đó đều bị chấm là lành',
              'Rất thấp, nhưng cần kiểm soát được nội dung mẫu',
              'KHÔNG. Mô hình hoàn hảo trên mọi dữ liệu không mang dấu kích hoạt',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao cửa hậu là loại đáng sợ nhất',
          md: 'Với cửa hậu, kẻ tấn công có một **công tắc**. Mô hình hoạt động hoàn hảo trong mọi bài kiểm tra bạn nghĩ ra — vì mọi bài kiểm tra của bạn đều không chứa dấu kích hoạt. Đến khi họ cần đi qua, họ gắn dấu đó vào và mô hình mở cửa.\n\nÝ tưởng này được trình bày rõ ràng lần đầu trong nghiên cứu BadNets (Gu, Dolan-Gavitt, Garg, 2017) trên ảnh: một ô vuông nhỏ ở góc ảnh biến biển "STOP" thành biển giới hạn tốc độ, trong khi độ chính xác trên ảnh sạch không đổi. Chuyển sang bảo mật, dấu kích hoạt có thể là một tên section hiếm gặp, một chuỗi trong resource, một thứ tự header HTTP đặc thù — bất cứ thứ gì kẻ tấn công gắn được vào mẫu của họ mà bạn không có lý do gì để nghi ngờ.',
        },
        { t: 'h', text: 'Kẻ tấn công ghi vào dữ liệu của bạn bằng đường nào', level: 2 },
        {
          t: 'list',
          items: [
            '**Nền tảng chia sẻ mẫu công khai.** Kho mẫu đa engine, sandbox công cộng, feed threat intel cộng đồng — ai cũng nộp được, và rất nhiều pipeline huấn luyện lấy dữ liệu trực tiếp từ đó.',
            '**Honeypot và cảm biến mở.** Nếu bạn học "hành vi bình thường" từ dữ liệu thu ở cảm biến mà Internet chạm tới được thì kẻ tấn công dạy được cho bạn thế nào là bình thường.',
            '**Telemetry từ máy khách.** Sản phẩm bảo mật gửi telemetry về để huấn luyện. Khi kẻ tấn công kiểm soát một số máy, họ kiểm soát luôn một phần dữ liệu huấn luyện của bạn.',
            '**Kho mô hình và gói phần mềm.** Tải trọng số từ kho công khai là nhận cả những gì người khác đã huấn luyện vào đó. Ngoài rủi ro cửa hậu, định dạng lưu trữ dạng pickle của Python còn cho phép thực thi mã ngay lúc nạp — đây là lỗ hổng chuỗi cung ứng, không phải lỗ hổng ML.',
            '**Dữ liệu web quy mô lớn.** Carlini và cộng sự (2023) chỉ ra rằng việc đầu độc các bộ dữ liệu web khổng lồ là khả thi trong thực tế, chỉ bằng cách mua lại tên miền hết hạn nằm trong danh sách URL, hoặc sửa nội dung đúng vào thời điểm bộ dữ liệu được thu thập.',
            '**Vòng phản hồi nhãn của chính SOC bạn.** Đường nguy hiểm nhất, và là phần còn lại của bài này.',
          ],
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't8l3-cp1',
              kind: 'mcq',
              tags: ['dau-doc', 'backdoor'],
              q: 'Sau khi huấn luyện lại, mô hình của bạn có AUC 0,981 so với 0,980 tuần trước, log loss không đổi, phân phối điểm số nhìn y hệt. Kết luận nào đúng?',
              options: [
                'Không có dấu hiệu đầu độc, vì mọi chỉ số đều ổn định',
                'Các chỉ số này không loại trừ được đầu độc có mục tiêu hay cửa hậu, vì cả hai đều được thiết kế để giữ chỉ số tổng thể không đổi',
                'Chỉ số ổn định chứng tỏ dữ liệu huấn luyện không thay đổi',
                'Cần tăng ngưỡng cảnh báo vì mô hình đã tốt lên',
              ],
              answer: 1,
              why: 'Đây là bài học vận hành đắt nhất của cả bài. Chỉ số tổng thể tính trung bình trên toàn tập, mà đầu độc có mục tiêu chỉ động tới một vùng cực nhỏ — hiệu ứng của nó bị pha loãng tới mức không nhìn thấy. Với cửa hậu còn tệ hơn: mô hình **thật sự** hoàn hảo trên mọi dữ liệu không mang dấu kích hoạt, nên không có chỉ số tổng thể nào có thể phát hiện. Muốn thấy, bạn cần đo trên **tập chuẩn sạch cố định** (golden set) theo từng nhóm mẫu, và theo dõi độ trôi của điểm số trên từng nhóm chứ không chỉ trung bình.',
              distractorWhy: [
                'Chỉ số tổng thể ổn định là điều kẻ tấn công có mục tiêu chủ động nhắm tới.',
                '',
                'Chỉ số đầu ra ổn định không nói gì về việc dữ liệu đầu vào có thay đổi hay không.',
                'Chênh lệch 0,001 AUC nằm trong nhiễu thống kê, không phải căn cứ để đổi ngưỡng.',
              ],
            },
          ],
        },
        { t: 'h', text: 'Tấn công vào vòng phản hồi — phần quan trọng nhất với SOC', level: 2 },
        {
          t: 'p',
          md: 'Gần như mọi hệ thống ML trong SOC đều học từ chính công việc của analyst. Cảnh báo được đóng với lý do "báo động giả" trở thành nhãn âm; cảnh báo được leo thang trở thành nhãn dương. Nghe rất hợp lý, và nó đúng là cách rẻ nhất để có nhãn.',
        },
        {
          t: 'p',
          md: 'Nhưng hãy nhìn kỹ chuỗi nhân quả: **kẻ tấn công tạo ra sự kiện → sự kiện thành cảnh báo → analyst gán nhãn → nhãn vào tập huấn luyện → mô hình học.** Kẻ tấn công đứng ở đầu chuỗi. Họ không cầm bút, nhưng họ chọn được analyst sẽ phải viết về cái gì.',
        },
        {
          t: 'steps',
          title: 'Cơ chế một cuộc tấn công vòng phản hồi, mức khái niệm',
          steps: [
            {
              title: 'Bước 1 — Xác định mô hình có học từ nhãn của analyst không',
              md: 'Không cần truy cập nội bộ. Chỉ cần quan sát: cùng một hành vi hôm nay bị chặn, ba tuần sau không bị chặn nữa, trong khi không có bản vá nào công bố. Hoặc đơn giản hơn: đọc tài liệu tiếp thị của sản phẩm bạn đang dùng, nơi ghi rõ "mô hình tự học từ phản hồi của bạn".',
            },
            {
              title: 'Bước 2 — Tạo nhiều sự kiện vô hại nhưng mang dấu hiệu của công cụ sẽ dùng',
              md: 'Điểm tinh vi nằm ở chỗ **các sự kiện này thật sự vô hại**. Chúng chỉ chia sẻ những đặc trưng mà mô hình dùng để nhận diện công cụ tấn công: cùng kiểu chuỗi tham số, cùng nhịp thời gian, cùng dạng tên tiến trình cha. Analyst điều tra và kết luận đúng: không có gì xấu. Nhãn âm được gán một cách hoàn toàn chính đáng.',
            },
            {
              title: 'Bước 3 — Nâng khối lượng để kích hoạt hành vi đóng hàng loạt',
              md: 'Khi cùng một loại cảnh báo xuất hiện hàng trăm lần mỗi ngày và lần nào cũng vô hại, SOC nào cũng sẽ làm một trong hai việc: đóng hàng loạt bằng quy tắc, hoặc viết luật loại trừ. Cả hai đều tạo ra một khối nhãn âm đồng nhất, đúng vào vùng đặc trưng mà kẻ tấn công quan tâm. Đây chính là **mệt mỏi vì cảnh báo bị vũ khí hoá**.',
            },
            {
              title: 'Bước 4 — Chờ chu kỳ huấn luyện lại',
              md: 'Mô hình học rằng vùng đặc trưng đó là lành. Ranh giới quyết định lùi lại. Và bây giờ hành vi thật — vốn nằm trong cùng vùng đó — được chấm điểm thấp.',
            },
            {
              title: 'Bước 5 — Vì sao bạn không thấy gì bất thường',
              md: 'Từ góc nhìn của bạn, mọi thứ đều tốt lên: số báo động giả giảm, analyst đỡ quá tải, thời gian xử lý trung bình giảm. Không có chỉ số nào đỏ. Đây là lý do phải có tín hiệu chuyên biệt cho chính đường này, chứ không thể trông vào dashboard chung.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Ba tín hiệu để phát hiện đầu độc qua vòng phản hồi',
          md: '**1. Cụm nhãn âm đồng nhất tăng đột biến.** Phân cụm các cảnh báo bị đóng là "false positive" theo vector đặc trưng. Một cụm chặt, mới xuất hiện, chiếm tỉ lệ lớn trong nhãn âm mới là dấu hiệu đáng điều tra — dù mỗi cảnh báo trong đó đều thật sự vô hại.\n\n**2. Nhãn âm tập trung bất thường theo nguồn.** Nếu 70% nhãn âm mới của tuần này đến từ một dải IP, một tài khoản, một máy chủ, thì kể cả khi kết luận của analyst đúng, **trọng số** của nguồn đó trong dữ liệu huấn luyện là không lành mạnh.\n\n**3. Ranh giới dịch chuyển trên tập chuẩn sạch.** Giữ một tập mẫu tấn công đã xác nhận, cố định, không bao giờ đưa vào huấn luyện. Sau mỗi lần huấn luyện lại, chấm điểm tập đó. Điểm trung bình của nhóm nào tụt đáng kể chính là vùng đang bị đẩy lùi.',
        },
        {
          t: 'lab',
          id: 'lab-poison',
          intro:
            'Lật nhãn của một tỉ lệ nhỏ mẫu và xem ranh giới quyết định dịch chuyển. Hãy thử hai kịch bản khác nhau: lật nhãn **ngẫu nhiên** trên toàn tập, rồi lật nhãn **tập trung** vào một vùng hẹp. So sánh xem cần bao nhiêu phần trăm ở mỗi kịch bản để đạt cùng hiệu quả tại vùng mục tiêu, và để ý accuracy tổng thể thay đổi thế nào trong từng trường hợp.',
        },
        {
          t: 'compare',
          title: 'Hai chiến lược đầu độc, hai bài toán phòng thủ khác nhau',
          left: {
            title: 'Lật nhãn ngẫu nhiên trên toàn tập',
            icon: 'flame',
            items: [
              'Cần tỉ lệ cao, thường vài phần trăm trở lên mới có tác dụng rõ',
              'Accuracy và AUC tổng thể tụt thấy rõ',
              'Phát hiện được bằng giám sát chỉ số thông thường',
              'Chủ yếu gây phiền toái, ít khi là mục tiêu của kẻ tấn công có kỹ năng',
              'Phòng thủ: kiểm định chỉ số trước khi phát hành mô hình mới',
            ],
          },
          right: {
            title: 'Đầu độc tập trung vào một vùng hẹp',
            icon: 'target',
            items: [
              'Cần rất ít mẫu, miễn là đủ áp đảo vùng đó',
              'Chỉ số tổng thể gần như không đổi — đây là điểm mấu chốt',
              'Không phát hiện được bằng giám sát chỉ số thông thường',
              'Là dạng mà kẻ tấn công thật sự dùng',
              'Phòng thủ: tập chuẩn sạch chấm điểm theo từng nhóm, nguồn gốc dữ liệu, hạn mức đóng góp trên mỗi nguồn',
            ],
          },
        },
        {
          t: 'checklist',
          title: 'Bảo vệ quy trình huấn luyện lại — mang đi dùng được ngay',
          items: [
            'Giữ một tập chuẩn sạch cố định, do người tin cậy gắn nhãn, KHÔNG BAO GIỜ đưa vào huấn luyện, và chấm điểm nó theo từng nhóm mẫu sau mỗi lần huấn luyện lại',
            'Ghi nguồn gốc cho từng mẫu và từng nhãn: ai gán, lúc nào, dựa trên bằng chứng gì — không có nguồn gốc thì không điều tra được khi có sự cố',
            'Đặt hạn mức đóng góp: không nguồn dữ liệu nào, không tài khoản nào được vượt quá một tỉ lệ nhất định trong tập huấn luyện của một chu kỳ',
            'Phân cụm nhãn âm mới mỗi tuần và soi các cụm chặt, mới xuất hiện, tăng nhanh',
            'Với nhãn từ vòng phản hồi, tách riêng nhãn "đóng hàng loạt" khỏi nhãn "đã điều tra từng cái" và cho chúng trọng số khác nhau',
            'So sánh mô hình mới với mô hình cũ trên cùng dữ liệu trước khi phát hành, và giữ đường quay lui nhanh',
            'Ký số artefact mô hình và kiểm tra chữ ký lúc nạp; không nạp trọng số từ nguồn không kiểm chứng, đặc biệt là định dạng cho phép thực thi mã lúc giải tuần tự',
          ],
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'Bài học lịch sử: một vòng phản hồi mở là một vòng phản hồi bị chiếm',
          md: 'Tháng 3 năm 2016, Microsoft phát hành chatbot Tay trên Twitter với cơ chế học từ tương tác của người dùng. Trong vòng chưa đầy 24 giờ, một nhóm người dùng phối hợp bơm nội dung độc hại vào các cuộc trò chuyện, và Tay bắt đầu lặp lại chúng. Microsoft phải gỡ bỏ.\n\nĐây không phải chuyện của chatbot. Đây là chuyện của **mọi hệ thống học trực tuyến từ đầu vào không tin cậy**, kể cả mô hình xếp hạng cảnh báo trong SOC của bạn. Nguyên tắc rút ra: nếu đầu vào của vòng phản hồi do bên ngoài quyết định thì vòng phản hồi đó cần có hạn mức, có kiểm duyệt, và có một tập chuẩn sạch để đối chiếu.',
        },
        {
          t: 'callout',
          kind: 'ethics',
          title: 'Kiểm thử đầu độc phải có ranh giới rõ ràng',
          md: 'Việc thử nghiệm đầu độc chỉ được thực hiện trên **bản sao ngoại tuyến** của pipeline huấn luyện, với dữ liệu của chính tổ chức bạn, và phải được ghi vào phạm vi kiểm thử bằng văn bản.\n\nTuyệt đối không thử đầu độc vào **hệ thống dùng chung của cộng đồng**: nộp mẫu sai lệch lên nền tảng đa engine hay feed threat intel công cộng làm hỏng dữ liệu của tất cả mọi người, có thể vi phạm điều khoản dịch vụ, và trong nhiều trường hợp là hành vi phá hoại có thể bị truy cứu.\n\nKhi kiểm thử vòng phản hồi trong SOC của chính bạn, hãy báo trước cho trưởng ca và đánh dấu rõ các sự kiện thử nghiệm để chúng được loại khỏi dữ liệu huấn luyện sau khi kết thúc.',
        },
        {
          t: 'terms',
          ids: ['dau-doc', 'backdoor', 'alert-fatigue', 'bao-dong-gia', 'weak-supervision'],
        },
      ],
      keyTakeaways: [
        'Đầu độc có mục tiêu và cửa hậu được thiết kế để chỉ số tổng thể không đổi — giám sát AUC và accuracy không phát hiện được chúng.',
        'Đầu độc một vùng hẹp rẻ hơn đầu độc toàn cục nhiều bậc, vì chỉ cần áp đảo số mẫu ít ỏi có sẵn trong vùng đó.',
        'Cửa hậu cho kẻ tấn công một công tắc: mô hình hoàn hảo trên mọi dữ liệu không mang dấu kích hoạt.',
        'Trong SOC, đường đầu độc nguy hiểm nhất là vòng phản hồi: kẻ tấn công tạo sự kiện, analyst gán nhãn, nhãn vào tập huấn luyện.',
        'Đầu độc vòng phản hồi làm mọi chỉ số vận hành TỐT LÊN, nên phải có tín hiệu chuyên biệt: cụm nhãn âm đồng nhất, tập trung theo nguồn, và điểm số tụt trên tập chuẩn sạch.',
        'Ba biện pháp nền tảng: tập chuẩn sạch không bao giờ dùng để huấn luyện, ghi nguồn gốc từng nhãn, và hạn mức đóng góp trên mỗi nguồn dữ liệu.',
      ],
      cards: [
        {
          id: 't8l3-c1',
          front: 'Vì sao giám sát AUC và accuracy không phát hiện được đầu độc có mục tiêu?',
          back: 'Vì các chỉ số đó lấy trung bình trên toàn tập, còn đầu độc có mục tiêu chỉ động tới một vùng cực nhỏ. Hiệu ứng bị pha loãng tới mức nằm trong nhiễu thống kê.',
          tags: ['dau-doc'],
        },
        {
          id: 't8l3-c2',
          front: 'Cửa hậu (backdoor) trong mô hình khác đầu độc thông thường ở điểm nào?',
          back: 'Cửa hậu gắn hành vi sai vào một dấu kích hoạt do kẻ tấn công chọn. Không có dấu đó, mô hình hoạt động hoàn hảo — nên mọi bài kiểm tra thông thường đều qua.',
          tags: ['backdoor'],
        },
        {
          id: 't8l3-c3',
          front: 'Mô tả chuỗi nhân quả của tấn công đầu độc qua vòng phản hồi trong SOC.',
          back: 'Kẻ tấn công tạo sự kiện vô hại mang dấu hiệu công cụ của họ, sự kiện thành cảnh báo, analyst đóng là false positive, nhãn âm vào tập huấn luyện, mô hình học rằng vùng đó là lành.',
          tags: ['dau-doc', 'alert-fatigue'],
        },
        {
          id: 't8l3-c4',
          front: 'Vì sao tập chuẩn sạch (golden set) không bao giờ được đưa vào huấn luyện?',
          back: 'Vì nó là thước đo độc lập duy nhất còn lại khi dữ liệu huấn luyện đã bị nghi ngờ. Đưa vào huấn luyện là mất khả năng phát hiện ranh giới đang bị đẩy lùi ở vùng nào.',
          tags: ['dau-doc'],
        },
        {
          id: 't8l3-c5',
          front: 'Nêu ba tín hiệu phát hiện đầu độc qua vòng phản hồi nhãn.',
          back: 'Cụm nhãn âm đồng nhất mới xuất hiện và tăng nhanh; nhãn âm tập trung bất thường vào một nguồn; điểm số tụt trên một nhóm cụ thể của tập chuẩn sạch sau khi huấn luyện lại.',
          tags: ['dau-doc'],
        },
      ],
      quiz: [
        {
          id: 't8l3-q1',
          kind: 'mcq',
          tags: ['dau-doc'],
          q: 'Kẻ tấn công muốn mô hình phát hiện của bạn bỏ qua đúng một họ công cụ, đồng thời không bị bạn phát hiện. Chiến lược nào phù hợp nhất với họ?',
          options: [
            'Lật nhãn của 10% mẫu chọn ngẫu nhiên trong toàn bộ tập huấn luyện',
            'Chèn một lượng nhỏ mẫu vô hại mang đặc trưng giống họ công cụ đó và để chúng được gắn nhãn âm',
            'Gửi thật nhiều mẫu độc hại rõ ràng để mô hình quá tải',
            'Thay đổi kiến trúc mô hình từ cây tăng cường sang mạng nơ-ron',
          ],
          answer: 1,
          why: 'Đây là đầu độc **có mục tiêu**, và nó thoả mãn cả hai yêu cầu. Về hiệu quả: vùng đặc trưng quanh họ công cụ đó vốn chỉ có ít mẫu, nên một lượng nhỏ mẫu mới đã đủ áp đảo cục bộ. Về tàng hình: mọi chỉ số tổng thể giữ nguyên, và từng mẫu chèn vào **thật sự vô hại** nên analyst gán nhãn âm một cách hoàn toàn chính đáng — không có ai làm sai để bạn phát hiện. Chỉ có tập chuẩn sạch chấm theo từng nhóm mới thấy được điều gì đang xảy ra.',
          distractorWhy: [
            'Lật 10% ngẫu nhiên làm chỉ số tổng thể tụt rõ, tức là tự báo động — trái với yêu cầu tàng hình.',
            '',
            'Gửi nhiều mẫu độc rõ ràng chỉ củng cố thêm nhãn dương, đi ngược mục tiêu của kẻ tấn công.',
            'Kẻ tấn công bên ngoài không chọn được kiến trúc mô hình của bạn.',
          ],
        },
        {
          id: 't8l3-q2',
          kind: 'multi',
          tags: ['dau-doc', 'quy-trinh'],
          q: 'Biện pháp nào thật sự giúp chống đầu độc qua vòng phản hồi? (Chọn tất cả)',
          options: [
            'Giữ tập chuẩn sạch cố định và chấm điểm theo từng nhóm sau mỗi lần huấn luyện lại',
            'Đặt hạn mức tỉ lệ đóng góp tối đa cho mỗi nguồn dữ liệu trong một chu kỳ huấn luyện',
            'Tăng số lượng mẫu huấn luyện lên gấp đôi mỗi quý',
            'Phân cụm các cảnh báo bị đóng là false positive và soi những cụm chặt mới xuất hiện',
          ],
          answers: [0, 1, 3],
          why: 'Ba biện pháp đúng đều tấn công vào cùng một điểm yếu của kẻ tấn công: họ cần **tập trung** ảnh hưởng vào một vùng hẹp. Tập chuẩn sạch phát hiện sự dịch chuyển tại vùng đó; hạn mức đóng góp giới hạn trần ảnh hưởng của một nguồn; phân cụm nhãn âm làm lộ ra chính sự tập trung ấy. Ngược lại, **tăng lượng dữ liệu** không giúp gì: kẻ tấn công cũng chỉ cần tăng lượng mẫu chèn theo tỉ lệ, mà chi phí của họ thấp hơn chi phí thu thập và gắn nhãn của bạn nhiều lần.',
        },
        {
          id: 't8l3-q3',
          kind: 'truefalse',
          tags: ['backdoor'],
          q: 'Nếu mô hình đạt độ chính xác 99,2% trên tập kiểm tra độc lập thì có thể loại trừ khả năng nó chứa cửa hậu.',
          answer: false,
          why: 'Cửa hậu được thiết kế để **không** ảnh hưởng tới hành vi trên dữ liệu sạch. Mô hình có cửa hậu vẫn đạt đúng độ chính xác như mô hình bình thường trên mọi tập kiểm tra không chứa dấu kích hoạt — mà tập kiểm tra của bạn thì tất nhiên không chứa, vì bạn không biết dấu đó là gì. Đây là lý do phòng thủ trước cửa hậu phải chuyển sang hướng khác hẳn: kiểm soát nguồn gốc của dữ liệu và của artefact mô hình, ký số, và với mô hình tải từ bên ngoài thì coi như thành phần chuỗi cung ứng không tin cậy.',
        },
        {
          id: 't8l3-q4',
          kind: 'order',
          tags: ['dau-doc', 'alert-fatigue'],
          q: 'Sắp xếp các giai đoạn của một cuộc tấn công đầu độc qua vòng phản hồi nhãn.',
          items: [
            'Xác định mô hình có học từ nhãn do analyst gán hay không',
            'Tạo nhiều sự kiện vô hại nhưng mang đặc trưng của công cụ sẽ dùng về sau',
            'Nâng khối lượng để SOC chuyển sang đóng hàng loạt hoặc viết luật loại trừ',
            'Chờ chu kỳ huấn luyện lại hấp thụ khối nhãn âm mới',
            'Thực hiện hành vi tấn công thật và được mô hình chấm điểm thấp',
          ],
          why: 'Chuỗi này đáng nhớ vì hai lý do. **Một**, không có bước nào đòi hỏi kẻ tấn công xâm nhập vào hệ thống của bạn — toàn bộ diễn ra qua giao diện mà bạn cố tình để mở. **Hai**, ở mỗi bước, hành động của phía bạn đều **đúng**: analyst kết luận đúng vì mẫu thật sự vô hại, việc đóng hàng loạt là phản ứng hợp lý trước khối lượng, và huấn luyện lại theo lịch là thực hành tốt. Một cuộc tấn công mà mọi người đều làm đúng phần việc của mình thì chỉ có thể chặn bằng cách thay đổi **thiết kế quy trình**, không phải bằng cách nhắc nhở cẩn thận hơn.',
        },
      ],
      terms: ['dau-doc', 'backdoor', 'alert-fatigue', 'bao-dong-gia', 'weak-supervision'],
      further: [
        {
          title: 'BadNets: Identifying Vulnerabilities in the Machine Learning Model Supply Chain — Gu, Dolan-Gavitt, Garg (2017)',
          note: 'Bài đặt nền cho khái niệm cửa hậu trong mô hình. Đọc để thấy vì sao độ chính xác trên dữ liệu sạch không nói lên điều gì về cửa hậu.',
        },
        {
          title: 'Poisoning Web-Scale Training Datasets is Practical — Carlini và cộng sự (2023)',
          note: 'Chứng minh đầu độc bộ dữ liệu web quy mô lớn khả thi với chi phí thấp. Đọc trước khi bạn quyết định lấy dữ liệu huấn luyện từ nguồn công khai.',
        },
        {
          title: 'MITRE ATLAS — chiến thuật Poison Training Data và các case study liên quan',
          note: 'Dùng để ánh xạ rủi ro đầu độc của hệ thống bạn vào ngôn ngữ chuẩn khi viết báo cáo cho lãnh đạo.',
          url: 'https://atlas.mitre.org/',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't8-l4',
      trackId: 'adversarial',
      title: 'Trộm mô hình và rò rỉ dữ liệu huấn luyện',
      subtitle: 'Mỗi lần trả lời một truy vấn, mô hình của bạn cho đi một chút chính nó — và một chút dữ liệu đã dạy nó.',
      minutes: 23,
      practiceMinutes: 3,
      level: 'nang-cao',
      prereqs: ['t8-l2'],
      why: {
        short:
          'Một mô hình bị sao chép là một mô hình đã trở thành whitebox với kẻ tấn công, và mọi phòng thủ dựa trên việc giữ bí mật mô hình sụp đổ cùng lúc.',
        scenario:
          'Đội sản phẩm muốn mở API chấm điểm rủi ro cho khách hàng doanh nghiệp, trả về điểm số dạng số thực bốn chữ số thập phân kèm ba đặc trưng đóng góp lớn nhất, vì "khách hàng cần hiểu vì sao bị chặn". Bạn được hỏi ý kiến bảo mật trong 24 giờ. Bạn cần nói được: cái gì rò ra, với bao nhiêu truy vấn, và đổi thiết kế thế nào để vẫn giữ được giá trị cho khách hàng.',
        roles: ['AI Security Engineer', 'Security Architect', 'ML Engineer', 'GRC / Compliance'],
        costOfNotKnowing:
          'Bạn mở API rồi phát hiện sáu tháng sau rằng một đối thủ đang bán sản phẩm có hành vi giống hệt, hoặc tệ hơn: tập dữ liệu huấn luyện chứa danh sách khách hàng từng bị xâm nhập bị moi ra qua chính API đó, và bạn phải đi báo cáo vi phạm dữ liệu cá nhân.',
      },
      objectives: [
        'Phân biệt bốn tấn công riêng tư: trộm mô hình, suy luận thành viên, đảo ngược mô hình, trích xuất dữ liệu ghi nhớ',
        'Ước lượng mức độ rò rỉ theo dạng đầu ra API: nhãn, điểm số, hay điểm số kèm giải thích',
        'Giải thích riêng tư vi phân bằng lời và nêu đúng cái giá của nó trên dữ liệu bảo mật',
        'Đề xuất được ba biện pháp giảm rò rỉ cho một API chấm điểm mà không phá giá trị nghiệp vụ',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Hai API cùng một mô hình. API A trả về nhãn "chặn / cho qua". API B trả về điểm số 0,8734. Theo bạn, để dựng lại một bản sao mô hình đủ tốt, kẻ tấn công cần số truy vấn ở API B ít hơn API A khoảng bao nhiêu lần: 2 lần, 10 lần, hay nhiều hơn nữa?',
          reveal:
            'Nhiều hơn nữa — thường là hàng chục lần, và với một số họ mô hình thì khác biệt còn lớn hơn về bản chất chứ không chỉ về số lượng. Lý do: mỗi truy vấn ở API A cho đúng **một bit** thông tin. Mỗi truy vấn ở API B cho một số thực, tức là hàng chục bit, và quan trọng hơn — nó cho biết **hướng** và **độ dốc**, nên kẻ tấn công leo dốc được thay vì mò mẫm. Tramèr và cộng sự (USENIX Security 2016) đã chỉ ra rằng với một số mô hình đơn giản như hồi quy logistic, số truy vấn cần thiết chỉ cỡ số tham số của mô hình, tức là **rất nhỏ**. Bài học thiết kế ngắn gọn: **mỗi chữ số thập phân bạn trả ra là một món quà.**',
        },
        {
          t: 'p',
          md: 'Chặng này tới giờ đều nói về việc kẻ tấn công **đi qua** mô hình. Bài này nói về việc họ **lấy đi** thứ gì đó: bản thân mô hình, hoặc dữ liệu đã dùng để huấn luyện nó. Cả hai đều là tài sản, và cả hai đều rò qua đúng một cái vòi: đầu ra của API.',
        },
        { t: 'h', text: 'Bốn tấn công, xếp theo thứ tự bạn sẽ gặp', level: 2 },
        {
          t: 'table',
          caption: 'Bốn tấn công vào tài sản của mô hình',
          head: ['Tấn công', 'Kẻ tấn công lấy được gì', 'Cần điều kiện gì', 'Hậu quả cụ thể'],
          rows: [
            [
              'Trộm mô hình (model extraction)',
              'Một bản sao có hành vi tương đương',
              'Nhiều truy vấn; dễ hơn nhiều nếu API trả điểm số',
              'Mất tài sản trí tuệ, và mô hình của bạn trở thành whitebox để họ luyện mẫu né tránh ngoại tuyến',
            ],
            [
              'Suy luận thành viên (membership inference)',
              'Câu trả lời cho câu hỏi: bản ghi X có nằm trong tập huấn luyện không',
              'Truy vấn được với mẫu cụ thể; mô hình quá khớp thì càng dễ',
              'Rò rỉ sự kiện riêng tư: khách hàng nào từng bị xâm nhập, người nào từng nằm trong danh sách điều tra',
            ],
            [
              'Đảo ngược mô hình (model inversion)',
              'Tái dựng gần đúng đặc trưng đại diện của một lớp hoặc một cá nhân',
              'Truy vấn nhiều lần cùng thông tin phụ về nạn nhân',
              'Khôi phục thuộc tính nhạy cảm từ mô hình tưởng là vô hại',
            ],
            [
              'Trích xuất dữ liệu ghi nhớ',
              'Chính chuỗi dữ liệu gốc mà mô hình đã học thuộc',
              'Mô hình sinh (generative), đặc biệt là mô hình ngôn ngữ lớn',
              'Rò khoá API, thông tin cá nhân, đoạn mã nội bộ nằm trong dữ liệu huấn luyện',
            ],
          ],
        },
        { t: 'h', text: 'Trộm mô hình: vì sao đây là vấn đề bảo mật chứ không chỉ là chuyện sở hữu trí tuệ', level: 2 },
        {
          t: 'p',
          md: 'Nhiều đội xếp trộm mô hình vào ô "rủi ro kinh doanh" rồi bỏ qua. Nhưng nhìn từ bài t8-l2, hậu quả kỹ thuật mới là phần nặng: khi kẻ tấn công có bản sao, họ **luyện mẫu né tránh trên bản sao đó, ngoại tuyến, không giới hạn số lần thử, và bạn không thấy một truy vấn nào**. Toàn bộ hệ thống giám sát truy vấn của bạn trở nên vô dụng.',
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'Một ví dụ thật được ghi trong ATLAS',
          md: 'Năm 2019, các nhà nghiên cứu chỉ ra rằng một hệ thống lọc email doanh nghiệp gắn điểm số của bộ phân loại vào **header của chính email** đi qua nó. Người nhận đọc được header, tức là đọc được điểm số cho từng email — một oracle miễn phí và hoàn toàn hợp lệ về mặt kỹ thuật. Từ dữ liệu đó, họ dựng được mô hình thay thế và tìm ra cách soạn email vượt qua bộ lọc. Vụ việc được cấp mã CVE-2019-20634 và nằm trong tập case study của MITRE ATLAS.\n\nBài học không phải là "đừng ghi header". Bài học là: **hãy liệt kê mọi kênh mà điểm số của mô hình rò ra ngoài** — header, mã lỗi, thời gian phản hồi, thứ tự sắp xếp kết quả, thông báo cho người dùng cuối. Mỗi kênh là một API bạn không biết mình đã mở.',
        },
        {
          t: 'compare',
          title: 'Thiết kế đầu ra API — mỗi mức chi tiết là một mức rò rỉ',
          left: {
            title: 'Ít rò rỉ',
            icon: 'lock',
            items: [
              'Chỉ trả nhãn: chặn / cho qua',
              'Hoặc trả nhóm rủi ro thô: thấp / trung bình / cao',
              'Giới hạn tốc độ theo tài khoản và theo tổ chức, có hạn mức ngày',
              'Ghi log toàn bộ truy vấn kèm định danh, giữ đủ lâu để điều tra',
              'Giải thích ở dạng lời khuyên hành động, không ở dạng trọng số đặc trưng',
            ],
          },
          right: {
            title: 'Rò rỉ nhiều',
            icon: 'key-round',
            items: [
              'Điểm số dạng số thực nhiều chữ số thập phân',
              'Vector xác suất đầy đủ cho mọi lớp',
              'Giá trị SHAP hoặc trọng số đóng góp của từng đặc trưng',
              'Không giới hạn tốc độ, hoặc giới hạn chỉ theo địa chỉ IP',
              'Thông báo lỗi mô tả chi tiết đặc trưng nào nằm ngoài phạm vi hợp lệ',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Đánh đổi khó chịu nhất của bài này',
          md: 'Khả năng giải thích (explainability) và khả năng chống trộm mô hình **đối nghịch trực tiếp** với nhau. Cùng một giá trị SHAP giúp analyst hiểu vì sao cảnh báo nổ, cũng chính là bản đồ chỉ cho kẻ tấn công biết cần sửa đặc trưng nào.\n\nĐừng cố giải bài toán này bằng cách chọn một bên. Hãy giải bằng cách **tách đối tượng**: analyst nội bộ đã xác thực thì nhận giải thích đầy đủ; người dùng bên ngoài nhận lý do ở mức nghiệp vụ ("tệp này có hành vi giống một họ mã độc đã biết") chứ không phải danh sách đặc trưng kèm trọng số. Đây cũng là câu trả lời bạn mang vào buổi họp trong phần tình huống ở đầu bài.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't8l4-cp1',
              kind: 'mcq',
              tags: ['model-extraction'],
              q: 'Vì sao trộm mô hình lại làm suy yếu các biện pháp phát hiện tấn công né tránh của bạn?',
              options: [
                'Vì bản sao mô hình có thể được dùng để làm quá tải API gốc',
                'Vì kẻ tấn công luyện mẫu né tránh trên bản sao ngoại tuyến, nên hệ thống của bạn không thấy truy vấn dò tìm nào',
                'Vì bản sao mô hình sẽ đưa ra kết quả khác mô hình gốc nên gây nhiễu số liệu',
                'Vì mô hình bị sao chép sẽ tự động mất hiệu lực chữ ký số',
              ],
              answer: 1,
              why: 'Đây là mắt xích nối bài t8-l2 với bài này. Phòng thủ dựa trên giám sát truy vấn — phát hiện chuỗi truy vấn rất giống nhau, phát hiện dò biên — chỉ hoạt động khi kẻ tấn công phải **hỏi bạn**. Khi họ đã có bản sao, toàn bộ giai đoạn thử và sai chuyển sang máy của họ, và bạn chỉ nhìn thấy đúng một truy vấn cuối cùng: mẫu đã hoàn thiện, đi thẳng qua. Nói cách khác, trộm mô hình biến một tấn công dựa trên truy vấn ồn ào thành một tấn công dựa trên chuyển giao im lặng.',
              distractorWhy: [
                'Quá tải là bài toán khả dụng, không liên quan tới cơ chế né tránh.',
                '',
                'Bản sao không cần giống hệt; nó chỉ cần đủ giống để mẫu chuyển giao được.',
                'Chữ ký số của artefact không bị ảnh hưởng bởi việc mô hình bị sao chép hành vi.',
              ],
            },
          ],
        },
        { t: 'h', text: 'Rò rỉ dữ liệu huấn luyện: khi mô hình nhớ quá kỹ', level: 2 },
        {
          t: 'p',
          md: '**Suy luận thành viên** (membership inference) trả lời câu hỏi: bản ghi cụ thể này có nằm trong tập huấn luyện không? Shokri và cộng sự (2017) chỉ ra rằng chỉ cần đầu ra của API là đủ, dựa trên một quan sát đơn giản: mô hình thường **tự tin hơn** trên dữ liệu nó đã thấy khi huấn luyện so với dữ liệu mới.',
        },
        {
          t: 'p',
          md: 'Trong bảo mật, câu trả lời đó có thể chính là bí mật. Nếu tập huấn luyện của bạn gồm "các tổ chức đã bị xâm nhập trong 12 tháng qua" thì việc xác nhận một tổ chức có mặt trong đó là rò rỉ nghiêm trọng — với hậu quả pháp lý và hợp đồng, không chỉ kỹ thuật.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Quá khớp và rò rỉ riêng tư là cùng một hiện tượng nhìn từ hai phía',
          md: 'Mô hình càng quá khớp thì khoảng cách giữa hành vi trên dữ liệu đã thấy và dữ liệu mới càng lớn — mà đúng khoảng cách đó là thứ tấn công suy luận thành viên khai thác.\n\nHệ quả rất thực dụng: **mọi biện pháp chống quá khớp bạn đã học đều là biện pháp giảm rò rỉ riêng tư**. Regularization, dừng sớm, tăng dữ liệu, giảm số vòng huấn luyện, kiểm định chéo trung thực. Bạn không cần công cụ mới để đi được nửa chặng đường; bạn chỉ cần làm tốt những thứ vốn đã nên làm.',
        },
        {
          t: 'p',
          md: 'Với mô hình sinh, vấn đề chuyển từ "suy ra" sang "đọc thẳng ra". Carlini và cộng sự (2021) cho thấy có thể trích xuất nguyên văn các đoạn dữ liệu huấn luyện từ mô hình ngôn ngữ lớn, gồm cả thông tin cá nhân. Nghiên cứu tiếp theo năm 2023 mở rộng kết quả này sang các mô hình thương mại đang chạy thật. Nếu bạn tinh chỉnh một mô hình ngôn ngữ trên báo cáo sự cố nội bộ, hãy giả định rằng nội dung đó có thể bị moi ra.',
        },
        { t: 'h', text: 'Riêng tư vi phân, và cái giá của nó trong bảo mật', level: 2 },
        {
          t: 'callout',
          kind: 'math',
          title: 'Riêng tư vi phân, giải thích không cần công thức',
          md: '**Riêng tư vi phân** (differential privacy, DP) đưa ra một lời hứa có thể chứng minh: nếu ta thêm hoặc bớt **đúng một bản ghi** khỏi tập huấn luyện, thì phân phối kết quả đầu ra gần như không đổi. Vì thế không ai nhìn vào đầu ra mà kết luận được bản ghi đó có tham gia hay không.\n\n"Gần như không đổi" được định lượng bằng tham số **epsilon** — gọi là ngân sách riêng tư. Epsilon nhỏ nghĩa là bảo vệ mạnh và nhiễu nhiều; epsilon lớn nghĩa là bảo vệ yếu và mô hình chính xác hơn.\n\nCách thực hiện phổ biến khi huấn luyện mạng nơ-ron là **DP-SGD** (Abadi và cộng sự, 2016): cắt chuẩn của gradient theo từng mẫu, rồi cộng nhiễu ngẫu nhiên trước khi cập nhật trọng số. Trực giác: không mẫu nào được phép ảnh hưởng quá nhiều tới mô hình, kể cả mẫu đặc biệt nhất.',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Nghịch lý riêng tư vi phân trong an ninh mạng',
          md: 'DP hoạt động bằng cách **hạn chế ảnh hưởng của những mẫu hiếm và cá biệt** — vì chính chúng là thứ dễ bị nhận ra nhất.\n\nNhưng trong an ninh mạng, mẫu hiếm và cá biệt **chính là tấn công**. Một họ mã độc mới có thể chỉ có vài chục mẫu trong hàng triệu; một chuỗi hành vi xâm nhập nội bộ có thể chỉ xuất hiện một lần. DP sẽ làm đúng nhiệm vụ của nó là nén ảnh hưởng của những mẫu đó xuống — và làm hỏng đúng khả năng mà bạn cần.\n\nKết luận thực dụng: DP hợp lý cho các mô hình xử lý **dữ liệu người dùng** (UEBA, phân tích hành vi nhân viên, mô hình trên dữ liệu khách hàng nhiều bên). Với mô hình phát hiện lớp hiếm, hãy cân nhắc rất kỹ và luôn đo lại độ hồi tưởng trên lớp dương trước và sau khi bật DP, thay vì chỉ nhìn chỉ số tổng thể.',
        },
        {
          t: 'checklist',
          title: 'Rà soát rò rỉ cho một API chấm điểm — dùng trong buổi rà soát thiết kế',
          items: [
            'Đầu ra chi tiết tới mức nào: nhãn, nhóm rủi ro, điểm số, hay điểm số kèm giải thích đặc trưng?',
            'Điểm số có rò qua kênh phụ nào không: header, mã lỗi, thời gian phản hồi, thứ tự sắp xếp, thông báo cho người dùng cuối?',
            'Có giới hạn tốc độ theo danh tính đã xác thực không, và hạn mức ngày là bao nhiêu?',
            'Có ghi log toàn bộ truy vấn kèm định danh và giữ đủ lâu để điều tra ngược không?',
            'Có cơ chế phát hiện chuỗi truy vấn rất giống nhau, khác nhau từng chút một, từ cùng một danh tính không?',
            'Tập huấn luyện có chứa dữ liệu mà việc xác nhận tư cách thành viên đã là rò rỉ không? Nếu có, ai chịu trách nhiệm pháp lý?',
            'Với mô hình sinh tinh chỉnh trên dữ liệu nội bộ: đã kiểm tra khả năng nhả nguyên văn dữ liệu huấn luyện chưa?',
            'Nếu mô hình bị sao chép hoàn toàn ngày mai, tầng phòng thủ nào của ta còn đứng?',
          ],
        },
        {
          t: 'callout',
          kind: 'ethics',
          title: 'Đo rò rỉ trên hệ thống của chính bạn',
          md: 'Các phép đo trong bài này — thử suy luận thành viên, ước lượng số truy vấn cần để sao chép mô hình — là công việc đánh giá hợp pháp **khi thực hiện trên hệ thống bạn sở hữu hoặc được uỷ quyền bằng văn bản**.\n\nThực hiện chúng lên API của bên thứ ba, kể cả khi bạn là khách hàng trả tiền, thường vi phạm điều khoản dịch vụ và có thể cấu thành truy cập trái phép. Nếu bạn cần kết quả đó cho việc thẩm định nhà cung cấp, hãy yêu cầu họ cung cấp báo cáo đánh giá hoặc thoả thuận một cửa sổ kiểm thử có văn bản.\n\nKhi kiểm thử suy luận thành viên trên dữ liệu thật của người dùng, hãy làm việc với bộ phận pháp chế trước: bản thân quá trình kiểm thử cũng là xử lý dữ liệu cá nhân.',
        },
        {
          t: 'terms',
          ids: ['model-extraction', 'membership-inference', 'qua-khop', 'shap', 'regularization'],
        },
      ],
      keyTakeaways: [
        'Trả về điểm số thay vì nhãn làm giảm số truy vấn cần để sao chép mô hình xuống hàng chục lần hoặc hơn.',
        'Trộm mô hình không chỉ là mất tài sản trí tuệ: nó biến tấn công né tránh ồn ào thành tấn công chuyển giao im lặng.',
        'Điểm số của mô hình rò ra qua nhiều kênh phụ ngoài API chính: header, mã lỗi, thời gian phản hồi, thứ tự kết quả.',
        'Suy luận thành viên khai thác đúng khoảng cách giữa hành vi trên dữ liệu đã thấy và dữ liệu mới, nên chống quá khớp cũng là chống rò rỉ riêng tư.',
        'Mô hình sinh có thể nhả nguyên văn dữ liệu huấn luyện, nên tinh chỉnh trên báo cáo sự cố nội bộ là hành động cần cân nhắc kỹ.',
        'Riêng tư vi phân hạn chế ảnh hưởng của mẫu hiếm — mà mẫu hiếm trong bảo mật chính là tấn công, nên phải đo lại độ hồi tưởng lớp dương sau khi bật DP.',
      ],
      cards: [
        {
          id: 't8l4-c1',
          front: 'Vì sao API trả điểm số dễ bị trộm mô hình hơn hẳn API chỉ trả nhãn?',
          back: 'Vì mỗi truy vấn trả nhãn chỉ cho một bit, còn điểm số cho hàng chục bit kèm thông tin về hướng và độ dốc, nên kẻ tấn công leo dốc được thay vì mò mẫm.',
          tags: ['model-extraction'],
        },
        {
          id: 't8l4-c2',
          front: 'Trộm mô hình gây hậu quả kỹ thuật gì cho khả năng phát hiện né tránh của bạn?',
          back: 'Kẻ tấn công luyện mẫu né tránh ngoại tuyến trên bản sao, nên toàn bộ giai đoạn thử sai không tạo truy vấn nào tới bạn. Giám sát mẫu truy vấn trở nên vô dụng.',
          tags: ['model-extraction', 'ne-tranh'],
        },
        {
          id: 't8l4-c3',
          front: 'Tấn công suy luận thành viên dựa trên quan sát cơ bản nào?',
          back: 'Mô hình thường tự tin hơn trên dữ liệu nó đã thấy khi huấn luyện so với dữ liệu mới. Khoảng cách tự tin đó chính là tín hiệu để đoán tư cách thành viên.',
          tags: ['membership-inference', 'qua-khop'],
        },
        {
          id: 't8l4-c4',
          front: 'Riêng tư vi phân hứa điều gì, và tham số epsilon nghĩa là gì?',
          back: 'Hứa rằng thêm hoặc bớt một bản ghi khỏi tập huấn luyện gần như không đổi phân phối đầu ra. Epsilon là ngân sách riêng tư: nhỏ thì bảo vệ mạnh và nhiễu nhiều, lớn thì ngược lại.',
          tags: ['dp'],
        },
        {
          id: 't8l4-c5',
          front: 'Vì sao riêng tư vi phân đặc biệt tốn kém với mô hình phát hiện tấn công?',
          back: 'Vì DP hạn chế ảnh hưởng của mẫu hiếm và cá biệt, mà trong bảo mật mẫu hiếm chính là tấn công. Phải đo lại độ hồi tưởng lớp dương chứ không chỉ chỉ số tổng thể.',
          tags: ['dp'],
        },
      ],
      quiz: [
        {
          id: 't8l4-q1',
          kind: 'mcq',
          tags: ['model-extraction'],
          q: 'Đội sản phẩm muốn API trả về điểm rủi ro bốn chữ số thập phân kèm ba đặc trưng đóng góp lớn nhất. Khuyến nghị nào cân bằng nhất giữa giá trị nghiệp vụ và rủi ro?',
          options: [
            'Từ chối toàn bộ: API chỉ được trả về nhãn chặn hoặc cho qua',
            'Chấp nhận nguyên trạng nhưng bù lại bằng giới hạn tốc độ chặt',
            'Tách theo đối tượng: người dùng ngoài nhận nhóm rủi ro thô và lý do ở mức nghiệp vụ; analyst nội bộ đã xác thực nhận đầy đủ điểm số và giải thích',
            'Trả về điểm số đầy đủ nhưng thêm nhiễu ngẫu nhiên lớn vào mỗi lần gọi',
          ],
          answer: 2,
          why: 'Bài toán ở đây không phải chọn giữa minh bạch và bảo mật, mà là **nhận ra hai đối tượng có nhu cầu khác nhau**. Analyst nội bộ cần giải thích chi tiết để làm việc, và họ đã ở sau xác thực nên rủi ro thấp hơn nhiều. Người dùng bên ngoài chỉ cần biết phải làm gì tiếp theo, không cần bản đồ đặc trưng. Phương án A phá giá trị nghiệp vụ một cách không cần thiết; phương án B giữ nguyên rò rỉ về chất; phương án D nghe hợp lý nhưng nhiễu độc lập từng lần gọi bị triệt tiêu khi lấy trung bình nhiều lần gọi cùng một mẫu, nên hiệu quả kém hơn nhiều so với kỳ vọng.',
          distractorWhy: [
            'Cắt bỏ hoàn toàn giải thích làm hỏng công việc của analyst mà không cần thiết.',
            'Giới hạn tốc độ giúp ích nhưng không đổi bản chất: mỗi truy vấn vẫn cho lượng thông tin lớn.',
            '',
            'Nhiễu độc lập theo từng lần gọi bị triệt tiêu bằng cách lặp lại truy vấn và lấy trung bình.',
          ],
        },
        {
          id: 't8l4-q2',
          kind: 'match',
          tags: ['model-extraction', 'membership-inference'],
          q: 'Ghép mỗi tấn công với thứ nó lấy được từ hệ thống của bạn.',
          pairs: [
            ['Trộm mô hình', 'Một bản sao có hành vi tương đương với mô hình gốc'],
            ['Suy luận thành viên', 'Câu trả lời cho việc một bản ghi cụ thể có trong tập huấn luyện hay không'],
            ['Đảo ngược mô hình', 'Tái dựng gần đúng thuộc tính đặc trưng của một lớp hoặc cá nhân'],
            ['Trích xuất dữ liệu ghi nhớ', 'Nguyên văn đoạn dữ liệu huấn luyện mà mô hình đã học thuộc'],
          ],
          why: 'Bốn tấn công này hay bị gộp chung thành "rủi ro riêng tư của AI", nhưng chúng đòi hỏi điều kiện khác nhau và cần biện pháp khác nhau. Trộm mô hình chống bằng thiết kế đầu ra và giới hạn tốc độ. Suy luận thành viên chống bằng chống quá khớp và riêng tư vi phân. Đảo ngược mô hình chống bằng giảm chi tiết đầu ra. Trích xuất dữ liệu ghi nhớ chống bằng khử trùng lặp dữ liệu huấn luyện và lọc đầu ra. Gộp chung thành một dòng trong sổ rủi ro là cách chắc chắn để không giảm được rủi ro nào.',
        },
        {
          id: 't8l4-q3',
          kind: 'truefalse',
          tags: ['membership-inference', 'qua-khop'],
          q: 'Giảm quá khớp của mô hình cũng giúp giảm nguy cơ tấn công suy luận thành viên.',
          answer: true,
          why: 'Đúng, và đây là một trong số ít trường hợp mà biện pháp bạn vốn đã nên làm lại giải quyết luôn một rủi ro khác. Suy luận thành viên khai thác **khoảng cách** giữa hành vi mô hình trên dữ liệu đã thấy và dữ liệu mới. Mô hình càng quá khớp, khoảng cách càng lớn, tín hiệu càng rõ. Mọi biện pháp chống quá khớp — regularization, dừng sớm, tăng cường dữ liệu, giảm dung lượng mô hình — đều thu hẹp khoảng cách đó. Lưu ý: giảm chứ không triệt tiêu; muốn có bảo đảm định lượng thì vẫn phải dùng riêng tư vi phân, kèm cái giá đã nêu.',
        },
        {
          id: 't8l4-q4',
          kind: 'multi',
          tags: ['model-extraction'],
          q: 'Kênh nào có thể làm rò điểm số của mô hình ra ngoài dù API chính chỉ trả về nhãn? (Chọn tất cả)',
          options: [
            'Header do hệ thống lọc gắn thêm vào email đi qua',
            'Thời gian phản hồi khác nhau tuỳ theo đường xử lý',
            'Thứ tự sắp xếp kết quả trả về cho người dùng',
            'Phiên bản thư viện TLS mà máy chủ sử dụng',
          ],
          answers: [0, 1, 2],
          why: 'Ba kênh đầu đều là **kênh phụ** cổ điển, và cả ba đã xuất hiện trong sự cố thật. Header gắn điểm số chính là bản chất của vụ CVE-2019-20634. Thời gian phản hồi rò rỉ khi mẫu điểm cao đi qua thêm một bước phân tích sâu. Thứ tự sắp xếp rò rỉ vì nó chính là ánh xạ đơn điệu của điểm số. Phiên bản thư viện TLS thì không mang thông tin gì về quyết định của mô hình — đó là bề mặt tấn công hạ tầng, thuộc bài toán khác. Bài học rà soát: đừng chỉ kiểm tra thân phản hồi, hãy liệt kê **mọi thứ quan sát được từ bên ngoài** và hỏi cái nào phụ thuộc vào điểm số.',
        },
      ],
      terms: ['model-extraction', 'membership-inference', 'qua-khop', 'shap', 'regularization'],
      further: [
        {
          title: 'Stealing Machine Learning Models via Prediction APIs — Tramèr và cộng sự, USENIX Security (2016)',
          note: 'Bài nền cho trộm mô hình. Đọc phần thực nghiệm để thấy số truy vấn cần thiết nhỏ tới mức nào khi API trả về xác suất.',
        },
        {
          title: 'Membership Inference Attacks Against Machine Learning Models — Shokri và cộng sự, IEEE S&P (2017)',
          note: 'Bài nền cho suy luận thành viên và kỹ thuật mô hình bóng. Đọc để hiểu vì sao quá khớp và rò rỉ riêng tư là hai mặt của một hiện tượng.',
        },
        {
          title: 'Deep Learning with Differential Privacy — Abadi và cộng sự (2016)',
          note: 'Nguồn của DP-SGD. Đọc mục về cắt gradient và cộng nhiễu, rồi tự hỏi điều đó làm gì với lớp dương hiếm trong dữ liệu của bạn.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't8-l5',
      trackId: 'adversarial',
      title: 'Phòng thủ và giới hạn thực tế',
      subtitle: 'Không có phòng thủ nào tuyệt đối. Mục tiêu đúng là làm cuộc tấn công đắt hơn giá trị nó mang lại.',
      minutes: 24,
      practiceMinutes: 3,
      level: 'nang-cao',
      prereqs: ['t8-l2', 't8-l3'],
      why: {
        short:
          'Phần lớn phòng thủ đối kháng được công bố đều bị phá trong vòng một tới hai năm, nên biết cái gì thực sự trụ được và cái gì chỉ là ảo giác an toàn là kỹ năng quyết định khi bạn phải tiêu ngân sách.',
        scenario:
          'Một nhà cung cấp chào bạn mô-đun "phát hiện đầu vào đối kháng", quảng cáo bắt được 97% mẫu đối kháng trong bài kiểm tra của họ. Giá bằng một phần ba ngân sách bảo mật năm. Bạn có một buổi để đánh giá và phải trả lời: con số 97% đó được đo thế nào, và nó còn đúng không khi kẻ tấn công biết mô-đun này tồn tại.',
        roles: ['AI Security Engineer', 'Security Architect', 'Security Data Scientist', 'ML Engineer'],
        costOfNotKnowing:
          'Bạn mua một lớp phòng thủ bị vô hiệu hoá bởi một kẻ tấn công thích ứng chỉ trong vài ngày, đồng thời tin rằng vấn đề đã được xử lý nên ngừng đầu tư vào phòng thủ nhiều tầng — thứ duy nhất thực sự có tác dụng. Ảo giác an toàn tệ hơn việc biết mình đang hở.',
      },
      objectives: [
        'Giải thích adversarial training hoạt động thế nào và nêu đúng ba loại chi phí của nó',
        'Nhận ra dấu hiệu của che giấu gradient trong một báo cáo đánh giá độ bền',
        'Xếp hạng các biện pháp phòng thủ theo tỉ lệ hiệu quả trên chi phí cho môi trường vận hành thật',
        'Đánh giá phản biện một tuyên bố về độ bền: kiểm tra kẻ tấn công thích ứng, ngân sách tấn công, và mức suy giảm trên dữ liệu sạch',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Một nhóm nghiên cứu công bố phòng thủ giúp mô hình giữ được 95% độ chính xác trước mẫu đối kháng, trong khi mô hình thường chỉ còn 3%. Họ đánh giá bằng FGSM và một tấn công truy vấn tiêu chuẩn. Theo bạn, điều gì có khả năng xảy ra trong 12 tháng tới?',
          reveal:
            'Khả năng cao nhất: có nhóm khác công bố cách phá nó, và con số 95% rơi về gần 0. Đây không phải suy đoán bi quan mà là **mẫu hình lặp lại của cả lĩnh vực**. Athalye, Carlini và Wagner (2018) đã kiểm tra lại các phòng thủ được chấp nhận tại ICLR 2018 và phá được phần lớn trong số đó, chỉ ra một nguyên nhân chung là **che giấu gradient** (obfuscated gradients): phòng thủ không làm mô hình bền hơn, nó chỉ làm thuật toán tấn công tiêu chuẩn *tìm không ra* hướng đi. Trước đó Carlini và Wagner (2017) đã phá mười phương pháp phát hiện mẫu đối kháng. Năm 2020, Tramèr và cộng sự lặp lại bài học với mười ba phòng thủ khác bằng cách thiết kế tấn công thích ứng riêng cho từng cái. Dấu hiệu nhận biết trong báo cáo bạn đang cầm: **chỉ đánh giá bằng tấn công có sẵn, không có kẻ tấn công biết về phòng thủ.**',
        },
        {
          t: 'p',
          md: 'Bài này chia làm hai nửa, và nửa sau quan trọng hơn nửa đầu. Nửa đầu: các phòng thủ có tên trong tài liệu học thuật. Nửa sau: những thứ thực sự làm việc trong hệ thống đang chạy.',
        },
        { t: 'h', text: 'Adversarial training — phòng thủ duy nhất trụ được lâu, và cái giá của nó', level: 2 },
        {
          t: 'p',
          md: 'Ý tưởng đơn giản tới mức đẹp: trong mỗi vòng huấn luyện, sinh mẫu đối kháng cho lô hiện tại rồi huấn luyện trên chính những mẫu đó. Mô hình học ranh giới quyết định có đệm thay vì ranh giới sát rạt. Madry và cộng sự (2017) đưa nó thành một bài toán tối ưu hai lớp rõ ràng, và tới nay đây vẫn là phòng thủ hiếm hoi chưa bị phá về nguyên tắc.',
        },
        {
          t: 'table',
          caption: 'Ba loại chi phí của adversarial training — hãy nói đủ cả ba khi trình bày với lãnh đạo',
          head: ['Chi phí', 'Mức độ', 'Vì sao'],
          rows: [
            [
              'Chi phí huấn luyện',
              'Cao — thường gấp nhiều lần huấn luyện thường',
              'Mỗi lô phải sinh mẫu đối kháng bằng tấn công lặp; với PGD nhiều bước thì mỗi bước huấn luyện kéo theo nhiều lần truyền xuôi và ngược',
            ],
            [
              'Suy giảm trên dữ liệu sạch',
              'Có thật và đo được',
              'Mô hình đánh đổi độ chính xác trên dữ liệu bình thường lấy độ bền. Trong bảo mật, mất vài phần trăm độ hồi tưởng nghĩa là bỏ sót thật nhiều hơn mỗi ngày',
            ],
            [
              'Chỉ bền với đúng mối đe doạ đã huấn luyện',
              'Đây là giới hạn nghiêm trọng nhất',
              'Huấn luyện với nhiễu bị chặn theo một chuẩn và một epsilon cụ thể thì bền với đúng loại đó. Kẻ tấn công dùng phép biến đổi khác — thêm section, đổi thứ tự lệnh, ký số — nằm hoàn toàn ngoài mô hình đe doạ đã huấn luyện',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Vì sao adversarial training khó áp thẳng vào mã độc',
          md: 'Để adversarial training hoạt động, bạn phải **sinh được mẫu đối kháng trong vòng lặp huấn luyện**. Với ảnh, việc đó là vài phép tính ma trận. Với tệp PE, nó có nghĩa là: chọn một tổ hợp phép biến đổi, **thực sự tạo ra tệp mới**, chạy lại toàn bộ pipeline trích xuất đặc trưng, và nếu có đặc trưng động thì còn phải cho chạy trong sandbox.\n\nMột vòng huấn luyện có hàng trăm nghìn lô. Nhân lên, chi phí trở nên khó chấp nhận. Đó là lý do trong thực tế người ta thường làm phiên bản rút gọn: **tăng cường dữ liệu bằng các biến thể đã biết** — thêm sẵn vào tập huấn luyện các mẫu đã qua padding, thêm section, đổi tên — thay vì sinh đối kháng thật sự trong vòng lặp. Rẻ hơn nhiều, hiệu quả kém hơn nhưng vẫn đáng làm.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't8l5-cp1',
              kind: 'mcq',
              tags: ['phong-thu', 'adversarial'],
              q: 'Báo cáo đánh giá một phòng thủ ghi: "Độ chính xác trước tấn công FGSM và PGD tiêu chuẩn giữ ở mức 94%." Câu hỏi phản biện quan trọng nhất bạn nên đặt là gì?',
              options: [
                'Bộ dữ liệu dùng để đánh giá có đủ lớn không?',
                'Kẻ tấn công có biết về cơ chế phòng thủ này và có thiết kế tấn công thích ứng nhắm vào nó không?',
                'Mô hình dùng kiến trúc nào?',
                'Thời gian suy luận tăng thêm bao nhiêu phần trăm?',
              ],
              answer: 1,
              why: 'Đây là câu hỏi đã phá vỡ hầu hết các phòng thủ được công bố trong tám năm qua. Tấn công **tiêu chuẩn** giả định mô hình trơn tru và gradient dùng được; rất nhiều phòng thủ chỉ đơn giản làm gradient trở nên vô dụng — làm tròn, lượng tử hoá, thêm ngẫu nhiên, thêm bước tiền xử lý không khả vi — mà không hề đẩy ranh giới quyết định ra xa. Khi kẻ tấn công **thích ứng**, họ vòng qua bằng cách xấp xỉ gradient, lấy kỳ vọng trên phần ngẫu nhiên, hoặc tấn công thẳng vào mô hình thay thế. Ba câu hỏi còn lại đều hợp lệ nhưng thứ yếu: chúng không đổi được kết luận về độ bền.',
              distractorWhy: [
                'Quan trọng, nhưng một đánh giá đúng quy trình trên bộ dữ liệu nhỏ vẫn tốt hơn một đánh giá sai quy trình trên bộ lớn.',
                '',
                'Kiến trúc là chi tiết triển khai; kết luận về độ bền không phụ thuộc chủ yếu vào nó.',
                'Là câu hỏi vận hành hợp lý, nhưng không kiểm chứng được tuyên bố về độ bền.',
              ],
            },
            {
              id: 't8l5-cp2',
              kind: 'truefalse',
              tags: ['phong-thu'],
              q: 'Nếu một phòng thủ làm cho các thuật toán tấn công dựa trên gradient không hội tụ được thì mô hình đã thực sự bền hơn.',
              answer: false,
              why: 'Đây chính là **che giấu gradient**, và nó là ảo giác an toàn phổ biến nhất trong lĩnh vực này. Ranh giới quyết định không hề dịch chuyển; chỉ có tấm bản đồ dẫn tới nó bị bôi mờ. Kẻ tấn công thích ứng vẫn tìm được đường: xấp xỉ gradient bằng sai phân hữu hạn, lấy trung bình trên nhiều lần chạy để triệt tiêu phần ngẫu nhiên, hoặc bỏ qua hoàn toàn và dùng tính chuyển giao từ mô hình thay thế. Dấu hiệu chẩn đoán mà Athalye và cộng sự đưa ra rất thực dụng: nếu tấn công một bước lại **mạnh hơn** tấn công lặp nhiều bước, hoặc nếu tăng ngân sách tấn công không làm giảm thêm độ chính xác, thì gần như chắc chắn bạn đang nhìn vào gradient bị che giấu chứ không phải độ bền thật.',
            },
          ],
        },
        { t: 'h', text: 'Những phòng thủ thực sự làm việc trong hệ thống đang chạy', level: 2 },
        {
          t: 'p',
          md: 'Chuyển sang nửa quan trọng hơn. Trong vận hành, bạn không cần chứng minh độ bền toán học — bạn cần làm cho cuộc tấn công **đắt hơn giá trị nó mang lại**. Đó là mục tiêu khả thi, và các biện pháp sau đây phục vụ đúng mục tiêu đó.',
        },
        {
          t: 'table',
          caption: 'Xếp hạng biện pháp theo tỉ lệ hiệu quả trên chi phí trong môi trường vận hành',
          head: ['Biện pháp', 'Chặn được gì', 'Chi phí', 'Giới hạn phải nói rõ'],
          rows: [
            [
              'Phòng thủ nhiều tầng: mô hình chỉ là một tầng trong nhiều tầng',
              'Gần như mọi dạng né tránh',
              'Trung bình — chủ yếu là công sức kiến trúc',
              'Không giảm rủi ro của từng tầng riêng lẻ; đòi hỏi các tầng thật sự độc lập chứ không cùng dựa trên một nguồn dữ liệu',
            ],
            [
              'Đa dạng hoá họ đặc trưng: tĩnh, động, mạng, uy tín',
              'Né tránh và tấn công chuyển giao',
              'Trung bình tới cao — mỗi họ là một pipeline dữ liệu',
              'Đặc trưng động cần sandbox, mà mã độc biết phát hiện sandbox và nằm im',
            ],
            [
              'Ưu tiên đặc trưng đắt để giả mạo',
              'Né tránh chi phí thấp',
              'Thấp — chủ yếu là quyết định thiết kế',
              'Đặc trưng đắt để giả thường cũng đắt để thu thập và chậm hơn',
            ],
            [
              'Giới hạn tốc độ và hạn mức truy vấn theo danh tính',
              'Trộm mô hình, tấn công dựa trên truy vấn',
              'Thấp',
              'Vô dụng trước tấn công chuyển giao, vốn chỉ cần vài truy vấn',
            ],
            [
              'Giảm chi tiết đầu ra: nhóm rủi ro thay vì điểm số nhiều chữ số',
              'Trộm mô hình, đảo ngược mô hình',
              'Thấp',
              'Xung đột với nhu cầu giải thích; phải tách theo đối tượng người dùng',
            ],
            [
              'Giám sát phân phối đầu vào và trôi dữ liệu',
              'Đầu độc, tấn công truy vấn hàng loạt, hỏng hóc vận hành nói chung',
              'Trung bình',
              'Không phát hiện được tấn công lượng thấp; cần người thật xem cảnh báo trôi, nếu không thì chỉ là biểu đồ đẹp',
            ],
            [
              'Ensemble nhiều mô hình khác họ',
              'Làm tăng chi phí né tránh',
              'Cao — nhân chi phí huấn luyện và suy luận',
              'KHÔNG phải phòng thủ có bảo đảm: mẫu đối kháng thường chuyển giao được giữa các thành viên trong ensemble',
            ],
            [
              'Phát hiện đầu vào đối kháng bằng mô-đun chuyên biệt',
              'Trên lý thuyết là mẫu đối kháng',
              'Trung bình tới cao',
              'Nhóm phòng thủ có tỉ lệ bị phá cao nhất; hãy coi là lớp bổ sung, không bao giờ là lớp chính',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Nguyên tắc thiết kế đáng giá nhất của cả bài',
          md: 'Xếp mọi đặc trưng của bạn lên một thang **chi phí giả mạo**, rồi dịch chuyển trọng lượng quyết định về phía đầu đắt tiền.\n\nMiễn phí: chuỗi trong tệp, tên tệp, độ dài, entropy toàn cục, User-Agent, tên tiến trình.\nRẻ: bảng import, tên section, header HTTP, kiểu mã hoá.\nĐắt: hành vi runtime, hạ tầng mạng thật, tuổi và uy tín tên miền, chứng chỉ ký hợp lệ, mối quan hệ đồ thị giữa các thực thể.\n\nKhông biện pháp phòng thủ nào trong bảng trên có sức mạnh bằng việc đơn giản là **không xây hệ thống phát hiện trên nền những đặc trưng mà kẻ tấn công đổi được bằng một dòng script**.',
        },
        {
          t: 'compare',
          title: 'Hai cách đo độ bền — chỉ một cách nói lên điều gì đó',
          left: {
            title: 'Đo sai (nhưng phổ biến)',
            icon: 'x',
            items: [
              'Chạy một thư viện tấn công có sẵn với tham số mặc định',
              'Kẻ tấn công giả định không biết gì về cơ chế phòng thủ',
              'Báo cáo một con số duy nhất: "bền 94%"',
              'Không nói ngân sách tấn công là bao nhiêu',
              'Không báo cáo độ chính xác trên dữ liệu sạch trước và sau',
              'Đo trong không gian đặc trưng, không kiểm tra mẫu có tồn tại dưới dạng tệp chạy được không',
            ],
          },
          right: {
            title: 'Đo đúng',
            icon: 'check',
            items: [
              'Thiết kế tấn công thích ứng riêng cho cơ chế phòng thủ đang có',
              'Giả định kẻ tấn công biết đầy đủ về phòng thủ (nguyên tắc Kerckhoffs)',
              'Báo cáo đường cong: tỉ lệ thành công theo ngân sách truy vấn hoặc theo mức biến đổi',
              'Ghi rõ mô hình đe doạ: phép biến đổi nào được phép, phép nào không',
              'Luôn kèm mức suy giảm trên dữ liệu sạch — không có nó thì con số độ bền vô nghĩa',
              'Với bảo mật: chỉ tính là thành công khi mẫu vẫn giữ được chức năng',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Nói thẳng: chưa có phòng thủ nào tuyệt đối',
          md: 'Sau hơn một thập kỷ nghiên cứu, tình hình là: **không tồn tại phòng thủ nào vừa bền trước kẻ tấn công thích ứng, vừa giữ nguyên độ chính xác, vừa chạy được với chi phí chấp nhận được ở quy mô sản xuất.**\n\nCác phương pháp có **chứng nhận** (certified robustness) như làm mượt ngẫu nhiên cho ra bảo đảm toán học thật, nhưng chỉ trong bán kính rất nhỏ theo một chuẩn hình học cụ thể — thứ gần như vô nghĩa với tệp thực thi, nơi ràng buộc là bảo toàn chức năng chứ không phải khoảng cách hình học.\n\nĐiều này **không** dẫn tới kết luận "vậy thì đừng làm gì". Nó dẫn tới ba nguyên tắc: **(1)** không bao giờ để mô hình là điểm quyết định duy nhất; **(2)** đầu tư vào đặc trưng đắt tiền để giả mạo thay vì vào lớp phòng thủ đắt tiền để mua; **(3)** giả định mô hình sẽ bị vượt qua và thiết kế sẵn khả năng phát hiện việc đó cùng đường quay lui.',
        },
        {
          t: 'checklist',
          title: 'Thẩm định một tuyên bố về độ bền — dùng khi nhà cung cấp chào hàng',
          items: [
            'Mô hình đe doạ được ghi rõ chưa: kẻ tấn công có quyền gì, được phép biến đổi những gì?',
            'Kẻ tấn công trong bài đánh giá có biết về cơ chế phòng thủ không? Nếu không thì con số không dùng được',
            'Có tấn công thích ứng thiết kế riêng cho cơ chế này không, hay chỉ chạy công cụ có sẵn?',
            'Kết quả trình bày dạng đường cong theo ngân sách tấn công, hay chỉ một con số duy nhất?',
            'Độ chính xác trên dữ liệu sạch giảm bao nhiêu, và độ hồi tưởng trên lớp dương hiếm giảm bao nhiêu?',
            'Với mẫu tấn công thành công: chúng có tồn tại dưới dạng tệp hoặc lưu lượng thật còn chức năng không?',
            'Có dấu hiệu che giấu gradient không: tấn công một bước mạnh hơn tấn công lặp, hoặc tăng ngân sách không cải thiện kết quả?',
            'Nếu mô-đun này bị vô hiệu hoá hoàn toàn, tầng phòng thủ nào của ta còn đứng?',
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Mẹo thực chiến: đo bằng chi phí, không đo bằng có hay không',
          md: 'Đừng báo cáo "mô hình có bị né tránh không". Câu trả lời luôn là có, và nó không giúp ai quyết định gì.\n\nHãy báo cáo bằng ba con số mà lãnh đạo dùng được: **(a)** số truy vấn trung bình cần để lật một mẫu; **(b)** mức biến đổi trung bình phải áp lên mẫu, quy ra thao tác cụ thể như "phải thêm 3 MB dữ liệu và ký số bằng chứng chỉ hợp lệ"; **(c)** tỉ lệ thành công còn lại sau khi tính cả các tầng phòng thủ khác.\n\nBa con số này biến một cuộc thảo luận kỹ thuật bất tận thành một quyết định đầu tư có căn cứ, và chúng cũng chính là thứ bạn đo lại sau khi triển khai biện pháp mới để chứng minh nó có tác dụng.',
        },
        {
          t: 'terms',
          ids: ['doi-khang', 'mau-doi-khang', 'phong-thu-nhieu-tang', 'troi-du-lieu', 'shadow-mode'],
        },
      ],
      keyTakeaways: [
        'Adversarial training là phòng thủ hiếm hoi chưa bị phá về nguyên tắc, nhưng tốn kém, làm giảm độ chính xác trên dữ liệu sạch, và chỉ bền với đúng mối đe doạ đã huấn luyện.',
        'Che giấu gradient là ảo giác an toàn phổ biến nhất: ranh giới không dịch, chỉ có bản đồ bị bôi mờ.',
        'Dấu hiệu chẩn đoán che giấu gradient: tấn công một bước mạnh hơn tấn công lặp, hoặc tăng ngân sách tấn công không làm giảm thêm độ chính xác.',
        'Đánh giá độ bền chỉ có giá trị khi kẻ tấn công được giả định biết đầy đủ về cơ chế phòng thủ và có tấn công thích ứng.',
        'Trong vận hành, thứ hiệu quả nhất không phải một lớp phòng thủ mua được mà là đa dạng hoá họ đặc trưng, ưu tiên đặc trưng đắt để giả mạo, và phòng thủ nhiều tầng.',
        'Ensemble và mô-đun phát hiện đầu vào đối kháng làm tăng chi phí tấn công nhưng không có bảo đảm, vì mẫu đối kháng thường chuyển giao được giữa các thành viên.',
        'Báo cáo bằng chi phí tấn công chứ không bằng có hay không: số truy vấn cần, mức biến đổi phải áp, và tỉ lệ thành công còn lại sau mọi tầng.',
      ],
      cards: [
        {
          id: 't8l5-c1',
          front: 'Adversarial training hoạt động thế nào, nói trong một câu?',
          back: 'Trong mỗi vòng huấn luyện, sinh mẫu đối kháng cho lô hiện tại rồi huấn luyện trên chính chúng, để mô hình học ranh giới quyết định có đệm thay vì ranh giới sát rạt.',
          tags: ['phong-thu'],
        },
        {
          id: 't8l5-c2',
          front: 'Nêu ba loại chi phí của adversarial training.',
          back: 'Chi phí huấn luyện tăng nhiều lần; độ chính xác trên dữ liệu sạch giảm; và độ bền chỉ áp dụng cho đúng loại biến đổi đã huấn luyện, không phủ được các phép biến đổi khác.',
          tags: ['phong-thu'],
        },
        {
          id: 't8l5-c3',
          front: 'Che giấu gradient (obfuscated gradients) là gì và vì sao nó nguy hiểm?',
          back: 'Là khi phòng thủ chỉ làm thuật toán tấn công không tìm được hướng đi, còn ranh giới quyết định không dịch chuyển. Nguy hiểm vì nó tạo ảo giác an toàn và bị kẻ tấn công thích ứng vòng qua.',
          tags: ['phong-thu'],
        },
        {
          id: 't8l5-c4',
          front: 'Hai dấu hiệu chẩn đoán che giấu gradient trong một báo cáo đánh giá là gì?',
          back: 'Tấn công một bước cho kết quả mạnh hơn tấn công lặp nhiều bước; và tăng ngân sách tấn công không làm giảm thêm độ chính xác của mô hình.',
          hint: 'Cả hai đều là hiện tượng ngược với lẽ thường.',
          tags: ['phong-thu'],
        },
        {
          id: 't8l5-c5',
          front: 'Ba con số nên dùng để báo cáo độ bền thay cho câu trả lời có hay không?',
          back: 'Số truy vấn trung bình cần để lật một mẫu; mức biến đổi phải áp lên mẫu quy ra thao tác cụ thể; và tỉ lệ thành công còn lại sau khi tính cả các tầng phòng thủ khác.',
          tags: ['phong-thu'],
        },
      ],
      quiz: [
        {
          id: 't8l5-q1',
          kind: 'multi',
          tags: ['phong-thu'],
          q: 'Dấu hiệu nào cho thấy một tuyên bố về độ bền có thể không đáng tin? (Chọn tất cả)',
          options: [
            'Đánh giá chỉ dùng công cụ tấn công có sẵn với tham số mặc định',
            'Không báo cáo độ chính xác trên dữ liệu sạch trước và sau khi áp phòng thủ',
            'Tấn công một bước cho tỉ lệ thành công cao hơn tấn công lặp nhiều bước',
            'Kết quả được trình bày dưới dạng đường cong theo ngân sách truy vấn',
          ],
          answers: [0, 1, 2],
          why: 'Ba dấu hiệu đầu đều nằm trong danh sách kiểm tra mà cộng đồng đúc kết sau nhiều đợt phá phòng thủ. Công cụ mặc định nghĩa là **không có kẻ tấn công thích ứng**, và đó là lỗ hổng phương pháp luận đã hạ gục phần lớn phòng thủ công bố. Không báo cáo độ chính xác trên dữ liệu sạch nghĩa là che giấu cái giá — một mô hình luôn trả lời "độc hại" thì bền tuyệt đối và vô dụng tuyệt đối. Tấn công một bước mạnh hơn tấn công lặp là hiện tượng ngược quy luật, chỉ thẳng vào che giấu gradient. Ngược lại, **đường cong theo ngân sách** là dấu hiệu của một đánh giá nghiêm túc: nó thừa nhận rằng độ bền là hàm của chi phí chứ không phải một trạng thái nhị phân.',
        },
        {
          id: 't8l5-q2',
          kind: 'mcq',
          tags: ['phong-thu', 'dac-trung'],
          q: 'Với ngân sách hạn chế, biện pháp nào cho tỉ lệ hiệu quả trên chi phí tốt nhất để giảm rủi ro né tránh cho một mô hình phát hiện đang chạy?',
          options: [
            'Mua mô-đun phát hiện đầu vào đối kháng của nhà cung cấp',
            'Chuyển trọng lượng quyết định sang các đặc trưng đắt tiền để kẻ tấn công giả mạo, và bổ sung một tầng phát hiện độc lập với mô hình',
            'Áp dụng adversarial training đầy đủ với PGD trong vòng lặp huấn luyện',
            'Tăng gấp ba kích thước mô hình để tăng dung lượng biểu diễn',
          ],
          answer: 1,
          why: 'Phương án đúng tấn công vào **kinh tế học của kẻ tấn công** thay vì vào toán học của mô hình, và nó rẻ vì phần lớn là quyết định thiết kế chứ không phải hạ tầng mới. Mô-đun phát hiện đối kháng thuộc nhóm bị phá nhiều nhất nên không nên là khoản chi lớn nhất. Adversarial training đầy đủ với PGD rất tốn kém và, như đã nói, khó áp cho tệp thật vì phải sinh tệp chạy được trong vòng lặp. Tăng kích thước mô hình không liên quan gì tới độ bền đối kháng — mô hình lớn hơn thường có nhiều hướng để lách hơn chứ không ít đi.',
          distractorWhy: [
            'Nhóm phòng thủ có tỉ lệ bị phá cao nhất, không nên là khoản chi lớn nhất.',
            '',
            'Chi phí rất cao và khó áp dụng cho dữ liệu phải bảo toàn chức năng như tệp thực thi.',
            'Dung lượng mô hình không phải yếu tố quyết định độ bền đối kháng.',
          ],
        },
        {
          id: 't8l5-q3',
          kind: 'truefalse',
          tags: ['phong-thu'],
          q: 'Dùng ensemble gồm năm mô hình khác nhau cho ta bảo đảm rằng mẫu đối kháng không thể vượt qua cả năm.',
          answer: false,
          why: 'Không có bảo đảm nào cả, vì **tính chuyển giao** hoạt động cả bên trong ensemble. Các mô hình được huấn luyện trên cùng dữ liệu, cùng bộ đặc trưng, cùng phân phối thì học được những quy luật rất giống nhau, nên ranh giới quyết định của chúng gần nhau ở nhiều vùng — và một mẫu vượt được mô hình này thường vượt luôn các mô hình còn lại. Ensemble vẫn đáng làm vì nó **tăng chi phí** cho kẻ tấn công, nhưng chỉ khi các thành viên thật sự đa dạng: khác họ thuật toán, khác nguồn đặc trưng, khác dữ liệu huấn luyện. Năm mô hình LightGBM khác hạt giống ngẫu nhiên thì gần như không thêm được gì.',
        },
        {
          id: 't8l5-q4',
          kind: 'order',
          tags: ['phong-thu', 'quy-trinh'],
          q: 'Sắp xếp thứ tự hợp lý khi thẩm định một tuyên bố về độ bền do nhà cung cấp đưa ra.',
          items: [
            'Yêu cầu mô hình đe doạ bằng văn bản: kẻ tấn công có quyền gì và được biến đổi những gì',
            'Kiểm tra bài đánh giá có giả định kẻ tấn công biết về cơ chế phòng thủ hay không',
            'Yêu cầu kết quả dạng đường cong theo ngân sách tấn công thay vì một con số duy nhất',
            'Đối chiếu mức suy giảm trên dữ liệu sạch, đặc biệt là độ hồi tưởng trên lớp dương hiếm',
            'Đặt câu hỏi cuối: nếu mô-đun này bị vô hiệu hoá hoàn toàn thì tầng phòng thủ nào còn đứng',
          ],
          why: 'Thứ tự này đi từ điều kiện tiên quyết tới quyết định. Không có **mô hình đe doạ** thì mọi con số phía sau đều không diễn giải được, nên nó phải đứng đầu. Câu hỏi về kẻ tấn công thích ứng đứng thứ hai vì nó có thể loại bỏ toàn bộ báo cáo ngay lập tức. Đường cong và mức suy giảm là để định lượng cái được và cái mất. Câu hỏi cuối cùng là câu quan trọng nhất về mặt kiến trúc, và cố ý đặt ở cuối: nó nhắc bạn rằng dù câu trả lời cho bốn mục trên có đẹp tới đâu, mô hình vẫn không được phép là điểm quyết định duy nhất.',
        },
      ],
      terms: ['doi-khang', 'mau-doi-khang', 'troi-du-lieu', 'shadow-mode'],
      further: [
        {
          title: 'Obfuscated Gradients Give a False Sense of Security — Athalye, Carlini, Wagner (2018)',
          note: 'Bài quan trọng nhất trong danh sách này. Đọc phần dấu hiệu chẩn đoán che giấu gradient và mang thẳng vào quy trình thẩm định nhà cung cấp của bạn.',
        },
        {
          title: 'On Adaptive Attacks to Adversarial Example Defenses — Tramèr và cộng sự (2020)',
          note: 'Cho thấy cách thiết kế tấn công thích ứng riêng cho từng phòng thủ. Đọc để hiểu vì sao chạy công cụ mặc định không phải là đánh giá.',
        },
        {
          title: 'RobustBench — bảng xếp hạng độ bền có chuẩn đánh giá thống nhất',
          note: 'Xem cách một đánh giá độ bền nghiêm túc được trình bày: mô hình đe doạ rõ ràng, cùng một bộ tấn công mạnh cho mọi phương pháp, luôn kèm độ chính xác trên dữ liệu sạch.',
          url: 'https://robustbench.github.io/',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't8-l6',
      trackId: 'adversarial',
      title: 'Red team cho hệ thống học máy',
      subtitle: 'Từ phạm vi và mô hình đe doạ tới báo cáo mà đội phát triển thực sự sửa được.',
      minutes: 29,
      practiceMinutes: 3,
      level: 'chuyen-gia',
      prereqs: ['t8-l4', 't8-l5'],
      why: {
        short:
          'Red team cho ML khác pentest ứng dụng ở chỗ kết quả không phải danh sách lỗ hổng nhị phân mà là các đường cong chi phí — và nếu bạn báo cáo sai định dạng thì không ai sửa được gì.',
        scenario:
          'Bạn được giao đánh giá bảo mật cho hệ thống chấm điểm rủi ro sắp lên production, có ba tuần và một người. Hệ thống gồm pipeline dữ liệu do đội data sở hữu, mô hình do đội ML sở hữu, và API do đội nền tảng sở hữu. Bạn phải quyết định kiểm thử gì trước, đo bằng chỉ số nào, và viết báo cáo sao cho ba đội khác nhau đều biết phần việc của mình.',
        roles: ['Red Teamer', 'AI Security Engineer', 'Security Architect', 'GRC / Compliance'],
        costOfNotKnowing:
          'Bạn nộp một báo cáo ghi "mô hình có thể bị né tránh" kèm vài ảnh chụp màn hình. Đội ML đọc xong không biết phải thay đổi gì, đội data không biết phần nào thuộc về mình, và ba tuần công sức kết thúc bằng một dòng trong sổ rủi ro với trạng thái "đã ghi nhận" mãi mãi.',
      },
      objectives: [
        'Lập được phạm vi và mô hình đe doạ cho một đợt đánh giá ML, có mức truy cập và ngân sách truy vấn ghi rõ',
        'Chạy checklist kiểm thử phủ đủ bốn tài sản: dữ liệu, mô hình, API, và vòng phản hồi',
        'Chọn chỉ số đo đúng cho từng loại phát hiện, dùng đường cong chi phí thay vì kết luận nhị phân',
        'Viết một phát hiện theo mẫu chuẩn và giao đúng cho đội sở hữu tài sản tương ứng',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bạn có ba tuần để đánh giá một hệ thống ML sắp lên production. Theo bạn, hạng mục nào đáng làm đầu tiên: (a) thử sinh mẫu đối kháng để né tránh mô hình, (b) rà soát ai ghi được vào dữ liệu huấn luyện và vòng phản hồi nhãn, hay (c) kiểm tra hạ tầng API?',
          reveal:
            'Đáp án hầu như luôn là **(b)**, và điều này gây bất ngờ cho phần lớn người mới chuyển từ pentest sang. Ba lý do. **Một**, đây là hạng mục rẻ nhất để kiểm tra: vài buổi phỏng vấn và đọc sơ đồ luồng dữ liệu, không cần viết mã. **Hai**, nó thường cho ra phát hiện nghiêm trọng nhất, vì hầu như chưa ai từng rà soát nó — đường cấp dữ liệu mở và vòng phản hồi không kiểm soát là chuyện rất phổ biến. **Ba**, phát hiện ở đây có **cách sửa rõ ràng**: thêm hạn mức, thêm tập chuẩn sạch, thêm ghi nguồn gốc. Trong khi đó, phát hiện "mô hình bị né tránh được" thì ai cũng biết trước là đúng, và cách sửa lại là một dự án kiến trúc dài hạn. Nguyên tắc chung: **ưu tiên theo tỉ lệ (mức nghiêm trọng × khả năng sửa được) chia cho chi phí kiểm thử.**',
        },
        {
          t: 'p',
          md: 'Red team cho ML dùng chung tinh thần với red team truyền thống nhưng khác ở ba điểm cụ thể: **tài sản** (thêm dữ liệu, nhãn, artefact mô hình), **kết quả** (đường cong chi phí thay vì lỗ hổng có hoặc không), và **người nhận báo cáo** (ba đội khác nhau thay vì một đội ứng dụng).',
        },
        {
          t: 'compare',
          title: 'Pentest ứng dụng và red team ML — đừng mang nguyên quy trình cũ sang',
          left: {
            title: 'Pentest ứng dụng truyền thống',
            icon: 'wrench',
            items: [
              'Phát hiện là nhị phân: có lỗ hổng hoặc không',
              'Tái lập được 100% lần nào cũng như lần nào',
              'Mức nghiêm trọng chấm theo thang có sẵn như CVSS',
              'Cách sửa thường là một thay đổi mã cụ thể',
              'Một đội sở hữu và sửa',
              'Bằng chứng là một yêu cầu HTTP và một phản hồi',
            ],
          },
          right: {
            title: 'Red team hệ thống ML',
            icon: 'bot',
            items: [
              'Phát hiện là xác suất: tỉ lệ thành công theo ngân sách tấn công',
              'Tái lập được theo phân phối, không theo từng lần — cần báo cáo khoảng tin cậy hoặc số lần thử',
              'Mức nghiêm trọng phụ thuộc chi phí tấn công và giá trị tài sản, không có thang sẵn phù hợp',
              'Cách sửa thường là thay đổi thiết kế: bộ đặc trưng, quy trình nhãn, đầu ra API',
              'Ba đội sở hữu: data, ML, nền tảng — và phần nguy hiểm nhất thường không có chủ',
              'Bằng chứng là tập mẫu, script tái lập, và bảng số liệu',
            ],
          },
        },
        { t: 'h', text: 'Quy trình sáu bước', level: 2 },
        {
          t: 'steps',
          title: 'Một đợt đánh giá ML từ đầu tới cuối',
          steps: [
            {
              title: 'Bước 1 — Phạm vi và uỷ quyền',
              md: 'Ghi bằng văn bản: hệ thống nào trong phạm vi, môi trường nào (production, staging, hay bản sao ngoại tuyến), **ngân sách truy vấn tối đa** được phép, cửa sổ thời gian, ai là đầu mối khi có sự cố, và điều kiện dừng khẩn cấp. Riêng với ML, thêm hai mục mà pentest thường không có: **được phép chèn dữ liệu vào pipeline huấn luyện tới mức nào**, và **cách đánh dấu để dữ liệu thử nghiệm được gỡ bỏ sau khi kết thúc**.',
            },
            {
              title: 'Bước 2 — Kiểm kê tài sản và vẽ luồng dữ liệu',
              md: 'Vẽ ra một sơ đồ: nguồn dữ liệu → tiền xử lý → gắn nhãn → huấn luyện → artefact → phục vụ → đầu ra → **vòng phản hồi quay lại nguồn dữ liệu**. Mũi tên cuối cùng là mũi tên hay bị bỏ quên nhất và cũng hay có phát hiện nhất. Với mỗi hộp, ghi ai sở hữu và ai ghi được vào.',
            },
            {
              title: 'Bước 3 — Mô hình đe doạ bằng ATLAS',
              md: 'Với mỗi tài sản, chọn các chiến thuật ATLAS áp dụng được và viết ra giả định truy cập tương ứng. Kết quả là một bảng: tài sản × chiến thuật × mức truy cập giả định × mục tiêu kẻ tấn công. Bảng này chính là danh sách kịch bản kiểm thử, và nó cũng là thứ bạn dùng để bảo vệ lựa chọn ưu tiên của mình trước khách hàng.',
            },
            {
              title: 'Bước 4 — Xếp ưu tiên theo hiệu quả trên chi phí',
              md: 'Với ba tuần bạn không làm hết được. Chấm mỗi kịch bản theo ba trục: **mức nghiêm trọng nếu thành công**, **khả năng đội sản phẩm sửa được**, và **chi phí kiểm thử của bạn**. Rà soát quyền ghi vào dữ liệu gần như luôn đứng đầu; sinh mẫu đối kháng đầy đủ gần như luôn đứng cuối vì tốn nhiều mà kết luận đã biết trước.',
            },
            {
              title: 'Bước 5 — Thực thi và đo bằng đường cong',
              md: 'Với mỗi kịch bản, đừng dừng ở "thành công / thất bại". Đo **tỉ lệ thành công theo ngân sách**: 10, 100, 1.000, 10.000 truy vấn. Đo **mức biến đổi cần thiết** quy ra thao tác cụ thể. Ghi lại **hệ thống của họ có phát hiện được bạn không** — đây là phát hiện độc lập và thường quan trọng ngang phát hiện chính.',
            },
            {
              title: 'Bước 6 — Báo cáo, bàn giao, và tái kiểm',
              md: 'Mỗi phát hiện đi kèm đội sở hữu cụ thể và một khuyến nghị mà đội đó thực hiện được trong sprint của họ. Chốt lịch tái kiểm ngay trong buổi bàn giao — nếu không có ngày tái kiểm thì phát hiện sẽ nằm trong sổ rủi ro mãi mãi. Dọn sạch dữ liệu thử nghiệm đã chèn và xác nhận bằng văn bản.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'ethics',
          title: 'Quy tắc giao chiến bắt buộc cho đánh giá ML',
          md: 'Chỉ kiểm thử hệ thống bạn **sở hữu** hoặc được **uỷ quyền bằng văn bản**, với phạm vi ghi rõ. Đây không phải hình thức: dò ranh giới quyết định của một dịch vụ không thuộc về bạn là truy cập trái phép, kể cả khi từng yêu cầu đều hợp lệ.\n\nBa điều khoản đặc thù cho ML mà bạn phải thêm vào văn bản uỷ quyền, ngoài mẫu pentest thông thường:\n\n**1. Ngân sách truy vấn và tốc độ tối đa**, để việc đánh giá không trở thành tấn công từ chối dịch vụ ngoài ý muốn.\n\n**2. Điều khoản về dữ liệu chèn vào**: được chèn bao nhiêu, đánh dấu bằng cách nào, ai chịu trách nhiệm gỡ, và hạn chót gỡ. Dữ liệu thử nghiệm bị bỏ quên trong tập huấn luyện là một cuộc đầu độc do chính bạn gây ra.\n\n**3. Cấm dùng mã độc thật trong môi trường có kết nối mạng.** Dùng mẫu vô hại có gắn dấu nhận biết, hoặc tệp kiểm thử chuẩn của ngành như EICAR, hoặc chạy trong môi trường cách ly hoàn toàn. Nếu bắt buộc phải dùng mẫu thật, chỉ làm trong phòng lab tách biệt vật lý và ghi rõ trong phạm vi.\n\nCuối cùng: nếu trong quá trình đánh giá bạn phát hiện **dấu hiệu xâm nhập thật**, dừng lại và kích hoạt quy trình ứng cứu sự cố, đừng tiếp tục kiểm thử trên hiện trường.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't8l6-cp1',
              kind: 'mcq',
              tags: ['red-team', 'quy-trinh'],
              q: 'Trong sơ đồ luồng dữ liệu của một hệ thống ML phát hiện, mũi tên nào thường bị bỏ sót nhất khi kiểm kê tài sản?',
              options: [
                'Từ nguồn dữ liệu thô tới bước tiền xử lý',
                'Từ artefact mô hình tới dịch vụ phục vụ',
                'Từ đầu ra và hành động của analyst quay ngược lại thành nhãn huấn luyện',
                'Từ dịch vụ phục vụ tới người dùng cuối',
              ],
              answer: 2,
              why: 'Ba mũi tên còn lại đều nằm trong sơ đồ kiến trúc chính thức nên gần như luôn được kiểm kê. **Vòng phản hồi** thì thường không nằm trong sơ đồ nào cả: nó tồn tại dưới dạng một truy vấn SQL định kỳ lấy trạng thái đóng cảnh báo từ SIEM, do một người viết ba năm trước, không có chủ sở hữu chính thức, không có kiểm soát thay đổi. Trong nhiều đợt đánh giá, đây vừa là phát hiện nghiêm trọng nhất vừa là phát hiện rẻ nhất để tìm ra — chỉ cần hỏi đúng câu hỏi "nhãn của các bạn đến từ đâu".',
              distractorWhy: [
                'Luôn có trong sơ đồ kiến trúc và thường đã có kiểm soát truy cập.',
                'Thuộc quy trình phát hành, thường đã nằm trong phạm vi rà soát chuỗi cung ứng.',
                '',
                'Là bề mặt quen thuộc, luôn được kiểm thử trong pentest thông thường.',
              ],
            },
          ],
        },
        { t: 'h', text: 'Checklist kiểm thử — bốn nhóm tài sản', level: 2 },
        {
          t: 'checklist',
          title: 'Nhóm 1 — Dữ liệu và nhãn (thường cho phát hiện nghiêm trọng nhất)',
          items: [
            'Liệt kê mọi nguồn cấp dữ liệu và đánh dấu nguồn nào bên ngoài ghi vào được, kể cả gián tiếp',
            'Nhãn đến từ đâu: con người, luật tự động, hay vòng phản hồi từ hành động của analyst?',
            'Có hạn mức tỉ lệ đóng góp tối đa cho mỗi nguồn trong một chu kỳ huấn luyện không?',
            'Có tập chuẩn sạch cố định, không bao giờ dùng để huấn luyện, và có chấm điểm nó theo từng nhóm sau mỗi lần huấn luyện lại không?',
            'Có ghi nguồn gốc từng mẫu và từng nhãn không: ai gán, lúc nào, bằng chứng gì?',
            'Nhãn đóng hàng loạt có được tách khỏi nhãn đã điều tra từng cái không?',
            'Thử nghiệm có kiểm soát: chèn một lượng nhỏ mẫu có gắn dấu vào một nguồn ghi được và xem chúng có tới được tập huấn luyện không, có bị bất kỳ kiểm soát nào chặn lại không',
          ],
        },
        {
          t: 'checklist',
          title: 'Nhóm 2 — Artefact mô hình và chuỗi cung ứng',
          items: [
            'Trọng số mô hình tải từ đâu, và có kiểm tra chữ ký số hoặc mã băm lúc nạp không?',
            'Định dạng lưu trữ có cho phép thực thi mã lúc giải tuần tự không? Nếu dùng pickle của Python thì đây là lỗ hổng thực thi mã, không phải rủi ro ML',
            'Có bản kê thành phần cho mô hình không: dữ liệu nào, phiên bản thư viện nào, ai huấn luyện, khi nào?',
            'Ai có quyền đẩy một artefact mô hình mới lên production, và có yêu cầu duyệt bởi người thứ hai không?',
            'Có đường quay lui về phiên bản trước không, và mất bao lâu để thực hiện? Hãy bấm giờ thật chứ đừng hỏi',
            'Mô hình có được phân phối tới endpoint của khách hàng không? Nếu có, mặc định coi là whitebox trong mọi phân tích tiếp theo',
          ],
        },
        {
          t: 'checklist',
          title: 'Nhóm 3 — API suy luận và rò rỉ',
          items: [
            'Đầu ra chi tiết tới mức nào: nhãn, nhóm rủi ro, điểm số, hay kèm cả giải thích đặc trưng?',
            'Điểm số có rò qua kênh phụ không: header, mã lỗi, thời gian phản hồi, thứ tự sắp xếp kết quả?',
            'Có giới hạn tốc độ theo danh tính đã xác thực chứ không chỉ theo địa chỉ IP không?',
            'Toàn bộ truy vấn có được ghi log kèm định danh và giữ đủ lâu để điều tra ngược không?',
            'Có cơ chế phát hiện chuỗi truy vấn rất giống nhau, khác nhau từng chút, từ cùng một danh tính không?',
            'Đo thử: với ngân sách 100, 1.000 và 10.000 truy vấn trong phạm vi cho phép, dựng được mô hình thay thế đạt mức đồng thuận bao nhiêu phần trăm với mô hình gốc?',
            'Trong khi làm bài đo trên, hệ thống giám sát của họ có sinh ra cảnh báo nào không? Ghi lại kết quả — đây là một phát hiện độc lập',
          ],
        },
        {
          t: 'checklist',
          title: 'Nhóm 4 — Vận hành và khả năng phục hồi',
          items: [
            'Có giám sát trôi phân phối đầu vào không, ngưỡng đặt ở đâu, và ai là người thực sự xem cảnh báo trôi?',
            'Mô hình mới có chạy ở chế độ song song không ra quyết định trước khi phát hành thật không?',
            'Có công tắc tắt mô hình khẩn cấp không, ai được bấm, và hệ thống hoạt động thế nào khi mô hình tắt?',
            'Nếu mô hình bị vô hiệu hoá hoàn toàn thì tầng phòng thủ nào còn đứng, và mức phát hiện còn lại là bao nhiêu?',
            'Có quy trình xử lý khi nghi ngờ dữ liệu huấn luyện bị đầu độc không, gồm cả việc huấn luyện lại từ mốc dữ liệu sạch?',
            'Có ai chịu trách nhiệm chính thức cho rủi ro của mô hình này không, hay nó nằm giữa ba đội và thuộc về không ai?',
          ],
        },
        { t: 'h', text: 'Viết phát hiện sao cho có người sửa', level: 2 },
        {
          t: 'table',
          caption: 'Mẫu một phát hiện trong báo cáo red team ML',
          head: ['Mục', 'Nội dung cần có', 'Ví dụ ngắn'],
          rows: [
            [
              'Tiêu đề',
              'Mô tả hậu quả, không mô tả kỹ thuật',
              'Kẻ tấn công bên ngoài có thể đẩy nhãn âm vào tập huấn luyện mà không cần tài khoản',
            ],
            [
              'Tài sản và đội sở hữu',
              'Ghi đích danh, nếu không có chủ thì đó chính là một phát hiện riêng',
              'Pipeline nhãn từ SIEM — hiện chưa có đội sở hữu chính thức',
            ],
            [
              'Ánh xạ ATLAS',
              'Chiến thuật và kỹ thuật tương ứng, để nói chung ngôn ngữ với đội GRC',
              'Nhóm chiến thuật đầu độc dữ liệu huấn luyện',
            ],
            [
              'Mức truy cập giả định',
              'Nêu rõ kẻ tấn công cần gì, vì mức nghiêm trọng phụ thuộc trực tiếp vào đây',
              'Không cần tài khoản; chỉ cần gây ra cảnh báo tới SOC',
            ],
            [
              'Các bước tái lập',
              'Script hoặc quy trình chạy lại được, kèm dữ liệu mẫu đã gắn dấu',
              'Script sinh 500 sự kiện vô hại có đặc trưng mục tiêu, kèm mã đánh dấu để gỡ',
            ],
            [
              'Số liệu, không phải kết luận nhị phân',
              'Đường cong theo ngân sách hoặc theo tỉ lệ dữ liệu',
              'Với 0,2% dữ liệu chèn thêm, điểm trung bình của nhóm mục tiêu trên tập chuẩn sạch giảm 0,31',
            ],
            [
              'Tác động nghiệp vụ',
              'Quy ra hệ quả mà lãnh đạo hiểu được',
              'Một họ công cụ tấn công sẽ bị chấm dưới ngưỡng và không tạo cảnh báo',
            ],
            [
              'Khuyến nghị theo đội',
              'Mỗi khuyến nghị phải thực hiện được trong một sprint',
              'Đội data: thêm hạn mức nguồn. Đội ML: thêm tập chuẩn sạch chấm theo nhóm. Đội SOC: tách nhãn đóng hàng loạt',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Cách nói chuyện với đội ML và đội dữ liệu',
          md: 'Đội ML sống bằng **chỉ số**. Nếu bạn nói "mô hình không an toàn", họ nghe thành một ý kiến. Nếu bạn nói "với ngân sách 1.000 truy vấn, tỉ lệ lọt là 68%, và sau khi bỏ ba đặc trưng chuỗi tĩnh thì còn 21% với chi phí 1,4 điểm hồi tưởng", họ nghe thành một bài toán tối ưu — và họ giỏi việc đó hơn bạn. Hãy luôn giao việc dưới dạng đánh đổi có số.\n\nĐội dữ liệu sở hữu pipeline và quy trình nhãn, nhưng thường **chưa bao giờ được yêu cầu nghĩ về kẻ thù**. Đừng trách họ; hãy đưa mô hình đe doạ dạng bảng và hỏi "ai ghi được vào ô này". Phần lớn phát hiện tốt nhất trong sự nghiệp của bạn sẽ đến từ những buổi nói chuyện như vậy chứ không từ việc chạy công cụ.\n\nVà một lời cảnh báo về chính trị nội bộ: phát hiện nghiêm trọng nhất thường nằm ở **khoảng trống giữa các đội**. Đừng để nó bị đá qua đá lại. Trong buổi bàn giao, hãy yêu cầu chỉ định một chủ sở hữu cụ thể ngay tại chỗ, và ghi tên người đó vào biên bản.',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Đừng để đợt đánh giá của bạn trở thành sự cố',
          md: 'Ba tai nạn thường gặp trong red team ML, cả ba đều đã xảy ra ở nhiều nơi.\n\n**1. Dữ liệu thử nghiệm bị bỏ quên trong tập huấn luyện.** Bạn chèn mẫu để kiểm tra kiểm soát, dự án kết thúc, không ai gỡ. Sáu tháng sau mô hình vẫn mang ảnh hưởng đó. Luôn gắn dấu nhận biết và luôn có bước xác nhận đã gỡ bằng văn bản.\n\n**2. Đo đạc trở thành từ chối dịch vụ.** Dựng mô hình thay thế cần nhiều truy vấn, và hệ thống production có thể không chịu nổi. Thoả thuận tốc độ tối đa trước, chạy ngoài giờ cao điểm, và có kênh liên lạc trực tiếp với đội trực.\n\n**3. Đội SOC không được báo trước.** Họ thấy chuỗi truy vấn bất thường và kích hoạt ứng cứu sự cố thật. Việc này vừa tốn tiền vừa làm hỏng quan hệ. Nếu mục đích là kiểm tra khả năng phát hiện của họ thì phải có ít nhất một người trong SOC biết trước và giữ danh sách hoạt động của bạn để đối chiếu sau.',
        },
        {
          t: 'p',
          md: 'Cuối cùng, đặt kết quả vào khung quản trị mà tổ chức đã dùng. **NIST AI RMF** cho bạn ngôn ngữ về quản trị rủi ro AI theo bốn chức năng Govern, Map, Measure, Manage. **MITRE ATLAS** cho bạn ngôn ngữ về kỹ thuật tấn công. **OWASP Top 10 for LLM Applications** áp cho phần hệ thống dùng mô hình ngôn ngữ. Với tổ chức có hoạt động tại châu Âu, **EU AI Act** đặt nghĩa vụ theo mức rủi ro của hệ thống, áp dụng theo lộ trình nhiều giai đoạn kể từ khi có hiệu lực năm 2024 — hãy làm việc với bộ phận pháp chế để xác nhận mốc thời gian và nghĩa vụ áp dụng cho đúng trường hợp của bạn, vì lộ trình này đã có nhiều lần điều chỉnh.',
        },
        {
          t: 'terms',
          ids: ['atlas', 'nist-ai-rmf', 'eu-ai-act', 'model-card', 'owasp-llm'],
        },
      ],
      keyTakeaways: [
        'Ưu tiên kịch bản theo (mức nghiêm trọng × khả năng sửa được) chia cho chi phí kiểm thử — rà soát quyền ghi vào dữ liệu gần như luôn đứng đầu.',
        'Mũi tên hay bị bỏ sót nhất trong sơ đồ luồng dữ liệu là vòng phản hồi từ hành động của analyst quay lại thành nhãn huấn luyện.',
        'Kết quả của red team ML là đường cong chi phí theo ngân sách tấn công, không phải kết luận có hoặc không.',
        'Bốn nhóm kiểm thử: dữ liệu và nhãn, artefact và chuỗi cung ứng, API và rò rỉ, vận hành và khả năng phục hồi.',
        'Việc hệ thống giám sát có phát hiện ra bạn hay không là một phát hiện độc lập, cần ghi lại riêng.',
        'Mỗi phát hiện phải có đội sở hữu đích danh và khuyến nghị làm được trong một sprint; phát hiện nghiêm trọng nhất thường nằm ở khoảng trống giữa các đội.',
        'Quy tắc giao chiến cho ML cần thêm ba điều khoản: ngân sách truy vấn, quy định về dữ liệu chèn vào và hạn chót gỡ, và cấm dùng mã độc thật trong môi trường có kết nối mạng.',
      ],
      cards: [
        {
          id: 't8l6-c1',
          front: 'Công thức xếp ưu tiên kịch bản trong một đợt red team ML có thời gian hạn chế?',
          back: 'Lấy (mức nghiêm trọng nếu thành công × khả năng đội sản phẩm sửa được) chia cho chi phí kiểm thử. Rà soát quyền ghi vào dữ liệu và vòng phản hồi thường đứng đầu.',
          tags: ['red-team', 'quy-trinh'],
        },
        {
          id: 't8l6-c2',
          front: 'Ba điều khoản đặc thù cho ML phải thêm vào quy tắc giao chiến ngoài mẫu pentest thường?',
          back: 'Ngân sách truy vấn và tốc độ tối đa; quy định về dữ liệu chèn vào gồm cách đánh dấu và hạn chót gỡ; cấm dùng mã độc thật trong môi trường có kết nối mạng.',
          tags: ['red-team', 'dao-duc'],
        },
        {
          id: 't8l6-c3',
          front: 'Vì sao báo cáo red team ML không nên dùng kết luận nhị phân có hoặc không?',
          back: 'Vì mọi mô hình đều bị né tránh được nếu đủ ngân sách. Thông tin dùng được là đường cong: tỉ lệ thành công theo số truy vấn và mức biến đổi cần thiết.',
          tags: ['red-team'],
        },
        {
          id: 't8l6-c4',
          front: 'Ngoài phát hiện chính, kết quả nào luôn cần ghi lại riêng khi kiểm thử một API mô hình?',
          back: 'Việc hệ thống giám sát của họ có phát hiện ra hoạt động của bạn hay không. Đây là phát hiện độc lập về khả năng quan sát, thường quan trọng ngang phát hiện chính.',
          tags: ['red-team'],
        },
        {
          id: 't8l6-c5',
          front: 'Vì sao phải chỉ định chủ sở hữu ngay trong buổi bàn giao báo cáo ML?',
          back: 'Vì phát hiện nghiêm trọng nhất thường nằm ở khoảng trống giữa đội data, đội ML và đội nền tảng — không có tên người cụ thể thì nó bị đá qua lại và không bao giờ được sửa.',
          tags: ['red-team', 'quy-trinh'],
        },
      ],
      quiz: [
        {
          id: 't8l6-q1',
          kind: 'order',
          tags: ['red-team', 'quy-trinh'],
          q: 'Sắp xếp sáu bước của một đợt đánh giá bảo mật cho hệ thống học máy.',
          items: [
            'Chốt phạm vi và uỷ quyền bằng văn bản, gồm ngân sách truy vấn và quy định về dữ liệu chèn vào',
            'Kiểm kê tài sản và vẽ luồng dữ liệu, kể cả mũi tên vòng phản hồi',
            'Lập mô hình đe doạ bằng ATLAS thành bảng tài sản nhân chiến thuật nhân mức truy cập',
            'Xếp ưu tiên kịch bản theo mức nghiêm trọng, khả năng sửa được và chi phí kiểm thử',
            'Thực thi và đo bằng đường cong chi phí, đồng thời ghi lại họ có phát hiện ra bạn không',
            'Báo cáo theo đội sở hữu, dọn dữ liệu thử nghiệm, và chốt lịch tái kiểm',
          ],
          why: 'Thứ tự này có hai chỗ hay bị làm sai. **Một**, nhiều người nhảy thẳng từ phạm vi sang thực thi vì "đã biết cần thử gì" — kết quả là bỏ sót toàn bộ nhánh dữ liệu và nhãn, vốn là nơi có phát hiện nặng nhất. Bước vẽ luồng dữ liệu tốn nửa ngày và thường thay đổi hẳn thứ tự ưu tiên. **Hai**, bước dọn dữ liệu thử nghiệm và chốt lịch tái kiểm bị coi là thủ tục nên hay bị bỏ; nhưng dữ liệu chèn vào mà không gỡ chính là một cuộc đầu độc do bạn gây ra, và phát hiện không có ngày tái kiểm thì tương đương với phát hiện không tồn tại.',
        },
        {
          id: 't8l6-q2',
          kind: 'mcq',
          tags: ['red-team'],
          q: 'Bạn viết phát hiện "mô hình có thể bị né tránh bằng cách thêm dữ liệu vào cuối tệp". Cách trình bày nào giúp đội ML hành động được?',
          options: [
            'Thêm ảnh chụp màn hình mẫu lọt qua và xếp mức nghiêm trọng là Cao',
            'Bổ sung số liệu: tỉ lệ lọt theo lượng dữ liệu thêm vào, và mức suy giảm hồi tưởng nếu bỏ nhóm đặc trưng liên quan',
            'Trích dẫn ba bài báo học thuật về mẫu đối kháng',
            'Đề nghị đội ML áp dụng adversarial training theo chuẩn mới nhất',
          ],
          answer: 1,
          why: 'Đội ML ra quyết định bằng **đánh đổi có số**. Phương án đúng cho họ đúng hai đại lượng cần thiết: cái mất nếu không sửa (tỉ lệ lọt theo mức biến đổi) và cái mất nếu sửa (suy giảm hồi tưởng khi bỏ nhóm đặc trưng). Với hai con số đó, họ tự chạy được thí nghiệm và tự chọn được điểm cân bằng. Ảnh chụp màn hình và mức nghiêm trọng chủ quan không nói cho họ biết phải đổi gì. Trích dẫn bài báo là bối cảnh, không phải hành động. Còn khuyến nghị adversarial training thì vừa đắt vừa khó áp cho tệp thật, và quan trọng hơn — nó áp đặt giải pháp thay vì mô tả bài toán, trong khi đội ML mới là người biết rõ ràng buộc kỹ thuật của họ.',
          distractorWhy: [
            'Ảnh chụp màn hình chứng minh sự tồn tại nhưng không định lượng được đánh đổi.',
            '',
            'Bài báo cung cấp bối cảnh nhưng không nói cần thay đổi gì trong hệ thống này.',
            'Áp đặt một giải pháp đắt tiền và khó khả thi thay vì mô tả bài toán bằng số liệu.',
          ],
        },
        {
          id: 't8l6-q3',
          kind: 'multi',
          tags: ['red-team', 'dao-duc'],
          q: 'Hạng mục nào bắt buộc phải có trong văn bản uỷ quyền cho một đợt red team hệ thống ML? (Chọn tất cả)',
          options: [
            'Ngân sách truy vấn và tốc độ tối đa được phép gửi tới API',
            'Quy định về dữ liệu được chèn vào pipeline: lượng, cách đánh dấu, ai gỡ, hạn chót gỡ',
            'Danh sách chính xác các lỗ hổng sẽ được tìm thấy',
            'Điều kiện dừng khẩn cấp và đầu mối liên hệ khi có sự cố',
          ],
          answers: [0, 1, 3],
          why: 'Ba hạng mục đúng đều nhằm ngăn việc đánh giá tự biến thành sự cố. **Ngân sách truy vấn** ngăn bài đo dựng mô hình thay thế trở thành từ chối dịch vụ. **Quy định dữ liệu chèn vào** ngăn tình huống tệ nhất của red team ML: mẫu thử nghiệm bị bỏ quên và trở thành một cuộc đầu độc thật do chính bạn gây ra. **Điều kiện dừng và đầu mối liên hệ** là chuẩn mực của mọi hoạt động kiểm thử. Phương án về "danh sách chính xác lỗ hổng sẽ tìm thấy" thì vô lý về mặt logic — nếu biết trước thì không cần đánh giá — và nếu ai đó yêu cầu điều này, đó là dấu hiệu phạm vi đang bị bóp méo để cho ra kết quả mong muốn.',
        },
        {
          id: 't8l6-q4',
          kind: 'truefalse',
          tags: ['red-team'],
          q: 'Nếu hệ thống giám sát của khách hàng không phát hiện ra hoạt động kiểm thử của bạn thì đó là chuyện tốt, không cần đưa vào báo cáo.',
          answer: false,
          why: 'Ngược lại hoàn toàn — đó là một **phát hiện độc lập**, và thường là phát hiện có giá trị cao. Nó trả lời một câu hỏi mà khách hàng không tự trả lời được: nếu ai đó đang dò mô hình của chúng ta ngay lúc này, chúng ta có biết không? Cách trình bày tốt là ghép cặp: với mỗi hoạt động bạn thực hiện, ghi kèm hệ thống nào lẽ ra phải kêu và thực tế có kêu không. Đây cũng là lý do phải giữ nhật ký hoạt động chi tiết theo dấu thời gian, để đối chiếu với log của họ trong buổi bàn giao. Một đợt đánh giá tốt luôn sinh ra hai loại phát hiện: lỗ hổng, và những chỗ mù trong khả năng quan sát.',
        },
        {
          id: 't8l6-q5',
          kind: 'input',
          tags: ['red-team', 'atlas'],
          q: 'Khung phân loại chiến thuật và kỹ thuật tấn công dành riêng cho hệ thống AI, do MITRE phát triển song song với ATT&CK, tên là gì?',
          accept: ['atlas', 'mitre atlas'],
          placeholder: 'Tên khung…',
          hint: 'Năm chữ cái, viết hoa toàn bộ trong tài liệu chính thức.',
          why: 'MITRE ATLAS là ngôn ngữ chung để bạn nói chuyện với ba nhóm đối tượng khác nhau mà không phải giải thích lại từ đầu: đội kỹ thuật hiểu chiến thuật và kỹ thuật vì đã quen ATT&CK; đội GRC ánh xạ được vào khung quản trị rủi ro; lãnh đạo nhìn thấy case study thật thay vì lý thuyết. Trong báo cáo red team ML, việc ánh xạ mỗi phát hiện vào một chiến thuật ATLAS làm tăng đáng kể khả năng phát hiện đó được đưa vào kế hoạch xử lý, đơn giản vì nó nằm trong một khung mà tổ chức đã biết cách quản lý.',
        },
      ],
      terms: ['atlas', 'nist-ai-rmf', 'eu-ai-act', 'model-card', 'owasp-llm'],
      further: [
        {
          title: 'NIST AI Risk Management Framework (AI RMF 1.0)',
          note: 'Khung quản trị rủi ro AI theo bốn chức năng Govern, Map, Measure, Manage. Dùng để đặt phát hiện kỹ thuật của bạn vào ngôn ngữ mà bộ phận quản trị rủi ro đã dùng.',
          url: 'https://www.nist.gov/itl/ai-risk-management-framework',
        },
        {
          title: 'MITRE ATLAS — Mitigations và Case Studies',
          note: 'Phần biện pháp giảm thiểu ánh xạ trực tiếp sang khuyến nghị trong báo cáo. Phần case study cho bạn tiền lệ thật để bảo vệ mức nghiêm trọng bạn chấm.',
          url: 'https://atlas.mitre.org/',
        },
        {
          title: 'OWASP Top 10 for Large Language Model Applications',
          note: 'Áp cho phần hệ thống dùng mô hình ngôn ngữ. Đọc trước khi đánh giá bất kỳ ứng dụng LLM hay tác tử nào — chặng 9 sẽ đi sâu vào nhóm rủi ro này.',
          url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
        },
      ],
    },
  ],
};
