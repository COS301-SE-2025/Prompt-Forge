import { Routes, Route, useLocation } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import Header from "./components/Header"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashBoardPage"
import EditorPage from "./pages/EditorPage"
import MarketplacePage from "./pages/MarketplacePage"
import MyPromptsPage from "./pages/MyPromptsPage"
import CommunityPage from "./pages/CommunityPage"
import SubmitPromptPage from "./pages/SubmitPromptPage"
import HomePage from "./pages/HomePage"
import ProfileSettingsPage from "./pages/ProfileSettingsPage"
import UnderConstructionPage from "./pages/UnderConstructionPage"
import CartPage from "./pages/CartPage"
import ComparisonPage from "./pages/ComparisonPage"

function App() {
  const location = useLocation()
  const hideHeaderRoutes = ['/','/login']

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/my-prompts" element={<MyPromptsPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile-settings" element={<ProfileSettingsPage />} />
          <Route path="/construction" element={<UnderConstructionPage />} />
          <Route path="/submit" element={<SubmitPromptPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
