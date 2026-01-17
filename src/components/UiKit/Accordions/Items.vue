<template>
  <div class="UiAccordions">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * UiKit - Accordions (Items wrapper)
 * 
 * Wrapper pour les items d'accordion.
 * Gère l'état actif des items enfants.
 */

import { provide, ref } from 'vue'

interface AccordionsProps {
  /** Permet d'ouvrir plusieurs items en même temps */
  multiple?: boolean
}

const props = withDefaults(defineProps<AccordionsProps>(), {
  multiple: false,
})

const activeIds = ref<string[]>([])

const updateActive = (id: string, disabled: boolean) => {
  if (disabled) return

  const index = activeIds.value.indexOf(id)

  if (props.multiple) {
    if (index > -1) {
      activeIds.value.splice(index, 1)
    } else {
      activeIds.value.push(id)
    }
  } else {
    if (index > -1) {
      activeIds.value = []
    } else {
      activeIds.value = [id]
    }
  }
}

// Provide to children
provide('activeIds', activeIds)
provide('updateActive', updateActive)
</script>

<style lang="stylus" scoped>
.UiAccordions
  width 100%
</style>

