# Resume Ranker — Server

Backend API for Resume Ranker. Handles PDF uploads, text extraction, AI analysis (Google Gemini), token/account management, and payment order handling. Built with Node.js, Express, MongoDB (Mongoose), Multer and pdf-parse.

## Quick start

1. Copy environment variables into `server/.env` (see Environment Variables).
2. Install and run:
   ```bash
   cd server
   npm install
   npm start
   ```
3. Default port: (commonly 5000).


## Environment Variables

Add to `server/.env`:

```
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_google_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Project layout

```
server/
├─ configs/
│  └─ mongodb.js
├─ controllers/
│  ├─ analyzeController.js
│  ├─ paymentController.js
│  └─ userController.js
├─ middleware/
│  └─ verifyClerkAuth.js
├─ models/
│  ├─ userModel.js
│  └─ transactionModel.js
├─ routes/
│  ├─ analyzeRoutes.js
│  ├─ paymentRoutes.js
│  └─ userRoutes.js
├─ uploads/          # temporary files
├─ server.js
└─ .env
```

