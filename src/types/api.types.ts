/**
 * Types pour la structure de données de l'API
 * 
 * Ces types définissent la structure des données reçues depuis l'API
 * (Craft CMS ou autre CMS headless).
 */

// ============================================
// RESPONSE PRINCIPALE
// ============================================

export interface ApiResponse {
  meta: MetaData
  data: ApiDataWrapper
}

/** Wrapper contenant les infos du site + les données */
export interface ApiDataWrapper {
  lang: string
  ville: string
  siteId: number
  data: ApiData
}

/** Données utiles de l'application */
export interface ApiData {
  home: HomeData
  events: EventEntry[]
  circuits: CircuitEntry[]
}

// ============================================
// METADATA
// ============================================

export interface MetaData {
  timestamp: number
  execution_time: string
  site: SiteInfo
}

export interface SiteInfo {
  id: number
  name: string
  handle: string
  language: string
  primary: boolean
}

// ============================================
// HOME
// ============================================

export interface HomeData {
  id: number
  slug: string
  lastUpdate: number
  title: string
  inspirational_text: string
}

// ============================================
// EVENTS
// ============================================

export interface EventEntry {
  id: number
  url: string
  title: string
  slug: string
  entry_type: string
  dates: EntryDates
}

// ============================================
// CIRCUITS
// ============================================

export interface CircuitEntry {
  id: number
  url: string | null
  title: string
  slug: string
  entry_type: string
  dates: EntryDates
  image: Image | null
  description: string | null
  steps: CircuitStep[]
}

export interface CircuitStep {
  title: string
  description: string | null
  main_text: string
  essentials: string | null
  estimated_time: string
  activity_type: string[]
  seasons: string[]
  map: GeoCoordinates
  images: Image[]
  next_step: NextStepInfo
}

export interface GeoCoordinates {
  latitude: number | null
  longitude: number | null
}

export interface NextStepInfo {
  transportation: string[]
  time: number
}

// ============================================
// DATES (communes)
// ============================================

export interface EntryDates {
  created: number
  updated: number
  posted: number
}

// ============================================
// CONFIGURATION
// ============================================

export type AppMode = 'kiosk' | 'ipad'

export interface AppConfig {
  mode: AppMode
  apiUrl: string
  refreshInterval?: number
  enableCache: boolean
}
