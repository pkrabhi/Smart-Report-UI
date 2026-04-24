# KMC Smart Query UI v3 — Upgrade Changelog

## 🚀 What Changed (v2 → v3)

### Installation
```bash
cd smart-query-ui-v2
npm install    # installs 4 new deps: lucide-react, react-syntax-highlighter, recharts, html2canvas
npm run dev
```

### New Dependencies Added
| Package | Version | Purpose |
|---------|---------|---------|
| `lucide-react` | ^0.383.0 | SVG icon system (replaces all emojis) |
| `react-syntax-highlighter` | ^15.5.0 | Prism.js SQL highlighting (XSS-safe) |
| `recharts` | ^2.12.7 | Auto-charts (bar, line, pie, area, scatter) |
| `html2canvas` | ^1.4.1 | Chart PNG export |

---

## ✅ 7 Features Implemented

### Feature 1: Lucide Icons + Prism.js SQL Highlighting
- **All 50+ emoji icons → SVG Lucide icons** across all 12 components
- Centralized icon system: `src/utils/icons.jsx` — one import, all icons
- `ModuleIcon`, `StatusDot`, `Spinner` reusable components
- **SQL Viewer rewritten** — `dangerouslySetInnerHTML` regex → Prism.js tokenizer
- XSS-safe, proper syntax coloring, line numbers

### Feature 2: Smart Auto-Charts + PNG Export
- **New files:** `src/utils/chartDetector.js`, `src/components/ChartPanel.jsx`
- Smart column analysis: detects numeric/date/categorical columns
- Auto-picks best chart type: Bar, Line, Pie, Area, Scatter, Horizontal Bar, Grouped Bar
- **Chart toolbar:** type switcher, X/Y axis selectors, multi-metric toggles, row limit
- **PNG export** via html2canvas — branded with KMC watermark
- Expand/collapse + reset to auto-detected settings
- New "Chart" tab in ResultsPanel (between Results and SQL tabs)

### Feature 3: AI Natural Language Summary
- **New files:** `src/components/InsightCard.jsx`
- Auto-triggers after successful query (non-blocking)
- Calls `/api/smart-query/explain` endpoint (Node backend needed)
- Shows skeleton loader while generating
- Supports bold markdown, bullet points
- Dismiss, collapse, retry buttons
- **New API function:** `explainResults()` in `api.js`

### Feature 4: Voice-to-Query
- **New files:** `src/hooks/useVoiceInput.js`
- Mic button in QueryInput (top-right of textarea)
- Web Speech API (Chrome/Edge) with real-time interim preview
- Language: `en-IN` (configurable)
- Red pulsing border + interim text shown while speaking
- Graceful fallback: mic hidden if browser doesn't support Speech API

### Feature 5: Query Autocomplete + Favorites
- **New files:** `src/components/AutocompleteDropdown.jsx`, `src/utils/favorites.js`
- Fuzzy search as-you-type against: ★ Favorites → 🕐 History → 💡 Suggestions
- Keyboard navigation: ↑↓ arrows + Enter to select + Esc to close
- Highlighted matching text in dropdown
- **Star button** on ResultsPanel header to bookmark queries
- Favorites stored in localStorage (max 50)
- Favorites passed to autocomplete for priority matching

### Feature 6: Follow-Up Queries (Conversational)
- **New files:** `src/components/FollowUpInput.jsx`
- "Ask a follow-up question…" button appears below results
- Shows context indicator: "FOLLOW-UP TO: previous question"
- Sends `previousQuestion` + `previousSql` to Node backend
- Enter to send, Esc to close
- Node backend will use context for smarter SQL generation

### Feature 7: SSE Streaming (Real-Time Pipeline)
- **New files:** `src/hooks/useStreamingQuery.js`, `src/components/StreamingSqlPreview.jsx`
- Connects to `/api/smart-query/ask-stream` via fetch + ReadableStream
- Real-time pipeline step updates
- **Token-by-token SQL preview** with blinking cursor during step 2
- "STREAMING LIVE" indicator with sparkle animation
- **Auto-fallback:** if `/ask-stream` returns 404, falls back to regular `/ask`
- `useSmartQuery.js` kept as backup — `useStreamingQuery.js` is the active hook

---

## 📁 File Map (27 files, 10 new)

### New Files (10)
| File | Feature |
|------|---------|
| `src/utils/icons.jsx` | Centralized Lucide icon system |
| `src/utils/chartDetector.js` | Smart chart type detection algorithm |
| `src/utils/favorites.js` | Favorites localStorage manager |
| `src/components/ChartPanel.jsx` | Recharts visualization + PNG export |
| `src/components/InsightCard.jsx` | AI natural language summary display |
| `src/components/AutocompleteDropdown.jsx` | Fuzzy search query autocomplete |
| `src/components/FollowUpInput.jsx` | Conversational follow-up queries |
| `src/components/StreamingSqlPreview.jsx` | Token-by-token SQL streaming display |
| `src/hooks/useVoiceInput.js` | Web Speech API voice input hook |
| `src/hooks/useStreamingQuery.js` | SSE streaming query hook with fallback |

### Modified Files (17 — all original files)
| File | Changes |
|------|---------|
| `package.json` | +4 dependencies |
| `src/config/modules.js` | All emoji → Lucide icon keys |
| `src/App.jsx` | Wired all 7 features, streaming hook, favorites |
| `src/utils/api.js` | Added `explainResults()`, follow-up context fields |
| `src/hooks/useSmartQuery.js` | Added insight auto-trigger, follow-up support |
| `src/components/Header.jsx` | Lucide icons |
| `src/components/NavTabs.jsx` | Lucide icons |
| `src/components/QueryInput.jsx` | Voice mic, autocomplete, Lucide icons |
| `src/components/PipelineTracker.jsx` | Streaming SQL preview, Lucide icons |
| `src/components/ResultsPanel.jsx` | Chart tab, Prism.js SQL, star button, Lucide |
| `src/components/HistoryTab.jsx` | Lucide icons |
| `src/components/ServiceStatusTab.jsx` | Lucide icons |
| `src/components/SettingsModal.jsx` | Lucide icons |
| `src/components/ErrorCard.jsx` | Lucide icons |
| `src/components/StatusBar.jsx` | Lucide icons |
| `src/components/WorkflowSummary.jsx` | Lucide icons |

---

## 🔧 Node.js Backend Endpoints Needed
These UI features require corresponding Node.js backend endpoints:

| Endpoint | Feature | Status |
|----------|---------|--------|
| `POST /ask` | Core query (existing) | ✅ Already built |
| `POST /export-csv` | CSV export (existing) | ✅ Already built |
| `GET /status` | Service status (existing) | ✅ Already built |
| `POST /explain` | AI Summary | 🔜 Needs building |
| `POST /ask-stream` | SSE Streaming | 🔜 Needs building |
| `POST /ask` + `previousSql` | Follow-Up Context | 🔜 Needs update |
| Query cache layer | Caching | 🔜 Needs building |
