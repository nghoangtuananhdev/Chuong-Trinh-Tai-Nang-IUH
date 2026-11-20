# Báo cáo thực hiện FIX-HAU-BAO-CAO-LAN-1

Kết quả: `node --test "src/**/*.test.js"` **266/266 đạt** (trước khi sửa: 245). Build `vite build --outDir /tmp/kstn-prototype-build` thành công cho cả 7 entry. Không có hex / `text-[..px]` mới trong JSX.

## Việc đã làm theo từng WP

### WP1 — Tiếp nhận/xét duyệt chồng lấn, duyệt không gắn thời gian (A-16…A-18)
- `round-machine.js`: `review → open`, `canReviewApplications`, `phaseState`, `validateTimeline` theo A-17, `editableFields` (review sửa được cả 4 mốc).
- `application-machine.js`: GVPT/CNN quyết định khi ĐXT `open`/`review`; `needs_update → pending` (hủy yêu cầu); hạn bổ sung chỉ cần sau hiện tại, hạn rỗng báo “Vui lòng chọn hạn bổ sung.”.
- `scheduler.js`: hồ sơ quá hạn bổ sung xử lý khi ĐXT còn xét duyệt được; đổi thông báo đóng tiếp nhận; thông báo GVPT + CNN khi ĐXT mở.
- Service: `reviews.cancelRequest` mới; `rounds.update` cho rút ngắn/gia hạn `intakeEnd` khi `open`, mở lại tiếp nhận khi `review` (audit `ROUND_INTAKE_REOPENED`); `createDraft` chặn thêm `rejected` (A-20).
- UI: `ReviewsPage` (đợt mặc định, hai dòng khung thời gian, chốt danh sách vô hiệu khi còn `open`), `RoundsPage` (hint, cột “Xét duyệt”), `RoundMilestones` (hai giai đoạn song song), nhãn Dashboard, `StudentPortal` (canReviewApplications, thêm `rejected`).
- Seed: `DXT-2026-01` xét duyệt 10/11–10/12.

### WP2 — Màn duyệt (A-21)
- `verifyItem`: INVALID không cần ghi chú; `verifiedValue` chỉ ghi khi payload có khóa; history dùng tên tiêu chí kèm kết quả.
- `ReviewsPage` viết lại phần chi tiết: bỏ khung đỏ, dòng tóm tắt trung tính, cụm Hợp lệ/Không hợp lệ (lưu ngay, không toast), ghi chú riêng từng tiêu chí/thành tích (onBlur), “Điều chỉnh giá trị” thu gọn, ba nút quyết định với Modal/ConfirmDialog, panel “Đang chờ sinh viên bổ sung” + hủy yêu cầu, mở lại approved/rejected có lý do, nhãn “Vừa cập nhật”.

### WP3 — Luồng bổ sung phía sinh viên
`CriterionField` có prop `feedback` (nhãn Hợp lệ/Không hợp lệ + ghi chú GV); tiêu chí bị đánh dấu lên đầu bước 2 kèm dòng đếm; đầu trang ghi “Hạn bổ sung”; `applyValues` gắn `updatedAt`; nút “Gửi bổ sung” vô hiệu tới khi có thay đổi, kèm dòng trợ giúp.

### WP4 — Nộp xong chỉ báo thành công
Màn “Nộp hồ sơ thành công / Đã gửi bổ sung thành công” (focus vào tiêu đề, mã hồ sơ, ĐXT, thời điểm, hai nút); hồ sơ không còn sửa được là trang chỉ đọc (không stepper, không “Điểm dự kiến”); lịch sử xử lý chuyển vào `ApplicationForm`; sửa hồ sơ chờ duyệt vẫn toast “Đã cập nhật hồ sơ.”.

### WP5 — CNN nhập danh sách, lớp phù hợp (A-22…A-24)
- `SCHEMA_VERSION = 4` (hằng số ở `domain/constants.js`); quyền `student.import` (HEAD).
- `domain/student-import.js` (parse CSV/TSV, chuẩn hóa, lập kế hoạch), `eligibleClasses`, `classifyFlow` chặn ĐXT không phù hợp.
- Service `directory.import` / `directory.remove`; `registerStudent` chép `cohort`.
- UI: trang “Danh sách sinh viên” (menu CNN), modal nhập ba bước; trang đăng ký có hướng dẫn + Ngành/Khóa; tổng quan sinh viên có panel “Lớp phù hợp với bạn”; nút “Về tổng quan” khi `createDraft` bị từ chối.
- Seed gán khóa cho mọi sinh viên; thay hồ sơ lệch ở `DXT-2026-01` bằng 26900013–26900015, hồ sơ rút do 26900016.
- Tài liệu: thay “danh bạ IUH” trong src, DESIGN.md, hướng dẫn demo/UAT.

### WP6
DECISIONS-ADDENDUM (A-16…A-24), DESIGN.md mục 3 (điểm 2, 4, 5, 7, 8), UAT-TEST-GUIDE và Huong-Dan-Demo (mục “Kịch bản sau báo cáo lần 1”, S1–S4).

## Test thêm/sửa
- Sửa theo luật mới: `round-machine.test.js`, `application-machine.test.js`, `services.test.js`, `flows.test.js` + `test-fixtures.js` (thêm `cohort` cho lớp), `regression.test.js` (dùng 26900016), `architecture.test.js` (regex import không còn nhận nhầm khóa quyền `student.import`).
- Thêm: `wp1.test.js` (duyệt khi `open`, rút ngắn/mở lại tiếp nhận, hủy yêu cầu, `rejected` chặn tạo mới, `updatedAt`, `verifiedValue`), `student-import.test.js`, `directory.test.js` (phân quyền, ngành khác, nhập lại, luồng OTP → đăng ký → lớp phù hợp, seed nhất quán), `persistence.test.js` (schema v3 nạp lại seed).

## Kiểm tra trình duyệt (built-in browser)
Đã chạy: S2 (GV005 đánh dấu không hợp lệ → không toast/khung đỏ, tóm tắt đổi 2/2→1/2, modal yêu cầu bổ sung điền sẵn, panel chờ + nút hủy; SV 26010022 thấy nhãn, hạn bổ sung, gửi → màn thành công), trang chỉ đọc hồ sơ đã khóa, S4 phần nhập (xem trước 2 hợp lệ/1 lỗi, nhập thành công), panel “Lớp phù hợp”. Chưa chạy trong trình duyệt: đăng ký bằng MSSV vừa nhập (đã có test service), nộp mới bằng 26010011, form sửa ĐXT, kiểm 1024px, focus trap từng modal.
Cuộn ngang ở 390px: toàn trang rộng 398px trên **mọi** trang kể cả Tổng quan; nguyên nhân là nút tài khoản ở thanh trên (có từ trước, ngoài phạm vi), không phải màn mới.

## Mười lỗi B1–B10
B1 (ghi chú theo từng tiêu chí), B2 (test `verifiedValue`), B3 (lỗi tại ô trong modal), B4 (panel chờ + hủy), B5, B6, B7 (đã thấy trên trình duyệt), B8 (nút vô hiệu), B9 (`updatedAt` có test; nhãn phía GV chưa xem bằng trình duyệt), B10 (test hạn sau `reviewEnd`).

## Điểm lệch so với kế hoạch
- Seed thêm 4 sinh viên (26900013–26900016) thay vì 3, vì hồ sơ “đã rút” của 26900012 (ngành MKT) cũng lệch lớp KTPM-K22.
- Ngày sinh được phép để trống khi nhập (kế hoạch không nói rõ).
- Cụm Hợp lệ/Không hợp lệ dùng hai `Button` có `aria-pressed` thay vì `FilterTabs`.
- Lỗi hạn bổ sung phía server hiển thị tại ô khi `details.field === "dueAt"`; lỗi rỗng được kiểm ở client.

## Việc còn mở / cần xác nhận với giảng viên
- **G1** “Customize các giai đoạn” hiểu là tùy chỉnh thời gian của hai giai đoạn, không thêm/bớt/đổi tên giai đoạn.
- **G2** “Lớp phù hợp” = cùng ngành + cùng khóa.
- **G3** N6 hiểu là màn xác nhận sau nộp và trang chỉ đọc không có điểm dự kiến.
- Chưa có kiểm tra trình duyệt trọn bộ ở 1024px; cuộn ngang 398px ở thanh trên (có từ trước) nên xử lý riêng.
