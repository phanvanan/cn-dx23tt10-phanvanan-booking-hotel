# Flask Backend API for Hotel Booking System
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend'))

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')

CORS(app, resources={r"/*": {"origins": "*"}})


@app.before_request
def initialize_database():
    
    app.before_request_funcs[None].remove(initialize_database)
    db.init_db()

@app.route('/', methods=['GET'])
def index():
    return send_from_directory(FRONTEND_DIR, 'pages/home/index.html')

PAGES_LIST = ['admin', 'booking-history', 'coupons', 'guides', 'home', 'hotel-checkout', 'hotel-confirm', 'hotel-detail', 'hotel-list']

@app.route('/<page_name>/', defaults={'filename': 'index.html'}, methods=['GET'])
@app.route('/<page_name>/<filename>', methods=['GET'])
def serve_pages(page_name, filename):
    if page_name in PAGES_LIST:
        page_path = os.path.join(FRONTEND_DIR, 'pages', page_name, filename)
        if os.path.exists(page_path):
            return send_from_directory(os.path.join(FRONTEND_DIR, 'pages', page_name), filename)
    return send_from_directory(FRONTEND_DIR, f"{page_name}/{filename}")

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Dữ liệu yêu cầu không hợp lệ!"}), 400

    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({"error": "Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu!"}), 400

    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        
        
        cur.execute("SELECT id FROM users WHERE email = %s;", (email,))
        if cur.fetchone():
            return jsonify({"error": "Email này đã được đăng ký sử dụng!"}), 400

        
        password_hash = generate_password_hash(password)
        
        
        is_admin = "admin" in email

        
        cur.execute(
            "INSERT INTO users (name, email, password_hash, is_admin) VALUES (%s, %s, %s, %s) RETURNING name, email, is_admin;",
            (name, email, password_hash, is_admin)
        )
        new_user = cur.fetchone()
        conn.commit()

        logger.info(f"Dang ky thanh cong user moi: {email}")
        return jsonify({
            "name": new_user[0],
            "email": new_user[1],
            "isAdmin": new_user[2]
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Loi khi dang ky tai khoan: {e}")
        return jsonify({"error": "Đã xảy ra lỗi hệ thống khi đăng ký tài khoản!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Dữ liệu yêu cầu không hợp lệ!"}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"error": "Vui lòng nhập đầy đủ Email và Mật khẩu!"}), 400

    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()

        
        cur.execute("SELECT name, email, password_hash, is_admin FROM users WHERE email = %s;", (email,))
        user = cur.fetchone()
        
        if not user:
            logger.warning(f"Dang nhap that bai: Email '{email}' khong ton tai trong he thong.")
            return jsonify({"error": "Tài khoản hoặc mật khẩu không chính xác!"}), 401

        db_name, db_email, db_password_hash, db_is_admin = user
        if not check_password_hash(db_password_hash, password):
            logger.warning(f"Dang nhap that bai: Sai mat khau cho tai khoan '{email}'.")
            return jsonify({"error": "Tài khoản hoặc mật khẩu không chính xác!"}), 401

        logger.info(f"Dang nhap thanh cong: {email}")
        return jsonify({
            "name": db_name,
            "email": db_email,
            "isAdmin": db_is_admin
        }), 200

    except Exception as e:
        logger.error(f"Loi khi dang nhap: {e}")
        return jsonify({"error": "Đã xảy ra lỗi hệ thống khi đăng nhập!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    return jsonify({"message": "Đăng xuất thành công!"}), 200

@app.route('/api/hotels', methods=['GET'])
def get_hotels():
    conn = None
    cur = None
    try:
        hotel_type = request.args.get('type')
        location = request.args.get('location')
        conn = db.get_db_connection()
        cur = conn.cursor()
        query = "SELECT id, name, location, img, price, rating, reviews_count, description, type FROM hotels"
        conditions = []
        params = []
        if hotel_type:
            conditions.append("type = %s")
            params.append(hotel_type)
        if location:
            conditions.append("location ILIKE %s")
            params.append(f"%{location}%")
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY id;"
        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        hotels = []
        for r in rows:
            hotels.append({
                "id": r[0],
                "name": r[1],
                "location": r[2],
                "img": r[3],
                "price": r[4],
                "rating": float(r[5]),
                "reviews_count": r[6],
                "description": r[7],
                "type": r[8]
            })
        return jsonify(hotels), 200
    except Exception as e:
        logger.error(f"Loi khi lay danh sach khach san: {e}")
        return jsonify({"error": "Không thể tải danh sách khách sạn!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/hotels/<int:hotel_id>', methods=['GET'])
def get_hotel_detail(hotel_id):
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        
        
        cur.execute("SELECT id, name, location, img, price, rating, reviews_count, description, type FROM hotels WHERE id = %s;", (hotel_id,))
        r = cur.fetchone()
        if not r:
            return jsonify({"error": "Khách sạn không tồn tại!"}), 404
            
        hotel = {
            "id": r[0],
            "name": r[1],
            "location": r[2],
            "img": r[3],
            "price": r[4],
            "rating": float(r[5]),
            "reviews_count": r[6],
            "description": r[7],
            "type": r[8],
            "rooms": []
        }
        
        
        check_in = request.args.get('check_in')
        check_out = request.args.get('check_out')
        guests = request.args.get('guests')

        query = "SELECT id, name, price, capacity, bed_type, img, amenities FROM rooms WHERE hotel_id = %s"
        params = [hotel_id]

        if guests:
            try:
                query += " AND capacity >= %s"
                params.append(int(guests))
            except ValueError:
                pass

        if check_in and check_out:
            query += """ AND name NOT IN (
                SELECT room_name FROM bookings 
                WHERE hotel_id = %s AND status != 'Đã hủy'
                  AND check_in < %s AND check_out > %s
            )"""
            params.extend([hotel_id, check_out, check_in])

        query += " ORDER BY price;"
        cur.execute(query, tuple(params))
        room_rows = cur.fetchall()
        for rr in room_rows:
            hotel["rooms"].append({
                "id": rr[0],
                "name": rr[1],
                "price": rr[2],
                "capacity": rr[3],
                "bed_type": rr[4],
                "img": rr[5],
                "amenities": rr[6]
            })
            
        return jsonify(hotel), 200
    except Exception as e:
        logger.error(f"Loi khi lay chi tiet khach san {hotel_id}: {e}")
        return jsonify({"error": "Không thể tải chi tiết khách sạn!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    conn = None
    cur = None
    try:
        data = request.get_json()
        user_email = data.get('user_email')
        hotel_id = data.get('hotel_id')
        room_name = data.get('room_name')
        price_per_night = data.get('price_per_night')
        check_in = data.get('check_in')
        check_out = data.get('check_out')
        guests = data.get('guests')
        total_price = data.get('total_price')
        payment_method = data.get('payment_method', 'Thẻ tín dụng / Thẻ ghi nợ')

        if not all([user_email, hotel_id, room_name, price_per_night, check_in, check_out, guests, total_price]):
            return jsonify({"error": "Vui lòng nhập đầy đủ thông tin đặt phòng!"}), 400

        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO bookings (user_email, hotel_id, room_name, price_per_night, check_in, check_out, guests, total_price, payment_method)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;
        """, (user_email, hotel_id, room_name, price_per_night, check_in, check_out, guests, total_price, payment_method))
        booking_id = cur.fetchone()[0]
        conn.commit()
        return jsonify({"message": "Đặt phòng thành công!", "booking_id": booking_id}), 201
    except Exception as e:
        logger.error(f"Loi khi dat phong: {e}")
        return jsonify({"error": "Không thể lưu thông tin đặt phòng!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/bookings/user/<string:email>', methods=['GET'])
def get_user_bookings(email):
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT b.id, b.user_email, b.hotel_id, h.name AS hotel_name, h.img AS hotel_img, 
                   b.room_name, b.price_per_night, b.check_in, b.check_out, b.guests, b.total_price, b.status, b.created_at, b.payment_method
            FROM bookings b
            LEFT JOIN hotels h ON b.hotel_id = h.id
            WHERE b.user_email = %s
            ORDER BY b.created_at DESC;
        """, (email,))
        rows = cur.fetchall()
        bookings = []
        for r in rows:
            bookings.append({
                "id": r[0],
                "user_email": r[1],
                "hotel_id": r[2],
                "hotel_name": r[3] or "Khách sạn đã xóa",
                "hotel_img": r[4] or "../../assets/images/hotel_1.png",
                "room_name": r[5],
                "price_per_night": r[6],
                "check_in": r[7].strftime('%Y-%m-%d') if r[7] else None,
                "check_out": r[8].strftime('%Y-%m-%d') if r[8] else None,
                "guests": r[9],
                "total_price": r[10],
                "status": r[11],
                "created_at": r[12].strftime('%d/%m/%Y %H:%M') if r[12] else None,
                "payment_method": r[13] or "Thẻ tín dụng / Thẻ ghi nợ"
            })
        return jsonify(bookings), 200
    except Exception as e:
        logger.error(f"Loi khi lay lich su dat phong cho {email}: {e}")
        return jsonify({"error": "Không thể tải lịch sử đặt phòng!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/bookings/<int:booking_id>/cancel', methods=['PUT'])
def cancel_booking(booking_id):
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE bookings SET status = 'Đã hủy' WHERE id = %s;", (booking_id,))
        conn.commit()
        return jsonify({"message": "Hủy đơn đặt phòng thành công!"}), 200
    except Exception as e:
        logger.error(f"Loi khi huy don dat phong {booking_id}: {e}")
        return jsonify({"error": "Không thể hủy đơn đặt phòng!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/coupons', methods=['GET'])
def get_coupons():
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT code, discount_percent, min_spend, description FROM coupons;")
        rows = cur.fetchall()
        coupons = []
        for r in rows:
            coupons.append({
                "code": r[0],
                "discount_percent": r[1],
                "min_spend": r[2],
                "description": r[3]
            })
        return jsonify(coupons), 200
    except Exception as e:
        logger.error(f"Loi khi lay danh sach coupons: {e}")
        return jsonify({"error": "Không thể tải danh sách mã giảm giá!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/coupons/apply', methods=['POST'])
def apply_coupon():
    conn = None
    cur = None
    try:
        data = request.get_json()
        code = data.get('code', '').upper()
        total_price = data.get('total_price', 0)

        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT code, discount_percent, min_spend, description FROM coupons WHERE code = %s;", (code,))
        r = cur.fetchone()
        if not r:
            return jsonify({"error": "Mã giảm giá không hợp lệ!"}), 404

        discount_percent = r[1]
        min_spend = r[2]
        
        if total_price < min_spend:
            return jsonify({"error": f"Mã này chỉ áp dụng cho đơn hàng từ {min_spend} ₫ trở lên!"}), 400

        discount_amount = int(total_price * (discount_percent / 100))
        final_price = total_price - discount_amount

        return jsonify({
            "valid": True,
            "discount_percent": discount_percent,
            "discount_amount": discount_amount,
            "final_price": final_price,
            "message": f"Áp dụng mã giảm giá thành công! Bạn được giảm {discount_percent}%."
        }), 200
    except Exception as e:
        logger.error(f"Loi khi dung coupon: {e}")
        return jsonify({"error": "Lỗi hệ thống khi áp dụng mã giảm giá!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/guides', methods=['GET'])
def get_guides():
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, title, category, img, summary, content, created_at FROM guides ORDER BY id;")
        rows = cur.fetchall()
        guides = []
        for r in rows:
            guides.append({
                "id": r[0],
                "title": r[1],
                "category": r[2],
                "img": r[3],
                "summary": r[4],
                "content": r[5],
                "created_at": r[6].strftime('%d/%m/%Y') if r[6] else None
            })
        return jsonify(guides), 200
    except Exception as e:
        logger.error(f"Loi khi lay danh sach guides: {e}")
        return jsonify({"error": "Không thể tải danh sách cẩm nang!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/guides/<int:guide_id>', methods=['GET'])
def get_guide_detail(guide_id):
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, title, category, img, summary, content, created_at FROM guides WHERE id = %s;", (guide_id,))
        r = cur.fetchone()
        if not r:
            return jsonify({"error": "Bài viết không tồn tại!"}), 404
        guide = {
            "id": r[0],
            "title": r[1],
            "category": r[2],
            "img": r[3],
            "summary": r[4],
            "content": r[5],
            "created_at": r[6].strftime('%d/%m/%Y') if r[6] else None
        }
        return jsonify(guide), 200
    except Exception as e:
        logger.error(f"Loi khi lay chi tiet guide {guide_id}: {e}")
        return jsonify({"error": "Không thể tải chi tiết cẩm nang!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/kpis', methods=['GET'])
def get_admin_kpis():
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        
        
        cur.execute("SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status != 'Đã hủy';")
        total_revenue = cur.fetchone()[0]

        
        cur.execute("SELECT COUNT(*) FROM bookings;")
        total_bookings = cur.fetchone()[0]

        
        cur.execute("SELECT COUNT(*) FROM hotels;")
        total_hotels = cur.fetchone()[0]

        
        cur.execute("SELECT COUNT(*) FROM users;")
        total_users = cur.fetchone()[0]

        return jsonify({
            "total_revenue": total_revenue,
            "total_bookings": total_bookings,
            "total_hotels": total_hotels,
            "total_users": total_users
        }), 200
    except Exception as e:
        logger.error(f"Loi khi lay admin kpis: {e}")
        return jsonify({"error": "Không thể tải số liệu thống kê!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/bookings', methods=['GET'])
def get_admin_bookings():
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT b.id, b.user_email, b.hotel_id, h.name AS hotel_name, 
                   b.room_name, b.price_per_night, b.check_in, b.check_out, b.guests, b.total_price, b.status, b.created_at, b.payment_method
            FROM bookings b
            LEFT JOIN hotels h ON b.hotel_id = h.id
            ORDER BY b.created_at DESC;
        """)
        rows = cur.fetchall()
        bookings = []
        for r in rows:
            bookings.append({
                "id": r[0],
                "user_email": r[1],
                "hotel_id": r[2],
                "hotel_name": r[3] or "Khách sạn đã xóa",
                "room_name": r[4],
                "price_per_night": r[5],
                "check_in": r[6].strftime('%Y-%m-%d') if r[6] else None,
                "check_out": r[7].strftime('%Y-%m-%d') if r[7] else None,
                "guests": r[8],
                "total_price": r[9],
                "status": r[10],
                "created_at": r[11].strftime('%d/%m/%Y %H:%M') if r[11] else None,
                "payment_method": r[12] or "Thẻ tín dụng / Thẻ ghi nợ"
            })
        return jsonify(bookings), 200
    except Exception as e:
        logger.error(f"Loi khi lay danh sach admin bookings: {e}")
        return jsonify({"error": "Không thể tải danh sách đơn đặt phòng!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/bookings/<int:booking_id>/status', methods=['PUT'])
def update_booking_status(booking_id):
    conn = None
    cur = None
    try:
        data = request.get_json()
        status = data.get('status')
        if not status:
            return jsonify({"error": "Trạng thái không hợp lệ!"}), 400

        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE bookings SET status = %s WHERE id = %s;", (status, booking_id))
        conn.commit()
        return jsonify({"message": "Cập nhật trạng thái đơn đặt phòng thành công!"}), 200
    except Exception as e:
        logger.error(f"Loi khi cap nhat trang thai booking {booking_id}: {e}")
        return jsonify({"error": "Không thể cập nhật trạng thái đơn!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/hotels', methods=['POST'])
def admin_create_hotel():
    conn = None
    cur = None
    try:
        data = request.get_json()
        name = data.get('name')
        location = data.get('location')
        img = data.get('img', '../../assets/images/hotel_1.png')
        price = data.get('price', 0)
        rating = data.get('rating', 5.0)
        reviews_count = data.get('reviews_count', 0)
        description = data.get('description', '')
        hotel_type = data.get('type', 'hotel')

        if not name or not location:
            return jsonify({"error": "Vui lòng nhập đầy đủ Tên và Địa điểm!"}), 400

        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO hotels (name, location, img, price, rating, reviews_count, description, type)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;
        """, (name, location, img, price, rating, reviews_count, description, hotel_type))
        new_id = cur.fetchone()[0]
        conn.commit()
        return jsonify({"message": "Thêm khách sạn thành công!", "hotel_id": new_id}), 201
    except Exception as e:
        logger.error(f"Loi khi tao khach san: {e}")
        return jsonify({"error": "Không thể thêm khách sạn!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/hotels/<int:hotel_id>', methods=['PUT'])
def admin_update_hotel(hotel_id):
    conn = None
    cur = None
    try:
        data = request.get_json()
        name = data.get('name')
        location = data.get('location')
        img = data.get('img')
        price = data.get('price')
        rating = data.get('rating')
        description = data.get('description')
        hotel_type = data.get('type')

        conn = db.get_db_connection()
        cur = conn.cursor()
        
        update_fields = []
        params = []
        if name:
            update_fields.append("name = %s")
            params.append(name)
        if location:
            update_fields.append("location = %s")
            params.append(location)
        if img:
            update_fields.append("img = %s")
            params.append(img)
        if price is not None:
            update_fields.append("price = %s")
            params.append(price)
        if rating is not None:
            update_fields.append("rating = %s")
            params.append(rating)
        if description:
            update_fields.append("description = %s")
            params.append(description)
        if hotel_type:
            update_fields.append("type = %s")
            params.append(hotel_type)

        if not update_fields:
            return jsonify({"error": "Không có thông tin cần cập nhật!"}), 400

        params.append(hotel_id)
        query = f"UPDATE hotels SET {', '.join(update_fields)} WHERE id = %s;"
        cur.execute(query, tuple(params))
        conn.commit()
        return jsonify({"message": "Cập nhật khách sạn thành công!"}), 200
    except Exception as e:
        logger.error(f"Loi khi cap nhat khach san {hotel_id}: {e}")
        return jsonify({"error": "Không thể cập nhật thông tin khách sạn!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/hotels/<int:hotel_id>', methods=['DELETE'])
def admin_delete_hotel(hotel_id):
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM hotels WHERE id = %s;", (hotel_id,))
        conn.commit()
        return jsonify({"message": "Xóa khách sạn thành công!"}), 200
    except Exception as e:
        logger.error(f"Loi khi xoa khach san {hotel_id}: {e}")
        return jsonify({"error": "Không thể xóa khách sạn!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/users', methods=['GET'])
def get_admin_users():
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, name, email, is_admin, created_at FROM users ORDER BY created_at DESC;")
        rows = cur.fetchall()
        users = []
        for r in rows:
            users.append({
                "id": r[0],
                "name": r[1],
                "email": r[2],
                "isAdmin": r[3],
                "created_at": r[4].strftime('%d/%m/%Y %H:%M') if r[4] else None
            })
        return jsonify(users), 200
    except Exception as e:
        logger.error(f"Loi khi lay danh sach users: {e}")
        return jsonify({"error": "Không thể tải danh sách thành viên!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/users', methods=['POST'])
def add_admin_user():
    conn = None
    cur = None
    try:
        data = request.json
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        is_admin = data.get("isAdmin", False)
        if not name or not email or not password:
            return jsonify({"error": "Vui lòng điền đầy đủ thông tin!"}), 400
        password_hash = generate_password_hash(password)
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE email = %s;", (email,))
        if cur.fetchone():
            return jsonify({"error": "Email đã tồn tại trên hệ thống!"}), 400
        cur.execute(
            "INSERT INTO users (name, email, password_hash, is_admin) VALUES (%s, %s, %s, %s) RETURNING id, name, email, is_admin;",
            (name, email, password_hash, is_admin)
        )
        new_u = cur.fetchone()
        conn.commit()
        return jsonify({
            "id": new_u[0],
            "name": new_u[1],
            "email": new_u[2],
            "isAdmin": new_u[3]
        }), 201
    except Exception as e:
        logger.error(f"Loi khi them user: {e}")
        return jsonify({"error": "Không thể thêm người dùng!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
def update_admin_user(user_id):
    conn = None
    cur = None
    try:
        data = request.json
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        is_admin = data.get("isAdmin", False)
        if not name or not email:
            return jsonify({"error": "Vui lòng điền đầy đủ thông tin!"}), 400
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE email = %s AND id != %s;", (email, user_id))
        if cur.fetchone():
            return jsonify({"error": "Email đã được sử dụng bởi tài khoản khác!"}), 400
        if password:
            password_hash = generate_password_hash(password)
            cur.execute(
                "UPDATE users SET name = %s, email = %s, password_hash = %s, is_admin = %s WHERE id = %s;",
                (name, email, password_hash, is_admin, user_id)
            )
        else:
            cur.execute(
                "UPDATE users SET name = %s, email = %s, is_admin = %s WHERE id = %s;",
                (name, email, is_admin, user_id)
            )
        conn.commit()
        return jsonify({"message": "Cập nhật tài khoản thành công!"}), 200
    except Exception as e:
        logger.error(f"Loi khi cap nhat user {user_id}: {e}")
        return jsonify({"error": "Không thể cập nhật tài khoản!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def delete_admin_user(user_id):
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM users WHERE id = %s;", (user_id,))
        conn.commit()
        return jsonify({"message": "Xóa người dùng thành công!"}), 200
    except Exception as e:
        logger.error(f"Loi khi xoa user {user_id}: {e}")
        return jsonify({"error": "Không thể xóa người dùng!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/guides', methods=['POST'])
def add_admin_guide():
    conn = None
    cur = None
    try:
        data = request.json
        title = data.get("title")
        category = data.get("category")
        img = data.get("img")
        summary = data.get("summary")
        content = data.get("content")
        if not title or not category or not img or not summary or not content:
            return jsonify({"error": "Vui lòng điền đầy đủ thông tin bài đăng!"}), 400
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO guides (title, category, img, summary, content) VALUES (%s, %s, %s, %s, %s) RETURNING id, title, category, img, summary, content;",
            (title, category, img, summary, content)
        )
        new_g = cur.fetchone()
        conn.commit()
        return jsonify({
            "id": new_g[0],
            "title": new_g[1],
            "category": new_g[2],
            "img": new_g[3],
            "summary": new_g[4],
            "content": new_g[5]
        }), 201
    except Exception as e:
        logger.error(f"Loi khi them guide: {e}")
        return jsonify({"error": "Không thể thêm bài viết!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/guides/<int:guide_id>', methods=['PUT'])
def update_admin_guide(guide_id):
    conn = None
    cur = None
    try:
        data = request.json
        title = data.get("title")
        category = data.get("category")
        img = data.get("img")
        summary = data.get("summary")
        content = data.get("content")
        if not title or not category or not img or not summary or not content:
            return jsonify({"error": "Vui lòng điền đầy đủ thông tin bài đăng!"}), 400
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "UPDATE guides SET title = %s, category = %s, img = %s, summary = %s, content = %s WHERE id = %s;",
            (title, category, img, summary, content, guide_id)
        )
        conn.commit()
        return jsonify({"message": "Cập nhật bài viết thành công!"}), 200
    except Exception as e:
        logger.error(f"Loi khi cap nhat guide {guide_id}: {e}")
        return jsonify({"error": "Không thể cập nhật bài viết!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/guides/<int:guide_id>', methods=['DELETE'])
def delete_admin_guide(guide_id):
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM guides WHERE id = %s;", (guide_id,))
        conn.commit()
        return jsonify({"message": "Xóa bài viết thành công!"}), 200
    except Exception as e:
        logger.error(f"Loi khi xoa guide {guide_id}: {e}")
        return jsonify({"error": "Không thể xóa bài viết!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/coupons', methods=['POST'])
def add_admin_coupon():
    conn = None
    cur = None
    try:
        data = request.json
        code = data.get("code")
        discount_percent = data.get("discount_percent")
        min_spend = data.get("min_spend")
        description = data.get("description")
        if not code or discount_percent is None or min_spend is None:
            return jsonify({"error": "Vui lòng điền đầy đủ thông tin!"}), 400
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT code FROM coupons WHERE code = %s;", (code,))
        if cur.fetchone():
            return jsonify({"error": "Mã ưu đãi đã tồn tại!"}), 400
        cur.execute(
            "INSERT INTO coupons (code, discount_percent, min_spend, description) VALUES (%s, %s, %s, %s) RETURNING code, discount_percent, min_spend, description;",
            (code, int(discount_percent), int(min_spend), description)
        )
        new_c = cur.fetchone()
        conn.commit()
        return jsonify({
            "code": new_c[0],
            "discount_percent": new_c[1],
            "min_spend": new_c[2],
            "description": new_c[3]
        }), 201
    except Exception as e:
        logger.error(f"Loi khi them coupon: {e}")
        return jsonify({"error": "Không thể thêm mã ưu đãi!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/coupons/<string:code>', methods=['PUT'])
def update_admin_coupon(code):
    conn = None
    cur = None
    try:
        data = request.json
        discount_percent = data.get("discount_percent")
        min_spend = data.get("min_spend")
        description = data.get("description")
        if discount_percent is None or min_spend is None:
            return jsonify({"error": "Vui lòng điền đầy đủ thông tin!"}), 400
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "UPDATE coupons SET discount_percent = %s, min_spend = %s, description = %s WHERE code = %s;",
            (int(discount_percent), int(min_spend), description, code)
        )
        conn.commit()
        return jsonify({"message": "Cập nhật mã ưu đãi thành công!"}), 200
    except Exception as e:
        logger.error(f"Loi khi cap nhat coupon {code}: {e}")
        return jsonify({"error": "Không thể cập nhật mã ưu đãi!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/coupons/<string:code>', methods=['DELETE'])
def delete_admin_coupon(code):
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM coupons WHERE code = %s;", (code,))
        conn.commit()
        return jsonify({"message": "Xóa mã ưu đãi thành công!"}), 200
    except Exception as e:
        logger.error(f"Loi khi xoa coupon {code}: {e}")
        return jsonify({"error": "Không thể xóa mã ưu đãi!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/reviews', methods=['GET'])
def get_admin_reviews():
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT r.id, r.hotel_id, h.name as hotel_name, r.user_email, r.user_name, r.rating, r.content, r.created_at
            FROM reviews r
            LEFT JOIN hotels h ON r.hotel_id = h.id
            ORDER BY r.created_at DESC;
        """)
        rows = cur.fetchall()
        reviews = []
        for r in rows:
            reviews.append({
                "id": r[0],
                "hotel_id": r[1],
                "hotel_name": r[2] or "Khách sạn đã xóa",
                "user_email": r[3],
                "user_name": r[4],
                "rating": float(r[5]) if r[5] else 0.0,
                "content": r[6],
                "created_at": r[7].strftime('%d/%m/%Y %H:%M') if r[7] else None
            })
        return jsonify(reviews), 200
    except Exception as e:
        logger.error(f"Loi khi lay danh sach reviews: {e}")
        return jsonify({"error": "Không thể tải danh sách đánh giá!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/reviews/<int:review_id>', methods=['DELETE'])
def delete_admin_review(review_id):
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT hotel_id FROM reviews WHERE id = %s;", (review_id,))
        row = cur.fetchone()
        hotel_id = row[0] if row else None
        
        cur.execute("DELETE FROM reviews WHERE id = %s;", (review_id,))
        
        if hotel_id:
            cur.execute("""
                SELECT COALESCE(AVG(rating), 0.0), COUNT(id)
                FROM reviews
                WHERE hotel_id = %s;
            """, (hotel_id,))
            avg_row = cur.fetchone()
            avg_rating = round(float(avg_row[0]), 1) if avg_row else 0.0
            rev_count = avg_row[1] if avg_row else 0
            
            cur.execute("""
                UPDATE hotels
                SET rating = %s, reviews_count = %s
                WHERE id = %s;
            """, (avg_rating, rev_count, hotel_id))
            
        conn.commit()
        return jsonify({"message": "Xóa đánh giá thành công và cập nhật điểm trung bình khách sạn!"}), 200
    except Exception as e:
        logger.error(f"Loi khi xoa review {review_id}: {e}")
        return jsonify({"error": "Không thể xóa đánh giá!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/revenue-chart', methods=['GET'])
def get_revenue_chart():
    import datetime
    conn = None
    cur = None
    try:
        
        today = datetime.date.today()
        months_list = []
        for i in range(5, -1, -1):
            year = today.year
            month = today.month - i
            if month <= 0:
                month += 12
                year -= 1
            months_list.append({
                "year": year,
                "month": month,
                "label": f"T{month}",
                "revenue": 0
            })
            
        start_date = datetime.date(months_list[0]["year"], months_list[0]["month"], 1)
        
        conn = db.get_db_connection()
        cur = conn.cursor()
        
        
        cur.execute("""
            SELECT 
                EXTRACT(YEAR FROM created_at)::int as yr,
                EXTRACT(MONTH FROM created_at)::int as mth,
                COALESCE(SUM(total_price), 0) as rev
            FROM bookings
            WHERE status != 'Đã hủy' AND created_at >= %s
            GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at);
        """, (start_date,))
        rows = cur.fetchall()
        
        
        for r in rows:
            yr, mth, rev = r
            for m in months_list:
                if m["year"] == yr and m["month"] == mth:
                    m["revenue"] = rev
                    break
                    
        
        max_revenue = max(m["revenue"] for m in months_list)
        for m in months_list:
            if max_revenue > 0:
                m["height_percent"] = int((m["revenue"] / max_revenue) * 100)
            else:
                m["height_percent"] = 0
                
        return jsonify(months_list), 200
    except Exception as e:
        logger.error(f"Loi khi lay du lieu bieu do doanh thu: {e}")
        return jsonify({"error": "Không thể tải biểu đồ doanh thu!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/popular-hotels', methods=['GET'])
def get_admin_popular_hotels():
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT h.id, h.name, h.price, h.img, COUNT(b.id) as booking_count
            FROM hotels h
            LEFT JOIN bookings b ON h.id = b.hotel_id
            GROUP BY h.id, h.name, h.price, h.img
            ORDER BY booking_count DESC, h.id ASC
            LIMIT 3;
        """)
        rows = cur.fetchall()
        hotels = []
        for r in rows:
            hotels.append({
                "id": r[0],
                "name": r[1],
                "price": r[2],
                "img": r[3],
                "booking_count": r[4]
            })
        return jsonify(hotels), 200
    except Exception as e:
        logger.error(f"Loi khi lay danh sach khach san thinh hanh: {e}")
        return jsonify({"error": "Không thể tải danh sách khách sạn thịnh hành!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/hotels/<int:hotel_id>/rooms', methods=['GET'])
def admin_get_hotel_rooms(hotel_id):
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT room_name, check_in, check_out, user_email, id
            FROM bookings
            WHERE hotel_id = %s AND status != 'Đã hủy';
        """, (hotel_id,))
        booking_rows = cur.fetchall()
        
        bookings_by_room = {}
        for br in booking_rows:
            r_name = br[0]
            if r_name not in bookings_by_room:
                bookings_by_room[r_name] = []
            bookings_by_room[r_name].append({
                "check_in": br[1].strftime('%Y-%m-%d') if br[1] else None,
                "check_out": br[2].strftime('%Y-%m-%d') if br[2] else None,
                "user_email": br[3],
                "booking_id": br[4]
            })

        cur.execute("""
            SELECT id, name, price, capacity, bed_type, img, amenities 
            FROM rooms 
            WHERE hotel_id = %s 
            ORDER BY id;
        """, (hotel_id,))
        rows = cur.fetchall()
        
        import datetime
        today_str = datetime.date.today().strftime('%Y-%m-%d')
        
        rooms = []
        for r in rows:
            r_name = r[1]
            r_bookings = bookings_by_room.get(r_name, [])
            
            is_today_busy = False
            today_user = None
            for b_item in r_bookings:
                if b_item["check_in"] and b_item["check_out"]:
                    if b_item["check_in"] <= today_str < b_item["check_out"]:
                        is_today_busy = True
                        today_user = b_item["user_email"]
                        break
            
            rooms.append({
                "id": r[0],
                "name": r[1],
                "price": r[2],
                "capacity": r[3],
                "bed_type": r[4],
                "img": r[5],
                "amenities": r[6],
                "is_today_busy": is_today_busy,
                "today_user": today_user,
                "booked_dates": r_bookings
            })
        return jsonify(rooms), 200
    except Exception as e:
        logger.error(f"Loi khi lay danh sach phong cua khach san {hotel_id}: {e}")
        return jsonify({"error": "Không thể tải danh sách phòng!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/hotels/<int:hotel_id>/rooms', methods=['POST'])
def admin_create_room(hotel_id):
    conn = None
    cur = None
    try:
        data = request.get_json()
        name = data.get('name')
        price = data.get('price')
        capacity = data.get('capacity')
        bed_type = data.get('bed_type', '')
        img = data.get('img', '')
        amenities = data.get('amenities', [])

        if not name or price is None or capacity is None:
            return jsonify({"error": "Vui lòng nhập đầy đủ Tên phòng, Giá và Sức chứa!"}), 400

        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO rooms (hotel_id, name, price, capacity, bed_type, img, amenities)
            VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id;
        """, (hotel_id, name, price, capacity, bed_type, img, amenities))
        room_id = cur.fetchone()[0]
        conn.commit()
        return jsonify({"message": "Thêm phòng thành công!", "room_id": room_id}), 201
    except Exception as e:
        logger.error(f"Loi khi them phong moi: {e}")
        return jsonify({"error": "Không thể thêm phòng mới!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/rooms/<int:room_id>', methods=['PUT'])
def admin_update_room(room_id):
    conn = None
    cur = None
    try:
        data = request.get_json()
        name = data.get('name')
        price = data.get('price')
        capacity = data.get('capacity')
        bed_type = data.get('bed_type')
        img = data.get('img')
        amenities = data.get('amenities')

        conn = db.get_db_connection()
        cur = conn.cursor()

        update_fields = []
        params = []
        if name:
            update_fields.append("name = %s")
            params.append(name)
        if price is not None:
            update_fields.append("price = %s")
            params.append(price)
        if capacity is not None:
            update_fields.append("capacity = %s")
            params.append(capacity)
        if bed_type is not None:
            update_fields.append("bed_type = %s")
            params.append(bed_type)
        if img is not None:
            update_fields.append("img = %s")
            params.append(img)
        if amenities is not None:
            update_fields.append("amenities = %s")
            params.append(amenities)

        if not update_fields:
            return jsonify({"error": "Không có thông tin cần cập nhật!"}), 400

        params.append(room_id)
        query = f"UPDATE rooms SET {', '.join(update_fields)} WHERE id = %s;"
        cur.execute(query, tuple(params))
        conn.commit()
        return jsonify({"message": "Cập nhật phòng thành công!"}), 200
    except Exception as e:
        logger.error(f"Loi khi cap nhat phong {room_id}: {e}")
        return jsonify({"error": "Không thể cập nhật thông tin phòng!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/admin/rooms/<int:room_id>', methods=['DELETE'])
def admin_delete_room(room_id):
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM rooms WHERE id = %s;", (room_id,))
        conn.commit()
        return jsonify({"message": "Xóa phòng thành công!"}), 200
    except Exception as e:
        logger.error(f"Loi khi xoa phong {room_id}: {e}")
        return jsonify({"error": "Không thể xóa phòng!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/hotels/<int:hotel_id>/reviews', methods=['GET'])
def get_hotel_reviews(hotel_id):
    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, user_name, user_email, rating, content, created_at 
            FROM reviews 
            WHERE hotel_id = %s 
            ORDER BY created_at DESC;
        """, (hotel_id,))
        rows = cur.fetchall()
        reviews = []
        for r in rows:
            reviews.append({
                "id": r[0],
                "user_name": r[1],
                "user_email": r[2],
                "rating": float(r[3]),
                "content": r[4],
                "created_at": r[5].strftime('%d/%m/%Y') if r[5] else None
            })
        return jsonify(reviews), 200
    except Exception as e:
        logger.error(f"Loi khi lay danh sach danh gia cua khach san {hotel_id}: {e}")
        return jsonify({"error": "Không thể tải danh sách đánh giá!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

@app.route('/api/hotels/<int:hotel_id>/reviews', methods=['POST'])
def create_hotel_review(hotel_id):
    conn = None
    cur = None
    try:
        data = request.get_json()
        user_name = data.get('user_name', '').strip()
        user_email = data.get('user_email', '').strip().lower()
        rating = data.get('rating')
        content = data.get('content', '').strip()

        if not user_name or not user_email or rating is None or not content:
            return jsonify({"error": "Vui lòng điền đầy đủ Tên, Email, số sao đánh giá và nội dung nhận xét!"}), 400

        try:
            rating = float(rating)
            if rating < 1.0 or rating > 5.0:
                raise ValueError()
        except ValueError:
            return jsonify({"error": "Số sao đánh giá phải từ 1.0 đến 5.0!"}), 400

        conn = db.get_db_connection()
        cur = conn.cursor()
        
        
        cur.execute("""
            INSERT INTO reviews (hotel_id, user_name, user_email, rating, content)
            VALUES (%s, %s, %s, %s, %s);
        """, (hotel_id, user_name, user_email, rating, content))

        
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

        conn.commit()
        return jsonify({
            "message": "Cảm ơn bạn đã gửi đánh giá!",
            "rating": avg_rating,
            "reviews_count": count
        }), 201
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Loi khi gui danh gia moi cho khach san {hotel_id}: {e}")
        return jsonify({"error": "Không thể gửi đánh giá lúc này!"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            db.release_db_connection(conn)

if __name__ == '__main__':
    
    app.run(host='127.0.0.1', port=5600, debug=True)

# Edit: Document backend CORS and static file serving