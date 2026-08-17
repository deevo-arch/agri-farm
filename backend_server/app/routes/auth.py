"""
Auth Routes — Flask blueprint for Supabase authentication.
All auth is handled server-side via service_role key.
"""
from flask import Blueprint, request, jsonify
from app.services.supabase_auth import SupabaseAuthService
from app.utils.responses import success_response, error_response

auth_bp = Blueprint('auth', __name__)


# ============================================================
# POST /api/auth/register
# ============================================================
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}

    email = data.get("email", "").strip()
    password = data.get("password", "")
    full_name = data.get("fullName", "").strip()
    role = data.get("role", "consumer").strip().lower()

    if not email or not password or not full_name:
        return error_response("Email, password, and full name are required", 400)

    if len(password) < 6:
        return error_response("Password must be at least 6 characters", 400)

    user_data, err = SupabaseAuthService.signup(email, password, full_name, role)

    if err:
        return error_response(err, 409 if "already exists" in err else 400)

    return success_response({
        "message": "Account created successfully",
        "user": user_data
    }, 201)


# ============================================================
# POST /api/auth/login
# ============================================================
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}

    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return error_response("Email and password are required", 400)

    session_data, err = SupabaseAuthService.login(email, password)

    if err:
        return error_response(err, 401)

    return success_response(session_data, 200)


# ============================================================
# GET /api/auth/me  (Bearer token required)
# ============================================================
@auth_bp.route('/me', methods=['GET'])
def get_me():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return error_response("Authorization header required", 401)

    token = auth_header.replace("Bearer ", "").strip()
    user_data, err = SupabaseAuthService.get_user_by_token(token)

    if err:
        return error_response(err, 401)

    return success_response(user_data, 200)


# ============================================================
# POST /api/auth/logout
# ============================================================
@auth_bp.route('/logout', methods=['POST'])
def logout():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "").strip() if auth_header else ""

    SupabaseAuthService.logout(token)
    return success_response({"message": "Logged out successfully"}, 200)


# ============================================================
# GET /api/auth/check-role?email=...
# ============================================================
@auth_bp.route('/check-role', methods=['GET'])
def check_role():
    email = request.args.get("email", "").strip()
    if not email:
        return success_response({"role": None}, 200)

    role, _ = SupabaseAuthService.get_role_for_email(email)
    return success_response({"role": role}, 200)


# ============================================================
# POST /api/auth/verify-otp
# ============================================================
@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json() or {}
    email = data.get("email", "").strip()
    token = data.get("token", "").strip()

    if not email or not token:
        return error_response("Email and verification token code are required", 400)

    session_data, err = SupabaseAuthService.verify_otp(email, token)
    if err:
        return error_response(err, 400)

    return success_response(session_data, 200)


# ============================================================
# POST /api/auth/resend-confirmation
# ============================================================
@auth_bp.route('/resend-confirmation', methods=['POST'])
def resend_confirmation():
    data = request.get_json() or {}
    email = data.get("email", "").strip()

    if not email:
        return error_response("Email is required", 400)

    _, err = SupabaseAuthService.resend_confirmation(email)
    if err:
        return error_response(err, 400)

    return success_response({"message": "Verification code resent to inbox!"}, 200)
