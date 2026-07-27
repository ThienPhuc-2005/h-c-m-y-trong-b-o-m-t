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
  icon: '🚀',
  hue: 'slate',
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

    /* __NEXT__ */
  ],
};
