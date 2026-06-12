'use client'

import Navbar from '../components/Navbar.jsx'
import Hero from './Hero.jsx'
import { useState } from 'react'
import axios from 'axios'
import { Upload } from 'lucide-react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { useAuthToken } from '../contexts/AuthTokenContext.jsx'
import PageLoadingScreen from '../components/PageLoadingScreen.jsx'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null)
  const [jdFile, setJdFile] = useState(null)
  const [jobDesc, setJobDesc] = useState('')
  const [lloading, setLoading] = useState(false)
  const { isSignedIn, user } = useUser()
  const { tokens, loading: tokenLoading, jwt, updateTokens, refreshTokens } = useAuthToken()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const showTokenLoading = isSignedIn && tokenLoading

  if (showTokenLoading) {
    return (
      <div className='bg-violet-50 min-h-screen'>
        <Navbar />

        <div className="w-full min-h-[calc(100vh-5rem)] px-4 sm:px-8 pt-28 sm:pt-32 flex items-center justify-center">
          <PageLoadingScreen
            title="Loading your resume workspace"
            subtitle="Fetching your token balance and preparing the upload experience."
            fullScreen={false}
          />
        </div>
      </div>
    )
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    const isAllowedResume = /\.(pdf|docx)$/i.test(selectedFile.name)
    if (!isAllowedResume) {
      e.target.value = ''
      toast.error('Please upload a PDF or DOCX resume only.')
      return
    }

    setPdfFile(selectedFile)
  }

  const handleJdFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    const isAllowedJd = /\.(pdf|docx)$/i.test(selectedFile.name)
    if (!isAllowedJd) {
      e.target.value = ''
      toast.error('Please upload a PDF or DOCX JD only.')
      return
    }

    setJdFile(selectedFile)
  }

  const handleSubmit = async () => {
    if (!pdfFile) return toast.error("Please upload a resume.")
    if (!isSignedIn) return toast.error("Please sign in first.")
    if ((tokens ?? 0) < 2) return toast.error("Insufficient tokens.")

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('resume', pdfFile)
      if (jobDesc.trim()) {
        formData.append('jobDescriptionText', jobDesc.trim())
      }
      if (jdFile) {
        formData.append('jobDescriptionFile', jdFile)
      }

      // Call analyze API - tokens will be deducted in backend after successful analysis
      const freshToken = await getToken()

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/analyze`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${freshToken}`
          }
        }
      )

      if (res.status === 200 && res.data?.analysis) {
        const { analysis, analysisId, remainingTokens } = res.data

        if (analysis.overall_score !== null && analysis.overall_score !== undefined) {
          // Update tokens immediately with the value returned from backend
          if (remainingTokens !== undefined) {
            updateTokens(remainingTokens)
          } else {
            // Fallback: refresh tokens from server
            await refreshTokens()
          }

          toast.success('Analysis completed successfully!')
          navigate(analysisId ? `/dashboard/${analysisId}` : '/dashboard')
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

      <div className="w-full min-h-screen px-4 sm:px-8 pt-18 flex justify-center items-centernpm">
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
          <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 mb-5 sm:mb-0 sm:p-8 w-full max-w-md">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                  <Upload size={18} className="text-indigo-600" />
                  Upload your resume (PDF or Word)
                </label>

                {/* Hidden native input */}
                <input
                  id="resumeUpload"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Custom upload button */}
                <label
                  htmlFor="resumeUpload"
                  className="cursor-pointer flex items-center justify-center rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 px-4 py-2 text-sm text-gray-700 shadow-sm transition-all duration-200"
                >
                  {pdfFile ? <p className="text-xs text-black-500 font-medium truncate"> {pdfFile.name} </p> : 'Choose Resume File'}
                </label>

              </div>
              <div className="flex flex-col gap-3 mb-5">
                <label className="text-sm font-medium text-gray-700">Job Description (optional)</label>
                <textarea
                  rows={4}
                  className="border border-gray-300 rounded-md px-4 py-2 text-sm"
                  placeholder="Paste the job description here..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                />

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Upload size={18} className="text-indigo-600" />
                      Or upload JD (PDF or DOCX)
                  </label>

                  <input
                    id="jdUpload"
                    type="file"
                      accept=".pdf,.docx"
                    onChange={handleJdFileChange}
                    className="hidden"
                  />

                  <label
                    htmlFor="jdUpload"
                    className="cursor-pointer flex items-center justify-center rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 px-4 py-2 text-sm text-gray-700 shadow-sm transition-all duration-200"
                  >
                    {jdFile ? <p className="text-xs text-black-500 font-medium truncate"> {jdFile.name} </p> : 'Choose JD File'}
                  </label>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={lloading || !isSignedIn || (tokens ?? 0) < 2}
                className="rounded-md bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-pink-600 hover:via-red-500 hover:to-yellow-500 text-center transition-all duration-300"
              >
                {lloading ? "Analyzing..." : !isSignedIn ? "Sign in" : (tokens ?? 0) < 2 ? "Insufficient Tokens" : "Analyze Resume (2 tokens)"}
              </button>

              <a href='/pricing' className='text-xs block text-center text-violet-500'>Need Tokens ?</a>
              <p className="text-xs text-center text-slate-500">
                Your saved analysis will open in the dashboard after processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}