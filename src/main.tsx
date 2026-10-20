import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ?shot=1 disables animations so headless screenshots capture the settled state.
if (new URLSearchParams(window.location.search).has('shot')) document.documentElement.classList.add('no-anim')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
