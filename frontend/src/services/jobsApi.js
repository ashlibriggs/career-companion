const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5001";

const OPPORTUNITIES_API_URL = `${API_BASE_URL}/api/opportunities`;
const RESULTS_LIMIT = 20;

/**
 * Fetches normalized opportunities from the Career Companion backend.
 *
 * The Flask backend searches supported job providers, including Adzuna
 * and USAJOBS, and returns every result in one shared data format.
 *
 * @param {string} searchTerm - User-entered job title or keyword.
 * @returns {Promise<Array>} Normalized opportunity records.
 */
export async function fetchOpportunities(searchTerm = "") {
  const cleanedSearchTerm = String(searchTerm).trim();

  if (!cleanedSearchTerm) {
    return [];
  }

  const searchParams = new URLSearchParams({
    search: cleanedSearchTerm,
    limit: String(RESULTS_LIMIT),
  });

  let response;

  try {
    response = await fetch(
      `${OPPORTUNITIES_API_URL}?${searchParams.toString()}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to the opportunities service. Please try again."
    );
  }

  const data = await readResponseData(response);

  if (!response.ok) {
    throw new Error(
      data.error ||
        `Unable to load opportunities. Request failed with status ${response.status}.`
    );
  }

  if (!Array.isArray(data.results)) {
    throw new Error(
      "The opportunities service returned unexpected data."
    );
  }

  return data.results;
}

/**
 * Safely reads a JSON response without allowing invalid provider data
 * to cause an unrelated parsing error in the user interface.
 *
 * @param {Response} response - Browser fetch response.
 * @returns {Promise<Object>} Parsed response data.
 */
async function readResponseData(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}