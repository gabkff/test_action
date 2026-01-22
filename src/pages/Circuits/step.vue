<template>
    <div class="circuits-etape" v-if="ready && current">
      <div class="circuits-etape__container">
        <h2 class="circuits-etape__name">{{ $t('circuits.name') }} 1</h2>
        <h1 class="circuits-etape__title">{{ current.title }}</h1>
      
        <div class="circuits-etape__header_wrapper">
          <UiSelector
            v-model="currentView"
            :options="[
              { value: 'map', icon: IconMap, label: 'carte'},
              { value: 'list', label: 'liste', icon: IconList }
            ]"
            @change="(value) =>onViewChange(value as ViewCircuit)"
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
      <div class="circuits-etape__view_container" v-if="currentStep &&currentStep.images">
        <ui-picture :images="currentStep.images[0]" :data-index="currentStepIndex" cover="cover"/>
        <div class="circuits-etape__background" v-html="IconLine"></div>
        <div class="circuits-etape__step_container_wrapper">
        <div class="circuits-etape__step_container">
          <UiNavBar key="navbar"  class="circuits-etape__navbar" :next="currentStepIndex < current.steps.length - 1 ? true : false" :previous="currentStepIndex > 0 ? true : false" @next="setStep('next')" @previous="setStep('previous')"/>
          <div class="circuits-etape__step_content">
            <div class="circuits-etape__step_content_header">
              <ui-button theme="icon" :icon="IconMap" v-if="currentStep.activity_type as any === 'Promenade'"/>
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
        <div class="circuits-etape__step_container_steps" v-if="currentStepIndex > 0">
          <div class="circuits-etape__step_container_steps_content">
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
              @click="setStep('previous')"
            />
          </div>
          <div class="circuits-etape__step_content_itinerary">
              <div class="circuits-etape__step_content_itinerary_label">{{ $t('circuits.itinerary_time') }}</div>
              <UiTag :label="currentStep.next_step.time + 'min'" :icon="currentStep.next_step.transportation.includes('pieds') ? IconWalk : IconCar" data-index="1"/>
            </div>
        </div>
      </div>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
declare type ViewCircuit = 'list' | 'map'
import { onMounted, watchEffect, ref, computed, ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSidePanelStore } from 'store/sidePanel'
import { store as appStore } from 'plugins/store/app'
import UiSelector from 'components/ui/Selector.vue'
import UiNavBar from 'components/NavBar/index.vue'
import UiTag from 'components/UiKit/Tag/index.vue'
import IconMap from 'assets/svg/pin.svg?raw'
import IconList from 'assets/svg/list.svg?raw'
import IconQr from 'assets/svg/qrcode.svg?raw'
import IconLine from 'assets/svg/line.svg?raw'
import IconWalk from 'assets/svg/walk.svg?raw'
import IconCar from 'assets/svg/car.svg?raw'
import IconPlus from 'assets/svg/plus.svg?raw'
import IconArrow from 'assets/svg/arrow.svg?raw'
import { UiButton } from '@/components/UiKit'

const route = useRoute()
const router = useRouter()
const ready = ref(false)
const current = ref<CircuitEntry | null>(null)
const currentStepIndex = ref<number>(0)
const sidePanelStore = useSidePanelStore()
const currentView = ref<ViewCircuit>('list')

// Validation du slug et redirection si invalide
watchEffect(() => {
  // On attend que l'app soit prête (données chargées)
  if (!appStore.isAppReady || !appStore.circuits) return
  const slug = route.params.slug as string
  const circuit = appStore.getCircuitBySlug(slug)
  
  if (!circuit) {
    console.warn(`⚠️ Circuit introuvable pour le slug: ${slug} -> Redirection Home`)
    router.replace({ name: 'home' })
  } else {
    console.log(`✅ Circuit trouvé:`, circuit.title)
    current.value = circuit
    currentStepIndex.value = 0
    ready.value = true
  }
})

const currentStep: ComputedRef<CircuitStep | undefined> = computed(() => {
  return current.value?.steps[currentStepIndex.value]
})

const circuitIndex = computed(() => {
  return appStore.getCircuitIndex(current.value?.slug as string) ?? null
})

function onViewChange(value: ViewCircuit) {
    console.log('View changed to:', value)
    currentView.value = value
}

function setStep(direction: 'next' | 'previous') {
  if (direction === 'next') {
    currentStepIndex.value++
  } else {
    currentStepIndex.value--
  }
}

</script>
  
<style lang="stylus" scoped>
  .circuits-etape
    background-color $fjord
    min-height 100vh
    height 100%
    &__container
      container()
      margin-top 100px
      margin-bottom 100px
    &__name
      f-style('h5')
      color $aube
    &__title
      f-style('h1')
      color $aube
      margin-bottom 90px
    &__header_wrapper
      f(row, $align: flex-start)
      margin-bottom 100px
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
    &__step_see_more
      width 100%
      margin-top auto
    &__step_container_wrapper
      position absolute
      top 198px
      right 210px
      z-index 3
    &__step_container_steps
      width 838px
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
    &__step_container_steps_content_wrapper
      f(column, $justify: flex-start)
      gap 15px
    &__step_container_steps_content_wrapper_title
      f-style('subtitle')
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