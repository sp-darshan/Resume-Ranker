'use client'

import { useState } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/clerk-react'
import { useAuthToken } from '../contexts/AuthTokenContext.jsx';

export function usePayment() {
  const [loading, setLoading] = useState(false)
  const { user } = useUser()
  const { refreshTokens } = useAuthToken()

  const handlePayment = async (amount, tokensToAdd) => {
    try {
      setLoading(true)

      // Create order in backend
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/payments/create-order`,
        { amount },
        { headers: { 'Content-Type': 'application/json' } }
      )

      const { order } = data

      // Razorpay Checkout Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Resume Ranker',
        description: 'Purchase credits',
        order_id: order.id,
        handler: async (response) => {
          console.log('Payment success:', response)

          // Verify payment and credit tokens
          try {
            const verifyRes = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/payments/verify`,
              {
                ...response, // contains payment_id, order_id, signature
                amount, // so backend knows how much was paid
                userId: user?.primaryEmailAddress?.emailAddress,
                tokensToAdd,
              }
            )
            console.log("Verification response:", verifyRes.data);
            alert(verifyRes.data.message);
            // After successful verification, refresh token balance
            if (verifyRes.data.success) {
              refreshTokens();
            }
          } catch (err) {
            console.error("Verification error:", err.response?.data || err.message);
            alert("Payment verification failed!");
          }
        },
        prefill: {
          name: user?.fullName || 'User',
          email: user?.primaryEmailAddress?.emailAddress || 'user@example.com',
        },
        theme: {
          color: '#6366F1',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment initialization failed')
    } finally {
      setLoading(false)
    }
  }

  return { handlePayment, loading }
}
