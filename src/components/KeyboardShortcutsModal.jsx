import { X, Keyboard } from 'lucide-react'
import { SHORTCUTS } from '../hooks/useKeyboardShortcuts'

export default function KeyboardShortcutsModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(26,35,78,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, padding: '26px 28px',
          width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          border: '1px solid #E8EAF6',
          animation: 'slideInModal 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: '#E8EAF6', borderRadius: 8, padding: 6 }}>
              <Keyboard size={16} color="#3949AB" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#1A237E' }}>Keyboard Shortcuts</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} color="#9E9E9E" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SHORTCUTS.map(({ keys, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 12px', borderRadius: 8, background: '#F8F9FF',
              border: '1px solid #E8EAF6',
            }}>
              <span style={{ fontSize: 12.5, color: '#37474F', fontWeight: 600 }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {keys.map((k, i) => (
                  k === 'or' ? (
                    <span key={i} style={{ fontSize: 10, color: '#BDBDBD' }}>or</span>
                  ) : (
                    <kbd key={i} style={{
                      background: '#fff', border: '1.5px solid #C5CAE9',
                      borderRadius: 5, padding: '2px 7px',
                      fontSize: 11, fontWeight: 700, color: '#3949AB',
                      fontFamily: "'Fira Code', monospace",
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}>{k}</kbd>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: '#BDBDBD', textAlign: 'center', marginTop: 14 }}>
          Press <kbd style={{ background: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 4, padding: '1px 5px', fontSize: 10 }}>Escape</kbd> or click outside to close
        </p>
      </div>

      <style>{`
        @keyframes slideInModal {
          from { opacity: 0; transform: translateY(-14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
