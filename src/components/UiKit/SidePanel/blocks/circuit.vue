<template>
    <div class="SidePanel__circuit" v-if="current && currentStep">
        <div class="SidePanel__circuit__header"> {{$t('circuits.name') + ' ' + (circuitIndex! + 1) + ' - ' + current.title }} </div>
        <div class="SidePanel__circuit__step"> 
            <ui-button theme="icon" :icon="currentStep.icon"/>
            <div>{{ $t('circuits.step', { number: data.index }) }} </div>
        </div>
        <div class="SidePanel__circuit__title"> {{ currentStep.title }}</div>
        <div class="SidePanel__circuit__image-wrapper">
        <ui-swiper :options="{ slidesPerView: 'auto', spaceBetween: isDesktop ? 30 : 15, centeredSlides: false }" :overflow="true" :navigation="currentStep.images.length > 1">
            <ui-picture v-for="image in currentStep.images as Image[]" :key="image.meta" :images="image.images" class="SidePanel__circuit__image"/>
        </ui-swiper>
        </div>
        <div class="SidePanel__circuit__content-info">
            <div class="SidePanel__circuit__content-info-item" v-if="currentStep.estimated_time">
                <div class="SidePanel__circuit__content-info-item-label">{{ $t('circuits.activity_time') }}</div>
                <div class="SidePanel__circuit__content-info-item-value"> {{ currentStep.estimated_time }}</div>
            </div>
            <div class="SidePanel__circuit__content-info-item" v-if="currentStep.seasons">
                <div class="SidePanel__circuit__content-info-item-label">{{ $t('circuits.best_season') }}</div>
                <div class="SidePanel__circuit__content-info-item-value"> 
                    <template v-for="(season, seasondex) in currentStep.seasons" :key="season">
                        <span>{{ season }}</span>
                        <template v-if="seasondex as number < (currentStep.seasons.length - 1)">,&nbsp;</template>
                    </template>
                </div>
            </div>
            <div class="SidePanel__circuit__content-info-item" v-if="currentStep.essentials">
                <div class="SidePanel__circuit__content-info-item-label">{{ $t('circuits.need') }}</div>
                <div class="SidePanel__circuit__content-info-item-value"> 
                {{ currentStep.essentials }}
                </div>
            </div>
            <div class="SidePanel__circuit__content-info-item" v-if="currentStep.activity_type">
                <div class="SidePanel__circuit__content-info-item-label">{{ $t('circuits.type') }}</div>
                <div class="SidePanel__circuit__content-info-item-value"> {{ currentStep.activity_type }}</div>
            </div>
            <div class="SidePanel__circuit__content-info-item" v-if="currentStep.map_address">
                <div class="SidePanel__circuit__address-icon">
                    <div class="SidePanel__circuit__address-icon-icon" v-html="IconLocation" />
                    <div class="SidePanel__circuit__content-info-item-label">{{ $t('circuits.adress') }}</div>
                </div>
                <div class="SidePanel__circuit__content-info-item-value"> {{ currentStep.map_address }}</div>
            </div>
        </div>
        <div class="SidePanel__circuit__qrcode" v-if="data.qr">
            <div class="SidePanel__circuit__qrcode-label">{{ $t('circuits.qrcode') }}</div>
            <div class="SidePanel__circuit__qrcode-value">
                <img :src="data.qr" alt="QR Code" class="SidePanel__circuit__qrcode-value-img"/>
            </div>
        </div>
        <!-- Flèches -->
         <!-- Zone scrollable -->
         <div class="SidePanel__circuit__scroll" ref="descriptionEventRef">
            <!-- Flèches de navigation -->
            <div class="SidePanel__circuit__scroll-arrows" v-if="isScrollable && isDesktop">
                <UiButton theme="arrow" :direction="'up'" @click="scrollUpDesc()"/>
                <UiButton theme="arrow" :direction="'down'" @click="scrollDownDesc()"/>
            </div>
            <div class="SidePanel__circuit__scroll-content">
                <div class="SidePanel__circuit__scroll-text"> 
                    <UiWysiwyg v-html="currentStep.main_text"/>
                </div>
                <div class="SidePanel__circuit__map">
                    <UiMap
                        ref="mapRef"
                        id="sidepanel-map"
                        :lock="true"
                        :zoom="15"
                        :center="currentStep.map"
                        v-if="currentStep.map"
                        :currentStep="currentStep"
                        :currentStepIndex="currentStepIndex"
                        :allPolylines="allPolylines"
                        :markers="markers"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useTemplateRef, computed, ComputedRef, ref, watch, nextTick } from 'vue'
import { store as appStore } from 'plugins/store/app'
import { useI18nStore } from 'plugins/i18n/store'
import { store as interfaceStore } from 'plugins/store/interface'
import UiButton from 'components/UiKit/Button/index.vue'
import UiMap from 'components/ui/Maps/index.vue'
import UiWysiwyg from 'components/UiKit/Wysiwyg/index.vue'
import IconLocation from 'assets/svg/location.svg?raw'
import { useCircuit } from 'plugins/utils'
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})
const current = computed(() => {
  return appStore.current
})
const { circuitIndex } = useCircuit()
const isDesktop = computed(() => interfaceStore.isDesktop)
const i18nStore = useI18nStore()
const isScrollable = ref(false)
const markers: any = computed(() => {
  const markers = []
  if (!current.value?.steps || current.value?.steps.length === 0) return undefined
  for (const step of current.value?.steps) {
    markers.push({
      position: { lat: step.map.latitude, lng: step.map.longitude },
      icon: currentStep.value?.icon
    })
  }
  return markers
})

const allPolylines = computed(() => {
    if (!current.value?.steps) return []
    return current.value.steps
        .map(step => step.next_step?.polyline)
        .filter(p => p !== null && p !== undefined) 
})
const currentStepIndex = computed(() => {
    return appStore.currentStepIndex
})
const currentNextParcours = computed(() => {
  return appStore.currentNextParcours
})
const currentStep: ComputedRef<CircuitStep | null | undefined> = computed(() => {
  return appStore.currentStep
})

const descriptionEvent = useTemplateRef<HTMLElement | null>('descriptionEventRef')

const checkScroll = () => {
  if (!descriptionEvent.value) {
    isScrollable.value = false
    return
  }
  // On compare scrollHeight et clientHeight
  isScrollable.value = descriptionEvent.value.scrollHeight > descriptionEvent.value.clientHeight
}

watch(
  [() => i18nStore.locale, () => currentStep.value?.description], 
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
.SidePanel__circuit
    color $fjord
    display flex
    flex-direction column
    overflow-y visible
    overflow-x hidden
    height 100%
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
    &__header
        f-style('default')
        r(padding-left, 60px 40px)
        r(padding-right, 60px 40px)
        +layout(mobile)
            font-family $ff-text
            font-size 18px
            font-weight $fw-medium
            line-height 1.4
    &__step
        f(row, $justify: flex-start)
        r(padding-left, 60px 40px)
        r(padding-right, 60px 40px)
        r(gap, 40px 15px)
        r(margin-top, 120px 20px)
        f-style('subtitle')
        .UiButton--icon
            r(width, 94px 47px)
            r(height, 94px 47px)
    &__title
        r(padding-left, 60px 40px)
        r(padding-right, 60px 40px)
        f-style('h3')
        margin 0
        r(margin-top, 50px 20px)
        r(margin-bottom, 120px 60px)
        +layout(mobile)
            font-size 35px
            font-weight $fw-bold
            line-height 1.1
    &__image-wrapper
        width 100%
        r(height, 650px 244px)
        r(padding-left, 60px 40px)
        .SidePanel__circuit__image
            height 100%
            width 1155px !important
            background-color $fjord
            object-fit cover
            +layout(mobile)
                width 433px !important
    &__content-info
        f(row, $justify: flex-start)
        r(padding-left, 60px 40px)
        r(padding-right, 60px 40px)
        r(margin-top, 120px 40px)
        width 100%
        flex-wrap wrap
        .SidePanel__circuit__content-info-item
            f(column, $justify: flex-start)
            width 50%
            r(margin-bottom, 60px 30px)
            .SidePanel__circuit__content-info-item-label
                f-style('subtitle')
                opacity .5
                +layout(mobile)
                    font-size 15px
                    font-weight $fw-medium
                    line-height 1.3
            .SidePanel__circuit__content-info-item-label:first-letter
                text-transform uppercase
            .SidePanel__circuit__content-info-item-value
                f-style('bold-infos')
                r(margin-top, 8px 4px)
                +layout(mobile)
                    font-size 15px
                    font-weight $fw-bold
                    line-height 1.3
            .SidePanel__circuit__content-info-item-value:first-letter
                text-transform uppercase
    &__qrcode
        border-top 2px solid $fjord
        border-bottom 2px solid $fjord
        r(padding-top, 60px 40px)
        r(padding-bottom, 60px 40px)
        r(margin-bottom, 80px 40px)
        r(margin-left, 60px 40px)
        r(margin-right, 60px 40px)
        f(row, $justify: space-between)
        .SidePanel__circuit__qrcode-label
            f-style('h5')
            r(width, 637px 318px)
            +layout(mobile)
                font-size 23px
                line-height 1.1
                font-weight $fw-bold
        .SidePanel__circuit__qrcode-value
            background-color $fjord
            r(width, 175px 88px)
            img
                width 100%
                height 100%
    &__scroll
        f(column, $justify: flex-start, $align: flex-start)
        padding-bottom 80px
        r(margin-right, 60px 40px)
        r(margin-left, 60px 40px)
        overflow-y scroll
        overflow-x hidden
        min-height 0
        position relative
        flex 1
    &__scroll-content
        width 100%
        flex 1
    &__map
        r(height, 600px 300px)
        width 100%
    &__scroll-text
        r(margin-bottom, 120px 30px)
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