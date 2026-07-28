# AEGIS — ghi chú cho người (và máy) làm việc trên mã nguồn

Ứng dụng học tập chạy hoàn toàn trong trình duyệt: React + TypeScript + Vite,
**không có thư viện ngoài nào ngoài React**. Bộ định tuyến, biểu đồ, hình vẽ,
tô màu cú pháp, bộ dựng markdown, các mô hình học máy trong phòng lab và bộ icon
đều tự viết. Trước khi thêm một `npm install`, hãy cân nhắc: cam kết này giữ bản
build nhỏ, chạy được ngoại tuyến từ USB, và không có phần nào là hộp đen.

## Lệnh

```bash
npm install
npm run dev       # máy chủ phát triển, cổng 5173
npm run build     # tsc -b && vite build && nhúng danh sách tệp vào service worker
npm run preview   # xem thử bản đã dựng
npm test          # vitest, chạy một lượt
npm run test:watch
npm run lint      # oxlint
npx tsc -b --noEmit
node scripts/calibrate-minutes.mjs        # hiệu chỉnh lại thời lượng bài học
node scripts/calibrate-minutes.mjs --dry  # xem thay đổi, không ghi
npm run check:contrast                    # WCAG + khoảng cách hue cho ba bảng màu
npm run check:figures                     # đo hình vẽ trong trình duyệt thật
```

`check:figures` mở Chrome (hoặc Edge) đã cài sẵn ở chế độ không giao diện, duyệt
59 hình và 33 phòng lab, rồi trượt nếu có phần tử nào vượt khỏi `viewBox`, hai
hộp chữ đè nhau quá 2 đơn vị theo cả hai chiều, hoặc một đường kẻ chạy xuyên
giữa một dòng chữ. Nó không tải trình duyệt về
và không thêm dependency: Node đã có `WebSocket` và `fetch`, đủ để nói thẳng
giao thức DevTools. Chạy nó sau khi sửa bất cứ hình nào hoặc bất cứ biểu đồ nào
trong `src/labs/`. Không nằm trong CI vì CI không có trình duyệt.

Khi nó báo tràn, **nới `viewBox` không phải cách sửa**. Trên màn hẹp
`.figure svg` được vẽ ở 620px, nên viewBox rộng hơn nghĩa là tỉ lệ co giãn nhỏ
đi và chữ trên điện thoại nhỏ theo. Rút ngắn thứ đang tràn, hoặc dời nó.

Trước khi commit, chạy đủ ba thứ: `npx tsc -b --noEmit`, `npm run lint`, `npm test`.
CI chạy đúng ba lệnh đó cộng thêm `npm run build`.

## Cấu trúc

```
src/
├── content/          Toàn bộ giáo trình dưới dạng dữ liệu thuần
│   ├── types.ts        Lược đồ — nguyên tắc sư phạm mã hoá thành kiểu dữ liệu
│   ├── registry.ts     Danh sách id hình vẽ / phòng lab hợp lệ
│   ├── reading-time.ts Mô hình ước lượng thời lượng — script và test dùng chung
│   ├── glossary.ts     Từ điển thuật ngữ song ngữ
│   ├── index.ts        Điểm tập hợp + truy vấn dùng chung + auditCourse()
│   └── t0…t10*.ts      11 chặng học, mỗi chặng một tệp
├── i18n/             Song ngữ VI/EN cho phần VỎ giao diện
│   ├── index.ts        Store + t() + useT() + setLang()
│   └── vi.json, en.json
├── lib/
│   ├── srs.ts          FSRS — bộ lập lịch lặp lại ngắt quãng
│   ├── mastery.ts      Mô hình người học, hiệu chuẩn, huy hiệu
│   ├── plan.ts         Bộ lập kế hoạch hằng ngày
│   ├── storage.ts      Kho localStorage + xuất/nhập
│   ├── router.ts       Định tuyến theo hash
│   ├── highlight.ts    Tô màu cú pháp tối giản
│   └── utils.ts        Tiện ích số học, chuỗi, định dạng theo ngôn ngữ
├── components/
│   ├── Icon.tsx        Bộ icon Lucide nhúng sẵn + logo mạng xã hội
│   ├── Blocks.tsx      Dựng khối nội dung bài học
│   ├── Quiz.tsx, Figures.tsx, Markdown.tsx, Search.tsx, Shared.tsx
├── labs/             24 phòng thí nghiệm tương tác
├── pages/            10 trang
└── styles/           tokens.css (design tokens) + components.css + base.css

public/sw.js          Service worker: nạp sẵn, cache-first, tái dùng chunk cũ
public/manifest.webmanifest + icon.svg + icon-maskable.svg
scripts/build-sw.mjs  Nhúng danh sách tệp thật + phiên bản băm sau mỗi lần build
scripts/calibrate-minutes.mjs  Hiệu chỉnh minutes/practiceMinutes từ nội dung thật
scripts/check-contrast.mjs     Đọc tokens.css, đo WCAG và khoảng cách hue
scripts/check-figures.mjs      Đo hình bằng Chrome không giao diện, qua CDP
```

## Ba quy ước dễ vi phạm

**Icon.** Không dùng emoji, kể cả trong `src/content/`. Mọi biểu tượng đi qua
`<Icon name="…" />`; thêm hình mới thì thêm vào `SHAPES` trong
`components/Icon.tsx` (hình học Lucide, viewBox 24×24, nét 2px). Trường `icon`
trong dữ liệu (chặng học, huy hiệu, phòng lab, và hai cột của khối `compare`)
chứa **tên icon**, không phải ký tự.

`src/components/icon.test.ts` chặn emoji ở cả mã giao diện lẫn giáo trình, đòi
mọi khối `compare` có icon cho cả hai cột, và bắt lỗi hai cột trùng icon — trùng
là mất luôn thứ đang phân biệt chúng. Dấu sắp chữ (`✓ ✗ × – —`) vẫn được phép
**trong câu văn** của giáo trình: chúng là ký tự chữ thật, không phải hình.

**Song ngữ.** Không hardcode chữ hiển thị trong component. Thêm khoá vào **cả
hai** `vi.json` và `en.json` rồi gọi `t('muc.khoa')`; trong component dùng
`const t = useT()` để nó vẽ lại khi đổi ngôn ngữ. Ở tầng `lib/` (không phải
component) gọi thẳng `t` nhập từ `../i18n`, hoặc trả về **khoá** để nơi gọi dịch
— xem `plan.ts` và `mastery.ts`. `src/i18n/i18n.test.ts` đối chiếu hai tệp, kiểm
biến nội suy, và bắt khoá gõ sai.

Phạm vi i18n là **vỏ giao diện**. Giáo trình trong `src/content/` vẫn là tiếng
Việt và không có kế hoạch dịch; khi chọn English, app nói rõ điều đó với người
dùng (`content.noticeLong`).

**Nội dung.** Mọi bài học phải có `why` đủ bốn phần, có điểm truy hồi, có yếu tố
trực quan, có thẻ ghi nhớ; mọi câu hỏi phải có `why`. `content.test.ts` sẽ trượt
nếu thiếu. Id thẻ và câu hỏi là **khoá lưu tiến độ của người học** — đổi id là
xoá tiến độ của họ.

**Thời lượng.** `minutes` (đọc) và `practiceMinutes` (làm) **không viết tay**.
Mô hình nằm ở `src/content/reading-time.ts`; sửa nội dung xong thì chạy
`node scripts/calibrate-minutes.mjs`. `content.test.ts` đối chiếu số đã ghi với
số mô hình tính ra, nên quên chạy là test trượt kèm tên bài và lệnh cần gõ.
Bộ lập kế hoạch ngày cộng **cả hai** số, vì đó là thứ người học thật sự phải bỏ ra.

Một bài có thể nằm trong tệp của chặng khác: `t4-l1` và `t4-l2` mang id chặng 4
nhưng sống trong `t2-du-lieu.ts`. Id giữ nguyên vì id là khoá tiến độ, còn chỗ
đứng đổi vì chặng 3 cần từ vựng đo lường mà chặng 4 mới dạy. **Đừng suy tệp từ
tiền tố id** — tra theo chặng đang chứa bài.

## Cỡ chữ và bố cục co giãn

**Hệ số cỡ chữ nhân đúng MỘT lần, ở `html`.** `--user-scale` được nhân vào
`font-size` của `html` trong `base.css`; mọi token `--fs-*` là `rem` nên tự đi
theo. Đừng nhân nó lần nữa ở `body`, ở `.prose` hay ở bất kỳ đâu — nhân hai lần
là bình phương hệ số. Trước đây hệ số nằm ở `body` và `.prose`, nên kéo thanh
trượt lên hết cỡ vẫn để tiêu đề đứng nguyên 36px và chip đứng nguyên 12,5px.

**Đừng khai báo `grid-template-columns` bằng style nội tuyến.** Style nội tuyến
thắng mọi media query, nên một grid hai cột viết inline sẽ không bao giờ gộp lại
trên màn hẹp. Dùng lớp `.grid-split` (có sẵn biến `--split-a` / `--split-b` để
đổi tỉ lệ) hoặc thêm lớp mới trong `components.css`.

Sau khi động vào cỡ chữ hay bố cục, kiểm tràn ngang ở bề rộng 375px với
`--user-scale` đặt lần lượt 0,85 và 1,4 — không trang nào được có
`documentElement.scrollWidth > clientWidth`.

## Dữ liệu người học

Toàn bộ nằm ở `localStorage['aegis.progress.v1']`, ngôn ngữ nằm riêng ở
`localStorage['lang']`. Thêm trường mới vào `Progress` thì cập nhật `migrate()`
trong `storage.ts` — nó hợp nhất với mặc định nên dữ liệu cũ không vỡ.

## Triển khai

`vite.config.ts` đặt `base: './'` và app dùng định tuyến theo hash, nên bản build
chạy ở bất kỳ đâu: GitHub Pages dưới thư mục con, máy chủ nội bộ, USB, hay mở
thẳng `index.html`. Đẩy lên `main` là CI tự dựng và triển khai lên GitHub Pages.
