/**
 * Store - SidePanel
 * 
 * Gestion centralisée de l'état du panneau latéral.
 * Permet d'ouvrir le panel avec différents types de contenu.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Types de contenu supportés par le SidePanel
export type SidePanelType = 'event' | 'home' | 'language' | 'info' | 'custom' | 'circuitStep' | 'qrCode'

/** Payload pour l'ouverture d'une étape de circuit */
export interface CircuitStepPayload {
  title: string
  step: CircuitStep
  index: number
  qr?: string | null
}

/** Payload pour l'ouverture du QR Code */
export interface QrCodePayload {
  title: string
  qr: string | null
  index: number | null
}

export interface SidePanelData {
  /** Type de contenu à afficher */
  type: SidePanelType
  /** Titre du panneau */
  title?: string
  /** Données spécifiques au type */
  payload?: Record<string, unknown>
}

export const useSidePanelStore = defineStore('sidePanel', () => {
  // ============================================
  // STATE
  // ============================================

  /** État d'ouverture du panneau */
  const isOpen = ref(false)

  /** Type de contenu actuel */
  const currentType = ref<SidePanelType | null>(null)

  /** Titre du panneau */
  const title = ref<string>('')

  /** Données du contenu */
  const payload = ref<Record<string, unknown>>({})

  // ============================================
  // GETTERS
  // ============================================

  /** Données complètes du panneau */
  const panelData = computed<SidePanelData | null>(() => {
    if (!currentType.value) return null
    return {
      type: currentType.value,
      title: title.value,
      payload: payload.value,
    }
  })

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Ouvre le panneau avec un type et des données spécifiques
   */
  function open(data: SidePanelData) {
    currentType.value = data.type
    title.value = data.title || ''
    payload.value = data.payload || {}
    isOpen.value = true
  }

  /**
   * Ouvre le panneau pour afficher un événement
   */
  function openEvent() {
    open({
      type: 'event'
    })
  }

  function openCircuitStep(data: CircuitStepPayload) {
    open({
      type: 'circuitStep',
      title: data.title,
      payload: data as unknown as Record<string, unknown>,
    })
  }

  function openQrCode(data: QrCodePayload) {
    open({
      type: 'qrCode',
      title: data.title,
      payload: data as unknown as Record<string, unknown>,
    })
  }

  /**
   * Ouvre le panneau home
   */
  function openHome() {
    open({
      type: 'home',
      title: 'Accueil',
    })
  }

  /**
   * Ouvre le panneau de sélection de langue
   */
  function openLanguage() {
    open({
      type: 'language',
      title: 'Langue',
    })
  }

  /**
   * Ferme le panneau
   */
  function close() {
    isOpen.value = false
  }

  /**
   * Réinitialise complètement le panneau
   */
  function reset() {
    isOpen.value = false
    currentType.value = null
    title.value = ''
    payload.value = {}
  }

  return {
    // State
    isOpen,
    currentType,
    title,
    payload,
    // Getters
    panelData,
    // Actions
    open,
    openEvent,
    openCircuitStep,
    openHome,
    openLanguage,
    openQrCode,
    close,
    reset,
  }
})

