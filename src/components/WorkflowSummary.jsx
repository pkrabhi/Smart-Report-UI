import { WORKFLOW_CARDS } from '../config/modules'
import { ICONS } from '../utils/icons'
import { Zap, Calendar, ChevronDown } from 'lucide-react'

function StatRow({ label, value, color }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '7px 0', borderBottom: '1px solid #F5F5F5',
    }}>
      <span style={{ fontSize: 12, color: '#757575', fontWeight: 600 }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: 800, color: value > 0 ? color : '#BDBDBD',
        minWidth: 28, textAlign: 'right',
      }}>{value}</span>
    </div>
  )
}

export default function WorkflowSummary({ module, stats = {} }) {
  const year = new Date().getFullYear()
  const finYear = `${year}-${String(year + 1).slice(2)}`

  return (
    <div style={{ padding: '18px 28px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#1A237E', color: '#fff',
          padding: '8px 18px', borderRadius: 7,
          fontSize: 13, fontWeight: 800, letterSpacing: '0.5px',
        }}>
          <Zap size={14} /> WORKFLOW SUMMARY
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#fff', border: '1.5px solid #E0E0E0',
          borderRadius: 8, padding: '6px 14px',
        }}>
          <span style={{ fontSize: 12, color: '#757575', fontWeight: 600 }}>Financial Year:</span>
          <Calendar size={14} color="#1A237E" />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#1A237E' }}>{finYear}</span>
          <ChevronDown size={12} color="#9E9E9E" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 8 }}>
        {WORKFLOW_CARDS.map(card => {
          const s = stats[card.key] || { pending: 0, approved: 0, rejected: 0 }
          const CardIcon = ICONS[card.icon]
          return (
            <div key={card.key} style={{
              background: '#fff', borderRadius: 10,
              border: '1px solid #EEEEEE',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '11px 14px 9px',
                borderLeft: `4px solid ${card.color}`,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: card.lightColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {CardIcon && CardIcon({ size: 16, color: card.color })}
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: card.color }}>
                  {card.label}
                </span>
              </div>

              <div style={{ padding: '4px 14px 10px' }}>
                <StatRow label="PENDING"  value={s.pending}  color={card.color} />
                <StatRow label="APPROVED" value={s.approved} color="#2E7D32" />
                <StatRow label="REJECTED" value={s.rejected} color="#C62828" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
