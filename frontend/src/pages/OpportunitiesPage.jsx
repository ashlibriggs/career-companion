import { useEffect, useState } from "react";
import OpportunityCard from "../components/opportunities/OpportunityCard";
import { fetchOpportunities } from "../services/jobsApi";
import {
  createSavedJob,
  deleteSavedJob,
  getSavedJobs,
} from "../services/savedJobsApi";
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

  const [savedJobs, setSavedJobs] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isLoadingSavedJobs, setIsLoadingSavedJobs] =
    useState(true);

  const [pendingOpportunityId, setPendingOpportunityId] =
    useState(null);

  const [errorMessage, setErrorMessage] = useState("");

  const [savedJobsErrorMessage, setSavedJobsErrorMessage] =
    useState("");

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

  useEffect(() => {
    let shouldUpdateState = true;

    async function loadSavedJobs() {
      setIsLoadingSavedJobs(true);
      setSavedJobsErrorMessage("");

      try {
        const results = await getSavedJobs();

        if (shouldUpdateState) {
          setSavedJobs(results);
        }
      } catch (error) {
        console.error(error);

        if (shouldUpdateState) {
          setSavedJobs([]);

          setSavedJobsErrorMessage(
            "We could not load your saved opportunities."
          );
        }
      } finally {
        if (shouldUpdateState) {
          setIsLoadingSavedJobs(false);
        }
      }
    }

    loadSavedJobs();

    return () => {
      shouldUpdateState = false;
    };
  }, []);

  function handleSearchSubmit(event) {
    event.preventDefault();

    const cleanedSearchInput = searchInput.trim();

    if (!cleanedSearchInput) {
      return;
    }

    setActiveSearchTerm(cleanedSearchInput);
  }

  async function handleToggleSave(opportunity) {
    const opportunityId = String(opportunity.id);

    if (pendingOpportunityId === opportunityId) {
      return;
    }

    setPendingOpportunityId(opportunityId);
    setSavedJobsErrorMessage("");

    const existingSavedJob = findSavedJob(
      savedJobs,
      opportunity
    );

    try {
      if (existingSavedJob) {
        await deleteSavedJob(existingSavedJob.databaseId);

        setSavedJobs((currentSavedJobs) =>
          currentSavedJobs.filter(
            (savedJob) =>
              savedJob.databaseId !==
              existingSavedJob.databaseId
          )
        );

        return;
      }

      const createdSavedJob = await createSavedJob({
        ...opportunity,
        externalJobId: opportunityId,
      });

      setSavedJobs((currentSavedJobs) => [
        createdSavedJob,
        ...currentSavedJobs,
      ]);
    } catch (error) {
      console.error(error);

      if (error.status === 409) {
        try {
          const refreshedSavedJobs = await getSavedJobs();

          setSavedJobs(refreshedSavedJobs);

          setSavedJobsErrorMessage(
            "This opportunity is already in your tracker."
          );
        } catch (refreshError) {
          console.error(refreshError);

          setSavedJobsErrorMessage(
            "This opportunity may already be saved. Refresh the page and try again."
          );
        }
      } else if (error.status === 401) {
        setSavedJobsErrorMessage(
          "Your session has expired. Please log in again."
        );
      } else {
        setSavedJobsErrorMessage(
          existingSavedJob
            ? "We could not remove that opportunity. Please try again."
            : "We could not save that opportunity. Please try again."
        );
      }
    } finally {
      setPendingOpportunityId(null);
    }
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
          <strong>
            {isLoadingSavedJobs ? "…" : savedJobs.length}
          </strong>{" "}
          {!isLoadingSavedJobs &&
            (savedJobs.length === 1
              ? "opportunity saved"
              : "opportunities saved")}
        </p>
      </div>

      {savedJobsErrorMessage && (
        <div
          className="opportunities-state opportunity-error-state"
          role="alert"
        >
          <p>{savedJobsErrorMessage}</p>
        </div>
      )}

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
            {opportunities.map((opportunity) => {
              const isSaved = Boolean(
                findSavedJob(savedJobs, opportunity)
              );

              return (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  isSaved={isSaved}
                  onToggleSave={handleToggleSave}
                />
              );
            })}
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

function findSavedJob(savedJobs, opportunity) {
  const opportunityId = String(opportunity.id);
  const opportunitySource = normalizeSource(
    opportunity.source
  );

  return savedJobs.find((savedJob) => {
    const savedExternalJobId = String(
      savedJob.externalJobId
    );

    const savedJobSource = normalizeSource(
      savedJob.source
    );

    return (
      savedExternalJobId === opportunityId &&
      savedJobSource === opportunitySource
    );
  });
}

function normalizeSource(source) {
  return String(source || "").trim().toLowerCase();
}

export default OpportunitiesPage;