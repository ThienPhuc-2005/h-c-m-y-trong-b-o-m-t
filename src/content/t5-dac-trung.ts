import type { Track } from './types';

/**
 * CHẶNG 5 — Kỹ thuật đặc trưng cho bảo mật.
 *
 * Đây là chặng mà kiến thức bảo mật quan trọng hơn kiến thức thuật toán.
 * Mọi bài đều xoay quanh một câu hỏi duy nhất: kẻ tấn công phải trả bao nhiêu
 * để làm đặc trưng này vô dụng? Trả lời được câu đó, bạn thiết kế được hệ thống
 * sống sót qua nhiều năm thay vì nhiều tuần.
 */
export const track5: Track = {
  id: 'dac-trung',
  order: 5,
  title: 'Kỹ thuật đặc trưng cho bảo mật',
  tagline: 'Nơi kiến thức bảo mật đánh bại kiến thức thuật toán',
  icon: 'dna',
  hue: 't5',
  blurb:
    'Sáu bài về phần quyết định thành bại nhiều hơn cả việc chọn thuật toán: bạn đưa gì vào mô hình. Đây cũng là chặng duy nhất mà hiểu biết về kẻ tấn công quan trọng hơn hiểu biết về toán — người biết mã độc PHẢI làm gì để sống sót sẽ thiết kế đặc trưng tốt hơn người thuộc lòng mười thuật toán.',
  outcomes: [
    'Chấm điểm chi phí né tránh cho bất kỳ đặc trưng nào và loại đặc trưng bề mặt ra trước khi nó vào mô hình',
    'Trích xuất bộ đặc trưng đầy đủ cho URL, tên miền và email, kể cả SPF/DKIM/DMARC, punycode và tuổi tên miền tính point-in-time',
    'Biến một tệp PE thành vector số theo đúng cách EMBER làm, và giải thích được vì sao từng nhóm đặc trưng tồn tại',
    'Xây đặc trưng beaconing, tỉ lệ byte và dấu vân tay TLS từ log luồng mạng đã mã hoá hoàn toàn',
    'Thiết kế đường cơ sở hành vi theo từng người và theo nhóm ngang hàng, mã hoá thời gian tuần hoàn đúng cách, không sập bẫy múi giờ',
    'Chọn đúng giữa TF-IDF n-gram ký tự, hashing trick và embedding cho log và dòng lệnh — kể cả khi câu trả lời là "không cần embedding"',
  ],
  lessons: [
    /* ====================================================================== */
    {
      id: 't5-l1',
      trackId: 'dac-trung',
      title: 'Nguyên tắc thiết kế đặc trưng chống né tránh',
      subtitle: 'Ba câu hỏi bạn phải trả lời cho mỗi đặc trưng trước khi nó được phép vào mô hình',
      minutes: 18,
      level: 'trung-cap',
      prereqs: ['t2-l6', 't3-l1'],
      why: {
        short:
          'Trong bảo mật, chất lượng đặc trưng quyết định kết quả nhiều hơn lựa chọn thuật toán — và một đặc trưng sai còn tệ hơn không có đặc trưng, vì nó cho bạn con số đẹp rồi sụp đổ đúng lúc gặp kẻ tấn công thật.',
        scenario:
          'Mô hình chấm điểm phishing của bạn chạy tốt 4 tháng. Tuần này tỉ lệ phát hiện tụt từ 91% xuống 34% trong ba ngày, không ai đổi một dòng mã nào. Bạn có một buổi chiều để tìm ra đặc trưng nào vừa bị vô hiệu hoá và quyết định thay bằng gì.',
        roles: ['Detection Engineer', 'Security Data Scientist', 'Threat Hunter', 'ML Engineer'],
        costOfNotKnowing:
          'Bạn xây mô hình có tuổi thọ vài tuần, phải huấn luyện lại liên tục mà không hiểu vì sao, và tệ nhất là bạn không phân biệt được giữa "mô hình yếu" với "mô hình đã bị đọc vị" — hai vấn đề cần hai cách chữa hoàn toàn khác nhau.',
      },
      objectives: [
        'Chấm điểm chi phí né tránh cho một đặc trưng bất kỳ dựa trên bất biến của cuộc tấn công',
        'Đo độ ổn định theo thời gian của đặc trưng bằng PSI và đọc đúng ngưỡng cảnh báo',
        'Phát hiện năm dạng đặc trưng rò rỉ tương lai đặc thù của dữ liệu bảo mật',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Mô hình chấm điểm URL của bạn dựa nhiều nhất vào ba đặc trưng: (1) URL dài hơn 75 ký tự; (2) tên miền đăng ký dưới 7 ngày; (3) chứng chỉ TLS được cấp trong 24 giờ qua. Một nhóm tấn công đọc được bài blog mô tả đúng ba đặc trưng này. Cái nào họ vô hiệu hoá ngay chiều nay, cái nào tốn tiền thật của họ?',
          reveal:
            'Đặc trưng (1) chết trong 5 phút: rút gọn đường dẫn, bỏ tham số thừa, không tốn một đồng nào. Đặc trưng (3) cũng gần như miễn phí: xin chứng chỉ sớm hơn vài tuần rồi để đó. Đặc trưng (2) là cái duy nhất bắt họ trả giá thật — muốn có tên miền 60 ngày tuổi thì phải mua trước 60 ngày, ôm rủi ro tên miền bị đưa vào danh sách chặn trong thời gian chờ, và nhân lên với hàng trăm tên miền cho mỗi chiến dịch. Nhưng chú ý: cách né rẻ nhất cho CẢ BA là chiếm quyền một website hợp pháp đã tồn tại 10 năm và đặt trang lừa đảo vào một thư mục con. Chi phí lúc đó là một cuộc xâm nhập — đắt, nhưng nhóm tấn công có tổ chức vẫn trả được. **Không có đặc trưng nào không thể né. Chỉ có đặc trưng đắt và đặc trưng rẻ.**',
        },
        {
          t: 'p',
          md: 'Đây là chặng dài nhất bạn sẽ dùng lại nhiều nhất trong công việc thật. Lý do đơn giản: đổi từ LightGBM sang XGBoost thường thay đổi PR-AUC ở chữ số thập phân thứ hai, còn thêm một đặc trưng đúng có thể thay đổi ở chữ số thứ nhất.',
        },
        { t: 'h', text: 'Câu hỏi 1: kẻ tấn công tốn bao nhiêu để làm hỏng đặc trưng này?', level: 2 },
        {
          t: 'p',
          md: '**Chi phí né tránh** (evasion cost) là số tiền, thời gian và năng lực mà kẻ tấn công phải bỏ ra để thay đổi giá trị của một đặc trưng **mà vẫn giữ cho cuộc tấn công hoạt động**. Vế sau mới là vế quan trọng. Ai cũng đổi được User-Agent; không ai đổi được việc ransomware phải đọc và ghi đè hàng nghìn tệp.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Bất biến của kẻ tấn công',
          md: 'Mọi cuộc tấn công đều có những thứ **bắt buộc phải đúng** thì nó mới thành công. Ransomware phải đọc nhiều tệp và ghi lại phiên bản đã mã hoá. C2 phải gửi được dữ liệu ra ngoài và nhận lệnh vào. Phishing phải đưa được thông tin đăng nhập tới tay kẻ tấn công. Đánh cắp dữ liệu phải chuyển được một khối lượng byte đủ lớn ra khỏi mạng.\n\nĐặc trưng bám vào bất biến thì kẻ tấn công chỉ né được bằng cách **giảm hiệu quả của chính cuộc tấn công**. Đó là loại đặc trưng bạn muốn. Mọi thứ khác là bề mặt.',
        },
        {
          t: 'table',
          caption: 'Chấm điểm chi phí né tránh — bảng này nên dán lên tường chỗ ngồi.',
          head: ['Đặc trưng', 'Bám vào đâu', 'Chi phí né tránh', 'Tuổi thọ thực tế'],
          rows: [
            ['Chuỗi User-Agent lạ', 'Bề mặt', 'Sửa một dòng cấu hình, 0 đồng', 'Vài ngày'],
            ['Tên tệp chứa chuỗi số ngẫu nhiên', 'Bề mặt', 'Đổi tên, 0 đồng', 'Vài ngày'],
            ['Entropy section .text lớn hơn 7,2', 'Bề mặt kỹ thuật', 'Đổi packer hoặc bỏ nén, vài giờ', 'Vài tuần'],
            ['Tên miền dưới 7 ngày tuổi', 'Kinh tế của kẻ tấn công', 'Mua sớm và chờ, có rủi ro bị đốt', 'Vài tháng'],
            ['Bộ imports VirtualAllocEx + WriteProcessMemory + CreateRemoteThread', 'Hành vi cần thiết (tiêm tiến trình)', 'Chuyển sang phân giải API động, vài ngày công', 'Vài tháng'],
            ['Số tệp bị ghi đè trên endpoint trong 60 giây', 'Bất biến của ransomware', 'Mã hoá chậm lại — nạn nhân kịp phản ứng', 'Nhiều năm'],
            ['Kết nối ra ngoài đều đặn tới cùng một đích suốt 8 giờ', 'Bất biến của C2', 'Tăng jitter — mất khả năng điều khiển tức thời', 'Nhiều năm'],
          ],
        },
        {
          t: 'compare',
          title: 'Hai họ đặc trưng bạn phải phân biệt được trong 3 giây',
          left: {
            title: '🎈 Đặc trưng bề mặt',
            items: [
              'Mô tả cách cuộc tấn công được đóng gói lần này',
              'Kẻ tấn công đổi được mà không mất gì',
              'Thường cho AUC cao ngay lập tức trên dữ liệu cũ',
              'Ví dụ: tên tệp, User-Agent, tên section, thứ tự header, độ dài chuỗi',
              'Vẫn có ích — nhưng phải biết nó sẽ chết và chuẩn bị sẵn đường thay',
            ],
          },
          right: {
            title: '🪨 Đặc trưng hành vi lõi',
            items: [
              'Mô tả việc cuộc tấn công BẮT BUỘC phải làm',
              'Né được, nhưng phải hy sinh tốc độ, độ tin cậy hoặc tiền',
              'Thường yếu hơn khi đứng một mình, mạnh khi kết hợp',
              'Ví dụ: tỉ lệ ghi tệp, chu kỳ kết nối ra ngoài, tỉ lệ byte lên/xuống, chuỗi lời gọi API',
              'Tốn công lấy hơn — đó chính là lý do ít người làm và bạn có lợi thế',
            ],
          },
        },
        { t: 'figure', id: 'fig-adversarial', caption: 'Kẻ tấn công không cần phá mô hình. Họ chỉ cần đẩy mẫu của mình qua ranh giới quyết định theo hướng rẻ nhất — và hướng rẻ nhất luôn là đặc trưng bề mặt.' },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Mẹo thực chiến: tự né mô hình của chính mình',
          md: 'Trước khi triển khai, hãy dành hai giờ đóng vai kẻ tấn công. Lấy 20 mẫu độc hại mà mô hình bắt đúng, rồi tự hỏi từng mẫu: **tôi phải sửa gì rẻ nhất để điểm tụt dưới ngưỡng?** Nếu câu trả lời cho hơn một nửa số mẫu là "đổi một chuỗi ký tự", bạn chưa có mô hình phát hiện — bạn có một chữ ký ký tự đắt tiền hơn YARA nhưng khó giải thích hơn.',
        },
        { t: 'h', text: 'Câu hỏi 2: đặc trưng này còn đúng sau sáu tháng không?', level: 2 },
        {
          t: 'p',
          md: 'Đặc trưng chết không chỉ vì kẻ tấn công. Chúng chết vì thế giới thay đổi: Chrome đổi thứ tự extension trong ClientHello, tổ chức chuyển sang Microsoft 365, phòng kỹ thuật triển khai VPN mới, một TLD mới ra đời. Đây là **trôi đặc trưng** (feature drift) và nó xảy ra kể cả khi không có ai tấn công bạn.',
        },
        {
          t: 'p',
          md: 'Cách đo tiêu chuẩn là **PSI** (Population Stability Index) — so phân phối của đặc trưng hôm nay với phân phối lúc huấn luyện. Quy ước dùng rộng rãi trong ngành rủi ro tín dụng và đã lan sang bảo mật: `PSI < 0,1` là ổn định, `0,1–0,25` là dịch chuyển đáng chú ý, `> 0,25` là dịch chuyển mạnh và cần điều tra ngay.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'PSI trong 12 dòng — chạy hằng ngày cho mọi đặc trưng, rẻ hơn nhiều so với chờ nhãn về',
          code:
            "import numpy as np\n" +
            "\n" +
            "def psi(nen, hien_tai, so_o=10):\n" +
            "    # Chia theo phân vị của TẬP NỀN, không phải của tập hiện tại\n" +
            "    canh = np.unique(np.quantile(nen, np.linspace(0, 1, so_o + 1)))\n" +
            "    canh[0], canh[-1] = -np.inf, np.inf\n" +
            "    p = np.histogram(nen, bins=canh)[0] / len(nen)\n" +
            "    q = np.histogram(hien_tai, bins=canh)[0] / len(hien_tai)\n" +
            "    eps = 1e-6                       # tránh chia 0 khi một ô rỗng\n" +
            "    p, q = np.clip(p, eps, None), np.clip(q, eps, None)\n" +
            "    return float(np.sum((q - p) * np.log(q / p)))\n" +
            "\n" +
            "# PSI < 0,1 ổn định | 0,1–0,25 dịch chuyển vừa | > 0,25 phải điều tra\n" +
            "for cot in X_train.columns:\n" +
            "    d = psi(X_train[cot].values, X_hom_nay[cot].values)\n" +
            "    if d > 0.1:\n" +
            "        print(f'{cot}: PSI = {d:.3f}')\n",
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Vì sao giám sát đặc trưng quan trọng hơn giám sát độ chính xác',
          md: 'Trong bảo mật, nhãn về muộn hàng tuần tới hàng tháng (bài t0-l2). Nghĩa là biểu đồ precision/recall của bạn luôn kể chuyện quá khứ. Nhưng phân phối đặc trưng thì có ngay hôm nay, không cần nhãn. PSI của `tuoi_ten_mien` nhảy từ 0,04 lên 0,38 trong hai ngày là tín hiệu sớm nhất bạn có được rằng có gì đó vừa thay đổi — có thể là chiến dịch mới, có thể là một pipeline dữ liệu vừa hỏng. Cả hai đều đáng biết trước hai tuần.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't5l1-cp1',
              kind: 'mcq',
              tags: ['dac-trung', 'ne-tranh'],
              q: 'Bạn phải chọn MỘT đặc trưng để phát hiện đánh cắp dữ liệu qua HTTPS. Cái nào có chi phí né tránh cao nhất?',
              options: [
                'User-Agent không nằm trong danh sách trình duyệt phổ biến',
                'Tổng số byte gửi lên của cặp (máy nội bộ, đích ngoài) trong 24 giờ',
                'Tên miền đích chứa nhiều hơn 3 dấu gạch ngang',
                'Cổng đích khác 443',
              ],
              answer: 1,
              why: 'Muốn đánh cắp 40 GB dữ liệu thì phải chuyển 40 GB ra ngoài — đó là bất biến, không thương lượng được. Kẻ tấn công chỉ né được bằng cách chia nhỏ và kéo dài nhiều tuần, tức là chấp nhận rủi ro bị phát hiện lâu hơn và mất dữ liệu nếu bị đá ra sớm. Ba lựa chọn còn lại đều sửa được trong vài phút: đổi User-Agent thành chuỗi Chrome thật, mua tên miền không có gạch ngang, dùng đúng cổng 443.',
              distractorWhy: [
                'Đổi User-Agent là một dòng cấu hình trong hầu hết mọi công cụ.',
                '',
                'Hình dạng tên miền là đặc trưng bề mặt thuần tuý, đổi bằng cách mua tên miền khác.',
                'Gần như mọi C2 hiện đại đã chạy trên 443 từ lâu, chính vì lý do này.',
              ],
            },
            {
              id: 't5l1-cp2',
              kind: 'truefalse',
              tags: ['dac-trung', 'troi-khai-niem'],
              q: 'Nếu PSI của một đặc trưng vượt 0,25 thì chắc chắn kẻ tấn công đã thay đổi chiến thuật.',
              answer: false,
              why: 'PSI chỉ nói phân phối đã dịch chuyển, không nói vì sao. Trong thực tế, nguyên nhân phổ biến NHẤT của PSI cao không phải kẻ tấn công mà là hỏng đường ống dữ liệu: một trường đổi tên sau khi nâng cấp agent, một sensor ngừng gửi log, múi giờ bị đổi, hoặc bộ phân tích cú pháp gặp định dạng mới và trả về giá trị mặc định. Luôn kiểm tra ống dẫn trước khi kết luận về đối thủ.',
            },
          ],
        },
        { t: 'h', text: 'Câu hỏi 3: đặc trưng này có nhìn thấy tương lai không?', level: 2 },
        {
          t: 'p',
          md: 'Bạn đã gặp rò rỉ dữ liệu ở bài t2-l6. Ở đây ta nói về những dạng rò rỉ **chỉ có trong bảo mật** — chúng tinh vi hơn nhiều so với việc quên tách tập kiểm tra, và chúng là nguyên nhân số một của những con số AUC 0,999 làm bạn vui trong một tuần.',
        },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Số lượng engine VirusTotal phát hiện.** Trường `positives` là kết quả của việc cả ngành đã phân tích mẫu đó — thường là nhiều tháng SAU thời điểm mẫu xuất hiện. Dùng nó làm đặc trưng nghĩa là mô hình của bạn đang đọc đáp án.',
            '**Đường dẫn tệp.** Mẫu độc nằm trong `D:\\samples\\malware\\`, mẫu lành lấy từ `C:\\Program Files\\`. Mô hình học đường dẫn, không học tệp. Nghe ngớ ngẩn nhưng đây là lỗi phổ biến nhất trong các dự án phân loại mã độc của sinh viên và cả của doanh nghiệp.',
            '**Tuổi tên miền tính bằng "hôm nay".** Bạn huấn luyện năm 2026 trên sự cố năm 2024. Tên miền lúc đó 3 ngày tuổi, nhưng `datetime.now() - creation_date` cho ra 800 ngày. Toàn bộ đặc trưng bị đảo ngược ý nghĩa.',
            '**Trường do chính quy trình xử lý điền vào.** `severity` đã được analyst chỉnh tay, số bình luận trong ticket, thời gian đóng cảnh báo, số người được gán. Những trường này chỉ tồn tại SAU khi con người đã biết câu trả lời.',
            '**Thống kê tính trên toàn bộ tập dữ liệu.** Tần suất một tên miền, tần suất một hash, `first_seen` toàn cục. Nếu bạn tính chúng trên cả tập gồm cả phần tương lai, mỗi hàng huấn luyện đều mang thông tin từ ngày mai.',
          ],
        },
        {
          t: 'steps',
          title: 'Ví dụ mẫu: đặc trưng tuổi tên miền làm sập một dự án',
          steps: [
            {
              title: 'Bước 1 — Kết quả thí nghiệm quá đẹp',
              md: 'Mô hình phishing đạt PR-AUC 0,981 trên tập kiểm tra tách theo thời gian. Đặc trưng quan trọng nhất theo permutation importance là `tuoi_ten_mien_ngay`, bỏ nó ra thì PR-AUC tụt còn 0,72.',
            },
            {
              title: 'Bước 2 — Truy nguồn giá trị',
              md: 'Đặc trưng được tính bằng một lệnh WHOIS chạy tại thời điểm **xây tập dữ liệu**, tức tháng 3/2026. Tập dữ liệu gồm sự kiện từ 1/2024 tới 12/2025.',
            },
            {
              title: 'Bước 3 — Nhận ra sự bất đối xứng',
              md: 'Tên miền lành tính trong tập đều là tên miền lớn, tồn tại nhiều năm — tuổi của chúng gần như không đổi dù đo lúc nào. Tên miền phishing thì bị thu hồi hoặc hết hạn, và WHOIS trả về lỗi hoặc ngày tạo mới nhất. Mô hình học được: **WHOIS lỗi = phishing**. Đó là một sự thật của tháng 3/2026, không phải của thời điểm tấn công.',
            },
            {
              title: 'Bước 4 — Sửa đúng cách (point-in-time)',
              md: 'Lưu `creation_date` từ WHOIS/RDAP như một dữ kiện tĩnh, rồi tính đặc trưng bằng `thoi_diem_su_kien - creation_date`. Với tên miền không tra được, dùng một giá trị đánh dấu riêng (ví dụ -1) và thêm cờ `whois_khong_tra_duoc` để mô hình học rõ ràng thay vì học lén.',
            },
            {
              title: 'Bước 5 — Con số thật sau khi sửa',
              md: 'PR-AUC còn 0,89. Thấp hơn, nhưng đây mới là con số bạn sẽ gặp khi triển khai. Một mô hình 0,89 trung thực đáng giá hơn nhiều lần một mô hình 0,98 sẽ làm bạn mất uy tín trong tuần đầu.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Quy tắc point-in-time, viết một lần nhớ cả đời',
          md: 'Mỗi đặc trưng phải được tính **chỉ từ thông tin tồn tại trước hoặc tại thời điểm của sự kiện**. Kiểm tra bằng một câu hỏi: nếu tôi chạy hàm trích đặc trưng này ngay lúc sự kiện xảy ra, tôi có ra đúng giá trị đó không?\n\nNếu câu trả lời là không — vì cần WHOIS hôm nay, vì cần biết tần suất cả năm, vì cần kết quả điều tra — thì đặc trưng đó **không tồn tại** ở thời điểm suy luận. Nó chỉ tồn tại trong phòng thí nghiệm.',
        },
        {
          t: 'checklist',
          title: 'Duyệt trước khi cho một đặc trưng vào mô hình',
          items: [
            'Kẻ tấn công tốn bao nhiêu để đổi giá trị này mà vẫn tấn công thành công?',
            'Nó bám vào bất biến nào của cuộc tấn công, hay chỉ mô tả lần đóng gói này?',
            'Tôi có tính được nó tại thời điểm suy luận, với đúng dữ liệu có lúc đó không?',
            'Giá trị của nó có bị chính quy trình xử lý sự cố tạo ra không?',
            'PSI của nó trên 90 ngày gần nhất là bao nhiêu?',
            'Nếu đặc trưng này chết, tôi còn lại gì? (Đừng để mô hình dựa trên một chân.)',
            'Chi phí tính toán tại thời điểm suy luận có nằm trong ngân sách độ trễ không?',
          ],
        },
        { t: 'terms', ids: ['dac-trung', 'ne-tranh', 'doi-khang', 'ro-ri-du-lieu', 'troi-du-lieu', 'chia-theo-thoi-gian'] },
      ],
      keyTakeaways: [
        'Chi phí né tránh là thước đo đúng cho một đặc trưng: kẻ tấn công phải trả bao nhiêu để đổi nó MÀ VẪN tấn công thành công.',
        'Đặc trưng tốt bám vào bất biến của cuộc tấn công (phải mã hoá tệp, phải gửi dữ liệu ra, phải nhận lệnh vào), không bám vào cách đóng gói lần này.',
        'Không có đặc trưng nào không né được — chỉ có đặc trưng rẻ để né và đắt để né. Hãy chọn đắt và chuẩn bị sẵn phương án thay thế.',
        'PSI đo trôi đặc trưng mà không cần nhãn, nên nó là hệ thống cảnh báo sớm duy nhất bạn có trong bảo mật; ngưỡng thực dụng là 0,1 và 0,25.',
        'Quy tắc point-in-time: đặc trưng chỉ được tính từ thông tin tồn tại tại thời điểm sự kiện — WHOIS hôm nay, điểm VirusTotal hôm nay và thống kê toàn tập đều là rò rỉ.',
      ],
      cards: [
        {
          id: 't5l1-c1',
          front: 'Chi phí né tránh (evasion cost) của một đặc trưng được định nghĩa như thế nào?',
          back: 'Số tiền, thời gian và năng lực kẻ tấn công phải bỏ ra để thay đổi giá trị đặc trưng đó MÀ VẪN giữ cho cuộc tấn công hoạt động.',
          tags: ['dac-trung', 'ne-tranh'],
        },
        {
          id: 't5l1-c2',
          front: 'Vì sao đặc trưng bám vào "bất biến của cuộc tấn công" bền hơn hẳn?',
          back: 'Vì né nó đồng nghĩa với việc làm cuộc tấn công kém hiệu quả đi (mã hoá chậm hơn, C2 phản hồi chậm hơn, exfil lâu hơn) — kẻ tấn công phải trả bằng chính mục tiêu của họ.',
          tags: ['dac-trung', 'doi-khang'],
        },
        {
          id: 't5l1-c3',
          front: 'Ngưỡng PSI nào cần chú ý và ngưỡng nào phải điều tra ngay?',
          back: 'PSI dưới 0,1 là ổn định; 0,1–0,25 là dịch chuyển đáng chú ý; trên 0,25 là dịch chuyển mạnh, phải điều tra.',
          hint: 'Hai con số, một chữ số thập phân.',
          tags: ['troi-du-lieu', 'giam-sat'],
        },
        {
          id: 't5l1-c4',
          front: 'Quy tắc point-in-time cho đặc trưng nói gì?',
          back: 'Mỗi đặc trưng chỉ được tính từ thông tin tồn tại trước hoặc tại thời điểm sự kiện. Nếu chạy lúc đó không ra được giá trị đó thì nó là rò rỉ.',
          tags: ['ro-ri-du-lieu', 'dac-trung'],
        },
        {
          id: 't5l1-c5',
          front: 'Nêu ba đặc trưng rò rỉ tương lai đặc thù của dữ liệu bảo mật.',
          back: 'Số engine VirusTotal phát hiện; tuổi tên miền tính bằng "hôm nay" thay vì thời điểm sự kiện; các trường do quy trình xử lý sự cố điền vào (severity đã chỉnh, số bình luận ticket).',
          tags: ['ro-ri-du-lieu'],
        },
      ],
      quiz: [
        {
          id: 't5l1-q1',
          kind: 'mcq',
          tags: ['ro-ri-du-lieu', 'dac-trung'],
          q: 'Bạn xây tập dữ liệu phishing tháng 3/2026 cho các sự cố năm 2024–2025, và tính `tuoi_ten_mien = hom_nay - ngay_tao`. Hậu quả nghiêm trọng nhất là gì?',
          options: [
            'Đặc trưng bị lệch thang đo nên cần chuẩn hoá lại',
            'Mô hình học được rằng WHOIS tra không ra hoặc tên miền đã hết hạn nghĩa là phishing — một sự thật của tháng 3/2026, không phải của thời điểm tấn công',
            'Không sao cả, vì tuổi tên miền tăng đều cho cả hai lớp',
            'Chỉ ảnh hưởng tới các mẫu lành tính vì tên miền lớn không đổi tuổi',
          ],
          answer: 1,
          why: 'Điểm chết nằm ở sự bất đối xứng theo thời gian. Tên miền lành tính là tên miền lâu năm nên tuổi đo lúc nào cũng gần như nhau. Tên miền phishing bị thu hồi, hết hạn hoặc đăng ký lại, nên WHOIS tại thời điểm xây tập trả về lỗi hoặc ngày tạo mới — một tín hiệu chỉ tồn tại vì bạn nhìn ngược lại quá khứ. Cách sửa: lưu `creation_date` như dữ kiện tĩnh và tính hiệu với thời điểm sự kiện, kèm cờ riêng cho trường hợp không tra được.',
          distractorWhy: [
            'Chuẩn hoá không cứu được đặc trưng mang thông tin từ tương lai.',
            '',
            'Không tăng đều: đúng cái đó là nguồn gốc của rò rỉ.',
            'Ảnh hưởng cả hai lớp, và tác động nặng nhất nằm ở lớp độc hại.',
          ],
        },
        {
          id: 't5l1-q2',
          kind: 'multi',
          tags: ['dac-trung', 'ne-tranh'],
          q: 'Đặc trưng nào sau đây có chi phí né tránh CAO (chọn tất cả đáp án đúng)?',
          options: [
            'Số tệp bị đọc rồi ghi đè trong 60 giây trên một endpoint',
            'Tên section trong tệp PE là UPX0/UPX1',
            'Độ đều đặn của khoảng thời gian giữa các kết nối ra ngoài trong 8 giờ',
            'Chuỗi X-Mailer trong header email',
            'Tỉ lệ byte gửi lên chia byte tải xuống của một phiên dài',
          ],
          answers: [0, 2, 4],
          why: 'Ba đặc trưng được chọn đều bám vào bất biến: ransomware phải ghi đè tệp mới đòi được tiền, C2 phải liên lạc định kỳ mới điều khiển được, đánh cắp dữ liệu phải đẩy byte ra ngoài. Né chúng nghĩa là làm chậm hoặc làm yếu chính cuộc tấn công. Tên section UPX0 đổi bằng cách sửa packer hoặc bỏ nén; X-Mailer là một dòng text tuỳ ý do bên gửi tự đặt. Cả hai đều là bề mặt.',
        },
        {
          id: 't5l1-q3',
          kind: 'truefalse',
          tags: ['dac-trung', 'thuc-chien'],
          q: 'Vì đặc trưng bề mặt dễ bị né nên không nên đưa chúng vào mô hình.',
          answer: false,
          why: 'Đặc trưng bề mặt vẫn rất có giá trị: chúng rẻ để tính, bắt được phần lớn kẻ tấn công mức thấp, và buộc nhóm tấn công có kỹ năng phải tốn thêm công. Vấn đề không phải là dùng chúng, mà là **phụ thuộc** vào chúng. Nguyên tắc thực dụng: hãy chắc chắn rằng nếu bạn xoá toàn bộ đặc trưng bề mặt thì mô hình vẫn còn đủ tín hiệu để hoạt động ở mức chấp nhận được. Kiểm tra bằng cách huấn luyện lại với chỉ nhóm đặc trưng lõi và xem PR-AUC còn bao nhiêu.',
        },
        {
          id: 't5l1-q4',
          kind: 'order',
          tags: ['dac-trung', 'quy-trinh'],
          q: 'Sắp xếp quy trình duyệt một đặc trưng mới theo đúng thứ tự thực dụng.',
          items: [
            'Xác định đặc trưng bám vào bất biến nào của cuộc tấn công',
            'Kiểm tra tính point-in-time: có tính được tại thời điểm suy luận không',
            'Đo PSI trên 90 ngày lịch sử để xem nó có ổn định không',
            'Ước lượng chi phí né tránh bằng cách tự thử né mô hình',
            'Đo mức đóng góp thực tế bằng cách huấn luyện có và không có nó',
          ],
          why: 'Thứ tự này tiết kiệm công nhất: hai bước đầu loại bỏ đặc trưng vô giá trị hoặc rò rỉ trước khi bạn tốn công đo đạc. Đo PSI trước khi tự né vì PSI rẻ và tự động; tự né tốn thời gian con người. Đo đóng góp để cuối cùng vì đó là bước đắt nhất và chỉ đáng làm với đặc trưng đã qua bốn cửa trước.',
        },
      ],
      terms: ['dac-trung', 'ne-tranh', 'doi-khang', 'ro-ri-du-lieu', 'troi-du-lieu', 'chia-theo-thoi-gian', 'tuong-quan-gia'],
      further: [
        {
          title: 'MITRE ATT&CK — mục Data Sources và Data Components',
          note: 'Danh mục chuẩn về việc mỗi kỹ thuật tấn công để lại dấu vết ở đâu. Đọc ngược từ kỹ thuật ra dữ liệu là cách nhanh nhất để nghĩ ra đặc trưng bám vào bất biến.',
        },
        {
          title: 'Dos and Donts of Machine Learning in Computer Security — Arp và cộng sự (USENIX Security 2022)',
          note: 'Liệt kê có hệ thống các cạm bẫy trong ML bảo mật, trong đó rò rỉ và lấy mẫu sai chiếm phần lớn. Đọc để biết mình đang mắc lỗi nào.',
        },
      ],
    },
    /* ====================================================================== */
    {
      id: 't5-l2',
      trackId: 'dac-trung',
      title: 'Đặc trưng cho URL, tên miền và email',
      subtitle: 'Từ một dòng text tới ba mươi con số — và bốn con số trong đó làm gần hết việc',
      minutes: 20,
      level: 'co-ban',
      prereqs: ['t5-l1', 't1-l5'],
      why: {
        short:
          'Phishing vẫn là con đường vào phổ biến nhất của hầu hết các cuộc xâm nhập, và bộ đặc trưng URL/tên miền/email là thứ bạn sẽ viết lại ở mọi tổ chức bạn từng làm việc.',
        scenario:
          'Cổng thư của công ty nhận 180.000 email mỗi ngày. Bộ lọc thương mại để lọt khoảng 20 thư lừa đảo mỗi tuần. Bạn được giao xây một lớp chấm điểm bổ sung chạy sau bộ lọc đó, và bạn có đúng những gì log ghi lại: header, URL trong thân thư, và kết quả xác thực.',
        roles: ['Detection Engineer', 'SOC Analyst', 'Security Data Scientist'],
        costOfNotKnowing:
          'Bạn viết một mô hình chỉ dựa vào độ dài URL và vài từ khoá, nó chặn nhầm bản tin nội bộ của phòng nhân sự, và sau hai tuần bị tắt vĩnh viễn — trong khi các đặc trưng thực sự mạnh, như lệch giữa thương hiệu được nhắc và tên miền đã xác thực, thì bạn chưa hề dùng tới.',
      },
      objectives: [
        'Trích xuất được ít nhất 15 đặc trưng có căn cứ từ một URL bất kỳ, trong đó có tuổi tên miền tính point-in-time',
        'Giải thích được SPF, DKIM và DMARC làm gì, và chỉ ra chính xác điều chúng KHÔNG bảo đảm',
        'Phát hiện tấn công homoglyph/punycode và chuyển nó thành đặc trưng số',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Bắt đầu bằng một URL thật, kiểu bạn gặp mỗi tuần: `https://microsoft-office365-verify.secure-login[.]cfd/auth/session?ref=8f21ac`. Trước khi đọc tiếp, hãy để ý mắt bạn vừa làm gì — nó bắt được thương hiệu ở sai vị trí, một TLD lạ, và một đường dẫn giả vờ nghiêm túc. Việc của bài này là biến từng phản xạ đó thành một con số.',
        },
        { t: 'h', text: 'Giải phẫu URL thành các con số', level: 2 },
        {
          t: 'table',
          caption: 'Đặc trưng URL cơ bản, tính trên chính URL ở trên.',
          head: ['Đặc trưng', 'Giá trị', 'Vì sao nó mang tín hiệu'],
          rows: [
            ['do_dai_url', '76', 'URL lừa đảo thường dài hơn vì phải nhét thương hiệu + từ khoá + tham số theo dõi'],
            ['do_dai_host', '46', 'Tên miền hợp pháp của thương hiệu lớn hầu như luôn ngắn'],
            ['so_dau_cham_trong_host', '2', 'Nhiều dấu chấm nghĩa là nhiều nhãn con — chỗ giấu thương hiệu miễn phí'],
            ['so_dau_gach_ngang', '4', 'Gạch ngang là cách rẻ nhất để ghép nhiều thương hiệu vào một tên miền'],
            ['thuong_hieu_trong_nhan_con', '1', 'Chữ microsoft nằm ở nhãn con chứ không phải nhãn đăng ký — dấu hiệu rất mạnh'],
            ['tld', 'cfd', 'TLD giá rẻ, đăng ký tự do, thường xuyên nằm đầu bảng lạm dụng'],
            ['entropy_nhan_chinh', '3,02 bit/ký tự', 'Đo mức ngẫu nhiên của chuỗi — hữu ích cho DGA hơn là cho phishing thương hiệu'],
            ['co_dia_chi_ip_thay_ten_mien', '0', 'URL trỏ thẳng vào IP gần như luôn đáng ngờ trong lưu lượng người dùng'],
            ['co_punycode', '0', 'Tiền tố xn-- nghĩa là có ký tự ngoài ASCII đã bị mã hoá'],
            ['tuoi_ten_mien_ngay', 'tính tại thời điểm email đến', 'Đặc trưng đắt nhất để né trong nhóm này — xem bài t5-l1'],
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Bộ trích đặc trưng URL dùng được ngay — chú ý dòng cuối cùng, đó là chỗ dự án hay chết',
          code:
            "import math\n" +
            "import re\n" +
            "from urllib.parse import urlparse\n" +
            "import tldextract  # pip install tldextract\n" +
            "\n" +
            "def entropy(s):\n" +
            "    if not s:\n" +
            "        return 0.0\n" +
            "    n = len(s)\n" +
            "    return -sum((c / n) * math.log2(c / n) for c in\n" +
            "                (s.count(k) for k in set(s)))\n" +
            "\n" +
            "def dac_trung_url(url, thoi_diem_su_kien, ngay_tao_ten_mien=None):\n" +
            "    u = urlparse(url)\n" +
            "    e = tldextract.extract(url)          # tách theo Public Suffix List\n" +
            "    host = u.hostname or ''\n" +
            "    return {\n" +
            "        'do_dai_url': len(url),\n" +
            "        'do_dai_host': len(host),\n" +
            "        'so_dau_cham': host.count('.'),\n" +
            "        'so_dau_gach_ngang': host.count('-'),\n" +
            "        'so_nhan_con': len(e.subdomain.split('.')) if e.subdomain else 0,\n" +
            "        'co_dia_chi_ip': int(bool(re.fullmatch(r'[0-9.]+', host))),\n" +
            "        'co_punycode': int('xn--' in host),\n" +
            "        'entropy_nhan_chinh': round(entropy(e.domain), 3),\n" +
            "        'do_dai_nhan_chinh': len(e.domain),\n" +
            "        'tld': e.suffix,\n" +
            "        'do_sau_duong_dan': u.path.count('/'),\n" +
            "        'so_tham_so': len(u.query.split('&')) if u.query else 0,\n" +
            "        'co_https': int(u.scheme == 'https'),\n" +
            "        # POINT-IN-TIME: tuổi tính tại lúc sự kiện xảy ra, KHÔNG phải hôm nay\n" +
            "        'tuoi_ten_mien_ngay': ((thoi_diem_su_kien - ngay_tao_ten_mien).days\n" +
            "                               if ngay_tao_ten_mien else -1),\n" +
            "        'whois_khong_tra_duoc': int(ngay_tao_ten_mien is None),\n" +
            "    }\n",
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Dùng Public Suffix List, đừng tự tách bằng dấu chấm',
          md: 'Tách `co.uk`, `com.vn`, `github.io`, `s3.amazonaws.com` bằng cách đếm dấu chấm là sai. `tldextract` (và thư viện `publicsuffix2`) dùng Public Suffix List của Mozilla để biết đâu là ranh giới đăng ký thật. Sai chỗ này thì đặc trưng `thuong_hieu_trong_nhan_con` — một trong những đặc trưng mạnh nhất bạn có — sẽ tính sai cho hàng chục nghìn tên miền.',
        },
        { t: 'h', text: 'Entropy: dùng đúng và dùng sai', level: 2 },
        {
          t: 'p',
          md: 'Bạn đã học entropy Shannon ở bài t1-l5. Ở đây là ứng dụng cụ thể nhất của nó trong bảo mật: phân biệt tên miền do người đặt với tên miền do thuật toán sinh (**DGA**). Tính thử: chuỗi `google` có các ký tự g,o,o,g,l,e — hai chữ xuất hiện hai lần, hai chữ xuất hiện một lần, cho `H ≈ 1,92 bit/ký tự`. Chuỗi `kqjxbvzmwp` có 10 ký tự khác nhau, cho `H = log2(10) = 3,32 bit/ký tự`.',
        },
        {
          t: 'predict',
          question:
            'Bạn có hai tên miền: `xkqz.com` (4 ký tự, tất cả khác nhau) và `internationalization.com` (20 ký tự, tiếng Anh chuẩn). Entropy Shannon ở mức ký tự của cái nào cao hơn? Và điều đó nói lên gì về việc dùng entropy làm đặc trưng?',
          reveal:
            '`xkqz` cho `H = log2(4) = 2,00`. `internationalization` có 20 ký tự với nhiều chữ lặp lại (i xuất hiện 5 lần, n 4 lần, t 3 lần, a 3 lần...) nhưng vẫn cho `H ≈ 3,2`. Tức là **chuỗi tiếng Anh dài lại có entropy cao hơn chuỗi ngẫu nhiên ngắn**.\n\nLý do: entropy Shannon trên một chuỗi độ dài `n` bị chặn trên bởi `log2(n)`. Một chuỗi 4 ký tự không thể vượt quá 2 bit dù ngẫu nhiên đến đâu. Nghĩa là **entropy tương quan mạnh với độ dài**, và nếu bạn đưa cả `entropy` lẫn `do_dai` vào mô hình mà không nghĩ, mô hình sẽ học một mớ hỗn độn.\n\nCách làm đúng: (a) chuẩn hoá bằng `entropy / log2(do_dai)`; (b) hoặc bỏ entropy đi và dùng **xác suất n-gram ký tự** so với một mô hình ngôn ngữ nền xây từ danh sách tên miền phổ biến — đây là đặc trưng phát hiện DGA mạnh hơn hẳn entropy trần.',
        },
        { t: 'figure', id: 'fig-entropy-scale', caption: 'Thang entropy của chuỗi ký tự. Hãy nhớ trần log2(n): so entropy của hai chuỗi khác độ dài là so hai thứ khác nhau.' },
        { t: 'lab', id: 'lab-url-features', intro: 'Dán bất kỳ URL nào vào và xem toàn bộ vector đặc trưng hiện ra từng dòng. Thử sửa URL cho tới khi điểm nghi ngờ tụt xuống — đó chính là bài tập tự né mô hình ở bài trước.' },
        { t: 'h', text: 'Tên miền: tuổi, TLD và mẹo đánh lừa mắt', level: 2 },
        {
          t: 'p',
          md: '**Tuổi tên miền** là đặc trưng đơn lẻ mạnh nhất của nhóm này. Rất nhiều tổ chức chặn hoặc đánh dấu **NRD** (newly registered domain) dưới 30 ngày như một luật độc lập, không cần mô hình. Nguồn dữ liệu: RDAP (chuẩn thay thế WHOIS, trả về JSON) hoặc các nguồn NRD thương mại. Lưu ý sau GDPR 2018, WHOIS che thông tin chủ sở hữu, nhưng `creation_date` của phần lớn gTLD vẫn công khai.',
        },
        {
          t: 'p',
          md: 'Về **TLD**: Spamhaus và một số tổ chức khác công bố định kỳ bảng xếp hạng TLD bị lạm dụng nhiều nhất. Các TLD giá rẻ, đăng ký hàng loạt tự do (nhóm `.top`, `.xyz`, `.cfd`, `.sbs`, `.click`...) thường xuyên đứng đầu về **tỉ lệ** lạm dụng. Cách dùng đúng: mã hoá TLD thành đặc trưng phân loại (one-hot cho top 50, gộp phần còn lại), hoặc dùng tỉ lệ lạm dụng lịch sử làm target encoding — nhưng phải tính point-in-time.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Không có TLD nào là bằng chứng',
          md: 'Đây là bẫy hay gặp: analyst thấy `.top` liền kết luận độc hại. Về **số tuyệt đối**, `.com` vẫn là TLD chứa nhiều URL phishing nhất thế giới, đơn giản vì nó lớn hơn tất cả các TLD khác cộng lại. Và có doanh nghiệp thật dùng `.xyz` (Alphabet từng dùng `abc.xyz`).\n\nTLD là một tín hiệu yếu có ích khi cộng với các tín hiệu khác. Nếu mô hình của bạn cho TLD trọng số cao nhất, hãy kiểm tra lại tập dữ liệu — rất có thể mẫu phishing của bạn được lấy từ một nguồn thiên lệch về TLD.',
        },
        { t: 'h', text: 'Homoglyph và punycode: khi mắt người là lỗ hổng', level: 2 },
        {
          t: 'p',
          md: 'Hệ thống tên miền quốc tế hoá (IDN) cho phép dùng ký tự ngoài ASCII, và chúng được mã hoá về ASCII bằng **punycode** với tiền tố `xn--`. Năm 2017, Xudong Zheng đăng ký `xn--80ak6aa92e.com` — trình duyệt hiển thị nó thành một chuỗi trông hệt như `apple.com` vì toàn bộ ký tự đều là chữ Kirin (Cyrillic) trông giống chữ Latin. Chrome và Firefox sau đó siết quy tắc hiển thị, nhưng kỹ thuật này vẫn sống trong email và ứng dụng chat.',
        },
        {
          t: 'list',
          items: [
            '**co_punycode**: host chứa `xn--`. Rất rẻ để tính, và trong lưu lượng doanh nghiệp Việt Nam nó gần như luôn đáng xem.',
            '**tron_bang_chu_cai** (mixed script): sau khi giải mã punycode, tên miền có ký tự thuộc nhiều hệ chữ khác nhau (Latin + Kirin trong cùng một nhãn) — Unicode UTS #39 mô tả chuẩn để phát hiện.',
            '**khoang_cach_toi_thuong_hieu**: khoảng cách Levenshtein hoặc Damerau-Levenshtein từ nhãn đăng ký tới danh sách 500 thương hiệu bạn quan tâm. `paypa1` cách `paypal` đúng 1 phép thay thế.',
            '**khoang_cach_sau_khi_chuan_hoa_hinh_dang**: ánh xạ mỗi ký tự về "bộ xương" của nó theo bảng confusables của Unicode rồi mới so sánh. Cách này bắt được cả `rn` giả dạng `m` và chữ Kirin giả dạng Latin.',
            '**thuong_hieu_o_sai_vi_tri**: thương hiệu xuất hiện trong nhãn con hoặc trong đường dẫn nhưng KHÔNG phải là nhãn đăng ký. Đây thường là đặc trưng có sức phân biệt cao nhất trong cả nhóm URL.',
          ],
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't5l2-cp1',
              kind: 'mcq',
              tags: ['url', 'entropy'],
              q: 'Vì sao entropy Shannon ở mức ký tự là đặc trưng kém để phát hiện phishing giả mạo thương hiệu, dù nó khá tốt cho DGA?',
              options: [
                'Vì entropy chỉ tính được trên chuỗi dài hơn 20 ký tự',
                'Vì tên miền phishing thương hiệu cố tình trông giống từ tiếng Anh thật, nên entropy của chúng nằm đúng trong khoảng của tên miền lành tính',
                'Vì entropy luôn bằng 0 với tên miền chứa dấu gạch ngang',
                'Vì entropy chỉ áp dụng được cho dữ liệu nhị phân, không cho văn bản',
              ],
              answer: 1,
              why: 'Mục tiêu của DGA là sinh hàng nghìn tên miền không trùng — kết quả là chuỗi trông ngẫu nhiên, entropy cao. Mục tiêu của phishing giả mạo thương hiệu thì ngược lại hoàn toàn: chuỗi phải trông càng giống thật càng tốt, nên `microsoft-office365-verify` có entropy hoàn toàn bình thường. Hai bài toán khác nhau cần hai bộ đặc trưng khác nhau — đây là ví dụ điển hình cho việc phải biết mình đang phát hiện cái gì trước khi chọn đặc trưng.',
              distractorWhy: [
                'Entropy tính được trên chuỗi bất kỳ; vấn đề là trần log2(n) chứ không phải ngưỡng 20.',
                '',
                'Dấu gạch ngang chỉ là một ký tự như mọi ký tự khác.',
                'Entropy Shannon áp dụng cho phân phối bất kỳ, kể cả tần suất chữ cái.',
              ],
            },
            {
              id: 't5l2-cp2',
              kind: 'truefalse',
              tags: ['url', 'ro-ri-du-lieu'],
              q: 'Có thể tính đặc trưng "tỉ lệ phishing lịch sử của TLD này" bằng cách đếm trên toàn bộ tập dữ liệu rồi gán cho mọi hàng.',
              answer: false,
              why: 'Đó là target encoding tính trên cả tập, tức là mỗi hàng huấn luyện đang mang thông tin về nhãn của những hàng khác — bao gồm cả hàng trong tương lai. Kết quả là AUC đẹp giả tạo và sụp khi triển khai. Cách đúng: tính tỉ lệ chỉ từ dữ liệu trước mốc thời gian của hàng đó (rolling/expanding window), hoặc dùng out-of-fold encoding, và luôn có giá trị mặc định cho TLD chưa từng thấy.',
            },
          ],
        },
        { t: 'h', text: 'Email: ba lớp xác thực và điều chúng KHÔNG nói', level: 2 },
        {
          t: 'steps',
          title: 'SPF, DKIM, DMARC — hiểu một lần cho xong',
          steps: [
            {
              title: 'SPF: máy chủ này có được phép gửi thay cho tên miền đó không?',
              md: 'Tên miền công bố một bản ghi TXT liệt kê các IP được phép gửi. Máy chủ nhận kiểm tra IP kết nối tới có nằm trong danh sách của tên miền trong **Return-Path** (envelope sender) hay không. Điểm mấu chốt: SPF kiểm tra envelope sender, **không** kiểm tra dòng `From:` mà người dùng nhìn thấy.',
            },
            {
              title: 'DKIM: nội dung có bị sửa trên đường không, và ai ký?',
              md: 'Bên gửi ký một số header cộng thân thư bằng khoá riêng; khoá công khai nằm ở `selector._domainkey.tenmien` trong DNS. Bên nhận xác minh chữ ký. DKIM chứng minh **tên miền ký** đã chấp nhận thư này và nội dung chưa bị sửa — nhưng tên miền ký cũng không bắt buộc phải trùng với `From:`.',
            },
            {
              title: 'DMARC: buộc hai thứ trên phải khớp với cái người dùng nhìn thấy',
              md: 'DMARC yêu cầu **alignment**: tên miền trong `From:` phải khớp với tên miền đã pass SPF hoặc tên miền đã ký DKIM. Nó cũng công bố chính sách `p=none | quarantine | reject` và địa chỉ nhận báo cáo. Đây chính là mảnh ghép mà SPF và DKIM còn thiếu.',
            },
            {
              title: 'Biến thành đặc trưng',
              md: 'Đọc header `Authentication-Results` do chính cổng thư của bạn ghi: `spf_pass`, `dkim_pass`, `dmarc_pass`, `dmarc_policy` (none/quarantine/reject), `dkim_domain_khop_from`, `spf_domain_khop_from`. Đừng tự chạy lại SPF khi phân tích về sau — kết quả sẽ khác vì bản ghi DNS đã đổi. Đây lại là quy tắc point-in-time.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'DMARC pass KHÔNG có nghĩa là thư an toàn',
          md: 'Đây là hiểu lầm phổ biến nhất về email trong ngành. Kẻ tấn công đăng ký `microsoft-billing[.]cfd`, cấu hình SPF, DKIM và DMARC đầy đủ cho tên miền của **chính họ**, rồi gửi thư. Kết quả: **DMARC pass tuyệt đối**.\n\nDMARC chỉ trả lời câu "thư này có đúng là từ tên miền ghi trong From không". Nó hoàn toàn không trả lời câu "tên miền đó có đáng tin không". Vì vậy đặc trưng có giá trị không phải `dmarc_pass` đứng một mình, mà là **`dmarc_pass` kết hợp với tuổi tên miền, danh tiếng tên miền, và việc tên miền này đã từng gửi thư cho tổ chức bạn bao giờ chưa**.',
        },
        {
          t: 'table',
          caption: 'Đặc trưng từ header thư — phần lớn miễn phí vì cổng thư đã ghi sẵn.',
          head: ['Đặc trưng', 'Bắt được gì', 'Chi phí né tránh'],
          rows: [
            ['reply_to_khac_from', 'Thư giả danh giám đốc để chuyển tiền (BEC): hiện tên sếp, trả lời về hộp thư kẻ tấn công', 'Trung bình — bỏ nó đi thì không nhận được thư trả lời'],
            ['ten_hien_thi_chua_thuong_hieu_nhung_domain_khong', 'Giả mạo thương hiệu ở lớp mắt nhìn', 'Cao — đây chính là mục tiêu của cuộc tấn công'],
            ['lan_dau_ten_mien_nay_gui_toi_to_chuc', 'Tên miền mới toanh với tổ chức bạn, dù hợp lệ về kỹ thuật', 'Cao — kẻ tấn công phải xây lịch sử giao dịch trước'],
            ['so_hop_received', 'Chuỗi chuyển tiếp bất thường, relay mở', 'Thấp'],
            ['lech_mui_gio_trong_header_date', 'Thư nói là từ đồng nghiệp ở Hà Nội nhưng Date ghi UTC-5', 'Thấp — sửa được, nhưng nhiều bộ công cụ quên sửa'],
            ['message_id_khac_domain_gui', 'Công cụ gửi hàng loạt cấu hình cẩu thả', 'Thấp'],
            ['co_tep_dinh_kem_loai_thuc_thi_hoac_nen_co_mat_khau', 'Tệp nén có mật khẩu để vượt quét nội dung', 'Trung bình — nạn nhân phải chịu thêm một bước thao tác'],
          ],
        },
        { t: 'h', text: 'Đặc trưng nội dung: ít hơn bạn tưởng', level: 2 },
        {
          t: 'list',
          items: [
            '**Lệch giữa thương hiệu được nhắc và tên miền đã xác thực.** Thân thư nói về Microsoft 365, DKIM ký bởi `secure-mail[.]sbs`. Trong thực tế đây thường là đặc trưng mạnh nhất của cả bài toán.',
            '**Lệch giữa text hiển thị của liên kết và href thật.** Người dùng thấy `https://portal.office.com`, href trỏ chỗ khác.',
            '**Tỉ lệ ảnh trên chữ.** Thư chỉ có một ảnh lớn là mẹo cũ để vượt bộ lọc dựa trên văn bản — vẫn hiệu quả một cách đáng ngạc nhiên.',
            '**Số liên kết ra ngoài và số tên miền khác nhau trong liên kết.** Thư nội bộ hợp pháp hiếm khi có 14 tên miền khác nhau.',
            '**Từ khoá khẩn cấp.** Có ích, nhưng là đặc trưng bề mặt rẻ nhất trong danh sách này: đổi câu chữ tốn 0 đồng, và các chiến dịch dùng mô hình ngôn ngữ để viết lại đã làm nhóm đặc trưng này yếu đi rõ rệt từ 2023.',
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Nếu chỉ được chọn bốn đặc trưng',
          md: 'Trong hầu hết tổ chức, bốn đặc trưng sau làm được phần lớn công việc: **(1)** tên miền gửi lần đầu tiên giao dịch với tổ chức bạn; **(2)** tuổi tên miền tại thời điểm nhận thư; **(3)** thương hiệu được nhắc trong thân thư không khớp tên miền đã xác thực; **(4)** `Reply-To` khác `From`. Hãy xây bốn cái này trước, đo, rồi mới thêm hai mươi cái còn lại.',
        },
        { t: 'terms', ids: ['dga', 'entropy', 'dac-trung', 'ro-ri-du-lieu'] },
      ],
      keyTakeaways: [
        'Tách tên miền bằng Public Suffix List (tldextract), không bằng cách đếm dấu chấm — sai chỗ này làm hỏng các đặc trưng mạnh nhất.',
        'Entropy Shannon bị chặn bởi log2(độ dài), nên nó tương quan với độ dài; hãy chuẩn hoá hoặc dùng xác suất n-gram ký tự thay thế.',
        'Entropy tốt cho DGA nhưng gần như vô dụng cho phishing giả mạo thương hiệu, vì phishing cố tình trông giống chữ thật.',
        'SPF kiểm tra envelope sender, DKIM chứng minh tên miền ký và tính toàn vẹn, DMARC buộc chúng phải khớp với dòng From người dùng thấy.',
        'DMARC pass chỉ nói thư đúng là từ tên miền đó — kẻ tấn công cấu hình DMARC hoàn hảo cho tên miền của chính họ trong 15 phút.',
        'Bốn đặc trưng làm phần lớn việc: tên miền gửi lần đầu, tuổi tên miền point-in-time, lệch thương hiệu và tên miền xác thực, Reply-To khác From.',
      ],
      cards: [
        {
          id: 't5l2-c1',
          front: 'Vì sao phải dùng Public Suffix List để tách tên miền thay vì đếm dấu chấm?',
          back: 'Vì ranh giới đăng ký không cố định: co.uk, com.vn, github.io, s3.amazonaws.com. Đếm dấu chấm sẽ xác định sai nhãn đăng ký cho hàng chục nghìn tên miền.',
          tags: ['url'],
        },
        {
          id: 't5l2-c2',
          front: 'Entropy Shannon của một chuỗi bị chặn trên bởi giá trị nào, và hệ quả là gì?',
          back: 'Bị chặn bởi log2(độ dài chuỗi). Hệ quả: entropy tương quan mạnh với độ dài, nên so entropy của hai chuỗi khác độ dài là so hai thứ khác nhau — phải chuẩn hoá.',
          tags: ['entropy', 'url'],
        },
        {
          id: 't5l2-c3',
          front: 'DMARC bổ sung điều gì mà SPF và DKIM còn thiếu?',
          back: 'Yêu cầu alignment: tên miền trong dòng From người dùng nhìn thấy phải khớp với tên miền đã pass SPF hoặc đã ký DKIM. SPF và DKIM đều không kiểm tra dòng From.',
          tags: ['email', 'dmarc'],
        },
        {
          id: 't5l2-c4',
          front: 'Vì sao "DMARC pass" một mình không phải đặc trưng an toàn?',
          back: 'Vì kẻ tấn công cấu hình SPF/DKIM/DMARC đầy đủ cho tên miền của chính họ và pass tuyệt đối. DMARC nói thư đúng từ tên miền đó, không nói tên miền đó đáng tin.',
          tags: ['email', 'dmarc'],
        },
        {
          id: 't5l2-c5',
          front: 'Tiền tố xn-- trong tên miền nghĩa là gì, và bắt được kiểu tấn công nào?',
          back: 'Đó là punycode — tên miền chứa ký tự ngoài ASCII đã được mã hoá. Nó là dấu hiệu của tấn công homoglyph, dùng chữ Kirin hoặc Hy Lạp trông giống chữ Latin.',
          tags: ['url', 'homoglyph'],
        },
      ],
      quiz: [
        {
          id: 't5l2-q1',
          kind: 'mcq',
          tags: ['email', 'dmarc'],
          q: 'Một email có `spf=pass`, `dkim=pass`, `dmarc=pass`, gửi từ `microsoft-billing-support[.]cfd`, nội dung yêu cầu cập nhật thông tin thanh toán Microsoft 365. Kết luận đúng nhất?',
          options: [
            'Thư hợp lệ vì cả ba lớp xác thực đều pass',
            'Xác thực chỉ chứng minh thư thật sự đến từ tên miền đó; tên miền đó là của kẻ tấn công, và tổ hợp "DMARC pass + tên miền mới + thương hiệu không khớp" chính là tín hiệu mạnh',
            'Kết quả xác thực chắc chắn bị giả mạo',
            'Cần chạy lại kiểm tra SPF ngay bây giờ để xác nhận',
          ],
          answer: 1,
          why: 'Đây là kịch bản phổ biến nhất của phishing hiện đại và cũng là bài kiểm tra hiểu biết về DMARC. Ba lớp xác thực trả lời câu "thư có đúng từ tên miền ghi trong From không" — chúng pass vì kẻ tấn công sở hữu tên miền đó và cấu hình đúng. Giá trị thật của các trường xác thực nằm ở chỗ chúng cho bạn một **tên miền đáng tin cậy để gắn danh tiếng vào**: khi đã biết chắc thư từ `microsoft-billing-support[.]cfd`, bạn mới hỏi được tên miền này bao nhiêu ngày tuổi, đã từng gửi thư cho công ty chưa, và thương hiệu nó nhắc có khớp không.',
          distractorWhy: [
            'Đây chính là hiểu lầm mà câu hỏi nhắm tới — pass không đồng nghĩa với đáng tin.',
            '',
            'Không có gì bị giả mạo cả; kẻ tấn công cấu hình đúng cho tên miền của họ.',
            'Chạy lại SPF hôm nay cho kết quả của hôm nay, không phải của lúc thư đến — vi phạm quy tắc point-in-time.',
          ],
        },
        {
          id: 't5l2-q2',
          kind: 'match',
          tags: ['url', 'email'],
          q: 'Nối mỗi đặc trưng với kiểu tấn công mà nó nhắm tới.',
          pairs: [
            ['Tiền tố xn-- trong host', 'Homoglyph giả dạng thương hiệu bằng ký tự Kirin'],
            ['Xác suất n-gram ký tự thấp so với mô hình ngôn ngữ nền', 'Tên miền sinh tự động bởi DGA'],
            ['Reply-To khác From, tên hiển thị là tên giám đốc', 'Giả danh lãnh đạo yêu cầu chuyển tiền (BEC)'],
            ['Thương hiệu nằm ở nhãn con chứ không phải nhãn đăng ký', 'Phishing giả mạo trang đăng nhập'],
          ],
          why: 'Mỗi kiểu tấn công để lại dấu vết ở một chỗ khác nhau, và đây là lý do không có "bộ đặc trưng URL vạn năng". Nếu bạn chỉ xây đặc trưng cho DGA rồi mang đi bắt phishing thương hiệu, bạn sẽ không bắt được gì — vì phishing thương hiệu cố ý giữ entropy và n-gram trông tự nhiên.',
        },
        {
          id: 't5l2-q3',
          kind: 'input',
          tags: ['url'],
          q: 'Tên của danh sách chuẩn (do Mozilla duy trì) dùng để xác định đúng ranh giới tên miền đăng ký, ví dụ biết rằng `com.vn` và `github.io` là hậu tố chứ không phải tên miền, là gì?',
          accept: ['public suffix list', 'psl', 'publicsuffixlist', 'danh sach hau to cong khai'],
          placeholder: 'Gõ tên danh sách…',
          hint: 'Ba từ tiếng Anh, viết tắt là PSL.',
          why: 'Public Suffix List (PSL). Thư viện `tldextract` và `publicsuffix2` trong Python đều dùng nó. Nếu không có PSL, bạn sẽ coi `github` là nhãn con của `io` — đúng về mặt DNS nhưng vô nghĩa về mặt bảo mật, vì mỗi người dùng GitHub Pages có một `github.io` riêng và chúng độc lập với nhau về mặt tin cậy.',
        },
        {
          id: 't5l2-q4',
          kind: 'truefalse',
          tags: ['url', 'thuc-chien'],
          q: 'Vì `.com` là TLD chứa nhiều URL phishing nhất về số tuyệt đối nên TLD là đặc trưng vô dụng.',
          answer: false,
          why: 'Hai chuyện khác nhau: **số tuyệt đối** và **tỉ lệ**. `.com` dẫn đầu về số tuyệt đối vì nó lớn hơn tất cả các TLD khác cộng lại; nhưng tỉ lệ URL độc hại trên tổng số tên miền đăng ký của một số TLD giá rẻ cao hơn nhiều lần. Mô hình học chính là tỉ lệ đó, không phải số tuyệt đối. Điều cần tránh là dùng TLD như bằng chứng đơn lẻ để kết luận — nó là một tín hiệu yếu, có ích khi cộng với tuổi tên miền và lịch sử giao dịch.',
        },
      ],
      terms: ['dga', 'entropy', 'dac-trung', 'ro-ri-du-lieu', 'punycode', 'dmarc'],
      further: [
        {
          title: 'RFC 7489 — Domain-based Message Authentication, Reporting and Conformance (DMARC)',
          note: 'Đọc riêng mục về alignment. Hai trang đó giải thích chính xác điều DMARC bảo đảm và điều nó không bảo đảm.',
        },
        {
          title: 'Unicode Technical Standard #39 — Unicode Security Mechanisms',
          note: 'Nguồn chuẩn cho bảng confusables và quy tắc phát hiện trộn hệ chữ. Dùng trực tiếp được để xây đặc trưng homoglyph.',
        },
        {
          title: 'tldextract — thư viện Python',
          note: 'Nhỏ, không phụ thuộc gì nặng, có cache PSL cục bộ. Thay thế cho việc tự viết hàm tách tên miền mà ai cũng viết sai lần đầu.',
        },
      ],
    },
    /* ====================================================================== */
    {
      id: 't5-l3',
      trackId: 'dac-trung',
      title: 'Đặc trưng tệp thực thi (PE)',
      subtitle: 'Biến 340 kilobyte nhị phân thành 2.381 con số mà không cần chạy tệp',
      minutes: 20,
      level: 'trung-cap',
      prereqs: ['t5-l1', 't1-l5'],
      why: {
        short:
          'Phân tích tĩnh tệp PE là bài toán ML lâu đời nhất và vẫn phổ biến nhất trong bảo mật endpoint; hiểu bộ đặc trưng của nó là điều kiện để đọc được mọi báo cáo, sản phẩm và bài báo trong lĩnh vực này.',
        scenario:
          'Đội bạn nhận 40.000 tệp thực thi mới mỗi ngày từ các endpoint. Sandbox chỉ chạy được 2.000 tệp/ngày vì mỗi tệp mất 3 phút. Bạn cần một bộ chấm điểm tĩnh chạy trong 50 mili-giây/tệp để quyết định 2.000 tệp nào được vào sandbox.',
        roles: ['Malware Analyst', 'Security Data Scientist', 'Detection Engineer', 'ML Engineer'],
        costOfNotKnowing:
          'Bạn hoặc là ném byte thô vào một mạng nơ-ron và không giải thích được gì cho analyst, hoặc là tự phát minh lại một bộ đặc trưng kém hơn EMBER — trong khi bộ chuẩn đã có sẵn, miễn phí, và được kiểm chứng trên hàng triệu mẫu.',
      },
      objectives: [
        'Chỉ ra được các trường của PE header mang tín hiệu và giải thích vì sao',
        'Tính entropy theo từng section và đọc đúng ý nghĩa của nó, kể cả khi nó gây hiểu nhầm',
        'Liệt kê tám nhóm đặc trưng của EMBER và nêu vai trò của từng nhóm',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Bạn có một tệp `.exe` 340 KB. Không được chạy nó, không có sandbox, không có kết nối Internet để tra hash. Bạn có 50 mili-giây. Câu hỏi: những con số nào lấy được từ tệp này, và con số nào trong đó thực sự nói lên điều gì?',
        },
        { t: 'h', text: 'Bản đồ một tệp PE trong sáu mươi giây', level: 2 },
        {
          t: 'list',
          ordered: true,
          items: [
            '**DOS header** — hai byte đầu là `MZ`. Ở offset `0x3C` có trường `e_lfanew`, trỏ tới đầu của PE header thật.',
            '**PE signature** — bốn byte `PE` cộng hai byte 0.',
            '**COFF File Header** — kiến trúc (`Machine`), số section, `TimeDateStamp`, cờ `Characteristics`.',
            '**Optional Header** — thực ra bắt buộc. Chứa `AddressOfEntryPoint`, `ImageBase`, `Subsystem` (GUI hay console), và `DllCharacteristics` với các cờ bảo vệ ASLR, DEP, CFG.',
            '**Section table** — mỗi section 40 byte: tên, `VirtualSize`, `VirtualAddress`, `SizeOfRawData`, `PointerToRawData`, quyền đọc/ghi/thực thi.',
            '**Các section** — `.text` (mã), `.data` (dữ liệu ghi được), `.rdata` (chỉ đọc, thường chứa bảng import), `.rsrc` (tài nguyên: icon, ảnh, chuỗi).',
            '**Data directories** — trỏ tới bảng import, export, tài nguyên, thông tin gỡ lỗi, chữ ký số.',
            '**Overlay** — phần dữ liệu nằm sau section cuối cùng, không được ánh xạ vào bộ nhớ. Nhiều trình cài đặt và không ít mã độc giấu payload ở đây.',
          ],
        },
        {
          t: 'table',
          caption: 'Trường header mang tín hiệu và mức chi phí né tránh của chúng.',
          head: ['Trường', 'Tín hiệu', 'Chi phí né tránh'],
          rows: [
            ['so_section', 'Bình thường 4–6; số quá ít hoặc quá nhiều là bất thường', 'Thấp'],
            ['ten_section bất thường (UPX0, .aspack, chuỗi ngẫu nhiên)', 'Đã qua packer', 'Rất thấp — đổi tên section là sửa vài byte'],
            ['TimeDateStamp', 'Ngày biên dịch; trong tương lai hoặc năm 1970 là dấu hiệu bị làm giả', 'Rất thấp — ghi đè được'],
            ['DllCharacteristics thiếu ASLR/DEP', 'Trình biên dịch cũ hoặc cố tình tắt để dễ khai thác', 'Thấp'],
            ['co_chu_ky_so + chuỗi chứng chỉ hợp lệ', 'Rất mạnh về phía LÀNH tính', 'Cao — phải mua hoặc trộm chứng chỉ ký mã'],
            ['AddressOfEntryPoint nằm ngoài section .text', 'Điển hình của tệp bị nén hoặc bị tiêm', 'Trung bình'],
            ['kich_thuoc_overlay', 'Payload giấu sau section cuối', 'Trung bình'],
            ['ti_le_VirtualSize_tren_SizeOfRawData', 'Section khai báo lớn trong bộ nhớ nhưng gần rỗng trên đĩa — dấu hiệu kinh điển của packer', 'Trung bình'],
          ],
        },
        { t: 'h', text: 'Entropy theo section: đặc trưng nổi tiếng nhất và bị lạm dụng nhất', level: 2 },
        {
          t: 'p',
          md: 'Entropy Shannon tính trên byte cho giá trị từ 0 tới 8 bit/byte. Mã máy chưa nén thường nằm quanh 6,0–6,8. Dữ liệu đã nén hoặc đã mã hoá tiến sát 8,0 vì phân phối byte gần đều. Section do UPX tạo ra thường rơi vào khoảng 7,5–7,9.',
        },
        {
          t: 'predict',
          question:
            'Bạn đặt luật: entropy của bất kỳ section nào vượt 7,5 thì gắn cờ "nghi ngờ đã nén". Bạn chạy nó trên 100.000 tệp lành tính lấy từ máy trạm doanh nghiệp thật. Bạn nghĩ tỉ lệ gắn cờ sẽ là bao nhiêu, và cái gì bị gắn?',
          reveal:
            'Tỉ lệ sẽ cao đến mức làm luật vô dụng, và thủ phạm hầu hết là phần mềm hoàn toàn hợp pháp:\n\n- **Trình cài đặt** (Inno Setup, NSIS, InstallShield) nhét toàn bộ payload nén vào `.rsrc` hoặc overlay.\n- **Section `.rsrc` chứa ảnh** PNG/JPEG — đã nén sẵn theo định dạng, entropy gần 8.\n- **Ứng dụng .NET** đóng gói tài nguyên nhúng.\n- **Trình bảo vệ bản quyền thương mại** (VMProtect, Themida, Denuvo) — dùng rộng rãi trong game và phần mềm trả tiền.\n- **Chính các sản phẩm bảo mật** cũng thường đóng gói và làm rối mã của mình.\n\nBài học: entropy cao nói **"có dữ liệu nén hoặc mã hoá ở đây"**, chứ tuyệt đối không nói **"đây là mã độc"**. Nó chỉ có giá trị khi kết hợp với những đặc trưng khác: bảng import nghèo nàn, không có chữ ký số, tỉ lệ VirtualSize trên SizeOfRawData bất thường, tên section lạ.',
        },
        { t: 'figure', id: 'fig-entropy-scale', caption: 'Thang entropy byte. Vùng trên 7,5 chứa cả packer mã độc lẫn trình cài đặt hợp pháp — nó là câu hỏi, không phải câu trả lời.' },
        { t: 'h', text: 'Bảng imports: thứ gần với hành vi nhất mà bạn lấy được tĩnh', level: 2 },
        {
          t: 'p',
          md: 'Bảng import liệt kê các hàm mà tệp gọi từ DLL hệ thống. Đây là nhóm đặc trưng có chi phí né tránh **cao nhất** trong phân tích tĩnh, vì một chương trình muốn tiêm mã vào tiến trình khác thì cuối cùng vẫn phải gọi tới những hàm đó.',
        },
        {
          t: 'table',
          caption: 'Tổ hợp API và kỹ thuật tương ứng trong MITRE ATT&CK.',
          head: ['Tổ hợp import', 'Kỹ thuật', 'ATT&CK'],
          rows: [
            ['VirtualAllocEx + WriteProcessMemory + CreateRemoteThread', 'Tiêm mã vào tiến trình khác', 'T1055'],
            ['CryptAcquireContext / BCryptEncrypt + FindFirstFile + MoveFileEx', 'Mã hoá hàng loạt tệp (ransomware)', 'T1486'],
            ['SetWindowsHookEx / GetAsyncKeyState', 'Ghi phím', 'T1056.001'],
            ['IsDebuggerPresent + CheckRemoteDebuggerPresent + NtQueryInformationProcess', 'Chống phân tích', 'T1622'],
            ['InternetOpenUrl / WinHttpSendRequest + CreateProcess', 'Tải và chạy giai đoạn tiếp theo', 'T1105'],
            ['CreateServiceA + RegSetValueEx (Run key)', 'Duy trì hiện diện', 'T1543 / T1547'],
            ['Chỉ có LoadLibraryA + GetProcAddress', 'Phân giải API động — chính là cách né bảng import', 'T1027'],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Bảng import trống cũng là một tín hiệu',
          md: 'Dòng cuối bảng trên rất quan trọng. Khi kẻ tấn công muốn giấu ý định, họ chỉ import `LoadLibraryA` và `GetProcAddress` rồi phân giải mọi hàm khác lúc chạy. Kết quả là bảng import gần rỗng.\n\nNhưng một chương trình Windows bình thường làm gì cũng cần vài chục hàm. Một tệp 800 KB mà chỉ import 3 hàm là **cực kỳ bất thường**. Vậy nên đặc trưng `so_ham_import` có giá trị ở **cả hai đầu**: quá nhiều hàm nhạy cảm là dấu hiệu, mà quá ít hàm cũng là dấu hiệu. Đây là ví dụ điển hình của quan hệ hình chữ U mà mô hình tuyến tính không học được nếu bạn không chia khoảng (nhắc lại bài t3-l2).',
        },
        {
          t: 'p',
          md: '**Imphash** (Mandiant, 2014) là MD5 của danh sách `thuvien.hamso` viết thường theo đúng thứ tự xuất hiện. Hai tệp cùng imphash thường được dựng từ cùng một mã nguồn và cùng trình biên dịch — rất hữu ích để **gom cụm** mẫu theo nhóm tấn công. Giới hạn: với tệp đã nén, bảng import chỉ còn vài hàm nên imphash của mọi tệp nén bằng cùng một packer đều giống nhau, và nó nói về packer chứ không nói về mã độc.',
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'Olympic Destroyer: khi đặc trưng quy kết bị dùng làm vũ khí',
          md: 'Tháng 2/2018, mã độc Olympic Destroyer phá hạ tầng CNTT của Thế vận hội Mùa đông PyeongChang. Các nhà nghiên cứu tìm thấy trong **Rich header** — một khối metadata không có tài liệu chính thức do trình liên kết của Microsoft ghi vào — dấu vết trùng khớp với công cụ của nhóm Lazarus.\n\nĐội của Kaspersky sau đó chứng minh Rich header đã bị **giả mạo có chủ đích**: nó không nhất quán với các đặc điểm khác của tệp. Đây là một chiến dịch cắm cờ giả.\n\nBài học cho người làm đặc trưng: các trường metadata như Rich header, `TimeDateStamp`, đường dẫn PDB rất hữu ích để **gom cụm và điều tra**, nhưng chúng nằm hoàn toàn dưới quyền kiểm soát của kẻ tấn công. Đừng bao giờ để một mô hình đưa ra quyết định chặn dựa chủ yếu vào chúng, và tuyệt đối đừng dùng chúng làm cơ sở quy kết.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't5l3-cp1',
              kind: 'mcq',
              tags: ['pe', 'entropy'],
              q: 'Một tệp có entropy section `.rsrc` bằng 7,94, ba section, không có chữ ký số, và bảng import chỉ gồm `LoadLibraryA`, `GetProcAddress`, `VirtualAlloc`. Cách diễn giải đúng nhất?',
              options: [
                'Entropy 7,94 chứng minh đây là mã độc',
                'Ba tín hiệu độc lập cùng chỉ về một hướng: tệp bị nén và cố tình giấu ý định — đủ để ưu tiên đưa vào sandbox, chưa đủ để kết luận',
                'Bảng import nhỏ chứng tỏ tệp vô hại vì nó không làm được gì',
                'Không có tín hiệu nào đáng chú ý, đây là tệp bình thường',
              ],
              answer: 1,
              why: 'Không đặc trưng nào ở đây đủ mạnh một mình: trình cài đặt hợp pháp cũng có `.rsrc` entropy cao, phần mềm nội bộ cũng thường không ký số. Sức mạnh nằm ở **sự đồng thời**: entropy cao + import gần rỗng + không ký = tệp này cố tình che giấu những gì nó sẽ làm. Đó chính xác là loại kết luận mà mô hình được sinh ra để đưa ra, và cũng chính xác là loại quyết định đúng ở đây — ưu tiên phân tích động, chứ không phải chặn ngay.',
              distractorWhy: [
                'Entropy cao xuất hiện ở vô số phần mềm hợp pháp; nó là câu hỏi chứ không phải câu trả lời.',
                '',
                'Ngược lại: import gần rỗng là cách né bảng import, và bản thân nó bất thường.',
                'Ba tín hiệu cùng lúc thì không thể gọi là bình thường được.',
              ],
            },
            {
              id: 't5l3-cp2',
              kind: 'truefalse',
              tags: ['pe', 'ne-tranh'],
              q: 'Imphash là đặc trưng tốt để phát hiện mã độc chưa từng thấy.',
              answer: false,
              why: 'Imphash là công cụ **gom cụm**, không phải công cụ phát hiện. Nó là một hash: hoặc trùng khớp hoàn toàn, hoặc không nói gì cả — không có khái niệm "gần giống". Giá trị của nó là nối mẫu mới với gia đình mã độc đã biết dựa trên cùng trình dựng. Muốn phát hiện cái chưa từng thấy, bạn cần chính **danh sách các hàm được import** như đặc trưng nhị phân thưa (mỗi hàm một cột), để mô hình học được rằng tổ hợp nào đáng ngờ.',
            },
          ],
        },
        { t: 'h', text: 'Chuỗi ký tự và byte n-gram', level: 2 },
        {
          t: 'p',
          md: 'Rút chuỗi in được dài từ 5 ký tự trở lên (cả ASCII lẫn UTF-16LE — bỏ quên UTF-16 là lỗi rất phổ biến trên Windows). Từ tập chuỗi đó, đặc trưng hữu ích gồm: tổng số chuỗi, độ dài trung bình, entropy của tập ký tự in được, số chuỗi trông giống URL, số chuỗi giống đường dẫn tệp, số chuỗi giống khoá registry, và số chuỗi trông giống mã base64.',
        },
        {
          t: 'p',
          md: '**Byte n-gram** từng là kỹ thuật thống trị giai đoạn 2005–2015: đếm tần suất mọi chuỗi 4 byte liên tiếp. Vấn đề là không gian có `256^4 ≈ 4,3 tỉ` khả năng, nên phải chọn top-k theo tần suất hoặc dùng hashing trick (bài t5-l6). Các nghiên cứu quy mô lớn sau này cho thấy phần lớn n-gram được chọn thực ra bám vào tạo tác của trình biên dịch và của quy trình thu thập mẫu, chứ không bám vào hành vi độc hại — nghĩa là chúng tổng quát hoá kém sang mẫu mới. Ngày nay chúng vẫn xuất hiện, nhưng ở dạng **histogram byte** (256 chiều) đơn giản hơn nhiều.',
        },
        { t: 'h', text: 'EMBER: bộ đặc trưng chuẩn để bạn không phải phát minh lại', level: 2 },
        {
          t: 'p',
          md: '**EMBER** (Endgame Malware BEnchmark for Research, Anderson & Roth, 2018) là bộ dữ liệu mở gồm khoảng 1,1 triệu tệp PE, trong đó 900.000 mẫu huấn luyện (300k độc, 300k lành, 300k không nhãn) và 200.000 mẫu kiểm tra. Điểm quan trọng hơn cả dữ liệu: EMBER công bố **mã trích đặc trưng** biến một tệp PE thành vector 2.381 chiều, và cả ngành lấy đó làm chuẩn so sánh.',
        },
        {
          t: 'table',
          caption: 'Tám nhóm đặc trưng của EMBER v2 — cộng lại đúng 2.381 chiều.',
          head: ['Nhóm', 'Số chiều', 'Nội dung'],
          rows: [
            ['ByteHistogram', '256', 'Tần suất từng giá trị byte trên toàn tệp'],
            ['ByteEntropyHistogram', '256', 'Histogram hai chiều: entropy cục bộ theo cửa sổ trượt kết hợp với giá trị byte'],
            ['StringExtractor', '104', 'Số chuỗi, độ dài trung bình, histogram ký tự in được, số URL / đường dẫn / khoá registry'],
            ['GeneralFileInfo', '10', 'Kích thước, số import, số export, có chữ ký số hay không, có tài nguyên hay không'],
            ['HeaderFileInfo', '62', 'Machine, subsystem, TimeDateStamp, DllCharacteristics, phiên bản trình liên kết'],
            ['SectionInfo', '255', 'Tên, kích thước, entropy, quyền của từng section (băm về không gian cố định)'],
            ['ImportsInfo', '1280', 'Tập DLL và hàm được import, băm về không gian cố định'],
            ['ExportsInfo', '128', 'Tên các hàm được export, băm về không gian cố định'],
            ['DataDirectories', '30', 'Kích thước và vị trí của 15 data directory'],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Vì sao nhóm Imports chiếm hơn một nửa số chiều',
          md: 'Nhìn bảng trên: `ImportsInfo` một mình chiếm 1.280 trong 2.381 chiều. Đó không phải ngẫu nhiên. Các tác giả dồn nhiều chiều nhất cho nhóm đặc trưng có chi phí né tránh cao nhất — đúng nguyên tắc của bài t5-l1. Khi bạn thiết kế bộ đặc trưng của riêng mình, hãy phân bổ ngân sách chiều theo cùng logic đó, đừng chia đều.',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'EMBER là chuẩn so sánh, không phải mô hình sản phẩm',
          md: 'Đường cơ sở LightGBM trên EMBER đạt ROC-AUC rất cao (trên 0,99 theo tài liệu của dự án). Đừng để con số đó đánh lừa bạn theo ba cách:\n\n**(1)** ROC-AUC gây hiểu nhầm khi mất cân bằng — hãy đọc tỉ lệ phát hiện tại FPR 0,1% hoặc 0,01%, con số đó khiêm tốn hơn nhiều (bài t4-l3).\n\n**(2)** EMBER2018 là mẫu của năm 2018. Phân phối mã độc năm 2026 đã khác hẳn: nhiều .NET hơn, nhiều loader hơn, nhiều tệp ký số bị lạm dụng hơn. Kết quả trên EMBER không dự đoán được kết quả trên lưu lượng của bạn.\n\n**(3)** Tập lành tính của EMBER không phải tập lành tính của công ty bạn — nơi có phần mềm kế toán nội bộ, công cụ tự viết và ứng dụng cũ không ký số.\n\nMột bộ dữ liệu quy mô lớn hơn đáng biết là **SOREL-20M** (Sophos và ReversingLabs, 2020) với khoảng 20 triệu mẫu kèm đặc trưng đã trích sẵn.',
        },
        { t: 'lab', id: 'lab-pe-features', intro: 'Mở một tệp PE giả lập, xem từng section và bảng import hiện ra, rồi thử "nén" nó và quan sát entropy cùng bảng import thay đổi thế nào.' },
        {
          t: 'code',
          lang: 'python',
          caption: 'Trích đặc trưng PE bằng pefile — bản tối giản nhưng đủ để bắt đầu',
          code:
            "import math\n" +
            "import pefile  # pip install pefile\n" +
            "\n" +
            "def entropy_byte(b):\n" +
            "    if not b:\n" +
            "        return 0.0\n" +
            "    dem = [0] * 256\n" +
            "    for x in b:\n" +
            "        dem[x] += 1\n" +
            "    n = len(b)\n" +
            "    return -sum((c / n) * math.log2(c / n) for c in dem if c)\n" +
            "\n" +
            "pe = pefile.PE('mau.exe')\n" +
            "dt = {\n" +
            "    'so_section': len(pe.sections),\n" +
            "    'timestamp': pe.FILE_HEADER.TimeDateStamp,\n" +
            "    'entry_point': pe.OPTIONAL_HEADER.AddressOfEntryPoint,\n" +
            "    'co_aslr': int(bool(pe.OPTIONAL_HEADER.DllCharacteristics & 0x0040)),\n" +
            "    'co_dep': int(bool(pe.OPTIONAL_HEADER.DllCharacteristics & 0x0100)),\n" +
            "}\n" +
            "\n" +
            "for s in pe.sections:\n" +
            "    ten = s.Name.decode('latin-1').rstrip(chr(0)) or 'khong_ten'\n" +
            "    dt['ent_' + ten] = round(entropy_byte(s.get_data()), 3)\n" +
            "    # VirtualSize lớn hơn nhiều SizeOfRawData: dấu hiệu kinh điển của packer\n" +
            "    dt['ao_tren_that_' + ten] = round(\n" +
            "        s.Misc_VirtualSize / max(s.SizeOfRawData, 1), 2)\n" +
            "\n" +
            "imp = [(d.dll.decode().lower(), f.name.decode().lower())\n" +
            "       for d in getattr(pe, 'DIRECTORY_ENTRY_IMPORT', [])\n" +
            "       for f in d.imports if f.name]\n" +
            "dt['so_dll'] = len({d for d, _ in imp})\n" +
            "dt['so_ham_import'] = len(imp)      # có giá trị ở CẢ HAI đầu: quá ít cũng lạ\n" +
            "dt['imphash'] = pe.get_imphash()    # để gom cụm, không phải để phát hiện\n",
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Nguồn gốc mẫu quyết định mô hình học được gì',
          md: 'Nhắc lại chuyện UPX ở bài t0-l1, giờ với chi tiết kỹ thuật. Nếu mẫu độc của bạn tải từ VirusShare hoặc MalwareBazaar còn mẫu lành lấy từ `C:\\Windows\\System32` của một máy Windows sạch, mô hình sẽ học được ba thứ, không cái nào liên quan tới hành vi độc hại:\n\n- Mẫu lành **đều có chữ ký số của Microsoft**; mẫu độc thì không.\n- Mẫu lành có `TimeDateStamp` tập trung quanh vài ngày phát hành bản vá.\n- Mẫu lành có phân bố kích thước và phiên bản trình liên kết rất hẹp.\n\nKết quả: AUC 0,999 và một mô hình chỉ biết trả lời câu "tệp này có phải do Microsoft ký không". Cách chữa duy nhất là **kiểm soát nguồn thu thập**: lấy mẫu lành từ chính máy trạm thật của tổ chức bạn, gồm cả phần mềm nội bộ không ký số, phần mềm kế toán cũ, và công cụ do phòng IT tự viết.',
        },
        { t: 'terms', ids: ['pe', 'ember', 'entropy', 'attck', 'dac-trung'] },
      ],
      keyTakeaways: [
        'Bảng import là nhóm đặc trưng tĩnh có chi phí né tránh cao nhất — EMBER dành cho nó 1.280 trong 2.381 chiều và đó là quyết định thiết kế có chủ ý.',
        'Entropy cao nói "có dữ liệu nén hoặc mã hoá", không nói "độc hại": trình cài đặt, ảnh trong .rsrc, .NET và trình bảo vệ bản quyền đều vượt 7,5.',
        'Số hàm import có giá trị ở cả hai đầu: quá nhiều hàm nhạy cảm là dấu hiệu, mà gần như không import gì cũng là dấu hiệu (phân giải API động).',
        'Imphash dùng để gom cụm mẫu theo trình dựng, không dùng để phát hiện mẫu chưa từng thấy — nó là hash, không có khái niệm gần giống.',
        'Metadata như Rich header và TimeDateStamp nằm dưới quyền kiểm soát của kẻ tấn công; Olympic Destroyer 2018 là ví dụ chúng bị giả mạo để cắm cờ giả.',
        'EMBER là chuẩn so sánh chứ không phải mô hình sản phẩm; dữ liệu 2018 không đại diện cho phân phối 2026 và tập lành tính của nó không giống tổ chức bạn.',
      ],
      cards: [
        {
          id: 't5l3-c1',
          front: 'Vì sao bảng imports là nhóm đặc trưng tĩnh có chi phí né tránh cao nhất?',
          back: 'Vì muốn tiêm mã, mã hoá tệp hay ghi phím thì cuối cùng vẫn phải gọi các API tương ứng. Né được bằng phân giải động, nhưng phải bỏ công và tự tạo ra một bất thường khác: bảng import gần rỗng.',
          tags: ['pe', 'ne-tranh'],
        },
        {
          id: 't5l3-c2',
          front: 'Entropy section vượt 7,5 nghĩa là gì, và KHÔNG nghĩa là gì?',
          back: 'Nghĩa là có dữ liệu đã nén hoặc mã hoá ở đó. Không nghĩa là độc hại — trình cài đặt, ảnh trong .rsrc, ứng dụng .NET và trình bảo vệ bản quyền thương mại đều vượt ngưỡng này.',
          tags: ['pe', 'entropy'],
        },
        {
          id: 't5l3-c3',
          front: 'Imphash là gì và dùng để làm gì?',
          back: 'MD5 của danh sách thuvien.hamso được import theo đúng thứ tự. Dùng để gom cụm mẫu cùng trình dựng hoặc cùng mã nguồn, không dùng để phát hiện mẫu mới.',
          tags: ['pe'],
        },
        {
          id: 't5l3-c4',
          front: 'Vector đặc trưng EMBER có bao nhiêu chiều, và nhóm nào chiếm nhiều nhất?',
          back: '2.381 chiều. Nhóm ImportsInfo chiếm 1.280 chiều — hơn một nửa, vì đó là nhóm khó né nhất.',
          hint: 'Một con số bốn chữ số bắt đầu bằng 2.',
          tags: ['pe', 'ember'],
        },
        {
          id: 't5l3-c5',
          front: 'Vì sao lấy mẫu lành tính từ C:\\Windows\\System32 làm hỏng mô hình phân loại mã độc?',
          back: 'Vì mọi mẫu lành khi đó đều có chữ ký số của Microsoft, timestamp tập trung và kích thước hẹp. Mô hình học "có chữ ký Microsoft = lành" thay vì học hành vi độc hại.',
          tags: ['pe', 'tuong-quan-gia'],
        },
      ],
      quiz: [
        {
          id: 't5l3-q1',
          kind: 'mcq',
          tags: ['pe', 'ember'],
          q: 'Vì sao EMBER băm tập hàm import về một không gian cố định 1.280 chiều thay vì tạo một cột cho mỗi hàm?',
          options: [
            'Vì băm làm mô hình chính xác hơn cột riêng',
            'Vì số hàm khác nhau trên hàng triệu tệp là rất lớn và luôn tăng; băm cho vector độ dài cố định, không cần từ điển, và xử lý được hàm chưa từng thấy',
            'Vì bảng import không quan trọng nên không đáng dành nhiều cột',
            'Vì băm giúp che giấu thông tin nhạy cảm trong tệp',
          ],
          answer: 1,
          why: 'Đây chính là hashing trick mà bạn sẽ học kỹ ở bài t5-l6. Vấn đề: tập hàm có thể được import là không giới hạn và mở rộng theo thời gian, nên một từ điển cố định sẽ luôn lỗi thời và sẽ vỡ khi gặp tệp dùng hàm chưa có trong từ điển. Băm về không gian cố định giải quyết cả hai: vector luôn cùng độ dài, không cần lưu từ điển, và hàm mới rơi vào một ô nào đó thay vì bị bỏ qua. Cái giá phải trả là va chạm băm và mất khả năng truy ngược một chiều về tên hàm.',
          distractorWhy: [
            'Băm hầu như luôn làm mất một chút thông tin; nó đổi độ chính xác lấy tính khả thi vận hành.',
            '',
            'Ngược lại hoàn toàn: imports được dành nhiều chiều nhất trong toàn bộ vector.',
            'Không liên quan tới quyền riêng tư; đây là quyết định kỹ thuật về không gian đặc trưng.',
          ],
        },
        {
          id: 't5l3-q2',
          kind: 'multi',
          tags: ['pe'],
          q: 'Tệp nào sau đây có thể có entropy section vượt 7,5 mà hoàn toàn lành tính? (Chọn tất cả đáp án đúng)',
          options: [
            'Trình cài đặt tạo bằng Inno Setup hoặc NSIS',
            'Ứng dụng có nhiều ảnh PNG nhúng trong section .rsrc',
            'Game thương mại dùng trình bảo vệ bản quyền như VMProtect',
            'Chương trình C nhỏ biên dịch không tối ưu, chỉ có .text và .data',
          ],
          answers: [0, 1, 2],
          why: 'Ba trường hợp đầu đều chứa dữ liệu đã nén hoặc đã mã hoá bằng thiết kế: payload nén trong trình cài đặt, ảnh PNG vốn đã nén sẵn, mã bị làm rối và mã hoá bởi trình bảo vệ. Trường hợp cuối thì ngược lại — mã máy chưa nén thường nằm quanh 6,0–6,8 bit/byte vì opcode x86 có phân phối rất lệch. Đây là lý do entropy phải luôn đi kèm ngữ cảnh: section nào, tệp có ký số không, bảng import ra sao.',
        },
        {
          id: 't5l3-q3',
          kind: 'truefalse',
          tags: ['pe', 'quy-ket'],
          q: 'Nếu Rich header của một mẫu trùng với công cụ của một nhóm APT đã biết thì có thể quy kết mẫu đó cho nhóm APT ấy.',
          answer: false,
          why: 'Olympic Destroyer (2018) là phản ví dụ nổi tiếng nhất: Rich header bị giả mạo có chủ đích để trỏ về Lazarus, và các nhà nghiên cứu phát hiện ra vì nó không nhất quán với các đặc điểm khác của tệp. Nguyên tắc chung: mọi trường metadata nằm trong tệp đều nằm dưới quyền kiểm soát của người tạo tệp. Chúng có giá trị để gom cụm và làm giả thuyết điều tra, nhưng quy kết cần bằng chứng độc lập từ nhiều nguồn — hạ tầng, thời điểm hoạt động, kỹ thuật vận hành.',
        },
        {
          id: 't5l3-q4',
          kind: 'order',
          tags: ['pe'],
          q: 'Sắp xếp các phần của một tệp PE theo đúng thứ tự từ đầu tệp.',
          items: [
            'DOS header với hai byte MZ và trường e_lfanew',
            'PE signature',
            'COFF File Header (Machine, số section, TimeDateStamp)',
            'Optional Header (AddressOfEntryPoint, DllCharacteristics)',
            'Bảng section header',
            'Dữ liệu của các section (.text, .rdata, .data, .rsrc)',
            'Overlay — phần nằm sau section cuối cùng',
          ],
          why: 'Biết thứ tự này không phải để học thuộc mà để hiểu vì sao `e_lfanew` tồn tại: PE header không nằm ở vị trí cố định, nên mọi trình phân tích đều phải đọc con trỏ ở offset 0x3C trước. Và biết overlay nằm cuối, ngoài mọi section, giải thích vì sao nhiều công cụ phân tích bỏ sót nó — đó chính là lý do nó là chỗ giấu payload phổ biến.',
        },
      ],
      terms: ['pe', 'ember', 'entropy', 'attck', 'dac-trung', 'imphash'],
      further: [
        {
          title: 'EMBER: An Open Dataset for Training Static PE Malware Machine Learning Models — Anderson & Roth (2018)',
          note: 'Đọc mục mô tả từng nhóm đặc trưng. Đây là tài liệu ngắn nhất giải thích vì sao mỗi nhóm tồn tại, và mã nguồn đi kèm chạy được ngay.',
        },
        {
          title: 'Microsoft PE Format Specification',
          note: 'Tài liệu gốc. Không cần đọc hết — chỉ cần mục Section Table và Optional Header là đủ cho 90% công việc trích đặc trưng.',
        },
        {
          title: 'SOREL-20M — Sophos và ReversingLabs (2020)',
          note: 'Khoảng 20 triệu mẫu PE với đặc trưng đã trích sẵn và nhãn theo từng loại hành vi. Lớn hơn EMBER nhiều bậc, dùng khi bạn cần quy mô thật.',
        },
      ],
    },
    /* ====================================================================== */
    {
      id: 't5-l4',
      trackId: 'dac-trung',
      title: 'Đặc trưng luồng mạng',
      subtitle: 'Khi bạn không đọc được nội dung, hình dạng của cuộc trò chuyện là tất cả những gì bạn có',
      minutes: 20,
      level: 'trung-cap',
      prereqs: ['t5-l1', 't2-l1'],
      why: {
        short:
          'Hơn 95% lưu lượng web đã mã hoá, nên phát hiện dựa trên nội dung gói tin gần như hết đường; đặc trưng metadata luồng mạng là thứ còn lại — và nó bám vào bất biến nên rất bền.',
        scenario:
          'Zeek của bạn ghi 400 triệu bản ghi `conn.log` mỗi ngày. Đội ứng cứu vừa xác nhận một máy trạm bị cài beacon Cobalt Strike ba tuần trước và không ai thấy. Bạn phải xây bộ đặc trưng để lần sau nó không lọt, mà không được đọc nội dung TLS.',
        roles: ['Threat Hunter', 'Detection Engineer', 'Security Data Scientist', 'SOC Analyst'],
        costOfNotKnowing:
          'Bạn mãi dừng ở việc so khớp danh sách IP xấu — thứ mà kẻ tấn công vô hiệu hoá bằng cách thuê một VPS mới giá 5 đô la — thay vì phát hiện hình dạng liên lạc mà họ không đổi được nếu vẫn muốn điều khiển máy nạn nhân.',
      },
      objectives: [
        'Chọn đúng đơn vị hàng (grain) cho từng loại đặc trưng luồng mạng và giải thích hậu quả của việc chọn sai',
        'Tính điểm beaconing từ dấu thời gian kết nối và xử lý được jitter',
        'Nêu khác biệt giữa JA3 và JA4 cùng lý do kỹ thuật khiến JA4 ra đời',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Một beacon Cobalt Strike gọi về máy chủ điều khiển qua HTTPS trên cổng 443, dùng chứng chỉ hợp lệ, User-Agent giống Chrome, và tên miền đã được phân loại là "công nghệ thông tin". Bạn không giải mã được nội dung. Nhưng bạn vẫn thấy: nó gọi về **cứ mỗi 60 giây, suốt 8 giờ liền, mỗi lần gửi lên khoảng 300 byte và nhận về khoảng 240 byte**. Không trình duyệt nào của con người hành xử như thế.',
        },
        { t: 'h', text: 'Từ 5-tuple tới đặc trưng phiên', level: 2 },
        {
          t: 'p',
          md: 'NetFlow và `conn.log` của Zeek đều xoay quanh **5-tuple**: IP nguồn, cổng nguồn, IP đích, cổng đích, giao thức. Bản thân 5-tuple gần như không mang tín hiệu. Tín hiệu nằm ở các đại lượng thống kê gắn quanh nó.',
        },
        {
          t: 'table',
          caption: 'Từ trường thô tới đặc trưng có ý nghĩa.',
          head: ['Trường thô', 'Đặc trưng dẫn xuất', 'Bắt được gì'],
          rows: [
            ['ts, duration', 'Thời lượng phiên, số phiên/giờ, khoảng cách giữa các phiên', 'Beaconing, phiên treo bất thường'],
            ['orig_bytes, resp_bytes', 'Tỉ lệ lên/xuống, tổng byte lên trong 24h, độ lệch chuẩn kích thước', 'Đánh cắp dữ liệu, beacon kích thước cố định'],
            ['orig_pkts, resp_pkts', 'Kích thước gói trung bình, tỉ lệ gói/byte', 'Tunneling, giao thức giả dạng'],
            ['id.resp_p (cổng đích)', 'Cổng có nằm trong tập cổng phổ biến của tổ chức không', 'C2 trên cổng lạ (ngày càng hiếm)'],
            ['conn_state', 'Tỉ lệ kết nối bị từ chối hoặc hết giờ trên mỗi nguồn', 'Quét mạng, thăm dò'],
            ['id.orig_h, id.resp_h', 'Bậc của nút trong đồ thị, số đích mới trong ngày', 'Di chuyển ngang, quét nội bộ'],
            ['ssl.server_name (SNI)', 'Tên miền đích, tuổi tên miền, đã từng thấy trong tổ chức chưa', 'C2 trên hạ tầng mới'],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Đơn vị hàng quyết định mọi thứ',
          md: 'Đây là quyết định thiết kế quan trọng nhất của cả bài, và là chỗ người mới sai nhiều nhất. Một hàng trong bảng đặc trưng của bạn là gì?\n\n- **Một luồng** — beaconing hoàn toàn vô hình, vì một kết nối đơn lẻ không có khái niệm chu kỳ.\n- **Một cặp (máy nội bộ, đích ngoài) trong 24 giờ** — beaconing hiện ra rõ ràng; đánh cắp dữ liệu cũng vậy.\n- **Một máy nội bộ trong 1 giờ** — quét mạng và di chuyển ngang hiện ra; beaconing bị pha loãng.\n\nKhông có đơn vị hàng vạn năng. Trong thực tế bạn xây **nhiều bảng đặc trưng ở nhiều mức gộp khác nhau**, mỗi bảng cho một họ mối đe doạ. Nếu ai đó nói "tôi có một mô hình cho toàn bộ lưu lượng mạng", hãy hỏi họ đơn vị hàng là gì.',
        },
        { t: 'h', text: 'Beaconing: tìm nhịp tim trong tiếng ồn', level: 2 },
        {
          t: 'steps',
          title: 'Xây điểm beaconing từ con số không',
          steps: [
            {
              title: 'Bước 1 — Gộp theo cặp và lấy chuỗi dấu thời gian',
              md: 'Với mỗi cặp `(máy nội bộ, đích ngoài)` trong một cửa sổ 24 giờ, thu thập danh sách thời điểm bắt đầu của mọi kết nối. Yêu cầu tối thiểu khoảng 12 kết nối, nếu ít hơn thì thống kê chu kỳ vô nghĩa.',
            },
            {
              title: 'Bước 2 — Tính khoảng cách giữa các lần',
              md: 'Lấy hiệu liên tiếp `Δt`. Một beacon 60 giây cho dãy quanh 60, 60, 61, 59... Trình duyệt người dùng cho dãy hỗn loạn: 3, 812, 17, 4, 5.203...',
            },
            {
              title: 'Bước 3 — Đo độ đều bằng thống kê bền',
              md: 'Hệ số biến thiên `CV = std(Δt) / mean(Δt)` là cách nhanh nhất, nhưng nhạy với ngoại lai — chỉ cần một lần máy ngủ 4 tiếng là hỏng. Bền hơn: **MAD chuẩn hoá** `median(|Δt − median(Δt)|) / median(Δt)`. Giá trị gần 0 nghĩa là rất đều.',
            },
            {
              title: 'Bước 4 — Đo độ đều của KÍCH THƯỚC, không chỉ thời gian',
              md: 'Đây là bước nhiều người bỏ qua và nó thường mạnh hơn cả bước 3. Beacon gửi cùng một cấu trúc yêu cầu mỗi lần, nên `std(orig_bytes) / mean(orig_bytes)` cực nhỏ. Lưu lượng người dùng thật thì kích thước dao động dữ dội.',
            },
            {
              title: 'Bước 5 — Kết hợp và xếp hạng, đừng chặn',
              md: 'Cộng ba thành phần thành một điểm 0–1 rồi **xếp hạng** các cặp trong toàn tổ chức. Đây không phải bài toán chặn/không chặn; đây là bài toán đưa 30 cặp đáng ngờ nhất lên đầu danh sách của threat hunter mỗi sáng.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Điểm beaconing trên conn.log của Zeek — chạy được trên vài chục triệu dòng bằng pandas',
          code:
            "import numpy as np\n" +
            "import pandas as pd\n" +
            "\n" +
            "# flows: các cột ts (datetime64), src, dst, orig_bytes\n" +
            "def diem_beacon(g, toi_thieu=12):\n" +
            "    t = np.sort(g['ts'].values.astype('datetime64[s]').astype(np.int64))\n" +
            "    if len(t) < toi_thieu:\n" +
            "        return np.nan\n" +
            "    dt = np.diff(t)\n" +
            "    med = max(np.median(dt), 1)\n" +
            "    # MAD chuẩn hoá: bền với vài lần trễ bất thường (máy ngủ, mất mạng)\n" +
            "    mad_t = np.median(np.abs(dt - np.median(dt))) / med\n" +
            "    b = g['orig_bytes'].to_numpy(dtype=float)\n" +
            "    # Beacon gửi cùng cấu trúc mỗi lần nên kích thước gần như không đổi\n" +
            "    mad_b = np.median(np.abs(b - np.median(b))) / max(np.median(b), 1)\n" +
            "    return float(1.0 - np.clip(0.5 * mad_t + 0.5 * mad_b, 0, 1))\n" +
            "\n" +
            "diem = (flows.groupby(['src', 'dst'])\n" +
            "             .apply(diem_beacon)\n" +
            "             .dropna()\n" +
            "             .sort_values(ascending=False))\n" +
            "print(diem.head(30))   # 30 cặp đều đặn nhất trong tổ chức hôm nay\n",
        },
        {
          t: 'predict',
          question:
            'Cobalt Strike cho phép đặt jitter tới 99%: với `sleep 60, jitter 50`, mỗi lần gọi về sẽ cách nhau ngẫu nhiên trong khoảng 30–60 giây. Điều này có xoá sổ việc phát hiện beaconing không?',
          reveal:
            'Không, và lý do rất đáng suy nghĩ.\n\n**(1) Jitter vẫn là một phân phối có biên.** 30–60 giây là một phân phối đều hẹp — nó vẫn khác một trời một vực so với hành vi người dùng thật, nơi khoảng cách trải từ 0,2 giây tới 6 giờ. Đo bằng MAD chuẩn hoá, jitter 50% cho giá trị quanh 0,17; lưu lượng người thật cho giá trị lớn hơn nhiều lần.\n\n**(2) Số lần liên hệ vẫn tố cáo.** Một cặp (máy trạm, đích ngoài) liên hệ 720 lần trong 24 giờ là bất thường bất kể phân bố ra sao. Đặc trưng đếm đơn giản này rất khó né.\n\n**(3) Kẻ tấn công phải trả giá.** Muốn thực sự thoát, họ phải kéo sleep lên hàng giờ và jitter cực lớn. Khi đó mỗi lệnh gõ ra phải chờ trung bình nửa chu kỳ mới được thực thi — thao tác thủ công trở nên gần như bất khả thi. Đây đúng là định nghĩa của đặc trưng bám vào bất biến ở bài t5-l1: né được, nhưng phải hy sinh chính năng lực điều khiển.\n\nCông cụ mã nguồn mở **RITA** của Active Countermeasures triển khai đúng ý tưởng này và là chỗ tốt để đọc mã tham khảo.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Thứ đập vào mặt bạn ngay lần đầu bật phát hiện beacon',
          md: 'Top 200 kết quả đầu tiên của bạn sẽ **không** có một mã độc nào. Chúng là: Windows Update, telemetry của Microsoft, kiểm tra bản cập nhật của trình duyệt, heartbeat của Slack và Teams, đồng bộ NTP, kiểm tra chứng chỉ OCSP, agent EDR gọi về đám mây của chính hãng bảo mật, và máy in kiểm tra mực.\n\nĐó là bản chất của bài toán: **phần mềm hợp pháp cũng beacon, thậm chí đều hơn mã độc**. Ba cách xử lý theo thứ tự hiệu quả:\n\n1. **Đặc trưng độ hiếm**, không phải danh sách trắng thủ công: "bao nhiêu máy khác trong tổ chức cũng nói chuyện với đích này?" Một beacon C2 thường chỉ có 1–2 máy; Windows Update có 5.000 máy.\n2. **Ghép với tiến trình** từ EDR: `chrome.exe` gọi ra là bình thường, `rundll32.exe` gọi ra đều đặn thì không.\n3. **Tuổi và danh tiếng của tên miền đích**, lấy từ SNI.\n\nĐặc trưng số 1 thường một mình giải quyết 90% vấn đề, và nó gần như miễn phí để tính.',
        },
        { t: 'h', text: 'Tỉ lệ byte và đánh cắp dữ liệu', level: 2 },
        {
          t: 'p',
          md: 'Duyệt web bình thường lệch mạnh về phía tải xuống: tỉ lệ `orig_bytes / resp_bytes` thường nhỏ hơn 0,1. Đánh cắp dữ liệu đảo ngược tỉ lệ đó. Nhưng đặc trưng này có rất nhiều báo động giả hợp pháp: sao lưu lên đám mây, họp video, lập trình viên đẩy mã lên GitHub, upload video, đồng bộ OneDrive.',
        },
        {
          t: 'list',
          items: [
            '**Đừng dùng tỉ lệ đứng một mình.** Kết hợp với: đích có phải dịch vụ đã biết không, máy này trước đây có upload nhiều thế không, và có phải giờ làm việc không.',
            '**Tổng byte lên trong 24 giờ theo cặp** thường mạnh hơn tỉ lệ của từng phiên, vì kẻ tấn công chia nhỏ thành nhiều phiên.',
            '**Lệch so với chính máy đó trong 30 ngày trước** mạnh hơn ngưỡng tuyệt đối toàn tổ chức — máy của lập trình viên vốn dĩ upload nhiều.',
            '**Chú ý đường ra không phải HTTPS**: DNS, ICMP, và các dịch vụ đám mây được cho phép sẵn (Dropbox, Google Drive, Telegram) là những kênh exfil rất phổ biến vì chúng luôn được mở.',
          ],
        },
        { t: 'h', text: 'JA3, JA4 và dấu vân tay TLS', level: 2 },
        {
          t: 'p',
          md: '**JA3** (Salesforce, 2017) lấy các trường trong gói `ClientHello` của TLS — phiên bản, danh sách cipher suite, danh sách extension, elliptic curve, EC point format — nối lại theo thứ tự xuất hiện rồi băm MD5. **JA3S** làm điều tương tự cho `ServerHello`. Ý tưởng: hai máy khách dùng cùng thư viện TLS và cùng cấu hình sẽ cho cùng một chuỗi, nên bạn nhận ra "cái này do thư viện của Go tạo ra" mà không cần giải mã gì.',
        },
        {
          t: 'compare',
          title: 'Vì sao JA4 ra đời',
          left: {
            title: '🔑 JA3 (2017)',
            items: [
              'MD5 của chuỗi nối theo THỨ TỰ XUẤT HIỆN',
              'Không đọc được: chỉ là 32 ký tự hex',
              'Vỡ khi Chrome bắt đầu xáo trộn thứ tự extension (từ Chrome 110, đầu 2023)',
              'Phải tự lọc giá trị GREASE (RFC 8701), nhiều bản triển khai làm sai',
              'Một hash duy nhất, không tách được thành phần',
            ],
          },
          right: {
            title: '🔐 JA4 / JA4+ (FoxIO, 2023)',
            items: [
              'SẮP XẾP cipher và extension trước khi băm — miễn nhiễm với xáo trộn thứ tự',
              'Đọc được: phần đầu cho biết giao thức, phiên bản TLS, có SNI không, số cipher, số extension, ALPN',
              'Là một bộ: JA4 (TLS client), JA4S (server), JA4H (HTTP), JA4X (chứng chỉ X.509), JA4L (độ trễ)',
              'Tách được thành phần nên phân tích và gỡ lỗi dễ hơn nhiều',
              'Lưu ý giấy phép: một phần của bộ JA4+ dùng giấy phép riêng của FoxIO — kiểm tra trước khi nhúng vào sản phẩm thương mại',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'JA3/JA4 nhận diện thư viện TLS, không nhận diện ứng dụng',
          md: 'Đây là hiểu lầm gây hại nhất về dấu vân tay TLS. Hàng triệu chương trình khác nhau được viết bằng Go dùng thư viện TLS mặc định sẽ cho **cùng một JA3**. Vì vậy:\n\n- Dùng JA3/JA4 làm **IOC toàn cầu** để chặn là sai — bạn sẽ chặn cả công cụ nội bộ hợp pháp.\n- Dùng nó làm **đặc trưng độ hiếm trong mạng của bạn** thì rất mạnh: "dấu vân tay này xuất hiện trên đúng 1 trong 4.000 máy trạm" là tín hiệu tuyệt vời.\n- Dùng cặp **(JA4, SNI, tiến trình)** còn mạnh hơn nữa: một fingerprint kiểu Python nói chuyện với một tên miền 3 ngày tuổi từ `winword.exe` là chuyện rất đáng điều tra.\n\nNgoài ra, các công cụ né tránh (utls trong Go, curl-impersonate) hiện đã bắt chước fingerprint của Chrome gần như hoàn hảo. Chi phí né của JA3/JA4 vì thế là **thấp với đối thủ có kỹ năng**, dù vẫn cao với công cụ phổ thông.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't5l4-cp1',
              kind: 'mcq',
              tags: ['luong-mang', 'beaconing'],
              q: 'Bạn tính đặc trưng beaconing với đơn vị hàng là "một luồng kết nối". Vấn đề là gì?',
              options: [
                'Không có vấn đề gì, đây là cách chuẩn',
                'Chu kỳ chỉ tồn tại giữa NHIỀU kết nối, nên ở mức một luồng đặc trưng này không thể tính được',
                'Số hàng quá ít nên mô hình sẽ thiếu dữ liệu',
                'Luồng không có dấu thời gian nên không tính được khoảng cách',
              ],
              answer: 1,
              why: 'Beaconing là tính chất của một **chuỗi** sự kiện, không phải của một sự kiện. Muốn đo nó bạn buộc phải gộp theo cặp (nguồn, đích) trong một cửa sổ thời gian. Đây là ví dụ rõ nhất cho nguyên tắc "đơn vị hàng quyết định đặc trưng nào tồn tại được". Cùng dữ liệu thô đó, ở mức luồng bạn tính được kích thước và thời lượng; ở mức cặp-theo-ngày bạn tính được chu kỳ; ở mức máy-theo-giờ bạn tính được quét mạng.',
              distractorWhy: [
                'Đây chính là lỗi thiết kế mà câu hỏi nhắm tới.',
                '',
                'Ngược lại — mức luồng cho rất nhiều hàng; vấn đề là chúng không chứa thông tin cần thiết.',
                'Luồng luôn có dấu thời gian; vấn đề là một dấu thời gian đơn lẻ không tạo thành chu kỳ.',
              ],
            },
            {
              id: 't5l4-cp2',
              kind: 'truefalse',
              tags: ['luong-mang', 'ja3'],
              q: 'Nếu một JA3 hash xuất hiện trong báo cáo về một nhóm tấn công thì nên đưa nó vào danh sách chặn toàn tổ chức.',
              answer: false,
              why: 'JA3 nhận diện thư viện và cấu hình TLS, không nhận diện chương trình. Hash đó nhiều khả năng thuộc về thư viện TLS mặc định của Go, Python hoặc một phiên bản Chrome cụ thể — nghĩa là chặn nó sẽ chặn luôn công cụ nội bộ, script vận hành và có thể cả agent giám sát của chính bạn. Cách dùng đúng là biến nó thành đặc trưng **độ hiếm và ngữ cảnh** trong mạng của bạn: fingerprint này xuất hiện trên bao nhiêu máy, đi kèm tiến trình nào, nói chuyện với tên miền bao nhiêu tuổi.',
            },
          ],
        },
        { t: 'h', text: 'DNS: kênh mà ai cũng phải mở', level: 2 },
        {
          t: 'table',
          caption: 'Đặc trưng DNS và mối đe doạ tương ứng.',
          head: ['Đặc trưng', 'Bắt được gì', 'Ghi chú thực chiến'],
          rows: [
            ['Xác suất n-gram ký tự của nhãn đăng ký', 'Tên miền sinh bởi DGA', 'Mạnh hơn entropy trần; xây mô hình nền từ danh sách tên miền phổ biến'],
            ['Tỉ lệ truy vấn trả về NXDOMAIN theo máy', 'Máy đang dò danh sách tên miền DGA để tìm cái còn sống', 'Rất mạnh: máy sạch hiếm khi vượt vài phần trăm'],
            ['Số nhãn con khác nhau dưới cùng một tên miền đăng ký trong 1 giờ', 'Đường hầm DNS (iodine, dnscat2)', 'Đặc trưng số một cho tunneling; ngưỡng thực dụng là hàng trăm'],
            ['Độ dài trung bình của nhãn con', 'Dữ liệu được nhồi vào tên truy vấn', 'Đường hầm cần nhồi tối đa 63 ký tự mỗi nhãn'],
            ['Tỉ lệ truy vấn loại TXT / NULL / CNAME bất thường', 'Kênh dữ liệu trả về', 'TXT hiếm trong lưu lượng người dùng bình thường'],
            ['Kích thước phản hồi trung bình', 'Dữ liệu tải về qua DNS', 'Kết hợp với số truy vấn/giờ'],
            ['TTL rất thấp kết hợp nhiều IP khác nhau', 'Fast flux', 'Cẩn thận: CDN cũng có TTL thấp'],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Khi DoH làm bạn mù',
          md: 'DNS over HTTPS và DNS over TLS khiến truy vấn DNS biến mất khỏi log DNS của bạn — chúng trở thành một luồng TLS tới `dns.google` hoặc `cloudflare-dns.com`. Ba phương án thực dụng: **(1)** chặn DoH tới các resolver công cộng ở tầng firewall và bắt buộc dùng resolver nội bộ; **(2)** lấy truy vấn DNS từ agent EDR trên endpoint thay vì từ mạng; **(3)** nếu không làm được cả hai, chuyển trọng tâm sang SNI, JA4 và đặc trưng luồng — đó chính là lý do bài này quan trọng.',
        },
        { t: 'figure', id: 'fig-graph-lateral', caption: 'Coi các cặp (nguồn, đích) như cạnh của một đồ thị mở ra cả một họ đặc trưng: bậc của nút, số cạnh mới trong ngày, và các đường đi bất thường của di chuyển ngang.' },
        { t: 'terms', ids: ['beaconing', 'c2', 'zeek', 'dga', 'dac-trung'] },
      ],
      keyTakeaways: [
        'Đơn vị hàng quyết định đặc trưng nào tồn tại được: beaconing chỉ hiện ra ở mức cặp (nguồn, đích) theo cửa sổ thời gian, không bao giờ ở mức một luồng.',
        'Điểm beaconing nên đo cả độ đều của thời gian lẫn độ đều của kích thước byte; phần kích thước thường mạnh hơn và ít người dùng.',
        'Jitter không xoá được beaconing — nó chỉ làm phân phối rộng hơn, và jitter đủ lớn để thoát thì kẻ tấn công mất khả năng điều khiển tương tác.',
        'Danh sách top beacon đầu tiên toàn là phần mềm hợp pháp; đặc trưng độ hiếm ("bao nhiêu máy khác cũng nói chuyện với đích này") giải quyết phần lớn vấn đề.',
        'JA4 thay JA3 vì nó sắp xếp cipher/extension trước khi băm, nên không vỡ khi Chrome xáo trộn thứ tự extension từ đầu 2023.',
        'JA3/JA4 nhận diện thư viện TLS chứ không nhận diện ứng dụng — dùng làm đặc trưng độ hiếm nội bộ, đừng dùng làm IOC chặn toàn cầu.',
      ],
      cards: [
        {
          id: 't5l4-c1',
          front: 'Vì sao không thể tính đặc trưng beaconing khi đơn vị hàng là một luồng kết nối?',
          back: 'Vì chu kỳ là tính chất của một chuỗi nhiều kết nối. Phải gộp theo cặp (nguồn, đích) trong một cửa sổ thời gian thì khoảng cách giữa các lần mới tồn tại.',
          tags: ['luong-mang', 'beaconing'],
        },
        {
          id: 't5l4-c2',
          front: 'Ngoài độ đều của thời gian, đặc trưng nào giúp phát hiện beacon và thường mạnh hơn?',
          back: 'Độ đều của kích thước byte gửi lên. Beacon lặp cùng một cấu trúc yêu cầu nên độ lệch kích thước rất nhỏ, còn lưu lượng người dùng dao động mạnh.',
          tags: ['beaconing'],
        },
        {
          id: 't5l4-c3',
          front: 'Vì sao jitter lớn không giúp kẻ tấn công thoát hẳn khỏi phát hiện beaconing?',
          back: 'Vì jitter vẫn là phân phối có biên, hẹp hơn nhiều so với hành vi người thật; và jitter đủ lớn để giống người thì thời gian chờ mỗi lệnh trở nên không dùng được cho thao tác tương tác.',
          tags: ['beaconing', 'ne-tranh'],
        },
        {
          id: 't5l4-c4',
          front: 'JA4 sửa được điểm yếu nào của JA3?',
          back: 'JA4 sắp xếp danh sách cipher và extension trước khi băm, nên không vỡ khi trình duyệt xáo trộn thứ tự extension — điều Chrome bắt đầu làm từ đầu năm 2023.',
          tags: ['ja3', 'tls'],
        },
        {
          id: 't5l4-c5',
          front: 'Đặc trưng DNS nào là tín hiệu số một cho đường hầm DNS?',
          back: 'Số nhãn con khác nhau dưới cùng một tên miền đăng ký trong một cửa sổ ngắn. Đường hầm phải nhồi dữ liệu vào tên truy vấn nên sinh ra hàng trăm nhãn con duy nhất.',
          tags: ['dns', 'luong-mang'],
        },
      ],
      quiz: [
        {
          id: 't5l4-q1',
          kind: 'mcq',
          tags: ['luong-mang', 'beaconing'],
          q: 'Danh sách 200 cặp có điểm beaconing cao nhất của bạn toàn là Windows Update, Slack và agent EDR. Đặc trưng bổ sung nào giải quyết vấn đề này hiệu quả nhất với chi phí thấp nhất?',
          options: [
            'Nâng ngưỡng điểm beaconing lên cho tới khi danh sách ngắn lại',
            'Số máy trạm khác trong tổ chức cũng liên hệ với cùng đích đó',
            'Chặn toàn bộ các đích trong danh sách',
            'Chuyển sang phân tích nội dung gói tin để xác định giao thức',
          ],
          answer: 1,
          why: 'Đặc trưng độ hiếm chia đôi bài toán một cách gọn gàng: dịch vụ hợp pháp được hàng nghìn máy dùng, còn C2 thường chỉ có một hoặc vài máy bị nhiễm. Nó tính được bằng một phép `groupby` trên dữ liệu bạn đã có, không cần nguồn dữ liệu mới, và nó không cần bảo trì như danh sách trắng thủ công. Nâng ngưỡng thì sai vì phần mềm hợp pháp thường beacon ĐỀU HƠN mã độc — bạn sẽ cắt mất đúng thứ cần tìm. Phân tích nội dung thì bất khả thi vì lưu lượng đã mã hoá.',
          distractorWhy: [
            'Phần mềm hợp pháp beacon đều hơn mã độc, nên nâng ngưỡng loại bỏ mã độc trước.',
            '',
            'Chặn Windows Update và agent EDR sẽ gây sự cố nghiêm trọng hơn nhiều so với vấn đề ban đầu.',
            'Lưu lượng đã mã hoá; đây chính là ràng buộc đặt ra ở đầu bài.',
          ],
        },
        {
          id: 't5l4-q2',
          kind: 'match',
          tags: ['luong-mang'],
          q: 'Nối mỗi đặc trưng với mối đe doạ mà nó nhắm tới.',
          pairs: [
            ['Tỉ lệ NXDOMAIN cao trên một máy trạm', 'Máy nhiễm đang dò danh sách tên miền DGA'],
            ['Hàng trăm nhãn con khác nhau dưới một tên miền trong 1 giờ', 'Đường hầm DNS'],
            ['Tổng byte gửi lên trong 24 giờ vượt xa lịch sử của chính máy đó', 'Đánh cắp dữ liệu'],
            ['MAD chuẩn hoá của khoảng cách giữa các kết nối gần 0', 'Beacon điều khiển từ xa'],
            ['Số đích nội bộ mới mà một máy liên hệ trong 1 giờ tăng đột biến', 'Quét mạng và di chuyển ngang'],
          ],
          why: 'Bảng này chính là bản đồ làm việc của bạn khi thiết kế. Hãy để ý mỗi dòng đều gắn với một bất biến: DGA phải dò nhiều tên miền mới tìm được cái sống; tunneling phải nhồi dữ liệu vào tên truy vấn; exfil phải đẩy byte ra; C2 phải liên lạc định kỳ; di chuyển ngang phải chạm vào máy mới. Đó là lý do cả năm đặc trưng này đều bền qua nhiều năm.',
        },
        {
          id: 't5l4-q3',
          kind: 'truefalse',
          tags: ['tls', 'ja3'],
          q: 'Từ đầu năm 2023, việc Chrome xáo trộn thứ tự các extension trong ClientHello làm JA3 hash của Chrome không còn ổn định.',
          answer: true,
          why: 'Đúng, và đây là lý do trực tiếp khiến JA4 ra đời. JA3 nối các trường theo đúng thứ tự xuất hiện rồi băm, nên chỉ cần hoán vị thứ tự là hash đổi hoàn toàn. Chrome làm việc này để chống hiện tượng ossification — tức là để các thiết bị trung gian không phụ thuộc vào một thứ tự cố định. Tác dụng phụ với ngành bảo mật là mọi danh sách JA3 tĩnh cho Chrome đều hỏng. JA4 sắp xếp danh sách trước khi băm nên miễn nhiễm với chuyện này.',
        },
        {
          id: 't5l4-q4',
          kind: 'mcq',
          tags: ['luong-mang', 'exfil'],
          q: 'Bạn muốn phát hiện đánh cắp dữ liệu qua các dịch vụ đám mây được cho phép sẵn (OneDrive, Google Drive). Cách đặt đặc trưng nào hợp lý nhất?',
          options: [
            'Tỉ lệ orig_bytes/resp_bytes của từng phiên vượt ngưỡng cố định toàn tổ chức',
            'Tổng byte gửi lên trong 24 giờ của máy đó, so với chính lịch sử 30 ngày của máy đó và của nhóm ngang hàng',
            'Chặn hoàn toàn các dịch vụ đám mây trên',
            'Danh sách IP của các dịch vụ đám mây làm đặc trưng nhị phân',
          ],
          answer: 1,
          why: 'Ngưỡng tuyệt đối toàn tổ chức chắc chắn thất bại vì mức upload bình thường của một lập trình viên, một biên tập viên video và một nhân viên kế toán khác nhau hàng trăm lần. So với chính lịch sử của máy đó bắt được sự thay đổi hành vi, còn so với nhóm ngang hàng xử lý được trường hợp máy mới chưa có lịch sử. Đây chính xác là nội dung bài tiếp theo (t5-l5). Chặn dịch vụ đám mây là quyết định kinh doanh chứ không phải đặc trưng, và thường bất khả thi. Danh sách IP chỉ nói bạn đang nói chuyện với ai, không nói bạn gửi bao nhiêu.',
          distractorWhy: [
            'Ngưỡng cố định bỏ qua sự khác biệt khổng lồ giữa các vai trò công việc.',
            '',
            'Đây là biện pháp kiểm soát, không phải đặc trưng — và thường không được phép về mặt vận hành.',
            'Biết đích là OneDrive không cho biết hành vi có bất thường hay không.',
          ],
        },
      ],
      terms: ['beaconing', 'c2', 'zeek', 'dga', 'dac-trung', 'ja3', 'netflow'],
      further: [
        {
          title: 'Zeek Documentation — conn.log, ssl.log, dns.log',
          note: 'Đọc bảng trường của ba log này một lần là bạn có gần như toàn bộ nguyên liệu thô cho bài học này.',
        },
        {
          title: 'JA4+ Network Fingerprinting — FoxIO',
          note: 'Đặc tả của cả bộ JA4+, kèm lý do kỹ thuật cho từng thay đổi so với JA3. Đọc phần giải thích định dạng dễ đọc của JA4.',
        },
        {
          title: 'RITA — Real Intelligence Threat Analytics (Active Countermeasures)',
          note: 'Mã nguồn mở, chuyên phân tích beaconing trên log Zeek. Đọc phần tính điểm beacon để thấy một bản triển khai đã qua thực chiến.',
        },
      ],
    },
    /* ====================================================================== */
    {
      id: 't5-l5',
      trackId: 'dac-trung',
      title: 'Đặc trưng hành vi người dùng và thời gian',
      subtitle: 'Bất thường so với ai — so với chính bạn hôm qua, hay so với 40 đồng nghiệp cùng phòng?',
      minutes: 20,
      level: 'trung-cap',
      prereqs: ['t5-l1', 't1-l4'],
      why: {
        short:
          'Sau khi kẻ tấn công có được thông tin đăng nhập hợp lệ, mọi hành động của họ đều "hợp lệ" — chỉ còn hành vi bất thường so với đường cơ sở là dấu vết duy nhất bạn có.',
        scenario:
          'Một tài khoản kế toán đăng nhập bình thường, mở SharePoint bình thường, tải tài liệu bình thường. Chỉ có điều: tài khoản này chưa bao giờ mở thư mục nhân sự, chưa bao giờ tải 340 tệp trong một giờ, và chưa bao giờ hoạt động vào tối thứ Bảy. Bạn phải biến ba chữ "chưa bao giờ" đó thành ba con số.',
        roles: ['SOC Analyst', 'Threat Hunter', 'Security Data Scientist', 'Detection Engineer'],
        costOfNotKnowing:
          'Bạn xây UEBA bằng những luật ngây thơ kiểu "đăng nhập sau 22h là bất thường", tạo ra hàng nghìn cảnh báo cho ca đêm và nhân viên đi công tác, rồi hệ thống bị tắt trước khi bắt được ai — trong khi kẻ tấn công thật thì làm việc đúng giờ hành chính.',
      },
      objectives: [
        'Mã hoá đặc trưng thời gian tuần hoàn bằng sin/cos và giải thích khi nào nó cần thiết, khi nào không',
        'Thiết kế đường cơ sở kết hợp theo từng người và theo nhóm ngang hàng, xử lý được trường hợp người dùng mới',
        'Xây đặc trưng độ hiếm và first-seen ở nhiều phạm vi, tính point-in-time',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'SOC của bạn có luật: "đăng nhập trong khoảng 0h–5h là bất thường". Log Entra ID (Azure AD) ghi thời gian theo UTC. Một nhân viên ở TP.HCM (UTC+7) đăng nhập lúc 8h sáng như mọi ngày. Log ghi mấy giờ, và luật có kêu không?',
          reveal:
            'Log ghi **01:00 UTC**. Luật kêu. Nó kêu cho **mỗi nhân viên, mỗi buổi sáng, mỗi ngày làm việc** — nghĩa là với công ty 2.000 người, bạn có 2.000 cảnh báo mỗi sáng, tất cả đều sai.\n\nĐiều tệ hơn con số đó: sau hai tuần, đội SOC sẽ tạo một bộ lọc để ẩn toàn bộ cảnh báo "đăng nhập ngoài giờ". Và bộ lọc đó sẽ ẩn luôn cảnh báo thật khi nó đến.\n\nĐây không phải ví dụ giả định. Đây là lỗi phổ biến nhất trong các dự án UEBA và nó xuất hiện ở mọi tổ chức có hơn một múi giờ. Nguyên tắc: **quy đổi về múi giờ của người dùng TRƯỚC khi trích bất kỳ đặc trưng thời gian nào.**',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Danh sách kiểm tra múi giờ',
          md: '- Log lưu ở múi giờ nào? (Hầu hết đám mây dùng UTC; nhiều thiết bị on-premise dùng giờ máy chủ.)\n- Người dùng ở múi giờ nào? Lấy từ đâu — hồ sơ HR, thiết lập tài khoản, hay suy từ vị trí IP?\n- Có giờ mùa hè (DST) không? Với đội ở châu Âu hoặc Mỹ, khoảng cách tới UTC đổi hai lần mỗi năm; nếu bạn hard-code offset thì hai lần mỗi năm mô hình của bạn lệch một tiếng.\n- Nhân viên đi công tác thì tính theo múi giờ nào? Câu trả lời thực dụng: giữ nguyên múi giờ "nhà" và thêm một đặc trưng riêng cho việc vị trí IP lệch khỏi thường lệ.\n- Việt Nam không có DST và cố định ở UTC+7 — nếu toàn bộ tổ chức của bạn ở Việt Nam thì bạn may mắn, nhưng đừng viết mã giả định điều đó.',
        },
        { t: 'h', text: 'Mã hoá thời gian tuần hoàn', level: 2 },
        {
          t: 'p',
          md: 'Giả sử bạn đã quy về giờ địa phương. Bây giờ giờ trong ngày là một số từ 0 tới 23. Vấn đề: **23 giờ và 0 giờ cách nhau đúng 1 tiếng, nhưng về mặt số học chúng cách nhau 23**. Với mô hình tuyến tính, k-NN, k-means hay mạng nơ-ron, khoảng cách số học chính là thứ chúng dùng — nên chúng sẽ coi nửa đêm là thời điểm xa nhất có thể so với 23h.',
        },
        {
          t: 'p',
          md: 'Cách sửa chuẩn là chiếu giờ lên một vòng tròn bằng hai đặc trưng: `gio_sin = sin(2π·h/24)` và `gio_cos = cos(2π·h/24)`. Khi đó 23h và 0h nằm cạnh nhau trên vòng tròn, và khoảng cách Euclid giữa chúng nhỏ đúng như trực giác. Làm tương tự cho thứ trong tuần (chia 7) và ngày trong tháng (chia 30 hoặc 31).',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Khi nào sin/cos KHÔNG cần thiết',
          md: 'Với **cây quyết định và các mô hình dựa trên cây** (Random Forest, LightGBM, XGBoost), mã hoá tuần hoàn thường không giúp gì và đôi khi còn làm hại. Lý do: cây chia theo ngưỡng trên từng đặc trưng, nên nó hoàn toàn có thể học "giờ < 6 HOẶC giờ > 22" bằng hai nhánh riêng — nó không dùng khoảng cách. Ngược lại, ép nó học từ `sin` và `cos` buộc nó phải kết hợp hai cột để tái tạo lại một thứ vốn đã có sẵn.\n\nQuy tắc thực dụng: **mô hình dựa trên khoảng cách hoặc tuyến tính thì dùng sin/cos; mô hình dựa trên cây thì đưa thẳng giờ dạng số, và cân nhắc thêm cột phân loại như `ca_lam_viec` (sáng/chiều/tối/đêm).** Đây là ví dụ tốt cho việc kỹ thuật đặc trưng phụ thuộc vào mô hình bạn định dùng.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Bốn nhóm đặc trưng hành vi cốt lõi — chú ý dòng đầu tiên và cụm cumcount',
          code:
            "import numpy as np\n" +
            "import pandas as pd\n" +
            "\n" +
            "# 1) QUY VỀ MÚI GIỜ NGƯỜI DÙNG trước khi lấy giờ trong ngày\n" +
            "df['ts'] = pd.to_datetime(df['ts'], utc=True)\n" +
            "tl = df['ts'].dt.tz_convert('Asia/Ho_Chi_Minh')\n" +
            "h = tl.dt.hour + tl.dt.minute / 60\n" +
            "\n" +
            "# 2) Mã hoá tuần hoàn: 23h và 0h phải nằm cạnh nhau\n" +
            "df['gio_sin'] = np.sin(2 * np.pi * h / 24)\n" +
            "df['gio_cos'] = np.cos(2 * np.pi * h / 24)\n" +
            "df['thu_sin'] = np.sin(2 * np.pi * tl.dt.dayofweek / 7)\n" +
            "df['thu_cos'] = np.cos(2 * np.pi * tl.dt.dayofweek / 7)\n" +
            "\n" +
            "# 3) First-seen POINT-IN-TIME: cumcount chỉ đếm những gì đã xảy ra TRƯỚC đó\n" +
            "df = df.sort_values('ts')\n" +
            "df['lan_dau_user_dung_host'] = (df.groupby(['user', 'host']).cumcount() == 0).astype(int)\n" +
            "df['lan_dau_toan_to_chuc'] = (df.groupby('host').cumcount() == 0).astype(int)\n" +
            "\n" +
            "# 4) Lệch so với CHÍNH MÌNH, dùng thống kê bền (median + MAD, không phải mean + std)\n" +
            "g = df.groupby('user')['so_tep_truy_cap']\n" +
            "med = g.transform('median')\n" +
            "mad = g.transform(lambda s: (s - s.median()).abs().median())\n" +
            "df['z_ben'] = (df['so_tep_truy_cap'] - med) / (1.4826 * mad + 1e-6)\n",
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Vì sao median + MAD chứ không phải mean + std',
          md: 'Trung bình và độ lệch chuẩn bị chính ngoại lai kéo đi. Nếu một ngày người dùng tải 5.000 tệp (do một lần đồng bộ hợp lệ), trung bình và std của họ phình lên, và từ đó về sau **mọi bất thường thật đều lọt** vì ngưỡng đã bị đẩy quá cao. Trung vị và MAD gần như không bị ảnh hưởng bởi vài điểm cực đoan. Hệ số `1,4826` là hằng số quy đổi để MAD ước lượng đúng độ lệch chuẩn khi dữ liệu phân phối chuẩn — nhờ nó `z_ben` đọc được theo cùng thang với z-score quen thuộc.',
        },
        { t: 'h', text: 'Đường cơ sở của ai: của bạn, hay của nhóm bạn?', level: 2 },
        {
          t: 'compare',
          title: 'Hai loại đường cơ sở, hai vùng mù khác nhau',
          left: {
            title: '👤 Đường cơ sở theo từng người',
            items: [
              'So hành vi hôm nay với 90 ngày trước của CHÍNH người đó',
              'Rất nhạy: bắt được thay đổi nhỏ trong thói quen',
              'Vô dụng với người mới (cold start): không có lịch sử',
              'Rất nhiễu với người dùng thưa: đăng nhập 3 lần/tháng thì độ lệch chuẩn vô nghĩa',
              'Vùng mù chết người: nếu tài khoản đã bị chiếm TRONG thời kỳ xây đường cơ sở, hành vi tấn công trở thành chuẩn mực',
            ],
          },
          right: {
            title: '👥 Đường cơ sở theo nhóm ngang hàng',
            items: [
              'So hành vi với 40 người cùng phòng ban, cùng vai trò, cùng cấp',
              'Hoạt động ngay từ ngày đầu của nhân viên mới',
              'Bền với người dùng thưa vì gộp được nhiều mẫu',
              'Bỏ sót người có thói quen riêng hợp lệ (giám đốc làm đêm, quản trị viên chạy script)',
              'Chất lượng phụ thuộc hoàn toàn vào chất lượng dữ liệu HR: phòng ban sai thì nhóm sai',
            ],
          },
        },
        {
          t: 'p',
          md: 'Câu trả lời thực chiến là **dùng cả hai và cho mô hình quyết định**. Cụ thể: với mỗi hành vi, tạo hai đặc trưng — `z_so_voi_chinh_minh` và `z_so_voi_nhom` — cộng thêm `so_ngay_co_lich_su` để mô hình biết khi nào đặc trưng đầu đáng tin. Người mới vào có `so_ngay_co_lich_su = 3` thì mô hình sẽ tự học cách dựa vào đặc trưng nhóm nhiều hơn.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Con ếch trong nồi nước đang nóng dần',
          md: 'Đường cơ sở cuốn chiếu (rolling baseline) cập nhật liên tục theo 90 ngày gần nhất nghe rất hợp lý — nó thích ứng khi người dùng đổi vai trò, khi công ty triển khai công cụ mới.\n\nNhưng nó cũng có nghĩa là: nếu kẻ tấn công tăng khối lượng truy cập **từ từ** trong ba tháng, đường cơ sở sẽ đi theo họ và không có cảnh báo nào phát ra. Đây là kỹ thuật thật, và nó đơn giản đến mức không cần gì ngoài sự kiên nhẫn.\n\nHai biện pháp: **(1)** giữ thêm một đường cơ sở **cố định** dài hạn (ví dụ 12 tháng, đóng băng) song song với đường cuốn chiếu và so cả hai; **(2)** thêm đặc trưng về **xu hướng** — độ dốc của khối lượng truy cập trong 90 ngày — để một sự tăng đều liên tục tự nó trở thành tín hiệu.',
        },
        { t: 'figure', id: 'fig-drift', caption: 'Đường cơ sở cuốn chiếu bám theo dữ liệu mới. Đó là ưu điểm khi thế giới thay đổi hợp lệ, và là lỗ hổng khi chính kẻ tấn công là thứ đang thay đổi từ từ.' },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't5l5-cp1',
              kind: 'mcq',
              tags: ['ueba', 'thoi-gian'],
              q: 'Bạn dùng LightGBM cho mô hình UEBA. Có nên mã hoá giờ trong ngày bằng sin/cos không?',
              options: [
                'Bắt buộc, nếu không mô hình sẽ coi 23h và 0h là xa nhau',
                'Thường không cần: cây chia theo ngưỡng nên học được "giờ < 6 hoặc giờ > 22" bằng hai nhánh, không dùng khoảng cách',
                'Có, vì sin/cos luôn cải thiện mọi mô hình',
                'Không bao giờ nên mã hoá thời gian dưới bất kỳ dạng nào',
              ],
              answer: 1,
              why: 'Mã hoá tuần hoàn giải quyết vấn đề **khoảng cách**, mà cây quyết định không dùng khoảng cách — nó dùng ngưỡng chia trên từng cột độc lập. Cây hoàn toàn có thể tạo hai nhánh riêng cho vùng sáng sớm và vùng khuya. Đưa sin/cos vào bắt cây phải kết hợp hai cột để tái tạo thông tin vốn đã có ở dạng đơn giản hơn. Ngược lại, với hồi quy logistic, k-means hoặc autoencoder thì sin/cos là bắt buộc. Bài học tổng quát: kỹ thuật đặc trưng không tách rời khỏi việc chọn mô hình.',
              distractorWhy: [
                'Đúng với mô hình dựa trên khoảng cách, sai với mô hình dựa trên cây.',
                '',
                'Không có kỹ thuật đặc trưng nào luôn cải thiện mọi mô hình.',
                'Thời gian là một trong những nguồn tín hiệu giàu nhất trong UEBA; vấn đề là mã hoá đúng cách.',
              ],
            },
            {
              id: 't5l5-cp2',
              kind: 'truefalse',
              tags: ['ueba', 'duong-co-so'],
              q: 'Đường cơ sở theo từng người luôn tốt hơn đường cơ sở theo nhóm ngang hàng vì nó cá nhân hoá hơn.',
              answer: false,
              why: 'Đường cơ sở cá nhân sụp đổ trong ba tình huống rất phổ biến: nhân viên mới không có lịch sử; người dùng thưa (vài sự kiện mỗi tháng) có thống kê vô nghĩa; và tài khoản đã bị chiếm trong chính giai đoạn xây đường cơ sở, khiến hành vi tấn công trở thành chuẩn mực. Nhóm ngang hàng xử lý được cả ba nhưng lại bỏ sót người có thói quen riêng hợp lệ. Thiết kế đúng là dùng cả hai làm hai đặc trưng song song, cộng thêm một đặc trưng cho biết lịch sử cá nhân dày bao nhiêu.',
            },
          ],
        },
        { t: 'h', text: 'Độ hiếm và first-seen: thường mạnh hơn cả độ lệch', level: 2 },
        {
          t: 'p',
          md: 'Kinh nghiệm thực chiến: trong UEBA, câu hỏi **"đây có phải lần đầu tiên không?"** thường cho tín hiệu mạnh hơn câu hỏi "cái này lớn hơn bình thường bao nhiêu lần?". Lý do đơn giản: hành vi của con người trong công việc lặp lại rất nhiều, nên một sự kiện chưa từng có là chuyện hiếm thật sự.',
        },
        {
          t: 'table',
          caption: 'Đặc trưng độ hiếm ở nhiều phạm vi — cùng một sự kiện, nhiều góc nhìn.',
          head: ['Đặc trưng', 'Phạm vi', 'Vì sao có giá trị'],
          rows: [
            ['Lần đầu người này đăng nhập từ quốc gia này', 'Người dùng', 'Bắt được chiếm tài khoản từ xa; kết hợp với thời gian bay khả thi'],
            ['Lần đầu người này truy cập máy chủ này', 'Người dùng', 'Di chuyển ngang sau khi chiếm được tài khoản'],
            ['Lần đầu tiến trình này chạy trong TOÀN tổ chức', 'Tổ chức', 'Cực mạnh: công cụ mới xuất hiện trên đúng một máy'],
            ['Số người trong nhóm cũng dùng ứng dụng này', 'Nhóm ngang hàng', 'Kế toán dùng công cụ quản trị Active Directory là bất thường'],
            ['Số ngày kể từ lần cuối tài khoản này hoạt động', 'Người dùng', 'Tài khoản ngủ đông bỗng thức dậy — dấu hiệu kinh điển'],
            ['Tần suất nghịch đảo của cặp (người dùng, ứng dụng) trong 90 ngày', 'Người dùng', 'Biến "hiếm" thành số liên tục thay vì cờ nhị phân'],
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'First-seen phải tính point-in-time, không có ngoại lệ',
          md: 'Đây là chỗ rò rỉ dữ liệu ẩn nấp trong mọi dự án UEBA. Nếu bạn tính `lan_dau_thay_host` bằng cách nhóm toàn bộ tập dữ liệu rồi đánh dấu bản ghi sớm nhất, bạn đang dùng thông tin của cả tương lai.\n\nCách đúng trong pandas là `sort_values("ts").groupby(...).cumcount() == 0` — `cumcount` chỉ đếm những gì đã xuất hiện trước đó trong thứ tự thời gian. Một dòng lệnh khác nhau, một kết quả khác nhau hoàn toàn: bản sai thường cho AUC cao hơn bản đúng khoảng 0,05–0,15 và toàn bộ phần chênh đó là ảo.',
        },
        {
          t: 'steps',
          title: 'Ví dụ mẫu: chấm điểm một buổi tối thứ Bảy',
          steps: [
            {
              title: 'Sự kiện',
              md: 'Tài khoản `ntanh` (phòng kế toán) tải 340 tệp từ thư mục `HR-Luong` lúc 21h15 thứ Bảy, từ IP văn phòng.',
            },
            {
              title: 'Đặc trưng thời gian',
              md: 'Quy về giờ địa phương: 21h15 thứ Bảy. `gio_sin/gio_cos` đặt nó ở vùng tối; `la_cuoi_tuan = 1`. Lịch sử 90 ngày của `ntanh`: 0 hoạt động sau 19h, 0 hoạt động cuối tuần. Đặc trưng `ti_le_hoat_dong_ngoai_gio_lich_su = 0,00`.',
            },
            {
              title: 'Đặc trưng khối lượng, so với chính mình',
              md: 'Trung vị số tệp/giờ của `ntanh` là 6, MAD là 4. `z_ben = (340 − 6) / (1,4826 × 4) ≈ 56`. Con số này lớn tới mức không cần bàn.',
            },
            {
              title: 'Đặc trưng độ hiếm',
              md: '`lan_dau_user_truy_cap_thu_muc = 1` (chưa từng chạm thư mục HR). `so_nguoi_cung_phong_truy_cap_thu_muc_nay_90_ngay = 0`. Hai đặc trưng này độc lập với khối lượng và củng cố lẫn nhau.',
            },
            {
              title: 'Đặc trưng nhóm ngang hàng',
              md: 'Trong 38 người phòng kế toán, số tệp/giờ ở phân vị 99 là 45. `z_so_voi_nhom` vẫn rất lớn. Nếu ngược lại — nếu cả phòng đều tải hàng trăm tệp vào tối thứ Bảy do đợt quyết toán — thì đặc trưng nhóm sẽ kéo điểm xuống, và đó chính là lý do nó tồn tại.',
            },
            {
              title: 'Kết luận',
              md: 'Năm nhóm đặc trưng độc lập cùng chỉ một hướng. Đây là cảnh báo bạn muốn có: không dựa vào một ngưỡng duy nhất, và analyst đọc được ngay lý do vì sao nó nổi lên.',
            },
          ],
        },
        { t: 'lab', id: 'lab-anomaly', intro: 'Vặn các tham số của đường cơ sở trên dữ liệu đăng nhập và xem cảnh báo xuất hiện hay biến mất. Thử cả kịch bản kẻ tấn công tăng dần khối lượng để thấy đường cơ sở cuốn chiếu bị lừa như thế nào.' },
        {
          t: 'callout',
          kind: 'ethics',
          title: 'UEBA là giám sát nhân viên — hãy làm cho đúng',
          md: 'Đặc trưng hành vi người dùng là dữ liệu cá nhân, và việc xây chúng đặt bạn vào phạm vi điều chỉnh của pháp luật bảo vệ dữ liệu. Ở Việt Nam, Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân đặt ra yêu cầu về cơ sở pháp lý, thông báo và tối thiểu hoá dữ liệu; khung pháp lý này đã tiếp tục được nâng cấp thành luật, nên hãy kiểm tra bản có hiệu lực mới nhất trước khi thiết kế.\n\nBốn nguyên tắc dùng được ngay: **(1)** tối thiểu hoá — thu thập metadata hành vi (ai, khi nào, tài nguyên nào), không thu thập nội dung nếu không thực sự cần; **(2)** minh bạch — nhân viên phải được thông báo hệ thống tồn tại; **(3)** giới hạn mục đích — dữ liệu bảo mật không được dùng để đánh giá năng suất lao động; **(4)** hạn chế truy cập và có thời hạn lưu trữ rõ ràng. Việc thiết kế đặc trưng của bạn quyết định trực tiếp ba nguyên tắc đầu.',
        },
        { t: 'terms', ids: ['ueba', 'bat-thuong', 'duong-co-so', 'ro-ri-du-lieu', 'dac-trung'] },
      ],
      keyTakeaways: [
        'Quy đổi về múi giờ của người dùng TRƯỚC khi trích đặc trưng thời gian; bỏ qua bước này tạo ra hàng nghìn cảnh báo giả mỗi sáng và một bộ lọc che mất cảnh báo thật.',
        'Mã hoá sin/cos đặt 23h và 0h cạnh nhau; cần cho mô hình tuyến tính và dựa trên khoảng cách, thường thừa với mô hình dựa trên cây.',
        'Dùng median + MAD thay mean + std cho đường cơ sở, vì một ngoại lai hợp lệ có thể đẩy ngưỡng lên vĩnh viễn.',
        'Đường cơ sở cá nhân và đường cơ sở nhóm ngang hàng có vùng mù khác nhau — hãy đưa cả hai vào mô hình cùng với độ dày lịch sử của người đó.',
        'Đường cơ sở cuốn chiếu bị lừa bởi kẻ tấn công tăng dần; hãy giữ thêm một đường cơ sở cố định dài hạn và một đặc trưng xu hướng.',
        'Đặc trưng first-seen và độ hiếm thường mạnh hơn độ lệch khối lượng, nhưng bắt buộc phải tính point-in-time bằng cumcount theo thứ tự thời gian.',
      ],
      cards: [
        {
          id: 't5l5-c1',
          front: 'Vì sao phải mã hoá giờ trong ngày bằng sin và cos?',
          back: 'Vì 23h và 0h cách nhau 1 tiếng nhưng khoảng cách số học là 23. Chiếu lên vòng tròn bằng sin/cos khiến khoảng cách hình học phản ánh đúng khoảng cách thời gian.',
          tags: ['thoi-gian', 'ueba'],
        },
        {
          id: 't5l5-c2',
          front: 'Khi nào mã hoá thời gian tuần hoàn là thừa?',
          back: 'Với mô hình dựa trên cây (LightGBM, Random Forest): cây chia theo ngưỡng trên từng cột nên học được "giờ < 6 hoặc giờ > 22" bằng hai nhánh, không cần khái niệm khoảng cách.',
          tags: ['thoi-gian', 'cay-quyet-dinh'],
        },
        {
          id: 't5l5-c3',
          front: 'Nêu ba tình huống khiến đường cơ sở theo từng người thất bại.',
          back: 'Người mới không có lịch sử; người dùng thưa nên thống kê vô nghĩa; và tài khoản đã bị chiếm ngay trong giai đoạn xây đường cơ sở nên hành vi tấn công thành chuẩn mực.',
          tags: ['ueba', 'duong-co-so'],
        },
        {
          id: 't5l5-c4',
          front: 'Vì sao dùng median + MAD thay vì mean + std cho đường cơ sở hành vi?',
          back: 'Vì một ngoại lai hợp lệ (một lần đồng bộ 5.000 tệp) kéo mean và std lên vĩnh viễn, khiến mọi bất thường thật sau đó lọt lưới. Median và MAD gần như không bị ảnh hưởng.',
          tags: ['ueba', 'thong-ke'],
        },
        {
          id: 't5l5-c5',
          front: 'Cách tính đặc trưng first-seen đúng point-in-time trong pandas là gì?',
          back: 'sort_values theo thời gian rồi groupby(...).cumcount() == 0. Cumcount chỉ đếm những gì đã xuất hiện trước đó, nên không mượn thông tin từ tương lai.',
          tags: ['ueba', 'ro-ri-du-lieu'],
        },
      ],
      quiz: [
        {
          id: 't5l5-q1',
          kind: 'mcq',
          tags: ['ueba', 'thoi-gian'],
          q: 'Hệ thống UEBA của bạn tạo 2.000 cảnh báo "đăng nhập ngoài giờ" mỗi sáng cho một công ty 2.000 người ở Việt Nam. Nguyên nhân gốc nhiều khả năng nhất là gì?',
          options: [
            'Ngưỡng bất thường đặt quá nhạy, cần nâng lên',
            'Log ghi theo UTC còn luật được viết theo giờ địa phương, nên 8h sáng Việt Nam thành 1h sáng trong log',
            'Có một chiến dịch chiếm tài khoản quy mô lớn đang diễn ra',
            'Mô hình cần được huấn luyện lại với dữ liệu mới hơn',
          ],
          answer: 1,
          why: 'Con số 2.000 cảnh báo cho 2.000 người, xuất hiện mỗi sáng, là chữ ký của một lỗi hệ thống chứ không phải của một hiện tượng bảo mật. UTC+7 nghĩa là 8h sáng giờ Việt Nam được ghi thành 01:00Z, rơi thẳng vào cửa sổ "0h–5h". Điều nguy hiểm hơn con số: đội SOC sẽ tạo bộ lọc ẩn toàn bộ loại cảnh báo này, và bộ lọc đó sẽ ẩn luôn cảnh báo thật. Sửa đúng là quy đổi múi giờ trước khi trích đặc trưng, không phải chỉnh ngưỡng.',
          distractorWhy: [
            'Chỉnh ngưỡng chỉ che triệu chứng; đặc trưng vẫn sai và sẽ sai theo cách khác.',
            '',
            'Một chiến dịch nhắm đúng 100% nhân viên và lặp lại mỗi sáng là không thực tế.',
            'Huấn luyện lại trên đặc trưng sai chỉ cho một mô hình sai mới.',
          ],
        },
        {
          id: 't5l5-q2',
          kind: 'mcq',
          tags: ['ueba', 'duong-co-so'],
          q: 'Một kẻ tấn công đã chiếm tài khoản và tăng dần khối lượng tải tài liệu trong 3 tháng, mỗi tuần nhiều hơn tuần trước khoảng 10%. Đường cơ sở cuốn chiếu 90 ngày phản ứng thế nào, và bạn thêm gì để bắt được?',
          options: [
            'Đường cơ sở sẽ cảnh báo ngay từ tuần thứ hai vì mức tăng liên tục',
            'Đường cơ sở bám theo sự tăng dần nên không cảnh báo; cần thêm đường cơ sở cố định dài hạn và đặc trưng độ dốc theo thời gian',
            'Không có cách nào phát hiện được kiểu tấn công này',
            'Chỉ cần rút ngắn cửa sổ cuốn chiếu xuống 7 ngày là đủ',
          ],
          answer: 1,
          why: 'Cửa sổ cuốn chiếu luôn so hôm nay với quá khứ gần, mà quá khứ gần đã bị kẻ tấn công định hình. Mức tăng 10% mỗi tuần luôn nằm trong dao động bình thường so với tuần trước, nhưng sau 12 tuần tổng mức tăng gấp hơn ba lần. Hai biện pháp bổ sung đều rẻ: giữ một đường cơ sở đóng băng dài hạn để so song song, và thêm đặc trưng độ dốc (hồi quy tuyến tính của khối lượng theo 90 ngày) để chính sự tăng đều trở thành tín hiệu. Rút ngắn cửa sổ xuống 7 ngày làm mọi thứ tệ hơn: nó bám theo kẻ tấn công còn nhanh hơn.',
          distractorWhy: [
            'Mức tăng 10% mỗi tuần luôn nằm trong dao động bình thường của tuần liền trước.',
            '',
            'Phát hiện được, và bằng những đặc trưng rất rẻ.',
            'Cửa sổ ngắn hơn thích ứng nhanh hơn, tức là bị lừa nhanh hơn.',
          ],
        },
        {
          id: 't5l5-q3',
          kind: 'truefalse',
          tags: ['ueba', 'ro-ri-du-lieu'],
          q: 'Tính đặc trưng "lần đầu người dùng truy cập máy chủ này" bằng cách groupby trên toàn bộ tập dữ liệu rồi đánh dấu bản ghi có dấu thời gian nhỏ nhất là cách làm đúng.',
          answer: false,
          why: 'Cách đó xác định "lần đầu" bằng cách nhìn toàn bộ dữ liệu, gồm cả tương lai. Với một sự kiện xảy ra ngày 5/3, hệ thống thật không thể biết liệu người này còn truy cập máy chủ đó sớm hơn hay không — nó chỉ biết những gì đã xảy ra tới thời điểm đó. Cách đúng là sắp xếp theo thời gian rồi dùng `cumcount() == 0`. Sai lầm này thường làm AUC trong phòng thí nghiệm cao hơn thực tế 0,05–0,15, và toàn bộ phần chênh đó biến mất khi triển khai.',
        },
        {
          id: 't5l5-q4',
          kind: 'order',
          tags: ['ueba', 'quy-trinh'],
          q: 'Sắp xếp các bước xử lý dữ liệu để tạo đặc trưng hành vi đúng cách.',
          items: [
            'Chuẩn hoá dấu thời gian về UTC có nhận biết múi giờ',
            'Quy đổi sang múi giờ địa phương của từng người dùng',
            'Sắp xếp toàn bộ sự kiện theo thứ tự thời gian tăng dần',
            'Tính đặc trưng first-seen và tần suất bằng cumcount point-in-time',
            'Tính độ lệch so với chính mình bằng median và MAD trên cửa sổ quá khứ',
            'Ghép thêm đặc trưng so với nhóm ngang hàng lấy từ dữ liệu HR',
          ],
          why: 'Thứ tự này bắt buộc vì mỗi bước phụ thuộc vào bước trước. Không quy đổi múi giờ thì mọi đặc trưng thời gian sai. Không sắp xếp theo thời gian thì `cumcount` cho kết quả vô nghĩa. Và đặc trưng nhóm ngang hàng phải đến cuối vì nó cần cả bảng đặc trưng cá nhân đã tính xong để so sánh. Rất nhiều lỗi trong dự án UEBA thực chất chỉ là hai bước bị đảo thứ tự.',
        },
      ],
      terms: ['ueba', 'bat-thuong', 'duong-co-so', 'ro-ri-du-lieu', 'dac-trung', 'peer-group'],
      further: [
        {
          title: 'MITRE ATT&CK — T1078 Valid Accounts',
          note: 'Đọc phần Detection: nó mô tả chính xác vì sao khi kẻ tấn công dùng thông tin đăng nhập hợp lệ thì chỉ còn hành vi bất thường là dấu vết.',
        },
        {
          title: 'Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân',
          note: 'Đọc các điều về cơ sở xử lý dữ liệu và quyền của chủ thể dữ liệu trước khi thiết kế đặc trưng UEBA. Khung pháp lý đã được nâng cấp, hãy kiểm tra bản mới nhất.',
        },
      ],
    },
    /* ====================================================================== */
    {
      id: 't5-l6',
      trackId: 'dac-trung',
      title: 'Từ TF-IDF tới embedding cho log và dòng lệnh',
      subtitle: 'Cách biến văn bản không phải tiếng người thành số — và cách biết khi nào bạn đang dùng dao mổ trâu',
      minutes: 22,
      level: 'nang-cao',
      prereqs: ['t5-l1', 't3-l2', 't1-l5'],
      why: {
        short:
          'Phần lớn dữ liệu bảo mật là văn bản có cấu trúc lạ — dòng lệnh, đường dẫn, chuỗi truy vấn, thông điệp log — và cách bạn vector hoá chúng quyết định mô hình có bắt được mã bị làm rối hay không.',
        scenario:
          'Bạn có 2 triệu dòng lệnh tiến trình từ EDR trong 90 ngày và khoảng 400 dòng đã được xác nhận là độc hại. Sếp hỏi có nên gọi API embedding của một mô hình ngôn ngữ lớn cho từng dòng không — mỗi ngày 25.000 dòng mới. Bạn cần một câu trả lời có căn cứ, kèm chi phí.',
        roles: ['Security Data Scientist', 'ML Engineer', 'Detection Engineer', 'Threat Hunter'],
        costOfNotKnowing:
          'Bạn hoặc là dùng tách từ theo khoảng trắng và tạo ra một từ điển 4 triệu token vô dụng, hoặc là đốt ngân sách cho embedding của mô hình ngôn ngữ trong khi TF-IDF n-gram ký tự cho kết quả tương đương với chi phí bằng một phần nghìn.',
      },
      objectives: [
        'Giải thích vì sao n-gram ký tự thắng tách từ trên dòng lệnh và log',
        'Tính TF-IDF theo đúng công thức scikit-learn dùng và biết khi nào hashing trick thay thế được từ điển',
        'Ra quyết định có căn cứ giữa TF-IDF, fastText và embedding từ mô hình ngôn ngữ dựa trên bốn tiêu chí',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Đây là một dòng lệnh thật, kiểu bạn gặp trong log EDR mỗi tuần:\n\n`powershell.exe -nop -w hidden -ep bypass -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQA...`\n\nVà đây là một dòng lành tính hoàn toàn:\n\n`powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\\Scripts\\BackupDaily.ps1`\n\nHai dòng dùng chung phần lớn từ khoá. Việc của bài này là tìm cách biểu diễn để mô hình phân biệt được chúng.',
        },
        { t: 'h', text: 'Vì sao tách từ theo khoảng trắng sai ngay từ bước đầu', level: 2 },
        {
          t: 'predict',
          question:
            'Bạn chạy `TfidfVectorizer()` với thiết lập mặc định (tách theo từ) trên 2 triệu dòng lệnh thu thập trong 90 ngày. Từ điển sẽ có khoảng bao nhiêu token, và bao nhiêu phần trăm trong đó chỉ xuất hiện đúng một lần?',
          reveal:
            'Từ điển sẽ có **hàng triệu** token, và thường **70–90% chỉ xuất hiện đúng một lần**. Nguồn gốc: mỗi GUID là một token duy nhất; mỗi tên tệp tạm `tmp3f9a2c.dat` là một token duy nhất; mỗi khối base64 dài là một token duy nhất; mỗi đường dẫn có tên người dùng là một token duy nhất.\n\nĐây là phân phối đuôi dài kiểu Zipf, và hậu quả rất cụ thể:\n\n- **Ma trận khổng lồ nhưng rỗng thông tin.** Token xuất hiện một lần không dạy mô hình được gì, nó chỉ ghi nhớ một hàng.\n- **Vỡ hoàn toàn khi gặp dữ liệu mới.** Ngày mai sinh ra token mới, và `TfidfVectorizer` bỏ qua mọi token không có trong từ điển — nghĩa là chính phần đáng ngờ nhất của dòng lệnh bị vứt đi.\n- **Làm rối là né miễn phí.** Chèn dấu nháy vào giữa từ khoá (`p"ow"ershell`) tạo ra một token hoàn toàn mới mà mô hình chưa từng thấy.\n\nĐặt `min_df=5` sẽ cắt phần lớn đuôi và thường là bước sửa đầu tiên. Nhưng cách sửa gốc rễ nằm ở chỗ khác: **đừng tách theo từ.**',
        },
        {
          t: 'compare',
          title: 'Hai cách cắt cùng một dòng lệnh',
          left: {
            title: '📝 Token theo từ',
            items: [
              'Mỗi khoảng trắng là ranh giới',
              'Từ điển phình vô hạn theo thời gian: GUID, tên tệp tạm, base64',
              'Token chưa thấy bao giờ bị bỏ qua hoàn toàn (OOV)',
              'Chèn một ký tự vào giữa từ khoá là né được',
              'Có ưu điểm: đọc được, giải thích được cho analyst',
            ],
          },
          right: {
            title: '🔤 N-gram ký tự (3–5)',
            items: [
              'Cắt mọi chuỗi con 3, 4, 5 ký tự liên tiếp',
              'Từ điển bị chặn tự nhiên vì số tổ hợp ký tự có hạn trong thực tế',
              'Không có khái niệm OOV: chuỗi lạ vẫn phân rã thành n-gram quen thuộc',
              'Bền với làm rối: `p"ow"ershell` vẫn chia sẻ nhiều n-gram với `powershell`',
              'Bắt được cả cấu trúc bên trong token: `-enc`, `.ps1`, `xn--`',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Vì sao dùng analyzer char_wb chứ không phải char',
          md: 'Trong scikit-learn, `analyzer="char"` cắt n-gram xuyên qua cả khoảng trắng, tạo ra những n-gram vô nghĩa nối đuôi từ này với đầu từ kia. `analyzer="char_wb"` chỉ cắt **trong phạm vi từng từ** (word boundary) và đệm khoảng trắng ở hai đầu, nên các n-gram ở đầu và cuối token mang thông tin về vị trí. Với dòng lệnh và đường dẫn, `char_wb` với `ngram_range=(3, 5)` là điểm khởi đầu tốt trong hầu hết trường hợp.',
        },
        { t: 'h', text: 'TF-IDF: hai con số và một phép chuẩn hoá', level: 2 },
        {
          t: 'p',
          md: '**TF** (term frequency) là số lần một đặc trưng xuất hiện trong một tài liệu. **IDF** (inverse document frequency) hạ trọng số của những đặc trưng xuất hiện ở khắp nơi. Công thức mà scikit-learn dùng mặc định (`smooth_idf=True`) là: `idf(t) = ln((1 + N) / (1 + df(t))) + 1`, trong đó `N` là số tài liệu và `df(t)` là số tài liệu chứa `t`. Sau khi nhân `tf × idf`, mỗi hàng được chuẩn hoá L2 về độ dài 1.',
        },
        {
          t: 'steps',
          title: 'Tính bằng tay trên 5 dòng lệnh',
          steps: [
            {
              title: 'Bước 1 — Dữ liệu',
              md: 'Giả sử `N = 5` dòng lệnh. N-gram `pow` xuất hiện trong cả 5 dòng (`df = 5`). N-gram `enc` xuất hiện trong đúng 1 dòng (`df = 1`).',
            },
            {
              title: 'Bước 2 — IDF của n-gram phổ biến',
              md: '`idf(pow) = ln((1 + 5) / (1 + 5)) + 1 = ln(1) + 1 = 1,00`. Xuất hiện ở mọi nơi nên gần như không mang thông tin phân biệt — trọng số về mức sàn.',
            },
            {
              title: 'Bước 3 — IDF của n-gram hiếm',
              md: '`idf(enc) = ln((1 + 5) / (1 + 1)) + 1 = ln(3) + 1 ≈ 2,10`. Cao hơn gấp đôi. Đây chính là cơ chế làm TF-IDF hữu ích: nó tự động đề cao thứ hiếm.',
            },
            {
              title: 'Bước 4 — Nhân với TF rồi chuẩn hoá L2',
              md: 'Nếu dòng chứa `enc` có 2 lần `enc` và 3 lần `pow`, vector thô là `[3×1,00 ; 2×2,10] = [3,00 ; 4,20]`. Chuẩn hoá L2 chia cho `√(3,00² + 4,20²) ≈ 5,16`, cho `[0,58 ; 0,81]`.',
            },
            {
              title: 'Bước 5 — Vì sao chuẩn hoá L2 quan trọng',
              md: 'Không có nó, một dòng lệnh dài 4.000 ký tự sẽ có mọi giá trị lớn hơn một dòng 60 ký tự, và mô hình tuyến tính sẽ chủ yếu học độ dài. Nếu bạn muốn độ dài là đặc trưng, hãy thêm nó thành **một cột riêng, có ý thức** — chứ đừng để nó lẻn vào qua cửa sau.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Fit vectorizer trên toàn bộ dữ liệu rồi mới chia tập',
          md: 'Đây là dạng rò rỉ phổ biến nhất trong ML văn bản, và trong bảo mật nó đặc biệt tai hại. Hai thứ bị rò:\n\n**(1) IDF** được tính từ `df` trên cả tập, gồm cả phần tương lai. **(2) Từ điển** chứa các token chỉ xuất hiện trong tập kiểm tra — ví dụ tên máy chủ của một chiến dịch tấn công tháng sau. Kết quả: tập kiểm tra trông dễ hơn thực tế.\n\nCách đúng: `fit_transform` **chỉ trên tập huấn luyện** (là phần sớm hơn theo thời gian, xem bài t2-l6), rồi `transform` trên tập kiểm tra. Trong scikit-learn, gói vectorizer vào `Pipeline` cùng bộ phân loại là cách rẻ nhất để không bao giờ quên.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Đường cơ sở phân loại dòng lệnh: n-gram ký tự + vài đặc trưng thủ công',
          code:
            "import numpy as np\n" +
            "from scipy.sparse import hstack, csr_matrix\n" +
            "from sklearn.feature_extraction.text import TfidfVectorizer\n" +
            "from sklearn.linear_model import LogisticRegression\n" +
            "\n" +
            "vec = TfidfVectorizer(analyzer='char_wb', ngram_range=(3, 5),\n" +
            "                      min_df=5, max_features=200000,\n" +
            "                      sublinear_tf=True, lowercase=True)\n" +
            "\n" +
            "# CHỈ fit trên tập huấn luyện (phần SỚM HƠN theo thời gian)\n" +
            "X_tr = vec.fit_transform(cmd_train)\n" +
            "X_te = vec.transform(cmd_test)\n" +
            "\n" +
            "def thu_cong(xs):\n" +
            "    # Vài tín hiệu mà n-gram không diễn đạt gọn được\n" +
            "    return csr_matrix(np.array([[\n" +
            "        len(x),\n" +
            "        sum(c.isdigit() for c in x) / max(len(x), 1),\n" +
            "        sum(not c.isalnum() for c in x) / max(len(x), 1),\n" +
            "        int('-enc' in x.lower() or '-e ' in x.lower()),\n" +
            "    ] for x in xs], dtype=float))\n" +
            "\n" +
            "X_tr = hstack([X_tr, thu_cong(cmd_train)]).tocsr()\n" +
            "X_te = hstack([X_te, thu_cong(cmd_test)]).tocsr()\n" +
            "\n" +
            "clf = LogisticRegression(C=1.0, class_weight='balanced', max_iter=3000)\n" +
            "clf.fit(X_tr, y_train)\n",
        },
        { t: 'lab', id: 'lab-tfidf', intro: 'Gõ vào vài dòng log, đổi giữa token theo từ và n-gram ký tự, đổi ngram_range và min_df, rồi xem trực tiếp ma trận thưa cùng trọng số IDF thay đổi ra sao.' },
        { t: 'h', text: 'Hashing trick: khi từ điển không nằm vừa bộ nhớ', level: 2 },
        {
          t: 'p',
          md: 'Ý tưởng: bỏ hẳn từ điển. Với mỗi đặc trưng (một n-gram, một tên hàm import, một tên máy chủ), tính `h = hash(dac_trung) mod m` và cộng giá trị vào cột `h`. `m` là số cột bạn chọn trước — mặc định của `HashingVectorizer` trong scikit-learn là `2^20 = 1.048.576`.',
        },
        {
          t: 'table',
          caption: 'Được và mất khi bỏ từ điển.',
          head: ['Khía cạnh', 'TfidfVectorizer (có từ điển)', 'HashingVectorizer (hashing trick)'],
          rows: [
            ['Bộ nhớ khi huấn luyện', 'Phải giữ toàn bộ từ điển, có thể hàng GB', 'Không lưu gì cả, hoàn toàn không trạng thái'],
            ['Xử lý luồng dữ liệu', 'Phải quét hết dữ liệu một lượt để dựng từ điển', 'Biến đổi được từng dòng ngay lập tức'],
            ['Đặc trưng chưa từng thấy', 'Bị bỏ qua hoàn toàn', 'Rơi vào một cột nào đó, vẫn đóng góp'],
            ['Rò rỉ khi fit', 'Có nguy cơ nếu fit trên cả tập', 'Không thể rò rỉ vì không có bước fit'],
            ['Giải thích được', 'Truy ngược cột về đúng n-gram', 'Không truy ngược được — mất khả năng giải thích'],
            ['Va chạm', 'Không có', 'Có; với 2^20 cột và 200.000 đặc trưng, khoảng 17% đặc trưng chia ô với ít nhất một đặc trưng khác'],
            ['IDF', 'Có sẵn', 'Phải ghép thêm TfidfTransformer nếu muốn'],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao va chạm ít gây hại hơn bạn nghĩ',
          md: 'Trực giác đầu tiên là "17% va chạm chắc phá hỏng mô hình". Trong thực tế thì không, vì hai lý do.\n\n**(1) Phần lớn đặc trưng bị va chạm là đặc trưng hiếm** — chúng vốn đóng góp rất ít. Xác suất hai đặc trưng *quan trọng* (tần suất cao) va nhau là rất nhỏ vì chúng chỉ chiếm một phần nhỏ của tập.\n\n**(2) `alternate_sign=True`** (mặc định) gán ngẫu nhiên dấu cộng hoặc trừ cho mỗi đặc trưng khi cộng vào ô. Nhờ đó, đóng góp của các đặc trưng va chạm có xu hướng triệt tiêu lẫn nhau thay vì cộng dồn thành nhiễu một chiều.\n\nCái mất thật sự không phải độ chính xác — mà là **khả năng giải thích**. Khi analyst hỏi "vì sao dòng lệnh này bị chấm 0,91", với TF-IDF bạn chỉ ra được `-enc` và `hidden`; với hashing bạn chỉ ra được "cột 748213". Trong SOC, đó thường là lý do quyết định.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't5l6-cp1',
              kind: 'mcq',
              tags: ['tf-idf', 'n-gram'],
              q: 'Vì sao n-gram ký tự bền với làm rối hơn hẳn token theo từ?',
              options: [
                'Vì n-gram ký tự luôn tạo ít đặc trưng hơn',
                'Vì chèn ký tự lạ vào giữa từ khoá chỉ phá vài n-gram, phần lớn các n-gram còn lại vẫn trùng với chuỗi gốc',
                'Vì n-gram ký tự bỏ qua ký tự đặc biệt',
                'Vì n-gram ký tự tự động giải mã base64',
              ],
              answer: 1,
              why: 'Với token theo từ, `powershell` và `p"ow"ershell` là hai token hoàn toàn khác nhau — mô hình không thấy mối liên hệ nào. Với n-gram 3 ký tự, chuỗi thứ hai vẫn chứa `ers`, `rsh`, `she`, `hel`, `ell` giống hệt chuỗi gốc; chỉ vài n-gram quanh chỗ chèn bị hỏng. Sự chồng lấn đó chính là thứ giữ cho mô hình nhận ra. Đây là lý do các công cụ làm rối như Invoke-Obfuscation làm mô hình dựa trên từ sụp đổ mà ít ảnh hưởng tới mô hình n-gram ký tự.',
              distractorWhy: [
                'Ngược lại — n-gram ký tự thường tạo NHIỀU đặc trưng hơn, đó là cái giá phải trả.',
                '',
                'Nó không bỏ qua ký tự đặc biệt; ngược lại, ký tự đặc biệt là tín hiệu quý.',
                'Không có bước giải mã nào; n-gram chỉ cắt chuỗi con.',
              ],
            },
            {
              id: 't5l6-cp2',
              kind: 'truefalse',
              tags: ['tf-idf', 'ro-ri-du-lieu'],
              q: 'Dùng HashingVectorizer thay TfidfVectorizer loại bỏ được một nguồn rò rỉ dữ liệu.',
              answer: true,
              why: 'Đúng: `HashingVectorizer` không có bước `fit`, nên không có từ điển và không có IDF nào được học từ dữ liệu. Nghĩa là bạn không thể vô tình để thông tin từ tập kiểm tra lọt vào biểu diễn. Đây là một ưu điểm ít được nhắc tới nhưng rất thực tế trong hệ thống chạy liên tục. Cái giá là mất khả năng truy ngược cột về đặc trưng gốc — và nếu bạn ghép thêm `TfidfTransformer` phía sau thì bước fit lại xuất hiện, cùng với nguy cơ rò rỉ.',
            },
          ],
        },
        { t: 'h', text: 'Embedding: khi nào đáng và khi nào thừa', level: 2 },
        {
          t: 'p',
          md: '**word2vec** (Mikolov và cộng sự, 2013) học vector cho từng từ sao cho từ xuất hiện trong ngữ cảnh giống nhau có vector gần nhau. Nhược điểm chí mạng cho bảo mật: từ chưa từng thấy trong lúc huấn luyện thì không có vector — mà mỗi ngày dữ liệu bảo mật sinh ra hàng nghìn token mới.',
        },
        {
          t: 'p',
          md: '**fastText** (Facebook AI, 2016) sửa đúng điểm đó: nó biểu diễn mỗi từ như tổng các vector của n-gram ký tự con bên trong nó (mặc định 3 tới 6 ký tự). Nhờ vậy một token chưa từng thấy vẫn nhận được vector hợp lý từ các phần con quen thuộc. Với dữ liệu bảo mật, đây là lý do fastText thường là lựa chọn embedding đầu tiên đáng thử.',
        },
        {
          t: 'p',
          md: '**Embedding từ mô hình ngôn ngữ** (ví dụ `all-MiniLM-L6-v2` của sentence-transformers, 384 chiều, khoảng 22 triệu tham số) mã hoá cả câu thành một vector mang ngữ nghĩa. Chúng rất mạnh khi dữ liệu của bạn thực sự là **ngôn ngữ tự nhiên**: mô tả cảnh báo, ghi chú điều tra, nội dung email, báo cáo threat intel, mô tả CVE. Chúng ít hữu ích hơn nhiều với dòng lệnh — vì mô hình nền được huấn luyện trên văn bản người viết, và nó không có khái niệm gì đặc biệt về `rundll32.exe` hay `-ep bypass`.',
        },
        {
          t: 'table',
          caption: 'Bảng quyết định — dán vào tài liệu thiết kế của bạn.',
          head: ['Phương pháp', 'Số chiều điển hình', 'Chi phí suy luận', 'Xử lý token mới', 'Giải thích được', 'Dùng khi'],
          rows: [
            ['Bag of words theo từ', 'Hàng triệu, thưa', 'Rất rẻ', 'Bỏ qua hoàn toàn', 'Tốt', 'Log có từ vựng cố định và hẹp'],
            ['TF-IDF n-gram ký tự', '50k–500k, thưa', 'Rẻ (micro-giây/dòng)', 'Rất tốt, phân rã thành n-gram con', 'Tốt', 'Mặc định cho dòng lệnh, URL, đường dẫn'],
            ['Hashing trick', 'Cố định, ví dụ 2^20', 'Rẻ, không trạng thái', 'Rất tốt', 'Không', 'Luồng thời gian thực, bộ nhớ hạn chế'],
            ['fastText', '100–300, đặc', 'Rẻ', 'Tốt nhờ n-gram con', 'Kém', 'Cần vector đặc để phân cụm hoặc tìm tương tự'],
            ['Embedding từ mô hình ngôn ngữ', '384–1536, đặc', 'Bậc mili-giây/dòng trên CPU', 'Tốt', 'Kém', 'Văn bản là ngôn ngữ tự nhiên thật: ghi chú, email, báo cáo'],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Bốn câu hỏi trước khi gọi API embedding',
          md: '**(1) Dữ liệu của tôi có phải ngôn ngữ tự nhiên không?** Dòng lệnh, đường dẫn, chuỗi truy vấn thì không. Ghi chú của analyst và nội dung email thì có.\n\n**(2) Tôi đã đo đường cơ sở TF-IDF chưa?** Nếu chưa, mọi so sánh đều vô nghĩa. Rất thường xuyên, TF-IDF n-gram ký tự cộng vài đặc trưng thủ công đạt trong khoảng 1–2 điểm PR-AUC so với embedding, với chi phí thấp hơn ba bậc.\n\n**(3) Tôi có ngân sách độ trễ và ngân sách tiền không?** 25.000 dòng mỗi ngày qua API bên ngoài là một hoá đơn định kỳ và một phụ thuộc mạng trong đường xử lý bảo mật.\n\n**(4) Tôi có được phép gửi dữ liệu này ra ngoài không?** Dòng lệnh chứa tên máy, tên người dùng, đôi khi cả mật khẩu gõ nhầm vào tham số. Gửi chúng tới API bên thứ ba là một quyết định về quyền riêng tư và tuân thủ, không phải một quyết định kỹ thuật. Nếu vẫn cần embedding, hãy chạy mô hình nhỏ tại chỗ.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Trôi từ vựng: kẻ giết mô hình văn bản một cách âm thầm',
          md: 'Từ điển của bạn đóng băng tại ngày huấn luyện. Ba tháng sau, công ty triển khai một công cụ quản trị mới, đổi quy ước đặt tên máy chủ, hoặc chuyển sang PowerShell 7. Tỉ lệ n-gram không có trong từ điển tăng dần, và mô hình mất tín hiệu mà không có bất kỳ lỗi nào được ghi lại.\n\nHãy giám sát một chỉ số cực rẻ: **tỉ lệ đặc trưng ngoài từ điển (OOV) mỗi ngày**. Nó tăng từ 2% lên 11% là tín hiệu phải huấn luyện lại, và bạn biết điều đó trước khi nhãn về hàng tuần. Đây chính là biến thể của PSI ở bài t5-l1, áp dụng cho dữ liệu văn bản.',
        },
        {
          t: 'p',
          md: 'Kết luận thực dụng của cả bài: trong đa số bài toán văn bản bảo mật, phương án thắng là **TF-IDF trên n-gram ký tự, ghép thêm một nhúm đặc trưng thủ công** (độ dài, tỉ lệ chữ số, tỉ lệ ký tự đặc biệt, entropy, có phải base64 không, tiến trình cha là gì). Nó rẻ, giải thích được, bền với làm rối, và là đường cơ sở mà mọi thứ phức tạp hơn phải chứng minh mình xứng đáng vượt qua.',
        },
        { t: 'terms', ids: ['embedding', 'entropy', 'dac-trung', 'ro-ri-du-lieu', 'hoi-quy-logistic'] },
      ],
      keyTakeaways: [
        'Tách từ theo khoảng trắng tạo từ điển hàng triệu token với 70–90% chỉ xuất hiện một lần, và vỡ hoàn toàn trước làm rối và token mới.',
        'N-gram ký tự (char_wb, 3–5) là mặc định đúng cho dòng lệnh, URL và đường dẫn: không có OOV và bền với làm rối vì các n-gram vẫn chồng lấn.',
        'IDF trong scikit-learn là ln((1+N)/(1+df)) + 1, và chuẩn hoá L2 sau đó ngăn mô hình vô tình học độ dài tài liệu.',
        'Luôn fit vectorizer chỉ trên tập huấn luyện sớm hơn theo thời gian; gói vào Pipeline là cách rẻ nhất để không quên.',
        'Hashing trick bỏ từ điển nên chạy được trên luồng và không thể rò rỉ, nhưng đánh đổi bằng khả năng giải thích — thứ thường quyết định trong SOC.',
        'Embedding của mô hình ngôn ngữ chỉ đáng dùng khi dữ liệu là ngôn ngữ tự nhiên thật; với dòng lệnh, TF-IDF n-gram ký tự cộng đặc trưng thủ công thường ngang bằng với chi phí thấp hơn ba bậc.',
      ],
      cards: [
        {
          id: 't5l6-c1',
          front: 'Vì sao n-gram ký tự bền với làm rối hơn token theo từ?',
          back: 'Vì chèn ký tự vào giữa từ khoá chỉ phá vài n-gram quanh chỗ chèn; phần lớn n-gram còn lại vẫn trùng với chuỗi gốc nên mô hình vẫn thấy sự tương đồng.',
          tags: ['n-gram', 'tf-idf'],
        },
        {
          id: 't5l6-c2',
          front: 'Khác biệt giữa analyzer char và char_wb trong scikit-learn là gì?',
          back: 'char cắt n-gram xuyên qua khoảng trắng, tạo n-gram vô nghĩa nối hai từ. char_wb chỉ cắt trong phạm vi từng từ và đệm khoảng trắng ở hai đầu.',
          tags: ['tf-idf'],
        },
        {
          id: 't5l6-c3',
          front: 'Hashing trick được gì và mất gì so với từ điển?',
          back: 'Được: không trạng thái, chạy trên luồng, không thể rò rỉ khi fit, xử lý được đặc trưng mới. Mất: không truy ngược cột về đặc trưng gốc, tức mất khả năng giải thích.',
          tags: ['hashing-trick'],
        },
        {
          id: 't5l6-c4',
          front: 'fastText giải quyết điểm yếu nào của word2vec cho dữ liệu bảo mật?',
          back: 'Vấn đề token chưa từng thấy: fastText biểu diễn mỗi từ bằng tổng vector các n-gram ký tự con, nên token mới vẫn nhận được vector hợp lý.',
          tags: ['embedding'],
        },
        {
          id: 't5l6-c5',
          front: 'Chỉ số rẻ nào cảnh báo sớm rằng mô hình văn bản của bạn đang mất tín hiệu?',
          back: 'Tỉ lệ đặc trưng ngoài từ điển (OOV) mỗi ngày. Nó tăng dần khi từ vựng trong môi trường thay đổi, và biết được trước khi nhãn về hàng tuần.',
          tags: ['troi-du-lieu', 'tf-idf'],
        },
      ],
      quiz: [
        {
          id: 't5l6-q1',
          kind: 'mcq',
          tags: ['tf-idf', 'thuc-chien'],
          q: 'Bạn có 2 triệu dòng lệnh, 400 nhãn độc hại, cần chạy suy luận trên 25.000 dòng mới mỗi ngày và analyst phải hiểu vì sao mỗi dòng bị chấm điểm. Chọn biểu diễn nào ĐẦU TIÊN?',
          options: [
            'Gọi API embedding của một mô hình ngôn ngữ lớn cho từng dòng',
            'TF-IDF n-gram ký tự (char_wb, 3–5) ghép thêm vài đặc trưng thủ công',
            'HashingVectorizer với 2^20 cột',
            'Huấn luyện một transformer từ đầu trên 2 triệu dòng lệnh',
          ],
          answer: 1,
          why: 'Ba ràng buộc trong đề bài loại dần các phương án. **Giải thích được** loại hashing và embedding, vì cả hai không truy ngược được về chuỗi gốc. **Chi phí và độ trễ** cùng với việc dữ liệu chứa tên máy, tên người dùng loại API bên ngoài. **400 nhãn** là quá ít để huấn luyện transformer từ đầu — với số nhãn đó, một mô hình tuyến tính trên đặc trưng thưa gần như luôn là lựa chọn hợp lý hơn. TF-IDF n-gram ký tự thoả cả ba, và nó cũng là đường cơ sở bắt buộc trước khi thử bất cứ thứ gì đắt hơn.',
          distractorWhy: [
            'Đắt, phụ thuộc mạng, không giải thích được, và có vấn đề quyền riêng tư với dữ liệu dòng lệnh.',
            '',
            'Tốt về vận hành nhưng vi phạm yêu cầu analyst phải hiểu lý do chấm điểm.',
            '400 nhãn dương là quá ít để huấn luyện transformer từ đầu một cách có ý nghĩa.',
          ],
        },
        {
          id: 't5l6-q2',
          kind: 'multi',
          tags: ['tf-idf', 'ro-ri-du-lieu'],
          q: 'Điều gì bị rò rỉ khi bạn gọi `fit_transform` của TfidfVectorizer trên toàn bộ dữ liệu rồi mới chia train/test? (Chọn tất cả đáp án đúng)',
          options: [
            'Giá trị IDF, vì df được đếm trên cả phần dữ liệu tương lai',
            'Từ điển, vì nó chứa cả token chỉ xuất hiện trong tập kiểm tra',
            'Nhãn của tập kiểm tra',
            'Trọng số của bộ phân loại',
          ],
          answers: [0, 1],
          why: 'Vectorizer không nhìn thấy nhãn, nên nhãn không bị rò trực tiếp — nhưng cả IDF lẫn từ điển đều được học từ dữ liệu và cả hai đều mượn thông tin từ phần tương lai. Từ điển là phần nguy hiểm hơn trong bảo mật: nó có thể chứa tên máy chủ, tên tệp hoặc chuỗi đặc thù của một chiến dịch tấn công chỉ xuất hiện trong tập kiểm tra, khiến các mẫu đó trông dễ nhận ra hơn thực tế. Trọng số bộ phân loại được học sau, ở bước riêng.',
        },
        {
          id: 't5l6-q3',
          kind: 'input',
          tags: ['tf-idf'],
          q: 'Trong scikit-learn, tham số `analyzer` nào cắt n-gram ký tự nhưng chỉ trong phạm vi từng từ, có đệm khoảng trắng ở hai đầu?',
          accept: ['char_wb', 'char wb', 'charwb', 'analyzer char_wb'],
          placeholder: 'Gõ giá trị tham số…',
          hint: 'Bảy ký tự, có dấu gạch dưới, wb là viết tắt của word boundary.',
          why: '`analyzer="char_wb"`. Khác biệt so với `"char"` nghe nhỏ nhưng có ảnh hưởng thật: `"char"` tạo ra các n-gram vắt ngang khoảng trắng, nối đuôi từ này với đầu từ kia, phần lớn là nhiễu. `"char_wb"` giữ n-gram trong từng token và đệm khoảng trắng nên n-gram ở đầu và cuối token mang thông tin vị trí — điều rất có ích với đường dẫn, cờ dòng lệnh và phần mở rộng tệp.',
        },
        {
          id: 't5l6-q4',
          kind: 'truefalse',
          tags: ['hashing-trick'],
          q: 'Với 2^20 cột và khoảng 200.000 đặc trưng phân biệt, tỉ lệ va chạm của hashing trick lớn đến mức làm hỏng mô hình.',
          answer: false,
          why: 'Khoảng 17% đặc trưng sẽ chia ô với ít nhất một đặc trưng khác, nhưng ảnh hưởng tới độ chính xác thường rất nhỏ vì hai lý do: phần lớn đặc trưng bị va chạm là đặc trưng hiếm vốn đóng góp ít, và `alternate_sign=True` gán dấu ngẫu nhiên nên đóng góp của các đặc trưng va chạm có xu hướng triệt tiêu nhau thay vì cộng dồn. Cái mất thật sự không phải độ chính xác mà là khả năng giải thích: bạn không truy ngược được từ cột 748213 về n-gram nào.',
        },
        {
          id: 't5l6-q5',
          kind: 'match',
          tags: ['embedding', 'tf-idf'],
          q: 'Nối mỗi loại dữ liệu với cách biểu diễn hợp lý nhất.',
          pairs: [
            ['Dòng lệnh tiến trình từ EDR', 'TF-IDF n-gram ký tự cộng đặc trưng thủ công'],
            ['Ghi chú điều tra do analyst viết bằng tiếng Việt', 'Embedding câu từ mô hình ngôn ngữ'],
            ['Luồng log 500.000 dòng/giây cần chấm điểm tức thời', 'Hashing trick, không trạng thái'],
            ['Tập hàm import của tệp PE, không giới hạn và luôn tăng', 'Băm về không gian chiều cố định như EMBER làm'],
          ],
          why: 'Bốn cặp này tóm tắt toàn bộ bài học. Điểm chung của cả bốn quyết định không phải là "cái nào hiện đại nhất" mà là ba ràng buộc thực tế: dữ liệu có phải ngôn ngữ tự nhiên không, ngân sách độ trễ là bao nhiêu, và có cần giải thích cho con người không. Nếu bạn trả lời được ba câu đó, việc chọn biểu diễn gần như tự hiện ra.',
        },
      ],
      terms: ['embedding', 'entropy', 'dac-trung', 'ro-ri-du-lieu', 'tf-idf', 'hashing-trick', 'n-gram'],
      further: [
        {
          title: 'scikit-learn — Text feature extraction',
          note: 'Đọc mục về analyzer char_wb và về HashingVectorizer. Tài liệu này giải thích rõ công thức IDF chính xác mà thư viện dùng, thường khác với công thức trong sách giáo khoa.',
        },
        {
          title: 'Enriching Word Vectors with Subword Information — Bojanowski, Grave, Joulin, Mikolov (2017)',
          note: 'Bài báo gốc của fastText. Ý tưởng n-gram ký tự con giải quyết vấn đề token mới là điều bạn cần hiểu để áp dụng đúng cho dữ liệu bảo mật.',
        },
        {
          title: 'Feature Hashing for Large Scale Multitask Learning — Weinberger và cộng sự (2009)',
          note: 'Nguồn gốc của hashing trick, kèm phân tích vì sao va chạm ít gây hại. Đọc phần về dấu ngẫu nhiên để hiểu alternate_sign.',
        },
      ],
    },
  ],
};
