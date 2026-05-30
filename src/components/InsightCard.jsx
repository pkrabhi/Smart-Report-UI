import { useState } from 'react'
import { Brain, Sparkles, RefreshCw, ChevronDown, ChevronUp, X } from 'lucide-react'
import { Spinner } from '../utils/icons'
import { glassStyle } from '../config/theme'

export default function InsightCard({ insight, loading, error, onRetry, onDismiss, accentColor = '#6366f1', isDark = true }) {
  const [expanded, setExpanded] = useState(true)
  if (!loading && !insight && !error) return null

  const glass  = glassStyle({ accentHex: accentColor, isDark, radius: 18 })
  const txt1   = isDark ? 'rgba(220,222,255,0.92)' : '#1a1f3c'
  const txt2   = isDark ? 'rgba(180,185,240,0.58)' : 'rgba(26,31,60,0.52)'

  const statusPill = loading
    ? { bg: isDark ? 'rgba(251,191,36,0.18)' : '#FFF8E1', color: isDark ? 'rgba(251,191,36,0.90)' : '#E65100' }
    : error
    ? { bg: isDark ? 'rgba(239,68,68,0.18)'  : '#FFEBEE', color: isDark ? 'rgba(248,113,113,0.90)' : '#C62828' }
    : { bg: isDark ? 'rgba(16,185,129,0.18)' : '#E8F5E9', color: isDark ? 'rgba(52,211,153,0.90)' : '#2E7D32' }

  return (
    <div style={{ padding: '0 28px 14px' }}>
      <div style={{ ...glass }}>
        {/* Glass overlays */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:7, background:'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, transparent 100%)', borderRadius:'18px 18px 0 0', pointerEvents:'none', zIndex:3 }} />

        <div style={{ position:'relative', zIndex:3 }}>
          {/* Header */}
          <div style={{
            padding: '11px 16px',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(26,31,60,0.07)'}`,
            display: 'flex', alignItems: 'center', gap: 9,
          }}>
            {/* Icon orb */}
            <div style={{
              width: 28, height: 28, borderRadius: 9, flexShrink: 0,
              background: `linear-gradient(155deg, ${accentColor}30, ${accentColor}18)`,
              border: `1px solid ${accentColor}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${accentColor}28, inset 0 1px 0 rgba(255,255,255,0.6)`,
            }}>
              {loading ? <Spinner size={14} color={accentColor} /> : <Brain size={13} color={accentColor} />}
            </div>

            <span style={{ fontSize: 12, fontWeight: 800, color: txt1, fontFamily:"'Inter', sans-serif" }}>
              AI Insight
            </span>

            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
              background: statusPill.bg, color: statusPill.color,
              display: 'flex', alignItems: 'center', gap: 3, fontFamily:"'Inter', sans-serif",
            }}>
              {loading && <><Spinner size={8} color={statusPill.color} /> Analyzing…</>}
              {!loading && !error && <><Sparkles size={9} /> Generated</>}
              {error && 'Failed'}
            </span>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              {error && (
                <button onClick={onRetry} style={{
                  padding: '3px 8px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E0E0E0'}`, borderRadius: 6,
                  background: isDark ? 'rgba(255,255,255,0.07)' : '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 3, fontSize: 10,
                  color: txt2, fontFamily: "'Inter', sans-serif",
                }}>
                  <RefreshCw size={10} /> Retry
                </button>
              )}
              <button onClick={() => setExpanded(v => !v)} style={{ background:'none', border:'none', cursor:'pointer', color: txt2, padding:2, display:'flex', transition:'color 0.15s' }}>
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <button onClick={onDismiss} style={{ background:'none', border:'none', cursor:'pointer', color: txt2, padding:2, display:'flex' }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          {expanded && (
            <div style={{ padding: '13px 16px' }}>
              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {[88, 100, 62].map((w, i) => (
                    <div key={i} style={{
                      height: 11, borderRadius: 6, width: `${w}%`,
                      background: isDark
                        ? 'linear-gradient(90deg, rgba(255,255,255,0.07) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.07) 75%)'
                        : 'linear-gradient(90deg, #f0f0f4 25%, #f8f8fc 50%, #f0f0f4 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.6s infinite',
                    }} />
                  ))}
                </div>
              )}
              {!loading && error && (
                <div style={{ fontSize: 12, color: isDark ? 'rgba(248,113,113,0.85)' : '#C62828', lineHeight: 1.6, fontFamily:"'Inter', sans-serif" }}>
                  {error}
                </div>
              )}
              {!loading && insight && (
                <div style={{ fontSize: 12.5, color: txt1, lineHeight: 1.78, fontFamily:"'Inter', sans-serif" }}>
                  {insight.split('\n').filter(Boolean).map((line, i) => {
                    const isBullet = /^[•\-\*]/.test(line.trim())
                    if (isBullet) {
                      const text = line.trim().replace(/^[•\-\*]\s*/, '')
                      return (
                        <div key={i} style={{ display:'flex', gap:9, padding:'3px 0', alignItems:'flex-start' }}>
                          <span style={{ width:5, height:5, borderRadius:'50%', background:accentColor, flexShrink:0, marginTop:7, boxShadow:`0 0 6px ${accentColor}55` }} />
                          <span>{renderBold(text, accentColor, isDark)}</span>
                        </div>
                      )
                    }
                    return <p key={i} style={{ margin:'0 0 6px' }}>{renderBold(line, accentColor, isDark)}</p>
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function renderBold(text, accent = '#6366f1', isDark = true) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: accent, fontWeight: 800 }}>{part}</strong>
      : part
  )
}
