# Smart Query — Frontend UI

> Liquid glass React interface for KMC's AI-powered ERP query engine

![React](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5.x-purple) ![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-yellow)

---

## Overview

Smart Query UI is the frontend for KMC's AI-powered ERP querying system. It provides a conversational interface where users type plain-English questions and instantly see SQL results, charts, and AI-generated insights — without needing to know SQL or navigate complex ERP screens.

The UI features a **liquid glass** design system with full dark/light theme support, real-time pipeline tracking, and a suite of power-user tools including voice input, keyboard shortcuts, schema explorer, and PDF export.

---

## Features

| Feature | Description |
|---|---|
| Natural Language Input | Ask questions in plain English with autocomplete |
| Voice Input | Speak your query using the browser microphone |
| Real-time Pipeline Tracker | Live step-by-step view of NL → SQL → Results |
| Streaming SQL Preview | Watch the SQL being generated token by token |
| Chart Panel | Auto-renders bar, line, pie, scatter, and area charts |
| Insight Cards | AI-generated summary and key takeaways per query |
| Follow-up Queries | Continue the conversation with context-aware follow-ups |
| Schema Explorer | Browse all tables and columns for the active module |
| Query History | View, re-run, and favourite past queries |
| Feedback Modal | Rate each result to improve the AI over time |
| PDF Export | Download a formatted report with KMC letterhead |
| Keyboard Shortcuts | Full keyboard navigation for power users |
| Module Wheel | Switch between Market and Engineering ERP modules |
| Tweaks Panel | 6 persistent UI controls (density, animations, font size, etc.) |
| Service Status | Live health dashboard for all backend services |
| RBAC Login | Role-based access — analyst, manager, admin views |
| Liquid Glass Design | Glassmorphism UI with smooth animations |
| Dark / Light Theme | Fully themed, persisted per user preference |
| Responsive Layout | Works on desktop and large tablets |

---

## Tech Stack

- **Framework:** React 18
- **Build tool:** Vite 5
- **Charts:** Recharts
- **Styling:** Custom CSS (liquid glass design system, no CSS framework dependency)
- **State:** React hooks + localStorage persistence
- **API:** Fetch + EventSource (SSE for streaming)

---

## Project Structure

```
src/
├── App.jsx                         # Root app, routing, theme provider
├── config/
│   └── theme.js                    # Design tokens — colors, glass, spacing
├── utils/
│   └── api.js                      # All backend API calls
└── components/
    ├── LoginScreen.jsx             # RBAC login page
    ├── Header.jsx                  # Top bar with module selector and user info
    ├── NavTabs.jsx                 # Tab navigation (Query / History / Status)
    ├── ModuleWheel.jsx             # Market ↔ Engineering module switcher
    ├── QueryInput.jsx              # NL query input with voice + autocomplete
    ├── AutocompleteDropdown.jsx    # Suggestion dropdown for query input
    ├── PipelineTracker.jsx         # Real-time step tracker (NL→SQL→Execute→Chart)
    ├── StreamingSqlPreview.jsx     # Live SQL token stream display
    ├── ResultsPanel.jsx            # Table + pagination for query results
    ├── ChartPanel.jsx              # Auto chart renderer (bar/line/pie/scatter)
    ├── InsightCard.jsx             # AI insight summary card
    ├── FollowUpInput.jsx           # Follow-up query input
    ├── WorkflowSummary.jsx         # End-of-query summary stats
    ├── RagStatsBadge.jsx           # RAG pipeline stats (tokens, latency)
    ├── SchemaExplorer.jsx          # Browsable schema tree
    ├── HistoryTab.jsx              # Query history list with re-run + favourite
    ├── ServiceStatusTab.jsx        # Backend service health grid
    ├── FeedbackModal.jsx           # Thumbs up/down + comment form
    ├── SettingsModal.jsx           # User preferences modal
    ├── TweaksPanel.jsx             # 6 persistent UI tweak controls
    ├── KeyboardShortcutsModal.jsx  # Keyboard shortcut reference
    ├── StatusBar.jsx               # Bottom status bar
    ├── Toast.jsx                   # Notification toasts
    └── ErrorCard.jsx               # Error display component
```

---

## Prerequisites

- Node.js 18+
- Smart Query Backend running (see [smart-query-node](https://github.com/pkrabhi/smart-query-node))

---

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Set VITE_API_BASE to your backend URL, e.g. http://localhost:3001

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
npm run preview
```

Vite dev server runs on **http://localhost:5173** by default.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE` | Backend API base URL (e.g. `http://localhost:3001`) |

---

## Design System

The UI uses a custom **liquid glass** design system defined in [`src/config/theme.js`](src/config/theme.js):

- **Glass layers:** backdrop-filter blur with layered transparency
- **Tokens:** colors, spacing, border-radius, shadow, animation duration
- **Themes:** `dark` (default) and `light` — toggled at runtime, persisted to localStorage
- **Typography:** Inter / system font stack, fluid sizing
- **Animations:** Subtle entrance transitions, shimmer loaders, pipeline step pulses

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Enter` | Submit query |
| `Ctrl + K` | Focus query input |
| `Ctrl + H` | Open history |
| `Ctrl + E` | Open schema explorer |
| `Ctrl + /` | Show keyboard shortcuts |
| `Escape` | Close modals |

---

## Related

- **Backend:** [pkrabhi/smart-query-node](https://github.com/pkrabhi/smart-query-node)

---

## License

Internal — KMC Engineering Team. Not for public distribution.
