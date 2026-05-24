# Database connection helper for PostgreSQL
import psycopg2
from psycopg2 import pool
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_NAME = "hotel_booking"
DB_USER = "postgres"
DB_PASS = "123456"
DB_HOST = "localhost"
DB_PORT = "5432"

connection_pool = None

def seed_data(conn):
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM hotels;")
        count = cur.fetchone()[0]
        if count == 0:
            logger.info("Dang thuc hien seed du lieu khach san va phong mau...")
            hotels_data = [
                ("Vinpearl Resort & Spa Phú Quốc", "Phú Quốc, Kiên Giang", "../../assets/images/phuquoc.jpg", 3200000, 4.8, 1240, "Vinpearl Resort & Spa Phú Quốc mang đậm kiến trúc Á Đông với mái ngói đỏ đặc trưng. Khu nghỉ dưỡng sở hữu bãi biển riêng tư tuyệt đẹp, hồ bơi ngoài trời siêu rộng và các dịch vụ spa đẳng cấp quốc tế.", "hotel"),
                ("InterContinental Nha Trang", "Nha Trang, Khánh Hòa", "../../assets/images/nhatrang.jpg", 2800000, 4.7, 850, "Tọa lạc ngay trên con đường ven biển Trần Phú sầm uất, InterContinental Nha Trang mang đến trải nghiệm nghỉ dưỡng sang trọng bậc nhất với tầm nhìn bao quát toàn bộ vịnh Nha Trang xinh đẹp.", "hotel"),
                ("Hotel Colline Đà Lạt", "Đà Lạt, Lâm Đồng", "../../assets/images/dalat.jpg", 1500000, 4.5, 620, "Hotel Colline nằm ngay trung tâm thành phố Đà Lạt, bên cạnh chợ Đà Lạt. Khách sạn nổi bật với lối kiến trúc hiện đại, độc đáo mang âm hưởng châu Âu cùng dịch vụ ẩm thực phong phú.", "hotel"),
                ("Sofitel Legend Metropole Hà Nội", "Hoàn Kiếm, Hà Nội", "../../assets/images/hanoi.jpg", 4500000, 4.9, 1980, "Là một biểu tượng kiến trúc lịch sử được xây dựng từ năm 1901, Sofitel Legend Metropole Hà Nội là điểm dừng chân sang trọng mang phong cách cổ điển Pháp giữa lòng thủ đô Hà Nội.", "hotel"),
                ("Lotte Hotel Hanoi", "Ba Đình, Hà Nội", "../../assets/images/hanoi.jpg", 3000000, 4.8, 1250, "Khách sạn Lotte Hà Nội đại diện cho một tiêu chuẩn khách sạn 5 sao mới, nằm tại tầng cao của tòa nhà Lotte Center hiện đại bậc nhất thành phố.", "hotel"),
                ("The Oriental Jade Hotel", "Hoàn Kiếm, Hà Nội", "../../assets/images/hanoi.jpg", 2100000, 4.9, 890, "Khách sạn cổ điển, sang trọng nằm ngay trong lòng phố cổ Hà Nội, cách Hồ Gươm chỉ vài bước chân.", "hotel"),
                ("Dalat Wonder Resort", "Đà Lạt, Lâm Đồng", "../../assets/images/dalat.jpg", 1800000, 4.6, 750, "Dalat Wonder Resort nổi bật với phong cách kiến trúc châu Âu cổ điển, nép mình bên hồ Tuyền Lâm mộng mơ.", "hotel"),
                ("Mây Homestay Đà Lạt", "Đà Lạt, Lâm Đồng", "../../assets/images/dalat.jpg", 450000, 4.8, 120, "Mây Homestay Đà Lạt mang đến không gian bình yên, ấm cúng với thiết kế gỗ mộc mạc và view thung lũng săn mây cực đẹp.", "homestay"),
                ("Chill Homestay Nha Trang", "Nha Trang, Khánh Hòa", "../../assets/images/nhatrang.jpg", 350000, 4.6, 85, "Chill Homestay Nha Trang nằm sát bãi biển, thiết kế trẻ trung với sân thượng BBQ lộng gió.", "homestay"),
                ("La Nhà Homestay Đà Lạt", "Đà Lạt, Lâm Đồng", "../../assets/images/dalat.jpg", 500000, 4.7, 95, "La Nhà Homestay Đà Lạt nổi bật với phong cách vintage cổ xưa, có góc vườn nhỏ bình yên để tổ chức tiệc trà.", "homestay"),
                ("Green Homestay Phú Quốc", "Phú Quốc, Kiên Giang", "../../assets/images/phuquoc.jpg", 400000, 4.5, 60, "Không gian xanh mát ngập tràn cây cối, cách bãi tắm Ông Lang chỉ 5 phút đi bộ.", "homestay"),
                ("Hanoi Old Quarter Homestay", "Hoàn Kiếm, Hà Nội", "../../assets/images/hanoi.jpg", 380000, 4.7, 110, "Một homestay mang đậm nét văn hóa Hà Nội xưa cũ nằm giữa những con ngõ nhỏ của phố cổ.", "homestay")
            ]

            inserted_hotels = []
            for hotel in hotels_data:
                cur.execute("""
                    INSERT INTO hotels (name, location, img, price, rating, reviews_count, description, type)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id, name;
                """, hotel)
                inserted_hotels.append(cur.fetchone())

            rooms_data = {
                "Vinpearl Resort & Spa Phú Quốc": [
                    ("Deluxe Double Room", 3200000, 2, "1 giường đôi lớn (King Bed)", "../../assets/images/phuquoc.jpg", ["Wifi miễn phí", "Điều hòa", "Ban công", "Bồn tắm"]),
                    ("Executive Suite Ocean View", 4800000, 3, "1 giường đôi cực lớn và 1 giường đơn", "../../assets/images/phuquoc.jpg", ["Wifi miễn phí", "Điều hòa", "View biển", "Mini bar"])
                ],
                "InterContinental Nha Trang": [
                    ("Classic Room Ocean View", 2800000, 2, "1 giường đôi hoặc 2 giường đơn", "../../assets/images/nhatrang.jpg", ["Wifi miễn phí", "View biển", "Ban công", "Điều hòa"]),
                    ("Club InterContinental Suite", 5500000, 2, "1 giường đôi cực lớn (King Bed)", "../../assets/images/nhatrang.jpg", ["Wifi miễn phí", "View biển", "Đặc quyền Club lounge", "Bồn tắm"])
                ],
                "Hotel Colline Đà Lạt": [
                    ("Superior Double", 1500000, 2, "1 giường đôi", "../../assets/images/dalat.jpg", ["Wifi miễn phí", "Máy sưởi", "Tivi"]),
                    ("Deluxe Family Room", 2500000, 4, "2 giường đôi lớn", "../../assets/images/dalat.jpg", ["Wifi miễn phí", "View phố", "Phù hợp gia đình", "Máy sưởi"])
                ],
                "Sofitel Legend Metropole Hà Nội": [
                    ("Luxury Room (Opera Wing)", 4500000, 2, "1 giường đôi lớn (King Bed)", "../../assets/images/hanoi.jpg", ["Wifi miễn phí", "Nội thất cổ điển", "Điều hòa", "Bồn tắm đứng"]),
                    ("Grand Prestige Suite", 12000000, 2, "1 giường đôi cực lớn", "../../assets/images/hanoi.jpg", ["Wifi miễn phí", "Dịch vụ quản gia 24/7", "Mini bar cao cấp", "Bồn tắm sục"])
                ],
                "Lotte Hotel Hanoi": [
                    ("Deluxe Room", 3000000, 2, "1 giường đôi lớn", "../../assets/images/hanoi.jpg", ["Wifi miễn phí", "Điều hòa", "Bồn tắm nằm"]),
                    ("Club Suite", 6000000, 2, "1 giường đôi cực lớn", "../../assets/images/hanoi.jpg", ["Wifi miễn phí", "Dịch vụ phòng VIP", "Mini bar"])
                ],
                "The Oriental Jade Hotel": [
                    ("Superior Room", 2100000, 2, "1 giường đôi hoặc 2 giường đơn", "../../assets/images/hanoi.jpg", ["Wifi miễn phí", "Điều hòa", "View phố cổ"]),
                    ("Jade Executive Suite", 4500000, 2, "1 giường đôi cực lớn", "../../assets/images/hanoi.jpg", ["Wifi miễn phí", "Ban công", "Bồn tắm"])
                ],
                "Dalat Wonder Resort": [
                    ("Superior Lake View", 1800000, 2, "1 giường đôi lớn", "../../assets/images/dalat.jpg", ["Wifi miễn phí", "View hồ", "Máy sưởi"]),
                    ("Family Bungalow", 3800000, 4, "2 giường đôi lớn", "../../assets/images/dalat.jpg", ["Wifi miễn phí", "View hồ", "Khu sinh hoạt chung"])
                ],
                "Mây Homestay Đà Lạt": [
                    ("Phòng Dorm Tập Thể", 150000, 1, "1 giường tầng đơn", "../../assets/images/dalat.jpg", ["Wifi miễn phí", "Máy sưởi", "Tivi"]),
                    ("Phòng Private Cặp Đôi", 450000, 2, "1 giường đôi lớn", "../../assets/images/dalat.jpg", ["Wifi miễn phí", "Máy sưởi", "View thung lũng", "Ban công"])
                ],
                "Chill Homestay Nha Trang": [
                    ("Phòng Standard Double", 350000, 2, "1 giường đôi", "../../assets/images/nhatrang.jpg", ["Wifi miễn phí", "Điều hòa", "Máy giặt chung"]),
                    ("Phòng Family Suite", 700000, 4, "2 giường đôi lớn", "../../assets/images/nhatrang.jpg", ["Wifi miễn phí", "Điều hòa", "Bếp nấu ăn", "Ban công rộng"])
                ],
                "La Nhà Homestay Đà Lạt": [
                    ("Phòng Standard Vintage", 500000, 2, "1 giường đôi", "../../assets/images/dalat.jpg", ["Wifi miễn phí", "Thiết kế cổ điển", "Máy sưởi"]),
                    ("Phòng Deluxe Garden View", 800000, 2, "1 giường đôi lớn", "../../assets/images/dalat.jpg", ["Wifi miễn phí", "View vườn", "Ban công"])
                ],
                "Green Homestay Phú Quốc": [
                    ("Phòng Standard Garden", 400000, 2, "1 giường đôi", "../../assets/images/phuquoc.jpg", ["Wifi miễn phí", "Điều hòa", "Sân vườn"]),
                    ("Bungalow Pool View", 900000, 2, "1 giường đôi lớn", "../../assets/images/phuquoc.jpg", ["Wifi miễn phí", "Điều hòa", "View bể bơi"])
                ],
                "Hanoi Old Quarter Homestay": [
                    ("Phòng Cosy Room", 380000, 2, "1 giường đôi", "../../assets/images/hanoi.jpg", ["Wifi miễn phí", "Điều hòa", "Tủ lạnh nhỏ"]),
                    ("Phòng Family Balcony", 750000, 4, "2 giường đôi", "../../assets/images/hanoi.jpg", ["Wifi miễn phí", "Điều hòa", "Ban công"])
                ]
            }

            for hotel_id, hotel_name in inserted_hotels:
                if hotel_name in rooms_data:
                    for room in rooms_data[hotel_name]:
                        cur.execute("""
                            INSERT INTO rooms (hotel_id, name, price, capacity, bed_type, img, amenities)
                            VALUES (%s, %s, %s, %s, %s, %s, %s);
                        """, (hotel_id, room[0], room[1], room[2], room[3], room[4], room[5]))
            
            logger.info("Seed du lieu khach san va phong thanh cong!")

        cur.execute("SELECT COUNT(*) FROM coupons;")
        coupon_count = cur.fetchone()[0]
        if coupon_count == 0:
            logger.info("Dang thuc hien seed du lieu coupons...")
            coupons_data = [
                ("WELCOME10", 10, 1000000, "Giảm 10% cho đơn đặt phòng từ 1.000.000 ₫"),
                ("MYTRIP20", 20, 2000000, "Giảm 20% cho đơn đặt phòng từ 2.000.000 ₫"),
                ("SUPERDEAL30", 30, 4000000, "Giảm 30% cho đơn đặt phòng từ 4.000.000 ₫"),
                ("AGODA5", 5, 500000, "Giảm 5% cho đơn đặt phòng từ 500.000 ₫"),
                ("SUMMER30", 30, 3000000, "Giảm 30% cho đơn đặt phòng từ 3.000.000 ₫"),
                ("HOMESTAY15", 15, 1000000, "Giảm 15% cho đơn đặt phòng từ 1.000.000 ₫")
            ]
            cur.executemany("""
                INSERT INTO coupons (code, discount_percent, min_spend, description)
                VALUES (%s, %s, %s, %s);
            """, coupons_data)
            logger.info("Seed du lieu coupons thanh cong!")

        cur.execute("SELECT COUNT(*) FROM guides;")
        guide_count = cur.fetchone()[0]
        if guide_count == 0:
            logger.info("Dang thuc hien seed du lieu guides...")
            guides_data = [
                ("Top 5 địa điểm check-in không thể bỏ lỡ tại Đà Lạt", "Khám phá", "../../assets/images/dalat.jpg", "Khám phá những góc sống ảo siêu đẹp, thơ mộng mang phong cách Châu Âu ngay giữa lòng thành phố sương mù Đà Lạt.", "Đà Lạt luôn là điểm đến hấp dẫn du khách với khí hậu mát mẻ quanh năm và cảnh quan thơ mộng. Dưới đây là top 5 địa điểm check-in cực hot mà bạn không thể bỏ lỡ: \n1. Ga Đà Lạt - kiến trúc cổ điển Pháp độc đáo.\n2. Quảng trường Lâm Viên - biểu tượng hoa dã quỳ khổng lồ.\n3. Hồ Tuyền Lâm - khung cảnh non nước bình yên tĩnh lặng.\n4. Đồi chè Cầu Đất - thảm chè xanh mướt trải dài vô tận.\n5. Thung lũng Tình Yêu - góc sống ảo lãng mạn cho các cặp đôi."),
                ("Khám phá ẩm thực đường phố Nha Trang phong phú", "Ẩm thực", "../../assets/images/nhatrang.jpg", "Điểm danh các món ăn ngon khó cưỡng đặc trưng biển Nha Trang như bánh căn hải sản, bún chả cá, nem nướng...", "Nha Trang không chỉ hấp dẫn bởi bờ biển dài cát trắng mà còn bởi thiên đường ẩm thực đường phố vô cùng phong phú và đặc trưng:\n1. Bánh căn hải sản - vỏ bánh giòn tan kết hợp mực, tôm tươi rói cùng nước chấm xíu mại đậm đà.\n2. Nem nướng Nha Trang - nem được nướng thơm lừng cuộn cùng ram giòn và các loại rau rừng.\n3. Bún sứa Nha Trang - bát bún nóng hổi với sứa giòn sần sật, chả cá dai ngọt và nước dùng thanh mát từ cá dầm."),
                ("Kinh nghiệm du lịch Phú Quốc tự túc từ A đến Z", "Mẹo vặt", "../../assets/images/phuquoc.jpg", "Chia sẻ cẩm nang chi tiết về đi lại, ăn uống, vui chơi giải trí và các bãi biển đẹp nhất tại đảo ngọc Phú Quốc.", "Du lịch Phú Quốc tự túc chưa bao giờ dễ dàng hơn với bộ cẩm nang chi tiết dưới đây:\n- Thời điểm thích hợp: Từ tháng 11 đến tháng 4 năm sau là mùa khô, biển lặng, nắng đẹp.\n- Đi lại: Nên thuê xe máy để thoải mái di chuyển giữa Bắc đảo và Nam đảo.\n- Vui chơi: Đừng bỏ lỡ VinWonders, Safari Phú Quốc, cáp treo Hòn Thơm vượt biển dài nhất thế giới.\n- Ăn uống: Ghé chợ đêm Dương Đông thưởng thức bún quậy Kiến Xây và hải sản tươi sống giá rẻ."),
                ("Bí kíp săn mây đồi chè Cầu Đất Đà Lạt cực chuẩn", "Khám phá", "../../assets/images/dalat.jpg", "Chia sẻ thời điểm và kinh nghiệm săn mây đồi chè Cầu Đất giúp bạn lưu giữ những bức hình lung linh nhất.", "Săn mây tại đồi chè Cầu Đất là trải nghiệm tuyệt vời khi đến với Đà Lạt. Bạn nên xuất phát từ trung tâm lúc 4h30 sáng để kịp thời điểm sương mù bồng bềnh phủ trên thảm chè xanh ngát lúc bình minh."),
                ("1 ngày khám phá trọn vẹn phố cổ Hà Nội bằng xích lô", "Ẩm thực", "../../assets/images/hanoi.jpg", "Hành trình trải nghiệm dạo quanh 36 phố phường cổ kính và thưởng thức các món đặc sản Hà Nội nổi tiếng.", "Ngồi xích lô ngắm nhìn nhịp sống Hà Nội cổ kính, ghé thăm Ô Quan Chưởng, chợ Đồng Xuân và kết thúc bằng ly cà phê trứng Giảng béo ngậy giữa lòng phố cổ là trải nghiệm không thể quên."),
                ("Sapa mùa lúa chín - Kinh nghiệm ngắm thung lũng Mường Hoa", "Mẹo vặt", "../../assets/images/dalat.jpg", "Thời điểm ngắm những thửa ruộng bậc thang vàng óng đẹp như tranh vẽ tại các bản làng Sapa.", "Tháng 9 là lúc các ruộng bậc thang tại thung lũng Mường Hoa, bản Tả Van chuyển màu vàng ruộm. Đây là khoảng thời gian lý tưởng nhất để bạn trải nghiệm khí hậu se lạnh và cảnh sắc vùng cao hùng vĩ.")
            ]
            cur.executemany("""
                INSERT INTO guides (title, category, img, summary, content)
                VALUES (%s, %s, %s, %s, %s);
            """, guides_data)
            logger.info("Seed du lieu guides thanh cong!")

        cur.execute("SELECT COUNT(*) FROM users WHERE email = %s;", ("admin",))
        admin_exists = cur.fetchone()[0]
        from werkzeug.security import generate_password_hash
        password_hash = generate_password_hash("123456")
        if admin_exists == 0:
            logger.info("Dang thuc hien seed tai khoan admin mac dinh...")
            cur.execute("""
                INSERT INTO users (name, email, password_hash, is_admin)
                VALUES (%s, %s, %s, %s);
            """, ("Administrator", "admin", password_hash, True))
            logger.info("Seed tai khoan admin mac dinh thanh cong!")
        else:
            cur.execute("UPDATE users SET password_hash = %s, is_admin = TRUE WHERE email = %s;", (password_hash, "admin"))
            logger.info("Dong bo mat khau admin mac dinh ve 123456 thanh cong!")

        users_data = [
            ("Nguyễn Văn A", "user1@gmail.com", password_hash, False),
            ("Lê Thị B", "user2@gmail.com", password_hash, False),
            ("Trần Minh C", "customer@gmail.com", password_hash, False),
            ("Phạm Văn D", "test@gmail.com", password_hash, False)
        ]
        for u_name, u_email, u_hash, u_admin in users_data:
            cur.execute("SELECT COUNT(*) FROM users WHERE email = %s;", (u_email,))
            if cur.fetchone()[0] == 0:
                cur.execute("""
                    INSERT INTO users (name, email, password_hash, is_admin)
                    VALUES (%s, %s, %s, %s);
                """, (u_name, u_email, u_hash, u_admin))
        logger.info("Seed du lieu nguoi dung phu tro thanh cong!")

        import datetime
        import random
        cur.execute("SELECT COUNT(*) FROM bookings;")
        booking_count = cur.fetchone()[0]
        if booking_count == 0:
            logger.info("Dang thuc hien seed du lieu bookings mau cho 6 thang qua...")
            cur.execute("SELECT id, name, price FROM hotels;")
            hotels = cur.fetchall()
            
            statuses = ["Đã xác nhận", "Đã xác nhận", "Đã xác nhận", "Chờ thanh toán", "Đã hủy"]
            emails = ["user1@gmail.com", "user2@gmail.com", "customer@gmail.com", "test@gmail.com"]
            guests_options = ["1 Người lớn", "2 Người lớn", "2 Người lớn, 1 Trẻ em"]
            payment_methods = ["Thẻ tín dụng / Thẻ ghi nợ", "Ví MoMo", "Chuyển khoản ngân hàng"]
            
            now = datetime.datetime.now()
            for month_offset in range(6):
                for i in range(12):
                    hotel = random.choice(hotels)
                    hotel_id, hotel_name, base_price = hotel
                    
                    days_back = month_offset * 30 + random.randint(1, 25)
                    created_date = now - datetime.timedelta(days=days_back)
                    
                    check_in_date = (created_date + datetime.timedelta(days=random.randint(1, 5))).date()
                    check_out_date = check_in_date + datetime.timedelta(days=random.randint(1, 3))
                    
                    nights = (check_out_date - check_in_date).days
                    if nights <= 0:
                        nights = 1
                    room_name = "Deluxe Double Room" if random.choice([True, False]) else "Executive Suite Ocean View"
                    price_per_night = base_price
                    total_price = price_per_night * nights
                    
                    cur.execute("""
                        INSERT INTO bookings (user_email, hotel_id, room_name, price_per_night, check_in, check_out, guests, total_price, status, payment_method, created_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                    """, (
                        random.choice(emails),
                        hotel_id,
                        room_name,
                        price_per_night,
                        check_in_date,
                        check_out_date,
                        random.choice(guests_options),
                        total_price,
                        random.choice(statuses),
                        random.choice(payment_methods),
                        created_date
                    ))
            logger.info("Seed du lieu bookings mau thanh cong!")

        cur.execute("SELECT COUNT(*) FROM reviews;")
        reviews_count = cur.fetchone()[0]
        if reviews_count == 0:
            logger.info("Dang thuc hien seed du lieu reviews mau...")
            cur.execute("SELECT id FROM hotels;")
            hotel_ids = [r[0] for r in cur.fetchall()]
            
            reviews_data = [
                ("Nguyễn Minh T.", "nguyenminht@gmail.com", 5.0, "Trải nghiệm tuyệt vời. Phòng sạch sẽ, vị trí đẹp và nhân viên nhiệt tình."),
                ("Trần Thị H.", "tranthih@gmail.com", 4.5, "Khuôn viên đẹp, các tiện ích phòng ngủ rất đầy đủ và cao cấp. Bữa sáng phong phú."),
                ("David Lang", "davidlang@gmail.com", 4.0, "Great resort with beautiful view and superb pool. High-quality service, friendly staff."),
                ("Phạm Văn A.", "anpham@gmail.com", 5.0, "Dịch vụ phòng cực tốt, hỗ trợ chu đáo. Chắc chắn sẽ quay lại."),
                ("Lê Hoàng M.", "hoangle@gmail.com", 4.0, "Phòng ốc rộng rãi thoải mái. Giá hơi cao một chút nhưng xứng đáng chất lượng."),
                ("Hoàng Thu T.", "thuthao@gmail.com", 4.8, "Khách sạn sạch đẹp, nhân viên rất lịch thiệp. Gần trung tâm nên đi lại cực kỳ tiện lợi."),
                ("John Doe", "johndoe@gmail.com", 4.5, "Very clean and comfortable room. Nice staff and tasty breakfast. Strongly recommended!"),
                ("Nguyễn Văn B.", "vanbinh@gmail.com", 4.2, "Không gian yên tĩnh phù hợp để nghỉ dưỡng. Đồ ăn tạm ổn, sẽ quay lại lần sau."),
                ("Vũ Anh T.", "anhtuan@gmail.com", 4.7, "Phòng view đẹp xuất sắc, giường nằm êm ái. Dịch vụ dọn phòng nhanh nhẹn sạch sẽ."),
                ("Phan Thanh H.", "thanhhoa@gmail.com", 5.0, "Tuyệt vời từ khâu đón tiếp cho đến lúc check-out. Trải nghiệm đáng từng xu!")
            ]
            
            for hotel_id in hotel_ids:
                chosen_reviews = random.sample(reviews_data, 3)
                for r_name, r_email, r_rating, r_content in chosen_reviews:
                    cur.execute("""
                        INSERT INTO reviews (hotel_id, user_name, user_email, rating, content)
                        VALUES (%s, %s, %s, %s, %s);
                    """, (hotel_id, r_name, r_email, r_rating, r_content))
            logger.info("Seed du lieu reviews mau thanh cong!")

        cur.execute("SELECT id FROM hotels;")
        hotel_ids = [r[0] for r in cur.fetchall()]
        for hotel_id in hotel_ids:
            cur.execute("""
                SELECT COALESCE(AVG(rating), 5.0), COUNT(*) 
                FROM reviews 
                WHERE hotel_id = %s;
            """, (hotel_id,))
            avg_rating, count = cur.fetchone()
            cur.execute("""
                UPDATE hotels 
                SET rating = %s, reviews_count = %s 
                WHERE id = %s;
            """, (avg_rating, count, hotel_id))
        logger.info("Cap nhat rating va reviews_count hoan tat!")
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Loi khi seed du lieu he thong: {e}")
    finally:
        cur.close()

def init_db():
    global connection_pool
    
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}';")
        exists = cur.fetchone()
        if not exists:
            logger.info(f"Database '{DB_NAME}' khong ton tai. Dang tien hanh tao...")
            cur.execute(f"CREATE DATABASE {DB_NAME};")
            logger.info(f"Tao database '{DB_NAME}' thanh cong.")
        cur.close()
        conn.close()
    except Exception as e:
        logger.error(f"Loi khi kiem tra/khoi tao database tren postgres: {e}")

    
    try:
        connection_pool = psycopg2.pool.SimpleConnectionPool(
            1, 10,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST,
            port=DB_PORT
        )
        logger.info("Khoi tao Connection Pool PostgreSQL thanh cong.")
        
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS hotels (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                img VARCHAR(255) NOT NULL,
                price INT NOT NULL,
                rating DECIMAL(2,1) NOT NULL,
                reviews_count INT DEFAULT 0,
                description TEXT,
                type VARCHAR(50) DEFAULT 'hotel'
            );
        """)
        cur.execute("ALTER TABLE hotels ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'hotel';")

        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS rooms (
                id SERIAL PRIMARY KEY,
                hotel_id INT REFERENCES hotels(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                price INT NOT NULL,
                capacity INT NOT NULL,
                bed_type VARCHAR(100),
                img VARCHAR(255),
                amenities TEXT[]
            );
        """)

        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                user_email VARCHAR(100) NOT NULL,
                hotel_id INT REFERENCES hotels(id) ON DELETE SET NULL,
                room_name VARCHAR(255) NOT NULL,
                price_per_night INT NOT NULL,
                check_in DATE NOT NULL,
                check_out DATE NOT NULL,
                guests VARCHAR(100) NOT NULL,
                total_price INT NOT NULL,
                status VARCHAR(50) DEFAULT 'Chờ thanh toán',
                payment_method VARCHAR(50) DEFAULT 'Thẻ tín dụng / Thẻ ghi nợ',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cur.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'Thẻ tín dụng / Thẻ ghi nợ';")

        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS coupons (
                code VARCHAR(50) PRIMARY KEY,
                discount_percent INT NOT NULL,
                min_spend INT NOT NULL,
                description TEXT
            );
        """)

        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS guides (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                img VARCHAR(255) NOT NULL,
                summary TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATE DEFAULT CURRENT_DATE
            );
        """)

        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                hotel_id INT REFERENCES hotels(id) ON DELETE CASCADE,
                user_email VARCHAR(100) NOT NULL,
                user_name VARCHAR(100) NOT NULL,
                rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        conn.commit()
        cur.close()
        
        
        seed_data(conn)
        
        release_db_connection(conn)
        logger.info("Khoi tao cac bang du lieu thanh cong.")
    except Exception as e:
        logger.critical(f"Khong the ket noi/khoi tao CSDL '{DB_NAME}': {e}")
        raise e

def get_db_connection():
    if connection_pool is None:
        init_db()
    return connection_pool.getconn()

def release_db_connection(conn):
    if connection_pool and conn:
        connection_pool.putconn(conn)

# Edit: Add database connection pool documentation
# Edit: Add comments on database seeding logic