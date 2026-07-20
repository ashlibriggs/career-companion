from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_migrate import Migrate

from config import Config, db
from models import User

from routes.saved_job_routes import saved_job_routes
from routes.action_item_routes import action_item_routes

from utils.auth import get_authenticated_user


app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
migrate = Migrate(app, db)

app.register_blueprint(saved_job_routes)
app.register_blueprint(action_item_routes)

CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
)


# -------------------------------------------------------------------
# Helper functions
# -------------------------------------------------------------------

def serialize_user(user):
    """
    Converts a User model into JSON-friendly data.
    """
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role,
        "created_at": (
            user.created_at.isoformat()
            if user.created_at
            else None
        ),
    }


# -------------------------------------------------------------------
# General API routes
# -------------------------------------------------------------------

@app.route("/")
def home():
    return {
        "message": "Welcome to Career Companion API 🚀"
    }


@app.route("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "configured",
    }


# -------------------------------------------------------------------
# Authentication routes
# -------------------------------------------------------------------

@app.post("/api/auth/signup")
def signup():
    data = request.get_json(silent=True) or {}

    first_name = data.get("first_name", "").strip()
    last_name = data.get("last_name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not all([first_name, last_name, email, password]):
        return jsonify(
            {
                "error": (
                    "First name, last name, email, "
                    "and password are required."
                )
            }
        ), 400

    if len(password) < 8:
        return jsonify(
            {
                "error": (
                    "Password must be at least "
                    "8 characters long."
                )
            }
        ), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify(
            {
                "error": (
                    "An account with that email "
                    "already exists."
                )
            }
        ), 409

    user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
    )

    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
    except Exception:
        db.session.rollback()

        return jsonify(
            {
                "error": (
                    "The account could not be created. "
                    "Please try again."
                )
            }
        ), 500

    session["user_id"] = user.id

    return jsonify(serialize_user(user)), 201


@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify(
            {
                "error": "Email and password are required."
            }
        ), 400

    user = User.query.filter_by(email=email).first()

    if user is None or not user.check_password(password):
        return jsonify(
            {
                "error": "Invalid email or password."
            }
        ), 401

    session["user_id"] = user.id

    return jsonify(serialize_user(user)), 200


@app.get("/api/auth/me")
def get_current_user():
    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {
                "error": "Authentication required."
            }
        ), 401

    return jsonify(serialize_user(user)), 200


@app.delete("/api/auth/logout")
def logout():
    session.pop("user_id", None)

    return jsonify(
        {
            "message": "Logged out successfully."
        }
    ), 200


if __name__ == "__main__":
    app.run(debug=True, port=5001)