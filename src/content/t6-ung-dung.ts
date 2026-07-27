import type { Track } from './types';

/**
 * CHẶNG 6 — Ứng dụng thực chiến.
 *
 * Đây là chặng biến kiến thức thành hệ thống. Mỗi bài đi trọn một vòng:
 *   bài toán thật → dữ liệu lấy ở đâu → đặc trưng nào đáng tiền → mô hình nào đủ
 *   dùng → đo bằng gì → chạy ở đâu trong hạ tầng → kẻ tấn công né bằng cách nào.
 *
 * Nguyên tắc xuyên suốt: không có bài toán nào ở đây được giải bằng "ném dữ liệu
 * vào mô hình mạnh nhất". Thứ quyết định là đặc trưng, cách chia tập, và ngưỡng.
 */
export const track6: Track = {
  id: 'ung-dung',
  order: 6,
  title: 'Ứng dụng thực chiến',
  tagline: 'Chín hệ thống phát hiện, xây từ đầu đến cuối',
  icon: 'target',
  hue: 't6',
  blurb:
    'Chín bài toán, mỗi bài một hệ thống hoàn chỉnh: dữ liệu lấy ở đâu, đặc trưng nào đáng tiền, mô hình nào đủ dùng, đo bằng con số nào, chạy ở chỗ nào trong hạ tầng, và kẻ tấn công sẽ né ra sao. Đây là chặng biến kiến thức rời rạc thành thứ chạy được trong sản xuất.',
  outcomes: [
    'Thiết kế được bộ đặc trưng cho phishing, mã độc PE, tên miền DGA, luồng mạng, log hệ thống và giao dịch — và giải thích được vì sao chọn từng đặc trưng',
    'Chọn đúng họ mô hình cho từng dạng dữ liệu: bảng số, chuỗi ký tự, chuỗi sự kiện, đồ thị quan hệ',
    'Đánh giá hệ thống phát hiện bằng con số analyst thực sự quan tâm — cảnh báo mỗi ngày và precision ở top-k — thay vì accuracy',
    'Chỉ ra được điểm né tránh của từng hệ thống trước khi kẻ tấn công tìm ra',
    'Phân biệt được bất thường với độc hại, và biết khi nào KHÔNG nên dùng phát hiện bất thường',
    'Viết được bản thiết kế một hệ thống phát hiện đầu-cuối đủ chi tiết để bảo vệ trước hội đồng kỹ thuật',
  ],
  lessons: [
    /* ====================================================================== */
    {
      id: 't6-l1',
      trackId: 'ung-dung',
      title: 'Phát hiện phishing đầu-cuối',
      subtitle: 'Từ URL thô tới một hệ thống chặn thư, với đầy đủ các chỗ nó sẽ hỏng',
      minutes: 30,
      practiceMinutes: 7,
      level: 'trung-cap',
      prereqs: ['t2-l6', 't4-l4'],
      why: {
        short:
          'Phishing là con đường vào phổ biến nhất của kẻ tấn công, và đây là bài toán ML bảo mật đầy đủ nhất mà một người có thể tự xây trọn vẹn trong hai tuần.',
        scenario:
          'Cổng thư của công ty 4.000 nhân viên nhận khoảng 120.000 email mỗi ngày. Bộ lọc thương mại vừa bỏ lọt một chiến dịch giả trang trang đăng nhập Microsoft 365; sáu người đã nhập mật khẩu. Sếp giao bạn xây một lớp phát hiện bổ sung trong hai tuần, với ngân sách 50 cảnh báo mỗi ngày cho đội SOC.',
        roles: ['Detection Engineer', 'Security Data Scientist', 'SOC Analyst'],
        costOfNotKnowing:
          'Bạn sẽ xây một mô hình đạt AUC 0,99 trên PhishTank ghép với Tranco, đem khoe, rồi phát hiện nó chỉ học được cách nhận ra tên miền nổi tiếng — vô dụng đúng ở chỗ cần dùng nhất là các tên miền lạ chưa ai xếp hạng.',
      },
      objectives: [
        'Thiết kế bộ đặc trưng ba tầng (từ vựng URL, hạ tầng, nội dung) và giải thích chi phí né tránh của từng tầng',
        'Chỉ ra ba nguồn rò rỉ trong cách ghép dữ liệu phishing công khai và cách chia tập tránh được chúng',
        'Chọn ngưỡng theo ngân sách cảnh báo trên lưu lượng thật thay vì theo F1 trên tập kiểm tra',
        'Kể được bốn kỹ thuật né tránh đang dùng năm 2025 và đặc trưng nào còn trụ được trước chúng',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Năm 2016, một trong những đặc trưng mạnh nhất để phân biệt trang phishing với trang thật là **trang có dùng HTTPS hay không** — phishing hầu như luôn dùng HTTP. Theo bạn, hôm nay đặc trưng đó còn giá trị bao nhiêu, và chuyện gì đã xảy ra?',
          reveal:
            'Nó chết hoàn toàn, và cái chết đó rất đáng học.\n\nLet\u0027s Encrypt bắt đầu cấp chứng chỉ TLS miễn phí, tự động, trong khoảng 30 giây từ cuối 2015. Chi phí để kẻ tấn công có HTTPS rơi từ "vài chục đô và một quy trình xác minh" xuống **bằng không**. Đến nay đại đa số trang phishing đều chạy HTTPS với ổ khoá xanh đầy đủ.\n\nBài học tổng quát, và nó sẽ lặp lại ở cả chín bài của chặng này: **giá trị của một đặc trưng bằng đúng chi phí mà kẻ tấn công phải trả để thay đổi nó.** Đặc trưng "có HTTPS" từng đắt, giờ miễn phí, nên vô giá trị. Ngược lại, "tên miền này được bao nhiêu người trong tổ chức truy cập trong 90 ngày qua" thì đắt thật — muốn giả cần cả một chiến dịch dài hơi. Khi thiết kế đặc trưng, hãy luôn hỏi: nếu tôi là kẻ tấn công, tôi mất bao lâu để làm đặc trưng này vô hiệu?',
        },
        {
          t: 'p',
          md: 'Bắt đầu bằng con số của tình huống. 120.000 thư/ngày, giả sử tỉ lệ phishing lọt qua lớp lọc thương mại là 1 trên 20.000 — tức khoảng **6 thư độc mỗi ngày**. Ngân sách của bạn là 50 cảnh báo/ngày. Sáu thư độc chia cho 50 cảnh báo cho bạn **trần precision là 12%** — và đó là con số chỉ đạt được nếu bộ dò bắt được cả 6 thư, tức recall 100%. Thực tế recall 70% thì precision trần chỉ còn 8,4%. Đây là điều ngược với trực giác của phần lớn người mới: trong bài toán hiếm, **precision bị chặn trên bởi chính tỉ lệ nền và ngân sách cảnh báo**, chứ không phải bởi chất lượng mô hình. Tỉ lệ báo động giả tương ứng phải dưới **0,04%**. Mọi quyết định kỹ thuật phía sau đều bị hai con số này ràng buộc.',
        },
        { t: 'h', text: 'Bước 1 — Dữ liệu: nơi mọi thứ hỏng trước tiên', level: 2 },
        {
          t: 'table',
          head: ['Nguồn', 'Cho bạn cái gì', 'Cạm bẫy'],
          rows: [
            [
              'PhishTank, OpenPhish',
              'URL phishing đã được cộng đồng xác minh, cập nhật hằng giờ',
              'Chỉ chứa cái ĐÃ bị phát hiện; thiên lệch mạnh về các chiến dịch ồn ào, thiếu hẳn phishing nhắm mục tiêu',
            ],
            [
              'Tranco top 1M',
              'Danh sách tên miền phổ biến, dùng làm mẫu âm',
              'Tên miền phổ biến quá dễ phân biệt → mô hình học "nổi tiếng = lành" và sập ngay khi gặp tên miền lạ nhưng vô hại',
            ],
            [
              'Certificate Transparency (certstream)',
              'Mọi chứng chỉ TLS mới được cấp, gần thời gian thực',
              'Khối lượng khổng lồ, chưa có nhãn; hữu ích để bắt tên miền vừa đăng ký chứa tên thương hiệu',
            ],
            [
              'Log proxy và log SMTP của chính bạn',
              'Phân phối lành tính THẬT của tổ chức bạn — thứ quý nhất',
              'Không có nhãn dương; phải ghép nhãn từ kết quả điều tra và báo cáo của người dùng',
            ],
            [
              'Nút "Báo cáo thư đáng ngờ" của nhân viên',
              'Nhãn dương chất lượng cao, đúng ngữ cảnh tổ chức',
              'Nhiễu nặng (người ta báo cáo cả thư quảng cáo); cần analyst duyệt lại',
            ],
          ],
          caption: 'Không có nguồn nào đủ một mình. Hệ thống thật luôn ghép ít nhất ba nguồn.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bẫy kinh điển: PhishTank ghép Tranco',
          md: 'Đây là công thức của khoảng 80% notebook phishing trên mạng, và nó tạo ra ba loại rò rỉ cùng lúc:\n\n**1. Rò rỉ phân phối.** Mẫu dương lấy từ khắp thế giới, mẫu âm lấy từ top 1M. Mô hình chỉ cần học "tên miền có nằm trong danh sách phổ biến không" là đạt AUC 0,99. Ngoài đời, mẫu âm của bạn là hàng triệu tên miền lạ, hợp pháp, không ai xếp hạng.\n\n**2. Rò rỉ thời gian.** URL phishing được thu vào tháng 6, URL lành lấy snapshot tháng 1. Mọi khác biệt do thời gian (TLD mới, thói quen đặt tên) đều bị mô hình học nhầm thành tín hiệu.\n\n**3. Rò rỉ theo tên miền.** Một chiến dịch phishing sinh ra 4.000 URL trên cùng một tên miền. Chia ngẫu nhiên thì URL của cùng tên miền nằm cả ở tập huấn luyện lẫn tập kiểm tra → điểm số cao giả tạo. **Bắt buộc chia theo eTLD+1** (dùng Public Suffix List), không chia theo URL.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Mẫu âm phải khó thì mô hình mới học được gì',
          md: 'Thay danh sách Tranco bằng **URL thật đi qua proxy của bạn** trong 30 ngày, đã lọc bỏ những cái bị chặn. Bạn sẽ có hàng triệu URL lành tính trông kỳ quặc: đường dẫn dài ngoằng của hệ thống nội bộ, subdomain băm của CDN, link theo dõi chiến dịch marketing với 200 ký tự tham số. Đó chính là những thứ sẽ tạo ra báo động giả trong sản xuất. Huấn luyện trên chúng ngay từ đầu, đừng đợi tới lúc triển khai mới gặp.',
        },
        { t: 'h', text: 'Bước 2 — Đặc trưng ba tầng', level: 2 },
        {
          t: 'steps',
          title: 'Xếp theo chi phí né tránh tăng dần',
          steps: [
            {
              title: 'Tầng 1 — Từ vựng URL (rẻ, nhanh, dễ né)',
              md: 'Độ dài URL và hostname, số dấu chấm, số dấu gạch ngang, có dùng IP thay tên miền, có ký tự `@` (che host thật), có `xn--` (punycode → tấn công đồng hình như `microsоft.com` với chữ o Cyrillic), entropy của subdomain, số từ khoá thương hiệu xuất hiện ngoài vị trí tên miền chính, độ sâu đường dẫn, cổng phi tiêu chuẩn.\n\n**Chi phí né:** vài phút. Kẻ tấn công chỉ cần đặt URL ngắn và sạch. Nhưng tầng này miễn phí về mặt tính toán và bắt được toàn bộ phần đuôi cẩu thả của thị trường phishing — vẫn đáng làm.',
            },
            {
              title: 'Tầng 2 — Hạ tầng và danh tiếng (đắt hơn hẳn)',
              md: 'Tuổi tên miền tính từ ngày đăng ký (WHOIS / RDAP), tuổi chứng chỉ TLS, tổ chức cấp chứng chỉ, ASN của địa chỉ IP và ASN đó có phải hosting giá rẻ không, TTL của bản ghi DNS, số lượng tên miền khác trỏ về cùng IP, và — mạnh nhất — **độ phổ biến nội bộ**: có bao nhiêu máy trong tổ chức bạn từng truy cập tên miền này trong 90 ngày.\n\n**Chi phí né:** phải mua tên miền trước hàng tháng, nuôi lưu lượng, dùng hạ tầng sạch. Đắt thật. Đây là tầng có tỉ lệ giá trị trên chi phí cao nhất.',
            },
            {
              title: 'Tầng 3 — Nội dung trang và thư (mạnh nhất, chậm nhất)',
              md: 'Trang: có form nhập mật khẩu không, form gửi dữ liệu về tên miền khác không, favicon tải từ tên miền khác (dấu hiệu sao chép giao diện), tỉ lệ liên kết trỏ ra ngoài, có iframe che, mã JavaScript bị làm rối.\n\nThư: SPF/DKIM/DMARC có đạt không, `Reply-To` khác `From`, tên hiển thị trùng một lãnh đạo nhưng địa chỉ lạ, khoảng cách chỉnh sửa giữa tên miền người gửi và các tên miền đối tác quen thuộc (bắt typosquatting), thư đầu tiên từ người gửi này tới tổ chức.\n\n**Chi phí né:** cao, vì kẻ tấn công vẫn phải hiển thị một form đăng nhập trông giống thật — đó là mục đích của cả chiến dịch.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Trích xuất đặc trưng tầng 1 từ một URL bất kỳ',
          code:
            "import re, math\n" +
            "from urllib.parse import urlparse\n" +
            "import tldextract  # tách đúng eTLD+1 theo Public Suffix List\n" +
            "\n" +
            "THUONG_HIEU = ('login', 'verify', 'secure', 'account', 'signin',\n" +
            "               'microsoft', 'office365', 'paypal', 'vietcombank')\n" +
            "\n" +
            "def entropy(s: str) -> float:\n" +
            "    # Entropy Shannon của chuỗi ký tự; chuỗi càng ngẫu nhiên càng cao\n" +
            "    if not s:\n" +
            "        return 0.0\n" +
            "    n = len(s)\n" +
            "    dem = [s.count(k) for k in set(s)]\n" +
            "    return -sum((c / n) * math.log2(c / n) for c in dem)\n" +
            "\n" +
            "def dac_trung_url(url: str) -> dict:\n" +
            "    u = urlparse(url)\n" +
            "    host = u.hostname or ''\n" +
            "    ext = tldextract.extract(url)\n" +
            "    return {\n" +
            "        'do_dai_url': len(url),\n" +
            "        'do_dai_host': len(host),\n" +
            "        'so_dau_cham': host.count('.'),\n" +
            "        'so_dau_gach': url.count('-'),\n" +
            "        'ip_thay_ten_mien': int(bool(re.fullmatch(r'[0-9.]+', host))),\n" +
            "        'co_ky_tu_at': int('@' in url),        # che giấu host thật\n" +
            "        'co_punycode': int('xn--' in host),    # tấn công đồng hình\n" +
            "        'entropy_subdomain': entropy(ext.subdomain),\n" +
            "        # Thương hiệu nằm ở subdomain hoặc path, KHÔNG ở tên miền chính:\n" +
            "        'thuong_hieu_sai_cho': sum(\n" +
            "            w in (ext.subdomain + u.path).lower() for w in THUONG_HIEU),\n" +
            "        'do_sau_duong_dan': u.path.count('/'),\n" +
            "        'cong_phi_chuan': int(u.port not in (None, 80, 443)),\n" +
            "        'etld1': ext.registered_domain,  # dùng để CHIA TẬP, không phải đặc trưng\n" +
            "    }\n",
        },
        {
          t: 'lab',
          id: 'lab-url-features',
          intro: 'Dán một URL bất kỳ vào và xem từng đặc trưng được tính ra sao. Thử tự sửa URL để lách qua mô hình — bạn sẽ hiểu tầng 1 mong manh thế nào.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't6l1-cp1',
              kind: 'mcq',
              tags: ['phishing', 'ro-ri-du-lieu'],
              q: 'Một chiến dịch phishing tạo 4.000 URL trên tên miền `secure-verify-login.top`. Bạn chia tập ngẫu nhiên theo URL. Hậu quả gì?',
              options: [
                'Không sao, vì mỗi URL là một mẫu độc lập',
                'Mô hình học thuộc chính tên miền đó và điểm trên tập kiểm tra bị thổi phồng',
                'Tập kiểm tra sẽ quá nhỏ để đánh giá',
                'Mô hình sẽ bị quá khớp về mặt độ sâu cây',
              ],
              answer: 1,
              why: 'Các URL cùng một chiến dịch gần như giống hệt nhau: cùng tên miền, cùng cấu trúc đường dẫn, cùng độ dài. Khi 3.200 cái nằm ở tập huấn luyện và 800 cái ở tập kiểm tra, mô hình chỉ cần nhớ tên miền là ăn điểm. Đây là **rò rỉ theo nhóm** (group leakage). Cách chữa: dùng `GroupKFold` hoặc chia thủ công theo eTLD+1, để không tên miền nào xuất hiện ở cả hai bên.',
              distractorWhy: [
                'Chúng không độc lập — chúng là 4.000 bản sao gần trùng của một mẫu duy nhất.',
                '',
                'Kích thước tập kiểm tra không phải vấn đề ở đây; vấn đề là nội dung của nó trùng với tập huấn luyện.',
                'Quá khớp về độ sâu cây là chuyện khác; ở đây lỗi nằm ở cách chia dữ liệu, không phải siêu tham số.',
              ],
            },
            {
              id: 't6l1-cp2',
              kind: 'truefalse',
              tags: ['phishing', 'dac-trung'],
              q: 'Đặc trưng "tên miền được đăng ký cách đây bao nhiêu ngày" tốt hơn đặc trưng "URL dài bao nhiêu ký tự" vì nó khó né hơn.',
              answer: true,
              why: 'Rút ngắn URL tốn 0 giây. Còn muốn tên miền có tuổi 400 ngày thì kẻ tấn công phải mua từ 400 ngày trước, hoặc mua lại tên miền cũ đã hết hạn — cả hai đều tốn tiền và tốn kế hoạch. Đó chính là tiêu chí chọn đặc trưng trong môi trường đối kháng: **ưu tiên thứ kẻ tấn công phải trả giá mới thay đổi được.** Lưu ý mặt trái: đặc trưng tuổi tên miền cũng gây báo động giả cho startup mới lập hay chiến dịch marketing dùng tên miền mới.',
            },
          ],
        },
        { t: 'h', text: 'Bước 3 — Mô hình: bắt đầu từ cái nhàm chán', level: 2 },
        {
          t: 'p',
          md: 'Với đặc trưng dạng bảng như trên, thứ tự thử là: **hồi quy logistic** (đường cơ sở, cho biết đặc trưng có tín hiệu không, đọc được hệ số) → **LightGBM** (gần như luôn thắng trên dữ liệu bảng, chịu được đặc trưng lệch và thiếu) → chỉ khi cần mới thêm **mô hình ký tự** (TF-IDF n-gram ký tự 3–5 hoặc CNN ký tự) cho phần thô của URL.',
        },
        {
          t: 'p',
          md: 'Mô hình ký tự đáng thêm khi bạn muốn bắt các biến thể chính tả mà đặc trưng thủ công bỏ sót (`vietcornbank`, `rnicrosoft`). Cách ghép thực dụng: chạy TF-IDF n-gram ký tự qua một hồi quy logistic riêng, lấy **điểm số** của nó làm một đặc trưng đưa vào LightGBM cùng các đặc trưng hạ tầng. Đơn giản hơn nhiều so với huấn luyện một mô hình đa phương thức, và thường không kém.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao không nhảy thẳng vào deep learning',
          md: 'Với 200.000 mẫu và 40 đặc trưng dạng bảng, cây tăng cường gần như luôn ngang bằng hoặc hơn mạng nơ-ron, huấn luyện trong 30 giây thay vì 3 giờ, và cho bạn `feature_importance` để soi ngay xem mô hình đang bám vào cái gì. Bước soi đó là thứ phát hiện ra rằng bạn vô tình đưa `etld1` vào làm đặc trưng, hoặc mô hình đang sống nhờ đúng một đặc trưng rò rỉ. Với một mạng nơ-ron thì bạn sẽ mất nhiều tuần mới nhận ra.',
        },
        { t: 'h', text: 'Bước 4 — Đánh giá bằng con số analyst quan tâm', level: 2 },
        {
          t: 'table',
          head: ['Chỉ số', 'Ý nghĩa với đội SOC', 'Con số mục tiêu trong tình huống của bài'],
          rows: [
            ['Cảnh báo mỗi ngày ở ngưỡng đã chọn', 'Khối lượng công việc thật', 'Dưới 50'],
            ['Precision ở mức 50 cảnh báo/ngày', 'Cứ 10 cảnh báo thì mấy cái đáng xem', '0,08–0,12; trần lý thuyết là 0,12 nên đừng đặt mục tiêu cao hơn'],
            ['Recall trên tập phishing được xác nhận', 'Bao nhiêu phần trăm chiến dịch bị bắt', 'Đo riêng cho phishing hàng loạt và phishing nhắm mục tiêu'],
            ['Thời gian từ khi tên miền xuất hiện tới khi bị chặn', 'Cửa sổ mà nhân viên còn có thể nhập mật khẩu', 'Tính bằng phút, không phải giờ'],
            ['PR-AUC theo tuần', 'Mô hình đang xuống cấp hay không', 'Theo dõi xu hướng, không phải giá trị tuyệt đối'],
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Đánh giá phải theo thời gian, và phải theo chiến dịch',
          md: 'Hai quy tắc bắt buộc:\n\n**Chia theo thời gian.** Huấn luyện trên tháng 1–4, kiểm tra trên tháng 5–6. Kết quả sẽ tệ hơn chia ngẫu nhiên rất nhiều — đó là con số thật, con số kia là ảo tưởng.\n\n**Đếm theo chiến dịch, không theo URL.** Nếu bạn bắt được 3.999/4.000 URL của một chiến dịch nhưng bỏ lọt trọn vẹn ba chiến dịch khác, recall theo URL vẫn đẹp còn thực tế thì bạn đã thua ba lần. Gom URL theo eTLD+1 hoặc theo cụm tương tự, rồi tính recall trên **số chiến dịch bị chặn**.',
        },
        { t: 'h', text: 'Bước 5 — Triển khai ở đâu', level: 2 },
        {
          t: 'checklist',
          title: 'Bốn điểm chặn, bốn ràng buộc khác nhau',
          items: [
            'Tại cổng thư (MTA), trước khi thư vào hộp: có toàn bộ header và nội dung, ngân sách trễ vài trăm mili-giây, chặn nhầm là mất thư kinh doanh — cần ngưỡng cao nhất.',
            'Tại proxy web khi người dùng bấm vào liên kết: có URL đầy đủ và ngữ cảnh người dùng, ngân sách trễ dưới 50 ms, có thể hiện trang cảnh báo cho phép đi tiếp — chỗ tốt nhất để đặt ngưỡng thấp.',
            'Chạy lại theo lô sau 24 giờ trên toàn bộ liên kết đã đi qua: không ràng buộc trễ, dùng được cả đặc trưng nội dung tải về sau, phát hiện muộn nhưng vẫn kịp đổi mật khẩu.',
            'Quét chủ động Certificate Transparency tìm tên miền vừa đăng ký chứa tên thương hiệu của bạn: bắt được chiến dịch TRƯỚC khi thư đầu tiên được gửi.',
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Chạy song song trước khi chạy thật',
          md: 'Bật mô hình ở **chế độ bóng** (shadow mode) hai tuần: nó chấm điểm mọi thư nhưng không chặn gì, kết quả ghi vào một chỉ mục riêng. Bạn thu được ba thứ cùng lúc: phân phối điểm số thật trên lưu lượng của chính bạn (để chọn ngưỡng), danh sách báo động giả thật (để làm mẫu âm khó), và bằng chứng để thuyết phục người ra quyết định. Không có bước này, ngưỡng bạn chọn chỉ là phỏng đoán trên phân phối phòng lab.',
        },
        { t: 'h', text: 'Bước 6 — Kẻ tấn công né thế nào (năm 2025)', level: 2 },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Ký sinh trên hạ tầng hợp pháp.** Trang phishing đặt trên Google Docs, SharePoint, Cloudflare Pages, Notion, Firebase, IPFS. Tên miền có danh tiếng hoàn hảo, chứng chỉ hoàn hảo, tuổi nhiều năm. Toàn bộ tầng 2 sụp. Thứ còn trụ được: đặc trưng nội dung (form mật khẩu gửi ra tên miền khác) và độ phổ biến của **đường dẫn cụ thể** trong tổ chức.',
            '**Chuỗi chuyển hướng và rút gọn.** URL trong thư là `bit.ly/xyz` hoặc một link theo dõi quảng cáo hợp pháp, đi qua 4 lần chuyển hướng mới tới trang thật. Chống lại bằng cách **đi hết chuỗi chuyển hướng** trong sandbox và chấm điểm URL cuối, không chấm URL trong thư.',
            '**Che giấu theo ngữ cảnh (cloaking).** Máy chủ trả trang vô hại cho địa chỉ IP của các hãng bảo mật và cho User-Agent của bot, chỉ trả trang phishing cho nạn nhân đúng vùng địa lý, đúng thời điểm, đôi khi chỉ khi URL có tham số định danh riêng. Hệ quả: crawler của bạn thấy trang sạch. Chống lại bằng cách lấy mẫu từ chính trình duyệt của người dùng, không chỉ từ crawler.',
            '**AiTM — proxy ngược theo thời gian thực.** Evilginx2, EvilProxy và các bộ công cụ tương tự dựng proxy đứng giữa: nạn nhân thấy trang đăng nhập THẬT của Microsoft vì đó đúng là trang thật được chuyển tiếp, còn kẻ tấn công lấy **cookie phiên** nên vượt qua cả MFA. Đặc trưng nội dung mất tác dụng vì nội dung là thật. Thứ còn lại: phát hiện ở tầng danh tính — đăng nhập thành công từ ASN lạ, dấu vân tay thiết bị không khớp, token bị dùng lại từ hai địa điểm.',
            '**Quishing — mã QR trong thư hoặc trong tệp PDF đính kèm.** URL không tồn tại dưới dạng văn bản nên mọi bộ lọc URL đều mù. Chống lại bằng cách giải mã QR trong ảnh và tệp đính kèm rồi đưa URL đó vào đúng đường ống chấm điểm.',
            '**Nội dung do LLM sinh ra.** Các dấu hiệu ngôn ngữ cổ điển — sai chính tả, ngữ pháp vụng, dịch máy thô — đã biến mất. Thư phishing tiếng Việt bây giờ đúng chính tả, đúng văn phong công ty. Hệ quả trực tiếp: **giảm trọng số cho đặc trưng ngôn ngữ, tăng trọng số cho đặc trưng hạ tầng và quan hệ người gửi.**',
          ],
        },
        {
          t: 'compare',
          title: 'Hai chiến lược, chọn theo mối đe doạ của bạn',
          left: {
            title: '🎣 Chống phishing hàng loạt',
            items: [
              'Khối lượng lớn, kỹ thuật thấp, dùng lại hạ tầng',
              'Đặc trưng từ vựng URL và danh tiếng hạ tầng đủ mạnh',
              'Nguồn cấp dữ liệu công khai (PhishTank, OpenPhish) có giá trị thật',
              'Đo bằng recall trên số chiến dịch bị chặn',
              'Có thể chặn tự động ở ngưỡng cao',
            ],
          },
          right: {
            title: '🎯 Chống phishing nhắm mục tiêu',
            items: [
              'Vài thư, viết riêng, hạ tầng sạch dùng một lần',
              'Đặc trưng quan hệ: người gửi này đã bao giờ liên hệ với tổ chức chưa',
              'Nguồn công khai gần như vô dụng — mẫu chưa từng xuất hiện ở đâu',
              'Đo bằng thời gian phát hiện và tỉ lệ người dùng báo cáo',
              'Nên đưa cho người xem xét, không chặn tự động',
            ],
          },
        },
        { t: 'terms', ids: ['bao-dong-gia', 'precision', 'nguong', 'ro-ri-du-lieu', 'shadow-mode', 'ne-tranh'] },
      ],
      keyTakeaways: [
        'Giá trị của một đặc trưng bằng đúng chi phí kẻ tấn công phải trả để thay đổi nó — HTTPS từng đắt, nay miễn phí, nên vô giá trị.',
        'Ghép PhishTank với Tranco tạo ra ba loại rò rỉ cùng lúc; mẫu âm phải là lưu lượng lành tính THẬT của tổ chức bạn.',
        'Bắt buộc chia tập theo eTLD+1 và theo thời gian, và đếm recall theo chiến dịch chứ không theo URL.',
        'Đặc trưng ba tầng: từ vựng URL (rẻ, dễ né), hạ tầng và danh tiếng (đắt để né, giá trị cao nhất), nội dung trang và thư (mạnh nhất, chậm nhất).',
        'Ngưỡng phải chọn từ ngân sách cảnh báo mỗi ngày trên lưu lượng thật, đo qua hai tuần chạy chế độ bóng.',
        'Kỹ thuật né hiện đại: ký sinh hạ tầng hợp pháp, cloaking, AiTM lấy cookie phiên, QR trong tệp đính kèm, nội dung do LLM sinh.',
      ],
      cards: [
        {
          id: 't6l1-c1',
          front: 'Vì sao đặc trưng "trang có dùng HTTPS" mất hết giá trị trong phát hiện phishing?',
          back: 'Vì chứng chỉ TLS trở nên miễn phí và tự động (Let\u0027s Encrypt), nên chi phí để kẻ tấn công có HTTPS rơi về không. Đặc trưng chỉ có giá trị bằng chi phí né tránh của nó.',
          tags: ['phishing', 'dac-trung'],
        },
        {
          id: 't6l1-c2',
          front: 'Vì sao phải chia tập phishing theo eTLD+1 thay vì theo URL?',
          back: 'Vì một chiến dịch sinh ra hàng nghìn URL gần trùng trên cùng tên miền; chia theo URL khiến cùng tên miền nằm ở cả tập huấn luyện lẫn tập kiểm tra, tạo rò rỉ theo nhóm và điểm số ảo.',
          tags: ['phishing', 'ro-ri-du-lieu'],
        },
        {
          id: 't6l1-c3',
          front: 'Nêu ba tầng đặc trưng của phát hiện phishing, xếp theo chi phí né tránh tăng dần.',
          back: '1) Từ vựng URL (độ dài, punycode, entropy). 2) Hạ tầng và danh tiếng (tuổi tên miền, ASN, độ phổ biến nội bộ). 3) Nội dung trang và thư (form mật khẩu, SPF/DKIM/DMARC, quan hệ người gửi).',
          tags: ['phishing', 'dac-trung'],
        },
        {
          id: 't6l1-c4',
          front: 'Tấn công AiTM (Evilginx, EvilProxy) vô hiệu hoá loại đặc trưng nào, và còn lại gì để phát hiện?',
          back: 'Vô hiệu đặc trưng nội dung, vì trang hiển thị là trang thật được proxy chuyển tiếp. Còn lại tín hiệu tầng danh tính: đăng nhập từ ASN lạ, vân tay thiết bị không khớp, cookie phiên dùng từ hai nơi.',
          tags: ['phishing', 'ne-tranh'],
        },
        {
          id: 't6l1-c5',
          front: '120.000 thư/ngày, ngân sách 50 cảnh báo/ngày. Tỉ lệ báo động giả tối đa cho phép là bao nhiêu?',
          back: 'Khoảng 0,04% (50 / 120.000). Ngân sách cảnh báo luôn phải được quy ngược thành ràng buộc FPR trước khi chọn mô hình.',
          tags: ['phishing', 'nguong'],
        },
      ],
      quiz: [
        {
          id: 't6l1-q1',
          kind: 'mcq',
          tags: ['phishing', 'dac-trung'],
          q: 'Một chiến dịch đặt trang phishing trên `sites.google.com`. Đặc trưng nào của bạn còn giữ được giá trị?',
          options: [
            'Tuổi tên miền theo WHOIS',
            'ASN của địa chỉ IP',
            'Form nhập mật khẩu gửi dữ liệu về một tên miền khác',
            'Chứng chỉ TLS do tổ chức nào cấp',
          ],
          answer: 2,
          why: 'Khi trang ký sinh trên hạ tầng hợp pháp, toàn bộ tầng danh tiếng sụp cùng lúc: tên miền của Google có tuổi hàng chục năm, ASN sạch, chứng chỉ do một CA lớn cấp. Thứ duy nhất kẻ tấn công không thể mượn được là **mục đích của trang**: nó vẫn phải thu mật khẩu và gửi về nơi kẻ tấn công kiểm soát. Đó là lý do đặc trưng nội dung — form gửi dữ liệu ra tên miền khác, favicon lấy từ nơi khác, giao diện sao chép — vẫn còn giá trị ngay cả trong trường hợp xấu nhất.',
          distractorWhy: [
            'Tên miền của nhà cung cấp lớn có tuổi hàng chục năm, đặc trưng này trở nên vô nghĩa.',
            'ASN thuộc nhà cung cấp đám mây uy tín, không phân biệt được gì.',
            '',
            'Chứng chỉ do một CA lớn cấp cho hạ tầng thật của nhà cung cấp.',
          ],
        },
        {
          id: 't6l1-q2',
          kind: 'order',
          tags: ['phishing', 'quy-trinh'],
          q: 'Sắp xếp các bước xây hệ thống phát hiện phishing theo thứ tự nên làm.',
          items: [
            'Xác định ngân sách cảnh báo mỗi ngày và quy ra ràng buộc tỉ lệ báo động giả',
            'Thu thập mẫu âm từ lưu lượng thật của tổ chức, không chỉ từ danh sách tên miền phổ biến',
            'Xây đặc trưng ba tầng và chia tập theo eTLD+1 và theo thời gian',
            'Huấn luyện đường cơ sở hồi quy logistic rồi mới tới LightGBM',
            'Chạy chế độ bóng hai tuần để lấy phân phối điểm số thật và chọn ngưỡng',
            'Bật chặn ở điểm có chi phí sai thấp nhất, giám sát PR-AUC theo tuần',
          ],
          why: 'Ngân sách cảnh báo đứng đầu vì nó ràng buộc mọi thứ phía sau — không biết mình được phép sai bao nhiêu thì không chọn được ngưỡng, mà không có ngưỡng thì mọi con số mô hình đều là trang trí. Chế độ bóng nằm trước khi bật chặn vì phân phối điểm số trên lưu lượng thật gần như luôn khác phân phối trong phòng lab, và đó là nơi bạn thu được mẫu âm khó đầu tiên.',
        },
        {
          id: 't6l1-q3',
          kind: 'multi',
          tags: ['phishing', 'ne-tranh'],
          q: 'Kỹ thuật nào khiến crawler tự động của bạn nhìn thấy một trang hoàn toàn vô hại? (Chọn tất cả đáp án đúng)',
          options: [
            'Che giấu theo địa chỉ IP và User-Agent (cloaking)',
            'Chỉ hiển thị nội dung phishing khi URL có tham số định danh riêng cho từng nạn nhân',
            'Dùng punycode trong tên miền',
            'Giới hạn hiển thị theo vùng địa lý của nạn nhân',
          ],
          answers: [0, 1, 3],
          why: 'Ba kỹ thuật đầu đều là các dạng cloaking: máy chủ quyết định trả nội dung nào dựa trên đặc điểm của người truy cập. Đây là lý do một URL bạn quét thấy sạch vẫn có thể đang lừa nhân viên của bạn ngay lúc đó. Punycode thì ngược lại — nó là dấu hiệu **hiện ra** trong chính chuỗi URL và crawler thấy rõ. Hệ quả thiết kế: đừng chỉ dựa vào crawler, hãy lấy mẫu nội dung từ chính phiên duyệt của người dùng qua tiện ích trình duyệt hoặc proxy giải mã TLS.',
        },
        {
          id: 't6l1-q4',
          kind: 'input',
          tags: ['phishing', 'nguong'],
          q: 'Hệ thống xử lý 200.000 URL mỗi ngày. Đội SOC chịu được tối đa 80 cảnh báo/ngày và giả sử toàn bộ cảnh báo đều là báo động giả trong tính toán xấu nhất. Tỉ lệ báo động giả tối đa cho phép là bao nhiêu phần trăm? (Nhập số, ví dụ 0,05)',
          accept: ['0,04', '0.04', '0,040', '0.040'],
          placeholder: 'Nhập tỉ lệ phần trăm…',
          hint: '80 chia 200.000, rồi đổi sang phần trăm.',
          why: '80 / 200.000 = 0,0004 = **0,04%**. Con số này là ràng buộc thiết kế quan trọng nhất của cả dự án, và nó phải được tính TRƯỚC khi bạn chọn mô hình. Nó cũng cho thấy vì sao ROC-AUC gây hiểu nhầm ở đây: bạn chỉ quan tâm tới một điểm duy nhất trên đường cong, ở vùng FPR cực nhỏ mà đường ROC gần như không phân giải được. Chỉ số đúng để so sánh mô hình trong tình huống này là precision tại FPR = 0,04%, hoặc precision@80.',
        },
        {
          id: 't6l1-q5',
          kind: 'truefalse',
          tags: ['phishing', 'ml-vs-rule'],
          q: 'Vì đã có mô hình học máy tốt, nên bỏ danh sách chặn tên miền độc hại đi cho gọn hệ thống.',
          answer: false,
          why: 'Danh sách chặn cho kết quả chính xác tuyệt đối với chi phí gần bằng không trên phần đã biết. Mô hình tồn tại để xử lý phần CHƯA biết. Kiến trúc thật luôn xếp tầng: danh sách chặn → luật chữ ký → mô hình → xem xét thủ công, mỗi tầng ăn bớt khối lượng cho tầng sau. Bỏ tầng rẻ nhất đi là tự nguyện trả giá đắt hơn cho kết quả kém hơn ở phần dễ nhất.',
        },
      ],
      terms: ['bao-dong-gia', 'precision', 'nguong', 'ro-ri-du-lieu', 'shadow-mode', 'ne-tranh'],
      further: [
        {
          title: 'Tranco: A Research-Oriented Top Sites Ranking Hardened Against Manipulation — Le Pochat và cộng sự (2019)',
          note: 'Vì sao các bảng xếp hạng tên miền cũ không dùng được cho nghiên cứu, và cách Tranco sửa. Đọc để hiểu giới hạn của chính mẫu âm bạn đang dùng.',
        },
        {
          title: 'Public Suffix List',
          note: 'Nguồn dữ liệu để tách eTLD+1 cho đúng. Không có nó thì `co.uk` hay `com.vn` sẽ bị cắt sai và cách chia tập của bạn hỏng theo.',
        },
        {
          title: 'APWG Phishing Activity Trends Report',
          note: 'Báo cáo hằng quý về khối lượng, ngành bị nhắm tới và kỹ thuật đang thịnh hành. Dùng để cập nhật danh sách đặc trưng mỗi quý.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't6-l2',
      trackId: 'ung-dung',
      title: 'Phân loại mã độc bằng phân tích tĩnh',
      subtitle: 'EMBER, LightGBM, và vì sao mô hình của bạn hết hạn sau sáu tháng',
      minutes: 28,
      practiceMinutes: 7,
      level: 'trung-cap',
      prereqs: ['t6-l1'],
      why: {
        short:
          'Phân loại mã độc tĩnh là bài toán ML bảo mật có bộ dữ liệu công khai tốt nhất, nên đây là nơi bạn học được toàn bộ vòng đời — kể cả phần mô hình xuống cấp theo thời gian, thứ mà không bộ dữ liệu nào khác cho bạn thấy rõ như vậy.',
        scenario:
          'Bạn phụ trách bộ máy chấm điểm tệp cho một sản phẩm EDR. Mô hình hiện tại huấn luyện tháng 3, hôm nay là tháng 11, và tỉ lệ phát hiện trên mẫu mới đã tụt từ 94% xuống 71% trong khi tỉ lệ báo động giả không đổi. Bạn phải giải thích nguyên nhân và đề xuất lịch huấn luyện lại.',
        roles: ['Malware Analyst', 'Security Data Scientist', 'ML Engineer', 'Detection Engineer'],
        costOfNotKnowing:
          'Bạn công bố một mô hình đạt AUC 0,999 trên tập chia ngẫu nhiên, triển khai lên 200.000 máy trạm, và ba tháng sau nhận ra nó chỉ giỏi nhận diện các họ mã độc đã tuyệt chủng — trong khi vẫn chặn nhầm phần mềm kế toán nội bộ vì nó bị nén bằng UPX.',
      },
      objectives: [
        'Mô tả được cấu trúc bộ đặc trưng của EMBER và vì sao mỗi nhóm đặc trưng tồn tại',
        'Giải thích được packing ảnh hưởng tới cả đặc trưng lẫn nhãn như thế nào',
        'Thiết kế được thí nghiệm đo trôi khái niệm theo họ mã độc và theo thời gian',
        'Kể được bốn cách kẻ tấn công vô hiệu hoá mô hình tĩnh và chi phí của từng cách',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bạn huấn luyện LightGBM trên 600.000 tệp PE và đạt AUC 0,998. Đồng nghiệp hỏi: "Chia tập thế nào?" Bạn trả lời: "Ngẫu nhiên 80/20." Theo bạn, khi đo lại đúng cách — huấn luyện trên mẫu trước tháng 7, kiểm tra trên mẫu sau tháng 7 — con số sẽ tụt xuống khoảng bao nhiêu?',
          reveal:
            'Trong các thí nghiệm được công bố trên dữ liệu PE quy mô lớn, khoảng cách giữa hai cách chia thường **rất lớn** — tỉ lệ phát hiện ở một mức báo động giả cố định có thể mất hàng chục điểm phần trăm chỉ vì đổi cách chia.\n\nNguyên nhân thì đơn giản đến mức khó chịu: mã độc đi theo **họ** (family). Một họ như Emotet hay Qakbot sinh ra hàng chục nghìn mẫu gần giống nhau trong vài tuần. Chia ngẫu nhiên đưa mẫu cùng họ, cùng chiến dịch, đôi khi cùng một trình đóng gói với cùng khoá, vào cả hai tập. Mô hình không hề tổng quát hoá — nó **nhận ra họ đã thấy**.\n\nĐây chính là lý do bộ dữ liệu EMBER 2018 cố tình đặt toàn bộ tập kiểm tra ở sau tập huấn luyện về mặt thời gian, và vì sao nó khó hơn hẳn EMBER 2017. Nếu bạn chỉ nhớ một câu từ bài này: **chia tập theo thời gian, và tốt hơn nữa là theo cả họ.**',
        },
        { t: 'h', text: 'Bước 1 — Dữ liệu: ba bộ bạn cần biết', level: 2 },
        {
          t: 'table',
          head: ['Bộ dữ liệu', 'Quy mô', 'Đặc điểm', 'Dùng khi nào'],
          rows: [
            [
              'EMBER 2018 (Anderson & Roth)',
              '1 triệu tệp PE (bản 2018), 2.381 đặc trưng đã trích sẵn',
              'Không phát hành tệp thô, chỉ phát hành vector đặc trưng và mã trích xuất; tập kiểm tra tách theo thời gian; kèm mô hình LightGBM cơ sở',
              'Học nghề, so sánh phương pháp, kiểm chứng ý tưởng nhanh',
            ],
            [
              'SOREL-20M (Sophos & ReversingLabs)',
              '20 triệu mẫu PE',
              'Có cả vector đặc trưng, siêu dữ liệu, nhãn theo nhóm hành vi; một phần mẫu độc được phát hành ở dạng đã vô hiệu hoá',
              'Khi cần quy mô lớn và nhãn nhiều chiều hơn nhị phân',
            ],
            [
              'Kho nội bộ của tổ chức bạn',
              'Tuỳ',
              'Phân phối lành tính đúng với môi trường của bạn — thứ mà không bộ công khai nào có',
              'Luôn luôn, ít nhất để làm tập mẫu âm và tập kiểm tra cuối',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Về việc xử lý mẫu mã độc thật',
          md: 'Nếu bạn tải mẫu thật từ VirusShare, MalwareBazaar hay VirusTotal: chạy trong máy ảo tách mạng, không dùng máy cá nhân, đặt tên tệp không có phần mở rộng thực thi, và kiểm tra quy định của tổ chức trước. Một lỗi thao tác ở bước này có thể trở thành sự cố mà chính bạn phải điều tra.\n\nBộ EMBER tồn tại một phần chính vì lý do đó: nó cho bạn vector đặc trưng thay vì tệp thô, nên bạn học được kỹ thuật mà không cầm bom trong tay.',
        },
        { t: 'h', text: 'Bước 2 — Đặc trưng: EMBER đã chọn gì và vì sao', level: 2 },
        {
          t: 'list',
          items: [
            '**Biểu đồ byte (256 chiều).** Tần suất từng giá trị byte trong toàn tệp. Rẻ, thô, bắt được đặc điểm tổng thể như vùng mã máy dày đặc hay vùng dữ liệu nén.',
            '**Biểu đồ byte-entropy (256 chiều).** Trượt một cửa sổ qua tệp, với mỗi cửa sổ tính entropy rồi ghi nhận cặp (entropy, byte). Đây là cách mã hoá "phần nào của tệp trông ngẫu nhiên" — dấu hiệu của nén và mã hoá.',
            '**Đặc trưng chuỗi.** Số chuỗi in được, độ dài trung bình, entropy của tập chuỗi, số lần xuất hiện của `C:\\`, `http://`, `HKEY_`, tên tệp `.exe`, mẫu khoá registry. Chuỗi là cầu nối gần nhất tới ý định của tác giả mã độc.',
            '**Thông tin chung.** Kích thước tệp, kích thước phần header, có chữ ký số không, có thông tin gỡ lỗi không, số lượng ký hiệu xuất và nhập, số tài nguyên nhúng.',
            '**Header.** Thời điểm biên dịch, kiến trúc máy, các cờ đặc tính, phiên bản trình liên kết, hệ điều hành yêu cầu, kích thước vùng nhớ được cấp.',
            '**Section.** Với mỗi section: tên, kích thước thật, kích thước ảo, entropy, quyền (đọc/ghi/thực thi). Một section vừa ghi được vừa thực thi được là dấu hiệu cổ điển của mã tự giải nén.',
            '**Imports.** Thư viện nào và hàm nào được nhập. Đây là đặc trưng gần với **hành vi** nhất mà phân tích tĩnh chạm được: `CryptEncrypt` + `FindFirstFile` + `DeleteFile` là chân dung của ransomware.',
            '**Exports và data directories.** Ít quan trọng hơn nhưng giúp phân biệt DLL với EXE, và phát hiện bảng địa chỉ nhập bất thường.',
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao imports là nhóm đặc trưng đáng tiền nhất',
          md: 'Một chương trình muốn mã hoá tệp của nạn nhân **buộc phải** gọi tới các hàm mã hoá và các hàm duyệt tệp — hoặc tự cài đặt lại chúng, việc tốn công hơn nhiều. Muốn tiêm mã vào tiến trình khác thì buộc phải có `OpenProcess`, `VirtualAllocEx`, `WriteProcessMemory`, `CreateRemoteThread`.\n\nĐổi tên tệp mất 1 giây. Bỏ được `CreateRemoteThread` thì phải viết lại cả cơ chế tiêm mã. Đó là khác biệt giữa đặc trưng bề mặt và đặc trưng gắn với **năng lực bắt buộc** của mã độc. Nguyên tắc này áp dụng cho mọi bài toán trong chặng: hãy tìm cái mà kẻ tấn công không thể bỏ vì nó chính là mục đích của họ.',
        },
        { t: 'lab', id: 'lab-pe-features', intro: 'Mở một tệp PE giả lập, xem từng nhóm đặc trưng thay đổi ra sao khi bạn nén nó, ký số nó, hoặc thêm section rác.' },
        { t: 'h', text: 'Bước 3 — Packing: vấn đề lớn nhất của phân tích tĩnh', level: 2 },
        {
          t: 'p',
          md: '**Packing** là nén hoặc mã hoá phần mã thực thi, kèm một đoạn mã giải nén nhỏ chạy trước. Sau khi đóng gói, phần mã gốc trở thành một khối byte entropy cao mà mô hình tĩnh không đọc được gì. UPX là loại đơn giản và gỡ được; Themida, VMProtect, ASProtect thì thương mại, chống gỡ, và còn ảo hoá luôn mã máy.',
        },
        {
          t: 'p',
          md: 'Vấn đề không phải packing khó phát hiện — entropy cao là dấu hiệu rõ. Vấn đề là **packing không đồng nghĩa với độc hại**. Nhiều phần mềm hợp pháp được đóng gói để chống sao chép: trình cài đặt, phần mềm chống gian lận trong game, phần mềm bản quyền đắt tiền, và cả một số phần mềm nội bộ doanh nghiệp.',
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'Chuyện đã kể ở chặng 0, giờ có bối cảnh đầy đủ',
          md: 'Bạn còn nhớ mô hình học được quy luật "có UPX = độc"? Đây là nơi nó xảy ra. Cơ chế cụ thể: mẫu độc được tải từ kho công khai — nơi tập trung mẫu đã đóng gói vì đóng gói là bước chuẩn của mọi bộ công cụ mã độc. Mẫu lành được lấy từ `C:\\Windows` và `C:\\Program Files` của một máy Windows sạch — nơi hầu như không có gì bị đóng gói.\n\nMô hình không học về mã độc. Nó học **nguồn gốc thư mục của mẫu**. Kiểm tra bằng một dòng: tính tỉ lệ mẫu bị đóng gói trong mỗi lớp. Nếu con số là 95% và 3%, bạn không có bộ dữ liệu mã độc — bạn có bộ dữ liệu phân biệt hai thư mục.\n\nCách chữa: đưa phần mềm lành tính có đóng gói vào tập huấn luyện (trình cài đặt là nguồn dồi dào và miễn phí), và **luôn** báo cáo hiệu năng tách riêng cho nhóm đã đóng gói và nhóm chưa đóng gói.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't6l2-cp1',
              kind: 'mcq',
              tags: ['ma-doc', 'tuong-quan-gia'],
              q: 'Bạn phát hiện 95% mẫu độc trong tập huấn luyện bị đóng gói, còn mẫu lành chỉ 3%. Hành động đúng nhất?',
              options: [
                'Bỏ đặc trưng entropy đi vì nó gây rò rỉ',
                'Bổ sung phần mềm lành tính đã đóng gói vào tập huấn luyện và báo cáo hiệu năng tách riêng theo nhóm',
                'Giải nén toàn bộ mẫu trước khi trích đặc trưng',
                'Giữ nguyên, vì entropy cao đúng là dấu hiệu của mã độc',
              ],
              answer: 1,
              why: 'Vấn đề nằm ở **tương quan giữa nhãn và cách thu thập mẫu**, không nằm ở bản thân đặc trưng entropy — entropy vẫn là tín hiệu có ích khi phân phối cân bằng. Bỏ đặc trưng đi là chữa triệu chứng và làm mất thông tin thật. Giải nén toàn bộ nghe hay nhưng bất khả thi với các trình đóng gói thương mại và cực tốn tài nguyên. Cách đúng là **sửa dữ liệu**: thêm trình cài đặt, phần mềm game, phần mềm có bảo vệ bản quyền vào lớp lành, rồi báo cáo hiệu năng riêng cho từng nhóm để không giấu vấn đề dưới một con số trung bình đẹp.',
              distractorWhy: [
                'Entropy mang thông tin thật; bỏ nó đi làm mô hình yếu hơn mà không giải quyết được nguyên nhân.',
                '',
                'Trình đóng gói thương mại chống gỡ tự động; giải nén hàng triệu mẫu cũng không khả thi về chi phí.',
                'Đây chính là kết luận sai mà dữ liệu thiên lệch dụ bạn tin. Nhiều phần mềm hợp pháp cũng đóng gói.',
              ],
            },
            {
              id: 't6l2-cp2',
              kind: 'truefalse',
              tags: ['ma-doc', 'ro-ri-du-lieu'],
              q: 'Chia ngẫu nhiên 80/20 trên một triệu mẫu PE là đủ tin cậy vì số mẫu rất lớn.',
              answer: false,
              why: 'Số lượng không cứu được cách chia sai. Một triệu mẫu PE thực chất là vài nghìn họ, mỗi họ hàng trăm tới hàng chục nghìn biến thể gần trùng. Chia ngẫu nhiên đảm bảo mỗi họ có mặt ở cả hai tập, nên mô hình chỉ cần nhận diện họ. Đo đúng thì phải chia theo thời gian (mô phỏng việc triển khai thật: hôm nay huấn luyện, ngày mai gặp mẫu mới) và lý tưởng là chia theo họ, để tập kiểm tra chứa những họ mô hình chưa từng thấy.',
            },
          ],
        },
        { t: 'h', text: 'Bước 4 — Mô hình', level: 2 },
        {
          t: 'table',
          head: ['Cách tiếp cận', 'Ưu', 'Nhược', 'Vị trí thực tế'],
          rows: [
            [
              'LightGBM trên đặc trưng EMBER',
              'Huấn luyện vài phút, mô hình vài chục MB, giải thích được bằng SHAP, chịu được đặc trưng thiếu',
              'Phụ thuộc chất lượng bộ trích đặc trưng do người thiết kế',
              'Chuẩn công nghiệp. Là thứ bạn phải vượt qua trước khi thử gì khác',
            ],
            [
              'MalConv — CNN đọc thẳng byte thô (Raff và cộng sự, 2018)',
              'Không cần thiết kế đặc trưng thủ công; học được mẫu byte lạ',
              'Nặng, chậm, và rất dễ bị tấn công chèn byte vào cuối tệp',
              'Giá trị nghiên cứu cao, ít khi thắng LightGBM trên chỉ số thực dụng',
            ],
            [
              'Đồ thị lời gọi hàm, đồ thị luồng điều khiển',
              'Bắt được cấu trúc logic, khó né hơn nhiều',
              'Cần dịch ngược, tốn hàng giây mỗi tệp, hỏng khi mã bị đóng gói',
              'Dùng cho phân loại họ và phân tích chuyên sâu, không dùng để quét hàng loạt',
            ],
            [
              'Hàm băm mờ (ssdeep, TLSH) và phân cụm',
              'Nhóm được biến thể của cùng một chiến dịch, rất rẻ',
              'Không phân loại được mẫu hoàn toàn mới',
              'Bổ trợ tuyệt vời: gom cụm trước, rồi mới chấm điểm từng cụm',
            ],
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Đường cơ sở EMBER: LightGBM và cách đọc kết quả cho đúng',
          code:
            "import numpy as np, lightgbm as lgb\n" +
            "from sklearn.metrics import roc_curve, roc_auc_score\n" +
            "\n" +
            "# X_train / X_test đã tách theo THỜI GIAN: test toàn bộ nằm sau train.\n" +
            "mo_hinh = lgb.LGBMClassifier(\n" +
            "    n_estimators=1000, learning_rate=0.05,\n" +
            "    num_leaves=64, min_child_samples=50)\n" +
            "mo_hinh.fit(X_train, y_train)\n" +
            "\n" +
            "p = mo_hinh.predict_proba(X_test)[:, 1]\n" +
            "fpr, tpr, nguong = roc_curve(y_test, p)\n" +
            "\n" +
            "# Trong sản phẩm thật, chỉ MỘT điểm trên đường cong có ý nghĩa:\n" +
            "# tỉ lệ phát hiện tại ngân sách báo động giả cho phép.\n" +
            "for muc in (1e-4, 1e-3, 1e-2):\n" +
            "    i = np.searchsorted(fpr, muc)\n" +
            "    print(f'FPR={muc:.4f} -> TPR={tpr[i]:.3f}, nguong={nguong[i]:.4f}')\n" +
            "\n" +
            "print('AUC (chi de tham khao, KHONG dung de chon mo hinh):',\n" +
            "      round(roc_auc_score(y_test, p), 5))\n",
        },
        { t: 'h', text: 'Bước 5 — Trôi khái niệm theo họ, và lịch huấn luyện lại', level: 2 },
        { t: 'figure', id: 'fig-drift', caption: 'Mã độc không trôi đều đặn. Nó giật cục: một họ mới bùng lên, mô hình mù trong vài tuần, rồi ổn định lại sau khi được huấn luyện lại.' },
        {
          t: 'p',
          md: 'Trôi trong mã độc có hình dạng riêng: không phải một đường trượt xuống êm ả mà là **những cú sập theo họ**. Emotet ngừng hoạt động rồi quay lại với bộ nạp mới; một dịch vụ mã hoá mã (crypter) mới xuất hiện và đột nhiên 40% mẫu trong tuần trông khác hẳn; một trình biên dịch mới phổ biến (Rust, Go, Nim) làm toàn bộ phân phối byte thay đổi.',
        },
        {
          t: 'steps',
          title: 'Đo trôi cho đúng',
          steps: [
            {
              title: 'Đo theo lát thời gian, không đo tổng',
              md: 'Chia tập kiểm tra thành các tuần. Với mỗi tuần, tính tỉ lệ phát hiện ở **một ngưỡng cố định** — cùng con số bạn dùng trong sản xuất. Vẽ theo thời gian. Một con số tổng gộp che mất chính thứ bạn cần thấy: mô hình tốt trong tháng đầu và mù dần từ tháng thứ ba.',
            },
            {
              title: 'Cố định ngưỡng, không cố định tỉ lệ',
              md: 'Sai lầm hay gặp: mỗi tuần lại chọn lại ngưỡng để giữ FPR bằng 0,1%. Làm vậy bạn đang che giấu trôi, vì trong sản xuất ngưỡng là một hằng số đã nạp vào sản phẩm. Hãy giữ ngưỡng và để cả TPR lẫn FPR tự biến động — đó mới là thứ khách hàng thực sự trải nghiệm.',
            },
            {
              title: 'Tách riêng chỉ số cho họ đã biết và họ mới',
              md: 'Gắn nhãn họ cho mẫu kiểm tra (dùng kết quả AVClass hoặc nhãn từ nhà cung cấp). Tính hai đường: một cho các họ có mặt trong tập huấn luyện, một cho các họ hoàn toàn mới. Đường thứ hai mới là năng lực tổng quát hoá thật; đường thứ nhất chỉ đo trí nhớ.',
            },
            {
              title: 'Chọn lịch huấn luyện lại từ dữ liệu, không từ cảm tính',
              md: 'Vẽ đường TPR theo tuần cho tới khi nó rơi xuống dưới mức chấp nhận được. Khoảng thời gian đó chính là chu kỳ huấn luyện lại của bạn. Với mã độc PE, con số thực tế mà nhiều đội dùng nằm trong khoảng **hằng tuần tới hằng tháng** — không phải hằng năm.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Chỉ số AUT của khung Tesseract',
          md: 'Pendlebury và cộng sự (USENIX Security 2019) chỉ ra hai loại thiên lệch làm các bài báo phân loại mã độc báo cáo kết quả cao giả tạo: **thiên lệch thời gian** (mẫu kiểm tra nằm trước mẫu huấn luyện) và **thiên lệch không gian** (tỉ lệ độc/lành trong thí nghiệm không giống thực tế, nơi phần lớn tệp là lành).\n\nHọ đề xuất chỉ số **AUT** — diện tích dưới đường hiệu năng theo thời gian — buộc bạn phải công bố mô hình xuống cấp ra sao qua các kỳ, thay vì một con số tại một thời điểm. Nếu bạn viết báo cáo nội bộ về mô hình mã độc, đây là khuôn mẫu đáng mượn.',
        },
        { t: 'h', text: 'Bước 6 — Kẻ tấn công né thế nào', level: 2 },
        {
          t: 'table',
          head: ['Kỹ thuật né', 'Chi phí cho kẻ tấn công', 'Đối sách của bạn'],
          rows: [
            [
              'Chèn byte vào cuối tệp (append attack) hoặc thêm section rác',
              'Rất thấp — vài dòng script, tệp vẫn chạy y nguyên',
              'Chuẩn hoá đặc trưng theo kích thước; bỏ qua vùng ngoài các section được nạp; đặc biệt nguy hiểm với MalConv đọc byte thô',
            ],
            [
              'Đóng gói lại bằng crypter thương mại hoặc tự viết',
              'Thấp tới trung bình — có dịch vụ bán sẵn theo tháng',
              'Đặc trưng cấu trúc của lớp vỏ; phát hiện hành vi giải nén khi chạy; chuyển gánh nặng sang phân tích động',
            ],
            [
              'Ký số bằng chứng chỉ đánh cắp hoặc mua từ công ty bình phong',
              'Trung bình tới cao — tốn tiền và bị thu hồi khi bị phát hiện',
              'Đừng coi "có chữ ký số" là đặc trưng miễn tội; kiểm tra danh tiếng của chính người ký và tuổi chứng chỉ',
            ],
            [
              'Chèn thêm hàng nghìn chuỗi và import vô hại lấy từ phần mềm lành',
              'Thấp — có công cụ tự động làm việc này',
              'Đây là tấn công đối kháng ở mức đặc trưng; huấn luyện đối kháng và ưu tiên đặc trưng khó thêm bớt',
            ],
            [
              'Bỏ tệp hoàn toàn: chạy trong bộ nhớ, dùng LOLBins, script PowerShell, tệp LNK',
              'Trung bình — cần cách tồn tại và nạp mã khác',
              'Không có tệp thì mô hình tĩnh vô dụng; phải chuyển sang phát hiện theo hành vi (bài t6-l3 và t6-l8)',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Điểm mù lớn nhất của phân tích tĩnh',
          md: 'Phần lớn các cuộc tấn công thành công gần đây **không bắt đầu bằng một tệp PE lạ trên đĩa**. Chúng bắt đầu bằng một tệp LNK trong tệp nén, một macro, một script chạy `certutil` để tải mã, hoặc bằng thông tin đăng nhập bị lộ và không có tệp nào cả.\n\nMô hình tĩnh PE giỏi nhất thế giới cũng không thấy gì trong những trường hợp đó. Đây không phải lý do để bỏ nó — nó vẫn chặn khối lượng lớn với chi phí thấp — nhưng là lý do vì sao **không được coi nó là lớp phòng thủ chính**, và vì sao chương trình phát hiện của bạn phải phủ cả hành vi tiến trình, dòng lệnh và mạng.',
        },
        { t: 'terms', ids: ['ember', 'pe', 'gbdt', 'troi-khai-niem', 'entropy', 'tuong-quan-gia'] },
      ],
      keyTakeaways: [
        'Mã độc đi theo họ; chia ngẫu nhiên khiến mẫu cùng họ nằm ở cả hai tập và tạo ra điểm số ảo — bắt buộc chia theo thời gian, tốt hơn nữa là theo họ.',
        'EMBER cung cấp 2.381 đặc trưng chia thành chín nhóm; nhóm imports gần với hành vi bắt buộc của mã độc nhất nên đắt giá nhất.',
        'Packing không đồng nghĩa với độc hại; phải đưa phần mềm lành đã đóng gói vào tập huấn luyện và báo cáo hiệu năng tách riêng theo nhóm.',
        'Đo trôi bằng cách giữ NGƯỠNG cố định và vẽ tỉ lệ phát hiện theo tuần, tách riêng họ đã biết và họ mới.',
        'Chu kỳ huấn luyện lại thực tế cho mã độc PE nằm trong khoảng hằng tuần tới hằng tháng, và phải được suy ra từ đường trôi chứ không phải từ cảm tính.',
        'Né tránh rẻ nhất là chèn byte và đóng gói lại; điểm mù lớn nhất là các cuộc tấn công không có tệp PE nào trên đĩa.',
      ],
      cards: [
        {
          id: 't6l2-c1',
          front: 'Vì sao chia ngẫu nhiên tập dữ liệu mã độc cho kết quả cao giả tạo?',
          back: 'Vì mã độc đi theo họ: một họ sinh ra hàng nghìn biến thể gần trùng. Chia ngẫu nhiên đưa mẫu cùng họ vào cả train lẫn test, nên mô hình chỉ cần nhận ra họ đã thấy chứ không hề tổng quát hoá.',
          tags: ['ma-doc', 'ro-ri-du-lieu'],
        },
        {
          id: 't6l2-c2',
          front: 'Trong bộ đặc trưng EMBER, nhóm nào gần với hành vi bắt buộc của mã độc nhất? Vì sao?',
          back: 'Nhóm imports. Muốn mã hoá tệp thì buộc phải gọi hàm mã hoá và hàm duyệt tệp; muốn tiêm mã thì buộc phải có VirtualAllocEx và CreateRemoteThread. Bỏ chúng đi nghĩa là viết lại năng lực cốt lõi.',
          tags: ['ma-doc', 'dac-trung'],
        },
        {
          id: 't6l2-c3',
          front: 'Vì sao không được cho rằng "entropy cao = mã độc"?',
          back: 'Vì entropy cao chỉ nói tệp đã bị nén hoặc mã hoá, mà rất nhiều phần mềm hợp pháp cũng đóng gói: trình cài đặt, phần mềm chống gian lận trong game, phần mềm có bảo vệ bản quyền.',
          tags: ['ma-doc', 'entropy'],
        },
        {
          id: 't6l2-c4',
          front: 'Khi đo trôi khái niệm theo tuần, vì sao phải giữ ngưỡng cố định thay vì cố định FPR?',
          back: 'Vì trong sản phẩm thật ngưỡng là hằng số đã nạp sẵn. Chọn lại ngưỡng mỗi tuần để giữ FPR sẽ che mất chính hiện tượng trôi mà bạn đang cần đo.',
          tags: ['troi-khai-niem', 'do-luong'],
        },
        {
          id: 't6l2-c5',
          front: 'Tấn công chèn byte vào cuối tệp (append attack) khai thác điểm yếu nào?',
          back: 'Nó thêm dữ liệu vào vùng không được nạp khi thực thi, nên tệp chạy y nguyên nhưng phân phối byte đổi hẳn. Đặc biệt hiệu quả với mô hình đọc byte thô như MalConv.',
          tags: ['ma-doc', 'ne-tranh'],
        },
      ],
      quiz: [
        {
          id: 't6l2-q1',
          kind: 'mcq',
          tags: ['ma-doc', 'troi-khai-niem'],
          q: 'Tỉ lệ phát hiện tụt từ 94% xuống 71% trong tám tháng, còn tỉ lệ báo động giả không đổi. Cách giải thích hợp lý nhất?',
          options: [
            'Mô hình bị quá khớp và cần thêm regularization',
            'Các họ mã độc mới xuất hiện sau thời điểm huấn luyện, nằm ngoài vùng mô hình đã học',
            'Dữ liệu lành tính đã thay đổi phân phối',
            'Ngưỡng đã bị đặt sai từ đầu',
          ],
          answer: 1,
          why: 'Chi tiết quyết định là **FPR không đổi**. Nếu phân phối lành tính trôi thì FPR sẽ động đậy; nếu ngưỡng sai từ đầu thì cả hai con số đã lệch ngay từ ngày một. Việc chỉ TPR tụt trong khi FPR đứng yên là chân dung điển hình của trôi ở lớp dương: các họ mới, crypter mới, trình biên dịch mới tạo ra những mẫu nằm ngoài vùng mô hình từng thấy. Cách chữa không phải tinh chỉnh siêu tham số mà là huấn luyện lại trên dữ liệu mới, và thiết lập một lịch định kỳ dựa trên đường trôi đo được.',
          distractorWhy: [
            'Quá khớp thể hiện ngay ở lần đánh giá đầu tiên, không phải xuất hiện dần sau tám tháng.',
            '',
            'Nếu phân phối lành tính trôi thì tỉ lệ báo động giả đã thay đổi theo, nhưng đề bài nói nó không đổi.',
            'Ngưỡng sai sẽ sai ngay từ đầu chứ không tạo ra xu hướng giảm dần theo thời gian.',
          ],
        },
        {
          id: 't6l2-q2',
          kind: 'multi',
          tags: ['ma-doc', 'quy-trinh'],
          q: 'Bạn nhận một bộ dữ liệu PE mới. Việc nào nên làm TRƯỚC khi huấn luyện bất cứ mô hình nào? (Chọn tất cả đáp án đúng)',
          options: [
            'Kiểm tra tỉ lệ mẫu đã đóng gói trong mỗi lớp',
            'Kiểm tra phân phối thời điểm biên dịch của hai lớp có lệch nhau không',
            'Kiểm tra nguồn thu thập của mẫu lành và mẫu độc có khác nhau về bản chất không',
            'Chạy ngay LightGBM để lấy con số AUC làm mốc',
          ],
          answers: [0, 1, 2],
          why: 'Ba việc đầu đều là kiểm tra **tương quan giả do quy trình thu thập**, và chúng phát hiện được đúng loại lỗi đã giết chết vô số dự án: mẫu độc đóng gói còn mẫu lành thì không, mẫu độc biên dịch năm 2024 còn mẫu lành năm 2015, mẫu độc lấy từ kho công khai còn mẫu lành lấy từ một thư mục Windows. Chạy LightGBM trước không sai về mặt kỹ thuật, nhưng con số AUC thu được lúc đó vô nghĩa và tệ hơn là nó tạo ra sự tự tin sai chỗ khiến bạn bỏ qua các kiểm tra trên.',
        },
        {
          id: 't6l2-q3',
          kind: 'match',
          tags: ['ma-doc', 'ne-tranh'],
          q: 'Nối kỹ thuật né tránh với đối sách phù hợp nhất.',
          pairs: [
            ['Chèn byte vào cuối tệp', 'Chỉ trích đặc trưng từ các section thực sự được nạp'],
            ['Đóng gói bằng crypter thương mại', 'Chuyển gánh nặng sang phân tích động trong sandbox'],
            ['Ký số bằng chứng chỉ đánh cắp', 'Chấm điểm danh tiếng và tuổi của chính người ký'],
            ['Tấn công không dùng tệp, chỉ dùng LOLBins', 'Phát hiện theo dòng lệnh và quan hệ tiến trình cha-con'],
          ],
          why: 'Mỗi kỹ thuật né tấn công vào một giả định cụ thể của mô hình tĩnh, nên đối sách cũng phải nhắm đúng giả định đó. Điểm chung của bốn cặp: khi kẻ tấn công làm cho **bề mặt tĩnh** mất thông tin, bạn phải lấy thông tin từ một tầng khác — lúc chạy, lúc kết nối mạng, hoặc từ ngữ cảnh danh tính. Đó là lý do không có hệ thống phát hiện nghiêm túc nào chỉ dựa vào một tầng duy nhất.',
        },
        {
          id: 't6l2-q4',
          kind: 'truefalse',
          tags: ['ma-doc', 'do-luong'],
          q: 'AUC là chỉ số phù hợp nhất để so sánh hai mô hình phân loại mã độc sắp đưa vào sản phẩm EDR.',
          answer: false,
          why: 'AUC tổng hợp toàn bộ đường cong, kể cả những vùng bạn sẽ không bao giờ vận hành. Sản phẩm EDR chạy ở vùng báo động giả cực thấp — cỡ 1 trên 1.000 hoặc thấp hơn — vì mỗi lần chặn nhầm một tệp hợp pháp là một sự cố với khách hàng. Chỉ số đúng là **tỉ lệ phát hiện tại một mức báo động giả cố định** (ví dụ TPR ở FPR = 0,1%), đo trên tập kiểm tra tách theo thời gian. Hai mô hình có cùng AUC hoàn toàn có thể chênh nhau hàng chục điểm TPR tại điểm vận hành thật.',
        },
        {
          id: 't6l2-q5',
          kind: 'input',
          tags: ['ma-doc', 'ember'],
          q: 'Bộ dữ liệu công khai nào cung cấp sẵn vector đặc trưng của hơn một triệu tệp PE, kèm mô hình LightGBM cơ sở và tập kiểm tra tách theo thời gian?',
          accept: ['ember', 'EMBER', 'ember 2018', 'ember2018'],
          placeholder: 'Tên bộ dữ liệu…',
          hint: 'Năm chữ cái, do Endgame công bố, Anderson và Roth.',
          why: 'EMBER (Endgame Malware BEnchmark for Research). Điểm thiết kế quan trọng nhất của nó không phải quy mô mà là việc **không phát hành tệp thô** — bạn nhận vector đặc trưng và mã trích xuất mã nguồn mở, nên học được kỹ thuật mà không phải xử lý mã độc sống. Phiên bản 2018 khó hơn 2017 vì các mẫu lành tính được chọn sát ranh giới hơn và tập kiểm tra nằm hoàn toàn sau tập huấn luyện về mặt thời gian.',
        },
      ],
      terms: ['ember', 'pe', 'gbdt', 'troi-khai-niem', 'entropy', 'tuong-quan-gia'],
      further: [
        {
          title: 'EMBER: An Open Dataset for Training Static PE Malware Machine Learning Models — Anderson & Roth (2018)',
          note: 'Bài mô tả bộ dữ liệu và bộ trích đặc trưng. Đọc phần thiết kế đặc trưng như một danh sách kiểm tra khi bạn tự xây bộ trích của mình.',
        },
        {
          title: 'Malware Detection by Eating a Whole EXE — Raff và cộng sự (2018)',
          note: 'MalConv: đọc thẳng hai triệu byte đầu tệp bằng CNN. Đáng đọc cả vì ý tưởng lẫn vì các nghiên cứu sau chỉ ra nó dễ bị chèn byte tới mức nào.',
        },
        {
          title: 'TESSERACT: Eliminating Experimental Bias in Malware Classification across Space and Time — Pendlebury và cộng sự (2019)',
          note: 'Nguồn của chỉ số AUT và của hai khái niệm thiên lệch thời gian, thiên lệch không gian. Nên đọc trước khi tin bất kỳ con số nào trong một bài báo về phân loại mã độc.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't6-l3',
      trackId: 'ung-dung',
      title: 'Phân tích động và chuỗi lời gọi API',
      subtitle: 'Cho mã độc chạy thật, ghi lại nó làm gì — và đối phó với việc nó biết mình đang bị nhìn',
      minutes: 25,
      practiceMinutes: 3,
      level: 'nang-cao',
      prereqs: ['t6-l2'],
      why: {
        short:
          'Phân tích tĩnh mù trước mã đã đóng gói và trước tấn công không dùng tệp; phân tích động nhìn thấy hành vi thật, nhưng chỉ khi bạn thắng được cuộc chơi mèo vờn chuột với kỹ thuật né sandbox.',
        scenario:
          'Đội của bạn nhận 8.000 tệp đáng ngờ mỗi ngày. Mô hình tĩnh chấm 300 tệp vào vùng xám. Bạn có một cụm sandbox chạy được 400 mẫu/ngày với 4 phút mỗi mẫu. Bạn phải quyết định cho mẫu nào vào sandbox, biểu diễn kết quả ra sao để mô hình dùng được, và giải thích vì sao 130 mẫu trong số đó không thể hiện hành vi gì.',
        roles: ['Malware Analyst', 'Detection Engineer', 'Security Data Scientist', 'Threat Hunter'],
        costOfNotKnowing:
          'Bạn tin vào báo cáo sandbox nói "không phát hiện hành vi độc hại" và cho qua một bộ nạp có kiểm tra máy ảo — đúng mẫu sẽ chạy trên máy nạn nhân ba tiếng sau đó.',
      },
      objectives: [
        'Thiết kế được ba cách biểu diễn chuỗi lời gọi API và nêu đánh đổi của từng cách',
        'Nhận diện được sáu kỹ thuật né sandbox và biết dấu vết chúng để lại trong báo cáo',
        'Quyết định được mẫu nào đáng đưa vào sandbox dựa trên ràng buộc công suất',
        'Giải thích được vì sao n-gram API thường ngang ngửa mô hình chuỗi sâu với chi phí thấp hơn nhiều',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bạn cho một mẫu chạy trong sandbox 4 phút. Báo cáo trả về: mở một cửa sổ, gọi `GetSystemTime`, gọi `Sleep`, rồi thoát. Sandbox kết luận "lành tính". Theo bạn có bao nhiêu khả năng mẫu này thực sự lành, và bạn kiểm tra bằng cách nào?',
          reveal:
            'Khả năng nó lành thấp hơn nhiều so với cảm giác ban đầu. Chuỗi `GetSystemTime` → `Sleep` → thoát là một trong những chân dung kinh điển của **né sandbox**: mã kiểm tra xem nó có đang bị theo dõi không, hoặc đơn giản là ngủ lâu hơn thời gian phân tích rồi mới làm việc thật.\n\nBa cách kiểm tra, xếp theo mức công sức:\n\n**1.** Xem thời lượng `Sleep` được yêu cầu. Nếu mẫu xin ngủ 600 giây trong một sandbox chỉ chạy 240 giây, bạn đã có câu trả lời. Nhiều sandbox rút ngắn `Sleep` xuống — và mã độc phát hiện chuyện đó bằng cách so `GetTickCount` trước và sau khi ngủ.\n\n**2.** Chạy lại trong môi trường khác: thêm RAM, thêm nhân CPU, giả lập máy đã tham gia domain, thêm lịch sử duyệt web và tệp Office trong thư mục người dùng, cho chuột di chuyển.\n\n**3.** Coi chính hành vi kiểm tra môi trường là **tín hiệu dương**. Một chương trình kế toán bình thường không hỏi số nhân CPU, không đọc khoá registry của VMware, không đo độ trễ của lệnh `rdtsc`. Đây là điểm đảo chiều quan trọng của bài này: **việc mẫu cố tránh bị phân tích chính là đặc trưng đáng giá nhất mà nó để lại.**',
        },
        { t: 'h', text: 'Bước 1 — Sandbox cho bạn dữ liệu gì', level: 2 },
        {
          t: 'list',
          items: [
            '**Chuỗi lời gọi API** theo thứ tự thời gian, kèm tham số: `CreateFile`, `RegSetValueEx`, `VirtualAllocEx`, `WriteProcessMemory`, `CreateRemoteThread`, `CryptEncrypt`, `InternetOpenUrl`. Đây là dữ liệu giàu nhất.',
            '**Cây tiến trình**: ai sinh ra ai, với dòng lệnh gì. `winword.exe` sinh `powershell.exe` sinh `rundll32.exe` là một chuỗi hầu như không xuất hiện trong công việc bình thường.',
            '**Thao tác tệp và registry**: tệp nào bị tạo, ghi, xoá, đổi tên; khoá tự khởi động nào bị đặt; bản sao chép vào thư mục Startup.',
            '**Hoạt động mạng**: truy vấn DNS, kết nối TCP, yêu cầu HTTP, SNI của TLS, kích thước và nhịp gói tin.',
            '**Ảnh chụp bộ nhớ**: chuỗi và cấu hình lộ ra sau khi mã tự giải nén — thường là nơi tìm thấy địa chỉ máy chủ điều khiển và khoá mã hoá.',
            '**Ảnh màn hình và sự kiện giao diện**: hữu ích để nhận ra ransomware đã hiện thông báo đòi tiền, hoặc mẫu đang chờ người dùng bấm nút.',
          ],
        },
        {
          t: 'table',
          head: ['Công cụ', 'Loại', 'Điểm mạnh', 'Lưu ý'],
          rows: [
            ['CAPE Sandbox', 'Mã nguồn mở, kế thừa Cuckoo', 'Trích xuất cấu hình và payload đã giải nén của nhiều họ mã độc', 'Cần công sức vận hành; phải tự làm cứng để chống phát hiện'],
            ['Cuckoo (bản gốc)', 'Mã nguồn mở, lịch sử', 'Kiến trúc kinh điển, nhiều tài liệu học tập', 'Không còn được phát triển tích cực; các nhánh cộng đồng thay thế'],
            ['Joe Sandbox, ANY.RUN, Hybrid Analysis', 'Thương mại hoặc dịch vụ', 'Môi trường đã làm cứng sẵn, ANY.RUN cho tương tác trực tiếp', 'Gửi mẫu lên dịch vụ ngoài là quyết định về bảo mật dữ liệu, không chỉ về kỹ thuật'],
            ['Sysmon + ETW trên máy thật', 'Thu thập tại chỗ', 'Không có vấn đề né sandbox vì đây là máy thật', 'Chỉ thấy cái đã chạy trên mạng bạn — phát hiện, không phải tiền kiểm'],
          ],
        },
        {
          t: 'compare',
          title: 'Tĩnh và động: không phải chọn một',
          left: {
            title: '📄 Phân tích tĩnh',
            items: [
              'Vài mili-giây mỗi tệp — quét được toàn bộ ổ đĩa',
              'An toàn tuyệt đối, mã không bao giờ chạy',
              'Bao phủ 100% mẫu, không phụ thuộc điều kiện kích hoạt',
              'Mù trước mã đã đóng gói và mã sinh ra lúc chạy',
              'Không thấy máy chủ điều khiển, không thấy khoá mã hoá',
            ],
          },
          right: {
            title: '▶️ Phân tích động',
            items: [
              'Vài phút mỗi mẫu — chỉ đủ cho phần xám',
              'Cần cách ly nghiêm ngặt, có rủi ro thoát máy ảo',
              'Chỉ thấy nhánh mã thực sự chạy trong lần chạy đó',
              'Xuyên qua mọi lớp đóng gói vì mã phải tự giải nén để chạy',
              'Cho cấu hình, địa chỉ C2, và chân dung hành vi dùng được cho luật phát hiện',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Kiến trúc thực dụng: phân tầng theo chi phí',
          md: 'Với 8.000 tệp/ngày và 400 suất sandbox, cách bố trí đúng là một cái phễu:\n\n**Tầng 0** — hash đã biết (chặn hoặc cho qua tức thì, chi phí gần bằng 0), loại bỏ khoảng 90% khối lượng.\n\n**Tầng 1** — mô hình tĩnh chấm điểm phần còn lại, vài mili-giây mỗi tệp. Điểm rất cao thì chặn thẳng, điểm rất thấp thì cho qua.\n\n**Tầng 2** — sandbox chỉ nhận **vùng xám**, ưu tiên theo ba tiêu chí: điểm tĩnh gần ngưỡng, tệp chưa từng thấy ở bất kỳ máy nào trong tổ chức, và tệp tới từ người dùng có quyền cao. Đây là bài toán phân bổ nguồn lực, không phải bài toán phân loại — và nó là chỗ ML tạo giá trị rõ nhất.',
        },
        { t: 'h', text: 'Bước 2 — Biểu diễn chuỗi API thành đặc trưng', level: 2 },
        {
          t: 'steps',
          title: 'Ba cách, xếp theo độ phức tạp',
          steps: [
            {
              title: 'Túi API và n-gram API (đơn giản, mạnh không ngờ)',
              md: 'Đếm tần suất từng lời gọi API, rồi đếm tần suất các bộ 2, 3, 4 lời gọi liên tiếp. Đưa qua TF-IDF rồi vào LightGBM hoặc hồi quy logistic.\n\nVì sao mạnh: bộ ba `VirtualAllocEx` → `WriteProcessMemory` → `CreateRemoteThread` là chữ ký gần như hoàn hảo của kỹ thuật tiêm mã vào tiến trình. Một 3-gram đã bắt được nó. Không cần mô hình chuỗi sâu nào để học điều đó.\n\n**Bắt buộc làm trước:** nén chuỗi lặp. Một mẫu ransomware gọi `WriteFile` 40.000 lần sẽ áp đảo mọi thống kê tần suất. Rút gọn mỗi dãy lặp liên tiếp thành một mục kèm số lần theo thang log.',
            },
            {
              title: 'Ma trận chuyển trạng thái Markov (rẻ, cho cấu trúc)',
              md: 'Xây ma trận xác suất chuyển từ API i sang API j. Với 300 API phổ biến, bạn có ma trận 300×300, làm phẳng thành vector 90.000 chiều — thưa, nên vẫn chạy được. Cách này giữ được thông tin **thứ tự cục bộ** mà túi API vứt đi, và không cần huấn luyện mạng nơ-ron nào.',
            },
            {
              title: 'Mô hình chuỗi: LSTM, GRU, Transformer (đắt, cần dữ liệu)',
              md: 'Ánh xạ mỗi API thành một vector nhúng rồi đưa cả chuỗi vào mạng hồi quy hoặc Transformer. Chỉ đáng làm khi bạn có hàng trăm nghìn chuỗi có nhãn và khi phụ thuộc xa thực sự quan trọng.\n\n**Vấn đề độ dài:** chuỗi thật dài hàng chục nghìn lời gọi, vượt xa cửa sổ ngữ cảnh thoải mái của phần lớn kiến trúc. Bạn phải cắt, nén lặp, hoặc gộp lời gọi thành **hành vi cấp cao** trước (ví dụ gộp mọi thao tác tệp trong 100 ms thành một sự kiện "duyệt thư mục").',
            },
            {
              title: 'Ánh xạ lên MITRE ATT&CK (dễ đọc nhất cho con người)',
              md: 'Thay vì đưa API thô vào mô hình, hãy chuyển chúng thành các kỹ thuật ATT&CK: T1055 (Process Injection), T1547 (Boot or Logon Autostart), T1486 (Data Encrypted for Impact). Đặc trưng trở thành một vector nhị phân vài trăm chiều, ổn định trước thay đổi API cụ thể, và **analyst đọc hiểu được ngay** — điều này quan trọng hơn vài điểm AUC khi cảnh báo phải đi tới người xử lý.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Từ chuỗi API thô tới đặc trưng dùng được',
          code:
            "from itertools import groupby\n" +
            "import math\n" +
            "from sklearn.feature_extraction.text import TfidfVectorizer\n" +
            "\n" +
            "def nen_lap(chuoi):\n" +
            "    # Ransomware goi WriteFile 40.000 lan se ap dao moi thong ke tan suat.\n" +
            "    # Rut moi day lap lien tiep thanh mot muc kem bac log cua so lan.\n" +
            "    ket_qua = []\n" +
            "    for api, nhom in groupby(chuoi):\n" +
            "        n = len(list(nhom))\n" +
            "        ket_qua.append(f'{api}_x{int(math.log2(n)) if n > 1 else 0}')\n" +
            "    return ket_qua\n" +
            "\n" +
            "def thanh_van_ban(chuoi):\n" +
            "    return ' '.join(nen_lap(chuoi))\n" +
            "\n" +
            "# n-gram tu 1 den 4 lam duong co so; bo ba VirtualAllocEx ->\n" +
            "# WriteProcessMemory -> CreateRemoteThread se roi vao mot 3-gram.\n" +
            "vec = TfidfVectorizer(analyzer='word', ngram_range=(1, 4),\n" +
            "                      min_df=5, max_features=200_000)\n" +
            "X = vec.fit_transform(thanh_van_ban(c) for c in danh_sach_chuoi_api)\n",
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't6l3-cp1',
              kind: 'mcq',
              tags: ['sandbox', 'dac-trung'],
              q: 'Vì sao phải nén các dãy lời gọi API lặp trước khi trích đặc trưng tần suất?',
              options: [
                'Để giảm dung lượng lưu trữ báo cáo sandbox',
                'Vì một vòng lặp có thể chiếm hơn 90% chuỗi và áp đảo mọi tín hiệu khác',
                'Vì API lặp lại là dấu hiệu chắc chắn của mã độc',
                'Vì thư viện TF-IDF không xử lý được chuỗi dài',
              ],
              answer: 1,
              why: 'Một mẫu mã hoá 40.000 tệp sẽ có `WriteFile` chiếm gần như toàn bộ vector tần suất. Bộ ba lời gọi thực sự quan trọng — tiêm mã, đặt khoá tự khởi động, kết nối máy chủ điều khiển — chỉ xuất hiện vài lần và bị dìm xuống mức nhiễu. Sau khi nén lặp, thông tin "có lặp và lặp nhiều cỡ nào" vẫn được giữ dưới dạng bậc log, còn cấu trúc chuỗi thì nổi lên. Đây là ví dụ điển hình cho việc **tiền xử lý quyết định nhiều hơn lựa chọn mô hình**.',
              distractorWhy: [
                'Tiết kiệm dung lượng là hệ quả phụ, không phải lý do chính.',
                '',
                'Vòng lặp xuất hiện trong cả phần mềm lành: sao lưu, nén, quét virus đều ghi hàng nghìn tệp.',
                'TF-IDF xử lý được chuỗi dài; vấn đề nằm ở phân phối tần suất bị lệch, không ở giới hạn kỹ thuật.',
              ],
            },
            {
              id: 't6l3-cp2',
              kind: 'truefalse',
              tags: ['sandbox', 'ne-tranh'],
              q: 'Nếu sandbox báo cáo "không quan sát thấy hành vi độc hại" thì nên coi mẫu đó là lành tính.',
              answer: false,
              why: 'Báo cáo đó chỉ nói: **trong lần chạy này, trên môi trường này, trong khoảng thời gian này**, mẫu không làm gì đáng chú ý. Nó không nói gì về những nhánh mã chưa được kích hoạt. Mã độc hiện đại thường chỉ chạy khi máy đã tham gia domain, khi ngôn ngữ hệ thống khớp mục tiêu, khi có đúng tham số dòng lệnh do bộ nạp truyền vào, hoặc sau vài giờ. Cách xử lý đúng: coi kết quả sandbox là **bằng chứng dương khi có**, và là **thông tin không kết luận được khi trống** — chứ không phải bằng chứng âm.',
            },
          ],
        },
        { t: 'h', text: 'Bước 3 — Né sandbox: sáu kỹ thuật và dấu vết của chúng', level: 2 },
        {
          t: 'table',
          head: ['Kỹ thuật', 'Mã độc kiểm tra gì', 'Dấu vết trong báo cáo', 'Cách làm cứng sandbox'],
          rows: [
            [
              'Phát hiện máy ảo',
              'Khoá registry của VMware/VirtualBox, tên ổ đĩa, địa chỉ MAC theo tiền tố nhà cung cấp, driver ảo',
              'Đọc `HKLM\\SYSTEM\\...\\Disk\\Enum`, gọi `GetAdaptersInfo` rồi thoát sớm',
              'Đổi định danh phần cứng, gỡ công cụ tích hợp máy khách, dùng ảo hoá lồng nhau hoặc máy thật',
            ],
            [
              'Ngủ lâu và bom hẹn giờ',
              'Sandbox chỉ chạy vài phút; ngủ 10 phút là qua mặt',
              '`Sleep(600000)` hoặc vòng lặp tính toán vô nghĩa kéo dài',
              'Rút ngắn `Sleep` nhưng phải làm giả nhất quán cả `GetTickCount`, `QueryPerformanceCounter`, `NtQuerySystemTime`',
            ],
            [
              'Kiểm tra tài nguyên',
              'Số nhân CPU dưới 4, RAM dưới 4 GB, ổ đĩa dưới 100 GB, độ phân giải màn hình lạ',
              'Gọi `GlobalMemoryStatusEx`, `GetSystemInfo` ngay khi khởi động',
              'Cấp cấu hình máy ảo giống máy văn phòng thật, không dùng cấu hình tối thiểu',
            ],
            [
              'Kiểm tra dấu hiệu người dùng',
              'Không có tệp gần đây, không có lịch sử duyệt web, chuột không di chuyển, chưa từng có ai đăng nhập',
              'Đọc thư mục `Recent`, hook chuột rồi chờ',
              'Dựng ảnh máy có lịch sử sử dụng thật: tài liệu, lịch sử trình duyệt, hồ sơ người dùng, mô phỏng chuột',
            ],
            [
              'Ràng buộc theo mục tiêu',
              'Máy có tham gia domain không, ngôn ngữ hệ thống, múi giờ, địa chỉ IP thuộc quốc gia nào',
              'Gọi `GetUserDefaultLangID`, `NetGetJoinInformation`, truy vấn dịch vụ tra cứu IP',
              'Chạy nhiều biến thể môi trường; định tuyến ra ngoài qua đường phù hợp mục tiêu chiến dịch',
            ],
            [
              'Cần tham số hoặc mật khẩu để giải nén',
              'Payload chỉ giải mã khi nhận đúng khoá từ bộ nạp hoặc đúng tham số dòng lệnh',
              'Thoát ngay lập tức, không có hành vi nào',
              'Nộp cả chuỗi lây nhiễm (thư, tệp nén, tệp LNK) chứ không chỉ payload cuối',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Đảo chiều: coi việc né là đặc trưng',
          md: 'Đây là ý quan trọng nhất của bài. Đừng chỉ cố làm sandbox khó bị phát hiện — hãy **ghi lại chính các phép kiểm tra** mà mẫu thực hiện và đưa chúng vào vector đặc trưng.\n\nMột chương trình kế toán bình thường không đọc khoá registry của VMware, không đếm số nhân CPU trong 50 mili-giây đầu tiên, không đo độ trôi của bộ đếm thời gian. Số lượng và chủng loại phép kiểm tra chống phân tích là một đặc trưng có sức phân biệt rất mạnh, và nó **đắt để né**: muốn bỏ nó đi thì mã độc phải chấp nhận chạy trong mọi sandbox trên thế giới.\n\nĐây là một dạng chung của tư duy phòng thủ: khi đối thủ thêm một lớp phòng ngừa, lớp đó tự nó trở thành tín hiệu.',
        },
        { t: 'figure', id: 'fig-kill-chain', caption: 'Hành vi quan sát được trong sandbox tương ứng với đâu trong chuỗi tấn công. Ánh xạ lên ATT&CK biến chuỗi API thô thành thứ analyst đọc được.' },
        { t: 'h', text: 'Bước 4 — Đánh giá và triển khai', level: 2 },
        {
          t: 'checklist',
          title: 'Những gì phải đo, ngoài AUC',
          items: [
            'Tỉ lệ mẫu không thể hiện hành vi nào (execution failure rate) — nếu vượt 20% thì vấn đề nằm ở sandbox, không ở mô hình.',
            'Thông lượng thật: số mẫu mỗi giờ mỗi máy chủ, và độ trễ từ lúc nộp tới lúc có kết quả.',
            'Hiệu năng tách riêng cho nhóm có kiểm tra chống phân tích và nhóm không có — hai phân phối rất khác nhau.',
            'Tỉ lệ trùng lặp giữa cảnh báo của mô hình động và luật chữ ký sẵn có: nếu trùng 95% thì mô hình chưa tạo ra giá trị mới.',
            'Chi phí mỗi mẫu tính bằng tiền thật. Sandbox là tài nguyên đắt; con số này quyết định kiến trúc phễu ở tầng trên.',
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Ba bẫy hay gặp khi làm mô hình trên dữ liệu sandbox',
          md: '**1. Rò rỉ qua tên máy chủ sandbox.** Chuỗi API kèm tham số chứa đường dẫn như `C:\\Users\\sandbox_user\\...`. Nếu mẫu độc và mẫu lành được chạy trên hai cụm khác nhau, mô hình học tên cụm. Luôn chuẩn hoá đường dẫn và tên người dùng trước khi trích đặc trưng.\n\n**2. Rò rỉ qua thời gian chạy.** Mẫu độc được nộp năm 2024 và chạy trên ảnh máy Windows đã vá mới; mẫu lành chạy trên ảnh cũ từ 2021. Phiên bản DLL khác nhau tạo ra chuỗi API khác nhau. Dùng cùng một ảnh máy cho cả hai lớp.\n\n**3. Nhãn từ VirusTotal thay đổi theo thời gian.** Một mẫu có 3/70 công cụ báo độc hôm nay có thể thành 45/70 sau ba tháng. Nếu bạn gán nhãn ở hai thời điểm khác nhau cho hai lớp, bạn vừa đưa thời gian vào làm nhãn. Quy tắc: chốt một thời điểm truy vấn nhãn cho toàn bộ tập, và ghi lại thời điểm đó.',
        },
        { t: 'terms', ids: ['attck', 'ne-tranh', 'edr', 'ma-doc-dong', 'sandbox'] },
      ],
      keyTakeaways: [
        'Sandbox nhìn xuyên mọi lớp đóng gói vì mã buộc phải tự giải nén để chạy, nhưng chỉ thấy nhánh mã thực sự được kích hoạt trong lần chạy đó.',
        'Kết quả sandbox trống là thông tin không kết luận được, không phải bằng chứng lành tính.',
        'n-gram trên chuỗi API bắt được các chữ ký hành vi quan trọng nhất (như bộ ba tiêm mã) với chi phí rất thấp — luôn làm đường cơ sở này trước mô hình chuỗi sâu.',
        'Phải nén dãy lặp trước khi tính tần suất, nếu không một vòng lặp ghi tệp sẽ áp đảo toàn bộ vector đặc trưng.',
        'Chính các phép kiểm tra chống phân tích mà mẫu thực hiện là đặc trưng phân biệt mạnh và đắt để né — hãy ghi lại chúng thay vì chỉ tìm cách giấu sandbox.',
        'Với công suất sandbox giới hạn, bài toán thật là phân bổ nguồn lực cho vùng xám, không phải phân loại toàn bộ.',
      ],
      cards: [
        {
          id: 't6l3-c1',
          front: 'Vì sao phân tích động nhìn thấy được mã đã bị đóng gói còn phân tích tĩnh thì không?',
          back: 'Vì để chạy được, mã buộc phải tự giải nén vào bộ nhớ. Sandbox quan sát ở thời điểm sau khi giải nén, còn phân tích tĩnh chỉ thấy khối byte entropy cao.',
          tags: ['sandbox', 'ma-doc'],
        },
        {
          id: 't6l3-c2',
          front: 'Bộ ba lời gọi API nào là chữ ký gần như hoàn hảo của kỹ thuật tiêm mã vào tiến trình?',
          back: 'VirtualAllocEx → WriteProcessMemory → CreateRemoteThread. Một 3-gram trên chuỗi API đã bắt được nó, không cần mô hình chuỗi sâu.',
          tags: ['sandbox', 'attck'],
        },
        {
          id: 't6l3-c3',
          front: 'Vì sao báo cáo sandbox "không thấy hành vi độc hại" không phải bằng chứng lành tính?',
          back: 'Vì nó chỉ mô tả một lần chạy, trên một môi trường, trong một khoảng thời gian. Mẫu có thể đang chờ điều kiện kích hoạt: máy tham gia domain, đúng tham số dòng lệnh, hoặc đơn giản là ngủ lâu hơn thời gian phân tích.',
          tags: ['sandbox', 'ne-tranh'],
        },
        {
          id: 't6l3-c4',
          front: 'Vì sao "số lượng phép kiểm tra chống phân tích" là đặc trưng tốt?',
          back: 'Vì phần mềm bình thường không đọc khoá registry của VMware hay đếm nhân CPU khi khởi động, và vì bỏ các phép kiểm tra đó đi nghĩa là mã độc chấp nhận chạy trong mọi sandbox — cái giá rất đắt.',
          tags: ['sandbox', 'dac-trung'],
        },
        {
          id: 't6l3-c5',
          front: 'Nêu hai nguồn rò rỉ đặc thù của dữ liệu sandbox.',
          back: 'Đường dẫn và tên người dùng của chính cụm sandbox lọt vào tham số API; và hai lớp được chạy trên hai ảnh máy Windows khác phiên bản, tạo ra chuỗi API khác nhau vì lý do không liên quan tới nhãn.',
          tags: ['sandbox', 'ro-ri-du-lieu'],
        },
      ],
      quiz: [
        {
          id: 't6l3-q1',
          kind: 'mcq',
          tags: ['sandbox', 'thuc-chien'],
          q: '8.000 tệp/ngày, sandbox chạy được 400 mẫu/ngày. Cách chọn mẫu cho sandbox nào tạo giá trị cao nhất?',
          options: [
            'Chọn 400 tệp có điểm mô hình tĩnh cao nhất',
            'Chọn 400 tệp có điểm mô hình tĩnh gần ngưỡng nhất, ưu tiên tệp chưa từng thấy trong tổ chức',
            'Chọn ngẫu nhiên 400 tệp để có mẫu không thiên lệch',
            'Chọn 400 tệp lớn nhất vì mã độc phức tạp thường lớn',
          ],
          answer: 1,
          why: 'Tệp có điểm tĩnh rất cao thì bạn đã quyết định được rồi — chạy sandbox chỉ để xác nhận, tức là tiêu 4 phút để mua rất ít thông tin. Giá trị của một phép đo tỉ lệ thuận với **mức độ bạn đang phân vân**, và vùng phân vân nằm quanh ngưỡng. Thêm tiêu chí "chưa từng thấy trong tổ chức" vì một tệp đã chạy trên 3.000 máy suốt hai năm hầu như chắc chắn là phần mềm nội bộ, còn tệp xuất hiện lần đầu hôm nay mới đáng tiền. Đây chính là ý tưởng của học chủ động (active learning) áp vào ràng buộc công suất.',
          distractorWhy: [
            'Điểm cao nghĩa là đã đủ tự tin để hành động; phép đo thêm mang lại rất ít thông tin mới.',
            '',
            'Chọn ngẫu nhiên phù hợp để ước lượng tỉ lệ tổng thể, nhưng lãng phí kinh khủng khi tài nguyên khan hiếm.',
            'Kích thước tệp gần như không tương quan với mức độ nguy hiểm; nhiều bộ nạp chỉ vài chục KB.',
          ],
        },
        {
          id: 't6l3-q2',
          kind: 'order',
          tags: ['sandbox', 'quy-trinh'],
          q: 'Sắp xếp đường ống xử lý một tệp đáng ngờ theo thứ tự chi phí tăng dần.',
          items: [
            'Tra hash trong danh sách đã biết (chặn hoặc cho qua tức thì)',
            'Chấm điểm bằng mô hình tĩnh trên đặc trưng PE',
            'Đưa vùng xám vào sandbox và trích chuỗi API',
            'Chấm điểm chuỗi hành vi và ánh xạ lên MITRE ATT&CK',
            'Chuyển cho chuyên gia dịch ngược thủ công',
          ],
          why: 'Nguyên tắc phễu: mỗi tầng phải rẻ hơn tầng sau nhiều lần và phải loại bỏ được phần lớn khối lượng. Tra hash tốn micro-giây, mô hình tĩnh tốn mili-giây, sandbox tốn phút, chuyên gia tốn giờ và là tài nguyên khan hiếm nhất trong mọi đội bảo mật. Thiết kế sai thứ tự — ví dụ cho mọi tệp vào sandbox — làm hàng đợi vỡ trong ngày đầu tiên và khiến cả hệ thống trở nên vô dụng đúng lúc có sự cố.',
        },
        {
          id: 't6l3-q3',
          kind: 'multi',
          tags: ['sandbox', 'ne-tranh'],
          q: 'Hành vi nào trong báo cáo sandbox nên được coi là TÍN HIỆU ĐÁNG NGỜ chứ không phải bằng chứng lành tính? (Chọn tất cả đáp án đúng)',
          options: [
            'Đọc khoá registry chứa tên nhà cung cấp ảo hoá',
            'Gọi Sleep với thời lượng lớn hơn thời gian phân tích',
            'Đếm số nhân CPU và dung lượng RAM ngay khi khởi động',
            'Ghi một tệp nhật ký vào thư mục tạm rồi thoát',
          ],
          answers: [0, 1, 2],
          why: 'Ba hành vi đầu là các phép kiểm tra chống phân tích: chương trình đang cố xác định xem nó có đang bị theo dõi không. Phần mềm bình thường không quan tâm tới những thứ đó trong 50 mili-giây đầu tiên. Ghi tệp nhật ký vào thư mục tạm thì hoàn toàn phổ biến ở phần mềm hợp pháp, nên nó không phân biệt được gì — đưa vào mô hình chỉ thêm nhiễu. Bài học: **hành vi đáng ngờ nhất thường không phải hành vi phá hoại, mà là hành vi tự bảo vệ trước việc bị quan sát.**',
        },
        {
          id: 't6l3-q4',
          kind: 'truefalse',
          tags: ['sandbox', 'mo-hinh-chuoi'],
          q: 'Với dữ liệu chuỗi API, mô hình LSTM luôn vượt trội hơn n-gram kết hợp cây tăng cường.',
          answer: false,
          why: 'Trong nhiều so sánh thực tế, n-gram cộng LightGBM ngang ngửa hoặc thắng LSTM, đặc biệt khi dữ liệu có nhãn dưới trăm nghìn mẫu. Lý do: các mẫu hành vi quyết định — tiêm mã, đặt khoá tự khởi động, mã hoá hàng loạt — đều là **cụm cục bộ ngắn**, đúng thứ mà n-gram bắt hoàn hảo. Phụ thuộc xa hàng nghìn bước, thứ mà LSTM sinh ra để xử lý, hiếm khi mang thông tin quyết định ở đây. Thêm vào đó, n-gram huấn luyện trong vài phút, chạy trên CPU, và bạn đọc được đặc trưng nào đang đóng góp — ba lợi thế vận hành rất lớn.',
        },
        {
          id: 't6l3-q5',
          kind: 'input',
          tags: ['sandbox', 'ne-tranh'],
          q: 'Mã độc gọi GetTickCount, rồi Sleep, rồi GetTickCount lần nữa và so sánh hiệu số. Nó đang phát hiện thủ thuật nào của sandbox?',
          accept: ['rut ngan sleep', 'tang toc sleep', 'sleep skipping', 'rút ngắn sleep', 'bo qua sleep', 'sleep acceleration'],
          placeholder: 'Kỹ thuật của sandbox bị phát hiện…',
          hint: 'Sandbox làm gì với lệnh ngủ 10 phút khi nó chỉ có 4 phút để phân tích?',
          why: 'Sandbox thường **rút ngắn hoặc bỏ qua Sleep** để không lãng phí thời gian phân tích. Mã độc phản công bằng cách đo thời gian thật trước và sau khi ngủ: nếu xin ngủ 600 giây mà đồng hồ chỉ nhích 2 giây, nó biết mình đang bị theo dõi. Bài học kỹ thuật quan trọng: khi bạn làm giả một khía cạnh của môi trường, bạn phải làm giả **nhất quán tất cả các cách quan sát nó** — ở đây là `GetTickCount`, `QueryPerformanceCounter`, `NtQuerySystemTime`, và cả thời gian sửa đổi tệp. Một chỗ thiếu nhất quán là một điểm phát hiện.',
        },
      ],
      terms: ['attck', 'ne-tranh', 'edr', 'sandbox', 'ma-doc-dong'],
      further: [
        {
          title: 'MITRE ATT&CK — chiến thuật Defense Evasion (TA0005)',
          note: 'Danh mục có hệ thống các kỹ thuật né phân tích, kèm ví dụ nhóm tấn công thật. Dùng làm danh sách kiểm tra khi làm cứng sandbox.',
        },
        {
          title: 'CAPE Sandbox — tài liệu và mô-đun trích xuất cấu hình',
          note: 'Cách một sandbox mã nguồn mở hiện đại lấy được cấu hình C2 sau khi mẫu tự giải nén. Đọc mã nguồn mô-đun là cách nhanh nhất để hiểu chuỗi API mang thông tin gì.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't6-l4',
      trackId: 'ung-dung',
      title: 'Phát hiện tên miền DGA',
      subtitle: 'Entropy bắt được Conficker nhưng thua Matsnu — và vì sao ngữ cảnh thắng từ vựng',
      minutes: 24,
      practiceMinutes: 7,
      level: 'trung-cap',
      prereqs: ['t1-l5'],
      why: {
        short:
          'DGA là bài toán chuỗi ký tự sạch sẽ nhất trong bảo mật, và là ví dụ hoàn hảo cho việc một đặc trưng kinh điển (entropy) bị vô hiệu hoá bởi một thay đổi thiết kế đơn giản của đối thủ.',
        scenario:
          'Máy phân giải DNS nội bộ ghi 40 triệu truy vấn mỗi ngày. Đội ứng cứu nghi ngờ có máy nhiễm bộ nạp đang tìm máy chủ điều khiển. Bạn phải chỉ ra máy nào trong 12.000 máy trạm, dựa trên duy nhất log DNS, trong buổi chiều.',
        roles: ['Threat Hunter', 'Detection Engineer', 'SOC Analyst', 'Security Data Scientist'],
        costOfNotKnowing:
          'Bạn triển khai một bộ phát hiện dựa trên entropy, nó bỏ lọt hoàn toàn các họ dùng từ điển như Matsnu hay Suppobox, đồng thời cảnh báo mỗi ngày hàng nghìn tên miền băm hợp lệ của CDN và dịch vụ đám mây.',
      },
      objectives: [
        'Phân biệt được ba loại DGA và chỉ ra đặc trưng nào hiệu quả với từng loại',
        'Giải thích được vì sao entropy thất bại trước DGA dùng từ điển và thay bằng gì',
        'Thiết kế được đặc trưng ngữ cảnh cấp máy trạm mạnh hơn hẳn đặc trưng cấp tên miền',
        'Xử lý được nguồn báo động giả lớn nhất: tên miền băm hợp lệ của CDN và dịch vụ đám mây',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Ba tên miền: `kqxwzbmrtp.com`, `provideburn.net`, `d1a2b3c4e5f6.cloudfront.net`. Theo bạn cái nào do thuật toán sinh tên miền của mã độc tạo ra, và một bộ phát hiện dựa trên entropy sẽ chấm điểm ba cái này ra sao?',
          reveal:
            'Hai cái đầu là DGA, cái thứ ba là hạ tầng phân phối nội dung hoàn toàn hợp pháp. Còn bộ phát hiện dựa trên entropy sẽ xếp hạng gần như **ngược lại** với sự thật:\n\n`d1a2b3c4e5f6` — entropy cao, trông rất ngẫu nhiên → điểm cao nhất, và đây là **báo động giả**.\n`kqxwzbmrtp` — entropy cao, chuỗi phụ âm bất thường → điểm cao, đúng.\n`provideburn` — ghép hai từ tiếng Anh thật, entropy **thấp**, thống kê n-gram đẹp như tên miền của công ty khởi nghiệp → điểm thấp, và đây là **bỏ sót**.\n\n`provideburn.net` thuộc kiểu DGA dùng từ điển, như họ Matsnu và Suppobox. Nó phá vỡ toàn bộ nhóm đặc trưng dựa trên tính ngẫu nhiên bằng một thay đổi thiết kế rất đơn giản: thay vì bốc ngẫu nhiên từng ký tự, bốc ngẫu nhiên **từng từ** trong một từ điển nhúng sẵn.\n\nBài học lặp lại: mọi đặc trưng đều là một giả định về đối thủ, và đối thủ đọc được cùng những bài báo mà bạn đọc.',
        },
        { t: 'h', text: 'Bước 1 — DGA là gì và vì sao mã độc cần nó', level: 2 },
        {
          t: 'p',
          md: 'Nếu mã độc mã hoá cứng một địa chỉ máy chủ điều khiển, người phòng thủ chỉ cần chặn địa chỉ đó một lần là toàn bộ mạng lưới sập. **Thuật toán sinh tên miền** (Domain Generation Algorithm) giải bài toán đó: cả mã độc lẫn kẻ điều khiển cùng chạy một hàm sinh dựa trên hạt giống chung — thường là ngày tháng — cho ra hàng trăm tới hàng nghìn tên miền mỗi ngày. Kẻ tấn công chỉ cần đăng ký **một** trong số đó; máy nhiễm thử lần lượt cho tới khi có cái phân giải được.',
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'Conficker và bài toán quy mô',
          md: 'Conficker (2008–2009) là ví dụ kinh điển. Biến thể đầu sinh 250 tên miền mỗi ngày; sau khi liên minh phòng thủ bắt đầu đăng ký chặn trước, biến thể C nâng lên **50.000 tên miền mỗi ngày** trên hàng chục TLD khác nhau. Việc đăng ký chặn trước trở nên bất khả thi về cả chi phí lẫn phối hợp pháp lý qua nhiều quốc gia.\n\nĐó chính là lý do phát hiện phía máy khách — nhìn vào log DNS của chính bạn — trở thành đường phòng thủ thực tế, thay vì trông chờ vào việc chiếm giữ tên miền ở thượng nguồn.',
        },
        {
          t: 'table',
          head: ['Loại DGA', 'Cách sinh', 'Ví dụ minh hoạ', 'Đặc trưng bắt được'],
          rows: [
            [
              'Ngẫu nhiên theo ký tự (arithmetic)',
              'Bốc ngẫu nhiên từng ký tự từ bảng chữ cái, độ dài cố định',
              'kqxwzbmrtp.com',
              'Entropy, xác suất n-gram, chuỗi phụ âm liên tiếp — rất hiệu quả',
            ],
            [
              'Dựa trên từ điển (wordlist)',
              'Ghép 2–3 từ tiếng Anh từ từ điển nhúng trong mã',
              'provideburn.net',
              'Entropy vô dụng; cần độ hiếm của cặp từ, số từ ghép, và ngữ cảnh',
            ],
            [
              'Dựa trên hàm băm',
              'Băm hạt giống rồi chuyển sang chữ cái',
              'a3f9c1e07b2d.biz',
              'Giống loại một về mặt thống kê, nhưng độ dài thường rất đều',
            ],
            [
              'Hoán vị và biến đổi (permutation)',
              'Biến đổi một tên miền gốc: đổi ký tự, thêm bớt',
              'gooogle-update.info',
              'Khoảng cách chỉnh sửa tới danh sách thương hiệu; trùng với typosquatting',
            ],
          ],
        },
        { t: 'h', text: 'Bước 2 — Đặc trưng từ vựng và giới hạn của chúng', level: 2 },
        { t: 'figure', id: 'fig-entropy-scale', caption: 'Thang entropy của chuỗi ký tự. Chú ý vùng chồng lấn: tên miền băm của CDN nằm cùng chỗ với DGA ngẫu nhiên, còn DGA dùng từ điển nằm lẫn với tên miền bình thường.' },
        {
          t: 'list',
          items: [
            '**Entropy Shannon** của phần nhãn tên miền. Cao khi ký tự phân bố đều. Bắt tốt loại 1 và 3.',
            '**Xác suất n-gram** so với phân phối bigram/trigram của tên miền hợp pháp. `zx`, `qk`, `wj` gần như không tồn tại trong tên miền thật. Đây thường mạnh hơn entropy vì nó dùng cấu trúc ngôn ngữ chứ không chỉ độ đều.',
            '**Tỉ lệ nguyên âm trên phụ âm** và **độ dài chuỗi phụ âm liên tiếp dài nhất**. Tiếng Anh hiếm khi có 5 phụ âm liền.',
            '**Độ dài nhãn**, **số chữ số**, **có dấu gạch ngang không**, **TLD** (các TLD rẻ như `.top`, `.xyz`, `.click` có tỉ lệ lạm dụng cao hơn hẳn).',
            '**Tỉ lệ ký tự thuộc từ điển**: dùng một bộ tách từ tham lam để xem chuỗi có phân tích được thành các từ có nghĩa không. Đây là đặc trưng duy nhất trong nhóm từ vựng còn có ích trước DGA dùng từ điển — nhưng nó cũng khiến `provideburn` trông giống `firstblood` hay bất kỳ tên startup nào.',
          ],
        },
        { t: 'lab', id: 'lab-entropy', intro: 'Gõ vào các tên miền thật và tên miền DGA, xem entropy và điểm n-gram thay đổi ra sao. Thử tự tạo một tên miền dùng từ điển để lách qua ngưỡng.' },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't6l4-cp1',
              kind: 'mcq',
              tags: ['dga', 'entropy'],
              q: 'Vì sao đặc trưng entropy thất bại hoàn toàn trước họ DGA dùng từ điển như Matsnu?',
              options: [
                'Vì tên miền dùng từ điển thường rất ngắn',
                'Vì chuỗi ghép từ các từ tiếng Anh có phân phối ký tự giống hệt tên miền hợp pháp',
                'Vì entropy chỉ tính được trên chuỗi có chữ số',
                'Vì các họ này dùng TLD hợp pháp',
              ],
              answer: 1,
              why: 'Entropy đo mức độ **không đều** của phân phối ký tự. Một chuỗi ghép từ các từ tiếng Anh thật kế thừa luôn phân phối ký tự của tiếng Anh, nên entropy của nó nằm đúng trong vùng của tên miền bình thường. Điều tương tự xảy ra với xác suất n-gram: mọi bigram trong `provideburn` đều là bigram tiếng Anh phổ biến. Đây là ví dụ sạch sẽ cho một nguyên tắc chung: **một đặc trưng chỉ phân biệt được khi đối thủ chưa tối ưu để né đúng nó**. Câu trả lời không nằm ở chỗ tinh chỉnh entropy, mà ở chỗ chuyển sang tầng đặc trưng khác — ngữ cảnh truy vấn.',
              distractorWhy: [
                'Độ dài không phải yếu tố quyết định; nhiều tên miền dùng từ điển khá dài.',
                '',
                'Entropy tính được trên mọi chuỗi ký tự, không phụ thuộc vào việc có chữ số hay không.',
                'TLD là một đặc trưng riêng và yếu; vấn đề nằm ở phần nhãn tên miền.',
              ],
            },
            {
              id: 't6l4-cp2',
              kind: 'truefalse',
              tags: ['dga', 'bao-dong-gia'],
              q: 'Nguồn báo động giả lớn nhất của bộ phát hiện DGA dựa trên entropy là tên miền do dịch vụ đám mây và CDN sinh tự động.',
              answer: true,
              why: 'Chính xác, và nó tệ hơn vẻ ngoài. Các dịch vụ này sinh ra hàng triệu nhãn ngẫu nhiên hợp lệ: bản ghi của CDN, tên máy chủ tạm của nhà cung cấp đám mây, tên miền xác thực do các nền tảng SaaS tạo, chuỗi băm trong hệ thống chống thư rác. Chúng có entropy cao đúng như DGA. Cách xử lý thực dụng: chuẩn hoá về **tên miền cha** (eTLD+1) rồi lập danh sách cho phép ở mức đó, chấm điểm trên nhãn con nhưng bỏ qua nếu tên miền cha nằm trong danh sách hạ tầng đã biết và ổn định. Kèm theo đó là danh sách phải được duy trì — nó không tự đúng mãi mãi.',
            },
          ],
        },
        { t: 'h', text: 'Bước 3 — Mô hình chuỗi ký tự', level: 2 },
        {
          t: 'p',
          md: 'Woodbridge và cộng sự (2016) cho thấy một **LSTM cấp ký tự** học thẳng từ chuỗi tên miền vượt qua các bộ đặc trưng thủ công, mà không cần bất kỳ đặc trưng thiết kế tay nào. Kiến trúc rất nhỏ: nhúng ký tự khoảng 128 chiều, một lớp LSTM 128 đơn vị, một lớp sigmoid. Huấn luyện trong vài chục phút trên vài triệu tên miền.',
        },
        {
          t: 'p',
          md: 'Ưu điểm thật của nó không phải vài điểm AUC mà là: bạn không phải nghĩ ra đặc trưng cho từng họ mới. Nhược điểm thật cũng rất cụ thể: mô hình không giải thích được cho analyst, và nó vẫn thua trên họ dùng từ điển — vì thông tin phân biệt **không nằm trong chuỗi ký tự nữa**.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Đường cơ sở thực dụng: n-gram ký tự cộng hồi quy logistic',
          code:
            "from sklearn.feature_extraction.text import TfidfVectorizer\n" +
            "from sklearn.linear_model import LogisticRegression\n" +
            "from sklearn.pipeline import make_pipeline\n" +
            "import tldextract\n" +
            "\n" +
            "def nhan_ten_mien(d):\n" +
            "    # Chi lay phan nhan chinh, bo TLD va bo subdomain cua nha cung cap\n" +
            "    return tldextract.extract(d).domain\n" +
            "\n" +
            "# n-gram ky tu 2-5 bat duoc cac cap ky tu hiem nhu zx, qk, wj\n" +
            "mo_hinh = make_pipeline(\n" +
            "    TfidfVectorizer(analyzer='char', ngram_range=(2, 5), min_df=3),\n" +
            "    LogisticRegression(max_iter=2000, class_weight='balanced'),\n" +
            ")\n" +
            "mo_hinh.fit([nhan_ten_mien(d) for d in ten_mien_train], y_train)\n" +
            "\n" +
            "# Duong co so nay thuong dat 95-98% tren DGA ngau nhien theo ky tu\n" +
            "# va sup xuong gan muc doan mo tren DGA dung tu dien -> phai do RIENG\n" +
            "# tung ho de con so trung binh khong che mat diem mu.\n",
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Luôn báo cáo hiệu năng tách theo họ',
          md: 'Một con số tổng gộp trên tập DGA công khai gần như luôn đẹp, vì phần lớn mẫu trong các tập đó thuộc các họ ngẫu nhiên theo ký tự — loại dễ nhất. Nếu bạn báo cáo "độ chính xác 97%" mà không tách theo họ, bạn đang giấu đi việc mô hình đạt 99% trên Conficker và 55% trên Suppobox.\n\nBảng kết quả đúng có một dòng cho mỗi họ, sắp xếp theo recall tăng dần. Dòng đầu tiên chính là danh sách việc cần làm của bạn.',
        },
        { t: 'h', text: 'Bước 4 — Đặc trưng ngữ cảnh: nơi trận đấu thực sự diễn ra', level: 2 },
        {
          t: 'p',
          md: 'Đây là phần quan trọng nhất của bài. Nhìn vào một tên miền đơn lẻ là tự trói tay mình. Máy nhiễm DGA để lại một **dấu vết hành vi** ở cấp máy trạm mà không kỹ thuật đặt tên nào che được — vì bản chất của DGA là thử nhiều tên miền cho tới khi trúng.',
        },
        {
          t: 'table',
          head: ['Đặc trưng ngữ cảnh', 'Vì sao mạnh', 'Chi phí để kẻ tấn công né'],
          rows: [
            [
              'Số truy vấn trả về NXDOMAIN trong 10 phút, theo từng máy',
              'Máy nhiễm thử hàng trăm tên miền chưa đăng ký; máy bình thường hiếm khi vượt vài chục',
              'Cao — phải giảm số tên miền thử, làm tăng rủi ro mất liên lạc với C2',
            ],
            [
              'Số nhãn tên miền duy nhất dưới cùng một tên miền cha',
              'Bắt được cả DGA lẫn đường hầm DNS',
              'Cao — đây là hệ quả trực tiếp của cơ chế hoạt động',
            ],
            [
              'Độ phổ biến của tên miền trong tổ chức: bao nhiêu máy đã truy vấn nó trong 30 ngày',
              'Tên miền DGA gần như luôn chỉ được một hoặc vài máy truy vấn, và chỉ trong một ngày',
              'Rất cao — muốn giả cần làm cho nhiều máy cùng truy vấn, tức là tự lộ thêm',
            ],
            [
              'Tuổi tên miền tính từ ngày đăng ký',
              'Tên miền DGA thường được đăng ký vài giờ tới vài ngày trước khi dùng',
              'Trung bình — có thể đăng ký trước hàng tháng, nhưng tốn tiền và tăng rủi ro bị chiếm giữ',
            ],
            [
              'Chuỗi thời gian truy vấn có tính chu kỳ',
              'Bộ nạp thử lại theo lịch cố định, tạo nhịp đều',
              'Trung bình — thêm jitter được, nhưng jitter lớn làm chậm việc kết nối lại',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Quy tắc chung, không chỉ cho DGA',
          md: 'Khi đặc trưng ở mức **một đối tượng** (một tên miền, một tệp, một gói tin) bị đối thủ tối ưu để né, hãy leo lên mức **tập hợp**: một máy trạm trong một cửa sổ thời gian, một tài khoản trong một ngày, một tổ chức trong một tuần.\n\nLý do sâu xa: kẻ tấn công kiểm soát được từng đối tượng riêng lẻ mà họ tạo ra, nhưng không kiểm soát được **mối quan hệ giữa chúng và phần còn lại của môi trường bạn**. Bạn sẽ gặp lại đúng nguyên tắc này ở bài NIDS, bài UEBA và bài gian lận — đó là lý do nó được nhắc ở đây một cách rõ ràng.',
        },
        { t: 'h', text: 'Bước 5 — Triển khai và né tránh', level: 2 },
        {
          t: 'checklist',
          title: 'Nơi đặt bộ phát hiện và những gì cần chuẩn bị',
          items: [
            'Trên máy phân giải DNS nội bộ: nơi duy nhất thấy được cả truy vấn thất bại (NXDOMAIN) — dữ liệu giá trị nhất của cả bài toán.',
            'Trên log Zeek `dns.log` hoặc log của máy phân giải đám mây: cần giữ đủ trường máy nguồn, không chỉ tên miền.',
            'Kết hợp Passive DNS để biết tên miền đã tồn tại bao lâu và có bao nhiêu tổ chức khác từng truy vấn.',
            'Chuẩn bị sẵn cơ chế chặn: DNS RPZ hoặc sinkhole nội bộ, để chuyển từ phát hiện sang ngăn chặn trong vài phút.',
            'Đo tầm nhìn của chính bạn: bao nhiêu phần trăm máy trạm thực sự dùng máy phân giải nội bộ? DNS-over-HTTPS trong trình duyệt có thể làm bạn mù mà không hay biết.',
          ],
        },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Chuyển sang DGA dùng từ điển.** Chi phí thấp, vô hiệu hoá toàn bộ nhóm đặc trưng ngẫu nhiên. Đối sách: chuyển trọng số sang đặc trưng ngữ cảnh.',
            '**DNS-over-HTTPS hoặc DNS-over-TLS tới máy phân giải công cộng.** Truy vấn không còn đi qua máy phân giải của bạn, log DNS trống rỗng. Đối sách mang tính kiến trúc chứ không phải mô hình: chặn DoH ra ngoài bằng chính sách mạng, ép mọi máy dùng máy phân giải nội bộ, và giám sát chính hành vi kết nối tới các máy phân giải DoH đã biết.',
            '**Bỏ DNS hoàn toàn.** Dùng địa chỉ IP mã hoá cứng, hoặc **dead drop resolver**: lấy địa chỉ C2 từ một bài đăng trên mạng xã hội, một kho mã nguồn công khai, hay một dịch vụ ghi chú. Lưu lượng đi tới một tên miền hoàn toàn hợp pháp. Đối sách: chuyển sang phát hiện beaconing ở tầng luồng mạng, bài t6-l5.',
            '**Giảm số lượng tên miền thử mỗi ngày.** Ít NXDOMAIN hơn thì khó thấy hơn. Đánh đổi của kẻ tấn công là mất khả năng phục hồi khi tên miền bị chiếm giữ.',
            '**Đăng ký trước hàng loạt tên miền DGA.** Không còn NXDOMAIN vì mọi truy vấn đều phân giải được. Rất tốn kém, nên hiếm gặp ngoài các nhóm có nguồn lực lớn.',
          ],
        },
        { t: 'terms', ids: ['dga', 'entropy', 'c2', 'zeek', 'bao-dong-gia'] },
      ],
      keyTakeaways: [
        'DGA tồn tại để mã độc không phụ thuộc vào một địa chỉ C2 duy nhất; Conficker biến thể C sinh tới 50.000 tên miền mỗi ngày.',
        'Entropy và xác suất n-gram rất hiệu quả với DGA ngẫu nhiên theo ký tự và hoàn toàn vô dụng với DGA dùng từ điển.',
        'Nguồn báo động giả lớn nhất là nhãn ngẫu nhiên hợp lệ của CDN và dịch vụ đám mây — xử lý bằng danh sách cho phép ở mức eTLD+1.',
        'LSTM cấp ký tự (Woodbridge và cộng sự, 2016) bỏ được bước thiết kế đặc trưng nhưng vẫn thua ở đúng chỗ mà đặc trưng từ vựng thua.',
        'Đặc trưng ngữ cảnh cấp máy trạm — bùng nổ NXDOMAIN, số nhãn duy nhất, độ phổ biến nội bộ — mạnh hơn hẳn và đắt hơn nhiều để né.',
        'Quy tắc tổng quát: khi đặc trưng ở mức một đối tượng bị né, hãy leo lên mức tập hợp trong một cửa sổ thời gian.',
        'DNS-over-HTTPS có thể làm bạn mù hoàn toàn — hãy đo tầm nhìn trước khi đo mô hình.',
      ],
      cards: [
        {
          id: 't6l4-c1',
          front: 'Vì sao mã độc dùng DGA thay vì mã hoá cứng địa chỉ máy chủ điều khiển?',
          back: 'Vì địa chỉ cố định chỉ cần bị chặn một lần là cả mạng lưới sập. DGA sinh hàng trăm tới hàng nghìn tên miền mỗi ngày; kẻ tấn công chỉ cần đăng ký một cái là giữ được liên lạc.',
          tags: ['dga', 'c2'],
        },
        {
          id: 't6l4-c2',
          front: 'Vì sao entropy vô dụng trước DGA dùng từ điển như Matsnu hay Suppobox?',
          back: 'Vì chuỗi ghép từ các từ tiếng Anh thật kế thừa luôn phân phối ký tự của tiếng Anh, nên entropy và thống kê n-gram của nó nằm đúng trong vùng tên miền bình thường.',
          tags: ['dga', 'entropy'],
        },
        {
          id: 't6l4-c3',
          front: 'Đặc trưng ngữ cảnh nào của DGA khó né nhất, và vì sao?',
          back: 'Bùng nổ NXDOMAIN theo từng máy trong cửa sổ ngắn. Vì bản chất DGA là thử nhiều tên miền chưa đăng ký cho tới khi trúng — giảm số lần thử đồng nghĩa với mất khả năng kết nối lại.',
          tags: ['dga', 'dac-trung'],
        },
        {
          id: 't6l4-c4',
          front: 'Nguồn báo động giả lớn nhất của bộ phát hiện DGA theo entropy là gì? Xử lý ra sao?',
          back: 'Nhãn ngẫu nhiên hợp lệ của CDN và dịch vụ đám mây. Xử lý bằng cách gộp về eTLD+1 và lập danh sách cho phép ở mức tên miền cha, đồng thời duy trì danh sách đó định kỳ.',
          tags: ['dga', 'bao-dong-gia'],
        },
        {
          id: 't6l4-c5',
          front: 'Nêu quy tắc tổng quát rút ra từ bài DGA về việc chọn cấp độ đặc trưng.',
          back: 'Khi đặc trưng ở mức một đối tượng bị đối thủ tối ưu để né, hãy leo lên mức tập hợp: một máy trong một cửa sổ thời gian. Kẻ tấn công kiểm soát từng đối tượng nhưng không kiểm soát quan hệ giữa chúng và môi trường của bạn.',
          tags: ['dga', 'dac-trung'],
        },
      ],
      quiz: [
        {
          id: 't6l4-q1',
          kind: 'mcq',
          tags: ['dga', 'dac-trung'],
          q: 'Một máy trạm tạo ra 340 truy vấn NXDOMAIN trong 8 phút, tới 340 tên miền khác nhau trên 5 TLD. Kết luận hợp lý nhất?',
          options: [
            'Máy bị lỗi cấu hình DNS',
            'Nhiều khả năng có tiến trình đang chạy DGA để tìm máy chủ điều khiển',
            'Người dùng đang duyệt web nhiều',
            'Đây là hành vi bình thường của phần mềm cập nhật',
          ],
          answer: 1,
          why: 'Ba chi tiết cùng lúc mới tạo nên kết luận: **số lượng lớn**, **toàn bộ đều thất bại**, và **tên miền đều khác nhau trên nhiều TLD**. Lỗi cấu hình DNS thường tạo ra truy vấn lặp lại tới cùng một tên miền, không phải 340 tên miền khác nhau. Duyệt web tạo NXDOMAIN nhưng rải rác và thường có tên miền cha lặp lại. Phần mềm cập nhật truy vấn một tập tên miền cố định và chúng phân giải thành công. Lưu ý cách suy luận ở đây: không có đặc trưng nào một mình đủ kết luận, mà là **tổ hợp** của chúng trong một cửa sổ thời gian — đó là lý do đặc trưng ngữ cảnh được tính trên cửa sổ trượt chứ không tính trên từng truy vấn.',
          distractorWhy: [
            'Lỗi cấu hình thường lặp lại cùng một tên miền hoặc cùng một hậu tố tìm kiếm, không sinh 340 tên khác nhau.',
            '',
            'Duyệt web tạo NXDOMAIN rải rác, không tập trung 340 lần trong 8 phút với toàn tên miền lạ.',
            'Phần mềm cập nhật truy vấn tập tên miền cố định và phân giải thành công.',
          ],
        },
        {
          id: 't6l4-q2',
          kind: 'match',
          tags: ['dga'],
          q: 'Nối loại DGA với đặc trưng phát hiện hiệu quả nhất cho nó.',
          pairs: [
            ['Ngẫu nhiên theo ký tự', 'Xác suất n-gram so với tên miền hợp pháp'],
            ['Dựa trên từ điển', 'Bùng nổ NXDOMAIN theo từng máy trạm'],
            ['Hoán vị từ tên miền thương hiệu', 'Khoảng cách chỉnh sửa tới danh sách thương hiệu'],
            ['Dùng dịch vụ hợp pháp làm nơi lấy địa chỉ C2', 'Phân tích nhịp kết nối ở tầng luồng mạng'],
          ],
          why: 'Mỗi loại phá vỡ một giả định khác nhau nên cần một tầng đặc trưng khác nhau. Điểm cần rút ra không phải là bốn cặp cụ thể, mà là: **một bộ phát hiện DGA nghiêm túc luôn là tổ hợp của nhiều bộ phát hiện**, mỗi cái phủ một loại. Đội nào chỉ có một mô hình entropy sẽ phủ đúng một dòng trong bảng này và mù ở ba dòng còn lại.',
        },
        {
          id: 't6l4-q3',
          kind: 'multi',
          tags: ['dga', 'trien-khai'],
          q: 'Điều gì có thể làm bộ phát hiện DGA của bạn mất tầm nhìn gần như hoàn toàn? (Chọn tất cả đáp án đúng)',
          options: [
            'Trình duyệt bật DNS-over-HTTPS tới máy phân giải công cộng',
            'Máy trạm được cấu hình dùng máy phân giải của nhà cung cấp đám mây thay vì máy phân giải nội bộ',
            'Mã độc dùng địa chỉ IP mã hoá cứng, không truy vấn DNS',
            'Mã độc chuyển sang DGA dùng từ điển',
          ],
          answers: [0, 1, 2],
          why: 'Ba lựa chọn đầu đều làm **mất dữ liệu đầu vào** — không có log thì không có mô hình nào cứu được, dù nó tốt tới đâu. DGA dùng từ điển thì khác về bản chất: dữ liệu vẫn còn nguyên, chỉ là nhóm đặc trưng từ vựng mất tác dụng, còn đặc trưng ngữ cảnh vẫn hoạt động tốt. Phân biệt hai loại vấn đề này rất quan trọng khi bạn phải ưu tiên công việc: mất tầm nhìn là vấn đề kiến trúc và chính sách, phải giải bằng cấu hình mạng; mất sức phân biệt là vấn đề mô hình, giải bằng đặc trưng mới.',
        },
        {
          id: 't6l4-q4',
          kind: 'truefalse',
          tags: ['dga', 'do-luong'],
          q: 'Báo cáo "mô hình DGA đạt độ chính xác 97% trên tập kiểm tra" là cách trình bày kết quả phù hợp.',
          answer: false,
          why: 'Con số tổng gộp che mất chính thứ cần biết. Các tập DGA công khai lệch mạnh về phía các họ ngẫu nhiên theo ký tự — loại dễ nhất — nên 97% hoàn toàn có thể là 99% trên Conficker và 55% trên Suppobox. Cách trình bày đúng: một dòng cho mỗi họ, sắp xếp theo recall tăng dần, kèm số cảnh báo mỗi ngày ở ngưỡng vận hành thật. Dòng đầu tiên của bảng đó chính là danh sách việc cần làm tiếp theo, còn con số 97% thì không nói cho bạn phải làm gì cả.',
        },
        {
          id: 't6l4-q5',
          kind: 'input',
          tags: ['dga', 'dac-trung'],
          q: 'Mã phản hồi DNS nào cho biết tên miền được truy vấn không tồn tại, và là tín hiệu quan trọng nhất để phát hiện máy nhiễm DGA?',
          accept: ['nxdomain', 'NXDOMAIN', 'nx domain', 'name error'],
          placeholder: 'Tên mã phản hồi…',
          hint: 'Tám chữ cái, viết liền, xuất hiện khi tên miền chưa được đăng ký.',
          why: 'NXDOMAIN (non-existent domain). Nó là tín hiệu quan trọng nhất vì nó phơi bày trực tiếp **cơ chế hoạt động** của DGA: mã độc phải thử hàng loạt tên miền chưa đăng ký cho tới khi gặp cái mà kẻ điều khiển đã mua. Muốn giảm dấu vết này, kẻ tấn công phải giảm số tên miền thử mỗi ngày, và điều đó làm giảm chính khả năng phục hồi mà DGA sinh ra để bảo vệ. Đây là ví dụ đẹp về một đặc trưng gắn liền với đánh đổi cốt lõi của đối thủ — loại đặc trưng đáng đầu tư nhất.',
        },
      ],
      terms: ['dga', 'entropy', 'c2', 'zeek', 'bao-dong-gia'],
      further: [
        {
          title: 'Predicting Domain Generation Algorithms with Long Short-Term Memory Networks — Woodbridge và cộng sự (2016)',
          note: 'Bài đặt nền cho hướng mô hình chuỗi ký tự trong phát hiện DGA. Đáng đọc cả phần thảo luận về các họ mà mô hình thất bại.',
        },
        {
          title: 'DGArchive',
          note: 'Kho tên miền DGA đã được đảo ngược thuật toán, phân loại theo họ. Đây là nguồn để bạn dựng bảng đánh giá tách theo họ thay vì một con số tổng gộp.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't6-l5',
      trackId: 'ung-dung',
      title: 'Phát hiện xâm nhập mạng (NIDS)',
      subtitle: 'Zeek và Suricata làm phần nặng, ML làm phần còn lại — và phần còn lại nhỏ hơn bạn tưởng',
      minutes: 30,
      practiceMinutes: 7,
      level: 'nang-cao',
      prereqs: ['t6-l4'],
      why: {
        short:
          'Mạng là nơi duy nhất bạn thấy được toàn bộ máy trong tổ chức, kể cả những máy không cài được tác tử — nhưng cũng là nơi phát hiện bất thường thất bại nhiều nhất, và bạn cần biết vì sao trước khi đầu tư.',
        scenario:
          'Một máy trạm kế toán mở kết nối HTTPS ra một địa chỉ trên đám mây, cứ 60 giây một lần, mỗi lần gửi khoảng 1,2 KB và nhận về 800 byte, suốt 11 ngày. Không cảnh báo nào nổ. Bạn phải giải thích vì sao chữ ký không bắt được, xây đặc trưng gì để bắt, và ước tính bao nhiêu báo động giả nó sẽ tạo ra trên 12.000 máy.',
        roles: ['Threat Hunter', 'Detection Engineer', 'SOC Analyst', 'Security Architect'],
        costOfNotKnowing:
          'Bạn mua một hộp "AI phát hiện bất thường mạng", bật lên, nhận 4.000 cảnh báo trong tuần đầu, tắt đi sau ba tuần — và kênh C2 vẫn nằm nguyên ở đó vì nó chưa bao giờ bất thường theo nghĩa thống kê.',
      },
      objectives: [
        'Trích được đặc trưng beaconing từ log kết nối và giải thích ý nghĩa của hệ số biến thiên',
        'Thiết kế bộ đặc trưng phát hiện đường hầm DNS ở cấp tên miền cha',
        'Nêu bốn lý do cấu trúc khiến phát hiện bất thường trên mạng thất bại nhiều hơn các lĩnh vực khác',
        'Chọn đúng vai trò cho chữ ký, cho phân cụm và cho mô hình có giám sát trong một kiến trúc NIDS',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Hai luồng HTTPS đi ra Internet. Luồng A: một người đang duyệt web, khoảng cách giữa các kết nối là 3 giây, 47 giây, 1 giây, 210 giây, 8 giây… Luồng B: đúng 60 giây một lần, liên tục 11 ngày. Cả hai đều mã hoá nên bạn không đọc được nội dung. Đặc trưng nào phân biệt được, và nó có cần biết nội dung không?',
          reveal:
            'Bạn không cần biết nội dung. Chỉ cần một con số: **hệ số biến thiên** của khoảng cách giữa các kết nối, tức độ lệch chuẩn chia cho trung bình.\n\nLuồng A là hành vi người: khoảng cách trải từ 1 giây tới vài phút, hệ số biến thiên thường lớn hơn 1.\nLuồng B là máy nói chuyện với máy theo lịch: hệ số biến thiên gần 0.\n\nĐây chính là **beaconing** — nhịp tim của kênh điều khiển. Cobalt Strike, một trong những khung công cụ hậu khai thác được dùng rộng rãi nhất bởi cả đội đỏ lẫn nhóm tội phạm, có tham số `sleep` mặc định 60 giây và `jitter` mặc định 0. Với cấu hình đó, hệ số biến thiên gần như bằng 0 và bạn bắt được ngay.\n\nKẻ tấn công có kinh nghiệm đặt jitter 50%: thời gian ngủ rơi ngẫu nhiên trong khoảng 30–60 giây, hệ số biến thiên lên khoảng 0,19. Vẫn thấp hơn nhiều so với hành vi người. Muốn thoát hẳn thì phải đặt sleep hàng giờ với jitter lớn — và khi đó kẻ tấn công mất khả năng điều khiển tương tác. **Đây là một đánh đổi họ không thoát được, nên đây là chỗ đáng đầu tư.**',
        },
        { t: 'h', text: 'Bước 1 — Dữ liệu: Zeek trước, mô hình sau', level: 2 },
        {
          t: 'p',
          md: 'Sai lầm phổ biến nhất trong NIDS dùng ML là bắt đầu từ gói tin thô. Đừng. **Zeek** đã biến hàng terabyte gói tin thành log có cấu trúc, có ngữ nghĩa, sẵn sàng cho phân tích — và nó làm việc đó tốt hơn bất cứ thứ gì bạn tự viết trong sáu tháng.',
        },
        {
          t: 'table',
          head: ['Log của Zeek', 'Trường đáng giá nhất', 'Bài toán nó phục vụ'],
          rows: [
            ['conn.log', 'ts, id.orig_h, id.resp_h, duration, orig_bytes, resp_bytes, conn_state, history', 'Beaconing, quét cổng, truyền dữ liệu ra ngoài, di chuyển ngang'],
            ['dns.log', 'query, qtype, rcode, answers, TTL', 'DGA, đường hầm DNS, tên miền mới đăng ký'],
            ['ssl.log', 'server_name (SNI), ja3, ja3s, validation_status, version', 'Nhận dạng máy khách TLS, chứng chỉ tự ký, thư viện TLS bất thường'],
            ['http.log', 'host, uri, user_agent, method, status_code, request_body_len', 'Tải payload, webshell, User-Agent của công cụ'],
            ['files.log', 'mime_type, md5, sha1, total_bytes, source', 'Tệp đi qua mạng, ghép với mô hình phân loại mã độc'],
            ['x509.log', 'certificate.subject, issuer, not_valid_before', 'Chứng chỉ tự ký, chứng chỉ vừa cấp, chuỗi trường giống nhau giữa các chiến dịch'],
          ],
        },
        {
          t: 'compare',
          title: 'Ba lớp, ba vai trò — đừng để lớp sau làm việc của lớp trước',
          left: {
            title: '📜 Suricata: chữ ký',
            items: [
              'Bắt cái ĐÃ BIẾT: khai thác CVE cụ thể, chuỗi byte của công cụ, địa chỉ C2 đã công bố',
              'Chi phí gần bằng 0 cho mỗi luật, giải thích được tuyệt đối',
              'Bộ luật cộng đồng ET Open cập nhật hằng ngày',
              'Vô dụng trước lưu lượng mã hoá và trước công cụ tuỳ biến',
            ],
          },
          right: {
            title: '📊 Zeek + ML: hành vi và metadata',
            items: [
              'Bắt cái CHƯA BIẾT nhưng có hình dạng quen: nhịp đều, khối lượng lệch, quan hệ mới',
              'Chi phí cao hơn: cần dữ liệu lịch sử, cần chỉnh ngưỡng, cần giải thích cho analyst',
              'Hoạt động được cả trên lưu lượng mã hoá vì chỉ dùng metadata',
              'Không thay thế chữ ký; nó phủ phần chữ ký không với tới',
            ],
          },
        },
        { t: 'h', text: 'Bước 2 — Beaconing: bài toán mẫu mực của NIDS dùng ML', level: 2 },
        {
          t: 'steps',
          title: 'Từ conn.log tới điểm beaconing',
          steps: [
            {
              title: 'Gom theo cặp (máy nguồn, đích) trong cửa sổ 24 giờ',
              md: 'Đơn vị phân tích không phải một kết nối mà là **một mối quan hệ**. Với mỗi cặp, lấy dãy các mốc thời gian bắt đầu kết nối. Bỏ các cặp có dưới 20 kết nối — không đủ dữ liệu để nói gì về nhịp.',
            },
            {
              title: 'Tính đặc trưng về nhịp',
              md: 'Từ dãy khoảng cách thời gian giữa các kết nối liên tiếp, tính: trung bình, độ lệch chuẩn, **hệ số biến thiên** (độ lệch chuẩn chia trung bình), độ lệch tuyệt đối trung vị (MAD), và tỉ lệ khoảng cách rơi vào khoảng phổ biến nhất. Bổ sung một phép biến đổi Fourier để bắt chu kỳ ẩn khi có nhiều luồng trộn lẫn.',
            },
            {
              title: 'Tính đặc trưng về khối lượng',
              md: 'Beacon thường gửi và nhận lượng dữ liệu rất giống nhau mỗi lần. Tính hệ số biến thiên của `orig_bytes` và `resp_bytes`, tỉ lệ giữa hai chiều, và số giá trị kích thước duy nhất. Một kênh C2 đang chờ lệnh có tỉ lệ gửi/nhận rất đặc trưng và ổn định.',
            },
            {
              title: 'Tính đặc trưng về độ bền và độ hiếm',
              md: 'Mối quan hệ này kéo dài bao nhiêu giờ, có vượt qua ranh giới ngày làm việc không (máy kế toán nói chuyện đều đặn lúc 3 giờ sáng là bất thường theo nghĩa có ý nghĩa), và **bao nhiêu máy khác trong tổ chức cũng nói chuyện với đích này**. Đặc trưng cuối là bộ lọc báo động giả mạnh nhất trong cả nhóm.',
            },
            {
              title: 'Chấm điểm và xếp hạng, không chặn',
              md: 'Kết quả nên là một bảng xếp hạng 20 mối quan hệ đáng ngờ nhất mỗi ngày để hunter xem, không phải một cảnh báo tự động chặn. Lý do nằm ở bước tiếp theo.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Thứ gì cũng beacon',
          md: 'Trước khi mừng vì bắt được C2, hãy nhìn danh sách những thứ beacon hoàn hảo trong mọi mạng doanh nghiệp: tác tử quản lý máy trạm gọi về máy chủ mỗi 5 phút, phần mềm chống virus kiểm tra cập nhật, hệ thống giám sát gửi nhịp tim, ứng dụng chat giữ kết nối, máy in kiểm tra hàng đợi, camera IP gửi trạng thái, đồng hồ NTP, và mọi thứ dùng cơ chế hỏi vòng.\n\nTrong một mạng 12.000 máy, một bộ phát hiện beaconing thô sẽ sinh ra **hàng nghìn** cặp mỗi ngày. Thứ cứu bạn không phải thuật toán mà là **danh sách cho phép theo đích đến đã được kiểm chứng** cộng với đặc trưng độ hiếm: nếu 11.400 máy cùng nói chuyện với đích đó theo cùng nhịp thì đó là phần mềm doanh nghiệp, không phải C2.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't6l5-cp1',
              kind: 'mcq',
              tags: ['nids', 'beaconing'],
              q: 'Kẻ tấn công đặt jitter 50% cho kênh C2. Hệ số biến thiên của khoảng cách thời gian tăng lên khoảng 0,19, trong khi duyệt web của người thường trên 1. Kết luận đúng?',
              options: [
                'Beaconing không còn phát hiện được nữa',
                'Vẫn phát hiện được, vì hành vi máy theo lịch có độ biến thiên thấp hơn hành vi người rất nhiều dù có jitter',
                'Phải chuyển sang phân tích nội dung gói tin',
                'Jitter làm hệ số biến thiên vượt 1 nên không phân biệt được',
              ],
              answer: 1,
              why: 'Jitter làm giảm sức phân biệt chứ không xoá bỏ nó. Với jitter 50%, thời gian ngủ vẫn nằm trong một khoảng hẹp và có cận trên rõ ràng, nên hệ số biến thiên vẫn thấp hơn hành vi người khoảng năm lần. Muốn thực sự trông giống người, kẻ tấn công phải dùng phân phối đuôi dài với khoảng nghỉ hàng giờ — và khi đó họ mất khả năng điều khiển tương tác, phải chờ rất lâu giữa hai lệnh. Nguyên tắc bạn nên mang theo: **đặc trưng tốt không phải đặc trưng không thể né, mà là đặc trưng mà việc né nó lấy đi năng lực của kẻ tấn công.**',
              distractorWhy: [
                'Sức phân biệt giảm nhưng vẫn còn rất lớn: 0,19 so với trên 1 là khoảng cách dễ tách.',
                '',
                'Nội dung đã mã hoá nên không đọc được, và cũng không cần — metadata nhịp là đủ.',
                'Ngược lại: jitter 50% cho hệ số biến thiên khoảng 0,19, thấp hơn nhiều so với 1.',
              ],
            },
            {
              id: 't6l5-cp2',
              kind: 'truefalse',
              tags: ['nids', 'bao-dong-gia'],
              q: 'Trong mạng doanh nghiệp, phần lớn các mối quan hệ có nhịp đều đặn là hoạt động độc hại.',
              answer: false,
              why: 'Hoàn toàn ngược lại. Nhịp đều là chân dung của **phần mềm**, và mạng doanh nghiệp đầy phần mềm hỏi vòng: tác tử quản lý, chống virus, giám sát, đồng bộ thời gian, camera, máy in. Tỉ lệ nền của C2 trong tập các mối quan hệ đều nhịp là cực kỳ thấp. Đây chính là nghịch lý tỉ lệ nền áp vào NIDS: đặc trưng có sức phân biệt thật, nhưng nếu bạn không thêm lớp lọc theo độ hiếm và danh sách đích đã kiểm chứng, precision vẫn ở mức không dùng được.',
            },
          ],
        },
        { t: 'h', text: 'Bước 3 — Đường hầm DNS', level: 2 },
        {
          t: 'p',
          md: 'DNS gần như luôn được cho phép đi ra, kể cả trong mạng bị hạn chế nghiêm ngặt. Các công cụ như **iodine** và **dnscat2** khai thác điều đó: mã hoá dữ liệu vào phần nhãn của tên miền truy vấn, và nhận dữ liệu về trong bản ghi TXT hoặc NULL. Thông lượng thấp — thường vài chục kilobit mỗi giây — nhưng đủ để điều khiển và đủ để rút dần một cơ sở dữ liệu qua nhiều ngày.',
        },
        {
          t: 'table',
          head: ['Đặc trưng (gom theo tên miền cha, cửa sổ 1 giờ)', 'Ngưỡng chỉ báo', 'Vì sao khó né'],
          rows: [
            ['Số nhãn con duy nhất', 'Hàng nghìn với một tên miền cha là bất thường mạnh', 'Mỗi gói dữ liệu cần một nhãn mới — đây là cơ chế cốt lõi'],
            ['Độ dài trung bình của nhãn con', 'Trên 50 ký tự đáng ngờ; giới hạn kỹ thuật là 63', 'Nhãn ngắn hơn thì thông lượng giảm tuyến tính'],
            ['Entropy của nhãn con', 'Cao vì dữ liệu đã mã hoá base32 hoặc base64', 'Có thể mã hoá thành từ tiếng Anh nhưng giảm thông lượng nhiều lần'],
            ['Tỉ lệ bản ghi TXT, NULL, CNAME trên tổng truy vấn', 'Cao bất thường so với nền A và AAAA', 'Cần loại bản ghi mang được nhiều dữ liệu'],
            ['Tỉ lệ dữ liệu đi lên so với đi xuống', 'Đảo ngược so với DNS bình thường', 'Hệ quả trực tiếp của việc dùng DNS làm kênh truyền'],
            ['Số máy trong tổ chức truy vấn tên miền cha đó', 'Thường là một', 'Muốn giả cần lây nhiễm thêm máy — chi phí cao'],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Gom ở đúng cấp là nửa lời giải',
          md: 'Một truy vấn DNS đơn lẻ tới `a7f3k9x2.tunnel.example.com` không nói lên điều gì đặc biệt. Nhưng khi bạn gom theo **tên miền cha** trong một cửa sổ một giờ và thấy 4.200 nhãn con duy nhất, độ dài trung bình 58 ký tự, 96% là bản ghi TXT, tất cả từ đúng một máy — thì bức tranh rõ như ban ngày.\n\nĐây là lần thứ ba trong chặng này bạn gặp cùng một mẹo: **đơn vị phân tích đúng gần như không bao giờ là sự kiện đơn lẻ.** Nếu một bài toán phát hiện đang cho precision thấp thảm hại, câu hỏi đầu tiên nên là "tôi có đang gom ở sai cấp không", trước cả câu hỏi về thuật toán.',
        },
        { t: 'h', text: 'Bước 4 — Lưu lượng mã hoá: chỉ còn metadata', level: 2 },
        {
          t: 'p',
          md: 'Với TLS 1.3 và các cơ chế che tên miền trong bắt tay, phần nội dung bạn đọc được ngày càng ít. Thứ còn lại vẫn dùng được: **dấu vân tay máy khách TLS**. JA3 (Salesforce, 2017) băm các trường trong bản tin ClientHello — phiên bản, danh sách bộ mã, phần mở rộng — thành một chuỗi định danh. JA4+ (FoxIO, 2023) là thế hệ sau, bền hơn trước việc xáo trộn thứ tự phần mở rộng và tách thành nhiều thành phần cho từng giao thức.',
        },
        {
          t: 'list',
          items: [
            '**Điểm mạnh:** một công cụ viết bằng Go dùng thư viện TLS của Go sẽ có vân tay khác hẳn Chrome. Nếu một máy trạm văn phòng đột nhiên tạo kết nối TLS với vân tay của thư viện Python `requests`, đó là tín hiệu đáng xem.',
            '**Điểm yếu 1:** vân tay xác định **thư viện**, không xác định ý định. Rất nhiều phần mềm hợp pháp cũng dùng Go và Python.',
            '**Điểm yếu 2:** kẻ tấn công có thể giả mạo vân tay để trông giống Chrome. Các thư viện làm việc này đã tồn tại và dễ dùng.',
            '**Dùng đúng cách:** coi vân tay TLS là một đặc trưng **độ hiếm** trong tổ chức của bạn, không phải danh sách chặn toàn cầu. Vân tay xuất hiện trên đúng một máy trong 12.000 máy là thông tin; vân tay nằm trong danh sách xấu công khai thì thường đã lỗi thời.',
            '**Bổ sung:** trường SNI, trạng thái xác thực chứng chỉ, tuổi chứng chỉ, và sự bất khớp giữa SNI với tên trong chứng chỉ.',
          ],
        },
        { t: 'figure', id: 'fig-data-sources', caption: 'Bản đồ nguồn dữ liệu mạng và bài toán mà mỗi nguồn phục vụ. Chú ý phần chồng lấn: cùng một cuộc tấn công thường để lại dấu ở ba nguồn khác nhau.' },
        { t: 'h', text: 'Bước 5 — Phân cụm để hiểu lưu lượng, không phải để phát hiện', level: 2 },
        {
          t: 'lab',
          id: 'lab-kmeans',
          intro: 'Phân cụm luồng mạng theo thời lượng, khối lượng và số gói. Chú ý điều xảy ra khi bạn không lấy log của các đặc trưng lệch — và điều xảy ra khi bạn đổi k.',
        },
        {
          t: 'p',
          md: 'Phân cụm hữu ích trong NIDS, nhưng không phải theo cách người ta hay quảng cáo. Nó **không** phát hiện tấn công. Nó làm ba việc khác, và cả ba đều có giá trị thật:',
        },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Hiểu lưu lượng của chính bạn.** Phân cụm vài triệu luồng cho ra 20–40 nhóm hành vi. Bạn nhìn vào và nhận ra: đây là sao lưu ban đêm, đây là đồng bộ thư mục, đây là luồng camera. Sau một buổi chiều bạn có bản đồ mạng của mình — thứ mà bốn năm làm việc không cho bạn.',
            '**Giảm khối lượng cho analyst.** Thay vì 30.000 cảnh báo, gom thành 60 cụm và cho analyst xem đại diện của mỗi cụm. Đây là ứng dụng có tỉ lệ lợi ích trên công sức cao nhất của phân cụm trong SOC.',
            '**Tạo đặc trưng cho mô hình khác.** Khoảng cách tới tâm cụm gần nhất, và mã cụm, đều là đặc trưng tốt để đưa vào một mô hình có giám sát ở tầng trên.',
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Ba lỗi kỹ thuật giết chết phân cụm luồng mạng',
          md: '**1. Không lấy log của đặc trưng lệch.** Số byte của một luồng trải từ 40 tới 4 tỉ. Không có `log1p` thì k-means chỉ nhìn thấy một chiều duy nhất là "luồng lớn hay nhỏ".\n\n**2. Không chuẩn hoá.** k-means dùng khoảng cách Euclid; nếu một đặc trưng tính bằng byte còn một đặc trưng tính bằng giây thì đặc trưng byte quyết định toàn bộ.\n\n**3. Cho rằng cụm nhỏ là cụm độc hại.** Cụm nhỏ nhất trong mạng của bạn nhiều khả năng là một máy chủ in cũ chạy giao thức lạ. Cụm nhỏ nghĩa là **hiếm**, và hiếm không đồng nghĩa với xấu — đây đúng là chủ đề của bài tiếp theo.',
        },
        { t: 'h', text: 'Bước 6 — Vì sao phát hiện bất thường trên mạng thất bại nhiều đến vậy', level: 2 },
        {
          t: 'p',
          md: 'Sommer và Paxson (2010) đã trả lời câu hỏi này rõ tới mức mười lăm năm sau vẫn chưa ai bác bỏ được. Bốn lý do, và cả bốn đều mang tính cấu trúc chứ không phải vấn đề kỹ thuật chờ được giải:',
        },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Không có "bình thường" ổn định.** Lưu lượng mạng biến động theo giờ, theo ngày, theo đợt triển khai phần mềm, theo một dự án mới của phòng marketing. Trong nhận diện chữ viết tay, chữ số 7 hôm nay giống chữ số 7 năm ngoái. Trong mạng, không có bất biến nào tương tự.',
            '**Khoảng cách ngữ nghĩa.** Mô hình nói "cái này lạ". Analyst cần biết "cái này nguy hiểm và tôi phải làm gì". Chuyển từ vế đầu sang vế sau đòi hỏi ngữ cảnh mà mô hình không có, và đó là công việc thủ công tốn 20–40 phút mỗi cảnh báo.',
            '**Chi phí sai cực kỳ bất đối xứng.** Với hàng chục triệu luồng mỗi ngày, tỉ lệ báo động giả 0,01% vẫn là hàng nghìn cảnh báo. Nghịch lý tỉ lệ nền không tha cho ai.',
            '**Khó đánh giá.** Bạn không có nhãn. Các bộ dữ liệu công khai thì mang vấn đề riêng: NSL-KDD đã quá cũ so với giao thức hiện đại, còn CIC-IDS2017 được Engelen và cộng sự (2021) chỉ ra hàng loạt lỗi trong quá trình sinh dữ liệu và gán nhãn. Huấn luyện trên dữ liệu sai rồi báo cáo 99,9% là chuyện xảy ra thường xuyên trong các bài báo.',
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Kết luận thực dụng, không bi quan',
          md: 'Bốn lý do trên không nói "đừng dùng ML trong NIDS". Chúng nói **hãy dùng nó cho bài toán hẹp và có cấu trúc**, không cho bài toán "tìm mọi thứ bất thường".\n\nCác bài toán hẹp hoạt động tốt trong thực tế: phát hiện beaconing, phát hiện đường hầm DNS, phát hiện quét cổng nội bộ, phát hiện truyền dữ liệu ra ngoài với khối lượng lệch, xếp hạng cảnh báo Suricata theo khả năng là thật. Mỗi bài trong số đó có định nghĩa rõ về cái cần tìm, có đặc trưng gắn với cơ chế bắt buộc của kẻ tấn công, và có đơn vị phân tích đúng.\n\nBài toán rộng "học thế nào là bình thường rồi báo cái khác thường" là bài toán đã thất bại nhiều lần nhất trong lịch sử ngành này.',
        },
        { t: 'h', text: 'Bước 7 — Kẻ tấn công né thế nào', level: 2 },
        {
          t: 'table',
          head: ['Kỹ thuật né', 'Chống lại đặc trưng nào', 'Đối sách còn lại'],
          rows: [
            ['Tăng sleep lên nhiều giờ, jitter lớn', 'Đặc trưng nhịp', 'Mở rộng cửa sổ phân tích lên nhiều ngày; kẻ tấn công mất khả năng điều khiển tương tác'],
            ['Đi qua CDN lớn hoặc dịch vụ đám mây phổ biến (domain fronting và biến thể)', 'Danh tiếng đích đến', 'Độ hiếm của cặp máy-đích trong tổ chức; vân tay TLS; kích thước và nhịp vẫn còn'],
            ['Giả mạo vân tay TLS cho giống trình duyệt', 'JA3 và JA4', 'Sự bất khớp giữa vân tay trình duyệt và tiến trình thật (cần dữ liệu từ máy trạm)'],
            ['Chèn dữ liệu vào lưu lượng hợp pháp, thay đổi kích thước gói ngẫu nhiên', 'Đặc trưng khối lượng', 'Đặc trưng độ bền và quan hệ; tương quan với sự kiện trên máy trạm'],
            ['Dùng DoH tới máy phân giải công cộng, hoặc kênh trên dịch vụ hợp pháp', 'Toàn bộ tầm nhìn DNS', 'Vấn đề kiến trúc: chính sách mạng chặn DoH, ép dùng máy phân giải nội bộ'],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Điều mà mọi đội NIDS trưởng thành đều làm',
          md: 'Không ai chỉ nhìn mạng. Tín hiệu mạnh nhất luôn đến từ việc **ghép lưu lượng mạng với sự kiện trên máy trạm**: kết nối ra ngoài này do tiến trình nào tạo ra? Tiến trình đó có tiến trình cha là gì? Nó vừa được ghi ra đĩa cách đây 4 phút phải không?\n\nMột kết nối HTTPS đều nhịp tới một địa chỉ đám mây là tín hiệu yếu. Cũng kết nối đó, nhưng do `rundll32.exe` khởi tạo, với tiến trình cha là `winword.exe`, thì gần như không cần mô hình nào nữa. Đây là lý do EDR và NIDS được ghép lại trong các nền tảng XDR — và là lý do bạn nên đầu tư vào việc nối dữ liệu trước khi đầu tư vào mô hình phức tạp hơn.',
        },
        { t: 'terms', ids: ['zeek', 'beaconing', 'c2', 'bat-thuong', 'siem'] },
      ],
      keyTakeaways: [
        'Bắt đầu từ log Zeek, không từ gói tin thô; Zeek đã làm phần khó nhất và làm tốt hơn thứ bạn tự viết.',
        'Hệ số biến thiên của khoảng cách thời gian là đặc trưng cốt lõi của beaconing — nó hoạt động trên lưu lượng mã hoá vì chỉ dùng metadata.',
        'Jitter làm giảm sức phân biệt nhưng không xoá nó; đặc trưng tốt là đặc trưng mà việc né nó lấy đi năng lực của kẻ tấn công.',
        'Trong mạng doanh nghiệp, tuyệt đại đa số quan hệ đều nhịp là phần mềm hợp pháp — phải kết hợp độ hiếm và danh sách đích đã kiểm chứng.',
        'Đường hầm DNS phải phát hiện ở cấp tên miền cha trong cửa sổ thời gian, không ở cấp từng truy vấn.',
        'Phân cụm không phát hiện tấn công; nó dùng để hiểu lưu lượng, gom cảnh báo và sinh đặc trưng cho mô hình khác.',
        'Bốn lý do cấu trúc khiến anomaly detection trên mạng thất bại: không có bình thường ổn định, khoảng cách ngữ nghĩa, chi phí sai bất đối xứng, và khó đánh giá.',
        'Tín hiệu mạnh nhất đến từ việc ghép luồng mạng với tiến trình trên máy trạm — hãy đầu tư vào nối dữ liệu trước khi đầu tư vào mô hình.',
      ],
      cards: [
        {
          id: 't6l5-c1',
          front: 'Hệ số biến thiên của khoảng cách thời gian phát hiện được gì, và vì sao nó hoạt động trên lưu lượng mã hoá?',
          back: 'Phát hiện beaconing của kênh C2. Nó chỉ dùng mốc thời gian kết nối — metadata — nên mã hoá nội dung không ảnh hưởng. Máy nói chuyện theo lịch có hệ số gần 0, hành vi người thường trên 1.',
          tags: ['nids', 'beaconing'],
        },
        {
          id: 't6l5-c2',
          front: 'Vì sao bộ phát hiện beaconing thô tạo ra hàng nghìn báo động giả mỗi ngày?',
          back: 'Vì mạng doanh nghiệp đầy phần mềm hỏi vòng đều nhịp: tác tử quản lý, chống virus, giám sát, NTP, camera, máy in. Cần thêm đặc trưng độ hiếm và danh sách đích đã kiểm chứng.',
          tags: ['nids', 'bao-dong-gia'],
        },
        {
          id: 't6l5-c3',
          front: 'Đơn vị phân tích đúng để phát hiện đường hầm DNS là gì?',
          back: 'Tên miền cha (eTLD+1) gom trong một cửa sổ thời gian, không phải từng truy vấn. Khi đó số nhãn con duy nhất, độ dài trung bình và tỉ lệ bản ghi TXT mới lộ ra.',
          tags: ['nids', 'dns-tunneling'],
        },
        {
          id: 't6l5-c4',
          front: 'Nêu ba việc phân cụm luồng mạng làm tốt — và một việc nó KHÔNG làm được.',
          back: 'Làm tốt: hiểu bản đồ lưu lượng của tổ chức, gom cảnh báo để giảm khối lượng cho analyst, sinh đặc trưng cho mô hình có giám sát. Không làm được: phát hiện tấn công, vì cụm nhỏ nghĩa là hiếm chứ không phải xấu.',
          tags: ['nids', 'phan-cum'],
        },
        {
          id: 't6l5-c5',
          front: 'Bốn lý do cấu trúc khiến phát hiện bất thường trên mạng thất bại (Sommer & Paxson)?',
          back: '1) Không có bình thường ổn định. 2) Khoảng cách ngữ nghĩa giữa "lạ" và "nguy hiểm". 3) Chi phí sai cực kỳ bất đối xứng ở lưu lượng lớn. 4) Không có nhãn nên rất khó đánh giá.',
          tags: ['nids', 'bat-thuong'],
        },
      ],
      quiz: [
        {
          id: 't6l5-q1',
          kind: 'mcq',
          tags: ['nids', 'beaconing'],
          q: 'Bạn tìm ra 2.100 cặp máy-đích có nhịp rất đều trong ngày. Bước tiếp theo hiệu quả nhất để đưa con số đó về mức xem được?',
          options: [
            'Tăng ngưỡng hệ số biến thiên lên cho chặt hơn',
            'Xếp hạng theo độ hiếm: ưu tiên đích chỉ được rất ít máy trong tổ chức liên hệ',
            'Chuyển sang mô hình deep learning trên chuỗi thời gian',
            'Chỉ xét các kết nối ngoài giờ hành chính',
          ],
          answer: 1,
          why: 'Siết ngưỡng sẽ loại bỏ chính các beacon có jitter — tức là loại đúng những kẻ tấn công có kỹ năng, giữ lại phần mềm doanh nghiệp có nhịp hoàn hảo. Đó là siết nhầm chiều. Đặc trưng độ hiếm thì cắt theo đúng trục phân biệt: tác tử quản lý nói chuyện với máy chủ của nó từ 11.400 máy, còn C2 thì thường chỉ có một hoặc vài máy. Lọc theo ngoài giờ cũng có ích nhưng yếu hơn nhiều và bỏ sót tấn công diễn ra ban ngày. Mô hình phức tạp hơn không giải quyết được vấn đề vì vấn đề nằm ở tỉ lệ nền, không ở sức mạnh mô hình.',
          distractorWhy: [
            'Siết ngưỡng loại bỏ beacon có jitter trước, tức là loại đúng kẻ tấn công có kỹ năng.',
            '',
            'Vấn đề là tỉ lệ nền và thiếu ngữ cảnh, không phải năng lực mô hình.',
            'Có ích nhưng yếu, và bỏ sót hoàn toàn hoạt động ban ngày.',
          ],
        },
        {
          id: 't6l5-q2',
          kind: 'multi',
          tags: ['nids', 'dns-tunneling'],
          q: 'Đặc trưng nào chỉ ra khả năng có đường hầm DNS? (Chọn tất cả đáp án đúng)',
          options: [
            'Hơn 4.000 nhãn con duy nhất dưới cùng một tên miền cha trong một giờ',
            'Độ dài trung bình của nhãn con vượt 50 ký tự',
            'Tỉ lệ bản ghi TXT chiếm phần lớn truy vấn tới tên miền đó',
            'Tên miền cha nằm trong danh sách 1.000 tên miền phổ biến nhất',
          ],
          answers: [0, 1, 2],
          why: 'Ba đặc trưng đầu đều là hệ quả trực tiếp của cơ chế: dữ liệu phải được mã hoá vào nhãn con nên cần rất nhiều nhãn duy nhất và nhãn phải dài, còn dữ liệu trả về cần loại bản ghi mang được nhiều byte như TXT hoặc NULL. Nằm trong danh sách phổ biến thì ngược lại — đó là bằng chứng làm giảm nghi ngờ. Điểm đáng nhớ: khi các đặc trưng của bạn là **hệ quả bắt buộc của cơ chế tấn công**, kẻ tấn công chỉ né được bằng cách hy sinh năng lực, ở đây là thông lượng của kênh.',
        },
        {
          id: 't6l5-q3',
          kind: 'order',
          tags: ['nids', 'quy-trinh'],
          q: 'Sắp xếp các bước xây bộ phát hiện beaconing từ log Zeek.',
          items: [
            'Gom conn.log theo cặp máy nguồn và đích trong cửa sổ 24 giờ',
            'Loại các cặp có dưới 20 kết nối vì không đủ dữ liệu để nói về nhịp',
            'Tính hệ số biến thiên của khoảng cách thời gian và của kích thước dữ liệu',
            'Thêm đặc trưng độ hiếm: bao nhiêu máy khác cũng liên hệ đích này',
            'Xếp hạng 20 cặp đáng ngờ nhất mỗi ngày cho hunter xem',
            'Ghép với dữ liệu tiến trình trên máy trạm để có kết luận',
          ],
          why: 'Thứ tự này phản ánh nguyên tắc chung của kỹ thuật phát hiện: chọn đúng đơn vị phân tích trước, lọc nhiễu thống kê, rồi mới tính đặc trưng, rồi mới thêm ngữ cảnh tổ chức, rồi mới xếp hạng, và cuối cùng ghép nguồn dữ liệu khác để chuyển từ tín hiệu sang kết luận. Đảo thứ tự hai bước đầu là lỗi hay gặp: tính hệ số biến thiên trên một cặp chỉ có 3 kết nối cho ra con số vô nghĩa nhưng trông rất thuyết phục.',
        },
        {
          id: 't6l5-q4',
          kind: 'truefalse',
          tags: ['nids', 'phan-cum'],
          q: 'Trong phân cụm luồng mạng, cụm nhỏ nhất là nơi đáng nghi nhất nên cần điều tra trước.',
          answer: false,
          why: 'Cụm nhỏ chỉ có nghĩa là **hiếm**. Trong một mạng thật, các cụm nhỏ nhất thường là: một máy chủ in cũ chạy giao thức lạ, một thiết bị công nghiệp, một máy chủ thử nghiệm của phòng phát triển, một hệ thống của nhà thầu. Đi theo thứ tự kích thước cụm là cách chắc chắn để tiêu hết thời gian của analyst vào các thiết bị vô hại và tạo ra sự chán nản với công cụ. Cách dùng đúng: dùng cụm để **mô tả** mạng và để gom cảnh báo, còn việc quyết định cái gì đáng điều tra thì dựa trên tín hiệu gắn với cơ chế tấn công.',
        },
        {
          id: 't6l5-q5',
          kind: 'mcq',
          tags: ['nids', 'kien-truc'],
          q: 'Vai trò đúng của Suricata và của mô hình ML trong cùng một kiến trúc NIDS là gì?',
          options: [
            'Mô hình ML thay thế dần các luật Suricata để giảm chi phí bảo trì',
            'Suricata bắt cái đã biết với chi phí gần bằng 0; ML phủ phần hành vi mà chữ ký không với tới, đặc biệt trên lưu lượng mã hoá',
            'Suricata dùng cho lưu lượng nội bộ còn ML dùng cho lưu lượng ra Internet',
            'Cả hai làm cùng một việc nên chỉ cần chọn một để đơn giản hệ thống',
          ],
          answer: 1,
          why: 'Đây là nguyên tắc xếp tầng đã gặp từ chặng 0, giờ có bối cảnh cụ thể. Một luật Suricata cho một CVE đã công bố là chính xác, giải thích được, và tốn gần như không gì để chạy — không mô hình nào cạnh tranh được ở đó. Nhưng chữ ký mù trước lưu lượng mã hoá, trước công cụ tuỳ biến, và trước hành vi trải dài theo thời gian như beaconing. Đó chính là khoảng trống mà đặc trưng metadata và mô hình lấp vào. Việc chia theo hướng lưu lượng thì không liên quan tới điểm mạnh của từng công nghệ.',
          distractorWhy: [
            'Chữ ký vẫn là cách rẻ nhất và chắc chắn nhất cho phần đã biết; thay thế chúng là tự làm khó mình.',
            '',
            'Hướng lưu lượng không phải tiêu chí phân vai; cả hai công nghệ đều dùng được ở mọi hướng.',
            'Chúng phủ hai tập mối đe doạ khác nhau, không thay thế nhau.',
          ],
        },
      ],
      terms: ['zeek', 'beaconing', 'c2', 'bat-thuong', 'siem'],
      further: [
        {
          title: 'Outside the Closed World — Sommer & Paxson (2010)',
          note: 'Đã nhắc ở chặng 0; giờ đọc lại với đủ nền tảng, bạn sẽ thấy từng lập luận ứng với một quyết định thiết kế cụ thể trong bài này.',
        },
        {
          title: 'Troubleshooting an Intrusion Detection Dataset: the CICIDS2017 Case Study — Engelen và cộng sự (2021)',
          note: 'Mổ xẻ các lỗi sinh dữ liệu và gán nhãn trong một bộ dữ liệu được trích dẫn hàng nghìn lần. Đọc để hết tin vào con số 99,9% trong các bài báo NIDS.',
        },
        {
          title: 'Zeek — tài liệu về các log mặc định',
          note: 'Đọc mô tả trường của conn.log, dns.log, ssl.log một lượt. Phần lớn ý tưởng đặc trưng trong NIDS đến từ việc biết rõ mình đang có sẵn những trường nào.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't6-l6',
      trackId: 'ung-dung',
      title: 'Phát hiện bất thường: Isolation Forest, LOF, autoencoder',
      subtitle: 'Ba thuật toán, ba giả định khác nhau — và một sự thật khó chịu: bất thường không phải độc hại',
      minutes: 26,
      practiceMinutes: 7,
      level: 'nang-cao',
      prereqs: ['t6-l5'],
      why: {
        short:
          'Phần lớn dữ liệu bảo mật không có nhãn, nên phát hiện bất thường là công cụ duy nhất khả dụng — nhưng nó cũng là công cụ bị dùng sai nhiều nhất, và biết khi nào KHÔNG dùng nó quan trọng ngang biết cách dùng.',
        scenario:
          'Bạn có 18 tháng log đăng nhập của 12.000 tài khoản và đúng 0 nhãn. Ban lãnh đạo muốn "phát hiện hành vi bất thường". Bạn phải chọn thuật toán, chọn ngân sách cảnh báo, và quan trọng nhất là đặt kỳ vọng đúng trước khi ai đó tưởng rằng mọi cảnh báo đều là kẻ tấn công.',
        roles: ['Security Data Scientist', 'Detection Engineer', 'Threat Hunter', 'ML Engineer'],
        costOfNotKnowing:
          'Bạn bật Isolation Forest với contamination mặc định 0,1 trên 4 triệu bản ghi, tạo 4.000 cảnh báo mỗi ngày, đội SOC tắt nó sau hai tuần, và sáu tháng sau không ai trong công ty còn tin vào từ "bất thường" nữa.',
      },
      objectives: [
        'Giải thích được cơ chế của Isolation Forest, LOF và autoencoder bằng ngôn ngữ hình học, không bằng công thức',
        'Chọn được thuật toán phù hợp theo số chiều, kích thước dữ liệu và loại bất thường cần tìm',
        'Đánh giá được một mô hình bất thường khi hoàn toàn không có nhãn',
        'Nêu được năm nguyên nhân lành tính phổ biến của bất thường trong dữ liệu bảo mật',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Lúc 2 giờ 14 phút sáng thứ Bảy, một máy chủ trong mạng của bạn truyền 43 GB ra một địa chỉ bên ngoài. Đây là bất thường rõ ràng theo mọi thước đo thống kê. Theo bạn, xác suất nó là một cuộc tấn công là bao nhiêu, và bạn kiểm tra bằng gì trước tiên?',
          reveal:
            'Thấp. Thấp hơn nhiều so với cảm giác của bạn khi nhìn con số 43 GB lúc 2 giờ sáng.\n\nDanh sách những thứ tạo ra đúng chân dung đó trong một tổ chức bình thường: sao lưu ra kho lưu trữ đám mây, đồng bộ dữ liệu giữa hai trung tâm dữ liệu, tải bản cập nhật lớn, đồng bộ kho chứa ảnh container, một kỹ sư dữ liệu đẩy tập dữ liệu lên nền tảng phân tích, một công việc nhập liệu chạy hằng tuần vào đúng đêm thứ Bảy vì đó là lúc rảnh tài nguyên.\n\nKiểm tra đầu tiên không phải là chạy mô hình phức tạp hơn. Nó là hai câu hỏi: **chuyện này có xảy ra vào cùng giờ đó tuần trước không?** và **đích đến là ai?** Nếu câu trả lời là "có, mọi thứ Bảy suốt hai năm" và "kho lưu trữ của chính chúng ta", bạn vừa phát hiện ra công việc sao lưu.\n\nĐây là câu quan trọng nhất của cả bài, và nó đáng được viết ra rõ ràng: **bất thường không phải độc hại.** Phát hiện bất thường trả lời câu hỏi "cái này có hiếm không", không trả lời câu hỏi "cái này có nguy hiểm không". Khoảng cách giữa hai câu hỏi đó chính là công việc của analyst, và mọi thiết kế hệ thống phải tính tới nó.',
        },
        { t: 'h', text: 'Ba thuật toán, ba định nghĩa khác nhau về "bất thường"', level: 2 },
        {
          t: 'steps',
          title: 'Hiểu bằng hình học trước, công thức sau',
          steps: [
            {
              title: 'Isolation Forest — cái gì dễ tách ra thì bất thường',
              md: 'Chọn ngẫu nhiên một đặc trưng, chọn ngẫu nhiên một điểm cắt, chia dữ liệu làm đôi. Lặp lại cho tới khi mỗi điểm bị cô lập một mình. Điểm nằm ở rìa bị cô lập sau rất ít lần cắt; điểm nằm giữa đám đông cần rất nhiều lần cắt.\n\nĐiểm số chính là **độ sâu trung bình** để cô lập một điểm, qua nhiều cây ngẫu nhiên. Cực nhanh — độ phức tạp gần tuyến tính — không cần tính khoảng cách, và **không cần chuẩn hoá đặc trưng** vì mỗi lần cắt chỉ nhìn một đặc trưng.\n\n**Yếu ở:** bất thường cục bộ. Một điểm nằm trong vùng dày đặc chung nhưng lệch khỏi cụm nhỏ của riêng nó thì Isolation Forest không thấy.',
            },
            {
              title: 'Local Outlier Factor — cái gì thưa hơn hàng xóm thì bất thường',
              md: 'Với mỗi điểm, so mật độ cục bộ của nó với mật độ cục bộ của k láng giềng gần nhất. Tỉ số lớn hơn 1 nhiều nghĩa là điểm này sống ở vùng thưa hơn hẳn so với những kẻ xung quanh.\n\n**Mạnh ở:** phát hiện bất thường **cục bộ**. Ví dụ bảo mật rất rõ: một quản trị viên đăng nhập lúc 2 giờ sáng thì bình thường trong cụm quản trị viên; một nhân viên kế toán đăng nhập lúc 2 giờ sáng thì bất thường ngay trong cụm kế toán — dù xét toàn cục thì cả hai giống nhau.\n\n**Yếu ở:** chi phí tính toán tăng theo bình phương số mẫu, phải chuẩn hoá đặc trưng vì nó dựa trên khoảng cách, và bản gốc không chấm điểm được cho dữ liệu mới (trong scikit-learn phải đặt `novelty=True` mới có `predict`).',
            },
            {
              title: 'Autoencoder — cái gì tôi không tái tạo được thì bất thường',
              md: 'Một mạng nơ-ron học nén dữ liệu xuống một biểu diễn nhỏ rồi bung ra lại. Vì lớp giữa hẹp, nó buộc phải học các quy luật phổ biến nhất của dữ liệu. Khi gặp một mẫu không tuân theo quy luật đó, nó tái tạo sai — và **sai số tái tạo** chính là điểm bất thường.\n\n**Mạnh ở:** dữ liệu nhiều chiều có cấu trúc phi tuyến, và cho bạn thêm một món quà: nhìn vào **đặc trưng nào bị tái tạo sai nhiều nhất** để biết cái gì lạ, tức là có một dạng giải thích thô sơ.\n\n**Yếu ở:** cần lượng dữ liệu lớn, cần dữ liệu huấn luyện tương đối sạch, cần chuẩn hoá, và có một cái bẫy chết người ở phần dưới.',
            },
          ],
        },
        { t: 'figure', id: 'fig-autoencoder', caption: 'Autoencoder ép dữ liệu qua một nút thắt cổ chai. Mẫu bình thường đi qua và trở lại gần như nguyên vẹn; mẫu lạ bị méo — độ méo đó là điểm bất thường.' },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Hai cái bẫy của autoencoder mà ai cũng mắc một lần',
          md: '**Bẫy 1 — nút thắt quá rộng.** Nếu lớp giữa đủ lớn, mạng học được hàm đồng nhất: nó chỉ sao chép đầu vào sang đầu ra, tái tạo mọi thứ hoàn hảo, kể cả mẫu tấn công. Sai số tái tạo của mọi mẫu đều gần 0 và mô hình vô dụng. Kiểm tra: nếu sai số của mẫu bất thường bạn cố tình chèn vào cũng thấp như mẫu bình thường, nút thắt của bạn quá rộng.\n\n**Bẫy 2 — dữ liệu huấn luyện đã chứa tấn công.** Autoencoder giả định bạn huấn luyện trên dữ liệu bình thường. Nhưng trong bảo mật, log "bình thường" của năm ngoái hoàn toàn có thể chứa một cuộc xâm nhập chưa bị phát hiện — thời gian phát hiện trung bình được tính bằng tuần tới tháng. Khi đó autoencoder học tái tạo tốt luôn hành vi của kẻ tấn công và mù vĩnh viễn với đúng thứ bạn cần tìm. Đây là lý do sạch sẽ nhất để hiểu vì sao **chất lượng dữ liệu quyết định nhiều hơn lựa chọn kiến trúc.**',
        },
        {
          t: 'table',
          head: ['Tiêu chí', 'Isolation Forest', 'LOF', 'Autoencoder'],
          rows: [
            ['Định nghĩa bất thường', 'Dễ cô lập bằng các nhát cắt ngẫu nhiên', 'Mật độ thấp hơn láng giềng', 'Khó tái tạo qua nút thắt'],
            ['Cần chuẩn hoá đặc trưng', 'Không', 'Có, bắt buộc', 'Có, bắt buộc'],
            ['Chi phí trên 1 triệu mẫu', 'Vài giây', 'Rất cao, thường không khả thi', 'Vài phút trên GPU'],
            ['Chấm điểm mẫu mới', 'Có, tức thì', 'Chỉ khi đặt novelty=True', 'Có, tức thì'],
            ['Bắt bất thường cục bộ', 'Kém', 'Tốt nhất', 'Trung bình'],
            ['Chịu được nhiều chiều', 'Khá', 'Kém — khoảng cách mất ý nghĩa', 'Tốt nếu có đủ dữ liệu'],
            ['Đặc trưng phân loại (categorical)', 'Chấp nhận được sau mã hoá', 'Kém', 'Kém với one-hot thưa'],
            ['Giải thích cho analyst', 'Trung bình (qua độ sâu và SHAP)', 'Kém', 'Khá — xem đặc trưng nào sai nhiều nhất'],
            ['Lựa chọn mặc định nên thử trước', 'Có', 'Chỉ khi cần bất thường cục bộ', 'Chỉ khi nhiều chiều và nhiều dữ liệu'],
          ],
        },
        {
          t: 'lab',
          id: 'lab-anomaly',
          intro: 'Chạy cả ba thuật toán trên cùng một tập log đăng nhập. Đổi contamination và xem số cảnh báo thay đổi ra sao; thử tắt chuẩn hoá và xem LOF sụp thế nào.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't6l6-cp1',
              kind: 'mcq',
              tags: ['bat-thuong', 'isolation-forest'],
              q: 'Tham số `contamination` của Isolation Forest thực sự là gì?',
              options: [
                'Tỉ lệ tấn công thật trong dữ liệu, ước lượng từ lịch sử',
                'Tỉ lệ mẫu mà bạn quyết định sẽ gắn nhãn bất thường — tức là ngân sách cảnh báo của bạn',
                'Mức nhiễu trong dữ liệu huấn luyện',
                'Ngưỡng độ sâu tối đa của cây',
              ],
              answer: 1,
              why: 'Đây là hiểu nhầm phổ biến nhất về phát hiện bất thường. `contamination` không phải một sự thật về dữ liệu; nó chỉ đơn giản là chỗ bạn cắt trên phân phối điểm số. Đặt 0,1 nghĩa là "hãy gắn nhãn bất thường cho 10% mẫu có điểm cao nhất" — với 4 triệu bản ghi thì đó là 400.000 cảnh báo. Cách dùng đúng: tính ngược từ **năng lực xử lý của đội** (ví dụ 40 cảnh báo/ngày), quy ra tỉ lệ, rồi đặt contamination bằng con số đó. Ngân sách quyết định ngưỡng, không phải mô hình quyết định ngân sách.',
              distractorWhy: [
                'Bạn hầu như không bao giờ biết tỉ lệ tấn công thật; nếu biết thì đã có nhãn và không cần học không giám sát.',
                '',
                'Nó không mô hình hoá nhiễu, nó chỉ là điểm cắt trên phân phối điểm số đầu ra.',
                'Độ sâu cây do max_samples và cấu trúc dữ liệu quyết định, không phải tham số này.',
              ],
            },
            {
              id: 't6l6-cp2',
              kind: 'truefalse',
              tags: ['bat-thuong', 'autoencoder'],
              q: 'Autoencoder có sai số tái tạo rất thấp trên toàn bộ dữ liệu, kể cả mẫu tấn công chèn thử, là dấu hiệu mô hình đã học tốt.',
              answer: false,
              why: 'Đó là dấu hiệu mô hình đã học **hàm đồng nhất**: nút thắt quá rộng nên nó chỉ sao chép đầu vào sang đầu ra thay vì học cấu trúc. Một autoencoder hữu ích phải tái tạo tốt cái phổ biến và **tệ rõ rệt** với cái hiếm — chính khoảng cách đó tạo ra sức phân biệt. Cách chữa: thu hẹp lớp giữa, thêm ràng buộc thưa, thêm nhiễu vào đầu vào (denoising autoencoder), hoặc giảm số tham số. Cách kiểm tra nhanh: luôn giữ một tập nhỏ mẫu bất thường đã biết để đo, dù chỉ là mẫu bạn tự tạo.',
            },
          ],
        },
        { t: 'h', text: 'Đánh giá khi không có một nhãn nào', level: 2 },
        {
          t: 'p',
          md: 'Đây là phần khó nhất và cũng là phần bị bỏ qua nhiều nhất. Không có nhãn thì không có precision, không có recall, không có PR-AUC. Bốn cách dưới đây là những gì thực sự dùng được trong tổ chức thật.',
        },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Precision ở top-k do người xác nhận.** Lấy 50 mẫu điểm cao nhất, cho analyst xem và phân loại thành ba nhóm: đáng điều tra, giải thích được nhưng vô hại, rác. Con số bạn báo cáo là tỉ lệ nhóm một. Đây là chỉ số duy nhất mà người ra quyết định thực sự quan tâm, và nó cũng sinh ra nhãn cho tương lai.',
            '**Chèn tấn công có kiểm soát.** Phối hợp với đội đỏ hoặc tự mô phỏng: thực hiện 20 hành vi tấn công đã biết trong môi trường thật, đánh dấu thời điểm, rồi kiểm tra bao nhiêu cái lọt vào top-k. Đây là cách gần nhất với đo recall mà bạn có được.',
            '**Độ ổn định theo thời gian.** Chạy mô hình trên tuần này và tuần trước. Nếu tập cảnh báo thay đổi gần như hoàn toàn mỗi tuần, mô hình đang bám vào nhiễu chứ không bám vào cấu trúc. Đây là kiểm tra rẻ nhất và phát hiện được rất nhiều mô hình vô dụng.',
            '**So với đường cơ sở ngu ngốc.** Ba đường cơ sở bắt buộc phải vượt qua: xếp hạng theo một đặc trưng duy nhất mạnh nhất (ví dụ tổng byte), xếp hạng theo độ hiếm đơn giản (giá trị này xuất hiện bao nhiêu lần trong 30 ngày), và chọn ngẫu nhiên. Nếu Isolation Forest không thắng nổi "xếp theo độ hiếm", hãy dùng độ hiếm — nó rẻ hơn, giải thích được, và không ai phải bảo trì một mô hình.',
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Đường cơ sở đếm tần suất mạnh đến mức đáng ngạc nhiên',
          md: 'Trong rất nhiều bài toán bảo mật, một bảng đếm đơn giản đánh bại thuật toán bất thường phức tạp: **cặp tiến trình cha-con này xuất hiện trên bao nhiêu máy trong 30 ngày qua?** Kết quả là 1 trên 12.000 máy thì đáng xem; kết quả 11.400 thì bỏ qua.\n\nKỹ thuật này được các đội threat hunting gọi là **stack counting** hay phân tích đuôi dài, và nó có ba lợi thế mà không mô hình nào có: analyst hiểu ngay tại sao một mục xuất hiện, bạn giải thích được cho quản lý trong một câu, và nó không bao giờ cần huấn luyện lại.\n\nHãy luôn xây nó trước. Nếu mô hình của bạn không vượt được nó, bạn vừa tiết kiệm được sáu tháng.',
        },
        { t: 'figure', id: 'fig-dimensionality', caption: 'Càng nhiều chiều, khoảng cách giữa mọi cặp điểm càng trở nên giống nhau — đó là lý do LOF và k-NN xuống cấp nhanh còn Isolation Forest chịu được lâu hơn.' },
        { t: 'h', text: 'Bất thường không phải độc hại: năm nguyên nhân lành tính', level: 2 },
        {
          t: 'table',
          head: ['Nguyên nhân lành tính', 'Trông giống tấn công gì', 'Cách phân biệt'],
          rows: [
            ['Nhân viên mới hoặc đổi vị trí', 'Truy cập hàng loạt tài nguyên chưa từng chạm', 'Đối chiếu với dữ liệu nhân sự: ngày vào làm, ngày đổi phòng ban'],
            ['Triển khai hoặc nâng cấp phần mềm', 'Tiến trình mới, kết nối mới, template log mới hàng loạt', 'Đối chiếu với lịch thay đổi và bản ghi CI/CD'],
            ['Công việc theo lịch hiếm gặp', 'Truyền khối lượng lớn lúc 2 giờ sáng', 'Kiểm tra tính lặp lại theo chu kỳ tuần hoặc tháng'],
            ['Chính công cụ bảo mật của bạn', 'Quét toàn mạng, đọc tệp hàng loạt, đăng nhập nhiều máy', 'Danh sách tài khoản dịch vụ và máy quét, luôn duy trì cập nhật'],
            ['Sự kiện tổ chức', 'Đăng nhập ồ ạt từ vị trí lạ, giờ lạ', 'Lịch công tác, sự kiện, kỳ nghỉ, đợt làm việc từ xa'],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Khi nào KHÔNG nên dùng phát hiện bất thường',
          md: 'Ba trường hợp rõ ràng:\n\n**1. Khi bạn có nhãn.** Dù chỉ 500 nhãn dương, một mô hình có giám sát gần như luôn thắng một mô hình bất thường, vì nó học được cái bạn thực sự quan tâm chứ không phải cái hiếm.\n\n**2. Khi cái bạn tìm không hiếm.** Credential stuffing tạo ra hàng chục nghìn lần thử; nó là số đông trong lưu lượng đăng nhập chứ không phải ngoại lệ. Phát hiện bất thường sẽ coi nó là bình thường.\n\n**3. Khi hậu quả của cảnh báo là hành động tự động.** Bất thường không đủ cơ sở để khoá tài khoản hay chặn máy. Đầu ra của nó nên là một hàng đợi điều tra được xếp hạng, chứ không phải một cái công tắc.\n\nChỗ nó thực sự toả sáng: **giai đoạn đầu khi chưa có nhãn nào**, dùng để sinh ra nhãn đầu tiên, để rồi được thay thế dần bằng mô hình có giám sát. Hãy coi nó là giàn giáo, không phải toà nhà.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Ba thuật toán trên cùng dữ liệu, kèm đường cơ sở đếm tần suất',
          code:
            "import numpy as np, pandas as pd\n" +
            "from sklearn.ensemble import IsolationForest\n" +
            "from sklearn.neighbors import LocalOutlierFactor\n" +
            "from sklearn.preprocessing import StandardScaler\n" +
            "\n" +
            "# Ngan sach: 40 canh bao/ngay tren 200.000 ban ghi -> ti le 0,0002\n" +
            "NGAN_SACH = 40 / 200_000\n" +
            "\n" +
            "# Isolation Forest: khong can chuan hoa, chay tren toan bo du lieu\n" +
            "iso = IsolationForest(n_estimators=200, max_samples=256,\n" +
            "                      contamination=NGAN_SACH, random_state=42)\n" +
            "diem_iso = -iso.fit(X).score_samples(X)   # cang cao cang bat thuong\n" +
            "\n" +
            "# LOF: BAT BUOC chuan hoa vi no dua tren khoang cach\n" +
            "Xs = StandardScaler().fit_transform(X)\n" +
            "lof = LocalOutlierFactor(n_neighbors=35, contamination=NGAN_SACH)\n" +
            "lof.fit_predict(Xs)\n" +
            "diem_lof = -lof.negative_outlier_factor_\n" +
            "\n" +
            "# DUONG CO SO PHAI VUOT QUA: do hiem theo dem tan suat 30 ngay\n" +
            "tan_suat = df.groupby(['tien_trinh_cha', 'tien_trinh_con'])['may'].nunique()\n" +
            "diem_hiem = 1.0 / df.set_index(['tien_trinh_cha', 'tien_trinh_con']).index.map(tan_suat)\n" +
            "\n" +
            "# So sanh top-50 cua ba cach; neu duong co so thang, hay dung duong co so.\n" +
            "for ten, diem in [('IForest', diem_iso), ('LOF', diem_lof), ('Do hiem', diem_hiem)]:\n" +
            "    top = np.argsort(-np.asarray(diem))[:50]\n" +
            "    print(ten, 'top-50 dau tien de analyst xem:', top[:5])\n",
        },
        { t: 'terms', ids: ['bat-thuong', 'isolation-forest', 'autoencoder', 'khong-giam-sat', 'nguong'] },
      ],
      keyTakeaways: [
        'Bất thường trả lời câu hỏi "cái này có hiếm không", không trả lời "cái này có nguy hiểm không" — khoảng cách giữa hai câu hỏi đó là công việc của analyst.',
        'Isolation Forest: nhanh, không cần chuẩn hoá, nên là lựa chọn thử đầu tiên; LOF bắt bất thường cục bộ nhưng tốn kém và bắt buộc chuẩn hoá.',
        'Autoencoder hỏng theo hai cách kinh điển: nút thắt quá rộng khiến nó học hàm đồng nhất, và dữ liệu huấn luyện đã chứa tấn công chưa bị phát hiện.',
        'contamination không phải sự thật về dữ liệu mà là ngân sách cảnh báo của bạn — tính ngược từ năng lực xử lý của đội.',
        'Không có nhãn thì đánh giá bằng: precision ở top-k do người xác nhận, chèn tấn công có kiểm soát, độ ổn định theo thời gian, và so với đường cơ sở.',
        'Đường cơ sở đếm tần suất (stack counting) thắng mô hình phức tạp trong rất nhiều bài toán bảo mật — luôn xây nó trước.',
        'Không dùng phát hiện bất thường khi đã có nhãn, khi cái cần tìm không hiếm, hoặc khi đầu ra sẽ kích hoạt hành động tự động.',
      ],
      cards: [
        {
          id: 't6l6-c1',
          front: 'Isolation Forest chấm điểm bất thường bằng cách nào?',
          back: 'Cắt ngẫu nhiên theo từng đặc trưng cho tới khi mỗi điểm bị cô lập. Điểm cần ít nhát cắt để cô lập thì bất thường. Điểm số là độ sâu trung bình qua nhiều cây ngẫu nhiên.',
          tags: ['bat-thuong', 'isolation-forest'],
        },
        {
          id: 't6l6-c2',
          front: 'LOF bắt được loại bất thường nào mà Isolation Forest bỏ sót? Cho ví dụ bảo mật.',
          back: 'Bất thường cục bộ. Ví dụ: đăng nhập lúc 2 giờ sáng là bình thường trong cụm quản trị viên nhưng bất thường trong cụm kế toán — xét toàn cục thì hai trường hợp giống nhau.',
          tags: ['bat-thuong', 'lof'],
        },
        {
          id: 't6l6-c3',
          front: 'Vì sao autoencoder có sai số tái tạo thấp trên MỌI mẫu là dấu hiệu xấu?',
          back: 'Vì nút thắt quá rộng nên mạng học hàm đồng nhất, chỉ sao chép đầu vào sang đầu ra. Nó cần tái tạo tốt cái phổ biến và tệ rõ rệt với cái hiếm thì mới có sức phân biệt.',
          tags: ['bat-thuong', 'autoencoder'],
        },
        {
          id: 't6l6-c4',
          front: 'Tham số contamination thực chất là gì và nên đặt thế nào?',
          back: 'Là điểm cắt trên phân phối điểm số, tức ngân sách cảnh báo của bạn — không phải tỉ lệ tấn công thật. Tính ngược từ năng lực xử lý: 40 cảnh báo/ngày trên 200.000 bản ghi thì đặt 0,0002.',
          tags: ['bat-thuong', 'nguong'],
        },
        {
          id: 't6l6-c5',
          front: 'Kể ba trường hợp KHÔNG nên dùng phát hiện bất thường.',
          back: '1) Khi đã có nhãn, dù ít — mô hình có giám sát gần như luôn thắng. 2) Khi cái cần tìm không hiếm, ví dụ credential stuffing. 3) Khi đầu ra sẽ kích hoạt hành động tự động như khoá tài khoản.',
          tags: ['bat-thuong', 'thuc-chien'],
        },
        {
          id: 't6l6-c6',
          front: 'Đường cơ sở nào mà mọi mô hình bất thường trong bảo mật phải vượt qua?',
          back: 'Đếm tần suất (stack counting): giá trị hoặc cặp giá trị này xuất hiện trên bao nhiêu máy trong 30 ngày. Rẻ, giải thích được ngay, không cần huấn luyện lại.',
          tags: ['bat-thuong', 'thuc-chien'],
        },
      ],
      quiz: [
        {
          id: 't6l6-q1',
          kind: 'mcq',
          tags: ['bat-thuong', 'thuc-chien'],
          q: 'Bạn có 500 nhãn dương đã xác nhận trong 4 triệu bản ghi. Chọn hướng nào?',
          options: [
            'Isolation Forest vì tỉ lệ dương quá thấp để học có giám sát',
            'Mô hình có giám sát (ví dụ LightGBM với class_weight) vì 500 nhãn dương đã đủ để học cái bạn thực sự quan tâm',
            'Autoencoder vì dữ liệu gần như toàn mẫu bình thường',
            'Không làm gì cho tới khi có ít nhất 10.000 nhãn dương',
          ],
          answer: 1,
          why: '500 nhãn dương là ít so với tiêu chuẩn ML phổ thông, nhưng chúng mang một thứ mà không thuật toán bất thường nào có: **thông tin về cái bạn quan tâm**. Mô hình bất thường tối ưu cho "hiếm", còn bạn cần "nguy hiểm" — hai mục tiêu này chỉ trùng nhau một phần nhỏ. Với dữ liệu bảng và mất cân bằng, LightGBM cộng chọn ngưỡng theo ngân sách thường vượt xa Isolation Forest. Cách làm tốt nhất trong thực tế là ghép cả hai: mô hình có giám sát làm chủ lực, mô hình bất thường chạy song song để bắt loại tấn công chưa từng có nhãn — và mỗi lần nó đúng thì bạn có thêm nhãn mới.',
          distractorWhy: [
            'Tỉ lệ thấp không cản trở học có giám sát; nó chỉ đòi hỏi chọn chỉ số và ngưỡng cho đúng.',
            '',
            'Autoencoder bỏ phí hoàn toàn 500 nhãn dương mà bạn đã tốn công thu thập.',
            'Chờ đủ nhãn là cách chắc chắn để không bao giờ bắt đầu; 500 nhãn đã đủ để có mô hình hữu ích.',
          ],
        },
        {
          id: 't6l6-q2',
          kind: 'match',
          tags: ['bat-thuong'],
          q: 'Nối thuật toán với đặc điểm quan trọng nhất của nó.',
          pairs: [
            ['Isolation Forest', 'Không cần chuẩn hoá đặc trưng và chạy gần tuyến tính'],
            ['Local Outlier Factor', 'Bắt được bất thường cục bộ nhưng tốn kém trên dữ liệu lớn'],
            ['Autoencoder', 'Dùng sai số tái tạo và cần dữ liệu huấn luyện tương đối sạch'],
            ['Đếm tần suất', 'Giải thích được ngay và không bao giờ cần huấn luyện lại'],
          ],
          why: 'Bốn cặp này là bảng quyết định thu gọn cho phần lớn tình huống thực tế. Quy trình chọn: bắt đầu bằng đếm tần suất vì nó gần như miễn phí; nếu chưa đủ thì Isolation Forest vì nó chạy được ngay trên dữ liệu chưa chuẩn hoá; chỉ dùng LOF khi bạn biết chắc bất thường của mình mang tính cục bộ và dữ liệu đủ nhỏ; chỉ dùng autoencoder khi dữ liệu nhiều chiều, nhiều mẫu, và bạn có cách đảm bảo tập huấn luyện tương đối sạch.',
        },
        {
          id: 't6l6-q3',
          kind: 'multi',
          tags: ['bat-thuong', 'do-luong'],
          q: 'Không có nhãn nào. Cách đánh giá nào dùng được? (Chọn tất cả đáp án đúng)',
          options: [
            'Cho analyst xác nhận 50 mẫu điểm cao nhất và tính tỉ lệ đáng điều tra',
            'Phối hợp đội đỏ thực hiện 20 hành vi đã biết rồi kiểm tra bao nhiêu lọt vào top-k',
            'Kiểm tra độ ổn định của tập cảnh báo giữa tuần này và tuần trước',
            'Tính ROC-AUC trên nhãn do chính mô hình sinh ra',
          ],
          answers: [0, 1, 2],
          why: 'Ba cách đầu đều đưa vào một nguồn sự thật từ bên ngoài mô hình: phán đoán của con người, hành vi tấn công có kiểm soát, hoặc tính nhất quán theo thời gian. Ý cuối là một dạng lập luận vòng tròn — dùng đầu ra của mô hình làm nhãn để chấm chính mô hình đó thì kết quả luôn hoàn hảo và luôn vô nghĩa. Bạn sẽ gặp lỗi này trong các báo cáo thật nhiều hơn bạn tưởng, thường được nguỵ trang dưới dạng "chúng tôi gắn nhãn tập kiểm tra dựa trên cảnh báo của hệ thống hiện tại".',
        },
        {
          id: 't6l6-q4',
          kind: 'truefalse',
          tags: ['bat-thuong', 'lof'],
          q: 'Có thể bỏ qua bước chuẩn hoá đặc trưng khi dùng Isolation Forest, nhưng không thể bỏ qua khi dùng LOF.',
          answer: true,
          why: 'Isolation Forest chỉ so sánh giá trị trong phạm vi **một đặc trưng tại mỗi nhát cắt**, nên thang đo của các đặc trưng khác không ảnh hưởng. LOF thì tính khoảng cách trong không gian nhiều chiều: nếu một đặc trưng tính bằng byte (giá trị tới hàng tỉ) còn một đặc trưng tính bằng giờ (0 tới 23), thì khoảng cách gần như hoàn toàn do đặc trưng byte quyết định và đặc trưng giờ biến mất. Quy tắc chung: **mọi thuật toán dựa trên khoảng cách đều cần chuẩn hoá** — LOF, k-NN, k-means, SVM với nhân RBF, autoencoder. Các thuật toán dựa trên cây thì không.',
        },
        {
          id: 't6l6-q5',
          kind: 'input',
          tags: ['bat-thuong', 'autoencoder'],
          q: 'Autoencoder dùng đại lượng nào làm điểm bất thường?',
          accept: ['sai so tai tao', 'reconstruction error', 'loi tai tao', 'sai số tái tạo', 'lỗi tái tạo'],
          placeholder: 'Tên đại lượng…',
          hint: 'Ba từ, nói về khoảng cách giữa đầu vào và đầu ra của mạng.',
          why: 'Sai số tái tạo (reconstruction error) — thường là bình phương sai khác trung bình giữa đầu vào và đầu ra. Logic: mạng bị ép qua một nút thắt hẹp nên chỉ học được các quy luật phổ biến nhất; mẫu tuân theo quy luật thì đi qua và trở lại gần như nguyên vẹn, còn mẫu lạ thì bị méo. Một lợi ích ít người tận dụng: sai số tính được **cho từng đặc trưng**, nên bạn biết đặc trưng nào bị tái tạo tệ nhất và đưa thông tin đó vào cảnh báo. Với analyst, "bất thường ở trường số byte tải lên và giờ đăng nhập" hữu ích hơn nhiều so với "điểm bất thường 0,87".',
        },
      ],
      terms: ['bat-thuong', 'isolation-forest', 'autoencoder', 'khong-giam-sat', 'nguong'],
      further: [
        {
          title: 'Isolation Forest — Liu, Ting & Zhou (2008)',
          note: 'Bài gốc, ngắn và dễ đọc. Ý tưởng cô lập bằng nhát cắt ngẫu nhiên đơn giản tới mức bạn có thể tự cài đặt lại trong một buổi tối.',
        },
        {
          title: 'LOF: Identifying Density-Based Local Outliers — Breunig và cộng sự (2000)',
          note: 'Nguồn của khái niệm bất thường cục bộ. Phần ví dụ trong bài giải thích rất rõ vì sao ngưỡng toàn cục luôn thiếu.',
        },
        {
          title: 'scikit-learn User Guide — Novelty and Outlier Detection',
          note: 'Phần so sánh trực quan các thuật toán trên nhiều dạng dữ liệu. Xem hình để thấy ngay mỗi thuật toán giả định hình dạng dữ liệu nào.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't6-l7',
      trackId: 'ung-dung',
      title: 'UEBA và mối đe doạ nội bộ',
      subtitle: 'Đường cơ sở cá nhân, nhóm đồng cấp, và câu hỏi bạn phải trả lời trước khi bật hệ thống',
      minutes: 26,
      practiceMinutes: 3,
      level: 'nang-cao',
      prereqs: ['t6-l6'],
      why: {
        short:
          'Mối đe doạ nội bộ là loại tấn công mà mọi biện pháp kỹ thuật ở biên đều vô dụng, nhưng cũng là loại có tỉ lệ nền thấp nhất và rủi ro đạo đức cao nhất — nên đây là nơi thiết kế sai gây hại nhiều nhất.',
        scenario:
          'Ban lãnh đạo yêu cầu triển khai UEBA cho 12.000 nhân viên sau khi một kỹ sư nghỉ việc mang theo mã nguồn. Bạn có 90 ngày. Bạn phải đưa ra kiến trúc, ngân sách cảnh báo, quy trình xử lý — và một tài liệu trả lời phòng nhân sự cùng bộ phận pháp chế về việc dữ liệu nào được thu và ai được xem.',
        roles: ['Security Data Scientist', 'Detection Engineer', 'Security Architect', 'GRC / Compliance'],
        costOfNotKnowing:
          'Bạn xây một hệ thống chấm điểm rủi ro cho từng nhân viên, nó tạo 300 cảnh báo mỗi ngày với precision gần bằng không, quản lý bắt đầu dùng điểm số đó để đánh giá nhân sự, và tổ chức của bạn vừa tạo ra một rủi ro pháp lý lớn hơn chính mối đe doạ ban đầu.',
      },
      objectives: [
        'Tính được tỉ lệ nền của mối đe doạ nội bộ và suy ra giới hạn precision khả thi',
        'Phân biệt và kết hợp được ba loại đường cơ sở: cá nhân, nhóm đồng cấp, toàn tổ chức',
        'Thiết kế được đặc trưng chuỗi hành vi thay vì chấm điểm từng sự kiện rời rạc',
        'Nêu được sáu nguyên tắc đạo đức và pháp lý bắt buộc trước khi triển khai giám sát nhân viên',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Tổ chức 12.000 nhân viên. Theo các khảo sát ngành, số vụ nội bộ thật sự gây thiệt hại được xác nhận trong một tổ chức cỡ này thường chỉ vài vụ mỗi năm — hãy lấy con số lạc quan là 3. Hệ thống UEBA của bạn tạo 20 cảnh báo mỗi ngày. Trong một năm, precision tối đa có thể đạt là bao nhiêu?',
          reveal:
            '20 cảnh báo × 250 ngày làm việc = **5.000 cảnh báo mỗi năm**. Nếu hệ thống bắt được **toàn bộ** 3 vụ (recall 100%, điều gần như không xảy ra), precision là 3 / 5.000 = **0,06%**.\n\nNghĩa là cứ khoảng 1.667 cảnh báo mới có một cái thật. Một analyst tốn 20 phút mỗi cảnh báo sẽ dành khoảng 1.667 giờ để tìm ra một vụ.\n\nCon số này không phải lý do để bỏ UEBA. Nó là lý do để **định nghĩa lại mục tiêu của hệ thống**. UEBA không phải bộ phát hiện; nó là bộ **ưu tiên điều tra** và bộ **cung cấp ngữ cảnh**. Khi bạn đã có nghi ngờ về một tài khoản từ nguồn khác — báo cáo của quản lý, cảnh báo DLP, một lần đăng nhập bất thường — thì hồ sơ hành vi 90 ngày của tài khoản đó là thứ giúp bạn kết luận trong 20 phút thay vì hai ngày.\n\nMọi thứ trong phần còn lại của bài đều xuất phát từ việc chấp nhận con số 0,06% này thay vì giả vờ nó không tồn tại.',
        },
        { t: 'figure', id: 'fig-base-rate', caption: 'Tỉ lệ nền của mối đe doạ nội bộ thấp hơn hầu hết mọi bài toán bảo mật khác. Đây là ràng buộc toán học, không phải vấn đề kỹ thuật có thể vượt qua bằng mô hình tốt hơn.' },
        { t: 'h', text: 'Bước 1 — Ba đường cơ sở, và vì sao cần cả ba', level: 2 },
        {
          t: 'table',
          head: ['Loại đường cơ sở', 'So sánh với ai', 'Bắt được gì', 'Điểm mù'],
          rows: [
            [
              'Cá nhân (self baseline)',
              'Chính người đó trong 30–90 ngày qua',
              'Thay đổi hành vi đột ngột: người chưa bao giờ truy cập kho mã nguồn bỗng tải 40 kho',
              'Người mới vào không có lịch sử; kẻ tấn công kiên nhẫn nâng dần đường cơ sở của chính mình',
            ],
            [
              'Nhóm đồng cấp (peer group)',
              'Người cùng phòng ban, cùng chức danh, cùng cấp quyền',
              'Người làm việc đúng như mình vẫn làm nhưng khác hẳn đồng nghiệp — bắt được cả người mới',
              'Nhóm định nghĩa sai thì kết quả vô nghĩa; nếu cả nhóm cùng làm sai thì không ai bất thường',
            ],
            [
              'Toàn tổ chức',
              'Toàn bộ nhân viên',
              'Hành vi hiếm tuyệt đối: dùng công cụ chưa ai dùng, truy cập hệ thống chưa ai chạm',
              'Quá thô; lãnh đạo và quản trị viên luôn nằm ở đuôi phân phối một cách hợp pháp',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Định nghĩa nhóm đồng cấp là công việc kỹ thuật, không phải công việc hành chính',
          md: 'Lấy nhóm từ sơ đồ tổ chức là cách dễ nhất và cũng là cách kém nhất. "Phòng Công nghệ" có thể gồm cả kỹ sư hạ tầng, lập trình viên giao diện và nhân viên hỗ trợ — ba hồ sơ hành vi hoàn toàn khác nhau.\n\nCách tốt hơn: **suy ra nhóm từ chính hành vi**. Phân cụm nhân viên theo vector các hệ thống họ truy cập trong 90 ngày, rồi dùng cụm đó làm nhóm đồng cấp. Kết quả thường khớp một phần với sơ đồ tổ chức và lệch ở những chỗ đáng quan tâm — chính những chỗ lệch đó là thông tin.\n\nRàng buộc thực tế: nhóm phải có ít nhất khoảng 15–20 người thì thống kê mới ổn định. Nhóm 3 người thì một người nghỉ phép cũng đủ làm hai người còn lại thành bất thường.',
        },
        { t: 'h', text: 'Bước 2 — Đặc trưng: từ sự kiện rời rạc tới chuỗi hành vi', level: 2 },
        {
          t: 'p',
          md: 'Đây là điểm khác biệt lớn nhất giữa UEBA làm tốt và UEBA làm dở. Chấm điểm từng sự kiện rời rạc — "đăng nhập lúc 23 giờ", "tải 200 MB" — cho ra hàng nghìn cảnh báo vô nghĩa. Thứ mang thông tin là **chuỗi**.',
        },
        {
          t: 'compare',
          title: 'Hai cách nhìn cùng một dữ liệu',
          left: {
            title: '📌 Chấm điểm sự kiện rời rạc',
            items: [
              'Đăng nhập 23:40 → hơi lạ, hàng trăm người làm mỗi ngày',
              'Truy cập thư mục nhân sự → hơi lạ, có thể do dự án',
              'Nén 1,2 GB tệp → hơi lạ, có thể do sao lưu',
              'Cắm USB → hơi lạ, vẫn phổ biến',
              'Kết quả: bốn cảnh báo yếu, không cảnh báo nào đáng điều tra',
            ],
          },
          right: {
            title: '🔗 Chấm điểm chuỗi hành vi',
            items: [
              'Cùng một tài khoản, trong 40 phút, theo đúng thứ tự trên',
              'Chuỗi này xuất hiện 0 lần trong 90 ngày qua của người đó',
              'Chuỗi này xuất hiện 0 lần trong nhóm đồng cấp',
              'Xảy ra 6 ngày sau khi nộp đơn xin nghỉ (nếu được phép ghép dữ liệu nhân sự)',
              'Kết quả: một cảnh báo mạnh, có đầy đủ ngữ cảnh để hành động',
            ],
          },
        },
        {
          t: 'list',
          items: [
            '**Đặc trưng khối lượng theo cửa sổ:** số tệp đọc trong 1 giờ / 24 giờ / 7 ngày, so với phân vị của chính người đó và của nhóm.',
            '**Đặc trưng độ mới:** số hệ thống truy cập lần đầu trong 7 ngày, số thư mục chưa từng chạm, số máy chưa từng đăng nhập.',
            '**Đặc trưng thời gian:** tỉ lệ hoạt động ngoài khung giờ thường lệ **của chính người đó** — không phải khung giờ hành chính chung, vì nhiều người vốn làm đêm.',
            '**Đặc trưng kênh ra:** dung lượng gửi qua email ra ngoài, tải lên dịch vụ lưu trữ cá nhân, ghi ra USB, in ấn.',
            '**Đặc trưng quyền:** quyền vừa được cấp thêm, tài khoản đặc quyền vừa được dùng lần đầu sau nhiều tháng.',
            '**Đặc trưng chuỗi:** n-gram trên chuỗi loại sự kiện, độ hiếm của chuỗi so với lịch sử cá nhân và nhóm.',
            '**Đặc trưng ngữ cảnh nhân sự (nhạy cảm, cần cân nhắc kỹ):** sắp kết thúc hợp đồng, vừa bị đánh giá kém, vừa nộp đơn nghỉ. Xem phần đạo đức phía dưới trước khi dùng.',
          ],
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't6l7-cp1',
              kind: 'mcq',
              tags: ['ueba', 'dac-trung'],
              q: 'Một nhân viên mới vào làm được 3 tuần bị hệ thống chấm điểm rủi ro rất cao. Nguyên nhân nhiều khả năng nhất?',
              options: [
                'Người này thực sự có hành vi độc hại',
                'Đường cơ sở cá nhân chưa đủ dữ liệu nên mọi hành vi đều trông mới lạ',
                'Mô hình bị quá khớp',
                'Dữ liệu log bị lỗi',
              ],
              answer: 1,
              why: 'Đây là bài toán **khởi động lạnh** (cold start) và nó là nguồn báo động giả lớn nhất của mọi hệ thống UEBA dựa trên đường cơ sở cá nhân. Người mới truy cập mọi thứ lần đầu, nên mọi đặc trưng độ mới đều đạt cực đại. Cách chữa có ba tầng: (1) trong 30–60 ngày đầu, dùng đường cơ sở **nhóm đồng cấp** thay cho đường cơ sở cá nhân; (2) chuyển dần trọng số sang đường cơ sở cá nhân khi đã đủ dữ liệu; (3) đưa số ngày làm việc vào làm đặc trưng để mô hình tự học rằng người mới thì hành vi mới là bình thường. Nguyên tắc chung: **mọi đặc trưng dựa trên lịch sử đều cần một chính sách xử lý cho trường hợp không có lịch sử.**',
              distractorWhy: [
                'Có thể nhưng xác suất rất thấp; tỉ lệ nền của mối đe doạ nội bộ cực nhỏ so với tỉ lệ nhân viên mới.',
                '',
                'Quá khớp là khái niệm của học có giám sát; ở đây vấn đề là thiếu dữ liệu lịch sử cho một cá nhân.',
                'Log lỗi sẽ ảnh hưởng nhiều người, không riêng nhóm nhân viên mới.',
              ],
            },
            {
              id: 't6l7-cp2',
              kind: 'truefalse',
              tags: ['ueba', 'ne-tranh'],
              q: 'Một người bên trong có ý đồ xấu và kiên nhẫn có thể làm cho hành vi bất thường của mình trở thành bình thường theo đúng nghĩa thống kê.',
              answer: true,
              why: 'Đây gọi là **đầu độc đường cơ sở** (baseline poisoning) và nó là điểm yếu cấu trúc của mọi hệ thống học từ hành vi quá khứ. Cơ chế: người đó bắt đầu truy cập kho tài liệu nhạy cảm mỗi ngày một chút, hoàn toàn hợp lệ về mặt quyền, trong sáu tháng. Đường cơ sở cá nhân tự điều chỉnh theo. Tới lúc lấy dữ liệu thật, hành vi nằm gọn trong vùng bình thường của chính họ. Ba đối sách: dùng đường cơ sở nhóm đồng cấp làm đối chứng (nhóm không trôi cùng chiều với một cá nhân), giới hạn tốc độ trôi của đường cơ sở, và giữ thêm một mô hình theo **ngưỡng tuyệt đối** cho các hành động có hậu quả lớn — bất kể lịch sử, sao chép toàn bộ kho mã nguồn vẫn phải sinh cảnh báo.',
            },
          ],
        },
        { t: 'h', text: 'Bước 3 — Điểm rủi ro tích luỹ và cách nó hỏng', level: 2 },
        {
          t: 'p',
          md: 'Hầu hết sản phẩm UEBA cộng dồn điểm rủi ro theo tài khoản, có suy giảm theo thời gian: mỗi cảnh báo nhỏ cộng vài điểm, điểm giảm dần nếu không có gì mới, và vượt ngưỡng thì sinh cảnh báo lớn. Cơ chế này hợp lý về trực giác nhưng có ba cách hỏng cụ thể:',
        },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Cộng dồn nhiễu.** Một người có 40 tín hiệu yếu vô hại mỗi tuần sẽ tích đủ điểm để vượt ngưỡng mà không hề làm gì sai. Đối sách: chuẩn hoá điểm theo mức nền của chính người đó, hoặc đặt trần cho mỗi loại tín hiệu.',
            '**Trọng số do người đặt tuỳ hứng.** "Cắm USB = 15 điểm, đăng nhập đêm = 8 điểm" — những con số này thường không dựa trên gì. Đối sách: khi đã tích luỹ được vài chục vụ đã xác nhận, hãy học trọng số bằng hồi quy logistic thay vì đoán.',
            '**Không có cơ chế đóng.** Điểm rủi ro chỉ tăng, và không ai định nghĩa khi nào thì một tài khoản được coi là đã điều tra xong và đặt lại. Kết quả sau sáu tháng: một danh sách vĩnh viễn những người "rủi ro cao" mà không ai còn nhớ vì sao. Đối sách: mỗi lần điều tra kết thúc phải ghi kết luận và đặt lại điểm — đây vừa là yêu cầu vận hành vừa là yêu cầu đạo đức.',
          ],
        },
        {
          t: 'callout',
          kind: 'ethics',
          title: 'Trước khi bật hệ thống: sáu nguyên tắc không được bỏ qua',
          md: 'Giám sát hành vi nhân viên là công cụ mạnh và nó tác động lên những người không phải kẻ tấn công — tức là gần như tất cả mọi người trong danh sách của bạn. Sáu nguyên tắc dưới đây không phải lời khuyên mềm, chúng là điều kiện để hệ thống tồn tại được lâu dài:\n\n**1. Tối thiểu hoá dữ liệu.** Thu đúng những gì phục vụ mục đích đã nêu. Đọc nội dung email cá nhân, chụp màn hình liên tục, ghi phím — hãy hỏi thật kỹ liệu chúng có thực sự cần cho bài toán này không, và trong đa số trường hợp câu trả lời là không.\n\n**2. Minh bạch.** Nhân viên phải được thông báo trước bằng văn bản: thu gì, vì sao, ai xem được, giữ bao lâu. Giám sát bí mật vừa tạo rủi ro pháp lý vừa phá huỷ lòng tin nhiều hơn giá trị nó mang lại.\n\n**3. Tương xứng.** Mức độ giám sát phải tương xứng với rủi ro thật. Áp mức giám sát của quản trị viên hệ thống lên toàn bộ 12.000 nhân viên là không tương xứng.\n\n**4. Giới hạn mục đích.** Dữ liệu thu để phát hiện rủi ro an ninh **không được** dùng để đánh giá năng suất, xét thăng tiến, hay kỷ luật lao động. Ranh giới này phải được viết thành chính sách và cưỡng chế bằng kiểm soát truy cập, không chỉ bằng lời hứa.\n\n**5. Con người ra quyết định.** Không có hành động tự động nào đối với con người. Điểm số mở ra một cuộc điều tra, không kết luận về một người.\n\n**6. Giám sát chính hệ thống giám sát.** Ai truy cập hồ sơ hành vi của ai, lúc nào, vì lý do gì — phải được ghi log và kiểm toán định kỳ. Hệ thống UEBA là một trong những kho dữ liệu nhạy cảm nhất trong tổ chức và nó chính là mục tiêu hấp dẫn cho một người bên trong.',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Khung pháp lý bạn cần đối chiếu',
          md: '**Việt Nam:** Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân đặt yêu cầu về căn cứ xử lý, thông báo và quyền của chủ thể dữ liệu; Luật Bảo vệ dữ liệu cá nhân có hiệu lực từ đầu năm 2026 siết chặt thêm. Hành vi làm việc của nhân viên là dữ liệu cá nhân.\n\n**Liên minh châu Âu:** GDPR yêu cầu có căn cứ pháp lý và đánh giá tác động (DPIA) cho giám sát có hệ thống; Điều 88 dành riêng cho bối cảnh lao động và cho phép các nước thành viên đặt quy định chặt hơn. **EU AI Act** cấm hệ thống AI suy luận cảm xúc tại nơi làm việc, và xếp AI dùng trong quản lý lao động vào nhóm **rủi ro cao** với nghĩa vụ về tài liệu, giám sát của con người và minh bạch.\n\nThực tế vận hành: nếu tổ chức bạn có nhân viên ở EU, hoặc có kế hoạch mở rộng, hãy thiết kế theo mức chặt nhất ngay từ đầu. Gỡ bỏ một tính năng giám sát sau khi đã triển khai khó hơn nhiều so với không xây nó.',
        },
        { t: 'h', text: 'Bước 4 — Dữ liệu để học nghề', level: 2 },
        {
          t: 'table',
          head: ['Bộ dữ liệu', 'Nội dung', 'Dùng được cho gì', 'Cảnh báo'],
          rows: [
            [
              'CERT Insider Threat (CMU, r4.2 và r6.2)',
              'Log tổng hợp của một tổ chức ảo: đăng nhập, email, USB, HTTP, tệp, dữ liệu nhân sự',
              'Học cách ghép nhiều nguồn và xây đặc trưng chuỗi; có kịch bản nội bộ được gắn nhãn rõ',
              'Là dữ liệu **sinh tổng hợp**; các kịch bản độc hại thường quá rõ so với đời thật, dễ tạo ảo tưởng dễ dàng',
            ],
            [
              'LANL Comprehensive Multi-Source Cyber-Security Events (2015)',
              '58 ngày log xác thực, tiến trình, luồng mạng và DNS thật của một mạng lớn, kèm nhãn đội đỏ',
              'Học phát hiện di chuyển ngang và bất thường xác thực trên dữ liệu THẬT ở quy mô lớn',
              'Đã ẩn danh nên mất nhiều ngữ cảnh; nhãn chỉ phủ hoạt động đội đỏ, không phủ nội bộ',
            ],
            [
              'Log của chính tổ chức bạn',
              'Thực tế đúng với môi trường của bạn',
              'Mọi thứ nghiêm túc',
              'Yêu cầu phê duyệt, kiểm soát truy cập và giới hạn mục đích trước khi lấy một dòng nào',
            ],
          ],
        },
        { t: 'h', text: 'Bước 5 — Triển khai đúng vai trò', level: 2 },
        {
          t: 'checklist',
          title: 'Kiến trúc UEBA sống được quá năm đầu tiên',
          items: [
            'Đầu ra chính không phải cảnh báo mà là hồ sơ hành vi tra cứu được, phục vụ điều tra đã có nghi ngờ từ nguồn khác.',
            'Chỉ một số ít loại hành vi có hậu quả rất lớn mới sinh cảnh báo trực tiếp — sao chép hàng loạt kho mã nguồn, truy cập ồ ạt dữ liệu khách hàng, tài khoản đặc quyền dùng lần đầu sau nhiều tháng.',
            'Ngân sách cảnh báo cứng, đặt theo năng lực điều tra thật: 5–20 mỗi ngày, không phải 300.',
            'Mọi cảnh báo phải kèm ba con số: giá trị hiện tại, phân vị so với chính người đó, phân vị so với nhóm đồng cấp. Thiếu ba con số này thì analyst không kết luận được gì.',
            'Quy trình phối hợp với nhân sự và pháp chế được viết trước khi có sự cố đầu tiên, không phải trong lúc đang có sự cố.',
            'Cơ chế đóng hồ sơ và đặt lại điểm rủi ro sau mỗi cuộc điều tra, có ghi kết luận.',
          ],
        },
        { t: 'terms', ids: ['ueba', 'base-rate', 'bat-thuong', 'eu-ai-act', 'alert-fatigue'] },
      ],
      keyTakeaways: [
        'Tỉ lệ nền của mối đe doạ nội bộ khiến precision khả thi ở mức phần nghìn — hãy thiết kế UEBA như bộ ưu tiên điều tra, không phải bộ phát hiện.',
        'Cần cả ba đường cơ sở: cá nhân bắt thay đổi đột ngột, nhóm đồng cấp bắt người mới và người khác biệt, toàn tổ chức bắt hành vi hiếm tuyệt đối.',
        'Nhóm đồng cấp nên suy ra từ hành vi bằng phân cụm, không lấy nguyên từ sơ đồ tổ chức, và cần ít nhất 15–20 người.',
        'Chuỗi hành vi mang thông tin, sự kiện rời rạc thì không — bốn tín hiệu yếu liên tiếp trong 40 phút mạnh hơn hẳn bốn cảnh báo riêng lẻ.',
        'Khởi động lạnh với nhân viên mới là nguồn báo động giả lớn nhất; xử lý bằng cách dựa vào nhóm đồng cấp trong 30–60 ngày đầu.',
        'Đầu độc đường cơ sở là điểm yếu cấu trúc; đối sách là đường cơ sở nhóm, giới hạn tốc độ trôi, và ngưỡng tuyệt đối cho hành động hậu quả lớn.',
        'Sáu nguyên tắc bắt buộc: tối thiểu hoá dữ liệu, minh bạch, tương xứng, giới hạn mục đích, con người ra quyết định, và kiểm toán chính hệ thống giám sát.',
      ],
      cards: [
        {
          id: 't6l7-c1',
          front: '12.000 nhân viên, 3 vụ nội bộ mỗi năm, 20 cảnh báo mỗi ngày. Precision tối đa là bao nhiêu?',
          back: 'Khoảng 0,06% (3 trên 5.000 cảnh báo/năm), kể cả khi recall đạt 100%. Đây là ràng buộc toán học, và nó buộc UEBA phải là bộ ưu tiên điều tra chứ không phải bộ phát hiện.',
          tags: ['ueba', 'base-rate'],
        },
        {
          id: 't6l7-c2',
          front: 'Vì sao cần đường cơ sở nhóm đồng cấp bên cạnh đường cơ sở cá nhân?',
          back: 'Vì đường cơ sở cá nhân mù với nhân viên mới (không có lịch sử) và bị đầu độc bởi người kiên nhẫn nâng dần hành vi của chính mình. Nhóm đồng cấp không trôi theo một cá nhân.',
          tags: ['ueba', 'dac-trung'],
        },
        {
          id: 't6l7-c3',
          front: 'Đầu độc đường cơ sở (baseline poisoning) là gì và chống bằng cách nào?',
          back: 'Người bên trong tăng dần hành vi nhạy cảm trong nhiều tháng để nó thành bình thường theo thống kê. Chống bằng: đối chứng với nhóm đồng cấp, giới hạn tốc độ trôi của đường cơ sở, và giữ ngưỡng tuyệt đối cho hành động hậu quả lớn.',
          tags: ['ueba', 'ne-tranh'],
        },
        {
          id: 't6l7-c4',
          front: 'Vì sao chấm điểm chuỗi hành vi mạnh hơn chấm điểm sự kiện rời rạc?',
          back: 'Vì mỗi sự kiện đơn lẻ (đăng nhập muộn, nén tệp, cắm USB) đều phổ biến và vô hại, nhưng chuỗi bốn sự kiện đó trong 40 phút có thể chưa từng xuất hiện trong 90 ngày của người đó lẫn của nhóm.',
          tags: ['ueba', 'dac-trung'],
        },
        {
          id: 't6l7-c5',
          front: 'Nêu ba trong sáu nguyên tắc đạo đức bắt buộc khi triển khai giám sát nhân viên.',
          back: 'Tối thiểu hoá dữ liệu; minh bạch thông báo trước bằng văn bản; giới hạn mục đích — dữ liệu an ninh không được dùng để đánh giá năng suất hay kỷ luật lao động.',
          tags: ['ueba', 'dao-duc'],
        },
      ],
      quiz: [
        {
          id: 't6l7-q1',
          kind: 'mcq',
          tags: ['ueba', 'thuc-chien'],
          q: 'Cách định vị hệ thống UEBA hợp lý nhất trong một tổ chức 12.000 người là gì?',
          options: [
            'Bộ phát hiện chính, tự động khoá tài khoản khi điểm rủi ro vượt ngưỡng',
            'Bộ ưu tiên điều tra và cung cấp ngữ cảnh, với ngân sách cảnh báo trực tiếp rất nhỏ',
            'Công cụ đánh giá mức độ tuân thủ của nhân viên cho phòng nhân sự',
            'Thay thế cho hệ thống DLP hiện có',
          ],
          answer: 1,
          why: 'Tỉ lệ nền quyết định vai trò. Với precision cỡ phần nghìn, dùng UEBA làm bộ phát hiện chính đồng nghĩa với việc chôn đội SOC dưới cảnh báo vô nghĩa; dùng nó để tự động khoá tài khoản thì thảm hoạ về cả vận hành lẫn pháp lý. Giá trị thật nằm ở hai chỗ: một danh sách rất ngắn các hành vi có hậu quả lớn được cảnh báo trực tiếp, và một kho hồ sơ hành vi giúp rút ngắn điều tra khi nghi ngờ đã đến từ nguồn khác. Dùng nó để đánh giá nhân viên thì vi phạm nguyên tắc giới hạn mục đích và tạo rủi ro pháp lý lớn hơn chính mối đe doạ ban đầu.',
          distractorWhy: [
            'Hành động tự động lên con người dựa trên điểm số có precision phần nghìn là sai cả về vận hành lẫn đạo đức.',
            '',
            'Vi phạm nguyên tắc giới hạn mục đích; đây là con đường ngắn nhất tới rắc rối pháp lý và mất lòng tin.',
            'DLP và UEBA giải hai bài toán khác nhau và bổ trợ cho nhau, không thay thế nhau.',
          ],
        },
        {
          id: 't6l7-q2',
          kind: 'multi',
          tags: ['ueba', 'dao-duc'],
          q: 'Nguyên tắc nào bắt buộc phải có trước khi bật hệ thống giám sát hành vi nhân viên? (Chọn tất cả đáp án đúng)',
          options: [
            'Thông báo trước bằng văn bản cho nhân viên về dữ liệu được thu và thời gian lưu trữ',
            'Chính sách cấm dùng dữ liệu này để đánh giá năng suất hay xét kỷ luật lao động',
            'Ghi log và kiểm toán việc ai truy cập hồ sơ hành vi của ai',
            'Thu càng nhiều dữ liệu càng tốt để mô hình có nhiều tín hiệu',
          ],
          answers: [0, 1, 2],
          why: 'Ba nguyên tắc đầu — minh bạch, giới hạn mục đích, và kiểm toán chính hệ thống giám sát — là điều kiện tối thiểu để hệ thống hợp pháp và tồn tại được lâu dài. Ý cuối đi ngược nguyên tắc tối thiểu hoá dữ liệu, và nó cũng sai về mặt kỹ thuật: thêm dữ liệu nhạy cảm hiếm khi cải thiện precision trong bài toán có tỉ lệ nền cỡ phần nghìn, trong khi nó làm tăng rõ rệt rủi ro pháp lý, rủi ro rò rỉ, và mức độ phản đối trong nội bộ. Kho hồ sơ hành vi của bạn cũng chính là một mục tiêu hấp dẫn cho người bên trong.',
        },
        {
          id: 't6l7-q3',
          kind: 'order',
          tags: ['ueba', 'quy-trinh'],
          q: 'Sắp xếp các bước triển khai UEBA theo thứ tự đúng.',
          items: [
            'Thống nhất với pháp chế và nhân sự về dữ liệu được thu, mục đích và quyền truy cập',
            'Thông báo cho nhân viên và công bố chính sách',
            'Thu thập và chuẩn hoá log, xây hồ sơ hành vi cá nhân và nhóm đồng cấp',
            'Chạy chế độ bóng để đo phân phối điểm số và ước lượng khối lượng cảnh báo',
            'Bật cảnh báo trực tiếp cho một danh sách rất ngắn hành vi hậu quả lớn',
            'Thiết lập quy trình điều tra, kết luận và đặt lại điểm rủi ro',
          ],
          why: 'Hai bước đầu đứng trước mọi thứ kỹ thuật, và đây là điểm khác biệt lớn nhất giữa UEBA và các bài toán khác trong chặng này. Lý do rất thực dụng chứ không chỉ là đạo đức: nếu bạn xây xong rồi mới hỏi pháp chế, khả năng cao bạn phải gỡ bỏ những đặc trưng mà toàn bộ mô hình đang dựa vào, và ba tháng công sức đổ sông. Chế độ bóng đứng trước khi bật cảnh báo vì bạn cần biết khối lượng thật trước khi hứa với đội SOC bất cứ điều gì.',
        },
        {
          id: 't6l7-q4',
          kind: 'truefalse',
          tags: ['ueba', 'dac-trung'],
          q: 'Nên định nghĩa nhóm đồng cấp trực tiếp từ sơ đồ tổ chức vì đó là nguồn dữ liệu chính xác nhất.',
          answer: false,
          why: 'Sơ đồ tổ chức chính xác về mặt hành chính nhưng không phản ánh hành vi. Một phòng công nghệ có thể gồm kỹ sư hạ tầng, lập trình viên giao diện và nhân viên hỗ trợ — ba hồ sơ truy cập hoàn toàn khác nhau, và gộp chung khiến cả ba đều trông bất thường so với "trung bình phòng". Cách tốt hơn là phân cụm nhân viên theo vector hệ thống họ truy cập trong 90 ngày. Thú vị hơn nữa: những chỗ mà cụm hành vi **lệch** khỏi sơ đồ tổ chức thường tự nó đã là thông tin đáng xem — ví dụ một người trong phòng kinh doanh có hồ sơ truy cập giống hệt quản trị viên hệ thống.',
        },
        {
          id: 't6l7-q5',
          kind: 'input',
          tags: ['ueba', 'bao-dong-gia'],
          q: 'Hiện tượng nhân viên mới bị chấm điểm rủi ro cao chỉ vì chưa có lịch sử hành vi được gọi là vấn đề gì?',
          accept: ['cold start', 'khoi dong lanh', 'khởi động lạnh', 'coldstart', 'van de khoi dong lanh'],
          placeholder: 'Tên vấn đề…',
          hint: 'Thuật ngữ mượn từ hệ khuyến nghị, nói về việc chưa có dữ liệu lịch sử cho một đối tượng mới.',
          why: 'Khởi động lạnh (cold start). Nó là nguồn báo động giả lớn nhất của UEBA dựa trên đường cơ sở cá nhân, vì mọi đặc trưng độ mới đều đạt cực đại với người mới. Ba cách xử lý theo thứ tự nên làm: dùng đường cơ sở nhóm đồng cấp trong 30–60 ngày đầu, chuyển dần trọng số sang đường cơ sở cá nhân khi đủ dữ liệu, và đưa chính "số ngày làm việc" vào làm đặc trưng để mô hình học được rằng người mới thì hành vi mới là chuyện bình thường. Nguyên tắc rộng hơn đáng mang theo: **mọi đặc trưng dựa trên lịch sử đều cần một chính sách rõ ràng cho trường hợp không có lịch sử.**',
        },
      ],
      terms: ['ueba', 'base-rate', 'bat-thuong', 'eu-ai-act', 'alert-fatigue'],
      further: [
        {
          title: 'CERT Common Sense Guide to Mitigating Insider Threats — CMU SEI',
          note: 'Tổng hợp từ hàng nghìn vụ thật, thiên về quy trình và tổ chức hơn là kỹ thuật. Đọc để biết đặc trưng nào đáng xây trước.',
        },
        {
          title: 'LANL Comprehensive Multi-Source Cyber-Security Events (Kent, 2015)',
          note: 'Dữ liệu xác thực thật ở quy mô lớn kèm nhãn hoạt động đội đỏ. Bộ tốt nhất hiện có để thực hành phát hiện bất thường xác thực và di chuyển ngang.',
        },
        {
          title: 'EU AI Act — Điều 5 và Phụ lục III',
          note: 'Danh mục thực hành bị cấm và danh mục hệ thống rủi ro cao, trong đó có quản lý lao động. Đọc trực tiếp văn bản, đừng đọc bản tóm tắt của nhà cung cấp.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't6-l8',
      trackId: 'ung-dung',
      title: 'Phát hiện bất thường trong log và chuỗi sự kiện',
      subtitle: 'Từ dòng log tự do tới template, rồi tới chuỗi — và vì sao đếm tần suất vẫn thắng',
      minutes: 26,
      practiceMinutes: 3,
      level: 'nang-cao',
      prereqs: ['t6-l6'],
      why: {
        short:
          'Log là nguồn dữ liệu lớn nhất và ít được khai thác nhất trong mọi tổ chức; biết cách biến nó thành cấu trúc mở ra cả một họ bài toán mà không nguồn dữ liệu nào khác giải được.',
        scenario:
          'Hệ thống của bạn sinh 400 triệu dòng log mỗi ngày từ 3.000 máy chủ, ứng dụng và thiết bị. Có người vừa hỏi bạn: "Chuyện gì bất thường đã xảy ra trong ba ngày qua?" Bạn không thể đọc 1,2 tỉ dòng, và grep thì chỉ tìm được thứ bạn đã biết tên.',
        roles: ['Detection Engineer', 'SOC Analyst', 'Security Data Scientist', 'Threat Hunter'],
        costOfNotKnowing:
          'Bạn hoặc là bỏ tiền lưu 400 triệu dòng mỗi ngày mà không bao giờ đọc, hoặc là dựng một bộ phát hiện bất thường log rồi nhận 8.000 cảnh báo vào đúng buổi sáng sau khi đội hạ tầng nâng cấp phiên bản ứng dụng.',
      },
      objectives: [
        'Giải thích được cơ chế phân tách log thành template và tham số bằng thuật toán Drain',
        'Thiết kế được ba lớp đặc trưng trên log: tần suất template, chuỗi sự kiện, và độ hiếm của quan hệ tiến trình',
        'Nêu được vì sao template mới sau khi nâng cấp phần mềm là nguồn báo động giả lớn nhất và cách xử lý',
        'So sánh được mô hình chuỗi kiểu DeepLog với đường cơ sở đếm tần suất trên tiêu chí thực dụng',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bốn dòng log:\n`Failed password for invalid user admin from 10.1.2.3 port 4455 ssh2`\n`Failed password for invalid user root from 10.1.2.7 port 51022 ssh2`\n`Accepted publickey for deploy from 10.2.0.9 port 33110 ssh2`\n`Failed password for invalid user test from 10.1.2.3 port 4471 ssh2`\n\nTheo bạn, một hệ thống phân tích log nên coi đây là bốn sự kiện khác nhau, hay là bao nhiêu?',
          reveal:
            '**Hai** loại sự kiện, với các tham số khác nhau:\n\nTemplate A: `Failed password for invalid user <*> from <*> port <*> ssh2` — xuất hiện 3 lần.\nTemplate B: `Accepted publickey for <*> from <*> port <*> ssh2` — xuất hiện 1 lần.\n\nĐây là toàn bộ ý tưởng của **phân tách log** (log parsing): tách phần **cố định do lập trình viên viết** khỏi phần **biến thiên do dữ liệu**. Sau bước này, 400 triệu dòng log biến thành một chuỗi vài trăm mã sự kiện kèm bảng tham số — và mọi kỹ thuật bạn học ở chặng trước bỗng dùng được.\n\nVì sao không dùng regex? Vì bạn có hàng nghìn định dạng log từ hàng trăm phần mềm khác nhau, chúng thay đổi sau mỗi lần nâng cấp, và không ai có thời gian viết hay bảo trì hàng nghìn biểu thức chính quy. Phân tách log tự động giải đúng bài toán đó.',
        },
        { t: 'h', text: 'Bước 1 — Phân tách log: thuật toán Drain', level: 2 },
        {
          t: 'p',
          md: '**Drain** (He và cộng sự, 2017) là thuật toán phân tách log được dùng rộng rãi nhất, một phần vì nó chạy **trực tuyến** — xử lý từng dòng khi nó đến, không cần nhìn toàn bộ tập trước. Ý tưởng dựa trên một quan sát rất thực dụng: các dòng log cùng loại thường có **cùng số token** và **giống nhau ở vài token đầu**.',
        },
        {
          t: 'steps',
          title: 'Drain hoạt động thế nào',
          steps: [
            {
              title: 'Tiền xử lý bằng vài luật đơn giản',
              md: 'Thay các mẫu rõ ràng bằng ký tự đại diện trước khi phân tích: địa chỉ IP, số nguyên dài, mã định danh dạng UUID, đường dẫn tệp. Chỉ vài biểu thức chính quy chung cho mọi loại log, không phải một bộ cho từng loại.',
            },
            {
              title: 'Đi xuống cây theo độ dài',
              md: 'Nút gốc phân nhánh theo **số lượng token** của dòng log. Một dòng 9 token và một dòng 12 token không bao giờ cùng template, nên bước này loại bỏ ngay phần lớn khả năng so sánh.',
            },
            {
              title: 'Đi tiếp theo các token đầu tiên',
              md: 'Ở các tầng tiếp theo, cây phân nhánh theo token thứ nhất, thứ hai… tới độ sâu cố định (thường 4). Lý do: lập trình viên hầu như luôn đặt phần chữ cố định ở đầu chuỗi định dạng, còn phần biến thiên nằm sau.',
            },
            {
              title: 'So khớp trong nhóm lá bằng độ tương đồng token',
              md: 'Ở lá, so dòng mới với các template đã có bằng tỉ lệ token trùng nhau. Vượt ngưỡng thì gộp vào template đó và biến các token khác biệt thành `<*>`; không vượt thì tạo template mới.',
            },
            {
              title: 'Kết quả',
              md: 'Mỗi dòng log trở thành một cặp: **mã template** và **danh sách tham số**. Từ đây, chuỗi log của một máy trở thành một chuỗi số nguyên — đúng dạng mà mọi mô hình chuỗi cần.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Phân tách log trực tuyến bằng thư viện Drain3',
          code:
            "from drain3 import TemplateMiner\n" +
            "from drain3.template_miner_config import TemplateMinerConfig\n" +
            "\n" +
            "cau_hinh = TemplateMinerConfig()\n" +
            "cau_hinh.load('drain3.ini')   # nguong tuong dong, do sau cay, luat che mask\n" +
            "tm = TemplateMiner(config=cau_hinh)\n" +
            "\n" +
            "chuoi_su_kien = {}   # theo tung may: danh sach ma template theo thu tu\n" +
            "for dong in nguon_log:\n" +
            "    kq = tm.add_log_message(dong.noi_dung)\n" +
            "    # kq['change_type'] la 'cluster_created' khi gap template MOI\n" +
            "    # -> dung chinh tin hieu nay de theo doi bung no template sau nang cap\n" +
            "    chuoi_su_kien.setdefault(dong.may, []).append(kq['cluster_id'])\n" +
            "\n" +
            "print('So template hoc duoc:', len(tm.drain.clusters))\n" +
            "for c in sorted(tm.drain.clusters, key=lambda x: -x.size)[:5]:\n" +
            "    print(c.size, c.get_template())\n",
        },
        {
          t: 'table',
          head: ['Thuật toán', 'Kiểu', 'Điểm mạnh', 'Điểm yếu'],
          rows: [
            ['Drain', 'Trực tuyến, cây độ sâu cố định', 'Nhanh, ổn định, có thư viện bảo trì tốt (Drain3)', 'Nhạy với ngưỡng tương đồng; log có số token biến thiên thì tách nhầm'],
            ['Spell', 'Trực tuyến, chuỗi con chung dài nhất', 'Không giả định độ dài cố định', 'Chậm hơn trên tập lớn'],
            ['IPLoM', 'Theo lô, chia theo phân vùng', 'Chất lượng tốt trên nhiều tập chuẩn', 'Cần toàn bộ dữ liệu trước, không phù hợp luồng trực tiếp'],
            ['Regex thủ công', 'Do người viết', 'Chính xác tuyệt đối cho định dạng đã biết', 'Không mở rộng được; hỏng sau mỗi lần nâng cấp phần mềm'],
          ],
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't6l8-cp1',
              kind: 'mcq',
              tags: ['log', 'drain'],
              q: 'Vì sao Drain phân nhánh tầng đầu tiên theo SỐ LƯỢNG TOKEN của dòng log?',
              options: [
                'Để cân bằng cây cho tìm kiếm nhanh hơn',
                'Vì hai dòng log khác số token gần như chắc chắn sinh ra từ hai câu lệnh ghi log khác nhau',
                'Vì số token tương quan với mức độ nghiêm trọng của sự kiện',
                'Để giới hạn bộ nhớ sử dụng',
              ],
              answer: 1,
              why: 'Đây là một giả định về **cách lập trình viên viết mã**, không phải về dữ liệu. Một câu lệnh ghi log với chuỗi định dạng cố định sinh ra các dòng có cùng số token, trừ khi một tham số chứa khoảng trắng. Nhờ giả định đó, Drain loại bỏ được phần lớn khả năng so sánh chỉ bằng một phép tra bảng, và đó là lý do nó chạy được trực tuyến trên hàng trăm triệu dòng. Đây cũng chính là điểm yếu của nó: các thông báo lỗi có phần văn bản tự do độ dài thay đổi sẽ bị tách thành nhiều template khác nhau.',
              distractorWhy: [
                'Cân bằng cây là hệ quả phụ, không phải lý do thiết kế.',
                '',
                'Không có mối liên hệ nào giữa số token và mức nghiêm trọng.',
                'Bộ nhớ không phải ràng buộc chính; ràng buộc chính là tốc độ và chất lượng gộp nhóm.',
              ],
            },
            {
              id: 't6l8-cp2',
              kind: 'truefalse',
              tags: ['log', 'troi-khai-niem'],
              q: 'Sau khi đội hạ tầng nâng cấp phiên bản ứng dụng, việc bùng nổ hàng loạt template mới là dấu hiệu của tấn công.',
              answer: false,
              why: 'Đó là dấu hiệu của **thay đổi phần mềm**, và nó là nguồn báo động giả lớn nhất của mọi hệ thống phát hiện bất thường trên log. Phiên bản mới đổi chuỗi định dạng, thêm trường, đổi mức nghiêm trọng — mọi dòng log của thành phần đó trở thành template chưa từng thấy. Cách xử lý gồm ba phần: (1) ghép luồng cảnh báo với **lịch thay đổi và bản ghi CI/CD** để tự động dập cảnh báo trong cửa sổ triển khai; (2) giám sát riêng chỉ số "tỉ lệ template mới trên mỗi thành phần" như một chỉ số sức khoẻ dữ liệu chứ không phải cảnh báo bảo mật; (3) ấn định thời gian ủ cho template mới trước khi nó được dùng trong mô hình. Bỏ qua ba việc này là lý do phổ biến nhất khiến hệ thống bị tắt trong tháng đầu.',
            },
          ],
        },
        { t: 'h', text: 'Bước 2 — Ba lớp đặc trưng trên log đã phân tách', level: 2 },
        {
          t: 'steps',
          title: 'Xếp theo độ phức tạp tăng dần',
          steps: [
            {
              title: 'Lớp 1 — Vector đếm template theo cửa sổ',
              md: 'Với mỗi máy hoặc mỗi phiên, đếm số lần xuất hiện của từng template trong cửa sổ 5 phút. Bạn được một vector vài trăm chiều. Đưa vào Isolation Forest hoặc autoencoder là có ngay một bộ phát hiện bất thường.\n\nBắt được: bùng nổ lỗi, biến mất của một sự kiện thường lệ (rất hay bị bỏ qua — **thiếu** một template cũng là bất thường), thay đổi tỉ lệ giữa các loại sự kiện.',
            },
            {
              title: 'Lớp 2 — Chuỗi thứ tự template',
              md: 'Giữ nguyên thứ tự: `[12, 12, 45, 7, 45, 91]`. Bây giờ bạn phát hiện được thứ mà vector đếm không thấy: **thứ tự sai**. Một tiến trình bình thường luôn đi mở → xác thực → đọc → đóng; nếu xuất hiện đọc trước xác thực thì đó là tín hiệu, dù tần suất từng loại không đổi.\n\nĐây chính là ý tưởng của DeepLog: huấn luyện một LSTM dự đoán mã template tiếp theo từ n mã trước đó. Nếu mã thực tế không nằm trong **g dự đoán khả dĩ nhất** (thường g khoảng 9), đánh dấu bất thường.',
            },
            {
              title: 'Lớp 3 — Giá trị tham số',
              md: 'Template giống nhau nhưng tham số bất thường: thời gian phản hồi 40 giây thay vì 40 mili-giây, kích thước tệp 4 GB thay vì 4 MB, mã lỗi chưa từng thấy. DeepLog gọi đây là mô hình vector giá trị tham số và huấn luyện riêng cho từng template.\n\nTrong bảo mật, lớp này thường mang thông tin **giá trị nhất**: cùng một template `Accepted publickey for <*> from <*>` nhưng tham số là một tài khoản dịch vụ đăng nhập từ một dải địa chỉ chưa từng xuất hiện.',
            },
          ],
        },
        { t: 'figure', id: 'fig-soc-pipeline', caption: 'Log đi từ nguồn thô qua phân tách, trích đặc trưng, chấm điểm, tới hàng đợi của analyst. Mỗi mũi tên là một chỗ khối lượng phải giảm đi một bậc.' },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Sự thật khó chịu về các benchmark log anomaly',
          md: 'Các bộ dữ liệu chuẩn — HDFS, BGL, Thunderbird trong bộ sưu tập LogHub — được dùng trong hàng trăm bài báo báo cáo F1 trên 0,95. Có ba điều bạn cần biết trước khi tin vào những con số đó:\n\n**1.** Nhãn của HDFS ở mức **khối** (block), không phải mức dòng, và phần lớn bất thường là lỗi vận hành hệ thống chứ không phải tấn công. Mô hình học được ở đó không chuyển sang bài toán bảo mật một cách hiển nhiên.\n\n**2.** Nhiều nghiên cứu đánh giá lại cho thấy **các đường cơ sở rất đơn giản** — đếm template, hồi quy logistic trên vector đếm — đạt kết quả ngang ngửa các kiến trúc sâu trên chính những bộ này. Khi một bài toán chuẩn dễ tới mức đó, nó không còn phân biệt được phương pháp nữa.\n\n**3.** Chia dữ liệu ngẫu nhiên theo khối làm rò rỉ thông tin thời gian, đúng như mọi bài trong chặng này đã cảnh báo.\n\nKết luận thực dụng: hãy dùng các bộ này để **học kỹ thuật**, đừng dùng chúng để chọn kiến trúc cho hệ thống của bạn. Bộ dữ liệu thật của bạn mới quyết định.',
        },
        { t: 'h', text: 'Bước 3 — Chuỗi lệnh và quan hệ tiến trình: nơi giá trị bảo mật nằm', level: 2 },
        {
          t: 'p',
          md: 'Với người làm bảo mật, loại log giá trị nhất không phải log ứng dụng mà là **log tạo tiến trình** — Sysmon Event ID 1 trên Windows, hoặc auditd/eBPF trên Linux. Mỗi bản ghi cho bạn: tiến trình, dòng lệnh đầy đủ, tiến trình cha, người dùng, hash của tệp thực thi.',
        },
        {
          t: 'table',
          head: ['Đặc trưng', 'Ví dụ cụ thể', 'Vì sao mạnh'],
          rows: [
            [
              'Độ hiếm của cặp cha-con',
              '`winword.exe` sinh `powershell.exe`: xuất hiện trên 1 trong 12.000 máy',
              'Quan hệ tiến trình phản ánh kiến trúc phần mềm; quan hệ lạ là dấu hiệu mã bị chèn vào luồng bình thường',
            ],
            [
              'Entropy và độ dài dòng lệnh',
              'Chuỗi base64 dài 4.000 ký tự sau `-enc`',
              'Mã hoá dòng lệnh là cách né phổ biến nhất, và nó tự để lại dấu vết đặc trưng',
            ],
            [
              'Cờ đáng ngờ của trình thông dịch',
              '`-nop -w hidden -ep bypass`, `/c`, `-decode`',
              'Đây là các cờ mà quản trị viên hiếm khi dùng nhưng bộ công cụ tấn công dùng theo mặc định',
            ],
            [
              'LOLBins ở vị trí bất thường',
              '`certutil -urlcache -f http://…`, `mshta`, `regsvr32 /i:http…`, `bitsadmin /transfer`',
              'Công cụ có sẵn của hệ điều hành nên không có tệp lạ để mô hình tĩnh bắt',
            ],
            [
              'Chuỗi n-gram trên cây tiến trình',
              '`explorer → cmd → certutil → rundll32` trong 90 giây',
              'Bắt được kỹ thuật ngay cả khi từng bước riêng lẻ đều hợp lệ',
            ],
            [
              'Độ mới trong tổ chức',
              'Hash tệp thực thi này chưa từng chạy trên máy nào trong 90 ngày',
              'Rẻ, cực mạnh, và là đường cơ sở mà mọi mô hình phức tạp phải vượt qua',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Đếm tần suất trên quan hệ tiến trình: kỹ thuật có tỉ lệ lợi ích cao nhất trong bài này',
          md: 'Xây một bảng duy nhất: `(tiến_trình_cha, tiến_trình_con) → số máy khác nhau đã thấy trong 30 ngày`. Cập nhật hằng ngày. Sắp xếp tăng dần.\n\nĐầu bảng là danh sách săn lùng của bạn. Không có mô hình nào, không có huấn luyện, không có siêu tham số. Analyst hiểu ngay tại sao một dòng nằm ở đó, và bạn giải thích cho quản lý trong một câu.\n\nBạn có thể mở rộng bằng cách thêm cột thứ ba là dòng lệnh đã chuẩn hoá (bỏ đường dẫn, bỏ mã định danh, bỏ chuỗi ngẫu nhiên). Ở dạng đó, kỹ thuật này bắt được phần lớn hoạt động hậu khai thác trong thực tế — và nó là thứ bạn nên xây trong tuần đầu tiên, trước khi nghĩ tới bất kỳ mạng nơ-ron nào.',
        },
        { t: 'h', text: 'Bước 4 — Bốn cái bẫy kỹ thuật của dữ liệu log', level: 2 },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Chuỗi bị trộn lẫn.** Nhiều luồng ghi vào cùng một tệp log, nên chuỗi bạn đọc được là hợp của nhiều chuỗi độc lập. Mô hình chuỗi học trên đó sẽ học nhiễu. Bắt buộc phải tách theo mã phiên, mã yêu cầu, mã tiến trình, hoặc mã theo dõi phân tán trước khi mô hình hoá.',
            '**Log mất và log đến trễ.** Bộ đệm đầy, mạng nghẽn, tác tử chết. Một chuỗi thiếu vài sự kiện trông giống hệt một chuỗi bất thường. Đối sách: theo dõi tỉ lệ mất log như một chỉ số vận hành riêng, và không cảnh báo trong cửa sổ có tỉ lệ mất cao.',
            '**Thời gian không đồng bộ.** Máy chủ lệch giờ vài phút làm hỏng mọi phân tích thứ tự. Kiểm tra đồng bộ NTP trước khi kiểm tra mô hình.',
            '**Kẻ tấn công xoá log.** Sự kiện Windows 1102 (nhật ký bảo mật bị xoá), `wevtutil cl`, `journalctl --vacuum`, xoá `.bash_history`. Điểm quan trọng: **chính việc log biến mất là một trong những tín hiệu mạnh nhất bạn có** — hãy giám sát khoảng trống trong dòng log của mỗi máy, không chỉ giám sát nội dung của nó.',
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Kẻ tấn công né bằng cách hoà vào chỗ đông người',
          md: 'Khi biết bạn chấm điểm theo độ hiếm, cách né hiệu quả nhất không phải làm gì đó tinh vi hơn — mà là làm đúng những gì phổ biến nhất. Đặt tên tiến trình trùng tên tiến trình hệ thống, chạy dưới tiến trình cha hợp pháp, dùng công cụ quản trị mà đội vận hành vẫn dùng hằng ngày, thực hiện hành động vào giờ cao điểm khi khối lượng log lớn nhất.\n\nĐối sách không nằm ở mô hình mà ở **đặc trưng bổ sung**: đường dẫn đầy đủ của tệp thực thi (một `svchost.exe` trong `C:\\Users\\...\\AppData` không phải `svchost.exe` thật), hash của tệp, chữ ký số, và tổ hợp cha-con-dòng lệnh chứ không chỉ tên tiến trình. Đây là lý do log tạo tiến trình phải thu **đầy đủ trường**, không phải chỉ tên.',
        },
        { t: 'terms', ids: ['log-parsing', 'bat-thuong', 'siem', 'attck', 'troi-du-lieu'] },
      ],
      keyTakeaways: [
        'Phân tách log tách phần cố định do lập trình viên viết khỏi phần biến thiên, biến hàng trăm triệu dòng thành chuỗi vài trăm mã template.',
        'Drain chạy trực tuyến nhờ giả định rằng dòng log cùng loại có cùng số token và giống nhau ở vài token đầu.',
        'Ba lớp đặc trưng: vector đếm template theo cửa sổ, thứ tự chuỗi template (kiểu DeepLog), và giá trị tham số bên trong template.',
        'Thiếu một template thường lệ cũng là bất thường, không chỉ có thêm template mới.',
        'Bùng nổ template mới sau nâng cấp phần mềm là nguồn báo động giả lớn nhất — phải ghép với lịch thay đổi và CI/CD.',
        'Trên các benchmark log chuẩn, đường cơ sở đơn giản thường ngang ngửa kiến trúc sâu; dùng chúng để học kỹ thuật, không để chọn kiến trúc.',
        'Với bảo mật, bảng đếm độ hiếm của cặp tiến trình cha-con theo số máy trong 30 ngày là kỹ thuật có tỉ lệ lợi ích trên công sức cao nhất.',
        'Chính khoảng trống trong dòng log là tín hiệu mạnh: hãy giám sát việc log biến mất, không chỉ nội dung log.',
      ],
      cards: [
        {
          id: 't6l8-c1',
          front: 'Phân tách log (log parsing) làm gì với một dòng log?',
          back: 'Tách nó thành template (phần chuỗi cố định do lập trình viên viết) và danh sách tham số (phần biến thiên). Nhờ đó chuỗi log trở thành chuỗi mã sự kiện dùng được cho mô hình chuỗi.',
          tags: ['log', 'log-parsing'],
        },
        {
          id: 't6l8-c2',
          front: 'Vì sao Drain phân nhánh tầng đầu theo số lượng token?',
          back: 'Vì một câu lệnh ghi log với chuỗi định dạng cố định sinh ra các dòng cùng số token. Giả định về cách lập trình viên viết mã này cho phép loại bỏ phần lớn khả năng so sánh bằng một phép tra bảng.',
          tags: ['log', 'drain'],
        },
        {
          id: 't6l8-c3',
          front: 'DeepLog phát hiện bất thường bằng cơ chế nào?',
          back: 'Huấn luyện LSTM dự đoán mã template tiếp theo từ n mã trước. Nếu mã thực tế không nằm trong g dự đoán khả dĩ nhất thì đánh dấu bất thường — tức là phát hiện thứ tự sai, không chỉ tần suất lạ.',
          tags: ['log', 'deeplog'],
        },
        {
          id: 't6l8-c4',
          front: 'Nguồn báo động giả lớn nhất của phát hiện bất thường trên log là gì?',
          back: 'Bùng nổ template mới sau khi nâng cấp phần mềm. Xử lý bằng cách ghép với lịch thay đổi và bản ghi CI/CD, và đặt thời gian ủ cho template mới trước khi đưa vào mô hình.',
          tags: ['log', 'bao-dong-gia'],
        },
        {
          id: 't6l8-c5',
          front: 'Bảng đếm nào là đường cơ sở mạnh nhất cho phát hiện hoạt động hậu khai thác?',
          back: 'Cặp (tiến trình cha, tiến trình con) → số máy khác nhau đã thấy trong 30 ngày, sắp xếp tăng dần. Không cần mô hình, analyst hiểu ngay, và không bao giờ cần huấn luyện lại.',
          tags: ['log', 'thuc-chien'],
        },
        {
          id: 't6l8-c6',
          front: 'Vì sao chuỗi log bị trộn lẫn làm hỏng mô hình chuỗi, và chữa thế nào?',
          back: 'Vì nhiều luồng cùng ghi vào một tệp nên chuỗi đọc được là hợp của nhiều chuỗi độc lập, và mô hình học nhiễu. Chữa bằng cách tách theo mã phiên, mã yêu cầu, mã tiến trình hoặc mã theo dõi trước khi mô hình hoá.',
          tags: ['log', 'ro-ri-du-lieu'],
        },
      ],
      quiz: [
        {
          id: 't6l8-q1',
          kind: 'mcq',
          tags: ['log', 'dac-trung'],
          q: 'Trong một cửa sổ 5 phút, một máy chủ vẫn sinh log bình thường nhưng template "Sao lưu hoàn tất" thường xuất hiện mỗi giờ lại biến mất suốt 6 giờ. Hệ thống của bạn nên phản ứng thế nào?',
          options: [
            'Bỏ qua, vì không có sự kiện lạ nào xuất hiện',
            'Coi đây là bất thường: thiếu một template thường lệ cũng mang thông tin như có thêm template mới',
            'Giảm ngưỡng để bắt được nhiều template mới hơn',
            'Chỉ cảnh báo nếu có thêm template lỗi xuất hiện',
          ],
          answer: 1,
          why: 'Rất nhiều hệ thống chỉ tìm cái **xuất hiện thêm** và hoàn toàn mù với cái **biến mất**. Nhưng sự vắng mặt là tín hiệu mạnh trong cả vận hành lẫn bảo mật: dịch vụ sao lưu bị tắt, tác tử ghi log bị dừng, một tiến trình bị kẻ tấn công vô hiệu hoá để giấu dấu vết. Cách hiện thực: xây một hồ sơ nhịp cho từng template thường lệ theo từng máy (khoảng cách trung bình giữa hai lần xuất hiện), và cảnh báo khi khoảng lặng vượt vài lần độ lệch chuẩn. Đây cũng là cách phát hiện tác tử EDR bị tắt — một trong những cảnh báo có precision cao nhất mà bạn có thể xây.',
          distractorWhy: [
            'Sự vắng mặt là một trong những tín hiệu có giá trị nhất và cũng bị bỏ qua nhiều nhất.',
            '',
            'Hạ ngưỡng chỉ làm tăng cảnh báo về template mới, không giải quyết vấn đề vắng mặt.',
            'Chờ có thêm lỗi nghĩa là chờ tới khi hậu quả đã xảy ra.',
          ],
        },
        {
          id: 't6l8-q2',
          kind: 'order',
          tags: ['log', 'quy-trinh'],
          q: 'Sắp xếp đường ống xử lý log cho phát hiện bất thường.',
          items: [
            'Chuẩn hoá thời gian và kiểm tra đồng bộ NTP giữa các nguồn',
            'Phân tách log thành template và tham số',
            'Tách chuỗi theo mã phiên hoặc mã tiến trình để không trộn nhiều luồng',
            'Trích đặc trưng: vector đếm template, thứ tự chuỗi, giá trị tham số',
            'Chấm điểm bất thường và đối chiếu với lịch thay đổi để dập cảnh báo do triển khai',
            'Xếp hạng theo độ hiếm trong tổ chức rồi đưa vào hàng đợi analyst',
          ],
          why: 'Ba bước đầu đều là công việc dữ liệu, và chúng quyết định chất lượng nhiều hơn bước chọn mô hình. Lệch giờ giữa các máy làm hỏng mọi phân tích thứ tự, nên nó phải được xử lý trước cả phân tách. Tách chuỗi phải đứng sau phân tách nhưng trước trích đặc trưng, vì đặc trưng chuỗi chỉ có nghĩa trên một luồng đơn. Đối chiếu lịch thay đổi đứng ngay sau chấm điểm chứ không phải cuối cùng, vì nó loại bỏ nguồn báo động giả lớn nhất trước khi tiêu tốn thời gian xếp hạng.',
        },
        {
          id: 't6l8-q3',
          kind: 'multi',
          tags: ['log', 'attck'],
          q: 'Dấu hiệu nào trong log tạo tiến trình đáng đưa vào bộ phát hiện? (Chọn tất cả đáp án đúng)',
          options: [
            'Cặp cha-con chỉ xuất hiện trên 1 trong 12.000 máy',
            'Dòng lệnh chứa chuỗi base64 dài sau tham số -enc',
            'Tệp thực thi tên `svchost.exe` nhưng nằm trong thư mục AppData của người dùng',
            'Tiến trình `chrome.exe` sinh ra tiến trình con `chrome.exe`',
          ],
          answers: [0, 1, 2],
          why: 'Ba dấu hiệu đầu đều gắn với kỹ thuật tấn công thật: quan hệ tiến trình lạ chỉ ra mã bị chèn vào luồng bình thường, dòng lệnh mã hoá base64 là cách né phổ biến nhất của PowerShell, và tên tiến trình hệ thống ở sai đường dẫn là kỹ thuật nguỵ trang kinh điển. Trình duyệt sinh ra tiến trình con cùng tên thì hoàn toàn bình thường — đó là kiến trúc đa tiến trình của Chrome, xuất hiện hàng triệu lần mỗi ngày. Chi tiết đáng chú ý ở phương án ba: **tên tiến trình một mình không đủ**, phải có đường dẫn đầy đủ và tốt nhất là cả hash. Đó là lý do cấu hình thu thập log tạo tiến trình phải lấy đủ trường ngay từ đầu.',
        },
        {
          id: 't6l8-q4',
          kind: 'truefalse',
          tags: ['log', 'do-luong'],
          q: 'Một mô hình đạt F1 = 0,96 trên bộ HDFS là bằng chứng tốt cho thấy nó sẽ hoạt động trên log bảo mật của bạn.',
          answer: false,
          why: 'Ba lý do độc lập khiến kết luận đó không đứng vững. Thứ nhất, nhãn của HDFS ở mức khối và phần lớn bất thường là lỗi vận hành hệ thống phân tán, không phải hành vi tấn công — hai phân phối khác nhau về bản chất. Thứ hai, nhiều đánh giá lại cho thấy các đường cơ sở rất đơn giản đạt kết quả tương đương trên chính bộ này, nghĩa là nó không còn phân biệt được phương pháp. Thứ ba, cách chia dữ liệu phổ biến trên bộ này làm rò rỉ thông tin thời gian. Kết luận thực dụng: dùng các benchmark để học kỹ thuật và gỡ lỗi cài đặt, còn quyết định kiến trúc thì phải dựa trên dữ liệu của chính bạn với cách chia theo thời gian.',
        },
        {
          id: 't6l8-q5',
          kind: 'input',
          tags: ['log', 'log-parsing'],
          q: 'Thuật toán phân tách log trực tuyến dùng cây độ sâu cố định, phân nhánh đầu tiên theo số lượng token, có thư viện Python phổ biến mang cùng tên kèm số 3 — tên nó là gì?',
          accept: ['drain', 'Drain', 'drain3', 'Drain3'],
          placeholder: 'Tên thuật toán…',
          hint: 'Năm chữ cái, nghĩa tiếng Anh là thoát nước.',
          why: 'Drain (He và cộng sự, 2017), với thư viện Drain3 được duy trì tích cực. Điểm thiết kế đáng học không phải cấu trúc cây mà là **giả định miền** mà nó dựa vào: lập trình viên viết chuỗi định dạng với phần chữ cố định ở đầu và tham số ở sau, nên các dòng cùng loại có cùng số token và giống nhau ở vài token đầu. Nhờ giả định đó, thuật toán chạy trực tuyến với chi phí gần như không đổi cho mỗi dòng. Đây là ví dụ đẹp cho một mẫu tư duy lặp đi lặp lại trong kỹ thuật: **một giả định miền đúng thường đáng giá hơn một mô hình mạnh hơn.**',
        },
      ],
      terms: ['log-parsing', 'bat-thuong', 'siem', 'attck', 'troi-du-lieu'],
      further: [
        {
          title: 'Drain: An Online Log Parsing Approach with Fixed Depth Tree — He và cộng sự (2017)',
          note: 'Ngắn, rõ, và ý tưởng đơn giản tới mức bạn cài đặt lại được trong một buổi. Đọc phần giả định thiết kế kỹ hơn phần thực nghiệm.',
        },
        {
          title: 'DeepLog: Anomaly Detection and Diagnosis from System Logs through Deep Learning — Du và cộng sự (CCS 2017)',
          note: 'Nguồn của ba lớp mô hình: chuỗi sự kiện, giá trị tham số, và mô hình luồng công việc. Kể cả khi bạn không dùng LSTM, cách phân rã bài toán ở đây vẫn đáng mượn.',
        },
        {
          title: 'LogHub — bộ sưu tập dữ liệu log',
          note: 'HDFS, BGL, Thunderbird, Hadoop và nhiều nguồn khác. Dùng để thực hành phân tách log; đọc kèm các bài đánh giá lại trước khi so sánh kết quả với bài báo.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't6-l9',
      trackId: 'ung-dung',
      title: 'Gian lận và chiếm đoạt tài khoản',
      subtitle: 'Mất cân bằng 1 trên 20.000, quyết định trong 80 mili-giây, và nhãn tới sau ba tháng',
      minutes: 31,
      practiceMinutes: 7,
      level: 'trung-cap',
      prereqs: ['t4-l4', 't6-l1'],
      why: {
        short:
          'Đây là bài toán ML bảo mật có vòng phản hồi tiền bạc rõ ràng nhất — mọi quyết định quy được ra đồng, nên nó là nơi tốt nhất để học cách gắn mô hình với chi phí thật thay vì với chỉ số đẹp.',
        scenario:
          'Nền tảng thương mại điện tử của bạn xử lý 900.000 lần đăng nhập và 140.000 giao dịch mỗi ngày. Tuần trước một đợt credential stuffing chiếm được 340 tài khoản; tuần này bộ phận chăm sóc khách hàng phàn nàn vì hệ thống chặn nhầm khách quen. Bạn phải thiết kế lại điểm chặn, và ngân sách trễ là 80 mili-giây.',
        roles: ['Security Data Scientist', 'ML Engineer', 'Detection Engineer', 'SOC Analyst'],
        costOfNotKnowing:
          'Bạn xây một mô hình nhị phân chặn hoặc cho qua ở ngưỡng 0,5, chặn nhầm 2% khách hàng giá trị cao trong ngày cao điểm, và mất nhiều tiền hơn toàn bộ số gian lận mà nó ngăn được.',
      },
      objectives: [
        'Xây được đặc trưng vận tốc (velocity) đúng về mặt thời gian, không rò rỉ thông tin tương lai',
        'Thiết kế ma trận chi phí phụ thuộc số tiền và suy ra ngưỡng theo giá trị kỳ vọng',
        'Giải thích được vì sao phản hồi ba mức thắng phản hồi nhị phân trong gian lận',
        'Nêu được hai vấn đề về nhãn đặc thù: nhãn đến muộn và thiên lệch do chính hệ thống chặn',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Mô hình chấm một giao dịch 4,2 triệu đồng với điểm rủi ro 0,62. Ngưỡng chặn của bạn đang là 0,80. Bạn cho qua hay chặn — và liệu đó có phải là hai lựa chọn duy nhất không?',
          reveal:
            'Cả hai lựa chọn đều tệ, và câu hỏi thứ hai mới là chỗ có tiền.\n\nCho qua: bạn chấp nhận rủi ro mất 4,2 triệu cộng phí bồi hoàn. Chặn: bạn có thể vừa đuổi một khách hàng thật, và giá trị vòng đời của một khách hàng thường lớn hơn nhiều so với một giao dịch.\n\nLựa chọn thứ ba tồn tại và nó là chuẩn mực của ngành: **tăng cường xác thực** (step-up authentication). Gửi mã một lần, yêu cầu sinh trắc học, kích hoạt 3-D Secure, hỏi một chi tiết chỉ chủ tài khoản biết. Chi phí: vài giây phiền toái cho khách thật, gần như bất khả thi cho kẻ tấn công đang dùng thông tin đăng nhập đánh cắp.\n\nĐiều này thay đổi hoàn toàn bài toán tối ưu. Thay vì một ngưỡng, bạn có **hai** ngưỡng và ba vùng: dưới 0,35 cho qua, từ 0,35 tới 0,85 tăng cường xác thực, trên 0,85 chặn. Vùng giữa — vùng mà mô hình phân vân nhất và cũng là vùng đông nhất — được xử lý bằng cách **mua thêm thông tin** thay vì đoán.\n\nBài học tổng quát vượt xa bài toán gian lận: **khi bạn thiết kế được một hành động có chi phí thấp cho người dùng thật và chi phí cao cho kẻ tấn công, hành động đó đáng giá hơn nhiều so với một mô hình chính xác hơn 2%.**',
        },
        { t: 'h', text: 'Bước 1 — Hình dạng của bài toán', level: 2 },
        { t: 'figure', id: 'fig-imbalance', caption: 'Gian lận nằm ở vùng mất cân bằng cực đoan. Ở tỉ lệ 1 trên 20.000, một thay đổi nhỏ ở tỉ lệ báo động giả tạo ra thay đổi lớn ở khối lượng ma sát mà khách hàng thật phải chịu.' },
        {
          t: 'table',
          head: ['Bài toán con', 'Tỉ lệ dương điển hình', 'Tín hiệu mạnh nhất', 'Ràng buộc trễ'],
          rows: [
            ['Chiếm đoạt tài khoản (ATO)', '1 trên 5.000 tới 1 trên 50.000 lần đăng nhập', 'Thiết bị lạ, ASN lạ, hành vi phiên khác hẳn', 'Dưới 100 ms'],
            ['Credential stuffing', 'Có thể chiếm phần lớn lưu lượng đăng nhập trong đợt tấn công', 'Vận tốc theo IP, ASN và dấu vân tay thiết bị', 'Dưới 50 ms, thường xử lý ở tầng biên'],
            ['Gian lận thanh toán', '0,1% tới 0,5% giao dịch', 'Vận tốc theo thẻ, không khớp địa chỉ, đồ thị chia sẻ thiết bị', 'Dưới 200 ms'],
            ['Tài khoản giả hàng loạt', 'Rất biến động, theo đợt', 'Đồ thị chia sẻ thiết bị, IP, số điện thoại; tốc độ điền form', 'Có thể xử lý lệch pha vài phút'],
            ['Lạm dụng khuyến mãi', 'Vài phần trăm', 'Quan hệ tài khoản, mẫu hành vi lặp lại', 'Có thể xử lý theo lô'],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Một bộ dữ liệu để thực hành',
          md: 'Bộ **Credit Card Fraud Detection** của nhóm nghiên cứu ULB (Bruxelles), phát hành trên Kaggle, chứa 284.807 giao dịch trong hai ngày với 492 giao dịch gian lận — tỉ lệ **0,172%**. Các đặc trưng V1 tới V28 đã qua PCA để bảo mật, chỉ còn `Time` và `Amount` ở dạng gốc.\n\nDùng nó để luyện phần **đo lường và chọn ngưỡng**: PR-AUC, precision@k, ngưỡng theo chi phí phụ thuộc `Amount`. Đừng dùng nó để luyện phần kỹ thuật đặc trưng — vì PCA đã xoá sạch ý nghĩa của từng cột, và trong công việc thật thì kỹ thuật đặc trưng chiếm phần lớn giá trị.',
        },
        { t: 'h', text: 'Bước 2 — Đặc trưng: bốn nhóm, xếp theo giá trị', level: 2 },
        {
          t: 'steps',
          title: 'Bốn nhóm đặc trưng cốt lõi',
          steps: [
            {
              title: 'Vận tốc (velocity) — nhóm mạnh nhất, gần như luôn đứng đầu bảng quan trọng',
              md: 'Đếm sự kiện trên một thực thể trong nhiều cửa sổ thời gian: số lần thử đăng nhập của cùng IP trong 1 phút / 1 giờ / 24 giờ; số tài khoản khác nhau mà một thiết bị chạm tới trong 24 giờ; số giao dịch của cùng thẻ trong 10 phút; số thẻ khác nhau dùng trên cùng thiết bị trong 7 ngày.\n\nVì sao mạnh: gian lận có lợi nhuận theo quy mô. Một kẻ tấn công thử một tài khoản thì không đáng công; họ thử hàng chục nghìn. **Quy mô là thứ họ cần và cũng là thứ để lại dấu vết.**',
            },
            {
              title: 'Thiết bị và mạng',
              md: 'Dấu vân tay thiết bị (tổ hợp phiên bản trình duyệt, độ phân giải, phông chữ, múi giờ, ngôn ngữ), vân tay TLS, ASN của địa chỉ IP và loại ASN đó (nhà mạng dân dụng, trung tâm dữ liệu, mạng riêng ảo, Tor), độ lệch giữa múi giờ trình duyệt và vị trí địa lý của IP, thiết bị này đã từng dùng tài khoản này chưa.\n\nBẫy: đừng dùng địa chỉ IP thô làm đặc trưng phân loại. Nó thay đổi liên tục và tạo ra quá khớp nghiêm trọng. Dùng ASN, dùng loại mạng, dùng độ hiếm — không dùng chuỗi IP.',
            },
            {
              title: 'Hành vi phiên',
              md: 'Thời gian điền form (bot điền trong 0,3 giây, người mất 12 giây), có dán mật khẩu từ bộ nhớ tạm không, quỹ đạo di chuyển chuột, thứ tự trường được điền, có sửa lại trường nào không, thời gian giữa lúc đăng nhập và lúc đổi email hoặc số điện thoại.\n\nĐặc trưng cuối rất mạnh trong ATO: kẻ chiếm tài khoản gần như luôn đổi thông tin liên lạc ngay sau khi vào được, để chủ tài khoản không nhận được cảnh báo.',
            },
            {
              title: 'Quan hệ đồ thị',
              md: 'Dựng đồ thị hai phía giữa tài khoản và các định danh chung: thiết bị, IP, số điện thoại, địa chỉ giao hàng, phương thức thanh toán. Đặc trưng: số tài khoản trong cùng thành phần liên thông, số tài khoản trong đó đã bị đánh dấu gian lận, bậc của nút.\n\nĐây là cách hiệu quả nhất để bắt **gian lận theo băng nhóm**: 200 tài khoản trông hoàn hảo khi xét riêng lẻ, nhưng cùng chia sẻ 6 thiết bị và 3 địa chỉ giao hàng.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Rò rỉ thời gian: cách phổ biến nhất để tự lừa mình trong bài toán gian lận',
          md: 'Đặc trưng vận tốc phải được tính **đúng tại thời điểm ra quyết định**, chỉ dùng dữ liệu đã tồn tại trước đó. Nghe hiển nhiên, nhưng đây là lỗi hay gặp nhất:\n\n**Sai:** tính "số giao dịch của thẻ này trong ngày" bằng một phép `groupby` trên toàn bộ bảng. Với giao dịch lúc 9 giờ sáng, con số đó đã bao gồm cả các giao dịch lúc 3 giờ chiều — thông tin từ tương lai. Mô hình đạt AUC 0,99 trong thí nghiệm và sụp hoàn toàn khi triển khai.\n\n**Đúng:** cửa sổ trượt có chặn phải, chỉ đếm các sự kiện **nghiêm ngặt trước** thời điểm hiện tại.\n\nTrong hệ thống sản xuất, đây là lý do tồn tại của **feature store**: cùng một định nghĩa đặc trưng được dùng cho cả huấn luyện ngoại tuyến (đọc lại lịch sử theo đúng mốc thời gian) và cho suy luận trực tuyến (đọc từ bộ đệm). Hai đường tính đặc trưng khác nhau là nguồn gốc của **lệch huấn luyện–phục vụ** (training-serving skew), và nó âm thầm hơn rất nhiều so với một lỗi rõ ràng.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Đặc trưng vận tốc đúng về mặt thời gian',
          code:
            "import pandas as pd\n" +
            "\n" +
            "df = df.sort_values('thoi_gian')\n" +
            "\n" +
            "def dem_truoc_do(nhom, cua_so):\n" +
            "    # closed='left' loai bo CHINH giao dich hien tai khoi cua so\n" +
            "    # -> khong bao gio dung thong tin cua tuong lai hay cua chinh no\n" +
            "    s = nhom.set_index('thoi_gian')['so_tien']\n" +
            "    return s.rolling(cua_so, closed='left').count()\n" +
            "\n" +
            "for cua_so in ('10min', '1h', '24h'):\n" +
            "    df['vel_the_' + cua_so] = (\n" +
            "        df.groupby('the_id', group_keys=False)\n" +
            "          .apply(lambda g: dem_truoc_do(g, cua_so))\n" +
            "          .values)\n" +
            "\n" +
            "# Kiem tra bat buoc: voi giao dich dau tien cua moi the, moi cot velocity\n" +
            "# phai bang 0. Neu khong, ban dang ro ri thong tin tuong lai.\n" +
            "dau_tien = df.groupby('the_id').head(1)\n" +
            "assert (dau_tien[['vel_the_10min', 'vel_the_1h', 'vel_the_24h']] == 0).all().all()\n",
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't6l9-cp1',
              kind: 'mcq',
              tags: ['gian-lan', 'ro-ri-du-lieu'],
              q: 'Bạn tính đặc trưng "số giao dịch của thẻ này trong ngày" bằng groupby trên toàn bảng rồi ghép vào từng dòng. Vấn đề gì?',
              options: [
                'Không có vấn đề gì nếu dữ liệu đã sắp xếp theo thời gian',
                'Đặc trưng chứa thông tin từ các giao dịch xảy ra SAU thời điểm ra quyết định',
                'Phép tính quá chậm với dữ liệu lớn',
                'Cần chuẩn hoá lại đặc trưng sau khi đếm',
              ],
              answer: 1,
              why: 'Đây là **rò rỉ thời gian**, và nó tinh vi vì mã trông hoàn toàn bình thường. Với giao dịch lúc 9 giờ sáng, con số "trong ngày" đã bao gồm giao dịch lúc 3 giờ chiều — thứ chưa tồn tại khi bạn phải quyết định. Hậu quả đặc biệt nghiêm trọng trong gian lận, vì các giao dịch gian lận thường đi thành cụm: một thẻ bị đánh cắp sẽ có nhiều giao dịch trong cùng ngày. Mô hình học được luật "thẻ có nhiều giao dịch trong ngày là gian lận" và đạt kết quả tuyệt vời trong phòng lab, nhưng lúc chạy thật thì giao dịch đầu tiên của cụm — cái duy nhất bạn còn cơ hội chặn — lại có velocity bằng 0.',
              distractorWhy: [
                'Sắp xếp không giải quyết gì; vấn đề nằm ở phạm vi của phép gộp, không ở thứ tự.',
                '',
                'Tốc độ không phải vấn đề chính ở đây, dù cửa sổ trượt đúng cách cũng tốn hơn.',
                'Chuẩn hoá không liên quan tới việc đặc trưng chứa thông tin tương lai.',
              ],
            },
            {
              id: 't6l9-cp2',
              kind: 'truefalse',
              tags: ['gian-lan', 'nhan'],
              q: 'Có thể đánh giá mô hình gian lận trên dữ liệu của tháng vừa rồi ngay khi tháng đó kết thúc.',
              answer: false,
              why: 'Nhãn gian lận thanh toán đến từ **bồi hoàn** (chargeback), và quy trình đó thường kéo dài từ vài tuần tới vài tháng kể từ ngày giao dịch. Dữ liệu tháng vừa rồi mới chỉ có một phần nhỏ nhãn dương thực sự xuất hiện, nên mọi con số recall bạn tính đều bị thổi phồng một cách giả tạo — bạn đang chia cho một mẫu số chưa đầy đủ. Khái niệm cần nhớ là **độ chín của nhãn** (label maturity): chỉ đánh giá trên các kỳ đã đủ thời gian để nhãn ổn định, và luôn ghi rõ ngày chốt nhãn kèm mọi con số bạn báo cáo.',
            },
          ],
        },
        { t: 'h', text: 'Bước 3 — Chi phí lệch và ngưỡng theo giá trị kỳ vọng', level: 2 },
        {
          t: 'p',
          md: 'Trong gian lận, chi phí không cố định mà **phụ thuộc vào từng giao dịch**. Chặn nhầm một giao dịch 200 nghìn đồng khác hẳn chặn nhầm một giao dịch 40 triệu của khách hàng lâu năm. Vì vậy ngưỡng cố định là sai về nguyên tắc, và cách đúng là so sánh giá trị kỳ vọng của từng hành động.',
        },
        {
          t: 'table',
          head: ['Hành động', 'Nếu giao dịch là gian lận', 'Nếu giao dịch là hợp lệ'],
          rows: [
            ['Cho qua', 'Mất số tiền + phí bồi hoàn + rủi ro vượt ngưỡng chương trình giám sát của tổ chức thẻ', 'Doanh thu bình thường, không ma sát'],
            ['Tăng cường xác thực', 'Gần như luôn chặn được, chi phí gửi mã rất nhỏ', 'Khách chịu vài giây phiền toái, một tỉ lệ nhỏ bỏ giỏ hàng'],
            ['Chặn', 'Ngăn được thiệt hại', 'Mất giao dịch, mất một phần giá trị vòng đời khách hàng, tăng cuộc gọi hỗ trợ'],
          ],
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Công thức quyết định',
          md: 'Với xác suất gian lận `p`, số tiền `A`, phí bồi hoàn `F`, biên lợi nhuận `m`, xác suất khách bỏ giỏ khi bị yêu cầu xác thực thêm `q`, và chi phí gửi mã `c`:\n\n**Cho qua:** thiệt hại kỳ vọng = `p × (A + F) − (1 − p) × m × A`\n**Tăng cường:** thiệt hại kỳ vọng ≈ `c + (1 − p) × q × m × A`\n**Chặn:** thiệt hại kỳ vọng = `(1 − p) × (m × A + L)`, với `L` là phần giá trị vòng đời bị mất.\n\nChọn hành động có thiệt hại kỳ vọng nhỏ nhất. Hai điểm giao nhau giữa ba đường này chính là hai ngưỡng của bạn — và chú ý rằng chúng **dịch chuyển theo `A`**. Giao dịch càng lớn thì vùng tăng cường xác thực càng rộng, vì thiệt hại của cả hai sai lầm đều lớn hơn và việc mua thêm thông tin càng đáng giá.',
        },
        {
          t: 'lab',
          id: 'lab-cost-threshold',
          intro: 'Vặn chi phí bỏ sót, chi phí chặn nhầm và tỉ lệ nền, xem ngưỡng tối ưu chạy đi đâu. Chú ý điều xảy ra khi bạn tăng chi phí chặn nhầm lên gấp mười.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Tỉ lệ bồi hoàn là một ràng buộc cứng, không phải một chỉ số',
          md: 'Các tổ chức thẻ vận hành chương trình giám sát người bán: nếu tỉ lệ bồi hoàn vượt ngưỡng quy định trong nhiều tháng liên tiếp, người bán bị phạt và trong trường hợp xấu có thể mất khả năng chấp nhận thanh toán.\n\nHệ quả với thiết kế mô hình: đây không phải một số hạng trong hàm mục tiêu mà là một **ràng buộc**. Bài toán của bạn trở thành "tối đa hoá doanh thu được duyệt **với điều kiện** tỉ lệ bồi hoàn dưới ngưỡng", chứ không phải "tối thiểu hoá tổng thiệt hại". Hai cách phát biểu cho ra hai ngưỡng khác nhau, và nhiều đội dữ liệu chỉ phát hiện ra khác biệt này sau khi bộ phận rủi ro gõ cửa.',
        },
        { t: 'h', text: 'Bước 4 — Vấn đề nhãn: muộn và thiên lệch', level: 2 },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Nhãn đến muộn.** Bồi hoàn xuất hiện sau vài tuần tới vài tháng. Đối sách: dùng nhãn thay thế đến sớm hơn cho việc theo dõi hằng ngày — khách hàng báo cáo, đội rủi ro xác nhận thủ công, tài khoản bị đổi thông tin liên lạc rồi rút tiền — và chỉ dùng nhãn bồi hoàn cho đánh giá chính thức trên các kỳ đã chín.',
            '**Thiên lệch do chính hệ thống.** Giao dịch bạn đã chặn không bao giờ có kết quả thật. Bạn chỉ quan sát được hậu quả của những giao dịch mình cho qua, nên dữ liệu huấn luyện của kỳ sau bị cắt xén một cách có hệ thống ở đúng vùng mô hình tự tin nhất. Đây là **thiên lệch chọn mẫu** (selection bias), và trong ngành tín dụng người ta gọi bài toán ước lượng phần bị cắt là **reject inference**.',
            '**Đối sách chuẩn: cho qua một tỉ lệ nhỏ có kiểm soát.** Cố ý cho qua khoảng 1–2% các giao dịch mà mô hình muốn chặn, có giới hạn số tiền, để thu về nhãn thật ở vùng điểm cao. Chi phí là một khoản thiệt hại nhỏ có kiểm soát; lợi ích là mô hình của bạn không bị mù dần ở chính vùng quan trọng nhất. Đây là cùng ý tưởng với khai phá và khai thác trong bài toán bandit.',
            '**Vòng lặp tự xác nhận.** Nếu bạn gắn nhãn dựa trên việc hệ thống hiện tại có chặn hay không, mô hình mới sẽ học cách bắt chước hệ thống cũ, kể cả các điểm mù của nó. Nhãn phải đến từ kết quả thật ngoài đời, không từ quyết định của chính hệ thống.',
          ],
        },
        { t: 'h', text: 'Bước 5 — Triển khai trong 80 mili-giây', level: 2 },
        {
          t: 'checklist',
          title: 'Những gì phải có trong đường suy luận trực tuyến',
          items: [
            'Kho đặc trưng trực tuyến trong bộ nhớ (thường là Redis) chứa các bộ đếm vận tốc, cập nhật theo luồng — không truy vấn cơ sở dữ liệu giao dịch trong đường xử lý chính.',
            'Cùng một đoạn mã định nghĩa đặc trưng dùng cho cả huấn luyện và phục vụ; mọi bản sao chép định nghĩa là một nguồn lệch huấn luyện–phục vụ.',
            'Mô hình cây tăng cường đủ nhỏ để suy luận dưới 10 ms; phần lớn ngân sách trễ nằm ở khâu lấy đặc trưng, không ở mô hình.',
            'Đường dự phòng: nếu kho đặc trưng không phản hồi trong 30 ms, dùng bộ luật đơn giản thay vì để giao dịch treo.',
            'Ghi lại toàn bộ vector đặc trưng đã dùng cho mỗi quyết định — nếu không, bạn sẽ không bao giờ tái hiện được vì sao một giao dịch bị chặn.',
            'Luật cứng chạy song song mô hình cho các trường hợp rõ ràng, để không phụ thuộc hoàn toàn vào một mô hình có thể xuống cấp.',
          ],
        },
        { t: 'h', text: 'Bước 6 — Kẻ tấn công né thế nào', level: 2 },
        {
          t: 'table',
          head: ['Kỹ thuật', 'Vô hiệu hoá đặc trưng nào', 'Đối sách'],
          rows: [
            [
              'Proxy dân dụng phân tán: một yêu cầu trên mỗi địa chỉ IP',
              'Toàn bộ vận tốc theo IP',
              'Chuyển vận tốc lên cấp ASN, cấp dải mạng, cấp vân tay thiết bị và cấp hành vi phiên',
            ],
            [
              'Trình duyệt chống nhận dạng: mỗi phiên một vân tay khác',
              'Vân tay thiết bị',
              'Chính sự bất thường của vân tay là tín hiệu; tổ hợp phông chữ và múi giờ hiếm gặp thì tự nó đã hiếm',
            ],
            [
              'Chậm và ít: 3 lần thử mỗi giờ trên mỗi tài khoản',
              'Ngưỡng vận tốc cửa sổ ngắn',
              'Mở rộng cửa sổ lên 7 ngày và 30 ngày; dùng đồ thị quan hệ để nối các phiên rời rạc',
            ],
            [
              'Thử thẻ bằng giao dịch nhỏ (card testing) trước khi tiêu thật',
              'Ngưỡng theo số tiền',
              'Đặc trưng riêng cho giao dịch giá trị rất nhỏ và cho mẫu nhiều lần thử liên tiếp trên nhiều thẻ',
            ],
            [
              'Tài khoản trung gian nuôi trước hàng tháng',
              'Đặc trưng tuổi tài khoản và lịch sử',
              'Đồ thị dòng tiền và quan hệ nhận hàng; hành vi bất thường tại thời điểm kích hoạt',
            ],
            [
              'Tấn công AiTM lấy cookie phiên, vượt qua cả MFA',
              'Tăng cường xác thực dựa trên mã một lần',
              'Ràng buộc token vào thiết bị, khoá truy cập chống lừa đảo theo chuẩn FIDO2, và phát hiện token dùng lại từ hai địa điểm',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Điều làm bài toán gian lận khác mọi bài khác trong chặng này',
          md: 'Vòng phản hồi ngắn và tính bằng tiền. Bạn biết chính xác mình mất bao nhiêu khi sai, và biết trong vài tuần chứ không phải vài năm. Đó là điều kiện lý tưởng cho ML, và cũng là lý do các đội gian lận thường là đội trưởng thành nhất về mặt vận hành mô hình trong một công ty.\n\nĐổi lại, đối thủ ở đây thích nghi nhanh nhất trong tất cả các bài toán bạn đã học: họ đo hiệu quả bằng tiền, thử nghiệm liên tục, và biết ngay khi một cách làm không còn ăn. Thời gian nửa đời của một đặc trưng gian lận tốt thường tính bằng **tháng**.\n\nHệ quả kiến trúc rất cụ thể: đừng tối ưu để có mô hình tốt nhất hôm nay. Hãy tối ưu để **rút ngắn thời gian từ khi phát hiện một mẫu tấn công mới tới khi đặc trưng chống lại nó chạy trong sản xuất**. Một đội đưa được đặc trưng mới lên trong hai ngày sẽ thắng một đội có mô hình tốt hơn nhưng mất sáu tuần cho mỗi lần thay đổi.',
        },
        { t: 'terms', ids: ['mat-can-bang', 'nguong', 'ro-ri-du-lieu', 'training-serving-skew', 'hieu-chuan'] },
      ],
      keyTakeaways: [
        'Phản hồi ba mức — cho qua, tăng cường xác thực, chặn — thắng phản hồi nhị phân, vì vùng phân vân được xử lý bằng cách mua thêm thông tin thay vì đoán.',
        'Đặc trưng vận tốc là nhóm mạnh nhất vì gian lận cần quy mô mới có lợi nhuận, và quy mô luôn để lại dấu vết.',
        'Đặc trưng vận tốc phải tính bằng cửa sổ trượt loại trừ chính sự kiện hiện tại; groupby trên toàn bảng là rò rỉ thời gian kinh điển.',
        'Chi phí phụ thuộc số tiền, nên ngưỡng phải suy từ giá trị kỳ vọng của từng hành động và dịch chuyển theo giá trị giao dịch.',
        'Tỉ lệ bồi hoàn là ràng buộc cứng của bài toán tối ưu, không phải một số hạng trong hàm mục tiêu.',
        'Nhãn đến muộn hàng tháng và bị cắt xén bởi chính quyết định chặn của bạn — cần nhãn thay thế và một tỉ lệ nhỏ cho qua có kiểm soát.',
        'Phần lớn ngân sách trễ nằm ở khâu lấy đặc trưng chứ không ở mô hình; kho đặc trưng trực tuyến quyết định kiến trúc.',
        'Đối thủ ở đây thích nghi nhanh nhất — hãy tối ưu tốc độ đưa đặc trưng mới lên sản xuất, không tối ưu mô hình của hôm nay.',
      ],
      cards: [
        {
          id: 't6l9-c1',
          front: 'Vì sao phản hồi ba mức thắng phản hồi nhị phân trong phát hiện gian lận?',
          back: 'Vì vùng điểm giữa là vùng đông nhất và mô hình phân vân nhất. Tăng cường xác thực có chi phí thấp cho khách thật và gần như bất khả thi cho kẻ dùng thông tin đánh cắp — tức là mua thêm thông tin thay vì đoán.',
          tags: ['gian-lan', 'nguong'],
        },
        {
          id: 't6l9-c2',
          front: 'Vì sao đặc trưng vận tốc (velocity) là nhóm mạnh nhất trong gian lận?',
          back: 'Vì gian lận chỉ có lợi nhuận theo quy mô: kẻ tấn công phải thử hàng chục nghìn lần. Quy mô là thứ họ cần và cũng chính là thứ để lại dấu vết đếm được.',
          tags: ['gian-lan', 'dac-trung'],
        },
        {
          id: 't6l9-c3',
          front: 'Cách tính đặc trưng vận tốc nào gây rò rỉ thời gian, và cách đúng là gì?',
          back: 'Sai: groupby đếm toàn bộ giao dịch trong ngày, gồm cả giao dịch xảy ra sau. Đúng: cửa sổ trượt theo thời gian có chặn phải, loại trừ chính sự kiện hiện tại (rolling với closed left).',
          tags: ['gian-lan', 'ro-ri-du-lieu'],
        },
        {
          id: 't6l9-c4',
          front: 'Độ chín của nhãn (label maturity) trong gian lận nghĩa là gì?',
          back: 'Nhãn gian lận đến từ bồi hoàn, xuất hiện sau vài tuần tới vài tháng. Chỉ được đánh giá trên các kỳ đã đủ thời gian để nhãn ổn định, và luôn ghi rõ ngày chốt nhãn kèm con số báo cáo.',
          tags: ['gian-lan', 'nhan'],
        },
        {
          id: 't6l9-c5',
          front: 'Vì sao phải cố ý cho qua 1–2% giao dịch mà mô hình muốn chặn?',
          back: 'Vì giao dịch bị chặn không bao giờ có nhãn thật, nên dữ liệu bị cắt xén đúng ở vùng mô hình tự tin nhất. Cho qua có kiểm soát thu về nhãn ở vùng điểm cao, tránh cho mô hình mù dần.',
          tags: ['gian-lan', 'nhan'],
        },
        {
          id: 't6l9-c6',
          front: 'Kẻ tấn công dùng proxy dân dụng một yêu cầu mỗi IP. Đặc trưng nào còn dùng được?',
          back: 'Vận tốc ở cấp cao hơn: ASN, dải mạng, vân tay thiết bị, hành vi phiên (tốc độ điền form), và đồ thị quan hệ giữa các tài khoản qua thiết bị hoặc địa chỉ giao hàng chung.',
          tags: ['gian-lan', 'ne-tranh'],
        },
      ],
      quiz: [
        {
          id: 't6l9-q1',
          kind: 'mcq',
          tags: ['gian-lan', 'nguong'],
          q: 'Mô hình chấm 0,62 cho một giao dịch lớn, ngưỡng chặn là 0,80. Thiết kế hệ thống tốt nhất làm gì?',
          options: [
            'Cho qua vì dưới ngưỡng',
            'Chặn vì điểm khá cao và số tiền lớn',
            'Kích hoạt tăng cường xác thực, vì nó rẻ cho khách thật và rất đắt cho kẻ tấn công',
            'Hạ ngưỡng chặn xuống 0,60 cho mọi giao dịch',
          ],
          answer: 2,
          why: 'Cả cho qua lẫn chặn đều là quyết định dứt khoát trên một điểm số thể hiện sự phân vân. Tăng cường xác thực thay đổi bản chất bài toán: thay vì đoán dựa trên thông tin hiện có, bạn **mua thêm thông tin** với chi phí vài giây cho khách thật. Đây cũng là lý do bảng chi phí phải có ba hàng chứ không phải hai. Hạ ngưỡng cho mọi giao dịch thì làm tăng mạnh số lần chặn nhầm ở phân khúc giao dịch nhỏ, nơi giá trị kỳ vọng không biện minh được cho ma sát đó — chi phí phụ thuộc số tiền nên ngưỡng cũng phải phụ thuộc số tiền.',
          distractorWhy: [
            'Cho qua bỏ mất cơ hội xác minh với chi phí rất thấp.',
            'Chặn khách thật gây thiệt hại lớn hơn nhiều so với một giao dịch, vì mất cả giá trị vòng đời.',
            '',
            'Ngưỡng cố định cho mọi số tiền là sai nguyên tắc khi chi phí sai phụ thuộc vào số tiền.',
          ],
        },
        {
          id: 't6l9-q2',
          kind: 'multi',
          tags: ['gian-lan', 'nhan'],
          q: 'Vấn đề nào đặc thù cho nhãn trong bài toán gian lận? (Chọn tất cả đáp án đúng)',
          options: [
            'Nhãn bồi hoàn đến sau vài tuần tới vài tháng nên kỳ gần nhất chưa đủ chín để đánh giá',
            'Giao dịch bị chặn không bao giờ có kết quả thật nên dữ liệu bị cắt xén ở vùng điểm cao',
            'Gắn nhãn theo quyết định của hệ thống hiện tại khiến mô hình mới học lại chính điểm mù của hệ thống cũ',
            'Nhãn gian lận luôn chính xác tuyệt đối vì có bằng chứng tài chính',
          ],
          answers: [0, 1, 2],
          why: 'Ba vấn đề đầu tạo thành bộ ba kinh điển của bài toán gian lận và cần ba đối sách khác nhau: nhãn thay thế đến sớm cho theo dõi hằng ngày, cho qua có kiểm soát để lấp vùng bị cắt, và nguyên tắc nhãn phải đến từ kết quả ngoài đời chứ không từ quyết định của hệ thống. Ý cuối sai: nhãn bồi hoàn cũng có nhiễu đáng kể — có những vụ khách hàng khiếu nại giao dịch hợp lệ (friendly fraud), có gian lận thật không bao giờ bị khiếu nại, và có tranh chấp vì lý do dịch vụ chứ không phải vì gian lận.',
        },
        {
          id: 't6l9-q3',
          kind: 'order',
          tags: ['gian-lan', 'quy-trinh'],
          q: 'Sắp xếp các bước xây hệ thống chống chiếm đoạt tài khoản theo thứ tự nên làm.',
          items: [
            'Xác định ba hành động có thể thực hiện và chi phí của từng hành động',
            'Xây đặc trưng vận tốc và thiết bị với cửa sổ trượt đúng về mặt thời gian',
            'Huấn luyện mô hình và đo bằng PR-AUC trên tập chia theo thời gian',
            'Suy hai ngưỡng từ giá trị kỳ vọng, phụ thuộc vào số tiền giao dịch',
            'Chạy chế độ bóng để đo khối lượng ma sát thật trên khách hàng',
            'Bật dần theo phân khúc và giữ một tỉ lệ nhỏ cho qua có kiểm soát để thu nhãn',
          ],
          why: 'Bước đầu quyết định toàn bộ phần còn lại: nếu bạn chỉ có hai hành động thì mọi thiết kế sau đó bị ép vào một ngưỡng duy nhất, và bạn mất luôn cách giải quyết vùng phân vân. Ngưỡng đứng sau mô hình vì nó cần phân phối điểm số thật. Chế độ bóng đứng trước khi bật vì ma sát tác động lên khách hàng thật, thứ mà bạn không thể thử sai. Bước cuối gắn liền với vấn đề nhãn bị cắt xén: nếu bỏ nó, mô hình của bạn sẽ mù dần ở đúng vùng điểm cao trong vài kỳ huấn luyện lại.',
        },
        {
          id: 't6l9-q4',
          kind: 'truefalse',
          tags: ['gian-lan', 'trien-khai'],
          q: 'Trong hệ thống chấm điểm gian lận thời gian thực, phần lớn ngân sách trễ bị tiêu bởi việc chạy mô hình.',
          answer: false,
          why: 'Một mô hình cây tăng cường với vài trăm cây chạy trong khoảng 1–10 mili-giây trên CPU. Thứ tiêu hết ngân sách là khâu **lấy đặc trưng**: đọc bộ đếm vận tốc, tra dấu vân tay thiết bị, truy vấn đồ thị quan hệ, gọi dịch vụ tra cứu ASN. Đó là lý do kiến trúc gian lận thời gian thực xoay quanh kho đặc trưng trực tuyến trong bộ nhớ chứ không xoay quanh việc tối ưu mô hình. Hệ quả thực dụng: nếu bạn cần giảm trễ, hãy cắt số lần gọi ra ngoài và gộp truy vấn, đừng cắt số cây trong mô hình — cắt cây làm giảm chất lượng mà gần như không cải thiện trễ.',
        },
        {
          id: 't6l9-q5',
          kind: 'input',
          tags: ['gian-lan', 'training-serving-skew'],
          q: 'Đặc trưng được tính bằng một đoạn mã pandas khi huấn luyện và bằng một đoạn mã Java khác khi phục vụ trực tuyến. Hiện tượng sai lệch giữa hai đường tính này gọi là gì?',
          accept: ['training serving skew', 'training-serving skew', 'lech huan luyen phuc vu', 'lệch huấn luyện phục vụ', 'lech huan luyen - phuc vu'],
          placeholder: 'Tên hiện tượng…',
          hint: 'Ba từ tiếng Anh, nói về khác biệt giữa lúc huấn luyện và lúc phục vụ.',
          why: 'Lệch huấn luyện–phục vụ (training-serving skew). Nó nguy hiểm vì âm thầm: mô hình vẫn chạy, vẫn trả về điểm số, không có lỗi nào trong nhật ký, chỉ là hiệu năng thấp hơn kỳ vọng mà không ai giải thích được. Nguyên nhân thường rất nhỏ: múi giờ khác nhau, cách xử lý giá trị thiếu khác nhau, làm tròn khác nhau, hoặc một cửa sổ tính là 24 giờ ở một bên và 1 ngày lịch ở bên kia. Hai đối sách chuẩn: dùng chung một định nghĩa đặc trưng cho cả hai đường (đó chính là lý do feature store tồn tại), và ghi lại vector đặc trưng đã dùng lúc phục vụ rồi định kỳ so với vector tính lại ngoại tuyến trên cùng sự kiện.',
        },
      ],
      terms: ['mat-can-bang', 'nguong', 'ro-ri-du-lieu', 'training-serving-skew', 'hieu-chuan'],
      further: [
        {
          title: 'Credit Card Fraud Detection Dataset — Nhóm Machine Learning Group, ULB',
          note: '284.807 giao dịch với 492 gian lận (0,172%). Dùng để luyện đo lường và chọn ngưỡng theo chi phí; không dùng để luyện kỹ thuật đặc trưng vì các cột đã qua PCA.',
        },
        {
          title: 'Calibrating Probability with Undersampling for Unbalanced Classification — Dal Pozzolo và cộng sự (2015)',
          note: 'Viết trong đúng bối cảnh gian lận thẻ. Nguồn của công thức hiệu chỉnh xác suất sau khi hạ mẫu, cần thiết nếu bạn muốn dùng ngưỡng theo giá trị kỳ vọng.',
        },
        {
          title: 'Reproducible Machine Learning for Credit Card Fraud Detection — Le Borgne và cộng sự',
          note: 'Sách thực hành trực tuyến với mã nguồn đầy đủ, bao gồm cách xây đặc trưng vận tốc đúng về mặt thời gian và cách đánh giá khi nhãn đến muộn.',
        },
      ],
    },
  ],
};
