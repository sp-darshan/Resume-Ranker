import mongoose from 'mongoose'

const analysisSchema = new mongoose.Schema(
  {
    userUid: {
      type: String,
      required: true,
      index: true
    },
    resumeName: {
      type: String,
      required: true
    },
    jobDescription: {
      type: String,
      default: ''
    },
    analysisNumber: {
      type: Number,
      required: true
    },
    analysisMode: {
      type: String,
      enum: ['resume-only', 'job-match'],
      required: true
    },
    overallScore: {
      type: Number,
      default: null
    },
    atsScore: {
      type: Number,
      default: null
    },
    keywordScore: {
      type: Number,
      default: null
    },
    experienceScore: {
      type: Number,
      default: null
    },
    educationScore: {
      type: Number,
      default: null
    },
    formattingScore: {
      type: Number,
      default: null
    },
    readabilityScore: {
      type: Number,
      default: null
    },
    skillsCoverageScore: {
      type: Number,
      default: null
    },
    scoreBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    tokenCost: {
      type: Number,
      default: 2
    },
    analysis: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true
  }
)

analysisSchema.index({ userUid: 1, createdAt: -1 })

const Analysis = mongoose.model('Analysis', analysisSchema)

export default Analysis