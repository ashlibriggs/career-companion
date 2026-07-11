import { useState } from 'react'

import CompletionCard from '../components/CompletionCard'
import Greeting from '../components/Greeting'
import GuidanceCard from '../components/GuidanceCard'
import GuidedSession from '../components/GuidedSession'
import ProgressSummary from '../components/ProgressSummary'

function TodayPage() {
  const [sessionStage, setSessionStage] = useState('ready')

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

  return (
    <div className="today-page">
      <Greeting />

      <div className="today-page__content">
        {renderSessionStage()}
        <ProgressSummary />
      </div>
    </div>
  )
}

export default TodayPage