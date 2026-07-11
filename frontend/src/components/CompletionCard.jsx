import Button from './Button'

function CompletionCard({ onContinue }) {
  return (
    <section
      className="guidance-card"
      aria-labelledby="session-complete-title"
    >
      <p className="guidance-card__label">Session Complete</p>

      <h2 id="session-complete-title">Nice work.</h2>

      <p>
        You took time to understand what an employer is asking for and
        identified how your current skills connect to the opportunity.
      </p>

      <div>
        <p className="guidance-card__detail-label">
          Here&apos;s your next best step
        </p>

        <p>
          Save one opportunity you want to revisit and add it to your tracker.
        </p>
      </div>

      <div className="guidance-card__actions">
        <Button onClick={onContinue}>Return to Today</Button>
      </div>
    </section>
  )
}

export default CompletionCard