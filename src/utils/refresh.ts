import { apiService } from 'plugins/api'
import { assetsService } from 'plugins/api/assets.service'
import { cacheService, type MultiLanguageData } from 'plugins/api/cache.service'
import { store as appStore } from 'plugins/store/app'
import { appConfig, AVAILABLE_LOCALES } from 'config'

let refreshInterval: number | null = null

/**
 * Démarre le rafraîchissement périodique des données (mode borne uniquement)
 * 
 * Cette fonction :
 * 1. Récupère les données pour TOUTES les langues depuis l'API
 * 2. Compare avec le cache pour ne télécharger que les assets modifiés
 * 3. Met à jour le store et le cache fichier
 */
export function startPeriodicRefresh(): void {
  // Ne fonctionne qu'en mode borne avec cache activé
  if (appConfig.mode !== 'kiosk' || !appConfig.enableCache) {
    console.log('ℹ️ Rafraîchissement périodique désactivé (mode iPad ou cache désactivé)')
    return
  }

  const interval = appConfig.refreshInterval || 300000 // 5 minutes par défaut
  console.log(`🔄 Démarrage du rafraîchissement périodique (${interval / 1000}s)`)

  refreshInterval = window.setInterval(async () => {
    await refreshData()
  }, interval)
}

/**
 * Effectue le rafraîchissement des données
 * Peut être appelée manuellement ou par le timer périodique
 */
export async function refreshData(): Promise<void> {
  try {
    console.log('🔄 Rafraîchissement automatique des données...')

    const locales = AVAILABLE_LOCALES || ['fr', 'en']

    // 1. Récupère les données en cache pour comparaison
    const cachedMultiData = await cacheService.readDataFromFile()

    // 2. Récupère les nouvelles données depuis l'API pour TOUTES les langues
    const freshMultiData: Record<string, ApiResponse> = {}
    for (const locale of locales) {
      freshMultiData[locale] = await apiService.fetchData(locale)
    }

    // 3. Télécharge UNIQUEMENT les assets des éléments modifiés
    //    et fusionne avec le cache existant (gère toutes les langues)
    const dataWithLocalAssets = await assetsService.downloadAndReplaceUrlsOptimized(
      freshMultiData,
      cachedMultiData
    )

    // 4. Met à jour le store pour CHAQUE langue
    Object.keys(dataWithLocalAssets).forEach(locale => {
      appStore.setApiData(dataWithLocalAssets[locale], locale)
    })

    // 5. Sauvegarde dans le cache
    await cacheService.writeDataToFile(dataWithLocalAssets as MultiLanguageData)

    console.log('✅ Rafraîchissement automatique terminé')
  } catch (error) {
    console.error('❌ Erreur lors du rafraîchissement automatique:', error)
  }
}

/**
 * Arrête le rafraîchissement périodique
 */
export function stopPeriodicRefresh(): void {
  if (refreshInterval !== null) {
    clearInterval(refreshInterval)
    refreshInterval = null
    console.log('⏹️ Rafraîchissement périodique arrêté')
  }
}
