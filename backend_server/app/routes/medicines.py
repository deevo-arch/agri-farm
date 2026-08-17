"""
Medicines Routes — CRUD for authorized medicines via Supabase.
"""
from flask import Blueprint, request, g
from app.db import get_supabase
from app.utils.responses import success_response, error_response
from app.utils.auth_decorator import require_auth, require_role

medicines_bp = Blueprint('medicines', __name__)


@medicines_bp.route('/', methods=['GET'])
@require_auth
def get_all_medicines():
    sb = get_supabase()
    try:
        result = sb.table("authorized_medicines").select("*").order("name").execute()
        return success_response(result.data, 200)
    except Exception as e:
        return error_response(str(e), 500)


@medicines_bp.route('/<medicine_id>', methods=['GET'])
@require_auth
def get_medicine(medicine_id):
    sb = get_supabase()
    try:
        result = sb.table("authorized_medicines").select("*").eq("id", medicine_id).single().execute()
        if not result.data:
            return error_response("Medicine not found", 404)
        return success_response(result.data, 200)
    except Exception:
        return error_response("Medicine not found", 404)


@medicines_bp.route('/', methods=['POST'])
@require_role('authority')
def create_medicine():
    data = request.get_json() or {}
    sb = get_supabase()

    medicine_data = {
        "name": data.get("name"),
        "dosage": data.get("dosage"),
        "route": data.get("route"),
        "frequency": data.get("frequency"),
        "duration_days": data.get("duration_days", 1),
        "withdrawal_period_days": data.get("withdrawal_period_days"),
    }
    medicine_data = {k: v for k, v in medicine_data.items() if v is not None}

    try:
        result = sb.table("authorized_medicines").insert(medicine_data).execute()
        return success_response(result.data[0] if result.data else {}, 201)
    except Exception as e:
        return error_response(str(e), 500)


@medicines_bp.route('/<medicine_id>', methods=['PUT'])
@require_role('authority')
def update_medicine(medicine_id):
    data = request.get_json() or {}
    sb = get_supabase()
    data.pop("id", None)
    data.pop("created_at", None)

    try:
        result = sb.table("authorized_medicines").update(data).eq("id", medicine_id).execute()
        return success_response(result.data[0] if result.data else {}, 200)
    except Exception as e:
        return error_response(str(e), 500)


@medicines_bp.route('/<medicine_id>', methods=['DELETE'])
@require_role('authority')
def delete_medicine(medicine_id):
    sb = get_supabase()
    try:
        sb.table("authorized_medicines").delete().eq("id", medicine_id).execute()
        return success_response({"message": "Medicine deleted"}, 200)
    except Exception as e:
        return error_response(str(e), 500)
