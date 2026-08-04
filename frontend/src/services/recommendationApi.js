const API_BASE_URL =
  "http://localhost:5001/api/recommendation";

/**
 * Sends an authenticated request to the Career Companion
 * recommendation endpoint.
 */
async function request(options = {}) {
  const response = await fetch(API_BASE_URL, {
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
      data.error ||
        "Unable to load your Career Companion recommendation."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

/**
 * Converts the Flask recommendation response into the structure
 * used by the React interface.
 */
function normalizeRecommendation(data) {
  const recommendation = data.recommendation || {};

  return {
    title:
      recommendation.action_title ||
      recommendation.title ||
      "Review your next career step",
    description:
      recommendation.action_description ||
      recommendation.description ||
      "",
    coachingMessage:
      recommendation.coaching_message ||
      "",
    whyThisMatters:
      recommendation.why_this_matters ||
      recommendation.reason ||
      "",
    estimatedMinutes:
      recommendation.estimated_minutes ||
      15,
    rule:
      recommendation.rule ||
      "",
    evidence:
      recommendation.evidence ||
      {},
    aiEnhanced:
      data.ai_enhanced === true,
    aiProvider:
      data.ai_provider ||
      null,
    fallbackUsed:
      data.fallback_used === true,
    source:
      data.source ||
      null,
  };
}

/**
 * Returns the authenticated user's current Next Best Step.
 */
export async function getRecommendation() {
  const data = await request();

  return normalizeRecommendation(data);
}