import { useState, useRef, useCallback, useMemo } from 'react'
import { MODULE_CONFIG } from '../config/modules'
import { ICONS, Spinner } from '../utils/icons'
import { ChevronRight, X, Mic, MicOff } from 'lucide-react'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { glassStyle } from '../config/theme'
import AutocompleteDropdown from './AutocompleteDropdown'

export default function QueryInput({
  module, question, setQuestion, filters, setFilters,
  onSubmit, loading, history = [], favorites = [], aiExamples = [],
  inputRef, isDark = true, glassOpacity = 1,
}) {
  const [filtersOpen, setFiltersOpen]       = useState(false)
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [ripples, setRipples]               = useState([])
  const cfg = MODULE_CONFIG[module]

  // Water ripple
  const addRipple = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const id   = Date.now() + Math.random()
    setRipples(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 720)
  }, [])

  const textareaRef = useRef(null)
  const setRefs     = useCallback((el) => {
    textareaRef.current = el
    if (typeof inputRef === 'function') inputRef(el)
    else if (inputRef) inputRef.current = el
  }, [inputRef])

  // Voice input
  const handleVoiceTranscript = useCallback((text) => {
    setQuestion(prev => {
      const spacer = prev && !prev.endsWith(' ') ? ' ' : ''
      return prev + spacer + text
    })
    textareaRef.current?.focus()
  }, [setQuestion])

  const { listening, interim, isSupported: voiceSupported, toggleListening } = useVoiceInput({
    onTranscript: handleVoiceTranscript,
    language: 'en-IN',
  })

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onSubmit() }
  }
  const setFilter    = (key, val) => setFilters(p => ({ ...p, [key]: val }))
  const clearFilters = () => setFilters({})
  const activeCount  = Object.values(filters).filter(Boolean).length

  // ── Theme tokens ──────────────────────────────────────────
  const accent   = cfg.accentColor
  const glass    = useMemo(() => glassStyle({ accentHex: accent, isDark, radius: 22, glassOpacity }), [accent, isDark, glassOpacity])
  const txt1     = isDark ? 'rgba(220,222,255,0.92)' : '#1a1f3c'
  const txt2     = isDark ? 'rgba(180,185,240,0.55)' : 'rgba(26,31,60,0.44)'
  const labelClr = isDark ? 'rgba(180,185,240,0.45)' : 'rgba(26,31,60,0.38)'
  const divClr   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(26,31,60,0.07)'

  // Sunken-well input style (textarea + filters)
  const wellStyle = {
    width: '100%', padding: '10px 14px',
    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(220,222,255,0.70)'}`,
    borderRadius: 12,
    fontSize: 13, color: txt1, outline: 'none',
    fontFamily: "'Inter', sans-serif",
    background: isDark ? 'rgba(0,0,20,0.28)' : 'rgba(255,255,255,0.95)',
    // Only blur in dark mode
    backdropFilter:       isDark ? 'blur(12px)' : 'none',
    WebkitBackdropFilter: isDark ? 'blur(12px)' : 'none',
    boxShadow: [
      `inset 0 2px 8px ${isDark ? 'rgba(0,0,30,0.35)' : 'rgba(0,0,30,0.06)'}`,
      `inset 0 -1px 0 ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.80)'}`,
      `0 1px 4px ${isDark ? 'rgba(0,0,30,0.18)' : 'rgba(0,0,20,0.04)'}`,
    ].join(', '),
    transition: 'border-color 0.18s, background 0.18s',
  }

  return (
    <div style={{ padding: '0 28px 16px' }}>
      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 5, height: 24, borderRadius: 99,
          background: `linear-gradient(180deg, ${accent}, ${accent}88)`,
          boxShadow: `0 2px 10px ${accent}60`,
        }} />
        <span style={{ fontSize: 14, fontWeight: 900, color: txt1, display: 'flex', alignItems: 'center', gap: 7, letterSpacing: '-0.2px', fontFamily: "'Inter', sans-serif" }}>
          {ICONS.search({ size: 15, color: accent })}
          Smart AI Query
        </span>
        <span style={{ fontSize: 11, color: txt2, marginLeft: 2, fontFamily: "'Inter', sans-serif" }}>
          — Ask anything in plain English
        </span>
      </div>

      {/* ══ Main Liquid Glass Card ══ */}
      <div style={{ ...glass }}>
        {/* Curved top highlight */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
          background: 'radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 100%)',
          borderRadius: '22px 22px 0 0', pointerEvents: 'none', zIndex: 1,
        }} />
        {/* Chromatic fringe — right edge */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 2,
          background: 'linear-gradient(180deg, rgba(255,0,200,0.14) 0%, rgba(0,220,255,0.14) 100%)',
          mixBlendMode: isDark ? 'screen' : 'multiply',
          pointerEvents: 'none', zIndex: 2, borderRadius: '0 22px 22px 0',
        }} />
        {/* Accent left bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
          background: `linear-gradient(180deg, ${accent}, ${accent}77)`,
          borderRadius: '22px 0 0 22px', pointerEvents: 'none', zIndex: 2,
        }} />
        {/* Moving glass sheen */}
        <div className="glass-sheen" />

        <div style={{ position: 'relative', zIndex: 3 }}>

          {/* ── Textarea + Voice ── */}
          <div style={{ padding: '16px 18px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: labelClr, letterSpacing: '1.1px', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
                Your Question
              </label>
              {voiceSupported && (
                <button
                  onClick={toggleListening}
                  disabled={loading}
                  title={listening ? 'Stop recording' : 'Voice input — speak your question'}
                  style={{
                    padding: '4px 11px', borderRadius: 20, cursor: loading ? 'not-allowed' : 'pointer',
                    border: listening
                      ? `2px solid ${isDark ? 'rgba(248,113,113,0.80)' : '#C62828'}`
                      : `1.5px solid ${isDark ? 'rgba(255,255,255,0.18)' : '#E0E0E0'}`,
                    background: listening
                      ? isDark ? 'rgba(239,68,68,0.18)' : '#FFEBEE'
                      : isDark ? 'rgba(255,255,255,0.07)' : '#FAFAFA',
                    color: listening
                      ? isDark ? 'rgba(248,113,113,0.90)' : '#C62828'
                      : txt2,
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 10, fontWeight: 700, fontFamily: "'Inter', sans-serif",
                    transition: 'all 0.2s',
                    animation: listening ? 'micPulse 1.5s infinite' : 'none',
                  }}>
                  {listening ? <MicOff size={12} /> : <Mic size={12} />}
                  {listening ? 'Stop' : 'Voice'}
                </button>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <textarea
                ref={setRefs}
                value={question}
                onChange={e => { setQuestion(e.target.value); setShowAutocomplete(true) }}
                onKeyDown={handleKeyDown}
                onFocus={(e) => {
                  if (question.trim().length >= 2) setShowAutocomplete(true)
                  e.target.style.borderColor = listening ? (isDark ? 'rgba(248,113,113,0.80)' : '#C62828') : accent
                }}
                onBlur={(e) => {
                  setTimeout(() => setShowAutocomplete(false), 200)
                  e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(220,222,255,0.70)'
                }}
                placeholder={listening ? 'Listening… speak your question' : `e.g. "${cfg.suggestions[0].text}"`}
                rows={3}
                disabled={loading}
                style={{
                  ...wellStyle,
                  resize: 'none', lineHeight: 1.6,
                  border: `1.5px solid ${
                    listening
                      ? isDark ? 'rgba(248,113,113,0.80)' : '#C62828'
                      : question.trim()
                        ? accent
                        : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(220,222,255,0.70)'
                  }`,
                  background: listening
                    ? isDark ? 'rgba(239,68,68,0.08)' : '#FFF8F8'
                    : isDark ? 'rgba(0,0,20,0.28)' : 'rgba(255,255,255,0.72)',
                }}
              />

              {/* Voice interim preview */}
              {listening && interim && (
                <div style={{
                  marginTop: 6, padding: '6px 10px', borderRadius: 6,
                  background: isDark ? 'rgba(251,191,36,0.12)' : '#FFF3E0',
                  border: `1px solid ${isDark ? 'rgba(251,191,36,0.28)' : '#FFE0B2'}`,
                  fontSize: 11, color: isDark ? 'rgba(251,191,36,0.88)' : '#E65100',
                  fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6,
                  animation: 'micPulse 1.5s infinite', fontFamily: "'Inter', sans-serif",
                }}>
                  <Mic size={11} color={isDark ? 'rgba(251,191,36,0.88)' : '#E65100'} />
                  {interim}…
                </div>
              )}

              {/* Autocomplete dropdown */}
              <AutocompleteDropdown
                query={question}
                history={history}
                suggestions={cfg.suggestions}
                favorites={favorites}
                aiExamples={aiExamples}
                visible={showAutocomplete && !listening && !loading}
                accentColor={accent}
                isDark={isDark}
                onSelect={(text) => { setQuestion(text); setShowAutocomplete(false) }}
                onClose={() => setShowAutocomplete(false)}
              />
            </div>
          </div>

          {/* ── Quick Suggestions ── */}
          <div style={{ padding: '0 18px 14px' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: labelClr, letterSpacing: '1.2px', marginBottom: 8, textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
              Quick Suggestions
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {cfg.suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setQuestion(s.text); textareaRef.current?.focus() }}
                  disabled={loading}
                  style={{
                    position: 'relative', overflow: 'hidden',
                    padding: '6px 14px', borderRadius: 999,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.92)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.13)' : 'rgba(200,205,230,0.80)'}`,
                    // No blur on chips — too many compositing layers causes lag
                    color: isDark ? `${accent}` : cfg.tagText || accent,
                    fontSize: 11, fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    transition: 'all 0.18s ease',
                    display: 'flex', alignItems: 'center', gap: 5,
                    boxShadow: isDark
                      ? ['0 3px 10px rgba(0,0,30,0.22)', 'inset 0 1px 0 rgba(255,255,255,0.14)'].join(', ')
                      : ['0 3px 12px rgba(0,0,20,0.08)', 'inset 0 1.5px 0 rgba(255,255,255,0.98)', 'inset 0 -1px 0 rgba(0,0,20,0.04)'].join(', '),
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background   = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.92)'
                    e.currentTarget.style.borderColor  = isDark ? `${accent}55` : accent
                    e.currentTarget.style.transform    = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.72)'
                    e.currentTarget.style.borderColor  = isDark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.90)'
                    e.currentTarget.style.transform    = 'translateY(0)'
                  }}
                >
                  {ICONS[s.icon] ? ICONS[s.icon]({ size: 12, color: accent }) : null}
                  {s.text.length > 46 ? s.text.slice(0, 46) + '…' : s.text}
                </button>
              ))}
            </div>
          </div>

          {/* ── Filters Toggle ── */}
          <div style={{ borderTop: `1px solid ${divClr}` }}>
            <button
              onClick={() => setFiltersOpen(v => !v)}
              style={{
                width: '100%', padding: '10px 18px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 12, color: txt2, fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                transition: 'color 0.15s',
              }}
            >
              <ChevronRight size={12} style={{ transition: 'transform 0.2s', transform: filtersOpen ? 'rotate(90deg)' : 'none', color: txt2 }} />
              {ICONS.filter({ size: 13, color: txt2 })}
              <span>Context Filters</span>
              {activeCount > 0 && (
                <span style={{
                  background: accent, color: '#fff', borderRadius: 99,
                  fontSize: 10, padding: '1px 7px', fontWeight: 700,
                }}>
                  {activeCount} active
                </span>
              )}
              <span style={{ marginLeft: 'auto', fontSize: 10, color: isDark ? 'rgba(180,185,240,0.30)' : 'rgba(26,31,60,0.30)', fontFamily: "'Inter', sans-serif" }}>
                Helps AI generate more accurate SQL
              </span>
            </button>

            {filtersOpen && (
              <div style={{
                padding: '4px 18px 16px',
                borderTop: `1px solid ${divClr}`,
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.40)',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))', gap: 10, marginTop: 10 }}>
                  {cfg.filters.map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: txt2, fontWeight: 700, marginBottom: 5, fontFamily: "'Inter', sans-serif" }}>
                        {ICONS[f.icon] ? ICONS[f.icon]({ size: 12, color: txt2 }) : null}
                        {f.label}
                      </label>
                      <input
                        value={filters[f.key] || ''}
                        onChange={e => setFilter(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        style={{
                          ...wellStyle,
                          padding: '7px 10px',
                          background: filters[f.key]
                            ? isDark ? `${accent}18` : cfg.accentLight || '#f0f0ff'
                            : isDark ? 'rgba(0,0,20,0.28)' : '#fff',
                          borderColor: filters[f.key] ? accent : isDark ? 'rgba(255,255,255,0.12)' : '#E0E0E0',
                        }}
                        onFocus={e  => e.target.style.borderColor = accent}
                        onBlur={e   => e.target.style.borderColor = filters[f.key] ? accent : isDark ? 'rgba(255,255,255,0.12)' : '#E0E0E0'}
                      />
                    </div>
                  ))}
                </div>
                {activeCount > 0 && (
                  <button
                    onClick={clearFilters}
                    style={{
                      marginTop: 10, padding: '4px 12px',
                      background: isDark ? 'rgba(255,255,255,0.07)' : '#fff',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.13)' : '#E0E0E0'}`,
                      borderRadius: 7, fontSize: 11, color: txt2, cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <X size={11} /> Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Action Bar ── */}
          <div style={{
            padding: '13px 20px',
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(240,242,255,0.55)',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.70)'}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>

            {/* ══ LIQUID RUN QUERY BUTTON ══ */}
            <button
              onClick={(e) => {
                if (!loading && question.trim()) { addRipple(e); onSubmit() }
              }}
              disabled={loading || !question.trim()}
              style={{
                position: 'relative', overflow: 'hidden',
                padding: '11px 34px', borderRadius: 999, border: 'none',
                fontWeight: 900, fontSize: 13, letterSpacing: '0.3px',
                cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 9,
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.24s cubic-bezier(0.34,1.4,0.64,1)',
                ...(loading || !question.trim() ? {
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(210,212,225,0.68)',
                  color: txt2,
                  boxShadow: ['inset 0 2px 0 rgba(255,255,255,0.10)', '0 2px 8px rgba(0,0,20,0.12)'].join(', '),
                } : {
                  background: `linear-gradient(160deg, oklch(0.78 0.18 262) 0%, ${accent} 45%, oklch(0.52 0.24 280) 100%)`,
                  color: '#fff',
                  boxShadow: [
                    `0 10px 36px ${accent}60`,
                    `0 4px 16px  ${accent}40`,
                    `0 2px 6px   ${accent}28`,
                    'inset 0 2.5px 0 rgba(255,255,255,0.38)',
                    'inset 0 -3px 8px rgba(0,0,0,0.18)',
                    'inset 2px 0 6px rgba(255,255,255,0.12)',
                  ].join(', '),
                }),
              }}
              onMouseEnter={e => {
                if (loading || !question.trim()) return
                e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)'
                e.currentTarget.style.boxShadow = [
                  `0 16px 48px ${accent}70`, `0 6px 20px ${accent}50`,
                  'inset 0 2.5px 0 rgba(255,255,255,0.42)', 'inset 0 -3px 8px rgba(0,0,0,0.18)',
                ].join(', ')
              }}
              onMouseLeave={e => {
                if (loading || !question.trim()) return
                e.currentTarget.style.transform = 'scale(1) translateY(0)'
                e.currentTarget.style.boxShadow = [
                  `0 10px 36px ${accent}60`, `0 4px 16px ${accent}40`,
                  'inset 0 2.5px 0 rgba(255,255,255,0.38)', 'inset 0 -3px 8px rgba(0,0,0,0.18)',
                ].join(', ')
              }}
              onMouseDown={e => { if (!loading && question.trim()) e.currentTarget.style.transform = 'scale(0.97) translateY(1px)' }}
              onMouseUp={e => { if (!loading && question.trim()) e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)' }}
            >
              {/* Top inner curved shine */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '52%',
                borderRadius: '999px 999px 0 0',
                background: loading || !question.trim()
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)',
                pointerEvents: 'none', zIndex: 2,
              }} />

              {/* Water ripples */}
              {ripples.map(r => (
                <span key={r.id} className="liquid-ripple" style={{ left: r.x, top: r.y }} />
              ))}

              {/* Content */}
              <span style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                {loading
                  ? <Spinner size={14} color={question.trim() ? '#fff' : txt2} />
                  : ICONS.search({ size: 14, color: loading || !question.trim() ? txt2 : '#fff' })
                }
                {loading ? 'Generating SQL…' : 'Run Query'}
              </span>
            </button>

            {/* ── Glass Clear Button ── */}
            <button
              onClick={() => { setQuestion(''); setFilters({}) }}
              disabled={loading}
              style={{
                padding: '11px 20px',
                background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.72)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.90)'}`,
                borderRadius: 999,
                color: txt2, cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 12, fontWeight: 700, fontFamily: "'Inter', sans-serif",
                display: 'flex', alignItems: 'center', gap: 5,
                boxShadow: isDark
                  ? ['0 4px 14px rgba(0,0,30,0.22)', 'inset 0 1.5px 0 rgba(255,255,255,0.13)'].join(', ')
                  : ['0 4px 16px rgba(0,0,20,0.08)', 'inset 0 2px 0 rgba(255,255,255,0.98)', 'inset 0 -1px 0 rgba(0,0,20,0.05)'].join(', '),
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background  = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.90)'
                e.currentTarget.style.transform   = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.72)'
                e.currentTarget.style.transform   = 'translateY(0)'
              }}
            >
              <X size={12} /> Clear
            </button>

            {/* ── Keyboard hint ── */}
            <span style={{ fontSize: 10.5, color: isDark ? 'rgba(180,185,240,0.30)' : '#B0B4C0', marginLeft: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              {ICONS.keyboard({ size: 12, color: isDark ? 'rgba(180,185,240,0.30)' : '#C0C4CC' })}
              <kbd style={{
                background:   isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.75)',
                border:       isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(0,0,0,0.09)',
                borderBottom: isDark ? '2px solid rgba(255,255,255,0.08)' : '2px solid rgba(0,0,0,0.14)',
                borderRadius: 6, padding: '1px 7px',
                fontSize: 10, color: txt2,
                fontFamily: "'JetBrains Mono', monospace",
              }}>Ctrl+Enter</kbd>
              <span style={{ fontFamily: "'Inter', sans-serif" }}>to run</span>
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes micPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
