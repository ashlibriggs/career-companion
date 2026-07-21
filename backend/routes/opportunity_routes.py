from flask import Blueprint, jsonify, request

from services.adzuna_service import (
    OpportunityServiceError,
    search_adzuna_opportunities,
)
from services.usajobs_service import (
    USAJobsServiceError,
    search_usajobs_opportunities,
)


opportunity_routes = Blueprint(
    "opportunity_routes",
    __name__,
    url_prefix="/api/opportunities",
)


DEFAULT_PER_PAGE = 10
MAX_PER_PAGE = 50
DEFAULT_PAGE = 1


@opportunity_routes.get("")
def get_opportunities():
    """
    Search supported opportunity providers and return normalized,
    paginated job results.

    Query parameters:
        search:
            Required job title or keyword.

        page:
            Optional results page. Defaults to 1.

        per_page:
            Optional number of combined results per page.
            Defaults to 10 and cannot exceed 50.

        limit:
            Supported as a backward-compatible alternative
            to per_page.
    """
    search_term = request.args.get(
        "search",
        "",
    ).strip()

    if not search_term:
        return jsonify(
            {
                "error": "A search term is required.",
                "suggestions": [
                    "junior developer",
                    "frontend developer",
                    "data analyst",
                    "technical product manager",
                ],
            }
        ), 400

    try:
        page = parse_positive_integer(
            request.args.get("page"),
            default=DEFAULT_PAGE,
            field_name="page",
        )

        raw_per_page = request.args.get("per_page")

        if raw_per_page is None:
            raw_per_page = request.args.get("limit")

        per_page = parse_positive_integer(
            raw_per_page,
            default=DEFAULT_PER_PAGE,
            maximum=MAX_PER_PAGE,
            field_name="per_page",
        )

    except ValueError as error:
        return jsonify(
            {
                "error": str(error),
            }
        ), 400

    adzuna_results = []
    usajobs_results = []

    provider_status = {
        "adzuna": {
            "status": "pending",
            "count": 0,
        },
        "usajobs": {
            "status": "pending",
            "count": 0,
        },
    }

    try:
        adzuna_results = search_adzuna_opportunities(
            search_term=search_term,
            results_limit=per_page,
            page=page,
        )

        provider_status["adzuna"] = {
            "status": "success",
            "count": len(adzuna_results),
        }

    except (OpportunityServiceError, ValueError):
        provider_status["adzuna"] = {
            "status": "unavailable",
            "count": 0,
        }

    try:
        usajobs_results = search_usajobs_opportunities(
            search_term=search_term,
            limit=per_page,
            page=page,
        )

        provider_status["usajobs"] = {
            "status": "success",
            "count": len(usajobs_results),
        }

    except (USAJobsServiceError, ValueError):
        provider_status["usajobs"] = {
            "status": "unavailable",
            "count": 0,
        }

    successful_provider_count = sum(
        provider["status"] == "success"
        for provider in provider_status.values()
    )

    if successful_provider_count == 0:
        return jsonify(
            {
                "error": (
                    "Opportunities are temporarily unavailable. "
                    "Please try again."
                ),
                "providers": provider_status,
            }
        ), 502

    combined_opportunities = interleave_provider_results(
        adzuna_results=adzuna_results,
        usajobs_results=usajobs_results,
    )

    unique_opportunities = deduplicate_opportunities(
        combined_opportunities
    )

    opportunities = unique_opportunities[:per_page]

    has_next = any(
        provider["status"] == "success"
        and provider["count"] >= per_page
        for provider in provider_status.values()
    )

    pagination = {
        "page": page,
        "per_page": per_page,
        "returned_count": len(opportunities),
        "has_previous": page > 1,
        "has_next": has_next,
        "previous_page": (
            page - 1
            if page > 1
            else None
        ),
        "next_page": (
            page + 1
            if has_next
            else None
        ),
    }

    return jsonify(
        {
            "search": search_term,
            "count": len(opportunities),
            "results": opportunities,
            "providers": provider_status,
            "pagination": pagination,
        }
    ), 200


def interleave_provider_results(
    adzuna_results,
    usajobs_results,
):
    """
    Alternate provider results so users see a balanced mix.
    """
    combined_results = []

    max_length = max(
        len(adzuna_results),
        len(usajobs_results),
    )

    for index in range(max_length):
        if index < len(adzuna_results):
            combined_results.append(
                adzuna_results[index]
            )

        if index < len(usajobs_results):
            combined_results.append(
                usajobs_results[index]
            )

    return combined_results


def deduplicate_opportunities(opportunities):
    """
    Remove likely duplicate jobs while preserving provider order.

    Jobs are treated as duplicates when their normalized title,
    company, and location match.
    """
    unique_opportunities = []
    seen_jobs = set()

    for opportunity in opportunities:
        if not isinstance(opportunity, dict):
            continue

        duplicate_key = (
            normalize_deduplication_value(
                opportunity.get("title")
            ),
            normalize_deduplication_value(
                opportunity.get("company")
            ),
            normalize_deduplication_value(
                opportunity.get("location")
            ),
        )

        if duplicate_key == ("", "", ""):
            duplicate_key = (
                normalize_deduplication_value(
                    opportunity.get("source")
                ),
                normalize_deduplication_value(
                    opportunity.get("id")
                ),
                "",
            )

        if duplicate_key in seen_jobs:
            continue

        seen_jobs.add(duplicate_key)
        unique_opportunities.append(
            opportunity
        )

    return unique_opportunities


def normalize_deduplication_value(value):
    """
    Normalize a provider value for case-insensitive comparison.
    """
    return " ".join(
        str(value or "")
        .strip()
        .lower()
        .split()
    )


def parse_positive_integer(
    raw_value,
    default,
    field_name,
    maximum=None,
):
    """
    Parse an optional query parameter into a positive integer.
    """
    if raw_value is None or raw_value == "":
        return default

    try:
        value = int(raw_value)

    except (TypeError, ValueError) as error:
        raise ValueError(
            (
                f"{field_name.replace('_', ' ').capitalize()} "
                "must be a whole number."
            )
        ) from error

    if value < 1:
        raise ValueError(
            (
                f"{field_name.replace('_', ' ').capitalize()} "
                "must be at least 1."
            )
        )

    if maximum is not None and value > maximum:
        raise ValueError(
            (
                f"{field_name.replace('_', ' ').capitalize()} "
                f"cannot exceed {maximum}."
            )
        )

    return value