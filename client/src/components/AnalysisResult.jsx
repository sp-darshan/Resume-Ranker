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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
      >
        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="
            relative w-full max-w-2xl max-h-[85vh]
            rounded-2xl shadow-2xl bg-white p-8 text-gray-800
            overflow-y-auto
          "
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>

          {/* Header */}
          <h3 className="text-2xl font-bold text-indigo-700 mb-3">
            Overall Score: {scoreData.overall_score ?? scoreData.score}/100
          </h3>

          {scoreData.job_match_summary && (
            <p className="text-gray-700 mb-4">{scoreData.job_match_summary}</p>
          )}

          {/* Scores */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            {[
              ['ATS Compatibility', scoreData.ats_compatibility_score],
              ['Formatting Score', scoreData.formatting_score],
              ['Readability', scoreData.readability_score],
              ['Keyword Match', scoreData.keyword_match_score],
            ].map(([label, value], i) =>
              value ? (
                <div key={i}>
                  <p className="font-semibold">{label}:</p>
                  <p>{value}/100</p>
                </div>
              ) : null
            )}
          </div>

          {/* Skills */}
          {scoreData.skills_extracted && (
            <div className="mb-4">
              <p className="font-semibold">Skills Extracted:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {[...(scoreData.skills_extracted.technical || []),
                  ...(scoreData.skills_extracted.soft || []),
                  ...(scoreData.skills_extracted.domain || [])
                ].map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium"
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
              <p className="font-semibold text-red-600">Missing Keywords:</p>
              <ul className="list-disc ml-5 text-gray-700 text-xs">
                {scoreData.missing_keywords.map((kw, i) => (
                  <li key={i}>{kw}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Experience */}
          {scoreData.experience_analysis && (
            <div className="mb-4">
              <p className="font-semibold">Experience Summary:</p>
              <p className="text-gray-700">
                {scoreData.experience_analysis.relevant_experience}
              </p>
              <p className="text-xs mt-1 text-gray-600">
                Total Years: {scoreData.experience_analysis.total_years} | Action Verbs:{" "}
                {scoreData.experience_analysis.action_verbs_used} | Quantified:{" "}
                {scoreData.experience_analysis.quantified_results}
              </p>
            </div>
          )}

          {/* Education */}
          {scoreData.education_analysis && (
            <div className="mb-4">
              <p className="font-semibold">Education:</p>
              <p className="text-gray-700">
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
              <p className="font-semibold text-indigo-700">Recommendations:</p>
              <ul className="list-disc ml-5 text-gray-700 text-xs space-y-1">
                {scoreData.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
