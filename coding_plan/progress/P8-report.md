# Báo cáo P8 – Xét duyệt và chốt danh sách
- Ngày: 10/11/2026
- Trạng thái: MÃ ĐÃ TRIỂN KHAI; cổng logic/build ĐẠT; kiểm UI CHƯA XÁC MINH.

## Đã làm
- src/features/reviews/ReviewsPage.jsx: chọn ĐXT, lọc/sắp xếp, workspace hai cột, xác minh tiêu chí và từng thành tích, chỉnh số có lý do, 3 quyết định và mở lại.
- reviews.js: service quyền/giai đoạn/D-19/hạn bổ sung; lists.closeReview tạo danh sách phiên bản.
- AdmissionListTable xem trước xếp hạng/đồng hạng trước chốt; workspace chỉ đọc qua records/application/:id.

## Gap đã xử lý ở mã
- G-08, G-12, G-13, G-14.

## Kết quả kiểm tra
- Chưa xác minh đủ không chọn Đạt; sửa số thiếu lý do và hạn vượt reviewEnd bị chặn.
- U10 ngoài ngành FORBIDDEN; chốt sau xử lý hết hồ sơ tạo waiting_head.
- Domain xếp hạng đủ/thiếu/vượt quota và hai chế độ có test.
- Lượt kiểm tích hợp cuối: 240 test pass, build 7 entry OK, render smoke 110 tổ hợp OK.

## Quyết định phát sinh
- Xem DECISIONS-ADDENDUM.md (đặc biệt A-10 về tiếp tục triển khai theo yêu cầu người dùng khi browser host lỗi).

## Rủi ro / việc còn lại
- Browser host của CUA không khả dụng. Chưa trực tiếp chạy click path, kiểm focus/console/responsive 1440/1024/390 hoặc IndexedDB thực.
- Không coi test mock client hoặc render SSR là UAT UI. Các mục này giữ CHƯA XÁC MINH trong UAT-results.md.
