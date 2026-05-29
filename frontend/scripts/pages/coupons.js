document.addEventListener("DOMContentLoaded", () => {
    const couponsContainer = document.getElementById("coupons-container");
    const toast = document.getElementById("toast-message");
    let allCoupons = [];

    
    const loadCoupons = () => {
        fetch("http://127.0.0.1:5600/api/coupons")
            .then(res => {
                if (!res.ok) throw new Error("Không thể tải danh sách coupon!");
                return res.json();
            })
            .then(data => {
                allCoupons = data;
                renderCoupons("all");
            })
            .catch(err => {
                console.error(err);
                if (couponsContainer) {
                    couponsContainer.innerHTML = `<div class="grid-col-all text-center text-muted p-md">Đã xảy ra lỗi khi tải danh sách phiếu giảm giá.</div>`;
                }
            });
    };

    
    const renderCoupons = (categoryFilter = "all") => {
        if (!couponsContainer) return;
        couponsContainer.innerHTML = "";

        
        const filtered = allCoupons;

        if (filtered.length === 0) {
            couponsContainer.innerHTML = `
                <div class="no-coupons text-center grid-col-all p-md">
                    <i class="fa-solid fa-ticket-simple"></i>
                    <p>Hiện tại không có phiếu giảm giá nào.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(coupon => {
            const card = document.createElement("div");
            card.className = "coupon-card";
            
            
            const discountValue = `${coupon.discount_percent}%`;
            const discountTitle = `Khuyến mãi ${coupon.discount_percent}%`;
            const condition = `Áp dụng cho hóa đơn từ ${coupon.min_spend.toLocaleString('vi-VN')} ₫`;
            const expiry = "Hạn dùng: 31/12/2026";
            const badge = coupon.discount_percent >= 30 ? "HOT DEAL" : "Ưu đãi đặt phòng";
            const badgeClass = coupon.discount_percent >= 30 ? "coupon-badge-hot" : "coupon-badge-inline";

            card.innerHTML = `
                <!-- Bên trái: Chi tiết coupon -->
                <div class="coupon-left-part flex-1">
                    <div class="coupon-discount-box">
                        <span class="discount-value">${discountValue}</span>
                        <span class="discount-unit">GIẢM</span>
                    </div>
                    <div class="coupon-info-desc">
                        <span class="${badgeClass}">${badge}</span>
                        <h3 class="coupon-title">${discountTitle}</h3>
                        <p class="coupon-cond">${condition}</p>
                        <p class="coupon-exp">${expiry}</p>
                        <p class="coupon-exp text-muted f-italic">${coupon.description || ''}</p>
                    </div>
                </div>
                <!-- Đường răng cưa chia hai phần của thẻ -->
                <div class="coupon-divider-stub">
                    <div class="notch top-notch"></div>
                    <div class="dashed-line"></div>
                    <div class="notch bottom-notch"></div>
                </div>
                <!-- Bên phải: Stub lấy mã -->
                <div class="coupon-right-part text-center">
                    <div class="coupon-code-label">MÃ GIẢM GIÁ</div>
                    <div class="coupon-code-value">${coupon.code}</div>
                    <button class="btn-copy-coupon" data-code="${coupon.code}">Sao chép mã</button>
                </div>
            `;
            couponsContainer.appendChild(card);
        });

        
        const copyButtons = couponsContainer.querySelectorAll(".btn-copy-coupon");
        copyButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const code = e.target.dataset.code;
                
                navigator.clipboard.writeText(code).then(() => {
                    if (toast) {
                        toast.classList.remove("hidden");
                        toast.classList.add("show");
                        
                        setTimeout(() => {
                            toast.classList.remove("show");
                            toast.classList.add("hidden");
                        }, 2000);
                    }

                    const originalText = btn.textContent;
                    btn.textContent = "Đã sao chép";
                    btn.classList.add("copied");
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.classList.remove("copied");
                    }, 2000);
                }).catch(err => {
                    console.error("Không thể sao chép mã: ", err);
                });
            });
        });
    };

    
    const tabs = document.querySelectorAll(".coupon-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            const category = tab.dataset.category;
            
            if (category === "all") {
                renderCoupons();
            } else {
                couponsContainer.innerHTML = "";
                const filtered = allCoupons.filter(c => {
                    if (category === "newuser") return c.code.includes("WELCOME");
                    if (category === "partner") return c.code.includes("SUPER");
                    return !c.code.includes("WELCOME") && !c.code.includes("SUPER");
                });
                renderCouponsFiltered(filtered);
            }
        });
    });

    const renderCouponsFiltered = (filteredList) => {
        if (!couponsContainer) return;
        if (filteredList.length === 0) {
            couponsContainer.innerHTML = `
                <div class="no-coupons text-center grid-col-all p-md">
                    <i class="fa-solid fa-ticket-simple"></i>
                    <p>Không có phiếu giảm giá nào phù hợp.</p>
                </div>
            `;
            return;
        }
        
        filteredList.forEach(coupon => {
            const card = document.createElement("div");
            card.className = "coupon-card";
            const discountValue = `${coupon.discount_percent}%`;
            const discountTitle = `Khuyến mãi ${coupon.discount_percent}%`;
            const condition = `Áp dụng cho hóa đơn từ ${coupon.min_spend.toLocaleString('vi-VN')} ₫`;
            const expiry = "Hạn dùng: 31/12/2026";
            const badge = coupon.discount_percent >= 30 ? "HOT DEAL" : "Ưu đãi đặt phòng";
            const badgeClass = coupon.discount_percent >= 30 ? "coupon-badge-hot" : "coupon-badge-inline";

            card.innerHTML = `
                <div class="coupon-left-part flex-1">
                    <div class="coupon-discount-box">
                        <span class="discount-value">${discountValue}</span>
                        <span class="discount-unit">GIẢM</span>
                    </div>
                    <div class="coupon-info-desc">
                        <span class="${badgeClass}">${badge}</span>
                        <h3 class="coupon-title">${discountTitle}</h3>
                        <p class="coupon-cond">${condition}</p>
                        <p class="coupon-exp">${expiry}</p>
                        <p class="coupon-exp text-muted f-italic">${coupon.description || ''}</p>
                    </div>
                </div>
                <div class="coupon-divider-stub">
                    <div class="notch top-notch"></div>
                    <div class="dashed-line"></div>
                    <div class="notch bottom-notch"></div>
                </div>
                <div class="coupon-right-part text-center">
                    <div class="coupon-code-label">MÃ GIẢM GIÁ</div>
                    <div class="coupon-code-value">${coupon.code}</div>
                    <button class="btn-copy-coupon" data-code="${coupon.code}">Sao chép mã</button>
                </div>
            `;
            couponsContainer.appendChild(card);
        });

        
        const copyButtons = couponsContainer.querySelectorAll(".btn-copy-coupon");
        copyButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const code = e.target.dataset.code;
                navigator.clipboard.writeText(code).then(() => {
                    if (toast) {
                        toast.classList.remove("hidden");
                        toast.classList.add("show");
                        setTimeout(() => {
                            toast.classList.remove("show");
                            toast.classList.add("hidden");
                        }, 2000);
                    }
                    const originalText = btn.textContent;
                    btn.textContent = "Đã sao chép";
                    btn.classList.add("copied");
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.classList.remove("copied");
                    }, 2000);
                });
            });
        });
    };

    
    loadCoupons();
});
