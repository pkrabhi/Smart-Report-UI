import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { MODULE_CONFIG } from './config/modules.js'
// theme imports consolidated below
import Header           from './components/Header.jsx'
import NavTabs          from './components/NavTabs.jsx'
import QueryInput       from './components/QueryInput.jsx'
import PipelineTracker  from './components/PipelineTracker.jsx'
import ResultsPanel     from './components/ResultsPanel.jsx'
import HistoryTab       from './components/HistoryTab.jsx'
import ServiceStatusTab from './components/ServiceStatusTab.jsx'
import SchemaExplorer   from './components/SchemaExplorer.jsx'
import SettingsModal    from './components/SettingsModal.jsx'
import ErrorCard        from './components/ErrorCard.jsx'
import InsightCard      from './components/InsightCard.jsx'
import FollowUpInput    from './components/FollowUpInput.jsx'
import StatusBar        from './components/StatusBar.jsx'
import Toast                  from './components/Toast.jsx'
import FeedbackModal          from './components/FeedbackModal.jsx'
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal.jsx'
import { useStreamingQuery }    from './hooks/useStreamingQuery.js'
import { useServiceStatus }     from './hooks/useServiceStatus.js'
import { useSessionStats }      from './hooks/useSessionStats.js'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js'
import { loadHistory, saveHistory, loadSettings, saveSettings, exportPdf, submitFeedback, fetchExamples } from './utils/api.js'
import { loadFavorites, addFavorite, removeFavorite, isFavorited } from './utils/favorites.js'
import { DARK, LIGHT, MODULE_HUES, loadTweaks, saveTweaks, perspectiveGridBg } from './config/theme.js'
import TweaksPanel   from './components/TweaksPanel.jsx'
import LoginScreen   from './components/LoginScreen.jsx'
import { useAuth }   from './hooks/useAuth.js'

export default function App() {
  // ── Auth ──
  const { session, login, logout, isAdmin } = useAuth()

  // ── Theme ──
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem('sq_theme') || 'dark')
  const isDark   = themeKey === 'dark'
  const T        = isDark ? DARK : LIGHT
  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark'
    setThemeKey(next)
    localStorage.setItem('sq_theme', next)
  }

  // ── Tweaks (live design controls) ──
  const [tweaks, setTweaks] = useState(loadTweaks)
  const updateTweaks = (t) => { setTweaks(t); saveTweaks(t) }

  const [settings, setSettings]       = useState(loadSettings)
  const [showSettings, setShowSettings] = useState(false)
  const [module, setModule]           = useState('ENGINEERING')
  const [activeTab, setActiveTab]     = useState('query')
  const [question, setQuestion]       = useState('')
  const [filters, setFilters]         = useState({})
  const [followUpCtx, setFollowUpCtx] = useState(null)
  const [history, setHistory]         = useState(loadHistory)
  const [favorites, setFavorites]     = useState(loadFavorites)
  const [showFeedback, setShowFeedback] = useState(false)

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })
  const showToast = useCallback((message, type = 'success') => setToast({ visible: true, message, type }), [])
  const dismissToast = useCallback(() => setToast(t => ({ ...t, visible: false })), [])

  const [confirmedQueryIds, setConfirmedQueryIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('kmc_sq_confirmed') || '[]')) }
    catch { return new Set() }
  })
  const addConfirmed = useCallback((queryId) => {
    if (!queryId) return
    setConfirmedQueryIds(prev => {
      const next = new Set(prev); next.add(queryId)
      try { localStorage.setItem('kmc_sq_confirmed', JSON.stringify([...next])) } catch {}
      return next
    })
  }, [])

  const { status: svcStatus, info: svcInfo, recheck } = useServiceStatus(settings.apiBase)
  const { stats: sessionStats, record: recordStat }   = useSessionStats()
  const [aiExamples, setAiExamples] = useState([])
  useEffect(() => {
    fetchExamples({ apiBase: settings.apiBase, moduleCode: module })
      .then(r => setAiExamples(r.questions || [])).catch(() => {})
  }, [module, settings.apiBase])

  const queryInputRef  = useRef(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  useKeyboardShortcuts({
    onFocusInput:    () => queryInputRef.current?.focus(),
    onEscape:        () => { setShowFeedback(false); setShowSettings(false); setShowShortcuts(false) },
    onTabChange:     setActiveTab,
    onShowShortcuts: () => setShowShortcuts(true),
  })

  const handleHistoryUpdate = useCallback((entry) => {
    setHistory(prev => {
      const next = [entry, ...prev.slice(0, 29)]; saveHistory(next); return next
    })
    recordStat({ success: true, fromCache: entry.source?.includes('cached'), executionTimeMs: entry.executionTimeMs })
  }, [recordStat])

  const {
    loading, pipelineStep, stepLabel, streamingSql,
    result, error, runQuery, downloadCsv, reset,
    insight, insightLoading, insightError, fetchInsight, dismissInsight,
  } = useStreamingQuery({ apiBase: settings.apiBase, onHistoryUpdate: handleHistoryUpdate })

  const handleToggleFavorite = useCallback(() => {
    if (!result || !question.trim()) return
    if (isFavorited(question, module)) setFavorites(removeFavorite(question, module))
    else setFavorites(addFavorite({ question, moduleCode: module, queryId: result.queryId }))
  }, [question, module, result])

  const handleFeedbackOpen   = useCallback(() => { if (!result) return; setShowFeedback(true) }, [result])
  const handleFeedbackSubmit = useCallback(async (payload) => {
    const res = await submitFeedback({ apiBase: settings.apiBase, ...payload })
    if (res.action === 'saved')             showToast(`✨ Example #${res.newExampleId} added — AI will improve!`, 'success')
    else if (res.action === 'skipped_duplicate') showToast('Already in training examples.', 'info')
    else if (res.action === 'skipped_incorrect') showToast('Feedback recorded — incorrect SQL noted.', 'warning')
    return res
  }, [settings.apiBase, result, showToast, addConfirmed])

  const handleSubmit = () => {
    if (!question.trim()) return
    setFollowUpCtx(null)
    runQuery({ question, moduleCode: module, userId: settings.userId, filters })
  }
  const handleModuleChange = (mod) => { setModule(mod); setFilters({}); setFollowUpCtx(null); reset(); setActiveTab('query') }
  const handleReplay = (entry) => { setModule(entry.moduleCode); setQuestion(entry.question); setFilters({}); setFollowUpCtx(null); reset(); setActiveTab('query') }
  const handleSaveSettings = (s) => { setSettings(s); saveSettings(s) }
  const handlePdfExport = async () => {
    if (!result) return
    await exportPdf({ apiBase: settings.apiBase, columns: result.columns, data: result.data, question, moduleCode: module, queryId: result.queryId, source: result.source, executionTimeMs: result.executionTimeMs, generatedSql: result.generatedSql })
  }

  const showPipeline = loading || result || error
  const baseHue = MODULE_HUES[module] || 262
  const hue     = useMemo(() => (baseHue + tweaks.accentHueShift + 360) % 360,
    [baseHue, tweaks.accentHueShift])

  // ── Background tint (shifts base bg hue when bgTint ≠ 0) ──
  const bgColor = useMemo(() => {
    if (!tweaks.bgTint) return T.bg
    const h = (baseHue + tweaks.bgTint + 360) % 360
    return isDark
      ? `oklch(0.08 0.06 ${h})`
      : `oklch(0.94 0.03 ${h})`
  }, [T.bg, tweaks.bgTint, isDark, baseHue])

  // ── Orbs from active theme (memoized — only recalc when hue/intensity/theme changes) ──
  const orbs = useMemo(() => T.orbs.map((o, i) => {
    const actualHue = i === 0 ? hue : i === 1 ? (hue + 50) % 360 : i === 2 ? (hue + 120) % 360 : (hue + 200) % 360
    const color = `oklch(${o.L} ${o.C * tweaks.orbIntensity} ${actualHue})`
    return { ...o, color, actualHue, blur: o.blur * (0.6 + tweaks.orbIntensity * 0.6) }
  }), [T.orbs, hue, tweaks.orbIntensity])

  // ── Auth gate — show login screen until session exists ──
  if (!session) return <LoginScreen onLogin={login} isDark={isDark} />

  return (
    <div className="sq-theme-root" style={{ minHeight: '100vh', paddingBottom: 46, position: 'relative', background: bgColor, color: T.text.primary }}>

      {/* ── SVG Caustic Noise Filter (hidden) ── */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="caustic">
            <feTurbulence type="fractalNoise" baseFrequency="0.65 0.75" numOctaves="3" seed="5" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grey" />
            <feComposite in="SourceGraphic" in2="grey" operator="arithmetic" k1="0" k2="1" k3="0" k4="0" />
          </filter>
        </defs>
      </svg>

      {/* ── Drifting volumetric orbs ── */}
      {/* Each orb is its own compositing layer via will-change+transform3d.
          Light mode uses much smaller, near-white orbs (defined in LIGHT theme)
          so they barely affect the background and cost minimal GPU. */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden', transform: 'translateZ(0)' }}>
        {orbs.map((o, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: o.size, height: o.size,
            borderRadius: '50%',
            left: o.x, top: o.y,
            background: `radial-gradient(circle, ${o.color} 0%, transparent 68%)`,
            filter: `blur(${o.blur}px)`,
            animation: `${o.anim} ${o.dur} ease-in-out infinite`,
            willChange: 'transform',
            transform: 'translateZ(0)',  // GPU layer promotion
          }} />
        ))}

        {/* Caustic noise overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: isDark
            ? 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")'
            : 'none',
          opacity: 0.045,
          mixBlendMode: isDark ? 'screen' : 'multiply',
        }} />

        {/* Perspective grid layer — toggled by tweaks */}
        {tweaks.showGrid && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: perspectiveGridBg(isDark),
            backgroundSize: '60px 60px',
            opacity: isDark ? 0.10 : 0.14,
            maskImage: 'radial-gradient(ellipse 85% 70% at 50% 45%, black 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 45%, black 30%, transparent 100%)',
            pointerEvents: 'none',
          }} />
        )}

        {/* Radial vignette top */}
        <div style={{
          position: 'absolute', inset: 0,
          background: isDark
            ? 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(5,6,26,0) 0%, rgba(5,6,26,0.55) 100%)'
            : 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(238,240,249,0) 0%, rgba(238,240,249,0.4) 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── Page Content ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Header module={module} serviceStatus={svcStatus} onSettingsClick={() => setShowSettings(true)} isDark={isDark} onToggleTheme={toggleTheme}
          isAdmin={isAdmin} userName={session?.name} onLogout={logout} />

        <NavTabs activeTab={activeTab} onTabChange={setActiveTab} module={module} onModuleChange={handleModuleChange}
          historyCount={history.length} confirmedCount={confirmedQueryIds.size} isDark={isDark} isAdmin={isAdmin} />

        {activeTab === 'query' && (
          <>
            <QueryInput module={module} question={question} setQuestion={setQuestion} filters={filters}
              setFilters={setFilters} onSubmit={handleSubmit} loading={loading}
              history={history} favorites={favorites} aiExamples={aiExamples} inputRef={queryInputRef} isDark={isDark}
              glassOpacity={tweaks.glassOpacity} />

            {showPipeline && (
              <PipelineTracker module={module} pipelineStep={pipelineStep} loading={loading}
                hasResult={!!result} hasError={!!error} streamingSql={streamingSql}
                stepLabel={stepLabel} source={result?.source} isDark={isDark}
                animatedConnector={tweaks.animatedConnector} glassOpacity={tweaks.glassOpacity} />
            )}

            {error && <ErrorCard error={error} isDark={isDark} />}

            {result && (insight || insightLoading || insightError) && (
              <InsightCard insight={insight} loading={insightLoading} error={insightError}
                accentColor={MODULE_CONFIG[module].accentColor} isDark={isDark}
                onRetry={() => fetchInsight({ question, moduleCode: module, columns: result.columns, data: result.data, generatedSql: result.generatedSql })}
                onDismiss={dismissInsight} />
            )}

            {result && (
              <ResultsPanel module={module} result={{ ...result, question }}
                followUpCtx={followUpCtx} onExportCsv={() => downloadCsv(question)}
                onExportPdf={handlePdfExport} isFavorited={isFavorited(question, module)}
                onToggleFavorite={handleToggleFavorite} onFeedback={handleFeedbackOpen} isDark={isDark}
                glassOpacity={tweaks.glassOpacity} />
            )}

            {result && !loading && (
              <FollowUpInput previousQuestion={question} loading={loading}
                accentColor={MODULE_CONFIG[module].accentColor}
                followUpDepth={(followUpCtx?.depth || 0)} isDark={isDark} glassOpacity={tweaks.glassOpacity}
                onSubmit={(followUpText) => {
                  const prevQuestion = question; const prevSql = result.generatedSql
                  const newDepth = (followUpCtx?.depth || 0) + 1
                  setQuestion(followUpText)
                  setFollowUpCtx({ previousQuestion: prevQuestion, depth: newDepth })
                  runQuery({ question: followUpText, moduleCode: module, userId: settings.userId, filters, previousQuestion: prevQuestion, previousSql: prevSql })
                }} />
            )}
          </>
        )}

        {activeTab === 'history' && <HistoryTab history={history} onReplay={handleReplay} onClear={() => { setHistory([]); saveHistory([]) }} confirmedQueryIds={confirmedQueryIds} isDark={isDark} />}
        {activeTab === 'schema' && <SchemaExplorer module={module} apiBase={settings.apiBase} isDark={isDark} />}
        {activeTab === 'status' && <ServiceStatusTab serviceInfo={svcInfo} serviceStatus={svcStatus} apiBase={settings.apiBase} onRecheck={recheck} isDark={isDark} />}
      </div>

      {/* ── Modals & overlays ── */}
      {showSettings && <SettingsModal settings={settings} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />}
      {showFeedback && result && (
        <FeedbackModal result={result} question={question} moduleCode={module} onClose={() => setShowFeedback(false)} onSubmit={handleFeedbackSubmit} />
      )}
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={dismissToast} />
      <StatusBar module={module} apiBase={settings.apiBase} serviceStatus={svcStatus} serviceInfo={svcInfo} onRecheck={recheck}
        sessionStats={sessionStats} onShowShortcuts={() => setShowShortcuts(true)} isDark={isDark} />
      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}

      {/* ── Tweaks floating panel (admin only) ── */}
      {isAdmin && <TweaksPanel tweaks={tweaks} onChange={updateTweaks} isDark={isDark} />}

      {/* ── Global CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

        * { box-sizing: border-box; }
        body { font-family: 'Inter', 'Nunito', sans-serif; }

        /* ── Orb drift animations ── */
        @keyframes orbDrift1 {
          0%,100% { transform: translate(0px,   0px)  scale(1);    }
          20%     { transform: translate(60px, -40px)  scale(1.06); }
          45%     { transform: translate(-30px, 55px)  scale(0.94); }
          70%     { transform: translate(45px,  30px)  scale(1.03); }
        }
        @keyframes orbDrift2 {
          0%,100% { transform: translate(0px,   0px)  scale(1);    }
          25%     { transform: translate(-55px,  35px) scale(1.07); }
          55%     { transform: translate(40px,  -50px) scale(0.92); }
          80%     { transform: translate(-20px,  20px) scale(1.04); }
        }
        @keyframes orbDrift3 {
          0%,100% { transform: translate(0px,  0px)  scale(1);    }
          30%     { transform: translate(35px,-45px)  scale(1.08); }
          60%     { transform: translate(-45px, 35px) scale(0.95); }
        }
        @keyframes orbDrift4 {
          0%,100% { transform: translate(0px,  0px)  scale(1);    }
          35%     { transform: translate(-40px,-30px) scale(1.05); }
          65%     { transform: translate(50px,  40px) scale(0.93); }
        }

        /* ── Core animations ── */
        @keyframes spin       { to { transform: rotate(360deg); } }
        @keyframes pulse      { 0%,100%{opacity:1} 50%{opacity:0.38} }
        @keyframes slideIn    { from{opacity:0;transform:translateX(22px)} to{opacity:1;transform:translateX(0)} }
        @keyframes floatY     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes pulseDot   { 0%,100%{box-shadow:0 0 0 0 currentColor} 50%{box-shadow:0 0 0 4px transparent} }

        /* ── Glass sheen sweep ── */
        @keyframes glassSheen {
          0%   { left: -110%; opacity: 0;   }
          8%   { opacity: 1;                }
          38%  { left:  130%; opacity: 0;   }
          100% { left:  130%; opacity: 0;   }
        }
        .glass-sheen {
          position: absolute; top: -20%; width: 52%; height: 140%;
          background: linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
          animation: glassSheen 8s ease-in-out infinite;
          pointer-events: none; border-radius: inherit; z-index: 1;
        }

        /* ── Liquid water ripple ── */
        @keyframes liquidRipple {
          0%   { transform: translate(-50%,-50%) scale(0);  opacity: 0.72; }
          100% { transform: translate(-50%,-50%) scale(28); opacity: 0;    }
        }
        .liquid-ripple {
          position: absolute; width: 24px; height: 24px; border-radius: 50%;
          background: rgba(255,255,255,0.48);
          animation: liquidRipple 0.72s cubic-bezier(0.2,0.8,0.4,1) forwards;
          pointer-events: none;
        }

        /* ── Shimmer text ── */
        @keyframes shimmerText {
          0%   { background-position: 0% center;   }
          100% { background-position: 200% center; }
        }

        /* ── Typing cursor blink ── */
        @keyframes typeCursor {
          0%,50% { opacity: 1; }
          51%,100% { opacity: 0; }
        }
        .type-cursor::after {
          content: '▋';
          animation: typeCursor 0.9s step-end infinite;
          margin-left: 1px;
          color: inherit;
        }

        /* ── Row enter animation ── */
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Shimmer skeleton ── */
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Header animations ── */
        @keyframes hdr_blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(35px,-18px) scale(1.08)} 66%{transform:translate(-18px,12px) scale(0.94)} }
        @keyframes hdr_blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-28px,16px) scale(1.06)} 66%{transform:translate(22px,-12px) scale(0.92)} }
        @keyframes hdr_blob3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-22px,22px) scale(1.14)} }
        @keyframes hdr_blob4 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(18px,-14px) scale(1.1)} 75%{transform:translate(-12px,8px) scale(0.9)} }
        @keyframes hdr_sweep { 0%{left:-55%} 100%{left:110%} }
        @keyframes hdr_shimmer_txt { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes hdr_ripple { from{transform:scale(0);opacity:1} to{transform:scale(4);opacity:0} }

        /* ── ModuleWheel ── */
        @keyframes whl_fade   { from{opacity:0} to{opacity:1} }
        @keyframes whl_spring { from{opacity:0;transform:scale(0.80) translateY(24px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes whl_sheen  { 0%{left:-110%;opacity:0} 8%{opacity:1} 38%{left:130%;opacity:0} 100%{left:130%;opacity:0} }

        /* ── Suggestion pill hover ── */
        .sq-pill:hover {
          transform: translateY(-1.5px) !important;
          box-shadow: 0 6px 20px rgba(0,0,20,0.16), inset 0 1px 0 rgba(255,255,255,1) !important;
        }

        /* ── Typography ── */
        .font-mono { font-family: 'JetBrains Mono', 'Fira Code', monospace !important; }
        input::placeholder, textarea::placeholder { color: rgba(160,165,200,0.6); }
        svg { vertical-align: middle; flex-shrink: 0; }

        /* ── Focus ring ── */
        input:focus, textarea:focus {
          outline: none !important;
          border-color: rgba(255,255,255,0.6) !important;
          box-shadow:
            0 0 0 3px rgba(139,92,246,0.2),
            0 2px 12px rgba(139,92,246,0.14),
            inset 0 2px 8px rgba(0,0,30,0.06) !important;
        }

        /* ── Button hover override ── */
        button:hover { opacity: 1 !important; }

        /* ── SQL syntax colours ── */
        .sql-keyword  { color: #a78bfa; font-weight: 700; }
        .sql-string   { color: #6ee7b7; }
        .sql-number   { color: #fbbf24; }
        .sql-comment  { color: rgba(180,185,240,0.44); font-style: italic; }
        .sql-func     { color: #67e8f9; }

        /* ── Smooth theme switch ──
           Only fade background-color and color.
           We intentionally do NOT add a global * transition because
           that would fight the @keyframes animations (orbs, sheen,
           button springs, ripples) and cause them to stutter.        */
        .sq-theme-root {
          transition: background-color 0.32s ease, color 0.32s ease;
        }

        /* ── Scrollbar styling ── */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.28); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.50); }

        /* ── Pipeline flow animations (liquid-glass-patch) ── */
        @keyframes pipeFlow  { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
        @keyframes pipeSheen { 0% { left: -40%; } 100% { left: 100%; } }
      `}</style>
    </div>
  )
}
