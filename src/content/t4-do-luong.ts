import type { Track } from './types';

/**
 * CHẶNG 4 — Đo lường và ra quyết định.
 *
 * Đây là chặng bản lề của cả khoá. Ba chặng trước dạy bạn xây được một mô hình;
 * chặng này dạy bạn trả lời câu hỏi mà không thư viện nào trả lời hộ:
 * "mô hình này tốt hay không, tốt theo nghĩa nào, và ta nên chặn ở đâu?"
 *
 * Thiết kế sư phạm:
 *  - Nền tảng (ma trận nhầm lẫn, precision/recall) nằm ở CUỐI CHẶNG 2, không ở
 *    đây: chặng 3 cần bộ từ vựng đó để chấm điểm mô hình, mà chặng 3 đứng trước
 *    chặng 4. Hai bài ấy giữ id t4-l1 và t4-l2 vì id là khoá lưu tiến độ.
 *  - Bài đầu (t4-l3) dạy đọc đường cong — nơi 90% người làm ML bảo mật đọc sai.
 *  - t4-l4 là đỉnh của chặng: biến chỉ số thành QUYẾT ĐỊNH bằng tiền và giờ người.
 *  - t4-l5 và t4-l6 vá hai lỗ hổng khiến quyết định ở t4-l4 sai: mất cân bằng và
 *    hiệu chuẩn.
 *  - t4-l7 quy tất cả về đơn vị mà tổ chức thực sự chi trả: giờ analyst và sự cố
 *    bị bỏ sót.
 */
export const track4: Track = {
  id: 'do-luong',
  order: 4,
  title: 'Đo lường và ra quyết định',
  tagline: 'Chặng quyết định bạn là kỹ sư hay người chạy thư viện',
  icon: 'chart',
  hue: 't4',
  blurb:
    'Bảy bài về câu hỏi khó nhất trong ML bảo mật: mô hình này tốt hay không, và tốt theo nghĩa nào. Bạn đã có bốn con số của ma trận nhầm lẫn từ cuối chặng 2; ở đây bạn học đọc đường cong ROC và PR, đặt ngưỡng bằng chi phí thật thay vì con số 0,5 mặc định, xử lý mất cân bằng mà không phá hiệu chuẩn, chứng minh mô hình mới thật sự hơn mô hình cũ chứ không chỉ may mắn, cho mô hình quyền nói “tôi không chắc”, và quy mọi thứ về đơn vị mà tổ chức thực sự chi trả: giờ analyst và số vụ bị bỏ lọt. Đây là chặng phân biệt người hiểu bài toán với người chỉ biết gọi thư viện.',
  outcomes: [
    'Đọc đường cong ROC và PR, và nói được vì sao ROC-AUC nói dối trên dữ liệu bảo mật',
    'Chọn và bảo vệ được lựa chọn giữa precision, recall, F-beta, ROC-AUC và PR-AUC cho từng bài toán cụ thể',
    'Tính ngưỡng tối ưu từ ma trận chi phí, và ngưỡng khả thi từ công suất thật của đội SOC',
    'Xử lý mất cân bằng lớp mà không phá hỏng hiệu chuẩn và không tự tạo rò rỉ dữ liệu',
    'Hiệu chuẩn điểm mô hình để con số 0,9 thực sự có nghĩa là 90 phần trăm',
    'Trình bày hiệu năng phát hiện bằng bộ chỉ số lãnh đạo dùng được: precision@k, tải cảnh báo, MTTD, MTTR',
    'Chứng minh mô hình mới hơn mô hình cũ bằng phép kiểm theo cặp và khoảng tin cậy của hiệu số, không phải bằng hai con số đặt cạnh nhau',
    'Dựng bộ dự đoán conformal để mô hình được phép nói “không chắc” với mức bỏ sót đặt trước',
  ],
  lessons: [
    /* ====================================================================== */
    {
      id: 't4-l3',
      trackId: 'do-luong',
      title: 'ROC-AUC và PR-AUC',
      subtitle: 'Hai đường cong, hai câu chuyện — và một trong hai sẽ nói dối bạn',
      minutes: 20,
      practiceMinutes: 7,
      level: 'trung-cap',
      prereqs: ['t4-l2'],
      why: {
        short:
          'ROC-AUC là chỉ số được báo cáo nhiều nhất trong ML bảo mật và cũng là chỉ số gây hiểu nhầm nhiều nhất; biết khi nào nó nói dối là kỹ năng phân biệt người đọc được kết quả với người chỉ đọc được con số.',
        scenario:
          'Một nhà cung cấp trình bày: “mô hình của chúng tôi đạt ROC-AUC 0,993 trên 1 triệu sự kiện”. Bạn có 60 giây để hỏi hai câu khiến con số đó lộ ra là tốt thật hay chỉ là hệ quả của việc 99,99% dữ liệu là lành tính.',
        roles: ['Security Data Scientist', 'Detection Engineer', 'ML Engineer', 'Security Architect'],
        costOfNotKnowing:
          'Bạn chọn mô hình theo ROC-AUC, triển khai, và phát hiện ở điểm hoạt động khả thi duy nhất thì cứ 112 cảnh báo mới có 1 cái thật — trong khi mô hình bị bạn loại có ROC-AUC thấp hơn nhưng precision gấp bốn lần ở đúng vùng bạn cần.',
      },
      objectives: [
        'Giải thích được mỗi điểm trên đường cong ROC hoặc PR tương ứng với cái gì',
        'Diễn giải ROC-AUC bằng phát biểu xác suất, không phải bằng thang điểm “trên 0,9 là tốt”',
        'Chỉ ra bằng số vì sao ROC trông đẹp trong khi hệ thống không dùng được',
        'Chọn đúng giữa ROC-AUC, PR-AUC và TPR tại FPR cố định cho từng tình huống báo cáo',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Hệ thống xử lý 1.000.000 sự kiện mỗi ngày, trong đó 100 sự kiện là tấn công thật. Mô hình chạy ở điểm hoạt động TPR = 0,90 và FPR = 0,01 (tức 1%). Trên đồ thị ROC, điểm này nằm gần góc trên bên trái — trông tuyệt vời. Hãy tính precision tại đúng điểm đó trước khi đọc tiếp.',
          reveal:
            'Số mẫu âm ≈ 999.900. FP = 999.900 × 0,01 = **9.999**. TP = 100 × 0,90 = **90**.\n\nPrecision = 90 / (90 + 9.999) ≈ **0,89%**. Cứ khoảng **112 cảnh báo mới có 1 cái thật**.\n\nVới 10.089 cảnh báo mỗi ngày và 12 phút mỗi cảnh báo, bạn cần khoảng **2.018 giờ analyst mỗi ngày** — tức hơn 250 ca làm việc. Hệ thống này không tồn tại được quá một tuần.\n\nNhưng trên đồ thị ROC, nó là một điểm rất đẹp, và ROC-AUC của mô hình hoàn toàn có thể trên 0,99. Đó không phải lỗi tính toán của ai cả — đó là bản chất của chỉ số: FPR có mẫu số gần một triệu, còn precision có mẫu số là số cảnh báo. Hai chỉ số nhìn cùng một điểm hoạt động qua hai lăng kính khác nhau, và chỉ một trong hai lăng kính khớp với trải nghiệm của người ngồi trực.',
        },
        { t: 'h', text: 'Đường cong sinh ra từ đâu', level: 2 },
        {
          t: 'p',
          md: 'Mô hình không cho ra nhãn, nó cho ra **điểm số**. Sắp xếp toàn bộ dữ liệu theo điểm giảm dần rồi trượt một đường cắt từ trên xuống: mỗi vị trí cắt là một ngưỡng, mỗi ngưỡng là một ma trận nhầm lẫn, mỗi ma trận là **một điểm** trên đường cong. Đường cong chỉ là bảng ngưỡng ở cuối chặng 2, vẽ ra hết.',
        },
        {
          t: 'figure',
          id: 'fig-roc-anatomy',
          caption: 'Giải phẫu một đường ROC: trục, đường chéo ngẫu nhiên, hướng của ngưỡng, và vùng hoạt động khả thi thực tế — thường chỉ là một dải rất hẹp sát trục tung.',
        },
        {
          t: 'table',
          head: ['', 'Đường ROC', 'Đường PR'],
          rows: [
            ['Trục ngang', 'FPR = FP / (FP + TN)', 'Recall = TP / (TP + FN)'],
            ['Trục dọc', 'TPR = Recall', 'Precision = TP / (TP + FP)'],
            ['Mẫu số nhạy cảm', 'TN — số mẫu lành, thường hàng triệu', 'FP — số cảnh báo, thứ analyst thực sự thấy'],
            ['Mức tham chiếu (ngẫu nhiên)', 'Đường chéo, AUC = 0,5', 'Đường ngang tại tỉ lệ lớp dương (ví dụ 0,0001)'],
            ['Đổi tỉ lệ lớp thì sao', 'Không đổi — bất biến với tỉ lệ nền', 'Thay đổi mạnh — tụt theo tỉ lệ dương'],
            ['Trả lời câu hỏi', 'Mô hình xếp hạng dương trên âm tốt tới đâu?', 'Nếu tôi hành động theo nó, tôi sống chung với bao nhiêu rác?'],
          ],
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'ROC-AUC thực sự nghĩa là gì',
          md: 'ROC-AUC có một cách đọc chính xác và rất hữu ích: **xác suất để một mẫu dương lấy ngẫu nhiên được chấm điểm cao hơn một mẫu âm lấy ngẫu nhiên**. (Về mặt thống kê nó tương đương với thống kê U của Mann–Whitney.)\n\nAUC = 0,993 nghĩa là: bốc ngẫu nhiên một tệp độc và một tệp lành, 99,3% số lần tệp độc có điểm cao hơn. Đọc như vậy sẽ thấy ngay hai điều:\n\n1. Nó chỉ nói về **thứ tự**, không nói gì về ngưỡng, về số cảnh báo, hay về xác suất.\n2. Nó **không phụ thuộc tỉ lệ lớp**. Bạn có 100 hay 100.000 mẫu âm thì phát biểu xác suất trên vẫn thế — trong khi trải nghiệm của đội SOC thì khác nhau một trời một vực.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao ROC “lừa dối” khi mất cân bằng cực đoan',
          md: 'Không phải ROC sai. Nó trả lời rất chính xác một câu hỏi mà bạn không hỏi.\n\nVấn đề nằm ở **tỉ lệ chia trục ngang**. Trong ví dụ trên, vùng hoạt động khả thi duy nhất là FPR từ 0 đến khoảng 0,0002 (tương ứng 200 cảnh báo giả mỗi ngày). Vùng đó chiếm **0,02% chiều rộng** của đồ thị ROC — một sợi chỉ sát trục tung mà mắt không phân biệt nổi. 99,98% diện tích còn lại của đồ thị, nơi phần lớn AUC được tích luỹ, là những cấu hình bạn sẽ không bao giờ chạy.\n\nĐường PR thì trải đúng vùng bạn quan tâm ra toàn bộ chiều rộng đồ thị, vì trục ngang của nó là recall.',
        },
        {
          t: 'steps',
          title: 'Cùng một mô hình, ba điểm hoạt động — đọc bằng cả hai lăng kính',
          steps: [
            {
              title: 'Điểm A: FPR = 1%',
              md: 'FP ≈ 9.999, TP = 90. ROC nói: (0,01; 0,90) — sát góc trên trái, tuyệt vời.\n\nPR nói: recall 0,90 nhưng precision **0,89%**. Hơn 10.000 cảnh báo mỗi ngày. Không khả thi.',
            },
            {
              title: 'Điểm B: FPR = 0,02%',
              md: 'FP ≈ 200, TP giả sử còn 70 (TPR 0,70). ROC nói: (0,0002; 0,70) — trên đồ thị nó gần như dính vào trục tung, mắt thường không phân biệt được với điểm A.\n\nPR nói: precision = 70/270 ≈ **26%**. 270 cảnh báo mỗi ngày. Khó nhưng có thể sống được nếu có gom nhóm.',
            },
            {
              title: 'Điểm C: FPR = 0,002%',
              md: 'FP ≈ 20, TP giả sử còn 42 (TPR 0,42). PR nói: precision = 42/62 ≈ **68%**, 62 cảnh báo mỗi ngày. Đây là điểm hoạt động dùng được thật.\n\nBa điểm A, B, C nằm trong một dải hẹp đến mức trên đồ thị ROC chúng chồng lên nhau. Trên đồ thị PR, chúng ở ba vị trí hoàn toàn khác nhau. Đó là toàn bộ lý do bạn cần đường PR.',
            },
          ],
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't4l3-cp1',
              kind: 'mcq',
              tags: ['roc-auc', 'pr-auc'],
              q: 'Bạn giữ nguyên mô hình và ngưỡng, nhưng lưu lượng lành tính tăng gấp 5 lần (số tấn công không đổi). Điều gì xảy ra?',
              options: [
                'ROC-AUC giảm, PR-AUC không đổi',
                'ROC-AUC gần như không đổi, PR-AUC giảm mạnh',
                'Cả hai đều không đổi vì mô hình không thay đổi',
                'Cả hai đều giảm theo cùng tỉ lệ',
              ],
              answer: 1,
              why: 'ROC dựa trên TPR và FPR — cả hai đều là **tỉ lệ trong nội bộ một lớp**, nên nhân số mẫu âm lên 5 lần không làm chúng đổi. PR dùng precision, mà FP tăng gấp 5 trong khi TP giữ nguyên → precision tụt khoảng 5 lần ở mọi ngưỡng, kéo cả đường PR và PR-AUC xuống. Hệ quả thực tế rất quan trọng: **PR-AUC không so sánh được giữa hai tập dữ liệu có tỉ lệ lớp khác nhau**, còn ROC-AUC thì so sánh được — đó vừa là điểm mạnh vừa là cái bẫy của ROC-AUC.',
              distractorWhy: [
                'Ngược lại hoàn toàn: chính PR-AUC mới nhạy với tỉ lệ lớp.',
                '',
                'Mô hình không đổi nhưng trải nghiệm vận hành đổi, và PR-AUC nắm bắt đúng sự thay đổi đó.',
                'ROC-AUC bất biến với tỉ lệ lớp nên nó không giảm.',
              ],
            },
            {
              id: 't4l3-cp2',
              kind: 'truefalse',
              tags: ['pr-auc'],
              q: 'PR-AUC bằng 0,35 là một kết quả kém, vì nó thấp hơn nhiều so với mức 0,5 của đoán mò.',
              answer: false,
              why: 'Mức tham chiếu của đường PR **không phải 0,5** — nó là tỉ lệ lớp dương. Với 100 tấn công trên 1.000.000 sự kiện, mức tham chiếu là 0,0001. PR-AUC 0,35 tức là tốt hơn ngẫu nhiên khoảng 3.500 lần. Con số 0,5 là mức tham chiếu của **ROC**-AUC, và trộn lẫn hai mức tham chiếu này là lỗi diễn giải phổ biến nhất khi người ta mới chuyển sang dùng PR. Luôn báo cáo PR-AUC kèm tỉ lệ lớp dương của tập đánh giá.',
            },
          ],
        },
        {
          t: 'lab',
          id: 'lab-roc-pr',
          intro: 'Vặn núm tỉ lệ mất cân bằng và nhìn hai đường cong cùng lúc. Hãy chú ý: khi bạn kéo tỉ lệ dương từ 1/100 xuống 1/100.000, đường ROC gần như đứng yên còn đường PR sụp xuống sàn.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Ba con số nên báo cáo cùng nhau, không bao giờ báo cáo riêng lẻ',
          code:
            "import numpy as np\n" +
            "from sklearn.metrics import roc_auc_score, average_precision_score, roc_curve\n" +
            "\n" +
            "print('ROC-AUC :', round(roc_auc_score(y, diem), 4))\n" +
            "print('PR-AUC  :', round(average_precision_score(y, diem), 4))\n" +
            "print('Mức tham chiếu PR (tỉ lệ lớp dương):', round(y.mean(), 6))\n" +
            "\n" +
            "# Chỉ số vận hành: bắt được bao nhiêu phần trăm tại mức FPR mà tổ chức chịu nổi\n" +
            "fpr, tpr, thr = roc_curve(y, diem)\n" +
            "for muc in (1e-4, 1e-3, 1e-2):\n" +
            "    i = max(np.searchsorted(fpr, muc, side='right') - 1, 0)\n" +
            "    canh_bao_ngay = muc * (y == 0).sum()\n" +
            "    print(f'FPR={muc:.4%} -> TPR={tpr[i]:.3f} | ngưỡng={thr[i]:.4f} '\n" +
            "          f'| ~{canh_bao_ngay:.0f} cảnh báo giả')\n" +
            "\n" +
            "# CẢNH BÁO: đừng dùng auc(recall, precision). Nội suy tuyến tính trên đường PR\n" +
            "# cho kết quả lạc quan giả. average_precision_score mới là ước lượng đúng.\n",
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bốn cái bẫy quanh hai đường cong',
          md: '**1. `auc(recall, precision)` thay cho `average_precision_score`.** Đường PR không đơn điệu và nội suy tuyến tính giữa hai điểm của nó là sai về mặt hình học, cho ra con số cao hơn thực tế. Average precision cộng theo bậc thang: AP = tổng của (R_n − R_{n−1}) × P_n.\n\n**2. So PR-AUC giữa hai tập dữ liệu khác tỉ lệ lớp.** Vô nghĩa, như đã thấy ở checkpoint. Muốn so thì phải chuẩn hoá theo mức tham chiếu hoặc so trên cùng tập.\n\n**3. Báo cáo AUC mà không báo số mẫu dương.** Với 40 mẫu dương, khoảng tin cậy 95% của PR-AUC có thể rộng tới ±0,15. Con số 0,42 và 0,55 lúc đó không khác nhau. Hãy bootstrap 1.000 lần và báo cáo khoảng, không báo một con số.\n\n**4. Coi AUC là mục tiêu tối ưu cuối cùng.** AUC là chỉ số **toàn ngưỡng**. Bạn không triển khai toàn ngưỡng — bạn triển khai một ngưỡng. Hai mô hình cùng AUC có thể cho trải nghiệm hoàn toàn khác nhau ở vùng điểm cao, là vùng duy nhất bạn dùng.',
        },
        { t: 'h', text: 'Vậy dùng cái nào?', level: 2 },
        {
          t: 'compare',
          title: 'Chọn lăng kính theo câu hỏi bạn đang hỏi',
          left: {
            title: 'Dùng ROC-AUC khi…',
            icon: 'trending-up',
            items: [
              'So sánh khả năng xếp hạng của nhiều mô hình trên cùng bài toán',
              'Muốn một con số không phụ thuộc tỉ lệ lớp của tập đánh giá',
              'So kết quả của mình với bài báo hoặc benchmark ngoài',
              'Theo dõi suy giảm chất lượng xếp hạng theo thời gian (drift)',
              'Không dùng để: dự đoán trải nghiệm của analyst',
            ],
          },
          right: {
            title: 'Dùng PR-AUC / average precision khi…',
            icon: 'trending-down',
            items: [
              'Lớp dương hiếm và bạn quan tâm chất lượng của những cảnh báo thực sự phát ra',
              'Cần chọn giữa hai mô hình cho một hệ thống sắp triển khai thật',
              'Báo cáo cho người vận hành: nó tương quan với precision họ sẽ thấy',
              'Kèm theo tỉ lệ lớp dương của tập đánh giá, luôn luôn',
              'Không dùng để: so sánh giữa các tập dữ liệu khác tỉ lệ lớp',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Chỉ số mà người làm nghề thật sự báo cáo',
          md: 'Trong sản phẩm bảo mật, chỉ số được dùng để ký kết hợp đồng thường không phải AUC mà là **TPR tại một mức FPR cố định** — ví dụ “tỉ lệ phát hiện tại FPR 0,1%” hoặc “tại 1 báo động giả trên 1 triệu”. Bộ dữ liệu mã độc EMBER (Anderson & Roth, 2018) chuẩn hoá đúng cách báo cáo này.\n\nLý do rất thực dụng: mức FPR đó dịch thẳng thành số cảnh báo mỗi ngày, tức thành ngân sách. Hãy quen với việc báo cáo bộ ba: **TPR tại FPR mục tiêu + số cảnh báo tuyệt đối mỗi ngày + khoảng tin cậy**. Ba con số này khiến người nghe ra được quyết định; một chữ số AUC thì không.',
        },
        { t: 'terms', ids: ['roc-auc', 'pr-auc', 'precision', 'recall', 'nguong', 'mat-can-bang'] },
      ],
      keyTakeaways: [
        'Mỗi điểm trên ROC hoặc PR là một ngưỡng, tức một ma trận nhầm lẫn; đường cong chỉ là bảng ngưỡng vẽ ra hết.',
        'ROC-AUC = xác suất một mẫu dương ngẫu nhiên được chấm điểm cao hơn một mẫu âm ngẫu nhiên; nó nói về thứ tự, không nói về ngưỡng hay xác suất.',
        'ROC bất biến với tỉ lệ lớp nên nó vẫn đẹp khi hệ thống không dùng được; vùng hoạt động khả thi thường chỉ chiếm một sợi chỉ sát trục tung.',
        'Mức tham chiếu của PR là tỉ lệ lớp dương chứ không phải 0,5; luôn báo cáo PR-AUC kèm tỉ lệ đó.',
        'PR-AUC không so sánh được giữa hai tập dữ liệu có tỉ lệ lớp khác nhau; ROC-AUC thì được.',
        'Chỉ số dùng được nhất trong thực tế là TPR tại FPR cố định, kèm số cảnh báo tuyệt đối mỗi ngày và khoảng tin cậy.',
      ],
      cards: [
        {
          id: 't4l3-c1',
          front: 'Phát biểu ý nghĩa xác suất của ROC-AUC.',
          back: 'Xác suất để một mẫu dương lấy ngẫu nhiên được mô hình chấm điểm cao hơn một mẫu âm lấy ngẫu nhiên. Nó chỉ nói về thứ tự xếp hạng.',
          tags: ['roc-auc'],
        },
        {
          id: 't4l3-c2',
          front: 'Mức tham chiếu (đoán mò) của đường PR bằng bao nhiêu?',
          back: 'Bằng tỉ lệ lớp dương trong tập dữ liệu. Ví dụ 100 tấn công trên 1 triệu sự kiện thì mức tham chiếu là 0,0001, không phải 0,5.',
          tags: ['pr-auc', 'base-rate'],
        },
        {
          id: 't4l3-c3',
          front: 'Vì sao ROC-AUC vẫn cao khi hệ thống hoàn toàn không dùng được trong thực tế?',
          back: 'Vì FPR có mẫu số là toàn bộ mẫu âm (hàng triệu), nên FPR 1% nghe nhỏ nhưng là 10.000 cảnh báo giả. Vùng FPR khả thi thực tế chỉ chiếm một phần vạn chiều rộng đồ thị.',
          tags: ['roc-auc', 'mat-can-bang'],
        },
        {
          id: 't4l3-c4',
          front: 'Vì sao không được dùng auc(recall, precision) để tính PR-AUC?',
          back: 'Vì nó nội suy tuyến tính giữa các điểm của đường PR, cho kết quả lạc quan giả. Dùng average_precision_score, vốn cộng theo bậc thang.',
          tags: ['pr-auc'],
        },
        {
          id: 't4l3-c5',
          front: 'Chỉ số nào được dùng để ký hợp đồng trong sản phẩm phát hiện mã độc, thay cho AUC?',
          back: 'TPR (tỉ lệ phát hiện) tại một mức FPR cố định, ví dụ FPR 0,1%, vì mức đó quy thẳng ra số cảnh báo mỗi ngày và ngân sách.',
          tags: ['do-luong', 'thuc-chien'],
        },
      ],
      quiz: [
        {
          id: 't4-l3-q1',
          kind: 'mcq',
          tags: ['roc-auc', 'pr-auc'],
          q: 'Hai mô hình phát hiện xâm nhập: A có ROC-AUC 0,991 và PR-AUC 0,08; B có ROC-AUC 0,974 và PR-AUC 0,31. Tập đánh giá có tỉ lệ dương 1/20.000. Chọn mô hình nào để triển khai?',
          options: [
            'A, vì ROC-AUC cao hơn và đó là chỉ số chuẩn của ngành',
            'B, vì với lớp cực hiếm thì PR-AUC phản ánh đúng chất lượng cảnh báo mà analyst sẽ nhận',
            'Không đủ dữ liệu, phải xem accuracy của cả hai',
            'A, vì chênh lệch PR-AUC nhỏ hơn chênh lệch ROC-AUC về giá trị tuyệt đối',
          ],
          answer: 1,
          why: 'Với tỉ lệ dương 1/20.000, PR-AUC 0,31 so với 0,08 là khác biệt gần **bốn lần** về chất lượng hàng đợi cảnh báo — nghĩa là gần bốn lần khác biệt về số giờ analyst bị đốt cho rác. Chênh lệch ROC-AUC 0,991 với 0,974 nghe lớn nhưng nó tích luỹ chủ yếu ở vùng FPR cao mà bạn sẽ không bao giờ vận hành. Lưu ý cách nói đúng: không phải “PR-AUC luôn tốt hơn ROC-AUC”, mà là “khi lớp dương cực hiếm và bạn sắp triển khai thật, PR-AUC gần với thứ bạn quan tâm hơn”.',
          distractorWhy: [
            'ROC-AUC cao chủ yếu phản ánh vùng FPR không khả thi khi lớp dương cực hiếm.',
            '',
            'Accuracy còn vô dụng hơn trong bối cảnh này; hai chỉ số đã cho là đủ để quyết định.',
            'So sánh chênh lệch tuyệt đối giữa hai thang đo khác nhau là vô nghĩa; phải so theo mức tham chiếu của từng thang.',
          ],
        },
        {
          id: 't4-l3-q2',
          kind: 'input',
          tags: ['roc-auc', 'precision'],
          q: 'Tập đánh giá có 2.000.000 mẫu âm và 200 mẫu dương. Mô hình chạy tại FPR = 0,05% và TPR = 0,80. Precision bằng bao nhiêu phần trăm? (Làm tròn tới một chữ số thập phân)',
          accept: ['13,8', '13.8', '13,8%', '13.8%', '14', '13,79', '13.79'],
          placeholder: 'Nhập precision theo phần trăm…',
          hint: 'FP = 2.000.000 × 0,0005. TP = 200 × 0,80.',
          why: 'FP = 2.000.000 × 0,0005 = **1.000**. TP = 200 × 0,80 = **160**. Precision = 160/1.160 ≈ **13,8%**. Bài tập này rèn đúng một phản xạ: khi nghe một cặp (TPR, FPR), hãy nhân FPR với số mẫu âm để ra số cảnh báo giả tuyệt đối, rồi mới nói được hệ thống có sống nổi không. Ở đây là 1.160 cảnh báo mỗi ngày và khoảng 232 giờ analyst — vẫn quá tải với hầu hết đội SOC, dù ROC nhìn rất đẹp.',
        },
        {
          id: 't4-l3-q3',
          kind: 'multi',
          tags: ['roc-auc', 'pr-auc', 'do-luong'],
          q: 'Nhận định nào về ROC và PR là đúng? (Chọn tất cả đáp án đúng)',
          options: [
            'ROC-AUC không thay đổi khi tỉ lệ lớp dương của tập đánh giá thay đổi',
            'Mỗi điểm trên đường ROC ứng với một ngưỡng cắt cụ thể',
            'PR-AUC có thể so sánh trực tiếp giữa hai tổ chức có tỉ lệ tấn công khác nhau',
            'Với số mẫu dương nhỏ, ước lượng PR-AUC có phương sai rất lớn nên cần khoảng tin cậy',
          ],
          answers: [0, 1, 3],
          why: 'Ý 3 sai: PR-AUC dịch theo tỉ lệ lớp dương, nên cùng một mô hình sẽ cho PR-AUC khác nhau ở hai tổ chức chỉ vì tỉ lệ tấn công khác nhau — so trực tiếp là so nhầm. Ba ý còn lại đều đúng và đều là hệ quả trực tiếp từ định nghĩa: ROC dùng hai tỉ lệ trong nội bộ từng lớp nên bất biến; đường cong sinh ra bằng cách trượt ngưỡng; và mọi ước lượng dựa trên vài chục mẫu dương đều có sai số lớn, nên báo cáo một con số lẻ tới bốn chữ số thập phân là tự đánh lừa mình.',
        },
        {
          id: 't4-l3-q4',
          kind: 'order',
          tags: ['do-luong', 'quy-trinh'],
          q: 'Sắp xếp quy trình đánh giá một mô hình phát hiện theo thứ tự đúng.',
          items: [
            'Xác định tỉ lệ lớp dương của tập đánh giá và ghi nó vào báo cáo',
            'Tính ROC-AUC và PR-AUC kèm khoảng tin cậy bootstrap',
            'Xác định mức FPR hoặc số cảnh báo mỗi ngày mà tổ chức chịu được',
            'Đọc TPR và precision tại đúng điểm hoạt động đó',
            'Quy ra giờ analyst và số vụ bỏ lọt để ra quyết định',
          ],
          why: 'Thứ tự này đi từ bối cảnh tới quyết định. Không biết tỉ lệ lớp dương thì PR-AUC không diễn giải được. Chỉ số toàn ngưỡng có ích để so mô hình nhưng không quyết định được gì, nên nó đứng trước chứ không đứng cuối. Bước quan trọng nhất là bước 3 — nó biến ràng buộc của tổ chức thành một điểm cụ thể trên đường cong, và toàn bộ bài t4-l4 dành để làm bước đó cho tử tế.',
        },
        {
          id: 't4-l3-q5',
          kind: 'truefalse',
          tags: ['roc-auc'],
          q: 'Một mô hình có ROC-AUC 0,999 chắc chắn tạo ra ít cảnh báo giả khi triển khai.',
          answer: false,
          why: 'ROC-AUC không nói gì về số cảnh báo tuyệt đối, vì nó không nói gì về ngưỡng. Với 10 triệu sự kiện lành mỗi ngày, ngay cả FPR 0,01% cũng là 1.000 cảnh báo giả — mà FPR 0,01% hoàn toàn tương thích với AUC 0,999. Muốn biết số cảnh báo, bạn cần ba thứ mà AUC không chứa: ngưỡng đã chọn, số mẫu âm mỗi ngày, và phân bố điểm của mẫu âm ở vùng điểm cao.',
        },
      ],
      terms: ['roc-auc', 'pr-auc', 'precision', 'recall', 'nguong', 'mat-can-bang'],
      further: [
        {
          title: 'The Relationship Between Precision-Recall and ROC Curves — Davis & Goadrich (2006)',
          note: 'Bài báo gốc chứng minh vì sao một điểm chi phối trên ROC cũng chi phối trên PR, và vì sao nội suy tuyến tính trên PR là sai.',
        },
        {
          title: 'EMBER: An Open Dataset for Training Static PE Malware ML Models — Anderson & Roth (2018)',
          note: 'Đọc phần đánh giá để thấy cách ngành báo cáo tỉ lệ phát hiện tại mức FPR cố định thay vì chỉ AUC.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't4-l4',
      trackId: 'do-luong',
      title: 'Chọn ngưỡng theo chi phí, không theo 0,5',
      subtitle: 'Nơi chỉ số biến thành quyết định, và là bài quan trọng nhất của cả chặng',
      minutes: 24,
      practiceMinutes: 7,
      level: 'trung-cap',
      prereqs: ['t4-l3'],
      why: {
        short:
          'Ngưỡng 0,5 là giá trị mặc định của một hàm thư viện, không phải một lựa chọn kỹ thuật; thay nó bằng một con số tính từ chi phí thật thường cải thiện giá trị hệ thống nhiều hơn cả việc đổi thuật toán.',
        scenario:
          'Mô hình phishing của bạn đã chạy 3 tháng ở ngưỡng mặc định 0,5, sinh 260 cảnh báo mỗi ngày. Giám đốc an ninh hỏi: “nên siết hay nới, và dựa vào cái gì mà nói vậy?” Bạn cần trả lời bằng một bảng chi phí, không bằng cảm tính.',
        roles: ['Detection Engineer', 'Security Data Scientist', 'Security Architect', 'SOC Analyst'],
        costOfNotKnowing:
          'Bạn để mặc định 0,5, đội SOC ngập trong cảnh báo hoặc bỏ lọt hàng loạt, và không ai trong tổ chức biết con số đó từ đâu ra — nên cũng không ai dám sửa.',
      },
      objectives: [
        'Lập được ma trận chi phí bốn ô cho một bài toán phát hiện cụ thể',
        'Tính chi phí kỳ vọng tại mỗi ngưỡng và tìm ngưỡng tối ưu bằng quét thực nghiệm',
        'Áp dụng công thức ngưỡng lý thuyết và nêu được điều kiện để nó đúng',
        'Chuyển từ ngưỡng tối ưu về ngưỡng khả thi dưới ràng buộc công suất top-k của đội SOC',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bạn có mô hình phishing chạy trên 100.000 email mỗi ngày. Một báo động giả tốn 12 phút của analyst; tính đủ chi phí nhân sự thì khoảng 12 USD. Một email lừa đảo lọt lưới có 3% khả năng dẫn tới sự cố nghiêm trọng, thiệt hại trung bình 150.000 USD. Theo bạn, ngưỡng nên đặt ở đâu: cao hơn hay thấp hơn 0,5? Và bạn sẵn sàng chịu bao nhiêu báo động giả để bắt thêm một email lừa đảo?',
          reveal:
            'Chi phí kỳ vọng của một vụ bỏ sót: 0,03 × 150.000 = **4.500 USD**. Chi phí một báo động giả: **12 USD**.\n\nTỉ lệ 4.500 / 12 = **375**. Nghĩa là bạn nên sẵn sàng chịu tới **375 báo động giả** để bắt thêm một email lừa đảo. Con số đó khiến hầu hết mọi người giật mình — trực giác thông thường dừng ở khoảng 5 tới 10.\n\nVậy ngưỡng phải **thấp hơn 0,5 rất nhiều**. Nhưng đây mới là nửa câu chuyện: ở ngưỡng thấp như vậy, mô hình có thể sinh 30.000 cảnh báo mỗi ngày, trong khi đội bạn xử lý nổi 120. Bài học này là về việc dung hoà hai sự thật đó — và câu trả lời cuối cùng không phải một con số mà là một kiến trúc.',
        },
        { t: 'h', text: 'Con số 0,5 đến từ đâu (và vì sao nó gần như luôn sai)', level: 2 },
        {
          t: 'p',
          md: 'Khi bạn gọi `model.predict(X)`, scikit-learn cắt tại 0,5. Đó là ngưỡng tối ưu **chỉ khi** hai điều kiện cùng đúng: (1) sai lầm dương và sai lầm âm tốn kém như nhau, và (2) điểm số của mô hình là xác suất đã hiệu chuẩn. Trong bảo mật, điều kiện (1) sai theo hệ số hàng trăm, còn điều kiện (2) thường sai luôn.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Ngưỡng không phải tham số của mô hình',
          md: 'Ngưỡng là **quyết định kinh doanh** áp lên đầu ra của mô hình. Nó không cần huấn luyện lại gì cả, đổi nó tốn 5 giây, và nó thường tạo ra thay đổi lớn hơn việc đổi từ hồi quy logistic sang LightGBM.\n\nHệ quả tổ chức: ngưỡng nên nằm trong cấu hình, có người chủ sở hữu, có lịch xem lại, và có ghi chép lý do. Một ngưỡng “không ai biết vì sao lại là 0,5” là món nợ kỹ thuật im lặng nhất trong mọi hệ thống phát hiện.',
        },
        { t: 'h', text: 'Bước 1 — Lập ma trận chi phí', level: 2 },
        {
          t: 'table',
          head: ['Ô', 'Chi phí', 'Cách ước lượng trong thực tế'],
          rows: [
            ['TN — bỏ qua đúng', '0', 'Mốc quy chiếu. Mọi chi phí khác đo tương đối so với ô này.'],
            ['FP — báo động giả', '12 USD', 'Thời gian xử lý trung bình (12 phút) × chi phí gánh đủ mỗi giờ của analyst (60 USD/giờ). Lấy từ số liệu ticket thật, đừng đoán.'],
            ['FN — bỏ sót', '4.500 USD', 'Xác suất leo thang (3%) × thiệt hại trung bình khi leo thang (150.000 USD). Lấy từ lịch sử sự cố hoặc từ mô hình rủi ro của đội GRC.'],
            ['TP — bắt trúng', '12 USD (chi phí điều tra)', 'Cũng tốn thời gian analyst như FP. Nhiều đội đặt bằng 0 để đơn giản hoá; điều đó chỉ làm dịch ngưỡng chút ít.'],
          ],
          caption: 'Ma trận chi phí cho bài toán phishing. Ba trong bốn ô lấy được từ dữ liệu bạn đã có: log ticket và lịch sử sự cố.',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Con số 4.500 USD kia đáng tin tới đâu?',
          md: 'Không đáng tin lắm — và điều đó vẫn ổn. Ước lượng chi phí bỏ sót luôn có sai số lớn vì nó là tích của một xác suất nhỏ với một thiệt hại lớn.\n\nCách xử lý đúng: **phân tích độ nhạy**. Tính ngưỡng tối ưu với C_FN = 1.500, 4.500 và 15.000 USD. Nếu cả ba cho ngưỡng gần nhau, bạn yên tâm. Nếu chúng cho ba ngưỡng rất khác nhau, thì đây chính là cuộc thảo luận mà tổ chức bạn **cần** phải có — và bài này vừa buộc nó xảy ra. Giá trị lớn nhất của ma trận chi phí không phải con số đầu ra, mà là nó biến giả định ngầm thành giả định viết ra giấy.',
        },
        { t: 'h', text: 'Bước 2 — Chi phí kỳ vọng tại mỗi ngưỡng', level: 2 },
        {
          t: 'p',
          md: 'Công thức đơn giản đến mức đáng ngờ: **Chi phí(t) = FP(t) × C_FP + FN(t) × C_FN**. Quét t qua mọi giá trị, chọn t nhỏ nhất. Áp vào bảng ngưỡng của bài t4-l2:',
        },
        {
          t: 'table',
          head: ['Ngưỡng', 'Cảnh báo/ngày', 'FP', 'FN', 'Chi phí FP (USD)', 'Chi phí FN (USD)', 'Tổng/ngày'],
          rows: [
            ['0,10', '2.100', '2.061', '1', '24.732', '4.500', '29.232'],
            ['0,30', '640', '603', '3', '7.236', '13.500', '**20.736**'],
            ['0,50', '260', '228', '8', '2.736', '36.000', '38.736'],
            ['0,70', '95', '69', '14', '828', '63.000', '63.828'],
            ['0,90', '28', '11', '23', '132', '103.500', '103.632'],
            ['0,97', '9', '1', '32', '12', '144.000', '144.012'],
          ],
          caption: 'Ngưỡng mặc định 0,5 đắt gần gấp đôi ngưỡng tối ưu 0,30. Chênh lệch 18.000 USD mỗi ngày — khoảng 6,5 triệu USD mỗi năm — chỉ vì một con số mặc định không ai xem lại.',
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Ngưỡng lý thuyết, và điều kiện để dùng được',
          md: 'Nếu điểm số `p` là **xác suất đã hiệu chuẩn**, ta cảnh báo khi lợi ích kỳ vọng dương:\n\n`p × C_FN > (1 − p) × C_FP`\n\nGiải ra: **t\\* = C_FP / (C_FP + C_FN)**.\n\nVới các con số trên: t\\* = 12 / (12 + 4.500) = **0,00266**. Tức khoảng 0,27% — xa vô cùng so với 0,5.\n\nNhưng bảng quét thực nghiệm lại cho tối ưu ở 0,30. Mâu thuẫn? Không. **Điểm số của mô hình chưa hiệu chuẩn không phải là xác suất.** Một điểm 0,30 của LightGBM có thể tương ứng với xác suất thật 0,003. Đó chính là lý do bài t4-l6 tồn tại: hiệu chuẩn xong thì công thức trên dùng được trực tiếp, và bạn không phải quét lại mỗi lần chi phí thay đổi.\n\nQuy tắc thực hành: **chưa hiệu chuẩn thì quét thực nghiệm; đã hiệu chuẩn thì dùng công thức.**',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't4l4-cp1',
              kind: 'mcq',
              tags: ['nguong', 'chi-phi'],
              q: 'Chi phí một báo động giả là 20 USD, chi phí kỳ vọng của một vụ bỏ sót là 980 USD. Với một mô hình đã hiệu chuẩn tốt, ngưỡng tối ưu xấp xỉ bao nhiêu?',
              options: ['0,50', '0,02', '0,20', '0,98'],
              answer: 1,
              why: 't\\* = C_FP / (C_FP + C_FN) = 20 / (20 + 980) = **0,02**. Trực giác kiểm chứng: bỏ sót đắt gấp 49 lần báo động giả, nên bạn nên cảnh báo ngay cả khi chỉ tin 2% rằng đó là tấn công — vì kỳ vọng vẫn có lợi. Chú ý cấu trúc công thức: **ngưỡng tỉ lệ nghịch với mức độ đắt đỏ của việc bỏ sót**. Chi phí bỏ sót càng lớn, ngưỡng càng thấp, càng nhiều cảnh báo.',
              distractorWhy: [
                '0,5 chỉ đúng khi hai loại sai lầm tốn kém như nhau — ở đây chênh nhau 49 lần.',
                '',
                'Đây là kết quả nếu lấy nhầm 20/100; công thức đúng dùng mẫu số là tổng hai chi phí.',
                'Đây là ngưỡng đảo ngược: nó ứng với trường hợp báo động giả đắt gấp 49 lần bỏ sót.',
              ],
            },
            {
              id: 't4l4-cp2',
              kind: 'truefalse',
              tags: ['nguong', 'ro-ri-du-lieu'],
              q: 'Nên chọn ngưỡng bằng cách quét trên tập kiểm tra để lấy chi phí thấp nhất có thể.',
              answer: false,
              why: 'Ngưỡng là một siêu tham số, và chọn nó trên tập kiểm tra chính là tối ưu vào tập kiểm tra — đúng dạng rò rỉ chậm đã học ở t2-l6. Con số chi phí bạn báo cáo sẽ lạc quan hơn thực tế. Quy trình đúng: chọn ngưỡng trên **tập kiểm định**, rồi báo cáo chi phí trên tập kiểm tra **một lần duy nhất** với ngưỡng đã cố định. Trong bảo mật còn nên kiểm chứng thêm: tập kiểm định phải ở thời kỳ gần nhất, vì phân bố điểm số trôi theo thời gian và ngưỡng trôi theo nó.',
            },
          ],
        },
        { t: 'h', text: 'Bước 3 — Va vào bức tường công suất', level: 2 },
        {
          t: 'p',
          md: 'Bảng trên nói ngưỡng tối ưu là 0,30 với **640 cảnh báo mỗi ngày**. Đội SOC của bạn có 2 analyst mỗi ca, 3 ca, mỗi người xử lý được khoảng 20 cảnh báo mỗi ca sau khi trừ họp hành và các việc khác — tổng công suất khoảng **120 cảnh báo mỗi ngày**. Bạn không có 640.',
        },
        {
          t: 'steps',
          title: 'Từ ngưỡng tối ưu tới ngưỡng khả thi',
          steps: [
            {
              title: 'Bước 3.1 — Tính ngưỡng theo công suất (top-k)',
              md: 'Đảo ngược bài toán: thay vì hỏi “ngưỡng nào”, hãy hỏi “**k cảnh báo cao điểm nhất mỗi ngày là bao nhiêu**”. Với k = 120, ngưỡng tương ứng trên bảng nằm khoảng **0,66**. Cách tính: sắp xếp điểm của một ngày rồi lấy điểm của mẫu thứ k.\n\nƯu điểm lớn: ngưỡng top-k **tự thích nghi với trôi dữ liệu**. Nếu ngày mai phân bố điểm dịch lên, ngưỡng tuyệt đối 0,66 sẽ đẻ ra 900 cảnh báo, còn ngưỡng top-120 vẫn cho đúng 120.',
            },
            {
              title: 'Bước 3.2 — Định giá khoảng cách',
              md: 'Tại ngưỡng khả thi 0,66: FP ≈ 92, FN ≈ 12 → chi phí ≈ 92 × 12 + 12 × 4.500 = **55.104 USD/ngày**.\n\nTại ngưỡng tối ưu 0,30: **20.736 USD/ngày**.\n\nKhoảng cách: **34.368 USD mỗi ngày** — đây không phải con số trừu tượng, đây là **giá trị kinh doanh của việc mở rộng công suất xử lý**. Bạn vừa biến một lời than “đội em thiếu người” thành một luận điểm tài chính.',
            },
            {
              title: 'Bước 3.3 — Định giá một giờ analyst',
              md: 'Mở rộng từ 120 lên 640 cảnh báo cần thêm khoảng 520 cảnh báo × 12 phút = **104 giờ analyst mỗi ngày**, tức khoảng 13 ca. Lợi ích: 34.368 USD/ngày. Chia ra: mỗi giờ analyst tăng thêm mang lại khoảng **330 USD** giá trị kỳ vọng, so với chi phí 60 USD.\n\nKết luận: hoặc tuyển thêm, hoặc — rẻ hơn nhiều — **giảm 12 phút mỗi cảnh báo** bằng làm giàu ngữ cảnh tự động và gom nhóm. Bài t4-l7 đi sâu vào hướng thứ hai.',
            },
            {
              title: 'Bước 3.4 — Chia ba vùng thay vì một ngưỡng',
              md: 'Câu trả lời trưởng thành không phải một ngưỡng mà là một **chính sách ba vùng**:\n\n- Điểm ≥ 0,97 (precision ~89%): **hành động tự động** — cách ly email, gắn cờ đỏ. Khoảng 9 email/ngày.\n- 0,66 ≤ điểm < 0,97: **vào hàng đợi analyst**. Khoảng 111 email/ngày.\n- 0,30 ≤ điểm < 0,66: **không cảnh báo, nhưng ghi lại và lấy mẫu**. Mỗi tuần threat hunting lấy ngẫu nhiên 50 mẫu trong vùng này để ước lượng FN — đây là cách duy nhất nhìn thấy ô mà bảng điều khiển không hiện.\n- Điểm < 0,30: bỏ qua.\n\nKiến trúc này lấy được phần lớn giá trị của ngưỡng thấp mà không phá vỡ công suất.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Quét ngưỡng theo chi phí, và ngưỡng theo công suất top-k',
          code:
            "import numpy as np\n" +
            "from sklearn.metrics import confusion_matrix\n" +
            "\n" +
            "C_FP, C_FN = 12.0, 4500.0     # USD; lấy từ log ticket và lịch sử sự cố\n" +
            "\n" +
            "def chi_phi(y, diem, t):\n" +
            "    tn, fp, fn, tp = confusion_matrix(y, (diem >= t).astype(int), labels=[0, 1]).ravel()\n" +
            "    return fp * C_FP + fn * C_FN, fp, fn, tp\n" +
            "\n" +
            "# Quét trên TẬP KIỂM ĐỊNH, không phải tập kiểm tra.\n" +
            "# Dùng phân vị của chính điểm số để lưới ngưỡng bám sát vùng có dữ liệu.\n" +
            "luoi = np.unique(np.quantile(diem_val, np.linspace(0, 1, 501)))\n" +
            "bang = [(t, *chi_phi(y_val, diem_val, t)) for t in luoi]\n" +
            "t_toi_uu = min(bang, key=lambda r: r[1])[0]\n" +
            "print('Ngưỡng chi phí tối thiểu:', round(float(t_toi_uu), 4))\n" +
            "\n" +
            "# Ràng buộc công suất: mỗi ngày đội chỉ tiêu hoá nổi k cảnh báo\n" +
            "k_moi_ngay = 120\n" +
            "so_ngay = 30\n" +
            "k = k_moi_ngay * so_ngay\n" +
            "t_cong_suat = np.partition(diem_val, -k)[-k]   # điểm của mẫu xếp thứ k từ trên xuống\n" +
            "print('Ngưỡng theo công suất top-k:', round(float(t_cong_suat), 4))\n" +
            "\n" +
            "# Ngưỡng triển khai = cái nào CAO hơn. Và ghi lại khoảng cách chi phí:\n" +
            "# đó chính là luận điểm tài chính để xin thêm người hoặc thêm tự động hoá.\n" +
            "print('Ngưỡng triển khai:', round(float(max(t_toi_uu, t_cong_suat)), 4))\n",
        },
        {
          t: 'lab',
          id: 'lab-cost-threshold',
          intro: 'Chỉnh C_FP, C_FN và công suất đội SOC, xem đường chi phí kỳ vọng dịch chuyển và điểm tối ưu chạy đi đâu. Thử đặt C_FN gấp 10 lần và quan sát ngưỡng.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Năm sai lầm khi đặt ngưỡng',
          md: '**1. Để nguyên 0,5.** Sai lầm phổ biến nhất, và tốn kém nhất, vì nó vô hình.\n\n**2. Chọn ngưỡng trên tập kiểm tra.** Rò rỉ chậm; con số báo cáo sẽ lạc quan.\n\n**3. Đặt xong rồi quên.** Phân bố điểm trôi theo thời gian — lưu lượng đổi, hạ tầng đổi, kẻ tấn công đổi. Ngưỡng tuyệt đối hôm nay cho 120 cảnh báo, sáu tháng sau có thể cho 900. Hãy đặt cảnh báo khi số cảnh báo mỗi ngày lệch quá 30% so với mức thiết kế.\n\n**4. Một ngưỡng cho mọi bối cảnh.** Máy chủ trong vùng chứa dữ liệu thẻ và máy in ở tầng 3 không đáng cùng một ngưỡng. C_FN khác nhau thì ngưỡng phải khác nhau — chia theo nhóm tài sản là cách nâng precision rẻ nhất tồn tại.\n\n**5. Chọn ngưỡng trước khi hỏi công suất.** Ngưỡng tối ưu về chi phí mà đội không xử lý nổi thì thực tế là ngưỡng vô hạn: cảnh báo không ai đọc bằng không có cảnh báo.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Ngưỡng phân vị thay cho ngưỡng tuyệt đối',
          md: 'Trong hệ thống chạy thật, hãy cấu hình “top 0,1% điểm cao nhất trong 24 giờ qua” thay vì “điểm ≥ 0,66”. Ba lợi ích: khối lượng cảnh báo ổn định theo ngày, tự miễn nhiễm với trôi thang điểm sau mỗi lần huấn luyện lại, và đội vận hành dự đoán được tải.\n\nĐánh đổi cần biết: khi thực sự có chiến dịch tấn công lớn, ngưỡng phân vị sẽ tự siết lại và có thể cắt mất phần đuôi của chính chiến dịch đó. Cách vá: kết hợp sàn tuyệt đối — “top 0,1% **hoặc** điểm ≥ 0,95, lấy hợp của hai tập”.',
        },
        { t: 'terms', ids: ['nguong', 'bao-dong-gia', 'bo-sot', 'hieu-chuan', 'alert-fatigue'] },
      ],
      keyTakeaways: [
        'Ngưỡng 0,5 chỉ tối ưu khi hai loại sai lầm tốn kém như nhau và điểm số đã hiệu chuẩn — cả hai điều kiện đều sai trong bảo mật.',
        'Ma trận chi phí bốn ô lấy được từ dữ liệu bạn đã có: log ticket cho C_FP, lịch sử sự cố cho C_FN.',
        'Chi phí kỳ vọng = FP × C_FP + FN × C_FN; quét ngưỡng trên tập kiểm định và chọn điểm cực tiểu.',
        'Với điểm đã hiệu chuẩn, ngưỡng tối ưu là t* = C_FP / (C_FP + C_FN); chưa hiệu chuẩn thì phải quét thực nghiệm.',
        'Ràng buộc công suất thường mạnh hơn ràng buộc chi phí: ngưỡng triển khai là cái cao hơn giữa ngưỡng tối ưu và ngưỡng top-k.',
        'Khoảng cách giữa chi phí tại ngưỡng khả thi và tại ngưỡng tối ưu chính là giá trị tài chính của việc mở rộng công suất hoặc tự động hoá.',
        'Câu trả lời trưởng thành là chính sách ba vùng — tự động, hàng đợi, lấy mẫu — chứ không phải một con số.',
      ],
      cards: [
        {
          id: 't4l4-c1',
          front: 'Viết công thức ngưỡng tối ưu theo chi phí, và nêu điều kiện để dùng được.',
          back: 't* = C_FP / (C_FP + C_FN). Chỉ đúng khi điểm số của mô hình là xác suất đã hiệu chuẩn; nếu chưa, phải quét ngưỡng thực nghiệm.',
          tags: ['nguong', 'chi-phi'],
        },
        {
          id: 't4l4-c2',
          front: 'Vì sao ngưỡng 0,5 gần như luôn sai trong bảo mật?',
          back: 'Vì nó chỉ tối ưu khi FP và FN tốn kém như nhau và điểm đã hiệu chuẩn. Trong bảo mật chi phí lệch hàng trăm lần và điểm mô hình thường không phải xác suất.',
          tags: ['nguong'],
        },
        {
          id: 't4l4-c3',
          front: 'Ngưỡng top-k (theo công suất) là gì và ưu điểm lớn nhất của nó?',
          back: 'Mỗi ngày chỉ lấy k cảnh báo có điểm cao nhất, k bằng công suất xử lý của đội. Ưu điểm: khối lượng cảnh báo ổn định và tự thích nghi khi phân bố điểm trôi.',
          tags: ['nguong', 'alert-fatigue'],
        },
        {
          id: 't4l4-c4',
          front: 'Khoảng cách chi phí giữa ngưỡng tối ưu và ngưỡng khả thi theo công suất cho bạn biết điều gì?',
          back: 'Giá trị kinh tế của việc mở rộng công suất xử lý — dùng làm luận điểm tài chính để xin thêm người hoặc đầu tư tự động hoá phân loại.',
          tags: ['chi-phi', 'thuc-chien'],
        },
        {
          id: 't4l4-c5',
          front: 'Nêu chính sách ba vùng thay cho một ngưỡng duy nhất.',
          back: 'Vùng điểm rất cao: hành động tự động. Vùng giữa: đưa vào hàng đợi analyst. Vùng thấp hơn ngưỡng cảnh báo: không báo nhưng ghi lại và lấy mẫu định kỳ để ước lượng bỏ sót.',
          tags: ['nguong', 'thuc-chien'],
        },
      ],
      quiz: [
        {
          id: 't4-l4-q1',
          kind: 'mcq',
          tags: ['nguong', 'chi-phi'],
          q: 'Đội bạn quyết định C_FP = 25 USD và C_FN = 2.475 USD. Mô hình đã được hiệu chuẩn bằng isotonic regression. Ngưỡng nên đặt ở đâu?',
          options: ['0,50', '0,01', '0,10', '0,99'],
          answer: 1,
          why: 't\\* = 25 / (25 + 2.475) = 25/2.500 = **0,01**. Chi tiết quan trọng trong đề bài là cụm “đã được hiệu chuẩn” — chỉ khi đó điểm số mới là xác suất thật và công thức mới áp dụng trực tiếp được. Nếu mô hình chưa hiệu chuẩn, con số 0,01 trên thang điểm thô có thể tương ứng với một xác suất hoàn toàn khác, và bạn phải quét ngưỡng thực nghiệm trên tập kiểm định thay vì tin công thức.',
          distractorWhy: [
            'Mặc định 0,5 ứng với giả định hai loại sai lầm ngang giá — ở đây chúng lệch 99 lần.',
            '',
            'Đây là kết quả nếu lấy nhầm 25/250; mẫu số phải là tổng hai chi phí.',
            'Ngưỡng 0,99 ứng với trường hợp báo động giả đắt hơn bỏ sót rất nhiều — ngược hẳn đề bài.',
          ],
        },
        {
          id: 't4-l4-q2',
          kind: 'multi',
          tags: ['nguong', 'thuc-chien'],
          q: 'Đội SOC xử lý được 150 cảnh báo/ngày. Ngưỡng tối ưu theo chi phí sinh 900 cảnh báo/ngày. Hành động nào hợp lý? (Chọn tất cả đáp án đúng)',
          options: [
            'Đặt ngưỡng theo công suất top-150 và ghi lại khoảng cách chi phí làm luận điểm xin nguồn lực',
            'Cứ bật ngưỡng tối ưu, cảnh báo không xử lý kịp thì để tồn trong hàng đợi',
            'Gom nhóm cảnh báo trùng lặp để mỗi đơn vị công việc chứa nhiều cảnh báo hơn',
            'Chia ngưỡng theo nhóm tài sản: siết ở vùng ít quan trọng, nới ở vùng chứa dữ liệu nhạy cảm',
          ],
          answers: [0, 2, 3],
          why: 'Ý 2 là sai lầm kinh điển: hàng đợi tồn đọng không phải là “sẽ xử lý sau”, nó là **mù cảnh báo có tổ chức** — analyst bắt đầu bấm đóng hàng loạt và cảnh báo thật chết chìm cùng cảnh báo giả. Ba hành động còn lại đều đúng theo ba hướng khác nhau: chấp nhận ràng buộc nhưng biến nó thành số liệu (ý 1), tăng công suất hiệu dụng mà không tăng người (ý 3), và dùng chính C_FN khác nhau theo tài sản để phân bổ ngân sách cảnh báo hợp lý hơn (ý 4).',
        },
        {
          id: 't4-l4-q3',
          kind: 'truefalse',
          tags: ['nguong', 'troi-du-lieu'],
          q: 'Ngưỡng đã tính đúng một lần thì có thể để nguyên cho tới lần huấn luyện lại tiếp theo.',
          answer: false,
          why: 'Ngưỡng gắn với **phân bố điểm số**, mà phân bố điểm trôi ngay cả khi mô hình đứng yên: lưu lượng thay đổi theo mùa, hạ tầng mới được thêm vào, hành vi người dùng đổi, kẻ tấn công đổi chiến thuật. Một ngưỡng tuyệt đối cho 120 cảnh báo hôm nay có thể cho 900 sau sáu tháng — và không ai nhận ra cho tới khi đội SOC than phiền. Hai biện pháp chuẩn: giám sát số cảnh báo mỗi ngày như một chỉ số vận hành có cảnh báo riêng, và ưu tiên ngưỡng phân vị thay cho ngưỡng tuyệt đối.',
        },
        {
          id: 't4-l4-q4',
          kind: 'order',
          tags: ['nguong', 'quy-trinh'],
          q: 'Sắp xếp quy trình đặt ngưỡng cho một mô hình sắp triển khai.',
          items: [
            'Lập ma trận chi phí từ log ticket và lịch sử sự cố, kèm phân tích độ nhạy cho C_FN',
            'Quét ngưỡng trên tập kiểm định gần nhất về thời gian, tìm cực tiểu chi phí kỳ vọng',
            'Hỏi công suất thật của đội và tính ngưỡng top-k tương ứng',
            'Chọn ngưỡng triển khai là giá trị cao hơn giữa hai ngưỡng trên, chia thành chính sách ba vùng',
            'Báo cáo hiệu năng trên tập kiểm tra một lần với ngưỡng đã cố định, rồi đặt giám sát tải cảnh báo',
          ],
          why: 'Trình tự này bảo vệ bạn khỏi ba lỗi cùng lúc. Chi phí đứng trước vì không có nó thì không có gì để tối ưu. Quét trên tập kiểm định (không phải kiểm tra) tránh rò rỉ chậm. Hỏi công suất trước khi chốt ngưỡng tránh việc triển khai một cấu hình đúng trên giấy mà chết trong vận hành. Và bước cuối — giám sát tải — là bước duy nhất khiến ngưỡng không mục nát theo thời gian.',
        },
        {
          id: 't4-l4-q5',
          kind: 'input',
          tags: ['chi-phi', 'nguong'],
          q: 'Một báo động giả tốn 15 USD. Một vụ bỏ sót có 5% khả năng dẫn tới sự cố thiệt hại 60.000 USD. Bạn nên sẵn sàng chịu tối đa bao nhiêu báo động giả để bắt thêm một vụ thật? (Nhập số nguyên)',
          accept: ['200', '200 canh bao', '200 bao dong gia'],
          placeholder: 'Nhập số báo động giả…',
          hint: 'Trước hết tính chi phí kỳ vọng của một vụ bỏ sót, rồi chia cho chi phí một báo động giả.',
          why: 'C_FN = 0,05 × 60.000 = 3.000 USD. Tỉ lệ 3.000 / 15 = **200**. Nghĩa là chịu tới 200 báo động giả để bắt thêm một vụ vẫn có lợi về kỳ vọng. Con số này gần như luôn lớn hơn trực giác của mọi người trong phòng họp, và đó chính là giá trị của việc viết ma trận chi phí ra giấy. Nhưng nhớ nửa còn lại của bài học: “có lợi về kỳ vọng” không đồng nghĩa với “khả thi” — 200 báo động giả cho mỗi vụ thật vẫn có thể vượt xa công suất của đội, và khi đó bạn cần kiến trúc ba vùng chứ không phải một ngưỡng thấp.',
        },
      ],
      terms: ['nguong', 'bao-dong-gia', 'bo-sot', 'hieu-chuan', 'alert-fatigue', 'ro-ri-du-lieu'],
      further: [
        {
          title: 'The Foundations of Cost-Sensitive Learning — Charles Elkan (2001)',
          note: 'Nguồn gốc của công thức ngưỡng theo chi phí và của lập luận vì sao thay đổi ngưỡng thường tốt hơn thay đổi dữ liệu.',
        },
        {
          title: 'scikit-learn — TunedThresholdClassifierCV',
          note: 'Từ phiên bản 1.5, scikit-learn có sẵn công cụ dò ngưỡng theo một hàm lợi ích tuỳ chọn, gồm cả ma trận chi phí. Đọc ví dụ về cost-sensitive learning trong tài liệu.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't4-l5',
      trackId: 'do-luong',
      title: 'Xử lý mất cân bằng lớp',
      subtitle: 'Vì sao câu trả lời đầu tiên là đổi ngưỡng, và vì sao SMOTE thường phản tác dụng',
      minutes: 22,
      practiceMinutes: 3,
      level: 'trung-cap',
      prereqs: ['t4-l4'],
      why: {
        short:
          'Mất cân bằng lớp là đặc điểm mặc định của mọi bài toán bảo mật, và cách xử lý phổ biến nhất trên mạng — lấy mẫu lại bằng SMOTE — thường làm mô hình tệ hơn theo cách không hiện ra trong bảng kết quả.',
        scenario:
          'Bạn có 4 triệu phiên đăng nhập, 800 phiên bị chiếm quyền — tỉ lệ 1 trên 5.000. Đồng nghiệp đề xuất dùng SMOTE để “cân bằng dữ liệu về 50/50”. Bạn cần giải thích trong hai phút vì sao đó là lựa chọn nên để cuối cùng, và nên làm gì trước.',
        roles: ['Security Data Scientist', 'ML Engineer', 'Detection Engineer'],
        costOfNotKnowing:
          'Bạn tốn ba tuần chạy SMOTE, thấy F1 trên tập đã cân bằng tăng vọt, triển khai, rồi số báo động giả tăng gấp ba và xác suất mô hình trả về không còn dùng được cho bất kỳ phép tính chi phí nào.',
      },
      objectives: [
        'Phân biệt được vấn đề nào do mất cân bằng gây ra thật và vấn đề nào chỉ do chọn sai chỉ số',
        'Xếp đúng thứ tự năm cách xử lý mất cân bằng theo tỉ lệ lợi ích trên rủi ro',
        'Nêu được bốn lý do kỹ thuật khiến SMOTE thường phản tác dụng trên dữ liệu bảo mật',
        'Hiệu chỉnh lại xác suất sau khi hạ mẫu lớp âm bằng công thức đúng',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Bạn huấn luyện LightGBM trên 4.000.000 phiên đăng nhập với 800 phiên bị chiếm quyền (tỉ lệ 1:5.000). Mô hình dự đoán “bình thường” cho gần như mọi phiên và accuracy đạt 99,98%. Theo bạn, vấn đề nằm ở chỗ mô hình **không học được gì**, hay ở chỗ khác?',
          reveal:
            'Hầu như luôn là “ở chỗ khác”. Hãy kiểm tra bằng cách bỏ nhãn dự đoán đi và nhìn vào **điểm số**: sắp xếp 4 triệu phiên theo điểm giảm dần và xem 800 phiên xấu nằm ở đâu.\n\nTrong đa số trường hợp bạn sẽ thấy chúng tập trung mạnh ở phần đầu danh sách — tức là mô hình **đã học được rất nhiều**, PR-AUC hoàn toàn có thể ở mức 0,3 tới 0,6. Cái “hỏng” chỉ là bước cuối cùng: hàm `predict()` cắt tại 0,5, và với tỉ lệ nền 1:5.000 thì gần như không mẫu nào vượt qua 0,5.\n\nĐây là điểm mấu chốt của cả bài: **mất cân bằng chủ yếu là vấn đề của NGƯỠNG và của CHỈ SỐ, không phải vấn đề của dữ liệu.** Trước khi động vào dữ liệu, hãy sửa hai thứ miễn phí đó trước.',
        },
        {
          t: 'figure',
          id: 'fig-imbalance',
          caption: 'Cùng một mô hình, cùng một khả năng xếp hạng, ba tỉ lệ mất cân bằng khác nhau. Thứ thay đổi là vị trí của ngưỡng hợp lý, không phải chất lượng của mô hình.',
        },
        { t: 'h', text: 'Năm cách xử lý, xếp theo thứ tự nên thử', level: 2 },
        {
          t: 'table',
          head: ['Thứ tự', 'Cách làm', 'Đụng vào cái gì', 'Rủi ro', 'Khi nào dùng'],
          rows: [
            [
              '1',
              'Đổi chỉ số và đổi ngưỡng',
              'Không đụng gì cả — chỉ đổi cách đọc và điểm cắt',
              'Gần như bằng không',
              'Luôn luôn làm trước. Rất nhiều trường hợp dừng ở đây là đủ.',
            ],
            [
              '2',
              'class_weight / scale_pos_weight',
              'Hàm mất mát: mỗi mẫu dương được nhân trọng số',
              'Phá hiệu chuẩn (điểm số bị đẩy lên cao giả tạo)',
              'Khi mô hình học kém ở vùng biên vì lớp dương quá ít ảnh hưởng tới gradient',
            ],
            [
              '3',
              'Hạ mẫu lớp âm (undersampling)',
              'Vứt bớt dữ liệu âm',
              'Mất thông tin về đuôi phân phối lành tính; phá hiệu chuẩn (có công thức sửa)',
              'Chủ yếu vì lý do tính toán: 400 triệu dòng không vừa bộ nhớ',
            ],
            [
              '4',
              'Thêm dữ liệu dương thật',
              'Dữ liệu — theo hướng tốt',
              'Tốn công; cần weak supervision, mô phỏng tấn công, hoặc gán nhãn chủ động',
              'Đòn bẩy lớn nhất trong dài hạn. Gần như luôn đáng đầu tư hơn ba cách trên.',
            ],
            [
              '5',
              'Sinh mẫu tổng hợp (SMOTE và biến thể)',
              'Bịa ra dữ liệu dương chưa từng tồn tại',
              'Cao — xem phần dưới',
              'Hiếm. Chủ yếu khi đặc trưng liên tục, chiều thấp, và lớp dương thực sự đồng nhất.',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao đổi ngưỡng lại là lựa chọn đầu tiên',
          md: 'Các phép lấy mẫu lại và đánh trọng số **hầu như không làm thay đổi thứ tự xếp hạng** mà mô hình tạo ra — chúng chủ yếu dịch chuyển thang điểm. Mà nếu thứ tự không đổi thì ROC-AUC không đổi, PR-AUC gần như không đổi, và precision@k không đổi.\n\nNói cách khác: bạn bỏ ba tuần cân bằng dữ liệu để đạt được thứ mà một dòng `diem >= 0.004` cho bạn trong ba giây. Đây là kết luận đã được lặp lại nhiều lần trong các so sánh có kiểm soát trên dữ liệu dạng bảng, và nó khớp với lý thuyết chi phí ở bài trước: mất cân bằng dịch chuyển ngưỡng tối ưu, không phá huỷ khả năng phân biệt.',
        },
        { t: 'h', text: 'Vì sao SMOTE thường phản tác dụng trong bảo mật', level: 2 },
        {
          t: 'p',
          md: 'SMOTE (Chawla và cộng sự, 2002) sinh mẫu mới bằng cách **nội suy tuyến tính giữa một mẫu thiểu số và một trong các láng giềng gần nhất của nó**. Ý tưởng đẹp, và nó hoạt động tốt trong bối cảnh mà nó được thiết kế: đặc trưng liên tục, số chiều thấp, lớp thiểu số tạo thành một vùng liền mạch. Dữ liệu bảo mật vi phạm cả ba điều kiện.',
        },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Đặc trưng bảo mật không nội suy được.** Nội suy giữa `so_luong_import = 12` và `so_luong_import = 87` cho ra 49,5 — không tệ. Nhưng nội suy giữa `co_chu_ky_so = 1` và `co_chu_ky_so = 0` cho ra 0,5, tương ứng với **một tệp không tồn tại**. Với các đặc trưng nhị phân, đếm, và one-hot — tức phần lớn đặc trưng bảo mật — mẫu sinh ra nằm ngoài đa tạp dữ liệu thật.',
            '**Lớp dương không phải một cụm, mà là nhiều cụm rời nhau.** Ransomware, keylogger, cryptominer là ba vùng hoàn toàn khác nhau trong không gian đặc trưng. Nội suy giữa một mẫu ransomware và một mẫu cryptominer tạo ra một “con lai” không ứng với mã độc nào trên đời — và mô hình học một ranh giới đi qua vùng trống đó.',
            '**Không gian nhiều chiều thì đường nối hai điểm gần như luôn đi qua vùng rỗng.** Với vài trăm chiều, khoảng cách giữa mọi cặp điểm trở nên gần bằng nhau (lời nguyền số chiều), nên khái niệm “láng giềng gần nhất” mất ý nghĩa, và điểm giữa hai láng giềng không nằm “giữa” theo nghĩa trực giác nào cả.',
            '**Mẫu tổng hợp lấn vào vùng của lớp âm.** Vì các mẫu dương thưa thớt, đoạn nối giữa chúng thường xuyên đi xuyên qua vùng dày đặc mẫu lành tính. Mô hình được dạy rằng vùng đó là độc hại → **báo động giả tăng ngay tại vùng có lưu lượng lớn nhất**. Đây là cơ chế cụ thể khiến FP tăng sau khi dùng SMOTE.',
            '**Hiệu chuẩn bị phá huỷ.** Sau khi cân bằng về 50/50, xác suất mô hình trả về phản ánh một thế giới có 50% tấn công. Mọi phép tính chi phí ở bài t4-l4 trở nên vô nghĩa nếu không hiệu chỉnh lại tỉ lệ nền.',
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Và cái bẫy nguy hiểm nhất: SMOTE trước khi chia tập',
          md: 'Nếu bạn chạy SMOTE trên toàn bộ dữ liệu rồi mới chia train/test, một mẫu tổng hợp trong tập kiểm tra có thể được nội suy từ chính các mẫu nằm trong tập huấn luyện. Điểm số sẽ nhảy vọt và **hoàn toàn giả**.\n\nĐây là dạng rò rỉ tiền xử lý đã học ở t2-l6, và nó là lý do rất nhiều bài báo báo cáo F1 trên 0,99 cho các bài toán phát hiện xâm nhập trên CIC-IDS2017 hay NSL-KDD. Nếu bạn buộc phải dùng lấy mẫu lại: đặt nó **bên trong** `imblearn.pipeline.Pipeline` và chỉ áp lên phần huấn luyện của mỗi fold. Tập kiểm tra phải giữ nguyên tỉ lệ lớp thật, không bao giờ được cân bằng lại.',
        },
        {
          t: 'compare',
          title: 'Hai triết lý xử lý mất cân bằng',
          left: {
            title: 'Sửa QUYẾT ĐỊNH (nên làm trước)',
            icon: 'sliders',
            items: [
              'Giữ nguyên dữ liệu thật, giữ nguyên tỉ lệ nền thật',
              'Đổi chỉ số: PR-AUC, precision@k thay cho accuracy',
              'Đổi ngưỡng theo ma trận chi phí (bài t4-l4)',
              'Giữ nguyên hiệu chuẩn nên phép tính chi phí vẫn dùng được',
              'Chi phí thực hiện: vài phút. Rủi ro: gần bằng không.',
            ],
          },
          right: {
            title: 'Sửa DỮ LIỆU (chỉ khi cần)',
            icon: 'flask',
            items: [
              'Thay đổi phân phối mà mô hình nhìn thấy',
              'class_weight, hạ mẫu, oversampling, SMOTE',
              'Có thể giúp khi lớp dương quá ít để ảnh hưởng tới gradient',
              'Phá hiệu chuẩn — phải hiệu chỉnh lại xác suất sau đó',
              'Chi phí: hàng ngày công. Rủi ro: rò rỉ, mẫu ảo, FP tăng.',
            ],
          },
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't4l5-cp1',
              kind: 'mcq',
              tags: ['mat-can-bang', 'smote'],
              q: 'Sau khi áp dụng SMOTE, F1 trên tập kiểm tra đã cân bằng lại tăng từ 0,42 lên 0,88. Kết luận nào đúng nhất?',
              options: [
                'Mô hình đã tốt hơn thật sự, nên triển khai ngay',
                'Con số này không so sánh được vì tập kiểm tra đã bị đổi tỉ lệ lớp; phải đo lại trên tỉ lệ thật',
                'SMOTE luôn cải thiện F1 nên đây là kết quả bình thường',
                'F1 tăng chứng tỏ recall tăng, nên số vụ bỏ sót đã giảm',
              ],
              answer: 1,
              why: 'Tập kiểm tra đã cân bằng lại là một thế giới không tồn tại. Precision đo trên tập 50/50 có mẫu số FP nhỏ hơn thực tế hàng nghìn lần, nên nó luôn đẹp một cách giả tạo. Quy tắc cứng: **mọi phép lấy mẫu lại chỉ được áp lên tập huấn luyện; tập kiểm định và tập kiểm tra phải giữ nguyên tỉ lệ lớp thật.** Đo lại đúng cách, con số 0,88 thường tụt về gần 0,42 hoặc thấp hơn.',
              distractorWhy: [
                'Kết quả trên phân phối giả không nói gì về hiệu năng trên phân phối thật.',
                '',
                'SMOTE không “luôn” cải thiện gì cả; và ở đây phần lớn mức tăng đến từ việc đổi tập đánh giá.',
                'Recall có thể tăng thật, nhưng F1 trên tập đã đổi tỉ lệ không cho phép kết luận gì về số vụ bỏ sót ngoài đời.',
              ],
            },
            {
              id: 't4l5-cp2',
              kind: 'truefalse',
              tags: ['mat-can-bang', 'hieu-chuan'],
              q: 'Sau khi hạ mẫu lớp âm còn 2%, xác suất mô hình trả về vẫn dùng trực tiếp được cho công thức ngưỡng theo chi phí.',
              answer: false,
              why: 'Hạ mẫu làm tỉ lệ nền mà mô hình nhìn thấy cao hơn thực tế 50 lần, nên mọi xác suất nó trả về đều bị thổi phồng. Muốn dùng lại được, phải hiệu chỉnh về tỉ lệ nền thật. Với tỉ lệ giữ lại beta, công thức chuẩn là: **p_thật = beta × p_lệch / (1 − p_lệch + beta × p_lệch)**. Ví dụ beta = 0,02 và p_lệch = 0,5 thì p_thật ≈ 0,0196. Không làm bước này thì ngưỡng chi phí ở bài t4-l4 sẽ sai theo hệ số hàng chục lần.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Ba cách xử lý mất cân bằng, xếp theo thứ tự nên thử',
          code:
            "import numpy as np\n" +
            "import lightgbm as lgb\n" +
            "from sklearn.linear_model import LogisticRegression\n" +
            "from sklearn.metrics import average_precision_score\n" +
            "\n" +
            "# --- Cách 1 (LUÔN THỬ TRƯỚC): không đụng dữ liệu, chỉ đổi chỉ số và ngưỡng ---\n" +
            "gbm = lgb.LGBMClassifier(n_estimators=600, learning_rate=0.05)\n" +
            "gbm.fit(X_train, y_train)\n" +
            "p = gbm.predict_proba(X_val)[:, 1]\n" +
            "print('PR-AUC:', round(average_precision_score(y_val, p), 4))\n" +
            "print('Tỉ lệ dương (mức tham chiếu):', round(y_val.mean(), 6))\n" +
            "# Nếu PR-AUC vượt xa mức tham chiếu thì mô hình ĐÃ học được; vấn đề chỉ là ngưỡng.\n" +
            "\n" +
            "# --- Cách 2: đổi trọng số trong hàm mất mát, giữ nguyên dữ liệu ---\n" +
            "ty_le = (y_train == 0).sum() / max((y_train == 1).sum(), 1)\n" +
            "gbm_w = lgb.LGBMClassifier(scale_pos_weight=ty_le, n_estimators=600, learning_rate=0.05)\n" +
            "lr_w = LogisticRegression(max_iter=2000, class_weight='balanced')\n" +
            "\n" +
            "# --- Cách 3: hạ mẫu lớp âm VÌ LÝ DO TÍNH TOÁN, rồi hiệu chỉnh lại xác suất ---\n" +
            "beta = 0.02                                  # tỉ lệ mẫu âm được giữ lại\n" +
            "p_lech = gbm_ha_mau.predict_proba(X_val)[:, 1]\n" +
            "p_that = beta * p_lech / (1 - p_lech + beta * p_lech)\n" +
            "print('Trước hiệu chỉnh:', round(float(p_lech.mean()), 4),\n" +
            "      '| Sau hiệu chỉnh:', round(float(p_that.mean()), 6))\n",
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Cách đầu tư đúng chỗ: khai thác mẫu âm khó',
          md: 'Nếu bạn có ngân sách cho một việc duy nhất, đừng bỏ vào SMOTE. Hãy bỏ vào **hard negative mining**: lấy các mẫu **lành tính** bị mô hình chấm điểm cao nhất, cho analyst xác nhận, rồi đưa vào tập huấn luyện.\n\nLý do: trong bảo mật, ranh giới quyết định gần như luôn bị định hình bởi những mẫu lành tính lạ lùng — công cụ quản trị hệ thống, script sao lưu, phần mềm bảo mật của chính bạn — chứ không phải bởi việc thiếu mẫu độc. Mỗi mẫu âm khó được gán nhãn có giá trị cao hơn hàng nghìn mẫu dương bịa ra. Đây cũng là vòng lặp tự nhiên với quy trình SOC: analyst vốn đã đang đóng những cảnh báo đó rồi.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Bốn dấu hiệu bạn đang chữa nhầm bệnh',
          md: '**1.** Bạn báo cáo accuracy hoặc F1 trên tập đã cân bằng lại → bạn đang đo một thế giới không tồn tại.\n\n**2.** Bạn cân bằng dữ liệu nhưng PR-AUC gần như không đổi → xác nhận rằng thứ tự xếp hạng không đổi, và bạn vừa làm một việc không cần thiết.\n\n**3.** Bạn dùng `predict()` thay vì `predict_proba()` → bạn đang để thư viện quyết định ngưỡng thay mình.\n\n**4.** Sau khi cân bằng, mọi xác suất đều quanh 0,5 → hiệu chuẩn đã hỏng, và mọi phép tính chi phí xuống sông.',
        },
        { t: 'terms', ids: ['mat-can-bang', 'base-rate', 'pr-auc', 'hieu-chuan', 'nguong', 'ro-ri-du-lieu'] },
      ],
      keyTakeaways: [
        'Mất cân bằng chủ yếu là vấn đề của ngưỡng và chỉ số, không phải của dữ liệu — kiểm tra bằng PR-AUC trước khi động vào bất cứ thứ gì.',
        'Thứ tự nên thử: đổi chỉ số và ngưỡng → class_weight → hạ mẫu vì lý do tính toán → thêm dữ liệu dương thật → cuối cùng mới tới sinh mẫu tổng hợp.',
        'SMOTE giả định đặc trưng liên tục, chiều thấp và lớp thiểu số liền mạch; dữ liệu bảo mật vi phạm cả ba nên mẫu sinh ra thường không ứng với đối tượng có thật.',
        'Mẫu tổng hợp hay nằm lấn vào vùng lành tính đông đúc, làm báo động giả tăng đúng ở nơi lưu lượng lớn nhất.',
        'Mọi phép lấy mẫu lại chỉ áp lên tập huấn luyện; tập kiểm định và kiểm tra phải giữ nguyên tỉ lệ lớp thật.',
        'Sau khi hạ mẫu lớp âm với tỉ lệ giữ lại beta, hiệu chỉnh xác suất bằng p_thật = beta·p / (1 − p + beta·p).',
        'Đầu tư hiệu quả nhất thường là khai thác mẫu âm khó, không phải bịa thêm mẫu dương.',
      ],
      cards: [
        {
          id: 't4l5-c1',
          front: 'Cách xử lý mất cân bằng nào nên thử ĐẦU TIÊN, và vì sao?',
          back: 'Đổi chỉ số (PR-AUC, precision@k) và đổi ngưỡng. Vì lấy mẫu lại hầu như không đổi thứ tự xếp hạng, nên phần lớn cải thiện thật ra đến từ việc chọn điểm cắt đúng — mất vài phút thay vì vài tuần.',
          tags: ['mat-can-bang', 'nguong'],
        },
        {
          id: 't4l5-c2',
          front: 'Nêu hai lý do kỹ thuật khiến SMOTE thường phản tác dụng trên dữ liệu bảo mật.',
          back: 'Đặc trưng phần lớn là nhị phân, đếm hoặc one-hot nên nội suy tạo ra mẫu không tồn tại; và lớp dương gồm nhiều họ rời nhau nên nội suy giữa hai họ tạo ra con lai vô nghĩa.',
          tags: ['smote', 'mat-can-bang'],
        },
        {
          id: 't4l5-c3',
          front: 'Vì sao SMOTE làm tăng báo động giả?',
          back: 'Vì mẫu dương thưa nên đoạn nối giữa chúng thường xuyên đi xuyên vùng dày đặc mẫu lành tính; mô hình học rằng vùng đó là độc hại, và đó là nơi có lưu lượng lớn nhất.',
          tags: ['smote', 'bao-dong-gia'],
        },
        {
          id: 't4l5-c4',
          front: 'Sau khi hạ mẫu lớp âm còn tỉ lệ beta, hiệu chỉnh xác suất bằng công thức nào?',
          back: 'p_thật = beta × p_lệch / (1 − p_lệch + beta × p_lệch). Không hiệu chỉnh thì mọi ngưỡng theo chi phí đều sai theo hệ số hàng chục lần.',
          hint: 'Ý tưởng: hạ mẫu nhân tỉ số cược (odds) lên 1/beta, nên phải nhân ngược lại.',
          tags: ['hieu-chuan', 'mat-can-bang'],
        },
        {
          id: 't4l5-c5',
          front: 'Hard negative mining là gì và vì sao nó hiệu quả hơn oversampling trong bảo mật?',
          back: 'Lấy các mẫu lành tính bị chấm điểm cao nhất cho analyst xác nhận rồi đưa vào tập huấn luyện. Hiệu quả hơn vì ranh giới quyết định bị định hình bởi mẫu lành tính lạ lùng, không phải bởi thiếu mẫu độc.',
          tags: ['mat-can-bang', 'thuc-chien'],
        },
      ],
      quiz: [
        {
          id: 't4-l5-q1',
          kind: 'mcq',
          tags: ['mat-can-bang'],
          q: 'Tỉ lệ 1:5.000. Bạn chạy hai thí nghiệm: (A) mô hình gốc, PR-AUC = 0,41; (B) mô hình sau SMOTE, PR-AUC = 0,40, đo trên cùng tập kiểm tra giữ nguyên tỉ lệ thật. Kết luận?',
          options: [
            'SMOTE không giúp gì ở đây; nên bỏ nó và tập trung vào ngưỡng và đặc trưng',
            'SMOTE có hại vì PR-AUC giảm 0,01',
            'Cần chạy thêm SMOTE với tỉ lệ cân bằng cao hơn',
            'Kết quả này không hợp lệ vì tập kiểm tra chưa được cân bằng',
          ],
          answer: 0,
          why: 'Chênh lệch 0,01 PR-AUC gần như chắc chắn nằm trong nhiễu lấy mẫu, đặc biệt khi số mẫu dương chỉ vài trăm — hãy bootstrap để thấy khoảng tin cậy chồng lên nhau. Kết luận đúng là **SMOTE không mang lại gì**, đúng như dự đoán từ lý thuyết: nó không thay đổi khả năng xếp hạng. Thời gian nên dồn vào chỗ có đòn bẩy thật: đặc trưng tốt hơn, mẫu âm khó, và chọn ngưỡng theo chi phí. Đáp án cuối là bẫy nguy hiểm nhất — cân bằng tập kiểm tra là cách chắc chắn để tự lừa mình.',
          distractorWhy: [
            '',
            'Kết luận “có hại” dựa trên chênh lệch nhỏ hơn nhiễu là suy diễn quá mức; đúng hơn là nó vô tác dụng.',
            'Tăng mức cân bằng chỉ khuếch đại các vấn đề của mẫu tổng hợp, không tạo ra thông tin mới.',
            'Ngược lại: tập kiểm tra BẮT BUỘC phải giữ nguyên tỉ lệ lớp thật thì con số mới có nghĩa.',
          ],
        },
        {
          id: 't4-l5-q2',
          kind: 'order',
          tags: ['mat-can-bang', 'quy-trinh'],
          q: 'Sắp xếp các bước xử lý mất cân bằng theo thứ tự nên thực hiện.',
          items: [
            'Đo bằng PR-AUC và precision@k để xem mô hình có thực sự học được không',
            'Chọn ngưỡng theo chi phí hoặc theo công suất thay vì dùng 0,5',
            'Thử class_weight hoặc scale_pos_weight và so lại trên cùng tập kiểm định',
            'Đầu tư thu thập thêm nhãn dương thật và khai thác mẫu âm khó',
            'Chỉ khi tất cả các bước trên đã cạn, mới cân nhắc sinh mẫu tổng hợp',
          ],
          why: 'Thứ tự này xếp theo tỉ lệ lợi ích trên rủi ro giảm dần. Hai bước đầu miễn phí, không đụng dữ liệu, không phá hiệu chuẩn, và giải quyết được phần lớn trường hợp. Bước ba đụng vào hàm mất mát nên bắt đầu có rủi ro hiệu chuẩn. Bước bốn tốn công nhất nhưng là thứ duy nhất tạo ra thông tin mới. Sinh mẫu tổng hợp đứng cuối vì nó vừa không tạo thông tin mới vừa mang theo rủi ro mẫu ảo và rò rỉ.',
        },
        {
          id: 't4-l5-q3',
          kind: 'multi',
          tags: ['mat-can-bang', 'ro-ri-du-lieu'],
          q: 'Quy tắc nào phải luôn tuân thủ khi làm việc với dữ liệu mất cân bằng? (Chọn tất cả đáp án đúng)',
          options: [
            'Chỉ áp dụng lấy mẫu lại lên phần huấn luyện, bên trong pipeline',
            'Giữ nguyên tỉ lệ lớp thật ở tập kiểm định và tập kiểm tra',
            'Báo cáo PR-AUC kèm tỉ lệ lớp dương của tập đánh giá',
            'Cân bằng dữ liệu về 50/50 trước khi chia tập để mô hình học ổn định hơn',
          ],
          answers: [0, 1, 2],
          why: 'Ba quy tắc đầu bảo vệ tính trung thực của con số bạn báo cáo. Ý cuối là công thức tạo ra rò rỉ dữ liệu kinh điển: mẫu tổng hợp trong tập kiểm tra được nội suy từ các mẫu trong tập huấn luyện, khiến điểm số nhảy vọt và hoàn toàn giả. Nếu bạn thấy một bài báo hoặc một notebook báo F1 trên 0,99 cho bài toán phát hiện xâm nhập, kiểm tra thứ tự SMOTE và chia tập là việc đầu tiên nên làm.',
        },
        {
          id: 't4-l5-q4',
          kind: 'input',
          tags: ['hieu-chuan', 'mat-can-bang'],
          q: 'Bạn hạ mẫu lớp âm còn beta = 0,01. Mô hình trả về p_lệch = 0,50 cho một mẫu. Xác suất thật xấp xỉ bao nhiêu? (Nhập số thập phân, ví dụ 0,0123)',
          accept: ['0,0099', '0.0099', '0,01', '0.01', '0,00990', '0.0099009'],
          placeholder: 'Nhập xác suất đã hiệu chỉnh…',
          hint: 'p_thật = beta × p / (1 − p + beta × p).',
          why: 'p_thật = 0,01 × 0,5 / (0,5 + 0,01 × 0,5) = 0,005 / 0,505 ≈ **0,0099**, tức khoảng 1%. Đây là khác biệt 50 lần so với con số 0,5 mà mô hình trả về, và nó quyết định trực tiếp việc bạn đặt ngưỡng ở đâu. Bài học rộng hơn: **bất kỳ thao tác nào làm thay đổi tỉ lệ lớp mà mô hình nhìn thấy đều làm hỏng ý nghĩa xác suất của đầu ra**, và bạn phải hoặc hiệu chỉnh bằng công thức, hoặc hiệu chuẩn lại trên dữ liệu giữ nguyên tỉ lệ thật (bài t4-l6).',
        },
        {
          id: 't4-l5-q5',
          kind: 'truefalse',
          tags: ['mat-can-bang', 'smote'],
          q: 'SMOTE tạo ra thông tin mới về lớp thiểu số mà mô hình chưa từng thấy.',
          answer: false,
          why: 'SMOTE chỉ nội suy giữa các mẫu **đã có** trong tập huấn luyện — nó không thêm một bit thông tin nào về thế giới thật. Thứ nó thay đổi là **hình dạng của hàm mất mát**: mô hình bị ép quan tâm nhiều hơn tới vùng quanh các mẫu thiểu số. Cùng hiệu ứng đó đạt được bằng class_weight mà không phải bịa ra điểm dữ liệu nào cả, và không mang theo rủi ro mẫu ảo. Muốn có thông tin mới thì chỉ có một cách: thêm dữ liệu thật — mẫu dương mới, hoặc mẫu âm khó đã được gán nhãn.',
        },
      ],
      terms: ['mat-can-bang', 'base-rate', 'pr-auc', 'hieu-chuan', 'nguong', 'ro-ri-du-lieu'],
      further: [
        {
          title: 'SMOTE: Synthetic Minority Over-sampling Technique — Chawla và cộng sự (2002)',
          note: 'Đọc bài gốc để thấy rõ giả định thiết kế: đặc trưng liên tục, số chiều thấp. Hiểu giả định là hiểu khi nào không nên dùng.',
        },
        {
          title: 'Calibrating Probability with Undersampling for Unbalanced Classification — Dal Pozzolo và cộng sự (2015)',
          note: 'Nguồn của công thức hiệu chỉnh xác suất sau hạ mẫu, viết trong bối cảnh phát hiện gian lận thẻ.',
        },
        {
          title: 'imbalanced-learn — tài liệu chính thức',
          note: 'Nếu buộc phải lấy mẫu lại, dùng Pipeline của thư viện này để phép lấy mẫu chỉ chạm vào phần huấn luyện của mỗi fold.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't4-l6',
      trackId: 'do-luong',
      title: 'Hiệu chuẩn xác suất',
      subtitle: 'Điểm 0,9 có nghĩa là gì, và vì sao câu trả lời quyết định mọi phép tính chi phí',
      minutes: 21,
      practiceMinutes: 7,
      level: 'nang-cao',
      prereqs: ['t4-l5'],
      why: {
        short:
          'Toàn bộ phép tính ngưỡng theo chi phí ở bài t4-l4 giả định điểm số của mô hình là xác suất thật; nếu chưa hiệu chuẩn thì giả định đó sai và mọi quyết định dựng trên nó cũng sai theo.',
        scenario:
          'Analyst hỏi bạn: “cảnh báo này mô hình cho 0,87, nghĩa là 87% khả năng có thật à?” Nếu câu trả lời là không, bạn cần biết con số đó thực sự nghĩa là gì — và cần một quy trình để nó có nghĩa vào lần sau.',
        roles: ['Security Data Scientist', 'ML Engineer', 'Detection Engineer', 'SOC Analyst'],
        costOfNotKnowing:
          'Bạn gộp điểm của ba mô hình khác nhau vào một điểm rủi ro tổng, tính chi phí kỳ vọng từ những con số không phải xác suất, và ra quyết định tự động dựa trên một thang đo không có đơn vị.',
      },
      objectives: [
        'Phát biểu định nghĩa hiệu chuẩn bằng một phép kiểm tra thực hiện được trên dữ liệu',
        'Đọc biểu đồ độ tin cậy và nói ra mô hình đang tự tin thái quá hay quá dè dặt',
        'Chọn giữa Platt scaling và isotonic regression theo lượng dữ liệu và hình dạng sai lệch',
        'Đo hiệu chuẩn bằng Brier score và ECE, đồng thời nêu được giới hạn của cả hai trong bối cảnh mất cân bằng',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Mô hình phát hiện chiếm quyền tài khoản của bạn chấm 0,90 cho 1.200 phiên đăng nhập trong tháng. Nếu mô hình được hiệu chuẩn tốt, bạn kỳ vọng bao nhiêu trong số 1.200 phiên đó thực sự là chiếm quyền? Và nếu kiểm tra thấy con số thật là 43, điều đó nói lên gì?',
          reveal:
            'Nếu hiệu chuẩn tốt: khoảng **1.080 phiên** (90%) phải là chiếm quyền thật. Đó chính là **định nghĩa** của hiệu chuẩn.\n\nCon số thật là 43, tức **3,6%**. Mô hình đang tự tin thái quá gấp **25 lần**.\n\nHậu quả cụ thể, không phải lý thuyết:\n\n- Công thức ngưỡng t\\* = C_FP/(C_FP + C_FN) trở nên vô nghĩa vì trục hoành của nó không phải xác suất.\n- Analyst học được rằng “0,9 nghĩa là chắc lắm” rồi phát hiện 24 trên 25 lần là rác → họ ngừng tin toàn bộ thang điểm.\n- Nếu bạn cộng hoặc nhân điểm này với điểm của một mô hình khác để ra “điểm rủi ro tổng”, bạn đang cộng hai đại lượng không cùng đơn vị.\n\nĐiều quan trọng nhất: mô hình này có thể vẫn **xếp hạng rất tốt**. ROC-AUC của nó có thể là 0,99. Hiệu chuẩn và khả năng xếp hạng là hai phẩm chất **hoàn toàn tách rời**.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Hai phẩm chất khác nhau của một mô hình',
          md: '**Khả năng phân biệt (discrimination)**: mô hình có xếp mẫu độc lên trên mẫu lành không? Đo bằng ROC-AUC, PR-AUC, precision@k.\n\n**Hiệu chuẩn (calibration)**: con số mô hình đưa ra có đúng bằng tần suất thật không? Đo bằng biểu đồ độ tin cậy, Brier score, ECE.\n\nPhép thử để thấy chúng tách rời: lấy mô hình của bạn và **chia mọi điểm cho 10**. Thứ tự không đổi một chút nào → ROC-AUC, PR-AUC, precision@k y hệt. Nhưng hiệu chuẩn thì hỏng hoàn toàn.\n\nHệ quả thực hành: hiệu chuẩn **không bao giờ** cứu được một mô hình xếp hạng kém. Nó chỉ dịch một thang đo tốt sang đúng đơn vị. Hãy sửa khả năng phân biệt trước, hiệu chuẩn sau.',
        },
        { t: 'h', text: 'Đọc biểu đồ độ tin cậy', level: 2 },
        {
          t: 'p',
          md: 'Cách làm: chia toàn bộ mẫu thành các nhóm theo điểm dự đoán (nên chia theo **phân vị**, không chia đều, để mỗi nhóm có đủ mẫu). Với mỗi nhóm, chấm một điểm: trục ngang là điểm trung bình mô hình dự đoán, trục dọc là **tỉ lệ dương thật** trong nhóm đó. Hiệu chuẩn hoàn hảo là đường chéo 45 độ.',
        },
        {
          t: 'figure',
          id: 'fig-calibration',
          caption: 'Biểu đồ độ tin cậy: đường chéo là lý tưởng. Nằm dưới đường chéo là tự tin thái quá (nói 0,9 nhưng thực tế 0,3); nằm trên là quá dè dặt.',
        },
        {
          t: 'table',
          head: ['Họ mô hình', 'Sai lệch điển hình', 'Nguyên nhân', 'Cách vá thường dùng'],
          rows: [
            ['Cây tăng cường (LightGBM, XGBoost)', 'Đẩy điểm ra hai cực, thường tự tin thái quá ở đuôi', 'Tối ưu log-loss trên dữ liệu lệch, cộng thêm regularization và early stopping', 'Isotonic nếu đủ dữ liệu, Platt nếu ít'],
            ['SVM', 'Đầu ra không phải xác suất; hình chữ S rõ rệt', 'Hàm mất mát hinge không phải quy tắc chấm điểm đúng', 'Platt scaling (đây chính là bối cảnh nó ra đời)'],
            ['Naive Bayes', 'Cực kỳ tự tin thái quá, điểm dồn về 0 và 1', 'Giả định độc lập bị vi phạm nên bằng chứng bị đếm nhiều lần', 'Isotonic'],
            ['Rừng ngẫu nhiên', 'Quá dè dặt ở hai đầu (hiếm khi ra 0 hoặc 1)', 'Trung bình cộng của nhiều cây kéo điểm về giữa', 'Isotonic'],
            ['Mạng nơ-ron sâu hiện đại', 'Tự tin thái quá rõ rệt, tăng theo độ lớn mô hình', 'Guo và cộng sự (2017) mô tả hiện tượng này chi tiết', 'Temperature scaling (một tham số duy nhất)'],
            ['Hồi quy logistic', 'Thường đã khá tốt sẵn', 'Tối ưu trực tiếp log-loss, vốn là quy tắc chấm điểm đúng', 'Thường không cần'],
          ],
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't4l6-cp1',
              kind: 'mcq',
              tags: ['hieu-chuan'],
              q: 'Bạn chia mọi điểm số của mô hình cho 10. Chỉ số nào thay đổi?',
              options: [
                'ROC-AUC giảm mạnh',
                'Chỉ hiệu chuẩn hỏng; ROC-AUC, PR-AUC và precision@k giữ nguyên',
                'PR-AUC giảm còn ROC-AUC giữ nguyên',
                'Không có gì thay đổi, kể cả hiệu chuẩn',
              ],
              answer: 1,
              why: 'Chia cho 10 là một phép biến đổi **đơn điệu tăng**, nên nó không đổi thứ tự của bất kỳ cặp mẫu nào. Mọi chỉ số chỉ phụ thuộc thứ tự — ROC-AUC, PR-AUC, precision@k — hoàn toàn không đổi. Nhưng giá trị số thì lệch 10 lần, nên biểu đồ độ tin cậy sập xuống dưới đường chéo và Brier score xấu đi. Đây là bài kiểm tra trực giác chuẩn để tách hai khái niệm; nếu bạn trả lời đúng câu này, bạn đã nắm được ý chính của bài.',
              distractorWhy: [
                'ROC-AUC chỉ phụ thuộc thứ tự nên phép chia đều không ảnh hưởng.',
                '',
                'PR-AUC cũng chỉ phụ thuộc thứ tự xếp hạng, nên nó cũng không đổi.',
                'Hiệu chuẩn chắc chắn thay đổi vì giá trị số không còn khớp với tần suất thật.',
              ],
            },
            {
              id: 't4l6-cp2',
              kind: 'truefalse',
              tags: ['hieu-chuan', 'ro-ri-du-lieu'],
              q: 'Có thể hiệu chuẩn mô hình trên chính tập dữ liệu đã dùng để huấn luyện nó.',
              answer: false,
              why: 'Trên tập huấn luyện, mô hình đã khớp quá tốt nên phân bố điểm ở đó không giống phân bố điểm trên dữ liệu mới — hàm hiệu chuẩn học được sẽ sai đúng theo hướng làm mọi thứ trông đẹp hơn. Hiệu chuẩn cần một tập **riêng biệt**, và trong bảo mật phải là tập ở giai đoạn **sau** về mặt thời gian, vì bạn muốn hàm hiệu chuẩn phản ánh tỉ lệ nền và phân bố mà mô hình sẽ gặp khi chạy thật. Nếu dữ liệu ít, dùng `CalibratedClassifierCV` với cross-validation để mỗi phần được hiệu chuẩn bởi phần còn lại.',
            },
          ],
        },
        { t: 'h', text: 'Hai công cụ chính: Platt và isotonic', level: 2 },
        {
          t: 'compare',
          title: 'Chọn phương pháp theo lượng dữ liệu và hình dạng sai lệch',
          left: {
            title: 'Platt scaling (sigmoid)',
            icon: 'compass',
            items: [
              'Khớp một hàm logistic hai tham số lên điểm số của mô hình',
              'Cần ít dữ liệu: vài trăm mẫu, trong đó vài chục mẫu dương là chạy được',
              'Áp đặt hình chữ S — chỉ đúng nếu sai lệch thật sự có dạng đó',
              'Rất ổn định, gần như không quá khớp',
              'Mặc định tốt khi tập hiệu chuẩn nhỏ, và đây là trường hợp phổ biến trong bảo mật',
            ],
          },
          right: {
            title: 'Isotonic regression',
            icon: 'activity',
            items: [
              'Khớp một hàm bậc thang không giảm, không giả định hình dạng',
              'Cần nhiều dữ liệu: nên có từ vài nghìn mẫu và ít nhất vài trăm mẫu dương',
              'Sửa được sai lệch hình dạng bất kỳ, kể cả gấp khúc',
              'Dễ quá khớp khi ít dữ liệu; tạo ra các mảng bằng phẳng ở đầu ra',
              'Có thể gộp các điểm thành nút bằng nhau nên ROC-AUC có thể nhích nhẹ',
            ],
          },
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Hiệu chuẩn, đo, và đọc biểu đồ độ tin cậy',
          code:
            "import numpy as np\n" +
            "from sklearn.calibration import CalibratedClassifierCV, calibration_curve\n" +
            "from sklearn.metrics import brier_score_loss, roc_auc_score\n" +
            "from sklearn.frozen import FrozenEstimator   # scikit-learn >= 1.6\n" +
            "\n" +
            "# Tập hiệu chuẩn phải RIÊNG và nên ở giai đoạn SAU tập huấn luyện về thời gian.\n" +
            "# Trước 1.6 người ta dùng CalibratedClassifierCV(gbm, cv='prefit'); tham số đó đã bị bỏ.\n" +
            "hc = CalibratedClassifierCV(FrozenEstimator(gbm), method='isotonic')\n" +
            "hc.fit(X_cal, y_cal)\n" +
            "\n" +
            "p_tho = gbm.predict_proba(X_test)[:, 1]\n" +
            "p_hc = hc.predict_proba(X_test)[:, 1]\n" +
            "\n" +
            "print('Brier thô :', round(brier_score_loss(y_test, p_tho), 6))\n" +
            "print('Brier sau :', round(brier_score_loss(y_test, p_hc), 6))\n" +
            "# Khả năng xếp hạng gần như không đổi — hiệu chuẩn chỉ dịch thang đo, không sửa mô hình\n" +
            "print('AUC thô/sau:', round(roc_auc_score(y_test, p_tho), 4),\n" +
            "      round(roc_auc_score(y_test, p_hc), 4))\n" +
            "\n" +
            "# strategy='quantile' để mỗi ô có đủ mẫu; chia đều sẽ cho các ô cuối chỉ vài mẫu\n" +
            "ty_le_that, diem_tb = calibration_curve(y_test, p_hc, n_bins=10, strategy='quantile')\n" +
            "for d, t in zip(diem_tb, ty_le_that):\n" +
            "    print(f'Mô hình nói {d:.4f} -> thực tế {t:.4f}')\n",
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Brier score và ECE — cùng giới hạn của chúng',
          md: '**Brier score** = trung bình của (p − y)². Nó là một *quy tắc chấm điểm đúng* (proper scoring rule): giá trị tốt nhất đạt được khi bạn báo cáo đúng xác suất bạn tin. Brier phân rã được thành ba phần: độ tin cậy (calibration), độ phân giải (resolution) và độ bất định nội tại.\n\n**ECE** (expected calibration error) = trung bình có trọng số của khoảng cách |tần suất thật − điểm trung bình| trên các ô.\n\n**Giới hạn phải biết trong bảo mật:** cả hai đều bị **khối mẫu âm khổng lồ chi phối**. Một mô hình luôn trả về 0,0001 cho mọi thứ sẽ có Brier score tuyệt đẹp và ECE gần bằng không — trong khi nó vô dụng.\n\nCách xử lý: **đo hiệu chuẩn trong vùng hoạt động**. Chỉ lấy các mẫu có điểm trên ngưỡng cảnh báo, chia phân vị, và so tần suất thật với điểm dự đoán ở đó. Đó là vùng duy nhất bạn ra quyết định, nên cũng là vùng duy nhất mà hiệu chuẩn có hậu quả.',
        },
        { t: 'h', text: 'Vì sao analyst cần điểm có nghĩa', level: 2 },
        {
          t: 'list',
          ordered: true,
          items: [
            '**Ngưỡng theo chi phí dùng được ngay.** Với xác suất thật, t\\* = C_FP/(C_FP + C_FN) áp thẳng, và mỗi khi chi phí đổi bạn chỉ cần tính lại một phép chia thay vì quét lại toàn bộ.',
            '**Gộp được nhiều nguồn.** Điểm 0,7 của mô hình email và điểm 0,7 của mô hình endpoint chỉ cộng hay nhân được với nhau khi cả hai cùng là xác suất. Không hiệu chuẩn thì “điểm rủi ro tổng” là phép cộng táo với cam.',
            '**Xếp hạng liên hệ thống.** SOC nhận cảnh báo từ EDR, SIEM, mô hình nội bộ, dịch vụ thứ ba. Chỉ thang xác suất chung mới cho phép sắp xếp một hàng đợi duy nhất theo mức độ nghiêm trọng.',
            '**Nói được câu người ta hiểu.** “Nhóm cảnh báo mức này, cứ 10 cái thì khoảng 7 cái là thật” là câu một trưởng ca dùng được để phân bổ người. “Điểm 87 trên thang 100” thì không.',
            '**Tính được tổn thất kỳ vọng.** Báo cáo cho lãnh đạo dạng “rủi ro chưa xử lý tuần này ước tính 240.000 USD” chỉ dựng được từ xác suất đã hiệu chuẩn nhân với thiệt hại.',
          ],
        },
        {
          t: 'lab',
          id: 'lab-calibration',
          intro: 'Kéo lệch điểm số của một mô hình và xem biểu đồ độ tin cậy biến dạng, rồi thử Platt và isotonic để nắn nó về đường chéo. Chú ý điều gì xảy ra với AUC trong lúc đó.',
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Năm cái bẫy về hiệu chuẩn',
          md: '**1. Tưởng điểm của sản phẩm thương mại là xác suất.** “Risk score 87” của một EDR gần như luôn là điểm xếp hạng nội bộ, không phải xác suất. Đừng đưa nó vào công thức chi phí nếu chưa tự hiệu chuẩn lại trên dữ liệu của mình.\n\n**2. Hiệu chuẩn trên dữ liệu đã cân bằng lại.** Hàm hiệu chuẩn sẽ học tỉ lệ nền giả. Phải hiệu chuẩn trên dữ liệu giữ nguyên tỉ lệ thật, hoặc hiệu chỉnh trước theo công thức ở bài t4-l5.\n\n**3. Hiệu chuẩn một lần rồi quên.** Tỉ lệ nền trôi theo mùa và theo chiến dịch tấn công. Hàm hiệu chuẩn cũ sẽ lệch dần. Đặt lịch hiệu chuẩn lại cùng nhịp với giám sát trôi dữ liệu.\n\n**4. Isotonic với 30 mẫu dương.** Bạn sẽ nhận được một hàm bậc thang khớp hoàn hảo vào nhiễu. Dưới vài trăm mẫu dương, chọn Platt.\n\n**5. Dùng hiệu chuẩn để cứu một mô hình xếp hạng kém.** Không có tác dụng. Hiệu chuẩn giữ nguyên thứ tự, nên nó không tạo thêm một chút khả năng phân biệt nào.',
        },
        { t: 'terms', ids: ['hieu-chuan', 'nguong', 'roc-auc', 'mat-can-bang', 'base-rate'] },
      ],
      keyTakeaways: [
        'Hiệu chuẩn nghĩa là: trong nhóm sự kiện được chấm 0,9 thì khoảng 90% thực sự là dương — kiểm tra được trực tiếp trên dữ liệu.',
        'Khả năng phân biệt và hiệu chuẩn là hai phẩm chất tách rời; chia mọi điểm cho 10 không đổi AUC nhưng phá huỷ hiệu chuẩn.',
        'Cây tăng cường và mạng nơ-ron sâu thường tự tin thái quá; rừng ngẫu nhiên thường quá dè dặt; hồi quy logistic thường đã ổn sẵn.',
        'Platt scaling cho tập hiệu chuẩn nhỏ và sai lệch dạng chữ S; isotonic cho dữ liệu nhiều và sai lệch hình dạng bất kỳ.',
        'Hiệu chuẩn phải thực hiện trên tập riêng, giữ nguyên tỉ lệ lớp thật, và nên ở giai đoạn sau về thời gian.',
        'Brier score và ECE bị khối mẫu âm chi phối trong bài toán mất cân bằng — hãy đo hiệu chuẩn riêng trong vùng hoạt động.',
        'Hiệu chuẩn không cứu được mô hình xếp hạng kém; nó chỉ đổi thang đo sang đơn vị dùng được.',
      ],
      cards: [
        {
          id: 't4l6-c1',
          front: 'Định nghĩa hiệu chuẩn bằng một phép kiểm tra thực hiện được trên dữ liệu.',
          back: 'Gom tất cả sự kiện được chấm khoảng 0,9 lại; nếu khoảng 90% trong số đó thực sự là dương thì mô hình hiệu chuẩn tốt tại mức điểm đó.',
          tags: ['hieu-chuan'],
        },
        {
          id: 't4l6-c2',
          front: 'Vì sao chia mọi điểm số cho 10 không làm thay đổi ROC-AUC?',
          back: 'Vì đó là phép biến đổi đơn điệu tăng, không đổi thứ tự bất kỳ cặp mẫu nào. Mọi chỉ số dựa trên thứ tự đều giữ nguyên; chỉ hiệu chuẩn bị phá.',
          tags: ['hieu-chuan', 'roc-auc'],
        },
        {
          id: 't4l6-c3',
          front: 'Khi nào chọn Platt scaling thay vì isotonic regression?',
          back: 'Khi tập hiệu chuẩn nhỏ — dưới vài trăm mẫu dương — vì Platt chỉ có hai tham số nên rất khó quá khớp, còn isotonic sẽ khớp vào nhiễu.',
          tags: ['hieu-chuan'],
        },
        {
          id: 't4l6-c4',
          front: 'Vì sao Brier score và ECE gây hiểu nhầm trong bài toán mất cân bằng cực đoan?',
          back: 'Vì cả hai bị khối mẫu âm khổng lồ chi phối: mô hình luôn trả về giá trị rất nhỏ sẽ có điểm rất đẹp. Phải đo hiệu chuẩn riêng trong vùng điểm cao, nơi thực sự ra quyết định.',
          tags: ['hieu-chuan', 'mat-can-bang'],
        },
        {
          id: 't4l6-c5',
          front: 'Nêu hai lý do vận hành khiến SOC cần điểm đã hiệu chuẩn.',
          back: 'Để áp trực tiếp công thức ngưỡng theo chi phí, và để gộp hoặc xếp hạng chung cảnh báo từ nhiều nguồn khác nhau trên một thang đo có cùng đơn vị.',
          tags: ['hieu-chuan', 'thuc-chien'],
        },
      ],
      quiz: [
        {
          id: 't4-l6-q1',
          kind: 'mcq',
          tags: ['hieu-chuan'],
          q: 'Biểu đồ độ tin cậy của mô hình nằm hẳn **dưới** đường chéo trong toàn bộ vùng điểm cao. Điều đó nghĩa là gì?',
          options: [
            'Mô hình quá dè dặt: nó nói 0,3 trong khi thực tế là 0,7',
            'Mô hình tự tin thái quá: nó nói 0,9 trong khi tần suất thật chỉ khoảng 0,3',
            'Mô hình xếp hạng kém nên cần đổi thuật toán',
            'Tập kiểm tra quá nhỏ nên biểu đồ không đọc được',
          ],
          answer: 1,
          why: 'Trục ngang là điểm mô hình dự đoán, trục dọc là tần suất dương thật. Nằm dưới đường chéo nghĩa là **tần suất thật thấp hơn điểm dự đoán** — mô hình hứa nhiều hơn nó làm được, tức tự tin thái quá. Đây là dạng sai lệch phổ biến nhất với cây tăng cường và mạng nơ-ron sâu. Cách vá đúng là hiệu chuẩn trên tập riêng; đổi thuật toán không cần thiết vì khả năng xếp hạng có thể vẫn rất tốt và hiệu chuẩn không đụng gì tới nó.',
          distractorWhy: [
            'Quá dè dặt là trường hợp nằm TRÊN đường chéo.',
            '',
            'Biểu đồ độ tin cậy không nói gì về khả năng xếp hạng; một mô hình AUC 0,99 vẫn có thể lệch hiệu chuẩn nặng.',
            'Kích thước tập ảnh hưởng tới độ nhiễu của từng ô, nhưng lệch hệ thống trên toàn vùng điểm cao là tín hiệu thật.',
          ],
        },
        {
          id: 't4-l6-q2',
          kind: 'truefalse',
          tags: ['hieu-chuan', 'roc-auc'],
          q: 'Hiệu chuẩn bằng Platt scaling có thể cải thiện đáng kể PR-AUC của mô hình.',
          answer: false,
          why: 'Platt scaling là một hàm logistic **đơn điệu tăng** áp lên điểm số, nên nó không đổi thứ tự của bất kỳ cặp mẫu nào — PR-AUC và ROC-AUC giữ nguyên. Isotonic regression thì không giảm nhưng có thể gộp các giá trị thành mảng bằng nhau, nên AUC có thể nhích rất nhẹ theo cả hai chiều, chủ yếu do cách xử lý các giá trị bằng nhau. Kết luận thực hành: **hiệu chuẩn để có xác suất dùng được, không phải để tăng chỉ số xếp hạng.** Nếu ai đó báo cáo PR-AUC tăng mạnh sau khi hiệu chuẩn, khả năng cao họ đã đổi luôn cả cách chia dữ liệu.',
        },
        {
          id: 't4-l6-q3',
          kind: 'multi',
          tags: ['hieu-chuan', 'thuc-chien'],
          q: 'Yêu cầu nào là bắt buộc với tập dữ liệu dùng để hiệu chuẩn? (Chọn tất cả đáp án đúng)',
          options: [
            'Không được trùng với dữ liệu đã dùng huấn luyện mô hình',
            'Phải giữ nguyên tỉ lệ lớp thật, không được cân bằng lại',
            'Nên ở giai đoạn sau về thời gian so với tập huấn luyện',
            'Phải có ít nhất 50% mẫu dương để hàm hiệu chuẩn ổn định',
          ],
          answers: [0, 1, 2],
          why: 'Ba yêu cầu đầu đều bắt buộc và đều đến từ cùng một nguyên tắc: hàm hiệu chuẩn phải học được mối quan hệ giữa điểm và tần suất thật **trong điều kiện giống lúc chạy thật**. Yêu cầu thứ tư sai và sai theo hướng nguy hiểm: ép tỉ lệ dương lên 50% chính là phá đúng thứ mà hiệu chuẩn cần bảo toàn — tỉ lệ nền. Cái bạn cần không phải tỉ lệ dương cao, mà là **đủ số lượng tuyệt đối mẫu dương** (vài trăm cho isotonic, vài chục cho Platt).',
        },
        {
          id: 't4-l6-q4',
          kind: 'match',
          tags: ['hieu-chuan'],
          q: 'Nối mỗi họ mô hình với dạng sai lệch hiệu chuẩn điển hình của nó.',
          pairs: [
            ['Naive Bayes', 'Tự tin thái quá cực độ, điểm dồn về 0 và 1'],
            ['Rừng ngẫu nhiên', 'Quá dè dặt, hiếm khi cho điểm gần 0 hoặc 1'],
            ['Mạng nơ-ron sâu hiện đại', 'Tự tin thái quá, vá bằng temperature scaling'],
            ['Hồi quy logistic', 'Thường đã hiệu chuẩn khá tốt sẵn'],
          ],
          why: 'Mỗi dạng sai lệch truy được về cơ chế của thuật toán. Naive Bayes đếm bằng chứng nhiều lần vì giả định độc lập bị vi phạm nên nó bị đẩy về hai cực. Rừng ngẫu nhiên lấy trung bình nhiều cây nên đầu ra bị kéo về giữa. Mạng nơ-ron sâu tối ưu tới mức gần như không còn lỗi trên tập huấn luyện nên độ tự tin trôi lên. Hồi quy logistic tối ưu trực tiếp log-loss — một quy tắc chấm điểm đúng — nên nó thường đã ở gần đường chéo. Biết cơ chế thì đoán được dạng sai lệch trước cả khi vẽ biểu đồ.',
        },
        {
          id: 't4-l6-q5',
          kind: 'input',
          tags: ['hieu-chuan', 'chi-phi'],
          q: 'Mô hình đã hiệu chuẩn cho một cảnh báo xác suất 0,004. Chi phí xử lý một cảnh báo là 12 USD, chi phí kỳ vọng của một vụ bỏ sót là 4.500 USD. Giá trị kỳ vọng của việc điều tra cảnh báo này là bao nhiêu USD? (Nhập số, có thể âm)',
          accept: ['6', '6 usd', '+6', '6.0', '6,0'],
          placeholder: 'Nhập giá trị kỳ vọng theo USD…',
          hint: 'Lợi ích kỳ vọng = p × C_FN. Trừ đi chi phí điều tra.',
          why: 'Lợi ích kỳ vọng = 0,004 × 4.500 = 18 USD. Trừ chi phí điều tra 12 USD → **+6 USD**. Dương, nên nên điều tra. Kiểm chứng bằng công thức ngưỡng: t\\* = 12/(12 + 4.500) = 0,00266, và 0,004 > 0,00266 nên đúng là vượt ngưỡng. Hai cách tính phải luôn cho cùng kết luận — và cả hai chỉ đúng khi con số 0,004 là **xác suất thật**. Đó là toàn bộ lý do bài học này tồn tại: không hiệu chuẩn thì phép tính đẹp đẽ trên đây chỉ là số học trên một thang đo không có đơn vị.',
        },
      ],
      terms: ['hieu-chuan', 'nguong', 'roc-auc', 'mat-can-bang', 'base-rate'],
      further: [
        {
          title: 'On Calibration of Modern Neural Networks — Guo và cộng sự (2017)',
          note: 'Bài báo mô tả hiện tượng mạng nơ-ron hiện đại tự tin thái quá và giới thiệu temperature scaling — một tham số, cực rẻ, rất hiệu quả.',
        },
        {
          title: 'Beta calibration — Kull, Silva Filho & Flach (2017)',
          note: 'Lựa chọn ở giữa Platt và isotonic: linh hoạt hơn sigmoid nhưng vẫn ít tham số, hợp với tập hiệu chuẩn cỡ trung.',
        },
        {
          title: 'scikit-learn — Probability calibration',
          note: 'Đọc phần CalibratedClassifierCV và FrozenEstimator. Từ phiên bản 1.6, cách hiệu chuẩn một mô hình đã huấn luyện sẵn đã thay đổi.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't4-l8',
      trackId: 'do-luong',
      title: 'So sánh hai mô hình cho ra kết luận đứng vững',
      subtitle: 'Chênh 0,03 PR-AUC là tiến bộ thật hay là nhiễu của một tập kiểm thử?',
      minutes: 24,
      practiceMinutes: 3,
      level: 'nang-cao',
      prereqs: ['t4-l3'],
      why: {
        short:
          'Mọi quyết định thay mô hình đều dựa trên một phép so sánh, nhưng so hai con số trần trụi thì không phân biệt được tiến bộ thật với dao động của một lần chia dữ liệu.',
        scenario:
          'Bạn vừa huấn luyện phiên bản mới. PR-AUC 0,71 so với 0,68 của mô hình đang chạy. Trưởng nhóm hỏi: “chắc chưa, đủ để thay cái đang chạy chưa?” Câu trả lời trung thực cần một khoảng tin cậy cho **hiệu số**, không phải hai con số đặt cạnh nhau.',
        roles: ['Security Data Scientist', 'ML Engineer', 'Detection Engineer'],
        costOfNotKnowing:
          'Bạn thay mô hình đang chạy ổn bằng một mô hình chỉ hơn nhờ may mắn chia tập, rồi mất nhiều tuần truy tìm vì sao số liệu sản xuất không khớp số liệu ngoại tuyến — trong khi nguyên nhân là chưa từng có khác biệt nào để mà khớp.',
      },
      objectives: [
        'Giải thích vì sao hai chỉ số đo trên CÙNG một tập kiểm thử có sai số tương quan, và vì sao điều đó bắt buộc phải dùng phép kiểm theo cặp',
        'Dựng bảng bất đồng và chạy kiểm định McNemar cho hai bộ phân loại ở một ngưỡng cố định',
        'Ước lượng khoảng tin cậy cho HIỆU SỐ của một chỉ số bằng bootstrap theo cặp',
        'Phân biệt ý nghĩa thống kê với ý nghĩa vận hành, và nêu được khi nào một khác biệt có ý nghĩa thống kê vẫn đáng bị từ chối',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Hai mô hình phát hiện mã độc chạy trên cùng 50.000 tệp kiểm thử. Mô hình A đúng 48.600 tệp, mô hình B đúng 48.538 tệp — chênh nhau 62 tệp. Bạn kết luận được gì? Nếu chưa đủ, bạn cần biết thêm con số nào?',
          reveal:
            'Chưa kết luận được gì, và con số còn thiếu là **hai mô hình bất đồng ở bao nhiêu tệp**.\n\nHãy hình dung hai thái cực. Nếu A và B cho cùng đáp án ở 49.900 tệp và chỉ khác nhau ở 100 tệp, thì việc A thắng 62 trong số ít ỏi đó là một tín hiệu rất mạnh. Nếu A và B khác nhau ở 20.000 tệp mà A chỉ thắng ròng 62, thì đó gần như chắc chắn là tung đồng xu.\n\nCùng một hiệu số 62, hai kết luận trái ngược. Điều quyết định không phải tổng số đúng, mà là **cấu trúc bất đồng** giữa hai mô hình trên từng mẫu.\n\nĐó chính xác là thứ kiểm định McNemar dùng, và là lý do mọi phép so sánh trên cùng một tập kiểm thử phải là phép kiểm **theo cặp**.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Vì sao không được dùng phép kiểm thông thường',
          md: 'Phép kiểm hai mẫu độc lập (t-test hai mẫu, kiểm định tỉ lệ hai mẫu) giả định hai nhóm quan sát tách rời nhau. Ở đây giả định đó **sai hiển nhiên**: cùng một tệp `invoice_2024.exe` được cả hai mô hình chấm.\n\nMột tệp khó thì khó với cả hai; một tệp dễ thì dễ với cả hai. Phần lớn biến thiên trong hai con số là **biến thiên dùng chung**, đến từ việc bạn bốc trúng tập kiểm thử nào chứ không từ mô hình.\n\nPhép kiểm theo cặp khử đúng phần dùng chung đó. Hệ quả rất thực tế: nó **mạnh hơn nhiều** — phát hiện được khác biệt thật với ít dữ liệu hơn hẳn so với việc coi hai mô hình là độc lập.',
        },
        { t: 'h', text: 'Bảng bất đồng: bốn ô cần đếm', level: 2 },
        {
          t: 'p',
          md: 'Với mỗi mẫu trong tập kiểm thử, hỏi hai câu: A đúng hay sai, B đúng hay sai. Bốn khả năng cho bốn ô. Điểm mấu chốt: **hai ô đường chéo không mang thông tin gì** về việc mô hình nào tốt hơn.',
        },
        {
          t: 'table',
          caption: 'Bảng bất đồng trên 50.000 tệp. Chỉ hai ô lệch tâm quyết định kết luận.',
          head: ['', 'B đúng', 'B sai'],
          rows: [
            ['**A đúng**', '48.188 — cả hai đúng, không phân biệt được', '**412** — A thắng (n₀₁)'],
            ['**A sai**', '**350** — B thắng (n₁₀)', '1.050 — cả hai sai, không phân biệt được'],
          ],
        },
        {
          t: 'p',
          md: 'Số mẫu bất đồng là 412 + 350 = **762**. Giả thuyết không của McNemar không phải “hai mô hình giỏi ngang nhau” theo nghĩa mơ hồ, mà rất cụ thể: *trong các mẫu mà hai mô hình bất đồng, xác suất A đúng bằng đúng 0,5*. Nói cách khác, 762 lần bất đồng đó là 762 lần tung một đồng xu công bằng.',
        },
        {
          t: 'steps',
          title: 'Chạy kiểm định bằng tay trên con số thật',
          steps: [
            {
              title: 'Bước 1 — Lấy hai ô lệch tâm',
              md: 'n₀₁ = 412 (A đúng, B sai) và n₁₀ = 350 (A sai, B đúng). Bỏ qua hoàn toàn 48.188 và 1.050. Đây là chỗ người mới hay bối rối: vứt đi 49.238 mẫu nghe như lãng phí, nhưng những mẫu ấy **không chứa thông tin so sánh** — cả hai mô hình xử lý y hệt nhau.',
            },
            {
              title: 'Bước 2 — Tính thống kê kiểm định',
              md: 'Với hiệu chỉnh liên tục của Edwards: χ² = (|n₀₁ − n₁₀| − 1)² / (n₀₁ + n₁₀) = (|412 − 350| − 1)² / 762 = 61² / 762 = 3.721 / 762 ≈ **4,88**.',
            },
            {
              title: 'Bước 3 — Quy ra giá trị p',
              md: 'Tra phân phối chi bình phương với 1 bậc tự do: χ² = 4,88 cho **p ≈ 0,027**. Dưới 0,05, nên ta bác bỏ giả thuyết không: khác biệt giữa A và B **không** giải thích được bằng may rủi.',
            },
            {
              title: 'Bước 4 — Hỏi câu quan trọng hơn: hơn bao nhiêu?',
              md: 'A hơn B đúng 62 tệp trên 50.000, tức **0,124 điểm phần trăm** accuracy. Có ý nghĩa thống kê, và gần như chắc chắn **vô nghĩa về vận hành**. Nếu B rẻ hơn, nhanh hơn, hay dễ giải thích hơn, hãy chọn B. Bước này mới là bước ra quyết định; ba bước trên chỉ để bạn biết con số 62 là thật chứ không phải ảo.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Khi n₀₁ + n₁₀ nhỏ, đừng dùng xấp xỉ chi bình phương',
          md: 'Xấp xỉ chi bình phương chỉ đáng tin khi tổng số mẫu bất đồng đủ lớn — quy tắc ngón tay cái phổ biến là **từ 25 trở lên**. Dưới ngưỡng đó hãy dùng **kiểm định nhị thức chính xác**: dưới giả thuyết không, n₀₁ tuân theo phân phối nhị thức B(n₀₁ + n₁₀, 0,5), và bạn tính trực tiếp xác suất hai phía.\n\nTrường hợp này rất hay gặp trong bảo mật, vì hai phiên bản của cùng một mô hình thường chỉ khác nhau ở dăm chục mẫu. `statsmodels` xử lý giúp bạn: `mcnemar(bang, exact=True)` khi ít mẫu, `exact=False, correction=True` khi nhiều.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'McNemar trên hai bộ dự đoán nhãn cứng',
          code: `import numpy as np
from statsmodels.stats.contingency_tables import mcnemar

# y_that, du_doan_a, du_doan_b: mảng nhãn 0/1 trên CÙNG một tập kiểm thử
a_dung = du_doan_a == y_that
b_dung = du_doan_b == y_that

n01 = int(np.sum(a_dung & ~b_dung))   # A đúng, B sai
n10 = int(np.sum(~a_dung & b_dung))   # A sai, B đúng
bang = [[int(np.sum(a_dung & b_dung)), n01],
        [n10, int(np.sum(~a_dung & ~b_dung))]]

# Ít mẫu bất đồng thì dùng nhị thức chính xác, nhiều thì dùng chi bình phương
it_mau = (n01 + n10) < 25
kq = mcnemar(bang, exact=it_mau, correction=not it_mau)

print(f'Bất đồng: {n01} + {n10} = {n01 + n10}')
print(f'p = {kq.pvalue:.4f}  ({"chính xác" if it_mau else "chi bình phương"})')

# Luôn in kèm ĐỘ LỚN, nếu không bạn sẽ báo cáo một chiến thắng 0,1 điểm phần trăm
# như thể nó là một bước tiến
chenh = (n01 - n10) / len(y_that)
print(f'Chênh lệch accuracy: {chenh * 100:+.3f} điểm phần trăm')`,
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't4l8-cp1',
              kind: 'mcq',
              tags: ['so-sanh-mo-hinh', 'mcnemar'],
              q: 'Hai mô hình cùng đúng ở 9.000 mẫu và cùng sai ở 800 mẫu. A đúng-B sai ở 12 mẫu; A sai-B đúng ở 4 mẫu. Bạn nên làm gì?',
              options: [
                'Chạy McNemar với xấp xỉ chi bình phương, kết luận theo p thu được',
                'Dùng kiểm định nhị thức chính xác, vì chỉ có 16 mẫu bất đồng',
                'Kết luận A tốt hơn vì 12 lớn gấp ba lần 4',
                'Dùng t-test hai mẫu độc lập trên hai vector độ chính xác',
              ],
              answer: 1,
              why: 'Tổng bất đồng là 12 + 4 = **16**, dưới ngưỡng 25 nên xấp xỉ chi bình phương không còn đáng tin. Kiểm định nhị thức chính xác cho p hai phía ≈ 0,077 — **không** đủ để bác bỏ ở mức 0,05, dù tỉ lệ 12 so với 4 trông rất thuyết phục. Đây là bài học cốt lõi: với số nhỏ, tỉ lệ ba-trên-một hoàn toàn nằm trong tầm may rủi.',
              distractorWhy: [
                'Xấp xỉ chi bình phương cần đủ mẫu bất đồng; ở đây chỉ có 16 nên nó sẽ cho giá trị p lạc quan quá mức.',
                '',
                'Đúng là 12 gấp ba lần 4, nhưng với cỡ mẫu 16 thì tỉ lệ đó xuất hiện khá thường xuyên kể cả khi hai mô hình ngang nhau.',
                'Hai vector độ chính xác đo trên cùng các mẫu nên không độc lập; t-test hai mẫu độc lập vi phạm giả định ngay từ đầu.',
              ],
            },
            {
              id: 't4l8-cp2',
              kind: 'truefalse',
              tags: ['so-sanh-mo-hinh', 'nguong'],
              q: 'Kiểm định McNemar so sánh được hai mô hình mà không cần chọn ngưỡng trước.',
              answer: false,
              why: 'McNemar làm việc trên **nhãn cứng** đúng/sai, mà nhãn cứng chỉ tồn tại sau khi bạn đã áp một ngưỡng. Đổi ngưỡng là đổi bảng bất đồng, và có thể đổi cả kết luận. Đây là giới hạn thật sự đáng kể trong bảo mật, nơi ngưỡng được chọn theo công suất đội SOC chứ không cố định ở 0,5. Muốn so sánh không phụ thuộc ngưỡng — PR-AUC, precision@k — bạn cần bootstrap theo cặp ở phần sau của bài.',
            },
          ],
        },
        { t: 'h', text: 'Bootstrap theo cặp: khi chỉ số không phải nhãn cứng', level: 2 },
        {
          t: 'p',
          md: 'McNemar không trả lời được câu hỏi mở đầu bài — “PR-AUC 0,71 so với 0,68 có thật không” — vì PR-AUC là một chỉ số tổng hợp trên mọi ngưỡng, không phải một đếm đúng/sai. Công cụ cho việc này là **bootstrap theo cặp**, và nguyên tắc của nó chỉ gói trong một câu: *lấy mẫu lại một lần, chấm điểm cả hai mô hình trên cùng mẫu đó, rồi ghi lại HIỆU SỐ.*',
        },
        {
          t: 'callout',
          kind: 'math',
          title: 'Vì sao phải ghi hiệu số, không phải hai phân phối riêng',
          md: 'Cách làm sai rất phổ biến: dựng khoảng tin cậy cho PR-AUC của A, dựng khoảng tin cậy cho PR-AUC của B, rồi xem chúng có chồng lấn không.\n\nHai khoảng chồng lấn **không** có nghĩa là khác biệt không đáng kể. Vì hai chỉ số tương quan mạnh với nhau, phân phối của hiệu số hẹp hơn nhiều so với những gì hai khoảng riêng lẻ gợi ý. Bạn có thể gặp trường hợp hai khoảng chồng lấn khá nhiều mà khoảng tin cậy của hiệu số vẫn nằm gọn về một phía của số 0.\n\nQuy tắc: **luôn bootstrap trực tiếp đại lượng bạn muốn kết luận.** Nếu câu hỏi là “A có hơn B không” thì đại lượng đó là hiệu số.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Khoảng tin cậy cho hiệu số PR-AUC bằng bootstrap theo cặp',
          code: `import numpy as np
from sklearn.metrics import average_precision_score

def hieu_so_pr_auc(y, diem_a, diem_b, so_lan=2000, seed=0):
    rng = np.random.default_rng(seed)
    n = len(y)
    hieu = np.empty(so_lan)
    for i in range(so_lan):
        # MỘT bộ chỉ số dùng cho CẢ HAI mô hình — đây chính là chỗ "theo cặp"
        idx = rng.integers(0, n, n)
        # Mẫu lặp lại có thể rơi vào trường hợp không còn mẫu dương nào
        if y[idx].sum() == 0:
            hieu[i] = np.nan
            continue
        hieu[i] = (average_precision_score(y[idx], diem_a[idx])
                   - average_precision_score(y[idx], diem_b[idx]))
    hieu = hieu[~np.isnan(hieu)]
    return hieu.mean(), np.percentile(hieu, [2.5, 97.5])

tb, (thap, cao) = hieu_so_pr_auc(y_test, diem_a, diem_b)
print(f'Hiệu số PR-AUC: {tb:+.4f}, khoảng tin cậy 95%: [{thap:+.4f}, {cao:+.4f}]')

# Đọc kết quả: khoảng CHỨA số 0 nghĩa là dữ liệu hiện có không phân biệt được
# hai mô hình. Đó KHÔNG phải bằng chứng rằng chúng bằng nhau.`,
        },
        {
          t: 'compare',
          title: 'Chọn công cụ theo câu hỏi bạn đang hỏi',
          left: {
            title: 'Kiểm định McNemar',
            icon: 'scale',
            items: [
              'Câu hỏi: ở ngưỡng đang chạy, mô hình nào sai ít hơn?',
              'Đầu vào là nhãn cứng, nên bắt buộc chốt ngưỡng trước',
              'Tính trong một phần nghìn giây, không cần lấy mẫu lại',
              'Cho giá trị p, không cho độ lớn khác biệt — phải tự tính thêm',
              'Dùng khi đang quyết định thay mô hình ở một điểm hoạt động cụ thể',
            ],
          },
          right: {
            title: 'Bootstrap theo cặp',
            icon: 'repeat',
            items: [
              'Câu hỏi: chỉ số tổng hợp hơn kém nhau bao nhiêu, và chắc tới đâu?',
              'Chạy được với mọi chỉ số: PR-AUC, precision@k, tải cảnh báo, chi phí',
              'Tốn tính toán: hai nghìn lần chấm điểm lại toàn tập',
              'Cho thẳng khoảng tin cậy của hiệu số — chính là thứ cần báo cáo',
              'Dùng khi so sánh mô hình trên toàn dải ngưỡng, hoặc khi cần đưa con số cho lãnh đạo',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Ba cách tự đánh lừa mình mà kiểm định không cứu được',
          md: '**1. So nhiều lần rồi chỉ kể lần thắng.** Thử 20 cấu hình siêu tham số rồi kiểm định cái tốt nhất so với mô hình cũ: ở mức 0,05, kỳ vọng có khoảng một lần “có ý nghĩa” thuần tuý do may rủi. Hoặc hiệu chỉnh đa so sánh (Holm là lựa chọn mặc định hợp lý), hoặc chốt trước một ứng viên duy nhất rồi mới mở tập kiểm thử.\n\n**2. Bootstrap trên dữ liệu có trật tự thời gian.** Lấy mẫu lại từng dòng độc lập giả định các dòng hoán vị được cho nhau. Log bảo mật thì không: một chiến dịch tấn công tạo ra hàng nghìn dòng gần như trùng nhau trong vài giờ. Bootstrap theo dòng sẽ cho khoảng tin cậy **hẹp giả tạo**. Hãy lấy mẫu lại theo **khối thời gian** hoặc theo chiến dịch, hoặc đơn giản là đánh giá trên vài cửa sổ thời gian tách rời rồi xem kết luận có ổn định không.\n\n**3. Dùng lại tập kiểm thử tới lần thứ mười.** Mỗi lần bạn nhìn tập kiểm thử rồi sửa mô hình, bạn rò rỉ thêm một chút thông tin của nó vào lựa chọn thiết kế. Sau vài chục vòng, tập kiểm thử đã âm thầm biến thành tập kiểm định. Giữ một tập niêm phong mà bạn chỉ mở đúng một lần, ngay trước khi triển khai.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Câu nên nói trong buổi duyệt mô hình',
          md: 'Thay vì *“mô hình mới đạt PR-AUC 0,71 so với 0,68”*, hãy nói:\n\n*“Trên tập niêm phong ba tháng gần nhất, mô hình mới hơn mô hình đang chạy 0,03 PR-AUC, khoảng tin cậy 95% của hiệu số là [0,011; 0,048] — không chứa số 0, nên khác biệt là thật. Quy ra vận hành ở ngưỡng đang dùng: cùng 195 cảnh báo mỗi ngày, nó bắt thêm khoảng 4 vụ thật và bỏ sót ít hơn 2 vụ. Chi phí là độ trễ suy luận tăng từ 8 lên 31 mili giây.”*\n\nCâu thứ hai dài hơn, và nó là câu duy nhất trong hai câu cho phép người nghe ra quyết định.',
        },
        {
          t: 'checklist',
          title: 'Trước khi tuyên bố mô hình mới thắng',
          items: [
            'Hai mô hình đã được chấm trên đúng cùng một tập kiểm thử, cùng một tiền xử lý',
            'Tập kiểm thử ở giai đoạn sau tập huấn luyện về mặt thời gian, và chưa từng dùng để chọn tham số',
            'Phép so sánh là phép kiểm theo cặp, không phải hai phép kiểm độc lập',
            'Đã báo cáo khoảng tin cậy của HIỆU SỐ, không phải hai khoảng riêng lẻ',
            'Đã hiệu chỉnh đa so sánh nếu có nhiều hơn một ứng viên được đem ra kiểm',
            'Đã quy khác biệt về đơn vị vận hành: cảnh báo mỗi ngày, vụ bắt thêm, vụ bỏ sót',
            'Đã ghi rõ chi phí kèm theo: độ trễ, bộ nhớ, độ phức tạp vận hành, khả năng giải thích',
          ],
        },
      ],
      keyTakeaways: [
        'Hai mô hình đo trên cùng một tập kiểm thử có sai số tương quan; mọi so sánh phải là phép kiểm theo cặp, nếu không bạn đang lãng phí phần lớn độ mạnh thống kê',
        'McNemar chỉ dùng hai ô bất đồng — các mẫu mà cả hai cùng đúng hoặc cùng sai không mang thông tin so sánh nào',
        'Dưới 25 mẫu bất đồng thì dùng kiểm định nhị thức chính xác, đừng dùng xấp xỉ chi bình phương',
        'Với chỉ số không phải nhãn cứng, bootstrap trực tiếp HIỆU SỐ; so hai khoảng tin cậy riêng lẻ có chồng lấn hay không là cách đọc sai',
        'Có ý nghĩa thống kê không đồng nghĩa với đáng thay: luôn quy khác biệt về cảnh báo mỗi ngày và vụ bỏ sót trước khi quyết định',
      ],
      cards: [
        {
          id: 't4l8-c1',
          front: 'Kiểm định McNemar dùng những ô nào của bảng bất đồng, và bỏ qua ô nào?',
          back: 'Chỉ dùng hai ô lệch tâm: A đúng-B sai và A sai-B đúng. Bỏ hoàn toàn hai ô đường chéo (cùng đúng, cùng sai) vì chúng không phân biệt được hai mô hình.',
          tags: ['so-sanh-mo-hinh', 'mcnemar'],
        },
        {
          id: 't4l8-c2',
          front: 'Giả thuyết không của kiểm định McNemar phát biểu chính xác là gì?',
          back: 'Trong các mẫu mà hai mô hình bất đồng, xác suất mô hình A đúng bằng 0,5 — tức mỗi lần bất đồng là một lần tung đồng xu công bằng.',
          tags: ['so-sanh-mo-hinh', 'mcnemar'],
        },
        {
          id: 't4l8-c3',
          front: 'Khi tổng số mẫu bất đồng dưới 25 thì dùng phép kiểm nào?',
          back: 'Kiểm định nhị thức chính xác với B(n₀₁ + n₁₀, 0,5). Xấp xỉ chi bình phương cho giá trị p lạc quan quá mức khi ít mẫu.',
          tags: ['so-sanh-mo-hinh', 'mcnemar'],
        },
        {
          id: 't4l8-c4',
          front: 'Vì sao không được kết luận bằng cách xem hai khoảng tin cậy riêng lẻ có chồng lấn không?',
          back: 'Hai chỉ số tương quan mạnh nên phân phối của hiệu số hẹp hơn nhiều so với hai khoảng riêng gợi ý. Phải bootstrap trực tiếp hiệu số.',
          tags: ['so-sanh-mo-hinh', 'bootstrap'],
        },
        {
          id: 't4l8-c5',
          front: 'Vì sao bootstrap theo dòng lại nguy hiểm với log bảo mật?',
          back: 'Một chiến dịch tấn công sinh ra hàng nghìn dòng gần trùng nhau, nên các dòng không hoán vị được cho nhau. Bootstrap theo dòng cho khoảng tin cậy hẹp giả tạo; phải lấy mẫu theo khối thời gian hoặc theo chiến dịch.',
          tags: ['bootstrap', 'chia-theo-thoi-gian'],
        },
      ],
      quiz: [
        {
          id: 't4-l8-q1',
          kind: 'mcq',
          tags: ['so-sanh-mo-hinh', 'mcnemar'],
          q: 'Vì sao McNemar bỏ qua các mẫu mà cả hai mô hình cùng đúng?',
          options: [
            'Vì chúng thường là các mẫu dễ, không đại diện cho dữ liệu thật',
            'Vì chúng không chứa thông tin phân biệt hai mô hình — cả hai xử lý y hệt nhau',
            'Vì giữ chúng lại sẽ làm giá trị p nhỏ đi một cách sai lệch',
            'Vì chúng làm bảng bất đồng mất tính đối xứng',
          ],
          answer: 1,
          why: 'Câu hỏi cần trả lời là “mô hình nào tốt hơn”. Một mẫu mà cả hai cùng đúng không đóng góp bằng chứng nào cho câu hỏi đó, y như một mẫu mà cả hai cùng sai. Toàn bộ bằng chứng nằm ở chỗ hai mô hình đi khác đường. Đây cũng là nguồn sức mạnh của phép kiểm theo cặp: nó tập trung vào đúng phần dữ liệu có tin.',
          distractorWhy: [
            'Độ dễ của mẫu không liên quan; kể cả một mẫu cực khó mà cả hai cùng đúng vẫn không phân biệt được hai mô hình.',
            '',
            'Ngược lại: đưa thêm các mẫu đồng thuận vào sẽ làm loãng tín hiệu và khiến phép kiểm yếu đi, chứ không làm p nhỏ đi.',
            'Bảng vẫn đối xứng hay không là chuyện khác; lý do bỏ là chúng không mang thông tin so sánh.',
          ],
        },
        {
          id: 't4-l8-q2',
          kind: 'mcq',
          tags: ['so-sanh-mo-hinh', 'bootstrap'],
          q: 'Trong bootstrap theo cặp, điều gì bắt buộc phải giống nhau giữa hai mô hình ở mỗi vòng lặp?',
          options: [
            'Số lượng mẫu dương trong mẫu lấy lại',
            'Bộ chỉ số được lấy mẫu lại — cả hai mô hình chấm trên đúng cùng các mẫu đó',
            'Ngưỡng quyết định áp cho cả hai mô hình',
            'Hạt giống ngẫu nhiên dùng khi huấn luyện hai mô hình',
          ],
          answer: 1,
          why: 'Chữ “theo cặp” nằm ở chỗ này: mỗi vòng lặp sinh **một** bộ chỉ số, rồi cả hai mô hình được chấm trên chính bộ đó. Nhờ vậy biến thiên do việc bốc trúng mẫu nào bị khử khỏi hiệu số. Nếu mỗi mô hình được lấy mẫu lại riêng, bạn đánh mất toàn bộ lợi ích và quay về tình huống hai mẫu độc lập.',
          distractorWhy: [
            'Số mẫu dương thay đổi giữa các vòng là bình thường; chỉ cần loại các vòng không còn mẫu dương nào.',
            '',
            'Bootstrap theo cặp dùng được với chỉ số không cần ngưỡng như PR-AUC, nên đây không phải điều kiện bắt buộc.',
            'Hạt giống huấn luyện thuộc về giai đoạn tạo mô hình, không liên quan tới thủ tục lấy mẫu lại khi đánh giá.',
          ],
        },
        {
          id: 't4-l8-q3',
          kind: 'truefalse',
          tags: ['so-sanh-mo-hinh'],
          q: 'Khoảng tin cậy 95% của hiệu số PR-AUC là [−0,004; 0,021], vậy hai mô hình tương đương nhau.',
          answer: false,
          why: 'Khoảng chứa số 0 chỉ có nghĩa là **dữ liệu hiện có không đủ để phân biệt** hai mô hình, chứ không phải bằng chứng rằng chúng bằng nhau. Khoảng này còn nghiêng hẳn về phía dương và cho phép khác biệt tới 0,021 — một mức có thể rất đáng kể. Muốn khẳng định tương đương thì phải đặt trước một ngưỡng tương đương và kiểm tra cả khoảng nằm gọn trong ngưỡng đó. Không bác bỏ được giả thuyết không không bao giờ đồng nghĩa với chấp nhận nó.',
        },
        {
          id: 't4-l8-q4',
          kind: 'mcq',
          tags: ['so-sanh-mo-hinh', 'chia-theo-thoi-gian'],
          q: 'Bạn so sánh hai mô hình trên 90 ngày log, trong đó có một chiến dịch tấn công lớn kéo dài 3 ngày sinh ra 40% số mẫu dương. Bootstrap theo từng dòng sẽ gây ra vấn đề gì?',
          options: [
            'Khoảng tin cậy quá rộng nên không kết luận được gì',
            'Khoảng tin cậy hẹp giả tạo, vì các dòng trong cùng chiến dịch gần trùng nhau nên không độc lập',
            'Chỉ số PR-AUC bị lệch xuống do lấy mẫu có hoàn lại',
            'Không có vấn đề gì, miễn là số vòng lặp đủ lớn',
          ],
          answer: 1,
          why: 'Bootstrap giả định các đơn vị lấy mẫu độc lập và hoán vị được. Bốn mươi phần trăm mẫu dương đến từ một chiến dịch duy nhất nghĩa là chúng gần như bản sao của nhau — cỡ mẫu **hiệu dụng** nhỏ hơn nhiều so với số dòng. Lấy mẫu theo dòng sẽ báo một độ chắc chắn mà dữ liệu không có. Cách xử lý: lấy mẫu lại theo khối thời gian hoặc theo định danh chiến dịch, để một chiến dịch vào hay ra khỏi mẫu **trọn gói**.',
          distractorWhy: [
            'Ngược lại — vấn đề là khoảng hẹp quá mức chứ không rộng quá mức.',
            '',
            'Lấy mẫu có hoàn lại không tạo ra thiên lệch hệ thống theo hướng đó; vấn đề nằm ở giả định độc lập.',
            'Tăng số vòng lặp chỉ làm ước lượng phân phía sai đó chính xác hơn, chứ không sửa được giả định bị vi phạm.',
          ],
        },
        {
          id: 't4-l8-q5',
          kind: 'mcq',
          tags: ['so-sanh-mo-hinh', 'chi-phi'],
          q: 'Kiểm định cho p = 0,003 và mô hình mới hơn mô hình cũ 0,15 điểm phần trăm recall, nhưng độ trễ suy luận tăng từ 8 lên 240 mili giây. Kết luận hợp lý nhất?',
          options: [
            'Thay ngay, vì p = 0,003 là bằng chứng rất mạnh',
            'Khác biệt là thật nhưng quá nhỏ so với cái giá phải trả; giữ mô hình cũ và ghi lại lý do',
            'Chạy lại kiểm định với tập kiểm thử lớn hơn để chắc chắn',
            'Thay mô hình nhưng chỉ áp dụng cho một nửa lưu lượng',
          ],
          answer: 1,
          why: 'Giá trị p trả lời câu hỏi “khác biệt này có thật không”, chứ không trả lời “khác biệt này có đáng không”. Ở đây câu trả lời lần lượt là *có* và *không*: 0,15 điểm phần trăm recall gần như không đổi gì trong vận hành, còn độ trễ gấp 30 lần là một thay đổi kiến trúc thật sự. Với cỡ mẫu đủ lớn, mọi khác biệt khác 0 đều sẽ đạt ý nghĩa thống kê — đó là lý do độ lớn và chi phí mới là thứ ra quyết định.',
          distractorWhy: [
            'p nhỏ chỉ nói khác biệt không do may rủi; nó không nói khác biệt đủ lớn để đáng đánh đổi.',
            '',
            'Tập lớn hơn chỉ làm p nhỏ hơn nữa mà không thay đổi độ lớn 0,15 điểm phần trăm.',
            'Chia lưu lượng là cách kiểm chứng trong sản xuất, nhưng nó không giải quyết việc lợi ích quá nhỏ so với chi phí.',
          ],
        },
      ],
      further: [
        {
          title: 'Approximate Statistical Tests for Comparing Supervised Classification Learning Algorithms — Dietterich (1998)',
          note: 'Bài báo kinh điển so sánh năm phép kiểm và chỉ ra cái nào có tỉ lệ dương giả cao. Phần về McNemar và 5×2 cross-validation vẫn là tài liệu tham chiếu chuẩn.',
        },
        {
          title: 'statsmodels — contingency_tables.mcnemar',
          note: 'Đọc kỹ hai tham số exact và correction. Chọn sai cặp này là cách phổ biến nhất để có một giá trị p không đáng tin.',
        },
        {
          title: 'An Introduction to the Bootstrap — Efron và Tibshirani',
          note: 'Chương về bootstrap theo cặp và bootstrap cho dữ liệu phụ thuộc. Đọc phần dữ liệu phụ thuộc trước khi áp bootstrap lên log bảo mật.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't4-l9',
      trackId: 'do-luong',
      title: 'Định lượng bất định và conformal prediction',
      subtitle: 'Cho mô hình quyền nói “tôi không chắc” — kèm một bảo đảm bằng con số',
      minutes: 22,
      practiceMinutes: 3,
      level: 'chuyen-gia',
      prereqs: ['t4-l6'],
      why: {
        short:
          'Mọi bộ phân loại đều bị ép trả về một nhãn kể cả khi bằng chứng gần như bằng không; conformal prediction thay nhãn đơn bằng một TẬP nhãn có bảo đảm phủ đúng theo tỉ lệ bạn đặt trước.',
        scenario:
          'Bạn tự động đóng cảnh báo có điểm dưới 0,2 để giảm tải cho analyst. Sếp hỏi: “ta đang bỏ sót bao nhiêu phần trăm vụ thật vì cái luật đó?” Với ngưỡng trần trụi, bạn không trả lời được. Với conformal, con số đó là thứ bạn **đặt ra trước** rồi hệ thống tôn trọng nó.',
        roles: ['Security Data Scientist', 'ML Engineer', 'Detection Engineer', 'SOC Analyst'],
        costOfNotKnowing:
          'Bạn tự động hoá phân loại cảnh báo bằng một ngưỡng cố định, không có cách nào phân biệt “mô hình khá chắc đây là lành” với “mô hình chưa từng thấy thứ gì giống thế này” — và chính nhóm thứ hai là nơi các vụ tấn công mới ẩn nấp.',
      },
      objectives: [
        'Phân biệt hiệu chuẩn xác suất với bảo đảm phủ của conformal prediction, và nói được cái nào trả lời câu hỏi nào',
        'Dựng bộ dự đoán conformal chia đôi (split conformal) từ một mô hình đã huấn luyện và một tập hiệu chuẩn',
        'Đọc ý nghĩa vận hành của bốn loại tập dự đoán trong bài toán nhị phân, kể cả tập rỗng',
        'Nêu được hai giới hạn phá hỏng bảo đảm trong bảo mật: bảo đảm chỉ ở mức biên, và giả định hoán vị được bị trôi dữ liệu làm hỏng',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Mô hình chấm một tệp là 0,55 khả năng độc hại, và bạn biết mô hình đã được hiệu chuẩn tốt nên con số 0,55 là trung thực. Nhưng hai tệp rất khác nhau vẫn có thể cùng nhận 0,55: một tệp nằm ngay ranh giới giữa hai vùng đông đúc, và một tệp nằm ở vùng mô hình gần như chưa thấy mẫu nào. Hiệu chuẩn có phân biệt được hai trường hợp đó không?',
          reveal:
            '**Không.** Và đây chính là khoảng trống mà bài này lấp.\n\nHiệu chuẩn là một lời hứa **theo lô**: trong tất cả các mẫu được chấm 0,55, khoảng 55% thật sự độc hại. Lời hứa đó hoàn toàn đúng, và nó vẫn không nói gì về **một** tệp cụ thể đang nằm trên bàn bạn.\n\nHai tệp trong câu hỏi khác nhau về thứ gọi là bất định do thiếu hiểu biết: tệp thứ nhất khó vì bản chất nó nằm ở ranh giới; tệp thứ hai khó vì mô hình chưa từng học vùng đó. Với tệp thứ hai, con số 0,55 không phải một ước lượng — nó là một phép ngoại suy.\n\nConformal prediction đổi câu hỏi. Thay vì hỏi “xác suất là bao nhiêu”, nó hỏi: *“trả về tập nhãn nhỏ nhất sao cho về lâu dài, nhãn đúng nằm trong tập đó ít nhất 90% số lần.”* Với tệp ranh giới, tập ấy có thể là {lành, độc} — mô hình được phép nói không chắc. Và tỉ lệ 90% là con số **bạn đặt**, không phải con số bạn hy vọng.',
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'Bảo đảm mạnh tới mức nghe như không thật — và ba chữ nhỏ đi kèm',
          md: 'Với mức lỗi α bạn chọn, bộ dự đoán conformal bảo đảm:\n\n> P(nhãn đúng ∈ tập dự đoán) ≥ 1 − α\n\nBảo đảm này **không cần giả định gì về mô hình**. Mô hình có thể là rừng ngẫu nhiên, mạng nơ-ron, hay một hàm trả số ngẫu nhiên — bảo đảm vẫn đúng. Nó cũng không cần cỡ mẫu lớn tới vô hạn: đúng với cỡ mẫu hữu hạn.\n\nĐổi lại, có ba chữ nhỏ mà bỏ qua là hiểu sai hoàn toàn:\n\n**1. Dữ liệu phải hoán vị được (exchangeable).** Đây là giả định duy nhất, và nó là giả định lớn trong bảo mật.\n\n**2. Bảo đảm ở mức BIÊN, không theo điều kiện.** Phủ 90% tính trung bình trên toàn bộ phân phối, không phải 90% cho mỗi lớp hay mỗi nhóm mẫu.\n\n**3. Mô hình tồi vẫn giữ đúng bảo đảm — bằng cách trả về tập vô dụng.** Nếu mô hình không phân biệt được gì, conformal sẽ trung thực trả về {lành, độc} cho 90% số mẫu. Bảo đảm không bị vi phạm; nó chỉ cho bạn thấy mô hình chẳng biết gì. **Kích thước tập** mới là thước đo chất lượng mô hình.',
        },
        { t: 'h', text: 'Split conformal: ba bước, không cần huấn luyện lại', level: 2 },
        {
          t: 'steps',
          title: 'Dựng bộ dự đoán conformal trên một mô hình đã có',
          steps: [
            {
              title: 'Bước 1 — Tách một tập hiệu chuẩn chưa từng dùng',
              md: 'Giống hệt yêu cầu ở bài t4-l6: tập này phải **riêng biệt** với tập huấn luyện. Trong bảo mật, hãy lấy nó ở giai đoạn **sau** về thời gian. Cỡ vài nghìn mẫu là đủ; điều quan trọng hơn cỡ là nó phải giống dữ liệu bạn sẽ gặp khi chạy thật.',
            },
            {
              title: 'Bước 2 — Chấm điểm bất tuân trên tập hiệu chuẩn',
              md: 'Điểm bất tuân (nonconformity score) đo mức độ mẫu này “trái” với nhãn thật của nó. Lựa chọn đơn giản và hiệu quả cho bài toán phân loại: s = 1 − p̂(nhãn thật | x). Mẫu nào mô hình gán xác suất thấp cho nhãn đúng thì điểm bất tuân cao.',
            },
            {
              title: 'Bước 3 — Lấy phân vị đã hiệu chỉnh',
              md: 'Với n mẫu hiệu chuẩn và mức lỗi α, lấy q̂ là phân vị thứ **⌈(n+1)(1−α)⌉ / n** của các điểm bất tuân. Chú ý cái +1 và phép làm tròn lên: chúng là lý do bảo đảm đúng với cỡ mẫu hữu hạn thay vì chỉ đúng xấp xỉ. Ví dụ n = 2.000 và α = 0,1: ⌈2.001 × 0,9⌉ = 1.801, tức lấy giá trị lớn thứ 1.801 trong 2.000 điểm.',
            },
            {
              title: 'Bước 4 — Dựng tập cho mẫu mới',
              md: 'Với mẫu mới x, đưa vào tập mọi nhãn y thoả 1 − p̂(y | x) ≤ q̂. Chỉ vậy thôi. Không huấn luyện lại, không sửa mô hình, chi phí thêm là một phép so sánh.',
            },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Split conformal cho phân loại nhị phân, khoảng 15 dòng',
          code: `import numpy as np

# p_cal: xác suất lớp ĐỘC HẠI mà mô hình gán cho từng mẫu hiệu chuẩn
# y_cal:  nhãn thật 0/1 của tập hiệu chuẩn — tập này chưa từng dùng để huấn luyện
alpha = 0.10                       # ta chấp nhận bỏ sót nhãn đúng 10% số lần

# Điểm bất tuân: 1 trừ xác suất mô hình gán cho NHÃN THẬT
p_nhan_that = np.where(y_cal == 1, p_cal, 1 - p_cal)
diem_bat_tuan = 1 - p_nhan_that

n = len(diem_bat_tuan)
# Cái +1 và làm tròn LÊN là thứ tạo ra bảo đảm với cỡ mẫu hữu hạn — đừng bỏ
k = int(np.ceil((n + 1) * (1 - alpha)))
q = np.sort(diem_bat_tuan)[min(k, n) - 1]

def tap_du_doan(p_doc):
    """Trả về tập nhãn cho một mẫu mới. Có thể rỗng, một phần tử, hoặc cả hai."""
    tap = []
    if 1 - (1 - p_doc) <= q: tap.append(0)   # nhãn 'lành' đủ tuân thủ
    if 1 - p_doc <= q:       tap.append(1)   # nhãn 'độc'  đủ tuân thủ
    return tap

# Kiểm chứng trên tập kiểm thử: phủ phải xấp xỉ 1 - alpha
tap_test = [tap_du_doan(p) for p in p_test]
phu = np.mean([y in t for y, t in zip(y_test, tap_test)])
co_don = np.mean([len(t) == 1 for t in tap_test])
print(f'Phủ thực tế: {phu:.3f} (đặt trước: {1 - alpha:.2f})')
print(f'Tỉ lệ tập một nhãn — phần tự động hoá được: {co_don:.3f}')`,
        },
        { t: 'h', text: 'Bốn loại tập, bốn hành động vận hành khác nhau', level: 2 },
        {
          t: 'table',
          caption: 'Trong bài toán nhị phân, tập dự đoán chỉ có bốn dạng — và mỗi dạng nên đi vào một hàng đợi khác nhau.',
          head: ['Tập dự đoán', 'Nghĩa là gì', 'Nên làm gì'],
          rows: [
            ['{lành}', 'Chỉ nhãn lành đủ tuân thủ. Bằng chứng đủ mạnh về một phía.', 'Tự động đóng, ghi log để lấy mẫu kiểm tra định kỳ'],
            ['{độc}', 'Chỉ nhãn độc đủ tuân thủ.', 'Đưa lên đầu hàng đợi, hoặc chặn tự động nếu chính sách cho phép'],
            ['{lành, độc}', 'Cả hai nhãn đều nằm trong mức bất tuân cho phép — mô hình thật sự không phân biệt được.', 'Chuyển cho người xem. Đây chính là chỗ đáng trả tiền cho analyst.'],
            ['∅ (rỗng)', 'KHÔNG nhãn nào đủ tuân thủ: mẫu này bất thường so với mọi thứ trong tập hiệu chuẩn.', 'Cờ đỏ. Ứng viên cho họ mã độc mới, hoặc dấu hiệu dữ liệu đã trôi.'],
          ],
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Tập rỗng là món quà, đừng vứt nó đi',
          md: 'Rất nhiều bản cài đặt xử lý tập rỗng bằng cách gán bừa nhãn có xác suất cao nhất. Làm vậy là ném đi tín hiệu giá trị nhất mà conformal tạo ra.\n\nTập rỗng nghĩa là mẫu này bất tuân với **cả hai** nhãn hơn 90% dữ liệu hiệu chuẩn. Trong bảo mật, đó thường là một trong hai chuyện, và cả hai đều đáng biết: một họ mã độc chưa từng gặp, hoặc phân bố dữ liệu đã dịch chuyển tới mức mô hình không còn áp dụng được.\n\nMột chỉ số vận hành đơn giản và rất đáng gắn bảng theo dõi: **tỉ lệ tập rỗng theo ngày**. Nó tăng vọt trước khi các chỉ số hiệu năng kịp xấu đi, vì nó không cần chờ nhãn thật. Bài t10-l2 nói kỹ hơn về việc phát hiện trôi mà không có nhãn.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't4l9-cp1',
              kind: 'mcq',
              tags: ['conformal', 'bat-dinh'],
              q: 'Bạn đặt α = 0,1 và đo trên tập kiểm thử thấy phủ đúng 0,90, nhưng 96% số mẫu nhận tập {lành, độc}. Kết luận?',
              options: [
                'Bộ dự đoán conformal bị lỗi cài đặt, vì phủ đúng thì tập phải nhỏ',
                'Bảo đảm vẫn đúng; kích thước tập cho thấy mô hình nền gần như không phân biệt được gì',
                'Cần giảm α xuống 0,05 để tập nhỏ lại',
                'Tập hiệu chuẩn quá nhỏ nên phân vị bị lệch',
              ],
              answer: 1,
              why: 'Phủ và độ hữu ích là hai chuyện tách rời. Conformal **luôn** giữ được phủ, kể cả trên một mô hình vô dụng — nó chỉ trả về tập to. Trả lại 96% tập hai nhãn nghĩa là ở mức chắc chắn 90%, mô hình hầu như không loại được nhãn nào. Việc cần làm là sửa **mô hình nền** — thêm đặc trưng, thêm dữ liệu — chứ không phải chỉnh thủ tục conformal.',
              distractorWhy: [
                'Không có lỗi nào: giữ đúng phủ trên một mô hình yếu chính là hành vi được thiết kế.',
                '',
                'Giảm α làm tập **to hơn** chứ không nhỏ đi, vì bạn đòi mức chắc chắn cao hơn.',
                'Tập hiệu chuẩn nhỏ gây dao động quanh mức phủ, nhưng ở đây phủ đúng bằng 0,90 nên đó không phải vấn đề.',
              ],
            },
            {
              id: 't4l9-cp2',
              kind: 'mcq',
              tags: ['conformal', 'mat-can-bang'],
              q: 'Dữ liệu có 99,5% lành. Bộ conformal đạt phủ biên 90%. Điều gì có thể đang xảy ra với riêng lớp độc hại?',
              options: [
                'Lớp độc cũng được phủ khoảng 90%, vì bảo đảm áp dụng cho mọi lớp',
                'Lớp độc có thể chỉ được phủ 40% hoặc thấp hơn, vì phủ biên bị lớp đa số chi phối',
                'Lớp độc được phủ cao hơn 90% do nó hiếm',
                'Không xác định được nếu chưa biết mô hình dùng thuật toán gì',
              ],
              answer: 1,
              why: 'Phủ biên là **trung bình có trọng số** theo tần suất lớp. Với 99,5% mẫu là lành, chỉ cần phủ tốt lớp lành là con số tổng đã gần 90% rồi, còn lớp độc muốn thế nào cũng được. Đây là cái bẫy nguy hiểm nhất của conformal trong bảo mật, vì lớp bạn quan tâm luôn là lớp hiếm. Cách chữa: **conformal theo lớp** (Mondrian) — tính phân vị riêng cho từng lớp, đổi lại cần đủ mẫu hiệu chuẩn ở lớp hiếm.',
              distractorWhy: [
                'Bảo đảm mặc định là ở mức biên; phủ theo từng lớp phải yêu cầu riêng bằng biến thể Mondrian.',
                '',
                'Độ hiếm không tự tạo ra phủ cao; nếu có thì thường ngược lại.',
                'Kết luận này không phụ thuộc thuật toán — nó là hệ quả của định nghĩa phủ biên.',
              ],
            },
          ],
        },
        {
          t: 'compare',
          title: 'Hiệu chuẩn và conformal trả lời hai câu hỏi khác nhau',
          left: {
            title: 'Hiệu chuẩn (bài t4-l6)',
            icon: 'sliders',
            items: [
              'Câu hỏi: con số 0,87 có đúng nghĩa 87% không?',
              'Cho một số duy nhất cho mỗi mẫu',
              'Đúng theo nghĩa trung bình trên lô, không bảo đảm gì cho một mẫu cụ thể',
              'Cần mô hình đủ tốt thì con số mới hữu ích',
              'Đầu vào cho mọi phép tính chi phí kỳ vọng',
            ],
          },
          right: {
            title: 'Conformal prediction',
            icon: 'shield',
            items: [
              'Câu hỏi: cho tôi tập nhãn chứa nhãn đúng ít nhất 90% số lần',
              'Cho một tập nhãn, có thể rỗng hoặc chứa cả hai',
              'Bảo đảm phủ đúng với cỡ mẫu hữu hạn, không cần giả định về mô hình',
              'Đúng kể cả với mô hình tồi — khi đó tập to ra',
              'Đầu vào cho quyết định tự động hoá: cái nào đóng máy, cái nào cần người',
            ],
          },
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Giả định hoán vị được, và vì sao bảo mật là nơi nó dễ gãy nhất',
          md: 'Conformal cần dữ liệu hiệu chuẩn và dữ liệu mới **hoán vị được** — nôm na là chúng đến từ cùng một phân phối. Đúng ba tình huống rất thường gặp trong bảo mật phá vỡ điều đó:\n\n**Trôi theo thời gian.** Họ mã độc tháng này khác tháng trước. Tập hiệu chuẩn của quý trước không còn hoán vị được với lưu lượng hôm nay, và phủ thực tế tụt xuống dưới mức bạn đặt — âm thầm, vì không có gì báo.\n\n**Đối thủ chủ động.** Kẻ tấn công cố ý tạo mẫu ở vùng mô hình yếu. Đó là dịch chuyển phân phối **có chủ đích**, tình huống xấu nhất cho mọi bảo đảm dựa trên giả định phân phối.\n\n**Dữ liệu theo cụm.** Một chiến dịch sinh hàng nghìn mẫu gần trùng nhau; chúng không hoán vị được với các mẫu độc lập, đúng như vấn đề bootstrap ở bài t4-l8.\n\nCách sống chung, không phải cách chữa dứt: hiệu chuẩn lại theo **cửa sổ trượt** thay vì một lần rồi thôi, theo dõi phủ thực tế trên phần dữ liệu có nhãn muộn, và coi tỉ lệ tập rỗng như cảm biến báo trôi. Có một nhánh nghiên cứu về conformal dưới dịch chuyển phân phối, nhưng nó đòi hỏi biết được dạng dịch chuyển — điều mà ta hiếm khi biết.',
        },
        {
          t: 'checklist',
          title: 'Đưa conformal vào một quy trình phân loại cảnh báo',
          items: [
            'Chọn α theo mức bỏ sót mà tổ chức chấp nhận được, và ghi con số đó vào tài liệu vận hành',
            'Tập hiệu chuẩn ở giai đoạn sau tập huấn luyện về thời gian, chưa từng dùng để chọn tham số',
            'Dùng conformal theo lớp nếu lớp dương hiếm — phủ biên gần như luôn nói dối về lớp hiếm',
            'Định tuyến bốn loại tập vào bốn luồng khác nhau, đừng gộp tập rỗng vào tập một nhãn',
            'Gắn bảng theo dõi hai chỉ số: phủ thực tế theo tuần và tỉ lệ tập rỗng theo ngày',
            'Đặt lịch hiệu chuẩn lại theo cửa sổ trượt, và coi giả định hoán vị được là thứ sẽ hỏng chứ không phải có thể hỏng',
          ],
        },
      ],
      keyTakeaways: [
        'Conformal prediction đổi nhãn đơn thành TẬP nhãn kèm bảo đảm phủ ≥ 1 − α, đúng với cỡ mẫu hữu hạn và không cần giả định gì về mô hình',
        'Giả định duy nhất là dữ liệu hoán vị được — và đó chính là giả định mà trôi dữ liệu, đối thủ chủ động và dữ liệu theo cụm phá vỡ',
        'Bảo đảm luôn được giữ; chất lượng mô hình thể hiện ở KÍCH THƯỚC tập, không ở mức phủ',
        'Phủ biên bị lớp đa số chi phối, nên với dữ liệu bảo mật mất cân bằng phải dùng conformal theo lớp',
        'Tập rỗng là tín hiệu cảnh báo sớm về mẫu lạ hoặc dữ liệu đã trôi — định tuyến riêng, đừng gán bừa nhãn',
      ],
      cards: [
        {
          id: 't4l9-c1',
          front: 'Conformal prediction bảo đảm điều gì, và với giả định nào?',
          back: 'Bảo đảm nhãn đúng nằm trong tập dự đoán với xác suất ít nhất 1 − α, đúng với cỡ mẫu hữu hạn và mọi mô hình. Giả định duy nhất: dữ liệu hiệu chuẩn và dữ liệu mới hoán vị được.',
          tags: ['conformal', 'bat-dinh'],
        },
        {
          id: 't4l9-c2',
          front: 'Nếu mô hình nền rất tồi, conformal sẽ hỏng theo cách nào?',
          back: 'Không hỏng về bảo đảm — phủ vẫn đạt. Nó hỏng về độ hữu ích: trả về tập chứa cả hai nhãn cho hầu hết mẫu. Kích thước tập mới là thước đo chất lượng mô hình.',
          tags: ['conformal'],
        },
        {
          id: 't4l9-c3',
          front: 'Vì sao phủ biên 90% có thể là con số nguy hiểm trong bảo mật?',
          back: 'Phủ biên là trung bình theo tần suất lớp. Với 99,5% mẫu lành, phủ tổng 90% vẫn cho phép lớp độc hiếm chỉ được phủ 40%. Cần conformal theo lớp (Mondrian).',
          tags: ['conformal', 'mat-can-bang'],
        },
        {
          id: 't4l9-c4',
          front: 'Tập dự đoán rỗng nghĩa là gì và nên xử lý ra sao?',
          back: 'Không nhãn nào đủ tuân thủ: mẫu bất thường so với toàn bộ tập hiệu chuẩn. Định tuyến riêng như cờ đỏ — ứng viên họ mã độc mới hoặc dấu hiệu trôi dữ liệu. Đừng gán bừa nhãn xác suất cao nhất.',
          tags: ['conformal', 'troi-du-lieu'],
        },
        {
          id: 't4l9-c5',
          front: 'Trong split conformal, vì sao công thức phân vị có cái +1 và làm tròn lên?',
          back: 'Lấy phân vị thứ ⌈(n+1)(1−α)⌉/n thay vì (1−α) đơn thuần chính là chỗ tạo ra bảo đảm đúng với cỡ mẫu hữu hạn, thay vì chỉ đúng xấp xỉ khi n lớn.',
          tags: ['conformal'],
        },
      ],
      quiz: [
        {
          id: 't4-l9-q1',
          kind: 'mcq',
          tags: ['conformal', 'hieu-chuan'],
          q: 'Khác biệt cốt lõi giữa hiệu chuẩn xác suất và conformal prediction là gì?',
          options: [
            'Hiệu chuẩn cần tập riêng còn conformal thì không',
            'Hiệu chuẩn làm con số xác suất trung thực theo lô; conformal cho tập nhãn kèm bảo đảm phủ áp dụng được cho từng dự đoán',
            'Conformal chỉ dùng được cho bài toán hồi quy',
            'Hiệu chuẩn đúng với mọi mô hình, còn conformal đòi mô hình phải đủ tốt',
          ],
          answer: 1,
          why: 'Hiệu chuẩn trả lời “con số này có đúng nghĩa không”, và lời hứa của nó là lời hứa trung bình trên lô. Conformal trả lời “tập nào chứa nhãn đúng với mức chắc chắn tôi đặt ra”, và bảo đảm đó gắn với thủ tục nên áp dụng được cho từng dự đoán. Hai thứ bổ sung nhau: hiệu chuẩn cho phép tính chi phí kỳ vọng, conformal cho phép quyết định cái nào tự động đóng và cái nào cần người.',
          distractorWhy: [
            'Cả hai đều cần một tập riêng chưa dùng để huấn luyện.',
            '',
            'Conformal dùng được cho cả phân loại lẫn hồi quy; với hồi quy nó cho khoảng dự đoán.',
            'Ngược lại: chính conformal mới đúng với mọi mô hình, kể cả mô hình tồi.',
          ],
        },
        {
          id: 't4-l9-q2',
          kind: 'truefalse',
          tags: ['conformal'],
          q: 'Giảm α từ 0,10 xuống 0,05 sẽ làm các tập dự đoán nhỏ lại.',
          answer: false,
          why: 'Ngược lại. α nhỏ nghĩa là bạn đòi mức chắc chắn cao hơn — phủ 95% thay vì 90% — nên ngưỡng bất tuân q̂ phải nới rộng ra để nhiều nhãn hơn lọt vào tập. Hệ quả: nhiều tập hai nhãn hơn, ít mẫu tự động hoá được hơn. Đây chính là đánh đổi trung tâm của conformal, và nó là một đánh đổi **hiện rõ** thay vì bị giấu trong một con số ngưỡng tuỳ ý.',
        },
        {
          id: 't4-l9-q3',
          kind: 'mcq',
          tags: ['conformal', 'troi-du-lieu'],
          q: 'Bạn hiệu chuẩn conformal một lần vào tháng 1 và chạy suốt năm. Tháng 8, phủ thực tế đo được chỉ còn 0,71 dù bạn đặt α = 0,1. Nguyên nhân hợp lý nhất?',
          options: [
            'Cài đặt sai công thức phân vị',
            'Giả định hoán vị được đã bị phá vỡ vì phân bố dữ liệu trôi so với tháng 1',
            'Tập hiệu chuẩn tháng 1 quá lớn nên phân vị bị lệch',
            'α = 0,1 là quá nhỏ với dữ liệu bảo mật',
          ],
          answer: 1,
          why: 'Bảo đảm chỉ đúng khi dữ liệu mới hoán vị được với dữ liệu hiệu chuẩn. Sau bảy tháng, họ mã độc, hạ tầng và hành vi người dùng đều đã đổi, nên tập tháng 1 không còn đại diện. Phủ tụt là **triệu chứng của trôi**, không phải lỗi cài đặt. Cách xử lý là hiệu chuẩn lại theo cửa sổ trượt và theo dõi phủ liên tục — coi việc giả định sẽ hỏng là điều chắc chắn xảy ra.',
          distractorWhy: [
            'Lỗi công thức sẽ làm phủ sai ngay từ đầu chứ không đúng bảy tháng rồi mới tụt.',
            '',
            'Tập hiệu chuẩn lớn làm phân vị chính xác hơn, không gây lệch.',
            'α không phải nguyên nhân: bạn đặt 0,1 và hệ thống từng tôn trọng được con số đó.',
          ],
        },
        {
          id: 't4-l9-q4',
          kind: 'mcq',
          tags: ['conformal', 'phan-loai-canh-bao'],
          q: 'Trong quy trình phân loại cảnh báo, giá trị vận hành lớn nhất của conformal nằm ở đâu?',
          options: [
            'Nó làm mô hình chính xác hơn nhờ hiệu chuẩn lại xác suất',
            'Nó chia cảnh báo thành nhóm tự động xử lý được và nhóm bắt buộc cần người, với tỉ lệ bỏ sót đặt trước',
            'Nó thay thế được việc chọn ngưỡng theo ma trận chi phí',
            'Nó loại bỏ nhu cầu có tập kiểm thử riêng',
          ],
          answer: 1,
          why: 'Conformal không đụng gì tới mô hình nên không làm nó chính xác hơn. Giá trị nằm ở chỗ nó biến một thang điểm liên tục mờ mịt thành một **quyết định định tuyến** có bảo đảm: tập một nhãn thì máy xử lý, tập hai nhãn thì người xem, tập rỗng thì điều tra. Và mức bỏ sót không còn là thứ bạn phát hiện sau ba tháng — nó là tham số α bạn đặt từ đầu.',
          distractorWhy: [
            'Conformal bọc quanh mô hình đã có; nó không huấn luyện lại và không thay đổi khả năng phân biệt.',
            '',
            'Hai thứ bổ sung nhau: ma trận chi phí tối ưu chi phí kỳ vọng, conformal bảo đảm mức phủ. Không cái nào thay được cái nào.',
            'Vẫn cần tập kiểm thử riêng để đo phủ thực tế và kích thước tập.',
          ],
        },
        {
          id: 't4-l9-q5',
          kind: 'multi',
          tags: ['conformal', 'mat-can-bang'],
          q: 'Chọn các phát biểu ĐÚNG về conformal prediction trong bối cảnh dữ liệu bảo mật mất cân bằng nặng.',
          options: [
            'Phủ biên có thể đạt mục tiêu trong khi lớp độc hại bị phủ rất kém',
            'Conformal theo lớp cần đủ mẫu hiệu chuẩn ở lớp hiếm mới dùng được',
            'Bảo đảm phủ chỉ đúng nếu mô hình nền đã được hiệu chuẩn xác suất',
            'Tỉ lệ tập rỗng tăng có thể báo trôi dữ liệu trước khi các chỉ số hiệu năng kịp xấu đi',
          ],
          answers: [0, 1, 3],
          why: 'Phát biểu 1 đúng và là cái bẫy chính: phủ biên bị lớp đa số chi phối. Phát biểu 2 đúng — Mondrian tính phân vị riêng từng lớp nên lớp hiếm phải có đủ mẫu, thường là giới hạn thực tế lớn nhất. Phát biểu 4 đúng vì tập rỗng không cần nhãn thật nên phát hiện được sớm. Phát biểu 3 **sai**: bảo đảm phủ không cần mô hình hiệu chuẩn, không cần mô hình tốt, không cần giả định gì về mô hình — hiệu chuẩn chỉ giúp tập nhỏ và hữu ích hơn.',
        },
      ],
      further: [
        {
          title: 'A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification — Angelopoulos và Bates',
          note: 'Tài liệu nhập môn tốt nhất hiện có, nhiều hình và mã chạy được. Đọc chương split conformal trước, phần lý thuyết sau.',
        },
        {
          title: 'Algorithmic Learning in a Random World — Vovk, Gammerman, Shafer',
          note: 'Cuốn sách gốc dựng nên toàn bộ khung conformal. Nặng, nhưng là nơi duy nhất trình bày đầy đủ vì sao bảo đảm đúng với cỡ mẫu hữu hạn.',
        },
        {
          title: 'MAPIE — thư viện conformal cho scikit-learn',
          note: 'Bọc quanh mô hình có sẵn theo giao diện quen thuộc, có hỗ trợ biến thể theo lớp. Đọc phần Mondrian nếu dữ liệu của bạn mất cân bằng.',
        },
      ],
    },

    /* ====================================================================== */
    {
      id: 't4-l7',
      trackId: 'do-luong',
      title: 'Toán học của mệt mỏi cảnh báo',
      subtitle: 'Quy mọi chỉ số về đơn vị mà tổ chức thực sự chi trả: giờ người và vụ bị bỏ lọt',
      minutes: 23,
      practiceMinutes: 7,
      level: 'trung-cap',
      prereqs: ['t4-l4', 't4-l2'],
      why: {
        short:
          'Chỉ số duy nhất khiến lãnh đạo ra được quyết định là chỉ số quy ra tiền, người và rủi ro; precision@k, tải cảnh báo, MTTD và MTTR là bộ từ vựng đó.',
        scenario:
          'Bạn có 10 phút trong cuộc họp quý với ban giám đốc. Họ không quan tâm PR-AUC. Họ hỏi: “năm nay đầu tư vào phát hiện có hiệu quả không, và năm sau cần thêm gì?” Bạn cần bốn con số và một câu chuyện nối chúng lại.',
        roles: ['SOC Analyst', 'Security Architect', 'Detection Engineer', 'GRC / Compliance'],
        costOfNotKnowing:
          'Bạn xây được mô hình tốt nhưng không chứng minh được giá trị của nó, ngân sách bị cắt, và đội SOC tiếp tục chết chìm trong hàng đợi cảnh báo mà không ai trong tổ chức hiểu vì sao.',
      },
      objectives: [
        'Tính được số ca-người cần thiết từ khối lượng cảnh báo và thời gian xử lý trung bình',
        'Định lượng lợi ích của việc gom nhóm cảnh báo bằng tỉ lệ nén và precision ở mức sự việc',
        'Tính precision@k và giải thích vì sao nó khớp với công việc thật hơn mọi chỉ số khác',
        'Chọn bộ chỉ số báo cáo cho lãnh đạo và nêu được cái bẫy Goodhart của từng chỉ số',
      ],
      blocks: [
        {
          t: 'predict',
          question:
            'Đội SOC của bạn có công suất 195 cảnh báo mỗi ngày. Hôm nay hệ thống sinh 10.000 cảnh báo, trong đó 40 là thật. Hai kịch bản: (A) hàng đợi không sắp xếp, analyst lấy ngẫu nhiên; (B) hàng đợi sắp theo điểm mô hình giảm dần, và precision@195 đo được là 12%. Trong mỗi kịch bản, mỗi ngày đội bắt được bao nhiêu vụ thật?',
          reveal:
            '**Kịch bản A:** analyst xem được 195/10.000 = 1,95% hàng đợi, chọn ngẫu nhiên → kỳ vọng bắt được 40 × 0,0195 ≈ **0,8 vụ mỗi ngày**.\n\n**Kịch bản B:** 195 cảnh báo đầu bảng với precision 12% → **23 vụ mỗi ngày**.\n\nCùng một mô hình. Cùng một số người. Cùng một ngân sách. Khác nhau **gần 30 lần** về số vụ thật được phát hiện — chỉ vì thứ tự của hàng đợi.\n\nĐây là lý do toàn bộ chặng này tồn tại, và là câu trả lời cho câu hỏi “ML mang lại gì cho SOC”. Nó thường không tạo ra khả năng phát hiện mới. Nó quyết định **cảnh báo nào được con người nhìn thấy** trong điều kiện công suất hữu hạn — và đó là đòn bẩy lớn nhất trong toàn bộ quy trình.',
        },
        { t: 'h', text: 'Phép tính đầu tiên: từ tỉ lệ ra con người', level: 2 },
        {
          t: 'steps',
          title: 'Bốn bước quy cảnh báo thành nhân sự',
          steps: [
            {
              title: 'Bước 1 — Thời gian hữu ích thật của một ca',
              md: 'Một ca 8 giờ = 480 phút. Trừ bàn giao ca, họp, đào tạo, việc dự án, nghỉ giải lao → thực tế còn khoảng **390 phút** dành cho phân loại cảnh báo. Đừng dùng 480; con số đó là nguồn gốc của mọi kế hoạch nhân sự sai.',
            },
            {
              title: 'Bước 2 — Thời gian trung bình mỗi cảnh báo',
              md: 'Lấy từ hệ thống ticket của chính bạn, không lấy từ báo cáo ngành. Một cảnh báo đơn giản đã làm giàu ngữ cảnh tốt: 4–8 phút. Một cảnh báo phải tra thủ công qua ba hệ thống: 20–40 phút. Giả sử trung bình **12 phút**.\n\nCon số này là **đòn bẩy bị bỏ quên nhất** trong SOC: giảm từ 12 xuống 6 phút bằng cách tự động làm giàu ngữ cảnh tương đương với nhân đôi quân số.',
            },
            {
              title: 'Bước 3 — Công suất của một ca-người',
              md: '390 / 12 ≈ **32 cảnh báo mỗi ca-người**. Với 2 người mỗi ca và 3 ca mỗi ngày: 6 ca-người → khoảng **195 cảnh báo mỗi ngày**. Đây là con số bạn phải mang vào mọi cuộc thảo luận về ngưỡng.',
            },
            {
              title: 'Bước 4 — Đối chiếu với khối lượng thật',
              md: '5.000.000 sự kiện mỗi ngày, FPR 0,02% → 1.000 cảnh báo giả. Cần 1.000 × 12 / 390 ≈ **31 ca-người mỗi ngày**, tức khoảng 5 lần công suất hiện có.\n\nBa lối thoát, xếp theo chi phí tăng dần: **(a)** nâng ngưỡng và xếp hạng để chỉ 195 cảnh báo tốt nhất tới tay người; **(b)** gom nhóm để đơn vị công việc lớn hơn; **(c)** tuyển thêm. Hầu hết tổ chức nhảy thẳng tới (c) mà chưa làm (a) và (b).',
            },
          ],
        },
        {
          t: 'lab',
          id: 'lab-alert-load',
          intro: 'Vặn lưu lượng, tỉ lệ báo động giả, thời gian xử lý và quân số, xem đội SOC của bạn còn sống được không. Thử giảm thời gian mỗi cảnh báo từ 12 xuống 6 phút và quan sát.',
        },
        { t: 'h', text: 'Gom nhóm: cách tăng công suất mà không tăng người', level: 2 },
        {
          t: 'p',
          md: 'Báo động giả trong SOC có một tính chất rất hữu ích: chúng **lặp lại**. Một luật cấu hình sai trên một máy chủ sao lưu có thể tự sinh 3.000 cảnh báo giống hệt nhau trong một đêm. Cảnh báo thật thì thường không lặp như vậy. Bất đối xứng này là thứ bạn khai thác được.',
        },
        {
          t: 'table',
          head: ['', 'Trước khi gom nhóm', 'Sau khi gom nhóm', 'Tỉ lệ nén'],
          rows: [
            ['Cảnh báo giả', '10.000', '200 nhóm', '50 : 1'],
            ['Cảnh báo thật', '40', '30 sự việc', '1,3 : 1'],
            ['Tổng đơn vị công việc', '10.040', '230', '43 : 1'],
            ['Precision mà analyst trải nghiệm', '0,4%', '13%', 'tăng ~33 lần'],
          ],
          caption: 'Không đụng một dòng nào vào mô hình. Chỉ đổi đơn vị công việc từ “cảnh báo” sang “sự việc”, dựa trên việc rác lặp lại nhiều hơn hàng thật.',
        },
        {
          t: 'callout',
          kind: 'pro',
          title: 'Khoá gom nhóm dùng được ngay',
          md: 'Bắt đầu bằng khoá đơn giản: **(tên luật, máy hoặc người dùng, cửa sổ thời gian)**. Ví dụ gộp mọi cảnh báo cùng luật, cùng host, trong cùng khung 4 giờ thành một sự việc.\n\nSau đó nâng dần: gộp theo thực thể liên quan (cùng tài khoản, cùng địa chỉ đích), gộp theo kỹ thuật MITRE ATT&CK, gộp theo cụm nhúng của nội dung cảnh báo.\n\nCẢNH BÁO quan trọng: gom nhóm **giấu đi thông tin về tần suất**. Một sự việc gồm 3.000 cảnh báo và một sự việc gồm 2 cảnh báo phải hiển thị khác nhau, nếu không bạn vừa che mất một tín hiệu mạnh. Luôn giữ số đếm trong giao diện.',
        },
        {
          t: 'checkpoint',
          questions: [
            {
              id: 't4l7-cp1',
              kind: 'mcq',
              tags: ['alert-fatigue', 'precision-at-k'],
              q: 'Vì sao precision@k phản ánh công việc thật của SOC tốt hơn precision tại một ngưỡng cố định?',
              options: [
                'Vì precision@k luôn cao hơn precision thông thường',
                'Vì k được đặt bằng đúng công suất xử lý, nên nó đo chất lượng của phần hàng đợi thực sự được con người nhìn thấy',
                'Vì precision@k không bị ảnh hưởng bởi tỉ lệ mất cân bằng',
                'Vì nó không cần nhãn để tính',
              ],
              answer: 1,
              why: 'Thực tế vận hành là hàng đợi bị cắt bởi công suất, không phải bởi một con số ngưỡng. Nếu đội xử lý được 195 cảnh báo mỗi ngày thì mọi thứ dưới vị trí 195 coi như không tồn tại, bất kể điểm số của chúng là bao nhiêu. precision@195 đo đúng thứ analyst thực sự trải nghiệm. Nó còn có ưu điểm phụ: ổn định khi phân bố điểm trôi, vì k cố định trong khi ngưỡng tuyệt đối thì không.',
              distractorWhy: [
                'Không có lý do gì để precision@k luôn cao hơn; nó có thể thấp hơn nếu k lớn.',
                '',
                'precision@k vẫn phụ thuộc tỉ lệ lớp dương như mọi chỉ số dựa trên precision.',
                'Vẫn cần nhãn để biết trong k cảnh báo đầu có bao nhiêu cái thật.',
              ],
            },
            {
              id: 't4l7-cp2',
              kind: 'truefalse',
              tags: ['alert-fatigue', 'mttr'],
              q: 'MTTR giảm từ 6 giờ xuống 2 giờ luôn là dấu hiệu tốt.',
              answer: false,
              why: 'MTTR có thể giảm vì ba lý do rất khác nhau: (a) quy trình tốt hơn thật — điều bạn muốn; (b) analyst đóng ticket nhanh hơn mà không điều tra kỹ — mù cảnh báo trá hình; (c) cơ cấu cảnh báo thay đổi, ví dụ hệ thống mới sinh nhiều cảnh báo đơn giản, kéo trung bình xuống trong khi các vụ khó vẫn chậm như cũ. Đây là định luật Goodhart: một chỉ số trở thành mục tiêu thì nó thôi là thước đo tốt. Cách phòng: luôn đọc MTTR **cùng với** tỉ lệ mở lại ticket, tỉ lệ leo thang, và MTTR tách riêng theo mức nghiêm trọng — chứ không bao giờ đọc một mình.',
            },
          ],
        },
        { t: 'h', text: 'Bộ chỉ số lãnh đạo thực sự quan tâm', level: 2 },
        {
          t: 'table',
          head: ['Chỉ số', 'Đơn vị', 'Trả lời câu hỏi', 'Bẫy Goodhart'],
          rows: [
            ['Tải cảnh báo', 'Cảnh báo/ngày và ca-người/ngày', 'Đội có đủ người không, và thiếu bao nhiêu?', 'Giảm tải bằng cách tắt bớt luật mà không đo phần bỏ sót tăng thêm'],
            ['precision@k', '% cảnh báo đúng trong k cảnh báo đầu', 'Thời gian analyst có đang đổ vào việc đúng không?', 'Đẩy k xuống rất thấp để precision đẹp, trong khi recall sụp'],
            ['Recall@k / độ phủ phát hiện', '% vụ thật lọt vào top-k', 'Ta bắt được bao nhiêu phần rủi ro với nguồn lực hiện có?', 'Chỉ đo trên các vụ đã biết, tức bỏ qua toàn bộ điểm mù'],
            ['MTTD', 'Giờ hoặc ngày từ lúc xảy ra tới lúc phát hiện', 'Kẻ tấn công có bao nhiêu thời gian trong nhà?', 'Chỉ tính các vụ tự phát hiện, bỏ qua các vụ do bên ngoài báo'],
            ['MTTR', 'Giờ từ phát hiện tới khống chế', 'Quy trình ứng cứu có trơn không?', 'Đóng ticket nhanh mà không điều tra kỹ'],
            ['Tỉ lệ cảnh báo được điều tra', '%', 'Bao nhiêu phần hàng đợi thực sự có người xem?', 'Tự động đóng hàng loạt để nâng tỉ lệ'],
            ['Chi phí mỗi vụ phát hiện thật', 'USD / vụ', 'Đầu tư có hiệu quả không?', 'Bỏ qua giá trị của việc răn đe và tuân thủ'],
          ],
        },
        {
          t: 'callout',
          kind: 'insight',
          title: 'MTTD, MTTR và thời gian ẩn náu',
          md: '**MTTD** (mean time to detect): trung bình từ lúc hành vi độc hại bắt đầu tới lúc có người biết. **MTTR** (mean time to respond/remediate): từ lúc phát hiện tới lúc khống chế xong.\n\nThước đo họ hàng thường được trích dẫn nhất là **thời gian ẩn náu** (dwell time) trong báo cáo M-Trends của Mandiant — trung vị toàn cầu đã giảm mạnh qua nhiều năm và những năm gần đây ở mức khoảng **10 đến 11 ngày**. Con số này giảm chủ yếu vì tỉ trọng ransomware tăng: ransomware tự công bố sự hiện diện của nó. Nói cách khác, một chỉ số cải thiện có thể phản ánh một thực tế xấu đi.\n\nBài học: mọi chỉ số vận hành đều cần **một câu chuyện nhân quả đi kèm**. Con số không tự giải thích, và người trình bày phải là người hiểu vì sao nó động đậy.',
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'Ba phép tính bạn nên tự động hoá thành báo cáo hằng tuần',
          code:
            "import numpy as np\n" +
            "import pandas as pd\n" +
            "\n" +
            "# --- 1. Tải cảnh báo: từ tỉ lệ ra con người ---\n" +
            "su_kien_ngay = 5_000_000\n" +
            "fpr = 0.0002\n" +
            "phut_moi_canh_bao = 12\n" +
            "phut_huu_ich_moi_ca = 390        # 8 giờ trừ họp, bàn giao, việc khác\n" +
            "\n" +
            "canh_bao_ngay = su_kien_ngay * fpr\n" +
            "ca_nguoi_can = canh_bao_ngay * phut_moi_canh_bao / phut_huu_ich_moi_ca\n" +
            "print('Cảnh báo/ngày:', round(canh_bao_ngay),\n" +
            "      '| Ca-người cần:', round(ca_nguoi_can, 1))\n" +
            "\n" +
            "# --- 2. precision@k và recall@k: chất lượng phần hàng đợi thực sự được xem ---\n" +
            "def tai_k(y, diem, k):\n" +
            "    idx = np.argsort(-diem)[:k]\n" +
            "    tp = y[idx].sum()\n" +
            "    return tp / k, tp / max(y.sum(), 1)\n" +
            "\n" +
            "for k in (50, 100, 195, 500):\n" +
            "    p, r = tai_k(y, diem, k)\n" +
            "    print(f'k={k:4d} | precision@k={p:.3f} | recall@k={r:.3f}')\n" +
            "\n" +
            "# --- 3. Gom nhóm: đổi đơn vị công việc từ cảnh báo sang sự việc ---\n" +
            "df['nhom'] = (df['ten_luat'] + '|' + df['host'] + '|'\n" +
            "              + df['ts'].dt.floor('4h').astype(str))\n" +
            "print('Cảnh báo:', len(df), '| Sự việc:', df['nhom'].nunique(),\n" +
            "      '| Tỉ lệ nén:', round(len(df) / max(df['nhom'].nunique(), 1), 1))\n",
        },
        {
          t: 'checklist',
          title: 'Báo cáo hiệu năng phát hiện hằng tháng — bảy dòng',
          items: [
            'Cảnh báo mỗi ngày (trung vị và phân vị 95), quy ra ca-người cần thiết',
            'Tỉ lệ hàng đợi thực sự được điều tra, và số tồn đọng cuối kỳ',
            'precision@k với k bằng đúng công suất, kèm xu hướng ba tháng',
            'Số vụ thật phát hiện được, tách theo nguồn: mô hình, luật, báo từ bên ngoài',
            'MTTD và MTTR tách theo mức nghiêm trọng, kèm tỉ lệ mở lại ticket',
            'Ước lượng bỏ sót từ mẫu ngẫu nhiên vùng dưới ngưỡng và từ diễn tập purple team',
            'Một quyết định đề xuất kèm con số: siết ngưỡng, tuyển người, hay đầu tư tự động hoá',
          ],
        },
        {
          t: 'callout',
          kind: 'pitfall',
          title: 'Mù cảnh báo là hiện tượng phi tuyến, không phải tuyến tính',
          md: 'Người ta hay giả định: gấp đôi cảnh báo thì cần gấp đôi người. Sai. Khi hàng đợi vượt quá ngưỡng chịu đựng, hành vi con người **đổi chất**: analyst bắt đầu đóng hàng loạt theo loại luật, bỏ qua cả những cảnh báo đáng lẽ phải xem, và tỉ lệ bỏ sót nhảy vọt chứ không tăng đều.\n\nCác khảo sát ngành lặp đi lặp lại một mô típ: một phần rất lớn cảnh báo không bao giờ được điều tra, và một tỉ lệ đáng kể đội SOC thừa nhận đã từng tắt bớt hoặc hạ độ nhạy của các nguồn cảnh báo ồn ào.\n\nHệ quả thiết kế: **thà 195 cảnh báo được xem kỹ còn hơn 10.000 cảnh báo được xem lướt.** Đây là lý do kỹ thuật, không phải lý do tinh thần, khiến việc xếp hạng và gom nhóm quan trọng hơn việc tăng recall thô.',
        },
        {
          t: 'callout',
          kind: 'story',
          title: 'Cách trình bày 10 phút trước ban giám đốc',
          md: '*“Quý này hệ thống sinh trung bình 1.040 cảnh báo mỗi ngày. Công suất của đội là 195, nên 81% hàng đợi không có người xem. Sau khi bật xếp hạng theo mô hình và gom nhóm, precision trong 195 cảnh báo đầu bảng tăng từ 3% lên 13%, tức mỗi ngày chúng ta phát hiện thêm khoảng 19 vụ thật với đúng số người cũ.*\n\n*Phần chưa xử lý được ước tính bằng lấy mẫu ngẫu nhiên vùng dưới ngưỡng: khoảng 11 vụ mỗi ngày vẫn lọt. Với chi phí kỳ vọng 4.500 USD một vụ, đó là 49.500 USD rủi ro mỗi ngày. Hai lựa chọn: thêm 4 nhân sự, hoặc đầu tư làm giàu ngữ cảnh tự động để giảm thời gian xử lý từ 12 xuống 6 phút — phương án hai rẻ hơn khoảng ba lần.”*\n\nKhông có một chữ nào là PR-AUC. Nhưng toàn bộ bài nói này chỉ dựng được nếu bạn đã đi qua sáu bài trước.',
        },
        { t: 'terms', ids: ['alert-fatigue', 'precision', 'nguong', 'siem', 'soar', 'bao-dong-gia'] },
      ],
      keyTakeaways: [
        'Một ca 8 giờ chỉ có khoảng 390 phút hữu ích; chia cho thời gian xử lý trung bình ra công suất thật của mỗi ca-người.',
        'Giảm thời gian xử lý mỗi cảnh báo bằng làm giàu ngữ cảnh tự động có giá trị tương đương tuyển thêm người, nhưng rẻ hơn nhiều.',
        'Xếp hạng hàng đợi có thể tăng số vụ thật phát hiện được lên hàng chục lần mà không đổi mô hình hay quân số.',
        'Gom nhóm khai thác việc báo động giả lặp lại nhiều hơn cảnh báo thật; tỉ lệ nén 40:1 là bình thường và nó nâng precision mà analyst trải nghiệm lên hàng chục lần.',
        'precision@k với k bằng công suất là chỉ số khớp nhất với công việc thật, vì hàng đợi bị cắt bởi công suất chứ không bởi ngưỡng.',
        'Mù cảnh báo là hiện tượng phi tuyến: vượt ngưỡng chịu đựng thì hành vi đổi chất và bỏ sót nhảy vọt.',
        'Mọi chỉ số vận hành đều có bẫy Goodhart; luôn đọc theo cụm và luôn kèm câu chuyện nhân quả.',
      ],
      cards: [
        {
          id: 't4l7-c1',
          front: 'Một ca trực 8 giờ có bao nhiêu phút thực sự dùng để phân loại cảnh báo, và vì sao không phải 480?',
          back: 'Khoảng 390 phút. Phần còn lại đi vào bàn giao ca, họp, đào tạo, việc dự án và nghỉ. Dùng 480 là nguồn gốc của mọi kế hoạch nhân sự sai.',
          tags: ['alert-fatigue', 'thuc-chien'],
        },
        {
          id: 't4l7-c2',
          front: 'precision@k là gì và k nên đặt bằng bao nhiêu?',
          back: 'Tỉ lệ cảnh báo đúng trong k cảnh báo có điểm cao nhất. k nên đặt bằng đúng công suất xử lý mỗi ngày của đội, vì đó là phần hàng đợi thực sự có người xem.',
          tags: ['precision-at-k', 'alert-fatigue'],
        },
        {
          id: 't4l7-c3',
          front: 'Vì sao gom nhóm cảnh báo lại nâng precision mà analyst trải nghiệm, dù mô hình không đổi?',
          back: 'Vì báo động giả lặp lại nhiều hơn cảnh báo thật, nên tỉ lệ nén của chúng cao hơn hẳn. Đổi đơn vị công việc từ cảnh báo sang sự việc làm rác co lại nhiều hơn hàng thật.',
          tags: ['alert-fatigue'],
        },
        {
          id: 't4l7-c4',
          front: 'Nêu bẫy Goodhart của chỉ số MTTR.',
          back: 'MTTR giảm có thể do đóng ticket nhanh mà không điều tra kỹ, hoặc do cơ cấu cảnh báo đổi. Phải đọc kèm tỉ lệ mở lại ticket và tách theo mức nghiêm trọng.',
          tags: ['mttr', 'thuc-chien'],
        },
        {
          id: 't4l7-c5',
          front: 'Vì sao mù cảnh báo là hiện tượng phi tuyến?',
          back: 'Khi hàng đợi vượt ngưỡng chịu đựng, analyst chuyển sang đóng hàng loạt theo loại luật thay vì xem từng cái, nên tỉ lệ bỏ sót nhảy vọt chứ không tăng đều theo số cảnh báo.',
          tags: ['alert-fatigue'],
        },
      ],
      quiz: [
        {
          id: 't4-l7-q1',
          kind: 'input',
          tags: ['alert-fatigue'],
          q: 'Đội có 3 ca mỗi ngày, 2 analyst mỗi ca, mỗi ca 390 phút hữu ích, trung bình 15 phút một cảnh báo. Công suất tối đa mỗi ngày là bao nhiêu cảnh báo? (Nhập số nguyên)',
          accept: ['156', '156 canh bao', '156/ngay'],
          placeholder: 'Nhập số cảnh báo mỗi ngày…',
          hint: 'Mỗi ca-người xử lý được 390/15 cảnh báo. Có bao nhiêu ca-người mỗi ngày?',
          why: '390 / 15 = 26 cảnh báo mỗi ca-người. 3 ca × 2 người = 6 ca-người → 26 × 6 = **156 cảnh báo mỗi ngày**. Đây chính là giá trị k bạn mang sang bài t4-l4 để đặt ngưỡng top-k, và cũng là k trong precision@k. Chú ý đòn bẩy: nếu làm giàu ngữ cảnh tự động kéo thời gian xử lý từ 15 xuống 10 phút, công suất nhảy lên 234 cảnh báo mỗi ngày — tăng 50% mà không tuyển thêm ai.',
        },
        {
          id: 't4-l7-q2',
          kind: 'mcq',
          tags: ['alert-fatigue', 'precision-at-k'],
          q: 'Hệ thống sinh 8.000 cảnh báo mỗi ngày, trong đó 50 là thật. Đội xử lý được 200. Hành động nào tăng số vụ thật phát hiện được NHIỀU nhất mà không cần tuyển người?',
          options: [
            'Huấn luyện lại mô hình để tăng recall từ 0,80 lên 0,90',
            'Xếp hạng hàng đợi theo điểm mô hình và gom nhóm cảnh báo trùng lặp',
            'Tăng số lượng luật phát hiện để phủ thêm kỹ thuật tấn công',
            'Chuyển từ LightGBM sang một mô hình deep learning',
          ],
          answer: 1,
          why: 'Nút thắt hiện tại không phải khả năng phát hiện mà là **công suất tiêu thụ**: 7.800 trong 8.000 cảnh báo không có người xem. Nếu hàng đợi không sắp xếp, kỳ vọng bắt được chỉ khoảng 50 × 200/8.000 = 1,25 vụ mỗi ngày. Xếp hạng tốt có thể đưa precision@200 lên hai chữ số, tức hàng chục vụ mỗi ngày. Ba phương án còn lại đều đổ thêm nước vào cái xô đang tràn: tăng recall và tăng luật làm hàng đợi dài thêm, còn đổi thuật toán không đụng gì tới nút thắt.',
          distractorWhy: [
            'Recall cao hơn chỉ làm hàng đợi dài thêm khi 97,5% hàng đợi vốn đã không có người xem.',
            '',
            'Thêm luật là thêm cảnh báo — đúng hướng ngược lại với vấn đề đang có.',
            'Đổi kiến trúc mô hình không giải quyết nút thắt về công suất tiêu thụ của con người.',
          ],
        },
        {
          id: 't4-l7-q3',
          kind: 'multi',
          tags: ['alert-fatigue', 'thuc-chien'],
          q: 'Chỉ số nào nên có trong báo cáo hiệu năng phát hiện gửi ban lãnh đạo? (Chọn tất cả đáp án đúng)',
          options: [
            'Số cảnh báo mỗi ngày quy ra ca-người cần thiết',
            'precision@k với k bằng công suất thật của đội',
            'ROC-AUC của mô hình trên tập kiểm tra',
            'Ước lượng bỏ sót từ lấy mẫu ngẫu nhiên vùng dưới ngưỡng',
          ],
          answers: [0, 1, 3],
          why: 'Ba chỉ số được chọn đều quy về đơn vị mà lãnh đạo ra được quyết định: người, chất lượng công việc, và rủi ro tồn dư. ROC-AUC là chỉ số kỹ thuật hữu ích cho **bạn** khi so sánh mô hình, nhưng nó không trả lời được câu hỏi nào của người duyệt ngân sách — và tệ hơn, nó tạo cảm giác an tâm sai vì trông luôn rất cao trong bài toán mất cân bằng. Chỉ số thứ tư là chỉ số hiếm nhất trong thực tế và cũng là chỉ số trung thực nhất: nó là cách duy nhất nhìn thấy ô False Negative.',
        },
        {
          id: 't4-l7-q4',
          kind: 'order',
          tags: ['alert-fatigue', 'quy-trinh'],
          q: 'Đội SOC đang ngập cảnh báo. Sắp xếp các biện pháp theo thứ tự nên thực hiện, từ rẻ và nhanh nhất tới tốn kém nhất.',
          items: [
            'Xếp hạng hàng đợi theo điểm mô hình để cái quan trọng nhất nằm trên cùng',
            'Gom nhóm cảnh báo trùng lặp thành sự việc, đổi đơn vị công việc',
            'Tự động làm giàu ngữ cảnh để giảm thời gian xử lý mỗi cảnh báo',
            'Chỉnh ngưỡng theo chi phí và theo nhóm tài sản',
            'Tuyển thêm nhân sự cho các ca trực',
          ],
          why: 'Thứ tự này theo tỉ lệ hiệu quả trên chi phí giảm dần. Xếp hạng thường triển khai trong vài ngày và cho hiệu ứng lớn nhất. Gom nhóm cần một khoá gộp và ít công cụ. Làm giàu ngữ cảnh cần tích hợp nhưng đổi lại nhân đôi công suất hiệu dụng. Chỉnh ngưỡng theo nhóm tài sản cần thảo luận với chủ sở hữu hệ thống nên chậm hơn về mặt tổ chức. Tuyển người đứng cuối vì đắt nhất, chậm nhất, và — quan trọng nhất — nó không sửa được nguyên nhân gốc, nên hàng đợi sẽ lại đầy sau vài tháng.',
        },
        {
          id: 't4-l7-q5',
          kind: 'truefalse',
          tags: ['alert-fatigue'],
          q: 'Nếu số cảnh báo tăng gấp đôi thì số vụ bị bỏ sót cũng tăng khoảng gấp đôi.',
          answer: false,
          why: 'Quan hệ này phi tuyến. Khi hàng đợi vượt quá ngưỡng chịu đựng, cách làm việc của con người thay đổi về chất: analyst chuyển sang đóng hàng loạt theo loại luật, ngừng đọc chi tiết, và bỏ qua cả những cảnh báo lẽ ra phải xem — nên bỏ sót tăng nhanh hơn nhiều so với tỉ lệ tăng của cảnh báo. Chiều ngược lại cũng đúng và là tin tốt: giảm tải cảnh báo xuống dưới ngưỡng chịu đựng có thể cải thiện tỉ lệ phát hiện mạnh hơn nhiều so với mức bạn dự đoán bằng phép tính tuyến tính.',
        },
      ],
      terms: ['alert-fatigue', 'precision', 'nguong', 'siem', 'soar', 'bao-dong-gia', 'bo-sot'],
      further: [
        {
          title: 'M-Trends — báo cáo thường niên của Mandiant',
          note: 'Nguồn được trích dẫn nhiều nhất về thời gian ẩn náu và tỉ lệ vụ việc do bên ngoài phát hiện. Đọc để có mốc so sánh cho MTTD của tổ chức bạn.',
        },
        {
          title: 'Practical Threat Detection Engineering — Roddie, Deyalsingh & Katz',
          note: 'Chương về đo lường quy trình phát hiện: cách xây bộ chỉ số vận hành mà đội SOC dùng được hằng tuần, không phải chỉ số nghiên cứu.',
        },
        {
          title: 'MITRE ATT&CK — đo độ phủ kỹ thuật',
          note: 'Bổ sung cho các chỉ số trong bài: độ phủ theo kỹ thuật trả lời câu hỏi “ta mù ở đâu”, thứ mà precision và recall không nói được.',
        },
      ],
    },
  ],
};
