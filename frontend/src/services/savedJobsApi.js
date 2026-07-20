const API_BASE_URL =
  "http://localhost:5001/api/saved-jobs";

/**
 * Sends a request to the Saved Jobs API.
 *
 * credentials: "include" ensures the browser sends the user's
 * authentication session cookie with every request.
 */
async function request(endpoint = "", options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(
      data.error || "Unable to complete the saved job request."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

/**
 * Converts a normalized opportunity from jobsApi.js into the
 * snake_case structure expected by the Flask API.
 */
export function createSavedJobPayload(opportunity) {
  return {
    external_job_id:
      opportunity.externalJobId ??
      opportunity.external_job_id ??
      opportunity.id ??
      null,
    title: opportunity.title,
    company: opportunity.company,
    company_logo:
      opportunity.companyLogo ??
      opportunity.company_logo ??
      null,
    category: opportunity.category ?? null,
    job_type:
      opportunity.jobType ??
      opportunity.job_type ??
      null,
    location: opportunity.location ?? null,
    salary: opportunity.salary ?? null,
    description: opportunity.description ?? null,
    published_at:
      opportunity.publishedAt ??
      opportunity.published_at ??
      null,
    job_url:
      opportunity.applicationUrl ??
      opportunity.jobUrl ??
      opportunity.job_url ??
      null,
    source: opportunity.source ?? null,
    status:
      opportunity.trackerStatus ??
      opportunity.status ??
      "saved",
    notes: opportunity.notes ?? null,
  };
}

/**
 * Converts a saved-job response from Flask into the camelCase
 * structure used by the React interface.
 */
export function normalizeSavedJob(savedJob) {
  return {
    id: savedJob.id,
    databaseId: savedJob.id,
    externalJobId: savedJob.external_job_id,
    title: savedJob.title,
    company: savedJob.company,
    companyLogo: savedJob.company_logo,
    category: savedJob.category,
    jobType: savedJob.job_type,
    location: savedJob.location,
    salary: savedJob.salary,
    description: savedJob.description,
    publishedAt: savedJob.published_at,
    applicationUrl: savedJob.job_url,
    source: savedJob.source,
    trackerStatus: savedJob.status,
    appliedAt: savedJob.applied_at,
    deadline: savedJob.deadline,
    notes: savedJob.notes,
    savedAt: savedJob.created_at,
    updatedAt: savedJob.updated_at,
    userId: savedJob.user_id,
  };
}

/**
 * Returns all saved jobs belonging to the authenticated user.
 */
export async function getSavedJobs() {
  const savedJobs = await request();

  return Array.isArray(savedJobs)
    ? savedJobs.map(normalizeSavedJob)
    : [];
}

/**
 * Returns one saved job by its database ID.
 */
export async function getSavedJob(savedJobId) {
  const savedJob = await request(`/${savedJobId}`);

  return normalizeSavedJob(savedJob);
}

/**
 * Saves an opportunity to PostgreSQL through the Flask API.
 */
export async function createSavedJob(opportunity) {
  const savedJob = await request("", {
    method: "POST",
    body: JSON.stringify(
      createSavedJobPayload(opportunity)
    ),
  });

  return normalizeSavedJob(savedJob);
}

/**
 * Updates supported fields on an existing saved job.
 */
export async function updateSavedJob(
  savedJobId,
  updates
) {
  const savedJob = await request(`/${savedJobId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

  return normalizeSavedJob(savedJob);
}

/**
 * Removes a saved job using its PostgreSQL database ID.
 */
export function deleteSavedJob(savedJobId) {
  return request(`/${savedJobId}`, {
    method: "DELETE",
  });
}