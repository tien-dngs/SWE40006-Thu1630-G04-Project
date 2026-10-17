import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { usingMockApi } from '../api'
import { useAuth } from '../auth/useAuth'
import { MockBanner } from '../components/MockBanner'

export function LoginPage() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/tasks" replace />

  function validate() {
    const next = {}
    const trimmed = email.trim()
    if (!trimmed) next.email = 'Enter your email.'
    else if (!trimmed.includes('@')) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Enter your password.'
    return next
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      setFormError(err.message || 'Sign-in failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <MockBanner />
      <main className="login-wrap">
        <section className="panel">
          <h1>Sign in</h1>
          <p className="lede">Use your Taskboard account to see your tasks.</p>
          <form onSubmit={handleSubmit} noValidate data-testid="login-form">
            {formError && (
              <p className="error" role="alert" data-testid="error-message">
                {formError}
              </p>
            )}
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                data-testid="login-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                data-testid="login-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>
            <button type="submit" className="primary" data-testid="login-submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          {usingMockApi && (
            <aside className="demo" data-testid="demo-accounts">
              <h2>Development sign-in</h2>
              <ul>
                <li>
                  <span>alex@example.com</span> / password — Standard User
                </li>
                <li>
                  <span>jordan@example.com</span> / password — Admin
                </li>
              </ul>
            </aside>
          )}
        </section>
      </main>
    </>
  )
}
