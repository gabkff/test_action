import type { ApiResponse } from 'types/api.types'
import { CACHE_DB_NAME, CACHE_VERSION } from 'config'

// Service de cache utilisant IndexedDB pour les métadonnées
class CacheService {
  private dbName = CACHE_DB_NAME
  private storeName = 'api-cache'
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' })
        }
      }
    })
  }

  async set(key: string, value: unknown): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put({
        key,
        value,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      })

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async get(key: string): Promise<unknown | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.value : null)
      }
    })
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  // Sauvegarde les données de l'API
  async saveApiData(data: ApiResponse): Promise<void> {
    await this.set('api-data', data)
  }

  // Récupère les données de l'API
  async getApiData(): Promise<ApiResponse | null> {
    return await this.get('api-data') as ApiResponse | null
  }
}

export const cacheService = new CacheService()

