# Quyết định bổ sung khi triển khai

## A-01 — Retry email và tính idempotent (P1)
§6.9 đồng thời yêu cầu tick idempotent tại cùng `now` và tự thử lại email FAILED. Lưu `email.lastAttemptAt`; mỗi email được thử tối đa một lần ở mỗi giá trị đồng hồ mô phỏng. Tick tại thời điểm tiếp theo mới thử lại, tổng tối đa `config.email.maxAttempts`. Không tự tăng thời gian thực.

## A-02 — ĐXT đầu tiên và dữ liệu lịch sử (P1)
D-04 được áp dụng theo thứ tự thời gian của các ĐXT cùng lớp: một ĐXT là đầu tiên khi không có ĐXT không-nháp nào đứng trước nó. Vì thế ĐXT lịch sử đầu tiên vẫn có nhãn đầu vào sau khi đã published, còn ĐXT năm sau là duy trì/bổ sung. So theo academicYear rồi intakeStart/createdAt; không phụ thuộc thứ tự mảng dữ liệu.

## A-03 — Giá trị tham chiếu không hợp lệ (P1)
Khi GV xác minh nguồn BB là INVALID, tiêu chí UT tham chiếu giá trị nguồn cũng không tính điểm. Tránh cùng một giá trị bị coi là sai ở BB nhưng được dùng tính điểm UT. Không ảnh hưởng ví dụ Assessment 190.

## A-04 — Membership lịch sử và isKSTN (P1)
Khi suy ra tư cách hiện tại, lấy bản ghi năm đào tạo lớn nhất của mỗi cặp lớp/sinh viên. Không dùng ACTIVE lịch sử để giữ isKSTN=true sau khi năm mới đã DROPPED/WITHDRAWN/GRADUATED. Kiểm tra xung đột BR-08 đối chiếu năm học bằng class.startYear + membership.studyYear - 1.

## A-05 — Bỏ nhắc nháp đã hết hạn (P1)
Khi tua đồng hồ qua cả intakeStart và intakeEnd, scheduler vẫn mở/snapshot rồi đóng/hủy nháp trong cùng transaction, nhưng không phát email nhắc nộp cho thời hạn đã qua. Các nhắc trước hạn vẫn giữ mốc 48h/24h như kế hoạch.

## A-06 — Vị trí artifact build (P0)
Dùng `node node_modules/vite/bin/vite.js build --outDir /tmp/kstn-prototype-build` để kiểm cả 7 entry nhưng không sửa dist/ có sẵn, tuân thủ §0.2. Không thay đổi cấu hình build/deploy.

## A-07 — Seed lịch sử QTKD và bộ tiêu chí lưu trữ (P2)
R5 là ĐXT duy trì năm 3, nhưng bảng §8.4 không có ĐXT lịch sử nào của lớp CNTN-MKT-K20. Bổ sung `DXT-2025-03` đã published, với Thư và Long là thành viên năm 2, để R5 không bị phân loại nhầm là ĐXT đầu tiên và có thể kiểm DROPPED cho SV không nộp. Không thay đổi R1–R10 đã mô tả.

CS-3 v1 bắt buộc ARCHIVED ở §8.3, đồng thời R10 phải giữ nó trong lịch sử ở §8.4. Vì vậy tiêu chí seed “mọi ĐXT không-nháp có criteriaSet PUBLISHED” được kiểm đối với đợt mới phát hành; đợt lịch sử đã công bố có thể trỏ tới bản hiện ARCHIVED, nhưng snapshot vẫn ghi PUBLISHED tại thời điểm mở. Cách này giữ đúng D-11 và không làm sai dữ liệu quá khứ.

## A-08 — Lưu các lần đăng nhập/OTP sai (P2)
Service đăng nhập/OTP trả `{ db, error: DomainError }` cho trường hợp thất bại cần lưu bộ đếm và audit. Mock client commit db rồi reject promise bằng chính DomainError. Các lỗi validation/phân quyền khác throw bình thường và không commit. Tránh việc throw làm mất failedLoginCount/attempts trên bản clone; chữ ký chuẩn `{db, result, effects}` được mở rộng riêng cho trường hợp này.

## A-09 — Các call bất đồng bộ dùng hàng đợi (P2)
`mock/client.js` tuần tự hóa call dựa trên db mới nhất, không lấy state bị đóng trong closure của React. Có test hai OTP gọi cùng lúc không mất dữ liệu và hàng đợi tiếp tục hoạt động sau một promise reject. Entropy do provider đưa vào từ crypto.randomUUID; domain/service không đọc đồng hồ thực hoặc API trình duyệt.

## A-10 — Tiếp tục triển khai khi browser host lỗi
Sau checkpoint P2, người dùng yêu cầu “hoàn thiện nốt toàn bộ bản kế hoạch”. Tiếp tục triển khai tuần tự P3–P11, kiểm tra service/test/build/render cho từng nhóm, đồng thời giữ các cổng thao tác trình duyệt ở trạng thái CHƯA XÁC MINH. Đây là cách xử lý theo yêu cầu tiếp tục của người dùng; không coi SSR hoặc test service là bằng chứng UAT giao diện. Definition of Done về responsive/focus/console/IndexedDB thực vẫn chờ kiểm bằng trình duyệt.

## A-11 — Phạm vi tài khoản GV mới
Form tạo GV chọn lớp phụ trách để suy ra khoa và cấp vai trò LECTURER ban đầu trong phạm vi người tạo. Sau đó có thể gán/thu hồi vai trò khác bằng trang Phân quyền. Tránh tài khoản mới không có vai trò hoặc thiếu thông tin ngành để CNN quản lý; không cho phép cấp quyền ngoài phạm vi. Mật khẩu tạm được sinh từ entropy của provider, gửi outbox và buộc đổi.

## A-12 — Email IUH đổi qua OTP
Bổ sung một alias đã được trường xác nhận trong danh bạ seed: `nam.21094501@student.iuh.edu.vn`. Nam có thể đổi từ email gốc sang alias này qua OTP CHANGE_EMAIL để trình diễn. Alias vẫn phải có trong danh bạ; không gửi OTP tới địa chỉ tự khai chưa được xác nhận. MSSV vẫn duy nhất ở studentProfiles/users.

## A-13 — Formatter phát triển
Dùng CLI Prettier 3.5.3 qua npm exec để định dạng các tệp mới/thay thế; không thêm dependency runtime, không thay package manifest hoặc lockfile vì formatter.

## A-14 — Khôi phục bộ đếm ID cũ
nextId kiểm tra ID đã tồn tại trước khi cấp mã mới, ngoài tăng db.counters. Tránh va chạm với ID seed hoặc db v3 đã lưu từ checkpoint trước khi counters được khởi tạo đầy đủ; có test regression.

## A-15 — Sửa lỗi sau nghiệm thu giao diện bằng trình duyệt (10/11/2026)
Chạy các luồng U1–U15 trên Chromium (Playwright, headless) vì browser host cũ không khả dụng. Các lỗi phát hiện và cách xử lý:
- Ô OTP: gõ đè đúng chữ số đang có không nhảy ô, xóa giữa chừng để lại dấu cách ⇒ xử lý phím số trực tiếp, không hiển thị dấu cách.
- Mã hồ sơ/mã ĐXT mới sinh từ bộ đếm riêng nên có thể trùng mã của dữ liệu mẫu (HS-2026-000003, DXT-2026-0001) ⇒ nối tiếp số lớn nhất hiện có.
- Màn duyệt hồ sơ giữ lại ý kiến, hạn bổ sung và giá trị điều chỉnh khi chuyển sang hồ sơ khác (có thể ghi nhầm lý do/điểm cho SV khác) ⇒ gắn key theo hồ sơ và xóa trường sau mỗi quyết định.
- Toast lỗi không tự tắt và che nút "Xác nhận" của hộp thoại ⇒ chuyển lên góc trên phải, lỗi tự ẩn sau 8 giây.
- GVPT bị "Không có quyền" khi mở danh sách phê duyệt sau khi chốt hoặc từ thông báo trả về ⇒ cho GVPT xem danh sách ở chế độ chỉ đọc.
- Form gán vai trò liệt kê cả vai trò/phạm vi không được phép ⇒ lọc theo `ASSIGNABLE_ROLES` và kiểu phạm vi của vai trò; ẩn dòng vai trò Sinh viên.
- Hiển thị mã nội bộ và chuỗi ISO (phạm vi `fac_cntt`, giờ khóa tài khoản, giờ trong email, vai trò trong lịch sử/nhật ký, nguồn hồ sơ của thành viên lớp) ⇒ đổi sang nhãn tiếng Việt và giờ GMT+7.
- Trang chi tiết ĐXT công khai không có lối quay lại/nộp hồ sơ ⇒ thêm "Về trang chủ", "Nộp hồ sơ", "Xem kết quả".
- Bổ sung: hiển thị các mức điểm trong form hồ sơ, lớp và năm đào tạo ở tổng quan SV, ẩn bản nháp khỏi danh sách duyệt, tiêu đề trang cho các route chi tiết.
Có test hồi quy ở `src/mock/services/regression.test.js`.
