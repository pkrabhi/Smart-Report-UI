import { useState } from 'react'
import { Settings, X, Globe, User, BarChart3 } from 'lucide-react'

export default function SettingsModal({ settings, onSave, onClose }) {
  const [local, setLocal] = useState({ ...settings })
  const update = (k, v) => setLocal(p => ({ ...p, [k]: v }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,35,126,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, backdropFilter: 'blur(3px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', width: 500, maxWidth: '95vw', boxShadow: '0 12px 48px rgba(26,35,126,0.18)', border: '1px solid #E8EAF6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#1A237E', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={18} color="#1A237E" /> Settings
          </div>
          <button onClick={onClose} style={{ background: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 7, width: 30, height: 30, color: '#9E9E9E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9E9E9E', fontWeight: 700, letterSpacing: '0.5px', marginBottom: 5 }}>
              <Globe size={12} /> API BASE URL
            </label>
            <input value={local.apiBase} onChange={e => update('apiBase', e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E0E0E0', borderRadius: 8, fontSize: 12, color: '#1E2A4A', outline: 'none', fontFamily: 'monospace' }} />
            <div style={{ fontSize: 10, color: '#BDBDBD', marginTop: 4 }}>Default: /api/smart-query (Vite proxy → localhost:8101)</div>
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9E9E9E', fontWeight: 700, letterSpacing: '0.5px', marginBottom: 5 }}>
              <User size={12} /> USER ID
            </label>
            <input value={local.userId} onChange={e => update('userId', e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E0E0E0', borderRadius: 8, fontSize: 12, color: '#1E2A4A', outline: 'none', fontFamily: "'Nunito', sans-serif" }} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#9E9E9E', fontWeight: 700, letterSpacing: '0.5px', marginBottom: 5 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><BarChart3 size={12} /> MAX DISPLAY ROWS</span>
              <span style={{ color: '#1A237E' }}>{local.maxTableRows}</span>
            </label>
            <input type="range" min={50} max={1000} step={50} value={local.maxTableRows}
              onChange={e => update('maxTableRows', Number(e.target.value))}
              style={{ width: '100%', accentColor: '#3949AB' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={() => { onSave(local); onClose() }}
            style={{ flex: 1, padding: '10px', background: '#3949AB', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
            Save Settings
          </button>
          <button onClick={onClose}
            style={{ padding: '10px 18px', background: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 9, color: '#757575', cursor: 'pointer', fontSize: 13, fontFamily: "'Nunito', sans-serif" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
