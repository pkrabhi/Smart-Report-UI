// ─────────────────────────────────────────────
//  KMC Smart Query  —  API Service
// ─────────────────────────────────────────────

const DEFAULT_TIMEOUT = 90_000 // 90s for AI generation

async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(id)
    return res
  } catch (err) {
    clearTimeout(id)
    if (err.name === 'AbortError') throw new Error(`Request timed out after ${timeout / 1000}s`)
    throw err
  }
}

// ── Ask (NL → SQL → Execute) ────────────────
export async function askQuery({ apiBase, question, moduleCode, userId = 'erp_user', filters = {}, previousQuestion, previousSql }) {
  const body = {
    question: question.trim(),
    moduleCode,
    userId,
    ...filters,
  }

  // Follow-up context (Node backend uses these for contextual SQL generation)
  if (previousQuestion) body.previousQuestion = previousQuestion
  if (previousSql)      body.previousSql = previousSql

  const res = await fetchWithTimeout(
    `${apiBase}/ask`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    90_000
  )

  if (!res.ok) {
    const txt = await res.text().catch(() => 'Unknown error')
    throw new Error(`HTTP ${res.status}: ${txt}`)
  }

  return res.json()
}

// ── Explain Results (AI Summary) ─────────────
// Sends top rows + column info back to LLM for natural language insight.
// Called AFTER a successful query result.
export async function explainResults({ apiBase, question, moduleCode, columns, data, generatedSql }) {
  // Send only top 30 rows to keep token count manageable
  const sampleData = data.slice(0, 30)

  const body = {
    question,
    moduleCode,
    columns,
    sampleData,
    generatedSql,
    rowCount: data.length,
  }

  const res = await fetchWithTimeout(
    `${apiBase}/explain`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    30_000   // 30s timeout for summary — shorter than main query
  )

  if (!res.ok) {
    const txt = await res.text().catch(() => 'Unknown error')
    throw new Error(`Explain failed: HTTP ${res.status} — ${txt}`)
  }

  return res.json()
}

// ── Service Status ───────────────────────────
export async function fetchStatus(apiBase) {
  const res = await fetchWithTimeout(`${apiBase}/status`, {}, 8_000)
  if (!res.ok) throw new Error(`Status check failed: HTTP ${res.status}`)
  return res.json()
}

// ── Health Check ────────────────────────────
export async function fetchHealth(apiBase) {
  // Health endpoint is at actuator level
  const healthUrl = apiBase.replace('/api/smart-query', '/actuator/health')
  const res = await fetchWithTimeout(healthUrl, {}, 5_000)
  if (!res.ok) throw new Error(`Health check failed: HTTP ${res.status}`)
  return res.json()
}

// ── CSV Filename Builder ─────────────────────
// Extracts meaningful keywords from the question — strips filler words.
//
// "Show all active tenders for ward 5"       → Active_Tenders_Ward_5_20260401.csv
// "List pending invoices for PO-001"         → Pending_Invoices_PO001_20260401.csv
// "How many stalls are pending payment?"     → Stalls_Pending_Payment_20260401.csv
// "Total stallage collection for year 2526"  → Stallage_Collection_Year_2526_20260401.csv

const STOP_WORDS = new Set([
  // question starters
  'show', 'list', 'find', 'get', 'fetch', 'give', 'display', 'tell', 'provide',
  'what', 'how', 'which', 'where', 'when', 'who', 'can', 'could', 'please',
  // articles & determiners
  'a', 'an', 'the', 'all', 'every', 'each', 'any', 'some', 'many', 'much',
  'this', 'that', 'these', 'those', 'their', 'its', 'my', 'our', 'your',
  // prepositions
  'for', 'in', 'of', 'at', 'by', 'with', 'from', 'to', 'on', 'into', 'about',
  'between', 'across', 'through', 'during', 'before', 'after', 'above', 'below',
  // conjunctions & misc
  'and', 'or', 'but', 'also', 'more', 'most', 'than',
  // verbs & pronouns
  'are', 'is', 'be', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did',
  'me', 'us', 'i', 'we', 'they', 'he', 'she', 'it',
])

function buildCsvFilename(question, queryId) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')

  if (question && question.trim()) {
    const keywords = question
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, ' ')        // strip punctuation
      .split(/\s+/)                              // split into words
      .filter(w => w.length > 1)                  // drop single chars
      .filter(w => !STOP_WORDS.has(w.toLowerCase())) // drop filler words
      .slice(0, 5)                                // keep max 5 keywords
      .map(w => w.charAt(0).toUpperCase() + w.slice(1)) // TitleCase
      .join('_')

    if (keywords) return `${keywords}_${date}.csv`
  }

  return `SmartQuery_${queryId || 'export'}_${date}.csv`
}

// ── Export PDF ──────────────────────────────
const PDF_STOP_WORDS = new Set([
  'what','how','many','show','me','get','list','find','give','display','fetch',
  'all','the','a','an','of','in','for','to','with','and','or','is','are',
  'was','were','be','been','have','has','had','do','does','did','will','would',
  'could','should','that','this','these','those','from','by','on','at','as',
  'into','during','before','after','between','each','every','some','no','not',
  'where','which','who','when','why','per','its','their','our','my','your',
])

function questionToSlug(question, maxWords = 6) {
  const words = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !PDF_STOP_WORDS.has(w))
    .slice(0, maxWords)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
  return words.length > 0 ? words.join('_') : 'Report'
}

export async function exportPdf({ apiBase, columns, data, question, moduleCode, queryId, source, executionTimeMs, generatedSql }) {
  const res = await fetchWithTimeout(
    `${apiBase}/export-pdf`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columns, data, question, moduleCode, queryId, source, executionTimeMs, generatedSql }),
    },
    60_000   // 60s — large tables take time to render
  )

  if (!res.ok) {
    // Try to extract server error message from JSON body
    let msg = `HTTP ${res.status}`
    try {
      const ct = res.headers.get('content-type') || ''
      if (ct.includes('application/json')) {
        const json = await res.json()
        msg = json.error || json.errorDetail || msg
      } else {
        msg = (await res.text()) || msg
      }
    } catch {}
    throw new Error(`PDF export failed: ${msg}`)
  }

  const blob = await res.blob()
  if (blob.size === 0) throw new Error('PDF export failed: empty response from server')

  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  const slug  = questionToSlug(question || queryId || 'Report')
  const date  = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  a.download  = `KMC_${slug}_${date}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Export CSV ──────────────────────────────
export async function exportCsv({ apiBase, columns, data, queryId, question }) {
  const res = await fetchWithTimeout(
    `${apiBase}/export-csv`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columns, data, queryId }),
    },
    15_000
  )

  if (!res.ok) throw new Error(`Export failed: HTTP ${res.status}`)

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = buildCsvFilename(question, queryId)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Local Storage helpers ───────────────────
const HISTORY_KEY = 'kmc_sq_history'
const SETTINGS_KEY = 'kmc_sq_settings'

export function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [] }
  catch { return [] }
}

export function saveHistory(history) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30))) }
  catch {}
}

export function loadSettings() {
  try {
    return {
      apiBase: '/api/smart-query',
      darkMode: true,
      maxTableRows: 500,
      userId: 'erp_user',
      ...JSON.parse(localStorage.getItem(SETTINGS_KEY)),
    }
  } catch {
    return { apiBase: '/api/smart-query', darkMode: true, maxTableRows: 500, userId: 'erp_user' }
  }
}

export function saveSettings(settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) }
  catch {}
}

// ── Feedback (self-improving loop) ──────────
export async function submitFeedback({ apiBase, question, sql, moduleCode, queryId, isCorrect, suggestedCategory }) {
  const res = await fetchWithTimeout(
    `${apiBase}/feedback`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, sql, moduleCode, queryId, isCorrect, suggestedCategory }),
    },
    10_000
  )
  if (!res.ok) {
    const txt = await res.text().catch(() => 'Unknown error')
    throw new Error(`Feedback failed: HTTP ${res.status} — ${txt}`)
  }
  return res.json()
}

export async function fetchFeedbackStats({ apiBase, moduleCode }) {
  const res = await fetchWithTimeout(
    `${apiBase}/feedback/stats?moduleCode=${moduleCode}`,
    {},
    8_000
  )
  if (!res.ok) throw new Error(`Feedback stats failed: HTTP ${res.status}`)
  return res.json()
}

// ── Fetch example questions (for smart autocomplete) ────
export async function fetchExamples({ apiBase, moduleCode }) {
  const res = await fetchWithTimeout(
    `${apiBase}/examples?moduleCode=${moduleCode}`,
    {},
    8_000
  )
  if (!res.ok) throw new Error(`Examples fetch failed: HTTP ${res.status}`)
  return res.json()
}

// ─────────────────────────────────────────────
//  Zero-shot Schema Auto-Discovery API
// ─────────────────────────────────────────────

/** GET /schema/discover?moduleCode=MARKET — get (or auto-trigger) discovered schema */
export async function fetchSchemaDiscover({ apiBase, moduleCode }) {
  const res = await fetchWithTimeout(
    `${apiBase}/schema/discover?moduleCode=${moduleCode}`,
    {},
    60_000   // first discovery can take a while (many information_schema queries)
  )
  if (!res.ok) throw new Error(`Schema discover failed: HTTP ${res.status}`)
  return res.json()
}

/** POST /schema/refresh?moduleCode=MARKET — force re-introspect the DB */
export async function postSchemaRefresh({ apiBase, moduleCode }) {
  const res = await fetchWithTimeout(
    `${apiBase}/schema/refresh?moduleCode=${moduleCode}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' },
    60_000
  )
  if (!res.ok) throw new Error(`Schema refresh failed: HTTP ${res.status}`)
  return res.json()
}

/** GET /schema/status — cache metadata for all modules */
export async function fetchSchemaStatus({ apiBase }) {
  const res = await fetchWithTimeout(`${apiBase}/schema/status`, {}, 8_000)
  if (!res.ok) throw new Error(`Schema status failed: HTTP ${res.status}`)
  return res.json()
}

/** GET /schema/diff?moduleCode=MARKET — diff between current and previous snapshot */
export async function fetchSchemaDiff({ apiBase, moduleCode }) {
  const res = await fetchWithTimeout(
    `${apiBase}/schema/diff?moduleCode=${moduleCode}`,
    {},
    8_000
  )
  if (!res.ok) throw new Error(`Schema diff failed: HTTP ${res.status}`)
  return res.json()
}
