import Hero from './pages/Hero'
import Home from './pages/Home'
import ScrollToHashElement from './components/ScrollElement'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Pricing from './pages/Pricing'
import { Toaster } from 'react-hot-toast'

import './index.css'  // ensure Tailwind is imported

function App() {
  return (
  <>
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: 'text-sm md:text-base font-semibold px-4 py-3 rounded-xl max-w-sm shadow-lg', 
        success: {
          className: 'bg-indigo-600 text-white text-base px-5 py-4 rounded-2xl shadow-lg',
        },
        error: {
          className: 'bg-red-600 text-white text-base px-5 py-4 rounded-2xl shadow-lg',
        },
      }}
    />
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

