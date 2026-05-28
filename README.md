# 🏨 Hệ Thống Đặt Phòng Khách Sạn

> **Môn học:** Công nghệ mạng - Đồ án cuối kỳ  
> **Sinh viên:** Phan Văn Ân  
> **MSSV:** 170123231  
> **Lớp:** DX23TT10  
> **Giảng viên hướng dẫn:** *(tên giảng viên)*

---

## 📋 Giới thiệu dự án

Hệ thống đặt phòng khách sạn trực tuyến cho phép người dùng tìm kiếm, xem chi tiết và đặt phòng khách sạn theo địa điểm và ngày ở. Hệ thống bao gồm giao diện người dùng (Frontend), máy chủ xử lý nghiệp vụ (Backend) và cơ sở dữ liệu quan hệ (PostgreSQL).

---

## ⚙️ Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Backend | Python, Flask, Flask-CORS |
| Cơ sở dữ liệu | PostgreSQL |
| Thư viện chọn ngày | Flatpickr |
| Kết nối DB | psycopg2-binary |

---

## 🗂️ Cấu trúc dự án

```
source/
├── backend/
│   ├── app.py              # Máy chủ Flask - định nghĩa toàn bộ API
│   ├── db.py               # Kết nối và khởi tạo cơ sở dữ liệu
│   └── requirements.txt    # Danh sách thư viện Python cần cài
│
└── frontend/
    ├── assets/
    │   └── images/         # Hình ảnh khách sạn, địa điểm, banner
    ├── pages/
    │   ├── home/           # Trang chủ
    │   ├── hotel-list/     # Danh sách khách sạn
    │   ├── hotel-detail/   # Chi tiết khách sạn
    │   ├── hotel-checkout/ # Trang thanh toán
    │   ├── hotel-confirm/  # Xác nhận đặt phòng
    │   ├── booking-history/# Lịch sử đặt phòng
    │   ├── coupons/        # Mã giảm giá
    │   ├── guides/         # Hướng dẫn du lịch
    │   └── admin/          # Trang quản trị
    ├── scripts/
    │   ├── core/
    │   │   ├── api.js      # Giao tiếp với Backend API
    │   │   └── utils.js    # Hàm tiện ích dùng chung
    │   ├── components/
    │   │   ├── navbar.js   # Thanh điều hướng
    │   │   ├── footer.js   # Chân trang
    │   │   └── searchBar.js# Thanh tìm kiếm
    │   └── pages/          # Logic riêng từng trang
    └── styles/
        ├── global.css      # CSS toàn cục
        ├── components.css  # CSS các thành phần dùng chung
        └── pages/          # CSS riêng từng trang
```

---

## 🚀 Hướng dẫn chạy dự án

### Yêu cầu hệ thống

- Python 3.11
- PostgreSQL đang chạy (local, port 5432)
- Trình duyệt web hiện đại (Chrome, Firefox, Edge)

### Bước 1 — Cài đặt thư viện Python

```bash
cd backend
pip install -r requirements.txt
```

### Bước 2 — Cấu hình cơ sở dữ liệu

Đảm bảo PostgreSQL đang chạy với thông tin kết nối mặc định:

```
Host:     localhost
Port:     5432
User:     postgres
Password: 123456
Database: booking_hotel
```

### Bước 3 — Khởi động Backend

```bash
cd backend
python app.py
```

Backend chạy tại: `http://localhost:5600`

### Bước 4 — Mở Frontend

Mở trực tiếp file trong trình duyệt:

```
frontend/pages/home/index.html
```

Hoặc dùng extension **Live Server** trong VS Code để chạy trên `http://127.0.0.1:5600`.

---

## 📌 Các chức năng đã thực hiện

### 👤 Người dùng
- [x] Trang chủ — hiển thị địa điểm nổi bật, khách sạn gợi ý
- [x] Tìm kiếm khách sạn theo địa điểm, ngày nhận/trả phòng, số khách
- [x] Xem danh sách khách sạn với bộ lọc (giá, hạng sao, tiện nghi)
- [x] Xem chi tiết khách sạn (ảnh, mô tả, tiện nghi, đánh giá)
- [x] Đặt phòng và thanh toán
- [x] Xác nhận đặt phòng
- [x] Xem lịch sử đặt phòng
- [x] Áp dụng mã giảm giá (coupon)
- [x] Đọc hướng dẫn du lịch theo địa điểm

### 🛠️ Quản trị viên
- [x] Quản lý khách sạn (thêm, sửa, xoá)
- [x] Quản lý đặt phòng
- [x] Quản lý mã giảm giá
- [x] Quản lý bài viết hướng dẫn du lịch
- [x] Thống kê doanh thu

---

## 🗃️ Cơ sở dữ liệu

Hệ thống sử dụng **PostgreSQL** với các bảng chính:

| Bảng | Mô tả |
|---|---|
| `users` | Thông tin tài khoản người dùng |
| `hotels` | Thông tin khách sạn |
| `rooms` | Loại phòng và giá |
| `bookings` | Thông tin đặt phòng |
| `coupons` | Mã giảm giá |
| `reviews` | Đánh giá của khách hàng |
| `guides` | Bài viết hướng dẫn du lịch |
| `destinations` | Địa điểm du lịch |

---

## 📡 API Endpoints chính

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/hotels` | Lấy danh sách khách sạn |
| GET | `/api/hotels/:id` | Chi tiết khách sạn |
| GET | `/api/hotels/search` | Tìm kiếm khách sạn |
| POST | `/api/bookings` | Tạo đặt phòng mới |
| GET | `/api/bookings/history` | Lịch sử đặt phòng |
| POST | `/api/coupons/validate` | Kiểm tra mã giảm giá |
| GET | `/api/guides` | Danh sách bài viết du lịch |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Đăng ký tài khoản |

---

## 📅 Lịch sử phát triển

| Thời gian | Nội dung |
|---|---|
| Tuần 1–2 | Phân tích yêu cầu, thiết kế CSDL, dựng cấu trúc dự án |
| Tuần 3–4 | Xây dựng Backend (Flask API), kết nối PostgreSQL |
| Tuần 5–6 | Xây dựng Frontend — trang chủ, danh sách, chi tiết khách sạn |
| Tuần 7–8 | Tính năng đặt phòng, thanh toán, xác nhận |
| Tuần 9–10 | Trang admin, lịch sử đặt phòng, mã giảm giá |
| Tuần 11–12 | Hoàn thiện UI/UX, test, fix bug, viết tài liệu |

---

## 👨‍💻 Tác giả

| Thông tin | Chi tiết |
|---|---|
| Họ tên | Phan Văn Ân |
| MSSV | 170123231 |
| Lớp | DX23TT10 |
| Email | anpv090398@sv-onuni.edu.vn |
| GitHub | [phanvanan](https://github.com/phanvanan) |

<!-- Edit: Improve project overview in README -->
<!-- Edit: Document database tables in README -->