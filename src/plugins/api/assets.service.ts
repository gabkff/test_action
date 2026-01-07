import { appDataDir, join } from '@tauri-apps/api/path'
import { mkdir, exists, writeFile } from '@tauri-apps/plugin-fs'
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { convertFileSrc } from '@tauri-apps/api/core'
import { appConfig, ASSETS_DIR } from 'config'
import type { ApiResponse, CircuitEntry, CircuitStep } from 'types/api.types'

/**
 * Service de gestion des assets (images/vidéos)
 * 
 * Télécharge et stocke localement les assets pour le mode kiosk/borne.
 * Utilise le système de fichiers Tauri pour le stockage.
 */
class AssetsService {
  private assetsDir: string | null = null
  private enableCache: boolean
  private isTauriEnvironment: boolean
  /** Map des URLs distantes vers les chemins locaux */
  private localPathsMap: Map<string, string> = new Map()

  constructor() {
    this.enableCache = appConfig.enableCache
    this.isTauriEnvironment = typeof window !== 'undefined' && '__TAURI__' in window
  }

  /**
   * Initialise le répertoire des assets
   */
  async init(): Promise<void> {
    if (!this.enableCache || !this.isTauriEnvironment) {
      if (!this.isTauriEnvironment) {
        console.log('⚠️ APIs Tauri non disponibles (navigateur). Mode assets désactivé.')
      }
      return
    }

    const appDir = await appDataDir()
    this.assetsDir = await join(appDir, ASSETS_DIR)

    const dirExists = await exists(this.assetsDir)
    if (!dirExists) {
      await mkdir(this.assetsDir, { recursive: true })
      console.log('📁 Répertoire des assets créé:', this.assetsDir)
    }
  }

  /**
   * Télécharge et stocke tous les assets d'une réponse API
   */
  async downloadAllAssets(apiData: ApiResponse): Promise<ApiResponse> {
    if (!this.enableCache || !this.isTauriEnvironment) return apiData

    console.log('⬇️ Début du téléchargement des assets...')
    const downloadPromises: Promise<void>[] = []

    // Parcourt les circuits
    if (apiData.data.circuits) {
      for (const circuit of apiData.data.circuits) {
        downloadPromises.push(this.downloadCircuitAssets(circuit))
      }
    }

    await Promise.all(downloadPromises)
    console.log('✅ Tous les assets ont été téléchargés')

    return apiData
  }

  /**
   * Télécharge les assets d'un circuit (image principale + images des étapes)
   */
  private async downloadCircuitAssets(circuit: CircuitEntry): Promise<void> {
    const promises: Promise<void>[] = []

    // Image principale du circuit
    if (circuit.image) {
      promises.push(this.downloadImage(circuit.image))
    }

    // Images des étapes
    if (circuit.steps && circuit.steps.length > 0) {
      for (const step of circuit.steps) {
        promises.push(this.downloadStepAssets(step))
      }
    }

    await Promise.all(promises)
  }

  /**
   * Télécharge les assets d'une étape de circuit
   */
  private async downloadStepAssets(step: CircuitStep): Promise<void> {
    if (!step.images || step.images.length === 0) return

    const promises = step.images.map(image => this.downloadImage(image))
    await Promise.all(promises)
  }

  /**
   * Télécharge une image (toutes ses variantes)
   * Structure Image: { meta, images: { optimized, original, focalPoint } }
   */
  private async downloadImage(image: Image): Promise<void> {
    if (!image?.images) return

    const promises: Promise<void>[] = []

    // Télécharge l'image originale
    if (image.images.original?.url) {
      promises.push(this.downloadAsset(image.images.original.url))
    }

    // Télécharge les versions optimisées (standard)
    if (image.images.optimized?.standard) {
      for (const url of Object.values(image.images.optimized.standard)) {
        if (url) promises.push(this.downloadAsset(url))
      }
    }

    // Télécharge les versions WebP
    if (image.images.optimized?.webp) {
      for (const url of Object.values(image.images.optimized.webp)) {
        if (url) promises.push(this.downloadAsset(url))
      }
    }

    await Promise.all(promises)
  }

  /**
   * Télécharge un asset depuis une URL et le stocke localement
   */
  private async downloadAsset(url: string): Promise<void> {
    if (!this.enableCache || !this.isTauriEnvironment || !this.assetsDir || !url) return

    try {
      // Vérifie si l'asset a déjà été téléchargé
      if (this.localPathsMap.has(url)) {
        return
      }

      const fileName = this.getFileNameFromUrl(url)
      const localPath = await join(this.assetsDir, fileName)

      // Vérifie si le fichier existe déjà sur le disque
      const fileExists = await exists(localPath)
      if (fileExists) {
        this.localPathsMap.set(url, localPath)
        return
      }

      // Télécharge l'asset
      console.log('⬇️ Téléchargement:', url)
      const response = await tauriFetch(url)

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`)
      }

      // Récupère le contenu sous forme de ArrayBuffer
      const arrayBuffer = await response.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // Sauvegarde le fichier
      await writeFile(localPath, uint8Array)
      this.localPathsMap.set(url, localPath)

      console.log('✅ Asset téléchargé:', fileName)
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement de l\'asset:', url, error)
    }
  }

  /**
   * Extrait le nom de fichier depuis une URL
   */
  private getFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      
      // Extrait le nom de fichier et nettoie les paramètres de transformation
      let fileName = pathname.split('/').pop() || 'unknown'
      
      // Si le chemin contient des infos de transformation (ex: _576x432_crop_...)
      // on les inclut pour différencier les tailles
      const pathParts = pathname.split('/')
      const transformPart = pathParts.find(part => part.startsWith('_') && part.includes('x'))
      
      if (transformPart && fileName) {
        // Crée un nom unique basé sur la transformation + nom de fichier
        const hash = this.simpleHash(pathname)
        const extension = fileName.split('.').pop() || 'jpg'
        return `${hash}.${extension}`
      }

      // Si pas d'extension, génère un hash
      if (!fileName.includes('.')) {
        const hash = this.simpleHash(url)
        return `asset-${hash}`
      }

      // Pour les fichiers originaux, utilise un hash pour éviter les conflits
      const hash = this.simpleHash(url)
      const extension = fileName.split('.').pop() || 'jpg'
      return `${hash}.${extension}`
    } catch {
      const hash = this.simpleHash(url)
      return `asset-${hash}`
    }
  }

  /**
   * Hash simple pour générer des noms de fichiers uniques
   */
  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Récupère l'URL locale d'un asset (ou l'URL distante si non caché)
   * @param url - L'URL distante de l'asset
   */
  getLocalUrl(url: string): string {
    if (!this.enableCache || !url) return url

    const localPath = this.localPathsMap.get(url)
    if (localPath) {
      try {
        return convertFileSrc(localPath)
      } catch (error) {
        console.warn('Erreur lors de la conversion du chemin local:', error)
        return url
      }
    }

    return url
  }

  /**
   * Récupère la meilleure URL pour une image selon le contexte
   * Préfère WebP si disponible, sinon standard, sinon original
   * @param image - L'objet Image complet
   * @param preferredSize - Taille préférée ('576' ou '768')
   */
  getImageUrl(image: Image | null | undefined, preferredSize: '576' | '768' = '768'): string {
    if (!image?.images) return ''

    // Essaie d'abord WebP (meilleure compression)
    const webpUrl = image.images.optimized?.webp?.[preferredSize]
    if (webpUrl) {
      return this.getLocalUrl(webpUrl)
    }

    // Sinon standard optimisé
    const standardUrl = image.images.optimized?.standard?.[preferredSize]
    if (standardUrl) {
      return this.getLocalUrl(standardUrl)
    }

    // Sinon original
    const originalUrl = image.images.original?.url
    if (originalUrl) {
      return this.getLocalUrl(originalUrl)
    }

    return ''
  }

  /**
   * Récupère l'URL originale d'une image
   */
  getOriginalUrl(image: Image | null | undefined): string {
    if (!image?.images?.original?.url) return ''
    return this.getLocalUrl(image.images.original.url)
  }

  /**
   * Nettoie tous les assets téléchargés
   */
  async clearAssets(): Promise<void> {
    if (!this.enableCache || !this.isTauriEnvironment || !this.assetsDir) return

    try {
      const dirExists = await exists(this.assetsDir)
      if (dirExists) {
        // Recrée le dossier vide
        await mkdir(this.assetsDir, { recursive: true })
        this.localPathsMap.clear()
        console.log('🗑️ Assets nettoyés')
      }
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des assets:', error)
    }
  }
}

export const assetsService = new AssetsService()
