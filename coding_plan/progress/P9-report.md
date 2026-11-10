# Báo cáo P9 – Phê duyệt, công bố và kết quả
- Ngày: 10/11/2026
- Trạng thái: MÃ ĐÃ TRIỂN KHAI; cổng logic/build ĐẠT; kiểm UI CHƯA XÁC MINH.

## Đã làm
- src/features/approvals/ApprovalsPage.jsx: phiên bản, ba cấp, đồng hạng, trả về, ý kiến/đính kèm và preview hậu quả trước công bố.
- src/mock/services/lists.js: approve/return/publish/previewPublish; đúng phiên bản; transaction publish.
- src/features/public/ResultPages.jsx: kết quả che MSSV/tên, tra cứu OTP; outbox lỗi cho PĐT gửi lại.

## Gap đã xử lý ở mã
- G-13, G-14, G-15, G-16, G-17, G-22.

## Kết quả kiểm tra
- U5 trả về R4 → chốt v3 → HEAD lại từ đầu.
- U6 R5 tự confirmed/membership/isKSTN/email; U9 Tú không nộp bị DROPPED; U14 chọn đúng đồng hạng.
- U13 nhường suất BR-08, quota không vượt; lỗi publish giữa chừng không đổi db.
- Lượt kiểm tích hợp cuối: 240 test pass, build 7 entry OK, render smoke 110 tổ hợp OK.

## Quyết định phát sinh
- Xem DECISIONS-ADDENDUM.md (đặc biệt A-10 về tiếp tục triển khai theo yêu cầu người dùng khi browser host lỗi).

## Rủi ro / việc còn lại
- Browser host của CUA không khả dụng. Chưa trực tiếp chạy click path, kiểm focus/console/responsive 1440/1024/390 hoặc IndexedDB thực.
- Không coi test mock client hoặc render SSR là UAT UI. Các mục này giữ CHƯA XÁC MINH trong UAT-results.md.
