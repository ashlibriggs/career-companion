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
      'Practice a concise story about ownership, learning, or problem solving.',
    status: 'pending',
    priority: 'medium',
    estimatedMinutes: 20,
  },
  {
    title: 'Submit or follow up',
    description:
      'Complete one concrete application related action.',
    status: 'pending',
    priority: 'high',
    estimatedMinutes: 15,
  },
]

function ActionPlanPage() {
  const [tasks, setTasks] = useState([])

  const [newActionTitle, setNewActionTitle] =
    useState('')
  const [
    newActionDescription,
    setNewActionDescription,
  ] = useState('')

  const [editingTaskId, setEditingTaskId] =
    useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] =
    useState('')

  const [taskPendingDelete, setTaskPendingDelete] =
    useState(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] =
    useState(false)
  const [isSavingEdit, setIsSavingEdit] =
    useState(false)
  const [isResetting, setIsResetting] =
    useState(false)

  const [updatingTaskId, setUpdatingTaskId] =
    useState(null)
  const [deletingTaskId, setDeletingTaskId] =
    useState(null)

  const [errorMessage, setErrorMessage] =
    useState('')

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

  const isPageBusy =
    isCreating ||
    isSavingEdit ||
    isResetting ||
    deletingTaskId !== null

  async function handleCreateAction(event) {
    event.preventDefault()

    const cleanedTitle = newActionTitle.trim()
    const cleanedDescription =
      newActionDescription.trim()

    if (!cleanedTitle) {
      setErrorMessage(
        'Enter a title before adding an action.'
      )
      return
    }

    try {
      setIsCreating(true)
      setErrorMessage('')

      const createdTask = await createActionItem({
        title: cleanedTitle,
        description: cleanedDescription || null,
        status: 'pending',
        priority: 'medium',
      })

      setTasks((currentTasks) => [
        createdTask,
        ...currentTasks,
      ])

      setNewActionTitle('')
      setNewActionDescription('')
    } catch (error) {
      console.error(
        'Unable to create action item:',
        error
      )

      setErrorMessage(
        error.message ||
          'Unable to add this action.'
      )
    } finally {
      setIsCreating(false)
    }
  }

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

  function handleStartEdit(task) {
    setEditingTaskId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description || '')
    setErrorMessage('')
  }

  function handleCancelEdit() {
    setEditingTaskId(null)
    setEditTitle('')
    setEditDescription('')
  }

  async function handleSaveEdit(event, taskId) {
    event.preventDefault()

    const cleanedTitle = editTitle.trim()
    const cleanedDescription =
      editDescription.trim()

    if (!cleanedTitle) {
      setErrorMessage(
        'The action title cannot be empty.'
      )
      return
    }

    try {
      setIsSavingEdit(true)
      setErrorMessage('')

      const updatedTask = await updateActionItem(
        taskId,
        {
          title: cleanedTitle,
          description:
            cleanedDescription || null,
        }
      )

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updatedTask.id
            ? updatedTask
            : currentTask
        )
      )

      handleCancelEdit()
    } catch (error) {
      console.error(
        'Unable to save action item changes:',
        error
      )

      setErrorMessage(
        error.message ||
          'Unable to save your changes.'
      )
    } finally {
      setIsSavingEdit(false)
    }
  }

  function handleRequestDelete(task) {
    setTaskPendingDelete(task)
    setErrorMessage('')
  }

  function handleCancelDelete() {
    setTaskPendingDelete(null)
  }

  async function handleConfirmDelete() {
    if (!taskPendingDelete) {
      return
    }

    try {
      setDeletingTaskId(taskPendingDelete.id)
      setErrorMessage('')

      await deleteActionItem(taskPendingDelete.id)

      setTasks((currentTasks) =>
        currentTasks.filter(
          (currentTask) =>
            currentTask.id !== taskPendingDelete.id
        )
      )

      if (editingTaskId === taskPendingDelete.id) {
        handleCancelEdit()
      }

      setTaskPendingDelete(null)
    } catch (error) {
      console.error(
        'Unable to delete action item:',
        error
      )

      setErrorMessage(
        error.message ||
          'Unable to delete this action.'
      )
    } finally {
      setDeletingTaskId(null)
    }
  }

  async function handleResetPlan() {
    const shouldReset =
      tasks.length === 0 ||
      window.confirm(
        'Resetting will replace your current actions with the five starter actions. Continue?'
      )

    if (!shouldReset) {
      return
    }

    try {
      setIsResetting(true)
      setErrorMessage('')
      handleCancelEdit()

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
        const currentTasks =
          await getActionItems()

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
          Complete a small set of high value job search
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
          description="Create, complete, and manage the actions that matter most."
        >
          <form
            className="action-plan-form"
            onSubmit={handleCreateAction}
          >
            <div className="action-plan-form__field">
              <label htmlFor="action-title">
                Action title
              </label>

              <input
                id="action-title"
                type="text"
                value={newActionTitle}
                onChange={(event) =>
                  setNewActionTitle(
                    event.target.value
                  )
                }
                placeholder="Example: Update my LinkedIn headline"
                maxLength={200}
                disabled={isPageBusy}
              />
            </div>

            <div className="action-plan-form__field">
              <label htmlFor="action-description">
                Description
                <span> Optional</span>
              </label>

              <textarea
                id="action-description"
                value={newActionDescription}
                onChange={(event) =>
                  setNewActionDescription(
                    event.target.value
                  )
                }
                placeholder="Add a short note about what success looks like."
                rows={3}
                disabled={isPageBusy}
              />
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                disabled={isPageBusy}
              >
                {isCreating
                  ? 'Adding action...'
                  : 'Add action'}
              </Button>
            </div>
          </form>

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
                  <h3>
                    Your plan is ready to begin
                  </h3>

                  <p>
                    Add your own action or create a
                    starter plan with five focused job
                    search priorities.
                  </p>
                </div>
              ) : (
                <div className="action-list">
                  {tasks.map((task) => (
                    <div
                      className={`action-item ${
                        task.completed
                          ? 'action-item--complete'
                          : ''
                      }`}
                      key={task.id}
                    >
                      {editingTaskId === task.id ? (
                        <form
                          className="action-item__edit-form"
                          onSubmit={(event) =>
                            handleSaveEdit(
                              event,
                              task.id
                            )
                          }
                        >
                          <div className="form-field">
                            <label
                              htmlFor={`edit-title-${task.id}`}
                            >
                              Action title
                            </label>

                            <input
                              id={`edit-title-${task.id}`}
                              type="text"
                              value={editTitle}
                              onChange={(event) =>
                                setEditTitle(
                                  event.target.value
                                )
                              }
                              maxLength={200}
                              disabled={isSavingEdit}
                            />
                          </div>

                          <div className="form-field">
                            <label
                              htmlFor={`edit-description-${task.id}`}
                            >
                              Description
                            </label>

                            <textarea
                              id={`edit-description-${task.id}`}
                              value={editDescription}
                              onChange={(event) =>
                                setEditDescription(
                                  event.target.value
                                )
                              }
                              rows={3}
                              disabled={isSavingEdit}
                            />
                          </div>

                          <div className="form-actions">
                            <Button
                              type="submit"
                              disabled={isSavingEdit}
                            >
                              {isSavingEdit
                                ? 'Saving...'
                                : 'Save changes'}
                            </Button>

                            <button
                              type="button"
                              className="text-button"
                              onClick={
                                handleCancelEdit
                              }
                              disabled={isSavingEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <input
                            className="action-item__checkbox"
                            type="checkbox"
                            aria-label={`Mark ${task.title} as ${
                              task.completed
                                ? 'incomplete'
                                : 'complete'
                            }`}
                            checked={task.completed}
                            disabled={
                              updatingTaskId ===
                                task.id ||
                              isPageBusy
                            }
                            onChange={() =>
                              handleToggleTask(task)
                            }
                          />

                          <span className="action-item__copy">
                            <strong>
                              {task.title}
                            </strong>

                            <span>
                              {task.description ||
                                'No description provided.'}
                            </span>
                          </span>

                          <div className="action-item__controls">
                            <button
                              type="button"
                              className="text-button"
                              onClick={() =>
                                handleStartEdit(task)
                              }
                              disabled={isPageBusy}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="text-button text-button--danger"
                              onClick={() =>
                                handleRequestDelete(task)
                              }
                              disabled={isPageBusy}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="form-actions">
                <Button
                  onClick={handleResetPlan}
                  disabled={isPageBusy}
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
                ? 'Create your action plan'
                : completedCount === tasks.length
                  ? 'Plan complete'
                  : 'Choose the next unfinished action'}
            </h3>

            <p>
              {tasks.length === 0
                ? 'Add one meaningful action or use the starter plan to begin building momentum.'
                : completedCount === tasks.length
                  ? 'You completed every action in this plan. Add a new priority when you are ready for your next step.'
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

      {taskPendingDelete && (
        <div
          className="confirmation-modal"
          role="presentation"
          onMouseDown={handleCancelDelete}
        >
          <section
            className="confirmation-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-action-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <p className="mvp-page__eyebrow">
              Confirm deletion
            </p>

            <h2 id="delete-action-title">
              Remove this action?
            </h2>

            <p>
              “{taskPendingDelete.title}” will be
              permanently removed from your action plan.
            </p>

            <div className="confirmation-modal__actions">
              <button
                type="button"
                className="text-button"
                onClick={handleCancelDelete}
                disabled={
                  deletingTaskId ===
                  taskPendingDelete.id
                }
              >
                Keep action
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={handleConfirmDelete}
                disabled={
                  deletingTaskId ===
                  taskPendingDelete.id
                }
              >
                {deletingTaskId ===
                taskPendingDelete.id
                  ? 'Deleting...'
                  : 'Delete action'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default ActionPlanPage