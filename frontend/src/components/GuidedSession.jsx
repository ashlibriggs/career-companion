import Button from './Button'

function GuidedSession({
  onComplete,
  onBack,
  isCompleting = false,
  errorMessage = '',
}) {
  return (
    <section
      className="guidance-card"
      aria-labelledby="guided-session-title"
      aria-busy={isCompleting}
    >
      <p className="guidance-card__label">
        Guided Session
      </p>

      <h2 id="guided-session-title">
        Let&apos;s focus on one opportunity together.
      </h2>

      <p>
        Read the job description carefully. Highlight three
        required skills you already have and one skill
        you&apos;d like to continue developing.
      </p>

      <p>
        Don&apos;t worry about applying yet. Today&apos;s goal
        is simply to build confidence by understanding what
        employers are asking for.
      </p>

      {errorMessage && (
        <p role="alert">
          {errorMessage}
        </p>
      )}

      <div className="guidance-card__actions">
        <Button
          onClick={onComplete}
          disabled={isCompleting}
        >
          {isCompleting
            ? 'Saving Progress...'
            : 'Complete Session'}
        </Button>

        <Button
          variant="secondary"
          onClick={onBack}
          disabled={isCompleting}
        >
          Back to Today
        </Button>
      </div>
    </section>
  )
}

export default GuidedSession