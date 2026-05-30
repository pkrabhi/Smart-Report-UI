// ─────────────────────────────────────────────────────────
//  KMC Smart Query — 3D Liquid Glass Design System
//  OKLCH color engine · glass primitives · button recipes
// ─────────────────────────────────────────────────────────

// Module → OKLCH hue mapping
export const MODULE_HUES = {
  MARKET:              262,
  ENGINEERING:         212,
  FINANCE:             168,
  MUNICIPAL_SECRETARY:  18,
  PARK_SQUARE:         142,
}

// Derive accent from module key
export function accentFromModule(moduleKey, isDark) {
  const h = MODULE_HUES[moduleKey] || 262
  return isDark
    ? `oklch(0.72 0.20 ${h})`
    : `oklch(0.55 0.22 ${h})`
}

// Hue-shifted secondary colors
export function hueShift(hue, delta) {
  return ((hue + delta) % 360 + 360) % 360
}

// ─── Glass panel ────────────────────────────────────────
// Dark mode: Claude Code style — black bg, dark panels, clean white borders
// Light mode: frosted white glass with subtle blur
export function glassStyle({ accentHex = '#5c6bc0', isDark = true, radius = 22, glassOpacity = 1.0 } = {}) {
  const go = Math.max(0, glassOpacity)
  return {
    background: isDark
      ? `rgba(255,255,255,${(0.07 * go).toFixed(3)})`  // dark panel on black bg
      : `linear-gradient(175deg,
          rgba(255,255,255,${Math.min(1, 0.92 * go).toFixed(3)}) 0%,
          rgba(240,244,255,${Math.min(1, 0.80 * go).toFixed(3)}) 100%)`,
    backdropFilter:       isDark ? 'blur(16px) saturate(1.4)' : 'blur(20px) saturate(1.8) brightness(1.02)',
    WebkitBackdropFilter: isDark ? 'blur(16px) saturate(1.4)' : 'blur(20px) saturate(1.8) brightness(1.02)',
    borderRadius: radius,
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.95)'}`,
    boxShadow: isDark ? [
      `inset 0 1px 0 rgba(255,255,255,0.12)`,       // top edge highlight
      `0 1px 0 rgba(255,255,255,0.04)`,
      `0 8px 32px rgba(0,0,0,0.50)`,
      `0 2px 8px rgba(0,0,0,0.35)`,
      `0 0 0 1px rgba(255,255,255,0.04)`,
    ].join(', ') : [
      `inset 0 2px 0 rgba(255,255,255,1.0)`,
      `0 8px 32px rgba(0,0,30,0.12)`,
      `0 2px 8px rgba(0,0,30,0.07)`,
      `0 0 40px -8px ${accentHex}28`,
    ].join(', '),
    position: 'relative',
    overflow: 'hidden',
  }
}

// ─── Liquid 3D button ───────────────────────────────────
export function liquidButtonStyle({ accentHex = '#3949AB', hue = 262, isDark = true } = {}) {
  return {
    background: `linear-gradient(155deg,
      oklch(0.82 0.16 ${hue}) 0%,
      oklch(0.66 0.22 ${hue}) 45%,
      oklch(0.50 0.24 ${hue + 18}) 100%)`,
    boxShadow: [
      `0 14px 40px -8px ${accentHex}66`,
      `0 4px 16px -2px ${accentHex}44`,
      `inset 0 2px 0 rgba(255,255,255,0.38)`,
      `inset 0 -2.5px 6px rgba(0,0,20,0.24)`,
      `inset 1.5px 0 3px rgba(255,255,255,0.16)`,
    ].join(', '),
    border: 'none',
    borderRadius: 14,
    color: '#fff',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Nunito', sans-serif",
    fontWeight: 700,
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.18s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.18s ease',
  }
}

// ─── Dark theme constants ────────────────────────────────
// Claude Code style: pure black, white text, no decorative orbs
export const DARK = {
  name:      'dark',
  bg:        '#0a0a0a',
  text:      { primary: '#ffffff', secondary: 'rgba(255,255,255,0.65)', muted: 'rgba(255,255,255,0.35)', code: '#a78bfa' },
  divider:   'rgba(255,255,255,0.08)',
  orbs:      [],  // no orbs in dark mode — clean black background
}

export const LIGHT = {
  name:      'light',
  bg:        '#f0f2fb',
  text:      { primary: '#1a1f3c', secondary: 'rgba(26,31,60,0.68)', muted: 'rgba(26,31,60,0.36)', code: '#6d28d9' },
  divider:   'rgba(26,31,60,0.08)',
  orbs: [
    // Light mode orbs are much more subtle — higher L (lighter), lower C (less saturated), smaller blur
    { hue: 262, L: 0.88, C: 0.05, size: 500, x: '-10%', y: '-12%', anim: 'orbDrift1', dur: '22s', blur: 8 },
    { hue: 302, L: 0.90, C: 0.04, size: 400, x: '78%',  y: '-8%',  anim: 'orbDrift2', dur: '19s', blur: 6 },
    { hue: 222, L: 0.92, C: 0.03, size: 300, x: '8%',   y: '68%',  anim: 'orbDrift3', dur: '16s', blur: 5 },
    { hue: 342, L: 0.90, C: 0.03, size: 250, x: '84%',  y: '72%',  anim: 'orbDrift4', dur: '20s', blur: 4 },
  ],
}



/**
 * Chromatic refraction fringe overlay — drop as an absolute <div>
 * child of any glass surface (after the top highlight).
 *
 *   <div style={refractionEdge({ isDark, radius: 22, side: 'right' })} />
 */
export function refractionEdge({ isDark = true, radius = 22, side = 'right' } = {}) {
  const baseRadius = `0 ${radius}px ${radius}px 0`
  const leftRadius = `${radius}px 0 0 ${radius}px`
  return {
    position: 'absolute',
    top: 0, bottom: 0,
    ...(side === 'right' ? { right: 0, borderRadius: baseRadius } : { left: 0, borderRadius: leftRadius }),
    width: 4,
    background: side === 'right'
      ? 'linear-gradient(180deg, rgba(255,20,220,0.38) 0%, rgba(120,220,255,0.28) 50%, rgba(0,200,255,0.38) 100%)'
      : 'linear-gradient(180deg, rgba(0,220,255,0.32) 0%, rgba(180,120,255,0.22) 50%, rgba(255,20,220,0.32) 100%)',
    mixBlendMode: isDark ? 'screen' : 'multiply',
    pointerEvents: 'none',
    zIndex: 2,
  }
}

/**
 * Small glass chip / capsule — for suggestion pills, tag badges, filter tags.
 * Gives them the same inner-shine + outer-cast treatment as bigger panels,
 * without the full blur cost.
 */
export function liquidChip({ accentHex = '#5c6bc0', isDark = true, active = false } = {}) {
  return {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 999,
    padding: '6px 14px',
    background: active
      ? `linear-gradient(155deg, ${accentHex}cc 0%, ${accentHex} 50%, ${accentHex}88 100%)`
      : isDark
        ? 'linear-gradient(155deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)'
        : 'linear-gradient(155deg, rgba(255,255,255,0.98) 0%, rgba(250,251,255,0.88) 100%)',
    border: `1px solid ${
      active
        ? `${accentHex}80`
        : isDark ? 'rgba(255,255,255,0.14)' : 'rgba(200,205,230,0.85)'
    }`,
    boxShadow: active
      ? [
          `0 6px 18px ${accentHex}55`,
          `0 2px 6px  ${accentHex}30`,
          'inset 0 2px 0 rgba(255,255,255,0.38)',
          'inset 0 -2px 5px rgba(0,0,20,0.18)',
        ].join(', ')
      : isDark
        ? [
            '0 3px 10px rgba(0,0,30,0.22)',
            'inset 0 1px 0 rgba(255,255,255,0.14)',
            'inset 0 -1px 0 rgba(0,0,30,0.12)',
          ].join(', ')
        : [
            '0 3px 12px rgba(0,0,20,0.07)',
            'inset 0 1.5px 0 rgba(255,255,255,0.98)',
            'inset 0 -1px 0 rgba(0,0,20,0.05)',
          ].join(', '),
    color: active ? '#fff' : undefined,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: 11,
    cursor: 'pointer',
    transition: 'transform 0.18s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.18s ease',
  }
}

/**
 * Perspective grid SVG — returns a CSS background-image string that tiles
 * a subtle isometric grid. Use on an absolute-positioned full-bleed layer
 * behind your orbs for extra 3D depth.
 *
 *   <div style={{ position:'fixed', inset:0, pointerEvents:'none',
 *                 backgroundImage: perspectiveGridBg(isDark),
 *                 opacity: 0.08, maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)' }} />
 */
export function perspectiveGridBg(isDark = true) {
  const stroke = isDark ? 'rgba(180,185,240,0.55)' : 'rgba(80,90,160,0.40)'
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'>
      <g fill='none' stroke='${stroke}' stroke-width='0.6'>
        <path d='M0 0 L60 0 M0 0 L0 60' />
        <path d='M0 30 L60 30 M30 0 L30 60' stroke-opacity='0.45' />
      </g>
    </svg>`.replace(/\s+/g, ' ').trim()
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
}

/**
 * Tweak defaults — kept in one spot so TweaksPanel can hydrate them.
 * Adjustable live from the floating panel; persisted in localStorage
 * under the key below.
 */
export const TWEAK_STORAGE_KEY = 'sq_tweaks_v1'
export const DEFAULT_TWEAKS = {
  accentHueShift:  0,      // -40 … +40 deg, shifted on top of MODULE_HUES
  glassOpacity:    1.0,    // 0.6 … 1.4 multiplier for existing panel alpha
  orbIntensity:    1.0,    // 0.0 … 1.6 multiplier for orb blur+chroma
  showGrid:        false,  // perspective grid on/off
  animatedConnector: true, // pipeline gradient flow on/off
  bgTint:          0,      // -60 … +60 deg, shifts the base background hue
}

export function loadTweaks() {
  try {
    const raw = localStorage.getItem(TWEAK_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_TWEAKS }
    return { ...DEFAULT_TWEAKS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_TWEAKS }
  }
}

export function saveTweaks(t) {
  try { localStorage.setItem(TWEAK_STORAGE_KEY, JSON.stringify(t)) } catch {}
}