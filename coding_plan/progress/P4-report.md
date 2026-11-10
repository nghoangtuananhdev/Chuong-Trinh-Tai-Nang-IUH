# Báo cáo P4 – Danh mục, lớp, tài khoản và phân quyền
- Ngày: 10/11/2026
- Trạng thái: MÃ ĐÃ TRIỂN KHAI; cổng logic/build ĐẠT; kiểm UI CHƯA XÁC MINH.

## Đã làm
- src/mock/services/catalog.js: CRUD danh mục/chuyên ngành/lớp, phụ thuộc con–cha, sĩ số membership, tự rút và kết thúc lớp.
- src/mock/services/users.js, roles.js: khóa/mở GV/SV, MK tạm, cấp/thu hồi vai trò, kiểm BR-14.
- src/features/catalog/ManagementPage.jsx: bảng phân trang 10 dòng, form/Drawer/ConfirmDialog, thành viên theo năm, đặt lại MK lớp và phân quyền.

## Gap đã xử lý ở mã
- G-04, G-17, G-20, G-21.

## Kết quả kiểm tra
- C11 reset ngoài lớp bị FORBIDDEN; HEAD gán lớp ngoài ngành bị FORBIDDEN.
- Trùng chuyên ngành và xóa còn lớp bị CONFLICT; chặn di chuyển chuyên ngành sang khoa ngoài phạm vi.
- Rút membership năm lịch sử bị chặn; chỉ thao tác năm hiện tại.
- Lượt kiểm tích hợp cuối: 240 test pass, build 7 entry OK, render smoke 110 tổ hợp OK.

## Quyết định phát sinh
- Xem DECISIONS-ADDENDUM.md (đặc biệt A-10 về tiếp tục triển khai theo yêu cầu người dùng khi browser host lỗi).

## Rủi ro / việc còn lại
- Browser host của CUA không khả dụng. Chưa trực tiếp chạy click path, kiểm focus/console/responsive 1440/1024/390 hoặc IndexedDB thực.
- Không coi test mock client hoặc render SSR là UAT UI. Các mục này giữ CHƯA XÁC MINH trong UAT-results.md.
