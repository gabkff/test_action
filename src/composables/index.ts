/**
 * Index des composables
 * 
 * Point d'entrée centralisé pour tous les composables de l'application.
 * 
 * Usage :
 * import { useDate, useNextEvent, useCircuit } from 'composables'
 */

// Date utilities
export { useDate, getStartOfDay, getEndOfDay } from './useDate'

// Event management
export { 
  useNextEvent, 
  useFilteredEvents, 
  useEvents,
  type NextEventResult 
} from './useEvent'

// Circuit management
export { 
  useCircuitNavigation, 
  useCircuitMap, 
  useCircuit,
  type MapMarker 
} from './useCircuit'
