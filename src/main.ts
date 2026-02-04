/**
 * Point d'entrée de l'application
 * 
 * Configure et monte l'application Vue avec tous les plugins :
 * - Pinia (state management)
 * - Vue Router
 * - Vue i18n (internationalisation)
 * - VueUse Head (meta tags)
 * - UiKit (composants globaux)
 */

import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import TheApp from 'components/TheApp.vue'
import { pinia } from 'plugins/store'
import i18n from 'plugins/i18n'
import router from 'router'
import installUiKit from 'components/UiKit'
import { startPeriodicRefresh } from 'utils/refresh'

// Import des styles globaux
import 'assets/styles/index.styl'

/**
 * Initialisation de l'application
 */
async function setup() {
  // Création des plugins
  const head = createHead()

  // Création de l'application
  const app = createApp(TheApp)
    .use(pinia)
    .use(router)
    .use(i18n)
    .use(head)

  // Installation du UiKit (composants globaux)
  installUiKit(app)

  // Monte l'application
  app.mount('#app')

  // Démarre le rafraîchissement périodique pour les bornes (mode kiosk uniquement)
  startPeriodicRefresh()

  // Configuration en mode dev
  if (import.meta.env.DEV) {
    console.log('🚀 Application démarrée en mode développement')
    console.log('📦 Plugins chargés: Pinia, Router, i18n, Head, UiKit')
  }
}

// Lance l'application
setup()
