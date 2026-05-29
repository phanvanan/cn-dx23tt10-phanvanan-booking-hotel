document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hotelId = urlParams.get("id") || localStorage.getItem("selectedHotelId") || 1;
    localStorage.setItem("selectedHotelId", hotelId);
    let galleryImages = [];

    
    const loadHotelDetail = () => {
        const checkIn = localStorage.getItem("search_check_in") || "";
        const checkOut = localStorage.getItem("search_check_out") || "";
        const adults = parseInt(localStorage.getItem("search_adults") || "1", 10);
        const children = parseInt(localStorage.getItem("search_children") || "0", 10);
        const totalGuests = adults + children;

        const parseDateToISO = (dateStr) => {
            if (!dateStr) return "";
            const parts = dateStr.split("/");
            if (parts.length !== 3) return "";
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        };

        const checkInISO = parseDateToISO(checkIn);
        const checkOutISO = parseDateToISO(checkOut);

        let url = `http://127.0.0.1:5600/api/hotels/${hotelId}`;
        const queryParams = [];
        if (checkInISO && checkOutISO) {
            queryParams.push(`check_in=${checkInISO}`);
            queryParams.push(`check_out=${checkOutISO}`);
        }
        if (totalGuests) {
            queryParams.push(`guests=${totalGuests}`);
        }
        if (queryParams.length > 0) {
            url += `?${queryParams.join("&")}`;
        }

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("Không thể tải thông tin khách sạn!");
                return res.json();
            })
            .then(hotel => {
                renderHotelInfo(hotel);
                renderRooms(hotel);
                renderReviews(hotel);
                setupLightbox(hotel.img);
            })
            .catch(err => {
                console.error(err);
                const roomContainer = document.getElementById("room-list-container");
                if (roomContainer) {
                    roomContainer.innerHTML = `<div class="text-center text-muted p-md fs-sm">Đã xảy ra lỗi khi kết nối tới Server.</div>`;
                }
            });
    };

    
    const renderHotelInfo = (hotel) => {
        const titleEl = document.querySelector(".hotel-title");
        const addressEl = document.querySelector(".hotel-address");
        const breadcrumbSpan = document.querySelector(".breadcrumb-container span");
        const breadcrumbLink = document.querySelector(".breadcrumb-container a:nth-of-type(2)");

        if (titleEl) {
            const stars = Math.round(parseFloat(hotel.rating)) || 5;
            titleEl.innerHTML = `${hotel.name} <span class="stars">${'<i class="fa-solid fa-star"></i>'.repeat(stars)}</span>`;
        }
        if (addressEl) {
            addressEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${hotel.location}`;
        }
        if (breadcrumbSpan) {
            breadcrumbSpan.textContent = hotel.name;
        }
        if (breadcrumbLink) {
            const locName = hotel.location.split(',')[0].trim();
            const typeVal = hotel.type || "hotel";
            breadcrumbLink.textContent = `${typeVal === "homestay" ? "Nhà trọ / Homestay" : "Khách sạn"} tại ${locName}`;
            breadcrumbLink.href = `../hotel-list/index.html?type=${typeVal}&location=${encodeURIComponent(locName)}`;
        }

        
        galleryImages = [
            hotel.img,
            "../../assets/images/hotel_2.png",
            "../../assets/images/hotel_3.png",
            "../../assets/images/hotel_4.png",
            hotel.img
        ];

        const galleryContainer = document.getElementById("hotel-gallery-container");
        if (galleryContainer) {
            galleryContainer.innerHTML = galleryImages.map((img, idx) => {
                let className = `gallery-img img-sub-${idx}`;
                if (idx === 0) className = "gallery-img img-main";
                return `<img src="${img}" alt="Hotel Image ${idx + 1}" class="${className}" data-index="${idx}">`;
            }).join('');
        }
    };

    
    const renderRooms = (hotel) => {
        const roomContainer = document.getElementById("room-list-container");
        if (!roomContainer) return;
        roomContainer.innerHTML = "";

        if (!hotel.rooms || hotel.rooms.length === 0) {
            roomContainer.innerHTML = `<div class="text-center text-muted p-md fs-sm">Không còn phòng trống phù hợp với khoảng thời gian và số khách đã chọn. Vui lòng chọn ngày khác.</div>`;
            return;
        }

        hotel.rooms.forEach(room => {
            const roomSize = room.capacity === 1 ? 20 : (room.capacity === 2 ? 30 : (room.capacity === 3 ? 45 : 60));
            const amenitiesList = (room.amenities && room.amenities.length > 0)
                ? room.amenities
                : ["Wifi miễn phí", "Điều hòa", "Truyền hình cáp"];
            
            const amenitiesHTML = amenitiesList.map(ame => {
                const isRed = ame.includes("Không hoàn tiền") || ame.includes("Hủy muộn");
                return `
                <div class="benefit-item ${isRed ? 'text-red' : 'text-green'}">
                    <i class="fa-solid ${isRed ? 'fa-xmark' : 'fa-check'}"></i> ${ame}
                </div>
                `;
            }).join('');

            const capacityIcons = Array(room.capacity).fill('<i class="fa-solid fa-user"></i>').join('');
            const priceOrg = room.price * 1.25;

            const row = document.createElement("div");
            row.className = "room-row";
            row.innerHTML = `
                <!-- Col 1: Thông tin phòng -->
                <div class="room-type-col">
                    <h3 class="room-name">${room.name}</h3>
                    <div class="room-img-box">
                        <img src="${room.img || hotel.img}" alt="${room.name}">
                    </div>
                    <div class="room-amenities">
                        <div><i class="fa-solid fa-ruler-combined"></i> Kích thước: ${roomSize}m²</div>
                        <div><i class="fa-solid fa-bed"></i> Giường: ${room.bed_type}</div>
                    </div>
                </div>
                
                <!-- Col 2: Tiện ích & Tùy chọn -->
                <div class="room-options-col">
                    ${amenitiesHTML}
                </div>
                
                <!-- Col 3: Sức chứa -->
                <div class="room-capacity-col">
                    ${capacityIcons}
                </div>
                
                <!-- Col 4: Giá và Đặt -->
                <div class="room-price-col">
                    <div class="room-price-org">${priceOrg.toLocaleString('vi-VN')} ₫</div>
                    <div class="room-price-final">${room.price.toLocaleString('vi-VN')} ₫ <span class="room-price-unit">/đêm</span></div>
                    <button class="btn-book-room">Đặt ngay</button>
                </div>
            `;
            roomContainer.appendChild(row);

            
            const btnBook = row.querySelector(".btn-book-room");
            if (btnBook) {
                btnBook.addEventListener("click", () => {
                    let nightsVal = 1;
                    let checkInVal = "";
                    let checkOutVal = "";
                    const dateRangeStr = localStorage.getItem("search_date_range") || "";
                    if (dateRangeStr.includes(" đến ")) {
                        const parts = dateRangeStr.split(" đến ");
                        checkInVal = parts[0];
                        checkOutVal = parts[1];
                        const parseDate = (str) => {
                            const [d, m, y] = str.split("/").map(Number);
                            return new Date(y, m - 1, d);
                        };
                        const d1 = parseDate(parts[0]);
                        const d2 = parseDate(parts[1]);
                        const timeDiff = d2.getTime() - d1.getTime();
                        nightsVal = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        if (nightsVal <= 0) nightsVal = 1;
                    } else {
                        const today = new Date();
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        const format = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                        checkInVal = format(today);
                        checkOutVal = format(tomorrow);
                    }
                    const selectedRoom = {
                        hotelName: hotel.name,
                        hotelImage: room.img || hotel.img,
                        roomName: room.name,
                        pricePerNight: room.price,
                        nights: nightsVal,
                        guests: `${room.capacity} Người lớn`,
                        taxes: 250000,
                        checkIn: checkInVal,
                        checkOut: checkOutVal
                    };
                    localStorage.setItem("selectedRoom", JSON.stringify(selectedRoom));
                    window.location.href = "../hotel-checkout/index.html";
                });
            }
        });
    };

    
    const renderReviews = (hotel) => {
        const reviewsContainer = document.getElementById("reviews-container");
        if (!reviewsContainer) return;

        
        let ratingText = "Rất tốt";
        if (hotel.rating >= 4.8) ratingText = "Xuất sắc";
        else if (hotel.rating >= 4.6) ratingText = "Tuyệt vời";
        else if (hotel.rating >= 4.0) ratingText = "Tốt";
        else ratingText = "Trung bình";

        fetch(`http://127.0.0.1:5600/api/hotels/${hotelId}/reviews`)
            .then(res => {
                if (!res.ok) throw new Error("Không thể tải danh sách đánh giá!");
                return res.json();
            })
            .then(reviews => {
                const baseRating = hotel.rating || 5.0;
                const scoreLocation = Math.min(5.0, baseRating + 0.1);
                const scoreCleanliness = Math.min(5.0, baseRating);
                const scoreService = Math.min(5.0, baseRating);
                const scoreFacilities = Math.max(1.0, baseRating - 0.1);

                const pctLocation = (scoreLocation / 5) * 100;
                const pctCleanliness = (scoreCleanliness / 5) * 100;
                const pctService = (scoreService / 5) * 100;
                const pctFacilities = (scoreFacilities / 5) * 100;

                const ratingsSummaryHTML = `
                    <div class="reviews-summary-card d-flex align-center">
                        <div class="summary-score-box text-center">
                            <div class="big-score">${hotel.rating ? hotel.rating.toFixed(1) : "5.0"}</div>
                            <div class="score-label">${ratingText}</div>
                            <div class="total-reviews">${hotel.reviews_count.toLocaleString('vi-VN')} đánh giá</div>
                        </div>
                        <div class="summary-details-box flex-1">
                            <div class="rating-bar-row d-flex align-center">
                                <span class="bar-label">Vị trí</span>
                                <div class="bar-bg"><div class="bar-fill" style="width: ${pctLocation}%;"></div></div>
                                <span class="bar-score">${scoreLocation.toFixed(1)}/5</span>
                            </div>
                            <div class="rating-bar-row d-flex align-center">
                                <span class="bar-label">Sạch sẽ</span>
                                <div class="bar-bg"><div class="bar-fill" style="width: ${pctCleanliness}%;"></div></div>
                                <span class="bar-score">${scoreCleanliness.toFixed(1)}/5</span>
                            </div>
                            <div class="rating-bar-row d-flex align-center">
                                <span class="bar-label">Dịch vụ</span>
                                <div class="bar-bg"><div class="bar-fill" style="width: ${pctService}%;"></div></div>
                                <span class="bar-score">${scoreService.toFixed(1)}/5</span>
                            </div>
                            <div class="rating-bar-row d-flex align-center">
                                <span class="bar-label">Tiện nghi</span>
                                <div class="bar-bg"><div class="bar-fill" style="width: ${pctFacilities}%;"></div></div>
                                <span class="bar-score">${scoreFacilities.toFixed(1)}/5</span>
                            </div>
                        </div>
                    </div>
                `;

                let reviewsListHTML = "";
                if (!reviews || reviews.length === 0) {
                    reviewsListHTML = `<div class="text-center text-muted p-md fs-sm">Chưa có đánh giá nào cho khách sạn này. Hãy là người đầu tiên đánh giá!</div>`;
                } else {
                    reviewsListHTML = reviews.map(rev => `
                        <div class="review-card">
                            <div class="review-header d-flex justify-between align-center">
                                <div class="user-info d-flex align-center">
                                    <div class="user-avatar"><i class="fa-solid fa-user"></i></div>
                                    <div>
                                        <div class="user-name">${rev.user_name}</div>
                                        <div class="review-date">${rev.created_at || "Vừa xong"}</div>
                                    </div>
                                </div>
                                <div class="user-score"><i class="fa-solid fa-star"></i> ${rev.rating.toFixed(1)}/5</div>
                            </div>
                            <p class="review-content-text">${rev.content}</p>
                        </div>
                    `).join('');
                }

                reviewsContainer.innerHTML = ratingsSummaryHTML + `<div class="reviews-list">${reviewsListHTML}</div>`;
            })
            .catch(err => {
                console.error(err);
                reviewsContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 10px;">Không thể kết nối đến cơ sở dữ liệu để lấy đánh giá.</div>`;
            });
    };

    
    const autoFillUser = () => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            const nameInput = document.getElementById("review-user-name");
            const emailInput = document.getElementById("review-user-email");
            if (nameInput) {
                nameInput.value = user.name || "";
                nameInput.disabled = true;
            }
            if (emailInput) {
                emailInput.value = user.email || "";
                emailInput.disabled = true;
            }
        }
    };

    
    const stars = document.querySelectorAll(".star-btn");
    const ratingInput = document.getElementById("review-rating-value");
    
    stars.forEach(star => {
        star.addEventListener("click", () => {
            const val = star.dataset.value;
            ratingInput.value = val;
            
            stars.forEach(s => {
                const sVal = s.dataset.value;
                if (sVal <= val) {
                    s.classList.remove("fa-regular");
                    s.classList.add("fa-solid");
                    s.style.color = "#ffb300";
                } else {
                    s.classList.remove("fa-solid");
                    s.classList.add("fa-regular");
                    s.style.color = "var(--placeholder-color)";
                }
            });
        });

        star.addEventListener("mouseover", () => {
            const val = star.dataset.value;
            stars.forEach(s => {
                const sVal = s.dataset.value;
                if (sVal <= val) {
                    s.style.color = "#ffb300";
                } else {
                    s.style.color = "var(--placeholder-color)";
                }
            });
        });
    });

    const starWidget = document.getElementById("star-rating-widget");
    if (starWidget) {
        starWidget.addEventListener("mouseleave", () => {
            const val = ratingInput.value || 0;
            stars.forEach(s => {
                const sVal = s.dataset.value;
                if (sVal <= val) {
                    s.classList.remove("fa-regular");
                    s.classList.add("fa-solid");
                    s.style.color = "#ffb300";
                } else {
                    s.classList.remove("fa-solid");
                    s.classList.add("fa-regular");
                    s.style.color = "var(--placeholder-color)";
                }
            });
        });
    }

    
    const reviewForm = document.getElementById("add-review-form");
    if (reviewForm) {
        reviewForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const ratingVal = ratingInput.value;
            if (!ratingVal) {
                Utils.alert("Vui lòng chọn số sao đánh giá!");
                return;
            }

            const userStr = localStorage.getItem("user");
            let userName = document.getElementById("review-user-name").value.trim();
            let userEmail = document.getElementById("review-user-email").value.trim();
            
            if (userStr) {
                const user = JSON.parse(userStr);
                userName = user.name;
                userEmail = user.email;
            }

            const contentVal = document.getElementById("review-content").value.trim();

            const reviewData = {
                user_name: userName,
                user_email: userEmail,
                rating: parseFloat(ratingVal),
                content: contentVal
            };

            fetch(`http://127.0.0.1:5600/api/hotels/${hotelId}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(reviewData)
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(data => { throw new Error(data.error || "Gửi đánh giá thất bại!") });
                }
                return res.json();
            })
            .then(result => {
                Utils.alert("Cảm ơn bạn đã gửi đánh giá thành công!");
                document.getElementById("review-content").value = "";
                ratingInput.value = "";
                stars.forEach(s => {
                    s.classList.remove("fa-solid");
                    s.classList.add("fa-regular");
                    s.style.color = "var(--placeholder-color)";
                });
                
                loadHotelDetail();
            })
            .catch(err => {
                Utils.alert(err.message);
            });
        });
    }

    
    const setupLightbox = () => {
        const lightbox = document.getElementById("lightbox-modal");
        const lightboxImg = document.getElementById("lightbox-img");
        const closeBtn = document.getElementById("lightbox-close-btn");
        const prevBtn = document.getElementById("lightbox-prev-btn");
        const nextBtn = document.getElementById("lightbox-next-btn");
        const galleryContainer = document.getElementById("hotel-gallery-container");
        let currentImgIdx = 0;

        const showLightbox = (index) => {
            currentImgIdx = index;
            lightboxImg.src = galleryImages[currentImgIdx];
            lightbox.classList.add("show");
        };

        const closeLightbox = () => {
            lightbox.classList.remove("show");
        };

        const nextImage = (e) => {
            if(e) e.stopPropagation();
            currentImgIdx = (currentImgIdx + 1) % galleryImages.length;
            lightboxImg.src = galleryImages[currentImgIdx];
        };

        const prevImage = (e) => {
            if(e) e.stopPropagation();
            currentImgIdx = (currentImgIdx - 1 + galleryImages.length) % galleryImages.length;
            lightboxImg.src = galleryImages[currentImgIdx];
        };

        if (galleryContainer) {
            galleryContainer.onclick = (e) => {
                const targetImg = e.target.closest(".gallery-img");
                if (targetImg) {
                    const idx = parseInt(targetImg.dataset.index, 10);
                    showLightbox(idx);
                }
            };
        }

        if (closeBtn) closeBtn.onclick = closeLightbox;
        if (nextBtn) nextBtn.onclick = nextImage;
        if (prevBtn) prevBtn.onclick = prevImage;
        if (lightbox) {
            lightbox.onclick = (e) => {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            };
        }

        document.onkeydown = (e) => {
            if (lightbox && lightbox.classList.contains("show")) {
                if (e.key === "Escape") closeLightbox();
                if (e.key === "ArrowRight") nextImage();
                if (e.key === "ArrowLeft") prevImage();
            }
        };
    };

    
    loadHotelDetail();
    autoFillUser();
});
