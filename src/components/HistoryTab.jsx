import { MODULE_CONFIG } from '../config/modules'
import { ModuleIcon } from '../utils/icons'
import { ClipboardList, Trash2, Play, Clock, CheckCircle } from 'lucide-react'

export default function HistoryTab({ history, onReplay, onClear, confirmedQueryIds = new Set() }) {
  const confirmedCount = history.filter(h => confirmedQueryIds.has(h.id)).length

  return (
    <div style={{ padding: '0 28px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 4, height: 22, borderRadius: 2, background: '#7B1FA2' }} />
        <span style={{ fontSize: 14, fontWeight: 800, color: '#1A237E', display: 'flex', alignItems: 'center', gap: 6 }}>
          <ClipboardList size={15} color="#1A237E" /> Query History
        </span>
        <span style={{ fontSize: 11, color: '#9E9E9E' }}>Last 30 queries saved locally</span>

        {/* ── Point 3: confirmed count badge ── */}
        {confirmedCount > 0 && (
          <span style={{
            background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7',
            borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '2px 10px',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <CheckCircle size={11} /> {confirmedCount} confirmed correct
          </span>
        )}

        {history.length > 0 && (
          <button onClick={onClear}
            style={{ marginLeft: 'auto', padding: '5px 12px', background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 7, color: '#C62828', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: "'Nunito', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
            <Trash2 size={11} /> Clear All
          </button>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {history.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#BDBDBD' }}>
            <Clock size={36} color="#BDBDBD" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>No query history</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Your queries will appear here after you run them.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#F8F9FF' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', color: '#5C6BC0', fontWeight: 800, borderBottom: '1.5px solid #E8EAF6', fontSize: 11 }}>#</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', color: '#5C6BC0', fontWeight: 800, borderBottom: '1.5px solid #E8EAF6', fontSize: 11 }}>MODULE</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', color: '#5C6BC0', fontWeight: 800, borderBottom: '1.5px solid #E8EAF6', fontSize: 11 }}>QUESTION</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', color: '#5C6BC0', fontWeight: 800, borderBottom: '1.5px solid #E8EAF6', fontSize: 11 }}>ROWS</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', color: '#5C6BC0', fontWeight: 800, borderBottom: '1.5px solid #E8EAF6', fontSize: 11 }}>TIME</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', color: '#5C6BC0', fontWeight: 800, borderBottom: '1.5px solid #E8EAF6', fontSize: 11 }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => {
                const mc          = MODULE_CONFIG[h.moduleCode]
                const isConfirmed = confirmedQueryIds.has(h.id)
                return (
                  <tr key={h.id + i}
                    style={{ borderBottom: '1px solid #F5F5F5', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8F9FF'}
                    onMouseLeave={e => e.currentTarget.style.background = isConfirmed ? '#F1FBF3' : '#fff'}>
                    <td style={{ padding: '10px 16px', color: '#BDBDBD', fontSize: 11 }}>{i + 1}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ background: mc?.tagBg, color: mc?.tagText, borderRadius: 99, fontSize: 10, padding: '2px 9px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <ModuleIcon moduleKey={h.moduleCode} size={11} color={mc?.tagText} />
                        {mc?.shortLabel}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', color: '#1E2A4A', maxWidth: 380 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {/* ── Point 3: confirmed checkmark badge ── */}
                        {isConfirmed && (
                          <span title="SQL confirmed correct — added to training examples" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7',
                            borderRadius: 99, fontSize: 9.5, fontWeight: 700, padding: '1px 7px',
                            flexShrink: 0, whiteSpace: 'nowrap',
                          }}>
                            <CheckCircle size={9} /> Confirmed
                          </span>
                        )}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {h.question}
                        </span>
                      </div>
                      <div style={{ fontSize: 10, color: '#BDBDBD', marginTop: 2, fontFamily: 'monospace' }}>
                        {h.id?.slice(-12)}
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: h.rowCount > 0 ? '#2E7D32' : '#BDBDBD' }}>
                      {h.rowCount?.toLocaleString() ?? 0}
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', color: '#757575', fontFamily: 'monospace', fontSize: 11 }}>
                      {h.executionTimeMs != null ? `${h.executionTimeMs}ms` : '—'}
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <button onClick={() => onReplay(h)}
                        style={{ padding: '4px 12px', background: mc?.tagBg, border: `1px solid ${mc?.accentBorder}40`, borderRadius: 6, color: mc?.tagText, cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: "'Nunito', sans-serif", display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Play size={10} fill={mc?.tagText} /> Replay
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
