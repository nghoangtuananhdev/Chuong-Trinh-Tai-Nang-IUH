---
name: IUH Talent Admissions
description: Cổng xét tuyển Cử nhân tài năng & Kỹ sư tài năng — bộ nhận diện IUH 2025, chevron vươn lên.
colors:
  brand-25: "#f6f8ff"
  brand-50: "#edf2ff"
  brand-100: "#dbe5ff"
  brand-200: "#b8cbf8"
  brand-300: "#8aa6ee"
  brand-600: "#153898"
  brand-700: "#112f82"
  brand-800: "#0e266b"
  brand-950: "#0a1a40"
  accent-200: "#ffe08a"
  accent-400: "#fdb726"
  accent-500: "#f9b200"
  accent-600: "#d99a00"
  ink-0: "#ffffff"
  ink-25: "#fafbfe"
  ink-50: "#f3f6fc"
  ink-100: "#eaeef7"
  ink-200: "#dfe5f0"
  ink-300: "#c8d1e0"
  ink-400: "#95a1b6"
  ink-500: "#5f6c84"
  ink-600: "#4f5d75"
  ink-700: "#38445a"
  ink-800: "#243046"
  ink-900: "#141e33"
  success-fg: "#166534"
  success-bg: "#effcf3"
  warning-fg: "#9a3412"
  warning-bg: "#fff6ec"
  danger-fg: "#b42318"
  danger-bg: "#fef3f2"
  danger-hover: "#912018"
  focus: "#2f59c4"
typography:
  hero:
    fontFamily: "Be Vietnam Pro, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "clamp(2.375rem, 1.3rem + 3.3vw, 4rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  display:
    fontFamily: "Be Vietnam Pro, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "clamp(2rem, 1.4rem + 1.9vw, 2.75rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title-1:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 700
    lineHeight: "2.125rem"
    letterSpacing: "-0.025em"
  title-2:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 700
    lineHeight: "1.625rem"
    letterSpacing: "-0.015em"
  title-3:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: "1.5rem"
    letterSpacing: "-0.01em"
  metric:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: "2.5rem"
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  body-lg:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.625rem"
  body:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.375rem"
  body-sm:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  caption:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
    letterSpacing: "0.01em"
  code:
    fontFamily: "ui-monospace, SF Mono, Cascadia Mono, Segoe UI Mono, Menlo, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1rem"
    fontFeature: "tnum"
rounded:
  xs: "6px"
  control: "12px"
  card: "18px"
  modal: "24px"
  u: "64px"
  hero: "112px"
  full: "9999px"
spacing:
  gutter-mobile: "16px"
  gutter-tablet: "24px"
  gutter-desktop: "40px"
  card-padding: "20px"
  sheet-padding: "32px"
  sheet-overlap: "96px"
  sheet-overlap-lg: "112px"
components:
  button-primary:
    backgroundColor: "{colors.brand-600}"
    textColor: "{colors.ink-0}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    height: "40px"
    padding: "0 20px"
  button-primary-hover:
    backgroundColor: "{colors.brand-700}"
  button-primary-active:
    backgroundColor: "{colors.brand-800}"
  button-accent:
    backgroundColor: "{colors.accent-500}"
    textColor: "{colors.brand-950}"
    rounded: "{rounded.full}"
    height: "48px"
    padding: "0 28px"
  button-accent-hover:
    backgroundColor: "{colors.accent-400}"
  button-accent-active:
    backgroundColor: "{colors.accent-600}"
  button-secondary:
    backgroundColor: "{colors.ink-0}"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.full}"
    height: "40px"
    padding: "0 20px"
  button-secondary-hover:
    backgroundColor: "{colors.brand-25}"
    textColor: "{colors.brand-700}"
  button-danger:
    backgroundColor: "{colors.danger-fg}"
    textColor: "{colors.ink-0}"
    rounded: "{rounded.full}"
  button-danger-hover:
    backgroundColor: "{colors.danger-hover}"
  input:
    backgroundColor: "{colors.ink-0}"
    textColor: "{colors.ink-900}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    height: "42px"
    padding: "9px 14px"
  card:
    backgroundColor: "{colors.ink-0}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  sheet:
    backgroundColor: "{colors.ink-0}"
    rounded: "{rounded.modal}"
    padding: "{spacing.sheet-padding}"
  signature-band:
    backgroundColor: "{colors.brand-600}"
    textColor: "{colors.ink-0}"
    rounded: "{rounded.hero}"
  footer:
    backgroundColor: "{colors.brand-950}"
    textColor: "{colors.brand-100}"
    rounded: "{rounded.hero}"
  metric-tile:
    backgroundColor: "{colors.ink-0}"
    textColor: "{colors.brand-950}"
    typography: "{typography.metric}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  metric-tile-idle:
    backgroundColor: "{colors.ink-25}"
  filter-pill-track:
    backgroundColor: "{colors.ink-100}"
    rounded: "{rounded.full}"
  filter-pill-active:
    backgroundColor: "{colors.ink-0}"
    textColor: "{colors.brand-800}"
    rounded: "{rounded.full}"
    height: "36px"
  sidebar:
    backgroundColor: "{colors.brand-600}"
    textColor: "{colors.brand-100}"
    width: "248px"
  sidebar-item-active:
    backgroundColor: "{colors.ink-0}"
    textColor: "{colors.brand-800}"
    rounded: "{rounded.control}"
    height: "40px"
  code-tag:
    backgroundColor: "{colors.brand-50}"
    textColor: "{colors.brand-700}"
    typography: "{typography.code}"
    rounded: "{rounded.xs}"
    padding: "2px 6px"
---

# IUH Talent Admissions Interface Design Specification

> Phiên bản 4 — hệ thị giác **“Chevron vươn lên”** (bộ nhận diện IUH 2025) thay toàn bộ hệ “IUH Blue — Rõ tiến trình” của v3. Giữ nguyên nghiệp vụ và luồng thao tác; câu chữ được viết lại cho tự nhiên nhưng đúng nghiệp vụ. Mục 1 (hệ thị giác) dùng tám tiêu đề chuẩn của DESIGN.md, từ *Overview* đến *Do's and Don'ts*; token trong frontmatter là chuẩn, văn xuôi chỉ giải thích cách dùng. Mục 2–4 giữ nguyên từ v3, chỉ sửa những dòng nói về hệ thị giác cũ.

## 1. Hệ thị giác: “Chevron vươn lên”

## Overview

**Creative North Star: "Chevron vươn lên"**

Bộ nhận diện IUH 2025 được chơi thẳng và trọn vẹn: module chevron dải đứng của logo (đỉnh nhọn trên, khấc dưới) và góc bo lớn một phía như nét chữ U là ngữ pháp của cả hệ. Mọi chuỗi có thứ tự (5 giai đoạn ĐXT, 3 cấp phê duyệt, wizard nộp hồ sơ, đăng ký 3 bước) là các chevron nối nhau; giai đoạn hiện tại luôn là chevron vàng. Hệ từ chối kiểu banner xanh phẳng + lưới thẻ bằng nhau của mọi cổng tuyển sinh.

Có hai cường độ. Trang công khai và xác thực là *Persuade*: trường xanh IUH phủ cả khối, trường chevron 3D (three.js) nổi lên theo con trỏ, tiêu đề Be Vietnam Pro 800 cỡ lớn, tấm trắng bo tròn chứa quy trình sáu bước chồng lên mép dưới khối xanh. Trang công khai không liệt kê đợt hay kết quả (A-25). Workspace là *Operate*: nền sáng ánh lam, sidebar xanh, hiệu ứng tiết chế (chỉ báo trượt theo lựa chọn, số đếm lên, trang nổi nhẹ khi chuyển, pipeline chevron); không có WebGL.

Không dark mode. Không ảnh khuôn viên hay ảnh stock: thương hiệu do hệ chevron gánh.

**Key Characteristics:**
- Trường xanh `brand-600` phủ trọn khối chủ đạo; mực xanh thẫm `brand-950` cho tiêu đề trên nền sáng và chân trang.
- Vàng ngọn lửa `accent-500` chỉ một điểm nhấn mỗi vùng: CTA trên nền xanh và chevron (giai đoạn hiện tại, dấu chevron).
- Một góc chữ U lớn trên mỗi khối xanh chữ ký; nút và bộ lọc bo tròn hẳn (pill).
- Tấm trắng bo `modal` có bóng `sheet` chồng lên mép dưới dải xanh ở trang công khai.
- Chuyển động một lần, nổi lên từ dưới với ease-out mũ; tắt hoàn toàn khi `prefers-reduced-motion`.

## Colors

Một trường xanh IUH đậm, một vàng ngọn lửa dùng dè sẻn, và dải trung tính xám ánh lam; các thang đầy đủ nằm trong `src/styles/theme.css`.

### Primary
- **Xanh IUH** (`brand-600`): nền khối hero công khai, cột thương hiệu trang xác thực, sidebar và drawer điều hướng mobile; nút chính, liên kết, chevron giai đoạn đã qua trên nền sáng, ô pipeline dashboard có số > 0.
- **Xanh đậm hover/active** (`brand-700`, `brand-800`): trạng thái nhấn của nút chính; `brand-800` cũng là chữ của mục sidebar/tab đang chọn và màu đầu của lớp phủ chuyển sắc trên hero.
- **Mực xanh thẫm** (`brand-950`): tiêu đề trên nền sáng (H1 xác thực, “Quy trình xét tuyển”, số liệu MetricTile), chữ trên nút vàng, nền chân trang.
- **Xanh nhạt trên nền xanh** (`brand-100`, `brand-200`, `brand-50`): chữ phụ, nhãn và meta đặt trên khối xanh.
- **Xanh sương** (`brand-25`): nền tiêu đề cột bảng, hover dòng bảng, hover nút phụ.

### Secondary
- **Vàng ngọn lửa** (`accent-500`): nút `accent` (Đăng ký tài khoản sinh viên, Đăng nhập trên header trong suốt), chevron giai đoạn hiện tại của `ProcessTrack`, `ChevronMark` (vai trò và mục đang chọn trên sidebar, bước kế tiếp trong quy trình ở trang chủ), vài module vàng trong trường chevron 3D. `accent-400` là hover của nút vàng và hover liên kết chân trang; `accent-600` là active; `accent-200` là nền vùng chọn chữ trên nền sáng.

### Neutral
- **Nền sáng ánh lam** (`ink-50`): canvas của mọi trang.
- **Bề mặt** (`ink-0`): thẻ, tấm chồng, bảng, input; `ink-25` cho thẻ số liệu bằng 0.
- **Viền** (`ink-200`, `ink-100` cho đường kẻ dòng bảng), `ink-300` cho viền input và thanh cuộn.
- **Chữ** `ink-900` (chính), `ink-700`/`ink-800` (nhãn), `ink-600` (phụ, chữ nhỏ), `ink-500` chỉ khi ≥ 13px trên nền trắng; `ink-400` chỉ cho icon trang trí và placeholder.
- **Ngữ nghĩa** `success|warning|danger|info|neutral` × `fg|bg|border|solid`: `info` gộp về tông brand, `neutral` về tông ink; `warning` là cam, tách khỏi vàng thương hiệu.

### Named Rules
**The Gold Only On Blue Rule.** Vàng `accent-*` chỉ xuất hiện trên nền xanh (nút, chữ hover, dấu chevron) hoặc dưới dạng chevron hiện tại. Không bao giờ là chữ hay viền trên nền trắng, không bao giờ là màu trạng thái. Trên nền sáng, nút chính là xanh (`PublicHeader` tự đổi Đăng nhập từ `accent` sang `primary` khi cuộn).

**The One Flame Rule.** Mỗi vùng chỉ một điểm vàng chủ đạo: một CTA vàng trên hero, một chevron hiện tại trên mỗi thanh tiến trình.

**The Light Ground Rule.** Nền trang luôn sáng (`ink-50`); khối xanh là vùng có chủ đích, không phải chế độ tối. Không dark mode, `color-scheme: light`.

## Typography

**Display Font:** Be Vietnam Pro 800 (tự host, SIL OFL; fallback hệ thống sans)
**Body Font:** Be Vietnam Pro 400–600
**Label/Mono Font:** `ui-monospace` (SF Mono, Cascadia Mono, Menlo, Consolas) chỉ cho mã định danh

**Character:** Một xưởng chữ Việt, dấu thanh chuẩn; 800 nén chặt (letter-spacing âm) cho tiêu đề tạo giọng chính thức mà hiện đại, 400–600 cho chữ đọc gọn và rõ.

### Hierarchy
- **Hero** (800, clamp 38→64px, 1.04): duy nhất H1 trang chủ công khai.
- **Display** (800, clamp 32→44px, 1.1): H1 trang xác thực và khẩu hiệu cột xanh.
- **Title 1 / 2 / 3** (700 / 700 / 600; 26 / 19 / 16px): tiêu đề trang, khối, nhóm.
- **Metric** (700, 36px, tabular): số liệu tổng hợp, có đếm lên.
- **Body lg / Body / Body sm** (400; 16 / 14 / 13px): câu dẫn hero, chữ mặc định (root 16px, body 14px), meta.
- **Caption** (12px, +0.01em): nhãn phụ, đếm trên tab, meta thanh tiến trình. Không dùng chữ < 12px.
- **Code** (mono 600, 12px, tabular): `CodeTag` dạng “tem” cho mã đợt, mã hồ sơ.

### Named Rules
**The Unbroken Code Rule.** Mã và khoảng (KSTN-KTPM-K22, 2026–2027, DXT-2026…) không bao giờ bị ngắt dòng giữa chừng: bọc bằng `whitespace-nowrap`.

**The Tabular Numbers Rule.** Mọi con số so sánh được (số liệu, đếm, ngày giờ, mã) dùng `tabular-nums`; tiêu đề cột và nhãn mô tả không in hoa.

## Layout

Khung nội dung `max-w-7xl` (1280px) với lề 16 / 24 / 40px theo `sm` 640 / `lg` 1024; cột biểu mẫu xác thực `max-w-md`.

- **Trang công khai:** header trong suốt nằm trên khối xanh (`-mt-20` + `pt-20`), thu từ 80px xuống 64px và chuyển sang nền trắng mờ khi cuộn. Khối xanh hero chiếm khoảng 2/3 màn hình đầu; tấm trắng chứa quy trình sáu bước (chuỗi chevron, bước kế tiếp của người xem tô vàng) chồng lên mép dưới 96px (112px từ `lg`).
- **Trang xác thực:** lưới 12 cột từ `lg`: cột xanh 5/12 dính trên cùng, cao hết màn hình; cột biểu mẫu 7/12 căn giữa. Dưới `lg` cột xanh thu thành dải 80px chỉ có logo.
- **Workspace:** sidebar xanh dính bên trái (mặc định 248px, kéo được 200–360px, thu gọn 72px) từ `lg`; dưới đó là drawer trái. Header workspace 64px, trắng mờ, dính trên cùng.
- **Nhịp:** thang 4px của Tailwind; đệm thẻ 20px, đệm tấm chồng 20→32px.

## Elevation & Depth

Hệ lai: bề mặt tĩnh có viền `ink-200` **và** bóng mềm nhuộm xanh có độ lệch; lớp nổi thật dùng bóng sâu hơn và vật liệu mờ (backdrop blur). Bề mặt lồng trong bề mặt khác (hay trong overlay) chỉ giữ viền, bỏ bóng.

### Shadow Vocabulary
- **raised** (`0 1px 2px rgb(12 32 88 / .06)`): nút, input ở trạng thái nghỉ.
- **card** (`0 1px 2px rgb(12 32 88 / .04), 0 10px 28px -14px rgb(21 56 152 / .18)`): `.surface`, Panel, MetricTile có số, viên chọn của FilterTabs và sidebar, nút chính khi hover.
- **lift** (`0 2px 4px …, 0 22px 44px -18px rgb(21 56 152 / .3)`): phần tử nổi lên khi hover/nhấn mạnh (tab demo).
- **sheet** (`0 -2px 6px rgb(10 26 64 / .04), 0 30px 60px -24px rgb(10 26 64 / .35)`): tấm trắng chồng lên dải xanh.
- **overlay / modal** : popover, nút vàng khi hover, ô tìm kiếm trên hero / modal, drawer.
- **bar** : thanh hành động dính đáy.
- **focus** (`0 0 0 4px rgb(47 89 196 / .2)`): vòng focus của input.

### Named Rules
**The Frosted Layer Rule.** Blur chỉ cho lớp nằm trên nội dung: header khi cuộn và header workspace (`bg-white/80–85` + blur), backdrop overlay (`brand-950/42` + blur 6px), thanh hành động dính, chip hạn chót trên hero. Không blur trang trí trên bề mặt tĩnh.

**The Scrim Not Gradient Rule.** Chuyển sắc chỉ xuất hiện như lớp phủ xanh-trên-xanh (`brand-800` → trong suốt) giúp chữ đọc được trên trường chevron; không gradient trang trí, không gradient nhiều màu.

## Shapes

- **Góc chữ U:** mỗi khối xanh chữ ký có đúng một góc bo lớn (`u` 64px trên mobile, `hero` 112px từ `lg`): hero công khai ở dưới-trái, cột xác thực ở dưới-phải (desktop), chân trang `brand-950` ở trên-phải. Ba góc còn lại vuông.
- **Thang bo:** `xs` 6 (mã, logo, tag), `control` 12 (input, mục sidebar), `card` 18 (thẻ, bảng), `modal` 24 (tấm chồng, modal), `full` cho nút, bộ lọc, chip.
- **Chevron:** module dải đứng `chev-up` / `ChevronMark` (cặp chevron xếp lồng, cỡ theo font-size, màu theo `currentColor`); đoạn chevron ngang `chev-seg` với khấc `--k` (5–6px nhỏ, 9px thường, 16px pipeline dashboard) và khe 3px giữa các đoạn; đoạn đầu không có khấc trái. Hoa văn `chev-pattern` (chevron trắng 7%) là nền dự phòng khi không có WebGL và hoa văn đáy sidebar.

### Named Rules
**The One U Corner Rule.** Một khối, một góc chữ U. Không bo đều bốn góc cho khối xanh, không dùng `u`/`hero` trên thẻ thường.

## Components

### Buttons
- **Shape:** pill (`full`), cao 32 / 40 / 48px theo `sm` / `md` / `lg`, chữ 600 (500 ở `sm`).
- **Primary:** nền `brand-600`, chữ trắng, bóng `raised`; hover `brand-700` + bóng `card` + nhích lên 1px; active `brand-800`.
- **Accent:** nền `accent-500`, chữ `brand-950`; hover `accent-400` + bóng `overlay`. Chỉ đặt trên nền xanh.
- **onDark:** nút phụ trên nền xanh, nền trắng 10%, viền trắng 30%, chữ trắng; focus đổi sang vàng `accent-400`.
- **Secondary / Tertiary / Link / Danger / Danger-outline / Warning-outline:** trắng viền `ink-300`, hover nhuốm `brand-25`; tertiary trong suốt; danger nền `danger-fg`.
- **Disabled:** `ink-100` nền, `ink-400` chữ, không bóng, không nhích.

### Chips
- **FilterTabs segmented:** rãnh pill `ink-100`; viên trắng có bóng `card` trượt theo lựa chọn (motion `layoutId`, spring 520/40); đếm số pill `brand-600` trắng khi chọn. Bàn phím mũi tên/Home/End.
- **FilterTabs underline:** gạch 2px `brand-600` dưới mục chọn, chữ `brand-700`.
- **CodeTag “tem”:** mono 600 12px, nền `brand-50`, viền `brand-100`, chữ `brand-700`, bo `xs`.

### Cards / Containers
- **Corner Style:** `card` 18px; tấm chồng `modal` 24px.
- **Background:** `ink-0`; viền `ink-200`; bóng `card` (tấm chồng: `sheet` + vòng `ink-200/70`).
- **Internal Padding:** 20px; tấm chồng 20→32px.
- **MetricTile:** số `metric` `brand-950` đếm lên (CountUp, `ease-out-expo`, tối đa 1.4s; trình đọc màn hình nhận giá trị cuối). Số bằng 0 thì thẻ lùi xuống: nền `ink-25`, không bóng, để việc thật nổi lên.

### Inputs / Fields
- **Style:** cao 42px, bo `control`, viền `ink-300`, bóng `raised`; hover viền `brand-300`.
- **Focus:** viền `brand-600` + vòng `focus` 4px. Lỗi: viền `danger-fg`, vòng đỏ 14%.
- **Disabled / readonly:** nền `ink-50`, chữ `ink-700`, không bóng.
- **Trên hero:** ô tìm kiếm pill cao 52px, viền trắng, bóng `overlay`.

### Navigation
- **Sidebar:** nền `brand-600`, chữ `brand-100`; mục đang chọn là viên trắng bo `control` có bóng `card` trượt theo lựa chọn (spring 480/38), chữ `brand-800`, icon `brand-600`, kèm `ChevronMark` vàng. Thẻ vai trò trắng 8% với `ChevronMark` vàng. Thu gọn còn icon + tooltip.
- **PublicHeader:** trong suốt trên khối xanh (logo trắng, nút Đăng nhập vàng); khi cuộn chuyển trắng mờ, logo Khoa CNTT, nút Đăng nhập xanh.
- **WorkspaceHeader:** 64px, trắng 80% + blur, breadcrumb `ink-600`.

### ProcessTrack (chữ ký)
Mọi chuỗi tuần tự có thứ tự và có người chịu trách nhiệm dùng cùng một ngữ pháp: các đoạn chevron nối nhau (đã qua `brand-600`, hiện tại `accent-500`, chưa tới `ink-200`; tông `onDark`: trắng / vàng / trắng 20%). Phần tô lấp đầy lần lượt từ trái (640ms `ease-out-expo`, trễ 70ms mỗi đoạn). Nhãn hiện tại đậm `ink-900`; dưới 640px chỉ nhãn hiện tại hiển thị, các nhãn khác chỉ cho trình đọc màn hình. Xuất hiện ở `RoundTrack` (5 giai đoạn ĐXT), chi tiết ĐXT, phê duyệt 3 cấp, `Stepper` (wizard, đăng ký) và pipeline dashboard (ô chevron cao 96px, số `title-1`; có số thì `brand-600` chữ trắng, bằng 0 thì `ink-100`).

### ChevronField (chữ ký)
Trường chevron 3D: module logo đùn khối, instanced, sắc xanh quanh `brand-600` và vài module vàng; nổi lên theo con trỏ như có ngọn đèn lướt qua, không có chuột thì đèn tự lướt. `three` được tách gói (`import("three")`), chỉ dùng trên hero công khai (`high`) và cột xác thực từ `lg` (`low`). Trang trí thuần: `aria-hidden`, không nhận sự kiện, dừng khi ra khỏi khung nhìn, đứng yên một khung khi reduced-motion, không có WebGL thì giữ nền xanh + `chev-pattern`.

### Motion
- Vào trang: một lần nổi lên từ dưới (opacity + translateY 10–18px), `ease-out-expo` `cubic-bezier(0.16, 1, 0.3, 1)`, 360–800ms, so le 80ms trên hero.
- Chuyển trang workspace: WAAPI trên `<main>` (380ms), không remount để giữ trạng thái bộ lọc; focus về H1.
- Trạng thái: `--duration-fast|base|slow` 120 / 180 / 260ms với `--ease-standard`. Chỉ animate `opacity` / `transform` (ngoại lệ: `grid-template-rows` cho thu gọn).
- `MotionConfig reducedMotion="user"` + CSS reduced-motion + kiểm tra `matchMedia` trong WAAPI và ChevronField.

## Do's and Don'ts

### Do:
- **Do** đặt vàng `accent-500` chỉ trên nền xanh hoặc làm chevron hiện tại; trên nền trắng dùng nút `primary` xanh.
- **Do** cho mỗi khối xanh chữ ký đúng một góc chữ U (`u` 64px / `hero` 112px từ `lg`).
- **Do** chồng tấm trắng bo `modal` có bóng `sheet` lên mép dưới dải xanh ở trang công khai.
- **Do** biểu diễn mọi chuỗi có thứ tự bằng `ProcessTrack` / `chev-track`, không bằng chấm, số tròn hay progress ring.
- **Do** giữ WebGL cho trang công khai và xác thực; workspace chỉ dùng chỉ báo trượt, đếm lên, trang nổi nhẹ và pipeline chevron.
- **Do** dùng semantic token trong JSX; mã và khoảng bọc `whitespace-nowrap`.

### Don't:
- **Don't** dùng vàng làm chữ, viền hay màu trạng thái trên nền trắng.
- **Don't** dùng gradient trang trí, glow/pulse, hay blur trên bề mặt tĩnh; chuyển sắc chỉ là lớp phủ xanh-trên-xanh cho chữ đọc được.
- **Don't** làm dark mode.
- **Don't** dùng emoji, ảnh stock hay ảnh khuôn viên, số liệu bịa, marketing copy.
- **Don't** đặt bóng chồng bóng: bề mặt lồng trong bề mặt khác chỉ giữ viền.
- **Don't** thêm eyebrow/kicker in hoa, `border-left`/`border-right` màu > 1px, sparkline hay progress ring trang trí.
- **Don't** dùng màu Tailwind mặc định, mã hex hay `text-[..px]` trong JSX; chữ không nhỏ hơn 12px.
- **Don't** đưa ChevronField (WebGL) vào workspace.

### Token và tài sản
- Token nằm trong `src/styles/theme.css` (khối `@theme` của Tailwind v4): `brand-25…950`, `ink-0…900`, `accent-50…700`, semantic × `fg|bg|border|solid`, `focus`; thang chữ `hero`, `display`, `title-1/2/3`, `metric`, `body-lg`, `body`, `body-sm`, `caption`; bo `xs|control|card|modal|u|hero`; bóng `hairline|raised|card|lift|sheet|overlay|modal|focus|bar`; easing `standard|emphasized|out-expo`.
- CSS tự viết nằm trong `@layer base` / `@layer components` để utility của Tailwind luôn thắng.
- `assets/img/brand/`: `iuh-logo.svg` (nền sáng), `iuh-logo-white.svg` (nền xanh: hero, sidebar, cột xác thực, chân trang), favicon và apple-touch-icon. Logo Khoa CNTT trên header công khai (trạng thái cuộn) được giữ nguyên.
- `assets/fonts/be-vietnam-pro/`: Be Vietnam Pro 400–800, tách subset vietnamese / latin-ext / latin, kèm `OFL.txt`.

---

## 2. Cấu trúc kiến trúc mã nguồn

```text
src/
  components/
    ui/          -> Button, IconButton, Tooltip, Form (Field/Input/Textarea/Select/Checkbox/RadioCard),
                    PasswordInput, Display (CodeTag/Avatar/Callout/Capacity/DescriptionList/Timeline),
                    Panel, ProcessTrack, ChevronField (+ChevronMark), MetricTile (StatCard), IdentityHeader, StatePage,
                    StatusBadge, FilterTabs, Stepper, FileDropzone (+FileItem), EmptyState, Pagination,
                    Modal, Drawer, FullscreenDialog, ConfirmDialog, Toast (ToastStack), useDialogA11y
    layout/      -> PublicHeader, PublicFooter, AuthShell, WorkspaceHeader, Sidebar (+SidebarBrand/SidebarNav),
                    RoleSwitcher, NotificationBell, ActionBar, PageHeader
    data/        -> TablePanel, TableToolbar, TableActions, ResponsiveTable
  hooks/         -> usePagedFilter (tìm kiếm + lọc + phân trang 10 dòng), useMediaQuery
  features/      -> public, majors, classes, teachers, students, permissions, rounds, criteria,
                    approvals, student-application, passwords, profile (mỗi trang tự render PageHeader)
  data/
    status-definitions.js, fixtures.js, demo-store.jsx (ToastStack tối đa 3), page-meta.js
  dev/Gallery.jsx -> gallery thành phần, chỉ mount khi `import.meta.env.DEV` và URL có `?gallery`
  styles/
    theme.css      -> toàn bộ design token (@theme)
    base.css       -> @font-face Be Vietnam Pro tự host (assets/fonts/be-vietnam-pro, OFL), reset, skip-link, focus, vùng chọn/thanh cuộn theo màu thương hiệu, reduced-motion
    components.css -> lớp khó viết bằng utility (.surface, ngữ pháp chevron chev-*, chev-pattern, page-in, ui-table, ui-input, overlay blur, keyframes)
  App.jsx          -> workspace shell (sidebar, header, mobile drawer, focus H1 khi đổi trang)
```

### Thành phần dùng chung — quy ước
- **Overlay** (Modal, Drawer, FullscreenDialog, ConfirmDialog, mobile nav) dùng chung `useDialogA11y`: focus trap, Esc (chỉ lớp trên cùng), khôi phục focus, khóa cuộn body. Dưới 640px Modal/Drawer thành bottom sheet.
- **Modal form** đặt `closeOnBackdrop={false}`; nút lưu nằm ở `footer` (liên kết form bằng `form={id}`).
- **Xem chi tiết** dùng `Drawer`; **xác nhận / thông báo chặn** dùng `ConfirmDialog` (căn trái, hành động nguy hiểm focus mặc định ở nút Hủy).
- **Bảng** dùng `ResponsiveTable`: ≥ 640px là bảng, dưới đó là danh sách thẻ; cột phụ ẩn theo breakpoint theo độ rộng nội dung (sidebar chiếm 248px từ 1024px).
- **Form** dùng `Field` (label `htmlFor`, `*` có text sr-only “Bắt buộc”, hint, lỗi tại chỗ `role="alert"`).

---

## 3. Các nghiệp vụ và tương tác của prototype v3

Nguồn nghiệp vụ là `coding_plan/KSTN-PROTOTYPE-IMPLEMENTATION-PLAN.md` và các quyết định đã chốt trong Master Plan. Giữ token và chữ ký thị giác ở mục 1; nội dung nghiệp vụ đã chuyển sang mô hình v3.

1. **Trang công khai (A-25):** chỉ trang chủ giới thiệu chương trình, quy trình sáu bước và lối Đăng ký/Đăng nhập. Không liệt kê ĐXT, không có chi tiết ĐXT, kết quả hay tra cứu OTP công khai; service `public.*` và OTP `LOOKUP` đã bỏ. Sinh viên đăng ký xong mới thấy đợt của lớp cùng ngành và khóa; kết quả xem trong “Hồ sơ của tôi” và email, điểm chính thức chỉ hiện khi ĐXT đã công bố.
2. **Xác thực:** đăng ký ba bước email IUH → OTP → tài khoản, chỉ sinh viên có trong danh sách do CNN nhập mới đăng ký được, dữ liệu cá nhân (ngành, khóa) khóa từ danh sách đó; đăng nhập MSSV/mã GV/email; khóa tạm sau 5 lần sai. Tài khoản có mustChangePassword bị chặn cho tới khi đổi MK. Một phiên dùng một vai trò có phạm vi thật.
3. **Workspace:** sidebar theo vai trò, chọn vai trò, chuông thông báo, menu tài khoản hỗ trợ bàn phím. Route không hợp lệ/ngoài quyền có thông báo riêng. Focus về tiêu đề khi đổi trang; skip link không bị hash router coi là đổi trang.
4. **Hồ sơ sinh viên:** wizard thông tin cá nhân → tiêu chí và minh chứng → kiểm tra và nộp. Tiêu chí render từ snapshot, hỗ trợ NUMBER_THRESHOLD/COUNT/ACCUMULATIVE_ENUM; minh chứng riêng từng tiêu chí/thành tích, PDF/JPG/PNG theo giới hạn cấu hình (tối đa 10 MB). Điểm tự khai tính trực tiếp bằng domain scoring. Nháp là Application, tự lưu sau 1.5 giây; có sửa/rút/hủy/bổ sung theo trạng thái và hạn. Nộp xong chỉ hiện màn “Nộp hồ sơ thành công” (mã hồ sơ, thời điểm nộp), không hiện điểm dự kiến; hồ sơ không còn sửa được là trang chỉ đọc, tiêu chí hiện nhãn Hợp lệ/Không hợp lệ và ghi chú của GV. Luồng B/C kế thừa giá trị và yêu cầu minh chứng mới.
5. **Duyệt:** thông tin/tiêu chí bên trái và panel minh chứng bên phải, thành tích xác minh riêng. Đánh dấu Hợp lệ/Không hợp lệ bằng một thao tác ngay tại tiêu chí, không cần lý do và không có khung cảnh báo đỏ; chỉ điều chỉnh giá trị và các quyết định Không đạt/Yêu cầu bổ sung/Mở lại mới cần lý do. Chọn Đạt cần xác minh đủ và đạt BB. GV duyệt được ngay khi ĐXT đang tiếp nhận (`open`) hoặc `review`; hạn bổ sung chỉ cần sau hiện tại, không gắn reviewEnd, có thể hủy yêu cầu; có mở lại approved/rejected.
6. **Chốt và phê duyệt:** xem trước xếp hạng hai chế độ, đồng hạng vẫn được gửi CNN. Mỗi lần chốt tạo phiên bản mới; chuỗi CNN → BLĐ khoa → PĐT duyệt đúng phiên bản. Trả về có lý do, bắt đầu lại từ CNN. Hộp công bố hiển thị số trúng tuyển, DROPPED và email; công bố tự cập nhật tư cách/thành viên, không có bước SV xác nhận nhập học.
7. **Tiêu chí và ĐXT:** bộ tiêu chí DRAFT/PUBLISHED/ARCHIVED, owner CRUD của GV, CRUD ngành/khoa của CNN/BLĐ. Bộ published tạo phiên bản mới; ĐXT dùng snapshot lúc open. ĐXT đúng 6 trạng thái, phát hành và chuyển thời gian theo đồng hồ mô phỏng. Hai giai đoạn tiếp nhận và xét duyệt độc lập, được phép chồng nhau; GVPT sửa được bốn mốc thời gian (kể cả rút ngắn/gia hạn, mở lại tiếp nhận khi ĐXT `review`); published bất biến.
8. **Danh mục và tài khoản:** chuyên ngành giữ bốn cột Khoa/Chuyên ngành/Số lượng lớp/Thao tác. Xóa con trước cha. Lớp tính sĩ số từ membership theo năm, không nhập tay. GV khóa/mở thay xóa; reset MK tạm theo phạm vi. Trang “Danh sách sinh viên” (CNN): nhập CSV/dán từ Excel theo khóa, xem trước thêm mới/cập nhật/lỗi, xóa dòng chưa đăng ký; sinh viên chỉ thấy ĐXT của lớp cùng ngành và khóa. Gán vai trò có phạm vi/thời hạn và chặn BR-14 tại service.
9. **Vận hành:** báo cáo số liệu thật, phổ điểm khoảng 20, CSV UTF-8 BOM và in/lưu PDF. Nhật ký chỉ đọc, xem before/after. Outbox mô phỏng gửi lỗi/thử lại; cấu hình SMTP/file/OTP/nhắc việc/mẫu email. Thông báo cho mọi vai trò.
10. **Demo:** Drawer bốn tab đồng hồ/hộp thư/đăng nhập nhanh/dữ liệu, reset có ConfirmDialog; dữ liệu và minh chứng chỉ lưu trong trình duyệt. Canvas minh chứng seed ghi rõ dữ liệu demo.
11. **Quy ước chung:** bảng ResponsiveTable phân trang tối đa 10; Field cho nhãn và lỗi; Modal/Drawer/ConfirmDialog giữ useDialogA11y. Giao diện dùng tiếng Việt có dấu và semantic token. Kiểm browser responsive/focus/console là bước nghiệm thu riêng, chưa được thay bằng kiểm SSR.

---

## 4. Xác nhận nghiệm thu kỹ thuật (Verification)

- `pnpm build`: thành công cho cả 7 tệp HTML.
- 0 mã hex / kích thước chữ tùy ý / màu Tailwind mặc định (slate, rose…) trong JSX; `src/mock/architecture.test.js` chặn hex và `text-[..px]` trong `PublicHome.jsx` và `DemoPanel.jsx`.
- Không phụ thuộc tải font ngoài (100% Be Vietnam Pro tự host trong `assets/fonts/be-vietnam-pro`).
- `three` (0.187.0) chỉ nạp động khi có ChevronField; reduced-motion tắt chuyển động ở cả CSS, `motion` (`MotionConfig reducedMotion="user"`), WAAPI chuyển trang và trường chevron (đứng yên một khung).
- Mọi overlay: Esc đóng đúng lớp trên cùng, focus trap, trả focus; khi đổi trang workspace focus được đưa vào H1.
- Đã kiểm tra thủ công/tự động ở 1440, 1024 và 390px: không cuộn ngang toàn trang; bảng chuyển thẻ trên mobile; modal/drawer thành bottom sheet.
