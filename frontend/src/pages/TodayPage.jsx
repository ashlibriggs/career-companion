import Greeting from '../components/Greeting'
import GuidanceCard from '../components/GuidanceCard'
import ProgressSummary from '../components/ProgressSummary'

function TodayPage() {
  return (
    <div className="today-page">
      <Greeting />

      <div className="today-page__content">
        <GuidanceCard />
        <ProgressSummary />
      </div>
    </div>
  )
}

export default TodayPage