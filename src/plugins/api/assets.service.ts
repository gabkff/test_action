import { appDataDir, join } from '@tauri-apps/api/path'
import { mkdir, exists, writeFile, remove, readDir } from '@tauri-apps/plugin-fs'
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { convertFileSrc } from '@tauri-apps/api/core'
import { appConfig } from 'config'
import { getAuthHeaders } from 'utils/helpers'
import type { ApiResponse, ApiData, CircuitEntry, CircuitStep, EventEntry } from 'types/api.types'

// Constantes pour le dossier cache
const CACHE_DIR = 'cache'
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
      const appDir = await appDataDir()
      this.assetsDir = await join(appDir, CACHE_DIR, ASSETS_DIR)

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
   * et fusionne avec les données en cache
   */
  async downloadAndReplaceUrlsOptimized(
    freshData: ApiResponse,
    cachedData: ApiResponse | null
  ): Promise<ApiResponse> {
    if (!this.enableCache || !this.isTauriEnvironment) {
      return freshData
    }

    await this.init()

    if (!this.assetsDir) {
      console.warn('⚠️ Dossier assets non initialisé')
      return freshData
    }

    // Compare les données
    const cachedApiData = cachedData?.data?.data || null
    const changes = this.compareData(freshData.data.data, cachedApiData)

    // Si aucun changement, retourne le cache tel quel
    if (!changes.hasChanges && cachedData) {
      console.log('✨ Aucun changement détecté, utilisation du cache')
      return cachedData
    }

    console.log('⬇️ Téléchargement des assets pour les éléments modifiés...')

    // Clone les données fraîches
    const result = JSON.parse(JSON.stringify(freshData)) as ApiResponse

    // Crée une map des circuits en cache (avec URLs locales)
    const cachedCircuitsMap = new Map<number, CircuitEntry>()
    if (cachedData?.data?.data?.circuits) {
      cachedData.data.data.circuits.forEach(c => cachedCircuitsMap.set(c.id, c))
    }

    // Crée une map des events en cache
    const cachedEventsMap = new Map<number, EventEntry>()
    if (cachedData?.data?.data?.events) {
      cachedData.data.data.events.forEach(e => cachedEventsMap.set(e.id, e))
    }

    // Traite les circuits
    for (let i = 0; i < result.data.data.circuits.length; i++) {
      const circuit = result.data.data.circuits[i]
      const isChanged = changes.changedCircuits.some(c => c.id === circuit.id)

      if (isChanged) {
        // Circuit modifié → télécharge ses assets
        await this.processCircuitAssets(circuit)
      } else {
        // Circuit non modifié → récupère du cache (URLs déjà locales)
        const cachedCircuit = cachedCircuitsMap.get(circuit.id)
        if (cachedCircuit) {
          result.data.data.circuits[i] = cachedCircuit
        }
      }
    }

    // Traite les events
    for (let i = 0; i < result.data.data.events.length; i++) {
      const event = result.data.data.events[i]
      const isChanged = changes.changedEvents.some(e => e.id === event.id)

      if (isChanged) {
        await this.processEventAssets(event)
      } else {
        const cachedEvent = cachedEventsMap.get(event.id)
        if (cachedEvent) {
          result.data.data.events[i] = cachedEvent
        }
      }
    }

    // Nettoie les assets des éléments supprimés
    if (changes.removedCircuitIds.length > 0 || changes.removedEventIds.length > 0) {
      await this.cleanupOrphanedAssets(result, cachedData)
    }

    console.log('✅ Traitement des assets terminé')
    return result
  }

  /**
   * Ancienne méthode (garde pour compatibilité) - télécharge TOUT
   */
  async downloadAndReplaceUrls(apiData: ApiResponse): Promise<ApiResponse> {
    return this.downloadAndReplaceUrlsOptimized(apiData, null)
  }

  // ============================================
  // NETTOYAGE DES ASSETS ORPHELINS
  // ============================================

  /**
   * Supprime les fichiers assets qui ne sont plus référencés
   */
  private async cleanupOrphanedAssets(
    currentData: ApiResponse,
    oldData: ApiResponse | null
  ): Promise<void> {
    if (!this.assetsDir || !oldData) return

    try {
      // Collecte toutes les URLs locales référencées dans les nouvelles données
      const referencedFiles = new Set<string>()
      this.collectAssetFileNames(currentData.data.data, referencedFiles)

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
        // Pas en cache → on télécharge
        console.log('⬇️ Téléchargement:', fileName)
        const response = await tauriFetch(url, {
          method: 'GET',
          headers: getAuthHeaders()
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
      if (assetUrl.includes('%2F')) {
        assetUrl = assetUrl.replace(/%2F/g, '/')
      }

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
      const appDir = await appDataDir()
      const assetsPath = await join(appDir, CACHE_DIR, ASSETS_DIR)

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
