// App.tsx — Root component
// Sets up React Router with all application routes.
// Public routes (login, register) are accessible without a token.
// Protected routes are wrapped in ProtectedRoute, which redirects to /login if no token found.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/layout/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no token required */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes — ProtectedRoute checks for token, redirects to /login if missing */}
        <Route
          path="/board"
          element={
            <ProtectedRoute>
              <div className="p-8 text-xl font-bold">Board coming soon</div>
            </ProtectedRoute>
          }
        />

        {/* Catch-all — redirect any unknown path to /board */}
        <Route path="*" element={<Navigate to="/board" />} />
      </Routes>
    </BrowserRouter>
  )
}
