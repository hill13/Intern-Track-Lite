// Login.tsx — Login page
// Renders a form with email + password fields.
// On submit: calls the backend login API, stores the returned JWT token
// in Zustand (which also saves it to localStorage), then redirects to /board.

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login as loginApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  // Controlled input state — tracks what the user types in each field
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // UI state — shown while the API call is in-flight or if it fails
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Pull setToken from Zustand — saves token to memory + localStorage
  const setToken = useAuthStore((state) => state.setToken)

  // useNavigate lets us redirect programmatically (no <a> tag needed)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()   // Stop the browser from reloading the page on submit
    setError('')         // Clear any previous error before each new attempt
    setLoading(true)

    try {
      // Call POST /auth/login — returns { access_token, token_type }
      const data = await loginApi(email, password)

      // Store the token globally — ProtectedRoute reads this to allow access
      setToken(data.access_token)

      // Redirect to the Kanban board now that the user is logged in
      navigate('/board')
    } catch {
      // Show a generic error — don't leak whether the email or password was wrong
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign in</h1>

        {/* Show error banner if login failed */}
        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Button is disabled while the API call is in flight */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-500">
          No account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
