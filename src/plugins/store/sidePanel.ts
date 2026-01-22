/**
 * Store - SidePanel
 * 
 * Gestion centralisée de l'état du panneau latéral.
 * Permet d'ouvrir le panel avec différents types de contenu.
 */

import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'

// Types de contenu supportés par le SidePanel
export type SidePanelType = 'event' | 'home' | 'language' | 'info' | 'custom' | 'circuitStep' | 'qrCode'

export interface SidePanelData {
  /** Type de contenu à afficher */
  type: SidePanelType
  /** Titre du panneau */
  title?: string
  /** Données spécifiques au type */
  payload?: Record<string, unknown>
  /** data du panel */
  data?: any
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

  /** Data du panel */
  const data = reactive<any>(null)

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
  function openEvent(event: Record<string, any>) {
    console.log('openEvent', event)
    open({
      type: 'event',
      title: event.title as string || '',
      payload: event,
    })
  }

  function openCircuitStep(step: Record<string, any>) {
    console.log('openCircuitStep', step)
    open({
      type: 'circuitStep',
      title: step.title as string || '',
      payload: step,
    })
  }

  function openQrCode(circuit: Record<string, any>) {
    open({
      type: 'qrCode',
      title: circuit.title as string || '',
      payload: circuit,
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

