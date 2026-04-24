import { useState, useRef, useMemo } from 'react'
import { MessageSquarePlus, Send, X, CornerDownRight } from 'lucide-react'
import { Spinner } from '../utils/icons'
import { glassStyle } from '../config/theme'

export default function FollowUpInput({ onSubmit, loading, previousQuestion, accentColor = '#6366f1', followUpDepth = 0, isDark = true, glassOpacity = 1 }) {
  const [open, setOpen]   = useState(false)
  const [text, setText]   = useState('')
  const inputRef          = useRef(null)

  const handleSubmit = () => {
    if (!text.trim() || loading) return
    onSubmit(text.trim()); setText('')
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
    if (e.key === 'Escape') { setOpen(false); setText('') }
  }

  const glass  = useMemo(() => glassStyle({ accentHex: accentColor, isDark, radius: 16, glassOpacity }), [accentColor, isDark, glassOpacity])
  const txt1   = isDark ? 'rgba(220,222,255,0.90)' : '#1a1f3c'
  const txt2   = isDark ? 'rgba(180,185,240,0.52)' : 'rgba(26,31,60,0.44)'
  const depthColor = followUpDepth > 0 ? '#a855f7' : accentColor

  if (!open) {
    return (
      <div style={{ padding: '0 28px 20px' }}>
        <button
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 90) }}
          style={{
            width: '100%', padding: '12px 18px',
            ...glass,
            border: isDark
              ? `1.5px dashed ${depthColor}35`
              : `1.5px dashed ${depthColor}50`,
            borderRadius: 14,
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            fontSize: 12, fontWeight: 700, fontFamily: "'Inter', sans-serif",
            color: followUpDepth > 0 ? '#a855f7' : (isDark ? 'rgba(180,185,240,0.65)' : 'rgba(99,102,241,0.75)'),
            transition: 'all 0.22s ease',
            boxShadow: 'none',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = depthColor; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.75)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? `${depthColor}35` : `${depthColor}50`; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)' }}
        >
          <MessageSquarePlus size={15} />
          {followUpDepth > 0
            ? <>Ask another follow-up…<span style={{ fontSize: 9.5, background: '#a855f7', color: '#fff', padding: '1px 7px', borderRadius: 99, marginLeft: 4 }}>Chain #{followUpDepth + 1}</span></>
            : <>Ask a follow-up… <span style={{ fontSize: 9.5, color: txt2, fontWeight: 500, marginLeft: 4 }}>e.g. "Filter by ward 5" · "Monthly breakdown"</span></>
          }
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 28px 20px' }}>
      <div style={{ ...glass, borderRadius: 16 }}>
        {/* Glass overlays */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'45%', background:'radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,255,255,0.16) 0%, transparent 100%)', borderRadius:'16px 16px 0 0', pointerEvents:'none', zIndex:1 }} />
        <div style={{ position:'absolute', top:0, right:0, bottom:0, width:2, background:'linear-gradient(180deg, rgba(255,0,200,0.12) 0%, rgba(0,220,255,0.12) 100%)', mixBlendMode: isDark ? 'screen' : 'multiply', pointerEvents:'none', zIndex:2, borderRadius:'0 16px 16px 0' }} />

        <div style={{ position:'relative', zIndex:3 }}>
          {/* Context strip */}
          <div style={{
            padding: '9px 16px',
            background: isDark ? `${depthColor}14` : `${depthColor}08`,
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(26,31,60,0.07)'}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <CornerDownRight size={12} color={depthColor} />
            <span style={{ fontSize: 9.5, fontWeight: 800, padding: '1px 7px', borderRadius: 99, background: depthColor, color: '#fff', fontFamily:"'Inter', sans-serif" }}>
              FOLLOW-UP {followUpDepth > 0 ? `#${followUpDepth + 1}` : ''}
            </span>
            <span style={{ fontSize: 10, color: txt2, fontWeight: 500, fontFamily:"'Inter', sans-serif" }}>based on:</span>
            <span style={{ fontSize: 11, color: txt1, fontWeight: 700, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontFamily:"'Inter', sans-serif" }}>
              "{previousQuestion}"
            </span>
            <button onClick={() => { setOpen(false); setText('') }}
              style={{ background:'none', border:'none', cursor:'pointer', color: txt2, padding:2, display:'flex' }}>
              <X size={14} />
            </button>
          </div>

          {/* Input area */}
          <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <textarea
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a follow-up… e.g. 'Now show only ward 5' or 'Break this down monthly'"
                rows={2}
                disabled={loading}
                style={{
                  width: '100%', padding: '9px 13px',
                  border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(220,222,255,0.70)'}`,
                  borderRadius: 10, fontSize: 12.5,
                  color: txt1, outline: 'none',
                  fontFamily: "'Inter', sans-serif",
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.95)',
                  resize: 'none', lineHeight: 1.55, transition: 'border-color 0.15s',
                  backdropFilter: isDark ? 'blur(10px)' : 'none',
                }}
                onFocus={e => e.target.style.borderColor = depthColor}
                onBlur={e => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(220,222,255,0.70)'}
              />
              <div style={{ fontSize: 9.5, color: txt2, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontFamily:"'Inter', sans-serif" }}>
                <span>Enter to send · Esc to close</span>
                <span style={{ marginLeft: 'auto' }}>Context from previous query sent to AI</span>
              </div>
            </div>

            {/* Send button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !text.trim()}
              style={{
                padding: '10px 18px', borderRadius: 10, border: 'none',
                background: loading || !text.trim()
                  ? isDark ? 'rgba(255,255,255,0.07)' : 'rgba(26,31,60,0.10)'
                  : `linear-gradient(155deg, oklch(0.78 0.18 262), ${depthColor}, oklch(0.52 0.22 280))`,
                color: loading || !text.trim() ? txt2 : '#fff',
                cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 800, fontSize: 12, fontFamily: "'Inter', sans-serif",
                display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                boxShadow: loading || !text.trim()
                  ? 'none'
                  : `0 8px 24px ${depthColor}44, inset 0 2px 0 rgba(255,255,255,0.32), inset 0 -2px 5px rgba(0,0,20,0.18)`,
                transition: 'all 0.2s cubic-bezier(0.34,1.4,0.64,1)',
              }}
              onMouseEnter={e => { if (!loading && text.trim()) e.currentTarget.style.transform = 'scale(1.04) translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {loading ? <Spinner size={13} color={txt2} /> : <Send size={13} />}
              {loading ? 'Processing…' : 'Ask'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
