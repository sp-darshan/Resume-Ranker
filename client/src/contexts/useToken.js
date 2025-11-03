import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'

export function useToken() {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

  async function deductTokens(amount = 2) {
    setLoading(true)
    setError(null)
    try {
      const jwt = await getToken()
      if (!jwt) throw new Error('Not authenticated')

      const res = await axios.post(
        `${backendUrl}/api/users/deduct`,
        { amount },
        { headers: { Authorization: `Bearer ${jwt}` } }
      )

      return { success: true, tokens: res.data.tokens, data: res.data }
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      setError(msg)
      return { success: false, error: msg, details: err.response?.data }
    } finally {
      setLoading(false)
    }
  }

  async function fetchTokens() {
    setLoading(true)
    setError(null)
    try {
      const jwt = await getToken()
      if (!jwt) throw new Error('Not authenticated')

      const res = await axios.get(`${backendUrl}/api/users/tokens`, {
        headers: { Authorization: `Bearer ${jwt}` }
      })

      return { success: true, tokens: res.data.tokens, data: res.data }
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      setError(msg)
      return { success: false, error: msg, details: err.response?.data }
    } finally {
      setLoading(false)
    }
  }

  return { deductTokens, fetchTokens, loading, error }
}