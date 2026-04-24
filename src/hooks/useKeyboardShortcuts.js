import { useEffect, useCallback } from 'react'

// ─────────────────────────────────────────────
//  useKeyboardShortcuts
//  Global keyboard shortcuts for power users.
//
//  Shortcuts:
//    /           → focus query input
//    Escape      → close modal / reset / close autocomplete
//    Alt+1       → switch to Query tab
//    Alt+2       → switch to History tab
//    Alt+3       → switch to Status tab
//    Ctrl+?      → show shortcuts modal
//
//  The hook attaches to document and ignores
//  events when the user is typing in an input.
// ─────────────────────────────────────────────

export function useKeyboardShortcuts({
  onFocusInput,      // () → void
  onEscape,          // () → void
  onTabChange,       // (tab: string) → void
  onShowShortcuts,   // () → void
  enabled = true,
}) {
  const handler = useCallback((e) => {
    if (!enabled) return

    const tag    = document.activeElement?.tagName?.toLowerCase()
    const inInput = tag === 'input' || tag === 'select'
    // textarea is special — allow Escape to still fire
    const inTextarea = tag === 'textarea'

    // Ctrl+? — show shortcuts (always)
    if ((e.ctrlKey || e.metaKey) && e.key === '?') {
      e.preventDefault()
      onShowShortcuts?.()
      return
    }

    // Escape — always (close modals, reset)
    if (e.key === 'Escape') {
      onEscape?.()
      return
    }

    // Block remaining shortcuts when typing in input/select
    if (inInput) return

    // / — focus input (when not in any input)
    if (e.key === '/' && !inTextarea && !e.ctrlKey && !e.altKey) {
      e.preventDefault()
      onFocusInput?.()
      return
    }

    // Alt+1/2/3 — tab switch
    if (e.altKey && !e.ctrlKey) {
      if (e.key === '1') { e.preventDefault(); onTabChange?.('query') }
      if (e.key === '2') { e.preventDefault(); onTabChange?.('history') }
      if (e.key === '3') { e.preventDefault(); onTabChange?.('status') }
    }
  }, [enabled, onFocusInput, onEscape, onTabChange, onShowShortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handler])
}

// Exported shortcut reference for the modal
export const SHORTCUTS = [
  { keys: ['/', 'or', 'Ctrl+K'],  label: 'Focus query input' },
  { keys: ['Ctrl+Enter'],          label: 'Run query' },
  { keys: ['Escape'],              label: 'Close modal / Reset' },
  { keys: ['Alt+1'],               label: 'Go to Smart Query tab' },
  { keys: ['Alt+2'],               label: 'Go to Query History' },
  { keys: ['Alt+3'],               label: 'Go to Service Status' },
  { keys: ['↑', '↓'],             label: 'Navigate autocomplete' },
  { keys: ['Enter'],               label: 'Select autocomplete item' },
  { keys: ['Ctrl+?'],              label: 'Show keyboard shortcuts' },
]
