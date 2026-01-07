<template>
  <UiAnimation animation="list" class="UiAccordions">
    <slot />
  </UiAnimation>
</template>

<script setup lang="ts">
/**
 * UiKit - Accordions (Items wrapper)
 * 
 * Wrapper pour les items d'accordion.
 * Gère l'état actif des items enfants.
 */

import { provide, reactive, readonly } from 'vue'
import UiAnimation from '../Animation/index.vue'

interface AccordionsProps {
  /** Permet d'ouvrir plusieurs items en même temps */
  multiple?: boolean
}

const props = withDefaults(defineProps<AccordionsProps>(), {
  multiple: false,
})

const state = reactive({
  active: [] as number[],
})

const updateActive = (id: number, disabled: boolean) => {
  if (disabled) return

  if (props.multiple) {
    const index = state.active.indexOf(id)
    if (index > -1) {
      state.active.splice(index, 1)
    } else {
      state.active.push(id)
    }
  } else {
    const index = state.active.indexOf(id)
    if (index > -1) {
      state.active.splice(index, 1)
    } else {
      state.active = [id]
    }
  }
}

// Provide to children
provide('updateActive', updateActive)
provide('active', readonly(state.active))
</script>

<style lang="stylus" scoped>
.UiAccordions
  width 100%
</style>

