'use client'

import Navbar from '../components/Navbar.jsx'
import Hero from './Hero.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Upload } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { useAuthToken } from '../contexts/AuthTokenContext.jsx'
import AnalysisResult from '../components/AnalysisResult.jsx'
import toast from 'react-hot-toast'

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null)
  const [jobDesc, setJobDesc] = useState('')
  const [scoreData, setScoreData] = useState(null)
  const [lloading, setLoading] = useState(false)
  const { isSignedIn, user } = useUser()
  const { tokens, loading: tokenLoading, jwt, updateTokens, refreshTokens } = useAuthToken()

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0])
  }

  const handleSubmit = async () => {
    if (!pdfFile) return toast.error("Please upload a resume.")
    if (!isSignedIn) return toast.error("Please sign in first.")
    if ((tokens ?? 0) < 2) return toast.error("Insufficient tokens.")

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('resume', pdfFile)
      formData.append('jobDescription', jobDesc)

      // Call analyze API - tokens will be deducted in backend after successful analysis
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/analyze`,
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${jwt}`
          } 
        }
      )

      if (res.status === 200 && res.data?.analysis) {
        const { analysis, remainingTokens } = res.data

        if (analysis.overall_score !== null && analysis.overall_score !== undefined) {
          // Update UI with analysis results
          setScoreData(analysis)
          
          // Update tokens immediately with the value returned from backend
          if (remainingTokens !== undefined) {
            updateTokens(remainingTokens)
          } else {
            // Fallback: refresh tokens from server
            await refreshTokens()
          }

          toast.success('Analysis completed successfully!')
        } else {
          throw new Error("Invalid analysis result — no score found.")
        }
      }
    } catch (err) {
      console.error("Error:", err)
      
      // If it's a token-related error, refresh token count
      if (err.response?.status === 400 || err.response?.status === 404) {
        await refreshTokens()
      }
      
      toast.error(err.response?.data?.message || err.message || "Analysis failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='bg-violet-50'>
      <Navbar />

      <div className="w-full min-h-screen py-32 px-4 sm:px-8 flex justify-center pt-28 sm:pt-32">
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
            <span className={`mt-2 block font-bold ${tokens === 0 ? 'text-red-600' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-500'}`}>
              Tokens: {tokenLoading ? '...' : tokens ?? 0}
            </span>
          </div>

          {/* Right Section - Form */}
          <div className="flex-1 bg-white rounded-2xl shadow-xl p-8 w-full max-w-md min-h-[400px]">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                  <Upload size={18} className="text-indigo-600" />
                  Upload your resume (PDF)
                </label>

                {/* Hidden native input */}
                <input
                  id="resumeUpload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Custom upload button */}
                <label
                  htmlFor="resumeUpload"
                  className="cursor-pointer flex items-center justify-center rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 px-4 py-2 text-sm text-gray-700 shadow-sm transition-all duration-200"
                >
                  {pdfFile ? <p className="text-xs text-black-500 font-medium truncate"> {pdfFile.name} </p> : 'Choose File'}
                </label>

              </div>
              <label className="text-sm font-medium mb-2 text-gray-700">Job Description (optional) </label>
              <textarea
                rows={4}
                className="border border-gray-300 rounded-md px-4 py-2 mb-5 text-sm"
                placeholder="Paste the job description here..."
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
              />

              <button
                onClick={handleSubmit}
                disabled={lloading || !isSignedIn || (tokens ?? 0) < 2}
                className="rounded-md bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-pink-600 hover:via-red-500 hover:to-yellow-500 text-center transition-all duration-300"
              >
                {lloading ? "Analyzing..." : !isSignedIn ? "Sign in" : (tokens ?? 0) < 2 ? "Insufficient Tokens" : "Analyze Resume (2 tokens)"}
              </button>

              <a href='/pricing' className='text-xs block text-center text-violet-500'>Need Tokens ?</a>
            </div>

            {/* Analysis Result section */}
            <AnalysisResult
              scoreData={scoreData}
              onClose={() => setScoreData(null)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}