# KẾ HOẠCH NÂNG CẤP UI/UX — IUH TALENT (CN/KSTN) · PHIÊN BẢN 2

> **Dành cho:** model/lập trình viên sẽ triển khai code.
> **Phạm vi:** toàn bộ giao diện React trong `src/` (trang công khai + 6 vai trò trong workspace).
> **Nguyên tắc tối thượng:** *Nâng cấp hình thức và trải nghiệm — GIỮ NGUYÊN NỘI DUNG.*
> **Tài liệu này thay thế** cho `UI-UX-UPGRADE-PLAN.md` (bản cũ, phần lớn đã triển khai trong đợt tái cấu trúc ghi ở `DESIGN.md`). Không xóa bản cũ; chỉ làm theo bản này.

---

## Mục lục

0. [Cách dùng tài liệu này (đọc trước khi code)](#0-cách-dùng-tài-liệu-này)
1. [Quy tắc đóng băng nội dung (Content Freeze)](#1-quy-tắc-đóng-băng-nội-dung)
2. [Hiện trạng: điểm mạnh và vấn đề cần xử lý](#2-hiện-trạng)
3. [Định hướng thẩm mỹ: “Academic Prestige”](#3-định-hướng-thẩm-mỹ)
4. [Design tokens (màu, chữ, khoảng cách, bo góc, đổ bóng, chuyển động)](#4-design-tokens)
5. [Thư viện thành phần (component library) — nâng cấp & bổ sung](#5-thư-viện-thành-phần)
6. [Khung ứng dụng: Sidebar, Header, Mobile](#6-khung-ứng-dụng)
7. [Mẫu bảng dữ liệu chuẩn (Data Table Pattern)](#7-mẫu-bảng-dữ-liệu-chuẩn)
8. [Đặc tả từng màn hình](#8-đặc-tả-từng-màn-hình)
9. [Chuyển động & vi tương tác](#9-chuyển-động--vi-tương-tác)
10. [Accessibility & Responsive](#10-accessibility--responsive)
11. [Lỗi UX/logic phát hiện khi đọc code (sửa kèm)](#11-lỗi-uxlogic-phát-hiện-khi-đọc-code)
12. [Lộ trình triển khai theo giai đoạn](#12-lộ-trình-triển-khai)
13. [Checklist nghiệm thu](#13-checklist-nghiệm-thu)
14. [Prompt mẫu giao cho model triển khai](#14-prompt-mẫu-giao-cho-model-triển-khai)

---

## 0. Cách dùng tài liệu này

1. Làm **theo đúng thứ tự giai đoạn ở mục 12**. Giai đoạn 1 (tokens) và 2 (components) là nền móng — làm sai ở đây thì mọi màn hình phía sau đều lệch.
2. Mỗi giai đoạn kết thúc phải `pnpm build` thành công cho cả 7 file HTML và tự kiểm tra bằng trình duyệt ở 3 khổ: **1440px, 1024px, 390px**.
3. Khi tài liệu ghi “**Bắt buộc**” → không được bỏ qua. “**Khuyến nghị**” → nên làm. “**Tùy chọn**” → chỉ làm khi các phần bắt buộc đã xong.
4. Không thêm thư viện UI lớn (MUI, Ant, Chakra, shadcn CLI…). Được phép giữ: `react`, `react-dom`, `lucide-react`, `tailwindcss v4`. **Tùy chọn** thêm duy nhất `@floating-ui/react` nếu cần định vị tooltip/dropdown — không bắt buộc.
5. Mọi giá trị màu/chữ/khoảng cách **phải lấy từ token** (mục 4). Không viết `text-[#182235]`, `bg-[#F8FAFC]`, `text-[13.5px]` trong JSX nữa.

### Bản đồ dự án hiện tại (tham chiếu nhanh)

```
src/
  App.jsx                       → routing theo activePage + WorkspaceShell + pageMeta (tiêu đề/mô tả trang)
  main.jsx                      → đọc data-role từ <body>
  styles.css                    → import tailwind + tokens/base/components, @theme rất mỏng
  styles/tokens.css|base.css|components.css
  components/ui/                → Button, IconButton, Modal, Toast, StatusBadge, Pagination, EmptyState
  components/layout/            → PublicHeader, WorkspaceHeader, Sidebar, PageHeader
  components/data/              → TablePanel, TableToolbar, TableActions
  features/public/              → PublicHome, RoundDetailModal, PublicApplyModal, LoginModal
  features/majors|classes|teachers|students|permissions|rounds|criteria/  → các trang CRUD
  features/approvals/           → ApprovalsPage, ApplicationReviewModal
  features/student-application/ → StudentApplicationPage (wizard 3 bước + màn theo dõi)
  features/passwords/           → PasswordResetPage, ChangePasswordModal
  features/profile/             → ProfilePage
  data/fixtures.js | demo-store.jsx | status-definitions.js
```

7 entry HTML: `index.html` (public), `quan-tri-vien.html`, `dai-dien-phong-dao-tao.html`, `ban-lanh-dao-khoa.html`, `chu-nhiem-nganh.html`, `giang-vien-phu-trach.html`, `sinh-vien.html`.

---

## 1. Quy tắc đóng băng nội dung

Người dùng yêu cầu **giữ nguyên nội dung**. Định nghĩa cụ thể:

### 1.1. KHÔNG được thay đổi

| Hạng mục | Ví dụ trong code |
|---|---|
| Mọi chuỗi tiếng Việt hiển thị: tiêu đề, mô tả, nhãn, placeholder, nút, thông báo toast, nội dung modal, empty state | `pageMeta` trong `App.jsx`, `"Thêm chuyên ngành mới"`, `"Quay lại kiểm tra"`, `"Theo quy định phân cấp (Khoa → Ngành → Lớp)…"` |
| Tên menu, thứ tự menu, icon key của từng vai trò | `roles[*].menus` trong `fixtures.js` |
| Tên cột và **thứ tự cột** của mọi bảng | Chuyên ngành: `Khoa | Chuyên ngành | Số lượng lớp | Thao tác` (bắt buộc theo `NGHIEP-VU.md`) |
| Dữ liệu mẫu (fixtures), mã đợt, MSSV, điểm số | `fixtures.js` |
| Nghiệp vụ & ràng buộc | Kiểm tra trùng Khoa+Ngành, chặn xóa cha khi còn con, sĩ số ≤ tối đa, phân trang **tối đa 10 dòng/trang**, chặn xóa lớp gắn đợt đang mở, lưu nháp localStorage, PDF ≤ 5MB |
| Luồng: các modal nào mở khi nào, nút nào dẫn tới đâu | “Không thể xóa chuyên ngành” → “Xem danh sách lớp” mở modal chi tiết |
| 7 file HTML, 6 vai trò, bộ chuyển vai trò demo | `WorkspaceHeader` |
| Logo `assets/img/logo-iuh-khoa-cntt.svg`, font Inter cục bộ | — |

### 1.2. ĐƯỢC phép thay đổi

- Bố cục, màu, chữ, khoảng cách, bo góc, bóng, icon trang trí (vẫn dùng `lucide-react`), chuyển động.
- Cách **trình bày** cùng một nội dung: ví dụ đổi `<select>` lọc trạng thái thành **segmented tabs** dùng đúng các nhãn trạng thái đã có; đổi modal chi tiết thành **side drawer**; đổi bảng thành **danh sách thẻ** trên mobile.
- Hiển thị **số liệu suy ra từ dữ liệu sẵn có** (đếm số đợt đang mở, đếm hồ sơ theo trạng thái) với nhãn **lấy từ nhãn sẵn có** (`ROUND_STATUSES`, `APPLICATION_STATUSES`…).
- `aria-label`, `title`, tooltip **lặp lại** nhãn đã có.
- Sửa lỗi hiển thị (ví dụ bộ lọc đang hiện mã thô `pending`, `open` thay vì nhãn tiếng Việt — xem mục 11).

### 1.3. Chuỗi mới tối thiểu được phép (allowlist)

Chỉ những vi-văn-bản hệ thống sau được thêm mới nếu thật sự cần; **mọi chuỗi mới ngoài danh sách phải ghi vào mục “Nhật ký chuỗi mới” ở cuối file này** để chủ dự án duyệt:

`"Đang xử lý…"`, `"Đang lưu…"`, `"Bắt buộc"` (sr-only cho dấu *), `"Mở menu"`/`"Đóng menu"` (aria), `"Trang trước"`/`"Trang sau"` (aria), `"Kéo thả tệp vào đây hoặc"` (vùng thả tệp), `"Bước {n}/{tổng}"`.

---

## 2. Hiện trạng

### 2.1. Điểm mạnh nên giữ

- Kiến trúc thư mục đã tách `components/ui | layout | data` và `features/*` rõ ràng.
- Đã có token CSS, font Inter Variable cục bộ, skip-link, focus-visible, `prefers-reduced-motion`.
- `Modal` đã có focus trap, Esc, khôi phục focus — **giữ logic này**, chỉ nâng cấp hình thức.
- Trạng thái được ánh xạ tường minh qua `status-definitions.js` (không regex lỏng).
- Màu brand `#153898` và nav `#10285E` có bản sắc học thuật tốt → **giữ làm trục chính**.

### 2.2. Vấn đề khiến giao diện chưa “đẳng cấp”

| # | Vấn đề | Bằng chứng trong code | Hệ quả |
|---|---|---|---|
| V1 | **Hơn 400 mã hex viết cứng trong JSX**, token CSS gần như không được dùng | `#182235` ×95, `#526175` ×80, `#153898` ×76, `#E4E8EF` ×63… | Không thể tinh chỉnh tổng thể, màu lệch nhau từng chỗ (`#1E3A8A` vs `#102C79`, `rose-600` vs `#B42318`) |
| V2 | **Thang chữ hỗn loạn**: `10.5px, 11px, 11.5px, 12px, 12.5px, 13px, 13.5px, 14px, 14.5px…` | rải khắp các file | Nhịp đọc không đều, cảm giác “chắp vá” |
| V3 | Mọi màn hình quản trị giống hệt nhau: **PageHeader + 1 bảng**; không có điểm nhấn thị giác, không có tổng quan | `App.jsx` + mọi `*Management.jsx` | Đơn điệu, thiếu “chất sản phẩm” |
| V4 | Mẫu “nhãn UPPERCASE nhỏ + giá trị” lặp lại ~30 lần bằng tay, mỗi chỗ một kiểu | các modal chi tiết | Không nhất quán |
| V5 | ~12 modal xác nhận xóa/chặn xóa viết lặp, căn giữa, icon tròn — kiểu “template” | majors, classes, teachers, students… | Thiếu tinh tế, khó bảo trì |
| V6 | Màn **xét duyệt hồ sơ** (quan trọng nhất cho cán bộ) nằm trong modal `xl`, thanh quyết định nằm cuối, chữ `text-xs` | `ApplicationReviewModal.jsx` | Khó đối chiếu, dễ bấm nhầm, đọc mỏi |
| V7 | Mobile: bảng chỉ cuộn ngang; drawer mobile không có icon, không focus-trap, nút đóng là ký tự `✕` | `App.jsx`, ảnh `.impeccable/reviews/student-accounts-mobile.png` | Trải nghiệm điện thoại kém |
| V8 | Toast nền đặc (xanh lá/đỏ đậm), chỉ 1 toast cùng lúc | `Toast.jsx` | Gắt mắt, mất thông báo khi có 2 sự kiện liên tiếp |
| V9 | Form: `<label>` không gắn `htmlFor`, dấu `*` không có text cho trình đọc màn hình, input file ẩn trong `<label>` không focus được bằng bàn phím | mọi form | Kém accessibility, trái với cam kết trong `DESIGN.md` |
| V10 | Trang công khai: chưa có “khoảnh khắc thương hiệu” — header 2 tầng + danh sách thẻ phẳng | `PublicHome.jsx`, `PublicHeader.jsx` | Ấn tượng đầu chưa xứng một chương trình **tài năng** |
| V11 | Stepper sinh viên cho nhảy bước tự do, không có thanh tiến độ, nút hành động không dính (sticky) | `StudentApplicationPage.jsx` | Sinh viên dễ lạc, phải cuộn xa để tìm nút |
| V12 | Bóng đổ/viền dùng màu xám trung tính, không ăn nhập với tông navy | `tokens.css` | Bề mặt “nhạt”, thiếu chiều sâu sang trọng |

---

## 3. Định hướng thẩm mỹ

### 3.1. Tên hướng: **“Academic Prestige × Operational Calm”**

Một cổng thông tin của **chương trình đào tạo tài năng** phải cho cảm giác *được tuyển chọn, chuẩn mực, đáng tin* — như một văn bằng in đẹp hay một ấn phẩm học thuật — nhưng khi làm việc thì *êm, rõ, không gây áp lực*.

| Tính từ mục tiêu | Thể hiện bằng |
|---|---|
| **Uy tín** | Navy sâu, đường kẻ mảnh tinh xảo (hairline), typographic hierarchy mạnh, căn lề chính xác |
| **Tinh tuyển** | Khoảng trắng rộng rãi, ít màu, một điểm nhấn “ánh đồng học thuật” dùng cực kỳ tiết chế |
| **Bình tĩnh khi làm việc** | Bề mặt sáng có tông xanh rất nhẹ, mật độ bảng vừa phải, trạng thái rõ ràng, chuyển động ngắn |
| **Hiện đại** | Bo góc mềm vừa phải, bóng đổ nhuộm navy nhiều lớp, header mờ kính nhẹ khi cuộn, vi tương tác mượt |

### 3.2. Ba “chữ ký” thị giác riêng của sản phẩm

Đây là những chi tiết tạo nên bản sắc, lặp lại nhất quán để người dùng nhận ra “đây là IUH Talent”:

1. **Đường kẻ danh dự (Honor Rule):** một vạch ngang mảnh 2px × 32px màu `accent-500` (ánh đồng) đặt ngay trên *eyebrow* của tiêu đề trang công khai và tiêu đề PageHeader. Chỉ xuất hiện ở tiêu đề cấp trang — không dùng chỗ khác.
2. **Mã định danh dạng “tem” (Ledger Code):** mọi mã (`DXT-2026-01`, `HS-2026-001`, MSSV, mã lớp) hiển thị bằng font mono tabular, chữ `brand-700`, nền `brand-50`, viền hairline `brand-100`, bo 6px — như số hiệu trên văn bản hành chính. Dùng một component `<CodeTag>` duy nhất.
3. **Hoa văn lưới học thuật (Academic Grid):** trên hero trang công khai và đầu sidebar, một lớp nền SVG lưới chấm/ô vuông rất mờ (opacity 0.04–0.06, màu trắng trên navy hoặc navy trên trắng). **Tĩnh**, không animate. Đây là kết cấu, không phải hiệu ứng.

### 3.3. Danh sách CẤM (chống “AI slop”, giữ cam kết trong `PRODUCT.md`)

- ❌ Chữ gradient, viền gradient, nút gradient, nền gradient sặc sỡ.
- ❌ Glow, neon, chấm nhấp nháy/pulse, shimmer chạy liên tục (ngoại trừ skeleton khi tải — tối đa 1.2s/chu kỳ, tắt khi reduced-motion).
- ❌ Glassmorphism nặng (blur > 12px, nền trong suốt khắp nơi). Chỉ cho phép header workspace `backdrop-blur-md` khi đã cuộn.
- ❌ Emoji trong UI, ảnh stock, minh họa 3D, icon nhiều màu.
- ❌ Bóng đổ đen đậm, bo góc > 20px cho thẻ, card lồng card lồng card.
- ❌ Số liệu “ấn tượng” bịa (ví dụ “98% hài lòng”), testimonial — vi phạm `PRODUCT.md`.
- ❌ Thêm nội dung/marketing copy mới.

---

## 4. Design tokens

> **Bắt buộc.** Gộp toàn bộ token vào `@theme` của Tailwind v4 để sinh utility class (`bg-brand-600`, `text-ink-900`, `rounded-card`, `shadow-raised`…). Sau đó **xóa toàn bộ hex trong JSX**.

### 4.1. Cấu trúc file CSS mới

```
src/styles.css            → @import "tailwindcss"; @import "./styles/theme.css"; base.css; components.css
src/styles/theme.css      → (MỚI) @theme { ...toàn bộ token... }  — thay thế tokens.css + @theme cũ
src/styles/base.css       → giữ @font-face, reset, skip-link, focus, reduced-motion; cập nhật theo token
src/styles/components.css → chỉ giữ những class khó viết bằng utility (ui-table, keyframes, select arrow)
```

`tokens.css` cũ: chuyển các biến `--color-*` cũ thành **alias** trỏ sang token mới trong 1 giai đoạn chuyển tiếp, rồi xóa ở cuối giai đoạn 3.

### 4.2. Bảng màu

#### Brand — Navy IUH (giữ `#153898` làm 600)

| Token | Hex | Dùng cho |
|---|---|---|
| `brand-25` | `#F7F9FF` | nền hàng được chọn rất nhẹ |
| `brand-50` | `#EEF3FF` | nền CodeTag, nền item active nhạt, nền info |
| `brand-100` | `#DCE6FF` | viền CodeTag, viền vùng chọn |
| `brand-200` | `#BACCF7` | focus ring nền sáng (kết hợp alpha) |
| `brand-300` | `#8DA8EC` | chỉ báo active trên nền navy |
| `brand-400` | `#5B7FDB` | icon trên nền tối |
| `brand-500` | `#2F59C4` | link hover, biểu đồ |
| **`brand-600`** | **`#153898`** | **hành động chính, link, CTA** |
| `brand-700` | `#102C79` | hover của primary, chữ CodeTag |
| `brand-800` | `#0D2463` | active/pressed |
| `brand-900` | `#10285E` | **nền sidebar, nền hero** (giữ màu nav hiện tại) |
| `brand-950` | `#0A1A40` | viền sidebar, lớp tối nhất |

#### Ink / Neutral — xám ánh lam (thay cho slate rời rạc)

| Token | Hex | Dùng cho |
|---|---|---|
| `ink-0` | `#FFFFFF` | surface |
| `ink-25` | `#FAFBFD` | header bảng, footer modal |
| `ink-50` | `#F4F6FA` | **canvas** (nền workspace) |
| `ink-100` | `#ECEFF5` | nền input disabled, nền chip |
| `ink-200` | `#E1E6EE` | **hairline / border-subtle** |
| `ink-300` | `#CBD3DF` | border control |
| `ink-400` | `#97A3B6` | icon phụ, placeholder |
| `ink-500` | `#626F85` | text muted (5.1:1 trên trắng, 4.7:1 trên canvas `ink-50`) |
| `ink-600` | `#526175` | **text secondary** (giữ màu cũ) |
| `ink-700` | `#3A4659` | text body đậm |
| `ink-800` | `#263043` | tiêu đề phụ |
| `ink-900` | `#182235` | **text primary** (giữ màu cũ) |

#### Accent — “Ánh đồng học thuật” (dùng cực tiết chế)

| Token | Hex | Quy tắc |
|---|---|---|
| `accent-50` | `#FBF6EA` | nền huy hiệu “tài năng” (chỉ ở hero) |
| `accent-300` | `#E2C47E` | Honor Rule trên nền navy |
| `accent-500` | `#B8892B` | Honor Rule trên nền sáng, icon `Award` |
| `accent-700` | `#7E5C17` | chữ trên nền accent-50 (≥ 4.5:1) |

> **Luật accent:** tổng diện tích accent trên một màn hình < 1%. **Không bao giờ** dùng accent cho nút, trạng thái, link. Không được nhầm với `warning`.

#### Semantic — trạng thái (giữ giá trị cũ, bổ sung bậc “solid”)

| Tone | `-fg` (chữ) | `-bg` (nền) | `-border` | `-solid` (chấm/icon) |
|---|---|---|---|---|
| success | `#166534` | `#F0FDF4` | `#BBF7D0` | `#16A34A` |
| warning | `#854D0E` | `#FFFBEB` | `#FDE68A` | `#D97706` |
| danger | `#B42318` | `#FEF3F2` | `#FECDD3` | `#DC2626` |
| info | `#1E40AF` | `#EFF6FF` | `#BFDBFE` | `#2563EB` |
| neutral | `#475569` | `#F1F5F9` | `#E2E8F0` | `#64748B` |

Token đặt tên: `--color-success-fg`, `--color-success-bg`, `--color-success-border`, `--color-success-solid` (tương tự cho các tone khác) → utility `text-success-fg`, `bg-success-bg`…

#### Focus

`--color-focus: #2563EB`; vòng focus chuẩn: `outline: 2px solid var(--color-focus); outline-offset: 2px;` Trên nền navy dùng `outline-color: #FFFFFF`.

### 4.3. Typography

**Font:** giữ duy nhất `Inter Variable` cục bộ. Bật:

```css
html {
  font-family: var(--font-sans);
  font-optical-sizing: auto;               /* Inter 4 có trục opsz → tiêu đề lớn tự thành “Inter Display” */
  font-feature-settings: "cv11", "ss03";   /* a một tầng gọn, chữ số dễ đọc; kiểm tra lại hiển thị tiếng Việt */
}
.num, td.num, .tabular { font-variant-numeric: tabular-nums; }
```

> Kiểm tra trực quan dấu tiếng Việt (ặ, ữ, ở, Ỹ) sau khi bật `cv11/ss03`. Nếu có ký tự lỗi, bỏ feature đó.

**Font mono cho mã/MSSV:** dùng system mono stack `ui-monospace, "SF Mono", "Cascadia Mono", "Segoe UI Mono", Menlo, Consolas, monospace` (không tải font mới).

**Tùy chọn (P3):** font serif hiển thị cho *duy nhất* H1 trang công khai — `Source Serif 4` (hỗ trợ tiếng Việt), self-host `woff2` subset Latin+Vietnamese trong `assets/fonts/`, **không** dùng Google Fonts CDN. Nếu không làm, H1 dùng Inter weight 700 opsz 32.

**Thang chữ (root `html { font-size: 16px }` — đổi từ 15px; điều chỉnh mọi rem tương ứng):**

| Token | Size / Line-height | Weight | Tracking | Dùng cho |
|---|---|---|---|---|
| `text-display` | 44 / 52 (mobile 32/40) | 700 | -0.022em | H1 trang công khai |
| `text-title-1` | 28 / 36 (mobile 24/32) | 700 | -0.018em | H1 trang workspace (PageHeader) |
| `text-title-2` | 20 / 28 | 650 | -0.012em | Tiêu đề section, tiêu đề modal lớn, tên đợt trên thẻ |
| `text-title-3` | 16 / 24 | 600 | -0.006em | Tiêu đề khối, tiêu đề modal nhỏ |
| `text-body-lg` | 16 / 26 | 400 | 0 | Mô tả trang, đoạn văn công khai |
| `text-body` | 14 / 22 | 400 | 0 | **Mặc định** cho bảng, form, nội dung |
| `text-body-sm` | 13 / 20 | 400/500 | 0 | Hint, metadata, footer bảng |
| `text-caption` | 12 / 16 | 500 | 0.01em | Badge, chú thích nhỏ |
| `text-overline` | 11.5 / 16 | 600 | 0.08em, UPPERCASE | Eyebrow, nhãn nhóm menu, nhãn DescriptionList |

**Quy tắc:**
- Line-height tối thiểu 1.25 cho tiêu đề tiếng Việt (dấu chồng tầng cần chỗ).
- Không dùng `italic` cho thông tin trạng thái (hiện có ở PublicHome: “Đang trong kỳ chấm”) → đổi sang chữ `ink-500` thường + icon.
- Không dùng chữ < 12px ở bất kỳ đâu.
- Đoạn văn tối đa 68ch (`max-w-[68ch]`).

### 4.4. Khoảng cách & lưới

- Hệ 4px. Chỉ dùng các bậc Tailwind: `1 2 3 4 5 6 8 10 12 16 20` (4–80px). **Cấm** `py-4.5`, `gap-2.5` lẻ tẻ trừ khi đã có trong token.
- Gutter trang: mobile 16px, tablet 24px, desktop 32px.
- Khoảng giữa PageHeader và nội dung: 24px (desktop 32px).
- Khoảng giữa các section trong trang: 32px.
- Nội dung workspace: `max-w-[1440px]`; trang form (hồ sơ sinh viên, thông tin cá nhân): `max-w-[1080px]`; trang công khai: `max-w-[1200px]`.

### 4.5. Bo góc

| Token | Giá trị | Dùng cho |
|---|---|---|
| `rounded-xs` | 6px | badge, CodeTag, chip |
| `rounded-control` | 10px | button, input, select, icon button |
| `rounded-card` | 14px | card, table panel, khối thông tin |
| `rounded-modal` | 18px | modal, drawer (cạnh trong), bottom sheet (2 góc trên) |
| `rounded-full` | 9999px | avatar, chấm trạng thái, toggle |

### 4.6. Đổ bóng (nhuộm navy, nhiều lớp)

```css
--shadow-hairline: 0 0 0 1px rgb(16 40 94 / 0.06);
--shadow-raised:   0 1px 2px rgb(16 40 94 / 0.06), 0 1px 1px rgb(16 40 94 / 0.04);
--shadow-card:     0 1px 2px rgb(16 40 94 / 0.05), 0 4px 12px -4px rgb(16 40 94 / 0.08);
--shadow-overlay:  0 8px 24px -6px rgb(16 40 94 / 0.16), 0 2px 6px -2px rgb(16 40 94 / 0.08);
--shadow-modal:    0 24px 48px -12px rgb(10 26 64 / 0.28), 0 8px 16px -8px rgb(10 26 64 / 0.12);
--shadow-focus:    0 0 0 4px rgb(37 99 235 / 0.16);
```

Card mặc định: `border border-ink-200 shadow-card`. Hover card tương tác: `shadow-overlay` + viền `ink-300`, **không** dịch chuyển quá 1px.

### 4.7. Chuyển động

```css
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-emphasized: cubic-bezier(0.3, 0, 0, 1.2);  /* chỉ cho popover/bottom sheet mở ra */
--duration-fast: 120ms;   /* hover, màu */
--duration-base: 180ms;   /* dropdown, tooltip, tab indicator */
--duration-slow: 260ms;   /* modal, drawer, bottom sheet */
```

### 4.8. Z-index

`--z-sticky: 20` (header, thanh hành động dính) · `--z-sidebar: 30` · `--z-dropdown: 40` · `--z-overlay: 50` (modal/drawer) · `--z-toast: 60` · `--z-skip: 70`.

### 4.9. Bảng chuyển đổi hex → token (dùng cho codemod)

| Hex cũ trong JSX | Token mới |
|---|---|
| `#182235` | `ink-900` |
| `#526175` | `ink-600` |
| `#334155`, `slate-700` | `ink-700` |
| `#64748B`, `slate-500` | `ink-500` |
| `#8794A7`, `slate-400` | `ink-400` |
| `#E4E8EF`, `slate-200`, `slate-100` (viền) | `ink-200` |
| `#CBD5E1`, `slate-300` | `ink-300` |
| `#F8FAFC`, `#FAFCFF` | `ink-25` |
| `#F5F7FA` | `ink-50` |
| `#F1F5F9`, `slate-100` (nền) | `ink-100` |
| `#153898` | `brand-600` |
| `#102C79` | `brand-700` |
| `#0B215E`, `#1E3A8A` | `brand-800` |
| `#10285E` | `brand-900` |
| `#0B1E48` | `brand-950` |
| `#EEF3FF` | `brand-50` |
| `#DBE5FF` | `brand-100` |
| `blue-200`, `blue-300` (trên sidebar) | `brand-300` |
| `#B42318`, `rose-600`, `text-[#B42318]` | `danger-fg` |
| `#FEF3F2`, `rose-50` | `danger-bg` |
| `#FECDD3` | `danger-border` |
| `#DC2626` | `danger-solid` |
| `#911B12`, `#73140C` | `danger-fg` + hover qua `color-mix` hoặc token `danger-hover: #912018` |
| `#166534`, `emerald-700` | `success-fg` |
| `#F0FDF4` | `success-bg` |
| `#BBF7D0` | `success-border` |
| `#16A34A` | `success-solid` |
| `#854D0E` | `warning-fg` |
| `#FFFBEB` | `warning-bg` |
| `#FDE68A` | `warning-border` |
| `#D97706`, `#B45309` | `warning-solid` |
| `#1E40AF` | `info-fg` |
| `#EFF6FF` | `info-bg` |
| `#BFDBFE` | `info-border` |
| `#2563EB` | `focus` / `info-solid` |

Sau codemod, chạy kiểm tra: `grep -rnE "\[#[0-9A-Fa-f]{3,6}\]|text-\[[0-9.]+px\]" src` phải **trả về 0 kết quả** (ngoại trừ file `theme.css`).

---

## 5. Thư viện thành phần

> Mỗi component đặt trong `src/components/ui/` (hoặc `layout/`, `data/`). Giữ API cũ khi có thể để tránh sửa nhiều chỗ; thêm prop mới thì có giá trị mặc định tương thích.

### 5.1. `Button` (nâng cấp)

- **Variants:** `primary`, `secondary`, `tertiary` (= ghost cũ, đổi tên nhưng giữ alias `ghost`), `danger`, `dangerOutline`, `warningOutline` (MỚI — thay cho đoạn `className="text-[#854D0E] border-[#FDE68A]…"` của nút “Yêu cầu bổ sung”), `link`.
- **Sizes:** `sm` 32px, `md` 40px, `lg` 48px (CTA công khai). Chữ: sm 13px/500, md 14px/600, lg 15px/600.
- **Prop mới:** `loading` (hiện spinner 16px thay icon trái, giữ nguyên độ rộng nút, `aria-busy="true"`, disabled), `fullWidth`.
- **Primary:** nền `brand-600`, chữ trắng, `shadow-raised`, **inset highlight** `inset 0 1px 0 rgb(255 255 255 / 0.12)` để có độ “dày” sang trọng; hover `brand-700`; active `brand-800` + `translate-y-px`.
- **Secondary:** nền trắng, viền `ink-300`, chữ `ink-900`, `shadow-raised`; hover nền `ink-25`, viền `ink-400`.
- **Disabled:** không dùng `opacity` toàn cục (hiện `base.css` set `opacity: .55` cho mọi button) → dùng màu riêng: nền `ink-100`, chữ `ink-400`, viền `ink-200`.
- Icon tự động 16px (sm: 14px), khoảng cách icon–chữ 8px.

### 5.2. `IconButton`

- Sizes 28 / 34 / 40 px. Bắt buộc có `label` (đã có). Thêm **Tooltip** (5.14) thay cho `title` gốc của trình duyệt.
- Trong cột “Thao tác” của bảng: variant `tertiary` (không viền) mặc định, hiện viền khi hover hàng — giảm nhiễu thị giác của 3 ô vuông viền × 10 hàng (thấy rõ trong `classes-desktop.png`). Nút xóa: icon `ink-500`, hover chuyển `danger-fg` + nền `danger-bg`.

### 5.3. `Field` (MỚI — bắt buộc)

Bao label + control + hint + error, tự sinh `id` bằng `useId`:

```jsx
<Field label="Tên khoa phụ trách" required hint="…" error={err}>
  {(props) => <Input name="faculty" {...props} />}
</Field>
```

- `props` truyền xuống: `id`, `aria-describedby` (hint + error), `aria-invalid`, `required`.
- Dấu bắt buộc: `<span aria-hidden="true" class="text-danger-fg">*</span><span class="sr-only">Bắt buộc</span>`.
- Hint: `text-body-sm text-ink-500` dưới control, cách 6px. (Ví dụ “Yêu cầu chuẩn: ≥ 38 tín chỉ” trong wizard sinh viên → chuyển thành `hint`.)
- Error: icon `AlertCircle` 14px + chữ `danger-fg`, `role="alert"` khi xuất hiện.

### 5.4. `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`

- Chiều cao 40px (sm 34px, lg 48px), padding ngang 12px, `rounded-control`, viền `ink-300`, nền trắng, `shadow-raised` rất nhẹ.
- Hover viền `ink-400`. Focus: viền `brand-600` + `shadow-focus`. Invalid: viền `danger-fg` + ring đỏ nhạt.
- Disabled/readonly (thông tin định danh bị khóa ở wizard sinh viên): nền `ink-50`, chữ `ink-700`, **thêm icon `Lock` 14px** ở cuối input để giải thích vì sao không sửa được — không thêm chữ.
- `Input` hỗ trợ `leadingIcon`, `trailing` (ví dụ đơn vị “/ 4.0”, “điểm” — lấy từ nội dung đã có ở bước 3).
- `Select`: giữ native `<select>` (tốt cho mobile & a11y), chỉ style lại mũi tên.
- `Checkbox`: custom 18px, bo 5px, check icon trắng trên `brand-600`, vùng bấm ≥ 40px (bao cả label).

### 5.5. `StatusBadge` (tinh chỉnh)

- Giữ API `domain`. Giao diện: chiều cao 24px, padding 0 10px, `rounded-full` (pill) thay vì 6px để phân biệt với CodeTag; chấm 6px màu `-solid`; chữ `text-caption` weight 600; nền `-bg`; viền `-border` 1px.
- Prop mới `size="sm|md"`, `appearance="soft|outline"` (outline dùng trong bảng dày đặc).
- **Không** đổi nhãn — nhãn vẫn lấy từ `status-definitions.js`.

### 5.6. `CodeTag` (MỚI — chữ ký thị giác #2)

```jsx
<CodeTag>{round.id}</CodeTag>   // DXT-2026-01
<CodeTag tone="plain">{app.studentId}</CodeTag>  // MSSV trong bảng: không nền, chỉ mono + brand-700
```

- Mono, 12.5px/600, `tabular-nums`, `brand-700` trên `brand-50`, viền `brand-100`, `rounded-xs`, padding 2px 8px.
- Tùy chọn `copyable`: hover hiện icon `Copy` 12px; bấm → copy + toast “Đã sao chép” (ghi vào nhật ký chuỗi mới nếu dùng).

### 5.7. `DescriptionList` (MỚI — thay ~30 khối “nhãn UPPERCASE + giá trị”)

```jsx
<DescriptionList columns={3} items={[
  { label: "Tên lớp", value: c.className },
  { label: "Sĩ số", value: <Capacity current={c.current} max={c.capacity} /> },
  { label: "Trạng thái", value: <StatusBadge domain="class">{c.status}</StatusBadge> },
]} />
```

- Nhãn: `text-overline text-ink-500`; giá trị: `text-body font-medium text-ink-900`, cách 4px.
- Biến thể `layout="grid"` (ô có hairline phân cách, không mỗi ô một card) và `layout="inline"` (nhãn trái – giá trị phải, dùng trong drawer hẹp).
- **Không** bọc mỗi ô bằng một card riêng như hiện tại (lớp chi tiết đang có 6 card nhỏ) — dùng một khối nền `ink-25` với đường kẻ dọc `ink-200` giữa các ô.

### 5.8. `Modal` (nâng cấp hình thức, giữ logic focus)

- Sizes giữ nguyên `sm | md | lg | xl`. Bo `rounded-modal`, `shadow-modal`, viền hairline.
- Backdrop: `rgb(10 26 64 / 0.48)` + `backdrop-blur-[3px]`.
- Header: padding 24px, tiêu đề `text-title-3` (sm) / `text-title-2` (lg, xl), mô tả `text-body-sm ink-600`. Đường kẻ dưới header **chỉ hiện khi nội dung đã cuộn** (dùng IntersectionObserver sentinel).
- Footer: dính đáy, nền `ink-25`, hairline trên, nút căn phải; nút chính ở **ngoài cùng bên phải**.
- **Mobile (< 640px): tự chuyển thành bottom sheet** — chiếm 100% rộng, tối đa 92vh, bo 2 góc trên, có thanh kéo 36×4px ở đỉnh (trang trí), trượt lên từ dưới 260ms.
- **Bảo vệ dữ liệu form:** thêm prop `dismissible` (mặc định `true`). Với modal chứa form (thêm/sửa, nộp hồ sơ công khai), đặt `closeOnBackdrop={false}` để tránh mất dữ liệu khi bấm nhầm ra ngoài; Esc và nút Đóng vẫn hoạt động.
- Hiện có trường hợp form tự render nút trong body (`footer={null}` + `<div className="… border-t …">`). Chuẩn hóa: đưa nút vào prop `footer` và liên kết với form bằng `<Button type="submit" form={formId}>` để footer luôn dính đáy.

### 5.9. `ConfirmDialog` (MỚI — gộp ~12 modal xác nhận/chặn)

```jsx
<ConfirmDialog
  open={!!deleteModal}
  tone="danger"            // danger | warning | info | success
  icon={Trash2}
  title="Xác nhận xóa chuyên ngành"
  description={<>Bạn có chắc chắn muốn xóa chuyên ngành <strong>{m.name}</strong> thuộc <strong>{m.faculty}</strong>?</>}
  note="Thao tác này không thể hoàn tác sau khi thực hiện."
  confirmLabel="Xác nhận xóa"
  cancelLabel="Hủy"
  onConfirm={…} onCancel={…}
/>
```

- Bố cục **căn trái** (không căn giữa): icon 40px trong ô vuông bo 12px nền `{tone}-bg` ở góc trái trên; tiêu đề + mô tả bên phải; `note` hiển thị trong một dải `{tone}-bg` mảnh phía dưới.
- Nút xác nhận đúng tone (`danger` cho xóa/từ chối). Focus mặc định vào nút **Hủy** với hành động nguy hiểm.
- Biến thể “thông báo chặn” (không thể xóa): chỉ 1–2 nút, tone `warning`. Giữ đúng các nút hiện có (“Đóng thông báo” / “Xem danh sách lớp”, “Đã hiểu”, “Quay lại kiểm tra”).
- **Toàn bộ chuỗi giữ nguyên** từ các modal hiện tại.

### 5.10. `Drawer` (MỚI)

- Panel trượt từ phải, rộng 480px (md) / 640px (lg) / 880px (xl), cao 100vh, `shadow-modal`, header dính + footer dính.
- Dùng cho: **xem chi tiết** (chuyên ngành → danh sách lớp, chi tiết lớp, chi tiết giảng viên/sinh viên/phân quyền/đợt) — người dùng vẫn thấy bảng phía sau, cảm giác “đang tra cứu” thay vì “bị chặn”.
- Mobile: tự thành bottom sheet toàn màn hình.
- Dùng chung logic focus-trap với Modal (tách ra hook `useDialogA11y`).

### 5.11. `Toast` → `ToastStack` (nâng cấp)

- Store đổi từ 1 toast thành **mảng tối đa 3** (`demo-store.jsx`: `toasts`, `showToast` push, `hideToast(id)`), giữ chữ ký `showToast(message, type)` để không phải sửa nơi gọi.
- Giao diện: **nền trắng**, viền hairline, `shadow-overlay`, **thanh màu 3px bên trái** theo tone, icon tone `-solid`, chữ `ink-900`. Bỏ nền đặc xanh/đỏ.
- Vị trí: desktop góc dưới phải, mobile trên cùng giữa (tránh che thanh hành động dính ở đáy).
- Thời gian: success/info 4s, warning 6s, error **không tự đóng**. Tạm dừng đếm khi hover/focus.
- `aria-live`: `polite` (success/info/warning), `assertive` + `role="alert"` (error).

### 5.12. `EmptyState`

- Icon trong ô vuông 48px bo 14px, nền `ink-50`, viền hairline, icon `ink-400` — kèm **hoa văn lưới chấm mờ** (chữ ký #3) phía sau, đường kính 160px, opacity 0.5. Tiêu đề `text-title-3`, mô tả `text-body-sm ink-600 max-w-[40ch]`.
- Biến thể `compact` cho trong bảng/modal (padding 32px), `default` (56px).

### 5.13. `Pagination`

- Giữ logic, đổi hình: các nút số 32px **không viền**, trang hiện tại nền `brand-600` chữ trắng; hover nền `ink-100`. Nút Trước/Sau `tertiary` có icon.
- Bên trái: “Hiển thị **1–10** trong **48** bản ghi” (giữ chữ) — số dùng `tabular-nums`.
- Mobile: ẩn dãy số, chỉ còn `‹ Trang 2/5 ›`.
- Khi đổi trang: cuộn mượt tới đầu bảng (không phải đầu trang) và đưa focus về `<caption>`/tiêu đề bảng.

### 5.14. `Tooltip` (MỚI, nhẹ)

- Hiện sau 400ms hover hoặc ngay khi focus bàn phím; nền `ink-900`, chữ trắng 12px, bo 6px, mũi tên 6px. Đặt trên/dưới tự động (đơn giản: mặc định trên, lật xuống nếu sát mép).
- Dùng cho IconButton, item sidebar khi thu gọn, CodeTag copyable.

### 5.15. `SegmentedControl` / `FilterTabs` (MỚI)

- Thay `<select>` lọc trạng thái ở **trang công khai** và **trang phê duyệt** bằng dãy tab có **đếm số**:
  `Tất cả 4 · Đang tiếp nhận 1 · Đang xét duyệt 1 · Chưa mở 1 · Đã kết thúc 1`
  (nhãn lấy từ `ROUND_STATUSES` / `APPLICATION_STATUSES`; “Tất cả” = `filterAllLabel` đã có).
- Tab active: nền trắng `shadow-raised` trên rãnh `ink-100` (kiểu iOS segmented) **hoặc** gạch chân 2px `brand-600` (kiểu tab) — chọn kiểu rãnh cho toolbar, kiểu gạch chân cho trang công khai.
- Cuộn ngang trên mobile với mask mờ 2 mép. `role="tablist"` hoặc nhóm radio — dùng **radio group** (`role="radiogroup"`) vì đây là bộ lọc.

### 5.16. `Stepper` (MỚI — cho wizard sinh viên)

Xem 8.10.

### 5.17. `Timeline` (MỚI — gộp 2 bản lịch sử đang viết tay)

- Dọc; mỗi mốc: chấm 10px (màu theo loại hành động: nộp = `brand-600`, duyệt/xác nhận = `success-solid`, bổ sung = `warning-solid`, từ chối = `danger-solid`), đường nối `ink-200` 2px.
- Dòng 1: **hành động** (`text-body font-semibold`) · tác nhân (`ink-600`) · vai trò trong chip nhỏ.
- Dòng 2: thời gian `text-body-sm ink-500 tabular-nums`.
- Ghi chú: khối trích dẫn với vạch trái 2px `ink-300`, nền `ink-25`, **không in nghiêng**, có dấu “ ” như hiện tại.
- Dùng ở `ApplicationReviewModal` và màn theo dõi hồ sơ sinh viên.

### 5.18. `FileDropzone` + `FileItem` (MỚI)

- Vùng thả: viền đứt 1.5px `ink-300`, bo `rounded-card`, nền `ink-25`, icon `UploadCloud` 24px `brand-600`; hover/kéo tệp vào: viền `brand-600`, nền `brand-25`.
- **Input file phải focus được bằng bàn phím**: dùng `<input type="file" class="sr-only">` + `<label htmlFor>` có `tabIndex` hoặc một `<Button>` gọi `inputRef.current.click()`.
- Hỗ trợ kéo-thả (`onDragOver/onDrop`) — kiểm tra PDF ≤ 5MB y như logic hiện tại, giữ nguyên thông điệp lỗi.
- `FileItem`: icon PDF (FileText trong ô đỏ nhạt `danger-bg` — màu nhận diện PDF quen thuộc), tên tệp (cắt giữa `…` nếu dài), dung lượng `tabular-nums`, trạng thái ✓ hợp lệ / ⚠ lỗi, các nút “Xem”, “Thay thế tệp”, “Xóa”.

### 5.19. `Avatar`

- Vuông bo 10px (giữ phong cách hiện tại) hoặc tròn trong trang hồ sơ; nền `brand-900`, chữ trắng; viền trong `inset 0 0 0 1px rgb(255 255 255 / 0.12)`. Sizes 28/32/40/80.

### 5.20. `Skeleton` (tùy chọn)

- Dùng khi đổi vai trò/đổi trang (giả lập 150–250ms để chuyển cảnh mượt) — **chỉ khi** không làm chậm cảm nhận. Có thể bỏ qua vì dữ liệu là local.

### 5.21. `Capacity` (MỚI — hiển thị sĩ số)

- Thay chuỗi `20 / 30` bằng: số `20/30` (tabular) + thanh mảnh 48×4px bên dưới/bên cạnh, màu `brand-600`; ≥ 90% → `warning-solid`; = 100% → `success-solid`. Tooltip lặp lại “Sĩ số”. Nội dung số giữ nguyên.

---

## 6. Khung ứng dụng

### 6.1. Sidebar (desktop ≥ 1024px)

**Giữ:** thu gọn/mở rộng 248↔72px, kéo đổi độ rộng 200–360px, phím mũi tên, nhấp đúp đặt lại.
**Nâng cấp:**

```
┌──────────────────────────┐
│ ┌──────────────────────┐ │  ← “Logo plate”: thẻ trắng bo 12px trong nền navy,
│ │  [LOGO IUH · CNTT]   │ │     padding 10px, shadow-raised. Logo giữ nguyên.
│ └──────────────────────┘ │
│  ── (honor rule accent)  │
│  QUẢN TRỊ VIÊN           │  ← overline, brand-300  (role.label – đã có)
│  Phạm vi: Toàn trường    │  ← body-sm, white/70    (role.scope – đã có)
│                          │
│ ▍📖 Quản lý chuyên ngành  │  ← item active: nền white/8, vạch trái 3px brand-300,
│   🎓 Quản lý lớp          │     chữ trắng 600; icon trắng
│   👤 Tài khoản giảng viên │  ← item thường: chữ white/72, icon white/60
│   …                      │     hover: nền white/5, chữ trắng
│                          │
│ ──────────────────────── │
│  [⇤] Thu gọn             │
└──────────────────────────┘
```

- Nền `brand-900` phẳng + **hoa văn lưới chấm** (chữ ký #3) ở 160px đầu, opacity 0.05, fade xuống bằng mask (mask là hiệu ứng che, không phải gradient màu — được phép).
- Item cao 40px, bo 10px, padding 12px, icon 18px, khoảng cách item 2px.
- Chỉ báo active có transition 180ms (vạch trái trượt theo item — tùy chọn, dùng `layoutId`-style bằng CSS transform tính vị trí).
- Khi thu gọn: icon căn giữa, **Tooltip bên phải** hiện tên menu (thay `title`).
- Tay nắm resize: vạch 2px chỉ hiện khi hover vùng 6px ở mép phải; khi đang kéo → `brand-300`.
- Lưu `collapsed` và `width` vào `localStorage` (try/catch) để giữ giữa các lần tải.

### 6.2. Header workspace

- Cao 64px, nền trắng; **khi `main` cuộn > 4px**: nền `white/85` + `backdrop-blur-md` + hairline dưới + `shadow-raised`. Ở trạng thái đầu: không bóng, hairline mờ.
- Trái: nút menu (mobile) — breadcrumb `Cổng xét tuyển › {role.label} › {activeLabel}` (giữ nguyên), mục cuối `ink-900 font-semibold` thay vì xanh; dấu phân cách `ChevronRight` 14px `ink-300`.
- Phải: chip phạm vi (giữ nội dung `role.scope`), icon `Shield` → `MapPin`/`Building2` tùy chọn; chip nền `brand-50`, viền `brand-100`, bo full.
- Nút tài khoản: Avatar 32 + tên + vai trò + chevron xoay 180° khi mở.
- **Menu tài khoản:** `rounded-card`, `shadow-overlay`, rộng 288px, animation scale 0.97→1 + fade 180ms từ góc phải trên. Thêm điều hướng bàn phím ↑↓ giữa các `menuitem`, Home/End, Esc đóng (đã có). Mục “Chuyển vai trò thử nghiệm”: mỗi vai trò có Avatar 24 với initials — vai trò hiện tại có `Check` icon thay vì chấm tròn.
- **Tùy chọn (P3): Command palette `Ctrl/⌘ + K`** — ô tìm kiếm lọc các mục menu của vai trò hiện tại (chỉ dùng nhãn menu đã có). Rất hữu ích cho cán bộ dùng nhiều vai trò.

### 6.3. Main canvas

- Nền `ink-50`. Bỏ `bg-[#F5F7FA]` viết cứng trong `App.jsx`.
- Padding: 16 / 24 / 32px. Max width 1440px.
- Giữ `id="workspace-main"` + `tabIndex={-1}`; khi đổi trang, **đưa focus vào H1** của trang mới và cuộn về đầu (hiện chưa làm).

### 6.4. `PageHeader` (nâng cấp)

```
  ━━  (honor rule 32×2px accent-500)
  QUẢN TRỊ VIÊN                                  ← overline ink-500 (role.label — đã có)
  Quản lý chuyên ngành toàn trường               ← text-title-1 ink-900 (pageMeta.title)
  Danh mục các chuyên ngành đào tạo và số lượng   ← text-body-lg ink-600, max 68ch
  lớp CN/KSTN trực thuộc.
                                       [ + Thêm chuyên ngành mới ]   ← action (tùy trang)
```

- Prop mới: `eyebrow` (mặc định `currentRole.label`), `action`, `meta` (khu vực nhỏ cho chip/đếm số).
- **Nút “Thêm …” chuyển từ toolbar bảng lên PageHeader** ở desktop (vị trí chuẩn của hành động cấp trang). `NGHIEP-VU.md` yêu cầu nút “nằm ở trên cùng của danh sách” → PageHeader nằm ngay trên danh sách, vẫn đúng yêu cầu. Mobile: nút nổi rộng toàn phần dưới PageHeader.

### 6.5. Mobile (< 1024px)

- **Drawer điều hướng:** dùng component `Drawer` (trái, 300px) để có focus-trap, Esc, backdrop; nội dung y như sidebar desktop (logo plate, role, menu **có icon**, item active cùng kiểu). Nút đóng dùng `IconButton` với icon `X` (bỏ ký tự “✕”).
- Header mobile: nút menu + tiêu đề trang hiện tại (truncate) + avatar.
- Không còn thanh menu cuộn ngang như ảnh review cũ.

---

## 7. Mẫu bảng dữ liệu chuẩn

Áp dụng cho: Chuyên ngành, Lớp, Giảng viên, Sinh viên, Phân quyền, Đợt xét tuyển, Tiêu chí, Phê duyệt/Hồ sơ/Kết quả, Đặt lại mật khẩu.

### 7.1. Cấu trúc

```
┌ TablePanel (rounded-card, shadow-card, border ink-200) ───────────────────────┐
│ Toolbar:  [🔍 Tìm theo …            ] [Lọc ▾ / FilterTabs]   [↺ Đặt lại]      │
│           Chip bộ lọc đang áp dụng: (Khoa CNTT ✕)                              │
├────────────────────────────────────────────────────────────────────────────────┤
│ KHOA ▴          CHUYÊN NGÀNH          SỐ LƯỢNG LỚP           THAO TÁC          │ ← header dính
├────────────────────────────────────────────────────────────────────────────────┤
│ Khoa CNTT       Kỹ thuật phần mềm          3                  👁 ✎ 🗑           │
│ …                                                                              │
├────────────────────────────────────────────────────────────────────────────────┤
│ Hiển thị 1–10 trong 76 bản ghi · Trang 1/8                 ‹ 1 2 3 … 8 ›       │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2. Quy tắc hình thức

- Header bảng: nền `ink-25`, chữ `text-overline` `ink-500`, cao 44px, **dính** (`position: sticky; top: 0`) khi bảng cao hơn khung.
- Hàng: cao tối thiểu 56px, padding ngang 16px (cột đầu 20px), hairline `ink-200` giữa các hàng; **không** kẻ dọc.
- Hover hàng: nền `brand-25`. Hàng đang mở drawer chi tiết: nền `brand-50` + vạch trái 2px `brand-600`.
- Cột mã/MSSV: `CodeTag tone="plain"` (mono, `brand-700`). Cột tên người/tên chính: `font-semibold ink-900`. Cột phụ: `ink-600`.
- Cột số: căn phải hoặc giữa, `tabular-nums`. “Số lượng lớp”: chip tròn nền `brand-50` (giữ) nhưng nếu = 0 thì chữ `ink-400` nền `ink-100` để phân biệt.
- Cột “Khóa”: giữ chip `K20`, đổi sang `CodeTag tone="neutral"`.
- Cột “Thao tác”: căn phải, IconButton `tertiary` (mục 5.2), khoảng cách 4px.
- Toolbar: cao 64px, padding 16px; ô tìm kiếm rộng 320–420px, có phím tắt `/` để focus (hiện gợi ý `kbd` mờ bên phải ô — **chỉ ký tự “/”**, không thêm chữ).
- **Chip bộ lọc đang áp dụng** (tùy chọn): hiển thị giá trị lọc hiện tại (đã là nội dung có sẵn) với nút ✕ gỡ từng điều kiện.
- Tìm kiếm có debounce 150ms; giữ nguyên logic lọc.
- **Tùy chọn:** sắp xếp cột (click header, icon ▴▾, `aria-sort`) cho các cột văn bản/số — không đổi thứ tự cột.

### 7.3. Responsive bảng (bắt buộc)

- **≥ 1024px:** bảng đầy đủ.
- **640–1023px:** bảng, ẩn bớt cột phụ bằng class `hidden md:table-cell` theo thứ tự ưu tiên ghi trong mỗi trang (mục 8); thông tin cột bị ẩn hiển thị dưới dạng dòng phụ trong ô cột chính.
- **< 640px:** **chuyển thành danh sách thẻ** (`<ul role="list">`), mỗi thẻ:

```
┌────────────────────────────────────────┐
│ KSTN-KTPM-K20              [Đang h.động]│  ← CodeTag + StatusBadge
│ Kỹ thuật phần mềm · K20                 │  ← dòng phụ
│ ThS. Phạm Thị Dung                      │
│ Sĩ số  20/30 ▬▬▬▬▬▬▭▭                   │
│ ─────────────────────────────────────── │
│ [Xem chi tiết]                 [✎] [🗑] │
└────────────────────────────────────────┘
```

- Tạo component `ResponsiveTable` nhận `columns` (có `priority`, `render`, `mobileRender`) để không viết hai lần.
- Phân trang vẫn 10 mục/trang ở mọi khổ.

---

## 8. Đặc tả từng màn hình

> Mỗi màn hình liệt kê: **Bố cục mới**, **Chi tiết**, **Giữ nguyên**, **Ưu tiên cột (cho responsive)**.

### 8.1. Trang công khai — `PublicHome.jsx` + `PublicHeader.jsx`

**Mục tiêu:** ấn tượng đầu tiên “đây là một chương trình tinh hoa”, nhưng 1 cú cuộn là tới danh sách đợt.

**Header (một tầng, gọn):**
- Cao 72px, nền trắng, hairline dưới; khi cuộn: `white/90` + blur + `shadow-raised`, thu còn 60px.
- Trái: logo (giữ). Giữa/trái: tên cổng 2 dòng (giữ chữ): dòng 1 `text-title-3 brand-900`, dòng 2 `text-body-sm ink-600`.
- Phải: link “Thông tin xét tuyển” (anchor), “Website trường IUH ↗”, nút **Đăng nhập** (`primary md`).
- Dòng khẩu hiệu “Học thuật · Chất lượng · Đổi mới” (giữ chữ) chuyển xuống **hero** làm dòng chữ overline nhỏ, thay vì thanh nav navy riêng → header bớt nặng.
- Mobile: logo + nút Đăng nhập; 2 link vào menu icon `Menu`.

**Hero (MỚI về bố cục, KHÔNG thêm nội dung):**

```
┌───────────────────────────── nền brand-900 + lưới chấm mờ ─────────────────────────────┐
│  ━━ (honor rule accent-300)                                                              │
│  CHƯƠNG TRÌNH CỬ NHÂN & KỸ SƯ TÀI NĂNG (CN/KSTN)     ← overline, accent-300             │
│  Các đợt xét tuyển                                    ← text-display, trắng              │
│  Tra cứu thông tin, điều kiện tiêu chuẩn và chọn đợt  ← body-lg, white/75, max 56ch      │
│  xét tuyển phù hợp với chương trình đào tạo của bạn.                                     │
│                                                                                          │
│  ┌ Ô tìm kiếm lớn 56px, nền trắng, shadow-overlay ───────────────────────┐               │
│  │ 🔍 Tìm theo tên đợt, mã đợt hoặc chuyên ngành...                       │               │
│  └────────────────────────────────────────────────────────────────────────┘               │
│  Học thuật · Chất lượng · Đổi mới          ĐẠI HỌC CÔNG NGHIỆP TP. HỒ CHÍ MINH            │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

- Chiều cao hero ~360px desktop, ~300px mobile. Phần dưới hero **chồng lên** 32px bởi thanh FilterTabs (thẻ trắng nổi `shadow-card`) — tạo chiều sâu.
- Tất cả chữ trong hero là chữ **đã có** (eyebrow, H1, mô tả, khẩu hiệu, tên trường).

**Thanh lọc:** `FilterTabs` kiểu gạch chân: `Tất cả trạng thái · Đang mở (Đang nhận hồ sơ) · Đang xét duyệt · Chưa mở · Đã kết thúc` kèm số đếm; nút “Đặt lại” xuất hiện khi có lọc. Dòng đếm “{n} đợt xét tuyển khả dụng” giữ nguyên (`role="status"`).

**Thẻ đợt xét tuyển (thiết kế lại):**

```
┌──────────────────────────────────────────────────────────────┐
│ ▌ (vạch trái 3px màu tone trạng thái — chỉ khi “Đang mở”)     │
│  [DXT-2026-01]                               (● Đang mở)     │
│                                                              │
│  Xét tuyển KSTN khóa 22                ← text-title-2        │
│  Dành cho sinh viên năm nhất chưa…      ← body ink-600, 2 dòng│
│                                                              │
│  ┌────────┐  🏛 Khoa Công nghệ Thông tin                      │
│  │ 01/08  │  👥 60 sinh viên  (quota — đã có trong dữ liệu)   │
│  │ ──────│                                                   │
│  │ 15/08  │                                                  │
│  └────────┘  ← “khối lịch” hiển thị round.time tách 2 mốc      │
│ ──────────────────────────────────────────────────────────── │
│  [Xem chi tiết]                              [Nộp hồ sơ →]   │
└──────────────────────────────────────────────────────────────┘
```

- Lưới 2 cột ≥ 768px, 1 cột < 768px; khoảng cách 24px.
- Thẻ “Đang mở” được ưu tiên thị giác: vạch trái `success-solid`, nút Nộp hồ sơ `primary`. Thẻ đã kết thúc: chữ tiêu đề `ink-700`, nền `ink-25` nhẹ — **không** làm mờ cả thẻ (vẫn phải đọc được).
- “Khối lịch”: tách `round.time` (“01/08 - 15/08/2026”) thành 2 dòng ngày bắt đầu/kết thúc bằng hàm parse an toàn; nếu parse thất bại → hiển thị nguyên chuỗi. Không đổi dữ liệu.
- Dòng “Đang trong kỳ chấm” / “Chưa nhận hồ sơ”: bỏ in nghiêng, thêm icon `Clock`/`CalendarClock` 14px `ink-500`.
- Hover thẻ: `shadow-overlay`, viền `ink-300`; toàn thẻ **không** bấm được (tránh xung đột 2 nút) — chỉ 2 nút hành động.

**Footer (tùy chọn, dùng chữ có sẵn):** dải nền trắng hairline trên, logo nhỏ + “Trường Đại học Công nghiệp Thành phố Hồ Chí Minh · Khoa Công nghệ Thông tin” (đã có ở header) + link Website trường IUH.

### 8.2. `RoundDetailModal` → giữ Modal `lg`, tinh chỉnh

- Header: CodeTag mã đợt + StatusBadge ở trên tiêu đề; tiêu đề `text-title-2`; mô tả `major`.
- 3 ô tóm tắt (Trạng thái / Thời gian / Chỉ tiêu) → `DescriptionList layout="grid" columns={3}` trên 1 khối nền `ink-25` duy nhất.
- “Đối tượng: …”: khối trích có vạch trái `brand-600`, nền `brand-25`.
- “Điều kiện & Tiêu chuẩn xét tuyển”: danh sách với icon `CheckCircle2` 16px `success-solid` từng dòng, khoảng cách 10px, chữ `text-body ink-800`.
- “Minh chứng & Hồ sơ cần chuẩn bị”: danh sách đánh số kiểu sổ tay — số trong ô 24px `brand-50/brand-700` mono; mỗi dòng có hairline.
- Footer dính: “Đóng” trái, “Nộp hồ sơ đợt này →” phải (khi `open`), ngược lại dòng trạng thái có icon.

### 8.3. `PublicApplyModal` (nộp hồ sơ công khai)

- Modal `lg`, `closeOnBackdrop={false}`.
- Banner thông tin đầu (giữ chữ) → component `Callout tone="info"` (icon trái, nền `info-bg`, viền trái 3px `info-solid`).
- Form 2 cột chia **2 nhóm có tiêu đề nhỏ** bằng chính các nhãn trường (không thêm tiêu đề mới): nhóm định danh (Họ tên, MSSV, Email, SĐT) và nhóm học vụ (GPA, TOEIC) — phân tách bằng hairline + khoảng 24px.
- Dùng `Field` + `Input`; GPA có `trailing="/ 4.0"`, TOEIC `trailing="/ 990"` (ký hiệu số, không phải chữ mới).
- Tệp minh chứng → `FileDropzone` + `FileItem` (giữ nguyên các thông điệp lỗi hiện có).
- Footer dính: Hủy · **Gửi hồ sơ xét tuyển** (`loading` 600ms giả lập khi submit để có phản hồi).

### 8.4. `LoginModal`

- Modal `md`. Bố cục 2 phần: trên là 2 trường Tài khoản/Mật khẩu; dưới là **chọn vai trò dạng “radio card”** thay cho `<select>`:

```
( ) 1. Sinh viên CN/KSTN            Nguyễn Hoàng Nam
( ) 2. Giảng viên phụ trách         ThS. Phạm Thị Dung
(●) 6. Quản trị hệ thống            Toàn quyền
```

  — tách chuỗi option hiện có thành 2 phần (tên vai trò / tên người trong ngoặc) **không đổi chữ**; lưới 2 cột ≥ 640px; card chọn: viền `brand-600` + nền `brand-25` + check. Mỗi card có Avatar initials (lấy từ `roles[*].initials`).
- Mật khẩu: nút hiện/ẩn (icon `Eye/EyeOff`, aria-label dùng chuỗi “Hiện mật khẩu”/“Ẩn mật khẩu” → **ghi vào nhật ký chuỗi mới**).
- “Quên mật khẩu?” mở khối khôi phục bằng animation height 180ms (giữ nội dung).
- “Phiên bản thử nghiệm 2.0” → chip neutral nhỏ.
- Gắn `htmlFor` cho mọi label (hiện thiếu).

### 8.5. Quản lý chuyên ngành — `MajorManagement.jsx`

- PageHeader + nút “Thêm chuyên ngành mới” trên cùng (đúng nghiệp vụ).
- **Bảng giữ đúng 4 cột** `Khoa | Chuyên ngành | Số lượng lớp | Thao tác`.
- Ưu tiên responsive: Chuyên ngành (1) > Số lượng lớp (2) > Khoa (3, chuyển thành dòng phụ dưới tên ngành ở < 768px).
- Hàng dữ liệu: tên ngành `font-semibold`; khoa `ink-600`. **Tùy chọn:** nhóm hàng theo khoa (hàng tiêu đề nhóm mảnh `ink-25` khi không lọc) — chỉ làm nếu không phá vỡ phân trang 10 dòng (mỗi trang tối đa 10 dòng dữ liệu, hàng nhóm không tính).
- Modal Thêm/Sửa: `Field` cho 2 trường; khối giải thích trùng lặp → `Callout tone="neutral"`.
- **Trùng lặp:** `ConfirmDialog tone="warning"` (1 nút “Quay lại kiểm tra”) — khi đóng, **focus quay về ô Tên chuyên ngành** và chọn sẵn text để sửa nhanh.
- **Chặn xóa (còn lớp con):** `ConfirmDialog tone="warning"`; thêm **minh họa phân cấp** nhỏ bằng 3 chip nối mũi tên `Khoa → Ngành → Lớp` (chữ đã có trong thông điệp `(Khoa → Ngành → Lớp)`), chip “Lớp” có số đếm và viền `warning-border` để chỉ ra “phải xóa phần này trước”.
- **Xem chi tiết** → `Drawer lg`: DescriptionList (Khoa quản lý, Tổng số lớp hiện có) + bảng lớp (Mã lớp, Khóa, Năm học, Trạng thái) với mã lớp là CodeTag.

### 8.6. Quản lý lớp — `ClassManagement.jsx` (readonly và đầy đủ)

- Cột giữ nguyên: Tên lớp | Chuyên ngành | Khóa | Giảng viên phụ trách | Sĩ số | Thao tác.
- Ưu tiên responsive: Tên lớp (1) > Sĩ số (2) > Chuyên ngành (3) > Khóa (4) > Giảng viên (5).
- Sĩ số dùng `Capacity`.
- Form: nhóm “định danh lớp” (Tên lớp, Chuyên ngành, Khóa) và “phụ trách & sĩ số” (Giảng viên, Sĩ số hiện tại, Chỉ tiêu). **Validation tại chỗ**: khi `current > capacity` → hiển thị lỗi ngay dưới trường “Sĩ số hiện tại” (dùng nguyên chuỗi toast hiện có “Sĩ số hiện tại không được lớn hơn sĩ số tối đa của lớp.”) **ngoài** toast, và focus vào trường lỗi. Tương tự cho lỗi trùng lớp.
- Chi tiết lớp → `Drawer xl`: dải DescriptionList 6 mục (một khối, không 6 card), bảng sinh viên (MSSV CodeTag, Họ tên, Email IUH mono `ink-600`, Trạng thái học vụ). Hai empty state giữ nguyên chữ, dùng icon `Lock`/`Users`.
- Chặn xóa / xác nhận xóa → `ConfirmDialog`.
- Chế độ `readonly`: ẩn nút thêm/sửa/xóa (giữ), hàng bấm được để mở drawer chi tiết.

### 8.7. Tài khoản giảng viên / sinh viên / phân quyền / đặt lại mật khẩu

**Chung:** bảng chuẩn mục 7; chi tiết → `Drawer md` với `DescriptionList layout="inline"`; form → Modal `md` + `Field`; xóa → `ConfirmDialog tone="danger"`.

- **Giảng viên** — cột: Họ và tên (kèm Avatar 28 initials tự sinh từ tên — *trình bày*, không phải nội dung mới) | Email IUH (mono `ink-600`) | Vai trò công tác (chip neutral) | Trạng thái | Thao tác. Ưu tiên: Tên > Trạng thái > Vai trò > Email.
- **Sinh viên** — cột: MSSV (CodeTag plain) | Họ và tên | Tên lớp | Gmail IUH | Trạng thái | Thao tác. Ưu tiên: Tên+MSSV > Trạng thái > Lớp > Gmail.
- **Phân quyền** — cột: Họ và tên cán bộ / giảng viên | Vai trò đảm nhận (chip có icon `ShieldCheck`, màu theo cấp: lãnh đạo khoa `brand`, chủ nhiệm ngành `info`, giảng viên `neutral`) | Phạm vi tác nghiệp (chip `MapPin`) | Thao tác.
- **Đặt lại mật khẩu** — nút “Đặt lại mật khẩu” `secondary sm` có icon `KeyRound`; ConfirmDialog `tone="warning"`; sau khi xác nhận, hàng đó hiện chip “✓” `success` trong 3s (phản hồi tại chỗ) bên cạnh toast hiện có.

### 8.8. Đợt xét tuyển — `RoundsPage.jsx`

- Cột giữ: Mã đợt | Tên đợt xét tuyển | Đơn vị quản trị | Thời gian tiếp nhận | Trạng thái | Thao tác.
- Mã đợt: CodeTag. Thời gian: `tabular-nums`.
- **Sửa lỗi bộ lọc** hiển thị `open/review/upcoming/closed` → hiển thị nhãn từ `ROUND_STATUSES` (xem 11).
- Bộ lọc trạng thái → `FilterTabs` kiểu rãnh có đếm số.
- Form tạo/sửa: Modal `lg`; Mã đợt khi sửa bị khóa (icon Lock). Trạng thái → **radio card ngang** 4 lựa chọn (giữ nguyên nhãn option hiện có) với chấm màu tone. Mô tả → Textarea 4 dòng tự giãn.
- Chi tiết → Drawer md.

### 8.9. Bộ tiêu chí — `CriteriaPage.jsx`

- Cột giữ: Phân loại | Tên tiêu chí | Mức đánh giá / Điều kiện | Trọng số điểm | Thứ tự | Thao tác.
- “Thứ tự” → huy hiệu tròn 24px mono (`1`, `2`…) — đọc như thứ tự ưu tiên xét hòa.
- “Trọng số điểm”: `tabular-nums font-semibold brand-700`; các giá trị bậc như `50 / 40 / 30` hiển thị dạng các chip nhỏ nối nhau để dễ đọc (tách theo “ / ”, không đổi dữ liệu).
- Phân loại: StatusBadge domain criteria (giữ).
- **Sửa lỗi chỉ số dòng** khi đang lọc (xem 11).

### 8.10. Hồ sơ xét tuyển của sinh viên — `StudentApplicationPage.jsx` (ưu tiên cao)

#### A. Chế độ wizard

```
┌ PageHeader: “Cập nhật hồ sơ xét tuyển duy trì KSTN”  ·  [Đã lưu nháp: 10:42:05] [💾 Lưu nháp] ┐
│ Mô tả: “Đợt duy trì KSTN năm 3 — Hạn cập nhật hồ sơ: 25/08/2026”                               │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
┌ Stepper ngang ─────────────────────────────────────────────────────────────────────────────────┐
│  (✓)━━━━━━━━━━━━━━━━(2)━━━━━━━━━━━━━━━━( 3 )                                                    │
│  Thông tin cá nhân   Tiêu chí &          Kiểm tra &                                             │
│  & đào tạo           Minh chứng          Nộp hồ sơ                                              │
│  Xác thực định danh  Điểm số và chứng    Xác nhận và gửi                                        │
│  sinh viên           chỉ đính kèm        phê duyệt                                              │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
┌ Layout 2 cột ≥ 1280px ──────────────────────────────────────────────┬ Cột phải 320px (sticky) ┐
│  Card nội dung bước hiện tại                                         │ “Kết quả tự khai” tóm   │
│                                                                      │ tắt trực tiếp: mỗi tiêu │
│                                                                      │ chí + Yêu cầu chuẩn +  │
│                                                                      │ ✓/⚠ so với giá trị nhập │
│                                                                      │ (chuỗi đã có ở hint &   │
│                                                                      │ bước 3)                 │
└──────────────────────────────────────────────────────────────────────┴─────────────────────────┘
┌ Thanh hành động DÍNH ĐÁY (sticky bottom, nền white/90 blur, hairline trên) ───────────────────┐
│ [← Quay lại Bước 1]                       Bước 2/3                [Tiếp tục sang Kiểm tra & Nộp →] │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Stepper:** 3 bước (giữ tiêu đề + mô tả hiện có, bỏ tiền tố “1.”, “2.”, “3.” khỏi tiêu đề vì số đã nằm trong vòng tròn — *đây là thay đổi trình bày*; nếu chủ dự án muốn giữ nguyên tuyệt đối, giữ tiền tố). Đường nối đổ màu `brand-600` theo tiến độ (transition 260ms). Bước đã qua: vòng tròn `success-solid` + check. Bước hiện tại: vòng `brand-600` + ring `brand-100` 4px. Bước sau: vòng viền `ink-300`.
  - **Chỉ cho nhảy tới bước đã hoàn thành hoặc bước kế tiếp hợp lệ** (validate các trường `required` của bước hiện tại trước khi sang bước sau; nếu lỗi → focus trường đầu tiên lỗi). Bước chưa tới: `aria-disabled`.
  - Mobile: chỉ hiện thanh tiến độ mảnh + “Bước 2/3” + tiêu đề bước.
- **Bước 1:** 4 trường khóa hiển thị bằng `DescriptionList` (đọc dễ hơn input disabled) **hoặc** input readonly có icon Lock — chọn DescriptionList, dòng mô tả của bước giữ nguyên. 3 trường liên hệ dùng `Field`.
- **Bước 2:** lưới 3 cột tiêu chí; mỗi `Field` có `hint` “Yêu cầu chuẩn: …” (giữ chữ) và **chỉ báo trực tiếp**: khi giá trị đạt chuẩn → hint chuyển `success-fg` kèm icon ✓; chưa đạt → `warning-fg` kèm ⚠. (So sánh dựa trên ngưỡng đã ghi trong hint: ≥38, =0, ≥3.20, >80, ≥450.) Không chặn nộp — chỉ gợi ý.
  - Khu “Tệp minh chứng đính kèm …”: mỗi mục là `FileItem` có nhãn (giữ chữ), hỗ trợ kéo-thả từng mục; trạng thái “Chưa chọn tệp đính kèm” hiển thị dạng dropzone thu nhỏ.
- **Bước 3:** 2 khối tóm tắt → `DescriptionList layout="inline"` trong card có nút “Sửa” (link) ở góc phải tiêu đề; danh sách tệp → `FileItem` chế độ chỉ đọc; ô cam kết → Checkbox lớn trong Callout `brand`; nút “Nộp hồ sơ xét duyệt chính thức” **disabled cho tới khi tích cam kết** (thay vì cho bấm rồi báo toast) — vẫn giữ toast cũ làm dự phòng.
- **Lưu nháp:** chỉ báo trạng thái cạnh nút: `● Đang lưu…` → `✓ Đã lưu nháp: hh:mm:ss`. **Khuyến nghị:** tự lưu nháp sau 1.5s không gõ (debounce) — vẫn giữ nút “Lưu nháp” thủ công; khi tự lưu thì **không** bắn toast (tránh spam), chỉ cập nhật chỉ báo.
- **Rời trang khi có thay đổi chưa lưu:** `beforeunload` cảnh báo mặc định của trình duyệt (không thêm chữ).

#### B. Chế độ theo dõi hồ sơ (đã nộp)

```
┌ Callout warning (nếu needs_update) — giữ chữ + nút “Cập nhật minh chứng ngay” ─────────────┐
└───────────────────────────────────────────────────────────────────────────────────────────┘
┌ Card “hồ sơ” ─────────────────────────────────────────────────────────────────────────────┐
│ [HS-2026-001]                                            Trạng thái thẩm định             │
│ Duy trì KSTN năm 3                                       (● Chờ duyệt)  (Chờ phê duyệt)    │
│ Ngày gửi hồ sơ: 12/08/2026 09:15                                                          │
│ ───────────────────────────────────────────────────────────────────────────────────────── │
│ Tiến độ: (✓ Nộp hồ sơ)━━━━(● reviewLevel hiện tại)━━━━( Kết quả )   ← suy ra từ history    │
│ ───────────────────────────────────────────────────────────────────────────────────────── │
│ DescriptionList 4 cột: Họ và tên · MSSV · Lớp sinh hoạt · Điểm GPA năm 2                   │
│ Minh chứng đã đính kèm: lưới FileItem                                                     │
└───────────────────────────────────────────────────────────────────────────────────────────┘
┌ Card “Tiến trình xử lý & Phê duyệt” — component Timeline ─────────────────────────────────┐
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

- Thanh tiến độ ngang 3 mốc **chỉ dùng dữ liệu có sẵn**: mốc 1 = hành động đầu trong `history`; mốc 2 = `reviewLevel`; mốc 3 = nhãn trạng thái cuối (`Đã duyệt`/`Trúng tuyển`/`Từ chối`) khi có. Nếu không đủ dữ liệu, ẩn thanh này.
- Trên desktop ≥ 1280px: Timeline nằm cột phải sticky.

### 8.11. Phê duyệt hồ sơ — `ApprovalsPage.jsx` + `ApplicationReviewModal.jsx` (ưu tiên CAO NHẤT)

#### A. Danh sách

- Bộ lọc trạng thái → `FilterTabs` có đếm số (nhãn từ `APPLICATION_STATUSES`, sửa lỗi hiện mã thô).
- Cột giữ: MSSV | Họ và tên | Lớp sinh hoạt | Loại hồ sơ | Tổng điểm | Trạng thái | Thao tác.
- Hàng có trạng thái `pending`: vạch trái 2px `warning-solid` — “việc cần làm” nổi bật; nút “Xem & Chấm” `primary sm` (giữ logic variant hiện tại).
- Tổng điểm: `tabular-nums font-semibold`; giữ chuỗi `{gpa} (GPA)` nhưng phần “(GPA)” dùng `ink-500 font-normal`.
- Ưu tiên responsive: Họ tên+MSSV > Trạng thái > Tổng điểm > Loại hồ sơ > Lớp.
- Bấm cả hàng cũng mở hồ sơ (ngoài nút).

#### B. Màn thẩm định — chuyển từ modal `xl` sang **Review Workspace toàn màn hình**

Dùng một overlay toàn màn hình (component `FullscreenDialog`, vẫn là `role="dialog"` + focus trap — tái dùng hook a11y), **giữ nguyên toàn bộ nội dung và thứ tự các phần 1–3, ý kiến thẩm định, lịch sử**.

```
┌ Thanh trên dính: [✕ Đóng]  Xét duyệt hồ sơ — Nguyễn Hoàng Nam (21094501)   ‹ ›  (Hồ sơ trước/sau – tùy chọn) ┐
│                  Đợt: Duy trì KSTN năm 3 · Lớp: KSTN-KTPM-K20                                              │
├──────────────────────────────────────────────────────────────────┬─────────────────────────────────────────┤
│ CỘT NỘI DUNG (cuộn)                                              │ CỘT QUYẾT ĐỊNH (sticky, 360px)           │
│                                                                  │                                         │
│ ┌ Dải trạng thái: Trạng thái hiện tại · Thời gian nộp hồ sơ ┐    │ Trạng thái hiện tại  (● Chờ duyệt)       │
│                                                                  │ (Chờ phê duyệt)                          │
│ 1. Thông tin sinh viên & Chương trình đào tạo                    │ ─────────────────────────────            │
│    DescriptionList 4 cột                                         │ Tóm tắt đối chiếu: 4/4 Đạt  ✓            │
│                                                                  │ (đếm từ bảng đối chiếu)                  │
│ 2. Bảng đối chiếu tiêu chuẩn & Tự khai hồ sơ                     │ ─────────────────────────────            │
│    Bảng: Tiêu chí | Yêu cầu chuẩn | Giá trị tự khai |            │ Ý kiến thẩm định & Ghi chú quyết định    │
│          Minh chứng | Thẩm định                                  │ [ textarea 6 dòng            ]           │
│    Ô “Thẩm định”: chip ✓ Đạt (success) / Ghi nhận (neutral)      │ Ý kiến trước đó: … (nếu có)              │
│                                                                  │ ─────────────────────────────            │
│ 3. Danh mục tệp minh chứng đính kèm                              │ [ Phê duyệt hồ sơ          ] primary lg  │
│    Lưới FileItem; “Xem tệp” mở khung xem cạnh bên                │ [ Yêu cầu bổ sung          ] warnOutline │
│                                                                  │ [ Từ chối hồ sơ            ] dangerOutl. │
│ Lịch sử xử lý hồ sơ — Timeline                                   │                                         │
└──────────────────────────────────────────────────────────────────┴─────────────────────────────────────────┘
```

- **Thứ tự nút quyết định** theo mức an toàn, nút tích cực lớn nhất trên cùng; nguy hiểm dưới cùng, cách nhóm trên 16px.
- **Ràng buộc UX đã ghi trong `DESIGN.md`:** “Yêu cầu bổ sung (Bắt buộc nhập lý do)”. Hiện tại code chỉ *khuyến nghị*. → Khi bấm “Yêu cầu bổ sung” mà ô ý kiến trống: **focus vào textarea và hiện lỗi tại chỗ** dùng đúng chuỗi đang có (“* Khuyến nghị: Vui lòng nhập nội dung cần bổ sung vào ô ý kiến thẩm định trước khi gửi yêu cầu.”) — giữ dialog xác nhận như cũ. (Chặn hẳn hay chỉ cảnh báo: **hỏi chủ dự án**; mặc định chỉ cảnh báo để không đổi nghiệp vụ.)
- Dialog xác nhận quyết định → `ConfirmDialog` với tone tương ứng (success cho phê duyệt/xác nhận, warning cho bổ sung, danger cho từ chối), **hiển thị lại nội dung ý kiến** đã nhập trong `note` để cán bộ soát trước khi gửi.
- **Xem minh chứng:** thay modal chồng modal bằng **panel xem tệp trượt vào cột nội dung** (split view) hoặc Drawer `lg` phía trên review workspace; nội dung mô phỏng giữ nguyên.
- **Phím tắt (tùy chọn, có hiển thị `kbd` trong tooltip):** `J/K` hồ sơ trước/sau trong danh sách đã lọc, `Esc` đóng.
- Bảng đối chiếu: chữ `text-body` (không còn `text-xs`), giá trị tự khai `font-semibold tabular-nums`; cột “Minh chứng” chip neutral có icon `FileCheck2`.
- Mobile/tablet < 1024px: cột quyết định chuyển thành **thanh dính đáy** gồm 3 nút (cuộn ngang nếu thiếu chỗ), textarea ý kiến nằm cuối cột nội dung, ngay trên Timeline.

#### C. Biến thể theo vai trò (giữ logic `isFinal`, `readonly`)

- `isFinal` (Danh sách trúng tuyển / Duyệt danh sách trúng tuyển): nút chính “Xác nhận trúng tuyển”, icon `Award` dùng màu **accent-500** (chỗ duy nhất trong workspace được dùng accent — gắn với “danh dự trúng tuyển”).
- `readonly` (Hồ sơ sinh viên): hiện tại vẫn hiển thị nút quyết định trong modal dù danh sách ghi “Xem hồ sơ” — **xem lỗi #11.5**; trong thiết kế mới, chế độ readonly ẩn cột quyết định, nội dung chiếm toàn chiều rộng (max 960px).

### 8.12. Thông tin cá nhân — `ProfilePage.jsx`

- **Lỗi hiện tại:** trang này tự render `PageHeader` và `App.jsx` đã loại trừ `profile` — OK; nhưng mô tả trong `ProfilePage` (“Quản lý thông tin hồ sơ tài khoản…”) khác `pageMeta.profile.desc` → giữ chuỗi **đang hiển thị thực tế** (trong ProfilePage).
- Bố cục: cột trái 280px “thẻ danh tính”: nền `brand-900` + lưới chấm mờ, Avatar 80 viền trắng, tên (trắng, `text-title-3`), vai trò (`white/70`), StatusBadge, chip phạm vi — như một **thẻ sinh viên/cán bộ** cao cấp. Cột phải: form với `Field`, các trường khóa dùng DescriptionList, nút lưu trong footer card.
- Mobile: thẻ danh tính nằm trên, chiều ngang đầy đủ, cao ~200px.

### 8.13. `ChangePasswordModal`

- `Field` + nút hiện/ẩn mật khẩu; **thanh độ mạnh mật khẩu** 4 vạch (chỉ màu, không thêm chữ đánh giá) dưới ô mật khẩu mới; lỗi “mật khẩu xác nhận không khớp” (dùng chuỗi hiện có trong file) hiển thị tại chỗ.

---

## 9. Chuyển động & vi tương tác

| Tương tác | Hiệu ứng | Thời lượng / easing |
|---|---|---|
| Hover nút/hàng/link | đổi màu nền/viền | 120ms standard |
| Nhấn nút primary | `translateY(1px)` + màu active | 80ms |
| Mở dropdown/tooltip | fade + scale 0.97→1 từ điểm neo | 180ms emphasized |
| Mở modal | backdrop fade 180ms; panel fade + translateY(8px)→0 + scale .985→1 | 260ms standard |
| Mở drawer | translateX(24px)→0 + fade | 260ms standard |
| Bottom sheet (mobile) | translateY(100%)→0 | 300ms emphasized |
| Đóng mọi overlay | ngược lại, nhanh hơn 30% | ~180ms |
| Toast vào | translateY(8px)+fade; ra: fade + thu chiều cao | 200 / 160ms |
| Đổi bước wizard | nội dung fade + translateX(±12px) theo hướng | 220ms |
| Đường nối stepper | width tăng dần | 260ms |
| Chỉ báo tab/segmented | trượt `transform` theo tab active | 180ms |
| Chuyển trang workspace | nội dung main fade-in 160ms (không trượt) | 160ms |
| Lưu nháp thành công | icon ✓ “vẽ” (stroke-dashoffset) 1 lần | 300ms |

**Quy tắc:** chỉ animate `opacity` và `transform`; không animate `height` trừ khối “Quên mật khẩu” (dùng `grid-template-rows: 0fr → 1fr`). Tất cả tắt dưới `prefers-reduced-motion: reduce` (đã có rule — giữ). Không có animation lặp vô hạn.

---

## 10. Accessibility & Responsive

### 10.1. Accessibility (bắt buộc — WCAG 2.2 AA)

- Tương phản: chữ thường ≥ 4.5:1, chữ lớn & icon có nghĩa ≥ 3:1. Đã kiểm: `ink-600 #526175` trên trắng ≈ 6.3:1 ✓; `ink-500 #626F85` ≈ 5.1:1 trên trắng và 4.7:1 trên canvas ✓ (không dùng nhạt hơn cho chữ; `ink-400` chỉ cho icon trang trí / placeholder); `white/72` trên `brand-900` ≈ 8.0:1 ✓; `brand-300` trên `brand-900` ≈ 6.0:1 ✓; `accent-300` trên `brand-900` ≈ 8.4:1 ✓; `accent-700` trên `accent-50` ≈ 5.7:1 ✓; `accent-500` trên trắng chỉ ≈ 3.2:1 → **chỉ dùng cho vạch/icon trang trí, không dùng cho chữ**. **Kiểm lại bằng công cụ** sau khi triển khai.
- Mọi input có `<label htmlFor>`; lỗi liên kết `aria-describedby`; `aria-invalid`.
- Bảng: `<caption class="sr-only">` = tiêu đề trang; `<th scope="col">`; nếu có sắp xếp: `aria-sort`.
- Mọi overlay (Modal, Drawer, FullscreenDialog, BottomSheet, mobile nav) dùng chung `useDialogA11y` (focus trap, Esc, khôi phục focus, `aria-modal`, khóa cuộn body).
- Menu tài khoản: `role="menu"`, phím mũi tên; FilterTabs: `role="radiogroup"` + mũi tên trái/phải.
- Vùng bấm tối thiểu 24×24 (WCAG 2.5.8), mục tiêu cảm ứng mobile 44×44.
- Khi đổi trang workspace: focus H1 + thông báo `aria-live` tên trang (sr-only).
- Trạng thái không chỉ dựa vào màu: luôn có chữ (badge) hoặc icon (✓ ⚠ ✕).
- Input file truy cập được bằng bàn phím (mục 5.18).
- `lang="vi"` đã có trên mọi HTML — giữ.

### 10.2. Breakpoints

| Tên | Min width | Hành vi chính |
|---|---|---|
| `base` | 0 | 1 cột, bảng → thẻ, modal → bottom sheet, nav → drawer |
| `sm` | 640px | modal dạng hộp, form 2 cột |
| `md` | 768px | lưới thẻ đợt 2 cột, bảng hiển thị cột ưu tiên 1–3 |
| `lg` | 1024px | sidebar cố định, bảng đầy đủ, header breadcrumb |
| `xl` | 1280px | wizard/hồ sơ 2 cột với cột phải sticky, review workspace 2 cột |
| `2xl` | 1536px | chỉ tăng khoảng trắng, không kéo giãn nội dung quá 1440px |

### 10.3. Kiểm tra thủ công bắt buộc

Ở **390×844, 768×1024, 1440×900**: trang công khai, đăng nhập, mỗi vai trò mở ít nhất 2 trang, mở mọi loại overlay, nộp hồ sơ sinh viên trọn 3 bước, xét duyệt 1 hồ sơ với cả 3 quyết định. Không có cuộn ngang toàn trang ở bất kỳ khổ nào.

---

## 11. Lỗi UX/logic phát hiện khi đọc code

> Sửa trong quá trình nâng cấp. Các lỗi đánh dấu **[logic]** chạm vào hành vi — sửa nhưng không đổi nội dung chữ; báo lại cho chủ dự án trong mô tả PR.

| # | Vị trí | Lỗi | Cách sửa |
|---|---|---|---|
| 11.1 | `RoundsPage.jsx` dòng ~24, 110 | Bộ lọc trạng thái hiển thị mã thô `open`, `review`, `upcoming`, `closed` | `TableToolbar` nhận `filterOptions` dạng `{ value, label }`; label lấy từ `ROUND_STATUSES[value].label` |
| 11.2 | `ApprovalsPage.jsx` | Bộ lọc hiển thị `pending`, `needs_update`… | Như trên với `APPLICATION_STATUSES` |
| 11.3 | `CriteriaPage.jsx` **[logic]** | Khi đang lọc theo phân loại, `index` để sửa = vị trí trong danh sách **đã lọc**, nhưng khi lưu lại map theo vị trí trong danh sách **gốc** → sửa nhầm tiêu chí | Gắn `id` ổn định cho mỗi tiêu chí (hoặc lưu `originalIndex` khi lọc) |
| 11.4 | Mọi form | `<label className="ui-label">` không có `htmlFor`; `*` không có text sr | Dùng `Field` (5.3) |
| 11.5 | `ApprovalsPage readonly` **[logic]** | Vai trò chỉ xem (“Hồ sơ sinh viên”) mở modal vẫn có nút Phê duyệt/Từ chối | Truyền `readonly` xuống `ApplicationReviewModal`, ẩn khu quyết định |
| 11.6 | `StudentApplicationPage` | Input file ẩn trong `<label>` → không dùng bàn phím được; nút xóa tệp chỉ có `title` | `FileDropzone`/`FileItem` (5.18), `aria-label` |
| 11.7 | `StudentApplicationPage` | Stepper cho nhảy tới bước 3 khi bước 1–2 chưa hợp lệ | Validate theo bước (8.10) |
| 11.8 | `App.jsx` mobile nav | Không focus-trap, không Esc, nút “✕” là ký tự | Dùng `Drawer` (6.5) |
| 11.9 | `Modal.jsx` | Bấm backdrop đóng modal form → mất dữ liệu đang nhập | `closeOnBackdrop={false}` cho modal form (5.8) |
| 11.10 | `ApprovalsPage.jsx` | Thiếu guard `if (page > totalPages) setPage(totalPages)` như các trang khác | Thêm (hoặc gom vào hook `usePagedFilter`) |
| 11.11 | Các trang CRUD | Logic tìm kiếm/lọc/phân trang lặp ở 9 file | Tạo hook `usePagedFilter({ items, pageSize: 10, match })` — không đổi hành vi |
| 11.12 | `base.css` | `button:disabled { opacity: .55 }` toàn cục chồng lên style variant | Bỏ, để từng variant tự định nghĩa disabled (5.1) |
| 11.13 | `Toast` | Chỉ giữ 1 toast; toast mới ghi đè toast cũ (ví dụ lưu nháp + lỗi) | `ToastStack` (5.11) |
| 11.14 | `App.jsx` | Đổi trang không cuộn về đầu, không chuyển focus | 6.3 |
| 11.15 | `ClassManagement`, `MajorManagement` | Lỗi validate chỉ báo qua toast, không chỉ ra trường lỗi | Lỗi tại chỗ + giữ toast (8.6) |

---

## 12. Lộ trình triển khai

> Mỗi giai đoạn = 1 nhánh/PR riêng. Không trộn giai đoạn.

### Giai đoạn 1 — Nền móng token (bắt buộc)
1. Tạo `src/styles/theme.css` với toàn bộ token mục 4 trong `@theme` (màu, font, text sizes với `--text-*--line-height`, radius, shadow, ease, z-index).
2. Cập nhật `styles.css`, `base.css` (root 16px, font features, bỏ disabled opacity, focus mới), `components.css` (ui-table, keyframes theo motion tokens).
3. Alias biến cũ trong `tokens.css` → token mới (tạm thời).
4. Codemod hex → token theo bảng 4.9 cho **toàn bộ** `src/**/*.jsx`. Đồng thời thay `text-[13.5px]`… bằng các lớp thang chữ.
5. Kiểm: `grep` mục 4.9 trả về 0; `pnpm build` OK; so sánh ảnh chụp trước/sau — giao diện phải gần như y hệt (giai đoạn này chỉ chuẩn hóa, chưa đổi thiết kế).

**Nghiệm thu:** 0 hex trong JSX, build thành công, không vỡ bố cục.

### Giai đoạn 2 — Component library (bắt buộc)
1. Hook `useDialogA11y` tách từ `Modal.jsx`.
2. Nâng cấp: Button, IconButton, Modal (bottom sheet mobile, footer dính, closeOnBackdrop), StatusBadge, Pagination, EmptyState, Toast→ToastStack (+ sửa `demo-store.jsx`).
3. Tạo mới: Field, Input, Textarea, Select, Checkbox, RadioCard, CodeTag, DescriptionList, ConfirmDialog, Drawer, FullscreenDialog, Tooltip, FilterTabs, Stepper, Timeline, FileDropzone, FileItem, Avatar, Callout, Capacity.
4. Tạo trang nội bộ **`/src/dev/Gallery.jsx`** (không đưa vào build chính — chỉ mount khi `import.meta.env.DEV` và URL có `?gallery`) hiển thị mọi component ở mọi trạng thái để kiểm thử nhanh.

**Nghiệm thu:** Gallery hiển thị đủ trạng thái (default/hover/focus/disabled/loading/error), qua kiểm tra bàn phím.

### Giai đoạn 3 — Khung ứng dụng (bắt buộc)
1. Sidebar mới (6.1) + lưu trạng thái localStorage.
2. WorkspaceHeader (6.2): blur khi cuộn, menu tài khoản có phím mũi tên.
3. Mobile nav bằng Drawer (6.5).
4. PageHeader mới (6.4) + chuyển nút “Thêm …” lên PageHeader (cần prop `action` từ feature → dùng context `usePageActions` hoặc để feature tự render PageHeader; khuyến nghị: mỗi feature tự render `PageHeader` và `App.jsx` thôi render chung).
5. Focus/scroll khi đổi trang (6.3). Xóa alias `tokens.css`.

**Nghiệm thu:** điều hướng đầy đủ bằng bàn phím; mobile nav đạt a11y; mọi vai trò hiển thị đúng menu.

### Giai đoạn 4 — Bảng dữ liệu & các trang CRUD (bắt buộc)
1. `usePagedFilter`, `ResponsiveTable`, nâng cấp `TableToolbar` (options `{value,label}`, phím `/`), `TablePanel` (header dính).
2. Áp dụng lần lượt: Chuyên ngành → Lớp → Giảng viên → Sinh viên → Phân quyền → Đợt → Tiêu chí → Đặt lại mật khẩu.
3. Thay mọi modal xác nhận/chặn bằng ConfirmDialog; mọi modal chi tiết bằng Drawer.
4. Sửa lỗi 11.1, 11.3, 11.10, 11.11, 11.15.

**Nghiệm thu:** mỗi trang qua 3 khổ màn hình; phân trang ≤ 10 dòng; ràng buộc nghiệp vụ (trùng, chặn xóa, sĩ số) vẫn hoạt động y nguyên.

### Giai đoạn 5 — Luồng trọng yếu (bắt buộc)
1. Review Workspace (8.11) + sửa 11.2, 11.5.
2. Wizard & theo dõi hồ sơ sinh viên (8.10) + sửa 11.6, 11.7.
3. Profile (8.12), ChangePassword (8.13).

**Nghiệm thu:** sinh viên nộp hồ sơ trọn luồng chỉ bằng bàn phím; cán bộ xét duyệt 1 hồ sơ với từng quyết định; lịch sử cập nhật đúng.

### Giai đoạn 6 — Trang công khai (bắt buộc)
1. PublicHeader một tầng + hero + FilterTabs + thẻ đợt mới (8.1).
2. RoundDetailModal (8.2), PublicApplyModal (8.3), LoginModal (8.4).

**Nghiệm thu:** Lighthouse Accessibility ≥ 95, Best Practices ≥ 95 trên trang công khai; LCP < 2s khi chạy `pnpm preview` cục bộ.

### Giai đoạn 7 — Đánh bóng (khuyến nghị / tùy chọn)
- Chuyển động mục 9 đầy đủ; Command palette `Ctrl+K`; sắp xếp cột; chip bộ lọc; điều hướng hồ sơ trước/sau `J/K`; serif cho H1 công khai; **dark mode** (tùy chọn: định nghĩa lại token dưới `[data-theme="dark"]` và `prefers-color-scheme`, kiểm lại tương phản — chỉ làm khi chủ dự án đồng ý).
- Cập nhật `DESIGN.md` mô tả hệ thống mới (tokens, components, chữ ký thị giác).

---

## 13. Checklist nghiệm thu

### Nội dung (quan trọng nhất)
- [ ] So sánh toàn bộ chuỗi tiếng Việt trước/sau bằng script: trích mọi string literal + JSX text trong `src/` trước khi bắt đầu (`git stash`/nhánh gốc) và sau khi xong; khác biệt chỉ được nằm trong “Nhật ký chuỗi mới” hoặc là việc *tách/ghép hiển thị* đã nêu (ví dụ tách option vai trò thành 2 phần).
- [ ] Thứ tự & tên cột mọi bảng không đổi; bảng Chuyên ngành đúng 4 cột.
- [ ] Menu 6 vai trò không đổi (tên, thứ tự).
- [ ] Phân trang ≤ 10 dòng mọi bảng, mọi khổ màn hình.
- [ ] Kiểm tra trùng Khoa+Ngành → modal nhỏ cảnh báo; chặn xóa ngành có lớp; chặn xóa lớp gắn đợt đang mở; sĩ số ≤ tối đa — vẫn hoạt động.
- [ ] Logo, font Inter cục bộ, 7 file HTML build được.

### Thị giác
- [ ] 0 mã hex/kích thước chữ tùy ý trong JSX.
- [ ] Chỉ dùng các bậc chữ mục 4.3; không có chữ < 12px.
- [ ] Accent chỉ xuất hiện ở: Honor Rule, overline hero, icon Award trong luồng xác nhận trúng tuyển.
- [ ] Không có mục nào trong danh sách CẤM 3.3.
- [ ] Ba chữ ký thị giác (Honor Rule, CodeTag, Academic Grid) áp dụng nhất quán.

### Trải nghiệm
- [ ] Mọi overlay: Esc đóng, focus trap, focus quay về nút mở.
- [ ] Modal form không đóng khi bấm nhầm backdrop.
- [ ] Toast không che nút hành động; nhiều toast xếp chồng.
- [ ] Wizard: validate theo bước, thanh hành động dính, chỉ báo lưu nháp.
- [ ] Review workspace: cột quyết định luôn thấy được khi cuộn nội dung.
- [ ] Mobile: bảng → thẻ, modal → bottom sheet, không cuộn ngang trang.
- [ ] `prefers-reduced-motion` tắt hết chuyển động.
- [ ] Lỗi 11.1–11.15 đã xử lý (hoặc ghi rõ lý do để lại).

---

## 14. Prompt mẫu giao cho model triển khai

> Copy nguyên khối dưới đây cho model viết code, mỗi lần một giai đoạn.

```
Bạn đang nâng cấp UI/UX cho dự án React + Vite + Tailwind v4 "web-kstn-iuh" (cổng quản lý lớp CN/KSTN, IUH).
Đọc kỹ file UI-UX-UPGRADE-PLAN-V2.md ở thư mục gốc, cùng PRODUCT.md, NGHIEP-VU.md, DESIGN.md.

Nhiệm vụ lần này: triển khai GIAI ĐOẠN {N} trong mục 12 — và CHỈ giai đoạn đó.

Ràng buộc tuyệt đối:
1. KHÔNG thay đổi bất kỳ chuỗi tiếng Việt hiển thị, tên/thứ tự cột, menu, dữ liệu fixtures, nghiệp vụ (mục 1).
   Chuỗi mới chỉ từ allowlist mục 1.3; chuỗi nào khác phải ghi vào "Nhật ký chuỗi mới" cuối file kế hoạch.
2. Không thêm thư viện UI. Chỉ dùng react, lucide-react, tailwindcss v4 (tùy chọn @floating-ui/react).
3. Mọi màu/chữ/khoảng cách/bo góc/bóng dùng token trong src/styles/theme.css — không hex, không text-[..px] trong JSX.
4. Giữ phân trang tối đa 10 dòng, giữ logic focus/Esc của Modal.
5. Kết thúc: chạy `pnpm build` thành công cho 7 trang HTML; liệt kê các file đã sửa; tự đối chiếu checklist mục 13
   cho phần thuộc giai đoạn này; ghi các lỗi mục 11 đã sửa.

Làm từng bước nhỏ, giữ code sạch, component có prop mặc định tương thích ngược.
```

---

## Nhật ký chuỗi mới (để chủ dự án duyệt)

| Chuỗi | Vị trí | Lý do | Duyệt |
|---|---|---|---|
| “Hiện mật khẩu” / “Ẩn mật khẩu” (aria-label) | LoginModal, ChangePasswordModal | Nút hiện/ẩn mật khẩu | ☐ |
| “Đã sao chép” (toast, nếu dùng `CodeTag copyable`) | CodeTag | Phản hồi sao chép | ☐ |
| *(đã triển khai)* “Hiện mật khẩu” / “Ẩn mật khẩu” — `PasswordInput.jsx` (dùng ở LoginModal, ChangePasswordModal) | | | ☐ |
| “Đóng menu” / “Mở menu” (aria-label, nút mobile) — thuộc allowlist 1.3 | App.jsx, WorkspaceHeader, PublicHeader | Điều hướng mobile | ✔ allowlist |
| “Trang trước” / “Trang sau” (aria-label) — thuộc allowlist 1.3 | Pagination | Trợ năng | ✔ allowlist |
| “Kéo thả tệp vào đây hoặc”, “Bước n/3”, “Đang lưu…”, “Bắt buộc” (sr-only) — thuộc allowlist 1.3 | FileDropzone, Stepper/Wizard, Field | Dropzone, tiến độ, lưu nháp, trợ năng | ✔ allowlist |
| Nhãn tab lọc “Đang mở / Đang xét duyệt / Chưa mở / Đã kết thúc” ở trang Đợt xét tuyển dùng đúng chuỗi trên badge (`label` trong fixtures) thay vì `ROUND_STATUSES` (“Đang tiếp nhận”) để khớp nội dung bảng | RoundsPage | Nhất quán với cột Trạng thái | ☐ |
| Tách chuỗi tùy chọn vai trò “N. Vai trò (Tên)” thành 2 dòng, bỏ dấu ngoặc; bỏ tiền tố “1./2./3.” ở tiêu đề Stepper (đã nêu ở 8.4 và 8.10) | LoginModal, StudentApplicationPage | Chỉ thay đổi trình bày | ☐ |
| Header công khai ẩn dòng “Trường Đại học Công nghiệp… · Khoa Công nghệ Thông tin” dưới 1536px (vẫn có ở footer) | PublicHeader | Gọn header một tầng | ☐ |

---

*Tài liệu lập dựa trên việc đọc toàn bộ `src/` (App, 20+ component/feature), `styles/`, `data/`, `PRODUCT.md`, `NGHIEP-VU.md`, `DESIGN.md`, `vite.config.js`, `package.json`, logo và ảnh review trong `.impeccable/reviews/`. Đây là kế hoạch từ mã nguồn; số liệu tương phản cần kiểm lại bằng công cụ sau khi triển khai.*
