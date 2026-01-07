import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { TournamentProvider } from './context/TournamentContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/score">
      <TournamentProvider>
        <App />
      </TournamentProvider>
    </BrowserRouter>
  </StrictMode>,
)
