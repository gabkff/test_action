// src/plugins/store/menu.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type MenuOrigin = 'circuit' | 'events'

export interface MenuPayload {
  circuitId?: number
}

export const useMenuStore = defineStore('menu', () => {
  const isOpen = ref(false)
  const origin = ref<MenuOrigin>('circuit')
  const payload = ref<MenuPayload>({})

  function openFromCircuit(circuitId: number) {
    console.log('openFromCircuit', circuitId)
    origin.value = 'circuit'
    payload.value = { circuitId }
    isOpen.value = true
  }

  function openFromEvents() {
    origin.value = 'events'
    payload.value = {}
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { isOpen, origin, payload, openFromCircuit, openFromEvents, close }
})