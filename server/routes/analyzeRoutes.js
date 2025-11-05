import express from 'express';
import multer from 'multer';
import { analyzeResume } from '../controllers/analyzeController.js';
import { verifyClerkAuth } from '../middleware/verifyClerkAuth.js';

const router = express.Router();

// Store uploads temporarily in /uploads folder
const upload = multer({ dest: 'uploads/' });

// Protect the analyze route with authentication
router.post('/analyze', verifyClerkAuth, upload.single('resume'), analyzeResume);

export default router;