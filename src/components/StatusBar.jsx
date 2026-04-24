import { MODULE_CONFIG } from '../config/modules'
import { StatusDot, ModuleIcon } from '../utils/icons'
import { RefreshCw, Check, X, Keyboard, Zap, Database, TrendingUp } from 'lucide-react'

export default function StatusBar({ module, apiBase, serviceStatus, serviceInfo, onRecheck, sessionStats, onShowShortcuts, isDark = true }) {
  const cfg = MODULE_CONFIG[module]

  const barBg = isDark
    ? 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.04) 100%)'
    : 'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.78) 100%)'

  const borderTop = isDark
    ? '1px solid rgba(255,255,255,0.09)'
    : '1px solid rgba(255,255,255,0.95)'

  const shadow = isDark
    ? '0 -8px 32px rgba(0,0,30,0.28), inset 0 1px 0 rgba(255,255,255,0.10)'
    : '0 -6px 24px rgba(0,0,30,0.07), inset 0 1px 0 rgba(255,255,255,0.98)'

  const txt  = isDark ? 'rgba(200,205,255,0.62)' : 'rgba(26,31,60,0.52)'
  const div  = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(26,31,60,0.09)'

  const seg = (children, extra = {}) => (
    <div style={{ display:'flex', alignItems:'center', gap:5, paddingRight:12, paddingLeft:12, borderRight: div, ...extra }}>
      {children}
    </div>
  )

  const label = (children, color) => (
    <span style={{ fontSize: 9.5, color: color || txt, fontFamily:"'Inter', monospace", fontWeight: 500, display:'flex', alignItems:'center', gap:3 }}>
      {children}
    </span>
  )

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: 30,
      background: isDark ? barBg : '#ffffff',
      backdropFilter:       isDark ? 'blur(32px) saturate(1.8)' : 'none',
      WebkitBackdropFilter: isDark ? 'blur(32px) saturate(1.8)' : 'none',
      borderTop, boxShadow: shadow,
      padding: '0 16px', display: 'flex', alignItems: 'center',
      zIndex: 90,
    }}>

      {/* Service status */}
      {seg(
        <>
          <StatusDot status={serviceStatus} size={5} />
          {label(serviceStatus === true ? 'Online' : serviceStatus === false ? 'Offline' : 'Checking…',
            serviceStatus === true ? 'rgba(52,211,153,0.88)' : serviceStatus === false ? 'rgba(248,113,113,0.88)' : null)}
        </>,
        { paddingLeft: 0 }
      )}

      {/* API base */}
      {seg(label(<><span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:9 }}>{apiBase}</span></>))}

      {/* NVIDIA / Ollama */}
      {serviceInfo && seg(
        <div style={{ display:'flex', gap:8 }}>
          {label(<>NVIDIA {serviceInfo.nvidia_available ? <Check size={8} color="rgba(52,211,153,0.9)" /> : <X size={8} color="rgba(248,113,113,0.9)" />}</>)}
          {label(<>Ollama {serviceInfo.ollama_available ? <Check size={8} color="rgba(52,211,153,0.9)" /> : <span style={{ color:'rgba(180,185,240,0.25)' }}>off</span>}</>)}
        </div>
      )}

      {/* Session stats */}
      {sessionStats && sessionStats.queries > 0 && seg(
        <div style={{ display:'flex', gap:8 }}>
          {label(<><Database size={8} color={txt} /> {sessionStats.queries} queries</>)}
          {sessionStats.avgMs > 0 && label(<><Zap size={8} color={txt} /> {sessionStats.avgMs.toLocaleString()}ms avg</>)}
          {sessionStats.queries > 1 && sessionStats.cacheRate !== '—' && label(<><TrendingUp size={8} color="rgba(52,211,153,0.7)" /> {sessionStats.cacheRate} cached</>, 'rgba(52,211,153,0.82)')}
          {sessionStats.errors > 0 && label(<>{sessionStats.errors} err</>, 'rgba(248,113,113,0.82)')}
        </div>
      )}

      {/* Right side */}
      <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
        {label(
          <><ModuleIcon moduleKey={module} size={10} color={txt} />
          <strong style={{ color: isDark ? 'rgba(220,222,255,0.88)' : '#1a1f3c', fontWeight:700 }}>{cfg.label}</strong>
          <span style={{ color: txt }}>· KMC eWorks Smart Query v3.0</span></>,
          txt
        )}

        <button onClick={onShowShortcuts} title="Keyboard shortcuts (Ctrl+?)"
          style={{
            background:'none',
            border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(26,31,60,0.14)',
            borderRadius:4, cursor:'pointer', padding:'1px 6px',
            color: txt, display:'flex', alignItems:'center', gap:3,
            fontSize:9, fontWeight:600, transition:'all 0.15s', fontFamily:"'Inter', sans-serif",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(26,31,60,0.32)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(26,31,60,0.14)'}
        >
          <Keyboard size={8} /> Ctrl+?
        </button>

        <button onClick={onRecheck} title="Recheck service"
          style={{ color: txt, background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center' }}>
          <RefreshCw size={9} />
        </button>
      </div>
    </div>
  )
}
