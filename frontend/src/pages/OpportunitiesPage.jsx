import { useEffect, useState } from "react";
import OpportunityCard from "../components/opportunities/OpportunityCard";
import { fetchOpportunities } from "../services/jobsApi";
import {
  getSavedOpportunities,
  toggleSavedOpportunity,
} from "../utils/savedOpportunities";
import "./OpportunitiesPage.css";

const INITIAL_SEARCH_TERM = "software engineer";

function OpportunitiesPage() {
  const [searchInput, setSearchInput] = useState(
    INITIAL_SEARCH_TERM
  );

  const [activeSearchTerm, setActiveSearchTerm] = useState(
    INITIAL_SEARCH_TERM
  );

  const [opportunities, setOpportunities] = useState([]);

  const [savedOpportunityIds, setSavedOpportunityIds] =
    useState(() => getSavedOpportunityIds());

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let shouldUpdateState = true;

    async function loadOpportunities() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const results = await fetchOpportunities(
          activeSearchTerm
        );

        if (shouldUpdateState) {
          setOpportunities(results);
        }
      } catch (error) {
        console.error(error);

        if (shouldUpdateState) {
          setOpportunities([]);

          setErrorMessage(
            "We could not load opportunities right now. Check your connection and try again."
          );
        }
      } finally {
        if (shouldUpdateState) {
          setIsLoading(false);
        }
      }
    }

    loadOpportunities();

    return () => {
      shouldUpdateState = false;
    };
  }, [activeSearchTerm, retryCount]);

  function handleSearchSubmit(event) {
    event.preventDefault();

    const cleanedSearchInput = searchInput.trim();

    if (!cleanedSearchInput) {
      return;
    }

    setActiveSearchTerm(cleanedSearchInput);
  }

  function handleToggleSave(opportunity) {
    toggleSavedOpportunity(opportunity);

    setSavedOpportunityIds(getSavedOpportunityIds());
  }

  function handleRetry() {
    setRetryCount((currentCount) => currentCount + 1);
  }

  return (
    <section className="opportunities-page">
      <header className="opportunities-page__header">
        <p className="opportunities-page__eyebrow">
          Opportunity discovery
        </p>

        <h1>Find your next opportunity</h1>

        <p className="opportunities-page__intro">
          Search remote roles, save strong matches, and move
          them into your application tracker.
        </p>
      </header>

      <form
        className="opportunity-search"
        onSubmit={handleSearchSubmit}
      >
        <label
          className="opportunity-search__label"
          htmlFor="opportunity-search-input"
        >
          Search by role, skill, or keyword
        </label>

        <div className="opportunity-search__controls">
          <input
            id="opportunity-search-input"
            className="opportunity-search__input"
            type="search"
            value={searchInput}
            placeholder="Try React, frontend, or junior developer"
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
          />

          <button
            className="opportunity-search__button"
            type="submit"
            disabled={isLoading || !searchInput.trim()}
          >
            {isLoading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      <div className="opportunities-page__summary">
        {!isLoading && !errorMessage && (
          <p>
            <strong>{opportunities.length}</strong>{" "}
            {opportunities.length === 1
              ? "opportunity"
              : "opportunities"}{" "}
            found for “{activeSearchTerm}”
          </p>
        )}

        <p>
          <strong>{savedOpportunityIds.length}</strong>{" "}
          {savedOpportunityIds.length === 1
            ? "opportunity saved"
            : "opportunities saved"}
        </p>
      </div>

      {isLoading && <OpportunitiesLoadingState />}

      {!isLoading && errorMessage && (
        <div
          className="opportunities-state opportunity-error-state"
          role="alert"
        >
          <h2>Opportunities are temporarily unavailable</h2>

          <p>{errorMessage}</p>

          <button type="button" onClick={handleRetry}>
            Try again
          </button>
        </div>
      )}

      {!isLoading &&
        !errorMessage &&
        opportunities.length === 0 && (
          <div className="opportunities-state">
            <h2>No matching opportunities found</h2>

            <p>
              Try a broader search such as “developer,”
              “frontend,” or “software engineer.”
            </p>
          </div>
        )}

      {!isLoading &&
        !errorMessage &&
        opportunities.length > 0 && (
          <div className="opportunities-list">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                isSaved={savedOpportunityIds.includes(
                  String(opportunity.id)
                )}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}

      <footer className="opportunities-page__attribution">
        Opportunities provided by Remotive. Application links
        open the original listing in a new tab.
      </footer>
    </section>
  );
}

function OpportunitiesLoadingState() {
  return (
    <div
      className="opportunities-loading"
      role="status"
      aria-live="polite"
    >
      <div className="opportunity-loading-card" />
      <div className="opportunity-loading-card" />
      <div className="opportunity-loading-card" />

      <span className="sr-only">
        Loading opportunities
      </span>
    </div>
  );
}

function getSavedOpportunityIds() {
  return getSavedOpportunities().map((opportunity) =>
    String(opportunity.id)
  );
}

export default OpportunitiesPage;