import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import ModuleWheel from './ModuleWheel.jsx'
import { Search, ClipboardList, Radio, DatabaseZap } from 'lucide-react'

const ALL_TABS = [
  { id: 'query',   label: 'Smart Query',    Icon: Search,       adminOnly: false },
  { id: 'history', label: 'Query History',  Icon: ClipboardList, adminOnly: false },
  { id: 'schema',  label: 'Schema',         Icon: DatabaseZap,  adminOnly: true  },
  { id: 'status',  label: 'Service Status', Icon: Radio,        adminOnly: true  },
]

export default function NavTabs({ activeTab, onTabChange, module, onModuleChange, historyCount = 0, confirmedCount = 0, isDark = true, isAdmin = false }) {
  const NAV_TABS = ALL_TABS.filter(t => !t.adminOnly || isAdmin)

  // If active tab is no longer visible after role switch, redirect to query
  useEffect(() => {
    if (!NAV_TABS.find(t => t.id === activeTab)) onTabChange('query')
  }, [isAdmin]) // eslint-disable-line react-hooks/exhaustive-deps
  const [hovered, setHovered] = useState(null)

  const ACTIVE_COLOR = '#6366f1'
  const barBg   = isDark
    ? 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.04) 100%)'
    : '#ffffff'   // solid white in light mode — no blur needed
  const barBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(200,205,230,0.80)'
  const barShadow = isDark
    ? '0 8px 32px rgba(0,0,30,0.28), inset 0 1.5px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,30,0.18)'
    : '0 2px 12px rgba(0,0,30,0.07)'
  const txtInactive = isDark ? 'rgba(200,205,255,0.55)' : 'rgba(26,31,60,0.48)'

  return (
    <div style={{
      background: barBg,
      // Only blur in dark mode — light mode nav is solid white, blur is wasted GPU
      backdropFilter:       isDark ? 'blur(18px) saturate(1.5)' : 'none',
      WebkitBackdropFilter: isDark ? 'blur(18px) saturate(1.5)' : 'none',
      borderBottom: `1px solid ${barBorder}`,
      boxShadow: barShadow,
      padding: '0 24px',
      display: 'flex', alignItems: 'center',
      minHeight: 54,
      position: 'relative', zIndex: 100,
    }}>

      {/* ── Module wheel trigger ── */}
      <div style={{ display: 'flex', alignItems: 'center', paddingRight: 6 }}>
        <ModuleWheel activeKey={module} onSelect={onModuleChange} isDark={isDark} />
      </div>

      {/* ── Glass divider ── */}
      <div style={{
        width: 1, height: 28,
        background: `linear-gradient(180deg, transparent, ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(26,31,60,0.12)'}, transparent)`,
        margin: '0 12px', flexShrink: 0,
      }} />

      {/* ── Navigation tabs ── */}
      {NAV_TABS.map(tab => {
        const active = activeTab === tab.id
        const isHov  = hovered === tab.id && !active

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            onMouseEnter={() => setHovered(tab.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              position: 'relative', overflow: 'hidden',
              padding: '7px 18px', margin: '0 2px',
              border: 'none', borderRadius: 999,
              cursor: 'pointer', fontSize: 12.5,
              fontWeight: active ? 800 : 500,
              fontFamily: "'Inter', 'Nunito', sans-serif",
              whiteSpace: 'nowrap',
              transition: 'all 0.22s cubic-bezier(0.34,1.4,0.64,1)',
              display: 'flex', alignItems: 'center', gap: 7,
              outline: 'none',
              ...(active ? {
                background: `linear-gradient(155deg, oklch(0.78 0.18 262) 0%, ${ACTIVE_COLOR} 50%, oklch(0.52 0.22 278) 100%)`,
                color: '#fff',
                boxShadow: [
                  `0 8px 28px ${ACTIVE_COLOR}55`,
                  `0 3px 10px ${ACTIVE_COLOR}38`,
                  'inset 0 2px 0 rgba(255,255,255,0.36)',
                  'inset 0 -2.5px 7px rgba(0,0,20,0.20)',
                  'inset 1.5px 0 3px rgba(255,255,255,0.14)',
                ].join(', '),
                transform: 'scale(1.03)',
              } : isHov ? {
                background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.86)',
                color: ACTIVE_COLOR,
                boxShadow: [
                  isDark ? '0 4px 16px rgba(0,0,20,0.22)' : '0 4px 16px rgba(0,0,20,0.08)',
                  'inset 0 1.5px 0 rgba(255,255,255,0.90)',
                ].join(', '),
                transform: 'scale(1.01)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.95)'}`,
              } : {
                background: 'transparent',
                color: txtInactive,
                boxShadow: 'none',
                transform: 'scale(1)',
                border: '1px solid transparent',
              }),
            }}
          >
            {/* Top curved inner shine — active only */}
            {active && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '52%',
                borderRadius: '999px 999px 0 0',
                background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(255,255,255,0.30) 0%, transparent 100%)',
                pointerEvents: 'none',
              }} />
            )}
            {/* Chromatic right fringe — active only */}
            {active && (
              <div style={{
                position: 'absolute', top: 0, right: 0, bottom: 0, width: 2,
                background: 'linear-gradient(180deg, rgba(255,0,200,0.18) 0%, rgba(0,220,255,0.18) 100%)',
                mixBlendMode: 'screen', borderRadius: '0 999px 999px 0', pointerEvents: 'none',
              }} />
            )}

            <tab.Icon size={13} strokeWidth={active ? 2.5 : 1.8} />
            {tab.label}

            {tab.id === 'history' && historyCount > 0 && (
              <span style={{
                background: active ? 'rgba(255,255,255,0.28)' : ACTIVE_COLOR,
                color: '#fff', borderRadius: 999, fontSize: 9.5,
                padding: '1px 6px', fontWeight: 800,
                boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.28)' : `0 2px 8px ${ACTIVE_COLOR}55`,
              }}>
                {historyCount}
              </span>
            )}
            {tab.id === 'status' && confirmedCount > 0 && (
              <span style={{ background: active ? 'rgba(255,255,255,0.28)' : '#10b981', color: '#fff', borderRadius: 999, fontSize: 9.5, padding: '1px 6px', fontWeight: 800 }}>
                {confirmedCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
