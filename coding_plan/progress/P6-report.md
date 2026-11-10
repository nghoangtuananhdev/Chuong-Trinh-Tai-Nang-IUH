# Báo cáo P6 – Đợt xét tuyển
- Ngày: 10/11/2026
- Trạng thái: MÃ ĐÃ TRIỂN KHAI; cổng logic/build ĐẠT; kiểm UI CHƯA XÁC MINH.

## Đã làm
- src/mock/services/rounds.js: nháp/phát hành/sửa/xóa/chuyển thủ công; validate ngày và một ĐXT/lớp/HK/năm học.
- src/features/rounds/RoundsPage.jsx: danh sách/lọc/form/chi tiết, timeline, snapshot, minh chứng đính kèm; PĐT có tra cứu lớp.
- src/features/public/PublicHome.jsx và route dot/:id: ĐXT seed v3, bộ lọc, CTA theo tài khoản/luồng, không còn trạng thái cũ.

## Gap đã xử lý ở mã
- G-05, G-06, G-25.

## Kết quả kiểm tra
- R7 phát hành hợp lệ; timeline sai trả VALIDATION có field; trùng đợt bị CONFLICT.
- GVPT sửa quota bị FORBIDDEN; published không sửa; draft→open bị chặn.
- Clock R6 mở/snapshot và audit hệ thống được kiểm.
- Lượt kiểm tích hợp cuối: 240 test pass, build 7 entry OK, render smoke 110 tổ hợp OK.

## Quyết định phát sinh
- Xem DECISIONS-ADDENDUM.md (đặc biệt A-10 về tiếp tục triển khai theo yêu cầu người dùng khi browser host lỗi).

## Rủi ro / việc còn lại
- Browser host của CUA không khả dụng. Chưa trực tiếp chạy click path, kiểm focus/console/responsive 1440/1024/390 hoặc IndexedDB thực.
- Không coi test mock client hoặc render SSR là UAT UI. Các mục này giữ CHƯA XÁC MINH trong UAT-results.md.
