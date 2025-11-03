'use client'

import Navbar from './Navbar'
import Hero from './Hero'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Upload } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { useClerkJwtAndCredits } from '../contexts/useClerkJwt'
import { useToken } from '../contexts/useToken'  // adjust the path if different


export default function Home() {
  const [pdfFile, setPdfFile] = useState(null)
  const [jobDesc, setJobDesc] = useState('')
  const [scoreData, setScoreData] = useState(null)
  const [lloading, setLoading] = useState(false)
  const { isSignedIn, user } = useUser()
  const { credits, loading } = useClerkJwtAndCredits() 
  const { deductTokens, fetchTokens, loading: tokenLoading, error: tokenError } = useToken()


  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0])
  }

  const handleSubmit = async () => {
    if (!pdfFile) return alert("Please upload a resume.")
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('resume', pdfFile)
      formData.append('jobDescription', jobDesc) // must match backend field name

      // Step 1: Call your new backend API first
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/analyze`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      if (res.status === 200 && res.data?.analysis) {
        const { score, comment } = res.data.analysis;

        if (score !== null && score !== undefined) {
          // deduct tokens only if valid
          const tokenRes = await deductTokens(2);
          if (!tokenRes.success) {
            alert(`Token deduction failed: ${tokenRes.error || 'Unknown error'}`);
          }

          setScoreData({ score, feedback: comment });
          await fetchTokens();
        } else {
          alert("Resume analysis failed — invalid score.");
        }
      }
    } catch (err) {
      console.error("Error in analysis:", err)
      alert("Analysis failed. Please try again.")
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
            <span className={`mt-2 block font-bold ${credits === 0 ? 'text-red-600' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-500'}`}>
              Tokens: {loading ? '...' : credits ?? 0}
            </span>
          </div>

          {/* Right Section - Form */}
          <div className="flex-1 bg-white rounded-2xl shadow-xl p-8 w-full max-w-md min-h-[400px]">
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-2 mb-2 text-sm text-gray-700">
                <Upload size={18} className="text-indigo-600" />
                Upload your resume (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="border border-gray-300 rounded-md px-4 mb-2 py-2 text-sm"
              />

              <label className="text-sm font-medium mb-2 text-gray-700">Optional Job Description</label>
              <textarea
                rows={4}
                className="border border-gray-300 rounded-md px-4 py-2 mb-5 text-sm"
                placeholder="Paste the job description here..."
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
              />

              <button
                onClick={handleSubmit}
                disabled={lloading || tokenLoading}
                className="rounded-md bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-pink-600 hover:via-red-500 hover:to-yellow-500 text-center transition-all duration-300"
              >
                {lloading || tokenLoading ? "Processing..." : "Analyze Resume"}
              </button>

              <a href='/pricing' className='text-xs block text-center text-violet-500'>Need Tokens ?</a>
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
    </div>
  )
}
