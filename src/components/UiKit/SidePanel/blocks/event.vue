<template>
    <div class="SidePanel__event" v-if="currentEvent">
      <!-- Contenu événement -->
      <div class="SidePanel__event__title"> {{ currentEvent.title }}</div>
      <div class="SidePanel__event__image-wrapper" v-if="eventImages.length > 0">
        <ui-swiper :options="{ slidesPerView: 'auto', spaceBetween: 30, centeredSlides: false }" :overflow="true" :navigation="eventImages.length > 1">
          <ui-picture v-for="image in eventImages" :key="image.meta" :images="image.images" class="SidePanel__event__image" :cover="'cover'"/>
        </ui-swiper>
      </div>
      <div class="SidePanel__event__content-dates-price">
        <div class="SidePanel__event__dates-item">
          <div class="SidePanel__event__dates-start" v-if="currentEvent.date_start">
            <div class="SidePanel__event__dates-start-label">{{ $t('events.date_debut') }}</div>
            <div class="SidePanel__event__dates-start-value"> {{ new Date(currentEvent.datetime_start_timestamp as number * 1000).toLocaleDateString(`${i18nStore.locale}-CA`, {  day: 'numeric', month: 'short', year: 'numeric' }) }} </div>
          </div>
          <div class="SidePanel__event__dates-end" v-if="currentEvent.date_end">
            <div class="SidePanel__event__dates-end-label">{{ $t('events.date_fin') }}</div>
            <div class="SidePanel__event__dates-end-value"> {{ new Date(currentEvent.datetime_end_timestamp as number * 1000).toLocaleDateString(`${i18nStore.locale}-CA`, {  day: 'numeric', month: 'short', year: 'numeric' }) }} </div>
          </div>
        </div>
      </div>
        <div class="SidePanel__event__price" v-if="currentEvent.price_range">
          <div class="SidePanel__event__price-label">{{ $t('events.price') }}</div>
          <div class="SidePanel__event__price-value" v-html="currentEvent.price_range as HtmlText" />
        </div>
        <div class="SidePanel__event__address">
            <div class="SidePanel__event__address-icon">
              <div class="SidePanel__event__address-icon-icon" v-html="IconLocation" />
              <div class="SidePanel__event__address-icon-text"> {{ $t('circuits.adress') }}</div>
            </div>
            <div class="SidePanel__event__address-text"> {{ currentEvent.address }}</div>
      </div>
      <div class="SidePanel__event__qrcode" v-if="currentEvent.event_qr">
        <div class="SidePanel__event__qrcode-label">{{ $t('events.access_site') }}</div>
        <img class="SidePanel__event__qrcode-value" :src="currentEvent.event_qr"></img>
      </div>

        <div class="SidePanel__event__scroll" ref="descriptionEventRef">
            <!-- Flèches de navigation -->
            <div class="SidePanel__event__scroll-arrows" v-if="isScrollable && isDesktop">
                <UiButton theme="arrow" :direction="'up'" @click="scrollUpDesc()"/>
                <UiButton theme="arrow" :direction="'down'" @click="scrollDownDesc()"/>
            </div>
            <div class="SidePanel__event__scroll-content">
                <div class="SidePanel__event__scroll-text"> 
                    <UiWysiwyg v-html="currentEvent.description"/>
                </div>
            </div>
        </div>
    </div>
  </template>

<script setup lang="ts">
import { store as appStore } from 'plugins/store/app'
import { useI18nStore } from 'plugins/i18n/store'
import IconLocation from 'assets/svg/location.svg?raw'
import UiWysiwyg from 'components/UiKit/Wysiwyg/index.vue'
import UiSwiper from 'components/UiKit/Swiper/index.vue'
import UiButton from 'components/UiKit/Button/index.vue'
import { useTemplateRef, computed, ref, watch, nextTick } from 'vue'

const i18nStore = useI18nStore()
const isScrollable = ref(false)
const descriptionEvent = useTemplateRef<HTMLElement | null>('descriptionEventRef')

const currentEvent = computed(() => {
  return appStore.currentEvent
})

// Liste des images de l'événement (main_image + images additionnelles)
const eventImages = computed(() => {
  if (!currentEvent.value) return []
  const images: Image[] = []
  if (currentEvent.value.main_image) {
    images.push(currentEvent.value.main_image)
  }
  if (currentEvent.value.images && Array.isArray(currentEvent.value.images)) {
    images.push(...currentEvent.value.images)
  }
  return images
})

const checkScroll = () => {
  if (!descriptionEvent.value) {
    isScrollable.value = false
    return
  }
  // On compare scrollHeight et clientHeight
  isScrollable.value = descriptionEvent.value.scrollHeight > descriptionEvent.value.clientHeight
}

watch(
  [() => i18nStore.locale, () => currentEvent.value?.description], 
  async () => {
    // Crucial : on attend que Vue ait mis à jour le DOM avec le nouveau texte
    await nextTick()
    checkScroll()
  }, 
  { immediate: true }
)

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
        r(padding-left, 60px 40px)
        r(padding-right, 60px 40px)
        f-style('h3')
        color $fjord
        margin 0
        r(margin-top, 125px 0px)
        r(margin-bottom, 120px 60px)
        +layout(mobile)
          font-size 35px
          font-weight $fw-bold
          line-height 1.1
    &__address
        r(margin-left, 60px 40px)
        r(margin-right, 60px 40px)
        f(column)
        align-items flex-start
        gap 10px
        f-style('small-body')
        color $fjord
        +layout(mobile)
            font-size 15px
            font-weight $fw-medium
            line-height 1.3
    &__address-icon
        f(row, $justify: flex-start)
        gap 12px
        opacity 0.5
    &__address-icon-icon
        r(width, 21px 10px)
        r(height, 29px 14px)
        display flex
        --icon-accent white
        +layout(mobile)
            :deep(svg)
                width 100%
                height 100%
    &__address-text
        f-style('bold-infos')
        text-align left
        +layout(mobile)
            font-size 15px
            font-weight $fw-bold
            line-height 1.3
    &__content-dates-price
        r(margin-left, 60px 40px)
        r(margin-right, 60px 40px)
        f(row)
        r(margin-top, 120px 60px)
        r(margin-bottom, 60px 30px)
    &__image-wrapper
        width 100%
        r(height, 650px 244px)
        r(padding-left, 60px 40px)
        .SidePanel__event__image
            height 100%
            width 1155px !important
            background-color $fjord
            object-fit cover
            +layout(mobile)
                width 433px !important
    &__dates-item
        f(row, $justify: space-between)
        width 100%
        gap 10px
    &__dates-start-label, &__dates-end-label
        f-style('small-body')
        color $fjord
        opacity 0.5
        +layout(mobile)
            font-size 15px
            font-weight $fw-medium
            line-height 1.3
    &__dates-start-value, &__dates-end-value
        f-style('bold-infos')
        +layout(mobile)
            font-size 15px
            font-weight $fw-bold
            line-height 1.3
    &__price
        r(margin-bottom, 60px 30px)
        r(margin-left, 60px 40px)
        r(margin-right, 60px 40px)
    &__price-label
        f-style('small-body')
        color $fjord
        opacity 0.5
        +layout(mobile)
            font-size 15px
            font-weight $fw-medium
            line-height 1.3
    &__price-value
        f-style('bold-infos')
        +layout(mobile)
            font-size 15px
            font-weight $fw-bold
            line-height 1.3
    &__qrcode
        border-top 2px solid $fjord
        border-bottom 2px solid $fjord
        r(padding-top, 60px 30px)
        r(padding-bottom, 60px 30px)
        f(row, $justify: space-between)
        r(margin-top, 60px 30px)
        r(margin-left, 60px 40px)
        r(margin-right, 60px 40px)
    &__qrcode-label
        f-style('h5')
        r(width, 637px 318px)
        +layout(mobile)
            font-size 25px
            line-height 1.1
            font-weight $fw-bold
    &__qrcode-value
        background-color $fjord
        r(width, 175px 88px)
    &__scroll
        f(column, $justify: flex-start, $align: flex-start)
        r(margin-top, 80px 40px)
        r(padding-right, 60px 40px)
        r(padding-left, 60px 40px)
        r(padding-bottom, 80px 40px)
        overflow-y scroll
        overflow-x hidden
        min-height 0
        position relative
        flex 1
    &__scroll-content
        width 100%
        flex 1
    &__scroll-text
       r(margin-bottom, 120px 0px)
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