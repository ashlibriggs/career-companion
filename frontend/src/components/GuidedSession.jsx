import Button from './Button'

function GuidedSession({ onComplete }) {
  return (
    <section
      className="guidance-card"
      aria-labelledby="guided-session-title"
    >
      <p className="guidance-card__label">Guided Session</p>

      <h2 id="guided-session-title">
        Let&apos;s focus on one opportunity together.
      </h2>

      <p>
        Read the job description carefully. Highlight three required skills
        you already have and one skill you&apos;d like to continue developing.
      </p>

      <p>
        Don&apos;t worry about applying yet. Today&apos;s goal is simply to
        build confidence by understanding what employers are asking for.
      </p>

      <div className="guidance-card__actions">
        <Button onClick={onComplete}>Complete Session</Button>
      </div>
    </section>
  )
}

export default GuidedSession