import { apiService } from 'plugins/api'
import { assetsService } from 'plugins/api/assets.service'
import { cacheService } from 'plugins/api/cache.service'

import { store as appStore } from 'plugins/store/app'
import { appConfig } from 'config'

let refreshInterval: number | null = null

/**
 * Démarre le rafraîchissement périodique des données (mode borne uniquement)
 */
export function startPeriodicRefresh() {
  // Ne fonctionne qu'en mode borne
  if (appConfig.mode !== 'kiosk' || !appConfig.enableCache) {
    console.log('ℹ️ Rafraîchissement périodique désactivé (mode iPad ou cache désactivé)')
    return
  }

  const interval = appConfig.refreshInterval || 300000 // 5 minutes par défaut
  console.log(`🔄 Démarrage du rafraîchissement périodique (${interval / 1000}s)`)

  refreshInterval = window.setInterval(async () => {
    try {
      console.log('🔄 Rafraîchissement automatique des données...')

      // Récupère les données en cache pour comparaison
      const cachedData = await cacheService.readDataFromFile()

      // Récupère les nouvelles données depuis l'API
      const freshData = await apiService.refresh()

      // Télécharge UNIQUEMENT les assets des éléments modifiés
      const dataWithLocalAssets = await assetsService.downloadAndReplaceUrlsOptimized(
        freshData,
        cachedData
      )

      // Met à jour le store
      appStore.setApiData(dataWithLocalAssets)
      
      // Sauvegarde dans le cache
      await cacheService.writeDataToFile(dataWithLocalAssets)

      console.log('✅ Rafraîchissement automatique terminé')
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement automatique:', error)
    }
  }, interval)
}

/**
 * Arrête le rafraîchissement périodique
 */
export function stopPeriodicRefresh() {
  if (refreshInterval !== null) {
    clearInterval(refreshInterval)
    refreshInterval = null
    console.log('⏹️ Rafraîchissement périodique arrêté')
  }
}
