<template>
    <div class="circuits-etape" v-if="ready && current" :data-circuit-theme="circuitIndex">
      <div class="circuits-etape__container">
        <h2 class="circuits-etape__name" :data-circuit-theme="circuitIndex">{{ $t('circuits.name') }} 1</h2>
        <h1 class="circuits-etape__title" :data-circuit-theme="circuitIndex">{{ current.title }}</h1>
      
        <div class="circuits-etape__header_wrapper" v-if="currentStepIndex < current.steps.length">
          <UiSelector
            v-model="currentView"
            :options="[
              { value: 'map', icon: IconMap, label: 'carte'},
              { value: 'list', label: 'liste', icon: IconList }
            ]"
            @change="(value) =>onViewChange(value as ViewCircuit)"
            :data-circuit-theme="circuitIndex"
          />
          <div class="circuits-etape__actions">
            <ui-button 
              theme="primary"
              :big="true"
              :icon="IconQr"
              :iconPosition="'right'"
              :label="$t('circuits.scan')" 
              @click="sidePanelStore.openQrCode({ title: current.title, qr: current.base64_qr, index: circuitIndex})" 
            />
            <div v-if="current.description" class="circuits-etape__description">
              <p>{{ current.description }}</p>
            </div>
          </div>
        </div>
        
      </div>
      <div class="circuits-etape__view_container" v-if="currentStep &&currentStep.images" :data-view="currentView">
        
        <ui-picture :images="currentStep.images[0]" :data-index="currentStepIndex" cover="cover" v-if="currentView === 'list'"/>
        <div class="circuits-etape__background" v-html="IconLine" :data-circuit-theme="circuitIndex" v-if="currentView === 'list'"></div>
        <div class="circuits-etape__step_container_wrapper">
        <div class="circuits-etape__step_container">
          <UiNavBar key="navbar"  class="circuits-etape__navbar" :next="currentStepIndex < current.steps.length ? true : false" :previous="currentStepIndex > 0 ? true : false" @next="setStep('next')" @previous="setStep('previous')"/>
          <div class="circuits-etape__step_content">
            <div class="circuits-etape__step_content_header">
              <ui-button theme="icon" :icon="IconMap"/>
              <div class="circuits-etape__step_content_step_total">{{ $t('circuits.step_total', { number: currentStepIndex + 1, total: current.steps.length }) }} </div>
            </div>
           <h2 class="circuits-etape__step_content_title">{{ currentStep.title }}</h2>
            <div class="circuits-etape__step_content_description">
              <p>{{ currentStep.description }}</p>
            </div>
            <div class="circuits-etape__step_content_itinerary" v-if="currentStepIndex === 0">
              <div class="circuits-etape__step_content_itinerary_label" data-index="0">{{ $t('circuits.from_here') }}</div>
              <UiTag :label="current.commute_to_circuit.time + 'min'" :icon="current.commute_to_circuit.transportation.includes('pieds') ? IconWalk : IconCar" data-index="0"/>
            </div>
          </div>
          <ui-button 
            theme="secondary" 
            :label="$t('circuits.more')" 
            :big="true"
            :icon="IconPlus"
            :iconPosition="'right'"
            class="circuits-etape__step_see_more"
            @click="sidePanelStore.openCircuitStep({ title: current.title, step: currentStep, index: currentStepIndex + 1, qr: current.base64_qr})"
          />
        </div>
        <div class="circuits-etape__step_container_steps_wrapper" :data-view="currentView">
          <div class="circuits-etape__step_container_steps" v-if="currentView === 'map' && currentNextParcours.length > 0">
            <div class="circuits-etape__step_container_steps_content">
              <div class="circuits-etape__step_container_steps_content_wrapper">
                <div class="circuits-etape__step_container_steps_content_wrapper_label"> {{ $t('circuits.next_step') }} </div>
                <div class="circuits-etape__step_container_steps_content_wrapper_title"> 
                  {{ current.steps[currentStepIndex + 1].title }} 
                </div>
              </div>
              <UiButton 
                theme="secondary" 
                :icon="IconArrow" 
                :big="true" 
                class="circuits-etape__step_container_steps_content_button circuits-etape__step_container_steps_content_button--next" 
                :data-view="currentView"
                @click="setStep('next')"
              />
            </div>
            <div class="circuits-etape__step_content_itinerary">
                <div class="circuits-etape__step_content_itinerary_label">{{ $t('circuits.itinerary_time') }}</div>
                <UiTag :label="current.steps[currentStepIndex + 1].next_step.time + 'min'" :icon="current.steps[currentStepIndex + 1].next_step.transportation.includes('pieds') ? IconWalk : IconCar" data-index="1" :data-view="currentView"/>
            </div>
          </div>
          <div class="circuits-etape__step_container_steps" v-if="currentStepIndex > 0">
            <div class="circuits-etape__step_container_steps_content" :data-view="currentView">
              <div class="circuits-etape__step_container_steps_content_wrapper">
                <div class="circuits-etape__step_container_steps_content_wrapper_label"> {{ $t('circuits.previous_step') }} </div>
                <div class="circuits-etape__step_container_steps_content_wrapper_title"> 
                  {{ current.steps[currentStepIndex - 1].title }} 
                </div>
              </div>
              <UiButton 
                theme="secondary" 
                :icon="IconArrow" 
                :big="true" 
                class="circuits-etape__step_container_steps_content_button" 
                :data-view="currentView"
                @click="setStep('previous')"
              />
            </div>
            <div class="circuits-etape__step_content_itinerary">
                <div class="circuits-etape__step_content_itinerary_label">{{ $t('circuits.itinerary_time') }}</div>
                <UiTag :label="current.steps[currentStepIndex - 1].next_step.time + 'min'" :icon="current.steps[currentStepIndex - 1].next_step.transportation.includes('pieds') ? IconWalk : IconCar" data-index="1" :data-view="currentView"/>
            </div>
          </div>
        </div>
        <UiMap 
          :zoom="15"
          :center="currentStep.map"
          v-if="currentStep.map"
          :markers="markers"
          :encodedPolyline="[{line: nextStepPolyline, style: 'next'}, {line: previousStepPolyline, style: 'previous'}]"
        />
      </div>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
declare type ViewCircuit = 'list' | 'map'
import { watchEffect, ref, computed, ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import { useSidePanelStore } from 'store/sidePanel'
import { store as appStore } from 'plugins/store/app'
import UiSelector from 'components/ui/Selector.vue'
import UiNavBar from 'components/NavBar/index.vue'
import UiTag from 'components/UiKit/Tag/index.vue'
import UiMap from 'components/ui/Maps/index.vue'
import IconMap from 'assets/svg/pin.svg?raw'
import IconList from 'assets/svg/list.svg?raw'
import IconQr from 'assets/svg/qrcode.svg?raw'
import IconLine from 'assets/svg/line_background.svg?raw'
import IconWalk from 'assets/svg/walk.svg?raw'
import IconCar from 'assets/svg/car.svg?raw'
import IconPlus from 'assets/svg/plus.svg?raw'
import IconArrow from 'assets/svg/arrow.svg?raw'
import IconPin from 'assets/svg/pin.svg?raw'
import { UiButton } from '@/components/UiKit'

const route = useRoute()
const ready = ref(false)
const sidePanelStore = useSidePanelStore()
const currentView = ref<ViewCircuit>('map')

// Validation du slug et redirection si invalide
// a voir si pas on mounted plutôt
watchEffect(() => {
  // On attend que l'app soit prête (données chargées)
  if (!appStore.isAppReady || !appStore.circuits) return
  const slug = route.params.slug as string
  appStore.setCircuitBySlug(slug, true)
  ready.value = true
})
const current = computed(() => {
  return appStore.current
})

const currentStepIndex = computed(() => {
  return appStore.currentStepIndex
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
const currentStep: ComputedRef<CircuitStep | undefined> = computed(() => {
  return current.value?.steps[currentStepIndex.value]
})

const circuitIndex = computed(() => {
  return appStore.getCircuitIndex(current.value?.slug as string) ?? null
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

function onViewChange(value: ViewCircuit) {
    console.log('View changed to:', value)
    currentView.value = value
}

function setStep(direction: 'next' | 'previous') {
  if (direction === 'next') {
    appStore.setCurrentStepIndex(currentStepIndex.value + 1)
  } else {
    appStore.setCurrentStepIndex(currentStepIndex.value - 1)
  }
}

</script>
  
<style lang="stylus" scoped>
  .circuits-etape
    background-color $fjord
    min-height 100vh
    height 100%
    &[data-circuit-theme="1"]
      background-color $penombre
      &__title
        color $crepuscule
    &[data-circuit-theme="2"]
      background-color $epinette
      &__title
        color $bouleau
    &__container
      container()
      margin-top 100px
      margin-bottom 100px
    &__name
      f-style('h5')
      color $aube
      &[data-circuit-theme="1"]
        color $crepuscule
      &[data-circuit-theme="2"]
        color $bouleau
    &__title
      f-style('h1')
      color $aube
      margin-bottom 90px
      &[data-circuit-theme="1"]
        color $crepuscule
      &[data-circuit-theme="2"]
        color $bouleau
    &__header_wrapper
      f(row, $align: flex-start)
      margin-bottom 100px
      .UiSelector
        background $aube
        :deep(.UiSelector__container)
          color $aube
          .is-active
            color $aube !important
        &[data-circuit-theme="1"]
          background-color $crepuscule
          :deep(.UiSelector__container)
            color $crepuscule
            .is-active
              color $crepuscule !important
        &[data-circuit-theme="2"]
          background-color $bouleau
          :deep(.UiSelector__container)
            color $bouleau
            .is-active
              color $bouleau !important
    &__description
      f-style('small-body')
      color white
    &__actions
      f(column, $justify: flex-start)
      gap 60px
      width 43%
      .UiButton
        width fit-content
    &__view_container
      position relative
      height 2782px
      &[data-view="map"]
        background-color $embruns
        .maps
          position fixed !important
          left 0
          top 60vh
          height 40vh
          width 100vw
      .UiPicture
        width 1026px
        height 1212px
        z-index 1
        position absolute
        left 262px
        top 298px
        &[data-index="0"]
          top 811px
          width 1273px
          height 1367px
    &__step_content
      f(column, $justify: flex-start)
      height 100%
    &__step_content_header
      f(row, $justify: flex-start)
      margin-bottom 20px
    &__step_content_step_total
      f-style('subtitle')
      color $fjord
      margin-left 40px
    &__step_content_title
      f-style('h5')
      color $fjord
      margin-bottom 30px
    &__step_content_description
      f-style('default')
      color $fjord
      margin-bottom 60px
    &__step_content_itinerary_label
      f-style('small-body')
      color white
      opacity 1
      margin-bottom 15px
      &[data-index="0"]
        color $fjord
        opacity 0.5
        margin-bottom 20px
    &__step_content_itinerary
      .UiTag
        color $fjord
        border-color rgba($fjord, 0.5)
        &[data-index="0"]
          color $fjord
          border-color rgba($fjord, 0.5)
          .UiTag__label
            color $fjord !important
        &[data-index="1"]
          color white
          border-color rgba($light, .5)
    &__background    
      position absolute
      top 273px
      left 0
      z-index 2
      color $aube
      &[data-circuit-theme="1"]
        color $crepuscule
      &[data-circuit-theme="2"]
        color $bouleau
    &__step_see_more
      width 100%
      margin-top auto
    &__step_container_wrapper
      position absolute
      top 198px
      right 210px
      z-index 3
    &__step_container_steps_wrapper
      f(column, $justify: flex-start)
      gap 20px
      width 838px
      &[data-view="map"]
        position fixed
        left 100px
        top 1115px
        .circuits-etape__step_container_steps
          color $fjord
          border 1px solid rgba($fjord, 0.5)
          .UiButton
            background-color $embruns
            color $fjord
            border 1px solid rgba($fjord, 0.5)
          .circuits-etape__step_content_itinerary_label
            color $fjord
          .UiTag
            color $fjord !important
            border-color rgba($fjord, 0.5) !important

    &__step_container_steps
      color white
      padding 30px
      border solid 2px rgba($light, .5)
      border-radius 12px
    &__step_container_steps_content
      f(row, $justify: space-between, $align: flex-start)
      margin-bottom 60px
      .UiButton
        r(width, 128px)
        r(height, 120px)
        border 1px solid rgba($light, .5)
        :deep(.UiButton__icon)
          transform rotate(180deg)
      &[data-view="map"]
        color $fjord
      .circuits-etape__step_container_steps_content_button--next
        :deep(.UiButton__icon)
          transform rotate(0deg)
    &__step_container_steps_content_wrapper
      f(column, $justify: flex-start)
      gap 15px
    &__step_container_steps_content_wrapper_title
      f-style('subtitle')
      margin-right 15px
    &__step_container_steps_content_wrapper_label
      f-style('small-body')
    &__step_content_itinerary_label
      f-style('small-text')
      color white
    &__step_container
      f(column, $justify: flex-start)
      padding 30px
      background-color white
      width 880px
      min-height 1167px
      margin-bottom 226px
      .NavBar
        position absolute
        right -95px
        top 50px
</style>