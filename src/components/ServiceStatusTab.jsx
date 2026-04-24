import { useState, useEffect } from 'react'
import { MODULE_CONFIG } from '../config/modules'
import { ModuleIcon } from '../utils/icons'
import { fetchFeedbackStats } from '../utils/api'
import {
  Radio, RefreshCw, Globe, Cpu, Monitor, Package,
  Check, X, BookOpen, Sparkles, Database
} from 'lucide-react'

function StatusCard({ title, Icon, color, lightColor, items }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10, border: '1px solid #E0E0E0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ padding: '12px 16px', background: lightColor, borderBottom: `1px solid ${color}20`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={18} color={color} />
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{title}</span>
      </div>
      <div style={{ padding: '10px 16px' }}>
        {items.map(({ label, value, ok }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #F5F5F5' }}>
            <span style={{ fontSize: 12, color: '#757575', fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: ok === true ? '#2E7D32' : ok === false ? '#C62828' : '#1E2A4A', display: 'flex', alignItems: 'center', gap: 4 }}>
              {ok === true && <Check size={12} color="#2E7D32" />}
              {ok === false && <X size={12} color="#C62828" />}
              {value || '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── RAG Examples Library widget (Point 1) ──────────────────────────────
function RagLibraryCard({ apiBase }) {
  const [stats, setStats]     = useState({})  // { MARKET: {...}, ENGINEERING: {...} }
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [mkt, eng] = await Promise.all([
        fetchFeedbackStats({ apiBase, moduleCode: 'MARKET' }),
        fetchFeedbackStats({ apiBase, moduleCode: 'ENGINEERING' }),
      ])
      setStats({ MARKET: mkt, ENGINEERING: eng })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [apiBase])

  const MAX = 200

  return (
    <div style={{
      background: '#fff', borderRadius: 10, border: '1px solid #E0E0E0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden',
      borderLeft: '4px solid #1565C0', gridColumn: '1 / -1',  // full width
    }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', background: '#E3F2FD', borderBottom: '1px solid #1565C020', display: 'flex', alignItems: 'center', gap: 8 }}>
        <BookOpen size={18} color="#1565C0" />
        <span style={{ fontSize: 13, fontWeight: 800, color: '#1565C0' }}>RAG Examples Library</span>
        <span style={{ fontSize: 11, color: '#64B5F6', fontWeight: 600, marginLeft: 4 }}>
          Self-improving knowledge base
        </span>
        <button onClick={load} title="Refresh stats"
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <RefreshCw size={13} color="#1565C0" />
        </button>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {loading && (
          <div style={{ color: '#9E9E9E', fontSize: 12, textAlign: 'center', padding: '12px 0' }}>
            Loading stats…
          </div>
        )}
        {error && (
          <div style={{ color: '#C62828', fontSize: 12, padding: '8px 0' }}>
            ⚠ Could not load stats: {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {['MARKET', 'ENGINEERING'].map(mod => {
              const s = stats[mod]
              if (!s) return null
              const cfg       = MODULE_CONFIG[mod]
              const total     = s.totalExamples || 0
              const feedback  = s.feedbackExamples || 0
              const staticEx  = s.staticExamples || 0
              const capPct    = Math.min(100, Math.round(total / MAX * 100))
              const barColor  = capPct > 85 ? '#C62828' : capPct > 65 ? '#E65100' : '#2E7D32'

              return (
                <div key={mod} style={{ background: '#F8F9FF', borderRadius: 9, padding: '13px 14px', border: '1px solid #E8EAF6' }}>
                  {/* Module header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <ModuleIcon moduleKey={mod} size={14} color={cfg.accentColor} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: cfg.accentColor }}>{cfg.shortLabel}</span>
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                      background: cfg.tagBg, color: cfg.tagText,
                      borderRadius: 99, padding: '1px 8px',
                    }}>
                      {total}/{MAX}
                    </span>
                  </div>

                  {/* Capacity bar */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ height: 7, background: '#E0E0E0', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${capPct}%`,
                        background: barColor, borderRadius: 99,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                      <span style={{ fontSize: 10, color: '#9E9E9E' }}>Capacity used</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: barColor }}>{capPct}%</span>
                    </div>
                  </div>

                  {/* Stats rows */}
                  {[
                    { Icon: Database,  label: 'Static examples',   val: staticEx,  color: '#1565C0' },
                    { Icon: Sparkles,  label: 'From feedback',      val: feedback,  color: '#2E7D32' },
                  ].map(({ Icon, label, val, color }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #F0F0F0' }}>
                      <span style={{ fontSize: 11, color: '#757575', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon size={10} color="#9E9E9E" /> {label}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color, fontFamily: "'Fira Code', monospace" }}>{val}</span>
                    </div>
                  ))}

                  {/* Category breakdown */}
                  {s.byCategory && Object.keys(s.byCategory).length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: '#BDBDBD', fontWeight: 700, marginBottom: 5 }}>BY CATEGORY</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {Object.entries(s.byCategory).map(([cat, count]) => (
                          <span key={cat} style={{
                            background: cfg.tagBg, color: cfg.tagText,
                            borderRadius: 99, fontSize: 9.5, fontWeight: 700,
                            padding: '2px 7px',
                          }}>
                            {cat.replace(' Reports', '')} · {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────
export default function ServiceStatusTab({ serviceInfo, serviceStatus, apiBase, onRecheck }) {
  return (
    <div style={{ padding: '0 28px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 4, height: 22, borderRadius: 2, background: '#00838F' }} />
        <span style={{ fontSize: 14, fontWeight: 800, color: '#1A237E', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Radio size={15} color="#1A237E" /> Service Status
        </span>
        <span style={{
          background: serviceStatus === true ? '#E8F5E9' : '#FFEBEE',
          color: serviceStatus === true ? '#2E7D32' : '#C62828',
          border: `1px solid ${serviceStatus === true ? '#A5D6A7' : '#FFCDD2'}`,
          borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '2px 10px',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {serviceStatus === true ? <><Check size={11} /> Online</> : serviceStatus === false ? <><X size={11} /> Offline</> : '⟳ Checking…'}
        </span>
        <button onClick={onRecheck}
          style={{ marginLeft: 'auto', padding: '6px 14px', background: '#E8EAF6', border: '1px solid #C5CAE9', borderRadius: 7, color: '#3949AB', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: "'Nunito', sans-serif", display: 'flex', alignItems: 'center', gap: 5 }}>
          <RefreshCw size={12} /> Refresh Status
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        <StatusCard
          title="Service Endpoint" Icon={Globe} color="#3949AB" lightColor="#E8EAF6"
          items={[
            { label: 'API Base URL', value: apiBase },
            { label: 'Status', value: serviceInfo?.status || 'Unknown', ok: serviceInfo?.status === 'UP' },
          ]}
        />
        <StatusCard
          title="NVIDIA NIM (Primary)" Icon={Cpu} color="#7B1FA2" lightColor="#F3E5F5"
          items={[
            { label: 'Available', value: serviceInfo?.nvidia_available ? 'Yes' : 'No', ok: serviceInfo?.nvidia_available },
            { label: 'Provider', value: serviceInfo?.nvidia_provider || 'Unknown' },
          ]}
        />
        <StatusCard
          title="Local Ollama (Fallback)" Icon={Monitor} color="#00838F" lightColor="#E0F7FA"
          items={[
            { label: 'Available', value: serviceInfo?.ollama_available ? 'Yes' : 'Disabled', ok: serviceInfo?.ollama_available },
            { label: 'Provider', value: serviceInfo?.ollama_provider || 'Not configured' },
          ]}
        />
        <StatusCard
          title="Supported Modules" Icon={Package} color="#2E7D32" lightColor="#E8F5E9"
          items={(serviceInfo?.supported_modules || ['MARKET', 'ENGINEERING']).map(m => ({
            label: MODULE_CONFIG[m]?.label || m,
            value: MODULE_CONFIG[m]?.schema,
            ok: true,
          }))}
        />

        {/* ── Point 1: RAG Examples Library (full-width card) ── */}
        <RagLibraryCard apiBase={apiBase} />
      </div>
    </div>
  )
}
