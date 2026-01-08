import { appCacheDir, join } from '@tauri-apps/api/path'
import { readTextFile, writeTextFile, exists, mkdir, remove } from '@tauri-apps/plugin-fs'
import type { ApiResponse } from 'types/api.types'

const DATA_FILE = 'data.json'

/**
 * Service de cache utilisant le système de fichiers (Tauri)
 * Stocke les données API dans appCacheDir/data.json
 * - macOS: ~/Library/Caches/com.tcn.app/
 * - Windows: C:\Users\User\AppData\Local\com.tcn.app\
 */
class CacheService {

  /** Chemin complet vers le dossier cache */
  private async getCacheDir(): Promise<string> {
    return await appCacheDir()
  }

  /** Chemin complet vers le fichier data.json */
  private async getDataFilePath(): Promise<string> {
    const cacheDir = await this.getCacheDir()
    return await join(cacheDir, DATA_FILE)
  }

  /** Lit les données depuis le fichier data.json */
  async readDataFromFile(): Promise<ApiResponse | null> {
    try {
      const filePath = await this.getDataFilePath()
      
      if (!await exists(filePath)) {
        console.log('📂 Aucun fichier cache trouvé')
        return null
      }
      
      const content = await readTextFile(filePath)
      const data = JSON.parse(content) as ApiResponse
      console.log('📂 Données chargées depuis le fichier cache')
      return data
    } catch (error) {
      console.error('❌ Erreur lecture fichier cache:', error)
      return null
    }
  }

  /** Écrit les données dans le fichier data.json */
  async writeDataToFile(data: ApiResponse): Promise<void> {
    try {
      const cacheDir = await this.getCacheDir()
      
      // Créer le dossier cache s'il n'existe pas
      if (!await exists(cacheDir)) {
        await mkdir(cacheDir, { recursive: true })
      }
      
      const filePath = await this.getDataFilePath()
      await writeTextFile(filePath, JSON.stringify(data, null, 2))
      console.log('💾 Données sauvegardées dans le fichier cache')
    } catch (error) {
      console.error('❌ Erreur écriture fichier cache:', error)
    }
  }

  /** Vérifie si un fichier cache existe */
  async hasCache(): Promise<boolean> {
    try {
      const filePath = await this.getDataFilePath()
      return await exists(filePath)
    } catch {
      return false
    }
  }

  /** Supprime le fichier cache */
  async clear(): Promise<void> {
    try {
      const filePath = await this.getDataFilePath()
      if (await exists(filePath)) {
        await remove(filePath)
        console.log('🗑️ Cache supprimé')
      }
    } catch (error) {
      console.error('❌ Erreur suppression cache:', error)
    }
  }

  /** Supprime tout le dossier cache (données + assets) */
  async clearAll(): Promise<void> {
    try {
      const cacheDir = await this.getCacheDir()
      if (await exists(cacheDir)) {
        await remove(cacheDir, { recursive: true })
        console.log('🗑️ Dossier cache entièrement supprimé')
      }
    } catch (error) {
      console.error('❌ Erreur suppression dossier cache:', error)
    }
  }
}

export const cacheService = new CacheService()