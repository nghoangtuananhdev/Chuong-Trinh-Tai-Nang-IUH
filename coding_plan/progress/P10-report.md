# Báo cáo P10 – Vận hành và tổng quan
- Ngày: 10/11/2026
- Trạng thái: MÃ ĐÃ TRIỂN KHAI; cổng logic/build ĐẠT; kiểm UI CHƯA XÁC MINH.

## Đã làm
- src/mock/services/operations.js: báo cáo/CSV/audit/email/config; quyền ở service và audit mutation.
- OperationsPage.jsx: phổ điểm khoảng 20, CSV BOM/in PDF, nhật ký before/after, outbox retry, cấu hình SMTP/file/OTP/nhắc việc/mẫu.
- Dashboard.jsx: số liệu và việc cần làm theo phạm vi; RecordsPage.jsx: hồ sơ và dòng thời gian.

## Gap đã xử lý ở mã
- G-18, G-19, G-21.

## Kết quả kiểm tra
- Báo cáo ngoài ngành FORBIDDEN; số đếm đối chiếu db; CSV có BOM và tiếng Việt.
- ADMIN hạ file maxMb=2 chặn 3MB; PĐT không được sửa cấu hình; log có before/after.
- PĐT xem email FAILED và resend; GV không có quyền; U15 MK tạm buộc đổi.
- Lượt kiểm tích hợp cuối: 240 test pass, build 7 entry OK, render smoke 110 tổ hợp OK.

## Quyết định phát sinh
- Xem DECISIONS-ADDENDUM.md (đặc biệt A-10 về tiếp tục triển khai theo yêu cầu người dùng khi browser host lỗi).

## Rủi ro / việc còn lại
- Browser host của CUA không khả dụng. Chưa trực tiếp chạy click path, kiểm focus/console/responsive 1440/1024/390 hoặc IndexedDB thực.
- Không coi test mock client hoặc render SSR là UAT UI. Các mục này giữ CHƯA XÁC MINH trong UAT-results.md.
