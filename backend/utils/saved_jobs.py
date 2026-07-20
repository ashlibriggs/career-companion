from datetime import datetime

from models import SavedJob


def serialize_saved_job(saved_job):
    """
    Converts a SavedJob model into JSON-friendly data.
    """
    return {
        "id": saved_job.id,
        "external_job_id": saved_job.external_job_id,
        "title": saved_job.title,
        "company": saved_job.company,
        "company_logo": saved_job.company_logo,
        "category": saved_job.category,
        "job_type": saved_job.job_type,
        "location": saved_job.location,
        "salary": saved_job.salary,
        "description": saved_job.description,
        "published_at": (
            saved_job.published_at.isoformat()
            if saved_job.published_at
            else None
        ),
        "job_url": saved_job.job_url,
        "source": saved_job.source,
        "status": saved_job.status,
        "applied_at": (
            saved_job.applied_at.isoformat()
            if saved_job.applied_at
            else None
        ),
        "deadline": (
            saved_job.deadline.isoformat()
            if saved_job.deadline
            else None
        ),
        "notes": saved_job.notes,
        "created_at": (
            saved_job.created_at.isoformat()
            if saved_job.created_at
            else None
        ),
        "updated_at": (
            saved_job.updated_at.isoformat()
            if saved_job.updated_at
            else None
        ),
        "user_id": saved_job.user_id,
    }


def clean_optional_text(value):
    """
    Returns stripped text or None.

    Raises ValueError when a non-string, non-null value is supplied.
    """
    if value is None:
        return None

    if not isinstance(value, str):
        raise ValueError("Value must be text or null.")

    return value.strip() or None


def parse_optional_datetime(value):
    """
    Converts an ISO-formatted date string into a Python datetime.

    Returns None when the frontend sends an empty value.
    Raises ValueError when the supplied date is invalid.
    """
    if value in (None, ""):
        return None

    if not isinstance(value, str):
        raise ValueError("Date values must be strings.")

    normalized_value = value.strip().replace("Z", "+00:00")

    return datetime.fromisoformat(normalized_value)


def find_duplicate_saved_job(
    user_id,
    title,
    company,
    source,
    external_job_id,
    job_url,
    excluded_saved_job_id=None,
):
    """
    Finds an existing saved job belonging to the same user.

    Provider jobs are matched by source and external_job_id.
    Manually entered jobs fall back to title, company, and job URL.
    """
    query = SavedJob.query.filter_by(user_id=user_id)

    if excluded_saved_job_id is not None:
        query = query.filter(
            SavedJob.id != excluded_saved_job_id
        )

    if source and external_job_id:
        return query.filter_by(
            source=source,
            external_job_id=external_job_id,
        ).first()

    query = query.filter_by(
        title=title,
        company=company,
    )

    if job_url:
        query = query.filter_by(job_url=job_url)

    return query.first()