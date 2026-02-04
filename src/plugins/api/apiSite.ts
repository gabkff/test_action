import { appConfig } from 'config'

const STORAGE_KEY = 'tcn_api_site'

/**
 * Retourne le code site utilisé pour les appels API.
 * - Mode kiosk/web : valeur du .env (VITE_API_SITE).
 * - Mode ipad : valeur en localStorage (saisie utilisateur), ou chaîne vide si non renseigné.
 */
export function getApiSite(): string {
  if (appConfig.mode === 'ipad' && typeof window !== 'undefined') {
    return (window.localStorage.getItem(STORAGE_KEY) || '').trim()
  }
  return (import.meta.env.VITE_API_SITE || '').trim()
}

/**
 * Enregistre le code site (mode tablette uniquement).
 * Persiste en localStorage pour les prochains lancements.
 */
export function setApiSite(site: string): void {
  const value = (site || '').trim()
  if (appConfig.mode !== 'ipad') return
  if (typeof window === 'undefined') return
  if (value) {
    window.localStorage.setItem(STORAGE_KEY, value)
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

/** Indique si un site est déjà en cache (mode tablette). */
export function hasApiSiteInCache(): boolean {
  return getApiSite().length > 0
}
