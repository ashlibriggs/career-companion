from flask import Blueprint, jsonify

from services.gemini_service import (
    GeminiServiceError,
    enhance_recommendation,
)
from services.recommendation_service import (
    build_recommendation_context,
    choose_next_best_step,
)
from utils.auth import get_authenticated_user


recommendation_routes = Blueprint(
    "recommendation_routes",
    __name__,
    url_prefix="/api/recommendation",
)


@recommendation_routes.get("")
def get_recommendation():
    """
    Returns one Next Best Step for the authenticated user.

    Career Companion's deterministic rules select the
    recommendation. Gemini improves only its language.
    """
    user = get_authenticated_user()

    if user is None:
        return jsonify(
            {"error": "Authentication required."}
        ), 401

    context = build_recommendation_context(
        user
    )
    rule_recommendation = (
        choose_next_best_step(context)
    )

    try:
        recommendation = enhance_recommendation(
            rule_recommendation,
            context,
        )

        return jsonify(
            {
                "recommendation":
                    recommendation,
                "source":
                    "career_companion_rules",
                "ai_provider": "gemini",
                "ai_enhanced": True,
                "fallback_used": False,
            }
        ), 200

    except GeminiServiceError as error:
        current_app_message = str(error)

        return jsonify(
            {
                "recommendation":
                    rule_recommendation,
                "source":
                    "career_companion_rules",
                "ai_provider": "gemini",
                "ai_enhanced": False,
                "fallback_used": True,
                "enhancement_status":
                    current_app_message,
            }
        ), 200