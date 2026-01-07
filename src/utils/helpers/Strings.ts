/**
 * Helpers pour la manipulation des chaînes de caractères
 */

/**
 * Convertit une chaîne en slug URL-friendly
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprime les caractères spéciaux
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Remplace les tirets multiples par un seul
}

/**
 * Tronque une chaîne à une longueur donnée
 */
export function truncate(text: string, length: number = 100, suffix: string = '...'): string {
  if (text.length <= length) return text
  return text.substring(0, length).trim() + suffix
}

/**
 * Capitalise la première lettre d'une chaîne
 */
export function capitalize(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Capitalise la première lettre de chaque mot
 */
export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

/**
 * Supprime les balises HTML d'une chaîne
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * Échappe les caractères HTML spéciaux
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, char => map[char])
}

/**
 * Génère un identifiant unique
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Vérifie si une chaîne est un email valide
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Formate un numéro de téléphone
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

