from flask import session

from config import db
from models import User


def get_authenticated_user():
    """
    Returns the currently authenticated user or None.
    """
    user_id = session.get("user_id")

    if user_id is None:
        return None

    user = db.session.get(User, user_id)

    if user is None:
        session.pop("user_id", None)
        return None

    return user