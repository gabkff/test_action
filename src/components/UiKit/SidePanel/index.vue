<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="store.isOpen" class="SidePanel" @click.self="handleClose">
        <div class="SidePanel__overlay" @click="handleClose" />
        
        <div class="SidePanel__container">
          <UiNavBar key="nav" :panel="true"/>
          <div class="SidePanel__content">
            <!-- Contenu dynamique basé sur le type -->
            <slot :type="store.currentType" :payload="store.payload">
              <!-- Contenu par défaut basé sur le type -->
              <template v-if="store.currentType === 'language'">
                <div class="SidePanel__language">
                  <p>Sélectionnez votre langue</p>
                  <!-- Slots pour le contenu langue -->
                </div>
              </template>
              <Circuit v-else-if="store.currentType === 'circuitStep'" :data="store.payload" />
              <Event v-else-if="store.currentType === 'event'" :data="store.payload" />
              <QrCode v-else-if="store.currentType === 'qrCode'" :data="store.payload" />
              <template v-else-if="store.currentType === 'home'">
                <div class="SidePanel__home">
                  <!-- Contenu home -->
                </div>
              </template>
            </slot>
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
 * Utilise le store useSidePanelStore pour la gestion de l'état.
 */

import { watch, useTemplateRef } from 'vue'
import { useSidePanelStore } from 'store/sidePanel'
import UiNavBar from 'components/NavBar/index.vue'
import Circuit from './blocks/circuit.vue'
import Event from './blocks/event.vue'
import QrCode from './blocks/qrCode.vue'
const store = useSidePanelStore()

const descriptionEvent = useTemplateRef<HTMLElement | null>('descriptionEventRef')

function handleClose() {
  store.close()
}

// Bloquer le scroll du body quand le panneau est ouvert
watch(
  () => store.isOpen,
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
    width 1339px
    height 100%
    background white
    display flex
    flex-direction column
    box-shadow -10px 0 40px rgba(0, 0, 0, 0.15)
    .NavBar
        z-index 1
        position absolute
        top 100px
        left -95px 
        transform scaleX(-1)
      :deep(.NavBar__container)
        transform scaleX(-1)

  &__header
    display flex
    align-items center
    justify-content space-between
    r(padding, 60px 60px)
    border-bottom 1px solid rgba($fjord, 0.1)
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
    overflow visible
    r(padding-top, 60px 60px)
    z-index 10
    height calc('100vh - 120px')
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