// ─────────────────────────────────────────────
//  Centralized Lucide Icon System
//  All icons imported here — components use these exports.
//  Easy to swap, theme, or resize from one place.
// ─────────────────────────────────────────────

import {
  Zap, Settings, Search, ClipboardList, Radio, Store, HardHat,
  BarChart3, Code2, Info, Download, FileText, Trash2, Play,
  AlertTriangle, Globe, Cpu, Monitor, Package, BookOpen,
  ShieldCheck, Check, FolderOpen, MapPin, Calendar, Hash,
  Layers, Coins, TrendingUp, Receipt, Clock, Trophy,
  Key, Ruler, Lightbulb, X, User, Database, ChevronRight,
  RefreshCw, Copy, Filter, Mic, Star, ArrowUpDown,
  CircleDot, FileCode2, LayoutDashboard, Send, WifiOff,
  Wifi, Building2, CircleCheck, CircleX, Loader2, ChevronDown,
  Keyboard, Landmark, ScrollText, TreePine
} from 'lucide-react'

// Default icon size for inline use
const S = 16
const M = 18
const L = 20

// ─── App-wide icon map ──────────────────────
// Usage: import { ICONS } from '../utils/icons'
//        <ICONS.search size={16} />

export const ICONS = {
  // Navigation & Actions
  search:       (props) => <Search size={S} {...props} />,
  settings:     (props) => <Settings size={S} {...props} />,
  filter:       (props) => <Filter size={S} {...props} />,
  refresh:      (props) => <RefreshCw size={S} {...props} />,
  close:        (props) => <X size={S} {...props} />,
  copy:         (props) => <Copy size={S} {...props} />,
  download:     (props) => <Download size={S} {...props} />,
  send:         (props) => <Send size={S} {...props} />,
  play:         (props) => <Play size={S} {...props} />,
  trash:        (props) => <Trash2 size={S} {...props} />,
  check:        (props) => <Check size={S} {...props} />,
  chevronRight: (props) => <ChevronRight size={S} {...props} />,
  chevronDown:  (props) => <ChevronDown size={S} {...props} />,
  keyboard:     (props) => <Keyboard size={S} {...props} />,
  sort:         (props) => <ArrowUpDown size={S} {...props} />,

  // Branding & Modules
  zap:          (props) => <Zap size={S} {...props} />,
  market:       (props) => <Store size={S} {...props} />,
  engineering:  (props) => <HardHat size={S} {...props} />,
  building:     (props) => <Building2 size={S} {...props} />,
  dashboard:    (props) => <LayoutDashboard size={S} {...props} />,

  // Data & Results
  barChart:     (props) => <BarChart3 size={S} {...props} />,
  trendUp:      (props) => <TrendingUp size={S} {...props} />,
  database:     (props) => <Database size={S} {...props} />,
  code:         (props) => <Code2 size={S} {...props} />,
  fileCode:     (props) => <FileCode2 size={S} {...props} />,
  info:         (props) => <Info size={S} {...props} />,
  clipboard:    (props) => <ClipboardList size={S} {...props} />,
  fileText:     (props) => <FileText size={S} {...props} />,
  package:      (props) => <Package size={S} {...props} />,
  ruler:        (props) => <Ruler size={S} {...props} />,
  lightbulb:    (props) => <Lightbulb size={S} {...props} />,
  key:          (props) => <Key size={S} {...props} />,
  receipt:      (props) => <Receipt size={S} {...props} />,

  // Pipeline Steps
  bookOpen:     (props) => <BookOpen size={S} {...props} />,
  cpu:          (props) => <Cpu size={S} {...props} />,
  shield:       (props) => <ShieldCheck size={S} {...props} />,

  // Filters & Context
  mapPin:       (props) => <MapPin size={S} {...props} />,
  calendar:     (props) => <Calendar size={S} {...props} />,
  hash:         (props) => <Hash size={S} {...props} />,
  layers:       (props) => <Layers size={S} {...props} />,
  folder:       (props) => <FolderOpen size={S} {...props} />,
  coins:        (props) => <Coins size={S} {...props} />,
  trophy:       (props) => <Trophy size={S} {...props} />,
  clock:        (props) => <Clock size={S} {...props} />,
  user:         (props) => <User size={S} {...props} />,
  star:         (props) => <Star size={S} {...props} />,
  mic:          (props) => <Mic size={S} {...props} />,

  // Status
  globe:        (props) => <Globe size={S} {...props} />,
  monitor:      (props) => <Monitor size={S} {...props} />,
  radio:        (props) => <Radio size={S} {...props} />,
  wifi:         (props) => <Wifi size={S} {...props} />,
  wifiOff:      (props) => <WifiOff size={S} {...props} />,
  circleCheck:  (props) => <CircleCheck size={S} {...props} />,
  circleX:      (props) => <CircleX size={S} {...props} />,
  circleDot:    (props) => <CircleDot size={S} {...props} />,
  alert:        (props) => <AlertTriangle size={S} {...props} />,
  loader:       (props) => <Loader2 size={S} className="icon-spin" {...props} />,
}

// ─── Module icon resolver ───────────────────
// Returns the Lucide component for a module key
export function ModuleIcon({ moduleKey, size = 16, ...props }) {
  switch (moduleKey) {
    case 'MARKET':              return <Store      size={size} {...props} />
    case 'ENGINEERING':         return <HardHat    size={size} {...props} />
    case 'FINANCE':             return <Landmark   size={size} {...props} />
    case 'MUNICIPAL_SECRETARY': return <ScrollText size={size} {...props} />
    case 'PARK_SQUARE':         return <TreePine   size={size} {...props} />
    default:                    return <Package    size={size} {...props} />
  }
}

// ─── Status dot with glow ───────────────────
export function StatusDot({ status, size = 7 }) {
  const color = status === true ? '#22C55E' : status === false ? '#EF4444' : '#EAB308'
  const glow  = status === true ? '0 0 6px #22C55E' : 'none'
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      borderRadius: '50%', background: color, boxShadow: glow,
      flexShrink: 0,
    }} />
  )
}

// ─── Spinner (replaces CSS-only spinners) ───
export function Spinner({ size = 14, color = 'currentColor' }) {
  return (
    <Loader2
      size={size}
      color={color}
      style={{ animation: 'icon-spin 0.75s linear infinite' }}
    />
  )
}
