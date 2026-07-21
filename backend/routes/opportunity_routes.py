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


DEFAULT_RESULTS_LIMIT = 20
MAX_RESULTS_LIMIT = 50
DEFAULT_PAGE = 1


@opportunity_routes.get("")
def get_opportunities():
    """
    Search supported opportunity providers and return normalized jobs.

    Query parameters:
        search: Required job title or keyword.
        limit: Optional combined result count. Defaults to 20.
        page: Optional provider result page. Defaults to 1.
    """
    search_term = request.args.get("search", "").strip()

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
        results_limit = parse_positive_integer(
            request.args.get("limit"),
            default=DEFAULT_RESULTS_LIMIT,
            maximum=MAX_RESULTS_LIMIT,
            field_name="limit",
        )

        page = parse_positive_integer(
            request.args.get("page"),
            default=DEFAULT_PAGE,
            field_name="page",
        )

    except ValueError as error:
        return jsonify(
            {
                "error": str(error),
            }
        ), 400

    provider_results = []
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
            results_limit=results_limit,
            page=page,
        )

        provider_results.extend(adzuna_results)

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
            limit=results_limit,
            page=page,
        )

        provider_results.extend(usajobs_results)

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

    opportunities = interleave_provider_results(
        adzuna_results=locals().get("adzuna_results", []),
        usajobs_results=locals().get("usajobs_results", []),
    )

    opportunities = deduplicate_opportunities(opportunities)
    opportunities = opportunities[:results_limit]

    return jsonify(
        {
            "search": search_term,
            "count": len(opportunities),
            "results": opportunities,
            "providers": provider_status,
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
            combined_results.append(adzuna_results[index])

        if index < len(usajobs_results):
            combined_results.append(usajobs_results[index])

    return combined_results


def deduplicate_opportunities(opportunities):
    """
    Remove likely duplicate jobs while preserving provider order.

    Jobs are treated as duplicates when their normalized title, company,
    and location match.
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
        unique_opportunities.append(opportunity)

    return unique_opportunities


def normalize_deduplication_value(value):
    """
    Normalize a provider value for case-insensitive comparison.
    """
    return " ".join(
        str(value or "").strip().lower().split()
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
            f"{field_name.capitalize()} must be a whole number."
        ) from error

    if value < 1:
        raise ValueError(
            f"{field_name.capitalize()} must be at least 1."
        )

    if maximum is not None and value > maximum:
        raise ValueError(
            f"{field_name.capitalize()} cannot exceed {maximum}."
        )

    return value