import { useState } from 'react'
import { Zap, Brain, ChevronDown, ChevronUp, Database, BookOpen, Shield } from 'lucide-react'

export default function RagStatsBadge({ ragStats, isDark = true }) {
  const [expanded, setExpanded] = useState(false)
  if (!ragStats) return null

  const isFallback = ragStats.mode === 'STATIC_FALLBACK'

  // Pill colours
  const pillColor  = isFallback
    ? (isDark ? 'rgba(251,191,36,0.90)' : '#E65100')
    : (isDark ? 'rgba(96,165,250,0.90)' : '#1565C0')
  const pillBg     = isFallback
    ? (isDark ? 'rgba(251,191,36,0.14)' : '#FFF3E0')
    : (isDark ? 'rgba(96,165,250,0.14)' : '#E3F2FD')
  const pillBdr    = isFallback
    ? (isDark ? 'rgba(251,191,36,0.30)' : '#FFCC80')
    : (isDark ? 'rgba(96,165,250,0.30)' : '#90CAF9')
  const label      = isFallback ? 'Static' : `RAG · ${ragStats.complexity}`

  // Expanded panel colours
  const panelBg    = isDark ? 'rgba(10,12,40,0.96)'     : '#fff'
  const panelBdr   = isDark ? 'rgba(255,255,255,0.13)'  : '#E8EAF6'
  const txt1       = isDark ? 'rgba(220,222,255,0.92)'  : '#1A237E'
  const txt2       = isDark ? 'rgba(180,185,240,0.52)'  : '#9E9E9E'
  const tileBg     = isDark ? 'rgba(255,255,255,0.07)'  : '#F8F9FF'
  const tileBdr    = isDark ? 'rgba(255,255,255,0.10)'  : '#E8EAF6'

  const metaColor = (light, dark) => isDark ? dark : light

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* Pill button */}
      <button
        onClick={() => setExpanded(v => !v)}
        title="RAG Retrieval Stats — click for details"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: pillBg, border: `1px solid ${pillBdr}`,
          borderRadius: 99, padding: '2px 9px',
          fontSize: 10.5, fontWeight: 700, color: pillColor,
          cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          transition: 'all 0.15s', whiteSpace: 'nowrap',
        }}
      >
        {isFallback ? <Shield size={10} color={pillColor} /> : <Brain size={10} color={pillColor} />}
        {label}
        {!isFallback && ragStats.tokenSavingPct > 0 && (
          <span style={{
            background: isDark ? 'rgba(96,165,250,0.88)' : '#1565C0',
            color: '#fff', borderRadius: 99, padding: '0 5px', fontSize: 9.5, fontWeight: 800,
          }}>
            -{ragStats.tokenSavingPct}%
          </span>
        )}
        {expanded ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50,
          background: panelBg,
          backdropFilter: isDark ? 'blur(32px) saturate(1.8)' : 'none',
          WebkitBackdropFilter: isDark ? 'blur(32px) saturate(1.8)' : 'none',
          border: `1px solid ${panelBdr}`, borderRadius: 12,
          boxShadow: isDark
            ? '0 16px 48px rgba(0,0,30,0.55), inset 0 1.5px 0 rgba(255,255,255,0.08)'
            : '0 8px 32px rgba(0,0,0,0.12)',
          padding: '14px 16px', width: 260,
          animation: 'ragDropIn 0.15s ease',
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: txt1, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Inter', sans-serif" }}>
            <Brain size={12} color={isDark ? 'rgba(139,148,255,0.88)' : '#3949AB'} />
            Vectorless RAG Retrieval
          </div>

          {isFallback && (
            <div style={{
              background: isDark ? 'rgba(251,191,36,0.12)' : '#FFF3E0',
              border: `1px solid ${isDark ? 'rgba(251,191,36,0.28)' : '#FFCC80'}`,
              borderRadius: 7, padding: '7px 10px', marginBottom: 10,
              fontSize: 11, color: isDark ? 'rgba(251,191,36,0.90)' : '#E65100', fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
            }}>
              ⚠️ Off-domain query — full static prompt used
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {[
              { Icon: BookOpen, label: 'Examples', val: `${ragStats.selectedExamples} / ${ragStats.totalExamples}`,  color: metaColor('#1565C0', 'rgba(96,165,250,0.88)') },
              { Icon: Database, label: 'Tables',   val: `${ragStats.selectedTables} / ${ragStats.totalTables}`,      color: metaColor('#2E7D32', 'rgba(52,211,153,0.88)') },
              { Icon: Shield,   label: 'Rules',    val: `${ragStats.selectedRules} / ${ragStats.totalRules}`,        color: metaColor('#7B1FA2', 'rgba(216,180,254,0.88)') },
              { Icon: Zap,      label: 'BM25 max', val: ragStats.maxBm25Score?.toFixed(2) ?? '—',                   color: metaColor('#E65100', 'rgba(251,191,36,0.88)') },
            ].map(({ Icon, label: l, val, color: c }) => (
              <div key={l} style={{ background: tileBg, borderRadius: 7, padding: '8px 10px', border: `1px solid ${tileBdr}` }}>
                <div style={{ fontSize: 9.5, color: txt2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, marginBottom: 3, fontFamily: "'Inter', sans-serif" }}>
                  <Icon size={9} color={txt2} /> {l}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: c, fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>{val}</div>
              </div>
            ))}
          </div>

          {!isFallback && (
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(ragStats.intents || []).map(i => (
                <span key={i} style={{
                  background: isDark ? 'rgba(99,102,241,0.18)' : '#E8EAF6',
                  color: isDark ? 'rgba(139,148,255,0.88)' : '#3949AB',
                  borderRadius: 99, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {i}
                </span>
              ))}
            </div>
          )}

          <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#F5F5F5'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: txt2, fontFamily: "'Inter', sans-serif" }}>
              Retrieved in {ragStats.retrievalMs ?? 0}ms
            </span>
            {!isFallback && ragStats.tokenSavingPct > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? 'rgba(52,211,153,0.88)' : '#2E7D32', fontFamily: "'Inter', sans-serif" }}>
                ~{ragStats.tokenSavingPct}% fewer tokens
              </span>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes ragDropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </span>
  )
}
