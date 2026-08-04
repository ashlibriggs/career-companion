import { useEffect, useState } from 'react'

import CompletionCard from '../components/CompletionCard'
import Greeting from '../components/Greeting'
import GuidanceCard from '../components/GuidanceCard'
import GuidedSession from '../components/GuidedSession'
import ProgressSummary from '../components/ProgressSummary'
import {
  getActionItems,
  updateActionItem,
} from '../services/actionItemsApi'
import { getRecommendation } from '../services/recommendationApi'

function TodayPage() {
  const [sessionStage, setSessionStage] = useState('ready')

  const [actionItems, setActionItems] = useState([])
  const [isProgressLoading, setIsProgressLoading] =
    useState(true)
  const [progressErrorMessage, setProgressErrorMessage] =
    useState('')

  const [recommendation, setRecommendation] =
    useState(null)
  const [
    isRecommendationLoading,
    setIsRecommendationLoading,
  ] = useState(true)
  const [
    recommendationErrorMessage,
    setRecommendationErrorMessage,
  ] = useState('')

  const [isCompletingSession, setIsCompletingSession] =
    useState(false)
  const [
    sessionCompletionError,
    setSessionCompletionError,
  ] = useState('')

  async function loadActionItems({
    showLoading = true,
  } = {}) {
    try {
      if (showLoading) {
        setIsProgressLoading(true)
      }

      setProgressErrorMessage('')

      const items = await getActionItems()
      setActionItems(items)

      return items
    } catch (error) {
      setProgressErrorMessage(
        error.message ||
          'We could not load your progress right now.',
      )

      throw error
    } finally {
      if (showLoading) {
        setIsProgressLoading(false)
      }
    }
  }

  async function loadRecommendation({
    showLoading = true,
  } = {}) {
    try {
      if (showLoading) {
        setIsRecommendationLoading(true)
      }

      setRecommendationErrorMessage('')

      const nextRecommendation =
        await getRecommendation()

      setRecommendation(nextRecommendation)

      return nextRecommendation
    } catch (error) {
      setRecommendationErrorMessage(
        error.message ||
          'We could not load your personalized recommendation right now.',
      )

      throw error
    } finally {
      if (showLoading) {
        setIsRecommendationLoading(false)
      }
    }
  }

  useEffect(() => {
    async function loadTodayPage() {
      const results = await Promise.allSettled([
        loadActionItems(),
        loadRecommendation(),
      ])

      results.forEach((result) => {
        if (result.status === 'rejected') {
          console.error(result.reason)
        }
      })
    }

    loadTodayPage()
  }, [])

  async function handleCompleteSession() {
    try {
      setIsCompletingSession(true)
      setSessionCompletionError('')

      const actionItemId =
        recommendation?.evidence?.action_item_id

      const isActionItemRecommendation =
        recommendation?.rule ===
          'complete_action_item' &&
        actionItemId

      if (isActionItemRecommendation) {
        await updateActionItem(actionItemId, {
          status: 'completed',
        })
      }

      const refreshResults =
        await Promise.allSettled([
          loadActionItems({
            showLoading: false,
          }),
          loadRecommendation({
            showLoading: false,
          }),
        ])

      const refreshFailure = refreshResults.find(
        (result) => result.status === 'rejected',
      )

      if (refreshFailure) {
        throw refreshFailure.reason
      }

      setSessionStage('complete')
    } catch (error) {
      setSessionCompletionError(
        error.message ||
          'We could not save your progress. Please try again.',
      )
    } finally {
      setIsCompletingSession(false)
    }
  }

  function renderSessionStage() {
    if (sessionStage === 'active') {
      return (
        <GuidedSession
          onComplete={handleCompleteSession}
          onBack={() => {
            setSessionCompletionError('')
            setSessionStage('ready')
          }}
          isCompleting={isCompletingSession}
          errorMessage={sessionCompletionError}
        />
      )
    }

    if (sessionStage === 'complete') {
      return (
        <CompletionCard
          onContinue={() =>
            setSessionStage('ready')
          }
        />
      )
    }

    return (
      <GuidanceCard
        recommendation={recommendation}
        isLoading={isRecommendationLoading}
        errorMessage={recommendationErrorMessage}
        onBegin={() => {
          setSessionCompletionError('')
          setSessionStage('active')
        }}
      />
    )
  }

  const completedCount = actionItems.filter(
    (item) => item.status === 'completed',
  ).length

  return (
    <div className="today-page">
      <Greeting />

      <div className="today-page__content">
        {renderSessionStage()}

        <ProgressSummary
          completedCount={completedCount}
          totalCount={actionItems.length}
          isLoading={isProgressLoading}
          errorMessage={progressErrorMessage}
        />
      </div>
    </div>
  )
}

export default TodayPage