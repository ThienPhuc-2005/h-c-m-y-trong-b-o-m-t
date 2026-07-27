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
  icon: '🎯',
  hue: 'orange',
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
      minutes: 19,
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
          md: 'Bắt đầu bằng con số của tình huống. 120.000 thư/ngày, giả sử tỉ lệ phishing lọt qua lớp lọc thương mại là 1 trên 20.000 — tức khoảng **6 thư độc mỗi ngày**. Ngân sách của bạn là 50 cảnh báo/ngày. Nghĩa là bạn cần precision tối thiểu quanh 12% ở mức cảnh báo đó, và tỉ lệ báo động giả (false positive rate) phải dưới **0,04%**. Mọi quyết định kỹ thuật phía sau đều bị hai con số này ràng buộc.',
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
            ['Precision ở mức 50 cảnh báo/ngày', 'Cứ 10 cảnh báo thì mấy cái đáng xem', 'Trên 0,15 là chấp nhận được để bắt đầu'],
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
      minutes: 20,
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
              '1,1 triệu tệp PE, 2.381 đặc trưng đã trích sẵn',
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
        'EMBER cung cấp 2.381 đặc trưng chia thành tám nhóm; nhóm imports gần với hành vi bắt buộc của mã độc nhất nên đắt giá nhất.',
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
      minutes: 20,
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
      minutes: 18,
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

    /* __CHEN_BAI_TIEP__ */
  ],
};
