import { useState, useRef, useCallback, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell
} from 'recharts'
import html2canvas from 'html2canvas'
import {
  Download, RefreshCw, Lightbulb, ChevronDown,
  BarChart3, TrendingUp, PieChart as PieIcon, ScatterChart as ScatterIcon,
  AreaChart as AreaIcon, ArrowRightLeft, Maximize2, Minimize2
} from 'lucide-react'
import { detectChart, prepareChartData, formatLabel, CHART_COLORS } from '../utils/chartDetector'

// ── Chart Type Icons ─────────────────────────
const CHART_TYPE_META = {
  bar:            { label: 'Bar',            Icon: BarChart3 },
  grouped_bar:    { label: 'Grouped Bar',    Icon: BarChart3 },
  horizontal_bar: { label: 'Horizontal Bar', Icon: ArrowRightLeft },
  line:           { label: 'Line',           Icon: TrendingUp },
  area:           { label: 'Area',           Icon: AreaIcon },
  pie:            { label: 'Pie',            Icon: PieIcon },
  scatter:        { label: 'Scatter',        Icon: ScatterIcon },
}

// ── Custom Tooltip ───────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8,
      padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      fontSize: 12, fontFamily: "'Nunito', sans-serif",
    }}>
      <div style={{ fontWeight: 800, color: '#1A237E', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
          <span style={{ color: '#757575' }}>{formatLabel(p.dataKey)}:</span>
          <span style={{ fontWeight: 700, color: '#1E2A4A', fontFamily: "'Fira Code', monospace" }}>
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Pie Label ────────────────────────────────
function renderPieLabel({ name, percent }) {
  if (percent < 0.04) return null
  return `${name} (${(percent * 100).toFixed(0)}%)`
}

// ── Main Component ───────────────────────────
export default function ChartPanel({ columns, data, accentColor = '#3949AB', question = '', isDark = true }) {
  const chartRef = useRef(null)
  const [expanded, setExpanded] = useState(false)
  const [maxRows, setMaxRows] = useState(30)
  const [exporting, setExporting] = useState(false)

  // Run detection
  const detection = detectChart(columns, data)
  const [chartType, setChartType] = useState(detection.chartType)
  const [xCol, setXCol] = useState(detection.xColumn)
  const [yCols, setYCols] = useState(detection.yColumns)

  // ✅ Reset chart config when a new query result arrives (different columns/data shape)
  useEffect(() => {
    const fresh = detectChart(columns, data)
    setChartType(fresh.chartType)
    setXCol(fresh.xColumn)
    setYCols(fresh.yColumns)
    setMaxRows(30)
  }, [columns, data])

  // Prepare data for Recharts
  const chartData = prepareChartData(data, xCol, yCols, maxRows)

  // Toggle Y column
  const toggleYCol = (col) => {
    setYCols(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    )
  }

  // Get all numeric columns for Y-axis selector
  const numericCols = columns.filter(c => detection.columnTypes[c] === 'numeric')
  const categoricalCols = columns.filter(c => detection.columnTypes[c] !== 'numeric')

  // PNG Export
  const exportPNG = useCallback(async () => {
    if (!chartRef.current) return
    setExporting(true)
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `chart_${question.slice(0, 30).replace(/\s+/g, '_') || 'export'}_${new Date().toISOString().slice(0, 10)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('PNG export failed:', e)
    } finally {
      setExporting(false)
    }
  }, [question])

  // Reset to auto-detected
  const resetChart = () => {
    setChartType(detection.chartType)
    setXCol(detection.xColumn)
    setYCols(detection.yColumns)
    setMaxRows(30)
  }

  if (detection.chartType === 'none') {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#BDBDBD' }}>
        <BarChart3 size={36} color="#E0E0E0" style={{ marginBottom: 10 }} />
        <div style={{ fontSize: 14, fontWeight: 700 }}>No chart available</div>
        <div style={{ fontSize: 12, marginTop: 6 }}>{detection.recommendation}</div>
      </div>
    )
  }

  const chartHeight = expanded ? 520 : 340

  // ── Render Chart by Type ───────────────────
  function renderChart() {
    const commonAxisProps = {
      tick: { fontSize: 11, fill: '#9E9E9E', fontFamily: "'Nunito', sans-serif" },
      axisLine: { stroke: '#E0E0E0' },
      tickLine: { stroke: '#E0E0E0' },
    }

    const gridProps = { strokeDasharray: "3 3", stroke: '#F0F0F0' }

    switch (chartType) {
      case 'bar':
      case 'grouped_bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...commonAxisProps} angle={chartData.length > 12 ? -35 : 0} textAnchor={chartData.length > 12 ? 'end' : 'middle'} height={chartData.length > 12 ? 70 : 40} />
              <YAxis {...commonAxisProps} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              {yCols.length > 1 && <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'Nunito'" }} />}
              {yCols.map((col, i) => (
                <Bar key={col} dataKey={col} name={formatLabel(col)} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={56} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'horizontal_bar':
        return (
          <ResponsiveContainer width="100%" height={Math.max(chartHeight, chartData.length * 32)}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid {...gridProps} />
              <XAxis type="number" {...commonAxisProps} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <YAxis type="category" dataKey="name" {...commonAxisProps} width={120} />
              <Tooltip content={<CustomTooltip />} />
              {yCols.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
              {yCols.map((col, i) => (
                <Bar key={col} dataKey={col} name={formatLabel(col)} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[0, 4, 4, 0]} maxBarSize={28} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...commonAxisProps} angle={chartData.length > 12 ? -35 : 0} textAnchor={chartData.length > 12 ? 'end' : 'middle'} height={chartData.length > 12 ? 70 : 40} />
              <YAxis {...commonAxisProps} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              {yCols.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
              {yCols.map((col, i) => (
                <Line key={col} type="monotone" dataKey={col} name={formatLabel(col)}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2.5}
                  dot={{ r: 3, fill: CHART_COLORS[i % CHART_COLORS.length] }}
                  activeDot={{ r: 5, strokeWidth: 2 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...commonAxisProps} />
              <YAxis {...commonAxisProps} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              {yCols.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
              {yCols.map((col, i) => (
                <Area key={col} type="monotone" dataKey={col} name={formatLabel(col)}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  fillOpacity={0.15} strokeWidth={2} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey={yCols[0]}
                nameKey="name"
                cx="50%" cy="50%"
                outerRadius={expanded ? 180 : 120}
                innerRadius={expanded ? 70 : 45}
                paddingAngle={2}
                label={renderPieLabel}
                labelLine={{ stroke: '#BDBDBD', strokeWidth: 1 }}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'Nunito'" }} />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" name={formatLabel(xCol)} {...commonAxisProps} />
              <YAxis dataKey={yCols[0]} name={formatLabel(yCols[0])} {...commonAxisProps} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={chartData} fill={accentColor}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )

      default:
        return <div style={{ padding: 24, color: '#BDBDBD' }}>Unsupported chart type: {chartType}</div>
    }
  }

  return (
    <div>
      {/* ── AI Recommendation Banner ── */}
      <div style={{
        margin: '0 0 14px', padding: '8px 14px',
        background: '#F8F9FF', borderRadius: 8, border: '1px solid #E8EAF6',
        display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#5C6BC0',
      }}>
        <Lightbulb size={13} color="#5C6BC0" />
        <span style={{ fontWeight: 600 }}>{detection.recommendation}</span>
      </div>

      {/* ── Toolbar: chart type + axes + export ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        marginBottom: 14, padding: '0 2px',
      }}>
        {/* Chart type switcher */}
        <div style={{ display: 'flex', gap: 3, background: '#F5F5F5', borderRadius: 8, padding: 3 }}>
          {detection.allChartTypes.map(type => {
            const meta = CHART_TYPE_META[type]
            if (!meta) return null
            const active = chartType === type
            return (
              <button key={type} onClick={() => setChartType(type)}
                title={meta.label}
                style={{
                  padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 10, fontWeight: 700, fontFamily: "'Nunito'", transition: 'all 0.15s',
                  background: active ? accentColor : 'transparent',
                  color: active ? '#fff' : '#9E9E9E',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                <meta.Icon size={11} />
                {meta.label}
              </button>
            )
          })}
        </div>

        {/* X Axis selector */}
        {chartType !== 'pie' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#9E9E9E' }}>
            <span style={{ fontWeight: 700 }}>X:</span>
            <select value={xCol || ''} onChange={e => setXCol(e.target.value)}
              style={{
                padding: '3px 6px', borderRadius: 5, border: '1px solid #E0E0E0',
                fontSize: 10, color: '#1E2A4A', fontFamily: "'Nunito'", background: '#fff',
                cursor: 'pointer', outline: 'none',
              }}>
              <option value="__row_index__">Row #</option>
              {columns.map(c => <option key={c} value={c}>{formatLabel(c)}</option>)}
            </select>
          </div>
        )}

        {/* Y columns toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#9E9E9E' }}>Y:</span>
          {numericCols.map((col, i) => {
            const active = yCols.includes(col)
            return (
              <button key={col} onClick={() => toggleYCol(col)}
                style={{
                  padding: '2px 8px', borderRadius: 99, border: 'none', cursor: 'pointer',
                  fontSize: 10, fontWeight: 600, fontFamily: "'Nunito'", transition: 'all 0.15s',
                  background: active ? CHART_COLORS[i % CHART_COLORS.length] + '20' : '#F5F5F5',
                  color: active ? CHART_COLORS[i % CHART_COLORS.length] : '#BDBDBD',
                  borderLeft: active ? `3px solid ${CHART_COLORS[i % CHART_COLORS.length]}` : '3px solid transparent',
                }}>
                {formatLabel(col)}
              </button>
            )
          })}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Row limit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#9E9E9E' }}>
          <span>Rows:</span>
          <select value={maxRows} onChange={e => setMaxRows(Number(e.target.value))}
            style={{ padding: '2px 4px', borderRadius: 4, border: '1px solid #E0E0E0', fontSize: 10, cursor: 'pointer', outline: 'none' }}>
            {[10, 20, 30, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {/* Expand/Collapse */}
        <button onClick={() => setExpanded(v => !v)}
          style={{ padding: '4px 8px', background: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#757575' }}>
          {expanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
          {expanded ? 'Compact' : 'Expand'}
        </button>

        {/* Reset */}
        <button onClick={resetChart}
          style={{ padding: '4px 8px', background: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#757575' }}>
          <RefreshCw size={10} /> Reset
        </button>

        {/* Export PNG */}
        <button onClick={exportPNG} disabled={exporting}
          style={{
            padding: '5px 12px', background: accentColor, border: 'none', borderRadius: 6,
            cursor: exporting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: "'Nunito'",
          }}>
          <Download size={11} />
          {exporting ? 'Exporting…' : 'PNG'}
        </button>
      </div>

      {/* ── Chart Canvas ── */}
      <div ref={chartRef} style={{
        background: '#fff', borderRadius: 10, border: '1px solid #F0F0F0',
        padding: '16px 8px 8px',
      }}>
        {/* Chart title (visible in PNG export) */}
        <div style={{
          textAlign: 'center', marginBottom: 8,
          fontSize: 12, fontWeight: 700, color: '#1A237E',
        }}>
          {question || 'Query Results'}
        </div>
        {yCols.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#BDBDBD', fontSize: 13 }}>
            Select at least one Y-axis metric above to render a chart.
          </div>
        ) : renderChart()}
        {/* Footer for PNG */}
        <div style={{ textAlign: 'right', fontSize: 9, color: '#D0D0D0', padding: '4px 12px 0' }}>
          KMC Smart Query · {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
