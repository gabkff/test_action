/**
 * Composable useEvent
 * 
 * Logique centralisée pour la gestion des événements :
 * - Récupération du prochain événement
 * - Filtrage par date
 * - Formatage des labels
 */

import { computed, ref, type Ref, type ComputedRef } from 'vue'
import { store as appStore } from 'plugins/store/app'
import { useI18nStore } from 'plugins/i18n/store'
import i18n from 'plugins/i18n'
import { useDate } from './useDate'

/**
 * Interface pour le retour de useNextEvent
 */
export interface NextEventResult {
  /** L'événement trouvé (ou null) */
  event: EventEntry | null
  /** Label formaté (date ou "Aujourd'hui, ...") */
  label: string
  /** true si l'événement est en cours aujourd'hui */
  isToday: boolean
}

/**
 * Composable pour récupérer le prochain événement
 * 
 * Logique :
 * 1. Si un événement est EN COURS (today entre start et end), il est prioritaire
 * 2. Sinon, retourne l'événement le plus proche dans le futur
 * 3. Si aucun événement futur, retourne le premier de la liste
 * 
 * @returns Computed avec { event, label, isToday }
 */
export function useNextEvent(): ComputedRef<NextEventResult | null> {
  const i18nStore = useI18nStore()
  const { formatEventDate, isTodayTimestamp } = useDate()

  return computed((): NextEventResult | null => {
    const events = appStore.events
    
    if (events.length === 0) return null
    if (events.length === 1) {
      const event = events[0]
      const isEventToday = isTodayTimestamp(event.datetime_start_timestamp)
      return {
        event,
        label: isEventToday 
          ? i18n.global.t('events.today', { date: formatEventDate(event.datetime_start_timestamp) })
          : formatEventDate(event.datetime_start_timestamp),
        isToday: isEventToday
      }
    }

    const todayTimestamp = Date.now() / 1000 // Timestamp en secondes

    // 1. Cherche un événement EN COURS (aujourd'hui entre start et end)
    const ongoingEvent = events.find(event => {
      const start = event.datetime_start_timestamp
      const end = event.datetime_end_timestamp
      return todayTimestamp >= start && todayTimestamp <= end
    })

    if (ongoingEvent) {
      return {
        event: ongoingEvent,
        label: i18n.global.t('events.today', { date: formatEventDate(ongoingEvent.datetime_start_timestamp) }),
        isToday: true
      }
    }

    // 2. Cherche l'événement futur le plus proche
    let closestEvent: EventEntry | null = null
    let smallestDiff = Infinity

    events.forEach(event => {
      const start = event.datetime_start_timestamp
      if (start > todayTimestamp) {
        const diff = start - todayTimestamp
        if (diff < smallestDiff) {
          smallestDiff = diff
          closestEvent = event
        }
      }
    })

    // 3. Si trouvé, retourne l'événement futur
    if (closestEvent) {
      const isEventToday = isTodayTimestamp(closestEvent.datetime_start_timestamp)
      return {
        event: closestEvent,
        label: isEventToday
          ? i18n.global.t('events.today', { date: formatEventDate(closestEvent.datetime_start_timestamp) })
          : formatEventDate(closestEvent.datetime_start_timestamp),
        isToday: isEventToday
      }
    }

    // 4. Aucun événement futur, retourne le premier (fallback)
    const fallbackEvent = events[0]
    return {
      event: fallbackEvent,
      label: formatEventDate(fallbackEvent.datetime_start_timestamp),
      isToday: false
    }
  })
}

/**
 * Composable pour filtrer les événements par date
 * 
 * @param selectedDate - Ref contenant le timestamp de la date sélectionnée (en millisecondes)
 * @returns Computed avec la liste des événements filtrés
 */
export function useFilteredEvents(selectedDate: Ref<number>): ComputedRef<EventEntry[]> {
  return computed(() => {
    const selectedDayStart = new Date(selectedDate.value)
    selectedDayStart.setHours(0, 0, 0, 0)

    return appStore.events.filter(event => {
      const eventDateStart = new Date(event.datetime_start_timestamp * 1000)
      eventDateStart.setHours(0, 0, 0, 0)
      
      const eventDateEnd = new Date(event.datetime_end_timestamp * 1000)
      eventDateEnd.setHours(0, 0, 0, 0)
      
      // L'événement est visible si la date sélectionnée est entre start et end (inclus)
      return selectedDayStart >= eventDateStart && selectedDayStart <= eventDateEnd
    })
  })
}

/**
 * Composable complet pour la gestion des événements sur une page
 * Combine useNextEvent et useFilteredEvents avec la date sélectionnée
 */
export function useEvents() {
  const { getStartOfDay, getNextDays, formatDate } = useDate()

  // Date sélectionnée (par défaut: aujourd'hui à minuit)
  const selectedDate = ref<number>(getStartOfDay(new Date()).getTime())

  // Prochain événement
  const nextEvent = useNextEvent()

  // Événements filtrés par la date sélectionnée
  const filteredEvents = useFilteredEvents(selectedDate)

  // Les 5 prochains jours pour le calendrier
  const nextFiveDays = computed(() => getNextDays(5))

  // Date sélectionnée formatée
  const formattedSelectedDate = computed(() => {
    const date = new Date(selectedDate.value)
    return formatDate(date)
  })

  /**
   * Change la date sélectionnée
   */
  function selectDate(timestamp: number): void {
    selectedDate.value = timestamp
  }

  return {
    selectedDate,
    nextEvent,
    filteredEvents,
    nextFiveDays,
    formattedSelectedDate,
    selectDate
  }
}

export default useEvents
