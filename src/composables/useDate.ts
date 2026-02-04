/**
 * Composable useDate
 * 
 * Fonctions utilitaires pour le formatage des dates
 * selon la locale de l'application.
 */

import { computed } from 'vue'
import { useI18nStore } from 'plugins/i18n/store'

/**
 * Retourne le début du jour (minuit) pour une date donnée
 */
export function getStartOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Retourne la fin du jour (23:59:59) pour une date donnée
 */
export function getEndOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Composable pour le formatage des dates
 */
export function useDate() {
  const i18nStore = useI18nStore()

  /**
   * Locale formatée pour toLocaleDateString (ex: 'fr-CA', 'en-CA')
   */
  const localeCode = computed(() => `${i18nStore.locale}-CA`)

  /**
   * Formate une date en jour de la semaine + date/mois
   * @param date - Date à formater
   * @returns { weekday: 'lundi', dateMonth: '15 janvier' }
   */
  function formatDate(date: Date): { weekday: string; dateMonth: string } {
    const weekday = date.toLocaleDateString(localeCode.value, { weekday: 'long' })
    const dateMonth = date.toLocaleDateString(localeCode.value, { day: 'numeric', month: 'long' })
    return { weekday, dateMonth }
  }

  /**
   * Formate une date complète avec l'année
   * @param date - Date à formater
   * @returns '15 janvier 2024'
   */
  function formatFullDate(date: Date): string {
    return date.toLocaleDateString(localeCode.value, { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  /**
   * Formate une date courte
   * @param date - Date à formater
   * @returns '15 janv. 2024'
   */
  function formatShortDate(date: Date): string {
    return date.toLocaleDateString(localeCode.value, { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  /**
   * Formate une date pour l'affichage des événements
   * Retourne jour de semaine + date/mois, avec première lettre en majuscule
   * @param timestamp - Timestamp en secondes
   * @returns 'Lundi 15 janvier'
   */
  function formatEventDate(timestamp: number): string {
    const date = new Date(timestamp * 1000)
    const formatted = date.toLocaleDateString(localeCode.value, { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    })
    // Première lettre en majuscule
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  /**
   * Vérifie si une date est aujourd'hui
   * @param date - Date à vérifier
   * @returns true si c'est aujourd'hui
   */
  function isToday(date: Date): boolean {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  /**
   * Vérifie si un timestamp (en secondes) correspond à aujourd'hui
   * @param timestamp - Timestamp en secondes
   * @returns true si c'est aujourd'hui
   */
  function isTodayTimestamp(timestamp: number): boolean {
    return isToday(new Date(timestamp * 1000))
  }

  /**
   * Génère les N prochains jours avec leur format
   * @param count - Nombre de jours à générer (défaut: 5)
   * @returns Array de { timestamp, weekday, dateMonth }
   */
  function getNextDays(count: number = 5): Array<{ timestamp: number; weekday: string; dateMonth: string }> {
    const days: Array<{ timestamp: number; weekday: string; dateMonth: string }> = []
    const today = getStartOfDay(new Date())

    for (let i = 0; i < count; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const { weekday, dateMonth } = formatDate(date)
      days.push({
        timestamp: date.getTime(),
        weekday,
        dateMonth
      })
    }

    return days
  }

  return {
    localeCode,
    formatDate,
    formatFullDate,
    formatShortDate,
    formatEventDate,
    isToday,
    isTodayTimestamp,
    getNextDays,
    getStartOfDay,
    getEndOfDay
  }
}

export default useDate
