import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import type { ApiResponse } from 'types/api.types'
import { appConfig } from 'config'
import { cacheService } from './cache.service'
import { mockApiData } from './mock-data'

/**
 * Configuration de l'API
 * URL: https://tcn.dev.kffein.work/api/bornes/{langue}/{site}
 */
const API_BASE_URL = import.meta.env.VITE_API_URL
const API_SITE = import.meta.env.VITE_API_SITE
const DEFAULT_LOCALE = import.meta.env.VITE_DEFAULT_LOCALE
const API_AUTH_USER = import.meta.env.VITE_API_AUTH_USER || 'kff'
const API_AUTH_PASS = import.meta.env.VITE_API_AUTH_PASS || 'ein'

class ApiService {
  private enableCache: boolean
  private useMockData: boolean
  private currentLocale: string

  constructor() {
    this.enableCache = appConfig.enableCache
    this.useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'
    this.currentLocale = DEFAULT_LOCALE
  }

  /**
   * Définit la langue pour les appels API
   * @param locale - Code de langue (fr, en, etc.)
   */
  setLocale(locale: string): void {
    this.currentLocale = locale
    console.log(`🌍 Langue API définie sur: ${locale}`)
  }

  /**
   * Récupère la langue actuelle
   */
  getLocale(): string {
    return this.currentLocale
  }

  /**
   * Construit l'URL complète de l'API
   * Ex: https://tcn.dev.kffein.work/api/bornes/fr/tadoussac
   */
  private getFullUrl(): string {
    return `${API_BASE_URL}/${this.currentLocale}/${API_SITE}`
  }

  /**
   * Retourne les données mock (copie profonde)
   */
  private getMockData(): ApiResponse {
    console.log('🎭 Utilisation des données mock')
    return JSON.parse(JSON.stringify(mockApiData))
  }

  /**
   * Récupère les données de l'API
   * 
   * Ordre de priorité :
   * 1. Si VITE_USE_MOCK_DATA=true → données mock directement
   * 2. Sinon, essaie l'API
   * 3. Si erreur API → fallback sur le cache
   * 4. Si pas de cache → fallback sur les données mock
   */
  async fetchData(): Promise<ApiResponse> {
    // Mode mock forcé (dev sans API)
    if (this.useMockData) {
      const mockData = this.getMockData()
      
      // Sauvegarde les mock dans le cache si activé
      if (this.enableCache) {
        await cacheService.saveApiData(mockData)
        console.log('💾 Données mock sauvegardées dans le cache')
      }
      
      return mockData
    }

    // Mode API réelle
    try {
      // En mode cache, essaie d'abord de récupérer depuis le cache
      if (this.enableCache) {
        const cachedData = await cacheService.getApiData()
        if (cachedData) {
          console.log('📦 Données récupérées depuis le cache')
          // Lance une mise à jour en arrière-plan
          this.updateCacheInBackground()
          return cachedData
        }
      }

      // Récupère depuis l'API
      console.log(`🌐 Récupération des données depuis: ${this.getFullUrl()}`)
      const data = await this.fetchFromApi()

      // Sauvegarde dans le cache si activé
      if (this.enableCache) {
        await cacheService.saveApiData(data)
        console.log('💾 Données sauvegardées dans le cache')
      }

      return data
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données:', error)

      // Fallback 1: Essaie le cache
      if (this.enableCache) {
        const cachedData = await cacheService.getApiData()
        if (cachedData) {
          console.log('📦 Fallback sur le cache après erreur API')
          return cachedData
        }
      }

      // Fallback 2: Utilise les données mock
      console.log('🎭 Fallback sur les données mock après erreur API')
      const mockData = this.getMockData()
      
      // Sauvegarde les mock dans le cache pour la prochaine fois
      if (this.enableCache) {
        await cacheService.saveApiData(mockData)
        console.log('💾 Données mock sauvegardées dans le cache (fallback)')
      }
      
      return mockData
    }
  }

  /**
   * Récupère les données depuis l'API réelle
   */
  private async fetchFromApi(): Promise<ApiResponse> {
    const url = this.getFullUrl()
    console.log(`📡 Appel API: ${url}`)

    // Construit les headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Ajoute l'authentification Basic si configurée
    if (API_AUTH_USER && API_AUTH_PASS) {
      const credentials = btoa(`${API_AUTH_USER}:${API_AUTH_PASS}`)
      headers['Authorization'] = `Basic ${credentials}`
    }

    const response = await tauriFetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Vérifie que les données sont valides
    if (!data || !data.data) {
      throw new Error('Données API invalides ou vides')
    }

    console.log('✅ Données API reçues avec succès', data)
    return data
  }

  /**
   * Met à jour le cache en arrière-plan
   */
  private async updateCacheInBackground(): Promise<void> {
    try {
      const data = await this.fetchFromApi()
      await cacheService.saveApiData(data)
      console.log('🔄 Cache mis à jour en arrière-plan')
    } catch (error) {
      console.error('⚠️ Erreur lors de la mise à jour du cache:', error)
      // On ne fait rien de plus, le cache actuel reste valide
    }
  }

  /**
   * Force le rafraîchissement des données depuis l'API
   * Avec fallback sur mock si erreur
   */
  async refresh(): Promise<ApiResponse> {
    console.log('🔄 Rafraîchissement forcé des données')
    
    try {
      const data = await this.fetchFromApi()

      if (this.enableCache) {
        await cacheService.saveApiData(data)
      }

      return data
    } catch (error) {
      console.error('❌ Erreur lors du refresh:', error)
      
      // Fallback sur les données mock
      console.log('🎭 Fallback sur les données mock après erreur refresh')
      return this.getMockData()
    }
  }

  /**
   * Vide le cache
   */
  async clearCache(): Promise<void> {
    await cacheService.clear()
    console.log('🗑️ Cache vidé')
  }

  /**
   * Peuple le cache avec les données mock
   * Utile pour initialiser le cache sans connexion
   */
  async populateCacheWithMock(): Promise<void> {
    if (this.enableCache) {
      const mockData = this.getMockData()
      await cacheService.saveApiData(mockData)
      console.log('💾 Cache peuplé avec les données mock')
    }
  }
}

export const apiService = new ApiService()
