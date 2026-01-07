/**
 * Helpers pour la manipulation des dates
 */

import { format, formatDistance, parseISO, isValid } from 'date-fns'
import { fr, enCA } from 'date-fns/locale'

const locales = {
  fr: fr,
  en: enCA,
}

type LocaleKey = keyof typeof locales

/**
 * Formate une date selon le pattern fourni
 */
export function formatDate(
  date: Date | string | number,
  pattern: string = 'dd MMMM yyyy',
  locale: LocaleKey = 'fr'
): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date)
  
  if (!isValid(parsedDate)) {
    console.warn('Invalid date:', date)
    return ''
  }
  
  return format(parsedDate, pattern, { locale: locales[locale] })
}

/**
 * Retourne la distance relative depuis une date (ex: "il y a 2 jours")
 */
export function formatRelative(
  date: Date | string | number,
  locale: LocaleKey = 'fr'
): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date)
  
  if (!isValid(parsedDate)) {
    console.warn('Invalid date:', date)
    return ''
  }
  
  return formatDistance(parsedDate, new Date(), {
    addSuffix: true,
    locale: locales[locale],
  })
}

/**
 * Formate un timestamp en date lisible
 */
export function formatTimestamp(
  timestamp: number,
  pattern: string = 'dd/MM/yyyy HH:mm',
  locale: LocaleKey = 'fr'
): string {
  return formatDate(new Date(timestamp), pattern, locale)
}

/**
 * Vérifie si une date est valide
 */
export function isValidDate(date: unknown): boolean {
  if (date instanceof Date) {
    return isValid(date)
  }
  if (typeof date === 'string') {
    return isValid(parseISO(date))
  }
  if (typeof date === 'number') {
    return isValid(new Date(date))
  }
  return false
}

