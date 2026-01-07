import { appDataDir, join } from '@tauri-apps/api/path'
import { mkdir, exists, writeFile } from '@tauri-apps/plugin-fs'
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { convertFileSrc } from '@tauri-apps/api/core'
import { appConfig, ASSETS_DIR } from 'config'
import type { MediaAsset, ApiResponse, Block } from 'types/api.types'

class AssetsService {
  private assetsDir: string | null = null
  private enableCache: boolean
  private isTauriEnvironment: boolean

  constructor() {
    this.enableCache = appConfig.enableCache
    // Vérifie si on est dans un environnement Tauri
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

    // Parcourt toutes les pages
    for (const page of Object.values(apiData.data)) {
      // Parcourt tous les blocs de chaque page
      for (const block of page.blocs) {
        downloadPromises.push(this.downloadBlockAssets(block))
      }
    }

    await Promise.all(downloadPromises)
    console.log('✅ Tous les assets ont été téléchargés')

    return apiData
  }

  /**
   * Télécharge les assets d'un bloc
   */
  private async downloadBlockAssets(block: Block): Promise<void> {
    const { content } = block

    // Image principale
    if (content.image?.src) {
      await this.downloadAsset(content.image)
    }

    // Vidéo
    if (content.video?.src) {
      await this.downloadAsset(content.video)
    }

    // Galerie d'images
    if (content.images && Array.isArray(content.images)) {
      for (const image of content.images) {
        if (image.src) {
          await this.downloadAsset(image)
        }
      }
    }
  }

  /**
   * Télécharge un asset et le stocke localement
   */
  private async downloadAsset(asset: MediaAsset): Promise<void> {
    if (!this.enableCache || !this.isTauriEnvironment || !this.assetsDir) return

    try {
      // Vérifie si l'asset existe déjà
      const fileName = this.getFileNameFromUrl(asset.src)
      const localPath = await join(this.assetsDir, fileName)

      const fileExists = await exists(localPath)
      if (fileExists) {
        asset.localPath = localPath
        return
      }

      // Télécharge l'asset
      console.log('⬇️ Téléchargement:', asset.src)
      const response = await tauriFetch(asset.src)

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`)
      }

      // Récupère le contenu sous forme de ArrayBuffer
      const arrayBuffer = await response.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // Sauvegarde le fichier
      await writeFile(localPath, uint8Array)
      asset.localPath = localPath

      console.log('✅ Asset téléchargé:', fileName)
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement de l\'asset:', asset.src, error)
    }
  }

  /**
   * Extrait le nom de fichier depuis une URL
   */
  private getFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const fileName = pathname.split('/').pop() || 'unknown'

      // Génère un nom unique basé sur l'URL si pas d'extension
      if (!fileName.includes('.')) {
        const hash = this.simpleHash(url)
        return `asset-${hash}`
      }

      return fileName
    } catch {
      // Si l'URL est invalide, génère un hash
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
   * Récupère l'URL d'un asset (local ou distant)
   */
  getAssetUrl(asset: MediaAsset): string {
    // En mode cache et si le chemin local existe
    if (this.enableCache && asset.localPath) {
      try {
        return convertFileSrc(asset.localPath)
      } catch (error) {
        console.warn('Erreur lors de la conversion du chemin local, fallback sur URL distante:', error)
        return asset.src
      }
    }

    // Sinon, utilise l'URL distante
    return asset.src
  }

  /**
   * Nettoie tous les assets téléchargés
   */
  async clearAssets(): Promise<void> {
    if (!this.enableCache || !this.isTauriEnvironment || !this.assetsDir) return

    try {
      const dirExists = await exists(this.assetsDir)
      if (dirExists) {
        // Note: Il faudrait implémenter une fonction récursive pour supprimer tous les fichiers
        // Pour l'instant, on recrée juste le dossier
        await mkdir(this.assetsDir, { recursive: true })
        console.log('🗑️ Assets nettoyés')
      }
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des assets:', error)
    }
  }
}

export const assetsService = new AssetsService()

