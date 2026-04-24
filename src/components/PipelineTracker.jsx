import { PIPELINE_STEPS, MODULE_CONFIG } from '../config/modules'
import { ICONS, Spinner } from '../utils/icons'
import { Check } from 'lucide-react'
import StreamingSqlPreview from './StreamingSqlPreview'
import { useState, useEffect, useMemo } from 'react'
import { glassStyle } from '../config/theme'

function useElapsed(active) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    if (!active) { setSecs(0); return }
    setSecs(0)
    const id = setInterval(() => setSecs(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [active])
  return secs
}

export default function PipelineTracker({ module, pipelineStep, loading, hasResult, hasError, streamingSql = '', stepLabel = '', source = '', isDark = true, animatedConnector = true, glassOpacity = 1 }) {
  const cfg    = MODULE_CONFIG[module]
  const allDone = !loading && (hasResult || hasError)
  const isAiStep = loading && pipelineStep === 2
  const elapsed  = useElapsed(isAiStep)
  const elapsedBadge = elapsed >= 10 ? `${elapsed}s` : null

  const getStepState = (stepId) => {
    if (allDone)               return 'done'
    if (!loading)              return 'waiting'
    if (pipelineStep > stepId) return 'done'
    if (pipelineStep === stepId) return 'active'
    return 'waiting'
  }

  const accent    = cfg.accentColor
  const glass     = useMemo(() => glassStyle({ accentHex: accent, isDark, radius: 22, glassOpacity }), [accent, isDark, glassOpacity])
  const txt1      = isDark ? 'rgba(220,222,255,0.92)' : '#1a1f3c'
  const txt2      = isDark ? 'rgba(180,185,240,0.55)' : 'rgba(26,31,60,0.44)'

  return (
    <div style={{ padding: '0 28px 16px' }}>
      <div style={{ ...glass, padding: '22px 28px' }}>
        {/* Glass overlays */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'45%', background:'radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 100%)', borderRadius:'22px 22px 0 0', pointerEvents:'none', zIndex:1 }} />
        <div style={{ position:'absolute', top:0, right:0, bottom:0, width:2, background:'linear-gradient(180deg, rgba(255,0,200,0.14) 0%, rgba(0,220,255,0.14) 100%)', mixBlendMode: isDark ? 'screen' : 'multiply', pointerEvents:'none', zIndex:2, borderRadius:'0 22px 22px 0' }} />
        <div className="glass-sheen" style={{ animationDelay: '2s' }} />

        <div style={{ position:'relative', zIndex:3 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: isDark ? 'rgba(180,185,240,0.45)' : 'rgba(26,31,60,0.38)', letterSpacing: '1.2px', marginBottom: 18, textTransform: 'uppercase', fontFamily:"'Inter', sans-serif" }}>
            Processing Pipeline
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {PIPELINE_STEPS.map((step, i) => {
              const state    = getStepState(step.id)
              const isDone   = state === 'done'
              const isActive = state === 'active'
              const isWaiting = state === 'waiting'
              const StepIcon  = ICONS[step.icon]

              return (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>

                    {/* Step circle */}
                    <div style={{
                      position: 'relative', overflow: 'hidden',
                      width: 46, height: 46, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.4s cubic-bezier(0.34,1.4,0.64,1)',
                      ...(isDone ? {
                        background: `linear-gradient(155deg, oklch(0.78 0.18 262) 0%, ${accent} 50%, oklch(0.52 0.24 282) 100%)`,
                        border: `1.5px solid ${accent}80`,
                        boxShadow: [`0 8px 24px ${accent}55`, 'inset 0 2px 0 rgba(255,255,255,0.38)', 'inset 0 -2px 5px rgba(0,0,20,0.22)'].join(', '),
                        animation: 'floatY 3s ease-in-out infinite',
                      } : isActive ? {
                        background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.82)',
                        border: `2px solid ${accent}`,
                        boxShadow: [`0 0 0 6px ${accent}18`, `0 6px 20px ${accent}30`, 'inset 0 1.5px 0 rgba(255,255,255,0.88)'].join(', '),
                      } : {
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.55)',
                        border: isDark ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid rgba(220,222,255,0.70)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85)',
                      }),
                    }}>
                      {(isDone || isActive) && (
                        <div style={{ position:'absolute', top:0, left:0, right:0, height:'50%', borderRadius:'50% 50% 0 0', background:'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(255,255,255,0.28) 0%, transparent 100%)', pointerEvents:'none' }} />
                      )}
                      {isDone   && <Check size={17} color="#fff" strokeWidth={3} />}
                      {isActive && <Spinner size={15} color={accent} />}
                      {isWaiting && StepIcon && StepIcon({ size: 17, color: isDark ? 'rgba(180,185,240,0.35)' : 'rgba(26,31,60,0.25)' })}
                    </div>

                    {/* Labels */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, fontFamily:"'Inter', sans-serif", transition: 'color 0.3s', color: isDone || isActive ? accent : isDark ? 'rgba(180,185,240,0.35)' : 'rgba(26,31,60,0.28)' }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: 9, marginTop: 2, fontFamily:"'Inter', sans-serif", color: isActive ? txt2 : isDark ? 'rgba(180,185,240,0.22)' : 'rgba(26,31,60,0.20)', transition: 'color 0.3s' }}>
                        {step.id === 2 && source ? source : step.sub}
                      </div>
                    </div>
                  </div>

                  {/* Connector line — animated when flowing */}
                  {i < PIPELINE_STEPS.length - 1 && (() => {
                    const nextState = getStepState(step.id + 1)
                    const filled    = nextState !== 'waiting' || allDone
                    const flowing   = nextState === 'active' && !allDone && animatedConnector
                    return (
                      <div style={{
                        height: 3, width: 28, flexShrink: 0,
                        margin: '0 3px', marginTop: -32,
                        borderRadius: 999, position: 'relative', overflow: 'hidden',
                        transition: 'all 0.4s ease',
                        background: !filled
                          ? isDark ? 'rgba(255,255,255,0.08)' : 'rgba(200,205,230,0.55)'
                          : `linear-gradient(90deg, ${accent} 0%, ${accent}bb 50%, ${accent} 100%)`,
                        backgroundSize: flowing ? '200% 100%' : '100% 100%',
                        animation: flowing ? 'pipeFlow 1.4s linear infinite' : 'none',
                        boxShadow: filled ? `0 2px 10px ${accent}55` : 'none',
                      }}>
                        {flowing && (
                          <div style={{
                            position: 'absolute', top: 0, bottom: 0, width: '40%',
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
                            animation: 'pipeSheen 1.4s linear infinite',
                            mixBlendMode: 'screen',
                          }} />
                        )}
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>

          {/* Step status banner */}
          {loading && pipelineStep > 0 && (
            <div style={{
              marginTop: 18, padding: '9px 14px',
              background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              borderRadius: 12,
              border: isDark ? `1px solid ${accent}30` : `1px solid rgba(255,255,255,0.90)`,
              boxShadow: [`0 4px 20px ${accent}20`, 'inset 0 1.5px 0 rgba(255,255,255,0.90)'].join(', '),
              fontSize: 11, color: accent, fontWeight: 600, fontFamily:"'Inter', sans-serif",
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Spinner size={10} color={accent} />
              <span style={{ flex: 1 }}>
                {stepLabel || (
                  <>
                    {pipelineStep === 1 && 'Loading schema context and few-shot examples…'}
                    {pipelineStep === 2 && 'AI is generating SQL — NVIDIA NIM is processing…'}
                    {pipelineStep === 3 && 'Validating SQL — safety checks and limit enforcement…'}
                    {pipelineStep === 4 && 'Executing query on PostgreSQL…'}
                  </>
                )}
              </span>
              {isAiStep && elapsedBadge && (
                <span style={{
                  background: `${accent}18`, border: `1px solid ${accent}30`,
                  borderRadius: 99, padding: '1px 9px', fontSize: 10, fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace", color: accent, flexShrink: 0,
                }}>
                  ⏱ {elapsedBadge}
                </span>
              )}
            </div>
          )}

          {/* Nemotron slow-model notice */}
          {isAiStep && elapsed >= 15 && (
            <div style={{
              marginTop: 8, padding: '6px 12px',
              background: isDark ? 'rgba(251,191,36,0.12)' : '#FFF8E1',
              borderRadius: 9, border: isDark ? '1px solid rgba(251,191,36,0.28)' : '1px solid #FFE082',
              fontSize: 10.5, color: isDark ? 'rgba(251,191,36,0.90)' : '#E65100',
              display: 'flex', alignItems: 'center', gap: 6, fontFamily:"'Inter', sans-serif",
            }}>
              {ICONS.lightbulb({ size: 12, color: '#F59E0B' })}
              Large model detected — Nemotron can take 30–60s. Results are coming. ☕
            </div>
          )}

          {/* Streaming SQL preview */}
          {loading && pipelineStep === 2 && streamingSql && (
            <StreamingSqlPreview sql={streamingSql} active={true} isDark={isDark} />
          )}

          {/* Done banners */}
          {allDone && hasResult && (
            <div style={{
              marginTop: 16, padding: '9px 14px',
              background: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(240,253,244,0.92)',
              backdropFilter: 'blur(16px)', borderRadius: 12,
              border: isDark ? '1px solid rgba(16,185,129,0.28)' : '1px solid rgba(134,239,172,0.60)',
              boxShadow: '0 4px 20px rgba(16,185,129,0.15), inset 0 1.5px 0 rgba(255,255,255,0.90)',
              fontSize: 11, color: '#10b981', fontWeight: 700, fontFamily:"'Inter', sans-serif",
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {ICONS.circleCheck({ size: 13, color: '#10b981' })}
              Pipeline completed — all 4 stages passed successfully
            </div>
          )}
          {allDone && hasError && (
            <div style={{
              marginTop: 16, padding: '9px 14px',
              background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(255,241,242,0.92)',
              backdropFilter: 'blur(16px)', borderRadius: 12,
              border: isDark ? '1px solid rgba(239,68,68,0.28)' : '1px solid rgba(252,165,165,0.60)',
              boxShadow: '0 4px 20px rgba(239,68,68,0.15), inset 0 1.5px 0 rgba(255,255,255,0.90)',
              fontSize: 11, color: '#ef4444', fontWeight: 700, fontFamily:"'Inter', sans-serif",
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {ICONS.circleX({ size: 13, color: '#ef4444' })}
              Pipeline stopped — see error details below
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
