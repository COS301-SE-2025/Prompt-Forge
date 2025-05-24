import { Routes, Route, useLocation } from "react-router-dom"
import Header from "./components/Header"
import LoginPage from "./pages/LoginPage" // Rename this import
import DashboardPage from "./pages/DashBoardPage"
import EditorPage from "./pages/EditorPage"
import MarketplacePage from "./pages/MarketplacePage"
import MyPromptsPage from "./pages/MyPromptsPage"
import CommunityPage from "./pages/CommunityPage"
import HomePage from "./pages/HomePage" // Add this new import
import ProfileSettingsPage from "./pages/ProfileSettingsPage"

function App() {
  const location = useLocation()
  const hideHeaderRoutes = ['/'] // Add other routes where you want to hide header

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/my-prompts" element={<MyPromptsPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/home" element={<HomePage />} /> {/* Change route path */}
        <Route path="/profile-settings" element={<ProfileSettingsPage />} />
      </Routes>
    </>
  )
}

export default App
