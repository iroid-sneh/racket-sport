import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { LocationProvider } from "@/contexts/location-context"
import App from "./App"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LocationProvider>
        <App />
      </LocationProvider>
    </BrowserRouter>
  </StrictMode>,
)
