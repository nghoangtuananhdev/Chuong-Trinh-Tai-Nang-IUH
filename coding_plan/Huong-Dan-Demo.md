# HƯỚNG DẪN DEMO — WEB XÉT TUYỂN KSTN/CNTN IUH

> Bản rút gọn của `coding_plan/UAT-TEST-GUIDE.md`, dùng để trình bày với giảng viên.
> Mỗi mục gồm: **tài khoản → thao tác → điều cần cho giảng viên thấy**. Chi tiết kiểm thử đầy đủ xem ở bản gốc (mã mục ghi trong ngoặc, ví dụ `A1`, `C2`).

**Viết tắt:** ĐXT = đợt xét tuyển · GVPT = giảng viên phụ trách lớp · CNN = chủ nhiệm ngành · BLĐ khoa = ban lãnh đạo khoa · PĐT = Phòng Đào tạo · BB/UT = tiêu chí bắt buộc / ưu tiên.

---

## 0. Chuẩn bị

### Khởi động

```bash
bash run.sh        # mở http://127.0.0.1:5173/  (Windows: RUN.bat)
```

Dùng Chrome/Edge, cửa sổ rộng từ 1280px. Chuẩn bị sẵn: 1 tệp PDF nhỏ, 1 ảnh PNG/JPG, 1 tệp `.docx`, 1 tệp PDF trên 10 MB.

### Bảng điều khiển demo (nút ở góc trái dưới mọi trang)

| Tab | Dùng để |
|---|---|
| **Đồng hồ** | Đặt giờ mô phỏng. Mỗi lần đổi giờ, hệ thống tự chạy việc định kỳ (mở/đóng đợt, quá hạn, gửi email). |
| **Hộp thư mô phỏng** | Xem email hệ thống gửi đi. **Lấy mã OTP, mật khẩu tạm, link đặt lại mật khẩu ở đây.** |
| **Đăng nhập nhanh** | Gõ username → **Đăng nhập**, không cần mật khẩu. |
| **Dữ liệu** | **Khôi phục dữ liệu mẫu** = đưa mọi thứ về ban đầu. |

### Quy ước

- **[RESET]** = bấm Demo → Dữ liệu → **Khôi phục dữ liệu mẫu** trước khi làm. Mục không ghi [RESET] thì làm tiếp trên dữ liệu của mục ngay trước.
- Sau reset, đồng hồ là **09:00 ngày 09/11/2026**. Tua ngược đồng hồ không hoàn tác được, muốn quay lại phải reset.
- Mật khẩu mọi tài khoản mẫu: `demo1234`.

### Tài khoản mẫu

| Username | Người dùng | Vai trò |
|---|---|---|
| `quantri` | Quản trị viên | Quản trị hệ thống |
| `GV900` | Nguyễn Minh Anh | PĐT – toàn trường |
| `GV004` | PGS.TS. Lê Hoàng | BLĐ khoa CNTT |
| `GV005` | TS. Trần Ngọc Bình | CNN ngành KTPM, kiêm GVPT lớp K22 |
| `GV002` | TS. Nguyễn Văn Hải | CNN ngành HTTT |
| `GV001` | ThS. Phạm Thị Dung | GVPT lớp KSTN-KTPM-K20 |
| `GV006` | ThS. Ngô Thu Trang | GVPT lớp KSTN-HTTT-K21 |
| `GV009` | ThS. Đặng Thu Hà | GVPT, bị buộc đổi mật khẩu |
| `GV003` | ThS. Lê Minh Tâm | GVPT lớp K21 (dùng để thử khóa tài khoản) |
| `21094501` | Nguyễn Hoàng Nam | SV KSTN K20, hồ sơ R2 đã đạt 190 điểm |
| `21094518` | Trần Minh Khoa | SV KSTN K20, hồ sơ R2 chờ duyệt |
| `21094602` | Võ Gia Bảo | SV KSTN K20, hồ sơ R2 cần bổ sung (hạn 09:00 12/11) |
| `21094777` | Lý Thanh Tú | SV KSTN K20, chưa nộp hồ sơ R2 |
| `22073210` | Phạm Gia Hân | Ứng viên, từng không trúng tuyển |
| `26010011` | Hồ Ngọc Mai | Ứng viên, có bản nháp ở R1 |
| `26010022` | Trương Gia Huy | Ứng viên, email luôn gửi lỗi (mô phỏng) |

MSSV chưa có tài khoản để thử đăng ký: `26019999` / `khang.26019999@student.iuh.edu.vn`.

### Các đợt xét tuyển mẫu

| Đợt | Lớp | Trạng thái sau reset | Dùng để demo |
|---|---|---|---|
| R1 `DXT-2026-01` | KSTN-KTPM-K22 | Đang tiếp nhận hồ sơ | Nộp hồ sơ |
| R2 `DXT-2026-02` | KSTN-KTPM-K20 | Đang xét duyệt | Duyệt, chốt, công bố trọn chuỗi |
| R3 `DXT-2026-03` | KSTN-KTPM-K21 | Chờ CNN xác nhận | Đồng hạng |
| R4 `DXT-2026-04` | KSTN-HTTT-K21 | Chờ BLĐ khoa | Trả về danh sách |
| R5 `DXT-2026-05` | CNTN-MKT-K20 | Chờ PĐT | Công bố |
| R6 `DXT-2026-06` | CNTN-MKT-K22 | Chưa mở (mở 00:00 15/11) | Tự mở theo đồng hồ |
| R7 `DXT-2026-07` | KSTN-KHDL-K22 | Nháp | Phát hành |

### Quy trình tổng quát (nên nói trước khi demo)

```
Sinh viên nộp hồ sơ → GVPT duyệt từng hồ sơ và chốt danh sách
→ CNN xác nhận → BLĐ khoa phê duyệt → PĐT phê duyệt & công bố
```

Ba luồng hồ sơ: **A** – đăng ký mới · **B** – đã từng nộp, nộp lại · **C** – sinh viên đang học lớp KSTN nộp để duy trì.

### Nếu thời gian ngắn

Làm theo thứ tự: **1.1 → 2 (trọn chuỗi R2) → 3.2 (trả về) → 4 (luồng C) → 6.2 (xem trước điểm)**. Các mục còn lại trình bày khi giảng viên hỏi.

---

## 1. Sinh viên: đăng ký, nộp, sửa, rút hồ sơ

### 1.1 Đăng ký tài khoản và nộp hồ sơ (A1, B1) **[RESET]**

1. Trang chủ → thẻ `DXT-2026-01` → **Nộp hồ sơ** → **Đăng ký bằng email IUH**.
2. Nhập MSSV `26019999`, email `khang@gmail.com` → **Gửi mã OTP** → bị từ chối (chỉ nhận email `@student.iuh.edu.vn` chứa đúng MSSV).
3. Nhập lại email `khang.26019999@student.iuh.edu.vn` → **Gửi mã OTP** → lấy mã ở Hộp thư (lọc `khang`) → **Xác nhận OTP**.
4. Nhập SĐT, mật khẩu `khang1234` → **Tạo tài khoản**. Hệ thống tự đăng nhập và mở form nộp hồ sơ R1.
5. Bước 1: xem thông tin cá nhân → **Tiếp tục**.
6. Bước 2: GPA `3.5`, Tiếng Anh `600`. Tải minh chứng: thử tệp `.docx` và tệp trên 10 MB (bị từ chối), rồi tải PDF hợp lệ. **Thêm thành tích** “Olympic Tin học”, mức “Giải Nhất · 40 điểm”, tải 1 PDF.
7. Bước 3: tích cam kết → **Nộp hồ sơ chính thức**.

**Cho giảng viên thấy:**
- Họ tên, ngày sinh, lớp của sinh viên được lấy sẵn từ danh bạ trường; form ghi “Luồng A – Đăng ký mới”.
- Mỗi tiêu chí hiện rõ các mức điểm. “Điểm dự kiến” tính ngay khi nhập: **120 điểm, BB đạt 2/2**.
- Hồ sơ tự lưu nháp sau vài giây ngừng thao tác.
- Nộp xong: trạng thái **Chờ duyệt**, có mã `HS-2026-…`, Hộp thư có email “Đã tiếp nhận hồ sơ”.

### 1.2 Sửa, rút và nộp lại hồ sơ (B2) — làm tiếp sau 1.1

1. Nhấn F5 → vẫn đăng nhập, dữ liệu và tệp còn nguyên.
2. **Tiếp tục** → sửa GPA thành `3.7` → **Lưu chỉnh sửa** → điểm dự kiến thành **130**, “Lịch sử xử lý” có dòng “Chỉnh sửa hồ sơ”.
3. **Rút hồ sơ** → **Xác nhận** → trạng thái **Đã rút**.
4. **Đợt xét tuyển đang mở** → **Nộp hồ sơ** ở R1 → tạo được hồ sơ mới, lần này mang nhãn Luồng B.

### 1.3 Bản nháp và cảnh báo rời trang (B3, P1) **[RESET]**

1. Đăng nhập nhanh `26010011` (Mai) → Tổng quan có khung “Bạn còn bản nháp chưa nộp” → bấm mã hồ sơ.
2. Sửa một giá trị rồi bấm ngay sang menu khác → hiện hộp “Rời trang khi chưa lưu?”.
3. Quay lại hồ sơ → **Hủy nháp** → **Xác nhận** → hồ sơ chuyển **Đã hủy**.

### 1.4 Sinh viên KSTN không nộp được lớp khác (B4) **[RESET]**

1. Đăng nhập nhanh `21094501` (Nam). Menu **không có** “Đợt xét tuyển đang mở”.
2. Đổi URL thành `#/` → thẻ R1 ghi “Bạn đang học lớp CN/KSTN khác.” thay cho nút Nộp hồ sơ.
3. **Hồ sơ của tôi** → “Dòng thời gian chương trình” liệt kê 3 năm học với điểm từng năm (140, 170, 190).

### 1.5 Tra cứu kết quả cá nhân bằng OTP (I6) **[RESET]**

1. Trang chủ → **Tra cứu kết quả** → MSSV `22073210`, email `22073210@student.iuh.edu.vn` → **Gửi mã OTP** → lấy mã ở Hộp thư → **Xác nhận và tra cứu**.

**Cho giảng viên thấy:** không cần đăng nhập vẫn tra được; đợt đã công bố hiện kết quả và điểm, đợt chưa công bố chỉ ghi “Chưa công bố”; trang chỉ đọc.

---

## 2. Luồng chính: duyệt hồ sơ → chốt → phê duyệt 3 cấp → công bố (đợt R2)

Đây là phần quan trọng nhất. Làm liền một mạch từ 2.1 đến 2.5.

### 2.1 Sinh viên bổ sung hồ sơ (C1) **[RESET]**

1. Đăng nhập nhanh `21094602` (Bảo) → bấm mã hồ sơ trong khung “Hồ sơ cần bổ sung”.
2. Không sửa gì: **Tiếp tục** → **Gửi bổ sung** → bị từ chối (phải sửa giá trị hoặc minh chứng trước).
3. **Quay lại** → tải thêm 1 tệp minh chứng → **Tiếp tục** → **Gửi bổ sung**.

**Cho giảng viên thấy:** khung vàng ghi nội dung yêu cầu, hạn “09:00 12/11/26” và đếm ngược; gửi xong hồ sơ về **Chờ duyệt**.

### 2.2 GVPT xác minh và ra quyết định (C2, C3)

1. Đăng nhập nhanh `GV001` → **Duyệt hồ sơ** (đợt `DXT-2026-02`). Nút **Chốt & gửi phê duyệt** đang khóa vì còn hồ sơ chờ duyệt.
2. Mở hồ sơ **Trần Minh Khoa**. Đầu trang ghi “Điểm tự khai 190 → chính thức 130”. Bấm tên một tệp minh chứng để xem.
3. Tiêu chí “GPA năm 2”: nhập `3.45` vào “Giá trị điều chỉnh”, để trống ý kiến, bấm **Hợp lệ** → bị yêu cầu ghi lý do. Nhập lý do → **Hợp lệ**.
4. Bấm **Hợp lệ** cho các tiêu chí còn lại và **Thành tích hợp lệ** cho từng thành tích → điểm chính thức lên **190** → bấm **Đạt điều kiện**.
5. Mở hồ sơ **Phạm Gia Hân**: bấm **Không đạt** khi chưa ghi ý kiến → bị từ chối. Xác minh **Hợp lệ** hết → **Đạt điều kiện**.
6. Mở hồ sơ **Võ Gia Bảo**: xác minh hết → **Đạt điều kiện**.

**Cho giảng viên thấy:**
- Điểm chính thức chỉ tính phần đã được GVPT xác minh.
- Sửa giá trị của sinh viên, từ chối, mở lại hồ sơ đều **bắt buộc ghi lý do**.
- Cuối trang có lịch sử: ai làm gì, lúc nào, với vai trò nào.

### 2.3 Chốt danh sách (C4)

1. **Duyệt hồ sơ** → **Chốt & gửi phê duyệt** → xem bản xem trước → **Xác nhận chốt, tạo phiên bản mới**.

**Cho giảng viên thấy:** “Chỉ tiêu 4 · SV cũ giữ lại 3 · Suất bổ sung 1”. Nam, Bảo, Khoa (sinh viên cũ) và Hân (mới) được đề xuất. Danh sách v1 ở trạng thái “Chờ phê duyệt”, đang chờ CNN.

### 2.4 Phê duyệt 3 cấp, có đính kèm tờ trình (D4, N3)

1. `GV005` (CNN) → **Xác nhận danh sách** → `DXT-2026-02` → nhập ý kiến, tải 1 PDF tờ trình ở khung “Tệp đính kèm phê duyệt” → **Xác nhận danh sách** → **Xác nhận**.
2. `GV004` (BLĐ khoa) → **Phê duyệt danh sách** → `DXT-2026-02` → bấm **Tệp đính kèm phê duyệt Chủ nhiệm ngành** để xem tờ trình → **Phê duyệt danh sách** → **Xác nhận**.
3. `GV900` (PĐT) → **Phê duyệt & Công bố** → `DXT-2026-02` → **Phê duyệt & Công bố** → đọc hộp xác nhận → **Xác nhận**.

**Cho giảng viên thấy:**
- Mỗi cấp chỉ có nút hành động khi tới lượt mình; cấp trước xong thì cấp sau nhận thông báo ở chuông.
- Hộp công bố nêu rõ hậu quả: 4 sinh viên trúng tuyển, 1 sinh viên bị loại khỏi lớp, 6 email được gửi, đợt trở thành bất biến.

### 2.5 Kết quả sau công bố (D4, O3)

1. Mở `#/ket-qua/DXT-2026-02` → 4 dòng, MSSV và họ tên đã được che (dạng `26****07`, `Đ. M. Thư`).
2. Đăng nhập nhanh `21094501` (Nam) → **Hồ sơ của tôi** → năm 2026–2027 ghi “Trúng tuyển · Năm 3: Đang học”.
3. Đăng nhập nhanh `21094777` (Tú, không nộp hồ sơ) → Tổng quan ghi “Ứng viên (chưa thuộc lớp CN/KSTN)”; Hộp thư có email kết quả duy trì với lý do “Không nộp hồ sơ tích lũy”.
4. Mở lại đợt R2 → không còn nút Sửa/Phát hành/Xóa, có khung “ĐXT đã công bố và bất biến”.

---

## 3. Các tình huống đặc biệt khi duyệt và phê duyệt

### 3.1 Đồng hạng — CNN phải chọn (D1) **[RESET]**

1. `GV005` → **Xác nhận danh sách** → `DXT-2026-03` → **Xem danh sách**. Có cảnh báo “2 hồ sơ đồng hạng tranh 1 suất cuối”.
2. Tích ô “Đồng hạng T1” của **Trương Gia Huy** → **Xác nhận danh sách** → **Xác nhận**.
3. `GV004` → **Phê duyệt danh sách** → `DXT-2026-03`.

**Cho giảng viên thấy:** nút xác nhận chỉ mở khi chọn đúng 1 hồ sơ; BLĐ khoa thấy lựa chọn của CNN nhưng không sửa được.

### 3.2 BLĐ khoa trả về danh sách (D2) **[RESET]**

1. `GV004` → **Phê duyệt danh sách** → `DXT-2026-04`. Bấm **Trả về** khi chưa ghi ý kiến → bị từ chối.
2. Nhập ý kiến “Cần rà soát lại minh chứng tiếng Anh” → **Trả về** → **Xác nhận**.
3. `GV006` (GVPT) → bấm chuông → thông báo “Danh sách bị trả về” → đọc được lý do.
4. `GV006` → **Duyệt hồ sơ** → đợt `DXT-2026-04` → **Chốt & gửi phê duyệt** → **Xác nhận chốt…**
5. `GV002` (CNN HTTT) → **Xác nhận danh sách** → `DXT-2026-04` → có nút xác nhận cho phiên bản mới.

**Cho giảng viên thấy:** danh sách có phiên bản (v1, v2, v3); trả về thì đợt quay lại “Đang xét duyệt hồ sơ”; chốt lại tạo phiên bản mới và phải đi lại từ CNN. Lịch sử phê duyệt giữ đủ ai, khi nào, ý kiến gì.

### 3.3 PĐT công bố một đợt đang chờ (D3) **[RESET]**

1. `GV900` → Tổng quan có “1 danh sách chờ bạn” → **Phê duyệt & Công bố** → `DXT-2026-05` → **Xem danh sách** → **Phê duyệt & Công bố** → **Xác nhận**.
2. Mở `#/ket-qua/DXT-2026-05`; về trang chủ lọc tab **Đã công bố**.

**Cho giảng viên thấy:** 3 sinh viên trúng tuyển, 1 sinh viên bị loại; 4 email kết quả nằm trong Hộp thư. Đây là cách nhanh nhất để minh họa bước công bố nếu không kịp làm trọn Phần 2.

### 3.4 Quá hạn bổ sung (C5) **[RESET]**

1. Demo → Đồng hồ → đặt `12/11/2026 09:01` → **Đặt giờ**.
2. Đăng nhập nhanh `21094602` → **Hồ sơ của tôi**.

**Cho giảng viên thấy:** hồ sơ của Bảo tự chuyển **Không đạt**, có email “quá hạn bổ sung”, form chỉ còn đọc.

### 3.5 Trúng tuyển hai lớp trong cùng năm học (D5) **[RESET]**

1. Hoàn tất R3: `GV005` chọn Huy ở nhóm đồng hạng và xác nhận (như 3.1) → `GV004` phê duyệt → `GV900` công bố. Huy trúng tuyển lớp K21.
2. `GV004` → **Đợt xét tuyển** → `DXT-2026-01` → **Đóng tiếp nhận sớm** → nhập lý do → **Xác nhận**.
3. `GV005` (vai trò CNN) → **Duyệt hồ sơ ngành** → `DXT-2026-01` → mở 4 hồ sơ chờ duyệt (Huy, Đức, Hiếu, Hương): **Hợp lệ** hết → **Đạt điều kiện**.
4. **Chốt & gửi phê duyệt** → dòng của Huy có ghi chú **“Đã trúng tuyển lớp khác”**.
5. `GV005` xác nhận → `GV004` phê duyệt → `GV900` công bố.

**Cho giảng viên thấy:** hộp công bố ghi 3 sinh viên trúng tuyển (không phải 4); hồ sơ R1 của Huy là **Không trúng tuyển**. Mỗi sinh viên chỉ thuộc một lớp.

### 3.6 Không duyệt được hồ sơ ngoài phạm vi (C6) **[RESET]**

1. `GV002` (CNN ngành HTTT) → mở `#/app/reviews/seed_app_6` (hồ sơ ngành KTPM) → “Không có quyền truy cập”.
2. **Duyệt hồ sơ ngành** → ô chọn đợt chỉ có các đợt của ngành HTTT.

---

## 4. Luồng C: sinh viên KSTN nộp hồ sơ duy trì (L1–L4, F2)

### 4.1 Tạo và mở đợt duy trì **[RESET]**

1. `GV004` → **Đợt xét tuyển** → **Tạo đợt xét tuyển**:

   | Trường | Giá trị |
   |---|---|
   | Lớp | `KSTN-KTPM-K20` |
   | Tên | `Duy trì & Bổ sung K20 – HK2` |
   | Học kỳ / Năm học | `Học kỳ 2` / `2026–2027` |
   | Sĩ số tối đa | `4` |
   | Bộ tiêu chí | `Duy trì & bổ sung năm 3 – theo Assessment Sample` |
   | GVPT | `ThS. Phạm Thị Dung` |
   | Chế độ xếp hạng | `Duy trì trước, bổ sung sau` |
   | Tiếp nhận | `10/11/2026 00:00` – `15/11/2026 00:00` |
   | Xét duyệt | `15/11/2026 00:00` – `22/11/2026 00:00` |
   | Hạn phê duyệt dự kiến | `25/11/2026 00:00` |

2. **Xác nhận** → **Phát hành** → **Xác nhận**. Đợt sang “Chưa mở”.
3. Demo → Đồng hồ → `10/11/2026 00:01` → đợt tự chuyển “Đang tiếp nhận hồ sơ”.

> Có thể nói thêm: nếu chọn Học kỳ 1 thì không phát hành được, vì lớp K20 đã có đợt R2 trong học kỳ đó (mỗi lớp – học kỳ – năm học chỉ có một đợt).

### 4.2 Sinh viên cập nhật hồ sơ tích lũy

1. Đăng nhập nhanh `21094501` (Nam) → menu có thêm **Cập nhật hồ sơ tích lũy** → bấm ở dòng đợt mới → **Tiếp tục**.
2. Bước 2: các giá trị (40, 0, 3.5, 85, 600, 1) và danh sách thành tích đã có sẵn; minh chứng thì trống.
3. Sửa Rèn luyện thành `75`, GPA thành `3.15` → **Tiếp tục** → khối điểm cảnh báo “Còn tiêu chí BB chưa đạt”.
4. **Quay lại** → GPA `3.65`, Rèn luyện `88` → tải minh chứng cho từng tiêu chí và từng thành tích.
5. **Tiếp tục** → tích cam kết → **Nộp hồ sơ chính thức**.

**Cho giảng viên thấy:** form ghi “Luồng C – Duy trì”; giá trị được **kế thừa** từ hồ sơ năm trước nhưng minh chứng **phải tải mới**; hệ thống cảnh báo ngay khi sinh viên không đạt chuẩn duy trì.

### 4.3 Duyệt, chốt, phê duyệt và công bố

1. Demo → Đồng hồ → `15/11/2026 00:01` → đợt sang “Đang xét duyệt hồ sơ”.
2. `GV001` → **Duyệt hồ sơ** → chọn đợt mới → mở hồ sơ của Nam → **Hợp lệ** hết → **Đạt điều kiện**.
3. **Chốt & gửi phê duyệt** → bản xem trước ghi “Chỉ tiêu 4 · SV cũ giữ lại 1 · Suất bổ sung 3” → **Xác nhận chốt, tạo phiên bản mới**.
4. `GV005` xác nhận → `GV004` phê duyệt → `GV900` **Phê duyệt & Công bố**.
5. Đăng nhập nhanh `21094501` → **Hồ sơ của tôi**.

**Cho giảng viên thấy:** sinh viên cũ đạt chuẩn được giữ chỗ trước, suất còn lại mới dành cho ứng viên mới. Sau công bố, Nam “Trúng tuyển · Năm 3: Đang học”.

---

## 5. Quản lý đợt xét tuyển

### 5.1 Phát hành đợt nháp (F1) **[RESET]**

1. `GV004` → **Đợt xét tuyển** → tab **Nháp** → `DXT-2026-07` → **Xem chi tiết**.
2. **Sửa** → đặt “Bắt đầu xét duyệt” trước “Kết thúc tiếp nhận” → **Xác nhận** → **Phát hành** → bị chặn vì sai thứ tự mốc thời gian.
3. **Sửa** lại cho đúng (tiếp nhận 01/12–10/12, xét duyệt 11/12–20/12) → **Phát hành** → **Xác nhận** → đợt sang “Chưa mở”.
4. Đăng xuất → trang chủ, tab **Chưa mở** → R7 đã xuất hiện (đợt Nháp thì không hiện công khai).

**Cho giảng viên thấy:** form sửa không có ô chọn trạng thái — trạng thái chỉ đổi qua thao tác (Phát hành, Mở/Đóng tiếp nhận) hoặc theo đồng hồ.

### 5.2 Đợt tự mở và tự đóng theo thời gian (E1, E2) **[RESET]**

1. Demo → Đồng hồ → `15/11/2026 00:00` → R6 tự chuyển “Đang tiếp nhận hồ sơ”.
2. Đồng hồ → `28/11/2026 01:00` → Hộp thư (lọc `26010011`) có email “Nhắc nộp hồ sơ – còn 48 giờ”.
3. Đồng hồ → `30/11/2026 00:01` → R1 tự chuyển “Đang xét duyệt hồ sơ”; bản nháp chưa nộp của Mai thành “Đã hủy”.
4. `quantri` → **Nhật ký** → tìm `DXT-2026-06` → các dòng do **Hệ thống** thực hiện.

### 5.3 Đóng tiếp nhận sớm bằng tay (N1) **[RESET]**

1. `GV004` → **Đợt xét tuyển** → `DXT-2026-01` → **Đóng tiếp nhận sớm** → để trống lý do → bị chặn.
2. Nhập lý do → **Xác nhận** → đợt sang “Đang xét duyệt hồ sơ”, bản nháp của Mai bị hủy.

### 5.4 Quyền sửa, xóa theo vai trò và trạng thái (F3, N2) **[RESET]**

- `GV004`: đợt **Nháp** (`DXT-2026-07`) và **Chưa mở** (`DXT-2026-06`) có nút **Xóa**; đợt đang tiếp nhận, đang xét duyệt, đã công bố thì không.
- `GV004` → `DXT-2026-01` → **Sửa**: đợt đang tiếp nhận chỉ sửa được một số trường (hạn kết thúc, mốc xét duyệt, mô tả, sĩ số).
- `GV001` → **ĐXT của lớp**: GVPT không có nút Tạo đợt.
- `GV900` → **Tra cứu ĐXT/lớp**: PĐT chỉ xem.

### 5.5 Trang công khai (F4)

Đăng xuất → trang chủ: thử ô tìm kiếm, các tab trạng thái, bộ lọc Năm học / Học kỳ / Khoa. **Xem chi tiết** ở R1 → thông tin đợt, 4 mốc thời gian, bảng tiêu chí kèm mức điểm.

---

## 6. Bộ tiêu chí

### 6.1 Quyền theo vai trò (G1) **[RESET]**

1. `GV001` → **Bộ tiêu chí** → mở “Duy trì & bổ sung năm 3 – theo Assessment Sample” → chỉ xem được (bộ do CNN tạo, đã ban hành).
2. Mở “Bản nháp tiêu chí của ThS. Phạm Thị Dung” → sửa được vì do mình tạo.

### 6.2 Xem trước điểm (G2)

1. Ở bộ “Duy trì & bổ sung năm 3…”, khối **Xem trước điểm** → **Điền dữ liệu mẫu Assessment** → **190 điểm · Đạt BB**.
2. Sửa GPA thành `3.4` (vẫn 40 điểm), rồi `3.39` (còn 30 điểm). Sửa Rèn luyện thành `80` → 0 điểm và “Chưa đạt BB”.

**Cho giảng viên thấy:** cách tính điểm theo ngưỡng, kiểm tra được ngay trên bộ tiêu chí trước khi dùng.

### 6.3 Soạn, ban hành, tạo phiên bản mới (G3)

1. `GV005` → **Tạo bộ tiêu chí** → đặt tên → **Thêm tiêu chí** với 3 kiểu: Ngưỡng số, Đếm minh chứng, Tích lũy có quy đổi → **Lưu nháp**.
2. Xóa hết mức điểm của một tiêu chí → **Ban hành** → bị chặn. Sửa lại → **Ban hành** → bộ thành “Đã ban hành”, chỉ đọc.
3. Mở bộ “Duy trì & bổ sung năm 3…” → **Tạo phiên bản mới** → sinh bản **v2 – Nháp**.
4. **Đợt xét tuyển** → `DXT-2026-02` → vẫn ghi “Snapshot bộ tiêu chí v1”.

**Cho giảng viên thấy:** đợt đang chạy dùng bản chụp (snapshot) của bộ tiêu chí, nên sửa bộ tiêu chí không ảnh hưởng đợt đang xét.

### 6.4 Tiêu chí ưu tiên phụ thuộc tiêu chí bắt buộc (O1) **[RESET]**

1. `GV001` → **Duyệt hồ sơ** → `DXT-2026-02` → hồ sơ Trần Minh Khoa.
2. Tiêu chí BB “Tiếng Anh” → bấm **Không hợp lệ** → tiêu chí UT “Tiếng Anh nâng cao” cũng về 0 điểm; có cảnh báo chưa đạt tiêu chí bắt buộc.
3. Bấm lại **Hợp lệ** → điểm cả hai tiêu chí được khôi phục.

---

## 7. Danh mục, lớp, tài khoản, phân quyền

### 7.1 Danh mục Khoa / Ngành / Chuyên ngành (H1) **[RESET]**

1. `quantri` → **Danh mục Khoa/Ngành** → **Thêm mới** (mã `KTEST`, tên “Khoa Thử nghiệm”).
2. “Khoa Công nghệ Thông tin” → **Xóa** → bị chặn: phải xóa theo thứ tự Lớp → Chuyên ngành → Ngành → Khoa.
3. **Chuyên ngành** → **Thêm chuyên ngành mới** trùng với `KSTN-KTPM` → bị chặn vì đã tồn tại.

### 7.2 Lớp và thành viên (H2)

1. `quantri` → **Lớp** → **Thêm mới**: Chuyên ngành KSTN-HTTT, Khóa `K22`, Năm bắt đầu `2026`, GVPT ThS. Ngô Thu Trang → mã lớp tự sinh `KSTN-HTTT-K22`. Tạo lại lần nữa → bị chặn (mỗi ngành và khóa chỉ có một lớp).
2. Dòng `KSTN-KTPM-K20` → **Xem thành viên** → lọc theo năm đào tạo.
3. Dòng “Lý Thanh Tú – năm 2” → **Ghi nhận tự rút** → nhập lý do → **Xác nhận** → Tú thành “Tự rút”, sĩ số lớp giảm.

### 7.3 Tài khoản giảng viên (H3)

1. `quantri` → **TK giảng viên** → **Tạo tài khoản GV**: mã `GV777`, họ tên, email `gv777@iuh.edu.vn`, chọn lớp phụ trách → **Xác nhận**.
2. Lấy mật khẩu tạm ở Hộp thư (lọc `gv777`) → đăng nhập `GV777` → bị buộc đổi mật khẩu.
3. `quantri` → dòng `GV003` → **Khóa** (nhập lý do) → `GV003` không đăng nhập được → **Mở khóa**.

**Cho giảng viên thấy:** không có nút Xóa tài khoản, chỉ Khóa/Mở khóa. Tài khoản sinh viên cũng không tạo tay — sinh viên tự đăng ký bằng email IUH.

### 7.4 GVPT đặt lại mật khẩu cho sinh viên lớp mình (H4)

1. `GV001` → **Đặt lại MK SV** → **Đặt lại MK** ở dòng Nam → **Xác nhận**.
2. Lấy mật khẩu tạm ở Hộp thư (lọc `21094501`) → đăng nhập → bị buộc đổi mật khẩu.

**Cho giảng viên thấy:** GVPT chỉ thấy 5 sinh viên của lớp K20, không thấy sinh viên lớp khác.

### 7.5 Phân quyền theo phạm vi (H5) **[RESET]**

1. `GV005` → **TK & phân quyền GV ngành** → **Phân quyền** → **Gán vai trò**: chọn “ThS. Lê Minh Tâm”, vai trò “Giảng viên phụ trách”, phạm vi `KSTN-KTPM-K22` → **Xác nhận**.
2. Bấm **Thu hồi** ở dòng vừa tạo → **Xác nhận**.
3. `quantri` → **Phân quyền** → **Gán vai trò** → thấy đủ 5 vai trò cán bộ.

**Cho giảng viên thấy:** CNN chỉ gán được vai trò CNN và GVPT, chỉ cho giảng viên và lớp trong ngành mình. Quản trị viên gán được mọi vai trò.

### 7.6 Một tài khoản nhiều vai trò (A9)

1. Đăng nhập nhanh `GV005` → ô **Vai trò đang làm việc** → chọn “Giảng viên phụ trách · KSTN-KTPM-K22”.

**Cho giảng viên thấy:** menu và dữ liệu đổi theo vai trò đang chọn (CNN thấy cả ngành, GVPT chỉ thấy lớp K22).

---

## 8. Xác thực và tài khoản

Làm nhanh các mục dưới đây khi giảng viên hỏi về bảo mật. Mỗi mục **[RESET]** trước khi làm.

| Tình huống | Thao tác | Kết quả |
|---|---|---|
| Mạo danh MSSV (A2) | Đăng ký với MSSV `21094501`, email `hacker.21094501@student.iuh.edu.vn` | Giao diện vẫn báo chung chung như bình thường, nhưng Hộp thư **không có** email nào gửi đi |
| MSSV đã có tài khoản (A3) | Đăng ký với `21094501` / `21094501@student.iuh.edu.vn`, xác nhận OTP | Báo “MSSV này đã có tài khoản”, nút Tạo tài khoản bị khóa |
| Giới hạn xin OTP (A4) | Đăng ký với `26018888` / `26018888@student.iuh.edu.vn`, gửi OTP 4 lần | Lần thứ 4 bị chặn, phải chờ 15 phút |
| Đăng nhập (A5) | Đăng nhập bằng MSSV `21094501`, email `ptdung@iuh.edu.vn`, mã GV `GV900` | Cả ba cách đều vào đúng người, đúng vai trò |
| Khóa tạm (A6) | Đăng nhập `GV003` sai mật khẩu 5 lần | Tài khoản khóa đến 09:15; đặt đồng hồ `09/11/2026 09:16` thì đăng nhập lại được |
| Quên mật khẩu (A7) | **Quên mật khẩu?** → nhập `GV003` → mở link trong Hộp thư → đặt mật khẩu mới | Mật khẩu mới dùng được, mật khẩu cũ không |
| Buộc đổi mật khẩu (A8) | Đăng nhập `GV009` / `demo1234`, thử đổi URL sang `#/app/reviews` | Bị giữ ở màn “Đổi mật khẩu để tiếp tục” cho tới khi đổi xong |
| Đổi email (A10) | `21094501` → **Thông tin cá nhân** → đổi email thành `nam.21094501@student.iuh.edu.vn` → nhập OTP gửi về email mới | Đổi được; email ngoài miền IUH bị từ chối |
| Truy cập trái quyền (A11) | `21094501` đổi URL thành `#/app/audit` | Hiện “Không có quyền truy cập” |

---

## 9. Vận hành và tra soát

| Chức năng | Tài khoản → thao tác | Cho giảng viên thấy |
|---|---|---|
| Thông báo (I1) | Sau mục 2.3: `GV005` → bấm chuông → bấm một thông báo | Chuyển đúng trang liên quan, số chưa đọc giảm |
| Tổng quan theo vai trò (I7) | Đăng nhập lần lượt `GV001`, `GV005`, `GV004`, `GV900`, `quantri` | Mỗi vai trò có khối “Việc cần làm” và “Mốc sắp tới trong 7 ngày” riêng |
| Hàng đợi email (I2, P2) **[RESET]** | `quantri` → **Hàng đợi email** → tab **Gửi lỗi** → **Gửi lại** | Email tới `fail.26010022@…` báo lỗi SMTP mô phỏng; hệ thống ghi số lần thử |
| Cấu hình hệ thống (I3, O2) | `quantri` → **Cấu hình hệ thống** → dung lượng tối đa `2` MB → **Lưu cấu hình**; sau đó `26010011` tải tệp 3 MB | Tệp bị từ chối theo giới hạn mới. Nhớ trả lại `10` MB |
| Kiểm tra tệp tải lên (O2) | `26010011` → bản nháp → bước 2 → tải tệp `.docx` đổi đuôi thành `.pdf` | Báo “Nội dung tệp không khớp định dạng” — hệ thống đọc nội dung thật, không chỉ nhìn đuôi tệp |
| Nhật ký (I4) | `quantri` → **Nhật ký** → lọc `LOGIN`, `ROUND` → **Xem trước / sau** | Mọi thao tác đều được ghi; không có nút sửa/xóa nhật ký |
| Báo cáo (I5) | Sau mục 3.3: `GV900` → **Báo cáo** → `DXT-2026-05` → **Xuất CSV (Excel)**, **In / Lưu PDF** | Thống kê hồ sơ, phổ điểm, danh sách trúng tuyển; xuất được tệp |
| Hồ sơ sinh viên (M1–M3) | `GV005` → **Hồ sơ SV** → **Xem lịch sử** ở Nam → **Xem chỉ đọc** một hồ sơ | Dòng thời gian qua các năm; trang chỉ đọc, không có nút xác minh hay quyết định |
| Phạm vi dữ liệu (J2) | `GV004` → **Đợt xét tuyển** | BLĐ khoa CNTT không thấy đợt của Khoa QTKD (R5, R6) |
| Sao lưu và khôi phục (P3) | Demo → **Dữ liệu** → **Xuất JSON db**, rồi **Khôi phục dữ liệu mẫu** | Tải được tệp `kstn-prototype-v3.json`; khôi phục xong đồng hồ về 09:00 09/11/2026 |

---

## 10. Giới hạn của bản prototype (nói trước nếu được hỏi)

- Chưa có backend và email thật: dữ liệu lưu trên trình duyệt, email nằm trong Hộp thư mô phỏng.
- Thời gian là đồng hồ mô phỏng, đổi bằng Bảng điều khiển demo.
- Chưa có chữ ký số, chưa nhập điểm từ PĐT, chưa có quyết định điều chỉnh sau công bố.
- Email gửi tới địa chỉ chứa chuỗi `fail` luôn lỗi, kể cả khi bấm **Gửi lại** (cố ý, để minh họa xử lý lỗi).
- Sinh viên rút hồ sơ rồi nộp lại trong cùng đợt được xếp Luồng B — đúng theo quy tắc phân luồng.
