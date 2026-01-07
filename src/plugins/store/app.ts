import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiResponse, Page } from 'types/api.types'

export const useAppStore = defineStore('app', () => {
  // State
  const apiData = ref<ApiResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdate = ref<number>(0)
  const isAppReady = ref(false)

  // Getters
  const pages = computed(() => apiData.value?.data || {})
  const meta = computed(() => apiData.value?.meta)
  const pagesList = computed(() => Object.values(pages.value))

  // Récupérer une page par son slug
  const getPageBySlug = computed(() => (slug: string): Page | undefined => {
    return Object.values(pages.value).find(page => page.slug === slug)
  })

  // Actions
  function setApiData(data: ApiResponse) {
    apiData.value = data
    lastUpdate.value = Date.now()
    error.value = null
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function setError(err: string) {
    error.value = err
    isLoading.value = false
  }

  function clearError() {
    error.value = null
  }

  function setAppReady() {
    isAppReady.value = true
  }

  return {
    // State
    apiData,
    isLoading,
    error,
    lastUpdate,
    isAppReady,
    // Getters
    pages,
    meta,
    pagesList,
    getPageBySlug,
    // Actions
    setApiData,
    setLoading,
    setError,
    clearError,
    setAppReady,
  }
})

