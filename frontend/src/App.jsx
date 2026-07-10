import { Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout'
import TodayPage from './pages/TodayPage'
import OpportunitiesPage from './pages/OpportunitiesPage'
import TrackerPage from './pages/TrackerPage'
import ResumePage from './pages/ResumePage'
import ActionPlanPage from './pages/ActionPlanPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<TodayPage />} />
        <Route path="opportunities" element={<OpportunitiesPage />} />
        <Route path="tracker" element={<TrackerPage />} />
        <Route path="resume" element={<ResumePage />} />
        <Route path="action-plan" element={<ActionPlanPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}

export default App