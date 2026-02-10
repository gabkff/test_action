/**
 * Timer d'inactivité pour le mode kiosk.
 * Après un délai sans interaction (clic, scroll, changement de page), redirige vers la home.
 */

import type { Router } from 'vue-router'
import { appConfig } from 'config'

const DEFAULT_FORCE_RETOUR_MS = 5 * 60 * 1000 // 5 minutes
const SCROLL_DEBOUNCE_MS = 150

let timeoutId: ReturnType<typeof setTimeout> | null = null
let removeRouterGuard: (() => void) | null = null
let scrollDebounceId: ReturnType<typeof setTimeout> | null = null
let boundOnActivity: (() => void) | null = null
let boundOnScroll: (() => void) | null = null

function getForceRetourMs(): number {
  const ms = appConfig.forceRetour
  return typeof ms === 'number' && ms > 0 ? ms : DEFAULT_FORCE_RETOUR_MS
}

function scheduleRedirect(router: Router): void {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    router.push('/')
    timeoutId = null
  }, getForceRetourMs())
}

export function startKioskInactivityTimer(router: Router): void {
  
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
  if (appConfig.mode !== 'kiosk' && !isTauri) return
  scheduleRedirect(router)

  boundOnActivity = () => scheduleRedirect(router)

  boundOnScroll = () => {
    if (scrollDebounceId) clearTimeout(scrollDebounceId)
    scrollDebounceId = setTimeout(() => {
      if (boundOnActivity) boundOnActivity()
      scrollDebounceId = null
    }, SCROLL_DEBOUNCE_MS)
  }

  document.addEventListener('click', boundOnActivity, true)
  document.addEventListener('scroll', boundOnScroll, true)

  removeRouterGuard = router.afterEach(() => scheduleRedirect(router))
}

export function stopKioskInactivityTimer(): void {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  if (scrollDebounceId) {
    clearTimeout(scrollDebounceId)
    scrollDebounceId = null
  }
  if (boundOnActivity) {
    document.removeEventListener('click', boundOnActivity, true)
    boundOnActivity = null
  }
  if (boundOnScroll) {
    document.removeEventListener('scroll', boundOnScroll, true)
    boundOnScroll = null
  }
  if (removeRouterGuard) {
    removeRouterGuard()
    removeRouterGuard = null
  }
}
