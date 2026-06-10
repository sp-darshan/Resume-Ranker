import express from 'express';
import multer from 'multer';
import { analyzeResume } from '../controllers/analyzeController.js';
import { verifyClerkAuth } from '../middleware/verifyClerkAuth.js';

const router = express.Router();

// Store uploads temporarily in /uploads folder
const upload = multer({
	dest: 'uploads/',
	limits: {
		fileSize: 5 * 1024 * 1024
	},
	fileFilter: (req, file, cb) => {
		const allowedMimeTypes = [
			'application/pdf',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		]

		if (!allowedMimeTypes.includes(file.mimetype)) {
			return cb(new Error('Only PDF and DOCX files are allowed'))
		}
		cb(null, true)
	}
});

// Protect the analyze route with authentication
router.post(
	'/analyze',
	verifyClerkAuth,
	upload.fields([
		{ name: 'resume', maxCount: 1 },
		{ name: 'jobDescriptionFile', maxCount: 1 }
	]),
	analyzeResume
);

export default router;