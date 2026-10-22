# Kế hoạch nâng cấp UI/UX IUH Talent
## Hướng thiết kế: bản sắc học thuật, tinh tế, rõ nghiệp vụ — không “AI slop”

Mình đề xuất nâng cấp theo hướng **một cổng tuyển sinh đại học được thiết kế chỉn chu như sản phẩm chuyên nghiệp**, thay vì một dashboard nhiều hiệu ứng.

Điểm tạo nên sự đẹp sẽ là: tỷ lệ bố cục, chất lượng typography tiếng Việt, cách tổ chức thông tin, độ nhất quán và những tương tác được chăm chút. Không phải thêm gradient, ánh sáng hay animation.

Kế hoạch dưới đây đủ cụ thể để giao cho model khác triển khai. **Mình chưa sửa file hay triển khai giao diện trong lượt này.**

> **Cơ sở lập kế hoạch:** đường dẫn `vibe-code` cũ không còn tồn tại. Mình đã đọc dự án IUH Talent tại thư mục `web-kstn-iuh` cùng thư mục `Code`, gồm mã nguồn React, CSS, cấu hình, `PRODUCT.md`, `DESIGN.md` và `NGHIEP-VU.md`. Không tìm thấy `UI-UX-UPGRADE-PLAN.md` ở bản này. Đây là đánh giá từ mã nguồn, chưa phải kiểm chứng trực tiếp bằng trình duyệt.
>
> Mình đã sử dụng skill `ui-ux-pro-max`: lấy nguyên tắc bố cục Swiss/minimal, khả năng đọc, tương tác và biểu mẫu; không áp nguyên các gợi ý màu/font/trang marketing vì không phù hợp hoàn toàn với IUH.

---

# 1. Chốt mục tiêu trước khi thiết kế

## 1.1. Giao diện mới phải tạo ra cảm giác gì?

Ba đặc tính chính:

1. **Đáng tin:** giống một hệ thống tuyển sinh của trường đại học, không giống trang quảng cáo sản phẩm công nghệ.
2. **Có gu:** bố cục có chủ đích, đẹp ở chữ, khoảng cách, đường phân cách và độ chính xác.
3. **Dễ làm việc:** sinh viên biết bước tiếp theo; cán bộ đọc, đối chiếu và xử lý hồ sơ nhanh.

Người dùng nên cảm nhận:

> “Thông tin rõ ràng, trang được làm cẩn thận, mình biết phải làm gì.”

Không nên cảm nhận:

> “Trang có rất nhiều hiệu ứng nhưng không rõ trạng thái hồ sơ và nút nào cần bấm.”

## 1.2. Hai trải nghiệm, một hệ thống thiết kế

| Khu vực | Tính chất | Ưu tiên |
|---|---|---|
| Trang công khai | Thông báo tuyển sinh có tính biên tập | Đợt nào phù hợp, thời hạn, điều kiện, cách nộp |
| Khu vực sinh viên | Không gian hoàn thành hồ sơ | Tiến trình, dữ liệu cần nhập, minh chứng, phản hồi |
| Khu vực cán bộ | Công cụ xử lý nghiệp vụ | Mật độ thông tin, phạm vi phụ trách, thao tác chính xác |

Không ép cả ba vào cùng một bố cục card.

Chúng dùng chung màu, chữ, nút, biểu mẫu và trạng thái; khác nhau ở mật độ, chiều rộng và cách trình bày.

## 1.3. Những thứ phải giữ

- Logo IUH/Khoa Công nghệ Thông tin đang có.
- Màu xanh nhận diện hiện tại làm màu chủ đạo.
- Tiếng Việt và thuật ngữ nghiệp vụ.
- React, Vite, Tailwind và hệ icon hiện có.
- Bảy trang đầu vào hiện tại.
- Sáu vai trò.
- Quan hệ `Khoa → Ngành → Lớp`.
- Quy định phân trang tối đa 10 dòng.
- Các ràng buộc tạo, sửa, xóa trong tài liệu nghiệp vụ.
- Khả năng thu gọn và điều chỉnh sidebar hiện có, nhưng cần hoàn thiện trải nghiệm.

## 1.4. Những thứ không thuộc đợt nâng cấp này

- Đổi framework.
- Xây backend, xác thực thật hoặc hệ thống email thật.
- Thay logo.
- Tự phát minh quy chế tuyển sinh.
- Thêm dashboard thống kê chỉ để đẹp.
- Thêm AI chatbot.
- Thêm dark mode trước khi hoàn thiện light mode.
- Thêm ảnh stock, ảnh sinh viên AI hoặc hình 3D trang trí.
- Thêm banner giới thiệu, phần hướng dẫn dài hay footer marketing vào trang công khai. `DESIGN.md` hiện đã có chủ đích không dùng các phần này.

---

# 2. Đánh giá hiện trạng và ưu tiên xử lý

## 2.1. Phần nên giữ và phát triển

- Trang công khai đã đi thẳng vào danh sách đợt tuyển sinh.
- Có tìm kiếm và lọc trạng thái.
- Có cấu trúc menu theo vai trò.
- Có các thành phần dùng chung như modal, bảng, toolbar, phân trang.
- Đã có font Inter được lưu cục bộ.
- Đã có một số xử lý bàn phím và focus cho modal.
- Dữ liệu mẫu đủ đa dạng để kiểm tra tên dài và bảng nhiều dòng.

Đây là nền tảng tốt. Không cần đập đi làm lại toàn bộ.

## 2.2. Những vấn đề nhìn thấy trong mã nguồn

| Vấn đề | Tác động | Hướng xử lý |
|---|---|---|
| Gradient xuất hiện trên nền, nút, sidebar, card, thanh phân cách, phân trang | Mọi thứ đều muốn nổi bật | Chuyển sang màu phẳng, phân cấp bằng cấu trúc |
| Viền chuyển màu, chấm phát sáng, animation lặp | Tăng cảm giác template/AI-generated | Bỏ hiệu ứng trang trí không mang thông tin |
| Bóng đổ nhiều lớp, card hover nhấc lên | Giao diện hành chính trông như landing page | Chỉ dùng shadow cho lớp nổi |
| CSS và `DESIGN.md` không còn thống nhất | Model sau khó biết đâu là chuẩn | Chốt token mới, cập nhật tài liệu sau triển khai |
| Nhiều font được khai báo nhưng có font chưa dùng rõ ràng | Phức tạp và dễ thiếu nhất quán | Chọn một font chính |
| Trạng thái được đoán bằng regex từ chữ | “Không đạt” có thể khớp “đạt” và thành màu thành công | Dùng trạng thái định danh rõ ràng |
| Nút “Nộp hồ sơ” có trên cả đợt đang xét duyệt | Hành động không khớp trạng thái | Quy định CTA theo vòng đời |
| Duyệt/từ chối chủ yếu chỉ hiện toast | Giao diện thông báo thành công nhưng không đổi dữ liệu | Hoàn thiện trạng thái mô phỏng |
| Stepper sinh viên đang là nội dung tĩnh | Trông có quy trình nhưng không phản ánh tiến trình | Biến thành luồng thật |
| Toast mặc định màu xanh | Thông tin, lỗi và thành công khó phân biệt | Thiết kế feedback theo loại |

**Ưu tiên:** sửa độ tin cậy của trạng thái song song với hình thức. Một giao diện đẹp nhưng phản hồi sai sẽ làm mất cảm giác chuyên nghiệp rất nhanh.

---

# 3. Art direction: “Academic Editorial × Operational Clarity”

Tên này chỉ để model triển khai hiểu tinh thần, không đưa lên giao diện.

## 3.1. Ngôn ngữ thị giác

- Nền sáng, trung tính.
- Xanh IUH dùng có chọn lọc.
- Navy tạo vùng điều hướng vững và rõ.
- Typography gọn, có độ tương phản giữa tiêu đề và nội dung.
- Đường phân cách mảnh.
- Card chỉ dùng khi thật sự có một nhóm nội dung độc lập.
- Khoảng trắng vừa đủ, không trải rộng vô nghĩa.
- Dữ liệu nằm trên cùng hệ lưới.
- Icon nhỏ, thống nhất nét.
- Không có yếu tố tự chuyển động khi người dùng đang đọc.

## 3.2. Điểm nhấn riêng của sản phẩm

Bản sắc nên đến từ:

- Logo thật.
- Tên đầy đủ của cổng thông tin.
- Tên đợt tuyển sinh, mã đợt, đơn vị, khóa học.
- Cách trình bày ngày hạn nộp.
- Quan hệ khoa/ngành/lớp.
- Cấu trúc hồ sơ và minh chứng.
- Màu xanh IUH.

Không cần tạo thêm một “hệ biểu tượng tài năng” bằng mũ tốt nghiệp phát sáng, huy hiệu vàng hay các slogan lớn.

## 3.3. Quy tắc chống “AI slop”

Model triển khai phải tuân thủ:

1. Không dùng gradient cho chữ.
2. Không dùng gradient xanh–vàng làm trang trí.
3. Không dùng glow.
4. Không dùng noise phủ toàn trang.
5. Không có animation lặp trên thành phần tĩnh.
6. Không thêm bento grid nếu không có nhu cầu thông tin.
7. Không bọc mọi section trong card.
8. Không đặt icon trong một ô vuông màu chỉ vì có chỗ trống.
9. Không dùng pill cho mọi nhãn.
10. Không thêm slogan kiểu “Kiến tạo tương lai, chạm tới ước mơ”.
11. Không thêm số liệu, testimonial hay thành tích không có nguồn.
12. Không dùng từ “premium”, “seamless”, “đột phá” để thay cho thông tin cụ thể.
13. Không khiến bảng dữ liệu nhấc lên khi hover.
14. Không để một màn hình có nhiều nút chính cạnh tranh nhau.
15. Không dùng khoảng trắng lớn để che việc thiếu nội dung.

**Bài kiểm tra:** tắt hết shadow và animation, giao diện vẫn phải đẹp và dễ hiểu.

---

# 4. Hệ thống màu

Đây là bảng màu đề xuất để triển khai thử và đo tương phản, không phải tuyên bố đã đạt chuẩn khi chưa kiểm tra.

| Token | Giá trị đề xuất | Mục đích |
|---|---|---|
| `brand` | `#153898` | Hành động chính, liên kết quan trọng |
| `brand-hover` | `#102C79` | Hover nút chính |
| `brand-soft` | `#EEF3FF` | Vùng chọn, thông tin liên quan |
| `nav-background` | `#10285E` | Sidebar |
| `canvas` | `#F5F7FA` | Nền workspace |
| `surface` | `#FFFFFF` | Nội dung chính |
| `surface-subtle` | `#F8FAFC` | Header bảng, vùng phụ |
| `text-primary` | `#182235` | Nội dung chính |
| `text-secondary` | `#526175` | Mô tả, metadata |
| `text-muted` | `#667085` | Thông tin phụ, phải kiểm tra tương phản |
| `border-subtle` | `#E4E8EF` | Phân cách trang trí |
| `border-control` | `#8794A7` | Biên điều khiển cần nhận biết |
| `focus` | `#2563EB` | Focus bàn phím |
| `success-text` | `#166534` | Thành công/được chấp thuận |
| `success-background` | `#F0FDF4` | Nền trạng thái thành công |
| `warning-text` | `#854D0E` | Cần chú ý/bổ sung |
| `warning-background` | `#FFFBEB` | Nền cảnh báo |
| `danger-text` | `#B42318` | Lỗi/từ chối |
| `danger-background` | `#FEF3F2` | Nền lỗi |

### Quy tắc sử dụng

- Nền trắng và trung tính chiếm phần lớn màn hình.
- Xanh thương hiệu dành cho các điểm có ý nghĩa.
- Không dùng vàng như màu “cao cấp”.
- Đỏ nhận diện chỉ giữ trong tài sản thương hiệu hoặc một chi tiết rất nhỏ nếu thực sự cần.
- Màu trạng thái không thay thế chữ.
- “Đã kết thúc” không mặc định màu đỏ: kết thúc là một trạng thái trung tính, không nhất thiết là lỗi.
- Không đặt mã màu rải rác trong JSX.
- Phân biệt đường phân cách trang trí với biên input: hai loại có yêu cầu tương phản khác nhau.

---

# 5. Typography: làm đẹp bằng chữ trước

## 5.1. Font

**Chốt đề xuất: dùng Inter Variable cục bộ làm font chính cho toàn hệ thống.**

Lý do:

- Dự án đã có file font.
- Không phụ thuộc tải font bên ngoài.
- Phù hợp cả biểu mẫu và bảng.
- Giảm sự pha trộn giữa Be Vietnam Pro, Plus Jakarta Sans và Inter.

Trước khi chốt triển khai phải kiểm tra đầy đủ glyph tiếng Việt bằng các chuỗi dài và nhiều dấu.

Fallback:

`Inter → Segoe UI → Arial → sans-serif`

Không thêm font serif chỉ vì sản phẩm thuộc giáo dục. Đây là cổng tác nghiệp, không phải tạp chí nghiên cứu.

## 5.2. Thang chữ

| Thành phần | Desktop | Mobile | Weight |
|---|---:|---:|---:|
| H1 trang công khai | 40–44px | 28–32px | 650–700 |
| H1 workspace | 28px | 24px | 650 |
| H2 section | 20px | 18–20px | 600 |
| Tiêu đề đợt tuyển sinh | 21–22px | 19–20px | 600 |
| Nội dung chính | 15–16px | 16px | 400 |
| Nội dung bảng | 14px | 14–15px | 400 |
| Label biểu mẫu | 14px | 14px | 500 |
| Metadata | 13px | 13px | 400 |
| Badge | 12–13px | 12–13px | 500 |
| Chú thích nhỏ | Tối thiểu 12px | Tối thiểu 12px | 400 |

### Chi tiết phải làm đúng

- Body line-height khoảng 1.5–1.6.
- Tiêu đề line-height khoảng 1.2–1.3.
- Không dùng letter-spacing âm quá mạnh với tiếng Việt.
- Không viết hoa toàn bộ header bảng.
- Không dùng chữ 10–11px cho dữ liệu cần đọc.
- Tên người và tên ngành dài được xuống dòng hợp lý.
- Mã hồ sơ, MSSV và số liệu dùng tabular numerals khi có ích.
- Không dùng monospace cho mọi mã định danh nếu làm giao diện quá kỹ thuật.
- Không ép tiêu đề hai dòng bằng `<br>` trên mọi kích thước màn hình.

---

# 6. Khoảng cách, hình khối và độ nổi

## 6.1. Spacing

Dùng thang:

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64`

Ứng dụng:

- Label → input: 8px.
- Input → helper/error: 6–8px.
- Giữa các field: 20–24px.
- Giữa hai nhóm field: 32px.
- Tiêu đề trang → vùng thao tác: 24px.
- Toolbar → bảng: 16px hoặc liền khối bằng border.
- Padding panel desktop: 24px.
- Padding panel mobile: 16px.
- Khoảng cách giữa các section chính: 32–40px.

Không phát sinh hàng loạt giá trị 17px, 23px, 29px nếu không có lý do.

## 6.2. Border radius

| Thành phần | Radius |
|---|---:|
| Nút, input | 8px |
| Badge | 5–6px |
| Panel, card | 12px |
| Modal | 16px |
| Avatar | Tròn |

Giảm cảm giác mọi thứ đều mềm và phồng.

## 6.3. Shadow

Chỉ cần ba mức:

- Không shadow: bảng, section, card thường.
- Shadow rất nhẹ: phần tử cần tách khỏi nền nhưng cùng mặt phẳng.
- Shadow rõ hơn: dropdown, dialog, popover.

Không dùng shadow xanh. Không có inset highlight làm nút bóng.

---

# 7. Kiến trúc bố cục toàn hệ thống

## 7.1. Public

- Container tối đa khoảng 1200px.
- Căn giữa.
- Padding ngang desktop 32px, tablet 24px, mobile 16px.
- Header gọn.
- Tiêu đề và bộ lọc gần danh sách.
- Không thêm hero cao bằng nửa màn hình.
- Không có sidebar.

## 7.2. Workspace

- Sidebar mở: mặc định 248px.
- Sidebar thu gọn: khoảng 72px.
- Giữ resize nhưng giới hạn hợp lý, ví dụ 224–320px.
- Header khoảng 64px.
- Nội dung desktop padding 24–32px.
- Bảng được dùng hết chiều rộng khả dụng.
- Biểu mẫu dài giới hạn bề rộng riêng, không trải hết màn hình.

## 7.3. Responsive

| Kích thước | Cách tổ chức |
|---|---|
| Từ 1280px | Sidebar đầy đủ, layout desktop |
| 1024–1279px | Sidebar gọn hơn; giảm padding trước khi giảm chữ |
| 768–1023px | Điều hướng dạng drawer; nội dung một vùng chính |
| Dưới 768px | Một cột, toolbar xếp lại, form một cột |
| 320–390px | Kiểm tra nhãn dài, nút, modal, bàn phím ảo |

Không thu nhỏ toàn bộ UI để nhét desktop vào mobile.

---

# 8. Trang công khai: làm danh sách tuyển sinh thật sự đẹp

## 8.1. Cấu trúc trang

```text
Logo IUH      Tên cổng thông tin                         Đăng nhập
────────────────────────────────────────────────────────────────
Thông tin xét tuyển                          Website IUH ↗

Các đợt xét tuyển
Tra cứu thông tin và chọn đợt xét tuyển phù hợp.

[Tìm theo tên, mã đợt hoặc chuyên ngành…]  [Trạng thái ▾]

2 đợt xét tuyển
────────────────────────────────────────────────────────────────
[Đợt tuyển sinh A]                       [Đợt tuyển sinh B]
```

Không thêm các phần không phục vụ việc tìm đợt tuyển sinh.

## 8.2. Header

- Giữ nguyên logo, không bóp méo.
- Giữ đầy đủ tên cổng thông tin hiện có.
- Logo và tên cổng phải có khoảng thở, không tranh trọng lượng với nhau.
- Nút “Đăng nhập” là hành động phụ về thị giác so với CTA nộp hồ sơ trong nội dung.
- Header trắng, border dưới mảnh.
- Bỏ đường gradient chạy ngang.
- Không áp hiệu ứng nhấc lên cho logo.

Mobile:

- Hàng đầu: logo và đăng nhập.
- Tên cổng ở hàng tiếp theo nếu không đủ chỗ.
- Không giảm tên cổng xuống cỡ chữ khó đọc.
- Tránh header sticky quá cao chiếm phần lớn viewport.

## 8.3. Tiêu đề khu vực

Giữ nội dung trực tiếp:

**Các đợt xét tuyển**

Mô tả:

“Tra cứu thông tin và chọn đợt xét tuyển phù hợp.”

- Không tô gradient từ “xét tuyển”.
- Không có chấm đỏ nhấp nháy.
- Bỏ khối mũ tốt nghiệp trang trí lớn bên phải.
- Nếu giữ eyebrow, dùng một dòng nhỏ, không lặp nhiều lần “CHƯƠNG TRÌNH TÀI NĂNG IUH”.

## 8.4. Bộ lọc

- Không cần một card riêng có shadow.
- Search chiếm phần lớn chiều ngang.
- Filter trạng thái rộng khoảng 200–220px.
- Label luôn nhìn thấy.
- “Đặt lại” chỉ hiện khi đã lọc.
- Kết quả cập nhật không làm focus nhảy.
- Số kết quả nằm ngay trên danh sách.
- Không đọc lại kết quả liên tục quá mức với screen reader khi người dùng gõ.

## 8.5. Card đợt tuyển sinh

Thứ tự nội dung:

1. Mã đợt và badge trạng thái.
2. Tên đợt.
3. Đối tượng áp dụng.
4. Đơn vị/phạm vi.
5. Thời gian tiếp nhận.
6. Hành động.

Thiết kế:

- Nền trắng.
- Border 1px.
- Radius 12px.
- Padding 24px.
- Tên đợt là yếu tố mạnh nhất.
- Mã đợt nhỏ hơn tên.
- Không có icon lớn trong ô gradient.
- Không có thanh gradient trên đầu.
- Không ép chiều cao quá lớn khi nội dung ngắn.
- Hành động ở cuối card, thẳng hàng giữa các card cùng hàng.

Hover:

- Border đậm nhẹ.
- Có thể đổi nền rất nhẹ.
- Không dịch card lên 5px.
- Không có bóng lan rộng.

## 8.6. CTA theo trạng thái

| Trạng thái | Hành động chính | Hành động phụ |
|---|---|---|
| Đang tiếp nhận, đủ điều kiện thao tác | Nộp hồ sơ | Xem chi tiết |
| Chưa mở | Xem chi tiết | Hiển thị ngày mở nếu có |
| Đang xét duyệt | Xem chi tiết | Xem hồ sơ của tôi nếu có ngữ cảnh tài khoản |
| Đã kết thúc | Xem chi tiết | Không hiển thị nút nộp hoạt động |

Không suy luận quyền nộp chỉ từ màu badge.

## 8.7. Chi tiết đợt tuyển sinh

Thêm một màn chi tiết hoặc vùng chi tiết có URL truy cập lại được.

Nội dung:

- Tên và mã đợt.
- Trạng thái.
- Thời gian.
- Đối tượng.
- Đơn vị.
- Bộ tiêu chí áp dụng.
- Minh chứng cần chuẩn bị.
- Hành động tiếp theo.

Chỉ hiển thị dữ liệu có thật trong cấu hình demo. Thiếu quy định phải ghi rõ chưa cấu hình, không tự bịa.

**Tiêu chí đạt:** ở desktop 1440×900, người dùng thấy ngay ít nhất một đợt và hành động của nó mà không phải cuộn qua một vùng quảng cáo.

---

# 9. Workspace: ít “chrome”, nhiều không gian làm việc

“Chrome” ở đây là các thành phần bao quanh nội dung như header, nhãn vai trò, breadcrumb và menu — không phải trình duyệt.

## 9.1. Sidebar

Chia nhóm theo công việc, chỉ hiện nhóm có mục được phép:

- Tuyển sinh.
- Đào tạo.
- Tài khoản và phân quyền.

Không thêm một trang “Tổng quan” rỗng chỉ để đủ mẫu dashboard.

Mỗi item:

- Cao tối thiểu 44px.
- Icon 18–20px.
- Nhãn 14px.
- Active dùng nền sáng phẳng hoặc nền xanh sáng hơn có kiểm tra tương phản.
- Không có vạch vàng phát sáng.
- Không có icon scale khi hover.
- Tên dài xuống tối đa hai dòng khi cần.

Thu gọn:

- Chỉ hiện icon.
- Có tooltip khi hover và focus.
- Có tên truy cập đầy đủ.
- Không làm mất active state.
- Nút mở rộng luôn dễ tìm.

Resize:

- Có vùng kéo đủ dễ thao tác.
- Có cách điều chỉnh bằng bàn phím.
- Có thao tác khôi phục chiều rộng mặc định.
- Không để resize làm nội dung co xuống mức không dùng được.

## 9.2. Header

Chỉ giữ:

- Nút điều hướng khi cần.
- Ngữ cảnh vị trí ngắn.
- Phạm vi dữ liệu nếu có nguồn xác định.
- Tài khoản.

Không lặp vai trò ở sidebar, breadcrumb, eyebrow và tiêu đề cùng lúc.

Ví dụ:

- Breadcrumb: `Đào tạo / Chuyên ngành`.
- H1: `Quản lý chuyên ngành`.
- Mô tả: `Quản lý chuyên ngành và các lớp trực thuộc.`

Một màn chỉ có một H1.

## 9.3. Phạm vi dữ liệu

Không hardcode “Khoa Công nghệ Thông tin” cho mọi vai trò.

- Quản trị/Phòng Đào tạo: phạm vi toàn trường nếu nghiệp vụ cho phép.
- Lãnh đạo khoa: khoa được giao.
- Chủ nhiệm ngành: ngành được giao.
- Giảng viên: lớp/hồ sơ được phân công.
- Sinh viên: hồ sơ của mình.

Nếu fixture chưa có dữ liệu phân công, phải bổ sung cấu hình demo rõ ràng hoặc ghi nhận chưa cấu hình; không dùng tên hiển thị để suy ra quyền.

## 9.4. Account menu

- Tên.
- Vai trò.
- Thông tin cá nhân.
- Đổi mật khẩu.
- Đăng xuất/thoát phiên demo theo đúng khả năng.

Có Escape, click ngoài, focus rõ ràng và đóng khi chuyển trang.

---

# 10. Bảng dữ liệu: đây là nơi cần đầu tư nhiều nhất

## 10.1. Cấu trúc chuẩn

```text
Tên trang                                      [Thêm bản ghi]

Mô tả ngắn

[Tìm kiếm…]  [Bộ lọc 1 ▾]  [Bộ lọc 2 ▾]         [Đặt lại]

─────────────────────────────────────────────────────────────
Header bảng
Dòng dữ liệu
Dòng dữ liệu
...
─────────────────────────────────────────────────────────────
Hiển thị 1–10 trong 64 bản ghi          Trước  1 2 … 7  Sau
```

Không để nút tạo mới xuất hiện hai lần ở PageHeader và toolbar.

## 10.2. Hình thức

- Header bảng nền xám rất nhạt.
- Text header 13px, weight 600.
- Nội dung 14px.
- Padding ngang 16px.
- Chiều cao dòng tối thiểu khoảng 56px.
- Tên dài cho phép tăng chiều cao.
- Phân cách ngang mảnh.
- Không cần viền dọc khắp bảng.
- Hover nền nhẹ, không dịch chuyển.
- Không đổi shadow cả panel khi hover.

## 10.3. Căn chỉnh

- Tên, khoa, email: trái.
- Điểm, số lượng: phải.
- Trạng thái: thống nhất một cách căn.
- Thao tác: phải.
- Số liệu dùng tabular numerals.
- Mã và tên có thể nằm chung một ô hai dòng ở bảng phù hợp.
- Không gộp tùy tiện nếu làm mất cột bắt buộc.

Riêng bảng chuyên ngành giữ đúng bốn cột:

**Khoa / Chuyên ngành / Số lượng lớp / Thao tác**

## 10.4. Thao tác dòng

- Xem, sửa, xóa dùng icon theo đặc tả.
- Icon button có tên truy cập chứa đối tượng khi cần.
- Vùng bấm 44×44px.
- Khoảng cách giữa các mục tiêu chạm đủ thoáng.
- Tooltip không phải cách duy nhất để hiểu hành động.
- Xóa không có nền đỏ lớn thường trực.
- Hành động không được phép không được hoạt động chỉ vì người dùng đi bằng URL khác.

## 10.5. Phân trang

- Tối đa 10 dòng.
- Áp dụng cả danh sách nằm trong chi tiết/modal.
- Khi filter thay đổi: về trang 1.
- Khi xóa bản ghi cuối trang: điều chỉnh về trang hợp lệ.
- Nhiều trang: dùng dấu ba chấm.
- Có `aria-current`.
- Không hiển thị hàng chục nút số trang trên mobile.

## 10.6. Mobile

Không chuyển mọi bảng thành card một cách máy móc.

- Danh sách ít trường, thiên về đối tượng: có thể dùng card/row mobile.
- Bảng đối chiếu nhiều cột: giữ table, cuộn ngang bên trong.
- Bảng chuyên ngành: giữ đủ bốn cột theo đặc tả.
- Không để document bị cuộn ngang.
- Có dấu hiệu cho biết bảng còn nội dung bên phải.
- Cột sticky chỉ dùng khi đã kiểm tra không che dữ liệu và focus.

---

# 11. Biểu mẫu, dialog và phản hồi

## 11.1. Field chuẩn

Mỗi field gồm:

1. Label.
2. Dấu bắt buộc hoặc chữ “Không bắt buộc” theo quy ước nhất quán.
3. Input.
4. Helper khi cần.
5. Error khi có.

Yêu cầu:

- Input cao khoảng 44px.
- Input mobile font 16px.
- Không dùng placeholder thay label.
- Không báo lỗi bằng viền đỏ đơn thuần.
- Error liên kết với input bằng `aria-describedby`.
- Có `aria-invalid`.
- Khi submit sai nhiều trường: có error summary liên kết tới từng trường.
- Không xóa giá trị khi submit lỗi.

## 11.2. Validation

- Không báo lỗi ngay khi vừa mở form.
- Có thể kiểm tra khi blur sau khi người dùng đã tương tác.
- Sau lần submit lỗi, cập nhật lỗi khi sửa.
- Không chỉ dùng toast cho lỗi nhập liệu.
- Kiểm tra chuỗi chỉ có khoảng trắng.
- Quy tắc điểm số dựa trên schema/tiêu chí, không hardcode tùy tiện.
- Quy tắc trùng dùng dữ liệu chuẩn hóa, không chỉ so chuỗi nguyên bản.

## 11.3. Modal

Kích thước đề xuất:

- Xác nhận: 420–460px.
- Form ngắn: 560–640px.
- Form trung bình: 760–880px.
- Hồ sơ xét duyệt dài: dùng màn riêng, không nhét vào modal nhỏ.

Yêu cầu:

- Header rõ.
- Nội dung cuộn độc lập khi cần.
- Footer nút không che field cuối.
- Focus nằm trong modal.
- Đóng trả focus về nút mở.
- Escape chỉ đóng lớp trên cùng.
- Nền phía sau không nhận tương tác.
- Không tự đóng bản nháp khi bấm backdrop.
- Có xác nhận rời đi nếu đã thay đổi dữ liệu.

Ngoại lệ nghiệp vụ chuyên ngành trùng cần modal nhỏ thứ hai: phải quản lý modal stack đúng, không để hai focus trap tranh nhau.

## 11.4. Toast

Bốn loại:

- Thành công.
- Lỗi.
- Cảnh báo.
- Thông tin.

Ví dụ đúng:

- “Đã cập nhật tên chuyên ngành.”
- “Không thể lưu bản nháp trên thiết bị này.”
- “Chuyên ngành vẫn còn 3 lớp trực thuộc.”
- “Chức năng gửi email chưa được kết nối trong bản demo.”

Không hiển thị “Đã gửi email” nếu không có dịch vụ email.

Thông tin quan trọng về hồ sơ phải còn trong trang, không chỉ tồn tại vài giây trong toast.

---

# 12. Luồng sinh viên: từ form tĩnh thành trải nghiệm hoàn chỉnh

## 12.1. Cấu trúc trang

Desktop:

- Vùng form chính khoảng 720–800px.
- Vùng tóm tắt bên phải khoảng 280–320px nếu đủ chỗ.
- Tóm tắt gồm đợt, thời hạn, trạng thái và yêu cầu còn thiếu.
- Không thêm các card KPI giả.

Mobile:

- Một cột.
- Tóm tắt ngắn đặt trên form.
- Stepper gọn, không chiếm cả màn hình đầu.
- Footer hành động không che nội dung hoặc bàn phím.

## 12.2. Ba bước thật

### Bước 1 — Thông tin cá nhân

- Họ tên.
- MSSV.
- Email.
- Số điện thoại.
- Lớp/ngành nếu nghiệp vụ yêu cầu.

Phân biệt:

- Dữ liệu tài khoản xác định: readonly.
- Thông tin liên hệ cho phép sửa: editable.
- Người chưa đăng nhập: theo luồng nộp công khai đã được xác định.

Không cho sửa mã định danh chỉ vì đang dùng một form chung.

### Bước 2 — Tiêu chí và minh chứng

- Hiển thị đúng bộ tiêu chí của đợt.
- Nhóm thông tin học tập.
- Nhóm rèn luyện.
- Nhóm ngoại ngữ.
- Nhóm thành tích.
- Minh chứng liên kết với yêu cầu tương ứng.

Không bắt hồ sơ tuyển mới dùng mặc định “GPA năm 2” nếu chưa có quy định phù hợp. Dữ liệu hiện tại có sự khác biệt giữa đối tượng năm nhất và tiêu chí duy trì; cần tách cấu hình.

### Bước 3 — Kiểm tra và gửi

- Tóm tắt các trường.
- Danh sách file.
- Nút sửa từng phần.
- Lỗi/yêu cầu còn thiếu.
- Xác nhận thông tin nếu nghiệp vụ yêu cầu.
- Một nút gửi chính.

Không để người dùng gửi từ bước 2 rồi bước 3 chỉ là trang trí.

## 12.3. Stepper

Trạng thái bước dựa trên dữ liệu:

- Chưa bắt đầu.
- Đang làm.
- Đã đủ thông tin.
- Cần sửa.

Không coi “đã bấm Tiếp tục” đồng nghĩa “đã hoàn thành hợp lệ”.

- Quay lại không mất dữ liệu.
- Bước đã hoàn thành có thể truy cập lại.
- Sửa dữ liệu làm phát sinh lỗi phải cập nhật stepper.
- Bước hiện tại có nhãn chữ, không chỉ màu.

## 12.4. Lưu nháp

- Lưu nội dung biểu mẫu thật.
- Hiển thị thời điểm lưu gần nhất.
- Phân biệt “Đang có thay đổi chưa lưu” và “Đã lưu”.
- Bắt lỗi lưu trữ.
- Không hiện thành công nếu lưu thất bại.
- Khóa lưu trữ có phiên bản, người dùng demo và đợt tuyển sinh.
- Không lưu mật khẩu.
- Có lưu ý không nhập dữ liệu cá nhân thật vào bản mô phỏng.

Tệp đính kèm:

- Không coi tên file trong localStorage là file còn tồn tại.
- Nếu chỉ lưu metadata, sau reload phải yêu cầu chọn lại.
- Nếu cần giữ file trong demo, dùng cơ chế lưu blob thích hợp và giới hạn dung lượng.
- Phải nói rõ mức độ lưu giữ.

## 12.5. Sau khi gửi

Màn hình chuyển sang trạng thái hồ sơ:

- Mã hồ sơ được tạo từ store.
- Đợt tuyển sinh.
- Thời điểm gửi.
- Trạng thái.
- Tóm tắt.
- Lịch sử.
- Hành động còn được phép.

Không reset form rồi chỉ hiện toast.

---

# 13. Thành phần tải minh chứng

Đây là một chi tiết nhỏ nhưng ảnh hưởng rất lớn đến cảm giác sản phẩm.

## 13.1. Trước khi chọn file

- Tên loại minh chứng.
- Yêu cầu định dạng.
- Dung lượng tối đa.
- Nút “Chọn tệp”.
- Vùng kéo thả chỉ xuất hiện nếu có triển khai thật.

Không viết “Kéo thả tệp vào đây” khi chưa xử lý drag-and-drop.

## 13.2. Sau khi chọn file

Một hàng gọn:

- Icon tài liệu.
- Tên file.
- Dung lượng.
- Trạng thái kiểm tra.
- Xem.
- Thay thế.
- Xóa.

Không thêm progress bar giả khi file chỉ được đọc cục bộ.

## 13.3. Lỗi cần có

- Sai định dạng.
- Vượt dung lượng.
- Tệp rỗng.
- Không đọc được.
- Thiếu minh chứng bắt buộc.
- File không còn sau khôi phục bản nháp.

Cấu hình hiện có cho form công khai ghi PDF tối đa 5MB; phải kiểm tra giới hạn này thật. Các form khác đang có định dạng khác nhau cần thống nhất theo yêu cầu từng đợt, không tự áp một luật cho tất cả.

## 13.4. Xem file

- Dùng file người dùng đã chọn hoặc fixture thực sự tồn tại.
- Không tạo tên PDF giả rồi gắn nút “Xem” không làm gì.
- Nếu trình duyệt không xem được, cung cấp tải/mở bằng cách phù hợp.
- Thu hồi object URL khi không còn dùng.

---

# 14. Xét duyệt hồ sơ: màn hình cần được thiết kế kỹ nhất

## 14.1. Danh sách chờ xử lý

Giữ các trường cần nhận diện:

- MSSV và họ tên.
- Lớp.
- Loại hồ sơ.
- Đợt xét tuyển nếu cần phân biệt.
- Điểm theo dữ liệu hiện có.
- Trạng thái.
- Hành động “Xem hồ sơ”.

Không đặt nút Duyệt và Từ chối quá nổi ở mọi dòng khi cán bộ chưa xem hồ sơ.

Nếu nghiệp vụ cho phép duyệt nhanh, đó phải là luồng riêng có xác nhận và đủ thông tin.

## 14.2. Màn chi tiết hồ sơ

Desktop chia hai vùng:

**Vùng chính:**

- Thông tin sinh viên.
- Tiêu chí.
- Minh chứng.
- Nội dung bổ sung.
- Lịch sử xử lý.

**Vùng quyết định:**

- Trạng thái hiện tại.
- Cấp xử lý hiện tại.
- Các điều kiện đã kiểm tra.
- Nhận xét.
- Hành động theo quyền.

Không gọi mọi trạng thái là “Đã duyệt” nếu còn nhiều cấp.

## 14.3. Bảng đối chiếu tiêu chí

Cấu trúc:

| Tiêu chí | Yêu cầu | Giá trị hồ sơ | Minh chứng | Đánh giá |
|---|---|---|---|---|

Lưu ý:

- Giá trị do sinh viên khai khác với kết quả cán bộ xác nhận.
- Không tự đánh dấu đạt nếu chưa có quy tắc.
- “Chưa đánh giá” là trạng thái hợp lệ.
- “Không đạt” không được màu xanh.
- Điểm không được cộng theo công thức tự phát.

## 14.4. Hành động quyết định

Tách ba ý nghĩa:

- Chấp thuận ở cấp hiện tại.
- Yêu cầu bổ sung.
- Từ chối.

Không dùng “Từ chối” nhưng lưu thành “Cần bổ sung”.

Khi yêu cầu bổ sung:

- Bắt buộc ghi rõ thiếu gì.
- Có thể chỉ định phần cần sửa nếu dữ liệu hỗ trợ.
- Sinh viên nhìn thấy nội dung này trong hồ sơ.

Khi từ chối:

- Có lý do.
- Xác nhận trước khi thực hiện.
- Không tự hứa có thể hoàn tác nếu chưa có cơ chế.

Khi chấp thuận:

- Hiển thị đối tượng đang xử lý.
- Ghi nhận quyết định.
- Cập nhật danh sách.
- Giữ filter và vị trí thao tác.
- Thông báo gọn.

## 14.5. Lịch sử

Mỗi sự kiện có:

- Thời điểm.
- Người thao tác.
- Vai trò.
- Hành động.
- Nhận xét.
- Trạng thái trước/sau nếu phù hợp.

Chỉ ghi lịch sử của hành động đã thực sự diễn ra trong demo. Không tạo lịch sử “cho đẹp”.

## 14.6. Phòng Đào tạo và xác nhận cuối

Phải tách:

- Hồ sơ được chấp thuận ở cấp trước.
- Danh sách đủ điều kiện trình.
- Quyết định xác nhận cuối.
- Công bố kết quả nếu có.

Tên nút, điều kiện bật nút và trạng thái đầu ra phải khớp nhau.

Chuỗi cấp duyệt cụ thể cần lấy từ nghiệp vụ; không tự suy ra chỉ từ thứ tự vai trò.

---

# 15. Thiết kế từng nhóm quản trị

## 15.1. Chuyên ngành

Giữ đúng bốn cột theo đặc tả.

Form tạo/sửa:

- Khoa.
- Tên chuyên ngành.

Khoa nên chọn từ danh mục nếu đã có danh mục chuẩn; không tự đổi cấu trúc dữ liệu nghiệp vụ khi chưa kiểm tra.

Trùng:

- Chuẩn hóa khoảng trắng.
- So sánh không phân biệt hoa/thường.
- Kiểm tra cặp khoa + tên ngành.
- Hiện modal nhỏ như đặc tả.
- Đóng cảnh báo không mất form.

Chi tiết:

- Tên khoa/ngành.
- Danh sách lớp.
- Khóa.
- Năm học.
- Trạng thái.
- Phân trang tối đa 10 dòng.

Xóa:

- Có lớp trực thuộc thì chặn.
- Nêu rõ lý do.
- Có đường đi xem lớp liên quan.
- Không dùng thông báo mơ hồ “Không thể thực hiện”.

## 15.2. Lớp

Nhấn mạnh:

- Mã/tên lớp.
- Ngành.
- Khóa.
- Giảng viên.
- Sĩ số/chỉ tiêu.
- Trạng thái.

Chi tiết chia:

- Thông tin lớp.
- Sinh viên.
- Đợt tuyển sinh liên quan.

Sĩ số hiển thị dạng `20 / 30`, không cần progress bar nếu không phục vụ quyết định.

Nếu danh sách demo chỉ chứa vài sinh viên nhưng sĩ số là 20, phải ghi rõ danh sách mẫu chưa đầy đủ hoặc đồng bộ fixture; không trình bày hai con số mâu thuẫn như dữ liệu hoàn chỉnh.

Giữ các ràng buộc hiện có về trùng, chỉ tiêu và liên kết đợt tuyển sinh.

## 15.3. Giảng viên

Form riêng, không dùng generic form hai ô:

- Mã giảng viên.
- Họ tên.
- Email.
- Đơn vị.
- Trạng thái theo dữ liệu hiện có.

Phân quyền là hành động riêng, không trộn lẫn với sửa họ tên/email.

Chi tiết có thông tin phụ trách nếu được cấu hình.

## 15.4. Sinh viên

Tách:

- Dữ liệu tài khoản.
- Thông tin học tập.
- Hồ sơ xét tuyển.
- Trạng thái tài khoản.

Không đánh đồng trạng thái “Đang học” với “Tài khoản hoạt động” hoặc “Hồ sơ đã duyệt”.

Tìm kiếm theo MSSV, tên, email; giữ đầy đủ dấu tiếng Việt trong hiển thị.

## 15.5. Phân quyền

Trình bày được:

- Người được cấp.
- Vai trò.
- Phạm vi.
- Thao tác.

Trước khi lưu thay đổi quan trọng, hiển thị:

- Quyền hiện tại.
- Quyền mới.
- Phạm vi bị ảnh hưởng.

Không tạo một ma trận hàng chục checkbox khi nghiệp vụ hiện tại chưa có quyền chi tiết.

Quyền hiển thị ở frontend chỉ mô phỏng UX, không được tuyên bố là bảo mật production.

## 15.6. Đợt xét tuyển

Form chuyên biệt:

- Mã.
- Tên.
- Loại.
- Đơn vị/phạm vi.
- Thời gian.
- Bộ tiêu chí.
- Trạng thái.

Các trường chưa có dữ liệu phải được xác định là bổ sung schema, không tự tạo giá trị.

Kiểm tra:

- Bắt đầu không sau kết thúc.
- Trạng thái và thời gian không mâu thuẫn vô tình.
- Đợt có hồ sơ không bị sửa/xóa tùy tiện.
- Các view chỉ đọc không có nút sửa hoạt động.

## 15.7. Bộ tiêu chí

Đây là bảng nghiệp vụ, không biến thành các card màu.

Giữ rõ:

- Loại.
- Tên tiêu chí.
- Điều kiện.
- Điểm.
- Thứ tự xét hòa.
- Thao tác.

Form cần cấu trúc cho loại tiêu chí tương ứng, không bắt người dùng viết mọi thứ vào một ô chuỗi.

Nếu tiêu chí thay đổi sau khi có hồ sơ, cần xác định cách quản lý phiên bản; không âm thầm thay yêu cầu của hồ sơ đã nộp.

## 15.8. Danh sách kết quả

- Phân biệt kết quả tạm, đã duyệt và đã xác nhận nếu nghiệp vụ có.
- Hiển thị nguồn đợt.
- Giữ bộ lọc.
- Xuất dữ liệu phải xuất đúng tập đang được mô tả.
- Không thông báo “Đã xuất” nếu chưa tạo file.
- Không thêm nút “Công bố” nếu chưa có luồng nghiệp vụ.

## 15.9. Đặt lại mật khẩu

- Tìm đúng sinh viên.
- Xác nhận đối tượng.
- Nêu tác động.
- Không hiện mật khẩu cũ.
- Không lưu mật khẩu vào localStorage.
- Nếu chỉ là demo, thông báo đúng là thao tác mô phỏng, không nói đã gửi email.

## 15.10. Thông tin cá nhân

- Bố cục gọn.
- Avatar nhỏ, không cần card chân dung chiếm 1/3 màn hình.
- Trường định danh readonly.
- Thông tin được sửa có lưu state thật.
- Đổi mật khẩu tách khỏi cập nhật thông tin cá nhân.

---

# 16. Trạng thái và tính trung thực của giao diện

## 16.1. Không dùng một bộ trạng thái cho mọi thứ

Tách theo miền:

- Trạng thái đợt tuyển sinh.
- Trạng thái hồ sơ.
- Trạng thái lớp.
- Trạng thái tài khoản.
- Kết quả đánh giá tiêu chí.

Ví dụ “Đang hoạt động” của lớp khác với “Đang tiếp nhận” của đợt.

## 16.2. Định danh rõ ràng

Component nhận:

- Miền trạng thái.
- Mã trạng thái.

Không đoán từ text bằng regex.

Nhãn tiếng Việt là lớp hiển thị, không phải nguồn quyết định logic.

Trạng thái không biết:

- Hiển thị trung tính.
- Không tự gán thành công.
- Có dấu hiệu để developer phát hiện cấu hình thiếu.

## 16.3. Thời gian demo

Dữ liệu hiện có ngày tháng 8/2026 nhưng trạng thái có thể vẫn là “Đang mở”.

Chọn một cách và ghi rõ:

1. Demo theo mốc thời gian cố định.
2. Hoặc trạng thái vận hành được cấu hình độc lập, có giải thích rõ.

Không tự cập nhật ngày để nhìn hợp thời nếu người dùng chưa yêu cầu đổi dữ liệu.

Không có countdown giả.

## 16.4. Tương tác mô phỏng nhưng phải nhất quán

- Nộp hồ sơ → hồ sơ xuất hiện trong nguồn dữ liệu demo phù hợp.
- Yêu cầu bổ sung → sinh viên thấy yêu cầu.
- Sửa ngành → lớp liên quan hiển thị đúng.
- Xóa bản ghi → tổng số và phân trang thay đổi.
- Lưu profile → dữ liệu hiển thị lại đúng.

Nếu chưa triển khai một hành động, không để nút giả vờ thành công.

---

# 17. Accessibility và bàn phím

Đây là tiêu chí chất lượng, không phải phần bổ sung cuối cùng.

## 17.1. Bắt buộc

- Một H1 trên mỗi màn.
- Landmark rõ: header, nav, main.
- Skip link.
- Label thật cho input.
- Icon trang trí có `aria-hidden`.
- Icon button có tên.
- Focus nhìn thấy trên cả nền trắng và sidebar.
- Không bỏ outline.
- Không chỉ dùng màu để báo trạng thái.
- Có thể hoàn thành luồng chính bằng bàn phím.

## 17.2. Tương phản

- Text thường: mục tiêu tối thiểu 4.5:1.
- Text lớn: tối thiểu 3:1 theo điều kiện áp dụng.
- Biên/indicator cần thiết của control: kiểm tra 3:1 với vùng kề.
- Đo từng cặp thực tế, không kết luận chỉ từ mã màu.

## 17.3. Modal và drawer

- Focus containment.
- Focus restoration.
- Escape đúng lớp.
- Nền không tương tác.
- Không có focus bị che bởi footer sticky.
- Drawer đóng sau khi chọn mục.
- Không để menu mobile đẩy toàn bộ trang xuống một đoạn dài.

## 17.4. Phóng to và nội dung dài

Kiểm tra:

- Zoom 200%.
- Tên khoa dài.
- Tên người dài.
- Filename dài.
- Nội dung lỗi nhiều dòng.
- Người dùng bật giảm chuyển động.

Không cắt mất hành động quan trọng để giữ chiều cao đẹp.

---

# 18. Motion: ít, có mục đích

## 18.1. Cho phép

- Hover/focus đổi màu: 120–160ms.
- Dropdown xuất hiện: khoảng 140–180ms.
- Modal: khoảng 160–200ms.
- Drawer: khoảng 200–240ms.
- Trạng thái loading thật.
- Chuyển bước form nhẹ nếu không làm mất định hướng.

## 18.2. Không dùng

- Gradient chạy.
- Chấm nhấp nháy.
- Glow pulse.
- Stagger từng dòng bảng.
- Card bay lên.
- Chữ xuất hiện từng ký tự.
- Page entrance 420ms lặp mỗi lần đổi mục.
- Spring nảy cho hộp thoại nghiệp vụ.

## 18.3. Reduced motion

- Tắt chuyển động không thiết yếu.
- Nội dung luôn hiện ngay ở trạng thái cuối.
- Không để CSS animation là điều kiện để nội dung nhìn thấy.
- Không tạo delay giả để “có cảm giác hệ thống đang xử lý”.

---

# 19. Kiến trúc code để model khác triển khai sạch

Không tiếp tục dồn mọi màn hình vào `App.jsx` và thêm CSS ghi đè ở cuối file.

## 19.1. Cấu trúc đề xuất

```text
src/
  app/
    App.jsx
    role-config.js
    navigation.js

  components/
    ui/
      Button.jsx
      IconButton.jsx
      Field.jsx
      Modal.jsx
      Drawer.jsx
      StatusBadge.jsx
      Toast.jsx
      EmptyState.jsx
      Pagination.jsx

    layout/
      PublicLayout.jsx
      WorkspaceLayout.jsx
      Sidebar.jsx
      WorkspaceHeader.jsx
      PageHeader.jsx

    data/
      TablePanel.jsx
      TableToolbar.jsx
      TableActions.jsx

  features/
    public-admissions/
    applications/
    approvals/
    majors/
    classes/
    accounts/
    permissions/
    rounds/
    criteria/
    results/
    profile/

  data/
    fixtures.js
    demo-store.js
    selectors.js
    status-definitions.js

  styles/
    tokens.css
    base.css
    components.css
    layouts.css
```

Đây là hướng tổ chức, không yêu cầu tạo hàng chục file rỗng ngay từ đầu.

## 19.2. Nguyên tắc tách component

- Tách theo trách nhiệm và hành vi.
- Không tạo component cho mọi thẻ div.
- UI primitive không chứa logic quyền nghiệp vụ.
- Feature component không hardcode style riêng khi đã có token.
- Form từng entity có schema riêng.
- Có thể tái sử dụng field nhưng không dùng một generic form sai nghĩa cho mọi entity.

## 19.3. State

- State hiển thị cục bộ: modal, menu, tab.
- State biểu mẫu: từng feature.
- State dữ liệu demo dùng chung: store ở cấp phù hợp.
- Dữ liệu dẫn xuất như số lớp: tính từ cùng nguồn.
- Dùng ID liên kết, không dùng tên hiển thị làm khóa quan hệ.

## 19.4. Điều hướng

Giữ bảy entry hiện có.

Trong workspace:

- Mục đang xem có thể khôi phục từ URL.
- Back/Forward hoạt động.
- Tab/filter quan trọng có thể được giữ trong URL khi hợp lý.
- Chuyển vai trò không mang state sai phạm vi.
- Không dùng `replaceState` cho mọi chuyển trang khiến lịch sử vô dụng.

## 19.5. CSS

- Token là nguồn chuẩn.
- Không thêm `!important` để cứu hàng loạt component.
- Không dùng selector phụ thuộc sâu vào cấu trúc JSX.
- Không dùng `:has()` để che tiêu đề bị render trùng; sửa cấu trúc render.
- Dọn gradient/shadow cũ thay vì chỉ chồng lớp mới.
- Chọn ranh giới rõ giữa utility Tailwind và component CSS.

## 19.6. Dependency

- Ưu tiên thư viện đang có.
- Không cài animation library cho vài transition.
- Không cài bộ chart khi chưa có nhu cầu.
- Không thay toàn bộ UI bằng một kit mặc định rồi đổi màu.
- Nếu thêm dependency, ghi rõ lợi ích và phần nó thay thế.

---

# 20. Các trạng thái bắt buộc phải được thiết kế

Không chỉ làm màn hình có dữ liệu đẹp.

| Thành phần | Trạng thái cần có |
|---|---|
| Danh sách | Có dữ liệu, chưa có dữ liệu, không có kết quả lọc, lỗi nếu có tải dữ liệu |
| Biểu mẫu | Mặc định, đang nhập, lỗi, thay đổi chưa lưu, đang lưu, lưu thất bại |
| Hồ sơ | Nháp, đã gửi, chờ xử lý, cần bổ sung, kết quả |
| File | Chưa chọn, hợp lệ, sai loại, quá lớn, không còn file, đang xem |
| Nút | Mặc định, hover, focus, disabled, pending khi thật sự có |
| Modal | Mở, nội dung dài, lỗi, dirty, modal xác nhận lồng theo nghiệp vụ |
| Phân quyền | Được thao tác, chỉ đọc, ngoài phạm vi, chưa có phân công |
| Điều hướng | Mở, thu gọn, mobile, URL trực tiếp, Back/Forward |

Empty state phải có lý do và hành động phù hợp.

Ví dụ:

- Chưa có lớp: “Chuyên ngành này chưa có lớp trực thuộc.”
- Không có kết quả: “Không tìm thấy lớp phù hợp với bộ lọc.”
- Không có quyền: “Bạn không có quyền xem dữ liệu này.”

Không dùng cùng một thông báo “Không có dữ liệu” cho cả ba.

---

# 21. Lộ trình triển khai theo từng đợt

## Đợt 0 — Chốt baseline và hợp đồng thiết kế

**Việc làm:**

- Đọc lại tài liệu và thay đổi chưa commit.
- Xác nhận đúng thư mục dự án.
- Chạy build ban đầu.
- Chụp các màn hiện tại.
- Lập danh sách menu theo vai trò.
- Phân loại hành động thật, mô phỏng và chưa hoạt động.
- Xác nhận các ràng buộc trong kế hoạch này.

**Đầu ra:**

- Danh mục màn hình.
- Danh mục component.
- Danh mục vấn đề cần sửa.
- Không thay dữ liệu để né lỗi.

**Điều kiện qua đợt:** biết rõ cái gì phải giữ, cái gì sẽ thay.

## Đợt 1 — Token và component nền

**Làm:**

- Màu.
- Font.
- Spacing.
- Button.
- Field.
- Badge.
- Toast.
- Modal.
- Pagination.
- Empty state.

**Điều kiện qua đợt:**

- Component có đủ trạng thái.
- Không còn gradient/glow trong nền tảng.
- Keyboard và focus hoạt động.
- Chữ tiếng Việt hiển thị đúng.

## Đợt 2 — Ba màn chuẩn để chốt thẩm mỹ

Làm trước:

1. Trang công khai.
2. Quản lý chuyên ngành.
3. Hồ sơ sinh viên.

Ba màn đại diện cho:

- Nội dung công khai.
- Bảng quản trị.
- Biểu mẫu nhiều bước.

**Không nhân rộng toàn hệ thống trước khi ba màn này đạt chất lượng.**

Kiểm tra desktop và mobile ở ngay đợt này.

## Đợt 3 — Shell và các bảng quản trị

- Sidebar.
- Header.
- Điều hướng.
- Lớp.
- Giảng viên.
- Sinh viên.
- Phân quyền.
- Đợt tuyển sinh.
- Tiêu chí.
- Profile.

**Điều kiện qua đợt:**

- Một H1.
- Không tràn ngang trang.
- Quyền readonly đúng.
- Table/filter/pagination nhất quán.

## Đợt 4 — Hoàn thiện luồng sinh viên

- Wizard thật.
- Validation.
- Upload.
- Lưu nháp.
- Review.
- Submit.
- Trạng thái sau gửi.

**Điều kiện qua đợt:** đi hết luồng không cần reset trang và không có toast thành công giả.

## Đợt 5 — Hoàn thiện xét duyệt

- Chi tiết hồ sơ.
- Minh chứng.
- Đối chiếu.
- Yêu cầu bổ sung.
- Chấp thuận/từ chối.
- Lịch sử.
- Xác nhận cuối theo nghiệp vụ.

**Điều kiện qua đợt:** các màn liên quan dùng cùng nguồn dữ liệu demo và phản ánh cùng trạng thái.

## Đợt 6 — Responsive, accessibility, polish

- 320–1920px.
- Bàn phím.
- Zoom.
- Reduced motion.
- Tên dài.
- File dài.
- Error state.
- Empty state.
- Focus.
- Contrast.

**Điều kiện qua đợt:** không chỉ trang chủ đẹp; các màn khó cũng dùng được.

## Đợt 7 — Bàn giao

- Build lại.
- Kiểm thử lại.
- Chụp before/after cùng viewport.
- Cập nhật `DESIGN.md` theo đúng mã.
- Ghi rõ chức năng nào vẫn là demo.
- Khởi chạy dự án.
- Mở Chrome để xem nếu môi trường cho phép; không nói đã mở khi chưa mở được.

---

# 22. Ma trận kiểm thử và nghiệm thu

## 22.1. Viewport

Bắt buộc kiểm tra ít nhất:

- 320×800.
- 390×844.
- 768×1024.
- 1024×768.
- 1440×900.
- 1920×1080.

Không cần mọi màn ở mọi kích thước, nhưng phải có đại diện cho public, bảng, form, modal và xét duyệt.

## 22.2. Luồng chức năng

1. Tìm đợt tuyển sinh.
2. Lọc ra danh sách rỗng và đặt lại.
3. Xem đợt đang xét duyệt, không nộp sai trạng thái.
4. Nộp hồ sơ thiếu trường.
5. Chọn PDF quá dung lượng.
6. Lưu nháp rồi mở lại.
7. Quay lại bước trước không mất dữ liệu.
8. Gửi hồ sơ và xem trạng thái.
9. Cán bộ mở đúng hồ sơ.
10. Yêu cầu bổ sung có lý do.
11. Sinh viên thấy yêu cầu.
12. Tạo chuyên ngành trùng.
13. Xóa chuyên ngành có lớp.
14. Sửa ngành không làm đứt liên kết lớp.
15. Lọc bảng rồi chuyển trang.
16. Xóa dòng cuối của trang.
17. Đóng modal bằng Escape.
18. Đóng form có dữ liệu chưa lưu.
19. Dùng vai trò chỉ đọc.
20. Dùng Back/Forward.
21. Thu gọn sidebar rồi điều hướng.
22. Mở menu mobile và chọn mục.

## 22.3. Kiểm tra thị giác

- Không còn gradient chữ.
- Không còn glow.
- Không còn animated stripe.
- Không còn noise nền.
- Không có shadow nhiều lớp trên bảng.
- Không có badge cho mọi metadata.
- Không có label 10–11px khó đọc.
- Header không chiếm quá nhiều màn hình mobile.
- Card không có khoảng trống vô nghĩa.
- CTA không bị đẩy khỏi vùng nhìn thấy do trang trí.
- Tên dài không phá bố cục.
- Các cột bảng thẳng hàng.
- Các nút cùng loại giống nhau trên toàn hệ thống.

## 22.4. Kiểm tra code và runtime

- Build thành công cho cả bảy entry.
- Không lỗi runtime trong các luồng kiểm tra.
- Không warning React về key hoặc controlled/uncontrolled input.
- Không listener bị gắn lặp.
- Không memory leak từ object URL.
- Không mất state do remount ngoài ý muốn.
- Không lưu dữ liệu nhạy cảm vào storage không phù hợp.

**Lưu ý quan trọng:** script `test` hiện tại chỉ chạy build. Build thành công không chứng minh validation, phân quyền giao diện, lưu nháp hoặc luồng duyệt hoạt động. Phải có kiểm thử hành vi riêng.

---

# 23. Định nghĩa “hoàn thành” để tránh model dừng quá sớm

Chỉ coi là hoàn thành khi đủ bốn lớp:

### A. Đẹp

- Có art direction nhất quán.
- Public có bản sắc.
- Workspace gọn.
- Typography và spacing được kiểm tra thật.

### B. Dùng được

- Nút có hành động đúng.
- Form có validation.
- State thay đổi thật trong phạm vi demo.
- Người dùng biết bước tiếp theo.

### C. Không phá nghiệp vụ

- Giữ hierarchy.
- Giữ bốn cột chuyên ngành.
- Giữ giới hạn 10 dòng.
- Giữ ràng buộc xóa/trùng.
- Không mở rộng quyền.
- Không phát minh chính sách.

### D. Có bằng chứng

- Build.
- Kiểm thử luồng.
- Screenshot.
- Danh sách hạn chế còn lại.
- Tài liệu khớp mã.

Nếu thiếu một trong bốn lớp, không gọi là “đã nâng cấp hoàn chỉnh”.

---

# 24. Chỉ dẫn ngắn để giao cho model triển khai

Bạn có thể đưa toàn bộ kế hoạch trên cho model khác, kèm đoạn sau:

> Hãy triển khai kế hoạch này trên dự án IUH Talent hiện có. Đây là nâng cấp sản phẩm đang tồn tại, không phải tạo một dashboard mới từ template.
>
> Giữ logo, màu xanh IUH, bảy entry HTML, sáu vai trò và các ràng buộc nghiệp vụ. Không thêm hero marketing, footer quảng cáo, số liệu giả, gradient chữ, glow, noise hoặc animation trang trí.
>
> Triển khai theo từng đợt. Chốt token và ba màn chuẩn — trang công khai, chuyên ngành, hồ sơ sinh viên — trước khi nhân rộng. Không tiếp tục dồn mã vào App.jsx hoặc chồng CSS override.
>
> Phân biệt rõ cải tiến hình thức và hoàn thiện tương tác. Mọi thông báo thành công phải phản ánh hành động thật trong demo. Không tuyên bố đã gửi email, đã lưu file hoặc đã xác thực nếu chưa có khả năng đó.
>
> Không tự quyết quy chế tuyển sinh, chuỗi cấp duyệt hoặc phạm vi quyền khi tài liệu chưa đủ. Ghi rõ điểm chưa xác định và giữ hành vi an toàn.
>
> Trước khi bàn giao, kiểm tra bảy entry, các vai trò, responsive, bàn phím, modal, upload, lưu nháp, xét duyệt và các ràng buộc chuyên ngành/lớp. Build không thay thế kiểm thử hành vi. Cuối cùng khởi chạy và mở Chrome nếu có thể.

---

**Tóm lại:** bản nâng cấp nên đẹp theo kiểu **một hệ thống đại học được thiết kế rất kỹ**, không phải một giao diện được trang trí rất nhiều. Phần đáng đầu tư nhất là typography tiếng Việt, bố cục bảng, luồng hồ sơ và độ chính xác của trạng thái — đó mới là những thứ khiến IUH Talent có chất lượng riêng và không giống sản phẩm “AI slop”.
