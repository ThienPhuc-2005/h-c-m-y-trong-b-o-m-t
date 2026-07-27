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
  icon: '🧬',
  hue: 'lime',
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
    /* === CHÈN TIẾP === */
  ],
};
