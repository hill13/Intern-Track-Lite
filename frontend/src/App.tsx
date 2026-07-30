// App.tsx — Root component
// Sets up React Router with all application routes.
// Public routes (login, register) are accessible without a token.
// Protected routes nest under Layout (which renders Nav) via <Outlet />.
// ProtectedRoute wraps Layout so the auth check happens once for all children.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Layout from './components/layout/Layout'
import Board from './pages/Board'
import Stats from './pages/Stats'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no token required */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes — ProtectedRoute wraps Layout, Layout provides Nav via <Outlet /> */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/board" element={<Board />} />
          <Route path="/stats" element={<Stats />} />
        </Route>

        {/* Catch-all — redirect any unknown path to /board */}
        <Route path="*" element={<Navigate to="/board" />} />
      </Routes>
    </BrowserRouter>
  )
}
