"""
Farmers Routes — CRUD operations for farmers using Supabase.
"""
from flask import Blueprint, request, g
from app.db import get_supabase
from app.utils.responses import success_response, error_response
from app.utils.auth_decorator import require_auth, require_role

farmers_bp = Blueprint('farmers', __name__)


@farmers_bp.route('/', methods=['GET'])
@require_auth
def get_all_farmers():
    sb = get_supabase()
    try:
        result = sb.table("farmers").select("*").order("created_at", desc=True).execute()
        return success_response(result.data, 200)
    except Exception as e:
        return error_response(str(e), 500)


@farmers_bp.route('/<farmer_id>', methods=['GET'])
@require_auth
def get_farmer(farmer_id):
    sb = get_supabase()
    try:
        result = sb.table("farmers").select("*").eq("id", farmer_id).single().execute()
        if not result.data:
            return error_response("Farmer not found", 404)
        return success_response(result.data, 200)
    except Exception as e:
        return error_response("Farmer not found", 404)


@farmers_bp.route('/', methods=['POST'])
@require_auth
def create_farmer():
    data = request.get_json() or {}
    sb = get_supabase()

    farmer_data = {
        "user_id": g.user["id"],
        "name": data.get("name"),
        "age": data.get("age"),
        "gender": data.get("gender"),
        "address": data.get("address"),
        "mobile": data.get("mobile"),
        "aadhar_number": data.get("aadhar_number"),
        "photo_path": data.get("photo_path"),
        "aadhar_photo_path": data.get("aadhar_photo_path"),
        "tahsildar_verification_path": data.get("tahsildar_verification_path"),
        "document_paths": data.get("document_paths", []),
    }

    # GPS location
    gps = data.get("gps_location")
    if gps:
        farmer_data["gps_lat"] = gps.get("lat")
        farmer_data["gps_lng"] = gps.get("lng")

    # After registration details
    after_reg = data.get("after_registration")
    if after_reg:
        farmer_data.update({
            "maintains_record_book": after_reg.get("maintains_record_book"),
            "medicines_in_use": after_reg.get("medicines_in_use"),
            "follows_vet": after_reg.get("follows_vet"),
            "vet_name": after_reg.get("vet_name"),
            "milk_supply_to": after_reg.get("milk_supply_to", []),
            "cow_count": after_reg.get("cow_count", 0),
            "goat_count": after_reg.get("goat_count", 0),
        })

    # Remove None values
    farmer_data = {k: v for k, v in farmer_data.items() if v is not None}

    try:
        result = sb.table("farmers").insert(farmer_data).execute()
        return success_response(result.data[0] if result.data else {}, 201)
    except Exception as e:
        return error_response(str(e), 500)


@farmers_bp.route('/<farmer_id>', methods=['PUT'])
@require_auth
def update_farmer(farmer_id):
    data = request.get_json() or {}
    sb = get_supabase()

    # Remove id from update data
    data.pop("id", None)
    data.pop("created_at", None)

    try:
        result = sb.table("farmers").update(data).eq("id", farmer_id).execute()
        return success_response(result.data[0] if result.data else {}, 200)
    except Exception as e:
        return error_response(str(e), 500)


@farmers_bp.route('/by-user/<user_id>', methods=['GET'])
@require_auth
def get_farmer_by_user(user_id):
    sb = get_supabase()
    try:
        result = sb.table("farmers").select("*").eq("user_id", user_id).single().execute()
        if not result.data:
            return error_response("Farmer profile not found", 404)
        return success_response(result.data, 200)
    except Exception:
        return error_response("Farmer profile not found", 404)
