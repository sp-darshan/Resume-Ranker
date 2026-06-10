'use client'

import { motion } from 'framer-motion'

export default function AnalysisResult({ analysisData }) {
  const record = analysisData || {}
  const scoreData = record.analysis || record
  const isJobMatch = record.analysisMode === 'job-match' || Boolean(record.jobDescription)

  if (!scoreData) return null

  const scoreValue = scoreData.overall_score ?? scoreData.score ?? scoreData.overallScore
  const title = isJobMatch ? 'Overall Job Match' : 'Overall Resume Quality'
  const subtitle = isJobMatch ? 'Job match analysis' : 'Resume-only analysis'
  const skills = [
    ...(scoreData.skills_extracted?.technical || []),
    ...(scoreData.skills_extracted?.soft || []),
    ...(scoreData.skills_extracted?.domain || [])
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
    >
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-500 px-6 py-5 text-white sm:px-8 sm:py-6">
        <p className="text-xs uppercase tracking-[0.3em] text-white/80">Saved Resume Analysis</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">{title}: {scoreValue ?? 'N/A'}/100</h2>
            <p className="mt-1 text-sm text-white/80">
              {record.resumeName ? `File: ${record.resumeName}` : 'Stored analysis record'}
            </p>
          </div>
          <div className="text-sm text-white/85">
            {record.createdAt ? `Analyzed ${new Date(record.createdAt).toLocaleString()}` : ''}
          </div>
        </div>
        <p className="mt-3 text-sm text-white/80">{subtitle}</p>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(isJobMatch
            ? [
                ['Keyword Match', scoreData.keyword_match_score ?? record.keywordScore],
                ['Experience', scoreData.experience_score ?? record.experienceScore],
                ['Education', scoreData.education_score ?? record.educationScore],
                ['ATS Compatibility', scoreData.ats_compatibility_score ?? record.atsScore],
                ['Formatting', scoreData.formatting_score ?? record.formattingScore],
                ['Readability', scoreData.readability_score ?? record.readabilityScore]
              ]
            : [
                ['ATS Compatibility', scoreData.ats_compatibility_score ?? record.atsScore],
                ['Formatting', scoreData.formatting_score ?? record.formattingScore],
                ['Readability', scoreData.readability_score ?? record.readabilityScore],
                ['Skills Coverage', scoreData.skills_coverage_score ?? record.skillsCoverageScore]
              ]
          ).map(([label, value]) =>
            value !== undefined && value !== null ? (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-600">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{value}/100</p>
              </div>
            ) : null
          )}
        </div>

        {skills.length > 0 && (
          <div>
            <p className="mb-3 font-semibold text-slate-900">Skills Extracted</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {scoreData.missing_keywords?.length > 0 && (
          <div>
            <p className="mb-3 font-semibold text-red-600">Missing Keywords</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {scoreData.missing_keywords.map((keyword, index) => (
                <li key={`${keyword}-${index}`}>{keyword}</li>
              ))}
            </ul>
          </div>
        )}

        {scoreData.experience_analysis && (
          <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
            <p className="mb-2 font-semibold text-slate-900">Experience</p>
            <p className="text-sm leading-7 text-slate-700 sm:text-base">
              {scoreData.experience_analysis.relevant_experience || scoreData.experience_analysis.summary || 'No experience summary provided.'}
            </p>
            <p className="mt-3 text-xs text-slate-500 sm:text-sm">
              Total Years: {scoreData.experience_analysis.total_years ?? 'N/A'} | Action Verbs: {scoreData.experience_analysis.action_verbs_used ?? 'N/A'} | Quantified Results: {scoreData.experience_analysis.quantified_results ?? 'N/A'}
            </p>
          </div>
        )}

        {scoreData.education_analysis && (
          <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
            <p className="mb-2 font-semibold text-slate-900">Education</p>
            <p className="text-sm text-slate-700 sm:text-base">
              {scoreData.education_analysis.degree || 'Education not provided'}
              {scoreData.education_analysis.institution ? ` • ${scoreData.education_analysis.institution}` : ''}
            </p>
            <p className="mt-2 text-xs text-slate-500 sm:text-sm">
              {scoreData.education_analysis.relevance_to_job || scoreData.education_analysis.relevance_to_industry || 'Relevance not provided'}
            </p>
          </div>
        )}

        {scoreData.recommendations?.length > 0 && (
          <div>
            <p className="mb-3 font-semibold text-indigo-700">Recommendations</p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
              {scoreData.recommendations.map((recommendation, index) => (
                <li key={`${recommendation}-${index}`}>{recommendation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  )
}