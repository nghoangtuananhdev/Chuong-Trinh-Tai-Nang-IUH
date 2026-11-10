# Báo cáo P3 – Router, xác thực và workspace
- Ngày: 10/11/2026
- Trạng thái: MÃ ĐÃ TRIỂN KHAI; cổng logic/build ĐẠT; kiểm UI CHƯA XÁC MINH.

## Đã làm
- src/app/router.js, routes.jsx, menus.js, AuthGate.jsx, WorkspaceLayout.jsx: hash route, guard, menu theo vai trò và phạm vi.
- src/features/auth/AuthPages.jsx: đăng nhập/đăng ký OTP/quên/đặt lại/đổi MK; mustChangePassword chặn workspace.
- src/components/layout/WorkspaceHeader.jsx, RoleSwitcher.jsx, NotificationBell.jsx: tái sử dụng menu tài khoản hỗ trợ bàn phím, đổi vai trò và chuông.
- src/features/profile/ProfilePage.jsx, notifications/NotificationsPage.jsx; services/me.js; lối tắt demo 6 HTML qua App/main.

## Gap đã xử lý ở mã
- G-01, G-03, G-11, G-19, G-22: phần khung/xác thực.

## Kết quả kiểm tra
- U1 đăng ký, U2 chống giả email, U3 đã có TK, U7 buộc đổi MK, U11 đa vai trò: test mock client đạt.
- router.test.js kiểm deep link/query/returnTo và percent malformed.
- Các route đăng nhập/workspace/profile render trong 110 tổ hợp.
- Lượt kiểm tích hợp cuối: 240 test pass, build 7 entry OK, render smoke 110 tổ hợp OK.

## Quyết định phát sinh
- Xem DECISIONS-ADDENDUM.md (đặc biệt A-10 về tiếp tục triển khai theo yêu cầu người dùng khi browser host lỗi).

## Rủi ro / việc còn lại
- Browser host của CUA không khả dụng. Chưa trực tiếp chạy click path, kiểm focus/console/responsive 1440/1024/390 hoặc IndexedDB thực.
- Không coi test mock client hoặc render SSR là UAT UI. Các mục này giữ CHƯA XÁC MINH trong UAT-results.md.
