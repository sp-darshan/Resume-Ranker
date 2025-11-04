import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import { AuthTokenProvider } from './contexts/AuthTokenContext'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')).render(
<ClerkProvider publishableKey={clerkPubKey}>
  <BrowserRouter>
    <StrictMode>
      <AuthTokenProvider>
        <App />
      </AuthTokenProvider>
    </StrictMode>
  </BrowserRouter>
</ClerkProvider>,
);
