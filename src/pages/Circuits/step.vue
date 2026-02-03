<template>
    <div class="circuits-etape" v-if="ready && current" :data-circuit-theme="dataCircuitTheme">
      <div class="circuits-etape__container">
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
        <div v-else-if="!showMenu">
          <div class="circuits-etape__last_step_container">
            <div class="circuits-etape__last_step_background" v-html="IconLine" :data-circuit-theme="circuitIndex"></div>
            <div class="circuits-etape__last_step_qr_container">
              <UiNavBar key="navbarend"  class="circuits-etape__last_step_navbar" :lastStep="true" :next="false" :previous="true"  @previous="setStep('previous')" :panel="false" @menu="setStep('previous', true)" />
              <div class="circuits-etape__last_step_content">
                <div class="circuits-etape__last_step_content_header">
                  {{ $t('circuits.qrcode_panel') }} 
                </div>
                <div class="circuits-etape__last_step_content_qr">
                  <img :src="current.base64_qr as string" alt="QR Code" class="circuits-etape__step_content_itinerary_img"/>
                </div>

            </div>
          </div>
          <div class="circuits-etape__last_step_recommendations">
              
              <div class="circuits-etape__last_step_recommendations_header" :style="{ opacity: feedbackReco ? 0 : 1 }">
                {{ $t('circuits.recommendations') }} 
              </div>
              <div class="circuits-etape__last_step_recommendations_content">
                <div class="circuits-etape__last_step_recommendations_content_text" :style="{ opacity: feedbackReco ? 0 : 1 }">
                  {{ $t('circuits.recommendations_text') }}
                </div>
                <div class="circuits-etape__last_step_recommendations_content_button_feedback" :style="{ opacity: feedbackReco ? 1 : 0 }">
                  {{ $t('circuits.recommendations_feedback') }}
                </div>
                <div class="circuits-etape__last_step_recommendations_content_button" :style="{ opacity: feedbackReco ? 0 : 1 }">
                  <ui-button theme="primary" :big="true" :icon="IconPouce" class="circuits-etape__last_step_recommendations_content_button_pouce" @click="sendFeedback('up')"/>
                  <ui-button theme="primary" :icon="IconPouce" class="circuits-etape__last_step_recommendations_content_button_pouce" :data-down="true" @click="sendFeedback('down')"/>
                </div>
              </div>
          </div>
          <div class="circuits-etape__last_step_event" v-if="nextEvent?.event">
            <div class="circuits-etape__last_step_event_header">
              {{  nextEvent.label }}
            </div>
            <div class="circuits-etape__last_step_event_content"
              :style="{ backgroundImage: `url(${nextEvent.event.main_image?.images?.original?.url})` }"
            >
            <div class="circuits-etape__last_step_event_content_container">
              <div class="circuits-etape__last_step_event_content_description" v-if="nextEvent.event.time_start || nextEvent.event.time_end">
                <div class="circuits-etape__last_step_event_content_description_time" v-if="nextEvent.event.time_start && !nextEvent.event.time_end">
                  {{ $t('events.time_start', { time: nextEvent.event.time_start }) }}
                </div>
                <div class="circuits-etape__last_step_event_content_description_time" v-else>
                  {{ $t('events.time_start_end', { start: nextEvent.event.time_start, end: nextEvent.event.time_end }) }}
                </div>
              </div>
              <div class="circuits-etape__last_step_event_content_title">
                {{ nextEvent.event.title }}
              </div>
              <UiButton 
                theme="primary"
                :big="true"
                :icon="IconPlus"
                :iconPosition="'right'"
                :label="$t('events.see_all')"
                class="circuits-etape__last_step_event_content_button"
                @click="router.push(`/evenements`)"
              />
            </div>
            </div>
          </div>  
          <div class="circuits-etape__last_step_event_other_born">
            <div class="circuits-etape__last_step_event_other_born_img">
              <img :src="imgBorn" alt="Borne" />
            </div>
            <div class="circuits-etape__last_step_event_other_born_text">
              <div class="circuits-etape__last_step_event_other_born_text_header">
                {{ $t('common.go_further') }}
              </div>
              <div class="circuits-etape__last_step_event_other_born_text_content">
                {{ $t('common.other_born') }}
              </div>
            </div>
          </div>
          <div class="circuits-etape__last_step_event_next_circuit" v-if="nextCircuit">
            <div class="circuits-etape__last_step_event_next_circuit_header">
              {{ $t('common.discover_more') }}
            </div>
            <div class="circuits-etape__last_step_event_next_circuit_content" :data-circuit-theme="nextCircuitIndex">
              <ui-picture :images="nextCircuit?.image?.images" cover="cover" />
              <div class="circuits-etape__last_step_event_next_circuit_content_text">
                <div class="circuits-etape__last_step_event_next_circuit_content_text_title">
                  {{ nextCircuit.title }}
                </div>
                <div class="circuits-etape__last_step_event_next_circuit_content_text_description">
                  <ui-wysiwyg v-html="nextCircuit.description" />
                  <div class="circuits-etape__last_step_event_next_circuit_content_text_action">
                    <ui-tag :label="$t('circuits.total_step', { number: nextCircuit.steps.length })" />
                    <ui-button theme="primary" :label="$t('common.link_discover')" :icon="IconPlus" :iconPosition="'right'"
                      @click="router.push(`/circuits/${nextCircuit.slug}`)"
                    />
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
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
          <UiNavBar key="navbar"  class="circuits-etape__navbar" :next="currentStepIndex < current.steps.length ? true : false" :previous="currentStepIndex > 0 ? true : false" @next="setStep('next')" @previous="setStep('previous')" @menu="showMenu = !showMenu"/>
          <div class="circuits-etape__step_content">
            <div class="circuits-etape__step_content_header">
              <ui-button theme="icon" :icon="currentStep.icon"/>
              <div class="circuits-etape__step_content_step_total">{{ $t('circuits.step_total', { number: currentStepIndex + 1, total: current.steps.length }) }} </div>
            </div>
           <h2 class="circuits-etape__step_content_title">{{ currentStep.title }}</h2>
            <div class="circuits-etape__step_content_description">
              <p>{{ currentStep.description }}</p>
            </div>
            <div class="circuits-etape__step_content_itinerary" v-if="currentStepIndex === 0 && current.commuting.length > 0">
              <div class="circuits-etape__step_content_itinerary_label" data-index="0">{{ $t('circuits.from_here') }}</div>
              <UiTag 
                v-for="commuting in current.commuting"
                :label="commuting.time + 'min'" 
                :icon="commuting.transportation === 'WALK' ? IconWalk : (commuting.transportation === 'DRIVE' ? IconCar : IconBike)" 
                data-index="0"
              />
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
                <UiTag 
                  :label="current.steps[currentStepIndex].next_step.time_to_next_step + ' min'" 
                  :icon="current.main_travel_mode === 'WALK' ? IconWalk : (current.main_travel_mode === 'DRIVE' ? IconCar : IconBike)" 
                  data-index="1" :data-view="currentView"
                />
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
                <UiTag :label="current.steps[currentStepIndex - 1].next_step.time_to_next_step + ' min'" 
                :icon="current.main_travel_mode === 'WALK' ? IconWalk : (current.main_travel_mode === 'DRIVE' ? IconCar : IconBike)" 
                  data-index="1" 
                  :data-view="currentView"
                />
            </div>
          </div>
        </div>
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
import { watchEffect, ref, computed, ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSidePanelStore } from 'store/sidePanel'
import { store as appStore } from 'plugins/store/app'
import { useI18nStore } from 'plugins/i18n/store'
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { getAuthHeaders } from 'utils/helpers'
import i18n from 'plugins/i18n'
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
import IconBike from 'assets/svg/bike.svg?raw'
import IconPouce from 'assets/svg/pouce.svg?raw'
import IconZoomIn from 'assets/svg/plus.svg?raw'
import IconZoomOut from 'assets/svg/moins.svg?raw'
import imgBorn from 'assets/img/borne.png'
import { UiButton } from '@/components/UiKit'
import MenuPage from './blocks/menu.vue'

const route = useRoute()
const router = useRouter()
const ready = ref(false)
const sidePanelStore = useSidePanelStore()
const currentView = ref<ViewCircuit>('map')
const feedbackReco = ref(false)
const mapRef = ref<any>(null)
const i18nStore = useI18nStore()
const showMenu = ref(false)

// Validation du slug et redirection si invalide
// a voir si pas on mounted plutôt
watchEffect(() => {
  // On attend que l'app soit prête (données chargées)
  if (!appStore.isAppReady || appStore.circuits.length === 0) return
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


const allPolylines = computed(() => {
    if (!current.value?.steps) return []
    return current.value.steps
        .map(step => step.next_step?.polyline)
        .filter(p => p !== null && p !== undefined) 
})

const currentNextParcours = computed(() => {
  return appStore.currentNextParcours
})
const currentStep = computed((): CircuitStep | undefined => {
  return appStore.currentStep as CircuitStep | undefined
})

const circuitIndex = computed(() => {
  return appStore.getCircuitIndex(current.value?.slug as string) ?? null
})

const nextCircuitIndex = computed(() => {
  return appStore.getCircuitIndex(appStore.nextCircuit?.slug as string) ?? null
})

const nextCircuit = computed(() => {
  return appStore.nextCircuit
})

const markers: any = computed(() => {
  const markers = []
  if (!current.value?.steps || current.value?.steps.length === 0) return undefined
  for (const step of current.value?.steps) {
    markers.push({
      position: { lat: step.map.latitude, lng: step.map.longitude },
      icon: step.icon
    })
  }
  return markers
})

const dataCircuitTheme = computed(() => {
  if (!current.value) return 1
  if (showMenu.value) return 'menu'
  return currentStepIndex.value > current.value?.steps.length - 1 ? 'last' : circuitIndex.value
})

const nextEvent: ComputedRef<{event: EventEntry | null, label: string} | null> = computed(() => {
  const today = Date.now() / 1000  

  let nextEvent = null
  let smallDiff = Infinity
  appStore.events.forEach(event => {
    const dateStart = event.datetime_start_timestamp
    const dateEnd = event.datetime_end_timestamp
    if (today >= dateStart && today <= dateEnd) {
      nextEvent = event
      smallDiff = 0
      return
    }
    const diff = Math.abs(dateStart - today)
    if (diff < smallDiff) {
      smallDiff = diff
      nextEvent = event
    }
  })
  if (smallDiff === 0) {
    return {event: nextEvent, label: i18n.global.t('circuits.event_today', { date: new Date().toLocaleDateString(`${i18nStore.locale}-CA`, { weekday: 'long', day: 'numeric', month: 'long' }) })}
  } else {
    return {event: nextEvent, label: new Date(nextEvent!.datetime_start_timestamp * 1000).toLocaleDateString(`${i18nStore.locale}-CA`, { weekday: 'long', day: 'numeric', month: 'long' })} 
  }
})

function onViewChange(value: ViewCircuit) {
    currentView.value = value
}

function setStep(direction: 'next' | 'previous', restart: boolean = false) {
  console.log('setStep', direction, restart)
  if (restart) {
    appStore.setCurrentStepIndex(0)
  } else {
    if (direction === 'next') {
      appStore.setCurrentStepIndex(currentStepIndex.value + 1)
    } else {
      appStore.setCurrentStepIndex(currentStepIndex.value - 1)
    }
  }
}

function zoomMap(direction: 'in' | 'out') {
  const map = document.querySelector('.maps')
  console.log(map)
  if (direction === 'in') {
    mapRef?.value.handleZoom(1)
  } else {
    mapRef?.value.handleZoom(-1)
  }
}

async function sendFeedback(direction: 'up' | 'down') {
  feedbackReco.value = !feedbackReco.value
  let method = 'POST'
  if (direction === 'down') {
    method = 'DELETE'
  }
  const apiUrl = import.meta.env.VITE_API_URL
  const apiSite = import.meta.env.VITE_API_SITE
  const locale = i18nStore.locale
  const url = `${apiUrl}/${locale}/${apiSite}/circuit/${current.value?.id}/vote`


  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY,
    ...getAuthHeaders()
  }
  let response = null
  if (window.__TAURI__) {
    response = await tauriFetch(url, {
      method,
      headers: headers
    })
  } else {
    response = await fetch(url, {
      method,
      headers: headers
    })
  }
  console.log('response', response)
  if (!response.ok) {
    console.error('Erreur lors de l\'envoi du feedback', response.statusText)
    return
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
    &__last_step_navbar
      position absolute
      right -95px
      top 50px
    &__last_step_background
      position absolute
      left 0
      top 35%
      bottom 25%
      color $aube
      &[data-circuit-theme="1"]
        color $crepuscule
      &[data-circuit-theme="2"]
        color $bouleau
    &__last_step_qr_container
      background white
      r(padding, 30px)
      r(width, 880px)
      r(padding, 30px)
      position absolute
      top 878px
      right 273px
    &__last_step_content_header
      f-style('h5')
      width 70%
      color $fjord
      margin-bottom 140px
    &__last_step_content_qr
      width 100%
      height 100%
      margin-bottom 80px
      f(row, $justify: center, $align: center)
      img
        r(size, 369px)
    &__last_step_recommendations
      background white
      f(column, $justify: flex-start)
      r(width, 791px)
      r(padding, 60px)
      position absolute
      top 1193px
      left 150px
    &__last_step_recommendations_header
      f-style('h5')
      color $fjord
      margin-bottom 30px
    &__last_step_recommendations_content_button_feedback
      f-style('h5')
      color $fjord
    &__last_step_recommendations_content_text
      f-style('default')
      color $fjord
      margin-bottom 80px
    &__last_step_event
      r(width, 850px)
      position absolute
      top 1941px
      left 150px
    &__last_step_event_header
      font-family $ff-title
      font-weight $fw-extrabold
      text-transform uppercase
      color $fjord
      margin-bottom 45px
      r(font-size, 90px 40px)
    &__last_step_recommendations_content_button
      f(row, $justify: flex-start)
      gap 20px
      .UiButton
        size 210px
        :deep(.UiButton__icon)
          size 89px
        &[data-down="true"]
          :deep(.UiButton__icon)
            transform rotate(-180deg)
    &__last_step_event_content
      background-size cover
      background-position center
      r(height, 650px)
      color $ecume
      f(column, $justify: flex-end)
      z-index 2
    &__last_step_event_content_container
      background-color rgba(0,0,0,0.7)
      r(padding, 30px)
      height 100%
      color $ecume
      f(column, $justify: flex-end)
    &__last_step_event_content_description_time
      font-size 32px
      line-height 1.2
      margin-bottom 18px
      ::first-letter
        text-transform uppercase
    &__last_step_event_content_title
      font-family $ff-text
      font-size 50px
      line-height 1.2
      font-weight $fw-bold
      margin-bottom 45px
    &__last_step_event_content_button
      width fit-content
    &__last_step_event_other_born
      position absolute
      top 2837px
      left 260px
      padding 60px
      r(width, 765px)
      background-color white
      border-radius $radius-lg
      f(row, $justify: flex-start, $align: flex-start)
      gap 60px
    &__last_step_event_other_born_img
      r(width, 154px)
      flex-shrink 0
    &__last_step_event_other_born_text
      margin auto
      f(column, $justify: flex-start, $align: flex-start)
      gap 15px
      color $fjord
    &__last_step_event_other_born_text_header
      opacity 0.5
      f-style('default')
    &__last_step_event_other_born_text_content
      f-style('h5')
    &__last_step_event_next_circuit
      position absolute
      top 1865px
      right 269px
      r(width, 790px)
      f(column, $justify: flex-start, $align: flex-start)
      gap 50px
    &__last_step_event_next_circuit_header
      f-style('h5')
      color $fjord
    &__last_step_event_next_circuit_content
      padding 10px
      padding-bottom 30px
      f(column, $justify: flex-start, $align: flex-start)
      gap 5px
      border-radius $radius-lgxl
      background-color $fjord
      color $aube
      &[data-circuit-theme="1"]
        background-color $penombre
        .circuits-etape__last_step_event_next_circuit_content_text_title,
        .circuits-etape__last_step_event_next_circuit_content_text_description
          color $crepuscule
      &[data-circuit-theme="2"]
        background-color $epinette
        .circuits-etape__last_step_event_next_circuit_content_text_title,
        .circuits-etape__last_step_event_next_circuit_content_text_description
          color $bouleau
      .UiPicture
        r(height, 800px)
        width 100%
    &__last_step_event_next_circuit_content_text
      padding 20px
      width 100%
    &__last_step_event_next_circuit_content_text_title
      f-style('h2')
      margin-bottom 30px
    &__last_step_event_next_circuit_content_text_description
      f-style('h6')
      f(column, $justify: flex-end)
      gap 20px
      margin-left auto
      color $aube
      text-align right
    &__last_step_event_next_circuit_content_text_action
      f(row, $justify: flex-end)
      gap 15px
      .UiButton
        width fit-content
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