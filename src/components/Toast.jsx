import { useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const TYPE_CONFIG = {
  success: { Icon: CheckCircle, color: '#2E7D32', bg: '#E8F5E9', border: '#A5D6A7' },
  warning: { Icon: AlertCircle, color: '#E65100', bg: '#FFF3E0', border: '#FFCC80' },
  info:    { Icon: Info,        color: '#1565C0', bg: '#E3F2FD', border: '#90CAF9' },
}

/**
 * Toast — slide-in notification at bottom-right.
 * Auto-dismisses after `duration` ms.
 */
export default function Toast({ message, type = 'success', visible, onDismiss, duration = 3500 }) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [visible, duration, onDismiss])

  if (!visible || !message) return null

  const { Icon, color, bg, border } = TYPE_CONFIG[type] || TYPE_CONFIG.success

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 2000,
      background: bg, border: `1.5px solid ${border}`,
      borderRadius: 12, padding: '13px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
      display: 'flex', alignItems: 'flex-start', gap: 10,
      maxWidth: 340, minWidth: 240,
      animation: 'toastSlideIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 13, fontWeight: 600, color, lineHeight: 1.5, flex: 1 }}>
        {message}
      </span>
      <button onClick={onDismiss} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: 2, flexShrink: 0,
      }}>
        <X size={14} color={color} />
      </button>

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
