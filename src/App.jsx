/** ⛔⛔⛔   ℂẢℕℍ 𝔹Á𝕆 — ĐỌℂ 𝔽𝕀𝕃𝔼 README 𝕋ℝướℂ 𝕂ℍ𝕀 ℂ𝕆𝔻𝔼   ⛔⛔⛔ */

import { Button } from "@/components/ui/button"
import { Routes, Route } from 'react-router-dom'
import PromotionManagement from "./components/ui/Dashboard/PromotionManagement"
import Dashboard from './components/ui/Dashboard/Dashboard.jsx'

function App() {
  return (
    <Routes>
      <Route path="/Dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App