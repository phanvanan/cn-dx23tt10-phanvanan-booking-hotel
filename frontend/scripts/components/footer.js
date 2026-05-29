// Footer component for inserting dynamic footer content
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("footer-component");
    if (!container) return;

    container.innerHTML = `
        <footer class="footer">
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-col">
                        <h3 class="footer-brand">An<span>PV</span></h3>
                        <p class="footer-desc">Hệ thống đặt phòng khách sạn trực tuyến hàng đầu Việt Nam. Giúp bạn tìm và đặt chỗ lưu trú lý tưởng với mức giá ưu đãi nhất.</p>
                    </div>
                    <div class="footer-col">
                        <h3>Dịch vụ & Hỗ trợ</h3>
                        <a href="#">Trung tâm trợ giúp</a>
                        <a href="../booking-history/index.html">Đơn đặt chỗ của tôi</a>
                        <a href="#">Hướng dẫn đặt phòng</a>
                        <a href="#">Chính sách hoàn tiền</a>
                    </div>
                    <div class="footer-col">
                        <h3>Dành cho đối tác</h3>
                        <a href="../admin/index.html">Trang quản trị (Admin)</a>
                        <a href="#">Đăng ký khách sạn đối tác</a>
                        <a href="#">Chương trình đại lý</a>
                        <a href="#">Tuyển dụng</a>
                    </div>
                    <div class="footer-col">
                        <h3>Kết nối với chúng tôi</h3>
                        <p class="footer-contact"><i class="fa-solid fa-phone"></i> Hotline: 1900 1234</p>
                        <p class="footer-contact"><i class="fa-solid fa-envelope"></i> hotro@anpv.vn</p>
                        <div class="footer-socials">
                            <a href="#"><i class="fa-brands fa-facebook"></i></a>
                            <a href="#"><i class="fa-brands fa-instagram"></i></a>
                            <a href="#"><i class="fa-brands fa-youtube"></i></a>
                            <a href="#"><i class="fa-brands fa-tiktok"></i></a>
                        </div>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p>© 2026 AnPV. All rights reserved.</p>
                </div>
            </div>
        </footer>
    `;
});
