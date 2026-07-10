function ProgressSummary() {
  return (
    <section
      className="progress-summary"
      aria-labelledby="weekly-progress-title"
    >
      <div>
        <p className="progress-summary__label">Weekly Progress</p>
        <h2 id="weekly-progress-title">You completed 3 of 5 career actions.</h2>
      </div>

      <div
        className="progress-summary__track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="5"
        aria-valuenow="3"
        aria-label="Three of five weekly actions completed"
      >
        <div className="progress-summary__fill" />
      </div>

      <p className="progress-summary__encouragement">
        You&apos;re building momentum—one focused step at a time.
      </p>
    </section>
  )
}

export default ProgressSummary