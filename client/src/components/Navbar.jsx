'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import { useLocation } from 'react-router-dom'
import { useAuthToken } from '../contexts/AuthTokenContext.jsx'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isSignedIn } = useUser()  
  const location = useLocation()
  const { tokens, loading } = useAuthToken()

  const showTokens = isSignedIn && (location.pathname === '/upload' || location.pathname === '/pricing')

  return (
    <div className="w-full">
      {/* Top Nav */}
      <header className="w-full fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-md shadow-lg px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between w-full max-w-8xl mx-auto">
          
          {/* Logo (aligned left for both desktop + mobile) */}
          <a href="/" className="flex items-center pl-2 sm:pl-24 gap-2">
            <img
              src="/cv.png"
              alt="CV Icon"
              className="w-9 h-9 sm:w-10 sm:h-10"
            />
            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-800 via-indigo-700 to-violet-500 bg-clip-text text-transparent">
              ResumeRanker
            </span>
          </a>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm pr-2 sm:pr-24 font-medium text-black-500">
            <a href="/" className="hover:text-indigo-600 font-semibold">Home</a>
            <a href="/#features" className="hover:text-indigo-600 font-semibold">Features</a>
            <a href="/pricing" className="hover:text-indigo-600 font-semibold">Pricing</a>
            <a href="/#contact" className="hover:text-indigo-600 font-semibold">Contact Us</a>

            {showTokens && (
              <span className="font-bold text-indigo-600">
                Tokens: {loading ? '...' : tokens ?? 0}
              </span>
            )}

            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="rounded-md bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-500 px-4.5 py-2 text-sm font-semibold text-white shadow-sm hover:from-pink-600 hover:via-red-500 hover:to-yellow-500 transition-all duration-300">
                  Login
                </button>
              </SignInButton>
            )}
            
            {isSignedIn && <UserButton signOutRedirectUrl="/"/>}
          </nav>

          {/* Mobile Menu Button (right side) */}
          <div className="flex items-center gap-3 md:hidden">
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="rounded-md bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:from-pink-600 hover:via-red-500 hover:to-yellow-500 transition-all duration-300">
                  Login
                </button>
              </SignInButton>
            )}

            {isSignedIn && <UserButton signOutRedirectUrl="/"/>}

            <button className="text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Collapsible Mobile Menu */}
      <div
        className={`md:hidden fixed top-[64px] left-0 w-full bg-white/80 backdrop-blur-md shadow-md transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <nav className="flex flex-col gap-4 px-6 py-4 text-sm font-medium text-gray-800">
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="/#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="/#contact" onClick={() => setMenuOpen(false)}>Contact Us</a>
        </nav>
      </div>
    </div>
  )
}
