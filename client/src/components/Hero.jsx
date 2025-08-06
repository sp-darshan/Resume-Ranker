'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useUser, SignInButton } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

const cardData = [
    { id: 'left', src: '/Hero1.jpg', alt: 'Resume 1' },
    { id: 'center', src: '/Hero2.jpg', alt: 'Resume 2' },
    { id: 'right', src: '/Hero3.png', alt: 'Resume 3' },
]

export default function Hero() {
  const [hovered, setHovered] = useState('center')
  const { isSignedIn } = useUser()
  const navigate = useNavigate()

  const zMap = {
    center: 20,
    left: 10,
    right: 10,
  }

    return (
      <div className="relative isolate px-6 pt-6 lg:px-8">
        <div className="mx-auto max-w-7xl py-20 sm:py-24 lg:py-24 flex flex-col lg:flex-row items-center gap-10">

          {/* Mobile view: Single centered image */}
          <div className="sm:hidden w-full flex justify-center mt-4">
            <img
              src="/Hero2.jpg"
              alt="Resume Preview"
              className="w-64 h-[380px] object-cover rounded-xl border border-gray-300 bg-white shadow-lg"
            />
          </div>

          <div className="hidden sm:flex lg:hidden justify-center gap-4 mt-4"
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
              Boost Your Resume’s <span className="bg-gradient-to-r from-blue-800 via-indigo-700 to-violet-500 bg-clip-text text-transparent font-bold">ATS Score</span> Instantly
            </h1>
            <p className="mt-6 text-lg text-gray-600 sm:text-xl">
              Our AI-powered analyzer ensures your resume gets noticed by Applicant Tracking Systems (ATS). Upload, scan, and optimize in seconds.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {isSignedIn ? (
                <button
                  onClick={() => {
                    const element = document.getElementById("resume-section")
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" })
                    } else {
                      navigate("/") // fallback route
                    }
                  }}
                  className="rounded-md bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-pink-600 hover:via-red-500 hover:to-yellow-500 text-center transition-all duration-300"
                >
                  Upload your Resume
                </button>
              ) : (
                <SignInButton mode="modal" redirectUrl="/">
                  <button className="rounded-md bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-pink-600 hover:via-red-500 hover:to-yellow-500 text-center transition-all duration-300">
                    Upload your Resume
                  </button>
                </SignInButton>
              )}

              <a href="#" className="mt-2 text-sm font-bold text-gray-900 text-center">
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
      </div>
    )
}
