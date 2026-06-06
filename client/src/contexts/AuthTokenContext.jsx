import { useEffect, useRef, useState, createContext, useContext } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import axios from 'axios'

const AuthTokenContext = createContext()

export function AuthTokenProvider({ children }) {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [tokens, setTokens] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const retryTimerRef = useRef(null)
  const isMountedRef = useRef(true)
  const retryAttemptRef = useRef(0)

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

  const clearRetryTimer = () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
  }

  const scheduleRetry = (callback) => {
    clearRetryTimer()

    const delay = Math.min(1000 * (2 ** retryAttemptRef.current), 10000)
    retryAttemptRef.current += 1

    retryTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        callback()
      }
    }, delay)
  }

  const isRetryableBackendError = (err) => {
    if (!err?.response) return true
    return err.response.status >= 500
  }

  // Register user and fetch initial tokens
  const registerAndFetchTokens = async () => {
    clearRetryTimer()
    setLoading(true)
    setError(null)

    try {
      const token = await getToken()
      console.log('JWT Token:', token)
      
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
      retryAttemptRef.current = 0
      console.log('User tokens:', tokensResponse.data.tokens)

    } catch (err) {
      console.error('Error in registerAndFetchTokens:', err.response?.data || err.message)

      if (isRetryableBackendError(err)) {
        setError(err.response?.data || err.message)
        scheduleRetry(registerAndFetchTokens)
        return
      }

      setError(err.response?.data || err.message)
      setTokens(null)
    } finally {
      if (isMountedRef.current && !retryTimerRef.current) {
        setLoading(false)
      }
    }
  }

  // Fetch current tokens (for manual refresh)
  const fetchTokens = async () => {
    clearRetryTimer()
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      const res = await axios.get(`${backendUrl}/api/users/tokens`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setTokens(res.data.tokens)
      retryAttemptRef.current = 0
      return { success: true, tokens: res.data.tokens }
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      setError(msg)

      if (isRetryableBackendError(err)) {
        scheduleRetry(fetchTokens)
        return { success: false, error: msg }
      }

      return { success: false, error: msg }
    } finally {
      if (isMountedRef.current && !retryTimerRef.current) {
        setLoading(false)
      }
    }
  }

  // Refresh tokens
  const refreshTokens = () => fetchTokens()

  // Manual token update (for immediate UI updates)
  const updateTokens = (newCount) => {
    setTokens(newCount)
  }

  // Initial registration and token fetch
  useEffect(() => {
    isMountedRef.current = true
    registerAndFetchTokens()

    return () => {
      clearRetryTimer()
    }
  }, [getToken, user])

  return (
    <AuthTokenContext.Provider value={{
      // Auth data
      user,
      
      // Token data
      tokens,
      loading,
      error,
      
      // Token operations
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

// Legacy exports for backward compatibility
export const useClerkJwtAndCredits = () => {
  const { jwt, tokens: credits, loading, error, refreshTokens } = useAuthToken()
  return { jwt, credits, loading, error, refetchCredits: refreshTokens }
}