import { useState } from 'react'
import { User, Shield, Eye, EyeOff, LogIn } from 'lucide-react'
import { getAdminPassword } from '../hooks/useAuth'

export default function LoginScreen({ onLogin, isDark = true }) {
  const [mode,   setMode]   = useState('user')
  const [name,   setName]   = useState('')
  const [pw,     setPw]     = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error,  setError]  = useState('')
  const [shake,  setShake]  = useState(false)

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 420) }

  const switchMode = (m) => { setMode(m); setError(''); setPw('') }

  const handleSubmit = () => {
    if (!name.trim()) { setError('Please enter your name'); triggerShake(); return }
    if (mode === 'admin') {
      if (!pw) { setError('Password required'); triggerShake(); return }
      if (pw !== getAdminPassword()) { setError('Incorrect password'); triggerShake(); return }
    }
    onLogin(name.trim(), mode)
  }

  const onKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  const bg       = isDark ? '#05061a' : '#f0f2fb'
  const cardBg   = isDark
    ? 'linear-gradient(155deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)'
    : 'linear-gradient(155deg, rgba(255,255,255,0.97) 0%, rgba(246,247,255,0.92) 100%)'
  const border   = isDark ? 'rgba(255,255,255,0.13)' : 'rgba(200,205,230,0.85)'
  const txt1     = isDark ? 'rgba(240,241,255,0.95)' : '#1a1f3c'
  const txt2     = isDark ? 'rgba(200,205,255,0.55)' : 'rgba(26,31,60,0.52)'
  const inputBg  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.92)'

  const modeBtn = (m) => ({
    flex: 1, padding: '8px 0', border: 'none', borderRadius: 10,
    cursor: 'pointer', fontSize: 12, fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s cubic-bezier(0.34,1.4,0.64,1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    ...(mode === m ? {
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: '#fff',
      boxShadow: '0 4px 16px rgba(99,102,241,0.45), inset 0 1.5px 0 rgba(255,255,255,0.28)',
    } : {
      background: 'transparent',
      color: txt2,
    }),
  })

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    background: inputBg, border: `1px solid ${border}`,
    color: txt1, fontSize: 13, fontFamily: "'Inter', sans-serif",
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{
      minHeight: '100vh', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Background orbs */}
      {[
        { c: isDark ? 'oklch(0.20 0.07 262)' : 'oklch(0.88 0.05 262)', s: 480, x: '-8%',  y: '-14%' },
        { c: isDark ? 'oklch(0.17 0.06 302)' : 'oklch(0.90 0.04 302)', s: 380, x: '74%',  y: '-6%'  },
        { c: isDark ? 'oklch(0.22 0.05 222)' : 'oklch(0.92 0.03 222)', s: 300, x: '12%',  y: '68%'  },
      ].map((o, i) => (
        <div key={i} style={{
          position: 'absolute', width: o.s, height: o.s, borderRadius: '50%',
          left: o.x, top: o.y, pointerEvents: 'none',
          background: `radial-gradient(circle, ${o.c} 0%, transparent 68%)`,
          filter: `blur(${isDark ? 14 : 8}px)`,
        }} />
      ))}

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: 380, padding: '36px 32px 28px',
        background: cardBg,
        backdropFilter:       isDark ? 'blur(24px) saturate(1.5)' : 'none',
        WebkitBackdropFilter: isDark ? 'blur(24px) saturate(1.5)' : 'none',
        borderRadius: 22,
        border: `1px solid ${border}`,
        boxShadow: isDark
          ? '0 36px 80px rgba(0,0,30,0.60), inset 0 1.5px 0 rgba(255,255,255,0.18), 0 0 48px -8px rgba(99,102,241,0.28)'
          : '0 24px 60px rgba(0,0,30,0.10), inset 0 1.5px 0 rgba(255,255,255,0.98)',
        animation: shake ? 'loginShake 0.42s ease' : 'loginIn 0.4s cubic-bezier(0.34,1.4,0.64,1)',
      }}>

        {/* Top shine */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
          borderRadius: '22px 22px 0 0',
          background: 'radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,255,255,0.14) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Logo + Title */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(155deg, #ffffff 0%, #f0f2ff 100%)',
            border: isDark ? '1.5px solid rgba(255,255,255,0.50)' : '1.5px solid rgba(200,205,240,0.90)',
            boxShadow: isDark
              ? '0 8px 28px rgba(0,0,30,0.50), 0 0 18px rgba(99,102,241,0.24), inset 0 2px 0 rgba(255,255,255,0.95)'
              : '0 6px 20px rgba(0,0,30,0.10), inset 0 2px 0 rgba(255,255,255,0.95)',
            marginBottom: 14,
          }}>
            <img src="/kmcblue.jpg" alt="KMC" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 17.5, fontWeight: 900, color: txt1, letterSpacing: '-0.3px', marginBottom: 4 }}>
            KMC · Smart Query AI
          </div>
          <div style={{ fontSize: 11, color: txt2 }}>Kolkata Municipal Corporation</div>
        </div>

        {/* Role toggle */}
        <div style={{
          display: 'flex', gap: 5, padding: 4,
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,20,0.04)',
          borderRadius: 13, marginBottom: 20,
          border: `1px solid ${border}`,
        }}>
          <button onClick={() => switchMode('user')}  style={modeBtn('user')}>
            <User size={12} /> User
          </button>
          <button onClick={() => switchMode('admin')} style={modeBtn('admin')}>
            <Shield size={12} /> Admin
          </button>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10.5, fontWeight: 700, color: txt2, display: 'block', marginBottom: 6, letterSpacing: '0.4px' }}>
            YOUR NAME
          </label>
          <input
            type="text" value={name} autoFocus
            onChange={e => { setName(e.target.value); setError('') }}
            onKeyDown={onKey}
            placeholder="Enter your name"
            style={inputStyle}
          />
        </div>

        {/* Password (admin only) */}
        {mode === 'admin' && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: txt2, display: 'block', marginBottom: 6, letterSpacing: '0.4px' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'} value={pw}
                onChange={e => { setPw(e.target.value); setError('') }}
                onKeyDown={onKey}
                placeholder="Admin password"
                style={{ ...inputStyle, paddingRight: 40 }}
              />
              <button
                onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: txt2, padding: 4, display: 'flex' }}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ fontSize: 11.5, color: '#f87171', marginBottom: 10, fontWeight: 600 }}>{error}</div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          style={{
            width: '100%', padding: '11px 0', marginTop: 4,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)',
            backgroundSize: '200% 100%',
            border: 'none', borderRadius: 12,
            color: '#fff', fontSize: 13, fontWeight: 800,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            boxShadow: '0 8px 28px rgba(99,102,241,0.42), inset 0 1.5px 0 rgba(255,255,255,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'transform 0.18s cubic-bezier(0.34,1.4,0.64,1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
        >
          <LogIn size={14} />
          {mode === 'admin' ? 'Login as Admin' : 'Enter as User'}
        </button>

        {mode === 'user' && (
          <p style={{ fontSize: 10.5, color: txt2, textAlign: 'center', marginTop: 14, marginBottom: 0, lineHeight: 1.6 }}>
            User access: Smart Query + Query History only
          </p>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        @keyframes loginIn {
          from { opacity: 0; transform: translateY(22px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes loginShake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-8px); }
          40%     { transform: translateX(8px);  }
          60%     { transform: translateX(-5px); }
          80%     { transform: translateX(5px);  }
        }
      `}</style>
    </div>
  )
}
