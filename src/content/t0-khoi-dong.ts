import type { Track } from './types';

/**
 * CHẶNG 0 — Khởi động.
 * Mục tiêu sư phạm của chặng này KHÔNG phải dạy kỹ thuật, mà là:
 *  (a) xây "giá treo" nhận thức (advance organizer) để mọi kiến thức sau có chỗ bám,
 *  (b) tạo động lực bằng cách cho thấy vấn đề thật trước khi đưa công cụ,
 *  (c) dạy người học cách học — vì kỹ năng này quyết định 70% kết quả còn lại.
 */
export const track0: Track = {
  id: 'khoi-dong',
  order: 0,
  title: 'Khởi động: bức tranh lớn',
  tagline: 'Bức tranh toàn cảnh trước khi vào chi tiết',
  icon: 'compass',
  hue: 't0',
  blurb:
    'Bốn bài mở đường. Bạn sẽ thấy rõ học máy giải được gì trong bảo mật, thất bại ở đâu, và vì sao đây là một trong những sân chơi khó nhất của ML. Không cần biết lập trình hay toán để bắt đầu.',
  outcomes: [
    'Nói được ba câu chính xác về việc ML làm được và không làm được trong bảo mật',
    'Nhận ra ngay khi ai đó bán cho bạn "AI phát hiện 99,9% mối đe doạ"',
    'Có bản đồ 12 bài toán bảo mật dùng ML để định vị mọi kiến thức về sau',
    'Biết cách học để 6 tháng sau vẫn còn nhớ',
  ],
  lessons: [
    /* ====================================================================== */
    {
      id: 't0-l1',
      trackId: 'khoi-dong',
      title: 'Học máy trong bảo mật thực sự là gì',
      subtitle: 'Bỏ qua lời quảng cáo, nhìn thẳng vào cái máy đang làm gì',
      minutes: 13,
      practiceMinutes: 3,
      level: 'nen-tang',
      why: {
        short:
          'Trước khi học bất kỳ thuật toán nào, bạn cần biết chính xác ML thay đổi điều gì trong công việc bảo mật — nếu không, bạn sẽ học đúng công cụ cho sai bài toán.',
        scenario:
          'Sếp bạn vừa đi hội thảo về và nói: "Mua con AI này đi, nó phát hiện được cả mã độc chưa biết." Bạn có 10 phút để trả lời nên hay không, và vì sao.',
        roles: ['SOC Analyst', 'Detection Engineer', 'Security Architect'],
        costOfNotKnowing:
          'Bạn hoặc là mua nhầm sản phẩm đắt tiền tạo ra 5.000 cảnh báo rác mỗi ngày, hoặc là bỏ lỡ công nghệ đang thực sự hiệu quả — cả hai đều trả giá bằng sự cố bị bỏ sót.',
      },
      objectives: [
        'Phân biệt được luật cố định (rule) và mô hình học từ dữ liệu',
        'Kể được ba việc ML làm tốt hơn luật và ba việc luật làm tốt hơn ML',
        'Chỉ ra được câu quảng cáo AI bảo mật nào là vô nghĩa về mặt kỹ thuật',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Một hệ thống chặn thư rác. Nó thấy email chứa chữ "hoá đơn" + tệp .zip + gửi từ tên miền mới đăng ký 2 ngày. Theo bạn, cách nào bền hơn: (a) viết luật "nếu có cả 3 điều kiện thì chặn", hay (b) cho máy học từ 1 triệu email đã gắn nhãn? Vì sao?',
          reveal:
            'Cả hai đều đúng một phần — và đó chính là điểm mấu chốt của cả khoá học này. Luật rõ ràng, giải thích được, chặn ngay hôm nay, nhưng kẻ tấn công chỉ cần đổi .zip thành .iso là luật vô dụng. Mô hình học được hàng nghìn tín hiệu yếu mà con người không kịp viết ra, nhưng nó cần dữ liệu, có thể sai theo cách khó hiểu, và cũng bị né tránh — chỉ là tốn công hơn. Hệ thống thật dùng CẢ HAI: luật bắt cái đã biết với chi phí gần bằng 0, mô hình bắt cái na ná cái đã biết.',
        },
        {
          t: 'p',
          md: 'Hãy bắt đầu bằng một định nghĩa không màu mè. **Học máy là viết chương trình bằng ví dụ thay vì bằng câu lệnh.**',
        },
        {
          t: 'p',
          md: 'Lập trình truyền thống: bạn viết luật, đưa dữ liệu vào, máy cho ra kết quả. Học máy đảo ngược: bạn đưa vào dữ liệu **và** kết quả mong muốn, máy tự tìm ra luật. Cái "luật" mà máy tìm ra được gọi là **mô hình** (model) — thực chất chỉ là một đống con số quyết định cách biến đầu vào thành đầu ra.',
        },
        { t: 'figure', id: 'fig-ml-pipeline', caption: 'Đường đi của một quyết định bảo mật dựa trên học máy. Mỗi mũi tên là một chỗ có thể hỏng — và ta sẽ học từng chỗ một.' },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Trực giác cốt lõi',
          md: 'Mô hình không "hiểu" mã độc. Nó tìm ra **quy luật thống kê** phân biệt nhóm tệp bạn gọi là độc với nhóm bạn gọi là lành. Nếu dữ liệu huấn luyện của bạn toàn mã độc thu thập năm 2019, mô hình sẽ học rất giỏi cách nhận ra mã độc *năm 2019*. Đây là nguồn gốc của gần như mọi thất bại ML trong bảo mật.',
        },
        {
          t: 'h',
          text: 'Ba việc ML làm tốt hơn hẳn luật cố định',
          level: 2,
        },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Tổng hợp hàng trăm tín hiệu yếu.** Không ai viết nổi một luật `if` gồm 300 điều kiện với trọng số khác nhau. Mô hình làm việc đó một cách tự nhiên: mỗi đặc trưng đóng góp một chút vào điểm số cuối cùng.',
            '**Bắt biến thể chưa từng thấy nhưng "giống" cái đã thấy.** Luật khớp chính xác chuỗi ký tự; mô hình khớp *vùng* trong không gian đặc trưng. Đổi tên tệp không thoát được mô hình dựa trên cấu trúc.',
            '**Xếp hạng thay vì chặn/không chặn.** Mô hình cho điểm liên tục từ 0 đến 1, nên bạn điều chỉnh được: hôm nay siết chặt, ngày mai nới ra, tuỳ khối lượng nhân sự SOC. Một luật thì hoặc bật hoặc tắt.',
          ],
        },
        { t: 'h', text: 'Ba việc luật cố định vẫn thắng', level: 2 },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Cái đã biết chắc chắn.** Có hash của mã độc? Chặn hash. Đừng huấn luyện mô hình để làm việc mà một phép so sánh chuỗi làm được với độ chính xác 100% và chi phí 0.',
            '**Giải thích cho người khác.** Khi kiểm toán viên hỏi "vì sao chặn giao dịch này", câu "vì luật SIG-4471 khớp" thắng tuyệt đối câu "vì mô hình cho điểm 0,83".',
            '**Sửa ngay lập tức.** Sai luật thì sửa trong 2 phút. Sai mô hình thì phải thu thập dữ liệu, huấn luyện lại, kiểm định, triển khai — nhanh nhất cũng vài ngày.',
          ],
        },
        {
          t: 'compare',
          title: 'Chọn công cụ theo bài toán',
          left: {
            title: 'Dùng LUẬT khi…',
            icon: 'settings',
            items: [
              'Dấu hiệu là xác định và bất biến (hash, CVE, chữ ký YARA)',
              'Cần giải thích pháp lý hoặc tuân thủ',
              'Không có dữ liệu gắn nhãn',
              'Cần triển khai trong vài giờ',
              'Chi phí một lần chặn nhầm là cực lớn',
            ],
          },
          right: {
            title: 'Dùng MÔ HÌNH khi…',
            icon: 'brain',
            items: [
              'Có nhiều tín hiệu yếu, không cái nào đủ mạnh một mình',
              'Đối thủ liên tục biến đổi bề mặt nhưng giữ hành vi lõi',
              'Có kho dữ liệu lịch sử đã gắn nhãn tương đối',
              'Cần xếp hạng ưu tiên hàng chục nghìn sự kiện',
              'Chấp nhận được một tỉ lệ sai nhất định và có quy trình xử lý',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'Chuyện có thật: khi mô hình học nhầm thứ',
          md: 'Một đội xây mô hình phát hiện mã độc đạt độ chính xác 99% trên tập kiểm tra. Triển khai thật thì thảm hoạ. Nguyên nhân: mẫu mã độc được tải từ một kho công khai và **tất cả** đều bị nén bằng UPX, còn tệp lành lấy từ thư mục `Program Files` thì không. Mô hình đã học một quy luật hoàn hảo: "có UPX = độc". Nó chưa bao giờ học về mã độc cả. Hiện tượng này gọi là **tương quan giả** (spurious correlation) và nó phổ biến đến mức đáng sợ.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't0l1-cp1',
              kind: 'mcq',
              tags: ['ml-vs-rule', 'nen-tang'],
              q: 'Bạn có danh sách 40.000 hash của mã độc đã biết. Cách xử lý đúng nhất?',
              options: [
                'Huấn luyện một mạng nơ-ron để học các hash đó',
                'Đưa vào danh sách chặn và so khớp trực tiếp',
                'Dùng học không giám sát để phân cụm các hash',
                'Chuyển hash thành đặc trưng cho mô hình cây quyết định',
              ],
              answer: 1,
              why: 'Hash là dấu hiệu xác định: so khớp cho kết quả đúng 100%, tức thời, chi phí gần bằng 0. Dùng ML ở đây vừa chậm hơn vừa kém chính xác hơn. Hơn nữa hash được thiết kế để đổi hoàn toàn khi đổi 1 bit — không có "quy luật" nào cho mô hình học cả.',
              distractorWhy: [
                'Mạng nơ-ron không thể tổng quát hoá từ hash: theo thiết kế, hash của hai tệp gần giống nhau lại hoàn toàn khác nhau.',
                '',
                'Phân cụm hash là vô nghĩa vì khoảng cách giữa các hash không mang thông tin ngữ nghĩa.',
                'Cùng lý do: hash không có cấu trúc để cây học.',
              ],
            },
            {
              id: 't0l1-cp2',
              kind: 'truefalse',
              tags: ['ml-vs-rule'],
              q: 'Một mô hình học máy tốt sẽ thay thế hoàn toàn hệ thống luật trong SOC.',
              answer: false,
              why: 'Thực tế ngược lại: hệ thống phát hiện trưởng thành luôn xếp tầng. Luật bắt cái đã biết với chi phí thấp và độ tin cậy cao; mô hình xử lý phần xám còn lại. Bỏ luật đi là tự nguyện trả giá đắt hơn cho kết quả kém hơn ở phần dễ nhất.',
            },
          ],
        },
        { t: 'h', text: 'Bộ lọc phát hiện quảng cáo rỗng', level: 2 },
        {
          t: 'p',
          md: 'Ngành bảo mật ngập trong marketing về AI. Đây là bốn câu hỏi cắt qua mọi lớp sơn — bạn sẽ hiểu đầy đủ vì sao chúng sắc bén sau chặng 4, nhưng hãy ghi lại ngay từ bây giờ:',
        },
        {
          t: 'checklist',
          title: 'Hỏi nhà cung cấp bốn câu này',
          items: [
            'Tỉ lệ báo động giả (false positive rate) là bao nhiêu, đo trên bao nhiêu sự kiện lành tính mỗi ngày?',
            'Mô hình được huấn luyện và kiểm định trên dữ liệu của khoảng thời gian nào? Tập kiểm tra có tách theo thời gian không?',
            'Khi mô hình cảnh báo, analyst nhìn thấy lý do gì để điều tra tiếp?',
            'Mô hình được huấn luyện lại bao lâu một lần, và ai quyết định khi nào cần?',
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bẫy số 1 của cả ngành',
          md: 'Câu "độ chính xác 99,9%" gần như luôn vô nghĩa trong bảo mật. Nếu 1 trong 10.000 email là lừa đảo, tôi viết được một chương trình đạt độ chính xác **99,99%** trong ba giây: `return "an toàn"` cho mọi email. Nó bỏ sót 100% các cuộc tấn công. Ta sẽ mổ xẻ đầy đủ chuyện này ở chặng "Đo lường & ra quyết định" — nó quan trọng đến mức xứng đáng cả một chặng riêng.',
        },
        {
          t: 'terms',
          ids: ['mo-hinh', 'dac-trung', 'nhan', 'duong-co-so', 'bao-dong-gia'],
        },
      ],
      keyTakeaways: [
        'Học máy = viết chương trình bằng ví dụ; kết quả là "mô hình", chỉ là một tập số biến đầu vào thành điểm số.',
        'ML mạnh ở tổng hợp tín hiệu yếu và bắt biến thể; luật mạnh ở cái đã biết, khả năng giải thích và tốc độ sửa.',
        'Hệ thống phát hiện thật luôn xếp tầng luật + mô hình, không thay thế nhau.',
        'Mô hình học quy luật thống kê trong dữ liệu bạn đưa cho nó — kể cả quy luật vô nghĩa như "có UPX = độc".',
        'Con số "độ chính xác" đứng một mình là dấu hiệu của quảng cáo, không phải kỹ thuật.',
      ],
      cards: [
        {
          id: 't0l1-c1',
          front: 'Khác biệt cốt lõi giữa lập trình truyền thống và học máy là gì?',
          back: 'Lập trình truyền thống: người viết luật → máy áp dụng. Học máy: người đưa ví dụ (dữ liệu + đáp án) → máy tự tìm ra luật.',
          tags: ['nen-tang'],
        },
        {
          id: 't0l1-c2',
          front: 'Nêu ba việc luật cố định làm tốt hơn mô hình học máy.',
          back: 'Bắt dấu hiệu xác định đã biết (hash, chữ ký); giải thích được cho kiểm toán; sửa được ngay trong vài phút.',
          tags: ['ml-vs-rule'],
        },
        {
          id: 't0l1-c3',
          front: 'Tương quan giả (spurious correlation) trong ML bảo mật là gì? Cho ví dụ.',
          back: 'Mô hình học một quy luật đúng trên dữ liệu huấn luyện nhưng vô nghĩa ngoài đời. Ví dụ: mọi mẫu mã độc đều nén UPX còn mẫu lành thì không → mô hình học "UPX = độc".',
          hint: 'Nghĩ về nguồn gốc của hai nhóm mẫu.',
          tags: ['bay-thuong-gap'],
        },
        {
          id: 't0l1-c4',
          front: 'Vì sao "độ chính xác 99,9%" thường vô nghĩa trong phát hiện tấn công?',
          back: 'Vì tấn công cực hiếm. Nếu chỉ 0,01% sự kiện là độc hại, mô hình luôn trả lời "lành" đã đạt 99,99% mà không phát hiện được gì.',
          tags: ['do-luong', 'mat-can-bang'],
        },
      ],
      quiz: [
        {
          id: 't0l1-q1',
          kind: 'mcq',
          tags: ['ml-vs-rule'],
          q: 'Đội của bạn cần chặn một chiến dịch phishing đang diễn ra ngay bây giờ, đã biết chính xác tên miền gửi thư. Hành động đầu tiên?',
          options: [
            'Thu thập dữ liệu và huấn luyện mô hình phân loại phishing',
            'Thêm luật chặn tên miền đó ngay, rồi mới tính chuyện dài hạn',
            'Chờ mô hình hiện có tự học từ các cảnh báo mới',
            'Tăng ngưỡng nhạy của mô hình hiện có lên tối đa',
          ],
          answer: 1,
          why: 'Ứng cứu sự cố ưu tiên chặn đứng thiệt hại. Luật cho tên miền đã biết là chính xác, tức thời và không tạo báo động giả. Mô hình là công cụ cho chiến dịch TIẾP THEO, chưa biết tên miền — không phải cho chiến dịch đang cháy.',
          distractorWhy: [
            'Huấn luyện mô hình mất nhiều ngày; cuộc tấn công đang diễn ra ngay lúc này.',
            '',
            'Mô hình không tự học theo thời gian thực trừ khi bạn xây riêng cơ chế đó, và kể cả có thì cũng quá chậm.',
            'Tăng độ nhạy tối đa sẽ làm ngập SOC bằng báo động giả trong khi vẫn có thể bỏ sót đúng tên miền này.',
          ],
        },
        {
          id: 't0l1-q2',
          kind: 'multi',
          tags: ['ml-vs-rule', 'nen-tang'],
          q: 'Tình huống nào phù hợp để dùng mô hình học máy hơn là luật? (Chọn tất cả đáp án đúng)',
          options: [
            'Xếp hạng 200.000 cảnh báo mỗi ngày để analyst xem cái nào trước',
            'Chặn một địa chỉ IP đã được xác nhận là máy chủ điều khiển',
            'Phát hiện email lừa đảo dùng câu chữ mới nhưng cấu trúc quen thuộc',
            'Chứng minh với kiểm toán viên vì sao một giao dịch bị từ chối',
          ],
          answers: [0, 2],
          why: 'Xếp hạng ưu tiên và nhận diện biến thể "na ná" chính là hai thế mạnh của mô hình: chúng cần tổng hợp nhiều tín hiệu yếu và cho ra điểm số liên tục. Chặn IP đã biết là việc của luật. Giải trình kiểm toán cần quy tắc rõ ràng, không phải điểm số mô hình.',
        },
        {
          id: 't0l1-q3',
          kind: 'input',
          tags: ['bay-thuong-gap'],
          q: 'Mô hình đạt 99% trên tập kiểm tra nhưng thất bại khi triển khai, vì mọi mẫu độc đều nén UPX còn mẫu lành thì không. Hiện tượng mô hình bám vào một dấu hiệu vô nghĩa như vậy gọi là gì?',
          accept: ['tuong quan gia', 'spurious correlation', 'tuong quan giả', 'shortcut learning'],
          placeholder: 'Gõ tên hiện tượng…',
          hint: 'Hai từ. Nói về mối liên hệ có trong dữ liệu nhưng không có trong thực tế.',
          why: 'Tương quan giả (spurious correlation), còn gọi là "học đường tắt" (shortcut learning). Mô hình luôn tìm cách dễ nhất để phân biệt hai nhóm — nếu cách dễ nhất là một tạo tác của quy trình thu thập dữ liệu, nó sẽ học đúng cái đó.',
        },
        {
          id: 't0l1-q4',
          kind: 'order',
          tags: ['quy-trinh'],
          q: 'Sắp xếp các bước của một hệ thống phát hiện dựa trên ML theo đúng thứ tự.',
          items: [
            'Thu thập dữ liệu thô (log, tệp, luồng mạng)',
            'Trích xuất đặc trưng thành các con số',
            'Huấn luyện mô hình trên dữ liệu đã gắn nhãn',
            'Chọn ngưỡng dựa trên chi phí sai sót',
            'Triển khai và giám sát trôi dữ liệu',
          ],
          why: 'Không thể có đặc trưng khi chưa có dữ liệu, không thể huấn luyện khi chưa có đặc trưng, và ngưỡng chỉ chọn được sau khi biết mô hình cho điểm thế nào. Giám sát là bước cuối nhưng không bao giờ kết thúc — vì đối thủ vẫn đang thay đổi.',
        },
      ],
      terms: ['mo-hinh', 'dac-trung', 'nhan', 'duong-co-so', 'bao-dong-gia'],
      further: [
        {
          title: 'Machine Learning and Security — Chio & Freeman',
          note: 'Sách nền tảng, thực dụng, viết bởi người làm sản phẩm thật chứ không phải học thuật thuần.',
        },
        {
          title: 'The Base Rate Fallacy and its Implications for Intrusion Detection — Axelsson (1999)',
          note: 'Bài báo cổ điển giải thích bằng toán vì sao IDS luôn ngập báo động giả. Cũ nhưng chưa bao giờ lỗi thời.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't0-l2',
      trackId: 'khoi-dong',
      title: 'Vì sao bảo mật là sân chơi khó nhất của ML',
      subtitle: 'Bốn đặc tính khiến mọi giáo trình ML phổ thông không dùng được nguyên xi',
      minutes: 11,
      practiceMinutes: 7,
      level: 'nen-tang',
      prereqs: ['t0-l1'],
      why: {
        short:
          'Bảo mật vi phạm gần như mọi giả định mà giáo trình ML tiêu chuẩn dựa vào; biết trước bốn khác biệt này giúp bạn không áp dụng sai công thức trong suốt sự nghiệp.',
        scenario:
          'Bạn tuyển một data scientist giỏi từ ngành thương mại điện tử. Ba tháng sau, mô hình của họ đạt AUC 0,98 trong thí nghiệm nhưng tạo 900 cảnh báo giả mỗi ngày khi chạy thật. Bạn cần giải thích được chuyện gì đã xảy ra.',
        roles: ['Security Data Scientist', 'Detection Engineer', 'ML Engineer'],
        costOfNotKnowing:
          'Bạn sẽ lặp lại sai lầm kinh điển: tối ưu chỉ số sai, chia dữ liệu sai cách, và xây một mô hình sụp đổ ngay tuần đầu tiên tiếp xúc với kẻ tấn công thật.',
      },
      objectives: [
        'Liệt kê và giải thích được bốn đặc tính riêng của dữ liệu bảo mật',
        'Dự đoán được hậu quả cụ thể của mỗi đặc tính lên thiết kế mô hình',
        'Giải thích được vì sao độ chính xác cao trong phòng lab không đảm bảo gì ngoài đời',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Nếu bạn học ML từ khoá học phổ thông, bạn được dạy trên bài toán nhận diện chữ số viết tay hoặc dự đoán giá nhà. Những bài toán đó có bốn đặc tính êm đềm mà bảo mật **không có cái nào**.',
        },
        {
          t: 'steps',
          title: 'Bốn khác biệt sống còn',
          steps: [
            {
              title: 'Mất cân bằng cực đoan',
              md: 'Trong nhận diện chữ số, mỗi chữ số chiếm ~10% dữ liệu. Trong bảo mật, tỉ lệ tấn công thật có thể là **1 trên 1 triệu** sự kiện. Hệ quả: độ chính xác trở nên vô dụng, ROC-AUC trở nên gây hiểu nhầm, và một mô hình tăng tỉ lệ báo động giả từ 0,1% lên 0,2% có thể **nhân đôi** khối lượng công việc của cả đội SOC.',
            },
            {
              title: 'Đối thủ có trí tuệ và động cơ',
              md: 'Chữ số viết tay không tự thay đổi để đánh lừa bạn. Kẻ tấn công thì có, và họ được trả tiền để làm việc đó. Đây gọi là môi trường **đối kháng** (adversarial). Hệ quả: mọi đặc trưng dễ thay đổi (tên tệp, User-Agent, độ dài chuỗi) sẽ bị thay đổi ngay khi nó trở nên quan trọng. Bạn phải chọn đặc trưng theo tiêu chí "kẻ tấn công tốn bao nhiêu để né".',
            },
            {
              title: 'Chi phí sai sót lệch và bất đối xứng',
              md: 'Bỏ sót một cuộc tấn công ransomware có thể tốn hàng triệu đô. Một báo động giả tốn 15 phút của analyst. Nhưng 900 báo động giả mỗi ngày thì tốn cả đội — và tệ hơn, tạo ra **mù cảnh báo**: người ta bắt đầu bấm "bỏ qua" theo phản xạ, kể cả với cảnh báo thật. Chi phí không cộng tuyến tính.',
            },
            {
              title: 'Nhãn hiếm, muộn và bẩn',
              md: 'Ai nói cho bạn biết sự kiện nào là tấn công? Trong thương mại điện tử, khách bấm mua là bạn có nhãn ngay. Trong bảo mật, một xâm nhập có thể mất **trung bình vài tháng** mới bị phát hiện. Nghĩa là dữ liệu "lành tính" năm ngoái của bạn có thể đang chứa cuộc tấn công mà bạn chưa biết. Bạn đang huấn luyện với nhãn sai mà không hay.',
            },
          ],
        },
        { t: 'figure', id: 'fig-imbalance', caption: 'Cùng một tỉ lệ báo động giả, khối lượng cảnh báo thay đổi ra sao khi lớp tấn công càng hiếm.' },
        {
          t: 'callout',
          kind: 'why',
          title: 'Vì sao bài này đáng 16 phút của bạn',
          md: 'Bốn đặc tính trên không phải lý thuyết suông — chúng quyết định **từng lựa chọn kỹ thuật** trong phần còn lại của khoá học: vì sao ta dùng PR-AUC thay ROC-AUC (đặc tính 1), vì sao ta ưu tiên đặc trưng hành vi hơn đặc trưng bề mặt (đặc tính 2), vì sao ta chọn ngưỡng bằng ma trận chi phí (đặc tính 3), vì sao ta chia dữ liệu theo thời gian (đặc tính 4). Nắm được ở đây, mọi thứ sau này sẽ có lý do rõ ràng thay vì là quy tắc phải học thuộc.',
        },
        {
          t: 'predict',
          question:
            'Một mô hình phát hiện xâm nhập có tỉ lệ báo động giả 0,1% — nghe rất nhỏ. Hệ thống của bạn xử lý 10 triệu sự kiện mạng mỗi ngày, trong đó có khoảng 10 sự kiện thực sự độc hại. Mỗi ngày analyst sẽ phải xem bao nhiêu cảnh báo, và bao nhiêu phần trăm trong số đó là thật?',
          reveal:
            'Báo động giả: 10.000.000 × 0,001 ≈ **10.000 cảnh báo/ngày**. Cảnh báo thật: tối đa 10. Tỉ lệ cảnh báo đúng ≈ **0,1%** — cứ 1.000 cảnh báo mới có 1 cái thật. Không đội SOC nào trên đời xử lý nổi. Đây chính là nghịch lý tỉ lệ nền, và nó là lý do bài học quan trọng nhất của cả khoá nằm ở chặng 1.',
        },
        { t: 'lab', id: 'lab-alert-load', intro: 'Tự vặn các con số và xem đội SOC của bạn sống sót được không.' },
        {
          t: 'h',
          text: 'Hệ quả trực tiếp lên cách bạn làm việc',
          level: 2,
        },
        {
          t: 'table',
          head: ['Đặc tính của bảo mật', 'Điều bạn PHẢI làm khác', 'Bài học sẽ dạy'],
          rows: [
            ['Mất cân bằng cực đoan', 'Dùng precision/recall và PR-AUC, không dùng accuracy', 'Chặng 2 & 4'],
            ['Đối thủ thích nghi', 'Chọn đặc trưng đắt tiền để né; giả định mô hình sẽ bị tấn công', 'Chặng 5 & 8'],
            ['Chi phí bất đối xứng', 'Chọn ngưỡng theo ma trận chi phí, không dùng 0,5', 'Chặng 4'],
            ['Nhãn muộn và bẩn', 'Chia dữ liệu theo thời gian; đánh giá lại nhãn định kỳ', 'Chặng 2'],
          ],
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't0l2-cp1',
              kind: 'mcq',
              tags: ['dac-thu-bao-mat', 'mat-can-bang'],
              q: 'Vì sao ROC-AUC có thể gây hiểu nhầm nghiêm trọng trong phát hiện xâm nhập?',
              options: [
                'Vì nó chỉ dùng được cho mô hình hồi quy',
                'Vì nó dựa trên tỉ lệ báo động giả, mà tỉ lệ này nhỏ ngay cả khi số lượng cảnh báo giả tuyệt đối là khổng lồ',
                'Vì nó luôn thấp hơn accuracy',
                'Vì nó cần nhãn của cả hai lớp mà ta chỉ có một lớp',
              ],
              answer: 1,
              why: 'ROC vẽ TPR theo FPR. FPR có mẫu số là **toàn bộ** sự kiện lành tính — một con số khổng lồ. FPR 0,1% nghe đẹp nhưng với 10 triệu sự kiện là 10.000 cảnh báo giả. PR-AUC dùng precision, mà precision có mẫu số là số cảnh báo mô hình đưa ra, nên nó phản ánh trung thực trải nghiệm của analyst.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Mẹo thực chiến',
          md: 'Khi ai đó trình bày kết quả mô hình bảo mật, câu hỏi đầu tiên của bạn nên là: **"Tập kiểm tra có bao nhiêu mẫu lành tính, và con số cảnh báo giả tuyệt đối mỗi ngày là bao nhiêu?"** Câu hỏi này lộ ra ngay liệu người trình bày có hiểu bài toán của mình hay không.',
        },
      ],
      keyTakeaways: [
        'Bốn đặc tính riêng của bảo mật: mất cân bằng cực đoan, đối thủ thích nghi, chi phí bất đối xứng, nhãn hiếm và muộn.',
        'FPR nhỏ vẫn tạo ra số cảnh báo giả tuyệt đối khổng lồ khi lưu lượng lớn — luôn quy về con số cảnh báo/ngày.',
        'Đối thủ sẽ thay đổi đúng những đặc trưng mà mô hình của bạn phụ thuộc vào nhiều nhất.',
        'Nhãn trong bảo mật đến muộn hàng tháng; dữ liệu "lành tính" cũ có thể chứa tấn công chưa bị phát hiện.',
        'Mọi lựa chọn kỹ thuật trong khoá học này đều truy ngược về một trong bốn đặc tính trên.',
      ],
      cards: [
        {
          id: 't0l2-c1',
          front: 'Kể bốn đặc tính khiến ML trong bảo mật khác với ML thông thường.',
          back: '1) Mất cân bằng cực đoan. 2) Đối thủ có trí tuệ và thích nghi. 3) Chi phí sai sót bất đối xứng và phi tuyến. 4) Nhãn hiếm, đến muộn, và bẩn.',
          tags: ['dac-thu-bao-mat'],
        },
        {
          id: 't0l2-c2',
          front: '10 triệu sự kiện/ngày, FPR = 0,1%. Mỗi ngày có bao nhiêu cảnh báo giả?',
          back: '10.000 cảnh báo giả mỗi ngày. FPR nhỏ nhân với lưu lượng lớn vẫn ra con số không thể xử lý.',
          tags: ['do-luong', 'base-rate'],
        },
        {
          id: 't0l2-c3',
          front: 'Vì sao không nên chia dữ liệu bảo mật ngẫu nhiên thành train/test?',
          back: 'Vì tấn công có tính thời gian: chia ngẫu nhiên khiến mô hình "nhìn thấy tương lai", cho kết quả đẹp giả tạo. Phải chia theo mốc thời gian.',
          tags: ['ro-ri-du-lieu'],
        },
        {
          id: 't0l2-c4',
          front: 'Nguyên tắc chọn đặc trưng trong môi trường đối kháng là gì?',
          back: 'Ưu tiên đặc trưng mà kẻ tấn công phải trả giá cao mới thay đổi được (hành vi lõi), tránh đặc trưng bề mặt đổi được miễn phí (tên tệp, User-Agent).',
          tags: ['dac-trung', 'adversarial'],
        },
      ],
      quiz: [
        {
          id: 't0l2-q1',
          kind: 'mcq',
          tags: ['adversarial', 'dac-trung'],
          q: 'Mô hình phát hiện mã độc của bạn phụ thuộc mạnh vào đặc trưng "tên tệp chứa chuỗi số ngẫu nhiên". Chuyện gì nhiều khả năng xảy ra sau khi triển khai?',
          options: [
            'Mô hình sẽ dần chính xác hơn khi thấy nhiều dữ liệu',
            'Kẻ tấn công đặt tên tệp giống tệp hệ thống và đặc trưng đó mất tác dụng',
            'Đặc trưng này sẽ giúp mô hình tổng quát hoá tốt hơn',
            'Không có gì thay đổi vì tên tệp không quan trọng với kẻ tấn công',
          ],
          answer: 1,
          why: 'Tên tệp là đặc trưng bề mặt: đổi nó tốn 0 giây và 0 đồng. Trong môi trường đối kháng, mọi đặc trưng rẻ tiền để thay đổi mà lại quan trọng với mô hình sẽ bị vô hiệu hoá ngay khi kẻ tấn công nhận ra. Đặc trưng tốt là đặc trưng gắn với **hành vi cần thiết** của mã độc (gọi API để mã hoá tệp, tiêm vào tiến trình khác) — né được nhưng phải trả giá.',
        },
        {
          id: 't0l2-q2',
          kind: 'mcq',
          tags: ['ro-ri-du-lieu'],
          q: 'Dữ liệu "lành tính" của bạn là toàn bộ log năm ngoái không có cảnh báo nào. Rủi ro lớn nhất khi dùng nó làm nhãn âm là gì?',
          options: [
            'Dữ liệu quá cũ nên định dạng log đã thay đổi',
            'Có thể chứa các cuộc tấn công chưa bị phát hiện, dạy mô hình rằng chúng là bình thường',
            'Log năm ngoái quá ít so với nhu cầu huấn luyện',
            'Không có rủi ro gì nếu số lượng đủ lớn',
          ],
          answer: 1,
          why: 'Thời gian phát hiện xâm nhập trung bình được tính bằng tuần đến tháng. "Không có cảnh báo" không đồng nghĩa với "không có tấn công" — nó chỉ có nghĩa là hệ thống hiện tại không thấy. Bạn đang dạy mô hình mới lặp lại đúng điểm mù của hệ thống cũ.',
        },
        {
          id: 't0l2-q3',
          kind: 'match',
          tags: ['dac-thu-bao-mat'],
          q: 'Nối mỗi đặc tính của bảo mật với hệ quả kỹ thuật trực tiếp của nó.',
          pairs: [
            ['Mất cân bằng cực đoan', 'Dùng PR-AUC thay vì accuracy'],
            ['Đối thủ thích nghi', 'Chọn đặc trưng đắt tiền để né tránh'],
            ['Chi phí bất đối xứng', 'Chọn ngưỡng theo ma trận chi phí'],
            ['Nhãn đến muộn', 'Chia train/test theo mốc thời gian'],
          ],
          why: 'Mỗi đặc tính dẫn thẳng tới một quyết định thiết kế cụ thể. Nếu bạn nhớ được bốn cặp này, bạn đã có khung tư duy để tự đánh giá bất kỳ hệ thống ML bảo mật nào.',
        },
        {
          id: 't0l2-q4',
          kind: 'truefalse',
          tags: ['do-luong'],
          q: 'Giảm tỉ lệ báo động giả từ 1% xuống 0,5% sẽ giảm một nửa khối lượng công việc của analyst.',
          answer: true,
          why: 'Đúng về số lượng cảnh báo giả — chúng giảm một nửa. Nhưng hãy cẩn thận: điều này thường đi kèm việc giảm recall (bỏ sót nhiều hơn), và tác động thật lên đội SOC còn phụ thuộc vào việc cảnh báo có được nhóm lại, làm giàu ngữ cảnh và tự động phân loại hay không. Con số tuyệt đối luôn quan trọng hơn tỉ lệ.',
        },
      ],
      terms: ['bao-dong-gia', 'bo-sot', 'doi-khang', 'mat-can-bang', 'troi-khai-niem'],
      further: [
        {
          title: 'Outside the Closed World: On Using ML for Network Intrusion Detection — Sommer & Paxson (2010)',
          note: 'Bài báo kinh điển giải thích vì sao ML trong IDS khó hơn mọi người tưởng. Vẫn đúng sau hơn một thập kỷ.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't0-l3',
      trackId: 'khoi-dong',
      title: 'Bản đồ các bài toán bảo mật dùng ML',
      subtitle: 'Mười hai bài toán, mỗi bài toán một dạng dữ liệu và một loại mô hình',
      minutes: 7,
      practiceMinutes: 1,
      level: 'nen-tang',
      prereqs: ['t0-l2'],
      why: {
        short:
          'Có bản đồ tổng thể trước khi đi vào chi tiết giúp bạn biết mỗi kiến thức mới thuộc về đâu — đây là điều kiện để nhớ lâu thay vì học vẹt.',
        scenario:
          'Bạn được giao nhiệm vụ "dùng AI cải thiện năng lực phát hiện". Câu hỏi đầu tiên phải là: cải thiện bài toán nào? Bản đồ này là danh sách lựa chọn của bạn.',
        roles: ['Security Architect', 'Detection Engineer', 'Security Data Scientist'],
        costOfNotKnowing:
          'Bạn sẽ học rời rạc từng thuật toán mà không biết dùng vào đâu — kiến thức rơi rụng gần hết sau vài tháng vì không có cấu trúc để bám vào.',
      },
      objectives: [
        'Kể tên và mô tả được 12 bài toán bảo mật ứng dụng ML',
        'Ghép được mỗi bài toán với loại dữ liệu đầu vào và họ mô hình phù hợp',
        'Xác định được bài toán nào phù hợp với tổ chức có dữ liệu sẵn có nhất định',
      ],
      blocks: [
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao học bản đồ trước',
          md: 'Nghiên cứu về trí nhớ gọi cấu trúc tổng quan này là **advance organizer** (Ausubel). Não người nhớ thông tin gắn vào một khung sẵn có tốt hơn nhiều so với thông tin rời rạc. Mười phút đọc bản đồ này sẽ tiết kiệm cho bạn hàng giờ về sau — và app sẽ liên tục nhắc bạn "bài này nằm ở đâu trên bản đồ".',
        },
        { t: 'figure', id: 'fig-kill-chain', caption: 'Mỗi giai đoạn của một cuộc tấn công có bài toán ML tương ứng. ML không phải một khối, mà là mười hai công cụ khác nhau.' },
        { t: 'h', text: 'Nhóm A — Phân loại nội dung độc hại', level: 2 },
        {
          t: 'table',
          head: ['Bài toán', 'Dữ liệu vào', 'Kiểu học', 'Học ở chặng'],
          rows: [
            ['Phát hiện phishing (email/web)', 'Văn bản, HTML, URL, tiêu đề thư', 'Phân loại nhị phân có giám sát', '6'],
            ['Phân loại mã độc — tĩnh', 'PE header, imports, byte n-gram, entropy', 'Phân loại có giám sát', '6'],
            ['Phân loại mã độc — động', 'Chuỗi lời gọi API, hành vi sandbox', 'Mô hình chuỗi', '6'],
            ['Phát hiện tên miền DGA', 'Chuỗi ký tự tên miền', 'Phân loại chuỗi / entropy', '6'],
          ],
        },
        { t: 'h', text: 'Nhóm B — Phát hiện bất thường trong hành vi', level: 2 },
        {
          t: 'table',
          head: ['Bài toán', 'Dữ liệu vào', 'Kiểu học', 'Học ở chặng'],
          rows: [
            ['Phát hiện xâm nhập mạng', 'NetFlow, Zeek, gói tin', 'Có giám sát + bất thường', '6'],
            ['UEBA — hành vi người dùng', 'Log đăng nhập, truy cập tệp, thời gian', 'Bất thường không giám sát', '6'],
            ['Mối đe doạ nội bộ', 'Hành vi dài hạn, ngữ cảnh nhân sự', 'Bất thường + luật', '6'],
            ['Bất thường trong log hệ thống', 'Chuỗi sự kiện log có cấu trúc', 'Mô hình chuỗi / autoencoder', '6'],
          ],
        },
        { t: 'h', text: 'Nhóm C — Ưu tiên hoá và tự động hoá', level: 2 },
        {
          t: 'table',
          head: ['Bài toán', 'Dữ liệu vào', 'Kiểu học', 'Học ở chặng'],
          rows: [
            ['Xếp hạng & phân loại cảnh báo', 'Cảnh báo + ngữ cảnh + lịch sử xử lý', 'Xếp hạng có giám sát', '10'],
            ['Ưu tiên vá lỗ hổng', 'CVE, EPSS, tài sản, khai thác thực tế', 'Hồi quy / xếp hạng', '10'],
            ['Phát hiện gian lận & chiếm tài khoản', 'Giao dịch, thiết bị, hành vi phiên', 'Phân loại mất cân bằng', '6'],
            ['Phân tích quan hệ & di chuyển ngang', 'Đồ thị tài khoản – máy – phiên', 'Học trên đồ thị', '6'],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Cách chọn bài toán đầu tiên trong tổ chức thật',
          md: 'Đừng chọn bài toán "oách" nhất. Chọn theo ba tiêu chí, xếp theo thứ tự: **(1)** bạn đã có dữ liệu và nhãn chưa; **(2)** có ai đó sẽ thực sự dùng kết quả không; **(3)** sai thì hậu quả có chịu được không. Bài toán xếp hạng cảnh báo thường thắng cả ba — bạn đã có sẵn lịch sử analyst đóng cảnh báo, đó chính là nhãn.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't0l3-cp1',
              kind: 'mcq',
              tags: ['ban-do-bai-toan'],
              q: 'Tổ chức của bạn có 3 năm lịch sử cảnh báo với ghi chú của analyst (đúng/sai/đã xử lý). Bài toán ML nào có khả năng thành công cao nhất để bắt đầu?',
              options: [
                'Phân loại mã độc từ byte thô bằng deep learning',
                'Xếp hạng ưu tiên cảnh báo dựa trên lịch sử xử lý',
                'Phát hiện mối đe doạ nội bộ bằng học không giám sát',
                'Phát hiện lỗ hổng zero-day trong mã nguồn',
              ],
              answer: 1,
              why: 'Ghi chú của analyst chính là nhãn miễn phí, chất lượng khá, và số lượng lớn — thứ hiếm nhất trong ML bảo mật. Ba lựa chọn còn lại đều cần dữ liệu bạn chưa có hoặc không có nhãn đáng tin.',
            },
          ],
        },
        {
          t: 'p',
          md: 'Bản đồ này sẽ xuất hiện lại nhiều lần. Mỗi khi học một kỹ thuật mới, hãy tự hỏi: **kỹ thuật này phục vụ ô nào trên bản đồ?** Thói quen đó là khác biệt giữa người có kiến thức và người có bộ sưu tập thuật ngữ.',
        },
      ],
      keyTakeaways: [
        'ML trong bảo mật không phải một bài toán mà là ~12 bài toán khác nhau, mỗi bài toán có dạng dữ liệu và họ mô hình riêng.',
        'Ba nhóm lớn: phân loại nội dung độc hại, phát hiện bất thường hành vi, và ưu tiên hoá/tự động hoá.',
        'Bài toán khả thi nhất để bắt đầu thường là bài toán bạn đã sẵn có nhãn — thường là xếp hạng cảnh báo.',
        'Luôn định vị kiến thức mới trên bản đồ; kiến thức không có chỗ bám sẽ rơi rụng.',
      ],
      cards: [
        {
          id: 't0l3-c1',
          front: 'Ba nhóm lớn của bài toán ML trong bảo mật là gì?',
          back: 'A) Phân loại nội dung độc hại (phishing, mã độc, DGA). B) Phát hiện bất thường hành vi (mạng, người dùng, log). C) Ưu tiên hoá & tự động hoá (xếp hạng cảnh báo, ưu tiên vá, gian lận).',
          tags: ['ban-do-bai-toan'],
        },
        {
          id: 't0l3-c2',
          front: 'Vì sao xếp hạng cảnh báo thường là bài toán ML đầu tiên nên làm trong một tổ chức?',
          back: 'Vì lịch sử xử lý cảnh báo của analyst đã là nhãn sẵn có, số lượng lớn và miễn phí — thứ khan hiếm nhất trong ML bảo mật.',
          tags: ['ban-do-bai-toan', 'thuc-chien'],
        },
        {
          id: 't0l3-c3',
          front: 'Ba tiêu chí chọn bài toán ML đầu tiên, theo thứ tự ưu tiên?',
          back: '1) Đã có dữ liệu và nhãn chưa. 2) Có ai sẽ thực sự dùng kết quả không. 3) Hậu quả khi sai có chịu được không.',
          tags: ['thuc-chien'],
        },
      ],
      quiz: [
        {
          id: 't0l3-q1',
          kind: 'match',
          tags: ['ban-do-bai-toan'],
          q: 'Nối bài toán với loại dữ liệu đầu vào đặc trưng của nó.',
          pairs: [
            ['Phát hiện DGA', 'Chuỗi ký tự tên miền'],
            ['Phân loại mã độc tĩnh', 'PE header và bảng imports'],
            ['UEBA', 'Log đăng nhập và truy cập tệp theo thời gian'],
            ['Di chuyển ngang', 'Đồ thị quan hệ tài khoản – máy'],
          ],
          why: 'Mỗi bài toán có một "hình dạng dữ liệu" riêng, và hình dạng đó quyết định họ mô hình. Chuỗi ký tự → mô hình chuỗi. Bảng số → gradient boosting. Quan hệ → đồ thị. Đây là bước suy luận đầu tiên khi gặp bài toán mới.',
        },
        {
          id: 't0l3-q2',
          kind: 'mcq',
          tags: ['ban-do-bai-toan', 'thuc-chien'],
          q: 'Một công ty chỉ có log firewall thô, không có nhãn tấn công nào. Hướng tiếp cận thực tế nhất?',
          options: [
            'Huấn luyện mô hình phân loại có giám sát ngay',
            'Bắt đầu bằng phát hiện bất thường không giám sát và xây dần nhãn từ kết quả điều tra',
            'Mua bộ dữ liệu tấn công công khai và huấn luyện trên đó',
            'Không làm được gì cho tới khi có nhãn',
          ],
          answer: 1,
          why: 'Không có nhãn thì không huấn luyện có giám sát được. Học không giám sát cho phép bắt đầu, và mỗi lần analyst điều tra một bất thường, bạn thu được một nhãn — dần dần xây được tập dữ liệu có giám sát. Mua bộ dữ liệu ngoài thường thất bại vì phân phối lưu lượng của mỗi tổ chức rất khác nhau.',
        },
      ],
      terms: ['ueba', 'dga', 'phan-loai', 'bat-thuong'],
    },

    /* ====================================================================== */
    {
      id: 't0-l4',
      trackId: 'khoi-dong',
      title: 'Cách học để sáu tháng sau vẫn còn nhớ',
      subtitle: 'Bài học về chính việc học — và cách app này được thiết kế quanh nó',
      minutes: 9,
      practiceMinutes: 6,
      level: 'nen-tang',
      why: {
        short:
          'Bạn sắp bỏ ra hàng chục giờ cho khoá này; 12 phút ở đây quyết định bạn giữ lại 20% hay 80% số đó sau nửa năm.',
        scenario:
          'Sáu tháng sau khi học xong, bạn ngồi phỏng vấn vị trí Detection Engineer. Người ta hỏi vì sao dùng PR-AUC thay ROC-AUC. Bạn hoặc trả lời trôi chảy, hoặc mơ hồ nhớ là "có học rồi".',
        roles: ['SOC Analyst', 'Detection Engineer', 'Security Data Scientist', 'ML Engineer'],
        costOfNotKnowing:
          'Bạn học theo cách quen thuộc — đọc lại, tô màu, xem video — những cách được chứng minh là tạo ảo giác thông thạo nhưng hiệu quả ghi nhớ thấp nhất.',
      },
      objectives: [
        'Giải thích được đường cong quên và vì sao ôn tập giãn cách bẻ được nó',
        'Phân biệt được "cảm giác thuộc bài" và "thực sự nhớ được"',
        'Sử dụng đúng bốn cơ chế của app: dự đoán, truy hồi, thẻ ôn, và xen kẽ',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bạn đọc kỹ một chương sách và cảm thấy hiểu hết. Không ôn lại. Theo bạn, sau 7 ngày bạn còn nhớ được khoảng bao nhiêu phần trăm?',
          reveal:
            'Thí nghiệm kinh điển của Ebbinghaus (1885), được lặp lại nhiều lần cho tới nay, cho kết quả tàn nhẫn: sau 1 ngày còn ~35%, sau 7 ngày còn khoảng **20–25%**. Cảm giác "hiểu hết" khi đọc là có thật — nhưng đó là cảm giác về việc **nhận ra** (recognition), không phải khả năng **gọi ra** (recall). Hai thứ này khác nhau về bản chất, và chỉ cái thứ hai mới dùng được trong công việc.',
        },
        { t: 'figure', id: 'fig-forgetting', caption: 'Mỗi lần ôn đúng lúc, đường cong quên thoải ra và khoảng cách an toàn dài thêm. Ôn 5 lần đúng thời điểm hiệu quả hơn đọc 20 lần liên tục.' },
        { t: 'h', text: 'Bốn cơ chế app này dùng — và vì sao', level: 2 },
        {
          t: 'steps',
          steps: [
            {
              title: 'Dự đoán trước khi giảng (hiệu ứng tiền kiểm tra)',
              md: 'Những ô "Thử đoán xem" bạn gặp trong mỗi bài không phải để kiểm tra bạn. Chúng tồn tại vì việc **cố gắng trả lời và sai** làm não bạn tiếp nhận lời giải thích sau đó mạnh hơn hẳn so với đọc thẳng. Đoán sai là một phần của thiết kế — đừng ngại.',
            },
            {
              title: 'Truy hồi thay vì đọc lại (hiệu ứng kiểm tra)',
              md: 'Các điểm dừng giữa bài buộc bạn gọi kiến thức ra khỏi đầu. Hành động lấy ra khỏi trí nhớ chính là thứ củng cố trí nhớ — đọc lại thì không. Đây là lý do app không có nút "đọc lại toàn bộ" nổi bật: nó là cái bẫy dễ chịu.',
            },
            {
              title: 'Ôn tập giãn cách đúng thời điểm (hiệu ứng giãn cách)',
              md: 'Mỗi bài sinh ra vài thẻ ghi nhớ. Hệ thống FSRS tính toán ngày bạn **sắp quên** và đưa thẻ đó ra đúng lúc. Ôn sớm hơn thì lãng phí, muộn hơn thì phải học lại. Bạn không cần tự quyết định — chỉ cần mở mục Ôn tập mỗi ngày.',
            },
            {
              title: 'Xen kẽ chủ đề (hiệu ứng interleaving)',
              md: 'Phần Luyện tập trộn câu hỏi từ nhiều chặng khác nhau thay vì gom theo chủ đề. Học kiểu này cho cảm giác khó hơn và kết quả tức thời kém hơn — nhưng khả năng **phân biệt** khi gặp bài toán thật cao hơn rõ rệt. Đây là một "khó khăn có ích" (desirable difficulty).',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Ba cách học phổ biến nhất cũng là ba cách kém hiệu quả nhất',
          md: '**Đọc lại nhiều lần**, **tô màu highlight**, và **xem video liên tục** đều tạo cảm giác trôi chảy khiến bạn tin là mình đã thuộc. Cảm giác đó gọi là **ảo tưởng thông thạo** (illusion of fluency). Kiểm tra đơn giản: gấp sách lại và tự nói ra ý chính bằng lời của bạn. Nếu không nói được, bạn chưa thuộc — bất kể cảm giác thế nào.',
        },
        { t: 'lab', id: 'lab-forgetting', intro: 'Tự tay chỉnh lịch ôn và xem trí nhớ của bạn diễn biến ra sao trong 90 ngày.' },
        {
          t: 'h',
          text: 'Cách dùng app này hiệu quả nhất',
          level: 2,
        },
        {
          t: 'checklist',
          title: 'Thói quen 20 phút mỗi ngày',
          items: [
            'Mở mục Ôn tập TRƯỚC, làm hết thẻ đến hạn (thường 5–8 phút). Đây là phần quan trọng nhất.',
            'Học 1 bài mới, không nhồi 5 bài. Não cần thời gian củng cố giữa các lần học.',
            'Khi gặp ô "Thử đoán xem", hãy thực sự đoán trước khi mở — kể cả khi bạn nghĩ mình không biết.',
            'Chấm điểm thẻ ôn thật thà. Bấm "Dễ" cho thẻ bạn thực ra phải nghĩ 5 giây là tự phá lịch của chính mình.',
            'Mỗi tuần một lần, vào Luyện tập xen kẽ để trộn các chủ đề.',
            'Học đều 20 phút/ngày thắng tuyệt đối 3 giờ vào chủ nhật.',
          ],
        },
        {
          t: 'callout',
          kind: 'why',
          title: 'Về chuỗi ngày học',
          md: 'App có đếm chuỗi ngày, nhưng cố tình đặt ngưỡng rất thấp (2 phút hoặc 3 thẻ) và **không** trừng phạt khi bạn nghỉ. Lý do: mục đích của chuỗi là duy trì thói quen, còn một chuỗi dễ gãy sẽ tạo cảm giác tội lỗi và khiến người ta bỏ hẳn. Nghỉ một ngày không xoá đi thứ bạn đã học — hệ thống ôn tập vẫn ở đó chờ bạn.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't0l4-cp1',
              kind: 'mcq',
              tags: ['cach-hoc'],
              q: 'Bạn có 30 phút. Cách nào giúp nhớ lâu nhất?',
              options: [
                'Đọc lại chương đã học 3 lần',
                'Tô màu các ý chính rồi đọc lại phần đã tô',
                'Gấp sách và tự viết ra những gì nhớ được, sau đó mở ra kiểm tra chỗ sai',
                'Xem lại video bài giảng ở tốc độ 1,5x',
              ],
              answer: 2,
              why: 'Đây là **truy hồi có phản hồi** — cách hiệu quả nhất trong mọi nghiên cứu về trí nhớ. Ba cách còn lại đều là "tiếp nhận thụ động": chúng tạo cảm giác quen thuộc (dễ chịu) nhưng không rèn được đường dẫn gọi thông tin ra khỏi trí nhớ. Sự khó chịu khi cố nhớ chính là lúc học đang diễn ra.',
            },
          ],
        },
      ],
      keyTakeaways: [
        'Đường cong quên: không ôn thì sau 7 ngày chỉ còn ~20–25% những gì đã học.',
        'Truy hồi (cố gọi ra khỏi đầu) củng cố trí nhớ; đọc lại thì không, dù cảm giác dễ chịu hơn nhiều.',
        'Ôn tập giãn cách đúng thời điểm sắp quên là cách rẻ nhất để biến kiến thức tạm thời thành lâu dài.',
        'Xen kẽ chủ đề khiến việc học khó hơn và chậm hơn tức thời, nhưng nhớ lâu và phân biệt tốt hơn.',
        'Ảo tưởng thông thạo là kẻ thù: cảm giác "hiểu rồi" không đồng nghĩa với "gọi ra được".',
        '20 phút/ngày đều đặn thắng 3 giờ dồn cuối tuần.',
      ],
      cards: [
        {
          id: 't0l4-c1',
          front: 'Đường cong quên của Ebbinghaus nói gì? Sau 7 ngày không ôn còn nhớ bao nhiêu?',
          back: 'Trí nhớ suy giảm rất nhanh lúc đầu rồi chậm dần. Không ôn lại thì sau 7 ngày chỉ còn khoảng 20–25%.',
          tags: ['cach-hoc'],
        },
        {
          id: 't0l4-c2',
          front: 'Vì sao truy hồi hiệu quả hơn đọc lại?',
          back: 'Hành động gọi thông tin ra khỏi trí nhớ chính là thứ củng cố đường dẫn tới thông tin đó. Đọc lại chỉ tạo cảm giác quen thuộc (ảo tưởng thông thạo) mà không rèn khả năng gọi ra.',
          tags: ['cach-hoc'],
        },
        {
          id: 't0l4-c3',
          front: '"Khó khăn có ích" (desirable difficulty) nghĩa là gì?',
          back: 'Điều kiện học khiến kết quả tức thời kém hơn nhưng ghi nhớ lâu dài và khả năng vận dụng tốt hơn — ví dụ xen kẽ chủ đề, giãn cách thời gian, tự kiểm tra thay vì đọc lại.',
          tags: ['cach-hoc'],
        },
        {
          id: 't0l4-c4',
          front: 'Ảo tưởng thông thạo (illusion of fluency) là gì và làm sao kiểm tra?',
          back: 'Cảm giác đã thuộc bài do đọc trôi chảy, dù chưa thực sự nhớ. Kiểm tra: gấp tài liệu, tự nói lại ý chính bằng lời mình. Nói không được = chưa thuộc.',
          tags: ['cach-hoc'],
        },
      ],
      quiz: [
        {
          id: 't0l4-q1',
          kind: 'mcq',
          tags: ['cach-hoc'],
          q: 'Khi ôn thẻ, bạn nhớ ra đáp án nhưng phải nghĩ mất khoảng 8 giây. Nên chấm mức nào?',
          options: ['Quên rồi', 'Khó', 'Được', 'Dễ'],
          answer: 1,
          why: '"Khó" là đúng: bạn có nhớ ra (nên không phải "Quên rồi") nhưng phải vật lộn, nghĩa là trí nhớ đang yếu và cần gặp lại sớm hơn. Chấm "Dễ" cho thẻ này sẽ đẩy lần ôn tiếp theo đi quá xa và bạn sẽ quên thật. Chấm thật thà là cách duy nhất để lịch ôn hoạt động.',
        },
        {
          id: 't0l4-q2',
          kind: 'truefalse',
          tags: ['cach-hoc'],
          q: 'Học xen kẽ nhiều chủ đề trong một buổi cho kết quả kiểm tra ngay tốt hơn học tập trung một chủ đề.',
          answer: false,
          why: 'Ngược lại — xen kẽ thường cho kết quả tức thời KÉM hơn, và đó chính là lý do nhiều người tránh nó. Nhưng khi kiểm tra sau vài tuần, nhóm học xen kẽ vượt trội rõ rệt, đặc biệt ở khả năng nhận ra "bài toán này thuộc loại nào". Đây là ví dụ điển hình của khó khăn có ích.',
        },
        {
          id: 't0l4-q3',
          kind: 'mcq',
          tags: ['cach-hoc'],
          q: 'Bạn bận và chỉ có 8 phút hôm nay. Nên làm gì?',
          options: [
            'Bỏ qua, mai học bù gấp đôi',
            'Làm hết thẻ ôn đến hạn, bỏ bài mới',
            'Học bài mới, bỏ ôn tập',
            'Đọc lướt lại bài hôm qua',
          ],
          answer: 1,
          why: 'Thẻ đến hạn là những kiến thức đang ở ngưỡng sắp quên — bỏ qua chúng là để công sức trước đó bốc hơi. Bài mới thì lúc nào học cũng được. Nguyên tắc chung: **giữ cái đã có trước, thêm cái mới sau**. Học bù gấp đôi hôm sau cũng kém hiệu quả hơn nhiều so với đều đặn.',
        },
      ],
      terms: ['duong-cong-quen', 'truy-hoi', 'giãn-cach', 'xen-ke'],
      further: [
        {
          title: 'Make It Stick — Brown, Roediger & McDaniel',
          note: 'Tổng hợp dễ đọc về khoa học ghi nhớ. Đọc một lần, dùng cả đời.',
        },
        {
          title: 'FSRS — thuật toán lặp lại giãn cách mã nguồn mở',
          note: 'Chính thuật toán app này dùng để tính ngày ôn. Nếu tò mò về mô hình trí nhớ ba biến, đây là nguồn gốc.',
        },
      ],
    },
  ],
};
