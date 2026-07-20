import { useEffect, useState } from "react";
import {
  deleteSavedJob,
  getSavedJobs,
} from "../services/savedJobsApi";
import "./TrackerPage.css";

function TrackerPage() {
  const [savedOpportunities, setSavedOpportunities] =
    useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [removingSavedJobId, setRemovingSavedJobId] =
    useState(null);

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let shouldUpdateState = true;

    async function loadSavedOpportunities() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const results = await getSavedJobs();

        if (shouldUpdateState) {
          setSavedOpportunities(results);
        }
      } catch (error) {
        console.error(error);

        if (shouldUpdateState) {
          setSavedOpportunities([]);

          if (error.status === 401) {
            setErrorMessage(
              "Your session has expired. Please log in again."
            );
          } else {
            setErrorMessage(
              "We could not load your tracker. Please try again."
            );
          }
        }
      } finally {
        if (shouldUpdateState) {
          setIsLoading(false);
        }
      }
    }

    loadSavedOpportunities();

    return () => {
      shouldUpdateState = false;
    };
  }, [retryCount]);

  async function handleRemoveOpportunity(savedJobId) {
    if (removingSavedJobId === savedJobId) {
      return;
    }

    setRemovingSavedJobId(savedJobId);
    setErrorMessage("");

    try {
      await deleteSavedJob(savedJobId);

      setSavedOpportunities(
        (currentSavedOpportunities) =>
          currentSavedOpportunities.filter(
            (opportunity) =>
              opportunity.databaseId !== savedJobId
          )
      );
    } catch (error) {
      console.error(error);

      if (error.status === 401) {
        setErrorMessage(
          "Your session has expired. Please log in again."
        );
      } else if (error.status === 404) {
        setSavedOpportunities(
          (currentSavedOpportunities) =>
            currentSavedOpportunities.filter(
              (opportunity) =>
                opportunity.databaseId !== savedJobId
            )
        );

        setErrorMessage(
          "That opportunity was no longer in your tracker."
        );
      } else {
        setErrorMessage(
          "We could not remove that opportunity. Please try again."
        );
      }
    } finally {
      setRemovingSavedJobId(null);
    }
  }

  function handleRetry() {
    setRetryCount(
      (currentRetryCount) => currentRetryCount + 1
    );
  }

  return (
    <section className="tracker-page">
      <header className="tracker-page__header">
        <div>
          <p className="tracker-page__eyebrow">
            Application tracker
          </p>

          <h1>Track your saved opportunities</h1>

          <p className="tracker-page__intro">
            Review the roles you saved, return to the original
            listing, and keep your job search focused.
          </p>
        </div>

        <div className="tracker-page__count">
          <strong>
            {isLoading ? "…" : savedOpportunities.length}
          </strong>

          <span>
            {!isLoading &&
              (savedOpportunities.length === 1
                ? "saved opportunity"
                : "saved opportunities")}
          </span>
        </div>
      </header>

      {errorMessage && (
        <div
          className="tracker-state tracker-error-state"
          role="alert"
        >
          <p>{errorMessage}</p>

          {!isLoading && (
            <button
              type="button"
              onClick={handleRetry}
            >
              Try again
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <TrackerLoadingState />
      ) : savedOpportunities.length === 0 ? (
        <TrackerEmptyState />
      ) : (
        <div className="tracker-list">
          {savedOpportunities.map((opportunity) => (
            <TrackerOpportunityCard
              key={opportunity.databaseId}
              opportunity={opportunity}
              onRemove={handleRemoveOpportunity}
              isRemoving={
                removingSavedJobId ===
                opportunity.databaseId
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function TrackerOpportunityCard({
  opportunity,
  onRemove,
  isRemoving,
}) {
  const savedDate = formatDate(opportunity.savedAt);
  const publishedDate = formatDate(
    opportunity.publishedAt
  );

  return (
    <article className="tracker-card">
      <div className="tracker-card__top">
        <div className="tracker-card__company">
          {opportunity.companyLogo ? (
            <img
              className="tracker-card__logo"
              src={opportunity.companyLogo}
              alt={`${opportunity.company} logo`}
            />
          ) : (
            <div
              className="tracker-card__logo-placeholder"
              aria-hidden="true"
            >
              {getCompanyInitial(opportunity.company)}
            </div>
          )}

          <div>
            <p className="tracker-card__company-name">
              {opportunity.company}
            </p>

            <h2>{opportunity.title}</h2>
          </div>
        </div>

        <span className="tracker-card__status">
          {formatStatus(opportunity.trackerStatus)}
        </span>
      </div>

      <div className="tracker-card__details">
        <span>
          {opportunity.location || "Location not listed"}
        </span>

        <span>
          {opportunity.jobType || "Job type not listed"}
        </span>

        <span>
          {opportunity.salary || "Salary not listed"}
        </span>
      </div>

      <dl className="tracker-card__dates">
        {savedDate && (
          <div>
            <dt>Saved</dt>
            <dd>{savedDate}</dd>
          </div>
        )}

        {publishedDate && (
          <div>
            <dt>Posted</dt>
            <dd>{publishedDate}</dd>
          </div>
        )}

        <div>
          <dt>Source</dt>
          <dd>
            {opportunity.source || "External listing"}
          </dd>
        </div>
      </dl>

      <div className="tracker-card__actions">
        {opportunity.applicationUrl ? (
          <a
            className="tracker-card__apply-link"
            href={opportunity.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View and apply externally
            <span aria-hidden="true"> ↗</span>
          </a>
        ) : (
          <span className="tracker-card__disabled-link">
            Application link unavailable
          </span>
        )}

        <button
          className="tracker-card__remove-button"
          type="button"
          disabled={isRemoving}
          onClick={() =>
            onRemove(opportunity.databaseId)
          }
        >
          {isRemoving
            ? "Removing…"
            : "Remove from tracker"}
        </button>
      </div>
    </article>
  );
}

function TrackerLoadingState() {
  return (
    <div
      className="tracker-loading"
      role="status"
      aria-live="polite"
    >
      <div className="tracker-card tracker-loading-card" />
      <div className="tracker-card tracker-loading-card" />
      <div className="tracker-card tracker-loading-card" />

      <span className="sr-only">
        Loading saved opportunities
      </span>
    </div>
  );
}

function TrackerEmptyState() {
  return (
    <div className="tracker-empty-state">
      <div
        className="tracker-empty-state__icon"
        aria-hidden="true"
      >
        ☆
      </div>

      <h2>Your tracker is ready</h2>

      <p>
        Save opportunities that interest you, and they will
        appear here automatically.
      </p>

      <a
        className="tracker-empty-state__link"
        href="/opportunities"
      >
        Find opportunities
      </a>
    </div>
  );
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatStatus(status) {
  if (!status) {
    return "Saved";
  }

  return status
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function getCompanyInitial(companyName) {
  return (
    companyName?.trim().charAt(0).toUpperCase() || "C"
  );
}

export default TrackerPage;