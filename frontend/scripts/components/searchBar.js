// Search bar component to handle search filtering and date picker
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("search-component");
    
    if (container) {
        const isCompact = container.dataset.compact === "true";
        const savedLocation = localStorage.getItem("search_location") || "Hà Nội";
        
        const searchFormHTML = `
            <div class="search-bar d-flex">
                <div class="search-field flex-1">
                    <label>Điểm đến / Khách sạn</label>
                    <div class="input-wrapper">
                        <i class="fa-solid fa-location-dot icon"></i>
                        <input type="text" placeholder="Thành phố, sân bay" value="${savedLocation}">
                    </div>
                </div>
                <div class="divider"></div>
                
                <div class="search-field date-range-group d-flex">
                    <div class="date-field-sub flex-1">
                        <label>Nhận phòng</label>
                        <div class="input-wrapper">
                            <i class="fa-regular fa-calendar icon"></i>
                            <input type="text" id="check-in-date" placeholder="Ngày nhận" readonly>
                        </div>
                    </div>
                    <div class="date-divider"></div>
                    <div class="date-field-sub flex-1">
                        <label>Trả phòng</label>
                        <div class="input-wrapper">
                            <i class="fa-regular fa-calendar icon"></i>
                            <input type="text" id="check-out-date" placeholder="Ngày trả" readonly>
                        </div>
                    </div>
                </div>
                <div class="divider"></div>
                
                <div class="search-field flex-1 position-relative" id="guest-room-field">
                    <label>Phòng và Khách</label>
                    <div class="input-wrapper cursor-pointer" id="guest-room-display">
                        <i class="fa-regular fa-user icon"></i>
                        <span id="guest-text">1 Phòng, 1 Khách</span>
                        <i class="fa-solid fa-chevron-down arrow-icon"></i>
                    </div>
                    
                    <div class="guest-popover" id="guest-popover">
                        <div class="popover-row d-flex justify-between align-center">
                            <div class="popover-label-group">
                                <div class="popover-label-title">Phòng</div>
                            </div>
                            <div class="counter d-flex align-center">
                                <button class="btn-count minus" data-target="rooms">-</button>
                                <span class="count-val">1</span>
                                <button class="btn-count plus" data-target="rooms">+</button>
                            </div>
                        </div>
                        <div class="popover-row d-flex justify-between align-center">
                            <div class="popover-label-group">
                                <div class="popover-label-title">Người lớn</div>
                                <div class="popover-sub-label">18 tuổi trở lên</div>
                            </div>
                            <div class="counter d-flex align-center">
                                <button class="btn-count minus" data-target="adults">-</button>
                                <span class="count-val">1</span>
                                <button class="btn-count plus" data-target="adults">+</button>
                            </div>
                        </div>
                        <div class="popover-row d-flex justify-between align-center">
                            <div class="popover-label-group">
                                <div class="popover-label-title">Trẻ em</div>
                                <div class="popover-sub-label">0-17 tuổi</div>
                            </div>
                            <div class="counter d-flex align-center">
                                <button class="btn-count minus" data-target="children" disabled>-</button>
                                <span class="count-val">0</span>
                                <button class="btn-count plus" data-target="children">+</button>
                            </div>
                        </div>
                        <button class="btn-done-popover" id="btn-done-popover">Xong</button>
                        
                        <input type="hidden" id="rooms-count" value="1">
                        <input type="hidden" id="adults-count" value="1">
                        <input type="hidden" id="children-count" value="0">
                    </div>
                </div>
                
                <button class="search-btn"><i class="fa-solid fa-magnifying-glass"></i> TÌM</button>
            </div>
        `;

        if (isCompact) {
            container.innerHTML = `
                <div class="search-section-compact">
                    <div class="container">
                        ${searchFormHTML}
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="search-box">
                    <div class="search-tabs d-flex">
                        <button class="tab active">Khách sạn</button>
                        <button class="tab">Nhà trọ / Homestay</button>
                    </div>
                    ${searchFormHTML}
                </div>
            `;
        }
    }

    let savedCheckIn = localStorage.getItem("search_check_in") || "";
    let savedCheckOut = localStorage.getItem("search_check_out") || "";
    const savedDateRange = localStorage.getItem("search_date_range") || "";
    if (savedDateRange && savedDateRange.includes(" đến ")) {
        const parts = savedDateRange.split(" đến ");
        savedCheckIn = parts[0];
        savedCheckOut = parts[1];
        localStorage.setItem("search_check_in", savedCheckIn);
        localStorage.setItem("search_check_out", savedCheckOut);
    }

    const checkInInput = document.getElementById("check-in-date");
    const checkOutInput = document.getElementById("check-out-date");
    if (checkInInput && checkOutInput) {
        if (savedCheckIn) checkInInput.value = savedCheckIn;
        if (savedCheckOut) checkOutInput.value = savedCheckOut;

        const fpIn = flatpickr(checkInInput, {
            minDate: "today",
            dateFormat: "d/m/Y",
            locale: "vn",
            defaultDate: savedCheckIn || null,
            onChange: function(selectedDates, dateStr, instance) {
                localStorage.setItem("search_check_in", dateStr);
                if (selectedDates[0]) {
                    const nextDay = new Date(selectedDates[0]);
                    nextDay.setDate(nextDay.getDate() + 1);
                    fpOut.set("minDate", nextDay);
                    if (!checkOutInput.value) {
                        fpOut.open();
                    }
                }
                updateLocalStorageDateRange();
            }
        });

        const fpOut = flatpickr(checkOutInput, {
            minDate: savedCheckIn ? new Date(savedCheckIn.split("/").reverse().join("-")) : "today",
            dateFormat: "d/m/Y",
            locale: "vn",
            defaultDate: savedCheckOut || null,
            onChange: function(selectedDates, dateStr, instance) {
                localStorage.setItem("search_check_out", dateStr);
                if (selectedDates[0]) {
                    const prevDay = new Date(selectedDates[0]);
                    prevDay.setDate(prevDay.getDate() - 1);
                    fpIn.set("maxDate", prevDay);
                }
                updateLocalStorageDateRange();
            }
        });

        function updateLocalStorageDateRange() {
            const inVal = checkInInput.value;
            const outVal = checkOutInput.value;
            if (inVal && outVal) {
                localStorage.setItem("search_date_range", `${inVal} đến ${outVal}`);
            }
        }
    }

    const guestRoomField = document.getElementById("guest-room-field");
    const guestPopover = document.getElementById("guest-popover");
    const guestRoomDisplay = document.getElementById("guest-room-display");
    const btnDonePopover = document.getElementById("btn-done-popover");

    if (guestRoomDisplay && guestPopover) {
        guestRoomDisplay.addEventListener("click", (e) => {
            guestPopover.classList.toggle("show");
            e.stopPropagation();
        });
    }

    document.addEventListener("click", (e) => {
        if (guestRoomField && guestPopover && !guestRoomField.contains(e.target)) {
            guestPopover.classList.remove("show");
        }
    });

    if (btnDonePopover) {
        btnDonePopover.addEventListener("click", (e) => {
            e.stopPropagation();
            guestPopover.classList.remove("show");
        });
    }

    const savedRooms = parseInt(localStorage.getItem("search_rooms"), 10) || 1;
    const savedAdults = parseInt(localStorage.getItem("search_adults"), 10) || 1;
    const savedChildren = parseInt(localStorage.getItem("search_children"), 10) || 0;
    const counters = { rooms: savedRooms, adults: savedAdults, children: savedChildren };
    
    const updateDisplay = () => {
        if(!guestRoomDisplay) return;
        const textDisplay = guestRoomDisplay.querySelector("span");
        let text = `${counters.rooms} Phòng, ${counters.adults} Khách`;
        if (counters.children > 0) {
            text += `, ${counters.children} Trẻ em`;
        }
        textDisplay.textContent = text;

        localStorage.setItem("search_rooms", counters.rooms);
        localStorage.setItem("search_adults", counters.adults);
        localStorage.setItem("search_children", counters.children);
        localStorage.setItem("search_guest_text", text);

        const elRooms = document.getElementById("rooms-count");
        if(elRooms) elRooms.value = counters.rooms;
        const elAdults = document.getElementById("adults-count");
        if(elAdults) elAdults.value = counters.adults;
        const elChildren = document.getElementById("children-count");
        if(elChildren) elChildren.value = counters.children;
        
        const spanRooms = document.querySelector('.plus[data-target="rooms"]')?.previousElementSibling;
        if(spanRooms) spanRooms.textContent = counters.rooms;
        const spanAdults = document.querySelector('.plus[data-target="adults"]')?.previousElementSibling;
        if(spanAdults) spanAdults.textContent = counters.adults;
        const spanChildren = document.querySelector('.plus[data-target="children"]')?.previousElementSibling;
        if(spanChildren) spanChildren.textContent = counters.children;
        
        const btnSubRooms = document.querySelector('.minus[data-target="rooms"]');
        if(btnSubRooms) btnSubRooms.disabled = counters.rooms <= 1;
        const btnSubAdults = document.querySelector('.minus[data-target="adults"]');
        if(btnSubAdults) btnSubAdults.disabled = counters.adults <= 1;
        const btnSubChildren = document.querySelector('.minus[data-target="children"]');
        if(btnSubChildren) btnSubChildren.disabled = counters.children <= 0;
    };

    document.querySelectorAll(".btn-count").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const target = btn.dataset.target;
            const isPlus = btn.classList.contains("plus");
            
            if (isPlus) {
                counters[target]++;
            } else {
                if (target === "rooms" && counters[target] > 1) counters[target]--;
                if (target === "adults" && counters[target] > 1) counters[target]--;
                if (target === "children" && counters[target] > 0) counters[target]--;
            }
            updateDisplay();
        });
    });
    
    updateDisplay();

    
    let selectedType = "hotel";
    const tabs = document.querySelectorAll(".search-tabs .tab");
    if (tabs.length > 0) {
        tabs.forEach((tab, index) => {
            tab.addEventListener("click", () => {
                tabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                selectedType = index === 0 ? "hotel" : "homestay";
            });
        });
    }

    const searchBtns = document.querySelectorAll(".search-btn");
    searchBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const inputWrapper = btn.closest(".search-bar");
            const locationInput = inputWrapper ? inputWrapper.querySelector("input[type='text']") : null;
            const locationVal = locationInput ? locationInput.value.trim() : "";
            localStorage.setItem("search_location", locationVal);
            window.location.href = "../hotel-list/index.html?type=" + selectedType + "&location=" + encodeURIComponent(locationVal);
        });
    });
});
