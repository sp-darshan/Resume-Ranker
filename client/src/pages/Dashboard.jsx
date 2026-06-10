'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth, useUser, SignInButton } from '@clerk/clerk-react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import AnalysisResult from '../components/AnalysisResult.jsx'
import PageLoadingScreen from '../components/PageLoadingScreen.jsx'
import { useAuthToken } from '../contexts/AuthTokenContext.jsx'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { analysisId } = useParams()
  const navigate = useNavigate()
  const { isSignedIn } = useUser()
  const { getToken } = useAuth()
  const { loading: tokenLoading } = useAuthToken()
  const [analyses, setAnalyses] = useState([])
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)
  const [listLoading, setListLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  useEffect(() => {
    const loadAnalyses = async () => {
      if (!isSignedIn || tokenLoading) {
        setListLoading(false)
        return
      }

      setListLoading(true)
      setError('')

      try {
        const token = await getToken()
        if (!token) return

        const response = await axios.get(`${backendUrl}/api/analyses`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const items = response.data?.analyses || []
        setAnalyses(items)

        if (!analysisId && items[0]?._id) {
          navigate(`/dashboard/${items[0]._id}`, { replace: true })
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load saved analyses')
      } finally {
        setListLoading(false)
      }
    }

    loadAnalyses()
  }, [analysisId, backendUrl, getToken, isSignedIn, navigate, tokenLoading])

  useEffect(() => {
    const loadAnalysisDetail = async () => {
      if (!isSignedIn || tokenLoading) return

      if (!analysisId) {
        setSelectedAnalysis(null)
        return
      }

      setDetailLoading(true)
      try {
        const token = await getToken()
        if (!token) return

        const response = await axios.get(`${backendUrl}/api/analyses/${analysisId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        setSelectedAnalysis(response.data?.analysis || null)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load that analysis')
        setSelectedAnalysis(null)
      } finally {
        setDetailLoading(false)
      }
    }

    loadAnalysisDetail()
  }, [analysisId, backendUrl, getToken, isSignedIn, tokenLoading])

  const handleDeleteAnalysis = async (targetAnalysisId) => {
    setDeletingId(targetAnalysisId)
    try {
      const token = await getToken()
      if (!token) return

      await axios.delete(`${backendUrl}/api/analyses/${targetAnalysisId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const nextAnalyses = analyses.filter((item) => item._id !== targetAnalysisId)
      setAnalyses(nextAnalyses)
      toast.success('Analysis deleted')

      if (analysisId === targetAnalysisId) {
        setSelectedAnalysis(null)
        navigate(nextAnalyses[0]?._id ? `/dashboard/${nextAnalyses[0]._id}` : '/dashboard', { replace: true })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to delete analysis')
    } finally {
      setDeletingId('')
    }
  }

  if (tokenLoading || listLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="px-4 sm:px-8 pt-28 sm:pt-32">
          <PageLoadingScreen
            title="Loading your dashboard"
            subtitle="Fetching your saved resume analyses."
            fullScreen={false}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="px-4 sm:px-8 pt-28 sm:pt-32 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-indigo-500 font-semibold">Dashboard</p>
              <h1 className="mt-2 text-3xl sm:text-5xl font-extrabold text-slate-900">Saved resume analyses</h1>
              <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-600">
                Open any stored result, review the score breakdown, and compare earlier uploads without rerunning the model.
              </p>
            </div>

            <a
              href="/upload"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-[1.02]"
            >
              Analyze new resume
            </a>
          </div>

          {!isSignedIn ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl text-center">
              <h2 className="text-2xl font-bold text-slate-900">Sign in to view saved analyses</h2>
              <p className="mt-2 text-slate-600">Your dashboard is tied to your Clerk account.</p>
              <div className="mt-6">
                <SignInButton mode="modal">
                  <button className="rounded-full bg-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 transition-colors">
                    Sign in
                  </button>
                </SignInButton>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
              {error}
            </div>
          ) : analyses.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-xl text-center">
              <h2 className="text-2xl font-bold text-slate-900">No saved analyses yet</h2>
              <p className="mt-3 text-slate-600">Run your first resume analysis and it will be stored here automatically.</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-lg font-bold text-slate-900">History</h2>
                  <p className="text-sm text-slate-500">{analyses.length} saved analysis{analyses.length === 1 ? '' : 'es'}</p>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                  {analyses.map((analysis) => {
                    const isActive = analysisId === analysis._id
                    const label = `Analysis ${analysis.analysisNumber ?? analyses.length - analyses.findIndex((item) => item._id === analysis._id)}`
                    return (
                      <div
                        key={analysis._id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/dashboard/${analysis._id}`)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            navigate(`/dashboard/${analysis._id}`)
                          }
                        }}
                        className={`block w-full cursor-pointer border-b border-slate-100 px-5 py-4 text-left transition-colors hover:bg-slate-50 ${
                          isActive ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900 truncate">{label}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {analysis.createdAt ? new Date(analysis.createdAt).toLocaleDateString() : 'Recent upload'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                              {analysis.overallScore ?? 'N/A'}
                            </span>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleDeleteAnalysis(analysis._id)
                              }}
                              disabled={deletingId === analysis._id}
                              className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingId === analysis._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </aside>

              <section>
                {detailLoading ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                    Loading analysis...
                  </div>
                ) : selectedAnalysis ? (
                  <AnalysisResult analysisData={selectedAnalysis} />
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                    <h2 className="text-2xl font-bold text-slate-900">Select an analysis</h2>
                    <p className="mt-2 text-slate-600">Choose a saved run from the history panel to view the full breakdown.</p>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}