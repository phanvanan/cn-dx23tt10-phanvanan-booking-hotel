document.addEventListener("DOMContentLoaded", () => {
    
    const getBookingData = () => {
        const bookingStr = localStorage.getItem("currentBooking");
        return bookingStr ? JSON.parse(bookingStr) : null;
    };

    const booking = getBookingData();
    const detailsContainer = document.getElementById("confirm-details-container");
    const qrContainer = document.getElementById("confirm-qr-container");

    if (!booking) {
        if (detailsContainer) {
            detailsContainer.innerHTML = `
                <div class="error-msg text-center p-md">
                    <i class="fa-solid fa-triangle-exclamation icon-warning-confirm"></i>
                    <p>Không tìm thấy thông tin đơn đặt phòng vừa thực hiện.</p>
                    <a href="../home/index.html" class="link-home">Quay lại trang chủ</a>
                </div>
            `;
        }
        return;
    }

    
    if (detailsContainer) {
        
        const requestsHTML = booking.specialRequests && booking.specialRequests.length > 0
            ? booking.specialRequests.map(req => `<span class="confirm-tag">${req}</span>`).join('')
            : '<span class="text-muted fs-sm">Không có yêu cầu nào</span>';

        detailsContainer.innerHTML = `
            <div class="confirm-section d-flex align-center gap-10">
                <img src="${booking.hotelImage}" alt="Hotel" class="confirm-hotel-img">
                <div>
                    <h2 class="confirm-hotel-name">${booking.hotelName}</h2>
                    <p class="confirm-room-name">${booking.roomName}</p>
                </div>
            </div>

            <div class="confirm-section-grid">
                <div class="info-item">
                    <label>Mã đặt phòng</label>
                    <span class="value-highlight">${booking.bookingId}</span>
                </div>
                <div class="info-item">
                    <label>Ngày đặt phòng</label>
                    <span>${booking.bookingDate}</span>
                </div>
                <div class="info-item">
                    <label>Nhận phòng (Check-in)</label>
                    <span class="date-val">${booking.checkIn}</span>
                </div>
                <div class="info-item">
                    <label>Trả phòng (Check-out)</label>
                    <span class="date-val">${booking.checkOut}</span>
                </div>
                <div class="info-item">
                    <label>Thời gian lưu trú</label>
                    <span>${booking.nights} đêm (${booking.guests})</span>
                </div>
                <div class="info-item">
                    <label>Phương thức thanh toán</label>
                    <span>${booking.paymentMethod}</span>
                </div>
            </div>

            <div class="confirm-section-divider"></div>

            <h3 class="section-part-title">Thông tin khách hàng</h3>
            <div class="confirm-section-grid">
                <div class="info-item">
                    <label>Họ và Tên</label>
                    <span>${booking.guestName}</span>
                </div>
                <div class="info-item">
                    <label>Số điện thoại</label>
                    <span>${booking.guestPhone}</span>
                </div>
                <div class="info-item grid-span-2">
                    <label>Email liên hệ</label>
                    <span>${booking.guestEmail}</span>
                </div>
            </div>

            <div class="confirm-section-divider"></div>

            <h3 class="section-part-title">Yêu cầu đặc biệt</h3>
            <div class="confirm-requests-box d-flex flex-wrap gap-5">
                ${requestsHTML}
            </div>
        `;
    }

    
    if (qrContainer) {
        qrContainer.innerHTML = `
            <div class="qr-card">
                <div class="qr-wrapper">
                    <!-- Tạo mã vạch hoặc mã QR giả lập sang trọng bằng CSS -->
                    <div class="qr-mock">
                        <i class="fa-solid fa-qrcode"></i>
                    </div>
                </div>
                <div class="qr-code-text">${booking.bookingId}</div>
                <p class="qr-instruction">Quét mã này tại quầy lễ tân khi check-in để nhận phòng nhanh chóng.</p>
            </div>
            
            <div class="confirm-price-summary">
                <div class="d-flex justify-between font-sm">
                    <span class="text-muted">Tổng tiền phòng:</span>
                    <span>${(booking.pricePerNight * booking.nights).toLocaleString('vi-VN')} ₫</span>
                </div>
                <div class="d-flex justify-between font-sm">
                    <span class="text-muted">Thuế & Phí:</span>
                    <span>${booking.taxes.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div class="confirm-price-divider"></div>
                <div class="d-flex justify-between align-center">
                    <span class="total-label">Tổng thanh toán:</span>
                    <span class="total-val">${booking.totalAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div class="payment-status-badge">ĐÃ THANH TOÁN</div>
            </div>
        `;
    }
});
