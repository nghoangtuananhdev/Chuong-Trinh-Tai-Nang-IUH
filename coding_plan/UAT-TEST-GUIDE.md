# HƯỚNG DẪN TEST TOÀN BỘ LUỒNG NGHIỆP VỤ TRÊN GIAO DIỆN — WEB KSTN/CNTN IUH

> **Mục đích:** hướng dẫn từng bước để một người tự tay kiểm tra mọi luồng nghiệp vụ của prototype trên trình duyệt, đối chiếu với `KSTN-PROTOTYPE-IMPLEMENTATION-PLAN.md` (kịch bản U1–U15 ở §12.3 và các cổng nghiệm thu P3–P10 ở §11) cùng các kịch bản nghiệp vụ mở rộng (nhóm L–P).
> **Ngày lập:** 10/11/2026 (cập nhật bổ sung toàn diện luồng nghiệp vụ) · **Thời lượng:** khoảng 3–3,5 giờ nếu làm hết; nhóm A–E và L (khoảng 90 phút) là phần cốt lõi.
> **Trạng thái trước khi bạn test:** mọi bước dưới đây đã được chạy thử bằng trình duyệt tự động (Chromium) và đạt. Những mục chưa ai kiểm bằng mắt được đánh dấu **(chưa kiểm bằng mắt)** — hãy ưu tiên nhìn kỹ các mục đó.

---

## 0. Chuẩn bị

### 0.1 Khởi động

```bash
cd web-kstn-iuh
bash run.sh                 # mở http://127.0.0.1:5173/
# Nếu cổng bận: KSTN_PORT=5174 bash run.sh
# Kiểm tra tự động (tùy chọn, ~10 giây): bash TEST.sh  → phải thấy "TẤT CẢ KIỂM TRA ĐÃ ĐẠT"
```

Trên Windows dùng `RUN.bat`. Nên test bằng Chrome/Edge/Brave ở cửa sổ rộng ≥ 1280px, mở sẵn DevTools → Console để theo dõi lỗi.

### 0.2 Bảng điều khiển demo (dùng suốt buổi test)

Nút **“Bảng điều khiển demo”** nằm ở góc trái dưới mọi trang. Bốn tab:

| Tab | Dùng để |
|---|---|
| **Đồng hồ** | Xem/đặt giờ mô phỏng. Nhập ngày giờ vào “Đặt ngày giờ mô phỏng” rồi bấm **Đặt giờ**; hoặc **+1 giờ**, **+1 ngày**, **Đến mốc kế tiếp của ĐXT**. Mỗi lần đổi giờ hệ thống chạy tác vụ định kỳ (mở/đóng đợt, quá hạn bổ sung, gửi email). |
| **Hộp thư mô phỏng** | Xem mọi email hệ thống “gửi” đi. Gõ MSSV hoặc email vào ô lọc, bấm vào email để đọc. **Mã OTP, mật khẩu tạm và link đặt lại mật khẩu lấy ở đây.** |
| **Đăng nhập nhanh** | Gõ username vào “Tìm tài khoản demo” → **Đăng nhập** (không cần mật khẩu). |
| **Dữ liệu** | **Khôi phục dữ liệu mẫu** = đưa mọi thứ về trạng thái ban đầu (xóa cả tệp đã tải, đăng xuất). |

### 0.3 Quy ước trong tài liệu

- **[RESET]** = trước khi làm kịch bản này hãy vào Demo → Dữ liệu → **Khôi phục dữ liệu mẫu**. Kịch bản không ghi [RESET] thì làm tiếp trên dữ liệu của kịch bản ngay trước.
- **Đăng nhập nhanh `X`** = Demo → Đăng nhập nhanh → tìm `X` → Đăng nhập.
- Đồng hồ sau khi reset: **09:00 ngày 09/11/2026**. Tua ngược đồng hồ không hoàn tác việc đã xảy ra — muốn quay lại phải reset.
- Mật khẩu mọi tài khoản mẫu: `demo1234`.
- Ô ☐ để bạn đánh dấu Đạt/Không đạt. Ghi kết quả vào `coding_plan/progress/UAT-results.md` (cột “Kiểm UI thủ công”).
- Chuẩn bị sẵn: 1 tệp PDF nhỏ, 1 ảnh PNG/JPG, 1 tệp `.docx`, 1 tệp PDF > 10 MB, 1 tệp PDF khoảng 3 MB.

### 0.4 Tài khoản và dữ liệu mẫu cần nhớ

| Username | Người dùng | Vai trò – phạm vi | Dùng trong |
|---|---|---|---|
| `quantri` | Quản trị viên hệ thống | Quản trị viên – toàn trường | H, I, O, P |
| `GV900` | Nguyễn Minh Anh | Phòng Đào tạo – toàn trường | D, E, I, L, N |
| `GV004` | PGS.TS. Lê Hoàng | BLĐ khoa CNTT | D, F, L, M, N, O |
| `GV010` | TS. Võ Thanh Hà | BLĐ khoa QTKD | — |
| `GV005` | TS. Trần Ngọc Bình | CNN ngành KTPM **và** GVPT lớp KSTN-KTPM-K22 | D, G, H, L, M, N |
| `GV001` | ThS. Phạm Thị Dung | GVPT lớp KSTN-KTPM-K20 | C, G, H, L, O |
| `GV002` | TS. Nguyễn Văn Hải | CNN ngành HTTT | D, M |
| `GV006` | ThS. Ngô Thu Trang | GVPT lớp KSTN-HTTT-K21 | D |
| `GV009` | ThS. Đặng Thu Hà | GVPT CNTN-MKT-K22, **buộc đổi mật khẩu** | A |
| `GV003` | ThS. Lê Minh Tâm | GVPT lớp KSTN-KTPM-K21 | A (khóa tài khoản) |
| `21094501` | Nguyễn Hoàng Nam | SV KSTN lớp K20, hồ sơ R2 đạt 190 điểm | B, C, L, M |
| `21094518` | Trần Minh Khoa | SV KSTN K20, hồ sơ R2 chờ duyệt | C, M, O |
| `21094602` | Võ Gia Bảo | SV KSTN K20, hồ sơ R2 cần bổ sung (hạn 09:00 12/11) | C, M |
| `21094777` | Lý Thanh Tú | SV KSTN K20, **chưa nộp** hồ sơ R2 | C, M |
| `22073210` | Phạm Gia Hân | Ứng viên luồng B (từng không trúng tuyển) | C, D |
| `26010011` | Hồ Ngọc Mai | Ứng viên, có bản nháp ở R1 | B, E, N, O, P |
| `26010022` | Trương Gia Huy | Ứng viên, email chứa `fail` (mô phỏng gửi lỗi) | D, I, P |

MSSV **chưa có tài khoản** để thử đăng ký: `26019999` / `khang.26019999@student.iuh.edu.vn` và `26018888` / `26018888@student.iuh.edu.vn`.

| Mã đợt | Lớp | Trạng thái lúc reset | Dùng để test |
|---|---|---|---|
| R1 `DXT-2026-01` | KSTN-KTPM-K22 | Đang tiếp nhận hồ sơ (01/11–30/11) | nộp hồ sơ |
| R2 `DXT-2026-02` | KSTN-KTPM-K20 (năm 3) | Đang xét duyệt (đến 20/11) | duyệt hồ sơ, chốt, công bố trọn chuỗi |
| R3 `DXT-2026-03` | KSTN-KTPM-K21 | Chờ phê duyệt – chờ CNN | đồng hạng |
| R4 `DXT-2026-04` | KSTN-HTTT-K21 | Chờ phê duyệt – chờ BLĐ khoa | trả về |
| R5 `DXT-2026-05` | CNTN-MKT-K20 | Chờ phê duyệt – chờ PĐT | công bố |
| R6 `DXT-2026-06` | CNTN-MKT-K22 | Chưa mở (mở 00:00 15/11) | tự mở theo đồng hồ |
| R7 `DXT-2026-07` | KSTN-KHDL-K22 | Nháp | phát hành |
| `DXT-2025-01`, `DXT-2024-01`, `DXT-2025-02`, `DXT-2025-03` | — | Đã công bố | kết quả công khai, lịch sử |

---

## A. Xác thực và tài khoản

### A1. Đăng ký tài khoản sinh viên bằng email IUH + OTP (U1 – phần đăng ký) **[RESET]**

1. Ở trang chủ, tại thẻ `DXT-2026-01` bấm **Nộp hồ sơ** → chuyển tới trang Đăng nhập (URL có `returnTo`).
2. Bấm **Đăng ký bằng email IUH**.
3. Thử nhập sai để xem kiểm tra tại chỗ:
   - MSSV `26019999`, email `khang@gmail.com` → **Gửi mã OTP**.
   - Đổi email thành `khang@student.iuh.edu.vn` (không chứa MSSV) → **Gửi mã OTP**.
4. Nhập đúng: MSSV `26019999`, email `khang.26019999@student.iuh.edu.vn` → **Gửi mã OTP**.
5. Mở Demo → Hộp thư mô phỏng → lọc `khang` → mở email “Mã xác thực đăng ký tài khoản”, ghi lại 6 số. Đóng bảng Demo (Esc).
6. Nhập **sai** mã (ví dụ `000000`) → **Xác nhận OTP**. Sau đó gõ **đè** mã đúng vào 6 ô (không cần xóa trước) → **Xác nhận OTP**.
7. Bước 3: nhập SĐT, mật khẩu `abc` ở cả hai ô → **Tạo tài khoản**; rồi đổi thành `khang1234` → **Tạo tài khoản**.

Kết quả mong đợi:
- ☐ Bước 3: báo “Chỉ chấp nhận email sinh viên @student.iuh.edu.vn chứa đúng MSSV của bạn.”, không sang bước OTP.
- ☐ Bước 4: thông điệp chung “Nếu thông tin hợp lệ, mã OTP đã được gửi…”, có đếm ngược “Còn 0 giờ 10 phút”.
- ☐ Bước 6: mã sai báo “Mã OTP không đúng (còn 4 lần)”; gõ đè mã đúng thì mỗi phím nhảy sang ô kế tiếp và xác nhận thành công (kể cả khi mã có chữ số trùng với số đang nằm trong ô).
- ☐ Bước 7: hiện họ tên **Phan Minh Khang**, ngày sinh, lớp sinh hoạt lấy từ danh bạ; mật khẩu yếu bị từ chối với lý do cụ thể; mật khẩu hợp lệ → tự đăng nhập và vào thẳng form nộp hồ sơ R1 (`#/app/apply/DXT-2026-01`), nhãn “Luồng A – Đăng ký mới”.

> Làm tiếp ngay **B1** để hoàn tất U1.

### A2. Mạo danh MSSV (U2) **[RESET]**

1. Trang chủ → **Đăng nhập** → **Đăng ký bằng email IUH**. MSSV `21094501`, email `hacker.21094501@student.iuh.edu.vn` → **Gửi mã OTP**.
2. Demo → Hộp thư mô phỏng → lọc `hacker`.

- ☐ Giao diện vẫn hiện thông điệp chung và sang bước nhập OTP như bình thường (không lộ việc MSSV đã có tài khoản hay email sai).
- ☐ Hộp thư **không có** email nào gửi tới địa chỉ `hacker…`.

### A3. MSSV đã có tài khoản (U3)

1. Vẫn ở trang Đăng ký (bấm bước 1 “Xác thực email IUH” để quay lại): MSSV `21094501`, email `21094501@student.iuh.edu.vn` → **Gửi mã OTP** → lấy OTP trong Hộp thư (lọc `21094501@`) → **Xác nhận OTP**.
2. Bấm **Đăng nhập**, đăng nhập `21094501` / `demo1234`.

- ☐ Sau OTP hiện “MSSV này đã có tài khoản…”, nút **Tạo tài khoản** bị khóa.
- ☐ Đăng nhập xong vào Tổng quan sinh viên, dòng “Sinh viên CN/KSTN – Lớp KSTN-KTPM-K20 (năm 2)”.

### A4. Giới hạn số lần xin OTP

1. Đăng xuất (menu tài khoản góc phải → **Đăng xuất**). Vào Đăng ký, MSSV `26018888`, email `26018888@student.iuh.edu.vn`.
2. Bấm **Gửi mã OTP**, rồi **Yêu cầu mã mới** → **Gửi mã OTP**, lặp lại cho đủ 4 lần gửi.

- ☐ Lần thứ 4 báo “Bạn đã yêu cầu quá số mã cho phép. Vui lòng thử lại sau 15 phút.”

### A5. Đăng nhập bằng MSSV / mã GV / email và đăng xuất **[RESET]**

1. Trang chủ → **Đăng nhập**: `21094501` / `demo1234`. Đăng xuất.
2. Đăng nhập `ptdung@iuh.edu.vn` / `demo1234`. Đăng xuất.
3. Đăng nhập `GV900` / `demo1234`.

- ☐ Cả ba cách đều vào `#/app/dashboard` đúng người, đúng vai trò (xem tên ở góc phải trên).
- ☐ Menu tài khoản có: Thông tin cá nhân · Đổi mật khẩu · Đăng xuất (Về trang chủ). Đăng xuất về trang chủ.

### A6. Khóa tạm sau 5 lần sai **[RESET]**

1. Đăng nhập `GV003` với mật khẩu sai 5 lần liên tiếp.
2. Thử lần 6 với mật khẩu đúng `demo1234`.
3. Demo → Đồng hồ → đặt `09/11/2026 09:16` → **Đặt giờ**. Đăng nhập lại `GV003` / `demo1234`.

- ☐ Lần sai 1–4: “Tên đăng nhập hoặc mật khẩu chưa đúng. Còn N lần thử…” (N giảm dần 4→1).
- ☐ Lần 5 và lần 6: “Tài khoản tạm khóa đến 09:15 9/11/26.” (giờ dễ đọc, không phải chuỗi ISO).
- ☐ Sau 09:15 theo đồng hồ mô phỏng đăng nhập được bình thường.

### A7. Quên mật khẩu → đặt lại bằng liên kết

1. Đăng xuất. Trang Đăng nhập → **Quên mật khẩu?** → nhập `GV003` → **Xác nhận**.
2. Demo → Hộp thư → lọc `gv003` → mở email “Đặt lại mật khẩu” → bấm **Mở liên kết đặt lại mật khẩu**.
3. Nhập mật khẩu mới `moi12345` hai lần → **Xác nhận**. Đăng nhập `GV003` / `moi12345`.

- ☐ Thông điệp chung “Nếu thông tin hợp lệ, hướng dẫn đặt lại mật khẩu đã được gửi…”.
- ☐ Liên kết mở đúng trang Đặt lại mật khẩu; đặt xong về trang Đăng nhập; mật khẩu mới dùng được, mật khẩu cũ không.

### A8. Buộc đổi mật khẩu lần đầu (U7) **[RESET]**

1. Đăng nhập `GV009` / `demo1234`.
2. Thử sửa URL thành `#/app/reviews`.
3. Nhập mật khẩu hiện tại `demo1234`, mật khẩu mới `moi12345` (hai lần) → **Xác nhận**.

- ☐ Ngay sau đăng nhập chỉ thấy màn “Đổi mật khẩu để tiếp tục”; đổi URL vẫn bị giữ ở màn này.
- ☐ Đổi xong vào được “Tổng quan lớp” với đủ menu.

### A9. Đa vai trò trên một tài khoản (U11)

1. Đăng nhập nhanh `GV005`. Xem menu bên trái và dòng “Phạm vi”.
2. Ở đầu trang, ô **Vai trò đang làm việc** → chọn “Giảng viên phụ trách · KSTN-KTPM-K22”.
3. Vào **ĐXT của lớp**.

- ☐ Vai trò CNN: menu có “Duyệt hồ sơ ngành”, “Xác nhận danh sách”, “TK & phân quyền GV ngành”, “Hồ sơ SV”; phạm vi “Kỹ thuật phần mềm”.
- ☐ Vai trò GVPT: menu đổi thành “Lớp của tôi”, “ĐXT của lớp”, “Duyệt hồ sơ”, “Đặt lại MK SV”, “Báo cáo lớp”; có toast “Đã chuyển vai trò làm việc”; danh sách ĐXT chỉ còn `DXT-2026-01` (lớp K22).

### A10. Thông tin cá nhân và đổi email qua OTP

1. Đăng nhập nhanh `21094501` → **Thông tin cá nhân**. Đổi số điện thoại → **Lưu thông tin**.
2. Đổi “Email IUH” thành `nam.21094501@student.iuh.edu.vn` → **Gửi OTP email mới** → lấy mã ở Hộp thư (lọc `nam.21094501`) → nhập “Mã OTP” → **Lưu thông tin**.
3. Thử đổi email thành `abc@gmail.com` → **Gửi OTP email mới**.

- ☐ Lưu SĐT thành công (“Đã cập nhật thông tin cá nhân”).
- ☐ Email đổi được sau khi nhập OTP; email ngoài miền IUH/không chứa MSSV bị từ chối.

### A11. Lối tắt theo vai trò và đường dẫn không hợp lệ

1. Mở lần lượt `http://127.0.0.1:5173/giang-vien-phu-trach.html`, `/sinh-vien.html`, `/quan-tri-vien.html`, `/chu-nhiem-nganh.html`, `/ban-lanh-dao-khoa.html`, `/dai-dien-phong-dao-tao.html`.
2. Mở `http://127.0.0.1:5173/#/app/khong-co`.
3. Đăng nhập nhanh `21094501` rồi sửa URL thành `#/app/audit`.

- ☐ Mỗi trang lối tắt tự đăng nhập tài khoản mẫu của vai trò đó và vào Tổng quan.
- ☐ Đường dẫn lạ hiện “Không tìm thấy trang”; sinh viên vào `#/app/audit` thấy “Không có quyền truy cập”; ứng dụng không bị trắng trang.

---

## B. Cổng sinh viên — nộp, sửa, rút hồ sơ

### B1. Nộp hồ sơ đợt đầu vào (U1 – phần nộp) — làm ngay sau A1

Đang ở form R1 của Phan Minh Khang.

1. Bước 1 “Thông tin cá nhân”: kiểm tra thông tin khóa; sửa SĐT, lớp sinh hoạt → **Tiếp tục**.
2. Bước 2 “Tiêu chí & minh chứng”:
   - GPA: nhập `3.5`; Tiếng Anh: nhập `600`.
   - Ở ô minh chứng của GPA lần lượt chọn: tệp `.docx`; tệp `.docx` đổi đuôi thành `.pdf`; tệp PDF > 10 MB; cuối cùng là PDF hợp lệ.
   - Tiếng Anh: tải 1 ảnh PNG/JPG.
   - **Thêm thành tích** → tên “Olympic Tin học”, mức “Giải Nhất · 40 điểm”, tải 1 PDF.
   - Bấm **Xem** cạnh một tệp vừa tải.
3. Chờ khoảng 2 giây không thao tác, quan sát dòng trạng thái dưới các nút.
4. **Tiếp tục** sang bước 3. Thử bấm **Nộp hồ sơ chính thức** khi chưa tích cam kết. Tích “Tôi cam kết…” → **Nộp hồ sơ chính thức**.
5. Demo → Hộp thư → lọc `khang`.

- ☐ Mỗi tiêu chí hiện dòng “Mức điểm: …” (ví dụ `≥ 3.2 → 30 điểm · ≥ 3.4 → 40 điểm · ≥ 3.6 → 50 điểm`) và hướng dẫn minh chứng; tiêu chí “Tiếng Anh nâng cao” không có ô nhập (“Dùng giá trị của tiêu chí được tham chiếu”).
- ☐ Tệp sai bị từ chối với ba thông báo khác nhau: sai định dạng · nội dung không khớp định dạng · vượt quá 10 MB.
- ☐ Khối “Điểm dự kiến” cập nhật ngay khi nhập: **120** điểm, “BB đạt 2/2” (GPA 40 + Tiếng Anh 20 + nâng cao 20 + Giải Nhất 40).
- ☐ **Xem** mở ngăn xem tệp (PDF/ảnh hiển thị được, có “Tải xuống”).
- ☐ Dòng trạng thái chuyển từ “Có thay đổi chưa lưu” sang “Đã lưu nháp”.
- ☐ Nút nộp bị khóa khi chưa cam kết. Nộp xong chuyển sang trang chi tiết hồ sơ, trạng thái **Chờ duyệt**, có mã dạng `HS-2026-000039` (không trùng mã nào trong dữ liệu mẫu).
- ☐ Hộp thư có email “Đã tiếp nhận hồ sơ HS-…” chứa mã hồ sơ và giờ dạng `09:00 9/11/26`.
- ☐ **TK sinh viên** (kiểm ở H4): Khang là “Ứng viên”, chưa phải SV CN/KSTN.

### B2. Tải lại trang, sửa hồ sơ đang chờ duyệt, rút và nộp lại

1. Nhấn F5 tại trang chi tiết hồ sơ.
2. **Tiếp tục** → sửa GPA thành `3.7` → **Lưu chỉnh sửa**. Bấm **Xem** một minh chứng.
3. Bấm **Rút hồ sơ** → **Xác nhận**.
4. Menu **Đợt xét tuyển đang mở** → **Nộp hồ sơ** ở R1.

- ☐ Sau F5 vẫn đăng nhập, dữ liệu và tệp minh chứng còn nguyên (tệp xem lại được).
- ☐ Sửa xong điểm dự kiến thành **130**, hồ sơ vẫn “Chờ duyệt”; phần “Lịch sử xử lý” có dòng “Chỉnh sửa hồ sơ”, vai trò ghi “Sinh viên”.
- ☐ Rút xong về “Hồ sơ của tôi”, trạng thái **Đã rút**.
- ☐ Tạo được hồ sơ nháp mới trong cùng đợt (hồ sơ mới mang nhãn Luồng B vì sinh viên đã có lịch sử nộp).

### B3. Bản nháp có sẵn và hủy nháp **[RESET]**

1. Đăng nhập nhanh `26010011` (Hồ Ngọc Mai).
2. Ở Tổng quan bấm mã hồ sơ trong khung “Bạn còn bản nháp chưa nộp”.
3. Sửa một giá trị rồi bấm ngay một mục menu khác.
4. Quay lại hồ sơ, bấm **Hủy nháp** → **Xác nhận**.

- ☐ Tổng quan ghi “Ứng viên (chưa thuộc lớp CN/KSTN)”, có cảnh báo bản nháp và bảng “Đợt phù hợp”.
- ☐ Rời trang khi chưa lưu hiện hộp “Rời trang khi chưa lưu?”.
- ☐ Hủy nháp xong hồ sơ chuyển **Đã hủy**.

### B4. Sinh viên CN/KSTN không nộp được lớp khác (D-20) **[RESET]**

1. Đăng nhập nhanh `21094501` (Nam). Xem menu.
2. Về trang chủ (đổi URL thành `#/`), xem thẻ `DXT-2026-01`.
3. Vào **Hồ sơ của tôi**.

- ☐ Menu của Nam **không có** “Đợt xét tuyển đang mở” và chưa có “Cập nhật hồ sơ tích lũy” (lớp K20 không có đợt nào đang tiếp nhận).
- ☐ Thẻ R1 hiện ghi chú “Bạn đang học lớp CN/KSTN khác.” thay cho nút Nộp hồ sơ.
- ☐ “Dòng thời gian chương trình” liệt kê 3 năm: 2024–2025 (140 điểm, Năm 1: Đang học), 2025–2026 (170 điểm, Năm 2: Đang học), 2026–2027 (190 điểm, Đạt điều kiện).

### B5. Luồng C — cập nhật hồ sơ tích lũy khi đợt của lớp mở (xem **F2** và kịch bản trọn chuỗi tại **L1–L4**)

Luồng này cần một đợt đang tiếp nhận của lớp K20; được tạo trong kịch bản **F2** (hoặc thực hiện trọn chuỗi từ nộp, duyệt đến công bố ở **L1–L4**). Làm F2 rồi quay lại đánh dấu:

- ☐ Menu của Nam xuất hiện **Cập nhật hồ sơ tích lũy**; có thông báo “ĐXT lớp đã mở tiếp nhận”.
- ☐ Form mang nhãn “Luồng C – Duy trì”, các giá trị (40, 0, 3.5, 85, 600, 1) được **kế thừa** từ hồ sơ năm trước; minh chứng phải tải mới.

---

## C. Giảng viên phụ trách — duyệt hồ sơ và chốt danh sách (đợt R2)

### C1. Sinh viên bổ sung hồ sơ trong hạn (U4a) **[RESET]**

1. Đăng nhập nhanh `21094602` (Bảo). Bấm mã hồ sơ trong khung “Hồ sơ cần bổ sung”.
2. Không sửa gì: **Tiếp tục** → **Gửi bổ sung**.
3. **Quay lại**, tải thêm 1 tệp minh chứng cho một tiêu chí → **Tiếp tục** → **Gửi bổ sung**.

- ☐ Form mở sẵn ở bước 2, có khung vàng “Yêu cầu bổ sung trước 09:00 12/11/26” kèm nội dung yêu cầu và đếm ngược “Còn 72 giờ”.
- ☐ Gửi khi chưa sửa gì bị từ chối: “Cần sửa giá trị hoặc minh chứng theo yêu cầu trước khi gửi bổ sung.”
- ☐ Sau khi bổ sung: trạng thái **Chờ duyệt**.

### C2. Xác minh từng tiêu chí, sửa giá trị, ra quyết định

1. Đăng nhập nhanh `GV001` → **Duyệt hồ sơ**. Đợt mặc định là `DXT-2026-02`.
2. Quan sát nút **Chốt & gửi phê duyệt**.
3. Bấm **Xét duyệt / Xem** ở dòng **Trần Minh Khoa**.
4. Bấm tên một tệp minh chứng (ví dụ `c_gpa-21094518.pdf`).
5. Ở tiêu chí “GPA năm 2”: nhập `3.45` vào “Giá trị điều chỉnh”, để trống ô ý kiến, bấm **Hợp lệ**. Sau đó nhập ý kiến “Điều chỉnh theo bảng điểm chính thức” rồi bấm **Hợp lệ** lần nữa.
6. Bấm **Hợp lệ** cho mọi tiêu chí còn lại và **Thành tích hợp lệ** cho từng thành tích.
7. Nhập “Hạn bổ sung” = `25/11/2026 10:00` → **Yêu cầu bổ sung**. Xóa hạn.
8. Bấm **Đạt điều kiện**.
9. Không nhập gì, bấm **Mở lại để xét duyệt**.

- ☐ Bước 2: nút chốt bị khóa (còn hồ sơ chờ duyệt). Bảng có cột Luồng (“C · SV cũ”, “B”), điểm tự khai/chính thức, trạng thái. **Không** có hồ sơ ở trạng thái Bản nháp.
- ☐ Bước 3: đầu trang ghi “Điểm tự khai 190 → chính thức 130” (thành tích chưa xác minh chưa được tính); nút **Đạt điều kiện** bị khóa.
- ☐ Bước 4: khung bên phải hiện ảnh “minh chứng mẫu”.
- ☐ Bước 5: thiếu lý do → “Vui lòng ghi lý do điều chỉnh giá trị của sinh viên.”; có lý do → lưu được.
- ☐ Bước 6: điểm chính thức lên **190**; nút **Đạt điều kiện** mở.
- ☐ Bước 7: “Hạn bổ sung phải sau hiện tại và không vượt quá ngày kết thúc xét duyệt.”
- ☐ Bước 8: trạng thái **Đạt điều kiện**; ô ý kiến tự xóa trắng sau quyết định.
- ☐ Bước 9: thiếu lý do nên hồ sơ **vẫn** “Đạt điều kiện” (có báo lỗi).

### C3. Không để lẫn ý kiến giữa các hồ sơ, quyết định “Không đạt”

1. Về **Duyệt hồ sơ** → mở hồ sơ **Phạm Gia Hân**.
2. Kiểm tra ô “Ý kiến thẩm định” và các ô “Giá trị điều chỉnh”.
3. Bấm **Không đạt** khi ô ý kiến trống.
4. Xác minh **Hợp lệ** mọi tiêu chí → **Đạt điều kiện**.
5. Mở hồ sơ **Võ Gia Bảo** → xác minh hết → **Đạt điều kiện**.

- ☐ Bước 2: các ô đều **trống** (không mang ý kiến/giá trị từ hồ sơ của Khoa sang).
- ☐ Bước 3: bị từ chối, hồ sơ vẫn “Chờ duyệt”.
- ☐ Lịch sử ở cuối trang ghi hành động bằng tiếng Việt (“Đạt điều kiện”, “Xác minh tiêu chí”…) và vai trò “Giảng viên phụ trách”.

### C4. Chốt và gửi phê duyệt

1. Về **Duyệt hồ sơ**: callout phải ghi “Còn 0 hồ sơ chờ duyệt / chờ bổ sung”.
2. Bấm **Chốt & gửi phê duyệt** → xem bản xem trước → **Xác nhận chốt, tạo phiên bản mới**.

- ☐ Xem trước: “Chỉ tiêu 4 · SV cũ giữ lại 3 · Suất bổ sung 1”; Nam, Bảo, Khoa (SV cũ) và Hân (SV mới) đều “Đề xuất”.
- ☐ Sau khi chốt chuyển sang trang danh sách v1 “Chờ phê duyệt”, bước “Chủ nhiệm ngành · Đang chờ”. GVPT **xem được** trang này nhưng không có nút Trả về/Xác nhận.

### C5. Quá hạn bổ sung (U4b) **[RESET]**

1. Demo → Đồng hồ → đặt `12/11/2026 09:01` → **Đặt giờ**.
2. Demo → Hộp thư → lọc `21094602`. Đăng nhập nhanh `21094602` → **Hồ sơ của tôi**.

- ☐ Toast “Đã chạy tác vụ định kỳ: N thay đổi”.
- ☐ Hồ sơ R2 của Bảo chuyển **Không đạt**; có email “Hồ sơ HS-2026-000009 quá hạn bổ sung”; form chỉ đọc, không còn nút Gửi bổ sung.

### C6. Ngoài phạm vi (U10) **[RESET]**

1. Đăng nhập nhanh `GV002` (CNN ngành HTTT). Mở `#/app/reviews/seed_app_6` (hồ sơ R2 của Khoa, ngành KTPM).
2. Mở **Duyệt hồ sơ ngành** và xem danh sách đợt chọn được.

- ☐ Hiện “Không có quyền truy cập – Hồ sơ không nằm trong phạm vi hiện tại.”
- ☐ Ô chọn đợt chỉ có các đợt của ngành HTTT (không có `DXT-2026-02`).

---

## D. Chuỗi phê duyệt và công bố

### D1. Đồng hạng — CNN phải chọn (U14) **[RESET]**

1. Đăng nhập nhanh `GV005` → **Xác nhận danh sách** → `DXT-2026-03` → **Xem danh sách**.
2. Quan sát nút **Xác nhận danh sách**. Tích cả hai ô “Đồng hạng T1”, rồi bỏ bớt còn một ô (chọn Trương Gia Huy).
3. **Xác nhận danh sách** → **Xác nhận**.
4. Đăng nhập nhanh `GV004` → **Phê duyệt danh sách** → `DXT-2026-03`.

- ☐ Có cảnh báo “Có 2 hồ sơ đồng hạng tranh 1 suất cuối – cấp CNN cần quyết định”.
- ☐ Nút xác nhận chỉ mở khi chọn **đúng 1** hồ sơ (0 hoặc 2 đều khóa).
- ☐ BLĐ khoa thấy bước CNN “Đã duyệt”, ô của Huy đã tích và **không sửa được**.

### D2. BLĐ khoa trả về, chạy lại từ CNN (U5) **[RESET]**

1. Đăng nhập nhanh `GV004` → **Phê duyệt danh sách** → `DXT-2026-04`. Xem ô “Phiên bản danh sách” và lịch sử phê duyệt.
2. Bấm **Trả về** khi ô ý kiến trống → **Xác nhận**. Sau đó bấm **Hủy**.
3. Nhập ý kiến “Cần rà soát lại minh chứng tiếng Anh” → **Trả về** → **Xác nhận**.
4. Đăng nhập nhanh `GV006` (GVPT lớp HTTT-K21): xem chuông thông báo, bấm thông báo “Danh sách bị trả về”.
5. **Duyệt hồ sơ** → đợt `DXT-2026-04` → (tùy chọn: mở một hồ sơ, nhập lý do, **Mở lại để xét duyệt**, xác minh lại, **Đạt điều kiện**) → **Chốt & gửi phê duyệt** → **Xác nhận chốt…**.
6. Đăng nhập nhanh `GV004` → mở lại `DXT-2026-04`.
7. Đăng nhập nhanh `GV002` → **Xác nhận danh sách** → `DXT-2026-04`.

- ☐ Bước 1: có v2 “Chờ phê duyệt” và v1 “Đã trả về”; lịch sử ghi đủ ai/khi nào/ý kiến của từng phiên bản.
- ☐ Bước 2: “Vui lòng ghi rõ lý do trả về danh sách.”; nút **Xác nhận** không bị thông báo lỗi che (thông báo nằm góc trên phải và tự tắt).
- ☐ Bước 3: v2 thành “Đã trả về”; ở **Đợt xét tuyển**, R4 quay về “Đang xét duyệt hồ sơ”.
- ☐ Bước 4: GVPT nhận thông báo, mở được danh sách ở chế độ chỉ đọc và đọc được lý do trả về.
- ☐ Bước 5: tạo **v3**, đợt về “Chờ phê duyệt”.
- ☐ Bước 6: BLĐ khoa **chưa** có nút phê duyệt v3 (đang chờ CNN).
- ☐ Bước 7: CNN HTTT có nút **Xác nhận danh sách** cho v3.

### D3. PĐT công bố (U6) **[RESET]**

1. Đăng nhập nhanh `GV900`. Ở Tổng quan phải thấy “1 danh sách chờ bạn”.
2. **Phê duyệt & Công bố** → `DXT-2026-05` → **Xem danh sách** → **Phê duyệt & Công bố**. Đọc hộp xác nhận → **Xác nhận**.
3. Bấm **Email gửi lỗi** trong khung xanh.
4. Mở `#/ket-qua/DXT-2026-05`. Về trang chủ, lọc tab **Đã công bố**.
5. Thử vào **Tra cứu ĐXT/lớp** → `DXT-2026-05`.

- ☐ Hộp xác nhận ghi rõ hậu quả: “Công bố 3 sinh viên trúng tuyển; 1 sinh viên DROPPED; đưa 4 email vào hàng đợi. ĐXT sẽ bất biến.”
- ☐ Sau công bố: v1 “Đã công bố”, cả 3 cấp “Đã duyệt”, khung “ĐXT đã công bố và bất biến”.
- ☐ Trang kết quả công khai chỉ có 3 dòng, MSSV che dạng `26****07`, họ tên viết tắt dạng `Đ. M. Thư`.
- ☐ Trang chi tiết đợt đã công bố không còn nút Sửa/Phát hành/Xóa.
- ☐ Kiểm ở H3/H4: lớp CNTN-MKT-K20 năm 3 có Thư, Khánh, Lan “Đang học”; Trần Minh Long “Không đạt duy trì”; Khánh và Lan trở thành “SV CN/KSTN”.
- ☐ Hộp thư: `26900007/08/09` nhận “Kết quả xét tuyển…”, `26900010` nhận “Kết quả duy trì lớp…”.

### D4. Trọn chuỗi R2 và sinh viên cũ không nộp hồ sơ (U9) **[RESET]**

1. Làm lại **C1 → C4** (bổ sung của Bảo, duyệt Khoa/Bảo/Hân, chốt).
2. `GV005` → **Xác nhận danh sách** → `DXT-2026-02` → **Xác nhận danh sách** → **Xác nhận**.
3. `GV004` → **Phê duyệt danh sách** → `DXT-2026-02` → **Phê duyệt danh sách** → **Xác nhận**.
4. `GV900` → **Phê duyệt & Công bố** → `DXT-2026-02` → **Phê duyệt & Công bố** → **Xác nhận**.
5. Demo → Hộp thư → lọc `21094777`. Đăng nhập nhanh `21094777` (Tú). Đăng nhập nhanh `21094501` → **Hồ sơ của tôi**.

- ☐ Mỗi cấp chỉ thấy nút hành động khi tới lượt mình; cấp trước xong thì cấp sau nhận thông báo (chuông).
- ☐ Hộp công bố: “4 sinh viên trúng tuyển; 1 sinh viên DROPPED; … 6 email”.
- ☐ Nam, Khoa, Bảo, Hân → **Trúng tuyển**; Việt giữ **Không đạt**.
- ☐ Tú nhận email “Kết quả duy trì lớp KSTN-KTPM-K20… (lý do: Không nộp hồ sơ tích lũy)”; Tổng quan của Tú ghi “Ứng viên (chưa thuộc lớp CN/KSTN)” và menu có lại “Đợt xét tuyển đang mở”.
- ☐ Dòng thời gian của Nam: 2026–2027 “Trúng tuyển · Năm 3: Đang học”.
- ☐ `#/ket-qua/DXT-2026-02` có 4 dòng đã che.

### D5. Trúng tuyển hai lớp cùng năm học (U13) **[RESET]**

1. Hoàn tất R3: `GV005` chọn **Trương Gia Huy** ở nhóm đồng hạng và xác nhận (như D1) → `GV004` phê duyệt → `GV900` công bố. Huy trúng tuyển lớp K21.
2. `GV004` → **Đợt xét tuyển** → `DXT-2026-01` → **Đóng tiếp nhận sớm** → nhập “Lý do bắt buộc” → **Xác nhận**.
3. `GV005` (vai trò CNN) → **Duyệt hồ sơ ngành** → đợt `DXT-2026-01` → lần lượt mở 4 hồ sơ chờ duyệt (Huy, Đức, Hiếu, Hương): **Hợp lệ** mọi tiêu chí → **Đạt điều kiện**.
4. **Chốt & gửi phê duyệt** → xác nhận. Xem cột “Ghi chú”.
5. `GV005` xác nhận → `GV004` phê duyệt → `GV900` **Phê duyệt & Công bố**.
6. Đăng nhập nhanh `26010022` (Huy) → **Hồ sơ của tôi**.

- ☐ Bước 2: thiếu lý do thì bị từ chối; có lý do thì R1 sang “Đang xét duyệt hồ sơ”, bản nháp của Mai thành “Đã hủy”.
- ☐ Bước 4: dòng của Huy có ghi chú **“Đã trúng tuyển lớp khác”** ngay từ danh sách đề xuất.
- ☐ Bước 5: hộp công bố ghi 3 sinh viên trúng tuyển (không phải 4).
- ☐ Bước 6: hồ sơ R1 của Huy **Không trúng tuyển**, ghi chú “Đã trúng tuyển lớp khác – BR-08”; hồ sơ R3 **Trúng tuyển**; Huy chỉ thuộc một lớp.

---

## E. Tự động theo đồng hồ mô phỏng

### E1. Đợt tự mở tiếp nhận (U12) **[RESET]**

1. Demo → Đồng hồ → đặt `15/11/2026 00:00` → **Đặt giờ**.
2. Trang chủ: tìm thẻ `DXT-2026-06`. Đăng nhập nhanh `quantri` → **Nhật ký** → tìm `DXT-2026-06`.

- ☐ R6 chuyển “Đang tiếp nhận hồ sơ”, có nút Nộp hồ sơ.
- ☐ Nhật ký có `CRITERIA_SNAPSHOT_TAKEN` và `ROUND_OPENED` do **Hệ thống** thực hiện. Trang chi tiết đợt ghi “Snapshot bộ tiêu chí v… lúc 00:00 15/11/26”.

### E2. Nhắc nộp bản nháp và tự đóng đợt

1. Đặt đồng hồ `28/11/2026 01:00`. Hộp thư → lọc `26010011`.
2. Đặt đồng hồ `30/11/2026 00:01`. Đăng nhập nhanh `26010011` → **Hồ sơ của tôi**. Đăng nhập nhanh `GV005` → xem chuông.

- ☐ Có email “Nhắc nộp hồ sơ – còn 48 giờ” gửi cho Mai (mỗi mốc chỉ một email).
- ☐ Sau 00:00 30/11: R1 “Đang xét duyệt hồ sơ”; bản nháp của Mai “Đã hủy”; CNN/GVPT nhận thông báo “ĐXT đã chuyển sang xét duyệt”.

### E3. Hộp thư và khôi phục dữ liệu

1. Demo → **Đến mốc kế tiếp của ĐXT** với một đợt bất kỳ.
2. Demo → Dữ liệu → **Xuất JSON db**; rồi **Khôi phục dữ liệu mẫu** → xác nhận.

- ☐ Đồng hồ nhảy đúng mốc gần nhất của đợt đã chọn.
- ☐ Tải được tệp `kstn-prototype-v3.json`. Sau khôi phục: đồng hồ về 09:00 09/11/2026, bị đăng xuất, tệp minh chứng đã tải biến mất.

---

## F. Quản lý đợt xét tuyển (BLĐ khoa / CNN / GVPT)

### F1. Phát hành đợt nháp và kiểm tra mốc thời gian **[RESET]**

1. Đăng nhập nhanh `GV004` → **Đợt xét tuyển** → lọc tab **Nháp** → `DXT-2026-07` → **Xem chi tiết**.
2. **Sửa** → đổi “Bắt đầu xét duyệt” thành ngày **trước** “Kết thúc tiếp nhận” → **Xác nhận**. Bấm **Phát hành** → **Xác nhận**.
3. **Hủy** hộp xác nhận, **Sửa** lại cho đúng thứ tự (tiếp nhận 01/12–10/12, xét duyệt 11/12–20/12) → **Phát hành** → **Xác nhận**.
4. Đăng xuất, xem trang chủ, tab **Chưa mở**.

- ☐ Bước 2: phát hành bị chặn với “Ngày kết thúc tiếp nhận phải trước hoặc bằng ngày bắt đầu xét duyệt.”; đợt vẫn ở Nháp. Hộp sửa/xác nhận vẫn thao tác được ngay (không bị thông báo che nút).
- ☐ Bước 3: đợt sang “Chưa mở”; xuất hiện nút **Mở tiếp nhận sớm**.
- ☐ Bước 4: R7 hiện ở trang chủ; trước khi phát hành thì **không** hiện.
- ☐ Form sửa **không có** ô chọn trạng thái — trạng thái chỉ đổi bằng thao tác.

### F2. Tạo đợt mới, ràng buộc một lớp – một học kỳ – một năm học, luồng C

1. `GV004` → **Đợt xét tuyển** → **Tạo đợt xét tuyển**: Lớp `KSTN-KTPM-K20`; Tên “Duy trì K20 – HK2”; Học kỳ 1; Năm học 2026–2027; Sĩ số 4; Bộ tiêu chí “Duy trì & bổ sung năm 3 – theo Assessment Sample”; GVPT ThS. Phạm Thị Dung; Chế độ “Duy trì trước, bổ sung sau”; tiếp nhận `10/11/2026 00:00` – `12/11/2026 00:00`; xét duyệt `12/11/2026 00:00` – `20/11/2026 00:00` → **Xác nhận**.
2. Ở trang chi tiết đợt mới: **Phát hành** → **Xác nhận**.
3. **Hủy**, **Sửa** → Học kỳ 2 → **Xác nhận** → **Phát hành** → **Xác nhận**.
4. Bấm **Mở tiếp nhận sớm** → để trống lý do → **Xác nhận** → **Hủy**.
5. Demo → Đồng hồ → `10/11/2026 00:00`.
6. Đăng nhập nhanh `21094501` → kiểm tra các mục ở **B5**: menu **Cập nhật hồ sơ tích lũy** → bấm **Cập nhật hồ sơ tích lũy** ở dòng đợt mới → **Tiếp tục** (xem tiếp kịch bản duy trì chi tiết từ nộp, duyệt đến công bố tại **L1–L4**).

- ☐ Bước 1: đợt mới ở trạng thái Nháp với mã **`DXT-2026-08`** (nối tiếp dãy mã hiện có).
- ☐ Bước 2: bị chặn — “Mỗi lớp, học kỳ và năm học chỉ có một ĐXT không ở nháp.” (trùng với R2).
- ☐ Bước 3: đổi sang Học kỳ 2 thì phát hành được.
- ☐ Bước 4: “Vui lòng ghi lý do chuyển giai đoạn thủ công.”
- ☐ Bước 5: đợt tự mở; Hộp thư có email “… đã mở tiếp nhận” gửi cho 4 sinh viên đang học lớp K20.
- ☐ Bước 6: các mục ở B5 đạt.

### F3. Quyền sửa theo vai trò và trạng thái **[RESET]**

1. Đăng nhập nhanh `GV001` → **ĐXT của lớp** → `DXT-2026-02` → **Sửa**.
2. Đăng nhập nhanh `GV004` → `DXT-2026-01` → **Sửa**.
3. Đăng nhập nhanh `GV900` → **Tra cứu ĐXT/lớp**; bấm **Tra cứu lớp**.

- ☐ GVPT: không có nút Tạo đợt; form sửa đợt đang xét duyệt chỉ có “Kết thúc xét duyệt” và “Hạn phê duyệt dự kiến”.
- ☐ BLĐ khoa với đợt đang tiếp nhận: chỉ sửa được hạn kết thúc tiếp nhận, mốc xét duyệt, hạn phê duyệt, mô tả, sĩ số.
- ☐ PĐT: chỉ xem (không có Tạo/Sửa/Phát hành), chuyển qua lại được giữa tra cứu ĐXT và tra cứu lớp.

### F4. Trang công khai của đợt

1. Đăng xuất. Trang chủ: thử ô tìm kiếm, các tab trạng thái, lọc Năm học / Học kỳ / Khoa.
2. Bấm **Xem chi tiết** ở R1.

- ☐ Tab trạng thái đúng 6 mục (không có “Đã kết thúc/closed”), số đếm khớp; đợt Nháp không xuất hiện.
- ☐ Trang chi tiết có thông tin đợt, 4 mốc thời gian (đã đến/sắp tới), bảng tiêu chí với các mức điểm và yêu cầu minh chứng; có nút **Về trang chủ** và **Nộp hồ sơ** (đợt đã công bố thì là **Xem kết quả**).

---

## G. Bộ tiêu chí

### G1. Quyền theo vai trò và chủ sở hữu (C12) **[RESET]**

1. Đăng nhập nhanh `GV001` → **Bộ tiêu chí**. Thử các tab “Tất cả trong khoa”, “Do tôi tạo”, “Lưu trữ”.
2. Mở “Duy trì & bổ sung năm 3 – theo Assessment Sample” (do CNN tạo, đã ban hành).
3. Mở “Bản nháp tiêu chí của ThS. Phạm Thị Dung”.
4. Đăng nhập nhanh `GV005` → mở cùng bản nháp đó.

- ☐ Cột “Phạm vi” ghi tên khoa/ngành (ví dụ “Ngành Kỹ thuật phần mềm”), không phải mã nội bộ.
- ☐ Bước 2: GVPT chỉ xem — không có nút Thêm tiêu chí/Sửa/Ban hành/Lưu trữ.
- ☐ Bước 3: GVPT sửa được bộ do mình tạo (Thêm tiêu chí, Sửa, Lên/Xuống, Xóa tiêu chí, Lưu nháp, Ban hành, Xóa).
- ☐ Bước 4: CNN cũng sửa được bộ nháp thuộc ngành mình.

### G2. Xem trước điểm — mẫu Assessment phải ra 190

1. Ở bộ “Duy trì & bổ sung năm 3…”, khối **Xem trước điểm** → **Điền dữ liệu mẫu Assessment**.
2. Sửa GPA thành `3.4`, rồi `3.39`; sửa Rèn luyện thành `80`.

- ☐ Mẫu Assessment: **190 điểm · Đạt BB**.
- ☐ GPA 3.4 vẫn 40 điểm (ngưỡng ≥); 3.39 còn 30 điểm; Rèn luyện 80 → 0 điểm và “Chưa đạt BB” (ngưỡng >).

### G3. Soạn tiêu chí, ban hành, phiên bản mới (U8)

1. `GV005` → **Tạo bộ tiêu chí** → đặt tên → **Thêm tiêu chí**: thử lần lượt 3 kiểu (Ngưỡng số, Đếm minh chứng, Tích lũy có quy đổi), thêm/xóa mức → **Xác nhận** → **Lưu nháp**.
2. Xóa hết mức của một tiêu chí rồi bấm **Ban hành**. Sửa lại cho hợp lệ → **Ban hành**.
3. Mở bộ “Duy trì & bổ sung năm 3…” (đang được R2 dùng) → **Tạo phiên bản mới**.
4. **Đợt xét tuyển** → `DXT-2026-02` → xem dòng “Snapshot bộ tiêu chí”.

- ☐ Ngăn sửa tiêu chí có đủ: tên, nhóm BB/UT, kiểu tính điểm, đơn vị, mô tả yêu cầu minh chứng, thứ tự xét hòa, tham chiếu giá trị, chế độ đếm, điểm trần, bảng mức.
- ☐ Ban hành bộ thiếu mức bị chặn kèm lý do; bộ hợp lệ chuyển “Đã ban hành” và trở thành chỉ đọc.
- ☐ Bộ đã ban hành có banner “ĐXT đang chạy dùng bản snapshot…”; **Tạo phiên bản mới** sinh bản **v2 – Nháp** sửa được.
- ☐ R2 vẫn ghi “Snapshot bộ tiêu chí v1”.
- ☐ Bộ ở trạng thái “Lưu trữ” không xuất hiện trong ô chọn bộ tiêu chí khi tạo đợt.

---

## H. Danh mục, lớp, tài khoản, phân quyền

### H1. Danh mục Khoa/Ngành và Chuyên ngành (Quản trị viên) **[RESET]**

1. Đăng nhập nhanh `quantri` → **Danh mục Khoa/Ngành** → **Thêm mới** (mã `KTEST`, tên “Khoa Thử nghiệm”).
2. Tìm “Khoa Công nghệ Thông tin” → **Xóa** → **Xác nhận**. Chuyển tab **Ngành**.
3. **Chuyên ngành** → **Thêm chuyên ngành mới**: Khoa CNTT, Ngành “Khoa Công nghệ Thông tin · Kỹ thuật phần mềm”, Loại KSTN, Tên `KSTN-KTPM` → **Xác nhận**.
4. Ở dòng `KSTN-KTPM` bấm **Xóa** → **Xác nhận**; rồi **Xem chi tiết**.

- ☐ Thêm khoa thành công; bảng phân trang tối đa 10 dòng/trang.
- ☐ Xóa khoa còn ngành bị chặn: “Phải xóa thành phần con trước thành phần cha: Khoa → Ngành → Chuyên ngành → Lớp.”
- ☐ Trùng chuyên ngành: “Đã có chuyên ngành giống hệt được tạo trước đó.”
- ☐ Xóa chuyên ngành còn lớp bị chặn; Xem chi tiết liệt kê 3 lớp kèm trạng thái lớp.
- ☐ Bảng Chuyên ngành đúng cột: Khoa · Chuyên ngành · Số lượng lớp · Thao tác.

### H2. Lớp và thành viên theo năm đào tạo

1. `quantri` → **Lớp** → **Thêm mới**: Chuyên ngành KSTN-HTTT, Khóa `K22`, Năm bắt đầu `2026`, GVPT ThS. Ngô Thu Trang → **Xác nhận**. Lặp lại y hệt lần nữa.
2. Ở dòng `KSTN-KTPM-K20` bấm **Xem thành viên**. Thử lọc “Năm 2”, “Năm 1”.
3. Ở dòng “Lý Thanh Tú – năm 2” bấm **Ghi nhận tự rút** → để trống lý do → **Xác nhận**; rồi nhập lý do → **Xác nhận**.
4. Đăng nhập nhanh `GV001` → **Lớp của tôi**.

- ☐ Lớp mới có mã tự sinh `KSTN-HTTT-K22`; tạo trùng bị chặn: “Mỗi ngành và khóa chỉ có tối đa một lớp CN/KSTN.” Form **không có** ô nhập sĩ số.
- ☐ Bảng thành viên có cột Năm đào tạo, Trạng thái, Nguồn hồ sơ (hiện **mã hồ sơ** `HS-…`); bên dưới là các ĐXT của lớp.
- ☐ Tự rút thiếu lý do bị chặn; có lý do → dòng năm 2 của Tú thành “Tự rút”; sĩ số lớp giảm; ở **TK sinh viên**, Tú thành “Ứng viên”.
- ☐ GVPT chỉ thấy lớp mình phụ trách, có “Ghi nhận tự rút”, không có Thêm mới/Xóa/Kết thúc lớp.

### H3. Tài khoản giảng viên

1. `quantri` → **TK giảng viên** → **Tạo tài khoản GV**: mã `GV777`, họ tên, email `gv777@iuh.edu.vn`, chọn một lớp phụ trách → **Xác nhận**.
2. Hộp thư → lọc `gv777`. Đăng xuất, đăng nhập `GV777` bằng mật khẩu tạm.
3. `quantri` → ở dòng `GV003` bấm **Khóa** → nhập lý do → **Xác nhận**. Thử đăng nhập `GV003`. Quay lại **Mở khóa**.

- ☐ Mật khẩu tạm hiện một lần trên trang và có trong email “Mật khẩu tạm thời”; đăng nhập lần đầu bị buộc đổi mật khẩu.
- ☐ Bảng giảng viên **không có nút Xóa** — chỉ Khóa/Mở khóa, Đặt lại MK, Sửa, Xem hồ sơ.
- ☐ Tài khoản bị khóa không đăng nhập được; mở khóa xong đăng nhập lại được.

### H4. Tài khoản sinh viên và đặt lại mật khẩu theo lớp (U15)

1. `quantri` → **TK sinh viên**: kiểm tra cột “Chương trình” và việc không có nút thêm sinh viên. Bấm **Xem hồ sơ** ở Nam.
2. Đăng nhập nhanh `GV001` → **Đặt lại MK SV** → **Đặt lại MK** ở dòng Nam → **Xác nhận**.
3. Hộp thư → lọc `21094501` → lấy mật khẩu tạm. Đăng xuất, đăng nhập `21094501` bằng mật khẩu tạm.

- ☐ Không có nút “Thêm SV”. Trang hồ sơ sinh viên có dòng thời gian các năm và danh sách hồ sơ (**Xem chỉ đọc** mở hồ sơ không có nút xác minh/quyết định).
- ☐ GVPT chỉ thấy 5 sinh viên có tư cách thành viên lớp K20 (Nam, Khoa, Bảo, Tú, Việt) — không thấy sinh viên lớp khác.
- ☐ Mật khẩu tạm hiện trong khung “Mật khẩu tạm (hiển thị trong phiên này)” và trong email; sinh viên đăng nhập bằng mật khẩu tạm bị buộc đổi mật khẩu.

### H5. Phân quyền theo phạm vi (BR-14) **[RESET]**

1. Đăng nhập nhanh `GV005` → **TK & phân quyền GV ngành** → **Phân quyền** → **Gán vai trò**.
2. Xem danh sách ở ô “Vai trò”. Chọn Giảng viên “ThS. Lê Minh Tâm”, Vai trò “Giảng viên phụ trách” → xem ô phạm vi → chọn `KSTN-KTPM-K22` → **Xác nhận**.
3. Ở dòng vừa tạo bấm **Thu hồi** → **Xác nhận**.
4. Đăng nhập nhanh `quantri` → **Phân quyền** → **Gán vai trò**: xem ô “Vai trò” và thử chọn “Ban lãnh đạo khoa”.

- ☐ CNN chỉ thấy giảng viên trong ngành; ô “Vai trò” chỉ có **Chủ nhiệm ngành** và **Giảng viên phụ trách**.
- ☐ Chọn vai trò GVPT thì ô phạm vi đổi nhãn thành “Phạm vi: Lớp” và chỉ liệt kê 3 lớp của ngành KTPM (không có lớp ngành khác).
- ☐ Gán thành công; bảng ghi phạm vi bằng tên (“KSTN-KTPM-K22”), hiệu lực dạng `09:00 9/11/26 – Vô hạn`, trạng thái “Đang hiệu lực”; thu hồi xong thành “Đã thu hồi”.
- ☐ Quản trị viên thấy đủ 5 vai trò cán bộ; chọn “Ban lãnh đạo khoa” thì ô phạm vi liệt kê các khoa.
- ☐ Bảng phân quyền không liệt kê vai trò “Sinh viên”.

---

## I. Vận hành: thông báo, email, báo cáo, nhật ký, cấu hình

### I1. Thông báo trong hệ thống

1. Sau khi làm **C4** (chốt R2): đăng nhập nhanh `GV005` → bấm nút **Thông báo (n)** ở đầu trang.
2. Bấm một thông báo. Vào menu **Thông báo** → tích “Chỉ xem chưa đọc” → **Đánh dấu tất cả đã đọc**.

- ☐ Chuông hiện số chưa đọc và 5 thông báo mới nhất, có “Xem tất cả”.
- ☐ Bấm thông báo thì chuyển tới đúng trang liên quan và số chưa đọc giảm.
- ☐ Đánh dấu tất cả đã đọc → số về 0.

### I2. Hàng đợi email và gửi lại **[RESET]**

1. Đăng nhập nhanh `quantri`. Ở Tổng quan (`#/app/dashboard`) xem “1 email lỗi”.
2. **Hàng đợi email** → tab **Gửi lỗi** → **Xem** → **Gửi lại**.

- ☐ Email tới `fail.26010022@…` ở trạng thái “Gửi lỗi”, lỗi “SMTP 550: Mailbox unavailable (mô phỏng)”.
- ☐ **Gửi lại** chạy được; vì địa chỉ này luôn lỗi (mô phỏng) nên email quay lại “Gửi lỗi” với số lần thử được tính lại.
- ☐ Các email khác ở “Đã gửi”.

### I3. Cấu hình hệ thống

1. `quantri` → **Cấu hình hệ thống** → “Dung lượng tối đa mỗi tệp (MB)” = `2` → **Lưu cấu hình**.
2. Nhập “Email nhận thử” → **Gửi email thử**.
3. Chọn một mẫu email, sửa tiêu đề → **Lưu cấu hình**.
4. Đăng nhập nhanh `26010011` → mở bản nháp → bước 2 → tải tệp PDF khoảng 3 MB.

- ☐ Lưu cấu hình thành công; email thử xuất hiện trong Hàng đợi email.
- ☐ Ô tải tệp ghi “tối đa 2 MB/tệp”; tệp 3 MB bị từ chối: “Tệp vượt quá 2 MB…”.
- ☐ **Nhật ký** có dòng `CONFIG_CHANGED`.

### I4. Nhật ký thao tác

1. `quantri` → **Nhật ký**. Lọc theo từ khóa (ví dụ `LOGIN`, `ROUND`), theo khoảng ngày.
2. Bấm **Xem trước / sau** ở một dòng.

- ☐ Các thao tác đã làm trong buổi test đều có dòng nhật ký (đăng nhập, khóa TK, gán quyền, xác minh, quyết định, chốt, phê duyệt, công bố, đổi cấu hình, đặt đồng hồ).
- ☐ Cột người thực hiện ghi tên và vai trò bằng tiếng Việt; thao tác tự động ghi “Hệ thống”.
- ☐ Ngăn chi tiết hiện dữ liệu trước/sau. **Không có** nút sửa/xóa nhật ký.

### I5. Báo cáo, xuất CSV, in **(chưa kiểm bằng mắt: mở bằng Excel, bản in)**

1. Sau khi làm **D3**: đăng nhập nhanh `GV900` → **Báo cáo** → chọn `DXT-2026-05`.
2. Bấm **Xuất CSV (Excel)**, mở tệp bằng Excel. Bấm **In / Lưu PDF**.
3. Đăng nhập nhanh `GV001` → **Báo cáo lớp**.

- ☐ Có tổng hồ sơ, trúng tuyển/chỉ tiêu, phân theo luồng và trạng thái, phổ điểm, danh sách trúng tuyển.
- ☐ Tệp `ket-qua-DXT-2026-05.csv` mở bằng Excel hiển thị **đúng tiếng Việt có dấu**.
- ☐ Bản xem trước khi in không có thanh menu bên trái và thanh đầu trang.
- ☐ GVPT chỉ chọn được các đợt của lớp mình.

### I6. Tra cứu kết quả cá nhân bằng MSSV + OTP **[RESET]**

1. Trang chủ → **Tra cứu kết quả** → MSSV `22073210`, email `22073210@student.iuh.edu.vn` → **Gửi mã OTP**.
2. Lấy OTP ở Hộp thư (lọc `22073210`) → nhập → **Xác nhận và tra cứu**.
3. Tra cứu với MSSV `21094602` (Bảo — hồ sơ đang cần bổ sung).

- ☐ Hân: 3 hồ sơ — đợt 2025–2026 “Không trúng tuyển” có điểm 140; hai đợt chưa công bố ghi “Chưa công bố” (không lộ điểm).
- ☐ Bảo: dòng hồ sơ cần bổ sung hiện nội dung yêu cầu và lối đăng nhập để bổ sung.
- ☐ Trang chỉ đọc, không có thao tác sửa.

### I7. Tổng quan theo vai trò

Đăng nhập nhanh lần lượt `GV001`, `GV005`, `GV004`, `GV900`, `quantri` (với `quantri` mở `#/app/dashboard`).

- ☐ Mỗi vai trò có khối “Việc cần làm” với số liệu khớp dữ liệu (ví dụ sau reset: GV005 có “1 danh sách chờ bạn”… tùy trạng thái hiện tại), các thẻ đếm ĐXT theo 6 trạng thái trong phạm vi, và “Mốc sắp tới trong 7 ngày”.
- ☐ Các liên kết “Đi tới duyệt hồ sơ”, “Xử lý danh sách”, “Xem hàng đợi” dẫn đúng trang.

---

## J. Kiểm tra chéo: menu theo vai trò và bảo mật dữ liệu

### J1. Menu đúng vai trò (đối chiếu §9.2 của kế hoạch)

| Vai trò (tài khoản) | Menu phải có |
|---|---|
| ☐ SV CN/KSTN (`21094501`) | Tổng quan · [Cập nhật hồ sơ tích lũy — chỉ khi đợt của lớp đang mở hoặc hồ sơ cần bổ sung] · Hồ sơ của tôi · Thông báo · Thông tin cá nhân |
| ☐ Ứng viên (`26010011`) | Tổng quan · Đợt xét tuyển đang mở · Hồ sơ của tôi · Thông báo · Thông tin cá nhân |
| ☐ GVPT (`GV001`) | Tổng quan lớp · Lớp của tôi · ĐXT của lớp · Duyệt hồ sơ · Bộ tiêu chí · Đặt lại MK SV · Báo cáo lớp · Thông báo |
| ☐ CNN (`GV005`) | Tổng quan ngành · Lớp CN/KSTN · Đợt xét tuyển · Bộ tiêu chí · Duyệt hồ sơ ngành · Xác nhận danh sách · TK & phân quyền GV ngành · Hồ sơ SV · Báo cáo · Thông báo |
| ☐ BLĐ khoa (`GV004`) | Tổng quan khoa · Chuyên ngành · Lớp · Đợt xét tuyển · Bộ tiêu chí · Phê duyệt danh sách · TK & phân quyền GV khoa · Hồ sơ SV · Báo cáo · Thông báo |
| ☐ PĐT (`GV900`) | Tổng quan toàn trường · Chuyên ngành · TK giảng viên · TK sinh viên · Phân quyền · Tra cứu ĐXT/lớp · Phê duyệt & Công bố · Báo cáo · Nhật ký · Thông báo |
| ☐ Quản trị viên (`quantri`) | Danh mục Khoa/Ngành · Chuyên ngành · TK giảng viên · TK sinh viên · Phân quyền · Lớp · Đợt xét tuyển · Cấu hình hệ thống · Nhật ký · Hàng đợi email · Thông báo |

### J2. Phạm vi dữ liệu

- ☐ `GV004` (BLĐ khoa CNTT) không thấy đợt/lớp của Khoa QTKD (R5, R6) ở Đợt xét tuyển, Lớp, Phê duyệt danh sách.
- ☐ `GV002` (CNN HTTT) chỉ thấy lớp/đợt ngành HTTT.
- ☐ `GV001` (GVPT K20) chỉ thấy lớp K20 và các đợt của K20.
- ☐ Quản trị viên **không** có menu Duyệt hồ sơ / Phê duyệt danh sách; PĐT không tạo/sửa được đợt.
- ☐ Sinh viên mở `#/app/my-applications/<mã hồ sơ của người khác>` thấy “Không tìm thấy hồ sơ của bạn.”

---

## K. Giao diện, đáp ứng màn hình, khả năng truy cập **(phần lớn chưa kiểm bằng mắt)**

1. DevTools → chế độ thiết bị → rộng **390px**: trang chủ, Đăng ký, Tra cứu, Tổng quan SV, form hồ sơ (cả 3 bước), Hồ sơ của tôi.
2. Rộng **1024px**: Duyệt hồ sơ (danh sách + chi tiết), Phê duyệt danh sách, Đợt xét tuyển.
3. Rộng **1440px**: lướt mọi menu của từng vai trò.
4. Bàn phím: Tab/Shift+Tab qua form; Esc đóng hộp thoại, ngăn kéo, bảng Demo; Enter gửi form đăng nhập.
5. Theo dõi Console suốt buổi test.

- ☐ Không trang nào có thanh cuộn ngang (đã kiểm tự động ở 390/1024/1440: đạt).
- ☐ Ở 390px: bảng chuyển thành thẻ, nút đủ lớn, nút “Bảng điều khiển demo” không che nút thao tác chính.
- ☐ Thông báo (toast) hiện ở góc trên phải, không che nút của hộp thoại; thông báo lỗi tự tắt sau khoảng 8 giây, rê chuột vào thì giữ lại.
- ☐ Hộp thoại giữ focus bên trong, đóng xong trả focus về nút đã mở.
- ☐ Console không có lỗi đỏ hay cảnh báo React (ngoại trừ 1 yêu cầu `favicon` 404).
- ☐ Toàn bộ chữ trên giao diện là tiếng Việt có dấu; mã ĐXT/MSSV/mã hồ sơ hiển thị dạng thẻ mã; ngày giờ dạng `HH:mm d/M/yy`.

---

## L. Luồng C trọn chuỗi — Duy trì sinh viên KSTN và cạnh tranh suất bổ sung

### L1. Tạo đợt duy trì & kiểm tra kế thừa dữ liệu (Luồng C) **[RESET]**

1. Đăng nhập nhanh `GV004` (BLĐ khoa CNTT) → **Đợt xét tuyển** → **Tạo đợt xét tuyển**:
   - Lớp: `KSTN-KTPM-K20`
   - Tên: `Duy trì & Bổ sung K20 – HK2`
   - Học kỳ: `Học kỳ 2`
   - Năm học: `2026–2027`
   - Sĩ số tối đa: `4`
   - Bộ tiêu chí: `Duy trì & bổ sung năm 3 – theo Assessment Sample`
   - GVPT: `ThS. Phạm Thị Dung`
   - Chế độ xếp hạng: `Duy trì trước, bổ sung sau` (`MAINTAIN_THEN_FILL`)
   - Bắt đầu tiếp nhận: `10/11/2026 00:00` · Kết thúc tiếp nhận: `15/11/2026 00:00`
   - Bắt đầu xét duyệt: `15/11/2026 00:00` · Kết thúc xét duyệt: `22/11/2026 00:00`
   - Hạn phê duyệt dự kiến: `25/11/2026 00:00`
   → **Xác nhận**.
2. Ở trang chi tiết đợt mới: Bấm **Phát hành** → **Xác nhận**. Đợt chuyển sang trạng thái "Chưa mở" (`upcoming`).
3. Demo → Đồng hồ → đặt `10/11/2026 00:01` → **Đặt giờ**. Đợt tự động mở sang "Đang tiếp nhận hồ sơ" (`open`).
4. Đăng nhập nhanh `21094501` (Nam – SV cũ K20):
   - Menu xuất hiện mục **Cập nhật hồ sơ tích lũy** kèm thông báo "ĐXT lớp đã mở tiếp nhận".
   - Bấm **Cập nhật hồ sơ tích lũy** tại dòng đợt vừa mở.
   - Bước 1 "Thông tin cá nhân": Kiểm tra thông tin khóa, lớp sinh hoạt, SĐT → **Tiếp tục**.
   - Bước 2 "Tiêu chí & minh chứng":
     + Tiêu chí "Tín chỉ đạt tích lũy": Kế thừa giá trị `40`.
     + Tiêu chí "Tín chỉ rớt tích lũy": Kế thừa giá trị `0`.
     + Tiêu chí "GPA năm 2": Kế thừa giá trị `3.5`.
     + Tiêu chí "Điểm rèn luyện": Kế thừa giá trị `85`.
     + Tiêu chí "Tiếng Anh": Kế thừa giá trị `600`.
     + Tiêu chí "Nghiên cứu khoa học": Kế thừa số lượng `1`.
     + Danh mục thành tích: Kế thừa danh sách thành tích từ năm trước.
     + Minh chứng của từng tiêu chí: Hoàn toàn TRỐNG (dòng trạng thái ghi "Chưa xác minh", không dùng lại minh chứng cũ).

Kết quả mong đợi:
- ☐ Form mang nhãn rõ ràng: **"Luồng C – Duy trì"**.
- ☐ Toàn bộ giá trị tiêu chí số và danh mục thành tích được **kế thừa tự động** từ hồ sơ năm trước (`inheritApplication`).
- ☐ Tệp minh chứng cũ không bị giữ lại, hệ thống buộc sinh viên phải tải mới minh chứng của năm học hiện tại.

### L2. Cảnh báo vi phạm chuẩn duy trì & nộp hồ sơ duy trì

1. Vẫn ở form của Nam (Bước 2 "Tiêu chí & minh chứng"):
   - Sửa tiêu chí "Điểm rèn luyện" thành `75` (dưới chuẩn duy trì 80 điểm).
   - Sửa tiêu chí "GPA năm 2" thành `3.15` (dưới chuẩn duy trì 3.20 điểm).
   - Bấm **Tiếp tục** sang Bước 3: Quan sát khối "Điểm tự khai" và dòng cảnh báo.
2. Bấm **Quay lại** bước 2:
   - Sửa lại GPA thành `3.65`, Rèn luyện thành `88`.
   - Tải 1 tệp PDF minh chứng cho GPA và 1 tệp PDF minh chứng cho Điểm rèn luyện.
   - Tải 1 ảnh cho Tiếng Anh.
   - Tải tệp PDF minh chứng cho từng thành tích trong danh sách.
3. Bấm **Tiếp tục** sang Bước 3:
   - Tích chọn "Tôi cam kết thông tin và minh chứng là trung thực."
   - Bấm **Nộp hồ sơ chính thức**.
4. Demo → Hộp thư → Lọc `21094501`.

Kết quả mong đợi:
- ☐ Khi điểm tự khai không đạt chuẩn BB: Khối điểm cảnh báo "Còn tiêu chí BB chưa đạt" kèm danh sách các tiêu chí không đạt điều kiện duy trì.
- ☐ Khi sửa lại giá trị hợp lệ: Khối điểm cập nhật "Đạt các tiêu chí BB theo tự khai", điểm tự khai tăng tương ứng.
- ☐ Nộp thành công: Hồ sơ chuyển sang trạng thái **Chờ duyệt**, có mã hồ sơ mới duy nhất.
- ☐ Hộp thư nhận email “Đã tiếp nhận hồ sơ HS-…” gửi đến địa chỉ email sinh viên IUH.

### L3. Giảng viên phụ trách duyệt hồ sơ duy trì & phân bổ chỉ tiêu (MAINTAIN_THEN_FILL)

1. Demo → Đồng hồ → đặt `15/11/2026 00:01` → Đợt chuyển sang "Đang xét duyệt hồ sơ" (`review`).
2. Đăng nhập nhanh `GV001` (GVPT) → **Duyệt hồ sơ** → Chọn đợt `Duy trì & Bổ sung K20 – HK2`.
3. Bấm **Xét duyệt / Xem** hồ sơ của Nam:
   - Xác minh **Hợp lệ** cho toàn bộ tiêu chí BB và UT, **Thành tích hợp lệ** cho các giải thưởng.
   - Bấm **Đạt điều kiện**.
4. Quay lại **Duyệt hồ sơ** → Bấm **Chốt & gửi phê duyệt**.
5. Quan sát kỹ bảng xem trước danh sách:
   - Cột Nhóm: Nam thuộc nhóm `RETAINED` (SV cũ giữ lại).
   - Dòng tóm tắt: "Chỉ tiêu 4 · SV cũ giữ lại 1 · Suất bổ sung 3".
   - Dòng của Nam có cột Đề xuất = `Có` (`proposed = true`), Xếp hạng = `1`.
6. Bấm **Xác nhận chốt, tạo phiên bản mới**.

Kết quả mong đợi:
- ☐ GVPT thẩm định được hồ sơ sinh viên cũ theo chuẩn duy trì.
- ☐ Thuật toán xếp hạng `MAINTAIN_THEN_FILL` phân bổ: Sinh viên cũ đạt chuẩn duy trì giữ vị trí ưu tiên số 1; 3 suất còn lại mở ra cho các ứng viên mới nộp bổ sung.
- ☐ Danh sách v1 được tạo và chuyển sang trạng thái "Chờ phê duyệt", bước Chủ nhiệm ngành đang chờ xử lý.

### L4. Phê duyệt 3 cấp, công bố và duy trì tư cách thành viên lớp

1. Đăng nhập nhanh `GV005` (CNN) → **Xác nhận danh sách** → Chọn đợt mới → **Xác nhận danh sách** → **Xác nhận**.
2. Đăng nhập nhanh `GV004` (BLĐ khoa) → **Phê duyệt danh sách** → Chọn đợt mới → **Phê duyệt danh sách** → **Xác nhận**.
3. Đăng nhập nhanh `GV900` (PĐT) → **Phê duyệt & Công bố** → Chọn đợt mới → **Xem danh sách** → **Phê duyệt & Công bố** → **Xác nhận**.
4. Đăng nhập nhanh `21094501` (Nam):
   - Mở **Hồ sơ của tôi**: Quan sát dòng thời gian chương trình và trạng thái hồ sơ.
   - Mở Tổng quan: Xem dòng thông tin sinh viên.

Kết quả mong đợi:
- ☐ Cả 3 cấp hoàn tất chuỗi phê duyệt theo đúng thứ tự (CNN → BLĐ khoa → PĐT).
- ☐ Đợt xét tuyển chuyển sang trạng thái "Đã công bố" và bất biến.
- ☐ Hồ sơ của Nam chuyển thành trạng thái **Trúng tuyển** (`confirmed`).
- ☐ Dòng thời gian của Nam cập nhật năm đào tạo mới: "Trúng tuyển · Năm 3: Đang học", tư cách thành viên lớp KSTN được duy trì liên tục.

---

## M. Quản lý hồ sơ sinh viên toàn diện và thẩm tra chỉ đọc (Records & Audit)

### M1. Tra cứu danh sách hồ sơ sinh viên toàn ngành/khoa

1. Đăng nhập nhanh `GV005` (CNN ngành KTPM) → Menu **Hồ sơ SV** (`#/app/records`).
2. Quan sát bảng danh sách sinh viên:
   - Bảng có các cột: MSSV (dạng thẻ CodeTag), Họ tên, Chương trình ("SV CN/KSTN" hoặc "Ứng viên").
   - Đối chiếu danh sách: Có Nam (`21094501`), Khoa (`21094518`), Bảo (`21094602`), Tú (`21094777`), Việt (`21094650`), Huy (`26010022`), Mai (`26010011`).
3. Kiểm tra phân quyền phạm vi dữ liệu:
   - Đăng nhập nhanh `GV002` (CNN ngành HTTT) → **Hồ sơ SV**.
   - Bảng chỉ liệt kê các sinh viên thuộc ngành Hệ thống thông tin (hoặc có hồ sơ nộp vào ngành HTTT), hoàn toàn KHÔNG thấy sinh viên thuộc ngành KTPM hay ngành Marketing (Khoa QTKD).

Kết quả mong đợi:
- ☐ CNN và BLĐ khoa truy cập được danh sách hồ sơ sinh viên trong phạm vi quản lý.
- ☐ Sinh viên thuộc lớp KSTN hiển thị nhãn "SV CN/KSTN", sinh viên chưa hoặc không còn thuộc lớp hiển thị "Ứng viên".
- ☐ Dữ liệu lọc nghiêm ngặt theo phạm vi ngành/khoa, không lộ sinh viên ngành khác.

### M2. Dòng thời gian học tập và lịch sử hồ sơ chi tiết (records/:id)

1. Tại tài khoản `GV005` → **Hồ sơ SV** → Bấm **Xem lịch sử** ở dòng Nguyễn Hoàng Nam (`21094501`).
2. Màn hình chi tiết sinh viên hiển thị:
   - Thẻ thông tin: `Nguyễn Hoàng Nam · 21094501 · 21094501@student.iuh.edu.vn`.
   - Khung Dòng thời gian (Timeline): Liệt kê từng năm học đã tham gia:
     + `2024–2025`: Tuyển sinh KSTN K20 · Điểm chính thức `140 điểm`.
     + `2025–2026`: Duy trì năm 2 · Điểm chính thức `170 điểm`.
     + `2026–2027`: Đợt R2 / Đợt duy trì · Điểm chính thức `190 điểm`.
   - Bảng danh sách các hồ sơ dự tuyển: Cột Mã hồ sơ (`HS-...`), Trạng thái (`confirmed` / Trúng tuyển), Điểm chính thức.

Kết quả mong đợi:
- ☐ Dòng thời gian hiển thị xuyên suốt lịch sử học tập qua các năm của sinh viên.
- ☐ Điểm số chính thức và các quyết định qua từng đợt được lưu trữ toàn vẹn, minh bạch.

### M3. Thẩm tra hồ sơ chỉ đọc và an toàn can thiệp điểm (records/application/:id)

1. Tại bảng danh sách hồ sơ của Nam, bấm nút **Xem chỉ đọc** ở một dòng hồ sơ (`#/app/records/application/...`).
2. Quan sát toàn bộ giao diện hồ sơ:
   - Thông tin cá nhân, lớp sinh hoạt, email IUH, ngày nộp.
   - Từng khối tiêu chí: Tên tiêu chí, Nhóm BB/UT, Giá trị tự khai, Điểm số, Danh sách tệp minh chứng.
   - Bấm xem một tệp minh chứng: Mở ngăn kéo Drawer xem được tài liệu.
   - Cuộn xuống phần dưới của trang:
     + Kiểm tra các nút xác minh: KHÔNG có nút "Hợp lệ", "Không hợp lệ", "Thành tích hợp lệ".
     + Kiểm tra ô nhập: KHÔNG có ô "Giá trị điều chỉnh", KHÔNG có ô nhập lý do/ý kiến thẩm định.
     + Kiểm tra nút ra quyết định: KHÔNG có các nút "Đạt điều kiện", "Yêu cầu bổ sung", "Không đạt", "Mở lại để xét duyệt".

Kết quả mong đợi:
- ☐ Giao diện mở ở chế độ CHỈ ĐỌC hoàn toàn.
- ☐ Cán bộ tra soát có thể thẩm tra toàn bộ hồ sơ và minh chứng mà không thể can thiệp điểm hay làm sai lệch dữ liệu đã thẩm định.

---

## N. Quản lý vòng đời ĐXT nâng cao, đính kèm văn bản và chuyển giai đoạn thủ công

### N1. Đóng tiếp nhận sớm thủ công & tự động hủy bản nháp (BR-04, U12) **[RESET]**

1. Đăng nhập nhanh `GV004` (BLĐ khoa CNTT) → **Đợt xét tuyển** → Chọn đợt `DXT-2026-01` (đang mở tiếp nhận).
2. Bấm nút **Đóng tiếp nhận sớm**:
   - Hiện hộp thoại xác nhận với ô "Lý do bắt buộc".
   - Thử để trống ô lý do → bấm **Xác nhận** → Bị chặn: "Vui lòng ghi lý do chuyển giai đoạn thủ công."
   - Nhập lý do: "Hội đồng tuyển sinh kết thúc nhận hồ sơ sớm để chuẩn bị xét duyệt" → Bấm **Xác nhận**.
3. Quan sát trạng thái đợt: Đợt chuyển sang "Đang xét duyệt hồ sơ" (`review`), xuất hiện nút "Duyệt hồ sơ".
4. Đăng nhập nhanh `26010011` (Hồ Ngọc Mai – người có bản nháp chưa nộp ở R1):
   - Mở **Hồ sơ của tôi**: Hồ sơ R1 chuyển từ "Bản nháp" sang **Đã hủy** (`cancelled`).
   - Trang không còn cho phép nộp hay chỉnh sửa hồ sơ này nữa.

Kết quả mong đợi:
- ☐ Chuyển giai đoạn thủ công yêu cầu bắt buộc phải có lý do (phục vụ kiểm toán).
- ☐ ĐXT chuyển trạng thái chính xác từ `open` sang `review`.
- ☐ Mọi bản nháp chưa kịp nộp trong đợt bị hệ thống tự động hủy an toàn theo đúng quy tắc BR-04.

### N2. Ràng buộc xóa ĐXT theo trạng thái vòng đời (State Machine Enforce)

1. `GV004` → **Đợt xét tuyển**:
   - Lọc tab **Nháp**: Mở đợt `DXT-2026-07`. Quan sát: Có nút **Xóa** màu đỏ (`dangerOutline`).
   - Bấm **Xóa** → Hiện ConfirmDialog "Xóa ĐXT?" → Bấm **Hủy**.
2. Lọc tab **Chưa mở**: Mở đợt `DXT-2026-06`. Quan sát: Có nút **Xóa** màu đỏ.
3. Lọc tab **Đang tiếp nhận**: Mở một đợt đang mở tiếp nhận. Quan sát: KHÔNG có nút Xóa.
4. Mở đợt đang xét duyệt (`DXT-2026-02`) hoặc đợt đã công bố (`DXT-2025-01`). Quan sát: KHÔNG có nút Xóa.

Kết quả mong đợi:
- ☐ Chỉ cho phép xóa ĐXT khi ở trạng thái Nháp (`draft`) hoặc Chưa mở (`upcoming`).
- ☐ Khi ĐXT đã bắt đầu tiếp nhận hồ sơ, xét duyệt, phê duyệt hoặc đã công bố, nút Xóa hoàn toàn bị ẩn để bảo đảm toàn vẹn dữ liệu.

### N3. Đính kèm tờ trình / văn bản pháp lý trong chuỗi phê duyệt 3 cấp

1. Sau khi chốt danh sách R2 (tại **C4**):
2. Đăng nhập nhanh `GV005` (CNN) → **Xác nhận danh sách** → Chọn `DXT-2026-02`:
   - Nhập ý kiến xác nhận: "Đã rà soát đủ 4 hồ sơ hợp lệ".
   - Tại khung "Tệp đính kèm phê duyệt" (`EvidenceUploader`), bấm tải lên 1 tệp PDF tờ trình (ví dụ `to-trinh-nganh-ktpm.pdf`).
   - Bấm **Xác nhận danh sách** → **Xác nhận**.
3. Đăng nhập nhanh `GV004` (BLĐ khoa) → **Phê duyệt danh sách** → Chọn `DXT-2026-02`:
   - Phía dưới bảng danh sách xuất hiện nút liên kết: **Tệp đính kèm phê duyệt Chủ nhiệm ngành**.
   - Bấm vào nút này: Mở ngăn kéo Drawer xem nội dung tệp `to-trinh-nganh-ktpm.pdf`. Đóng Drawer.
   - Tải tệp văn bản phê duyệt cấp khoa `quyet-dinh-khoa-cntt.pdf`, nhập ý kiến và bấm **Phê duyệt danh sách** → **Xác nhận**.
4. Đăng nhập nhanh `GV900` (PĐT):
   - Mở đợt `DXT-2026-02`: Thấy cả hai nút liên kết tệp đính kèm của CNN và BLĐ khoa, bấm mở xem được cả hai tệp.

Kết quả mong đợi:
- ☐ Cho phép đính kèm văn bản/tờ trình pháp lý tại từng bước phê duyệt.
- ☐ Các cấp phê duyệt tiếp theo và người xem lại danh sách có thể tra cứu và xem trực tiếp văn bản đính kèm qua Drawer.

---

## O. Quy tắc nghiệp vụ biên, tiêu chuẩn minh chứng và kiểm tra tệp tải lên

### O1. Ràng buộc tham chiếu tiêu chí: Tiêu chí UT tham chiếu tiêu chí BB bị INVALID (Quyết định A-03) **[RESET]**

1. Đăng nhập nhanh `GV001` → **Duyệt hồ sơ** → Chọn đợt `DXT-2026-02` → Mở hồ sơ của Trần Minh Khoa (`21094518`).
2. Quan sát 2 tiêu chí liên quan:
   - Tiêu chí BB "Tiếng Anh": Điểm tự khai `600`, điểm chuẩn = `20` điểm.
   - Tiêu chí UT "Tiếng Anh nâng cao": Tham chiếu giá trị của tiêu chí "Tiếng Anh", điểm tự khai = `20` điểm (vượt chuẩn).
3. Tại tiêu chí BB "Tiếng Anh", bấm nút **Không hợp lệ** (`INVALID`):
   - Quan sát tiêu chí "Tiếng Anh": Trở thành 0 điểm.
   - Quan sát tiêu chí UT "Tiếng Anh nâng cao": Điểm số tự động chuyển thành **0 điểm** (không tính điểm ưu tiên khi tiêu chí bắt buộc không hợp lệ).
   - Khung đầu trang: Điểm chính thức giảm tương ứng 40 điểm (20 BB + 20 UT), hiện cảnh báo "Hồ sơ chưa đạt tiêu chí bắt buộc: Tiếng Anh".
4. Bấm lại **Hợp lệ** cho tiêu chí "Tiếng Anh": Cả hai tiêu chí được khôi phục điểm số bình thường.

Kết quả mong đợi:
- ☐ Hệ thống tự động triệt tiêu điểm của tiêu chí ưu tiên tham chiếu khi tiêu chí bắt buộc bị đánh giá không hợp lệ (tuân thủ nguyên tắc A-03).
- ☐ Ngăn ngừa sai lệch logic nghiệp vụ: không thể vừa bị coi là không hợp lệ ở tiêu chuẩn bắt buộc vừa được thưởng điểm ưu tiên ở tiêu chuẩn nâng cao.

### O2. Kiểm tra bộ thẩm định tệp tải lên (Magic bytes, giả mạo đuôi file, tệp rỗng, giới hạn cấu hình)

1. Chuẩn bị các tệp thử nghiệm:
   - Tệp 1: Một tệp văn bản hoặc script `.sh` đổi đuôi thành `.pdf`.
   - Tệp 2: Một tệp rỗng 0 bytes đặt tên `empty.pdf`.
   - Tệp 3: Tệp PDF hợp lệ dung lượng khoảng 3 MB.
2. Đăng nhập nhanh `quantri` → **Cấu hình hệ thống**:
   - Sửa "Dung lượng tối đa mỗi tệp (MB)" thành `2` → **Lưu cấu hình**.
3. Đăng nhập nhanh `26010011` → Vào bản nháp R1 → Bước 2:
   - Tải Tệp 1 vào ô minh chứng GPA: Hệ thống đọc magic bytes thực tế và báo lỗi: "Nội dung tệp không khớp định dạng."
   - Tải Tệp 2 (0 bytes): Báo lỗi tệp không hợp lệ hoặc rỗng.
   - Tải Tệp 3 (3 MB): Báo lỗi: "Tệp vượt quá 2 MB cho phép."
   - Tải tệp PDF hợp lệ < 2 MB: Tải lên thành công, xuất hiện nút "Xem" và tên tệp hiển thị màu xanh.
4. `quantri` → Trả lại cấu hình dung lượng thành `10` MB → **Lưu cấu hình**.

Kết quả mong đợi:
- ☐ Bộ kiểm tra tệp phát hiện chính xác việc đổi đuôi giả mạo thông qua magic bytes thực.
- ☐ Chặn tệp rỗng và tệp vượt quá dung lượng cấu hình động của hệ thống.

### O3. Bảo mật thông tin kết quả công khai và tính bất biến sau công bố (BR-03, BR-10, Q2)

1. Đăng xuất ra trang chủ: Mở menu **Tra cứu kết quả** → Chọn tab **Đã công bố** → Chọn đợt `DXT-2025-01` (hoặc mở URL `#/ket-qua/DXT-2025-01`).
2. Kiểm tra danh sách kết quả hiển thị công khai:
   - Cột MSSV: Bị che 4 ký tự ở giữa (ví dụ `26****01`, `26****02`).
   - Cột Họ tên: Viết tắt chữ lót và tên đệm (ví dụ `N. V. An`, `T. T. Bình`).
   - Hoàn toàn KHÔNG hiển thị: Điểm chi tiết từng tiêu chí, số điện thoại, email, địa chỉ sinh hoạt.
3. Đăng nhập nhanh `quantri` hoặc `GV004` → Mở đợt `DXT-2025-01`:
   - Kiểm tra các nút thao tác: Hoàn toàn KHÔNG có nút Sửa, Phát hành, Mở tiếp nhận, Đóng tiếp nhận, Xóa.
   - Khung thông báo: "ĐXT đã công bố và bất biến".

Kết quả mong đợi:
- ☐ Kết quả công khai tuân thủ tuyệt đối quy định bảo vệ dữ liệu cá nhân (che MSSV và họ tên).
- ☐ Mọi đợt xét tuyển sau khi công bố đều trở thành bất biến vĩnh viễn (immutable).

---

## P. Tự động lưu nháp, đồng bộ đa phiên và phục hồi sau sự cố

### P1. Cơ chế tự lưu nháp (Auto-save) và cảnh báo rời trang an toàn

1. Đăng nhập nhanh `26010011` (Hồ Ngọc Mai) → Mở bản nháp R1 (`#/app/my-applications/...`).
2. Bước 1: Sửa số điện thoại từ số cũ thành `0912345678`.
   - Quan sát dòng trạng thái ngay góc trái dưới: Hiện ngay dòng chữ màu xám "Có thay đổi chưa lưu".
   - Dừng gõ bàn phím và quan sát: Sau đúng 1.5 giây, dòng trạng thái tự chuyển thành "Đã lưu nháp".
3. Sửa tiếp ô Lớp sinh hoạt thành `DHKTPM18A`.
   - Ngay lập tức khi chữ còn đang gõ, bấm vào mục **Thông báo** trên thanh menu bên trái.
   - Quan sát: Trình duyệt bị chặn điều hướng, xuất hiện hộp thoại xác nhận:
     "Rời trang khi chưa lưu? Bạn còn thay đổi chưa được lưu. Chọn Hủy để quay lại lưu hồ sơ."
   - Bấm **Hủy**: Vẫn ở lại form nộp hồ sơ, dữ liệu vừa gõ không bị mất, sau đó hệ thống tự lưu nháp.

Kết quả mong đợi:
- ☐ Chức năng tự lưu nháp tự động kích hoạt sau 1.5 giây ngừng thao tác, không cần bấm nút thủ công.
- ☐ Cơ chế Navigation Guard ngăn chặn người dùng vô tình rời khỏi trang khi dữ liệu chưa kịp đồng bộ.

### P2. Hàng đợi email lỗi và cơ chế thử lại lũy đẳng theo scheduler (Quyết định A-01) **[RESET]**

1. Đăng nhập nhanh `quantri` → **Hàng đợi email** (`#/app/email-outbox`).
2. Bảng hiển thị danh sách email, lọc tab **Gửi lỗi** (`FAILED`):
   - Có email gửi tới địa chỉ `fail.26010022@student.iuh.edu.vn`, cột Số lần thử ghi `1 · SMTP 550: Mailbox unavailable (mô phỏng)`.
3. Bấm **Gửi lại**:
   - Email được thử lại ngay, số lần thử tăng lên `2`.
4. Mở Demo → Đồng hồ mô phỏng:
   - Giữ nguyên giờ mô phỏng hiện tại, bấm nút **Đặt giờ** lại một lần nữa.
   - Kiểm tra Hàng đợi email: Email lỗi KHÔNG bị thử lại thêm một lần nữa ở cùng một mốc thời gian (bảo đảm tính lũy đẳng idempotent).
   - Đặt đồng hồ sang thời điểm khác (+1 giờ): Tác vụ định kỳ mới tiến hành kiểm tra lại email theo cấu hình `maxAttempts`.

Kết quả mong đợi:
- ☐ Cơ chế thử lại email hoạt động chính xác, ghi nhận đầy đủ số lần thử và nhật ký lỗi.
- ☐ Scheduler tuân thủ nguyên tắc A-01: không thử lại trùng lặp trong cùng một tick thời gian mô phỏng.

### P3. Xuất sao lưu JSON database và khôi phục toàn vẹn dữ liệu

1. Tại bất kỳ trang nào, mở Demo panel (nút góc trái dưới):
   - Chọn tab **Dữ liệu**.
   - Bấm nút **Xuất JSON db**: Trình duyệt tải về tệp tin có tên dạng `kstn-prototype-v3.json`.
   - Mở tệp vừa tải bằng trình soạn thảo hoặc xem kích thước: Tệp chứa đầy đủ toàn bộ cây dữ liệu mô phỏng (`users`, `rounds`, `applications`, `criteriaSets`, `auditLogs`, `clock`, `counters`).
2. Thử thực hiện một thay đổi lớn: Đăng nhập `quantri`, tạo thêm một Khoa mới, hoặc xóa một đợt nháp.
3. Mở Demo → **Dữ liệu** → Bấm **Khôi phục dữ liệu mẫu**:
   - Hộp thoại cảnh báo xuất hiện xác nhận việc xóa sạch dữ liệu phiên hiện tại và dọn dẹp IndexedDB.
   - Bấm **Xác nhận**:
     + Hệ thống tự động xóa sạch dữ liệu thay đổi trong `localStorage` và tệp minh chứng trong `IndexedDB`.
     + Tự động đăng xuất tài khoản về trạng thái ban đầu.
     + Đồng hồ mô phỏng quay trở về đúng `09:00 ngày 09/11/2026`.
     + Dữ liệu mẫu ban đầu được tái tạo hoàn toàn nhất quán.

Kết quả mong đợi:
- ☐ Xuất dữ liệu JSON snapshot thành công, lưu giữ toàn bộ trạng thái hệ thống.
- ☐ Khôi phục dữ liệu mẫu hoạt động tức thì, loại bỏ triệt để các tác dụng phụ sau buổi kiểm thử.

---

## Q. Bảng tổng hợp kết quả kiểm thử toàn diện

| Kịch bản kế hoạch / Nghiệp vụ | Mục trong tài liệu này | Đạt / Không đạt | Ghi chú |
|---|---|---|---|
| U1 Đăng ký + nộp hồ sơ | A1, B1 | | |
| U2 Mạo danh MSSV | A2 | | |
| U3 MSSV đã có tài khoản | A3 | | |
| U4 Bổ sung trong hạn / quá hạn | C1, C5 | | |
| U5 Khoa trả về danh sách | D2 | | |
| U6 PĐT công bố | D3 | | |
| U7 Buộc đổi mật khẩu | A8 | | |
| U8 Phiên bản bộ tiêu chí | G3 | | |
| U9 SV cũ không nộp hồ sơ | D4 | | |
| U10 Duyệt ngoài phạm vi | C6 | | |
| U11 Đa vai trò | A9 | | |
| U12 Tự chuyển trạng thái | E1, N1 | | |
| U13 Trúng hai lớp | D5 | | |
| U14 Đồng hạng | D1 | | |
| U15 GVPT đặt lại MK SV | H4 | | |
| Cổng P3 (xác thực & tài khoản) | A4–A7, A10, A11 | | |
| Cổng P4 (danh mục, lớp, quyền) | H1–H5 | | |
| Cổng P5 (bộ tiêu chí) | G1–G3, O1 | | |
| Cổng P6 (đợt xét tuyển) | F1–F4, N1–N3 | | |
| Cổng P7 (cổng sinh viên) | B1–B5, L1–L2, P1 | | |
| Cổng P8 (duyệt, chốt danh sách) | C2–C4, L3, O1 | | |
| Cổng P9 (phê duyệt, công bố) | D1–D5, I6, L4, N3, O3 | | |
| Cổng P10 (vận hành hệ thống) | I1–I7, P2, P3 | | |
| Luồng C trọn chuỗi (duy trì & bổ sung) | L1–L4 | | |
| Quản lý hồ sơ SV & Thẩm tra chỉ đọc | M1–M3 | | |
| Vòng đời ĐXT & Chuyển giai đoạn thủ công | N1–N3 | | |
| Quy tắc biên & Kiểm tra tệp tải lên | O1–O3 | | |
| Tự lưu nháp & Phục hồi sự cố | P1–P3 | | |
| Giao diện, tương thích màn hình & A11y | K | | |

Khi gặp lỗi trong quá trình kiểm thử, vui lòng ghi lại: mục đang test, tài khoản đang đăng nhập, giờ mô phỏng hiện tại, thao tác cuối cùng thực hiện, thông báo lỗi hiển thị, ảnh chụp màn hình và log Console. Sau đó vào Demo → Dữ liệu → **Xuất JSON db** để lưu trạng thái dữ liệu phục vụ tái hiện lỗi.

---

## R. Giới hạn đã biết (không phải lỗi cần báo)

Những điểm sau khác với mô tả chi tiết ở §9 của kế hoạch nhưng không chặn luồng nghiệp vụ nào; được giữ nguyên trong bản prototype này:

- Phần đăng ký dùng **một** thông báo chung cho cả hai lỗi email (sai miền / không chứa MSSV) thay vì hai câu riêng biệt.
- Form tạo đợt không tự gợi ý tên đợt; ô GVPT của form tạo lớp liệt kê cả giảng viên khoa khác (service vẫn kiểm tra phạm vi khi lưu).
- Trang chi tiết đợt chưa có tab “Nhật ký” và khối thống kê hồ sơ riêng — xem ở **Nhật ký** và **Báo cáo**.
- Trang Phê duyệt danh sách hiển thị dạng bảng (không phải thẻ); sau khi trả về, thanh 3 cấp không ghi riêng nhãn “Đã trả về” cho cấp đã trả (xem ở lịch sử phê duyệt bên dưới và ô phiên bản).
- Mỗi lần tự lưu nháp thêm một dòng “Lưu nháp” vào lịch sử hồ sơ.
- Sinh viên rút hồ sơ rồi nộp lại trong cùng đợt được xếp Luồng B (vì đã có lịch sử nộp) — đúng theo quy tắc phân luồng ở §6.6.
- Email gửi tới địa chỉ chứa chuỗi `fail` luôn lỗi kể cả khi “Gửi lại” (mô phỏng D-21). Đổi “Chuỗi mô phỏng email lỗi” ở Cấu hình hệ thống nếu muốn thấy gửi lại thành công.
- Không có backend, email thật, chữ ký số, nhập điểm từ PĐT, “quyết định điều chỉnh” sau công bố (ngoài phạm vi prototype, §1.2).
