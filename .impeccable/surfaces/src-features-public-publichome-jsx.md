---
version: 1
slug: "src-features-public-publichome-jsx"
primary_target: "src/features/public/PublicHome.jsx"
related_targets: ["src/components/layout/AuthShell.jsx","src/app/WorkspaceLayout.jsx"]
---

# Cổng xét tuyển CN/KSTN IUH — trang công khai, xác thực và workspace

Scope: trang chủ công khai (Persuade), trang xác thực (Persuade nhẹ), workspace các vai trò (Operate, hiệu ứng tiết chế). Người xem đầu tiên: hội đồng/GV chấm đồ án qua máy chiếu; sau đó sinh viên và cán bộ khoa/PĐT. Giữ nguyên nghiệp vụ, luồng thao tác; không dark mode; được viết lại câu chữ cho tự nhiên nhưng đúng nghiệp vụ.

## Direction contract

THESIS: Bộ nhận diện IUH 2025 chơi thẳng và trọn vẹn: chevron vươn lên và góc bo chữ U của logo là ngữ pháp của cả hệ; mọi chuỗi có thứ tự (5 giai đoạn ĐXT, 3 cấp phê duyệt, wizard) là các chevron nối nhau. Từ chối banner xanh phẳng + lưới thẻ bằng nhau của mọi cổng tuyển sinh.

OWN-WORLD: Trường xanh IUH #153898 phủ cả vùng (hero, sidebar, khung xác thực), mực xanh thẫm #0A1A40, vàng ngọn lửa #F9B200 chỉ một điểm nhấn mỗi vùng (CTA trên nền xanh, chevron hiện tại). Nền sáng ánh lam. Be Vietnam Pro 800 cho tiêu đề, 400–600 cho chữ. Module chevron dải đứng của logo; góc bo lớn một phía như nét chữ U trên khối chủ đạo; nút bo tròn.

STORY: Người xem nhận ra ngay đây là cổng chính thức của IUH thế hệ mới; hiểu rằng đợt xét tuyển không công khai (A-25), phải đăng ký bằng email sinh viên IUH và hệ thống sẽ hiện đợt theo ngành, khóa; thấy sáu bước ai làm gì; bấm Đăng ký hoặc Đăng nhập trong vài giây.

FIRST VIEWPORT: Khối xanh IUH phủ ~2/3 chiều cao, góc dưới trái bo chữ U; nền là trường chevron 3D (three.js) xếp tầng, nổi lên theo con trỏ, vài chevron vàng. Trái trên: logo trắng và nav, nút Đăng nhập vàng. Tiêu đề cỡ lớn “Xét tuyển Cử nhân tài năng & Kỹ sư tài năng”, một câu dẫn nói rõ đợt không công khai, nút vàng “Đăng ký tài khoản sinh viên” + nút viền “Đăng nhập” ngay dưới. Mép dưới khối xanh, tấm trắng bo tròn chồng lên chứa quy trình sáu bước dạng chuỗi chevron, bước kế tiếp của người xem tô vàng.

FORM: Hệ nhận diện IUH 2025 — chevron vươn lên; hướng thứ 4 trong danh sách grounded gốc (vòng an toàn do người dùng chọn). seed:f700a1f3af94f618. Tương tác chữ ký: trường chevron 3D phản ứng con trỏ; chevron tiến trình lấp đầy lần lượt khi vào khung; chỉ báo tab/sidebar trượt theo lựa chọn. Chuyển động: một lần nổi lên từ dưới, ease-out mũ, tắt khi reduced-motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Ảnh khuôn viên thật: không dùng; thương hiệu do hệ chevron gánh.
