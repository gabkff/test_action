/**
 * Chargement de app-config.json en mode kiosk.
 * Le fichier est bundlé comme ressource Tauri (à côté de site-config.md).
 * Toutes les clés sont optionnelles : les valeurs absentes restent celles du .env / build.
 */

import { appConfig, runtimeOverrides } from 'config'
import { resolveResource } from '@tauri-apps/api/path'
import { readTextFile } from '@tauri-apps/plugin-fs'
import { setApiSiteKioskOverride } from 'plugins/api/apiSite'

const CONFIG_FILENAME = '../app-config.json'

export interface AppConfigFile {
  apiUrl?: string
  refreshInterval?: number
  forceRetour?: number
  apiSite?: string
  apiKey?: string
  useMockData?: boolean
  defaultLocale?: string
  googleMapKey?: string
  googleMapId?: string
  apiAuthUser?: string
  apiAuthPass?: string
  isDev?: boolean
}

/**
 * Lit app-config.json et applique les valeurs sur appConfig, runtimeOverrides et le site API.
 * À appeler une fois au démarrage, après initApiSite(), en mode kiosk uniquement.
 */
export async function initRuntimeConfig(): Promise<void> {
  if (appConfig.mode !== 'kiosk') return

  try {
    const configPath = await resolveResource(CONFIG_FILENAME)
    const content = await readTextFile(configPath)
    const data = JSON.parse(content) as AppConfigFile

    if (typeof data.apiUrl === 'string' && data.apiUrl.trim()) {
      appConfig.apiUrl = data.apiUrl.trim()
      console.info('[runtimeConfig] apiUrl depuis app-config.json')
    }
    if (typeof data.refreshInterval === 'number' && data.refreshInterval > 0) {
      appConfig.refreshInterval = data.refreshInterval
      console.info('[runtimeConfig] refreshInterval depuis app-config.json')
    }
    if (typeof data.forceRetour === 'number' && data.forceRetour > 0) {
      appConfig.forceRetour = data.forceRetour
      console.info('[runtimeConfig] forceRetour depuis app-config.json')
    }
    if (typeof data.apiSite === 'string' && data.apiSite.trim()) {
      setApiSiteKioskOverride(data.apiSite.trim())
      console.info('[runtimeConfig] apiSite depuis app-config.json')
    }
    if (typeof data.apiKey === 'string') {
      runtimeOverrides.apiKey = data.apiKey
      console.info('[runtimeConfig] apiKey depuis app-config.json')
    }
    if (typeof data.useMockData === 'boolean') {
      runtimeOverrides.useMockData = data.useMockData
      console.info('[runtimeConfig] useMockData depuis app-config.json')
    }
    if (typeof data.defaultLocale === 'string' && data.defaultLocale.trim()) {
      runtimeOverrides.defaultLocale = data.defaultLocale.trim()
      console.info('[runtimeConfig] defaultLocale depuis app-config.json')
    }
    if (typeof data.googleMapKey === 'string') {
      runtimeOverrides.googleMapKey = data.googleMapKey
      console.info('[runtimeConfig] googleMapKey depuis app-config.json')
    }
    if (typeof data.googleMapId === 'string') {
      runtimeOverrides.googleMapId = data.googleMapId
      console.info('[runtimeConfig] googleMapId depuis app-config.json')
    }
    if (typeof data.apiAuthUser === 'string') {
      runtimeOverrides.apiAuthUser = data.apiAuthUser
      console.info('[runtimeConfig] apiAuthUser depuis app-config.json')
    }
    if (typeof data.apiAuthPass === 'string') {
      runtimeOverrides.apiAuthPass = data.apiAuthPass
      console.info('[runtimeConfig] apiAuthPass depuis app-config.json')
    }
    if (typeof data.isDev === 'boolean') {
      runtimeOverrides.isDev = data.isDev
      console.info('[runtimeConfig] isDev depuis app-config.json')
    }
  } catch (error) {
    console.warn('[runtimeConfig] Impossible de lire app-config.json, utilisation des valeurs .env / build', error)
  }
}
