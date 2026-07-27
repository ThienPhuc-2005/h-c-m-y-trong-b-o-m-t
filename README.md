# AEGIS — Học máy cho An ninh mạng

Ứng dụng học tập tiếng Việt đưa người học **từ số 0 tới trình độ làm việc được** trong lĩnh vực học máy ứng dụng cho an ninh mạng.

Chạy hoàn toàn trong trình duyệt. Không tài khoản, không máy chủ, không theo dõi, dùng được ngoại tuyến thật (có service worker — xem phần *Hiệu năng và ngoại tuyến* để biết số đo).

**11 chặng · 73 bài · 364 thẻ ghi nhớ · 468 câu hỏi · 24 phòng thí nghiệm · 30 hình minh hoạ · 167 thuật ngữ · ~23 giờ nội dung.**

---

## Vì sao app này khác các khoá học khác

Phần lớn khoá học trực tuyến tối ưu cho **cảm giác đã học**. App này tối ưu cho **thứ còn lại sau sáu tháng**. Cụ thể, bảy nguyên tắc từ nghiên cứu về học tập được mã hoá thẳng vào cấu trúc dữ liệu và giao diện, không phải là lời khuyên dán ở đâu đó:

| Nguyên tắc | Cách hiện thực hoá trong app |
|---|---|
| **Học để làm gì** | Kiểu `Lesson` **bắt buộc** có trường `why` gồm bốn phần: ý nghĩa, tình huống công việc thật, vai trò nghề nghiệp sử dụng, và hậu quả nếu không biết. Bài thiếu trường này không qua được bộ kiểm tra nội dung. |
| **Hiệu ứng tiền kiểm tra** | Khối `predict` hỏi trước khi giảng. Người học phải bấm mới thấy lời giải — ép một khoảnh khắc suy nghĩ thật. |
| **Hiệu ứng kiểm tra** | Khối `checkpoint` đặt câu hỏi truy hồi **giữa bài**, không dồn hết về cuối. |
| **Lặp lại ngắt quãng** | Cài đặt đầy đủ thuật toán **FSRS** (mô hình trí nhớ ba biến: độ ổn định, độ khó, xác suất nhớ lại) — xem `src/lib/srs.ts`. |
| **Xen kẽ (interleaving)** | Trang Luyện tập trộn câu hỏi từ nhiều chặng và sắp lại để hai câu liền nhau không cùng chủ đề. |
| **Mã hoá kép** | 30 hình minh hoạ SVG tự vẽ + 24 phòng thí nghiệm tương tác. Mọi khái niệm trừu tượng đều có bản nhìn thấy được. |
| **Siêu nhận thức** | Người học chấm mức tự tin **trước** khi trả lời; app dựng biểu đồ hiệu chuẩn cho thấy họ tự tin thái quá hay rụt rè. |

Ngoài ra:

- **Bản đồ thành thạo tự phai mờ.** Điểm của một khái niệm giảm dần theo thời gian nếu không gặp lại. Không có dấu tích xanh vĩnh viễn ru ngủ người học.
- **Trần thẻ mới mỗi ngày.** Chặn "núi nợ ôn tập" — nguyên nhân số một khiến người ta bỏ các ứng dụng lặp lại ngắt quãng.
- **Chuỗi ngày khoan dung.** Ngưỡng rất thấp và không trừng phạt khi nghỉ; mục đích là giữ thói quen, không phải tạo cảm giác tội lỗi.
- **Không game hoá rỗng.** Không điểm số, không combo, không âm thanh chiến thắng. Huy hiệu chỉ gắn với thói quen học tốt — không có huy hiệu nào thưởng cho việc học nhồi 5 giờ liên tục.

## Thiết kế thị giác phục vụ việc học

Xem phần chú thích đầy đủ trong [`src/styles/tokens.css`](src/styles/tokens.css).

- Bề mặt độ bão hoà thấp, màu rực **chỉ** dùng để mang thông tin. Mỗi hue có một ý nghĩa cố định trong toàn app (xanh lá = đúng/an toàn, hồng = sai/tấn công, hổ phách = cảnh báo…), người học học bảng màu một lần rồi dùng mãi.
- Không bao giờ chỉ dùng màu để truyền tin: mọi trạng thái đều kèm biểu tượng, hình dạng và nhãn chữ (khoảng 8% nam giới bị mù màu đỏ–lục — đúng cặp màu nguy hiểm nhất).
- Tương phản đạt WCAG 2.2 AA ở cả chế độ sáng và tối. Nền sáng không phải trắng tinh, nền tối không phải đen tuyệt đối — hai cực đoan đó đều gây mỏi mắt khi đọc lâu.
- Phản hồi khi trả lời sai dùng tông dịu: đỏ chói kích hoạt phản ứng đe doạ, thu hẹp chú ý đúng lúc người học cần mở rộng nó để tiếp thu lời giải thích.
- Tôn trọng `prefers-reduced-motion` và `prefers-contrast`; cỡ chữ, hoạt ảnh và bề rộng dòng đều chỉnh được.

## Nội dung

11 chặng học, đi từ "học máy là gì" tới red team cho hệ thống ML và bảo vệ ứng dụng LLM:

| # | Chặng | Bài | Trọng tâm |
|---|---|---|---|
| 0 | Khởi động | 4 | ML làm được gì / không làm được gì trong bảo mật; cách học để không quên |
| 1 | Nền móng | 7 | Vector đặc trưng, Bayes, **nghịch lý tỉ lệ nền**, thống kê, entropy, gradient |
| 2 | Dữ liệu bảo mật | 6 | Nguồn log, pandas, làm sạch, bài toán nhãn, bộ dữ liệu chuẩn, **rò rỉ dữ liệu** |
| 3 | Học máy cốt lõi | 8 | Hồi quy logistic, Naive Bayes, cây, rừng/boosting, k-NN/SVM, quá khớp, kiểm định |
| 4 | **Đo lường** | 7 | Ma trận nhầm lẫn, precision/recall, ROC vs PR, ngưỡng theo chi phí, hiệu chuẩn, mệt mỏi cảnh báo |
| 5 | Kỹ thuật đặc trưng | 6 | URL/email, tệp PE, luồng mạng, hành vi người dùng, TF-IDF tới embedding |
| 6 | Ứng dụng thực chiến | 9 | Phishing, mã độc tĩnh/động, DGA, NIDS, bất thường, UEBA, log, gian lận |
| 7 | Học sâu | 6 | Nơ-ron, huấn luyện, CNN trên byte, mô hình chuỗi, và **khi nào không nên dùng** |
| 8 | Học máy đối kháng | 6 | Né tránh, đầu độc, cửa hậu, trộm mô hình, phòng thủ, red team ML |
| 9 | An ninh LLM & GenAI | 7 | Prompt injection, jailbreak, rủi ro RAG/tác tử, OWASP LLM Top 10, guardrails |
| 10 | Vận hành & sự nghiệp | 7 | MLOps trong SOC, trôi khái niệm, giám sát, giải thích, quản trị, lộ trình nghề |

Chặng 4 (Đo lường) được viết dày nhất có chủ đích: phần lớn thất bại của ML trong bảo mật không đến từ thuật toán kém mà từ việc **đo sai thứ**.

## Phòng thí nghiệm

24 mô hình chạy thật bằng JavaScript ngay trong trình duyệt — không có máy chủ, không có dữ liệu nào rời khỏi máy bạn. Vài ví dụ:

- **Nghịch lý tỉ lệ nền** — kéo độ hiếm của tấn công xuống và xem độ chuẩn xác sụp đổ dù mô hình không tệ đi.
- **ROC vs PR** — chứng kiến ROC-AUC "nói dối" khi lớp dương trở nên hiếm.
- **Huấn luyện hồi quy logistic** — xem trọng số hội tụ theo thời gian thực trên đặc trưng URL.
- **Perceptron & XOR** — bài toán từng khiến ngành AI đóng băng 17 năm, giải được ngay khi thêm 2 nơ-ron ẩn.
- **Tấn công né tránh** — chỉnh đặc trưng để lật nhãn, kèm chỉ số "công sức kẻ tấn công phải bỏ ra".
- **Đầu độc dữ liệu** — mở cửa hậu trong mô hình trong khi mọi chỉ số theo dõi vẫn xanh.
- **Hộp cát prompt injection** — bật/tắt từng lớp phòng thủ cho tác tử LLM và xem cái nào thật sự hiệu quả.
- **Trí nhớ 120 ngày** — mô phỏng chính đường cong quên của bạn.

## Tìm kiếm nhanh

Nhấn <kbd>/</kbd> hoặc <kbd>Ctrl/⌘</kbd>+<kbd>K</kbd> ở bất kỳ đâu. Tìm đồng thời trong bài học, thuật ngữ và phòng lab; **so khớp sau khi bỏ dấu** (gõ `do chuan xac` ra *Độ chuẩn xác · Precision*); và tìm cả trong phần *"học để làm gì"* của mỗi bài, vì người học thường nhớ **vấn đề** chứ hiếm khi nhớ tên bài. Điều hướng hoàn toàn bằng bàn phím.

## Hiệu năng và ngoại tuyến

Số đo thật, không phải ước lượng (Chromium, mạng mô phỏng qua CDP):

| Tình huống | Thời gian |
|---|---|
| Lần đầu, không giới hạn băng thông | ~0,3 s |
| Lần đầu, 4G chậm (4 Mbps, 80 ms) | ~1,7 s |
| Lần đầu, Fast 3G (1,6 Mbps, 150 ms) | ~3,9 s |
| **Mở lại khi NGẮT MẠNG hoàn toàn** | **~0,17 s** |

Toàn bộ giáo trình là ~670 KB sau nén, và đó là chi phí có thật của lần tải đầu trên mạng chậm. Đổi lại, người học **trả một lần**: service worker nạp sẵn mọi thứ, nên từ lần thứ hai app mở tức thì và hoạt động đầy đủ khi không có mạng — kể cả ôn thẻ, đọc bài và chạy phòng lab.

Giáo trình được chia **mỗi chặng một tệp**, và service worker **tái sử dụng các chặng không đổi** khi cập nhật. Đo thực tế: sửa nội dung một chặng khiến người học tải lại **226 KB** thay vì ~2,2 MB.

## Chạy thử

```bash
npm install
npm run dev      # máy chủ phát triển
npm run build    # dựng bản tĩnh vào dist/
npm run preview  # xem thử bản đã dựng
```

Bản build là tệp tĩnh thuần với đường dẫn tương đối và định tuyến theo hash — thả `dist/` lên GitHub Pages, một thư mục trên máy chủ nội bộ, hay một chiếc USB đều chạy được.

## Cấu trúc mã nguồn

```
src/
├── content/          Toàn bộ giáo trình dưới dạng dữ liệu thuần
│   ├── types.ts        Lược đồ — nguyên tắc sư phạm được mã hoá thành kiểu dữ liệu
│   ├── registry.ts     Danh sách id hình vẽ / phòng lab hợp lệ
│   ├── glossary.ts     Từ điển thuật ngữ song ngữ
│   └── t0…t10*.ts      11 chặng học
├── lib/
│   ├── srs.ts          FSRS — bộ lập lịch lặp lại ngắt quãng
│   ├── mastery.ts      Mô hình người học, hiệu chuẩn, huy hiệu
│   ├── plan.ts         Bộ lập kế hoạch hằng ngày
│   ├── storage.ts      Kho dữ liệu cục bộ + xuất/nhập
│   ├── router.ts       Định tuyến theo hash (không phụ thuộc)
│   ├── highlight.ts    Tô màu cú pháp tối giản
│   └── utils.ts        Tiện ích số học và chuỗi
├── components/       Dựng khối nội dung, câu hỏi, hình vẽ SVG, tìm kiếm
├── labs/             24 phòng thí nghiệm tương tác
├── pages/            10 trang
└── styles/           Design tokens + thư viện thành phần

public/sw.js          Service worker: nạp sẵn, cache-first, tái dùng chunk cũ
scripts/build-sw.mjs  Nhúng danh sách tệp thật + phiên bản băm sau mỗi lần build
```

## Kiểm thử và bảo đảm chất lượng

```bash
npm test        # 574 kiểm thử
npm run lint
npx tsc -b --noEmit
```

- **Bộ máy trí nhớ** (`srs.test.ts`): tính đơn điệu của khoảng cách theo điểm chấm, vòng đời thẻ, và các bất biến an toàn (không sinh NaN, độ khó luôn trong [1, 10], tôn trọng trần khoảng cách).
- **Toàn vẹn giáo trình** (`content.test.ts`): mọi bài **phải** có `why` đủ bốn phần, có điểm truy hồi, có yếu tố trực quan, có thẻ ghi nhớ; mọi câu hỏi phải có giải thích; id không trùng trên toàn khoá; bài tiên quyết tồn tại và không tạo chu trình; mọi id hình vẽ và phòng lab đều có thật.
- **Trợ năng**: kiểm toán bằng axe-core (WCAG 2.1 A + AA) trên 8 trang × 2 chủ đề, kể cả khi bảng tìm kiếm đang mở — **0 vi phạm**.
- **Phòng lab**: cả 24 lab được kéo thanh trượt tới hai cực, bật/tắt mọi công tắc — không sinh `NaN`, không lỗi console.
- **Đầu-cuối**: vòng học hoàn chỉnh (đọc bài → điểm dừng truy hồi → kiểm tra cuối bài → kích hoạt thẻ → phiên ôn tập) và khả năng ngoại tuyến đều được kiểm bằng trình duyệt thật.

Toàn bộ ứng dụng **không dùng thư viện ngoài nào** ngoài React: bộ định tuyến, biểu đồ, hình vẽ, tô màu cú pháp, mô hình học máy và bộ dựng markdown đều tự viết. Điều này giữ bản build nhỏ, hoạt động ngoại tuyến, và không có phần nào là hộp đen với người muốn đọc mã.

## Dữ liệu của người học

Mọi tiến độ nằm trong `localStorage` của trình duyệt. Không có bản sao ở đâu khác — nghĩa là riêng tư tuyệt đối, nhưng cũng nghĩa là **xoá dữ liệu duyệt web sẽ mất sạch**. Trang Cài đặt có nút xuất/nhập tệp JSON để sao lưu và chuyển sang máy khác.

## Giấy phép và phạm vi

Nội dung về tấn công (chặng 8 và 9) mang tính **phòng thủ và nghiên cứu**: giải thích cơ chế ở mức khái niệm để người học biết cách bảo vệ hệ thống, và mọi mô phỏng đều chạy trên mô hình đồ chơi trong trình duyệt. Áp dụng các kỹ thuật này lên hệ thống bạn không sở hữu hoặc không được uỷ quyền là hành vi trái pháp luật ở hầu hết các quốc gia.
