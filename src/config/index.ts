import type { AppConfig, AppMode } from 'types/api.types'

/**
 * Configuration de l'application
 * 
 * Ce fichier centralise toute la configuration de l'application.
 * Les valeurs sont récupérées depuis les variables d'environnement.
 */

// Détermine le mode de l'application depuis les variables d'environnement
const getAppMode = (): AppMode => {
  const mode = import.meta.env.VITE_APP_MODE as AppMode
  return mode === 'kiosk' || mode === 'ipad' ? mode : 'ipad'
}

// Configuration de l'application
export const appConfig: AppConfig = {
  mode: getAppMode(),
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  refreshInterval: parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '300000'), // 5 minutes par défaut
  enableCache: getAppMode() === 'kiosk',
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

