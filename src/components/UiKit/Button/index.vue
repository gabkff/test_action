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
      { 'UiButton--loading': loading },
      { 'UiButton--big': big }
    ]"
    @click="onClick"
  >
    <span class="UiButton__content">
      <i
        v-if="icon && iconPosition === 'left'"
        v-html="icon"
        class="UiButton__icon"
      />
      <slot>{{ label }}</slot>
      <i
        v-if="icon && iconPosition === 'right'"
        v-html="icon"
        class="UiButton__icon"
      />
      <i
        v-if="theme === 'arrow'"
        v-html="IconArrow"
        class="UiButton__arrow"
        :class="'UiButton__arrow--' + direction"
      />
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
import IconArrow from 'assets/svg/arrow.svg?raw'

type ButtonTheme = 'primary' | 'secondary' | 'link' | 'icon' | 'reset' | 'date' | 'arrow'

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
  /** Grand bouton */
  big?: boolean
  /** URL de l'icône */
  icon?: string
  /** Position de l'icône */
  iconPosition?: 'left' | 'right'
  /** Direction de l'arrow */
  direction?: 'up' | 'down' | 'left' | 'right'
}

const props = withDefaults(defineProps<ButtonProps>(), {
  label: '',
  href: undefined,
  theme: 'primary',
  type: 'button',
  disabled: false,
  loading: false,
  target: undefined,
  big: false,
  icon: undefined,
  iconPosition: 'left',
  direction: 'right'
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
  r(padding, 20px 9px)
  border none
  border-radius $radius-md
  f-style('button')
  text-decoration none
  cursor pointer
  transition all 0.2s ease
  +layout(mobile)
    border-radius 4px
    font-size 11px

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
    background $brume
    color $fjord

  &--secondary
    background $fjord
    color $ecume

  &--link
    background transparent
    color $primary
    padding 8px 0
    

  &--icon
    r(padding, 20px 10px)
    border-radius 50%
    background $fjord
    color white
    .UiButton__icon
      r(width, 40px 20px)
      r(height, 40px 20px)
      svg
        width 100%
        height 100%
  &--big
    border-radius $radius-lg
    padding 60px 45px
    f-style('btn-large')
    border unset
    +layout(mobile)
      r-mobile(font-size, 16px 16px)
      padding 28px 21px
      border-radius 6px



  &--reset
    background none
    padding 0
    color inherit

  &--date
    background transparent
    border 1px solid rgba(#102838, 0.3)
    border-radius 12px
    text-transform capitalize
    r(padding, 50px 40px)
    
    .UiButton__content
      f-style('subtitle')
      color $fjord
    
    
    &.is-active
      background $fjord
      border-color $fjord
      
      .UiButton__content
        color white

  &__content
    display flex
    align-items center
    r(gap, 30px 15px)
  &--arrow
    r(width, 128px)
    r(height, 120px)
    border 1px solid rgba($fjord, 0.3)
    border-radius $radius-lg
    &.is-active
      background $fjord
      color white
  &__arrow--up
    transform rotate(-90deg)
  &__arrow--down
    transform rotate(90deg)
  &__arrow--left
    transform rotate(180deg)
  &__arrow--right
    transform rotate(0deg)
  &--big &__content
    r(gap, 60px 28px)

  &__icon
    r(width, 20px 15px)
    r(height, 20px 15px)
    flex-shrink 0
  &__arrow
    width 50px
    height 50px
    svg
      width 100%
      height 100%
    

  &--big &__icon
    width 40px
    height 40px
    +layout(mobile)
      r-mobile(width, 25px 25px)
      r-mobile(height, 25px 25px)

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

