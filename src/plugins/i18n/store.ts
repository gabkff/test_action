import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LocaleKey } from './index'
import { DEFAULT_LOCALE, AVAILABLE_LOCALES } from 'config'

/**
 * Store pour la gestion de la langue
 */
export const useI18nStore = defineStore('i18n', () => {
  // State
  const currentLocale = ref<LocaleKey>(DEFAULT_LOCALE)
  
  // Getters
  const locale = computed(() => currentLocale.value)
  const availableLocales = computed(() => AVAILABLE_LOCALES)
  
  // Actions
  function setLocale(locale: LocaleKey) {
    if (AVAILABLE_LOCALES.includes(locale)) {
      currentLocale.value = locale
      // Sauvegarde dans localStorage pour persistance
      localStorage.setItem('locale', locale)
    }
  }
  
  function initLocale() {
    // Récupère la locale sauvegardée ou utilise la locale par défaut
    const savedLocale = localStorage.getItem('locale') as LocaleKey | null
    if (savedLocale && AVAILABLE_LOCALES.includes(savedLocale)) {
      currentLocale.value = savedLocale
    }
  }
  
  return {
    // State
    currentLocale,
    // Getters
    locale,
    availableLocales,
    // Actions
    setLocale,
    initLocale,
  }
})

// Export pour compatibilité avec l'ancien code
export const store = {
  setLocaleByName: (locale: string) => {
    const i18nStore = useI18nStore()
    i18nStore.setLocale(locale as LocaleKey)
  }
}

