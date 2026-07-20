function ProgressSummary({
  completedCount = 0,
  totalCount = 0,
  isLoading = false,
  errorMessage = '',
}) {
  const progressPercentage =
    totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0

  function getProgressMessage() {
    if (totalCount === 0) {
      return 'Your action plan is ready when you are.'
    }

    if (completedCount === totalCount) {
      return 'Amazing work—you completed every career action!'
    }

    if (completedCount === 0) {
      return 'Your next focused step can start your momentum.'
    }

    return 'You’re building momentum—one focused step at a time.'
  }

  return (
    <section
      className="progress-summary"
      aria-labelledby="weekly-progress-title"
    >
      <div>
        <p className="progress-summary__label">Action Plan Progress</p>

        {isLoading ? (
          <h2 id="weekly-progress-title">
            Loading your career progress...
          </h2>
        ) : errorMessage ? (
          <h2 id="weekly-progress-title">
            Your progress is temporarily unavailable.
          </h2>
        ) : (
          <h2 id="weekly-progress-title">
            You completed {completedCount} of {totalCount} career{' '}
            {totalCount === 1 ? 'action' : 'actions'}.
          </h2>
        )}
      </div>

      {!isLoading && !errorMessage && (
        <>
          <div
            className="progress-summary__track"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax={totalCount}
            aria-valuenow={completedCount}
            aria-label={`${completedCount} of ${totalCount} career actions completed`}
          >
            <div
              className="progress-summary__fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <p className="progress-summary__encouragement">
            {getProgressMessage()}
          </p>
        </>
      )}

      {errorMessage && (
        <p className="progress-summary__encouragement" role="alert">
          {errorMessage}
        </p>
      )}
    </section>
  )
}

export default ProgressSummary