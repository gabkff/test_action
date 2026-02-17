import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { pinia } from 'plugins/store'
import { mockApiData } from 'plugins/api/mock-data'
import { cacheService } from 'plugins/api/cache.service'
import { assetsService } from 'plugins/api/assets.service'
import { apiService } from 'plugins/api'
import { AVAILABLE_LOCALES, appConfig } from 'config'
import { useI18nStore } from 'plugins/i18n/store'
import { hasApiSiteInCache } from 'plugins/api/apiSite'
import i18n from 'plugins/i18n/index'


const isTauriEnvironment = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

/** Infos du site extraites du wrapper */
export interface SiteContext {
  lang: string
  ville: string
  siteId: number
}

const useStore = defineStore('app', () => {
  const router = useRouter()
  const BASE_LOCALE = 'fr'

  // ============================================
  // STATE
  // ============================================

  /** Métadonnées de l'API (généralement communes ou fr par défaut) */
  const meta = ref<MetaData | null>(null)

  /** Contexte du site par langue */
  const siteContexts = ref<Record<string, SiteContext>>({})

  /** Données utiles par langue (home, events, circuits) */
  const localizedData = ref<Record<string, ApiData>>({})

  /** États UI */
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdate = ref<number>(0)
  const isAppReady = ref(false)

  /** IDs et index pour la réactivité stable */
  const currentCircuitId = ref<number | null>(null)
  const currentStepIndex = ref<number>(0)
  const currentEventId = ref<number | null>(null)

  // ============================================
  // HELPERS DE FUSION (Technique vs Texte)
  // ============================================

  /**
   * Fusionne un objet de base (données techniques) avec un objet localisé (textes)
   */
  function mergeCircuit(base: CircuitEntry, local: CircuitEntry | undefined): CircuitEntry {
    if (!local) return base
    return {
      ...base,
      title: local.title,
      slug: local.slug,
      description: local.description,
      steps: base.steps.map((baseStep, index) => {
        const localStep = local.steps[index]
        return mergeStep(baseStep, localStep)
      })
    }
  }

  function mergeStep(base: CircuitStep, local: CircuitStep | undefined): CircuitStep {
    if (!local) return base
    return {
      ...base,
      title: local.title,
      description: local.description,
      main_text: local.main_text,
      essentials: local.essentials,
      estimated_time: local.estimated_time,
      activity_type: local.activity_type
    }
  }

  function mergeEvent(base: EventEntry, local: EventEntry | undefined): EventEntry {
    if (!local) return base
    return {
      ...base,
      title: local.title,
      slug: local.slug,
      description: local.description,
      times: local.times,
      address: local.address,
      entry_type: local.entry_type,
      price_range: local.price_range
    }
  }

  // ============================================
  // GETTERS - Accès réactif via i18n
  // ============================================

  /** Récupère la langue actuelle depuis le store i18n */
  const currentLocale = computed(() => useI18nStore().locale)

  /** Données de base (pour les assets techniques stables) */
  const baseData = computed((): ApiData | null => {
    return localizedData.value[BASE_LOCALE] || Object.values(localizedData.value)[0] || null
  })

  /** Données locales (pour les textes) */
  const localData = computed((): ApiData | null => {
    return localizedData.value[currentLocale.value] || null
  })

  /** Données utiles (fusionnées) */
  const data = computed((): ApiData | null => {
    if (!baseData.value) return null
    return {
      home: localData.value?.home || baseData.value.home,
      events: baseData.value.events.map(baseEvent => {
        const localEvent = localData.value?.events.find(e => e.id === baseEvent.id)
        return mergeEvent(baseEvent, localEvent)
      }),
      circuits: baseData.value.circuits.map(baseCircuit => {
        const localCircuit = localData.value?.circuits.find(c => c.id === baseCircuit.id)
        return mergeCircuit(baseCircuit, localCircuit)
      })
    }
  })

  /** Données de la page d'accueil (fusionnées) */
  const home = computed((): HomeData | null => data.value?.home ?? null)

  /** Liste des événements (fusionnés) */
  const events = computed((): EventEntry[] => data.value?.events ?? [])

  /** Liste des circuits (fusionnés) */
  const circuits = computed((): CircuitEntry[] => data.value?.circuits ?? [])

  /** Circuit actuel stable */
  const current = computed((): CircuitEntry | null => {
    if (currentCircuitId.value === null) return null
    return circuits.value.find(c => c.id === currentCircuitId.value) || null
  })

  /** Étape actuelle stable */
  const currentStep = computed((): CircuitStep | null => {
    if (!current.value) return null
    return current.value.steps[currentStepIndex.value] || null
  })

  /** Contexte du site (langue actuelle) */
  const siteContext = computed((): SiteContext | null => {
    return siteContexts.value[currentLocale.value] || null
  })

  const currentPreviousParcours = computed(() => {
    if (!current.value || currentStepIndex.value === 0) return []
    const previous = [];

    for (let i = currentStepIndex.value - 1; i >= 0; i--) {
      previous.push(current.value.steps[i].next_step)
    }

    return previous
  })
  const currentNextParcours = computed(() => {
    if (!current.value) return []
    if (currentStepIndex.value === current.value.steps.length - 1) return []
    const next = []
    for (let i = currentStepIndex.value + 1; i < current.value.steps.length; i++) {
      next.push(current.value.steps[i].next_step)
    }
    return next
  })

  const nextStepPolyline = computed(() => {
    if (currentNextParcours.value.length === 0) return []
    return currentNextParcours.value.map((step: NextStepInfo) => step.polyline)
  })
  const previousStepPolyline = computed(() => {
    if (currentPreviousParcours.value.length === 0) return []
    return currentPreviousParcours.value.map((step: NextStepInfo) => step.polyline)
  })

  const nextCircuit = computed(() => {
    if (!current.value) return null
    return circuits.value.find((circuit: CircuitEntry) => circuit.id !== current.value!.id)
  })


  const currentEvent = computed(() => {
    if (!currentEventId.value) return null
    return localData.value?.events.find((event: EventEntry) => event.id === currentEventId.value)
  })
  // ============================================
  // GETTERS - Helpers
  // ============================================

  /** Récupère toutes les données */
  const getAllData = computed(() => {
    return localizedData.value
  })

  /** Nombre total de circuits */
  const circuitsCount = computed(() => circuits.value.length)

  /** Nombre total d'événements */
  const eventsCount = computed(() => events.value.length)

  /** Récupère un circuit par son slug (sans effet de bord) */
  const getCircuitBySlug = (slug: string): CircuitEntry | null => {
    return circuits.value.find((circuit: CircuitEntry) => circuit.slug === slug) ?? null
  }

  /** Récupère l'index d'un circuit par son ID */
  const getCircuitIndex = (id: number): number => {
    const index = circuits.value.findIndex((circuit: CircuitEntry) => circuit.id === id)
    return index >= 0 ? index : -1
  }


  /** Récupère un événement par son slug */
  const getEventBySlug = (slug: string): EventEntry | undefined | null => {
    return events.value.find((event: EventEntry) => event.slug === slug)
  }

  /** Récupère un circuit par son ID */
  const getCircuitById = (id: number): CircuitEntry | undefined | null => {
    return circuits.value.find((circuit: CircuitEntry) => circuit.id === id)
  }

  /** Récupère un événement par son ID */
  const getEventById = (id: number): EventEntry | undefined | null => {
    return events.value.find((event: EventEntry) => event.id === id)
  }

  // ============================================
  // ACTIONS
  // ============================================
  async function initData() {
    setLoading(true)
    clearError()

    // Mode tablette sans site en cache : ne pas appeler l'API (l'utilisateur est sur /selectCity)
    if (appConfig.mode === 'ipad' && !hasApiSiteInCache()) {
      setLoading(false)
      setAppReady()
      return
    }

    try {
      const locales = AVAILABLE_LOCALES || ['fr', 'en']

      // ========================================
      // MODE TAURI/KIOSK : Cache fichier + API
      // ========================================
      if (isTauriEnvironment && appConfig.enableCache) {
        // 1. Charger d'abord depuis le cache fichier (démarrage rapide)
        const cachedMultiData = await cacheService.readDataFromFile()
        if (cachedMultiData) {
          Object.keys(cachedMultiData).forEach(locale => {
            setApiData(cachedMultiData[locale], locale)
          })
          console.log('🚀 Démarrage avec données multi-langues en cache')
        } else {
          // Pas de cache : charger les données mock en attendant
          setApiData(mockApiData, 'fr') // Mock est en fr par défaut
          console.log('🚀 Démarrage avec données mock')
        }

        // 2. Tenter de mettre à jour depuis l'API pour TOUTES les langues
        try {
          const freshMultiData: Record<string, ApiResponse> = {}
          for (const locale of locales) {
            freshMultiData[locale] = await apiService.fetchData(locale)
          }

          // Télécharge UNIQUEMENT les assets des éléments modifiés
          // et fusionne avec le cache existant (gère toutes les langues)
          const dataWithLocalAssets = await assetsService.downloadAndReplaceUrlsOptimized(
            freshMultiData,
            cachedMultiData
          )

          // Met à jour le store pour chaque langue
          Object.keys(dataWithLocalAssets).forEach(locale => {
            setApiData(dataWithLocalAssets[locale], locale)
          })

          await cacheService.writeDataToFile(dataWithLocalAssets)
          console.log('✅ Données multi-langues mises à jour depuis l\'API')
        } catch (apiError) {
          console.warn('⚠️ API non disponible, conservation du cache', apiError)
        }
      }
      // ========================================
      // MODE BROWSER : Données live pour toutes les langues
      // ========================================
      else {
        for (const locale of locales) {
          const data = await apiService.fetchData(locale)
          setApiData(data, locale)
        }
        console.log('🌐 Mode browser : données live multi-langues')
      }
    } catch (error) {
      setError(`Erreur initialisation: ${error}`)
    } finally {
      setLoading(false)
      setAppReady()
    }
  }

  /** 
   * Définit les données de l'API pour une langue donnée
   */
  function setApiData(response: ApiResponse, locale: string) {
    // Extrait les métadonnées (écrase les précédentes, elles sont globales)
    meta.value = response.meta

    // Extrait le contexte du site pour cette langue
    siteContexts.value[locale] = {
      lang: response.data.lang,
      ville: response.data.ville,
      siteId: response.data.siteId
    }

    // Extrait les données utiles pour cette langue
    localizedData.value[locale] = response.data.data

    // Merge les traductions I18n de l'API dans vue-i18n
    const rawI18n = response.data.data.home?.I18n
    if (rawI18n) {
      try {
        console.log('🌐 Traductions I18n', JSON.parse(rawI18n))
        const i18nMessages = typeof rawI18n === 'string' ? JSON.parse(rawI18n) : rawI18n
        i18n.global.mergeLocaleMessage(locale, i18nMessages)
        console.log(`🌐 Traductions I18n mergées pour [${locale}]`)
      } catch (e) {
        console.warn(`⚠️ Erreur parsing I18n pour [${locale}]:`, e)
      }
    }

    // Met à jour les timestamps
    lastUpdate.value = Date.now()
    error.value = null

    console.log(`📦 Store mis à jour [${locale}]:`, {
      ville: siteContexts.value[locale].ville,
      circuits: localizedData.value[locale].circuits?.length ?? 0,
      events: localizedData.value[locale].events?.length ?? 0
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
    siteContexts.value = {}
    localizedData.value = {}
    isLoading.value = false
    error.value = null
    lastUpdate.value = 0
    currentCircuitId.value = null
    currentStepIndex.value = 0
  }
  function setCircuitById(id: number, redirectIfnotFound: boolean = false) {
    const circuit = getCircuitById(id)
    if (!circuit) {
      if (redirectIfnotFound) {
        router.replace({ name: 'home' })
      }
      return null
    }
    setCurrentCircuit(circuit)
  }

  function setCurrentCircuit(circuit: CircuitEntry) {
    const isTranslation = currentCircuitId.value === circuit.id
    currentCircuitId.value = circuit.id

    // Si c'est un nouveau circuit, on remet l'index à 0
    if (!isTranslation) {
      currentStepIndex.value = 0
    }
  }

  function setCurrentStepIndex(stepIndex: number) {
    currentStepIndex.value = stepIndex
  }

  function setCurrentEvent(eventId: number ) {
    currentEventId.value = eventId
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
    localizedData,

    // Getters - Données directes
    home,
    events,
    circuits,
    currentPreviousParcours,
    currentNextParcours,
    currentEvent,
    current,
    currentStep,
    currentStepIndex,
    nextStepPolyline,
    previousStepPolyline,
    nextCircuit,
    // Getters - Helpers
    circuitsCount,
    eventsCount,
    getCircuitBySlug,
    getCircuitIndex,
    getEventBySlug,
    getCircuitById,
    getEventById,
    getAllData,

    // Actions
    initData,
    setApiData,
    setLoading,
    setError,
    clearError,
    setAppReady,
    setCurrentCircuit,
    setCurrentStepIndex,
    setCircuitById,
    setCurrentEvent,
    reset,
  }
})

export const store = useStore(pinia);
export default store