import { useEffect, useState } from "react";
import {
  getSavedOpportunities,
  removeSavedOpportunity,
} from "../utils/savedOpportunities";
import "./TrackerPage.css";

function TrackerPage() {
  const [savedOpportunities, setSavedOpportunities] = useState([]);

  useEffect(() => {
    setSavedOpportunities(getSavedOpportunities());
  }, []);

  function handleRemoveOpportunity(opportunityId) {
    const updatedOpportunities =
      removeSavedOpportunity(opportunityId);

    setSavedOpportunities(updatedOpportunities);
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
          <strong>{savedOpportunities.length}</strong>

          <span>
            {savedOpportunities.length === 1
              ? "saved opportunity"
              : "saved opportunities"}
          </span>
        </div>
      </header>

      {savedOpportunities.length === 0 ? (
        <TrackerEmptyState />
      ) : (
        <div className="tracker-list">
          {savedOpportunities.map((opportunity) => (
            <TrackerOpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onRemove={handleRemoveOpportunity}
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
          {opportunity.trackerStatus || "Saved"}
        </span>
      </div>

      <div className="tracker-card__details">
        <span>{opportunity.location}</span>
        <span>{opportunity.jobType}</span>
        <span>{opportunity.salary}</span>
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
          <dd>{opportunity.source || "External listing"}</dd>
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
          onClick={() => onRemove(opportunity.id)}
        >
          Remove from tracker
        </button>
      </div>
    </article>
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

function getCompanyInitial(companyName) {
  return companyName?.trim().charAt(0).toUpperCase() || "C";
}

export default TrackerPage;