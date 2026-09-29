import os
import oracledb
import random
import re
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

# --- ENVIRONMENT CONFIGURATION (.env) ---
# Automatically load from .env in current directory or backend/.env
env_file = Path(__file__).parent / ".env"
backend_env_file = Path(__file__).parent / "backend" / ".env"
if backend_env_file.exists():
    load_dotenv(dotenv_path=backend_env_file)
if env_file.exists():
    load_dotenv(dotenv_path=env_file)
load_dotenv() # Fallback for system env

# Fetch LOBs as strings automatically in thin mode
oracledb.defaults.fetch_lobs = False

app = Flask(__name__)
CORS(app) # Allows React to talk to Flask

# --- ORACLE DB CONNECTION SETUP (from .env) ---
DB_USER = os.getenv("DB_USER", "system")
DB_PASSWORD = os.getenv("DB_PASSWORD", "ahmed")
DB_DSN = os.getenv("DB_DSN", "localhost:1521/XE")

def get_db_connection():
    return oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=DB_DSN)

def seed_initial_data():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                # 1. Seed Admin
                cursor.execute("SELECT count(*) FROM tmms_users WHERE role = 'admin'")
                if cursor.fetchone()[0] == 0:
                    admin_pw = generate_password_hash("admin123")
                    cursor.execute(
                        """INSERT INTO tmms_users (full_name, phone, email, password_hash, role) 
                           VALUES (:1, :2, :3, :4, :5)""",
                        ["TMMS Admin", "03001234567", "admin@tmms.pk", admin_pw, "admin"]
                    )
                    conn.commit()
                    print("Seeded default admin account: admin@tmms.pk / admin123")

                # 2. Seed Tankers Fleet if empty
                cursor.execute("SELECT count(*) FROM tmms_tankers")
                if cursor.fetchone()[0] == 0:
                    tankers_data = [
                        ("TMK-1138", "Asad Khan", 1000, "Gulshan-e-Iqbal", "busy", 412),
                        ("TMK-0942", "Imran Baloch", 2000, "DHA", "available", 528),
                        ("TMK-2207", "Saleem Memon", 500, "North Nazimabad", "available", 198),
                        ("TMK-1810", "Rashid Ali", 1000, "Korangi", "busy", 376),
                        ("TMK-0455", "Yousuf Shah", 2000, "Malir", "offline", 612),
                        ("TMK-3301", "Bilal Ahmed", 2000, "Saddar", "available", 240),
                        ("TMK-2014", "Faisal Qureshi", 1000, "Lyari", "busy", 305),
                        ("TMK-1602", "Naveed Hussain", 500, "Orangi", "available", 158),
                    ]
                    cursor.executemany(
                        """INSERT INTO tmms_tankers (id, driver_name, capacity, region, status, trips) 
                           VALUES (:1, :2, :3, :4, :5, :6)""",
                        tankers_data
                    )
                    conn.commit()
                    print("Seeded initial tankers in TMMS_TANKERS")
    except Exception as e:
        print("Note on initial seed:", e)

# Run seed check at startup
seed_initial_data()

# --- 1. AUTHENTICATION ENDPOINTS ---

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json or {}
    
    full_name = (data.get('fullName') or '').strip()
    phone = (data.get('phone') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    
    # Input validation
    if not full_name or len(full_name) < 2:
        return jsonify({"error": "Full name must be at least 2 characters.", "ok": False}), 400

    if not phone or len(phone) < 7:
        return jsonify({"error": "Please enter a valid phone number.", "ok": False}), 400

    email_regex = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    if not email or not re.match(email_regex, email):
        return jsonify({"error": "Please enter a valid email address.", "ok": False}), 400

    if not password or len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long.", "ok": False}), 400

    # Registration is strictly for customers only
    role = "customer"
    hashed_pw = generate_password_hash(password)
    
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                # 1. Uniqueness check for email
                cursor.execute("SELECT id FROM tmms_users WHERE LOWER(email) = :1", [email])
                if cursor.fetchone():
                    return jsonify({
                        "error": "This email is already registered. Please sign in or use another email.",
                        "ok": False
                    }), 400

                # 2. Insert new customer
                sql = """INSERT INTO tmms_users (full_name, phone, email, password_hash, role) 
                         VALUES (:1, :2, :3, :4, :5)"""
                cursor.execute(sql, [full_name, phone, email, hashed_pw, role])
                conn.commit()
        return jsonify({"message": "User registered successfully", "ok": True}), 201
    except oracledb.IntegrityError:
        return jsonify({"error": "This email is already registered. Please sign in or use another email.", "ok": False}), 400
    except oracledb.DatabaseError as e:
        err_msg = str(e)
        if "ORA-00001" in err_msg:
            return jsonify({"error": "This email is already registered. Please sign in or use another email.", "ok": False}), 400
        return jsonify({"error": f"Database error: {err_msg}", "ok": False}), 500

@app.route('/api/signin', methods=['POST'])
def signin():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({"error": "Email and password are required.", "ok": False}), 400

    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, full_name, phone, email, password_hash, role FROM tmms_users WHERE LOWER(email) = :1", [email])
            row = cursor.fetchone()
            
    if row and check_password_hash(row[4], password):
        user = {"id": row[0], "fullName": row[1], "phone": row[2], "email": row[3], "role": row[5]}
        return jsonify({"user": user, "ok": True}), 200
    return jsonify({"error": "Invalid email or password.", "ok": False}), 401


@app.route('/api/bookings', methods=['GET', 'POST'])
def handle_bookings():
    if request.method == 'POST':
        data = request.json or {}
        order_id = f"ORD-{random.randint(40000, 99999)}" 
        
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                sql = """INSERT INTO tmms_bookings 
                         (id, user_email, customer_name, area, tanker_size, price, address, eta) 
                         VALUES (:1, :2, :3, :4, :5, :6, :7, :8)"""
                cursor.execute(sql, [
                    order_id, data.get('userEmail'), data.get('customer'), data.get('area'), 
                    data.get('size'), data.get('price'), data.get('address'), data.get('eta')
                ])
                conn.commit()
        return jsonify({"message": "Booking created", "id": order_id, "ok": True}), 201

    # GET Request: Fetch bookings (If email provided, fetch only for that user)
    user_email = request.args.get('email')
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            if user_email:
                cursor.execute("SELECT * FROM tmms_bookings WHERE LOWER(user_email) = :1 ORDER BY created_at DESC", [user_email.strip().lower()])
            else:
                cursor.execute("SELECT * FROM tmms_bookings ORDER BY created_at DESC")
            
            columns = [col[0].lower() for col in cursor.description]
            bookings = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
    return jsonify(bookings), 200


@app.route('/api/complaints', methods=['GET', 'POST'])
def handle_complaints():
    if request.method == 'POST':
        data = request.json or {}
        order_id = data.get('orderId') or data.get('booking_id') or 'GENERAL'
        user_email = (data.get('userEmail') or '').strip().lower()
        complaint_type = data.get('type') or data.get('complaint_type') or 'General'
        description = data.get('description') or ''

        if not user_email:
            return jsonify({"error": "User email is required", "ok": False}), 400
        if not description.strip():
            return jsonify({"error": "Complaint description is required", "ok": False}), 400

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                sql = """INSERT INTO tmms_complaints (booking_id, user_email, complaint_type, description, status) 
                         VALUES (:1, :2, :3, :4, 'pending')"""
                cursor.execute(sql, [order_id, user_email, complaint_type, description])
                conn.commit()
        return jsonify({"message": "Complaint lodged successfully", "ok": True}), 201
        
    user_email = request.args.get('email')
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            if user_email:
                cursor.execute("SELECT * FROM tmms_complaints WHERE LOWER(user_email) = :1 ORDER BY created_at DESC", [user_email.strip().lower()])
            else:
                cursor.execute("SELECT * FROM tmms_complaints ORDER BY created_at DESC")
            columns = [col[0].lower() for col in cursor.description]
            complaints = [dict(zip(columns, row)) for row in cursor.fetchall()]
    return jsonify(complaints), 200

# --- TANKERS FLEET ENDPOINTS ---
@app.route('/api/tankers', methods=['GET', 'POST'])
def handle_tankers():
    if request.method == 'POST':
        data = request.json or {}
        tanker_id = data.get('id') or f"TMK-{random.randint(1000, 9999)}"
        driver = (data.get('driver') or data.get('driver_name') or 'Assigned Driver').strip()
        cap_raw = str(data.get('capacity', 1000)).replace('L', '').replace(',', '').strip()
        parsed_cap = int(cap_raw) if cap_raw.isdigit() else 1000
        capacity = parsed_cap if parsed_cap in (500, 1000, 2000) else (500 if parsed_cap <= 750 else (1000 if parsed_cap <= 1500 else 2000))
        region = (data.get('region') or 'Karachi').strip()
        status = data.get('status') if data.get('status') in ('available', 'busy', 'offline') else 'available'
        trips = int(data.get('trips', 0))

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                sql = """INSERT INTO tmms_tankers (id, driver_name, capacity, region, status, trips) 
                         VALUES (:1, :2, :3, :4, :5, :6)"""
                cursor.execute(sql, [tanker_id, driver, capacity, region, status, trips])
                conn.commit()
        return jsonify({"message": "Tanker registered successfully", "id": tanker_id, "ok": True}), 201

    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, driver_name, capacity, region, status, trips FROM tmms_tankers ORDER BY id ASC")
            tankers = []
            for row in cursor.fetchall():
                tankers.append({
                    "id": row[0],
                    "driver": row[1],
                    "capacity": f"{row[2]:,} L" if row[2] else "5,000 L",
                    "capacityNum": row[2] or 5000,
                    "region": row[3],
                    "status": row[4] or "available",
                    "trips": row[5] or 0
                })
    return jsonify(tankers), 200

# --- DELIVERIES ENDPOINTS ---
@app.route('/api/deliveries', methods=['GET'])
def handle_deliveries():
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, customer_name, area, address, tanker_size, eta, status, created_at FROM tmms_bookings ORDER BY created_at DESC")
            bookings = cursor.fetchall()
            cursor.execute("SELECT id, driver_name FROM tmms_tankers ORDER BY id ASC")
            tankers_pool = cursor.fetchall()

    hydrants_map = {
        "Gulshan-e-Iqbal": "Safoora",
        "Clifton": "Sakhi Hassan",
        "DHA": "Sakhi Hassan",
        "North Nazimabad": "Manghopir",
        "Nazimabad": "Manghopir",
        "Korangi": "Pipri",
        "Malir": "Pipri",
        "Saddar": "NIPA",
        "PECHS": "NIPA",
        "Lyari": "Manghopir",
        "Orangi": "Manghopir",
    }

    deliveries = []
    total_volume = 0
    completed_count = 0

    for idx, b in enumerate(bookings):
        order_id, cust, area, addr, size, eta, status, created_at = b
        size_val = size or 5000
        if status == 'delivered':
            total_volume += size_val
            completed_count += 1

        tanker_pair = tankers_pool[idx % len(tankers_pool)] if tankers_pool else ("TMK-1138", "Fleet Driver")
        created_str = created_at.strftime("%H:%M") if created_at else "08:30"
        hydrant_station = hydrants_map.get(area, "Safoora")

        deliveries.append({
            "id": f"DLV-{order_id.replace('ORD-', '')}",
            "orderId": order_id,
            "tanker": tanker_pair[0],
            "driver": tanker_pair[1],
            "hydrant": hydrant_station,
            "destination": f"{area} - {addr[:22] + '…' if addr and len(addr) > 22 else (addr or 'Karachi')}",
            "volume": f"{size_val:,} L",
            "departed": created_str,
            "arrived": (created_at.strftime("%H:%M") if status == 'delivered' else "—") if created_at else "—",
            "status": "delivered" if status == 'delivered' else ("in_transit" if status == 'in_transit' else "pending"),
            "eta": eta or "2–3 hours"
        })

    # Supplementary operational deliveries if database has few
    if len(deliveries) < 6:
        defaults = [
            { "id": "DLV-7821", "orderId": "ORD-49021", "tanker": "TMK-1138", "driver": "Asad Khan", "hydrant": "Safoora", "destination": "Gulshan Block 5", "volume": "5,000 L", "departed": "08:42", "arrived": "—", "status": "in_transit", "eta": "45 min" },
            { "id": "DLV-7820", "orderId": "ORD-49020", "tanker": "TMK-0942", "driver": "Imran Baloch", "hydrant": "Sakhi Hassan", "destination": "DHA Phase 6", "volume": "8,000 L", "departed": "07:55", "arrived": "08:38", "status": "delivered", "eta": "Delivered" },
            { "id": "DLV-7819", "orderId": "ORD-49019", "tanker": "TMK-1810", "driver": "Rashid Ali", "hydrant": "Manghopir", "destination": "Korangi 2½", "volume": "5,000 L", "departed": "07:10", "arrived": "07:58", "status": "delivered", "eta": "Delivered" },
            { "id": "DLV-7818", "orderId": "ORD-49018", "tanker": "TMK-3301", "driver": "Bilal Ahmed", "hydrant": "NIPA", "destination": "Saddar Saddar", "volume": "5,000 L", "departed": "—", "arrived": "—", "status": "pending", "eta": "2 hours" },
            { "id": "DLV-7817", "orderId": "ORD-49017", "tanker": "TMK-2014", "driver": "Faisal Qureshi", "hydrant": "Pipri", "destination": "Lyari Chakiwara", "volume": "3,000 L", "departed": "06:24", "arrived": "07:12", "status": "delivered", "eta": "Delivered" },
            { "id": "DLV-7816", "orderId": "ORD-49016", "tanker": "TMK-1602", "driver": "Naveed Hussain", "hydrant": "Manghopir", "destination": "Orangi Sec 11", "volume": "8,000 L", "departed": "06:00", "arrived": "07:05", "status": "delivered", "eta": "Delivered" },
        ]
        deliveries.extend(defaults[len(deliveries):])

    stats = {
        "totalVolume": f"{max(total_volume, 184000):,} L",
        "avgTime": "47 min",
        "activeHydrants": "14 / 16",
        "completed": max(completed_count, 128)
    }

    return jsonify({"deliveries": deliveries, "stats": stats}), 200

# --- ADMIN PAYMENTS ENDPOINTS ---
@app.route('/api/payments', methods=['GET'])
def handle_payments():
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, user_email, customer_name, area, tanker_size, price, status, created_at FROM tmms_bookings ORDER BY created_at DESC")
            rows = cursor.fetchall()

    total_revenue = 0
    today_revenue = 0
    receipts_count = 0
    outstanding = 0
    transactions = []

    for r in rows:
        order_id, email, cust, area, size, price, status, created_at = r
        amount_num = price or 4200
        date_str = created_at.strftime("%Y-%m-%d") if created_at else "2026-09-29"

        if status == 'delivered':
            total_revenue += amount_num
            today_revenue += amount_num
            receipts_count += 1
            pay_status = "paid"
            method = "Cash on Delivery"
        elif status == 'cancelled':
            pay_status = "unpaid"
            method = "—"
        else:
            outstanding += amount_num
            pay_status = "unpaid"
            method = "Due on Arrival"

        transactions.append({
            "id": f"PAY-{order_id.replace('ORD-', '')}",
            "order": order_id,
            "customer": cust or "Citizen",
            "date": date_str,
            "method": method,
            "status": pay_status,
            "amount": f"₨ {amount_num:,}"
        })

    # Supplementary mock transactions if DB has few
    if len(transactions) < 6:
        defaults = [
            { "id": "PAY-9013", "order": "ORD-49020", "customer": "Hamza Tariq", "date": "2026-09-29", "method": "Easypaisa", "status": "paid", "amount": "₨ 6,800" },
            { "id": "PAY-9012", "order": "ORD-49018", "customer": "Bilal Ahmed", "date": "2026-09-28", "method": "JazzCash", "status": "paid", "amount": "₨ 4,200" },
            { "id": "PAY-9011", "order": "ORD-49016", "customer": "Mehwish Khan", "date": "2026-09-28", "method": "Cash", "status": "paid", "amount": "₨ 4,200" },
            { "id": "PAY-9010", "order": "ORD-49019", "customer": "Sana Iqbal", "date": "2026-09-27", "method": "—", "status": "unpaid", "amount": "₨ 2,500" },
            { "id": "PAY-9009", "order": "ORD-49014", "customer": "Zainab Raza", "date": "2026-09-26", "method": "—", "status": "unpaid", "amount": "₨ 6,800" },
            { "id": "PAY-9008", "order": "ORD-49011", "customer": "Tariq Mehmood", "date": "2026-09-25", "method": "—", "status": "overdue", "amount": "₨ 8,500" },
        ]
        transactions.extend(defaults[len(transactions):])

    weekly = [
        { "d": "Mon", "v": 38 }, { "d": "Tue", "v": 52 }, { "d": "Wed", "v": 47 },
        { "d": "Thu", "v": 61 }, { "d": "Fri", "v": 78 }, { "d": "Sat", "v": 85 },
        { "d": "Sun", "v": max(71, int(total_revenue / 10000) or 71) }
    ]

    return jsonify({
        "revenueMonth": f"₨ 24.6 M",
        "revenueToday": f"₨ {max(712, round(today_revenue/1000, 1))} K",
        "receiptsIssued": max(1248, receipts_count),
        "outstanding": f"₨ {max(184, round(outstanding/1000, 1))} K",
        "weekly": weekly,
        "payments": transactions
    }), 200

# --- DASHBOARD STATS ENDPOINT ---
@app.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT count(*) FROM tmms_bookings")
            total_orders = cursor.fetchone()[0]

            cursor.execute("SELECT count(*) FROM tmms_tankers WHERE status != 'offline'")
            active_tankers = cursor.fetchone()[0]

            cursor.execute("SELECT NVL(SUM(tanker_size), 0) FROM tmms_bookings WHERE status = 'delivered'")
            water_delivered_liters = cursor.fetchone()[0]

            cursor.execute("SELECT count(*) FROM tmms_users")
            total_users = cursor.fetchone()[0]

            cursor.execute("SELECT id, customer_name, area, tanker_size, status, created_at FROM tmms_bookings ORDER BY created_at DESC FETCH FIRST 5 ROWS ONLY")
            recent_raw = cursor.fetchall()

            cursor.execute("SELECT status, count(*) FROM tmms_tankers GROUP BY status")
            tanker_dist_raw = dict(cursor.fetchall())

            cursor.execute("SELECT area, count(*) FROM tmms_bookings GROUP BY area ORDER BY count(*) DESC FETCH FIRST 6 ROWS ONLY")
            hydrant_dist_raw = cursor.fetchall()

    recent_orders = []
    for r in recent_raw:
        recent_orders.append({
            "id": r[0],
            "customer": r[1] or "Citizen",
            "area": r[2] or "Karachi",
            "capacity": f"{r[3] or 5000:,} L",
            "tanker": f"TMK-{random.randint(1000, 9999)}",
            "status": r[4] or "pending",
            "time": r[5].strftime("%H:%M") if r[5] else "Recent"
        })

    # Supplementary default recent if empty
    if len(recent_orders) < 5:
        defaults = [
            { "id": "ORD-49021", "customer": "Ayesha Siddiqui", "area": "Gulshan-e-Iqbal", "capacity": "5,000 L", "tanker": "TMK-1138", "status": "in_transit", "time": "12 min ago" },
            { "id": "ORD-49020", "customer": "Hamza Tariq", "area": "DHA Phase 6", "capacity": "8,000 L", "tanker": "TMK-0942", "status": "delivered", "time": "28 min ago" },
            { "id": "ORD-49019", "customer": "Sana Iqbal", "area": "North Nazimabad", "capacity": "3,000 L", "tanker": "TMK-2207", "status": "pending", "time": "41 min ago" },
            { "id": "ORD-49018", "customer": "Kashif Mir", "area": "Korangi", "capacity": "5,000 L", "tanker": "TMK-1810", "status": "delivered", "time": "1 hr ago" },
            { "id": "ORD-49017", "customer": "Tariq Mehmood", "area": "Malir", "capacity": "10,000 L", "tanker": "TMK-0455", "status": "cancelled", "time": "1 hr ago" },
        ]
        recent_orders.extend(defaults[len(recent_orders):])

    tanker_status_list = [
        {"name": "Available", "value": max(tanker_dist_raw.get("available", 0), 612), "color": "var(--success)"},
        {"name": "Busy", "value": max(tanker_dist_raw.get("busy", 0), 384), "color": "var(--accent)"},
        {"name": "Offline", "value": max(tanker_dist_raw.get("offline", 0), 88), "color": "var(--muted-foreground)"},
    ]

    hydrants_data = [
        {"name": h[0], "uses": h[1]} for h in hydrant_dist_raw
    ] if hydrant_dist_raw else [
        {"name": "Safoora", "uses": 312},
        {"name": "Sakhi Hassan", "uses": 286},
        {"name": "Manghopir", "uses": 254},
        {"name": "Pipri", "uses": 198},
        {"name": "NIPA", "uses": 176},
        {"name": "Korangi", "uses": 142},
    ]

    monthly = [
        { "m": "Jan", "orders": 3200, "water": 1.8 },
        { "m": "Feb", "orders": 3850, "water": 2.1 },
        { "m": "Mar", "orders": 4200, "water": 2.4 },
        { "m": "Apr", "orders": 5100, "water": 2.9 },
        { "m": "May", "orders": 6200, "water": 3.6 },
        { "m": "Jun", "orders": 7400, "water": 4.4 },
        { "m": "Jul", "orders": 7900, "water": 4.8 },
        { "m": "Aug", "orders": 7100, "water": 4.2 },
        { "m": "Sep", "orders": max(6300, total_orders), "water": max(3.7, round(water_delivered_liters/1000000, 1)) },
    ]

    return jsonify({
        "stats": {
            "totalOrders": f"{max(total_orders, 48210):,}",
            "activeTankers": f"{max(active_tankers, 1084):,}",
            "waterDelivered": f"{max(round(water_delivered_liters/1000000, 1), 186)} ML",
            "totalUsers": f"{max(total_users, 32540):,}"
        },
        "recent": recent_orders,
        "tankerStatus": tanker_status_list,
        "hydrants": hydrants_data,
        "monthly": monthly
    }), 200

if __name__ == '__main__':
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")
    app.run(debug=debug, port=port)