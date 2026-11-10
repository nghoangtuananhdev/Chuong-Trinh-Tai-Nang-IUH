# Báo cáo P1 – Domain thuần và kiểm thử
- Ngày: 09/11/2026
- Trạng thái cổng: ĐẠT

## Đã làm
- Tạo toàn bộ 15 module domain được liệt kê ở P1: constants, errors, time, identity, scoring, ranking, round-machine, application-machine, flows, scope, permissions, scheduler, publish, selectors; thêm events.js dùng chung ghi sự kiện thuần.
- Logic nhận db, snapshot, ctx/now; không dùng trạng thái trình duyệt, React, mạng hoặc đồng hồ thực.
- Test cạnh module bằng node:test và node:assert/strict, fixture riêng chỉ dùng trong test.

## Gap đã xử lý
Đây là tầng nền tảng, chưa nối giao diện/service nên chưa đánh dấu các gap ứng dụng là hoàn tất.
- G-04/G-20: RBAC theo vai trò đang hoạt động + chuỗi phạm vi + kiểm BR-14.
- G-05: đúng 6 trạng thái, xét mọi cặp chuyển hợp lệ/cấm, kiểm cấp phê duyệt.
- G-06/G-11/G-24: selectors năm đào tạo, luồng A/B/C, kế thừa dữ liệu.
- G-08/G-13/G-15: chấm điểm snapshot, đồng hạng chờ CNN, hai chế độ xếp hạng.
- G-10/G-12: hủy nháp hết hạn, nhắc hạn, kiểm thời hạn bổ sung.
- G-16/G-17: domain công bố atomic, membership theo năm, ACTIVE/DROPPED, BR-08 lấp suất.
- G-22: tiện ích che MSSV/tên.
- G-23: 172 test nghiệp vụ tự động.

## Kết quả kiểm tra
- npm test: 172 pass, 0 fail, 0 skipped.
- Assessment Sample: 190 (110 BB + 80 UT), eligible=true; tích lũy 4 giải = 90.
- Mọi cặp 6×6 trạng thái ĐXT được kiểm; quyền owner/khoa/ngành/lớp, vai trò hết hạn/thu hồi và BR-14 đều có test.
- Hai chế độ xếp hạng: thiếu/đủ/vượt quota, xét hòa, đồng hạng tại/ngoài ranh giới.
- Scheduler: snapshot sâu, nhảy nhiều mốc, nhắc 48/24h, bổ sung quá hạn, nhắc cấp duyệt, retry email, idempotency.
- Publish: confirmed/not_admitted; DROP khi không nộp/không đạt/rút; nhường suất đúng nhóm; tieResolution; không vượt quota; lỗi giữa chừng không đổi input.
- Build 7 entry: OK; artifact ở /tmp/kstn-prototype-build.
- rg trình duyệt/React/đồng hồ thực trong src/domain: 0 kết quả.
- Không thay token, tài liệu nguồn hoặc file UI hiện hữu.

## Quyết định phát sinh
- A-01…A-05 trong coding_plan/DECISIONS-ADDENDUM.md.

## Rủi ro / việc còn lại
- P2 trở đi chưa nghiệm thu. Tầng domain chưa được nối vào UI cũ; hành vi ứng dụng hiện tại chưa đổi.
- Kiểm xác minh đủ từng tiêu chí (D-19), quyền trước mutation và transaction session thuộc các service P2/P8.
