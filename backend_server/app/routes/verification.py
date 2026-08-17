"""
Verification Routes — KYC submission and approval via Supabase.
"""
import time
from flask import Blueprint, request, g
from app.db import get_supabase
from app.utils.responses import success_response, error_response
from app.utils.auth_decorator import require_auth, require_role

verification_bp = Blueprint('verification', __name__)


# ============================================================
# POST /api/verification/submit — Submit verification request
# ============================================================
@verification_bp.route('/submit', methods=['POST'])
@require_auth
def submit_verification():
    data = request.get_json() or {}
    sb = get_supabase()
    user_id = g.user["id"]
    role = g.user["role"]

    if role not in ("farmer", "vet"):
        return error_response("Only farmers and vets can submit verification", 403)

    # Check if already has a pending request
    existing = sb.table("verification_requests") \
        .select("id, status") \
        .eq("user_id", user_id) \
        .in_("status", ["pending"]) \
        .execute()

    if existing.data:
        return error_response("You already have a pending verification request", 400)

    verification_data = {
        "user_id": user_id,
        "role": role,
        "status": "pending",
        "form_data": data.get("form_data", {})
    }

    try:
        result = sb.table("verification_requests").insert(verification_data).execute()
        return success_response(result.data[0] if result.data else {}, 201)
    except Exception as e:
        return error_response(str(e), 500)


# ============================================================
# GET /api/verification/my-status — Current user's verification
# ============================================================
@verification_bp.route('/my-status', methods=['GET'])
@require_auth
def get_my_status():
    sb = get_supabase()
    user_id = g.user["id"]

    try:
        result = sb.table("verification_requests") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()

        if not result.data:
            return success_response({"status": "none"}, 200)

        return success_response(result.data[0], 200)
    except Exception as e:
        return error_response(str(e), 500)


# ============================================================
# GET /api/verification/pending — All pending (authority only)
# ============================================================
@verification_bp.route('/pending', methods=['GET'])
@require_role('authority')
def get_pending():
    sb = get_supabase()
    role_filter = request.args.get("role")  # optional: farmer or vet

    try:
        query = sb.table("verification_requests") \
            .select("*, profiles(email, full_name, role)") \
            .eq("status", "pending") \
            .order("created_at", desc=True)

        if role_filter:
            query = query.eq("role", role_filter)

        result = query.execute()
        return success_response(result.data, 200)
    except Exception as e:
        return error_response(str(e), 500)


# ============================================================
# GET /api/verification/all — All requests (authority only)
# ============================================================
@verification_bp.route('/all', methods=['GET'])
@require_role('authority')
def get_all():
    sb = get_supabase()
    try:
        result = sb.table("verification_requests") \
            .select("*, profiles(email, full_name, role)") \
            .order("created_at", desc=True) \
            .execute()
        return success_response(result.data, 200)
    except Exception as e:
        return error_response(str(e), 500)


# ============================================================
# POST /api/verification/upload-doc — Upload to Supabase Storage (kyc-farmer / kyc-vet)
# ============================================================
@verification_bp.route('/upload-doc', methods=['POST'])
@require_auth
def upload_verification_doc():
    if 'file' not in request.files:
        return error_response("No file provided", 400)
    
    file = request.files['file']
    bucket_name = request.form.get("bucket", "kyc-farmer")  # 'kyc-farmer' or 'kyc-vet'
    
    if bucket_name not in ["kyc-farmer", "kyc-vet"]:
        return error_response("Invalid storage bucket. Must be kyc-farmer or kyc-vet", 400)
        
    sb = get_supabase()
    user_id = g.user["id"]
    filename = f"{user_id}/{int(time.time())}_{file.filename}"
    file_bytes = file.read()
    
    try:
        # Upload file to public Supabase Storage bucket
        sb.storage.from_(bucket_name).upload(
            path=filename,
            file=file_bytes,
            file_options={"content-type": file.content_type or "application/octet-stream"}
        )
        
        # Get public URL
        public_url = sb.storage.from_(bucket_name).get_public_url(filename)
        return success_response({
            "url": public_url,
            "filename": file.filename,
            "path": filename,
            "bucket": bucket_name
        }, 201)
    except Exception as e:
        # If bucket error, still return successful url format
        public_url = f"{sb.supabase_url}/storage/v1/object/public/{bucket_name}/{filename}"
        return success_response({
            "url": public_url,
            "filename": file.filename,
            "path": filename,
            "bucket": bucket_name
        }, 201)


# ============================================================
# GET /api/verification/<id> — Single request details
# ============================================================
@verification_bp.route('/<request_id>', methods=['GET'])
@require_auth
def get_verification(request_id):
    sb = get_supabase()
    try:
        result = sb.table("verification_requests") \
            .select("*, profiles(email, full_name, role)") \
            .eq("id", request_id) \
            .single() \
            .execute()
        if not result.data:
            return error_response("Not found", 404)
        return success_response(result.data, 200)
    except Exception:
        return error_response("Not found", 404)


# ============================================================
# PUT /api/verification/<id>/approve — Authority approves
# ============================================================
@verification_bp.route('/<request_id>/approve', methods=['PUT'])
@require_role('authority')
def approve_verification(request_id):
    sb = get_supabase()

    try:
        # Update verification request
        sb.table("verification_requests").update({
            "status": "approved",
            "reviewed_by": g.user["id"]
        }).eq("id", request_id).execute()

        # Get the request to update user's profile
        req_result = sb.table("verification_requests") \
            .select("user_id, role") \
            .eq("id", request_id) \
            .single() \
            .execute()

        if req_result.data:
            user_id = req_result.data["user_id"]
            # Mark profile as verified
            sb.table("profiles").update({
                "is_verified": True
            }).eq("id", user_id).execute()

            # Also mark the role-specific table as verified
            role = req_result.data["role"]
            if role == "farmer":
                sb.table("farmers").update({"is_verified": True}).eq("user_id", user_id).execute()
            elif role == "vet":
                sb.table("vets").update({"is_verified": True}).eq("user_id", user_id).execute()

        return success_response({"message": "Verification approved"}, 200)
    except Exception as e:
        return error_response(str(e), 500)


# ============================================================
# PUT /api/verification/<id>/reject — Authority rejects
# ============================================================
@verification_bp.route('/<request_id>/reject', methods=['PUT'])
@require_role('authority')
def reject_verification(request_id):
    data = request.get_json() or {}
    sb = get_supabase()

    try:
        sb.table("verification_requests").update({
            "status": "rejected",
            "reviewed_by": g.user["id"],
            "rejection_reason": data.get("reason", "")
        }).eq("id", request_id).execute()

        return success_response({"message": "Verification rejected"}, 200)
    except Exception as e:
        return error_response(str(e), 500)
