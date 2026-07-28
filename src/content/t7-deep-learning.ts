import type { Track } from './types';

/**
 * CHẶNG 7 — Học sâu cho bảo mật.
 *
 * Mục tiêu sư phạm: mở hộp đen ra, cho người học thấy bên trong chỉ là phép nhân
 * ma trận xen kẽ hàm phi tuyến — rồi dùng chính hiểu biết đó để trả lời câu hỏi
 * quan trọng hơn: bài toán của tôi có thực sự cần thứ này không.
 *
 * Bài t7-l6 là đích đến của cả chặng. Năm bài trước tồn tại để bài cuối cùng
 * không phải là một ý kiến, mà là một kết luận có căn cứ.
 */
export const track7: Track = {
  id: 'deep-learning',
  order: 7,
  title: 'Học sâu cho bảo mật',
  tagline: 'Mạnh mẽ, đắt đỏ, và thường không cần thiết',
  icon: 'network',
  hue: 't7',
  blurb:
    'Sáu bài mổ xẻ deep learning từ một nơ-ron tới Transformer, luôn gắn với dữ liệu bảo mật thật: byte của tệp PE, chuỗi lời gọi API, dòng log. Bạn sẽ xây được trực giác đủ để đọc kiến trúc và gỡ lỗi huấn luyện — và quan trọng hơn, đủ để nói không khi LightGBM đang thắng.',
  outcomes: [
    'Giải thích được vì sao mạng nơ-ron cần hàm phi tuyến, bằng một chứng minh hai dòng',
    'Chẩn đoán được một vòng huấn luyện hỏng: loss không giảm, loss ra NaN, hoặc mô hình chỉ đoán một lớp',
    'Đánh giá được khi nào CNN trên byte thô đáng tiền, và vì sao nó dễ bị chèn byte đến vậy',
    'Chọn được giữa 1D-CNN, LSTM và Transformer cho một bài toán chuỗi cụ thể, kèm chi phí',
    'Dùng autoencoder và học tương phản để khai thác 8 triệu mẫu không nhãn với 300 nhãn xác nhận',
    'Bảo vệ được quyết định GIỮ LẠI mô hình cây trước một đề xuất thay bằng deep learning',
  ],
  lessons: [
    /* ====================================================================== */
    {
      id: 't7-l1',
      trackId: 'deep-learning',
      title: 'Mạng nơ-ron từ con số 0',
      subtitle: 'Một nơ-ron chính là hồi quy logistic. Điều thú vị bắt đầu khi bạn xếp chồng chúng lại.',
      minutes: 23,
      practiceMinutes: 7,
      level: 'trung-cap',
      prereqs: ['t3-l2', 't1-l6', 't1-l7'],
      why: {
        short:
          'Deep learning không phải phép màu — nó là phép nhân ma trận xen kẽ một hàm phi tuyến. Hiểu đúng một nơ-ron là điều kiện để về sau bạn đọc được kiến trúc, chẩn đoán được lỗi huấn luyện, và nhận ra khi nào nó thừa.',
        scenario:
          'Một nhà cung cấp EDR trình bày rằng mô hình của họ là "mạng nơ-ron sâu 12 lớp". Bạn có 15 phút hỏi đáp. Bạn cần biết con số 12 nói lên điều gì, nó đổi được gì so với LightGBM đội bạn đang chạy, và câu hỏi nào sẽ lộ ra người trình bày có hiểu mô hình của chính họ hay không.',
        roles: ['Security Data Scientist', 'ML Engineer', 'Detection Engineer'],
        costOfNotKnowing:
          'Bạn coi mạng nơ-ron là hộp đen ma thuật — nên hoặc sợ nó vô cớ, hoặc đem nó giải bài toán mà hồi quy logistic ba dòng đã xong. Và khi mạng 12 lớp của bạn không hơn mạng 1 lớp, bạn không có cách nào biết vì sao.',
      },
      objectives: [
        'Viết ra được công thức của một nơ-ron và chỉ ra nó khác hồi quy logistic ở đúng điểm nào',
        'Chứng minh được vì sao xếp chồng lớp tuyến tính mà không có hàm kích hoạt là vô nghĩa',
        'Giải thích bài toán XOR và nối nó với một tương tác đặc trưng thật trong log đăng nhập',
        'Chọn được hàm kích hoạt cho lớp ẩn và lớp ra, kèm lý do',
        'Đếm được số tham số của một mạng nhiều lớp từ mô tả kiến trúc',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Bắt đầu bằng một bảng bốn dòng lấy từ log đăng nhập thật. Hai đặc trưng nhị phân: **VPN công ty có bật không**, và **IP có thuộc dải nước ngoài không**.',
        },
        {
          t: 'table',
          head: ['VPN bật', 'IP nước ngoài', 'Đây có phải chuyện đáng ngờ không?'],
          rows: [
            ['Không', 'Không', 'Bình thường — nhân viên ngồi ở văn phòng Hà Nội'],
            ['Có', 'Có', 'Bình thường — nhân viên ở nhà, thoát ra qua exit node ở Singapore'],
            ['Không', 'Có', 'ĐÁNG NGỜ — tài khoản nội bộ đăng nhập thẳng từ nước ngoài, không qua VPN'],
            ['Có', 'Không', 'ĐÁNG NGỜ — VPN báo đang bật nhưng IP lại là dải nội địa lạ, dấu hiệu giả mạo phiên'],
          ],
          caption: 'Không đặc trưng nào một mình nói lên điều gì. Chỉ có sự KHÔNG KHỚP giữa hai đặc trưng mới là tín hiệu.',
        },
        {
          t: 'predict',
          question:
            'Bạn huấn luyện hồi quy logistic trên đúng hai đặc trưng này, với đúng bốn dòng dữ liệu trên. Độ chính xác tốt nhất mà nó đạt được là bao nhiêu phần trăm? Thử nghĩ xem ranh giới quyết định của hồi quy logistic có hình dạng gì.',
          reveal:
            'Tốt nhất là **75%** — nghĩa là nó luôn sai đúng một trong bốn dòng, và không có bộ trọng số nào cứu được.\n\nLý do rất hình học: hồi quy logistic vẽ **một đường thẳng** trên mặt phẳng (VPN, IP nước ngoài) rồi nói một bên là lành, một bên là đáng ngờ. Bốn điểm của bảng nằm ở bốn góc của một hình vuông, và hai điểm "bình thường" nằm ở hai góc **đối diện chéo nhau**, hai điểm "đáng ngờ" cũng vậy. Không có đường thẳng nào tách được hai cặp góc chéo.\n\nĐây chính xác là bài toán **XOR**, và nó là lý do lịch sử khiến mạng nơ-ron gần như bị khai tử trong thập niên 1970. Nó cũng là lý do chặng này tồn tại: khi tín hiệu nằm ở **tương tác** giữa các đặc trưng chứ không nằm ở từng đặc trưng, bạn cần một mô hình biết tạo ra đặc trưng mới.',
        },
        { t: 'h', text: 'Một nơ-ron là gì, không màu mè', level: 2 },
        {
          t: 'p',
          md: 'Một nơ-ron nhân tạo làm đúng hai việc, theo thứ tự. **Một:** cộng có trọng số toàn bộ đầu vào rồi thêm một hằng số — `z = w1*x1 + w2*x2 + ... + wn*xn + b`. **Hai:** đẩy `z` qua một hàm phi tuyến `f`, cho ra `a = f(z)`.',
        },
        { t: 'figure', id: 'fig-neuron', caption: 'Một nơ-ron: tổng có trọng số (phần tuyến tính) rồi hàm kích hoạt (phần phi tuyến). Toàn bộ deep learning là hai bước này lặp lại vài triệu lần.' },
        {
          t: 'p',
          md: 'Nếu bạn chọn `f` là hàm sigmoid, thì `a = 1 / (1 + e^(-z))` — và đó **chính xác là hồi quy logistic**, không thêm không bớt một chữ nào. Bạn đã học nó ở bài t3-l2. Cái tên "nơ-ron" chỉ là một cách gọi khác, mượn từ sinh học vào năm 1943 và ngày nay gây hiểu nhầm nhiều hơn là giúp ích.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Trực giác cốt lõi của cả chặng',
          md: 'Mạng nơ-ron **không** học ra quy luật. Nó học ra một chuỗi phép biến đổi không gian: mỗi lớp bẻ, kéo, gập không gian đặc trưng cho tới khi hai lớp dữ liệu tách được bằng một mặt phẳng đơn giản. Lớp cuối cùng luôn chỉ là hồi quy logistic. Tất cả các lớp trước nó tồn tại để làm cho hồi quy logistic đó dễ ăn hơn.',
        },
        { t: 'h', text: 'Vì sao BẮT BUỘC phải có phi tuyến', level: 2 },
        {
          t: 'p',
          md: 'Giả sử bạn bỏ hàm kích hoạt đi, xếp chồng ba lớp tuyến tính cho oai. Kết quả là gì?',
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Chứng minh hai dòng — đáng nhớ cả đời',
          md: 'Lớp 1: `h1 = W1·x`. Lớp 2: `h2 = W2·h1 = W2·(W1·x) = (W2·W1)·x`. Đặt `W = W2·W1`, ta được `h2 = W·x`.\n\nTích của hai ma trận vẫn là **một ma trận**. Nghĩa là mạng 100 lớp tuyến tính hoàn toàn tương đương với **một** lớp tuyến tính duy nhất. Bạn tốn 100 lần bộ nhớ để có đúng khả năng biểu diễn của hồi quy tuyến tính.\n\nHàm kích hoạt phi tuyến là thứ duy nhất phá vỡ phép gộp này. Bỏ nó đi thì độ sâu trở thành trang trí.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bẫy người mới hay mắc nhất',
          md: 'Quên `nn.ReLU()` giữa hai `nn.Linear()` trong PyTorch là lỗi im lặng: mô hình vẫn chạy, vẫn giảm loss, vẫn cho ra một con số AUC. Nó chỉ đơn giản là không bao giờ vượt qua được đường cơ sở hồi quy logistic — và bạn sẽ mất ba ngày đổ lỗi cho dữ liệu. **Kiểm tra đầu tiên khi mạng sâu không hơn mô hình tuyến tính: in kiến trúc ra và đếm số hàm kích hoạt.**',
        },
        { t: 'h', text: 'Chọn hàm kích hoạt', level: 2 },
        {
          t: 'table',
          head: ['Hàm', 'Công thức', 'Điểm mạnh', 'Điểm yếu', 'Dùng ở đâu'],
          rows: [
            ['Sigmoid', '1/(1+e^-z)', 'Ra khoảng (0,1), đọc được như xác suất', 'Bão hoà hai đầu → gradient gần 0 → mạng sâu ngừng học', 'CHỈ ở lớp ra của phân loại nhị phân'],
            ['Tanh', '(e^z - e^-z)/(e^z + e^-z)', 'Ra khoảng (-1,1), tâm ở 0 nên hội tụ nhanh hơn sigmoid', 'Vẫn bão hoà', 'Lớp ẩn của RNN đời cũ'],
            ['ReLU', 'max(0, z)', 'Rẻ nhất, không bão hoà phía dương, là mặc định từ 2012', 'Nơ-ron chết: nếu z luôn âm thì gradient luôn 0 vĩnh viễn', 'Mặc định cho lớp ẩn'],
            ['Leaky ReLU', 'max(0.01z, z)', 'Chữa được nơ-ron chết', 'Thêm một siêu tham số, lợi ích thường nhỏ', 'Khi thấy nhiều nơ-ron chết'],
            ['GELU', 'z·Φ(z)', 'Trơn, hoạt động tốt trong Transformer', 'Đắt hơn ReLU vài phần trăm', 'Transformer, mô hình lớn'],
          ],
          caption: 'Lời khuyên thực dụng: dùng ReLU cho lớp ẩn, GELU nếu bạn đang làm Transformer. Đừng tốn thời gian tinh chỉnh chỗ này — nó gần như không bao giờ là nguyên nhân mô hình của bạn kém.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Lớp ra: đừng dùng sigmoid trong mô hình, dùng trong hàm mất mát',
          md: 'Trong PyTorch, lớp cuối nên trả về **logit** (số thực chưa qua sigmoid) và bạn dùng `nn.BCEWithLogitsLoss`. Hàm này gộp sigmoid và log vào một phép tính ổn định số học. Nếu bạn tự gọi `sigmoid()` rồi dùng `nn.BCELoss`, mô hình sẽ ra `NaN` ngay khi có mẫu nào bị dự đoán quá tự tin — vì `log(0)` không tồn tại. Đây là nguyên nhân số một của loss ra NaN ở người mới.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't7l1-cp1',
              kind: 'mcq',
              tags: ['mang-noron', 'phi-tuyen'],
              q: 'Đồng nghiệp khoe mạng 8 lớp `Linear → Linear → ... → Linear` (không có kích hoạt) đạt AUC 0,86, đúng bằng hồi quy logistic. Kết luận đúng nhất?',
              options: [
                'Mạng cần huấn luyện lâu hơn để vượt qua hồi quy logistic',
                'Đây là kết quả TẤT YẾU: chuỗi lớp tuyến tính tương đương một lớp tuyến tính duy nhất',
                'Dữ liệu quá ít nên mạng sâu không phát huy được',
                'Cần tăng số nơ-ron mỗi lớp lên gấp mười',
              ],
              answer: 1,
              why: 'Tích của tám ma trận vẫn là một ma trận. Mạng đó, về mặt toán học, KHÔNG THỂ biểu diễn bất kỳ hàm nào mà hồi quy logistic không biểu diễn được — bất kể huấn luyện bao lâu, dữ liệu bao nhiêu, hay mỗi lớp rộng cỡ nào. Sửa bằng cách thêm hàm kích hoạt, không phải bằng cách thêm tài nguyên.',
              distractorWhy: [
                'Thời gian huấn luyện không thay đổi được không gian hàm mà mô hình có thể biểu diễn.',
                '',
                'Dữ liệu nhiều hơn cũng không giúp: giới hạn ở đây là giới hạn biểu diễn, không phải giới hạn thống kê.',
                'Rộng hơn cũng vẫn tuyến tính. Đây là giới hạn về DẠNG hàm, không phải về dung lượng.',
              ],
            },
            {
              id: 't7l1-cp2',
              kind: 'truefalse',
              tags: ['mang-noron', 'hoi-quy-logistic'],
              q: 'Một nơ-ron duy nhất dùng hàm kích hoạt sigmoid, huấn luyện bằng hàm mất mát cross-entropy, tương đương với hồi quy logistic.',
              answer: true,
              why: 'Đúng hoàn toàn — cùng công thức, cùng hàm mất mát, cùng nghiệm tối ưu. Khác biệt duy nhất là cách tìm nghiệm: scikit-learn dùng bộ giải tối ưu bậc hai (lbfgs), PyTorch dùng gradient descent theo lô. Ghi nhớ điều này giúp bạn có một đường cơ sở miễn phí: nếu mạng sâu của bạn không vượt được `LogisticRegression()`, mọi lớp bạn thêm vào đang không đóng góp gì.',
            },
          ],
        },
        { t: 'h', text: 'XOR: bài toán từng giết chết mạng nơ-ron trong 17 năm', level: 2 },
        {
          t: 'p',
          md: 'Rosenblatt công bố perceptron năm 1958 và báo chí Mỹ khi đó đưa tin như thể máy biết suy nghĩ sắp ra đời. Năm 1969, Minsky và Papert xuất bản cuốn *Perceptrons*, chỉ ra rằng một perceptron đơn không học nổi hàm XOR. Kinh phí nghiên cứu cạn, và lĩnh vực này gần như đóng băng cho tới khi thuật toán lan truyền ngược được phổ biến rộng vào năm 1986.',
        },
        {
          t: 'p',
          md: 'Điều trớ trêu: lời giải chỉ cần **hai nơ-ron ẩn**. Hãy làm bằng tay, không huấn luyện gì cả.',
        },
        {
          t: 'steps',
          title: 'Giải XOR bằng tay với mạng 2-2-1',
          steps: [
            {
              title: 'Bước 1 — Nơ-ron ẩn thứ nhất học hàm OR',
              md: 'Đặt trọng số `w = [1, 1]`, ngưỡng `b = -0,5`, kích hoạt là hàm bậc thang (`1` nếu `z > 0`).\n\nVới đầu vào (0,0): `z = -0,5` → ra **0**. Với (0,1), (1,0), (1,1): `z` lần lượt là 0,5 / 0,5 / 1,5 → ra **1**.\n\nVậy nơ-ron này trả lời câu hỏi: *có ít nhất một trong hai điều kiện đúng không?*',
            },
            {
              title: 'Bước 2 — Nơ-ron ẩn thứ hai học hàm AND',
              md: 'Cùng trọng số `w = [1, 1]`, nhưng ngưỡng khác: `b = -1,5`.\n\nChỉ (1,1) mới cho `z = 0,5 > 0` → ra **1**. Ba trường hợp còn lại ra **0**.\n\nNó trả lời: *cả hai điều kiện có cùng đúng không?* Hai nơ-ron dùng chung trọng số, chỉ khác ngưỡng — và tạo ra hai câu hỏi hoàn toàn khác nhau. Đây là toàn bộ phép màu của lớp ẩn: **nó tạo ra đặc trưng mới.**',
            },
            {
              title: 'Bước 3 — Lớp ra kết hợp: OR nhưng KHÔNG AND',
              md: 'Đặt `w = [1, -2]`, `b = -0,5` trên hai đầu ra của lớp ẩn `[h_or, h_and]`.\n\n(0,0) → h = [0,0] → `z = -0,5` → **0** ✓\n(0,1) → h = [1,0] → `z = 0,5` → **1** ✓\n(1,0) → h = [1,0] → `z = 0,5` → **1** ✓\n(1,1) → h = [1,1] → `z = 1 - 2 - 0,5 = -1,5` → **0** ✓\n\nBốn trên bốn. Bài toán bất khả thi với một nơ-ron trở thành tầm thường với ba.',
            },
            {
              title: 'Bước 4 — Dịch ngược sang ngôn ngữ bảo mật',
              md: 'Với bảng VPN/IP ở đầu bài: nơ-ron ẩn 1 học "có bất thường nào không", nơ-ron ẩn 2 học "cả hai cùng bật", lớp ra kết luận "đáng ngờ khi có bất thường nhưng không phải cả hai cùng lúc".\n\nMạng đã tự **phát minh ra khái niệm KHÔNG KHỚP** mà không ai dạy nó. Trong kỹ thuật đặc trưng thủ công (chặng 5), bạn sẽ phải tự nghĩ ra và viết tay đặc trưng `vpn XOR nuoc_ngoai`. Đó chính là đánh đổi trung tâm của deep learning: **bạn trả bằng dữ liệu và tính toán để khỏi phải trả bằng tri thức miền.**',
            },
          ],
        },
        { t: 'figure', id: 'fig-mlp', caption: 'Mạng nhiều lớp (MLP). Lớp ẩn tạo ra đặc trưng mới; lớp ra chỉ là hồi quy logistic trên những đặc trưng đó.' },
        {
          t: 'code',
          lang: 'python',
          caption: 'Toàn bộ bước 1–3 ở trên, bằng numpy, không huấn luyện gì cả.',
          code:
            'import numpy as np\n' +
            '\n' +
            '# Bảng XOR: hai đặc trưng nhị phân → nhãn\n' +
            'X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)\n' +
            'y = np.array([0, 1, 1, 0], dtype=float)\n' +
            '\n' +
            '# Mạng 2-2-1 với trọng số ĐẶT BẰNG TAY (để thấy lớp ẩn làm gì)\n' +
            'W1 = np.array([[1.0, 1.0],    # nơ-ron ẩn 1 → hàm OR\n' +
            '               [1.0, 1.0]])   # nơ-ron ẩn 2 → hàm AND\n' +
            'b1 = np.array([-0.5, -1.5])   # cùng trọng số, khác ngưỡng → khác hàm\n' +
            'W2 = np.array([1.0, -2.0])    # kết quả = OR và KHÔNG AND\n' +
            'b2 = np.array([-0.5])\n' +
            '\n' +
            'buoc_thang = lambda z: (z > 0).astype(float)   # hàm kích hoạt phi tuyến\n' +
            '\n' +
            'H = buoc_thang(X @ W1.T + b1)   # lớp ẩn, hình dạng (4, 2)\n' +
            'out = buoc_thang(H @ W2 + b2)   # lớp ra, hình dạng (4,)\n' +
            '\n' +
            'print(H)                                  # cột 0 = OR, cột 1 = AND\n' +
            'print(out, np.array_equal(out, y))        # [0. 1. 1. 0.] True\n',
        },
        { t: 'lab', id: 'lab-perceptron', intro: 'Tự tay kéo trọng số của một perceptron và xem nó vật lộn với XOR, rồi thêm lớp ẩn và xem ranh giới quyết định gãy khúc lại.' },
        { t: 'h', text: 'Đếm tham số — kỹ năng nhỏ, dùng hằng ngày', level: 2 },
        {
          t: 'p',
          md: 'Một lớp `Linear(n_vao, n_ra)` có `n_vao × n_ra` trọng số cộng `n_ra` bias. Chỉ vậy thôi. Áp dụng cho một mạng thật trên bộ dữ liệu EMBER (2.381 đặc trưng tệp PE):',
        },
        {
          t: 'table',
          head: ['Lớp', 'Phép tính', 'Số tham số'],
          rows: [
            ['Linear(2381 → 512)', '2381 × 512 + 512', '1.219.584'],
            ['Linear(512 → 512)', '512 × 512 + 512', '262.656'],
            ['Linear(512 → 1)', '512 × 1 + 1', '513'],
            ['**Tổng**', '', '**1.482.753**'],
          ],
          caption: 'Gần 1,5 triệu tham số cho một mạng khiêm tốn ba lớp. Mô hình LightGBM giải cùng bài toán này thường dưới 100.000 tham số hiệu dụng và huấn luyện trong vài phút CPU.',
        },
        {
          t: 'compare',
          title: 'Khi nào độ sâu thực sự trả tiền cho bạn',
          left: {
            title: 'Một lớp là đủ',
            icon: 'package',
            items: [
              'Đặc trưng đã được người có tri thức miền thiết kế sẵn (imports của PE, thống kê NetFlow)',
              'Tương tác giữa các đặc trưng ít và bạn biết trước chúng là gì',
              'Dữ liệu dạng bảng vài chục nghìn dòng',
              'Cần giải thích từng quyết định cho analyst hoặc kiểm toán',
              'Đường cơ sở hồi quy logistic đã đạt 95% mục tiêu',
            ],
          },
          right: {
            title: 'Cần nhiều lớp',
            icon: 'network',
            items: [
              'Đầu vào là dữ liệu thô: chuỗi byte, chuỗi API, văn bản, đồ thị',
              'Tương tác bậc cao nhiều tới mức không liệt kê nổi bằng tay',
              'Có hàng triệu mẫu, trong đó rất nhiều mẫu không nhãn',
              'Bạn muốn tái sử dụng biểu diễn học được cho nhiều bài toán khác',
              'Đường cơ sở đơn giản đã chạm trần và bạn đo được điều đó',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'why',
          title: 'Định lý xấp xỉ phổ quát — và vì sao nó ít hữu ích hơn bạn tưởng',
          md: 'Cybenko (1989) và Hornik (1991) chứng minh: một mạng **một lớp ẩn** đủ rộng xấp xỉ được mọi hàm liên tục trên tập compact với sai số tuỳ ý nhỏ. Nghe như thắng lợi tuyệt đối.\n\nNhưng định lý không nói gì về ba thứ quyết định trong thực tế: cần bao nhiêu nơ-ron (có thể là số mũ), có tìm được bộ trọng số đó bằng gradient descent không, và cần bao nhiêu dữ liệu để **học** nó thay vì chỉ tồn tại nó. Đây là lý do người ta xếp chồng nhiều lớp hẹp thay vì một lớp cực rộng: cùng khả năng biểu diễn nhưng số tham số nhỏ hơn hẳn và dễ tối ưu hơn.',
        },
        { t: 'terms', ids: ['perceptron', 'ham-kich-hoat', 'relu', 'mlp', 'hoi-quy-logistic', 'gradient-descent'] },
      ],
      keyTakeaways: [
        'Một nơ-ron = tổng có trọng số + hàm phi tuyến. Với sigmoid, nó chính xác là hồi quy logistic.',
        'Không có hàm kích hoạt, mạng N lớp tuyến tính tương đương đúng MỘT lớp tuyến tính — độ sâu trở thành trang trí.',
        'XOR không tách được bằng đường thẳng; hai nơ-ron ẩn giải xong. Bài học: lớp ẩn TẠO RA đặc trưng mới.',
        'Trong bảo mật, tín hiệu thường nằm ở sự KHÔNG KHỚP giữa các đặc trưng, không nằm ở từng đặc trưng riêng lẻ.',
        'Đánh đổi trung tâm của deep learning: trả bằng dữ liệu và tính toán để khỏi trả bằng tri thức miền.',
        'Lớp cuối trả về logit, dùng BCEWithLogitsLoss — tự gọi sigmoid rồi BCELoss là nguyên nhân số một của loss ra NaN.',
      ],
      cards: [
        {
          id: 't7l1-c1',
          front: 'Vì sao xếp chồng nhiều lớp tuyến tính mà không có hàm kích hoạt là vô nghĩa?',
          back: 'Vì W2·(W1·x) = (W2·W1)·x — tích các ma trận vẫn là một ma trận. Mạng 100 lớp tuyến tính có đúng khả năng biểu diễn của 1 lớp.',
          tags: ['mang-noron', 'phi-tuyen'],
        },
        {
          id: 't7l1-c2',
          front: 'Một nơ-ron với hàm kích hoạt sigmoid tương đương mô hình cổ điển nào?',
          back: 'Hồi quy logistic — cùng công thức, cùng hàm mất mát, cùng nghiệm tối ưu. Chỉ khác cách tìm nghiệm.',
          tags: ['mang-noron', 'hoi-quy-logistic'],
        },
        {
          id: 't7l1-c3',
          front: 'Bài toán XOR chứng minh điều gì về perceptron đơn, và cần gì để giải?',
          back: 'Perceptron đơn chỉ vẽ được một đường thẳng nên tối đa đạt 75% trên XOR. Cần một lớp ẩn hai nơ-ron (một học OR, một học AND) để giải trọn vẹn.',
          hint: 'Nghĩ về bốn góc của hình vuông và hai góc chéo nhau.',
          tags: ['xor', 'mang-noron'],
        },
        {
          id: 't7l1-c4',
          front: 'Lớp Linear(2381 → 512) có bao nhiêu tham số? Nêu công thức.',
          back: 'n_vào × n_ra + n_ra = 2381 × 512 + 512 = 1.219.584 tham số.',
          tags: ['mang-noron'],
        },
        {
          id: 't7l1-c5',
          front: 'Nên dùng hàm kích hoạt nào cho lớp ẩn, và vì sao không dùng sigmoid ở đó?',
          back: 'ReLU (hoặc GELU cho Transformer). Sigmoid bão hoà ở hai đầu khiến gradient tiến về 0, làm mạng sâu ngừng học.',
          tags: ['ham-kich-hoat', 'relu'],
        },
      ],
      quiz: [
        {
          id: 't7l1-q1',
          kind: 'mcq',
          tags: ['mang-noron', 'phi-tuyen'],
          q: 'Bạn thay `nn.ReLU()` bằng `nn.Identity()` trong toàn bộ mạng 6 lớp. Kết quả dự đoán được là gì?',
          options: [
            'Mô hình sẽ hỏng và không huấn luyện được',
            'Mô hình vẫn huấn luyện bình thường nhưng năng lực bị giới hạn ở mức hồi quy tuyến tính',
            'Mô hình sẽ quá khớp nặng hơn vì mất đi tính phi tuyến',
            'Không có gì thay đổi vì ReLU chỉ ảnh hưởng tốc độ hội tụ',
          ],
          answer: 1,
          why: 'Đây là dạng lỗi nguy hiểm nhất: nó KHÔNG hỏng ầm ĩ. Loss vẫn giảm, vẫn có AUC, biểu đồ vẫn đẹp. Mô hình chỉ lặng lẽ bị nhốt trong không gian hàm tuyến tính. Cách phát hiện: so với `LogisticRegression()` của scikit-learn — nếu ngang nhau tới chữ số thứ ba, hãy đi đếm số hàm kích hoạt trong kiến trúc.',
          distractorWhy: [
            'Identity là một hàm hợp lệ; mạng vẫn tính được gradient và vẫn hội tụ.',
            '',
            'Ngược lại: mất phi tuyến làm GIẢM năng lực mô hình, nên nguy cơ quá khớp giảm chứ không tăng.',
            'ReLU không phải mẹo tăng tốc — nó là thứ quyết định lớp hàm mà mạng có thể biểu diễn.',
          ],
        },
        {
          id: 't7l1-q2',
          kind: 'input',
          tags: ['mang-noron'],
          q: 'Một lớp `Linear(128 → 64)` trong PyTorch có tổng cộng bao nhiêu tham số (tính cả bias)? Gõ số nguyên.',
          accept: ['8256', '8.256', '8 256'],
          placeholder: 'Ví dụ: 12345',
          hint: 'n_vào × n_ra rồi cộng thêm một bias cho mỗi nơ-ron đầu ra.',
          why: '128 × 64 = 8.192 trọng số, cộng 64 bias = **8.256**. Kỹ năng này dùng hằng ngày để ước lượng bộ nhớ: nhân số tham số với 4 byte (float32) ra kích thước trọng số, rồi nhân thêm khoảng 3 lần nữa nếu dùng Adam (vì Adam giữ hai biến trạng thái cho mỗi tham số) và cộng bộ nhớ cho activation của cả lô.',
        },
        {
          id: 't7l1-q3',
          kind: 'order',
          tags: ['mang-noron'],
          q: 'Sắp xếp các phép tính bên trong một lượt truyền xuôi qua một lớp ẩn theo đúng thứ tự.',
          items: [
            'Nhân đầu vào với ma trận trọng số',
            'Cộng vector bias',
            'Đưa kết quả qua hàm kích hoạt phi tuyến',
            'Chuyển đầu ra sang làm đầu vào của lớp kế tiếp',
          ],
          why: 'Thứ tự này không tuỳ ý. Nếu bạn đặt hàm kích hoạt TRƯỚC phép cộng bias, bias mất tác dụng dịch chuyển ngưỡng — và chính ngưỡng khác nhau đã tạo ra sự khác biệt giữa nơ-ron OR và nơ-ron AND trong ví dụ XOR. Trong PyTorch, `nn.Linear` gộp bước 1 và 2 vào một lời gọi, nên bạn chỉ thấy hai dòng.',
        },
        {
          id: 't7l1-q4',
          kind: 'multi',
          tags: ['mang-noron', 'thuc-chien'],
          q: 'Tình huống nào là dấu hiệu ĐÁNG TIN rằng bài toán của bạn cần mạng nhiều lớp thay vì hồi quy logistic? (Chọn tất cả đáp án đúng)',
          options: [
            'Tín hiệu nằm ở sự không khớp giữa nhiều đặc trưng, và bạn không liệt kê hết được các tương tác bằng tay',
            'Đầu vào là chuỗi byte thô của tệp thực thi, chưa qua trích xuất đặc trưng',
            'Hồi quy logistic đạt AUC 0,93 và mục tiêu kinh doanh là 0,90',
            'Sếp vừa mua GPU và muốn thấy nó được dùng',
          ],
          answers: [0, 1],
          why: 'Hai lý do hợp lệ đều xuất phát từ **bản chất dữ liệu**: tương tác bậc cao không liệt kê nổi, hoặc đầu vào thô chưa có đặc trưng. Phương án 3 là lý do để DỪNG lại — bạn đã vượt mục tiêu, mọi độ phức tạp thêm vào chỉ tạo thêm rủi ro vận hành. Phương án 4 là lý do chính trị, và nó tạo ra phần lớn các dự án ML thất bại trong ngành bảo mật.',
        },
        {
          id: 't7l1-q5',
          kind: 'truefalse',
          tags: ['mang-noron', 'xor'],
          q: 'Định lý xấp xỉ phổ quát bảo đảm rằng nếu bạn có một mạng một lớp ẩn đủ rộng, gradient descent sẽ tìm được nghiệm tốt.',
          answer: false,
          why: 'Định lý chỉ nói nghiệm **tồn tại**, không nói bạn **tìm được** nó. Ba khoảng cách nó bỏ ngỏ: số nơ-ron cần có thể tăng theo hàm mũ; gradient descent không được bảo đảm hội tụ tới nghiệm đó; và bạn cần đủ dữ liệu để phân biệt nghiệm đúng với vô số nghiệm khớp dữ liệu huấn luyện. Nhầm "tồn tại" với "học được" là sai lầm phổ biến khi đọc kết quả lý thuyết.',
        },
      ],
      terms: ['perceptron', 'ham-kich-hoat', 'relu', 'mlp', 'hoi-quy-logistic', 'gradient-descent'],
      further: [
        {
          title: 'Perceptrons — Minsky & Papert (1969)',
          note: 'Cuốn sách đã đóng băng cả lĩnh vực này gần hai thập kỷ chỉ bằng một phản ví dụ. Đọc để hiểu vì sao một giới hạn toán học nhỏ có thể có sức tàn phá lớn.',
        },
        {
          title: 'Neural Networks and Deep Learning — Michael Nielsen',
          note: 'Sách trực tuyến miễn phí, xây trực giác về nơ-ron và lan truyền ngược tốt nhất trong số các tài liệu nhập môn.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't7-l2',
      trackId: 'deep-learning',
      title: 'Huấn luyện mạng nơ-ron',
      subtitle: 'Lan truyền ngược bằng trực giác, và mười cái núm bạn phải vặn đúng thứ tự',
      minutes: 26,
      practiceMinutes: 3,
      level: 'nang-cao',
      prereqs: ['t7-l1', 't1-l7', 't3-l7'],
      why: {
        short:
          'Mạng nơ-ron hiếm khi thất bại vì kiến trúc — nó thất bại vì quy trình huấn luyện. Biết chính xác chỗ nào hỏng giúp bạn tiết kiệm hàng chục giờ GPU và tránh công bố một mô hình chỉ giỏi trên tập kiểm tra.',
        scenario:
          'Bạn huấn luyện MLP trên 2,3 triệu mẫu tệp PE với tỉ lệ độc hại 1:500. Loss giảm đẹp trong ba epoch rồi nhảy lên `nan`. Lần chạy trước thì loss đứng im ở 0,693 suốt 20 epoch. Đội chờ kết quả trong hôm nay và bạn phải biết nhìn vào đâu trước.',
        roles: ['ML Engineer', 'Security Data Scientist'],
        costOfNotKnowing:
          'Bạn đốt 40 giờ GPU cho một mô hình có recall 0,3, rồi kết luận sai rằng deep learning không hợp với bài toán của mình — trong khi nguyên nhân thật chỉ là tốc độ học cao gấp 100 lần mức hợp lý.',
      },
      objectives: [
        'Mô tả lan truyền ngược bằng ngôn ngữ "phân bổ trách nhiệm" mà không cần viết công thức',
        'Chẩn đoán được ba lỗi huấn luyện kinh điển: loss đứng im, loss ra NaN, mô hình chỉ đoán một lớp',
        'Chọn optimizer, tốc độ học và lịch giảm tốc độ học với lý do cụ thể thay vì sao chép mặc định',
        'Áp dụng dropout, batch norm và early stopping đúng chỗ, và nêu được tác dụng phụ của từng cái',
        'Viết một vòng huấn luyện PyTorch xử lý được mất cân bằng 1:500 và chia dữ liệu theo thời gian',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Toàn bộ việc huấn luyện một mạng nơ-ron nằm gọn trong năm dòng, lặp đi lặp lại vài chục nghìn lần:',
        },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Truyền xuôi** — đẩy một lô dữ liệu qua mạng, thu về dự đoán.',
            '**Tính mất mát** — so dự đoán với nhãn, ra một con số duy nhất đo mức độ sai.',
            '**Xoá gradient cũ** — nếu quên bước này, PyTorch cộng dồn gradient của lô trước vào lô này.',
            '**Lan truyền ngược** — tính xem mỗi tham số phải chịu bao nhiêu phần trách nhiệm cho con số sai đó.',
            '**Cập nhật** — dịch mỗi tham số một chút theo hướng làm giảm mất mát.',
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Lan truyền ngược, giải thích không cần công thức',
          md: 'Hình dung một dây chuyền sản xuất 5 công đoạn. Sản phẩm cuối bị lỗi 3 milimét. Câu hỏi: **mỗi công đoạn phải chịu bao nhiêu phần của 3 milimét đó?**\n\nBạn đi ngược dây chuyền. Công đoạn 5 đóng góp trực tiếp — dễ tính. Công đoạn 4 ảnh hưởng tới sản phẩm cuối *thông qua* công đoạn 5, nên phần trách nhiệm của nó bằng ảnh hưởng của nó lên công đoạn 5 **nhân** với trách nhiệm của công đoạn 5. Cứ thế lùi về đầu.\n\nPhép nhân dây chuyền đó chính là **quy tắc chuỗi** (chain rule) trong giải tích, và lan truyền ngược chỉ là cách tổ chức phép tính đó sao cho không tính lại cùng một thứ hai lần. Không có gì huyền bí.',
        },
        {
          t: 'predict',
          question:
            'Mỗi lớp trong mạng của bạn nhân phần trách nhiệm với hệ số khoảng 0,2 khi truyền ngược (chuyện rất thường xảy ra với hàm kích hoạt sigmoid). Mạng có 10 lớp. Gradient chạm tới lớp thứ nhất sẽ bằng khoảng bao nhiêu phần so với gradient ở lớp cuối? Điều đó có nghĩa gì với việc học?',
          reveal:
            '0,2 mũ 10 ≈ **1 phần 10 triệu**. Nếu lớp cuối nhận gradient cỡ 0,1 thì lớp đầu nhận cỡ 0,00000001 — nhỏ hơn cả sai số làm tròn của float32 trong nhiều phép cộng.\n\nHệ quả cụ thể: **các lớp đầu gần như không được cập nhật**. Mạng 10 lớp của bạn trên thực tế đang hoạt động như mạng 3 lớp, còn 7 lớp đầu giữ nguyên giá trị khởi tạo ngẫu nhiên. Đây là **vanishing gradient** — vấn đề đã chặn đứng deep learning suốt thập niên 1990.\n\nBa thứ đã gỡ nút thắt này, và bạn dùng cả ba mỗi ngày mà có thể không để ý: **ReLU** (đạo hàm đúng bằng 1 ở phía dương, không co lại), **kết nối tắt** kiểu ResNet (gradient có đường cao tốc đi thẳng về đầu), và **chuẩn hoá** (batch norm, layer norm giữ độ lớn tín hiệu ổn định qua các lớp).\n\nChiều ngược lại cũng nguy hiểm: nếu hệ số là 1,5 thay vì 0,2 thì 1,5 mũ 10 ≈ 58 — gradient nổ, trọng số bay lên vô cực, loss thành `nan`. Thuốc chữa là `clip_grad_norm_`.',
        },
        { t: 'figure', id: 'fig-gradient-descent', caption: 'Gradient descent trên mặt lỗi. Tốc độ học quyết định độ dài mỗi bước: quá nhỏ thì bò cả tuần, quá lớn thì bật qua bật lại hai bên thung lũng và không bao giờ xuống đáy.' },
        { t: 'h', text: 'Optimizer: bốn lựa chọn, một khuyến nghị', level: 2 },
        {
          t: 'table',
          head: ['Optimizer', 'Ý tưởng', 'Ưu điểm', 'Nhược điểm', 'Khi nào dùng'],
          rows: [
            ['SGD', 'Đi thẳng theo gradient của lô hiện tại', 'Đơn giản, tốn ít bộ nhớ, thường tổng quát hoá tốt nhất', 'Hội tụ chậm, rất nhạy với tốc độ học', 'Khi bạn có thời gian tinh chỉnh và muốn kết quả cuối tốt nhất'],
            ['SGD + momentum', 'Cộng dồn quán tính từ các bước trước', 'Vượt qua vùng bằng phẳng và dao động ngang', 'Thêm một siêu tham số (thường để 0,9)', 'Thị giác máy tính, mạng tích chập'],
            ['Adam', 'Tốc độ học riêng cho từng tham số, dựa trên trung bình động của gradient', 'Chạy được ngay với mặc định, hội tụ nhanh', 'Đôi khi tổng quát hoá kém hơn SGD; tốn gấp 3 bộ nhớ tham số', 'Mặc định để BẮT ĐẦU mọi thứ'],
            ['AdamW', 'Adam nhưng tách weight decay ra khỏi gradient', 'Regularization hoạt động đúng như kỳ vọng', 'Không có nhược điểm đáng kể so với Adam', 'Mặc định hiện nay cho gần như mọi bài toán'],
          ],
          caption: 'Khuyến nghị thực dụng: bắt đầu bằng AdamW, lr = 1e-3, weight_decay = 1e-2. Chỉ đổi khi bạn đo được rằng nó là nút thắt.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Tốc độ học là siêu tham số quan trọng nhất — cách xa mọi thứ khác',
          md: 'Nếu bạn chỉ được tinh chỉnh **một** thứ, chọn tốc độ học. Nó ảnh hưởng tới kết quả mạnh hơn số lớp, số nơ-ron, và loại optimizer cộng lại.\n\nCách tìm nhanh trong 5 phút: chạy vài chục lô với tốc độ học tăng dần theo cấp số nhân từ `1e-7` tới `1`, vẽ loss theo tốc độ học. Chọn giá trị nằm ở **giữa đoạn dốc xuống mạnh nhất**, thường là khoảng một phần mười giá trị làm loss bắt đầu nổ. Kỹ thuật này gọi là *LR range test*, do Leslie Smith đề xuất, và nó tiết kiệm cho bạn hàng chục lần chạy mò.',
        },
        {
          t: 'h',
          text: 'Batch size: cái núm ít người hiểu đúng',
          level: 2,
        },
        {
          t: 'list',
          items: [
            '**Batch lớn (1024+)** — tận dụng GPU tốt, ước lượng gradient ít nhiễu, mỗi epoch nhanh hơn. Nhưng chính cái "ít nhiễu" đó lại làm mất một dạng regularization tự nhiên: nhiễu của gradient theo lô giúp mô hình thoát khỏi cực tiểu hẹp. Keskar và cộng sự (2017) chỉ ra batch quá lớn có xu hướng rơi vào cực tiểu "nhọn" và tổng quát hoá kém hơn.',
            '**Batch nhỏ (32–128)** — nhiễu hơn, chậm hơn về thông lượng, nhưng thường cho mô hình cuối tốt hơn một chút. Với batch norm, batch dưới 16 bắt đầu gây vấn đề vì thống kê theo lô trở nên không đáng tin.',
            '**Quy tắc mở rộng tuyến tính** — khi bạn nhân đôi batch size, hãy cân nhắc nhân đôi tốc độ học (Goyal và cộng sự, 2017). Nếu không, mô hình sẽ học chậm hơn hẳn và bạn sẽ tưởng nhầm là batch lớn có hại.',
            '**Trong bảo mật, còn một lý do riêng:** với mất cân bằng 1:500 và batch 32, khoảng **94% số lô không chứa mẫu độc hại nào** (0,998 mũ 32 ≈ 0,94). Mô hình dành phần lớn thời gian học rằng "mọi thứ đều lành". Đây là lý do người ta lấy mẫu theo lớp hoặc dùng `pos_weight`.',
          ],
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't7l2-cp1',
              kind: 'mcq',
              tags: ['huan-luyen', 'mat-can-bang'],
              q: 'Bạn huấn luyện phân loại nhị phân trên dữ liệu mất cân bằng 1:500. Sau 20 epoch, loss vẫn đứng im quanh 0,693 và mô hình dự đoán 0,5 cho mọi mẫu. Nguyên nhân khả dĩ nhất?',
              options: [
                'Dữ liệu quá mất cân bằng, không thể học được',
                'Tốc độ học quá cao khiến trọng số dao động, hoặc đầu vào chưa được chuẩn hoá nên gradient bị lệch thang',
                'Mạng thiếu lớp, cần thêm độ sâu',
                'Cần thêm dropout để mô hình bớt quá khớp',
              ],
              answer: 1,
              why: '0,693 chính là `ln(2)` — giá trị loss khi mô hình dự đoán 0,5 cho mọi thứ, tức là nó chưa học được gì cả. Hai nghi phạm đứng đầu luôn là tốc độ học sai thang và đầu vào chưa chuẩn hoá (ví dụ một cột là kích thước tệp tính bằng byte, giá trị tới hàng triệu, nằm cạnh một cột entropy trong khoảng 0–8). **Phép thử vàng: lấy đúng một lô 32 mẫu và bắt mô hình quá khớp hoàn toàn lô đó.** Nếu loss không tiến về 0 trên 32 mẫu, lỗi nằm ở mã hoặc siêu tham số, không nằm ở dữ liệu.',
              distractorWhy: [
                'Mất cân bằng gây ra triệu chứng khác hẳn: mô hình đoán TOÀN lớp âm với xác suất rất thấp, loss xuống thấp, chứ không đứng im ở 0,693.',
                '',
                'Thêm lớp vào một mạng chưa học được gì chỉ làm việc gỡ lỗi khó hơn.',
                'Dropout chống quá khớp. Ở đây mô hình chưa khớp nổi cả tập huấn luyện — thêm regularization là đi ngược hướng.',
              ],
            },
            {
              id: 't7l2-cp2',
              kind: 'truefalse',
              tags: ['huan-luyen', 'dropout'],
              q: 'Nếu quên gọi `model.eval()` trước khi dự đoán, kết quả suy luận vẫn đúng, chỉ chậm hơn một chút.',
              answer: false,
              why: 'Sai, và đây là lỗi lọt vào production thường xuyên. `model.eval()` làm hai việc: **tắt dropout** (nếu không, mô hình vẫn ngẫu nhiên bỏ 30% nơ-ron nên cùng một đầu vào cho hai kết quả khác nhau), và **đóng băng batch norm** để dùng thống kê tích luỹ thay vì thống kê của lô hiện tại. Hậu quả của cái thứ hai đặc biệt xấu trong bảo mật: dự đoán cho một tệp sẽ phụ thuộc vào những tệp nào tình cờ nằm cùng lô với nó. Cùng một tệp, chấm hai lần, ra hai điểm khác nhau.',
            },
          ],
        },
        { t: 'h', text: 'Bốn công cụ chống quá khớp và tác dụng phụ của chúng', level: 2 },
        {
          t: 'table',
          head: ['Kỹ thuật', 'Làm gì', 'Giá trị khởi đầu hợp lý', 'Tác dụng phụ cần biết'],
          rows: [
            ['Dropout', 'Ngẫu nhiên tắt một tỉ lệ nơ-ron mỗi lượt huấn luyện, buộc mạng không phụ thuộc vào một đường duy nhất', '0,1–0,3 cho dữ liệu bảng; 0,5 là quá mạnh trừ mạng rất lớn', 'Phải tắt khi suy luận. Dùng chung với batch norm có thể gây lệch thống kê — nhiều kiến trúc hiện đại bỏ hẳn dropout'],
            ['Weight decay', 'Phạt trọng số lớn, kéo mô hình về phía hàm trơn', '1e-2 với AdamW, 1e-4 với SGD', 'Trong Adam thường (không phải AdamW) nó bị trộn vào gradient và hoạt động không như kỳ vọng'],
            ['Batch norm', 'Chuẩn hoá đầu ra mỗi lớp theo thống kê của lô, giữ tín hiệu không trôi thang', 'Đặt sau Linear, trước hoặc sau kích hoạt (thử cả hai)', 'Vô dụng và có hại khi batch dưới 16; làm dự đoán phụ thuộc vào các mẫu khác cùng lô nếu quên eval()'],
            ['Early stopping', 'Dừng khi chỉ số trên tập kiểm định ngừng cải thiện sau N epoch', 'patience = 5–10 epoch, theo dõi PR-AUC chứ không theo dõi loss', 'Tập kiểm định PHẢI chia theo thời gian, nếu không bạn dừng dựa trên một con số bị rò rỉ'],
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Ba cái bẫy chỉ có trong bảo mật',
          md: '**1. Chia ngẫu nhiên để lấy tập kiểm định.** Early stopping dựa trên tập kiểm định bị rò rỉ thời gian sẽ dừng ở đúng điểm mô hình ghi nhớ tương lai tốt nhất. Bạn tự tay chọn ra mô hình tệ nhất cho thực tế. Xem lại t2-l6.\n\n**2. Theo dõi loss thay vì chỉ số nghiệp vụ.** Với mất cân bằng 1:500, loss có thể giảm đều trong khi PR-AUC đi ngang hoặc tụt. Hãy để early stopping theo dõi **PR-AUC** hoặc **recall tại FPR cố định** — thứ mà đội SOC thực sự quan tâm.\n\n**3. Chuẩn hoá đầu vào bằng thống kê của toàn bộ dữ liệu.** Tính trung bình và độ lệch chuẩn trên cả tập rồi mới chia train/test là rò rỉ. Phải tính trên tập huấn luyện rồi áp cùng con số đó cho tập kiểm tra — và lưu lại để dùng khi suy luận, nếu không bạn có training–serving skew.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Vòng huấn luyện PyTorch xử lý mất cân bằng 1:500 trên đặc trưng tệp PE.',
          code:
            'import numpy as np\n' +
            'import torch\n' +
            'import torch.nn as nn\n' +
            '\n' +
            'model = nn.Sequential(\n' +
            '    nn.Linear(2381, 512), nn.ReLU(), nn.BatchNorm1d(512), nn.Dropout(0.2),\n' +
            '    nn.Linear(512, 128), nn.ReLU(), nn.Dropout(0.2),\n' +
            '    nn.Linear(128, 1),                       # trả về LOGIT, không sigmoid\n' +
            ')\n' +
            '\n' +
            '# Khởi tạo bias lớp cuối theo tỉ lệ nền → loss đúng ngay từ bước 0\n' +
            'ti_le_duong = 0.002                          # 1 trên 500\n' +
            'model[-1].bias.data.fill_(float(np.log(ti_le_duong / (1 - ti_le_duong))))\n' +
            '\n' +
            '# pos_weight bù mất cân bằng mà không phải vứt bỏ mẫu âm\n' +
            'loss_fn = nn.BCEWithLogitsLoss(pos_weight=torch.tensor([500.0]))\n' +
            'opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)\n' +
            'sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=30)\n' +
            '\n' +
            'for epoch in range(30):\n' +
            '    model.train()\n' +
            '    for xb, yb in train_loader:              # train_loader chia THEO THỜI GIAN\n' +
            '        opt.zero_grad()\n' +
            '        loss = loss_fn(model(xb).squeeze(1), yb)\n' +
            '        loss.backward()\n' +
            '        nn.utils.clip_grad_norm_(model.parameters(), 1.0)   # chặn gradient nổ\n' +
            '        opt.step()\n' +
            '    sched.step()\n' +
            '    model.eval()                             # tắt dropout, đóng băng batch norm\n' +
            '    # ... đánh giá PR-AUC trên tập kiểm định của THÁNG SAU, không phải mẫu ngẫu nhiên\n',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Mẹo khởi tạo bias — nhỏ mà tiết kiệm nhiều epoch',
          md: 'Với tỉ lệ dương 0,2%, bias lớp cuối nên khởi tạo bằng `ln(0,002 / 0,998) ≈ -6,21`. Khi đó ngay ở bước 0, mô hình đã dự đoán đúng tỉ lệ nền và loss bắt đầu từ khoảng **0,0144** thay vì 0,693.\n\nNếu không làm vậy, mạng sẽ mất vài epoch đầu chỉ để học một việc tầm thường: "hầu hết mọi thứ đều lành". Mẹo này lấy từ danh sách kiểm tra huấn luyện mạng nơ-ron của Andrej Karpathy và nó đặc biệt hữu ích trong bảo mật, nơi tỉ lệ nền luôn cực lệch.',
        },
        {
          t: 'steps',
          title: 'Quy trình gỡ lỗi khi mạng không học — làm đúng thứ tự này',
          steps: [
            {
              title: 'Bước 1 — Kiểm tra loss ở bước 0',
              md: 'Với phân loại nhị phân cân bằng, loss ban đầu phải xấp xỉ `ln(2) = 0,693`. Với tỉ lệ dương `p`, loss ban đầu đúng phải là entropy của phân phối nhãn. Sai con số này nghĩa là đầu ra hoặc hàm mất mát đang bị nối sai — sửa trước khi làm bất cứ điều gì khác.',
            },
            {
              title: 'Bước 2 — Quá khớp một lô duy nhất',
              md: 'Lấy 32 mẫu, tắt hết dropout và weight decay, chạy 200 bước trên đúng 32 mẫu đó. Loss phải tiến về gần 0. **Nếu không, lỗi nằm trong mã của bạn** — nhãn lệch chỉ số, quên `zero_grad()`, hoặc gradient không chảy tới đâu đó. Đừng đụng tới siêu tham số cho tới khi qua được bước này.',
            },
            {
              title: 'Bước 3 — Kiểm tra thang của đầu vào',
              md: 'In `X.mean()` và `X.std()` từng cột. Nếu một cột có độ lệch chuẩn 10^6 (kích thước tệp tính bằng byte) nằm cạnh cột có độ lệch chuẩn 1 (entropy), gradient sẽ bị cột lớn chi phối hoàn toàn. Dùng `StandardScaler`, hoặc `log1p` cho các đại lượng có đuôi dài như kích thước và số lần xuất hiện.',
            },
            {
              title: 'Bước 4 — Quét tốc độ học',
              md: 'Thử `1e-2`, `1e-3`, `1e-4` trên 200 bước mỗi mức. Loss nổ hoặc dao động mạnh → giảm mười lần. Loss giảm quá chậm và đều tăm tắp → tăng ba lần. Đây gần như luôn là chỗ sửa được nhiều nhất với ít công nhất.',
            },
            {
              title: 'Bước 5 — Chỉ khi bốn bước trên đã sạch, mới thêm regularization',
              md: 'Bây giờ mới bật dropout, weight decay, augmentation. Trình tự này quan trọng: regularization giải quyết khoảng cách giữa loss huấn luyện và loss kiểm định. Nếu loss huấn luyện còn cao, bạn chưa có khoảng cách nào để thu hẹp — thêm regularization chỉ làm mọi thứ tệ hơn và che mất nguyên nhân thật.',
            },
            {
              title: 'Bước 6 — Loss ra NaN thì tìm theo thứ tự này',
              md: 'Một, tốc độ học quá cao (giảm mười lần và thử lại). Hai, `log(0)` do tự gọi sigmoid rồi dùng `BCELoss` — chuyển sang `BCEWithLogitsLoss`. Ba, dữ liệu đầu vào có `inf` hoặc `nan` (kiểm tra bằng `np.isfinite(X).all()`, rất hay xảy ra sau khi chia cho số byte bằng 0). Bốn, gradient nổ — thêm `clip_grad_norm_(params, 1.0)`.',
            },
          ],
        },
        {
          t: 'checklist',
          title: 'Danh sách kiểm tra trước khi bấm chạy 40 giờ GPU',
          items: [
            'Tập kiểm định đã chia theo mốc thời gian, không phải chia ngẫu nhiên',
            'Đã chạy được thử nghiệm quá khớp một lô 32 mẫu',
            'Bộ chuẩn hoá đầu vào được fit trên tập huấn luyện và đã lưu lại để dùng khi suy luận',
            'Early stopping theo dõi PR-AUC hoặc recall tại FPR cố định, không theo dõi loss',
            'Bias lớp cuối khởi tạo theo tỉ lệ nền',
            'Đã cố định seed và ghi lại phiên bản thư viện để chạy lại được kết quả',
            'Có ghi log tốc độ học, loss huấn luyện và loss kiểm định theo từng epoch',
            'Đã tính trước chi phí: số epoch × thời gian mỗi epoch × giá GPU theo giờ',
          ],
        },
        { t: 'terms', ids: ['gradient-descent', 'qua-khop', 'regularization', 'sieu-tham-so', 'mat-can-bang', 'training-serving-skew'] },
      ],
      keyTakeaways: [
        'Lan truyền ngược = phân bổ trách nhiệm ngược dây chuyền bằng quy tắc chuỗi. Không có gì huyền bí trong đó.',
        'Gradient co lại theo cấp số nhân qua các lớp: hệ số 0,2 qua 10 lớp còn 1 phần 10 triệu. ReLU, kết nối tắt và chuẩn hoá là ba thứ đã gỡ nút thắt này.',
        'AdamW lr=1e-3 là điểm xuất phát mặc định; tốc độ học là siêu tham số quan trọng hơn mọi thứ khác cộng lại.',
        'Loss đứng im ở 0,693 nghĩa là mô hình chưa học gì — nghi phạm là tốc độ học và thang đầu vào, không phải kiến trúc.',
        'Luôn chạy thử nghiệm quá khớp một lô 32 mẫu trước khi đổ lỗi cho dữ liệu.',
        'Quên model.eval() làm dự đoán của một tệp phụ thuộc vào các tệp cùng lô — lỗi im lặng và rất khó truy.',
        'Early stopping phải theo dõi chỉ số nghiệp vụ trên tập kiểm định chia theo thời gian, không theo dõi loss trên tập chia ngẫu nhiên.',
      ],
      cards: [
        {
          id: 't7l2-c1',
          front: 'Giải thích lan truyền ngược trong một câu, không dùng công thức.',
          back: 'Đi ngược từ đầu ra về đầu vào để phân bổ phần trách nhiệm của mỗi tham số cho sai số cuối cùng, bằng cách nhân dồn ảnh hưởng qua từng lớp (quy tắc chuỗi).',
          tags: ['huan-luyen', 'backpropagation'],
        },
        {
          id: 't7l2-c2',
          front: 'Loss ban đầu bằng 0,693 và không đổi sau 20 epoch. Hai nghi phạm đầu tiên là gì?',
          back: 'Tốc độ học sai thang, và đầu vào chưa được chuẩn hoá. 0,693 = ln(2), tức mô hình vẫn dự đoán 0,5 cho mọi mẫu.',
          tags: ['huan-luyen', 'go-loi'],
        },
        {
          id: 't7l2-c3',
          front: 'Phép thử đầu tiên khi mạng không học được là gì?',
          back: 'Bắt mô hình quá khớp hoàn toàn một lô 32 mẫu (tắt hết regularization). Không đạt được nghĩa là lỗi nằm trong mã, không nằm ở dữ liệu.',
          tags: ['huan-luyen', 'go-loi'],
        },
        {
          id: 't7l2-c4',
          front: 'Vì sao quên model.eval() lại nguy hiểm trong hệ thống phát hiện?',
          back: 'Dropout vẫn bật (cùng đầu vào ra hai kết quả khác nhau) và batch norm dùng thống kê của lô hiện tại — nên điểm số của một tệp phụ thuộc vào các tệp tình cờ nằm cùng lô.',
          tags: ['huan-luyen', 'batch-norm'],
        },
        {
          id: 't7l2-c5',
          front: 'Với tỉ lệ dương 1:500, nên khởi tạo bias lớp cuối bằng bao nhiêu và vì sao?',
          back: 'ln(0,002/0,998) ≈ -6,21. Khi đó mô hình bắt đầu từ đúng tỉ lệ nền, tiết kiệm vài epoch đầu chỉ để học rằng hầu hết mọi thứ đều lành.',
          tags: ['huan-luyen', 'mat-can-bang'],
        },
      ],
      quiz: [
        {
          id: 't7l2-q1',
          kind: 'mcq',
          tags: ['huan-luyen', 'go-loi'],
          q: 'Loss của bạn giảm đẹp trong 3 epoch rồi đột ngột thành `nan`. Thứ tự kiểm tra hợp lý nhất là gì?',
          options: [
            'Thêm nhiều lớp hơn để mô hình ổn định',
            'Giảm tốc độ học mười lần, kiểm tra có `log(0)` do dùng BCELoss sau sigmoid, kiểm tra `inf`/`nan` trong dữ liệu, rồi thêm gradient clipping',
            'Tăng batch size lên gấp mười',
            'Đổi từ AdamW sang SGD',
          ],
          answer: 1,
          why: 'NaN gần như luôn đến từ bốn nguồn, xếp theo tần suất: tốc độ học quá cao làm trọng số nổ; `log(0)` khi tự gọi sigmoid rồi dùng `BCELoss`; dữ liệu đầu vào chứa `inf` hoặc `nan` (rất hay gặp sau phép chia cho kích thước tệp bằng 0, hoặc `log` của giá trị 0); và gradient nổ trong mạng sâu. Kiểm tra theo thứ tự chi phí tăng dần — bốn thứ này mất tổng cộng khoảng 10 phút, còn đổi kiến trúc mất cả ngày.',
          distractorWhy: [
            'Thêm lớp làm gradient dễ nổ hơn chứ không ổn định hơn.',
            '',
            'Batch lớn hơn làm giảm nhiễu nhưng không sửa được nguyên nhân gốc; nếu tốc độ học đang quá cao thì nó vẫn nổ.',
            'Đổi optimizer có thể che triệu chứng một thời gian nhưng không tìm ra lỗi thật, và bạn sẽ gặp lại nó ở lần chạy sau.',
          ],
        },
        {
          id: 't7l2-q2',
          kind: 'multi',
          tags: ['huan-luyen', 'ro-ri-du-lieu'],
          q: 'Điều nào là RÒ RỈ DỮ LIỆU khi huấn luyện mạng nơ-ron trên dữ liệu bảo mật? (Chọn tất cả đáp án đúng)',
          options: [
            'Tính trung bình và độ lệch chuẩn để chuẩn hoá trên toàn bộ dữ liệu rồi mới chia train/test',
            'Dùng early stopping trên tập kiểm định được chia ngẫu nhiên từ cùng khoảng thời gian với tập huấn luyện',
            'Khởi tạo bias lớp cuối theo tỉ lệ dương của tập huấn luyện',
            'Chọn số epoch tốt nhất bằng cách nhìn vào kết quả trên tập kiểm tra cuối cùng',
          ],
          answers: [0, 1, 3],
          why: 'Ba dạng rò rỉ này đều tinh vi hơn dạng kinh điển. **(1)** Thống kê chuẩn hoá mang thông tin của tập kiểm tra vào tập huấn luyện. **(2)** Chia ngẫu nhiên trong bảo mật nghĩa là tập kiểm định chứa các biến thể cùng chiến dịch với tập huấn luyện — early stopping sẽ chọn đúng điểm mô hình ghi nhớ giỏi nhất. **(4)** Dùng tập kiểm tra để chọn siêu tham số biến nó thành tập kiểm định; con số bạn báo cáo sẽ lạc quan một cách có hệ thống. Phương án 3 hoàn toàn hợp lệ vì nó chỉ dùng thông tin của tập huấn luyện.',
        },
        {
          id: 't7l2-q3',
          kind: 'order',
          tags: ['huan-luyen', 'go-loi'],
          q: 'Sắp xếp quy trình gỡ lỗi khi mạng nơ-ron không học được, theo thứ tự chi phí tăng dần.',
          items: [
            'Kiểm tra loss ở bước 0 có khớp với entropy của phân phối nhãn không',
            'Bắt mô hình quá khớp một lô 32 mẫu với regularization tắt hết',
            'Kiểm tra trung bình và độ lệch chuẩn của từng cột đầu vào',
            'Quét tốc độ học qua ba bậc độ lớn',
            'Bật lại dropout và weight decay rồi tinh chỉnh',
          ],
          why: 'Nguyên tắc là **loại trừ lỗi mã trước khi tinh chỉnh siêu tham số**. Bốn bước đầu tổng cộng mất khoảng 20 phút và loại được 80% nguyên nhân. Đảo ngược thứ tự này là cách phổ biến nhất để đốt một tuần: người ta chỉnh kiến trúc và regularization trong khi lỗi thật chỉ là một cột đặc trưng chưa `log1p`.',
        },
        {
          id: 't7l2-q4',
          kind: 'mcq',
          tags: ['huan-luyen', 'mat-can-bang'],
          q: 'Tỉ lệ dương 1:500, batch size 32. Khoảng bao nhiêu phần trăm số lô KHÔNG chứa mẫu dương nào?',
          options: ['Khoảng 6%', 'Khoảng 50%', 'Khoảng 94%', 'Khoảng 99,8%'],
          answer: 2,
          why: 'Xác suất một mẫu là âm bằng 0,998; xác suất cả 32 mẫu đều âm bằng 0,998 mũ 32 ≈ 0,94, tức **khoảng 94% số lô hoàn toàn không có tín hiệu dương**. Mô hình dành phần lớn thời gian học rằng mọi thứ đều lành. Hai cách chữa: lấy mẫu theo lớp để mỗi lô có ít nhất vài mẫu dương, hoặc dùng `pos_weight` trong `BCEWithLogitsLoss` để mỗi mẫu dương hiếm hoi đóng góp mạnh hơn. Cách thứ hai thường an toàn hơn vì không làm méo phân phối.',
          distractorWhy: [
            'Đây là xác suất lô CÓ chứa ít nhất một mẫu dương, tức phần bù.',
            'Con số này ứng với tỉ lệ dương khoảng 1:45, không phải 1:500.',
            '',
            'Con số này ứng với batch size khoảng 1, không phải 32.',
          ],
        },
        {
          id: 't7l2-q5',
          kind: 'truefalse',
          tags: ['huan-luyen', 'regularization'],
          q: 'Khi loss trên tập huấn luyện còn cao và chưa giảm được nữa, thêm dropout là bước hợp lý tiếp theo.',
          answer: false,
          why: 'Ngược hoàn toàn. Dropout và mọi regularization khác tồn tại để thu hẹp **khoảng cách** giữa loss huấn luyện và loss kiểm định. Nếu loss huấn luyện còn cao, bạn đang **thiếu khớp** — chưa có khoảng cách nào để thu hẹp, và thêm regularization sẽ làm mô hình yếu hơn nữa. Đúng thứ tự: khớp được tập huấn luyện trước (tăng dung lượng, sửa tốc độ học, sửa chuẩn hoá), rồi mới chống quá khớp sau.',
        },
      ],
      terms: ['gradient-descent', 'qua-khop', 'regularization', 'sieu-tham-so', 'mat-can-bang', 'training-serving-skew'],
      further: [
        {
          title: 'A Recipe for Training Neural Networks — Andrej Karpathy (2019)',
          note: 'Bài viết ngắn, thực dụng, gần như mọi kỹ sư ML đều đọc lại nó mỗi khi bị kẹt. Nguồn gốc của quy trình gỡ lỗi sáu bước trong bài này.',
        },
        {
          title: 'Deep Learning — Goodfellow, Bengio & Courville, chương 6–8',
          note: 'Xử lý chặt chẽ phần lan truyền ngược và tối ưu hoá. Đọc khi bạn muốn nền toán vững chứ không chỉ trực giác.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't7-l3',
      trackId: 'deep-learning',
      title: 'CNN trên byte thô và ảnh hoá mã độc',
      subtitle: 'Cho mạng ăn cả tệp EXE — ý tưởng đẹp, và cái giá rất thật',
      minutes: 24,
      practiceMinutes: 3,
      level: 'nang-cao',
      prereqs: ['t7-l2', 't5-l3', 't6-l2'],
      why: {
        short:
          'Ý tưởng bỏ qua toàn bộ kỹ thuật đặc trưng và cho mạng đọc thẳng byte của tệp nghe rất hấp dẫn — bạn cần biết nó hoạt động tới đâu, hỏng ở chỗ nào, và vì sao nó dễ bị lật nhãn bằng vài kilobyte rác.',
        scenario:
          'Một nhà cung cấp trình bày rằng công cụ của họ dùng deep learning trên byte thô nên "không cần cập nhật chữ ký và bắt được cả mã độc chưa từng thấy". Bạn có bộ mẫu nội bộ và một buổi chiều để kiểm chứng. Bạn cần biết phải thử phép tấn công nào.',
        roles: ['Malware Analyst', 'Security Data Scientist', 'Detection Engineer', 'Red Teamer'],
        costOfNotKnowing:
          'Bạn triển khai một mô hình có AUC 0,998 trong phòng lab và bị né bằng cách chèn 4 KB byte vô hại vào cuối tệp — một thao tác mà công cụ mã nguồn mở làm tự động trong vài giây.',
      },
      objectives: [
        'Mô tả kiến trúc MalConv và giải thích vì sao nó dùng bước nhảy (stride) rất lớn',
        'So sánh ba cách biểu diễn một tệp PE: đặc trưng thủ công, byte thô, và ảnh hoá',
        'Giải thích vì sao global max pooling khiến mô hình đặc biệt dễ bị chèn byte',
        'Ước lượng chi phí huấn luyện và suy luận của CNN byte so với GBDT trên cùng dữ liệu',
        'Thiết kế một phép thử né tránh đơn giản để kiểm chứng lời quảng cáo của nhà cung cấp',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Ở chặng 5 bạn đã bỏ nhiều công trích xuất đặc trưng từ tệp PE: bảng imports, section, entropy từng phần, tài nguyên, chữ ký số. Công việc đó cần người biết định dạng PE, và nó **gãy khi tệp bị packer làm rối** — trình phân tích không đọc nổi cấu trúc thì không có đặc trưng nào cả.',
        },
        {
          t: 'p',
          md: 'Năm 2018, Raff và cộng sự đặt một câu hỏi thẳng thừng trong bài báo có tên rất đúng tinh thần: *Malware Detection by Eating a Whole EXE*. Nếu ta bỏ qua toàn bộ chuyện phân tích cú pháp và cho mạng ăn nguyên chuỗi byte thì sao?',
        },
        { t: 'h', text: 'MalConv: kiến trúc và những ràng buộc đã tạo ra nó', level: 2 },
        {
          t: 'steps',
          title: 'Đọc kiến trúc MalConv như đọc một chuỗi quyết định kỹ thuật',
          steps: [
            {
              title: 'Đầu vào: 2 triệu byte, cắt hoặc đệm',
              md: 'Mỗi byte là một số nguyên 0–255. Tệp dài hơn 2 MB bị cắt, ngắn hơn thì đệm. Ngay ở đây đã có một lỗ hổng lộ ra: **mọi thứ sau mốc 2 MB đều vô hình với mô hình**. Kẻ tấn công biết điều đó sẽ đẩy phần độc hại ra sau mốc này.',
            },
            {
              title: 'Embedding 8 chiều thay vì one-hot 256 chiều',
              md: 'Byte không phải số có thứ tự — byte `0x41` không "lớn hơn" hay "gần" byte `0x40` về mặt ngữ nghĩa, dù giá trị số học chỉ hơn 1. Nên không thể đưa thẳng giá trị byte vào mạng. Giải pháp: một bảng tra `Embedding(256, 8)` để mạng **tự học** vector 8 chiều cho từng giá trị byte. Đây là cùng ý tưởng embedding bạn đã gặp ở t5-l6, chỉ khác là từ vựng chỉ có 256 phần tử.',
            },
            {
              title: 'Tích chập cửa sổ 500, bước nhảy 500',
              md: 'Vì sao bước nhảy lớn bằng đúng cửa sổ, tức là các cửa sổ **không chồng lên nhau**? Vì tính toán. Chuỗi 2 triệu bước với stride 1 tạo ra 2 triệu vị trí cần tính cho mỗi bộ lọc; với stride 500 chỉ còn 4.000. Đây là một đánh đổi lộ liễu: bạn mất khả năng phát hiện mẫu byte nằm vắt qua ranh giới cửa sổ, đổi lấy khả năng huấn luyện được trong đời này.',
            },
            {
              title: 'Cơ chế cổng: hai nhánh tích chập nhân với nhau',
              md: 'Một nhánh cho ra "nội dung", nhánh kia qua sigmoid cho ra "mức độ quan tâm" trong khoảng 0–1, rồi nhân từng phần tử. Kết quả: mạng học được cách **tự tắt** những vùng byte nó cho là không liên quan. Ý tưởng mượn từ mô hình ngôn ngữ tích chập có cổng, và nó giúp huấn luyện ổn định hơn hẳn so với tích chập trần.',
            },
            {
              title: 'Global max pooling: bước quyết định, và cũng là điểm yếu chí mạng',
              md: 'Với mỗi bộ lọc trong 128 bộ lọc, mạng chỉ giữ lại **giá trị lớn nhất trên toàn bộ tệp** rồi vứt phần còn lại. Lợi ích: mô hình trở nên bất biến với vị trí — đoạn mã độc nằm ở đầu hay cuối tệp đều được. Thiệt hại: quyết định cuối cùng chỉ dựa vào **128 vị trí** trong 2 triệu byte, và bạn sẽ thấy ở phần sau vì sao đó là món quà cho kẻ tấn công.',
            },
          ],
        },
        { t: 'figure', id: 'fig-cnn-bytes', caption: 'CNN quét chuỗi byte của tệp thực thi: embedding từng byte, tích chập cửa sổ lớn, rồi max pooling toàn cục giữ lại giá trị cao nhất của mỗi bộ lọc.' },
        {
          t: 'code',
          lang: 'python',
          caption: 'MalConv rút gọn — đủ để thấy toàn bộ ý tưởng nằm trong 15 dòng.',
          collapsed: true,
          code:
            'import torch\n' +
            'import torch.nn as nn\n' +
            '\n' +
            'class MalConvNho(nn.Module):\n' +
            '    def __init__(self, emb=8, ch=128, k=500):\n' +
            '        super().__init__()\n' +
            '        self.emb  = nn.Embedding(257, emb, padding_idx=256)   # 256 giá trị byte + 1 ô đệm\n' +
            '        self.conv = nn.Conv1d(emb, ch, kernel_size=k, stride=k)\n' +
            '        self.gate = nn.Conv1d(emb, ch, kernel_size=k, stride=k)\n' +
            '        self.fc   = nn.Linear(ch, 1)\n' +
            '\n' +
            '    def forward(self, x):                      # x: (B, L) số nguyên 0..256\n' +
            '        e = self.emb(x).transpose(1, 2)        # (B, emb, L)\n' +
            '        h = self.conv(e) * torch.sigmoid(self.gate(e))   # cơ chế cổng\n' +
            '        h = torch.max(h, dim=2).values         # global max pooling: giữ 1 vị trí/bộ lọc\n' +
            '        return self.fc(h).squeeze(1)           # logit\n',
        },
        {
          t: 'predict',
          question:
            'MalConv đạt ROC-AUC rất cao trên EMBER. Theo bạn, khi người ta dùng kỹ thuật quy trách nhiệm (attribution) để hỏi "mô hình nhìn vào vùng byte nào của tệp để quyết định", câu trả lời là vùng nào? Đoạn mã thực thi trong section `.text`? Bảng imports? Hay chỗ khác?',
          reveal:
            'Câu trả lời khiến nhiều người khó chịu: phần lớn trách nhiệm rơi vào **vùng header ở đầu tệp** — cụ thể là DOS header và các byte đệm quanh nó — chứ không phải đoạn mã thực thi.\n\nDemetrio, Biggio và cộng sự (2019) trong *Explaining Vulnerabilities of Deep Learning to Adversarial Malware Binaries* dùng integrated gradients để chỉ ra điều này, và hệ quả rất trực tiếp: mô hình đã học các **tạo tác của trình biên dịch và trình đóng gói** trong header, chứ không học hành vi độc hại.\n\nVì sao chuyện này quan trọng đến vậy? Vì header là phần **rẻ nhất để sửa**. Nhiều byte trong DOS header hoàn toàn không được hệ điều hành dùng tới — bạn ghi đè chúng, tệp vẫn chạy y nguyên, mà điểm số của mô hình đã đổi. Nhớ lại nguyên tắc chọn đặc trưng ở t5-l1: **đặc trưng tốt là đặc trưng mà kẻ tấn công phải trả giá cao mới đổi được.** Ở đây mạng đã tự chọn cho mình đúng loại đặc trưng rẻ tiền nhất, và không ai kịp ngăn nó.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Vì sao global max pooling là món quà cho kẻ tấn công',
          md: 'Sau max pooling, quyết định của mô hình chỉ phụ thuộc vào **128 giá trị lớn nhất** — mỗi bộ lọc một giá trị, tại một vị trí duy nhất trong 2 triệu byte.\n\nKẻ tấn công chỉ cần tạo ra ở một chỗ vô hại nào đó (phần đệm cuối tệp, khoảng trống giữa các section, vùng header không dùng) một đoạn byte làm bộ lọc kích hoạt **cao hơn** giá trị hiện tại. Khi đó max pooling sẽ chọn đoạn byte mới đó và **vứt bỏ hoàn toàn** vị trí thật sự chứa dấu hiệu độc hại. Mã độc không bị sửa một byte nào trong phần thực thi, vẫn chạy y nguyên, nhưng mô hình đã mù.\n\nKolosnjaji và cộng sự (2018) cho thấy chỉ cần chèn thêm một lượng byte rất nhỏ so với kích thước tệp vào phần đệm là đủ lật nhãn cho một tỉ lệ lớn mẫu thử. Thư viện mã nguồn mở `secml-malware` đóng gói sẵn các phép tấn công này, và cuộc thi Machine Learning Security Evasion Competition (chạy từ 2019) là nơi chúng được đem ra dùng công khai hằng năm.',
        },
        { t: 'h', text: 'Ảnh hoá nhị phân: biến tệp thành ảnh xám', level: 2 },
        {
          t: 'p',
          md: 'Hướng thứ hai, có trước MalConv: Nataraj và cộng sự (2011) đề xuất đọc tệp nhị phân theo từng byte, coi mỗi byte là một mức xám 0–255, xếp thành hàng có chiều rộng cố định, và thu được một **ảnh xám**. Sau đó dùng thẳng bộ máy thị giác máy tính — ban đầu là đặc trưng GIST với k-NN, ngày nay là fine-tune một mạng ResNet đã huấn luyện sẵn trên ImageNet.',
        },
        {
          t: 'p',
          md: 'Ưu điểm rất thật: bạn tái sử dụng được toàn bộ hạ tầng và trọng số pretrain của thị giác máy tính, và các họ mã độc thường tạo ra hoa văn nhìn bằng mắt cũng phân biệt được — vùng mã nén có nhiễu hạt mịn, vùng dữ liệu lặp có sọc đều, vùng chuỗi văn bản có vân dọc đặc trưng.',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Ba giả định của ảnh hoá đều sai về mặt vật lý',
          md: '**Một — hàng xóm hai chiều là bịa.** Trong ảnh thật, hai pixel cạnh nhau theo chiều dọc là hai điểm gần nhau trong thế giới. Trong tệp nhị phân, hai byte "cạnh nhau theo chiều dọc" chỉ là hai byte cách nhau đúng bằng chiều rộng ảnh mà bạn tự chọn. Bộ lọc tích chập 2D đang tìm cấu trúc không tồn tại.\n\n**Hai — resize phá dữ liệu.** Để đưa vào ResNet, ảnh bị co về 224×224. Một tệp 8 MB bị nén xuống 50.176 pixel, tức mỗi pixel là trung bình của khoảng 160 byte. Nội dung chính xác của lệnh máy biến mất hoàn toàn; chỉ còn lại kết cấu thống kê thô.\n\n**Ba — kích thước tệp rò rỉ vào nhãn.** Nếu chiều rộng ảnh được chọn theo kích thước tệp (cách làm phổ biến), mô hình có thể học nhận diện họ mã độc qua kích thước tệp chứ không qua nội dung. Đây đúng là dạng tương quan giả đã kể ở t0-l1, chỉ mặc áo mới.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't7l3-cp1',
              kind: 'mcq',
              tags: ['cnn-byte', 'doi-khang'],
              q: 'Vì sao chèn byte vào phần đệm cuối tệp lại lật được nhãn của MalConv, trong khi cùng thao tác đó gần như vô hại với mô hình LightGBM trên đặc trưng PE?',
              options: [
                'Vì LightGBM có nhiều tham số hơn nên khó tấn công hơn',
                'Vì global max pooling khiến quyết định chỉ dựa vào một vị trí cho mỗi bộ lọc, nên một vùng byte mới có kích hoạt cao sẽ thay thế vùng thật',
                'Vì LightGBM không đọc phần cuối tệp',
                'Vì MalConv chỉ đọc 2 MB đầu tiên',
              ],
              answer: 1,
              why: 'Cơ chế nằm ở max pooling. Đặc trưng thủ công như "số lượng imports", "entropy của section .text", "tệp có chữ ký số không" **không đổi** khi bạn thêm byte rác vào cuối — bạn phải sửa cấu trúc thật của tệp mới đổi được chúng, và đó là việc đắt. Ngược lại, giá trị max của một bộ lọc CNN chỉ cần một vị trí duy nhất vượt qua là đổi ngay. Đây không phải chuyện mô hình nào "mạnh hơn" mà là chuyện **đặc trưng nào đắt để giả mạo**.',
              distractorWhy: [
                'Số tham số không liên quan tới độ bền đối kháng; nhiều tham số thường còn tạo thêm bề mặt tấn công.',
                '',
                'LightGBM đọc đặc trưng trích từ toàn bộ tệp; vấn đề là các đặc trưng đó không nhạy với byte rác thêm vào.',
                'Đúng là MalConv chỉ đọc 2 MB đầu, nhưng phép tấn công chèn byte vẫn hiệu quả với tệp nhỏ hơn 2 MB — nên đó không phải nguyên nhân.',
              ],
            },
          ],
        },
        { t: 'h', text: 'Con số: byte thô so với đặc trưng thủ công', level: 2 },
        {
          t: 'table',
          head: ['Tiêu chí', 'LightGBM trên 2.381 đặc trưng EMBER', 'MalConv trên byte thô'],
          rows: [
            ['ROC-AUC trên EMBER 2017 (báo cáo trong bài báo EMBER)', 'khoảng 0,999', 'khoảng 0,998'],
            ['Phần cứng huấn luyện', 'CPU nhiều lõi', 'GPU, bắt buộc'],
            ['Thời gian huấn luyện', 'cỡ chục phút', 'cỡ hàng chục giờ tới hàng ngày'],
            ['Chi phí trích xuất đặc trưng', 'Phải parse PE (gãy khi bị làm rối nặng)', 'Không cần parse — đọc thẳng byte'],
            ['Suy luận trên một tệp', 'cỡ dưới một mili giây trên một lõi CPU', 'cỡ vài chục mili giây, cần GPU để đạt thông lượng'],
            ['Giải thích cho analyst', 'TreeSHAP chính xác, ra tên đặc trưng đọc được', 'Bản đồ nổi bật trên chuỗi byte, khó diễn giải'],
            ['Bền trước chèn byte vào phần đệm', 'Gần như không đổi', 'Rất dễ bị lật nhãn'],
            ['Bắt được tệp bị packer làm rối', 'Kém khi không parse được cấu trúc', 'Vẫn đọc được byte, nhưng thường chỉ học ra dấu vết của packer'],
          ],
          caption: 'Chênh lệch chất lượng nhỏ, chênh lệch chi phí và rủi ro lớn. Các con số thời gian là bậc độ lớn để bạn định hướng — hãy đo trên phần cứng của chính bạn trước khi trích dẫn.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Đọc bảng trên cho đúng',
          md: 'Đừng rút ra kết luận "CNN byte là vô dụng". Kết luận đúng là: **nó đắt hơn nhiều để đổi lấy một cải thiện nhỏ, và nó mua thêm một lớp rủi ro đối kháng mới.**\n\nCó những tình huống nó vẫn thắng: khi bạn phải xử lý định dạng tệp mà không ai viết trình phân tích (firmware, tài liệu định dạng lạ, tệp bị hỏng cấu trúc), hoặc khi bạn muốn một tín hiệu **độc lập** với hệ đặc trưng thủ công để xếp tầng. Một mô hình byte chạy song song và bỏ phiếu cùng GBDT có giá trị đúng ở chỗ nó sai theo kiểu **khác** — kẻ tấn công phải né hai hệ đặc trưng có bản chất khác nhau cùng lúc.',
        },
        {
          t: 'compare',
          title: 'Hai đường đi từ tệp PE tới điểm số',
          left: {
            title: 'Đặc trưng thủ công (chặng 5)',
            icon: 'wrench',
            items: [
              'Cần người hiểu định dạng PE và cập nhật khi định dạng biến động',
              'Gãy khi trình phân tích không đọc được tệp bị làm rối nặng',
              'Đặc trưng có tên, giải thích được cho analyst và kiểm toán',
              'Kẻ tấn công phải sửa cấu trúc thật để né — đắt',
              'Huấn luyện trong vài phút CPU, triển khai ở mọi nơi',
            ],
          },
          right: {
            title: 'Byte thô (bài này)',
            icon: 'dna',
            items: [
              'Không cần tri thức miền để bắt đầu, chỉ cần dữ liệu và GPU',
              'Vẫn chạy trên tệp mà trình phân tích bó tay',
              'Quyết định khó diễn giải; bản đồ nổi bật không ổn định',
              'Kẻ tấn công né bằng cách chèn byte vô hại — rẻ',
              'Huấn luyện hàng chục giờ GPU, suy luận đắt hơn hàng chục lần',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Xử lý mẫu mã độc thật — nhắc lại vì đây là bài có nhiều người tự thử nghiệm',
          md: 'Nếu bạn tải EMBER hay bất kỳ kho mẫu nào để thực hành: **chỉ làm việc với đặc trưng đã trích xuất hoặc mẫu đã vô hiệu hoá**, trong máy ảo tách mạng, không có thư mục chia sẻ với máy chủ. Nhiều bộ dữ liệu công khai phân phối mẫu dưới dạng đã cắt header hoặc đã mã hoá bằng mật khẩu chính vì lý do này. Sao chép nhầm một tệp EXE thật sang máy làm việc là cách kết thúc sự nghiệp nhanh nhất trong ngành.',
        },
        {
          t: 'checklist',
          title: 'Kiểm chứng lời quảng cáo "deep learning trên byte thô" trong một buổi chiều',
          items: [
            'Lấy 100 mẫu độc hại mà công cụ đó phát hiện đúng, ghi lại điểm số gốc',
            'Chèn 4 KB byte ngẫu nhiên vào cuối tệp (không sửa gì bên trong), chấm lại, đếm số mẫu tụt xuống dưới ngưỡng',
            'Ghi đè các byte không dùng trong DOS header, chấm lại lần nữa',
            'Đóng gói lại một mẫu bằng packer phổ biến, xem điểm đổi thế nào',
            'Hỏi nhà cung cấp: mô hình đọc tối đa bao nhiêu byte của tệp, và điều gì xảy ra với phần vượt quá',
            'Hỏi tiếp: khi mô hình cảnh báo, analyst nhìn thấy vùng byte nào để điều tra',
          ],
        },
        { t: 'terms', ids: ['cnn', 'pe', 'ember', 'entropy', 'mau-doi-khang', 'ne-tranh'] },
      ],
      keyTakeaways: [
        'MalConv đọc thẳng 2 triệu byte đầu của tệp: embedding 8 chiều cho từng byte, tích chập cửa sổ 500 bước nhảy 500, cơ chế cổng, rồi global max pooling.',
        'Bước nhảy lớn và giới hạn 2 MB là đánh đổi vì tính toán — và cả hai đều mở ra chỗ để né.',
        'Kỹ thuật quy trách nhiệm cho thấy MalConv phụ thuộc nhiều vào vùng header, tức là học tạo tác của trình biên dịch chứ không học hành vi độc hại.',
        'Global max pooling khiến quyết định chỉ dựa vào một vị trí mỗi bộ lọc, nên chèn byte vô hại vào phần đệm là đủ lật nhãn.',
        'Ảnh hoá nhị phân tái dùng được hạ tầng thị giác máy tính, nhưng ba giả định của nó (hàng xóm 2D, resize, chiều rộng theo kích thước tệp) đều không có cơ sở vật lý.',
        'Trên EMBER, byte thô kém GBDT một chút về AUC nhưng đắt hơn hàng chục lần và kém bền đối kháng hơn nhiều.',
        'Giá trị thật của mô hình byte là làm tầng bổ sung sai theo kiểu KHÁC với GBDT, không phải thay thế nó.',
      ],
      cards: [
        {
          id: 't7l3-c1',
          front: 'Vì sao MalConv dùng bước nhảy (stride) bằng đúng kích thước cửa sổ (500)?',
          back: 'Vì chi phí tính toán: chuỗi 2 triệu byte với stride 1 là bất khả thi. Đánh đổi là mất khả năng bắt mẫu byte nằm vắt qua ranh giới cửa sổ.',
          tags: ['cnn-byte'],
        },
        {
          id: 't7l3-c2',
          front: 'Vì sao global max pooling khiến CNN byte đặc biệt dễ bị chèn byte?',
          back: 'Vì quyết định chỉ dựa vào một vị trí cho mỗi bộ lọc. Tạo một vùng byte vô hại có kích hoạt cao hơn là max pooling sẽ chọn nó và vứt bỏ vị trí chứa dấu hiệu thật.',
          hint: 'Nghĩ xem sau pooling còn lại bao nhiêu con số trong 2 triệu byte.',
          tags: ['cnn-byte', 'doi-khang'],
        },
        {
          id: 't7l3-c3',
          front: 'Vì sao không đưa thẳng giá trị byte 0–255 vào mạng mà phải qua embedding?',
          back: 'Vì byte là ký hiệu, không phải đại lượng có thứ tự — 0x41 không "gần" 0x40 về ngữ nghĩa. Embedding để mạng tự học quan hệ giữa các giá trị byte.',
          tags: ['cnn-byte', 'embedding'],
        },
        {
          id: 't7l3-c4',
          front: 'Nêu ba giả định sai của phương pháp ảnh hoá tệp nhị phân.',
          back: 'Hàng xóm theo chiều dọc là bịa (do chiều rộng tự chọn); resize về 224x224 phá nội dung lệnh máy; chiều rộng chọn theo kích thước tệp làm rò rỉ kích thước vào nhãn.',
          tags: ['cnn-byte', 'tuong-quan-gia'],
        },
        {
          id: 't7l3-c5',
          front: 'Khi nào mô hình byte thô vẫn đáng dùng dù kém GBDT về chi phí?',
          back: 'Khi không có trình phân tích cho định dạng (firmware, tệp hỏng cấu trúc), hoặc khi cần một tín hiệu độc lập để xếp tầng — nó sai theo kiểu khác GBDT.',
          tags: ['cnn-byte', 'thuc-chien'],
        },
      ],
      quiz: [
        {
          id: 't7l3-q1',
          kind: 'mcq',
          tags: ['cnn-byte', 'ne-tranh'],
          q: 'Bạn kiểm chứng một sản phẩm quảng cáo "deep learning trên byte thô". Phép thử nào cho nhiều thông tin nhất trong thời gian ngắn nhất?',
          options: [
            'Chạy lại bộ mẫu chuẩn và so AUC với con số nhà cung cấp công bố',
            'Chèn vài KB byte ngẫu nhiên vào phần đệm cuối các mẫu đã bị phát hiện, rồi đếm bao nhiêu mẫu tụt xuống dưới ngưỡng',
            'Yêu cầu nhà cung cấp cung cấp kiến trúc mạng chi tiết',
            'So sánh thời gian suy luận với sản phẩm cạnh tranh',
          ],
          answer: 1,
          why: 'Phép thử chèn byte mất khoảng 20 dòng script và trả lời đúng câu hỏi quan trọng nhất: **mô hình có phụ thuộc vào đặc trưng rẻ tiền để giả mạo hay không.** Một mô hình byte có global max pooling mà không được huấn luyện đối kháng thường tụt rất mạnh ở phép thử này. AUC trên bộ mẫu chuẩn không nói gì về độ bền, vì bộ mẫu chuẩn không chứa mẫu đã bị chỉnh sửa để né.',
          distractorWhy: [
            'AUC trên dữ liệu tĩnh đo năng lực trong môi trường không đối kháng — đúng thứ mà thực tế không phải.',
            '',
            'Kiến trúc chi tiết hữu ích nhưng nhà cung cấp thường từ chối, và bạn vẫn phải đo bằng thực nghiệm.',
            'Thời gian suy luận là tiêu chí vận hành quan trọng nhưng không trả lời được câu hỏi về độ bền phát hiện.',
          ],
        },
        {
          id: 't7l3-q2',
          kind: 'truefalse',
          tags: ['cnn-byte'],
          q: 'Vì MalConv đọc byte thô nên nó miễn nhiễm với việc tệp bị packer làm rối.',
          answer: false,
          why: 'Nó vẫn **đọc được** tệp bị làm rối, đó là điểm mạnh thật so với đặc trưng cần parse. Nhưng "đọc được" khác "hiểu được": nội dung thật đã bị nén và mã hoá, nên thứ duy nhất còn lại để học là **dấu vết của chính packer** — cùng đúng cái bẫy UPX đã kể ở t0-l1. Kết quả là mô hình có xu hướng phân loại theo "tệp này được đóng gói bằng công cụ nào" chứ không theo "tệp này làm gì". Mã độc dùng packer thương mại hợp pháp sẽ lọt, còn phần mềm lành tính dùng packer để chống sao chép sẽ bị báo nhầm.',
        },
        {
          id: 't7l3-q3',
          kind: 'match',
          tags: ['cnn-byte'],
          q: 'Nối mỗi thành phần của MalConv với lý do kỹ thuật khiến nó tồn tại.',
          pairs: [
            ['Embedding 8 chiều cho byte', 'Byte là ký hiệu, không phải đại lượng có thứ tự'],
            ['Bước nhảy 500 bằng kích thước cửa sổ', 'Chuỗi 2 triệu bước không thể tính với stride 1'],
            ['Cơ chế cổng nhân hai nhánh', 'Cho mạng tự tắt các vùng byte không liên quan'],
            ['Global max pooling', 'Làm mô hình bất biến với vị trí của đoạn mã trong tệp'],
          ],
          why: 'Mỗi lựa chọn kiến trúc là câu trả lời cho một ràng buộc cụ thể — và mỗi câu trả lời đều kèm một cái giá. Bước nhảy lớn đánh đổi độ phân giải; max pooling đánh đổi độ bền đối kháng để lấy tính bất biến vị trí. Đọc kiến trúc theo kiểu "ràng buộc nào sinh ra lựa chọn này, và cái giá là gì" là cách duy nhất để đánh giá một mô hình mà bạn chưa từng gặp.',
        },
        {
          id: 't7l3-q4',
          kind: 'mcq',
          tags: ['cnn-byte', 'thuc-chien'],
          q: 'Đội bạn đang chạy LightGBM trên đặc trưng EMBER với PR-AUC tốt. Cách dùng mô hình byte thô hợp lý nhất là gì?',
          options: [
            'Thay thế LightGBM để loại bỏ hoàn toàn khâu trích xuất đặc trưng',
            'Chạy song song như một tín hiệu độc lập, kết hợp điểm số, và ưu tiên nó cho các tệp mà trình phân tích PE không đọc được',
            'Dùng nó để sinh nhãn tự động cho dữ liệu chưa gắn nhãn',
            'Không dùng, vì nó đã được chứng minh là kém hơn',
          ],
          answer: 1,
          why: 'Giá trị của mô hình thứ hai nằm ở chỗ nó **sai theo kiểu khác**. Kẻ tấn công né đặc trưng PE bằng cách sửa cấu trúc; né mô hình byte bằng cách chèn byte. Hai thao tác này không giống nhau, nên phải làm cả hai mới lọt qua cả hệ — chi phí né tăng lên đáng kể. Thêm nữa, các tệp mà trình phân tích bó tay chính là vùng mù của hệ thống hiện tại, và đó là chỗ mô hình byte đóng góp rõ nhất. Phương án 3 nguy hiểm: dùng mô hình để tự gắn nhãn sẽ khuếch đại chính thiên lệch của nó, tạo vòng lặp phản hồi khép kín.',
          distractorWhy: [
            'Thay thế làm mất khả năng giải thích, tăng chi phí hạ tầng, và đổi một điểm yếu đã hiểu rõ lấy một điểm yếu chưa hiểu.',
            '',
            'Tự gắn nhãn bằng chính mô hình tạo vòng lặp phản hồi: mọi điểm mù của mô hình trở thành điểm mù vĩnh viễn của dữ liệu.',
            'Kết luận này quá mạnh — nó có vùng dùng hợp lệ, chỉ là vùng đó hẹp hơn quảng cáo nhiều.',
          ],
        },
      ],
      terms: ['cnn', 'pe', 'ember', 'entropy', 'mau-doi-khang', 'ne-tranh'],
      further: [
        {
          title: 'Malware Detection by Eating a Whole EXE — Raff và cộng sự (2018)',
          note: 'Bài báo gốc của MalConv. Đọc phần thảo luận về ràng buộc bộ nhớ để hiểu vì sao kiến trúc trông kỳ quặc như vậy.',
        },
        {
          title: 'Explaining Vulnerabilities of Deep Learning to Adversarial Malware Binaries — Demetrio, Biggio và cộng sự (2019)',
          note: 'Chỉ ra MalConv phụ thuộc vào vùng header. Bài học phương pháp luận quan trọng hơn kết quả: luôn hỏi mô hình đang nhìn vào đâu.',
        },
        {
          title: 'EMBER: An Open Dataset for Training Static PE Malware Machine Learning Models — Anderson & Roth (2018)',
          note: 'Nguồn của các con số so sánh trong bài. Bộ dữ liệu và mã trích xuất đặc trưng đều công khai, dùng được ngay để thực hành.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't7-l4',
      trackId: 'deep-learning',
      title: 'Mô hình chuỗi: RNN, LSTM, Transformer',
      subtitle: 'Khi thứ tự chính là tín hiệu: chuỗi lời gọi API, dòng log, phiên làm việc',
      minutes: 25,
      practiceMinutes: 3,
      level: 'nang-cao',
      prereqs: ['t7-l2', 't6-l3', 't5-l6'],
      why: {
        short:
          'Rất nhiều tín hiệu bảo mật chỉ tồn tại trong THỨ TỰ chứ không trong tần suất — và mọi cách biểu diễn kiểu túi từ đều xoá sạch thứ tự ngay ở bước đầu tiên.',
        scenario:
          'Sandbox của bạn cho ra 40.000 báo cáo hành vi mỗi tuần, mỗi báo cáo là một chuỗi 5.000–100.000 lời gọi API. Mô hình túi từ hiện tại đạt PR-AUC 0,71 và bị lách bằng cách chèn lời gọi API vô hại. Bạn cần quyết định: 1D-CNN, LSTM hay Transformer, và giải thích chi phí GPU cho một tháng tới.',
        roles: ['Malware Analyst', 'Security Data Scientist', 'Detection Engineer', 'Threat Hunter'],
        costOfNotKnowing:
          'Bạn chọn Transformer cho chuỗi 100.000 phần tử, phát hiện chi phí bộ nhớ tăng theo bình phương độ dài sau khi đã cam kết tiến độ, rồi phải cắt chuỗi còn 512 phần tử — và vô tình cắt mất đúng đoạn hành vi mã hoá tệp nằm ở cuối.',
      },
      objectives: [
        'Chỉ ra được tình huống cụ thể mà biểu diễn túi từ làm mất tín hiệu, bằng hai chuỗi API có cùng tần suất',
        'Giải thích cơ chế quên của RNN và ba cổng của LSTM bằng ngôn ngữ thường',
        'Mô tả self-attention bằng phép so khớp truy vấn – khoá – giá trị, không cần công thức',
        'Tính được chi phí bộ nhớ của attention theo độ dài chuỗi và quyết định có cần cắt chuỗi không',
        'Chọn giữa 1D-CNN, LSTM và Transformer cho một bài toán chuỗi bảo mật cụ thể, kèm lý do',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Hai chuỗi lời gọi API dưới đây có **đúng cùng một tập hợp và cùng tần suất** mỗi lời gọi. Mọi biểu diễn kiểu túi từ (đếm số lần mỗi API xuất hiện) sẽ tạo ra hai vector **hoàn toàn giống nhau** cho chúng.',
        },
        {
          t: 'table',
          head: ['Chuỗi', 'Diễn giải'],
          rows: [
            ['FindFirstFile → ReadFile → CryptEncrypt → WriteFile → DeleteFile', 'Duyệt tệp, đọc nội dung, mã hoá, ghi đè, xoá bản gốc — mẫu hành vi ransomware kinh điển'],
            ['CryptEncrypt → WriteFile → FindFirstFile → ReadFile → DeleteFile', 'Mã hoá một khối trong bộ nhớ rồi ghi ra, sau đó dọn dẹp tệp tạm — hành vi của một trình sao lưu hợp pháp'],
          ],
          caption: 'Cùng năm lời gọi, cùng số lần. Chỉ khác thứ tự. Một cái là ransomware, một cái là phần mềm sao lưu.',
        },
        {
          t: 'predict',
          question:
            'Bạn thêm đặc trưng 2-gram (đếm số lần mỗi CẶP API liên tiếp xuất hiện) vào mô hình túi từ. Điều đó có giải quyết được vấn đề trên không? Và nó tạo ra vấn đề gì mới?',
          reveal:
            'Nó giải quyết được **ví dụ cụ thể này** — hai chuỗi trên có tập 2-gram khác nhau. Nhưng nó không giải quyết được vấn đề gốc, và nó đắt hơn bạn tưởng.\n\n**Vì sao không đủ:** với 400 API khác nhau, số 2-gram có thể có là 160.000, số 3-gram là 64 triệu. Bạn không thể đi xa hơn 3-gram. Trong khi đó, phụ thuộc thật trong hành vi mã độc có thể cách nhau **hàng nghìn bước**: mở khoá registry ở lời gọi thứ 12, rồi mãi tới lời gọi thứ 8.400 mới dùng giá trị đọc được từ đó. Không n-gram nào bắt được khoảng cách đó.\n\n**Vấn đề mới:** không gian n-gram cực thưa và cực dễ bị làm loãng. Kẻ tấn công chèn `GetTickCount` giữa hai lời gọi quan trọng là **mọi 2-gram của bạn đổi hết** — trong khi hành vi thực tế không đổi gì. Đây gọi là tấn công chèn API, và nó rẻ tới mức nhiều packer làm sẵn.\n\nMô hình chuỗi tồn tại để giải đúng hai vấn đề này: nắm được phụ thuộc xa, và bền hơn trước việc chèn nhiễu cục bộ.',
        },
        { t: 'h', text: 'RNN: ý tưởng đúng, cơ chế quên sai', level: 2 },
        {
          t: 'p',
          md: 'Một mạng hồi tiếp (recurrent neural network) đọc chuỗi từng phần tử một và giữ một **trạng thái ẩn** đóng vai trò trí nhớ làm việc. Ở mỗi bước: `h_t = tanh(W·h_{t-1} + U·x_t + b)`. Trạng thái mới được trộn từ trạng thái cũ và đầu vào hiện tại. Sau khi đọc hết chuỗi, `h_cuối` là bản tóm tắt của toàn bộ chuỗi và bạn đưa nó vào một lớp phân loại.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Vì sao RNN thuần quên gần như mọi thứ',
          md: 'Chú ý ma trận `W` bị nhân vào trạng thái ở **mỗi bước**. Sau 100 bước, thông tin của bước đầu tiên đã đi qua `W` một trăm lần — tức là bị nhân với một đại lượng cỡ `W` mũ 100.\n\nNếu độ lớn đặc trưng của `W` nhỏ hơn 1, thông tin tan biến theo cấp số nhân. Nếu lớn hơn 1, nó nổ. Chỉ có đúng một giá trị cho kết quả ổn định, và gradient descent không có lý do gì để dừng lại ở đúng đó.\n\nTrong thực tế, RNN thuần giữ được ngữ cảnh khoảng **10–20 bước**. Với chuỗi API 5.000 phần tử, đó gần như là không có trí nhớ.',
        },
        { t: 'h', text: 'LSTM: thêm một con đường mà thông tin đi thẳng', level: 2 },
        {
          t: 'p',
          md: 'LSTM (Hochreiter & Schmidhuber, 1997) sửa đúng vấn đề đó bằng cách tách trí nhớ ra khỏi đầu ra. Bên cạnh trạng thái ẩn, nó có thêm một **trạng thái ô** (cell state) chạy dọc chuỗi và chỉ bị **cộng hoặc nhân với số gần 1**, thay vì bị nhân với ma trận ở mỗi bước. Đó là đường cao tốc cho thông tin xa.',
        },
        {
          t: 'list',
          items: [
            '**Cổng quên** — nhìn vào trạng thái hiện tại và đầu vào mới, quyết định phần nào của trí nhớ cũ nên xoá. Ví dụ trong chuỗi API: khi thấy `ExitProcess`, quên hết ngữ cảnh của tiến trình vừa kết thúc.',
            '**Cổng vào** — quyết định phần nào của thông tin mới đáng ghi vào trí nhớ. Thấy `CryptAcquireContext` thì ghi; thấy `GetTickCount` lần thứ 400 thì bỏ qua.',
            '**Cổng ra** — quyết định phần nào của trí nhớ được lộ ra thành đầu ra ở bước này. Trí nhớ có thể giữ một sự kiện suốt 3.000 bước mà không dùng tới, cho tới khi nó trở nên liên quan.',
            '**GRU** là bản rút gọn với hai cổng thay vì ba, ít tham số hơn khoảng 25%, huấn luyện nhanh hơn, và trong phần lớn bài toán bảo mật cho kết quả ngang ngửa. Nếu bạn không có lý do cụ thể để chọn LSTM, hãy thử GRU trước.',
          ],
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'DeepLog: phát hiện bất thường trong log mà không cần nhãn',
          md: 'Du và cộng sự (CCS 2017) đưa ra một ý tưởng đơn giản đến mức đẹp. Bước một: phân tích mỗi dòng log thành một **khoá sự kiện** (bỏ phần biến thiên như số ID, địa chỉ, giữ lại khung mẫu — công cụ như Drain làm việc này tự động). Log HDFS chẳng hạn rút gọn về vài chục khoá.\n\nBước hai: huấn luyện LSTM **dự đoán khoá tiếp theo** từ cửa sổ vài khoá gần nhất. Không cần nhãn tấn công nào cả — nhãn chính là khoá kế tiếp trong chính dữ liệu.\n\nBước ba: khi chạy thật, nếu khoá thực tế **không nằm trong top-g khoá được dự đoán** thì đánh dấu bất thường. Tham số `g` chính là cái núm đánh đổi precision và recall của bạn.\n\nĐây là mẫu hình đáng nhớ vượt xa bài toán log: **biến bài toán không giám sát thành bài toán có giám sát bằng cách dự đoán phần tử tiếp theo của chính dữ liệu.** Cũng chính là cách các mô hình ngôn ngữ lớn được huấn luyện.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't7l4-cp1',
              kind: 'mcq',
              tags: ['mo-hinh-chuoi', 'lstm'],
              q: 'Vì sao LSTM giữ được phụ thuộc xa còn RNN thuần thì không?',
              options: [
                'Vì LSTM có nhiều tham số hơn nên nhớ được nhiều hơn',
                'Vì trạng thái ô của LSTM đi dọc chuỗi mà chủ yếu chỉ bị cộng hoặc nhân với số gần 1, thay vì bị nhân với ma trận trọng số ở mỗi bước',
                'Vì LSTM đọc chuỗi theo cả hai chiều',
                'Vì LSTM dùng hàm kích hoạt ReLU thay vì tanh',
              ],
              answer: 1,
              why: 'Vấn đề của RNN là phép nhân lặp lại: sau 100 bước, tín hiệu ban đầu bị nhân với đại lượng cỡ `W` mũ 100 nên tan biến hoặc nổ. LSTM tạo một đường mà thông tin đi qua **gần như nguyên vẹn**, còn các cổng chỉ quyết định thêm vào hay xoá bớt. Đây cùng một ý tưởng với kết nối tắt trong ResNet: cho gradient một con đường không bị co lại.',
              distractorWhy: [
                'Nhiều tham số không giúp gì nếu tín hiệu vẫn bị nhân co lại theo cấp số nhân qua mỗi bước.',
                '',
                'Đọc hai chiều (bi-LSTM) là một lựa chọn riêng biệt và không giải quyết vấn đề gradient tan biến.',
                'LSTM vẫn dùng tanh và sigmoid; loại hàm kích hoạt không phải nguyên nhân.',
              ],
            },
            {
              id: 't7l4-cp2',
              kind: 'truefalse',
              tags: ['mo-hinh-chuoi', 'ne-tranh'],
              q: 'Chèn thêm các lời gọi API vô hại vào chuỗi hành vi là một phép né tránh rẻ tiền mà mọi mô hình chuỗi đều miễn nhiễm.',
              answer: false,
              why: 'Không mô hình nào miễn nhiễm, chỉ khác mức độ. Biểu diễn n-gram bị ảnh hưởng nặng nhất vì mọi cặp liên tiếp đều đổi. LSTM và Transformer bền hơn vì chúng học được cách bỏ qua phần tử không mang thông tin — nhưng chỉ khi trong dữ liệu huấn luyện **có** những mẫu bị chèn nhiễu như vậy. Nếu bạn huấn luyện toàn bằng chuỗi sandbox sạch, mô hình chưa từng thấy chuỗi bị pha loãng và sẽ vẫn hỏng. Cách chữa thực tế: gộp các lời gọi lặp lại liên tiếp, lọc bỏ các API không mang tính quyết định, và bổ sung chuỗi bị chèn nhiễu vào dữ liệu huấn luyện.',
            },
          ],
        },
        { t: 'h', text: 'Transformer: bỏ vòng lặp, cho mọi vị trí nhìn thấy nhau', level: 2 },
        {
          t: 'p',
          md: 'RNN và LSTM có một hạn chế cứng: chúng xử lý **tuần tự**. Muốn biết trạng thái ở bước 5.000 thì phải tính xong 4.999 bước trước. GPU có hàng nghìn lõi nhưng chỉ dùng được một phần nhỏ. Transformer (Vaswani và cộng sự, 2017) vứt bỏ vòng lặp và thay bằng một câu hỏi hoàn toàn khác.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Self-attention giải thích như một cuộc tra cứu',
          md: 'Mỗi vị trí trong chuỗi tạo ra ba vector từ chính nó:\n\n- **Truy vấn (Query)** — "tôi đang tìm loại thông tin gì?"\n- **Khoá (Key)** — "tôi chứa loại thông tin gì?"\n- **Giá trị (Value)** — "nếu ai đó cần tôi, đây là thứ tôi đưa ra."\n\nĐể tính đầu ra tại vị trí `i`, mô hình so **truy vấn của i** với **khoá của tất cả vị trí khác** bằng tích vô hướng, chuẩn hoá thành trọng số qua softmax, rồi lấy trung bình có trọng số các **giá trị**.\n\nDịch sang ngôn ngữ mã độc: khi mô hình xử lý lời gọi `CryptEncrypt` ở vị trí 8.400, truy vấn của nó về bản chất hỏi *"trước đó có ai mở khoá registry hay liệt kê tệp không?"*. Lời gọi `FindFirstFile` ở vị trí 12 có khoá khớp với câu hỏi đó, nên trọng số cao, nên thông tin của nó chảy thẳng tới vị trí 8.400 — **trong đúng một bước**, không phải 8.388 bước như LSTM.',
        },
        { t: 'figure', id: 'fig-attention', caption: 'Self-attention: mỗi vị trí so truy vấn của mình với khoá của mọi vị trí khác, rồi lấy trung bình có trọng số các giá trị. Đường đậm hơn là trọng số chú ý cao hơn.' },
        {
          t: 'p',
          md: 'Vì attention không có khái niệm thứ tự (nó chỉ là trung bình có trọng số, đổi chỗ đầu vào thì đầu ra đổi chỗ tương ứng), Transformer phải cộng thêm **mã hoá vị trí** vào embedding đầu vào. Bỏ quên bước này là một lỗi thật và triệu chứng của nó rất giống với túi từ: mô hình mất hoàn toàn khả năng phân biệt hai chuỗi cùng thành phần khác thứ tự.',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Cái giá bình phương — con số bạn phải tính trước khi cam kết',
          md: 'Attention so mọi cặp vị trí, nên chi phí bộ nhớ và tính toán tăng theo **bình phương** độ dài chuỗi.',
        },
        {
          t: 'table',
          head: ['Độ dài chuỗi', 'Số cặp phải tính', 'So với chuỗi 512', 'Ghi chú thực tế'],
          rows: [
            ['512', '262.144', '1×', 'Thoải mái trên mọi GPU'],
            ['2.048', '4.194.304', '16×', 'Vẫn ổn với GPU 16 GB nếu batch nhỏ'],
            ['8.192', '67.108.864', '256×', 'Cần attention thưa hoặc FlashAttention'],
            ['100.000', '10.000.000.000', '~38.000×', 'Bất khả thi với attention đầy đủ'],
          ],
          caption: 'Chuỗi API từ sandbox thường dài 5.000–100.000 phần tử. Đây là lý do bạn gần như luôn phải rút gọn chuỗi trước, chứ không phải mua GPU to hơn.',
        },
        {
          t: 'steps',
          title: 'Rút chuỗi 100.000 lời gọi xuống còn 1.000 mà không mất tín hiệu',
          steps: [
            {
              title: 'Bước 1 — Gộp lặp lại liên tiếp (run-length encoding)',
              md: 'Một vòng lặp đọc 20.000 tệp tạo ra 20.000 lần `ReadFile` liên tiếp. Thay chúng bằng một phần tử `ReadFile` kèm đặc trưng số lần lặp (đã lấy log). Riêng bước này thường cắt chuỗi đi 5–20 lần và **không mất thông tin hành vi nào**.',
            },
            {
              title: 'Bước 2 — Bỏ các API không mang tính quyết định',
              md: '`GetTickCount`, `GetSystemTime`, `GetLastError` chiếm tỉ trọng lớn trong mọi chuỗi và gần như không phân biệt được gì. Cẩn thận: chúng có thể là tín hiệu của hành vi chống sandbox nếu xuất hiện với mật độ bất thường — nên hãy **giữ lại tần suất của chúng như một đặc trưng riêng**, chỉ bỏ chúng khỏi chuỗi.',
            },
            {
              title: 'Bước 3 — Gộp theo nhóm ngữ nghĩa',
              md: 'Thay vì 400 API riêng lẻ, ánh xạ về khoảng 30–50 nhóm hành vi: thao tác tệp, thao tác registry, mạng, mã hoá, tiến trình, tiêm mã. Từ vựng nhỏ hơn nghĩa là ít tham số embedding hơn, ít quá khớp hơn, và bền hơn khi mã độc đổi sang API tương đương.',
            },
            {
              title: 'Bước 4 — Cắt có chủ đích, đừng cắt bừa',
              md: 'Nếu vẫn còn dài, đừng lấy 1.000 phần tử đầu. Hành vi mã hoá tệp của ransomware thường nằm ở **cuối** chuỗi, sau giai đoạn trinh sát dài. Hãy lấy 500 đầu và 500 cuối, hoặc lấy cửa sổ quanh các lời gọi thuộc nhóm rủi ro cao. Ghi lại lựa chọn này trong tài liệu mô hình — nó là một giả định mà kẻ tấn công có thể khai thác.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Phân loại chuỗi API bằng LSTM. Chi tiết quan trọng nhất nằm ở pack_padded_sequence.',
          collapsed: true,
          code:
            'import torch\n' +
            'import torch.nn as nn\n' +
            '\n' +
            'class PhanLoaiChuoiAPI(nn.Module):\n' +
            '    def __init__(self, n_api=512, emb=64, hid=128):\n' +
            '        super().__init__()\n' +
            '        self.emb = nn.Embedding(n_api, emb, padding_idx=0)\n' +
            '        self.rnn = nn.LSTM(emb, hid, batch_first=True)\n' +
            '        self.fc  = nn.Linear(hid, 1)\n' +
            '\n' +
            '    def forward(self, x, do_dai):              # x: (B, T) chỉ số API đã đệm\n' +
            '        e = self.emb(x)\n' +
            '        # Không đóng gói theo độ dài thật thì trạng thái cuối sẽ là trạng thái\n' +
            '        # sau khi đọc hàng nghìn ô ĐỆM — tức là bản tóm tắt của khoảng trắng.\n' +
            '        goi = nn.utils.rnn.pack_padded_sequence(\n' +
            '            e, do_dai.cpu(), batch_first=True, enforce_sorted=False)\n' +
            '        _, (h, _) = self.rnn(goi)              # h: (1, B, hid) trạng thái cuối THẬT\n' +
            '        return self.fc(h[-1]).squeeze(1)       # logit\n',
        },
        { t: 'h', text: 'Chọn kiến trúc: bảng quyết định', level: 2 },
        {
          t: 'table',
          head: ['Kiến trúc', 'Chi phí theo độ dài n', 'Bắt phụ thuộc xa', 'Song song hoá', 'Dùng khi'],
          rows: [
            ['n-gram + GBDT', 'Tuyến tính', 'Chỉ trong cửa sổ 2–3 phần tử', 'Hoàn toàn', 'Đường cơ sở BẮT BUỘC. Rẻ, nhanh, giải thích được'],
            ['1D-CNN', 'Tuyến tính', 'Trong vùng tiếp nhận, mở rộng được bằng dilation', 'Hoàn toàn', 'Chuỗi dài, tín hiệu là mẫu cục bộ. Thường ngang LSTM với 1/10 chi phí'],
            ['LSTM / GRU', 'Tuyến tính', 'Tốt tới vài trăm bước', 'Kém (tuần tự)', 'Chuỗi trung bình, cần trạng thái tích luỹ dọc chuỗi'],
            ['Transformer', 'Bình phương', 'Toàn chuỗi, một bước nhảy', 'Hoàn toàn', 'Chuỗi dưới 2.000 phần tử, có nhiều dữ liệu, cần phụ thuộc rất xa'],
          ],
          caption: 'Lời khuyên: luôn chạy dòng đầu tiên trước. Nếu n-gram + LightGBM đạt PR-AUC 0,68 và LSTM đạt 0,71, hãy hỏi 0,03 đó có đáng chi phí vận hành gấp mười lần không.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Ba điểm mù của mọi mô hình trên dữ liệu sandbox',
          md: '**Chuỗi rỗng vì mã độc phát hiện sandbox.** Mã độc hiện đại kiểm tra số lõi CPU, dung lượng đĩa, thời gian chạy, chuyển động chuột. Thấy dấu hiệu máy ảo thì nó thoát ngay và bạn thu được chuỗi 30 lời gọi vô hại. Mô hình chuỗi của bạn không sai — nó chỉ đang nhìn một tệp không làm gì cả. Hãy coi **chuỗi ngắn bất thường là một tín hiệu riêng**, đừng để nó rơi vào lớp lành tính.\n\n**Thời gian chạy có giới hạn.** Sandbox thường chạy 2–5 phút. Mã độc ngủ 20 phút trước khi hành động thì bạn không bao giờ thấy phần thú vị.\n\n**Chuỗi phụ thuộc vào môi trường sandbox cụ thể.** Đổi phiên bản Windows, đổi bộ công cụ giám sát, và phân phối chuỗi đổi theo. Mô hình huấn luyện trên báo cáo của sandbox cũ sẽ trôi ngay khi bạn nâng cấp — một dạng trôi dữ liệu không do kẻ tấn công gây ra mà do chính bạn.',
        },
        { t: 'terms', ids: ['lstm', 'transformer', 'embedding', 'edr', 'troi-du-lieu', 'ne-tranh'] },
      ],
      keyTakeaways: [
        'Biểu diễn túi từ xoá sạch thứ tự; hai chuỗi API cùng thành phần khác thứ tự có thể là ransomware và trình sao lưu.',
        'n-gram chỉ bắt được phụ thuộc trong 2–3 bước và bị phá bằng cách chèn một lời gọi vô hại vào giữa.',
        'RNN thuần quên sau khoảng 10–20 bước vì trạng thái bị nhân với ma trận trọng số ở mỗi bước.',
        'LSTM tạo một đường mà thông tin đi gần như nguyên vẹn; ba cổng quyết định xoá gì, ghi gì, lộ ra gì.',
        'Self-attention là phép tra cứu truy vấn – khoá – giá trị, nối hai vị trí cách nhau 8.000 bước trong đúng một bước.',
        'Chi phí attention tăng theo bình phương độ dài: 512 phần tử là 262 nghìn cặp, 100.000 phần tử là 10 tỉ cặp.',
        'Rút gọn chuỗi (gộp lặp, bỏ API vô nghĩa, gộp nhóm ngữ nghĩa) hầu như luôn hiệu quả hơn mua GPU lớn hơn.',
        'DeepLog: biến bài toán không nhãn thành có nhãn bằng cách dự đoán phần tử tiếp theo của chính dữ liệu.',
      ],
      cards: [
        {
          id: 't7l4-c1',
          front: 'Cho ví dụ cụ thể về việc biểu diễn túi từ làm mất tín hiệu bảo mật.',
          back: 'Chuỗi FindFirstFile→ReadFile→CryptEncrypt→WriteFile→DeleteFile (ransomware) và cùng năm lời gọi đó theo thứ tự khác (trình sao lưu) cho ra vector túi từ y hệt nhau.',
          tags: ['mo-hinh-chuoi'],
        },
        {
          id: 't7l4-c2',
          front: 'Vì sao RNN thuần chỉ nhớ được khoảng 10–20 bước?',
          back: 'Vì trạng thái bị nhân với ma trận trọng số ở mỗi bước; sau n bước tín hiệu bị nhân với đại lượng cỡ W mũ n nên tan biến hoặc nổ theo cấp số nhân.',
          tags: ['mo-hinh-chuoi', 'rnn'],
        },
        {
          id: 't7l4-c3',
          front: 'Nêu ba cổng của LSTM và việc của từng cổng.',
          back: 'Cổng quên: xoá phần trí nhớ cũ không còn liên quan. Cổng vào: chọn thông tin mới đáng ghi. Cổng ra: chọn phần trí nhớ được lộ ra thành đầu ra ở bước này.',
          tags: ['lstm'],
        },
        {
          id: 't7l4-c4',
          front: 'Giải thích self-attention bằng ba vector Q, K, V.',
          back: 'Mỗi vị trí phát ra truy vấn (tôi cần gì), khoá (tôi có gì) và giá trị (thứ tôi đưa ra). Đầu ra tại một vị trí là trung bình có trọng số các giá trị, trọng số tính từ độ khớp giữa truy vấn của nó và khoá của mọi vị trí.',
          tags: ['transformer', 'self-attention'],
        },
        {
          id: 't7l4-c5',
          front: 'Chi phí attention thay đổi thế nào khi chuỗi dài gấp 4 lần?',
          back: 'Tăng 16 lần, vì chi phí tỉ lệ với bình phương độ dài (mọi cặp vị trí đều được so với nhau).',
          tags: ['transformer'],
        },
        {
          id: 't7l4-c6',
          front: 'Ý tưởng cốt lõi của DeepLog là gì?',
          back: 'Huấn luyện LSTM dự đoán khoá log tiếp theo từ cửa sổ gần nhất; nếu khoá thật không nằm trong top-g dự đoán thì báo bất thường. Không cần nhãn tấn công.',
          tags: ['mo-hinh-chuoi', 'bat-thuong'],
        },
      ],
      quiz: [
        {
          id: 't7l4-q1',
          kind: 'mcq',
          tags: ['transformer', 'thuc-chien'],
          q: 'Chuỗi lời gọi API của bạn dài trung bình 40.000 phần tử. Bước hợp lý ĐẦU TIÊN là gì?',
          options: [
            'Thuê GPU 80 GB để chạy Transformer với attention đầy đủ',
            'Rút gọn chuỗi: gộp lặp lại liên tiếp, bỏ API không quyết định, gộp về nhóm ngữ nghĩa',
            'Cắt lấy 512 phần tử đầu tiên và huấn luyện Transformer',
            'Chuyển sang biểu diễn túi từ vì chuỗi quá dài',
          ],
          answer: 1,
          why: 'Chuỗi 40.000 phần tử với attention đầy đủ cần khoảng 1,6 tỉ cặp — không GPU nào chạy nổi với batch có ý nghĩa. Nhưng phần lớn độ dài đó là **dư thừa**: các vòng lặp `ReadFile` lặp hàng nghìn lần, các lời gọi lấy giờ hệ thống. Gộp lặp lại thường cắt 5–20 lần mà không mất thông tin hành vi. Phương án 3 nguy hiểm nhất vì nó im lặng: hành vi mã hoá tệp của ransomware thường nằm ở cuối chuỗi, sau giai đoạn trinh sát — cắt 512 đầu là vứt đúng phần cần bắt.',
          distractorWhy: [
            'Phần cứng không giải quyết được vấn đề tăng theo bình phương; nó chỉ đẩy giới hạn đi một chút với chi phí rất lớn.',
            '',
            'Cắt phần đầu vứt mất giai đoạn hành động thật, và bạn sẽ không biết vì mô hình vẫn cho ra một con số AUC.',
            'Túi từ đúng là rẻ và nên làm đường cơ sở, nhưng chuyển sang nó là từ bỏ chính tín hiệu thứ tự mà bài toán cần.',
          ],
        },
        {
          id: 't7l4-q2',
          kind: 'multi',
          tags: ['mo-hinh-chuoi', 'du-lieu'],
          q: 'Bạn nhận được một báo cáo sandbox chỉ có 28 lời gọi API, toàn các lời gọi khởi tạo vô hại. Cách xử lý đúng? (Chọn tất cả đáp án đúng)',
          options: [
            'Coi độ dài chuỗi bất thường ngắn là một đặc trưng riêng, không để mẫu này rơi vào lớp lành tính',
            'Kiểm tra xem mẫu có hành vi chống sandbox không (đọc số lõi CPU, dung lượng đĩa, thời gian chạy)',
            'Loại mẫu này khỏi tập huấn luyện vì nó không có thông tin',
            'Kết luận mẫu này lành tính vì không thấy hành vi độc hại nào',
          ],
          answers: [0, 1],
          why: 'Chuỗi ngắn bất thường là **tín hiệu**, không phải thiếu tín hiệu. Mã độc hiện đại kiểm tra môi trường và thoát ngay nếu nghi ngờ máy ảo — nên "không làm gì cả" chính là hành vi đáng ngờ. Phương án 4 là cái bẫy nguy hiểm nhất: nó dạy mô hình rằng chống sandbox thành công đồng nghĩa với lành tính, tức là bạn đang thưởng cho kẻ tấn công vì đã né được. Phương án 3 vứt đi một lớp mẫu quan trọng; đúng ra phải giữ và gắn nhãn cẩn thận.',
        },
        {
          id: 't7l4-q3',
          kind: 'order',
          tags: ['mo-hinh-chuoi', 'thuc-chien'],
          q: 'Sắp xếp quy trình xây bộ phân loại chuỗi API, theo thứ tự nên làm.',
          items: [
            'Chuẩn hoá chuỗi: gộp lặp lại liên tiếp và ánh xạ API về nhóm ngữ nghĩa',
            'Xây đường cơ sở n-gram + LightGBM và ghi lại PR-AUC',
            'Thử 1D-CNN hoặc GRU, so với đường cơ sở trên cùng tập chia theo thời gian',
            'Chỉ khi có cải thiện rõ, mới cân nhắc Transformer với chuỗi đã rút gọn',
            'Kiểm tra độ bền bằng cách chèn lời gọi API vô hại vào chuỗi kiểm tra',
          ],
          why: 'Trình tự này bảo vệ bạn khỏi hai sai lầm tốn kém. Một: nhảy thẳng vào kiến trúc đắt tiền mà không biết đường cơ sở rẻ đạt tới đâu — rất nhiều đội phát hiện ra n-gram + GBDT chỉ kém 0,02 PR-AUC sau khi đã tiêu ba tháng. Hai: công bố kết quả trước khi kiểm tra độ bền đối kháng, rồi bị né bằng một thao tác mà packer làm sẵn. Bước chuẩn hoá đứng đầu vì nó làm mọi bước sau rẻ hơn và mọi so sánh công bằng hơn.',
        },
        {
          id: 't7l4-q4',
          kind: 'input',
          tags: ['transformer'],
          q: 'Chuỗi dài 512 phần tử cần tính 262.144 cặp trong self-attention. Chuỗi dài 2.048 phần tử cần tính gấp bao nhiêu lần? Gõ số lần.',
          accept: ['16', '16 lan', '16x', 'gap 16 lan'],
          placeholder: 'Ví dụ: 8',
          hint: 'Độ dài tăng mấy lần, và chi phí tỉ lệ với luỹ thừa mấy của độ dài?',
          why: 'Độ dài tăng 4 lần, chi phí tỉ lệ với bình phương, nên tăng **16 lần**. Phép tính này nên thành phản xạ: mỗi khi ai đó đề xuất tăng độ dài cửa sổ ngữ cảnh, bạn tính ngay hệ số nhân của chi phí bộ nhớ. Đó cũng là lý do cả một dòng nghiên cứu tồn tại chỉ để phá vỡ giới hạn bình phương này — attention thưa, attention cục bộ, FlashAttention và các mô hình không gian trạng thái.',
        },
        {
          id: 't7l4-q5',
          kind: 'truefalse',
          tags: ['transformer'],
          q: 'Transformer hiểu được thứ tự chuỗi một cách tự nhiên nhờ cơ chế self-attention.',
          answer: false,
          why: 'Sai — và đây là điểm nhiều người hiểu ngược. Self-attention là một phép trung bình có trọng số trên tập hợp: nếu bạn hoán vị đầu vào, đầu ra hoán vị y hệt, tức là nó **hoàn toàn không biết vị trí**. Thứ tự đến từ **mã hoá vị trí** được cộng vào embedding trước khi đưa vào các lớp attention. Quên bước này thì Transformer của bạn thoái hoá thành một mô hình túi từ đắt tiền, và triệu chứng đúng là triệu chứng ở đầu bài học này: hai chuỗi cùng thành phần khác thứ tự cho cùng một dự đoán.',
        },
      ],
      terms: ['lstm', 'transformer', 'embedding', 'edr', 'troi-du-lieu', 'ne-tranh'],
      further: [
        {
          title: 'DeepLog: Anomaly Detection and Diagnosis from System Logs through Deep Learning — Du và cộng sự (CCS 2017)',
          note: 'Mẫu hình dự đoán phần tử tiếp theo để phát hiện bất thường không cần nhãn. Đọc để lấy ý tưởng, không phải để sao chép kiến trúc.',
        },
        {
          title: 'Attention Is All You Need — Vaswani và cộng sự (2017)',
          note: 'Bài báo gốc của Transformer. Chỉ cần đọc kỹ mục 3.2 về scaled dot-product attention là đủ cho mục đích của bạn.',
        },
        {
          title: 'The Illustrated Transformer — Jay Alammar',
          note: 'Giải thích bằng hình từng bước một. Nếu phần Q/K/V còn mơ hồ sau bài này, đây là nơi nên tới.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't7-l5',
      trackId: 'deep-learning',
      title: 'Học biểu diễn và autoencoder',
      subtitle: 'Khi bạn có 8 triệu mẫu và đúng 300 nhãn xác nhận',
      minutes: 24,
      practiceMinutes: 3,
      level: 'nang-cao',
      prereqs: ['t7-l2', 't5-l6', 't3-l1'],
      why: {
        short:
          'Tình trạng mặc định trong bảo mật là núi dữ liệu không nhãn bên cạnh một nhúm nhãn đắt đỏ — học biểu diễn là cách duy nhất để phần dữ liệu không nhãn kia có ích.',
        scenario:
          'Bạn có 8 triệu phiên đăng nhập trong 18 tháng và đúng 312 phiên được đội ứng cứu xác nhận là chiếm đoạt tài khoản. Huấn luyện có giám sát trực tiếp trên 312 mẫu dương cho ra một mô hình quá khớp nặng. Sếp hỏi phần 8 triệu kia dùng được vào việc gì.',
        roles: ['Security Data Scientist', 'ML Engineer', 'Threat Hunter', 'Detection Engineer'],
        costOfNotKnowing:
          'Bạn hoặc là bỏ phí toàn bộ dữ liệu không nhãn, hoặc là triển khai một autoencoder đặt ngưỡng ở phân vị 99,9% và tạo ra 8.000 cảnh báo mỗi ngày mà không ai nhìn — rồi kết luận sai rằng phát hiện bất thường không dùng được.',
      },
      objectives: [
        'Giải thích học biểu diễn là gì và vì sao nó là câu trả lời cho tình trạng khan hiếm nhãn',
        'Mô tả cơ chế phát hiện bất thường bằng lỗi tái tạo của autoencoder và hai cách nó thất bại',
        'Chỉ ra quan hệ giữa autoencoder tuyến tính và PCA, và dùng PCA làm đường cơ sở bắt buộc',
        'Thiết kế cặp dương cho học tương phản từ tri thức miền bảo mật',
        'Đặt ngưỡng bất thường bằng tập hiệu chuẩn tách theo thời gian, không bằng phân vị trên tập huấn luyện',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Đây là bài toán quen thuộc tới mức nhàm chán trong mọi đội bảo mật: **dữ liệu thì thừa, nhãn thì thiếu**. 8 triệu phiên đăng nhập, 312 nhãn dương đã xác nhận. Tỉ lệ nhãn: 0,0039%.',
        },
        {
          t: 'p',
          md: 'Huấn luyện có giám sát trực tiếp trên 312 mẫu dương gần như chắc chắn quá khớp — mô hình sẽ ghi nhớ 312 phiên đó chứ không học được khái niệm "chiếm đoạt tài khoản". **Học biểu diễn** (representation learning) là hướng đi khác: dùng 8 triệu mẫu không nhãn để học một hàm biến mỗi phiên thành một vector sao cho **khoảng cách trong không gian đó mang ý nghĩa**, rồi mới dùng 312 nhãn để vạch ranh giới trong không gian đã học được đó.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Đổi bài toán khó lấy hai bài toán dễ',
          md: 'Bài toán khó: học một hàm từ 8 triệu chiều thô về nhãn, chỉ với 312 ví dụ dương.\n\nHai bài toán dễ hơn: **(1)** học một hàm từ dữ liệu thô về vector 64 chiều, dùng cả 8 triệu mẫu và **không cần nhãn nào**; **(2)** học một hồi quy logistic trên 64 chiều đó với 312 nhãn — bài toán này hoàn toàn vừa sức.\n\nToàn bộ giá trị nằm ở chỗ bước (1) không tốn nhãn. Đây cũng chính là công thức đứng sau mọi mô hình nền tảng hiện nay, chỉ khác quy mô.',
        },
        { t: 'h', text: 'Autoencoder: học bằng cách tự tái tạo chính mình', level: 2 },
        {
          t: 'p',
          md: 'Autoencoder gồm hai nửa. **Encoder** nén đầu vào `x` xuống một vector `z` nhỏ hơn nhiều (nút cổ chai). **Decoder** cố dựng lại `x` từ đúng `z` đó. Hàm mất mát là sai số tái tạo, thường là `||x - x_dựng_lại||²`. Không có nhãn nào tham gia — nhãn chính là đầu vào.',
        },
        {
          t: 'p',
          md: 'Vì `z` nhỏ hơn `x` rất nhiều, mạng buộc phải vứt bỏ thứ gì đó. Thứ nó giữ lại là **cấu trúc lặp lại nhiều nhất** trong dữ liệu — tức là những gì "bình thường". Từ đó ra ý tưởng phát hiện bất thường: một mẫu mà mạng **không dựng lại được** có lẽ là một mẫu không giống phần còn lại của dữ liệu.',
        },
        { t: 'figure', id: 'fig-autoencoder', caption: 'Autoencoder nén dữ liệu qua nút cổ chai rồi dựng lại. Lỗi tái tạo lớn nghĩa là mẫu không khớp với cấu trúc mà mạng đã học được từ phần lớn dữ liệu.' },
        {
          t: 'predict',
          question:
            'Bạn huấn luyện autoencoder trên 8 triệu phiên đăng nhập "bình thường", đặt ngưỡng ở lỗi tái tạo cao. Theo bạn, một phiên chiếm đoạt tài khoản có chắc chắn cho lỗi tái tạo cao không? Nghĩ kỹ về hai hướng có thể sai.',
          reveal:
            'Không hề chắc chắn, và nó sai theo **hai hướng ngược nhau** — cả hai đều thường xuyên xảy ra trong thực tế.\n\n**Hướng một: autoencoder tái tạo tốt cả những thứ nó chưa từng thấy.** Nếu nút cổ chai đủ rộng hoặc mạng đủ lớn, nó không học "cái gì là bình thường" mà học **một thuật toán nén tổng quát**. Một mạng đủ mạnh có thể dựng lại gần như mọi đầu vào, kể cả nhiễu ngẫu nhiên. Đây là lý do nút cổ chai phải thật chật và bạn phải kiểm chứng bằng thực nghiệm chứ không tin vào lý thuyết.\n\n**Hướng hai: tấn công có thể ĐƠN GIẢN hơn dữ liệu bình thường.** Lỗi tái tạo đo độ phức tạp so với cấu trúc đã học, không đo mức độ độc hại. Một kịch bản dò mật khẩu tự động tạo ra các phiên cực kỳ đều đặn: cùng user-agent, cùng khoảng cách thời gian, cùng đường dẫn. Autoencoder dựng lại loại phiên đó **dễ hơn** phiên của một nhân viên thật đang làm việc lộn xộn. Điểm bất thường của cuộc tấn công thấp hơn của người dùng bình thường.\n\n**Hệ quả thực hành:** lỗi tái tạo là một **đặc trưng**, không phải một bộ phát hiện. Hãy đưa nó vào mô hình có giám sát cùng với các đặc trưng khác, thay vì đặt ngưỡng trực tiếp lên nó.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Đường cơ sở bắt buộc: PCA',
          md: 'Một autoencoder với **hàm kích hoạt tuyến tính** và mất mát MSE học ra đúng cùng một không gian con với **PCA**. Nghĩa là: nếu autoencoder sâu của bạn không vượt được PCA một cách rõ ràng, thì toàn bộ phần phi tuyến bạn thêm vào đang không đóng góp gì.\n\nPCA chạy trong vài giây trên CPU, có nghiệm giải tích, không có siêu tham số nào phải mò, và giải thích được. Hãy chạy nó **trước**, ghi lại PR-AUC, và bắt autoencoder phải vượt qua con số đó. Trên dữ liệu bảng, thêm `IsolationForest` vào danh sách đường cơ sở — nó thường ngang hoặc hơn autoencoder với chi phí bằng một phần trăm.',
        },
        {
          t: 'table',
          head: ['Phương pháp', 'Chi phí', 'Giả định ngầm', 'Điểm mạnh riêng', 'Điểm yếu riêng'],
          rows: [
            ['PCA', 'Vài giây CPU', 'Cấu trúc bình thường nằm trong một không gian con tuyến tính', 'Có nghiệm giải tích, giải thích được, không siêu tham số', 'Bó tay với quan hệ phi tuyến'],
            ['Isolation Forest', 'Vài phút CPU', 'Điểm bất thường dễ bị cô lập bằng vài lát cắt ngẫu nhiên', 'Rất khoẻ trên dữ liệu bảng, ít siêu tham số', 'Kém với dữ liệu nhiều chiều thưa, không dùng được cấu trúc chuỗi'],
            ['Autoencoder', 'Hàng giờ GPU', 'Cái bình thường nén được, cái bất thường thì không', 'Xử lý được đầu vào phi tuyến, chuỗi, ảnh; cho ra embedding tái dùng được', 'Có thể tái tạo tốt cả mẫu lạ; lỗi tái tạo không đo độ độc hại'],
            ['Học tương phản', 'Hàng giờ tới hàng ngày GPU', 'Bạn định nghĩa được cặp "nên giống nhau" từ tri thức miền', 'Biểu diễn tốt hơn hẳn khi định nghĩa cặp dương đúng', 'Chất lượng phụ thuộc hoàn toàn vào cách bạn tạo cặp'],
          ],
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't7l5-cp1',
              kind: 'mcq',
              tags: ['autoencoder', 'bat-thuong'],
              q: 'Autoencoder của bạn cho điểm bất thường THẤP với các phiên dò mật khẩu tự động. Giải thích đúng nhất?',
              options: [
                'Autoencoder bị lỗi huấn luyện, cần huấn luyện lại',
                'Lỗi tái tạo đo mức độ khớp với cấu trúc đã học, không đo mức độ độc hại — mà phiên tự động thì cực kỳ đều đặn nên dễ tái tạo',
                'Nút cổ chai quá chật nên mọi thứ đều bị nén như nhau',
                'Cần tăng số epoch để mạng phân biệt tốt hơn',
              ],
              answer: 1,
              why: 'Đây là hiểu lầm nền tảng về phát hiện bất thường: **bất thường theo nghĩa thống kê không đồng nghĩa với độc hại**. Một kịch bản tự động tạo ra chuỗi hành động lặp lại đều tăm tắp — về mặt nén, nó là thứ dễ nén nhất trên đời. Trong khi đó một nhân viên thật làm việc lộn xộn và có lỗi tái tạo cao hơn. Cách sửa không phải huấn luyện lại mà là **đổi cách dùng**: coi lỗi tái tạo là một đặc trưng đưa vào mô hình có giám sát, hoặc bổ sung các đặc trưng đo tính đều đặn (phương sai khoảng cách thời gian, entropy của chuỗi hành động) để bắt đúng loại tấn công này.',
              distractorWhy: [
                'Mạng huấn luyện đúng như thiết kế; vấn đề nằm ở việc định nghĩa bài toán, không ở quá trình tối ưu.',
                '',
                'Nút cổ chai chật gây lỗi tái tạo cao đồng loạt, không gây điểm thấp có chọn lọc cho một loại phiên.',
                'Thêm epoch chỉ làm mạng tái tạo mọi thứ tốt hơn nữa, kể cả các phiên tấn công.',
              ],
            },
            {
              id: 't7l5-cp2',
              kind: 'truefalse',
              tags: ['autoencoder', 'nguong'],
              q: 'Đặt ngưỡng bất thường ở phân vị 99,9% của lỗi tái tạo trên tập huấn luyện là cách làm hợp lý.',
              answer: false,
              why: 'Hai lỗi trong một câu. **Lỗi thứ nhất — chọn ngưỡng trên tập huấn luyện:** mạng đã tối ưu để giảm lỗi tái tạo trên chính dữ liệu đó, nên phân bố lỗi ở đây lạc quan một cách có hệ thống. Khi chạy thật, tỉ lệ vượt ngưỡng sẽ cao hơn 99,9% nhiều. **Lỗi thứ hai — lấy phân vị làm ngưỡng nghĩa là bạn đã tự cam kết một tỉ lệ cảnh báo cố định**, bất kể có tấn công hay không. Với 8 triệu phiên, phân vị 99,9% nghĩa là **8.000 cảnh báo**, và con số đó không đổi kể cả trong ngày hoàn toàn yên bình. Cách đúng: đặt ngưỡng trên một **tập hiệu chuẩn tách theo thời gian**, và chọn theo ngân sách cảnh báo mà đội SOC thực sự xử lý được — đúng phương pháp ở t4-l4.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Autoencoder cho dữ liệu phiên đăng nhập, kèm cách đặt ngưỡng đúng.',
          code:
            'import torch\n' +
            'import torch.nn as nn\n' +
            '\n' +
            'class AE(nn.Module):\n' +
            '    def __init__(self, d_vao=64, d_z=8):        # nút cổ chai CHẬT là chủ ý\n' +
            '        super().__init__()\n' +
            '        self.enc = nn.Sequential(nn.Linear(d_vao, 32), nn.ReLU(), nn.Linear(32, d_z))\n' +
            '        self.dec = nn.Sequential(nn.Linear(d_z, 32), nn.ReLU(), nn.Linear(32, d_vao))\n' +
            '\n' +
            '    def forward(self, x):\n' +
            '        return self.dec(self.enc(x))\n' +
            '\n' +
            'def diem_bat_thuong(model, X):\n' +
            '    model.eval()\n' +
            '    with torch.no_grad():\n' +
            '        return ((model(X) - X) ** 2).mean(dim=1)     # lỗi tái tạo từng mẫu\n' +
            '\n' +
            '# Huấn luyện trên tháng 1-3. Ngưỡng lấy từ THÁNG 4 (tập hiệu chuẩn riêng),\n' +
            '# và chọn theo ngân sách cảnh báo chứ không theo một phân vị đẹp mắt.\n' +
            'diem_hc = diem_bat_thuong(model, X_thang_4)\n' +
            'ngan_sach_moi_ngay = 40\n' +
            'ti_le = 1 - ngan_sach_moi_ngay * 30 / len(X_thang_4)\n' +
            'nguong = torch.quantile(diem_hc, ti_le)\n' +
            'print("Ngưỡng:", float(nguong), "→ khoảng", ngan_sach_moi_ngay, "cảnh báo/ngày")\n',
        },
        { t: 'h', text: 'Học tương phản: dạy mạng cái gì NÊN giống nhau', level: 2 },
        {
          t: 'p',
          md: 'Autoencoder học biểu diễn bằng cách trả lời câu hỏi "nén thế nào cho dựng lại được". Đó là một câu hỏi hơi lệch: nó buộc mạng giữ lại cả những chi tiết không ai quan tâm, ví dụ độ dài chính xác của user-agent.',
        },
        {
          t: 'p',
          md: '**Học tương phản** (contrastive learning) đặt câu hỏi tốt hơn: *"hai thứ nào nên nằm gần nhau trong không gian biểu diễn?"* Bạn tạo các **cặp dương** (nên gần) và **cặp âm** (nên xa), rồi huấn luyện encoder kéo cặp dương lại và đẩy cặp âm ra. Trong thị giác máy tính, cặp dương là hai phép biến đổi của cùng một ảnh (SimCLR, Chen và cộng sự 2020). Trong bảo mật, **bạn định nghĩa cặp dương từ tri thức miền** — và đây chính là chỗ giá trị được tạo ra hoặc bị đánh mất.',
        },
        {
          t: 'table',
          head: ['Bài toán', 'Cặp dương (nên gần nhau)', 'Vì sao hợp lý'],
          rows: [
            ['Phân loại họ mã độc', 'Hai mẫu cùng họ theo kết quả phân cụm của nhà phân tích', 'Buộc encoder giữ hành vi lõi, bỏ qua khác biệt bề mặt giữa các biến thể'],
            ['Mã độc bền với packer', 'Cùng một tệp gốc đóng gói bằng hai packer khác nhau', 'Dạy encoder rằng lớp vỏ đóng gói không phải bản chất — chữa đúng cái bẫy UPX'],
            ['Hành vi người dùng', 'Hai phiên của cùng một người trong cùng một tuần', 'Encoder học "chữ ký hành vi" của từng người, nền tảng cho UEBA'],
            ['Dòng lệnh độc hại', 'Cùng một lệnh trước và sau khi làm rối (base64, chèn nháy, đổi biến môi trường)', 'Encoder bỏ qua lớp làm rối và giữ lại ý định thật'],
          ],
          caption: 'Cặp dương chính là nơi bạn tiêm tri thức miền vào mô hình. Định nghĩa sai thì encoder học đúng cái sai đó, rất hiệu quả.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Quy trình dùng được ngay với 8 triệu mẫu và 312 nhãn',
          md: '**Một.** Huấn luyện encoder trên toàn bộ 8 triệu mẫu không nhãn — autoencoder hoặc học tương phản, tuỳ bạn có định nghĩa được cặp dương tốt hay không.\n\n**Hai.** Đóng băng encoder. Biến 312 mẫu dương và một mẫu ngẫu nhiên các mẫu âm thành vector 64 chiều.\n\n**Ba.** Huấn luyện `LogisticRegression` hoặc `LightGBM` trên các vector đó. Vài giây. Giải thích được, hiệu chuẩn được, triển khai được.\n\n**Bốn — bước hay bị bỏ qua:** so với đường cơ sở là chính đặc trưng thủ công của bạn cộng với đặc trưng "lỗi tái tạo". Rất thường xuyên, đường cơ sở này thắng, và khi đó bạn vừa tiết kiệm được một hệ thống phải bảo trì.\n\nQuan trọng: **đừng fine-tune encoder với 312 nhãn.** Đó là cách nhanh nhất để phá huỷ biểu diễn học từ 8 triệu mẫu và quá khớp vào 312 mẫu.',
        },
        {
          t: 'compare',
          title: 'Hai cách khai thác dữ liệu không nhãn',
          left: {
            title: 'Autoencoder',
            icon: 'package',
            items: [
              'Không cần định nghĩa gì ngoài dữ liệu — chạy được ngay',
              'Cho ra cả embedding lẫn một điểm bất thường dùng được',
              'Giữ lại cả chi tiết vô nghĩa vì mục tiêu là dựng lại nguyên vẹn',
              'Dễ thất bại im lặng khi nút cổ chai quá rộng',
              'Đường cơ sở phải vượt: PCA và Isolation Forest',
            ],
          },
          right: {
            title: 'Học tương phản',
            icon: 'git-compare',
            items: [
              'Bắt buộc phải định nghĩa cặp dương — tốn công suy nghĩ',
              'Chỉ cho embedding, không tự sinh điểm bất thường',
              'Bỏ được chi tiết vô nghĩa nếu cặp dương được thiết kế đúng',
              'Thất bại lộ liễu hơn: cặp dương sai thì embedding vô dụng thấy ngay',
              'Đường cơ sở phải vượt: chính autoencoder và đặc trưng thủ công',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Giả định chết người: dữ liệu huấn luyện phải sạch',
          md: 'Mọi phương pháp trong bài này đều dựa trên một giả định: **8 triệu phiên kia đại diện cho cái bình thường.** Nhưng bạn đã học ở t0-l2 rằng thời gian phát hiện xâm nhập tính bằng tuần đến tháng. Nếu trong 18 tháng dữ liệu đó có một cuộc xâm nhập chưa bị phát hiện, autoencoder đã học coi hành vi của kẻ tấn công là bình thường — và sẽ **im lặng vĩnh viễn** với đúng loại tấn công đó.\n\nBiện pháp giảm nhẹ, không phải giải pháp: cắt bỏ phần đuôi lỗi tái tạo cao nhất khỏi tập huấn luyện rồi huấn luyện lại (robust autoencoder); huấn luyện trên nhiều cửa sổ thời gian rời nhau và so kết quả; và ghi rõ giả định này vào tài liệu mô hình để người kế nhiệm biết mà kiểm tra lại.',
        },
        { t: 'terms', ids: ['autoencoder', 'embedding', 'bat-thuong', 'isolation-forest', 'nguong', 'weak-supervision'] },
      ],
      keyTakeaways: [
        'Học biểu diễn tách bài toán khó thành hai bài dễ: học vector từ 8 triệu mẫu không nhãn, rồi vạch ranh giới bằng 312 nhãn.',
        'Autoencoder nén qua nút cổ chai rồi dựng lại; lỗi tái tạo cao nghĩa là mẫu không khớp cấu trúc phổ biến của dữ liệu.',
        'Lỗi tái tạo đo độ khớp với cấu trúc, KHÔNG đo độ độc hại — tấn công tự động đều đặn có thể cho điểm bất thường thấp hơn người dùng thật.',
        'Autoencoder tuyến tính với MSE tương đương PCA; nếu mạng sâu của bạn không vượt PCA rõ rệt thì phần phi tuyến vô ích.',
        'Đừng đặt ngưỡng bằng phân vị trên tập huấn luyện: hãy dùng tập hiệu chuẩn tách theo thời gian và chọn theo ngân sách cảnh báo.',
        'Học tương phản cho biểu diễn tốt hơn khi bạn định nghĩa được cặp dương từ tri thức miền — cùng họ mã độc, cùng tệp khác packer, cùng người dùng.',
        'Đóng băng encoder rồi huấn luyện mô hình nhỏ trên nhãn hiếm; fine-tune encoder bằng 312 nhãn là cách nhanh nhất để phá huỷ nó.',
        'Mọi thứ trong bài đều giả định dữ liệu huấn luyện sạch — mà dữ liệu bảo mật thì gần như không bao giờ sạch.',
      ],
      cards: [
        {
          id: 't7l5-c1',
          front: 'Học biểu diễn giải quyết vấn đề khan hiếm nhãn bằng cách nào?',
          back: 'Tách thành hai bước: dùng toàn bộ dữ liệu không nhãn để học một hàm biến dữ liệu thô thành vector có ý nghĩa, rồi dùng nhúm nhãn hiếm để huấn luyện một mô hình nhỏ trên vector đó.',
          tags: ['hoc-bieu-dien'],
        },
        {
          id: 't7l5-c2',
          front: 'Nêu hai cách autoencoder thất bại khi dùng để phát hiện bất thường.',
          back: '1) Mạng đủ lớn học một thuật toán nén tổng quát nên tái tạo tốt cả mẫu chưa từng thấy. 2) Tấn công đều đặn (dò mật khẩu tự động) dễ tái tạo hơn hành vi người thật nên cho điểm bất thường THẤP.',
          tags: ['autoencoder', 'bat-thuong'],
        },
        {
          id: 't7l5-c3',
          front: 'Autoencoder tuyến tính với mất mát MSE tương đương phương pháp cổ điển nào?',
          back: 'PCA — học ra cùng một không gian con. Vì vậy PCA là đường cơ sở bắt buộc: nếu autoencoder sâu không vượt nó rõ rệt thì phần phi tuyến không đóng góp gì.',
          tags: ['autoencoder', 'hoc-bieu-dien'],
        },
        {
          id: 't7l5-c4',
          front: 'Vì sao không nên đặt ngưỡng bất thường bằng phân vị 99,9% của tập huấn luyện?',
          back: 'Vì mạng đã tối ưu trên chính dữ liệu đó nên phân bố lỗi lạc quan có hệ thống; và phân vị cố định tự cam kết một số cảnh báo cố định bất kể có tấn công hay không.',
          tags: ['autoencoder', 'nguong'],
        },
        {
          id: 't7l5-c5',
          front: 'Trong học tương phản cho bảo mật, cặp dương được định nghĩa thế nào? Cho hai ví dụ.',
          back: 'Từ tri thức miền: hai mẫu cùng họ mã độc; cùng một tệp đóng gói bằng hai packer khác nhau; hai phiên của cùng một người trong một tuần; một lệnh trước và sau khi làm rối.',
          tags: ['contrastive-learning'],
        },
        {
          id: 't7l5-c6',
          front: 'Sau khi pretrain encoder trên 8 triệu mẫu, vì sao KHÔNG nên fine-tune nó bằng 312 nhãn?',
          back: 'Vì gradient từ 312 mẫu sẽ phá huỷ biểu diễn học được từ 8 triệu mẫu và quá khớp vào chúng. Hãy đóng băng encoder, chỉ huấn luyện một mô hình nhỏ phía trên.',
          tags: ['hoc-bieu-dien', 'qua-khop'],
        },
      ],
      quiz: [
        {
          id: 't7l5-q1',
          kind: 'mcq',
          tags: ['autoencoder', 'bat-thuong'],
          q: 'Autoencoder của bạn đạt PR-AUC 0,42 trên tập kiểm tra. PCA đạt 0,44. Kết luận và hành động đúng?',
          options: [
            'Autoencoder cần thêm lớp và thêm epoch để vượt PCA',
            'Phần phi tuyến không đóng góp gì cho bài toán này — dùng PCA, ghi lại kết quả, và đầu tư công sức vào đặc trưng hoặc nhãn thay vì kiến trúc',
            'PCA đang bị rò rỉ dữ liệu nên kết quả không đáng tin',
            'Cả hai đều thất bại vì PR-AUC dưới 0,5',
          ],
          answer: 1,
          why: 'Đây là kết quả **thông tin nhất** bạn có thể nhận được, không phải kết quả xấu. Nó nói rằng cấu trúc "bình thường" trong dữ liệu của bạn xấp xỉ tuyến tính, nên mọi độ phức tạp thêm vào chỉ tạo chi phí. Hành động đúng là chuyển nguồn lực sang chỗ có đòn bẩy thật: đặc trưng tốt hơn, nhãn nhiều hơn, hoặc kết hợp lỗi tái tạo vào một mô hình có giám sát. Phương án 4 sai vì PR-AUC phải so với **tỉ lệ nền**: với tỉ lệ dương 0,0039%, con số 0,44 là cực kỳ tốt chứ không hề kém.',
          distractorWhy: [
            'Thêm dung lượng cho một mô hình đã không vượt được đường cơ sở tuyến tính là đầu tư vào đúng chỗ không có đòn bẩy.',
            '',
            'PCA fit trên tập huấn luyện và áp lên tập kiểm tra không rò rỉ gì; nếu nghi ngờ thì cả hai mô hình đều dùng chung cách chia.',
            'PR-AUC phải so với tỉ lệ nền, không so với 0,5. Với tỉ lệ dương 0,0039%, 0,44 là kết quả rất mạnh.',
          ],
        },
        {
          id: 't7l5-q2',
          kind: 'multi',
          tags: ['contrastive-learning'],
          q: 'Bạn thiết kế học tương phản cho biểu diễn tệp PE bền với packer. Cặp dương nào hợp lý? (Chọn tất cả đáp án đúng)',
          options: [
            'Cùng một tệp gốc, đóng gói bằng UPX và bằng một packer thương mại khác',
            'Hai mẫu được nhà phân tích xác nhận thuộc cùng một họ mã độc',
            'Hai tệp có cùng kích thước tính bằng byte',
            'Hai tệp được thu thập trong cùng một ngày',
          ],
          answers: [0, 1],
          why: 'Cặp dương phải mã hoá **bất biến mà bạn muốn encoder học**. Cùng tệp khác packer dạy encoder rằng lớp vỏ đóng gói không phải bản chất — chữa đúng cái bẫy UPX ở t0-l1. Cùng họ mã độc dạy encoder giữ hành vi lõi. Hai phương án còn lại tạo ra bất biến **sai**: cùng kích thước tệp là trùng hợp ngẫu nhiên, còn cùng ngày thu thập sẽ dạy encoder gom nhóm theo thời điểm thu thập — đúng dạng tương quan giả, và nó sẽ khiến mô hình sụp đổ ngay khi bạn thu thập dữ liệu theo lịch khác.',
        },
        {
          id: 't7l5-q3',
          kind: 'order',
          tags: ['hoc-bieu-dien', 'thuc-chien'],
          q: 'Sắp xếp quy trình khai thác 8 triệu mẫu không nhãn với 312 nhãn xác nhận, theo thứ tự đúng.',
          items: [
            'Chạy PCA và Isolation Forest làm đường cơ sở, ghi lại PR-AUC',
            'Huấn luyện encoder trên toàn bộ dữ liệu không nhãn',
            'Đóng băng encoder và biến dữ liệu có nhãn thành vector',
            'Huấn luyện mô hình nhỏ có giám sát trên các vector đó',
            'So với đường cơ sở trên tập chia theo thời gian và quyết định giữ hay bỏ',
          ],
          why: 'Đường cơ sở đứng **đầu tiên**, không phải cuối cùng: nếu bạn chạy nó sau, bạn sẽ có động cơ tâm lý để bào chữa cho hệ thống phức tạp mình vừa xây trong ba tuần. Bước đóng băng encoder trước khi huấn luyện có giám sát là bắt buộc — fine-tune bằng 312 nhãn phá huỷ chính thứ bạn vừa học từ 8 triệu mẫu. Bước cuối phải trên tập chia theo thời gian, vì mọi so sánh trên tập chia ngẫu nhiên đều thiên vị mô hình có dung lượng ghi nhớ lớn hơn.',
        },
        {
          id: 't7l5-q4',
          kind: 'truefalse',
          tags: ['autoencoder', 'du-lieu'],
          q: 'Nếu dữ liệu 18 tháng dùng để huấn luyện autoencoder có chứa một cuộc xâm nhập chưa bị phát hiện, hậu quả chỉ là mô hình kém chính xác hơn một chút.',
          answer: false,
          why: 'Hậu quả nghiêm trọng và có định hướng, chứ không phải nhiễu ngẫu nhiên: autoencoder đã học coi hành vi của **chính kẻ tấn công đó** là bình thường, nên nó sẽ im lặng vĩnh viễn với đúng loại tấn công ấy. Bạn đã tạo ra một điểm mù có chủ đích mà không biết. Điều này khác hẳn với việc mất một chút độ chính xác đồng đều. Biện pháp giảm nhẹ: cắt phần đuôi lỗi tái tạo cao nhất khỏi tập huấn luyện rồi huấn luyện lại, huấn luyện trên nhiều cửa sổ thời gian rời nhau và so kết quả, và ghi giả định này vào tài liệu mô hình.',
        },
        {
          id: 't7l5-q5',
          kind: 'match',
          tags: ['bat-thuong', 'hoc-bieu-dien'],
          q: 'Nối mỗi phương pháp với giả định ngầm mà nó đặt lên dữ liệu.',
          pairs: [
            ['PCA', 'Cấu trúc bình thường nằm trong một không gian con tuyến tính'],
            ['Isolation Forest', 'Điểm bất thường dễ bị cô lập bằng vài lát cắt ngẫu nhiên'],
            ['Autoencoder', 'Cái bình thường thì nén được, cái bất thường thì không'],
            ['Học tương phản', 'Bạn định nghĩa được cặp mẫu nên giống nhau từ tri thức miền'],
          ],
          why: 'Mỗi phương pháp phát hiện bất thường là một **giả định về hình dạng của cái bình thường**, chứ không phải một thuật toán trung lập. Chọn phương pháp chính là chọn giả định. Khi một bộ phát hiện hoạt động kém, câu hỏi hữu ích nhất không phải "tinh chỉnh gì nữa" mà là "giả định nào của nó đang bị dữ liệu của tôi vi phạm".',
        },
      ],
      terms: ['autoencoder', 'embedding', 'bat-thuong', 'isolation-forest', 'nguong', 'weak-supervision'],
      further: [
        {
          title: 'A Simple Framework for Contrastive Learning of Visual Representations (SimCLR) — Chen và cộng sự (2020)',
          note: 'Bài báo làm học tương phản trở nên phổ biến. Đọc phần về vai trò của phép biến đổi tạo cặp dương — đó chính là chỗ bạn phải thay bằng tri thức miền bảo mật.',
        },
        {
          title: 'Tài liệu Isolation Forest và Local Outlier Factor của scikit-learn',
          note: 'Hai đường cơ sở phải vượt trước khi động tới GPU. Trang so sánh các bộ phát hiện ngoại lai của scikit-learn cho thấy rõ giả định của từng phương pháp.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't7-l6',
      trackId: 'deep-learning',
      title: 'Khi nào KHÔNG nên dùng deep learning',
      subtitle: 'Bài quan trọng nhất chặng này: phần lớn bài toán bảo mật là dữ liệu bảng, và cây vẫn thắng',
      minutes: 28,
      practiceMinutes: 7,
      level: 'trung-cap',
      prereqs: ['t7-l3', 't7-l5', 't3-l5', 't6-l2'],
      why: {
        short:
          'Chọn sai họ mô hình là sai lầm tốn kém nhất trong một dự án ML bảo mật, và hướng chọn sai phổ biến nhất hiện nay là đem deep learning vào dữ liệu bảng.',
        scenario:
          'Sếp vừa duyệt ngân sách GPU sau một hội thảo và giao bạn "hiện đại hoá mô hình phát hiện". Mô hình LightGBM đang chạy nặng 12 MB, suy luận trên CPU, PR-AUC 0,81. Bạn có 40 phút để trình bày nên thay hay nên giữ, và phần ngân sách đó nên đi đâu.',
        roles: ['Security Data Scientist', 'ML Engineer', 'Security Architect', 'Detection Engineer'],
        costOfNotKnowing:
          'Bạn thay một mô hình chạy trên CPU bằng một mô hình cần GPU cho kết quả ngang nhau, nhân chi phí hạ tầng lên hàng chục lần, mất khả năng giải thích cho kiểm toán, và tạo ra một bề mặt tấn công gradient mà trước đó không có.',
      },
      objectives: [
        'Nêu được ba lý do kỹ thuật vì sao mô hình cây thắng deep learning trên dữ liệu bảng',
        'Ước lượng chi phí suy luận theo giờ CPU mỗi ngày từ độ trễ mỗi mẫu và lưu lượng thật',
        'Liệt kê năm chi phí ẩn của deep learning trong vận hành mà bảng so sánh chất lượng không thể hiện',
        'Nêu bốn tình huống deep learning thực sự thắng, kèm dấu hiệu nhận biết',
        'Dùng danh sách kiểm tra bảy câu để ra quyết định chọn họ mô hình và bảo vệ được quyết định đó',
      ],
      blocks: [
        {
          t: 'p',
          md: 'Năm bài trước dạy bạn deep learning làm được gì. Bài này trả lời câu hỏi mà bạn sẽ thực sự phải trả lời trong công việc: **bài toán trước mặt tôi có cần nó không?** Với phần lớn bài toán bảo mật, câu trả lời trung thực là không — và bạn cần biết vì sao, bằng số liệu chứ không bằng cảm tính.',
        },
        {
          t: 'predict',
          question:
            'Bạn có một bảng 2.381 đặc trưng tệp PE và 900.000 mẫu đã gắn nhãn. So sánh một mạng MLP được tinh chỉnh cẩn thận với một mô hình LightGBM tinh chỉnh cẩn thận. Theo bạn cái nào thắng, và quan trọng hơn: **vì sao** kết quả lại như vậy?',
          reveal:
            'LightGBM thắng, thường là thắng rõ, và nó thắng ngay cả khi bạn cho MLP nhiều thời gian tinh chỉnh hơn. Đây không phải giai thoại mà là kết quả có hệ thống: Grinsztajn, Oyallon và Varoquaux (NeurIPS 2022, *Why do tree-based models still outperform deep learning on typical tabular data?*) so sánh trên khoảng 45 bộ dữ liệu bảng và mô hình cây thắng đều đặn; Shwartz-Ziv và Armon (2022, *Tabular Data: Deep Learning is Not All You Need*) đi tới cùng kết luận khi kiểm tra lại các bài báo tuyên bố ngược lại.\n\n**Ba lý do, và cả ba đều mô tả đúng dữ liệu bảo mật:**\n\n**1. Mạng nơ-ron thiên vị hàm trơn.** Cấu trúc của nó khiến nó thích những hàm biến đổi từ từ. Nhưng ranh giới thật trong dữ liệu bảng thường là bậc thang: "tệp có chữ ký số hợp lệ hay không", "số lượng imports vượt 40 hay không". Cây chia bằng nhát cắt vuông góc — đó chính xác là hình dạng của ranh giới cần học. Mạng phải tốn rất nhiều dung lượng chỉ để xấp xỉ một cái bậc thang.\n\n**2. Mạng nhạy với đặc trưng vô dụng.** Thêm 200 cột nhiễu vào dữ liệu, mô hình cây gần như không suy suyển vì tiêu chí chia đơn giản là không bao giờ chọn chúng. MLP thì phải học cách đặt trọng số của chúng về gần 0, và với dữ liệu hữu hạn nó làm việc đó không hoàn hảo. Bộ đặc trưng bảo mật thật luôn có hàng trăm cột gần như vô dụng.\n\n**3. Mạng bất biến với phép quay, còn dữ liệu bảng thì không.** Với ảnh, trộn lẫn thông tin giữa các chiều là hợp lý. Với dữ liệu bảng, mỗi cột có ý nghĩa riêng và một tổ hợp tuyến tính của "entropy" với "số section" là một đại lượng vô nghĩa. Cây tôn trọng ranh giới cột; mạng bắt đầu bằng cách xoá nhoè chúng.',
        },
        { t: 'h', text: 'Bảng so sánh đầy đủ — không chỉ chất lượng', level: 2 },
        {
          t: 'table',
          head: ['Tiêu chí', 'LightGBM / XGBoost', 'MLP trên cùng đặc trưng', 'CNN byte / Transformer'],
          rows: [
            ['Chất lượng trên dữ liệu bảng', 'Thường tốt nhất', 'Thường kém hơn một chút', 'Không áp dụng trực tiếp'],
            ['Phần cứng huấn luyện', 'CPU nhiều lõi', 'GPU nên có', 'GPU bắt buộc'],
            ['Thời gian huấn luyện điển hình', 'Vài phút tới vài chục phút', 'Vài chục phút tới vài giờ', 'Hàng chục giờ tới hàng ngày'],
            ['Số siêu tham số phải tinh chỉnh', 'Khoảng 5, mặc định đã khá tốt', 'Khoảng 10, mặc định thường không đủ', 'Trên 15, nhạy cảm'],
            ['Kích thước mô hình', 'Vài MB tới vài chục MB', 'Vài MB tới vài trăm MB', 'Hàng trăm MB'],
            ['Suy luận', 'Dưới 1 ms trên một lõi CPU', 'Vài ms trên CPU', 'Hàng chục ms, cần GPU để có thông lượng'],
            ['Giải thích', 'TreeSHAP chính xác, tên đặc trưng đọc được', 'SHAP xấp xỉ, chậm hơn', 'Bản đồ nổi bật, không ổn định'],
            ['Xử lý giá trị thiếu', 'Có sẵn trong thuật toán', 'Phải tự điền trước', 'Phải tự xử lý'],
            ['Xử lý biến hạng mục nhiều mức', 'Tốt (CatBoost đặc biệt tốt)', 'Cần embedding riêng', 'Cần embedding riêng'],
            ['Bề mặt tấn công đối kháng', 'Không có gradient để khai thác trực tiếp', 'Gradient sẵn có', 'Gradient sẵn có, đã có công cụ tấn công đóng gói sẵn'],
            ['Tái lập kết quả', 'Cố định seed là ra đúng kết quả', 'Có nguồn không xác định trên GPU', 'Khó tái lập chính xác'],
          ],
          caption: 'Cột thứ nhất thắng ở 9 trên 11 dòng cho bài toán dữ liệu bảng. Đây là lý do nó vẫn là mặc định trong ngành, chứ không phải vì ai đó bảo thủ.',
        },
        {
          t: 'h',
          text: 'Chi phí suy luận: hãy tính, đừng đoán',
          level: 2,
        },
        {
          t: 'steps',
          title: 'Quy đổi độ trễ thành giờ CPU mỗi ngày',
          steps: [
            {
              title: 'Bước 1 — Đo độ trễ trên một mẫu, ép dùng một lõi',
              md: 'Ép một lõi để con số nhân lên được. Nếu bạn đo với 32 lõi rồi nhân lên, bạn sẽ ra một con số hạ tầng sai lệch hoàn toàn khi triển khai trên máy nhỏ hơn.',
            },
            {
              title: 'Bước 2 — Nhân với lưu lượng thật, không phải lưu lượng trung bình',
              md: '10 triệu sự kiện mỗi ngày. Với 0,3 ms mỗi mẫu: 10.000.000 × 0,0003 giây = 3.000 giây = **0,83 giờ CPU mỗi ngày**. Một lõi làm dư sức. Với 30 ms mỗi mẫu: 300.000 giây = **83 giờ CPU mỗi ngày**, tức bạn cần ít nhất 4 lõi chạy liên tục chỉ để theo kịp trung bình.',
            },
            {
              title: 'Bước 3 — Nhân hệ số đỉnh',
              md: 'Lưu lượng bảo mật không đều. Giờ làm việc buổi sáng thường gấp 3–5 lần mức trung bình cả ngày. Nếu bạn chỉ có đủ công suất cho mức trung bình, hàng đợi sẽ dồn lại đúng lúc bạn cần phát hiện nhanh nhất. Nhân con số ở bước 2 với hệ số đỉnh thật đo được từ log của chính bạn.',
            },
            {
              title: 'Bước 4 — Cộng chi phí trích xuất đặc trưng',
              md: 'Đây là chỗ hay bị quên. Với mô hình PE, việc parse tệp và trích 2.381 đặc trưng thường **tốn nhiều thời gian hơn** bản thân phép suy luận. Với mô hình byte thô, bạn tiết kiệm được bước này nhưng phải đọc và chuyển 2 MB dữ liệu cho mỗi tệp. So sánh tổng chi phí đường ống, không so từng mảnh.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Đo thật thay vì trích dẫn con số của người khác — bao gồm cả bài này.',
          code:
            'import time\n' +
            'import numpy as np\n' +
            'import lightgbm as lgb\n' +
            '\n' +
            'X = np.random.rand(10_000, 2381).astype(np.float32)\n' +
            'booster = lgb.Booster(model_file="mo_hinh_ember.txt")\n' +
            '\n' +
            't0 = time.perf_counter()\n' +
            '_ = booster.predict(X, num_threads=1)          # ép 1 lõi để nhân lên được\n' +
            'dt = time.perf_counter() - t0\n' +
            '\n' +
            'ms_moi_mau = dt / len(X) * 1000\n' +
            'gio_cpu_moi_ngay = dt / len(X) * 10_000_000 / 3600     # 10 triệu sự kiện/ngày\n' +
            'print(f"{ms_moi_mau:.3f} ms/mẫu trên 1 lõi CPU")\n' +
            'print(f"{gio_cpu_moi_ngay:.1f} giờ CPU/ngày ở mức trung bình")\n' +
            'print(f"{gio_cpu_moi_ngay * 4:.1f} giờ CPU/ngày nếu hệ số đỉnh là 4")\n',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't7l6-cp1',
              kind: 'mcq',
              tags: ['chon-mo-hinh', 'gbdt'],
              q: 'Vì sao mô hình cây ít bị ảnh hưởng bởi 200 cột đặc trưng vô dụng hơn hẳn MLP?',
              options: [
                'Vì cây có ít tham số hơn nên khó quá khớp',
                'Vì tiêu chí chia của cây đơn giản là không bao giờ chọn cột không giảm được độ lẫn, còn MLP phải học cách đưa trọng số của chúng về gần 0 và làm việc đó không hoàn hảo với dữ liệu hữu hạn',
                'Vì cây tự động chuẩn hoá đầu vào',
                'Vì LightGBM có bước chọn đặc trưng tích hợp sẵn trước khi huấn luyện',
              ],
              answer: 1,
              why: 'Cơ chế nằm ở chỗ **cây chọn đặc trưng như một hệ quả tự nhiên của cách nó xây**: mỗi nút thử mọi cột và chọn cột giảm độ lẫn nhiều nhất, nên cột nhiễu đơn giản là không được chọn. MLP thì mọi cột đều nối vào mọi nơ-ron ở lớp đầu ngay từ bước khởi tạo, và mạng phải **học** rằng nên bỏ qua chúng — với dữ liệu hữu hạn, phần trọng số dư đó trở thành nguồn phương sai. Đây là một trong ba lý do chính trong bài báo của Grinsztajn và cộng sự.',
              distractorWhy: [
                'Một ensemble gradient boosting có thể có nhiều tham số hơn MLP; số lượng không phải nguyên nhân.',
                '',
                'Cây bất biến với phép biến đổi đơn điệu nên không cần chuẩn hoá, nhưng đó là chuyện khác với việc chống nhiễu.',
                'LightGBM không có bước chọn đặc trưng riêng trước khi huấn luyện; việc chọn diễn ra ngay trong lúc xây từng nút.',
              ],
            },
            {
              id: 't7l6-cp2',
              kind: 'truefalse',
              tags: ['chon-mo-hinh', 'doi-khang'],
              q: 'Mô hình gradient boosting miễn nhiễm với tấn công đối kháng vì không có gradient để kẻ tấn công khai thác.',
              answer: false,
              why: 'Không miễn nhiễm — chỉ **đắt hơn để tấn công**. Kẻ tấn công vẫn có thể dò theo kiểu hộp đen (thử và quan sát điểm số), tấn công bằng thuật toán tiến hoá, hoặc huấn luyện một mô hình thay thế khả vi rồi chuyển mẫu đối kháng sang. Điểm khác biệt thật nằm ở chỗ **không có đường tối ưu trơn để đi theo**, nên chi phí mỗi lần né cao hơn nhiều và kẻ tấn công cần nhiều lượt truy vấn hơn — đó là thứ bạn có thể giám sát và giới hạn. Đừng bán "không có gradient" như một sự an toàn; hãy bán nó như một mức chi phí. Chi tiết ở chặng 8.',
            },
          ],
        },
        {
          t: 'lab',
          id: 'lab-tabular',
          intro:
            'Đừng tin câu "cây thắng trên dữ liệu bảng" chỉ vì bài học nói vậy — hãy tự đo. Lab cho bạn ba núm của mạng nơ-ron và **không núm nào** cho Random Forest. Ở cấu hình mặc định, Random Forest dẫn 3,3 điểm. Nhưng có một điểm đặt cho mạng chạm được trần lý thuyết và vượt Random Forest; hãy đi tìm nó, rồi đếm xem bạn đã kéo bao nhiêu lần. Con số đó mới là bài học thật của bài này.',
        },
        { t: 'h', text: 'Năm chi phí ẩn không nằm trong bảng chất lượng', level: 2 },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Giải thích cho người phải hành động.** Analyst nhận cảnh báo lúc 2 giờ sáng cần biết điều tra cái gì. TreeSHAP cho ra "imports chứa CryptEncrypt đóng góp +0,31" — dùng được ngay. Bản đồ nổi bật trên chuỗi byte cho ra một vùng offset — analyst làm gì với nó? Tệ hơn, Adebayo và cộng sự (2018, *Sanity Checks for Saliency Maps*) chỉ ra một số phương pháp giải thích phổ biến cho ra bản đồ **gần như không đổi** ngay cả khi trọng số mô hình bị ngẫu nhiên hoá — nghĩa là chúng có thể không phản ánh mô hình chút nào.',
            '**Tuân thủ và kiểm toán.** NIST AI RMF và EU AI Act đều đòi hỏi khả năng mô tả cơ sở của quyết định tự động, đặc biệt khi quyết định đó ảnh hưởng tới con người (khoá tài khoản, chặn giao dịch). Một mô hình mà bạn không giải thích được là một khoản nợ pháp lý, không chỉ là một bất tiện kỹ thuật.',
            '**Vận hành và phụ thuộc.** Phiên bản CUDA, driver, kích thước ảnh container, hàng đợi GPU, và một người trực đêm biết xử lý khi suy luận GPU treo. Mỗi thứ là một chỗ hỏng mới trong lúc bạn đang có sự cố. Mô hình LightGBM là một tệp và một thư viện chạy ở mọi nơi.',
            '**Tái lập và khả năng quay lui.** Khi kiểm toán viên hỏi vì sao mô hình tháng trước chặn giao dịch này, bạn phải dựng lại đúng mô hình đó. Huấn luyện GPU có nguồn không xác định (thứ tự cộng dồn số thực, thuật toán cuDNN được chọn động), nên "chạy lại cùng mã cùng seed" không bảo đảm ra cùng trọng số.',
            '**Chi phí huấn luyện lại.** Đây là chi phí bị đánh giá thấp nhất. Trong bảo mật, bạn huấn luyện lại theo tuần hoặc theo tháng vì trôi khái niệm, không phải một lần rồi thôi. Nhân chi phí một lần huấn luyện với 52 tuần trước khi so sánh. Chênh lệch giữa 20 phút CPU và 30 giờ GPU mỗi tuần là một con số ngân sách thật, không phải chi tiết kỹ thuật.',
          ],
        },
        {
          t: 'figure',
          id: 'fig-latency-cost',
          caption:
            'Ba mươi mili-giây nghe như không có gì. Nhân với lưu lượng thật rồi nhân tiếp hệ số giờ cao điểm thì nó thành mười một lõi chạy liên tục, chưa kể chi phí trích xuất đặc trưng — thứ hầu như không ai đo và thường đắt hơn chính lượt suy luận. Con số cuối mới là thứ đem đi xin ngân sách được, và nó là lý do phép so sánh chỉ nhìn độ chính xác luôn thiếu một cột.',
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'Mẫu hình lặp đi lặp lại trong các đội bảo mật',
          md: 'Trình tự này quen thuộc tới mức có thể đoán trước, và nó không đến từ sự thiếu năng lực:\n\nĐội có một mô hình cây chạy tốt. Một dự án deep learning được khởi động, thường sau một hội thảo hoặc một đợt ngân sách mới. Sau ba tháng, mô hình mới đạt chỉ số **ngang bằng** trên tập kiểm tra ngoại tuyến. Vì đã đầu tư nhiều, nó được triển khai. Sáu tháng sau, đội quay lại mô hình cây — không phải vì chất lượng phát hiện, mà vì độ trễ ở giờ cao điểm, vì analyst phàn nàn không điều tra được cảnh báo, và vì không ai còn thời gian huấn luyện lại hàng tuần trên GPU.\n\nBài học không phải "đừng thử deep learning". Bài học là: **quyết định tiêu chí thành công TRƯỚC khi bắt đầu, và tiêu chí đó phải bao gồm độ trễ, khả năng giải thích và chi phí huấn luyện lại — không chỉ PR-AUC.** Nếu bạn không viết ra trước, sự đầu tư đã bỏ ra sẽ tự viết ra thay bạn.',
        },
        { t: 'h', text: 'Bốn tình huống deep learning thực sự thắng', level: 2 },
        {
          t: 'table',
          head: ['Tình huống', 'Dấu hiệu nhận biết', 'Ví dụ trong bảo mật'],
          rows: [
            ['Đầu vào thô có cấu trúc không gian hoặc thời gian', 'Bạn không có bộ đặc trưng thủ công tốt, và dữ liệu là chuỗi hoặc lưới', 'Chuỗi lời gọi API, chuỗi log, luồng gói tin theo thời gian'],
            ['Rất nhiều dữ liệu không nhãn, rất ít nhãn', 'Tỉ lệ nhãn dưới 0,1% và bạn có hàng triệu mẫu', 'Học biểu diễn trên 8 triệu phiên với 312 nhãn (bài t7-l5)'],
            ['Tận dụng được mô hình đã pretrain', 'Dữ liệu của bạn là ngôn ngữ tự nhiên hoặc mã nguồn', 'Phân loại nội dung email lừa đảo, phân tích mã nguồn, tóm tắt sự cố'],
            ['Đầu ra không phải một nhãn', 'Bạn cần embedding, bản sinh, hoặc điểm tương đồng', 'Tìm mẫu tương tự trong kho mã độc, gom cụm chiến dịch, khớp biến thể'],
          ],
        },
        {
          t: 'compare',
          title: 'Quyết định trong 60 giây',
          left: {
            title: 'Chọn GBDT khi…',
            icon: 'git-fork',
            items: [
              'Dữ liệu là bảng với đặc trưng đã thiết kế',
              'Dưới vài triệu dòng và hàng trăm tới vài nghìn cột',
              'Cần giải thích từng quyết định cho analyst hoặc kiểm toán',
              'Phải huấn luyện lại hàng tuần với ngân sách hữu hạn',
              'Suy luận chạy trên hạ tầng CPU sẵn có',
              'Bạn cần kết quả tái lập chính xác',
            ],
          },
          right: {
            title: 'Chọn deep learning khi…',
            icon: 'network',
            items: [
              'Đầu vào là chuỗi, byte thô, văn bản hoặc đồ thị',
              'Có hàng triệu mẫu, phần lớn không nhãn',
              'Tận dụng được trọng số pretrain sẵn có',
              'Cần embedding tái sử dụng cho nhiều bài toán',
              'Đã đo được rằng đường cơ sở đơn giản chạm trần',
              'Có người vận hành hạ tầng GPU dài hạn',
            ],
          },
        },
        {
          t: 'checklist',
          title: 'Bảy câu phải trả lời trước khi phê duyệt một dự án deep learning',
          items: [
            'Đường cơ sở GBDT trên cùng dữ liệu đạt bao nhiêu? Nếu chưa có con số này, dừng lại và làm nó trước — thường mất một ngày',
            'Ngưỡng cải thiện tối thiểu để đáng chuyển đổi là bao nhiêu, viết ra bằng số, trước khi bắt đầu?',
            'Ngân sách độ trễ mỗi sự kiện là bao nhiêu mili giây ở giờ cao điểm?',
            'Analyst sẽ nhìn thấy gì khi mô hình cảnh báo, và họ hành động được với thứ đó không?',
            'Chi phí huấn luyện lại nhân 52 tuần là bao nhiêu tiền?',
            'Ai vận hành hạ tầng GPU khi người xây dự án này chuyển việc?',
            'Nếu mô hình bị né, bạn phát hiện bằng cách nào và quay lui trong bao lâu?',
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Câu kết của cả chặng',
          md: 'Deep learning là một công cụ mạnh cho một lớp bài toán cụ thể: **dữ liệu thô có cấu trúc, nhiều, và bạn không có đặc trưng tốt.** Phần lớn bài toán phát hiện trong bảo mật không thuộc lớp đó — chúng là dữ liệu bảng với đặc trưng do người có tri thức miền thiết kế, và ở đó mô hình cây thắng về gần như mọi tiêu chí.\n\nGiá trị của việc học chặng này không phải để dùng deep learning nhiều hơn. Nó là để bạn **biết chính xác khi nào nên dùng** — và có đủ căn cứ để nói không, kể cả khi ngân sách đã được duyệt.',
        },
        { t: 'terms', ids: ['gbdt', 'shap', 'suy-luan', 'troi-khai-niem', 'nist-ai-rmf', 'eu-ai-act'] },
      ],
      keyTakeaways: [
        'Trên dữ liệu bảng, mô hình cây thắng deep learning một cách có hệ thống — kết quả đã được kiểm chứng trên khoảng 45 bộ dữ liệu (Grinsztajn và cộng sự, 2022).',
        'Ba lý do: mạng thiên vị hàm trơn còn ranh giới bảng là bậc thang; mạng nhạy với cột nhiễu; mạng xoá nhoè ranh giới cột vốn có ý nghĩa riêng.',
        'Luôn quy độ trễ thành giờ CPU mỗi ngày rồi nhân hệ số đỉnh: 0,3 ms/mẫu là 0,83 giờ CPU/ngày, 30 ms/mẫu là 83 giờ.',
        'Chi phí trích xuất đặc trưng thường lớn hơn chi phí suy luận — so sánh tổng đường ống, không so từng mảnh.',
        'Năm chi phí ẩn: giải thích cho analyst, tuân thủ, vận hành GPU, tái lập kết quả, và chi phí huấn luyện lại nhân 52 tuần.',
        'Mô hình cây không miễn nhiễm đối kháng — nó chỉ đắt hơn để tấn công, và đó là một mức chi phí chứ không phải một sự an toàn.',
        'Deep learning thắng ở bốn chỗ: đầu vào thô có cấu trúc, nhiều dữ liệu không nhãn, tận dụng pretrain, và khi đầu ra không phải một nhãn.',
        'Viết tiêu chí thành công ra giấy TRƯỚC khi bắt đầu — nếu không, khoản đầu tư đã bỏ ra sẽ tự quyết định thay bạn.',
      ],
      cards: [
        {
          id: 't7l6-c1',
          front: 'Nêu ba lý do kỹ thuật vì sao mô hình cây thắng deep learning trên dữ liệu bảng.',
          back: '1) Mạng thiên vị hàm trơn, còn ranh giới trong dữ liệu bảng là bậc thang. 2) Mạng nhạy với cột nhiễu, cây đơn giản không chọn chúng. 3) Mạng xoá nhoè ranh giới giữa các cột, mà mỗi cột bảng có ý nghĩa riêng.',
          tags: ['chon-mo-hinh', 'gbdt'],
        },
        {
          id: 't7l6-c2',
          front: '10 triệu sự kiện mỗi ngày, mô hình mất 30 ms mỗi mẫu trên một lõi. Bao nhiêu giờ CPU mỗi ngày?',
          back: '10.000.000 × 0,03 giây = 300.000 giây ≈ 83 giờ CPU/ngày, tức cần ít nhất 4 lõi chạy liên tục chỉ để theo kịp mức trung bình.',
          tags: ['chon-mo-hinh', 'suy-luan'],
        },
        {
          id: 't7l6-c3',
          front: 'Kể năm chi phí ẩn của deep learning không nằm trong bảng so sánh chất lượng.',
          back: 'Giải thích cho analyst hành động; tuân thủ và kiểm toán; vận hành hạ tầng GPU; tái lập kết quả để quay lui; và chi phí huấn luyện lại nhân số lần mỗi năm.',
          tags: ['chon-mo-hinh', 'van-hanh'],
        },
        {
          id: 't7l6-c4',
          front: 'Nêu bốn tình huống deep learning thực sự thắng trong bảo mật.',
          back: 'Đầu vào thô có cấu trúc (chuỗi, byte, đồ thị); nhiều dữ liệu không nhãn với rất ít nhãn; tận dụng được mô hình pretrain (văn bản, mã nguồn); và khi đầu ra là embedding hoặc bản sinh chứ không phải một nhãn.',
          tags: ['chon-mo-hinh'],
        },
        {
          id: 't7l6-c5',
          front: 'Vì sao "mô hình cây không có gradient" không có nghĩa là nó an toàn trước tấn công đối kháng?',
          back: 'Vì kẻ tấn công vẫn dò được theo kiểu hộp đen, dùng thuật toán tiến hoá, hoặc chuyển mẫu từ một mô hình thay thế khả vi. Khác biệt là chi phí và số lượt truy vấn, không phải khả năng.',
          tags: ['chon-mo-hinh', 'doi-khang'],
        },
      ],
      quiz: [
        {
          id: 't7l6-q1',
          kind: 'mcq',
          tags: ['chon-mo-hinh', 'thuc-chien'],
          q: 'Mô hình deep learning mới đạt PR-AUC 0,83 so với 0,81 của LightGBM đang chạy, nhưng cần GPU và độ trễ tăng từ 0,4 ms lên 25 ms mỗi mẫu. Quyết định hợp lý nhất?',
          options: [
            'Chuyển sang mô hình mới vì nó tốt hơn về chất lượng phát hiện',
            'Quy 0,02 PR-AUC ra số cảnh báo đúng thêm mỗi ngày, so với chi phí hạ tầng và chi phí giải thích, rồi quyết định bằng con số',
            'Giữ mô hình cũ vì deep learning luôn quá đắt',
            'Chạy cả hai vĩnh viễn để an toàn',
          ],
          answer: 1,
          why: 'Chênh lệch PR-AUC không phải đơn vị mà lãnh đạo hay đội SOC ra quyết định được. Hãy quy đổi: ở mức ngân sách cảnh báo hiện tại, mô hình mới bắt thêm bao nhiêu vụ thật mỗi tháng? Nếu là 3 vụ thì hãy so với chi phí GPU, chi phí analyst mất khả năng giải thích, và độ trễ tăng 60 lần. Con số đó có thể ra kết luận theo cả hai hướng — điều quan trọng là bạn quyết định bằng phép tính công khai chứ không bằng sở thích. Phương án 4 nghe an toàn nhưng nhân đôi chi phí vận hành và tạo ra câu hỏi không ai trả lời được: khi hai mô hình bất đồng thì nghe ai?',
          distractorWhy: [
            'Chất lượng đo trên tập kiểm tra ngoại tuyến chỉ là một trong ít nhất năm tiêu chí quyết định.',
            '',
            'Đây là quy tắc cứng nhắc theo chiều ngược lại; có những bài toán deep learning thắng rõ và bạn cần nhận ra chúng.',
            'Chạy song song hợp lý trong giai đoạn thử nghiệm có thời hạn, nhưng làm vĩnh viễn thì nhân đôi chi phí mà không giải quyết được xung đột giữa hai mô hình.',
          ],
        },
        {
          id: 't7l6-q2',
          kind: 'multi',
          tags: ['chon-mo-hinh'],
          q: 'Tình huống nào là lý do CHÍNH ĐÁNG để chọn deep learning? (Chọn tất cả đáp án đúng)',
          options: [
            'Đầu vào là chuỗi 3.000 lời gọi API và bạn không có bộ đặc trưng thủ công nào tốt',
            'Bạn có 12 triệu mẫu không nhãn và 400 nhãn xác nhận, cần học biểu diễn',
            'LightGBM đạt PR-AUC 0,79 và mục tiêu nghiệp vụ là 0,75',
            'Đội cần một dự án gây ấn tượng để xin ngân sách năm sau',
          ],
          answers: [0, 1],
          why: 'Hai lý do hợp lệ đều xuất phát từ **hình dạng của dữ liệu**: chuỗi thô không có đặc trưng tốt, và núi dữ liệu không nhãn cần khai thác. Phương án 3 là tín hiệu **dừng lại** — bạn đã vượt mục tiêu, mọi độ phức tạp thêm vào chỉ tạo thêm rủi ro mà không tạo thêm giá trị nghiệp vụ. Phương án 4 là động cơ tổ chức, và nó là nguồn gốc của mẫu hình ba tháng xây rồi sáu tháng quay lui đã kể trong bài. Nếu lý do thật là phương án 4, hãy tìm một bài toán mà deep learning thực sự thắng để đầu tư vào — có những bài toán như vậy.',
        },
        {
          id: 't7l6-q3',
          kind: 'input',
          tags: ['chon-mo-hinh', 'suy-luan'],
          q: 'Mô hình mất 5 ms mỗi mẫu trên một lõi CPU. Với 4 triệu sự kiện mỗi ngày, cần bao nhiêu giờ CPU mỗi ngày ở mức trung bình? Làm tròn tới một chữ số thập phân.',
          accept: ['5.6', '5,6', '5.6 gio', '5,6 gio'],
          placeholder: 'Ví dụ: 2,5',
          hint: 'Đổi mili giây sang giây, nhân số sự kiện, rồi chia cho 3.600.',
          why: '4.000.000 × 0,005 giây = 20.000 giây; 20.000 / 3.600 ≈ **5,6 giờ CPU mỗi ngày**. Một lõi chạy 24 giờ đủ cho mức trung bình, nhưng với hệ số đỉnh 4 vào buổi sáng bạn cần khoảng 22 giờ công suất dồn vào vài giờ — tức phải có ít nhất 4 lõi dành riêng. Phép tính ba dòng này là thứ biến một cuộc tranh luận về sở thích kiến trúc thành một quyết định về hạ tầng.',
        },
        {
          id: 't7l6-q4',
          kind: 'order',
          tags: ['chon-mo-hinh', 'thuc-chien'],
          q: 'Sắp xếp các bước đánh giá đề xuất "thay mô hình hiện tại bằng deep learning", theo thứ tự nên làm.',
          items: [
            'Ghi lại kết quả và chi phí của đường cơ sở hiện tại: PR-AUC, độ trễ, chi phí huấn luyện lại',
            'Viết ra bằng số ngưỡng cải thiện tối thiểu để việc chuyển đổi là đáng',
            'Xây bản thử nghiệm deep learning và đánh giá trên tập chia theo thời gian',
            'Đo độ trễ, chi phí huấn luyện lại và khả năng giải thích của mô hình mới',
            'So toàn bộ tiêu chí với ngưỡng đã viết ra ở bước 2 và ra quyết định',
          ],
          why: 'Bước 2 đứng trước bước 3 là điểm mấu chốt của cả quy trình. Nếu bạn định nghĩa "thế nào là đáng" **sau khi** đã bỏ ba tháng xây, bạn sẽ vô thức hạ chuẩn để hợp thức hoá công sức đã bỏ ra — đây là thiên lệch chi phí chìm và nó xảy ra với cả những đội giỏi. Viết ngưỡng ra giấy khi chưa có gì để bảo vệ là cách duy nhất để giữ được sự trung thực với chính mình về sau.',
        },
        {
          id: 't7l6-q5',
          kind: 'truefalse',
          tags: ['chon-mo-hinh', 'giai-thich'],
          q: 'Bản đồ nổi bật (saliency map) là một cách giải thích đáng tin cậy cho mô hình học sâu trong bảo mật.',
          answer: false,
          why: 'Cần rất nhiều thận trọng. Adebayo và cộng sự (2018) trong *Sanity Checks for Saliency Maps* chỉ ra một số phương pháp phổ biến cho ra bản đồ **gần như không đổi** ngay cả khi trọng số mô hình bị ngẫu nhiên hoá — nghĩa là chúng phản ánh cấu trúc của đầu vào nhiều hơn là phản ánh mô hình. Trong bảo mật vấn đề còn nặng hơn: analyst nhận được một vùng offset byte thay vì một mệnh đề hành động được như "tệp gọi CryptEncrypt và không có chữ ký số". Nếu bạn buộc phải dùng mô hình sâu, hãy đầu tư vào lớp giải thích **theo miền** — ánh xạ vùng nổi bật về cấu trúc PE hoặc về lời gọi API cụ thể — chứ đừng đưa thẳng bản đồ nhiệt cho người trực đêm.',
        },
      ],
      terms: ['gbdt', 'shap', 'suy-luan', 'troi-khai-niem', 'nist-ai-rmf', 'eu-ai-act'],
      further: [
        {
          title: 'Why do tree-based models still outperform deep learning on typical tabular data? — Grinsztajn, Oyallon & Varoquaux (NeurIPS 2022)',
          note: 'Nguồn của ba lý do trong bài. Phần thí nghiệm thêm cột nhiễu và phá bất biến quay đáng đọc kỹ vì nó áp dụng thẳng vào bộ đặc trưng bảo mật của bạn.',
        },
        {
          title: 'Tabular Data: Deep Learning is Not All You Need — Shwartz-Ziv & Armon (2022)',
          note: 'Kiểm tra lại các bài báo tuyên bố deep learning thắng trên dữ liệu bảng và cho thấy phần lớn ưu thế biến mất khi tinh chỉnh công bằng.',
        },
        {
          title: 'Sanity Checks for Saliency Maps — Adebayo và cộng sự (2018)',
          note: 'Đọc trước khi bạn đặt niềm tin vào bất kỳ bản đồ nhiệt giải thích nào. Phép thử ngẫu nhiên hoá trọng số là thứ bạn nên tự chạy trên mô hình của mình.',
        },
      ],
    },
  ],
};
