import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

// Decode the JWT payload client-side to pull the email out of the `sub` claim.
// Backend sets it at login time (see backend/app/api/v1/auth.py: create_access_token({"sub": email})).
// Presentation-only — backend still verifies signature on every real API call.
function getEmailFromToken(token: string | null): string | null {
  if (!token) return null
  try {
    // JWT format: header.payload.signature — take the middle segment,
    // base64-decode it, JSON-parse it, read the `sub` claim.
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub ?? null
  } catch {
    // Malformed token → don't crash the nav, just hide the email.
    return null
  }
}

export default function Nav() {
  const navigate = useNavigate()
  // Selector-subscribe: only re-renders when the selected slice changes,
  // not on every unrelated update to the store.
  const token = useAuthStore(state => state.token)
  const logout = useAuthStore(state => state.logout)

  const email = getEmailFromToken(token)

  const handleLogout = () => {
    logout()            // clears token from Zustand + localStorage
    navigate('/login')  // redirect to login page
  }

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      {/* Left — app title, also links home */}
      <Link
        to="/board"
        className="text-lg font-semibold text-gray-900 hover:text-gray-700"
      >
        InternTrack
      </Link>

      {/* Middle — page nav with active-state highlighting via NavLink */}
      <div className="flex gap-6">
        <NavLink
          to="/board"
          className={({ isActive }) =>
            isActive
              ? 'text-blue-600 font-medium border-b-2 border-blue-600 pb-1'
              : 'text-gray-600 hover:text-gray-900'
          }
        >
          Board
        </NavLink>
        <NavLink
          to="/stats"
          className={({ isActive }) =>
            isActive
              ? 'text-blue-600 font-medium border-b-2 border-blue-600 pb-1'
              : 'text-gray-600 hover:text-gray-900'
          }
        >
          Stats
        </NavLink>
      </div>

      {/* Right — email (only if decode succeeded) + logout button */}
      <div className="flex items-center gap-3">
        {email && <span className="text-sm text-gray-600">{email}</span>}
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
