import express from 'express'
import { verifyClerkAuth } from '../middleware/verifyClerkAuth.js'
import { deleteAnalysis, getAnalysisById, getUserAnalyses } from '../controllers/analysisController.js'

const router = express.Router()

router.get('/', verifyClerkAuth, getUserAnalyses)
router.get('/:analysisId', verifyClerkAuth, getAnalysisById)
router.delete('/:analysisId', verifyClerkAuth, deleteAnalysis)

export default router