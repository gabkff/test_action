import { apiService } from 'plugins/api'
import { assetsService } from 'plugins/api/assets.service'
import { useAppStore } from 'store/app'
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
      const store = useAppStore()

      // Récupère les nouvelles données
      const data = await apiService.refresh()

      // Met à jour le store
      store.setApiData(data)

      // Télécharge les nouveaux assets
      await assetsService.downloadAllAssets(data)

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
