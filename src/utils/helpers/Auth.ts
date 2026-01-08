/**
 * Helpers d'authentification
 * 
 * Fonctions utilitaires pour gérer l'authentification HTTP Basic
 * utilisée pour les appels API et le téléchargement d'assets.
 */
const IS_DEV = import.meta.env.VITE_IS_DEV  || true
const API_AUTH_USER = import.meta.env.VITE_API_AUTH_USER || ''
const API_AUTH_PASS = import.meta.env.VITE_API_AUTH_PASS || ''

/**
 * Retourne les headers d'authentification HTTP Basic si configurés
 * @returns Headers avec Authorization si les credentials sont présents
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  
  if (API_AUTH_USER && API_AUTH_PASS && IS_DEV) {
    const credentials = btoa(`${API_AUTH_USER}:${API_AUTH_PASS}`)
    headers['Authorization'] = `Basic ${credentials}`
  }
  
  return headers
}

/**
 * Vérifie si l'authentification est configurée
 * @returns true si les credentials sont présents
 */
export function hasAuthCredentials(): boolean {
  return Boolean(API_AUTH_USER && API_AUTH_PASS)
}

/**
 * Encode les credentials en Base64 pour HTTP Basic Auth
 * @param username - Nom d'utilisateur
 * @param password - Mot de passe
 * @returns Credentials encodés en Base64
 */
export function encodeBasicAuth(username: string, password: string): string {
  return btoa(`${username}:${password}`)
}
