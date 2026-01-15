<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="isOpen" class="SidePanel" @click.self="handleClose">
        <div class="SidePanel__overlay" @click="handleClose" />
        
        <div class="SidePanel__container">
          <div class="SidePanel__header">
            <slot name="header">
              <h2 v-if="title" class="SidePanel__title">{{ title }}</h2>
            </slot>
            <button type="button" class="SidePanel__close" @click="handleClose">
              <i class="SidePanel__close-icon" v-html="IconClose" />
            </button>
          </div>
          
          <div class="SidePanel__content">
            <slot />
          </div>
          
          <div v-if="$slots.footer" class="SidePanel__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * UiKit - SidePanel
 * 
 * Panneau latéral coulissant réutilisable.
 * S'ouvre depuis la droite de l'écran.
 */

import { watch } from 'vue'
import IconClose from 'assets/svg/plus.svg?raw' // Utilisera une icône de fermeture (croix = plus tourné)

interface SidePanelProps {
  /** État d'ouverture du panneau */
  isOpen: boolean
  /** Titre du panneau */
  title?: string
  /** Fermer au clic sur l'overlay */
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<SidePanelProps>(), {
  title: '',
  closeOnOverlay: true,
})

const emit = defineEmits<{
  close: []
  'update:isOpen': [value: boolean]
}>()

function handleClose() {
  if (props.closeOnOverlay) {
    emit('close')
    emit('update:isOpen', false)
  }
}

// Bloquer le scroll du body quand le panneau est ouvert
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)
</script>

<style lang="stylus" scoped>
.SidePanel
  position fixed
  top 0
  left 0
  right 0
  bottom 0
  z-index 1000
  display flex
  justify-content flex-end

  &__overlay
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    background rgba($fjord, 0.5)
    backdrop-filter blur(4px)

  &__container
    position relative
    width 50%
    max-width 900px
    height 100%
    background $embruns
    display flex
    flex-direction column
    overflow hidden
    box-shadow -10px 0 40px rgba(0, 0, 0, 0.15)

  &__header
    display flex
    align-items center
    justify-content space-between
    r(padding, 60px 80px)
    border-bottom 1px solid rgba($fjord, 0.1)

  &__title
    f-style('h3')
    color $fjord
    margin 0

  &__close
    display flex
    align-items center
    justify-content center
    background none
    border none
    padding 0
    cursor pointer

  &__close-icon
    display flex
    align-items center
    justify-content center
    padding 16px
    width 60px
    height 60px
    border-radius 50%
    background $fjord
    color white
    transform rotate(45deg)
    transition transform 0.3s ease

    :deep(svg)
      width 100%
      height 100%
      
      path
        fill white

    &:hover
      transform rotate(135deg)

  &__content
    flex 1
    overflow-y auto
    r(padding, 60px 80px)

  &__footer
    r(padding, 40px 80px)
    border-top 1px solid rgba($fjord, 0.1)

// Transitions
.panel-enter-active,
.panel-leave-active
  transition opacity 0.3s ease

  .SidePanel__container
    transition transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)

.panel-enter-from,
.panel-leave-to
  opacity 0

  .SidePanel__container
    transform translateX(100%)
</style>

