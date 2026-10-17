import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { roleLabel } from '../format'
import { MockBanner } from './MockBanner'

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      <header className="topbar">
        <Link className="brand" to="/tasks">
          Taskboard
        </Link>
        <nav className="nav" aria-label="Main">
          <NavLink to="/tasks" end data-testid="nav-board">
            My tasks
          </NavLink>
          <NavLink to="/tasks/new" data-testid="nav-new">
            New task
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" data-testid="nav-admin">
              Admin
            </NavLink>
          )}
        </nav>
        <div className="userbox">
          <span>{user?.name}</span>
          <span className="role" data-testid="user-role">
            {roleLabel(user?.role)}
          </span>
          <button type="button" onClick={handleLogout} data-testid="nav-logout">
            Sign out
          </button>
        </div>
      </header>
      <MockBanner />
      <main className="page">
        <Outlet />
      </main>
    </>
  )
}
