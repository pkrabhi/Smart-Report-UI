import { useState, useCallback, useRef } from 'react'
import { explainResults } from '../utils/api'

// ─────────────────────────────────────────────
//  useStreamingQuery — SSE with Direct Backend Connection
//
//  Vite's HTTP proxy buffers POST responses and kills SSE.
//  Solution: Connect directly to the Node backend for /ask-stream.
//  Node already has cors() enabled, so direct connections work.
//
//  Fallback: If SSE fails for ANY reason, automatically
//  falls back to the regular /ask endpoint through Vite proxy.
// ─────────────────────────────────────────────

// Resolve the DIRECT backend URL for SSE (bypasses Vite proxy)
// Vite proxy: /api/smart-query → http://localhost:8101/smart-query-service/api/smart-query
// Direct:     http://localhost:8101/smart-query-service/api/smart-query/ask-stream
function resolveStreamUrl(apiBase) {
  // If apiBase is already a full URL (http://...), use it directly
  if (apiBase.startsWith('http')) {
    return `${apiBase}/ask-stream`
  }
  // During development: apiBase is "/api/smart-query" (Vite proxy path)
  // We need to connect directly to the Node backend
  const backendHost = window.location.hostname  // same host in dev
  const backendPort = 8101                      // Node backend port
  return `http://${backendHost}:${backendPort}/smart-query-service${apiBase}/ask-stream`
}

export function useStreamingQuery({ apiBase, onHistoryUpdate }) {
  const [loading, setLoading]           = useState(false)
  const [pipelineStep, setPipelineStep] = useState(0)
  const [stepLabel, setStepLabel]       = useState('')
  const [streamingSql, setStreamingSql] = useState('')
  const [result, setResult]             = useState(null)
  const [error, setError]               = useState(null)

  // Insight state
  const [insight, setInsight]               = useState(null)
  const [insightLoading, setInsightLoading] = useState(false)
  const [insightError, setInsightError]     = useState(null)

  const abortRef = useRef(null)

  const reset = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null }
    setResult(null)
    setError(null)
    setPipelineStep(0)
    setStepLabel('')
    setStreamingSql('')
    setLoading(false)
    setInsight(null)
    setInsightLoading(false)
    setInsightError(null)
  }, [])

  // ── Fetch AI Insight ──
  const fetchInsight = useCallback(async ({ question, moduleCode, columns, data, generatedSql }) => {
    setInsightLoading(true)
    setInsightError(null)
    setInsight(null)
    try {
      const res = await explainResults({ apiBase, question, moduleCode, columns, data, generatedSql })
      if (res.success && res.insight) {
        setInsight(res.insight)
      } else {
        setInsightError(res.errorDetail || 'Could not generate insight.')
      }
    } catch (err) {
      setInsightError(err.message)
    } finally {
      setInsightLoading(false)
    }
  }, [apiBase])

  const dismissInsight = useCallback(() => {
    setInsight(null); setInsightLoading(false); setInsightError(null)
  }, [])

  // ── SSE Streaming Attempt ──
  // Defined BEFORE runQuery so runQuery's closure always finds the latest version
  const tryStreaming = useCallback(async (body, question, moduleCode) => {
    const streamUrl = resolveStreamUrl(apiBase)
    let eventsReceived = 0
    // ✅ FIX: Track whether a terminal event (result/error) was received.
    // If SSE stream ends with step events but NO result/error (e.g. Nemotron
    // takes 40-60s and browser closes connection mid-wait), eventsReceived > 0
    // so the old code returned true — fallback never triggered — blank UI state.
    let terminalReceived = false

    try {
      const controller = new AbortController()
      abortRef.current = controller

      // Set step 1 immediately to show pipeline
      setPipelineStep(1)
      setStepLabel('Connecting to streaming endpoint…')

      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        console.warn(`[SSE] Stream response: ${response.status}`)
        return false  // trigger fallback
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          // Skip SSE comments (heartbeats/keepalives)
          if (line.startsWith(':')) continue
          if (!line.startsWith('data: ')) continue

          const jsonStr = line.slice(6).trim()
          if (!jsonStr || jsonStr === '[DONE]') continue

          try {
            const evt = JSON.parse(jsonStr)
            eventsReceived++

            switch (evt.type) {
              case 'step':
                setPipelineStep(evt.step)
                if (evt.label) setStepLabel(evt.label)
                break

              case 'sql_token':
                setStreamingSql(prev => prev + evt.token)
                break

              case 'sql_done':
                setStreamingSql(evt.sql || '')
                break

              case 'result':
                terminalReceived = true
                if (evt.success) {
                  setResult(evt)
                  onHistoryUpdate?.({
                    id: evt.queryId, question, moduleCode,
                    rowCount: evt.rowCount, source: evt.source,
                    executionTimeMs: evt.executionTimeMs,
                    timestamp: new Date().toISOString(),
                    generatedSql: evt.generatedSql,
                  })
                  if (evt.rowCount > 0) {
                    fetchInsight({
                      question, moduleCode,
                      columns: evt.columns, data: evt.data,
                      generatedSql: evt.generatedSql,
                    })
                  }
                } else {
                  setError({ type: evt.errorType, message: evt.errorDetail })
                }
                break

              case 'error':
                terminalReceived = true
                setError({ type: evt.errorType || 'STREAM_ERROR', message: evt.errorDetail || evt.message })
                break
            }
          } catch (parseErr) {
            console.warn('[SSE] Parse error:', parseErr.message)
          }
        }
      }

      // Stream ended — evaluate outcome
      if (eventsReceived === 0) {
        console.warn('[SSE] Stream ended with 0 events — likely proxy buffering issue')
        return false  // trigger fallback
      }

      if (!terminalReceived) {
        // ✅ FIX: Got step events but stream closed before result/error arrived.
        // This happens with slow models (Nemotron 40-60s) — connection drops mid-wait.
        // Must trigger fallback so the query is re-sent via POST /ask.
        console.warn('[SSE] Stream closed without result/error — triggering fallback')
        return false
      }

      return true  // streaming worked and result was received

    } catch (err) {
      if (err.name === 'AbortError') return true  // user cancelled intentionally — don't fallback
      console.warn('[SSE] Stream error:', err.message)
      return false  // trigger fallback
    } finally {
      // Only clean up loading state if streaming fully delivered a result.
      // If fallback will run, leave loading=true so UI stays in loading state.
      if (terminalReceived) {
        setLoading(false)
        setPipelineStep(0)
        setStepLabel('')
      } else if (eventsReceived === 0) {
        // Zero events — cleanup so fallback can take over cleanly
        setStreamingSql('')
      }
      abortRef.current = null
    }
  }, [apiBase, onHistoryUpdate, fetchInsight])

  // ── Fallback: Regular (non-streaming) /ask ──
  const fallbackRegularQuery = useCallback(async ({ question, moduleCode, userId, filters, previousQuestion, previousSql }) => {
    const delay = (ms) => new Promise(r => setTimeout(r, ms))

    try {
      setPipelineStep(1)
      setStepLabel('Loading schema context…')
      await delay(600)

      setPipelineStep(2)
      setStepLabel('AI is generating SQL — NVIDIA NIM processing… (this may take 10–60s)')

      const body = {
        question: question.trim(),
        moduleCode,
        userId: userId || 'erp_user',
        ...filters,
      }
      if (previousQuestion) body.previousQuestion = previousQuestion
      if (previousSql) body.previousSql = previousSql

      const res = await fetch(`${apiBase}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      setPipelineStep(3)
      setStepLabel('Validating SQL — safety checks…')
      await delay(350)

      setPipelineStep(4)
      setStepLabel('Executing on PostgreSQL…')
      await delay(350)

      if (data.success) {
        setResult(data)
        onHistoryUpdate?.({
          id: data.queryId, question, moduleCode,
          rowCount: data.rowCount, source: data.source,
          executionTimeMs: data.executionTimeMs,
          timestamp: new Date().toISOString(),
          generatedSql: data.generatedSql,
        })
        if (data.rowCount > 0) {
          fetchInsight({
            question, moduleCode,
            columns: data.columns, data: data.data,
            generatedSql: data.generatedSql,
          })
        }
      } else {
        setError({ type: data.errorType, message: data.errorDetail })
      }
    } catch (err) {
      setError({ type: 'CONNECTION_ERROR', message: err.message })
    } finally {
      setLoading(false)
      setPipelineStep(0)
      setStepLabel('')
    }
  }, [apiBase, onHistoryUpdate, fetchInsight])

  // ── Main Query — tries SSE streaming, falls back to regular /ask ──
  // Defined AFTER tryStreaming and fallbackRegularQuery so deps are always fresh
  const runQuery = useCallback(async ({ question, moduleCode, userId, filters, previousQuestion, previousSql }) => {
    if (!question.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)
    setPipelineStep(0)
    setStepLabel('')
    setStreamingSql('')
    setInsight(null)
    setInsightError(null)

    const body = {
      question: question.trim(),
      moduleCode,
      userId: userId || 'erp_user',
      ...filters,
    }
    if (previousQuestion) body.previousQuestion = previousQuestion
    if (previousSql) body.previousSql = previousSql

    // Try SSE streaming first, fall back to regular /ask
    const streamingWorked = await tryStreaming(body, question, moduleCode)

    if (!streamingWorked) {
      console.log('[Query] SSE streaming failed or unavailable — falling back to /ask')
      await fallbackRegularQuery({ question, moduleCode, userId, filters, previousQuestion, previousSql })
    }
  // ✅ Include tryStreaming + fallbackRegularQuery in deps to prevent stale closures
  }, [apiBase, onHistoryUpdate, fetchInsight, tryStreaming, fallbackRegularQuery])

  // ── CSV Export ──
  const downloadCsv = useCallback(async (question) => {
    if (!result) return
    try {
      const res = await fetch(`${apiBase}/export-csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns: result.columns, data: result.data, queryId: result.queryId }),
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `SmartQuery_${result.queryId || 'export'}.csv`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(`CSV export failed: ${err.message}`)
    }
  }, [apiBase, result])

  return {
    loading, pipelineStep, stepLabel, streamingSql,
    result, error,
    runQuery, downloadCsv, reset,
    insight, insightLoading, insightError, fetchInsight, dismissInsight,
  }
}
