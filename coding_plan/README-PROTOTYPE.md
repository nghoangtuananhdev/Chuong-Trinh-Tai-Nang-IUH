# Prototype CN/KSTN IUH

Ứng dụng React chạy hoàn toàn trên trình duyệt: localStorage v3 lưu dữ liệu/phiên, IndexedDB lưu minh chứng. Không có backend hoặc email thật. Mật khẩu seed là mock `plain:demo1234`, chỉ dùng trình diễn.

## Chạy và kiểm tra

```bash
node node_modules/vite/bin/vite.js --host 127.0.0.1
# Mở http://127.0.0.1:5173/

npm test
node coding_plan/verify-render.mjs
node coding_plan/verify-routes.mjs
node node_modules/vite/bin/vite.js build --outDir /tmp/kstn-prototype-build
```

Nếu không có node_modules, cài theo lockfile của dự án trước khi chạy. Không cần pnpm khi dependency đã được cài. `npm run verify` chạy test rồi build mặc định của Vite; lệnh build bên trên xuất artifact tạm để không thay dist/ có sẵn.

Mỗi lần trình diễn độc lập: Bảng điều khiển demo → Dữ liệu → Khôi phục dữ liệu mẫu. Đồng hồ ban đầu 09/11/2026 09:00 GMT+7. Đây là đồng hồ mô phỏng; +1 giờ/+1 ngày hoặc đặt thời điểm để chạy scheduler. Tua ngược không đảo các quyết định đã xảy ra; muốn quay về kịch bản gốc cần reset.

## Tài khoản demo

Mật khẩu tất cả tài khoản seed: **demo1234**. Có thể đăng nhập bằng username/mã GV/MSSV hoặc email; Bảng Demo cũng có Đăng nhập nhanh.

| Username | Người dùng | Vai trò/phạm vi |
| --- | --- | --- |
| quantri | Quản trị viên hệ thống | ADMIN toàn trường |
| GV900 | Nguyễn Minh Anh | PĐT toàn trường |
| GV004 | PGS.TS. Lê Hoàng | BLĐ khoa CNTT |
| GV010 | TS. Võ Thanh Hà | BLĐ khoa QTKD |
| GV005 | TS. Trần Ngọc Bình | CNN KTPM + GVPT KSTN-KTPM-K22 |
| GV001 | ThS. Phạm Thị Dung | GVPT KSTN-KTPM-K20 |
| GV003 | ThS. Lê Minh Tâm | GVPT KSTN-KTPM-K21 |
| GV002 | TS. Nguyễn Văn Hải | CNN HTTT |
| GV006 | ThS. Ngô Thu Trang | GVPT KSTN-HTTT-K21 |
| GV007 | TS. Hoàng Minh Châu | CNN Marketing |
| GV008 | ThS. Trần Mỹ Linh | GVPT CNTN-MKT-K20 |
| GV009 | ThS. Đặng Thu Hà | GVPT CNTN-MKT-K22; buộc đổi MK |
| 21094501 | Nguyễn Hoàng Nam | SV KSTN K20; mẫu R2 = 190 điểm |
| 21094518 | Trần Minh Khoa | SV KSTN K20; R2 pending |
| 21094602 | Võ Gia Bảo | SV KSTN K20; R2 needs_update |
| 21094777 | Lý Thanh Tú | SV KSTN K20; chưa nộp R2 |
| 22073210 | Phạm Gia Hân | Ứng viên B; từng không trúng R8 |
| 21094650 | Đặng Quốc Việt | Ứng viên B; từng DROPPED |
| 26010011 | Hồ Ngọc Mai | Ứng viên; nháp R1 |
| 26010022 | Trương Gia Huy | Ứng viên; email chứa fail để mô phỏng lỗi |

MSSV đăng ký mới: `26019999`, email `khang.26019999@student.iuh.edu.vn`; hoặc `26018888`, email `26018888@student.iuh.edu.vn`. Lấy OTP ở Bảng Demo → Hộp thư mô phỏng. Không dùng email ngoài danh bạ. Nam có alias được xác nhận `nam.21094501@student.iuh.edu.vn` để thử đổi email qua OTP.

Giữ đủ 7 entry HTML: index là ứng dụng chính; 6 trang vai trò là lối tắt demo và đưa về workspace qua hash. Các liên kết nội bộ dùng hash; có thể mở sâu `#/app/rounds/DXT-2026-02`, `#/app/approvals/DXT-2026-05`, `#/tra-cuu`.

## Kịch bản trình diễn 10 phút

1. **0–2 phút – đăng ký/nộp R1:** trang chủ → R1 → Nộp hồ sơ → Đăng ký MSSV 26019999/email Khang → lấy OTP ở Demo → tạo TK → nhập GPA/TOEIC, thêm giải nếu có, tải minh chứng, tích cam kết và nộp. Hộp thư có email chứa mã hồ sơ.
2. **2–4 phút – duyệt R2:** Demo đăng nhập GV001 → Duyệt hồ sơ → R2. Mở Khoa, xem minh chứng mẫu, xác minh từng tiêu chí và từng thành tích, rồi Đạt. Với yêu cầu bổ sung, thử hạn vượt 20/11 để thấy validation; hạn hợp lệ phải sau giờ mô phỏng.
3. **4–5 phút – hết hạn tự động:** đặt 12/11/2026 09:01, Bảo chuyển Không đạt và nhận thông báo/email. Có thể xử lý Hân rồi chốt R2; CNN nhận thông báo. Tú chưa nộp sẽ bị DROPPED khi R2 công bố.
4. **5–6 phút – đồng hạng:** đăng nhập GV005 (HEAD) → Xác nhận danh sách → R3. Chọn đúng một trong hai hồ sơ đồng hạng rồi xác nhận. Chuyển vai trò sang LECTURER để thấy menu/phạm vi khác.
5. **6–8 phút – công bố R5:** đăng nhập GV900 → Phê duyệt & Công bố → R5. Kiểm tra phiên bản/bước duyệt, bấm công bố, đọc số trúng tuyển/DROPPED/email trong hộp xác nhận rồi xác nhận. Thành viên và isKSTN cập nhật tự động.
6. **8–9 phút – kết quả:** về trang chủ → kết quả R5 che MSSV/tên. Tra cứu cá nhân qua MSSV và OTP để xem trạng thái/điểm đã công bố.
7. **9–10 phút – vận hành:** xem báo cáo, xuất CSV/in PDF, nhật ký before/after. Đăng nhập quantri xem email fail và gửi lại; đặt đồng hồ 15/11 00:00 để R6 tự mở và snapshot.

Các kịch bản có thể làm độc lập sau reset. Nếu muốn chạy R2 tới công bố, phải xử lý hết pending/needs_update, chốt rồi duyệt đủ HEAD → DEAN → TRAINING. Không có bước SV xác nhận nhập học.

## Kiến trúc và tình trạng nghiệm thu

- `src/domain`: scoring, ranking, máy trạng thái, scope/RBAC, scheduler, publish thuần.
- `src/mock/services`: kiểm quyền, validate, ghi audit và tác dụng phụ trên bản clone.
- `src/mock/client.js`: tuần tự hóa call và commit; `backend.jsx` nối React/persistence.
- `src/app`: router, guard, menu và workspace; `src/features`: giao diện gọi backend.
- `coding_plan/progress`: báo cáo từng giai đoạn, UAT và ma trận G-01…G-25.

240 test tự động và render smoke 110 tổ hợp route/vai trò đã đạt ở lần kiểm cuối được ghi trong báo cáo. Các kịch bản U1–U15 được kiểm tự động qua mock client. **Chưa xác minh thủ công bằng trình duyệt:** browser host của công cụ hiện không khả dụng; responsive 1440/1024/390, focus/console, tải-xem-xóa tệp IndexedDB thực và toàn bộ click path UAT cần kiểm lại khi có trình duyệt. Không coi render SSR là kiểm UI hoàn chỉnh.
