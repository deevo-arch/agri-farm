"""
Supabase Auth Service — handles signup, login, user management.
All auth flows go through the backend (service_role + anon keys).
"""
from app.db import get_supabase, get_anon_supabase
from gotrue.errors import AuthApiError


class SupabaseAuthService:
    """Wraps Supabase GoTrue auth + profiles table."""

    @staticmethod
    def signup(email: str, password: str, full_name: str, role: str):
        """
        Register a new user via Supabase Auth anon client (sends OTP email).
        The profiles row is created automatically by PostgreSQL trigger.
        """
        sb_anon = get_anon_supabase()

        # Validate role
        valid_roles = ('farmer', 'vet', 'authority', 'consumer')
        if role not in valid_roles:
            return None, f"Invalid role. Must be one of: {', '.join(valid_roles)}"

        try:
            # 1. Sign up user via anon client (triggers OTP email if enabled in Supabase)
            auth_response = sb_anon.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "full_name": full_name,
                        "role": role
                    }
                }
            })

            user = auth_response.user
            if not user:
                return None, "Registration failed or email already in use."

            return {
                "id": str(user.id),
                "email": email,
                "full_name": full_name,
                "role": role,
                "is_verified": False
            }, None

        except AuthApiError as e:
            error_msg = str(e)
            if "already been registered" in error_msg.lower() or "already registered" in error_msg.lower():
                return None, "An account with this email already exists."
            return None, f"Registration failed: {error_msg}"
        except Exception as e:
            return None, f"Registration failed: {str(e)}"

    @staticmethod
    def login(email: str, password: str):
        """
        Authenticate user via Supabase Auth.
        Returns (session_data, error_message).
        """
        sb_anon = get_anon_supabase()
        sb_admin = get_supabase()

        try:
            # 1. Sign in user with anon client
            auth_response = sb_anon.auth.sign_in_with_password({
                "email": email,
                "password": password
            })

            session = auth_response.session
            user = auth_response.user

            if not session or not user:
                return None, "Invalid email or password"

            # 2. Fetch profile from profiles table using service_role client
            profile_result = sb_admin.table("profiles") \
                .select("*") \
                .eq("id", str(user.id)) \
                .execute()

            profiles = profile_result.data
            if not profiles or len(profiles) == 0:
                # Fallback: if profile row missing, create it from user metadata
                meta = user.user_metadata or {}
                profile = {
                    "id": str(user.id),
                    "email": email.lower().strip(),
                    "full_name": meta.get("full_name", email.split("@")[0]),
                    "role": meta.get("role", "consumer"),
                    "is_verified": False
                }
                sb_admin.table("profiles").upsert(profile).execute()
            else:
                profile = profiles[0]

            return {
                "access_token": session.access_token,
                "refresh_token": session.refresh_token,
                "user": {
                    "id": str(user.id),
                    "email": profile["email"],
                    "full_name": profile["full_name"],
                    "role": profile["role"],
                    "is_verified": profile.get("is_verified", False)
                }
            }, None

        except AuthApiError as e:
            return None, "Invalid email or password"
        except Exception as e:
            return None, f"Login failed: {str(e)}"

    @staticmethod
    def get_user_profile(user_id: str):
        """Fetch user profile by ID using service_role client."""
        sb_admin = get_supabase()
        try:
            result = sb_admin.table("profiles") \
                .select("*") \
                .eq("id", user_id) \
                .single() \
                .execute()
            return result.data, None
        except Exception as e:
            return None, f"Failed to fetch profile: {str(e)}"

    @staticmethod
    def get_user_by_token(access_token: str):
        """Validate a Supabase access token and return user info."""
        sb_admin = get_supabase()
        try:
            user_response = sb_admin.auth.get_user(access_token)
            user = user_response.user
            if not user:
                return None, "Invalid or expired token"

            profile, err = SupabaseAuthService.get_user_profile(str(user.id))
            if err or not profile:
                meta = user.user_metadata or {}
                return {
                    "id": str(user.id),
                    "email": user.email,
                    "full_name": meta.get("full_name", user.email.split("@")[0]),
                    "role": meta.get("role", "consumer"),
                    "is_verified": False
                }, None

            return {
                "id": str(user.id),
                "email": profile["email"],
                "full_name": profile["full_name"],
                "role": profile["role"],
                "is_verified": profile.get("is_verified", False)
            }, None

        except Exception as e:
            return None, "Invalid or expired token"

    @staticmethod
    def get_role_for_email(email: str):
        """Check if an email is registered and return its role."""
        sb_admin = get_supabase()
        try:
            result = sb_admin.table("profiles") \
                .select("role") \
                .eq("email", email.lower().strip()) \
                .single() \
                .execute()
            if result.data:
                return result.data["role"], None
            return None, None
        except Exception:
            return None, None

    @staticmethod
    def logout(access_token: str):
        """Sign out user."""
        sb_admin = get_supabase()
        try:
            sb_admin.auth.admin.sign_out(access_token)
            return True, None
        except Exception:
            return True, None

    @staticmethod
    def verify_otp(email: str, token: str):
        """Verify 6-digit OTP signup code."""
        sb_anon = get_anon_supabase()
        try:
            res = sb_anon.auth.verify_otp({
                "email": email,
                "token": token,
                "type": "signup"
            })
            if res.session and res.user:
                profile, _ = SupabaseAuthService.get_user_profile(str(res.user.id))
                return {
                    "access_token": res.session.access_token,
                    "refresh_token": res.session.refresh_token,
                    "user": {
                        "id": str(res.user.id),
                        "email": res.user.email,
                        "full_name": profile.get("full_name") if profile else res.user.email.split("@")[0],
                        "role": profile.get("role") if profile else "consumer",
                        "is_verified": profile.get("is_verified", False) if profile else False
                    }
                }, None
            return None, "Invalid or expired verification code"
        except Exception as e:
            return None, f"Verification failed: {str(e)}"

    @staticmethod
    def resend_confirmation(email: str):
        """Resend signup confirmation email."""
        sb_anon = get_anon_supabase()
        try:
            sb_anon.auth.resend({"type": "signup", "email": email})
            return True, None
        except Exception as e:
            return None, f"Failed to resend confirmation: {str(e)}"
