# Báo cáo tiến độ - Tuần 4

**Họ tên:** Phan Văn Ân  
**MSSV:** 170123231  
**Lớp:** DX23TT10  
**Tuần:** 4 (từ ngày ... đến ngày ...)

---

## Công việc đã làm

- Xây dựng trang xác nhận đặt phòng (`hotel-confirm`): hiển thị lại toàn bộ thông tin trước khi hoàn tất
- Xây dựng tính năng mã giảm giá (`coupons`): nhập mã, kiểm tra hợp lệ, tự động trừ số tiền tương ứng
- Xây dựng trang lịch sử đặt phòng (`booking-history`): hiển thị các đơn đã đặt kèm trạng thái (chờ xác nhận, đã xác nhận, đã hủy)
- Viết API backend: kiểm tra mã giảm giá, lấy lịch sử đặt phòng theo tài khoản đã đăng nhập

## Kết quả đạt được

- Người dùng nhập mã giảm giá, hệ thống trừ đúng số tiền và hiển thị tổng mới
- Trang xác nhận hiển thị đầy đủ thông tin: phòng, ngày, số người, tổng tiền sau giảm giá
- Người dùng đăng nhập xem được toàn bộ lịch sử đặt phòng của mình

## Khó khăn gặp phải

- Xử lý trạng thái coupon (hết hạn, đã dùng đủ số lần, còn hiệu lực) cần kiểm tra nhiều điều kiện
- Trang lịch sử lúc đầu load chậm do query chưa tối ưu, đã sửa lại

## Kế hoạch tuần tới

- Xây dựng trang quản trị (admin): quản lý phòng, đơn đặt phòng, khách hàng
- Xây dựng trang cẩm nang du lịch (`guides`)
- Hoàn thiện giao diện toàn bộ các trang
