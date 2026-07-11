function OpportunityCard({
  opportunity,
  isSaved,
  onToggleSave,
}) {
  const descriptionPreview = createDescriptionPreview(
    opportunity.description
  );

  const formattedDate = formatPublishedDate(
    opportunity.publishedAt
  );

  return (
    <article className="opportunity-card">
      <div className="opportunity-card__header">
        <div className="opportunity-card__company">
          {opportunity.companyLogo ? (
            <img
              className="opportunity-card__logo"
              src={opportunity.companyLogo}
              alt={`${opportunity.company} logo`}
            />
          ) : (
            <div
              className="opportunity-card__logo-placeholder"
              aria-hidden="true"
            >
              {getCompanyInitial(opportunity.company)}
            </div>
          )}

          <div>
            <p className="opportunity-card__company-name">
              {opportunity.company}
            </p>

            <h2 className="opportunity-card__title">
              {opportunity.title}
            </h2>
          </div>
        </div>

        <span className="opportunity-card__source">
          Via {opportunity.source}
        </span>
      </div>

      <div
        className="opportunity-card__details"
        aria-label="Opportunity details"
      >
        <span>{opportunity.location}</span>
        <span>{opportunity.jobType}</span>
        <span>{opportunity.salary}</span>

        {formattedDate && (
          <span>Posted {formattedDate}</span>
        )}
      </div>

      <p className="opportunity-card__description">
        {descriptionPreview}
      </p>

      <div className="opportunity-card__actions">
        <button
          className={`opportunity-save-button ${
            isSaved
              ? "opportunity-save-button--saved"
              : ""
          }`}
          type="button"
          aria-pressed={isSaved}
          onClick={() => onToggleSave(opportunity)}
        >
          {isSaved ? "Saved" : "Save opportunity"}
        </button>

        {opportunity.applicationUrl ? (
          <a
            className="opportunity-apply-link"
            href={opportunity.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View and apply externally
            <span aria-hidden="true"> ↗</span>
          </a>
        ) : (
          <span className="opportunity-apply-link opportunity-apply-link--disabled">
            Application link unavailable
          </span>
        )}
      </div>
    </article>
  );
}

function createDescriptionPreview(description) {
  if (!description) {
    return "No description is available for this opportunity.";
  }

  const plainText = stripHtml(description)
    .replace(/\s+/g, " ")
    .trim();

  const characterLimit = 240;

  if (plainText.length <= characterLimit) {
    return plainText;
  }

  return `${plainText.slice(0, characterLimit).trim()}…`;
}

function stripHtml(htmlText) {
  const temporaryElement = document.createElement("div");
  temporaryElement.innerHTML = htmlText;

  return temporaryElement.textContent || "";
}

function formatPublishedDate(dateValue) {
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

export default OpportunityCard;