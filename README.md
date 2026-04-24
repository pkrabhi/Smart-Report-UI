# KMC Smart Query UI — v2.0

> AI-Powered Natural Language to SQL — React Frontend for Market & Engineering Modules

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (runs on port 3000)
npm run dev

# 3. Open browser
http://localhost:3000
```

> ⚠️ Make sure your Node.js backend is running on **port 8101** before starting the UI.
> The Vite proxy automatically forwards `/api/*` → `http://localhost:8101/smart-query-service/api/*`

---

## 📁 Project Structure

```
smart-query-ui-v2/
├── index.html                    ← Entry HTML (loads Google Fonts + root div)
├── vite.config.js                ← Vite config + proxy setup
├── package.json
├── .env.example                  ← Environment variable template
│
└── src/
    ├── main.jsx                  ← ReactDOM.createRoot
    ├── App.jsx                   ← Root component — wires all state together
    │
    ├── config/
    │   └── modules.js            ← ALL module config: filters, suggestions, colors, stats
    │
    ├── utils/
    │   └── api.js                ← All fetch calls + localStorage helpers
    │
    ├── hooks/
    │   ├── useSmartQuery.js      ← Core query hook (submit → pipeline → result)
    │   └── useServiceStatus.js   ← Polls /status every 30s
    │
    └── components/
        ├── Header.jsx            ← Top nav: logo, module toggle, status, history, settings
        ├── ModuleInfoBar.jsx     ← Schema strip: active module, schema name, stats
        ├── QueryInput.jsx        ← Textarea, suggestions, filters panel, submit button
        ├── PipelineTracker.jsx   ← Animated 4-step processing pipeline
        ├── ResultsPanel.jsx      ← Table (sortable), SQL viewer, Info tab
        ├── HistorySidebar.jsx    ← Last 30 queries, click to replay
        ├── SettingsModal.jsx     ← API URL, User ID, max rows, service status
        ├── ErrorCard.jsx         ← Error display with contextual tips
        └── StatusBar.jsx         ← Fixed bottom bar: service health + active module
```

---

## 🔌 API Integration

All API calls are in `src/utils/api.js`. The endpoints map to your Node.js service:

| Function | Method | Endpoint | Purpose |
|---|---|---|---|
| `askQuery()` | POST | `/api/smart-query/ask` | Submit NL question → get SQL + results |
| `fetchStatus()` | GET | `/api/smart-query/status` | Check NVIDIA/Ollama availability |
| `fetchHealth()` | GET | `/actuator/health` | Service health check |
| `exportCsv()` | POST | `/api/smart-query/export-csv` | Download results as CSV |

### Request Payload (`askQuery`)

```json
{
  "question":    "show all active tenders",
  "moduleCode":  "ENGINEERING",
  "userId":      "erp_user",

  // Engineering optional filters:
  "fileNo":         "FILE-2025-001",
  "tenderNo":       "TND-001",
  "poNumber":       "PO-001",
  "deptCode":       "CIVIL",
  "borough":        "NORTH",
  "wardNo":         "5",

  // Market optional filters:
  "marketCode":     "101",
  "phaseCode":      "01",
  "blockCode":      "A",
  "stallId":        "1010105",
  "finYear":        "2526"
}
```

### Response Shape

```json
{
  "success":         true,
  "queryId":         "ENGG-20260401-00003",
  "moduleCode":      "ENGINEERING",
  "generatedSql":    "SELECT tender_no, ... FROM public.engg_est_tender_master WHERE c_status = 1 LIMIT 5000",
  "columns":         ["tender_no", "tender_type", "status_description"],
  "data":            [{ "tender_no": "TND-001", ... }],
  "rowCount":        248,
  "source":          "NVIDIA NIM",
  "executionTimeMs": 27950
}
```

---

## 🎛️ Supported Modules

### 🏪 Market Module
- **moduleCode:** `MARKET`
- **Schema:** `mrkt_kmc2_data`
- **Tables:** 30 | **Examples:** 42 | **Rules:** 33
- **Query ID prefix:** `MKT-YYYYMMDD-NNNNN`
- **Filters:** marketCode, phaseCode, blockCode, stallId, wardNo, finYear

### 🏗️ Engineering Module
- **moduleCode:** `ENGINEERING`
- **Schema:** `public`
- **Tables:** 34 | **Examples:** 44 | **Rules:** 34
- **Query ID prefix:** `ENGG-YYYYMMDD-NNNNN`
- **Filters:** fileNo, tenderNo, poNumber, deptCode, borough, wardNo

---

## ⚙️ Configuration

### Vite Proxy (default)
```js
// vite.config.js — proxies /api/* to your backend
proxy: {
  '/api': {
    target: 'http://localhost:8101',
    rewrite: (path) => path.replace(/^\/api/, '/smart-query-service/api'),
  }
}
```

### Environment Variables
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

```env
VITE_API_BASE=/api/smart-query
VITE_SERVICE_HOST=localhost
VITE_SERVICE_PORT=8101
```

### Change Backend Host
If your Node.js service is on a different server, update the proxy target in `vite.config.js`:
```js
target: 'http://192.168.0.132:8101',   // ← your server IP
```

Or change the API base URL in the Settings panel at runtime (⚙️ button in header).

---

## 🏗️ Building for Production

```bash
npm run build
```

Output goes to `dist/`. Deploy the `dist/` folder to your web server (Nginx, Apache, etc).

**Nginx config example:**
```nginx
server {
    listen 80;
    root /var/www/smart-query-ui/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to Node.js backend
    location /api/ {
        proxy_pass http://localhost:8101/smart-query-service/api/;
        proxy_set_header Host $host;
        proxy_read_timeout 120s;
    }

    location /actuator/ {
        proxy_pass http://localhost:8101/smart-query-service/actuator/;
    }
}
```

---

## 💡 Adding a New Module

1. Add entry to `src/config/modules.js`:
```js
HEALTH: {
  key: 'HEALTH',
  label: 'Health Module',
  schema: 'hlth_kmc4_data',
  queryIdPrefix: 'HLTH',
  emoji: '🏥',
  accentColor: '#7C3AED',
  // ... add filters and suggestions
}
```

2. Create context files in your Node.js backend:
```
src/resources/smartquery/health/
  ├── schema_context.json
  ├── alias_mapping.json
  └── few_shot_examples.json
```

3. Add `HEALTH` to `MODULE_PREFIX` in `orchestrator.js` — done! ✅

---

## 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| react | ^18.2 | UI framework |
| react-dom | ^18.2 | DOM rendering |
| lucide-react | ^0.263 | Icons (optional) |
| vite | ^4.4 | Build tool + dev server |
| @vitejs/plugin-react | ^4.0 | React HMR support |

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| `Connection error: Failed to fetch` | Start Node.js backend: `npm start` in `smart-query-node-v2/` |
| `HTTP 404` on API calls | Check proxy config in `vite.config.js` |
| AI not responding | Check NVIDIA API key in backend `.env` |
| CORS errors | Use Vite proxy (default) instead of direct URL |
| Blank page after build | Set `base` in `vite.config.js` if deployed in a subdirectory |

---

*KMC Engineering Team · 2026*
