import requests
from flask import current_app


DEFAULT_RESULTS_LIMIT = 20
DEFAULT_PAGE = 1
REQUEST_TIMEOUT_SECONDS = 10


class OpportunityServiceError(Exception):
    """
    Raised when an external opportunity provider cannot complete a request.
    """


def search_adzuna_opportunities(
    search_term,
    results_limit=DEFAULT_RESULTS_LIMIT,
    page=DEFAULT_PAGE,
):
    """
    Fetches job opportunities from Adzuna and converts them into
    Career Companion's provider-agnostic opportunity format.

    Args:
        search_term: User-entered job-search keywords.
        results_limit: Maximum number of results requested from Adzuna.
        page: Adzuna result page to request.

    Returns:
        A list of normalized opportunity dictionaries.

    Raises:
        ValueError: If the search term is empty.
        OpportunityServiceError: If configuration is missing, the external
        request fails, or Adzuna returns an unexpected response.
    """
    cleaned_search_term = (
        str(search_term).strip()
        if search_term is not None
        else ""
    )

    if not cleaned_search_term:
        raise ValueError(
            "A search term is required."
        )

    app_id = current_app.config.get("ADZUNA_APP_ID")
    app_key = current_app.config.get("ADZUNA_APP_KEY")
    country = current_app.config.get("ADZUNA_COUNTRY", "us")
    base_url = current_app.config.get(
        "ADZUNA_BASE_URL",
        "https://api.adzuna.com/v1/api/jobs",
    )

    if not app_id or not app_key:
        raise OpportunityServiceError(
            "Adzuna API credentials are not configured."
        )

    request_url = f"{base_url}/{country}/search/{page}"

    request_params = {
        "app_id": app_id,
        "app_key": app_key,
        "what": cleaned_search_term,
        "results_per_page": results_limit,
        "content-type": "application/json",
    }

    try:
        response = requests.get(
            request_url,
            params=request_params,
            headers={
                "Accept": "application/json",
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )

        response.raise_for_status()

    except requests.Timeout as error:
        raise OpportunityServiceError(
            "The opportunity provider took too long to respond."
        ) from error

    except requests.RequestException as error:
        raise OpportunityServiceError(
            "The opportunity provider request failed."
        ) from error

    try:
        data = response.json()
    except ValueError as error:
        raise OpportunityServiceError(
            "The opportunity provider returned invalid JSON."
        ) from error

    raw_jobs = data.get("results")

    if not isinstance(raw_jobs, list):
        raise OpportunityServiceError(
            "The opportunity provider returned unexpected data."
        )

    return [
        normalize_adzuna_opportunity(job)
        for job in raw_jobs
        if isinstance(job, dict)
    ]


def normalize_adzuna_opportunity(job):
    """
    Converts one raw Adzuna job into the opportunity shape expected
    by the Career Companion frontend.
    """
    company = job.get("company") or {}
    category = job.get("category") or {}
    location = job.get("location") or {}

    return {
        "id": str(job.get("id", "")),
        "title": (
            job.get("title")
            or "Untitled opportunity"
        ),
        "company": (
            company.get("display_name")
            or "Company not listed"
        ),
        "companyLogo": "",
        "category": (
            category.get("label")
            or "Technology"
        ),
        "jobType": format_job_type(
            job.get("contract_type")
            or job.get("contract_time")
        ),
        "location": (
            location.get("display_name")
            or "Location not listed"
        ),
        "salary": format_salary(
            job.get("salary_min"),
            job.get("salary_max"),
        ),
        "description": job.get("description") or "",
        "publishedAt": job.get("created") or "",
        "applicationUrl": job.get("redirect_url") or "",
        "source": "Adzuna",
    }


def format_job_type(job_type):
    """
    Converts provider-style job types such as 'full_time'
    into user-facing text such as 'Full Time'.
    """
    if not job_type:
        return "Job type not listed"

    return str(job_type).replace("_", " ").title()


def format_salary(salary_min, salary_max):
    """
    Converts Adzuna numeric salary fields into readable display text.
    """
    if salary_min is None and salary_max is None:
        return "Salary not listed"

    if salary_min is not None and salary_max is not None:
        formatted_min = format_salary_amount(salary_min)
        formatted_max = format_salary_amount(salary_max)

        if formatted_min == formatted_max:
            return formatted_min

        return f"{formatted_min}–{formatted_max}"

    salary_amount = (
        salary_min
        if salary_min is not None
        else salary_max
    )

    return format_salary_amount(salary_amount)


def format_salary_amount(amount):
    """
    Formats a numeric salary as U.S. currency without decimal places.
    """
    try:
        numeric_amount = float(amount)
    except (TypeError, ValueError):
        return "Salary not listed"

    return f"${numeric_amount:,.0f}"