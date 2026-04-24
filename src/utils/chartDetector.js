// ─────────────────────────────────────────────
//  Smart Chart Detector
//  Analyzes columns + data from SQL results and
//  recommends the best chart type + axis mapping.
// ─────────────────────────────────────────────

// ── Color palettes per module ────────────────
const CHART_COLORS = [
  '#3949AB', '#5C6BC0', '#7986CB', '#9FA8DA',
  '#7B1FA2', '#AB47BC', '#CE93D8',
  '#2E7D32', '#66BB6A', '#A5D6A7',
  '#E65100', '#FF9800', '#FFB74D',
  '#00838F', '#26C6DA', '#80DEEA',
  '#C62828', '#EF5350', '#EF9A9A',
]

// ── Column type detection ────────────────────
function detectColumnType(column, data) {
  // Sample up to 50 rows for performance
  const sample = data.slice(0, 50)
  const nonNullValues = sample.map(r => r[column]).filter(v => v != null && String(v).trim() !== '')

  if (nonNullValues.length === 0) return 'empty'

  let numCount = 0
  let dateCount = 0

  for (const val of nonNullValues) {
    const str = String(val).trim()

    // Numeric check — handles integers, decimals, negatives
    if (!isNaN(Number(str)) && str !== '') {
      numCount++
      continue
    }

    // Date check — ISO dates, common date formats
    if (/^\d{4}-\d{2}-\d{2}/.test(str) || /^\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(str)) {
      const parsed = Date.parse(str)
      if (!isNaN(parsed)) { dateCount++; continue }
    }

    // Financial year pattern: 2024-2025, 2425, etc.
    if (/^\d{4}-\d{4}$/.test(str) || /^\d{4}-\d{2}$/.test(str)) {
      dateCount++
      continue
    }
  }

  const total = nonNullValues.length
  const threshold = 0.7 // 70% of values must match

  if (numCount / total >= threshold)  return 'numeric'
  if (dateCount / total >= threshold) return 'date'
  return 'categorical'
}

// ── Count unique values in a column ──────────
function uniqueCount(column, data) {
  const vals = new Set(data.slice(0, 200).map(r => String(r[column] ?? '')))
  return vals.size
}

// ── Main detector function ───────────────────
// Returns: { chartType, xColumn, yColumns, recommendation, allChartTypes }
export function detectChart(columns, data) {
  if (!columns?.length || !data?.length) {
    return { chartType: 'none', xColumn: null, yColumns: [], recommendation: 'No data to chart.' }
  }

  // Classify all columns
  const colTypes = {}
  for (const col of columns) {
    colTypes[col] = detectColumnType(col, data)
  }

  const numericCols     = columns.filter(c => colTypes[c] === 'numeric')
  const categoricalCols = columns.filter(c => colTypes[c] === 'categorical')
  const dateCols        = columns.filter(c => colTypes[c] === 'date')

  // Build result
  const result = {
    chartType: 'bar',
    xColumn: null,
    yColumns: [],
    recommendation: '',
    allChartTypes: [],       // all valid chart types user can switch to
    columnTypes: colTypes,   // expose for UI
    colors: CHART_COLORS,
  }

  // ─── CASE 1: Date column + numeric → LINE CHART (time-series) ───
  if (dateCols.length >= 1 && numericCols.length >= 1) {
    result.chartType = 'line'
    result.xColumn = dateCols[0]
    result.yColumns = numericCols.slice(0, 5) // max 5 lines
    result.recommendation = `Time-series detected: "${dateCols[0]}" vs ${numericCols.length} metric(s). Line chart recommended.`
    result.allChartTypes = ['line', 'bar', 'area']
    if (numericCols.length === 1 && data.length <= 12) result.allChartTypes.push('pie')
    return result
  }

  // ─── CASE 2: 1 categorical + numeric → BAR / PIE ───
  if (categoricalCols.length >= 1 && numericCols.length >= 1) {
    const xCol = categoricalCols[0]
    const uniques = uniqueCount(xCol, data)

    // Pick best categorical column (prefer one with 3-20 unique values)
    let bestCat = categoricalCols[0]
    for (const cat of categoricalCols) {
      const u = uniqueCount(cat, data)
      if (u >= 3 && u <= 20) { bestCat = cat; break }
    }

    result.xColumn = bestCat
    result.yColumns = numericCols.slice(0, 5)
    const bestUniques = uniqueCount(bestCat, data)

    if (bestUniques <= 8 && numericCols.length === 1 && data.length <= 15) {
      result.chartType = 'pie'
      result.recommendation = `${bestUniques} categories detected in "${bestCat}" with 1 metric. Pie chart recommended.`
      result.allChartTypes = ['pie', 'bar', 'horizontal_bar']
    } else {
      result.chartType = numericCols.length > 1 ? 'grouped_bar' : 'bar'
      result.recommendation = `${bestUniques} categories in "${bestCat}" × ${numericCols.length} metric(s). Bar chart recommended.`
      result.allChartTypes = ['bar', 'horizontal_bar', 'line', 'area']
      if (bestUniques <= 10 && numericCols.length === 1) result.allChartTypes.push('pie')
    }
    return result
  }

  // ─── CASE 3: Only numeric columns (no category) ───
  if (numericCols.length >= 2 && categoricalCols.length === 0) {
    // Use first numeric as X, rest as Y → scatter or line
    result.chartType = 'scatter'
    result.xColumn = numericCols[0]
    result.yColumns = numericCols.slice(1, 4)
    result.recommendation = `${numericCols.length} numeric columns, no categories. Scatter plot recommended.`
    result.allChartTypes = ['scatter', 'line', 'bar']
    return result
  }

  // ─── CASE 4: Single numeric column → bar with row index ───
  if (numericCols.length === 1 && categoricalCols.length === 0) {
    result.chartType = 'bar'
    result.xColumn = '__row_index__'
    result.yColumns = numericCols
    result.recommendation = `Single numeric column "${numericCols[0]}". Bar chart with row index.`
    result.allChartTypes = ['bar', 'line', 'area']
    return result
  }

  // ─── CASE 5: No numeric columns at all ───
  if (numericCols.length === 0) {
    result.chartType = 'none'
    result.recommendation = 'No numeric columns found — chart not applicable for text-only results.'
    return result
  }

  // ─── FALLBACK ───
  result.xColumn = columns[0]
  result.yColumns = numericCols.slice(0, 3)
  result.recommendation = `Showing "${columns[0]}" vs ${numericCols.length} metric(s). Adjust axes as needed.`
  result.allChartTypes = ['bar', 'line', 'pie', 'area']
  return result
}

// ── Prepare data for Recharts ────────────────
// Recharts expects [{name: 'x', val1: 10, val2: 20}, ...]
export function prepareChartData(data, xColumn, yColumns, maxRows = 50) {
  const sliced = data.slice(0, maxRows)

  return sliced.map((row, i) => {
    const point = {}

    // X value
    if (xColumn === '__row_index__') {
      point.name = `Row ${i + 1}`
    } else {
      point.name = row[xColumn] != null ? String(row[xColumn]) : `Row ${i + 1}`
    }

    // Truncate long labels
    if (point.name.length > 24) point.name = point.name.slice(0, 22) + '…'

    // Y values
    for (const yCol of yColumns) {
      const raw = row[yCol]
      point[yCol] = raw != null ? Number(raw) || 0 : 0
    }

    return point
  })
}

// ── Format column name for display ───────────
export function formatLabel(col) {
  return col
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/^Mrkt /i, '')
    .replace(/^Engg /i, '')
}

export { CHART_COLORS }
