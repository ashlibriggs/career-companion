from datetime import datetime
from html import unescape

import requests
from flask import current_app


class USAJobsServiceError(Exception):
    """Raised when the USAJOBS provider cannot return usable job data."""


def _clean_text(value, fallback=""):
    """
    Convert an optional provider value into clean display text.
    """
    if value is None:
        return fallback

    cleaned_value = unescape(str(value)).strip()
    return cleaned_value or fallback


def _format_published_at(value):
    """
    Convert a USAJOBS publication date into a consistent ISO date.

    USAJOBS may return values such as:
    2025-10-22T00:00:00.0000

    Career Companion normalizes that value as:
    2025-10-22T00:00:00Z
    """
    cleaned_value = _clean_text(value)

    if not cleaned_value:
        return None

    try:
        normalized_value = cleaned_value.replace(
            "Z",
            "+00:00",
        )

        parsed_date = datetime.fromisoformat(
            normalized_value
        )

        return parsed_date.strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        )
    except ValueError:
        return None


def _format_location(position_locations):
    """
    Convert USAJOBS location records into one readable location string.
    """
    if not position_locations:
        return "Location not listed"

    location_names = []

    for location in position_locations:
        if not isinstance(location, dict):
            continue

        location_name = _clean_text(
            location.get("LocationName")
        )

        if (
            location_name
            and location_name not in location_names
        ):
            location_names.append(location_name)

    if not location_names:
        return "Location not listed"

    return ", ".join(location_names[:3])


def _format_salary(position_remuneration):
    """
    Convert USAJOBS remuneration records into a readable salary range.
    """
    if not position_remuneration:
        return "Salary not listed"

    remuneration = position_remuneration[0]

    if not isinstance(remuneration, dict):
        return "Salary not listed"

    minimum = remuneration.get("MinimumRange")
    maximum = remuneration.get("MaximumRange")
    interval = _clean_text(
        remuneration.get("RateIntervalCode")
    )

    try:
        minimum_value = float(minimum)
        maximum_value = float(maximum)
    except (TypeError, ValueError):
        return "Salary not listed"

    minimum_display = f"${minimum_value:,.0f}"
    maximum_display = f"${maximum_value:,.0f}"

    salary = f"{minimum_display}–{maximum_display}"

    if interval:
        salary = f"{salary} {interval.lower()}"

    return salary


def _format_job_type(position_schedule):
    """
    Convert USAJOBS schedule records into one readable employment type.
    """
    if not position_schedule:
        return "Job type not listed"

    schedule = position_schedule[0]

    if not isinstance(schedule, dict):
        return "Job type not listed"

    return _clean_text(
        schedule.get("Name"),
        "Job type not listed",
    )


def _format_description(descriptor):
    """
    Build a concise job description from the available USAJOBS fields.
    """
    summary = _clean_text(
        descriptor
        .get("UserArea", {})
        .get("Details", {})
        .get("JobSummary")
    )

    qualification_summary = _clean_text(
        descriptor.get("QualificationSummary")
    )

    description = summary or qualification_summary

    if not description:
        return "No description provided."

    if len(description) > 500:
        return f"{description[:497].rstrip()}..."

    return description


def _get_application_url(descriptor):
    """
    Return the first usable USAJOBS application URL.
    """
    apply_uris = descriptor.get("ApplyURI") or []

    if apply_uris:
        return _clean_text(apply_uris[0])

    position_uri = descriptor.get("PositionURI")

    return _clean_text(position_uri)


def _normalize_usajobs_result(result):
    """
    Convert one USAJOBS search result into Career Companion's shared schema.
    """
    descriptor = (
        result.get("MatchedObjectDescriptor")
        or {}
    )

    organization_name = _clean_text(
        descriptor.get("OrganizationName"),
        "Federal agency not listed",
    )

    department_name = _clean_text(
        descriptor.get("DepartmentName"),
        "Federal Government",
    )

    return {
        "id": _clean_text(
            descriptor.get("PositionID"),
            _clean_text(
                result.get("MatchedObjectId")
            ),
        ),
        "title": _clean_text(
            descriptor.get("PositionTitle"),
            "Untitled federal opportunity",
        ),
        "company": organization_name,
        "companyLogo": "",
        "category": department_name,
        "jobType": _format_job_type(
            descriptor.get("PositionSchedule")
        ),
        "location": _format_location(
            descriptor.get("PositionLocation")
        ),
        "salary": _format_salary(
            descriptor.get(
                "PositionRemuneration"
            )
        ),
        "description": _format_description(
            descriptor
        ),
        "publishedAt": _format_published_at(
            descriptor.get(
                "PublicationStartDate"
            )
        ),
        "applicationUrl": _get_application_url(
            descriptor
        ),
        "source": "USAJOBS",
    }


def search_usajobs_opportunities(
    search_term,
    limit=20,
    page=1,
):
    """
    Search USAJOBS and return normalized Career Companion opportunity records.
    """
    cleaned_search_term = str(
        search_term or ""
    ).strip()

    if not cleaned_search_term:
        raise ValueError(
            "A search term is required."
        )

    try:
        cleaned_limit = int(limit)
        cleaned_page = int(page)
    except (TypeError, ValueError):
        raise ValueError(
            "Limit and page must be whole numbers."
        )

    cleaned_limit = max(
        1,
        min(cleaned_limit, 100),
    )

    cleaned_page = max(
        1,
        cleaned_page,
    )

    api_key = current_app.config.get(
        "USAJOBS_API_KEY"
    )

    user_agent = current_app.config.get(
        "USAJOBS_USER_AGENT"
    )

    base_url = current_app.config.get(
        "USAJOBS_BASE_URL"
    )

    if not api_key or not user_agent or not base_url:
        raise USAJobsServiceError(
            "USAJOBS configuration is incomplete."
        )

    headers = {
        "Host": "data.usajobs.gov",
        "User-Agent": user_agent,
        "Authorization-Key": api_key,
        "Accept": "application/json",
    }

    params = {
        "Keyword": cleaned_search_term,
        "ResultsPerPage": cleaned_limit,
        "Page": cleaned_page,
    }

    try:
        response = requests.get(
            base_url,
            headers=headers,
            params=params,
            timeout=15,
        )

        response.raise_for_status()

    except requests.Timeout as error:
        raise USAJobsServiceError(
            "USAJOBS took too long to respond."
        ) from error

    except requests.RequestException as error:
        raise USAJobsServiceError(
            "USAJOBS could not complete the search."
        ) from error

    try:
        response_data = response.json()

    except ValueError as error:
        raise USAJobsServiceError(
            "USAJOBS returned an unreadable response."
        ) from error

    search_result = (
        response_data.get("SearchResult")
        or {}
    )

    result_items = (
        search_result.get("SearchResultItems")
        or []
    )

    if not isinstance(result_items, list):
        raise USAJobsServiceError(
            "USAJOBS returned an unexpected response format."
        )

    normalized_results = []

    for result in result_items:
        if not isinstance(result, dict):
            continue

        normalized_job = (
            _normalize_usajobs_result(result)
        )

        if (
            normalized_job["id"]
            and normalized_job["applicationUrl"]
        ):
            normalized_results.append(
                normalized_job
            )

    return normalized_results