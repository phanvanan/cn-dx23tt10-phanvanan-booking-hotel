document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("navbar-component");
    if (!container) return;

    
    const checkLoginStatus = () => {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    };

    const renderNavbar = () => {
        const user = checkLoginStatus();
        const currentPath = window.location.pathname;
        const isActiveCoupons = currentPath.includes("/coupons/");
        const isActiveGuides = currentPath.includes("/guides/");
        const isActiveHoatDong = !isActiveCoupons && !isActiveGuides;
        
        let authButtonsHTML = '';
        if (user) {
            authButtonsHTML = `
                <a href="../booking-history/index.html" class="nav-item"><i class="fa-solid fa-suitcase"></i> Đơn đặt chỗ</a>
                <span class="user-welcome"><i class="fa-regular fa-circle-user"></i> ${user.name}</span>
                <button class="nav-item btn-logout-nav" id="navbar-logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</button>
            `;
        } else {
            authButtonsHTML = `
                <a href="#" class="nav-item" id="navbar-history-unauth"><i class="fa-solid fa-suitcase"></i> Đơn đặt chỗ</a>
                <button class="btn-login" id="navbar-login-btn">Đăng nhập / Đăng ký</button>
            `;
        }

        container.innerHTML = `
            <header class="navbar">
                <div class="container d-flex align-center justify-between">
                    <div class="d-flex align-center nav-left">
                        <a href="../home/index.html" class="logo-container">
                            <div class="agoda-dots">
                                <span class="dot dot-blue"></span>
                                <span class="dot dot-green"></span>
                                <span class="dot dot-yellow"></span>
                                <span class="dot dot-red"></span>
                                <span class="dot dot-purple"></span>
                            </div>
                            <span class="logo-text">An<span>PV</span></span>
                        </a>
                        <div class="nav-main d-flex align-center">
                            <a href="../home/index.html" class="nav-item-main ${isActiveHoatDong ? 'active' : ''}">Hoạt động</a>
                            <a href="../coupons/index.html" class="nav-item-main ${isActiveCoupons ? 'active' : ''}">Phiếu giảm giá và ưu đãi</a>
                            <a href="../guides/index.html" class="nav-item-main ${isActiveGuides ? 'active' : ''}">Cẩm nang du lịch</a>
                            <div class="nav-active-indicator"></div>
                        </div>
                    </div>
                    <div class="nav-links d-flex align-center" id="nav-links-container">
                        <a href="#" class="nav-item"><i class="fa-solid fa-headset"></i> Hỗ trợ</a>
                        <a href="#" class="nav-item">VND</a>
                        <a href="#" class="nav-item"><img src="https://flagcdn.com/w20/vn.png" alt="VN" class="flag-icon"></a>
                        <div id="nav-auth-box" class="d-flex align-center"></div>
                    </div>
                    
                    <button class="nav-hamburger" id="nav-hamburger-btn">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                </div>
                
                <div class="nav-mobile-menu" id="nav-mobile-menu">
                    <a href="../home/index.html" class="nav-mobile-item ${isActiveHoatDong ? 'active' : ''}">Hoạt động</a>
                    <a href="../coupons/index.html" class="nav-mobile-item ${isActiveCoupons ? 'active' : ''}">Phiếu giảm giá và ưu đãi</a>
                    <a href="../guides/index.html" class="nav-mobile-item ${isActiveGuides ? 'active' : ''}">Cẩm nang du lịch</a>
                    <hr class="nav-mobile-divider">
                    <a href="#" class="nav-mobile-item"><i class="fa-solid fa-headset"></i> Hỗ trợ</a>
                    <div id="nav-auth-mobile-box" class="nav-mobile-auth"></div>
                </div>
            </header>

            <div class="auth-modal-overlay" id="auth-modal">
                <div class="auth-modal-card">
                    <button class="btn-close-auth" id="btn-close-auth"><i class="fa-solid fa-xmark"></i></button>
                    <h2 class="auth-modal-title" id="auth-title">Đăng nhập tài khoản</h2>
                    
                    <div id="auth-login-form" class="auth-form-content">
                        <div class="auth-form-group">
                            <label>Email hoặc Số điện thoại</label>
                            <input type="text" id="auth-login-email" placeholder="Nhập email hoặc số điện thoại...">
                        </div>
                        <div class="auth-form-group">
                            <label>Mật khẩu</label>
                            <input type="password" id="auth-login-password" placeholder="Nhập mật khẩu..." value="123456">
                        </div>
                        <button class="btn-auth-submit" id="btn-login-submit">Đăng nhập</button>
                    </div>

                    <div id="auth-register-form" class="auth-form-content hidden">
                        <div class="auth-form-group">
                            <label>Họ và Tên</label>
                            <input type="text" id="auth-reg-name" placeholder="Nhập họ và tên của bạn...">
                        </div>
                        <div class="auth-form-group">
                            <label>Email hoặc Số điện thoại</label>
                            <input type="text" id="auth-reg-email" placeholder="Nhập email hoặc số điện thoại...">
                        </div>
                        <div class="auth-form-group">
                            <label>Mật khẩu</label>
                            <input type="password" id="auth-reg-password" placeholder="Nhập mật khẩu mới...">
                        </div>
                        <div class="auth-form-group">
                            <label>Nhập lại mật khẩu</label>
                            <input type="password" id="auth-reg-confirm" placeholder="Xác nhận lại mật khẩu...">
                        </div>
                        <button class="btn-auth-submit" id="btn-reg-submit">Đăng ký</button>
                    </div>
                    
                    <p class="auth-switch-text" id="auth-switch-box">Chưa có tài khoản? <a href="#" id="btn-switch-auth">Đăng ký ngay</a></p>
                </div>
            </div>
        `;

        const userBox = document.getElementById("nav-auth-box");
        const userMobileBox = document.getElementById("nav-auth-mobile-box");
        
        let authHTML = '';
        let authMobileHTML = '';
        
        if (user) {
            const adminBtnHTML = user.isAdmin 
                ? `<a href="../admin/index.html" class="nav-item"><i class="fa-solid fa-user-gear"></i> Quản trị</a>` 
                : '';
            const adminMobileBtnHTML = user.isAdmin 
                ? `<a href="../admin/index.html" class="nav-mobile-item"><i class="fa-solid fa-user-gear"></i> Quản trị</a>` 
                : '';
            
            authHTML = `
                ${adminBtnHTML}
                <a href="../booking-history/index.html" class="nav-item"><i class="fa-solid fa-suitcase"></i> Đơn đặt chỗ</a>
                <span class="user-welcome"><i class="fa-regular fa-circle-user"></i> ${user.name}</span>
                <button class="nav-item navbar-logout-btn btn-logout-nav"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</button>
            `;

            authMobileHTML = `
                ${adminMobileBtnHTML}
                <a href="../booking-history/index.html" class="nav-mobile-item"><i class="fa-solid fa-suitcase"></i> Đơn đặt chỗ</a>
                <span class="nav-mobile-item user-welcome-mobile"><i class="fa-regular fa-circle-user"></i> ${user.name}</span>
                <button class="nav-mobile-item navbar-logout-btn btn-logout-mobile"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</button>
            `;
        } else {
            authHTML = `
                <a href="#" class="nav-item navbar-history-unauth"><i class="fa-solid fa-suitcase"></i> Đơn đặt chỗ</a>
                <button class="btn-login navbar-login-btn">Đăng nhập / Đăng ký</button>
            `;
            authMobileHTML = `
                <a href="#" class="nav-mobile-item navbar-history-unauth"><i class="fa-solid fa-suitcase"></i> Đơn đặt chỗ</a>
                <button class="btn-login navbar-login-btn btn-login-mobile">Đăng nhập / Đăng ký</button>
            `;
        }

        if (userBox) userBox.innerHTML = authHTML;
        if (userMobileBox) userMobileBox.innerHTML = authMobileHTML;

        initNavIndicator();
        setupEventListeners();
    };

    const initNavIndicator = () => {
        const navMain = document.querySelector(".nav-main");
        const indicator = document.querySelector(".nav-active-indicator");
        const items = document.querySelectorAll(".nav-item-main");
        if (!navMain || !indicator || items.length === 0) return;

        const updateIndicator = (el) => {
            if (!el) {
                indicator.style.width = "0px";
                indicator.style.opacity = "0";
                return;
            }
            const rect = el.getBoundingClientRect();
            const parentRect = navMain.getBoundingClientRect();
            indicator.style.left = `${rect.left - parentRect.left}px`;
            indicator.style.width = `${rect.width}px`;
            indicator.style.opacity = "1";
        };

        const activeItem = navMain.querySelector(".nav-item-main.active");
        if (activeItem) {
            setTimeout(() => {
                updateIndicator(activeItem);
            }, 50);
        }

        items.forEach(item => {
            item.addEventListener("mouseenter", () => {
                updateIndicator(item);
            });
            item.addEventListener("mouseleave", () => {
                const currentActive = navMain.querySelector(".nav-item-main.active");
                updateIndicator(currentActive);
            });
        });

        window.addEventListener("resize", () => {
            const currentActive = navMain.querySelector(".nav-item-main.active");
            updateIndicator(currentActive);
        });
    };

    const setupEventListeners = () => {
        const modal = document.getElementById("auth-modal");
        const loginBtns = document.querySelectorAll(".navbar-login-btn");
        const closeBtn = document.getElementById("btn-close-auth");
        const logoutBtns = document.querySelectorAll(".navbar-logout-btn");
        const historyUnauths = document.querySelectorAll(".navbar-history-unauth");
        const hamburgerBtn = document.getElementById("nav-hamburger-btn");
        const mobileMenu = document.getElementById("nav-mobile-menu");
        
        const loginForm = document.getElementById("auth-login-form");
        const registerForm = document.getElementById("auth-register-form");
        const loginSubmit = document.getElementById("btn-login-submit");
        const registerSubmit = document.getElementById("btn-reg-submit");
        
        const switchBtn = document.getElementById("btn-switch-auth");
        const authTitle = document.getElementById("auth-title");
        const switchBox = document.getElementById("auth-switch-box");

        let isLoginMode = true;

        const openModal = (e) => {
            if(e) e.preventDefault();
            modal.classList.add("show");
            if (mobileMenu) mobileMenu.classList.remove("show"); 
        };

        const closeModal = () => {
            modal.classList.remove("show");
            isLoginMode = true;
            if (loginForm && registerForm) {
                loginForm.classList.remove("hidden");
                registerForm.classList.add("hidden");
            }
            if (authTitle) authTitle.textContent = "Đăng nhập tài khoản";
            if (switchBox) switchBox.innerHTML = `Chưa có tài khoản? <a href="#" id="btn-switch-auth">Đăng ký ngay</a>`;
            bindSwitchEvent();
        };

        
        if (hamburgerBtn && mobileMenu) {
            hamburgerBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                mobileMenu.classList.toggle("show");
            });
            
            document.addEventListener("click", (e) => {
                if (!mobileMenu.contains(e.target) && e.target !== hamburgerBtn) {
                    mobileMenu.classList.remove("show");
                }
            });
        }

        loginBtns.forEach(btn => btn.addEventListener("click", openModal));
        if (closeBtn) closeBtn.addEventListener("click", closeModal);
        historyUnauths.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                Utils.alert("Vui lòng đăng nhập để xem đơn đặt chỗ của bạn!");
                openModal();
            });
        });

        logoutBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                fetch("http://127.0.0.1:5600/api/auth/logout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                })
                .finally(() => {
                    localStorage.removeItem("user");
                    renderNavbar();
                    if (window.location.pathname.includes("booking-history") || window.location.pathname.includes("admin")) {
                        window.location.href = "../home/index.html";
                    }
                });
            });
        });

        const bindSwitchEvent = () => {
            const currentSwitchBtn = document.getElementById("btn-switch-auth");
            if (currentSwitchBtn) {
                currentSwitchBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    isLoginMode = !isLoginMode;
                    if (isLoginMode) {
                        authTitle.textContent = "Đăng nhập tài khoản";
                        loginForm.classList.remove("hidden");
                        registerForm.classList.add("hidden");
                        switchBox.innerHTML = `Chưa có tài khoản? <a href="#" id="btn-switch-auth">Đăng ký ngay</a>`;
                    } else {
                        authTitle.textContent = "Đăng ký thành viên";
                        loginForm.classList.add("hidden");
                        registerForm.classList.remove("hidden");
                        switchBox.innerHTML = `Đã có tài khoản? <a href="#" id="btn-switch-auth">Đăng nhập ngay</a>`;
                    }
                    bindSwitchEvent();
                });
            }
        };

        bindSwitchEvent();

        if (loginSubmit) {
            loginSubmit.addEventListener("click", () => {
                const emailInput = document.getElementById("auth-login-email").value.trim();
                const passwordInput = document.getElementById("auth-login-password").value;

                if (!emailInput || !passwordInput) {
                    Utils.alert("Vui lòng nhập Email/Số điện thoại và Mật khẩu!");
                    return;
                }

                fetch("http://127.0.0.1:5600/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: emailInput, password: passwordInput })
                })
                .then(res => {
                    if (!res.ok) {
                        return res.json().then(data => { throw new Error(data.error || "Đăng nhập thất bại!") });
                    }
                    return res.json();
                })
                .then(userObj => {
                    localStorage.setItem("user", JSON.stringify(userObj));
                    closeModal();
                    renderNavbar();

                    if (userObj.isAdmin) {
                        Utils.alert("Đăng nhập quyền Quản trị thành công! Chuyển hướng sang trang Dashboard.").then(() => {
                            window.location.href = "../admin/index.html";
                        });
                    } else {
                        Utils.alert("Đăng nhập thành công!");
                    }
                })
                .catch(err => {
                    Utils.alert(err.message);
                });
            });
        }

        if (registerSubmit) {
            registerSubmit.addEventListener("click", () => {
                const nameInput = document.getElementById("auth-reg-name").value.trim();
                const emailInput = document.getElementById("auth-reg-email").value.trim();
                const passwordInput = document.getElementById("auth-reg-password").value;
                const confirmInput = document.getElementById("auth-reg-confirm").value;

                if (!nameInput || !emailInput || !passwordInput || !confirmInput) {
                    Utils.alert("Vui lòng điền đầy đủ tất cả các trường đăng ký!");
                    return;
                }

                if (passwordInput !== confirmInput) {
                    Utils.alert("Mật khẩu nhập lại không trùng khớp!");
                    return;
                }

                fetch("http://127.0.0.1:5600/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: nameInput, email: emailInput, password: passwordInput })
                })
                .then(res => {
                    if (!res.ok) {
                        return res.json().then(data => { throw new Error(data.error || "Đăng ký thất bại!") });
                    }
                    return res.json();
                })
                .then(userObj => {
                    localStorage.setItem("user", JSON.stringify(userObj));
                    closeModal();
                    renderNavbar();
                    
                    if (userObj.isAdmin) {
                        Utils.alert("Đăng ký tài khoản Admin thành công! Chuyển hướng tới trang Dashboard.").then(() => {
                            window.location.href = "../admin/index.html";
                        });
                    } else {
                        Utils.alert("Đăng ký thành viên thành công! Bạn đã được tự động đăng nhập.");
                    }
                })
                .catch(err => {
                    Utils.alert(err.message);
                });
            });
        }
    };

    
    renderNavbar();
});

