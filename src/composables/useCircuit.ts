/**
 * Composable useCircuit
 * 
 * Logique centralisée pour la gestion des circuits :
 * - Navigation entre étapes
 * - Données de la carte (polylines, markers)
 */

import { computed, type ComputedRef } from 'vue'
import { store as appStore } from 'plugins/store/app'

/**
 * Interface pour un marker de carte
 */
export interface MapMarker {
  position: { lat: number; lng: number }
  icon?: string
}

/**
 * Composable pour la navigation dans un circuit
 * 
 * Fournit :
 * - Circuit courant
 * - Étape courante
 * - Index de l'étape
 * - Fonctions de navigation (next/previous)
 */
export function useCircuitNavigation() {
  // Circuit courant depuis le store
  const current = computed(() => appStore.current)
  
  // Index de l'étape courante
  const currentStepIndex = computed(() => appStore.currentStepIndex)
  
  // Étape courante
  const currentStep = computed((): CircuitStep | null => appStore.currentStep)
  
  // Index du circuit dans la liste
  const circuitIndex = computed(() => {
    if (!current.value) return null
    return appStore.getCircuitIndex(current.value.slug)
  })

  // Prochain circuit (différent du courant)
  const nextCircuit = computed(() => appStore.nextCircuit)

  // Index du prochain circuit
  const nextCircuitIndex = computed(() => {
    if (!nextCircuit.value) return null
    return appStore.getCircuitIndex(nextCircuit.value.slug)
  })

  // Vérifie si on est à la première étape
  const isFirstStep = computed(() => currentStepIndex.value === 0)

  // Vérifie si on est à la dernière étape
  const isLastStep = computed(() => {
    if (!current.value) return false
    return currentStepIndex.value >= current.value.steps.length - 1
  })

  // Vérifie si on est après la dernière étape (écran de fin)
  const isAfterLastStep = computed(() => {
    if (!current.value) return false
    return currentStepIndex.value >= current.value.steps.length
  })

  // Nombre total d'étapes
  const totalSteps = computed(() => current.value?.steps.length ?? 0)

  /**
   * Passe à l'étape suivante
   */
  function goToNextStep(): void {
    if (!current.value) return
    appStore.setCurrentStepIndex(currentStepIndex.value + 1)
  }

  /**
   * Revient à l'étape précédente
   */
  function goToPreviousStep(): void {
    if (currentStepIndex.value > 0) {
      appStore.setCurrentStepIndex(currentStepIndex.value - 1)
    }
  }

  /**
   * Va à une étape spécifique
   * @param index - Index de l'étape (0-based)
   */
  function goToStep(index: number): void {
    if (!current.value) return
    if (index >= 0 && index <= current.value.steps.length) {
      appStore.setCurrentStepIndex(index)
    }
  }

  /**
   * Remet le circuit au début (étape 0)
   */
  function restartCircuit(): void {
    appStore.setCurrentStepIndex(0)
  }

  /**
   * Navigation par direction
   * @param direction - 'next' ou 'previous'
   * @param restart - Si true, remet à 0 au lieu de naviguer
   */
  function navigate(direction: 'next' | 'previous', restart: boolean = false): void {
    if (restart) {
      restartCircuit()
      return
    }

    if (direction === 'next') {
      goToNextStep()
    } else {
      goToPreviousStep()
    }
  }

  return {
    // Données
    current,
    currentStep,
    currentStepIndex,
    circuitIndex,
    nextCircuit,
    nextCircuitIndex,
    totalSteps,
    
    // États
    isFirstStep,
    isLastStep,
    isAfterLastStep,
    
    // Actions
    goToNextStep,
    goToPreviousStep,
    goToStep,
    restartCircuit,
    navigate
  }
}

/**
 * Composable pour les données de carte d'un circuit
 * 
 * Fournit :
 * - Tous les polylines du circuit
 * - Markers de toutes les étapes
 * - Polylines précédents/suivants par rapport à l'étape courante
 */
export function useCircuitMap() {
  const { current, currentStep, currentStepIndex } = useCircuitNavigation()

  // Tous les polylines du circuit (pour dessiner le tracé complet)
  const allPolylines = computed((): string[] => {
    if (!current.value?.steps) return []
    return current.value.steps
      .map(step => step.next_step?.polyline)
      .filter((p): p is string => p !== null && p !== undefined)
  })

  // Polylines des étapes suivantes (après l'étape courante)
  const nextStepPolylines = computed((): string[] => {
    if (!current.value?.steps) return []
    if (currentStepIndex.value >= current.value.steps.length - 1) return []

    const next: string[] = []
    for (let i = currentStepIndex.value + 1; i < current.value.steps.length; i++) {
      const polyline = current.value.steps[i].next_step?.polyline
      if (polyline) next.push(polyline)
    }
    return next
  })

  // Polylines des étapes précédentes (avant l'étape courante)
  const previousStepPolylines = computed((): string[] => {
    if (!current.value?.steps || currentStepIndex.value === 0) return []

    const previous: string[] = []
    for (let i = currentStepIndex.value - 1; i >= 0; i--) {
      const polyline = current.value.steps[i].next_step?.polyline
      if (polyline) previous.push(polyline)
    }
    return previous
  })

  // Parcours suivants (objets NextStepInfo complets)
  const currentNextParcours = computed(() => appStore.currentNextParcours)

  // Parcours précédents (objets NextStepInfo complets)
  const currentPreviousParcours = computed(() => appStore.currentPreviousParcours)

  // Markers pour toutes les étapes
  const markers = computed((): MapMarker[] => {
    if (!current.value?.steps || current.value.steps.length === 0) return []

    return current.value.steps.map(step => ({
      position: {
        lat: step.map.latitude ?? 0,
        lng: step.map.longitude ?? 0
      },
      icon: step.icon
    }))
  })

  // Centre de la carte (position de l'étape courante)
  const mapCenter = computed(() => {
    if (!currentStep.value?.map) return { latitude: 0, longitude: 0 }
    return currentStep.value.map
  })

  return {
    allPolylines,
    nextStepPolylines,
    previousStepPolylines,
    currentNextParcours,
    currentPreviousParcours,
    markers,
    mapCenter
  }
}

/**
 * Composable complet combinant navigation et map
 */
export function useCircuit() {
  const navigation = useCircuitNavigation()
  const map = useCircuitMap()

  return {
    ...navigation,
    ...map
  }
}

export default useCircuit
