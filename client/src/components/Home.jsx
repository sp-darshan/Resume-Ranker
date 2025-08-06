'use client'

import { SignedOut, SignedIn, useUser, useAuth } from '@clerk/clerk-react'
import Navbar from './Navbar'
import Hero from './Hero'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Upload } from 'lucide-react'


export default function Home() {
  const { user } = useUser()
  const { getToken } = useAuth()

  const [tokens, setTokens] = useState(0)
  const [pdfFile, setPdfFile] = useState(null)
  const [jobDesc, setJobDesc] = useState('')
  const [scoreData, setScoreData] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch token count from backend
  useEffect(() => {
    const fetchTokens = async () => {
      const token = await getToken()
      const res = await axios.get('http://localhost:5000/api/tokens', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTokens(res.data.tokens)
    }

    if (user) fetchTokens()
  }, [user])

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0])
  }

  const handleSubmit = async () => {
    if (!pdfFile) return alert("Please upload a resume.")
    setLoading(true)
    try {
      const token = await getToken()
      const formData = new FormData()
      formData.append('resume', pdfFile)
      formData.append('jobDesc', jobDesc)

      const res = await axios.post('http://localhost:5000/api/analyze', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      setScoreData(res.data)
    } catch (err) {
      console.error(err)
      alert("Analysis failed. You might be out of tokens.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />

      <SignedOut>
        <Hero />
      </SignedOut>

      <SignedIn>
        <div className="w-full min-h-[80vh] bg-gradient-to-br from-white to-gray-50 py-12 px-4 sm:px-8 flex justify-center">
          <div className="max-w-4xl w-full flex flex-col lg:flex-row gap-12 items-center">
            
            {/* Left Section - Text */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                Analyze Your Resume <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-500">in Seconds</span>
              </h1>
              <p className="mt-4 text-gray-600 text-lg">
                Upload your resume and get AI-powered feedback, ATS score, and suggestions to improve optionally tailored to a job description.
              </p>
              <p className="mt-4 text-sm text-indigo-600 font-semibold">
                Tokens Remaining: <span className="text-indigo-800">{tokens}</span>
              </p>
            </div>

            {/* Right Section - Form */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <Upload size={18} className="text-indigo-600" />
                  Upload your resume (PDF)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="border border-gray-300 rounded-md px-4 py-2 text-sm"
                />

                <label className="text-sm font-medium text-gray-700">Optional Job Description</label>
                <textarea
                  rows={4}
                  className="border border-gray-300 rounded-md px-4 py-2 text-sm"
                  placeholder="Paste the job description here..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                />

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="rounded-md bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-pink-600 hover:via-red-500 hover:to-yellow-500 text-center transition-all duration-300"
                >
                  {loading ? "Analyzing..." : "Analyze Resume (2 Tokens)"}
                </button>

                <a
                  href="/pricing"
                  className="text-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
                >
                  Need more tokens? See Pricing →
                </a>
              </div>

              {/* Score Section */}
              {scoreData && (
                <div className="mt-6 border border-gray-200 p-4 rounded-md bg-gray-50 animate-fade-in">
                  <h3 className="text-lg font-bold text-indigo-700">Score: {scoreData.score}/100</h3>
                  <p className="text-gray-700 mt-2 whitespace-pre-line">{scoreData.feedback}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SignedIn>

    </div>
  )
}
