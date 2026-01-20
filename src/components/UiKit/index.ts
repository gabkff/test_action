/**
 * UiKit - Système de composants réutilisables
 * 
 * Ce fichier permet d'enregistrer globalement les composants
 * du UiKit dans l'application Vue.
 * 
 * Note: Tous les composants sont importés de manière synchrone
 * pour garantir le fonctionnement hors ligne (kiosk/borne).
 */

import type { App, Component } from 'vue'

// Import synchrone de TOUS les composants (pas de lazy loading)
// Garantit le fonctionnement hors ligne
import UiAnimation from './Animation/index.vue'
import UiButton from './Button/index.vue'
import UiPicture from './Picture/index.vue'
import UiAccordions from './Accordions/Items.vue'
import UiAccordionsItem from './Accordions/Item.vue'
import UiWysiwyg from './Wysiwyg/index.vue'
import UiVideo from './Video/index.vue'
import UiSwiper from './Swiper/index.vue'

// Tous les composants enregistrés globalement
const components: Record<string, Component> = {
  'ui-animation': UiAnimation,
  'ui-button': UiButton,
  'ui-picture': UiPicture,
  'ui-accordions': UiAccordions,
  'ui-accordions-item': UiAccordionsItem,
  'ui-wysiwyg': UiWysiwyg,
  'ui-video': UiVideo,
  'ui-swiper': UiSwiper,
}

/**
 * Installe les composants UiKit globalement
 */
export function installUiKit(app: App): void {
  Object.entries(components).forEach(([name, component]) => {
    app.component(name, component)
  })
  console.log('📦 UiKit installé avec', Object.keys(components).length, 'composants')
}

export default installUiKit

// Export des composants individuels pour usage direct
export {
  UiAnimation,
  UiButton,
  UiPicture,
  UiAccordions,
  UiAccordionsItem,
  UiWysiwyg,
  UiVideo,
}
