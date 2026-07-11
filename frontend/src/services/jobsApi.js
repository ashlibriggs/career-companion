const JOBS_API_URL = "https://remotive.com/api/remote-jobs";

const DEFAULT_SEARCH_TERM = "software engineer";
const RESULTS_LIMIT = 20;

/**
 * Fetches remote opportunities from the Remotive public API.
 *
 * @param {string} searchTerm - User-entered job keyword.
 * @returns {Promise<Array>} Normalized opportunity records.
 */
export async function fetchOpportunities(
  searchTerm = DEFAULT_SEARCH_TERM
) {
  const cleanedSearchTerm = searchTerm.trim() || DEFAULT_SEARCH_TERM;

  const searchParams = new URLSearchParams({
    search: cleanedSearchTerm,
    category: "software-dev",
    limit: String(RESULTS_LIMIT),
  });

  const response = await fetch(
    `${JOBS_API_URL}?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `Unable to load opportunities. Request failed with status ${response.status}.`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data.jobs)) {
    throw new Error("The opportunities service returned unexpected data.");
  }

  return data.jobs.map(normalizeOpportunity);
}

/**
 * Converts the external API response into the data shape used by our app.
 * Keeping this transformation here prevents components from depending on
 * the exact structure of the third-party API.
 */
function normalizeOpportunity(job) {
  return {
    id: String(job.id),
    title: job.title || "Untitled opportunity",
    company: job.company_name || "Company not listed",
    companyLogo: job.company_logo || "",
    category: job.category || "Software Development",
    jobType: formatJobType(job.job_type),
    location: job.candidate_required_location || "Remote",
    salary: job.salary || "Salary not listed",
    description: job.description || "",
    publishedAt: job.publication_date || "",
    applicationUrl: job.url || "",
    source: "Remotive",
  };
}

function formatJobType(jobType) {
  if (!jobType) {
    return "Job type not listed";
  }

  return jobType
    .split("_")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}