# Báo cáo P2 – Mock backend, seed, persistence và Demo panel
- Ngày: 10/11/2026
- Trạng thái cổng: CHƯA ĐẠT (chưa kiểm thao tác trực tiếp trên trình duyệt)

## Đã làm
- `src/mock/schema.js`, `seed/*`: schema v3, danh mục kế thừa, tài khoản và vai trò, dữ liệu tiêu chí/ĐXT/hồ sơ/membership, danh sách phiên bản và bước phê duyệt. R1–R10 theo kế hoạch; thêm ĐXT lịch sử QTKD để R5 tự nhất quán.
- `src/mock/services/_kernel.js`: clone, permission guard, audit, notify, outbox, context theo phiên đang hoạt động.
- Services auth, OTP, đăng ký, reviews, lists, publicPortal, system: triển khai nghiệp vụ nền tảng; UI của các bước sau chưa triển khai.
- `src/mock/client.js`, `backend.jsx`: tuần tự hóa call, persist và đồng bộ storage, tick, DomainError, entropy từ provider.
- `persistence.js`: key v3 riêng, không đụng key v2, fallback khi dữ liệu hỏng, báo lỗi khi không lưu được.
- `evidence-store.js`: IndexedDB riêng v3; PDF/JPG/PNG ≤ giới hạn cấu hình; kiểm magic bytes; xóa file/reset.
- `ToastProvider.jsx`: toast độc lập store cũ.
- `features/demo/DemoPanel.jsx`: 4 tab đồng hồ/hộp thư/đăng nhập nhanh/dữ liệu, xác nhận reset, xuất JSON; sử dụng Drawer/ConfirmDialog có focus management sẵn.
- `features/public/PublicHome.jsx`: hiển thị seed v3, bộ lọc và phân trang, ẩn ĐXT nháp, thông tin và tiêu chí snapshot trong modal. Không còn nộp hồ sơ ẩn danh ở entry ứng dụng mới.
- `App.jsx`: mount provider mới + trang công khai + Demo. Khung workspace/router/xác thực đầy đủ thuộc P3; các trang workspace cũ chưa được nối lại.
- `StatusBadge.jsx`: dùng hằng số domain; bổ sung domain membership/criteriaSet/email/account/roleAssignment.
- Áp dụng skill ui-ux-pro-max cho interaction/focus/responsive; giữ token thiết kế hiện có, không áp bảng màu đề xuất mới.

## Gap đã xử lý
- G-01: entry mới không còn form nộp hồ sơ ẩn danh; đăng ký/nộp qua UI còn chờ P3/P7.
- G-02/G-03/G-04/G-20/G-21: schema, context, auth và service guard đã có; giao diện quản trị còn chờ P3/P4.
- G-07/G-14/G-17/G-24/G-25: seed/schema đã chuẩn hóa; giao diện chi tiết theo từng giai đoạn chưa hoàn tất.
- G-16: service công bố tự confirmed và cập nhật ACTIVE/DROPPED; chưa có màn hình P9.
- G-18: audit/notification/outbox/scheduler có ở mock; trang vận hành thuộc P10.
- G-22: public service che MSSV/tên và tra cứu OTP có; trang kết quả/tra cứu thuộc P9.
- G-23: tăng tổng lên 210 test.

## Kết quả kiểm tra
- `node --test --test-reporter=dot 'src/**/*.test.js'`: 210 pass, 0 fail.
- Test seed: FK, ID, trạng thái, mẫu Nam=190, isKSTN/membership, hồ sơ hiệu lực không trùng, snapshot, các phiên bản/bước duyệt, R3 có 2 hồ sơ tranh 1 suất.
- Service: OTP generic/rate limit/attempts, đăng ký/CONFLICT sau OTP, khóa đăng nhập 5 lần/15 phút, buộc đổi MK, switch role, FORBIDDEN ngoài ngành, xác minh đủ trước Đạt, trả về rồi chốt v3, tieResolution, công bố R5 atomic.
- Mock client: request đồng thời không lost update; lỗi có đếm sai vẫn persist; lỗi quyền không commit; lỗi persistence không đổi state memory; reset/session/file effects; public read không ghi storage.
- File validator: magic bytes 3 định dạng; chặn docx/giả MIME/rỗng/quá dung lượng; cấu hình 2 MB chặn 3 MB.
- Persistence: roundtrip JSON, dữ liệu hỏng/sai schema, storage không khả dụng, key v2 giữ nguyên, reset xóa phiên.
- Luật import/domain thuần, không API trình duyệt hoặc Date.now/new Date không tham số trong production domain/services: Đạt (architecture.test.js).
- Build 7 entry HTML: OK, artifact tại /tmp/kstn-prototype-build.
- Render React qua Vite SSR: trang chủ render thành công; có R6 và nút Demo; không có R7 nháp hoặc trạng thái closed trong HTML.

## Cổng nghiệm thu
| Mục | Kết quả |
| --- | --- |
| Service OTP/register/publish/403 | ĐẠT bằng test |
| Đổi clock tới 15/11 mở R6 + snapshot | ĐẠT ở mock client/service; thao tác UI chưa kiểm |
| Đổi clock tới 12/11 09:01 làm Bảo rejected | ĐẠT ở service; thao tác UI chưa kiểm |
| Reset dữ liệu/phiên/effect xóa tệp | ĐẠT ở client/service; IndexedDB thực và confirm UI chưa kiểm |
| Luật import §4.1 | ĐẠT (production; test được phép dùng node:test và fixture) |
| Mở bảng Demo và thao tác trên trình duyệt | CHƯA XÁC MINH |

## Quyết định phát sinh
- A-07…A-09 trong coding_plan/DECISIONS-ADDENDUM.md.

## Rủi ro / việc còn lại
- Công cụ CUA trả `The browser access host is unavailable` khi lấy inventory và khi thử mở http://127.0.0.1:5173/. Chưa thể quan sát giao diện hoặc thao tác trực tiếp.
- Không ghi các thao tác chưa chạy là Đạt. Theo §11, chưa bắt đầu P3 khi cổng P2 chưa hoàn tất.
- Chưa kiểm responsive 390/1024/1440, console, focus của UI mới hoặc IndexedDB thực.
- App hiện là checkpoint P2: các nút Đăng nhập/Nộp hồ sơ/Tra cứu đang dẫn tới Demo; chưa có route workspace, form đăng ký hay form nộp thực. Không coi đây là bản bàn giao hoàn chỉnh.
- Các file feature/store cũ còn trong repo, chưa sử dụng từ App mới; chỉ dọn ở P11 như kế hoạch.

## Cập nhật sau checkpoint
Theo yêu cầu tiếp tục hoàn thiện của người dùng, P3–P11 đã được triển khai và các mục “chưa nối” ở checkpoint trên đã có mã thay thế. Xem README.md trong thư mục progress để biết trạng thái hiện tại. Kiểm UI trực tiếp vẫn chưa xác minh vì browser host không khả dụng.
