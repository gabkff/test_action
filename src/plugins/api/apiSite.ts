import { appConfig } from 'config'
import { resolveResource } from '@tauri-apps/api/path'
import { readTextFile } from '@tauri-apps/plugin-fs'

const STORAGE_KEY = 'tcn_api_site'
const CONFIG_FILENAME = 'site-config.md'

/**
 * Cache interne : stocke la valeur lue depuis le fichier site-config.md
 * au démarrage de l'app (mode kiosk uniquement).
 */
let cachedSite: string | null = null

/**
 * Initialise le site API en mode kiosk.
 * Lit le fichier site-config.md bundlé en tant que resource Tauri
 * et met en cache la première ligne non vide / non commentaire (#).
 *
 * À appeler UNE FOIS au démarrage de l'app, avant tout appel API.
 * En mode ipad, cette fonction ne fait rien.
 */
export async function initApiSite(): Promise<void> {
  if (appConfig.mode !== 'kiosk') return

  try {
    const configPath = await resolveResource(CONFIG_FILENAME)
    const content = await readTextFile(configPath)

    // On prend la première ligne non vide qui n'est pas un commentaire markdown
    const site = content
      .split('\n')
      .map(line => line.trim())
      .find(line => line.length > 0 && !line.startsWith('#'))

    if (site) {
      cachedSite = site
      console.info(`[apiSite] Site chargé depuis ${CONFIG_FILENAME} : "${site}"`)
    } else {
      console.warn(`[apiSite] ${CONFIG_FILENAME} est vide ou ne contient aucune valeur valide, fallback sur .env`)
    }
  } catch (error) {
    console.warn(`[apiSite] Impossible de lire ${CONFIG_FILENAME}, fallback sur .env`, error)
  }
}

/**
 * Retourne le code site utilisé pour les appels API.
 * - Mode kiosk : valeur lue depuis site-config.md (via initApiSite), sinon fallback .env (VITE_API_SITE).
 * - Mode ipad : valeur en localStorage (saisie utilisateur), ou chaîne vide si non renseigné.
 */
export function getApiSite(): string {
  if (appConfig.mode === 'ipad' && typeof window !== 'undefined') {
    return (window.localStorage.getItem(STORAGE_KEY) || '').trim()
  }
  // En mode kiosk : priorité au fichier, sinon fallback .env
  return cachedSite ?? (import.meta.env.VITE_API_SITE || '').trim()
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
