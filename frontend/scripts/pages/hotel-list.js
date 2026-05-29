document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") || "";
    const location = params.get("location") || "";

    const container = document.getElementById("hotel-list-container");

    let listHotels = [];
    let originalHotels = [];
    let currentPage = 1;
    const limit = 5;

    function renderPagination() {
        const paginationContainer = document.getElementById("pagination-container");
        if (!paginationContainer) return;
        paginationContainer.innerHTML = "";
        const totalPages = Math.ceil(listHotels.length / limit);
        if (totalPages <= 1) {
            paginationContainer.style.display = "none";
            return;
        }
        paginationContainer.style.display = "flex";
        if (currentPage > 1) {
            const prevBtn = document.createElement("button");
            prevBtn.className = "btn-page";
            prevBtn.textContent = "Trước";
            prevBtn.onclick = () => {
                currentPage--;
                renderList();
                renderPagination();
            };
            paginationContainer.appendChild(prevBtn);
        }
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement("button");
            pageBtn.className = "btn-page" + (i === currentPage ? " active" : "");
            pageBtn.textContent = i;
            pageBtn.onclick = () => {
                currentPage = i;
                renderList();
                renderPagination();
            };
            paginationContainer.appendChild(pageBtn);
        }
        if (currentPage < totalPages) {
            const nextBtn = document.createElement("button");
            nextBtn.className = "btn-page";
            nextBtn.textContent = "Tiếp";
            nextBtn.onclick = () => {
                currentPage++;
                renderList();
                renderPagination();
            };
            paginationContainer.appendChild(nextBtn);
        }
    }

    function renderList() {
        if (!container) return;
        container.innerHTML = "";

        const subtitleEl = document.querySelector(".result-subtitle");
        if (subtitleEl) {
            subtitleEl.textContent = `Tìm thấy ${listHotels.length} chỗ nghỉ`;
        }

        if (listHotels.length === 0) {
            container.innerHTML = `<div class="no-results">Không tìm thấy chỗ nghỉ phù hợp!</div>`;
            return;
        }

        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        const hotelsToDisplay = listHotels.slice(startIndex, endIndex);

        hotelsToDisplay.forEach(h => {
            const stars = Math.round(parseFloat(h.rating)) || 5;
            const starIcons = Array(stars).fill('<i class="fa-solid fa-star"></i>').join('');
            
            const ratingScore = h.rating ? parseFloat(h.rating) : 5.0;
            let ratingText = "Tốt";
            if (ratingScore >= 4.8) ratingText = "Xuất sắc";
            else if (ratingScore >= 4.5) ratingText = "Tuyệt vời";
            else if (ratingScore >= 4.0) ratingText = "Rất tốt";

            const reviewsCount = h.reviews_count || 0;
            const locationText = h.location || "";
            const priceFinal = h.price || 0;
            const priceOrg = Math.round(priceFinal / 0.8);

            const card = document.createElement("div");
            card.className = "hotel-horizontal-card";
            card.onclick = () => {
                window.location.href = `../hotel-detail/index.html?id=${h.id}`;
            };

            card.innerHTML = `
                <div class="card-img-left">
                    <img src="${h.img}" alt="${h.name}">
                </div>
                <div class="card-content-right">
                    <div class="info-main">
                        <h3 class="hotel-name">${h.name} <span class="stars ms-5">${starIcons}</span></h3>
                        <p class="hotel-location"><i class="fa-solid fa-location-dot"></i> ${locationText}</p>
                        <div class="hotel-tags">
                            <span class="tag highlight">Giảm 20%</span>
                            <span class="tag">Hồ bơi</span>
                            <span class="tag">Bữa sáng tuyệt hảo</span>
                            <span class="tag">Trung tâm</span>
                        </div>
                    </div>
                    <div class="price-section">
                        <div class="rating-box">
                            <div class="rating-text-group">
                                <div class="rating-word">${ratingText}</div>
                                <div class="review-count">${reviewsCount} đánh giá</div>
                            </div>
                            <div class="rating-score">${ratingScore.toFixed(1)}/5</div>
                        </div>
                        <div class="text-right w-100">
                            <div class="price-org">${priceOrg.toLocaleString('vi-VN')} ₫</div>
                            <div class="price-final">${priceFinal.toLocaleString('vi-VN')} ₫ <span class="price-unit">/đêm</span></div>
                            <button class="btn-book">Xem phòng</button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    const titleEl = document.querySelector(".result-title");
    const breadcrumbSpan = document.querySelector(".breadcrumb-container span");
    let typeText = "Chỗ nghỉ";
    if (type === "hotel") typeText = "Khách sạn";
    else if (type === "homestay") typeText = "Nhà trọ / Homestay";

    const displayTitle = location ? `${typeText} tại ${location}` : `Tất cả ${typeText.toLowerCase()}`;
    if (titleEl) titleEl.textContent = displayTitle;
    if (breadcrumbSpan) breadcrumbSpan.textContent = displayTitle;

    const sortItems = document.querySelectorAll(".sort-item");
    sortItems.forEach(item => {
        item.addEventListener("click", () => {
            sortItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            currentPage = 1;
            applySort();
            renderList();
            renderPagination();
        });
    });

    function applySort() {
        const activeSort = document.querySelector(".sort-item.active");
        if (!activeSort) return;

        const sortText = activeSort.textContent.trim();
        if (sortText === "Nổi bật nhất") {
            listHotels = [...originalHotels];
        } else if (sortText === "Giá: Thấp đến Cao") {
            listHotels.sort((a, b) => a.price - b.price);
        } else if (sortText === "Giá: Cao đến Thấp") {
            listHotels.sort((a, b) => b.price - a.price);
        } else if (sortText === "Đánh giá cao nhất") {
            listHotels.sort((a, b) => {
                const rA = parseFloat(a.rating) || 0;
                const rB = parseFloat(b.rating) || 0;
                return rB - rA;
            });
        }
    }

    let url = "http://127.0.0.1:5600/api/hotels";
    const queryParts = [];
    if (type) queryParts.push(`type=${encodeURIComponent(type)}`);
    if (location) queryParts.push(`location=${encodeURIComponent(location)}`);
    if (queryParts.length > 0) {
        url += "?" + queryParts.join("&");
    }

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("Lỗi tải dữ liệu!");
            return res.json();
        })
        .then(data => {
            originalHotels = [...data];
            listHotels = data;
            currentPage = 1;
            applySort();
            renderList();
            renderPagination();
        })
        .catch(err => {
            console.error(err);
            if (container) {
                container.innerHTML = `<div class="no-results">Đã xảy ra lỗi khi tải danh sách chỗ nghỉ.</div>`;
            }
        });
});
