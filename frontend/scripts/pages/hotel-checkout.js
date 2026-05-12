document.addEventListener("DOMContentLoaded", () => {
    
    const getSelectedRoom = () => {
        const roomStr = localStorage.getItem("selectedRoom");
        if (roomStr) {
            return JSON.parse(roomStr);
        }
        return null;
    };

    const bookingSummaryData = getSelectedRoom();
    if (!bookingSummaryData) {
        Utils.alert("Bạn chưa chọn phòng nào để thanh toán! Hệ thống sẽ chuyển hướng bạn về trang chủ.").then(() => {
            window.location.href = "../home/index.html";
        });
        return;
    }

    if (!bookingSummaryData.checkIn || !bookingSummaryData.checkOut) {
        const dateRangeStr = localStorage.getItem("search_date_range") || "";
        if (dateRangeStr.includes(" đến ")) {
            const parts = dateRangeStr.split(" đến ");
            bookingSummaryData.checkIn = parts[0];
            bookingSummaryData.checkOut = parts[1];
        } else {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const format = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            bookingSummaryData.checkIn = format(today);
            bookingSummaryData.checkOut = format(tomorrow);
        }
        localStorage.setItem("selectedRoom", JSON.stringify(bookingSummaryData));
    }
    const hotelId = localStorage.getItem("selectedHotelId") || 1;

    
    const specialRequestsData = [
        "Phòng không hút thuốc",
        "Phòng tầng cao",
        "Nhận phòng sớm",
        "Giường đôi lớn",
        "Yêu cầu yên tĩnh"
    ];

    const paymentMethodsData = [
        { id: "pay-card", name: "Thẻ tín dụng / Thẻ ghi nợ", icon: "fa-regular fa-credit-card", active: true },
        { id: "pay-momo", name: "Ví MoMo", icon: "fa-solid fa-wallet", active: false },
        { id: "pay-bank", name: "Chuyển khoản ngân hàng", icon: "fa-solid fa-building-columns", active: false }
    ];

    
    const autofillUserData = () => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            const nameInput = document.getElementById("guest-name");
            const emailInput = document.getElementById("guest-email");
            if (nameInput) nameInput.value = user.name;
            if (emailInput) emailInput.value = user.email;
        }
    };

    
    const requestsContainer = document.getElementById("special-requests-container");
    if(requestsContainer) {
        requestsContainer.innerHTML = specialRequestsData.map(req => `
            <label class="checkbox-item">
                <input type="checkbox" name="special-req" value="${req}">
                <span class="fs-sm">${req}</span>
            </label>
        `).join("");
    }

    
    const paymentContainer = document.getElementById("payment-methods-container");
    if(paymentContainer) {
        paymentContainer.innerHTML = paymentMethodsData.map(method => `
            <label class="payment-option ${method.active ? 'active' : ''}">
                <input type="radio" name="payment-method" value="${method.name}" ${method.active ? 'checked' : ''}>
                <i class="${method.icon} payment-icon"></i>
                <span class="fs-sm fw-500">${method.name}</span>
            </label>
        `).join("");

        const options = paymentContainer.querySelectorAll(".payment-option");
        options.forEach(opt => {
            opt.addEventListener("click", () => {
                options.forEach(o => o.classList.remove("active"));
                opt.classList.add("active");
                const radio = opt.querySelector("input[type='radio']");
                if (radio) radio.checked = true;
            });
        });
    }

    
    const summaryContainer = document.getElementById("booking-summary-container");
    if(summaryContainer) {
        const roomTotal = bookingSummaryData.pricePerNight * bookingSummaryData.nights;
        let grandTotal = roomTotal + bookingSummaryData.taxes;
        let discountAmount = 0;
        let appliedCouponCode = "";

        const updateSummaryUI = () => {
            summaryContainer.innerHTML = `
                <img src="${bookingSummaryData.hotelImage}" alt="Hotel Image" class="summary-hotel-img">
                <h3 class="summary-hotel-name">${bookingSummaryData.hotelName}</h3>
                <p class="summary-room-name">${bookingSummaryData.roomName}</p>
                
                <div class="summary-dates">
                    <div class="date-box">
                        <p>Nhận phòng</p>
                        <span>${bookingSummaryData.checkIn}</span>
                    </div>
                    <div class="date-box">
                        <p>Trả phòng</p>
                        <span>${bookingSummaryData.checkOut}</span>
                    </div>
                </div>
                
                <div class="price-row">
                    <span>Giá phòng (${bookingSummaryData.nights} đêm)</span>
                    <span>${roomTotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div class="price-row">
                    <span>Thuế và Phí</span>
                    <span>${bookingSummaryData.taxes.toLocaleString('vi-VN')} ₫</span>
                </div>
                ${discountAmount > 0 ? `
                <div class="price-row price-row-discount">
                    <span>Khuyến mãi (${appliedCouponCode})</span>
                    <span>-${discountAmount.toLocaleString('vi-VN')} ₫</span>
                </div>` : ''}
                
                <div class="promo-box">
                    <label class="fs-xs fw-600 text-muted d-block mb-5">Mã giảm giá</label>
                    <div class="d-flex gap-8">
                        <input type="text" id="coupon-code" value="${appliedCouponCode}" placeholder="Ví dụ: WELCOME10" class="flex-1 coupon-input" ${appliedCouponCode ? 'disabled' : ''}>
                        <button id="btn-apply-coupon" class="btn-primary btn-apply-coupon" ${appliedCouponCode ? 'disabled' : ''}>Áp dụng</button>
                    </div>
                    <div id="coupon-message" class="coupon-message fs-xs"></div>
                </div>

                <div class="price-total">
                    <span>Tổng tiền</span>
                    <span class="amount">${grandTotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                
                <button class="btn-checkout" id="btn-submit-booking">Thanh toán ngay</button>
            `;

            
            const btnApply = document.getElementById("btn-apply-coupon");
            if (btnApply) {
                btnApply.addEventListener("click", () => {
                    const code = document.getElementById("coupon-code").value.trim();
                    const msgEl = document.getElementById("coupon-message");
                    if (!code) return;

                    fetch("http://127.0.0.1:5600/api/coupons/apply", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code: code, total_price: roomTotal + bookingSummaryData.taxes })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.error) {
                            msgEl.className = "coupon-message fs-xs show error";
                            msgEl.textContent = data.error;
                        } else {
                            discountAmount = data.discount_amount;
                            grandTotal = data.final_price;
                            appliedCouponCode = code.toUpperCase();
                            updateSummaryUI(); 
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        msgEl.className = "coupon-message fs-xs show error";
                        msgEl.textContent = "Không thể kiểm tra mã lúc này.";
                    });
                });
            }

            
            const btnSubmit = document.getElementById("btn-submit-booking");
            if (btnSubmit) {
                btnSubmit.addEventListener("click", () => {
                    const guestName = document.getElementById("guest-name").value.trim();
                    const guestPhone = document.getElementById("guest-phone").value.trim();
                    const guestEmail = document.getElementById("guest-email").value.trim();

                    if (!guestName || !guestPhone || !guestEmail) {
                        Utils.alert("Vui lòng điền đầy đủ Thông tin liên hệ!");
                        return;
                    }

                    
                    const parseDateToISO = (dateStr) => {
                        if (!dateStr) return null;
                        const parts = dateStr.split('/');
                        if (parts.length === 3) {
                            return `${parts[2]}-${parts[1]}-${parts[0]}`;
                        }
                        return dateStr;
                    };

                    const paymentMethodInput = document.querySelector("input[name='payment-method']:checked");
                    const paymentMethod = paymentMethodInput ? paymentMethodInput.value : "Thẻ tín dụng / Thẻ ghi nợ";

                    const bookingBody = {
                        user_email: guestEmail,
                        hotel_id: parseInt(hotelId, 10),
                        room_name: bookingSummaryData.roomName,
                        price_per_night: bookingSummaryData.pricePerNight,
                        check_in: parseDateToISO(bookingSummaryData.checkIn),
                        check_out: parseDateToISO(bookingSummaryData.checkOut),
                        guests: bookingSummaryData.guests,
                        total_price: grandTotal,
                        payment_method: paymentMethod
                    };

                    
                    fetch("http://127.0.0.1:5600/api/bookings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(bookingBody)
                    })
                    .then(res => {
                        if (!res.ok) throw new Error("Gửi đơn hàng thất bại!");
                        return res.json();
                    })
                    .then(data => {
                        
                        const bookingConfirmInfo = {
                            bookingId: "MT" + data.booking_id,
                            hotelName: bookingSummaryData.hotelName,
                            hotelImage: bookingSummaryData.hotelImage,
                            roomName: bookingSummaryData.roomName,
                            checkIn: bookingSummaryData.checkIn,
                            checkOut: bookingSummaryData.checkOut,
                            nights: bookingSummaryData.nights,
                            guests: bookingSummaryData.guests,
                            pricePerNight: bookingSummaryData.pricePerNight,
                            taxes: bookingSummaryData.taxes,
                            totalAmount: grandTotal,
                            guestName: guestName,
                            guestPhone: guestPhone,
                            guestEmail: guestEmail,
                            paymentMethod: paymentMethod,
                            status: "Đã xác nhận",
                            bookingDate: new Date().toLocaleDateString('vi-VN')
                        };
                        localStorage.setItem("currentBooking", JSON.stringify(bookingConfirmInfo));
                        
                        
                        window.location.href = "../hotel-confirm/index.html";
                    })
                    .catch(err => {
                        console.error(err);
                        Utils.alert("Hệ thống gặp sự cố khi lưu đơn đặt phòng. Vui lòng thử lại!");
                    });
                });
            }
        };

        
        updateSummaryUI();
        autofillUserData();
    }
});
