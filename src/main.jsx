/** ⛔⛔⛔   ℂẢℕℍ 𝔹Á𝕆 — ĐỌℂ 𝔽𝕀𝕃𝔼 README 𝕋ℝướℂ 𝕂ℍ𝕀 ℂ𝕆𝔻𝔼   ⛔⛔⛔ */

import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
