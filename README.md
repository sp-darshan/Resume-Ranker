# 📝 Resume Ranker

A full-stack AI-powered SaaS that analyzes resumes against a job description, produces ATS-focused insights, and manages usage via a token-based system. Built with the MERN stack, Clerk for auth, Google Gemini for analysis, and Razorpay for payments.

## 🔴 Live Links

- Frontend Live Demo: [https://resume-ranker-ind.vercel.app/](https://resume-ranker-ind.vercel.app/)
- Backend API: [https://resume-ranker-enf0.onrender.com](https://resume-ranker-enf0.onrender.com)

## ⚙️ Features

- AI-powered resume analysis (Google Gemini)
- ATS compatibility scoring and detailed breakdown
- Job description matching and keyword gap analysis
- Token-based usage (2 tokens per analysis)
- Secure token purchase via Razorpay
- Authentication and user management via Clerk
- Responsive UI with React + Tailwind CSS
- Real-time token sync across UI
- Secure Node/Express API with MongoDB

## 🛠️ Tech Stack

### Frontend
- React, React Router
- Clerk (Auth)
- Razorpay (Payments)
- Tailwind CSS
- Framer Motion, Axios, React Hot Toast
- Vite

### Backend
- Node.js, Express.js
- MongoDB, Mongoose
- Multer (PDF uploads)
- Google Generative AI (Gemini)
- Clerk (JWT verification middleware)
- Razorpay (payments)

## 📂 Folder Structure

```
.
├── client/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── AnalysisResult.jsx
│       │   ├── ContactUs.jsx
│       │   ├── Features.jsx
│       │   ├── HowItWorks.jsx
│       │   ├── Navbar.jsx
│       │   └── ScrollElement.jsx
│       ├── contexts/
│       │   └── AuthTokenContext.jsx
│       ├── hooks/
│       │   └── usePayment.js
│       ├── pages/
│       │   ├── Hero.jsx
│       │   ├── Home.jsx
│       │   └── Pricing.jsx
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
├── server/
│   ├── configs/
│   │   └── mongodb.js
│   ├── controllers/
│   │   ├── analyzeController.js
│   │   ├── paymentController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── verifyClerkAuth.js
│   ├── models/
│   │   ├── transactionModel.js
│   │   └── userModel.js
│   ├── routes/
│   │   ├── analyzeRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── userRoutes.js
│   ├── uploads/
│   └── server.js
├── .gitignore
└── Readme.md
```

## 🛡️ Environment Variables

### client/.env
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BACKEND_URL=your_backend_url
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### server/.env
```
MONGODB_URI=your_mongodb_uri
CLERK_SECRET_KEY=your_clerk_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## </> Scripts

### Frontend
```
cd client
npm install
npm run dev
```

### Backend
```
cd server
npm install
npm run server
```

## 🔧 Setup

1. Clone repository and open in your workspace.
2. Create .env files in client and server with the variables above.
3. Install and run backend, then frontend.
4. Visit http://localhost:5173 for frontend and http://localhost:5000 for backend.

## 🤔 How It Works

1. User uploads a PDF resume (and optional job description).
2. Backend validates auth and available tokens.
3. Gemini analyzes content and returns structured insights.
4. On success, tokens are deducted atomically on the server.
5. UI displays analysis and updates remaining tokens in real time.

## 💳 Payments & Auth

- Clerk manages authentication and JWT.
- Razorpay handles secure token purchases.
- Backend validates orders, updates user tokens, and exposes token/query endpoints.

---
For detailed client and server specifics (components, hooks, routes, and API contracts), see the dedicated README files in each subfolder.
