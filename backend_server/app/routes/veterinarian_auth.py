"""
Vet Records Routes — CRUD for vets via Supabase.
"""
from flask import Blueprint, request, g
from app.db import get_supabase
from app.utils.responses import success_response, error_response
from app.utils.auth_decorator import require_auth

veterinarian_auth_bp = Blueprint('veterinarian_auth', __name__)


@veterinarian_auth_bp.route('/', methods=['GET'])
@require_auth
def get_all_vets():
    sb = get_supabase()
    try:
        result = sb.table("vets").select("*").order("created_at", desc=True).execute()
        return success_response(result.data, 200)
    except Exception as e:
        return error_response(str(e), 500)


@veterinarian_auth_bp.route('/<vet_id>', methods=['GET'])
@require_auth
def get_vet(vet_id):
    sb = get_supabase()
    try:
        result = sb.table("vets").select("*").eq("id", vet_id).single().execute()
        if not result.data:
            return error_response("Vet not found", 404)
        return success_response(result.data, 200)
    except Exception:
        return error_response("Vet not found", 404)


@veterinarian_auth_bp.route('/', methods=['POST'])
@require_auth
def create_vet():
    data = request.get_json() or {}
    sb = get_supabase()

    vet_data = {
        "user_id": g.user["id"],
        "name": data.get("name"),
        "age": data.get("age"),
        "gender": data.get("gender"),
        "address": data.get("address"),
        "mobile": data.get("mobile"),
        "qualification": data.get("qualification"),
        "registration_number": data.get("registration_number"),
        "specialization": data.get("specialization", []),
        "profile_photo_path": data.get("profile_photo_path"),
        "license_certificate_path": data.get("license_certificate_path"),
        "degree_certificate_path": data.get("degree_certificate_path"),
        "id_card_path": data.get("id_card_path"),
    }

    gps = data.get("gps_location")
    if gps:
        vet_data["gps_lat"] = gps.get("lat")
        vet_data["gps_lng"] = gps.get("lng")

    vet_data = {k: v for k, v in vet_data.items() if v is not None}

    try:
        result = sb.table("vets").insert(vet_data).execute()
        return success_response(result.data[0] if result.data else {}, 201)
    except Exception as e:
        return error_response(str(e), 500)


@veterinarian_auth_bp.route('/<vet_id>', methods=['PUT'])
@require_auth
def update_vet(vet_id):
    data = request.get_json() or {}
    sb = get_supabase()
    data.pop("id", None)
    data.pop("created_at", None)

    try:
        result = sb.table("vets").update(data).eq("id", vet_id).execute()
        return success_response(result.data[0] if result.data else {}, 200)
    except Exception as e:
        return error_response(str(e), 500)


@veterinarian_auth_bp.route('/by-user/<user_id>', methods=['GET'])
@require_auth
def get_vet_by_user(user_id):
    sb = get_supabase()
    try:
        result = sb.table("vets").select("*").eq("user_id", user_id).single().execute()
        if not result.data:
            return error_response("Vet profile not found", 404)
        return success_response(result.data, 200)
    except Exception:
        return error_response("Vet profile not found", 404)
