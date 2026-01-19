/**
 * Types globaux de l'application
 * 
 * Ces types sont disponibles globalement dans toute l'application
 * sans avoir besoin d'être importés.
 */

// Type utilitaire pour les objets génériques
declare type Obj = Record<string, unknown>

// Type utilitaire pour les objets avec valeur optionnelle
declare type O<T> = T | undefined

// Type utilitaire pour nullable
declare type N<T> = T | null

// Augmentation du type Window
declare global {
  interface Window {
    __CACHE: O<Obj>
    __PAGE: O<Obj>
    __TIMESTAMP: number
    __ROUTES?: unknown
    prerenderReady: boolean
    isPrerender: boolean
    __TAURI__?: unknown
  }
  type Multiline = string
  type HtmlText = string 
  type Wysiwyg = string
  type Timestamp = number
  type Obj = Record<string, any>
}

// Augmentation des types d'environnement Vite
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_MODE: 'kiosk' | 'ipad'
  readonly VITE_REFRESH_INTERVAL: string
  readonly VITE_USE_MOCK_DATA: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}

