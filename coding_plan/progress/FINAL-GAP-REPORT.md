# Truy vết G-01…G-25

Ngày 10/11/2026. Cột “Đã triển khai” nói về mã và kiểm tự động; nghiệm thu click path/responsive/IndexedDB thực vẫn CHƯA XÁC MINH do browser host không hoạt động.

| Gap | Đã triển khai | File chính |
| --- | --- | --- |
| G-01 | Đăng ký IUH+OTP, đăng nhập trước nộp, bỏ nộp ẩn danh | features/auth/AuthPages.jsx; mock/services/otp.js, account.js; app/AuthGate.jsx |
| G-02 | isKSTN=false khi đăng ký, chỉ kích hoạt theo kết quả publish | mock/services/account.js; domain/publish.js |
| G-03 | Phiên thực, username/email, khóa 5 lần/15 phút, chọn vai trò | mock/services/auth.js; mock/backend.jsx; layout/RoleSwitcher.jsx |
| G-04 | RBAC + SCHOOL/FACULTY/MAJOR/CLASS/SELF, không tên lớp viết cứng | domain/permissions.js, scope.js; mock/services/_kernel.js |
| G-05 | Đúng 6 trạng thái, release và scheduler, không radio sửa trạng thái | domain/round-machine.js, scheduler.js; mock/services/rounds.js |
| G-06 | ĐXT đầu/tiếp theo suy ra, cùng đợt nhận A/B/C, không kind | domain/selectors.js, flows.js; features/rounds/RoundsPage.jsx |
| G-07 | CriteriaSet/criterion/level, 3 kiểu, phiên bản, publish/archive | mock/schema.js; mock/services/criteria.js; features/criteria/CriteriaPage.jsx |
| G-08 | Chấm snapshot, BB/UT, self/official, mẫu 190 | domain/scoring.js và scoring.test.js |
| G-09 | Form động, minh chứng từng tiêu chí/thành tích, MIME/magic/giới hạn cấu hình | components/domain-ui/CriterionField.jsx, EvidenceUploader.jsx; mock/evidence-store.js |
| G-10 | Nháp Application, tự lưu, hủy/nhắc theo hạn | mock/services/applications.js; domain/scheduler.js; features/student-portal/StudentPortal.jsx |
| G-11 | Không MSSV hiện tại viết cứng; tổng quan/maintenance/hồ sơ/timeline | app/menus.js, WorkspaceLayout.jsx; domain/selectors.js; features/student-portal/StudentPortal.jsx |
| G-12 | Xác minh từng tiêu chí/entry, chỉnh giá trị có lý do, hạn bổ sung ≤ reviewEnd | mock/services/reviews.js; features/reviews/ReviewsPage.jsx |
| G-13 | Đồng hạng không chặn chốt; CNN chọn đúng số suất | domain/ranking.js; mock/services/lists.js; features/approvals/ApprovalsPage.jsx |
| G-14 | AdmissionList phiên bản, ApprovalStep, trả về chạy HEAD lại | mock/schema.js; mock/services/lists.js; features/approvals/ApprovalsPage.jsx |
| G-15 | Hai chế độ xếp hạng và quota hard limit | domain/ranking.js, publish.js |
| G-16 | Tự confirmed/isKSTN/membership khi PĐT công bố; bỏ SV xác nhận | domain/publish.js; mock/services/lists.js |
| G-17 | Membership từng năm, size/status suy ra, ACTIVE/DROPPED/WITHDRAWN/GRADUATED | domain/selectors.js; mock/services/catalog.js; features/catalog/ManagementPage.jsx |
| G-18 | Notification/outbox/audit/report/config | domain/events.js, scheduler.js; mock/services/operations.js; features/operations/OperationsPage.jsx |
| G-19 | Menu theo vai trò và dashboard số liệu thật | app/menus.js; features/dashboard/Dashboard.jsx; layout/WorkspaceHeader.jsx |
| G-20 | Role/scope/validFrom/validTo/revoke, BR-14 | domain/permissions.js; mock/services/roles.js; features/catalog/ManagementPage.jsx |
| G-21 | Không xóa GV; lock/unlock; reset SV theo lớp, MK tạm và mustChange | mock/services/users.js; features/catalog/ManagementPage.jsx |
| G-22 | Public results che MSSV/tên; lookup cá nhân OTP | mock/services/publicPortal.js; features/public/ResultPages.jsx |
| G-23 | Test node:test, 240 ca domain/service/client/UAT | domain/*.test.js; mock/*.test.js; mock/services/*.test.js |
| G-24 | flow/selfScore/officialScore/rank/eligible/previousApplicationId | mock/schema.js; mock/services/applications.js; domain/flows.js, publish.js |
| G-25 | Mốc ISO, quota/semester/academicYear/lecturer/criteria/rankingMode | mock/schema.js; mock/services/rounds.js; features/rounds/RoundsPage.jsx |

Đường dẫn trong bảng tính từ `src/`. Mã legacy đã được gỡ ở P11; không còn import store/fixtures/admissions cũ.

## Chưa ký Definition of Done tổng thể

- Đã đạt: test tự động, build 7 HTML, luật import, render route smoke, tài liệu demo, truy vết gap và dọn legacy.
- Chưa xác minh: UAT click path U1–U15; console/focus thực; 1440/1024/390; IndexedDB/upload-preview-download-reset thực; mở CSV bằng Excel và in/lưu PDF.
- Các giới hạn này được ghi trong UAT-results.md; không dùng kết quả SSR để thay thế.
