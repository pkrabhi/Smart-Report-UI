import { useState, useEffect, useRef } from 'react'
import { Clock, Star, Lightbulb, Search, Brain } from 'lucide-react'

// ─────────────────────────────────────────────
//  AutocompleteDropdown
//  Shows matching queries from history + suggestions
//  as user types. Keyboard navigable.
// ─────────────────────────────────────────────

// Simple fuzzy match — checks if all words in query appear in target
function fuzzyMatch(query, target) {
  if (!query || !target) return false
  const words = query.toLowerCase().trim().split(/\s+/)
  const t = target.toLowerCase()
  return words.every(w => t.includes(w))
}

export default function AutocompleteDropdown({
  query,
  history = [],
  suggestions = [],
  favorites = [],
  aiExamples = [],
  onSelect,
  visible,
  onClose,
  accentColor = '#3949AB',
  isDark = true,
}) {
  const [activeIdx, setActiveIdx] = useState(-1)
  const listRef = useRef(null)

  const trimmed = (query || '').trim()
  const matches = []

  if (trimmed.length >= 2) {
    // Favorites first
    for (const f of favorites) {
      if (fuzzyMatch(trimmed, f.question) && matches.length < 3)
        matches.push({ text: f.question, type: 'favorite', icon: Star })
    }
    // History
    for (const h of history) {
      if (fuzzyMatch(trimmed, h.question) && !matches.some(m => m.text === h.question) && matches.length < 6)
        matches.push({ text: h.question, type: 'history', icon: Clock })
    }
    // AI Examples
    for (const e of aiExamples) {
      if (fuzzyMatch(trimmed, e.question) && !matches.some(m => m.text === e.question) && matches.length < 10)
        matches.push({ text: e.question, type: 'example', icon: Brain, meta: e.category })
    }
    // Module suggestions
    for (const s of suggestions) {
      if (fuzzyMatch(trimmed, s.text) && !matches.some(m => m.text === s.text) && matches.length < 12)
        matches.push({ text: s.text, type: 'suggestion', icon: Lightbulb })
    }
  }

  useEffect(() => { setActiveIdx(-1) }, [trimmed])

  useEffect(() => {
    if (!visible || matches.length === 0) return
    const handleKey = (e) => {
      if (e.key === 'ArrowDown')  { e.preventDefault(); setActiveIdx(i => (i + 1) % matches.length) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => (i - 1 + matches.length) % matches.length) }
      else if (e.key === 'Enter' && activeIdx >= 0 && !e.ctrlKey && !e.metaKey) { e.preventDefault(); onSelect(matches[activeIdx].text); onClose() }
      else if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [visible, matches, activeIdx, onSelect, onClose])

  if (!visible || matches.length === 0) return null

  // Theme tokens
  const bg       = isDark ? 'rgba(10,12,40,0.96)'        : '#fff'
  const border   = isDark ? 'rgba(255,255,255,0.13)'      : '#E0E0E0'
  const headerCl = isDark ? 'rgba(180,185,240,0.35)'      : '#BDBDBD'
  const textPri  = isDark ? 'rgba(220,222,255,0.90)'      : '#1E2A4A'

  const typeColor = {
    favorite:   isDark ? '#fbbf24' : '#E65100',
    history:    isDark ? 'rgba(139,148,255,0.88)' : '#5C6BC0',
    example:    isDark ? 'rgba(96,165,250,0.88)'  : '#1565C0',
    suggestion: isDark ? 'rgba(52,211,153,0.88)'  : '#2E7D32',
  }

  return (
    <div ref={listRef} style={{
      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
      background: bg,
      backdropFilter: isDark ? 'blur(18px) saturate(1.5)' : 'none',
      WebkitBackdropFilter: isDark ? 'blur(18px) saturate(1.5)' : 'none',
      borderRadius: '0 0 12px 12px',
      border: `1px solid ${border}`, borderTop: 'none',
      boxShadow: isDark
        ? '0 16px 48px rgba(0,0,30,0.55), inset 0 -1.5px 0 rgba(255,255,255,0.06)'
        : '0 8px 24px rgba(0,0,0,0.12)',
      maxHeight: 320, overflowY: 'auto',
    }}>
      <div style={{ padding: '6px 10px 4px', fontSize: 9, color: headerCl, fontWeight: 700, letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter', sans-serif" }}>
        <Search size={9} /> SUGGESTIONS · ↑↓ navigate · Enter select
      </div>
      {matches.map((m, i) => (
        <div
          key={m.text + m.type}
          onClick={() => { onSelect(m.text); onClose() }}
          onMouseEnter={() => setActiveIdx(i)}
          style={{
            padding: '8px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            background: activeIdx === i
              ? isDark ? `${accentColor}18` : `${accentColor}08`
              : 'transparent',
            borderLeft: activeIdx === i ? `3px solid ${accentColor}` : '3px solid transparent',
            transition: 'all 0.1s',
          }}
        >
          <m.icon size={13} color={typeColor[m.type]} />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 12, color: textPri, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Inter', sans-serif" }}>
              {highlightMatch(m.text, trimmed, accentColor, isDark)}
            </div>
            {m.meta && (
              <div style={{ fontSize: 9.5, color: headerCl, marginTop: 1, fontFamily: "'Inter', sans-serif" }}>{m.meta}</div>
            )}
          </div>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
            background: typeColor[m.type] + (isDark ? '22' : '12'),
            color: typeColor[m.type], whiteSpace: 'nowrap',
            fontFamily: "'Inter', sans-serif",
          }}>
            {m.type === 'example' ? 'AI example' : m.type}
          </span>
        </div>
      ))}
    </div>
  )
}

function highlightMatch(text, query, accentColor = '#3949AB', isDark = true) {
  if (!query) return text
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const lowerText = text.toLowerCase()
  const highlights = []

  for (const word of words) {
    const pos = lowerText.indexOf(word)
    if (pos >= 0) highlights.push({ start: pos, end: pos + word.length })
  }

  highlights.sort((a, b) => a.start - b.start)
  const merged = []
  for (const h of highlights) {
    if (merged.length && h.start <= merged[merged.length - 1].end) {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, h.end)
    } else {
      merged.push({ ...h })
    }
  }

  const parts = []
  let lastEnd = 0
  for (const h of merged) {
    if (h.start > lastEnd) parts.push(<span key={lastEnd}>{text.slice(lastEnd, h.start)}</span>)
    parts.push(
      <strong key={h.start} style={{ color: accentColor, fontWeight: 800 }}>
        {text.slice(h.start, h.end)}
      </strong>
    )
    lastEnd = h.end
  }
  if (lastEnd < text.length) parts.push(<span key={lastEnd}>{text.slice(lastEnd)}</span>)
  return parts.length ? parts : text
}
