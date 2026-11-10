# Kết quả kiểm thử UAT

Ngày 10/11/2026. Dữ liệu được khởi tạo mới cho từng kịch bản trong `src/mock/uat.test.js`; service/client chạy thật trên db mock, không dùng backend hoặc email thật.

**Phân biệt:** “ĐẠT tự động” dưới đây là kiểm nghiệp vụ qua mock client. Cột UI là thao tác thủ công trên trình duyệt; không được suy ra Đạt từ test service hoặc SSR.

| Kịch bản | Kết quả tự động | Kiểm UI thủ công |
| --- | --- | --- |
| U1 đăng ký OTP → tạo TK → nháp R1 → nộp → email mã hồ sơ | ĐẠT; isKSTN=false, flow A, pending, email chứa mã | CHƯA XÁC MINH |
| U2 giả MSSV/email | ĐẠT; phản hồi chung, không email tới hacker | CHƯA XÁC MINH |
| U3 MSSV đã có TK | ĐẠT; sau OTP biết accountExists/CONFLICT; Nam đăng nhập được | CHƯA XÁC MINH |
| U4a bổ sung trong hạn | ĐẠT; pending, reset xác minh mục sửa, thông báo GV | CHƯA XÁC MINH |
| U4b quá hạn bổ sung | ĐẠT; rejected, email, chặn resubmit muộn | CHƯA XÁC MINH |
| U5 BLĐ trả R4 | ĐẠT; review, v3, waiting_head, phiên bản cũ không duyệt lại | CHƯA XÁC MINH |
| U6 PĐT công bố R5 | ĐẠT; 3 confirmed, 1 DROPPED, kết quả che; published bất biến | CHƯA XÁC MINH |
| U7 buộc đổi MK | ĐẠT; GV009 đăng nhập nhưng không có quyền tới khi đổi | CHƯA XÁC MINH |
| U8 phiên bản tiêu chí | ĐẠT; CS2 v2 DRAFT, R2 snapshot v1 giữ nguyên | CHƯA XÁC MINH |
| U9 SV cũ không nộp | ĐẠT; hoàn tất R2 đủ 3 cấp, Tú DROPPED/isKSTN=false/email | CHƯA XÁC MINH |
| U10 ngoài ngành | ĐẠT; CNN HTTT duyệt KTPM nhận FORBIDDEN | CHƯA XÁC MINH |
| U11 đa vai trò | ĐẠT; HEAD ↔ LECTURER có phạm vi/quyền khác | CHƯA XÁC MINH |
| U12 tự chuyển thời gian | ĐẠT; R6 open + snapshot + audit actor Hệ thống | CHƯA XÁC MINH |
| U13 trúng hai lớp | ĐẠT; đối chiếu membership cùng năm, loại xung đột, lấp suất kế tiếp, không vượt quota | CHƯA XÁC MINH |
| U14 đồng hạng | ĐẠT; phải chọn đúng 1/2, BLĐ thấy tieResolution | CHƯA XÁC MINH |
| U15 reset MK SV theo lớp | ĐẠT; MK tạm/outbox, SV bị buộc đổi; ngoài lớp FORBIDDEN | CHƯA XÁC MINH |
| Bổ sung: đổi email IUH | ĐẠT; OTP CHANGE_EMAIL tới alias được xác nhận, profile + audit cập nhật | CHƯA XÁC MINH |

## Kiểm tổng hợp

- `npm test`: 240 pass, 0 fail, 0 skipped.
- Build Vite: 7 entry HTML thành công, artifact `/tmp/kstn-prototype-build`.
- `verify-render.mjs`: trang chủ seed v3 có R6/Demo, không công khai R7 nháp.
- `verify-routes.mjs`: 110 tổ hợp trang/vai trò render thành công, gồm các màn hình chính, chi tiết, auth, forced-password và route không tồn tại.
- File validator kiểm magic bytes PDF/JPG/PNG, giả MIME, docx, rỗng, quá dung lượng và cấu hình 2 MB. Chưa kiểm lưu/đọc/xóa IndexedDB qua trình duyệt thực.
- Không có ảnh chụp UI: CUA báo `The browser access host is unavailable` khi inventory và mở tab localhost.

## Việc cần nghiệm thu khi browser host hoạt động

1. Chạy các click path U1–U15 theo bảng §12.3 của kế hoạch sau reset từng kịch bản.
2. Kiểm 1440/1024/390: không tràn ngang, bảng chuyển thẻ, form/upload đọc được, header và Demo không che điều khiển.
3. Kiểm console, Tab/Shift+Tab, Esc đóng đúng overlay, trả focus, focus H1 và skip link; thử reduced motion.
4. Tải PDF/JPG/PNG thật, xem/tải xuống/xóa, refresh và đa tab; reset xóa IndexedDB. Chạy thử CSV trong Excel và In/Lưu PDF.
5. Ghi kết quả quan sát và ảnh trước khi ký Definition of Done toàn dự án. Hiện chưa ký nghiệm thu UI.
