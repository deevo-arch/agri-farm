"""
Treatments Routes — treatment creation, diagnosis, and queries via Supabase.
"""
from flask import Blueprint, request, g
from datetime import datetime, timedelta
from app.db import get_supabase
from app.utils.responses import success_response, error_response
from app.utils.auth_decorator import require_auth

treatments_bp = Blueprint('treatments', __name__)


# ============================================================
# POST /treatments/request — Farmer creates treatment request
# ============================================================
@treatments_bp.route('/request', methods=['POST'])
@require_auth
def create_treatment_request():
    data = request.get_json() or {}
    sb = get_supabase()
    user_id = g.user["id"]

    # Find farmer profile for this user
    farmer_result = sb.table("farmers").select("id").eq("user_id", user_id).execute()
    if not farmer_result.data:
        return error_response("Only farmers can create treatment requests", 403)

    farmer_id = farmer_result.data[0]["id"]
    animal_id = data.get("animal_id")
    symptoms = data.get("symptoms", [])

    if not animal_id:
        return error_response("animal_id is required", 400)

    # Verify animal belongs to farmer
    animal_check = sb.table("animals").select("id").eq("id", animal_id).eq("farmer_id", farmer_id).execute()
    if not animal_check.data:
        return error_response("Animal not found or not owned by farmer", 403)

    treatment_data = {
        "farmer_id": farmer_id,
        "animal_id": animal_id,
        "symptoms": symptoms,
        "notes": data.get("notes"),
        "status": "pending"
    }

    try:
        result = sb.table("treatments").insert(treatment_data).execute()
        return success_response(result.data[0] if result.data else {}, 201)
    except Exception as e:
        return error_response(str(e), 500)


# ============================================================
# GET /treatments/<id> — Get single treatment
# ============================================================
@treatments_bp.route('/<treatment_id>', methods=['GET'])
@require_auth
def get_treatment(treatment_id):
    sb = get_supabase()
    try:
        result = sb.table("treatments").select("*").eq("id", treatment_id).single().execute()
        if not result.data:
            return error_response("Treatment not found", 404)

        # Fetch prescribed medicines for this treatment
        meds = sb.table("prescribed_medicines") \
            .select("*, authorized_medicines(name)") \
            .eq("treatment_id", treatment_id).execute()

        treatment = result.data
        treatment["medicines"] = meds.data if meds.data else []

        return success_response(treatment, 200)
    except Exception as e:
        return error_response(str(e), 500)


# ============================================================
# PUT /treatments/<id>/diagnose — Vet diagnoses treatment
# ============================================================
@treatments_bp.route('/<treatment_id>/diagnose', methods=['PUT'])
@require_auth
def diagnose_treatment(treatment_id):
    data = request.get_json() or {}
    sb = get_supabase()
    user_id = g.user["id"]

    # Check vet identity
    vet_result = sb.table("vets").select("id").eq("user_id", user_id).execute()
    if not vet_result.data:
        return error_response("Only vets can diagnose", 403)

    vet_id = vet_result.data[0]["id"]

    # Get treatment
    treatment_result = sb.table("treatments").select("*").eq("id", treatment_id).single().execute()
    if not treatment_result.data:
        return error_response("Treatment not found", 404)

    treatment = treatment_result.data
    if treatment["status"] != "pending":
        return error_response("Already diagnosed", 400)

    medicines_input = data.get("medicines", [])
    if not medicines_input:
        return error_response("Medicines list required", 400)

    max_withdrawal_days = 0

    # Process medicines
    for m in medicines_input:
        medicine_id = m.get("medicine_id")
        if not medicine_id:
            return error_response("medicine_id is required", 400)

        # Get authorized medicine
        auth_med = sb.table("authorized_medicines").select("*").eq("id", medicine_id).single().execute()
        if not auth_med.data:
            return error_response("Unauthorized medicine selected", 400)

        authorized = auth_med.data
        vet_days = m.get("vet_withdrawal_days")
        final_withdrawal_days = authorized["withdrawal_period_days"]

        if vet_days is not None:
            if vet_days < authorized["withdrawal_period_days"]:
                final_withdrawal_days = authorized["withdrawal_period_days"]
            else:
                final_withdrawal_days = vet_days

        # Insert prescribed medicine
        sb.table("prescribed_medicines").insert({
            "treatment_id": treatment_id,
            "medicine_id": medicine_id,
            "dosage": authorized["dosage"],
            "frequency": authorized["frequency"],
            "duration_days": authorized["duration_days"],
            "withdrawal_period_days": final_withdrawal_days
        }).execute()

        max_withdrawal_days = max(max_withdrawal_days, final_withdrawal_days)

    # Update treatment
    now = datetime.utcnow().isoformat()
    withdrawal_end = (datetime.utcnow() + timedelta(days=max_withdrawal_days)).isoformat()

    sb.table("treatments").update({
        "vet_id": vet_id,
        "diagnosis": data.get("diagnosis"),
        "notes": data.get("notes"),
        "status": "diagnosed",
        "treatment_start_date": now,
        "withdrawal_ends_on": withdrawal_end,
    }).eq("id", treatment_id).execute()

    # Create withdrawal alert
    sb.table("withdrawal_alerts").insert({
        "treatment_id": treatment_id,
        "animal_id": treatment["animal_id"],
        "safe_from": withdrawal_end
    }).execute()

    # Fetch updated treatment
    updated = sb.table("treatments").select("*").eq("id", treatment_id).single().execute()
    meds = sb.table("prescribed_medicines") \
        .select("*, authorized_medicines(name)") \
        .eq("treatment_id", treatment_id).execute()

    response = updated.data
    response["medicines"] = meds.data if meds.data else []
    response["final_withdrawal_days"] = max_withdrawal_days

    return success_response(response, 200)


# ============================================================
# GET /treatments/animal/<id> — All treatments for an animal
# ============================================================
@treatments_bp.route('/animal/<animal_id>', methods=['GET'])
@require_auth
def get_treatments_by_animal(animal_id):
    sb = get_supabase()
    try:
        result = sb.table("treatments").select("*") \
            .eq("animal_id", animal_id) \
            .order("created_at", desc=True).execute()
        return success_response(result.data, 200)
    except Exception as e:
        return error_response(str(e), 500)


# ============================================================
# GET /treatments/farmer/<id> — All treatments for a farmer
# ============================================================
@treatments_bp.route('/farmer/<farmer_id>', methods=['GET'])
@require_auth
def get_treatments_by_farmer(farmer_id):
    sb = get_supabase()
    try:
        result = sb.table("treatments").select("*") \
            .eq("farmer_id", farmer_id) \
            .order("created_at", desc=True).execute()
        return success_response(result.data, 200)
    except Exception as e:
        return error_response(str(e), 500)


# ============================================================
# GET /treatments/ — All treatments (authority only)
# ============================================================
@treatments_bp.route('/', methods=['GET'])
@require_auth
def get_all_treatments():
    sb = get_supabase()
    try:
        result = sb.table("treatments").select("*").order("created_at", desc=True).execute()
        return success_response(result.data, 200)
    except Exception as e:
        return error_response(str(e), 500)
