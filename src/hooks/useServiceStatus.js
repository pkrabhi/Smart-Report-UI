import { useState, useEffect, useCallback } from 'react'
import { fetchStatus } from '../utils/api'

export function useServiceStatus(apiBase) {
  const [status, setStatus] = useState(null)   // null = unknown, true/false = up/down
  const [info, setInfo]     = useState(null)
  const [checking, setChecking] = useState(false)

  const check = useCallback(async () => {
    setChecking(true)
    try {
      const data = await fetchStatus(apiBase)
      setStatus(true)
      setInfo(data)
    } catch {
      setStatus(false)
      setInfo(null)
    } finally {
      setChecking(false)
    }
  }, [apiBase])

  useEffect(() => {
    check()
    const interval = setInterval(check, 30_000) // recheck every 30s
    return () => clearInterval(interval)
  }, [check])

  return { status, info, checking, recheck: check }
}
