import { useState } from 'react'
import { api } from '../api'
import { AuthContext } from './context'

const SESSION_KEY = 'taskboard.session'

function readStoredUser() {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const trusted = api.setSession(JSON.parse(raw))
    if (!trusted) sessionStorage.removeItem(SESSION_KEY)
    return trusted
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    api.setSession(null)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  async function login(email, password) {
    const next = await api.login({ email, password })
    const trusted = api.setSession(next) ?? next
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(trusted))
    setUser(trusted)
  }

  function logout() {
    api.setSession(null)
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}
