import type { Track } from './types';

/**
 * CHẶNG 10 — Vận hành, quản trị và sự nghiệp.
 *
 * Nguyên tắc biên soạn của chặng này:
 *  (a) Mọi bài đều bắt đầu từ một thứ hỏng trong ca trực thật, không từ sơ đồ kiến trúc.
 *  (b) Mỗi kỹ thuật vận hành đều đi kèm một ngưỡng số cụ thể để bạn mang đi dùng.
 *  (c) Phần quản trị nói đúng điều luật và tiêu chuẩn thật sự yêu cầu, không tô hồng.
 */
export const track10: Track = {
  id: 'van-hanh',
  order: 10,
  title: 'Vận hành, quản trị và sự nghiệp',
  tagline: 'Mô hình chạy được trong notebook không phải là sản phẩm',
  icon: 'rocket',
  hue: 't10',
  blurb:
    'Bảy bài về quãng đường từ "mô hình có AUC đẹp" tới "hệ thống trực 24/7 mà analyst tin tưởng". Bạn sẽ học kiến trúc suy luận và ngân sách độ trễ, cách phát hiện trôi trước khi nó thành sự cố, cách gói cảnh báo để analyst quyết định trong 30 giây, và khung quản trị mà kiểm toán viên sẽ hỏi tới. Chặng khép lại bằng năm dự án làm được với dữ liệu công khai và bản đồ nghề nghiệp thật.',
  outcomes: [
    'Chọn kiến trúc suy luận (batch, micro-batch, streaming, inline) từ ngân sách độ trễ và công suất xử lý cảnh báo của đội',
    'Chặn lệch huấn luyện–phục vụ bằng một hàm đặc trưng duy nhất cộng kiểm tra parity hằng ngày',
    'Tính PSI trên đặc trưng và trên điểm đầu ra, đặt ngưỡng cảnh báo trôi kèm hành động tương ứng',
    'Viết kế hoạch triển khai gồm chế độ bóng, canary và tiêu chí rollback có số, ký duyệt trước khi bật',
    'Trình bày lý do một cảnh báo bằng ba dòng SHAP dịch sang tiếng người mà analyst dùng được ngay',
    'Lập model card, hồ sơ lưu vết quyết định và bản đối chiếu NIST AI RMF / EU AI Act cho hệ thống phát hiện',
    'Hoàn thành một dự án đầu-cuối trên dữ liệu công khai và trình bày kết quả trung thực trong phỏng vấn',
  ],
  lessons: [
    /* ====================================================================== */
    {
      id: 't10-l1',
      trackId: 'van-hanh',
      title: 'Đưa mô hình vào sản xuất trong SOC',
      subtitle:
        'Khoảng cách giữa notebook và hệ thống trực 24/7 không nằm ở thuật toán — nó nằm ở độ trễ, ở đặc trưng lúc chạy thật, và ở cái analyst nhìn thấy.',
      minutes: 21,
      level: 'nang-cao',
      prereqs: ['t4-l4', 't4-l7'],
      why: {
        short:
          'Một mô hình chỉ tạo ra giá trị khi nó chạy đúng chỗ, đúng thời điểm, với đúng đặc trưng mà nó được huấn luyện — ba điều kiện này đều bị phá vỡ mặc định khi bạn rời notebook.',
        scenario:
          'Mô hình chấm điểm truy vấn DNS của bạn đạt PR-AUC 0,91 trên tập kiểm tra. Đội hạ tầng hỏi: đặt ở đâu, ăn bao nhiêu CPU, chịu được đỉnh 20.000 sự kiện mỗi giây không, nếu nó chết thì DNS có chết theo không. Trưởng ca SOC hỏi: mỗi ngày nó đẻ ra bao nhiêu cảnh báo, và analyst nhìn vào cảnh báo đó thì thấy cái gì. Bạn phải trả lời được cả hai phía trước khi ai đó cho bạn quyền triển khai.',
        roles: ['ML Engineer', 'Detection Engineer', 'Security Data Scientist', 'Security Architect'],
        costOfNotKnowing:
          'Bạn triển khai một mô hình tính đặc trưng bằng pandas trên log đã đóng phiên, còn lúc chạy thật phiên chưa kết thúc nên `duration` luôn bằng 0. Mô hình vẫn chạy, vẫn trả điểm, và điểm đó vô nghĩa. Không ai phát hiện trong ba tháng vì không có bảng giám sát nào so vector lúc phục vụ với vector lúc huấn luyện.',
      },
      objectives: [
        'Chọn được kiến trúc suy luận phù hợp cho một điểm đặt cụ thể dựa trên ngân sách độ trễ',
        'Tính ngược từ công suất xử lý cảnh báo của đội ra tỉ lệ dương tính tối đa mà mô hình được phép có',
        'Kể tên ba nguồn gây lệch huấn luyện–phục vụ và nêu biện pháp chặn cho từng nguồn',
        'Thiết kế gói cảnh báo đủ cho analyst quyết định mà không cần mở thêm công cụ khác',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Đội SOC của bạn có 6 analyst. Mỗi cảnh báo trung bình tốn 12 phút để phân loại, và thực tế mỗi người chỉ có khoảng 6 giờ hữu ích mỗi ngày. Hệ thống DNS của công ty xử lý trung bình 8.000 truy vấn mỗi giây. Nếu mô hình của bạn phải sinh ra lượng cảnh báo mà đội xử lý hết trong ngày, tỉ lệ dương tính tối đa nó được phép có là bao nhiêu?',
          reveal:
            'Công suất: 6 người × 6 giờ × 60 phút ÷ 12 phút = **180 cảnh báo mỗi ngày**. Khối lượng: 8.000 × 86.400 ≈ **691 triệu truy vấn mỗi ngày**. Tỉ lệ dương tính tối đa = 180 / 691.000.000 ≈ **2,6 × 10⁻⁷**, tức khoảng **1 cảnh báo trên 3,8 triệu sự kiện**. Đây mới là ràng buộc thật của bài toán, và nó khắc nghiệt hơn mọi thứ bạn từng thấy trong notebook. Nếu mô hình có FPR 0,01% — con số nghe rất đẹp — nó sẽ đẻ ra 69.000 cảnh báo mỗi ngày, gấp **383 lần** công suất của đội. Con số quyết định triển khai không phải AUC, mà là **cảnh báo trên ngày**.',
        },
        {
          t: 'p',
          md: 'Trong notebook, mô hình sống trong một thế giới lý tưởng: dữ liệu đã sạch, đã đủ, đã đứng yên, và không ai chờ kết quả. Trong sản xuất, cả bốn điều đó đều sai. Bài này nói về việc bắc cầu qua khoảng cách ấy.',
        },
        {
          t: 'p',
          md: 'Có một bài viết kinh điển của Sculley và cộng sự (Google, NeurIPS 2015) tên là *Hidden Technical Debt in Machine Learning Systems*, trong đó có một hình vẽ nổi tiếng: ô "mã của mô hình ML" là một hình chữ nhật bé xíu giữa hàng chục ô lớn hơn nhiều — thu thập dữ liệu, kiểm tra dữ liệu, hạ tầng phục vụ, giám sát, quản lý cấu hình. Trong bảo mật, tỉ lệ đó còn lệch hơn nữa.',
        },
        {
          t: 'figure',
          id: 'fig-soc-pipeline',
          caption:
            'Mô hình chỉ là một hộp nhỏ nằm giữa đường ống. Bên trái là thu thập, chuẩn hoá và tính đặc trưng; bên phải là làm giàu, xếp hạng, gói cảnh báo và đưa vào SIEM/SOAR. Hỏng ở bất kỳ hộp nào cũng làm hộp mô hình vô nghĩa.',
        },
        { t: 'h', text: 'Bước 1 — Ngân sách độ trễ quyết định kiến trúc', level: 2 },
        {
          t: 'p',
          md: 'Đừng bắt đầu bằng câu hỏi "dùng Kafka hay Airflow". Bắt đầu bằng câu hỏi: **ai đang chờ kết quả này, và họ chờ được bao lâu?** Câu trả lời tự động loại bỏ ba phần tư các lựa chọn kiến trúc.',
        },
        {
          t: 'table',
          caption: 'Ngân sách độ trễ theo điểm đặt mô hình — con số tham chiếu thực tế',
          head: ['Điểm đặt', 'Ngân sách (p99)', 'Kiểu suy luận', 'Hỏng thì sao'],
          rows: [
            [
              'Hook nhân EDR, chặn trước khi tiến trình chạy',
              'dưới 50 ms',
              'Inline, mô hình nhúng trong agent',
              'Máy trạm treo, người dùng gọi helpdesk trong 5 phút',
            ],
            [
              'Cổng thư điện tử (SMTP) trước khi phát thư',
              '1–5 giây',
              'Inline đồng bộ',
              'Thư bị tempfail hàng loạt, đối tác tưởng mất liên lạc',
            ],
            [
              'DNS resolver hoặc web proxy',
              '20–100 ms',
              'Inline có bộ nhớ đệm',
              'Người dùng thấy web chậm, đội mạng đổ lỗi cho bạn',
            ],
            [
              'Làm giàu cảnh báo trong SIEM',
              '1–30 giây',
              'Streaming (Kafka/Kinesis + consumer)',
              'Cảnh báo tới analyst thiếu điểm rủi ro, họ bỏ qua',
            ],
            [
              'Chấm điểm UEBA theo cửa sổ giờ',
              '5–60 phút',
              'Micro-batch theo lịch',
              'Phát hiện muộn, nhưng thường vẫn kịp',
            ],
            [
              'Săn tìm hồi tố (retro-hunt) trên 90 ngày log',
              'Giờ tới ngày',
              'Batch trên kho dữ liệu',
              'Chỉ tốn tiền tính toán, không ai bị chặn',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Quy tắc chọn kiến trúc trong một câu',
          md: 'Nếu quyết định của mô hình **chặn** một hành động của người dùng thì bạn đang ở chế độ inline và phải trả giá bằng độ trễ, bằng yêu cầu sẵn sàng cao, và bằng nỗi sợ báo động giả. Nếu nó chỉ **xếp hạng** thứ analyst sẽ xem thì bạn ở chế độ streaming hoặc batch, chậm hơn nhưng an toàn hơn rất nhiều. Đa số hệ thống ML bảo mật thành công đều chọn xếp hạng trước, chặn sau — và chỉ chặn ở dải điểm rất cao.',
        },
        { t: 'h', text: 'Bước 2 — Đặc trưng lúc chạy thật lấy từ đâu', level: 2 },
        {
          t: 'p',
          md: 'Đặc trưng như "số lần đăng nhập thất bại của tài khoản này trong 24 giờ qua" hay "số tên miền NXDOMAIN mà máy này truy vấn trong 1 giờ" không nằm trong sự kiện đang tới. Chúng phải được tra cứu ở đâu đó, trong vài mili-giây. Đó là lý do **feature store** tồn tại.',
        },
        {
          t: 'compare',
          title: 'Hai nửa của một feature store',
          left: {
            title: '⚡ Kho trực tuyến (online)',
            items: [
              'Redis, DynamoDB, Cassandra — đọc dưới 10 ms',
              'Chỉ giữ giá trị MỚI NHẤT cho mỗi thực thể (user, host, IP)',
              'Phục vụ suy luận thời gian thực',
              'Dung lượng nhỏ, chi phí theo số thực thể, không theo lịch sử',
              'Rủi ro: nếu job cập nhật chết, mô hình vẫn chạy với số liệu cũ mà không báo lỗi',
            ],
          },
          right: {
            title: '🗄️ Kho ngoại tuyến (offline)',
            items: [
              'Parquet trên S3, Delta Lake, Iceberg, BigQuery',
              'Giữ TOÀN BỘ lịch sử có dấu thời gian',
              'Phục vụ huấn luyện và đánh giá lại',
              'Bắt buộc hỗ trợ join đúng thời điểm (point-in-time correctness)',
              'Rủi ro: join sai thời điểm là nguồn rò rỉ dữ liệu tinh vi nhất trong ML bảo mật',
            ],
          },
        },
        {
          t: 'p',
          md: '**Join đúng thời điểm** nghĩa là: khi tạo mẫu huấn luyện cho một sự kiện xảy ra lúc 02:31:07, bạn chỉ được phép ghép các giá trị đặc trưng đã tồn tại **trước** 02:31:07. Nghe hiển nhiên, nhưng một câu `JOIN ... ON entity_id` không kèm điều kiện thời gian sẽ lấy giá trị của ngày hôm sau — và mô hình của bạn đọc được tương lai.',
        },
        { t: 'h', text: 'Bước 3 — Lệch huấn luyện–phục vụ, kẻ giết người thầm lặng', level: 2 },
        {
          t: 'p',
          md: '**Lệch huấn luyện–phục vụ** (training-serving skew) là khi vector đặc trưng lúc chạy thật khác vector lúc huấn luyện, dù cùng một sự kiện. Nó không ném exception. Nó chỉ làm chất lượng tụt và không ai biết vì sao.',
        },
        {
          t: 'steps',
          title: 'Ba nguồn gây lệch và cách chặn từng nguồn',
          steps: [
            {
              title: 'Lệch mã (code skew)',
              md: 'Bạn tính đặc trưng bằng pandas trong notebook, đội hạ tầng viết lại bằng Go trong dịch vụ suy luận. Hai bản làm tròn khác nhau, xử lý `null` khác nhau, hiểu múi giờ khác nhau. **Chặn bằng:** một hàm tính đặc trưng duy nhất, đóng gói thành thư viện, được cả job huấn luyện lẫn dịch vụ phục vụ import. Nếu bắt buộc phải viết hai bản, thì phải có bộ kiểm thử đối chiếu chạy trên cùng 10.000 sự kiện mẫu trong CI.',
            },
            {
              title: 'Lệch dữ liệu theo trạng thái (partial-record skew)',
              md: 'Ví dụ kinh điển với Zeek: lúc huấn luyện bạn đọc `conn.log` đã đóng nên `duration` và `resp_bytes` đầy đủ. Lúc chạy thật, sự kiện tới khi phiên **chưa kết thúc**, nên `duration = 0` và `resp_bytes = 0`. Mô hình nhận toàn số 0 ở những cột quan trọng nhất. **Chặn bằng:** huấn luyện trên đúng ảnh chụp trạng thái mà lúc phục vụ sẽ thấy — nghĩa là cắt cụt dữ liệu huấn luyện theo cùng cửa sổ thời gian.',
            },
            {
              title: 'Lệch làm giàu theo thời gian (enrichment time-travel)',
              md: 'Lúc huấn luyện bạn join GeoIP, WHOIS và threat intel bằng phiên bản cơ sở dữ liệu **hôm nay**. Nhưng tại thời điểm sự kiện xảy ra sáu tháng trước, tên miền đó chưa nằm trong danh sách IOC nào. Mô hình học được rằng "tên miền có trong TI" là tín hiệu mạnh — trong khi lúc phục vụ, tín hiệu đó xuất hiện muộn hơn cảnh báo. **Chặn bằng:** lưu TI có phiên bản kèm dấu thời gian và join đúng thời điểm.',
            },
            {
              title: 'Cách phát hiện lệch sau khi đã triển khai',
              md: 'Ghi lại **vector đặc trưng đã dùng** kèm mỗi lần chấm điểm (hoặc ít nhất là hash của nó). Mỗi ngày, lấy mẫu ngẫu nhiên 1.000 lần chấm điểm, tính lại đặc trưng ngoại tuyến từ log gốc, so từng cột. Bất kỳ cột nào lệch quá 0,1% số mẫu là một lỗi cần điều tra, không phải nhiễu.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'dac_trung.py — một nguồn sự thật duy nhất, import bởi cả job huấn luyện lẫn dịch vụ suy luận',
          code: `import math, json, hashlib
from dataclasses import dataclass, asdict

PHIEN_BAN_DAC_TRUNG = '2026.07.1'   # đổi khi logic đổi; ghi kèm mọi cảnh báo

@dataclass(frozen=True)
class DacTrungKetNoi:
    log_orig_bytes: float
    log_resp_bytes: float
    ty_le_byte: float
    gio_sin: float
    gio_cos: float
    la_cong_phu_du: int

def tinh_dac_trung(sk: dict) -> DacTrungKetNoi:
    # Giá trị thiếu phải xử lý GIỐNG NHAU ở cả hai phía, nếu không sinh skew.
    ob = float(sk.get('orig_bytes') or 0.0)
    rb = float(sk.get('resp_bytes') or 0.0)
    gio = (float(sk['ts']) % 86400) / 3600.0
    return DacTrungKetNoi(
        log_orig_bytes=math.log1p(ob),
        log_resp_bytes=math.log1p(rb),
        ty_le_byte=rb / (ob + 1.0),
        gio_sin=math.sin(2 * math.pi * gio / 24),
        gio_cos=math.cos(2 * math.pi * gio / 24),
        la_cong_phu_du=int(int(sk.get('id.resp_p', 0)) >= 49152),
    )

def dau_van_tay(dt: DacTrungKetNoi) -> str:
    # Lưu cùng cảnh báo. Job kiểm tra parity chạy lại hàm trên và so hash.
    raw = json.dumps(asdict(dt), sort_keys=True).encode()
    return hashlib.sha256(raw).hexdigest()[:12]`,
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't10l1-cp1',
              kind: 'mcq',
              tags: ['san-xuat', 'do-tre'],
              q: 'Bạn muốn chấm điểm rủi ro cho mọi phiên đăng nhập Azure AD và hiển thị điểm đó trong cảnh báo Sentinel. Analyst xem cảnh báo trung bình 3 phút sau khi nó xuất hiện. Kiến trúc hợp lý nhất là gì?',
              options: [
                'Inline đồng bộ: chặn đăng nhập cho tới khi mô hình trả lời',
                'Streaming: đọc log từ hàng đợi, chấm điểm trong vài giây, ghi kết quả vào cảnh báo',
                'Batch mỗi 24 giờ, ghi điểm vào bảng tra cứu',
                'Nhúng mô hình vào agent trên từng máy trạm',
              ],
              answer: 1,
              why: 'Mô hình chỉ **xếp hạng**, không chặn, nên không cần inline — và inline ở đây còn nguy hiểm vì một lỗi mô hình sẽ khoá đăng nhập toàn công ty. Ngân sách thật là "trước khi analyst mở cảnh báo", tức khoảng 3 phút, quá thoải mái cho streaming vài giây. Batch 24 giờ thì điểm tới muộn hơn cả cảnh báo, vô dụng.',
              distractorWhy: [
                'Chặn đăng nhập bằng một mô hình xác suất là cách nhanh nhất để tạo sự cố toàn công ty khi mô hình sai hoặc dịch vụ chết.',
                '',
                'Điểm rủi ro tới sau khi analyst đã đóng cảnh báo thì không còn tác dụng gì.',
                'Đặc trưng cần ở đây là hành vi tài khoản trên toàn tổ chức, máy trạm không có dữ liệu đó.',
              ],
            },
            {
              id: 't10l1-cp2',
              kind: 'truefalse',
              tags: ['training-serving-skew'],
              q: 'Nếu dịch vụ suy luận không ném lỗi và điểm số trả về nằm trong khoảng hợp lệ thì có thể kết luận không có lệch huấn luyện–phục vụ.',
              answer: false,
              why: 'Lệch huấn luyện–phục vụ hầu như **không bao giờ** biểu hiện thành lỗi. Một cột `duration` luôn bằng 0 vẫn cho ra điểm số hợp lệ trong khoảng [0, 1]. Cách duy nhất phát hiện là chủ động so sánh: ghi lại vector đặc trưng lúc phục vụ, tính lại ngoại tuyến trên cùng sự kiện, đối chiếu từng cột theo lịch.',
            },
          ],
        },
        { t: 'h', text: 'Bước 4 — Gói cảnh báo cho analyst, không cho nhà khoa học dữ liệu', level: 2 },
        {
          t: 'p',
          md: 'Mô hình của bạn không nên tạo ra một loại cảnh báo mới. Nó nên **làm giàu** dòng cảnh báo sẵn có bằng các trường: `risk_score`, `model_name`, `model_version`, `feature_version`, `top_reasons`, `baseline_so_sanh`. Analyst đã có quy trình cho cảnh báo; đừng bắt họ học một giao diện khác.',
        },
        {
          t: 'checklist',
          title: 'Một cảnh báo có ML phải trả lời đủ sáu câu trước khi analyst phải mở công cụ khác',
          items: [
            'CHUYỆN GÌ — một câu tiếng người, không phải tên luật viết hoa toàn bộ',
            'AI VÀ Ở ĐÂU — tài khoản, máy, IP, đã chuẩn hoá về định danh mà CMDB hiểu',
            'KHI NÀO — dấu thời gian kèm múi giờ, và cửa sổ quan sát đã dùng',
            'VÌ SAO MÔ HÌNH NGHĨ VẬY — tối đa 3 lý do, mỗi lý do kèm giá trị và mức bình thường của chính thực thể đó',
            'HIẾM CỠ NÀO — thực thể này đứng ở phân vị bao nhiêu so với 30 ngày trước và so với nhóm ngang hàng',
            'LÀM GÌ TIẾP — hai tới ba bước kiểm chứng cụ thể, kèm liên kết truy vấn sẵn sàng bấm',
          ],
        },
        {
          t: 'p',
          md: 'Về **SOAR**: đừng để playbook tự động hành động ở dải điểm mà mô hình chưa được hiệu chuẩn. Mẫu phân tầng an toàn thường dùng là ba dải — điểm trên 0,95 và tài sản không thuộc nhóm trọng yếu thì tự động cách ly; 0,60 đến 0,95 thì mở ticket kèm ngữ cảnh; dưới 0,60 thì chỉ ghi log để phân tích xu hướng.',
        },
        {
          t: 'lab',
          id: 'lab-alert-load',
          intro:
            'Vặn số analyst, thời gian xử lý mỗi cảnh báo, khối lượng sự kiện và FPR để xem chính xác lúc nào đội bạn vỡ trận. Thử tái tạo con số 2,6 × 10⁻⁷ ở đầu bài, rồi thử xem nếu tăng từ 6 lên 9 analyst thì ngưỡng được nới bao nhiêu — bạn sẽ thấy tuyển thêm người là cách đắt nhất để mua thêm một chút ngưỡng.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bốn cái bẫy khi rời notebook',
          md: '**1. Không có phiên bản.** Cảnh báo không ghi `model_version` và `feature_version`. Ba tháng sau có tranh cãi về một cảnh báo cũ và không ai biết lúc đó mô hình nào đang chạy.\n\n**2. Mô hình là điểm chết đơn.** Dịch vụ chấm điểm chết kéo theo cả đường ống log. Quy tắc: nếu mô hình không trả lời trong ngân sách, hệ thống phải **đi tiếp không có điểm**, ghi cờ `score_missing=true`, chứ không được dừng.\n\n**3. Bộ nhớ đệm không có hạn dùng.** Đặc trưng "số lần thất bại trong 24 giờ" đọc từ Redis mà job cập nhật đã chết từ hôm qua. Luôn ghi kèm `feature_computed_at` và từ chối chấm điểm nếu đặc trưng quá cũ.\n\n**4. Không ai đo cảnh báo trên ngày trước khi bật.** Đây là con số duy nhất trưởng ca SOC quan tâm, và bạn hoàn toàn tính được nó từ tập kiểm tra trước khi triển khai một dòng mã.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Mẹo thực chiến: chạy khô bằng log lịch sử một tuần',
          md: 'Trước khi bật bất cứ thứ gì, cho mô hình chạy lại trên đúng bảy ngày log gần nhất và xuất ra danh sách cảnh báo mà nó **sẽ** tạo. Ngồi cùng một analyst và cùng đọc 30 cảnh báo ngẫu nhiên trong danh sách đó. Buổi ngồi 90 phút này thường tiết kiệm cho bạn hàng tháng tranh cãi, và gần như lần nào cũng lộ ra một đặc trưng bị rò rỉ hoặc một nhóm tài sản cần ngưỡng riêng.',
        },
        {
          t: 'terms',
          ids: ['training-serving-skew', 'siem', 'soar', 'suy-luan', 'alert-fatigue'],
        },
      ],
      keyTakeaways: [
        'Ngân sách độ trễ, chứ không phải sở thích công nghệ, quyết định kiến trúc suy luận.',
        'Công suất xử lý cảnh báo của đội quy ngược ra tỉ lệ dương tính tối đa cho phép — thường là 10⁻⁶ hoặc nhỏ hơn.',
        'Feature store có hai nửa: kho trực tuyến phục vụ suy luận, kho ngoại tuyến phục vụ huấn luyện với join đúng thời điểm.',
        'Lệch huấn luyện–phục vụ đến từ lệch mã, bản ghi chưa hoàn chỉnh và làm giàu nhìn thấy tương lai — cả ba đều im lặng.',
        'Một hàm tính đặc trưng duy nhất cộng kiểm tra parity hằng ngày là biện pháp rẻ nhất và hiệu quả nhất.',
        'Mô hình nên làm giàu cảnh báo sẵn có chứ không tạo loại cảnh báo mới, và phải trả lời đủ sáu câu hỏi của analyst.',
      ],
      cards: [
        {
          id: 't10l1-c1',
          front: 'Con số nào quyết định việc một mô hình phát hiện có được triển khai hay không — và nó tính từ đâu?',
          back: 'Số cảnh báo trên ngày. Tính từ công suất đội (số analyst × giờ hữu ích ÷ thời gian xử lý mỗi cảnh báo) đối chiếu với khối lượng sự kiện × tỉ lệ dương tính.',
          tags: ['san-xuat', 'alert-fatigue'],
        },
        {
          id: 't10l1-c2',
          front: 'Kể ba nguồn gây lệch huấn luyện–phục vụ.',
          back: 'Lệch mã (hai bản cài đặt đặc trưng khác nhau), bản ghi chưa hoàn chỉnh lúc phục vụ (phiên chưa đóng), và làm giàu nhìn thấy tương lai (join TI/GeoIP bằng phiên bản hôm nay).',
          tags: ['training-serving-skew'],
        },
        {
          id: 't10l1-c3',
          front: 'Biện pháp rẻ nhất để phát hiện lệch huấn luyện–phục vụ sau khi đã triển khai là gì?',
          back: 'Ghi lại vector đặc trưng (hoặc hash) kèm mỗi lần chấm điểm, mỗi ngày lấy mẫu 1.000 sự kiện tính lại ngoại tuyến và so từng cột.',
          tags: ['training-serving-skew', 'giam-sat'],
        },
        {
          id: 't10l1-c4',
          front: 'Vì sao join đặc trưng phải "đúng thời điểm" (point-in-time)?',
          back: 'Vì chỉ được dùng giá trị đã tồn tại TRƯỚC thời điểm sự kiện; join không kèm điều kiện thời gian sẽ lấy giá trị tương lai và gây rò rỉ dữ liệu.',
          hint: 'Nghĩ tới cột threat intel của ngày mai.',
          tags: ['ro-ri-du-lieu', 'feature-store'],
        },
        {
          id: 't10l1-c5',
          front: 'Khi dịch vụ chấm điểm không trả lời kịp ngân sách độ trễ, đường ống log phải làm gì?',
          back: 'Đi tiếp không có điểm, gắn cờ score_missing, không bao giờ chặn dòng log. Mô hình không được là điểm chết đơn của hệ thống thu thập.',
          tags: ['san-xuat', 'do-tre'],
        },
      ],
      quiz: [
        {
          id: 't10l1-q1',
          kind: 'mcq',
          tags: ['san-xuat', 'alert-fatigue'],
          q: 'Mô hình của bạn có FPR 0,01% trên tập kiểm tra và chạy trên 50 triệu sự kiện mỗi ngày. Đội SOC xử lý được 200 cảnh báo mỗi ngày. Kết luận đúng nhất?',
          options: [
            'FPR 0,01% là rất tốt, có thể triển khai ngay',
            'Sẽ có khoảng 5.000 cảnh báo giả mỗi ngày, gấp 25 lần công suất — phải nâng ngưỡng hoặc thu hẹp phạm vi',
            'Chỉ cần tăng recall là số cảnh báo giả sẽ giảm',
            'Vấn đề nằm ở thuật toán, nên đổi sang mạng nơ-ron',
          ],
          answer: 1,
          why: '50.000.000 × 0,0001 = **5.000** cảnh báo giả mỗi ngày, trong khi công suất là 200. Đây là bài toán số học đơn giản mà rất nhiều dự án bỏ qua cho tới lúc triển khai. Hai hướng xử lý thực tế: nâng ngưỡng (đổi recall lấy precision) hoặc **thu hẹp phạm vi** — chỉ chấm điểm cho nhóm tài sản trọng yếu, giảm mẫu số từ 50 triệu xuống vài trăm nghìn. Hướng thứ hai thường hiệu quả hơn và ít ai nghĩ tới.',
          distractorWhy: [
            'FPR nghe nhỏ nhưng nhân với mẫu số khổng lồ vẫn ra con số không thể xử lý. Đây chính là nghịch lý tỉ lệ nền ở dạng vận hành.',
            '',
            'Tăng recall thường LÀM TĂNG cảnh báo giả, vì bạn phải hạ ngưỡng.',
            'Đổi thuật toán hiếm khi thay đổi được hai bậc độ lớn; ngưỡng và phạm vi thì có.',
          ],
        },
        {
          id: 't10l1-q2',
          kind: 'multi',
          tags: ['training-serving-skew', 'san-xuat'],
          q: 'Biện pháp nào thực sự làm giảm nguy cơ lệch huấn luyện–phục vụ? (Chọn tất cả)',
          options: [
            'Dùng chung một thư viện tính đặc trưng cho cả huấn luyện và phục vụ',
            'Tăng số cây trong LightGBM để mô hình bền hơn',
            'Ghi lại vector đặc trưng lúc phục vụ và đối chiếu định kỳ với bản tính lại ngoại tuyến',
            'Huấn luyện trên đúng ảnh chụp trạng thái mà lúc phục vụ sẽ nhìn thấy',
          ],
          answers: [0, 2, 3],
          why: 'Lệch là vấn đề **kỹ thuật dữ liệu**, không phải vấn đề dung lượng mô hình. Thư viện dùng chung chặn lệch mã; đối chiếu định kỳ phát hiện lệch còn sót; huấn luyện trên ảnh chụp đúng trạng thái chặn lệch do bản ghi chưa hoàn chỉnh. Tăng số cây không liên quan gì — mô hình mạnh hơn chỉ học kỹ hơn các đặc trưng mà lúc phục vụ nó sẽ không có.',
        },
        {
          id: 't10l1-q3',
          kind: 'order',
          tags: ['san-xuat', 'quy-trinh'],
          q: 'Sắp xếp thứ tự hợp lý các bước đưa một mô hình phát hiện vào sản xuất.',
          items: [
            'Xác định điểm đặt và ngân sách độ trễ, chốt với đội hạ tầng',
            'Tính số cảnh báo trên ngày ở ngưỡng dự kiến và đối chiếu với công suất đội SOC',
            'Chạy khô trên log lịch sử một tuần, đọc 30 cảnh báo mẫu cùng một analyst',
            'Đóng gói hàm đặc trưng dùng chung, bật ghi vector và kiểm tra parity',
            'Bật chế độ bóng, chỉ ghi log không gửi cảnh báo, theo dõi tối thiểu một tuần',
            'Mở dần cho một nhóm tài sản nhỏ với tiêu chí rollback đã ký duyệt',
          ],
          why: 'Thứ tự này đặt các câu hỏi **rẻ nhất và có khả năng giết dự án nhất** lên trước. Ngân sách độ trễ và số cảnh báo trên ngày có thể tính trên giấy trong một buổi sáng; nếu chúng không khả thi thì mọi công sức kỹ thuật phía sau đều lãng phí. Chạy khô và đọc cảnh báo cùng analyst đứng trước cả việc dựng hạ tầng, vì nó thường lộ ra lỗi đặc trưng mà không có bảng giám sát nào bắt được.',
        },
        {
          id: 't10l1-q4',
          kind: 'input',
          tags: ['feature-store'],
          q: 'Thuộc tính bắt buộc của kho đặc trưng ngoại tuyến, đảm bảo mẫu huấn luyện chỉ dùng giá trị đã tồn tại trước thời điểm sự kiện, tên tiếng Anh là gì?',
          accept: ['point-in-time correctness', 'point in time correctness', 'point-in-time', 'point in time join', 'point-in-time join'],
          placeholder: 'Gõ thuật ngữ tiếng Anh…',
          hint: 'Ba từ, bắt đầu bằng "point".',
          why: 'Point-in-time correctness bảo đảm mỗi mẫu huấn luyện chỉ nhìn thấy trạng thái quá khứ. Thiếu nó, câu join theo `entity_id` sẽ lấy giá trị đặc trưng mới nhất — bao gồm cả giá trị hình thành **sau** khi sự cố xảy ra. Kết quả điển hình: mô hình đạt điểm rất cao khi đánh giá ngoại tuyến rồi sụp hoàn toàn lúc chạy thật, và đội mất hàng tuần tìm nguyên nhân ở nơi khác.',
        },
        {
          id: 't10l1-q5',
          kind: 'truefalse',
          tags: ['san-xuat', 'siem'],
          q: 'Cách tốt nhất để đưa kết quả mô hình tới analyst là tạo một loại cảnh báo mới với giao diện riêng của đội data science.',
          answer: false,
          why: 'Ngược lại. Analyst đã có quy trình, hàng đợi, SLA và công cụ điều tra quanh dòng cảnh báo hiện có. Một giao diện riêng nghĩa là thêm một tab họ phải nhớ mở, và trong ca trực bận thì tab đó không bao giờ được mở. Cách hiệu quả là **làm giàu** cảnh báo sẵn có bằng các trường điểm rủi ro, phiên bản mô hình và lý do — hoặc dùng điểm để **sắp xếp lại thứ tự** hàng đợi hiện tại.',
        },
      ],
      terms: ['training-serving-skew', 'siem', 'soar', 'suy-luan', 'alert-fatigue'],
      further: [
        {
          title: 'Sculley et al. — Hidden Technical Debt in Machine Learning Systems (NeurIPS 2015)',
          note: 'Bài báo giải thích vì sao mã mô hình chỉ chiếm một phần rất nhỏ của hệ thống thật. Đọc mục về entanglement và hidden feedback loops.',
          url: 'https://papers.nips.cc/paper_files/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html',
        },
        {
          title: 'Google — Rules of Machine Learning (Martin Zinkevich)',
          note: 'Bốn mươi ba quy tắc rút từ kinh nghiệm vận hành thật. Quy tắc 29 và 32 nói thẳng về lệch huấn luyện–phục vụ.',
          url: 'https://developers.google.com/machine-learning/guides/rules-of-ml',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't10-l2',
      trackId: 'van-hanh',
      title: 'Trôi dữ liệu và trôi khái niệm',
      subtitle:
        'Mọi mô hình đều hỏng dần theo thời gian. Trong bảo mật, có người được trả tiền để làm nó hỏng nhanh hơn.',
      minutes: 20,
      level: 'nang-cao',
      prereqs: ['t10-l1'],
      why: {
        short:
          'Một mô hình phát hiện không hỏng vào một ngày cụ thể mà rỉ dần, và nếu bạn không đo được sự rỉ đó thì bạn chỉ biết khi có người bị xâm nhập.',
        scenario:
          'Tháng 3, mô hình DGA của bạn có precision 0,82 theo phản hồi analyst. Tháng 6, vẫn không ai báo lỗi, không có exception nào, bảng giám sát hạ tầng toàn màu xanh. Nhưng số cảnh báo mỗi ngày đã tụt từ 40 xuống 11, và một nhóm tấn công đã chuyển sang họ DGA dùng từ điển tiếng Anh mà mô hình entropy của bạn không thấy. Câu hỏi duy nhất quan trọng: bạn có công cụ nào phát hiện điều đó vào tháng 4 thay vì tháng 9 không?',
        roles: ['Security Data Scientist', 'ML Engineer', 'Detection Engineer', 'Threat Hunter'],
        costOfNotKnowing:
          'Bạn tin vào chỉ số đo được sáu tháng trước. Mô hình vẫn chạy, vẫn trả điểm, vẫn có bảng giám sát xanh — trong khi tỉ lệ bỏ sót đã tăng gấp ba. Khi sự cố xảy ra, câu hỏi của lãnh đạo sẽ là "vì sao hệ thống trị giá 2 tỉ không kêu", và bạn không có dữ liệu để trả lời.',
      },
      objectives: [
        'Phân biệt trôi dữ liệu và trôi khái niệm bằng một ví dụ bảo mật cụ thể cho mỗi loại',
        'Giải thích vì sao mô hình bảo mật trôi nhanh hơn mô hình ở các ngành khác',
        'Tính PSI giữa hai phân phối và đọc kết quả theo ba mức ngưỡng chuẩn',
        'Thiết kế bảng giám sát trôi có ngưỡng gắn với hành động cụ thể, không chỉ để nhìn',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Tháng 5/2018, GDPR có hiệu lực và phần lớn dữ liệu WHOIS công khai bị che. Mô hình phát hiện phishing của bạn dùng đặc trưng "tuổi tên miền tính từ WHOIS" như một trong ba đặc trưng mạnh nhất. Chuyện gì xảy ra với mô hình — nó có báo lỗi không, và loại trôi nào đang diễn ra?',
          reveal:
            'Nó **không báo lỗi**. Trường tuổi tên miền đơn giản trở thành rỗng hoặc mặc định, thường được điền bằng −1 hoặc bằng giá trị trung vị trong bước xử lý thiếu dữ liệu. Mô hình vẫn trả điểm bình thường, chỉ là mất hẳn một trong ba trụ cột. Đây là **trôi dữ liệu** (data drift): phân phối của đầu vào P(X) thay đổi, còn quan hệ giữa "tên miền mới đăng ký" và "phishing" thì không đổi chút nào. Điểm đáng nhớ: nguyên nhân trôi lần này không phải kẻ tấn công, mà là **một quy định pháp luật** — nhắc bạn rằng danh sách nguồn gây trôi rộng hơn bạn tưởng.',
        },
        {
          t: 'p',
          md: 'Có hai thứ khác nhau cùng bị gọi là "trôi", và lẫn chúng dẫn tới xử lý sai. Hãy tách bạch ngay từ đầu bằng ký hiệu xác suất mà bạn đã quen.',
        },
        {
          t: 'compare',
          title: 'Hai loại trôi, hai cách xử lý khác nhau',
          left: {
            title: '📦 Trôi dữ liệu — P(X) đổi',
            items: [
              'Phân phối đầu vào đổi, quan hệ đầu vào → nhãn giữ nguyên',
              'Ví dụ: công ty chuyển 70% máy sang làm việc từ xa, phân phối IP nguồn và giờ truy cập đổi hoàn toàn',
              'Ví dụ: TLS 1.3 và ECH làm mất trường SNI, cả một họ đặc trưng biến thành rỗng',
              'Ví dụ: nâng cấp Zeek đổi cách ghi conn_state',
              'Phát hiện được KHÔNG CẦN nhãn — chỉ cần so phân phối đầu vào',
              'Xử lý: huấn luyện lại trên dữ liệu mới thường là đủ',
            ],
          },
          right: {
            title: '🎭 Trôi khái niệm — P(y|X) đổi',
            items: [
              'Cùng một đầu vào, nhưng nhãn đúng đã khác',
              'Ví dụ: PowerShell mã hoá base64 từng hiếm và đáng ngờ, nay là chuẩn của công cụ triển khai hợp lệ',
              'Ví dụ: DGA chuyển từ chuỗi ngẫu nhiên sang ghép từ điển (suppobox, matsnu) — entropy thấp mà vẫn là DGA',
              'Ví dụ: macro Office bị Microsoft chặn mặc định (2022), kẻ tấn công chuyển sang ISO, LNK, OneNote',
              'Phát hiện CẦN nhãn mới, hoặc ít nhất là phản hồi từ analyst',
              'Xử lý: thường phải làm lại đặc trưng, không chỉ huấn luyện lại',
            ],
          },
        },
        {
          t: 'figure',
          id: 'fig-drift',
          caption:
            'Trục thời gian với ba đường: phân phối đặc trưng, ranh giới quyết định thật, và chất lượng đo được. Trôi dữ liệu làm đám mây điểm dịch chuyển; trôi khái niệm làm ranh giới đúng xoay đi trong khi ranh giới mô hình đứng yên.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao bảo mật trôi nhanh hơn mọi ngành khác',
          md: 'Mô hình dự đoán nhu cầu điện đối mặt với thời tiết. Thời tiết không đọc mô hình của bạn và không cố tình đổi hành vi. Mô hình phát hiện xâm nhập đối mặt với **con người được trả tiền để làm nó sai**, và họ có vòng lặp phản hồi: họ thử, thấy bị chặn, đổi cách, thử lại. Đây là trôi **do đối thủ chủ động tạo ra** (adversarial drift), và nó không tuân theo bất kỳ giả định thống kê nào về sự thay đổi từ từ. Cộng thêm ba nguồn trôi tự nhiên riêng của ngành: hạ tầng IT đổi liên tục, giao thức mạng tiến hoá, và quy định pháp lý thay đổi cái bạn được phép thu thập.',
        },
        { t: 'h', text: 'Đo trôi khi bạn chưa có nhãn — thứ tự ưu tiên', level: 2 },
        {
          t: 'p',
          md: 'Nhãn thật trong bảo mật tới rất muộn: một cuộc xâm nhập có thể mất hàng tuần mới được xác nhận. Nên bảng giám sát trôi phải xếp theo thứ tự **tín hiệu tới sớm trước**.',
        },
        {
          t: 'table',
          caption: 'Bốn tầng tín hiệu trôi, xếp theo độ trễ từ sớm tới muộn',
          head: ['Tầng', 'Đo cái gì', 'Độ trễ', 'Điểm mạnh / điểm yếu'],
          rows: [
            [
              '1. Trôi đầu vào',
              'PSI hoặc KS trên từng đặc trưng, tỉ lệ giá trị thiếu, tỉ lệ hạng mục chưa từng thấy',
              'Tức thời',
              'Rất sớm, nhưng nhiều báo động giả: một đặc trưng trôi chưa chắc làm mô hình sai',
            ],
            [
              '2. Trôi đầu ra',
              'PSI trên phân phối điểm số, số cảnh báo vượt ngưỡng mỗi giờ',
              'Tức thời',
              'Tín hiệu tốt nhất khi chưa có nhãn: nó gộp mọi thay đổi đầu vào thành một con số có nghĩa',
            ],
            [
              '3. Phản hồi analyst',
              'Precision ước lượng từ nhãn đúng/sai analyst bấm trên cảnh báo',
              'Giờ tới ngày',
              'Đo trực tiếp thứ bạn quan tâm, nhưng chỉ thấy được phần TRÊN ngưỡng',
            ],
            [
              '4. Sự thật nền muộn',
              'Kết luận điều tra, retro-hunt, báo cáo sự cố, kết quả purple team',
              'Tuần tới tháng',
              'Duy nhất đo được cả bỏ sót, nhưng tới quá muộn để dùng làm cảnh báo vận hành',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Nếu chỉ được chọn một chỉ số, chọn trôi đầu ra',
          md: 'Phân phối điểm số của mô hình là **bản tóm tắt tự nhiên** của mọi thứ xảy ra ở đầu vào, đã được chính mô hình gia trọng theo mức quan trọng. Một đặc trưng vô dụng trôi mạnh sẽ không làm điểm đổi; một đặc trưng trụ cột trôi nhẹ thì có. Thêm nữa, số cảnh báo vượt ngưỡng mỗi giờ là thứ trưởng ca SOC hiểu ngay mà không cần bạn giải thích PSI là gì.',
        },
        { t: 'h', text: 'PSI — công cụ đo trôi thực dụng nhất', level: 2 },
        {
          t: 'callout',
          kind: 'math',
          title: 'Population Stability Index, đọc từng ký hiệu',
          md: 'Chia miền giá trị thành k ô (thường 10 ô theo phân vị của kỳ tham chiếu). Gọi `e_i` là tỉ lệ mẫu rơi vào ô i ở **kỳ gốc**, `a_i` là tỉ lệ ở **kỳ hiện tại**.\n\nPSI = tổng theo i của (a_i − e_i) × ln(a_i / e_i)\n\nMỗi số hạng là tích của "chênh lệch tuyệt đối" và "chênh lệch tương đối", nên nó phạt nặng những ô mà tỉ lệ đổi nhiều lần dù số tuyệt đối nhỏ. PSI luôn không âm, bằng 0 khi hai phân phối trùng nhau, và **đối xứng** giữa hai kỳ — đây là ưu điểm so với KL divergence.\n\nQuan hệ với KL: PSI chính là tổng của hai chiều KL, tức KL(a‖e) + KL(e‖a). Vì vậy PSI đôi khi được gọi là **Jeffreys divergence**. KL một chiều thì bất đối xứng và nổ ra vô cực khi một ô rỗng ở mẫu số — lý do thực tế khiến người ta chuộng PSI hơn.',
        },
        {
          t: 'table',
          caption: 'Ba mức ngưỡng PSI dùng trong ngành — và hành động tương ứng cho hệ thống bảo mật',
          head: ['PSI', 'Diễn giải', 'Hành động đề xuất'],
          rows: [
            ['dưới 0,10', 'Ổn định', 'Không làm gì, tiếp tục theo dõi theo lịch'],
            [
              '0,10 – 0,25',
              'Trôi vừa phải, đáng chú ý',
              'Mở ticket điều tra trong 5 ngày làm việc: đặc trưng nào trôi, nguyên nhân hạ tầng hay đối thủ',
            ],
            [
              'trên 0,25',
              'Trôi đáng kể',
              'Cảnh báo cho người trực ML, đối chiếu ngay với số cảnh báo trên ngày, cân nhắc huấn luyện lại hoặc rollback',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Ba ngưỡng này đến từ chấm điểm tín dụng, không phải từ bảo mật',
          md: 'Bộ ngưỡng 0,1 / 0,25 xuất phát từ ngành credit scoring, nơi phân phối đổi chậm và ổn định. Trong bảo mật, PSI 0,3 sau một đợt nâng cấp Windows là chuyện bình thường và vô hại; ngược lại PSI 0,08 trên đúng đặc trưng trụ cột có thể là dấu hiệu ai đó đang dò tìm cách né. **Hãy dùng ba ngưỡng này làm điểm khởi đầu, rồi hiệu chỉnh bằng chính lịch sử của bạn:** chạy PSI trên 12 tháng log quá khứ, xem phân phối giá trị PSI hằng tuần, và đặt ngưỡng ở phân vị 95 và 99 của chính hệ thống mình.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Hàm PSI dùng được ngay — chia ô theo phân vị vì dữ liệu bảo mật có đuôi rất nặng',
          code: `import numpy as np

def psi(ky_goc: np.ndarray, ky_moi: np.ndarray, so_o: int = 10) -> float:
    """Population Stability Index giữa phân phối tham chiếu và phân phối hiện tại."""
    # Chia ô theo PHÂN VỊ của kỳ gốc, không chia đều: dữ liệu mạng lệch phải rất mạnh,
    # chia đều sẽ dồn 99% mẫu vào một ô và PSI mất hết độ nhạy.
    canh = np.quantile(ky_goc, np.linspace(0, 1, so_o + 1))
    canh = np.unique(canh)              # bỏ cạnh trùng khi có nhiều giá trị giống nhau
    canh[0], canh[-1] = -np.inf, np.inf # mở hai đầu để nhận giá trị ngoài khoảng cũ

    e = np.histogram(ky_goc, bins=canh)[0] / len(ky_goc)
    a = np.histogram(ky_moi, bins=canh)[0] / len(ky_moi)

    eps = 1e-6                          # tránh chia 0 và log(0) khi một ô rỗng
    e = np.clip(e, eps, None)
    a = np.clip(a, eps, None)
    return float(np.sum((a - e) * np.log(a / e)))

# Chạy hằng ngày cho TỪNG đặc trưng và cho CẢ điểm đầu ra:
#   psi(diem_thang_goc, diem_hom_nay)  -> tín hiệu tổng hợp tốt nhất khi chưa có nhãn`,
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't10l2-cp1',
              kind: 'mcq',
              tags: ['troi-khai-niem', 'troi-du-lieu'],
              q: 'Microsoft chặn macro mặc định trong tài liệu Office tải từ Internet (2022). Kẻ tấn công chuyển sang phát tán bằng tệp ISO, LNK và OneNote. Với một mô hình phân loại tệp đính kèm email, đây là loại trôi nào?',
              options: [
                'Trôi dữ liệu thuần tuý: chỉ phân phối định dạng tệp đính kèm đổi',
                'Cả hai: phân phối đầu vào đổi VÀ quan hệ giữa đặc trưng với nhãn cũng đổi',
                'Không phải trôi, chỉ là mất cân bằng lớp',
                'Trôi khái niệm thuần tuý: đầu vào không đổi, chỉ nhãn đổi',
              ],
              answer: 1,
              why: 'Phân phối đầu vào đổi rõ ràng — tỉ lệ tệp `.iso` và `.one` trong luồng email tăng vọt, đó là **trôi dữ liệu**. Nhưng đồng thời, "tệp ISO đính kèm" trước đây gần như luôn lành tính (ảnh đĩa hợp lệ) nay lại là dấu hiệu mạnh của mã độc — quan hệ P(y|X) đã đổi, đó là **trôi khái niệm**. Trong thực tế hai loại này thường đi cùng nhau, và điều đó có hệ quả vận hành: chỉ huấn luyện lại trên dữ liệu mới là chưa đủ, bạn còn phải rà lại xem bộ đặc trưng có mô tả được định dạng mới không.',
              distractorWhy: [
                'Nếu chỉ là trôi dữ liệu thì huấn luyện lại đã đủ; ở đây ý nghĩa của đặc trưng cũng đảo chiều.',
                '',
                'Mất cân bằng lớp nói về tỉ lệ nhãn trong tập dữ liệu, không phải sự thay đổi theo thời gian.',
                'Đầu vào có đổi, và đổi rất mạnh — nên không phải trôi khái niệm thuần tuý.',
              ],
            },
            {
              id: 't10l2-cp2',
              kind: 'truefalse',
              tags: ['giam-sat', 'troi-du-lieu'],
              q: 'Không có nhãn mới thì không thể phát hiện được mô hình đang xuống cấp.',
              answer: false,
              why: 'Ba trong bốn tầng tín hiệu ở bảng trên **không cần nhãn**: PSI trên đặc trưng, PSI trên điểm đầu ra, và số cảnh báo vượt ngưỡng mỗi giờ. Chúng không cho bạn biết precision đã tụt bao nhiêu, nhưng chúng cho biết **có gì đó đã đổi** — đủ để mở điều tra sớm hàng tháng so với việc chờ nhãn. Trong bảo mật, nơi nhãn thật tới sau hàng tuần, đây gần như là toàn bộ hệ thống cảnh báo sớm của bạn.',
            },
          ],
        },
        {
          t: 'lab',
          id: 'lab-drift',
          intro:
            'Mô phỏng một mô hình phát hiện chạy qua 24 tuần. Bạn bật được ba loại thay đổi: dịch phân phối đầu vào, xoay ranh giới quyết định thật, và một cú sốc đột ngột kiểu đối thủ đổi công cụ. Hãy quan sát ba đường — PSI đầu vào, PSI đầu ra và precision thật — và tự trả lời câu hỏi quan trọng nhất: đường nào báo trước, báo trước bao nhiêu tuần, và trong kịch bản nào PSI đầu vào hoàn toàn im lặng trong khi precision đã sập.',
        },
        {
          t: 'steps',
          title: 'Ví dụ mẫu: đọc một cảnh báo trôi từ đầu tới hành động',
          steps: [
            {
              title: 'Tín hiệu ban đầu',
              md: 'Thứ Ba, bảng giám sát báo: PSI của điểm đầu ra = **0,31**, số cảnh báo vượt ngưỡng 0,9 giảm từ trung bình 38 xuống **9** mỗi ngày, kéo dài 3 ngày liên tiếp. PSI đầu vào cao nhất nằm ở `so_nxdomain_1h` = 0,44.',
            },
            {
              title: 'Câu hỏi đầu tiên luôn là: hạ tầng hay đối thủ?',
              md: 'Trước khi nghĩ tới kẻ tấn công, hãy loại trừ nguyên nhân tầm thường. Kiểm tra: có nguồn log nào ngừng gửi không, có ai đổi cấu hình Zeek không, tỉ lệ sự kiện thiếu đặc trưng có tăng không, job cập nhật kho trực tuyến còn sống không. **Khoảng 80% cảnh báo trôi trong thực tế là vấn đề đường ống dữ liệu.**',
            },
            {
              title: 'Tìm thấy nguyên nhân tầm thường',
              md: 'Đội mạng đã bật DNS-over-HTTPS cho 60% máy trạm từ thứ Bảy tuần trước. Truy vấn DNS không còn đi qua resolver nội bộ, nên `so_nxdomain_1h` tụt về gần 0 cho nhóm máy đó. Đây là **trôi dữ liệu do hạ tầng**, không phải đối thủ.',
            },
            {
              title: 'Hành động không phải là huấn luyện lại',
              md: 'Huấn luyện lại trên dữ liệu mới sẽ dạy mô hình rằng "ít NXDOMAIN là bình thường" — tức là chấp nhận mù. Hành động đúng: khôi phục nguồn dữ liệu (bắt log DoH tại điểm ra, hoặc ép resolver nội bộ), và trong lúc chờ thì **thu hẹp phạm vi** mô hình về nhóm máy còn dữ liệu, đồng thời báo rõ vùng mù cho trưởng ca SOC.',
            },
            {
              title: 'Ghi lại vào sổ',
              md: 'Mỗi cảnh báo trôi được điều tra phải để lại một dòng: ngày, chỉ số kích hoạt, nguyên nhân gốc, hành động, và **ngưỡng có cần chỉnh không**. Sau sáu tháng, cuốn sổ này là thứ giúp bạn phân biệt PSI 0,3 vô hại với PSI 0,12 nguy hiểm — điều mà không tài liệu nào dạy được.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Cảnh báo trôi không kèm hành động chỉ là thêm một nguồn tiếng ồn',
          md: 'Rất nhiều đội dựng bảng giám sát trôi rất đẹp với 200 biểu đồ PSI, rồi ba tuần sau không ai mở nữa vì tuần nào cũng có vài chục cột đỏ. Quy tắc cứu vãn: **mỗi ngưỡng phải gắn với đúng một hành động và đúng một người chịu trách nhiệm.** Nếu bạn không viết được câu "khi chỉ số này vượt X thì người Y làm Z trong vòng T", thì đừng đưa chỉ số đó lên bảng giám sát — hãy để nó trong báo cáo hằng tháng.',
        },
        {
          t: 'terms',
          ids: ['troi-du-lieu', 'troi-khai-niem', 'dga', 'nguong'],
        },
      ],
      keyTakeaways: [
        'Trôi dữ liệu là P(X) đổi; trôi khái niệm là P(y|X) đổi — loại thứ hai thường cần làm lại đặc trưng chứ không chỉ huấn luyện lại.',
        'Bảo mật trôi nhanh nhất vì đối thủ chủ động tạo ra trôi, cộng thêm hạ tầng, giao thức và pháp luật cùng thay đổi.',
        'Xếp tín hiệu giám sát theo độ trễ: trôi đầu vào và đầu ra tức thời, phản hồi analyst theo ngày, sự thật nền theo tuần.',
        'Nếu chỉ chọn một chỉ số, chọn PSI trên phân phối điểm đầu ra — nó gộp mọi thay đổi theo đúng trọng số mô hình.',
        'PSI = tổng (a_i − e_i)·ln(a_i/e_i); ngưỡng 0,1 và 0,25 là điểm khởi đầu vay từ ngành tín dụng, phải hiệu chỉnh theo lịch sử của chính bạn.',
        'Khoảng 80% cảnh báo trôi thực tế là lỗi đường ống dữ liệu — luôn loại trừ nguyên nhân tầm thường trước khi nghĩ tới đối thủ.',
      ],
      cards: [
        {
          id: 't10l2-c1',
          front: 'Phân biệt trôi dữ liệu và trôi khái niệm bằng ký hiệu xác suất.',
          back: 'Trôi dữ liệu: P(X) đổi, quan hệ đầu vào–nhãn giữ nguyên. Trôi khái niệm: P(y|X) đổi, cùng đầu vào nhưng nhãn đúng đã khác.',
          tags: ['troi-du-lieu', 'troi-khai-niem'],
        },
        {
          id: 't10l2-c2',
          front: 'Vì sao mô hình bảo mật trôi nhanh hơn mô hình dự báo nhu cầu điện?',
          back: 'Vì có đối thủ được trả tiền để làm mô hình sai, và họ có vòng lặp phản hồi để thử lại. Thời tiết thì không đọc mô hình của bạn.',
          tags: ['troi-khai-niem', 'doi-khang'],
        },
        {
          id: 't10l2-c3',
          front: 'Khi chưa có nhãn mới, chỉ số nào là tín hiệu trôi tốt nhất và vì sao?',
          back: 'PSI trên phân phối điểm đầu ra: nó gộp mọi thay đổi đầu vào theo đúng trọng số mà mô hình thực sự dùng.',
          tags: ['giam-sat'],
        },
        {
          id: 't10l2-c4',
          front: 'Ba mức ngưỡng PSI thường dùng là gì?',
          back: 'Dưới 0,10 ổn định; 0,10–0,25 trôi vừa phải cần điều tra; trên 0,25 trôi đáng kể cần hành động. Vay từ ngành chấm điểm tín dụng, phải hiệu chỉnh lại.',
          hint: 'Hai con số, một chữ số thập phân.',
          tags: ['giam-sat', 'troi-du-lieu'],
        },
        {
          id: 't10l2-c5',
          front: 'Khi nhận cảnh báo trôi, câu hỏi đầu tiên phải hỏi là gì?',
          back: 'Hạ tầng hay đối thủ? Khoảng 80% cảnh báo trôi thực tế là nguồn log chết, đổi cấu hình hoặc job cập nhật đặc trưng hỏng.',
          tags: ['giam-sat', 'van-hanh'],
        },
      ],
      quiz: [
        {
          id: 't10l2-q1',
          kind: 'mcq',
          tags: ['troi-khai-niem'],
          q: 'Mô hình DGA của bạn dựa chủ yếu vào entropy ký tự của tên miền. Một họ mã độc mới sinh tên miền bằng cách ghép hai từ tiếng Anh thông dụng (kiểu `sunnybridge.net`). Điều gì xảy ra và đó là loại trôi nào?',
          options: [
            'Mô hình bắt được vì tên miền vẫn mới đăng ký — trôi dữ liệu',
            'Mô hình bỏ sót vì entropy thấp giống tên miền hợp lệ — trôi khái niệm, cần đặc trưng mới',
            'Mô hình vẫn hoạt động tốt, chỉ cần hạ ngưỡng',
            'Đây là mất cân bằng lớp, xử lý bằng cách lấy mẫu lại',
          ],
          answer: 1,
          why: 'Các họ DGA dùng từ điển như suppobox và matsnu sinh ra tên miền có entropy ký tự **thấp**, nằm gọn trong vùng mà mô hình coi là lành tính. Quan hệ giữa đặc trưng entropy và nhãn đã thay đổi — đúng định nghĩa trôi khái niệm. Hạ ngưỡng không cứu được vì nó sẽ kéo theo hàng nghìn tên miền hợp lệ có entropy tương đương. Lối ra là đặc trưng khác họ: xác suất n-gram theo từ điển, mẫu hình truy vấn của máy (nhiều NXDOMAIN liên tiếp), tuổi tên miền, và cấu trúc phân giải DNS.',
          distractorWhy: [
            'Tuổi tên miền là đặc trưng khác, không phải thứ mô hình entropy đang dùng — và câu hỏi nói mô hình dựa chủ yếu vào entropy.',
            '',
            'Hạ ngưỡng làm nổ báo động giả vì hàng triệu tên miền hợp lệ có entropy tương tự.',
            'Mất cân bằng lớp là tính chất tĩnh của tập dữ liệu, không mô tả sự thay đổi theo thời gian.',
          ],
        },
        {
          id: 't10l2-q2',
          kind: 'multi',
          tags: ['giam-sat', 'troi-du-lieu'],
          q: 'Chỉ số nào phát hiện được vấn đề mà KHÔNG cần nhãn mới? (Chọn tất cả)',
          options: [
            'PSI trên phân phối điểm đầu ra so với tháng tham chiếu',
            'Precision đo từ kết luận điều tra sự cố',
            'Tỉ lệ sự kiện có đặc trưng bị thiếu hoặc quá hạn',
            'Số cảnh báo vượt ngưỡng mỗi giờ so với đường cơ sở 7 ngày',
          ],
          answers: [0, 2, 3],
          why: 'Ba chỉ số này chỉ cần dữ liệu đi qua hệ thống, không cần biết đáp án đúng — nên chúng có ngay lập tức. Precision từ kết luận điều tra thì bắt buộc phải có nhãn và thường tới sau hàng tuần. Bộ ba không cần nhãn chính là hệ thống cảnh báo sớm thật sự của bạn; nhãn muộn chỉ dùng để xác nhận và để huấn luyện lại.',
        },
        {
          id: 't10l2-q3',
          kind: 'match',
          tags: ['troi-du-lieu', 'troi-khai-niem'],
          q: 'Ghép mỗi sự kiện với loại trôi mà nó gây ra ở mức chủ yếu.',
          pairs: [
            ['GDPR làm dữ liệu WHOIS công khai bị che', 'Trôi dữ liệu do thay đổi pháp lý'],
            ['Công ty chuyển 70% nhân sự sang làm việc từ xa', 'Trôi dữ liệu do thay đổi môi trường vận hành'],
            ['Kẻ tấn công chuyển DGA sang ghép từ điển', 'Trôi khái niệm do đối thủ chủ động'],
            ['PowerShell base64 trở thành chuẩn của công cụ triển khai hợp lệ', 'Trôi khái niệm do hành vi lành tính thay đổi'],
          ],
          why: 'Hai cột đầu là thay đổi ở phía đầu vào: dữ liệu mất đi hoặc phân phối dịch chuyển, còn ý nghĩa của đặc trưng thì giữ nguyên. Hai cột sau là thay đổi ở quan hệ đặc trưng–nhãn: cùng một giá trị entropy thấp hoặc cùng một chuỗi lệnh base64, nhưng kết luận đúng đã khác. Phân biệt được điều này quyết định bạn chọn huấn luyện lại hay phải thiết kế đặc trưng mới.',
        },
        {
          id: 't10l2-q4',
          kind: 'input',
          tags: ['giam-sat'],
          q: 'Chỉ số đo độ dịch chuyển phân phối, tính bằng tổng của (a_i − e_i)·ln(a_i/e_i) trên các ô, viết tắt ba chữ cái là gì?',
          accept: ['psi', 'population stability index'],
          placeholder: 'Ba chữ cái…',
          hint: 'Chữ đầu là P, viết đầy đủ có từ "stability".',
          why: 'PSI (Population Stability Index) đối xứng giữa hai kỳ và bằng tổng hai chiều KL divergence, nên nó không nổ ra vô cực theo một chiều như KL đơn lẻ. Trong thực tế người ta còn dùng kiểm định Kolmogorov–Smirnov cho biến liên tục và Chi-square cho biến hạng mục, nhưng PSI thắng ở chỗ nó cho một con số dễ đặt ngưỡng và dễ giải thích cho người không làm thống kê.',
        },
        {
          id: 't10l2-q5',
          kind: 'truefalse',
          tags: ['van-hanh', 'giam-sat'],
          q: 'Khi PSI của một đặc trưng vượt 0,25, hành động đúng gần như luôn là huấn luyện lại mô hình ngay.',
          answer: false,
          why: 'Huấn luyện lại khi nguyên nhân là **đường ống hỏng** sẽ dạy mô hình rằng trạng thái hỏng là bình thường — bạn vừa hợp thức hoá một vùng mù. Thứ tự đúng là: xác nhận nguồn dữ liệu còn nguyên vẹn, tìm nguyên nhân gốc, rồi mới quyết định giữa ba lựa chọn khác nhau — sửa đường ống, huấn luyện lại, hoặc thiết kế lại đặc trưng. Chỉ lựa chọn thứ hai mới là huấn luyện lại.',
        },
      ],
      terms: ['troi-du-lieu', 'troi-khai-niem', 'dga', 'nguong'],
      further: [
        {
          title: 'Moreno-Torres et al. — A unifying view on dataset shift in classification (Pattern Recognition, 2012)',
          note: 'Bài tổng quan phân loại rành mạch covariate shift, prior probability shift và concept shift. Đọc để dùng đúng thuật ngữ khi tranh luận với đồng nghiệp.',
        },
        {
          title: 'Evidently AI — tài liệu về phát hiện trôi',
          note: 'Thư viện mã nguồn mở, tài liệu giải thích rõ khi nào dùng PSI, KS, Wasserstein hay Jensen–Shannon và bẫy của từng loại theo cỡ mẫu.',
          url: 'https://docs.evidentlyai.com/',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't10-l3',
      trackId: 'van-hanh',
      title: 'Giám sát, phản hồi và huấn luyện lại',
      subtitle:
        'Mô hình chỉ học được từ những gì nó đã cảnh báo. Nếu bạn không phá vòng lặp đó, nó sẽ ngày càng giỏi ở đúng chỗ nó đã giỏi.',
      minutes: 21,
      level: 'nang-cao',
      prereqs: ['t10-l2'],
      why: {
        short:
          'Vòng phản hồi từ analyst là nguồn nhãn rẻ nhất bạn có, đồng thời là nguồn thiên lệch nguy hiểm nhất — và cách bạn thiết kế nó quyết định mô hình tốt lên hay mù dần.',
        scenario:
          'Sau sáu tháng, bạn có 14.000 nhãn do analyst bấm trên cảnh báo. Bạn huấn luyện lại, precision tăng từ 0,61 lên 0,78, mọi người vỗ tay. Ba tháng sau, một cuộc xâm nhập kéo dài năm tuần bị phát hiện bởi đối tác bên ngoài, và điều tra cho thấy mô hình đã chấm sự kiện đó **0,31 điểm** suốt cả năm tuần. Nó chưa bao giờ có cơ hội học rằng mình sai, vì 0,31 nằm dưới ngưỡng nên không ai từng nhìn.',
        roles: ['Security Data Scientist', 'Detection Engineer', 'ML Engineer', 'SOC Analyst'],
        costOfNotKnowing:
          'Bạn xây một mô hình ngày càng tự tin trong đúng vùng nó đã quen và ngày càng mù ở vùng nó chưa từng cảnh báo. Chỉ số nội bộ đẹp dần lên trong khi khả năng phát hiện thật đi xuống — và bạn không có cách nào biết, vì thước đo của bạn cũng lấy từ chính vòng lặp đó.',
      },
      objectives: [
        'Thiết kế vòng phản hồi analyst có ngân sách khám phá để tránh vòng lặp tự củng cố',
        'Phân biệt chế độ bóng, canary và A/B, chọn đúng chế độ cho từng loại thay đổi',
        'Viết tiêu chí rollback định lượng kèm cửa sổ đánh giá và cỡ mẫu tối thiểu',
        'Lập bảng giám sát bốn tầng: hạ tầng, dữ liệu, mô hình, nghiệp vụ',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Mô hình của bạn cảnh báo khi điểm vượt 0,80. Analyst chỉ gán nhãn cho cảnh báo họ nhận được. Bạn dùng toàn bộ nhãn đó để huấn luyện lại mỗi quý. Sau bốn quý, chỉ số nào trong hai chỉ số sau sẽ trông đẹp lên, và chỉ số nào bạn thực sự không đo được: precision hay recall?',
          reveal:
            '**Precision trông đẹp lên; recall thì bạn hoàn toàn không đo được.** Lý do: tập nhãn của bạn chỉ chứa các mẫu có điểm trên 0,80. Mô hình được huấn luyện lại trên tập đó sẽ ngày càng giỏi phân biệt bên trong vùng điểm cao — tức precision tăng thật. Nhưng mọi thứ **dưới** 0,80 chưa bao giờ được nhìn, nên bạn không có một mẫu âm tính giả nào để học. Recall bạn báo cáo thực chất là "recall trên tập đã cảnh báo", một con số luôn gần 1 và hoàn toàn vô nghĩa. Đây là **thiên lệch lựa chọn do chính hệ thống tạo ra** (feedback loop / selection bias), và nó là lỗi kiến trúc phổ biến nhất trong ML bảo mật vận hành lâu năm.',
        },
        {
          t: 'figure',
          id: 'fig-detection-lifecycle',
          caption:
            'Vòng đời một luật hoặc mô hình phát hiện: giả thuyết → xây dựng → chế độ bóng → canary → sản xuất → giám sát → phản hồi → điều chỉnh hoặc khai tử. Mũi tên quay lại từ phản hồi về dữ liệu huấn luyện chính là chỗ thiên lệch len vào.',
        },
        { t: 'h', text: 'Phần 1 — Vòng phản hồi và cái bẫy của nó', level: 2 },
        {
          t: 'p',
          md: 'Nhãn từ analyst là thứ rẻ nhất bạn có: họ **đã** phải phân loại cảnh báo rồi, bạn chỉ cần ghi lại kết luận. Ba nút trong giao diện SIEM — `đúng thật`, `báo động giả`, `không đủ dữ liệu` — cộng một ô ghi chú ngắn là đủ cho 90% giá trị.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Ba chi tiết thiết kế quyết định chất lượng nhãn',
          md: '**1. Nút thứ ba là bắt buộc.** Nếu chỉ có đúng/sai, analyst sẽ bấm "báo động giả" cho mọi thứ họ không kịp điều tra. Nhãn "không đủ dữ liệu" tách được sự thiếu chắc chắn ra khỏi sự phủ định, và tỉ lệ của nó là một chỉ số sức khoẻ riêng.\n\n**2. Ghi kèm ngữ cảnh phiên bản.** Mỗi nhãn phải lưu `model_version`, `feature_version`, `threshold` và điểm số lúc đó. Không có chúng, sáu tháng sau bạn không thể biết nhãn này thuộc thế hệ mô hình nào.\n\n**3. Đo độ đồng thuận.** Định kỳ đưa cùng 50 cảnh báo cho hai analyst khác nhau. Nếu họ chỉ đồng ý 65% thì trần chất lượng mô hình của bạn nằm ở đó, không phải ở thuật toán. Con số này thường gây sốc lần đầu đo.',
        },
        {
          t: 'p',
          md: 'Bây giờ tới phần khó: **mô hình chỉ nhận được nhãn cho những gì nó đã cảnh báo.** Đây không phải vấn đề nhỏ có thể sửa bằng tham số. Nó là vòng lặp tự củng cố, và nó cần một giải pháp kiến trúc.',
        },
        {
          t: 'steps',
          title: 'Bốn cách phá vòng lặp tự củng cố, xếp theo chi phí tăng dần',
          steps: [
            {
              title: 'Ngân sách khám phá (exploration budget)',
              md: 'Dành **1–5%** công suất của đội để xử lý các mẫu **dưới** ngưỡng, chọn ngẫu nhiên có phân tầng theo dải điểm. Ví dụ mỗi ngày lấy 5 mẫu ở dải 0,5–0,8 và 3 mẫu ở dải 0,2–0,5. Đây là cách duy nhất bạn có được **mẫu âm tính giả thật**. Chi phí: vài cảnh báo mỗi ngày. Giá trị: khả năng ước lượng recall.',
            },
            {
              title: 'Lấy mẫu theo độ bất định (uncertainty sampling)',
              md: 'Thay vì ngẫu nhiên hoàn toàn, ưu tiên các mẫu mà mô hình **phân vân nhất** — điểm gần ngưỡng, hoặc phương sai cao giữa các cây trong ensemble. Đây là ý tưởng cốt lõi của học chủ động (active learning): mỗi nhãn mua được nhiều thông tin hơn. Cảnh báo: đừng dùng một mình, vì nó vẫn không chạm tới vùng mà mô hình **sai một cách tự tin** — chính là vùng nguy hiểm nhất.',
            },
            {
              title: 'Sự thật nền độc lập với mô hình',
              md: 'Nguồn nhãn không đi qua ngưỡng của bạn: kết luận điều tra sự cố, retro-hunt khi có IOC mới từ threat intel, kết quả quét lại mẫu tệp trên VirusTotal sau 30 ngày, báo cáo từ đối tác bên ngoài. Những nhãn này ít về số lượng nhưng **không thiên lệch**, nên chúng đáng giá gấp nhiều lần nhãn từ hàng đợi cảnh báo.',
            },
            {
              title: 'Bơm mẫu có kiểm soát (purple team)',
              md: 'Đội purple team chạy các kỹ thuật ATT&CK đã lên lịch trên môi trường thật, ghi lại chính xác thời điểm và thực thể. Bạn có ngay một tập **dương tính đã biết** với dấu thời gian, đo được recall thật theo từng kỹ thuật. Đây là chuẩn vàng và cũng là thứ đắt nhất — nhưng nếu công ty bạn đã có purple team, bạn chỉ cần xin họ file lịch chạy.',
            },
          ],
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't10l3-cp1',
              kind: 'mcq',
              tags: ['phan-hoi', 'thien-lech'],
              q: 'Đội bạn có công suất 200 cảnh báo/ngày và đang dùng hết. Bạn muốn ước lượng được recall. Bước đầu tiên hợp lý nhất là gì?',
              options: [
                'Hạ ngưỡng để mô hình cảnh báo nhiều hơn, từ đó thấy được nhiều dương tính hơn',
                'Dành 5 trong 200 suất mỗi ngày cho mẫu chọn ngẫu nhiên có phân tầng ở các dải điểm dưới ngưỡng',
                'Tăng số cây và độ sâu để mô hình chính xác hơn',
                'Chờ tới khi có sự cố thật rồi đo ngược lại',
              ],
              answer: 1,
              why: 'Recall cần **mẫu âm tính giả**, mà theo định nghĩa chúng nằm dưới ngưỡng nên không ai từng nhìn. Cách rẻ nhất là hy sinh 2,5% công suất để lấy mẫu có phân tầng dưới ngưỡng: chỉ 5 mẫu mỗi ngày cho bạn 1.825 mẫu mỗi năm, đủ để ước lượng tỉ lệ bỏ sót theo từng dải điểm với sai số chấp nhận được. Hạ ngưỡng thì làm ngập đội mà vẫn chỉ nhìn phần trên ngưỡng mới.',
              distractorWhy: [
                'Hạ ngưỡng chỉ dịch ranh giới, phần dưới ngưỡng mới vẫn hoàn toàn không quan sát được — và đội thì vỡ trận.',
                '',
                'Mô hình mạnh hơn không tạo ra dữ liệu quan sát; vấn đề ở đây là thiếu quan sát chứ không thiếu dung lượng mô hình.',
                'Chờ sự cố nghĩa là mỗi ước lượng recall phải trả giá bằng một lần bị xâm nhập.',
              ],
            },
            {
              id: 't10l3-cp2',
              kind: 'truefalse',
              tags: ['phan-hoi'],
              q: 'Nếu precision đo từ phản hồi analyst tăng đều qua bốn quý thì có thể kết luận mô hình đang tốt lên.',
              answer: false,
              why: 'Precision đo trên tập đã cảnh báo có thể tăng chỉ vì mô hình ngày càng bảo thủ — nó chỉ dám kêu ở những mẫu rất giống thứ nó đã học, tức là recall thật đang tụt. Muốn kết luận "tốt lên" bạn cần ít nhất một thước đo không đi qua ngưỡng: mẫu khám phá dưới ngưỡng, kết quả purple team, hoặc retro-hunt theo IOC mới. Một chỉ số đơn lẻ lấy từ chính vòng lặp không bao giờ chứng minh được điều gì về vòng lặp đó.',
            },
          ],
        },
        { t: 'h', text: 'Phần 2 — Bốn tầng giám sát', level: 2 },
        {
          t: 'table',
          caption: 'Bảng giám sát tối thiểu cho một mô hình phát hiện đang chạy',
          head: ['Tầng', 'Chỉ số', 'Ngưỡng gợi ý', 'Ai xử lý'],
          rows: [
            [
              'Hạ tầng',
              'p99 độ trễ, tỉ lệ lỗi, throughput, độ trễ hàng đợi',
              'p99 vượt ngân sách 2 lần liên tiếp trong 10 phút',
              'Trực hạ tầng',
            ],
            [
              'Dữ liệu',
              'Tỉ lệ đặc trưng thiếu, tuổi đặc trưng trong kho trực tuyến, số nguồn log im lặng',
              'Thiếu đặc trưng vượt 2%, hoặc bất kỳ nguồn log nào im quá 30 phút',
              'Kỹ sư dữ liệu',
            ],
            [
              'Mô hình',
              'PSI điểm đầu ra, PSI top-10 đặc trưng, phân phối điểm theo phân vị',
              'PSI điểm vượt 0,25, hoặc phân vị 99 của điểm dịch quá 15%',
              'Trực ML',
            ],
            [
              'Nghiệp vụ',
              'Cảnh báo/ngày, precision từ phản hồi, thời gian xử lý trung bình, tỉ lệ nhãn "không đủ dữ liệu"',
              'Cảnh báo/ngày lệch quá 50% so với đường cơ sở 7 ngày',
              'Trưởng ca SOC',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao phải tách bốn tầng',
          md: 'Vì bốn tầng này hỏng theo bốn cách khác nhau và **do bốn người khác nhau sửa**. Khi số cảnh báo tụt 70%, câu hỏi đầu tiên không phải "mô hình sao rồi" mà là "tầng nào đang đỏ". Nếu tầng dữ liệu đỏ thì đó là việc của kỹ sư dữ liệu và không ai cần đánh thức nhà khoa học dữ liệu lúc 2 giờ sáng. Bảng giám sát trộn lẫn bốn tầng là bảng giám sát không ai chịu trách nhiệm.',
        },
        { t: 'h', text: 'Phần 3 — Ba chế độ triển khai', level: 2 },
        {
          t: 'table',
          caption: 'Chế độ bóng, canary và A/B — chọn theo loại thay đổi và loại rủi ro',
          head: ['Chế độ', 'Cách làm', 'Trả lời câu hỏi gì', 'Rủi ro với analyst'],
          rows: [
            [
              'Chế độ bóng (shadow)',
              'Mô hình mới chạy song song trên 100% lưu lượng, chỉ ghi log, không sinh cảnh báo',
              'Nó sẽ đẻ ra bao nhiêu cảnh báo, và chồng lấn với mô hình cũ bao nhiêu phần trăm',
              'Bằng không — họ không thấy gì cả',
            ],
            [
              'Canary',
              'Mô hình mới phục vụ thật nhưng chỉ cho 1% rồi 10% rồi 50% một lát cắt (theo nhóm tài sản hoặc theo hash thực thể)',
              'Nó có gây sự cố thật không, có tăng tải cảnh báo không',
              'Thấp và có giới hạn, nhưng khác không',
            ],
            [
              'A/B có đối chứng',
              'Chia ngẫu nhiên thực thể thành hai nhánh, cả hai đều phục vụ thật, so sánh có ý nghĩa thống kê',
              'Mô hình mới có TỐT HƠN mô hình cũ không, đo được bằng số',
              'Trung bình, và cần thời gian đủ dài để có cỡ mẫu',
            ],
          ],
        },
        {
          t: 'p',
          md: 'Trong bảo mật có một khó khăn riêng cho A/B: **sự kiện dương tính quá hiếm**. Muốn phát hiện chênh lệch precision 5 điểm phần trăm với độ tin cậy hợp lý, bạn cần hàng trăm cảnh báo đã gán nhãn ở mỗi nhánh — có thể mất vài tháng. Vì vậy thực tế phổ biến là **chế độ bóng cho quyết định "có tốt hơn không", canary cho quyết định "có an toàn không"**, và chỉ dùng A/B đầy đủ cho những thay đổi lớn đáng chờ.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Ba cái bẫy khi triển khai mô hình mới',
          md: '**1. Chế độ bóng quá ngắn.** Một tuần không đủ để gặp chu kỳ hàng tháng (đóng sổ kế toán, quét lỗ hổng định kỳ, sao lưu cuối tháng). Tối thiểu hai tuần, tốt nhất là một chu kỳ nghiệp vụ trọn vẹn.\n\n**2. Canary chia theo thời gian thay vì theo thực thể.** Nếu bạn cho mô hình mới chạy vào ban đêm và mô hình cũ chạy ban ngày, bạn đang so hai môi trường khác nhau chứ không so hai mô hình. Chia theo hash của định danh thực thể để cùng phân phối thời gian.\n\n**3. Không có phương án quay lui đã diễn tập.** "Rollback" mà chưa ai từng bấm thử thì lúc cần sẽ mất 40 phút và ba cuộc gọi. Hãy diễn tập rollback ít nhất một lần trước khi mở canary.',
        },
        { t: 'h', text: 'Phần 4 — Tiêu chí rollback viết TRƯỚC khi triển khai', level: 2 },
        {
          t: 'p',
          md: 'Đây là điều quan trọng nhất của bài, và cũng là điều bị bỏ qua nhiều nhất. Khi hệ thống đang có vấn đề lúc 3 giờ sáng, không ai đủ tỉnh táo và đủ khách quan để quyết định "thế này đã đủ tệ để quay lui chưa". Quyết định đó phải được viết ra, có số, và được ký duyệt **khi mọi người còn bình tĩnh**.',
        },
        {
          t: 'code',
          lang: 'yaml',
          caption: 'rollback.yaml — viết trước khi bật canary, trưởng ca SOC ký duyệt cùng',
          code: `mo_hinh: dns-dga-scorer
phien_ban_moi: v7
phien_ban_quay_lui: v6          # đích rollback, đã kiểm chứng còn khởi động được
cua_so_danh_gia: 2h
tan_suat_kiem_tra: 5m

tu_dong_rollback_khi:
  - ten: bung_canh_bao
    do: so_canh_bao_moi_gio / duong_co_so_7_ngay
    vuot_qua: 1.5
    keo_dai: 30m

  - ten: cam_canh_bao                 # im lặng cũng nguy hiểm như bùng nổ
    do: so_canh_bao_moi_gio / duong_co_so_7_ngay
    duoi: 0.3
    keo_dai: 60m

  - ten: sut_do_chinh_xac
    do: precision_tu_phan_hoi_analyst
    duoi: 0.40
    mau_toi_thieu: 50               # dưới 50 phản hồi thì CHƯA kết luận

  - ten: vuot_ngan_sach_tre
    do: p99_latency_ms
    vuot_qua: 250
    keo_dai: 10m

  - ten: hong_dac_trung
    do: ty_le_su_kien_thieu_dac_trung
    vuot_qua: 0.02

nguoi_duoc_bam_rollback: [truc-ca-soc, truc-ml, detection-eng-oncall]
thoi_gian_toi_da_hoan_thanh_rollback: 10m
bat_buoc_hop_rut_kinh_nghiem_trong: 3 ngay lam viec`,
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Tiêu chí "cạn cảnh báo" quan trọng ngang tiêu chí "bùng cảnh báo"',
          md: 'Đội nào cũng nhớ đặt ngưỡng cho trường hợp mô hình mới đẻ quá nhiều cảnh báo, vì hậu quả hiện ra ngay và ầm ĩ. Rất ít đội đặt ngưỡng cho trường hợp ngược lại. Nhưng một mô hình **im lặng bất thường** là dấu hiệu của đường ống chết, đặc trưng rỗng, hoặc lỗi ngưỡng — và hậu quả của nó là bạn đang mù mà tưởng mình bình yên. Trong sự cố thật, kiểu hỏng im lặng luôn tốn kém hơn kiểu hỏng ồn ào.',
        },
        {
          t: 'h',
          text: 'Phần 5 — Huấn luyện lại: bao lâu một lần và bằng dữ liệu nào',
          level: 2,
        },
        {
          t: 'list',
          items: [
            '**Theo lịch cố định** (ví dụ mỗi 4 tuần): đơn giản, dễ tự động hoá, dễ kiểm toán. Nhược điểm là huấn luyện lại cả khi không cần và bỏ lỡ khi cần gấp.',
            '**Theo tín hiệu trôi**: chỉ chạy khi PSI hoặc số cảnh báo vượt ngưỡng. Tiết kiệm hơn nhưng dễ rơi vào bẫy hợp thức hoá đường ống hỏng nếu không có bước xác minh nguyên nhân gốc.',
            '**Cửa sổ trượt hay cửa sổ tích luỹ?** Trong bảo mật, cửa sổ trượt (chỉ giữ 6–12 tháng gần nhất) thường thắng vì hành vi cũ mất giá nhanh. Nhưng phải giữ riêng một **tập lưu trữ vàng** gồm các mẫu tấn công hiếm nhưng nghiêm trọng, và luôn trộn lại vào mỗi lần huấn luyện — nếu không mô hình sẽ quên chúng.',
            '**Luôn đánh giá trên tập kiểm tra tương lai**: mô hình mới phải được đo trên khoảng thời gian sau toàn bộ dữ liệu huấn luyện, không bao giờ bằng chia ngẫu nhiên. Đây là điều kiện tối thiểu để con số bạn báo cáo có nghĩa.',
            '**Không tự động thay thế mô hình sản xuất.** Job huấn luyện lại sinh ra một ứng viên; ứng viên phải qua chế độ bóng và canary như mọi thay đổi khác. Tự động hoá đến bước tạo ứng viên là đủ.',
          ],
        },
        {
          t: 'terms',
          ids: ['shadow-mode', 'active-learning', 'troi-khai-niem', 'nguong'],
        },
      ],
      keyTakeaways: [
        'Nhãn từ analyst chỉ tồn tại cho phần trên ngưỡng, nên precision đo được có thể tăng trong khi recall thật đang tụt.',
        'Ngân sách khám phá 1–5% dành cho mẫu dưới ngưỡng là cách rẻ nhất để có mẫu âm tính giả thật.',
        'Nguồn nhãn không đi qua ngưỡng — điều tra sự cố, retro-hunt, purple team — đáng giá gấp nhiều lần nhãn từ hàng đợi.',
        'Giám sát phải tách bốn tầng hạ tầng / dữ liệu / mô hình / nghiệp vụ vì bốn người khác nhau sửa chúng.',
        'Chế độ bóng trả lời "tốt hơn không", canary trả lời "an toàn không"; A/B đầy đủ thường quá chậm vì dương tính quá hiếm.',
        'Tiêu chí rollback phải có số, có cỡ mẫu tối thiểu, có cả nhánh "cạn cảnh báo", và được ký trước khi triển khai.',
      ],
      cards: [
        {
          id: 't10l3-c1',
          front: 'Vì sao vòng phản hồi từ analyst tạo ra thiên lệch, và nó che giấu chỉ số nào?',
          back: 'Vì analyst chỉ gán nhãn cho cảnh báo vượt ngưỡng, nên bạn không bao giờ có mẫu âm tính giả. Chỉ số bị che là recall.',
          tags: ['phan-hoi', 'thien-lech'],
        },
        {
          id: 't10l3-c2',
          front: 'Ngân sách khám phá trong vòng phản hồi là gì và thường chiếm bao nhiêu công suất?',
          back: 'Dành 1–5% công suất đội để phân loại mẫu chọn ngẫu nhiên có phân tầng ở các dải điểm DƯỚI ngưỡng, nhằm thu được mẫu âm tính giả thật.',
          tags: ['phan-hoi', 'active-learning'],
        },
        {
          id: 't10l3-c3',
          front: 'Chế độ bóng khác canary ở điểm nào?',
          back: 'Chế độ bóng chạy trên 100% lưu lượng nhưng không sinh cảnh báo; canary sinh cảnh báo thật nhưng chỉ trên một lát cắt nhỏ của thực thể.',
          hint: 'Một cái không ai thấy, một cái ít người thấy.',
          tags: ['shadow-mode', 'trien-khai'],
        },
        {
          id: 't10l3-c4',
          front: 'Vì sao tiêu chí rollback phải có "cỡ mẫu tối thiểu"?',
          back: 'Để không quay lui vì nhiễu: precision 0,2 tính trên 5 phản hồi không nói lên gì, còn trên 50 phản hồi thì có ý nghĩa.',
          tags: ['trien-khai'],
        },
        {
          id: 't10l3-c5',
          front: 'Vì sao phải đặt tiêu chí rollback cho trường hợp cảnh báo giảm mạnh, không chỉ tăng mạnh?',
          back: 'Vì mô hình im lặng bất thường thường nghĩa là đường ống chết hoặc đặc trưng rỗng — hỏng im lặng luôn tốn kém hơn hỏng ồn ào.',
          tags: ['giam-sat', 'trien-khai'],
        },
      ],
      quiz: [
        {
          id: 't10l3-q1',
          kind: 'mcq',
          tags: ['phan-hoi', 'thien-lech'],
          q: 'Nguồn nhãn nào KHÔNG bị thiên lệch bởi ngưỡng cảnh báo hiện tại của mô hình?',
          options: [
            'Nhãn đúng/sai analyst bấm trên hàng đợi cảnh báo',
            'Kết quả purple team chạy kỹ thuật ATT&CK theo lịch có ghi dấu thời gian',
            'Ghi chú điều tra viết trong các ticket đã mở từ cảnh báo',
            'Thống kê tỉ lệ đóng ticket theo loại cảnh báo',
          ],
          answer: 1,
          why: 'Purple team tạo ra sự kiện dương tính **không phụ thuộc vào việc mô hình có kêu hay không**, kèm dấu thời gian và thực thể chính xác. Nhờ đó bạn đo được recall thật theo từng kỹ thuật, kể cả những kỹ thuật mô hình bỏ sót hoàn toàn. Ba lựa chọn còn lại đều bắt nguồn từ hàng đợi cảnh báo, tức là đã bị lọc bởi chính ngưỡng của mô hình.',
          distractorWhy: [
            'Chỉ tồn tại cho mẫu vượt ngưỡng, nên không chứa âm tính giả nào.',
            '',
            'Ticket sinh ra từ cảnh báo, nên vẫn nằm trọn trong vùng trên ngưỡng.',
            'Thống kê trên tập đã lọc thì vẫn là thống kê thiên lệch, dù mẫu có lớn tới đâu.',
          ],
        },
        {
          id: 't10l3-q2',
          kind: 'order',
          tags: ['trien-khai'],
          q: 'Sắp xếp đúng trình tự đưa một phiên bản mô hình mới ra sản xuất.',
          items: [
            'Viết và ký duyệt tiêu chí rollback định lượng kèm cửa sổ đánh giá',
            'Chạy chế độ bóng tối thiểu hai tuần, đối chiếu số cảnh báo và mức chồng lấn với mô hình cũ',
            'Diễn tập một lần thao tác quay lui về phiên bản cũ',
            'Mở canary 1% thực thể, theo dõi theo tiêu chí đã ký',
            'Mở rộng dần 10% rồi 50% nếu mọi ngưỡng đều xanh',
            'Chuyển toàn bộ và giữ phiên bản cũ sẵn sàng thêm ít nhất hai tuần',
          ],
          why: 'Điểm mấu chốt là tiêu chí rollback đứng **trước** mọi thứ: viết nó khi còn bình tĩnh thì lúc sự cố mới có cơ sở khách quan để quyết định. Diễn tập quay lui đứng trước canary vì đó là lúc duy nhất bạn được phép thất bại khi thử. Và giữ phiên bản cũ sẵn sàng thêm hai tuần sau khi chuyển toàn bộ, vì nhiều kiểu hỏng chỉ lộ ra sau một chu kỳ nghiệp vụ.',
        },
        {
          id: 't10l3-q3',
          kind: 'multi',
          tags: ['giam-sat'],
          q: 'Chỉ số nào thuộc tầng giám sát "nghiệp vụ" chứ không phải tầng hạ tầng hay tầng mô hình? (Chọn tất cả)',
          options: [
            'Số cảnh báo mỗi ngày so với đường cơ sở 7 ngày',
            'p99 độ trễ của dịch vụ chấm điểm',
            'Precision ước lượng từ phản hồi analyst',
            'Thời gian trung bình analyst xử lý một cảnh báo',
          ],
          answers: [0, 2, 3],
          why: 'Tầng nghiệp vụ đo **tác động lên công việc của con người**: khối lượng, chất lượng và chi phí thời gian. p99 độ trễ là sức khoẻ hạ tầng — nó có thể hoàn hảo trong khi mô hình đang đẻ ra 4.000 cảnh báo rác. Tách tầng như vậy để mỗi cảnh báo giám sát đánh thức đúng người: trưởng ca SOC quan tâm ba chỉ số kia, còn p99 là việc của trực hạ tầng.',
        },
        {
          id: 't10l3-q4',
          kind: 'truefalse',
          tags: ['huan-luyen-lai'],
          q: 'Khi huấn luyện lại theo cửa sổ trượt 12 tháng, nên bỏ hẳn dữ liệu cũ hơn 12 tháng để mô hình bám sát hiện tại.',
          answer: false,
          why: 'Cửa sổ trượt là mặc định hợp lý vì hành vi cũ mất giá nhanh, nhưng phải giữ riêng một **tập lưu trữ vàng** các mẫu tấn công hiếm mà nghiêm trọng — họ ransomware cũ, kỹ thuật sống lại sau nhiều năm, mẫu từ các sự cố lớn của chính công ty. Nếu bỏ hẳn, mô hình sẽ quên chúng và bạn tự tạo ra vùng mù cho đúng những thứ đắt nhất khi xảy ra. Trộn lại tập vàng vào mỗi lần huấn luyện là chi phí gần bằng không.',
        },
        {
          id: 't10l3-q5',
          kind: 'input',
          tags: ['trien-khai', 'shadow-mode'],
          q: 'Chế độ chạy mô hình mới song song trên toàn bộ lưu lượng nhưng chỉ ghi log, không sinh cảnh báo, tên tiếng Anh là gì?',
          accept: ['shadow mode', 'shadow', 'shadow deployment', 'che do bong'],
          placeholder: 'Gõ tên chế độ…',
          hint: 'Từ tiếng Anh nghĩa là "cái bóng".',
          why: 'Shadow mode cho bạn câu trả lời cho hai câu hỏi đắt nhất mà không tốn một phút nào của analyst: mô hình mới sẽ tạo bao nhiêu cảnh báo mỗi ngày, và bao nhiêu phần trăm trong đó trùng với mô hình cũ. Mức chồng lấn thấp không có nghĩa là mô hình mới tệ — nó có thể đang bắt được nhóm khác — nhưng nó là tín hiệu bắt buộc phải điều tra trước khi mở canary.',
        },
      ],
      terms: ['shadow-mode', 'active-learning', 'troi-khai-niem', 'nguong'],
      further: [
        {
          title: 'Breck et al. — The ML Test Score: A Rubric for ML Production Readiness (Google, 2017)',
          note: 'Bảng chấm 28 tiêu chí về mức sẵn sàng sản xuất, chia theo dữ liệu, mô hình, hạ tầng và giám sát. Dùng làm danh sách kiểm tra trước khi triển khai.',
        },
        {
          title: 'Google Cloud — MLOps: Continuous delivery and automation pipelines in machine learning',
          note: 'Mô tả ba mức trưởng thành MLOps và chỗ đặt chế độ bóng, canary trong đường ống. Đọc để biết mình đang ở mức nào.',
          url: 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't10-l4',
      trackId: 'van-hanh',
      title: 'Khả năng giải thích cho analyst',
      subtitle:
        'Analyst có 30 giây cho mỗi cảnh báo. Một con số 0,93 không giúp gì cả — ba dòng lý do thì có.',
      minutes: 19,
      level: 'trung-cap',
      prereqs: ['t10-l1'],
      why: {
        short:
          'Một cảnh báo không giải thích được sẽ bị analyst bỏ qua, và một mô hình bị bỏ qua thì bằng không dù chỉ số có đẹp tới đâu.',
        scenario:
          'Bạn triển khai mô hình chấm điểm rủi ro cho cảnh báo. Tuần đầu, analyst xử lý nghiêm túc. Tuần thứ ba, bạn phát hiện họ đã lặng lẽ quay về sắp xếp theo mức nghiêm trọng cũ. Lý do rất đơn giản khi bạn hỏi: "Nó nói 0,93 nhưng không nói vì sao, mà tôi vẫn phải tự điều tra từ đầu — thà tôi dùng cái tôi hiểu."',
        roles: ['SOC Analyst', 'Detection Engineer', 'Security Data Scientist', 'GRC / Compliance'],
        costOfNotKnowing:
          'Mô hình của bạn bị vô hiệu hoá bằng cách bị phớt lờ, và bạn không có dữ liệu để biết vì sao. Tệ hơn: khi mô hình sai trong một sự cố lớn, không ai — kể cả bạn — giải thích được nó đã dựa vào cái gì, nên không sửa được và cũng không bảo vệ được trước kiểm toán.',
      },
      objectives: [
        'Nêu bốn lý do vì sao hệ thống phát hiện cần giải thích được, trong đó có lý do pháp lý',
        'Chỉ ra thiên lệch của feature importance dựa trên impurity và nêu phương án thay thế',
        'Đọc được một biểu đồ SHAP và chuyển ba giá trị đầu thành câu tiếng Việt cho analyst',
        'Thiết kế khối "vì sao" trong cảnh báo sao cho analyst quyết định được trong 30 giây',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bạn huấn luyện Random Forest phát hiện đăng nhập bất thường, dùng `feature_importances_` mặc định của scikit-learn. Trong bộ đặc trưng có cột `session_id` (chuỗi ngẫu nhiên, hàng triệu giá trị khác nhau) bị lọt vào do sơ suất, và cột `la_ngoai_gio` (nhị phân, rất hữu ích). Cột nào sẽ có importance cao hơn?',
          reveal:
            'Rất nhiều khả năng là **`session_id`**. Feature importance mặc định của scikit-learn cho rừng ngẫu nhiên là **mean decrease in impurity** (MDI), và nó thiên vị nặng những đặc trưng có nhiều giá trị phân biệt: một cột với hàng triệu giá trị luôn tìm được một điểm cắt làm giảm impurity trên tập huấn luyện, dù chỉ là do trùng hợp. Chính tài liệu scikit-learn cảnh báo điều này, và Strobl cùng cộng sự đã chứng minh nó từ 2007. Hệ quả rất thực tế: nếu bạn báo cáo "đặc trưng quan trọng nhất" bằng MDI, bạn có thể đang trình bày một cột rác cho cả phòng nghe. Hai cách sửa: dùng **permutation importance** đo trên tập kiểm tra, hoặc dùng **SHAP**.',
        },
        { t: 'h', text: 'Bốn lý do phải giải thích được — chúng khác nhau và cần thứ khác nhau', level: 2 },
        {
          t: 'list',
          items: [
            '**Để analyst hành động.** Đây là lý do cấp bách nhất. Analyst cần biết nên leo thang hay đóng, và nên kiểm chứng cái gì trước. Yêu cầu: giải thích **cục bộ**, cho đúng cảnh báo này, trong vài giây.',
            '**Để bạn gỡ lỗi mô hình.** Khi mô hình sai một cách khó hiểu, giải thích cho bạn thấy nó bám vào cột nào — và đó là cách phát hiện rò rỉ dữ liệu nhanh nhất. Yêu cầu: cả toàn cục lẫn cục bộ.',
            '**Để xây dựng lòng tin có căn cứ.** Analyst tin một hệ thống mà họ hiểu cách sai của nó. Một mô hình luôn đúng nhưng không giải thích được sẽ nhận được sự tuân thủ, không phải sự tin tưởng — và khi nó sai lần đầu, niềm tin sập hoàn toàn.',
            '**Để đáp ứng nghĩa vụ pháp lý.** GDPR Điều 22 giới hạn quyết định hoàn toàn tự động có tác động pháp lý đáng kể tới cá nhân; EU AI Act đặt yêu cầu minh bạch và giám sát của con người cho hệ thống rủi ro cao. Với mô hình chấm điểm nhân viên (nội gián), đây là yêu cầu thật, không phải lý thuyết.',
          ],
        },
        {
          t: 'compare',
          title: 'Giải thích toàn cục và giải thích cục bộ trả lời hai câu khác nhau',
          left: {
            title: '🌍 Toàn cục',
            items: [
              'Câu hỏi: mô hình NÓI CHUNG dựa vào cái gì',
              'Công cụ: permutation importance, SHAP tổng hợp, partial dependence',
              'Người dùng: người xây mô hình, người thẩm định, kiểm toán viên',
              'Dùng để: phát hiện rò rỉ, viết model card, quyết định bỏ bớt đặc trưng',
              'KHÔNG dùng được để giải thích một cảnh báo cụ thể',
            ],
          },
          right: {
            title: '🔍 Cục bộ',
            items: [
              'Câu hỏi: VÌ SAO cảnh báo NÀY có điểm cao',
              'Công cụ: SHAP cho một mẫu, LIME, counterfactual',
              'Người dùng: analyst đang trực, người viết báo cáo sự cố',
              'Dùng để: quyết định leo thang hay đóng, biết kiểm chứng cái gì trước',
              'Phải hiển thị ngay trong cảnh báo, không bắt mở công cụ khác',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Cái bẫy lớn nhất của feature importance toàn cục',
          md: 'Nó **trung bình hoá** trên toàn bộ dữ liệu, nên nó nói về mô hình chứ không nói về cảnh báo. Câu "đặc trưng quan trọng nhất của mô hình là số byte gửi ra" hoàn toàn có thể đúng, trong khi cảnh báo mà analyst đang mở lại có điểm cao vì một lý do khác hẳn. Trình bày importance toàn cục như thể nó là lý do của cảnh báo là một sai lầm phổ biến và nó phá huỷ lòng tin ngay khi analyst kiểm chứng lần đầu và thấy không khớp.',
        },
        { t: 'h', text: 'SHAP — tiêu chuẩn thực tế cho giải thích cục bộ', level: 2 },
        {
          t: 'p',
          md: 'SHAP (Lundberg và Lee, NeurIPS 2017) mượn khái niệm **giá trị Shapley** từ lý thuyết trò chơi hợp tác. Ý tưởng: coi mỗi đặc trưng như một người chơi cùng đóng góp vào "phần thưởng" là điểm số cuối cùng, rồi chia phần thưởng đó công bằng theo mức đóng góp trung bình của từng người qua mọi thứ tự tham gia.',
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Tính chất cộng — điều làm SHAP dùng được trong cảnh báo',
          md: 'Với mỗi mẫu, SHAP thoả mãn: **giá trị nền + tổng các đóng góp = đầu ra của mô hình cho mẫu đó**.\n\nVí dụ cụ thể: giá trị nền (điểm trung bình trên toàn bộ dữ liệu) = 0,04. Cảnh báo này có điểm 0,93. Phần chênh 0,89 được chia hết cho các đặc trưng: `so_nxdomain_1h` +0,41, `entropy_ten_mien` +0,28, `tuoi_ten_mien_ngay` +0,17, còn lại cộng dồn +0,03.\n\nChính tính chất cộng này làm SHAP hơn hẳn các cách xếp hạng khác cho mục đích vận hành: bạn nói được **chính xác bao nhiêu điểm** đến từ đâu, và tổng luôn khớp. Với mô hình cây (Random Forest, XGBoost, LightGBM), thuật toán **TreeSHAP** (Lundberg và cộng sự, Nature Machine Intelligence 2020) tính chính xác trong thời gian đa thức thay vì phải duyệt mọi tập con.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Từ SHAP tới ba dòng tiếng Việt mà analyst đọc được',
          code: `import shap
import numpy as np

giai_thich = shap.TreeExplainer(mo_hinh)      # TreeSHAP: chính xác và nhanh với mô hình cây
sv = giai_thich.shap_values(X_canh_bao)       # ma trận (so_mau, so_dac_trung)

TEN_VIET = {
    'so_nxdomain_1h': 'số truy vấn DNS trả về NXDOMAIN trong 1 giờ',
    'entropy_ten_mien': 'độ ngẫu nhiên của chuỗi tên miền',
    'tuoi_ten_mien_ngay': 'tuổi tên miền tính bằng ngày',
}

def ly_do(i: int, k: int = 3) -> list[str]:
    """Ba lý do ĐẨY ĐIỂM LÊN cho cảnh báo thứ i, đã dịch sang tiếng người."""
    dong = sv[i]
    thu_tu = np.argsort(-dong)[:k]            # chỉ lấy đóng góp dương
    ket_qua = []
    for j in thu_tu:
        if dong[j] <= 0:
            continue
        ten = X_canh_bao.columns[j]
        gia_tri = X_canh_bao.iloc[i, j]
        ket_qua.append(
            '{} = {:.1f} (dong gop +{:.2f})'.format(TEN_VIET.get(ten, ten), gia_tri, dong[j])
        )
    return ket_qua`,
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't10l4-cp1',
              kind: 'mcq',
              tags: ['giai-thich', 'shap'],
              q: 'Giá trị nền SHAP là 0,05 và điểm của một cảnh báo là 0,88. Tổng các giá trị SHAP của mọi đặc trưng cho cảnh báo đó bằng bao nhiêu?',
              options: ['0,88', '0,83', '1,00', 'Không xác định được nếu chưa biết số đặc trưng'],
              answer: 1,
              why: 'Tính chất cộng của SHAP: giá trị nền + tổng đóng góp = đầu ra. Vậy tổng đóng góp = 0,88 − 0,05 = **0,83**. Lưu ý tổng này gồm cả đóng góp âm (những đặc trưng kéo điểm xuống), nên trong cảnh báo bạn thường chỉ hiển thị ba đóng góp dương lớn nhất — nhưng khi gỡ lỗi thì phải nhìn cả hai chiều, vì một đặc trưng kéo mạnh xuống cũng là thông tin quan trọng.',
              distractorWhy: [
                'Đây là đầu ra, chưa trừ giá trị nền.',
                '',
                'SHAP không chuẩn hoá về 1; nó cộng đúng bằng chênh lệch so với nền.',
                'Số đặc trưng không ảnh hưởng — tính chất cộng luôn đúng bất kể có bao nhiêu cột.',
              ],
            },
            {
              id: 't10l4-cp2',
              kind: 'truefalse',
              tags: ['giai-thich'],
              q: 'Nếu SHAP cho thấy `so_lan_dang_nhap_that_bai` đóng góp +0,4 vào điểm, ta kết luận được rằng đăng nhập thất bại đã gây ra hành vi tấn công.',
              answer: false,
              why: 'SHAP giải thích **mô hình**, không giải thích **thế giới**. Nó nói: trong hàm mà mô hình đã học, cột này đẩy điểm lên 0,4. Nó không nói gì về nhân quả. Nếu đặc trưng đó tương quan với một nguyên nhân thật khác, hoặc tệ hơn là bị rò rỉ từ tương lai, SHAP vẫn sẽ chỉ vào nó một cách rất thuyết phục. Đây là lý do giải thích phải luôn được analyst kiểm chứng bằng bằng chứng thô, chứ không thay thế bằng chứng.',
            },
          ],
        },
        { t: 'h', text: 'LIME và counterfactual — hai công cụ còn lại', level: 2 },
        {
          t: 'table',
          caption: 'Bốn kỹ thuật giải thích, so theo tiêu chí vận hành thực tế',
          head: ['Kỹ thuật', 'Phạm vi', 'Chi phí tính', 'Điểm mạnh', 'Giới hạn phải biết'],
          rows: [
            [
              'Permutation importance',
              'Toàn cục',
              'Trung bình (phải chấm điểm lại nhiều lần)',
              'Không thiên vị theo lực lượng, đo trên tập kiểm tra',
              'Sai lệch khi các đặc trưng tương quan mạnh với nhau',
            ],
            [
              'SHAP (TreeSHAP)',
              'Cục bộ và tổng hợp được lên toàn cục',
              'Thấp với mô hình cây, cao với mô hình khác',
              'Cộng đúng bằng điểm, nhất quán, có nền lý thuyết',
              'Vẫn giả định độc lập ở một số biến thể; không phải nhân quả',
            ],
            [
              'LIME',
              'Cục bộ',
              'Trung bình (huấn luyện mô hình thay thế quanh mỗi mẫu)',
              'Dùng được với mọi mô hình kể cả hộp đen hoàn toàn',
              'Kém ổn định: chạy hai lần có thể ra hai lời giải thích khác nhau',
            ],
            [
              'Counterfactual',
              'Cục bộ',
              'Thay đổi tuỳ cách tìm',
              'Dạng analyst hiểu ngay và kiểm chứng được',
              'Có thể đề xuất thay đổi phi thực tế nếu không ràng buộc miền giá trị',
            ],
          ],
        },
        {
          t: 'p',
          md: '**LIME** (Ribeiro, Singh và Guestrin, KDD 2016) hoạt động bằng cách sinh nhiều mẫu nhiễu quanh điểm cần giải thích rồi khớp một mô hình tuyến tính đơn giản trên vùng lân cận đó. Ưu điểm là không cần biết gì về mô hình bên trong. Nhược điểm nghiêm trọng trong vận hành: **không ổn định** — chạy lại có thể cho thứ tự đặc trưng khác, và analyst nhìn thấy hai lời giải thích khác nhau cho cùng một cảnh báo sẽ mất niềm tin ngay.',
        },
        {
          t: 'p',
          md: '**Counterfactual** trả lời câu hỏi tự nhiên nhất của con người: *cần gì khác đi để kết luận đổi?* Ví dụ: "Nếu lượng dữ liệu tải lên dưới 4,2 GB thay vì 11,8 GB thì cảnh báo này đã không kêu." Analyst kiểm chứng được ngay, và nếu 11,8 GB là do một lần sao lưu hợp lệ thì họ đóng cảnh báo trong 20 giây.',
        },
        {
          t: 'h',
          text: 'Trình bày sao cho dùng được trong 30 giây',
          level: 2,
        },
        {
          t: 'steps',
          title: 'Ví dụ mẫu: cùng một cảnh báo, hai cách trình bày',
          steps: [
            {
              title: 'Cách tệ — đúng về kỹ thuật nhưng vô dụng',
              md: '`risk_score=0.9312` | `shap: f_23=0.41, f_07=0.28, f_11=0.17` | `model=lgbm_v7`.\n\nAnalyst không biết `f_23` là gì, không biết 0,41 to hay nhỏ, không biết 0,9312 so với cái gì. Họ sẽ bỏ qua và tự điều tra từ đầu — đúng như tình huống ở đầu bài.',
            },
            {
              title: 'Cách tốt — ba dòng lý do có đơn vị và có mốc so sánh',
              md: '**Điểm rủi ro 0,93** (dải cao nhất, top 0,4% của 24 giờ qua).\n\nVì sao:\n- Máy này truy vấn **142 tên miền trả về NXDOMAIN trong 1 giờ**; mức bình thường của chính máy này là 3–8.\n- Các tên miền có **độ ngẫu nhiên ký tự rất cao** (entropy 3,9 so với trung vị 2,4 của lưu lượng công ty).\n- **Cả 142 tên miền đều đăng ký dưới 7 ngày.**',
            },
            {
              title: 'Thêm counterfactual và mốc so sánh nhóm ngang hàng',
              md: 'Nếu số NXDOMAIN trong 1 giờ dưới **35**, cảnh báo này đã không kêu.\n\nSo với nhóm ngang hàng: trong 214 máy cùng phòng ban, máy này đứng thứ **1** về số NXDOMAIN trong 7 ngày qua.',
            },
            {
              title: 'Kết thúc bằng việc cần làm, không phải bằng con số',
              md: 'Đề xuất kiểm chứng, theo thứ tự:\n1. Xem tiến trình nào phát sinh truy vấn (liên kết truy vấn EDR đã điền sẵn).\n2. Kiểm tra máy có phần mềm bảo mật nào dùng DNS để cập nhật không (danh sách loại trừ đã biết).\n3. Nếu không giải thích được, cách ly mạng và lấy mẫu bộ nhớ.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Quy tắc ba con số của một khối "vì sao"',
          md: 'Mỗi dòng lý do nên có đúng ba thứ: **giá trị quan sát**, **mức bình thường để so** (của chính thực thể đó hoặc của nhóm ngang hàng), và **đơn vị**. Thiếu mốc so sánh thì "142 NXDOMAIN" không nói lên gì với người chưa từng nhìn dữ liệu này. Có mốc so sánh thì analyst đọc một dòng là quyết định được. Đừng bao giờ hiển thị giá trị SHAP thô cho analyst — nó là đơn vị nội bộ của mô hình, hãy dùng nó để **xếp hạng** rồi vứt đi.',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Giải thích đẹp không làm mô hình đúng',
          md: 'Một mô hình rò rỉ dữ liệu sẽ đưa ra lời giải thích cực kỳ thuyết phục — vì cột rò rỉ thật sự là thứ nó dựa vào. Đã có nhiều trường hợp lời giải thích mượt mà khiến cả đội tin tưởng một mô hình đang học tắt. Hãy luôn kiểm tra ngược: **lý do mà mô hình đưa ra có tồn tại tại thời điểm cần ra quyết định không?** Nếu đặc trưng đó chỉ có sau khi sự việc đã được xác nhận thì bạn vừa tìm ra một lỗi, không phải một hiểu biết.',
        },
        {
          t: 'terms',
          ids: ['shap', 'random-forest', 'gbdt', 'hieu-chuan'],
        },
      ],
      keyTakeaways: [
        'Bốn lý do cần giải thích: để analyst hành động, để gỡ lỗi mô hình, để xây lòng tin, và để đáp ứng nghĩa vụ pháp lý.',
        'Feature importance mặc định của scikit-learn (MDI) thiên vị nặng đặc trưng nhiều giá trị — dùng permutation importance hoặc SHAP.',
        'Giải thích toàn cục nói về mô hình, giải thích cục bộ nói về cảnh báo; đừng dùng cái đầu để giải thích cái sau.',
        'SHAP có tính chất cộng: nền + tổng đóng góp = điểm, nên nói được chính xác bao nhiêu điểm đến từ đâu.',
        'LIME dùng được với mọi mô hình nhưng kém ổn định; counterfactual là dạng analyst hiểu và kiểm chứng nhanh nhất.',
        'Mỗi dòng lý do phải có giá trị, mốc so sánh và đơn vị; không bao giờ hiển thị số SHAP thô cho analyst.',
      ],
      cards: [
        {
          id: 't10l4-c1',
          front: 'Feature importance mặc định của scikit-learn cho rừng ngẫu nhiên bị thiên vị theo hướng nào?',
          back: 'Thiên vị đặc trưng có nhiều giá trị phân biệt (lực lượng cao), vì chúng luôn tìm được điểm cắt giảm impurity trên tập huấn luyện. Dùng permutation importance hoặc SHAP thay thế.',
          tags: ['giai-thich'],
        },
        {
          id: 't10l4-c2',
          front: 'Phát biểu tính chất cộng của SHAP.',
          back: 'Giá trị nền cộng tổng các đóng góp SHAP bằng đúng đầu ra của mô hình cho mẫu đó.',
          hint: 'Nghĩ tới việc chia phần thưởng trong một ván chơi hợp tác.',
          tags: ['shap'],
        },
        {
          id: 't10l4-c3',
          front: 'Nhược điểm vận hành nghiêm trọng nhất của LIME là gì?',
          back: 'Không ổn định: chạy hai lần trên cùng một mẫu có thể cho hai lời giải thích khác nhau, khiến analyst mất niềm tin.',
          tags: ['giai-thich'],
        },
        {
          id: 't10l4-c4',
          front: 'Một dòng lý do trong cảnh báo phải có đủ ba thứ gì?',
          back: 'Giá trị quan sát, mốc so sánh (mức bình thường của chính thực thể hoặc của nhóm ngang hàng), và đơn vị.',
          tags: ['giai-thich', 'canh-bao'],
        },
        {
          id: 't10l4-c5',
          front: 'SHAP giải thích cái gì — mô hình hay thế giới?',
          back: 'Chỉ giải thích mô hình. Nó cho biết đặc trưng nào đẩy điểm lên trong hàm đã học, không nói gì về quan hệ nhân quả trong thực tế.',
          tags: ['shap', 'giai-thich'],
        },
      ],
      quiz: [
        {
          id: 't10l4-q1',
          kind: 'mcq',
          tags: ['giai-thich'],
          q: 'Analyst mở một cảnh báo có điểm 0,91. Thông tin nào giúp họ quyết định nhanh nhất?',
          options: [
            'Biểu đồ feature importance toàn cục của mô hình',
            'Ba đặc trưng đóng góp nhiều nhất CHO CẢNH BÁO NÀY, kèm giá trị và mức bình thường của chính thực thể đó',
            'Đường cong ROC của mô hình trên tập kiểm tra',
            'Số cây và độ sâu tối đa của mô hình LightGBM',
          ],
          answer: 1,
          why: 'Analyst cần giải thích **cục bộ** kèm mốc so sánh. Importance toàn cục nói về mô hình nói chung và có thể không liên quan gì tới cảnh báo đang mở; ROC nói về chất lượng tổng thể; siêu tham số thì hoàn toàn không liên quan tới quyết định trong ca trực. Mốc so sánh là phần thường bị quên nhất mà lại quyết định nhất: "142 NXDOMAIN" chỉ có nghĩa khi đi kèm "mức bình thường của máy này là 3–8".',
          distractorWhy: [
            'Trung bình hoá trên toàn dữ liệu nên không giải thích được cảnh báo cụ thể này.',
            '',
            'ROC là chỉ số đánh giá mô hình, không phải bằng chứng cho một sự kiện.',
            'Siêu tham số không giúp gì cho quyết định leo thang hay đóng cảnh báo.',
          ],
        },
        {
          id: 't10l4-q2',
          kind: 'match',
          tags: ['giai-thich', 'shap'],
          q: 'Ghép mỗi kỹ thuật giải thích với đặc điểm nhận dạng của nó.',
          pairs: [
            ['SHAP', 'Các đóng góp cộng lại đúng bằng chênh lệch giữa điểm và giá trị nền'],
            ['LIME', 'Khớp một mô hình tuyến tính đơn giản quanh vùng lân cận của mẫu'],
            ['Permutation importance', 'Xáo trộn từng cột trên tập kiểm tra và đo mức tụt chất lượng'],
            ['Counterfactual', 'Chỉ ra giá trị tối thiểu cần thay đổi để kết luận đảo chiều'],
          ],
          why: 'Bốn kỹ thuật này khác nhau ở **câu hỏi chúng trả lời**, không chỉ ở cách tính. SHAP phân bổ điểm; LIME xấp xỉ cục bộ bằng mô hình đơn giản; permutation đo tầm quan trọng bằng cách phá đặc trưng và xem mô hình tệ đi bao nhiêu; counterfactual chỉ ra ranh giới. Trong một cảnh báo thực tế, SHAP dùng để xếp hạng lý do còn counterfactual dùng để đóng khung hành động — hai cái bổ sung nhau rất tốt.',
        },
        {
          id: 't10l4-q3',
          kind: 'truefalse',
          tags: ['giai-thich', 'ro-ri-du-lieu'],
          q: 'Nếu lời giải thích SHAP của mô hình nghe rất hợp lý với chuyên gia bảo mật thì có thể yên tâm rằng mô hình không bị rò rỉ dữ liệu.',
          answer: false,
          why: 'Ngược lại — mô hình rò rỉ thường cho lời giải thích **rất thuyết phục**, vì cột rò rỉ đúng là thứ nó dựa vào và cột đó thường có tên nghe rất liên quan tới bảo mật (ví dụ `alert_severity`, `analyst_verdict`, `blocked_by_proxy`). Kiểm tra bắt buộc không phải là "nghe có hợp lý không" mà là "**giá trị này đã tồn tại tại thời điểm cần ra quyết định chưa**". Câu hỏi thời điểm mới phát hiện được rò rỉ, còn cảm giác hợp lý thì không.',
        },
        {
          id: 't10l4-q4',
          kind: 'multi',
          tags: ['giai-thich', 'canh-bao'],
          q: 'Khối "vì sao" trong một cảnh báo nên chứa những gì? (Chọn tất cả)',
          options: [
            'Tối đa ba lý do, mỗi lý do một dòng',
            'Giá trị SHAP thô của từng đặc trưng, làm tròn bốn chữ số',
            'Mức bình thường của chính thực thể đó hoặc của nhóm ngang hàng để so sánh',
            'Hai tới ba bước kiểm chứng cụ thể kèm liên kết truy vấn sẵn sàng bấm',
          ],
          answers: [0, 2, 3],
          why: 'Ba yếu tố này biến giải thích thành hành động trong 30 giây. Giá trị SHAP thô thì ngược lại: nó là đơn vị nội bộ của mô hình, không có ý nghĩa nghiệp vụ, và làm khối "vì sao" trông giống bảng debug. Hãy dùng SHAP để **xếp hạng** lý do rồi bỏ con số đi, giữ lại giá trị quan sát thật với đơn vị thật.',
        },
        {
          id: 't10l4-q5',
          kind: 'input',
          tags: ['giai-thich'],
          q: 'Dạng giải thích trả lời câu hỏi "cần thay đổi tối thiểu điều gì để kết luận đảo chiều", tên tiếng Anh là gì?',
          accept: ['counterfactual', 'counterfactual explanation', 'phan thuc te'],
          placeholder: 'Một từ tiếng Anh…',
          hint: 'Bắt đầu bằng "counter".',
          why: 'Counterfactual explanation cho analyst một mệnh đề kiểm chứng được ngay: "nếu lượng tải lên dưới 4,2 GB thì cảnh báo đã không kêu". Ưu điểm lớn là nó không đòi hỏi analyst hiểu mô hình chút nào. Nhược điểm phải biết: nếu không ràng buộc miền giá trị hợp lệ, thuật toán tìm counterfactual có thể đề xuất những thay đổi phi thực tế như "nếu tuổi tên miền là −3 ngày" — nên luôn cần kiểm tra tính khả thi trước khi hiển thị.',
        },
      ],
      terms: ['shap', 'random-forest', 'gbdt', 'hieu-chuan'],
      further: [
        {
          title: 'Lundberg & Lee — A Unified Approach to Interpreting Model Predictions (NeurIPS 2017)',
          note: 'Bài gốc của SHAP. Đọc phần tính chất cộng và nhất quán để hiểu vì sao nó hơn các cách xếp hạng trước đó.',
          url: 'https://arxiv.org/abs/1705.07874',
        },
        {
          title: 'Ribeiro, Singh, Guestrin — Why Should I Trust You? Explaining the Predictions of Any Classifier (KDD 2016)',
          note: 'Bài gốc của LIME, kèm ví dụ kinh điển về mô hình phân biệt chó sói và husky nhờ nhìn vào tuyết ở nền ảnh.',
          url: 'https://arxiv.org/abs/1602.04938',
        },
        {
          title: 'scikit-learn — Permutation Importance vs Random Forest Feature Importance',
          note: 'Trang tài liệu chính thức chứng minh bằng ví dụ chạy được rằng MDI thiên vị đặc trưng lực lượng cao.',
          url: 'https://scikit-learn.org/stable/auto_examples/inspection/plot_permutation_importance.html',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't10-l5',
      trackId: 'van-hanh',
      title: 'Quản trị, tuân thủ và tài liệu',
      subtitle:
        'Ngày kiểm toán viên hỏi "mô hình này quyết định thế nào và ai chịu trách nhiệm", câu trả lời phải có sẵn trong tài liệu chứ không nằm trong đầu bạn.',
      minutes: 19,
      level: 'trung-cap',
      prereqs: ['t10-l3'],
      why: {
        short:
          'Khung quản trị AI đã chuyển từ khuyến nghị sang nghĩa vụ pháp lý ở châu Âu, và mọi hệ thống ML bảo mật đều cần tài liệu tối thiểu để tồn tại qua một cuộc kiểm toán.',
        scenario:
          'Công ty bạn chuẩn bị chứng nhận ISO/IEC 42001 và bán dịch vụ cho khách hàng châu Âu. Kiểm toán viên hỏi ba câu về mô hình chấm điểm nội gián của bạn: dữ liệu huấn luyện lấy từ đâu và có chứa dữ liệu cá nhân nhân viên không; ai đã phê duyệt ngưỡng hiện tại; và cho tôi xem hồ sơ của một quyết định cụ thể ngày 14/7. Bạn có 48 giờ để trả lời.',
        roles: ['GRC / Compliance', 'Security Architect', 'Security Data Scientist', 'AI Security Engineer'],
        costOfNotKnowing:
          'Dự án bị dừng ở khâu thẩm định pháp lý sau khi đã tốn sáu tháng kỹ thuật, hoặc tệ hơn: hệ thống chạy rồi mới phát hiện nó thuộc nhóm rủi ro cao theo EU AI Act và thiếu toàn bộ nghĩa vụ về tài liệu, giám sát của con người và lưu vết.',
      },
      objectives: [
        'Gọi tên bốn chức năng của NIST AI RMF và câu hỏi cốt lõi mà mỗi chức năng trả lời',
        'Xác định một hệ thống ML bảo mật cụ thể có thuộc nhóm rủi ro cao theo EU AI Act hay không, và giải thích lý do',
        'Phân biệt vai trò của NIST AI RMF, ISO/IEC 42001 và EU AI Act trong một chương trình quản trị',
        'Viết model card cho mô hình phát hiện và thiết kế bản ghi lưu vết quyết định phục vụ kiểm toán',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Hai hệ thống ML trong cùng một công ty châu Âu: (A) mô hình phát hiện mã độc bảo vệ mạng nội bộ của chính công ty; (B) mô hình chấm điểm rủi ro nội gián cho nhân viên, điểm cao dẫn tới rà soát và có thể ảnh hưởng tới kỷ luật lao động. Theo EU AI Act, hệ thống nào nhiều khả năng rơi vào nhóm rủi ro cao?',
          reveal:
            '**Hệ thống B.** Phụ lục III của EU AI Act liệt kê "việc làm, quản lý người lao động" là một lĩnh vực rủi ro cao, bao gồm các hệ thống dùng để theo dõi và đánh giá hành vi hoặc hiệu suất của người lao động. Một mô hình chấm điểm nội gián rơi thẳng vào đó, kéo theo cả bộ nghĩa vụ: quản lý rủi ro, quản trị dữ liệu, tài liệu kỹ thuật, lưu vết tự động, minh bạch, **giám sát của con người**, độ chính xác và an toàn thông tin.\n\nHệ thống A thường không nằm trong Phụ lục III — nó bảo vệ tài sản của chính công ty, không ra quyết định về con người. Ngoại lệ đáng chú ý: nếu nó là thành phần an toàn trong việc quản lý và vận hành **hạ tầng số trọng yếu**, nó có thể rơi vào nhóm rủi ro cao theo một mục khác của Phụ lục III. Bài học vận hành: **phân loại theo tác động lên con người, không theo mức độ tinh vi kỹ thuật.**',
        },
        {
          t: 'p',
          md: 'Ba văn bản dưới đây thường bị gộp làm một trong các cuộc họp, nhưng chúng khác nhau về bản chất và bạn cần nói đúng tên khi làm việc với bộ phận pháp chế.',
        },
        {
          t: 'table',
          caption: 'Ba khung quản trị AI — khác nhau về tính bắt buộc và về cái chúng cho bạn',
          head: ['Văn bản', 'Bản chất', 'Phạm vi', 'Bạn nhận được gì'],
          rows: [
            [
              'NIST AI RMF 1.0 (1/2023)',
              'Khung tự nguyện, không phải luật',
              'Mọi hệ thống AI, mọi ngành, dùng được toàn cầu',
              'Cách tổ chức tư duy về rủi ro: bốn chức năng GOVERN, MAP, MEASURE, MANAGE',
            ],
            [
              'ISO/IEC 42001:2023',
              'Tiêu chuẩn hệ thống quản lý, CÓ THỂ CHỨNG NHẬN',
              'Tổ chức xây dựng hoặc sử dụng AI',
              'Cấu trúc giống ISO 27001 nhưng cho AI: chính sách, vai trò, kiểm soát, đánh giá nội bộ',
            ],
            [
              'EU AI Act — Quy định (EU) 2024/1689',
              'LUẬT, có chế tài phạt',
              'Hệ thống AI đưa ra thị trường hoặc sử dụng trong EU',
              'Nghĩa vụ bắt buộc phân theo mức rủi ro, kèm mốc thời gian áp dụng',
            ],
          ],
        },
        { t: 'h', text: 'NIST AI RMF — bốn chức năng, bốn câu hỏi', level: 2 },
        {
          t: 'table',
          caption: 'Bốn chức năng của NIST AI RMF áp vào một mô hình phát hiện',
          head: ['Chức năng', 'Câu hỏi cốt lõi', 'Sản phẩm cụ thể cho hệ thống ML bảo mật'],
          rows: [
            [
              'GOVERN',
              'Ai chịu trách nhiệm, chính sách nào ràng buộc, văn hoá rủi ro ra sao',
              'Chủ sở hữu mô hình có tên, quy trình phê duyệt ngưỡng, chính sách khi nào được tự động hành động',
            ],
            [
              'MAP',
              'Hệ thống dùng ở đâu, cho ai, hỏng thì ai chịu thiệt',
              'Mô tả ngữ cảnh triển khai, danh sách bên bị ảnh hưởng (kể cả nhân viên bị chấm điểm), kịch bản lạm dụng',
            ],
            [
              'MEASURE',
              'Đo bằng chỉ số nào, đo lại bao lâu một lần, ai kiểm chứng',
              'Bộ chỉ số precision/recall theo nhóm, chỉ số trôi, kiểm thử đối kháng, đánh giá độc lập với người xây',
            ],
            [
              'MANAGE',
              'Xử lý rủi ro đã đo theo thứ tự ưu tiên nào, khi nào dừng hệ thống',
              'Tiêu chí rollback, kế hoạch ứng phó khi mô hình sai, lịch rà soát, điều kiện khai tử mô hình',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao GOVERN đứng ở giữa chứ không đứng đầu',
          md: 'Trong hình vẽ chính thức của NIST, GOVERN không phải bước một trong dây chuyền mà là vòng bao quanh ba chức năng kia. Ý nghĩa thực tế rất cụ thể: nếu không có người chịu trách nhiệm có tên và không có chính sách quyết định ai được bấm nút, thì mọi việc đo lường đều biến thành báo cáo không ai đọc. Câu hỏi kiểm tra sức khoẻ quản trị nhanh nhất cho một mô hình: **ai là người sẽ bị hỏi khi nó sai, và người đó có quyền tắt nó không?**',
        },
        {
          t: 'p',
          md: 'NIST còn phát hành **Generative AI Profile** (NIST AI 600-1, tháng 7/2024), áp bốn chức năng trên vào rủi ro riêng của AI sinh tạo. Nếu bạn vận hành trợ lý LLM cho SOC thì đó là tài liệu đi kèm bắt buộc phải đọc.',
        },
        { t: 'h', text: 'EU AI Act — bốn mức rủi ro và các mốc thời gian', level: 2 },
        {
          t: 'list',
          items: [
            '**Rủi ro không chấp nhận được** — bị cấm. Gồm chấm điểm xã hội bởi cơ quan công quyền, một số dạng nhận dạng sinh trắc từ xa theo thời gian thực ở nơi công cộng, khai thác điểm yếu của nhóm dễ tổn thương. Áp dụng từ **2/2/2025**.',
            '**Rủi ro cao** — được phép nhưng kèm nghĩa vụ nặng. Xác định theo Phụ lục III (bao gồm việc làm và quản lý người lao động, hạ tầng trọng yếu, tiếp cận dịch vụ thiết yếu, thực thi pháp luật) hoặc theo Phụ lục I khi AI là thành phần an toàn của sản phẩm đã bị quản lý.',
            '**Rủi ro hạn chế** — chỉ nghĩa vụ minh bạch: phải cho người dùng biết họ đang tương tác với AI, và phải đánh dấu nội dung do AI tạo ra.',
            '**Rủi ro tối thiểu** — không nghĩa vụ bắt buộc, khuyến khích tự nguyện áp dụng quy tắc ứng xử.',
            '**Mốc thời gian:** luật có hiệu lực 1/8/2024; các hành vi bị cấm và nghĩa vụ về hiểu biết AI áp dụng từ 2/2/2025; nghĩa vụ với mô hình AI đa dụng (GPAI) và bộ máy quản trị từ 2/8/2025; phần lớn nghĩa vụ rủi ro cao theo Phụ lục III từ 2/8/2026; nhóm rủi ro cao nhúng trong sản phẩm theo Phụ lục I từ 2/8/2027.',
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Ba điều dễ hiểu sai về EU AI Act trong ngành bảo mật',
          md: '**1. Loại trừ mục đích quốc phòng và an ninh quốc gia.** Điều 2 loại trừ hệ thống AI dùng **riêng** cho mục đích quân sự, quốc phòng hoặc an ninh quốc gia. Nhưng một sản phẩm thương mại bán cho doanh nghiệp thì không được hưởng loại trừ này chỉ vì nó liên quan tới bảo mật.\n\n**2. Luật yêu cầu chống tấn công đối kháng.** Điều 15 buộc hệ thống rủi ro cao phải có mức độ chính xác, độ bền vững và an toàn thông tin phù hợp, và nêu đích danh các nguy cơ như đầu độc dữ liệu, đầu độc mô hình, mẫu đối kháng và tấn công vào tính bí mật. Nói cách khác, nội dung của chặng 8 đã trở thành nghĩa vụ pháp lý ở một số ngữ cảnh.\n\n**3. Mốc thời gian có thể còn thay đổi.** Uỷ ban châu Âu đã đề xuất gói sửa đổi (Digital Omnibus, cuối 2025) có nội dung giãn một số nghĩa vụ với hệ thống rủi ro cao. Trước khi lập kế hoạch tuân thủ, hãy kiểm tra mốc hiện hành trên văn bản chính thức thay vì tin vào bài viết cũ — kể cả bài này.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't10l5-cp1',
              kind: 'mcq',
              tags: ['eu-ai-act', 'quan-tri'],
              q: 'Công ty bạn bán một sản phẩm EDR có mô hình ML phát hiện mã độc cho khách hàng doanh nghiệp ở EU. Nhận định nào chính xác nhất?',
              options: [
                'Được miễn hoàn toàn vì là sản phẩm an ninh mạng',
                'Không tự động thuộc nhóm rủi ro cao, nhưng phải tự đánh giá theo Phụ lục III và vẫn chịu nghĩa vụ minh bạch cùng các luật khác',
                'Luôn thuộc nhóm rủi ro không chấp nhận được vì có thể chặn hành vi người dùng',
                'Chỉ cần tuân thủ khi có trên 10.000 người dùng',
              ],
              answer: 1,
              why: 'Không có miễn trừ chung cho "sản phẩm an ninh mạng". Loại trừ ở Điều 2 chỉ áp cho mục đích quân sự, quốc phòng và an ninh quốc gia dùng riêng, không áp cho sản phẩm thương mại. Một EDR bảo vệ máy trạm doanh nghiệp thường **không** nằm trong danh mục Phụ lục III, nhưng nhà cung cấp vẫn phải tự đánh giá và ghi lại kết luận — bản đánh giá đó chính là thứ kiểm toán viên sẽ hỏi. Ngoài ra vẫn còn GDPR, nghĩa vụ hợp đồng với khách hàng và các quy định ngành khác.',
              distractorWhy: [
                'Không tồn tại miễn trừ theo lĩnh vực an ninh mạng thương mại.',
                '',
                'Nhóm bị cấm là danh sách rất hẹp và cụ thể, không bao gồm phát hiện mã độc.',
                'Luật không đặt ngưỡng theo số người dùng cho việc phân loại rủi ro.',
              ],
            },
            {
              id: 't10l5-cp2',
              kind: 'truefalse',
              tags: ['quan-tri', 'nist-ai-rmf'],
              q: 'NIST AI RMF là văn bản có tính bắt buộc pháp lý tại Hoa Kỳ.',
              answer: false,
              why: 'NIST AI RMF là khung **tự nguyện**. Giá trị của nó nằm ở chỗ khác: nó cho bạn một ngôn ngữ chung và một cấu trúc để chứng minh sự cẩn trọng, và nhiều hợp đồng, chính sách nội bộ hay yêu cầu của khách hàng lại tham chiếu tới nó — khiến nó trở thành bắt buộc **về mặt thương mại** dù không bắt buộc về mặt luật. Tính chất bắt buộc pháp lý nằm ở EU AI Act; tính chứng nhận được nằm ở ISO/IEC 42001.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'ethics',
          title: 'Chấm điểm con người không giống chấm điểm tệ tin',
          md: 'Khi mô hình của bạn chấm điểm một tệp PE và sai, cái giá là một lần phân tích thừa. Khi nó chấm điểm **một nhân viên** và sai, cái giá là một người bị nghi ngờ, bị theo dõi sát hơn, và có thể bị ảnh hưởng tới sự nghiệp mà không hề biết vì sao.\n\nBốn ràng buộc tối thiểu mà một hệ thống chấm điểm nội gián nên tự đặt ra, dù luật ở nước bạn chưa yêu cầu:\n\n1. **Không bao giờ tự động hoá hành động bất lợi.** Điểm số chỉ được dùng để sắp thứ tự cho con người xem xét, không được tự sinh biện pháp kỷ luật.\n2. **Kiểm tra tác động chênh lệch.** Đo precision và tỉ lệ cảnh báo theo phòng ban, ca làm việc, loại hợp đồng. Nếu nhân viên thời vụ bị cảnh báo gấp bốn lần, đó là phát hiện cần giải thích chứ không phải kết quả cần khoe.\n3. **Tối thiểu hoá dữ liệu.** Đặc trưng phải phục vụ đúng mục đích an ninh đã tuyên bố. "Thu thập vì biết đâu dùng được" là chỗ mọi vụ bê bối bắt đầu.\n4. **Minh bạch ở cấp chính sách.** Nhân viên có quyền biết rằng tổ chức có hệ thống loại này và nó dùng những nhóm dữ liệu gì — kể cả khi chi tiết kỹ thuật phải giữ kín.',
        },
        { t: 'h', text: 'Tài liệu tối thiểu: model card và data sheet', level: 2 },
        {
          t: 'p',
          md: '**Model card** (Mitchell và cộng sự, 2019) là một trang mô tả mô hình: nó làm gì, được đánh giá trên dữ liệu nào, hoạt động kém ở đâu, và không nên dùng vào việc gì. **Datasheet for datasets** (Gebru và cộng sự) làm điều tương tự cho bộ dữ liệu: thu thập thế nào, ai gán nhãn, có dữ liệu cá nhân không.',
        },
        {
          t: 'checklist',
          title: 'Model card cho một mô hình phát hiện — mười mục không được thiếu',
          items: [
            'Định danh: tên, phiên bản, ngày huấn luyện, chủ sở hữu có tên, người phê duyệt',
            'Mục đích sử dụng dự kiến và các mục đích RÕ RÀNG KHÔNG dành cho (ví dụ: không dùng làm bằng chứng kỷ luật)',
            'Dữ liệu huấn luyện: nguồn, khoảng thời gian, cách gán nhãn, có dữ liệu cá nhân hay không',
            'Bộ đặc trưng: nhóm đặc trưng, phiên bản, những đặc trưng đã cố tình loại bỏ và lý do',
            'Chỉ số đánh giá tại ĐIỂM HOẠT ĐỘNG thật, không chỉ AUC: precision, recall, cảnh báo/ngày ở ngưỡng đang dùng',
            'Đánh giá theo lát cắt: theo phòng ban, hệ điều hành, nhóm tài sản, khung giờ — nêu rõ lát cắt nào kém',
            'Giới hạn đã biết và các kiểu hỏng đã quan sát được, kể cả kết quả kiểm thử đối kháng',
            'Cơ chế giám sát: chỉ số nào theo dõi, ngưỡng nào, ai trực, tiêu chí rollback',
            'Lịch rà soát và điều kiện khai tử mô hình',
            'Lịch sử thay đổi: mỗi phiên bản đổi gì, vì sao, ai duyệt',
          ],
        },
        {
          t: 'h',
          text: 'Lưu vết quyết định — thứ kiểm toán viên thực sự hỏi',
          level: 2,
        },
        {
          t: 'code',
          lang: 'json',
          caption: 'Một bản ghi lưu vết đủ để tái dựng lại quyết định sau nhiều năm',
          code: `{
  "quyet_dinh_id": "dec-2026-07-14-0093adf1",
  "thoi_diem": "2026-07-14T02:31:07.412Z",
  "he_thong": "ueba-insider-scorer",
  "mo_hinh": {
    "ten": "lgbm-ueba",
    "phien_ban": "v11",
    "hash_artifact": "sha256:9f3c2b81...",
    "ngay_huan_luyen": "2026-06-02",
    "nguoi_phe_duyet": "nguyen.van.a"
  },
  "dac_trung": { "phien_ban": "2026.06.2", "hash_vector": "b41c77e2a018" },
  "dau_vao": {
    "thuc_the": "user:ntanh",
    "cua_so": "2026-07-13T00:00Z/2026-07-14T00:00Z",
    "anh_chup": "s3://audit/2026/07/14/0093adf1.parquet"
  },
  "ket_qua": {
    "diem": 0.937,
    "nguong_ap_dung": 0.900,
    "hanh_dong": "tao_ticket",
    "muc_do": "high"
  },
  "giai_thich_top3": ["tai_ve_ngoai_gio", "khoi_luong_upload_ra_ngoai", "thiet_bi_moi"],
  "nguoi_xu_ly": "analyst:tt-lan",
  "ket_luan_cuoi": "duong_tinh_gia",
  "thoi_diem_ket_luan": "2026-07-14T09:12:55Z",
  "chinh_sach_luu_tru": { "giu_toi": "2033-07-14", "khong_the_sua": true }
}`,
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Ba lỗi lưu vết khiến hồ sơ vô dụng đúng lúc cần nhất',
          md: '**1. Không lưu ảnh chụp đầu vào.** Bạn ghi điểm 0,937 nhưng không giữ vector đặc trưng đã dùng. Hai năm sau, dữ liệu gốc đã hết hạn lưu trữ và không ai tái dựng được quyết định. Hãy lưu ít nhất hash vector, tốt hơn là ảnh chụp đầy đủ cho các quyết định có hành động.\n\n**2. Không gắn phiên bản mô hình và phiên bản đặc trưng.** Không có hai trường này thì bản ghi chỉ nói "hệ thống đã quyết định", không nói được **hệ thống nào**.\n\n**3. Bản ghi có thể sửa được.** Nếu log lưu vết nằm trong cùng cơ sở dữ liệu mà đội vận hành có quyền ghi, giá trị pháp lý của nó gần bằng không. Ghi vào kho chỉ-thêm (append-only) hoặc có khoá theo đối tượng, và tách quyền.',
        },
        {
          t: 'terms',
          ids: ['nist-ai-rmf', 'eu-ai-act', 'model-card', 'atlas'],
        },
      ],
      keyTakeaways: [
        'NIST AI RMF là khung tự nguyện; ISO/IEC 42001 là tiêu chuẩn chứng nhận được; EU AI Act là luật có chế tài — đừng gộp ba thứ.',
        'Bốn chức năng NIST: GOVERN (ai chịu trách nhiệm), MAP (dùng ở đâu, ai chịu thiệt), MEASURE (đo bằng gì), MANAGE (xử lý và khi nào dừng).',
        'EU AI Act phân loại theo tác động lên con người, không theo độ tinh vi kỹ thuật: mô hình chấm điểm nhân viên rủi ro cao hơn mô hình phát hiện mã độc.',
        'Điều 15 của EU AI Act biến khả năng chống đầu độc và mẫu đối kháng thành nghĩa vụ pháp lý với hệ thống rủi ro cao.',
        'Model card phải nêu cả điều mô hình KHÔNG được dùng để làm, và chỉ số tại điểm hoạt động thật chứ không chỉ AUC.',
        'Bản ghi lưu vết cần phiên bản mô hình, phiên bản đặc trưng, ảnh chụp đầu vào và phải không sửa được.',
      ],
      cards: [
        {
          id: 't10l5-c1',
          front: 'Kể bốn chức năng của NIST AI RMF.',
          back: 'GOVERN, MAP, MEASURE, MANAGE. GOVERN bao quanh ba chức năng còn lại chứ không đứng nối tiếp trước chúng.',
          hint: 'Bốn động từ tiếng Anh, chữ G đứng đầu.',
          tags: ['nist-ai-rmf', 'quan-tri'],
        },
        {
          id: 't10l5-c2',
          front: 'Khác biệt cốt lõi giữa ISO/IEC 42001 và NIST AI RMF là gì?',
          back: 'ISO/IEC 42001 là tiêu chuẩn hệ thống quản lý có thể chứng nhận bởi bên thứ ba; NIST AI RMF là khung tư duy tự nguyện, không cấp chứng nhận.',
          tags: ['quan-tri'],
        },
        {
          id: 't10l5-c3',
          front: 'Vì sao mô hình chấm điểm nội gián có nhiều khả năng thuộc nhóm rủi ro cao theo EU AI Act hơn mô hình phát hiện mã độc?',
          back: 'Vì Phụ lục III liệt kê việc làm và quản lý người lao động là lĩnh vực rủi ro cao — phân loại dựa trên tác động lên con người, không dựa trên độ phức tạp kỹ thuật.',
          tags: ['eu-ai-act'],
        },
        {
          id: 't10l5-c4',
          front: 'Mục nào trong model card hay bị bỏ quên nhất mà lại quan trọng nhất về mặt đạo đức?',
          back: 'Mục "không dành cho mục đích nào" — nêu rõ những cách dùng bị cấm, ví dụ không dùng điểm số làm bằng chứng kỷ luật.',
          tags: ['model-card'],
        },
        {
          id: 't10l5-c5',
          front: 'Ba trường bắt buộc trong bản ghi lưu vết để tái dựng được một quyết định nhiều năm sau là gì?',
          back: 'Phiên bản mô hình, phiên bản bộ đặc trưng, và ảnh chụp (hoặc hash) của vector đầu vào đã dùng.',
          tags: ['quan-tri', 'kiem-toan'],
        },
      ],
      quiz: [
        {
          id: 't10l5-q1',
          kind: 'match',
          tags: ['nist-ai-rmf'],
          q: 'Ghép mỗi chức năng của NIST AI RMF với câu hỏi cốt lõi của nó.',
          pairs: [
            ['GOVERN', 'Ai chịu trách nhiệm và chính sách nào ràng buộc việc dùng hệ thống'],
            ['MAP', 'Hệ thống dùng trong ngữ cảnh nào và ai chịu thiệt khi nó sai'],
            ['MEASURE', 'Dùng chỉ số nào để đo, đo lại bao lâu một lần và ai kiểm chứng'],
            ['MANAGE', 'Ưu tiên xử lý rủi ro ra sao và khi nào phải dừng hệ thống'],
          ],
          why: 'Bốn chức năng tương ứng bốn loại công việc khác nhau và thường do bốn nhóm người khác nhau làm. Sai lầm phổ biến là nhảy thẳng vào MEASURE vì đó là phần kỹ thuật quen thuộc, rồi tạo ra hàng chục chỉ số mà không ai có thẩm quyền hành động dựa trên chúng — đúng vấn đề mà GOVERN sinh ra để giải quyết.',
        },
        {
          id: 't10l5-q2',
          kind: 'mcq',
          tags: ['eu-ai-act'],
          q: 'Theo Điều 15 của EU AI Act, hệ thống AI rủi ro cao phải có biện pháp chống lại nhóm nguy cơ nào được nêu đích danh?',
          options: [
            'Chỉ các lỗ hổng phần mềm truyền thống theo OWASP Top 10',
            'Đầu độc dữ liệu, đầu độc mô hình, mẫu đối kháng và tấn công vào tính bí mật',
            'Chỉ rủi ro về quyền riêng tư theo GDPR',
            'Không có yêu cầu nào về an toàn thông tin, đó là phạm vi của NIS2',
          ],
          answer: 1,
          why: 'Điều 15 yêu cầu hệ thống rủi ro cao đạt mức độ chính xác, độ bền vững và an toàn thông tin phù hợp, và nêu rõ các nguy cơ đặc thù của ML gồm đầu độc dữ liệu huấn luyện, đầu độc mô hình, đầu vào đối kháng và tấn công vào tính bí mật của mô hình. Điều này có hệ quả rất thực tế: kiểm thử đối kháng chuyển từ "việc nên làm" thành **bằng chứng tuân thủ phải xuất trình được**, và kết quả kiểm thử đó thuộc về tài liệu kỹ thuật của hệ thống.',
          distractorWhy: [
            'OWASP Top 10 truyền thống không bao phủ các nguy cơ đặc thù của mô hình học máy.',
            '',
            'GDPR nói về dữ liệu cá nhân; Điều 15 nói về độ bền vững kỹ thuật của hệ thống AI.',
            'NIS2 có phạm vi riêng nhưng không thay thế nghĩa vụ tại Điều 15 của AI Act.',
          ],
        },
        {
          id: 't10l5-q3',
          kind: 'multi',
          tags: ['model-card', 'quan-tri'],
          q: 'Nội dung nào BẮT BUỘC có trong model card của một mô hình phát hiện dùng trong sản xuất? (Chọn tất cả)',
          options: [
            'Các mục đích sử dụng rõ ràng KHÔNG dành cho mô hình này',
            'Mã nguồn đầy đủ của thuật toán huấn luyện',
            'Chỉ số tại điểm hoạt động thật đang dùng, gồm cả số cảnh báo mỗi ngày',
            'Đánh giá theo lát cắt và nêu rõ lát cắt nào mô hình hoạt động kém',
          ],
          answers: [0, 2, 3],
          why: 'Model card là tài liệu **về hành vi và giới hạn**, không phải kho mã nguồn. Ba mục được chọn đều trả lời câu hỏi mà người ngoài đội cần: dùng nó vào việc gì thì sai, ở ngưỡng hiện tại thì nó gây ra bao nhiêu việc, và nó kém ở đâu. Mã nguồn nằm trong kho mã có phiên bản; đưa vào model card chỉ làm tài liệu dày lên và không ai đọc.',
        },
        {
          id: 't10l5-q4',
          kind: 'truefalse',
          tags: ['kiem-toan'],
          q: 'Lưu log quyết định vào cùng cơ sở dữ liệu vận hành mà đội kỹ thuật có quyền ghi là đủ cho mục đích kiểm toán.',
          answer: false,
          why: 'Bằng chứng kiểm toán cần tính **không thể sửa đổi** và **tách quyền**. Nếu chính đội vận hành hệ thống có thể sửa hoặc xoá bản ghi, kiểm toán viên không có cơ sở để tin nội dung của nó, và trong tranh chấp pháp lý thì giá trị chứng minh gần bằng không. Giải pháp thực tế: ghi vào kho chỉ-thêm hoặc lưu trữ có khoá theo đối tượng, quyền ghi tách khỏi quyền vận hành, và có chính sách lưu trữ ghi rõ thời hạn.',
        },
        {
          id: 't10l5-q5',
          kind: 'order',
          tags: ['quan-tri'],
          q: 'Sắp xếp trình tự hợp lý khi đưa một hệ thống ML bảo mật vào chương trình quản trị AI.',
          items: [
            'Lập bản kiểm kê: hệ thống này là gì, dùng ở đâu, tác động tới ai',
            'Phân loại mức rủi ro theo khung pháp lý áp dụng và ghi lại lập luận',
            'Xác định chủ sở hữu có tên và quy trình phê duyệt thay đổi',
            'Viết model card và data sheet, gồm cả giới hạn và lát cắt kém',
            'Thiết lập lưu vết quyết định không sửa được và chính sách lưu trữ',
            'Lên lịch rà soát định kỳ và định nghĩa điều kiện khai tử mô hình',
          ],
          why: 'Kiểm kê đứng đầu vì không thể quản trị thứ mình chưa biết là mình đang có — và trong thực tế, bước này luôn phát hiện ra vài mô hình đang chạy mà không ai nhớ. Phân loại rủi ro đứng thứ hai vì nó quyết định toàn bộ khối lượng công việc phía sau. Chủ sở hữu có tên đứng trước tài liệu, vì tài liệu không có người chịu trách nhiệm cập nhật sẽ lỗi thời trong sáu tháng.',
        },
      ],
      terms: ['nist-ai-rmf', 'eu-ai-act', 'model-card', 'atlas'],
      further: [
        {
          title: 'NIST AI Risk Management Framework 1.0',
          note: 'Bản gốc kèm Playbook có gợi ý hành động cho từng mục. Đọc phần GOVERN trước, đó là phần hay bị bỏ qua nhất.',
          url: 'https://www.nist.gov/itl/ai-risk-management-framework',
        },
        {
          title: 'Quy định (EU) 2024/1689 — toàn văn EU AI Act',
          note: 'Đọc Điều 6 và Phụ lục III để tự phân loại hệ thống, rồi Điều 15 cho yêu cầu về độ bền vững và an toàn thông tin.',
          url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
        },
        {
          title: 'Mitchell et al. — Model Cards for Model Reporting (FAT* 2019)',
          note: 'Bài gốc đề xuất model card, kèm mẫu điền. Ngắn, đọc một buổi tối là dùng được ngay.',
          url: 'https://arxiv.org/abs/1810.03993',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't10-l6',
      trackId: 'van-hanh',
      title: 'Dự án đầu-cuối và hồ sơ năng lực',
      subtitle:
        'Một dự án làm tử tế với kết quả trung thực đánh bại mười notebook có AUC 0,99 mà không ai kiểm chứng được.',
      minutes: 21,
      level: 'nang-cao',
      prereqs: ['t10-l3'],
      why: {
        short:
          'Thứ duy nhất chứng minh bạn làm được ML bảo mật là một dự án đầu-cuối trên dữ liệu công khai, có đánh giá theo thời gian và có phần nói thật về chỗ nó không hoạt động.',
        scenario:
          'Bạn nộp hồ sơ vào vị trí Security Data Scientist. Người phỏng vấn mở GitHub của bạn, thấy notebook "Malware Detection 99.8% Accuracy" dùng `train_test_split(random_state=42)` trên CIC-IDS2017. Trong 90 giây họ đã biết ba điều: bạn chia dữ liệu ngẫu nhiên trên dữ liệu có thời gian, bạn dùng accuracy trên tập cực mất cân bằng, và bạn chưa từng nhìn kỹ bộ dữ liệu mình dùng. Cuộc phỏng vấn kết thúc trước khi bắt đầu.',
        roles: ['Security Data Scientist', 'Detection Engineer', 'ML Engineer', 'Threat Hunter'],
        costOfNotKnowing:
          'Bạn dành ba tháng làm một dự án mà người trong nghề loại ngay từ dòng đầu tiên, vì nó mắc đúng những lỗi mà chương này đã cảnh báo. Tệ hơn, bạn tự tin vào một con số sai và mang sự tự tin đó vào công việc thật.',
      },
      objectives: [
        'Chọn được một trong năm đề tài dự án phù hợp với mục tiêu nghề nghiệp và dữ liệu công khai sẵn có',
        'Xác định chỉ số đánh giá đúng cho từng đề tài, thay vì mặc định dùng accuracy hoặc ROC-AUC',
        'Nhận diện cạm bẫy riêng của từng bộ dữ liệu công khai trước khi bắt đầu',
        'Viết README và phần trình bày kết quả trung thực, bao gồm cả kết quả âm tính',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Trong bộ CIC-IDS2017, toàn bộ lưu lượng tấn công phát ra từ một mạng cố định (dải 205.174.165.0/24) còn mạng nạn nhân là 192.168.10.0/24. Nếu bạn để nguyên cột IP nguồn và IP đích trong bộ đặc trưng rồi huấn luyện Random Forest, kết quả sẽ thế nào — và mô hình đã học được cái gì?',
          reveal:
            'Bạn sẽ đạt accuracy gần **100%** và một ma trận nhầm lẫn đẹp tới mức đáng ngờ. Mô hình đã học đúng một quy tắc: "nếu IP nguồn thuộc dải 205.174.165 thì là tấn công". Nó không học gì về tấn công cả. Đây là dạng rò rỉ dữ liệu tinh vi nhất trong các bộ dữ liệu mạng công khai, vì cột IP trông hoàn toàn hợp lý và không ai nghĩ nó là nhãn trá hình. Cùng họ với nó: cổng đích cố định của công cụ tấn công, dấu thời gian trùng khớp với lịch chạy kịch bản, và độ dài gói tin đặc trưng của công cụ sinh lưu lượng. **Quy tắc:** với mọi bộ dữ liệu mô phỏng, hãy hỏi trước tiên "cái gì trong dữ liệu này chỉ đúng vì cách người ta tạo ra nó?"',
        },
        {
          t: 'p',
          md: 'Năm đề tài dưới đây đều làm được với dữ liệu công khai, đều có giá trị chứng minh năng lực, và đều có cạm bẫy riêng đã được ghi rõ. Chọn **một** và làm cho tới, thay vì làm dở dang ba cái.',
        },
        {
          t: 'table',
          caption: 'Năm đề tài dự án — dữ liệu, mục tiêu, chỉ số và cạm bẫy chính',
          head: ['Đề tài', 'Dữ liệu công khai', 'Chỉ số đánh giá đúng', 'Cạm bẫy chính'],
          rows: [
            [
              '1. Phân loại tệp PE tĩnh',
              'EMBER 2018 (Elastic, 1 triệu mẫu, vector 2.381 chiều đã trích sẵn); nâng cao thì thêm SOREL-20M',
              'TPR tại FPR = 0,1% và 0,01%, đo trên tập kiểm tra theo thời gian',
              'EMBER đã chia theo mốc thời gian tháng 1/2018 — nếu bạn trộn lại và chia ngẫu nhiên là tự phá bộ dữ liệu tốt nhất mình có',
            ],
            [
              '2. Phát hiện tên miền DGA',
              'Danh sách DGA từ DGArchive hoặc nguồn công khai của Bambenek; tên miền lành từ Tranco top 1 triệu',
              'PR-AUC, và TPR tại FPR = 0,01% trên Tranco; báo cáo riêng theo từng HỌ DGA',
              'Thiên lệch nguồn lành: Tranko toàn tên miền ngắn dễ đọc, mô hình sẽ học độ dài chứ không học DGA. Bắt buộc giữ lại vài họ dùng từ điển (suppobox, matsnu) làm tập kiểm tra chưa từng thấy',
            ],
            [
              '3. Phát hiện URL lừa đảo',
              'PhishTank hoặc OpenPhish cho lớp độc; Tranco hoặc Common Crawl cho lớp lành',
              'Precision tại recall cố định, cộng số cảnh báo/ngày ước tính trên lưu lượng thật',
              'Hai lớp thu thập ở hai thời điểm khác nhau — mô hình học "tên miền nào còn sống" chứ không học phishing. Thêm rò rỉ qua tên thương hiệu trong URL',
            ],
            [
              '4. Bất thường đăng nhập và di chuyển ngang',
              'LANL Comprehensive Multi-Source Cyber-Security Events (Kent, 2015) hoặc CERT Insider Threat r4.2 của CMU-SEI',
              'Recall@k với k = số cảnh báo đội xử lý được mỗi ngày; thời gian phát hiện tính từ sự kiện đầu tiên',
              'CERT là dữ liệu tổng hợp, tín hiệu nội gián được cấy vào theo kịch bản nên dễ một cách phi thực tế. LANL đã ẩn danh nên mất phần lớn ngữ cảnh',
            ],
            [
              '5. Phát hiện beaconing C2 trên lưu lượng mạng',
              'CTU-13 của Stratosphere IPS (13 kịch bản botnet có nhãn) hoặc UNSW-NB15; hoặc tự sinh log Zeek trong lab',
              'Precision ở mức cảnh báo/ngày thực tế, đánh giá theo từng kịch bản chứ không gộp',
              'Đặc trưng thời gian (khoảng cách giữa các kết nối, jitter) rất mạnh nhưng cũng khớp với nhiều dịch vụ hợp lệ: cập nhật phần mềm, giám sát, đồng bộ. Không có allowlist thì báo động giả nổ tung',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Nếu bạn chỉ làm một dự án, hãy chọn đề tài 2',
          md: 'Phát hiện DGA có tỉ lệ giá trị trên công sức tốt nhất cho hồ sơ: dữ liệu công khai và hợp pháp hoàn toàn, đặc trưng đủ phong phú để thể hiện tư duy (ký tự, n-gram, từ điển, hành vi truy vấn), có mất cân bằng lớp thật, có yêu cầu tổng quát hoá sang họ chưa thấy, và kết quả trình bày được trong ba phút. Quan trọng nhất: nó buộc bạn phải đối mặt với thiên lệch nguồn dữ liệu lành — bài học chuyển được sang mọi bài toán bảo mật khác.',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'An toàn và pháp lý khi làm dự án mã độc',
          md: 'Nếu đề tài của bạn động tới mẫu mã độc thật (MalwareBazaar, VirusShare, MalShare):\n\n- **Không bao giờ chạy mẫu trên máy cá nhân hay máy công ty.** Dùng máy ảo cách ly, không chia sẻ thư mục, không card mạng bắc cầu, chụp ảnh trạng thái trước khi chạy.\n- **Không đẩy mẫu lên GitHub.** Kể cả trong file nén có mật khẩu. Đẩy hash và mã trích xuất đặc trưng, không đẩy mẫu.\n- **Kiểm tra quy định nơi bạn ở** về việc sở hữu và phân phối mã độc. Ở nhiều nước, tàng trữ để nghiên cứu là hợp pháp còn phân phối thì không.\n- **Ưu tiên bộ dữ liệu đã trích đặc trưng sẵn** như EMBER: bạn có toàn bộ giá trị học thuật mà không cần chạm vào tệp thực thi nào.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't10l6-cp1',
              kind: 'mcq',
              tags: ['danh-gia', 'du-an'],
              q: 'Bạn làm đề tài DGA. Tập kiểm tra có 1.000 tên miền DGA và 1.000.000 tên miền Tranco. Mô hình đạt ROC-AUC 0,997. Bước tiếp theo hợp lý nhất là gì?',
              options: [
                'Ghi con số đó lên đầu README và chuyển sang dự án khác',
                'Báo cáo TPR tại FPR = 0,01% và quy đổi ra số tên miền lành bị gắn cờ mỗi ngày trên một mạng thật',
                'Tăng độ sâu cây để đẩy AUC lên 0,999',
                'Đổi sang mạng nơ-ron sâu để kết quả thuyết phục hơn',
              ],
              answer: 1,
              why: 'ROC-AUC 0,997 nghe đẹp nhưng với tỉ lệ 1:1000 nó gần như vô nghĩa: FPR 0,3% trên một triệu tên miền lành vẫn là **3.000 báo động giả**. Điều người phỏng vấn muốn thấy là bạn tự động quy đổi chỉ số sang **hệ quả vận hành**: ở FPR = 0,01%, bạn bắt được bao nhiêu phần trăm DGA, và một mạng doanh nghiệp truy vấn 2 triệu tên miền duy nhất mỗi ngày sẽ nhận bao nhiêu cảnh báo. Đây chính là khác biệt giữa người làm ML và người làm ML bảo mật.',
              distractorWhy: [
                'Con số AUC đơn lẻ trên dữ liệu mất cân bằng là dấu hiệu người viết chưa hiểu bài toán.',
                '',
                'Nhích AUC ở vùng đã bão hoà không đổi được gì về mặt vận hành.',
                'Đổi mô hình không giải quyết vấn đề báo cáo sai chỉ số; ngoài ra trên dữ liệu bảng thì cây tăng cường thường vẫn thắng.',
              ],
            },
            {
              id: 't10l6-cp2',
              kind: 'truefalse',
              tags: ['du-an', 'ro-ri-du-lieu'],
              q: 'Với dự án phishing, lấy URL độc từ PhishTank tháng này và URL lành từ Tranco tải cùng tháng là cách chia dữ liệu hợp lý.',
              answer: false,
              why: 'Hai lớp đến từ hai quy trình thu thập khác nhau, nên mọi khác biệt hệ thống giữa chúng đều trở thành đặc trưng "hữu ích" giả tạo: URL PhishTank thường dài hơn, hay có tham số truy vấn, hay dùng tên miền mới, và nhiều URL đã chết trong khi Tranco toàn tên miền sống khoẻ. Mô hình có thể đạt điểm rất cao chỉ nhờ học các dấu vết thu thập này. Cách giảm thiểu: lấy URL lành từ **cùng nguồn lưu lượng** nếu có thể, cân bằng theo tuổi tên miền và theo độ sâu đường dẫn, và luôn kiểm tra bằng cách bỏ hẳn các đặc trưng nghi ngờ xem điểm tụt bao nhiêu.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Hai thứ phải có trong mọi dự án: chia theo thời gian và chỉ số tại điểm hoạt động',
          code: `import numpy as np
from sklearn.metrics import roc_curve

def tpr_tai_fpr(y_that, diem, fpr_muc_tieu=1e-3):
    """TPR tại một FPR cố định — chỉ số có nghĩa khi lớp dương cực hiếm."""
    fpr, tpr, nguong = roc_curve(y_that, diem)
    i = np.searchsorted(fpr, fpr_muc_tieu, side='right') - 1
    return tpr[max(i, 0)], nguong[max(i, 0)]

# Chia THEO THỜI GIAN. Không bao giờ train_test_split(shuffle=True) trên dữ liệu có mốc thời gian.
tr = df[df.first_seen < '2018-01-01']
te = df[df.first_seen >= '2018-01-01']

mo_hinh.fit(tr[COT], tr.label)
diem = mo_hinh.predict_proba(te[COT])[:, 1]

for muc_tieu in (1e-2, 1e-3, 1e-4):
    t, ng = tpr_tai_fpr(te.label.values, diem, muc_tieu)
    # Quy đổi sang hệ quả vận hành: bao nhiêu cảnh báo giả mỗi ngày trên N sự kiện
    canh_bao_gia_moi_ngay = muc_tieu * 2_000_000
    print('FPR={:.4%} -> TPR={:.3f} | nguong={:.4f} | ~{:.0f} bao dong gia/ngay'
          .format(muc_tieu, t, ng, canh_bao_gia_moi_ngay))`,
        },
        { t: 'h', text: 'README — mười phút quyết định số phận dự án', level: 2 },
        {
          t: 'steps',
          title: 'Cấu trúc README mà người trong nghề đọc hết',
          steps: [
            {
              title: '1. Một đoạn mở đầu trả lời ba câu',
              md: 'Bài toán là gì, dữ liệu nào, **kết quả tại điểm hoạt động nào**. Ví dụ: "Phát hiện tên miền DGA. Dữ liệu: 92 họ DGA từ DGArchive cộng Tranco top 1M. Kết quả: TPR 0,84 tại FPR 0,01%, tương đương khoảng 200 báo động giả mỗi ngày trên mạng 2 triệu truy vấn duy nhất." Ba câu này lọc bạn ra khỏi 90% hồ sơ.',
            },
            {
              title: '2. Cách chia dữ liệu, nói ngay và nói rõ',
              md: 'Chia theo thời gian hay theo họ? Tập kiểm tra có họ nào chưa từng xuất hiện trong huấn luyện không? Nếu bạn viết "chia theo thời gian, và 12 họ DGA trong tập kiểm tra hoàn toàn không có trong tập huấn luyện", người đọc biết ngay bạn hiểu vấn đề tổng quát hoá.',
            },
            {
              title: '3. Đường cơ sở trước, mô hình sau',
              md: 'Luôn có ít nhất một đường cơ sở tầm thường: luật entropy đơn thuần, hồi quy logistic trên 5 đặc trưng, hoặc "luôn đoán lành tính". Nếu LightGBM chỉ hơn luật entropy 2 điểm phần trăm, đó là **kết quả quan trọng** cần nói, không phải điều cần giấu.',
            },
            {
              title: '4. Chỗ mô hình hoạt động kém — mục bắt buộc',
              md: 'Bảng chất lượng theo lát cắt: theo họ DGA, theo độ dài tên miền, theo TLD. Kèm 5–10 ví dụ sai cụ thể và lời giải thích ngắn vì sao. Mục này là thứ phân biệt người đã suy nghĩ với người chỉ chạy `fit()`.',
            },
            {
              title: '5. Tái lập được trong một lệnh',
              md: 'Một script tải dữ liệu, một lệnh chạy toàn bộ, ghim phiên bản thư viện, ghim seed. Nếu người đọc không chạy lại được trong 15 phút, họ sẽ không chạy — và một dự án không ai chạy lại chỉ là một tuyên bố.',
            },
            {
              title: '6. Những gì bạn đã thử mà không hiệu quả',
              md: 'Ba tới năm dòng: "đã thử embedding ký tự bằng LSTM, kém hơn n-gram TF-IDF 4 điểm PR-AUC với chi phí huấn luyện gấp 20 lần". Đây là mục gây ấn tượng mạnh nhất trong phỏng vấn, vì nó chứng minh bạn thực sự đã làm chứ không chép notebook.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bốn dấu hiệu khiến người phỏng vấn đóng tab ngay lập tức',
          md: '**1. Accuracy trên dữ liệu mất cân bằng.** "99,8% accuracy" trên tập có 0,2% mẫu độc nghĩa là mô hình đoán "lành" cho mọi thứ.\n\n**2. `train_test_split(shuffle=True)` trên dữ liệu có thời gian.** Rò rỉ tương lai, mọi con số phía sau đều vô nghĩa.\n\n**3. Không có đường cơ sở.** Không có gì để so thì con số của bạn không nói lên điều gì.\n\n**4. Cột định danh trong bộ đặc trưng.** IP, hash tệp, session id, tên tệp. Nếu AUC của bạn trên 0,99 trong một bài toán bảo mật thật, giả định đầu tiên phải là rò rỉ, không phải tài năng.',
        },
        {
          t: 'h',
          text: 'Trình bày kết quả trung thực — kể cả khi nó không đẹp',
          level: 2,
        },
        {
          t: 'compare',
          title: 'Cùng một kết quả, hai cách kể',
          left: {
            title: '❌ Cách làm hại chính bạn',
            items: [
              '"Mô hình đạt độ chính xác 99,8%"',
              'Giấu việc đã thử 40 tổ hợp siêu tham số và báo cáo cái tốt nhất trên tập kiểm tra',
              'Không nhắc tới các họ DGA mà mô hình bỏ sót hoàn toàn',
              'Bỏ luôn đường cơ sở vì nó gần bằng mô hình xịn',
              'Kết luận: "sẵn sàng triển khai sản xuất"',
            ],
          },
          right: {
            title: '✅ Cách khiến người ta muốn tuyển bạn',
            items: [
              '"TPR 0,84 tại FPR 0,01%, tức khoảng 200 báo động giả/ngày trên 2 triệu truy vấn"',
              '"Chọn siêu tham số trên tập validation tách riêng theo thời gian; tập kiểm tra chỉ chạm một lần"',
              '"Bỏ sót gần hoàn toàn 3 họ dùng từ điển; đây là giới hạn của đặc trưng entropy, cần thêm đặc trưng hành vi truy vấn"',
              '"Luật entropy đơn thuần đạt TPR 0,71 — mô hình chỉ hơn 13 điểm, cần cân nhắc chi phí vận hành"',
              'Kết luận: "đủ để chạy chế độ bóng; cần dữ liệu nội bộ và ngân sách khám phá trước khi bàn triển khai"',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Kết quả âm tính là kết quả',
          md: 'Một dự án kết luận "deep learning không hơn LightGBM trên bài toán này, và đây là bằng chứng" **có giá trị hơn** một dự án tuyên bố thắng lợi mà không ai kiểm chứng được. Trong công việc thật, phần lớn thời gian của bạn sẽ là chứng minh rằng một ý tưởng hấp dẫn không hiệu quả — và người phỏng vấn giỏi biết điều đó. Họ tìm người trung thực với dữ liệu, không tìm người có con số to.',
        },
        {
          t: 'terms',
          ids: ['ember', 'dga', 'pe', 'pr-auc', 'ro-ri-du-lieu'],
        },
      ],
      keyTakeaways: [
        'Chọn một đề tài và làm tới cùng: PE tĩnh với EMBER, DGA, phishing URL, bất thường đăng nhập, hoặc beaconing C2.',
        'Mọi bộ dữ liệu mô phỏng đều có dấu vết cách tạo ra nó — hỏi trước "cái gì ở đây chỉ đúng vì cách người ta sinh dữ liệu".',
        'Chỉ số đúng là TPR tại FPR cố định hoặc precision tại recall cố định, luôn quy đổi ra số cảnh báo mỗi ngày.',
        'Chia theo thời gian, và với DGA hay mã độc thì giữ riêng vài họ chưa từng thấy trong tập kiểm tra.',
        'README phải có đường cơ sở, mục "mô hình kém ở đâu", và mục "những gì đã thử mà không hiệu quả".',
        'Trình bày trung thực đánh bại con số đẹp: AUC trên 0,99 trong bài toán bảo mật thật gần như luôn là dấu hiệu rò rỉ.',
      ],
      cards: [
        {
          id: 't10l6-c1',
          front: 'Vì sao không được để cột IP nguồn trong bộ đặc trưng khi dùng bộ dữ liệu IDS mô phỏng?',
          back: 'Vì lưu lượng tấn công thường phát ra từ một dải IP cố định, nên mô hình chỉ học thuộc dải đó thay vì học hành vi tấn công.',
          tags: ['ro-ri-du-lieu', 'du-an'],
        },
        {
          id: 't10l6-c2',
          front: 'Với dự án DGA, vì sao phải giữ riêng vài họ dùng từ điển làm tập kiểm tra?',
          back: 'Để đo khả năng tổng quát hoá sang họ chưa từng thấy. Họ dùng từ điển có entropy thấp nên chúng phá vỡ đúng giả định của đặc trưng entropy.',
          hint: 'suppobox, matsnu.',
          tags: ['dga', 'danh-gia'],
        },
        {
          id: 't10l6-c3',
          front: 'Vì sao ROC-AUC 0,997 có thể vẫn là kết quả tồi trong bài toán DGA?',
          back: 'Vì lớp lành lớn gấp hàng nghìn lần: FPR còn lại vẫn quy ra hàng nghìn báo động giả mỗi ngày. Phải báo cáo TPR tại FPR rất nhỏ và quy đổi ra cảnh báo/ngày.',
          tags: ['danh-gia', 'pr-auc'],
        },
        {
          id: 't10l6-c4',
          front: 'Mục nào trong README chứng minh rõ nhất rằng bạn đã thực sự làm dự án?',
          back: 'Mục "những gì đã thử mà không hiệu quả", kèm con số so sánh và chi phí. Không ai chép được mục này từ notebook người khác.',
          tags: ['du-an'],
        },
        {
          id: 't10l6-c5',
          front: 'Nguyên tắc an toàn số một khi làm dự án với mẫu mã độc thật là gì?',
          back: 'Chỉ chạy trong máy ảo cách ly hoàn toàn, không đẩy mẫu lên kho mã công khai. Tốt hơn nữa: dùng bộ đã trích đặc trưng sẵn như EMBER.',
          tags: ['an-toan', 'du-an'],
        },
      ],
      quiz: [
        {
          id: 't10l6-q1',
          kind: 'mcq',
          tags: ['danh-gia', 'du-an'],
          q: 'Bạn dùng EMBER 2018 để phân loại PE. Cách đánh giá đúng nhất là gì?',
          options: [
            'Gộp toàn bộ 1 triệu mẫu rồi chia ngẫu nhiên 80/20 để có nhiều dữ liệu huấn luyện hơn',
            'Giữ nguyên cách chia theo mốc thời gian sẵn có của bộ dữ liệu và báo cáo TPR tại FPR = 0,1%',
            'Dùng cross-validation 10 fold ngẫu nhiên và báo cáo accuracy trung bình',
            'Chỉ báo cáo ROC-AUC vì đó là chỉ số chuẩn của ngành',
          ],
          answer: 1,
          why: 'Giá trị lớn nhất của EMBER 2018 nằm ở chỗ nó **đã** chia theo thời gian: huấn luyện trên mẫu xuất hiện trước 2018, kiểm tra trên mẫu từ 2018 trở đi. Đó chính là mô phỏng điều kiện thật, nơi bạn luôn phải phát hiện thứ chưa từng thấy. Trộn lại và chia ngẫu nhiên sẽ đẩy điểm lên vài phần trăm và **phá huỷ ý nghĩa** của toàn bộ đánh giá. Về chỉ số, ngành chống mã độc nói bằng TPR tại FPR rất thấp vì mỗi báo động giả trên máy trạm là một cuộc gọi helpdesk.',
          distractorWhy: [
            'Chia ngẫu nhiên trên dữ liệu có thời gian là rò rỉ tương lai, đúng lỗi mà bộ dữ liệu này được thiết kế để tránh.',
            '',
            'Cross-validation ngẫu nhiên mắc cùng lỗi, và accuracy vô nghĩa ở đây.',
            'ROC-AUC gộp mọi điểm hoạt động, kể cả vùng FPR 20% không ai dùng.',
          ],
        },
        {
          id: 't10l6-q2',
          kind: 'multi',
          tags: ['du-an'],
          q: 'Mục nào nên có trong README của một dự án ML bảo mật nghiêm túc? (Chọn tất cả)',
          options: [
            'Đường cơ sở đơn giản và kết quả của nó',
            'Bảng chất lượng theo lát cắt kèm chỗ mô hình hoạt động kém',
            'Ảnh chụp màn hình loss giảm dần qua các epoch',
            'Những hướng đã thử mà không hiệu quả, kèm số liệu so sánh',
          ],
          answers: [0, 1, 3],
          why: 'Ba mục được chọn đều trả lời câu hỏi "so với cái gì" và "sai ở đâu" — hai câu hỏi mà người trong nghề luôn hỏi. Biểu đồ loss thì đẹp nhưng không nói gì về giá trị bảo mật: một đường loss mượt mà hoàn toàn tương thích với một mô hình đang học cột IP bị rò rỉ. Hãy dành chỗ đó cho bảng lát cắt.',
        },
        {
          id: 't10l6-q3',
          kind: 'order',
          tags: ['du-an', 'quy-trinh'],
          q: 'Sắp xếp trình tự làm một dự án ML bảo mật đầu-cuối.',
          items: [
            'Đọc kỹ nguồn gốc bộ dữ liệu và liệt kê các dấu vết do cách tạo dữ liệu sinh ra',
            'Định nghĩa điểm hoạt động mục tiêu và quy đổi ra số cảnh báo mỗi ngày',
            'Chia dữ liệu theo thời gian và theo họ, tách riêng tập validation',
            'Dựng đường cơ sở đơn giản và ghi lại kết quả của nó',
            'Xây đặc trưng và huấn luyện mô hình, chọn siêu tham số trên validation',
            'Chạm tập kiểm tra một lần duy nhất, phân tích lỗi theo lát cắt và viết README',
          ],
          why: 'Hai bước đầu là thứ phân biệt dự án bảo mật với bài tập ML: hiểu dữ liệu đến từ đâu, và biết trước con số nào mới có nghĩa. Đường cơ sở phải có **trước** mô hình phức tạp, nếu không bạn sẽ tự thuyết phục mình rằng LightGBM cần thiết trong khi một luật đơn giản đã đủ. Và tập kiểm tra chỉ được chạm một lần — mỗi lần bạn nhìn nó rồi chỉnh mô hình, nó mất dần vai trò làm bằng chứng độc lập.',
        },
        {
          id: 't10l6-q4',
          kind: 'truefalse',
          tags: ['du-an', 'trung-thuc'],
          q: 'Một dự án kết luận rằng mô hình sâu không hơn LightGBM là dự án thất bại, không nên đưa vào hồ sơ.',
          answer: false,
          why: 'Đó là một **kết quả**, và trong bối cảnh dữ liệu bảng thì nó còn phù hợp với bằng chứng đã công bố — Grinsztajn, Oyallon và Varoquaux (NeurIPS 2022) cho thấy mô hình dựa trên cây vẫn vượt học sâu trên dữ liệu bảng điển hình. Một dự án thiết kế thí nghiệm sạch, có đường cơ sở, có phân tích lỗi và dám kết luận âm tính chứng minh nhiều năng lực hơn một dự án tuyên bố thắng lợi mơ hồ. Trong công việc thật, phần lớn giá trị bạn tạo ra là loại bỏ nhanh những hướng không hiệu quả.',
        },
        {
          id: 't10l6-q5',
          kind: 'input',
          tags: ['danh-gia'],
          q: 'Chỉ số nên dùng thay cho accuracy khi lớp dương chiếm dưới 1%, viết tắt là gì (dạng đường cong precision–recall)?',
          accept: ['pr-auc', 'pr auc', 'auprc', 'average precision', 'pr'],
          placeholder: 'Viết tắt…',
          hint: 'Diện tích dưới đường cong precision–recall.',
          why: 'PR-AUC (còn gọi là AUPRC, xấp xỉ bởi average precision) nhạy với lớp dương hiếm vì cả hai trục đều liên quan tới lớp dương, trong khi ROC-AUC dùng FPR có mẫu số là toàn bộ lớp âm khổng lồ nên che mất vấn đề. Tuy vậy trong báo cáo cho người vận hành, con số thuyết phục nhất vẫn là cặp "TPR tại FPR mục tiêu" cộng "số cảnh báo mỗi ngày" — vì đó là ngôn ngữ mà trưởng ca SOC ra quyết định.',
        },
      ],
      terms: ['ember', 'dga', 'pe', 'pr-auc', 'ro-ri-du-lieu'],
      further: [
        {
          title: 'Anderson & Roth — EMBER: An Open Dataset for Training Static PE Malware ML Models (2018)',
          note: 'Bài giới thiệu bộ dữ liệu cùng mã trích đặc trưng. Đọc phần mô tả cách chia theo thời gian trước khi động vào dữ liệu.',
          url: 'https://github.com/elastic/ember',
        },
        {
          title: 'Pendlebury et al. — TESSERACT: Eliminating Experimental Bias in Malware Classification across Space and Time (USENIX Security 2019)',
          note: 'Chỉ ra ba loại thiên lệch làm phồng kết quả trong nghiên cứu mã độc và đề xuất cách đánh giá đúng theo thời gian. Đọc trước khi công bố bất kỳ con số nào.',
          url: 'https://www.usenix.org/conference/usenixsecurity19/presentation/pendlebury',
        },
        {
          title: 'Tranco — A Research-Oriented Top Sites Ranking Hardened Against Manipulation',
          note: 'Danh sách tên miền phổ biến ổn định và chống thao túng, dùng làm lớp lành. Tài liệu nêu rõ hạn chế của nó — hãy đọc phần đó.',
          url: 'https://tranco-list.eu/',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't10-l7',
      trackId: 'van-hanh',
      title: 'Lộ trình nghề nghiệp và phỏng vấn',
      subtitle:
        'Các vai trò thật, phần chồng lấn giữa chúng, những câu hỏi bạn sẽ bị hỏi, và cách trả lời khiến người ta muốn làm việc cùng bạn.',
      minutes: 18,
      level: 'co-ban',
      prereqs: ['t10-l6'],
      why: {
        short:
          'Biết rõ các vai trò khác nhau ở điểm nào giúp bạn chọn đúng thứ để học tiếp, thay vì học dàn trải rồi không đủ sâu cho bất cứ vị trí nào.',
        scenario:
          'Bạn đang là SOC Analyst và muốn chuyển sang làm ML bảo mật. Có ba tin tuyển dụng trước mặt: Detection Engineer, Security Data Scientist và ML Engineer. Ba mô tả công việc dùng khoảng 60% từ khoá giống nhau nhưng ngày làm việc thật thì rất khác. Chọn sai nghĩa là sáu tháng học sai thứ.',
        roles: ['SOC Analyst', 'Detection Engineer', 'Security Data Scientist', 'ML Engineer', 'AI Security Engineer'],
        costOfNotKnowing:
          'Bạn học dàn trải sáu tháng và vẫn không đủ sâu để qua vòng kỹ thuật của bất kỳ vị trí nào, rồi kết luận sai rằng mình không có năng khiếu — trong khi vấn đề chỉ là chưa chọn đích.',
      },
      objectives: [
        'Mô tả được ngày làm việc điển hình và sản phẩm chính của năm vai trò liên quan tới ML bảo mật',
        'Chỉ ra phần chồng lấn và phần khác biệt cốt lõi giữa Detection Engineer và Security Data Scientist',
        'Trả lời được năm câu hỏi phỏng vấn phổ biến theo cấu trúc số liệu và đánh đổi',
        'Lập kế hoạch học tiếp 90 ngày dựa trên nguồn theo dõi đáng tin cậy',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Người phỏng vấn nói: "Mô hình của bạn đạt ROC-AUC 0,99 trên tập kiểm tra. Chúng tôi triển khai được chưa?" Câu trả lời đầu tiên của bạn nên là gì?',
          reveal:
            'Câu trả lời đúng là **một loạt câu hỏi ngược**, không phải một chữ "được". Cụ thể: Tỉ lệ nền là bao nhiêu, và PR-AUC ra sao? Tập kiểm tra chia theo thời gian hay ngẫu nhiên? Điểm hoạt động dự kiến ở đâu, và tại đó precision cùng số cảnh báo mỗi ngày là bao nhiêu? Đội xử lý được bao nhiêu cảnh báo? Có cột nào có thể rò rỉ không? Người phỏng vấn không kiểm tra kiến thức về AUC — họ kiểm tra xem bạn có phản xạ **chuyển từ chỉ số sang hệ quả vận hành** hay không. Ứng viên trả lời "được ạ" bị loại ở đây; ứng viên nói "0,99 trong bảo mật thường là dấu hiệu rò rỉ, cho tôi xem cách chia dữ liệu trước" thì thường được mời sang vòng sau ngay.',
        },
        { t: 'h', text: 'Bản đồ vai trò — ai làm gì trong một ngày', level: 2 },
        {
          t: 'table',
          caption: 'Năm vai trò gần với ML bảo mật, so theo sản phẩm và kỹ năng cốt lõi',
          head: ['Vai trò', 'Sản phẩm chính mỗi tuần', 'Kỹ năng cốt lõi', 'Nơi thường bắt đầu'],
          rows: [
            [
              'SOC Analyst (T1–T3)',
              'Cảnh báo đã phân loại, ticket điều tra, đề xuất chỉnh luật',
              'Hiểu hệ điều hành, mạng, log; tốc độ và kỷ luật quy trình',
              'Cửa vào phổ biến nhất của ngành, không yêu cầu ML',
            ],
            [
              'Detection Engineer',
              'Luật Sigma/YARA/Suricata đã kiểm thử, logic phát hiện, tài liệu hoá theo ATT&CK',
              'Hiểu sâu kỹ thuật tấn công, viết truy vấn giỏi, tư duy đánh đổi FP/FN',
              'Từ SOC Analyst T2/T3 chuyển lên',
            ],
            [
              'Security Data Scientist',
              'Bộ đặc trưng, thí nghiệm ngoại tuyến, báo cáo đánh giá, mô hình ứng viên',
              'Thống kê, thiết kế thí nghiệm, Python, và quan trọng nhất là hiểu miền bảo mật',
              'Từ Detection Engineer, hoặc từ data scientist ngành khác chuyển sang',
            ],
            [
              'ML Engineer (bảo mật)',
              'Dịch vụ suy luận, đường ống huấn luyện lại, bảng giám sát, feature store',
              'Kỹ nghệ phần mềm, hệ phân tán, MLOps, độ tin cậy',
              'Từ backend engineer hoặc data engineer chuyển sang',
            ],
            [
              'AI Security Engineer',
              'Kiểm thử đối kháng, guardrail cho ứng dụng LLM, đánh giá mô hình theo MITRE ATLAS',
              'Tư duy tấn công, hiểu kiến trúc LLM và RAG, đọc được bài báo mới',
              'Từ Red Teamer, AppSec, hoặc từ Security Data Scientist',
            ],
          ],
        },
        {
          t: 'compare',
          title: 'Detection Engineer và Security Data Scientist chồng lấn nhiều hơn bạn nghĩ',
          left: {
            title: '🎯 Phần chung (khoảng 60%)',
            items: [
              'Đều phải hiểu kỹ thuật tấn công thật, không chỉ hiểu thuật toán',
              'Đều sống với đánh đổi giữa báo động giả và bỏ sót',
              'Đều phải đo được số cảnh báo mỗi ngày trước khi bật thứ gì',
              'Đều làm việc trực tiếp với analyst và phải nghe được phản hồi',
              'Đều cần biết đọc log Zeek, EDR, Windows Event và viết truy vấn',
            ],
          },
          right: {
            title: '🔀 Phần khác biệt cốt lõi',
            items: [
              'Detection Engineer: logic tường minh, viết được ra thành luật, giải thích được từng dòng',
              'Security Data Scientist: logic học từ dữ liệu, đánh đổi khả năng giải thích lấy khả năng bao phủ',
              'Detection Engineer mạnh khi kỹ thuật tấn công có dấu hiệu rõ ràng và ổn định',
              'Security Data Scientist mạnh khi tín hiệu nằm ở tổ hợp nhiều yếu tố yếu',
              'Thực tế: hệ thống tốt cần cả hai, và người làm được cả hai rất được săn đón',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Lợi thế lớn nhất của người từ bảo mật chuyển sang ML',
          md: 'Thị trường có rất nhiều người biết PyTorch và rất ít người biết vì sao `svchost.exe` chạy từ `C:\\Users\\Public` là bất thường. Kiến thức miền là phần **khó dạy nhất** và cũng là phần quyết định chất lượng đặc trưng. Nếu bạn đang làm SOC hoặc điều tra, bạn đang giữ nửa đắt tiền của bài toán; nửa còn lại học được trong 6–12 tháng có kỷ luật. Chiều ngược lại — dạy một nhà khoa học dữ liệu hiểu hành vi tấn công thật — thường mất lâu hơn nhiều.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't10l7-cp1',
              kind: 'mcq',
              tags: ['nghe-nghiep'],
              q: 'Bạn thích viết mã, thích hệ thống chạy ổn định, ít hứng thú với thống kê nhưng rất muốn làm ML bảo mật. Vai trò nào phù hợp nhất?',
              options: [
                'Security Data Scientist',
                'ML Engineer trong đội bảo mật',
                'SOC Analyst T1',
                'GRC / Compliance',
              ],
              answer: 1,
              why: 'ML Engineer trong đội bảo mật dành phần lớn thời gian cho dịch vụ suy luận, đường ống huấn luyện lại, feature store và giám sát — tức là kỹ nghệ phần mềm áp dụng vào ML. Bạn vẫn cần hiểu đủ về đánh giá mô hình để không triển khai thứ vô nghĩa, nhưng công việc thiết kế thí nghiệm và thống kê thuộc về Security Data Scientist. Đây cũng là vai trò thiếu người nhất trong nhiều đội, vì phần lớn ứng viên ML muốn xây mô hình chứ không muốn vận hành chúng.',
              distractorWhy: [
                'Vai trò này sống bằng thiết kế thí nghiệm và thống kê — đúng phần bạn nói không hứng thú.',
                '',
                'T1 là cửa vào tốt cho người mới nhưng không tận dụng thế mạnh viết mã của bạn.',
                'GRC thiên về khung quản trị và tài liệu, rất ít viết mã.',
              ],
            },
            {
              id: 't10l7-cp2',
              kind: 'truefalse',
              tags: ['nghe-nghiep'],
              q: 'Để chuyển sang ML bảo mật, cần học xong toàn bộ deep learning trước khi bắt đầu làm dự án.',
              answer: false,
              why: 'Phần lớn hệ thống ML bảo mật đang chạy trong sản xuất dùng cây tăng cường trên dữ liệu bảng, cộng một ít xử lý chuỗi. Deep learning chỉ chiếm ưu thế ở một số nhánh cụ thể: phân tích byte tệp thực thi, mô hình hoá chuỗi lời gọi API, và mọi thứ liên quan tới LLM. Học theo thứ tự "toán vừa đủ → đánh giá → đặc trưng → cây tăng cường → một dự án đầu-cuối" cho bạn năng lực tuyển dụng được nhanh hơn nhiều so với học sáu tháng mạng nơ-ron trước khi chạm vào một dòng log.',
            },
          ],
        },
        { t: 'h', text: 'Năm câu hỏi phỏng vấn hay gặp — trả lời tốt và trả lời tệ', level: 2 },
        {
          t: 'steps',
          title: 'Học thuộc cấu trúc, không học thuộc câu chữ',
          steps: [
            {
              title: 'Câu 1 — "Làm sao bạn biết mô hình đang hỏng khi không có nhãn mới?"',
              md: '**Tệ:** "Tôi sẽ theo dõi accuracy." (Không có nhãn thì không có accuracy.)\n\n**Tốt:** "Ba tầng không cần nhãn: PSI trên phân phối điểm đầu ra, tỉ lệ đặc trưng thiếu hoặc quá hạn, và số cảnh báo mỗi giờ so với đường cơ sở 7 ngày. Tôi đặt ngưỡng gắn với hành động cụ thể, và khi có cảnh báo trôi thì việc đầu tiên là loại trừ nguyên nhân đường ống, vì phần lớn trường hợp là vậy. Nhãn muộn từ điều tra chỉ dùng để xác nhận."',
            },
            {
              title: 'Câu 2 — "Bạn có 5 phút, phải giảm 50% báo động giả. Làm gì?"',
              md: '**Tệ:** "Huấn luyện lại mô hình." (Năm phút không huấn luyện lại được gì.)\n\n**Tốt:** "Trước hết tôi nhóm cảnh báo 7 ngày qua theo thực thể và theo nguyên nhân. Trong hầu hết hệ thống, 60–80% báo động giả đến từ vài chục nguồn lặp lại: một máy quét lỗ hổng, một job sao lưu, một dịch vụ giám sát. Hành động trong 5 phút: gộp trùng theo thực thể và cửa sổ thời gian, thêm loại trừ có thời hạn cho các nguồn đã xác minh, và nếu cần thì nâng ngưỡng riêng cho nhóm tài sản ồn nhất. Huấn luyện lại là việc của tuần sau."',
            },
            {
              title: 'Câu 3 — "Vì sao không dùng deep learning cho log dạng bảng?"',
              md: '**Tệ:** "Vì dữ liệu ít." (Nhiều tổ chức có hàng tỉ dòng log.)\n\n**Tốt:** "Trên dữ liệu bảng điển hình, mô hình dựa trên cây thường vẫn vượt học sâu — Grinsztajn và cộng sự (NeurIPS 2022) đưa ra bằng chứng có hệ thống cho điều này. Thêm ba lý do vận hành: cây tăng cường không cần chuẩn hoá nên ít bước tiền xử lý dễ sai, suy luận nhanh và rẻ hơn nhiều, và TreeSHAP cho giải thích cục bộ chính xác trong thời gian đa thức. Tôi sẽ chọn học sâu khi đầu vào là chuỗi byte, chuỗi lời gọi API, hoặc văn bản."',
            },
            {
              title: 'Câu 4 — "Kể một lần mô hình hoặc luật của bạn sai."',
              md: '**Tệ:** "Chưa gặp trường hợp nào đáng kể." (Người phỏng vấn kết luận bạn chưa vận hành gì thật.)\n\n**Tốt:** Kể theo bốn nhịp — bối cảnh và con số, điều bạn phát hiện, hành động sửa, và **thay đổi quy trình** để nó không lặp lại. Ví dụ: "Mô hình chấm điểm đăng nhập của tôi bùng từ 30 lên 900 cảnh báo/ngày sau khi công ty đổi VPN. Nguyên nhân là đặc trưng ASN của IP nguồn đổi hoàn toàn. Tôi rollback trong 20 phút theo tiêu chí đã viết trước, sau đó thêm ASN vào danh sách đặc trưng giám sát PSI. Từ đó mọi thay đổi hạ tầng lớn đều có một mục kiểm tra tác động lên mô hình."',
            },
            {
              title: 'Câu 5 — "Chúng tôi nên bắt đầu ML bảo mật từ đâu?"',
              md: '**Tệ:** "Xây một mô hình phát hiện bất thường tổng quát cho toàn mạng." (Đây là con đường thất bại kinh điển.)\n\n**Tốt:** "Bắt đầu từ một bài toán hẹp có nhãn tương đối rõ và có người tiêu thụ kết quả — ví dụ xếp hạng lại hàng đợi cảnh báo sẵn có, hoặc gộp trùng cảnh báo. Nó tạo giá trị đo được trong vài tuần và xây được đường ống dữ liệu, feature store cùng vòng phản hồi mà mọi dự án sau đều dùng lại. Phát hiện bất thường không giám sát trên toàn mạng nghe hấp dẫn nhưng thường tạo ra thứ không ai điều tra được."',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Ba lỗi ứng viên hay mắc trong vòng kỹ thuật',
          md: '**1. Nói chỉ số mà không nói điểm hoạt động.** "Mô hình của em đạt F1 0,88" — trên tập nào, chia thế nào, ở ngưỡng nào, ra bao nhiêu cảnh báo mỗi ngày? Luôn tự trả lời bốn câu đó trước khi bị hỏi.\n\n**2. Không dám nói "tôi không biết".** Người phỏng vấn giỏi sẽ đào tới khi bạn hết biết — đó là mục đích. Câu trả lời tốt là "tôi không chắc, nhưng tôi sẽ kiểm tra bằng cách...". Đoán bừa với giọng tự tin là điểm trừ nặng nhất.\n\n**3. Chê công cụ cũ.** "Luật Sigma lỗi thời rồi, giờ phải dùng ML" là câu nói khiến mọi Detection Engineer trong phòng ngừng lắng nghe. Trong thực tế luật tường minh và mô hình bổ sung cho nhau, và phần lớn phát hiện có giá trị vẫn đến từ luật viết tốt.',
        },
        { t: 'h', text: 'Học tiếp: 90 ngày và nguồn đáng theo dõi', level: 2 },
        {
          t: 'checklist',
          title: 'Kế hoạch 90 ngày sau khi học xong khoá này',
          items: [
            'Tuần 1–2: chọn một đề tài trong bài t10-l6, tải dữ liệu, đọc kỹ nguồn gốc và liệt kê cạm bẫy',
            'Tuần 3–4: dựng đường cơ sở đơn giản và chia dữ liệu theo thời gian; ghi kết quả vào README từ ngày đầu',
            'Tuần 5–8: làm đặc trưng, huấn luyện, phân tích lỗi theo lát cắt; viết mục "đã thử mà không hiệu quả"',
            'Tuần 9–10: viết một bài giải thích dự án cho người không làm ML, dài khoảng 1.500 từ',
            'Tuần 11–12: đọc lại ba kỹ thuật ATT&CK liên quan nhất tới dự án và bổ sung phần ánh xạ vào README',
            'Song song: mỗi tuần đọc trọn vẹn một báo cáo mối đe doạ và tự hỏi "kỹ thuật này sinh ra tín hiệu gì trong log"',
            'Song song: ôn thẻ ghi nhớ mỗi ngày 10 phút — kiến thức không ôn sẽ mất trong 4–6 tuần',
          ],
        },
        {
          t: 'table',
          caption: 'Nguồn theo dõi đáng tin — chọn ít và đọc kỹ hơn là theo dõi nhiều',
          head: ['Loại nguồn', 'Cụ thể', 'Vì sao đáng đọc'],
          rows: [
            [
              'Khung tri thức nền',
              'MITRE ATT&CK, MITRE ATLAS, MITRE D3FEND',
              'Ngôn ngữ chung của ngành. ATLAS là phiên bản cho tấn công vào hệ thống AI',
            ],
            [
              'Hội nghị chuyên ngành',
              'CAMLIS, DEF CON AI Village, USENIX Security, ACM AISec, Black Hat',
              'CAMLIS và AISec tập trung đúng giao điểm ML với bảo mật, chất lượng cao và miễn phí phần lớn nội dung',
            ],
            [
              'Blog nhóm nghiên cứu',
              'Elastic Security Labs, Google Threat Intelligence (Mandiant), Microsoft MSTIC, Sekoia, Splunk Threat Research',
              'Có dữ liệu thật và chi tiết kỹ thuật, không phải nội dung tiếp thị',
            ],
            [
              'Tài liệu công cụ',
              'Zeek, Suricata, Sigma, YARA, scikit-learn, LightGBM',
              'Đọc tài liệu gốc thay vì bài blog tóm tắt — nhanh hơn và ít sai hơn',
            ],
            [
              'Chuẩn và quy định',
              'NIST AI RMF, EU AI Act, OWASP Top 10 for LLM Applications, ISO/IEC 42001',
              'Ngày càng quyết định thứ bạn được phép xây và phải chứng minh được gì',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Về chứng chỉ — nói thẳng',
          md: 'Không có chứng chỉ nào hiện nay chứng minh được năng lực ML bảo mật; thứ chứng minh là dự án và cách bạn nói về nó. Chứng chỉ vẫn có giá trị ở hai chỗ: qua bộ lọc hồ sơ tự động, và ép bạn học có hệ thống phần nền bảo mật. Nếu chọn, hãy ưu tiên nhóm thiên về kỹ năng thực hành trong lĩnh vực bạn nhắm tới — phòng thủ mạng, điều tra số, hoặc tấn công — thay vì các khoá "AI security" xuất hiện chỉ sau một đêm. Và đừng bao giờ để chứng chỉ thay thế cho một dự án có README tử tế.',
        },
        {
          t: 'terms',
          ids: ['attck', 'atlas', 'sigma', 'yara', 'gbdt'],
        },
      ],
      keyTakeaways: [
        'Năm vai trò gần nhau nhưng khác về sản phẩm hằng tuần: analyst, detection engineer, data scientist, ML engineer, AI security engineer.',
        'Detection Engineer và Security Data Scientist chồng lấn khoảng 60%; khác biệt cốt lõi là logic tường minh so với logic học từ dữ liệu.',
        'Người từ bảo mật chuyển sang ML giữ nửa khó dạy nhất của bài toán — kiến thức miền.',
        'Trong phỏng vấn, luôn chuyển chỉ số thành hệ quả vận hành: điểm hoạt động, precision, cảnh báo mỗi ngày.',
        'Câu trả lời tốt cho "kể một lần bạn sai" có bốn nhịp: bối cảnh có số, phát hiện, hành động, và thay đổi quy trình.',
        'Bắt đầu ML bảo mật từ bài toán hẹp có người tiêu thụ kết quả, không từ phát hiện bất thường toàn mạng.',
      ],
      cards: [
        {
          id: 't10l7-c1',
          front: 'Khác biệt cốt lõi giữa Detection Engineer và Security Data Scientist là gì?',
          back: 'Detection Engineer viết logic tường minh giải thích được từng dòng; Security Data Scientist để logic học từ dữ liệu, đổi khả năng giải thích lấy khả năng bao phủ tổ hợp tín hiệu yếu.',
          tags: ['nghe-nghiep'],
        },
        {
          id: 't10l7-c2',
          front: 'Khi được hỏi "mô hình AUC 0,99, triển khai được chưa?", phản xạ đúng là gì?',
          back: 'Hỏi ngược về tỉ lệ nền, cách chia dữ liệu, điểm hoạt động, precision tại đó và số cảnh báo mỗi ngày. AUC 0,99 trong bảo mật thường là dấu hiệu rò rỉ.',
          tags: ['phong-van', 'danh-gia'],
        },
        {
          id: 't10l7-c3',
          front: 'Trong 5 phút, cách giảm báo động giả hiệu quả nhất là gì?',
          back: 'Nhóm cảnh báo theo thực thể và nguyên nhân, gộp trùng, thêm loại trừ có thời hạn cho vài chục nguồn lặp lại. Huấn luyện lại là việc của tuần sau.',
          hint: 'Vài chục nguồn thường gây phần lớn tiếng ồn.',
          tags: ['phong-van', 'alert-fatigue'],
        },
        {
          id: 't10l7-c4',
          front: 'Vì sao cây tăng cường vẫn thống trị trên log dạng bảng?',
          back: 'Chúng thường vượt học sâu trên dữ liệu bảng điển hình, không cần chuẩn hoá, suy luận rẻ, và có TreeSHAP cho giải thích cục bộ chính xác.',
          tags: ['gbdt', 'phong-van'],
        },
        {
          id: 't10l7-c5',
          front: 'Lời khuyên nào đúng nhất cho tổ chức muốn bắt đầu ML bảo mật?',
          back: 'Bắt đầu từ bài toán hẹp có nhãn tương đối rõ và có người tiêu thụ kết quả, ví dụ xếp hạng lại hàng đợi cảnh báo — không phải phát hiện bất thường toàn mạng.',
          tags: ['nghe-nghiep', 'san-xuat'],
        },
      ],
      quiz: [
        {
          id: 't10l7-q1',
          kind: 'match',
          tags: ['nghe-nghiep'],
          q: 'Ghép mỗi vai trò với sản phẩm chính mà họ tạo ra hằng tuần.',
          pairs: [
            ['Detection Engineer', 'Luật Sigma hoặc YARA đã kiểm thử và ánh xạ theo ATT&CK'],
            ['Security Data Scientist', 'Bộ đặc trưng, thí nghiệm ngoại tuyến và báo cáo đánh giá'],
            ['ML Engineer', 'Dịch vụ suy luận, đường ống huấn luyện lại và bảng giám sát'],
            ['GRC / Compliance', 'Model card, hồ sơ đánh giá rủi ro và bằng chứng kiểm toán'],
          ],
          why: 'Cách nhanh nhất để hiểu một vai trò không phải đọc mô tả công việc mà là hỏi "cuối tuần này bạn giao ra thứ gì". Bốn sản phẩm trên đòi hỏi bốn bộ kỹ năng khác nhau dù cả bốn người cùng ngồi trong một đội và cùng nói về ATT&CK. Khi chọn hướng học tiếp, hãy chọn theo sản phẩm bạn muốn tạo ra hằng tuần.',
        },
        {
          id: 't10l7-q2',
          kind: 'mcq',
          tags: ['phong-van'],
          q: 'Người phỏng vấn hỏi "kể một lần mô hình của bạn sai". Cấu trúc trả lời tốt nhất là gì?',
          options: [
            'Nói rằng bạn chưa gặp trường hợp nào đáng kể vì đã kiểm thử kỹ',
            'Bối cảnh có số liệu, điều bạn phát hiện, hành động sửa, và thay đổi quy trình để không lặp lại',
            'Đổ lỗi cho chất lượng dữ liệu đầu vào của đội khác',
            'Mô tả chi tiết kiến trúc mô hình để chứng minh năng lực kỹ thuật',
          ],
          answer: 1,
          why: 'Bốn nhịp này cho người phỏng vấn thấy đúng thứ họ cần: bạn đã vận hành thật (có số), bạn phát hiện được vấn đề (có công cụ giám sát), bạn xử lý được (có quy trình), và bạn học được (thay đổi hệ thống chứ không chỉ sửa một lần). Nhịp thứ tư là nhịp phân biệt ứng viên trung cấp với ứng viên cao cấp, và cũng là nhịp hay bị bỏ quên nhất.',
          distractorWhy: [
            'Câu này khiến người phỏng vấn kết luận bạn chưa từng vận hành hệ thống thật.',
            '',
            'Đổ lỗi cho đội khác là tín hiệu tiêu cực mạnh, kể cả khi đúng về mặt kỹ thuật.',
            'Kiến trúc không trả lời câu hỏi được hỏi, và né tránh câu hỏi cũng là một câu trả lời.',
          ],
        },
        {
          id: 't10l7-q3',
          kind: 'multi',
          tags: ['nghe-nghiep', 'hoc-tap'],
          q: 'Nguồn nào đáng theo dõi thường xuyên cho người làm ML bảo mật? (Chọn tất cả)',
          options: [
            'MITRE ATT&CK và MITRE ATLAS',
            'Hội nghị CAMLIS và DEF CON AI Village',
            'Bài đăng mạng xã hội tổng hợp "10 công cụ AI hot nhất tuần"',
            'Blog nghiên cứu của Elastic Security Labs, Mandiant, Microsoft MSTIC',
          ],
          answers: [0, 1, 3],
          why: 'Ba nguồn được chọn có điểm chung: chúng công bố **bằng chứng và chi tiết kỹ thuật kiểm chứng được**. ATT&CK và ATLAS cho bạn ngôn ngữ chung; hội nghị chuyên ngành cho bạn công trình có phản biện; blog nhóm nghiên cứu cho bạn dữ liệu từ sự cố thật. Danh sách công cụ theo tuần thì thay đổi liên tục và hầu như không tích luỹ thành năng lực — thời gian đọc chúng nên dành cho việc đọc trọn một báo cáo mối đe doạ.',
        },
        {
          id: 't10l7-q4',
          kind: 'truefalse',
          tags: ['nghe-nghiep'],
          q: 'Với người đang làm SOC muốn chuyển sang ML bảo mật, kiến thức bảo mật sẵn có là lợi thế lớn hơn là điểm yếu về toán.',
          answer: true,
          why: 'Kiến thức miền là phần khó dạy nhất và quyết định trực tiếp chất lượng đặc trưng — mà đặc trưng thì quyết định trần của mọi mô hình. Thị trường thừa người biết framework và thiếu người biết hành vi tấn công thật. Phần toán cần cho công việc thực tế hẹp hơn nhiều so với tưởng tượng: xác suất có điều kiện, các chỉ số đánh giá, và trực giác về đánh đổi thiên lệch–phương sai đã đủ cho phần lớn công việc. Điều này không có nghĩa là bỏ qua toán, mà là bạn nên đi từ thế mạnh sẵn có thay vì học lại từ đầu theo lộ trình của người khác.',
        },
        {
          id: 't10l7-q5',
          kind: 'order',
          tags: ['hoc-tap', 'nghe-nghiep'],
          q: 'Sắp xếp lộ trình hợp lý cho người từ SOC chuyển sang làm ML bảo mật.',
          items: [
            'Nắm chắc chỉ số đánh giá và nghịch lý tỉ lệ nền để đọc được mọi báo cáo mô hình',
            'Thành thạo việc biến log thành đặc trưng, gồm cả bẫy rò rỉ dữ liệu',
            'Làm chủ một họ mô hình dữ liệu bảng, ưu tiên cây tăng cường',
            'Hoàn thành một dự án đầu-cuối có chia theo thời gian và phân tích lỗi',
            'Bổ sung phần vận hành: giám sát trôi, chế độ bóng, tiêu chí rollback',
            'Mở rộng sang lĩnh vực hẹp phù hợp mục tiêu: LLM, đối kháng, hoặc quản trị AI',
          ],
          why: 'Thứ tự này tối đa hoá giá trị mỗi tháng bỏ ra. Chỉ số đứng đầu vì nó cho bạn khả năng **đánh giá** ngay lập tức mọi thứ người khác trình bày — kỹ năng dùng được từ tuần đầu. Đặc trưng đứng trước mô hình vì nó quyết định trần chất lượng. Dự án đầu-cuối đứng trước phần vận hành vì bạn cần một hệ thống của riêng mình để phần vận hành có chỗ bám. Lĩnh vực hẹp để cuối cùng, khi bạn đã đủ nền để đọc bài báo mới mà không lạc.',
        },
      ],
      terms: ['attck', 'atlas', 'sigma', 'yara', 'gbdt'],
      further: [
        {
          title: 'MITRE ATT&CK và MITRE ATLAS',
          note: 'ATT&CK cho kỹ thuật tấn công truyền thống, ATLAS cho tấn công vào hệ thống AI. Dùng làm khung ánh xạ cho mọi dự án phát hiện.',
          url: 'https://attack.mitre.org/',
        },
        {
          title: 'CAMLIS — Conference on Applied Machine Learning for Information Security',
          note: 'Hội nghị đúng giao điểm ML và bảo mật, phần lớn bài giảng công khai. Xem lại vài năm gần nhất để biết ngành đang thực sự làm gì.',
          url: 'https://www.camlis.org/',
        },
        {
          title: 'Grinsztajn, Oyallon, Varoquaux — Why do tree-based models still outperform deep learning on typical tabular data? (NeurIPS 2022)',
          note: 'Bằng chứng có hệ thống cho lập luận bạn sẽ cần trong phỏng vấn khi bị hỏi vì sao không dùng deep learning cho log dạng bảng.',
          url: 'https://arxiv.org/abs/2207.08815',
        },
      ],
    },
  ],
};
