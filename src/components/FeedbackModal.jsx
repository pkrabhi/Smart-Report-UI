import { useState } from 'react'
import { ThumbsUp, ThumbsDown, X, Sparkles, CheckCircle, AlertCircle, Loader } from 'lucide-react'

const CATEGORIES = [
  'Stallage Reports',
  'Collection Reports',
  'Demand Reports',
  'Electricity Reports',
  'Mutation Reports',
  'General Reports',
]

/**
 * FeedbackModal — Point 2
 * Shown when user clicks 👍 or 👎 on a query result.
 *
 * isCorrect=true  → lets user pick category → saves to few_shot_examples.json
 * isCorrect=false → records negative signal (no SQL saved)
 */
export default function FeedbackModal({ result, question, moduleCode, onClose, onSubmit }) {
  const [category, setCategory]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(null)   // 'saved' | 'skipped_duplicate' | 'error'
  const [message, setMessage]       = useState('')

  const handleSubmit = async (isCorrect) => {
    setSubmitting(true)
    try {
      const res = await onSubmit({
        question,
        sql:               result.generatedSql,
        moduleCode,
        queryId:           result.queryId,
        isCorrect,
        suggestedCategory: isCorrect ? (category || undefined) : undefined,
      })
      setSubmitted(res.action)
      setMessage(res.message)
      // Auto-close after 2.4s
      setTimeout(() => onClose(), 2400)
    } catch (e) {
      setSubmitted('error')
      setMessage(e.message)
      setTimeout(() => onClose(), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(26,35,78,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '28px 30px', width: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        border: '1px solid #E8EAF6',
        animation: 'slideInModal 0.2s ease',
      }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: '#E8EAF6', borderRadius: 8, padding: 6 }}>
              <Sparkles size={16} color="#3949AB" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#1A237E' }}>Rate this result</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} color="#9E9E9E" />
          </button>
        </div>

        {/* ── Success / Duplicate / Error state ── */}
        {submitted && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            padding: '24px 0', textAlign: 'center',
          }}>
            {submitted === 'saved' ? (
              <CheckCircle size={42} color="#2E7D32" />
            ) : submitted === 'skipped_duplicate' ? (
              <CheckCircle size={42} color="#F9A825" />
            ) : submitted === 'skipped_incorrect' ? (
              <CheckCircle size={42} color="#5C6BC0" />
            ) : (
              <AlertCircle size={42} color="#C62828" />
            )}
            <div style={{ fontSize: 13, color: '#37474F', fontWeight: 600, maxWidth: 320, lineHeight: 1.5 }}>
              {message}
            </div>
          </div>
        )}

        {/* ── Main UI — only when not yet submitted ── */}
        {!submitted && (
          <>
            {/* Question preview */}
            <div style={{
              background: '#F8F9FF', border: '1px solid #E8EAF6', borderRadius: 8,
              padding: '10px 14px', marginBottom: 20, fontSize: 12.5, color: '#37474F',
              lineHeight: 1.5, fontStyle: 'italic',
            }}>
              "{question}"
            </div>

            {/* Category selector (only shown for positive) */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#757575', display: 'block', marginBottom: 6 }}>
                CATEGORY <span style={{ color: '#BDBDBD', fontWeight: 400 }}>(optional — helps train the AI)</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: '1px solid #E0E0E0', fontSize: 12.5, color: '#37474F',
                  background: '#fff', fontFamily: "'Nunito', sans-serif", cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="">Auto-detect category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 9,
                  background: '#FFF3E0', border: '1.5px solid #FFCC80',
                  color: '#E65100', fontWeight: 800, fontSize: 12.5,
                  fontFamily: "'Nunito', sans-serif", cursor: submitting ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  transition: 'all 0.15s',
                }}
              >
                {submitting ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ThumbsDown size={14} />}
                Incorrect SQL
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 9,
                  background: '#E8F5E9', border: '1.5px solid #A5D6A7',
                  color: '#2E7D32', fontWeight: 800, fontSize: 12.5,
                  fontFamily: "'Nunito', sans-serif", cursor: submitting ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  transition: 'all 0.15s',
                }}
              >
                {submitting ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ThumbsUp size={14} />}
                Correct SQL
              </button>
            </div>

            <p style={{ fontSize: 10.5, color: '#BDBDBD', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
              ✨ Correct answers are added to the AI's training examples and improve future results automatically.
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideInModal {
          from { opacity: 0; transform: translateY(-16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
