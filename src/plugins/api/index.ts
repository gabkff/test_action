import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { getApiUrl, getApiKey, getUseMockData, getDefaultLocale } from 'config'
import { mockApiData } from './mock-data'
import { getAuthHeaders } from 'utils/helpers'
import { getApiSite } from './apiSite'

/**
 * Service API simplifié
 * 
 * Responsabilités :
 * - Fetch les données depuis l'API
 * - Retourne les données mock si configuré
 * - Fallback sur mock si erreur
 * 
 * Note: La gestion du cache fichier est faite par le store (app.ts)
 */
class ApiService {
  private currentLocale: string

  constructor() {
    this.currentLocale = getDefaultLocale()
  }

  /**
   * Définit la langue pour les appels API
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
    return `${getApiUrl()}/${this.currentLocale}/${getApiSite()}`
  }

  /**
   * Retourne les données mock (copie profonde)
   */
  private getMockData(): ApiResponse {
    console.log('🎭 Utilisation des données mock')
    return JSON.parse(JSON.stringify(mockApiData))
  }

  /**
   * Récupère les données depuis l'API
   * 
   * Logique :
   * 1. Si VITE_USE_MOCK_DATA=true → données mock
   * 2. Sinon, fetch depuis l'API
   * 3. Si erreur API → fallback sur mock
   */
  async fetchData(locale?: string): Promise<ApiResponse> {
    if (getUseMockData()) {
      return this.getMockData()
    }

    // Mode API réelle
    try {
      return await this.fetchFromApi(locale)
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données:', error)

      // Fallback sur les données mock
      console.log('🎭 Fallback sur les données mock après erreur API')
      return this.getMockData()
    }
  }

  /**
   * Récupère les données depuis l'API réelle (Tauri HTTP)
   */
  private async fetchFromApi(locale?: string): Promise<ApiResponse> {
    const targetLocale = locale || this.currentLocale
    const url = `${getApiUrl()}/${targetLocale}/${getApiSite()}`
    console.log(`📡 Appel API: ${url}`)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': getApiKey(),
      ...getAuthHeaders()
    }

    const response = window.__TAURI__
      ? await tauriFetch(url, { method: 'GET', headers })
      : await fetch(url, { method: 'GET', headers })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Vérifie que les données sont valides
    if (!data || !data.data) {
      throw new Error('Données API invalides ou vides')
    }

    console.log(`✅ Données API (${targetLocale}) reçues avec succès`)
    return data
  }

  /**
   * Force le rafraîchissement des données depuis l'API
   * Utilisé par le refresh périodique
   */
  async refresh(): Promise<ApiResponse> {
    console.log('🔄 Rafraîchissement des données depuis l\'API')

    if (getUseMockData()) {
      return this.getMockData()
    }

    try {
      return await this.fetchFromApi()
    } catch (error) {
      console.error('❌ Erreur lors du refresh:', error)

      // Fallback sur les données mock
      console.log('🎭 Fallback sur les données mock après erreur refresh')
      return this.getMockData()
    }
  }

  /**
   * Vérifie si le mode mock est activé
   */
  isMockMode(): boolean {
    return getUseMockData()
  }

  /**
   * Teste un code site (pour la page de sélection tablette).
   * Appel GET avec le site fourni ; ne modifie pas le site en cache.
   */
  async testSite(site: string, locale?: string): Promise<ApiResponse> {
    const targetLocale = locale || this.currentLocale
    const siteTrim = (site || '').trim()
    if (!siteTrim) throw new Error('Code site vide')
    const url = `${getApiUrl()}/${targetLocale}/${siteTrim}`
    console.log(`📡 Test API site: ${url}`)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': getApiKey(),
      ...getAuthHeaders()
    }

    const response = window.__TAURI__
      ? await tauriFetch(url, { method: 'GET', headers })
      : await fetch(url, { method: 'GET', headers })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    if (!data || !data.data) {
      throw new Error('Données API invalides ou vides')
    }
    return data
  }
}

export const apiService = new ApiService()
