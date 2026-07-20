from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from config import db
from models import SavedJob
from utils.auth import get_authenticated_user
from utils.saved_jobs import (
    clean_optional_text,
    find_duplicate_saved_job,
    parse_optional_datetime,
    serialize_saved_job,
)


saved_job_routes = Blueprint(
    "saved_job_routes",
    __name__,
)


@saved_job_routes.get("/api/saved-jobs")
def get_saved_jobs():
    """
    Returns every saved job owned by the logged-in user.
    """
    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {
                "error": "Authentication required."
            }
        ), 401

    saved_jobs = (
        SavedJob.query
        .filter_by(user_id=user.id)
        .order_by(SavedJob.created_at.desc())
        .all()
    )

    return jsonify(
        [
            serialize_saved_job(saved_job)
            for saved_job in saved_jobs
        ]
    ), 200


@saved_job_routes.post("/api/saved-jobs")
def create_saved_job():
    """
    Creates a saved job for the logged-in user.
    """
    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {
                "error": "Authentication required."
            }
        ), 401

    data = request.get_json(silent=True) or {}

    title = data.get("title", "")
    company = data.get("company", "")

    if not isinstance(title, str) or not title.strip():
        return jsonify(
            {
                "error": "Job title is required."
            }
        ), 400

    if not isinstance(company, str) or not company.strip():
        return jsonify(
            {
                "error": "Company is required."
            }
        ), 400

    title = title.strip()
    company = company.strip()

    try:
        external_job_id = clean_optional_text(
            data.get("external_job_id")
        )
        company_logo = clean_optional_text(
            data.get("company_logo")
        )
        category = clean_optional_text(
            data.get("category")
        )
        job_type = clean_optional_text(
            data.get("job_type")
        )
        location = clean_optional_text(
            data.get("location")
        )
        salary = clean_optional_text(
            data.get("salary")
        )
        description = clean_optional_text(
            data.get("description")
        )
        job_url = clean_optional_text(
            data.get("job_url")
        )
        source = clean_optional_text(
            data.get("source")
        )
        notes = clean_optional_text(
            data.get("notes")
        )

        published_at = parse_optional_datetime(
            data.get("published_at")
        )
        applied_at = parse_optional_datetime(
            data.get("applied_at")
        )
        deadline = parse_optional_datetime(
            data.get("deadline")
        )
    except ValueError:
        return jsonify(
            {
                "error": (
                    "Text fields must contain text or null, "
                    "and date fields must use a valid ISO format."
                )
            }
        ), 400

    status = data.get("status", "saved")

    if not isinstance(status, str) or not status.strip():
        return jsonify(
            {
                "error": "Status must contain text."
            }
        ), 400

    status = status.strip().lower()

    existing_saved_job = find_duplicate_saved_job(
        user_id=user.id,
        title=title,
        company=company,
        source=source,
        external_job_id=external_job_id,
        job_url=job_url,
    )

    if existing_saved_job:
        return jsonify(
            {
                "error": (
                    "This opportunity is already "
                    "in your tracker."
                ),
                "saved_job": serialize_saved_job(
                    existing_saved_job
                ),
            }
        ), 409

    saved_job = SavedJob(
        external_job_id=external_job_id,
        title=title,
        company=company,
        company_logo=company_logo,
        category=category,
        job_type=job_type,
        location=location,
        salary=salary,
        description=description,
        published_at=published_at,
        job_url=job_url,
        source=source,
        status=status,
        applied_at=applied_at,
        deadline=deadline,
        notes=notes,
        user_id=user.id,
    )

    try:
        db.session.add(saved_job)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()

        return jsonify(
            {
                "error": (
                    "This opportunity is already "
                    "in your tracker."
                )
            }
        ), 409
    except Exception:
        db.session.rollback()

        return jsonify(
            {
                "error": (
                    "The opportunity could not be saved. "
                    "Please try again."
                )
            }
        ), 500

    return jsonify(
        serialize_saved_job(saved_job)
    ), 201


@saved_job_routes.get("/api/saved-jobs/<int:saved_job_id>")
def get_saved_job(saved_job_id):
    """
    Returns one saved job when it belongs to the logged-in user.
    """
    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {
                "error": "Authentication required."
            }
        ), 401

    saved_job = SavedJob.query.filter_by(
        id=saved_job_id,
        user_id=user.id,
    ).first()

    if saved_job is None:
        return jsonify(
            {
                "error": "Saved job not found."
            }
        ), 404

    return jsonify(
        serialize_saved_job(saved_job)
    ), 200


@saved_job_routes.patch("/api/saved-jobs/<int:saved_job_id>")
def update_saved_job(saved_job_id):
    """
    Updates fields on a saved job owned by the logged-in user.
    """
    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {
                "error": "Authentication required."
            }
        ), 401

    saved_job = SavedJob.query.filter_by(
        id=saved_job_id,
        user_id=user.id,
    ).first()

    if saved_job is None:
        return jsonify(
            {
                "error": "Saved job not found."
            }
        ), 404

    data = request.get_json(silent=True) or {}

    allowed_fields = {
        "external_job_id",
        "title",
        "company",
        "company_logo",
        "category",
        "job_type",
        "location",
        "salary",
        "description",
        "published_at",
        "job_url",
        "source",
        "status",
        "applied_at",
        "deadline",
        "notes",
    }

    supplied_fields = allowed_fields.intersection(data.keys())

    if not supplied_fields:
        return jsonify(
            {
                "error": (
                    "Provide at least one supported "
                    "field to update."
                )
            }
        ), 400

    if "title" in data:
        title = data.get("title")

        if not isinstance(title, str) or not title.strip():
            return jsonify(
                {
                    "error": "Job title cannot be empty."
                }
            ), 400

        saved_job.title = title.strip()

    if "company" in data:
        company = data.get("company")

        if not isinstance(company, str) or not company.strip():
            return jsonify(
                {
                    "error": "Company cannot be empty."
                }
            ), 400

        saved_job.company = company.strip()

    optional_text_fields = {
        "external_job_id": "external_job_id",
        "company_logo": "company_logo",
        "category": "category",
        "job_type": "job_type",
        "location": "location",
        "salary": "salary",
        "description": "description",
        "job_url": "job_url",
        "source": "source",
        "notes": "notes",
    }

    try:
        for request_field, model_field in optional_text_fields.items():
            if request_field in data:
                cleaned_value = clean_optional_text(
                    data.get(request_field)
                )

                setattr(
                    saved_job,
                    model_field,
                    cleaned_value,
                )

        if "published_at" in data:
            saved_job.published_at = parse_optional_datetime(
                data.get("published_at")
            )

        if "applied_at" in data:
            saved_job.applied_at = parse_optional_datetime(
                data.get("applied_at")
            )

        if "deadline" in data:
            saved_job.deadline = parse_optional_datetime(
                data.get("deadline")
            )
    except ValueError:
        return jsonify(
            {
                "error": (
                    "Text fields must contain text or null, "
                    "and date fields must use a valid ISO format."
                )
            }
        ), 400

    if "status" in data:
        status = data.get("status")

        if not isinstance(status, str) or not status.strip():
            return jsonify(
                {
                    "error": "Status cannot be empty."
                }
            ), 400

        saved_job.status = status.strip().lower()

    existing_saved_job = find_duplicate_saved_job(
        user_id=user.id,
        title=saved_job.title,
        company=saved_job.company,
        source=saved_job.source,
        external_job_id=saved_job.external_job_id,
        job_url=saved_job.job_url,
        excluded_saved_job_id=saved_job.id,
    )

    if existing_saved_job:
        return jsonify(
            {
                "error": (
                    "This opportunity is already "
                    "in your tracker."
                )
            }
        ), 409

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()

        return jsonify(
            {
                "error": (
                    "This opportunity is already "
                    "in your tracker."
                )
            }
        ), 409
    except Exception:
        db.session.rollback()

        return jsonify(
            {
                "error": (
                    "The saved job could not be updated. "
                    "Please try again."
                )
            }
        ), 500

    return jsonify(
        serialize_saved_job(saved_job)
    ), 200


@saved_job_routes.delete("/api/saved-jobs/<int:saved_job_id>")
def delete_saved_job(saved_job_id):
    """
    Deletes a saved job owned by the logged-in user.
    """
    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {
                "error": "Authentication required."
            }
        ), 401

    saved_job = SavedJob.query.filter_by(
        id=saved_job_id,
        user_id=user.id,
    ).first()

    if saved_job is None:
        return jsonify(
            {
                "error": "Saved job not found."
            }
        ), 404

    try:
        db.session.delete(saved_job)
        db.session.commit()
    except Exception:
        db.session.rollback()

        return jsonify(
            {
                "error": (
                    "The saved job could not be removed. "
                    "Please try again."
                )
            }
        ), 500

    return jsonify(
        {
            "message": "Saved job removed successfully.",
            "id": saved_job_id,
        }
    ), 200