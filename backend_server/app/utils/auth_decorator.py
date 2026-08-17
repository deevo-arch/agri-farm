"""
Auth decorator — extracts Supabase user from Bearer token.
Replaces flask_jwt_extended @jwt_required() throughout the app.
"""
from functools import wraps
from flask import request, g
from app.services.supabase_auth import SupabaseAuthService
from app.utils.responses import error_response


def require_auth(f):
    """Decorator that validates Supabase Bearer token and sets g.user."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return error_response("Authorization header required", 401)

        token = auth_header.replace("Bearer ", "").strip()
        user_data, err = SupabaseAuthService.get_user_by_token(token)

        if err:
            return error_response(err, 401)

        g.user = user_data  # Available in all route handlers
        return f(*args, **kwargs)
    return decorated


def require_role(*roles):
    """Decorator that checks g.user.role is in allowed roles."""
    def decorator(f):
        @wraps(f)
        @require_auth
        def decorated(*args, **kwargs):
            user_role = g.user.get("role", "")
            if user_role not in roles:
                return error_response(
                    f"Access denied. Required roles: {', '.join(roles)}",
                    403
                )
            return f(*args, **kwargs)
        return decorated
    return decorator
