import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DEFAULT_LOCALE, AVAILABLE_LOCALES } from 'config'
import i18n from './index'

/**
 * Store pour la gestion de la langue
 */
export const useI18nStore = defineStore('i18n', () => {
  // State
  const currentLocale = ref<LocaleKey>(DEFAULT_LOCALE)

  // Getters
  const locale = computed(() => currentLocale.value.toLowerCase() as LocaleKey)
  const availableLocales = computed(() => AVAILABLE_LOCALES)

  // Actions
  function setLocale(locale: LocaleKey) {
    const targetLocale = locale.toLowerCase() as LocaleKey
    if (AVAILABLE_LOCALES.includes(targetLocale)) {
      currentLocale.value = targetLocale

      // Met à jour l'instance globale i18n
      if (i18n.global.locale.value) {
        (i18n.global.locale.value as any) = targetLocale
      } else {
        (i18n.global.locale as any) = targetLocale
      }

      // Sauvegarde dans localStorage pour persistance
      localStorage.setItem('locale', targetLocale)
    }
  }

  function initLocale() {
    // Récupère la locale sauvegardée ou utilise la locale par défaut
    const savedLocale = localStorage.getItem('locale') as LocaleKey | null
    if (savedLocale && AVAILABLE_LOCALES.includes(savedLocale)) {
      const targetLocale = savedLocale.toLowerCase() as LocaleKey
      currentLocale.value = targetLocale

      // Met à jour l'instance globale i18n
      if (i18n.global.locale.value) {
        (i18n.global.locale.value as any) = targetLocale
      } else {
        (i18n.global.locale as any) = targetLocale
      }
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


