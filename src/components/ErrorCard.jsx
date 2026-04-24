import { AlertTriangle, Lightbulb } from 'lucide-react'

const TIPS = {
  CONNECTION_ERROR:   'Make sure the Node.js service is running: cd smart-query-node-v2 && npm start',
  VALIDATION_FAILED:  'The generated SQL failed safety checks. Try rephrasing your question.',
  UNABLE_TO_GENERATE: 'AI could not interpret this question. Try being more specific.',
  EXECUTION_ERROR:    'SQL ran but hit a database error. Check the message above.',
  INVALID_MODULE:     'Unknown module code. Valid values: MARKET or ENGINEERING.',
}

export default function ErrorCard({ error, isDark = true }) {
  if (!error) return null
  const tip = TIPS[error.type] || 'Please try again or contact support.'

  const bg      = isDark ? 'rgba(239,68,68,0.12)'  : '#FFEBEE'
  const border  = isDark ? 'rgba(239,68,68,0.28)'  : '#FFCDD2'
  const leftBar = isDark ? 'rgba(248,113,113,0.88)' : '#C62828'
  const title   = isDark ? 'rgba(252,165,165,0.95)' : '#B71C1C'
  const msg     = isDark ? 'rgba(248,113,113,0.85)' : '#C62828'
  const tipBg   = isDark ? 'rgba(255,255,255,0.06)' : '#fff'
  const tipBdr  = isDark ? 'rgba(239,68,68,0.22)'   : '#FFCDD2'
  const tipClr  = isDark ? 'rgba(180,185,240,0.52)' : '#757575'

  return (
    <div style={{ padding: '0 28px 16px' }}>
      <div style={{
        background: bg,
        backdropFilter: isDark ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: isDark ? 'blur(24px)' : 'none',
        border: `1px solid ${border}`,
        borderRadius: 12,
        borderLeft: `4px solid ${leftBar}`,
        padding: '14px 18px',
        display: 'flex', gap: 14, alignItems: 'flex-start',
        boxShadow: isDark
          ? '0 8px 32px rgba(239,68,68,0.12), inset 0 1.5px 0 rgba(255,255,255,0.08)'
          : '0 2px 12px rgba(198,40,40,0.08)',
      }}>
        <AlertTriangle size={22} color={leftBar} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: title, marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>
            {error.type?.replace(/_/g, ' ')}
          </div>
          <div style={{ fontSize: 12, color: msg, marginBottom: 8, lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
            {error.message}
          </div>
          <div style={{
            fontSize: 11, color: tipClr,
            background: tipBg, border: `1px solid ${tipBdr}`,
            borderRadius: 6, padding: '6px 10px',
            display: 'flex', alignItems: 'flex-start', gap: 6,
            fontFamily: "'Inter', sans-serif",
          }}>
            <Lightbulb size={12} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
            {tip}
          </div>
        </div>
      </div>
    </div>
  )
}
