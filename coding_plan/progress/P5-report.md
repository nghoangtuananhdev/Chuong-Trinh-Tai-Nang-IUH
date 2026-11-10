# Báo cáo P5 – Bộ tiêu chí và phiên bản
- Ngày: 10/11/2026
- Trạng thái: MÃ ĐÃ TRIỂN KHAI; cổng logic/build ĐẠT; kiểm UI CHƯA XÁC MINH.

## Đã làm
- src/mock/services/criteria.js: create/update/delete/publish/archive/newVersion/previewScore; validate các mức, tham chiếu và thứ tự xét hòa.
- src/features/criteria/CriteriaPage.jsx: editor các tiêu chí/mức, đổi thứ tự, BB/UT, minh chứng, tham chiếu, điểm trần COUNT và xem trước động ba kiểu.
- Snapshot không đổi khi tạo phiên bản mới; sampleValue nằm trong seed để nút Assessment điền đúng dữ liệu.

## Gap đã xử lý ở mã
- G-07, G-08, G-09 (cấu hình tiêu chí).

## Kết quả kiểm tra
- CS2 Assessment 190 được kiểm domain/service.
- GV001 sửa CS4 nhưng không sửa CS2; HEAD sửa CS4; tạo v2 DRAFT không đổi snapshot R2.
- Chặn ban hành thiếu mức, ref vòng/chuỗi hoặc thứ tự hòa trùng.
- Lượt kiểm tích hợp cuối: 240 test pass, build 7 entry OK, render smoke 110 tổ hợp OK.

## Quyết định phát sinh
- Xem DECISIONS-ADDENDUM.md (đặc biệt A-10 về tiếp tục triển khai theo yêu cầu người dùng khi browser host lỗi).

## Rủi ro / việc còn lại
- Browser host của CUA không khả dụng. Chưa trực tiếp chạy click path, kiểm focus/console/responsive 1440/1024/390 hoặc IndexedDB thực.
- Không coi test mock client hoặc render SSR là UAT UI. Các mục này giữ CHƯA XÁC MINH trong UAT-results.md.
