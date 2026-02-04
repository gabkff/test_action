<template>
    <div class="circuits-etape" v-if="ready && current" :data-circuit-theme="dataCircuitTheme">
      <div class="circuits-etape__container" :data-circuit-theme="circuitIndex">
        <h2 class="circuits-etape__name" :data-circuit-theme="dataCircuitTheme">{{ $t('circuits.name') }} {{ circuitIndex! + 1 }}</h2>
        <h1 class="circuits-etape__title" :data-circuit-theme="dataCircuitTheme">{{ current.title }}</h1>
        
        <div class="circuits-etape__header_wrapper" v-if="currentStepIndex < current.steps.length && !showMenu">
          <UiSelector
            v-model="currentView"
            :options="[
              { value: 'map', icon: IconMap, label: 'carte'},
              { value: 'list', label: 'liste', icon: IconList }
            ]"
            @change="(value) =>onViewChange(value as ViewCircuit)"
            :data-circuit-theme="dataCircuitTheme"
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
        <!-- Écran de fin de circuit -->
        <CircuitLastStep 
          v-else-if="!showMenu"
          :circuit="current"
          :circuitIndex="circuitIndex ?? null"
          :nextEvent="nextEvent"
          :nextCircuit="nextCircuit ?? null"
          :nextCircuitIndex="nextCircuitIndex ?? null"
          :feedbackSent="feedbackReco"
          @previous="setStep('previous')"
          @restart="setStep('previous', true)"
          @feedback="sendFeedback"
        />
        <div v-else>
          <ui-button theme="secondary" :icon="IconArrow" :big="true" class="circuits-etape__step_back" @click="showMenu = false"
            :iconPosition="'left'"
            :label="$t('common.backToCircuit')"
          />
        </div>
      </div>
      <div class="circuits-etape__view_container" v-if="currentStep && currentStep.images && !showMenu" :data-view="currentView">
        
        <ui-picture :images="currentStep.images[0]" :data-index="currentStepIndex" cover="cover" v-if="currentView === 'list'"/>
        <div class="circuits-etape__background" v-html="IconLine" :data-circuit-theme="dataCircuitTheme" v-if="currentView === 'list'"></div>
        <div class="circuits-etape__step_container_wrapper">
        <div class="circuits-etape__step_container">
          <UiNavBar key="navbar" class="circuits-etape__navbar" :next="currentStepIndex < current.steps.length" :previous="currentStepIndex > 0" @next="setStep('next')" @previous="setStep('previous')" @menu="showMenu = !showMenu"/>
          <CircuitStepContent
            :step="currentStep"
            :stepNumber="currentStepIndex + 1"
            :totalSteps="current.steps.length"
            :commuting="current.commuting"
            :showItinerary="currentStepIndex === 0"
            @more="sidePanelStore.openCircuitStep({ title: current.title, step: currentStep, index: currentStepIndex + 1, qr: current.base64_qr})"
          />
        </div>
        <CircuitStepNavigation
          :view="currentView"
          :hasNext="currentView === 'map' && currentNextParcours.length > 0"
          :hasPrevious="currentStepIndex > 0"
          :nextStepTitle="current.steps[currentStepIndex + 1]?.title"
          :nextStepTime="current.steps[currentStepIndex]?.next_step?.time_to_next_step"
          :previousStepTitle="current.steps[currentStepIndex - 1]?.title"
          :previousStepTime="current.steps[currentStepIndex - 1]?.next_step?.time_to_next_step"
          :travelMode="current.main_travel_mode"
          @next="setStep('next')"
          @previous="setStep('previous')"
        />
        <!--
        <UiMap 
          :zoom="15"
          v-if="currentStep.map"
          :markers="markers"
          :currentStepIndex="currentStepIndex"
          :allPolylines="allPolylines"
          ref="mapRef"
        />
        <div class="maps-zoom-control">
          <ui-button class="maps-zoom-control__button" theme="secondary" :icon="IconZoomIn" :big="true" @click="zoomMap('in')" />
          <ui-button class="maps-zoom-control__button" theme="secondary" :icon="IconZoomOut" :big="true" @click="zoomMap('out')" />
        </div>-->
      </div>
      <div class="circuits-etape__map_container" v-if="currentView === 'map'">
        <UiMap 
          :zoom="15"
          v-if="currentStep.map"
          :markers="markers"
          :currentStepIndex="currentStepIndex"
          :allPolylines="allPolylines"
          ref="mapRef"
        />
        <div class="maps-zoom-control">
          <ui-button class="maps-zoom-control__button" theme="secondary" :icon="IconZoomIn" :big="true" @click="zoomMap('in')" />
          <ui-button class="maps-zoom-control__button" theme="secondary" :icon="IconZoomOut" :big="true" @click="zoomMap('out')" />
        </div>
      </div>
      </div>
      <menu-page v-else-if="showMenu"/>
    </div>
  </template>
  
<script setup lang="ts">
declare type ViewCircuit = 'list' | 'map'
import { watchEffect, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSidePanelStore } from 'store/sidePanel'
import { store as appStore } from 'plugins/store/app'
import { useI18nStore } from 'plugins/i18n/store'
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { getAuthHeaders } from 'utils/helpers'
import { getApiSite } from 'plugins/api/apiSite'
import UiSelector from 'components/ui/Selector.vue'
import UiNavBar from 'components/NavBar/index.vue'
import UiMap from 'components/ui/Maps/index.vue'
import IconMap from 'assets/svg/pin.svg?raw'
import IconList from 'assets/svg/list.svg?raw'
import IconQr from 'assets/svg/qrcode.svg?raw'
import IconLine from 'assets/svg/line_background.svg?raw'
import IconArrow from 'assets/svg/arrow.svg?raw'
import IconZoomIn from 'assets/svg/plus.svg?raw'
import IconZoomOut from 'assets/svg/moins.svg?raw'
import { UiButton } from '@/components/UiKit'
import MenuPage from './blocks/menu.vue'
import CircuitLastStep from './blocks/CircuitLastStep.vue'
import CircuitStepContent from './blocks/CircuitStepContent.vue'
import CircuitStepNavigation from './blocks/CircuitStepNavigation.vue'
import { useCircuit, useNextEvent } from 'plugins/utils'

const route = useRoute()
const router = useRouter()
const ready = ref(false)
const sidePanelStore = useSidePanelStore()
const currentView = ref<ViewCircuit>('map')
const feedbackReco = ref(false)

/** Interface pour les méthodes exposées par le composant UiMap */
interface UiMapExposed {
  handleZoom: (delta: number) => void
}
const mapRef = ref<UiMapExposed | null>(null)
const i18nStore = useI18nStore()
const showMenu = ref(false)

// Composables pour la gestion du circuit et des événements
const {
  current,
  currentStep,
  currentStepIndex,
  circuitIndex,
  nextCircuit,
  nextCircuitIndex,
  allPolylines,
  currentNextParcours,
  markers,
  navigate
} = useCircuit()

const nextEventData = useNextEvent()

// Raccourci pour le template (garde la même API)
const nextEvent = computed(() => {
  if (!nextEventData.value) return null
  return {
    event: nextEventData.value.event,
    label: nextEventData.value.label
  }
})

// Validation de l'id et redirection si invalide
watchEffect(() => {
  if (!appStore.isAppReady || appStore.circuits.length === 0) return
  const id = Number(route.params.id)
  if (Number.isNaN(id)) {
    appStore.setCircuitById(-1, true)
    return
  }
  appStore.setCircuitById(id, true)
  ready.value = true
})

// Thème visuel du circuit (selon l'état courant)
const dataCircuitTheme = computed(() => {
  if (!current.value) return 1
  if (showMenu.value) return 'menu'
  return currentStepIndex.value > current.value?.steps.length - 1 ? 'last' : circuitIndex.value
})

/**
 * Change la vue entre carte et liste
 */
function onViewChange(value: ViewCircuit) {
  currentView.value = value
}

/**
 * Navigation entre les étapes du circuit
 */
function setStep(direction: 'next' | 'previous', restart: boolean = false) {
  navigate(direction, restart)
}

/**
 * Zoom sur la carte
 */
function zoomMap(direction: 'in' | 'out') {
  if (direction === 'in') {
    mapRef?.value?.handleZoom(1)
  } else {
    mapRef?.value?.handleZoom(-1)
  }
}

/**
 * Envoie un feedback (like/dislike) pour le circuit
 */
async function sendFeedback(direction: 'up' | 'down') {
  feedbackReco.value = !feedbackReco.value
  const method = direction === 'down' ? 'DELETE' : 'POST'
  const apiUrl = import.meta.env.VITE_API_URL
  const apiSite = getApiSite()
  const locale = i18nStore.locale
  const url = `${apiUrl}/${locale}/${apiSite}/circuit/${current.value?.id}/vote`

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY,
    ...getAuthHeaders()
  }

  try {
    const response = window.__TAURI__
      ? await tauriFetch(url, { method, headers })
      : await fetch(url, { method, headers })

    if (!response.ok) {
      console.error('Erreur lors de l\'envoi du feedback', response.statusText)
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du feedback', error)
  }
}

</script>
  
<style lang="stylus" scoped>
  .circuits-etape
    background-color $fjord
    height 100vh
    transition all 0.3s ease
    f(column, $justify: flex-start, $align: stretch)
    &[data-circuit-theme="menu"]
      background-color $embruns
      .circuits-etape__container
        r(margin-left, 230px)
        r(margin-right, 230px)
        r(margin-top, 267px)
        background-color $fjord
        width auto
        padding 60px
        border-radius $radius-lgxl
        &[data-circuit-theme="1"]
          background-color $penombre
          .circuits-etape__name
            color $crepuscule
          .circuits-etape__title
            color $crepuscule
          :deep(.UiButton)
            background-color $crepuscule
            color $penombre
        &[data-circuit-theme="2"]
          background-color $epinette
          .circuits-etape__name,
          .circuits-etape__title
            color $bouleau
          :deep(.UiButton)
            background-color $bouleau
            color $epinette
    &[data-circuit-theme="1"]
      background-color $penombre
      &__title
        color $crepuscule
    &[data-circuit-theme="2"]
      background-color $epinette
      &__title
        color $bouleau
    &[data-circuit-theme="last"]
      background-color $embruns
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
      &[data-circuit-theme="last"]
        color $fjord
    &__title
      f-style('h1')
      color $aube
      margin-bottom 90px
      trans(color, 0.3s ease)
      &[data-circuit-theme="1"]
        color $crepuscule
      &[data-circuit-theme="2"]
        color $bouleau
      &[data-circuit-theme="last"]
        color $fjord
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
      flex-grow 1
      height 100%
      &[data-view="map"]
        background-color $embruns
        .maps
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
    &__step_content_itinerary
      .UiTag
        &:not(:last-child)
          margin-right 15px
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
      top 420px
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
        position absolute
        left -110%
        top 0
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
            &:not(:last-child)
              margin-right 15px

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
    &__step_back
      border 1px solid $remous-light !important
      border-radius $radius-lg
      f-style('btn-medium')
      :deep(.UiButton__icon)
        transform rotate(-180deg)
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
    &__map_container
      position absolute
      transform-origin bottom
      bottom 0
      left 0
      height 45%
      width 100%
.maps-zoom-control
    position absolute
    bottom 40px
    right 40px
    z-index 1000
    display flex
    flex-direction column
    gap 10px
  .maps-zoom-control__button
    r(width, 128px)
    r(height, 120px)
    background-color transparent !important
    color $fjord
    border 1px solid rgba($fjord, 0.5)
    svg
        width 100%
        height 100%
</style>