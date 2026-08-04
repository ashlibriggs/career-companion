import Button from './Button'

function CompletionCard({ onContinue }) {
  return (
    <section
      className="guidance-card"
      aria-labelledby="session-complete-title"
    >
      <p className="guidance-card__label">
        Session Complete
      </p>

      <h2 id="session-complete-title">
        Nice work.
      </h2>

      <p>
        Your progress has been saved and Career Companion has
        reviewed your updated action plan.
      </p>

      <div>
        <p className="guidance-card__detail-label">
          Your next focus is ready
        </p>

        <p>
          Return to Today to see the next manageable step based
          on your current progress.
        </p>
      </div>

      <div className="guidance-card__actions">
        <Button onClick={onContinue}>
          Return to Today
        </Button>
      </div>
    </section>
  )
}

export default CompletionCard