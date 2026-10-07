
## 👨‍💻 Tác giả
*Trường An

# Medicare - Nền tảng Đặt lịch & Quản lý khám chữa bệnh
> Nền tảng web hiện đại hỗ trợ đặt lịch khám bệnh trực tuyến, quản lý hồ sơ bệnh án, lịch làm việc của bác sĩ và quản trị phòng khám

## Giới thiệu về dự án 
**Medicare** là ứng dụng được xây dựng nhằm số hóa quy trình khám chữa bệnh tại các cơ sở y tế. Hệ thống phục vụ 4 nhóm người dùng chính với giao diện và phân quyền riêng biệt:

1. **Bệnh nhân (Patient):** Tra cứu bác sĩ, chuyên khoa, gói khám, đặt lịch hẹn trực tuyến, theo dõi hồ sơ bệnh án và lịch sử thanh toán.
2. **Bác sĩ (Doctor):** Xem lịch làm việc hàng ngày, tiếp nhận bệnh nhân, tạo/cập nhật hồ sơ bệnh án và đơn thuốc.
3. **Nhân viên y tế (Staff):** Tìm kiếm, tiếp đón bệnh nhân và hỗ trợ đặt lịch trực tiếp tại quầy.
4. **Quản trị viên (Admin):** Quản trị danh mục thuốc, bệnh lý, chuyên khoa, khung giờ khám (TimeSlots), phân quyền tài khoản, thống kê doanh thu và báo cáo tổng quan.

---

## 🚀 Các mô-đun chức năng chính

### 1. Xác thực & Phân quyền (Authentication & Authorization)
- Đăng ký, đăng nhập tài khoản bệnh nhân / nhân viên y tế.
- Cơ chế xác thực an toàn bằng JWT (JSON Web Token) / Refresh Token.
- Quên mật khẩu, đặt lại mật khẩu qua email xác nhận.
- Middleware kiểm tra vai trò người dùng (`Admin`, `Doctor`, `Staff`, `Patient`).

### 2. Quản lý Danh mục Y tế (Catalog Management)
- **Chuyên khoa (Specialties):** Quản lý danh mục các khoa khám bệnh và bác sĩ trực thuộc.
- **Bệnh học (Diseases):** Danh mục phân loại bệnh lý.
- **Danh mục Thuốc (Medicines):** Quản lý kho thuốc, đơn vị tính, cách dùng.
- **Khung giờ (Time Slots):** Cấu hình thời gian khám linh hoạt theo ca sáng / chiều / tối.

### 3. Đặt lịch & Lịch làm việc (Appointments & Schedules)
- Quản lý ca làm việc của bác sĩ theo ngày/tuần.
- Kiểm tra trùng lịch và khóa khung giờ tự động khi có lịch hẹn đã xác nhận.
- Đặt lịch trực tiếp tại quầy dành cho lễ tân (`Book for Patient`).
- Theo dõi trạng thái lịch hẹn: `Pending` ➔ `Confirmed` ➔ `Completed` / `Cancelled`.

### 4. Hồ sơ Bệnh án Điện tử (Medical Records)
- Bác sĩ tạo và cập nhật hồ sơ bệnh án sau mỗi ca khám.
- Ghi nhận triệu chứng, chẩn đoán, phác đồ điều trị và kê đơn thuốc kèm hướng dẫn.
- Bệnh nhân tra cứu lịch sử bệnh án và đơn thuốc trực tuyến.

### 5. Thanh toán & Hóa đơn (Payments & Invoices)
- Tạo giao dịch thanh toán cho từng ca khám hoặc gói dịch vụ khám chữa bệnh.
- Tích hợp cổng thanh toán trực tuyến (VNPay / MoMo / Stripe hoặc giả lập).
- Webhook / IPN xử lý kết quả thanh toán tự động và cập nhật trạng thái lịch hẹn.

### 6. Thông báo (Notification Service)
- Thông báo trạng thái đặt lịch, nhắc nhở lịch hẹn khám bệnh.
- Thông báo cập nhật kết quả bệnh án và thanh toán thành công.
---

## 🚀 Công nghệ sử dụng
* Ngôn ngữ: Java
* Framework: SpringBoot 3.5.14
* Database: MS-SQL
