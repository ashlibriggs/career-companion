from flask import Blueprint, jsonify, request

from config import db
from models import ResumeWorkspace
from utils.auth import get_authenticated_user


resume_routes = Blueprint(
    "resume_routes",
    __name__,
    url_prefix="/api/resume",
)


def clean_optional_text(value):
    if value is None:
        return None

    if not isinstance(value, str):
        raise ValueError(
            "Resume fields must contain text."
        )

    cleaned_value = value.strip()

    return cleaned_value or None


def serialize_resume(resume, user):
    if resume is None:
        return {
            "id": None,
            "target_role": "",
            "professional_summary": "",
            "skills": "",
            "experience_highlights": "",
            "created_at": None,
            "updated_at": None,
            "user_id": user.id,
        }

    return {
        "id": resume.id,
        "target_role": resume.target_role or "",
        "professional_summary": (
            resume.professional_summary or ""
        ),
        "skills": resume.skills or "",
        "experience_highlights": (
            resume.experience_highlights or ""
        ),
        "created_at": (
            resume.created_at.isoformat()
            if resume.created_at
            else None
        ),
        "updated_at": (
            resume.updated_at.isoformat()
            if resume.updated_at
            else None
        ),
        "user_id": resume.user_id,
    }


@resume_routes.get("")
def get_resume():
    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {"error": "Authentication required."}
        ), 401

    resume = ResumeWorkspace.query.filter_by(
        user_id=user.id
    ).first()

    return jsonify(
        serialize_resume(resume, user)
    ), 200


@resume_routes.put("")
def save_resume():
    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {"error": "Authentication required."}
        ), 401

    data = request.get_json(silent=True) or {}

    try:
        target_role = clean_optional_text(
            data.get("target_role")
        )
        professional_summary = clean_optional_text(
            data.get("professional_summary")
        )
        skills = clean_optional_text(
            data.get("skills")
        )
        experience_highlights = clean_optional_text(
            data.get("experience_highlights")
        )
    except ValueError as error:
        return jsonify(
            {"error": str(error)}
        ), 400

    resume = ResumeWorkspace.query.filter_by(
        user_id=user.id
    ).first()

    if resume is None:
        resume = ResumeWorkspace(
            user_id=user.id,
        )
        db.session.add(resume)

    resume.target_role = target_role
    resume.professional_summary = (
        professional_summary
    )
    resume.skills = skills
    resume.experience_highlights = (
        experience_highlights
    )

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()

        return jsonify(
            {
                "error": (
                    "Unable to save your resume workspace."
                )
            }
        ), 500

    return jsonify(
        serialize_resume(resume, user)
    ), 200


@resume_routes.delete("")
def clear_resume():
    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {"error": "Authentication required."}
        ), 401

    resume = ResumeWorkspace.query.filter_by(
        user_id=user.id
    ).first()

    if resume is not None:
        try:
            db.session.delete(resume)
            db.session.commit()
        except Exception:
            db.session.rollback()

            return jsonify(
                {
                    "error": (
                        "Unable to clear your resume workspace."
                    )
                }
            ), 500

    return jsonify(
        serialize_resume(None, user)
    ), 200