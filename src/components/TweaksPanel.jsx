// ─────────────────────────────────────────────────────────
//  liquid-glass-patch/TweaksPanel.jsx
//
//  Floating liquid-glass control panel.
//  Always visible (bottom-right), collapsible.
//  Persists via theme.js -> saveTweaks().
//
//  Usage in App.jsx:
//    import TweaksPanel from './components/TweaksPanel.jsx'
//    const [tweaks, setTweaks] = useState(loadTweaks)
//    ...
//    <TweaksPanel tweaks={tweaks} onChange={(t) => { setTweaks(t); saveTweaks(t) }} isDark={isDark} />
// ─────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react'
import { Settings2, ChevronDown, RotateCcw } from 'lucide-react'
import { DEFAULT_TWEAKS } from '../config/theme'

export default function TweaksPanel({ tweaks, onChange, isDark = true }) {
  const [open, setOpen] = useState(false)
  const t = tweaks || DEFAULT_TWEAKS

  // Use useCallback so these don't recreate on every render
  const set = useCallback((key, val) => onChange({ ...t, [key]: val }), [t, onChange])
  const reset = useCallback(() => onChange({ ...DEFAULT_TWEAKS }), [onChange])

  // Theme tokens
  const bg = isDark
    ? 'linear-gradient(155deg, rgba(20,22,55,0.82) 0%, rgba(14,16,42,0.78) 100%)'
    : 'linear-gradient(155deg, rgba(255,255,255,0.96) 0%, rgba(246,247,253,0.92) 100%)'
  const txt1 = isDark ? 'rgba(240,241,255,0.95)' : '#1a1f3c'
  const txt2 = isDark ? 'rgba(200,205,255,0.60)' : 'rgba(26,31,60,0.55)'
  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(200,205,230,0.85)'
  const rowBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(246,248,255,0.70)'

  return (
    <div style={{
      position: 'fixed', right: 20, bottom: 56, zIndex: 9999,
      fontFamily: "'Inter', sans-serif", userSelect: 'none',
    }}>
      {/* ── Toggle trigger ── */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Design Tweaks"
        style={{
          position: 'relative', overflow: 'hidden',
          width: open ? 264 : 44, height: 44,
          borderRadius: open ? '14px 14px 0 0' : 14,
          border: `1px solid ${border}`,
          background: bg,
          backdropFilter: 'blur(18px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.5)',
          boxShadow: [
            isDark ? '0 14px 40px rgba(0,0,30,0.55)' : '0 12px 32px rgba(0,0,30,0.14)',
            'inset 0 1.5px 0 rgba(255,255,255,0.85)',
            'inset 0 -1.5px 0 rgba(0,0,30,0.14)',
            '0 0 32px -8px rgba(139,92,246,0.45)',
          ].join(', '),
          display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center',
          padding: open ? '0 14px' : 0,
          cursor: 'pointer',
          transition: 'width 0.28s cubic-bezier(0.4,1.2,0.6,1), border-radius 0.2s',
          color: txt1,
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
          borderRadius: '14px 14px 0 0',
          background: 'radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,255,255,0.22) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
          <Settings2 size={15} strokeWidth={2} color={isDark ? '#c4b5fd' : '#6d28d9'} />
          {open && <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '-0.1px' }}>Tweaks</span>}
        </span>
        {open && (
          <ChevronDown size={14} color={txt2} style={{ transform: 'rotate(-90deg)', transition: 'transform 0.2s', position: 'relative', zIndex: 1 }} />
        )}
      </button>

      {/* ── Panel body ── */}
      {open && (
        <div style={{
          width: 264, padding: '14px 16px 16px',
          borderRadius: '0 0 14px 14px',
          border: `1px solid ${border}`, borderTop: 'none',
          background: bg,
          backdropFilter: 'blur(18px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.5)',
          boxShadow: [
            isDark ? '0 22px 50px rgba(0,0,30,0.60)' : '0 22px 50px rgba(0,0,30,0.14)',
            'inset 1.5px 0 0 rgba(255,255,255,0.68)',
            'inset -1.5px 0 0 rgba(0,0,30,0.08)',
            'inset 0 -1.5px 0 rgba(0,0,30,0.14)',
          ].join(', '),
          color: txt1,
          animation: 'tweakPanelIn 0.22s cubic-bezier(0.34,1.4,0.64,1)',
        }}>
          <Slider
            label="Accent hue shift" unit="°"
            min={-40} max={40} step={2}
            value={t.accentHueShift}
            onChange={(v) => set('accentHueShift', v)}
            txt1={txt1} txt2={txt2} rowBg={rowBg}
          />
          <Slider
            label="Glass opacity"
            min={0.6} max={1.4} step={0.05}
            value={t.glassOpacity}
            onChange={(v) => set('glassOpacity', v)}
            txt1={txt1} txt2={txt2} rowBg={rowBg}
            format={(v) => v.toFixed(2) + '×'}
          />
          <Slider
            label="Orb intensity"
            min={0} max={1.6} step={0.05}
            value={t.orbIntensity}
            onChange={(v) => set('orbIntensity', v)}
            txt1={txt1} txt2={txt2} rowBg={rowBg}
            format={(v) => v.toFixed(2) + '×'}
          />
          <Slider
            label="Background tint" unit="°"
            min={-60} max={60} step={2}
            value={t.bgTint}
            onChange={(v) => set('bgTint', v)}
            txt1={txt1} txt2={txt2} rowBg={rowBg}
          />

          <Toggle
            label="Perspective grid"
            sub="3D depth lines behind orbs"
            value={t.showGrid}
            onChange={(v) => set('showGrid', v)}
            txt1={txt1} txt2={txt2}
          />
          <Toggle
            label="Animated connector"
            sub="Pipeline flow animation"
            value={t.animatedConnector}
            onChange={(v) => set('animatedConnector', v)}
            txt1={txt1} txt2={txt2}
          />

          <button
            onClick={reset}
            style={{
              marginTop: 12, width: '100%', padding: '7px 10px',
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(240,242,250,0.8)',
              border: `1px solid ${border}`, borderRadius: 8, cursor: 'pointer',
              color: txt2, fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = txt1 }}
            onMouseLeave={e => { e.currentTarget.style.color = txt2 }}
          >
            <RotateCcw size={11} /> Reset to defaults
          </button>
        </div>
      )}

      <style>{`
        @keyframes tweakPanelIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  )
}

// ─── Slider row ───────────────────────────────────────────
// Uses LOCAL state during drag — commits to parent only on pointer-up.
// This prevents full-App re-renders on every pixel of drag.
function Slider({ label, value, onChange, min, max, step, unit = '', format, txt1, txt2, rowBg }) {
  const [local, setLocal] = useState(value)

  // Sync local when parent resets externally (e.g. "Reset to defaults")
  useEffect(() => { setLocal(value) }, [value])

  const display = format ? format(local) : `${local > 0 ? '+' : ''}${local}${unit}`

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: txt1, letterSpacing: '-0.1px' }}>{label}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, color: txt2,
          fontFamily: "'JetBrains Mono', monospace",
          padding: '1px 7px', borderRadius: 99,
          background: rowBg,
        }}>
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={local}
        onChange={e => setLocal(parseFloat(e.target.value))}
        onPointerUp={e => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%', height: 4, WebkitAppearance: 'none', appearance: 'none',
          background: 'linear-gradient(90deg, #8b5cf6 0%, #c4b5fd 100%)',
          borderRadius: 99, outline: 'none', cursor: 'pointer',
        }}
      />
    </div>
  )
}

// ─── Toggle row ───────────────────────────────────────────
function Toggle({ label, sub, value, onChange, txt1, txt2 }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '7px 0', cursor: 'pointer',
      }}
    >
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: txt1, letterSpacing: '-0.1px' }}>{label}</div>
        {sub && <div style={{ fontSize: 9.5, color: txt2, marginTop: 1 }}>{sub}</div>}
      </div>
      <div style={{
        width: 32, height: 18, borderRadius: 99, position: 'relative',
        background: value
          ? 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)'
          : 'rgba(140,144,180,0.24)',
        boxShadow: value ? '0 2px 10px rgba(139,92,246,0.45), inset 0 1px 0 rgba(255,255,255,0.36)' : 'inset 0 1px 3px rgba(0,0,30,0.18)',
        transition: 'all 0.18s ease',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 16 : 2,
          width: 14, height: 14, borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 2px 6px rgba(0,0,30,0.28)',
          transition: 'left 0.18s cubic-bezier(0.34,1.4,0.64,1)',
        }} />
      </div>
    </div>
  )
}
