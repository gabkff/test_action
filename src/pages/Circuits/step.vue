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
            <ui-button theme="primary" :big="true" :icon="IconQr" :iconPosition="'right'" :label="$t('circuits.scan')" @click="sidePanelStore.openCircuitStep({ title: current.title, step: currentStep, index: currentStepIndex + 1, qr: current.base64_qr})" />
            <div v-if="current.description" class="circuits-etape__description">
              <p>{{ current.description }}</p>
            </div>
          </div>
        </div>
        
      </div>
      <ui-button theme="primary" :label="'VOIR DETAIL'" @click="sidePanelStore.openCircuitStep({ title: current.title, step: currentStep, index: currentStepIndex + 1, qr: current.base64_qr})" />
      <div class="circuits-etape__view_container" v-if="currentStep &&currentStep.images">
        <ui-picture :images="currentStep.images[0]" :data-index="currentStepIndex" cover="cover"/>
        <div>{{currentStep.images}}</div>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
declare type ViewCircuit = 'list' | 'map'
import { onMounted, watchEffect, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSidePanelStore } from 'store/sidePanel'
import { store as appStore } from 'plugins/store/app'
import UiSelector from 'components/ui/Selector.vue'
import IconMap from 'assets/svg/pin.svg?raw'
import IconList from 'assets/svg/list.svg?raw'
import IconQr from 'assets/svg/qrcode.svg?raw'

const route = useRoute()
const router = useRouter()
const ready = ref(false)
const current = ref<CircuitEntry | null>(null)
const currentStepIndex = ref<number>(0)
const sidePanelStore = useSidePanelStore()
const currentStep = ref<CircuitStep | null>(null)
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
    currentStep.value = circuit.steps[currentStepIndex.value]
    ready.value = true
  }
})

function onViewChange(value: ViewCircuit) {
    console.log('View changed to:', value)
    currentView.value = value
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
      .UiPicture
        width 1026px
        height 1212px
        &[data-index="0"]
          width 1273px
          height 1367px
          
      

</style>