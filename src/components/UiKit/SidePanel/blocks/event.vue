<template>
    <div class="SidePanel__event">
      <!-- Contenu événement -->
      <div class="SidePanel__event__title"> {{ store.payload.title }} test</div>
      <div class="SidePanel__event__image-wrapper">
        <ui-swiper :options="{ slidesPerView: 'auto', spaceBetween: 30, centeredSlides: false }" :overflow="true" :navigation="[store.payload.main_image, ...store.payload.images as ImageDetail[]].length > 1">
          <ui-picture v-for="image in [store.payload.main_image, ...store.payload.images as ImageDetail[]] as Image[]" :key="image.meta" :images="image.images" class="SidePanel__event__image" :cover="'cover'"/>
        </ui-swiper>
      </div>
      <div class="SidePanel__event__content-dates-price">
        <div class="SidePanel__event__dates-item">
          <div class="SidePanel__event__dates-start" v-if="store.payload.date_start">
            <div class="SidePanel__event__dates-start-label">{{ $t('events.date_debut') }}</div>
            <div class="SidePanel__event__dates-start-value"> {{ new Date(store.payload.datetime_start_timestamp as number * 1000).toLocaleDateString('fr-CA', {  day: 'numeric', month: 'short', year: 'numeric' }) }} </div>
          </div>
          <div class="SidePanel__event__dates-end" v-if="store.payload.date_end">
            <div class="SidePanel__event__dates-end-label">{{ $t('events.date_fin') }}</div>
            <div class="SidePanel__event__dates-end-value"> {{ new Date(store.payload.datetime_end_timestamp as number * 1000).toLocaleDateString('fr-CA', {  day: 'numeric', month: 'short', year: 'numeric' }) }} </div>
          </div>
        </div>
      </div>
        <div class="SidePanel__event__price" v-if="store.payload.price_range">
          <div class="SidePanel__event__price-label">{{ $t('events.price') }}</div>
          <div class="SidePanel__event__price-value"> {{ store.payload.price_range }}</div>
        </div>
        <div class="SidePanel__event__address">
            <div class="SidePanel__event__address-icon">
            <div class="SidePanel__event__address-icon-icon" v-html="IconPin" />
            <div class="SidePanel__event__address-icon-text"> Adresse</div>
            </div>
            <div class="SidePanel__event__address-text"> {{ store.payload.address }}</div>
      </div>
      <div class="SidePanel__event__qrcode" v-if="store.payload.event_qr">
        <div class="SidePanel__event__qrcode-label">{{ $t('events.access_site') }}</div>
        <div class="SidePanel__event__qrcode-value"> {{ store.payload.event_qr }}re</div>
      </div>

        <div class="SidePanel__event__scroll" ref="descriptionEventRef">
            <!-- Flèches de navigation -->
            <div class="SidePanel__event__scroll-arrows" v-if="isScrollable">
                <UiButton theme="arrow" :direction="'up'" @click="scrollUpDesc()"/>
                <UiButton theme="arrow" :direction="'down'" @click="scrollDownDesc()"/>
            </div>
            <div class="SidePanel__event__scroll-content">
                <div class="SidePanel__event__scroll-text"> 
                    <UiWysiwyg v-html="store.payload.description"/>
                </div>
            </div>
        </div>
    </div>
  </template>

<script setup lang="ts">
import { useSidePanelStore } from 'store/sidePanel'
import IconPin from 'assets/svg/pin.svg?raw'
import UiWysiwyg from 'components/UiKit/Wysiwyg/index.vue'
import UiSwiper from 'components/UiKit/Swiper/index.vue'
import UiButton from 'components/UiKit/Button/index.vue'
import { useTemplateRef, computed } from 'vue'
const store = useSidePanelStore()
const descriptionEvent = useTemplateRef<HTMLElement | null>('descriptionEventRef')

const isScrollable = computed(() =>  {
    if (!descriptionEvent.value) return false
    return descriptionEvent.value.scrollHeight > descriptionEvent.value.clientHeight
})

function scrollUpDesc() {
  if (!descriptionEvent.value) return
  descriptionEvent.value.scrollTop -= 100
}
function scrollDownDesc() {
  if (!descriptionEvent.value) return
  descriptionEvent.value.scrollTop += 100
}
</script>

<style lang="stylus" scoped>
.SidePanel__event
    display flex
    flex-direction column
    overflow-y visible
    overflow-x hidden
    height 100%
    &__title
        r(padding-left, 60px 60px)
        r(padding-right, 60px 60px)
        f-style('h3')
        color $fjord
        margin 0
        margin-top 125px
        margin-bottom 120px
    &__address
        r(margin-left, 60px 60px)
        r(margin-right, 60px 60px)
        f(column)
        align-items flex-start
        gap 10px
        f-style('small-body')
        color $fjord
    &__address-icon
        f(row)
        gap 10px
        opacity 0.5
    &__address-icon-icon
        width 25px
        height 25px
        display flex
        --icon-accent white
    &__address-text
        f-style('bold-infos')
        text-align left
    &__content-dates-price
        margin-left 60px
        margin-right 60px
        f(row)
        margin-top 120px
        margin-bottom 60px
    &__image-wrapper
        width 100%
        height 650px
        padding-left 60px
        .SidePanel__event__image
            height 100%
            width 1155px !important
            background-color $fjord
            object-fit cover
    &__dates-item
        f(row, $justify: space-between)
        width 100%
        gap 10px
    &__dates-start-label, &__dates-end-label
        f-style('small-body')
        color $fjord
        opacity 0.5
    &__dates-start-value, &__dates-end-value
        f-style('bold-infos')
    &__price
        margin-bottom 60px
        r(margin-left, 60px 60px)
        r(margin-right, 60px 60px)
    &__price-label
        f-style('small-body')
        color $fjord
        opacity 0.5
    &__price-value
        f-style('bold-infos')
    &__qrcode
        border-top 2px solid $fjord
        border-bottom 2px solid $fjord
        padding-top 60px
        padding-bottom 60px
        f(row, $justify: space-between)
    &__qrcode-label
        f-style('h5')
        width 637px
    &__qrcode-value
        background-color $fjord
        width 175px
    &__scroll
        f(column, $justify: flex-start, $align: flex-start)
        margin-top 80px
        r(padding-right, 60px 60px)
        r(padding-left, 60px 60px)
        padding-bottom 80px
        overflow-y scroll
        overflow-x hidden
        min-height 0
        position relative
        flex 1
    &__scroll-content
        width 100%
        flex 1
    &__map
        height 600px
        width 100%
    &__scroll-text
        margin-bottom 120px
    &__scroll-arrows
        position sticky
        z-index 10
        top 0
        left 100%
        f(row, $justify: flex-start)
        gap 29px
        pointer-events none
        :deep(.UiButton)
            pointer-events all
</style>