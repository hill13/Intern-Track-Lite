import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

// children = whatever page is wrapped by this component (e.g. Board, Stats)
interface Props {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const token = useAuthStore((state) => state.token)

  // No token = not logged in → redirect to login page
  if (!token) {
    return <Navigate to="/login" />
  }

  // Token exists → render the protected page
  return <>{children}</>
}
