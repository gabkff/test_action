/**
 * Helpers d'authentification
 *
 * Fonctions utilitaires pour gérer l'authentification HTTP Basic
 * utilisée pour les appels API et le téléchargement d'assets.
 * En kiosk, les valeurs peuvent venir de app-config.json.
 */
import { getApiAuthUser, getApiAuthPass } from 'config'

/**
 * Retourne les headers d'authentification HTTP Basic si configurés
 * @returns Headers avec Authorization si les credentials sont présents
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  //const user = getApiAuthUser()
  //const pass = getApiAuthPass()
  const user = "kff"
  const pass = "ein"
  // user && pass && getIsDev()
  if (user && pass) {
    const credentials = btoa(`${user}:${pass}`)
    headers['Authorization'] = `Basic ${credentials}`
  }

  return headers
}

/**
 * Vérifie si l'authentification est configurée
 * @returns true si les credentials sont présents
 */
export function hasAuthCredentials(): boolean {
  return Boolean(getApiAuthUser() && getApiAuthPass())
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
