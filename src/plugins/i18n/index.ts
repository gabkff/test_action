/**
 * Plugin Vue i18n - Internationalisation
 * 
 * Configure et exporte l'instance vue-i18n pour
 * gérer les traductions de l'application.
 */

import { createI18n } from 'vue-i18n'
import { DEFAULT_LOCALE, AVAILABLE_LOCALES } from 'config'

// Import des fichiers de traduction
import fr from './locales/fr.json'
import en from './locales/en.json'

export type LocaleKey = typeof AVAILABLE_LOCALES[number]

// Messages de traduction
const messages = {
  fr,
  en,
}

// Création de l'instance i18n
const i18n = createI18n({
  legacy: false, // Utilise la Composition API
  locale: DEFAULT_LOCALE,
  fallbackLocale: 'fr',
  messages,
  // Options supplémentaires
  missingWarn: false,
  fallbackWarn: false,
})

export default i18n

// Export du composable pour un accès facile
export { useI18n } from 'vue-i18n'

