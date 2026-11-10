# Báo cáo P7 – Cổng sinh viên và nộp hồ sơ
- Ngày: 10/11/2026
- Trạng thái: MÃ ĐÃ TRIỂN KHAI; cổng logic/build ĐẠT; kiểm UI CHƯA XÁC MINH.

## Đã làm
- src/mock/services/applications.js: create/save/submit/update/withdraw/deleteDraft/resubmit; chính chủ, duy nhất hồ sơ hiệu lực, cam kết và minh chứng.
- src/features/student-portal/StudentPortal.jsx: tổng quan, open-rounds/maintenance, wizard, tự lưu 1.5s, chỉnh sửa/rút/bổ sung, hồ sơ và lịch sử.
- CriterionField/EvidenceUploader/EvidenceViewer/ScoreSummary/Countdown/ProgramTimeline; PDF/JPG/PNG theo cấu hình.

## Gap đã xử lý ở mã
- G-01, G-09, G-10, G-11, G-24.

## Kết quả kiểm tra
- U1 từ OTP đến email mã hồ sơ đạt qua mock client.
- U4a bổ sung trước hạn pending/reset xác minh; U4b quá hạn rejected; hồ sơ người khác FORBIDDEN.
- Thiếu minh chứng không commit; file validator chặn MIME giả/docx/quá dung lượng.
- Lượt kiểm tích hợp cuối: 240 test pass, build 7 entry OK, render smoke 110 tổ hợp OK.

## Quyết định phát sinh
- Xem DECISIONS-ADDENDUM.md (đặc biệt A-10 về tiếp tục triển khai theo yêu cầu người dùng khi browser host lỗi).

## Rủi ro / việc còn lại
- Browser host của CUA không khả dụng. Chưa trực tiếp chạy click path, kiểm focus/console/responsive 1440/1024/390 hoặc IndexedDB thực.
- Không coi test mock client hoặc render SSR là UAT UI. Các mục này giữ CHƯA XÁC MINH trong UAT-results.md.
