"""
Agri Farm — Flask Application Factory
All data backed by Supabase PostgreSQL. MongoDB removed.
"""
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()


def create_app():
    app = Flask(__name__)

    # Load config
    from app.config import Config
    app.config.from_object(Config)

    # CORS — allow all origins (local & network IP)
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # ── Register Blueprints ──────────────────────────────────
    from app.routes.auth import auth_bp
    from app.routes.farmers import farmers_bp
    from app.routes.animals import animals_bp
    from app.routes.treatments import treatments_bp
    from app.routes.consumer import consumer_bp
    from app.routes.veterinarian_auth import veterinarian_auth_bp
    from app.routes.upload_routes import upload_bp
    from app.routes.medicines import medicines_bp
    from app.routes.verification import verification_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(farmers_bp, url_prefix="/api/farmers")
    app.register_blueprint(animals_bp, url_prefix="/api/animals")
    app.register_blueprint(treatments_bp, url_prefix="/api/treatments")
    app.register_blueprint(consumer_bp, url_prefix="/api/consumer")
    app.register_blueprint(veterinarian_auth_bp, url_prefix="/api/vets")
    app.register_blueprint(upload_bp, url_prefix="/api/upload")
    app.register_blueprint(medicines_bp, url_prefix="/api/medicines")
    app.register_blueprint(verification_bp, url_prefix="/api/verification")

    # ── Health Check ─────────────────────────────────────────
    @app.route("/api/health", methods=["GET"])
    def health():
        return {"status": "ok", "database": "supabase"}, 200

    return app
