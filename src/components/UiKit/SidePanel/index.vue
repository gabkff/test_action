<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="store.isOpen" class="SidePanel" @click.self="handleClose">
        <div class="SidePanel__overlay" @click="handleClose" />
        
        <div class="SidePanel__container">
          <UiNavBar key="nav" />
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
              
              <template v-else-if="store.currentType === 'event'">
                <div class="SidePanel__event">
                  <!-- Contenu événement -->
                  <div class="SidePanel__title"> {{ store.payload.title }}</div>
                  <div class="SidePanel__image-wrapper">
                    <ui-swiper :options="{ slidesPerView: 1, spaceBetween: 30, centeredSlides: false }" :overflow="true" :navigation="true">
                      <ui-picture v-for="image in store.payload.images as Image[]" :key="image.meta" :images="image.images" class="SidePanel__image"/>
                    </ui-swiper>
                  </div>
                  <div class="SidePanel__content-dates-price">
                    <div class="SidePanel__dates-item">
                      <div class="SidePanel__dates-start" v-if="store.payload.date_start">
                        <div class="SidePanel__dates-start-label">{{ $t('events.date_debut') }}</div>
                        <div class="SidePanel__dates-start-value"> {{ new Date(store.payload.date_start_timestamp as number * 1000).toLocaleDateString('fr-CA', {  day: 'numeric', month: 'short', year: 'numeric' }) }} </div>
                      </div>
                      <div class="SidePanel__dates-end" v-if="store.payload.date_end">
                        <div class="SidePanel__dates-end-label">{{ $t('events.date_fin') }}</div>
                        <div class="SidePanel__dates-end-value"> {{ new Date(store.payload.date_end_timestamp as number * 1000).toLocaleDateString('fr-CA', {  day: 'numeric', month: 'short', year: 'numeric' }) }} </div>
                      </div>
                    </div>
                  </div>
                    <div class="SidePanel__price" v-if="store.payload.price_range">
                      <div class="SidePanel__price-label">{{ $t('events.price') }}</div>
                      <div class="SidePanel__price-value"> {{ store.payload.price_range }}</div>
                    </div>
                  
                  <div class="SidePanel__qrcode" v-if="store.payload.event_qrcode">
                    <div class="SidePanel__qrcode-label">{{ $t('events.access_site') }}</div>
                    <div class="SidePanel__qrcode-value"> {{ store.payload.event_qrcode }}re</div>
                  </div>
                  <div class="SidePanel__address">
                    <div class="SidePanel__address-icon">
                      <div class="SidePanel__address-icon-icon" v-html="IconPin" />
                      <div class="SidePanel__address-icon-text"> Adresse</div>
                    </div>
                    <div class="SidePanel__address-text"> {{ store.payload.address }}</div>
                  </div>
                  <!-- Flèches -->
                  <div class="SidePanel__scroll-arrows">
                    <UiButton theme="arrow" :direction="'up'" @click="scrollUpDesc()"/>
                    <UiButton theme="arrow" :direction="'down'" @click="scrollDownDesc()"/>
                  </div>
                  <div class="SidePanel__description" ref="descriptionEventRef">
                    <UiWysiwyg v-html="store.payload.description"/>
                  </div>
                </div>
              </template>
              
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
import IconPin from 'assets/svg/pin.svg?raw'
import Carousel from 'components/builder/Carousel/index.vue'
import UiWysiwyg from 'components/UiKit/Wysiwyg/index.vue'
import UiSwiper from 'components/UiKit/Swiper/index.vue'
import UiButton from 'components/UiKit/Button/index.vue'
import UiNavBar from 'components/NavBar/index.vue'

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

function scrollUpDesc() {
  console.log(descriptionEvent.value)
  descriptionEvent.value.scrollTop -= 100
}
function scrollDownDesc() {
  console.log(descriptionEvent.value)
  descriptionEvent.value.scrollTop += 100
}
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
    r(padding, 60px 80px)
    border-bottom 1px solid rgba($fjord, 0.1)
  &__image-wrapper
    width 100%
    height 100%
    :deep(.swiper-wrapper)
      gap 30px
    .SidePanel__image
      height 650px
      width 1155px !important
      background-color $fjord
      object-fit cover
  &__title
    f-style('h3')
    color $fjord
    margin 0
    margin-top 125px
    margin-bottom 120px
  &__qrcode
    border-top 2px solid $fjord
    border-bottom 2px solid $fjord
    padding-top 60px
    padding-bottom 60px
    margin-bottom 80px
    f(row, $justify: space-between)
    .SidePanel__qrcode-label
      f-style('h5')
      width 637px
    .SidePanel__qrcode-value
      background-color $fjord
      width 175px
  &__address
    f(column)
    align-items flex-start
    gap 10px
    f-style('small-body')
    color $fjord
    .SidePanel__address-icon
      f(row)
      gap 10px
      opacity 0.5
    .SidePanel__address-icon-icon
      width 25px
      height 25px
      display flex
      --icon-accent white
    .SidePanel__address-text
      f-style('bold-infos')
      text-align left
  &__description
    height 1580px
    overflow-y scroll
  .SidePanel__content-dates-price
    f(row)
    margin-top 120px
    margin-bottom 60px
    .SidePanel__dates-item
      f(row, $justify: space-between)
      width 100%
      gap 10px
      .SidePanel__dates-start-label, .SidePanel__dates-end-label
        f-style('small-body')
        color $fjord
        opacity 0.5
      .SidePanel__dates-start-value, .SidePanel__dates-end-value
        f-style('bold-infos')
  .SidePanel__price
    margin-bottom 60px
    .SidePanel__price-label
      f-style('small-body')
      color $fjord
      opacity 0.5
    .SidePanel__price-value
      f-style('bold-infos')
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
  &__scroll-arrows
    f(row, $justify: flex-end)
    gap 29px
    &__icon--arrow
      height 120px
      width 128x
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

