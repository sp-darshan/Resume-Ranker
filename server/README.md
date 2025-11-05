# 📝 Resume Ranker - Server

Backend API for Resume Ranker. Handles PDF uploads, text extraction, AI analysis (Google Gemini), token/account management, and Razerpay payment order handling. Built with Node.js, Express, MongoDB (Mongoose), Multer and pdf-parse.

🔴 Live Api link: https://resume-ranker-enf0.onrender.com

## 🧩 Quick start

1. Copy environment variables into `server/.env` (see **Environment Variables**).  
2. Install dependencies and start the server:

```bash
cd server
npm install
npm run server
```

Default port: (commonly `5000`).


## 🛡️ Environment Variables

Add the following to `server/.env`:

```
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_google_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLERK_SECRET_KEY=your_clerk_secret_key
```



## 📂 Project structure

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
├─ uploads/          # temporary files (deleted after processing)
├─ server.js
└─ .env
```

## 🔐 Authentication & middleware

- `verifyClerkAuth.js`: validates Clerk JWT from `Authorization: Bearer <jwt>` and attaches user info to `req.user`.
- `Multer`: handles multipart file uploads, temp files saved to `uploads/`.
- All protected routes use `verifyClerkAuth`.
- Controllers must delete uploaded files in `finally` blocks to avoid disk growth.


## </> API Endpoints

All routes are assumed to be prefixed with `/api`.

### 1. POST /api/analyze
- Middlewares: `verifyClerkAuth`, `upload.single('resume')` (Multer)
- Purpose: Accept a resume PDF (optional jobDescription), run AI analysis (Gemini), atomically deduct tokens only if analysis succeeds, return analysis + remaining tokens.
- Headers:
  - `Authorization: Bearer <jwt>`
- Form Data:
  - `resume` (file, PDF) - required
  - `jobDescription` (string) - optional
- Response (200):
  ```json
  {
    "message": "Resume analyzed successfully",
    "analysis": { /* structured JSON from model */ },
    "tokensDeducted": 2,
    "remainingTokens": 42
  }
  ```
- Errors:
  - 400: missing file, insufficient tokens, race-condition token failure
  - 401: unauthorized (invalid/missing JWT)
  - 422 / 500: invalid AI output or model errors
- Notes:
  - Parse model output carefully (strip code fences) before JSON.parse.
  - Use atomic DB update: findOneAndUpdate({ uid, tokens: { $gte: required } }, { $inc: { tokens: -required } }, { new: true }).

### 2. POST /api/users/register
- Middlewares: `verifyClerkAuth`
- Purpose: Ensure a server user record exists (create/upsert) after Clerk sign-in; initialize tokens if new.
- Headers:
  - `Authorization: Bearer <jwt>`
- Body (JSON):
  - `{ uid, email, username, firstname, lastname }`
- Response (200):
  ```json
  { "uid": "...", "email": "...", "tokens": 10 }
  ```
- Errors:
  - 401: unauthorized
  - 500: DB or validation error
- Notes:
  - Called by frontend on sign-in to sync Clerk user with DB.


### 3. GET /api/users/tokens
- Middlewares: `verifyClerkAuth`
- Purpose: Return current token balance for authenticated user.
- Headers:
  - `Authorization: Bearer <jwt>`
- Response (200):
  ```json
  { "tokens": 42 }
  ```
- Errors:
  - 401: unauthorized
  - 404: user not found



### 4. POST /api/users/deduct
- Middlewares: `verifyClerkAuth`
- Purpose: Deduct tokens explicitly. Prefer server-side deduction inside `/api/analyze`.
- Headers:
  - `Authorization: Bearer <jwt>`
- Body (JSON):
  - `{ "amount": 2 }`
- Response (200):
  ```json
  { "success": true, "tokens": 40 }
  ```
- Errors:
  - 400: insufficient tokens
  - 401: unauthorized
- Notes:
  - Use atomic update with `$gte` check to avoid races.



### 5. POST /api/payment/create-order
- Middlewares: `verifyClerkAuth`
- Purpose: Create a Razorpay order for purchasing credits; frontend uses order to open checkout.
- Headers:
  - `Authorization: Bearer <jwt>`
- Body (JSON):
  - `{ "amount": 500, "currency": "INR", "metadata": { ... } }`
- Response (200):
  ```json
  { "order": { /* razorpay order data */ } }
  ```
- Errors:
  - 400: invalid request
  - 401: unauthorized


### 6. POST /api/payment/verify
- Middlewares: none (public webhook), but must verify signature
- Purpose: Verify Razorpay webhook payload and signature; on valid event, create transaction record and increment user tokens atomically.
- Headers:
  - `X-Razorpay-Signature` (signature to verify)
- Body: webhook event JSON per Razorpay spec
- Response (200):
  ```json
  { "ok": true }
  ```
- Errors:
  - 400 / 401: invalid signature or malformed payload
- Notes:
  - Always verify signature using `RAZORPAY_KEY_SECRET`.
  - Ensure idempotency - ignore repeated notifications for same payment id.



## 🔧 Models overview

- User (`userModel.js`):
  - Fields: `uid` (Clerk id), `email`, `username`, `firstname`, `lastname`, `tokens` (Number), timestamps.


## 📂 File uploads & cleanup

- Multer stores uploads in `uploads/`.
- Delete temp files in `finally` block:
  ```js
  if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  ```



## 👍 Best practices

- Use atomic DB updates (`$gte` + `$inc`) to prevent race conditions when deducting tokens.
- Limit upload file size via Multer.
- Strip Markdown/code fences from AI responses before JSON.parse.
- Log AI responses for debugging, but avoid persisting sensitive data.
- Rate-limit or queue AI calls for high concurrency.


## 🔎 Testing

1. Register or sync a user: `POST /api/users/register`.
2. Check token balance: `GET /api/users/tokens`.
3. Send a small PDF to `POST /api/analyze` and verify `analysis` and `remainingTokens`.
4. Test payment flow in Razorpay sandbox and webhook verification.

Use curl or Postman for manual testing.

## 🌐 Deployment notes

- Provide production environment variables (Gemini key, Mongo URI, Razorpay keys, Clerk secrets).
- Protect webhook endpoints and verify signatures.
- Consider a job queue for AI calls to handle retries and long-running analysis.
- Monitor usage and rate-limit model calls to control cost.



## 🩺 Troubleshooting

- Vite/Frontend token mismatch: ensure `/api/analyze` returns `remainingTokens` and frontend updates context.
- 401 errors: verify Clerk JWT and middleware setup.
- 500 errors: inspect AI raw response logs and ensure parsing logic is robust.




