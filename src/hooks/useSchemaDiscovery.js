import { useState, useCallback, useEffect } from 'react'
import { fetchSchemaDiscover, postSchemaRefresh, fetchSchemaStatus, fetchSchemaDiff } from '../utils/api.js'

/**
 * useSchemaDiscovery
 * ─────────────────────────────────────────────
 * Manages schema auto-discovery state:
 *  • Loads discovered schema on mount / module change
 *  • Exposes refresh() to force re-introspect the DB
 *  • Tracks diff between current and previous snapshot
 *  • Provides per-module cache status
 */
export function useSchemaDiscovery({ apiBase, moduleCode }) {
  const [schema,       setSchema]       = useState(null)
  const [status,       setStatus]       = useState(null)
  const [diff,         setDiff]         = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [refreshing,   setRefreshing]   = useState(false)
  const [error,        setError]        = useState(null)
  const [lastFetched,  setLastFetched]  = useState(null)

  const loadSchema = useCallback(async () => {
    if (!apiBase || !moduleCode) return
    setLoading(true)
    setError(null)
    try {
      const [schemaRes, statusRes, diffRes] = await Promise.all([
        fetchSchemaDiscover({ apiBase, moduleCode }),
        fetchSchemaStatus({ apiBase }),
        fetchSchemaDiff({ apiBase, moduleCode }),
      ])
      setSchema(schemaRes)
      setStatus(statusRes.modules || {})
      setDiff(diffRes.diff || null)
      setLastFetched(new Date())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [apiBase, moduleCode])

  const refresh = useCallback(async () => {
    if (!apiBase || !moduleCode) return
    setRefreshing(true)
    setError(null)
    try {
      await postSchemaRefresh({ apiBase, moduleCode })
      // Reload everything after refresh
      await loadSchema()
    } catch (e) {
      setError(e.message)
    } finally {
      setRefreshing(false)
    }
  }, [apiBase, moduleCode, loadSchema])

  // Load on mount and when module changes
  useEffect(() => {
    loadSchema()
  }, [loadSchema])

  return {
    schema,
    status,
    diff,
    loading,
    refreshing,
    error,
    lastFetched,
    refresh,
    reload: loadSchema,
  }
}
