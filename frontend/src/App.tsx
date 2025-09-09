"use client"

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
import { PromptPage } from "./pages/PromptPage"
import ComparisonPage from "./pages/ComparisonPage"
import HelpPage from "./pages/HelpPage"
import WarPage from "./pages/PromptWars"
import BuilderPage from "./pages/PromptBuilder"
import ProfilePage from "./pages/ProfilePage"
import SocialPage from "./pages/SocialPage"
import OptimizerPage from "./pages/OptimizerPage"
import OptimizerWizard from "./pages/OptimizerWizard"
import PromptWarsPage from "./pages/PromptWars"



function App() {
  const location = useLocation()
    const hideHeaderRoutes = ['/','/login','/help', '/war','/register','/forgot-password','/login/','/optimizer','/wizard','/prompt-wars', '/prompt-wars/game']
    const shouldHideHeader = hideHeaderRoutes.some(route => location.pathname === route || location.pathname.startsWith(route + '/'))

  return (
    <div className="min-h-screen w-full flex flex-col">
      {!shouldHideHeader && <Header />}
      <main className="flex-1 w-full flex flex-col">
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
          <Route path="/prompt/:id" element={<PromptPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/war" element={<WarPage />} />
          <Route path="/prompt-wars/game/:gameId" element={<PromptWarsPage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/optimizer" element={<OptimizerPage />} />
          <Route path="/wizard" element={<OptimizerWizard />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
