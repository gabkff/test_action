/**
 * Configuration de l'application
 *
 * Ce fichier centralise toute la configuration de l'application.
 * Le mode est dérivé au runtime : exécutable Tauri → kiosk, sinon → ipad (ou VITE_APP_MODE).
 */

/** Détection de l'environnement Tauri (exe Windows/macOS, pas le navigateur). */
const isTauri = (): boolean =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

/**
 * Détermine le mode de l'application au chargement du module.
 * - Dans l'exécutable Tauri → toujours « kiosk » (borne).
 * - Dans le navigateur / dev → VITE_APP_MODE ou défaut « ipad ».
 */
const getAppMode = (): AppMode => {
  if (isTauri()) return 'kiosk'
  const mode = import.meta.env.VITE_APP_MODE as AppMode
  return mode === 'kiosk' || mode === 'ipad' ? mode : 'ipad'
}

const appMode = getAppMode()

// Configuration de l'application (apiUrl, refreshInterval, forceRetour peuvent être surchargés par app-config.json en mode kiosk)
export const appConfig: AppConfig = {
  mode: appMode,
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  refreshInterval: parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '300000', 10), // 5 minutes par défaut
  forceRetour: parseInt(import.meta.env.VITE_FORCE_RETOUR || '300000', 10), // 5 minutes avant retour à la home (kiosk)
  enableCache: false, // true pour le test en cours
  // appMode === 'kiosk',
}

/** Surcharges lues depuis app-config.json en mode kiosk (optionnel). */
export const runtimeOverrides: {
  apiKey?: string
  useMockData?: boolean
  defaultLocale?: string
  googleMapKey?: string
  googleMapId?: string
  apiAuthUser?: string
  apiAuthPass?: string
  isDev?: boolean
} = {}

/** URL de base de l'API (runtime ou env). */
export function getApiUrl(): string {
  return appConfig.apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
}

/** Clé API (app-config.json en kiosk, sinon .env). */
export function getApiKey(): string {
  return runtimeOverrides.apiKey ?? import.meta.env.VITE_API_KEY ?? ''
}

/** Mode mock (app-config.json en kiosk, sinon .env). */
export function getUseMockData(): boolean {
  if (runtimeOverrides.useMockData !== undefined) return runtimeOverrides.useMockData
  return import.meta.env.VITE_USE_MOCK_DATA === 'true'
}

/** Locale par défaut (app-config.json en kiosk, sinon .env). */
export function getDefaultLocale(): string {
  return runtimeOverrides.defaultLocale ?? import.meta.env.VITE_DEFAULT_LOCALE ?? 'fr'
}

/** Clé Google Maps (app-config.json en kiosk, sinon .env). */
export function getGoogleMapKey(): string {
  return runtimeOverrides.googleMapKey ?? import.meta.env.VITE_GOOGLE_MAP_KEY ?? ''
}

/** ID de carte Google Maps (app-config.json en kiosk, sinon .env). */
export function getGoogleMapId(): string {
  return runtimeOverrides.googleMapId ?? import.meta.env.VITE_GOOGLE_MAP_ID ?? ''
}

/** Utilisateur auth Basic (app-config.json en kiosk, sinon .env). */
export function getApiAuthUser(): string {
  return runtimeOverrides.apiAuthUser ?? import.meta.env.VITE_API_AUTH_USER ?? ''
}

/** Mot de passe auth Basic (app-config.json en kiosk, sinon .env). */
export function getApiAuthPass(): string {
  return runtimeOverrides.apiAuthPass ?? import.meta.env.VITE_API_AUTH_PASS ?? ''
}

/** Mode dev (auth Basic activée si true) (app-config.json en kiosk, sinon .env). */
export function getIsDev(): boolean {
  if (runtimeOverrides.isDev !== undefined) return runtimeOverrides.isDev
  return import.meta.env.VITE_IS_DEV === 'true' || import.meta.env.DEV === true
}

// Constantes
export const CACHE_VERSION = '1.0.0'
export const CACHE_DB_NAME = 'tcn-app-cache'
export const ASSETS_DIR = 'assets-cache'

// Flags de debug
export const DEBUG = import.meta.env.DEV
export const IS_DEV = import.meta.env.DEV

// Animation config - activé par défaut, peut être désactivé via prefers-reduced-motion
export const motion = typeof window !== 'undefined'
  ? !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : true

// Locales disponibles
export const AVAILABLE_LOCALES = ['fr', 'en'] as const
export const DEFAULT_LOCALE = 'fr'

// Export par défaut
export default {
  appConfig,
  CACHE_VERSION,
  CACHE_DB_NAME,
  ASSETS_DIR,
  DEBUG,
  IS_DEV,
  AVAILABLE_LOCALES,
  DEFAULT_LOCALE,
}

