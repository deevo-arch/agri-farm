"""
Consumer Routes — consumer safety checks via Supabase.
"""
from flask import Blueprint, request, g
from app.db import get_supabase
from app.utils.responses import success_response, error_response
from app.utils.auth_decorator import require_auth

consumer_bp = Blueprint('consumer', __name__)


@consumer_bp.route('/check', methods=['POST'])
@require_auth
def consumer_check():
    """Check if an animal's products (milk/meat) are safe."""
    data = request.get_json() or {}
    sb = get_supabase()

    tag_number = data.get("tag_number")
    if not tag_number:
        return error_response("tag_number is required", 400)

    # Find animal by tag
    animal_result = sb.table("animals").select("*, farmers(name)") \
        .eq("tag_number", tag_number).execute()

    if not animal_result.data:
        return error_response("Animal not found with this tag number", 404)

    animal = animal_result.data[0]

    # Check withdrawal alerts
    alerts = sb.table("withdrawal_alerts") \
        .select("*") \
        .eq("animal_id", animal["id"]) \
        .eq("alert_sent", False) \
        .execute()

    is_safe_milk = True
    is_safe_meat = True
    message = "Animal products are safe for consumption."

    from datetime import datetime
    for alert in (alerts.data or []):
        safe_from = datetime.fromisoformat(alert["safe_from"].replace("Z", "+00:00"))
        if datetime.now(safe_from.tzinfo) < safe_from:
            is_safe_milk = False
            is_safe_meat = False
            message = f"⚠️ Animal is under withdrawal period. Safe from: {alert['safe_from']}"
            break

    # Save check record
    check_data = {
        "farmer_id": animal.get("farmer_id"),
        "animal_id": animal["id"],
        "is_safe_milk": is_safe_milk,
        "is_safe_meat": is_safe_meat,
        "result_message": message
    }
    sb.table("consumer_checks").insert(check_data).execute()

    return success_response({
        "animal": {
            "tag_number": animal["tag_number"],
            "species": animal["species"],
            "breed": animal.get("breed"),
            "farmer_name": animal.get("farmers", {}).get("name", "Unknown")
        },
        "is_safe_milk": is_safe_milk,
        "is_safe_meat": is_safe_meat,
        "message": message
    }, 200)


@consumer_bp.route('/history', methods=['GET'])
@require_auth
def get_check_history():
    """Get check history (all checks, for authority dashboard)."""
    sb = get_supabase()
    try:
        result = sb.table("consumer_checks").select("*") \
            .order("checked_at", desc=True) \
            .limit(100).execute()
        return success_response(result.data, 200)
    except Exception as e:
        return error_response(str(e), 500)
