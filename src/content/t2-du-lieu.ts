import type { Track } from './types';

/**
 * CHẶNG 2 — Dữ liệu bảo mật trong thực tế.
 *
 * Đây là chặng ít hào nhoáng nhất và quan trọng nhất. Mọi thất bại ML trong bảo
 * mật mà tôi từng chứng kiến đều truy được về một trong bốn nguyên nhân nằm ở đây:
 *   (a) chọn sai nguồn dữ liệu cho câu hỏi cần trả lời,
 *   (b) không chuẩn hoá thực thể và thời gian nên đếm sai,
 *   (c) nhãn bẩn / nhãn muộn nhưng vẫn tin tuyệt đối,
 *   (d) chia tập sai nên con số đo được là ảo giác.
 *
 * Trình tự sư phạm: nhìn bản đồ nguồn (l1) → biết thao tác (l2) → làm sạch (l3)
 * → lấy nhãn (l4) → hiểu bộ dữ liệu công khai (l5) → chia tập đúng (l6).
 *
 * Hai bài cuối (t4-l1, t4-l2) mang id của chặng 4 vì chúng SINH RA ở đó. Chúng
 * được chuyển về đây sau khi kiểm lại: chặng 3 dùng PR-AUC 12 lần và "hiệu
 * chuẩn" 9 lần để chấm điểm mô hình, trong khi hai khái niệm đó mãi chặng 4 mới
 * được định nghĩa. Người học gặp từ trước khi được dạy. Id giữ nguyên vì id là
 * khoá lưu tiến độ — đổi id là xoá tiến độ của người đang học dở.
 */
export const track2: Track = {
  id: 'du-lieu',
  order: 2,
  title: 'Dữ liệu bảo mật trong thực tế',
  tagline: 'Mô hình chỉ tốt bằng dữ liệu nuôi nó',
  icon: 'database',
  hue: 't2',
  blurb:
    'Tám bài về phần công việc chiếm 70–80% thời gian của mọi dự án ML bảo mật nhưng gần như không được dạy ở đâu: tìm dữ liệu, làm sạch, lấy nhãn, và chia tập sao cho con số bạn đo được không phải ảo giác. Hai bài cuối trang bị trước bộ chỉ số tối thiểu — ma trận nhầm lẫn, precision và recall — để từ chặng sau bạn có ngôn ngữ chấm điểm một mô hình thay vì gật đầu với con số accuracy. Đây là chặng biến bạn từ người chạy được scikit-learn thành người có kết quả đáng tin.',
  outcomes: [
    'Chọn được nguồn dữ liệu phù hợp cho một bài toán phát hiện cụ thể, kèm ước lượng khối lượng và độ trễ',
    'Đọc, gộp và tổng hợp log bảo mật bằng pandas ở mức làm việc thật, không phải mức nhập môn',
    'Chuẩn hoá timestamp, thực thể và trường có nhiều giá trị phân biệt mà không phá vỡ ngữ nghĩa bảo mật',
    'Thiết kế được quy trình lấy nhãn khả thi cho tổ chức đang có 0 nhãn',
    'Nêu đúng cạm bẫy của sáu bộ dữ liệu chuẩn hay bị dùng, và biết khi nào KHÔNG nên dùng',
    'Phát hiện rò rỉ dữ liệu và chia tập theo thời gian / theo nhóm đúng cách',
    'Đọc một ma trận nhầm lẫn và quy ngay ra số cảnh báo mỗi ngày cùng số giờ analyst phải trả',
    'Phân biệt precision với recall, và nói được vì sao accuracy vô nghĩa trong bài toán mất cân bằng',
  ],
  lessons: [
    /* ====================================================================== */
    {
      id: 't2-l1',
      trackId: 'du-lieu',
      title: 'Bản đồ nguồn dữ liệu bảo mật',
      subtitle: 'Chín nguồn, mỗi nguồn trả lời được câu hỏi gì và tốn bao nhiêu',
      minutes: 20,
      practiceMinutes: 3,
      level: 'nen-tang',
      prereqs: ['t0-l3'],
      why: {
        short:
          'Mọi dự án ML bảo mật bắt đầu bằng câu hỏi “dữ liệu nào trả lời được câu hỏi này” — trả lời sai câu đó thì mọi công sức phía sau đều vô nghĩa.',
        scenario:
          'Sếp muốn “phát hiện di chuyển ngang trong mạng”. Bạn có ba ngày để nói: cần bật log gì, mỗi ngày sinh ra bao nhiêu GB, mất bao lâu dữ liệu mới tới nơi, và tổ chức có sẵn cái nào rồi.',
        roles: ['SOC Analyst', 'Detection Engineer', 'Security Architect', 'Threat Hunter'],
        costOfNotKnowing:
          'Bạn xây mô hình trên nguồn dữ liệu không hề chứa dấu vết của hành vi cần phát hiện — sáu tháng sau mới nhận ra, và không có cách nào cứu bằng thuật toán tốt hơn.',
      },
      objectives: [
        'Kể tên chín nguồn dữ liệu bảo mật phổ biến và nội dung cốt lõi của từng nguồn',
        'Ước lượng được bậc độ lớn khối lượng và độ trễ của mỗi nguồn',
        'Ghép đúng nguồn dữ liệu với bài toán phát hiện cụ thể',
        'Giải thích được vì sao Zeek thay thế được PCAP trong hầu hết bài toán ML',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Kẻ tấn công lấy được mật khẩu của một nhân viên kế toán, rồi từ máy của người đó dùng RDP sang máy chủ tệp và sao chép 40 GB dữ liệu ra ngoài. Bạn chỉ được bật MỘT nguồn log. Chọn nguồn nào để có cơ hội phát hiện cao nhất?',
          reveal:
            'Không có đáp án hoàn hảo, và đó chính là bài học. **Log xác thực Windows** (4624 với Logon Type 10 = RDP, 4625, 4648) cho bạn thấy “ai đăng nhập vào đâu” — đủ để phát hiện việc một máy kế toán bỗng RDP vào máy chủ tệp lần đầu tiên trong đời. Nhưng nó không thấy 40 GB đi ra ngoài. **NetFlow/Zeek** thấy khối lượng byte bất thường nhưng không biết tài khoản nào. **EDR** thấy cả tiến trình lẫn kết nối nhưng chỉ trên máy có cài agent. Bài toán di chuyển ngang gần như luôn cần ghép ít nhất hai nguồn theo thời gian và theo thực thể — đó là lý do bài t2-l3 về chuẩn hoá thực thể tồn tại.',
        },
        {
          t: 'p',
          md: 'Trước khi bàn thuật toán, hãy trả lời câu hỏi đầu tiên của mọi dự án: **dấu vết của hành vi bạn muốn bắt nằm ở đâu?** Nếu hành vi đó không để lại dấu trong dữ liệu bạn có, không mô hình nào cứu được bạn.',
        },
        {
          t: 'p',
          md: 'Có một khung tư duy đơn giản: mọi nguồn dữ liệu bảo mật đều nằm ở một trong bốn tầng — **điểm cuối** (cái gì chạy trên máy), **danh tính** (ai đăng nhập vào đâu), **mạng** (byte đi từ đâu tới đâu), **ứng dụng và đám mây** (ai gọi API nào). Kẻ tấn công phải đi qua ít nhất hai tầng để đạt mục tiêu, nên bạn luôn có nhiều hơn một cơ hội.',
        },
        {
          t: 'figure',
          id: 'fig-data-sources',
          caption: 'Bốn tầng dữ liệu và độ phủ của chúng. Vùng chồng lấn là nơi bạn tương quan được sự kiện — cũng là nơi phần lớn phát hiện thật xảy ra.',
        },
        { t: 'h', text: 'Tầng điểm cuối và danh tính', level: 2 },
        {
          t: 'table',
          head: ['Nguồn', 'Chứa gì', 'Khối lượng (bậc độ lớn)', 'Độ trễ', 'Bài toán ML'],
          rows: [
            [
              'Windows Security Log',
              'Đăng nhập, tạo tiến trình, thay đổi quyền, truy cập chia sẻ tệp',
              'Máy trạm: 2.000–20.000 sự kiện/ngày. Domain Controller vài nghìn tài khoản: hàng triệu/ngày',
              'Vài giây tới vài phút (qua WEF/agent)',
              'Phát hiện dò mật khẩu, di chuyển ngang, UEBA',
            ],
            [
              'Sysmon',
              'Tiến trình + hash + dòng lệnh + cha, kết nối mạng, nạp DLL, truy vấn DNS, ghi tệp',
              '50.000–500.000 sự kiện/máy/ngày nếu bật đầy đủ Event ID 3 và 11',
              'Vài giây',
              'Phân loại chuỗi lệnh, phát hiện tiêm tiến trình, LOLBins',
            ],
            [
              'EDR telemetry',
              'Cây tiến trình đầy đủ, thao tác tệp/registry, kết nối, nạp module, đôi khi cả nội dung tham số',
              'Hàng chục tới vài trăm MB/máy/ngày sau nén',
              'Vài giây (dòng phát trực tuyến)',
              'Xếp hạng cảnh báo, phát hiện hành vi, phân loại chuỗi API',
            ],
            [
              'Log xác thực tập trung (Entra ID / Okta / LDAP)',
              'Tài khoản, ứng dụng, IP nguồn, thiết bị, MFA, kết quả',
              'Vài chục nghìn tới vài triệu bản ghi/ngày tuỳ quy mô',
              'Vài phút',
              'Phát hiện chiếm tài khoản, impossible travel, MFA fatigue',
            ],
          ],
          caption: 'Các con số là bậc độ lớn để bạn ước tính hạ tầng — hãy đo lại trên hệ thống của chính mình trước khi mua đĩa.',
        },
        { t: 'h', text: 'Bốn Event ID Windows đáng thuộc lòng', level: 3 },
        {
          t: 'table',
          head: ['Event ID', 'Ý nghĩa', 'Trường quan trọng nhất', 'Dùng để bắt gì'],
          rows: [
            [
              '4624',
              'Đăng nhập thành công',
              'Logon Type (2 = tại máy, 3 = qua mạng, 9 = NewCredentials, 10 = RDP), tài khoản, IP nguồn',
              'Di chuyển ngang, dùng thông tin xác thực bị đánh cắp, RDP bất thường',
            ],
            [
              '4625',
              'Đăng nhập thất bại',
              'Status/Sub-status: 0xC000006A sai mật khẩu, 0xC0000064 tài khoản không tồn tại, 0xC0000234 bị khoá',
              'Dò mật khẩu (brute force) và rải mật khẩu (password spraying)',
            ],
            [
              '4688',
              'Tiến trình mới được tạo',
              'New Process Name, Creator Process Name, và Process Command Line — nếu đã bật',
              'LOLBins, chuỗi lệnh mã độc, tiến trình cha bất thường',
            ],
            [
              '4104',
              'Script block của PowerShell (kênh Microsoft-Windows-PowerShell/Operational)',
              'Toàn bộ nội dung script sau khi giải mã, kể cả phần đã bị làm rối',
              'PowerShell độc hại, tải payload trong bộ nhớ, Empire/Cobalt Strike',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bẫy làm hỏng cả dự án: 4688 không có dòng lệnh',
          md: 'Theo mặc định, sự kiện 4688 **không** ghi tham số dòng lệnh. Bạn phải bật riêng chính sách “Include command line in process creation events”. Rất nhiều đội xây đặc trưng từ dòng lệnh, huấn luyện ngon lành trên dữ liệu phòng lab, rồi triển khai vào môi trường thật mới phát hiện 90% máy trả về trường rỗng. Tương tự với 4104: nếu Script Block Logging chưa bật, bạn chỉ nhận được một phần rất nhỏ. **Luôn kiểm tra tỉ lệ trường rỗng trên dữ liệu thật trước khi thiết kế đặc trưng.**',
        },
        { t: 'h', text: 'Tầng mạng: PCAP, Zeek, NetFlow, DNS, proxy', level: 2 },
        {
          t: 'p',
          md: 'Làm một phép tính để thấy vì sao gần như không ai huấn luyện mô hình trực tiếp trên PCAP. Một đường 1 Gbps chạy trung bình 30% tải sinh ra 37,5 MB/giây, tức khoảng **3,2 TB mỗi ngày**. Giữ 30 ngày là gần 100 TB — cho một đường duy nhất.',
        },
        {
          t: 'p',
          md: 'Zeek đọc cùng luồng gói tin đó và ghi ra các bản ghi tóm tắt: mỗi kết nối một dòng trong `conn.log` (khoảng 200–400 byte), cộng với `dns.log`, `http.log`, `ssl.log`, `files.log`. Trên cùng đường mạng, tổng dung lượng thường rơi vào **vài GB/ngày** — nhỏ hơn khoảng ba bậc độ lớn, mà vẫn giữ lại đúng những trường mà mô hình cần.',
        },
        {
          t: 'compare',
          title: 'Chọn giữa gói tin thô và bản ghi tóm tắt',
          left: {
            title: 'PCAP toàn phần',
            icon: 'package',
            items: [
              'Có đủ payload để phân tích sâu và làm bằng chứng pháp lý',
              'Cho phép trích xuất tệp truyền qua mạng',
              'TB mỗi ngày cho một đường 1 Gbps — chi phí lưu trữ chi phối mọi thứ',
              'Phần lớn lưu lượng đã mã hoá TLS nên payload thường vô dụng',
              'Thường chỉ giữ được vài giờ tới vài ngày',
            ],
          },
          right: {
            title: 'Zeek / NetFlow',
            icon: 'file-text',
            items: [
              'Một dòng cho mỗi kết nối: thời gian, IP, cổng, byte, gói, trạng thái',
              'Zeek có thêm ngữ cảnh tầng ứng dụng: SNI, JA3/JA4, truy vấn DNS, User-Agent',
              'Nhỏ hơn PCAP khoảng 100–1.000 lần → giữ được nhiều tháng',
              'Đã ở dạng bảng, cắm thẳng vào pandas và mô hình cây',
              'Mất payload: không phân tích được nội dung, không trích được tệp',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Chi tiết kỹ thuật hay bị bỏ qua: Zeek ghi log KHI NÀO',
          md: 'Zeek ghi một dòng `conn.log` **khi kết nối kết thúc** (hoặc hết thời gian chờ, mặc định 5 phút không hoạt động với TCP). Nghĩa là một phiên C2 giữ kết nối 6 giờ chỉ xuất hiện trong log sau 6 giờ. Nếu bạn xây mô hình phát hiện thời gian thực dựa trên `conn.log`, độ trễ thật của bạn bằng tuổi thọ kết nối, không phải vài giây. Nhiều đội đo độ trễ trên dữ liệu lịch sử rồi ngạc nhiên khi triển khai.',
        },
        {
          t: 'list',
          items: [
            '**DNS** — nguồn rẻ nhất, giá trị cao nhất. Mỗi máy trạm sinh vài nghìn truy vấn/ngày; mạng 5.000 máy cho khoảng 10–50 triệu truy vấn/ngày. Là dữ liệu chính cho phát hiện DGA, tunneling, và beaconing.',
            '**Proxy / Secure Web Gateway** — URL đầy đủ, User-Agent, mã trạng thái, byte lên/xuống, phân loại tên miền. Khoảng 1.000–5.000 request/người/ngày. Nguồn tốt nhất cho phát hiện tải payload và exfiltration qua HTTP.',
            '**Email gateway** — tiêu đề thư, SPF/DKIM/DMARC, đường dẫn trong thân thư, hash tệp đính kèm. Là nguồn có nhãn tốt nhất trong toàn bộ tổ chức, vì người dùng liên tục bấm nút “báo cáo thư đáng ngờ”.',
            '**Tệp PE và tài liệu** — không phải log mà là đối tượng. Đặc trưng lấy từ header, bảng import, section, entropy, chữ ký số. Chặng 6 sẽ dùng nhiều.',
          ],
        },
        { t: 'h', text: 'Tầng đám mây: CloudTrail và họ hàng', level: 2 },
        {
          t: 'p',
          md: 'AWS CloudTrail ghi lại từng lời gọi API: ai gọi, từ IP nào, với vai trò nào, tham số gì, kết quả ra sao. Đây là nguồn duy nhất cho các bài toán như leo thang đặc quyền IAM, tạo access key bí mật, hay xoá dấu vết. Azure có Entra ID sign-in logs + Activity Log, GCP có Cloud Audit Logs — cấu trúc khác nhau nhưng vai trò giống hệt.',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Hai điều phải biết trước khi thiết kế trên CloudTrail',
          md: '**Độ trễ:** AWS thường giao bản ghi trong khoảng 5 phút, cá biệt tới 15 phút. Mọi phát hiện “thời gian thực” trên CloudTrail đều có sàn độ trễ đó — đừng hứa với sếp con số nhỏ hơn.\n\n**Khối lượng:** management event (tạo/xoá/sửa tài nguyên) là vài chục nghìn tới vài triệu bản ghi/ngày. Nhưng khi bạn bật **data event** cho S3 hoặc Lambda, mỗi lần đọc một object cũng thành một bản ghi — khối lượng có thể nhân lên hàng trăm lần và đây là nguyên nhân số một khiến hoá đơn log nổ tung. Bật có chọn lọc theo bucket, đừng bật toàn tài khoản.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't2l1-cp1',
              kind: 'mcq',
              tags: ['nguon-du-lieu', 'mang'],
              q: 'Bạn cần phát hiện tên miền sinh bởi thuật toán (DGA) trên 20.000 máy, ngân sách lưu trữ hạn chế. Nguồn nào hợp lý nhất?',
              options: [
                'PCAP toàn phần ở biên mạng',
                'Log truy vấn DNS từ resolver nội bộ',
                'Windows Security Log 4688',
                'CloudTrail management events',
              ],
              answer: 1,
              why: 'DGA là bài toán về chuỗi ký tự tên miền. Log DNS chứa chính xác thứ bạn cần, kích thước vài chục byte mỗi bản ghi, và bao phủ mọi máy dùng resolver nội bộ. PCAP cho cùng thông tin nhưng đắt hơn hàng trăm lần; 4688 không chứa tên miền; CloudTrail nói về API đám mây, không liên quan.',
              distractorWhy: [
                'PCAP chứa được truy vấn DNS nhưng bạn trả giá TB/ngày cho thứ mà log DNS cho bạn với vài GB.',
                '',
                '4688 ghi tiến trình được tạo, không ghi tên miền mà tiến trình đó truy vấn (trừ khi dùng Sysmon Event ID 22).',
                'CloudTrail ghi lời gọi API của nhà cung cấp đám mây, hoàn toàn không thấy truy vấn DNS của máy trạm.',
              ],
            },
            {
              id: 't2l1-cp2',
              kind: 'truefalse',
              tags: ['nguon-du-lieu', 'do-tre'],
              q: 'Vì Zeek xử lý gói tin theo thời gian thực nên dòng conn.log của một phiên xuất hiện ngay khi phiên bắt đầu.',
              answer: false,
              why: 'Zeek phân tích gói theo thời gian thực nhưng chỉ **ghi** bản ghi conn khi kết nối kết thúc hoặc hết thời gian chờ. Một kết nối C2 giữ mở 6 giờ chỉ hiện trong conn.log sau 6 giờ. Nếu cần tín hiệu sớm hơn, phải dùng các log tầng ứng dụng của Zeek (dns.log, ssl.log ghi ngay khi có sự kiện) hoặc script Zeek tuỳ biến.',
            },
          ],
        },
        { t: 'h', text: 'Ba trục để đánh giá bất kỳ nguồn nào', level: 2 },
        {
          t: 'steps',
          title: 'Khung đánh giá dùng được cho mọi nguồn dữ liệu',
          steps: [
            {
              title: '1. Độ phủ — nguồn này nhìn thấy bao nhiêu phần trăm bề mặt?',
              md: 'EDR chỉ thấy máy có cài agent. Trong thực tế tỉ lệ cài đặt hiếm khi đạt 100%: máy chủ Linux cũ, thiết bị OT, máy nhà thầu, BYOD thường nằm ngoài. Còn NetFlow ở biên thì thấy mọi thứ đi qua biên nhưng mù hoàn toàn với lưu lượng nội bộ máy-với-máy. **Luôn hỏi: 10% không nhìn thấy được nằm ở đâu, và kẻ tấn công có biết điều đó không?**',
            },
            {
              title: '2. Độ trung thực — dữ liệu có bị kẻ tấn công sửa được không?',
              md: 'Kẻ có quyền quản trị trên máy có thể xoá Windows Event Log (chính hành vi đó sinh sự kiện 1102) hoặc gỡ agent EDR. Log ở tầng mạng và log đám mây phía nhà cung cấp khó sửa hơn nhiều vì nằm ngoài tầm với của máy đã bị chiếm. Đây là lý do các phát hiện quan trọng nên dựa vào ít nhất một nguồn nằm ngoài máy nạn nhân.',
            },
            {
              title: '3. Chi phí và độ trễ — bạn trả bao nhiêu cho mỗi giây tiết kiệm được?',
              md: 'Chi phí không chỉ là ổ đĩa. Nó gồm băng thông đẩy log, giấy phép SIEM tính theo GB nạp vào, và thời gian của kỹ sư duy trì parser khi nhà cung cấp đổi định dạng. Một quy tắc thực dụng: **giữ dữ liệu chi tiết trong thời gian ngắn, dữ liệu tóm tắt trong thời gian dài** — ví dụ PCAP 48 giờ, Zeek 12 tháng.',
            },
          ],
        },
        {
          t: 'checklist',
          title: 'Trước khi cam kết một nguồn dữ liệu cho dự án ML',
          items: [
            'Lấy 7 ngày dữ liệu thật và đếm số bản ghi/ngày — đừng tin tài liệu của nhà cung cấp.',
            'Đếm tỉ lệ trường rỗng cho mọi trường bạn định dùng làm đặc trưng.',
            'Đo độ trễ thật: lấy trung vị của (thời điểm nạp vào SIEM − thời điểm sự kiện xảy ra).',
            'Kiểm tra độ phủ: bao nhiêu phần trăm tài sản thật sự có gửi log về?',
            'Hỏi ai đó đã đổi định dạng log này lần gần nhất khi nào, và có báo trước không.',
            'Ước lượng chi phí 12 tháng lưu trữ trước khi viết dòng code đầu tiên.',
          ],
        },
        { t: 'terms', ids: ['telemetry', 'netflow', 'zeek', 'pcap', 'edr', 'sysmon', 'cloudtrail', 'siem'] },
      ],
      keyTakeaways: [
        'Bốn tầng dữ liệu: điểm cuối, danh tính, mạng, ứng dụng/đám mây. Phát hiện tốt gần như luôn ghép từ hai tầng trở lên.',
        'Bốn Event ID Windows cốt lõi: 4624 (đăng nhập thành công, xem Logon Type), 4625 (thất bại), 4688 (tạo tiến trình), 4104 (script block PowerShell).',
        '4688 mặc định KHÔNG có dòng lệnh và 4104 cần bật Script Block Logging — luôn kiểm tra tỉ lệ trường rỗng trên dữ liệu thật.',
        'Zeek nhỏ hơn PCAP khoảng 100–1.000 lần và giữ lại phần lớn tín hiệu mà mô hình cần; PCAP dành cho điều tra sâu, không dành cho huấn luyện.',
        'Đánh giá mọi nguồn theo ba trục: độ phủ, độ trung thực (kẻ tấn công sửa được không), chi phí và độ trễ.',
      ],
      cards: [
        {
          id: 't2l1-c1',
          front: 'Event ID 4624 với Logon Type 10 nghĩa là gì, và vì sao nó quan trọng?',
          back: 'Đăng nhập thành công qua RDP (RemoteInteractive). Quan trọng vì RDP là kênh di chuyển ngang phổ biến nhất bằng thông tin xác thực bị đánh cắp.',
          tags: ['windows-log', 'lateral-movement'],
        },
        {
          id: 't2l1-c2',
          front: 'Vì sao Event ID 4688 thường vô dụng cho ML nếu không cấu hình thêm?',
          back: 'Vì mặc định 4688 không ghi tham số dòng lệnh; phải bật riêng chính sách “Include command line in process creation events”.',
          tags: ['windows-log', 'bay-thuong-gap'],
        },
        {
          id: 't2l1-c3',
          front: 'Zeek tiết kiệm dung lượng so với PCAP khoảng bao nhiêu lần, và đánh đổi là gì?',
          back: 'Khoảng 100–1.000 lần. Đánh đổi: mất payload nên không phân tích được nội dung và không trích xuất được tệp truyền qua mạng.',
          tags: ['mang', 'zeek'],
        },
        {
          id: 't2l1-c4',
          front: 'Nêu ba trục để đánh giá một nguồn dữ liệu bảo mật.',
          back: 'Độ phủ (thấy bao nhiêu phần trăm bề mặt), độ trung thực (kẻ tấn công có sửa được không), chi phí và độ trễ.',
          tags: ['nguon-du-lieu'],
        },
        {
          id: 't2l1-c5',
          front: 'Vì sao bật CloudTrail data event cho S3 lại nguy hiểm về chi phí?',
          back: 'Vì mỗi lần đọc/ghi một object thành một bản ghi, khối lượng có thể nhân lên hàng trăm lần so với management event.',
          tags: ['cloud', 'chi-phi'],
        },
      ],
      quiz: [
        {
          id: 't2l1-q1',
          kind: 'match',
          tags: ['nguon-du-lieu'],
          q: 'Nối bài toán phát hiện với nguồn dữ liệu phù hợp nhất.',
          pairs: [
            ['Rải mật khẩu (password spraying)', 'Windows 4625 hoặc log đăng nhập Entra ID'],
            ['Beaconing tới máy chủ C2', 'Zeek conn.log hoặc NetFlow'],
            ['PowerShell tải payload trong bộ nhớ', 'Event ID 4104 script block'],
            ['Tạo access key IAM bí mật', 'AWS CloudTrail management events'],
          ],
          why: 'Mỗi hành vi để lại dấu ở một tầng cụ thể. Bước suy luận đầu tiên khi nhận bài toán mới luôn là: hành vi này bắt buộc phải chạm vào hệ thống nào, và hệ thống đó ghi log gì? Nếu không trả lời được, bạn chưa sẵn sàng chọn thuật toán.',
        },
        {
          id: 't2l1-q2',
          kind: 'mcq',
          tags: ['do-phu', 'nguon-du-lieu'],
          q: 'Đội bạn có EDR cài trên 92% máy trạm Windows. Rủi ro lớn nhất khi xây mô hình chỉ dựa trên EDR là gì?',
          options: [
            'EDR sinh quá nhiều dữ liệu nên mô hình sẽ chậm',
            '8% còn lại thường là máy chủ Linux, thiết bị OT và máy nhà thầu — đúng những nơi kẻ tấn công thích trú',
            'EDR có độ trễ quá cao cho phát hiện thời gian thực',
            'EDR không ghi được kết nối mạng',
          ],
          answer: 1,
          why: 'Điểm mù không phân bố ngẫu nhiên. 8% máy không có agent gần như luôn là các hệ thống cũ, thiết bị đặc thù hoặc thiết bị ngoài tầm quản lý — và kẻ tấn công có kinh nghiệm chủ động tìm chúng. Một mô hình chỉ nhìn qua EDR sẽ báo “sạch” cho toàn bộ vùng tối đó, tạo cảm giác an toàn sai lệch.',
          distractorWhy: [
            'Khối lượng là vấn đề kỹ thuật giải được bằng lấy mẫu và tổng hợp, không phải rủi ro lớn nhất.',
            '',
            'EDR chính là một trong những nguồn có độ trễ thấp nhất, thường tính bằng giây.',
            'Hầu hết EDR hiện đại đều ghi kết nối mạng ở mức tiến trình.',
          ],
        },
        {
          id: 't2l1-q3',
          kind: 'input',
          tags: ['mang', 'tinh-toan'],
          q: 'Một đường 1 Gbps chạy trung bình 30% tải. PCAP toàn phần sinh ra khoảng bao nhiêu TB mỗi ngày? (làm tròn tới 0,1)',
          accept: ['3,2', '3.2', '3,2 tb', '3.2 tb', '3,24', '3.24'],
          placeholder: 'Ví dụ: 1,5',
          hint: '1 Gbps = 1.000.000.000 bit/giây. Chia 8 ra byte, nhân 0,3, nhân 86.400 giây.',
          why: '1e9 bit/s ÷ 8 = 125 MB/s; × 0,3 = 37,5 MB/s; × 86.400 giây ≈ 3,24 TB/ngày. Phép tính này đáng làm một lần trong đời vì nó giải thích toàn bộ ngành kiến trúc dữ liệu bảo mật: không ai lưu PCAP dài hạn, nên mọi mô hình mạng thực dụng đều chạy trên bản ghi tóm tắt như Zeek hoặc NetFlow.',
        },
        {
          id: 't2l1-q4',
          kind: 'multi',
          tags: ['do-trung-thuc'],
          q: 'Nguồn nào KHÓ bị kẻ tấn công đã chiếm quyền quản trị trên máy nạn nhân xoá hoặc sửa? (Chọn tất cả)',
          options: [
            'Windows Event Log lưu tại chính máy đó',
            'Zeek conn.log ghi ở cảm biến mạng biên',
            'AWS CloudTrail lưu tại tài khoản log tách biệt',
            'Log EDR chưa kịp gửi lên máy chủ quản lý',
          ],
          answers: [1, 2],
          why: 'Nguyên tắc: log nằm ngoài tầm với của máy bị chiếm thì đáng tin hơn. Kẻ có quyền quản trị xoá được Event Log cục bộ (để lại sự kiện 1102) và có thể gỡ hoặc chặn agent EDR trước khi dữ liệu kịp rời máy. Cảm biến mạng và log của nhà cung cấp đám mây trong tài khoản tách biệt nằm ngoài phạm vi kiểm soát của họ — đó là lý do kiến trúc log tốt luôn tách tài khoản lưu log khỏi tài khoản vận hành.',
        },
      ],
      terms: ['telemetry', 'netflow', 'zeek', 'pcap', 'edr', 'sysmon', 'cloudtrail', 'siem'],
      further: [
        {
          title: 'MITRE ATT&CK — mục Data Sources và Data Components',
          note: 'Với mỗi kỹ thuật tấn công, ATT&CK liệt kê thẳng nguồn dữ liệu cần có để phát hiện. Dùng nó như bảng tra cứu ngược từ mối đe doạ về nguồn log.',
        },
        {
          title: 'Zeek Documentation — Log Files',
          note: 'Danh sách đầy đủ các trường của conn.log, dns.log, ssl.log. Đọc một lần trước khi thiết kế đặc trưng mạng.',
        },
        {
          title: 'OSSEM — Open Source Security Events Metadata',
          note: 'Từ điển trường của các sự kiện Windows/Sysmon. Cứu bạn khỏi việc đoán mò ý nghĩa của một trường lạ.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't2-l2',
      trackId: 'du-lieu',
      title: 'Python và pandas cho dữ liệu bảo mật',
      subtitle: 'Đủ để làm việc thật: đọc log, gộp theo thời gian, ghép threat intel',
      minutes: 26,
      practiceMinutes: 3,
      level: 'co-ban',
      prereqs: ['t2-l1'],
      why: {
        short:
          'pandas là ngôn ngữ chung giữa người làm bảo mật và người làm ML — không biết nó, bạn phải nhờ người khác trả lời mọi câu hỏi về dữ liệu của chính mình.',
        scenario:
          'Bạn nghi ngờ có chiến dịch rải mật khẩu trong tháng trước. SIEM trả về 4,2 triệu sự kiện 4625 dạng CSV. Bạn cần biết IP nào đánh trượt nhiều tài khoản khác nhau nhất trong từng cửa sổ 10 phút — trong hôm nay, không phải tuần sau.',
        roles: ['SOC Analyst', 'Detection Engineer', 'Threat Hunter', 'Security Data Scientist'],
        costOfNotKnowing:
          'Bạn bị kẹt ở giao diện tìm kiếm của SIEM, không tự kiểm chứng được giả thuyết, và mọi câu hỏi hơi lệch chuẩn đều phải xếp hàng chờ đội dữ liệu.',
      },
      objectives: [
        'Đọc được log ở bốn định dạng phổ biến với kiểu dữ liệu đúng ngay từ đầu',
        'Tổng hợp sự kiện theo thực thể và theo cửa sổ thời gian bằng groupby và resample',
        'Ghép log với danh sách IOC và kiểm soát chất lượng phép ghép',
        'Chọn được công cụ phù hợp khi dữ liệu vượt quá RAM',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Bài này không dạy Python từ đầu. Nó dạy đúng tập thao tác mà bạn dùng đi dùng lại trong công việc phân tích dữ liệu bảo mật — khoảng tám hàm, chiếm chừng 80% khối lượng công việc thật.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao pandas chứ không phải SQL trong SIEM',
          md: 'SIEM tuyệt vời cho câu hỏi bạn đã biết trước. pandas tuyệt vời cho câu hỏi bạn vừa nghĩ ra trong lúc điều tra. Khác biệt cốt lõi: trong pandas bạn giữ được **trạng thái trung gian** — lọc, thêm cột, quay lại, so sánh hai phiên bản — thứ mà ô tìm kiếm không cho phép. Ngoài ra, mọi thư viện ML đều nhận DataFrame làm đầu vào, nên đây cũng là cầu nối duy nhất giữa dữ liệu và mô hình.',
        },
        { t: 'h', text: 'Bước 1 — Đọc dữ liệu đúng kiểu ngay từ đầu', level: 2 },
        {
          t: 'code',
          lang: 'python',
          caption: 'Nạp log với kiểu dữ liệu được ép sẵn — thói quen tiết kiệm RAM và tránh lỗi âm thầm',
          code:
            "import pandas as pd\n" +
            "\n" +
            "# 1) JSON Lines: mỗi dòng một sự kiện. Zeek chế độ json, EDR export, kết quả Sigma.\n" +
            "conn = pd.read_json('conn.jsonl', lines=True)\n" +
            "\n" +
            "# 2) CSV lớn: ép kiểu ngay lúc đọc. Để pandas tự đoán là cách nhanh nhất biến\n" +
            "#    cột dst_port thành float64 và ăn gấp nhiều lần RAM cần thiết.\n" +
            "dtypes = {\n" +
            "    'src_ip': 'string',\n" +
            "    'dst_ip': 'string',\n" +
            "    'dst_port': 'int32',\n" +
            "    'user': 'category',      # ít giá trị lặp lại nhiều -> category tiết kiệm rất mạnh\n" +
            "    'event_id': 'int16',\n" +
            "}\n" +
            "win = pd.read_csv('winlog.csv', dtype=dtypes, usecols=list(dtypes) + ['ts'])\n" +
            "\n" +
            "# 3) Thời gian: ép về UTC ngay. errors='coerce' biến dòng hỏng thành NaT thay vì nổ.\n" +
            "win['ts'] = pd.to_datetime(win['ts'], utc=True, errors='coerce')\n" +
            "print('Tỉ lệ timestamp hỏng:', win['ts'].isna().mean())\n" +
            "print(win.dtypes)\n",
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Ba lỗi im lặng khi đọc log',
          md: '**(1)** Cột chứa cả số và chuỗi bị pandas suy ra thành `object`, và mọi phép so sánh sau đó cho kết quả sai mà không báo lỗi.\n\n**(2)** ID có số 0 đứng đầu (một số mã sự kiện, số hiệu tài sản) bị đọc thành số nguyên và mất luôn số 0 — sau đó không ghép được với bảng tham chiếu.\n\n**(3)** Timestamp không có múi giờ được giữ nguyên dạng chuỗi, rồi bạn sắp xếp theo thứ tự chữ cái và tưởng đó là thứ tự thời gian. **Luôn in `df.dtypes` sau khi đọc.**',
        },
        { t: 'h', text: 'Bước 2 — Ba thao tác tổng hợp chiếm phần lớn công việc', level: 2 },
        {
          t: 'figure',
          id: 'fig-pandas-three',
          caption:
            'Ba thao tác này chiếm phần lớn thời gian làm việc với log, và mỗi cái có một cách sai âm thầm riêng: đếm trên thực thể chưa hợp nhất, chọn cửa sổ không theo hành vi kẻ tấn công, và ghép threat intel mà bỏ chiều thời gian.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'value_counts, groupby, resample — bộ ba dùng hằng ngày',
          code:
            "# A) value_counts: phân bố của một cột. Câu hỏi đầu tiên với mọi dữ liệu lạ.\n" +
            "ps = win[win['proc'].str.endswith('powershell.exe', na=False)]\n" +
            "print(ps['parent'].value_counts().head(10))          # 10 tiến trình cha hay gặp nhất\n" +
            "print(ps['parent'].value_counts(normalize=True).head(5))  # dạng tỉ lệ, so sánh được giữa các máy\n" +
            "\n" +
            "# B) groupby + agg: tóm tắt theo thực thể\n" +
            "per_host = win.groupby('host').agg(\n" +
            "    n_events=('event_id', 'size'),\n" +
            "    n_users=('user', 'nunique'),\n" +
            "    first_seen=('ts', 'min'),\n" +
            "    last_seen=('ts', 'max'),\n" +
            ")\n" +
            "print(per_host.sort_values('n_users', ascending=False).head())\n" +
            "\n" +
            "# C) resample: gộp theo cửa sổ thời gian (cần index là thời gian)\n" +
            "per_hour = win.set_index('ts').resample('1h').size().rename('events')\n" +
            "# Đường cơ sở động: trung vị 7 ngày gần nhất, bỏ qua khi chưa đủ 24 điểm\n" +
            "baseline = per_hour.rolling(24 * 7, min_periods=24).median()\n" +
            "spike = per_hour[per_hour > 3 * baseline]\n" +
            "print(spike.tail(10))\n",
        },
        {
          t: 'table',
          head: ['Hàm', 'Đếm cái gì', 'Câu hỏi bảo mật nó trả lời', 'Sai lầm khi dùng nhầm'],
          rows: [
            ['size', 'Tổng số dòng trong nhóm, kể cả dòng rỗng', 'Nguồn này ồn ào tới mức nào?', 'Một máy tải tệp lớn qua 500 phiên trông giống hệt một máy đang quét 500 cổng'],
            ['count', 'Số dòng có giá trị khác rỗng ở cột được chọn', 'Trường này được ghi đầy đủ đến đâu?', 'Bị nhầm là size, và chênh lệch giữa hai con số chính là tỉ lệ dữ liệu thiếu bạn đang bỏ qua'],
            ['nunique', 'Số giá trị KHÁC NHAU', 'Nguồn này chạm tới bao nhiêu thực thể riêng biệt?', 'Cho con số phóng đại nếu thực thể chưa được chuẩn hoá trước'],
            ['value_counts', 'Tần suất của từng giá trị, đã sắp xếp giảm dần', 'Cái gì bình thường ở đây, và cái gì chỉ xuất hiện một lần?', 'Bỏ mất chiều thực thể nếu chạy trên toàn bộ dữ liệu thay vì trong từng nhóm'],
          ],
          caption: 'Cả bốn hàm đều chạy trơn tru và không báo lỗi — chúng chỉ trả về những con số khác nhau. Đây là nguồn sai số âm thầm phổ biến nhất khi phân tích log.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Chi tiết phiên bản đáng nhớ',
          md: 'Từ pandas 2.2, các bí danh tần suất viết hoa như `1T` (phút) và `1H` (giờ) đã bị đánh dấu lỗi thời; hãy dùng `1min` và `1h`. Nếu bạn đọc code cũ trên mạng và gặp cảnh báo `FutureWarning`, đó là lý do. Đổi ngay thay vì tắt cảnh báo — code tắt cảnh báo là code sẽ hỏng ở lần nâng cấp sau.',
        },
        {
          t: 'predict',
          question:
            'Bạn muốn tìm hành vi rải mật khẩu: một IP thử một mật khẩu phổ biến lên rất nhiều tài khoản khác nhau. Nếu bạn chỉ đếm **số lần đăng nhập thất bại** theo IP, vì sao cách đó bỏ sót gần hết các chiến dịch rải mật khẩu thật?',
          reveal:
            'Vì kẻ rải mật khẩu cố tình giữ số lần thử trên **mỗi tài khoản** ở mức thấp (thường 1–3 lần trong một chu kỳ khoá tài khoản) để không kích hoạt chính sách khoá. Tổng số lần thất bại từ một IP có thể chỉ tương đương một nhân viên hay quên mật khẩu. Tín hiệu thật nằm ở **số tài khoản KHÁC NHAU bị thử**, không phải số lần thử. Đây là ví dụ điển hình cho việc chọn hàm tổng hợp đúng quan trọng hơn chọn thuật toán: `nunique` bắt được thứ mà `count` không bao giờ thấy.',
        },
        {
          t: 'steps',
          title: 'Ví dụ mẫu — phát hiện rải mật khẩu trong 5 bước',
          steps: [
            {
              title: '1. Thu hẹp về đúng sự kiện cần nhìn',
              md: 'Chỉ lấy Event ID 4625 (đăng nhập thất bại). Nếu có trường sub-status, giữ riêng `0xC000006A` (sai mật khẩu) và loại `0xC0000064` (tài khoản không tồn tại) — hai loại này kể hai câu chuyện khác nhau: một là rải mật khẩu, một là dò tên tài khoản.',
            },
            {
              title: '2. Chuẩn hoá tên tài khoản trước khi đếm',
              md: 'Nếu không đưa về chữ thường và cắt khoảng trắng, `Nguyen.A`, `nguyen.a` và `NGUYEN.A ` bị đếm thành ba tài khoản khác nhau, và `nunique` phóng đại lên gấp ba. Bước một dòng này quyết định con số cuối cùng đúng hay sai.',
            },
            {
              title: '3. Chọn hàm tổng hợp theo giả thuyết, không theo thói quen',
              md: 'Giả thuyết là “một nguồn thử nhiều tài khoản”. Vậy đại lượng cần đo là số tài khoản duy nhất trên mỗi IP: `nunique`, không phải `size`.',
            },
            {
              title: '4. Chọn cửa sổ thời gian theo hành vi của kẻ tấn công',
              md: 'Cửa sổ 10 phút bắt được đợt rải nhanh. Kẻ tấn công kiên nhẫn rải trong 12 giờ sẽ trốn khỏi cửa sổ đó — nên thực tế bạn chạy nhiều cửa sổ (10 phút, 1 giờ, 24 giờ) và so sánh. Cửa sổ là một siêu tham số, hãy đối xử với nó như vậy.',
            },
            {
              title: '5. Đặt ngưỡng dựa trên phân bố, không dựa trên cảm giác',
              md: 'Trước khi chốt “15 tài khoản”, hãy nhìn phân bố của chỉ số này trên 30 ngày dữ liệu bình thường. Nếu phân vị 99,9% của các IP lành tính đã là 12, ngưỡng 15 sẽ cho bạn vài cảnh báo mỗi ngày. Nếu phân vị đó là 3, ngưỡng 15 là quá lỏng.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Cài đặt trọn vẹn của ví dụ trên',
          code:
            "fail = win[win['event_id'] == 4625].copy()\n" +
            "\n" +
            "# Chuẩn hoá tài khoản: bỏ khoảng trắng, về chữ thường, cắt tiền tố miền DOMAIN\\\\user\n" +
            "fail['user'] = (fail['user'].astype('string')\n" +
            "                            .str.strip()\n" +
            "                            .str.lower()\n" +
            "                            .str.rsplit('\\\\', n=1).str[-1])\n" +
            "\n" +
            "# Số TÀI KHOẢN KHÁC NHAU mà mỗi IP đánh trượt, trong từng cửa sổ 10 phút\n" +
            "spray = (fail.set_index('ts')\n" +
            "             .groupby('src_ip')['user']\n" +
            "             .resample('10min')\n" +
            "             .nunique()\n" +
            "             .rename('n_users')\n" +
            "             .reset_index())\n" +
            "\n" +
            "# Nhìn phân bố TRƯỚC khi đặt ngưỡng\n" +
            "print(spray['n_users'].quantile([0.5, 0.99, 0.999]))\n" +
            "\n" +
            "nghi_ngo = spray[spray['n_users'] >= 15].sort_values('n_users', ascending=False)\n" +
            "print(nghi_ngo.head(20))\n",
        },
        { t: 'h', text: 'Bước 3 — Ghép với threat intel', level: 2 },
        {
          t: 'code',
          lang: 'python',
          caption: 'merge có kiểm soát: validate và indicator là hai tham số cứu mạng',
          code:
            "ioc = pd.read_csv('ioc_ip.csv')      # cột: indicator, source, first_seen, confidence\n" +
            "ioc['indicator'] = ioc['indicator'].astype('string').str.strip()\n" +
            "conn['dst_ip'] = conn['dst_ip'].astype('string').str.strip()\n" +
            "\n" +
            "hits = conn.merge(\n" +
            "    ioc,\n" +
            "    how='left',\n" +
            "    left_on='dst_ip',\n" +
            "    right_on='indicator',\n" +
            "    validate='m:1',   # nổ lỗi ngay nếu danh sách IOC có indicator trùng lặp\n" +
            "    indicator=True,   # thêm cột _merge: both / left_only\n" +
            ")\n" +
            "\n" +
            "matched = hits[hits['_merge'] == 'both']\n" +
            "print('Số kết nối khớp IOC:', len(matched))\n" +
            "print(matched.groupby('source').size().sort_values(ascending=False))\n" +
            "\n" +
            "# Kiểm tra tỉnh táo: nếu tỉ lệ khớp vượt vài phần nghìn, gần như chắc chắn\n" +
            "# danh sách IOC của bạn chứa hạ tầng dùng chung (CDN, cloud, DNS công cộng).\n" +
            "print('Tỉ lệ khớp:', len(matched) / len(conn))\n",
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'IOC dùng chung: nguồn báo động giả kinh điển',
          md: 'Rất nhiều feed IOC miễn phí chứa địa chỉ IP của CDN, dịch vụ đám mây, hoặc DNS công cộng (ví dụ `8.8.8.8` từng xuất hiện trong feed vì một mẫu mã độc dùng nó để kiểm tra kết nối). Ghép thẳng vào log sẽ cho hàng nghìn “phát hiện”. Trước khi tin bất kỳ feed nào: **lọc bỏ IP thuộc dải của nhà cung cấp lớn, đặt hạn dùng cho mỗi IOC (thường 30–90 ngày), và luôn xem xác suất khớp ngẫu nhiên**.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't2l2-cp1',
              kind: 'mcq',
              tags: ['pandas', 'tong-hop'],
              q: 'Bạn muốn tìm máy trạm bỗng kết nối tới nhiều cổng khác nhau trên cùng một máy chủ (dấu hiệu quét cổng nội bộ). Biểu thức nào đúng?',
              options: [
                "conn.groupby('src_ip')['dst_port'].count()",
                "conn.groupby(['src_ip', 'dst_ip'])['dst_port'].nunique()",
                "conn.groupby('dst_port')['src_ip'].size()",
                "conn['dst_port'].value_counts()",
              ],
              answer: 1,
              why: 'Giả thuyết là “một nguồn chạm nhiều cổng KHÁC NHAU trên MỘT đích”. Vậy phải nhóm theo cặp (nguồn, đích) rồi đếm số cổng duy nhất. Phương án đầu đếm tổng số kết nối nên một máy tải file lớn qua nhiều phiên cũng bị báo. Hai phương án cuối tổng hợp sai chiều: chúng trả lời “cổng nào phổ biến nhất”, không liên quan tới hành vi quét.',
              distractorWhy: [
                'count đếm số kết nối, không phân biệt 500 kết nối tới cùng một cổng với 500 cổng khác nhau.',
                '',
                'Nhóm theo cổng rồi đếm nguồn trả lời câu hỏi ngược lại: cổng nào bị nhiều máy chạm.',
                'value_counts trên toàn bộ dữ liệu bỏ mất chiều thực thể, không nói được máy nào đang quét.',
              ],
            },
            {
              id: 't2l2-cp2',
              kind: 'truefalse',
              tags: ['pandas', 'chat-luong-du-lieu'],
              q: 'Sau khi merge log với danh sách IOC bằng how=left, số dòng của kết quả luôn bằng số dòng của log gốc.',
              answer: false,
              why: 'Chỉ đúng khi khoá bên phải là duy nhất. Nếu danh sách IOC chứa cùng một IP hai lần (rất hay gặp khi gộp nhiều feed), mỗi dòng log khớp sẽ **nhân đôi**. Đây là lỗi âm thầm nguy hiểm: mọi thống kê sau đó bị thổi phồng mà không có cảnh báo nào. Tham số `validate=m:1` tồn tại chính vì lý do đó — nó buộc pandas nổ lỗi thay vì im lặng nhân bản dữ liệu.',
            },
          ],
        },
        { t: 'h', text: 'Khi dữ liệu không vừa RAM', level: 2 },
        {
          t: 'p',
          md: 'Ngưỡng thực dụng: pandas thoải mái tới vài triệu dòng, bắt đầu khó chịu ở vài chục triệu, và không nên dùng ở hàng trăm triệu. Bốn lối thoát, xếp theo công sức bỏ ra.',
        },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Đổi định dạng sang Parquet.** Nén theo cột, giữ nguyên kiểu dữ liệu, đọc nhanh hơn CSV nhiều lần và thường nhỏ hơn 5–10 lần. Đây là việc rẻ nhất và nên làm trước tiên.',
            '**Đọc theo khối** với `chunksize` rồi tổng hợp dần. Phù hợp khi phép tính của bạn cộng dồn được (đếm, tổng, min/max).',
            '**DuckDB.** Chạy SQL thẳng trên tệp Parquet, không cần nạp hết vào RAM, và trả về DataFrame khi xong. Thường là bước nhảy hiệu quả nhất cho dữ liệu bảo mật.',
            '**Polars ở chế độ lazy.** Cú pháp gần pandas, thực thi song song, tối ưu kế hoạch truy vấn trước khi chạy. Đáng học nếu bạn xử lý hàng trăm triệu dòng thường xuyên.',
          ],
        },
        {
          t: 'code',
          lang: 'python',
          collapsed: true,
          caption: 'Cùng một câu hỏi, hai công cụ cho dữ liệu lớn',
          code:
            "import duckdb\n" +
            "\n" +
            "sql = '''\n" +
            "SELECT src_ip, count(DISTINCT user) AS n_users\n" +
            "FROM read_parquet('logs/win/*.parquet')\n" +
            "WHERE event_id = 4625\n" +
            "GROUP BY src_ip\n" +
            "HAVING n_users >= 15\n" +
            "ORDER BY n_users DESC\n" +
            "'''\n" +
            "spray = duckdb.sql(sql).df()      # trả về DataFrame quen thuộc\n" +
            "\n" +
            "# --- Cách khác: Polars lazy, không nạp hết vào RAM ---\n" +
            "import polars as pl\n" +
            "\n" +
            "spray2 = (pl.scan_parquet('logs/win/*.parquet')\n" +
            "            .filter(pl.col('event_id') == 4625)\n" +
            "            .group_by('src_ip')\n" +
            "            .agg(pl.col('user').n_unique().alias('n_users'))\n" +
            "            .filter(pl.col('n_users') >= 15)\n" +
            "            .sort('n_users', descending=True)\n" +
            "            .collect())\n",
        },
        {
          t: 'checklist',
          title: 'Thói quen của người phân tích dữ liệu bảo mật cẩn thận',
          items: [
            'In `df.shape` và `df.dtypes` ngay sau khi đọc, mỗi lần.',
            'Đếm tỉ lệ giá trị thiếu cho mọi cột sẽ dùng làm đặc trưng.',
            'Ép mọi timestamp về UTC ở dòng code đầu tiên chạm vào thời gian.',
            'Dùng `validate` trong mọi phép merge — mặc định im lặng là mặc định nguy hiểm.',
            'Nhìn phân bố (quantile) trước khi đặt bất kỳ ngưỡng nào.',
            'Kiểm tra tỉnh táo: kết quả có hợp lý về bậc độ lớn không? 3 triệu cảnh báo/ngày là dấu hiệu bạn đã sai ở đâu đó.',
          ],
        },
        { t: 'terms', ids: ['pandas', 'dataframe', 'groupby', 'resample', 'threat-intel', 'ioc', 'parquet'] },
      ],
      keyTakeaways: [
        'Ép kiểu dữ liệu ngay lúc đọc và in `dtypes` — ba lỗi log phổ biến nhất đều là lỗi kiểu im lặng.',
        'Chọn hàm tổng hợp theo giả thuyết: `nunique` bắt rải mật khẩu, `count` thì không.',
        'Cửa sổ thời gian là siêu tham số; chạy nhiều cửa sổ và so sánh thay vì chọn một con số theo cảm tính.',
        'Luôn dùng `validate` khi merge với threat intel; IOC trùng lặp âm thầm nhân bản dữ liệu của bạn.',
        'Tỉ lệ khớp IOC cao bất thường gần như luôn nghĩa là feed chứa hạ tầng dùng chung, không phải bạn bị tấn công diện rộng.',
        'Hết RAM thì đi theo thứ tự: Parquet → chunksize → DuckDB → Polars.',
      ],
      cards: [
        {
          id: 't2l2-c1',
          front: 'Vì sao đếm số lần đăng nhập thất bại theo IP bỏ sót chiến dịch rải mật khẩu?',
          back: 'Vì kẻ tấn công giữ số lần thử mỗi tài khoản rất thấp để tránh khoá tài khoản. Tín hiệu nằm ở số tài khoản KHÁC NHAU bị thử (nunique), không phải tổng số lần thử.',
          tags: ['pandas', 'phat-hien'],
        },
        {
          id: 't2l2-c2',
          front: 'Tham số nào của pandas.merge ngăn việc dữ liệu bị nhân bản âm thầm, và nó làm gì?',
          back: '`validate` (ví dụ `validate=m:1`). Nó buộc pandas nổ lỗi nếu quan hệ khoá không đúng như bạn tuyên bố, thay vì im lặng nhân dòng.',
          tags: ['pandas', 'chat-luong-du-lieu'],
        },
        {
          id: 't2l2-c3',
          front: 'Từ pandas 2.2, viết cửa sổ 10 phút và 1 giờ trong resample thế nào cho đúng?',
          back: "`resample('10min')` và `resample('1h')`. Các bí danh viết hoa 10T và 1H đã lỗi thời.",
          tags: ['pandas'],
        },
        {
          id: 't2l2-c4',
          front: 'Bạn ghép log với feed IOC và thấy 4% kết nối khớp. Phản ứng đúng là gì?',
          back: 'Nghi ngờ feed trước khi nghi ngờ mạng: tỉ lệ đó gần như luôn do IOC chứa IP hạ tầng dùng chung như CDN, cloud hoặc DNS công cộng.',
          tags: ['threat-intel', 'bao-dong-gia'],
        },
        {
          id: 't2l2-c5',
          front: 'Bốn lối thoát khi dữ liệu vượt RAM, theo thứ tự công sức tăng dần?',
          back: 'Chuyển sang Parquet → đọc theo chunksize → dùng DuckDB trên Parquet → dùng Polars lazy.',
          tags: ['pandas', 'du-lieu-lon'],
        },
      ],
      quiz: [
        {
          id: 't2l2-q1',
          kind: 'mcq',
          tags: ['pandas', 'thoi-gian'],
          q: 'Log của bạn có cột thời gian dạng chuỗi ISO 8601 kèm offset khác nhau tuỳ chi nhánh. Cách xử lý đúng?',
          options: [
            "pd.to_datetime(df['ts']) rồi giữ nguyên",
            "pd.to_datetime(df['ts'], utc=True) để mọi thứ về cùng một trục thời gian",
            'Cắt bỏ phần offset rồi ép sang datetime cho gọn',
            'Sắp xếp trực tiếp trên chuỗi vì ISO 8601 vốn đã sắp xếp được',
          ],
          answer: 1,
          why: 'Với offset hỗn hợp, `to_datetime` không có `utc=True` sẽ trả về cột kiểu object chứa các Timestamp lệch múi giờ nhau — mọi phép so sánh, resample, join theo thời gian sau đó đều sai lệch. `utc=True` quy tất cả về một trục chung. Cắt bỏ offset là hành động phá dữ liệu: bạn vứt đi thông tin không khôi phục được. Sắp xếp chuỗi chỉ đúng khi mọi bản ghi cùng offset và cùng độ dài định dạng — điều hiếm khi xảy ra trong log thật.',
          distractorWhy: [
            'Không có utc=True, pandas trả về cột object với các Timestamp mang offset khác nhau, và mọi thao tác thời gian sau đó cho kết quả sai.',
            '',
            'Cắt offset là phá huỷ thông tin: hai sự kiện cách nhau 7 giờ thật sẽ thành cùng thời điểm.',
            'Chỉ đúng nếu định dạng hoàn toàn đồng nhất; log thật gần như không bao giờ như vậy.',
          ],
        },
        {
          id: 't2l2-q2',
          kind: 'order',
          tags: ['pandas', 'quy-trinh'],
          q: 'Sắp xếp đúng thứ tự các bước phân tích một tệp log lạ mới nhận.',
          items: [
            'Đọc một phần nhỏ và in shape, dtypes, vài dòng mẫu',
            'Ép timestamp về UTC và kiểm tra tỉ lệ hỏng',
            'Chuẩn hoá các trường thực thể (user, host, IP)',
            'Tổng hợp theo thực thể và cửa sổ thời gian',
            'Nhìn phân bố kết quả rồi mới đặt ngưỡng',
          ],
          why: 'Thứ tự này không tuỳ tiện: mỗi bước sau chỉ đúng nếu bước trước đã đúng. Chuẩn hoá thực thể trước khi tổng hợp, vì `nunique` trên dữ liệu chưa chuẩn hoá cho con số phóng đại. Và đặt ngưỡng sau cùng, vì ngưỡng chỉ có ý nghĩa khi bạn đã biết phân bố thật.',
        },
        {
          id: 't2l2-q3',
          kind: 'input',
          tags: ['pandas'],
          q: 'Bạn cần đếm số tài khoản duy nhất mà mỗi IP đã chạm tới. Tên hàm tổng hợp của pandas là gì?',
          accept: ['nunique', 'nunique()', '.nunique', '.nunique()'],
          placeholder: 'Tên hàm…',
          hint: 'Không phải count, không phải size.',
          why: '`nunique` đếm số giá trị khác nhau. Sự phân biệt giữa `size` (tổng số dòng), `count` (số dòng không rỗng) và `nunique` (số giá trị duy nhất) là một trong những nguồn sai số phổ biến nhất khi phân tích log — và cả ba đều chạy trơn tru, không báo lỗi, chỉ trả về con số khác nhau.',
        },
        {
          id: 't2l2-q4',
          kind: 'multi',
          tags: ['chat-luong-du-lieu'],
          q: 'Kết quả phân tích cho thấy 1 IP đã thử 8.400 tài khoản duy nhất trong 10 phút. Trước khi báo động, bạn nên kiểm tra điều gì? (Chọn tất cả)',
          options: [
            'IP đó có phải là NAT gateway hoặc proxy tập trung của toàn văn phòng không',
            'Tên tài khoản đã được chuẩn hoá về chữ thường và cắt tiền tố miền chưa',
            'Có bản ghi trùng lặp do ống dẫn log giao nhiều lần không',
            'Mô hình đã được huấn luyện đủ số vòng lặp chưa',
          ],
          answers: [0, 1, 2],
          why: 'Ba khả năng đầu đều là giải thích lành tính rất hay gặp và phải loại trừ trước. Sau NAT, hàng trăm người dùng chia sẻ một IP nguồn nên con số bùng nổ tự nhiên. Chưa chuẩn hoá tài khoản thì `nunique` phóng đại. Log trùng lặp thì mọi thống kê bị thổi phồng. Phương án cuối vô nghĩa vì ở đây chưa có mô hình nào — đây thuần tuý là thống kê mô tả, và đó là điều quan trọng: **phần lớn phát hiện tốt không cần ML.**',
        },
      ],
      terms: ['pandas', 'dataframe', 'groupby', 'resample', 'threat-intel', 'ioc', 'parquet'],
      further: [
        {
          title: 'pandas — User Guide, mục Group By và Time Series',
          note: 'Hai chương duy nhất bạn thật sự cần đọc kỹ. Phần còn lại tra khi cần.',
        },
        {
          title: 'DuckDB documentation — Reading Parquet',
          note: 'Nửa giờ đọc đổi lấy khả năng chạy SQL trên hàng trăm GB log mà không cần hạ tầng.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't2-l3',
      trackId: 'du-lieu',
      title: 'Làm sạch và chuẩn hoá log',
      subtitle: 'Chỗ mọi con số bị làm sai trước khi mô hình kịp nhìn thấy dữ liệu',
      minutes: 24,
      practiceMinutes: 7,
      level: 'co-ban',
      prereqs: ['t2-l2'],
      why: {
        short:
          'Một người dùng duy nhất có thể xuất hiện dưới sáu chuỗi khác nhau trong bốn hệ thống — nếu không hợp nhất chúng, mọi phép đếm và mọi đặc trưng của bạn đều sai.',
        scenario:
          'Bạn xây đặc trưng “số máy khác nhau mà một tài khoản đăng nhập trong 24 giờ”. Con số bạn tính ra là 11. Con số thật là 3, vì cùng một máy xuất hiện dưới hostname ngắn, FQDN, và hai địa chỉ IP do DHCP cấp lại.',
        roles: ['Detection Engineer', 'Security Data Scientist', 'SOC Analyst', 'ML Engineer'],
        costOfNotKnowing:
          'Mô hình học trên dữ liệu bẩn tạo ra đặc trưng vô nghĩa; bạn dành hàng tuần tinh chỉnh thuật toán trong khi lỗi nằm ở dòng thứ ba của pipeline.',
      },
      objectives: [
        'Tách trường từ log không cấu trúc và đo được tỉ lệ parse hỏng',
        'Xử lý đúng ba loại timestamp và phát hiện lệch đồng hồ giữa các nguồn',
        'Chọn được kỹ thuật phù hợp cho trường có nhiều giá trị phân biệt thay vì one-hot mù quáng',
        'Hợp nhất thực thể người dùng, máy và địa chỉ IP có tính tới yếu tố thời gian',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Tài khoản của một kỹ sư tên Trần Minh có thể xuất hiện dưới bao nhiêu chuỗi khác nhau trong hệ thống log của một doanh nghiệp bình thường? Hãy thử liệt kê ra giấy trước khi mở.',
          reveal:
            'Danh sách thường gặp: `CORP\\tran.minh`, `tran.minh`, `TRAN.MINH`, `tran.minh@congty.vn`, `Trần Minh` (trường display name trong log HR/ứng dụng), `S-1-5-21-...-1183` (SID trong một số sự kiện Windows), `uid=tranminh,ou=users,dc=corp` (LDAP DN), và `tminh` (tài khoản cũ chưa xoá). **Tám chuỗi cho một con người.** Nếu bạn tính “số tài khoản đăng nhập vào máy chủ X” mà không hợp nhất, con số phồng lên 8 lần. Chi tiết quan trọng: SID là định danh **ổn định** — tên tài khoản đổi được, SID thì không — nên khi có SID, hãy dùng nó làm khoá chính.',
        },
        { t: 'h', text: 'Phần 1 — Phân tích log không cấu trúc', level: 2 },
        {
          t: 'p',
          md: 'Có ba tầng chất lượng, và bạn nên leo lên tầng cao nhất khả thi trước khi viết một dòng regex nào.',
        },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Cấu trúc ngay tại nguồn.** Bật chế độ JSON của thiết bị (Zeek có `json-logs`, hầu hết thiết bị mạng hiện đại hỗ trợ). Đây là lựa chọn tốt nhất và thường chỉ tốn một dòng cấu hình.',
            '**Parser ở tầng thu thập.** Grok trong Logstash, parser của Fluent Bit, Vector VRL. Ưu điểm: viết một lần, áp dụng cho mọi người dùng về sau, và có sẵn thư viện mẫu cho định dạng phổ biến.',
            '**Regex trong pandas.** Lựa chọn cuối cùng, dành cho khảo sát nhanh hoặc định dạng độc nhất. Không bao giờ để nó thành hạ tầng lâu dài.',
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Tách trường bằng nhóm có tên và ĐO tỉ lệ hỏng — parser im lặng là parser nguy hiểm',
          code:
            "import pandas as pd\n" +
            "\n" +
            "# Một dòng syslog thiết bị mạng: không JSON, chỉ văn bản thô.\n" +
            "PAT = (\n" +
            "    r'^(?P<ts>[A-Za-z]{3}\\s+\\d+\\s+\\d\\d:\\d\\d:\\d\\d)\\s+'\n" +
            "    r'(?P<host>[^\\s]+)\\s+'\n" +
            "    r'(?P<prog>[^\\[:]+)(?:\\[(?P<pid>\\d+)\\])?:\\s*'\n" +
            "    r'(?P<msg>.*)$'\n" +
            ")\n" +
            "\n" +
            "parsed = df['raw'].str.extract(PAT)\n" +
            "\n" +
            "# Bước không được bỏ: đo và NHÌN những dòng không khớp\n" +
            "bad = parsed['ts'].isna()\n" +
            "print('Không parse được:', round(bad.mean() * 100, 2), '%')\n" +
            "print(df.loc[bad, 'raw'].head(5).tolist())\n" +
            "\n" +
            "# Ngưỡng thực dụng: trên 1% dòng hỏng là dấu hiệu định dạng đã đổi\n" +
            "assert bad.mean() < 0.01, 'Parser đã lệch so với định dạng log hiện tại'\n",
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Parser hỏng âm thầm — sự cố dữ liệu phổ biến nhất trong SOC',
          md: 'Nhà cung cấp nâng cấp firmware, thêm một trường vào giữa dòng log. Regex của bạn không khớp nữa nên trả về `NaN`. Không có lỗi, không có cảnh báo — chỉ là số lượng phát hiện tụt về 0 và không ai để ý trong ba tuần.\n\n**Cách phòng:** đưa tỉ lệ parse hỏng thành một chỉ số được giám sát như bất kỳ chỉ số hạ tầng nào, có ngưỡng cảnh báo riêng. Song song, giám sát **số bản ghi/giờ theo từng nguồn** — im lặng đột ngột là dấu hiệu sự cố, và cũng có thể là dấu hiệu kẻ tấn công đã tắt log.',
        },
        { t: 'h', text: 'Phần 2 — Thời gian: nguồn lỗi số một', level: 2 },
        {
          t: 'table',
          head: ['Loại dấu thời gian', 'Ý nghĩa', 'Dùng cho việc gì'],
          rows: [
            ['Event time', 'Thời điểm sự kiện thật sự xảy ra, do chính nguồn ghi', 'Dựng dòng thời gian điều tra; huấn luyện và chia tập theo thời gian'],
            ['Ingest time', 'Thời điểm hệ thống thu thập nhận được bản ghi', 'Đo độ trễ, phát hiện nguồn ngừng gửi log'],
            ['Index time', 'Thời điểm bản ghi sẵn sàng để truy vấn', 'Tính SLA phát hiện; giải thích vì sao truy vấn “5 phút gần nhất” bị thiếu dữ liệu'],
          ],
          caption: 'Ba mốc này KHÔNG bằng nhau. Nhầm lẫn giữa chúng là nguyên nhân của phần lớn tranh cãi “vì sao SIEM không thấy sự kiện đó”.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Bốn tình huống thời gian bạn chắc chắn sẽ gặp',
          code:
            "# 1) Chuỗi ISO 8601, có thể lẫn nhiều offset khác nhau -> ép hết về UTC\n" +
            "df['ts'] = pd.to_datetime(df['ts_raw'], utc=True, errors='coerce', format='ISO8601')\n" +
            "\n" +
            "# 2) Epoch millisecond (EDR và nhiều API đám mây dùng dạng này)\n" +
            "df['ts'] = pd.to_datetime(df['ts_ms'], unit='ms', utc=True)\n" +
            "\n" +
            "# 3) Giờ địa phương KHÔNG kèm offset -> phải gán múi giờ thủ công.\n" +
            "#    ambiguous và nonexistent xử lý hai giờ bị lặp/bị mất khi đổi giờ mùa hè.\n" +
            "naive = pd.to_datetime(df['ts_local'], errors='coerce')\n" +
            "df['ts'] = (naive.dt.tz_localize('Asia/Ho_Chi_Minh',\n" +
            "                                 ambiguous='NaT', nonexistent='NaT')\n" +
            "                 .dt.tz_convert('UTC'))\n" +
            "\n" +
            "# 4) Đo lệch đồng hồ giữa các máy: ingest time trừ event time\n" +
            "df['skew_s'] = (df['ingest_ts'] - df['ts']).dt.total_seconds()\n" +
            "lech = df.groupby('host')['skew_s'].median().sort_values()\n" +
            "print('Máy có đồng hồ chạy nhanh nhất:', lech.head(5))\n" +
            "print('Máy gửi log trễ nhất:', lech.tail(5))\n",
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'Khi đồng hồ nói dối',
          md: 'Một đội ứng cứu dựng dòng thời gian của sự cố và kết luận rằng tệp mã độc được ghi xuống đĩa **sau** khi tiến trình khởi chạy nó — điều bất khả thi. Nguyên nhân: máy chủ tệp lệch đồng hồ 4 phút so với máy trạm vì mất đồng bộ NTP. Bốn phút đó làm đảo ngược thứ tự nhân quả của toàn bộ dòng thời gian.\n\nBài học cho ML: nếu bạn xây đặc trưng dạng “A xảy ra trước B bao nhiêu giây” trên nhiều nguồn khác nhau, hãy **đo lệch đồng hồ trước**, và cân nhắc làm tròn về cửa sổ lớn hơn độ lệch quan sát được.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't2l3-cp1',
              kind: 'mcq',
              tags: ['thoi-gian', 'chuan-hoa'],
              q: 'Bạn huấn luyện mô hình phát hiện đăng nhập bất thường và dùng đặc trưng “giờ trong ngày”. Log đến từ chi nhánh ở ba múi giờ, đã được ép hết về UTC. Vấn đề là gì?',
              options: [
                'Không có vấn đề gì, UTC là cách làm đúng',
                'Đặc trưng “giờ UTC” trộn lẫn giờ làm việc của ba nơi, làm mất tín hiệu “đăng nhập lúc 3 giờ sáng”',
                'UTC không hỗ trợ giờ mùa hè nên dữ liệu sai',
                'Phải chuyển hết về giờ Việt Nam thay vì UTC',
              ],
              answer: 1,
              why: 'Đây là chỗ tinh tế: **lưu trữ** phải là UTC, nhưng **đặc trưng ngữ nghĩa** phải là giờ địa phương của người dùng. 9 giờ sáng ở Hà Nội và 9 giờ sáng ở Berlin là hai mốc UTC khác nhau; gộp chung thì tín hiệu “ngoài giờ làm việc” bị hoà tan. Cách làm đúng: lưu UTC, đồng thời sinh thêm cột `local_hour` dựa trên múi giờ của chính người dùng hoặc của tài sản đó.',
              distractorWhy: [
                'UTC đúng cho lưu trữ nhưng sai khi dùng trực tiếp làm đặc trưng mang ý nghĩa hành vi con người.',
                '',
                'UTC không có giờ mùa hè, và đó chính là ưu điểm chứ không phải lỗi.',
                'Chuyển hết về một múi giờ cố định khác cũng gặp đúng vấn đề như UTC.',
              ],
            },
            {
              id: 't2l3-cp2',
              kind: 'truefalse',
              tags: ['chat-luong-du-lieu'],
              q: 'Bản ghi trùng lặp trong ống dẫn log là hiện tượng bất thường, chỉ xảy ra khi hệ thống lỗi.',
              answer: false,
              why: 'Phần lớn ống dẫn log được thiết kế theo ngữ nghĩa **giao ít nhất một lần** (at-least-once): khi mất kết nối, bên gửi gửi lại để không mất dữ liệu, và hệ quả tất yếu là trùng lặp. Đó là lựa chọn thiết kế có chủ ý, không phải lỗi. Nhiệm vụ của bạn là khử trùng lặp ở tầng phân tích bằng một khoá tổng hợp — với Windows, bộ khoá tốt là (host, channel, EventRecordID).',
            },
          ],
        },
        { t: 'h', text: 'Phần 3 — Thiếu dữ liệu và trùng lặp', level: 2 },
        {
          t: 'p',
          md: 'Trong bảo mật, **sự vắng mặt của dữ liệu thường chính là tín hiệu**. Trường User-Agent rỗng có thể nghĩa là công cụ tự động chứ không phải trình duyệt. Trường dòng lệnh rỗng có thể nghĩa là chính sách audit chưa bật — hoặc kẻ tấn công đã tắt nó.',
        },
        {
          t: 'list',
          items: [
            '**Đừng bao giờ `fillna(0)` cho cổng, số byte, hay mã trạng thái.** Số 0 là một giá trị có ý nghĩa riêng; điền vào đó là bịa dữ liệu.',
            '**Thêm cột cờ `is_missing`** cho mọi trường quan trọng bị thiếu. Với mô hình cây, cờ này thường có độ quan trọng cao — đúng như trực giác bảo mật.',
            '**LightGBM và XGBoost xử lý được `NaN` gốc**, tự học hướng đi cho giá trị thiếu. Đừng điền giá trị chỉ để làm hài lòng thư viện.',
            '**Phân biệt “thiếu vì không thu thập” và “thiếu vì không tồn tại”.** Một tiến trình không có tiến trình cha (PID 4) khác hẳn một bản ghi bị mất trường cha.',
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Khử trùng lặp bằng khoá tổng hợp, và ghi lại đã bỏ bao nhiêu',
          code:
            "# Windows: bộ ba này gần như định danh duy nhất một bản ghi\n" +
            "key = ['host', 'channel', 'record_id']\n" +
            "\n" +
            "truoc = len(df)\n" +
            "df = df.sort_values('ingest_ts').drop_duplicates(subset=key, keep='first')\n" +
            "bo = truoc - len(df)\n" +
            "print('Đã bỏ', bo, 'bản ghi trùng', f'({bo / truoc:.2%})')\n" +
            "\n" +
            "# Nếu không có record_id (log mạng, syslog), dùng hash nội dung + thời gian\n" +
            "sig = (df['ts'].astype('int64').astype('string') + '|' +\n" +
            "       df['src_ip'] + '|' + df['dst_ip'] + '|' +\n" +
            "       df['dst_port'].astype('string'))\n" +
            "df = df.loc[~sig.duplicated()]\n" +
            "\n" +
            "# Cờ thiếu dữ liệu: giữ thông tin thay vì bịa giá trị\n" +
            "for col in ['cmdline', 'user_agent', 'parent']:\n" +
            "    df[col + '_missing'] = df[col].isna().astype('int8')\n",
        },
        { t: 'h', text: 'Phần 4 — Trường có nhiều giá trị phân biệt', level: 2 },
        {
          t: 'p',
          md: 'Dữ liệu bảo mật đầy những cột có hàng triệu giá trị khác nhau: địa chỉ IP, URL, hash tệp, tên tiến trình, chuỗi User-Agent. One-hot encoding cho một cột 2 triệu giá trị sẽ tạo 2 triệu cột — vô dụng và thường vỡ bộ nhớ. Đây là bốn cách thay thế, kèm điều kiện dùng.',
        },
        {
          t: 'table',
          head: ['Kỹ thuật', 'Cách làm', 'Khi nào dùng', 'Rủi ro'],
          rows: [
            [
              'Top-K + OTHER',
              'Giữ K giá trị phổ biến nhất, gộp phần còn lại thành một nhóm',
              'Cột có phân bố đuôi dài rõ rệt, ví dụ tên tiến trình',
              'Giá trị hiếm chính là thứ đáng ngờ nhất — bạn có thể vừa vứt đi tín hiệu quan trọng',
            ],
            [
              'Mã hoá theo tần suất',
              'Thay giá trị bằng số lần nó xuất hiện (hoặc log của số đó)',
              'IP đích, tên miền, hash — nơi “hiếm” tự nó là đặc trưng',
              'Tần suất phải tính trên tập huấn luyện, nếu tính trên toàn bộ dữ liệu là rò rỉ',
            ],
            [
              'Hashing trick',
              'Băm giá trị vào một không gian cố định, ví dụ 2^18 chiều',
              'Rất nhiều giá trị mới xuất hiện liên tục; cần cố định kích thước đặc trưng',
              'Va chạm băm gộp hai giá trị khác nhau; mất hoàn toàn khả năng diễn giải',
            ],
            [
              'Mã hoá theo mục tiêu',
              'Thay giá trị bằng tỉ lệ nhãn dương của nhóm đó',
              'Cột phân loại có quan hệ mạnh với nhãn và đủ số mẫu mỗi nhóm',
              'Nguồn rò rỉ khét tiếng — bắt buộc tính trong từng fold, có làm mượt',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Với dữ liệu bảo mật, hãy tách giá trị thành đặc trưng có ý nghĩa',
          md: 'Thay vì mã hoá nguyên chuỗi, hãy hỏi: **cái gì trong chuỗi này mang thông tin?** Với một URL: độ dài, số dấu chấm, entropy của phần tên miền, có địa chỉ IP thay tên miền không, tuổi tên miền, phần mở rộng tệp. Với một tiến trình: nằm trong thư mục hệ thống hay thư mục tạm, có chữ ký số không, tiến trình cha là gì. Sáu đặc trưng có ý nghĩa gần như luôn thắng 2 triệu cột one-hot, và bạn giải thích được cho analyst.',
        },
        { t: 'h', text: 'Phần 5 — Hợp nhất thực thể', level: 2 },
        {
          t: 'compare',
          title: 'Chuẩn hoá ngây thơ và chuẩn hoá đúng',
          left: {
            title: 'Cách làm ngây thơ',
            icon: 'x',
            items: [
              'lower() tên tài khoản và coi như xong',
              'Dùng địa chỉ IP làm định danh máy',
              'Coi hostname và FQDN là hai máy khác nhau',
              'Bỏ qua tài khoản dịch vụ vì “không phải người”',
              'Chuẩn hoá đường dẫn tệp bằng cách cắt chữ hoa',
            ],
          },
          right: {
            title: 'Cách làm dùng được',
            icon: 'check',
            items: [
              'Dùng SID hoặc objectGUID làm khoá chính; tên chỉ là thuộc tính hiển thị',
              'Ánh xạ IP sang máy theo KHOẢNG THỜI GIAN, dựa trên log DHCP',
              'Chuẩn hoá về FQDN chữ thường, giữ bảng bí danh cho hostname ngắn',
              'Gắn nhãn loại tài khoản (người / dịch vụ / máy) vì hành vi bình thường khác nhau hoàn toàn',
              'Chuẩn hoá biến môi trường và ký tự Unicode dễ nhầm trước khi so sánh đường dẫn',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Ánh xạ IP sang máy phải có chiều thời gian',
          md: 'Trong mạng dùng DHCP, địa chỉ `10.20.3.44` là máy kế toán lúc 9 giờ sáng và là máy của một nhà thầu lúc 3 giờ chiều. Một bảng ánh xạ IP-sang-máy **không có thời gian** sẽ gán sai hành vi cho sai người — và trong điều tra sự cố, sai lầm đó có hậu quả nghiêm trọng hơn nhiều so với một báo động giả. Bảng đúng phải có dạng (ip, host, valid_from, valid_to) và mọi phép ghép phải là ghép theo khoảng thời gian.',
        },
        {
          t: 'lab',
          id: 'lab-entity',
          intro:
            'Bên dưới là đúng một ngày log của mười một tài khoản, và một luật phát hiện di chuyển ngang: cảnh báo khi một tài khoản đăng nhập vào quá nhiều máy trong 24 giờ. Luật đang chạy trên dữ liệu chưa hợp nhất — hãy xem nó tố ai và bỏ sót ai, rồi bật từng bước làm sạch để xem hai kết luận đổi chỗ cho nhau. Để ý riêng bước ánh xạ IP: chế độ "bảng tĩnh" trông gần đúng trên tổng số nhưng gán quá nửa số sự kiện vào sai máy.',
        },
        {
          t: 'p',
          md: 'Nếu tổ chức của bạn nghiêm túc về chuyện này, đừng tự sáng chế lược đồ. Ba chuẩn đáng dùng: **OCSF** (Open Cybersecurity Schema Framework, được nhiều nhà cung cấp lớn hậu thuẫn), **ECS** (Elastic Common Schema, nay đã đóng góp vào OpenTelemetry), và **ASIM** trong Microsoft Sentinel. Chọn một, ánh xạ mọi nguồn về đó, và mọi mô hình sau này của bạn dùng chung một từ vựng.',
        },
        {
          t: 'checklist',
          title: 'Danh sách kiểm tra làm sạch — chạy trước mỗi lần huấn luyện',
          items: [
            'Tỉ lệ parse hỏng dưới ngưỡng đã đặt, và bạn đã nhìn tận mắt các dòng hỏng.',
            'Mọi timestamp ở UTC, có kiểu datetime tz-aware, tỉ lệ NaT đã được ghi nhận.',
            'Đã đo lệch đồng hồ giữa các nguồn sẽ được tương quan với nhau.',
            'Đã khử trùng lặp bằng khoá tổng hợp và ghi lại tỉ lệ bị bỏ.',
            'Không có `fillna(0)` trên trường số mang ý nghĩa; đã thêm cờ `is_missing`.',
            'Thực thể user/host/IP đã được hợp nhất, và ánh xạ IP-sang-host có chiều thời gian.',
            'Mọi thống kê dùng để mã hoá (tần suất, mục tiêu) được tính CHỈ trên tập huấn luyện.',
          ],
        },
        { t: 'terms', ids: ['chuan-hoa', 'timestamp', 'cardinality', 'entity-resolution', 'ocsf', 'hashing-trick'] },
      ],
      keyTakeaways: [
        'Ba tầng phân tích log: cấu trúc tại nguồn > parser tại tầng thu thập > regex trong pandas. Leo lên tầng cao nhất khả thi.',
        'Luôn đo tỉ lệ parse hỏng và giám sát nó như một chỉ số hạ tầng — parser hỏng im lặng là sự cố dữ liệu phổ biến nhất.',
        'Event time, ingest time và index time là ba mốc khác nhau; lưu UTC nhưng sinh đặc trưng theo giờ địa phương của người dùng.',
        'Trùng lặp là hệ quả tất yếu của ngữ nghĩa giao ít nhất một lần, không phải lỗi hiếm gặp.',
        'Trường có nhiều giá trị phân biệt: chọn giữa top-K, tần suất, hashing và target encoding — nhưng tách thành đặc trưng có ý nghĩa thường thắng tất cả.',
        'Định danh ổn định (SID, objectGUID) làm khoá chính; ánh xạ IP-sang-máy bắt buộc phải có chiều thời gian.',
      ],
      cards: [
        {
          id: 't2l3-c1',
          front: 'Vì sao không nên dùng tên tài khoản làm khoá chính khi hợp nhất thực thể người dùng?',
          back: 'Vì tên đổi được và xuất hiện dưới nhiều dạng (DOMAIN\\user, UPN, display name). SID hoặc objectGUID mới là định danh ổn định.',
          tags: ['entity-resolution'],
        },
        {
          id: 't2l3-c2',
          front: 'Ba mốc thời gian trong một ống dẫn log là gì, và mốc nào dùng để chia tập huấn luyện?',
          back: 'Event time, ingest time, index time. Chia tập theo event time, còn ingest time dùng để đo độ trễ.',
          tags: ['thoi-gian'],
        },
        {
          id: 't2l3-c3',
          front: 'Vì sao fillna(0) cho cột số byte hoặc cổng là sai?',
          back: 'Vì 0 là một giá trị hợp lệ có ý nghĩa riêng; điền vào đó là bịa dữ liệu. Hãy giữ NaN và thêm cờ is_missing.',
          tags: ['thieu-du-lieu'],
        },
        {
          id: 't2l3-c4',
          front: 'Mã hoá theo tần suất và mã hoá theo mục tiêu khác nhau ở rủi ro nào?',
          back: 'Cả hai phải tính trên tập huấn luyện, nhưng target encoding rò rỉ nặng hơn nhiều vì dùng trực tiếp nhãn — bắt buộc tính trong từng fold và làm mượt.',
          tags: ['cardinality', 'ro-ri-du-lieu'],
        },
        {
          id: 't2l3-c5',
          front: 'Bảng ánh xạ IP sang tên máy cần thêm gì để dùng được trong mạng DHCP?',
          back: 'Cần khoảng hiệu lực thời gian (valid_from, valid_to) và phép ghép phải là ghép theo khoảng thời gian, vì một IP thuộc về nhiều máy trong ngày.',
          tags: ['entity-resolution'],
        },
      ],
      quiz: [
        {
          id: 't2l3-q1',
          kind: 'mcq',
          tags: ['cardinality'],
          q: 'Cột `dst_domain` có 3,4 triệu giá trị khác nhau trong 90 ngày dữ liệu. Cách xử lý nào ít rủi ro nhất cho một mô hình phát hiện kết nối C2?',
          options: [
            'One-hot encoding toàn bộ 3,4 triệu giá trị',
            'Tách thành đặc trưng có ý nghĩa: độ dài, entropy, số nhãn, tuổi tên miền, có nằm trong danh sách phổ biến không',
            'Target encoding trực tiếp trên tên miền',
            'Bỏ hẳn cột này vì quá nhiều giá trị phân biệt',
          ],
          answer: 1,
          why: 'Tên miền C2 mới xuất hiện mỗi ngày, nên bất kỳ mã hoá nào dựa trên **danh tính** của tên miền đều vô dụng với giá trị chưa từng thấy. Tách thành thuộc tính có ý nghĩa cho phép mô hình tổng quát hoá sang tên miền hoàn toàn mới — đúng bài toán bạn cần. One-hot vỡ bộ nhớ; target encoding trên cột cực nhiều giá trị phân biệt vừa rò rỉ nặng vừa vô nghĩa với giá trị mới; bỏ cột là vứt đi nguồn tín hiệu mạnh nhất.',
          distractorWhy: [
            'Tạo 3,4 triệu cột là bất khả thi về bộ nhớ và vô dụng với tên miền chưa từng thấy.',
            '',
            'Target encoding cần đủ số mẫu cho mỗi giá trị; với hàng triệu giá trị xuất hiện một lần, nó chỉ mã hoá lại chính nhãn — rò rỉ thuần tuý.',
            'Tên miền là nguồn tín hiệu mạnh nhất cho bài toán này; vấn đề là cách biểu diễn, không phải bản thân cột.',
          ],
        },
        {
          id: 't2l3-q2',
          kind: 'multi',
          tags: ['chuan-hoa', 'entity-resolution'],
          q: 'Trước khi tính đặc trưng “số máy khác nhau mà một tài khoản đã đăng nhập”, cần làm gì? (Chọn tất cả)',
          options: [
            'Hợp nhất các dạng viết khác nhau của cùng một tài khoản về một định danh',
            'Chuẩn hoá hostname và FQDN của cùng một máy về một giá trị',
            'Khử trùng lặp bản ghi do ống dẫn giao nhiều lần',
            'Điền giá trị 0 cho mọi trường bị thiếu để tránh NaN',
          ],
          answers: [0, 1, 2],
          why: 'Ba việc đầu đều trực tiếp làm sai kết quả `nunique` nếu bỏ qua: tài khoản chưa hợp nhất phóng đại mẫu số, máy chưa hợp nhất phóng đại tử số, và trùng lặp thổi phồng mọi con số. Việc thứ tư thì có hại: điền 0 vào trường thiếu tạo ra một giá trị giả có thể bị đếm như một máy thật.',
        },
        {
          id: 't2l3-q3',
          kind: 'order',
          tags: ['chuan-hoa', 'quy-trinh'],
          q: 'Sắp xếp đúng thứ tự các bước làm sạch một nguồn log mới.',
          items: [
            'Tách trường và đo tỉ lệ parse hỏng',
            'Ép mọi dấu thời gian về UTC và kiểm tra tỉ lệ NaT',
            'Khử trùng lặp bằng khoá tổng hợp',
            'Hợp nhất thực thể user, host và IP',
            'Sinh đặc trưng và mã hoá trường nhiều giá trị phân biệt',
          ],
          why: 'Thứ tự có tính bắc cầu. Không khử trùng lặp được nếu chưa có trường và chưa có thời gian để sắp xếp. Không hợp nhất thực thể được nếu bản ghi còn trùng. Và mã hoá theo tần suất chỉ đúng khi thực thể đã hợp nhất, vì nếu không, cùng một máy bị đếm thành nhiều giá trị hiếm.',
        },
        {
          id: 't2l3-q4',
          kind: 'truefalse',
          tags: ['thoi-gian'],
          q: 'Vì đã ép toàn bộ log về UTC nên có thể dùng thẳng giờ UTC làm đặc trưng “đăng nhập ngoài giờ làm việc”.',
          answer: false,
          why: 'Lưu trữ ở UTC là đúng, nhưng ngữ nghĩa “ngoài giờ làm việc” gắn với múi giờ của con người, không gắn với UTC. Với tổ chức đa quốc gia, cùng một giờ UTC là giữa trưa ở nơi này và nửa đêm ở nơi khác. Cách làm đúng là giữ cột UTC làm nguồn sự thật và sinh thêm cột giờ địa phương dựa trên múi giờ của tài khoản hoặc của tài sản.',
        },
      ],
      terms: ['chuan-hoa', 'timestamp', 'cardinality', 'entity-resolution', 'ocsf', 'hashing-trick'],
      further: [
        {
          title: 'OCSF — Open Cybersecurity Schema Framework',
          note: 'Lược đồ chung cho sự kiện bảo mật, được nhiều nhà cung cấp lớn hỗ trợ. Đọc phần Base Event trước.',
        },
        {
          title: 'Elastic Common Schema (ECS)',
          note: 'Quy ước đặt tên trường thực dụng và phổ biến. Kể cả không dùng Elastic, đây vẫn là từ điển tốt để mượn.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't2-l4',
      trackId: 'du-lieu',
      title: 'Bài toán nhãn: lấy nhãn ở đâu',
      subtitle: 'Thứ khan hiếm nhất trong ML bảo mật không phải dữ liệu, mà là câu trả lời đúng',
      minutes: 25,
      practiceMinutes: 7,
      level: 'trung-cap',
      prereqs: ['t2-l1'],
      why: {
        short:
          'Bạn có thể có 400 triệu dòng log và vẫn không huấn luyện được gì, vì không dòng nào trong đó có nhãn — và cách bạn tạo ra nhãn quyết định trần hiệu năng của mọi mô hình về sau.',
        scenario:
          'Ban lãnh đạo duyệt ngân sách cho dự án “ML phát hiện mối đe doạ”. Tuần đầu tiên bạn phát hiện tổ chức có 18 tháng log nhưng đúng 240 sự cố đã được xác nhận, và một nửa trong số đó không ghi lại được sự kiện log nào liên quan.',
        roles: ['Security Data Scientist', 'Detection Engineer', 'ML Engineer', 'Threat Hunter'],
        costOfNotKnowing:
          'Bạn huấn luyện mô hình trên nhãn do chính hệ thống phát hiện cũ sinh ra, và tạo ra một cỗ máy bắt chước hoàn hảo mọi điểm mù của hệ thống đó — trong khi báo cáo cho thấy độ chính xác 98%.',
      },
      objectives: [
        'So sánh sáu nguồn nhãn theo chất lượng, khối lượng, độ trễ và thiên lệch cố hữu',
        'Nhận ra vòng lặp phản hồi khi nhãn được sinh từ chính hệ thống phát hiện đang dùng',
        'Thiết kế cửa sổ chín muồi nhãn phù hợp với bài toán',
        'Chọn được chiến lược phù hợp khi tổ chức có rất ít hoặc không có nhãn',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Đây là bài quan trọng nhất chặng này về mặt thực chiến. Trong hầu hết dự án ML bảo mật thất bại mà tôi biết, nguyên nhân gốc không nằm ở mô hình mà nằm ở nhãn.',
        },
        {
          t: 'predict',
          question:
            'Bạn tải 50.000 tệp cùng kết quả quét từ VirusTotal (khoảng 70 engine mỗi tệp). Bạn cần gán nhãn độc/lành. Ngưỡng nào: từ 1 engine trở lên là độc? Từ 5? Từ 20? Điều gì hỏng với mỗi lựa chọn?',
          reveal:
            'Không có ngưỡng đúng, chỉ có ngưỡng phù hợp với sai số bạn chấp nhận được.\n\n**Ngưỡng 1:** rất nhiều tệp lành bị dính vì một engine yếu báo nhầm — nhãn dương của bạn nhiễm đầy phần mềm hợp pháp như trình cài đặt hay công cụ quản trị.\n\n**Ngưỡng 20:** sạch nhưng bạn chỉ giữ lại mã độc **đã cũ và đã phổ biến**, tức đúng loại mà chữ ký bắt được rồi — mô hình học từ đó không mang lại giá trị mới.\n\n**Ngưỡng 4–5** là thoả hiệp phổ biến trong nghiên cứu. Nhưng ba vấn đề còn lại không biến mất: (1) các engine **không độc lập** — nhiều engine tham chiếu lẫn nhau, nên 10 phiếu không mạnh gấp 10 lần 1 phiếu; (2) nhãn **thay đổi theo thời gian** — một tệp mới tải lên hôm nay có thể 2 engine báo, một tháng sau là 45; (3) tên họ mã độc do các engine đặt mâu thuẫn nhau, nên nếu cần nhãn họ hãy dùng công cụ chuẩn hoá như **AVClass** (Sebastián và cộng sự, RAID 2016) thay vì lấy tên của một engine bất kỳ.',
        },
        { t: 'h', text: 'Sáu nguồn nhãn và giá thật của chúng', level: 2 },
        {
          t: 'table',
          head: ['Nguồn nhãn', 'Chất lượng', 'Khối lượng', 'Độ trễ', 'Thiên lệch cố hữu'],
          rows: [
            [
              'Kết luận của analyst (hệ thống ticket)',
              'Khá tới tốt, nhưng không đồng đều giữa người và giữa ca trực',
              'Hàng nghìn tới hàng trăm nghìn/năm',
              'Giờ tới ngày',
              'Chỉ có nhãn cho những gì hệ thống hiện tại đã cảnh báo — không bao giờ có nhãn cho vùng mù',
            ],
            [
              'VirusTotal / đa engine',
              'Tốt cho mã độc phổ biến, kém cho mẫu mới và cho phần mềm xám',
              'Hàng triệu, nếu có tài khoản trả phí',
              'Ngày tới tuần để nhãn ổn định',
              'Nghiêng về loại mã độc mà chữ ký AV bắt được; engine không độc lập với nhau',
            ],
            [
              'Sandbox động',
              'Nhãn hành vi giàu thông tin, nhưng phụ thuộc mẫu có chịu chạy không',
              'Hàng nghìn/ngày, tốn tài nguyên',
              'Phút tới giờ mỗi mẫu',
              'Mã độc hiện đại phát hiện môi trường ảo và nằm im — mẫu tinh vi nhất cho nhãn “vô hại”',
            ],
            [
              'Threat intel feed',
              'Rất khác nhau giữa các nguồn; nhiều mục không có ngày hết hạn',
              'Hàng chục nghìn chỉ dấu',
              'Giờ tới tháng',
              'Chứa hạ tầng dùng chung; trùng lặp giữa các feed tạo cảm giác nhiều nguồn xác nhận',
            ],
            [
              'Honeypot',
              'Nhãn dương gần như sạch tuyệt đối: mọi thứ chạm vào đều đáng ngờ',
              'Lớn và liên tục',
              'Gần thời gian thực',
              'Phân bố tấn công ở honeypot khác hẳn phân bố trong mạng doanh nghiệp thật',
            ],
            [
              'Red team / Atomic Red Team / CALDERA',
              'Nhãn chuẩn xác nhất: bạn biết chính xác cái gì chạy lúc mấy giờ',
              'Nhỏ — hàng chục tới hàng trăm kỹ thuật',
              'Có ngay khi diễn tập kết thúc',
              'Hành vi “sạch phòng thí nghiệm”, thiếu bước dò dẫm và sai sót của kẻ tấn công thật',
            ],
          ],
        },
        {
          t: 'compare',
          title: 'Hai nguồn nhãn hay bị đặt lên bàn cân',
          left: {
            title: 'Kết luận của analyst',
            icon: 'notebook-pen',
            items: [
              'Phản ánh đúng định nghĩa “đáng quan tâm” của chính tổ chức bạn',
              'Có ngữ cảnh: tài sản nào, người nào, có leo thang không',
              'Nhiễu theo con người: mệt mỏi cuối ca, khác biệt giữa các cấp độ analyst',
              'Chỉ tồn tại cho những sự kiện đã được cảnh báo — thiên lệch chọn mẫu nghiêm trọng',
              'Nhãn “đóng: không phải sự cố” thường bị lạm dụng khi analyst hết thời gian',
            ],
          },
          right: {
            title: 'VirusTotal / đa engine',
            icon: 'flask',
            items: [
              'Khối lượng lớn, lấy được ngay, chi phí rõ ràng',
              'Có ngày mẫu xuất hiện lần đầu — dùng được để chia tập theo thời gian',
              'Nhãn dịch chuyển theo thời gian, cần cửa sổ chín muồi',
              'Các engine tham chiếu lẫn nhau nên số phiếu không phải bằng chứng độc lập',
              'Không nói được điều gì về sự kiện trong mạng, chỉ về tệp',
            ],
          },
        },
        { t: 'h', text: 'Ba căn bệnh của nhãn bảo mật', level: 2 },
        {
          t: 'figure',
          id: 'fig-label-maturity',
          caption:
            'Bệnh thứ hai — nhãn muộn — nhìn thấy được: số engine báo độc lớn dần theo tuổi mẫu, và họ mã độc mới lớn chậm hơn hẳn họ đã phổ biến. Vùng bên trái vạch xanh là chỗ nhãn chưa hình thành, nên mọi con số đo trong đó đều là con số của bảng nhãn chứ không phải của mô hình.',
        },
        {
          t: 'steps',
          title: 'Nhận diện và xử lý từng bệnh',
          steps: [
            {
              title: 'Bệnh 1 — Nhãn bẩn (label noise)',
              md: 'Một tỉ lệ nhãn của bạn đơn giản là sai. Điều nguy hiểm là **nhiễu không đối xứng**: trong bảo mật, nhãn âm bị nhiễm nhiều hơn nhãn dương rất nhiều, vì “không ai cảnh báo” bị hiểu thành “lành tính”. Hậu quả cụ thể: mô hình bị phạt mỗi khi nó phát hiện đúng một cuộc tấn công mà con người đã bỏ sót — bạn đang huấn luyện nó im lặng.\n\n**Xử lý:** lấy mẫu ngẫu nhiên 200–500 bản ghi nhãn âm và cho người soát lại; đo tỉ lệ sai và báo cáo nó cùng mọi con số hiệu năng.',
            },
            {
              title: 'Bệnh 2 — Nhãn muộn (label delay)',
              md: 'Nhãn đến sau sự kiện hàng tuần tới hàng tháng. Các báo cáo ngành nhiều năm qua đặt trung vị thời gian kẻ tấn công tồn tại trong mạng trước khi bị phát hiện ở mức khoảng mười ngày tới vài tuần — nhưng đó là **trung vị của những vụ đã bị phát hiện**, đuôi phân phối kéo dài hàng tháng.\n\n**Hệ quả thực tế:** dữ liệu của tuần trước **chưa dùng để đánh giá được**, vì nhãn của nó chưa chín. Nếu bạn đo hiệu năng trên dữ liệu quá mới, mọi phát hiện đúng nhưng chưa được xác nhận sẽ bị tính là báo động giả.',
            },
            {
              title: 'Bệnh 3 — Nhãn thiên lệch (selection bias)',
              md: 'Nhãn chỉ tồn tại ở nơi bạn đã nhìn. Bạn có nhãn cho cảnh báo mà hệ thống hiện tại sinh ra; bạn không có nhãn nào cho hàng triệu sự kiện mà nó bỏ qua. Tập huấn luyện của bạn vì thế không phải là mẫu của thế giới, mà là mẫu của **những gì bộ lọc cũ đã lọt qua**.\n\n**Xử lý:** dành một tỉ lệ nhỏ nguồn lực để gắn nhãn **ngẫu nhiên** ngoài luồng cảnh báo — đắt và nhàm chán, nhưng đó là cách duy nhất ước lượng được recall thật.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Vòng lặp phản hồi: cái bẫy tinh vi nhất trong cả chặng',
          md: 'Bạn huấn luyện mô hình mới trên nhãn sinh ra bởi hệ thống phát hiện cũ. Mô hình học rất giỏi cách **bắt chước hệ thống cũ**, kể cả những điểm mù của nó. Bạn đo trên tập kiểm tra cũng do hệ thống cũ gắn nhãn, nên nó đạt 98%. Bạn triển khai, thay thế hệ thống cũ, và tưởng mình đã tiến bộ — trong khi năng lực phát hiện thật không hề tăng, chỉ rẻ hơn.\n\nBiến thể tệ hơn: mô hình xếp hạng cảnh báo học từ lịch sử đóng ticket. Nếu analyst ca đêm hay đóng nhanh cảnh báo lúc 3 giờ sáng vì mệt, mô hình học rằng **cảnh báo lúc 3 giờ sáng ít quan trọng hơn** — đúng khung giờ kẻ tấn công thích hoạt động.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't2l4-cp1',
              kind: 'mcq',
              tags: ['nhan', 'thien-lech'],
              q: 'Bạn có 3 năm ticket SOC làm nhãn. Chỉ số nào KHÔNG thể ước lượng đáng tin từ nguồn nhãn này?',
              options: [
                'Precision của mô hình trên các cảnh báo mà hệ thống hiện tại sinh ra',
                'Recall thật của mô hình trên toàn bộ hoạt động độc hại trong mạng',
                'Tỉ lệ cảnh báo bị đóng là báo động giả theo từng loại luật',
                'Thời gian trung bình analyst xử lý một cảnh báo',
              ],
              answer: 1,
              why: 'Recall cần mẫu số là **toàn bộ** hoạt động độc hại, kể cả phần chưa từng sinh cảnh báo. Nhãn từ ticket chỉ tồn tại trong tập con đã được hệ thống cũ chọn ra, nên mọi ước lượng recall dựa trên nó đều là recall **có điều kiện đã được cảnh báo** — luôn lạc quan hơn sự thật. Ba chỉ số còn lại đều nằm trong phạm vi mà dữ liệu ticket quan sát được.',
              distractorWhy: [
                'Precision đo trên chính tập cảnh báo đã sinh ra, nên dữ liệu ticket đủ để ước lượng.',
                '',
                'Đây là thống kê mô tả trực tiếp trên dữ liệu ticket.',
                'Thời gian xử lý được ghi ngay trong hệ thống ticket.',
              ],
            },
            {
              id: 't2l4-cp2',
              kind: 'truefalse',
              tags: ['nhan', 'virustotal'],
              q: 'Nếu 30 trên 70 engine của VirusTotal báo một tệp là độc, ta có 30 bằng chứng độc lập.',
              answer: false,
              why: 'Các engine không độc lập. Nhiều sản phẩm dùng chung engine cấp phép của bên thứ ba, tham chiếu kết quả của nhau, và cùng lấy từ các nguồn chia sẻ mẫu chung. Số phiếu vì thế là tín hiệu tương quan mạnh chứ không phải phép nhân xác suất độc lập. Trong thực tế, số phiếu hữu ích như một thang độ tin cậy thô, nhưng đừng bao giờ mô hình hoá nó như bỏ phiếu độc lập.',
            },
          ],
        },
        {
          t: 'lab',
          id: 'lab-labels',
          intro:
            'Câu hỏi mở đầu bài này — ngưỡng 1, 5 hay 20 engine — giờ đo được. Lab mở ra ở ngưỡng 5, đúng mức thoả hiệp phổ biến, nhưng gán nhãn ngay ngày tải mẫu về; hãy xem hai bệnh đầu tiên của nhãn hiện ra cùng lúc, rồi tự tìm cửa sổ chín muồi đủ dài trước khi đọc quy tắc ở cuối bài. Lưu ý: không chạy được 70 engine AV trong trình duyệt, nên đây là **mô phỏng** động lực phát hiện theo ba tính chất đã nêu ở trên — engine nhận ra họ phổ biến nhanh, họ mới chậm, còn báo động giả trên phần mềm lành thì gần như không đổi. Hãy đọc nó như bài học về **cơ chế và chiều biến đổi**, đừng lấy con số ở đây làm số đo của VirusTotal thật.',
        },
        { t: 'h', text: 'Khi bạn có rất ít nhãn: bốn lối thoát', level: 2 },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Giám sát yếu (weak supervision).** Thay vì gắn nhãn từng mẫu, bạn viết vài chục **hàm gắn nhãn** — mỗi hàm là một heuristic có thể sai — rồi hợp nhất phiếu của chúng thành nhãn xác suất. Snorkel là khung phổ biến nhất cho cách làm này. Rất hợp với bảo mật vì bạn đã có sẵn hàng trăm luật phát hiện đóng vai trò heuristic.',
            '**Học từ dương và không nhãn (PU learning).** Bạn có một tập chắc chắn độc và một biển dữ liệu chưa biết. Thay vì giả định “chưa biết = lành”, PU learning mô hình hoá đúng thực tế rằng tập chưa nhãn có lẫn dương. Đây là khung tự nhiên nhất cho phần lớn bài toán bảo mật.',
            '**Học chủ động (active learning).** Mô hình chọn ra những mẫu mà nó phân vân nhất để hỏi analyst. Với ngân sách gắn nhãn cố định, cách này thường cho kết quả tốt hơn nhiều so với gắn nhãn ngẫu nhiên. Lưu ý riêng của bảo mật: trộn thêm mẫu ngẫu nhiên vào hàng đợi, nếu không bạn chỉ gắn nhãn quanh ranh giới quyết định và không bao giờ phát hiện được vùng mù.',
            '**Mượn nhãn rồi hiệu chỉnh.** Dùng bộ dữ liệu công khai để khởi động, nhưng luôn hiệu chỉnh lại ngưỡng và đánh giá trên dữ liệu của chính bạn. Chặng sau sẽ chỉ rõ vì sao mô hình huấn luyện trên mạng người khác thường sụp đổ trên mạng của bạn.',
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Giám sát yếu tối giản: ba hàm gắn nhãn, bỏ phiếu có trọng số',
          code:
            "import numpy as np\n" +
            "import pandas as pd\n" +
            "\n" +
            "TRANG, LANH, DOC = -1, 0, 1     # TRANG = bỏ phiếu trắng (abstain)\n" +
            "\n" +
            "def lf_virustotal(r):\n" +
            "    # Nhiều engine đồng thuận -> độc. Không engine nào báo và quét đủ rộng -> lành.\n" +
            "    if r['vt_positives'] >= 5:\n" +
            "        return DOC\n" +
            "    if r['vt_positives'] == 0 and r['vt_total'] >= 60:\n" +
            "        return LANH\n" +
            "    return TRANG\n" +
            "\n" +
            "def lf_chu_ky_so(r):\n" +
            "    # Chữ ký số hợp lệ của nhà phát hành đã kiểm chứng -> nghiêng về lành\n" +
            "    return LANH if r['signer_trusted'] else TRANG\n" +
            "\n" +
            "def lf_sandbox(r):\n" +
            "    # Sandbox thấy hành vi mã hoá hàng loạt tệp người dùng -> độc\n" +
            "    return DOC if r['sandbox_mass_encrypt'] else TRANG\n" +
            "\n" +
            "LFS = [lf_virustotal, lf_chu_ky_so, lf_sandbox]\n" +
            "trong_so = np.array([0.9, 0.5, 0.8])   # ước lượng độ tin cậy của từng hàm\n" +
            "\n" +
            "# iterrows chậm, ở đây chỉ để dễ đọc; thực tế nên viết dạng vector\n" +
            "phieu = np.array([[lf(r) for lf in LFS] for _, r in df.iterrows()])\n" +
            "diem = ((phieu == DOC) * trong_so).sum(1) - ((phieu == LANH) * trong_so).sum(1)\n" +
            "\n" +
            "# Vùng giữa để trống: mẫu không đủ bằng chứng thì KHÔNG gán nhãn, đừng đoán bừa\n" +
            "df['nhan_yeu'] = np.where(diem > 0.5, 1.0, np.where(diem < -0.5, 0.0, np.nan))\n" +
            "print(df['nhan_yeu'].value_counts(dropna=False))\n" +
            "print('Tỉ lệ có nhãn:', df['nhan_yeu'].notna().mean())\n",
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Cửa sổ chín muồi nhãn — quy tắc đơn giản cứu bạn khỏi ảo giác',
          md: 'Đặt một khoảng **chín muồi** cho nhãn, ví dụ 30 ngày với mã độc và 14 ngày với cảnh báo SOC. Quy tắc: **không đánh giá mô hình trên dữ liệu mới hơn khoảng đó**. Kèm theo, hãy truy vấn lại nhãn sau khi hết cửa sổ và ghi lại tỉ lệ nhãn đã đổi — con số đó cho bạn ước lượng trực tiếp về nhiễu nhãn, và thường khiến cả đội tỉnh ngộ trong buổi họp đầu tiên.',
        },
        {
          t: 'callout',
          kind: 'ethics',
          title: 'Nhãn cũng là quyết định về con người',
          md: 'Nhãn “mối đe doạ nội bộ” gắn vào hành vi của một nhân viên cụ thể không phải là một con số trung tính — nó có thể dẫn tới điều tra, kỷ luật, hoặc sa thải. Hãy yêu cầu: tiêu chí gắn nhãn được viết ra rõ ràng, có người thứ hai soát lại trước khi nhãn đi vào tập huấn luyện, và có đường quay lại để gỡ nhãn sai. Điều này cũng là kỳ vọng của các khung quản trị như NIST AI RMF, không chỉ là chuyện đạo đức.',
        },
        {
          t: 'checklist',
          title: 'Kiểm định chất lượng nhãn trước khi huấn luyện',
          items: [
            'Ghi rõ nhãn đến từ đâu, ai/cái gì tạo ra, theo tiêu chí nào.',
            'Lấy mẫu 200–500 nhãn âm và cho người soát lại; báo cáo tỉ lệ sai.',
            'Đo tỉ lệ nhãn thay đổi sau khi hết cửa sổ chín muồi.',
            'Kiểm tra xem nhãn có sinh ra từ chính hệ thống mà mô hình sẽ thay thế không.',
            'Với nhãn từ analyst: kiểm tra phân bố theo ca trực và theo từng người, tìm dấu hiệu mệt mỏi.',
            'Giữ lại một tập nhỏ gắn nhãn NGẪU NHIÊN ngoài luồng cảnh báo để ước lượng recall thật.',
          ],
        },
        { t: 'terms', ids: ['nhan', 'nhan-ban', 'weak-supervision', 'active-learning', 'pu-learning', 'virustotal', 'avclass', 'sandbox'] },
      ],
      keyTakeaways: [
        'Thứ khan hiếm nhất trong ML bảo mật là nhãn đúng, không phải dữ liệu hay thuật toán.',
        'Ba căn bệnh của nhãn: bẩn (nhiễu bất đối xứng nghiêng về nhãn âm), muộn (hàng tuần tới hàng tháng), và thiên lệch (chỉ có ở nơi đã nhìn).',
        'Nhãn từ chính hệ thống phát hiện cũ tạo vòng lặp phản hồi: mô hình mới kế thừa nguyên vẹn điểm mù của hệ thống cũ.',
        'Số engine VirusTotal báo độc là tín hiệu tương quan, không phải bằng chứng độc lập; ngưỡng 4–5 là thoả hiệp phổ biến, còn tên họ mã độc thì cần AVClass để chuẩn hoá.',
        'Đặt cửa sổ chín muồi nhãn và không đánh giá trên dữ liệu mới hơn cửa sổ đó.',
        'Ít nhãn thì đi theo: giám sát yếu, PU learning, học chủ động, hoặc mượn rồi hiệu chỉnh.',
      ],
      cards: [
        {
          id: 't2l4-c1',
          front: 'Vì sao nhiễu nhãn trong bảo mật là bất đối xứng, và điều đó gây hại thế nào?',
          back: 'Nhãn âm bị nhiễm nặng hơn vì “không ai cảnh báo” bị coi là “lành tính”. Hậu quả: mô hình bị phạt mỗi khi phát hiện đúng thứ con người đã bỏ sót.',
          tags: ['nhan', 'nhan-ban'],
        },
        {
          id: 't2l4-c2',
          front: 'Vòng lặp phản hồi trong gắn nhãn là gì?',
          back: 'Huấn luyện mô hình mới trên nhãn do hệ thống phát hiện cũ sinh ra, khiến mô hình học bắt chước cả điểm mù của hệ thống cũ trong khi chỉ số đo lại rất đẹp.',
          tags: ['nhan', 'bay-thuong-gap'],
        },
        {
          id: 't2l4-c3',
          front: 'Cửa sổ chín muồi nhãn (label maturity window) dùng để làm gì?',
          back: 'Để không đánh giá mô hình trên dữ liệu quá mới, khi nhãn chưa kịp hình thành — nếu không, phát hiện đúng nhưng chưa xác nhận sẽ bị tính là báo động giả.',
          tags: ['nhan', 'danh-gia'],
        },
        {
          id: 't2l4-c4',
          front: 'Giám sát yếu (weak supervision) hoạt động thế nào?',
          back: 'Viết nhiều hàm gắn nhãn dạng heuristic, mỗi hàm có thể sai và được phép bỏ phiếu trắng, rồi hợp nhất phiếu của chúng thành nhãn xác suất.',
          tags: ['weak-supervision'],
        },
        {
          id: 't2l4-c5',
          front: 'Vì sao nhãn từ honeypot không thay thế được nhãn từ mạng doanh nghiệp?',
          back: 'Nhãn dương của honeypot rất sạch, nhưng phân bố tấn công ở honeypot khác hẳn phân bố trong mạng thật, nên mô hình học được sẽ lệch.',
          tags: ['nhan', 'thien-lech'],
        },
      ],
      quiz: [
        {
          id: 't2l4-q1',
          kind: 'mcq',
          tags: ['nhan', 'danh-gia'],
          q: 'Bạn đánh giá mô hình phát hiện mã độc trên các mẫu xuất hiện trong 7 ngày gần nhất và thấy precision tụt mạnh. Giải thích khả dĩ nhất trước khi kết luận mô hình kém?',
          options: [
            'Mô hình bị quá khớp trên tập huấn luyện',
            'Nhãn của mẫu mới chưa chín: nhiều mẫu độc thật vẫn đang có 0–2 engine phát hiện nên bị tính là báo động giả',
            'Tập kiểm tra quá nhỏ nên phương sai cao',
            'Ngưỡng quyết định đã bị đặt quá thấp',
          ],
          answer: 1,
          why: 'Nhãn từ đa engine cần thời gian ổn định: một mẫu mới xuất hiện thường chỉ được vài engine nhận ra trong những ngày đầu, rồi con số tăng dần trong vài tuần. Đánh giá trên cửa sổ 7 ngày biến mọi phát hiện sớm — chính là giá trị lớn nhất của mô hình — thành báo động giả trên giấy tờ. Ba giải thích còn lại đều có thể xảy ra nhưng không giải thích được vì sao vấn đề chỉ xuất hiện ở dữ liệu mới nhất.',
          distractorWhy: [
            'Quá khớp làm giảm hiệu năng đều trên mọi dữ liệu mới, không riêng cửa sổ 7 ngày gần nhất.',
            '',
            'Phương sai cao gây dao động hai chiều, không tạo xu hướng tụt có hệ thống ở dữ liệu mới.',
            'Ngưỡng thấp làm giảm precision ở mọi khoảng thời gian, không chỉ ở tuần gần nhất.',
          ],
        },
        {
          id: 't2l4-q2',
          kind: 'match',
          tags: ['nhan'],
          q: 'Nối mỗi nguồn nhãn với điểm yếu đặc trưng nhất của nó.',
          pairs: [
            ['Sandbox động', 'Mẫu tinh vi phát hiện môi trường ảo và nằm im'],
            ['Ticket của analyst', 'Chỉ có nhãn ở nơi hệ thống cũ đã cảnh báo'],
            ['Threat intel feed', 'Chỉ dấu hết hạn và hạ tầng dùng chung gây báo động giả'],
            ['Red team', 'Hành vi sạch phòng thí nghiệm, số lượng nhỏ'],
          ],
          why: 'Không có nguồn nhãn nào tốt toàn diện; nghề của bạn là ghép nhiều nguồn sao cho điểm yếu của nguồn này được bù bởi điểm mạnh của nguồn kia. Ví dụ điển hình: dùng red team để đo recall trên các kỹ thuật cụ thể, dùng ticket để đo precision trong vận hành thật.',
        },
        {
          id: 't2l4-q3',
          kind: 'multi',
          tags: ['nhan', 'thuc-chien'],
          q: 'Tổ chức có 0 nhãn và ngân sách gắn nhãn cho 2.000 mẫu. Cách phân bổ nào hợp lý? (Chọn tất cả)',
          options: [
            'Dành một phần cho mẫu ngẫu nhiên ngoài luồng cảnh báo để ước lượng được recall thật',
            'Dùng học chủ động để ưu tiên mẫu mô hình phân vân nhất',
            'Viết các hàm gắn nhãn từ luật phát hiện sẵn có để mở rộng ra ngoài 2.000 mẫu',
            'Gắn hết 2.000 mẫu vào những cảnh báo có điểm cao nhất của hệ thống hiện tại',
          ],
          answers: [0, 1, 2],
          why: 'Ba lựa chọn đầu bổ trợ nhau: mẫu ngẫu nhiên cho bạn ước lượng không thiên lệch, học chủ động dùng ngân sách hiệu quả nhất ở vùng ranh giới, và giám sát yếu nhân số nhãn lên mà không tốn thêm công người. Lựa chọn cuối là cái bẫy: gắn nhãn cho đúng những cảnh báo mà hệ thống cũ đã tự tin nhất nghĩa là bạn mua lại chính kiến thức mình đã có, và siết chặt thêm vòng lặp phản hồi.',
        },
        {
          id: 't2l4-q4',
          kind: 'input',
          tags: ['nhan', 'ma-doc'],
          q: 'Công cụ mã nguồn mở nào thường được dùng để chuẩn hoá tên họ mã độc từ nhiều engine AV thành một nhãn họ thống nhất?',
          accept: ['avclass', 'av class', 'avclass2', 'avclass 2'],
          placeholder: 'Tên công cụ…',
          hint: 'Tên ghép từ hai chữ, công bố tại hội nghị RAID 2016.',
          why: 'AVClass (Sebastián và cộng sự, RAID 2016) và bản kế nhiệm AVClass2 nhận đầu vào là các nhãn thô của nhiều engine rồi trích ra tên họ có khả năng nhất, sau khi loại bỏ tiền tố chung chung như “Trojan” hay “Generic”. Điều này quan trọng vì mỗi engine đặt tên theo quy ước riêng, và nếu bạn lấy nhãn họ từ một engine bất kỳ, bạn thực chất đang huấn luyện mô hình bắt chước cách đặt tên của engine đó.',
        },
        {
          id: 't2l4-q5',
          kind: 'truefalse',
          tags: ['active-learning'],
          q: 'Trong học chủ động cho bảo mật, chỉ nên gắn nhãn những mẫu mà mô hình phân vân nhất, vì chúng mang nhiều thông tin nhất.',
          answer: false,
          why: 'Đúng về lý thuyết thông tin, sai trong thực tế bảo mật. Nếu hàng đợi gắn nhãn chỉ chứa mẫu quanh ranh giới quyết định hiện tại, bạn không bao giờ lấy mẫu ở những vùng mà mô hình **tự tin nhưng sai** — đúng nơi các họ tấn công mới xuất hiện. Thực hành tốt là trộn: phần lớn theo độ phân vân, một phần cố định lấy ngẫu nhiên, và một phần lấy theo tính đa dạng để phủ các vùng chưa từng thăm.',
        },
      ],
      terms: ['nhan', 'nhan-ban', 'weak-supervision', 'active-learning', 'pu-learning', 'virustotal', 'avclass', 'sandbox'],
      further: [
        {
          title: 'AVclass: A Tool for Massive Malware Labeling — Sebastián, Rivera, Kotzias, Caballero (RAID 2016)',
          note: 'Bài báo và công cụ chuẩn hoá tên họ mã độc. Đọc để hiểu vì sao nhãn họ lấy từ một engine là không dùng được.',
        },
        {
          title: 'Snorkel — Programmatic Labeling',
          note: 'Khung giám sát yếu phổ biến nhất. Phần lý thuyết về mô hình hợp nhất phiếu đáng đọc kể cả khi bạn tự cài đặt.',
        },
        {
          title: 'Atomic Red Team (Red Canary)',
          note: 'Thư viện kịch bản mô phỏng kỹ thuật ATT&CK. Cách rẻ nhất để tạo nhãn dương chuẩn xác trong môi trường của chính bạn.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't2-l5',
      trackId: 'du-lieu',
      title: 'Bộ dữ liệu chuẩn và cạm bẫy của chúng',
      subtitle: 'Sáu bộ dữ liệu bạn chắc chắn sẽ gặp, và vấn đề thật của từng bộ',
      minutes: 19,
      practiceMinutes: 3,
      level: 'trung-cap',
      prereqs: ['t2-l1'],
      why: {
        short:
          'Phần lớn con số hiệu năng ấn tượng bạn đọc được đến từ vài bộ dữ liệu công khai có khiếm khuyết đã được ghi nhận — biết khiếm khuyết đó giúp bạn không tin nhầm và không lặp lại.',
        scenario:
          'Một nhà cung cấp trình bày mô hình đạt F1 = 0,997 trên CIC-IDS2017 và đề nghị bạn ký hợp đồng. Bạn có 5 phút để đặt ra câu hỏi khiến con số đó lộ nguyên hình.',
        roles: ['Security Data Scientist', 'Detection Engineer', 'Security Architect', 'ML Engineer'],
        costOfNotKnowing:
          'Bạn dành sáu tháng tối ưu mô hình trên một bộ dữ liệu mô phỏng từ năm 1998, đạt 99,9%, rồi triển khai vào mạng thật và thấy nó vô dụng — mà không hiểu vì sao.',
      },
      objectives: [
        'Mô tả nội dung, quy mô và mục đích gốc của sáu bộ dữ liệu chuẩn',
        'Nêu đúng khiếm khuyết đã được ghi nhận của từng bộ',
        'Phân biệt ba trường hợp dùng bộ dữ liệu công khai là hợp lý và ba trường hợp không',
        'Đặt được câu hỏi kiểm chứng khi ai đó báo cáo kết quả trên benchmark công khai',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Một mô hình cây quyết định đơn giản đạt độ chính xác 99,8% trên NSL-KDD sau ba phút huấn luyện, không cần tinh chỉnh gì. Điều đó nói lên gì về mô hình, và nói lên gì về bộ dữ liệu?',
          reveal:
            'Về mô hình: gần như không nói gì cả. Về bộ dữ liệu: nói rất nhiều. Khi một bài toán bị giải gần hoàn hảo bởi mô hình đơn giản nhất, khả năng cao là **bài toán đó đã bị rò rỉ hoặc quá dễ**, chứ không phải mô hình xuất sắc. KDD99 và hậu duệ NSL-KDD được sinh từ lưu lượng mô phỏng của phòng thí nghiệm Lincoln năm 1998; các nghiên cứu sau đó chỉ ra dữ liệu chứa **tạo tác mô phỏng** — ví dụ giá trị TTL và một số thuộc tính tầng thấp phân biệt được lưu lượng tấn công với lưu lượng nền mà không cần biết gì về tấn công. Mô hình học đúng tạo tác đó. Đây chính là hiện tượng tương quan giả bạn gặp ở chặng 0, nhưng ở quy mô một benchmark được cả ngành dùng suốt hai thập kỷ.',
        },
        {
          t: 'table',
          head: ['Bộ dữ liệu', 'Năm', 'Nội dung', 'Quy mô', 'Còn dùng được cho việc gì'],
          rows: [
            ['KDD Cup 1999 / NSL-KDD', '1999 / 2009', 'Bản ghi kết nối mạng 41 đặc trưng, sinh từ mô phỏng DARPA 1998', 'KDD99 khoảng 4,9 triệu bản ghi; NSL-KDD 125.973 huấn luyện và 22.544 kiểm tra', 'Chỉ nên dùng để kiểm tra code chạy được, không dùng để kết luận về hiệu năng'],
            ['CIC-IDS2017 / CSE-CIC-IDS2018', '2018', 'Luồng mạng gán nhãn, 80+ đặc trưng từ CICFlowMeter, nhiều loại tấn công', 'IDS2017 khoảng 2,8 triệu luồng trong 5 ngày; bản 2018 lớn hơn nhiều, chạy trên AWS', 'So sánh thuật toán trên cùng nền, nếu dùng bản đã sửa lỗi nhãn'],
            ['UNSW-NB15', '2015', 'Luồng mạng 49 đặc trưng, 9 họ tấn công, nền do IXIA PerfectStorm sinh', 'Khoảng 2,54 triệu bản ghi; phân hoạch sẵn 175.341 huấn luyện và 82.332 kiểm tra', 'Thay thế hiện đại hơn cho KDD99, vẫn phải tự chia lại tập'],
            ['EMBER', '2018', 'Vector đặc trưng tĩnh của tệp PE (không kèm tệp gốc), kèm mốc thời gian xuất hiện', 'Khoảng 1,1 triệu mẫu, vector 2.351 chiều ở phiên bản đầu; bản 2018 khó hơn', 'Nghiên cứu phân loại mã độc tĩnh, và là chuẩn so sánh phổ biến nhất'],
            ['SOREL-20M', '2020', 'Khoảng 20 triệu mẫu PE với đặc trưng kiểu EMBER, metadata và thẻ hành vi', 'Rất lớn; có kèm tệp mã độc đã vô hiệu hoá, không có tệp lành', 'Huấn luyện quy mô lớn; không phù hợp cho mô hình đọc byte thô của cả hai lớp'],
            ['CTU-13', '2014', 'Mười ba kịch bản botnet thật trộn với lưu lượng nền thật của một trường đại học', 'Hàng chục triệu luồng, nhãn Botnet / Normal / Background', 'Nghiên cứu phát hiện botnet, nếu chia tập theo kịch bản'],
          ],
        },
        { t: 'h', text: 'Vấn đề thật của từng bộ', level: 2 },
        {
          t: 'figure',
          id: 'fig-dataset-age',
          caption:
            'Mỗi bộ dữ liệu đóng băng ở năm nó được tạo, còn hạ tầng bạn bảo vệ thì không đứng yên. Dùng chúng để học cách làm và để so sánh thuật toán thì tốt; lấy điểm số trên chúng đi hứa với ban lãnh đạo thì không.',
        },
        {
          t: 'steps',
          title: 'Đọc kỹ trước khi trích dẫn bất kỳ kết quả nào',
          steps: [
            {
              title: 'KDD Cup 1999 và NSL-KDD',
              md: 'KDD99 sinh từ dữ liệu mô phỏng DARPA 1998. Vấn đề đã ghi nhận: **trùng lặp khổng lồ** — Tavallaee và cộng sự (2009) báo cáo khoảng 78% bản ghi trong tập huấn luyện và 75% trong tập kiểm tra là trùng lặp, khiến mô hình bị thiên về các bản ghi lặp nhiều. NSL-KDD sửa đúng vấn đề trùng lặp đó, nhưng **không sửa được nguồn gốc**: giao thức của năm 1998, không có HTTPS, không có đám mây, không có kênh C2 hiện đại, và các tạo tác mô phỏng vẫn còn nguyên.\n\n**Kết luận:** một kết quả trên NSL-KDD năm 2026 không nói được gì về năng lực phát hiện trong mạng thật.',
            },
            {
              title: 'CIC-IDS2017 và CSE-CIC-IDS2018',
              md: 'Hiện đại hơn nhiều và được dùng rộng rãi. Nhưng nghiên cứu kiểm định độc lập — nổi bật là Engelen, Rimmer và Joosen (2021) — đã tìm ra **lỗi trong công cụ trích xuất luồng CICFlowMeter và lỗi gán nhãn**, khiến một phần lưu lượng tấn công bị gán là lành và ngược lại. Các nhóm sau đó đã phát hành bản sửa.\n\nHai bẫy rò rỉ riêng của bộ này: **(1)** mỗi loại tấn công diễn ra trong một ngày cụ thể, nên bất kỳ đặc trưng nào tương quan với ngày cũng trở thành đường tắt tới nhãn; **(2)** trường cổng đích một mình phân biệt được nhiều lớp tấn công, và nhiều bài báo vô tình để nó trong tập đặc trưng.',
            },
            {
              title: 'UNSW-NB15',
              md: 'Hiện đại hơn KDD99 và có nhiều họ tấn công đa dạng, nhưng lưu lượng nền do công cụ IXIA sinh ra chứ không phải lưu lượng người thật. Vấn đề lớn nhất về phương pháp: **phân hoạch huấn luyện/kiểm tra kèm theo bộ dữ liệu được lấy từ cùng một đợt thu thập theo kiểu ngẫu nhiên**, nên các bản ghi gần trùng nhau nằm ở cả hai phía. Nếu bạn dùng đúng phân hoạch đó, con số của bạn lạc quan một cách có hệ thống. Lớp Generic đặc biệt dễ tách, kéo mọi chỉ số trung bình lên cao.',
            },
            {
              title: 'EMBER',
              md: 'Bộ dữ liệu mã độc tĩnh được trích dẫn nhiều nhất (Anderson và Roth, 2018). Điểm mạnh lớn: có trường thời điểm mẫu xuất hiện, nên bạn **chia tập theo thời gian được** — hiếm có trong lĩnh vực này.\n\nGiới hạn phải biết: bộ dữ liệu cung cấp **vector đặc trưng, không phải tệp gốc**, nên bạn bị khoá vào đúng tập đặc trưng mà tác giả chọn và không thử được biểu diễn mới. Nhãn được suy ra từ đồng thuận đa engine nên thừa hưởng mọi vấn đề của bài trước. Việc trích xuất đặc trưng phụ thuộc phiên bản thư viện phân tích PE, gây khó khăn khi tái lập.',
            },
            {
              title: 'SOREL-20M',
              md: 'Quy mô khoảng 20 triệu mẫu PE do Sophos và ReversingLabs công bố (2020), kèm đặc trưng, metadata và thẻ mô tả hành vi. Đây là bộ lớn nhất công khai cho mã độc PE.\n\nGiới hạn quyết định cách bạn dùng nó: **có tệp mã độc đã vô hiệu hoá nhưng không có tệp lành** (vì lý do bản quyền). Nghĩa là bạn không thể huấn luyện mô hình đọc byte thô cho cả hai lớp — chỉ làm được với vector đặc trưng đi kèm. Ngoài ra dung lượng rất lớn, hãy tính chi phí hạ tầng trước khi tải.',
            },
            {
              title: 'CTU-13',
              md: 'Điểm mạnh hiếm có: lưu lượng botnet **thật** trộn với lưu lượng nền **thật** của một mạng đại học, do Stratosphere Lab công bố (Garcia và cộng sự, 2014).\n\nHai cạm bẫy: **(1)** nhãn `Background` nghĩa là “chưa xác minh”, không có nghĩa là “lành tính” — rất nhiều bài báo gộp Background vào lớp âm và tự tạo nhiễu nhãn cho mình; **(2)** mỗi kịch bản thường chỉ có một họ botnet và một vài máy nhiễm, nên chia ngẫu nhiên khiến các luồng của cùng một máy nhiễm nằm ở cả hai phía. Bắt buộc chia **theo kịch bản**: huấn luyện trên một số kịch bản, kiểm tra trên kịch bản khác.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bốn dấu hiệu cho biết bạn đang đo ảo',
          md: '**(1)** Mô hình đơn giản nhất đã đạt trên 99% — gần như luôn là rò rỉ hoặc bài toán quá dễ.\n\n**(2)** Chia tập ngẫu nhiên trên dữ liệu có tính thời gian hoặc có nhóm tự nhiên (họ mã độc, kịch bản, người dùng).\n\n**(3)** Tỉ lệ lớp trong tập kiểm tra không giống thực tế — nhiều bộ có 20% lưu lượng là tấn công, trong khi mạng thật là một phần triệu.\n\n**(4)** Báo cáo chỉ có accuracy và ROC-AUC, không có precision ở mức recall cụ thể và không có số cảnh báo giả tuyệt đối mỗi ngày.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't2l5-cp1',
              kind: 'mcq',
              tags: ['bo-du-lieu', 'ro-ri-du-lieu'],
              q: 'Bạn dùng CTU-13 và chia ngẫu nhiên 80/20 tất cả các luồng. Vấn đề lớn nhất là gì?',
              options: [
                'Tập kiểm tra quá nhỏ để có ý nghĩa thống kê',
                'Các luồng của cùng một máy nhiễm và cùng một họ botnet nằm ở cả hai phía, nên mô hình chỉ cần nhận ra máy đó',
                'Bộ dữ liệu quá cũ nên giao thức đã lỗi thời',
                'Nhãn Background chiếm quá ít nên mất cân bằng',
              ],
              answer: 1,
              why: 'Đây là rò rỉ theo nhóm. Mỗi kịch bản CTU-13 chỉ có vài máy nhiễm; chia ngẫu nhiên khiến hàng nghìn luồng của cùng một máy xuất hiện ở cả hai tập. Mô hình học được đặc điểm riêng của máy đó (địa chỉ, cổng hay dùng, nhịp kết nối) chứ không học được đặc điểm của botnet nói chung, và điểm số cao chỉ phản ánh khả năng nhận diện lại đúng máy đã thấy. Cách đúng là chia theo kịch bản.',
              distractorWhy: [
                '20% của hàng chục triệu luồng là quá đủ về mặt thống kê; vấn đề nằm ở cấu trúc chứ không ở kích thước.',
                '',
                'Tuổi của bộ dữ liệu là hạn chế thật nhưng không phải vấn đề của cách chia tập.',
                'Ngược lại, Background là nhãn chiếm đa số áp đảo trong CTU-13.',
              ],
            },
          ],
        },
        { t: 'h', text: 'Khi nào dùng bộ dữ liệu công khai là hợp lý', level: 2 },
        {
          t: 'compare',
          title: 'Hai mục đích rất khác nhau',
          left: {
            title: 'Dùng được',
            icon: 'check',
            items: [
              'Kiểm tra pipeline của bạn chạy đúng về mặt kỹ thuật',
              'So sánh hai thuật toán trên cùng một nền, khi cả hai chịu chung khiếm khuyết',
              'Học và giảng dạy: có nhãn sẵn, tái lập được, không lộ dữ liệu tổ chức',
              'Tiền huấn luyện biểu diễn rồi tinh chỉnh lại trên dữ liệu của bạn',
            ],
          },
          right: {
            title: 'Không dùng được',
            icon: 'x',
            items: [
              'Ước lượng hiệu năng mà mô hình sẽ đạt trong mạng của bạn',
              'Chọn ngưỡng vận hành — tỉ lệ lớp hoàn toàn khác thực tế',
              'Chứng minh với ban lãnh đạo rằng sản phẩm sẽ hiệu quả',
              'Kết luận thuật toán A tốt hơn B khi chỉ có một bộ dữ liệu duy nhất',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Bộ dữ liệu tốt nhất là bộ bạn tự tạo',
          md: 'Công thức khả thi cho hầu hết tổ chức: lấy 30 ngày log thật của chính bạn làm lớp âm (đã chấp nhận rằng nó có lẫn tấn công chưa phát hiện), rồi chạy **Atomic Red Team** hoặc **CALDERA** trong môi trường có kiểm soát để sinh lớp dương với dấu thời gian chính xác. Bạn có ngay một bộ dữ liệu phản ánh đúng hạ tầng, đúng phân bố nền, đúng phiên bản hệ điều hành của mình. Hạn chế cần ghi nhận: hành vi mô phỏng sạch sẽ hơn kẻ tấn công thật, nên đây là cận trên của recall chứ không phải ước lượng không thiên lệch.',
        },
        {
          t: 'p',
          md: 'Nếu bạn muốn dữ liệu quy mô doanh nghiệp có nhãn red team thật, hai nguồn đáng biết: bộ **LANL 2015** của Los Alamos (58 ngày sự kiện xác thực và tiến trình, hơn 1,6 tỉ bản ghi, nhưng chưa tới một nghìn sự kiện được gắn nhãn red team) và **DARPA OpTC**. Riêng tỉ lệ của LANL đã là bài học trực quan nhất về mất cân bằng cực đoan mà bạn sẽ gặp.',
        },
        {
          t: 'p',
          md: 'Một tài liệu đáng đọc trọn vẹn: **TESSERACT** (Pendlebury và cộng sự, USENIX Security 2019). Nhóm tác giả chỉ ra rằng nhiều kết quả phân loại mã độc đã công bố sụp đổ khi áp các ràng buộc thực tế về thời gian và về tỉ lệ lớp, đồng thời đề xuất chỉ số **AUT** để đo hiệu năng ổn định theo thời gian thay vì một con số tại một thời điểm.',
        },
        {
          t: 'checklist',
          title: 'Câu hỏi cần đặt trước khi tin một kết quả trên benchmark',
          items: [
            'Tập kiểm tra được chia theo thời gian, theo nhóm, hay ngẫu nhiên?',
            'Tỉ lệ lớp trong tập kiểm tra là bao nhiêu, và nó cách thực tế mấy bậc độ lớn?',
            'Nhãn đến từ đâu, và tác giả có đo nhiễu nhãn không?',
            'Có đặc trưng nào chỉ tồn tại nhờ cách bộ dữ liệu được tạo ra không (ngày, cổng, thứ tự bản ghi)?',
            'Bộ dữ liệu này có bản sửa lỗi đã công bố không, và tác giả dùng bản nào?',
            'Kết quả có được lặp lại trên ít nhất hai bộ dữ liệu độc lập không?',
          ],
        },
        { t: 'terms', ids: ['kdd99', 'nsl-kdd', 'cic-ids2017', 'unsw-nb15', 'ember', 'sorel-20m', 'ctu-13', 'benchmark'] },
      ],
      keyTakeaways: [
        'KDD99/NSL-KDD sinh từ mô phỏng năm 1998, có tạo tác và trùng lặp nặng — kết quả trên đó không nói gì về mạng thật.',
        'CIC-IDS2017 đã được kiểm định độc lập và phát hiện lỗi trích xuất luồng cùng lỗi gán nhãn; ngày trong tuần và cổng đích là hai đường tắt tới nhãn.',
        'UNSW-NB15 có phân hoạch train/test lấy ngẫu nhiên từ cùng đợt thu thập, nên bản ghi gần trùng nằm ở cả hai phía.',
        'EMBER cho vector đặc trưng chứ không cho tệp gốc; SOREL-20M có mã độc đã vô hiệu hoá nhưng không có tệp lành.',
        'CTU-13 có nhãn Background nghĩa là “chưa xác minh”, và bắt buộc phải chia tập theo kịch bản.',
        'Bộ dữ liệu công khai dùng để so sánh thuật toán và kiểm tra pipeline, không dùng để dự đoán hiệu năng trong mạng của bạn.',
      ],
      cards: [
        {
          id: 't2l5-c1',
          front: 'NSL-KDD sửa được vấn đề gì của KDD99, và KHÔNG sửa được vấn đề gì?',
          back: 'Sửa được trùng lặp bản ghi (khoảng 78% ở tập huấn luyện gốc). Không sửa được nguồn gốc: lưu lượng mô phỏng năm 1998 và các tạo tác của mô phỏng đó.',
          tags: ['bo-du-lieu'],
        },
        {
          id: 't2l5-c2',
          front: 'Hai đường tắt tới nhãn trong CIC-IDS2017 là gì?',
          back: 'Mỗi loại tấn công diễn ra vào một ngày cụ thể (đặc trưng liên quan tới thời gian rò rỉ nhãn), và cổng đích một mình đã phân biệt được nhiều lớp tấn công.',
          tags: ['bo-du-lieu', 'ro-ri-du-lieu'],
        },
        {
          id: 't2l5-c3',
          front: 'Nhãn Background trong CTU-13 có nghĩa là gì?',
          back: 'Nghĩa là “chưa được xác minh”, KHÔNG phải “lành tính”. Gộp nó vào lớp âm là tự tạo nhiễu nhãn.',
          tags: ['bo-du-lieu', 'nhan'],
        },
        {
          id: 't2l5-c4',
          front: 'Vì sao SOREL-20M không dùng được để huấn luyện mô hình đọc byte thô?',
          back: 'Vì bộ dữ liệu có tệp mã độc đã vô hiệu hoá nhưng không có tệp lành, nên bạn thiếu hẳn byte thô của một lớp.',
          tags: ['bo-du-lieu', 'ma-doc'],
        },
        {
          id: 't2l5-c5',
          front: 'Ưu điểm hiếm có của EMBER so với các bộ mã độc khác là gì?',
          back: 'Có trường thời điểm mẫu xuất hiện, cho phép chia tập theo thời gian thay vì chia ngẫu nhiên.',
          tags: ['bo-du-lieu', 'chia-tap'],
        },
      ],
      quiz: [
        {
          id: 't2l5-q1',
          kind: 'mcq',
          tags: ['bo-du-lieu', 'danh-gia'],
          q: 'Nhà cung cấp báo cáo F1 = 0,997 trên CIC-IDS2017. Câu hỏi nào bóc tách con số này hiệu quả nhất?',
          options: [
            'Các anh dùng thuật toán gì?',
            'Các anh chia tập thế nào, và trong tập đặc trưng có cổng đích cùng các trường liên quan tới thời gian không?',
            'Mô hình huấn luyện mất bao lâu?',
            'Các anh dùng bao nhiêu GPU?',
          ],
          answer: 1,
          why: 'Trên CIC-IDS2017, chia ngẫu nhiên cộng với việc giữ cổng đích và trường thời gian trong tập đặc trưng gần như đảm bảo con số rất cao mà không cần mô hình tốt: mỗi tấn công nằm gọn trong một ngày và thường gắn với một cổng. Câu hỏi về thuật toán, thời gian huấn luyện hay phần cứng không chạm tới nguyên nhân gốc — đó đều là câu hỏi mà người trình bày đã chuẩn bị sẵn câu trả lời đẹp.',
          distractorWhy: [
            'Thuật toán gần như không liên quan khi bài toán đã bị rò rỉ; mô hình đơn giản nhất cũng đạt điểm cao.',
            '',
            'Thời gian huấn luyện không nói gì về tính hợp lệ của phép đo.',
            'Phần cứng lại càng không liên quan tới việc con số có đáng tin hay không.',
          ],
        },
        {
          id: 't2l5-q2',
          kind: 'match',
          tags: ['bo-du-lieu'],
          q: 'Nối bộ dữ liệu với khiếm khuyết đặc trưng nhất của nó.',
          pairs: [
            ['KDD99 / NSL-KDD', 'Lưu lượng mô phỏng 1998 kèm tạo tác của mô phỏng'],
            ['CIC-IDS2017', 'Lỗi trích xuất luồng và gán nhãn đã được kiểm định độc lập'],
            ['UNSW-NB15', 'Phân hoạch train/test lấy ngẫu nhiên từ cùng đợt thu thập'],
            ['CTU-13', 'Nhãn Background là chưa xác minh, không phải lành tính'],
          ],
          why: 'Mỗi bộ dữ liệu có một khiếm khuyết đặc trưng, và khiếm khuyết đó quyết định bạn được phép kết luận điều gì từ kết quả chạy trên nó. Nhớ bốn cặp này đủ để bạn đọc phần lớn bài báo về phát hiện xâm nhập với con mắt tỉnh táo.',
        },
        {
          id: 't2l5-q3',
          kind: 'truefalse',
          tags: ['bo-du-lieu', 'thuc-chien'],
          q: 'Mô hình đạt hiệu năng cao trên CIC-IDS2018 là bằng chứng đủ tốt để dự đoán nó sẽ hoạt động tốt trong mạng của tổ chức bạn.',
          answer: false,
          why: 'Phân bố lưu lượng nền của mỗi tổ chức khác nhau rất xa: ứng dụng nội bộ, tỉ lệ dịch vụ đám mây, giờ làm việc, thiết bị đặc thù. Thêm vào đó, tỉ lệ tấn công trong các bộ benchmark thường cao hơn thực tế nhiều bậc độ lớn, nên ngưỡng và precision đo được không chuyển giao. Bộ dữ liệu công khai trả lời câu hỏi “thuật toán này có học được gì không”, không trả lời câu hỏi “nó sẽ hoạt động thế nào ở chỗ tôi”.',
        },
        {
          id: 't2l5-q4',
          kind: 'multi',
          tags: ['bo-du-lieu', 'phuong-phap'],
          q: 'Bạn muốn tạo bộ dữ liệu riêng cho tổ chức mình. Cách làm nào hợp lý? (Chọn tất cả)',
          options: [
            'Dùng 30 ngày log thật làm lớp âm, ghi nhận rõ rằng nó có thể lẫn tấn công chưa phát hiện',
            'Chạy Atomic Red Team trong môi trường có kiểm soát để sinh lớp dương với dấu thời gian chính xác',
            'Ghi lại chính xác phiên bản hệ điều hành, cấu hình audit và thời điểm thu thập',
            'Sao chép lớp âm từ CIC-IDS2017 để tiết kiệm thời gian',
          ],
          answers: [0, 1, 2],
          why: 'Ba việc đầu tạo nên một bộ dữ liệu phản ánh đúng hạ tầng của bạn và có thể tái lập. Việc thứ tư phá hỏng toàn bộ mục đích: lớp âm chính là thứ quyết định mô hình học được ranh giới nào, và lớp âm của một mạng thí nghiệm ở Canada năm 2017 không mô tả mạng của bạn. Trộn lớp dương của bạn với lớp âm của người khác còn tạo ra tương quan giả nguy hiểm — mô hình có thể học cách phân biệt “hai nguồn thu thập” thay vì phân biệt độc/lành.',
        },
      ],
      terms: ['kdd99', 'nsl-kdd', 'cic-ids2017', 'unsw-nb15', 'ember', 'sorel-20m', 'ctu-13', 'benchmark'],
      further: [
        {
          title: 'A Detailed Analysis of the KDD CUP 99 Data Set — Tavallaee và cộng sự (2009)',
          note: 'Bài báo giới thiệu NSL-KDD và liệt kê chi tiết vấn đề trùng lặp của KDD99. Ngắn, đọc trong 20 phút.',
        },
        {
          title: 'Troubleshooting an Intrusion Detection Dataset — Engelen, Rimmer, Joosen (2021)',
          note: 'Kiểm định độc lập CIC-IDS2017, chỉ ra lỗi công cụ và lỗi nhãn. Mẫu mực về cách soi một bộ dữ liệu.',
        },
        {
          title: 'TESSERACT — Pendlebury và cộng sự (USENIX Security 2019)',
          note: 'Vì sao ràng buộc thời gian và tỉ lệ lớp làm sụp đổ nhiều kết quả đã công bố, và chỉ số AUT thay thế.',
        },
        {
          title: 'EMBER — Anderson & Roth (2018)',
          note: 'Bài báo mô tả bộ dữ liệu và tập đặc trưng. Đọc phần trích xuất đặc trưng, nó là mẫu tốt cho đặc trưng PE tĩnh.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't2-l6',
      trackId: 'du-lieu',
      title: 'Rò rỉ dữ liệu và cách chia tập đúng',
      subtitle: 'Vì sao con số đẹp nhất của bạn thường là con số sai nhất',
      minutes: 25,
      practiceMinutes: 11,
      level: 'trung-cap',
      prereqs: ['t2-l5'],
      why: {
        short:
          'Rò rỉ dữ liệu là nguyên nhân số một khiến mô hình đạt 0,99 trong phòng lab và vô dụng khi triển khai — và nó gần như luôn im lặng.',
        scenario:
          'Bạn trình bày mô hình phân loại mã độc đạt AUC 0,995 trước ban lãnh đạo. Ba tháng sau khi triển khai, tỉ lệ phát hiện thật là 61% và bạn phải giải thích chuyện gì đã xảy ra — trong khi mã nguồn không có lỗi nào.',
        roles: ['Security Data Scientist', 'ML Engineer', 'Detection Engineer', 'Security Architect'],
        costOfNotKnowing:
          'Bạn triển khai mô hình dựa trên một con số không có thật, mất niềm tin của tổ chức vào ML, và không bao giờ tìm được nguyên nhân vì mọi thứ trong code đều đúng.',
      },
      objectives: [
        'Định nghĩa rò rỉ dữ liệu bằng một tiêu chí kiểm tra được',
        'Nhận diện năm dạng rò rỉ phổ biến trong dữ liệu bảo mật',
        'Chọn đúng chiến lược chia tập: theo thời gian, theo nhóm, hoặc kết hợp cả hai',
        'Chạy được ba phép kiểm tra phát hiện rò rỉ trước khi công bố bất kỳ con số nào',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bạn có 200.000 tệp PE, chia ngẫu nhiên 80/20, huấn luyện LightGBM và đạt AUC 0,995 trên tập kiểm tra. Hãy nêu ba lý do khiến con số này có thể hoàn toàn ảo — trước khi đọc tiếp.',
          reveal:
            '**(1) Trùng lặp và gần trùng.** Mã độc được đóng gói lại hàng loạt: hàng nghìn mẫu là cùng một payload với lớp đóng gói khác nhau. Chia ngẫu nhiên đặt các anh em sinh đôi ở cả hai phía, và mô hình chỉ cần nhận ra thứ nó đã thấy.\n\n**(2) Rò rỉ theo thời gian.** Mẫu của tháng 6 nằm trong tập huấn luyện, mẫu của tháng 3 nằm trong tập kiểm tra. Mô hình được nhìn tương lai — điều không bao giờ xảy ra khi triển khai.\n\n**(3) Rò rỉ theo nhóm.** Một họ mã độc có 8.000 biến thể, chúng rải đều hai tập. Mô hình học nhận diện họ đó, không học nhận diện mã độc nói chung. Với họ mới xuất hiện tháng sau, nó mù hoàn toàn.\n\nBa nguyên nhân này chồng lên nhau, và cùng nhau chúng giải thích phần lớn khoảng cách giữa kết quả nghiên cứu và kết quả vận hành trong toàn ngành.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Định nghĩa duy nhất bạn cần nhớ',
          md: '**Rò rỉ dữ liệu là khi thông tin có mặt lúc huấn luyện nhưng KHÔNG có mặt lúc ra quyết định trong thực tế.**\n\nBiến định nghĩa này thành một câu hỏi kiểm tra được, hỏi cho từng đặc trưng: *“Tại đúng thời điểm mô hình phải quyết định trong sản xuất, giá trị này đã tồn tại và lấy được chưa?”* Nếu câu trả lời là chưa hoặc không chắc, đó là rò rỉ. Không có ngoại lệ.',
        },
        { t: 'h', text: 'Năm dạng rò rỉ, xếp theo tần suất gặp trong bảo mật', level: 2 },
        {
          t: 'steps',
          title: 'Nhận diện và xử lý',
          steps: [
            {
              title: '1. Rò rỉ theo thời gian',
              md: 'Chia ngẫu nhiên dữ liệu vốn có trục thời gian. Mô hình học được các họ, hạ tầng và kỹ thuật của tương lai rồi bị kiểm tra trên quá khứ.\n\n**Dấu hiệu:** khoảng cách lớn giữa điểm số khi chia ngẫu nhiên và khi chia theo thời gian.\n\n**Xử lý:** luôn chia theo mốc thời gian. Huấn luyện trên khoảng trước, kiểm định trên khoảng giữa, kiểm tra trên khoảng sau — và không bao giờ đảo ngược.',
            },
            {
              title: '2. Rò rỉ do trùng lặp và gần trùng',
              md: 'Cùng một đối tượng xuất hiện ở cả hai tập dưới dạng hơi khác. Trong bảo mật đây là mặc định chứ không phải ngoại lệ: mã độc được đóng gói lại, log bị gửi lại, cùng một chiến dịch phishing gửi cho 5.000 hộp thư.\n\n**Xử lý:** khử trùng lặp trước khi chia. Trùng tuyệt đối theo hash nội dung; gần trùng theo `imphash`, hash mờ như **TLSH** hoặc **ssdeep**, hoặc MinHash cho văn bản và URL. Sau đó chia theo **cụm**, không theo mẫu.',
            },
            {
              title: '3. Rò rỉ theo nhóm',
              md: 'Các mẫu không độc lập vì cùng thuộc một nhóm tự nhiên: cùng họ mã độc, cùng chiến dịch, cùng người dùng, cùng máy, cùng kịch bản thu thập. Nếu nhóm bị cắt đôi giữa hai tập, mô hình chỉ cần nhận ra nhóm.\n\n**Xử lý:** `GroupKFold` hoặc `StratifiedGroupKFold` với khoá nhóm là họ, chiến dịch, hoặc người dùng. Câu hỏi định hướng: *“Đơn vị mà tôi muốn mô hình tổng quát hoá sang là gì?”* Đơn vị đó chính là nhóm.',
            },
            {
              title: '4. Rò rỉ tiền xử lý',
              md: 'Bạn chuẩn hoá, chọn đặc trưng, giảm chiều, hoặc cân bằng lớp **trước khi** chia tập. Thống kê của tập kiểm tra rò vào tập huấn luyện.\n\nTrường hợp nặng nhất và hay gặp nhất trong bảo mật: chạy SMOTE hoặc oversampling trên toàn bộ dữ liệu rồi mới chia — bản sao của cùng một mẫu nằm ở cả hai phía và điểm số nhảy vọt vô nghĩa.\n\n**Xử lý:** gói mọi bước biến đổi vào `Pipeline` của scikit-learn và chỉ `fit` bên trong vòng lặp chia tập.',
            },
            {
              title: '5. Rò rỉ đích',
              md: 'Một đặc trưng thực chất chứa câu trả lời, thường vì nó được tạo ra **sau** khi sự việc đã được kết luận. Danh sách nghi phạm trong bảo mật: `av_detection_name`, `quarantined`, `vt_positives`, `ticket_close_reason`, `analyst_assigned`, `incident_severity`, thậm chí cả tên tệp đã bị công cụ đổi thành dạng cách ly.\n\n**Xử lý:** với mỗi đặc trưng, truy ngược xem trường đó được ghi vào lúc nào trong dòng thời gian. Nếu nó được ghi sau thời điểm ra quyết định, loại bỏ.',
            },
          ],
        },
        {
          t: 'figure',
          id: 'fig-split-temporal',
          caption: 'Chia ngẫu nhiên trộn quá khứ và tương lai vào cả hai tập; chia theo thời gian giữ đúng chiều nhân quả mà mô hình sẽ gặp khi triển khai.',
        },
        { t: 'h', text: 'Bốn cách chia và khi nào dùng', level: 2 },
        {
          t: 'table',
          head: ['Cách chia', 'Khi nào dùng', 'Khi nào SAI', 'Công cụ'],
          rows: [
            [
              'Ngẫu nhiên (phân tầng)',
              'Dữ liệu thật sự độc lập cùng phân phối, không có trục thời gian hay nhóm',
              'Gần như mọi bài toán bảo mật thật',
              'train_test_split, StratifiedKFold',
            ],
            [
              'Theo thời gian',
              'Mặc định cho mọi bài toán bảo mật: mã độc, xâm nhập, phishing, xếp hạng cảnh báo',
              'Khi dữ liệu không có mốc thời gian đáng tin',
              'Cắt theo mốc, hoặc TimeSeriesSplit',
            ],
            [
              'Theo nhóm',
              'Có nhóm tự nhiên: họ mã độc, chiến dịch, người dùng, máy, kịch bản',
              'Khi nhóm được định nghĩa bằng chính thông tin không có lúc suy luận',
              'GroupKFold, StratifiedGroupKFold',
            ],
            [
              'Thời gian + nhóm',
              'Chuẩn vàng cho mã độc và phát hiện chiến dịch: chia theo mốc thời gian rồi khử nhóm cắt ngang mốc',
              'Hiếm khi sai; chỉ tốn công hơn',
              'Cắt theo mốc rồi lọc thủ công các nhóm nằm hai bên',
            ],
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Chia theo thời gian, và Pipeline để tiền xử lý không rò rỉ',
          code:
            "import numpy as np\n" +
            "from sklearn.pipeline import Pipeline\n" +
            "from sklearn.preprocessing import StandardScaler\n" +
            "from sklearn.linear_model import LogisticRegression\n" +
            "from sklearn.metrics import average_precision_score\n" +
            "\n" +
            "# --- SAI: chuẩn hoá trước khi chia, thống kê tập kiểm tra rò vào huấn luyện ---\n" +
            "# X = StandardScaler().fit_transform(X)\n" +
            "\n" +
            "# --- ĐÚNG: gói mọi biến đổi vào Pipeline, nó chỉ fit trên phần huấn luyện ---\n" +
            "pipe = Pipeline([\n" +
            "    ('scale', StandardScaler()),\n" +
            "    ('clf', LogisticRegression(max_iter=1000, class_weight='balanced')),\n" +
            "])\n" +
            "\n" +
            "# Chia theo THỜI GIAN: huấn luyện trên quá khứ, kiểm tra trên tương lai\n" +
            "df = df.sort_values('first_seen')\n" +
            "moc_train = df['first_seen'].quantile(0.70)\n" +
            "moc_val = df['first_seen'].quantile(0.85)\n" +
            "\n" +
            "train = df[df['first_seen'] <= moc_train]\n" +
            "val = df[(df['first_seen'] > moc_train) & (df['first_seen'] <= moc_val)]\n" +
            "test = df[df['first_seen'] > moc_val]\n" +
            "print('train/val/test:', len(train), len(val), len(test))\n" +
            "\n" +
            "pipe.fit(train[FEATS], train['y'])\n" +
            "diem = pipe.predict_proba(test[FEATS])[:, 1]\n" +
            "print('Average precision trên tương lai:', average_precision_score(test['y'], diem))\n",
        },
        {
          t: 'code',
          lang: 'python',
          collapsed: true,
          caption: 'Chia theo nhóm khi có họ mã độc hoặc chiến dịch',
          code:
            "from sklearn.model_selection import StratifiedGroupKFold\n" +
            "\n" +
            "# Nhóm = đơn vị mà bạn muốn mô hình tổng quát hoá SANG.\n" +
            "# Với mã độc: họ. Với UEBA: người dùng. Với CTU-13: kịch bản.\n" +
            "groups = df['family'].fillna(df['sha256'])   # mẫu không rõ họ tự thành một nhóm riêng\n" +
            "\n" +
            "cv = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)\n" +
            "diem_fold = []\n" +
            "for tr, te in cv.split(df[FEATS], df['y'], groups=groups):\n" +
            "    pipe.fit(df[FEATS].iloc[tr], df['y'].iloc[tr])\n" +
            "    p = pipe.predict_proba(df[FEATS].iloc[te])[:, 1]\n" +
            "    diem_fold.append(average_precision_score(df['y'].iloc[te], p))\n" +
            "\n" +
            "print('AP theo fold:', np.round(diem_fold, 3))\n" +
            "print('Trung bình:', np.mean(diem_fold), '| Độ lệch chuẩn:', np.std(diem_fold))\n" +
            "# Độ lệch chuẩn lớn giữa các fold là tín hiệu: mô hình phụ thuộc mạnh vào việc\n" +
            "# họ nào rơi vào tập huấn luyện -> khả năng tổng quát hoá sang họ mới còn yếu.\n",
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't2l6-cp1',
              kind: 'mcq',
              tags: ['ro-ri-du-lieu', 'chia-tap'],
              q: 'Bạn xây mô hình xếp hạng cảnh báo, huấn luyện trên lịch sử ticket. Đặc trưng nào chắc chắn là rò rỉ đích?',
              options: [
                'Loại luật đã sinh ra cảnh báo',
                'Số cảnh báo cùng loại trên cùng máy trong 24 giờ trước đó',
                'Tên analyst được giao xử lý cảnh báo',
                'Giờ trong ngày khi cảnh báo được sinh ra',
              ],
              answer: 2,
              why: 'Analyst chỉ được giao **sau** khi cảnh báo đã qua bước phân loại ban đầu, và việc giao cho ai thường phản ánh mức nghiêm trọng đã được đánh giá. Tại thời điểm mô hình phải xếp hạng — ngay khi cảnh báo vừa sinh ra — trường này còn rỗng. Ba đặc trưng còn lại đều tồn tại ngay tại thời điểm cảnh báo được tạo, nên hợp lệ.',
              distractorWhy: [
                'Loại luật có ngay khi cảnh báo được sinh ra, hoàn toàn hợp lệ.',
                'Đây là đặc trưng lịch sử tính từ quá khứ, hợp lệ nếu cửa sổ chỉ nhìn về trước.',
                '',
                'Thời điểm sinh cảnh báo có sẵn tức thì.',
              ],
            },
            {
              id: 't2l6-cp2',
              kind: 'truefalse',
              tags: ['ro-ri-du-lieu'],
              q: 'Chạy SMOTE để cân bằng lớp trên toàn bộ dữ liệu rồi mới chia train/test là cách làm chấp nhận được nếu tỉ lệ mất cân bằng quá lớn.',
              answer: false,
              why: 'SMOTE tạo mẫu tổng hợp bằng cách nội suy giữa các mẫu thiểu số gần nhau. Làm trước khi chia nghĩa là một mẫu tổng hợp trong tập kiểm tra có thể được nội suy từ chính các mẫu nằm trong tập huấn luyện — mô hình đang được kiểm tra trên bản sao pha loãng của thứ nó đã học. Quy tắc cứng: **mọi phép biến đổi học từ dữ liệu, kể cả lấy mẫu lại, đều phải nằm bên trong Pipeline và chỉ áp dụng lên phần huấn luyện.** Tập kiểm tra phải giữ nguyên tỉ lệ lớp thật.',
            },
          ],
        },
        {
          t: 'lab',
          id: 'lab-split',
          intro:
            'Cùng một mô hình, cùng một kho mẫu, ba cách chia tập — và ba con số khác hẳn nhau: 96%, 59%, 52%. Hãy để ý cách chia ngẫu nhiên: nó không sai về số học, nó chỉ đang trả lời một câu hỏi mà không ai hỏi. Rồi kéo "mức giống nhau trong cùng chiến dịch" xuống hết và xem ba con số hội tụ — đó là lý do rò rỉ gần như vô hình trên dữ liệu đồ chơi mà lại tàn phá trên dữ liệu bảo mật thật.',
        },
        { t: 'h', text: 'Ba phép kiểm tra rò rỉ nên chạy trước khi tin bất kỳ con số nào', level: 2 },
        {
          t: 'list',
          ordered: true,
          items: [
            '**So sánh chia ngẫu nhiên và chia theo thời gian.** Chạy cả hai. Nếu chia ngẫu nhiên cho AUC 0,99 còn chia theo thời gian cho 0,82, con số thật gần với 0,82 hơn — và khoảng cách 0,17 chính là lượng rò rỉ bạn đang có.',
            '**Xáo nhãn.** Xáo ngẫu nhiên nhãn của tập huấn luyện rồi huấn luyện lại. Hiệu năng trên tập kiểm tra **phải** sụp về mức ngẫu nhiên. Nếu vẫn cao đáng kể, có rò rỉ qua cấu trúc dữ liệu — thường là trùng lặp hoặc thứ tự bản ghi.',
            '**Soi đặc trưng quan trọng nhất.** Nhìn năm đặc trưng có độ quan trọng cao nhất và hỏi từng cái: giá trị này có sẵn tại thời điểm quyết định không? Rò rỉ đích gần như luôn nằm ở đỉnh bảng, vì nó chứa chính câu trả lời.',
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Phép kiểm tra xáo nhãn và phát hiện trùng lặp trước khi chia',
          code:
            "# --- Kiểm tra 1: xáo nhãn, điểm số PHẢI sụp ---\n" +
            "y_xao = np.random.RandomState(0).permutation(train['y'].values)\n" +
            "pipe.fit(train[FEATS], y_xao)\n" +
            "p = pipe.predict_proba(test[FEATS])[:, 1]\n" +
            "print('AP sau khi xáo nhãn:', average_precision_score(test['y'], p))\n" +
            "print('Tỉ lệ lớp dương (mức tham chiếu):', test['y'].mean())\n" +
            "\n" +
            "# --- Kiểm tra 2: kích thước dữ liệu THẬT sau khi gộp gần trùng ---\n" +
            "# imphash gộp các mẫu có cùng bảng import; tlsh_cluster gộp theo hash mờ\n" +
            "nhom = (df['tlsh_cluster']\n" +
            "          .fillna(df['imphash'])\n" +
            "          .fillna(df['sha256']))\n" +
            "print('Số mẫu:', len(df), '| Số nhóm độc lập:', nhom.nunique())\n" +
            "print('Hệ số phồng:', round(len(df) / nhom.nunique(), 1), 'lần')\n" +
            "\n" +
            "# --- Kiểm tra 3: có mẫu nào xuất hiện ở CẢ hai tập không ---\n" +
            "chung = set(train['sha256']) & set(test['sha256'])\n" +
            "assert not chung, f'Có {len(chung)} mẫu nằm ở cả train và test'\n",
        },
        {
          t: 'lab',
          id: 'lab-overfit',
          intro: 'Vặn độ phức tạp mô hình và cách chia tập, xem khoảng cách giữa điểm huấn luyện và điểm kiểm tra biến đổi ra sao.',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Rò rỉ chậm: tập kiểm tra bị bào mòn',
          md: 'Bạn chia tập đúng chuẩn. Rồi bạn thử 40 cấu hình siêu tham số, mỗi lần đều nhìn điểm trên tập kiểm tra để quyết định thử tiếp cái gì. Sau 40 lần, tập kiểm tra không còn là tập kiểm tra nữa — bạn đã tối ưu vào nó bằng chính bộ não của mình.\n\n**Quy tắc:** dùng tập kiểm định (validation) cho mọi quyết định, và **chỉ chạm vào tập kiểm tra một lần**, ở cuối cùng, để báo cáo. Với bảo mật còn có lựa chọn tốt hơn: giữ một tập kiểm tra hoàn toàn mới theo thời gian — dữ liệu của tháng sau — vì bạn không thể tối ưu vào thứ chưa tồn tại.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Quy tắc ngón tay cái',
          md: 'Nếu kết quả đẹp hơn bạn kỳ vọng, khả năng cao nhất không phải là bạn giỏi mà là bạn đang rò rỉ. Hãy dành 30 phút đi tìm rò rỉ **trước khi** báo cáo. Ba mươi phút đó rẻ hơn rất nhiều so với việc rút lại một con số đã trình bày trước ban lãnh đạo.',
        },
        {
          t: 'checklist',
          title: 'Danh sách kiểm tra rò rỉ — chạy trước mỗi lần báo cáo kết quả',
          items: [
            'Với mọi đặc trưng: giá trị này đã tồn tại tại thời điểm ra quyết định trong sản xuất chưa?',
            'Tập kiểm tra nằm hoàn toàn sau tập huấn luyện trên trục thời gian?',
            'Đã khử trùng lặp tuyệt đối và gần trùng TRƯỚC khi chia?',
            'Không có nhóm tự nhiên nào (họ, chiến dịch, người dùng, máy) bị cắt đôi giữa hai tập?',
            'Mọi bước tiền xử lý và lấy mẫu lại nằm trong Pipeline, chỉ fit trên phần huấn luyện?',
            'Tập kiểm tra giữ nguyên tỉ lệ lớp thật, không bị cân bằng nhân tạo?',
            'Phép xáo nhãn có làm điểm số sụp về mức ngẫu nhiên không?',
            'Bạn đã nhìn tập kiểm tra bao nhiêu lần trong quá trình phát triển?',
          ],
        },
        { t: 'terms', ids: ['ro-ri-du-lieu', 'chia-theo-thoi-gian', 'group-split', 'target-leakage', 'imphash', 'tlsh', 'holdout'] },
      ],
      keyTakeaways: [
        'Rò rỉ dữ liệu = thông tin có lúc huấn luyện nhưng không có lúc ra quyết định thật. Kiểm tra từng đặc trưng bằng đúng câu hỏi đó.',
        'Năm dạng: theo thời gian, do trùng lặp/gần trùng, theo nhóm, tiền xử lý, và rò rỉ đích.',
        'Chia theo thời gian là mặc định cho mọi bài toán bảo mật; chia theo nhóm khi có họ mã độc, chiến dịch hoặc người dùng; tốt nhất là kết hợp cả hai.',
        'Mọi phép biến đổi học từ dữ liệu — chuẩn hoá, chọn đặc trưng, SMOTE — phải nằm trong Pipeline và chỉ fit trên phần huấn luyện.',
        'Ba phép kiểm tra: so sánh chia ngẫu nhiên với chia theo thời gian, xáo nhãn, và soi năm đặc trưng quan trọng nhất.',
        'Tập kiểm tra bị bào mòn khi bạn nhìn nó nhiều lần; hãy quyết định trên tập kiểm định và chạm tập kiểm tra đúng một lần.',
      ],
      cards: [
        {
          id: 't2l6-c1',
          front: 'Định nghĩa rò rỉ dữ liệu bằng một câu kiểm tra được.',
          back: 'Thông tin có mặt lúc huấn luyện nhưng không có mặt lúc ra quyết định trong sản xuất. Kiểm tra: tại thời điểm mô hình phải quyết định, giá trị này đã tồn tại chưa?',
          tags: ['ro-ri-du-lieu'],
        },
        {
          id: 't2l6-c2',
          front: 'Vì sao chạy SMOTE trước khi chia train/test là sai?',
          back: 'Vì mẫu tổng hợp trong tập kiểm tra được nội suy từ các mẫu nằm trong tập huấn luyện, nên mô hình bị kiểm tra trên bản sao của thứ nó đã học.',
          tags: ['ro-ri-du-lieu', 'mat-can-bang'],
        },
        {
          id: 't2l6-c3',
          front: 'Phép kiểm tra xáo nhãn dùng để phát hiện gì, và kết quả mong đợi là gì?',
          back: 'Phát hiện rò rỉ qua cấu trúc dữ liệu. Sau khi xáo nhãn tập huấn luyện, điểm số trên tập kiểm tra phải sụp về mức ngẫu nhiên; nếu vẫn cao thì có rò rỉ.',
          tags: ['ro-ri-du-lieu', 'kiem-tra'],
        },
        {
          id: 't2l6-c4',
          front: 'Khi chia theo nhóm, làm sao xác định đâu là “nhóm”?',
          back: 'Nhóm là đơn vị bạn muốn mô hình tổng quát hoá SANG: họ mã độc, chiến dịch, người dùng, máy, hoặc kịch bản thu thập.',
          tags: ['chia-tap'],
        },
        {
          id: 't2l6-c5',
          front: 'Nêu ba đặc trưng điển hình gây rò rỉ đích trong dữ liệu SOC.',
          back: 'Tên analyst được giao, lý do đóng ticket, và mức nghiêm trọng đã được gán — cả ba đều được ghi sau khi cảnh báo đã được xử lý.',
          tags: ['target-leakage'],
        },
      ],
      quiz: [
        {
          id: 't2l6-q1',
          kind: 'mcq',
          tags: ['ro-ri-du-lieu', 'chia-tap'],
          q: 'Mô hình phân loại mã độc đạt AUC 0,995 khi chia ngẫu nhiên và 0,81 khi chia theo thời gian. Kết luận đúng?',
          options: [
            'Chia theo thời gian làm hỏng mô hình, nên dùng kết quả chia ngẫu nhiên',
            'Con số 0,81 gần với hiệu năng thật hơn; khoảng cách 0,185 đo lượng rò rỉ trong thiết lập ngẫu nhiên',
            'Cả hai con số đều sai, cần thêm dữ liệu',
            'Nên lấy trung bình hai con số để có ước lượng cân bằng',
          ],
          answer: 1,
          why: 'Khi triển khai, mô hình luôn phải phán đoán về mẫu **mới hơn** dữ liệu huấn luyện — đúng điều kiện mà chia theo thời gian mô phỏng. Vì vậy 0,81 là ước lượng gần thực tế. Khoảng cách giữa hai con số không phải nhiễu mà là một phép đo có ý nghĩa: nó cho biết mô hình phụ thuộc bao nhiêu vào việc đã nhìn thấy chính họ mã độc đó. Lấy trung bình hai con số là vô nghĩa vì chúng đo hai thứ khác nhau, không phải hai lần đo cùng một thứ.',
          distractorWhy: [
            'Chia theo thời gian không làm hỏng mô hình, nó chỉ đo mô hình trong điều kiện thật.',
            '',
            'Thêm dữ liệu không sửa được một thiết lập đánh giá sai; nó chỉ làm con số ảo ổn định hơn.',
            'Trung bình của một phép đo đúng và một phép đo sai vẫn là một con số sai.',
          ],
        },
        {
          id: 't2l6-q2',
          kind: 'order',
          tags: ['chia-tap', 'quy-trinh'],
          q: 'Sắp xếp đúng thứ tự quy trình chuẩn bị dữ liệu cho một mô hình phân loại mã độc.',
          items: [
            'Khử trùng lặp tuyệt đối theo hash nội dung',
            'Gom các mẫu gần trùng thành cụm bằng imphash hoặc hash mờ',
            'Chia theo mốc thời gian thành train, validation, test',
            'Loại các cụm nằm ở cả hai phía mốc thời gian',
            'Fit Pipeline tiền xử lý chỉ trên tập huấn luyện',
          ],
          why: 'Thứ tự này bảo đảm mọi dạng rò rỉ bị chặn theo đúng lớp: trùng lặp trước, cụm gần trùng sau, rồi mới tới trục thời gian, rồi xử lý phần giao giữa hai ràng buộc, và cuối cùng mới tiền xử lý. Đảo bất kỳ bước nào cũng mở lại một lỗ rò rỉ — ví dụ chia trước khi gom cụm thì các cụm đã bị cắt đôi và bạn không còn cách nào phát hiện.',
        },
        {
          id: 't2l6-q3',
          kind: 'multi',
          tags: ['target-leakage'],
          q: 'Bạn xây mô hình dự đoán một tệp mới tải về có độc hay không, chạy ngay lúc tệp vừa xuất hiện. Đặc trưng nào là rò rỉ? (Chọn tất cả)',
          options: [
            'Số engine VirusTotal báo độc',
            'Entropy của các section trong tệp PE',
            'Tệp đã bị EDR cách ly hay chưa',
            'Tệp có chữ ký số hợp lệ hay không',
          ],
          answers: [0, 2],
          why: 'Số engine VirusTotal chỉ có sau khi tệp được gửi lên và các hãng có thời gian phân tích — thường vài ngày tới vài tuần, đúng lúc bạn cần quyết định thì nó chưa tồn tại hoặc bằng 0 vì lý do sai. Trạng thái cách ly thì thẳng thừng hơn: nó chính là kết luận của một hệ thống phát hiện khác, được ghi **sau** quyết định. Entropy và chữ ký số đọc trực tiếp từ tệp tại thời điểm xuất hiện, hoàn toàn hợp lệ.',
        },
        {
          id: 't2l6-q4',
          kind: 'truefalse',
          tags: ['holdout'],
          q: 'Miễn là bạn không huấn luyện trên tập kiểm tra, việc xem điểm số của nó sau mỗi lần thử siêu tham số là an toàn.',
          answer: false,
          why: 'Không an toàn. Mỗi lần bạn nhìn điểm và dựa vào đó để quyết định thử gì tiếp theo, bạn đang tối ưu vào tập kiểm tra qua chính quyết định của mình. Sau vài chục lần, con số cuối cùng lạc quan một cách có hệ thống. Đây là lý do quy trình chuẩn có ba tập: huấn luyện để học tham số, kiểm định để chọn siêu tham số, và kiểm tra chỉ chạm một lần để báo cáo.',
        },
        {
          id: 't2l6-q5',
          kind: 'input',
          tags: ['ro-ri-du-lieu', 'ma-doc'],
          q: 'Kỹ thuật hash nào cho phép nhóm các tệp PE dùng chung bảng hàm nhập, hữu ích để phát hiện mẫu gần trùng trước khi chia tập?',
          accept: ['imphash', 'import hash', 'imphash (import hash)'],
          placeholder: 'Tên kỹ thuật hash…',
          hint: 'Tên ghép từ chữ import và chữ hash.',
          why: 'imphash băm danh sách hàm được tệp PE nhập vào theo đúng thứ tự. Hai mẫu được biên dịch từ cùng mã nguồn thường có imphash giống nhau kể cả khi hash nội dung khác hoàn toàn. Kết hợp với hash mờ như TLSH hoặc ssdeep, bạn gom được các anh em gần trùng thành cụm và chia theo cụm — bước bắt buộc nếu không muốn báo cáo một con số ảo.',
        },
      ],
      terms: ['ro-ri-du-lieu', 'chia-theo-thoi-gian', 'group-split', 'target-leakage', 'imphash', 'tlsh', 'holdout'],
      further: [
        {
          title: 'Leakage in Data Mining: Formulation, Detection, and Avoidance — Kaufman, Rosset, Perlich (2011)',
          note: 'Bài báo nền tảng phân loại các dạng rò rỉ. Ví dụ ngoài lĩnh vực bảo mật nhưng khung tư duy áp dụng nguyên vẹn.',
        },
        {
          title: 'TESSERACT — Pendlebury và cộng sự (USENIX Security 2019)',
          note: 'Ràng buộc thời gian và tỉ lệ lớp trong đánh giá phân loại mã độc, cùng chỉ số AUT. Đọc lại sau bài này sẽ thấm hơn.',
        },
        {
          title: 'scikit-learn — Cross-validation iterators for grouped data',
          note: 'Tài liệu ngắn về GroupKFold, StratifiedGroupKFold và TimeSeriesSplit. Đọc để dùng đúng thay vì tự viết vòng lặp.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't4-l1',
      trackId: 'du-lieu',
      title: 'Ma trận nhầm lẫn và bốn con số nền tảng',
      subtitle: 'Bốn ô vuông chứa toàn bộ sự thật về một bộ phát hiện',
      minutes: 20,
      practiceMinutes: 7,
      level: 'co-ban',
      prereqs: ['t1-l3'],
      why: {
        short:
          'Mọi chỉ số bạn sẽ gặp trong đời — precision, recall, F1, ROC-AUC, chi phí kỳ vọng — đều được tính ra từ đúng bốn con số này; không đọc được chúng thì mọi con số về sau chỉ là niềm tin.',
        scenario:
          'Nhà cung cấp gửi báo cáo: “mô hình phát hiện phishing của chúng tôi đạt độ chính xác 99,7%”. Bạn có trong tay ma trận nhầm lẫn chạy trên 100.000 email của chính công ty mình. Trong 5 phút bạn phải nói được hai điều: mỗi ngày đội của bạn phải xử lý thêm bao nhiêu cảnh báo, và bao nhiêu email lừa đảo vẫn lọt qua.',
        roles: ['SOC Analyst', 'Detection Engineer', 'Security Data Scientist', 'Security Architect'],
        costOfNotKnowing:
          'Bạn ký hợp đồng dựa trên một con số vô nghĩa, rồi ba tháng sau phát hiện hệ thống mới đẻ thêm 228 cảnh báo giả mỗi ngày mà vẫn để lọt 8 email lừa đảo — lúc đó ngân sách đã tiêu xong và niềm tin của đội SOC vào ML thì đã mất.',
      },
      objectives: [
        'Điền được ma trận nhầm lẫn từ một tình huống SOC mô tả bằng lời',
        'Gọi đúng tên và nêu đúng hậu quả nghiệp vụ của TP, FP, TN, FN',
        'Quy bốn con số thành hai đại lượng vận hành: cảnh báo mỗi ngày và vụ bỏ lọt mỗi tháng',
        'Giải thích được vì sao cùng một mô hình cho ra nhiều ma trận nhầm lẫn khác nhau',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Công ty bạn nhận 100.000 email mỗi ngày, trong đó khoảng 40 email là lừa đảo thật. Mô hình mới gắn cờ 260 email, và trong 260 email đó có 32 email đúng là lừa đảo. Hãy tính nhanh trong đầu: (a) độ chính xác (accuracy) của mô hình là bao nhiêu, (b) một chương trình ngu ngốc luôn trả lời “an toàn” đạt độ chính xác bao nhiêu?',
          reveal:
            'Bốn con số: bắt trúng **32**, báo động giả **260 − 32 = 228**, bỏ sót **40 − 32 = 8**, bỏ qua đúng **100.000 − 40 − 228 = 99.732**.\n\n(a) Accuracy = (32 + 99.732) / 100.000 = **99,764%**.\n\n(b) Chương trình luôn nói “an toàn”: nó đúng với cả 99.960 email lành và sai với 40 email độc → accuracy = **99,960%**.\n\nĐọc kỹ hai con số đó. Mô hình học máy đắt tiền của bạn có accuracy **THẤP HƠN** một dòng lệnh `return "an toàn"`. Nhưng mô hình bắt được 32 vụ lừa đảo, còn dòng lệnh kia bắt được 0. Accuracy không chỉ vô dụng ở đây — nó xếp hạng ngược. Bốn con số thì không nói dối bao giờ, và đó là lý do bài này đứng đầu chặng quan trọng nhất khoá học.',
        },
        {
          t: 'p',
          md: 'Ma trận nhầm lẫn (confusion matrix) chỉ là bảng đối chiếu hai câu hỏi: **sự thật là gì** và **máy nói gì**. Hai câu hỏi, mỗi câu hai đáp án, ra bốn ô. Toàn bộ ngành đo lường mô hình phân loại nằm gọn trong bốn ô đó.',
        },
        {
          t: 'p',
          md: 'Trong bảo mật, ta quy ước lớp **dương** (positive) là “có chuyện xấu”: email lừa đảo, tệp độc hại, phiên đăng nhập bị chiếm. Quy ước này không phải tuỳ tiện — nó khiến recall trở thành “tỉ lệ bắt được” và khiến mọi công thức về sau đọc thuận theo nghiệp vụ.',
        },
        {
          t: 'figure',
          id: 'fig-confusion',
          caption: 'Bốn ô, hai trục. Trục dọc là sự thật, trục ngang là phán quyết của máy. Mỗi ô có một cái giá khác nhau, và đó mới là phần quan trọng.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Mẹo đọc tên bốn ô, không bao giờ nhầm nữa',
          md: 'Tên của mỗi ô có hai chữ. **Chữ sau (P hay N) là điều MÁY NÓI. Chữ trước (T hay F) cho biết máy nói ĐÚNG hay SAI.**\n\n- **False Negative** = máy nói “âm tính” (Negative) và máy đã sai (False) → thực ra là tấn công → **bỏ sót**.\n- **False Positive** = máy nói “dương tính” và máy đã sai → **báo động giả**.\n\nĐọc từ phải sang trái. Sau khi nắm mẹo này bạn sẽ không bao giờ phải tra lại bảng nữa — và tin tôi đi, người ta nhầm FN với FP trong các cuộc họp nhiều hơn bạn tưởng.',
        },
        { t: 'h', text: 'Bốn ô và cái giá thật của từng ô', level: 2 },
        {
          t: 'table',
          head: ['Ô', 'Tên tiếng Việt nên dùng', 'Nghĩa trong SOC', 'Ai trả giá'],
          rows: [
            ['TP — True Positive', 'Bắt trúng', 'Có tấn công, mô hình báo. Analyst điều tra và xác nhận đúng.', 'Vẫn tốn ~15–45 phút điều tra, nhưng đây là tiền chi đúng chỗ.'],
            ['FP — False Positive', 'Báo động giả', 'Không có gì, mô hình vẫn báo. Analyst mất thời gian rồi đóng ticket.', 'Đội SOC trả bằng giờ làm và bằng lòng tin: FP nhiều thì cảnh báo thật cũng bị bấm bỏ qua.'],
            ['FN — False Negative', 'Bỏ sót', 'Có tấn công, mô hình im lặng. Không ai biết cho tới khi hậu quả nổ ra.', 'Cả công ty. Đây là ô duy nhất bạn không nhìn thấy trong bảng điều khiển vận hành.'],
            ['TN — True Negative', 'Bỏ qua đúng', 'Không có gì, mô hình im lặng. Đúng và rẻ.', 'Không ai. Nhưng chính ô khổng lồ này khiến accuracy trở nên vô nghĩa.'],
          ],
        },
        {
          t: 'callout',
          kind: 'why',
          title: 'Vì sao ô TN là thủ phạm',
          md: 'Trong ví dụ đầu bài, TN = 99.732 trên tổng 100.000. Bất kỳ chỉ số nào cộng TN vào tử số — accuracy là chỉ số kinh điển — sẽ bị ô này nuốt chửng. Bạn có thể tăng TP từ 0 lên 40 (bắt được **tất cả** các vụ lừa đảo) mà accuracy chỉ nhúc nhích 0,04 điểm phần trăm.\n\nĐây là lý do kỹ thuật, chứ không phải lý do triết học, khiến hai chỉ số quan trọng nhất trong bảo mật — precision và recall — **không dùng TN trong công thức**. Bài sau sẽ chứng minh điều đó.',
        },
        {
          t: 'steps',
          title: 'Ví dụ mẫu: từ mô tả bằng lời tới quyết định',
          steps: [
            {
              title: 'Bước 1 — Xác định lớp dương và tổng số mẫu',
              md: 'Lớp dương = email lừa đảo. Tổng = 100.000 email/ngày. Số dương thật = 40. Số âm thật = 100.000 − 40 = **99.960**.\n\nBước tưởng như thừa này thực ra là bước hay bị bỏ qua nhất. Không biết mẫu số thì không có con số nào ở dưới có ý nghĩa.',
            },
            {
              title: 'Bước 2 — Điền ô từ hai thông tin có sẵn',
              md: 'Mô hình gắn cờ 260 email → đó là **cột dự đoán dương**: TP + FP = 260. Trong đó đúng 32 → **TP = 32**, **FP = 228**.\n\nSự thật có 40 dương → đó là **hàng thật dương**: TP + FN = 40 → **FN = 8**. Phần còn lại: **TN = 99.960 − 228 = 99.732**.',
            },
            {
              title: 'Bước 3 — Quy về đơn vị vận hành',
              md: 'Cảnh báo mỗi ngày = TP + FP = **260**. Với 12 phút xử lý trung bình mỗi cảnh báo, đó là 3.120 phút = **52 giờ analyst mỗi ngày** — tức khoảng **6,5 ca làm việc** chỉ để tiêu hoá đầu ra của một mô hình.\n\nBỏ lọt = FN = 8 email lừa đảo mỗi ngày, tức khoảng **240 email mỗi tháng** đi thẳng vào hộp thư nhân viên.',
            },
            {
              title: 'Bước 4 — Đặt câu hỏi quyết định',
              md: 'Câu hỏi không phải “mô hình có tốt không”. Câu hỏi là: **52 giờ analyst mỗi ngày có đáng để chặn 32 vụ lừa đảo mỗi ngày không, so với phương án hiện tại?**\n\nĐó là một câu hỏi về tiền và nhân sự, và bạn chỉ trả lời được sau khi đã đi qua bốn ô. Bài t4-l4 sẽ biến câu hỏi này thành một phép tính.',
            },
          ],
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't4l1-cp1',
              kind: 'mcq',
              tags: ['ma-tran-nham-lan', 'do-luong'],
              q: 'Hệ thống EDR quét 8.000 tiến trình. Có 25 tiến trình thực sự độc hại. EDR cách ly 90 tiến trình, trong đó 18 đúng là độc hại. FN bằng bao nhiêu?',
              options: ['72', '7', '18', '7.910'],
              answer: 1,
              why: 'FN = số dương thật mà mô hình bỏ qua = 25 − 18 = **7**. Con số 72 là FP (90 cách ly trừ 18 đúng). Nhầm hai con số này là lỗi phổ biến nhất trong các cuộc họp về hiệu năng phát hiện, và nó nguy hiểm vì FP là chi phí vận hành còn FN là rủi ro tồn dư — hai thứ hoàn toàn khác nhau về bản chất.',
              distractorWhy: [
                'Đây là FP: 90 tiến trình bị cách ly trừ 18 cái đúng.',
                '',
                'Đây là TP — số vụ bắt trúng.',
                'Đây là TN: 8.000 − 25 − 72 = 7.903, và kể cả tính đúng thì đây cũng là ô “bỏ qua đúng”.',
              ],
            },
            {
              id: 't4l1-cp2',
              kind: 'truefalse',
              tags: ['ma-tran-nham-lan', 'nguong'],
              q: 'Một mô hình đã huấn luyện xong thì có duy nhất một ma trận nhầm lẫn.',
              answer: false,
              why: 'Mô hình cho ra **điểm số liên tục**, không phải quyết định. Chỉ khi bạn chọn một ngưỡng cắt thì điểm số mới biến thành nhãn, và mỗi ngưỡng cho một ma trận khác nhau. Hạ ngưỡng xuống → TP tăng, FN giảm, nhưng FP tăng theo. Vì vậy mọi ma trận nhầm lẫn phải đi kèm hai thông tin: **ngưỡng nào** và **trên tập dữ liệu nào**. Thiếu một trong hai thì con số không kiểm chứng được.',
            },
          ],
        },
        {
          t: 'lab',
          id: 'lab-confusion',
          intro: 'Kéo ngưỡng và nhìn bốn con số nhảy theo thời gian thực. Hãy chú ý điều này: khi bạn kéo để FN về 0, hãy nhìn FP đang là bao nhiêu.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Lấy bốn con số bằng scikit-learn và quy ngay ra đơn vị vận hành',
          code:
            "import numpy as np\n" +
            "from sklearn.metrics import confusion_matrix\n" +
            "\n" +
            "# y_that: nhãn thật (1 = lừa đảo). diem: điểm mô hình cho mỗi email, trong [0, 1].\n" +
            "nguong = 0.50\n" +
            "y_du_doan = (diem >= nguong).astype(int)\n" +
            "\n" +
            "# labels=[0, 1] để thứ tự ô KHÔNG phụ thuộc lớp nào tình cờ xuất hiện trước.\n" +
            "# Bỏ tham số này là nguồn gốc của rất nhiều bảng bị đảo ô mà không ai nhận ra.\n" +
            "tn, fp, fn, tp = confusion_matrix(y_that, y_du_doan, labels=[0, 1]).ravel()\n" +
            "print('Bắt trúng TP =', tp, '| Báo động giả FP =', fp)\n" +
            "print('Bỏ sót   FN =', fn, '| Bỏ qua đúng TN =', tn)\n" +
            "\n" +
            "# Quy về hai con số mà đội vận hành thực sự quan tâm\n" +
            "so_ngay = 30\n" +
            "phut_moi_canh_bao = 12\n" +
            "canh_bao_ngay = (tp + fp) / so_ngay\n" +
            "print('Cảnh báo mỗi ngày:', round(canh_bao_ngay, 1))\n" +
            "print('Giờ analyst mỗi ngày:', round(canh_bao_ngay * phut_moi_canh_bao / 60, 1))\n" +
            "print('Vụ bỏ lọt trong kỳ:', fn)\n",
        },
        {
          t: 'compare',
          title: 'Hai loại sai lầm, hai loại thiệt hại',
          left: {
            title: 'Báo động giả (FP) — chi phí vận hành',
            icon: 'siren',
            items: [
              'Đo được, thấy được, xuất hiện ngay trên bảng điều khiển',
              'Cộng dồn tuyến tính theo giờ analyst: 12 phút × số cảnh báo',
              'Tác động phi tuyến: quá ngưỡng chịu đựng thì sinh mù cảnh báo',
              'Sửa nhanh: nâng ngưỡng, lọc, gom nhóm',
              'Đơn vị đo: giờ người mỗi ngày, tiền lương mỗi tháng',
            ],
          },
          right: {
            title: 'Bỏ sót (FN) — rủi ro tồn dư',
            icon: 'search-x',
            items: [
              'Không đo được từ dữ liệu vận hành: bạn không biết cái mình không thấy',
              'Chỉ lộ ra khi có sự cố, khi bị bên thứ ba báo, hoặc khi làm threat hunting',
              'Chi phí lệch cực mạnh: 99 vụ vô hại và 1 vụ ransomware 40 tỉ đồng',
              'Sửa chậm: cần dữ liệu mới, đặc trưng mới, huấn luyện lại',
              'Đơn vị đo: xác suất sự cố × thiệt hại kỳ vọng',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Ba cái bẫy quanh bảng bốn ô',
          md: '**1. Ma trận không kèm ngưỡng.** Con số đẹp có thể chỉ là ngưỡng được chỉnh riêng cho slide đó.\n\n**2. Ma trận trên tập đã cân bằng lại.** Nhiều báo cáo lấy 5.000 mẫu độc và 5.000 mẫu lành cho “dễ nhìn”. Khi đó FP trong bảng là FP trên 5.000 mẫu lành, còn thực tế bạn có 10 triệu mẫu lành mỗi ngày — sai lệch 2.000 lần. Tập kiểm tra phải giữ nguyên tỉ lệ thật.\n\n**3. Nhầm chiều bảng.** Một số tài liệu và một số công cụ đặt hàng là dự đoán, cột là sự thật; scikit-learn thì ngược lại. Luôn dán nhãn rõ ràng cho trục trước khi diễn giải.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Một câu hỏi cắt qua mọi bài trình bày',
          md: 'Khi ai đó khoe kết quả phát hiện, hãy hỏi đúng câu này: **“Cho tôi xin bốn con số tuyệt đối, trên bao nhiêu mẫu âm, ở ngưỡng nào?”**\n\nNếu người trình bày đưa được ngay, họ hiểu bài toán của mình. Nếu họ chỉ có tỉ lệ phần trăm, bạn vừa tiết kiệm cho công ty một khoản tiền.',
        },
        { t: 'terms', ids: ['bao-dong-gia', 'bo-sot', 'nguong', 'base-rate', 'mat-can-bang'] },
      ],
      keyTakeaways: [
        'Ma trận nhầm lẫn là bảng đối chiếu giữa sự thật và phán quyết của máy; bốn ô của nó sinh ra mọi chỉ số khác.',
        'Mẹo đọc tên: chữ sau là điều máy nói, chữ trước cho biết máy nói đúng hay sai.',
        'Ô TN khổng lồ là lý do accuracy vô dụng trong bảo mật — precision và recall cố tình không dùng TN.',
        'Một mô hình có vô số ma trận nhầm lẫn, mỗi ngưỡng một cái; ma trận không kèm ngưỡng và mẫu số là con số không kiểm chứng được.',
        'Luôn quy bốn ô về hai đại lượng vận hành: số cảnh báo mỗi ngày (giờ analyst) và số vụ bỏ lọt mỗi tháng (rủi ro tồn dư).',
      ],
      cards: [
        {
          id: 't4l1-c1',
          front: 'False Negative trong phát hiện tấn công nghĩa là gì, và vì sao nó nguy hiểm hơn FP?',
          back: 'Máy nói “không có gì” nhưng thực ra có tấn công — tức bỏ sót. Nguy hiểm hơn vì bạn không nhìn thấy nó trong dữ liệu vận hành: FP xuất hiện trên bảng điều khiển, FN thì im lặng cho tới khi sự cố nổ ra.',
          tags: ['ma-tran-nham-lan'],
        },
        {
          id: 't4l1-c2',
          front: 'Vì sao precision và recall cố tình không dùng True Negative trong công thức?',
          back: 'Vì trong bảo mật TN chiếm gần 100% dữ liệu; bất kỳ chỉ số nào cộng TN vào sẽ bị ô này nuốt chửng và không phản ánh được thay đổi ở lớp hiếm.',
          tags: ['do-luong', 'mat-can-bang'],
        },
        {
          id: 't4l1-c3',
          front: 'Một ma trận nhầm lẫn phải luôn đi kèm hai thông tin nào mới có ý nghĩa?',
          back: 'Ngưỡng cắt đã dùng, và tập dữ liệu (đặc biệt là số mẫu âm thật) mà nó được tính trên đó.',
          hint: 'Một cái là tham số quyết định, một cái là mẫu số.',
          tags: ['nguong', 'do-luong'],
        },
        {
          id: 't4l1-c4',
          front: '100.000 email/ngày, 40 lừa đảo. Mô hình gắn cờ 260, đúng 32. FP và FN bằng bao nhiêu?',
          back: 'FP = 260 − 32 = 228 báo động giả. FN = 40 − 32 = 8 vụ bỏ lọt.',
          tags: ['ma-tran-nham-lan'],
        },
        {
          id: 't4l1-c5',
          front: 'Vì sao ma trận nhầm lẫn tính trên tập đã cân bằng lại 50/50 là con số gây hiểu nhầm?',
          back: 'Vì số FP trong bảng được tính trên số mẫu âm giả tạo. Thực tế có nhiều mẫu âm hơn hàng nghìn lần, nên số báo động giả thật lớn hơn tương ứng. Tập kiểm tra phải giữ nguyên tỉ lệ lớp thật.',
          tags: ['mat-can-bang', 'do-luong'],
        },
      ],
      quiz: [
        {
          id: 't4-l1-q1',
          kind: 'mcq',
          tags: ['ma-tran-nham-lan', 'do-luong'],
          q: 'Cổng WAF xử lý 2 triệu request mỗi ngày, trong đó 500 là tấn công thật. Cấu hình mới chặn 3.500 request, bắt trúng 450. Đâu là mô tả đúng nhất về ảnh hưởng vận hành?',
          options: [
            'Mô hình đạt accuracy 99,84%, đây là kết quả xuất sắc',
            'Mỗi ngày có 3.050 request hợp lệ bị chặn oan và 50 cuộc tấn công vẫn lọt',
            'Recall là 3.500/500 nên mô hình quá nhạy',
            'Vì TN rất lớn nên có thể coi mô hình gần như hoàn hảo',
          ],
          answer: 1,
          why: 'FP = 3.500 − 450 = 3.050 request hợp lệ bị chặn oan — trong WAF, mỗi cái là một khách hàng không mua được hàng hoặc một cuộc gọi lên bộ phận hỗ trợ. FN = 500 − 450 = 50 cuộc tấn công lọt qua. Hai con số tuyệt đối này là ngôn ngữ để nói chuyện với đội vận hành và đội kinh doanh; accuracy 99,84% thì không nói được gì cả — nó còn thấp hơn accuracy của việc không chặn gì (99,975%).',
          distractorWhy: [
            'Accuracy ở đây thấp hơn cả phương án không làm gì, nên nó không chứng minh được điều gì.',
            '',
            'Recall = TP / số dương thật = 450/500 = 0,90. Chia cho số cảnh báo là công thức của precision với tử số sai.',
            'TN lớn chính là lý do khiến chỉ số dựa trên TN mất ý nghĩa, không phải lý do để yên tâm.',
          ],
        },
        {
          id: 't4-l1-q2',
          kind: 'input',
          tags: ['ma-tran-nham-lan', 'base-rate'],
          q: 'Hệ thống xử lý 5.000.000 sự kiện mỗi ngày. Tỉ lệ báo động giả là 0,04% số sự kiện lành tính (coi gần đúng toàn bộ là lành tính). Mỗi ngày đội SOC nhận bao nhiêu cảnh báo giả? (Chỉ nhập con số)',
          accept: ['2000', '2.000', '2 000', '2000 canh bao', '2000/ngay'],
          placeholder: 'Nhập số cảnh báo giả mỗi ngày…',
          hint: 'Nhân tỉ lệ với tổng số sự kiện lành tính. 0,04% = 0,0004.',
          why: '5.000.000 × 0,0004 = **2.000 cảnh báo giả mỗi ngày**. Với 12 phút mỗi cảnh báo, đó là 400 giờ analyst mỗi ngày — khoảng 50 ca làm việc. Bài học ở đây không phải phép nhân, mà là phản xạ: mỗi khi nghe một tỉ lệ phần trăm nhỏ, hãy nhân ngay với lưu lượng để ra con số tuyệt đối. Tỉ lệ nghe êm tai; con số tuyệt đối mới là thứ đội SOC phải sống cùng.',
        },
        {
          id: 't4-l1-q3',
          kind: 'match',
          tags: ['ma-tran-nham-lan'],
          q: 'Nối mỗi ô của ma trận nhầm lẫn với hậu quả nghiệp vụ tương ứng.',
          pairs: [
            ['True Positive', 'Analyst điều tra và xác nhận có tấn công thật'],
            ['False Positive', 'Analyst mất 12 phút rồi đóng ticket vì không có gì'],
            ['False Negative', 'Kẻ tấn công đi tiếp mà không ai biết'],
            ['True Negative', 'Không ai làm gì cả, và đó là điều đúng'],
          ],
          why: 'Ghép được bốn ô với hậu quả là bước chuyển từ “biết định nghĩa” sang “dùng được”. Chú ý điểm bất đối xứng: ba ô đầu đều tạo ra hành động hoặc hậu quả quan sát được, riêng False Negative thì hoàn toàn im lặng. Đó là lý do bạn cần threat hunting và kiểm chứng bằng dữ liệu bên ngoài — vì không có cách nào đếm FN từ chính bảng điều khiển của bạn.',
        },
        {
          id: 't4-l1-q4',
          kind: 'order',
          tags: ['do-luong', 'quy-trinh'],
          q: 'Sắp xếp các bước đọc một báo cáo hiệu năng phát hiện theo đúng thứ tự nên làm.',
          items: [
            'Hỏi lớp dương được định nghĩa là gì và tập đánh giá có bao nhiêu mẫu âm thật',
            'Hỏi ngưỡng nào đang được dùng để tạo ra bảng số này',
            'Lấy bốn con số tuyệt đối TP, FP, FN, TN',
            'Quy FP thành số cảnh báo mỗi ngày và số giờ analyst',
            'Quy FN thành rủi ro tồn dư và so với khẩu vị rủi ro của tổ chức',
          ],
          why: 'Thứ tự này không tuỳ tiện. Không biết mẫu số thì mọi tỉ lệ đều vô nghĩa, nên nó đứng đầu. Không biết ngưỡng thì bốn con số không tái lập được. Chỉ khi có bốn con số tuyệt đối bạn mới quy ra được hai đại lượng quyết định — giờ người và rủi ro — và đó mới là thứ dùng để ra quyết định mua hay không mua, bật hay không bật.',
        },
        {
          id: 't4-l1-q5',
          kind: 'multi',
          tags: ['do-luong', 'mat-can-bang'],
          q: 'Nhận định nào sau đây là đúng? (Chọn tất cả đáp án đúng)',
          options: [
            'Hạ ngưỡng cắt thường làm FN giảm và FP tăng',
            'Accuracy có thể cao hơn khi mô hình phát hiện ít tấn công hơn, nếu tấn công rất hiếm',
            'Số FP tuyệt đối phụ thuộc vào lưu lượng, còn tỉ lệ FP thì không',
            'Có thể đếm chính xác số FN chỉ bằng cách nhìn vào bảng điều khiển cảnh báo',
          ],
          answers: [0, 1, 2],
          why: 'Ba ý đầu đều đúng và đều là hệ quả trực tiếp của cấu trúc bốn ô. Ý cuối sai và sai theo cách nguy hiểm nhất: FN theo định nghĩa là những gì hệ thống của bạn **không** báo, nên chúng không bao giờ xuất hiện trên bảng điều khiển. Muốn ước lượng FN bạn phải đi tìm bằng nguồn độc lập: threat hunting, diễn tập purple team, thông tin từ bên thứ ba, hoặc phát lại dữ liệu cũ với chữ ký mới.',
        },
      ],
      terms: ['bao-dong-gia', 'bo-sot', 'nguong', 'base-rate', 'mat-can-bang'],
      further: [
        {
          title: 'scikit-learn — Confusion matrix và ConfusionMatrixDisplay',
          note: 'Tài liệu chính thức, đọc kỹ phần thứ tự nhãn. Đây là chỗ hay bị đảo ô nhất trong thực tế.',
        },
        {
          title: 'The Base Rate Fallacy and its Implications for Intrusion Detection — Axelsson (1999)',
          note: 'Nối trực tiếp bài này với t1-l3: vì sao bốn ô cộng lại vẫn cho ra một hệ thống không dùng được khi lớp dương quá hiếm.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't4-l2',
      trackId: 'du-lieu',
      title: 'Precision, Recall, F1 — và vì sao accuracy là cái bẫy',
      subtitle: 'Hai câu hỏi khác nhau về cùng một mô hình, và cái giá của việc trộn lẫn chúng',
      minutes: 22,
      practiceMinutes: 3,
      level: 'co-ban',
      prereqs: ['t4-l1'],
      why: {
        short:
          'Precision và recall trả lời hai câu hỏi hoàn toàn khác nhau; chọn nhầm câu hỏi là cách nhanh nhất để tối ưu một mô hình đi đúng hướng ngược lại nhu cầu của tổ chức.',
        scenario:
          'Bạn có hai mô hình phát hiện mã độc. Mô hình A: precision 0,95 nhưng recall 0,40. Mô hình B: precision 0,30 nhưng recall 0,92. Giám đốc an ninh hỏi chọn cái nào. Câu trả lời đúng phụ thuộc vào việc mô hình này chặn thẳng hay đẩy vào hàng đợi cho analyst — và bạn phải giải thích được điều đó trong ba câu.',
        roles: ['Detection Engineer', 'Security Data Scientist', 'SOC Analyst', 'ML Engineer'],
        costOfNotKnowing:
          'Bạn báo cáo F1 = 0,71 cho một hệ thống chặn tự động, ban lãnh đạo duyệt, rồi 5% giao dịch hợp lệ bị chặn trong ngày cao điểm — vì F1 đã âm thầm đánh đổi precision lấy recall mà không ai để ý.',
      },
      objectives: [
        'Phát biểu precision và recall bằng lời trước khi viết công thức, và chỉ đúng mẫu số của mỗi cái',
        'Dự đoán được precision và recall thay đổi theo hướng nào khi kéo ngưỡng',
        'Chọn F-beta với beta phù hợp thay vì mặc định F1, và giải thích được vì sao',
        'Phân biệt trung bình macro, micro và weighted, và chọn đúng cho bài toán nhiều lớp trong bảo mật',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Một mô hình phát hiện mã độc có precision = 1,00 (mọi cảnh báo nó đưa ra đều đúng, không sai lần nào) nhưng recall = 0,02 (nó chỉ bắt được 2% số mã độc). Trung bình cộng của hai con số là 0,51 — nghe như điểm trung bình. Vậy F1 của nó bằng bao nhiêu?',
          reveal:
            'F1 = 2 × (1,00 × 0,02) / (1,00 + 0,02) = 0,04 / 1,02 ≈ **0,039**.\n\nGần bằng **không**, chứ không phải 0,51. Đó chính là lý do F1 dùng **trung bình điều hoà** (harmonic mean) chứ không phải trung bình cộng: trung bình điều hoà luôn bị kéo về phía con số nhỏ hơn. Một mô hình muốn F1 cao thì **cả hai** chỉ số phải cùng cao — không được phép giỏi một cái và bỏ mặc cái kia.\n\nHãy nhớ tính chất này. Nó vừa là điểm mạnh của F1 (không cho phép gian lận bằng cách tối đa hoá một phía), vừa là điểm yếu của nó (nó áp đặt rằng hai phía quan trọng ngang nhau — điều gần như không bao giờ đúng trong bảo mật).',
        },
        { t: 'h', text: 'Hai câu hỏi, không phải hai công thức', level: 2 },
        {
          t: 'figure',
          id: 'fig-precision-recall',
          caption:
            'Cùng một bảng, hai hướng đọc. Precision lấy cột "mô hình nói ĐỘC" làm mẫu số; recall lấy hàng "thật ra ĐỘC". Biết mình đang đọc cột hay hàng thì không bao giờ lẫn hai chỉ số.',
        },
        {
          t: 'p',
          md: 'Trước khi nhìn công thức, hãy phát biểu bằng lời. Đây không phải là mẹo sư phạm — người làm lâu năm cũng dùng đúng hai câu này khi tranh luận.',
        },
        {
          t: 'list',
          items: [
            '**Precision (độ chuẩn xác)** trả lời: *“Trong những lần tôi kêu lên, bao nhiêu lần tôi đúng?”* Đây là thước đo **lòng tin** của analyst vào hệ thống. Precision thấp thì người ta ngừng đọc cảnh báo.',
            '**Recall (độ phủ, còn gọi là độ nhạy — sensitivity, hay TPR)** trả lời: *“Trong tất cả những chuyện xấu thực sự đã xảy ra, tôi bắt được bao nhiêu?”* Đây là thước đo **rủi ro còn lại**. Recall thấp nghĩa là kẻ tấn công vẫn đi qua.',
          ],
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Công thức, và mẹo nhớ mẫu số',
          md: 'Precision = TP / (TP + FP) — mẫu số là **cột** dự đoán dương: *tất cả những lần tôi kêu*.\n\nRecall = TP / (TP + FN) — mẫu số là **hàng** thật dương: *tất cả những chuyện xấu thực sự có*.\n\nMẹo: **precision đếm theo cột, recall đếm theo hàng.** Và chú ý điều quan trọng nhất — **không công thức nào chứa TN**. Đó chính là lý do chúng sống sót được trong môi trường mất cân bằng cực đoan, còn accuracy = (TP + TN)/tổng thì không.',
        },
        {
          t: 'table',
          head: ['Ngưỡng', 'Cảnh báo/ngày', 'TP', 'FP', 'FN', 'Precision', 'Recall'],
          rows: [
            ['0,10', '2.100', '39', '2.061', '1', '1,9%', '97,5%'],
            ['0,30', '640', '37', '603', '3', '5,8%', '92,5%'],
            ['0,50', '260', '32', '228', '8', '12,3%', '80,0%'],
            ['0,70', '95', '26', '69', '14', '27,4%', '65,0%'],
            ['0,90', '28', '17', '11', '23', '60,7%', '42,5%'],
            ['0,97', '9', '8', '1', '32', '88,9%', '20,0%'],
          ],
          caption: 'Cùng một mô hình phishing (100.000 email/ngày, 40 vụ thật) ở sáu ngưỡng khác nhau. Không có dòng nào “đúng” — chỉ có dòng phù hợp với công suất và khẩu vị rủi ro của bạn.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Đọc bảng trên như một kỹ sư',
          md: 'Precision và recall **luôn** đi ngược chiều nhau khi bạn kéo ngưỡng, vì cả hai cùng đọc một danh sách xếp hạng. Bạn không chọn “mô hình tốt hơn” bằng cách nhìn hai con số — bạn chọn **điểm hoạt động** trên đường cong của một mô hình.\n\nSo sánh hai mô hình khác nhau chỉ có ý nghĩa khi so ở **cùng một ràng buộc**: cùng số cảnh báo mỗi ngày, hoặc cùng mức recall yêu cầu. Câu “mô hình A có F1 cao hơn” gần như luôn là so sánh hai điểm hoạt động ngẫu nhiên với nhau.',
        },
        {
          t: 'compare',
          title: 'Ưu tiên cái nào? Hỏi: đầu ra đi đâu?',
          left: {
            title: 'Ưu tiên PRECISION khi…',
            icon: 'target',
            items: [
              'Đầu ra hành động tự động: chặn, cách ly, khoá tài khoản',
              'Sai một lần là ảnh hưởng trực tiếp tới người dùng hoặc doanh thu',
              'Đội SOC đã quá tải, thêm cảnh báo là thêm mù cảnh báo',
              'Đây là lớp phòng thủ thứ ba, còn nhiều lớp khác bắt phần bị lọt',
              'Ví dụ: tự động cách ly endpoint, chặn giao dịch thanh toán',
            ],
          },
          right: {
            title: 'Ưu tiên RECALL khi…',
            icon: 'network',
            items: [
              'Đầu ra chỉ là hàng đợi để con người xem lại',
              'Bỏ sót một vụ là thảm hoạ không đảo ngược được',
              'Có bước lọc rẻ tiền phía sau: làm giàu ngữ cảnh, gom nhóm, mô hình tầng hai',
              'Đây là lớp phòng thủ cuối, sau nó không còn gì',
              'Ví dụ: sàng lọc dấu hiệu ransomware, phát hiện rò rỉ dữ liệu quy mô lớn',
            ],
          },
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't4l2-cp1',
              kind: 'mcq',
              tags: ['precision', 'recall'],
              q: 'Mô hình của bạn sẽ tự động cách ly máy trạm khi phát hiện ransomware, không có người xem lại. Ràng buộc thiết kế quan trọng nhất là gì?',
              options: [
                'Recall phải cao nhất có thể, chấp nhận precision thấp',
                'Precision phải rất cao ở điểm hoạt động, kể cả phải hi sinh recall',
                'F1 phải trên 0,80',
                'Accuracy phải trên 99%',
              ],
              answer: 1,
              why: 'Hành động tự động và không đảo ngược được thì mỗi FP là một máy trạm của người thật bị ngắt khỏi mạng giữa giờ làm việc. Với 5.000 endpoint, precision 90% ở mức 100 cảnh báo mỗi ngày nghĩa là 10 người mất việc trong 30 phút — mỗi ngày. Cách xử lý chuẩn trong thực tế là chia tầng: ngưỡng rất cao cho hành động tự động, ngưỡng thấp hơn cho hàng đợi con người. Bài t4-l4 sẽ dựng đúng kiến trúc ba vùng này.',
              distractorWhy: [
                'Recall cao với precision thấp trong chế độ tự động cách ly sẽ làm tê liệt hoạt động của công ty.',
                '',
                'F1 giả định precision và recall quan trọng ngang nhau — chính là giả định sai trong tình huống này.',
                'Accuracy vẫn vô nghĩa vì lớp dương cực hiếm; 99% ở đây còn tệ hơn không làm gì.',
              ],
            },
            {
              id: 't4l2-cp2',
              kind: 'truefalse',
              tags: ['precision', 'base-rate'],
              q: 'Nếu giữ nguyên mô hình và ngưỡng, đem sang một môi trường có ít tấn công hơn 10 lần, recall gần như không đổi nhưng precision sẽ tụt mạnh.',
              answer: true,
              why: 'Recall chỉ tính trên các mẫu dương, nên nó là thuộc tính của mô hình đối với lớp tấn công — đổi tỉ lệ nền không ảnh hưởng nhiều. Precision thì có FP trong mẫu số, mà FP tỉ lệ với số mẫu âm. Ít tấn công hơn 10 lần trong khi lưu lượng lành giữ nguyên thì TP giảm 10 lần còn FP không đổi → precision tụt gần 10 lần. Đây là lý do một mô hình chạy tốt ở khách hàng A có thể vô dụng ở khách hàng B, và là lý do PR-AUC không so sánh được giữa hai tập dữ liệu có tỉ lệ nền khác nhau (bài t4-l3).',
            },
          ],
        },
        { t: 'h', text: 'F1 và họ F-beta: khi nào và với beta nào', level: 2 },
        {
          t: 'p',
          md: 'F1 chỉ là một điểm trong một họ. Công thức tổng quát: **F_beta = (1 + beta²) × P × R / (beta² × P + R)**. Ý nghĩa của beta rất đơn giản: **beta² là số lần bạn coi trọng recall hơn precision**.',
        },
        {
          t: 'table',
          head: ['Chỉ số', 'beta', 'Ưu tiên', 'Dùng trong bảo mật khi'],
          rows: [
            ['F0.5', '0,5', 'Precision quan trọng gấp 4 lần recall', 'Chặn tự động, cách ly endpoint, khoá tài khoản'],
            ['F1', '1', 'Cân bằng — giả định hai bên ngang nhau', 'Khi thật sự không biết chi phí, hoặc để so sánh với bài báo khác'],
            ['F2', '2', 'Recall quan trọng gấp 4 lần precision', 'Sàng lọc cho hàng đợi analyst, tìm dấu hiệu ransomware'],
            ['F3', '3', 'Recall quan trọng gấp 9 lần precision', 'Lớp phòng thủ cuối, hậu quả bỏ sót là không đảo ngược'],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Cách chọn beta trong 30 giây',
          md: 'Hỏi đội SOC đúng một câu: **“Anh chị sẵn sàng xử lý thêm bao nhiêu báo động giả để bắt thêm được một vụ thật?”**\n\nNếu câu trả lời là 10, thì beta² ≈ 10 → beta ≈ 3,2. Nếu câu trả lời là “không quá 1 cái” thì beta ≈ 1. Nếu là “thà bỏ sót còn hơn làm phiền người dùng” thì beta < 1.\n\nĐây là quy tắc ngón tay cái, không phải định lý. Cách chặt chẽ là dùng ma trận chi phí ở bài t4-l4 — nhưng câu hỏi trên vẫn đáng hỏi, vì nó buộc mọi người phát biểu thành lời cái đánh đổi mà họ vẫn ngầm giả định.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Báo cáo đầy đủ, F-beta, và vì sao digits=4 không phải chuyện làm màu',
          code:
            "from sklearn.metrics import classification_report, fbeta_score\n" +
            "from sklearn.metrics import precision_recall_fscore_support\n" +
            "\n" +
            "y_du_doan = (diem >= 0.5).astype(int)\n" +
            "\n" +
            "# digits=4 vì với lớp hiếm, precision 0,02 và 0,06 khác nhau GẤP BA LẦN\n" +
            "# nhưng cả hai đều làm tròn thành 0,0 hoặc 0,1 ở độ chính xác mặc định.\n" +
            "print(classification_report(y_that, y_du_doan,\n" +
            "                            target_names=['lanh', 'doc'],\n" +
            "                            digits=4, zero_division=0))\n" +
            "\n" +
            "# F2: coi recall quan trọng gấp 4 lần precision (beta bình phương = 4)\n" +
            "print('F2   =', round(fbeta_score(y_that, y_du_doan, beta=2.0), 4))\n" +
            "print('F0.5 =', round(fbeta_score(y_that, y_du_doan, beta=0.5), 4))\n" +
            "\n" +
            "# Với nhiều lớp: macro coi mọi lớp ngang nhau -> họ mã độc hiếm không bị nuốt\n" +
            "p, r, f, _ = precision_recall_fscore_support(\n" +
            "    y_that_nhieu_lop, y_du_doan_nhieu_lop, average='macro', zero_division=0)\n" +
            "print('macro P/R/F1:', round(p, 3), round(r, 3), round(f, 3))\n",
        },
        { t: 'h', text: 'Macro, micro hay weighted: câu hỏi của bài toán nhiều lớp', level: 2 },
        {
          t: 'p',
          md: 'Khi bài toán có nhiều hơn hai lớp — phân loại họ mã độc, phân loại kỹ thuật MITRE ATT&CK, định tuyến cảnh báo về đúng đội — bạn phải gộp chỉ số của từng lớp lại thành một con số. Cách gộp quyết định lớp nào được lắng nghe.',
        },
        {
          t: 'table',
          head: ['Cách gộp', 'Cách tính', 'Hệ quả', 'Dùng khi'],
          rows: [
            [
              'Micro',
              'Cộng dồn TP, FP, FN của tất cả các lớp rồi mới tính',
              'Lớp đông chi phối hoàn toàn; trong bài toán một nhãn nhiều lớp, micro-F1 chính bằng accuracy',
              'Bạn quan tâm tổng số quyết định đúng, không quan tâm phân bố theo lớp',
            ],
            [
              'Macro',
              'Tính chỉ số cho từng lớp rồi lấy trung bình cộng, không trọng số',
              'Một lớp có 12 mẫu có trọng lượng bằng lớp có 120.000 mẫu',
              'Mặc định nên dùng trong bảo mật: họ mã độc hiếm và kỹ thuật tấn công hiếm mới là thứ bạn cần bắt',
            ],
            [
              'Weighted',
              'Trung bình theo số mẫu của từng lớp',
              'Nằm giữa hai cái trên, nhưng vẫn thiên về lớp đông',
              'Báo cáo cho người ngoài, khi muốn con số phản ánh trải nghiệm trung bình',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Ba cái bẫy chết người khi đọc chỉ số',
          md: '**Bẫy 1 — Accuracy.** Đã mổ xẻ ở bài trước, nhưng nó vẫn xuất hiện trong 90% slide bán hàng. Quy tắc: thấy accuracy đứng một mình trong bài toán mất cân bằng thì coi như không có số liệu nào cả.\n\n**Bẫy 2 — F1 mặc định.** F1 giả định precision và recall quan trọng ngang nhau. Trong bảo mật điều đó gần như không bao giờ đúng. Tối ưu F1 cho một hệ thống chặn tự động là đang âm thầm đồng ý đánh đổi trải nghiệm người dùng lấy độ phủ.\n\n**Bẫy 3 — So sánh F1 ở ngưỡng 0,5.** Hai mô hình có phân bố điểm khác nhau; so ở cùng ngưỡng 0,5 là so hai điểm hoạt động ngẫu nhiên, không phải so hai mô hình. So sánh đúng: cùng số cảnh báo mỗi ngày, hoặc cùng mức recall.',
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'Một cách trình bày khiến cả phòng họp im lặng',
          md: 'Thay vì nói “mô hình đạt precision 0,12 và recall 0,80”, hãy nói:\n\n*“Ở cấu hình này, mỗi ngày đội mình nhận thêm 260 cảnh báo, khoảng 52 giờ công. Đổi lại ta bắt được 32 trong 40 email lừa đảo mỗi ngày, và vẫn để lọt 8 cái. Nếu siết lên ngưỡng 0,9 thì còn 28 cảnh báo mỗi ngày — 5,6 giờ công — nhưng chỉ bắt được 17, để lọt 23.”*\n\nCùng một dữ liệu, khác đơn vị. Đơn vị thứ hai khiến người có thẩm quyền ra được quyết định; đơn vị thứ nhất chỉ khiến họ gật đầu cho qua.',
        },
        { t: 'terms', ids: ['precision', 'recall', 'f1', 'bao-dong-gia', 'mat-can-bang'] },
      ],
      keyTakeaways: [
        'Precision hỏi “trong những lần tôi kêu, bao nhiêu lần đúng” — mẫu số là cột dự đoán dương; recall hỏi “trong những vụ thật, tôi bắt được bao nhiêu” — mẫu số là hàng thật dương.',
        'Cả hai đều không dùng TN, nên chúng sống sót trong mất cân bằng cực đoan còn accuracy thì không.',
        'Precision và recall luôn đi ngược chiều theo ngưỡng; so sánh hai mô hình phải so ở cùng một ràng buộc, không phải cùng ngưỡng 0,5.',
        'F_beta với beta² = số lần bạn coi trọng recall hơn precision; F1 chỉ là trường hợp beta = 1 và giả định này hiếm khi đúng trong bảo mật.',
        'Recall gần như không đổi khi tỉ lệ nền thay đổi, nhưng precision thì tụt theo — mô hình tốt ở nơi này có thể vô dụng ở nơi khác.',
        'Bài toán nhiều lớp: dùng macro nếu lớp hiếm là thứ bạn cần bắt; micro-F1 trong bài toán một nhãn chính là accuracy trá hình.',
      ],
      cards: [
        {
          id: 't4l2-c1',
          front: 'Phát biểu precision và recall bằng lời, không dùng công thức.',
          back: 'Precision: trong những lần mô hình kêu lên, bao nhiêu lần đúng. Recall: trong tất cả những vụ xấu thực sự xảy ra, mô hình bắt được bao nhiêu.',
          tags: ['precision', 'recall'],
        },
        {
          id: 't4l2-c2',
          front: 'Vì sao F1 dùng trung bình điều hoà chứ không phải trung bình cộng?',
          back: 'Vì trung bình điều hoà bị kéo mạnh về phía con số nhỏ hơn. P = 1,00 và R = 0,02 cho F1 ≈ 0,039 chứ không phải 0,51 — mô hình không thể gian lận bằng cách tối đa hoá một phía.',
          tags: ['f1'],
        },
        {
          id: 't4l2-c3',
          front: 'Trong F_beta, beta = 2 nghĩa là gì?',
          back: 'Recall được coi trọng gấp beta² = 4 lần precision. Dùng khi đầu ra chỉ vào hàng đợi cho người xem lại và bỏ sót đắt hơn nhiều so với làm phiền analyst.',
          tags: ['f1', 'do-luong'],
        },
        {
          id: 't4l2-c4',
          front: 'Khi tỉ lệ tấn công trong môi trường giảm 10 lần, precision và recall thay đổi ra sao?',
          back: 'Recall gần như không đổi (chỉ tính trên mẫu dương). Precision tụt gần 10 lần vì TP giảm còn FP giữ nguyên theo lưu lượng lành tính.',
          hint: 'Nhìn vào mẫu số của từng chỉ số xem cái nào chứa số mẫu âm.',
          tags: ['precision', 'base-rate'],
        },
        {
          id: 't4l2-c5',
          front: 'Vì sao trung bình macro thường đúng hơn micro cho bài toán nhiều lớp trong bảo mật?',
          back: 'Macro cho mọi lớp trọng số bằng nhau nên họ mã độc hoặc kỹ thuật tấn công hiếm không bị lớp đông nuốt mất. Micro trong bài toán một nhãn thực chất chính là accuracy.',
          tags: ['do-luong'],
        },
      ],
      quiz: [
        {
          id: 't4-l2-q1',
          kind: 'mcq',
          tags: ['precision', 'recall', 'do-luong'],
          q: 'Bộ lọc URL của bạn có precision 0,04 và recall 0,95, sinh 1.500 cảnh báo mỗi ngày. Đội SOC chỉ xử lý nổi 200 cảnh báo mỗi ngày. Hành động hợp lý nhất trước mắt là gì?',
          options: [
            'Huấn luyện lại mô hình với thuật toán mạnh hơn',
            'Nâng ngưỡng để còn khoảng 200 cảnh báo mỗi ngày và đo lại precision, recall tại đó',
            'Chuyển sang tối ưu F1 thay vì recall',
            'Giữ nguyên vì recall 0,95 là con số rất tốt',
          ],
          answer: 1,
          why: 'Mô hình đang hoạt động ở một điểm mà tổ chức không tiêu thụ nổi, nên 1.300 cảnh báo mỗi ngày không được xem — recall **thực tế** của cả hệ thống thấp hơn nhiều so với 0,95 trên giấy. Nâng ngưỡng về đúng công suất là hành động miễn phí, có ngay hôm nay, và cho bạn con số thật để so sánh về sau. Huấn luyện lại có thể cần, nhưng chỉ sau khi đã biết mô hình hiện tại làm được gì ở điểm hoạt động khả thi.',
          distractorWhy: [
            'Thuật toán mạnh hơn không giải quyết được việc bạn đang đọc kết quả ở sai điểm hoạt động; và nó tốn nhiều tuần.',
            '',
            'F1 vẫn là một lựa chọn tuỳ tiện về đánh đổi; ràng buộc thật ở đây là công suất 200 cảnh báo, không phải một chỉ số.',
            'Recall 0,95 trên giấy vô nghĩa nếu 87% cảnh báo không bao giờ có người mở ra.',
          ],
        },
        {
          id: 't4-l2-q2',
          kind: 'truefalse',
          tags: ['f1', 'do-luong'],
          q: 'Mô hình A có F1 = 0,74, mô hình B có F1 = 0,71, cả hai đo ở ngưỡng mặc định 0,5. Kết luận: A tốt hơn B.',
          answer: false,
          why: 'Ngưỡng 0,5 chỉ là giá trị mặc định của hàm `predict()`, không có ý nghĩa thống kê nào. Hai mô hình có phân bố điểm khác nhau, nên 0,5 rơi vào hai vị trí hoàn toàn khác nhau trên đường cong của chúng. B có thể vượt A ở mọi điểm hoạt động thực tế mà vẫn thua ở đúng một điểm ngẫu nhiên này. So sánh đúng: cố định một ràng buộc chung — cùng số cảnh báo mỗi ngày, hoặc cùng recall — rồi so chỉ số còn lại; hoặc so bằng chỉ số toàn ngưỡng như PR-AUC (bài tiếp theo).',
        },
        {
          id: 't4-l2-q3',
          kind: 'input',
          tags: ['precision', 'recall'],
          q: 'Trên 1.000.000 sự kiện có 200 sự kiện độc hại. Mô hình gắn cờ 5.000 sự kiện và bắt trúng 160. Precision bằng bao nhiêu phần trăm? (Nhập số, ví dụ 3,2 hoặc 3.2)',
          accept: ['3,2', '3.2', '3,2%', '3.2%', '0,032', '0.032'],
          placeholder: 'Nhập precision theo phần trăm…',
          hint: 'Precision = TP chia cho tổng số cảnh báo, không phải chia cho số vụ thật.',
          why: 'Precision = 160 / 5.000 = 0,032 = **3,2%**. Nghĩa là cứ khoảng 31 cảnh báo analyst mở ra mới có 1 cái thật. Recall thì đẹp: 160/200 = 80%. Đây là chân dung điển hình của một bộ phát hiện trong môi trường mất cân bằng cực đoan — recall trông ổn, precision thì thảm hoạ, và chính precision mới là thứ quyết định hệ thống có được đội SOC sử dụng hay bị tắt sau hai tuần.',
        },
        {
          id: 't4-l2-q4',
          kind: 'multi',
          tags: ['do-luong', 'precision'],
          q: 'Trường hợp nào nên chọn beta lớn hơn 1 (ưu tiên recall)? (Chọn tất cả đáp án đúng)',
          options: [
            'Mô hình sàng lọc sơ bộ, kết quả đi vào hàng đợi cho analyst xem lại',
            'Mô hình tự động khoá tài khoản khách hàng khi nghi ngờ chiếm quyền',
            'Bộ phát hiện rò rỉ dữ liệu quy mô lớn, sau nó không còn lớp kiểm soát nào',
            'Bộ lọc thư rác quyết định xoá thẳng email không cho người dùng thấy',
          ],
          answers: [0, 2],
          why: 'Nguyên tắc: hỏi **đầu ra của mô hình đi đâu**. Nếu đi vào hàng đợi cho con người, FP chỉ tốn thời gian và bạn nên ưu tiên recall. Nếu đầu ra là hành động tự động và khó đảo ngược — khoá tài khoản, xoá email — thì mỗi FP là một thiệt hại trực tiếp cho người dùng thật, và bạn phải ưu tiên precision. Lớp phòng thủ cuối cùng luôn nghiêng về recall vì sau nó không còn cơ hội nào nữa.',
        },
        {
          id: 't4-l2-q5',
          kind: 'mcq',
          tags: ['do-luong', 'nhieu-lop'],
          q: 'Bạn phân loại cảnh báo thành 8 loại để định tuyến về đúng đội. Loại “nghi ngờ mã hoá tống tiền” chỉ chiếm 0,3% dữ liệu nhưng quan trọng nhất. Nên báo cáo chỉ số nào?',
          options: [
            'Micro-F1, vì nó phản ánh tổng thể hệ thống',
            'Macro-F1, kèm theo precision và recall riêng của lớp quan trọng',
            'Accuracy nhiều lớp',
            'Weighted-F1, vì nó cân bằng nhất',
          ],
          answer: 1,
          why: 'Macro-F1 cho lớp 0,3% trọng số bằng lớp chiếm 40%, nên nó không cho phép mô hình bỏ rơi lớp hiếm để lấy điểm tổng. Nhưng macro-F1 vẫn là một con số gộp — với lớp thực sự quan trọng, bạn phải báo cáo precision và recall riêng của nó, vì đó là lớp mà quyết định vận hành phụ thuộc vào. Micro-F1 trong bài toán một nhãn chính là accuracy nên nó sẽ bị lớp đông chi phối hoàn toàn; weighted-F1 cũng thiên về lớp đông, chỉ đỡ hơn micro một chút.',
          distractorWhy: [
            'Micro gộp toàn bộ TP, FP, FN nên lớp 0,3% gần như không ảnh hưởng tới kết quả.',
            '',
            'Accuracy nhiều lớp có đúng khuyết điểm của accuracy nhị phân, thậm chí còn khó phát hiện hơn.',
            'Weighted lấy trọng số theo số mẫu, tức là cố tình cho lớp hiếm ít tiếng nói hơn — ngược với nhu cầu ở đây.',
          ],
        },
      ],
      terms: ['precision', 'recall', 'f1', 'bao-dong-gia', 'mat-can-bang', 'base-rate'],
      further: [
        {
          title: 'scikit-learn — Metrics and scoring: classification_report, fbeta_score',
          note: 'Đọc kỹ phần average và zero_division. Hai tham số này quyết định con số bạn báo cáo có nghĩa hay không.',
        },
        {
          title: 'Bảng tra: các tên gọi khác của recall',
          note: 'Recall = sensitivity = true positive rate = hit rate = detection rate. Bốn cái tên cùng một công thức, và bạn sẽ gặp cả bốn trong tài liệu ngành.',
        },
      ],
    },
  ],
};
