/**
 * Store Plugin - Pinia Store Configuration
 * 
 * Point d'entrée centralisé pour tous les stores Pinia.
 * Exporte l'instance pinia et tous les stores de l'application.
 */

import { createPinia } from 'pinia'

// Création de l'instance Pinia
export const pinia = createPinia()

// Ré-export des stores pour un accès facile
export { useAppStore } from './app'

