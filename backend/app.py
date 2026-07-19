from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_migrate import Migrate

from config import Config, db
from models import Interview, SavedJob, User


app = Flask(__name__)
app.config.from_object(Config)

CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
)

db.init_app(app)
migrate = Migrate(app, db)


@app.route("/")
def home():
    return {
        "message": "Welcome to Career Companion API 🚀"
    }


@app.route("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "configured"
    }

@app.post("/api/auth/signup")
def signup():
    data = request.get_json(silent=True) or {}

    first_name = data.get("first_name", "").strip()
    last_name = data.get("last_name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not all([first_name, last_name, email, password]):
        return jsonify(
            {"error": "First name, last name, email, and password are required."}
        ), 400

    if len(password) < 8:
        return jsonify(
            {"error": "Password must be at least 8 characters long."}
        ), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify(
            {"error": "An account with that email already exists."}
        ), 409

    user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
    )

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    session["user_id"] = user.id

    return jsonify(
        {
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role,
            }
        }
    ), 201


@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify(
            {"error": "Email and password are required."}
        ), 400

    user = User.query.filter_by(email=email).first()

    if user is None or not user.check_password(password):
        return jsonify(
            {"error": "Invalid email or password."}
        ), 401

    session["user_id"] = user.id

    return jsonify({
    "id": user.id,
    "first_name": user.first_name,
    "last_name": user.last_name,
    "email": user.email,
    "role": user.role,
    "created_at": user.created_at.isoformat() if user.created_at else None,
}), 200

@app.get("/api/auth/me")
def get_current_user():
    user_id = session.get("user_id")

    if user_id is None:
        return jsonify(
            {"error": "Authentication required."}
        ), 401

    user = db.session.get(User, user_id)

    if user is None:
        session.pop("user_id", None)

        return jsonify(
            {"error": "User not found."}
        ), 404

    return jsonify({
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }), 200


@app.delete("/api/auth/logout")
def logout():
    session.pop("user_id", None)

    return jsonify({
        "message": "Logged out successfully."
    }), 200

if __name__ == "__main__":
    app.run(debug=True)