import { appCacheDir, join } from '@tauri-apps/api/path'
import { mkdir, exists, writeFile, remove, readDir } from '@tauri-apps/plugin-fs'
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { convertFileSrc } from '@tauri-apps/api/core'
import { appConfig } from 'config'
import { getAuthHeaders } from 'utils/helpers'
import { getApiKey } from 'config'

// Constante pour le dossier assets
const ASSETS_DIR = 'assets'

// ============================================
// TYPES POUR LA COMPARAISON
// ============================================

export interface DataChanges {
  homeChanged: boolean
  changedCircuits: CircuitEntry[]
  changedEvents: EventEntry[]
  removedCircuitIds: number[]
  removedEventIds: number[]
  hasChanges: boolean
}

/**
 * Service de gestion des assets (images/vidéos)
 * 
 * Télécharge les assets et remplace les URLs distantes par des URLs locales.
 * Optimisé pour ne télécharger que les éléments modifiés.
 */
class AssetsService {
  private assetsDir: string | null = null
  private enableCache: boolean
  private isTauriEnvironment: boolean

  constructor() {
    this.enableCache = appConfig.enableCache
    this.isTauriEnvironment = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
  }

  // ============================================
  // INITIALISATION
  // ============================================

  async init(): Promise<void> {
    if (!this.enableCache || !this.isTauriEnvironment) {
      if (!this.isTauriEnvironment) {
        console.log('⚠️ APIs Tauri non disponibles (navigateur). Mode assets désactivé.')
      }
      return
    }

    try {
      const cacheDir = await appCacheDir()
      this.assetsDir = await join(cacheDir, ASSETS_DIR)

      const dirExists = await exists(this.assetsDir)
      if (!dirExists) {
        await mkdir(this.assetsDir, { recursive: true })
        console.log('📁 Répertoire des assets créé:', this.assetsDir)
      }
    } catch (error) {
      console.error('❌ Erreur initialisation assets:', error)
    }
  }

  // ============================================
  // COMPARAISON DES DONNÉES
  // ============================================

  /**
   * Compare les données fraîches avec le cache pour détecter les changements
   * Basé sur lastUpdate (home) et dates.updated (circuits/events)
   */
  compareData(freshData: ApiData, cachedData: ApiData | null): DataChanges {
    // Si pas de cache, tout est "nouveau"
    if (!cachedData) {
      console.log('📊 Pas de cache, tout sera téléchargé')
      return {
        homeChanged: true,
        changedCircuits: freshData.circuits || [],
        changedEvents: freshData.events || [],
        removedCircuitIds: [],
        removedEventIds: [],
        hasChanges: true
      }
    }

    // Compare home (basé sur lastUpdate)
    const homeChanged = freshData.home.lastUpdate !== cachedData.home.lastUpdate
    if (homeChanged) {
      console.log('🏠 Home modifié:', cachedData.home.lastUpdate, '→', freshData.home.lastUpdate)
    }

    // Compare circuits (basé sur dates.updated)
    const cachedCircuitsMap = new Map(cachedData.circuits.map(c => [c.id, c]))
    const freshCircuitsMap = new Map(freshData.circuits.map(c => [c.id, c]))

    const changedCircuits = freshData.circuits.filter(circuit => {
      const cachedCircuit = cachedCircuitsMap.get(circuit.id)
      if (!cachedCircuit) {
        console.log('🆕 Nouveau circuit:', circuit.title)
        return true
      }
      if (cachedCircuit.dates.updated !== circuit.dates.updated) {
        console.log('📝 Circuit modifié:', circuit.title)
        return true
      }
      return false
    })

    const removedCircuitIds = cachedData.circuits
      .filter(c => !freshCircuitsMap.has(c.id))
      .map(c => {
        console.log('🗑️ Circuit supprimé:', c.title)
        return c.id
      })

    // Compare events (basé sur dates.updated)
    const cachedEventsMap = new Map(cachedData.events.map(e => [e.id, e]))
    const freshEventsMap = new Map(freshData.events.map(e => [e.id, e]))

    const changedEvents = freshData.events.filter(event => {
      const cachedEvent = cachedEventsMap.get(event.id)
      if (!cachedEvent) {
        console.log('🆕 Nouvel événement:', event.title)
        return true
      }
      if (cachedEvent.dates.updated !== event.dates.updated) {
        console.log('📝 Événement modifié:', event.title)
        return true
      }
      return false
    })

    const removedEventIds = cachedData.events
      .filter(e => !freshEventsMap.has(e.id))
      .map(e => {
        console.log('🗑️ Événement supprimé:', e.title)
        return e.id
      })

    const hasChanges = homeChanged ||
      changedCircuits.length > 0 ||
      changedEvents.length > 0 ||
      removedCircuitIds.length > 0 ||
      removedEventIds.length > 0

    console.log('📊 Résumé des changements:', {
      homeChanged,
      circuitsModifiés: changedCircuits.length,
      eventsModifiés: changedEvents.length,
      circuitsSupprimés: removedCircuitIds.length,
      eventsSupprimés: removedEventIds.length,
      hasChanges
    })

    return {
      homeChanged,
      changedCircuits,
      changedEvents,
      removedCircuitIds,
      removedEventIds,
      hasChanges
    }
  }

  // ============================================
  // TÉLÉCHARGEMENT OPTIMISÉ
  // ============================================

  /**
   * Télécharge les assets UNIQUEMENT pour les éléments modifiés
   * et fusionne avec les données en cache (Multi-langues)
   */
  async downloadAndReplaceUrlsOptimized(
    freshMultiData: any, // MultiLanguageData
    cachedMultiData: any | null // MultiLanguageData | null
  ): Promise<any> {
    if (!this.enableCache || !this.isTauriEnvironment) {
      return freshMultiData
    }

    await this.init()

    if (!this.assetsDir) {
      console.warn('⚠️ Dossier assets non initialisé')
      return freshMultiData
    }

    console.log('⬇️ Traitement des assets pour toutes les langues...')

    // Clone les données fraîches
    const result = JSON.parse(JSON.stringify(freshMultiData))

    // Parcourt chaque langue
    for (const locale of Object.keys(result)) {
      const freshData = result[locale] as ApiResponse
      const cachedData = cachedMultiData ? cachedMultiData[locale] as ApiResponse : null

      // Compare les données pour cette langue
      const cachedApiData = cachedData?.data?.data || null
      const changes = this.compareData(freshData.data.data, cachedApiData)

      // Si aucun changement pour cette langue, on restaure le cache
      if (!changes.hasChanges && cachedData) {
        console.log(`✨ Aucun changement détecté pour [${locale}], utilisation du cache`)
        result[locale] = cachedData
        continue
      }

      console.log(`⬇️ Téléchargement des assets pour [${locale}]...`)

      // Crée une map des circuits en cache pour cette langue
      const cachedCircuitsMap = new Map<number, CircuitEntry>()
      if (cachedData?.data?.data?.circuits) {
        cachedData.data.data.circuits.forEach(c => cachedCircuitsMap.set(c.id, c))
      }

      // Crée une map des events en cache pour cette langue
      const cachedEventsMap = new Map<number, EventEntry>()
      if (cachedData?.data?.data?.events) {
        cachedData.data.data.events.forEach(e => cachedEventsMap.set(e.id, e))
      }

      // Traite les circuits de cette langue
      for (let i = 0; i < freshData.data.data.circuits.length; i++) {
        const circuit = freshData.data.data.circuits[i]
        const isChanged = changes.changedCircuits.some(c => c.id === circuit.id)

        if (isChanged) {
          await this.processCircuitAssets(circuit)
        } else {
          const cachedCircuit = cachedCircuitsMap.get(circuit.id)
          if (cachedCircuit) {
            freshData.data.data.circuits[i] = cachedCircuit
          }
        }
      }

      // Traite les events de cette langue
      for (let i = 0; i < freshData.data.data.events.length; i++) {
        const event = freshData.data.data.events[i]
        const isChanged = changes.changedEvents.some(e => e.id === event.id)

        if (isChanged) {
          await this.processEventAssets(event)
        } else {
          const cachedEvent = cachedEventsMap.get(event.id)
          if (cachedEvent) {
            freshData.data.data.events[i] = cachedEvent
          }
        }
      }
    }

    // Nettoyage global basé sur TOUTES les langues
    await this.cleanupOrphanedAssets(result)

    console.log('✅ Traitement global des assets terminé')
    return result
  }

  /**
   * Ancienne méthode (garde pour compatibilité) - télécharge TOUT
   */
  async downloadAndReplaceUrls(apiData: ApiResponse): Promise<ApiResponse> {
    // Cette méthode n'est plus utilisée pour le cache multi-langues, 
    // mais on la garde pour ne pas casser d'éventuels autres appels.
    // On l'adapte pour qu'elle fonctionne avec un seul objet ApiResponse.
    const wrapped = { [apiData.data.lang]: apiData }
    const result = await this.downloadAndReplaceUrlsOptimized(wrapped, null)
    return result[apiData.data.lang]
  }

  // ============================================
  // NETTOYAGE DES ASSETS ORPHELINS
  // ============================================

  /**
   * Supprime les fichiers assets qui ne sont plus référencés (dans aucune langue)
   */
  private async cleanupOrphanedAssets(
    currentMultiData: any // MultiLanguageData
  ): Promise<void> {
    if (!this.assetsDir) return

    try {
      // Collecte toutes les URLs locales référencées dans TOUTES les langues
      const referencedFiles = new Set<string>()

      for (const locale of Object.keys(currentMultiData)) {
        const apiResponse = currentMultiData[locale] as ApiResponse
        if (apiResponse?.data?.data) {
          this.collectAssetFileNames(apiResponse.data.data, referencedFiles)
        }
      }

      // Liste les fichiers existants
      const existingFiles = await readDir(this.assetsDir)

      // Supprime les fichiers non référencés
      let deletedCount = 0
      for (const file of existingFiles) {
        if (file.isFile && file.name && !referencedFiles.has(file.name)) {
          const filePath = await join(this.assetsDir, file.name)
          await remove(filePath)
          deletedCount++
        }
      }

      if (deletedCount > 0) {
        console.log(`🗑️ ${deletedCount} assets orphelins supprimés`)
      }
    } catch (error) {
      console.error('❌ Erreur nettoyage assets orphelins:', error)
    }
  }

  /**
   * Collecte tous les noms de fichiers référencés dans les données
   */
  private collectAssetFileNames(data: ApiData, fileNames: Set<string>): void {
    // Parcourt les circuits
    for (const circuit of data.circuits || []) {
      if (circuit.image) {
        this.collectImageFileNames(circuit.image, fileNames)
      }
      for (const step of circuit.steps || []) {
        for (const image of step.images || []) {
          this.collectImageFileNames(image, fileNames)
        }
      }
    }

    // Parcourt les events
    for (const event of data.events || []) {
      if ((event as any).image) {
        this.collectImageFileNames((event as any).image, fileNames)
      }
      if (event.main_image) {
        this.collectImageFileNames(event.main_image, fileNames)
      }
      if (event.images) {
        event.images.forEach(img => this.collectImageFileNames(img, fileNames))
      }
    }
  }

  /**
   * Extrait les noms de fichiers d'une image
   */
  private collectImageFileNames(image: Image, fileNames: Set<string>): void {
    if (!image?.images) return

    // Extrait le nom de fichier depuis une URL asset://
    const extractFileName = (url: string | undefined) => {
      if (!url || !url.startsWith('asset://')) return
      const parts = url.split('/')
      const fileName = parts[parts.length - 1]
      if (fileName) fileNames.add(fileName)
    }

    extractFileName(image.images.original?.url)

    if (image.images.optimized?.standard) {
      Object.values(image.images.optimized.standard).forEach(extractFileName)
    }
    if (image.images.optimized?.webp) {
      Object.values(image.images.optimized.webp).forEach(extractFileName)
    }
  }

  // ============================================
  // TRAITEMENT DES ASSETS (méthodes existantes)
  // ============================================

  private async processCircuitAssets(circuit: CircuitEntry): Promise<void> {
    if (circuit.image) {
      await this.downloadAndReplaceImageUrls(circuit.image)
    }

    if (circuit.steps && circuit.steps.length > 0) {
      for (const step of circuit.steps) {
        await this.processStepAssets(step)
      }
    }
  }

  private async processEventAssets(event: EventEntry): Promise<void> {
    if ((event as any).image) {
      await this.downloadAndReplaceImageUrls((event as any).image)
    }
  }

  private async processStepAssets(step: CircuitStep): Promise<void> {
    if (!step.images || step.images.length === 0) return

    for (const image of step.images) {
      await this.downloadAndReplaceImageUrls(image)
    }
  }

  private async downloadAndReplaceImageUrls(image: Image): Promise<void> {
    if (!image?.images) return

    // Original
    if (image.images.original?.url) {
      image.images.original.url = await this.downloadAndGetAssetUrl(image.images.original.url)
    }

    // Optimized standard (jpg/png)
    if (image.images.optimized?.standard) {
      for (const size of Object.keys(image.images.optimized.standard)) {
        const url = image.images.optimized.standard[size as keyof typeof image.images.optimized.standard]
        if (url) {
          (image.images.optimized.standard as Record<string, string>)[size] =
            await this.downloadAndGetAssetUrl(url)
        }
      }
    }

    // Optimized webp
    if (image.images.optimized?.webp) {
      for (const size of Object.keys(image.images.optimized.webp)) {
        const url = image.images.optimized.webp[size as keyof typeof image.images.optimized.webp]
        if (url) {
          (image.images.optimized.webp as Record<string, string>)[size] =
            await this.downloadAndGetAssetUrl(url)
        }
      }
    }
  }

  private async downloadAndGetAssetUrl(url: string): Promise<string> {
    // Si pas de dossier assets ou pas d'URL → retourne l'URL originale
    if (!this.assetsDir || !url) return url

    // Si déjà une URL locale → la retourner
    if (url.startsWith('asset://')) {
      return url
    }

    try {
      const fileName = this.getFileNameFromUrl(url)
      const localPath = await join(this.assetsDir, fileName)

      const fileExists = await exists(localPath)

      if (fileExists) {
        // Fichier en cache → on l'utilise
        console.log('📦 Asset en cache:', fileName)
      } else {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-api-key': getApiKey(),
          ...getAuthHeaders()
        }
        // Pas en cache → on télécharge
        console.log('⬇️ Téléchargement:', fileName)
        const response = await tauriFetch(url, {
          method: 'GET',
          headers
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        await writeFile(localPath, uint8Array)
        console.log('✅ Asset téléchargé:', fileName)
      }

      // Convertit le chemin local en URL asset://
      let assetUrl = convertFileSrc(localPath)
      console.log('🔗 URL brute de convertFileSrc:', assetUrl)
      // Décode l'URL (corrige %2F, %20, etc.)
      assetUrl = decodeURIComponent(assetUrl)

      // Corrige le double slash après localhost
      //assetUrl = assetUrl.replace('asset://localhost//', 'http://localhost:16780/')
      //assetUrl = assetUrl.replace(/([^:])\/\//g, '$1/')
      console.log('assetURL', assetUrl)
      return assetUrl
    } catch (error) {
      // Téléchargement échoué → fallback sur l'URL distante
      // L'image pourra s'afficher si l'utilisateur est en ligne
      console.warn('⚠️ Téléchargement échoué, fallback URL distante:', url, error)
      return url
    }
  }

  private getFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const fileName = pathname.split('/').pop() || 'unknown'
      const hash = this.simpleHash(pathname)
      const extension = fileName.split('.').pop() || 'jpg'
      return `${hash}.${extension}`
    } catch {
      const hash = this.simpleHash(url)
      return `asset-${hash}.jpg`
    }
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }

  // ============================================
  // UTILITAIRES
  // ============================================

  async clearAssets(): Promise<void> {
    if (!this.enableCache || !this.isTauriEnvironment) return

    try {
      const cacheDir = await appCacheDir()
      const assetsPath = await join(cacheDir, ASSETS_DIR)

      if (await exists(assetsPath)) {
        await remove(assetsPath, { recursive: true })
        await mkdir(assetsPath, { recursive: true })
        console.log('🗑️ Assets nettoyés')
      }
    } catch (error) {
      console.error('❌ Erreur nettoyage assets:', error)
    }
  }

  isAvailable(): boolean {
    return this.enableCache && this.isTauriEnvironment
  }
}

export const assetsService = new AssetsService()
