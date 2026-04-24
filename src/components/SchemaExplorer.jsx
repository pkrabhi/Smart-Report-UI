import { useState, useMemo } from 'react'
import { RefreshCw, Search, Database, Table2, Key, Link, AlertTriangle, CheckCircle, Clock, Hash, ChevronDown, ChevronRight } from 'lucide-react'
import { useSchemaDiscovery } from '../hooks/useSchemaDiscovery.js'

// ─────────────────────────────────────────────
//  Color palette (matches existing KMC theme)
// ─────────────────────────────────────────────
const C = {
  indigo:      '#3949AB',
  indigoDark:  '#1A237E',
  indigoLight: '#E8EAF6',
  green:       '#2E7D32',
  greenLight:  '#E8F5E9',
  amber:       '#F57C00',
  amberLight:  '#FFF3E0',
  red:         '#C62828',
  redLight:    '#FFEBEE',
  grey:        '#757575',
  greyLight:   '#F5F5F5',
  border:      '#E0E0E0',
  text:        '#212121',
  textMuted:   '#9E9E9E',
}

// Type badge colors
const TYPE_COLORS = {
  varchar: { bg: '#E3F2FD', fg: '#1565C0' },
  char:    { bg: '#E3F2FD', fg: '#1565C0' },
  text:    { bg: '#E3F2FD', fg: '#1565C0' },
  int:     { bg: '#F3E5F5', fg: '#6A1B9A' },
  bigint:  { bg: '#F3E5F5', fg: '#6A1B9A' },
  smallint:{ bg: '#F3E5F5', fg: '#6A1B9A' },
  numeric: { bg: '#FCE4EC', fg: '#880E4F' },
  float:   { bg: '#FCE4EC', fg: '#880E4F' },
  bool:    { bg: '#F1F8E9', fg: '#33691E' },
  date:    { bg: '#E8F5E9', fg: '#1B5E20' },
  timestamp: { bg: '#E8F5E9', fg: '#1B5E20' },
  timestamptz: { bg: '#E8F5E9', fg: '#1B5E20' },
  json:    { bg: '#FFF8E1', fg: '#E65100' },
  jsonb:   { bg: '#FFF8E1', fg: '#E65100' },
  uuid:    { bg: '#FAFAFA', fg: '#424242' },
}

function typeColor(type) {
  return TYPE_COLORS[type] || { bg: '#FAFAFA', fg: '#424242' }
}

// ─────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────

function TypeBadge({ type }) {
  const { bg, fg } = typeColor(type)
  return (
    <span style={{
      background: bg, color: fg,
      borderRadius: 4, padding: '1px 6px',
      fontSize: 10, fontWeight: 700, fontFamily: 'monospace',
      whiteSpace: 'nowrap',
    }}>{type}</span>
  )
}

function ColumnRow({ name, info }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 8,
      padding: '5px 0', borderBottom: `1px solid ${C.border}`,
      flexWrap: 'wrap',
    }}>
      {/* PK / FK indicators */}
      <div style={{ display: 'flex', gap: 3, flexShrink: 0, paddingTop: 2 }}>
        {info.pk && (
          <span title="Primary Key" style={{ color: C.amber, fontSize: 12 }}>
            <Key size={12} />
          </span>
        )}
        {info.fk && (
          <span title={`FK → ${info.fk}`} style={{ color: C.indigo, fontSize: 12 }}>
            <Link size={12} />
          </span>
        )}
        {!info.pk && !info.fk && <span style={{ width: 12 }} />}
      </div>

      {/* Column name */}
      <span style={{
        fontFamily: 'monospace', fontSize: 12, fontWeight: info.pk ? 700 : 500,
        color: info.pk ? C.amber : C.text, minWidth: 140, flexShrink: 0,
      }}>{name}</span>

      {/* Type badge */}
      <TypeBadge type={info.type || 'unknown'} />

      {/* FK target */}
      {info.fk && (
        <span style={{ fontSize: 10, color: C.indigo, fontFamily: 'monospace' }}>
          → {info.fk}
        </span>
      )}

      {/* Null rate */}
      {info.nullRate && (
        <span style={{ fontSize: 10, color: C.amber, background: C.amberLight, borderRadius: 3, padding: '0 4px' }}>
          {info.nullRate} null
        </span>
      )}

      {/* Low-cardinality values */}
      {info.values && info.values.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 2, width: '100%', paddingLeft: 23 }}>
          {info.values.slice(0, 12).map(v => (
            <span key={v} style={{
              background: C.indigoLight, color: C.indigoDark,
              borderRadius: 3, padding: '0 5px', fontSize: 10, fontFamily: 'monospace',
            }}>{String(v)}</span>
          ))}
          {info.values.length > 12 && (
            <span style={{ fontSize: 10, color: C.textMuted }}>+{info.values.length - 12} more</span>
          )}
        </div>
      )}
    </div>
  )
}

function TableCard({ alias, tableInfo, searchQuery }) {
  const [expanded, setExpanded] = useState(true)

  const cols     = tableInfo.key_columns || {}
  const colNames = Object.keys(cols)
  const pkCols   = colNames.filter(c => cols[c]?.pk)
  const fkCols   = colNames.filter(c => cols[c]?.fk)

  // Apply column search filter
  const visibleCols = searchQuery
    ? colNames.filter(c =>
        c.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(cols[c]?.type || '').includes(searchQuery.toLowerCase())
      )
    : colNames

  if (searchQuery && visibleCols.length === 0 &&
      !alias.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(tableInfo.real_name || '').toLowerCase().includes(searchQuery.toLowerCase())) {
    return null
  }

  return (
    <div style={{
      background: '#fff', border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* Table header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', cursor: 'pointer',
          background: C.indigoLight, borderBottom: expanded ? `1px solid ${C.border}` : 'none',
        }}
      >
        <Table2 size={15} color={C.indigo} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: C.indigoDark }}>{alias}</span>
            <span style={{ fontSize: 10, color: C.textMuted, fontFamily: 'monospace' }}>
              {tableInfo.real_name}
            </span>
          </div>
          {tableInfo.description && (
            <div style={{ fontSize: 11, color: C.grey, marginTop: 1 }}>{tableInfo.description}</div>
          )}
        </div>

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Pill label={`${colNames.length} cols`}   bg="#E3F2FD" fg="#1565C0" />
          {pkCols.length > 0 && <Pill label={`${pkCols.length} PK`} bg={C.amberLight} fg={C.amber} />}
          {fkCols.length > 0 && <Pill label={`${fkCols.length} FK`} bg={C.indigoLight} fg={C.indigo} />}
          {tableInfo.row_count > 0 && (
            <Pill label={tableInfo.row_count.toLocaleString() + ' rows'} bg={C.greenLight} fg={C.green} />
          )}
        </div>

        {expanded
          ? <ChevronDown size={14} color={C.grey} />
          : <ChevronRight size={14} color={C.grey} />}
      </div>

      {/* Column list */}
      {expanded && (
        <div style={{ padding: '4px 14px 8px' }}>
          {(searchQuery ? visibleCols : colNames).map(col => (
            <ColumnRow key={col} name={col} info={cols[col]} />
          ))}
          {searchQuery && visibleCols.length === 0 && (
            <div style={{ color: C.textMuted, fontSize: 12, padding: '8px 0' }}>
              No columns match "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Pill({ label, bg, fg }) {
  return (
    <span style={{
      background: bg, color: fg,
      borderRadius: 99, padding: '1px 8px', fontSize: 10, fontWeight: 700,
    }}>{label}</span>
  )
}

// ─────────────────────────────────────────────
//  Diff Banner
// ─────────────────────────────────────────────
function DiffBanner({ diff }) {
  if (!diff?.changed) return null

  const total =
    (diff.addedTables?.length   || 0) +
    (diff.removedTables?.length || 0) +
    (diff.modifiedTables?.length|| 0)

  return (
    <div style={{
      background: C.amberLight, border: `1px solid ${C.amber}`,
      borderRadius: 8, padding: '10px 14px', marginBottom: 16,
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      <AlertTriangle size={16} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ fontSize: 12, color: '#5D4037' }}>
        <strong>Schema changed since last discovery</strong> — {total} structural change(s) detected.
        {diff.addedTables?.length > 0 && (
          <div>+ Added tables: {diff.addedTables.join(', ')}</div>
        )}
        {diff.removedTables?.length > 0 && (
          <div>− Removed tables: {diff.removedTables.join(', ')}</div>
        )}
        {diff.modifiedTables?.map(mt => (
          <div key={mt.table}>
            ≈ {mt.table}:
            {mt.addedColumns?.length > 0   && ` +[${mt.addedColumns.join(', ')}]`}
            {mt.removedColumns?.length > 0 && ` -[${mt.removedColumns.join(', ')}]`}
            {mt.typeChanges?.map(tc => ` ${tc.column}(${tc.from}→${tc.to})`)}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  Main SchemaExplorer
// ─────────────────────────────────────────────
export default function SchemaExplorer({ module, apiBase }) {
  const [search, setSearch] = useState('')

  const { schema, status, diff, loading, refreshing, error, lastFetched, refresh } =
    useSchemaDiscovery({ apiBase, moduleCode: module })

  // Stats
  const tables     = schema?.schema?.tables || {}
  const tableNames = Object.keys(tables)
  const totalCols  = tableNames.reduce((sum, t) => sum + Object.keys(tables[t]?.key_columns || {}).length, 0)
  const totalRows  = tableNames.reduce((sum, t) => sum + (tables[t]?.row_count || 0), 0)
  const fkCount    = tableNames.reduce((sum, t) =>
    sum + Object.values(tables[t]?.key_columns || {}).filter(c => c.fk).length, 0)

  // Filter tables by search
  const filteredTables = useMemo(() => {
    if (!search) return tableNames
    const q = search.toLowerCase()
    return tableNames.filter(alias =>
      alias.toLowerCase().includes(q) ||
      (tables[alias]?.real_name || '').toLowerCase().includes(q) ||
      Object.keys(tables[alias]?.key_columns || {}).some(c => c.toLowerCase().includes(q))
    )
  }, [tableNames, tables, search])

  const moduleStatus = status?.[module.toUpperCase()]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Database size={20} color={C.indigo} />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.indigoDark }}>
              Schema Explorer
            </h2>
            {schema?.schemaChanged && (
              <Pill label="Changed" bg={C.amberLight} fg={C.amber} />
            )}
            {schema && !schema.schemaChanged && (
              <Pill label="Up to date" bg={C.greenLight} fg={C.green} />
            )}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>
            Zero-shot auto-discovery from live PostgreSQL
            {schema?.schema?.schema_name && (
              <span style={{ fontFamily: 'monospace', marginLeft: 6 }}>
                ({schema.schema.schema_name})
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={refresh}
            disabled={refreshing || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', border: `1px solid ${C.indigo}`,
              borderRadius: 8, cursor: refreshing ? 'not-allowed' : 'pointer',
              background: refreshing ? C.greyLight : C.indigo,
              color: refreshing ? C.grey : '#fff',
              fontSize: 13, fontWeight: 600, transition: 'all 0.18s',
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'icon-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh Schema'}
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      {schema && (
        <div style={{
          display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16,
        }}>
          <StatCard icon={<Table2 size={14} />} label="Tables"  value={tableNames.length} color={C.indigo} />
          <StatCard icon={<Hash    size={14} />} label="Columns" value={totalCols}         color="#6A1B9A" />
          <StatCard icon={<Link    size={14} />} label="FK Links" value={fkCount}          color="#1565C0" />
          <StatCard icon={<Database size={14} />} label="Total Rows" value={totalRows.toLocaleString()} color={C.green} />
          {moduleStatus && (
            <StatCard
              icon={<Clock size={14} />}
              label="Cache TTL"
              value={`${moduleStatus.ttlRemainingSeconds}s`}
              color={C.amber}
            />
          )}
        </div>
      )}

      {/* ── Cache info line ── */}
      {moduleStatus && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
          fontSize: 11, color: C.textMuted,
        }}>
          <CheckCircle size={12} color={C.green} />
          Discovered {moduleStatus.ageSeconds}s ago
          · Hash: <code style={{ fontFamily: 'monospace' }}>{moduleStatus.hash?.slice(0, 8)}</code>
          · Discovery took {moduleStatus.lastDiscoveryMs}ms
          {lastFetched && ` · UI fetched ${Math.round((Date.now() - lastFetched) / 1000)}s ago`}
        </div>
      )}

      {/* ── Diff banner ── */}
      <DiffBanner diff={diff} />

      {/* ── Loading / Error ── */}
      {loading && (
        <div style={{
          background: C.indigoLight, borderRadius: 10, padding: 32,
          textAlign: 'center', color: C.indigo, fontSize: 14,
        }}>
          <RefreshCw size={20} className="icon-spin" style={{ marginBottom: 8 }} />
          <div>Discovering schema from live database…</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
            Querying information_schema + pg_catalog
          </div>
        </div>
      )}

      {error && !loading && (
        <div style={{
          background: C.redLight, border: `1px solid ${C.red}`,
          borderRadius: 10, padding: 16, marginBottom: 16,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <AlertTriangle size={16} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 700, color: C.red, fontSize: 13 }}>Schema discovery failed</div>
            <div style={{ fontSize: 12, color: '#5D4037', marginTop: 2 }}>{error}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
              Check DB connectivity. Static schema files are still active.
            </div>
          </div>
        </div>
      )}

      {/* ── Search bar ── */}
      {!loading && schema && tableNames.length > 0 && (
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search
            size={14}
            color={C.textMuted}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tables, columns, types…"
            style={{
              width: '100%', padding: '9px 12px 9px 34px',
              border: `1px solid ${C.border}`, borderRadius: 8,
              fontSize: 13, outline: 'none', boxSizing: 'border-box',
              fontFamily: "'Nunito', sans-serif",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: C.textMuted, fontSize: 16, lineHeight: 1,
              }}
            >×</button>
          )}
        </div>
      )}

      {/* ── Result count when searching ── */}
      {search && !loading && (
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>
          {filteredTables.length} of {tableNames.length} tables match "{search}"
        </div>
      )}

      {/* ── Table cards ── */}
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredTables.map(alias => (
            <TableCard
              key={alias}
              alias={alias}
              tableInfo={tables[alias]}
              searchQuery={search}
            />
          ))}
          {filteredTables.length === 0 && tableNames.length > 0 && (
            <div style={{
              background: '#fff', border: `1px solid ${C.border}`,
              borderRadius: 10, padding: 32, textAlign: 'center', color: C.textMuted, fontSize: 14,
            }}>
              No tables match "{search}"
            </div>
          )}
          {tableNames.length === 0 && !loading && !error && (
            <div style={{
              background: '#fff', border: `1px solid ${C.border}`,
              borderRadius: 10, padding: 32, textAlign: 'center',
            }}>
              <Database size={32} color={C.textMuted} style={{ marginBottom: 10 }} />
              <div style={{ color: C.textMuted, fontSize: 14 }}>
                No schema discovered yet.{' '}
                <button
                  onClick={refresh}
                  style={{ background: 'none', border: 'none', color: C.indigo, cursor: 'pointer', fontWeight: 700 }}
                >
                  Click to discover
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Business rules section ── */}
      {!loading && schema?.schema?.important_rules?.length > 0 && (
        <div style={{
          marginTop: 24, background: '#fff',
          border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 14px', background: C.greyLight,
            borderBottom: `1px solid ${C.border}`,
            fontWeight: 700, fontSize: 13, color: C.text,
          }}>
            Auto-discovered Business Rules &amp; Constraints
            <span style={{ fontWeight: 400, color: C.textMuted, marginLeft: 8 }}>
              ({schema.schema.important_rules.length})
            </span>
          </div>
          <div style={{ padding: '10px 14px', maxHeight: 280, overflowY: 'auto' }}>
            {schema.schema.important_rules.map((rule, i) => (
              <div key={i} style={{
                fontSize: 11, fontFamily: 'monospace', color: C.grey,
                padding: '3px 0', borderBottom: `1px solid ${C.border}`,
              }}>
                {rule}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
//  Stat card
// ─────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${C.border}`,
      borderRadius: 8, padding: '8px 14px',
      display: 'flex', alignItems: 'center', gap: 8, minWidth: 110,
    }}>
      <span style={{ color }}>{icon}</span>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  )
}
