import { useState, useEffect } from 'react'
import { createPortal }        from 'react-dom'
import { MODULE_CONFIG }       from '../config/modules.js'
import { ModuleIcon }          from '../utils/icons.jsx'
import { X, ChevronDown, Layers } from 'lucide-react'
import { glassStyle }          from '../config/theme.js'

// ─────────────────────────────────────────────
//  ModuleWheel
//  Trigger button (in NavTabs) + full-screen
//  liquid-glass overlay rendered via Portal so
//  the NavTabs backdropFilter stacking context
//  cannot clip or mis-position the popup.
//
//  ≤ 4 modules → SVG Donut Pie Wheel
//  ≥ 5 modules → CSS Honeycomb Hex Grid
// ─────────────────────────────────────────────

const MODULES       = Object.values(MODULE_CONFIG)
const PIE_THRESHOLD = 4

// ──────────────────────────────────────────────
//  SVG DONUT PIE WHEEL  (≤ 4 modules)
// ──────────────────────────────────────────────
function PieWheel({ modules, activeKey, onSelect, isDark }) {
  const [hovered, setHovered] = useState(null)
  const N = modules.length, SIZE = 300, CX = 150, CY = 150
  const R_INNER = 58, R_OUTER = 130, GAP = 2.5
  const toRad = d => (d * Math.PI) / 180

  const slices = modules.map((m, i) => {
    const isHov  = hovered === m.key
    const isAct  = activeKey === m.key
    const dStart = (360 / N) * i       - 90 + GAP / 2
    const dEnd   = (360 / N) * (i + 1) - 90 - GAP / 2
    const rO     = isHov ? R_OUTER + 13 : R_OUTER
    const s = toRad(dStart), e = toRad(dEnd)
    const large = (dEnd - dStart) > 180 ? 1 : 0
    const path = [
      `M ${CX + R_INNER * Math.cos(s)} ${CY + R_INNER * Math.sin(s)}`,
      `L ${CX + rO * Math.cos(s)} ${CY + rO * Math.sin(s)}`,
      `A ${rO} ${rO} 0 ${large} 1 ${CX + rO * Math.cos(e)} ${CY + rO * Math.sin(e)}`,
      `L ${CX + R_INNER * Math.cos(e)} ${CY + R_INNER * Math.sin(e)}`,
      `A ${R_INNER} ${R_INNER} 0 ${large} 0 ${CX + R_INNER * Math.cos(s)} ${CY + R_INNER * Math.sin(s)}`,
      'Z',
    ].join(' ')
    const mid = toRad((dStart + dEnd) / 2)
    const lr  = R_INNER + (rO - R_INNER) * 0.60
    return { ...m, path, isHov, isAct, lx: CX + lr * Math.cos(mid), ly: CY + lr * Math.sin(mid) }
  })

  const active = modules.find(m => m.key === activeKey) || modules[0]
  const bgGrad = isDark
    ? { from: 'rgba(255,255,255,0.07)', to: 'rgba(255,255,255,0.03)' }
    : { from: '#EEF0FF', to: '#F5F6FF' }
  const ringClr = isDark ? 'rgba(255,255,255,0.15)' : '#D0D5F5'
  const hubFill = isDark ? 'rgba(20,22,50,0.88)' : 'rgba(255,255,255,0.90)'
  const txtClr  = isDark ? 'rgba(220,222,255,0.92)' : '#1a1f3c'

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} overflow="visible">
      <defs>
        {modules.map(m => (
          <filter key={m.key} id={`glow_${m.key}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        ))}
        <radialGradient id="bgG_pie" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={bgGrad.from} />
          <stop offset="100%" stopColor={bgGrad.to} />
        </radialGradient>
      </defs>

      <circle cx={CX} cy={CY} r={R_OUTER + 24} fill="url(#bgG_pie)" />
      <circle cx={CX} cy={CY} r={R_OUTER + 20} fill="none" stroke={ringClr} strokeWidth={1.5} strokeDasharray="4 7" />

      {slices.map(sl => (
        <g key={sl.key}
          onClick={() => onSelect(sl.key)}
          onMouseEnter={() => setHovered(sl.key)}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: 'pointer' }}
          filter={sl.isAct ? `url(#glow_${sl.key})` : undefined}
        >
          <path d={sl.path}
            fill={sl.isAct ? sl.accentColor : sl.isHov ? sl.accentColor + 'BB' : sl.accentColor + '55'}
            stroke={isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.90)'}
            strokeWidth={3.5}
          />
          {sl.isAct && (
            <path d={sl.path} fill="none" stroke={sl.accentColor} strokeWidth={2}
              style={{ filter: `drop-shadow(0 0 6px ${sl.accentColor})` }} />
          )}
          <text x={sl.lx} y={sl.ly} textAnchor="middle" dominantBaseline="middle"
            fill="#fff" fontSize={sl.isAct ? 13 : 11}
            fontWeight={sl.isAct ? 900 : 600}
            fontFamily="'Inter', sans-serif"
            style={{ pointerEvents: 'none' }}>
            {sl.shortLabel}
          </text>
        </g>
      ))}

      {/* Hub circle */}
      <circle cx={CX} cy={CY} r={R_INNER - 2} fill={hubFill} />
      <circle cx={CX} cy={CY} r={R_INNER - 2} fill="none" stroke={active.accentColor} strokeWidth={3} />
      <foreignObject x={CX - 17} y={CY - 30} width={34} height={34}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          <ModuleIcon moduleKey={active.key} size={21} color={active.accentColor} />
        </div>
      </foreignObject>
      <text x={CX} y={CY + 16} textAnchor="middle" fill={active.accentColor}
        fontSize={11} fontWeight={800} fontFamily="'Inter', sans-serif">{active.shortLabel}</text>
    </svg>
  )
}

// ──────────────────────────────────────────────
//  HONEYCOMB HEX GRID  (≥ 5 modules)
// ──────────────────────────────────────────────
const HEX_W       = 122
const HEX_H       = 106
const HEX_GAP     = 10
const ROW_OVERLAP = Math.round(HEX_H * 0.25)

function HexTile({ m, isAct, isHov, onSelect, onHover, isDark }) {
  const inactiveBg = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.55)'
  const hoverBg    = isDark
    ? `linear-gradient(160deg, ${m.accentColor}35 0%, ${m.accentColor}20 100%)`
    : `linear-gradient(160deg, ${m.accentColor}30 0%, ${m.accentColor}18 100%)`
  const activeBg   = `linear-gradient(160deg, ${m.accentColor}F0 0%, ${m.accentColor} 55%, ${m.accentColor}CC 100%)`

  return (
    <div style={{
      filter: isAct
        ? `drop-shadow(0 8px 24px ${m.accentColor}88)`
        : isHov
        ? `drop-shadow(0 5px 14px ${m.accentColor}66)`
        : isDark ? 'drop-shadow(0 3px 10px rgba(0,0,30,0.32))' : 'drop-shadow(0 3px 10px rgba(0,0,30,0.10))',
      transition: 'filter 0.22s ease',
      flexShrink: 0,
    }}>
      <div
        onClick={() => onSelect(m.key)}
        onMouseEnter={() => onHover(m.key)}
        onMouseLeave={() => onHover(null)}
        style={{
          position: 'relative',
          width: HEX_W, height: HEX_H,
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          cursor: 'pointer',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 6,
          transition: 'all 0.24s cubic-bezier(0.34,1.4,0.64,1)',
          transform: isAct ? 'scale(1.08)' : isHov ? 'scale(1.06)' : 'scale(1)',
          background: isAct ? activeBg : isHov ? hoverBg : inactiveBg,
        }}
      >
        {/* Inner top shine on active */}
        {isAct && (
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: '40%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)',
            clipPath: 'polygon(40% 0%, 60% 0%, 70% 40%, 50% 50%, 30% 40%)',
            pointerEvents: 'none',
          }} />
        )}

        <ModuleIcon moduleKey={m.key} size={24} color={isAct ? '#fff' : m.accentColor} />
        <span style={{
          fontSize: 10.5, fontWeight: 800,
          color: isAct ? '#fff' : m.accentColor,
          fontFamily: "'Inter', sans-serif",
          textAlign: 'center', lineHeight: 1.2, padding: '0 10px',
          pointerEvents: 'none',
          textShadow: isAct ? '0 1px 3px rgba(0,0,0,0.20)' : 'none',
        }}>
          {m.shortLabel}
        </span>
      </div>
    </div>
  )
}

function HexGrid({ modules, activeKey, onSelect, isDark }) {
  const [hovered, setHovered] = useState(null)
  const rows = []
  for (let i = 0; i < modules.length; i += 3) rows.push(modules.slice(i, i + 3))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{
          display: 'flex', gap: HEX_GAP,
          marginTop:  ri > 0 ? -ROW_OVERLAP : 0,
          marginLeft: ri % 2 === 1 ? (HEX_W + HEX_GAP) / 2 : 0,
        }}>
          {row.map(m => (
            <HexTile key={m.key} m={m} isDark={isDark}
              isAct={activeKey === m.key} isHov={hovered === m.key}
              onSelect={onSelect} onHover={setHovered}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────
//  ACTIVE MODULE INFO BAR  (inside popup)
// ──────────────────────────────────────────────
function ActiveBar({ activeKey, isDark }) {
  const m    = MODULE_CONFIG[activeKey]
  const txt1 = isDark ? 'rgba(220,222,255,0.92)' : '#1a1f3c'
  const txt2 = isDark ? 'rgba(180,185,240,0.52)' : 'rgba(26,31,60,0.44)'

  return (
    <div style={{
      width: '100%', padding: '12px 16px',
      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.90)'}`,
      borderRadius: 16,
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: [
        `0 4px 20px ${m.accentColor}22`,
        `inset 0 1.5px 0 rgba(255,255,255,${isDark ? 0.12 : 0.96})`,
        `inset 3px 0 0 ${m.accentColor}`,
      ].join(', '),
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 12, flexShrink: 0,
        background: `linear-gradient(135deg, ${m.accentColor}28, ${m.accentColor}14)`,
        border: `1.5px solid ${m.accentColor}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 2px 8px ${m.accentColor}30`,
      }}>
        <ModuleIcon moduleKey={activeKey} size={18} color={m.accentColor} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: txt1, fontFamily: "'Inter', sans-serif" }}>
          {m.label}
        </div>
        <div style={{ fontSize: 10.5, color: txt2, marginTop: 2, fontFamily: "'Inter', sans-serif" }}>
          {m.tableStats?.find(s => s.label === 'Tables')?.value ?? '—'} tables ·&nbsp;
          {m.tableStats?.find(s => s.label === 'Examples')?.value ?? '—'} training examples
        </div>
      </div>

      <span style={{
        fontSize: 10, fontWeight: 800, padding: '4px 12px',
        background: `linear-gradient(135deg, ${m.accentColor}F0, ${m.accentColor}D0)`,
        color: '#fff', borderRadius: 999,
        fontFamily: "'Inter', sans-serif",
        boxShadow: [`0 4px 14px ${m.accentColor}55`, 'inset 0 1.5px 0 rgba(255,255,255,0.35)'].join(', '),
      }}>
        ACTIVE
      </span>
    </div>
  )
}

// ──────────────────────────────────────────────
//  TRIGGER BUTTON — liquid pill in NavTabs
// ──────────────────────────────────────────────
export function ModuleWheelTrigger({ activeKey, onClick }) {
  const m = MODULE_CONFIG[activeKey]
  return (
    <button
      onClick={onClick}
      title="Switch module"
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 18px',
        background: `linear-gradient(160deg, oklch(0.78 0.18 262) 0%, ${m.accentColor} 45%, oklch(0.52 0.24 280) 100%)`,
        border: 'none', borderRadius: 999,
        cursor: 'pointer', color: '#fff',
        fontWeight: 800, fontSize: 13,
        fontFamily: "'Inter', sans-serif",
        boxShadow: [
          `0 6px 22px ${m.accentColor}55`,
          `0 2px 8px  ${m.accentColor}38`,
          'inset 0 2px 0 rgba(255,255,255,0.38)',
          'inset 0 -2px 5px rgba(0,0,0,0.15)',
        ].join(', '),
        transition: 'all 0.22s cubic-bezier(0.34,1.4,0.64,1)',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.04) translateY(-1px)'
        e.currentTarget.style.boxShadow = [
          `0 10px 32px ${m.accentColor}65`,
          'inset 0 2px 0 rgba(255,255,255,0.42)',
          'inset 0 -2px 5px rgba(0,0,0,0.15)',
        ].join(', ')
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)'
        e.currentTarget.style.boxShadow = [
          `0 6px 22px ${m.accentColor}55`,
          'inset 0 2px 0 rgba(255,255,255,0.38)',
          'inset 0 -2px 5px rgba(0,0,0,0.15)',
        ].join(', ')
      }}
    >
      {/* Top curved shine */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
        borderRadius: '999px 999px 0 0',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.26) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      <ModuleIcon moduleKey={activeKey} size={15} color="#fff" />
      {m.shortLabel}
      <ChevronDown size={13} strokeWidth={2.5} />
    </button>
  )
}

// ──────────────────────────────────────────────
//  MAIN EXPORT  — trigger + portal overlay
// ──────────────────────────────────────────────
export default function ModuleWheel({ activeKey, onSelect, isDark = true }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const h = e => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open])

  const handleSelect = key => { onSelect(key); setOpen(false) }

  const glass   = glassStyle({ accentHex: '#6366f1', isDark, radius: 28 })
  const txt1    = isDark ? 'rgba(220,222,255,0.92)' : '#1a1f3c'
  const txt2    = isDark ? 'rgba(180,185,240,0.45)' : '#9CA3AF'

  const overlay = open && (
    <>
      {/* ── Full-viewport backdrop ── */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh', zIndex: 9000,
          background: isDark ? 'rgba(5,6,26,0.72)' : 'rgba(26,31,60,0.30)',
          backdropFilter:       'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'whl_fade 0.20s ease',
        }}
        onClick={() => setOpen(false)}
      >
        {/* ── Liquid glass popup card ── */}
        <div
          style={{
            ...glass,
            padding:   '28px 36px 30px',
            display:   'flex', flexDirection: 'column',
            alignItems: 'center', gap: 22,
            minWidth:  380, maxWidth: 520,
            animation: 'whl_spring 0.38s cubic-bezier(0.34,1.56,0.64,1)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top curved highlight */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
            background: 'radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,255,255,0.20) 0%, transparent 100%)',
            borderRadius: '28px 28px 0 0', pointerEvents: 'none', zIndex: 1,
          }} />
          {/* Chromatic fringe */}
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 2,
            background: 'linear-gradient(180deg, rgba(255,0,200,0.14) 0%, rgba(0,220,255,0.14) 100%)',
            mixBlendMode: isDark ? 'screen' : 'multiply',
            pointerEvents: 'none', zIndex: 2, borderRadius: '0 28px 28px 0',
          }} />
          {/* Moving glass sheen */}
          <div style={{
            position: 'absolute', top: '-20%', left: '-110%',
            width: '55%', height: '140%',
            background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.18), transparent)',
            animation: 'whl_sheen 5s ease-in-out 0.4s infinite',
            pointerEvents: 'none', borderRadius: 'inherit', zIndex: 0,
          }} />

          {/* ── Header ── */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', width: '100%',
            position: 'relative', zIndex: 3,
          }}>
            <div>
              <div style={{ fontSize: 19, fontWeight: 900, letterSpacing: -0.5, color: txt1, fontFamily: "'Inter', sans-serif" }}>
                Switch Module
              </div>
              <div style={{ fontSize: 12, color: txt2, marginTop: 3, fontFamily: "'Inter', sans-serif" }}>
                {MODULES.length} modules available
              </div>
            </div>

            {/* Glass close button */}
            <button
              onClick={() => setOpen(false)}
              style={{
                background:   isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.75)',
                border:       `1px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.92)'}`,
                borderRadius: 999, cursor: 'pointer', padding: '7px',
                display: 'flex',
                boxShadow: isDark
                  ? ['0 3px 12px rgba(0,0,30,0.28)', 'inset 0 1.5px 0 rgba(255,255,255,0.14)'].join(', ')
                  : ['0 3px 12px rgba(0,0,20,0.10)', 'inset 0 1.5px 0 rgba(255,255,255,0.98)'].join(', '),
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.95)'
                e.currentTarget.style.transform  = 'scale(1.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.75)'
                e.currentTarget.style.transform  = 'scale(1)'
              }}
            >
              <X size={15} color={txt2} strokeWidth={2.5} />
            </button>
          </div>

          {/* ── Wheel or Hex ── */}
          <div style={{ position: 'relative', zIndex: 3 }}>
            {MODULES.length <= PIE_THRESHOLD
              ? <PieWheel modules={MODULES} activeKey={activeKey} onSelect={handleSelect} isDark={isDark} />
              : <HexGrid  modules={MODULES} activeKey={activeKey} onSelect={handleSelect} isDark={isDark} />
            }
          </div>

          {/* ── Active module bar ── */}
          <div style={{ width: '100%', position: 'relative', zIndex: 3 }}>
            <ActiveBar activeKey={activeKey} isDark={isDark} />
          </div>

          {/* ── Hint ── */}
          <div style={{
            fontSize: 11, color: txt2, fontFamily: "'Inter', sans-serif",
            display: 'flex', alignItems: 'center', gap: 6,
            position: 'relative', zIndex: 3,
          }}>
            <Layers size={12} />
            Click a {MODULES.length <= PIE_THRESHOLD ? 'slice' : 'tile'} to switch · Esc to close
          </div>
        </div>
      </div>

      <style>{`
        @keyframes whl_fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes whl_spring {
          from { opacity: 0; transform: scale(0.80) translateY(24px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes whl_sheen {
          0%   { left: -110%; opacity: 0; }
          8%   { opacity: 1;             }
          40%  { left:  130%; opacity: 0; }
          100% { left:  130%; opacity: 0; }
        }
      `}</style>
    </>
  )

  return (
    <>
      <ModuleWheelTrigger activeKey={activeKey} onClick={() => setOpen(true)} />
      {/* Portal: renders overlay into document.body, escaping any
          stacking context created by NavTabs' backdropFilter         */}
      {createPortal(overlay, document.body)}
    </>
  )
}
