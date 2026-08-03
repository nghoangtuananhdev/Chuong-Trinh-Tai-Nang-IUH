
# Mô tả chi tiết hệ thống

## Cấu trúc phân cấp từ ngành đến lớp: 
Khoa → Ngành → Lớp
Đặc tả: Trường có nhiều khoa, Mỗi khoa có thể có nhiều ngành, một ngành thì sẽ có nhiều lớp. Tuy nhiên mỗi ngành chỉ có các lớp chỉ thuộc một khóa của một năm học. 
VD: 
- Khoa Công nghệ thông tin có ngành Kỹ thuật phần mềm có các lớp KSTN dành cho khóa 20, 21, 22, ...
- Khoa Công nghệ thông tin có ngành Hệ thống thông tin có các lớp KSTN dành cho khóa 20, 21, 22, ...
- Khoa Quản trị kinh doanh có ngành Marketing có các lớp CNTN dành cho khóa 20, 21, 22, ...

Ở giao diện của chức năng "Chuyên ngành toàn trường", bạn chỉ cần hiển thị table chứa các cột: "Khoa", "Chuyên ngành", "Số lượng lớp", "Thao tác".
Chức năng tạo: 
Hệ thống khi ấn nút "Thêm chuyên ngành mới" sẽ hiển thị một modal, modal đó sẽ yêu cầu nhập tên khoa và tên chuyên ngành, lưu ý là nếu trùng thông tin cả hai ô với một chuyên ngành có sẵn thì hệ thống sẽ hiển thị thông báo lên một modal nhỏ nữa để thông báo rằng đã có chuyên ngành giống hệt được tạo trước đó.  
Chức năng xóa: 
Không được xóa chuyên ngành khi đã có lớp KSTN được tạo cho chuyên ngành đó. 
LƯU Ý ĐẶC BIỆT DÀNH CHO HỆ THỐNG: KHi cấu trúc phân lớp đã được thành lập, thành phần con phải được xóa trước thành phần cha. 

Chức năng cập nhật: 
Mở ra modal cho phép chỉnh sửa lại tên khoa và chuyên ngành

Chức năng Xem chi tiết:
Xem được danh sách các lớp KSTN mà chuyên ngành đang có và trạng thái của chúng. 

Các chức năng này sẽ được thể hiện dưới dạng Icon ở bên cột "Thao tác", riêng nút "Thêm chuyên ngành mới" sẽ được nằm ở trên cùng của danh sách. 
LƯU Ý ĐẶC BIỆT DÀNH CHO HỆ THỐNG: Các giao diện Table của Website trong cách Section đều có chức năng "Phân trang" Một trang tối đa 10 dòng trên table. 

