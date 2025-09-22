/** ⛔⛔⛔   ℂẢℕℍ 𝔹Á𝕆 — ĐỌℂ 𝔽𝕀𝕃𝔼 README 𝕋ℝướℂ 𝕂ℍ𝕀 ℂ𝕆𝔻𝔼   ⛔⛔⛔ */

import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
