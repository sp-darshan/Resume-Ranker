'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isSignedIn } = useUser()  

  return (
    <div className="w-full">
      {/* Top Nav */}
      <header className="w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between w-full max-w-8xl mx-auto">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-0.5">
            <img
              src="/cv.png"
              alt="CV Icon"
              className="w-10 h-10"
            />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-800 via-indigo-700 to-violet-500 bg-clip-text text-transparent">
              ResumeRanker
            </span>
          </a>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-black-500">
            <a href="/" className="hover:text-indigo-600 font-semibold">Home</a>
            <a href="/#features" className="hover:text-indigo-600 font-semibold">Features</a>
            <a href="#pricing" className="hover:text-indigo-600 font-semibold">Pricing</a>
            <a href="/#contact" className="hover:text-indigo-600 font-semibold">Contact Us</a>

            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="rounded-md bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-500 px-4.5 py-2 text-sm font-semibold text-white shadow-sm hover:from-pink-600 hover:via-red-500 hover:to-yellow-500 transition-all duration-300">
                  Login
                </button>
              </SignInButton>
            )}
            
            {isSignedIn && <UserButton signOutRedirectUrl="/"/>}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="rounded-md bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-pink-600 hover:via-red-500 hover:to-yellow-500 transition-all duration-300">
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
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}
      >
        <nav className="flex flex-col gap-4 px-6 text-sm font-medium text-gray-800">
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact Us</a>
        </nav>
      </div>
    </div>
  )
}
