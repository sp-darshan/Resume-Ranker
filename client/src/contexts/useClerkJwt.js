import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";

export function useClerkJwtAndCredits() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [jwt, setJwt] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function registerAndFetchCredits() {
      setLoading(true);
      try {
        // Get the Clerk JWT
        const token = await getToken();
        setJwt(token);
        console.log("Clerk JWT:", token);

        // Only proceed if we have both token and user info
        if (!token || !user) {
          setCredits(null);
          setLoading(false);
          return;
        }

        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

        // Build user payload from Clerk
        const userData = {
          uid: user.id, // Clerk's user ID
          username: user.username || user.primaryEmailAddress?.emailAddress.split("@")[0],
          firstname: user.firstName || "",
          lastname: user.lastName || "",
          email: user.primaryEmailAddress?.emailAddress || "",
        };

        // Register or sync user in your backend (MongoDB)
        await axios.post(
          `${backendUrl}/api/users/register`,
          userData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch user tokens securely
        const response = await axios.get(`${backendUrl}/api/users/tokens`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCredits(response.data.tokens);

      } catch (err) {
        console.error("Error in useClerkJwtAndCredits:", err);
        setError(err);
        setCredits(null);
      } finally {
        setLoading(false);
      }
    }

    registerAndFetchCredits();
  }, [getToken, user]);

  return { jwt, credits, loading, error };
}
