// ─────────────────────────────────────────────
//  Query Favorites Manager
//  Star/bookmark queries for instant replay.
//  Stored in localStorage, max 50 favorites.
// ─────────────────────────────────────────────

const FAVORITES_KEY = 'kmc_sq_favorites'
const MAX_FAVORITES = 50

export function loadFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [] }
  catch { return [] }
}

export function saveFavorites(favs) {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs.slice(0, MAX_FAVORITES))) }
  catch {}
}

export function addFavorite(entry) {
  const favs = loadFavorites()
  // Avoid duplicates by question + module
  const exists = favs.some(f => f.question === entry.question && f.moduleCode === entry.moduleCode)
  if (exists) return favs
  const next = [{ ...entry, favoritedAt: new Date().toISOString() }, ...favs].slice(0, MAX_FAVORITES)
  saveFavorites(next)
  return next
}

export function removeFavorite(question, moduleCode) {
  const favs = loadFavorites()
  const next = favs.filter(f => !(f.question === question && f.moduleCode === moduleCode))
  saveFavorites(next)
  return next
}

export function isFavorited(question, moduleCode) {
  const favs = loadFavorites()
  return favs.some(f => f.question === question && f.moduleCode === moduleCode)
}
