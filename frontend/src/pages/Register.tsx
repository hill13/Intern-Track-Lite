// Register.tsx — Registration page
// Renders a form with email, password, and confirm password fields.
// Validates that passwords match on the frontend before calling the backend.
// On success, redirects to /login — no token stored here, user must log in after registering.

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register as registerApi } from '../api/auth'

export default function Register() {
  // Controlled input state — tracks what the user types in each field
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI state — shown while the API call is in-flight or if it fails
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Frontend-only check — confirmPassword is never sent to the backend
    // Protects the user from typos before we make any API call
    if (password !== confirmPassword) {
      setError('Passwords do not match. Try again')
      setLoading(false)
      return
    }

    try {
      // POST /auth/register — returns void, just creates the account
      await registerApi(email, password)

      // Registration successful — redirect to login so they can sign in
      navigate('/login')
    } catch {
      setError('Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="bg-surface border border-stone-200 p-8 rounded-xl shadow-sm w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight mb-1 text-center text-stone-900">Create account</h1>
        <p className="text-sm text-stone-500 text-center mb-6">Start tracking your applications.</p>

        {/* Show error banner if validation or API call failed */}
        {error && (
          <div className="bg-danger-soft border border-danger-border text-danger text-sm px-3 py-2 rounded-md mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-stone-300 bg-surface rounded-md px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-stone-300 bg-surface rounded-md px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Confirm password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-stone-300 bg-surface rounded-md px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-2.5 rounded-md text-sm font-medium hover:bg-accent-strong disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-medium hover:text-accent-strong transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
