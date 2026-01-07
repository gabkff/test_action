import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiResponse, CircuitEntry, EventEntry, HomeData } from 'types/api.types'

export const useAppStore = defineStore('app', () => {
  // ============================================
  // STATE
  // ============================================
  
  const apiData = ref<ApiResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdate = ref<number>(0)
  const isAppReady = ref(false)

  // ============================================
  // GETTERS - Données brutes
  // ============================================
  
  /** Métadonnées de l'API (site, timestamp, etc.) */
  const meta = computed(() => apiData.value?.meta ?? null)
  
  /** Données de la page d'accueil */
  const home = computed((): HomeData | null => {
    return apiData.value?.data?.home ?? null
  })
  
  /** Liste des événements */
  const events = computed((): EventEntry[] => {
    return apiData.value?.data?.events ?? []
  })
  
  /** Liste des circuits */
  const circuits = computed((): CircuitEntry[] => {
    return apiData.value?.data?.circuits ?? []
  })

  // ============================================
  // GETTERS - Helpers
  // ============================================
  
  /** Nombre total de circuits */
  const circuitsCount = computed(() => circuits.value.length)
  
  /** Nombre total d'événements */
  const eventsCount = computed(() => events.value.length)
  
  /** Récupère un circuit par son slug */
  const getCircuitBySlug = (slug: string): CircuitEntry | undefined => {
    return circuits.value.find(circuit => circuit.slug === slug)
  }
  
  /** Récupère un événement par son slug */
  const getEventBySlug = (slug: string): EventEntry | undefined => {
    return events.value.find(event => event.slug === slug)
  }
  
  /** Récupère un circuit par son ID */
  const getCircuitById = (id: number): CircuitEntry | undefined => {
    return circuits.value.find(circuit => circuit.id === id)
  }
  
  /** Récupère un événement par son ID */
  const getEventById = (id: number): EventEntry | undefined => {
    return events.value.find(event => event.id === id)
  }

  // ============================================
  // ACTIONS
  // ============================================
  
  /** Définit les données de l'API */
  function setApiData(data: ApiResponse) {
    apiData.value = data
    lastUpdate.value = Date.now()
    error.value = null
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
    apiData.value = null
    isLoading.value = false
    error.value = null
    lastUpdate.value = 0
  }

  return {
    // State
    apiData,
    isLoading,
    error,
    lastUpdate,
    isAppReady,
    
    // Getters - Données
    meta,
    home,
    events,
    circuits,
    
    // Getters - Helpers
    circuitsCount,
    eventsCount,
    getCircuitBySlug,
    getEventBySlug,
    getCircuitById,
    getEventById,
    
    // Actions
    setApiData,
    setLoading,
    setError,
    clearError,
    setAppReady,
    reset,
  }
})
