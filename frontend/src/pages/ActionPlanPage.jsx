import { useState } from 'react'

import Button from '../components/Button'
import PageCard from '../components/PageCard'
import './MvpPages.css'

const ACTION_PLAN_STORAGE_KEY =
  'career-companion-action-plan'

const initialTasks = [
  {
    id: 1,
    title: 'Review saved opportunities',
    description:
      'Choose the strongest role in your tracker to focus on next.',
    completed: false,
  },
  {
    id: 2,
    title: 'Tailor your resume',
    description:
      'Align your summary, skills, and project examples with the role.',
    completed: false,
  },
  {
    id: 3,
    title: 'Research the company',
    description:
      'Identify the company mission, product, and values.',
    completed: false,
  },
  {
    id: 4,
    title: 'Prepare one interview story',
    description:
      'Practice a concise story about ownership, learning, or problem-solving.',
    completed: false,
  },
  {
    id: 5,
    title: 'Submit or follow up',
    description:
      'Complete one concrete application-related action.',
    completed: false,
  },
]

function ActionPlanPage() {
  const [tasks, setTasks] = useState(() => loadTasks())

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length

  const progressPercentage =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedCount / tasks.length) * 100
        )

  function handleToggleTask(taskId) {
    setTasks((currentTasks) => {
      const updatedTasks = currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )

      saveTasks(updatedTasks)
      return updatedTasks
    })
  }

  function handleResetPlan() {
    const resetTasks = initialTasks.map((task) => ({
      ...task,
    }))

    saveTasks(resetTasks)
    setTasks(resetTasks)
  }

  return (
    <div className="mvp-page action-plan-page">
      <header className="mvp-page__header">
        <p className="mvp-page__eyebrow">
          Focused momentum
        </p>

        <h1>Your action plan</h1>

        <p className="mvp-page__intro">
          Complete a small set of high-value job-search actions
          instead of trying to do everything at once.
        </p>
      </header>

      <div className="mvp-page__grid mvp-page__grid--two-column">
        <PageCard
          title="This week’s priorities"
          description="Check off each action as you complete it."
        >
          <div className="action-plan__progress">
            <div className="action-plan__progress-copy">
              <strong>
                {completedCount} of {tasks.length} complete
              </strong>

              <span>{progressPercentage}% progress</span>
            </div>

            <div
              className="action-plan__progress-track"
              aria-hidden="true"
            >
              <div
                className="action-plan__progress-fill"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="action-list">
            {tasks.map((task) => (
              <label
                className={`action-item ${
                  task.completed
                    ? 'action-item--complete'
                    : ''
                }`}
                key={task.id}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() =>
                    handleToggleTask(task.id)
                  }
                />

                <span className="action-item__copy">
                  <strong>{task.title}</strong>
                  <span>{task.description}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="form-actions">
            <Button onClick={handleResetPlan}>
              Reset action plan
            </Button>
          </div>
        </PageCard>

        <PageCard
          title="Today’s focus"
          description="Use the plan to protect your attention."
        >
          <div className="mvp-callout">
            <h3>
              {completedCount === tasks.length
                ? 'Plan complete'
                : 'Choose the next unfinished action'}
            </h3>

            <p>
              {completedCount === tasks.length
                ? 'You completed every action in this plan. Reset it when you are ready to begin another cycle.'
                : 'Work on one task at a time. Completing a focused action is more valuable than starting five different tasks.'}
            </p>
          </div>

          <dl className="summary-list">
            <div>
              <dt>Completed</dt>
              <dd>{completedCount}</dd>
            </div>

            <div>
              <dt>Remaining</dt>
              <dd>{tasks.length - completedCount}</dd>
            </div>

            <div>
              <dt>Overall progress</dt>
              <dd>{progressPercentage}%</dd>
            </div>
          </dl>
        </PageCard>
      </div>
    </div>
  )
}

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(
      ACTION_PLAN_STORAGE_KEY
    )

    if (!savedTasks) {
      return initialTasks.map((task) => ({
        ...task,
      }))
    }

    const parsedTasks = JSON.parse(savedTasks)

    return Array.isArray(parsedTasks)
      ? parsedTasks
      : initialTasks
  } catch (error) {
    console.error('Unable to load action plan:', error)

    return initialTasks.map((task) => ({
      ...task,
    }))
  }
}

function saveTasks(tasks) {
  localStorage.setItem(
    ACTION_PLAN_STORAGE_KEY,
    JSON.stringify(tasks)
  )
}

export default ActionPlanPage