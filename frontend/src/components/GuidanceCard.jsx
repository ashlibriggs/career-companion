import Button from './Button' 


function GuidanceCard() {
  return (
    <section className="guidance-card" aria-labelledby="next-best-step-title">
      <p className="guidance-card__label">Your Next Best Step</p>

      <h2 id="next-best-step-title">
        Find one entry-level opportunity that matches your current skills.
      </h2>

      <div className="guidance-card__details">
        <div>
          <p className="guidance-card__detail-label">Estimated Time</p>
          <p>20 minutes</p>
        </div>

        <div>
          <p className="guidance-card__detail-label">Why This Matters</p>
          <p>
            Reviewing one relevant opportunity helps you understand what
            employers are requesting without overwhelming you with an entire
            job search.
          </p>
        </div>
      </div>

      <div className="guidance-card__actions">
  <Button>Begin</Button>

<Button variant="secondary">
  View All Next Steps
</Button>
      </div>
    </section>
  )
}

export default GuidanceCard