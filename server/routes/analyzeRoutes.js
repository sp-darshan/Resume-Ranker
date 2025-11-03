import express from 'express';
import multer from 'multer';
import { analyzeResume } from '../controllers/analyzeController.js';

const router = express.Router();

// store uploads temporarily in /uploads folder
const upload = multer({ dest: 'uploads/' });

router.post('/analyze', upload.single('resume'), analyzeResume);

export default router;
