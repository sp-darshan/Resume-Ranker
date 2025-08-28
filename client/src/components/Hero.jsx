'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { FaBrain, FaBolt, FaChartBar } from "react-icons/fa";
import Features from './Features'
import Contact from './ContactUs'
import Navbar from './Navbar'
import HowItWorks from './HowItWorks'

const cardData = [
  { id: 'left', src: '/Hero1.jpg', alt: 'Resume 1' },
  { id: 'center', src: '/Hero2.jpg', alt: 'Resume 2' },
  { id: 'right', src: '/Hero3.png', alt: 'Resume 3' },
]

export default function Hero() {
  const [hovered, setHovered] = useState('center')
  const navigate = useNavigate()
  const { isSignedIn } = useUser()
  const { openSignIn } = useClerk() // Added to open modal programmatically

  const zMap = {
    center: 20,
    left: 10,
    right: 10,
  }

  // Handler for Upload button
  const handleUploadClick = () => {
    if (isSignedIn) {
      navigate('/upload')
    } else {
      openSignIn({ redirectUrl: '/upload' })
    }
  }

  return (
    <div className="relative isolate">
      <Navbar />

      <main className="pt-20 px-6 bg-violet-50 lg:px-8">
        <div className="mx-auto max-w-7xl py-20 sm:py-24 lg:py-24 flex flex-col lg:flex-row items-center gap-10">

          {/* Mobile view: Single centered image */}
          <div className="sm:hidden w-full flex justify-center mt-4">
            <img
              src="/Hero2.jpg"
              alt="Resume Preview"
              className="w-64 h-[380px] object-cover rounded-xl border border-gray-300 bg-white shadow-lg"
            />
          </div>

          {/* Tablet view: stacked animated images */}
          <div
            className="hidden sm:flex lg:hidden justify-center gap-4 mt-4"
            onMouseLeave={() => setHovered('center')}
          >
            {cardData.map((card) => {
              const isHovered = hovered === card.id
              return (
                <motion.div
                  key={card.id}
                  onMouseEnter={() => setHovered(card.id)}
                  className="relative cursor-pointer"
                  animate={{
                    scale: isHovered ? 1.15 : 1,
                    y: isHovered ? -10 : 0,
                    zIndex: isHovered ? 20 : zMap[card.id],
                    rotate: isHovered ? 0 : card.id === 'left' ? -2 : card.id === 'right' ? 2 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  style={{
                    boxShadow: isHovered ? '0 12px 24px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  <img
                    src={card.src}
                    alt={card.alt}
                    className="w-40 h-60 object-cover rounded-xl border border-gray-300 bg-white"
                  />
                </motion.div>
              )
            })}
          </div>

          {/* Text Section */}
          <div className="text-center lg:text-left lg:w-1/2">
            <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-6xl">
              Boost Your Resume’s{" "}
              <span className="bg-gradient-to-r from-blue-800 via-indigo-700 to-violet-500 bg-clip-text text-transparent font-bold">
                ATS Score
              </span>{" "}
              Instantly
            </h1>
            <p className="mt-6 text-lg text-gray-600 sm:text-xl">
              Our AI-powered analyzer ensures your resume gets noticed by Applicant Tracking Systems (ATS). Upload, scan, and optimize in seconds.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={handleUploadClick} // Updated to handle modal + redirect
                className="rounded-md bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-pink-600 hover:via-red-500 hover:to-yellow-500 text-center transition-all duration-300"
              >
                Upload your Resume
              </button>

              <a href="/#how-it-works" className="mt-2 text-sm font-bold text-gray-900 text-center">
                How it works →
              </a>
            </div>
          </div>

          {/* Desktop view: Animated cards */}
          <div
            className="hidden lg:flex lg:w-1/2 relative h-[400px] items-center justify-center"
            onMouseLeave={() => setHovered('center')}
          >
            {cardData.map((card) => {
              let baseX = 0
              if (card.id === 'left') baseX = -180
              if (card.id === 'right') baseX = 180

              const isHovered = hovered === card.id

              return (
                <motion.div
                  key={card.id}
                  onMouseEnter={() => setHovered(card.id)}
                  className="absolute cursor-pointer"
                  animate={{
                    scale: isHovered ? 1.2 : 0.9,
                    x: isHovered ? 0 : baseX,
                    zIndex: isHovered ? 30 : zMap[card.id],
                    rotate: isHovered ? 0 : card.id === 'left' ? -5 : 5,
                  }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  style={{
                    boxShadow: isHovered ? '0 12px 24px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  <img
                    src={card.src}
                    alt={card.alt}
                    className="w-72 h-[400px] object-cover rounded-xl border border-gray-300 bg-white"
                  />
                </motion.div>
              )
            })}
          </div>
        </div>

        <HowItWorks />

        <section id='features' className="mt-15 mb-5 py-20">
          {/* Heading & Subtitle */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Powerful Features for <span className="text-indigo-600">Smart Hiring</span>
            </h2>
            <p className="mt-6 text-lg text-gray-600">
              Our AI-powered platform transforms the way you evaluate candidates, making
              hiring faster, smarter, and more effective than ever before.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-8 px-6 md:grid-cols-3 max-w-6xl mx-auto">
            <Features
              icon={<FaBrain />}
              title="AI-Powered Analysis"
              description="Advanced machine learning algorithms analyze resumes for skills, experience, and job fit with unmatched accuracy."
            />
            <Features
              icon={<FaBolt />}
              title="Instant Rankings"
              description="Get real-time resume rankings and scores within seconds of upload. No more manual screening delays."
            />
            <Features
              icon={<FaChartBar />}
              title="Detailed Analytics"
              description="Comprehensive reports with match percentages, skill gaps, and improvement suggestions for each candidate."
            />
          </div>
        </section>
        
        <Contact />
      </main>

    </div>
  )
}
