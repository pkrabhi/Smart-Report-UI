import { useState } from 'react'
import { MODULE_CONFIG } from '../config/modules'
import { ICONS, ModuleIcon, StatusDot } from '../utils/icons'
import { Sun, Moon, LogOut, Shield, User } from 'lucide-react'

function useRipple() {
  const [ripples, setRipples] = useState([])
  const fire = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setRipples(prev => [...prev, { x: e.clientX - r.left, y: e.clientY - r.top, id }])
    setTimeout(() => setRipples(prev => prev.filter(p => p.id !== id)), 700)
  }
  return [ripples, fire]
}

export default function Header({ module, serviceStatus, onSettingsClick, isDark = true, onToggleTheme, isAdmin = false, userName = '', onLogout }) {
  const [settingsRipples, fireSettingsRipple] = useRipple()
  const [themeRipples,    fireThemeRipple]    = useRipple()
  const mc = MODULE_CONFIG[module]

  const statusText = serviceStatus === true ? 'Service Online'
    : serviceStatus === false ? 'Offline' : 'Checking…'

  // ── Theme-aware tokens ─────────────────────────────────
  const txtPrimary   = isDark ? 'rgba(240,241,255,0.95)' : '#1a1f3c'
  const txtSecondary = isDark ? 'rgba(200,205,255,0.65)' : 'rgba(26,31,60,0.52)'

  // Dark: deep navy animated header. Light: clean white header with subtle bottom line.
  const hdrBg = isDark
    ? 'linear-gradient(118deg, #05061a 0%, #090b2a 45%, #070920 100%)'
    : 'linear-gradient(118deg, #ffffff 0%, #f5f6ff 55%, #ffffff 100%)'

  // Pill (glass capsule) — no blur in light (white bg makes blur pointless)
  const pill = (extra = {}) => ({
    display: 'flex', alignItems: 'center', gap: 7,
    background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.92)',
    backdropFilter:       isDark ? 'blur(20px) saturate(1.6)' : 'none',
    WebkitBackdropFilter: isDark ? 'blur(20px) saturate(1.6)' : 'none',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(200,205,230,0.90)'}`,
    borderRadius: 22, padding: '5px 14px',
    position: 'relative', overflow: 'hidden',
    boxShadow: [
      isDark ? '0 4px 20px rgba(0,0,30,0.35)' : '0 3px 14px rgba(0,0,30,0.07)',
      'inset 0 1.5px 0 rgba(255,255,255,0.88)',
      'inset 0 -1px 0 rgba(0,0,30,0.06)',
    ].join(', '),
    ...extra,
  })

  // Square icon button
  const iconBtn = (extra = {}) => ({
    position: 'relative', overflow: 'hidden',
    width: 38, height: 38, borderRadius: 12,
    background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.92)',
    backdropFilter:       isDark ? 'blur(20px)' : 'none',
    WebkitBackdropFilter: isDark ? 'blur(20px)' : 'none',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.16)' : 'rgba(200,205,230,0.90)'}`,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: [
      isDark ? '0 4px 18px rgba(0,0,30,0.32)' : '0 3px 12px rgba(0,0,30,0.07)',
      'inset 0 1.5px 0 rgba(255,255,255,0.85)',
      'inset 0 -1.5px 0 rgba(0,0,30,0.06)',
    ].join(', '),
    transition: 'transform 0.2s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.2s ease',
    ...extra,
  })

  return (
    <div style={{
      position: 'relative', overflow: 'hidden', height: 72, userSelect: 'none',
      // Separate the header from the nav bar clearly in both themes
      boxShadow: isDark
        ? '0 2px 24px rgba(0,0,30,0.48)'
        : '0 1px 0 rgba(200,205,230,0.90), 0 4px 20px rgba(0,0,30,0.05)',
      // Smooth background transition when toggling theme
      transition: 'background 0.35s ease, box-shadow 0.35s ease',
    }}>

      {/* ── Base background layer ── */}
      <div style={{
        position: 'absolute', inset: 0, background: hdrBg,
        transition: 'background 0.35s ease',
      }} />

      {/* ── Animated color blobs (dark mode only) ── */}
      {isDark && [
        { w: 420, l: -130, t: -250, bg: 'rgba(99,102,241,0.40)',  anim: 'hdr_blob1', dur: '9s'  },
        { w: 280, l: 'auto', r: 220, t: -160, bg: 'rgba(139,92,246,0.32)',  anim: 'hdr_blob2', dur: '12s' },
        { w: 200, l: 'auto', r: -40, t: -90,  bg: 'rgba(34,211,238,0.20)',  anim: 'hdr_blob3', dur: '14s' },
        { w: 160, l: 300,   t: -80,  bg: 'rgba(251,191,36,0.14)', anim: 'hdr_blob4', dur: '11s' },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', width: b.w, height: b.w, borderRadius: '50%',
          background: `radial-gradient(circle, ${b.bg} 0%, transparent 65%)`,
          left: b.l, right: b.r, top: b.t,
          animation: `${b.anim} ${b.dur} ease-in-out infinite`,
          willChange: 'transform', pointerEvents: 'none',
        }} />
      ))}

      {/* ── Light mode: subtle lavender accent gradient strip ── */}
      {!isDark && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 100% at 0% 50%, rgba(99,102,241,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 80% at 100% 50%, rgba(139,92,246,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* ── Moving sheen sweep (dark only — invisible on white) ── */}
      {isDark && (
        <div style={{
          position: 'absolute', top: 0, width: '55%', height: '100%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.055) 50%, transparent 100%)',
          animation: 'hdr_sweep 8s ease-in-out infinite', pointerEvents: 'none',
        }} />
      )}

      {/* ── Bottom edge chromatic line ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
        background: isDark
          ? 'linear-gradient(90deg, rgba(168,85,247,0.50) 0%, rgba(34,211,238,0.40) 50%, rgba(168,85,247,0.20) 100%)'
          : 'linear-gradient(90deg, rgba(99,102,241,0.20) 0%, rgba(139,92,246,0.14) 50%, rgba(99,102,241,0.10) 100%)',
        transition: 'opacity 0.35s ease',
      }} />

      {/* ── Content layer ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', height: 72,
      }}>

        {/* LEFT: KMC Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

          {/* KMC Logo orb — white pill badge so the blue logo always renders correctly */}
          <div style={{
            position: 'relative', overflow: 'hidden',
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            // Always white background so the blue KMC logo is legible in both themes.
            // On dark header a white badge pops cleanly; on light header it blends in.
            background: 'linear-gradient(155deg, #ffffff 0%, #f0f2ff 55%, #ffffff 100%)',
            border: isDark ? '1.5px solid rgba(255,255,255,0.55)' : '1.5px solid rgba(200,205,240,0.90)',
            boxShadow: [
              isDark ? '0 8px 28px rgba(0,0,30,0.50)' : '0 6px 20px rgba(0,0,30,0.10)',
              isDark ? '0 0 18px rgba(99,102,241,0.30)' : '0 0 12px rgba(99,102,241,0.12)',
              'inset 0 2px 0 rgba(255,255,255,0.95)',
              'inset 0 -2px 5px rgba(0,0,30,0.08)',
            ].join(', '),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'box-shadow 0.35s ease, border-color 0.35s ease',
          }}>
            {/* Top curved highlight */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
              borderRadius: '14px 14px 0 0',
              background: 'radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,255,255,0.70) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            {/* Chromatic right fringe */}
            <div style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: 2,
              background: 'linear-gradient(180deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.18) 100%)',
              pointerEvents: 'none',
            }} />
            {/* KMC emblem image — no filter needed; white bg shows the blue logo in both modes */}
            <img
              src="/kmcblue.jpg"
              alt="KMC Logo"
              style={{
                width: 34, height: 34,
                objectFit: 'contain',
                borderRadius: 4,
                position: 'relative', zIndex: 1,
                display: 'block',
              }}
            />
          </div>

          {/* Title block */}
          <div>
            {/*
              Two <h1> elements cross-faded by opacity only.
              Each one's gradient is STATIC — it never changes — so the browser
              never hits the WebkitBackgroundClip-text rectangle glitch that
              fires when the `background` property itself transitions.
            */}
            <div style={{ position: 'relative', lineHeight: 1.18 }}>
              {/* Dark shimmer — white/violet */}
              <h1 style={{
                margin: 0, lineHeight: 1.18, fontSize: 19.5, fontWeight: 900,
                fontFamily: "'Inter', 'Nunito', sans-serif", letterSpacing: '-0.3px',
                background: 'linear-gradient(90deg, #fff 0%, #e0e7ff 20%, #fff 42%, #c4b5fd 62%, #fff 80%, #e0e7ff 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'hdr_shimmer_txt 7s linear infinite',
                opacity: isDark ? 1 : 0,
                transition: 'opacity 0.32s ease',
                willChange: 'opacity',
              }}>KMC · Smart Query AI</h1>
              {/* Light shimmer — navy/indigo — sits on top when light mode */}
              <h1 style={{
                margin: 0, lineHeight: 1.18, fontSize: 19.5, fontWeight: 900,
                fontFamily: "'Inter', 'Nunito', sans-serif", letterSpacing: '-0.3px',
                background: 'linear-gradient(90deg, #1a1f3c 0%, #4338ca 25%, #1a1f3c 50%, #6d28d9 75%, #1a1f3c 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'hdr_shimmer_txt 7s linear infinite',
                position: 'absolute', top: 0, left: 0, whiteSpace: 'nowrap',
                opacity: isDark ? 0 : 1,
                transition: 'opacity 0.32s ease',
                willChange: 'opacity',
              }}>KMC · Smart Query AI</h1>
            </div>
            <div style={{
              color: txtSecondary, fontSize: 10.5, fontWeight: 500,
              letterSpacing: '0.6px', fontFamily: "'Inter', sans-serif",
              display: 'flex', alignItems: 'center', gap: 5, marginTop: 2,
              transition: 'color 0.35s ease',
            }}>
              <span style={{
                display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                background: isDark ? 'rgba(52,211,153,0.88)' : 'rgba(52,211,153,0.90)',
                boxShadow: '0 0 8px rgba(52,211,153,0.90)',
                animation: 'pulse 2s infinite',
              }} />
              Kolkata Municipal Corporation — Natural Language to SQL
            </div>
          </div>
        </div>

        {/* RIGHT: Status + Module + Theme toggle + Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Service status pill */}
          <div style={pill()}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
              background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(255,255,255,0.22) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            <StatusDot status={serviceStatus} />
            <span style={{
              fontSize: 11, fontWeight: 600, color: txtPrimary,
              fontFamily: "'Inter', sans-serif", position: 'relative',
              transition: 'color 0.35s ease',
            }}>
              {statusText}
            </span>
          </div>

          {/* Active module pill */}
          <div style={{
            ...pill({ borderRadius: 10, padding: '5px 13px' }),
            background: isDark
              ? `linear-gradient(135deg, ${mc.accentColor}28 0%, ${mc.accentColor}14 100%)`
              : `linear-gradient(135deg, ${mc.accentColor}16 0%, ${mc.accentColor}08 100%)`,
            border: `1px solid ${mc.accentColor}${isDark ? '50' : '35'}`,
            boxShadow: [
              `0 0 20px ${mc.accentColor}22`,
              isDark ? '0 2px 10px rgba(0,0,30,0.28)' : '0 2px 10px rgba(0,0,30,0.07)',
              'inset 0 1.5px 0 rgba(255,255,255,0.85)',
            ].join(', '),
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
              background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            <ModuleIcon moduleKey={module} size={13} color={isDark ? '#fff' : mc.accentColor} />
            <span style={{
              color: isDark ? '#fff' : mc.accentColor, fontSize: 11, fontWeight: 700,
              fontFamily: "'Inter', sans-serif", letterSpacing: '0.3px', position: 'relative',
            }}>
              {mc.shortLabel}
            </span>
          </div>

          {/* Theme toggle button */}
          <button
            onClick={(e) => { fireThemeRipple(e); onToggleTheme?.() }}
            style={iconBtn()}
            title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.06) translateY(-1px)'
              e.currentTarget.style.boxShadow = isDark
                ? '0 8px 24px rgba(0,0,30,0.44), inset 0 1.5px 0 rgba(255,255,255,0.85)'
                : '0 6px 18px rgba(0,0,30,0.12), inset 0 1.5px 0 rgba(255,255,255,0.95)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = [
                isDark ? '0 4px 18px rgba(0,0,30,0.32)' : '0 3px 12px rgba(0,0,30,0.07)',
                'inset 0 1.5px 0 rgba(255,255,255,0.85)',
                'inset 0 -1.5px 0 rgba(0,0,30,0.06)',
              ].join(', ')
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
              borderRadius: '12px 12px 0 0',
              background: 'radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,255,255,0.28) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            {themeRipples.map(rp => (
              <span key={rp.id} className="liquid-ripple" style={{ left: rp.x, top: rp.y }} />
            ))}
            {isDark
              ? <Sun  size={15} color="rgba(251,191,36,0.95)" strokeWidth={2} />
              : <Moon size={15} color="rgba(99,102,241,0.88)"  strokeWidth={2} />
            }
          </button>

          {/* Settings button — admin only */}
          {isAdmin && (
            <button
              onClick={(e) => { fireSettingsRipple(e); onSettingsClick() }}
              style={iconBtn()}
              title="Settings"
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06) translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                borderRadius: '12px 12px 0 0',
                background: 'radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,255,255,0.28) 0%, transparent 100%)',
                pointerEvents: 'none',
              }} />
              {settingsRipples.map(rp => (
                <span key={rp.id} className="liquid-ripple" style={{ left: rp.x, top: rp.y }} />
              ))}
              {ICONS.settings({ size: 15, color: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(26,31,60,0.72)' })}
            </button>
          )}

          {/* User badge + logout */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 0,
            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.88)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(200,205,230,0.85)'}`,
            borderRadius: 22,
            boxShadow: isDark
              ? '0 4px 18px rgba(0,0,30,0.28), inset 0 1.5px 0 rgba(255,255,255,0.85)'
              : '0 3px 12px rgba(0,0,30,0.07), inset 0 1.5px 0 rgba(255,255,255,0.98)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px',
              color: isDark ? 'rgba(240,241,255,0.88)' : '#1a1f3c',
              fontSize: 11.5, fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
            }}>
              {isAdmin
                ? <Shield size={12} color={isDark ? '#a78bfa' : '#6d28d9'} />
                : <User   size={12} color={isDark ? 'rgba(200,205,255,0.70)' : 'rgba(26,31,60,0.55)'} />
              }
              {userName || (isAdmin ? 'Admin' : 'User')}
            </div>
            <button
              onClick={onLogout}
              title="Log out"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32,
                background: 'none', border: 'none',
                borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(200,205,230,0.70)'}`,
                cursor: 'pointer',
                color: isDark ? 'rgba(200,205,255,0.55)' : 'rgba(26,31,60,0.45)',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color    = isDark ? '#f87171' : '#dc2626'
                e.currentTarget.style.background = isDark ? 'rgba(248,113,113,0.10)' : 'rgba(220,38,38,0.06)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color    = isDark ? 'rgba(200,205,255,0.55)' : 'rgba(26,31,60,0.45)'
                e.currentTarget.style.background = 'none'
              }}
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
