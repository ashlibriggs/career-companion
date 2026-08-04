import json

import requests
from flask import current_app


GEMINI_TIMEOUT_SECONDS = 60


class GeminiServiceError(Exception):
    """
    Raised when Gemini cannot enhance a recommendation.
    """


def enhance_recommendation(
    recommendation,
    context,
):
    """
    Uses Gemini only to improve the language of a recommendation
    already selected by Career Companion's deterministic rules.
    """
    api_key = current_app.config.get(
        "GEMINI_API_KEY"
    )
    model = current_app.config.get(
        "GEMINI_MODEL",
        "gemini-3.5-flash",
    )
    base_url = current_app.config.get(
        "GEMINI_API_BASE_URL",
        (
            "https://generativelanguage."
            "googleapis.com/v1beta"
        ),
    )

    if not api_key:
        raise GeminiServiceError(
            "Gemini API key is not configured."
        )

    request_url = (
        f"{base_url}/models/"
        f"{model}:generateContent"
    )

    prompt = _build_prompt(
        recommendation,
        context,
    )

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": prompt,
                    }
                ],
            }
        ],
        "generationConfig": {
            "maxOutputTokens": 700,
            "thinkingConfig": {
                "thinkingLevel": "minimal",
            },
            "responseMimeType": (
                "application/json"
            ),
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "title": {
                        "type": "STRING",
                    },
                    "coaching_message": {
                        "type": "STRING",
                    },
                    "why_this_matters": {
                        "type": "STRING",
                    },
                    "action_title": {
                        "type": "STRING",
                    },
                    "action_description": {
                        "type": "STRING",
                    },
                },
                "required": [
                    "title",
                    "coaching_message",
                    "why_this_matters",
                    "action_title",
                    "action_description",
                ],
            },
        },
    }

    try:
        response = requests.post(
            request_url,
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": api_key,
            },
            json=payload,
            timeout=GEMINI_TIMEOUT_SECONDS,
        )

    except requests.Timeout as error:
        raise GeminiServiceError(
            "Gemini took too long to respond."
        ) from error

    except requests.RequestException as error:
        raise GeminiServiceError(
            "Career Companion could not connect "
            "to Gemini."
        ) from error

    if not response.ok:
        raise GeminiServiceError(
            _build_http_error_message(response)
        )

    try:
        response_data = response.json()
    except ValueError as error:
        raise GeminiServiceError(
            "Gemini returned invalid response data."
        ) from error

    enhanced_copy = _extract_json_response(
        response_data
    )

    return _merge_enhanced_copy(
        recommendation,
        enhanced_copy,
    )


def _build_prompt(
    recommendation,
    context,
):
    profile = context.get("profile")
    resume = context.get("resume")
    saved_jobs = context.get(
        "saved_jobs",
        [],
    )
    action_items = context.get(
        "action_items",
        [],
    )

    profile_context = {
        "target_role": (
            profile.target_role
            if profile
            else ""
        ),
        "preferred_location": (
            profile.location
            if profile
            else ""
        ),
        "career_focus": (
            profile.career_focus
            if profile
            else ""
        ),
    }

    resume_context = {
        "target_role": (
            resume.target_role
            if resume
            else ""
        ),
        "has_professional_summary": bool(
            resume
            and resume.professional_summary
        ),
        "has_skills": bool(
            resume
            and resume.skills
        ),
        "has_experience_highlights": bool(
            resume
            and resume.experience_highlights
        ),
    }

    saved_job_context = [
        {
            "title": job.title,
            "company": job.company,
            "location": job.location or "",
            "status": job.status,
        }
        for job in saved_jobs[:5]
    ]

    action_context = [
        {
            "title": item.title,
            "status": item.status,
            "priority": item.priority,
        }
        for item in action_items[:8]
    ]

    prompt_context = {
        "selected_rule": recommendation,
        "career_profile": profile_context,
        "resume_status": resume_context,
        "saved_jobs": saved_job_context,
        "action_items": action_context,
    }

    return (
        "You are the communication layer for Career "
        "Companion, a supportive career planning product.\n\n"
        "Career Companion's deterministic rule engine has "
        "already selected the user's next best step. Do not "
        "change the underlying decision.\n\n"
        "Improve only the clarity, warmth, and usefulness "
        "of the recommendation.\n\n"
        "Rules:\n"
        "1. Do not invent skills, jobs, employers, activity, "
        "experience, deadlines, or user goals.\n"
        "2. Keep the recommendation focused on one next step.\n"
        "3. Use calm, encouraging, professional language.\n"
        "4. Avoid exaggerated promises or guarantees.\n"
        "5. Keep the coaching message to two or three short "
        "sentences.\n"
        "6. Keep why_this_matters to one or two sentences.\n"
        "7. Preserve the meaning of the supplied action.\n"
        "8. Return only one valid JSON object matching the "
        "required schema. Do not use Markdown or code fences.\n\n"
        "Career Companion context:\n"
        f"{json.dumps(prompt_context, indent=2)}"
    )


def _extract_json_response(response_data):
    """
    Searches every readable, non-thought response part for a
    valid JSON object.

    This is more resilient than assuming the answer is always
    stored in the first Gemini response part.
    """
    candidates = response_data.get(
        "candidates",
        [],
    )

    if not candidates:
        raise GeminiServiceError(
            "Gemini did not return a recommendation."
        )

    for candidate in candidates:
        content = candidate.get(
            "content",
            {},
        )
        parts = content.get(
            "parts",
            [],
        )

        for part in reversed(parts):
            if not isinstance(part, dict):
                continue

            if part.get("thought", False):
                continue

            text = part.get("text")

            if (
                not isinstance(text, str)
                or not text.strip()
            ):
                continue

            parsed_json = _try_parse_json(
                text
            )

            if parsed_json is not None:
                return parsed_json

    raise GeminiServiceError(
        "Gemini returned recommendation text "
        "that could not be read as JSON."
    )


def _try_parse_json(response_text):
    """
    Attempts several safe ways to extract a JSON object from
    Gemini's returned text.
    """
    cleaned_text = _clean_json_text(
        response_text
    )

    try:
        parsed_value = json.loads(
            cleaned_text
        )

        if isinstance(parsed_value, dict):
            return parsed_value

    except json.JSONDecodeError:
        pass

    opening_brace = cleaned_text.find("{")
    closing_brace = cleaned_text.rfind("}")

    if (
        opening_brace == -1
        or closing_brace == -1
        or closing_brace <= opening_brace
    ):
        return None

    possible_json = cleaned_text[
        opening_brace : closing_brace + 1
    ]

    try:
        parsed_value = json.loads(
            possible_json
        )

        if isinstance(parsed_value, dict):
            return parsed_value

    except json.JSONDecodeError:
        return None

    return None


def _clean_json_text(response_text):
    cleaned_text = response_text.strip()

    if cleaned_text.startswith("```json"):
        cleaned_text = cleaned_text[7:]
    elif cleaned_text.startswith("```"):
        cleaned_text = cleaned_text[3:]

    if cleaned_text.endswith("```"):
        cleaned_text = cleaned_text[:-3]

    return cleaned_text.strip()


def _build_http_error_message(response):
    """
    Returns a useful Gemini error without exposing the API key
    or other secret configuration.
    """
    try:
        response_data = response.json()
        error_data = response_data.get(
            "error",
            {},
        )
        provider_message = error_data.get(
            "message"
        )
    except ValueError:
        provider_message = None

    if provider_message:
        return (
            f"Gemini request failed with status "
            f"{response.status_code}: "
            f"{provider_message}"
        )

    return (
        f"Gemini request failed with status "
        f"{response.status_code}."
    )


def _merge_enhanced_copy(
    recommendation,
    enhanced_copy,
):
    if not isinstance(enhanced_copy, dict):
        raise GeminiServiceError(
            "Gemini returned an invalid "
            "recommendation object."
        )

    required_fields = [
        "title",
        "coaching_message",
        "why_this_matters",
        "action_title",
        "action_description",
    ]

    for field in required_fields:
        value = enhanced_copy.get(field)

        if (
            not isinstance(value, str)
            or not value.strip()
        ):
            raise GeminiServiceError(
                "Gemini omitted required "
                "recommendation text."
            )

    return {
        **recommendation,
        "title": enhanced_copy[
            "title"
        ].strip(),
        "coaching_message": enhanced_copy[
            "coaching_message"
        ].strip(),
        "why_this_matters": enhanced_copy[
            "why_this_matters"
        ].strip(),
        "action_title": enhanced_copy[
            "action_title"
        ].strip(),
        "action_description": enhanced_copy[
            "action_description"
        ].strip(),
    }