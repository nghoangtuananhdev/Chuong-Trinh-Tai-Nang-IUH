# Báo cáo P11 – Dọn dẹp, tích hợp và tài liệu
- Ngày: 10/11/2026
- Trạng thái: MÃ ĐÃ TRIỂN KHAI; cổng logic/build ĐẠT; kiểm UI CHƯA XÁC MINH.

## Đã làm
- Đã xóa các store/fixtures/admissions/evidence cũ và feature cũ được thay thế, chuyển StatusBadge sang domain.
- Gallery dùng ToastProvider/MockBackendProvider; cập nhật DESIGN.md mục 3 theo luồng v3.
- README-PROTOTYPE.md: lệnh chạy/tài khoản/demo 10 phút; UAT-results.md và FINAL-GAP-REPORT.md.

## Gap đã xử lý ở mã
- G-01…G-25: mã đã triển khai, truy vết tại FINAL-GAP-REPORT.md; kiểm UI chưa đóng.

## Kết quả kiểm tra
- 240 test tự động pass, 0 fail; render trang chủ và 110 tổ hợp route/vai trò thành công.
- Build đủ 7 HTML, không thêm runtime dependency; không sửa theme.css, dist hoặc tài liệu nguồn nghiệp vụ.
- Không còn import useDemoStore/demo-store/admissions/fixtures; luật import domain/service có architecture test.
- Lượt kiểm tích hợp cuối: 240 test pass, build 7 entry OK, render smoke 110 tổ hợp OK.

## Quyết định phát sinh
- Xem DECISIONS-ADDENDUM.md (đặc biệt A-10 về tiếp tục triển khai theo yêu cầu người dùng khi browser host lỗi).

## Rủi ro / việc còn lại
- Browser host của CUA không khả dụng. Chưa trực tiếp chạy click path, kiểm focus/console/responsive 1440/1024/390 hoặc IndexedDB thực.
- Không coi test mock client hoặc render SSR là UAT UI. Các mục này giữ CHƯA XÁC MINH trong UAT-results.md.
- Definition of Done toàn dự án chưa được ký nghiệm thu UI; không đánh dấu các mục chưa chạy là Đạt.

## Tối ưu lượt cuối
- Màn hình vận hành được lazy-load; bundle chính còn dưới 500 kB sau minify, không còn cảnh báo chunk lớn ở build cuối.
- Bộ kiểm render route đợi đầy đủ Suspense bằng streaming SSR, không chỉ kiểm fallback.
- Guard rời form có thay đổi chưa lưu; reset workspace theo activeRole để không giữ bộ lọc/dữ liệu của vai trò trước.
