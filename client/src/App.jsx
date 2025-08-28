import Hero from './components/Hero'
import Home from './components/Home'
import ScrollToHashElement from './components/ScrollElement'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Pricing from './components/Pricing'

import './index.css'  // ensure Tailwind is imported

function App() {
  return (
  <>
    <ScrollToHashElement />
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/upload" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />
    </Routes>
  </> 
  )
}

export default App

