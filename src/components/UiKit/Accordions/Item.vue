<template>
  <div
    class="UiAccordionsItem"
    :data-open="isOpen || undefined"
    :data-disabled="disabled || undefined"
  >
    <span class="border -top" />
    
    <div :class="['header', { '-active': isOpen }]" @click="onToggle">
      <div class="left">
        <p class="title">{{ title }}</p>
      </div>
      <slot name="toggle">
        <i 
          :class="['toggle-icon', { '-active': isOpen }]"
          v-html="IconPlus"
        />
      </slot>
    </div>

    <div
      ref="contentEl"
      class="togglable"
      :aria-hidden="!isOpen"
    >
      <div class="content wysiwyg">
        <slot />
      </div>
    </div>
    
    <span class="border -bottom" />
  </div>
</template>

<script setup lang="ts">
/**
 * UiKit - Accordions Item
 * 
 * Item individuel d'accordion.
 */

import { ref, inject, watch, onMounted, type Ref } from 'vue'
import IconPlus from 'assets/svg/plus.svg?raw'

interface AccordionsItemProps {
  /** Titre de l'accordion */
  title?: string
  /** Item désactivé */
  disabled?: boolean
  /** Ouvert par défaut */
  open?: boolean
}

const props = withDefaults(defineProps<AccordionsItemProps>(), {
  title: '',
  disabled: false,
  open: false,
})

const contentEl = ref<HTMLElement | null>(null)
const isOpen = ref(false)

// Générer un ID unique stable
const uid = Math.random().toString(36).substring(2, 9)

// Injected from parent
const activeIds = inject<Ref<string[]>>('activeIds', ref([]))
const updateActive = inject<(id: string, disabled: boolean) => void>('updateActive', () => {})

onMounted(() => {
  if (props.open) {
    isOpen.value = true
    updateActive(uid, props.disabled)
  }
})

// Watch active state from parent
watch(
  activeIds,
  (value) => {
    isOpen.value = value.includes(uid)
  },
  { deep: true }
)

// Animate content
watch(
  isOpen,
  (value) => {
    if (contentEl.value) {
      if (value) {
        contentEl.value.style.height = contentEl.value.scrollHeight + 'px'
        setTimeout(() => {
          if (contentEl.value) contentEl.value.style.height = 'auto'
        }, 400)
      } else {
        contentEl.value.style.height = contentEl.value.scrollHeight + 'px'
        requestAnimationFrame(() => {
          if (contentEl.value) contentEl.value.style.height = '0'
        })
      }
    }
  }
)
const emit = defineEmits<{
  toggle: [uid: string]
}>()

const onToggle = () => {
  console.log('test')
  if (!props.disabled) {
    updateActive(uid, props.disabled)
    console.log('onToggle', uid)
    emit('toggle', uid)
  }
}
</script>

<style lang="stylus" scoped>
.UiAccordionsItem
  position relative
  width 100%

  &[data-disabled]
    pointer-events none
    > *
      opacity 0.4

  &:not([data-disabled]):hover
    .toggle-icon
      transform rotate(90deg)

.border
  position absolute
  top 0
  left 0
  right 0
  height 1px
  background $fjord
  
  &.-bottom
    top auto
    bottom -1px

.header
  f(row, $align: center, $justify: space-between)
  position relative
  cursor pointer
  padding 60px 0

.left
  display flex
  align-items center
  gap 16px

.title
  f-style('h5')
  color $fjord

.togglable
  height 0
  overflow hidden
  transition height 0.4s ease

.content
  padding-bottom 60px

// Toggle icon
.toggle-icon
  display flex
  align-items center
  justify-content center
  padding 24px
  width 80px
  height 80px
  flex-shrink 0
  cursor pointer
  transition transform 0.3s ease
  border-radius 50%
  background $fjord
  color white

  :deep(svg)
    width 100%
    height 100%
    
    path
      fill white

  &.-active
    transform rotate(45deg)
</style>

