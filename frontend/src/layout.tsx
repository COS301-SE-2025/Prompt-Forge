import { Outlet } from "react-router-dom"
import "./styles/globals.css"
import { ThemeProvider } from "./components/theme-provider"

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <ThemeProvider defaultTheme="dark" storageKey="prompt-forge-theme">
        <Outlet />
      </ThemeProvider>
    </div>
  )
}
