import { useState, useCallback, useRef } from 'react'

// ─────────────────────────────────────────────
//  useSessionStats
//  Tracks per-session query metrics in memory.
//  Resets on page refresh — not persisted.
//
//  Returns:
//    stats    — { queries, cacheHits, errors, totalMs, avgMs, successRate, cacheRate }
//    record   — call after each query result to update stats
// ─────────────────────────────────────────────

export function useSessionStats() {
  const raw = useRef({ queries: 0, cacheHits: 0, errors: 0, totalMs: 0 })

  const [stats, setStats] = useState({
    queries: 0, cacheHits: 0, errors: 0,
    totalMs: 0, avgMs: 0,
    successRate: '—', cacheRate: '—',
  })

  const record = useCallback(({ success, fromCache, executionTimeMs }) => {
    const r = raw.current
    r.queries++
    if (!success) r.errors++
    if (fromCache) r.cacheHits++
    if (success && executionTimeMs) r.totalMs += executionTimeMs

    const succeeded = r.queries - r.errors
    setStats({
      queries:     r.queries,
      cacheHits:   r.cacheHits,
      errors:      r.errors,
      totalMs:     r.totalMs,
      avgMs:       succeeded > 0 ? Math.round(r.totalMs / succeeded) : 0,
      successRate: r.queries > 0 ? Math.round((succeeded / r.queries) * 100) + '%' : '—',
      cacheRate:   r.queries > 0 ? Math.round((r.cacheHits / r.queries) * 100) + '%' : '—',
    })
  }, [])

  return { stats, record }
}
