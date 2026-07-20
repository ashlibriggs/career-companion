from flask import Blueprint, jsonify, request

from config import db
from models import ActionItem
from utils.auth import get_authenticated_user
from utils.action_items import (
    serialize_action_item,
    clean_optional_text,
    parse_optional_datetime,
    validate_status,
    validate_priority,
    validate_estimated_minutes,
    update_completion_timestamp,
)

action_item_routes = Blueprint(
    "action_item_routes",
    __name__,
)


@action_item_routes.get("/api/action-items")
def get_action_items():
    """
    Returns every action item owned by the logged-in user.
    """
    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {"error": "Authentication required."}
        ), 401

    action_items = (
        ActionItem.query
        .filter_by(user_id=user.id)
        .order_by(ActionItem.created_at.desc())
        .all()
    )

    return jsonify(
        [
            serialize_action_item(item)
            for item in action_items
        ]
    ), 200


@action_item_routes.post("/api/action-items")
def create_action_item():
    """
    Creates a new action item.
    """
    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {"error": "Authentication required."}
        ), 401

    data = request.get_json(silent=True) or {}

    title = data.get("title", "")

    if not isinstance(title, str) or not title.strip():
        return jsonify(
            {"error": "Title is required."}
        ), 400

    title = title.strip()

    try:
        description = clean_optional_text(
            data.get("description")
        )

        priority = validate_priority(
            data.get("priority", "medium")
        )

        status = validate_status(
            data.get("status", "pending")
        )

        estimated_minutes = validate_estimated_minutes(
            data.get("estimated_minutes")
        )

        due_date = parse_optional_datetime(
            data.get("due_date")
        )

    except ValueError as error:
        return jsonify(
            {"error": str(error)}
        ), 400

    action_item = ActionItem(
        title=title,
        description=description,
        priority=priority,
        status=status,
        estimated_minutes=estimated_minutes,
        due_date=due_date,
        user_id=user.id,
    )

    update_completion_timestamp(
        action_item,
        status,
    )

    try:
        db.session.add(action_item)
        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify(
            {
                "error": (
                    "Unable to create action item."
                )
            }
        ), 500

    return jsonify(
        serialize_action_item(action_item)
    ), 201


@action_item_routes.get("/api/action-items/<int:action_item_id>")
def get_action_item(action_item_id):
    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {"error": "Authentication required."}
        ), 401

    action_item = ActionItem.query.filter_by(
        id=action_item_id,
        user_id=user.id,
    ).first()

    if action_item is None:
        return jsonify(
            {"error": "Action item not found."}
        ), 404

    return jsonify(
        serialize_action_item(action_item)
    ), 200


@action_item_routes.patch("/api/action-items/<int:action_item_id>")
def update_action_item(action_item_id):

    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {"error": "Authentication required."}
        ), 401

    action_item = ActionItem.query.filter_by(
        id=action_item_id,
        user_id=user.id,
    ).first()

    if action_item is None:
        return jsonify(
            {"error": "Action item not found."}
        ), 404

    data = request.get_json(silent=True) or {}

    try:

        if "title" in data:
            title = data.get("title")

            if (
                not isinstance(title, str)
                or not title.strip()
            ):
                raise ValueError(
                    "Title cannot be empty."
                )

            action_item.title = title.strip()

        if "description" in data:
            action_item.description = (
                clean_optional_text(
                    data.get("description")
                )
            )

        if "priority" in data:
            action_item.priority = (
                validate_priority(
                    data.get("priority")
                )
            )

        if "estimated_minutes" in data:
            action_item.estimated_minutes = (
                validate_estimated_minutes(
                    data.get("estimated_minutes")
                )
            )

        if "due_date" in data:
            action_item.due_date = (
                parse_optional_datetime(
                    data.get("due_date")
                )
            )

        if "status" in data:
            status = validate_status(
                data.get("status")
            )

            action_item.status = status

            update_completion_timestamp(
                action_item,
                status,
            )

    except ValueError as error:
        return jsonify(
            {"error": str(error)}
        ), 400

    try:
        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify(
            {
                "error": (
                    "Unable to update action item."
                )
            }
        ), 500

    return jsonify(
        serialize_action_item(action_item)
    ), 200


@action_item_routes.delete(
    "/api/action-items/<int:action_item_id>"
)
def delete_action_item(action_item_id):

    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {"error": "Authentication required."}
        ), 401

    action_item = ActionItem.query.filter_by(
        id=action_item_id,
        user_id=user.id,
    ).first()

    if action_item is None:
        return jsonify(
            {"error": "Action item not found."}
        ), 404

    try:
        db.session.delete(action_item)
        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify(
            {
                "error": (
                    "Unable to delete action item."
                )
            }
        ), 500

    return jsonify(
        {
            "message": (
                "Action item deleted successfully."
            ),
            "id": action_item_id,
        }
    ), 200