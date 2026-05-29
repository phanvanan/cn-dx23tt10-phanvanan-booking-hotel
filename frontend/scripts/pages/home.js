document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("featured-hotel-list");
    const tabs = document.querySelectorAll(".loc-tab");
    let allHotels = [];

    
    const loadHotels = () => {
        fetch("http://127.0.0.1:5600/api/hotels")
            .then(res => {
                if (!res.ok) throw new Error("Không thể tải danh sách khách sạn!");
                return res.json();
            })
            .then(data => {
                allHotels = data;
                renderHotels("all");
            })
            .catch(err => {
                console.error(err);
                if (container) {
                    container.innerHTML = `<div class="grid-col-all text-center text-muted p-md">Đã xảy ra lỗi khi kết nối tới Server.</div>`;
                }
            });
    };

    const renderHotels = (locationKey) => {
        if (!container) return;
        container.innerHTML = ""; 

        
        const filteredHotels = allHotels.filter(hotel => {
            if (locationKey === "all") return true;
            
            
            const hotelLoc = hotel.location.toLowerCase();
            if (locationKey === "phuquoc") return hotelLoc.includes("phú quốc") || hotelLoc.includes("phu quoc");
            if (locationKey === "nhatrang") return hotelLoc.includes("nha trang");
            if (locationKey === "dalat") return hotelLoc.includes("đà lạt") || hotelLoc.includes("da lat");
            if (locationKey === "hanoi") return hotelLoc.includes("hà nội") || hotelLoc.includes("ha noi");
            return false;
        });

        if (filteredHotels.length === 0) {
            container.innerHTML = `<div class="grid-col-all text-center text-muted p-md">Không có khách sạn nào tại khu vực này.</div>`;
            return;
        }

        filteredHotels.forEach(hotel => {
            const card = document.createElement("div");
            card.className = "hotel-card";
            
            const stars = Math.round(parseFloat(hotel.rating)) || 5;
            const starsHtml = '<i class="fa-solid fa-star"></i>'.repeat(stars);
            const priceOrg = hotel.price * 1.25;
            const promo = "Giảm 20%";
            
            let ratingText = "Rất tốt";
            if (hotel.rating >= 4.8) ratingText = "Xuất sắc";
            else if (hotel.rating >= 4.6) ratingText = "Tuyệt vời";

            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${hotel.img}" alt="${hotel.name}">
                    <div class="tag-promo">${promo}</div>
                </div>
                <div class="hotel-info">
                    <div class="hotel-name">${hotel.name}</div>
                    <div class="hotel-stars">${starsHtml}</div>
                    <div class="hotel-rating">
                        <span class="score">${hotel.rating}/5</span>
                        <span class="rating-text">${ratingText}</span>
                        <span class="review-count">(${hotel.reviews_count} đánh giá)</span>
                    </div>
                    <div class="hotel-loc">
                        <i class="fa-solid fa-location-dot"></i> ${hotel.location}
                    </div>
                    <div class="hotel-price-box">
                        <div class="price-original">${Utils.formatCurrency(priceOrg)}</div>
                        <div class="price-final">${Utils.formatCurrency(hotel.price)} <span class="price-unit">/đêm</span></div>
                    </div>
                </div>
            `;

            card.addEventListener("click", () => {
                localStorage.setItem("selectedHotelId", hotel.id);
                window.location.href = `../hotel-detail/index.html?id=${hotel.id}`;
            });

            container.appendChild(card);
        });
    };

    
    loadHotels();

    
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            renderHotels(tab.dataset.loc);
        });
    });
});
