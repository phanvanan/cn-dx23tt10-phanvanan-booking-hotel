# Báo cáo tiến độ - Tuần 3

**Họ tên:** Phan Văn Ân  
**MSSV:** 170123231  
**Lớp:** DX23TT10  
**Tuần:** 3 (từ ngày 11/05/2026 đến ngày 13/05/2026)

---

## Công việc đã làm

- Xây dựng trang chi tiết phòng (`hotel-detail`): hiển thị hình ảnh phòng, thông tin đầy đủ và đánh giá của khách hàng
- Tích hợp Flatpickr để chọn ngày nhận phòng và trả phòng
- Xây dựng trang đặt phòng (`hotel-checkout`): nhập thông tin khách, chọn số người lưu trú, xem tổng tiền theo số đêm
- Viết API backend: lấy chi tiết phòng, lấy đánh giá, tạo đơn đặt phòng mới, cập nhật trạng thái phòng

## Kết quả đạt được

- Người dùng xem ảnh và đánh giá phòng trước khi đặt
- Hệ thống tính tiền đúng theo số đêm ở (ngày trả - ngày nhận)
- Thông tin đặt phòng lưu vào database, trạng thái phòng tự động cập nhật thành "Đã đặt"

## Khó khăn gặp phải

- Tính số đêm giữa 2 ngày ban đầu sai do lệch múi giờ, phải xử lý lại
- Validate dữ liệu form trước khi gửi lên server mất thêm thời gian

## Kế hoạch tuần tới

- Xây dựng trang xác nhận đặt phòng
- Xây dựng tính năng mã giảm giá (coupon)
- Xây dựng trang lịch sử đặt phòng cho người dùng
