const SAVED_OPPORTUNITIES_KEY =
  "career-companion-saved-opportunities";

/**
 * Returns all saved opportunities.
 */
export function getSavedOpportunities() {
  try {
    const storedOpportunities = localStorage.getItem(
      SAVED_OPPORTUNITIES_KEY
    );

    if (!storedOpportunities) {
      return [];
    }

    const parsedOpportunities = JSON.parse(storedOpportunities);

    return Array.isArray(parsedOpportunities)
      ? parsedOpportunities
      : [];
  } catch (error) {
    console.error("Unable to read saved opportunities:", error);
    return [];
  }
}

/**
 * Determines whether an opportunity is already saved.
 */
export function isOpportunitySaved(opportunityId) {
  return getSavedOpportunities().some(
    (opportunity) =>
      String(opportunity.id) === String(opportunityId)
  );
}

/**
 * Saves an opportunity unless it is already stored.
 */
export function saveOpportunity(opportunity) {
  const savedOpportunities = getSavedOpportunities();

  const alreadySaved = savedOpportunities.some(
    (savedOpportunity) =>
      String(savedOpportunity.id) === String(opportunity.id)
  );

  if (alreadySaved) {
    return savedOpportunities;
  }

  const opportunityToSave = {
    ...opportunity,
    savedAt: new Date().toISOString(),
    trackerStatus: "Saved",
  };

  const updatedOpportunities = [
    opportunityToSave,
    ...savedOpportunities,
  ];

  localStorage.setItem(
    SAVED_OPPORTUNITIES_KEY,
    JSON.stringify(updatedOpportunities)
  );

  return updatedOpportunities;
}

/**
 * Removes a saved opportunity by ID.
 */
export function removeSavedOpportunity(opportunityId) {
  const updatedOpportunities = getSavedOpportunities().filter(
    (opportunity) =>
      String(opportunity.id) !== String(opportunityId)
  );

  localStorage.setItem(
    SAVED_OPPORTUNITIES_KEY,
    JSON.stringify(updatedOpportunities)
  );

  return updatedOpportunities;
}

/**
 * Toggles an opportunity between saved and unsaved.
 *
 * @returns {boolean} The opportunity's new saved state.
 */
export function toggleSavedOpportunity(opportunity) {
  if (isOpportunitySaved(opportunity.id)) {
    removeSavedOpportunity(opportunity.id);
    return false;
  }

  saveOpportunity(opportunity);
  return true;
}