import { useState, useMemo } from 'react'
import { MODULE_CONFIG } from '../config/modules'
import { ICONS } from '../utils/icons'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight }    from 'react-syntax-highlighter/dist/esm/styles/prism'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import ChartPanel from './ChartPanel'
import RagStatsBadge from './RagStatsBadge'
import { glassStyle } from '../config/theme'
import {
  BarChart3, Code2, Info, Download, FileText, Copy, Check,
  ArrowUp, ArrowDown, Inbox, Key, Package, Cpu, Zap, Clock, Columns3,
  TrendingUp, Star, Loader, ThumbsUp, ThumbsDown, CornerDownRight, GitBranch
} from 'lucide-react'

// ── SQL syntax highlighter: picks theme by isDark ──
function SqlViewer({ sql, isDark }) {
  if (!sql) return null

  const darkStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: 'rgba(0,0,20,0.55)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: '10px',
      padding: '16px',
      margin: 0,
      backdropFilter: 'blur(12px)',
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      fontSize: '12.5px',
      lineHeight: '1.7',
    },
  }

  const lightStyle = {
    ...oneLight,
    'pre[class*="language-"]': {
      ...oneLight['pre[class*="language-"]'],
      background: '#F8F9FF',
      border: '1px solid #E8EAF6',
      borderRadius: '10px',
      padding: '16px',
      margin: 0,
    },
    'code[class*="language-"]': {
      ...oneLight['code[class*="language-"]'],
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      fontSize: '12.5px',
      lineHeight: '1.7',
    },
  }

  return (
    <SyntaxHighlighter
      language="sql"
      style={isDark ? darkStyle : lightStyle}
      showLineNumbers
      lineNumberStyle={{ color: isDark ? 'rgba(180,185,240,0.28)' : '#C5CAE9', fontSize: '11px', paddingRight: '12px' }}
      wrapLongLines
    >
      {sql}
    </SyntaxHighlighter>
  )
}

export default function ResultsPanel({
  module, result, followUpCtx = null,
  onExportCsv, onExportPdf,
  isFavorited = false, onToggleFavorite, onFeedback,
  isDark = true, glassOpacity = 1,
}) {
  const [tab, setTab]             = useState('table')
  const [copied, setCopied]       = useState(false)
  const [sortCol, setSortCol]     = useState(null)
  const [sortDir, setSortDir]     = useState('asc')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError]   = useState(null)
  const [feedbackGiven, setFeedbackGiven] = useState(null)
  const cfg = MODULE_CONFIG[module]

  const handlePdfExport = async () => {
    setPdfLoading(true); setPdfError(null)
    try { await onExportPdf() }
    catch (e) { setPdfError(e.message); setTimeout(() => setPdfError(null), 5000) }
    finally { setPdfLoading(false) }
  }

  const copySql    = () => { navigator.clipboard.writeText(result.generatedSql); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const handleSort = col => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }
  const sortedData = useMemo(() => {
    if (!sortCol) return result.data
    return [...result.data].sort((a, b) => {
      const cmp = String(a[sortCol] ?? '').localeCompare(String(b[sortCol] ?? ''), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [result.data, sortCol, sortDir])
  const display = sortedData.slice(0, 500)

  const TABS = [
    { id: 'table', label: 'Results',   badge: result.rowCount.toLocaleString() + ' rows', Icon: BarChart3 },
    { id: 'chart', label: 'Chart',     badge: null, Icon: TrendingUp },
    { id: 'sql',   label: 'SQL Query', badge: null, Icon: Code2 },
    { id: 'info',  label: 'Details',   badge: null, Icon: Info },
  ]

  const isFollowUp   = !!(followUpCtx?.previousQuestion)
  const followDepth  = followUpCtx?.depth || 0
  const accentFollow = '#a855f7'

  // ── Theme tokens ────────────────────────────────────────
  const glass  = useMemo(() => glassStyle({ accentHex: cfg.accentColor, isDark, radius: 16, glassOpacity }), [cfg.accentColor, isDark, glassOpacity])
  const txt1   = isDark ? 'rgba(220,222,255,0.92)' : '#1a1f3c'
  const txt2   = isDark ? 'rgba(180,185,240,0.55)' : 'rgba(26,31,60,0.44)'
  const divClr = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(26,31,60,0.07)'

  const sectionBarClr = isFollowUp ? accentFollow : (isDark ? 'rgba(52,211,153,0.88)' : '#2E7D32')

  // ── Reusable action button ───────────────────────────────
  const actionBtn = (label, Icon, onClick, { active = false, activeBg, activeBdr, activeClr, disabled = false, loading = false } = {}) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: '6px 14px',
        background: active
          ? (isDark ? activeBg || 'rgba(52,211,153,0.18)' : activeBg || '#E8F5E9')
          : isDark ? 'rgba(255,255,255,0.07)' : '#F5F5F5',
        border: `1px solid ${active
          ? (isDark ? activeBdr || 'rgba(52,211,153,0.35)' : activeBdr || '#A5D6A7')
          : isDark ? 'rgba(255,255,255,0.13)' : '#E0E0E0'}`,
        borderRadius: 7, cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif",
        display: 'flex', alignItems: 'center', gap: 5,
        color: active
          ? (isDark ? activeClr || 'rgba(52,211,153,0.90)' : activeClr || '#2E7D32')
          : txt2,
        transition: 'all 0.15s',
      }}
    >
      {loading ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Icon size={12} />}
      {label}
    </button>
  )

  return (
    <div style={{ padding: '0 28px 24px' }}>

      {/* ── Follow-up context banner ── */}
      {isFollowUp && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', marginBottom: 8,
          background: isDark ? 'rgba(168,85,247,0.14)' : 'linear-gradient(90deg, #EDE7F6 0%, #F3E5F5 100%)',
          border: `1px solid ${isDark ? 'rgba(168,85,247,0.30)' : '#CE93D8'}`,
          borderLeft: `3px solid ${accentFollow}`,
          borderRadius: 10, fontSize: 11,
          backdropFilter: isDark ? 'blur(16px)' : 'none',
        }}>
          <CornerDownRight size={13} color={accentFollow} style={{ flexShrink: 0 }} />
          <span style={{ color: accentFollow, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
            FOLLOW-UP {followDepth > 1 ? `#${followDepth}` : ''}
          </span>
          <span style={{ color: txt2, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>based on:</span>
          <span style={{
            color: isDark ? 'rgba(216,180,254,0.92)' : '#4A148C',
            fontWeight: 700, fontStyle: 'italic',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1, maxWidth: 600, fontFamily: "'Inter', sans-serif",
          }}>
            "{followUpCtx.previousQuestion}"
          </span>
          {followDepth > 1 && (
            <span style={{
              background: accentFollow, color: '#fff', fontSize: 9, fontWeight: 800,
              padding: '2px 7px', borderRadius: 99, fontFamily: "'Inter', sans-serif",
            }}>DEPTH {followDepth}</span>
          )}
        </div>
      )}

      {/* ── Section header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ width: 4, height: 22, borderRadius: 2, background: sectionBarClr, boxShadow: `0 2px 8px ${sectionBarClr}55` }} />
        <span style={{ fontSize: 14, fontWeight: 800, color: txt1, display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Inter', sans-serif" }}>
          {isFollowUp
            ? <><GitBranch size={15} color={accentFollow} /> Follow-up Results</>
            : <><BarChart3 size={15} color={isDark ? 'rgba(52,211,153,0.88)' : '#1A237E'} /> Query Results</>
          }
        </span>
        <span style={{
          background: isDark ? 'rgba(52,211,153,0.14)' : '#E8F5E9',
          color: isDark ? 'rgba(52,211,153,0.90)' : '#2E7D32',
          border: `1px solid ${isDark ? 'rgba(52,211,153,0.28)' : '#A5D6A7'}`,
          borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '2px 10px',
          display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter', sans-serif",
        }}>
          <Check size={11} /> {result.rowCount.toLocaleString()} rows returned
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Feedback */}
          {onFeedback && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginRight: 4 }}>
              <span style={{ fontSize: 10, color: txt2, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>SQL correct?</span>
              <button
                onClick={() => { setFeedbackGiven('up'); onFeedback(true) }}
                style={{
                  padding: '5px 10px', borderRadius: 7, cursor: 'pointer',
                  background: feedbackGiven === 'up'
                    ? isDark ? 'rgba(52,211,153,0.18)' : '#E8F5E9'
                    : isDark ? 'rgba(255,255,255,0.07)' : '#F5F5F5',
                  border: `1.5px solid ${feedbackGiven === 'up' ? (isDark ? 'rgba(52,211,153,0.35)' : '#A5D6A7') : (isDark ? 'rgba(255,255,255,0.13)' : '#E0E0E0')}`,
                  color: feedbackGiven === 'up' ? (isDark ? 'rgba(52,211,153,0.90)' : '#2E7D32') : txt2,
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
                }}>
                <ThumbsUp size={12} /> Yes
              </button>
              <button
                onClick={() => { setFeedbackGiven('down'); onFeedback(false) }}
                style={{
                  padding: '5px 10px', borderRadius: 7, cursor: 'pointer',
                  background: feedbackGiven === 'down'
                    ? isDark ? 'rgba(251,191,36,0.16)' : '#FFF3E0'
                    : isDark ? 'rgba(255,255,255,0.07)' : '#F5F5F5',
                  border: `1.5px solid ${feedbackGiven === 'down' ? (isDark ? 'rgba(251,191,36,0.35)' : '#FFCC80') : (isDark ? 'rgba(255,255,255,0.13)' : '#E0E0E0')}`,
                  color: feedbackGiven === 'down' ? (isDark ? 'rgba(251,191,36,0.90)' : '#E65100') : txt2,
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
                }}>
                <ThumbsDown size={12} /> No
              </button>
            </div>
          )}

          {onToggleFavorite && actionBtn(
            isFavorited ? 'Favorited' : 'Favorite',
            () => <Star size={12} fill={isFavorited ? (isDark ? '#fbbf24' : '#FFB300') : 'none'} color={isFavorited ? (isDark ? '#fbbf24' : '#FFB300') : txt2} />,
            onToggleFavorite,
            { active: isFavorited, activeBg: isDark ? 'rgba(251,191,36,0.16)' : '#FFF8E1', activeBdr: isDark ? 'rgba(251,191,36,0.35)' : '#FFD54F', activeClr: isDark ? 'rgba(251,191,36,0.90)' : '#E65100' }
          )}

          <button onClick={onExportCsv} style={{
            padding: '6px 14px',
            background: isDark ? 'rgba(52,211,153,0.14)' : '#E8F5E9',
            border: `1px solid ${isDark ? 'rgba(52,211,153,0.28)' : '#A5D6A7'}`,
            borderRadius: 7, cursor: 'pointer',
            color: isDark ? 'rgba(52,211,153,0.90)' : '#2E7D32',
            fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif",
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <Download size={12} /> Export CSV
          </button>

          <button onClick={handlePdfExport} disabled={pdfLoading} style={{
            padding: '6px 14px',
            background: pdfError
              ? isDark ? 'rgba(239,68,68,0.14)' : '#FFEBEE'
              : isDark ? 'rgba(168,85,247,0.14)' : '#EDE7F6',
            border: `1px solid ${pdfError
              ? isDark ? 'rgba(239,68,68,0.28)' : '#EF9A9A'
              : isDark ? 'rgba(168,85,247,0.28)' : '#CE93D8'}`,
            borderRadius: 7, cursor: pdfLoading ? 'wait' : 'pointer',
            color: pdfError ? (isDark ? 'rgba(248,113,113,0.90)' : '#C62828') : (isDark ? 'rgba(216,180,254,0.90)' : '#6A1B9A'),
            fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif",
            display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
          }}>
            {pdfLoading
              ? <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> Generating PDF…</>
              : pdfError
                ? <><FileText size={12} /> PDF Failed</>
                : <><FileText size={12} /> PDF Report</>}
          </button>
          {pdfError && <span style={{ fontSize: 10, color: isDark ? 'rgba(248,113,113,0.85)' : '#C62828', maxWidth: 180, lineHeight: 1.3, fontFamily: "'Inter', sans-serif" }}>{pdfError}</span>}
        </div>
      </div>

      {/* ── Result Card ── */}
      <div style={{
        ...glass,
        borderLeft: `4px solid ${isFollowUp ? accentFollow : (isDark ? 'rgba(52,211,153,0.70)' : '#2E7D32')}`,
        overflow: 'hidden',
      }}>
        {/* Top specular highlight + chromatic fringing */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:7, background:'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, transparent 100%)', borderRadius:'16px 16px 0 0', pointerEvents:'none', zIndex:3 }} />
        <div style={{ position: 'relative', zIndex: 3 }}>

          {/* ── Meta bar + tabs ── */}
          <div style={{
            padding: '10px 18px',
            background: isDark ? 'rgba(255,255,255,0.05)' : '#F8FFF8',
            borderBottom: `1px solid ${divClr}`,
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 11, color: txt2, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter', sans-serif" }}>
              <Cpu size={11} /> Provider: <strong style={{ color: isDark ? 'rgba(52,211,153,0.90)' : '#2E7D32' }}>{result.source}</strong>
            </span>
            <span style={{ color: divClr }}>|</span>
            <span style={{ fontSize: 11, color: txt2, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter', sans-serif" }}>
              <Clock size={11} /> Time: <strong style={{ color: txt1 }}>{result.executionTimeMs.toLocaleString()}ms</strong>
            </span>
            <span style={{ color: divClr }}>|</span>
            <span style={{ fontSize: 11, color: txt2, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter', sans-serif" }}>
              <Key size={11} /> ID:
              <code style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : '#F5F5F5',
                padding: '1px 6px', borderRadius: 4, fontSize: 11,
                color: isDark ? 'rgba(139,148,255,0.88)' : '#5C6BC0',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {result.queryId}
              </code>
            </span>

            {result.ragStats && (
              <>
                <span style={{ color: divClr }}>|</span>
                <RagStatsBadge ragStats={result.ragStats} isDark={isDark} />
              </>
            )}

            {/* Tabs */}
            <div style={{
              marginLeft: 'auto', display: 'flex', gap: 2,
              background: isDark ? 'rgba(255,255,255,0.06)' : '#F5F5F5',
              borderRadius: 9, padding: 3,
            }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{
                    padding: '5px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
                    background: tab === t.id
                      ? `linear-gradient(155deg, oklch(0.78 0.18 262), ${cfg.accentColor}, oklch(0.52 0.22 280))`
                      : 'transparent',
                    color: tab === t.id ? '#fff' : txt2,
                    display: 'flex', alignItems: 'center', gap: 5,
                    boxShadow: tab === t.id ? `0 4px 14px ${cfg.accentColor}44, inset 0 1.5px 0 rgba(255,255,255,0.28)` : 'none',
                  }}>
                  <t.Icon size={12} />
                  {t.label}
                  {t.badge && tab === t.id && (
                    <span style={{ marginLeft: 3, background: 'rgba(255,255,255,0.25)', padding: '0 5px', borderRadius: 99, fontSize: 10 }}>
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Table Tab ── */}
          {tab === 'table' && (
            <>
              <div style={{ overflowX: 'auto', maxHeight: 420 }}>
                {result.data.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: txt2 }}>
                    <Inbox size={36} color={txt2} style={{ marginBottom: 10 }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: txt1, fontFamily: "'Inter', sans-serif" }}>No records returned</div>
                    <div style={{ fontSize: 12, marginTop: 6, fontFamily: "'Inter', sans-serif" }}>Query executed successfully but returned 0 rows.</div>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                    <thead>
                      <tr style={{
                        background: isDark ? 'rgba(255,255,255,0.05)' : '#F8F9FF',
                        position: 'sticky', top: 0, zIndex: 2,
                      }}>
                        <th style={{
                          padding: '9px 12px', color: txt2, width: 44,
                          borderBottom: `1.5px solid ${divClr}`,
                          fontSize: 10, fontWeight: 700, fontFamily: "'Inter', sans-serif",
                        }}>#</th>
                        {result.columns.map(col => (
                          <th key={col} onClick={() => handleSort(col)}
                            style={{
                              padding: '9px 14px', textAlign: 'left',
                              color: isDark ? 'rgba(139,148,255,0.88)' : '#5C6BC0',
                              fontWeight: 800, borderBottom: `1.5px solid ${divClr}`,
                              whiteSpace: 'nowrap', cursor: 'pointer', fontSize: 11,
                              fontFamily: "'Inter', sans-serif",
                              background: sortCol === col
                                ? isDark ? 'rgba(99,102,241,0.12)' : '#EEF0FF'
                                : 'transparent',
                            }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              {col}
                              {sortCol === col && (sortDir === 'asc'
                                ? <ArrowUp size={10} color={cfg.accentColor} />
                                : <ArrowDown size={10} color={cfg.accentColor} />)}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {display.map((row, ri) => (
                        <tr key={ri}
                          style={{ borderBottom: `1px solid ${divClr}`, transition: 'background 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : '#F8F9FF'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{
                            padding: '8px 12px', color: txt2, fontSize: 11,
                            textAlign: 'right', fontFamily: "'JetBrains Mono', monospace",
                          }}>{ri + 1}</td>
                          {result.columns.map(col => {
                            const val = row[col]
                            const isNull = val == null
                            const str    = isNull ? 'null' : String(val)
                            const isNum  = !isNull && !isNaN(Number(val)) && str !== ''
                            return (
                              <td key={col} style={{ padding: '8px 14px', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={str}>
                                {isNull
                                  ? <span style={{ color: txt2, fontStyle: 'italic', fontFamily: "'Inter', sans-serif" }}>null</span>
                                  : isNum
                                    ? <span style={{ color: isDark ? 'rgba(139,148,255,0.88)' : '#3949AB', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{str}</span>
                                    : <span style={{ color: txt1, fontFamily: "'Inter', sans-serif" }}>{str}</span>}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {result.data.length > 500 && (
                <div style={{
                  padding: '8px 18px',
                  background: isDark ? 'rgba(251,191,36,0.10)' : '#FFFDE7',
                  borderTop: `1px solid ${isDark ? 'rgba(251,191,36,0.22)' : '#FFF9C4'}`,
                  fontSize: 11, color: isDark ? 'rgba(251,191,36,0.90)' : '#F57F17',
                  fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {ICONS.alert({ size: 12, color: isDark ? 'rgba(251,191,36,0.90)' : '#F57F17' })}
                  Showing first 500 of {result.rowCount.toLocaleString()} rows — Export CSV for complete data
                </div>
              )}

              <div style={{ padding: '7px 18px', borderTop: `1px solid ${divClr}`, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, color: txt2, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter', sans-serif" }}>
                  <Columns3 size={10} /> {result.columns.length} columns · {Math.min(display.length, 500)} rows displayed
                </span>
                <span style={{ fontSize: 10, color: txt2, fontFamily: "'Inter', sans-serif" }}>Click column header to sort</span>
              </div>
            </>
          )}

          {/* ── Chart Tab ── */}
          {tab === 'chart' && (
            <div style={{ padding: '18px' }}>
              <ChartPanel
                columns={result.columns}
                data={result.data}
                accentColor={cfg.accentColor}
                question={result.question}
                isDark={isDark}
              />
            </div>
          )}

          {/* ── SQL Tab ── */}
          {tab === 'sql' && (
            <div style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <button onClick={copySql}
                  style={{
                    padding: '6px 14px',
                    background: copied
                      ? isDark ? 'rgba(52,211,153,0.16)' : '#E8F5E9'
                      : isDark ? 'rgba(255,255,255,0.07)' : '#F5F5F5',
                    border: `1px solid ${copied
                      ? isDark ? 'rgba(52,211,153,0.30)' : '#A5D6A7'
                      : isDark ? 'rgba(255,255,255,0.13)' : '#E0E0E0'}`,
                    borderRadius: 7, fontSize: 11, cursor: 'pointer',
                    color: copied ? (isDark ? 'rgba(52,211,153,0.90)' : '#2E7D32') : txt2,
                    fontWeight: 700, fontFamily: "'Inter', sans-serif",
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                  {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy SQL</>}
                </button>
              </div>
              <SqlViewer sql={result.generatedSql} isDark={isDark} />
            </div>
          )}

          {/* ── Info Tab ── */}
          {tab === 'info' && (
            <div style={{ padding: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
                {[
                  { label: 'Query ID',      val: result.queryId,                   Icon: Key,      color: isDark ? 'rgba(139,148,255,0.88)' : '#3949AB' },
                  { label: 'Module',        val: module,                           Icon: Package,  color: cfg.accentColor },
                  { label: 'AI Provider',   val: result.source,                    Icon: Cpu,      color: isDark ? 'rgba(216,180,254,0.88)' : '#7B1FA2' },
                  { label: 'Rows Returned', val: result.rowCount.toLocaleString(), Icon: BarChart3, color: isDark ? 'rgba(52,211,153,0.88)' : '#2E7D32' },
                  { label: 'Exec. Time',    val: `${result.executionTimeMs} ms`,   Icon: Zap,      color: isDark ? 'rgba(251,191,36,0.88)' : '#E65100' },
                  { label: 'Columns',       val: result.columns.length,            Icon: Columns3, color: isDark ? 'rgba(34,211,238,0.88)' : '#00838F' },
                ].map(({ label, val, Icon, color }) => (
                  <div key={label} style={{
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#F8F9FF',
                    borderRadius: 10, padding: '13px 15px',
                    border: `1px solid ${divClr}`,
                    borderLeft: `3px solid ${color}`,
                  }}>
                    <div style={{ fontSize: 10, color: txt2, fontWeight: 700, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter', sans-serif" }}>
                      <Icon size={11} color={txt2} /> {label}
                    </div>
                    <div style={{ fontSize: 13, color: txt1, fontWeight: 800, fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
