import { Outlet } from 'react-router-dom'
import Nav from './Nav'

// Layout route wrapper — renders the shared Nav above whatever child route matches.
// Child pages fill the <Outlet /> slot (see App.tsx route nesting).
export default function Layout() {
  return (
    <>
      <Nav />
      <Outlet />
    </>
  )
}
