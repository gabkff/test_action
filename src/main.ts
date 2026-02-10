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
import { startKioskInactivityTimer } from 'utils/kioskInactivity'
import { initApiSite } from 'plugins/api/apiSite'
import { initRuntimeConfig } from 'config/runtimeConfig'

// Import des styles globaux
import 'assets/styles/index.styl'

/**
 * Initialisation de l'application
 */
async function setup() {
  // Charge le site API depuis site-config.md (mode kiosk uniquement)
  await initApiSite()
  // Surcharge optionnelle depuis app-config.json (mode kiosk uniquement)
  await initRuntimeConfig()

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

  // Timer d'inactivité : retour à la home après 5 min sans interaction (mode kiosk uniquement)
  startKioskInactivityTimer(router)

  // Configuration en mode dev
  if (import.meta.env.DEV) {
    console.log('🚀 Application démarrée en mode développement')
    console.log('📦 Plugins chargés')
  }
  // prevent right click
  window.addEventListener('contextmenu', (e) => {
    //e.preventDefault();
    console.log('right click disabled a decommenter')
  });
}

// Lance l'application
setup()
