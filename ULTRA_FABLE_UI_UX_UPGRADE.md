# ULTRA FABLE UI/UX UPGRADE — IUH Talent (Cổng xét tuyển CN/KSTN)

> **Loại tài liệu:** kế hoạch thực thi thiết kế lại giao diện (design-only), viết để một AI agent / lập trình viên **không có ngữ cảnh phiên làm việc trước** vẫn làm đúng.
> **Ngày lập:** 2026-11-11 · **Baseline commit:** `3b51ca4` (nhánh `main`) · **Phiên bản plan:** 3 (thay thế phần *hình thức* của `UI-UX-UPGRADE-PLAN.md` và `UI-UX-UPGRADE-PLAN-V2.md`).
> **Phương pháp:** khảo sát mã nguồn + chạy ứng dụng thật, đối chiếu skill **UI UX Pro Max** (`.agents/skills/ui-ux-pro-max`) và **Impeccable** (`~/.claude/skills/impeccable`, v4.8.0), đối chiếu bộ nhận diện chính thức tại `https://iuh.edu.vn/vi/nhan-dien-thuong-hieu.html`.

---

## 0. ĐỌC TRƯỚC KHI LÀM (dành cho agent thực thi)

### 0.1 Bốn luật tối thượng — vi phạm một luật là hỏng việc

| # | Luật | Diễn giải cụ thể |
|---|------|------------------|
| L1 | **Không đổi nội dung** | Không thêm, bớt, viết lại bất kỳ chuỗi hiển thị nào (tiêu đề, nhãn nút, nhãn cột, thông báo, placeholder, tên menu, dữ liệu mẫu). Chỉ được *tái sử dụng* chuỗi đã tồn tại và *đổi cách trình bày* (kích thước, màu, vị trí trong cùng màn hình, chữ hoa/thường bằng CSS). Ngoại lệ duy nhất: thuộc tính trợ năng (`aria-label`, `sr-only`) được liệt kê tường minh trong plan này. |
| L2 | **Không đổi nghiệp vụ / luồng** | Không sửa bất kỳ tệp nào trong `src/domain/`, `src/mock/`, `src/app/router.js`, `src/app/routes.jsx`, `src/hooks/`. Không đổi tên/tham số lời gọi `call("...")`, `action.run("...")`, `navigate("...")`, điều kiện `can(...)`, điều kiện hiển thị (`{cond && ...}`), thứ tự bước wizard, thứ tự/tên/số lượng cột bảng, thứ tự mục menu. Mọi `onClick`/`onChange`/`onSubmit` giữ nguyên thân hàm. |
| L3 | **Không thêm dependency** | Không `npm/pnpm install` gì thêm. Chỉ dùng: React 19, Tailwind CSS v4 (`@tailwindcss/vite`), `lucide-react`, Inter Variable đã có sẵn. Không GSAP, không thư viện chart, không Google Fonts CDN. |
| L4 | **Xanh sau mỗi phase** | Sau mỗi phase phải chạy bộ kiểm tra ở mục 9.1 và đạt 100% trước khi sang phase kế. Không gộp nhiều phase vào một commit. |

Nếu một chỉ dẫn trong plan mâu thuẫn với L1–L4 khi áp vào mã thật → **L1–L4 thắng**, bỏ qua chỉ dẫn đó và ghi lại trong báo cáo phase.

### 0.2 Cách làm việc bắt buộc

1. Đọc hết mục 1–5 trước khi sửa dòng mã đầu tiên.
2. Làm tuần tự Phase 0 → Phase 8 (mục 8). Mỗi phase: sửa → chạy kiểm tra 9.1 → tự soát theo "Tiêu chí nghiệm thu" của phase → commit.
3. Trước khi sửa một tệp, **đọc toàn bộ tệp đó** (không sửa theo trí nhớ). Sửa bằng thay thế tối thiểu: chỉ chạm `className`, cấu trúc bọc (wrapper) và component trình bày; giữ nguyên biểu thức dữ liệu và handler.
4. Khi cần quyết định thị giác mà plan chưa nêu: chọn phương án **ít trang trí hơn**, dùng token có sẵn, không tự bịa màu/kích thước.
5. Dùng skill khi cần tra cứu (không bắt buộc cài thêm gì):
   - UI UX Pro Max: `python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<2–5 từ khóa>" --domain ux|color|typography|icons|chart` hoặc `--stack react`. Kết quả là *gợi ý*, không ghi đè plan này. **Không** chạy `--persist`.
   - Impeccable: đọc `~/.claude/skills/impeccable/reference/craft-floor.md` ngay trước khi sửa UI, và `reference/operate.md` cho màn hình workspace. Launcher `scripts/impeccable` chỉ kèm binary Windows; trên Linux/macOS **đừng** chạy (nó sẽ tải binary) — đọc trực tiếp `PRODUCT.md`, `DESIGN.md` thay thế.

### 0.3 Lệnh dự án

```bash
bash run.sh                      # dev server http://127.0.0.1:5173 (KSTN_PORT=5174 nếu bận cổng)
bash TEST.sh                     # 4 bước: unit test → render trang chủ → render 110 route/vai trò → build 7 HTML
node --test "src/**/*.test.js"   # riêng unit test (baseline: 245 pass, 0 fail)
```

`pnpm` có thể không cài trên máy; mọi lệnh đều chạy được bằng `node` trực tiếp như `run.sh`/`TEST.sh` đang làm.

---

## 1. Bối cảnh dự án

### 1.1 Sản phẩm

**IUH Talent** — cổng tiếng Việt quản trị trọn vòng đời xét tuyển chương trình **Cử nhân tài năng (CNTN)** và **Kỹ sư tài năng (KSTN)** của Trường Đại học Công nghiệp TP.HCM (IUH). Hiện là **prototype frontend-only** (mock backend chạy trong trình duyệt, dữ liệu minh họa). Chi tiết: `PRODUCT.md`, `NGHIEP-VU.md`, `coding_plan/KSTN-PROTOTYPE-IMPLEMENTATION-PLAN.md`.

Phân cấp học thuật: `Khoa → Ngành → Lớp`. Sáu vai trò (nhãn lấy từ `src/domain/constants.js › ROLE_LABEL`):

| Mã | Nhãn hiển thị | Trang HTML vào thẳng | Việc chính |
|----|---------------|----------------------|-----------|
| `ADMIN` | Quản trị viên | `quan-tri-vien.html` | Danh mục, tài khoản, phân quyền, cấu hình, nhật ký, hàng đợi email |
| `TRAINING` | Đại diện phòng đào tạo | `dai-dien-phong-dao-tao.html` | Phê duyệt cấp cuối & công bố, báo cáo toàn trường |
| `DEAN` | Ban lãnh đạo khoa | `ban-lanh-dao-khoa.html` | Phê duyệt danh sách cấp khoa, tiêu chí, ĐXT |
| `HEAD` | Chủ nhiệm ngành | `chu-nhiem-nganh.html` | Duyệt hồ sơ ngành, xác nhận danh sách |
| `LECTURER` | Giảng viên phụ trách | `giang-vien-phu-trach.html` | Duyệt hồ sơ, lớp của tôi, đặt lại MK SV |
| `STUDENT` | Sinh viên | `sinh-vien.html` | Nộp/cập nhật hồ sơ, theo dõi kết quả |

`index.html` (`data-role="public"`) là cổng công khai. Mỗi trang HTML vai trò tự `demoLogin` rồi điều hướng `#/app/dashboard`.

### 1.2 Công nghệ & cấu trúc

- Vite 8 (multi-page, 7 entry) · React 19 · Tailwind CSS **v4** (token khai báo bằng `@theme` trong CSS, **không có** `tailwind.config.js`) · `lucide-react` · hash router tự viết.
- Kiểm thử: `node --test` (không Jest/Vitest), SSR smoke bằng `react-dom/server` qua Vite `ssrLoadModule`.

```text
src/
  main.jsx, App.jsx              -> bootstrap + bảng phân trang theo route (CHỈ sửa nếu plan nêu)
  app/                           -> AuthGate.jsx, WorkspaceLayout.jsx (shell), menus.js, router.js, routes.jsx
  components/
    ui/                          -> primitive: Button, IconButton, Form, Display, StatusBadge, Modal, Drawer, ...
    layout/                      -> PublicHeader, WorkspaceHeader, Sidebar, RoleSwitcher, NotificationBell, PageHeader
    data/                        -> TablePanel, TableToolbar, TableActions, ResponsiveTable
    domain-ui/                   -> AdmissionListTable, ApprovalStepper, CriteriaTable, CriterionField,
                                    EvidenceUploader, EvidenceViewer, ProgramTimeline, RoundMilestones
  features/                      -> public, auth, dashboard, student-portal, reviews, approvals, rounds,
                                    criteria, catalog, operations, notifications, profile, demo, shared/FeatureKit.jsx
  domain/, mock/, hooks/         -> LOGIC — CẤM SỬA (L2)
  styles.css                     -> @import tailwindcss + 3 tệp dưới
  styles/theme.css               -> toàn bộ design token (@theme)
  styles/base.css                -> @font-face, reset, focus, reduced-motion
  styles/components.css          -> lớp khó viết bằng utility (.ui-input, .ui-table, keyframes, print)
assets/fonts/InterVariable.woff2 -> font duy nhất, tự host
assets/img/logo-iuh-khoa-cntt.svg-> logo Khoa CNTT (ảnh PNG 356×92 nhúng trong SVG — raster, mờ khi phóng to)
assets/img/brand/                -> MỚI: logo IUH chính thức dạng vector + favicon (xem mục 4)
```

### 1.3 Bản đồ route → component (để biết sửa tệp nào)

| Route (hash) | Component | Tệp |
|---|---|---|
| `#/` | `PublicHome` | `features/public/PublicHome.jsx` |
| `#/dot/:id` | `RoundsPage publicView` | `features/rounds/RoundsPage.jsx` |
| `#/ket-qua/:id`, `#/tra-cuu` | `ResultPages` | `features/public/ResultPages.jsx` |
| `#/dang-nhap`, `#/dang-ky`, `#/quen-mat-khau`, `#/dat-lai-mat-khau`, `#/app/doi-mat-khau` | `AuthPage` | `features/auth/AuthPages.jsx` |
| `#/app/dashboard` (không phải SV) | `Dashboard` | `features/dashboard/Dashboard.jsx` |
| `#/app/dashboard`, `apply/:id`, `my-applications[/:id]`, `maintenance`, `open-rounds` (SV) | `StudentPortal` / `ApplicationForm` | `features/student-portal/StudentPortal.jsx` |
| `#/app/reviews[/:id]`, `#/app/records/application/:id` | `ReviewsPage` | `features/reviews/ReviewsPage.jsx` |
| `#/app/approvals[/:id]` | `ApprovalsPage` | `features/approvals/ApprovalsPage.jsx` |
| `#/app/rounds[/:id]` | `RoundsPage` | `features/rounds/RoundsPage.jsx` |
| `#/app/criteria[/:id]` | `CriteriaPage` | `features/criteria/CriteriaPage.jsx` |
| `#/app/catalog`, `programs`, `classes[/:id]`, `lecturers`, `students`, `student-passwords`, `permissions` | `ManagementPage` | `features/catalog/ManagementPage.jsx` |
| `#/app/reports`, `audit`, `email-outbox`, `settings` | `OperationsPage` | `features/operations/OperationsPage.jsx` |
| `#/app/records[/:id]` | `RecordsPage` | `features/operations/RecordsPage.jsx` |
| `#/app/notifications` | `NotificationsPage` | `features/notifications/NotificationsPage.jsx` |
| `#/app/profile` | `ProfilePage` | `features/profile/ProfilePage.jsx` |
| (nổi trên mọi trang) | `DemoPanel` | `features/demo/DemoPanel.jsx` |

Shell workspace: `app/WorkspaceLayout.jsx` render `Sidebar` + `WorkspaceHeader` + `<main>` có **H1 duy nhất** (`data-page-heading`) lấy nhãn từ menu; trang con bắt đầu từ `h2`.

### 1.4 Ràng buộc kiểm thử có thể bị giao diện làm vỡ (BẪY — đọc kỹ)

| Bẫy | Nguồn | Hệ quả cho việc thiết kế |
|---|---|---|
| HTML SSR trang chủ **không được chứa chuỗi con `closed`** | `coding_plan/verify-render.mjs` | Cấm `data-state="closed"`, cấm class/tên biến xuất ra DOM có `closed`, cấm icon lucide có tên chứa `Closed` (ví dụ `DoorClosed` → class `lucide-door-closed`). Dùng `data-open="false"` nếu cần. |
| HTML SSR trang chủ phải chứa `Bảng điều khiển demo` và `DXT-2026-06`, không chứa `DXT-2026-07` | như trên | Giữ nút mở Demo luôn render (kể cả khi panel đóng); không ẩn mã đợt khỏi DOM; không đổi bộ lọc `status !== "draft"`. |
| `App` phải render được phía server | `verify-render.mjs`, `verify-routes.mjs` | Không truy cập `window`/`document`/`localStorage`/`matchMedia` ở thân component hay cấp module — chỉ trong `useEffect`/handler. `import logo from "...svg"` thì được. |
| Mỗi route/vai trò phải render > 1000 ký tự HTML | `verify-routes.mjs` (110 tổ hợp) | Không bọc trang trong component chỉ render sau `useEffect` (mounted-gate), không lazy thêm trang nào ngoài `OperationsPage` đang có. |
| `features/demo/DemoPanel.jsx` và `features/public/PublicHome.jsx` **không được chứa** mã hex `#abc/#aabbcc` hay `text-[..px]` | `src/mock/architecture.test.js` | Mọi màu/cỡ chữ đi qua token. Áp dụng luôn quy ước này cho **tất cả** tệp `.jsx` (mục 9.2). |
| Build đủ 7 entry HTML | `vite.config.js` | Không đổi tên/xóa các tệp `*.html` gốc; chỉ được thêm thẻ `<link rel="icon">` (mục 4.3). |
| Khối `@media print` trong `components.css` ẩn `aside, header, button, input, select, label` và dùng `.print-report` | Tính năng "In / Lưu PDF" của Báo cáo | Giữ nguyên khối print; phần tử báo cáo cần in không được nằm trong `<aside>`/`<header>`. |

---

## 2. Chẩn đoán: vì sao giao diện hiện tại "AI slop"

Bằng chứng lấy từ mã nguồn tại `3b51ca4` và ảnh chụp ứng dụng đang chạy.

| # | Triệu chứng | Bằng chứng | Hướng xử lý (mục) |
|---|---|---|---|
| S1 | **Callout bị dùng làm "thẻ" cho mọi thứ.** Dashboard hiển thị số liệu bằng 8–9 hộp thông tin xanh nhạt có icon ⓘ và viền trái đậm — trông như 9 cảnh báo. | 52 lần dùng `<Callout>`; `Dashboard.jsx` dùng Callout cho "N hồ sơ chờ duyệt", cho từng trạng thái ĐXT; `OperationsPage` dùng Callout cho tổng hợp báo cáo; `RecordsPage`/`AuthPages`/`StudentPortal` dùng Callout làm thẻ danh tính. | 6.3, 7.3 |
| S2 | **Thư viện component tốt bị bỏ quên.** `PageHeader`, `TableToolbar`, `TableActions`, `StatCard`, `EmptyState`, `FileDropzone`, `FileItem` đã có nhưng trang tính năng không dùng; thay vào đó là `DataList` thô (ô tìm kiếm trần có nhãn rời, rỗng thì chỉ là một dòng chữ). | Đếm: `DataList` 20 lần, `EmptyState` 1 lần ngoài Gallery, `TableToolbar` 0 lần trong feature, `StatCard` 0 lần. | 6.4 |
| S3 | **Hành động trong bảng là link chữ rời rạc.** 30 nút `variant="link"` ("Xem", "Xem hồ sơ", "Xem lịch sử"…) không căn lề, không vùng bấm. | `grep 'variant="link"'` = 30. | 6.2 |
| S4 | **Trang xác thực trần trụi.** Một cột 576px trôi ở góc trên, link "Về trang chủ" là chữ xanh trần, không logo, không khung thương hiệu, nền xám trống 70% màn hình. | `AuthPages.jsx`, `ResultPages.jsx`. | 7.2 |
| S5 | **Trang trí "chữ ký" mang tính công thức.** Vạch đồng 32×2px (`honor-rule`) + dòng eyebrow in hoa giãn chữ trên mọi tiêu đề; lưới chấm (`academic-grid`); viền trái màu 3px trên Callout/Toast/blockquote/mốc thời gian; kính mờ trên header. Đây đúng là các mẫu Impeccable xếp vào "refuse/ban" (kicker trên heading, `border-left` màu > 1px, blur trang trí). | `honor-rule` 8 chỗ/7 tệp, `academic-grid` 7 chỗ/4 tệp, `border-l-` 11 chỗ, `backdrop-blur` 2 chỗ. | 3.4, 6.1 |
| S6 | **Màu nhấn lạc thương hiệu.** Accent "đồng học thuật" `#b8892b` không thuộc bộ nhận diện IUH (xanh `#153898` + vàng `#F9B200`). Token `neutral-*` dùng xám Slate của Tailwind (lệch tông với thang `ink` ánh lam). `info-*` là một màu xanh thứ hai cạnh tranh với xanh thương hiệu. `warning` (hổ phách) sẽ trùng sắc với vàng IUH. | `src/styles/theme.css`. | 3.2 |
| S7 | **Sidebar navy đậm + "tấm" logo trắng.** Logo raster đặt trong hộp trắng bo góc giữa nền navy trông như dán tạm; 4 mục menu dùng chung icon quyển sách, 3 mục dùng chung icon tệp. | `Sidebar.jsx`, `menus.js`. | 6.5 |
| S8 | **Lưới thẻ đồng dạng ở trang chủ.** Mỗi đợt xét tuyển là một thẻ 2 cột cùng khuôn, 6 dòng chữ xám cùng cỡ, không thể hiện được *đợt đang ở đâu trong tiến trình*. | `PublicHome.jsx`. | 7.1 |
| S9 | **Chữ in hoa tiếng Việt giãn chữ** ở tiêu đề cột, nhãn mô tả: dấu thanh chồng lên nhau, khó đọc, đúng "giọng" template SaaS. | `.ui-table th`, `DescriptionList dt`, `text-overline uppercase`. | 3.3, 6.1 |
| S10 | **Trang nghiệp vụ dài không có khung.** Wizard nộp hồ sơ, màn duyệt hồ sơ, chi tiết ĐXT xếp `h2` + `p` + badge + countdown thành từng dòng rời; nút hành động trôi cuối nội dung; uploader là `<input type="file">` mặc định của trình duyệt. | `StudentPortal.jsx` dòng 132–320, `ReviewsPage.jsx` 244–460, `EvidenceUploader.jsx`. | 7.4–7.6 |
| S11 | **Header workspace cao 2 dòng** vì nhãn "Vai trò đang làm việc" đặt trên select; nút "Thông báo (1)" là nút chữ to. Nút "Bảng điều khiển demo" nổi đè lên nút "Thu gọn" của sidebar. | Ảnh chụp dashboard; `DemoPanel.jsx:75` `fixed bottom-4 left-4`. | 6.5, 6.6 |
| S12 | **Bề mặt trình duyệt chưa được thiết kế**: vùng chọn văn bản, caret, `accent-color`, thanh cuộn toàn trang, gạch chân link dùng mặc định. | `base.css`. | 3.5 |

**Kết luận:** nền móng (token, a11y, primitive) dùng được; cái hỏng là *lớp bố cục trang* và *vài quyết định trang trí*. Vì vậy plan này **không viết lại từ đầu** mà: (1) chỉnh token về đúng nhận diện IUH, (2) gỡ trang trí công thức, (3) nâng `DataList`/Callout/primitive một lần để 20+ màn hình hưởng lợi, (4) dựng lại bố cục từng trang bằng cùng một bộ khung.

---

## 3. Hướng thiết kế: **"IUH Blue — Rõ tiến trình"**

### 3.1 Định vị

- **Chế độ Impeccable:** workspace = **Operate** (người dùng đến để xong việc: quét nhanh, nhất quán, điều khiển chuẩn). Trang công khai + xác thực = Operate có điểm nhấn thương hiệu (không phải landing marketing — không thêm copy).
- **Cảm giác:** cổng hành chính học vụ của một trường đại học lớn — chính xác, sáng sủa, dứt khoát. Không "startup SaaS", không "luxury học thuật".
- **Bốn thứ thương hiệu được phép đóng góp** (theo `operate.md`): kiểu chữ, bảng màu, mật độ, và **một** nước đi chữ ký. Bố cục, điều hướng, điều khiển giữ dạng chuẩn.

### 3.2 Bảng màu — lấy từ logo IUH chính thức

Logo chính thức (`assets/img/brand/iuh-logo.svg`) dùng đúng hai màu: **xanh `#153898`** và **vàng `#F9B200`** (bản trắng dùng vàng `#FDB726`). Bộ nhận diện mô tả "bảng màu xanh – vàng đặc trưng".

**Chiến lược màu (Restrained + rail thương hiệu):**

| Vai trò | Token | Giá trị | Dùng cho | Tương phản đã tính |
|---|---|---|---|---|
| Xanh thương hiệu | `brand-600` | `#153898` | Nút chính, link, lựa chọn hiện tại, **nền sidebar**, nền hero công khai, nền khung xác thực | Trắng trên nền này 10.24:1 |
| Xanh đậm | `brand-700` / `800` | `#102c79` / `#0d2463` | Hover/active của nút chính, chữ tiêu đề nhấn | Trên trắng 12.66:1 |
| Xanh rất nhạt | `brand-25` / `50` / `100` | `#f7f9ff` / `#eef3ff` / `#dce6ff` | Nền hover hàng, nền mục được chọn, nền tem mã | `brand-700` trên `brand-50` 11.4:1 |
| Vàng IUH | `accent-500` | `#F9B200` | **Chỉ** trên nền xanh: nút hành động chính của hero/khung xác thực (`variant="accent"`), dòng nhãn chương trình ở hero. **Cấm** dùng làm chữ/viền trên nền trắng (1.84:1), cấm dùng làm màu trạng thái. | Trên `brand-600` 5.56:1; chữ `brand-950` trên vàng 9.23:1 |
| Trung tính | `ink-0…900` | giữ nguyên thang hiện có | Nền (`ink-50`), viền (`ink-200/300`), chữ phụ (`ink-600`), chữ chính (`ink-900`) | `ink-600` trên trắng 6.31:1, trên `ink-50` 5.84:1; `ink-500` trên `ink-50` 4.7:1 |
| Thành công | `success-*` | giữ nguyên | Đạt, trúng tuyển, đã duyệt | fg trên bg 6.81:1 |
| Cảnh báo | `warning-*` | **đổi sang cam** (xem 3.6) | Chờ duyệt, cần bổ sung, sắp hết hạn — tách hẳn khỏi vàng thương hiệu | fg `#9A3412` trên bg `#FFF7ED` 6.88:1 |
| Nguy hiểm | `danger-*` | giữ nguyên | Không đạt, lỗi, thao tác hủy | 6.05:1 |
| Thông tin | `info-*` | **gộp về tông brand** | Chưa mở, chờ phê duyệt, ghi chú hệ thống | `brand-700` trên `brand-50` 11.4:1 |
| Trung lập | `neutral-*` | **gộp về tông ink** | Nháp, đã rút, đã hủy | `ink-700` trên `ink-100` 8.29:1 |

Quy tắc: `ink-400` (`#97a3b6`, 2.55:1) **chỉ** cho icon trang trí/placeholder viền, không cho chữ. Chữ nhỏ nhất dùng `ink-600`; `ink-500` chỉ khi chữ ≥ 13px trên nền trắng.

### 3.3 Kiểu chữ

- **Một họ duy nhất: Inter Variable** (đã tự host). Lý do: chính `iuh.edu.vn` đang dùng Inter; đủ dấu tiếng Việt; không tốn dependency. Mono hệ thống (`--font-mono`) chỉ cho **mã định danh** (mã đợt, MSSV, mã hồ sơ, mã lớp) và OTP.
- **Thang cố định (rem), tỉ lệ ~1.2**, không `clamp()`:

| Token | Cỡ / dòng | Nặng | Dùng cho |
|---|---|---|---|
| `text-display` | 2.5rem / 3rem | 700, -0.02em | H1 hero trang công khai (≥ sm) |
| `text-title-1` | 1.5rem / 2rem | 700, -0.015em | H1 trang workspace, H1 trang xác thực |
| `text-title-2` | 1.125rem / 1.625rem | 650, -0.01em | H2: tên thực thể trong trang chi tiết, tiêu đề panel lớn, tiêu đề drawer/modal lớn |
| `text-title-3` | 0.9375rem / 1.375rem | 600 | H3: tiêu đề panel, tiêu đề thẻ, tiêu đề modal nhỏ |
| `text-metric` *(mới)* | 1.75rem / 2rem | 650, tabular | Con số tổng hợp (điểm, số lượng) |
| `text-body-lg` | 1rem / 1.5rem | 400 | Đoạn dẫn, nội dung trang công khai/xác thực |
| `text-body` | 0.875rem / 1.375rem | 400 | Mặc định workspace, ô bảng |
| `text-body-sm` | 0.8125rem / 1.25rem | 400 | Chữ phụ, nhãn form, tiêu đề cột |
| `text-caption` | 0.75rem / 1rem | 400 | Dấu thời gian, chú thích, badge |
| `text-overline` | 0.75rem / 1rem | 600, 0.04em | Giữ token cho tương thích; **không dùng mới** |

- **Bỏ in hoa** ở tiêu đề cột bảng và nhãn `DescriptionList` (CSS, không đụng chuỗi). In hoa chỉ còn ở chữ viết tắt vốn có trong dữ liệu (BB, UT, ĐXT).
- Số liệu luôn `tabular-nums`. Tiêu đề dùng `text-wrap: balance`, đoạn văn `text-wrap: pretty`. Độ dài dòng văn xuôi ≤ 68ch.

### 3.4 Hình khối, chiều sâu, chuyển động

- **Bo góc gọn hơn** (bo to mềm ở mọi thứ là dấu hiệu template): `xs 4px` · `control 8px` · `card 12px` · `modal 16px`. Badge/pill giữ `rounded-full`.
- **Chiều sâu bằng viền, không bằng bóng:** bề mặt tĩnh (panel, bảng, thẻ) = nền trắng + viền `ink-200`, **không shadow**. Bóng chỉ cho lớp *nổi thật*: popover/menu (`shadow-overlay`), modal/drawer (`shadow-modal`), toast, thanh hành động dính đáy. Input/nút phụ giữ `shadow-raised` rất nhẹ.
- **Hai tầng nền:** canvas `ink-50`, bề mặt làm việc `ink-0`. Vùng phụ trong bề mặt (đầu bảng, footer modal, ô chỉ đọc) `ink-25`.
- **Chuyển động:** giữ nguyên 120/180/260ms và các keyframe hiện có; chỉ dùng cho thay đổi trạng thái (mở lớp phủ, chuyển bước, toast). Không thêm hiệu ứng vào trang; không animation khi tải trang ngoài `page-in` (fade 160ms) đang có. Tôn trọng `prefers-reduced-motion` (đã có trong `base.css`).

**Gỡ bỏ hoàn toàn:** `honor-rule`, `academic-grid`, mọi `border-l-[2–3px]` màu trên callout/toast/blockquote/mốc thời gian/khối thành tích, `backdrop-blur` trên header, bóng `shadow-card` trên thẻ tĩnh.

### 3.5 Bề mặt trình duyệt (thêm vào `base.css`)

`::selection` nền `brand-100` chữ `brand-900`; `caret-color` và `accent-color` = `brand-600`; link văn bản gạch chân `text-underline-offset: 3px`, `text-decoration-thickness: 1px`; thanh cuộn trang mỏng theo `ink-300`; `:focus-visible` 2px `--color-focus` offset 2px (trên nền xanh dùng trắng qua lớp `.on-dark` đang có).

### 3.6 Nước đi chữ ký (duy nhất): **Thanh tiến trình — `ProcessTrack`**

Điều riêng có của sản phẩm này là *mọi thứ đều đi qua một chuỗi bước có thứ tự và có người chịu trách nhiệm*: đợt xét tuyển đi qua 5 giai đoạn công khai (Chưa mở → Đang tiếp nhận hồ sơ → Đang xét duyệt hồ sơ → Chờ phê duyệt → Đã công bố), danh sách đi qua 3 cấp duyệt (Chủ nhiệm ngành → Ban lãnh đạo khoa → Phòng Đào tạo), hồ sơ đi qua 3 bước wizard. Hiện ba thứ này vẽ theo ba kiểu khác nhau (badge, 3 ô chữ rời, stepper tròn).

**Một ngữ pháp thị giác chung** cho mọi chuỗi tuần tự: các **đoạn thanh ngang nối liền** (segment), đoạn đã qua tô `brand-600`, đoạn hiện tại tô `brand-600` + nhãn đậm, đoạn chưa tới `ink-200`. Xuất hiện ở: hàng đợt xét tuyển trang chủ, chi tiết ĐXT, dashboard (đếm ĐXT theo giai đoạn), màn phê duyệt 3 cấp, wizard nộp hồ sơ, đăng ký 3 bước. Chi tiết component ở 6.7. Nhãn dùng **chuỗi sẵn có** trong `ROUND_STATUSES`, `ROLE_LABEL`, và các chuỗi "Đã duyệt / Đang chờ / Chưa tới" đang có.

### 3.7 Danh sách cấm (áp dụng mọi phase)

Gradient (nền, chữ, viền); glow/pulse; glassmorphism/blur trang trí; emoji; ảnh stock; minh họa tải từ kho chung; số liệu bịa; thẻ lồng thẻ; eyebrow/kicker in hoa mới; `border-left`/`border-right` màu > 1px; bóng đổ cứng không blur; sparkline/progress ring trang trí; mono cho thứ không phải mã; thêm marketing copy; dark mode (ngoài phạm vi — `color-scheme: light` giữ nguyên); màu Tailwind mặc định (`slate-`, `gray-`, `blue-`, `rose-`…); mã hex và `text-[..px]` trong JSX.

---

## 4. Tài sản (assets)

### 4.1 Đã tải sẵn vào repo (không cần tải lại)

Nguồn: trang chủ `https://iuh.edu.vn/` (logo đang dùng trên header trang trường), tải ngày 2026-11-11. SHA-256 đã đối chiếu với bản trình duyệt nhận qua TLS hợp lệ.

| Tệp | Kích thước | SHA-256 | Dùng ở |
|---|---|---|---|
| `assets/img/brand/iuh-logo.svg` | 22 342 B, viewBox `0 0 321 115`, vector thuần (fill `#153898`, `#F9B200`) | `02358223efa308fb6bc559a87c29a396a47240f0af445957d4d3841a1b0ffdb5` | Khung xác thực (nền trắng, nếu cần), tài liệu |
| `assets/img/brand/iuh-logo-white.svg` | 22 510 B, vector (trắng + `#FDB726`) | `091d8dd3389d10b30c543b0be03a328923c695afce61e415acf9b937effdd2b7` | **Sidebar**, khung thương hiệu trang xác thực (nền `brand-600`) |
| `assets/img/brand/favicon-32x32.png` | 1 700 B | `10d79afb8da1fb93a685acb2355ba30f43a5eab5dbc3c9f706537697f4842576` | `<link rel="icon">` 7 tệp HTML |
| `assets/img/brand/favicon-16x16.png` | 1 330 B | `23a2755bafa2420a21b0f1ff0a931e26083b5805bee9bb067bd6b98d5968cca2` | như trên |
| `assets/img/brand/apple-touch-icon.png` | 3 816 B (120×120) | `50016d41464bc00c1400f93f521119153a81bce2f13f9452a2903704b49db1fe` | `<link rel="apple-touch-icon">` |

Kiểm tra: `sha256sum assets/img/brand/*`. Nếu lệch → dừng, báo lại, không tự tải nguồn khác.

Ghi chú tải lại (nếu buộc phải làm): máy chủ `iuh.edu.vn` thiếu chứng chỉ trung gian và chặn client không phải trình duyệt; mở URL `https://iuh.edu.vn/assets/images/icons/logo.svg` và `logo-white.svg` bằng trình duyệt rồi lưu. **Không** dùng `curl -k`.

### 4.2 Quy tắc dùng logo

- **Giữ nguyên** `assets/img/logo-iuh-khoa-cntt.svg` và vị trí đang dùng trên **header công khai** (`PublicHeader`) — đây là tài sản nhận diện Khoa CNTT mà `PRODUCT.md` yêu cầu bảo toàn.
- **Sidebar workspace:** thay "tấm trắng chứa logo khoa" bằng `iuh-logo-white.svg` đặt trực tiếp trên nền `brand-600` (đúng cách logo xuất hiện trên header `iuh.edu.vn`). Hệ thống phục vụ toàn trường (Phòng Đào tạo, nhiều khoa) nên logo trường là đúng ngữ cảnh.
- Không đổi màu, không cắt, không kéo méo, không đặt logo màu lên nền xanh hay logo trắng lên nền sáng. Chiều cao tối thiểu 28px; vùng trống quanh logo ≥ 8px. `alt="IUH"` (chuỗi đang có) — không thêm alt mới.
- Không tự vẽ họa tiết "phỏng logo" (mũi tên, chữ I cách điệu) làm trang trí.

### 4.3 Favicon (Phase 0)

Thêm vào `<head>` của **cả 7** tệp HTML gốc (`index.html`, `sinh-vien.html`, `giang-vien-phu-trach.html`, `chu-nhiem-nganh.html`, `ban-lanh-dao-khoa.html`, `dai-dien-phong-dao-tao.html`, `quan-tri-vien.html`), không đổi gì khác:

```html
<link rel="icon" type="image/png" sizes="32x32" href="./assets/img/brand/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="./assets/img/brand/favicon-16x16.png" />
<link rel="apple-touch-icon" href="./assets/img/brand/apple-touch-icon.png" />
```

(6 tệp vai trò đang viết HTML trên một dòng — chèn ngay sau thẻ `<meta name="viewport" ...>`.)

### 4.4 Không dùng

Ảnh campus, ảnh sinh viên, minh họa vector, ảnh nền: **không tải, không thêm** (chưa có nguồn được cấp phép, và thiết kế này không phụ thuộc ảnh). Nếu sau này nhóm có ảnh chính thức, vị trí duy nhất dành cho ảnh là nửa trái khung xác thực (7.2) — ngoài phạm vi plan.

Tài liệu tham khảo thêm (chỉ đọc, do nhóm tự mở khi cần): trang nhận diện có "Cẩm nang nhận diện thương hiệu", "Quy định về font chữ", "Bộ logo các đơn vị" trên Google Drive của trường. Nếu "Quy định về font chữ" chỉ định một họ chữ khác Inter cho sản phẩm số, nhóm quyết định; plan này mặc định Inter.

---

## 5. Design token — thay toàn bộ `src/styles/theme.css`

Thay **nguyên tệp** bằng nội dung dưới. Tên token cũ được giữ để không vỡ class đang dùng; chỉ đổi giá trị và thêm token mới (đánh dấu `MỚI`/`ĐỔI`).

```css
@theme {
  /* Font */
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, "SF Mono", "Cascadia Mono", "Segoe UI Mono", Menlo, Consolas, monospace;

  /* Brand — xanh logo IUH (600 = #153898, màu chính thức) — GIỮ NGUYÊN */
  --color-brand-25: #f7f9ff;
  --color-brand-50: #eef3ff;
  --color-brand-100: #dce6ff;
  --color-brand-200: #baccf7;
  --color-brand-300: #8da8ec;
  --color-brand-400: #5b7fdb;
  --color-brand-500: #2f59c4;
  --color-brand-600: #153898;
  --color-brand-700: #102c79;
  --color-brand-800: #0d2463;
  --color-brand-900: #10285e;
  --color-brand-950: #0a1a40;

  /* Ink — xám ánh lam — GIỮ NGUYÊN */
  --color-ink-0: #ffffff;
  --color-ink-25: #fafbfd;
  --color-ink-50: #f4f6fa;
  --color-ink-100: #eceff5;
  --color-ink-200: #e1e6ee;
  --color-ink-300: #cbd3df;
  --color-ink-400: #97a3b6;
  --color-ink-500: #626f85;
  --color-ink-600: #526175;
  --color-ink-700: #3a4659;
  --color-ink-800: #263043;
  --color-ink-900: #182235;

  /* Accent — ĐỔI: vàng logo IUH (500 = #F9B200). Chỉ dùng trên nền xanh. */
  --color-accent-50: #fff8e1;
  --color-accent-100: #ffedb3;   /* MỚI */
  --color-accent-300: #fdcb54;
  --color-accent-400: #fdb726;   /* MỚI — vàng của logo bản trắng */
  --color-accent-500: #f9b200;
  --color-accent-600: #d99a00;   /* MỚI — hover nút accent */
  --color-accent-700: #8a6200;

  /* Semantic */
  --color-success-fg: #166534;
  --color-success-bg: #f0fdf4;
  --color-success-border: #bbf7d0;
  --color-success-solid: #16a34a;

  /* ĐỔI: cam, tách khỏi vàng thương hiệu */
  --color-warning-fg: #9a3412;
  --color-warning-bg: #fff7ed;
  --color-warning-border: #fed7aa;
  --color-warning-solid: #ea580c;

  --color-danger-fg: #b42318;
  --color-danger-bg: #fef3f2;
  --color-danger-border: #fecdd3;
  --color-danger-solid: #dc2626;
  --color-danger-hover: #912018;

  /* ĐỔI: gộp về tông brand */
  --color-info-fg: #102c79;
  --color-info-bg: #eef3ff;
  --color-info-border: #baccf7;
  --color-info-solid: #2f59c4;

  /* ĐỔI: gộp về tông ink */
  --color-neutral-fg: #3a4659;
  --color-neutral-bg: #eceff5;
  --color-neutral-border: #cbd3df;
  --color-neutral-solid: #626f85;

  --color-focus: #2f59c4;        /* ĐỔI */

  /* Thang chữ — ĐỔI theo mục 3.3 */
  --text-display: 2.5rem;
  --text-display--line-height: 3rem;
  --text-display--letter-spacing: -0.02em;
  --text-display--font-weight: 700;
  --text-title-1: 1.5rem;
  --text-title-1--line-height: 2rem;
  --text-title-1--letter-spacing: -0.015em;
  --text-title-1--font-weight: 700;
  --text-title-2: 1.125rem;
  --text-title-2--line-height: 1.625rem;
  --text-title-2--letter-spacing: -0.01em;
  --text-title-2--font-weight: 650;
  --text-title-3: 0.9375rem;
  --text-title-3--line-height: 1.375rem;
  --text-title-3--letter-spacing: -0.005em;
  --text-title-3--font-weight: 600;
  --text-metric: 1.75rem;                    /* MỚI */
  --text-metric--line-height: 2rem;
  --text-metric--letter-spacing: -0.015em;
  --text-metric--font-weight: 650;
  --text-body-lg: 1rem;
  --text-body-lg--line-height: 1.5rem;
  --text-body: 0.875rem;
  --text-body--line-height: 1.375rem;
  --text-body-sm: 0.8125rem;
  --text-body-sm--line-height: 1.25rem;
  --text-caption: 0.75rem;
  --text-caption--line-height: 1rem;
  --text-caption--letter-spacing: 0.01em;
  --text-overline: 0.75rem;                  /* ĐỔI: không còn cỡ lẻ 11.5px */
  --text-overline--line-height: 1rem;
  --text-overline--letter-spacing: 0.04em;
  --text-overline--font-weight: 600;

  /* Bo góc — ĐỔI: gọn hơn */
  --radius-xs: 4px;
  --radius-control: 8px;
  --radius-card: 12px;
  --radius-modal: 16px;

  /* Đổ bóng nhuộm xanh — chỉ cho lớp nổi (mục 3.4) */
  --shadow-hairline: 0 0 0 1px rgb(16 40 94 / 0.06);
  --shadow-raised: 0 1px 2px rgb(16 40 94 / 0.06);
  --shadow-card: 0 1px 2px rgb(16 40 94 / 0.05), 0 4px 12px -4px rgb(16 40 94 / 0.08);
  --shadow-overlay: 0 8px 24px -6px rgb(16 40 94 / 0.16), 0 2px 6px -2px rgb(16 40 94 / 0.08);
  --shadow-modal: 0 24px 48px -12px rgb(10 26 64 / 0.28), 0 8px 16px -8px rgb(10 26 64 / 0.12);
  --shadow-focus: 0 0 0 4px rgb(47 89 196 / 0.2);
  --shadow-bar: 0 -1px 0 rgb(16 40 94 / 0.08), 0 -8px 24px -12px rgb(16 40 94 / 0.16);   /* MỚI: thanh hành động dính đáy */

  /* Chuyển động */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-emphasized: cubic-bezier(0.3, 0, 0, 1.2);

  /* Z-index */
  --z-sticky: 20;
  --z-sidebar: 30;
  --z-dropdown: 40;
  --z-overlay: 50;
  --z-toast: 60;
  --z-skip: 70;
}

:root {
  --duration-fast: 120ms;
  --duration-base: 180ms;
  --duration-slow: 260ms;
}
```

Lưu ý Tailwind v4: token `--text-metric` tự sinh utility `text-metric`; `--shadow-bar` sinh `shadow-bar`; `--color-accent-400` sinh `bg-accent-400`, `text-accent-400`… Không cần khai báo gì thêm.

**Thang khoảng cách** (dùng utility có sẵn, không token mới): trong nhóm `gap-2`/`gap-3`; giữa các trường form `space-y-4`; đệm panel `p-5` (mobile `p-4`); giữa các panel/khối trong trang `space-y-6`; trên một `h2` cách khối trước `mt-8`, dưới nó `mb-3` (khoảng trên tiêu đề luôn lớn hơn khoảng dưới). Lề trang workspace giữ `px-4 sm:px-6 lg:px-8`; bề rộng tối đa giữ `max-w-screen-2xl`; trang form/đọc dùng `max-w-3xl`.

---

## 6. Đặc tả component

Quy ước chung: component mới là **thuần trình bày** (không gọi backend, không đọc `window`), nhận dữ liệu qua props, đặt trong `src/components/`. Mọi `import` trong `.jsx` ghi đủ đuôi tệp như mã hiện tại (`"./Button.jsx"`). Mỗi component tương tác phải có đủ trạng thái: mặc định, hover, focus-visible, active, disabled (và loading nếu là nút).

### 6.1 CSS nền (`base.css`, `components.css`)

**`base.css` — thêm vào trong `@layer base`:**

```css
::selection { background-color: var(--color-brand-100); color: var(--color-brand-900); }
html { caret-color: var(--color-brand-600); accent-color: var(--color-brand-600); scrollbar-color: var(--color-ink-300) transparent; }
h1, h2, h3 { text-wrap: balance; }
p, li, dd { text-wrap: pretty; }
.text-link { color: var(--color-brand-600); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
.text-link:hover { color: var(--color-brand-700); text-decoration-thickness: 2px; }
```

Giữ nguyên mọi thứ khác trong `base.css` (skip-link, focus, reduced-motion, `.on-dark`).

**`components.css` — sửa:**

| Khối | Thay đổi |
|---|---|
| `.ui-card` | Bỏ `box-shadow`. Còn: nền `ink-0`, viền `1px ink-200`, `radius-card`. |
| `.ui-table th` | Bỏ `text-transform: uppercase` và `letter-spacing`; `font-size: 0.8125rem; line-height: 1.25rem; font-weight: 600; color: var(--color-ink-600); height: 40px;` giữ `position: sticky`, nền `ink-25`, viền dưới `ink-200`. |
| `.ui-table td` | `height: 52px` (từ 56). Giữ phần còn lại. |
| `.ui-table tbody tr[data-attention="true"] td:first-child` | **Xóa** quy tắc `box-shadow: inset 2px 0 0 …`. Thay bằng: `.ui-table tbody tr[data-attention="true"] td { background-color: var(--color-warning-bg); }` |
| `.ui-table tbody tr[data-selected="true"] td:first-child` | **Xóa** quy tắc inset stripe (giữ nền `brand-50` của hàng được chọn). |
| `.honor-rule`, `.honor-rule.on-dark` | **Xóa** (sau khi Phase 2 đã gỡ hết chỗ dùng). |
| `.academic-grid` (cả 4 quy tắc) | **Xóa** (sau khi gỡ hết chỗ dùng). |
| `.overlay-backdrop` | Bỏ `backdrop-filter: blur(3px)`; nền `rgb(10 26 64 / 0.5)`. |
| Thêm mới | `.surface { background: var(--color-ink-0); border: 1px solid var(--color-ink-200); border-radius: var(--radius-card); }` và `.action-bar-sticky { position: sticky; bottom: 0; z-index: var(--z-sticky); background: var(--color-ink-0); border-top: 1px solid var(--color-ink-200); box-shadow: var(--shadow-bar); }` |
| `@media print`, mọi `@keyframes`, `.ui-input*`, `.ui-label`, `.collapse-grid`, `.mask-x`, `.overlay-panel`, `.drawer-panel*`, `.popover-in`, `.toast-in`, `.page-in`, `.step-in-*`, `.draw-check` | **Giữ nguyên.** |

Trong `ResponsiveTable.jsx`, thẻ `<li>` mobile đang có `data-[attention=true]:shadow-[inset_3px_0_0_var(--color-warning-solid)]` → đổi thành `data-[attention=true]:bg-warning-bg`.

### 6.2 Primitive hiện có — chỉnh sửa (`src/components/ui/`)

| Tệp | Thay đổi (chỉ `className`/cấu trúc, giữ API) |
|---|---|
| `Button.jsx` | (a) Thêm biến thể **`accent`**: `bg-accent-500 text-brand-950 border border-accent-500 hover:bg-accent-400 hover:border-accent-400 active:bg-accent-600 active:translate-y-px disabled:bg-ink-100 disabled:border-ink-200 disabled:text-ink-400` — chỉ dùng trên nền `brand-600`. (b) `primary`: bỏ inset highlight `shadow-[inset_0_1px_0_…]`, còn `shadow-raised`. `danger`: tương tự. (c) `link`: đổi thành nút chữ có vùng bấm — `bg-transparent text-brand-600 border border-transparent px-2 -mx-2 font-medium hover:bg-brand-50 hover:text-brand-700 active:bg-brand-100 disabled:text-ink-400` (bỏ gạch chân khi hover). Nhờ vậy 30 nút "Xem…" trong bảng tự đồng bộ mà **không phải sửa từng chỗ**. (d) Cỡ `sm`: `h-8` giữ; đảm bảo vùng chạm mobile bằng `max-sm:min-h-10` cho `sm`. |
| `IconButton.jsx` | `md`: `size-9` (36px) thay `size-[34px]`; `sm`: `size-8` thay `size-7` (vùng bấm ≥ 32px desktop). Thêm `max-sm:size-10` cho cả hai. |
| `Display.jsx › CodeTag` | Giữ mono + tabular. `stamp`: `rounded-xs border border-brand-100 bg-brand-50 px-1.5 py-0.5 text-brand-700`; đổi `text-[0.78rem]` → `text-caption` (không còn cỡ tùy ý). |
| `Display.jsx › Avatar` | Nền `bg-brand-600` (thay `brand-900`), bỏ inset shadow; `size 24`: `text-[0.65rem]` → `text-caption`. Luôn `rounded-full`. |
| `Display.jsx › Callout` | **Bỏ viền trái**: xóa `border-l-[3px]` và khóa `bar` trong `calloutTones`. Còn: `flex items-start gap-3 rounded-control border px-4 py-3` + `box` + icon + chữ. Tone mặc định vẫn `info`. Xem quy tắc dùng ở 6.3. |
| `Display.jsx › Capacity` | Giữ. Thanh `h-1.5 w-16`. |
| `Display.jsx › DescriptionList` | `dt`: bỏ `text-overline uppercase`, thay `text-body-sm text-ink-600`. Biến thể `grid`: bỏ nền `ink-25` và lưới viền ô; thành `dl` lưới thoáng `grid gap-x-8 gap-y-4` (giống `plain`) bọc trong `.surface p-5`. `inline` giữ. |
| `Display.jsx › Timeline` | `blockquote`: bỏ `border-l-2`, thay `mt-2 rounded-control bg-ink-50 px-3 py-2 text-body text-ink-700`. Đường nối giữ. Chấm `size-2.5` giữ, `ring-4 ring-white` giữ. |
| `StatusBadge.jsx` | Giữ cấu trúc (chấm + nhãn, `rounded-full`). Màu tự đổi theo token mới. Thêm `font-medium` thay `font-semibold`. |
| `StatCard.jsx` | Viết lại thành **`MetricTile`** (giữ export `StatCard` làm alias để không vỡ `Gallery.jsx`): xem 6.7. |
| `Form.jsx` | `Field`: giữ. `Input` có `locked/readOnly`: giữ. `Checkbox`: ô `rounded-xs`. `RadioCard`: giữ. Không đổi API. |
| `FilterTabs.jsx` | `segmented`: rãnh giữ `rounded-control bg-ink-100 p-0.5`; nút đổi `rounded-[8px]` → `rounded-xs`; nút active giữ `bg-white text-ink-900 shadow-raised`. Bộ đếm active `bg-brand-50 text-brand-700`. Thêm `max-sm:h-10` cho nút. |
| `Stepper.jsx` | Vẽ lại theo ngữ pháp `ProcessTrack` (6.7) nhưng **giữ nguyên props** `steps, current, onStep, canGoTo` và hành vi bấm bước, `aria-current="step"`, `aria-disabled`. Bỏ vòng tròn số 40px + `ring-4`. Bản mobile (thanh mảnh + "Bước x/y" + tên bước) giữ, chỉ bỏ `uppercase tracking-wider` ở dòng "Bước …". |
| `EmptyState.jsx` | Bỏ khối `academic-grid` 96px. Còn: icon 20px trong ô tròn `size-10 rounded-full bg-ink-100 text-ink-500`, tiêu đề `text-title-3`, mô tả `text-body-sm text-ink-600 max-w-[44ch]`, nút phụ nếu có. Đệm `py-10` (compact `py-6`). Thêm prop `description={null}` được phép ẩn mô tả (để dùng với chuỗi rỗng sẵn có mà không thêm câu mới). |
| `Pagination.jsx` | Nền `bg-white` (thay `ink-25`), giữ viền trên. Nút trang hiện tại `bg-brand-600 text-white`. Nút `size-8` → thêm `max-sm:size-10`. |
| `Modal.jsx`, `Drawer.jsx`, `FullscreenDialog.jsx`, `ConfirmDialog.jsx` | Chỉ thừa hưởng token (bo góc, backdrop không blur). Footer `bg-white` (thay `ink-25`), giữ viền trên. **Không đụng** `useDialogA11y`. |
| `Toast.jsx` | **Xóa** `<span … w-[3px] …>` (thanh màu trái) và `pl-5` → `pl-4`. Icon màu theo loại là đủ phân biệt. |
| `FileDropzone.jsx` | Thêm prop `lead = "Kéo thả tệp vào đây hoặc"` (mặc định = chuỗi đang hardcode) để nơi gọi có thể truyền `lead={null}`; khi `null` không render dòng đó. Viền `border border-dashed border-ink-300`, nền `ink-25`, kéo vào: `border-brand-600 bg-brand-25`. `FileItem`: ô icon `bg-brand-50 text-brand-700` (thay đỏ `danger-bg` — đỏ là màu lỗi, không phải "tệp PDF"). |
| `ScoreSummary.jsx` | Xem 7.4 (giữ nguyên mọi chuỗi và phép tính). |
| `Countdown.jsx` | Bỏ `font-mono`; thành `inline-flex items-center gap-1.5 text-body-sm text-ink-700 tabular-nums` kèm icon `Clock` 14px `aria-hidden`. Chuỗi giữ nguyên. |
| `OtpInput.jsx`, `PasswordInput.jsx`, `Tooltip.jsx`, `AwardFields.jsx` | Đọc tệp; chỉ thay class lệch token (bo góc tùy ý `rounded-[..]`, cỡ chữ tùy ý `text-[..]`) bằng token gần nhất. Không đổi hành vi. |

### 6.3 Quy tắc dùng `Callout` (xử lý S1)

`Callout` **chỉ** dành cho *thông điệp* gửi người dùng: lỗi, cảnh báo, hướng dẫn, trạng thái hệ thống. Mỗi lần gặp `<Callout>` trong trang, phân loại theo bảng và chuyển đổi — **chuỗi bên trong giữ nguyên từng ký tự**:

| Callout hiện đang đóng vai | Dấu hiệu nhận biết | Đổi thành |
|---|---|---|
| **Thông điệp thật** | `tone="danger"`/`"warning"`/`"success"`; hoặc nội dung là câu hướng dẫn/giải thích ("Danh sách hiển thị tối thiểu để…", "Không tìm thấy…", "Không có quyền…", yêu cầu bổ sung, "ĐXT đã công bố và bất biến") | Giữ `Callout` (đã bỏ viền trái). |
| **Số liệu** | `title` chứa con số nội suy: `` `${n} hồ sơ chờ duyệt` ``, `` `Tổng hồ sơ: ${n}` ``, `` `Điểm tự khai: ${n}` ``, `` `Điểm chính thức: ${n}` `` | `MetricTile` hoặc hàng trong `Panel` (xem từng trang ở mục 7). Số và nhãn tách thành hai phần tử nhưng **thứ tự đọc và từng chữ giữ nguyên**. |
| **Thẻ danh tính** | `title={user.fullName}` / `title={me.fullName}` / `title={verified?.profile?.fullName}` + dòng phụ là mã/email/lớp | `IdentityHeader` (6.7): Avatar + tên + dòng phụ. |
| **Nhóm liệt kê** | `title="Theo luồng"`, `"Theo trạng thái"`, `"Giờ mô phỏng (GMT+7)"`, `` `Phiên bản dữ liệu: …` `` + nhiều dòng con | `Panel` có `title` = chuỗi title cũ, nội dung là `dl`/danh sách. |
| **Trạng thái tải / lỗi toàn trang** | `<Callout>Đang tải…</Callout>`, `<Callout tone="danger">Không tìm thấy trang.</Callout>` trong `App.jsx`/`AuthGate.jsx` | `StatePage` (6.7): khối căn giữa, icon + chuỗi cũ. |

### 6.4 `DataList` (`features/shared/FeatureKit.jsx`) — nâng một lần, 20 màn hình hưởng lợi

Giữ nguyên chữ ký `DataList({ rows, columns, actions, caption = "Danh sách", search = true })`, giữ nguyên logic `usePagedFilter` và hàm `match` (tìm trên `JSON.stringify`), giữ `rowKey`. Thay phần render:

1. **Bọc toàn bộ trong `TablePanel`**; ô tìm kiếm chuyển vào *bên trong* panel làm thanh công cụ (dải `border-b border-ink-200 p-3`): input có icon `Search` bên trái (`Input leadingIcon={Search}` đã hỗ trợ), `type="search"`, bề rộng `w-full sm:max-w-sm`. Nhãn `` `Tìm kiếm ${caption.toLowerCase()}` `` **vẫn tồn tại** dưới dạng `aria-label` của input **và** `placeholder` (cùng chuỗi đó — không thêm chữ mới). Bỏ `Field` nhãn rời phía trên.
2. Nếu có thanh công cụ, hiển thị số bản ghi bằng `Pagination` sẵn có (không thêm dòng đếm mới).
3. **Cột "Thao tác"**: thêm `align: "right"` và `className: "whitespace-nowrap"`; nội dung bọc `div.flex.justify-end.gap-1`. Header giữ chuỗi `"Thao tác"`.
4. Cho phép cột truyền thêm `align`, `width`, `hideBelow`, `className` (đã được `ResponsiveTable` hỗ trợ — chỉ cần không lọc mất).
5. **Rỗng**: thay `<p className="p-6 …">Không có dữ liệu phù hợp.</p>` bằng `<EmptyState compact title="Không có dữ liệu phù hợp." description={null} />` (cùng chuỗi, không thêm mô tả).
6. **Thẻ mobile**: `dl` hai cột `grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5`; `dt` = `c.header` (`text-body-sm text-ink-600`, bỏ dấu ":" bằng cách vẫn in `{c.header}` rồi dùng CSS — **không** xóa ký tự khỏi chuỗi nguồn; đơn giản nhất là giữ nguyên `{c.header}:` như cũ), `dd` = `c.cell(r)`; dải hành động `flex flex-wrap gap-2 pt-3 mt-3 border-t border-ink-200`.
7. `search={false}` → không render thanh công cụ.

`FormDialog`: chuyển hai nút "Hủy"/"Xác nhận" xuống `footer` của `Modal` (liên kết bằng `form={formId}` trên nút submit, `id={formId}` trên `<form>`, dùng `useId`). Nếu `children` của FormDialog có chứa nút riêng thì giữ nguyên vị trí của chúng. Lưới trường: khi `fields.length > 4` dùng `grid gap-4 sm:grid-cols-2` (textarea và trường có `hint` dài chiếm `sm:col-span-2`); ngược lại một cột.

### 6.5 Shell workspace (`components/layout/`, `app/WorkspaceLayout.jsx`)

**`Sidebar.jsx`**

- Nền `bg-brand-600`, viền phải `border-brand-700`. Chữ trắng.
- `SidebarBrand`: bỏ `academic-grid`, bỏ `honor-rule`, bỏ hộp trắng. Logo: `import logoWhite from "../../../assets/img/brand/iuh-logo-white.svg"`; `<img src={logoWhite} alt="IUH" className="h-10 w-auto" />` trong link `href="#/"` `aria-label="Về trang chủ"` (chuỗi cũ), đệm `px-5 pt-5 pb-4`. Khi `collapsed`: logo ngang không vừa 72px → hiển thị trong khung `size-10 overflow-hidden` căn trái để chỉ lộ phần biểu tượng (`object-cover object-left`, `h-10 w-[112px] max-w-none` đặt trong wrapper `w-10 overflow-hidden`). Kiểm tra bằng mắt; nếu biểu tượng bị cắt xấu, dùng `favicon-32x32.png` cho trạng thái thu gọn.
- Khối vai trò (khi không collapsed): `px-5 pb-4`; nhãn vai trò `text-body-sm font-semibold text-white` (bỏ `uppercase`, bỏ `text-overline`); phạm vi `text-body-sm text-brand-200` (thay `white/70`; `#baccf7` trên `#153898` ≈ 6.3:1). Ngăn cách với nav bằng `border-b border-white/10`.
- `SidebarNav` — mục menu: `min-h-10 rounded-control px-3 gap-3 text-body-sm`.
  - Thường: `font-medium text-brand-100 hover:bg-white/10 hover:text-white`; icon `text-brand-200`.
  - **Đang chọn: `bg-white text-brand-700 font-semibold`**, icon `text-brand-600`. **Bỏ** thanh dọc `before:` 3px. (Viên trắng trên rail xanh: rõ, không cần sọc.)
  - Focus: giữ lớp `on-dark` (outline trắng).
- Nút "Thu gọn" và tay kéo đổi độ rộng: giữ hành vi; đổi màu tương ứng (`text-brand-100 hover:bg-white/10`; vạch kéo `group-hover:bg-white/40`, kéo/focus `bg-accent-400`).
- **Bản đồ icon** (`menuIcons`) mở rộng để mỗi mục một icon riêng. Trong `app/menus.js` **chỉ được sửa phần tử thứ ba** (iconKey) của mỗi mục; id và nhãn giữ nguyên:

| Trang (`id`) | iconKey mới | Icon lucide |
|---|---|---|
| `dashboard` | `dashboard` | `LayoutDashboard` |
| `catalog` | `catalog` | `Network` |
| `programs` | `book` | `BookOpen` (giữ) |
| `classes` | `class` | `GraduationCap` (giữ) |
| `lecturers` | `teacher` | `UserCog` (giữ) |
| `students`, `records` | `users` | `Users` (giữ) |
| `permissions` | `permission` | `ShieldCheck` (giữ) |
| `rounds`, `open-rounds` | `calendar` | `CalendarCheck` (giữ) |
| `criteria` | `criteria` | `ClipboardList` (giữ) |
| `reviews` | `approve` | `ClipboardCheck` (giữ) |
| `approvals` | `stamp` | `Stamp` |
| `reports` | `report` | `ChartColumn` |
| `audit` | `audit` | `ScrollText` |
| `email-outbox` | `mail` | `Mail` |
| `settings` | `settings` | `Settings` |
| `notifications` | `bell` | `Bell` |
| `student-passwords` | `key` | `KeyRound` (giữ) |
| `my-applications`, `maintenance` | `file` | `FileText` (giữ) |
| `profile` | `profile` | `UserRound` |

  Tất cả tên icon trên đã được xác nhận tồn tại trong `lucide-react` đang cài. Mục `maintenance` được chèn động trong `WorkspaceLayout.jsx` với iconKey `"file"` — giữ. Giữ fallback `|| BookOpen`.

**`WorkspaceHeader.jsx`**

- Một hàng, cao `h-14` (56px), `flex-nowrap`: nền `bg-white`, viền dưới `border-ink-200`, **bỏ** nhánh `scrolled` (blur). `sticky top-0 z-20` giữ.
- Trái: nút menu mobile (giữ) + breadcrumb (giữ 3 cấp và chuỗi; `text-body-sm`; cấp cuối `font-medium text-ink-900`). Trên mobile giữ `activeLabel` rút gọn.
- Phải: `RoleSwitcher` · `NotificationBell` · menu tài khoản (giữ toàn bộ logic bàn phím/ARIA, chuỗi, thứ tự mục).
- Menu tài khoản: popover `rounded-card border border-ink-200 shadow-overlay`; mục `min-h-10`.

**`RoleSwitcher.jsx`** — giữ logic. Trình bày: bỏ `Field` nhãn-trên; thành `label` nội tuyến: `<label className="flex items-center gap-2">` + `<span className="hidden xl:inline text-body-sm text-ink-600">Vai trò đang làm việc</span>` + `<Select aria-label="Vai trò đang làm việc" className="h-9 min-h-9 max-w-64" …>`. Dưới `xl` nhãn chỉ còn là `aria-label` (cùng chuỗi). Nhánh một vai trò (`<span>` nhãn vai trò): ẩn dưới `md`.

**`NotificationBell.jsx`** — giữ logic đóng/mở, `call("me.markRead")`, `navigate`. Trình bày: nút icon `Bell` (`IconButton`-style `size-9`, `variant` secondary) với **`aria-label={`Thông báo (${n})`}`** (đúng chuỗi đang hiển thị) và huy hiệu số `n` ở góc trên phải khi `n > 0` (`min-w-4 h-4 rounded-full bg-danger-solid text-white text-caption font-semibold tabular-nums`, `aria-hidden`). Giữ `aria-expanded`. Popover: `w-80`, `p-1.5`; mỗi mục là nút `rounded-control px-3 py-2.5 text-left hover:bg-ink-50` có chấm `size-2 rounded-full bg-brand-600` khi chưa đọc (`!n.readAt`) và tiêu đề `font-semibold` khi chưa đọc; bỏ `border-b` từng mục; "Xem tất cả" nằm ở chân, ngăn bằng `border-t`.

**`WorkspaceLayout.jsx`** — chỉ sửa JSX trình bày:

- Xóa `<span className="honor-rule …">` trên H1. H1: `className="text-title-1 text-ink-900 outline-none"`; giữ `data-page-heading`, `tabIndex={-1}`.
- Drawer mobile: wrapper `bg-brand-600` (thay `brand-900`).
- `<main>`: `space-y-6`, `pt-6 pb-24` giữ.
- Không đụng logic `menus`, `label`, `go`, `useEffect`.

**`PageHeader.jsx`** — hiện không trang nào dùng. Sửa cho sạch (bỏ `honor-rule`, bỏ eyebrow in hoa, bỏ `max-sm:text-[1.5rem]…` vì `title-1` đã là 1.5rem) và để yên; **không** đưa vào trang (sẽ tạo H1 thứ hai).

### 6.6 Nút mở Demo (`features/demo/DemoPanel.jsx`)

Nút "Bảng điều khiển demo" đang `fixed bottom-4 left-4` — đè lên nút "Thu gọn" của sidebar. Đổi thành `fixed bottom-4 right-4 z-40` (giữ `shadow-overlay`, giữ chuỗi, giữ luôn-render vì `verify-render` cần chuỗi này). Trên trang có thanh hành động dính đáy (7.4, 7.5) nút vẫn nằm trên thanh nhờ `z-40 > z-sticky(20)`; thanh hành động thêm `pr-48` ở ≥ sm hoặc đặt nút chính bên trái cụm phải để không bị che — kiểm tra bằng mắt ở 1440/1024/390.

Nội dung Drawer demo: áp quy tắc 6.3 cho các Callout "Giờ mô phỏng (GMT+7)", "Dùng để đăng ký mới", "Phiên bản dữ liệu…" → `Panel`. Tệp này bị test cấm hex và `text-[..px]`.

### 6.7 Component mới

Tạo đúng các tệp sau. Tất cả không có chuỗi hiển thị cứng (mọi nhãn đến từ props).

**(1) `src/components/ui/Panel.jsx`** — khung phần nội dung chuẩn, thay cho mọi `rounded-card border border-ink-200 bg-white p-4/p-5` viết tay.

```jsx
// Props: title?, titleAs = "h2" | "h3", description?, actions?, footer?, padded = true, className = "", children, ...rest
// Cấu trúc:
// <section className={`surface ${className}`} {...rest}>
//   {(title || actions) && (
//     <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3">
//       <div className="min-w-0">
//         <Tag className="text-title-3 text-ink-900">{title}</Tag>
//         {description && <p className="mt-0.5 text-body-sm text-ink-600">{description}</p>}
//       </div>
//       {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
//     </header>
//   )}
//   <div className={padded ? (title ? "px-5 pb-5" : "p-5") : ""}>{children}</div>
//   {footer && <footer className="border-t border-ink-200 px-5 py-3">{footer}</footer>}
// </section>
```

Không lồng `Panel` trong `Panel`. Bên trong panel, nhóm con phân tách bằng `border-t border-ink-200 pt-4 mt-4` hoặc nền `bg-ink-25 rounded-control p-3`.

**(2) `src/components/ui/ProcessTrack.jsx`** — chữ ký thị giác.

```jsx
// Props:
//   steps: [{ key, label, meta?, state: "done" | "current" | "todo" }]
//   size: "sm" | "md" (mặc định "md")
//   showLabels: boolean (mặc định true)
//   label: string — aria-label của danh sách (bắt buộc khi showLabels=false thì truyền aria-hidden qua prop decorative)
//   decorative: boolean — true => aria-hidden toàn khối (khi thông tin đã có ở chỗ khác, vd. StatusBadge bên cạnh)
// Cấu trúc (md):
// <ol aria-label={label} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
//   <li key aria-current={state === "current" ? "step" : undefined} className="min-w-0">
//     <span aria-hidden className={`block h-1.5 rounded-full ${state === "todo" ? "bg-ink-200" : "bg-brand-600"}`} />
//     {showLabels && <span className={`mt-2 block text-body-sm ${state === "current" ? "font-semibold text-ink-900" : state === "done" ? "text-ink-700" : "text-ink-500"}`}>{label}</span>}
//     {showLabels && meta && <span className="block text-caption text-ink-600 tabular-nums">{meta}</span>}
//   </li>
// </ol>
// size "sm": thanh h-1, gap-1, không nhãn (dùng trong hàng danh sách, thường decorative).
// Đoạn "current" khác "done" bằng nhãn đậm; thêm chấm tròn 8px bg-brand-600 ring-2 ring-white ở đầu phải thanh current (absolute) để phân biệt không chỉ bằng màu.
// Dưới 640px với showLabels: chỉ hiện nhãn của bước current (các nhãn khác sr-only) để không tràn.
```

`style` nội tuyến cho `gridTemplateColumns` là được phép (không phải màu/cỡ chữ).

**(3) `src/components/domain-ui/RoundTrack.jsx`**

```jsx
// Props: status (khóa của ROUND_STATUSES), size, showLabels, decorative
// const ORDER = ["upcoming", "open", "review", "approving", "published"];
// Nhãn: ROUND_STATUSES[key].label (import từ "../../domain/constants.js" — chỉ đọc).
// state: index < idx => "done"; === idx => "current"; > idx => "todo". status "draft" (idx = -1) => mọi bước "todo".
// aria-label danh sách: "Trạng thái ĐXT" (chuỗi đã có trong PublicHome).
```

Không tự suy diễn trạng thái từ ngày tháng — chỉ dùng `round.status` (logic nằm ở domain).

**(4) `src/components/ui/MetricTile.jsx`** (và `StatCard.jsx` export lại: `export { MetricTile as StatCard } from "./MetricTile.jsx";`)

```jsx
// Props: value, label, action?, children?, className
// <div className="surface flex flex-col gap-1 p-4">
//   <p className="flex items-baseline gap-2">
//     <span className="text-metric tabular-nums text-ink-900">{value}</span>
//     <span className="text-body text-ink-700">{label}</span>
//   </p>
//   {children && <div className="text-body-sm text-ink-600">{children}</div>}
//   {action && <div className="mt-auto pt-2">{action}</div>}
// </div>
```

Số đứng trước nhãn trên cùng một dòng đọc → "6 hồ sơ chờ duyệt" vẫn đọc đúng như chuỗi cũ. Không icon trang trí, không màu nhấn, không sparkline.

**(5) `src/components/ui/IdentityHeader.jsx`**

```jsx
// Props: name, meta (node), aside? (node bên phải, vd. StatusBadge), size = 40
// <div className="flex items-center gap-3">
//   <Avatar name={name} size={size} round />
//   <div className="min-w-0 flex-1">
//     <p className="truncate text-title-3 text-ink-900">{name}</p>
//     {meta && <p className="text-body-sm text-ink-600 break-words">{meta}</p>}
//   </div>
//   {aside}
// </div>
```

**(6) `src/components/ui/StatePage.jsx`** — trạng thái toàn trang (không quyền, không tìm thấy, đang tải).

```jsx
// Props: tone = "neutral" | "danger", icon?, title?, children, action?
// <div role={tone === "danger" ? "alert" : "status"} className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
//   <span className={`mb-4 flex size-12 items-center justify-center rounded-full ${tone === "danger" ? "bg-danger-bg text-danger-fg" : "bg-ink-100 text-ink-600"}`}><Icon size={22} aria-hidden /></span>
//   {title && <h2 className="text-title-2 text-ink-900">{title}</h2>}
//   <div className="mt-1 text-body text-ink-600">{children}</div>
//   {action && <div className="mt-5">{action}</div>}
// </div>
// Icon mặc định: tone danger => ShieldAlert; neutral => Loader2 (không animate) hoặc Info.
```

**(7) `src/components/layout/ActionBar.jsx`** — hàng nút cấp trang/khối.

```jsx
// Props: children, sticky = false, start? (node bên trái), className
// <div className={`${sticky ? "action-bar-sticky -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" : ""} flex flex-wrap items-center justify-between gap-3 ${className}`}>
//   <div className="flex min-w-0 flex-wrap items-center gap-2">{start}</div>
//   <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>
// </div>
```

Quy ước thứ tự nút trong cụm phải: phụ trước, **nút chính ngoài cùng bên phải**; nút nguy hiểm (`dangerOutline`) đặt ở `start` (bên trái), tách khỏi nút chính. Chỉ *sắp lại vị trí*; nhãn, `variant` ngữ nghĩa, `disabled`, `loading`, `onClick` giữ nguyên.

**(8) `src/components/layout/PublicShell.jsx`** — khung trang công khai phụ (kết quả, tra cứu, chi tiết đợt).

```jsx
// Props: children, width = "max-w-5xl"
// <div className="min-h-screen bg-ink-50">
//   <PublicHeader onOpenLogin={() => navigate("/dang-nhap")} />
//   <main className={`mx-auto ${width} space-y-6 px-4 py-8 sm:px-6 lg:px-8`}>{children}</main>
// </div>
```

**(9) `src/components/layout/AuthShell.jsx`** — khung trang xác thực (7.2).

Cập nhật `src/dev/Gallery.jsx` để hiển thị thêm `Panel`, `ProcessTrack`, `MetricTile`, `IdentityHeader`, `StatePage`, nút `accent` (trên nền `brand-600`) — Gallery là công cụ dev, được phép có nhãn mô tả riêng.

---

## 7. Đặc tả từng màn hình

Ký hiệu: **[GIỮ]** = chuỗi/logic không đổi; mọi đoạn dưới đây chỉ mô tả *bố cục và lớp trình bày*.

### 7.1 Trang chủ công khai — `features/public/PublicHome.jsx`

Tệp này bị test cấm hex và `text-[Npx]`; HTML SSR không được chứa `closed`.

1. **Header** (`PublicHeader.jsx`): nền trắng đặc, viền dưới `ink-200`; **bỏ** `backdrop-blur-md` và nền `white/90`; khi cuộn chỉ thêm `shadow-raised` và giảm cao 72→60 (giữ logic). Logo khoa [GIỮ]. Đổi các chiều cao tùy ý `h-[60px]`/`h-[72px]` → `h-15`/`h-18` (Tailwind v4 nhận số bất kỳ theo bội 4px) và `max-w-[1200px]` → `max-w-6xl` cho thẳng hàng với nội dung. Nút "Đăng nhập" [GIỮ] `primary`.
2. **Hero**: `<section className="bg-brand-600 text-white">` — **bỏ** `academic-grid`, **bỏ** `honor-rule`. Bên trong `mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-6 lg:px-8`:
   - Dòng "CHƯƠNG TRÌNH CỬ NHÂN & KỸ SƯ TÀI NĂNG" [GIỮ chuỗi]: `text-body-sm font-semibold text-accent-400` (bỏ lớp `text-overline`; chuỗi vốn in hoa trong nguồn nên giữ nguyên). Đây là ngoại lệ có chủ đích: nội dung hiện hữu thắng quy tắc "không kicker".
   - H1 "Các đợt xét tuyển": `mt-2 text-title-1 sm:text-display`; [GIỮ] `data-page-heading tabIndex={-1}`.
   - Đoạn dẫn: `mt-3 max-w-2xl text-body-lg text-brand-100`.
   - Hàng tìm kiếm: `mt-6 flex flex-col gap-3 sm:flex-row sm:items-end`: `Field` tìm kiếm [GIỮ nhãn + placeholder], `className="sm:max-w-xl sm:flex-1"`, nhãn trắng (`labelClassName="!text-white"` đang có), `Input leadingIcon={Search}` cao `h-11`; nút **"Tra cứu kết quả"** đổi `variant="accent"` `size="md"` cao bằng input (`h-11`). [GIỮ] `onClick={onLookup ?? onLogin}`.
3. **Thanh lọc nổi**: ngay sau hero, `<main id="dot-xet-tuyen" …>` có khối đầu là `Panel` (không title) kéo lên đè hero: `className="-mt-12 relative"`; bên trong: `FilterTabs` trạng thái [GIỮ options] ở trên, lưới 3 select "Năm học / Học kỳ / Khoa" [GIỮ] ở dưới (`grid gap-4 sm:grid-cols-3`, ngăn bằng `border-t border-ink-200 pt-4 mt-4`).
4. Dòng `{list.total} đợt xét tuyển phù hợp` [GIỮ `role="status"`]: `text-body-sm text-ink-600`.
5. **Danh sách đợt = hàng, không phải lưới thẻ** (xử lý S8). Thay `div.grid.lg:grid-cols-2` bằng `ul.surface.divide-y.divide-ink-200` (một bề mặt, mỗi đợt một `li`). Mỗi `li` vẫn là `<article>` bên trong với đúng các phần tử cũ, sắp theo lưới `grid gap-4 p-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto] lg:items-center`:
   - **Cột 1 — định danh:** hàng `CodeTag` + `StatusBadge` (cạnh nhau, `gap-2`); `h2` tên đợt `mt-2 text-title-2`; `typeLabel` `text-body-sm font-medium text-brand-700`; dòng lớp · chương trình · khoa và dòng "Năm học … · …" `text-body-sm text-ink-600`.
   - **Cột 2 — tiến trình & mốc:** `<RoundTrack status={r.status} size="sm" showLabels={false} decorative />` rồi hai dòng có icon [GIỮ]: "Tiếp nhận: … – …" (`CalendarClock`), "Sĩ số tối đa: …" (`Users`); icon `text-ink-500` 16px (bỏ màu brand cho icon phụ), số `tabular-nums`.
   - **Cột 3 — hành động:** `flex flex-wrap gap-2 lg:justify-end`; [GIỮ] toàn bộ điều kiện và nhãn ("Xem chi tiết", "Nộp hồ sơ"/"Cập nhật hồ sơ tích lũy", "Xem kết quả", câu "Bạn đang học lớp CN/KSTN khác."). Thứ tự DOM giữ; nút chính hiển thị bên phải bằng `lg:flex-row` (thứ tự hiện tại đã là phụ → chính).
6. Rỗng: `<EmptyState title="Không có ĐXT phù hợp. Vui lòng đổi bộ lọc." description={null} icon={SearchX} />` bên trong `.surface` (chuỗi cũ nguyên văn làm `title`).
7. `Pagination` [GIỮ] đặt trong cùng `.surface` (bo góc dưới).
8. Footer [GIỮ chuỗi]: `border-t border-ink-200 mt-10`, `py-6`, `text-body-sm text-ink-600`, cùng `max-w-6xl` và lề với nội dung.
9. Modal chi tiết (`selected`) [GIỮ]: sắp lại — `DescriptionList columns={3}` → `RoundTrack status={selected.status}` (đầy đủ nhãn) → mô tả → `CriteriaTable` trong `.surface overflow-hidden` → dòng ghi chú minh chứng.

### 7.2 Xác thực — `features/auth/AuthPages.jsx` + `layout/AuthShell.jsx`

`AuthShell` (props: `title`, `children`, `footer`, `forced`):

```text
≥ lg:  ┌──────────────── 5/12 ────────────────┬──────────────── 7/12 ────────────────┐
       │ nền brand-600, chữ trắng, min-h-screen│ nền ink-50                            │
       │  [iuh-logo-white.svg h-12]            │   ┌─ khối form max-w-md, căn giữa ──┐ │
       │                                       │   │ ← Về trang chủ                  │ │
       │  (đáy) hai dòng chuỗi SẴN CÓ:         │   │ H1 {title}                      │ │
       │  "Cổng thông tin xét tuyển chương     │   │ {message / error Callout}       │ │
       │   trình Cử nhân tài năng & Kỹ sư      │   │ Panel: form                     │ │
       │   tài năng"  (text-title-2)           │   │ {footer: 3 liên kết}            │ │
       │  "Trường Đại học Công nghiệp Thành    │   └─────────────────────────────────┘ │
       │   phố Hồ Chí Minh · Khoa Công nghệ    │                                       │
       │   Thông tin" (text-body-sm brand-100) │                                       │
       └───────────────────────────────────────┴───────────────────────────────────────┘
< lg:  dải brand-600 cao 64px chứa logo trắng (h-8) ở trên; form bên dưới, px-4 py-8.
```

- Hai dòng chữ ở cột trái là **chuỗi đã tồn tại** trong `PublicHeader.jsx` (sao chép nguyên văn; không viết thêm câu nào). Không ảnh, không họa tiết, không gradient — một mặt phẳng xanh thương hiệu với logo chính thức.
- Khi `forced` (đổi mật khẩu bắt buộc) hoặc route `#/app/doi-mat-khau` render **bên trong workspace** (qua `WorkspacePage`), trang hiện có hai H1 (một của shell, một của `AuthPage`). Cách xử lý: `AuthPage` nhận thêm prop tùy chọn `embedded` (mặc định `false`); `App.jsx › WorkspacePage` truyền `embedded` ở nhánh `page === "doi-mat-khau"` (đây là thay đổi trình bày duy nhất được phép trong `App.jsx`). `embedded` → không dùng `AuthShell`, không render H1 riêng (workspace đã có H1 "Đổi mật khẩu"), chỉ render form trong `Panel` `max-w-xl`. Nhánh `forced` từ `AuthGate` → dùng `AuthShell` đầy đủ.
- Trong `AuthPage` (không embedded): thay `<section className="mx-auto max-w-xl …">` bằng `<AuthShell title={title} footer={…}>`; xóa `honor-rule`; link "Về trang chủ" [GIỮ] thành `inline-flex items-center gap-1.5 text-body-sm font-medium text-brand-600 hover:text-brand-700` + icon `ArrowLeft` 14px `aria-hidden`.
- H1 [GIỮ `data-page-heading tabIndex={-1}`] `text-title-1`.
- Form: `Panel` (`space-y-5`); nút submit `fullWidth size="lg"`; [GIỮ] nhãn nút theo từng bước, `disabled`, `loading`.
- Đăng ký: `Stepper` (ngữ pháp ProcessTrack) ở đầu panel, ngăn `border-b border-ink-200 pb-5`. Bước 3: `<Callout title={fullName}>{dob} · {homeClass}</Callout>` → `IdentityHeader name=… meta=…` trong khối `rounded-control bg-ink-25 p-3`. `Countdown` đặt cùng hàng với nhãn OTP (phải). Nút "Yêu cầu mã mới" [GIỮ] `variant="tertiary"`.
- Ba liên kết chân ("Đăng nhập", "Đăng ký bằng email IUH", "Quên mật khẩu?") [GIỮ href]: hàng `flex flex-wrap gap-x-5 gap-y-2 text-body-sm`, lớp `.text-link`.
- `AuthGate.jsx`: "Vui lòng đăng nhập" → `StatePage title="Vui lòng đăng nhập"` với liên kết [GIỮ] `.text-link`; "Không có quyền truy cập" → `StatePage tone="danger" title=… ` + câu mô tả [GIỮ].
- `App.jsx`: ba `Callout` trạng thái ("Đang tải màn hình vận hành…", "Không tìm thấy trang." ×2 kèm "Vui lòng kiểm tra đường dẫn.") → `StatePage` tương ứng (chuỗi nguyên văn). Không đổi gì khác trong `App.jsx` ngoài hai điểm đã nêu.

### 7.3 Dashboard — `features/dashboard/Dashboard.jsx`

[GIỮ] toàn bộ tính toán `rounds`, `pending`, `lists`, `upcoming` và điều kiện hiển thị.

1. **"Việc cần làm"** (`h2` [GIỮ]): lưới `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` các `MetricTile`:
   - `value={pending.length}` `label="hồ sơ chờ duyệt"` `action=` nút [GIỮ điều kiện] "Đi tới duyệt hồ sơ" (`variant="link"` + `iconRight={ArrowRight}`).
   - `value={lists.length}` `label="danh sách chờ bạn"` → "Xử lý danh sách".
   - (ADMIN) `value={failedCount}` `label="email lỗi"` → "Xem hàng đợi".
   Chuỗi nhãn là phần đuôi của template cũ (`"hồ sơ chờ duyệt"`, `"danh sách chờ bạn"`, `"email lỗi"`) — cắt đúng tại dấu cách sau số, không sửa chữ.
2. **Đếm ĐXT theo trạng thái** (6 Callout hiện tại) → **một** `Panel` (không title) chứa lưới 6 cột theo đúng thứ tự `Object.entries(ROUND_STATUSES)`: `grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 xl:grid-cols-6`; mỗi ô: thanh `h-1.5 rounded-full` (ô có số > 0: `bg-brand-600`; = 0: `bg-ink-200`), bên dưới `m.label` (`text-body-sm text-ink-600`) và `{n} ĐXT` (`text-title-2 tabular-nums text-ink-900`; chữ "ĐXT" `text-body-sm font-normal text-ink-600`). Đây là `ProcessTrack` ở dạng thống kê — cùng ngữ pháp thanh đoạn.
3. **"Mốc sắp tới trong 7 ngày"** (`h2` [GIỮ], `mt-8`): `DataList` [GIỮ cột, hành động "Xem"]; cột "Thời gian" thêm `className: "tabular-nums whitespace-nowrap"`.

### 7.4 Cổng sinh viên — `features/student-portal/StudentPortal.jsx`

**A. `ApplicationForm` (wizard nộp hồ sơ)** — [GIỮ] mọi state, `editable`, `score`, handler, hai `ConfirmDialog`, `Drawer` xem minh chứng.

- **Khối đầu trang** → `Panel` không title: hàng 1 `flex flex-wrap items-start justify-between gap-3`: trái `h2` tên đợt (`text-title-2`) + dòng `{FLOW_LABEL} · Hạn tiếp nhận: …` (`text-body-sm text-ink-600`); phải `StatusBadge` + `Countdown` (xếp dọc, căn phải ở ≥ sm). Hàng 2 (ngăn `border-t pt-4 mt-4`): `Stepper` [GIỮ steps/onStep].
- Các `Callout` kết quả công bố ("Điểm chính thức: …"), yêu cầu bổ sung, lỗi: đặt **giữa** khối đầu và nội dung, theo 6.3: "Điểm chính thức" là số liệu → `Panel` nhỏ với `MetricTile`-style một dòng: nhãn `Điểm chính thức:` + giá trị `text-metric` + `decisionNote` bên dưới; "Yêu cầu bổ sung trước …" và lỗi → giữ `Callout` (thông điệp thật).
- **Thân**: [GIỮ] lưới `xl:grid-cols-[minmax(0,1fr)_280px]` → đổi cột phải thành `320px`, `gap-6`.
  - Bước 0: `DescriptionList` (đã restyle) + hai `Field` trong lưới `sm:grid-cols-2`, tất cả trong một `Panel`.
  - Bước 1: mỗi `CriterionField` là một `Panel` (xem C).
  - Bước 2: `Callout title={`Điểm tự khai: …`}` → khối tóm tắt trong `Panel`: dòng `Điểm tự khai:` + số `text-metric`; hai câu mô tả [GIỮ] bên dưới (`text-body text-ink-700`); câu "Đạt các tiêu chí BB theo tự khai." kèm icon `CircleCheck` `text-success-solid`, câu "Còn tiêu chí BB chưa đạt." kèm `CircleAlert` `text-warning-solid` (icon `aria-hidden`). `Checkbox` cam kết [GIỮ] trong khối `rounded-control border border-ink-200 p-4`.
- **Thanh hành động** → `ActionBar sticky`: `start` = nút nguy hiểm [GIỮ điều kiện] "Rút hồ sơ" / "Hủy nháp" + dòng trạng thái lưu (`aria-live` [GIỮ]: "Có thay đổi chưa lưu" / `saved`) ; cụm phải theo thứ tự: "Quay lại" (secondary) · "Lưu nháp"/"Lưu chỉnh sửa" (secondary) · "Tiếp tục" hoặc "Nộp hồ sơ chính thức"/"Gửi bổ sung" (primary, ngoài cùng phải). Mọi điều kiện `{step > 0 && …}`, `disabled`, `loading`, `onClick` [GIỮ]. Trên mobile nút co giãn `flex-1`.
- Cột phải: `ScoreSummary` `xl:sticky xl:top-20` (dưới header 56px + 24px).

**B. `ScoreSummary.jsx`** — [GIỮ] mọi chuỗi và phép tính. Bố cục `Panel title="Điểm dự kiến" titleAs="h3"`: số tổng `text-metric`; dòng `BB đạt x/y` ngay dưới (`text-body-sm text-ink-600`); danh sách tiêu chí `ul divide-y divide-ink-200 mt-3`: mỗi dòng `flex items-start gap-2 py-2 text-body-sm` — icon trạng thái (`Check` `text-success-solid` nếu `r.met`, `Minus` `text-ink-400` nếu không; `aria-hidden`) + văn bản [GIỮ nguyên template `{r.name}: {r.points} điểm · {Đạt|Chưa đạt}`]; chú thích cuối `text-caption text-ink-600` (đổi từ `ink-500` để đủ tương phản).

**C. `CriterionField.jsx`** — [GIỮ] toàn bộ logic `change`, điều kiện, chuỗi.

- Bọc `Panel`: tiêu đề `h3` = tên tiêu chí; phần `{BB|UT} · {unit}` tách thành badge cạnh tiêu đề: `BB` → `rounded-full bg-brand-50 text-brand-700 px-2 text-caption font-semibold`, `UT` → `bg-ink-100 text-ink-700`; đơn vị `text-body-sm text-ink-600` (ký tự "·" giữ).
- "Mức điểm: …" và `evidenceGuide`: khối `rounded-control bg-ink-25 px-3 py-2 text-body-sm text-ink-700`.
- Khối từng thành tích (`ACCUMULATIVE_ENUM`): **bỏ** `border-l-2 border-brand-200 pl-3` → `rounded-control border border-ink-200 p-4 space-y-3`; hai `Field` "Tên thành tích n"/"Mức giải" trong `grid gap-3 sm:grid-cols-2`; nút "Xóa thành tích" [GIỮ] căn phải cuối khối, `size="sm"`.
- Nút "Thêm thành tích" [GIỮ] `variant="secondary"` + `icon={Plus}`.
- Tệp chỉ đọc (`readOnly`): các nút tên tệp `variant="link"` → hiển thị dạng danh sách dọc, mỗi dòng icon `FileText` 14px + tên (vẫn là `Button variant="link"`, [GIỮ `onClick`]).
- Cảnh báo thiếu minh chứng [GIỮ `role="status"`] → `Callout tone="warning"` (thông điệp thật).

**D. `EvidenceUploader.jsx`** — [GIỮ] logic `saveEvidence`, `busy`, `error`, `accept`, `multiple`, `disabled`.

- Thay `<label>` + `<input type="file">` mặc định bằng `FileDropzone compact lead={null} multiple accept={db.config.files.allowedMime.join(",")} disabled={busy} buttonLabel="Tải minh chứng" onFiles={…}` với `children` = chuỗi cũ nguyên văn `Chọn minh chứng PDF/JPG/PNG · tối đa {maxMb} MB/tệp`. `buttonLabel` dùng lại chuỗi `"Tải minh chứng"` (đang là `aria-label` của input). `onFiles(chosen)` chạy đúng thân `onChange` cũ (bỏ `e.target.value = ""` vì `FileDropzone` đã tự reset).
- Danh sách tệp → `FileItem` cho mỗi tệp: `name={f.name}`, `size={`${(f.size / 1048576).toFixed(2)} MB`}` (cùng phép định dạng cũ), `onView={() => onView?.(f)}`, `onRemove={() => onChange(files.filter(…))}`, `viewLabel="Xem"`, `removeLabel="Xóa"` (hai chuỗi cũ thành tooltip/aria-label của nút icon). Không truyền `onReplace`.
- "Đang lưu minh chứng…" [GIỮ `role="status"`]: `text-body-sm text-ink-600` + `Loader2` quay 14px.

**E. `StudentPortal` (dashboard, danh sách, chi tiết)**

- Dashboard SV: `Callout title={me.fullName}` → `Panel` chứa `IdentityHeader`; nội dung con của Callout cũ chuyển vào `meta`/thân panel nguyên văn. Callout thứ hai (dòng ~455): phân loại theo 6.3 sau khi đọc mã.
- "Dòng thời gian chương trình" (`h2`) + `ProgramTimeline` → `Panel title=…`. "Lịch sử xử lý" tương tự.
- `DataList` [GIỮ].

### 7.5 Duyệt hồ sơ — `features/reviews/ReviewsPage.jsx`

**Danh sách** (không `id`): `Callout title={`Xét duyệt đến …`}` → `Panel` đầu trang: trái tiêu đề chuỗi cũ + nội dung con cũ; phải các nút hành động đang có trong vùng đó (nếu có). `DataList` [GIỮ]. Modal xem trước xếp hạng [GIỮ]: các `Callout tone="warning"` giữ; `AdmissionListTable` trong `.surface`.

**Chi tiết hồ sơ** — [GIỮ] mọi state/handler/điều kiện:

- **Khối đầu** → `Panel`: `IdentityHeader name={app.applicantName} meta={<CodeTag>{app.studentCode}</CodeTag>} aside={<StatusBadge …/>}` — lưu ý `h2` hiện chứa `{tên} · <CodeTag>`; giữ `h2` là phần tử tiêu đề (đặt `h2` làm tên trong IdentityHeader bằng cách truyền `name` là node `h2` hoặc thêm prop `as="h2"`), ký tự "·" giữ trong DOM. Dòng `Luồng {flow} · Điểm tự khai {x} → chính thức {y}`: `text-body text-ink-700`, hai con số `font-semibold tabular-nums text-ink-900`. `DescriptionList columns={4}` bên dưới, ngăn `border-t`.
- `Callout tone="danger"` "Hồ sơ chưa đạt tiêu chí bắt buộc: …" [GIỮ].
- **Hai cột** [GIỮ `lg:grid-cols-2`] → `lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6`:
  - Trái: mỗi tiêu chí một `Panel` (`h3` [GIỮ chuỗi `{name} · {BB|UT}`]); dòng "Khai: … · n điểm · {Hợp lệ|…}" tách trạng thái xác minh thành `StatusBadge`-style pill nhỏ **dùng đúng chuỗi cũ** (Hợp lệ → success, chuỗi "không hợp lệ" hiện có → danger, chuỗi "chưa xác minh" hiện có → neutral; đọc mã để lấy đúng chuỗi, không tự đặt). Nhóm nút xác minh/điều chỉnh [GIỮ] xếp `flex flex-wrap gap-2`, `size="sm"`.
  - Phải: `aside` chứa `EvidenceViewer` → `Panel padded={false}` `lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] overflow-auto`; trạng thái rỗng "Chọn minh chứng để xem." [GIỮ] → `EmptyState compact icon={FileSearch} title=… description={null}`.
- **Khối quyết định** → `Panel` cuối trang (không sticky vì chứa textarea): `Field` ý kiến; `Field` hạn bổ sung `sm:max-w-xs`; `ActionBar`: `start` = "Không đạt" (`dangerOutline`), phải = "Yêu cầu bổ sung" (secondary) · "Đạt điều kiện" (primary). [GIỮ] `disabled`, `onClick`. Nhánh "Mở lại để xét duyệt" [GIỮ].
- `Timeline` lịch sử → `Panel` (không title mới — không có chuỗi tiêu đề sẵn thì **không thêm**).
- `EvidenceViewer.jsx`: canvas mẫu [GIỮ nội dung vẽ]; link "Tải xuống {tên}" → `.text-link` + icon `Download`; `iframe` `h-[70vh]` giữ; khung `rounded-control border border-ink-200 overflow-hidden`.

### 7.6 Phê duyệt danh sách — `features/approvals/ApprovalsPage.jsx`, `domain-ui/ApprovalStepper.jsx`, `AdmissionListTable.jsx`

- `ApprovalStepper` → dùng `ProcessTrack`: 3 bước theo `["HEAD","DEAN","TRAINING"]`, `label={ROLE_LABEL[level]}`, `meta` = chuỗi cũ "Đã duyệt" / "Đang chờ" / "Chưa tới"; `state`: đã duyệt → `done`, đang chờ → `current`, còn lại → `todo`. `aria-label="Ba cấp phê duyệt"` [GIỮ]. [GIỮ] cách tính `done`.
- Trang chi tiết: `Panel` đầu: `h2` [GIỮ] + `ApprovalStepper` bên dưới. Các `Callout tone="warning"`/`success` [GIỮ]. `AdmissionListTable` [GIỮ]. `Timeline` trong `Panel`. Các nút duyệt/trả về/công bố → `ActionBar` (nguy hiểm/trả về bên trái, nút chính bên phải) [GIỮ nhãn, điều kiện, handler].
- `AdmissionListTable`: cột "Hạng" `align: "right"`, `width: 64`, `tabular-nums`; "Điểm chính thức" `align: "right"`, `tabular-nums`; "Đề xuất": chuỗi "Đề xuất" → pill success, "Ngoài chỉ tiêu" → pill neutral (cùng chuỗi); `Checkbox` đồng hạng [GIỮ].

### 7.7 Đợt xét tuyển — `features/rounds/RoundsPage.jsx`, `domain-ui/RoundMilestones.jsx`, `CriteriaTable.jsx`

- **Danh sách**: `FilterTabs` [GIỮ] + nút tạo [GIỮ nhãn/điều kiện] trên một hàng `ActionBar` (tabs ở `start`, nút chính bên phải). `DataList` [GIỮ].
- **Chi tiết** (cả `publicView`): khi `publicView`, `App.jsx` đang bọc `div.mx-auto.max-w-6xl.p-5` — để nguyên; bên trong `RoundsPage` nhánh `publicView` bọc nội dung bằng `PublicShell` **chỉ nếu** làm được mà không đổi `App.jsx`; nếu không, giữ nguyên wrapper và chỉ restyle nội dung. Bố cục: `Panel` đầu: `h2` tên đợt + `StatusBadge` (nếu đang hiển thị) → `RoundTrack status={round.status}` đầy đủ nhãn → `DescriptionList columns={3}`. Tiếp: `Panel` chứa `RoundMilestones`; `Panel padded={false}` chứa `CriteriaTable`; các `Callout` [GIỮ]; nút hành động → `ActionBar`.
- `RoundMilestones`: **bỏ** `border-l-2 border-brand-300 pl-4`. Thành `ol` lưới `grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3`; mỗi `li`: chấm `size-2 rounded-full` (`bg-brand-600` nếu đã đến mốc, `bg-ink-300` nếu chưa) + văn bản [GIỮ nguyên template `{label}: {thời gian} · {Đã đến mốc|Sắp tới}`], thời gian `tabular-nums`. [GIỮ `aria-label`].
- `CriteriaTable`: cột "Loại": "BB"/"UT" thành pill như 7.4-C; `width: 64`. Cột "Các mức điểm" `text-body-sm`. `empty` → `EmptyState compact title="Chưa có tiêu chí." description={null}`.

### 7.8 Bộ tiêu chí — `features/criteria/CriteriaPage.jsx`

Đọc toàn tệp (602 dòng) rồi áp: danh sách = nút tạo trong `ActionBar` + `DataList`; chi tiết = `Panel` đầu (`h2` [GIỮ], badge trạng thái, `Callout` hướng dẫn [GIỮ]) → `Panel padded={false}` `CriteriaTable` → vùng soạn thảo tiêu chí (mỗi tiêu chí một `Panel`, lưới trường `sm:grid-cols-2`) → `Panel title="Xem trước điểm" titleAs="h3"` [GIỮ chuỗi] chứa `CriterionField` thử nghiệm và kết quả. Nút lưu/phát hành/lưu trữ → `ActionBar sticky` nếu trang dài hơn 1.5 màn hình, ngược lại `ActionBar` thường. Mọi `FormDialog`/`ConfirmDialog` [GIỮ].

### 7.9 Danh mục & tài khoản — `features/catalog/ManagementPage.jsx`

Tệp lớn nhất (877 dòng), nhiều nhánh `page === …`. Đọc toàn tệp. Quy tắc:

- **Hàng đầu trang** → một `ActionBar`: `start` = bộ chuyển tab; phải = nút tạo [GIỮ nhãn/điều kiện `can(permission)`].
- **Tab "Khoa" / "Ngành"** (`page === "catalog"`): hai `Button variant="secondary"` không có trạng thái chọn → nhóm phân đoạn: bọc `div role="group" className="inline-flex rounded-control bg-ink-100 p-0.5"`; mỗi nút là `<button aria-pressed={tab === "faculty"} …>` với class active `bg-white text-ink-900 shadow-raised` / thường `text-ink-600 hover:text-ink-900`, `h-8 px-3 rounded-xs text-body-sm font-medium`. [GIỮ `onClick={() => setTab(...)}`], nhãn [GIỮ]. Nút "Phân quyền" (`page === "lecturers"`): `aria-pressed={tab === "permissions"}` cùng kiểu; **không** thêm nút/nhãn mới để quay lại nếu mã hiện tại không có.
- **Mật khẩu tạm**: `Callout title="Mật khẩu tạm (hiển thị trong phiên này)"` → giữ `Callout tone="warning"`; giá trị `{temporary}` bọc `CodeTag tone="neutral"` cỡ `text-body`; nút "Ẩn" [GIỮ] đưa vào prop `action` của Callout.
- **Hành động trong hàng**: giữ là nút chữ (`variant="link"` đã restyle), `size="sm"`, bọc `flex flex-wrap justify-end gap-1`. Không gộp vào menu "⋯" (đổi cách thao tác → ngoài phạm vi).
- **Chi tiết lớp** (`page === "classes" && id`): `Panel` đầu với thông tin lớp; hai `DataList` mỗi cái trong ngữ cảnh có `h2`/`h3` sẵn có; nút "Kết thúc lớp" [GIỮ] → `ActionBar` với `start` (hành động nguy hiểm/kết thúc bên trái).
- `Drawer` chi tiết chuyên ngành, `FormDialog`, `ConfirmDialog` [GIỮ].
- Trang `programs` phải **giữ đúng bốn cột** "Khoa", "Chuyên ngành", "Số lượng lớp", "Thao tác" (yêu cầu `NGHIEP-VU.md`). "Số lượng lớp" `align: "right"`, `tabular-nums`.
- Sĩ số dùng `Capacity` ở nơi đang dùng [GIỮ].

### 7.10 Vận hành — `features/operations/OperationsPage.jsx`, `RecordsPage.jsx`

**Báo cáo** (`page === "reports"`): [GIỮ] lớp `print-report` trên wrapper.

- Hàng đầu: `ActionBar`: `start` = `Field label="Đợt xét tuyển"` + `Select` (`sm:max-w-md`); phải = "In / Lưu PDF" (secondary) · "Xuất CSV (Excel)" (primary) — chuyển hai nút từ cuối trang lên đầu, [GIỮ handler]. `h2` tên đợt [GIỮ] đặt ngay dưới.
- Ba Callout tổng hợp → lưới `grid gap-4 lg:grid-cols-3`:
  - `MetricTile value={summary.total}` `label` = phần chữ của chuỗi cũ. Chuỗi cũ là `` `Tổng hồ sơ: ${n}` `` (nhãn trước, số sau) → dùng bố cục nhãn-trên/số-dưới: `<p className="text-body-sm text-ink-600">Tổng hồ sơ:</p><p className="text-metric tabular-nums">{n}</p>`; dòng con `Trúng tuyển: x/y` [GIỮ] bên dưới.
  - `Panel title="Theo luồng" titleAs="h3"` và `Panel title="Theo trạng thái" titleAs="h3"`: nội dung là `dl` (`flex justify-between py-1.5 border-b border-ink-100 last:border-0`): `dt` = phần nhãn (`Luồng {key}` / nhãn trạng thái), `dd` = số `tabular-nums font-semibold`. Vì chuỗi cũ là `Luồng A: 3` trong một `<p>`, giữ ký tự ":" ở cuối `dt`.
- **Biểu đồ "Phổ điểm (khoảng 20 điểm)"** (`h2` [GIỮ]) → trong `Panel`; [GIỮ] `role="img"`, `aria-label`, `<title>`, dữ liệu, công thức chiều cao. Vẽ lại SVG: `viewBox="0 0 640 260"`; đường nền `y=210` `stroke` `ink-300`; 3 đường lưới ngang mảnh `ink-100`; cột `rx="3"` `class="fill-brand-600"`, bề rộng `Math.min(48, 440 / all.length)`, canh giữa trong ô; nhãn giá trị trên cột `text-anchor="middle"` `class="fill-ink-900 text-caption"` `font-weight 600`; nhãn khoảng dưới trục `text-anchor="middle"` `class="fill-ink-600 text-caption"`; cột có `n === 0` vẽ vạch 2px `fill-ink-200`. Một màu duy nhất (dữ liệu một chuỗi) — không gradient, không bóng.
- `DataList` trúng tuyển [GIỮ]; "Điểm" `align: "right"`.

**Nhật ký / Hàng đợi email / Cấu hình**: áp 6.3 + 6.4; bộ lọc (nếu có) gom vào một `Panel` phía trên bảng; `Drawer` xem before/after: hai khối `pre` `rounded-control bg-ink-50 p-3 text-body-sm font-mono overflow-auto` đặt cạnh nhau ≥ md (mono hợp lệ vì là dữ liệu JSON); trạng thái email dùng `StatusBadge` nếu đang dùng. Trang cấu hình: mỗi nhóm cấu hình một `Panel` với tiêu đề **chỉ khi** mã hiện tại đã có chuỗi tiêu đề; nút lưu từng nhóm ở `footer` panel hoặc `ActionBar` cuối trang (theo cấu trúc sẵn có).

**`RecordsPage.jsx`**: chi tiết SV: `Callout title={user.fullName}` → `Panel` + `IdentityHeader name={user.fullName} meta={`${user.username} · ${user.email}`}`; `Timeline` → `Panel`; `DataList` [GIỮ]. Lỗi quyền → `StatePage tone="danger"`.

### 7.11 Thông báo, Hồ sơ cá nhân, Kết quả công khai

**`NotificationsPage.jsx`** [GIỮ logic]: hai nút đầu trang → `ActionBar` ("Chỉ xem chưa đọc"/"Xem tất cả" secondary bên trái dạng nút bật-tắt `aria-pressed={unread}`; "Đánh dấu tất cả đã đọc" bên phải, đổi `variant="secondary"` — không phải hành động chính của trang; nhãn [GIỮ]). Danh sách → `ul.surface.divide-y`: mỗi mục là `button` toàn hàng `flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-ink-25`: chấm chưa đọc `mt-2 size-2 rounded-full bg-brand-600` (đã đọc: `bg-transparent`), khối chữ (tiêu đề `text-body` `font-semibold` nếu chưa đọc; `body` `text-body-sm text-ink-600`), thời gian bên phải `text-caption text-ink-600 tabular-nums whitespace-nowrap`. Rỗng: `EmptyState icon={Bell} title="Chưa có thông báo phù hợp." description={null}`.

**`ProfilePage.jsx`** [GIỮ logic]: `Panel` `max-w-2xl`: đầu là `IdentityHeader name={me.fullName} size={40}` (thay `<p className="text-title-3">`), ngăn `border-b pb-4 mb-5`; các `Field` lưới `sm:grid-cols-2` ("Tên đăng nhập" khóa, "Số điện thoại", "Email IUH" chiếm `sm:col-span-2`); khối OTP đổi email (khi hiện) trong `rounded-control bg-ink-25 p-4` với nút "Gửi OTP email mới" và `Field` "Mã OTP"; nút "Lưu thông tin" ở `footer` panel, căn phải.

**`ResultPages.jsx`** [GIỮ logic]: bọc `PublicShell`; xóa `honor-rule`; "Về trang chủ" như 7.2; H1 [GIỮ]. Nhánh kết quả công khai: tên đợt `text-body-lg text-ink-700`; `Callout` bảo vệ dữ liệu [GIỮ]; `DataList`. Nhánh tra cứu: form trong `Panel max-w-xl`; hai nút cuối form trên một hàng (primary phải); liên kết "Đăng nhập để bổ sung" → `.text-link`. `Callout` lỗi [GIỮ].

---

## 8. Lộ trình thực thi (9 phase, mỗi phase một commit)

Mỗi phase: làm đúng phạm vi tệp → chạy 9.1 → soát "Nghiệm thu" → commit với thông điệp gợi ý. Không sửa tệp ngoài danh sách của phase (trừ khi sửa lỗi do chính phase gây ra).

### Phase 0 — Chuẩn bị & baseline

| | |
|---|---|
| Việc | (1) `git status` sạch, tạo nhánh `ui/ultra-fable`. (2) `sha256sum assets/img/brand/*` khớp mục 4.1. (3) Chạy `bash TEST.sh` ghi nhận baseline: 245 test pass, "Render smoke: ĐẠT", "110 trang/vai trò thành công", build OK. (4) Thêm favicon vào 7 tệp HTML (4.3). (5) Chụp ảnh "trước" ở 1440×900 cho: `#/`, `#/dang-nhap`, dashboard của 6 vai trò, `#/app/apply/<id>` (SV), `#/app/reviews/<id>` (GV), `#/app/reports` — lưu ngoài repo để so sánh. |
| Tệp | 7 tệp `*.html` gốc; `assets/img/brand/*` (đã có, cần `git add`). |
| Nghiệm thu | Tab trình duyệt hiện biểu tượng IUH; `bash TEST.sh` đạt. |
| Commit | `chore(ui): thêm logo IUH chính thức và favicon` |

### Phase 1 — Token & CSS nền

| | |
|---|---|
| Việc | Thay `theme.css` (mục 5). Sửa `base.css` (3.5/6.1). Sửa `components.css` theo bảng 6.1 **trừ** việc xóa `.honor-rule`/`.academic-grid` (để Phase 2, khi đã gỡ hết chỗ dùng). |
| Tệp | `src/styles/theme.css`, `base.css`, `components.css`; `src/components/data/ResponsiveTable.jsx` (1 class). |
| Nghiệm thu | App chạy; bo góc gọn hơn; badge "Chờ duyệt" màu cam, "Chưa mở" tông xanh brand, "Nháp" xám ink; tiêu đề cột bảng không in hoa; bôi đen văn bản ra nền `brand-100`. Không còn `box-shadow: inset 2px` trong `components.css`. |
| Commit | `style(tokens): chuẩn hóa token theo nhận diện IUH xanh–vàng` |

### Phase 2 — Primitive & gỡ trang trí công thức

| | |
|---|---|
| Việc | Toàn bộ bảng 6.2. Tạo 9 component mới ở 6.7 (`Panel`, `ProcessTrack`, `RoundTrack`, `MetricTile`+alias `StatCard`, `IdentityHeader`, `StatePage`, `ActionBar`, `PublicShell`, `AuthShell`). Gỡ **mọi** `honor-rule` và `academic-grid` khỏi JSX (7 tệp: `WorkspaceLayout`, `PageHeader`, `Sidebar`, `EmptyState`, `AuthPages`, `PublicHome`, `ResultPages`) rồi xóa hai khối CSS tương ứng. Cập nhật `dev/Gallery.jsx`. |
| Tệp | `src/components/ui/*`, `src/components/layout/{PageHeader,ActionBar,PublicShell,AuthShell}.jsx`, `src/components/domain-ui/RoundTrack.jsx`, `src/dev/Gallery.jsx`, `src/styles/components.css`, và 7 tệp nêu trên (chỉ xóa dòng `honor-rule`/lớp `academic-grid`). |
| Nghiệm thu | `grep -rE "honor-rule|academic-grid" src` → rỗng. `grep -rE "border-l-\[|border-l-2|border-l-(info|success|warning|danger|brand|ink)" src` → rỗng (trừ tay kéo sidebar nếu có `left-[2px]`, không tính). Mở `?gallery` (dev) thấy đủ component mới, không lỗi console. Toast/Callout không còn sọc trái. |
| Commit | `refactor(ui): primitive mới (Panel, ProcessTrack, MetricTile…) và gỡ trang trí công thức` |

### Phase 3 — Shell workspace

| | |
|---|---|
| Việc | Mục 6.5 (Sidebar, bản đồ icon + iconKey trong `menus.js`, WorkspaceHeader, RoleSwitcher, NotificationBell, WorkspaceLayout) và 6.6 (vị trí nút Demo). |
| Tệp | `src/components/layout/{Sidebar,WorkspaceHeader,RoleSwitcher,NotificationBell}.jsx`, `src/app/WorkspaceLayout.jsx`, `src/app/menus.js` (**chỉ** phần tử thứ 3 mỗi mục), `src/features/demo/DemoPanel.jsx` (class của nút mở). |
| Nghiệm thu | Sidebar xanh `#153898` với logo trắng chính thức; mục đang chọn là viên trắng chữ xanh; mỗi mục menu một icon riêng; header một hàng 56px ở 1440 và 1024; huy hiệu số thông báo đúng; chuyển vai trò, thu gọn/kéo sidebar, menu tài khoản bằng bàn phím (↑↓ Home End Esc Tab) hoạt động như cũ; nút Demo không đè nút "Thu gọn". `git diff src/app/menus.js` chỉ khác chuỗi iconKey. |
| Commit | `feat(shell): sidebar xanh IUH, header một hàng, icon menu riêng` |

### Phase 4 — `DataList`, `FormDialog` và quy tắc Callout toàn cục

| | |
|---|---|
| Việc | Mục 6.4. Sau đó quét **mọi** `<Callout` trong `src/features` và `src/app`, `App.jsx`, phân loại theo bảng 6.3 và chuyển đổi các trường hợp "trạng thái toàn trang" (`StatePage`) — các trường hợp số liệu/danh tính/nhóm liệt kê xử lý ở phase của từng trang. |
| Tệp | `src/features/shared/FeatureKit.jsx`, `src/App.jsx` (chỉ 3 Callout trạng thái), `src/app/AuthGate.jsx`. |
| Nghiệm thu | Mọi bảng có ô tìm kiếm nằm trong khung bảng với icon kính lúp; trạng thái rỗng là `EmptyState`; cột "Thao tác" căn phải; modal form có nút ở footer; Enter trong form vẫn submit. `verify-routes` vẫn 110/110. |
| Commit | `refactor(data): DataList/FormDialog thống nhất, trạng thái toàn trang dùng StatePage` |

### Phase 5 — Trang công khai & xác thực

| | |
|---|---|
| Việc | Mục 7.1, 7.2, 7.11 (ResultPages), `PublicHeader`. Thêm prop `embedded` cho `AuthPage` và truyền ở `App.jsx › WorkspacePage`. |
| Tệp | `src/features/public/{PublicHome,ResultPages}.jsx`, `src/features/auth/AuthPages.jsx`, `src/components/layout/PublicHeader.jsx`, `src/App.jsx` (1 prop). |
| Nghiệm thu | Trang chủ: hero xanh phẳng, nút "Tra cứu kết quả" vàng, thanh lọc nổi đè hero, đợt xét tuyển dạng hàng có thanh tiến trình 5 đoạn. `node coding_plan/verify-render.mjs` đạt (đặc biệt: HTML không chứa `closed`). `node --test src/mock/architecture.test.js` đạt (không hex/`text-[..px]` trong `PublicHome.jsx`). Đăng nhập/đăng ký 3 bước/quên MK/đặt lại MK chạy đúng luồng; `returnTo` còn hoạt động; `#/app/doi-mat-khau` chỉ có **một** H1. |
| Commit | `feat(public): trang chủ dạng tiến trình, khung xác thực thương hiệu IUH` |

### Phase 6 — Dashboard & cổng sinh viên

| | |
|---|---|
| Việc | Mục 7.3, 7.4 (A–E). |
| Tệp | `src/features/dashboard/Dashboard.jsx`, `src/features/student-portal/StudentPortal.jsx`, `src/components/ui/{ScoreSummary,Countdown}.jsx`, `src/components/domain-ui/{CriterionField,EvidenceUploader,ProgramTimeline}.jsx`. |
| Nghiệm thu | Dashboard không còn hộp ⓘ xanh; số liệu là `MetricTile`; 6 trạng thái ĐXT trên một panel. Wizard: tải tệp bằng nút và kéo-thả đều lưu được minh chứng; xem/xóa tệp; tự lưu nháp sau 1.5 s vẫn chạy; cảnh báo rời trang khi chưa lưu vẫn hiện; "Nộp hồ sơ chính thức" vẫn bị khóa khi chưa tick cam kết; điểm dự kiến cập nhật khi nhập. Thanh hành động dính đáy không che nội dung cuối và không bị nút Demo che nút chính. |
| Commit | `feat(student): wizard nộp hồ sơ có khung, uploader kéo-thả, dashboard số liệu` |

### Phase 7 — Duyệt, phê duyệt, đợt xét tuyển, tiêu chí

| | |
|---|---|
| Việc | Mục 7.5, 7.6, 7.7, 7.8. |
| Tệp | `src/features/{reviews/ReviewsPage,approvals/ApprovalsPage,rounds/RoundsPage,criteria/CriteriaPage}.jsx`, `src/components/domain-ui/{ApprovalStepper,AdmissionListTable,RoundMilestones,CriteriaTable,EvidenceViewer}.jsx`. |
| Nghiệm thu | Màn duyệt: hai cột, khung minh chứng dính khi cuộn; xác minh từng tiêu chí, điều chỉnh có lý do, Đạt/Yêu cầu bổ sung/Không đạt/Mở lại chạy đúng. Phê duyệt 3 cấp hiển thị bằng `ProcessTrack`; chốt/duyệt/trả về/công bố chạy đúng. Chi tiết ĐXT có `RoundTrack` đủ nhãn. Chạy lại kịch bản trong `coding_plan/UAT-TEST-GUIDE.md` cho các vai trò GV, CNN, BLĐ khoa, PĐT. |
| Commit | `feat(review): màn duyệt hai khung, tiến trình phê duyệt ba cấp, chi tiết ĐXT` |

### Phase 8 — Danh mục, vận hành, thông báo, hồ sơ cá nhân, demo + hoàn thiện

| | |
|---|---|
| Việc | Mục 7.9, 7.10, 7.11 (Notifications, Profile), nội dung Drawer demo (6.6). Sau đó **vòng hoàn thiện**: quét mục 9.2–9.4 trên toàn bộ ứng dụng; viết lại `DESIGN.md` mục 1 (hướng thiết kế, chữ ký, danh sách cấm, token) cho khớp plan này — giữ mục 2–4 và cập nhật tên component. |
| Tệp | `src/features/{catalog/ManagementPage,operations/OperationsPage,operations/RecordsPage,notifications/NotificationsPage,profile/ProfilePage,demo/DemoPanel}.jsx`, `DESIGN.md`. |
| Nghiệm thu | Tab Khoa/Ngành có trạng thái chọn; biểu đồ phổ điểm vẽ lại, "In / Lưu PDF" in ra đúng báo cáo (xem trước bản in không có sidebar/header/nút); xuất CSV tải được tệp; Demo: 4 tab, đổi giờ mô phỏng, đăng nhập nhanh, reset dữ liệu có xác nhận. Toàn bộ mục 9 và mục 10 đạt. |
| Commit | `feat(admin): danh mục, báo cáo, thông báo, hồ sơ; cập nhật DESIGN.md` |

---

## 9. Kiểm thử & nghiệm thu

### 9.1 Cổng tự động (chạy sau **mỗi** phase)

```bash
bash TEST.sh
```

Phải thấy đủ: `# pass 245` / `# fail 0` · `Render smoke: ĐẠT` · `Render route smoke: 110 trang/vai trò thành công` · build xong · `TẤT CẢ KIỂM TRA ĐÃ ĐẠT`. Nếu số test khác 245 vì có người thêm test nghiệp vụ → chấp nhận miễn `fail 0`. **Cấm** sửa tệp `*.test.js`, `verify-render.mjs`, `verify-routes.mjs` để cho qua.

### 9.2 Cổng grep (chạy cuối Phase 2 và cuối Phase 8) — mỗi lệnh phải **không in ra gì**

```bash
grep -rnE "honor-rule|academic-grid|backdrop-blur" src
grep -rnE "#[0-9a-fA-F]{3,8}\b" src --include=*.jsx
grep -rnE "text-\[[0-9.]+(px|rem)\]" src --include=*.jsx
grep -rnE "\b(bg|text|border|ring|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]" src --include=*.jsx
grep -rnE "bg-gradient|from-|via-|to-(brand|ink|accent)" src --include=*.jsx
grep -rnE "border-l-(2|4|\[)|border-r-(2|4|\[)" src --include=*.jsx
grep -rnE "\buppercase\b" src --include=*.jsx --exclude=Gallery.jsx
grep -rnE "accent-(50|100|300|400|500|600|700)" src --include=*.jsx | grep -vE "Button.jsx|PublicHome.jsx|AuthShell.jsx|Sidebar.jsx"
git diff --stat 3b51ca4 -- src/domain src/mock src/hooks src/app/router.js src/app/routes.jsx
```

Ghi chú: lệnh thứ 4 có `neutral-[0-9]` — token dự án là `neutral-fg|bg|border|solid` (không có số) nên không dính. Lệnh `uppercase`: `Avatar` có lớp `uppercase` cho chữ viết tắt tên — được phép giữ; loại trừ bằng mắt (kết quả chỉ được còn dòng đó trong `Display.jsx`). Lệnh cuối phải rỗng: không một dòng logic nào bị đổi.

### 9.3 Kiểm tra bảo toàn nội dung (cuối mỗi phase có sửa trang)

So sánh chuỗi hiển thị trước/sau bằng SSR — chạy script tạm (đặt ngoài repo, không commit) dùng đúng cơ chế của `coding_plan/verify-routes.mjs`: render từng route/vai trò ở commit baseline và ở HEAD, bóc text (`html.replace(/<[^>]+>/g, " ")`, gộp khoảng trắng), tách token theo khoảng trắng, sắp xếp, so sánh **tập hợp** từ. Khác biệt được phép: (a) chuỗi `aria-label`/`placeholder` không nằm trong text node nên không ảnh hưởng; (b) nhãn "Tìm kiếm …" chuyển từ text node sang thuộc tính; (c) "Thông báo (n)" chuyển sang `aria-label` + số `n` trong huy hiệu; (d) hai dòng chữ của khung xác thực (chuỗi sẵn có, nay xuất hiện thêm ở trang auth); (e) nhãn bước hiện trong `ProcessTrack`/`RoundTrack` (lấy từ `ROUND_STATUSES`/`ROLE_LABEL`). Mọi khác biệt khác → coi là vi phạm L1, phải sửa.

### 9.4 Kiểm tra bằng mắt trên trình duyệt (cuối Phase 3, 5, 6, 7, 8)

Chạy `bash run.sh`; kiểm ở **1440×900, 1024×768, 390×844**. Với mỗi màn hình của phase:

- [ ] Không cuộn ngang toàn trang; không chữ bị cắt/tràn; tiêu đề dài tự xuống dòng cân.
- [ ] Bảng ≥ 640px là bảng, < 640px là danh sách thẻ; modal/drawer < 640px là bottom sheet.
- [ ] Tab qua toàn trang: thứ tự hợp lý, vòng focus luôn thấy (trắng trên nền xanh), không bẫy focus ngoài lớp phủ; Esc đóng đúng lớp trên cùng và trả focus.
- [ ] Vùng bấm ≥ 40px trên mobile; không hành động nào chỉ hiện khi hover.
- [ ] Console không lỗi/cảnh báo React mới (key trùng, prop lạ lên DOM, hydration).
- [ ] Vàng `accent` chỉ xuất hiện trên nền xanh; không chỗ nào chữ vàng trên nền trắng.
- [ ] Không còn thẻ lồng thẻ (một `.surface` nằm trong `.surface`).
- [ ] So với ảnh "trước": cùng thông tin, cùng nút, cùng thứ tự cột.
- [ ] Bật "giảm chuyển động" của hệ điều hành: không còn animation.
- [ ] Phóng to trình duyệt 200% ở 1440: vẫn dùng được, không chồng lấn.

Đăng nhập nhanh từng vai trò qua nút "Bảng điều khiển demo" (tab đăng nhập nhanh) hoặc mở thẳng 6 tệp HTML vai trò.

### 9.5 Kiểm tra tương phản (cuối Phase 1 và Phase 8)

Các cặp đã tính sẵn ở 3.2 đều ≥ 4.5:1. Khi buộc phải dùng cặp ngoài bảng, tính lại theo WCAG 2.x và chỉ dùng khi ≥ 4.5:1 (chữ thường) / ≥ 3:1 (chữ ≥ 18.66px đậm hoặc ≥ 24px, và thành phần đồ họa).

---

## 10. Định nghĩa hoàn thành (Definition of Done)

1. Cả 9 phase đã commit riêng, `bash TEST.sh` đạt ở commit cuối.
2. Toàn bộ lệnh ở 9.2 không in ra gì (trừ ngoại lệ đã ghi).
3. `git diff --stat 3b51ca4 -- src/domain src/mock src/hooks src/app/router.js src/app/routes.jsx` rỗng; `git diff 3b51ca4 -- src/app/menus.js` chỉ khác iconKey.
4. Kiểm tra 9.3 không còn khác biệt ngoài danh sách cho phép.
5. Checklist 9.4 đạt cho mọi route ở bảng 1.3, với cả 6 vai trò, ở 3 kích thước.
6. Không dependency mới (`git diff 3b51ca4 -- package.json pnpm-lock.yaml` rỗng).
7. `DESIGN.md` phản ánh hệ thống mới; không còn nhắc "Honor Rule", "Academic Grid", "accent đồng".
8. Ba câu hỏi tự soát (Impeccable, chế độ Operate): *Che tên sản phẩm đi, đây có đọc ra là một cổng học vụ đại học không? Người dùng có làm được việc ngay từ màn hình đầu không? Nó có sạch bằng chuẩn của thể loại và có nét riêng (xanh–vàng IUH + thanh tiến trình) không?* — cả ba phải là "có".

---

## 11. Rủi ro & cách xử lý

| Rủi ro | Dấu hiệu | Xử lý |
|---|---|---|
| Đổi `variant="link"` toàn cục làm lệch các link nằm trong đoạn văn | Nút link trong Callout/đoạn chữ có nền hover lạ, lệch dòng | Ở những chỗ link nằm *trong câu*, thêm `className="!px-0 !mx-0 hover:!bg-transparent underline underline-offset-4"`; không đổi variant. |
| Logo ngang không vừa sidebar thu gọn | Biểu tượng bị cắt xấu ở 72px | Dùng `favicon-32x32.png` cho trạng thái `collapsed` (đã nêu ở 6.5). |
| `FileDropzone` thay input gốc làm mất `aria-label="Tải minh chứng"` | Trình đọc màn hình không đọc được nút tải | `buttonLabel="Tải minh chứng"` đã mang đúng chuỗi; giữ input ẩn `aria-hidden` như component đang làm. |
| Thanh hành động dính đáy che trường cuối trên mobile | Trường cuối/nút bị che khi bàn phím ảo mở | `<main>` đã có `pb-24`; nếu vẫn che, bỏ `sticky` dưới 640px (`max-sm:static max-sm:shadow-none`). |
| SSR vỡ do component mới đọc `window` | `verify-render`/`verify-routes` báo lỗi `window is not defined` | Chuyển vào `useEffect`; component trình bày không cần `window`. |
| Chuỗi `closed` lọt vào HTML trang chủ | `verify-render` fail "Không có trạng thái ĐXT cũ" | Tìm `grep -rn "closed" src/features/public src/components` (kể cả tên icon lucide, `data-*`, class) và đổi tên. |
| Class Tailwind động không được sinh | Màu/cỡ không áp dụng khi ghép chuỗi kiểu `` `bg-${tone}-bg` `` | Tailwind v4 chỉ quét chuỗi nguyên vẹn — luôn dùng bảng ánh xạ lớp viết đầy đủ như `StatusBadge.jsx` đang làm. |
| Bảng in (Báo cáo) mất nội dung | Xem trước bản in trống | Không đặt nội dung báo cáo trong `<aside>`/`<header>`; `Panel` dùng `<section>`, `header` của Panel chứa tiêu đề sẽ bị ẩn khi in → với các panel trong `.print-report`, truyền tiêu đề qua `h3` trong thân thay vì `title` prop, hoặc thêm vào khối print: `.print-report header { display: block !important; }`. |
| Hai H1 trên trang đổi mật khẩu trong workspace | Trình đọc màn hình đọc hai tiêu đề cấp 1 | Prop `embedded` (7.2). |
| Agent "tiện tay" sửa câu chữ cho hay hơn | Diff có thay đổi trong chuỗi tiếng Việt | Vi phạm L1 — hoàn tác. Kiểm bằng 9.3. |

---

## 12. Phụ lục

### 12.1 Bảng ánh xạ nhanh "mẫu cũ → mẫu mới"

| Gặp trong mã | Thay bằng |
|---|---|
| `<span className="honor-rule …" />` | Xóa |
| lớp `academic-grid`, `on-light` | Xóa lớp |
| `rounded-card border border-ink-200 bg-white p-4` / `p-5` (section viết tay) | `<Panel>` |
| `shadow-card` trên bề mặt tĩnh | Xóa (viền là đủ) |
| `<Callout title={`${n} …`}>` (số liệu) | `<MetricTile value={n} label="…">` |
| `<Callout title={ten}>{ma} · {email}</Callout>` | `<IdentityHeader name meta>` trong `Panel` |
| `<Callout tone="danger">Không có quyền…</Callout>` làm cả trang | `<StatePage tone="danger">` |
| `<p className="p-6 text-ink-600">Không có dữ liệu…</p>` | `<EmptyState compact title="…" description={null} />` |
| `border-l-2 border-… pl-3/pl-4` | `rounded-control border border-ink-200 p-4` hoặc `bg-ink-25 rounded-control p-3` |
| `text-overline uppercase text-ink-500` | `text-body-sm text-ink-600` |
| `font-mono` cho thứ không phải mã/OTP/JSON | Xóa, thêm `tabular-nums` nếu là số |
| `text-ink-500` cho chữ < 13px hoặc trên nền `ink-50` | `text-ink-600` |
| `text-white/70`, `text-white/80` trên nền xanh | `text-brand-100` / `text-brand-200` |
| `bg-brand-900` (nền sidebar/hero/drawer nav) | `bg-brand-600` |
| Nhóm nút trôi cuối khối (`div.flex.flex-wrap.gap-2`) | `<ActionBar>` (nguy hiểm trái, chính phải) |
| `<a className="text-brand-600">` / `underline` viết tay | lớp `.text-link` |
| `rounded-[8px]`, `rounded-[5px]`, `size-[34px]`, `h-[60px]`… | token/bậc gần nhất (`rounded-xs`, `rounded-control`, `size-9`, `h-15`) |

### 12.2 Những thứ **không** làm trong plan này

Dark mode · đổi font · thêm ảnh/minh họa · thêm trang/mục menu · đổi tên route · gộp hành động vào menu "⋯" · sắp xếp cột bằng click · chọn nhiều/bulk action · thêm skeleton tải (mock backend đồng bộ, không có trạng thái tải thật) · quốc tế hóa · thay logo Khoa CNTT trên header công khai · tối ưu bundle · sửa nghiệp vụ dù thấy lỗi (ghi lại vào báo cáo, không sửa).

### 12.3 Nguồn tham chiếu

- Bộ nhận diện thương hiệu IUH (Quyết định 3186/QĐ-ĐHCN ngày 03/10/2025): https://iuh.edu.vn/vi/nhan-dien-thuong-hieu.html — logo, màu xanh `#153898` / vàng `#F9B200`, ý nghĩa I–U–H (Innovation – Unity – Humanity).
- Trang chủ IUH (cách đặt logo trắng trên nền xanh, dùng Inter): https://iuh.edu.vn/
- UI UX Pro Max (cục bộ): kiểu "Accessible & Ethical" cho giáo dục/chính phủ; chống mẫu "AI purple/pink gradients", "ornate design", "motion effects"; checklist tương phản 4.5:1, vùng chạm 44px, focus thấy được, reduced-motion.
- Impeccable v4.8.0 (cục bộ): `reference/craft-floor.md` (danh sách "Refuse"/"ban"), `reference/operate.md`, `reference/mode-operate.md`.
- Tài liệu dự án: `PRODUCT.md`, `DESIGN.md`, `NGHIEP-VU.md`, `coding_plan/KSTN-PROTOTYPE-IMPLEMENTATION-PLAN.md`, `coding_plan/UAT-TEST-GUIDE.md`.

### 12.4 Mẫu báo cáo cuối mỗi phase (agent điền)

```text
PHASE n — <tên>
Tệp đã sửa: …
Kết quả bash TEST.sh: pass/fail (dán 4 dòng kết luận)
Cổng grep 9.2: đạt / còn (liệt kê)
Bảo toàn nội dung 9.3: đạt / khác biệt (liệt kê)
Kiểm bằng mắt 9.4: 1440 / 1024 / 390 — đạt / vấn đề
Chỉ dẫn đã bỏ qua do L1–L4 (nếu có) và lý do: …
Vấn đề nghiệp vụ phát hiện nhưng không sửa: …
```
