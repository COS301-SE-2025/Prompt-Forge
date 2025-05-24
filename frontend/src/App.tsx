import { Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import HomePage from "./pages/HomePage"
import DashboardPage from "./pages/DashBoardPage"
import EditorPage from "./pages/EditorPage"
import MarketplacePage from "./pages/MarketplacePage"
import MyPromptsPage from "./pages/MyPromptsPage"
import CommunityPage from "./pages/CommunityPage"
import FeaturesPage from "./pages/FeaturesPage"
import ProfileSettingsPage from "./pages/ProfileSettingsPage"

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/my-prompts" element={<MyPromptsPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/profile-settings" element={<ProfileSettingsPage />} />
      </Routes>
    </>
  )
}

export default App
