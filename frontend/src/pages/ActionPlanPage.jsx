import { useEffect, useState } from 'react'

import Button from '../components/Button'
import PageCard from '../components/PageCard'
import {
  createActionItem,
  deleteActionItem,
  getActionItems,
  updateActionItem,
} from '../services/actionItemsApi'
import './MvpPages.css'

const starterTasks = [
  {
    title: 'Review saved opportunities',
    description:
      'Choose the strongest role in your tracker to focus on next.',
    status: 'pending',
    priority: 'high',
    estimatedMinutes: 15,
  },
  {
    title: 'Tailor your resume',
    description:
      'Align your summary, skills, and project examples with the role.',
    status: 'pending',
    priority: 'high',
    estimatedMinutes: 30,
  },
  {
    title: 'Research the company',
    description:
      'Identify the company mission, product, and values.',
    status: 'pending',
    priority: 'medium',
    estimatedMinutes: 20,
  },
  {
    title: 'Prepare one interview story',
    description:
      'Practice a concise story about ownership, learning, or problem-solving.',
    status: 'pending',
    priority: 'medium',
    estimatedMinutes: 20,
  },
  {
    title: 'Submit or follow up',
    description:
      'Complete one concrete application-related action.',
    status: 'pending',
    priority: 'high',
    estimatedMinutes: 15,
  },
]

function ActionPlanPage() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isResetting, setIsResetting] = useState(false)
  const [updatingTaskId, setUpdatingTaskId] =
    useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadActionItems() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const actionItems = await getActionItems()

        if (isMounted) {
          setTasks(actionItems)
        }
      } catch (error) {
        console.error(
          'Unable to load action items:',
          error
        )

        if (isMounted) {
          setErrorMessage(
            error.message ||
              'Unable to load your action plan.'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadActionItems()

    return () => {
      isMounted = false
    }
  }, [])

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length

  const progressPercentage =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedCount / tasks.length) * 100
        )

  const nextUnfinishedTask = tasks.find(
    (task) => !task.completed
  )

  async function handleToggleTask(task) {
    const nextStatus = task.completed
      ? 'pending'
      : 'completed'

    try {
      setUpdatingTaskId(task.id)
      setErrorMessage('')

      const updatedTask = await updateActionItem(
        task.id,
        {
          status: nextStatus,
        }
      )

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updatedTask.id
            ? updatedTask
            : currentTask
        )
      )
    } catch (error) {
      console.error(
        'Unable to update action item:',
        error
      )

      setErrorMessage(
        error.message ||
          'Unable to update this action item.'
      )
    } finally {
      setUpdatingTaskId(null)
    }
  }

  async function handleResetPlan() {
    try {
      setIsResetting(true)
      setErrorMessage('')

      await Promise.all(
        tasks.map((task) =>
          deleteActionItem(task.id)
        )
      )

      const createdTasks = []

      for (const starterTask of starterTasks) {
        const createdTask =
          await createActionItem(starterTask)

        createdTasks.push(createdTask)
      }

      setTasks(createdTasks)
    } catch (error) {
      console.error(
        'Unable to reset action plan:',
        error
      )

      setErrorMessage(
        error.message ||
          'Unable to create the starter action plan.'
      )

      try {
        const currentTasks = await getActionItems()
        setTasks(currentTasks)
      } catch (refreshError) {
        console.error(
          'Unable to refresh action items:',
          refreshError
        )
      }
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="mvp-page action-plan-page">
      <header className="mvp-page__header">
        <p className="mvp-page__eyebrow">
          Focused momentum
        </p>

        <h1>Your action plan</h1>

        <p className="mvp-page__intro">
          Complete a small set of high-value job-search
          actions instead of trying to do everything at
          once.
        </p>
      </header>

      {errorMessage && (
        <div className="mvp-callout" role="alert">
          <h3>Something needs your attention</h3>
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="mvp-page__grid mvp-page__grid--two-column">
        <PageCard
          title="This week’s priorities"
          description="Check off each action as you complete it."
        >
          {isLoading ? (
            <div className="mvp-callout">
              <h3>Loading your action plan</h3>
              <p>
                We’re retrieving your saved actions from
                Career Companion.
              </p>
            </div>
          ) : (
            <>
              <div className="action-plan__progress">
                <div className="action-plan__progress-copy">
                  <strong>
                    {completedCount} of {tasks.length}{' '}
                    complete
                  </strong>

                  <span>
                    {progressPercentage}% progress
                  </span>
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

              {tasks.length === 0 ? (
                <div className="mvp-callout">
                  <h3>Your plan is ready to begin</h3>

                  <p>
                    Create your starter plan to add five
                    focused job-search actions to your
                    account.
                  </p>
                </div>
              ) : (
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
                        disabled={
                          updatingTaskId === task.id ||
                          isResetting
                        }
                        onChange={() =>
                          handleToggleTask(task)
                        }
                      />

                      <span className="action-item__copy">
                        <strong>{task.title}</strong>

                        <span>
                          {task.description ||
                            'No description provided.'}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <div className="form-actions">
                <Button
                  onClick={handleResetPlan}
                  disabled={isResetting}
                >
                  {isResetting
                    ? 'Building your plan...'
                    : tasks.length === 0
                      ? 'Create starter plan'
                      : 'Reset action plan'}
                </Button>
              </div>
            </>
          )}
        </PageCard>

        <PageCard
          title="Today’s focus"
          description="Use the plan to protect your attention."
        >
          <div className="mvp-callout">
            <h3>
              {tasks.length === 0
                ? 'Create your starter plan'
                : completedCount === tasks.length
                  ? 'Plan complete'
                  : 'Choose the next unfinished action'}
            </h3>

            <p>
              {tasks.length === 0
                ? 'Your starter plan will give you five clear actions to begin building momentum.'
                : completedCount === tasks.length
                  ? 'You completed every action in this plan. Reset it when you are ready to begin another cycle.'
                  : nextUnfinishedTask
                    ? `Your next best step is: ${nextUnfinishedTask.title}. Focus on this one action before moving to the next.`
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
              <dd>
                {tasks.length - completedCount}
              </dd>
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

export default ActionPlanPage