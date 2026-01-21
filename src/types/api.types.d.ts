/**
 * Types pour la structure de données de l'API
 * 
 * Ces types définissent la structure des données reçues depuis l'API
 * (Craft CMS ou autre CMS headless).
 */

// ============================================
// RESPONSE PRINCIPALE
// ============================================

declare interface ApiResponse {
  meta: MetaData
  data: ApiDataWrapper
}

/** Wrapper contenant les infos du site + les données */
declare interface ApiDataWrapper {
  lang: string
  ville: string
  siteId: number
  data: ApiData
}

/** Données utiles de l'application */
declare interface ApiData {
  home: HomeData
  events: EventEntry[]
  circuits: CircuitEntry[]
}

// ============================================
// METADATA
// ============================================

declare interface MetaData {
  timestamp: number
  execution_time: string
  site: SiteInfo
}

declare interface SiteInfo {
  id: number
  name: string
  handle: string
  language: string
  primary: boolean
}

// ============================================
// HOME
// ============================================

declare interface HomeData {
  id: number
  slug: string
  lastUpdate: number
  title: string
  inspirational_text: string
}

// ============================================
// EVENTS
// ============================================

declare interface EventEntry {
  id: number
  url: string
  title: string
  slug: string
  times: string
  address: string
  entry_type: string
  dates: EntryDates
  date_start: string
  date_start_timestamp: number
  date_end: string
  date_end_timestamp: number
  price_range: string | null
  description: string | null
  images: Image[]
  event_url: string | null
  event_qr: string | null
}

// ============================================
// CIRCUITS
// ============================================

declare interface CircuitEntry {
  id: number
  url: string | null
  title: string
  slug: string
  entry_type: string
  dates: EntryDates
  image: Image | null
  description: string | null
  steps: CircuitStep[]
  base64_qr: string | null
}

declare interface CircuitStep {
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

declare interface GeoCoordinates {
  latitude: number | null
  longitude: number | null
}

declare interface NextStepInfo {
  transportation: string[]
  time: number
}

// ============================================
// DATES (communes)
// ============================================

declare interface EntryDates {
  created: number
  updated: number
  posted: number
}

// ============================================
// CONFIGURATION
// ============================================

declare type AppMode = 'kiosk' | 'ipad'

declare interface AppConfig {
  mode: AppMode
  apiUrl: string
  refreshInterval?: number
  enableCache: boolean
}

declare interface GalleryItem {
  type: string
  data: Record<string, unknown>
}
