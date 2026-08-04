import Button from './Button'

const DEFAULT_RECOMMENDATION = {
  title:
    'Find one entry-level opportunity that matches your current skills.',
  description: '',
  coachingMessage: '',
  whyThisMatters:
    'Reviewing one relevant opportunity helps you understand what employers are requesting without overwhelming you with an entire job search.',
  estimatedMinutes: 20,
  aiEnhanced: false,
}

function GuidanceCard({
  onBegin,
  recommendation,
  isLoading = false,
  errorMessage = '',
}) {
  function handleViewAllNextSteps() {
    window.location.href = '/action-plan'
  }

  const displayedRecommendation =
    recommendation || DEFAULT_RECOMMENDATION

  const title = isLoading
    ? 'Preparing a clear next step for today...'
    : displayedRecommendation.title

  const estimatedMinutes =
    displayedRecommendation.estimatedMinutes || 15

  const explanation =
    displayedRecommendation.coachingMessage ||
    displayedRecommendation.whyThisMatters ||
    displayedRecommendation.description ||
    DEFAULT_RECOMMENDATION.whyThisMatters

  return (
    <section
      className="guidance-card guidance-card--focus"
      aria-labelledby="next-best-step-title"
      aria-busy={isLoading}
    >
      <div className="guidance-card__focus-header">
        <div>
          <p className="guidance-card__ai-label">
            <span
              className="guidance-card__sparkle"
              aria-hidden="true"
            >
              ✦
            </span>

            Career Companion AI
          </p>

          <p className="guidance-card__focus-label">
            Today&apos;s Focus
          </p>
        </div>

        <div className="guidance-card__time">
          <p className="guidance-card__detail-label">
            Estimated Time
          </p>

          <p>
            {isLoading
              ? 'Just a moment'
              : `${estimatedMinutes} minute session`}
          </p>
        </div>
      </div>

      <div className="guidance-card__focus-content">
        <h2 id="next-best-step-title">
          {title}
        </h2>

        {!isLoading &&
          displayedRecommendation.description && (
            <p className="guidance-card__description">
              {displayedRecommendation.description}
            </p>
          )}
      </div>

      <div className="guidance-card__divider" />

      <div className="guidance-card__reasoning">
        <p className="guidance-card__detail-label">
          Why This Matters
        </p>

        <p>
          {isLoading
            ? 'Career Companion is reviewing your profile, resume, saved opportunities, and action plan.'
            : explanation}
        </p>
      </div>

      {errorMessage && (
        <p
          className="guidance-card__notice"
          role="status"
        >
          Your personalized recommendation could not be
          refreshed, so a starter recommendation is shown
          instead.
        </p>
      )}

      <div className="guidance-card__actions">
        <Button
          onClick={onBegin}
          disabled={isLoading}
        >
          {isLoading ? 'Preparing...' : 'Begin'}
        </Button>

        <Button
          variant="secondary"
          onClick={handleViewAllNextSteps}
        >
          View All Next Steps
        </Button>
      </div>
    </section>
  )
}

export default GuidanceCard