import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./styles/index.css"
import { ThemeProvider } from "./components/theme-provider"
import { GoogleOAuthProvider } from "@react-oauth/google"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark">
        <GoogleOAuthProvider clientId="1042356002829-220hqtgm6scuhhke4stc52bib8q6gk1s.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
