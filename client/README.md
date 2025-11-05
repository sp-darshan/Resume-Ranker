# Resume Ranker - Client

Frontend for Resume Ranker: a responsive React + Vite app that lets users upload resumes, run AI analysis (Google Gemini via backend), view results, and manage tokens (Clerk auth + Razorpay payments).

Live Demo: https://resume-ranker-ind.vercel.app/

## Tech Stack
- React (Vite)
- React Router DOM
- Tailwind CSS
- Clerk (auth)
- Axios
- Framer Motion
- React Hot Toast
- Lucide / React Icons

## Quick Links
- Project root: Resume Ranker\client
- Main entry: src/main.jsx
- App container: src/App.jsx

## Environment
Create `client/.env` with:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BACKEND_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Folder structure
```
src/
├── assets/
├── components/
│   ├── AnalysisResult.jsx
│   ├── ContactUs.jsx
│   ├── Features.jsx
│   ├── HowItWorks.jsx
│   ├── Navbar.jsx
│   └── ScrollElement.jsx
├── contexts/
│   └── AuthTokenContext.jsx
├── hooks/
│   └── usePayment.js
├── pages/
│   ├── Hero.jsx
│   ├── Home.jsx
│   └── Pricing.jsx
├── App.jsx
├── index.css
└── main.jsx
```

## Important Components & Files
- src/contexts/AuthTokenContext.jsx - central auth + token state; refreshes token count and provides jwt.
- src/components/Navbar.jsx - shows token count when signed in.
- src/pages/Home.jsx - upload form, calls backend `/api/analyze`, updates UI and tokens.
- src/components/AnalysisResult.jsx - modal showing AI analysis.
- src/hooks/usePayment.js - Razorpay integration helper.
- src/index.css - Tailwind setup and custom styles.

Ensure backend is running and CORS allows your frontend origin.

## Scripts
```bash
# from client/
npm install
npm run dev      # local dev (Vite)
npm run build    # production build
npm run preview  # preview production build
```

## Local Development
1. Start backend (see server README).
2. Configure `client/.env`.
3. Run:
   ```bash
   cd client
   npm install
   npm run dev
   ```
4. Open http://localhost:5173

## Deployment
- Build: `npm run build`
- Provide `VITE_BACKEND_URL` and `VITE_CLERK_PUBLISHABLE_KEY` in the deploy environment.

## Clerk (Auth) Setup
- Create a Clerk application and copy publishable key into `VITE_CLERK_PUBLISHABLE_KEY`.
- Ensure backend verifies Clerk JWTs for protected routes (server middleware).

## Razorpay (Payments)
- Place `VITE_RAZORPAY_KEY_ID` in `.env`.
- Server handles order creation & webhook verification; frontend triggers Razorpay checkout via `usePayment.js`.

## Token Flow (summary)
1. User signs in (Clerk) - client receives jwt via AuthTokenContext.
2. Upload resume from Home.jsx - frontend sends request to backend with Authorization Bearer jwt.
3. Backend runs AI analysis, then atomically deducts tokens and returns remainingTokens.
4. Frontend updates context (AuthTokenContext.updateTokens) so Navbar & pages reflect new count immediately.

