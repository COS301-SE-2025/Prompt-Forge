import { Routes, Route, useLocation } from "react-router-dom"
import Header from "./components/Header"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashBoardPage"
import EditorPage from "./pages/EditorPage"
import MarketplacePage from "./pages/MarketplacePage"
import MyPromptsPage from "./pages/MyPromptsPage"
import CommunityPage from "./pages/CommunityPage"
import HomePage from "./pages/HomePage"
import ProfileSettingsPage from "./pages/ProfileSettingsPage"
import UnderConstructionPage from "./pages/UnderConstructionPage"

function App() {
  const location = useLocation()
  const hideHeaderRoutes = ['/']

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/my-prompts" element={<MyPromptsPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile-settings" element={<ProfileSettingsPage />} />
          <Route path="/construction" element={<UnderConstructionPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
