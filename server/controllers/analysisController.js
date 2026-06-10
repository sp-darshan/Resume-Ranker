import Analysis from '../models/analysisModel.js'

export const getUserAnalyses = async (req, res) => {
  try {
    const clerkId = req.user?.sub

    if (!clerkId) {
      return res.status(401).json({ message: 'Unauthorized: No user ID found' })
    }

    const analyses = await Analysis.find({ userUid: clerkId })
      .sort({ createdAt: -1 })
      .select('resumeName analysisNumber analysisMode overallScore tokenCost createdAt updatedAt')
      .lean()

    return res.status(200).json({ analyses })
  } catch (err) {
    console.error('Get analyses error:', err)
    return res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export const getAnalysisById = async (req, res) => {
  try {
    const clerkId = req.user?.sub
    const { analysisId } = req.params

    if (!clerkId) {
      return res.status(401).json({ message: 'Unauthorized: No user ID found' })
    }

    const analysis = await Analysis.findOne({ _id: analysisId, userUid: clerkId }).lean()

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' })
    }

    return res.status(200).json({ analysis })
  } catch (err) {
    console.error('Get analysis by id error:', err)
    return res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export const deleteAnalysis = async (req, res) => {
  try {
    const clerkId = req.user?.sub
    const { analysisId } = req.params

    if (!clerkId) {
      return res.status(401).json({ message: 'Unauthorized: No user ID found' })
    }

    const deletedAnalysis = await Analysis.findOneAndDelete({ _id: analysisId, userUid: clerkId })

    if (!deletedAnalysis) {
      return res.status(404).json({ message: 'Analysis not found' })
    }

    if (deletedAnalysis.analysisNumber) {
      await Analysis.updateMany(
        {
          userUid: clerkId,
          analysisNumber: { $gt: deletedAnalysis.analysisNumber }
        },
        { $inc: { analysisNumber: -1 } }
      )
    }

    return res.status(200).json({
      success: true,
      message: 'Analysis deleted successfully',
      deletedAnalysisId: analysisId
    })
  } catch (err) {
    console.error('Delete analysis error:', err)
    return res.status(500).json({ message: 'Server error', error: err.message })
  }
}