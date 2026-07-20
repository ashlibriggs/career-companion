import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import TodayPage from "./pages/TodayPage";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import TrackerPage from "./pages/TrackerPage";
import ResumePage from "./pages/ResumePage";
import ActionPlanPage from "./pages/ActionPlanPage";
import ProfilePage from "./pages/ProfilePage";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<TodayPage />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route path="tracker" element={<TrackerPage />} />
          <Route path="resume" element={<ResumePage />} />
          <Route path="action-plan" element={<ActionPlanPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Unknown Routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;