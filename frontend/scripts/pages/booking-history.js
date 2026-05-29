document.addEventListener("DOMContentLoaded", () => {
    const listContainer = document.getElementById("bookings-history-list");

    
    const checkLoginStatus = () => {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    };

    
    const loadUserBookings = (email) => {
        if (!listContainer) return;
        
        fetch(`http://127.0.0.1:5600/api/bookings/user/${email}`)
            .then(res => {
                if (!res.ok) throw new Error("Không thể tải danh sách đơn phòng!");
                return res.json();
            })
            .then(bookings => {
                renderBookingsList(bookings);
            })
            .catch(err => {
                console.error(err);
                listContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">Đã xảy ra lỗi khi tải lịch sử đơn phòng.</div>`;
            });
    };

    
    const handleCancelBooking = (bookingId, email) => {
        fetch(`http://127.0.0.1:5600/api/bookings/${bookingId}/cancel`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
        })
        .then(res => {
            if (!res.ok) throw new Error("Hủy phòng thất bại!");
            return res.json();
        })
        .then(() => {
            Utils.alert("Đã hủy phòng thành công!");
            loadUserBookings(email); 
        })
        .catch(err => {
            console.error(err);
            Utils.alert("Không thể hủy đơn hàng lúc này. Vui lòng liên hệ hỗ trợ!");
        });
    };

    
    const renderBookingsList = (bookings) => {
        if (!listContainer) return;
        listContainer.innerHTML = "";

        if (bookings.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state text-center">
                    <i class="fa-solid fa-hotel empty-icon"></i>
                    <h3>Chưa có đơn đặt phòng nào</h3>
                    <p>Bạn chưa thực hiện giao dịch đặt phòng nào trên hệ thống.</p>
                    <a href="../home/index.html" class="btn-action-primary" style="margin-top: 10px; display: inline-block;">Tìm khách sạn ngay</a>
                </div>
            `;
            return;
        }

        const user = checkLoginStatus();

        bookings.forEach(booking => {
            const card = document.createElement("div");
            card.className = "history-card";
            
            
            const isConfirmed = booking.status === "Đã xác nhận" || booking.status === "Chờ thanh toán";
            const isCancelled = booking.status === "Đã hủy";
            const statusClass = isCancelled ? "status-cancelled" : "status-confirmed";

            
            const cancelButtonHTML = !isCancelled
                ? `<button class="btn-cancel-booking" data-id="${booking.id}"><i class="fa-solid fa-calendar-xmark"></i> Hủy phòng</button>`
                : '';

            
            const formatShowDate = (dateStr) => {
                if (!dateStr) return '';
                const parts = dateStr.split('-');
                if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`; 
                return dateStr;
            };

            
            const getDiffNights = (inDate, outDate) => {
                const date1 = new Date(inDate);
                const date2 = new Date(outDate);
                const diffTime = Math.abs(date2 - date1);
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            };
            const nights = getDiffNights(booking.check_in, booking.check_out);

            let paymentIcon = "fa-solid fa-credit-card";
            if (booking.payment_method === "Ví MoMo") {
                paymentIcon = "fa-solid fa-wallet";
            } else if (booking.payment_method === "Chuyển khoản ngân hàng") {
                paymentIcon = "fa-solid fa-building-columns";
            }

            card.innerHTML = `
                <div class="history-card-header d-flex justify-between align-center">
                    <div class="header-left">
                        <span class="booking-id-tag">Mã đơn: <strong>MT${booking.id}</strong></span>
                        <span class="booking-date-tag">Đặt ngày: ${booking.created_at || ''}</span>
                    </div>
                    <div class="booking-status-badge ${statusClass}">${booking.status.toUpperCase()}</div>
                </div>
                
                <div class="history-card-body d-flex gap-10">
                    <img src="${booking.hotel_img}" alt="Hotel" class="history-hotel-img">
                    <div class="history-hotel-details flex-1">
                        <h3 class="hotel-name">${booking.hotel_name}</h3>
                        <p class="room-name">${booking.room_name}</p>
                        <div class="booking-dates-row d-flex gap-10">
                            <div><strong>Check-in:</strong> ${formatShowDate(booking.check_in)}</div>
                            <div><strong>Check-out:</strong> ${formatShowDate(booking.check_out)}</div>
                        </div>
                        <div class="booking-meta">
                            <span>${nights} đêm | ${booking.guests}</span>
                            <span class="payment-method-tag"><i class="${paymentIcon}"></i> ${booking.payment_method || 'Thẻ tín dụng / Thẻ ghi nợ'}</span>
                        </div>
                    </div>
                </div>

                <div class="history-card-footer d-flex justify-between align-center">
                    <div class="price-box">
                        <span class="total-label">Tổng thanh toán:</span>
                        <span class="total-amount">${booking.total_price.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div class="action-box">
                        ${cancelButtonHTML}
                    </div>
                </div>
            `;
            listContainer.appendChild(card);
        });

        document.querySelectorAll(".btn-cancel-booking").forEach(btn => {
            btn.addEventListener("click", () => {
                const bookingId = btn.getAttribute("data-id");
                Utils.confirm(`Bạn có chắc chắn muốn hủy đơn đặt phòng mã số MT${bookingId} không?`).then(ok => {
                    if (ok) {
                        handleCancelBooking(bookingId, user.email);
                    }
                });
            });
        });
    };

    
    const initHistory = () => {
        if (!listContainer) return;
        
        const user = checkLoginStatus();
        if (!user) {
            listContainer.innerHTML = `
                <div class="empty-state text-center">
                    <i class="fa-solid fa-user-lock empty-icon"></i>
                    <h3>Vui lòng đăng nhập</h3>
                    <p>Đăng nhập tài khoản để quản lý các đơn đặt phòng của bạn.</p>
                    <button class="btn-action-primary" id="btn-login-history" style="margin-top: 10px;">Đăng nhập ngay</button>
                </div>
            `;

            const btnLogin = document.getElementById("btn-login-history");
            if (btnLogin) {
                btnLogin.addEventListener("click", () => {
                    const navLoginBtn = document.getElementById("navbar-login-btn");
                    if (navLoginBtn) navLoginBtn.click();
                });
            }
            return;
        }

        loadUserBookings(user.email);
    };

    
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if (key === "user") {
            initHistory();
        }
    };

    
    initHistory();
});
