# IUH Talent Admissions Interface Design Specification

> Phiên bản 2 — triển khai theo `UI-UX-UPGRADE-PLAN-V2.md`. Nguyên tắc: **nâng cấp hình thức và trải nghiệm, giữ nguyên nội dung** (chuỗi hiển thị, tên/thứ tự cột, menu, dữ liệu mẫu, nghiệp vụ).

## 1. Hướng thiết kế: “Academic Prestige × Operational Calm”

Cổng thông tin của chương trình đào tạo tài năng: cảm giác được tuyển chọn, chuẩn mực, đáng tin; khi làm việc thì êm, rõ, không gây áp lực.

### Ba chữ ký thị giác
1. **Honor Rule** — vạch 32×2px màu đồng (`accent-500`, `accent-300` trên nền navy) đặt trên eyebrow của tiêu đề trang (`.honor-rule`). Chỉ dùng ở tiêu đề cấp trang.
2. **CodeTag** — mã định danh (mã đợt, MSSV, mã lớp, mã hồ sơ) hiển thị bằng font mono tabular, chữ `brand-700`, nền `brand-50`, viền hairline (`<CodeTag>`; biến thể `plain`, `neutral`).
3. **Academic Grid** — lưới chấm tĩnh, opacity 0.04–0.08 trên hero công khai, đầu sidebar, thẻ danh tính và empty state (`.academic-grid`). Không animate.

### Danh sách cấm
Chữ/viền/nút gradient, glow/pulse, glassmorphism nặng (chỉ header khi cuộn: `backdrop-blur-md`), emoji, ảnh stock, số liệu bịa, bóng đen đậm, card lồng card, thêm marketing copy.

### Token (tất cả nằm trong `src/styles/theme.css`, khối `@theme` của Tailwind v4)
- **Màu:** `brand-25…950` (600 = `#153898`, 900 = nền sidebar/hero `#10285E`), `ink-0…900` (xám ánh lam; 50 = canvas, 200 = hairline, 600/900 = chữ phụ/chính), `accent-*` (chỉ dùng cực tiết chế, không bao giờ cho nút/trạng thái/link), `success|warning|danger|info|neutral` × `fg|bg|border|solid`, `focus`.
- **Chữ:** Inter Variable cục bộ, root 16px, `font-optical-sizing: auto`, `cv11`/`ss03`. Thang: `text-display`, `title-1/2/3`, `body-lg`, `body`, `body-sm`, `caption`, `overline`. Không dùng chữ < 12px.
- **Bo góc:** `rounded-xs` 6, `control` 10, `card` 14, `modal` 18. **Bóng nhuộm navy:** `shadow-raised | card | overlay | modal | focus`.
- **Chuyển động:** `--ease-standard`, `--ease-emphasized`, `--duration-fast|base|slow` (120/180/260ms); chỉ animate `opacity`/`transform`; tắt hoàn toàn khi `prefers-reduced-motion`.
- Không còn mã hex hay `text-[..px]` trong JSX (kiểm tra bằng `grep`).
- CSS tự viết nằm trong `@layer base` / `@layer components` để utility của Tailwind luôn thắng.

---

## 2. Cấu trúc kiến trúc mã nguồn

```text
src/
  components/
    ui/          -> Button, IconButton, Tooltip, Form (Field/Input/Textarea/Select/Checkbox/RadioCard),
                    PasswordInput, Display (CodeTag/Avatar/Callout/Capacity/DescriptionList/Timeline),
                    StatusBadge, FilterTabs, Stepper, FileDropzone (+FileItem), EmptyState, Pagination,
                    Modal, Drawer, FullscreenDialog, ConfirmDialog, Toast (ToastStack), useDialogA11y
    layout/      -> PublicHeader, WorkspaceHeader, Sidebar (+SidebarBrand/SidebarNav), PageHeader
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

## 3. Các nghiệp vụ & Tương tác cốt lõi

1. **Trang công khai tuyển sinh:**
   - Header một tầng (72px, thu còn 60px khi cuộn, blur nhẹ), hero navy có Academic Grid, ô tìm kiếm lớn, thanh `FilterTabs` có đếm số nổi chồng lên hero.
   - Thẻ đợt: CodeTag + badge trạng thái, khối lịch tách `round.time` (parse an toàn), vạch trái chỉ ở đợt “Đang mở”; Đang mở: “Nộp hồ sơ” + “Xem chi tiết”; trạng thái khác: “Xem chi tiết” + ghi chú trạng thái.
   - Modal chi tiết đợt (DescriptionList, danh sách điều kiện có icon, minh chứng đánh số) và modal nộp hồ sơ (nhóm trường, `FileDropzone`, PDF ≤ 5MB, phản hồi “đang xử lý” khi gửi).
   - Đăng nhập: chọn vai trò bằng radio card (Avatar + tên vai trò + người dùng thử), ô mật khẩu hiện/ẩn.

2. **Luồng sinh viên (Wizard 3 bước):**
   - `Stepper` ngang (mobile: thanh tiến độ + “Bước n/3”); chỉ sang bước kế tiếp khi trường bắt buộc của bước hiện tại hợp lệ; quay lại tự do.
   - Bước 2: chỉ báo trực tiếp ✓/⚠ so với “Yêu cầu chuẩn” (không chặn nộp); cột phải sticky “Kết quả tự khai” từ 1280px; minh chứng PDF bằng dropzone/`FileItem` (kéo-thả, thay thế, xóa; giữ thông điệp lỗi gốc).
   - Bước 3: nút nộp bị vô hiệu cho tới khi tích cam kết; thanh hành động dính đáy.
   - Lưu nháp thủ công + tự lưu sau 1.5s không gõ (không toast), chỉ báo “Đang lưu… / Đã lưu nháp”; cảnh báo rời trang khi còn thay đổi chưa lưu.
   - Sau khi gửi: theo dõi hồ sơ (thanh tiến độ suy ra từ lịch sử, Timeline sticky ở cột phải), cảnh báo `needs_update` kèm nút cập nhật minh chứng.

3. **Luồng xét duyệt hồ sơ:**
   - Danh sách: `FilterTabs` có đếm số (nhãn tiếng Việt), hàng “Chờ duyệt” có vạch cảnh báo, bấm cả hàng để mở.
   - Review Workspace toàn màn hình (`FullscreenDialog`): cột nội dung (trạng thái, thông tin SV, bảng đối chiếu, minh chứng, Timeline) + cột quyết định cố định 360px (ý kiến thẩm định, Phê duyệt / Yêu cầu bổ sung / Từ chối). Dưới 1024px: thanh quyết định dính đáy, ô ý kiến nằm cuối nội dung.
   - “Yêu cầu bổ sung” khi chưa có ý kiến: cảnh báo tại chỗ + trong hộp xác nhận (chỉ cảnh báo, không chặn); hộp xác nhận hiển thị lại ý kiến đã nhập. Chế độ `readonly` (Hồ sơ sinh viên) ẩn hoàn toàn cột quyết định.
   - Xem minh chứng bằng Drawer; “Xác nhận trúng tuyển” dùng icon `Award` (nhấn màu accent).

4. **Quản lý chuyên ngành:** giữ đúng 4 cột `Khoa | Chuyên ngành | Số lượng lớp | Thao tác`; trùng Khoa+Ngành → hộp cảnh báo “Quay lại kiểm tra” (focus quay về ô tên ngành); chuyên ngành còn lớp bị chặn xóa kèm minh họa `Khoa → Ngành → Lớp`.

5. **Quản lý lớp, tài khoản & phân quyền:** sĩ số hiện tại ≤ tối đa (lỗi tại chỗ + toast), chặn xóa lớp gắn đợt đang mở, phân trang tối đa 10 dòng/bảng; chi tiết trong Drawer; sidebar thu gọn/mở rộng (248 ↔ 72px), kéo đổi 200–360px, lưu tùy chọn vào `localStorage`, tooltip khi thu gọn; bộ chuyển vai trò nhanh trong menu tài khoản (điều hướng ↑↓/Home/End/Esc).

---

## 4. Xác nhận nghiệm thu kỹ thuật (Verification)

- `pnpm build`: thành công cho cả 7 tệp HTML.
- 0 mã hex / kích thước chữ tùy ý / màu Tailwind mặc định (slate, rose…) trong JSX.
- Không phụ thuộc tải font ngoài (100% Inter Variable cục bộ).
- Mọi overlay: Esc đóng đúng lớp trên cùng, focus trap, trả focus; khi đổi trang workspace focus được đưa vào H1.
- Đã kiểm tra thủ công/tự động ở 1440, 1024 và 390px: không cuộn ngang toàn trang; bảng chuyển thẻ trên mobile; modal/drawer thành bottom sheet.
