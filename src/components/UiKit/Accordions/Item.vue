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
        <button
          type="button"
          aria-label="Toggle"
          :class="['toggle-btn', 'plus', { '-active': isOpen }]"
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

import { ref, inject, watch, onMounted, getCurrentInstance } from 'vue'

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

const instance = getCurrentInstance()
const contentEl = ref<HTMLElement | null>(null)
const isOpen = ref(false)

// Injected from parent
const active = inject<number[]>('active', [])
const updateActive = inject<(id: number, disabled: boolean) => void>('updateActive')

const uid = instance?.uid || Math.random()

onMounted(() => {
  isOpen.value = props.open
  if (props.open && updateActive) {
    updateActive(uid, props.disabled)
  }
})

// Watch active state
watch(
  () => active,
  (value) => {
    isOpen.value = value.includes(uid)
  },
  { deep: true }
)

// Animate content
watch(
  () => isOpen.value,
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

const onToggle = () => {
  if (updateActive) {
    updateActive(uid, props.disabled)
  }
}
</script>

<style lang="stylus" scoped>
$c-border = $gray-300
$c-accent = $primary

.UiAccordionsItem
  position relative
  width 100%

  &[data-disabled]
    pointer-events none
    > *
      opacity 0.4

  &:not([data-disabled]):hover
    .toggle-btn
      transform rotate(-90deg)
      &::before
        opacity 0

.border
  position absolute
  top 0
  left 0
  right 0
  height 1px
  background $c-border
  
  &.-bottom
    top auto
    bottom -1px

.header
  f row
  position relative
  cursor pointer
  rp(padding-top, 40px 20px)
  rp(padding-bottom, 40px 20px)

.title
  margin-right 20px
  rp(font-size, 2rem 1.4rem)
  font-weight $fw-bold
  line-height 1.2

.togglable
  height 0
  overflow hidden
  transition height 0.4s ease

.content
  rp(padding-bottom, 40px 20px)

// Toggle button (plus/minus)
.plus
  position relative
  rp(size, 24px 16px)
  background none
  border none
  cursor pointer
  transition transform 0.3s ease

  &::before
  &::after
    content ''
    position absolute
    background $c-border
    transition all 0.3s ease

  &::before
    top 50%
    left 0
    width 100%
    height 1px
    transform translateY(-50%)

  &::after
    top 0
    left 50%
    height 100%
    width 1px
    transform translateX(-50%)

  &.-active
    transform rotate(-90deg)
    &::before
      opacity 0
</style>

