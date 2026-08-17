"""
Animals Routes — CRUD operations for animals using Supabase.
"""
from flask import Blueprint, request, g
from app.db import get_supabase
from app.utils.responses import success_response, error_response
from app.utils.auth_decorator import require_auth

animals_bp = Blueprint('animals', __name__)


@animals_bp.route('/', methods=['GET'])
@require_auth
def get_all_animals():
    sb = get_supabase()
    farmer_id = request.args.get("farmer_id")
    try:
        query = sb.table("animals").select("*").order("created_at", desc=True)
        if farmer_id:
            query = query.eq("farmer_id", farmer_id)
        result = query.execute()
        return success_response(result.data, 200)
    except Exception as e:
        return error_response(str(e), 500)


@animals_bp.route('/<animal_id>', methods=['GET'])
@require_auth
def get_animal(animal_id):
    sb = get_supabase()
    try:
        result = sb.table("animals").select("*").eq("id", animal_id).single().execute()
        if not result.data:
            return error_response("Animal not found", 404)
        return success_response(result.data, 200)
    except Exception:
        return error_response("Animal not found", 404)


@animals_bp.route('/', methods=['POST'])
@require_auth
def create_animal():
    data = request.get_json() or {}
    sb = get_supabase()

    animal_data = {
        "farmer_id": data.get("farmer_id"),
        "species": data.get("species"),
        "breed": data.get("breed"),
        "tag_number": data.get("tag_number"),
        "age": data.get("age"),
        "gender": data.get("gender"),
        "weight": data.get("weight"),
        "is_lactating": data.get("is_lactating", False),
        "daily_milk_yield": data.get("daily_milk_yield", 0),
        "pregnancy_status": data.get("pregnancy_status", "unknown"),
        "profile_photo_path": data.get("profile_photo_path"),
        "additional_image_paths": data.get("additional_image_paths", []),
        "assigned_vet_id": data.get("assigned_vet_id"),
        "current_health_issues": data.get("current_health_issues", []),
    }

    gps = data.get("gps_location")
    if gps:
        animal_data["gps_lat"] = gps.get("lat")
        animal_data["gps_lng"] = gps.get("lng")

    animal_data = {k: v for k, v in animal_data.items() if v is not None}

    try:
        result = sb.table("animals").insert(animal_data).execute()
        return success_response(result.data[0] if result.data else {}, 201)
    except Exception as e:
        return error_response(str(e), 500)


@animals_bp.route('/<animal_id>', methods=['PUT'])
@require_auth
def update_animal(animal_id):
    data = request.get_json() or {}
    sb = get_supabase()
    data.pop("id", None)
    data.pop("created_at", None)

    try:
        result = sb.table("animals").update(data).eq("id", animal_id).execute()
        return success_response(result.data[0] if result.data else {}, 200)
    except Exception as e:
        return error_response(str(e), 500)
