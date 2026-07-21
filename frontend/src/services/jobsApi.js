const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:5001'

const OPPORTUNITIES_API_URL =
  `${API_BASE_URL}/api/opportunities`

const DEFAULT_RESULTS_PER_PAGE = 10

/**
 * Fetches normalized, paginated opportunities from the
 * Career Companion backend.
 *
 * The Flask backend searches supported providers, including
 * Adzuna and USAJOBS, and returns every result in one shared
 * data format.
 *
 * @param {string} searchTerm
 * @param {number} page
 * @param {number} perPage
 * @returns {Promise<Object>}
 */
export async function fetchOpportunities(
  searchTerm = '',
  page = 1,
  perPage = DEFAULT_RESULTS_PER_PAGE
) {
  const cleanedSearchTerm = String(
    searchTerm
  ).trim()

  if (!cleanedSearchTerm) {
    return {
      search: '',
      count: 0,
      results: [],
      providers: {},
      pagination: {
        page: 1,
        perPage,
        returnedCount: 0,
        hasPrevious: false,
        hasNext: false,
        previousPage: null,
        nextPage: null,
      },
    }
  }

  const searchParams = new URLSearchParams({
    search: cleanedSearchTerm,
    page: String(page),
    per_page: String(perPage),
  })

  let response

  try {
    response = await fetch(
      `${OPPORTUNITIES_API_URL}?${searchParams.toString()}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      }
    )
  } catch {
    throw new Error(
      'Unable to connect to the opportunities service. Please try again.'
    )
  }

  const data = await readResponseData(response)

  if (!response.ok) {
    throw new Error(
      data.error ||
        `Unable to load opportunities. Request failed with status ${response.status}.`
    )
  }

  if (!Array.isArray(data.results)) {
    throw new Error(
      'The opportunities service returned unexpected data.'
    )
  }

  return {
    search: data.search || cleanedSearchTerm,
    count: Number(data.count) || data.results.length,
    results: data.results,
    providers: data.providers || {},
    pagination: normalizePagination(
      data.pagination,
      page,
      perPage
    ),
  }
}

/**
 * Converts Flask pagination keys into the camelCase format
 * used by the React interface.
 */
function normalizePagination(
  pagination = {},
  fallbackPage,
  fallbackPerPage
) {
  return {
    page:
      Number(pagination.page) ||
      fallbackPage,
    perPage:
      Number(pagination.per_page) ||
      fallbackPerPage,
    returnedCount:
      Number(pagination.returned_count) ||
      0,
    hasPrevious:
      Boolean(pagination.has_previous),
    hasNext:
      Boolean(pagination.has_next),
    previousPage:
      pagination.previous_page ?? null,
    nextPage:
      pagination.next_page ?? null,
  }
}

/**
 * Safely reads a JSON response without allowing invalid
 * provider data to cause an unrelated parsing error in
 * the user interface.
 */
async function readResponseData(response) {
  try {
    return await response.json()
  } catch {
    return {}
  }
}