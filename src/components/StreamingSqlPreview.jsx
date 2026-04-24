import { useRef, useEffect } from 'react'
import { Code2, Sparkles } from 'lucide-react'

// ─────────────────────────────────────────────
//  Streaming SQL Preview
//  Shows SQL appearing token-by-token as the
//  LLM generates it. Auto-scrolls to bottom.
// ─────────────────────────────────────────────

export default function StreamingSqlPreview({ sql, active, isDark = true }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [sql])

  if (!sql && !active) return null

  const headerBg  = isDark ? 'rgba(0,0,20,0.40)' : '#F8F9FF'
  const headerBdr = isDark ? 'rgba(255,255,255,0.08)' : '#E8EAF6'
  const headerCl  = isDark ? 'rgba(139,148,255,0.88)' : '#5C6BC0'
  const codeBg    = isDark ? 'rgba(0,0,20,0.55)' : '#FAFBFF'
  const codeCl    = isDark ? 'rgba(220,222,255,0.88)' : '#1E2A4A'
  const cursorCl  = isDark ? '#818cf8' : '#3949AB'
  const mutedCl   = isDark ? 'rgba(180,185,240,0.40)' : '#BDBDBD'

  return (
    <div style={{
      margin: '12px 0 0',
      border: `1px solid ${headerBdr}`,
      borderRadius: 10, overflow: 'hidden',
      backdropFilter: isDark ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: isDark ? 'blur(16px)' : 'none',
    }}>
      {/* Header */}
      <div style={{
        padding: '6px 12px', background: headerBg,
        borderBottom: `1px solid ${headerBdr}`,
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 10, fontWeight: 700, color: headerCl,
        fontFamily: "'Inter', sans-serif",
      }}>
        <Code2 size={11} />
        SQL GENERATION
        {active && (
          <span style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4,
            color: isDark ? 'rgba(216,180,254,0.88)' : '#7B1FA2', fontSize: 9,
            fontFamily: "'Inter', sans-serif",
          }}>
            <Sparkles size={9} style={{ animation: 'token-sparkle 1s infinite' }} />
            STREAMING LIVE
          </span>
        )}
      </div>

      {/* SQL content */}
      <div ref={containerRef} style={{
        padding: '10px 14px', maxHeight: 140, overflowY: 'auto',
        background: codeBg,
      }}>
        {sql ? (
          <pre style={{
            margin: 0, fontSize: 11.5, lineHeight: 1.6,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            color: codeCl, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {sql}
            {active && (
              <span style={{
                display: 'inline-block', width: 6, height: 14,
                background: cursorCl, marginLeft: 2,
                animation: 'cursor-blink 0.8s step-end infinite',
                verticalAlign: 'text-bottom',
              }} />
            )}
          </pre>
        ) : active ? (
          <div style={{ fontSize: 11, color: mutedCl, fontStyle: 'italic', fontFamily: "'Inter', sans-serif" }}>
            Waiting for AI to start generating SQL…
          </div>
        ) : null}
      </div>

      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes token-sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}
