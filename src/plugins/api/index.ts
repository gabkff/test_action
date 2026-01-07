import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import type { ApiResponse } from 'types/api.types'
import { appConfig } from 'config'
import { cacheService } from './cache.service'
import { mockApiData } from './mock-data'

class ApiService {
  private baseUrl: string
  private enableCache: boolean
  private useMockData: boolean

  constructor() {
    this.baseUrl = appConfig.apiUrl
    this.enableCache = appConfig.enableCache
    this.useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'
  }

  /**
   * Récupère les données de l'API
   * En mode borne (kiosk) : essaie d'abord le cache, puis l'API
   * En mode iPad : toujours live depuis l'API
   */
  async fetchData(): Promise<ApiResponse> {
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
      console.log('🌐 Récupération des données depuis l\'API')
      const data = await this.fetchFromApi()

      // Sauvegarde dans le cache si activé
      if (this.enableCache) {
        await cacheService.saveApiData(data)
        console.log('💾 Données sauvegardées dans le cache')
      }

      return data
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données:', error)

      // En cas d'erreur en mode cache, essaie de récupérer depuis le cache
      if (this.enableCache) {
        const cachedData = await cacheService.getApiData()
        if (cachedData) {
          console.log('📦 Fallback sur le cache après erreur API')
          return cachedData
        }
      }

      throw error
    }
  }

  /**
   * Récupère les données depuis l'API
   */
  private async fetchFromApi(): Promise<ApiResponse> {
    // Mode mock pour le développement
    if (this.useMockData) {
      console.log('🎭 Utilisation des données mock')
      // Simule un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500))
      // Retourne une copie profonde pour permettre les mutations
      return JSON.parse(JSON.stringify(mockApiData))
    }

    const response = await tauriFetch(this.baseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
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
    }
  }

  /**
   * Force le rafraîchissement des données
   */
  async refresh(): Promise<ApiResponse> {
    console.log('🔄 Rafraîchissement forcé des données')
    const data = await this.fetchFromApi()

    if (this.enableCache) {
      await cacheService.saveApiData(data)
    }

    return data
  }

  /**
   * Vide le cache
   */
  async clearCache(): Promise<void> {
    await cacheService.clear()
    console.log('🗑️ Cache vidé')
  }
}

export const apiService = new ApiService()

