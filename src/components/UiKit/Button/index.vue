<template>
  <component
    :is="componentTag"
    :href="isLink ? href : undefined"
    :to="isRouterLink ? href : undefined"
    :target="isExternalLink ? '_blank' : undefined"
    :rel="isExternalLink ? 'noopener noreferrer' : undefined"
    :type="isButton ? type : undefined"
    :disabled="disabled"
    :class="[
      'UiButton',
      `UiButton--${theme}`,
      { 'UiButton--disabled': disabled },
      { 'UiButton--loading': loading }
    ]"
    @click="onClick"
  >
    <span class="UiButton__content">
      <slot>{{ label }}</slot>
    </span>
    <span v-if="loading" class="UiButton__loader" />
  </component>
</template>

<script setup lang="ts">
/**
 * UiKit - Button
 * 
 * Composant bouton/lien universel avec différents thèmes.
 */

import { computed } from 'vue'

type ButtonTheme = 'primary' | 'secondary' | 'link' | 'icon' | 'reset'

interface ButtonProps {
  /** Texte du bouton */
  label?: string
  /** URL du lien */
  href?: string
  /** Thème du bouton */
  theme?: ButtonTheme
  /** Type du bouton HTML */
  type?: 'button' | 'submit' | 'reset'
  /** Désactivé */
  disabled?: boolean
  /** En chargement */
  loading?: boolean
  /** Target du lien */
  target?: string
}

const props = withDefaults(defineProps<ButtonProps>(), {
  label: '',
  href: undefined,
  theme: 'primary',
  type: 'button',
  disabled: false,
  loading: false,
  target: undefined,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isExternalLink = computed(() => {
  return props.href?.startsWith('http') || props.target === '_blank'
})

const isRouterLink = computed(() => {
  return props.href && !isExternalLink.value && props.href.startsWith('/')
})

const isLink = computed(() => {
  return props.href && !isRouterLink.value
})

const isButton = computed(() => {
  return !props.href
})

const componentTag = computed(() => {
  if (isRouterLink.value) return 'router-link'
  if (isLink.value) return 'a'
  return 'button'
})

const onClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<style lang="stylus" scoped>
.UiButton
  display inline-flex
  align-items center
  justify-content center
  gap 8px
  padding 12px 24px
  border none
  border-radius $radius-md
  font-weight $fw-semibold
  font-size 1rem
  line-height 1.2
  text-decoration none
  cursor pointer
  transition all 0.2s ease
  
  &:focus-visible
    outline 2px solid $primary
    outline-offset 2px

  &--disabled
  &[disabled]
    opacity 0.5
    cursor not-allowed
    pointer-events none

  &--loading
    position relative
    color transparent
    pointer-events none

  // Themes
  &--primary
    background $primary
    color white
    
    &:hover
      background $primary-dark
      transform translateY(-2px)
      box-shadow $shadow-md

  &--secondary
    background transparent
    color $primary
    border 2px solid $primary
    
    &:hover
      background $primary
      color white

  &--link
    background transparent
    color $primary
    padding 8px 0
    
    &:hover
      text-decoration underline

  &--icon
    padding 12px
    border-radius 50%
    background $gray-100
    
    &:hover
      background $gray-200

  &--reset
    background none
    padding 0
    color inherit

  &__content
    display flex
    align-items center
    gap 8px

  &__loader
    position absolute
    top 50%
    left 50%
    transform translate(-50%, -50%)
    width 20px
    height 20px
    border 2px solid currentColor
    border-top-color transparent
    border-radius 50%
    animation spin 0.8s linear infinite

@keyframes spin
  to
    transform translate(-50%, -50%) rotate(360deg)
</style>

