'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ResumeResultModal({ scoreData, onClose }) {
  if (!scoreData) return null

  return (
    <AnimatePresence>
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4 sm:px-6"
      >
        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="
            relative w-full max-w-2xl max-h-[85vh]
            rounded-2xl shadow-2xl bg-white text-gray-800
            overflow-hidden
            mx-4 sm:mx-6
          "
        >
          {/* Inner scroll wrapper */}
          <div className="h-full">
            <div
              className="
                inner-scroll 
                h-[80vh] overflow-y-auto pr-3 -mr-3
                scrollbar-thin scrollbar-thumb-rounded-full
                scrollbar-thumb-gray-400 scrollbar-track-gray-100
                hover:scrollbar-thumb-gray-500
              "
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#9ca3af #f3f4f6',
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
              >
                ×
              </button>

              {/* Header */}
              <div className="p-4 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-indigo-700 mb-3">
                  Overall Score: {scoreData.overall_score ?? scoreData.score}/100
                </h3>

                {scoreData.job_match_summary && (
                  <p className="text-gray-800 mb-4 text-sm sm:text-base">{scoreData.job_match_summary}</p>
                )}

                {/* Scores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5">
                  {[
                    ['ATS Compatibility', scoreData.ats_compatibility_score],
                    ['Formatting Score', scoreData.formatting_score],
                    ['Readability', scoreData.readability_score],
                    ['Keyword Match', scoreData.keyword_match_score],
                  ].map(([label, value], i) =>
                    value ? (
                      <div key={i} className="p-2 sm:p-0">
                        <p className="font-semibold text-sm sm:text-base">{label}:</p>
                        <p className="text-sm sm:text-base">{value}/100</p>
                      </div>
                    ) : null
                  )}
                </div>

                {/* Skills */}
                {scoreData.skills_extracted && (
                  <div className="mb-4">
                    <p className="font-semibold text-sm sm:text-base">Skills Extracted:</p>
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                      {[...(scoreData.skills_extracted.technical || []),
                        ...(scoreData.skills_extracted.soft || []),
                        ...(scoreData.skills_extracted.domain || [])
                      ].map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Keywords */}
                {scoreData.missing_keywords?.length > 0 && (
                  <div className="mb-4">
                    <p className="font-semibold text-red-600 text-sm sm:text-base">Missing Keywords:</p>
                    <ul className="list-disc ml-4 sm:ml-5 text-gray-700 text-xs sm:text-sm">
                      {scoreData.missing_keywords.map((kw, i) => (
                        <li key={i}>{kw}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Experience */}
                {scoreData.experience_analysis && (
                  <div className="mb-4">
                    <p className="font-semibold text-sm sm:text-base">Experience Summary:</p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      {scoreData.experience_analysis.relevant_experience}
                    </p>
                    <p className="text-xs mt-1 text-gray-600">
                      Total Years: {scoreData.experience_analysis.total_years} | Action Verbs:{' '}
                      {scoreData.experience_analysis.action_verbs_used} | Quantified:{' '}
                      {scoreData.experience_analysis.quantified_results}
                    </p>
                  </div>
                )}

                {/* Education */}
                {scoreData.education_analysis && (
                  <div className="mb-4">
                    <p className="font-semibold text-sm sm:text-base">Education:</p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      {scoreData.education_analysis.degree} (
                      {scoreData.education_analysis.relevance_to_job ||
                        scoreData.education_analysis.relevance_to_industry}
                      )
                    </p>
                  </div>
                )}

                {/* Recommendations */}
                {scoreData.recommendations?.length > 0 && (
                  <div>
                    <p className="font-semibold text-indigo-700 text-sm sm:text-base">Recommendations:</p>
                    <ul className="list-disc ml-4 sm:ml-5 text-gray-700 text-xs sm:text-sm space-y-1">
                      {scoreData.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}