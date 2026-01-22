import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pinia } from 'plugins/store'
import { mockApiData } from 'plugins/api/mock-data'
import { cacheService } from 'plugins/api/cache.service'
import { assetsService } from 'plugins/api/assets.service'
import { apiService } from 'plugins/api'
import { appConfig } from 'config'

const isTauriEnvironment = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

/** Infos du site extraites du wrapper */
export interface SiteContext {
  lang: string
  ville: string
  siteId: number
}

const useStore = defineStore('app', () => {
  // ============================================
  // STATE (aplati depuis ApiResponse)
  // ============================================

  /** Métadonnées de l'API */
  const meta = ref<MetaData | null>(null)

  /** Contexte du site (lang, ville, siteId) */
  const siteContext = ref<SiteContext | null>(null)

  /** Données utiles (home, events, circuits) - APLATI */
  const data = ref<ApiData | null>(null)

  /** États UI */
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdate = ref<number>(0)
  const isAppReady = ref(false)

  // ============================================
  // GETTERS - Accès direct aux données
  // ============================================

  /** Données de la page d'accueil */
  const home = computed((): HomeData | null => {
    return data.value?.home ?? null
  })

  /** Liste des événements */
  const events = computed((): EventEntry[] => {
    return data.value?.events ?? []
  })

  /** Liste des circuits */
  const circuits = computed((): CircuitEntry[] => {
    return data.value?.circuits ?? []
  })

  // ============================================
  // GETTERS - Helpers
  // ============================================

  /** Nombre total de circuits */
  const circuitsCount = computed(() => circuits.value.length)

  /** Nombre total d'événements */
  const eventsCount = computed(() => events.value.length)

  /** Récupère un circuit par son slug */
  const getCircuitBySlug = (slug: string): CircuitEntry | undefined | null => {
    return circuits.value.find(circuit => circuit.slug === slug)
  }

  /** Récupère un circuit par son index */
  const getCircuitIndex = (slug: string): number | undefined | null => {
    return circuits.value.findIndex(circuit => circuit.slug === slug)
  }


  /** Récupère un événement par son slug */
  const getEventBySlug = (slug: string): EventEntry | undefined | null => {
    return events.value.find(event => event.slug === slug)
  }

  /** Récupère un circuit par son ID */
  const getCircuitById = (id: number): CircuitEntry | undefined | null => {
    return circuits.value.find(circuit => circuit.id === id)
  }

  /** Récupère un événement par son ID */
  const getEventById = (id: number): EventEntry | undefined | null => {
    return events.value.find(event => event.id === id)
  }

  // ============================================
  // ACTIONS
  // ============================================
  async function initData() {
    setLoading(true)
    clearError()

    try {
      // ========================================
      // MODE TAURI/KIOSK : Cache fichier + API
      // ========================================
      if (isTauriEnvironment && appConfig.enableCache) {
        // 1. Charger d'abord depuis le cache fichier (démarrage rapide)
        const cachedData = await cacheService.readDataFromFile()
        if (cachedData) {
          setApiData(cachedData)
          console.log('🚀 Démarrage avec données en cache')
        } else {
          // Pas de cache : charger les données mock en attendant
          setApiData(mockApiData)
          console.log('🚀 Démarrage avec données mock')
        }

        // 2. Tenter de mettre à jour depuis l'API
        try {
          const freshData = await apiService.fetchData()

          // Télécharge UNIQUEMENT les assets des éléments modifiés
          // et fusionne avec le cache existant
          const dataWithLocalAssets = await assetsService.downloadAndReplaceUrlsOptimized(
            freshData,
            cachedData // Passe le cache pour comparaison
          )

          setApiData(dataWithLocalAssets)
          await cacheService.writeDataToFile(dataWithLocalAssets)
          console.log('✅ Données mises à jour depuis l\'API')
        } catch (apiError) {
          console.warn('⚠️ API non disponible, conservation du cache')
        }
      }
      // ========================================
      // MODE BROWSER : Données mock uniquement
      // ========================================
      else {
        const data = await apiService.fetchData()
        setApiData(data)
        console.log('🌐 Mode browser : données live')
      }
    } catch (error) {
      setError(`Erreur initialisation: ${error}`)
    } finally {
      setLoading(false)
      setAppReady()
    }
  }
  /** 
   * Définit les données de l'API (avec aplatissement)
   * Extrait et sépare : meta, siteContext, data
   */
  function setApiData(response: ApiResponse) {
    // Extrait les métadonnées
    meta.value = response.meta

    // Extrait le contexte du site
    siteContext.value = {
      lang: response.data.lang,
      ville: response.data.ville,
      siteId: response.data.siteId
    }

    // Extrait les données utiles (APLATISSEMENT)
    data.value = response.data.data

    // Met à jour les timestamps
    lastUpdate.value = Date.now()
    error.value = null

    console.log('📦 Store mis à jour:', {
      lang: siteContext.value.lang,
      ville: siteContext.value.ville,
      circuits: data.value?.circuits?.length ?? 0,
      events: data.value?.events?.length ?? 0
    })
  }

  /** Définit l'état de chargement */
  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  /** Définit une erreur */
  function setError(err: string) {
    error.value = err
    isLoading.value = false
  }

  /** Efface l'erreur */
  function clearError() {
    error.value = null
  }

  /** Marque l'application comme prête */
  function setAppReady() {
    isAppReady.value = true
  }

  /** Réinitialise le store */
  function reset() {
    meta.value = null
    siteContext.value = null
    data.value = null
    isLoading.value = false
    error.value = null
    lastUpdate.value = 0
  }

  return {
    // State
    meta,
    siteContext,
    data,
    isLoading,
    error,
    lastUpdate,
    isAppReady,

    // Getters - Données directes
    home,
    events,
    circuits,

    // Getters - Helpers
    circuitsCount,
    eventsCount,
    getCircuitBySlug,
    getCircuitIndex,
    getEventBySlug,
    getCircuitById,
    getEventById,

    // Actions
    initData,
    setApiData,
    setLoading,
    setError,
    clearError,
    setAppReady,
    reset,
  }
})

export const store = useStore(pinia);
export default store