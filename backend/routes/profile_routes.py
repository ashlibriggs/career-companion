from flask import Blueprint, jsonify, request

from config import db
from models import CareerProfile
from utils.auth import get_authenticated_user


profile_routes = Blueprint(
    "profile_routes",
    __name__,
    url_prefix="/api/profile",
)


def clean_optional_text(value):
    if value is None:
        return None

    if not isinstance(value, str):
        raise ValueError(
            "Profile text fields must contain text."
        )

    cleaned_value = value.strip()

    return cleaned_value or None


def parse_weekly_application_goal(value):
    if value in (None, ""):
        return 5

    try:
        weekly_goal = int(value)
    except (TypeError, ValueError) as error:
        raise ValueError(
            "Weekly application goal must be a whole number."
        ) from error

    if weekly_goal not in {3, 5, 7, 10}:
        raise ValueError(
            "Weekly application goal must be 3, 5, 7, or 10."
        )

    return weekly_goal


def serialize_profile(profile, user):
    if profile is None:
        return {
            "id": None,
            "name": (
                f"{user.first_name} {user.last_name}"
            ).strip(),
            "target_role": "",
            "location": "",
            "weekly_application_goal": 5,
            "career_focus": "",
            "created_at": None,
            "updated_at": None,
            "user_id": user.id,
        }

    return {
        "id": profile.id,
        "name": profile.name or "",
        "target_role": profile.target_role or "",
        "location": profile.location or "",
        "weekly_application_goal": (
            profile.weekly_application_goal
        ),
        "career_focus": profile.career_focus or "",
        "created_at": (
            profile.created_at.isoformat()
            if profile.created_at
            else None
        ),
        "updated_at": (
            profile.updated_at.isoformat()
            if profile.updated_at
            else None
        ),
        "user_id": profile.user_id,
    }


@profile_routes.get("")
def get_profile():
    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {"error": "Authentication required."}
        ), 401

    profile = CareerProfile.query.filter_by(
        user_id=user.id
    ).first()

    return jsonify(
        serialize_profile(profile, user)
    ), 200


@profile_routes.put("")
def save_profile():
    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {"error": "Authentication required."}
        ), 401

    data = request.get_json(silent=True) or {}

    try:
        name = clean_optional_text(
            data.get("name")
        )
        target_role = clean_optional_text(
            data.get("target_role")
        )
        location = clean_optional_text(
            data.get("location")
        )
        career_focus = clean_optional_text(
            data.get("career_focus")
        )
        weekly_application_goal = (
            parse_weekly_application_goal(
                data.get(
                    "weekly_application_goal",
                    5,
                )
            )
        )
    except ValueError as error:
        return jsonify(
            {"error": str(error)}
        ), 400

    profile = CareerProfile.query.filter_by(
        user_id=user.id
    ).first()

    if profile is None:
        profile = CareerProfile(
            user_id=user.id,
        )
        db.session.add(profile)

    profile.name = name
    profile.target_role = target_role
    profile.location = location
    profile.weekly_application_goal = (
        weekly_application_goal
    )
    profile.career_focus = career_focus

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()

        return jsonify(
            {
                "error": (
                    "Unable to save your career profile."
                )
            }
        ), 500

    return jsonify(
        serialize_profile(profile, user)
    ), 200


@profile_routes.delete("")
def clear_profile():
    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {"error": "Authentication required."}
        ), 401

    profile = CareerProfile.query.filter_by(
        user_id=user.id
    ).first()

    if profile is not None:
        try:
            db.session.delete(profile)
            db.session.commit()
        except Exception:
            db.session.rollback()

            return jsonify(
                {
                    "error": (
                        "Unable to clear your career profile."
                    )
                }
            ), 500

    return jsonify(
        serialize_profile(None, user)
    ), 200