// Common utility functions for frontend application
const Utils = {
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    },
    
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN').format(date);
    },

    alert: (message, title = "Thông báo") => {
        return new Promise((resolve) => {
            const overlay = document.createElement("div");
            overlay.className = "custom-modal-overlay";
            overlay.innerHTML = `
                <div class="custom-modal-card">
                    <div class="custom-modal-header">
                        <h3>${title}</h3>
                    </div>
                    <div class="custom-modal-body">${message}</div>
                    <div class="custom-modal-footer">
                        <button class="btn-primary custom-modal-ok-btn">OK</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            setTimeout(() => overlay.classList.add("show"), 10);

            const closeBtn = overlay.querySelector(".custom-modal-ok-btn");
            closeBtn.addEventListener("click", () => {
                overlay.classList.remove("show");
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, 200);
            });
        });
    },

    confirm: (message, title = "Xác nhận") => {
        return new Promise((resolve) => {
            const overlay = document.createElement("div");
            overlay.className = "custom-modal-overlay";
            overlay.innerHTML = `
                <div class="custom-modal-card">
                    <div class="custom-modal-header">
                        <h3>${title}</h3>
                    </div>
                    <div class="custom-modal-body">${message}</div>
                    <div class="custom-modal-footer">
                        <button class="btn-secondary custom-modal-cancel-btn">Hủy</button>
                        <button class="btn-primary custom-modal-confirm-btn">Đồng ý</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            setTimeout(() => overlay.classList.add("show"), 10);

            const cancelBtn = overlay.querySelector(".custom-modal-cancel-btn");
            const confirmBtn = overlay.querySelector(".custom-modal-confirm-btn");

            cancelBtn.addEventListener("click", () => {
                overlay.classList.remove("show");
                setTimeout(() => {
                    overlay.remove();
                    resolve(false);
                }, 200);
            });

            confirmBtn.addEventListener("click", () => {
                overlay.classList.remove("show");
                setTimeout(() => {
                    overlay.remove();
                    resolve(true);
                }, 200);
            });
        });
    }
};
