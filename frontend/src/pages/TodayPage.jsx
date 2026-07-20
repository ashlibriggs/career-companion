import { useEffect, useState } from 'react'

import CompletionCard from '../components/CompletionCard'
import Greeting from '../components/Greeting'
import GuidanceCard from '../components/GuidanceCard'
import GuidedSession from '../components/GuidedSession'
import ProgressSummary from '../components/ProgressSummary'
import { getActionItems } from '../services/actionItemsApi'

function TodayPage() {
  const [sessionStage, setSessionStage] = useState('ready')
  const [actionItems, setActionItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadActionItems() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const items = await getActionItems()
        setActionItems(items)
      } catch (error) {
        setErrorMessage(
          error.message || 'We could not load your progress right now.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadActionItems()
  }, [])

  function renderSessionStage() {
    if (sessionStage === 'active') {
      return (
        <GuidedSession
          onComplete={() => setSessionStage('complete')}
        />
      )
    }

    if (sessionStage === 'complete') {
      return (
        <CompletionCard
          onContinue={() => setSessionStage('ready')}
        />
      )
    }

    return (
      <GuidanceCard
        onBegin={() => setSessionStage('active')}
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
          isLoading={isLoading}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  )
}

export default TodayPage