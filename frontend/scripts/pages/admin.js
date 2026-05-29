document.addEventListener("DOMContentLoaded", () => {
    
    const checkAdminPermission = () => {
        let userStr = localStorage.getItem("user");
        if (!userStr) {
            const mockAdmin = {
                name: "Admin AnPV",
                email: "admin",
                isAdmin: true
            };
            localStorage.setItem("user", JSON.stringify(mockAdmin));
            userStr = JSON.stringify(mockAdmin);
        }
        return true;
    };

    checkAdminPermission();

    const user = JSON.parse(localStorage.getItem("user"));
    const adminNameEl = document.getElementById("admin-name");
    if (adminNameEl) adminNameEl.textContent = user.name;

    
    let allBookings = [];
    let allHotels = [];
    let allUsers = [];

    
    const loadDashboardKPIs = () => {
        const kpiRevenue = document.getElementById("kpi-revenue");
        const kpiBookings = document.getElementById("kpi-bookings");
        const kpiHotels = document.getElementById("kpi-hotels");
        const kpiUsers = document.getElementById("kpi-users");

        fetch("http://127.0.0.1:5600/api/admin/kpis")
            .then(res => res.json())
            .then(kpis => {
                if (kpiRevenue) kpiRevenue.textContent = kpis.total_revenue.toLocaleString('vi-VN') + " ₫";
                if (kpiBookings) kpiBookings.textContent = kpis.total_bookings;
                if (kpiHotels) kpiHotels.textContent = kpis.total_hotels.toLocaleString('vi-VN');
                if (kpiUsers) kpiUsers.textContent = kpis.total_users.toLocaleString('vi-VN');
            })
            .catch(err => console.error("Lỗi tải KPIs: ", err));
    };

    
    const loadRecentBookings = () => {
        const tbody = document.getElementById("recent-bookings-tbody");
        if (!tbody) return;
        
        fetch("http://127.0.0.1:5600/api/admin/bookings")
            .then(res => res.json())
            .then(bookings => {
                allBookings = bookings;
                tbody.innerHTML = "";
                
                
                const recent = bookings.slice(0, 5);

                if (recent.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="7" class="text-center">Chưa có đơn đặt phòng nào.</td></tr>`;
                    return;
                }

                recent.forEach(b => {
                    const tr = document.createElement("tr");
                    const isCancelled = b.status === "Đã hủy";
                    const statusClass = isCancelled ? "status-cancelled" : "status-confirmed";
                    
                    const actionBtnHTML = !isCancelled
                        ? `<button class="btn-cancel-admin" data-id="${b.id}">Hủy đơn</button>`
                        : `<button class="btn-confirm-admin btn-reconfirm" data-id="${b.id}">Duyệt lại</button>`;

                    const formatShowDate = (dateStr) => {
                        if (!dateStr) return '';
                        const parts = dateStr.split('-');
                        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                        return dateStr;
                    };

                    tr.innerHTML = `
                        <td><strong>MT${b.id}</strong></td>
                        <td>${b.user_email}</td>
                        <td>${b.hotel_name}</td>
                        <td>${formatShowDate(b.check_in)} - ${formatShowDate(b.check_out)}</td>
                        <td>${b.total_price.toLocaleString('vi-VN')} ₫</td>
                        <td><span class="booking-status-badge ${statusClass}">${b.status}</span></td>
                        <td>${actionBtnHTML}</td>
                    `;
                    tbody.appendChild(tr);
                });

                bindActionEvents();
            })
            .catch(err => console.error("Lỗi tải đơn hàng: ", err));
    };

    
    const loadHotelsManagement = () => {
        const tbody = document.getElementById("hotels-list-tbody");
        if (!tbody) return;
        
        fetch("http://127.0.0.1:5600/api/hotels")
            .then(res => res.json())
            .then(hotels => {
                allHotels = hotels;
                tbody.innerHTML = "";

                hotels.forEach(h => {
                    const tr = document.createElement("tr");
                    const stars = Math.round(parseFloat(h.rating)) || 5;
                    const starsHtml = '<i class="fa-solid fa-star icon-orange-star"></i>'.repeat(stars);
                    const displayType = h.type === 'homestay' ? 'Homestay' : 'Khách sạn';
                    tr.innerHTML = `
                        <td><img src="${h.img}" alt="Hotel" class="hotel-table-img"></td>
                        <td><strong>${h.name}</strong></td>
                        <td>${starsHtml}</td>
                        <td>${h.location}</td>
                        <td>${displayType}</td>
                        <td><span class="text-orange-bold">${h.price.toLocaleString('vi-VN')} ₫</span></td>
                        <td>
                            <button class="btn-rooms-hotel" data-id="${h.id}"><i class="fa-solid fa-bed"></i> QL Phòng</button>
                            <button class="btn-edit-hotel" data-id="${h.id}"><i class="fa-solid fa-pen-to-square"></i> Sửa</button>
                            <button class="btn-delete-hotel" data-id="${h.id}"><i class="fa-solid fa-trash-can"></i> Xóa</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                
                tbody.querySelectorAll(".btn-delete-hotel").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const hotelId = btn.dataset.id;
                        Utils.confirm("Bạn có chắc chắn muốn xóa khách sạn này không? Tất cả các phòng liên quan sẽ bị xóa!").then(ok => {
                            if (ok) {
                                fetch(`http://127.0.0.1:5600/api/admin/hotels/${hotelId}`, {
                                    method: "DELETE"
                                })
                                .then(res => {
                                    if (!res.ok) throw new Error("Xóa thất bại!");
                                    return res.json();
                                })
                                .then(() => {
                                    Utils.alert("Đã xóa khách sạn thành công!");
                                    loadHotelsManagement();
                                    loadDashboardKPIs();
                                })
                                .catch(err => {
                                    console.error(err);
                                    Utils.alert("Không thể xóa khách sạn lúc này.");
                                });
                            }
                        });
                    });
                });

                
                tbody.querySelectorAll(".btn-edit-hotel").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const hotelId = parseInt(btn.dataset.id, 10);
                        const hotel = allHotels.find(x => x.id === hotelId);
                        if (hotel) {
                            showHotelFormModal(hotel);
                        }
                    });
                });

                
                tbody.querySelectorAll(".btn-rooms-hotel").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const hotelId = parseInt(btn.dataset.id, 10);
                        const hotel = allHotels.find(x => x.id === hotelId);
                        if (hotel) {
                            showRoomsManagementModal(hotel);
                        }
                    });
                });
            })
            .catch(err => console.error("Lỗi tải khách sạn: ", err));
    };

    
    const loadBookingsManagement = (statusFilter = "all") => {
        const tbody = document.getElementById("all-bookings-tbody");
        if (!tbody) return;
        
        fetch("http://127.0.0.1:5600/api/admin/bookings")
            .then(res => res.json())
            .then(bookings => {
                allBookings = bookings;
                tbody.innerHTML = "";

                const filtered = statusFilter === "all"
                    ? bookings
                    : bookings.filter(b => b.status === statusFilter);

                if (filtered.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="8" class="text-center">Không có đơn đặt phòng nào phù hợp.</td></tr>`;
                    return;
                }

                filtered.forEach(b => {
                    const tr = document.createElement("tr");
                    const isCancelled = b.status === "Đã hủy";
                    const statusClass = isCancelled ? "status-cancelled" : "status-confirmed";
                    
                    const actionBtnHTML = !isCancelled
                        ? `<button class="btn-cancel-admin" data-id="${b.id}">Hủy đơn</button>`
                        : `<button class="btn-confirm-admin btn-reconfirm" data-id="${b.id}">Duyệt lại</button>`;

                    const formatShowDate = (dateStr) => {
                        if (!dateStr) return '';
                        const parts = dateStr.split('-');
                        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                        return dateStr;
                    };

                    tr.innerHTML = `
                        <td><strong>MT${b.id}</strong></td>
                        <td>${b.user_email}</td>
                        <td>${b.hotel_name}</td>
                        <td>${formatShowDate(b.check_in)} - ${formatShowDate(b.check_out)}</td>
                        <td>${b.payment_method || 'Thẻ tín dụng / Thẻ ghi nợ'}</td>
                        <td>${b.total_price.toLocaleString('vi-VN')} ₫</td>
                        <td><span class="booking-status-badge ${statusClass}">${b.status}</span></td>
                        <td>${actionBtnHTML}</td>
                    `;
                    tbody.appendChild(tr);
                });

                bindActionEvents();
            })
            .catch(err => console.error("Lỗi tải đơn hàng: ", err));
    };

    
    const loadUsersManagement = () => {
        const tbody = document.getElementById("users-list-tbody");
        if (!tbody) return;

        fetch("http://127.0.0.1:5600/api/admin/users")
            .then(res => res.json())
            .then(users => {
                allUsers = users;
                tbody.innerHTML = "";

                users.forEach(u => {
                    const tr = document.createElement("tr");
                    const roleLabel = u.isAdmin ? "Quản trị viên" : "Khách hàng";
                    tr.innerHTML = `
                        <td>#${u.id}</td>
                        <td><strong>${u.name}</strong></td>
                        <td>${u.email}</td>
                        <td><span class="user-role-badge ${u.isAdmin ? 'admin-role' : 'client-role'}">${roleLabel}</span></td>
                        <td>
                            <button class="btn-edit-hotel btn-edit-user" data-id="${u.id}"><i class="fa-solid fa-pen"></i> Sửa</button>
                            <button class="btn-delete-hotel btn-delete-user" data-id="${u.id}"><i class="fa-solid fa-trash"></i> Xóa</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                bindUserActionEvents();
            })
            .catch(err => console.error("Lỗi tải người dùng: ", err));
    };

    const bindUserActionEvents = () => {
        document.querySelectorAll(".btn-edit-user").forEach(btn => {
            btn.addEventListener("click", () => {
                const u = allUsers.find(x => x.id == btn.dataset.id);
                if (u) {
                    showUserFormModal(u);
                }
            });
        });

        document.querySelectorAll(".btn-delete-user").forEach(btn => {
            btn.addEventListener("click", () => {
                const userId = btn.dataset.id;
                const u = allUsers.find(x => x.id == userId);
                if (!u) return;

                const currentUserStr = localStorage.getItem("user");
                if (currentUserStr) {
                    const currentUser = JSON.parse(currentUserStr);
                    if (currentUser.email === u.email) {
                        Utils.alert("Không thể tự xóa tài khoản của chính mình!");
                        return;
                    }
                }

                Utils.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${u.name} (${u.email}) không?`).then(ok => {
                    if (ok) {
                        fetch(`http://127.0.0.1:5600/api/admin/users/${userId}`, {
                            method: "DELETE"
                        })
                        .then(res => {
                            if (!res.ok) throw new Error("Xóa tài khoản thất bại!");
                            return res.json();
                        })
                        .then(() => {
                            Utils.alert("Xóa tài khoản thành công!");
                            loadUsersManagement();
                            loadDashboardKPIs();
                        })
                        .catch(err => {
                            console.error(err);
                            Utils.alert("Gặp sự cố khi xóa tài khoản.");
                        });
                    }
                });
            });
        });
    };

    const showUserFormModal = (user = null) => {
        let modalOverlay = document.getElementById("user-form-modal");
        if (!modalOverlay) {
            modalOverlay = document.createElement("div");
            modalOverlay.id = "user-form-modal";
            modalOverlay.className = "admin-modal-overlay";
            document.body.appendChild(modalOverlay);
        }

        const isEdit = !!user;
        const modalTitle = isEdit ? "Cập nhật Người dùng" : "Thêm Người dùng Mới";

        modalOverlay.innerHTML = `
            <div class="admin-modal-card">
                <div class="d-flex justify-between align-center admin-modal-header">
                    <h3 class="admin-modal-title">${modalTitle}</h3>
                    <button class="modal-close-btn admin-modal-close-btn"><i class="fa-solid fa-times"></i></button>
                </div>
                <form id="user-admin-form">
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Họ và Tên</label>
                        <input type="text" id="user-name-input" value="${isEdit ? user.name : ''}" required class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Email đăng nhập</label>
                        <input type="email" id="user-email-input" value="${isEdit ? user.email : ''}" required class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Mật khẩu</label>
                        <input type="password" id="user-password-input" placeholder="${isEdit ? 'Để trống nếu không muốn đổi mật khẩu' : 'Nhập mật khẩu tài khoản...'}" ${isEdit ? '' : 'required'} class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Vai trò</label>
                        <select id="user-role-input" class="admin-form-input">
                            <option value="false" ${isEdit && !user.isAdmin ? 'selected' : ''}>Khách hàng</option>
                            <option value="true" ${isEdit && user.isAdmin ? 'selected' : ''}>Quản trị viên</option>
                        </select>
                    </div>
                    <div class="d-flex justify-end gap-10 admin-modal-footer">
                        <button type="button" class="btn-cancel-user-modal admin-btn-cancel">Hủy</button>
                        <button type="submit" class="admin-btn-submit">Lưu</button>
                    </div>
                </form>
            </div>
        `;

        setTimeout(() => {
            modalOverlay.classList.add("show");
        }, 10);

        const closeUserModal = () => {
            modalOverlay.classList.remove("show");
            setTimeout(() => {
                modalOverlay.remove();
            }, 300);
        };

        modalOverlay.querySelector(".modal-close-btn").addEventListener("click", closeUserModal);
        modalOverlay.querySelector(".btn-cancel-user-modal").addEventListener("click", closeUserModal);

        const form = document.getElementById("user-admin-form");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("user-name-input").value.trim();
            const email = document.getElementById("user-email-input").value.trim();
            const password = document.getElementById("user-password-input").value;
            const isAdmin = document.getElementById("user-role-input").value === "true";

            const url = isEdit 
                ? `http://127.0.0.1:5600/api/admin/users/${user.id}` 
                : "http://127.0.0.1:5600/api/admin/users";
            const method = isEdit ? "PUT" : "POST";
            const bodyData = { name, email, isAdmin };
            if (password) bodyData.password = password;

            fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData)
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(data => { throw new Error(data.error || "Thực hiện thất bại!") });
                }
                return res.json();
            })
            .then(() => {
                Utils.alert(isEdit ? "Cập nhật tài khoản thành công!" : "Thêm tài khoản thành công!");
                closeUserModal();
                loadUsersManagement();
                loadDashboardKPIs();
            })
            .catch(err => {
                console.error(err);
                Utils.alert(err.message);
            });
        });
    };

    let allGuides = [];

    const loadGuidesManagement = () => {
        const tbody = document.getElementById("guides-list-tbody");
        if (!tbody) return;

        fetch("http://127.0.0.1:5600/api/guides")
            .then(res => res.json())
            .then(guides => {
                allGuides = guides;
                tbody.innerHTML = "";

                guides.forEach(g => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>#${g.id}</td>
                        <td><img src="${g.img}" alt="Thumbnail" class="guide-table-img"></td>
                        <td><strong>${g.title}</strong></td>
                        <td><span class="user-role-badge client-role">${g.category}</span></td>
                        <td><div class="text-ellipsis" style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${g.summary}</div></td>
                        <td>${g.created_at || ''}</td>
                        <td>
                            <button class="btn-edit-hotel btn-edit-guide" data-id="${g.id}"><i class="fa-solid fa-pen"></i> Sửa</button>
                            <button class="btn-delete-hotel btn-delete-guide" data-id="${g.id}"><i class="fa-solid fa-trash"></i> Xóa</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                bindGuideActionEvents();
            })
            .catch(err => console.error("Lỗi tải bài viết: ", err));
    };

    const bindGuideActionEvents = () => {
        document.querySelectorAll(".btn-edit-guide").forEach(btn => {
            btn.addEventListener("click", () => {
                const g = allGuides.find(x => x.id == btn.dataset.id);
                if (g) {
                    showGuideFormModal(g);
                }
            });
        });

        document.querySelectorAll(".btn-delete-guide").forEach(btn => {
            btn.addEventListener("click", () => {
                const guideId = btn.dataset.id;
                const g = allGuides.find(x => x.id == guideId);
                if (!g) return;

                Utils.confirm(`Bạn có chắc chắn muốn xóa bài viết "${g.title}" không?`).then(ok => {
                    if (ok) {
                        fetch(`http://127.0.0.1:5600/api/admin/guides/${guideId}`, {
                            method: "DELETE"
                        })
                        .then(res => {
                            if (!res.ok) throw new Error("Xóa bài viết thất bại!");
                            return res.json();
                        })
                        .then(() => {
                            Utils.alert("Xóa bài viết thành công!");
                            loadGuidesManagement();
                        })
                        .catch(err => {
                            console.error(err);
                            Utils.alert("Gặp sự cố khi xóa bài viết.");
                        });
                    }
                });
            });
        });
    };

    const showGuideFormModal = (guide = null) => {
        let modalOverlay = document.getElementById("guide-form-modal");
        if (!modalOverlay) {
            modalOverlay = document.createElement("div");
            modalOverlay.id = "guide-form-modal";
            modalOverlay.className = "admin-modal-overlay";
            document.body.appendChild(modalOverlay);
        }

        const isEdit = !!guide;
        const modalTitle = isEdit ? "Cập nhật Bài viết" : "Thêm Bài viết Mới";

        modalOverlay.innerHTML = `
            <div class="admin-modal-card admin-modal-card-lg">
                <div class="d-flex justify-between align-center admin-modal-header">
                    <h3 class="admin-modal-title">${modalTitle}</h3>
                    <button class="modal-close-btn admin-modal-close-btn"><i class="fa-solid fa-times"></i></button>
                </div>
                <form id="guide-admin-form">
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Tiêu đề bài viết</label>
                        <input type="text" id="guide-title-input" value="${isEdit ? guide.title : ''}" required class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Danh mục (Ví dụ: Ẩm thực, Điểm đến, Khách sạn...)</label>
                        <input type="text" id="guide-category-input" value="${isEdit ? guide.category : ''}" required class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Đường dẫn ảnh đại diện (URL)</label>
                        <input type="text" id="guide-img-input" value="${isEdit ? guide.img : ''}" required class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Tóm tắt ngắn</label>
                        <textarea id="guide-summary-input" rows="2" required class="admin-form-textarea">${isEdit ? guide.summary : ''}</textarea>
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Nội dung chi tiết</label>
                        <textarea id="guide-content-input" rows="8" required class="admin-form-textarea">${isEdit ? guide.content : ''}</textarea>
                    </div>
                    <div class="d-flex justify-end gap-10 admin-modal-footer">
                        <button type="button" class="btn-cancel-guide-modal admin-btn-cancel">Hủy</button>
                        <button type="submit" class="admin-btn-submit">Lưu</button>
                    </div>
                </form>
            </div>
        `;

        setTimeout(() => {
            modalOverlay.classList.add("show");
        }, 10);

        const closeGuideModal = () => {
            modalOverlay.classList.remove("show");
            setTimeout(() => {
                modalOverlay.remove();
            }, 300);
        };

        modalOverlay.querySelector(".modal-close-btn").addEventListener("click", closeGuideModal);
        modalOverlay.querySelector(".btn-cancel-guide-modal").addEventListener("click", closeGuideModal);

        const form = document.getElementById("guide-admin-form");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const title = document.getElementById("guide-title-input").value.trim();
            const category = document.getElementById("guide-category-input").value.trim();
            const img = document.getElementById("guide-img-input").value.trim();
            const summary = document.getElementById("guide-summary-input").value.trim();
            const content = document.getElementById("guide-content-input").value.trim();

            const url = isEdit 
                ? `http://127.0.0.1:5600/api/admin/guides/${guide.id}` 
                : "http://127.0.0.1:5600/api/admin/guides";
            const method = isEdit ? "PUT" : "POST";

            fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, category, img, summary, content })
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(data => { throw new Error(data.error || "Thực hiện thất bại!") });
                }
                return res.json();
            })
            .then(() => {
                Utils.alert(isEdit ? "Cập nhật bài viết thành công!" : "Thêm bài viết thành công!");
                closeGuideModal();
                loadGuidesManagement();
            })
            .catch(err => {
                console.error(err);
                Utils.alert(err.message);
            });
        });
    };

    let allCoupons = [];

    const loadCouponsManagement = () => {
        const tbody = document.getElementById("coupons-list-tbody");
        if (!tbody) return;

        fetch("http://127.0.0.1:5600/api/coupons")
            .then(res => res.json())
            .then(coupons => {
                allCoupons = coupons;
                tbody.innerHTML = "";

                coupons.forEach(c => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td><strong>${c.code}</strong></td>
                        <td><span class="user-role-badge admin-role">${c.discount_percent}%</span></td>
                        <td>${c.min_spend.toLocaleString('vi-VN')} ₫</td>
                        <td>${c.description || ''}</td>
                        <td>
                            <button class="btn-edit-hotel btn-edit-coupon" data-code="${c.code}"><i class="fa-solid fa-pen"></i> Sửa</button>
                            <button class="btn-delete-hotel btn-delete-coupon" data-code="${c.code}"><i class="fa-solid fa-trash"></i> Xóa</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                bindCouponActionEvents();
            })
            .catch(err => console.error("Lỗi tải mã ưu đãi: ", err));
    };

    const bindCouponActionEvents = () => {
        document.querySelectorAll(".btn-edit-coupon").forEach(btn => {
            btn.addEventListener("click", () => {
                const c = allCoupons.find(x => x.code === btn.dataset.code);
                if (c) {
                    showCouponFormModal(c);
                }
            });
        });

        document.querySelectorAll(".btn-delete-coupon").forEach(btn => {
            btn.addEventListener("click", () => {
                const code = btn.dataset.code;
                Utils.confirm(`Bạn có chắc chắn muốn xóa mã ưu đãi ${code} không?`).then(ok => {
                    if (ok) {
                        fetch(`http://127.0.0.1:5600/api/admin/coupons/${code}`, {
                            method: "DELETE"
                        })
                        .then(res => {
                            if (!res.ok) throw new Error("Xóa mã ưu đãi thất bại!");
                            return res.json();
                        })
                        .then(() => {
                            Utils.alert("Xóa mã ưu đãi thành công!");
                            loadCouponsManagement();
                        })
                        .catch(err => {
                            console.error(err);
                            Utils.alert("Gặp sự cố khi xóa mã ưu đãi.");
                        });
                    }
                });
            });
        });
    };

    const showCouponFormModal = (coupon = null) => {
        let modalOverlay = document.getElementById("coupon-form-modal");
        if (!modalOverlay) {
            modalOverlay = document.createElement("div");
            modalOverlay.id = "coupon-form-modal";
            modalOverlay.className = "admin-modal-overlay";
            document.body.appendChild(modalOverlay);
        }

        const isEdit = !!coupon;
        const modalTitle = isEdit ? "Cập nhật Mã Ưu Đãi" : "Thêm Mã Ưu Đãi Mới";

        modalOverlay.innerHTML = `
            <div class="admin-modal-card">
                <div class="d-flex justify-between align-center admin-modal-header">
                    <h3 class="admin-modal-title">${modalTitle}</h3>
                    <button class="modal-close-btn admin-modal-close-btn"><i class="fa-solid fa-times"></i></button>
                </div>
                <form id="coupon-admin-form">
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Mã ưu đãi (Ví dụ: ANPV10)</label>
                        <input type="text" id="coupon-code-input" value="${isEdit ? coupon.code : ''}" ${isEdit ? 'readonly' : 'required'} class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Phần trăm giảm (%)</label>
                        <input type="number" id="coupon-percent-input" value="${isEdit ? coupon.discount_percent : ''}" min="1" max="100" required class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Chi tiêu tối thiểu (VND)</label>
                        <input type="number" id="coupon-minspend-input" value="${isEdit ? coupon.min_spend : ''}" min="0" required class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Mô tả ưu đãi</label>
                        <textarea id="coupon-desc-input" rows="2" class="admin-form-textarea">${isEdit ? (coupon.description || '') : ''}</textarea>
                    </div>
                    <div class="d-flex justify-end gap-10 admin-modal-footer">
                        <button type="button" class="btn-cancel-coupon-modal admin-btn-cancel">Hủy</button>
                        <button type="submit" class="admin-btn-submit">Lưu</button>
                    </div>
                </form>
            </div>
        `;

        setTimeout(() => {
            modalOverlay.classList.add("show");
        }, 10);

        const closeCouponModal = () => {
            modalOverlay.classList.remove("show");
            setTimeout(() => {
                modalOverlay.remove();
            }, 300);
        };

        modalOverlay.querySelector(".modal-close-btn").addEventListener("click", closeCouponModal);
        modalOverlay.querySelector(".btn-cancel-coupon-modal").addEventListener("click", closeCouponModal);

        const form = document.getElementById("coupon-admin-form");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const code = document.getElementById("coupon-code-input").value.trim().toUpperCase();
            const discount_percent = parseInt(document.getElementById("coupon-percent-input").value);
            const min_spend = parseInt(document.getElementById("coupon-minspend-input").value);
            const description = document.getElementById("coupon-desc-input").value.trim();

            const url = isEdit 
                ? `http://127.0.0.1:5600/api/admin/coupons/${code}` 
                : "http://127.0.0.1:5600/api/admin/coupons";
            const method = isEdit ? "PUT" : "POST";

            fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, discount_percent, min_spend, description })
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(data => { throw new Error(data.error || "Thực hiện thất bại!") });
                }
                return res.json();
            })
            .then(() => {
                Utils.alert(isEdit ? "Cập nhật mã ưu đãi thành công!" : "Thêm mã ưu đãi thành công!");
                closeCouponModal();
                loadCouponsManagement();
            })
            .catch(err => {
                console.error(err);
                Utils.alert(err.message);
            });
        });
    };

    let allReviews = [];

    const loadReviewsManagement = () => {
        const tbody = document.getElementById("reviews-list-tbody");
        if (!tbody) return;

        fetch("http://127.0.0.1:5600/api/admin/reviews")
            .then(res => res.json())
            .then(reviews => {
                allReviews = reviews;
                tbody.innerHTML = "";

                reviews.forEach(r => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>#${r.id}</td>
                        <td><strong>${r.hotel_name}</strong></td>
                        <td>${r.user_email}</td>
                        <td>${r.user_name}</td>
                        <td><span class="user-role-badge admin-role">${r.rating} ★</span></td>
                        <td><div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${r.content}</div></td>
                        <td>${r.created_at || ''}</td>
                        <td>
                            <button class="btn-delete-hotel btn-delete-review" data-id="${r.id}"><i class="fa-solid fa-trash"></i> Xóa</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                bindReviewActionEvents();
            })
            .catch(err => console.error("Lỗi tải đánh giá: ", err));
    };

    const bindReviewActionEvents = () => {
        document.querySelectorAll(".btn-delete-review").forEach(btn => {
            btn.addEventListener("click", () => {
                const reviewId = btn.dataset.id;
                const r = allReviews.find(x => x.id == reviewId);
                if (!r) return;

                Utils.confirm(`Bạn có chắc chắn muốn xóa đánh giá của ${r.user_name} về khách sạn ${r.hotel_name} không?`).then(ok => {
                    if (ok) {
                        fetch(`http://127.0.0.1:5600/api/admin/reviews/${reviewId}`, {
                            method: "DELETE"
                        })
                        .then(res => {
                            if (!res.ok) throw new Error("Xóa đánh giá thất bại!");
                            return res.json();
                        })
                        .then(() => {
                            Utils.alert("Xóa đánh giá thành công!");
                            loadReviewsManagement();
                        })
                        .catch(err => {
                            console.error(err);
                            Utils.alert("Gặp sự cố khi xóa đánh giá.");
                        });
                    }
                });
            });
        });
    };

    
    const loadPopularHotelsList = () => {
        const list = document.getElementById("popular-hotels-list");
        if (!list) return;
        
        fetch("http://127.0.0.1:5600/api/admin/popular-hotels")
            .then(res => res.json())
            .then(hotels => {
                list.innerHTML = "";
                if (hotels.length === 0) {
                    list.innerHTML = `<div class="text-center text-muted p-md fs-sm">Chưa có dữ liệu.</div>`;
                    return;
                }
                hotels.forEach((hotel, idx) => {
                    const item = document.createElement("div");
                    item.className = "popular-hotel-item d-flex align-center gap-10";
                    item.innerHTML = `
                        <span class="hotel-rank">${idx + 1}</span>
                        <img src="${hotel.img}" alt="Hotel" class="popular-img">
                        <div class="popular-info flex-1">
                            <div class="popular-name">${hotel.name}</div>
                            <div class="popular-price">${hotel.price.toLocaleString('vi-VN')} ₫ <span class="text-muted fs-xs fw-normal">(${hotel.booking_count} lượt đặt)</span></div>
                        </div>
                    `;
                    list.appendChild(item);
                });
            })
            .catch(err => console.error("Lỗi tải khách sạn thịnh hành: ", err));
    };

    
    const bindActionEvents = () => {
        document.querySelectorAll(".btn-cancel-admin").forEach(btn => {
            btn.addEventListener("click", () => {
                const bookingId = btn.dataset.id;
                Utils.confirm(`Bạn có chắc muốn HỦY đơn đặt phòng MT${bookingId} không?`).then(ok => {
                    if (ok) {
                        updateBookingStatus(bookingId, "Đã hủy");
                    }
                });
            });
        });

        document.querySelectorAll(".btn-confirm-admin").forEach(btn => {
            btn.addEventListener("click", () => {
                const bookingId = btn.dataset.id;
                Utils.confirm(`Bạn có chắc muốn duyệt lại đơn đặt phòng MT${bookingId} không?`).then(ok => {
                    if (ok) {
                        updateBookingStatus(bookingId, "Đã xác nhận");
                    }
                });
            });
        });
    };

    
    const updateBookingStatus = (bookingId, newStatus) => {
        fetch(`http://127.0.0.1:5600/api/admin/bookings/${bookingId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        })
        .then(res => {
            if (!res.ok) throw new Error("Cập nhật trạng thái thất bại!");
            return res.json();
        })
        .then(() => {
            Utils.alert("Cập nhật trạng thái đơn thành công!");
            loadDashboardKPIs();
            loadRecentBookings();
            loadBookingsManagement(document.getElementById("filter-booking-status")?.value || "all");
        })
        .catch(err => {
            console.error(err);
            Utils.alert("Gặp sự cố khi cập nhật đơn hàng.");
        });
    };

    
    const showHotelFormModal = (hotel = null) => {
        let modalOverlay = document.getElementById("hotel-form-modal");
        if (!modalOverlay) {
            modalOverlay = document.createElement("div");
            modalOverlay.id = "hotel-form-modal";
            modalOverlay.className = "admin-modal-overlay";
            document.body.appendChild(modalOverlay);
        }

        const isEdit = !!hotel;
        const modalTitle = isEdit ? "Cập nhật Khách sạn" : "Thêm Khách sạn Mới";
        
        modalOverlay.innerHTML = `
            <div class="admin-modal-card">
                <div class="d-flex justify-between align-center admin-modal-header">
                    <h3 class="admin-modal-title">${modalTitle}</h3>
                    <button class="modal-close-btn admin-modal-close-btn"><i class="fa-solid fa-times"></i></button>
                </div>
                <form id="hotel-admin-form">
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Tên khách sạn</label>
                        <input type="text" id="hotel-name-input" value="${isEdit ? hotel.name : ''}" required class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Vị trí (Ví dụ: Nha Trang, Khánh Hòa)</label>
                        <input type="text" id="hotel-location-input" value="${isEdit ? hotel.location : ''}" required class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Giá cơ bản (VND)</label>
                        <input type="number" id="hotel-price-input" value="${isEdit ? hotel.price : ''}" required class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Đường dẫn ảnh minh họa</label>
                        <input type="text" id="hotel-img-input" value="${isEdit ? hotel.img : '../../assets/images/hotel_1.png'}" class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Mô tả khách sạn</label>
                        <textarea id="hotel-desc-input" rows="3" class="admin-form-textarea">${isEdit ? (hotel.description || '') : ''}</textarea>
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Loại hình chỗ nghỉ</label>
                        <select id="hotel-type-input" class="admin-form-input">
                            <option value="hotel" ${isEdit && hotel.type === 'homestay' ? '' : 'selected'}>Khách sạn</option>
                            <option value="homestay" ${isEdit && hotel.type === 'homestay' ? 'selected' : ''}>Nhà trọ / Homestay</option>
                        </select>
                    </div>
                    <div class="d-flex justify-end gap-10 admin-modal-footer">
                        <button type="button" class="btn-cancel-modal admin-btn-cancel">Hủy</button>
                        <button type="submit" class="admin-btn-submit">Lưu lại</button>
                    </div>
                </form>
            </div>
        `;

        setTimeout(() => {
            modalOverlay.classList.add("show");
        }, 10);

        const closeModal = () => {
            modalOverlay.classList.remove("show");
            setTimeout(() => {
                modalOverlay.remove();
            }, 300);
        };

        modalOverlay.querySelector(".modal-close-btn").addEventListener("click", closeModal);
        modalOverlay.querySelector(".btn-cancel-modal").addEventListener("click", closeModal);

        
        const form = document.getElementById("hotel-admin-form");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const name = document.getElementById("hotel-name-input").value.trim();
            const location = document.getElementById("hotel-location-input").value.trim();
            const price = parseInt(document.getElementById("hotel-price-input").value, 10);
            const img = document.getElementById("hotel-img-input").value.trim();
            const description = document.getElementById("hotel-desc-input").value.trim();
            const type = document.getElementById("hotel-type-input").value;

            const bodyData = { name, location, price, img, description, type };
            const apiUrl = isEdit 
                ? `http://127.0.0.1:5600/api/admin/hotels/${hotel.id}` 
                : "http://127.0.0.1:5600/api/admin/hotels";
            
            const method = isEdit ? "PUT" : "POST";

            fetch(apiUrl, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData)
            })
            .then(res => {
                if (!res.ok) throw new Error("Lưu thông tin thất bại!");
                return res.json();
            })
            .then(() => {
                Utils.alert(isEdit ? "Cập nhật khách sạn thành công!" : "Thêm khách sạn mới thành công!");
                closeModal();
                loadHotelsManagement();
                loadDashboardKPIs();
            })
            .catch(err => {
                console.error(err);
                Utils.alert("Đã xảy ra lỗi khi lưu khách sạn.");
            });
        });
    };

    
    const loadRevenueChart = () => {
        const chartContainer = document.querySelector(".bar-chart-mock");
        if (!chartContainer) return;
        
        let tooltip = document.querySelector(".chart-tooltip");
        if (!tooltip) {
            tooltip = document.createElement("div");
            tooltip.className = "chart-tooltip";
            document.body.appendChild(tooltip);
        }
        
        fetch("http://127.0.0.1:5600/api/admin/revenue-chart")
            .then(res => res.json())
            .then(data => {
                chartContainer.innerHTML = "";
                data.forEach(item => {
                    const barCol = document.createElement("div");
                    barCol.className = "chart-bar-col";
                    
                    const isCurrentMonth = item.month === new Date().getMonth() + 1;
                    const activeClass = isCurrentMonth ? "active" : "";
                    
                    barCol.innerHTML = `
                        <div class="bar-fill ${activeClass}" style="height: ${item.height_percent}%;" data-revenue="${item.revenue}" data-label="${item.label}"></div>
                        <span>${item.label}</span>
                    `;
                    chartContainer.appendChild(barCol);
                });

                const barFills = chartContainer.querySelectorAll(".bar-fill");
                barFills.forEach(bar => {
                    bar.addEventListener("mouseover", () => {
                        const revenue = parseInt(bar.dataset.revenue, 10);
                        const label = bar.dataset.label;
                        tooltip.innerHTML = `<strong>Tháng ${label}</strong><br>Doanh thu: ${revenue.toLocaleString('vi-VN')} ₫`;
                        tooltip.classList.add("show");
                    });

                    bar.addEventListener("mousemove", (e) => {
                        tooltip.style.left = (e.pageX + 10) + "px";
                        tooltip.style.top = (e.pageY - 50) + "px";
                    });

                    bar.addEventListener("mouseout", () => {
                        tooltip.classList.remove("show");
                    });
                });
            })
            .catch(err => console.error("Lỗi tải biểu đồ doanh thu: ", err));
    };

    
    const showRoomsManagementModal = (hotel) => {
        let modalOverlay = document.getElementById("rooms-manage-modal");
        if (!modalOverlay) {
            modalOverlay = document.createElement("div");
            modalOverlay.id = "rooms-manage-modal";
            modalOverlay.className = "admin-modal-overlay";
            document.body.appendChild(modalOverlay);
        }

        modalOverlay.innerHTML = `
            <div class="admin-modal-card admin-modal-card-xl">
                <div class="d-flex justify-between align-center admin-modal-header">
                    <h3 class="admin-modal-title">Quản lý phòng - ${hotel.name}</h3>
                    <button class="modal-close-btn admin-modal-close-btn"><i class="fa-solid fa-times"></i></button>
                </div>
                
                <div class="d-flex justify-between align-center mb-15">
                    <h4 class="fs-base fw-600">Danh sách loại phòng</h4>
                    <button id="btn-add-room-modal" class="admin-btn-primary fs-sm"><i class="fa-solid fa-plus"></i> Thêm phòng mới</button>
                </div>

                <div class="table-responsive flex-1 overflow-y-auto mb-15">
                    <table class="admin-data-table w-100">
                        <thead>
                            <tr>
                                <th>Ảnh</th>
                                <th>Tên phòng</th>
                                <th>Giá/Đêm</th>
                                <th>Sức chứa</th>
                                <th>Loại giường</th>
                                <th>Trạng thái hôm nay</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="rooms-list-tbody">
                            <tr><td colspan="7" class="text-center">Đang tải danh sách phòng...</td></tr>
                        </tbody>
                    </table>
                </div>

                <div class="d-flex justify-end admin-modal-footer">
                    <button type="button" class="btn-close-manage admin-btn-cancel">Đóng</button>
                </div>
            </div>
        `;

        setTimeout(() => {
            modalOverlay.classList.add("show");
        }, 10);

        const closeModal = () => {
            modalOverlay.classList.remove("show");
            setTimeout(() => {
                modalOverlay.remove();
            }, 300);
        };

        modalOverlay.querySelector(".modal-close-btn").addEventListener("click", closeModal);
        modalOverlay.querySelector(".btn-close-manage").addEventListener("click", closeModal);

        const loadRoomsList = () => {
            const tbody = document.getElementById("rooms-list-tbody");
            if (!tbody) return;

            fetch(`http://127.0.0.1:5600/api/admin/hotels/${hotel.id}/rooms`)
                .then(res => res.json())
                .then(rooms => {
                    tbody.innerHTML = "";
                    if (rooms.length === 0) {
                        tbody.innerHTML = `<tr><td colspan="7" class="text-center">Chưa có phòng nào được thêm.</td></tr>`;
                        return;
                    }
                    rooms.forEach(r => {
                        const tr = document.createElement("tr");
                        const statusText = r.is_today_busy ? "Có khách" : "Trống";
                        const statusClass = r.is_today_busy ? "busy" : "empty";
                        const bookedDatesStr = JSON.stringify(r.booked_dates);
                        tr.innerHTML = `
                            <td><img src="${r.img || hotel.img}" alt="Room" class="hotel-table-img"></td>
                            <td><strong>${r.name}</strong></td>
                            <td><span class="text-orange-bold">${r.price.toLocaleString('vi-VN')} ₫</span></td>
                            <td>${r.capacity} khách</td>
                            <td>${r.bed_type}</td>
                            <td>
                                <span class="room-status-badge ${statusClass}" data-bookings='${bookedDatesStr}' data-name="${r.name}">
                                    ${statusText}
                                </span>
                            </td>
                            <td>
                                <button class="btn-edit-room" data-id="${r.id}"><i class="fa-solid fa-pen-to-square"></i> Sửa</button>
                                <button class="btn-delete-room ms-5" data-id="${r.id}"><i class="fa-solid fa-trash-can"></i> Xóa</button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });

                    const tooltip = document.querySelector(".chart-tooltip");
                    const statusBadges = tbody.querySelectorAll(".room-status-badge");
                    statusBadges.forEach(badge => {
                        badge.addEventListener("mouseover", () => {
                            const bookings = JSON.parse(badge.dataset.bookings || "[]");
                            const roomName = badge.dataset.name;
                            let html = `<strong>Lịch đặt phòng: ${roomName}</strong><br>`;
                            if (bookings.length === 0) {
                                html += "Chưa có lịch đặt nào.";
                            } else {
                                bookings.forEach(b => {
                                    html += `• ${b.check_in} đến ${b.check_out} (${b.user_email})<br>`;
                                });
                            }
                            tooltip.innerHTML = html;
                            tooltip.classList.add("show");
                        });

                        badge.addEventListener("mousemove", (e) => {
                            tooltip.style.left = (e.pageX + 10) + "px";
                            tooltip.style.top = (e.pageY - 50) + "px";
                        });

                        badge.addEventListener("mouseout", () => {
                            tooltip.classList.remove("show");
                        });
                    });

                    tbody.querySelectorAll(".btn-edit-room").forEach(editBtn => {
                        editBtn.addEventListener("click", () => {
                            const roomId = parseInt(editBtn.dataset.id, 10);
                            const room = rooms.find(x => x.id === roomId);
                            if (room) {
                                showRoomFormModal(hotel.id, room, loadRoomsList);
                            }
                        });
                    });

                    tbody.querySelectorAll(".btn-delete-room").forEach(delBtn => {
                        delBtn.addEventListener("click", () => {
                            const roomId = delBtn.dataset.id;
                            Utils.confirm("Bạn có chắc chắn muốn xóa loại phòng này không?").then(ok => {
                                if (ok) {
                                    fetch(`http://127.0.0.1:5600/api/admin/rooms/${roomId}`, {
                                        method: "DELETE"
                                    })
                                    .then(res => {
                                        if (!res.ok) throw new Error("Xóa phòng thất bại!");
                                        return res.json();
                                    })
                                    .then(() => {
                                        Utils.alert("Đã xóa phòng thành công!");
                                        loadRoomsList();
                                        loadHotelsManagement(); 
                                    })
                                    .catch(err => {
                                        console.error(err);
                                        Utils.alert("Gặp sự cố khi xóa phòng.");
                                    });
                                }
                            });
                        });
                    });
                })
                .catch(err => console.error("Lỗi tải danh sách phòng: ", err));
        };

        loadRoomsList();

        document.getElementById("btn-add-room-modal").addEventListener("click", () => {
            showRoomFormModal(hotel.id, null, loadRoomsList);
        });
    };

    
    const showRoomFormModal = (hotelId, room = null, onSuccess) => {
        let modalOverlay = document.getElementById("room-form-modal");
        if (!modalOverlay) {
            modalOverlay = document.createElement("div");
            modalOverlay.id = "room-form-modal";
            modalOverlay.className = "admin-modal-overlay";
            document.body.appendChild(modalOverlay);
        }

        const isEdit = !!room;
        const modalTitle = isEdit ? "Cập nhật Phòng" : "Thêm Phòng Mới";

        modalOverlay.innerHTML = `
            <div class="admin-modal-card">
                <div class="d-flex justify-between align-center admin-modal-header">
                    <h3 class="admin-modal-title">${modalTitle}</h3>
                    <button class="modal-close-btn admin-modal-close-btn"><i class="fa-solid fa-times"></i></button>
                </div>
                <form id="room-admin-form">
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Tên loại phòng (Ví dụ: Deluxe Double Room)</label>
                        <input type="text" id="room-name-input" value="${isEdit ? room.name : ''}" required class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Giá mỗi đêm (VND)</label>
                        <input type="number" id="room-price-input" value="${isEdit ? room.price : ''}" required class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Sức chứa tối đa (Số người lớn)</label>
                        <input type="number" id="room-capacity-input" value="${isEdit ? room.capacity : ''}" required class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Mô tả loại giường (Ví dụ: 1 giường đôi lớn)</label>
                        <input type="text" id="room-bed-input" value="${isEdit ? room.bed_type : ''}" class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Đường dẫn ảnh phòng</label>
                        <input type="text" id="room-img-input" value="${isEdit ? (room.img || '') : ''}" class="admin-form-input">
                    </div>
                    <div class="form-group admin-form-group">
                        <label class="fs-xs fw-600 admin-form-label">Tiện ích (phân cách bằng dấu phẩy)</label>
                        <input type="text" id="room-amenities-input" value="${isEdit ? (room.amenities ? room.amenities.join(', ') : '') : ''}" placeholder="Wifi, Điều hòa, Bồn tắm..." class="admin-form-input">
                    </div>
                    <div class="d-flex justify-end gap-10 admin-modal-footer">
                        <button type="button" class="btn-cancel-room-modal admin-btn-cancel">Hủy</button>
                        <button type="submit" class="admin-btn-submit">Lưu</button>
                    </div>
                </form>
            </div>
        `;

        setTimeout(() => {
            modalOverlay.classList.add("show");
        }, 10);

        const closeRoomModal = () => {
            modalOverlay.classList.remove("show");
            setTimeout(() => {
                modalOverlay.remove();
            }, 300);
        };

        modalOverlay.querySelector(".modal-close-btn").addEventListener("click", closeRoomModal);
        modalOverlay.querySelector(".btn-cancel-room-modal").addEventListener("click", closeRoomModal);

        const form = document.getElementById("room-admin-form");
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("room-name-input").value.trim();
            const price = parseInt(document.getElementById("room-price-input").value, 10);
            const capacity = parseInt(document.getElementById("room-capacity-input").value, 10);
            const bed_type = document.getElementById("room-bed-input").value.trim();
            const img = document.getElementById("room-img-input").value.trim();
            const amenitiesRaw = document.getElementById("room-amenities-input").value.trim();
            
            const amenities = amenitiesRaw ? amenitiesRaw.split(',').map(x => x.trim()).filter(x => x) : [];

            const bodyData = { name, price, capacity, bed_type, img, amenities };
            const apiUrl = isEdit
                ? `http://127.0.0.1:5600/api/admin/rooms/${room.id}`
                : `http://127.0.0.1:5600/api/admin/hotels/${hotelId}/rooms`;
            
            const method = isEdit ? "PUT" : "POST";

            fetch(apiUrl, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData)
            })
            .then(res => {
                if (!res.ok) throw new Error("Lưu phòng thất bại!");
                return res.json();
            })
            .then(() => {
                Utils.alert(isEdit ? "Cập nhật phòng thành công!" : "Thêm phòng mới thành công!");
                closeRoomModal();
                if (onSuccess) onSuccess();
                loadHotelsManagement(); 
            })
            .catch(err => {
                console.error(err);
                Utils.alert("Đã xảy ra lỗi khi lưu phòng.");
            });
        });
    };

    
    const btnAddHotel = document.getElementById("btn-add-hotel-modal");
    if (!btnAddHotel) {
        
        const filterCard = document.querySelector("#view-hotels .filter-card");
        if (filterCard) {
            const btn = document.createElement("button");
            btn.className = "admin-btn-primary";
            btn.id = "btn-add-hotel-modal";
            btn.innerHTML = `<i class="fa-solid fa-plus"></i> Thêm khách sạn mới`;
            
            const cardHeader = filterCard.parentNode;
            if (cardHeader) {
                
                filterCard.style.display = "flex";
                filterCard.style.alignItems = "center";
                filterCard.appendChild(btn);
                
                btn.addEventListener("click", () => {
                    showHotelFormModal();
                });
            }
        }
    } else {
        btnAddHotel.addEventListener("click", () => {
            showHotelFormModal();
        });
    }

    
    const menuItems = document.querySelectorAll(".nav-menu-item");
    const sections = document.querySelectorAll(".admin-view-section");
    const pageTitle = document.getElementById("page-title");

    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            
            menuItems.forEach(m => m.classList.remove("active"));
            item.classList.add("active");

            const view = item.dataset.view;
            sections.forEach(sec => sec.classList.add("hidden"));
            
            const targetSec = document.getElementById(`view-${view}`);
            if (targetSec) targetSec.classList.remove("hidden");

            const titleMap = {
                dashboard: "Tổng quan hệ thống",
                hotels: "Quản lý khách sạn",
                bookings: "Quản lý đơn đặt phòng",
                users: "Quản lý người dùng",
                guides: "Quản lý bài đăng",
                coupons: "Quản lý ưu đãi",
                reviews: "Quản lý đánh giá"
            };
            if (pageTitle) pageTitle.textContent = titleMap[view] || "Quản trị viên";

            if (view === "hotels") loadHotelsManagement();
            if (view === "bookings") loadBookingsManagement("all");
            if (view === "users") loadUsersManagement();
            if (view === "guides") loadGuidesManagement();
            if (view === "coupons") loadCouponsManagement();
            if (view === "reviews") loadReviewsManagement();
        });
    });

    const btnGotoBookings = document.getElementById("btn-goto-bookings");
    if (btnGotoBookings) {
        btnGotoBookings.addEventListener("click", () => {
            const bookingsMenu = document.querySelector('[data-view="bookings"]');
            if (bookingsMenu) bookingsMenu.click();
        });
    }

    const filterStatusSelect = document.getElementById("filter-booking-status");
    if (filterStatusSelect) {
        filterStatusSelect.addEventListener("change", (e) => {
            loadBookingsManagement(e.target.value);
        });
    }

    const logoutBtn = document.getElementById("admin-btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("user");
            Utils.alert("Đã đăng xuất tài khoản Quản trị.").then(() => {
                window.location.href = "../home/index.html";
            });
        });
    }

    
    document.addEventListener("click", (e) => {
        if (e.target.closest("#btn-add-user-modal")) {
            showUserFormModal();
        }
        if (e.target.closest("#btn-add-guide-modal")) {
            showGuideFormModal();
        }
        if (e.target.closest("#btn-add-coupon-modal")) {
            showCouponFormModal();
        }
    });

    loadDashboardKPIs();
    loadRecentBookings();
    loadPopularHotelsList();
    loadRevenueChart();
});
