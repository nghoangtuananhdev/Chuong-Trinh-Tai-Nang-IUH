# IUH Talent Admissions Interface Design Specification

> Phiên bản 3 — triển khai theo `ULTRA_FABLE_UI_UX_UPGRADE.md`. Nguyên tắc: **nâng cấp hình thức và trải nghiệm, giữ nguyên nội dung** (chuỗi hiển thị, tên/thứ tự cột, menu, dữ liệu mẫu, nghiệp vụ).

## 1. Hướng thiết kế: “IUH Blue — Rõ tiến trình”

Cổng hành chính học vụ của một trường đại học lớn: chính xác, sáng sủa, dứt khoát. Workspace là chế độ *Operate* (người dùng đến để xong việc); trang công khai và xác thực là Operate có điểm nhấn thương hiệu. Không “startup SaaS”, không “luxury học thuật”.

### Màu — lấy từ logo IUH chính thức
- **Xanh `brand-600` = `#153898`**: nút chính, liên kết, lựa chọn hiện tại, nền sidebar, hero công khai, khung thương hiệu trang xác thực.
- **Vàng `accent-500` = `#F9B200`**: chỉ trên nền xanh (nút `variant="accent"` ở hero, dòng nhãn chương trình). Không dùng làm chữ/viền trên nền trắng, không làm màu trạng thái.
- **Trung tính `ink-*`** (xám ánh lam): canvas `ink-50`, bề mặt `ink-0`, viền `ink-200`. `info` gộp về tông brand, `neutral` về tông ink; `warning` là cam, tách khỏi vàng thương hiệu.
- Chữ nhỏ dùng `ink-600` trở lên (`ink-500` chỉ khi ≥ 13px trên nền trắng); `ink-400` chỉ cho icon trang trí/placeholder.

### Chữ ký thị giác: thanh tiến trình (`ProcessTrack`)
Mọi chuỗi tuần tự có thứ tự và có người chịu trách nhiệm đều dùng cùng một ngữ pháp: các đoạn thanh ngang nối liền (đã qua/hiện tại `brand-600`, chưa tới `ink-200`, nhãn hiện tại đậm + chấm cuối đoạn). Xuất hiện ở: hàng đợt xét tuyển (`RoundTrack`, 5 giai đoạn), chi tiết ĐXT, dashboard (đếm ĐXT theo giai đoạn), phê duyệt 3 cấp (`ApprovalStepper`), wizard nộp hồ sơ và đăng ký 3 bước (`Stepper`).

### Hình khối
- Bo góc gọn: `xs` 4, `control` 8, `card` 12, `modal` 16.
- Chiều sâu bằng viền, không bằng bóng: bề mặt tĩnh (`.surface`, `Panel`, bảng) là nền trắng + viền `ink-200`. Bóng chỉ cho lớp nổi thật: popover, modal/drawer, toast, thanh hành động dính đáy (`shadow-bar`).
- Số liệu luôn `tabular-nums`; mã định danh (`CodeTag`) dùng mono; tiêu đề cột và nhãn mô tả không in hoa.

### Danh sách cấm
Gradient, glow/pulse, glassmorphism/blur trang trí, emoji, ảnh stock, số liệu bịa, thẻ lồng thẻ, eyebrow/kicker in hoa mới, `border-left`/`border-right` màu > 1px, sparkline/progress ring trang trí, dark mode, marketing copy, màu Tailwind mặc định, mã hex và `text-[..px]` trong JSX.

### Token (tất cả nằm trong `src/styles/theme.css`, khối `@theme` của Tailwind v4)
- **Màu:** `brand-25…950`, `ink-0…900`, `accent-50…700`, `success|warning|danger|info|neutral` × `fg|bg|border|solid`, `focus`.
- **Chữ:** Inter Variable cục bộ, root 16px. Thang: `text-display`, `title-1/2/3`, `metric`, `body-lg`, `body`, `body-sm`, `caption`. Không dùng chữ < 12px.
- **Bóng nhuộm xanh:** `shadow-raised | card | overlay | modal | focus | bar`.
- **Chuyển động:** `--ease-standard`, `--ease-emphasized`, `--duration-fast|base|slow` (120/180/260ms); chỉ animate `opacity`/`transform`; tắt khi `prefers-reduced-motion`.
- Không còn mã hex hay `text-[..px]` trong JSX (kiểm tra bằng `grep`).
- CSS tự viết nằm trong `@layer base` / `@layer components` để utility của Tailwind luôn thắng.

### Tài sản thương hiệu
`assets/img/brand/`: `iuh-logo.svg` (nền sáng), `iuh-logo-white.svg` (nền xanh: sidebar, khung xác thực), favicon và apple-touch-icon. Logo Khoa CNTT trên header công khai được giữ nguyên.

---

## 2. Cấu trúc kiến trúc mã nguồn

```text
src/
  components/
    ui/          -> Button, IconButton, Tooltip, Form (Field/Input/Textarea/Select/Checkbox/RadioCard),
                    PasswordInput, Display (CodeTag/Avatar/Callout/Capacity/DescriptionList/Timeline),
                    Panel, ProcessTrack, MetricTile (StatCard), IdentityHeader, StatePage,
                    StatusBadge, FilterTabs, Stepper, FileDropzone (+FileItem), EmptyState, Pagination,
                    Modal, Drawer, FullscreenDialog, ConfirmDialog, Toast (ToastStack), useDialogA11y
    layout/      -> PublicHeader, PublicShell, AuthShell, WorkspaceHeader, Sidebar (+SidebarBrand/SidebarNav),
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
    base.css       -> @font-face Inter cục bộ, reset, skip-link, focus, reduced-motion
    components.css -> lớp khó viết bằng utility (ui-table, ui-input, keyframes)
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

1. **Trang công khai:** hash route cho trang chủ, chi tiết ĐXT, kết quả che MSSV/tên và tra cứu cá nhân bằng MSSV + OTP. Bộ lọc trạng thái/năm học/học kỳ/khoa. Không có form nộp ẩn danh; nút nộp dẫn qua đăng nhập/đăng ký và giữ returnTo.
2. **Xác thực:** đăng ký ba bước email IUH → OTP → tài khoản, dữ liệu cá nhân khóa từ danh bạ; đăng nhập MSSV/mã GV/email; khóa tạm sau 5 lần sai. Tài khoản có mustChangePassword bị chặn cho tới khi đổi MK. Một phiên dùng một vai trò có phạm vi thật.
3. **Workspace:** sidebar theo vai trò, chọn vai trò, chuông thông báo, menu tài khoản hỗ trợ bàn phím. Route không hợp lệ/ngoài quyền có thông báo riêng. Focus về tiêu đề khi đổi trang; skip link không bị hash router coi là đổi trang.
4. **Hồ sơ sinh viên:** wizard thông tin cá nhân → tiêu chí và minh chứng → kiểm tra và nộp. Tiêu chí render từ snapshot, hỗ trợ NUMBER_THRESHOLD/COUNT/ACCUMULATIVE_ENUM; minh chứng riêng từng tiêu chí/thành tích, PDF/JPG/PNG theo giới hạn cấu hình (tối đa 10 MB). Điểm tự khai tính trực tiếp bằng domain scoring. Nháp là Application, tự lưu sau 1.5 giây; có sửa/rút/hủy/bổ sung theo trạng thái và hạn. Luồng B/C kế thừa giá trị và yêu cầu minh chứng mới.
5. **Duyệt:** thông tin/tiêu chí bên trái và panel minh chứng bên phải, thành tích xác minh riêng. Chỉnh giá trị hoặc đánh dấu sai phải có lý do. Chọn Đạt cần xác minh đủ và đạt BB. Hạn bổ sung không vượt reviewEnd; có mở lại approved/rejected trong review.
6. **Chốt và phê duyệt:** xem trước xếp hạng hai chế độ, đồng hạng vẫn được gửi CNN. Mỗi lần chốt tạo phiên bản mới; chuỗi CNN → BLĐ khoa → PĐT duyệt đúng phiên bản. Trả về có lý do, bắt đầu lại từ CNN. Hộp công bố hiển thị số trúng tuyển, DROPPED và email; công bố tự cập nhật tư cách/thành viên, không có bước SV xác nhận nhập học.
7. **Tiêu chí và ĐXT:** bộ tiêu chí DRAFT/PUBLISHED/ARCHIVED, owner CRUD của GV, CRUD ngành/khoa của CNN/BLĐ. Bộ published tạo phiên bản mới; ĐXT dùng snapshot lúc open. ĐXT đúng 6 trạng thái, phát hành và chuyển thời gian theo đồng hồ mô phỏng; sửa trường theo giai đoạn và vai trò, published bất biến.
8. **Danh mục và tài khoản:** chuyên ngành giữ bốn cột Khoa/Chuyên ngành/Số lượng lớp/Thao tác. Xóa con trước cha. Lớp tính sĩ số từ membership theo năm, không nhập tay. GV khóa/mở thay xóa; reset MK tạm theo phạm vi. Gán vai trò có phạm vi/thời hạn và chặn BR-14 tại service.
9. **Vận hành:** báo cáo số liệu thật, phổ điểm khoảng 20, CSV UTF-8 BOM và in/lưu PDF. Nhật ký chỉ đọc, xem before/after. Outbox mô phỏng gửi lỗi/thử lại; cấu hình SMTP/file/OTP/nhắc việc/mẫu email. Thông báo cho mọi vai trò.
10. **Demo:** Drawer bốn tab đồng hồ/hộp thư/đăng nhập nhanh/dữ liệu, reset có ConfirmDialog; dữ liệu và minh chứng chỉ lưu trong trình duyệt. Canvas minh chứng seed ghi rõ dữ liệu demo.
11. **Quy ước chung:** bảng ResponsiveTable phân trang tối đa 10; Field cho nhãn và lỗi; Modal/Drawer/ConfirmDialog giữ useDialogA11y. Giao diện dùng tiếng Việt có dấu và semantic token. Kiểm browser responsive/focus/console là bước nghiệm thu riêng, chưa được thay bằng kiểm SSR.

---

## 4. Xác nhận nghiệm thu kỹ thuật (Verification)

- `pnpm build`: thành công cho cả 7 tệp HTML.
- 0 mã hex / kích thước chữ tùy ý / màu Tailwind mặc định (slate, rose…) trong JSX.
- Không phụ thuộc tải font ngoài (100% Inter Variable cục bộ).
- Mọi overlay: Esc đóng đúng lớp trên cùng, focus trap, trả focus; khi đổi trang workspace focus được đưa vào H1.
- Đã kiểm tra thủ công/tự động ở 1440, 1024 và 390px: không cuộn ngang toàn trang; bảng chuyển thẻ trên mobile; modal/drawer thành bottom sheet.
