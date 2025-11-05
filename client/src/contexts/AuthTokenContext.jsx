import { useEffect, useState, createContext, useContext } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import axios from 'axios'

const AuthTokenContext = createContext()

export function AuthTokenProvider({ children }) {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [jwt, setJwt] = useState(null)
  const [tokens, setTokens] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deductLoading, setDeductLoading] = useState(false)
  const [error, setError] = useState(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

  // Register user and fetch initial tokens
  const registerAndFetchTokens = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = await getToken()
      setJwt(token)
      console.log('JWT TOken:',token)
      if (!token || !user) {
        setTokens(null)
        setLoading(false)
        return
      }

      // Register user
      const userData = {
        uid: user.id,
        username: user.username || user.primaryEmailAddress?.emailAddress.split('@')[0] || `user_${Date.now()}`,
        firstname: user.firstName || 'Unknown',
        lastname: user.lastName || 'User',
        email: user.primaryEmailAddress?.emailAddress || ''
      }

      console.log('Registering user:', userData.email)

      const registerResponse = await axios.post(
        `${backendUrl}/api/users/register`,
        userData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      console.log('Registration response:', registerResponse.data.message)

      // Fetch tokens
      const tokensResponse = await axios.get(`${backendUrl}/api/users/tokens`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setTokens(tokensResponse.data.tokens)
      console.log('User tokens:', tokensResponse.data.tokens)

    } catch (err) {
      console.error('Error in registerAndFetchTokens:', err.response?.data || err.message)
      setError(err.response?.data || err.message)
      setTokens(null)
    } finally {
      setLoading(false)
    }
  }

  // Deduct tokens
  const deductTokens = async (amount = 2) => {
    setDeductLoading(true)
    setError(null)
    
    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      const res = await axios.post(
        `${backendUrl}/api/users/deduct`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Update local state immediately
      setTokens(res.data.tokens)

      return { success: true, tokens: res.data.tokens, data: res.data }
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      setError(msg)
      return { success: false, error: msg, details: err.response?.data }
    } finally {
      setDeductLoading(false)
    }
  }

  // Fetch current tokens (for manual refresh)
  const fetchTokens = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      const res = await axios.get(`${backendUrl}/api/users/tokens`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setTokens(res.data.tokens)
      return { success: true, tokens: res.data.tokens }
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  // Refresh tokens (alias for fetchTokens)
  const refreshTokens = () => fetchTokens()

  // Manual token update (for immediate UI updates)
  const updateTokens = (newCount) => {
    setTokens(newCount)
  }

  // Initial registration and token fetch
  useEffect(() => {
    registerAndFetchTokens()
  }, [getToken, user])

  return (
    <AuthTokenContext.Provider value={{
      // Auth data
      jwt,
      user,
      
      // Token data
      tokens,
      loading,
      deductLoading,
      error,
      
      // Token operations
      deductTokens,
      fetchTokens,
      refreshTokens,
      updateTokens
    }}>
      {children}
    </AuthTokenContext.Provider>
  )
}

export function useAuthToken() {
  const context = useContext(AuthTokenContext)
  if (!context) {
    throw new Error('useAuthToken must be used within AuthTokenProvider')
  }
  return context
}

// Legacy exports for backward compatibility (if needed)
export const useClerkJwtAndCredits = () => {
  const { jwt, tokens: credits, loading, error, refreshTokens } = useAuthToken()
  return { jwt, credits, loading, error, refetchCredits: refreshTokens }
}

export const useToken = () => {
  const { deductTokens, fetchTokens, deductLoading: loading, error } = useAuthToken()
  return { deductTokens, fetchTokens, loading, error }
}