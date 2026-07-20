from datetime import datetime, timezone


VALID_STATUSES = {
    "pending",
    "in_progress",
    "completed",
}

VALID_PRIORITIES = {
    "low",
    "medium",
    "high",
}


def serialize_action_item(action_item):
    """
    Converts an ActionItem model into JSON-friendly data.
    """
    return {
        "id": action_item.id,
        "title": action_item.title,
        "description": action_item.description,
        "status": action_item.status,
        "priority": action_item.priority,
        "estimated_minutes": action_item.estimated_minutes,
        "due_date": (
            action_item.due_date.isoformat()
            if action_item.due_date
            else None
        ),
        "completed_at": (
            action_item.completed_at.isoformat()
            if action_item.completed_at
            else None
        ),
        "created_at": (
            action_item.created_at.isoformat()
            if action_item.created_at
            else None
        ),
        "updated_at": (
            action_item.updated_at.isoformat()
            if action_item.updated_at
            else None
        ),
        "user_id": action_item.user_id,
    }


def clean_optional_text(value):
    """
    Returns stripped text or None.

    Raises ValueError when the value is not text or null.
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


def validate_status(value):
    """
    Validates and normalizes an ActionItem status.
    """
    if not isinstance(value, str) or not value.strip():
        raise ValueError("Status must contain text.")

    normalized_status = value.strip().lower()

    if normalized_status not in VALID_STATUSES:
        raise ValueError(
            "Status must be pending, in_progress, or completed."
        )

    return normalized_status


def validate_priority(value):
    """
    Validates and normalizes an ActionItem priority.
    """
    if not isinstance(value, str) or not value.strip():
        raise ValueError("Priority must contain text.")

    normalized_priority = value.strip().lower()

    if normalized_priority not in VALID_PRIORITIES:
        raise ValueError(
            "Priority must be low, medium, or high."
        )

    return normalized_priority


def validate_estimated_minutes(value):
    """
    Validates estimated time in minutes.

    Returns None when no estimate is provided.
    """
    if value in (None, ""):
        return None

    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError(
            "Estimated minutes must be a whole number."
        )

    if value <= 0:
        raise ValueError(
            "Estimated minutes must be greater than zero."
        )

    return value


def update_completion_timestamp(action_item, new_status):
    """
    Keeps completed_at synchronized with status.

    Sets completed_at when an item becomes completed.
    Clears completed_at when an item is reopened.
    """
    if new_status == "completed":
        if action_item.completed_at is None:
            action_item.completed_at = datetime.now(timezone.utc)
    else:
        action_item.completed_at = None