import { useState, useCallback } from 'react'

const SESSION_KEY  = 'sq_auth_session'
const ADMIN_PW_KEY = 'sq_admin_password'
export const DEFAULT_ADMIN_PW = 'kmc@admin'

export function getAdminPassword() {
  return localStorage.getItem(ADMIN_PW_KEY) || DEFAULT_ADMIN_PW
}

export function setAdminPassword(pw) {
  if (pw) localStorage.setItem(ADMIN_PW_KEY, pw)
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function useAuth() {
  const [session, setSession] = useState(loadSession)

  const login = useCallback((name, role) => {
    const s = { name, role, loginTime: Date.now() }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s))
    setSession(s)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  return {
    session,
    login,
    logout,
    isAdmin:    session?.role === 'admin',
    isLoggedIn: !!session,
  }
}
