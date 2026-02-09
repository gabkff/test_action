/**
 * Index des utilitaires (ex-composables)
 *
 * Point d'entrée centralisé pour useDate, useEvent, useCircuit.
 *
 * Usage :
 * import { useDate, useNextEvent, useCircuit } from 'plugins/utils'
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
