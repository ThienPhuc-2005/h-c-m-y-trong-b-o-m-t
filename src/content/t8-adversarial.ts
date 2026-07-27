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
  icon: '⚔️',
  hue: 'rose',
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
      minutes: 16,
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
            title: '🏗️ Tấn công lúc HUẤN LUYỆN',
            items: [
              'Kẻ tấn công tác động vào dữ liệu, nhãn, hoặc chính artefact mô hình',
              'Gồm: đầu độc dữ liệu, cửa hậu (backdoor), đầu độc vòng phản hồi, tấn công chuỗi cung ứng mô hình',
              'Hậu quả nằm SẴN trong trọng số — chạy bao nhiêu lần cũng hỏng như nhau',
              'Rất khó phát hiện sau khi mô hình đã lên production: bạn phải nghi ngờ chính dữ liệu của mình',
              'Đòi hỏi kẻ tấn công tiếp cận được nguồn dữ liệu hoặc quy trình gắn nhãn — nghe khó, nhưng thường dễ hơn bạn tưởng',
            ],
          },
          right: {
            title: '🎯 Tấn công lúc SUY LUẬN',
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
  ],
};
