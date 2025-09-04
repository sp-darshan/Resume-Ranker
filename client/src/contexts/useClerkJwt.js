import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'

export function useClerkJwtAndCredits() {
  const { getToken } = useAuth()
  const [jwt, setJwt] = useState(null)
  const [credits, setCredits] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTokenAndCredits() {
      setLoading(true)
      try {
        const token = await getToken()
        setJwt(token)
        console.log('JWT:', token) // Log the JWT whenever it's fetched

        if (token) {
          const res = await axios.get('/api/user/tokens', {
            headers: { Authorization: `Bearer ${token}` }
          })
          setCredits(res.data.tokens)
        } else {
          setCredits(null)
        }
      } catch (err) {
        setError(err)
        setCredits(null)
      } finally {
        setLoading(false)
      }
    }
    fetchTokenAndCredits()
  }, [getToken])

  return { jwt, credits, loading, error }
}