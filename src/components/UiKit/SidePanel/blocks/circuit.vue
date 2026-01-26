<template>
    <div class="SidePanel__circuit" v-if="current && currentStep">
        <div class="SidePanel__circuit__header"> {{$t('circuits.name') + '-' + current.title }} </div>
        <div class="SidePanel__circuit__step"> 
            <ui-button theme="icon" :icon="IconBoot" v-if="currentStep.activity_type === 'Promenade'"/>
            <div>{{ $t('circuits.step', { number: data.index }) }} </div>
        </div>
        <div class="SidePanel__circuit__title"> {{ currentStep.title }}</div>
        <div class="SidePanel__circuit__image-wrapper">
        <ui-swiper :options="{ slidesPerView: 'auto', spaceBetween: 30, centeredSlides: false }" :overflow="true" :navigation="true">
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
            <div class="SidePanel__circuit__scroll-arrows" v-if="isScrollable">
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
                        :encodedPolyline="[{line: nextStepPolyline, style: 'next'}, {line: previousStepPolyline, style: 'previous'}]"
                        :markers="markers"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useTemplateRef, computed, ComputedRef } from 'vue'
import { store as appStore } from 'plugins/store/app'
import UiButton from 'components/UiKit/Button/index.vue'
import IconBoot from 'assets/svg/boot.svg?raw'
import IconPin from 'assets/svg/pin.svg?raw'
import UiMap from 'components/ui/Maps/index.vue'
import UiWysiwyg from 'components/UiKit/Wysiwyg/index.vue'
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})
const current = computed(() => {
  return appStore.current
})

const markers: any = computed(() => {
  const markers = []
  if (!current.value?.steps || current.value?.steps.length === 0) return undefined
  for (const step of current.value?.steps) {
    markers.push({
      position: { lat: step.map.latitude, lng: step.map.longitude },
      icon: IconPin
    })
  }
  return markers
})

const nextStepPolyline = computed(() => {
  return appStore.nextStepPolyline
})
const previousStepPolyline = computed(() => {
  return appStore.previousStepPolyline
})
const currentNextParcours = computed(() => {
  return appStore.currentNextParcours
})
const currentStep: ComputedRef<CircuitStep | null | undefined> = computed(() => {
  return appStore.currentStep
})

const descriptionEvent = useTemplateRef<HTMLElement | null>('descriptionEventRef')

const isScrollable = computed(() =>  {
    if (!descriptionEvent.value) return false
    return descriptionEvent.value.scrollHeight > descriptionEvent.value.clientHeight
})

function scrollUpDesc() {
  console.log('scrollUpDesc', descriptionEvent.value)
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
    &__header
        f-style('body')
        r(padding-left, 60px 60px)
        r(padding-right, 60px 60px)
    &__step
        f(row, $justify: flex-start)
        r(padding-left, 60px 60px)
        r(padding-right, 60px 60px)
        gap 40px
        margin-top 120px
        f-style('subtitle')
        .UiButton--icon
            width 94px
            height 94px
    &__title
        r(padding-left, 60px 60px)
        r(padding-right, 60px 60px)
        f-style('h3')
        margin 0
        margin-top 125px
        margin-bottom 120px
    &__image-wrapper
        width 100%
        height 650px
        .SidePanel__circuit__image
            height 100%
            width 1155px !important
            background-color $fjord
            object-fit cover
    &__header
        f-style('default')
    &__content-info
        f(row, $justify: flex-start)
        r(padding-left, 60px 60px)
        r(padding-right, 60px 60px)
        margin-top 120px
        width 100%
        flex-wrap wrap
        .SidePanel__circuit__content-info-item
            f(column, $justify: flex-start)
            width 50%
            margin-bottom 60px
            .SidePanel__circuit__content-info-item-label
                f-style('subtitle')
                opacity .5
            .SidePanel__circuit__content-info-item-label:first-letter
                text-transform uppercase
            .SidePanel__circuit__content-info-item-value
                f-style('bold-infos')
                margin-top 8px
            .SidePanel__circuit__content-info-item-value:first-letter
                text-transform uppercase
    &__qrcode
        border-top 2px solid $fjord
        border-bottom 2px solid $fjord
        padding-top 60px
        padding-bottom 60px
        margin-bottom 80px
        margin-left 60px
        margin-right 60px
        f(row, $justify: space-between)
        .SidePanel__circuit__qrcode-label
            f-style('h5')
            width 637px
        .SidePanel__circuit__qrcode-value
            background-color $fjord
            width 175px
            img
                width 100%
                height 100%
    &__scroll
        f(column, $justify: flex-start, $align: flex-start)
        padding-bottom 80px
        r(margin-right, 60px 60px)
        r(margin-left, 60px 60px)
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